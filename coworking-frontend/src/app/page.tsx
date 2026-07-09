'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { api } from '@/lib/api'
import { spaceTypeLabel } from '@/lib/utils'
import type { Space } from '@/lib/types'
import { Building2, MapPin, Users, ArrowRight } from 'lucide-react'

const typeTabs = [
  { value: '', label: 'Todos' },
  { value: 'SALA', label: 'Salas' },
  { value: 'ESCRITORIO', label: 'Escritorios' },
  { value: 'AUDITORIO', label: 'Auditorios' },
]

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [type, setType] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
      return
    }
    api.get<Space[]>(`/spaces?${type ? `type=${type}` : ''}`)
      .then(setSpaces).catch(() => {})
  }, [authLoading, user, router, type])

  if (authLoading) return <Loading />

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-accent">
            Coworking
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-ink-soft hover:text-ink font-medium">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm bg-accent text-ink px-4 py-2 rounded-xl hover:bg-accent-dim font-medium transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-ink leading-tight">
            Encuentra tu <span className="text-accent">espacio ideal</span>
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            {spaces.length} espacios disponibles hoy en el campus. Filtra por tipo o por lo que necesites en la sala.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            {typeTabs.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === value
                    ? 'bg-accent text-ink shadow-theme'
                    : 'bg-surface text-ink-soft border border-line hover:border-accent hover:text-accent-dim'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map(space => (
            <Link key={space.id} href="/register">
              <Card className="h-full hover:bg-surface-2 transition-all cursor-pointer group">
                <div className="h-40 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-accent-soft to-surface-2">
                  <Building2 size={48} className="text-accent opacity-50 group-hover:scale-110 transition-transform" />
                </div>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-ink">{space.name}</h3>
                    <Badge variant="info">{spaceTypeLabel(space.type)}</Badge>
                  </div>
                  <p className="text-sm text-ink-soft line-clamp-2">{space.description}</p>
                  <div className="flex items-center gap-4 text-xs text-ink-soft">
                    <span className="flex items-center gap-1"><MapPin size={12} />{space.location}</span>
                    <span className="flex items-center gap-1"><Users size={12} />Cap. {space.capacity}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {spaces.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dim"
            >
              Ver todos los espacios <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
