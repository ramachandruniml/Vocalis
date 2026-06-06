export interface SpeechFeatures {
  wpm: number
  filler_rate: number
  filler_words: string[]
  unique_word_ratio: number
  avg_word_length: number
  word_count: number
}

export interface InterviewSegment {
  transcript: string
  features: SpeechFeatures
  confidence_score: number
  feedback: string
  timestamp?: number
}

export interface Session {
  id: string
  avgConfidence: number
  segmentCount: number
  totalWords: number
  avgWpm: number
  avgFillerRate: number
  createdAt: string
  segments?: InterviewSegment[]
}