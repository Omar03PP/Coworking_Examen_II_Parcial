'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/lib/api'
import { formatDate, formatTime, statusColor } from '@/lib/utils'
import type { Reservation } from '@/lib/types'
import { Building2 } from 'lucide-react'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchReservations = () => {
    setLoading(true); setError('')
    api.get<Reservation[]>('/reservations')
      .then(setReservations).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReservations() }, [])

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await api.patch(`/reservations/${id}/status`, { status })
      fetchReservations()
    } catch { setError('Error al actualizar') }
    finally { setUpdating(null) }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Todas las Reservas</h1>
          <p className="text-sm text-ink-soft mt-1">Administración de reservaciones</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchReservations}>Actualizar</Button>
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchReservations} /> :
          reservations.length === 0 ? <EmptyState title="Sin reservas" /> :
          <div className="space-y-3">
            {reservations.map(r => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                      <Building2 size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{r.space?.name || `Espacio #${r.spaceId}`}</p>
                      <p className="text-sm text-ink-soft">
                        {r.user?.name || `Usuario #${r.userId}`} · {formatDate(r.startTime)} {formatTime(r.startTime)}-{formatTime(r.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(r.status)}>{r.status}</Badge>
                    {r.status === 'PENDING' && (
                      <Button size="sm" onClick={() => updateStatus(r.id, 'CONFIRMED')} disabled={updating === r.id}>Confirmar</Button>
                    )}
                    {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                      <Button size="sm" variant="danger" onClick={() => updateStatus(r.id, 'CANCELLED')} disabled={updating === r.id}>Cancelar</Button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(r.id, 'FINALIZED')} disabled={updating === r.id}>Finalizar</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      </div>
    </ProtectedRoute>
  )
}
