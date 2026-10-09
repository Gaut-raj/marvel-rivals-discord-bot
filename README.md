# Marvel Rivals Discord Bot

A lightweight Discord bot that posts announcements from the [official Marvel Rivals news page](https://www.marvelrivals.com/news/). Built with Discord.js v14 and Node.js 20+.

## Features

- **/news** — view the latest official announcement
- **/subscribe** — subscribe the current channel to future announcements (Manage Server required)
- **/unsubscribe** — disable announcements for the server (Manage Server required)
- **/news-status** — check the configured notification channel
- Persistent per-server subscriptions, deduplication after restarts, and isolated delivery failures
- No message-content privileged intent; no unofficial stats APIs

## Run locally

1. Install Node.js 20 or newer, then run `npm install`.
2. Copy `.env.example` to `.env` and set `DISCORD_TOKEN` from the Discord Developer Portal.
3. Invite the bot with the **bot** and **applications.commands** OAuth scopes, granting View Channel, Send Messages, and Embed Links.
4. Run `npm start`, then use `/subscribe` in the desired text channel.

On startup the bot registers global slash commands, which may take some time to appear. Configuration persists in `data/subscriptions.json`. Back up that directory if you redeploy; an ephemeral filesystem will lose subscriptions.

Subscriptions begin with the current latest article as a baseline, so no historical announcements are posted immediately. Each polling cycle posts the newest official article if it differs from the last successfully delivered article. If multiple announcements appear between polls, intermediate articles may be skipped.

## Development

```sh
npm test
npm run check
```

`POLL_INTERVAL_MINUTES` controls the polling interval (default 15). `DATA_FILE` changes the local JSON subscription path. Keep the token and persisted subscription file private.

## Operational notes

The official website's HTML structure can change; the parser rejects unrecognized article lists rather than posting untrusted links. The bot intentionally uses public official content and does not claim to provide player statistics. If news delivery fails, the item remains eligible for retry on the next poll. Announcements are delivered at least once in typical operation; a process crash immediately after sending but before persisting state can cause a duplicate.

For multi-instance hosting, replace the JSON file store with transactional shared storage and add a distributed poll lock.
