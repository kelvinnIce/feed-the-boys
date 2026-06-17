import type { Cat, HungerState } from '../types'

type NotifyContent = {
  title: string
  body: (cats: Cat[]) => string
}

function catNames(cats: Cat[]): string {
  if (cats.length === 0) return 'The cats'
  if (cats.length === 1) return cats[0].name
  if (cats.length === 2) return `${cats[0].name} and ${cats[1].name}`
  return cats.slice(0, -1).map(c => c.name).join(', ') + ', and ' + cats[cats.length - 1].name
}

const NOTIFY_CONTENT: Record<Exclude<HungerState, 'fed' | 'unknown'>, NotifyContent> = {
  slightlyHungry: {
    title: '🐱 Feed The Boys',
    body: cats => `${catNames(cats)} have noticed the time.`,
  },
  concerned: {
    title: '🐱 Feed The Boys',
    body: () => 'An oversight, perhaps.',
  },
  annoyed: {
    title: '😾 Feed The Boys',
    body: () => "We've seen you open Instagram twice.",
  },
  dramatic: {
    title: '😿 Feed The Boys',
    body: () => 'The bowl remains empty. Our faith is shaken.',
  },
  existential: {
    title: '💀 Feed The Boys',
    body: () => 'Legal action is being considered.',
  },
}

export function fireNotification(state: HungerState, cats: Cat[]): void {
  if (state === 'fed' || state === 'unknown') return
  const content = NOTIFY_CONTENT[state]
  window.electronAPI.notify(content.title, content.body(cats))
}
