# Architecture

The project is a small full-stack app with one Express server and mostly frontend-driven rendering.

Main layers:

1. `server.js`
   - serves static files from `public/`
   - exposes REST-like API endpoints
   - manages SQLite schema and persistence
   - handles Douban fetch and image proxy

2. `public/index.html`
   - main shell with fixed sidebar, header, cards area, modal, and detail panel
   - several subviews are rendered inside the same page by `public/script.js`

3. `public/script.js`
   - main interaction layer
   - loads API data
   - maps API records into frontend item models
   - renders cards, sidebar stats, quotes page, mood calendar, and in-page stats

4. `public/styles.css`
   - main design tokens and custom styles
   - responsive behavior
   - visual hierarchy for sidebar, cards, modals, and view shells

5. `public/stats.html` + `public/stats.js`
   - separate dashboard route at `/stats`
   - fetches stats endpoints and renders charts

The current design intentionally avoids a heavy frontend framework and keeps compatibility with the existing API contracts.
