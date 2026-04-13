import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Lock, CheckCircle, Star, ArrowRight } from 'lucide-react'
import { getSubject } from '@/lib/content/curriculum'
import { useAtom } from 'jotai'
import { lessonCompletionsAtom } from '@/atoms/progressAtoms'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'

const STYLES: Record<string, { headerBg: string, iconBg: string, badge: string, badgeText: string, btn: string }> = {
  computing:  { headerBg: 'from-kc-yellow-400 to-kc-yellow-500', iconBg: 'bg-kc-yellow-100',  badge: 'bg-kc-yellow-100',  badgeText: 'text-kc-yellow-700', btn: 'bg-kc-yellow-500 hover:bg-kc-yellow-600'  },
  html:       { headerBg: 'from-kc-coral-400 to-kc-coral-500',   iconBg: 'bg-kc-coral-100',   badge: 'bg-kc-coral-100',   badgeText: 'text-kc-coral-700',  btn: 'bg-kc-coral-500 hover:bg-kc-coral-600'    },
  css:        { headerBg: 'from-kc-blue-400 to-kc-blue-500',     iconBg: 'bg-kc-blue-100',    badge: 'bg-kc-blue-100',    badgeText: 'text-kc-blue-700',   btn: 'bg-kc-blue-500 hover:bg-kc-blue-600'      },
  javascript: { headerBg: 'from-kc-green-400 to-kc-green-500',   iconBg: 'bg-kc-green-100',   badge: 'bg-kc-green-100',   badgeText: 'text-kc-green-700',  btn: 'bg-kc-green-500 hover:bg-kc-green-600'    },
}

export default function LearnSubject() {
  const { subjectId = '' } = useParams()
  const subject = getSubject(subjectId)
  const [completions] = useAtom(lessonCompletionsAtom)

  if (!subject) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🤔</div>
      <p className="text-slate-500 font-bold">Subject not found!</p>
      <Link to="/learn"><Button className="mt-4">Back to Subjects</Button></Link>
    </div>
  )

  const style = STYLES[subjectId] ?? STYLES.computing
  const completedIds = new Set(completions.filter(c => c.subjectId === subjectId).map(c => c.topicId))
  const diff2Done = subject.topics.filter(t => t.difficulty <= 2).every(t => completedIds.has(t.id))

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <Link to="/learn">
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Subjects
          </button>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-3xl bg-gradient-to-r text-white p-8 mb-8 relative overflow-hidden', style.headerBg)}
      >
        <div className="absolute inset-0 opacity-10 text-9xl flex items-center justify-end pr-8 pointer-events-none select-none">
          {subject.icon}
        </div>
        <div className="text-5xl mb-3">{subject.icon}</div>
        <h1 className="text-3xl font-black mb-2">{subject.title}</h1>
        <p className="text-white/80 text-sm max-w-md">{subject.description}</p>
        <div className="flex items-center gap-3 mt-4">
          <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-black">{subject.topics.length} topics</span>
          <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-black">{completedIds.size} completed</span>
        </div>
      </motion.div>

      {/* Topics */}
      <div className="space-y-4">
        {subject.topics.map((topic, idx) => {
          const done = completedIds.has(topic.id)
          const locked = topic.difficulty === 3 && !diff2Done
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
            >
              <div className={cn(
                'bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 flex items-center gap-5 transition-all',
                done ? 'border-kc-green-200 dark:border-kc-green-800 bg-kc-green-50 dark:bg-kc-green-900/20' : 'border-slate-100 dark:border-slate-700',
                locked && 'opacity-60'
              )}>
                {/* Number / status */}
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-black',
                  done ? 'bg-kc-green-100 text-kc-green-600' : style.iconBg
                )}>
                  {done ? <CheckCircle size={22} className="text-kc-green-500" /> :
                   locked ? <Lock size={20} className="text-slate-400" /> :
                   <span className="text-slate-600 dark:text-slate-300">{idx + 1}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 dark:text-white mb-0.5">{topic.title}</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 truncate">{topic.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                      <Clock size={11} /> {topic.duration}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star key={i} size={11} className={i < topic.difficulty ? 'fill-kc-yellow-400 text-kc-yellow-400' : 'text-slate-200 dark:text-slate-600'} />
                      ))}
                    </span>
                    {done && <span className="text-xs font-black text-kc-green-600">✓ Done</span>}
                    {locked && <span className="text-xs font-black text-slate-400">🔒 Finish easier topics first</span>}
                  </div>
                </div>

                {!locked && (
                  <Link to={`/learn/${subjectId}/${topic.id}`}>
                    <button className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-black text-white transition-colors',
                      style.btn
                    )}>
                      {done ? 'Review' : idx === 0 || completedIds.has(subject.topics[idx - 1]?.id ?? '') ? 'Start' : 'Start'}
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
