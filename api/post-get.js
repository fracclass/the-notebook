// Fetches a single full article (including body and sources) by id.

function deepParse(raw) {
  let val = raw;
  let i = 0;
  while (typeof val === "string" && i < 20) {
    try { val = JSON.parse(val); } catch { break; }
    i++;
  }
  return val;
}

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    const r = await fetch(`${url}/get/nb_post:${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    const post = deepParse(d.result);
    return res.status(200).json({ post: post || null });
  } catch (e) {
    return res.status(200).json({ post: null });
  }
}