import type { HungerState } from '../types'
import catFed from '../assets/cat-mood/cat-fed.png'
import catWaiting from '../assets/cat-mood/cat-waiting.png'
import catReminder from '../assets/cat-mood/cat-reminder.png'
import catHungry from '../assets/cat-mood/cat-hungry.png'
import catBad from '../assets/cat-mood/cat-bad.png'
import catExtreme from '../assets/cat-mood/cat-extreme.png'

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

function ArcText({ text, isTop }: { text: string; isTop: boolean }) {
  const d = isTop
    ? 'M 10,30 A 135,52 0 0,1 270,30'
    : 'M 10,2 A 135,52 0 0,0 270,2'
  const id = isTop ? 'ftb-arc-top' : 'ftb-arc-bot'

  return (
    <svg
      viewBox="0 0 280 32"
      style={{ width: '100%', height: '26px', display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <path id={id} d={d} />
        <filter id={`shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.6)" />
        </filter>
      </defs>
      <text
        fill="white"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="12.5"
        letterSpacing="0.7"
        filter={`url(#shadow-${id})`}
      >
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  )
}

type Props = {
  state: HungerState
  copyIndex: number
}

export function CatDisplay({ state, copyIndex }: Props) {
  const config = COMPOSITIONS[state]
  const msg = config.messages[copyIndex % config.messages.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <ArcText text={msg.topText} isTop={true} />

      <div
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          background: 'rgba(255, 250, 242, 1)',
          height: '86px',
          width: '112px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2px 0',
        }}
      >
        <img
          src={config.image}
          alt=""
          style={{
            height: '84px',
            width: '108px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      <ArcText text={msg.bottomText} isTop={false} />
    </div>
  )
}
