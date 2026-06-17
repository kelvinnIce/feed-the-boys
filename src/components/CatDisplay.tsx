import type { HungerState } from '../types'

type Composition = {
  topText: string
  bottomText: string
  primary: string
  secondary?: string
  secondaryPos?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
    fontSize?: string
    rotate?: string
  }
  primaryRotate?: number
}

const COMPOSITIONS: Record<HungerState, Composition> = {
  unknown: {
    topText: 'no record of breakfast',
    bottomText: "or lunch. or dinner.",
    primary: '🐈',
  },
  fed: {
    topText: 'we are pleased',
    bottomText: 'with your service',
    primary: '😺',
  },
  slightlyHungry: {
    topText: 'here to remind you',
    bottomText: 'to feed us',
    primary: '😾',
    secondary: '🥫',
    secondaryPos: { top: '-8px', right: '18px', fontSize: '32px' },
  },
  concerned: {
    topText: 'we have noted the time',
    bottomText: 'no further comment',
    primary: '😾',
    secondary: '😿',
    secondaryPos: { bottom: '-2px', right: '12px', fontSize: '50px' },
  },
  annoyed: {
    topText: 'you walked past the kitchen',
    bottomText: 'we were watching',
    primary: '😤',
  },
  dramatic: {
    topText: 'we cannot go on',
    bottomText: 'like this',
    primary: '😵',
    primaryRotate: -18,
  },
  existential: {
    topText: 'all those years',
    bottomText: 'of purring.',
    primary: '💀',
  },
}

// Multiple drop-shadows stack to create a white sticker-outline effect on emoji
const STICKER_FILTER = [
  'drop-shadow(-2.5px -2.5px 0 white)',
  'drop-shadow(2.5px -2.5px 0 white)',
  'drop-shadow(-2.5px 2.5px 0 white)',
  'drop-shadow(2.5px 2.5px 0 white)',
  'drop-shadow(0 0 1px rgba(255,255,255,0.9))',
  'drop-shadow(0 3px 6px rgba(0,0,0,0.12))',
].join(' ')

function ArcText({ text, isTop }: { text: string; isTop: boolean }) {
  // Paths span the full card inner width (~288px minus a little breathing room)
  // Top arc: clockwise sweep creates an upward bulge — text rides the top of the arc
  // Bottom arc: counter-clockwise sweep creates a downward bulge
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
      </defs>
      <text
        fill="rgba(72, 195, 170, 0.82)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="12.5"
        letterSpacing="0.7"
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
}

export function CatDisplay({ state }: Props) {
  const config = COMPOSITIONS[state]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <ArcText text={config.topText} isTop={true} />

      {/* Cat illustration */}
      <div
        style={{
          position: 'relative',
          height: '82px',
          width: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: '70px',
            lineHeight: '1',
            display: 'inline-block',
            filter: STICKER_FILTER,
            transform: config.primaryRotate
              ? `rotate(${config.primaryRotate}deg)`
              : undefined,
          }}
        >
          {config.primary}
        </span>

        {config.secondary && (
          <span
            style={{
              fontSize: config.secondaryPos?.fontSize ?? '42px',
              lineHeight: '1',
              display: 'inline-block',
              position: 'absolute',
              top: config.secondaryPos?.top,
              right: config.secondaryPos?.right,
              bottom: config.secondaryPos?.bottom,
              left: config.secondaryPos?.left,
              filter: STICKER_FILTER,
              transform: config.secondaryPos?.rotate
                ? `rotate(${config.secondaryPos.rotate})`
                : undefined,
            }}
          >
            {config.secondary}
          </span>
        )}
      </div>

      <ArcText text={config.bottomText} isTop={false} />
    </div>
  )
}
