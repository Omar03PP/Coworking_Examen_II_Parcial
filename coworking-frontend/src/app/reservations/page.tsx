'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatDate, formatTime, statusColor } from '@/lib/utils'
import type { Reservation } from '@/lib/types'
import { CalendarCheck, Plus, Building2 } from 'lucide-react'

export default function MyReservationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState<number | null>(null)

  const fetchReservations = () => {
    setLoading(true); setError('')
    api.get<Reservation[]>('/reservations/me')
      .then(setReservations).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReservations() }, [])

  const cancelReservation = async (id: number) => {
    if (!confirm('¿Cancelar esta reservación?')) return
    setCancelling(id)
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'CANCELLED' })
      fetchReservations()
    } catch { setError('Error al cancelar') }
    finally { setCancelling(null) }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Mis Reservas</h1>
            <p className="text-sm text-ink-soft mt-1">Gestiona tus reservaciones</p>
          </div>
          <Link href="/reservations/create">
            <Button><Plus size={16} /> Nueva Reserva</Button>
          </Link>
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchReservations} /> :
          reservations.length === 0 ? <EmptyState title="Sin reservas" description="No tienes reservaciones activas." /> :
          <div className="grid grid-cols-1 gap-4">
            {reservations.map(r => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                      <Building2 size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{r.space?.name || `Espacio #${r.spaceId}`}</p>
                      <p className="text-sm text-ink-soft mt-0.5">
                        {formatDate(r.startTime)} · {formatTime(r.startTime)} - {formatTime(r.endTime)}
                      </p>
                      {r.reason && <p className="text-xs text-ink-soft mt-0.5">{r.reason}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColor(r.status)}>{r.status}</Badge>
                    {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                      <Button variant="danger" size="sm" onClick={() => cancelReservation(r.id)} disabled={cancelling === r.id}>
                        {cancelling === r.id ? '...' : 'Cancelar'}
                      </Button>
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
