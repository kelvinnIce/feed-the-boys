import type { Cat, HungerState } from '../types'

type CatMessage = {
  headline: string
  subtext?: string
  emoji: string
}

export const MESSAGE_BANK: Record<HungerState, CatMessage[]> = {
  unknown: [
    { emoji: '🐈', headline: 'We have no record of breakfast.', subtext: "Or lunch. Or dinner. We're not accusing anyone." },
  ],
  fed: [
    { emoji: '😌', headline: 'We are pleased with your service.' },
    { emoji: '😼', headline: '{cats} acknowledge your contribution.', subtext: 'For now.' },
    { emoji: '🐾', headline: 'Bowls confirmed full.', subtext: 'You may go.' },
  ],
  slightlyHungry: [
    { emoji: '🐱', headline: "Surely you haven't forgotten." },
    { emoji: '😿', headline: 'A small observation.', subtext: 'The bowl is empty.' },
    { emoji: '🐈', headline: "We're not saying anything.", subtext: "We're just sitting here." },
  ],
  concerned: [
    { emoji: '😾', headline: 'An oversight, perhaps.', subtext: "We're choosing to believe that." },
    { emoji: '🙀', headline: "We've checked the bowl twice.", subtext: 'Still empty. Interesting.' },
    { emoji: '😿', headline: '{cats} have noted the time.', subtext: 'No further comment.' },
  ],
  annoyed: [
    { emoji: '😤', headline: "We've seen you open Instagram twice.", subtext: 'The bowl remains untouched.' },
    { emoji: '😾', headline: 'You walked past the kitchen.', subtext: 'We were watching.' },
    { emoji: '🙀', headline: 'A formal complaint is being prepared.', subtext: 'HR has been notified.' },
  ],
  dramatic: [
    { emoji: '😿', headline: 'The bowl remains empty.', subtext: 'Our faith is shaken.' },
    { emoji: '🙀', headline: 'Breaking: local cats abandoned.', subtext: 'Owner last seen making coffee.' },
    { emoji: '😾', headline: 'We once trusted you.', subtext: 'We remember better days.' },
  ],
  existential: [
    { emoji: '💀', headline: "We've begun discussing inheritance.", subtext: 'You are no longer included.' },
    { emoji: '😿', headline: 'Is this what it comes to.', subtext: 'All those years of purring.' },
    { emoji: '🙀', headline: 'We have written a letter.', subtext: 'The neighbours have a copy.' },
  ],
}

export function resolveCatsToken(text: string, cats: Cat[]): string {
  if (!text.includes('{cats}')) return text
  let name: string
  if (cats.length === 0) name = 'The cats'
  else if (cats.length === 1) name = cats[0].name
  else if (cats.length === 2) name = `${cats[0].name} and ${cats[1].name}`
  else name = cats.slice(0, -1).map(c => c.name).join(', ') + ', and ' + cats[cats.length - 1].name
  return text.replace('{cats}', name)
}
