// Saves a single article to nb_post:{id} and updates nb_index

function safeParse(raw) {
  let val = raw;
  for (let i = 0; i < 20; i++) {
    if (typeof val !== "string") break;
    try { val = JSON.parse(val); } catch { break; }
  }
  return val;
}

// Upstash REST API: SET expects body = JSON.stringify([value_as_string])
// where value_as_string is already JSON.stringify(yourObject)
// Result stored in Redis: a plain JSON string, readable with JSON.parse(d.result)
async function upstashSet(url, token, key, value) {
  await fetch(`${url}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([JSON.stringify(value)])
  });
}

async function upstashGet(url, token, key) {
  const r = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
  return d.result ?? null; // d.result is already a plain string — just JSON.parse it
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { post } = req.body;
  if (!post?.id) return res.status(400).json({ error: "Missing post or id" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // 1. Save full article
    await upstashSet(url, token, `nb_post:${post.id}`, post);

    // 2. Update index — lightweight metadata only (no body, no sources)
    const { body, sources, ...meta } = post;
    const indexRaw = await upstashGet(url, token, "nb_index");
    let index = safeParse(indexRaw);

    // If index is missing or corrupted, start fresh
    if (!Array.isArray(index) || (index.length > 0 && typeof index[0] !== "object")) {
      index = [];
    }

    const existing = index.findIndex(p => p.id === post.id);
    if (existing >= 0) {
      index[existing] = meta;
    } else {
      index = [meta, ...index];
    }

    await upstashSet(url, token, "nb_index", index);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("posts-set error:", e);
    return res.status(500).json({ error: "Save failed" });
  }
}