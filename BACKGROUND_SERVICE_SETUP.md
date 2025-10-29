# Background Service Setup (Netlify Scheduled Function)

This guide explains how to run daily paper discovery when the app is not open, using Netlify Scheduled Functions.

## Overview

- Platform: Netlify Functions
- Schedule: Daily at 9am UTC
- Function: `scheduled-discovery`
- Summary Only: Returns counts and a top-5 list (no DB writes in MVP)

## Files

- `netlify/functions/scheduled-discovery.ts` – Scheduled function entry
- `netlify/functions/lib/discoveryService.ts` – Discovery orchestration
- `netlify.toml` – Netlify config (schedule + bundling)

## Environment Variables (Netlify UI → Site Settings → Environment)

Required (recommended):

- `VITE_ANTHROPIC_API_KEY` – Claude API Key
- `NCBI_EMAIL` – Email for PubMed usage tracking
- `NCBI_API_KEY` – PubMed API key for higher rate limits (optional)

## Deploy Steps

1) Install dependencies and build locally

```bash
npm ci
npm run build
```

2) Deploy to Netlify (CLI or UI)

- Using CLI:

```bash
npm i -g netlify-cli
netlify login
netlify init # select or create a site
netlify deploy --prod
```

3) Verify function schedule

- Netlify UI → Functions → `scheduled-discovery` should show the cron schedule
- You can trigger manually from Netlify UI → Functions → Invoke

## Local Invocation (Optional)

Scheduled functions can't be truly scheduled locally, but you can simulate an invocation by exposing a regular handler (not scheduled) in a separate file if needed.

## Notes & Limitations

- MVP design does not write to your local IndexedDB. It returns a JSON summary only.
- To persist discovered papers, add a backend database (e.g., Supabase/Postgres) and a sync layer.
- Claude usage requires the API key available to the function environment.

## Extending to Persistence (Later)

- Add a managed database (Supabase/Postgres)
- Write approved results to `discovered_papers`
- Build an API to sync to the browser (see `src/services/sync.ts` stub in plan)

## Troubleshooting

- 403 from PubMed: Add `NCBI_EMAIL` and `NCBI_API_KEY` env vars
- Claude errors: Confirm `VITE_ANTHROPIC_API_KEY` is set at the function level
- Function not running: Check Netlify function logs and cron schedule
