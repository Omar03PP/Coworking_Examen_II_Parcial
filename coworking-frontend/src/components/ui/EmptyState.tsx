import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Sin datos', description = 'No hay elementos para mostrar.' }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Inbox size={40} className="text-ink-soft mb-3" />
      <p className="text-sm font-medium text-ink-soft">{title}</p>
      <p className="text-xs text-ink-soft mt-1">{description}</p>
    </div>
  )
}
