import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const fixture = fileURLToPath(new URL('./fixtures/exercise-name-pack-duplicate.js', import.meta.url))
const checker = fileURLToPath(new URL('../../../scripts/check-exercise-names.mjs', import.meta.url))

describe('exercise-name checker CLI', () => {
  it('returns a non-zero exit code and reports duplicate source IDs', () => {
    const result = spawnSync(process.execPath, [checker, '--pack', fixture], { encoding: 'utf8' })
    expect(result.status).toBe(1)
    expect(JSON.parse(result.stderr)).toMatchObject({ duplicate: ['0001'] })
  })
})
