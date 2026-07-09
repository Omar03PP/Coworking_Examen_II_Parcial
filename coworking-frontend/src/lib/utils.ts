export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-HN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-HN', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)} ${formatTime(iso)}`
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-gold-soft text-gold',
    CONFIRMED: 'bg-accent-soft text-accent-dim',
    CANCELLED: 'bg-danger-soft text-danger',
    FINALIZED: 'bg-surface-2 text-ink-soft',
    ACTIVE: 'bg-accent-soft text-accent-dim',
    WAITING: 'bg-gold-soft text-gold',
  }
  return map[status] || 'bg-surface-2 text-ink-soft'
}

export function spaceTypeLabel(type: string) {
  const map: Record<string, string> = {
    SALA: 'Sala',
    ESCRITORIO: 'Escritorio',
    AUDITORIO: 'Auditorio',
  }
  return map[type] || type
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada',
    FINALIZED: 'Finalizada',
    ACTIVE: 'Activa',
    WAITING: 'Esperando',
  }
  return map[status] || status
}
