// Returns a single full article by id

function safeParse(raw) {
  let val = raw;
  for (let i = 0; i < 20; i++) {
    if (typeof val !== "string") break;
    try { val = JSON.parse(val); } catch { break; }
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
    let post = safeParse(d.result);

    // If it came back as an array (old bug), unwrap it
    if (Array.isArray(post)) post = post[0];

    return res.status(200).json({ post: post || null });
  } catch (e) {
    return res.status(200).json({ post: null });
  }
}