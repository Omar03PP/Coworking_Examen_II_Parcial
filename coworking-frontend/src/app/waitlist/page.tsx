'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatDate, formatTime, spaceTypeLabel } from '@/lib/utils'
import type { WaitlistEntry, Space } from '@/lib/types'
import { ListOrdered, Trash2, Building2 } from 'lucide-react'

export default function WaitlistPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [joinForm, setJoinForm] = useState({ spaceId: '', startTime: '', endTime: '' })
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [leaving, setLeaving] = useState<number | null>(null)

  const fetchEntries = () => {
    setLoading(true); setError('')
    api.get<WaitlistEntry[]>('/waitlist/me')
      .then(setEntries).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEntries()
    api.get<Space[]>('/spaces').then(setSpaces).catch(() => {})
  }, [])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinForm.spaceId || !joinForm.startTime || !joinForm.endTime) {
      setJoinError('Completa todos los campos'); return
    }
    setJoinError(''); setJoinLoading(true)
    try {
      await api.post('/waitlist', {
        spaceId: parseInt(joinForm.spaceId),
        startTime: joinForm.startTime,
        endTime: joinForm.endTime,
      })
      setShowJoin(false)
      setJoinForm({ spaceId: '', startTime: '', endTime: '' })
      fetchEntries()
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : 'Error al unirse')
    } finally { setJoinLoading(false) }
  }

  const handleLeave = async (id: number) => {
    if (!confirm('¿Salir de la lista de espera?')) return
    setLeaving(id)
    try { await api.delete(`/waitlist/${id}`); fetchEntries() }
    catch { setError('Error al salir') }
    finally { setLeaving(null) }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Lista de Espera</h1>
            <p className="text-sm text-ink-soft mt-1">Recibe notificaciones cuando un espacio se libere</p>
          </div>
          <Button onClick={() => setShowJoin(!showJoin)}>
            {showJoin ? 'Cancelar' : 'Unirse a lista'}
          </Button>
        </div>

        {showJoin && (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleJoin} className="space-y-4 max-w-md">
                <Select label="Espacio" value={joinForm.spaceId} onChange={e => setJoinForm({ ...joinForm, spaceId: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Input label="Fecha y hora de inicio" type="datetime-local" value={joinForm.startTime} onChange={e => setJoinForm({ ...joinForm, startTime: e.target.value })} required />
                <Input label="Fecha y hora de fin" type="datetime-local" value={joinForm.endTime} onChange={e => setJoinForm({ ...joinForm, endTime: e.target.value })} required />
                {joinError && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{joinError}</p>}
                <Button type="submit" disabled={joinLoading}>{joinLoading ? 'Uniendo...' : 'Unirse'}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchEntries} /> :
          entries.length === 0 ? <EmptyState title="Sin espera" description="No estás en ninguna lista de espera." /> :
          <div className="grid grid-cols-1 gap-4">
            {entries.map(e => (
              <Card key={e.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
                      <Building2 size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{e.space?.name || `Espacio #${e.spaceId}`}</p>
                      <p className="text-sm text-ink-soft">{formatDate(e.startTime)} · {formatTime(e.startTime)} - {formatTime(e.endTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="purple">{e.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleLeave(e.id)} disabled={leaving === e.id}>
                      <Trash2 size={16} className="text-danger" />
                    </Button>
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
