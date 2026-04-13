import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { xpPopAtom } from '@/atoms/progressAtoms'
import { useEffect } from 'react'

export function XpNotification() {
  const [xp, setXp] = useAtom(xpPopAtom)

  useEffect(() => {
    if (xp !== null) {
      const t = setTimeout(() => setXp(null), 2000)
      return () => clearTimeout(t)
    }
  }, [xp, setXp])

  return (
    <AnimatePresence>
      {xp !== null && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.5 }}
          className="fixed top-20 right-6 z-50 bg-kc-purple-500 text-white font-black text-xl rounded-2xl px-6 py-3 shadow-kid pointer-events-none"
        >
          +{xp} XP ⭐
        </motion.div>
      )}
    </AnimatePresence>
  )
}
