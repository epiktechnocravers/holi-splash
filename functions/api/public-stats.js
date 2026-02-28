// GET /api/public-stats — public counters for landing page (no auth)
export async function onRequestGet(context) {
  const { env } = context;
  const STATS = env.STATS;

  try {
    const allTime = await STATS.get('alltime', 'json') || {};
    const today = new Date().toISOString().slice(0, 10);
    const todayStats = await STATS.get(`day:${today}`, 'json') || {};

    // Base numbers for social proof
    const BASE = { splashes: 12500, cards: 1800, players: 3200 };

    return new Response(JSON.stringify({
      splashes: BASE.splashes + (allTime.total_splashes || 0) + (todayStats.splashes || 0),
      cards: BASE.cards + (allTime.total_cards || 0),
      players: BASE.players + (allTime.total_pageviews || 0),
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
