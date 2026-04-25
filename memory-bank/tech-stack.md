# Tech Stack

Backend:

- Node.js
- Express
- `better-sqlite3`

Frontend:

- server-rendered static files from `public/`
- vanilla HTML, CSS, and JavaScript
- `public/index.html` + `public/script.js` + `public/styles.css` for the main app
- `public/stats.html` + `public/stats.js` for the separate dashboard page

UI / visualization:

- custom CSS for the main experience
- Chart.js for `/stats`
- Color Thief loaded from CDN for subtle dynamic color extraction on the main page

Tooling:

- PostCSS
- Tailwind CSS v3 build pipeline exists in the repo, but the main app currently uses custom CSS

Persistence:

- SQLite database file
- local default path: `data/app.sqlite`
- Railway production path: `/app/data/app.sqlite`

Deployment:

- GitHub repository as source of truth
- Railway web service with auto deploy from `main`
- Railway volume mounted for SQLite persistence
