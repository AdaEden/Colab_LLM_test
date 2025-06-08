'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Crown, Search, Loader2 } from 'lucide-react'
import type { Message, ChatResponse, KeywordAnalysis } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const data: ChatResponse = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeywordAnalysis = async () => {
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .pop()

    if (!lastAssistantMessage) {
      alert('没有找到AI回复的消息')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: lastAssistantMessage.content
        }),
      })

      if (!response.ok) {
        throw new Error('关键词分析失败')
      }

      const data: KeywordAnalysis = await response.json()
      setKeywordAnalysis(data)
    } catch (error) {
      console.error('关键词分析失败:', error)
      alert('关键词分析失败，请稍后再试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="container mx-auto max-w-6xl h-screen flex flex-col p-4">
      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-persian-gold mb-2 flex items-center justify-center gap-2">
          <Crown className="w-8 h-8" />
          一千零一夜的国王
        </h1>
        <p className="text-white/80 text-lg">与《一千零一夜》中的萨珊王对话</p>
      </div>

      <div className="flex-1 flex gap-4">
        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 消息显示区域 */}
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-4 overflow-y-auto scrollbar-hide mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 mt-8">
                <Crown className="w-16 h-16 mx-auto mb-4 text-persian-gold" />
                <p className="text-lg">欢迎来到萨珊王的宫殿</p>
                <p className="text-sm mt-2">开始你的故事吧...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-persian-gold text-night-blue'
                          : 'bg-white/20 text-white border border-persian-gold'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 text-white border border-persian-gold rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>国王正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="讲述你的故事..."
                className="flex-1 bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-persian-gold"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-persian-gold text-night-blue px-4 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 关键词分析模块 */}
        <div className="w-80 bg-white/10 backdrop-blur-md rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-persian-gold" />
            <h2 className="text-lg font-semibold text-white">关键词分析</h2>
          </div>
          
          <button
            onClick={handleKeywordAnalysis}
            disabled={isAnalyzing || messages.filter(m => m.role === 'assistant').length === 0}
            className="w-full bg-royal-purple text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                分析最后回复
              </>
            )}
          </button>

          {keywordAnalysis && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-persian-gold mb-2">关键词:</h3>
                <div className="flex flex-wrap gap-1">
                  {keywordAnalysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-persian-gold/20 text-persian-gold px-2 py-1 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-persian-gold mb-2">分析结果:</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {keywordAnalysis.analysis}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-persian-gold mb-1">置信度:</h3>
                <div className="bg-white/20 rounded-full h-2">
                  <div
                    className="bg-persian-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${keywordAnalysis.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 text-right mt-1">
                  {keywordAnalysis.confidence}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 