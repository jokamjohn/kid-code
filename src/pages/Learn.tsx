import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CURRICULUM } from '@/lib/content/curriculum'
import { useAtom } from 'jotai'
import { lessonCompletionsAtom } from '@/atoms/progressAtoms'
import { cn } from '@/lib/utils/cn'

const SUBJECT_STYLES: Record<string, { gradient: string, bg: string, border: string, badge: string, badgeText: string }> = {
  computing:  { gradient: 'from-kc-yellow-400 to-kc-yellow-600', bg: 'bg-kc-yellow-50 dark:bg-kc-yellow-900/20', border: 'border-kc-yellow-200 dark:border-kc-yellow-800', badge: 'bg-kc-yellow-100 dark:bg-kc-yellow-900/40', badgeText: 'text-kc-yellow-700 dark:text-kc-yellow-300' },
  html:       { gradient: 'from-kc-coral-400 to-kc-coral-600',   bg: 'bg-kc-coral-50 dark:bg-kc-coral-900/20',   border: 'border-kc-coral-200 dark:border-kc-coral-800',   badge: 'bg-kc-coral-100 dark:bg-kc-coral-900/40',   badgeText: 'text-kc-coral-700 dark:text-kc-coral-300'   },
  css:        { gradient: 'from-kc-blue-400 to-kc-blue-600',     bg: 'bg-kc-blue-50 dark:bg-kc-blue-900/20',     border: 'border-kc-blue-200 dark:border-kc-blue-800',     badge: 'bg-kc-blue-100 dark:bg-kc-blue-900/40',     badgeText: 'text-kc-blue-700 dark:text-kc-blue-300'     },
  javascript: { gradient: 'from-kc-green-400 to-kc-green-600',   bg: 'bg-kc-green-50 dark:bg-kc-green-900/20',   border: 'border-kc-green-200 dark:border-kc-green-800',   badge: 'bg-kc-green-100 dark:bg-kc-green-900/40',   badgeText: 'text-kc-green-700 dark:text-kc-green-300'   },
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const card = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }

export default function Learn() {
  const [completions] = useAtom(lessonCompletionsAtom)

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3">
          What do you want to learn today? 📚
        </h1>
        <p className="text-slate-500 text-lg">Pick a subject and start your journey!</p>
      </motion.div>

      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid sm:grid-cols-2 gap-6"
      >
        {CURRICULUM.map((subject) => {
          const style = SUBJECT_STYLES[subject.id]
          const done = completions.filter(c => c.subjectId === subject.id).length
          const total = subject.topics.length

          return (
            <motion.div key={subject.id} variants={card}>
              <Link to={`/learn/${subject.id}`}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className={cn('rounded-3xl border-2 p-7 cursor-pointer group relative overflow-hidden', style.bg, style.border)}
                >
                  {/* Progress arc indicator */}
                  {done > 0 && (
                    <div className="absolute top-4 right-4 text-xs font-black text-slate-400">
                      {done}/{total} ✓
                    </div>
                  )}

                  {/* Icon */}
                  <div className={cn('w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center text-5xl shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300', style.gradient)}>
                    {subject.icon}
                  </div>

                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{subject.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed">{subject.description}</p>

                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-black', style.badge, style.badgeText)}>
                      {total} topics
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-600 dark:text-slate-300 group-hover:gap-2.5 transition-all">
                      {done === total && done > 0 ? '✅ Complete' : done > 0 ? 'Continue' : 'Start'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Progress bar at bottom */}
                  {total > 0 && (
                    <div className="mt-4 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', style.gradient)}
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
