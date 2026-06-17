import { useState, useEffect } from 'react'
import type { Cat, FeedingEvent, Schedule } from '../types'

const DEFAULT_CATS: Cat[] = [
  { id: '1', name: 'Momo', emoji: '🐈' },
  { id: '2', name: 'Loki', emoji: '🐈' },
]

const DEFAULT_SCHEDULE: Schedule = { type: 'fixed', times: ['08:00', '18:00'] }

export function useFeedingStore() {
  const [lastFed, setLastFed] = useState<number | null>(null)
  const [cats, setCats] = useState<Cat[]>(DEFAULT_CATS)
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE)
  const [events, setEvents] = useState<FeedingEvent[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      window.electronAPI.store.get('lastFed'),
      window.electronAPI.store.get('cats'),
      window.electronAPI.store.get('schedule'),
      window.electronAPI.store.get('events'),
    ]).then(([lf, c, s, e]) => {
      setLastFed((lf as number | null) ?? null)
      setCats((c as Cat[] | null) ?? DEFAULT_CATS)
      setSchedule((s as Schedule | null) ?? DEFAULT_SCHEDULE)
      setEvents((e as FeedingEvent[] | null) ?? [])
      setLoaded(true)
    })
  }, [])

  const logFeeding = async () => {
    const event: FeedingEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      fedBy: 'you',
    }
    const newEvents = [event, ...events].slice(0, 50)
    setLastFed(event.timestamp)
    setEvents(newEvents)
    await window.electronAPI.store.set('lastFed', event.timestamp)
    await window.electronAPI.store.set('events', newEvents)
  }

  const saveCats = async (newCats: Cat[]) => {
    setCats(newCats)
    await window.electronAPI.store.set('cats', newCats)
  }

  const saveSchedule = async (newSchedule: Schedule) => {
    setSchedule(newSchedule)
    await window.electronAPI.store.set('schedule', newSchedule)
  }

  return { lastFed, cats, schedule, events, loaded, logFeeding, saveCats, saveSchedule }
}
