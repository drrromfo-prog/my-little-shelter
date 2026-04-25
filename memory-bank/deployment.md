# Deployment

Repository:

- GitHub: `https://github.com/drrromfo-prog/my-little-shelter`
- default branch: `main`

Production:

- Railway URL: `https://my-little-shelter-production.up.railway.app/`
- healthcheck: `https://my-little-shelter-production.up.railway.app/healthz`

Current production healthcheck response:

```json
{"ok":true,"db_path":"/app/data/app.sqlite"}
```

Current deployment model:

- Railway service is connected to the GitHub repo
- production is connected to branch `main`
- pushing to `origin main` should trigger Railway auto deploy
- SQLite persistence is backed by Railway volume storage

Important config:

- `railway.json` sets:
  - start command: `node server.js`
  - healthcheck path: `/healthz`
- `server.js` supports:
  - `PORT`
  - `DATA_DIR`
  - `DB_PATH`
  - `RAILWAY_VOLUME_MOUNT_PATH`

Persistence note:

- local default DB path: `data/app.sqlite`
- Railway production DB path: `/app/data/app.sqlite`
