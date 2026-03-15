// Returns lightweight index for homepage
// On first load after migration: detects old nb_posts key, migrates all articles to new format

function safeParse(raw) {
  let val = raw;
  for (let i = 0; i < 20; i++) {
    if (typeof val !== "string") break;
    try { val = JSON.parse(val); } catch { break; }
  }
  return val;
}

function extractArticles(raw) {
  const results = [];
  function walk(node) {
    if (!node) return;
    if (typeof node === "string") { walk(safeParse(node)); return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node === "object" && node.id) { results.push(node); }
  }
  walk(safeParse(raw));
  const seen = new Set();
  return results.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
}

async function upstashGet(url, token, key) {
  const r = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
  return d.result ?? null;
}

async function upstashSet(url, token, key, value) {
  await fetch(`${url}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([JSON.stringify(value)])
  });
}

export default async function handler(req, res) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    const indexRaw = await upstashGet(url, token, "nb_index");
    const index = safeParse(indexRaw);

    // Valid clean index: array of objects each with an id field
    if (Array.isArray(index) && index.length > 0 && index[0]?.id) {
      return res.status(200).json({ posts: index });
    }

    // No valid index — check for old nb_posts key to migrate
    const oldRaw = await upstashGet(url, token, "nb_posts");
    if (!oldRaw) return res.status(200).json({ posts: null });

    const articles = extractArticles(oldRaw);
    if (articles.length === 0) return res.status(200).json({ posts: null });

    // Migrate: save each article individually
    await Promise.all(articles.map(a => upstashSet(url, token, `nb_post:${a.id}`, a)));

    // Save clean index
    const newIndex = articles.map(({ body, sources, ...meta }) => meta);
    await upstashSet(url, token, "nb_index", newIndex);

    // Delete old key
    await fetch(`${url}/del/nb_posts`, { headers: { Authorization: `Bearer ${token}` } });

    return res.status(200).json({ posts: newIndex });
  } catch (e) {
    console.error("posts-get error:", e);
    return res.status(200).json({ posts: null });
  }
}