'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Review } from '@/lib/types'
import { Star, ArrowLeft } from 'lucide-react'

function ReviewsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const spaceIdParam = searchParams.get('spaceId')

  const [spaceId, setSpaceId] = useState(spaceIdParam || '')
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<{ average: number; total: number; distribution: Record<number, number> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = () => {
    if (!spaceId) return
    setLoading(true); setError('')
    Promise.all([
      api.get<Review[]>(`/spaces/${spaceId}/reviews`),
      api.get<{ average: number; total: number; distribution: Record<number, number> }>(`/spaces/${spaceId}/reviews/stats`),
    ]).then(([r, s]) => { setReviews(r); setStats(s) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (spaceIdParam) fetchReviews() }, [])

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div>
        <h1 className="text-2xl font-bold text-ink">Reseñas</h1>
        <p className="text-sm text-ink-soft mt-1">Consulta las reseñas de cada espacio</p>
      </div>

      <div className="flex gap-3 items-end max-w-md">
        <Input label="ID del Espacio" value={spaceId} onChange={e => setSpaceId(e.target.value)} placeholder="Ej: 1" />
        <Button onClick={fetchReviews} disabled={!spaceId}>Ver reseñas</Button>
      </div>

      {stats && (
        <Card>
          <CardContent className="flex items-center gap-6 py-5">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{stats.average.toFixed(1)}</p>
              <p className="text-xs text-ink-soft">Promedio</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={20} className={n <= Math.round(stats.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-sm text-ink-soft">{stats.total} reseñas</p>
          </CardContent>
        </Card>
      )}

      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchReviews} /> :
        reviews.length === 0 && spaceId ? <EmptyState title="Sin reseñas" description="Este espacio no tiene reseñas aún." /> :
        <div className="grid grid-cols-1 gap-4">
          {reviews.map(r => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{r.user?.name || 'Usuario'}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={14} className={n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-ink-soft mt-2">{r.comment}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading />}>
        <ReviewsContent />
      </Suspense>
    </ProtectedRoute>
  )
}
