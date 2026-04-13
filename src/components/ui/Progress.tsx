import { cn } from '@/lib/utils/cn'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  color?: 'purple' | 'green' | 'yellow' | 'blue' | 'coral'
  size?: 'sm' | 'md'
}

export function Progress({ value, max = 100, className, color = 'purple', size = 'md' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    purple: 'from-kc-purple-400 to-kc-purple-600',
    green: 'from-kc-green-400 to-kc-green-600',
    yellow: 'from-kc-yellow-400 to-kc-yellow-600',
    blue: 'from-kc-blue-400 to-kc-blue-600',
    coral: 'from-kc-coral-400 to-kc-coral-600',
  }
  const sizes = { sm: 'h-2', md: 'h-3' }
  return (
    <div className={cn('rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden', sizes[size], className)}>
      <div
        className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-700 ease-out', colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
