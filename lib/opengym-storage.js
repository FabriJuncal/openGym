import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function atomicWrite(file, content) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, file);
}

function createFileStorage(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const dbFile = path.join(dataDir, 'db.json');
  let db = { users: [], creds: [], subs: [], invites: [] };
  try { db = JSON.parse(fs.readFileSync(dbFile, 'utf8')); } catch {}
  db.users ||= [];
  db.creds ||= [];
  db.subs ||= [];
  db.invites ||= [];
  const challenges = new Map();
  const presence = new Map();
  const restTimers = new Map();
  const config = new Map();
  const saveDb = () => atomicWrite(dbFile, JSON.stringify(db, null, 2));
  const stateFile = uid => path.join(dataDir, 'state-' + uid.replace(/[^a-zA-Z0-9_-]/g, '') + '.json');

  return {
    mode: 'file',
    async userCount() { return db.users.length; },
    async getUser(id) { return db.users.find(u => u.id === id) || null; },
    async listUsers() { return db.users.slice(); },
    async validInvite(code) { return db.invites.some(i => i.code === code && !i.usedBy && !i.revoked); },
    async registerUser(user, credential, inviteCode, inviteOnly) {
      if (db.creds.some(c => c.id === credential.id)) return { error: 'credential_exists' };
      let invite = null;
      if (inviteOnly) {
        invite = db.invites.find(i => i.code === inviteCode && !i.usedBy && !i.revoked);
        if (!invite) return { error: 'invite_invalid' };
      }
      if (invite) {
        user.invitedBy = invite.code;
        invite.usedBy = user.id;
        invite.usedAt = user.created;
      }
      db.users.push(user);
      db.creds.push(credential);
      saveDb();
      return { user };
    },
    async findCredential(id) { return db.creds.find(c => c.id === id) || null; },
    async updateCredentialCounter(id, counter) {
      const cred = db.creds.find(c => c.id === id);
      if (cred) { cred.counter = counter; saveDb(); }
    },
    async bumpSessionVersion(id) {
      const user = db.users.find(u => u.id === id);
      if (!user) return null;
      user.sv = (user.sv || 0) + 1;
      saveDb();
      return user;
    },
    async readState(uid) {
      try { return JSON.parse(fs.readFileSync(stateFile(uid), 'utf8')); } catch { return null; }
    },
    async writeState(uid, state) { atomicWrite(stateFile(uid), JSON.stringify(state)); },
    async listSubscriptions(userId) { return db.subs.filter(s => !userId || s.userId === userId); },
    async upsertSubscription(sub) {
      db.subs = db.subs.filter(s => s.endpoint !== sub.endpoint);
      db.subs.push(sub);
      saveDb();
    },
    async deleteSubscription(userId, endpoint) {
      db.subs = db.subs.filter(s => !(s.userId === userId && s.endpoint === endpoint));
      saveDb();
    },
    async deleteSubscriptionByEndpoint(endpoint) {
      db.subs = db.subs.filter(s => s.endpoint !== endpoint);
      saveDb();
    },
    async putChallenge(payload) {
      const id = crypto.randomBytes(16).toString('base64url');
      challenges.set(id, { ...payload, exp: Date.now() + 5 * 60000 });
      return id;
    },
    async takeChallenge(id) {
      const value = challenges.get(id);
      challenges.delete(id);
      return value && value.exp >= Date.now() ? value : null;
    },
    async setPresence(userId, payload) {
      if (payload) presence.set(userId, payload); else presence.delete(userId);
    },
    async getPresence(userId) {
      const value = presence.get(userId);
      if (!value || Date.now() - value.updatedAt > 70000) return null;
      return value;
    },
    async setUserDisabled(id, disabled) {
      const user = db.users.find(u => u.id === id);
      if (!user) return null;
      user.disabled = disabled;
      saveDb();
      return user;
    },
    async listInvites() { return db.invites.slice(); },
    async createInvite(invite) { db.invites.push(invite); saveDb(); return invite; },
    async revokeInvite(code) {
      const invite = db.invites.find(i => i.code === code);
      if (!invite) return { error: 'not_found' };
      if (invite.usedBy) return { error: 'used' };
      db.invites = db.invites.filter(i => i.code !== code);
      saveDb();
      return { ok: true };
    },
    async getConfig(key) {
      if (config.has(key)) return config.get(key);
      if (key === 'vapid') {
        try { return JSON.parse(fs.readFileSync(path.join(dataDir, 'vapid.json'), 'utf8')); } catch {}
      }
      return null;
    },
    async setConfig(key, value) {
      config.set(key, value);
      if (key === 'vapid') atomicWrite(path.join(dataDir, 'vapid.json'), JSON.stringify(value));
    },
    async scheduleRestTimer(userId, dueAt) { restTimers.set(userId, dueAt); },
    async cancelRestTimer(userId) { restTimers.delete(userId); },
    async claimDueRestTimers(now) {
      const due = [];
      for (const [userId, dueAt] of restTimers) {
        if (dueAt <= now) { due.push({ userId }); restTimers.delete(userId); }
      }
      return due;
    },
    async markReminderSent(userId, date) {
      const user = db.users.find(u => u.id === userId);
      if (user) { user.lastReminder = date; saveDb(); }
    }
  };
}

const userFromRow = row => row && ({
  id: row.id,
  name: row.name,
  created: row.created_at,
  disabled: row.disabled,
  admin: row.admin,
  sv: row.session_version,
  invitedBy: row.invited_by,
  lastReminder: row.last_reminder
});

const credentialFromRow = row => row && ({
  id: row.id,
  userId: row.user_id,
  publicKey: row.public_key,
  counter: Number(row.counter || 0),
  transports: row.transports || []
});

const subscriptionFromRow = row => row && ({
  userId: row.user_id,
  endpoint: row.endpoint,
  keys: row.keys,
  created: row.created_at
});

const inviteFromRow = row => row && ({
  code: row.code,
  note: row.note || '',
  createdBy: row.created_by,
  created: row.created_at,
  usedBy: row.used_by,
  usedAt: row.used_at,
  revoked: row.revoked
});

function createSupabaseStorage(url, serviceRoleKey, createClient) {
  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const one = (data, error) => {
    if (error) throw error;
    return data || null;
  };

  return {
    mode: 'supabase',
    async userCount() {
      const { count, error } = await client.from('opengym_users').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    async getUser(id) {
      const r = await client.from('opengym_users').select('*').eq('id', id).maybeSingle();
      return userFromRow(one(r.data, r.error));
    },
    async listUsers() {
      const r = await client.from('opengym_users').select('*').order('created_at');
      return one(r.data, r.error).map(userFromRow);
    },
    async validInvite(code) {
      const r = await client.from('opengym_invites').select('code').eq('code', code).eq('revoked', false).is('used_by', null).maybeSingle();
      return !!one(r.data, r.error);
    },
    async registerUser(user, credential, inviteCode, inviteOnly) {
      const r = await client.rpc('opengym_register_user', {
        p_user: user,
        p_credential: credential,
        p_invite_code: inviteCode || null,
        p_invite_only: inviteOnly
      });
      const data = one(r.data, r.error);
      return data?.error ? { error: data.error } : { user: userFromRow(data.user) };
    },
    async findCredential(id) {
      const r = await client.from('opengym_credentials').select('*').eq('id', id).maybeSingle();
      return credentialFromRow(one(r.data, r.error));
    },
    async updateCredentialCounter(id, counter) {
      const r = await client.from('opengym_credentials').update({ counter }).eq('id', id);
      one(r.data, r.error);
    },
    async bumpSessionVersion(id) {
      const r = await client.rpc('opengym_bump_session_version', { p_user_id: id });
      return userFromRow(one(r.data, r.error));
    },
    async readState(uid) {
      const r = await client.from('opengym_states').select('state').eq('user_id', uid).maybeSingle();
      return one(r.data, r.error)?.state || null;
    },
    async writeState(uid, state) {
      const r = await client.from('opengym_states').upsert({ user_id: uid, state, updated_at: new Date().toISOString() });
      one(r.data, r.error);
    },
    async listSubscriptions(userId) {
      let q = client.from('opengym_push_subscriptions').select('*');
      if (userId) q = q.eq('user_id', userId);
      const r = await q;
      return one(r.data, r.error).map(subscriptionFromRow);
    },
    async upsertSubscription(sub) {
      const r = await client.from('opengym_push_subscriptions').upsert({
        endpoint: sub.endpoint, user_id: sub.userId, keys: sub.keys, created_at: sub.created
      });
      one(r.data, r.error);
    },
    async deleteSubscription(userId, endpoint) {
      const r = await client.from('opengym_push_subscriptions').delete().eq('user_id', userId).eq('endpoint', endpoint);
      one(r.data, r.error);
    },
    async deleteSubscriptionByEndpoint(endpoint) {
      const r = await client.from('opengym_push_subscriptions').delete().eq('endpoint', endpoint);
      one(r.data, r.error);
    },
    async putChallenge(payload) {
      const id = crypto.randomBytes(16).toString('base64url');
      const r = await client.from('opengym_challenges').insert({
        id, payload, expires_at: new Date(Date.now() + 5 * 60000).toISOString()
      });
      one(r.data, r.error);
      return id;
    },
    async takeChallenge(id) {
      const r = await client.rpc('opengym_take_challenge', { p_id: id });
      return one(r.data, r.error);
    },
    async setPresence(userId, payload) {
      const r = payload
        ? await client.from('opengym_presence').upsert({ user_id: userId, payload, updated_at: new Date().toISOString() })
        : await client.from('opengym_presence').delete().eq('user_id', userId);
      one(r.data, r.error);
    },
    async getPresence(userId) {
      const cutoff = new Date(Date.now() - 70000).toISOString();
      const r = await client.from('opengym_presence').select('payload').eq('user_id', userId).gte('updated_at', cutoff).maybeSingle();
      return one(r.data, r.error)?.payload || null;
    },
    async setUserDisabled(id, disabled) {
      const r = await client.from('opengym_users').update({ disabled }).eq('id', id).select('*').maybeSingle();
      return userFromRow(one(r.data, r.error));
    },
    async listInvites() {
      const r = await client.from('opengym_invites').select('*').order('created_at', { ascending: false });
      return one(r.data, r.error).map(inviteFromRow);
    },
    async createInvite(invite) {
      const r = await client.from('opengym_invites').insert({
        code: invite.code, note: invite.note, created_by: invite.createdBy, created_at: invite.created
      }).select('*').single();
      return inviteFromRow(one(r.data, r.error));
    },
    async revokeInvite(code) {
      const found = await client.from('opengym_invites').select('used_by').eq('code', code).maybeSingle();
      const invite = one(found.data, found.error);
      if (!invite) return { error: 'not_found' };
      if (invite.used_by) return { error: 'used' };
      const r = await client.from('opengym_invites').delete().eq('code', code);
      one(r.data, r.error);
      return { ok: true };
    },
    async getConfig(key) {
      const r = await client.from('opengym_config').select('value').eq('key', key).maybeSingle();
      return one(r.data, r.error)?.value || null;
    },
    async setConfig(key, value) {
      const r = await client.from('opengym_config').upsert({ key, value, updated_at: new Date().toISOString() });
      one(r.data, r.error);
    },
    async scheduleRestTimer(userId, dueAt) {
      const r = await client.from('opengym_rest_timers').upsert({
        user_id: userId, due_at: new Date(dueAt).toISOString()
      });
      one(r.data, r.error);
    },
    async cancelRestTimer(userId) {
      const r = await client.from('opengym_rest_timers').delete().eq('user_id', userId);
      one(r.data, r.error);
    },
    async claimDueRestTimers(now) {
      const r = await client.rpc('opengym_claim_due_rest_timers', { p_now: new Date(now).toISOString() });
      return one(r.data, r.error).map(row => ({ userId: row.user_id }));
    },
    async markReminderSent(userId, date) {
      const r = await client.from('opengym_users').update({ last_reminder: date }).eq('id', userId);
      one(r.data, r.error);
    }
  };
}

export function createStorage({ dataDir, supabaseUrl, supabaseServiceRoleKey, createClient }) {
  if (!!supabaseUrl !== !!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together');
  }
  return supabaseUrl
    ? createSupabaseStorage(supabaseUrl, supabaseServiceRoleKey, createClient)
    : createFileStorage(dataDir);
}
