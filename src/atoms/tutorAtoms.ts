import { atom } from 'jotai'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const chatMessagesAtom = atom<ChatMessage[]>([])
export const tutorLoadingAtom = atom(false)
export const tutorContextAtom = atom<{
  subject?: string
  topicId?: string
  codeSnippet?: string
} | null>(null)
