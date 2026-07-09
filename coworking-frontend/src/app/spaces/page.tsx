'use client'

import { useEffect, useState } from 'react'
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
import { spaceTypeLabel } from '@/lib/utils'
import type { Space } from '@/lib/types'
import { Building2, Plus, Search, MapPin, Users, Monitor, Presentation } from 'lucide-react'

const typeTabs = [
  { value: '', label: 'Todos', icon: Building2 },
  { value: 'SALA', label: 'Salas', icon: Users },
  { value: 'ESCRITORIO', label: 'Escritorios', icon: Monitor },
  { value: 'AUDITORIO', label: 'Auditorios', icon: Presentation },
]

const amenityOptions = ['Wifi', 'Proyector', 'Café', 'Pizarra', 'Aire acondicionado', 'Ventanal', 'Sonido', 'Monitor']

export default function SpacesPage() {
  const { user } = useAuth()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [amenityFilter, setAmenityFilter] = useState<string[]>([])

  const toggleAmenity = (name: string) => {
    setAmenityFilter(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  const fetchSpaces = () => {
    setLoading(true); setError('')
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (amenityFilter.length) params.set('amenities', amenityFilter.join(','))
    api.get<Space[]>(`/spaces?${params}`)
      .then(setSpaces).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSpaces() }, [type, amenityFilter])

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Explorar espacios</h1>
            <p className="text-sm text-ink-soft mt-1">Encuentra el espacio perfecto para tu actividad</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/spaces/create">
              <Button><Plus size={16} /> Nuevo Espacio</Button>
            </Link>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-surface-2 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
              placeholder="Buscar espacios..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchSpaces()}
            />
          </div>
          <Button variant="secondary" onClick={fetchSpaces}>Buscar</Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {typeTabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                type === value
                  ? 'bg-accent text-ink shadow-theme'
                  : 'bg-surface text-ink-soft border border-line hover:border-accent hover:text-accent-dim'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {amenityOptions.map(name => (
            <button
              key={name}
              onClick={() => toggleAmenity(name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                amenityFilter.includes(name)
                  ? 'bg-accent-soft text-accent-dim border border-accent'
                  : 'bg-surface-2 text-ink-soft border border-line hover:border-accent'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchSpaces} /> :
          spaces.length === 0 ? <EmptyState title="Sin espacios" description="No se encontraron espacios con esos filtros." /> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map(space => (
              <Link key={space.id} href={`/spaces/${space.id}`}>
                <Card className="h-full hover:bg-surface-2 transition-all cursor-pointer group">
                  <div className="h-40 bg-gradient-to-br from-accent-soft to-surface-2 flex items-center justify-center relative overflow-hidden">
                    <Building2 size={48} className="text-accent opacity-50 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-ink">{space.name}</h3>
                      <Badge variant="info">{spaceTypeLabel(space.type)}</Badge>
                    </div>
                    <p className="text-sm text-ink-soft line-clamp-2">{space.description || 'Sin descripción'}</p>
                    <div className="flex items-center gap-4 text-xs text-ink-soft">
                      <span className="flex items-center gap-1"><MapPin size={12} />{space.location}</span>
                      <span className="flex items-center gap-1"><Users size={12} />Cap. {space.capacity}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        }
      </div>
    </ProtectedRoute>
  )
}
