# Deploy To Railway

This project is ready to deploy to Railway while keeping all current features:

- Express server
- SQLite persistence
- Douban import
- image proxy
- stats page

## What Was Added

- `server.js` now supports Railway volume paths through `RAILWAY_VOLUME_MOUNT_PATH`
- `server.js` exposes `GET /healthz` for Railway healthchecks
- `server.js` shuts down gracefully on `SIGTERM` / `SIGINT`
- `railway.json` defines the start command and healthcheck settings

## Before You Start

You need:

- a Railway account
- a GitHub repository for this project

## 1. Push This Project To GitHub

Initialize Git if needed, commit, and push to GitHub.

Example:

```bash
git init
git add .
git commit -m "Prepare Media Shelf for Railway"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 2. Create A Railway Project

1. Open Railway and create a new project.
2. Choose `Deploy from GitHub repo`.
3. Select this repository.

Railway should detect the Node.js app automatically.

## 3. Add A Persistent Volume

This app stores SQLite data in `./data/app.sqlite`.

In Railway:

1. Open your deployed service.
2. Add a `Volume`.
3. Mount it at:

```text
/app/data
```

That mount path is important because Railway places app code in `/app`, and this project writes SQLite data to `./data`.

With that mount in place, the database will persist automatically. No code changes are needed in Railway after mounting the volume.

## 4. Redeploy

After adding the volume, trigger a redeploy.

On startup, the app will create the database file automatically at:

```text
/app/data/app.sqlite
```

## 5. Generate A Public Domain

In Railway:

1. Go to `Settings`
2. Open `Networking`
3. Click `Generate Domain`

Railway will give you a public `*.up.railway.app` URL.

## 6. Optional: Add Your Own Domain

If you want a custom domain:

1. In the same `Networking` section, click `+ Custom Domain`
2. Enter your domain or subdomain
3. Add the DNS record Railway gives you at your DNS provider
4. Wait for verification and SSL issuance

## Healthcheck

Railway will call:

```text
/healthz
```

Expected success response:

```json
{
  "ok": true,
  "db_path": "/app/data/app.sqlite"
}
```

## Runtime Notes

- `PORT` is provided by Railway automatically
- `DATA_DIR` and `DB_PATH` are optional overrides if you want to change the storage location manually
- SQLite data will persist as long as the volume remains attached
- Do not rely on writing data outside the mounted volume

## Recommended Railway Settings

- Start command: handled by `railway.json`
- Healthcheck path: handled by `railway.json`
- Restart policy: handled by `railway.json`

## Local Smoke Test

You can simulate Railway locally by overriding the data path:

```bash
DATA_DIR=./data/railway-test PORT=3100 node server.js
```

Then open:

```text
http://localhost:3100/healthz
```

## Troubleshooting

### App boots but data disappears

The volume is either missing or mounted at the wrong path. It must be:

```text
/app/data
```

### The domain works but deploy never becomes healthy

Check whether:

- the app is listening on `process.env.PORT`
- `/healthz` returns HTTP `200`

### Douban import or image proxy fails

That is usually an upstream connectivity issue, not a Railway setup issue. Check deployment logs first.
