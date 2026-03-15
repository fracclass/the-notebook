// Saves a single article to nb_post:{id} and updates nb_index

function safeParse(raw) {
  let val = raw;
  for (let i = 0; i < 20; i++) {
    if (typeof val !== "string") break;
    try { val = JSON.parse(val); } catch { break; }
  }
  return val;
}

async function upstashSet(url, token, key, value) {
  const res = await fetch(`${url}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([JSON.stringify(value)])
  });
  return res.ok;
}

async function upstashGet(url, token, key) {
  const r = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
  return d.result ?? null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { post } = req.body;
  if (!post?.id) return res.status(400).json({ error: "Missing post or id" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // 1. Save full article (single object, no array wrapping)
    await upstashSet(url, token, `nb_post:${post.id}`, post);

    // 2. Update index with lightweight metadata only
    const { body, sources, ...meta } = post;

    const indexRaw = await upstashGet(url, token, "nb_index");
    let index = safeParse(indexRaw);

    // Rebuild clean index if corrupted
    if (!Array.isArray(index) || (index.length > 0 && !index[0]?.id)) {
      index = [];
    }

    const i = index.findIndex(p => p.id === post.id);
    if (i >= 0) { index[i] = meta; } else { index = [meta, ...index]; }

    await upstashSet(url, token, "nb_index", index);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("posts-set error:", e);
    return res.status(500).json({ error: "Save failed" });
  }
}