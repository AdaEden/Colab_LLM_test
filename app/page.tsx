'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Crown, Sparkles, Loader2, Check, Settings } from 'lucide-react'
import type { Message, ChatResponse, ElementExtractionResponse } from '@/types'
import HighlightText from '@/components/HighlightText'

// 预定义的元素类别
const ELEMENT_CATEGORIES = [
  { id: 'plants', name: '植物', description: '花朵、树木、草药、果实等', icon: '🌸' },
  { id: 'food', name: '食物', description: '食品、饮料、调料等', icon: '🍎' },
  { id: 'weapons', name: '武器', description: '刀剑、弓箭、盾牌等', icon: '⚔️' },
  { id: 'treasures', name: '宝物', description: '珠宝、黄金、宝石等', icon: '💎' },
  { id: 'animals', name: '动物', description: '各种生物、神话生物等', icon: '🦅' },
  { id: 'places', name: '地点', description: '城市、建筑、地形等', icon: '🏰' },
  { id: 'people', name: '人物', description: '角色名称、职业身份等', icon: '👑' },
  { id: 'clothing', name: '服饰', description: '衣物、装饰品等', icon: '👗' }
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['植物'])
  const [extractionResult, setExtractionResult] = useState<ElementExtractionResponse | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [autoExtractMode, setAutoExtractMode] = useState(true)
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
        timestamp: new Date(),
        comment: data.comment,
        story: data.story,
        isValid: data.isValid
      }

      setMessages(prev => [...prev, assistantMessage])

      if (autoExtractMode && data.story && selectedCategories.length > 0) {
        setTimeout(() => {
          performAutoExtraction(userMessage, assistantMessage)
        }, 500)
      }

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

  const performAutoExtraction = async (userMessage: Message, assistantMessage: Message) => {
    if (!assistantMessage.story) return

    try {
      const response = await fetch('/api/extract-elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMessage.content,
          assistantStory: assistantMessage.story,
          categories: selectedCategories
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                story: data.markedText,
                hasExtractedElements: true
              }
            : msg
        ))
      }
    } catch (error) {
      console.error('自动元素提取失败:', error)
    }
  }

  const extractElements = async () => {
    if (!messages.length || isExtracting) return
    
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'user' || !lastMessage.story) return

    // 找到对应的用户消息
    const userMessage = messages[messages.length - 2]
    if (!userMessage || userMessage.role !== 'user') return

    if (selectedCategories.length === 0) {
      setExtractionResult({
        error: '请至少选择一个元素类别'
      })
      return
    }

    setIsExtracting(true)
    setExtractionResult(null)

    try {
      const response = await fetch('/api/extract-elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMessage.content,
          assistantStory: lastMessage.story,
          categories: selectedCategories
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setExtractionResult({
          error: errorData.error || '元素提取失败'
        })
        return
      }

      const data = await response.json()
      
      // 直接更新最后一条消息的story部分
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 
          ? { 
              ...msg, 
              story: data.markedText,
              hasExtractedElements: true
            }
          : msg
      ))

      setExtractionResult({
        success: true,
        message: '元素提取完成，已在聊天区域高亮显示'
      })

    } catch (error) {
      console.error('提取元素时出错:', error)
      setExtractionResult({
        error: '网络错误，请稍后重试'
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName)
      } else {
        return [...prev, categoryName]
      }
    })
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
                      {message.role === 'assistant' ? (
                        <div className="space-y-2">
                          {/* 国王的评论 */}
                          {message.comment && (
                            <div className="text-amber-300 font-medium text-sm italic">
                              {message.comment}
                            </div>
                          )}
                          
                          {/* 国王的故事 */}
                          {message.story && (
                            <div>
                              {message.hasExtractedElements ? (
                                <HighlightText
                                  text={message.story}
                                  onElementClick={(element) => {
                                    console.log('点击了元素:', element)
                                    // 暂时移除弹窗
                                  }}
                                />
                              ) : (
                                <p className="whitespace-pre-wrap">{message.story}</p>
                              )}
                            </div>
                          )}
                          
                          {/* 如果没有分离的comment和story，显示完整内容 */}
                          {!message.comment && !message.story && (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
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

        {/* 元素提取模块 */}
        <div className="w-80 bg-white/10 backdrop-blur-md rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-persian-gold" />
            <h2 className="text-lg font-semibold text-white">元素提取</h2>
          </div>

          {/* 自动模式开关 */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-persian-gold" />
                <span className="text-sm font-medium text-white">自动模式</span>
              </div>
              <button
                onClick={() => setAutoExtractMode(!autoExtractMode)}
                className={`
                  relative w-12 h-6 rounded-full transition-all duration-300
                  ${autoExtractMode ? 'bg-persian-gold' : 'bg-white/20'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300
                    ${autoExtractMode ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>
            <p className="text-xs text-white/60">
              {autoExtractMode ? '国王回复后自动进行元素提取' : '需要手动点击按钮进行元素提取'}
            </p>
          </div>
          
          {/* 元素类别选择 */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white mb-2">选择元素类别:</h3>
            <div className="grid grid-cols-2 gap-2">
              {ELEMENT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.name)}
                  className={`
                    text-xs p-2 rounded-lg border transition-all duration-200
                    ${selectedCategories.includes(category.name)
                      ? 'bg-persian-gold/20 text-persian-gold border-persian-gold'
                      : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                    }
                  `}
                >
                  <div className="flex items-center gap-1">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    {selectedCategories.includes(category.name) && (
                      <Check className="w-3 h-3" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 手动提取按钮 */}
          <button
            onClick={extractElements}
            disabled={isExtracting || messages.filter(m => m.role === 'assistant').length === 0 || selectedCategories.length === 0}
            className="w-full bg-royal-purple text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                提取中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {autoExtractMode ? '重新提取' : '提取元素'}
              </>
            )}
          </button>

          {/* 提取结果显示 */}
          {extractionResult && (
            <div className="bg-white/10 rounded-lg p-3">
              {extractionResult.error ? (
                <div className="text-red-400 text-sm">
                  ❌ {extractionResult.error}
                </div>
              ) : extractionResult.success ? (
                <div className="text-green-400 text-sm">
                  ✅ {extractionResult.message}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 