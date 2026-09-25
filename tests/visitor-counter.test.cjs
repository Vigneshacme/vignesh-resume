const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function store(initial = 800) {
  const data = { count: initial, unrelated: 'preserved' };
  const state = { data, fail: false };
  const firestore = () => ({ collection(name) {
    assert.equal(name, 'stats');
    return { doc(id) {
      assert.equal(id, 'visitors');
      return {
        async set(update, options) {
          if (state.fail) throw new Error('offline');
          assert.equal(options.merge, true);
          data.count += update.count.increment;
        },
        async get() { return { data: () => ({ ...data }) }; },
      };
    } };
  } });
  firestore.FieldValue = { increment: n => ({ increment: n }), serverTimestamp: () => 'timestamp' };
  state.admin = { apps: [], initializeApp() {}, firestore };
  return state;
}

function loadHandler(state) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync('api/track-hit.js', 'utf8'), {
    module, require: name => { assert.equal(name, 'firebase-admin'); return state.admin; },
    process: { env: {} }, console: { error() {} },
  });
  return module.exports;
}

async function call(handler, method = 'GET') {
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() {} };
  await handler({ method }, response);
  return response;
}

test('cold starts and redeploys preserve existing Firestore count and metadata', async () => {
  const state = store();
  assert.equal((await call(loadHandler(state))).body.count, 801);
  assert.equal((await call(loadHandler(state))).body.count, 802);
  assert.equal(state.data.unrelated, 'preserved');
  const result = await call(loadHandler(state));
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.equal(result.body.storage, 'firestore');
});

test('concurrent instances do not overwrite the accumulated count', async () => {
  const state = store();
  await Promise.all(Array.from({ length: 20 }, () => call(loadHandler(state))));
  assert.equal(state.data.count, 820);
});

test('Firestore failure never substitutes a fabricated count; recovery continues total', async () => {
  const state = store();
  state.fail = true;
  const result = await call(loadHandler(state));
  assert.equal(result.code, 503);
  assert.equal(result.body.success, false);
  assert.equal(result.body.count, undefined);
  state.fail = false;
  assert.equal((await call(loadHandler(state))).body.count, 801);
});

test('preflight and unsupported methods do not increment', async () => {
  const state = store();
  assert.equal((await call(loadHandler(state), 'OPTIONS')).code, 200);
  assert.equal((await call(loadHandler(state), 'DELETE')).code, 405);
  assert.equal(state.data.count, 800);
});

for (const payload of [null, { success: true, count: 153, storage: 'memory-fallback' }, { success: true, count: 42, storage: 'firestore' }]) {
  test(`browser displays only a verified persistent count: ${JSON.stringify(payload)}`, async () => {
    const element = {};
    let requests = 0;
    const context = vm.createContext({
      document: { addEventListener() {}, getElementById: () => element },
      fetch: async () => { requests++; return { ok: payload !== null, json: async () => payload }; },
    });
    vm.runInContext(fs.readFileSync('public/app.js', 'utf8'), context);
    vm.runInContext('animateCounter = (element, count) => { element.textContent = String(count); }', context);
    await vm.runInContext('initHitTracker()', context);
    assert.equal(requests, 1);
    assert.equal(element.textContent, payload?.storage === 'firestore' ? '42' : 'Unavailable');
  });
}
