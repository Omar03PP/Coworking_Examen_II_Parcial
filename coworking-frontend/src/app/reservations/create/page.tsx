'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import { api } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import type { Space } from '@/lib/types'

function CreateReservationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [form, setForm] = useState({
    spaceId: searchParams.get('spaceId') || '',
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
    reason: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [spacesLoading, setSpacesLoading] = useState(true)

  useEffect(() => {
    api.get<Space[]>('/spaces')
      .then(setSpaces).catch(() => {})
      .finally(() => setSpacesLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.spaceId) { setError('Selecciona un espacio'); return }
    if (!form.startTime || !form.endTime) { setError('Selecciona fecha y hora'); return }
    if (new Date(form.endTime) <= new Date(form.startTime)) { setError('La hora de fin debe ser posterior a la de inicio'); return }

    setError(''); setLoading(true)
    try {
      await api.post('/reservations', {
        spaceId: parseInt(form.spaceId),
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason || undefined,
      })
      router.push('/reservations')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear reserva')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Volver
      </button>
      <h1 className="text-2xl font-bold text-ink">Nueva Reserva</h1>

      <Card>
        <CardContent className="p-6">
          {spacesLoading ? <Loading /> : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select label="Espacio" value={form.spaceId} onChange={e => setForm({ ...form, spaceId: e.target.value })} required>
                <option value="">Selecciona un espacio</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name} - {s.location}</option>)}
              </Select>
              <Input label="Fecha y hora de inicio" type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
              <Input label="Fecha y hora de fin" type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
              <Input label="Motivo (opcional)" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              {error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Reservando...' : 'Reservar'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreateReservationPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading />}>
        <CreateReservationForm />
      </Suspense>
    </ProtectedRoute>
  )
}
