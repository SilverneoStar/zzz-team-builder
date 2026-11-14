# Enka relay (Cloudflare Worker)

The site's **Import from UID** reads a player's in-game Agent Showcase from
[Enka.Network](https://enka.network). Enka's API is meant to be called from a
server, so the site asks this small Worker, which asks Enka.

It's free on Cloudflare's free plan (100,000 requests a day).

## Set it up (once, about 5 minutes)

1. Make a free account at <https://dash.cloudflare.com/sign-up>.
2. In the dashboard: **Workers & Pages → Create → Create Worker**. Name it
   `zzz-enka` and press **Deploy** (it deploys a sample first).
3. Press **Edit code**, delete the sample, paste all of `worker.js` from this
   folder, and press **Deploy** again.
4. Copy the Worker's address, like `https://zzz-enka.<your-name>.workers.dev`.
   Opening `<address>/zzz/1506474603` in a browser should show JSON.
5. Put that address in `src/lib/enka.js` as `ENKA_RELAY` (or send it to Claude).

## Notes

- Only players' public showcases come through: the Agents they chose to show
  on their in-game profile.
- Each answer is cached for the `ttl` Enka gives (at least a minute), as Enka
  asks, so repeat lookups don't reach Enka.
- Allowed sites are listed in `ALLOWED` at the top of `worker.js`.
