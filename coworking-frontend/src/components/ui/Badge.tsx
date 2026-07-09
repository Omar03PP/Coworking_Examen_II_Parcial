import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', children }: { className?: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; children: React.ReactNode }) {
  const variants = {
    default: 'bg-surface-2 text-ink-soft border border-line',
    success: 'bg-accent-soft text-accent-dim',
    warning: 'bg-gold-soft text-gold',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-accent-soft text-accent-dim',
    purple: 'bg-accent-soft text-accent-dim',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
