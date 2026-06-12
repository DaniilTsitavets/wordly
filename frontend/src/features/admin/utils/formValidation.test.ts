import { describe, it, expect } from 'vitest'
import {
  validateTopicForm,
  validateSubtopicForm,
  validateWordForm,
  hasErrors,
} from './formValidation'

describe('validateTopicForm', () => {
  it('returns no errors for a non-empty name', () => {
    expect(validateTopicForm({ name: 'Food' })).toEqual({})
  })

  it('flags missing name', () => {
    expect(validateTopicForm({ name: '' })).toEqual({ name: 'Topic name is required' })
  })

  it('treats whitespace-only as missing', () => {
    expect(validateTopicForm({ name: '   ' })).toHaveProperty('name')
  })
})

describe('validateSubtopicForm', () => {
  it('returns no errors when name + topic_id are both provided', () => {
    expect(validateSubtopicForm({ name: 'Drinks', topic_id: 1 })).toEqual({})
  })

  it('flags missing name', () => {
    expect(validateSubtopicForm({ name: '', topic_id: 1 })).toHaveProperty('name')
  })

  it('flags missing topic_id (null)', () => {
    expect(validateSubtopicForm({ name: 'Drinks', topic_id: null })).toHaveProperty('topic_id')
  })

  it('flags both errors when both fields are empty', () => {
    const errors = validateSubtopicForm({ name: '', topic_id: null })
    expect(errors.name).toBeTruthy()
    expect(errors.topic_id).toBeTruthy()
  })
})

describe('validateWordForm', () => {
  const valid = { word_en: 'apple', translation_ru: 'яблоко', topic_id: 1, subtopic_id: 10 }

  it('returns no errors for fully filled form', () => {
    expect(validateWordForm(valid)).toEqual({})
  })

  it('flags missing word_en', () => {
    expect(validateWordForm({ ...valid, word_en: '' })).toHaveProperty('word_en')
  })

  it('flags missing translation_ru', () => {
    expect(validateWordForm({ ...valid, translation_ru: '   ' })).toHaveProperty('translation_ru')
  })

  it('flags missing topic_id', () => {
    expect(validateWordForm({ ...valid, topic_id: null })).toHaveProperty('topic_id')
  })

  it('flags missing subtopic_id', () => {
    expect(validateWordForm({ ...valid, subtopic_id: null })).toHaveProperty('subtopic_id')
  })
})

describe('hasErrors', () => {
  it('returns false for an empty object', () => {
    expect(hasErrors({})).toBe(false)
  })

  it('returns true when any error is present', () => {
    expect(hasErrors({ name: 'required' })).toBe(true)
  })
})
