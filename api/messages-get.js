export default async function handler(req, res) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  try {
    const r = await fetch(`${url}/get/nb_messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    if (!d.result) return res.status(200).json({ messages: [] });
    const outer    = JSON.parse(d.result);
    const messages = JSON.parse(outer[0]);
    res.status(200).json({ messages: Array.isArray(messages) ? messages : [] });
  } catch {
    res.status(200).json({ messages: [] });
  }
}
