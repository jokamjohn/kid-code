import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, CheckCircle, Code2 } from 'lucide-react'
import { getTopic, getSubject } from '@/lib/content/curriculum'
import { useAtom } from 'jotai'
import { lessonCompletionsAtom, userStatsAtom, xpPopAtom } from '@/atoms/progressAtoms'
import { mascotMoodAtom } from '@/atoms/mascotAtoms'
import { supabaseUserAtom } from '@/atoms/userAtoms'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import ReactMarkdown from 'react-markdown'

const STYLES: Record<string, { hdr: string, badgeBg: string, badgeText: string }> = {
  computing:  { hdr: 'from-kc-yellow-400 to-kc-yellow-500', badgeBg: 'bg-kc-yellow-100', badgeText: 'text-kc-yellow-700' },
  html:       { hdr: 'from-kc-coral-400 to-kc-coral-500',   badgeBg: 'bg-kc-coral-100',  badgeText: 'text-kc-coral-700'  },
  css:        { hdr: 'from-kc-blue-400 to-kc-blue-500',     badgeBg: 'bg-kc-blue-100',   badgeText: 'text-kc-blue-700'   },
  javascript: { hdr: 'from-kc-green-400 to-kc-green-500',   badgeBg: 'bg-kc-green-100',  badgeText: 'text-kc-green-700'  },
}

export default function LearnTopic() {
  const { subjectId = '', topicId = '' } = useParams()
  const navigate = useNavigate()
  const topic = getTopic(subjectId, topicId)
  const subject = getSubject(subjectId)
  const [completions, setCompletions] = useAtom(lessonCompletionsAtom)
  const [, setStats] = useAtom(userStatsAtom)
  const [, setMood] = useAtom(mascotMoodAtom)
  const [, setXpPop] = useAtom(xpPopAtom)
  const [user] = useAtom(supabaseUserAtom)

  if (!topic || !subject) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-slate-500 font-bold">Topic not found!</p>
      <Link to="/learn"><Button className="mt-4">Back to Learn</Button></Link>
    </div>
  )

  const style = STYLES[subjectId] ?? STYLES.computing
  const isComplete = completions.some(c => c.topicId === topicId)

  const topics = subject.topics
  const idx = topics.findIndex(t => t.id === topicId)
  const next = topics[idx + 1]

  async function markComplete() {
    if (isComplete) return
    const xp = 50

    // Optimistic UI update
    setCompletions(prev => [...prev, {
      userId: user?.id ?? 'local',
      subjectId,
      topicId,
      xpEarned: xp,
      completedAt: new Date().toISOString(),
    }])
    setMood('celebrate')
    setXpPop(xp)
    setTimeout(() => setMood('idle'), 3000)

    // Persist via API (non-blocking — UI already updated)
    if (user) {
      apiClient.post<{ totalXp: number; level: number }>('/api/progress/lesson', {
        subject: subjectId,
        topicId,
        score: 100,
        xpEarned: xp,
      }).then(res => {
        setStats(prev => ({ ...prev, totalXp: res.totalXp, level: res.level }))
      }).catch(() => {
        // Fallback: update stats locally if API unavailable
        setStats(prev => ({ ...prev, totalXp: prev.totalXp + xp }))
      })
    } else {
      setStats(prev => ({ ...prev, totalXp: prev.totalXp + xp }))
    }

    if (next) navigate(`/learn/${subjectId}/${next.id}`)
    else navigate(`/learn/${subjectId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <div className="mb-5">
        <Link to={`/learn/${subjectId}`}>
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-sm transition-colors">
            <ArrowLeft size={15} /> {subject.title}
          </button>
        </Link>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-3xl bg-gradient-to-r text-white p-7 mb-7', style.hdr)}
      >
        <div className="flex items-center gap-2 mb-2 text-white/70 text-xs font-bold">
          <Clock size={12} /> {topic.duration} · Topic {idx + 1} of {topics.length}
        </div>
        <h1 className="text-2xl font-black">{topic.title}</h1>
        <p className="text-white/80 text-sm mt-1">{topic.description}</p>
        {isComplete && (
          <div className="flex items-center gap-1.5 mt-3 bg-white/20 rounded-xl px-3 py-1.5 w-fit text-xs font-black">
            <CheckCircle size={13} /> Completed!
          </div>
        )}
      </motion.div>

      {/* Sections */}
      <div className="space-y-5 mb-8">
        {topic.sections.map((section, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            {section.type === 'text' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-slate-800 prose-code:bg-slate-100 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            )}
            {section.type === 'code' && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="bg-slate-800 dark:bg-slate-900 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {['bg-red-400','bg-yellow-400','bg-green-400'].map(c=><div key={c} className={cn('w-3 h-3 rounded-full', c)} />)}
                  </div>
                  <span className="text-slate-400 text-xs font-mono ml-2">{section.language ?? 'code'}</span>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-5 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{section.content}</code>
                </pre>
              </div>
            )}
            {section.type === 'try-it' && (
              <div className={cn('rounded-2xl p-5 border-2 border-dashed', style.badgeBg, 'border-current')}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <div>
                    <p className={cn('font-black text-sm mb-1', style.badgeText)}>Try it yourself!</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{section.content}</p>
                    <Link to="/playground">
                      <button className="flex items-center gap-1.5 mt-3 text-xs font-black text-kc-blue-600 hover:underline">
                        <Code2 size={12} /> Open in Playground <ArrowRight size={12} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {section.type === 'visual' && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
                <div className="text-6xl mb-3">🖼️</div>
                <p className="text-sm text-slate-400 font-semibold">Interactive diagram: {section.content}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Complete button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-4">
        {!isComplete ? (
          <Button size="lg" onClick={markComplete} className="flex-1">
            {next ? `Complete & Next: ${next.title}` : 'Complete Lesson'} 🎉
          </Button>
        ) : (
          <>
            {next && (
              <Link to={`/learn/${subjectId}/${next.id}`} className="flex-1">
                <Button size="lg" className="w-full">Next: {next.title} <ArrowRight size={16} /></Button>
              </Link>
            )}
            <Link to={`/learn/${subjectId}`}>
              <Button variant="secondary" size="lg">Back to {subject.title}</Button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
