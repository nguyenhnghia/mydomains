# Nha Trang Trip Planner — Multi-User Sync Design

**Date:** 2026-07-08
**Status:** Approved
**Scope:** Add two-user (husband + wife) data sync to `nha-trang-07-2026.html`, currently a static page using localStorage only, deployed on Vercel. Must be free and low-effort.

## Decisions (settled with user)

- **Sync model:** sync on reload, not live/realtime. Pull on page load, push on save.
- **Backend:** Upstash Redis free tier via Vercel Marketplace integration. No new third-party account (Supabase/Firebase rejected).
- **Approach:** single JSON blob, last-write-wins (Approach A). Per-item merge rejected as overkill for 2 users.
- **Auth:** shared sync code entered once per device, checked server-side against an env var. Zero-auth rejected (endpoint scanners).
- **`collapsedDates` does not sync** — it is a per-device UI preference.

## Architecture

- Repo remains static files at root. One new file: `api/trip.js` — Vercel auto-detects serverless functions in `api/`.
- No npm dependencies and no `package.json`: the function calls Upstash's plain REST API with `fetch`.
- Env vars:
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — auto-injected by the Marketplace integration.
  - `TRIP_SECRET` — set manually by the user; the shared sync code.

## Data model

One Redis key `nhatrang:doc` storing a JSON string:

```json
{
  "itinerary": [ /* array of itinerary items, same shape as defaultNhaTrangData */ ],
  "budgetGoal": 8000000,
  "updatedAt": 1720400000000
}
```

`updatedAt` is `Date.now()` from the writing client.

## API — `api/trip.js`

| Method | Auth | Behavior |
|--------|------|----------|
| GET | `x-trip-secret` header must equal `TRIP_SECRET` | Return stored doc JSON, or `null` if key absent |
| PUT | same | Validate body (`itinerary` is array, `updatedAt` is number), overwrite `nhatrang:doc`, return 200 |
| other | — | 405 |

- Wrong/missing secret → 401.
- Invalid body → 400.
- Upstash REST errors → 502 with generic message.

## Page changes — `nha-trang-07-2026.html`

1. **Sync code prompt:** on load, if localStorage `nhatrang_sync_code` is missing, `prompt()` once and store it. If the user cancels, sync is disabled and the app behaves exactly as today (local-only).
2. **Pull on load:** render from localStorage immediately, then fetch `GET /api/trip` in the background. If server `updatedAt` is newer than local `nhatrang_updated_at`, replace `itinerary` and `budgetGoal`, persist locally, re-render, show toast "Đã đồng bộ".
3. **Push on save:** `saveToStorage()` and `saveBudgetGoal()` stamp `updatedAt = Date.now()` (stored in localStorage key `nhatrang_updated_at`), then a debounced (2s) `PUT /api/trip` sends the whole doc. Last write wins.
4. **localStorage keys:** existing keys unchanged; new keys `nhatrang_sync_code`, `nhatrang_updated_at`.

## Error handling

- Pull failure (offline, server error): silent — local copy renders as normal.
- Push failure: warning toast; local copy is already saved, next save retries the push.
- 401 response: clear `nhatrang_sync_code`, re-prompt on next load (typo recovery).
- Corrupt/unexpected server response: ignore, keep local data.
- Wrap existing `JSON.parse(localStorage.getItem(...))` calls in try/catch falling back to defaults (pre-existing fragility, issue #3 from review).

## Bundled data fix

Reset Day-1 demo state in `defaultNhaTrangData`: all six 2026-07-17 items get `completed: false, actual: 0` (issue #1 from review), so the first synced snapshot is clean.

## User setup steps (Vercel dashboard, once)

1. Import repo as a Vercel project.
2. Marketplace → Upstash Redis (free plan) → connect to the project.
3. Add `TRIP_SECRET` env var (any passphrase the two users share).
4. Deploy.

## Testing

- Run `vercel dev` locally with env vars set.
- Two browsers (normal + incognito) simulate the two devices.
- Verify: pull on load, push on save, second browser sees changes after reload, wrong sync code → 401 → re-prompt, offline (devtools) → app still works locally and push failure shows toast.

## Out of scope

- Realtime sync, per-item merge/conflict resolution, more than one shared trip document, user accounts.
