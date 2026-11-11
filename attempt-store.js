// Only this authority is writable by the new application. The legacy key is
// deliberately never consulted after creation, including after a close/reset.
export const ATTEMPT_SUFFIX = ':attempt-authority-v1';
export const LEGACY_BACKUP_SUFFIX = ':legacy-original-v1';
export const AUTHORITY_KEY = 'decidobien-review-v1' + ATTEMPT_SUFFIX;
export const LEGACY_ARCHIVE_KEY = 'decidobien-review-v1' + LEGACY_BACKUP_SUFFIX;

export class AttemptStoreError extends Error {
  constructor(code, current = null, cause) {
    super(code, cause ? { cause } : undefined);
    this.name = 'AttemptStoreError';
    this.code = code;
    this.current = current;
  }
}

export function newIdentityToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // This is a local correlation token, never an authentication credential.
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

const copy = value => JSON.parse(JSON.stringify(value));
const token = value => typeof value === 'string' && value.length >= 1 && value.length <= 200;

export function createAttemptStore(options = {}) {
  const {
    legacyKey = 'decidobien-review-v1', validateState, freshState,
    ownerId = newIdentityToken(), eventTarget = globalThis.window
  } = options;
  if (typeof validateState !== 'function' || typeof freshState !== 'function' || !token(ownerId)) {
    throw new TypeError('validateState, freshState and an opaque ownerId are required');
  }
  let storage, locks;
  try {
    storage = Object.hasOwn(options, 'storage') ? options.storage : globalThis.localStorage;
    locks = Object.hasOwn(options, 'locks') ? options.locks : globalThis.navigator?.locks;
  } catch { /* Unavailable browser storage is handled without writing. */ }
  const authorityKey = legacyKey + ATTEMPT_SUFFIX;
  const backupKey = legacyKey + LEGACY_BACKUP_SUFFIX;
  const transactionLock = `${authorityKey}:transaction`;
  const ownerLock = id => `${authorityKey}:owner:${id}`;
  const listeners = new Set();
  let known = null;
  let releaseOwner = null;
  let ownerRequest = null;
  let unavailable = !storage || typeof locks?.request !== 'function';
  const emit = (type, current = known) => {
    const event = { type, current: current ? copy(current) : null };
    for (const listener of listeners) {
      try { listener(event); } catch { /* A UI observer cannot break persistence. */ }
    }
  };
  function failUnavailable(cause) {
    unavailable = true;
    emit('unavailable');
    return new AttemptStoreError('unavailable', known ? copy(known) : null, cause);
  }
  function read(key) {
    try { return storage.getItem(key); } catch (cause) { throw failUnavailable(cause); }
  }
  function write(key, value) {
    try { storage.setItem(key, value); } catch (cause) { throw failUnavailable(cause); }
  }
  function isSnapshot(value) {
    return value && value.schema === 1 && token(value.attemptId) &&
      Number.isSafeInteger(value.generation) && value.generation >= 1 &&
      Number.isSafeInteger(value.revision) && value.revision >= 0 &&
      ['active', 'closed'].includes(value.status) &&
      (value.ownerId === null || token(value.ownerId)) &&
      (value.identityToken === null || token(value.identityToken)) &&
      ['none', 'imported', 'invalid'].includes(value.migration) &&
      validateState(value.state);
  }
  function readAuthority() {
    const raw = read(authorityKey);
    if (raw === null) return null;
    let result;
    try { result = JSON.parse(raw); } catch { throw new AttemptStoreError('corrupt', known); }
    if (!isSnapshot(result)) throw new AttemptStoreError('corrupt', known);
    return result;
  }
  function remember(value) { known = copy(value); return copy(value); }
  function persist(value) {
    if (!isSnapshot(value)) throw new AttemptStoreError('invalid-state', known);
    write(authorityKey, JSON.stringify(value));
    return remember(value);
  }
  async function atomic(operation) {
    if (unavailable) throw failUnavailable();
    try {
      return await locks.request(transactionLock, { mode: 'exclusive' }, operation);
    } catch (error) {
      if (error instanceof AttemptStoreError) throw error;
      throw failUnavailable(error);
    }
  }
  function requireCurrent(expected, { active = true, owned = false } = {}) {
    const current = readAuthority();
    if (!current) throw new AttemptStoreError('corrupt', null);
    remember(current);
    if (!expected || expected.attemptId !== current.attemptId || expected.generation !== current.generation) {
      throw new AttemptStoreError('stale', copy(current));
    }
    if (active && current.status === 'closed') throw new AttemptStoreError('closed', copy(current));
    if (owned && current.ownerId !== ownerId) throw new AttemptStoreError('revoked', copy(current));
    if (expected.revision !== current.revision) throw new AttemptStoreError('stale', copy(current));
    if (owned && !releaseOwner) throw new AttemptStoreError('ownership-required', copy(current));
    return current;
  }
  async function ownerIsLive(id) {
    if (!id) return false;
    return locks.request(ownerLock(id), { mode: 'exclusive', ifAvailable: true }, lock => !lock);
  }
  async function holdOwner() {
    if (releaseOwner) return;
    await new Promise((resolve, reject) => {
      ownerRequest = locks.request(ownerLock(ownerId), { mode: 'exclusive', ifAvailable: true }, async lock => {
        if (!lock) { reject(new AttemptStoreError('takeover-required', known)); return; }
        await new Promise(release => { releaseOwner = release; resolve(); });
      });
      ownerRequest.catch(reject);
    });
  }
  async function release() {
    if (releaseOwner) {
      const release = releaseOwner;
      releaseOwner = null;
      release();
      await ownerRequest;
      ownerRequest = null;
    }
  }
  async function open() {
    if (unavailable) {
      // Existing authority can be inspected, but there is no unsafe CAS fallback.
      if (storage) {
        const current = readAuthority();
        if (current) return remember(current);
      }
      throw failUnavailable();
    }
    return atomic(() => {
      const existing = readAuthority();
      if (existing) return remember(existing);
      // A write-ahead immutable backup also makes an interrupted migration
      // deterministic if an older tab writes the legacy key before retry.
      const savedBackup = read(backupKey);
      const raw = savedBackup === null ? read(legacyKey) : savedBackup;
      if (savedBackup === null && raw !== null) write(backupKey, raw);
      let state = freshState();
      let migration = raw === null ? 'none' : 'invalid';
      if (raw !== null && raw.length <= 65536) {
        try {
          const legacy = JSON.parse(raw);
          if (validateState(legacy)) { state = legacy; migration = 'imported'; }
        } catch { /* Keep the original bytes and start from validated fresh state. */ }
      }
      return persist({ schema: 1, attemptId: newIdentityToken(), generation: 1,
        revision: 0, status: 'active', state: copy(state), ownerId: null,
        identityToken: null, migration });
    });
  }
  async function claim(expected, { identityToken, takeOver = false, resumeIdentity = false } = {}) {
    if (!token(identityToken)) throw new AttemptStoreError('identity-required', known);
    return atomic(async () => {
      const current = requireCurrent(expected);
      if (current.migration === 'imported' && current.identityToken === null && !resumeIdentity) {
        throw new AttemptStoreError('resume-required', copy(current));
      }
      if (current.identityToken && identityToken !== current.identityToken && !resumeIdentity) {
        throw new AttemptStoreError('resume-required', copy(current));
      }
      if (current.ownerId && current.ownerId !== ownerId && await ownerIsLive(current.ownerId) && !takeOver) {
        throw new AttemptStoreError('takeover-required', copy(current));
      }
      await holdOwner();
      return persist({ ...current, revision: current.revision + 1, ownerId, identityToken });
    });
  }
  async function save(expected, state) {
    if (!validateState(state)) throw new AttemptStoreError('invalid-state', known);
    // Capture before waiting for the lock; later UI mutations cannot change it.
    const next = copy(state);
    return atomic(() => {
      const current = requireCurrent(expected, { owned: true });
      return persist({ ...current, revision: current.revision + 1, state: next });
    });
  }
  async function close(expected) {
    return atomic(async () => {
      const current = requireCurrent(expected, { owned: true });
      const result = persist({ ...current, revision: current.revision + 1, status: 'closed',
        state: copy(freshState()), ownerId: null, identityToken: null });
      // Release under the transaction lock so a simultaneous reset cannot
      // acquire this document's liveness guard and have it released afterward.
      await release();
      return result;
    });
  }
  async function reset(expected, state, { identityToken } = {}) {
    if (!token(identityToken)) throw new AttemptStoreError('identity-required', known);
    if (!validateState(state)) throw new AttemptStoreError('invalid-state', known);
    const next = copy(state);
    return atomic(async () => {
      const current = requireCurrent(expected, { active: false });
      if (current.status === 'active' && current.ownerId !== null && current.ownerId !== ownerId) {
        throw new AttemptStoreError('revoked', copy(current));
      }
      if (current.status === 'active' && current.ownerId !== null && !releaseOwner) {
        throw new AttemptStoreError('ownership-required', copy(current));
      }
      await holdOwner();
      return persist({ ...current, attemptId: newIdentityToken(), generation: current.generation + 1,
        revision: 0, status: 'active', state: next, ownerId, identityToken });
    });
  }
  function onStorage(event) {
    if (event.storageArea && event.storageArea !== storage) return;
    if (event.key === legacyKey) { emit('legacy-write'); return; }
    if (event.key !== authorityKey && event.key !== null) return;
    try {
      const previous = known;
      const current = readAuthority();
      if (!current) { emit('unavailable'); return; }
      remember(current);
      if (current.status === 'closed') emit('closed');
      else if (previous && (previous.attemptId !== current.attemptId || previous.generation !== current.generation)) emit('reset');
      else if (previous?.ownerId === ownerId && current.ownerId !== ownerId) emit('revoked');
      else emit('changed');
    } catch { emit('unavailable'); }
  }
  eventTarget?.addEventListener('storage', onStorage);
  return {
    ownerId, authorityKey, backupKey,
    get readOnly() { return unavailable; },
    open, load: open, claim, save, close, reset, release,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    async dispose() {
      eventTarget?.removeEventListener('storage', onStorage);
      listeners.clear();
      await release();
    }
  };
}
