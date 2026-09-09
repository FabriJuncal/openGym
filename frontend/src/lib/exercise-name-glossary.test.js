import { describe, expect, it } from 'vitest'
import { normalizeExerciseName } from '../../../scripts/exercise-names/es-glossary.mjs'

describe('Spanish exercise-name glossary normalization', () => {
  it('canonicalizes EZ and BOSU as whole tokens in any position', () => {
    expect(normalizeExerciseName('ez curl')).toBe('EZ curl')
    expect(normalizeExerciseName('curl con barra ez')).toBe('curl con barra EZ')
    expect(normalizeExerciseName('plancha (bosu)')).toBe('plancha (BOSU)')
  })

  it('preserves established proper names and does not replace token fragments', () => {
    expect(normalizeExerciseName('Smith machine press')).toBe('Smith machine press')
    expect(normalizeExerciseName('TRX row')).toBe('TRX row')
    expect(normalizeExerciseName('SkiErg row')).toBe('SkiErg row')
    expect(normalizeExerciseName('ejercicio ezotérico con bosun')).toBe('ejercicio ezotérico con bosun')
  })
})
