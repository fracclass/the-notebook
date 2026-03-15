// Deletes an article: removes from nb_index and deletes nb_post:{id}

function safeParse(raw) {
  let val = raw;
  for (let i = 0; i < 20; i++) {
    if (typeof val !== "string") break;
    try { val = JSON.parse(val); } catch { break; }
  }
  return val;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // Remove from index
    const r = await fetch(`${url}/get/nb_index`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    let index = safeParse(d.result);
    if (Array.isArray(index)) {
      index = index.filter(p => p.id !== id);
      await fetch(`${url}/set/nb_index`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([JSON.stringify(index)])
      });
    }

    // Delete individual post key
    await fetch(`${url}/del/nb_post:${id}`, { headers: { Authorization: `Bearer ${token}` } });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Delete failed" });
  }
}