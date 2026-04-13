import { atom } from 'jotai'
import type { UserStats, UserBadge, LessonCompletion } from '@/types/progress'

export const userStatsAtom = atom<UserStats>({
  totalXp: 0,
  level: 1,
  streakDays: 0,
  lastActive: new Date().toISOString(),
})

export const userBadgesAtom = atom<UserBadge[]>([])
export const lessonCompletionsAtom = atom<LessonCompletion[]>([])
export const newBadgeAtom = atom<string | null>(null) // triggers badge unlock modal
export const xpPopAtom = atom<number | null>(null)    // triggers "+N XP" toast
