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
import { formatDateTime } from '@/lib/utils'
import type { Notification } from '@/lib/types'
import { Bell, CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)

  const fetchNotifications = () => {
    setLoading(true); setError('')
    api.get<Notification[]>('/notifications')
      .then(setNotifications).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifications() }, [])

  const markAllRead = async () => {
    setMarking(true)
    try {
      await api.patch('/notifications/read', {})
      fetchNotifications()
    } catch {} finally { setMarking(false) }
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Notificaciones</h1>
            <p className="text-sm text-ink-soft mt-1">{unread} sin leer</p>
          </div>
          {unread > 0 && (
            <Button variant="secondary" onClick={markAllRead} disabled={marking}>
              <CheckCheck size={16} /> Marcar todas leídas
            </Button>
          )}
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchNotifications} /> :
          notifications.length === 0 ? <EmptyState title="Sin notificaciones" /> :
          <div className="space-y-2">
            {notifications.map(n => (
              <Card key={n.id} className={n.read ? 'opacity-60' : ''}>
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.read ? 'bg-surface-2' : 'bg-accent-soft'}`}>
                    <Bell size={20} className={n.read ? 'text-ink-soft' : 'text-accent'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${n.read ? 'text-ink-soft' : 'text-ink font-medium'}`}>{n.message}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-accent" />}
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <Badge variant="info">{n.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      </div>
    </ProtectedRoute>
  )
}
