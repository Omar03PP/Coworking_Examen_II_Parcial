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
import { spaceTypeLabel } from '@/lib/utils'
import type { Space } from '@/lib/types'
import { Heart, Building2, MapPin, Users } from 'lucide-react'

export default function FavoritesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState<number | null>(null)

  const fetchFavorites = () => {
    setLoading(true); setError('')
    api.get<{ id: number; space: Space }[]>('/favorites')
      .then(data => setSpaces(data.map(f => f.space)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFavorites() }, [])

  const removeFavorite = async (spaceId: number) => {
    setToggling(spaceId)
    try { await api.post('/favorites/toggle', { spaceId }); fetchFavorites() }
    catch {} finally { setToggling(null) }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Favoritos</h1>
          <p className="text-sm text-ink-soft mt-1">Espacios que has marcado como favoritos</p>
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchFavorites} /> :
          spaces.length === 0 ? <EmptyState title="Sin favoritos" description="Explora espacios y márcalos como favoritos." /> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map(space => (
              <Card key={space.id}>
                <div className="h-40 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center relative">
                  <Building2 size={48} className="text-rose-400" />
                  <button
                    onClick={() => removeFavorite(space.id)}
                    disabled={toggling === space.id}
                    className="absolute top-3 right-3 p-2 bg-surface/80 rounded-full hover:bg-surface transition-colors"
                  >
                    <Heart size={18} className="text-danger fill-danger" />
                  </button>
                </div>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Link href={`/spaces/${space.id}`} className="font-semibold text-ink hover:text-accent">{space.name}</Link>
                    <Badge variant="info">{spaceTypeLabel(space.type)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-soft">
                    <span className="flex items-center gap-1"><MapPin size={12} />{space.location}</span>
                    <span className="flex items-center gap-1"><Users size={12} />Cap. {space.capacity}</span>
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
