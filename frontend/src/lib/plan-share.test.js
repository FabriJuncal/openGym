import { afterEach, describe, expect, it } from 'vitest'
import { EXIDX, registerCustom } from './exercises.js'
import { buildPlanBundle, planPrintHTML } from './plan-share.js'
import { setLang } from './i18n.js'

const builtIn = '0025'
const routine = id => ({ id: 'r1', name: 'Rutina', emoji: 'dumbbell', ex: [{ id, sets: 3, reps: 8, weight: 50 }] })

afterEach(async () => {
  registerCustom([])
  await setLang('en')
})

describe('localized plan names', () => {
  it('prints built-in exercise names in the active language without changing plan IDs', async () => {
    await setLang('es')
    const state = { routines: [routine(builtIn)], week: {}, customEx: [], unit: 'kg' }
    expect(planPrintHTML(state, '')).toContain('press de banca con barra')
    expect(buildPlanBundle(state).routines[0].ex[0]).toEqual({ id: builtIn, sets: 3, reps: 8, weight: 50 })
  })

  it('keeps a custom name and escapes it in the printable plan', async () => {
    const custom = { id: 'c-test', n: 'Mi <ejercicio>', bp: 'chest', eq: 'custom', custom: true }
    registerCustom([custom])
    await setLang('es')
    const state = { routines: [routine(custom.id)], week: {}, customEx: [custom], unit: 'kg' }
    expect(planPrintHTML(state, '')).toContain('Mi &lt;ejercicio&gt;')
    expect(buildPlanBundle(state).customEx).toEqual([{ id: custom.id, n: custom.n, bp: custom.bp }])
    expect(EXIDX[custom.id].n).toBe(custom.n)
  })
})
