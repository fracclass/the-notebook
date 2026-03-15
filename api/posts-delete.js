// Deletes a single article by id.
// Removes it from nb_index and deletes its nb_post:{id} key.

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

async function redisDel(url, token, key) {
  await fetch(`${url}/del/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // 1. Remove from index
    const indexRaw = await redisGet(url, token, "nb_index");
    let index = deepParse(indexRaw);
    if (Array.isArray(index)) {
      index = index.filter(p => p.id !== id);
      await redisSet(url, token, "nb_index", index);
    }

    // 2. Delete individual post key
    await redisDel(url, token, `nb_post:${id}`);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Delete failed" });
  }
}