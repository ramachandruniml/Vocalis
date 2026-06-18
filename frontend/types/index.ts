export interface SpeechFeatures {
  wpm: number
  filler_rate: number
  filler_words: string[]
  unique_word_ratio: number
  avg_word_length: number
  word_count: number
}

export interface FeedbackAnalysis {
  expand: string
  cut: string
  must_mention: string
  structure: string
  overall: string
}

export interface InterviewSegment {
  transcript: string
  features: SpeechFeatures
  confidence_score: number
  feedback: string
  analysis?: FeedbackAnalysis
  timestamp?: number
  questionIndex?: number
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

export interface InterviewQuestionsResponse {
  jobType: string
  experienceLevel: string
  questions: string[]
}
