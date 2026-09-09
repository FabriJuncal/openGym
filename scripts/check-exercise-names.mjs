#!/usr/bin/env node
// Validates the generated catalogue before it reaches the lazy-loaded runtime pack.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { EXDB } from '../frontend/src/lib/exercises-data.js'
import { validateExerciseNameEntries } from '../frontend/src/lib/exercise-name-validation.js'

const argIndex = process.argv.indexOf('--pack')
const packPath = argIndex === -1
  ? resolve(import.meta.dirname, '../frontend/src/exercise-names/es.js')
  : resolve(process.cwd(), process.argv[argIndex + 1] || '')
const source = readFileSync(packPath, 'utf8')
const declaredIds = [...source.matchAll(/["'](\d{4})["']\s*:/g)].map(([, id]) => id)
const { default: names } = await import(pathToFileURL(packPath).href + `?v=${Date.now()}`)
const result = validateExerciseNameEntries(EXDB.map(ex => ex.id), Object.entries(names), declaredIds)

if (!result.valid) {
  console.error(JSON.stringify(result.report, null, 2))
  process.exitCode = 1
} else {
  console.log(`Spanish exercise names valid: ${Object.keys(names).length}/${EXDB.length}`)
}
