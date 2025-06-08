export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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