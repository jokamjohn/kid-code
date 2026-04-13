import { useAtom } from 'jotai'
import { Moon, Sun, Bell } from 'lucide-react'
import { darkModeAtom, applyDarkMode } from '@/atoms/themeAtoms'
import { userStatsAtom } from '@/atoms/progressAtoms'
import { profileAtom } from '@/atoms/userAtoms'
import { Progress } from '@/components/ui/Progress'
import { LEVEL_NAMES, LEVEL_THRESHOLDS, getLevelFromXp } from '@/types/progress'

export function TopBar({ title }: { title?: string }) {
  const [dark, setDark] = useAtom(darkModeAtom)
  const [stats] = useAtom(userStatsAtom)
  const [profile] = useAtom(profileAtom)

  const level = getLevelFromXp(stats.totalXp)
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const prevThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const xpInLevel = stats.totalXp - prevThreshold
  const xpForLevel = nextThreshold - prevThreshold

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800 z-20 flex items-center px-6 gap-4">
      {title && <h2 className="font-black text-slate-800 dark:text-white text-lg flex-shrink-0">{title}</h2>}

      {/* XP Bar */}
      <div className="flex-1 flex items-center gap-3 max-w-xs">
        <span className="text-xs font-black text-kc-purple-600 dark:text-kc-purple-400 whitespace-nowrap">
          Lv.{level} {LEVEL_NAMES[level - 1]}
        </span>
        <div className="flex-1">
          <Progress value={xpInLevel} max={xpForLevel} size="sm" color="purple" />
        </div>
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{stats.totalXp} XP</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Streak */}
        {stats.streakDays > 0 && (
          <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-xl">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-black text-orange-600 dark:text-orange-400">{stats.streakDays}</span>
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={() => { setDark(!dark); applyDarkMode(!dark) }}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {dark ? <Sun size={18} className="text-kc-yellow-500" /> : <Moon size={18} className="text-slate-500" />}
        </button>

        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
          <Bell size={18} className="text-slate-500" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 flex items-center justify-center text-white font-black text-sm shadow-kid">
          {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  )
}
