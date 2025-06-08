export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  hasExtractedElements?: boolean
  // 国王回复的详细信息
  comment?: string
  story?: string
  isValid?: boolean
}

export interface ChatResponse {
  message: string
  isValid: boolean
  comment?: string
  story?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface KeywordAnalysis {
  keywords: string[]
  analysis: string
  confidence: number
}

export interface ElementCategory {
  id: string
  name: string
  description: string
  examples: string[]
}

export interface ExtractedElement {
  element: string
  category: string
  startIndex: number
  endIndex: number
  confidence: number
}

export interface ElementExtractionRequest {
  message: string
  categories: string[]
}

export interface ElementExtractionResponse {
  markedText?: string
  error?: string
  success?: boolean
  message?: string
}

// 卡牌相关类型
export interface Card {
  id: string
  name: string
  power: number
  description: string
  category: string
}

export interface CardGenerationRequest {
  playerInput: string
  kingOutput: string
  clickedElement: string
  category: string
}

export interface CardGenerationResponse {
  card?: Card
  error?: string
}

// 游戏阶段类型
export type GameStage = 'K1' | 'K2'

// Few-shot示例类型
export interface FewShotExample {
  user: string
  assistant: string
}

// 游戏配置类型
export interface GameConfig {
  currentStage: GameStage
  k1Prompt: string
  k2Prompt: string
  k1FewShot: FewShotExample[]
  k2FewShot: FewShotExample[]
  selectedCategories: string[]
} 