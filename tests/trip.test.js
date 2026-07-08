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
