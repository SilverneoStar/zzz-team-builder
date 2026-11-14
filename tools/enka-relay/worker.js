// Relay for the site's "Import from UID": a Cloudflare Worker that asks
// Enka.Network for a ZZZ showcase and hands it to the site.
// It sets the User-Agent Enka asks for, caches each answer for the ttl Enka
// gives (so repeat lookups don't hit Enka), and adds the CORS header that lets
// the site's pages read it. Setup: see README.md in this folder.
//
// GET /zzz/<uid>  →  Enka's JSON for that UID (or Enka's error status)

const ALLOWED = ['https://silverneostar.github.io', 'http://localhost:5173', 'http://localhost:4173'];
const UA = 'zzz-team-builder/1.0 (+https://silverneostar.github.io/zzz-team-builder)';

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  Vary: 'Origin',
});

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') ?? '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    const m = new URL(request.url).pathname.match(/^\/zzz\/(\d{8,10})\/?$/);
    if (request.method !== 'GET' || !m) return new Response('Not found', { status: 404, headers: cors(origin) });

    // Cached answer first (kept for Enka's ttl).
    const key = new Request(`https://enka-relay.cache/zzz/${m[1]}`);
    const cache = caches.default;
    let res = await cache.match(key);
    if (!res) {
      const up = await fetch(`https://enka.network/api/zzz/uid/${m[1]}`, { headers: { 'User-Agent': UA } });
      const body = await up.text();
      let ttl = 60;
      try {
        ttl = Math.max(60, Number(JSON.parse(body).ttl) || 60);
      } catch {
        /* an error page: cache briefly */
      }
      res = new Response(body, {
        status: up.status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${up.ok ? ttl : 30}` },
      });
      ctx.waitUntil(cache.put(key, res.clone()));
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors(origin))) out.headers.set(k, v);
    return out;
  },
};
