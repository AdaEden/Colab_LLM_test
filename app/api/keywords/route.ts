import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
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

    // 构建关键词分析的系统提示词
    const systemPrompt = `
你是一个专业的文本分析专家，专门分析《一千零一夜》中萨珊王（山路亚尔）的对话内容。

你的任务是：
1. 提取文本中的关键词，特别关注：
   - 武器类词汇（刀、剑、盾、魔杖、矛、匕首、斧子等）
   - 情绪词汇（愤怒、残忍、贪婪、高傲等）
   - 行动词汇（砍头、惩罚、拖拽、杀死等）
   - 物品词汇（宝石、黄金、财宝等）
   - 地点词汇（宫殿、王座、监狱等）

2. 分析国王的情绪状态和行为倾向

3. 评估文本的危险程度和暴力倾向

请按照以下JSON格式回复，不要包含任何其他内容：
{
    "keywords": ["关键词1", "关键词2", "关键词3"],
    "analysis": "详细的分析结果，说明国王的情绪状态、行为倾向和对话含义",
    "confidence": 置信度数字(0-100)
}
`

    // 构建消息
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请分析以下文本：\n${message}` }
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
        temperature: 0.3, // 降低温度以获得更一致的分析结果
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
    const analysisResponse = data.choices[0].message.content

    try {
      // 尝试解析JSON响应
      const analysisJson = JSON.parse(analysisResponse)
      
      // 验证响应格式
      let keywords = analysisJson.keywords || []
      let analysis = analysisJson.analysis || ''
      let confidence = analysisJson.confidence || 50

      // 确保数据类型正确
      if (!Array.isArray(keywords)) {
        keywords = []
      }
      if (typeof analysis !== 'string') {
        analysis = String(analysis)
      }
      if (typeof confidence !== 'number') {
        confidence = 50
      }

      // 限制关键词数量
      keywords = keywords.slice(0, 10)

      return NextResponse.json({
        keywords,
        analysis,
        confidence: Math.min(100, Math.max(0, Math.round(confidence)))
      })

    } catch (jsonError) {
      // 如果JSON解析失败，返回基础分析
      const weaponKeywords = ['刀', '剑', '盾', '魔杖', '矛', '匕首', '斧子', '武器']
      const emotionKeywords = ['愤怒', '残忍', '贪婪', '高傲', '暴躁', '怒火']
      const actionKeywords = ['砍头', '惩罚', '拖拽', '杀死', '处死', '斩首']
      
      const foundKeywords: string[] = []
      const allKeywords = [...weaponKeywords, ...emotionKeywords, ...actionKeywords]
      
      for (const keyword of allKeywords) {
        if (message.includes(keyword)) {
          foundKeywords.push(keyword)
        }
      }

      return NextResponse.json({
        keywords: foundKeywords.slice(0, 8),
        analysis: '检测到国王的对话包含典型的权威和威严表达，体现了《一千零一夜》中萨珊王的性格特征。',
        confidence: 70
      })
    }

  } catch (error) {
    console.error('Keywords API Error:', error)
    return NextResponse.json(
      { error: '关键词分析失败' },
      { status: 500 }
    )
  }
} 