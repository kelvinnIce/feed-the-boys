import { X } from 'lucide-react'
import type { FeedingEvent } from '../types'

type Props = {
  open: boolean
  events: FeedingEvent[]
  onClose: () => void
}

function formatEventDate(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (eventDay.getTime() === today.getTime()) return `Today · ${timeStr}`
  if (eventDay.getTime() === yesterday.getTime()) return `Yesterday · ${timeStr}`

  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${dayStr} · ${timeStr}`
}

export function HistoryModal({ open, events, onClose }: Props) {
  if (!open) return null

  const recent = events.slice(0, 20)

  return (
    <div
      className="absolute inset-0 rounded-2xl flex flex-col z-20"
      style={{
        background: '#0f0f0f',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
        <p className="text-sm font-semibold text-white tracking-wide">Feeding history</p>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors rounded-full p-1.5 hover:bg-white/10"
        >
          <X size={15} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
            <span className="text-3xl">😿</span>
            <p className="text-sm text-white/40">No feedings recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {recent.map((event, i) => (
              <div
                key={event.id}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
              >
                <span className="text-base leading-none">🐾</span>
                <p className="text-sm text-white/80">{formatEventDate(event.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
