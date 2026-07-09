'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-soft via-paper to-surface-2 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-accent">
              Coworking
            </h1>
            <p className="text-sm text-ink-soft mt-1">Crea tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" />
            <Input label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@ejemplo.com" />
            <Input label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" />
            {error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-accent hover:text-accent-dim font-medium">Inicia sesión</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
