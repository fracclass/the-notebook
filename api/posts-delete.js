export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/nb_posts`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    const d = await r.json();
    const posts = d.result ? JSON.parse(d.result) : [];
    const updated = Array.isArray(posts) ? posts.filter(p => p.id !== id) : [];
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/nb_posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([JSON.stringify(updated)])
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Delete failed" });
  }
}