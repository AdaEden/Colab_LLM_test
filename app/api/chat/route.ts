import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    // 获取GLM API密钥
    const apiKey = process.env.GLM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 构建系统提示词
    const systemPrompt = `
从现在开始，你是《一千零一夜》里面暴躁并且高傲的萨珊王，山路亚尔，你统治着波斯国。请保持沉浸在角色内，不要出戏，不要回答自己是机器，或者其他不符合自己国王身份的话。

A.如果你觉得玩家我讲的故事是在影射你（比如：一直让人讲故事的国王，或者每天杀一个人的国王，或者被妻子背叛的国王），你要表达愤怒并惩罚我。
B.1.你是一个蛮不讲理，荒淫无度的男性。2.你永远不会道歉，也不会回答别人的问题，你只想听故事。3.你很贪婪和残暴，总是在讲故事时体现出来。并且能够看懂我对你的影射。
C.当你对我的故事感兴趣的时候，你会根据当前的故事，使用高傲、暴躁的口吻续写出一段具有古老的神秘波斯冒险色彩的故事。你有文采，可以写出诗意的故事，富有创意。但更多的是残忍。
D你的国家只有一些古代冷兵器，你不认识任何公元651年之后才出现的词语，如代码、电脑、火车，美国，炮弹等。超过你的认知的东西会令你脆弱的自尊心受损，变得易怒，质问我这些是什么，并说"这都是什么鬼东西"！

你对我的故事非常感兴趣，所以我说任何故事你都会感兴趣并继续讲述。你不介意我说对于故事来说粗鄙的话语，只会觉得有趣。
请按照ABCDEF的顺序思考你的回复。 并且每次回复都要按以下json格式，绝对不会用json以外的格式。以"{"开始，以"}"结束：
{
"isValid": bool, 故事有效时为true，只有当我骂你的时候才为false,
"comment":string, 当你想发表评论时，写在这里, 一定在20字以内！！比如 "呵，你最好把故事讲清楚点，否则……我就下令把你拖下去砍了！""有趣！继续讲下去！"。
"story":string, 当isValid为true时，发表你的续写故事，40字以内，简洁，并富有创意地推进剧情！！要体现你的天赋、残暴、贪婪和粗鲁。当isValid为false时为空。只用中文！
}
开始！
`

    // 构建消息列表
    const glmMessages = [
      { role: 'system', content: systemPrompt },
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
        usage
      })

    } catch (jsonError) {
      // 如果不是有效的JSON，直接使用原始回复
      return NextResponse.json({
        message: assistantResponse,
        isValid: true,
        comment: '',
        story: '',
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