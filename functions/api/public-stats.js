// GET /api/public-stats — public counters for landing page (no auth)
export async function onRequestGet(context) {
  const { env } = context;
  const STATS = env.STATS;

  try {
    const allTime = await STATS.get('alltime', 'json') || {};
    const today = new Date().toISOString().slice(0, 10);
    const todayStats = await STATS.get(`day:${today}`, 'json') || {};

    // Return only safe public counters
    return new Response(JSON.stringify({
      splashes: allTime.total_splashes || 0,
      cards: allTime.total_cards || 0,
      players: allTime.total_pageviews || 0,
      today_players: todayStats.pageviews || 0,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30', // Cache 30s
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ splashes: 0, cards: 0, players: 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
