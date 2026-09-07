#!/usr/bin/env node
// Guards the deployment-specific contract: Vercel builds reference the pinned CDN instead
// of relative img/ and gif/ directories, which Vercel deliberately does not publish.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')
const bases = [
  'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/',
  'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/'
]

function filesIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? filesIn(path) : [path]
  })
}

if (!existsSync(distDir)) {
  console.error(`Missing build output: ${distDir}`)
  process.exit(1)
}

const bundle = filesIn(distDir)
  .filter(file => file.endsWith('.js'))
  .map(file => readFileSync(file, 'utf8'))
  .join('\n')

const missing = bases.filter(base => !bundle.includes(base))
if (missing.length) {
  console.error(`Vercel media base missing from bundle: ${missing.join(', ')}`)
  process.exit(1)
}

const copiedMedia = ['img', 'gif'].filter(dir => existsSync(join(distDir, dir)))
if (copiedMedia.length) {
  console.error(`Vercel build must not copy local media: ${copiedMedia.join(', ')}`)
  process.exit(1)
}

console.log('Vercel media build points to the pinned CDN; local media was not copied.')
