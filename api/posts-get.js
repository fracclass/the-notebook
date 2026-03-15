export default async function handler(req, res) {
  try {
    const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/nb_posts`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    const d = await r.json();
    if (!d.result) return res.status(200).json({ posts: null });
    const posts = JSON.parse(d.result);
    res.status(200).json({ posts: Array.isArray(posts) ? posts : null });
  } catch (e) {
    res.status(200).json({ posts: null });
  }
}