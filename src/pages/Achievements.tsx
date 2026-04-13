import { useState } from 'react'
import { useAtom } from 'jotai'
import { motion } from 'framer-motion'

import { userBadgesAtom, userStatsAtom } from '@/atoms/progressAtoms'
import { ALL_BADGES } from '@/lib/gamification/badges'
import type { BadgeDefinition } from '@/types/progress'
import { cn } from '@/lib/utils/cn'

type Category = 'all' | 'learning' | 'streak' | 'project' | 'quiz' | 'special' | 'mastery'
const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all',      label: 'All',      emoji: '🏅' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'mastery',  label: 'Mastery',  emoji: '🏆' },
  { id: 'streak',   label: 'Streak',   emoji: '🔥' },
  { id: 'project',  label: 'Project',  emoji: '🐙' },
  { id: 'quiz',     label: 'Quiz',     emoji: '📝' },
  { id: 'special',  label: 'Special',  emoji: '✨' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } }

export default function Achievements() {
  const [badges] = useAtom(userBadgesAtom)
  const [stats] = useAtom(userStatsAtom)
  const [category, setCategory] = useState<Category>('all')

  const earnedSet = new Set(badges.map(b => b.badgeId))
  const filtered = category === 'all' ? ALL_BADGES : ALL_BADGES.filter(b => b.category === category)
  const earnedCount = ALL_BADGES.filter(b => earnedSet.has(b.id)).length

  const getEarnedDate = (id: string) => {
    const ub = badges.find(b => b.badgeId === id)
    if (!ub) return null
    return new Date(ub.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-1">Your Achievements 🏆</h1>
        <p className="text-slate-400">Collect badges by learning, coding, and exploring!</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🏅', label: 'Badges Earned', value: `${earnedCount} / ${ALL_BADGES.length}`, color: 'bg-kc-purple-50 text-kc-purple-700' },
            { icon: '⭐', label: 'Total XP',      value: stats.totalXp.toLocaleString(),           color: 'bg-kc-yellow-50 text-kc-yellow-700' },
            { icon: '🔥', label: 'Day Streak',    value: `${stats.streakDays} days`,               color: 'bg-orange-50 text-orange-700' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-2xl p-5 flex flex-col items-center text-center', s.color)}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-black text-2xl">{s.value}</div>
              <div className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200',
              category === cat.id
                ? 'bg-kc-purple-500 text-white shadow-kid scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-kc-purple-300'
            )}
          >
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        key={category}
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        {filtered.map((badge: BadgeDefinition) => {
          const earned = earnedSet.has(badge.id)
          const date = getEarnedDate(badge.id)
          return (
            <motion.div key={badge.id} variants={item}>
              <div className={cn(
                'rounded-2xl p-5 text-center border-2 transition-all duration-200',
                earned
                  ? 'bg-white dark:bg-slate-800 border-kc-purple-200 dark:border-kc-purple-800 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 cursor-default'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-60'
              )}>
                <div className={cn('text-5xl mb-3 transition-all', !earned && 'grayscale opacity-40')}>
                  {badge.emoji}
                </div>
                <p className={cn('font-black text-sm mb-1', earned ? 'text-slate-800 dark:text-white' : 'text-slate-400')}>
                  {badge.name}
                </p>
                <p className="text-xs text-slate-400 leading-tight mb-2">{badge.description}</p>
                {earned ? (
                  <div>
                    <span className="text-xs font-black text-kc-purple-600 block">+{badge.xpReward} XP</span>
                    {date && <span className="text-xs text-slate-400">Earned {date}</span>}
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 dark:text-slate-600 font-bold">Locked 🔒</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🤷</div>
          <p className="text-slate-400 font-bold">No badges in this category yet!</p>
        </div>
      )}
    </div>
  )
}
