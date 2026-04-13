import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, BookOpen, Code2, Puzzle,
  FolderOpen, MessageCircle, Trophy, Settings, Zap
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/playground', icon: Code2, label: 'Playground' },
  { to: '/blocks', icon: Puzzle, label: 'Block Editor' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/tutor', icon: MessageCircle, label: 'AI Tutor' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-kc-purple-400 to-kc-purple-600 flex items-center justify-center shadow-kid">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-black text-xl text-slate-800 dark:text-white leading-none">KidCode</h1>
          <p className="text-xs text-kc-purple-500 font-semibold">Learn to code!</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200',
                isActive
                  ? 'bg-kc-purple-50 dark:bg-kc-purple-900/30 text-kc-purple-700 dark:text-kc-purple-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="p-4 text-center">
        <p className="text-xs text-slate-400">Powered by Claude AI ✨</p>
      </div>
    </aside>
  )
}
