import { afterEach, describe, expect, it } from 'vitest'
import { EXDB } from './exercises-data.js'
import { getLang, matchesExerciseName, nameFor, normalizeExerciseText, setLang } from './i18n.js'
import names from '../exercise-names/es.js'

const bench = EXDB.find(ex => ex.id === '0025')
const demoCorrections = {
  '0027': 'remo inclinado con barra',
  '1323': 'remo sentado en polea con cuerda',
  '0241': 'extensión de tríceps en polea (barra en V)'
}

afterEach(async () => { await setLang('en') })

describe('localized exercise names', () => {
  it('covers every built-in exercise with a non-empty Spanish name', () => {
    expect(Object.keys(names)).toHaveLength(EXDB.length)
    expect(EXDB.every(ex => typeof names[ex.id] === 'string' && names[ex.id].trim())).toBe(true)
  })

  it('keeps the reviewed demo exercises in Spanish', async () => {
    await setLang('es')
    for (const [id, expected] of Object.entries(demoCorrections)) {
      const exercise = EXDB.find(ex => ex.id === id)
      expect(names[id]).toBe(expected)
      expect(nameFor(exercise)).toBe(expected)
    }
  })

  it('uses Spanish for built-ins, canonical English for English, and keeps custom names', async () => {
    await setLang('es')
    expect(nameFor(bench)).toBe('press de banca con barra')
    expect(nameFor({ id: 'custom-1', n: 'Mi press personal', custom: true })).toBe('Mi press personal')
    expect(nameFor({ id: bench.id, n: 'Mi press con ID propio', custom: true })).toBe('Mi press con ID propio')

    await setLang('en')
    expect(nameFor(bench)).toBe('barbell bench press')
  })

  it('returns safe fallbacks for absent and unresolved exercises', async () => {
    await setLang('es')
    expect(nameFor(undefined)).toBe('')
    expect(nameFor(null)).toBe('')
    expect(nameFor({ id: 'removed-exercise', n: 'Mi ejercicio eliminado' })).toBe('Mi ejercicio eliminado')
    expect(nameFor({ id: 'removed-exercise' })).toBe('')
  })

  it('finds canonical and localized names without requiring accents', async () => {
    await setLang('es')
    expect(matchesExerciseName(bench, 'press de banca')).toBe(true)
    expect(matchesExerciseName(bench, 'barbell bench')).toBe(true)
    expect(normalizeExerciseText('BÍCEPS')).toBe('biceps')
  })

  it('keeps the final language when requests resolve out of order', async () => {
    const spanish = setLang('es')
    const english = setLang('en')
    await Promise.all([spanish, english])
    expect(getLang()).toBe('en')
    expect(nameFor(bench)).toBe('barbell bench press')
  })
})
