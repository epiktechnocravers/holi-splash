// POST /api/track — record analytics events
export async function onRequestPost(context) {
  const { request, env } = context;
  const STATS = env.STATS;

  try {
    const body = await request.json();
    const event = body.event; // pageview, splash, card_created, card_shared, photo_uploaded, frame_used, sticker_used
    if (!event) return new Response('missing event', { status: 400 });

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const hour = new Date().getUTCHours();

    // Get or init today's stats
    const key = `day:${today}`;
    let stats = await STATS.get(key, 'json') || {
      date: today,
      pageviews: 0,
      unique_visitors: 0,
      splashes: 0,
      cards_created: 0,
      cards_shared: 0,
      photos_uploaded: 0,
      frames_used: 0,
      stickers_used: 0,
      hourly: {},
      devices: { mobile: 0, desktop: 0 },
      referrers: {},
      colors: {},
    };

    // Increment event counter
    const eventMap = {
      pageview: 'pageviews',
      splash: 'splashes',
      card_created: 'cards_created',
      card_shared: 'cards_shared',
      photo_uploaded: 'photos_uploaded',
      frame_used: 'frames_used',
      sticker_used: 'stickers_used',
    };

    // Handle batched splashes
    if (event === 'splash_batch') {
      const count = Math.min(body.count || 1, 500); // Cap at 500 per batch
      stats.splashes = (stats.splashes || 0) + count;
    } else if (eventMap[event]) {
      stats[eventMap[event]] = (stats[eventMap[event]] || 0) + 1;
    }

    // Hourly breakdown for pageviews
    if (event === 'pageview') {
      stats.hourly[hour] = (stats.hourly[hour] || 0) + 1;

      // Device type
      const ua = request.headers.get('user-agent') || '';
      const isMobile = /mobile|android|iphone|ipad/i.test(ua);
      if (isMobile) stats.devices.mobile++;
      else stats.devices.desktop++;

      // Referrer
      const ref = body.referrer || 'direct';
      const refDomain = ref === 'direct' ? 'direct' : new URL(ref).hostname.replace('www.','');
      stats.referrers[refDomain] = (stats.referrers[refDomain] || 0) + 1;

      // Unique visitors (approximate via IP hash)
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const uvKey = `uv:${today}:${ip}`;
      const seen = await STATS.get(uvKey);
      if (!seen) {
        stats.unique_visitors++;
        await STATS.put(uvKey, '1', { expirationTtl: 86400 });
      }
    }

    // Track color usage
    if (event === 'splash' && body.color) {
      stats.colors[body.color] = (stats.colors[body.color] || 0) + 1;
    }

    // Save with 30-day expiry
    await STATS.put(key, JSON.stringify(stats), { expirationTtl: 2592000 });

    // Also update all-time totals
    let allTime = await STATS.get('alltime', 'json') || {
      total_pageviews: 0, total_splashes: 0, total_cards: 0, total_shares: 0, total_photos: 0,
      first_visit: today, days_active: 0,
    };
    if (event === 'pageview') allTime.total_pageviews++;
    else if (event === 'splash') allTime.total_splashes++;
    else if (event === 'splash_batch') allTime.total_splashes = (allTime.total_splashes || 0) + Math.min(body.count || 1, 500);
    else if (event === 'card_created') allTime.total_cards++;
    else if (event === 'card_shared') allTime.total_shares++;
    else if (event === 'photo_uploaded') allTime.total_photos++;
    // Track active days
    const activeDaysKey = `active:${today}`;
    const dayActive = await STATS.get(activeDaysKey);
    if (!dayActive) {
      allTime.days_active++;
      await STATS.put(activeDaysKey, '1', { expirationTtl: 2592000 });
    }
    await STATS.put('alltime', JSON.stringify(allTime), { expirationTtl: 31536000 });

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

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
