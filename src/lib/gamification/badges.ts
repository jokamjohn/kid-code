import type { BadgeDefinition } from '@/types/progress'

export const ALL_BADGES: BadgeDefinition[] = [
  // Learning
  { id: 'first-lesson', name: 'First Step!', description: 'Complete your first lesson', emoji: '🌟', xpReward: 25, category: 'learning' },
  { id: 'html-starter', name: 'HTML Hero', description: 'Complete your first HTML lesson', emoji: '🏷️', xpReward: 30, category: 'learning' },
  { id: 'css-starter', name: 'Style Wizard', description: 'Complete your first CSS lesson', emoji: '🎨', xpReward: 30, category: 'learning' },
  { id: 'js-starter', name: 'Script Rookie', description: 'Complete your first JavaScript lesson', emoji: '⚡', xpReward: 30, category: 'learning' },
  { id: 'computing-starter', name: 'Computer Whiz', description: 'Complete your first Computing lesson', emoji: '💻', xpReward: 30, category: 'learning' },
  // Mastery
  { id: 'html-master', name: 'HTML Master', description: 'Complete all HTML topics', emoji: '🏆', xpReward: 200, category: 'mastery' },
  { id: 'css-master', name: 'CSS Master', description: 'Complete all CSS topics', emoji: '🎭', xpReward: 200, category: 'mastery' },
  { id: 'js-master', name: 'JS Master', description: 'Complete all JavaScript topics', emoji: '🚀', xpReward: 200, category: 'mastery' },
  { id: 'computing-master', name: 'Computing Master', description: 'Complete all Computing topics', emoji: '🧠', xpReward: 200, category: 'mastery' },
  // Streak
  { id: 'streak-3', name: '3-Day Streak', description: 'Learn 3 days in a row', emoji: '🔥', xpReward: 50, category: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Learn 7 days in a row', emoji: '💪', xpReward: 150, category: 'streak' },
  { id: 'streak-30', name: 'Monthly Champion', description: 'Learn 30 days in a row', emoji: '👑', xpReward: 500, category: 'streak' },
  // Project
  { id: 'first-project', name: 'Creator!', description: 'Save your first project', emoji: '📁', xpReward: 25, category: 'project' },
  { id: 'first-push', name: 'Git Hero', description: 'Push code to GitHub', emoji: '🐙', xpReward: 50, category: 'project' },
  { id: 'five-projects', name: 'Prolific Builder', description: 'Create 5 projects', emoji: '🏗️', xpReward: 100, category: 'project' },
  // Quiz
  { id: 'first-quiz', name: 'Quiz Taker', description: 'Complete your first quiz', emoji: '📝', xpReward: 25, category: 'quiz' },
  { id: 'perfect-quiz', name: 'Perfect Score!', description: 'Get 100% on a quiz', emoji: '💯', xpReward: 75, category: 'quiz' },
  { id: 'ten-quizzes', name: 'Quiz Master', description: 'Complete 10 quizzes', emoji: '🎓', xpReward: 100, category: 'quiz' },
  // Special
  { id: 'tutor-user', name: 'Curious Mind', description: 'Ask the AI tutor 10 questions', emoji: '🤖', xpReward: 40, category: 'special' },
  { id: 'block-coder', name: 'Block Builder', description: 'Create a program in Block Editor', emoji: '🧩', xpReward: 40, category: 'special' },
]

export function getBadge(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find(b => b.id === id)
}
