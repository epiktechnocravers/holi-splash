// GET /api/public-stats — public counters for landing page
export async function onRequestGet(context) {
  const { env } = context;
  const KV = env.STATS;

  try {
    async function getNum(key) { return parseInt(await KV.get(key) || '0', 10); }

    const today = new Date().toISOString().slice(0, 10);
    const BASE = { splashes: 12500, cards: 1800, players: 3200 };

    return new Response(JSON.stringify({
      splashes: BASE.splashes + await getNum('all:splashes'),
      cards: BASE.cards + await getNum('all:cards'),
      players: BASE.players + await getNum('all:pageviews'),
      today_players: await getNum(`d:${today}:pageviews`),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ splashes: 12500, cards: 1800, players: 3200, today_players: 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
