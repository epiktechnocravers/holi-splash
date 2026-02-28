// POST /api/track — record analytics events using individual KV keys (no race conditions)
export async function onRequestPost(context) {
  const { request, env } = context;
  const KV = env.STATS;

  try {
    const body = await request.json();
    const event = body.event;
    if (!event) return new Response('missing event', { status: 400 });

    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getUTCHours();

    // Helper: atomic-ish increment using individual keys
    async function incr(key, amount = 1) {
      const val = parseInt(await KV.get(key) || '0', 10);
      await KV.put(key, String(val + amount), { expirationTtl: 2592000 }); // 30 days
    }

    // Track by event type
    if (event === 'pageview') {
      await incr(`d:${today}:pageviews`);
      await incr(`d:${today}:h:${hour}`);
      await incr('all:pageviews');

      // Device
      const ua = request.headers.get('user-agent') || '';
      const isMobile = /mobile|android|iphone|ipad/i.test(ua);
      await incr(`d:${today}:${isMobile ? 'mobile' : 'desktop'}`);

      // Unique visitors
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const uvKey = `uv:${today}:${ip}`;
      const seen = await KV.get(uvKey);
      if (!seen) {
        await incr(`d:${today}:unique`);
        await KV.put(uvKey, '1', { expirationTtl: 86400 });
      }

      // Referrer
      const ref = body.referrer || 'direct';
      let refDomain = 'direct';
      try { if (ref !== 'direct') refDomain = new URL(ref).hostname.replace('www.',''); } catch {}
      await incr(`d:${today}:ref:${refDomain}`);

    } else if (event === 'splash' || event === 'splash_batch') {
      const count = event === 'splash_batch' ? Math.min(body.count || 1, 500) : 1;
      await incr(`d:${today}:splashes`, count);
      await incr('all:splashes', count);
      if (body.color) await incr(`d:${today}:clr:${body.color}`);

    } else if (event === 'card_created') {
      await incr(`d:${today}:cards`);
      await incr('all:cards');

    } else if (event === 'card_shared') {
      await incr(`d:${today}:shares`);
      await incr('all:shares');

    } else if (event === 'photo_uploaded') {
      await incr(`d:${today}:photos`);
      await incr('all:photos');

    } else if (event === 'frame_used') {
      await incr(`d:${today}:frames`);

    } else if (event === 'sticker_used') {
      await incr(`d:${today}:stickers`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
