import { NextRequest, NextResponse } from 'next/server'
import type { Card } from '@/types'

// 各类别的生成提示
const CATEGORY_PROMPTS = {
  '植物': '越有生命力、神秘或稀有的植物，power越高。注重植物的魔法属性、生长环境的危险性和药用价值。',
  '食物': '越珍贵、神奇或难以获得的食物，power越高。考虑食物的营养价值、魔法效果和制作难度。',
  '武器': '越锋利、致命或具有魔法力量的武器，power越高。注重武器的材质、锻造工艺和传说背景。',
  '宝物': '越稀有、贵重或具有神秘力量的宝物，power越高。考虑宝物的历史、魔法属性和收集难度。',
  '动物': '越强大、神秘或稀有的动物，power越高。注重动物的战斗能力、魔法天赋和传说地位。',
  '地点': '越神秘、危险或具有特殊意义的地点，power越高。考虑地点的历史、隐藏的秘密和探索价值。',
  '人物': '越有影响力、技能高超或地位崇高的人物，power越高。注重人物的能力、背景和在故事中的重要性。',
  '服饰': '越精美、稀有或具有魔法属性的服饰，power越高。考虑服饰的材质、工艺和附加能力。'
}

export async function POST(request: NextRequest) {
  try {
    const { playerInput, kingOutput, clickedElement, category } = await request.json()
    
    if (!clickedElement || !category) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 获取GLM API密钥
    const apiKey = process.env.GLM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      )
    }

    const categoryPrompt = CATEGORY_PROMPTS[category as keyof typeof CATEGORY_PROMPTS] || '根据元素特性评估其power值。'

    // 构建卡牌生成系统提示词
    const systemPrompt = `
你是《一千零一夜》世界的卡牌设计师，专门将故事中的元素转化为具有神秘力量的卡牌。

你的任务是根据故事上下文，为指定元素生成一张详细的卡牌，包含：
1. 元素名称（可以是原名或更具诗意的变体）
2. Power值（0-10的整数）
3. 富有诗意和神秘色彩的描述（30字以内）

Power评估标准：
${categoryPrompt}

请严格按照以下JSON格式回复，不要包含任何其他内容：
{
  "name": "元素名称",
  "power": 数字(0-10),
  "description": "富有诗意的描述"
}

注意：
- 名称要符合《一千零一夜》的风格，可以适当润色但不能完全改变原意
- 描述要体现元素在当前故事情境中的特殊之处
- Power值要根据故事背景合理评估
`

    // 构建消息
    const contextMessage = `
故事背景：
玩家说："${playerInput || '（无）'}"
国王续写："${kingOutput || '（无）'}"

现在需要为"${clickedElement}"（${category}类别）生成卡牌。
`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextMessage }
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
        messages,
        temperature: 0.7,
        max_tokens: 300
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
    const cardResponse = data.choices[0].message.content.trim()

    try {
      // 尝试解析JSON响应
      const cardJson = JSON.parse(cardResponse)
      
      const card: Card = {
        id: Date.now().toString(),
        name: cardJson.name || clickedElement,
        power: Math.min(10, Math.max(0, parseInt(cardJson.power) || 1)),
        description: cardJson.description || '神秘的元素，蕴含着未知的力量。',
        category
      }

      return NextResponse.json({ card })

    } catch (jsonError) {
      console.error('JSON Parse Error:', jsonError)
      
      // 如果JSON解析失败，生成默认卡牌
      const fallbackCard: Card = {
        id: Date.now().toString(),
        name: clickedElement,
        power: Math.floor(Math.random() * 6) + 1, // 1-6随机值
        description: `来自${category}的神秘力量，在故事中闪闪发光。`,
        category
      }

      return NextResponse.json({ card: fallbackCard })
    }

  } catch (error) {
    console.error('Card Generation API Error:', error)
    return NextResponse.json(
      { error: '卡牌生成失败' },
      { status: 500 }
    )
  }
} 