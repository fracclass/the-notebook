export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { name, email, category, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "Missing fields" });

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Read existing messages
  let messages = [];
  try {
    const r = await fetch(`${url}/get/nb_messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    if (d.result) {
      const outer = JSON.parse(d.result);
      messages = JSON.parse(outer[0]);
    }
  } catch {}

  messages = [
    { id: Date.now().toString(), name, email, category: category || "Other", message, createdAt: new Date().toISOString(), read: false },
    ...messages
  ];

  await fetch(`${url}/set/nb_messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([JSON.stringify(messages)])
  });

  res.status(200).json({ ok: true });
}
