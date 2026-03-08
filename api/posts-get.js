export default async function handler(req, res) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/nb_posts`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const data = await response.json();
  const posts = data.result ? JSON.parse(data.result) : null;
  res.status(200).json({ posts });
}