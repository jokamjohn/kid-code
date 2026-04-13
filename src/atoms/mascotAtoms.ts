import { atom } from 'jotai'

export type MascotMood = 'idle' | 'happy' | 'thinking' | 'celebrate' | 'encouraging'

export const mascotMoodAtom = atom<MascotMood>('idle')
export const mascotMessageAtom = atom<string | null>(null)

export const MASCOT_MESSAGES: Record<MascotMood, string[]> = {
  idle: ['Ready to learn?', 'Pick a topic!', "What shall we explore today?"],
  happy: ['Great job! 🎉', 'You\'re doing amazing!', 'Keep it up!'],
  thinking: ['Hmm, let me think...', 'Great question!', 'Calculating...'],
  celebrate: ['🎉 You did it!', 'Incredible work!', 'You\'re a coding star! ⭐'],
  encouraging: ["Don't give up!", 'You\'ve got this!', 'Every expert was once a beginner!'],
}
