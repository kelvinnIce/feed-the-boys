export type Cat = {
  id: string
  name: string
  emoji: string
}

export type Schedule =
  | { type: 'fixed'; times: string[] }
  | { type: 'interval'; hours: number }

export type FeedingEvent = {
  id: string
  timestamp: number
  fedBy: string
}

export type HungerState =
  | 'fed'
  | 'slightlyHungry'
  | 'concerned'
  | 'annoyed'
  | 'dramatic'
  | 'existential'
  | 'unknown'

declare global {
  interface Window {
    electronAPI: {
      store: {
        get: (key: string) => Promise<unknown>
        set: (key: string, value: unknown) => Promise<void>
        delete: (key: string) => Promise<void>
      }
      notify: (title: string, body: string) => Promise<void>
      minimize: () => Promise<void>
    }
  }
}
