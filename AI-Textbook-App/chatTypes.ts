export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export interface ChatContext {
  textbookId?: string
  chapterId?: string
  sessionId?: string
}

export interface BranchCandidate {
  new_session_id: string
  suggested_title: string
}

export interface ChatSession {
  session_id: string
  title: string
  summary?: string
  updated_at: string
  user_id: string
}