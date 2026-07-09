'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { User } from '@/lib/types'
import { Users, Trash2 } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = () => {
    setLoading(true); setError('')
    api.get<User[]>('/users')
      .then(setUsers).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const deleteUser = async (id: number) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    try { await api.delete(`/users/${id}`); fetchUsers() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Usuarios</h1>
          <p className="text-sm text-ink-soft mt-1">Gestión de usuarios del sistema</p>
        </div>

        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={fetchUsers} /> :
          <div className="grid grid-cols-1 gap-3">
            {users.map(u => (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-ink text-sm font-medium">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{u.name}</p>
                      <p className="text-sm text-ink-soft">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={u.role === 'ADMIN' ? 'bg-accent-soft text-accent-dim' : 'bg-surface-2 text-ink-soft'}>{u.role}</Badge>
                    <Badge className={u.status ? 'bg-accent-soft text-accent-dim' : 'bg-danger-soft text-danger'}>
                      {u.status ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <p className="text-xs text-ink-soft">{formatDate(u.createdAt)}</p>
                    {u.role !== 'ADMIN' && (
                      <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)}>
                        <Trash2 size={16} className="text-danger" />
                      </Button>
                    )}
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
