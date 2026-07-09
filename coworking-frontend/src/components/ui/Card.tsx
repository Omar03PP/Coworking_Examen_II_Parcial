import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Card({ className, children, ...props }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('bg-surface border border-line rounded-2xl shadow-theme', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-6 py-5 border-b border-line', className)}>{children}</div>
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}
