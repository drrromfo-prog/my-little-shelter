# Data Model

Current SQLite table: `items`

Persisted columns:

- `id`
- `title`
- `cover_url`
- `creator`
- `year`
- `category`
- `status`
- `my_rating`
- `douban_rating`
- `summary`
- `note`
- `quick_note`
- `tags`
- `mood`
- `remind_date`
- `progress`
- `quotes_json`
- `rewatches_json`
- `douban_url`
- `created_at`
- `updated_at`

Backend validation rules in current code:

- `title` required
- `category` must be one of `movie | book | tv | anime | documentary`
- persisted status must be one of `pending | progress | done | paused`
- `my_rating` must stay within allowed numeric validation rules already implemented in `server.js`

Frontend status mapping:

- `pending` -> `want`
- `progress` -> `progress`
- `done` -> `done`
- `paused` -> `drop`

Frontend-only or showcase-only fields:

- `accentColor`
- `favorite`
- `revisit`
- `notesCount`

These are currently used for presentation and mock/showcase rendering, not persisted to SQLite.
