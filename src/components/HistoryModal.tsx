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

  if (eventDay.getTime() === today.getTime()) return `Today at ${timeStr}`
  if (eventDay.getTime() === yesterday.getTime()) return `Yesterday at ${timeStr}`

  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${dayStr} at ${timeStr}`
}

export function HistoryModal({ open, events, onClose }: Props) {
  if (!open) return null

  const recent = events.slice(0, 20)

  return (
    <div className="absolute inset-0 w-[320px] rounded-2xl border border-zinc-800 bg-zinc-900/98 backdrop-blur shadow-2xl p-4 flex flex-col z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-100">Feeding history</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
          <X size={14} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-0">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-3xl">😿</span>
            <p className="text-xs text-zinc-500">No feedings recorded yet.</p>
          </div>
        ) : (
          recent.map(event => (
            <div key={event.id} className="flex items-center gap-2 py-1.5 border-b border-zinc-800 last:border-0">
              <span className="text-base">🐾</span>
              <p className="text-xs text-zinc-300">{formatEventDate(event.timestamp)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
