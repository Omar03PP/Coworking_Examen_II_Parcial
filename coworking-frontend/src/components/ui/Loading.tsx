export function Loading({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-accent-soft border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-ink-soft">{text}</p>
      </div>
    </div>
  )
}
