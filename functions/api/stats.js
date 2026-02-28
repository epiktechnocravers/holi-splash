// GET /api/stats — return analytics data
export async function onRequestGet(context) {
  const { request, env } = context;
  const STATS = env.STATS;
  const url = new URL(request.url);
  const password = url.searchParams.get('key');

  // Simple auth — prevent public access
  if (password !== 'epik2026') {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get last 7 days
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `day:${d.toISOString().slice(0, 10)}`;
      const data = await STATS.get(key, 'json');
      if (data) days.push(data);
    }

    // All-time stats
    const allTime = await STATS.get('alltime', 'json') || {};

    // Today's stats
    const today = new Date().toISOString().slice(0, 10);
    const todayStats = await STATS.get(`day:${today}`, 'json') || {};

    return new Response(JSON.stringify({
      today: todayStats,
      last7days: days,
      alltime: allTime,
      generated_at: new Date().toISOString(),
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
