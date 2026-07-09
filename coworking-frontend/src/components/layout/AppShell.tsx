'use client'

import { AuthProvider, useAuth } from '@/lib/auth-context'
import { Sidebar } from './Sidebar'
import { usePathname } from 'next/navigation'

function ShellInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const isPublic = pathname === '/login' || pathname === '/register' || pathname === '/'

  if (isPublic || !user) return <>{children}</>

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellInner>{children}</ShellInner>
    </AuthProvider>
  )
}
