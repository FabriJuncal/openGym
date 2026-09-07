#!/usr/bin/env node
// Development-only static server for the exercise dataset. Vite proxies /img and /gif here.

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mediaDir = join(scriptDir, '..', '..', 'media')
const host = process.env.MEDIA_HOST || '127.0.0.1'
const port = Number(process.env.MEDIA_PORT || 8888)
const types = { '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`MEDIA_PORT must be an integer between 1 and 65535; received ${process.env.MEDIA_PORT}`)
  process.exit(1)
}

if (!existsSync(join(mediaDir, 'img')) || !existsSync(join(mediaDir, 'gif'))) {
  console.error(`Exercise media is missing at ${mediaDir}. Run ../scripts/fetch-media.sh from the repository root first.`)
  process.exit(1)
}

function fileFor(pathname) {
  let decoded
  try { decoded = decodeURIComponent(pathname) } catch { return null }
  const relative = normalize(decoded).replace(/^[/\\]+/, '')
  const [kind, name, ...rest] = relative.split(/[\\/]/)
  if (!['img', 'gif'].includes(kind) || !name || rest.length || name.includes('..')) return null
  const file = join(mediaDir, kind, name)
  return file.startsWith(join(mediaDir, kind)) ? file : null
}

const server = createServer((req, res) => {
  if (!req.url || !['GET', 'HEAD'].includes(req.method || '')) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  const file = fileFor(new URL(req.url, `http://${req.headers.host || host}`).pathname)
  if (!file || !types[extname(file).toLowerCase()] || !existsSync(file)) {
    res.writeHead(404).end()
    return
  }

  const stat = statSync(file)
  if (!stat.isFile()) {
    res.writeHead(404).end()
    return
  }

  res.writeHead(200, {
    'Content-Type': types[extname(file).toLowerCase()],
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache'
  })
  if (req.method === 'HEAD') res.end()
  else createReadStream(file).pipe(res)
})

server.on('error', error => {
  console.error(`Could not serve exercise media on http://${host}:${port}: ${error.message}`)
  process.exitCode = 1
})

server.listen(port, host, () => {
  console.log(`Serving exercise media from ${mediaDir} at http://${host}:${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)))
