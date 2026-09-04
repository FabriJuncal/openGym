import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opengym-api-'));
process.env.DATA_DIR = dataDir;
process.env.ORIGIN = 'http://localhost:8080';
process.env.RP_ID = 'localhost';
process.env.CRON_SECRET = 'test-cron-secret';

let baseUrl;
let server;

before(async () => {
  const { handleRequest } = await import('../api/server.js');
  server = http.createServer(handleRequest);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

test('health preserves the public response and reports the storage adapter', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, users: 0, storage: 'file' });
});

test('Vercel rewrite query dispatches to the original API route', async () => {
  const response = await fetch(`${baseUrl}/api/server?route=health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, users: 0, storage: 'file' });
});

test('config endpoint remains public', async () => {
  const response = await fetch(`${baseUrl}/api/config`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { invite_only: false });
});

test('protected state endpoint keeps returning 401 without a session', async () => {
  const response = await fetch(`${baseUrl}/api/data`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'not signed in' });
});

test('registration options keep the WebAuthn contract', async () => {
  const response = await fetch(`${baseUrl}/api/register/options`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test User' })
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(typeof body.cid, 'string');
  assert.equal(body.options.rp.id, 'localhost');
  assert.equal(body.options.user.name, 'Test User');
  assert.equal(typeof body.options.challenge, 'string');
});

test('notification job requires its bearer secret', async () => {
  const denied = await fetch(`${baseUrl}/api/jobs/notifications`, { method: 'POST' });
  assert.equal(denied.status, 401);

  const allowed = await fetch(`${baseUrl}/api/jobs/notifications`, {
    method: 'POST',
    headers: { authorization: 'Bearer test-cron-secret' }
  });
  assert.equal(allowed.status, 200);
  assert.deepEqual(await allowed.json(), { ok: true, restTimers: 0 });
});
