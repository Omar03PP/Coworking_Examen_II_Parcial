'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard, Building2, CalendarCheck, Star, Heart, Bell,
  ListOrdered, Users, ClipboardList, LogOut, Menu, X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { href: '/spaces', label: 'Espacios', icon: Building2 },
  { href: '/reservations', label: 'Mis Reservas', icon: CalendarCheck },
  { href: '/reservations/admin', label: 'Todas las Reservas', icon: ClipboardList, adminOnly: true },
  { href: '/waitlist', label: 'Lista de Espera', icon: ListOrdered },
  { href: '/favorites', label: 'Favoritos', icon: Heart },
  { href: '/reviews', label: 'Reseñas', icon: Star },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/users', label: 'Usuarios', icon: Users, adminOnly: true },
  { href: '/activity-logs', label: 'Actividad', icon: ClipboardList, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter(i => !i.adminOnly || user?.role === 'ADMIN')

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-surface border border-line shadow-theme text-ink"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-line flex flex-col transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-line">
          <Link href="/dashboard" className="text-lg font-bold text-accent">
            Coworking
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-ink-soft">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-soft text-accent-dim'
                    : 'text-ink-soft hover:text-ink hover:bg-surface-2',
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-ink text-sm font-medium">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-soft truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-ink-soft hover:text-danger hover:bg-danger-soft transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
