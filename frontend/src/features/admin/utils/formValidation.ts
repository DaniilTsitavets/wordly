export interface ValidationErrors {
  [field: string]: string
}

export function validateTopicForm(data: { name: string }): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!data.name.trim()) {
    errors.name = 'Topic name is required'
  }
  return errors
}

export function validateSubtopicForm(data: { name: string; topic_id: number | null }): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!data.name.trim()) {
    errors.name = 'Subtopic name is required'
  }
  if (!data.topic_id) {
    errors.topic_id = 'Topic reference is required'
  }
  return errors
}

export function validateWordForm(data: {
  word_en: string
  translation_ru: string
  topic_id: number | null
  subtopic_id: number | null
}): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!data.word_en.trim()) {
    errors.word_en = 'English word is required'
  }
  if (!data.translation_ru.trim()) {
    errors.translation_ru = 'Russian translation is required'
  }
  if (!data.topic_id) {
    errors.topic_id = 'Topic is required'
  }
  if (!data.subtopic_id) {
    errors.subtopic_id = 'Subtopic is required'
  }
  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}
