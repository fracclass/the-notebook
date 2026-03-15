export default async function handler(req, res) {
  try {
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/nb_posts`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });
    const data = await response.json();

    let posts = null;
    let raw = data.result;

    // Unwrap however many layers of JSON.stringify exist (could be many)
    let iterations = 0;
    while (typeof raw === "string" && iterations < 20) {
      try { raw = JSON.parse(raw); } catch { break; }
      iterations++;
    }

    // At this point raw should be an array — but items inside may still be strings
    if (Array.isArray(raw)) {
      const normalized = [];
      for (const item of raw) {
        let parsed = item;
        let inner = 0;
        while (typeof parsed === "string" && inner < 20) {
          try { parsed = JSON.parse(parsed); } catch { break; }
          inner++;
        }
        // Only keep real article objects (must have an id)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.id) {
          normalized.push(parsed);
        } else if (Array.isArray(parsed)) {
          // Sometimes the whole array is nested inside an item
          for (const sub of parsed) {
            let subParsed = sub;
            let s = 0;
            while (typeof subParsed === "string" && s < 20) {
              try { subParsed = JSON.parse(subParsed); } catch { break; }
              s++;
            }
            if (subParsed && typeof subParsed === "object" && subParsed.id) {
              normalized.push(subParsed);
            }
          }
        }
      }
      posts = normalized.length > 0 ? normalized : null;
    }

    res.status(200).json({ posts });
  } catch (e) {
    res.status(200).json({ posts: null });
  }
}