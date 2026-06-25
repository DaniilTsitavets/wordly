import { describe, it, expect } from 'vitest'
import { MECHANIC_INFO } from './mechanics'

describe('MECHANIC_INFO', () => {
  const expectedKeys = [
    'mnemonic_cards',
    'flashcards',
    'matching',
    'filling_gaps',
    'word_builder',
  ] as const

  it.each(expectedKeys)('has an entry for %s with label, description, icon', (key) => {
    const info = MECHANIC_INFO[key]
    expect(info).toBeDefined()
    expect(info.label).toBeTruthy()
    expect(info.description).toBeTruthy()
    expect(info.icon).toBeTruthy()
  })

  it('covers exactly the five known mechanic types', () => {
    expect(Object.keys(MECHANIC_INFO).sort()).toEqual([...expectedKeys].sort())
  })
})
