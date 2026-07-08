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
    if (req.method === 'GET') {
        try {
            const raw = await redis(['GET', KEY]);
            return res.status(200).json(raw ? JSON.parse(raw) : null);
        } catch (err) {
            return res.status(502).json({ error: 'storage unavailable' });
        }
    }

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

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method not allowed' });
};
