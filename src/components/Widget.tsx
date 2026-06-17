import { useState, useEffect, useRef } from 'react'
import { Settings as SettingsIcon, List, Minus } from 'lucide-react'
import type { Cat, HungerState, Schedule } from '../types'
import { CatDisplay } from './CatDisplay'
import { formatNextFeeding, getNextFeedingTime, getOverdueLabel } from '../lib/hunger'
import catWaiting from '../assets/cat-mood/cat-waiting.png'

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

const GOLDEN_BG = [
  'radial-gradient(circle at 13% 46%, rgba(150,85,0,0.22) 8px, transparent 9px)',
  'radial-gradient(circle at 83% 63%, rgba(150,85,0,0.14) 5px, transparent 6px)',
  'linear-gradient(180deg, #FFE870 0%, #FFD020 45%, #EFA000 100%)',
].join(', ')

const GREEN_BG = 'linear-gradient(180deg, #78EF85 0%, #4CC85A 45%, #38A848 100%)'

function FeedButton({
  fed,
  onClick,
}: {
  fed: boolean
  onClick: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const isDown = pressed && !fed

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: '100%',
        height: '50px',
        borderRadius: '13px',
        position: 'relative',
        overflow: 'hidden',
        fontWeight: '700',
        fontSize: '15px',
        color: fed ? '#1A5C28' : '#7B4200',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '0.4px',
        cursor: fed ? 'default' : 'pointer',
        border: 'none',
        outline: 'none',
        background: fed ? GREEN_BG : GOLDEN_BG,
        boxShadow: fed
          ? `0 ${isDown ? 1 : 4}px 0 #1F7830, 0 ${isDown ? 2 : 6}px 10px rgba(0,0,0,0.25)`
          : `0 ${isDown ? 1 : 5}px 0 #A06800, 0 ${isDown ? 2 : 8}px 14px rgba(0,0,0,0.3)`,
        transform: isDown ? 'translateY(4px)' : fed ? 'translateY(1px)' : 'translateY(0)',
        transition: 'transform 0.06s ease, box-shadow 0.06s ease',
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
    >
      {/* Glossy highlight */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: '6%',
          width: '88%',
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          pointerEvents: 'none',
        }}
      />
      {fed ? '✓ Fed!' : 'Fed the cats'}
    </button>
  )
}

export function Widget({
  lastFed,
  cats,
  schedule,
  hungerState,
  onFeed,
  onSettings,
  onHistory,
  onMinimize,
}: Props) {
  const [fed, setFed] = useState(false)
  const [copyIndex, setCopyIndex] = useState(0)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rotate copy every 5-7 minutes while cats haven't been fed
  useEffect(() => {
    if (hungerState === 'fed') return
    const delay = (5 + Math.random() * 2) * 60 * 1000
    copyTimerRef.current = setTimeout(() => setCopyIndex(i => i + 1), delay)
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [copyIndex, hungerState])

  const handleFeed = async () => {
    if (fed) return
    setFed(true)
    await onFeed()
    setTimeout(() => setFed(false), 1200)
  }

  const isFed = hungerState === 'fed'
  const overdueLabel = lastFed ? getOverdueLabel(lastFed, schedule) : ''

  // Split "4:00 PM · in 1h 54m" → ["4:00 PM", "in 1h 54m"] for pill rendering
  const nextFeedingText = lastFed ? formatNextFeeding(lastFed, schedule) : ''
  const [nextTime, nextCountdown] = nextFeedingText.split(' · ')
  const nextFeedingTs = lastFed ? getNextFeedingTime(lastFed, schedule) : null
  const isUpcoming = nextFeedingTs ? nextFeedingTs > Date.now() : false

  const iconClass = isFed
    ? 'text-zinc-400 hover:text-zinc-700'
    : 'text-zinc-500 hover:text-zinc-300'

  const bottomIcons = (
    <div
      className="flex items-center gap-1 mt-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button onClick={onSettings} className={`${iconClass} transition-colors p-1`} title="Settings">
        <SettingsIcon size={14} />
      </button>
      <button onClick={onHistory} className={`${iconClass} transition-colors p-1`} title="History">
        <List size={14} />
      </button>
      <button onClick={onMinimize} className={`${iconClass} transition-colors p-1 ml-auto`} title="Minimize">
        <Minus size={14} />
      </button>
    </div>
  )

  return (
    <div
      className={`w-[320px] h-[280px] rounded-2xl border shadow-2xl p-4 flex flex-col backdrop-blur transition-colors duration-300 ${
        isFed && lastFed
          ? 'bg-white border-zinc-200'
          : 'bg-zinc-900/95 border-zinc-800'
      }`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {isFed && lastFed ? (
        /* Fed state — illustration layout with next feeding pill */
        <div className="flex flex-col h-full items-center">
          {/* Next feeding pill */}
          <div
            className="bg-zinc-900 rounded-2xl px-5 py-2 text-center w-full"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none mb-0.5">
              Next Feeding
            </p>
            <p className="text-sm font-bold text-white leading-tight flex items-center justify-center gap-1.5">
              <span>{nextTime}</span>
              <span className="text-white/40">·</span>
              {isUpcoming && (
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{nextCountdown}</span>
            </p>
          </div>

          {/* Cat illustration */}
          <div
            className="flex-1 flex items-center justify-center"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <img
              src={catWaiting}
              alt=""
              style={{ height: '138px', objectFit: 'contain' }}
            />
          </div>

          <div className="w-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <FeedButton fed={fed} onClick={handleFeed} />
          </div>
          {bottomIcons}
        </div>
      ) : (
        /* Hungry / unknown — illustration layout */
        <div key={hungerState} className="flex flex-col h-full state-transition">
          <div
            className="flex-1 flex flex-col items-center justify-center"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <CatDisplay state={hungerState} copyIndex={copyIndex} />
            {overdueLabel && (
              <p className="text-xs text-orange-400 font-medium tracking-widest uppercase mt-1">
                {overdueLabel}
              </p>
            )}
          </div>

          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <FeedButton fed={fed} onClick={handleFeed} />
          </div>
          {bottomIcons}
        </div>
      )}
    </div>
  )
}
