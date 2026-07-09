'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { api } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import type { Space } from '@/lib/types'

export default function EditSpacePage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', location: '', capacity: 1, type: 'SALA', imageUrl: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Space>(`/spaces/${id}`)
      .then(s => setForm({ name: s.name, description: s.description || '', location: s.location, capacity: s.capacity, type: s.type, imageUrl: s.imageUrl || '' }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const body: Record<string, unknown> = {}
      if (form.name) body.name = form.name
      if (form.description) body.description = form.description
      if (form.location) body.location = form.location
      if (form.capacity) body.capacity = form.capacity
      if (form.type) body.type = form.type
      if (form.imageUrl) body.imageUrl = form.imageUrl
      await api.patch(`/spaces/${id}`, body)
      router.push(`/spaces/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally { setSaving(false) }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href={`/spaces/${id}`} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 className="text-2xl font-bold text-ink">Editar Espacio</h1>

        {loading ? <Loading /> : error && !form.name ? <ErrorState message={error} /> : (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <Input label="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <Input label="Ubicación" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                <Input label="Capacidad" type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} required />
                <Select label="Tipo" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                  <option value="SALA">Sala de reuniones</option>
                  <option value="ESCRITORIO">Escritorio</option>
                  <option value="AUDITORIO">Auditorio</option>
                </Select>
                <Input label="URL de imagen" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                {error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
