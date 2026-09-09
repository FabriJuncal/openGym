// Human-reviewed terminology for the generated Spanish exercise-name catalogue.
// Keep this source versioned; frontend/src/exercise-names/es.js is generated output.

export const TERMINOLOGY = {
  'pull-up': 'dominada',
  row: 'remo',
  dip: 'fondos',
  deadlift: 'peso muerto',
  press: 'press',
  'smith machine': 'máquina Smith',
  'ez barbell': 'barra EZ'
}

// Corrections where a literal machine translation loses the established training term
// or an important exercise qualifier. Keys are stable EXDB IDs.
export const OVERRIDES = {
  '0001': 'abdominal de tres cuartos',
  '0006': 'toques alternos de talón',
  '0009': 'fondos de pecho asistidos (arrodillados)',
  '0014': 'giro ruso asistido',
  '0016': 'isquiotibial en decúbito prono asistido',
  '0025': 'press de banca con barra',
  '0241': 'extensión de tríceps en polea (barra en V)',
  '0027': 'remo inclinado con barra',
  '0032': 'peso muerto con barra',
  '0043': 'sentadilla completa con barra',
  '0251': 'fondos de pecho',
  '1429': 'dominada con agarre ancho',
  '1431': 'dominada supina de pie asistida',
  '1432': 'dominada pronada de pie asistida',
  '1512': 'estiramiento en cuclillas a cuatro apoyos',
  '2333': 'balanceo de brazos colgado con piernas rectas',
  '2355': 'balanceo de brazos colgado con rodillas flexionadas',
  '2364': 'fondos de pecho asistidos con agarre amplio (arrodillados)',
  '3293': 'dominada de arquero',
  '3294': 'flexión de arquero',
  '1405': 'estiramiento de espalda y pectorales',
  '1323': 'remo sentado en polea con cuerda'
}

const properPrefixes = /^(?:BOSU|EZ|SkiErg|Smith|TRX)\b/u
const canonicalAcronyms = { bosu: 'BOSU', ez: 'EZ' }

export const normalizeExerciseName = value => {
  const name = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?。]+$/u, '')
    .replace(/\b(bosu|ez)\b/giu, acronym => canonicalAcronyms[acronym.toLocaleLowerCase('en-US')])
  if (!name || properPrefixes.test(name)) return name
  return name[0].toLocaleLowerCase('es-ES') + name.slice(1)
}
