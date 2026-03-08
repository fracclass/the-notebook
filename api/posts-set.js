export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { posts } = req.body;
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/nb_posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([JSON.stringify(posts)])
  });
  res.status(200).json({ ok: true });
}