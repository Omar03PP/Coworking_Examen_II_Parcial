'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatDateTime, statusColor, statusLabel } from '@/lib/utils'
import type { DashboardData, Reservation, Notification as Notif } from '@/lib/types'
import { Users, Building2, CalendarCheck, Star, TrendingUp, Bell, Clock, ArrowRight, BarChart3 } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-ink" />
        </div>
        <div>
          <p className="text-sm text-ink-soft">{label}</p>
          <p className="text-2xl font-bold text-ink">{value}</p>
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true); setError('')
    Promise.all([
      api.get<DashboardData>('/admin/dashboard').catch(() => null),
      api.get<Reservation[]>('/reservations/me').catch(() => []),
      api.get<Notif[]>('/notifications').catch(() => []),
    ]).then(([d, r, n]) => {
      setData(d)
      setReservations(r as Reservation[])
      setNotifications(n as Notif[])
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (user?.role === 'ADMIN') {
    return (
      <ProtectedRoute adminOnly>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
              <p className="text-sm text-ink-soft mt-1">Resumen general del sistema</p>
            </div>
          </div>

          {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchData} /> : data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={Users} label="Usuarios" value={data.totalUsers} color="bg-accent" />
                <StatCard icon={Building2} label="Espacios" value={data.totalSpaces} color="bg-accent" />
                <StatCard icon={CalendarCheck} label="Reservas" value={data.totalReservations} color="bg-accent" />
                <StatCard icon={Star} label="Reseñas" value={data.totalReviews} color="bg-gold" />
                <StatCard icon={TrendingUp} label="Activas" value={data.activeReservations} color="bg-accent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-ink">Reservas por día</h3>
                  </CardHeader>
                  <CardContent>
                    {data.reservationsByDay.length === 0 ? (
                      <p className="text-sm text-ink-soft text-center py-8">Sin reservas</p>
                    ) : (
                      <div className="space-y-2">
                        {data.reservationsByDay.map(d => (
                          <div key={d.date} className="flex items-center gap-3">
                            <span className="text-sm text-ink-soft w-32">{d.date}</span>
                            <div className="flex-1 bg-surface-2 rounded-full h-2.5">
                              <div
                                className="bg-accent h-2.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (d.count / Math.max(...data.reservationsByDay.map(x => x.count))) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-ink w-8 text-right">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-ink">Actividad Reciente</h3>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                    {data.recentActivity.length === 0 ? (
                      <p className="text-sm text-ink-soft text-center py-8">Sin actividad</p>
                    ) : data.recentActivity.map(a => (
                      <div key={a.id} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                        <div>
                          <p className="text-sm text-ink">
                            <span className="font-medium">{a.action}</span> en {a.entity}
                          </p>
                          <p className="text-xs text-ink-soft">{formatDateTime(a.createdAt)}</p>
                        </div>
                        <Badge className={statusColor(a.action)}>{a.action}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-sm text-ink-soft mt-1">Resumen de tu actividad</p>
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchData} /> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink flex items-center gap-2">
                    <CalendarCheck size={18} className="text-accent" />
                    Mis reservas
                  </h3>
                  <Link href="/reservations" className="text-xs text-accent hover:text-accent-dim font-medium flex items-center gap-1">
                    Ver todas <ArrowRight size={12} />
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reservations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-ink-soft">No tienes reservas activas</p>
                      <Link href="/spaces" className="text-sm text-accent hover:text-accent-dim font-medium mt-2 inline-block">
                        Explorar espacios
                      </Link>
                    </div>
                  ) : reservations.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-3 border-b border-line last:border-0">
                      <div>
                        <p className="text-sm font-medium text-ink">{r.space?.name || `Espacio #${r.spaceId}`}</p>
                        <p className="text-xs text-ink-soft mt-0.5">
                          {formatDateTime(r.startTime)} — {formatDateTime(r.endTime)}
                        </p>
                      </div>
                      <Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink flex items-center gap-2">
                    <Bell size={18} className="text-accent" />
                    Notificaciones
                  </h3>
                  <Link href="/notifications" className="text-xs text-accent hover:text-accent-dim font-medium">
                    Ver todas
                  </Link>
                </CardHeader>
                <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-ink-soft text-center py-8">Sin notificaciones</p>
                  ) : notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`p-3 rounded-xl text-sm ${n.read ? '' : 'bg-accent-soft'}`}>
                      <p className={`text-ink ${n.read ? '' : 'font-medium'}`}>{n.message}</p>
                      <p className="text-xs text-ink-soft mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
