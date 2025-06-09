import { NextRequest, NextResponse } from 'next/server'
import { getStageConfig } from '@/config/game-prompts'
import type { GameStage } from '@/types'

// JSON清理和修复函数
function cleanAndParseJSON(jsonString: string) {
  try {
    // 首先尝试直接解析
    return JSON.parse(jsonString)
  } catch (firstError) {
    console.log('初次JSON解析失败，尝试清理:', firstError)
    console.log('原始响应:', jsonString)
    
    // 声明清理后的字符串变量
    let cleaned = jsonString.trim()
    
    try {
      // 查找JSON对象的开始和结束
      const startIndex = cleaned.indexOf('{')
      const lastIndex = cleaned.lastIndexOf('}')
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, lastIndex + 1)
      }
      
      // 尝试解析清理后的JSON
      const parsed = JSON.parse(cleaned)
      console.log('JSON清理后解析成功:', parsed)
      return parsed
      
    } catch (secondError) {
      console.log('JSON清理后仍然解析失败:', secondError)
      console.log('清理后的字符串:', cleaned)
      
      // 最后的回退：使用正则表达式提取字段
      const fallbackResult = extractFieldsWithRegex(jsonString)
      if (fallbackResult) {
        console.log('正则表达式提取成功:', fallbackResult)
        return fallbackResult
      }
      
      throw secondError
    }
  }
}

// 使用正则表达式提取JSON字段的回退方案
function extractFieldsWithRegex(text: string) {
  try {
    const isValidMatch = text.match(/"?isValid"?\s*:\s*(true|false|True|False)/i)
    const commentMatch = text.match(/"?comment"?\s*:\s*"([^"]*)"/)
    const storyMatch = text.match(/"?story"?\s*:\s*"([^"]*)"/)
    
    if (isValidMatch || commentMatch || storyMatch) {
      return {
        isValid: isValidMatch ? isValidMatch[1].toLowerCase() === 'true' : true,
        comment: commentMatch ? commentMatch[1] : '',
        story: storyMatch ? storyMatch[1] : ''
      }
    }
    
    return null
  } catch (error) {
    console.log('正则表达式提取失败:', error)
    return null
  }
}

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

    console.log('GLM原始响应:', assistantResponse)

    // 尝试解析JSON响应（使用改进的解析函数）
    try {
      const responseJson = cleanAndParseJSON(assistantResponse)
      const isValid = responseJson.isValid ?? true
      const comment = responseJson.comment ?? ''
      const story = responseJson.story ?? ''

      console.log('解析后的字段:', { isValid, comment, story })

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
        finalMessage = comment || story || assistantResponse
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
      console.error('JSON解析完全失败:', jsonError)
      console.error('无法解析的响应:', assistantResponse)
      
      // 如果不是有效的JSON，直接使用原始回复
      return NextResponse.json({
        message: assistantResponse,
        isValid: true,
        comment: '',
        story: assistantResponse, // 将原始响应放到story字段，这样前端可能会更好处理
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