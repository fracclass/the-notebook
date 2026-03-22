export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Read existing subscribers
  let subscribers = [];
  try {
    const r = await fetch(`${url}/get/nb_subscribers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    if (d.result) {
      const outer = JSON.parse(d.result);
      subscribers = JSON.parse(outer[0]);
    }
  } catch {}

  // Check for duplicate
  if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
    return res.status(200).json({ ok: true, duplicate: true });
  }

  subscribers = [
    { email, subscribedAt: new Date().toISOString() },
    ...subscribers
  ];

  await fetch(`${url}/set/nb_subscribers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([JSON.stringify(subscribers)])
  });

  res.status(200).json({ ok: true });
}
