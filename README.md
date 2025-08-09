# Encar Calculator

Vite + React + TypeScript PWA for estimating final price of a car from [Encar](https://www.encar.com).
It fetches vehicle details via a Cloudflare Worker and converts price to USD and RUB with customs and fixed fees.

## Scripts

```bash
npm i
npm run dev      # start dev server
npm run build    # build for production
npm run preview  # preview built app
npm run test     # run unit tests
```

## Deploy to Cloudflare Pages

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
2. Build the app and worker:
   ```bash
   npm run build
   ```
3. Deploy static site and functions:
   ```bash
   npx wrangler pages deploy dist --project-name your-project-name
   ```
   The worker in `/api/encar.ts` will be available under `/api/encar`.

## Project structure

- `src/` – React app
- `api/encar.ts` – Cloudflare Worker for scraping Encar
- `public/` – static assets and manifest

PWA uses `vite-plugin-pwa` with auto updates and offline cache (stale-while-revalidate).
