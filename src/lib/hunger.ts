import type { HungerState, Schedule } from '../types'

export function getNextFeedingTime(lastFedAt: number, schedule: Schedule): number {
  if (schedule.type === 'interval') {
    if (schedule.hours <= 0) return lastFedAt
    return lastFedAt + schedule.hours * 3_600_000
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const candidates: number[] = []

  for (const time of schedule.times) {
    const [h, m] = time.split(':').map(Number)

    const todayMs = today.getTime()
    const todayTime = todayMs + h * 3_600_000 + m * 60_000
    if (todayTime > lastFedAt) {
      candidates.push(todayTime)
    }

    const tomorrowTime = todayMs + 86_400_000 + h * 3_600_000 + m * 60_000
    candidates.push(tomorrowTime)
  }

  return Math.min(...candidates)
}

export function getHungerState(lastFedAt: number | null, schedule: Schedule): HungerState {
  if (lastFedAt === null) return 'unknown'

  const nextFeedingTime = getNextFeedingTime(lastFedAt, schedule)
  const overdueMs = Date.now() - nextFeedingTime

  if (overdueMs <= 0) return 'fed'

  const overdueMin = overdueMs / 60_000

  if (overdueMin <= 5) return 'slightlyHungry'
  if (overdueMin <= 15) return 'concerned'
  if (overdueMin <= 30) return 'annoyed'
  if (overdueMin <= 60) return 'dramatic'
  return 'existential'
}

export function getOverdueLabel(lastFedAt: number, schedule: Schedule): string {
  const nextFeedingTime = getNextFeedingTime(lastFedAt, schedule)
  const overdueMs = Date.now() - nextFeedingTime
  if (overdueMs <= 0) return ''

  const minutes = Math.floor(overdueMs / 60_000)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} late`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (rem === 0) return `${hours} hour${hours === 1 ? '' : 's'} late`
  return `${hours}h ${rem}m late`
}

export function formatElapsed(lastFedAt: number): string {
  const ms = Date.now() - lastFedAt
  if (ms < 60_000) return 'just now'
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  if (hours === 0) return `${minutes}m ago`
  return `${hours}h ${minutes}m ago`
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatNextFeeding(lastFedAt: number, schedule: Schedule): string {
  const nextTime = getNextFeedingTime(lastFedAt, schedule)
  const diff = nextTime - Date.now()
  const timeStr = formatTime(nextTime)

  if (diff <= 0) return `${timeStr} · overdue`

  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)

  if (hours === 0) return `${timeStr} · in ${minutes}m`
  return `${timeStr} · in ${hours}h ${minutes}m`
}
