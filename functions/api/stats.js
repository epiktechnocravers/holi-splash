// GET /api/stats — detailed analytics (auth required)
export async function onRequestGet(context) {
  const { request, env } = context;
  const KV = env.STATS;
  const url = new URL(request.url);

  if (url.searchParams.get('key') !== 'epik2026') {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    async function getNum(key) { return parseInt(await KV.get(key) || '0', 10); }

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dt = d.toISOString().slice(0, 10);

      const hourly = {};
      for (let h = 0; h < 24; h++) hourly[h] = await getNum(`d:${dt}:h:${h}`);

      days.push({
        date: dt,
        pageviews: await getNum(`d:${dt}:pageviews`),
        unique_visitors: await getNum(`d:${dt}:unique`),
        splashes: await getNum(`d:${dt}:splashes`),
        cards_created: await getNum(`d:${dt}:cards`),
        cards_shared: await getNum(`d:${dt}:shares`),
        photos_uploaded: await getNum(`d:${dt}:photos`),
        frames_used: await getNum(`d:${dt}:frames`),
        stickers_used: await getNum(`d:${dt}:stickers`),
        devices: { mobile: await getNum(`d:${dt}:mobile`), desktop: await getNum(`d:${dt}:desktop`) },
        hourly,
      });
    }

    const alltime = {
      total_pageviews: await getNum('all:pageviews'),
      total_splashes: await getNum('all:splashes'),
      total_cards: await getNum('all:cards'),
      total_shares: await getNum('all:shares'),
      total_photos: await getNum('all:photos'),
    };

    return new Response(JSON.stringify({
      today: days[0],
      last7days: days,
      alltime,
      generated_at: new Date().toISOString(),
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
