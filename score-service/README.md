# Shared score service

The live service is https://fry-and-fly-scores.daintyflute16.chatgpt.site and uses a provisioned Cloudflare D1 database through Sites. The canonical service source is the Sites repository for project `appgprj_6ad352a1f2608191bcd83f66e5823d17`. This directory preserves the scoring protocol and database source for review alongside the game.

- GET /api/scores: the public top 20, ordered by fries, distance, then first achieved.
- POST /api/runs: create a short-lived seeded run ticket for an anonymous browser player.
- POST /api/scores: replay the completed run on the server and save only that browser player's best score.

The server ignores client-supplied score fields. Tokens expire after two hours, ranked replays are bounded to 30 minutes, names are plain text, SQL uses bound parameters, and run creation is rate-limited. This is a casual leaderboard; generating automated valid replays remains possible.

Player IDs are random browser-local credentials; public rows never expose them. Names are not unique and are not verified identities. No player email, account or password is requested. Only nicknames, verified scores and distances are public.

`lib/game/core.mjs` must match the game's `dist/core.mjs`. Increment the replay protocol version when changing game rules. Keep applied SQL and Drizzle metadata immutable; generate a new migration for schema changes.
