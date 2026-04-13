import { cn } from '@/lib/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ hover, padding = 'md', className, children, ...props }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-3xl shadow-card border border-slate-100 dark:border-slate-700 transition-all duration-200',
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
