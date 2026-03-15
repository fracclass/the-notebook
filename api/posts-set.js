// Saves a single article.
// Writes the full article to nb_post:{id} and updates nb_index with lightweight metadata.

function deepParse(raw) {
  let val = raw;
  let i = 0;
  while (typeof val === "string" && i < 20) {
    try { val = JSON.parse(val); } catch { break; }
    i++;
  }
  return val;
}

async function redisGet(url, token, key) {
  const r = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
  return d.result ?? null;
}

async function redisSet(url, token, key, value) {
  await fetch(`${url}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([JSON.stringify(value)])
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { post } = req.body;
  if (!post || !post.id) return res.status(400).json({ error: "Missing post or id" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // 1. Save full article to its own key
    await redisSet(url, token, `nb_post:${post.id}`, post);

    // 2. Update the index — lightweight metadata only (no body, no sources)
    const { body, sources, ...meta } = post;
    const indexRaw = await redisGet(url, token, "nb_index");
    let index = deepParse(indexRaw);
    if (!Array.isArray(index)) index = [];

    const exists = index.findIndex(p => p.id === post.id);
    if (exists >= 0) {
      index[exists] = meta;
    } else {
      index = [meta, ...index];
    }

    await redisSet(url, token, "nb_index", index);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Save failed" });
  }
}