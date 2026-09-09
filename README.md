<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/50700b53-2b91-4723-9eff-0b7929080490

## Run Locally

**Prerequisites:**  Node.js

For persistent local data, also install MySQL 8.x.


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Local MySQL setup

1. Copy `.env.example` to `.env` and set `MYSQL_PASSWORD`.
2. Create the schema with MySQL:
   `mysql -u root -p < sql/schema.sql`
3. Start the API in a second terminal:
   `npm run api`
4. Seed the initial application data once:
   `curl -X POST http://localhost:8787/api/admin/seed`

The API is available at `http://localhost:8787`. The Vite development server proxies `/api` to it. MySQL credentials stay on the server and are never sent to the browser.
