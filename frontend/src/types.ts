export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface SpeechFeatures {
  wpm: number
  filler_rate: number
  filler_words: string[]
  unique_word_ratio: number
  avg_word_length: number
  word_count: number
}

export interface InterviewMessage {
  transcript: string
  features: SpeechFeatures
  confidence_score: number
  feedback: string
  timestamp: number
}