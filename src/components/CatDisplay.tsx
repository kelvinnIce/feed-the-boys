import type { HungerState } from '../types'
import catFed from '../assets/cat-mood/cat-fed.png'
import catWaiting from '../assets/cat-mood/cat-waiting.png'
import catReminder from '../assets/cat-mood/cat-reminder.png'
import catHungry from '../assets/cat-mood/cat-hungry.png'
import catBad from '../assets/cat-mood/cat-bad.png'
import catExtreme from '../assets/cat-mood/cat-extreme.png'

export const STATE_IMAGES: Record<HungerState, string> = {
  fed: catFed,
  unknown: catWaiting,
  slightlyHungry: catReminder,
  concerned: catHungry,
  annoyed: catHungry,
  dramatic: catBad,
  existential: catExtreme,
}

type StateConfig = {
  messages: Array<{ topText: string; bottomText: string }>
  image: string
}

const COMPOSITIONS: Record<HungerState, StateConfig> = {
  fed: {
    image: catFed,
    messages: [
      { topText: 'we are pleased', bottomText: 'with your service' },
      { topText: 'belly status:', bottomText: 'full. very full.' },
      { topText: 'you may continue', bottomText: 'existing' },
    ],
  },
  unknown: {
    image: catWaiting,
    messages: [
      { topText: 'no record of breakfast', bottomText: 'or lunch. or dinner.' },
      { topText: 'feeding time', bottomText: 'unknown. suspicious.' },
      { topText: 'our data says:', bottomText: 'check the bowl.' },
    ],
  },
  slightlyHungry: {
    image: catReminder,
    messages: [
      { topText: 'here to remind you', bottomText: 'to feed us' },
      { topText: 'just a heads up —', bottomText: "it's dinner time" },
      { topText: 'the bowl', bottomText: 'is empty. just saying.' },
    ],
  },
  concerned: {
    image: catHungry,
    messages: [
      { topText: "it's been a while.", bottomText: "we've noticed." },
      { topText: 'we waited patiently.', bottomText: 'keyword: waited.' },
      { topText: 'sending a formal', bottomText: 'complaint.' },
    ],
  },
  annoyed: {
    image: catHungry,
    messages: [
      { topText: 'you walked past the kitchen.', bottomText: 'we were watching.' },
      { topText: 'you had time for your phone.', bottomText: 'interesting.' },
      { topText: 'our patience', bottomText: 'is finite.' },
    ],
  },
  dramatic: {
    image: catBad,
    messages: [
      { topText: 'we cannot go on', bottomText: 'like this.' },
      { topText: 'energy levels:', bottomText: 'critical.' },
      { topText: 'this is not', bottomText: 'what we agreed.' },
    ],
  },
  existential: {
    image: catExtreme,
    messages: [
      { topText: 'all those years', bottomText: 'of purring.' },
      { topText: 'we gave you everything.', bottomText: 'EVERYTHING.' },
      { topText: 'what was it all', bottomText: 'for.' },
    ],
  },
}

type Props = {
  state: HungerState
  copyIndex: number
}

export function CatDisplay({ state, copyIndex }: Props) {
  const config = COMPOSITIONS[state]
  const msg = config.messages[copyIndex % config.messages.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '6px' }}>
      <div style={{ textAlign: 'center', padding: '0 12px' }}>
        <p style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(0,0,0,0.8)',
          fontStyle: 'italic',
          lineHeight: '1.35',
          margin: 0,
        }}>
          {msg.topText}
        </p>
        <p style={{
          fontSize: '13px',
          color: 'rgba(0,0,0,0.45)',
          fontStyle: 'italic',
          lineHeight: '1.35',
          margin: 0,
        }}>
          {msg.bottomText}
        </p>
      </div>

      <img
        src={config.image}
        alt=""
        style={{ height: '90px', objectFit: 'contain', display: 'block' }}
      />
    </div>
  )
}
