// Fetches lightweight index for homepage.
// On first run, migrates from old nb_posts format automatically.

async function redisGet(url, token, key) {
  const r = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
  return d.result ?? null; // Upstash returns the raw stored string in d.result
}

async function redisSet(url, token, key, value) {
  // Store as plain JSON string — Upstash SET takes the value as the request body array
  await fetch(`${url}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", key, JSON.stringify(value)])
  });
}

async function redisDel(url, token, key) {
  await fetch(`${url}/del/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["DEL", key])
  });
}

// Safely parse a value that may be JSON-stringified multiple times
function safeParse(raw) {
  let val = raw;
  for (let i = 0; i < 20; i++) {
    if (typeof val !== "string") break;
    try { val = JSON.parse(val); } catch { break; }
  }
  return val;
}

// Extract real article objects from any nesting
function extractArticles(raw) {
  const results = [];
  function walk(node) {
    if (!node) return;
    if (typeof node === "string") { walk(safeParse(node)); return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node === "object" && node.id) { results.push(node); }
  }
  walk(safeParse(raw));
  // Deduplicate by id
  const seen = new Set();
  return results.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
}

export default async function handler(req, res) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    const indexRaw = await redisGet(url, token, "nb_index");

    if (indexRaw) {
      const index = safeParse(indexRaw);
      if (Array.isArray(index) && index.length > 0 && index[0]?.id) {
        // Clean index — return it directly
        return res.status(200).json({ posts: index });
      }
    }

    // No clean index — try migrating from old nb_posts
    const oldRaw = await redisGet(url, token, "nb_posts");
    if (!oldRaw) return res.status(200).json({ posts: null });

    const articles = extractArticles(oldRaw);
    if (articles.length === 0) return res.status(200).json({ posts: null });

    // Save each article to its own key
    await Promise.all(articles.map(a =>
      fetch(`${url}/set/nb_post:${a.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([JSON.stringify(a)])
      })
    ));

    // Build and save clean index (no body/sources)
    const index = articles.map(({ body, sources, ...meta }) => meta);
    await fetch(`${url}/set/nb_index`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([JSON.stringify(index)])
    });

    // Remove old key
    await fetch(`${url}/del/nb_posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.status(200).json({ posts: index });
  } catch (e) {
    console.error("posts-get error:", e);
    return res.status(200).json({ posts: null });
  }
}