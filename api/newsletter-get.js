export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    const r = await fetch(`${url}/get/nb_subscribers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    if (d.result) {
      const outer = JSON.parse(d.result);
      const subscribers = JSON.parse(outer[0]);
      return res.status(200).json({ subscribers });
    }
    return res.status(200).json({ subscribers: [] });
  } catch {
    return res.status(200).json({ subscribers: [] });
  }
}
