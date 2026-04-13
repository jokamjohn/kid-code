export interface UserStats {
  totalXp: number
  level: number
  streakDays: number
  lastActive: string
}

export interface LessonCompletion {
  userId: string
  subjectId: string
  topicId: string
  score?: number
  xpEarned: number
  completedAt: string
}

export interface XpLogEntry {
  id: string
  amount: number
  reason: string
  createdAt: string
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  category: 'learning' | 'streak' | 'project' | 'mastery' | 'quiz' | 'special'
}

export interface UserBadge {
  badgeId: string
  earnedAt: string
}

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000]
export const LEVEL_NAMES = [
  'Curious Explorer',
  'Code Apprentice',
  'Tag Wizard',
  'Script Writer',
  'Function Master',
  'KidCode Legend',
]

export function getLevelFromXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getXpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}
