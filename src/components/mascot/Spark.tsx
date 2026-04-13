import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { mascotMoodAtom, mascotMessageAtom, MASCOT_MESSAGES } from '@/atoms/mascotAtoms'
import { useEffect } from 'react'

const MOOD_EMOJI: Record<string, string> = {
  idle: '🤖',
  happy: '😊',
  thinking: '🤔',
  celebrate: '🎉',
  encouraging: '💪',
}

export function Spark() {
  const [mood] = useAtom(mascotMoodAtom)
  const [message, setMessage] = useAtom(mascotMessageAtom)

  useEffect(() => {
    const msgs = MASCOT_MESSAGES[mood]
    const picked = msgs[Math.floor(Math.random() * msgs.length)]
    setMessage(picked)
  }, [mood, setMessage])

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="bg-white dark:bg-slate-800 rounded-2xl rounded-br-sm shadow-card border border-slate-100 dark:border-slate-700 px-4 py-3 max-w-48 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={mood === 'celebrate' ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] } :
                 mood === 'thinking' ? { y: [0, -4, 0] } :
                 mood === 'idle' ? { y: [0, -6, 0] } : {}}
        transition={{ duration: mood === 'idle' ? 3 : 0.5, repeat: mood === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 shadow-kid flex items-center justify-center text-2xl cursor-pointer select-none"
        title="Spark — your coding buddy!"
      >
        {MOOD_EMOJI[mood]}
      </motion.div>
    </div>
  )
}
