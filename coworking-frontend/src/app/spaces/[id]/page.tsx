'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { BookingPanel } from '@/components/spaces/BookingPanel'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { spaceTypeLabel, formatDate } from '@/lib/utils'
import type { Space, Review, ReviewStats } from '@/lib/types'
import {
  ArrowLeft, Building2, MapPin, Users, Heart, Star,
  Wifi, Monitor, Coffee, MonitorDown, Speaker, AirVent, Sun, Edit,
} from 'lucide-react'

const amenityIconMap: Record<string, React.ElementType> = {
  wifi: Wifi, proyector: MonitorDown, pizarra: Monitor, café: Coffee,
  sonido: Speaker, 'aire acondicionado': AirVent, ventanal: Sun, monitor: Monitor,
}

export default function SpaceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ average: 0, count: 0 })
  const [favorites, setFavorites] = useState<number[]>([])
  const [favToggling, setFavToggling] = useState(false)

  const fetchSpace = useCallback(() => {
    setLoading(true); setError('')
    api.get<Space>(`/spaces/${id}`)
      .then(setSpace).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const fetchReviews = useCallback(() => {
    api.get<Review[]>(`/spaces/${id}/reviews`).then(setReviews).catch(() => {})
    api.get<ReviewStats>(`/spaces/${id}/reviews/stats`).then(setStats).catch(() => {})
  }, [id])

  const fetchFavorites = useCallback(() => {
    api.get<{ spaceId: number }[]>('/favorites')
      .then(favs => setFavorites(favs.map(f => f.spaceId)))
      .catch(() => {})
  }, [])

  useEffect(() => { fetchSpace(); fetchReviews(); fetchFavorites() }, [fetchSpace, fetchReviews, fetchFavorites])

  const toggleFavorite = async () => {
    if (favToggling) return
    setFavToggling(true)
    const wasFav = favorites.includes(Number(id))
    setFavorites(prev => wasFav ? prev.filter(f => f !== Number(id)) : [...prev, Number(id)])
    try {
      await api.post('/favorites/toggle', { spaceId: Number(id) })
    } catch {
      setFavorites(prev => wasFav ? [...prev, Number(id)] : prev.filter(f => f !== Number(id)))
    } finally {
      setFavToggling(false)
    }
  }

  const isFav = favorites.includes(Number(id))

  if (loading) return <ProtectedRoute><Loading /></ProtectedRoute>
  if (error) return <ProtectedRoute><ErrorState message={error} onRetry={fetchSpace} /></ProtectedRoute>
  if (!space) return null

  return (
    <ProtectedRoute>
      <Link href="/spaces" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-4">
        <ArrowLeft size={15} /> Volver a explorar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-7">
          <div className="h-56 md:h-72 rounded-2xl bg-gradient-to-br from-accent-soft to-surface-2 flex items-center justify-center relative overflow-hidden">
            <Building2 size={56} className="text-accent opacity-40" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-ink">{space.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-ink-soft">
                <Badge variant="info">{spaceTypeLabel(space.type)}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {space.id !== undefined && (
                <button
                  onClick={toggleFavorite}
                  className="p-2 rounded-xl hover:bg-surface-2 transition-colors"
                >
                  <Heart size={22} className={isFav ? 'text-danger fill-danger' : 'text-ink-soft'} />
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <Link href={`/spaces/${space.id}/edit`}>
                  <Button variant="secondary" size="sm"><Edit size={14} /> Editar</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5"><MapPin size={15} />{space.location}</span>
            <span className="flex items-center gap-1.5"><Users size={15} />Capacidad: {space.capacity} personas</span>
          </div>

          {space.description && (
            <p className="text-sm text-ink-soft leading-relaxed max-w-prose">{space.description}</p>
          )}

          {space.amenities && space.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink mb-3">Comodidades</h3>
              <div className="flex flex-wrap gap-2">
                {space.amenities.map(a => {
                  const Icon = a.icon ? amenityIconMap[a.icon.toLowerCase()] : undefined
                  return (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-line rounded-lg text-sm text-ink-soft"
                    >
                      {Icon && <Icon size={14} className="text-accent" />}
                      {a.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Reseñas</h3>
            {stats.count > 0 && (
              <Card className="mb-4">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-ink">{stats.average.toFixed(1)}</span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          size={14}
                          className={n <= Math.round(stats.average) ? 'text-gold fill-gold' : 'text-line'}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-ink-soft">
                    <span className="font-semibold text-ink">{stats.count}</span> reseña{stats.count !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-ink-soft text-center py-8">Este espacio aún no tiene reseñas</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-line pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-ink text-xs font-bold shrink-0">
                        {r.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-ink truncate">{r.user?.name || 'Anónimo'}</span>
                          <span className="text-xs text-ink-soft whitespace-nowrap">{formatDate(r.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star
                              key={n}
                              size={12}
                              className={n <= r.rating ? 'text-gold fill-gold' : 'text-line'}
                            />
                          ))}
                        </div>
                        {r.comment && (
                          <p className="text-sm text-ink-soft mt-1.5">{r.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingPanel spaceId={Number(id)} spaceName={space.name} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
