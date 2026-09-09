const terminalPunctuation = /[.!?。]+$/u

const unique = values => [...new Set(values)]

export function validateExerciseNameEntries(expectedIds, entries, sourceIds = entries.map(([id]) => id)) {
  const expected = new Set(expectedIds)
  const actualIds = entries.map(([id]) => id)
  const actual = new Set(actualIds)
  const duplicate = unique(sourceIds.filter((id, index) => sourceIds.indexOf(id) !== index))
  const missing = expectedIds.filter(id => !actual.has(id))
  const extra = unique(actualIds.filter(id => !expected.has(id)))
  const empty = unique(entries.filter(([, name]) => typeof name !== 'string' || !name.trim()).map(([id]) => id))
  const whitespace = unique(entries.filter(([, name]) => typeof name === 'string' && name !== name.trim()).map(([id]) => id))
  const punctuation = unique(entries.filter(([, name]) => typeof name === 'string' && terminalPunctuation.test(name.trim())).map(([id]) => id))
  const report = { missing, extra, empty, duplicate, whitespace, punctuation }
  return { valid: Object.values(report).every(ids => ids.length === 0), report }
}
