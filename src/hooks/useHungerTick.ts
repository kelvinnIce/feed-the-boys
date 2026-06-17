import { useState, useEffect, useRef } from 'react'
import type { Cat, HungerState, Schedule } from '../types'
import { getHungerState } from '../lib/hunger'
import { fireNotification } from '../lib/notifications'

export function useHungerTick(lastFed: number | null, schedule: Schedule, cats: Cat[]) {
  const [hungerState, setHungerState] = useState<HungerState>('unknown')
  const prevStateRef = useRef<HungerState>('unknown')

  useEffect(() => {
    const tick = () => {
      const newState = getHungerState(lastFed, schedule)
      const prevState = prevStateRef.current

      if (
        (prevState === 'fed' || prevState === 'unknown') &&
        newState !== 'fed' &&
        newState !== 'unknown'
      ) {
        fireNotification(newState, cats)
      }

      prevStateRef.current = newState
      setHungerState(newState)
    }

    tick()
    const id = setInterval(tick, 60_000)

    const handleFocus = () => {
      const newState = getHungerState(lastFed, schedule)
      prevStateRef.current = newState
      setHungerState(newState)
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(id)
      window.removeEventListener('focus', handleFocus)
    }
  }, [lastFed, schedule, cats])

  return { hungerState }
}
