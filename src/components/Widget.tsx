import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, List, Minus } from 'lucide-react'
import type { Cat, HungerState, Schedule } from '../types'
import { MESSAGE_BANK, resolveCatsToken } from '../lib/messages'
import { formatElapsed, formatTime, formatNextFeeding, getOverdueLabel } from '../lib/hunger'

type Props = {
  lastFed: number | null
  cats: Cat[]
  schedule: Schedule
  hungerState: HungerState
  onFeed: () => Promise<void>
  onSettings: () => void
  onHistory: () => void
  onMinimize: () => void
}

export function Widget({ lastFed, cats, schedule, hungerState, onFeed, onSettings, onHistory, onMinimize }: Props) {
  const [fed, setFed] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const variants = MESSAGE_BANK[hungerState]
    setMsgIndex(Math.floor(Math.random() * variants.length))
  }, [hungerState])

  const handleFeed = async () => {
    setFed(true)
    await onFeed()
    setTimeout(() => setFed(false), 1200)
  }

  const msg = MESSAGE_BANK[hungerState][msgIndex]
  const headline = resolveCatsToken(msg.headline, cats)
  const subtext = msg.subtext ? resolveCatsToken(msg.subtext, cats) : undefined
  const isFed = hungerState === 'fed'
  const overdueLabel = lastFed ? getOverdueLabel(lastFed, schedule) : ''

  const bottomIcons = (
    <div
      className="flex items-center gap-1 mt-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button
        onClick={onSettings}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        title="Settings"
      >
        <SettingsIcon size={14} />
      </button>
      <button
        onClick={onHistory}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        title="History"
      >
        <List size={14} />
      </button>
      <button
        onClick={onMinimize}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 ml-auto"
        title="Minimize"
      >
        <Minus size={14} />
      </button>
    </div>
  )

  return (
    <div
      className="w-[320px] h-[280px] rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur shadow-2xl p-4 flex flex-col"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {isFed && lastFed ? (
        <div className="flex flex-col h-full">
          {/* Cat badges */}
          <div className="flex gap-1.5 flex-wrap" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {cats.map(cat => (
              <span
                key={cat.id}
                className="bg-zinc-800 text-zinc-300 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </span>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-3 mt-2">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Last fed</p>
              <p className="text-sm text-zinc-200">
                {formatTime(lastFed)} · {formatElapsed(lastFed)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Next feeding</p>
              <p className="text-sm text-zinc-200">{formatNextFeeding(lastFed, schedule)}</p>
            </div>
          </div>

          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button
              onClick={handleFeed}
              className={`w-full h-11 rounded-xl text-sm font-semibold text-white transition-colors ${
                fed ? 'bg-green-500 cursor-default' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {fed ? '✓ Fed!' : 'FED THEM'}
            </button>
          </div>

          {bottomIcons}
        </div>
      ) : (
        <div key={hungerState} className="flex flex-col h-full state-transition">
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <span className="text-5xl text-center block">{msg.emoji}</span>
            <p className="text-sm font-medium text-zinc-100 text-center leading-snug mt-2">
              {headline}
            </p>
            {subtext && (
              <p className="text-xs text-zinc-400 text-center leading-relaxed">{subtext}</p>
            )}
            {overdueLabel && (
              <p className="text-xs text-orange-400 font-medium text-center tracking-widest uppercase mt-2">
                — {overdueLabel} —
              </p>
            )}
          </div>

          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button
              onClick={handleFeed}
              className={`w-full h-11 rounded-xl text-sm font-semibold text-white transition-colors ${
                fed ? 'bg-green-500 cursor-default' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {fed ? '✓ Fed!' : 'FED THEM'}
            </button>
          </div>

          {bottomIcons}
        </div>
      )}
    </div>
  )
}
