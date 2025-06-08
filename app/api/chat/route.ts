import { NextRequest, NextResponse } from 'next/server'
import { getStageConfig } from '@/config/game-prompts'
import type { GameStage } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { messages, gameStage = 'K1', selectedCategories = [] } = await request.json()
    
    // 获取GLM API密钥
    const apiKey = process.env.GLM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 获取当前阶段的配置
    const stageConfig = getStageConfig(gameStage as GameStage, selectedCategories)
    
    // 构建消息列表，包含few-shot示例
    const glmMessages = [
      { role: 'system', content: stageConfig.prompt },
      // 添加few-shot示例（如果用户已配置）
      ...stageConfig.fewShot.flatMap(example => {
        // 跳过未填写的示例
        if (example.user.startsWith('//') || example.assistant.startsWith('//')) {
          return []
        }
        return [
          { role: 'user', content: example.user },
          { role: 'assistant', content: example.assistant }
        ]
      }),
      // 添加实际对话消息
      ...messages
    ]

    // 调用GLM API
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-0520',
        messages: glmMessages,
        temperature: 0.95,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('GLM API Error:', errorData)
      return NextResponse.json(
        { error: 'GLM API调用失败' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantResponse = data.choices[0].message.content
    const usage = data.usage

    // 尝试解析JSON响应
    try {
      const responseJson = JSON.parse(assistantResponse)
      const isValid = responseJson.isValid ?? true
      const comment = responseJson.comment ?? ''
      const story = responseJson.story ?? ''

      // 构建最终回复
      let finalMessage = ''
      if (comment) {
        finalMessage += comment
      }
      if (story) {
        if (finalMessage) {
          finalMessage += '\n\n'
        }
        finalMessage += story
      }

      if (!finalMessage) {
        finalMessage = assistantResponse
      }

      return NextResponse.json({
        message: finalMessage,
        isValid,
        comment,
        story,
        gameStage,
        usage
      })

    } catch (jsonError) {
      // 如果不是有效的JSON，直接使用原始回复
      return NextResponse.json({
        message: assistantResponse,
        isValid: true,
        comment: '',
        story: '',
        gameStage,
        usage
      })
    }

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
} 