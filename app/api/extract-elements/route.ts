import { NextRequest, NextResponse } from 'next/server'
import { CATEGORY_DESCRIPTIONS } from '@/config/game-prompts'

// Few-shot示例定义
const ELEMENT_EXTRACTION_FEW_SHOT = [
  {
    user: "用户故事：我走进了一片神秘的花园，里面种满了各种奇花异草。\n国王故事：沙漠中有一朵红色的荆棘之花，旁边放着一把锋利的宝剑。\n指定类别：植物\n请标记并返回：",
    assistant: "沙漠中有一朵红色的{{荆棘之花}}，旁边放着一把锋利的宝剑。"
  }
]

// 动态生成元素类别定义
function generateCategoryDefinitions(): string {
  return Object.entries(CATEGORY_DESCRIPTIONS)
    .map(([category, description]) => `- ${category}：${description}`)
    .join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, assistantStory, categories } = await request.json()
    
    if (!assistantStory) {
      return NextResponse.json(
        { error: '国王故事内容不能为空' },
        { status: 400 }
      )
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: '请至少选择一个元素类别' },
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

    // 构建系统提示词（使用动态生成的类别定义）
    const systemPrompt = `
你是一个专业的文本分析师，专门从《一千零一夜》风格的文本中提取指定类别的元素。

元素类别定义：
${generateCategoryDefinitions()}

你的任务是：
1. 参考用户故事的上下文，理解故事背景和元素含义
2. 从国王的故事中识别并提取用户指定类别的所有元素
3. 用双花括号{{}}标记这些元素
4. 只返回标记后的国王故事文本，不要包含任何其他内容、解释或说明。若不包含指定元素，则返回未加标注的原文。
`

    // 构建完整的消息列表：system + few-shot + 用户请求
    const messages = [
      { role: 'system', content: systemPrompt }
    ]

    // 添加few-shot示例
    ELEMENT_EXTRACTION_FEW_SHOT.forEach(example => {
      messages.push({ role: 'user', content: example.user })
      messages.push({ role: 'assistant', content: example.assistant })
    })

    // 添加用户的实际请求
    const categoriesText = categories.join('、')
    const contextText = userMessage ? `用户故事：${userMessage}\n\n` : ''
    const userRequest = `${contextText}国王故事：${assistantStory}\n\n指定类别：${categoriesText}\n\n请标记并返回：`
    
    messages.push({ role: 'user', content: userRequest })

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
        temperature: 0.1,
        max_tokens: 600
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
    let markedText = data.choices[0].message.content.trim()

    // 如果AI没有按要求返回，使用简单的正则匹配作为后备
    if (!markedText.includes('{{') && !markedText.includes('}}')) {
      console.log('AI未返回标记文本，使用后备方案')
      markedText = assistantStory

      // 基于类别的简单匹配规则
      const categoryPatterns: { [key: string]: string[] } = {
        '植物': ['花', '树', '草', '叶', '果', '荆棘', '玫瑰', '莲花', '牡丹', '菊花', '松树', '柳树', '橡树'],
        '食物': ['面包', '酒', '茶', '水', '肉', '鱼', '果汁', '米饭', '馒头'],
        '武器': ['剑', '刀', '弓', '箭', '盾', '矛', '斧', '匕首', '宝剑', '利剑', '长剑'],
        '宝物': ['黄金', '白银', '珠宝', '宝石', '钻石', '宝物', '珍宝', '金币'],
        '动物': ['马', '鸟', '龙', '凤凰', '老虎', '狮子', '鹰', '骏马', '战马'],
        '地点': ['宫殿', '城堡', '花园', '沙漠', '森林', '山脉', '城市', '房间'],
        '人物': ['国王', '王子', '公主', '商人', '士兵', '法师', '盗贼'],
        '服饰': ['长袍', '头冠', '王冠', '项链', '手镯', '袈裟', '斗篷']
      }

      categories.forEach(category => {
        const keywords = categoryPatterns[category] || []
        keywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'g')
          markedText = markedText.replace(regex, `{{${keyword}}}`)
        })
      })
    }

    return NextResponse.json({
      markedText
    })

  } catch (error) {
    console.error('Element Extraction API Error:', error)
    return NextResponse.json(
      { error: '元素提取失败' },
      { status: 500 }
    )
  }
} 