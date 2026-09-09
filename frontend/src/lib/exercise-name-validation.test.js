import { describe, expect, it } from 'vitest'
import { validateExerciseNameEntries } from './exercise-name-validation.js'

describe('exercise-name validation', () => {
  const expected = ['0001', '0002']

  it('accepts a complete pack and allows the same visible name for different IDs', () => {
    const result = validateExerciseNameEntries(expected, [['0001', 'remo'], ['0002', 'remo']])
    expect(result).toEqual({ valid: true, report: { missing: [], extra: [], empty: [], duplicate: [], whitespace: [], punctuation: [] } })
  })

  it('reports missing, extra, empty and duplicate IDs independently', () => {
    const result = validateExerciseNameEntries(expected, [['0001', '  '], ['0003', 'extra'], ['0003', 'duplicado']])
    expect(result.valid).toBe(false)
    expect(result.report).toMatchObject({ missing: ['0002'], extra: ['0003'], empty: ['0001'], duplicate: ['0003'] })
  })

  it('reports whitespace and terminal punctuation without accepting them', () => {
    const result = validateExerciseNameEntries(expected, [['0001', 'remo '], ['0002', 'press.']])
    expect(result.valid).toBe(false)
    expect(result.report).toMatchObject({ whitespace: ['0001'], punctuation: ['0002'] })
  })
})
