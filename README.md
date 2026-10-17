# Fry & Fly

A cheeky seagull, stolen fries and an angry chef. An English arcade runner for phones and computers.

## Rules

- Every golden fry adds one point to your score. Fries are never spent and never lower your jump.
- Blue feathers are separate pickups. Carry up to three.
- Jump again in the air to spend one feather on a double jump. One extra jump per take-off; landing resets it.
- Distance is a secondary run statistic. Your best fry score is saved locally in your browser.

## Controls

- Jump: Space, Up Arrow or JUMP. Press again in the air for a double jump if you have a feather.
- Duck: hold Down Arrow or DUCK.
- Double jump: F or DOUBLE JUMP while airborne.
- Pause/resume: P, Escape or the pause button.

## Development

Plain HTML, CSS and JavaScript. No external dependencies. Serve `dist/` over HTTP(S) so JavaScript modules load correctly.

Run the tests with Node.js 24:

```sh
npm test
```

## Deployment

The GitHub repository is `quivn06-blip/pik-n-patat` and the current Vercel project is `qmatti/fry-and-fly`. Play at https://fry-and-fly.vercel.app/. The older Dutch prototype is still in `qmatti/pik-n-patat`; publish future Fry & Fly updates to `qmatti/fry-and-fly`.

`vercel.json` runs the tests and publishes `dist/`. The frontend needs no secrets or visitor accounts. The shared leaderboard uses the separately provisioned D1 score service documented in `score-service/README.md`. Vercel Drop is used for deployment; GitHub automatic deployments are not connected yet.

Each visitor plays their own run. There is a shared top-20 leaderboard. After a completed ranked run, players can post a nickname and their verified fry score. Only each browser player’s best entry is listed. There is no realtime multiplayer.

The new fry record uses `fry-and-fly-best-fries` in localStorage. The old `patat-best` distance record is left untouched.

## Leaderboard

The UI loads real shared scores, preserves a finished run for retries, and sends recorded inputs to the score service. It never submits an editable score number. If the service cannot be reached at the start, the game stays playable as a practice run.
