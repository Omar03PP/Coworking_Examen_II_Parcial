import { cn } from '@/lib/utils'
import type { ReactNode, SelectHTMLAttributes } from 'react'

export function Select({ className, label, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-soft">{label}</label>}
      <select
        className={cn(
          'block w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink',
          'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
