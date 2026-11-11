import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttemptStore, newIdentityToken, AttemptStoreError, AUTHORITY_KEY, LEGACY_ARCHIVE_KEY } from './attempt-store.js';

// A shared lock manager models exclusive Web Locks, including held liveness
// locks. Storage never supplies a compare-and-set primitive.
class Locks {
  held = new Set();
  queues = new Map();
  request(name, options, callback) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        if (options.ifAvailable && this.held.has(name)) {
          try { resolve(await callback(null)); } catch (error) { reject(error); }
          return;
        }
        this.held.add(name);
        try { resolve(await callback({ name })); } catch (error) { reject(error); }
        finally {
          this.held.delete(name);
          const queue = this.queues.get(name);
          if (queue?.length) queue.shift()();
        }
      };
      if (this.held.has(name) && !options.ifAvailable) {
        const queue = this.queues.get(name) || [];
        queue.push(run);
        this.queues.set(name, queue);
      } else void run();
    });
  }
}
class MemoryStorage {
  values = new Map();
  writes = [];
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); this.writes.push(key); }
  removeItem(key) { this.values.delete(key); }
}
const freshState = () => ({ version: 1, steps: [] });
const validateState = state => state?.version === 1 && Array.isArray(state.steps) && state.steps.every(item => typeof item === 'string');
function setup() {
  const storage = new MemoryStorage();
  const locks = new Locks();
  const stores = [];
  const create = (extra = {}) => {
    const store = createAttemptStore({ storage, locks, freshState, validateState, ...extra });
    stores.push(store);
    return store;
  };
  return { storage, locks, create, cleanup: () => Promise.all(stores.map(store => store.dispose())) };
}
const rejectsCode = (promise, code) => assert.rejects(promise, error => error instanceof AttemptStoreError && error.code === code);
const legacyKey = 'decidobien-review-v1';

test('migration archives exact legacy bytes once and ignores subsequent old application writes', async () => {
  const env = setup();
  const original = '{ "version": 1, "steps": ["observed"] }';
  env.storage.setItem(legacyKey, original);
  const first = env.create();
  const migrated = await first.open();
  assert.equal(migrated.migration, 'imported');
  assert.deepEqual(migrated.state.steps, ['observed']);
  assert.equal(env.storage.getItem(LEGACY_ARCHIVE_KEY), original);
  env.storage.setItem(legacyKey, JSON.stringify({ version: 1, steps: ['obsolete'] }));
  const second = env.create();
  assert.deepEqual((await second.open()).state.steps, ['observed']);
  assert.equal(env.storage.getItem(LEGACY_ARCHIVE_KEY), original);
  assert.ok(env.storage.getItem(AUTHORITY_KEY));
  await env.cleanup();
});

test('invalid legacy remains archived while fresh valid state is used', async () => {
  const env = setup();
  env.storage.setItem(legacyKey, '{broken');
  const store = env.create();
  assert.equal((await store.open()).migration, 'invalid');
  assert.equal(env.storage.getItem(LEGACY_ARCHIVE_KEY), '{broken');
  assert.deepEqual((await store.load()).state, freshState());
  await env.cleanup();
});

test('legacy progress needs explicit recovery and an unowned import can start a fresh person', async () => {
  const env = setup();
  env.storage.setItem(legacyKey, JSON.stringify({ version: 1, steps: ['unknown-person'] }));
  const a = env.create();
  const imported = await a.open();
  const identityToken = newIdentityToken();
  await rejectsCode(a.claim(imported, { identityToken }), 'resume-required');
  const recovered = await a.claim(imported, { identityToken, resumeIdentity: true });
  assert.deepEqual(recovered.state.steps, ['unknown-person']);
  await a.release();
  const secondEnv = setup();
  secondEnv.storage.setItem(legacyKey, JSON.stringify({ version: 1, steps: ['unknown-person'] }));
  const b = secondEnv.create();
  const fresh = await b.reset(await b.open(), freshState(), { identityToken: newIdentityToken() });
  assert.deepEqual(fresh.state.steps, []);
  assert.equal(fresh.generation, 2);
  await Promise.all([env.cleanup(), secondEnv.cleanup()]);
});

test('competing stale saves cannot overwrite confirmed progress', async () => {
  const env = setup();
  const store = env.create();
  const owned = await store.claim(await store.open(), { identityToken: newIdentityToken() });
  const results = await Promise.allSettled([
    store.save(owned, { version: 1, steps: ['confirmed'] }),
    store.save(owned, { version: 1, steps: ['stale'] })
  ]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].reason.code, 'stale');
  assert.deepEqual((await store.load()).state.steps, ['confirmed']);
  await env.cleanup();
});

test('a live document needs explicit takeover and the previous owner is revoked', async () => {
  const env = setup();
  const a = env.create(), b = env.create();
  const identityToken = newIdentityToken();
  const original = await a.claim(await a.open(), { identityToken });
  const seen = await b.open();
  await rejectsCode(b.claim(seen, { identityToken }), 'takeover-required');
  const taken = await b.claim(seen, { identityToken, takeOver: true });
  assert.equal(taken.ownerId, b.ownerId);
  await rejectsCode(a.save(original, { version: 1, steps: ['late'] }), 'revoked');
  assert.deepEqual((await a.load()).state.steps, []);
  await env.cleanup();
});

test('release models reload: a new document resumes without claiming a live tab is dead', async () => {
  const env = setup();
  const a = env.create();
  const identityToken = newIdentityToken();
  const original = await a.claim(await a.open(), { identityToken });
  await a.release();
  await rejectsCode(a.save(original, freshState()), 'ownership-required');
  const b = env.create();
  const resumed = await b.claim(await b.open(), { identityToken });
  assert.equal(resumed.ownerId, b.ownerId);
  await env.cleanup();
});

test('different identity cannot silently inherit progress, even when the old document is gone', async () => {
  const env = setup();
  const a = env.create();
  const original = await a.claim(await a.open(), { identityToken: newIdentityToken() });
  await a.save(original, { version: 1, steps: ['prior-person'] });
  await a.release();
  const b = env.create();
  const seen = await b.open();
  const identityToken = newIdentityToken();
  await rejectsCode(b.claim(seen, { identityToken }), 'resume-required');
  const explicit = await b.claim(seen, { identityToken, resumeIdentity: true });
  assert.deepEqual(explicit.state.steps, ['prior-person']);
  const reset = await b.reset(explicit, freshState(), { identityToken: newIdentityToken() });
  assert.notEqual(reset.attemptId, explicit.attemptId);
  assert.equal(reset.generation, explicit.generation + 1);
  assert.deepEqual(reset.state.steps, []);
  await rejectsCode(b.save(explicit, { version: 1, steps: ['old'] }), 'stale');
  await env.cleanup();
});

test('close is durable, purges active progress and cannot be revived by a stale or legacy writer', async () => {
  const env = setup();
  const a = env.create();
  const owned = await a.claim(await a.open(), { identityToken: newIdentityToken() });
  const saved = await a.save(owned, { version: 1, steps: ['private-progress'] });
  const closed = await a.close(saved);
  assert.equal(closed.status, 'closed');
  assert.equal(closed.identityToken, null);
  assert.deepEqual(closed.state.steps, []);
  env.storage.setItem(legacyKey, JSON.stringify(saved.state));
  await rejectsCode(a.save(saved, saved.state), 'closed');
  const b = env.create();
  const afterReload = await b.open();
  assert.equal(afterReload.status, 'closed');
  await rejectsCode(b.claim(afterReload, { identityToken: newIdentityToken() }), 'closed');
  const reset = await b.reset(afterReload, freshState(), { identityToken: newIdentityToken() });
  assert.equal(reset.status, 'active');
  assert.deepEqual(reset.state.steps, []);
  await env.cleanup();
});

test('without Web Locks, existing authority is read only and no legacy migration is written', async () => {
  const env = setup();
  const initialized = await env.create().open();
  const unsupported = env.create({ locks: null });
  assert.equal(unsupported.readOnly, true);
  assert.deepEqual(await unsupported.open(), initialized);
  const writesBefore = env.storage.writes.length;
  await rejectsCode(unsupported.claim(initialized, { identityToken: newIdentityToken() }), 'unavailable');
  assert.equal(env.storage.writes.length, writesBefore);
  const empty = new MemoryStorage();
  const noAuthority = env.create({ storage: empty, locks: null });
  await rejectsCode(noAuthority.open(), 'unavailable');
  assert.equal(empty.writes.length, 0);
  await env.cleanup();
});

test('corrupt authority fails closed and never falls back to legacy progress', async () => {
  const env = setup();
  env.storage.setItem(AUTHORITY_KEY, '{broken');
  env.storage.setItem(legacyKey, JSON.stringify({ version: 1, steps: ['legacy'] }));
  const store = env.create();
  await rejectsCode(store.open(), 'corrupt');
  assert.equal(env.storage.getItem(AUTHORITY_KEY), '{broken');
  assert.equal(env.storage.getItem(LEGACY_ARCHIVE_KEY), null);
  await env.cleanup();
});

test('storage failures never report a successful save', async () => {
  const env = setup();
  const store = env.create();
  const owned = await store.claim(await store.open(), { identityToken: newIdentityToken() });
  env.storage.setItem = () => { throw new Error('quota'); };
  await rejectsCode(store.save(owned, { version: 1, steps: ['not-persisted'] }), 'unavailable');
  assert.deepEqual(JSON.parse(env.storage.getItem(AUTHORITY_KEY)).state.steps, []);
  assert.equal(store.readOnly, true);
  await env.cleanup();
});

test('cross-document notifications classify takeover, reset, close and old-JS writes', async () => {
  const env = setup();
  const target = new EventTarget();
  const a = env.create({ eventTarget: target }), b = env.create();
  const identityToken = newIdentityToken();
  await a.claim(await a.open(), { identityToken });
  const events = [];
  const unsubscribe = a.subscribe(event => events.push(event));
  function notify(key) { const event = new Event('storage'); event.key = key; target.dispatchEvent(event); }
  let ownedB = await b.claim(await b.open(), { identityToken, takeOver: true });
  notify(AUTHORITY_KEY);
  assert.equal(events.at(-1).type, 'revoked');
  ownedB = await b.reset(ownedB, freshState(), { identityToken: newIdentityToken() });
  notify(AUTHORITY_KEY);
  assert.equal(events.at(-1).type, 'reset');
  await b.close(ownedB);
  notify(AUTHORITY_KEY);
  assert.equal(events.at(-1).type, 'closed');
  notify(legacyKey);
  assert.equal(events.at(-1).type, 'legacy-write');
  unsubscribe();
  const count = events.length;
  notify(legacyKey);
  assert.equal(events.length, count);
  await env.cleanup();
});

test('saved state is captured before awaiting a lock and snapshots do not alias authority', async () => {
  const env = setup();
  const store = env.create();
  const owned = await store.claim(await store.open(), { identityToken: newIdentityToken() });
  const next = { version: 1, steps: ['captured'] };
  const saving = store.save(owned, next);
  next.steps.push('later-edit');
  const saved = await saving;
  saved.state.steps.push('external-mutation');
  assert.deepEqual((await store.load()).state.steps, ['captured']);
  await env.cleanup();
});
