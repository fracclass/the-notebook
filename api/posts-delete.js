export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { id } = req.body;
  const getRes = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/nb_posts`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const data = await getRes.json();
  const posts = data.result ? JSON.parse(data.result) : [];
  const updated = posts.filter(p => p.id !== id);
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/nb_posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([JSON.stringify(updated)])
  });
  res.status(200).json({ ok: true });
}