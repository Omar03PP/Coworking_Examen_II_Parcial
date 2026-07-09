import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg' }) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
  const variants = {
    primary: 'bg-accent text-ink hover:bg-accent-dim',
    secondary: 'bg-transparent text-ink border border-line hover:border-accent hover:text-accent-dim',
    danger: 'bg-danger text-ink hover:opacity-80',
    ghost: 'text-ink-soft hover:text-ink hover:bg-surface-2',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}
