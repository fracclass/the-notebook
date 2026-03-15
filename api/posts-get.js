export default async function handler(req, res) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/nb_posts`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const data = await response.json();

  let posts = null;
  try {
    // Unwrap however many layers of JSON.stringify nesting exist
    let raw = data.result;
    while (typeof raw === "string") {
      raw = JSON.parse(raw);
    }
    // raw might now be an array of mixed strings/objects — normalize it
    if (Array.isArray(raw)) {
      posts = raw.map(item => typeof item === "string" ? JSON.parse(item) : item)
                 .filter(item => item && typeof item === "object" && item.id);
    }
  } catch (e) {
    posts = null;
  }

  res.status(200).json({ posts: posts && posts.length > 0 ? posts : null });
}