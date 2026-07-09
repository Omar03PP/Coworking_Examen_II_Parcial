import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && adminOnly && user?.role !== 'ADMIN') router.push('/dashboard')
  }, [loading, user, adminOnly, router])

  if (loading || !user) return <Loading />
  if (adminOnly && user.role !== 'ADMIN') return null
  return <>{children}</>
}
