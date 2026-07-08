# Nha Trang Multi-User Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two-user (husband + wife) sync-on-reload data sharing for the Nha Trang trip planner, backed by Upstash Redis via one Vercel serverless function.

**Architecture:** Static HTML page keeps localStorage as its primary store (offline-first). A single serverless function `api/trip.js` gates GET/PUT of one whole-document JSON blob in Upstash Redis behind a shared-secret header. The page pulls on load (newer server copy wins) and pushes on save (debounced, last write wins).

**Tech Stack:** Vanilla JS in HTML, Vercel serverless function (Node, CommonJS, zero npm dependencies — Upstash plain REST API via `fetch`), Node built-in `node:test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-07-08-nha-trang-multi-user-sync-design.md`

**Note on scope:** Task 4 (`.vercelignore`) is not in the spec; added so `docs/` and `tests/` are not served publicly by the static deployment. Everything else maps 1:1 to spec sections.

---

### Task 1: Baseline commit + demo-data fix + safe JSON.parse

The page file is currently untracked in git. Commit it as-is first so later diffs are reviewable.

**Files:**
- Modify: `nha-trang-07-2026.html` (defaultNhaTrangData Day-1 items ~lines 266–271; state variables ~lines 303–308)

- [ ] **Step 1: Commit the untracked page as baseline**

```bash
git add nha-trang-07-2026.html
git commit -m "feat: add Nha Trang trip planner page (baseline)"
```

- [ ] **Step 2: Reset Day-1 demo state in defaultNhaTrangData**

The six Day-1 items (`nt1`–`nt6`, date `2026-07-17`) currently ship `completed: true` with filled `actual` values — pre-completed before the trip exists. In each of those six object literals, change:

- `completed: true` → `completed: false`
- `actual: <any number>` → `actual: 0`

Example — first item before:

```js
{ id: "nt1", date: "2026-07-17", time: "06:00", category: "transport", activity: "Bay/Di chuyển đến Nha Trang", location: "Sân bay Cam Ranh / Ga Nha Trang", budget: 1500000, actual: 1450000, completed: true, notes: "Đặt vé khứ hồi sớm để có giá tốt. Nhớ mang theo CCCD." },
```

after:

```js
{ id: "nt1", date: "2026-07-17", time: "06:00", category: "transport", activity: "Bay/Di chuyển đến Nha Trang", location: "Sân bay Cam Ranh / Ga Nha Trang", budget: 1500000, actual: 0, completed: false, notes: "Đặt vé khứ hồi sớm để có giá tốt. Nhớ mang theo CCCD." },
```

Apply the same two changes to `nt2` (actual 1200000), `nt3` (75000), `nt4` (260000), `nt5` (320000), `nt6` (40000). Items `nt7`–`nt19` are already `completed: false, actual: 0` — leave untouched.

- [ ] **Step 3: Guard localStorage JSON.parse calls**

Replace this block:

```js
        // App state variables
        let itinerary = JSON.parse(localStorage.getItem('nhatrang_itinerary')) || defaultNhaTrangData;
        let budgetGoal = parseFloat(localStorage.getItem('nhatrang_budget_goal')) || 8000000;
        let currentFilter = 'all';
        let currentCategoryFilter = 'all';
        let collapsedDates = JSON.parse(localStorage.getItem('nhatrang_collapsed_dates')) || [];
```

with:

```js
        // Safe JSON.parse: corrupt localStorage falls back to defaults instead of killing the app
        function safeParse(raw, fallback) {
            try {
                const parsed = JSON.parse(raw);
                return (parsed === null || parsed === undefined) ? fallback : parsed;
            } catch (e) {
                return fallback;
            }
        }

        // App state variables
        let itinerary = safeParse(localStorage.getItem('nhatrang_itinerary'), defaultNhaTrangData);
        let budgetGoal = parseFloat(localStorage.getItem('nhatrang_budget_goal')) || 8000000;
        let currentFilter = 'all';
        let currentCategoryFilter = 'all';
        let collapsedDates = safeParse(localStorage.getItem('nhatrang_collapsed_dates'), []);
```

- [ ] **Step 4: Manual check in browser**

```bash
open nha-trang-07-2026.html
```

Open devtools console first, then in the console run `localStorage.clear()` and reload. Expected: progress shows `0/19`, total spent 0 ₫, no console errors. Then run `localStorage.setItem('nhatrang_itinerary', '{corrupt')` and reload. Expected: app still renders (falls back to defaults), no uncaught exception. Run `localStorage.clear()` again afterwards.

- [ ] **Step 5: Commit**

```bash
git add nha-trang-07-2026.html
git commit -m "fix: reset Day-1 demo state, guard localStorage JSON.parse"
```

---

### Task 2: Serverless function `api/trip.js` (TDD)

**Files:**
- Create: `api/trip.js`
- Test: `tests/trip.test.js`

The function is CommonJS so Node's built-in test runner can `require` it with zero dependencies. Vercel injects `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Marketplace integration) and `TRIP_SECRET` (manual). Upstash REST protocol: `POST <url>` with JSON body `["GET", "key"]` / `["SET", "key", "value"]`, `Authorization: Bearer <token>`, response `{"result": ...}`.

- [ ] **Step 1: Write failing auth tests**

Create `tests/trip.test.js`:

```js
const { test, beforeEach } = require('node:test');
const assert = require('node:assert');

process.env.TRIP_SECRET = 'test-secret';
process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token';

const handler = require('../api/trip.js');

function mockRes() {
    return {
        statusCode: null,
        body: null,
        headers: {},
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
        setHeader(key, value) { this.headers[key] = value; }
    };
}

function mockReq({ method = 'GET', secret = 'test-secret', body = undefined } = {}) {
    return { method, headers: secret === null ? {} : { 'x-trip-secret': secret }, body };
}

// Replace global fetch per test; capture calls for assertions
let fetchCalls;
function stubFetch(result, { ok = true, status = 200 } = {}) {
    fetchCalls = [];
    global.fetch = async (url, opts) => {
        fetchCalls.push({ url, opts });
        return { ok, status, json: async () => ({ result }) };
    };
}

beforeEach(() => {
    stubFetch(null);
});

test('GET without secret header returns 401', async () => {
    const res = mockRes();
    await handler(mockReq({ secret: null }), res);
    assert.strictEqual(res.statusCode, 401);
});

test('GET with wrong secret returns 401', async () => {
    const res = mockRes();
    await handler(mockReq({ secret: 'wrong' }), res);
    assert.strictEqual(res.statusCode, 401);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test tests/
```

Expected: FAIL — `Cannot find module '../api/trip.js'`.

- [ ] **Step 3: Implement auth skeleton**

Create `api/trip.js`:

```js
const KEY = 'nhatrang:doc';

async function redis(command) {
    const resp = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
    });
    if (!resp.ok) throw new Error(`Upstash error: ${resp.status}`);
    const data = await resp.json();
    return data.result;
}

module.exports = async function handler(req, res) {
    const secret = process.env.TRIP_SECRET;
    if (!secret || req.headers['x-trip-secret'] !== secret) {
        return res.status(401).json({ error: 'unauthorized' });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method not allowed' });
};
```

- [ ] **Step 4: Run tests to verify auth tests pass**

```bash
node --test tests/
```

Expected: 2 pass, 0 fail.

- [ ] **Step 5: Write failing GET tests**

Append to `tests/trip.test.js`:

```js
test('GET with no stored doc returns null', async () => {
    stubFetch(null);
    const res = mockRes();
    await handler(mockReq(), res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body, null);
    assert.deepStrictEqual(JSON.parse(fetchCalls[0].opts.body), ['GET', 'nhatrang:doc']);
});

test('GET returns parsed stored doc', async () => {
    const doc = { itinerary: [{ id: 'nt1' }], budgetGoal: 8000000, updatedAt: 123 };
    stubFetch(JSON.stringify(doc));
    const res = mockRes();
    await handler(mockReq(), res);
    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, doc);
});

test('GET returns 502 when storage fails', async () => {
    stubFetch(null, { ok: false, status: 500 });
    const res = mockRes();
    await handler(mockReq(), res);
    assert.strictEqual(res.statusCode, 502);
});
```

- [ ] **Step 6: Run tests to verify GET tests fail**

```bash
node --test tests/
```

Expected: the 3 new tests FAIL (handler currently answers 405 to GET); 2 auth tests still pass.

- [ ] **Step 7: Implement GET**

In `api/trip.js`, insert between the auth check and the 405 fallthrough:

```js
    if (req.method === 'GET') {
        try {
            const raw = await redis(['GET', KEY]);
            return res.status(200).json(raw ? JSON.parse(raw) : null);
        } catch (err) {
            return res.status(502).json({ error: 'storage unavailable' });
        }
    }
```

- [ ] **Step 8: Run tests to verify GET tests pass**

```bash
node --test tests/
```

Expected: 5 pass, 0 fail.

- [ ] **Step 9: Write failing PUT and 405 tests**

Append to `tests/trip.test.js`:

```js
test('PUT with valid doc stores it and returns ok', async () => {
    stubFetch('OK');
    const res = mockRes();
    const doc = { itinerary: [{ id: 'nt1' }], budgetGoal: 5000000, updatedAt: 456 };
    await handler(mockReq({ method: 'PUT', body: doc }), res);
    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, { ok: true });
    const cmd = JSON.parse(fetchCalls[0].opts.body);
    assert.strictEqual(cmd[0], 'SET');
    assert.strictEqual(cmd[1], 'nhatrang:doc');
    assert.deepStrictEqual(JSON.parse(cmd[2]), doc);
});

test('PUT with non-array itinerary returns 400', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'PUT', body: { itinerary: 'nope', updatedAt: 1 } }), res);
    assert.strictEqual(res.statusCode, 400);
});

test('PUT with missing updatedAt returns 400', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'PUT', body: { itinerary: [] } }), res);
    assert.strictEqual(res.statusCode, 400);
});

test('PUT returns 502 when storage fails', async () => {
    stubFetch(null, { ok: false, status: 500 });
    const res = mockRes();
    await handler(mockReq({ method: 'PUT', body: { itinerary: [], budgetGoal: 1, updatedAt: 1 } }), res);
    assert.strictEqual(res.statusCode, 502);
});

test('unsupported method returns 405 with Allow header', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'DELETE' }), res);
    assert.strictEqual(res.statusCode, 405);
    assert.strictEqual(res.headers['Allow'], 'GET, PUT');
});
```

- [ ] **Step 10: Run tests to verify PUT tests fail**

```bash
node --test tests/
```

Expected: the 4 PUT tests FAIL; the 405 test passes already; 5 earlier tests pass.

- [ ] **Step 11: Implement PUT**

In `api/trip.js`, insert after the GET block, before the 405 fallthrough:

```js
    if (req.method === 'PUT') {
        const doc = req.body;
        if (!doc || !Array.isArray(doc.itinerary) || typeof doc.updatedAt !== 'number') {
            return res.status(400).json({ error: 'invalid doc' });
        }
        const clean = {
            itinerary: doc.itinerary,
            budgetGoal: typeof doc.budgetGoal === 'number' ? doc.budgetGoal : 0,
            updatedAt: doc.updatedAt
        };
        try {
            await redis(['SET', KEY, JSON.stringify(clean)]);
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(502).json({ error: 'storage unavailable' });
        }
    }
```

- [ ] **Step 12: Run full test suite**

```bash
node --test tests/
```

Expected: 10 pass, 0 fail.

- [ ] **Step 13: Commit**

```bash
git add api/trip.js tests/trip.test.js
git commit -m "feat: add /api/trip serverless function with shared-secret auth"
```

---

### Task 3: Client sync in `nha-trang-07-2026.html`

**Files:**
- Modify: `nha-trang-07-2026.html` (state block from Task 1; `saveBudgetGoal`; `saveToStorage`; `window.onload`)

Key invariant: `pullFromServer` writes localStorage **directly** — it must NOT call `saveToStorage()`, which would schedule a push and echo the pull back to the server.

- [ ] **Step 1: Add sync module after the state variables block**

Immediately after the `let collapsedDates = safeParse(...)` line (end of the state block from Task 1 Step 3), insert:

```js
        // --- Two-user sync via /api/trip (see docs/superpowers/specs/2026-07-08-nha-trang-multi-user-sync-design.md) ---
        const SYNC_DEBOUNCE_MS = 2000;
        let syncCode = localStorage.getItem('nhatrang_sync_code');
        let updatedAt = parseInt(localStorage.getItem('nhatrang_updated_at'), 10) || 0;
        let pushTimer = null;

        function ensureSyncCode() {
            if (syncCode) return true;
            const entered = prompt('Nhập mã đồng bộ để chia sẻ lịch trình với người đồng hành.\nBấm Cancel để dùng chế độ offline (chỉ lưu trên máy này):');
            if (!entered || !entered.trim()) return false;
            syncCode = entered.trim();
            localStorage.setItem('nhatrang_sync_code', syncCode);
            return true;
        }

        async function pullFromServer() {
            if (!syncCode) return;
            try {
                const resp = await fetch('/api/trip', { headers: { 'x-trip-secret': syncCode } });
                if (resp.status === 401) {
                    localStorage.removeItem('nhatrang_sync_code');
                    syncCode = null;
                    showToast('Mã đồng bộ không đúng — sẽ hỏi lại khi tải lại trang.', 'warning');
                    return;
                }
                if (!resp.ok) return;
                const doc = await resp.json();
                if (!doc || !Array.isArray(doc.itinerary) || typeof doc.updatedAt !== 'number') return;
                if (doc.updatedAt > updatedAt) {
                    itinerary = doc.itinerary;
                    if (typeof doc.budgetGoal === 'number' && doc.budgetGoal > 0) budgetGoal = doc.budgetGoal;
                    updatedAt = doc.updatedAt;
                    // Write localStorage directly — do NOT call saveToStorage(), it would push the pull back up
                    localStorage.setItem('nhatrang_itinerary', JSON.stringify(itinerary));
                    localStorage.setItem('nhatrang_budget_goal', budgetGoal);
                    localStorage.setItem('nhatrang_updated_at', String(updatedAt));
                    updateDashboard();
                    renderItinerary();
                    showToast('Đã đồng bộ dữ liệu mới nhất từ người đồng hành!', 'success');
                }
            } catch (e) {
                // Offline or server down — local copy renders as normal
            }
        }

        function schedulePush() {
            if (!syncCode) return;
            updatedAt = Date.now();
            localStorage.setItem('nhatrang_updated_at', String(updatedAt));
            clearTimeout(pushTimer);
            pushTimer = setTimeout(pushToServer, SYNC_DEBOUNCE_MS);
        }

        async function pushToServer() {
            if (!syncCode) return;
            try {
                const resp = await fetch('/api/trip', {
                    method: 'PUT',
                    headers: { 'x-trip-secret': syncCode, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itinerary, budgetGoal, updatedAt })
                });
                if (!resp.ok) {
                    showToast('Không thể đồng bộ lên máy chủ — dữ liệu vẫn được lưu trên máy này.', 'warning');
                }
            } catch (e) {
                showToast('Không thể đồng bộ (mất mạng?) — dữ liệu vẫn được lưu trên máy này.', 'warning');
            }
        }
```

- [ ] **Step 2: Hook pushes into both save paths**

In `saveToStorage()`, add `schedulePush();` as the last line:

```js
        function saveToStorage() {
            localStorage.setItem('nhatrang_itinerary', JSON.stringify(itinerary));
            updateDashboard();
            renderItinerary();
            schedulePush();
        }
```

In `saveBudgetGoal(val)`, add `schedulePush();` after the `localStorage.setItem` line:

```js
        function saveBudgetGoal(val) {
            const cleanVal = val.toString().replace(/\./g, '');
            const num = parseFloat(cleanVal) || 0;
            budgetGoal = num;
            localStorage.setItem('nhatrang_budget_goal', num);
            schedulePush();
            showToast("Hạn mức tổng chi tiêu đã được cập nhật thành công!", 'success');
            updateDashboard();
        }
```

- [ ] **Step 3: Wire sync into app init**

Replace `window.onload`:

```js
        // App Initializer
        window.onload = function() {
            renderCategoryFilterButtons();
            updateDashboard();
            renderItinerary();
            if (ensureSyncCode()) pullFromServer();
        }
```

- [ ] **Step 4: Manual check in browser (no backend yet)**

```bash
open nha-trang-07-2026.html
```

Expected, with devtools console open:
1. Sync-code prompt appears on load. Click Cancel → app renders normally, no errors, no further sync attempts (check Network tab: no `/api/trip` request).
2. Reload, enter code `abc` → app renders; one failed `/api/trip` fetch in Network tab (file:// context — this failure must be silent, no toast, no console exception).
3. Tick any checkbox → after ~2s one failed PUT appears in Network tab and the warning toast "Không thể đồng bộ..." shows. Checkbox state survives reload (localStorage still works).
4. Run `localStorage.clear()` in console when done.

- [ ] **Step 5: Commit**

```bash
git add nha-trang-07-2026.html
git commit -m "feat: sync itinerary and budget between devices via /api/trip"
```

---

### Task 4: `.vercelignore`

**Files:**
- Create: `.vercelignore`

- [ ] **Step 1: Create `.vercelignore`**

```
docs/
tests/
```

Keeps design docs and unit tests out of the public static deployment. `api/` must NOT be listed — Vercel builds functions from it.

- [ ] **Step 2: Commit**

```bash
git add .vercelignore
git commit -m "chore: exclude docs and tests from Vercel deployment"
```

---

### Task 5: Deploy + end-to-end verification

Steps 1–4 happen in the Vercel dashboard (user action). Steps 5–6 verify the live deployment.

- [ ] **Step 1 (user): Import repo as Vercel project** — vercel.com → Add New → Project → import the `nhnghia.domains` repo. Framework preset: Other. No build command, no output directory override.

- [ ] **Step 2 (user): Attach Upstash Redis** — Project → Storage (or Marketplace) → Upstash Redis → free plan → connect to project. Confirm env vars `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` appear under Project → Settings → Environment Variables.

- [ ] **Step 3 (user): Set `TRIP_SECRET`** — same Environment Variables page → add `TRIP_SECRET` = shared passphrase (any string you and your wife agree on). Apply to Production.

- [ ] **Step 4 (user): Deploy** — push `main` (or click Redeploy so the env vars take effect).

- [ ] **Step 5: API smoke test from terminal**

```bash
SITE=https://<your-project>.vercel.app
curl -s -o /dev/null -w "%{http_code}\n" "$SITE/api/trip"                       # expect 401
curl -s -H "x-trip-secret: <TRIP_SECRET>" "$SITE/api/trip"                      # expect: null (nothing stored yet)
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE -H "x-trip-secret: <TRIP_SECRET>" "$SITE/api/trip"  # expect 405
```

- [ ] **Step 6: Two-browser end-to-end check**

1. Browser A (normal window): open `$SITE/nha-trang-07-2026.html`, enter the sync code, tick one Day-1 item. Wait 3s.
2. Browser B (incognito): open same URL, enter same code. Expected: toast "Đã đồng bộ dữ liệu mới nhất..." and the item ticked.
3. In B, change budget goal to another number. Wait 3s, reload A. Expected: A shows B's budget goal.
4. In A, enter a wrong sync code flow: run `localStorage.setItem('nhatrang_sync_code', 'wrong')` in console, reload. Expected: warning toast about wrong code; reload again → prompt reappears.
5. Devtools → Network → Offline in A, tick an item. Expected: warning toast, tick preserved locally; go back Online, tick another item → push succeeds (200 PUT in Network tab).

- [ ] **Step 7: Final commit of any tweaks and push**

```bash
git status   # confirm clean or commit leftover fixes
git push
```
