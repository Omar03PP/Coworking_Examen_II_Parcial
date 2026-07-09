'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { api } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

export default function CreateSpacePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', location: '', capacity: 1, type: 'SALA', imageUrl: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = { name: form.name, location: form.location, capacity: form.capacity, type: form.type }
      if (form.description) body.description = form.description
      if (form.imageUrl) body.imageUrl = form.imageUrl
      await api.post('/spaces', body)
      router.push('/spaces')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear espacio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="text-2xl font-bold text-ink">Nuevo Espacio</h1>

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
              <Input label="URL de imagen (opcional)" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              {error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Espacio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
