'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { Loading } from '@/components/ui/Loading'

interface RawSlot {
  hour: number
  available: boolean
}

interface BookingPanelProps {
  spaceId: number
  spaceName: string
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function BookingPanel({ spaceId }: BookingPanelProps) {
  const today = toDateStr(new Date())
  const [date, setDate] = useState(today)
  const [slots, setSlots] = useState<RawSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [reserving, setReserving] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const fetchSlots = () => {
    setSlotsLoading(true)
    setSelectedHour(null)
    setMessage(null)
    api.get<RawSlot[] | { value: RawSlot[] }>(`/spaces/${spaceId}/availability?date=${date}`)
      .then(res => setSlots(Array.isArray(res) ? res : (res as any)?.value ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }

  useEffect(() => { fetchSlots() }, [date, spaceId])

  const handleReserve = async () => {
    if (selectedHour === null) return
    setReserving(true)
    setMessage(null)
    const pad = String(selectedHour).padStart(2, '0')
    const startTime = `${date}T${pad}:00:00.000Z`
    const endTime = `${date}T${pad}:00:00.000Z`
    const end = new Date(endTime)
    end.setHours(end.getHours() + 1)
    try {
      await api.post('/reservations', {
        spaceId,
        startTime,
        endTime: end.toISOString(),
      })
      setMessage({ text: 'Reserva confirmada', ok: true })
      setSelectedHour(null)
      fetchSlots()
    } catch (e: unknown) {
      setMessage({ text: e instanceof Error ? e.message : 'Error al reservar', ok: false })
    } finally {
      setReserving(false)
    }
  }

  return (
    <div className="bg-surface border border-line rounded-2xl shadow-theme p-6 sticky top-24 space-y-5">
      {message && (
        <div className={`text-sm px-3 py-2 rounded-lg text-center ${message.ok ? 'bg-accent-soft text-accent-dim' : 'bg-danger-soft text-danger'}`}>
          {message.text}
        </div>
      )}

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-ink">L 140</span>
          <span className="text-sm text-ink-soft">/ hora</span>
        </div>
      </div>

      <div>
        <span className="block text-xs font-mono font-semibold text-ink-soft uppercase tracking-wider mb-2">Fecha</span>
        <div className="flex items-center gap-2 border border-line rounded-xl bg-surface-2 px-3 py-2.5 text-sm text-ink">
          <CalendarDays size={16} className="text-ink-soft shrink-0" />
          <input
            type="date"
            value={date}
            min={today}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent border-none outline-none text-ink w-full"
          />
        </div>
      </div>

      <div>
        <span className="block text-xs font-mono font-semibold text-ink-soft uppercase tracking-wider mb-2">Horario disponible</span>
        {slotsLoading ? (
          <Loading text="Cargando horarios..." />
        ) : slots.length === 0 ? (
          <p className="text-sm text-ink-soft text-center py-4">Sin horarios disponibles</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {slots.map(s => {
              const isSelected = selectedHour === s.hour
              return (
                <button
                  key={s.hour}
                  disabled={!s.available}
                  onClick={() => setSelectedHour(s.hour)}
                  className={`py-2.5 px-2 rounded-xl text-sm text-center font-mono transition-all ${
                    isSelected
                      ? 'bg-accent text-ink font-bold shadow-theme'
                      : s.available
                        ? 'bg-surface-2 text-ink hover:bg-accent-soft hover:text-accent-dim cursor-pointer'
                        : 'text-ink-soft line-through opacity-40 cursor-not-allowed'
                  }`}
                >
                  {String(s.hour).padStart(2, '0')}:00
                </button>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleReserve}
        disabled={selectedHour === null || reserving}
        className="w-full flex items-center justify-center gap-2 bg-accent text-ink font-bold py-3 px-4 rounded-xl hover:bg-accent-dim transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check size={18} />
        {reserving ? 'Reservando...' : 'Reservar este horario'}
      </button>
    </div>
  )
}
