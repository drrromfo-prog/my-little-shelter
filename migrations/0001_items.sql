CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  cover_url TEXT,
  creator TEXT,
  year TEXT,
  category TEXT,
  status TEXT,
  my_rating REAL,
  douban_rating TEXT,
  summary TEXT,
  note TEXT,
  quick_note TEXT,
  tags TEXT,
  mood TEXT,
  remind_date TEXT,
  progress TEXT,
  quotes_json TEXT,
  rewatches_json TEXT,
  douban_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
