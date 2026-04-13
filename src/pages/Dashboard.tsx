import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, MessageCircle, Trophy, ArrowRight, Flame, Zap } from 'lucide-react'
import { userStatsAtom, userBadgesAtom, lessonCompletionsAtom } from '@/atoms/progressAtoms'
import { profileAtom } from '@/atoms/userAtoms'
import { LEVEL_NAMES, getLevelFromXp, LEVEL_THRESHOLDS } from '@/types/progress'
import { ALL_BADGES } from '@/lib/gamification/badges'
import { CURRICULUM } from '@/lib/content/curriculum'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils/cn'

const SUBJECT_COLORS: Record<string, { bar: 'yellow' | 'coral' | 'blue' | 'green', bg: string, text: string }> = {
  computing:  { bar: 'yellow', bg: 'bg-kc-yellow-50',  text: 'text-kc-yellow-700' },
  html:       { bar: 'coral',  bg: 'bg-kc-coral-50',   text: 'text-kc-coral-700'  },
  css:        { bar: 'blue',   bg: 'bg-kc-blue-50',    text: 'text-kc-blue-700'   },
  javascript: { bar: 'green',  bg: 'bg-kc-green-50',   text: 'text-kc-green-700'  },
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }

export default function Dashboard() {
  const [stats] = useAtom(userStatsAtom)
  const [profile] = useAtom(profileAtom)
  const [completions] = useAtom(lessonCompletionsAtom)
  const [badges] = useAtom(userBadgesAtom)

  const level = getLevelFromXp(stats.totalXp)
  const levelName = LEVEL_NAMES[level - 1]
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const prevThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const xpInLevel = stats.totalXp - prevThreshold
  const xpForLevel = nextThreshold - prevThreshold
  const recentBadges = badges.slice(-3).reverse()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

      {/* Welcome Banner */}
      <motion.div variants={item}>
        <div className="bg-gradient-to-r from-kc-purple-500 to-kc-blue-500 rounded-3xl p-7 text-white shadow-kid relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-8xl flex items-center justify-end pr-8">🚀</div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-kc-purple-100 text-sm font-semibold mb-1">Welcome back!</p>
              <h2 className="text-3xl font-black">{profile?.displayName ?? 'Coder'} 👋</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
                <div className="font-black text-lg">{stats.streakDays}</div>
                <div className="text-xs text-kc-purple-100 font-semibold flex items-center gap-1"><Flame size={10} /> day streak</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center">
                <div className="font-black text-lg">Lv.{level}</div>
                <div className="text-xs text-kc-purple-100 font-semibold">{levelName}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* XP Card */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-kc-purple-100 flex items-center justify-center">
                <Zap size={18} className="text-kc-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Total XP</p>
                <p className="font-black text-2xl text-slate-800 dark:text-white">{stats.totalXp.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Level {level}</span>
                <span>{xpInLevel} / {xpForLevel} XP</span>
              </div>
              <Progress value={xpInLevel} max={xpForLevel} color="purple" />
              <p className="text-xs text-slate-400 mt-2">
                {xpForLevel - xpInLevel} XP to Level {level + 1} 🎯
              </p>
            </div>
            <div className="mt-auto pt-2 border-t border-slate-50 dark:border-slate-700">
              <p className="text-sm font-bold text-kc-purple-600">Keep going, you're doing great! ⭐</p>
            </div>
          </Card>
        </motion.div>

        {/* Subject Progress */}
        <motion.div variants={item} className="md:col-span-2">
          <Card>
            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-4">Subject Progress</h3>
            <div className="grid grid-cols-2 gap-3">
              {CURRICULUM.map((subject) => {
                const done = completions.filter(c => c.subjectId === subject.id).length
                const total = subject.topics.length
                const col = SUBJECT_COLORS[subject.id]
                const firstIncomplete = subject.topics.find(t => !completions.some(c => c.topicId === t.id))
                return (
                  <div key={subject.id} className={cn('rounded-2xl p-4 flex flex-col gap-2', col.bg)}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{subject.icon}</span>
                      <span className={cn('text-xs font-black', col.text)}>{done}/{total}</span>
                    </div>
                    <p className={cn('font-black text-sm', col.text)}>{subject.title}</p>
                    <Progress value={done} max={total} color={col.bar} size="sm" />
                    <Link to={firstIncomplete ? `/learn/${subject.id}/${firstIncomplete.id}` : `/learn/${subject.id}`}>
                      <Button variant="ghost" size="sm" className={cn('w-full text-xs font-bold mt-1', col.text)}>
                        {done === 0 ? 'Start' : done === total ? '✓ Complete' : 'Continue'} <ArrowRight size={12} />
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Badges */}
        <motion.div variants={item}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-slate-800 dark:text-white">Recent Badges 🏆</h3>
              <Link to="/achievements" className="text-xs text-kc-purple-500 font-bold hover:underline">See all</Link>
            </div>
            {recentBadges.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-sm text-slate-400">Complete lessons to earn badges!</p>
              </div>
            ) : (
              <div className="flex gap-3">
                {recentBadges.map(ub => {
                  const b = ALL_BADGES.find(b => b.id === ub.badgeId)
                  if (!b) return null
                  return (
                    <div key={ub.badgeId} className="flex-1 bg-kc-purple-50 dark:bg-kc-purple-900/20 rounded-2xl p-4 text-center">
                      <div className="text-4xl mb-2">{b.emoji}</div>
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-200">{b.name}</p>
                      <p className="text-xs text-kc-purple-500 font-bold mt-1">+{b.xpReward} XP</p>
                    </div>
                  )
                })}
                {recentBadges.length < 3 && Array.from({ length: 3 - recentBadges.length }).map((_, i) => (
                  <div key={i} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="text-3xl mb-2 opacity-30">🏅</div>
                    <p className="text-xs text-slate-300 dark:text-slate-600 font-bold">Keep going!</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card>
            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-4">Quick Actions ⚡</h3>
            <div className="space-y-3">
              <Link to="/playground">
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-kc-blue-50 dark:bg-kc-blue-900/20 hover:bg-kc-blue-100 dark:hover:bg-kc-blue-900/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-kc-blue-500 flex items-center justify-center shadow-sm">
                    <Code2 size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-sm text-slate-800 dark:text-white">Go to Playground</p>
                    <p className="text-xs text-slate-400">Write & run code live</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-kc-blue-500 transition-colors" />
                </button>
              </Link>
              <Link to="/tutor">
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-kc-purple-50 dark:bg-kc-purple-900/20 hover:bg-kc-purple-100 dark:hover:bg-kc-purple-900/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-kc-purple-500 flex items-center justify-center shadow-sm">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-sm text-slate-800 dark:text-white">Ask AI Tutor</p>
                    <p className="text-xs text-slate-400">Spark is here to help!</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-kc-purple-500 transition-colors" />
                </button>
              </Link>
              <Link to="/achievements">
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-kc-yellow-50 dark:bg-kc-yellow-900/20 hover:bg-kc-yellow-100 dark:hover:bg-kc-yellow-900/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-kc-yellow-500 flex items-center justify-center shadow-sm">
                    <Trophy size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-sm text-slate-800 dark:text-white">View Achievements</p>
                    <p className="text-xs text-slate-400">{badges.length} badges earned so far</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-kc-yellow-500 transition-colors" />
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
