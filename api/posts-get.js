// Fetches the lightweight index (no article bodies) for the homepage.
// Also handles one-time migration from the old nb_posts single-key format.

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

async function redisDel(url, token, key) {
  await fetch(`${url}/del/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Safely unwrap any number of JSON.stringify layers
function deepParse(raw) {
  let val = raw;
  let i = 0;
  while (typeof val === "string" && i < 20) {
    try { val = JSON.parse(val); } catch { break; }
    i++;
  }
  return val;
}

// Flatten possibly nested arrays of articles from old format
function extractArticles(raw) {
  const parsed = deepParse(raw);
  const results = [];
  function walk(node) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node === "string") { walk(deepParse(node)); return; }
    if (typeof node === "object" && node.id) { results.push(node); }
  }
  walk(parsed);
  return results;
}

export default async function handler(req, res) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // Check if new index exists
    const indexRaw = await redisGet(url, token, "nb_index");

    if (indexRaw) {
      // New architecture — return index directly
      const index = deepParse(indexRaw);
      return res.status(200).json({ posts: Array.isArray(index) ? index : null });
    }

    // No index found — check for old nb_posts key and migrate
    const oldRaw = await redisGet(url, token, "nb_posts");
    if (!oldRaw) {
      return res.status(200).json({ posts: null });
    }

    // Extract articles from old nested format
    const articles = extractArticles(oldRaw);
    if (articles.length === 0) {
      return res.status(200).json({ posts: null });
    }

    // Build index (lightweight — no body or sources)
    const index = articles.map(({ body, sources, ...meta }) => meta);

    // Save each article to its own key
    await Promise.all(articles.map(a => redisSet(url, token, `nb_post:${a.id}`, a)));

    // Save index
    await redisSet(url, token, "nb_index", index);

    // Clean up old key
    await redisDel(url, token, "nb_posts");

    return res.status(200).json({ posts: index });
  } catch (e) {
    return res.status(200).json({ posts: null });
  }
}