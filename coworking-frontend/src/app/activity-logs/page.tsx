'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/lib/api'
import { formatDateTime, statusColor } from '@/lib/utils'
import type { PaginatedResponse, ActivityLog } from '@/lib/types'
import { ClipboardList } from 'lucide-react'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = (p: number) => {
    setLoading(true); setError('')
    api.get<PaginatedResponse<ActivityLog>>(`/admin/activity-logs?page=${p}&limit=${limit}`)
      .then(res => { setLogs(res.data); setTotal(res.total) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs(page) }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Registro de Actividad</h1>
          <p className="text-sm text-ink-soft mt-1">{total} registros en total</p>
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={() => fetchLogs(page)} /> :
          logs.length === 0 ? <EmptyState title="Sin actividad" /> :
          <Card>
            <CardContent className="p-0 divide-y divide-line">
              {logs.map(l => (
                <div key={l.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                      <ClipboardList size={16} className="text-ink-soft" />
                    </div>
                    <div>
                      <p className="text-sm text-ink">
                        <span className="font-medium">{l.action}</span> — {l.entity}
                        {l.entityId ? ` #${l.entityId}` : ''}
                      </p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {l.user ? `por ${l.user.name}` : 'por sistema'} · {formatDateTime(l.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColor(l.action)}>{l.action}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        }

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-ink-soft">Página {page} de {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
