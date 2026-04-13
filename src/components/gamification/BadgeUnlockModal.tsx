import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { newBadgeAtom } from '@/atoms/progressAtoms'
import { getBadge } from '@/lib/gamification/badges'
import { Button } from '@/components/ui/Button'

export function BadgeUnlockModal() {
  const [badgeId, setBadgeId] = useAtom(newBadgeAtom)
  const badge = badgeId ? getBadge(badgeId) : null

  return (
    <AnimatePresence>
      {badge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full z-10"
          >
            {/* Stars */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: Math.cos(i * 60 * Math.PI/180) * 80, y: Math.sin(i * 60 * Math.PI/180) * 80 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                className="absolute top-1/2 left-1/2 text-2xl pointer-events-none"
              >
                ⭐
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className="text-8xl mb-4"
            >
              {badge.emoji}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="text-kc-purple-500 font-black text-sm uppercase tracking-widest mb-1">Badge Unlocked!</p>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{badge.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{badge.description}</p>
              <p className="text-kc-purple-600 font-black text-lg mb-6">+{badge.xpReward} XP 🎉</p>
              <Button onClick={() => setBadgeId(null)} className="w-full" size="lg">Awesome!</Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
