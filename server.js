const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = process.env.DATA_DIR
  || process.env.RAILWAY_VOLUME_MOUNT_PATH
  || path.join(__dirname, "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "app.sqlite");

const VALID_CATEGORIES = new Set(["movie", "book", "tv", "anime", "documentary"]);
const CATEGORY_DISTRIBUTION_ORDER = [
  { category: "movie", label: "电影" },
  { category: "tv", label: "电视剧" },
  { category: "anime", label: "动漫" },
  { category: "documentary", label: "纪录片" },
  { category: "book", label: "书籍" }
];
const SCREEN_CATEGORIES = CATEGORY_DISTRIBUTION_ORDER
  .filter(({ category }) => category !== "book")
  .map(({ category }) => category);
const VALID_STATUSES = new Set(["pending", "progress", "done", "paused"]);

const DOUBAN_DESKTOP_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  referer: "https://www.douban.com/"
};

const DOUBAN_MOBILE_HEADERS = {
  "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  referer: "https://m.douban.com/"
};

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
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
  )
`);

const existingColumns = new Set(
  db.prepare("PRAGMA table_info(items)").all().map((column) => column.name)
);

const requiredColumns = {
  year: "TEXT",
  mood: "TEXT",
  quick_note: "TEXT",
  remind_date: "TEXT",
  progress: "TEXT",
  quotes_json: "TEXT",
  rewatches_json: "TEXT",
  douban_url: "TEXT"
};

for (const [columnName, columnType] of Object.entries(requiredColumns)) {
  if (!existingColumns.has(columnName)) {
    db.exec(`ALTER TABLE items ADD COLUMN ${columnName} ${columnType}`);
  }
}

const baseSelectSql = `
  SELECT
    id,
    title,
    cover_url,
    creator,
    year,
    category,
    status,
    my_rating,
    douban_rating,
    summary,
    note,
    quick_note,
    tags,
    mood,
    remind_date,
    progress,
    quotes_json,
    rewatches_json,
    douban_url,
    created_at,
    updated_at
  FROM items
`;

const insertItemStatement = db.prepare(`
  INSERT INTO items (
    title,
    cover_url,
    creator,
    year,
    category,
    status,
    my_rating,
    douban_rating,
    summary,
    note,
    quick_note,
    tags,
    mood,
    remind_date,
    progress,
    quotes_json,
    rewatches_json,
    douban_url,
    created_at,
    updated_at
  ) VALUES (
    @title,
    @cover_url,
    @creator,
    @year,
    @category,
    @status,
    @my_rating,
    @douban_rating,
    @summary,
    @note,
    @quick_note,
    @tags,
    @mood,
    @remind_date,
    @progress,
    @quotes_json,
    @rewatches_json,
    @douban_url,
    @created_at,
    @updated_at
  )
`);

const updateItemStatement = db.prepare(`
  UPDATE items
  SET
    title = @title,
    cover_url = @cover_url,
    creator = @creator,
    year = @year,
    category = @category,
    status = @status,
    my_rating = @my_rating,
    douban_rating = @douban_rating,
    summary = @summary,
    note = @note,
    quick_note = @quick_note,
    tags = @tags,
    mood = @mood,
    remind_date = @remind_date,
    progress = @progress,
    quotes_json = @quotes_json,
    rewatches_json = @rewatches_json,
    douban_url = @douban_url,
    updated_at = @updated_at
  WHERE id = @id
`);

const getItemByIdStatement = db.prepare(`
  ${baseSelectSql}
  WHERE id = ?
`);

const listItemsStatement = db.prepare(`
  ${baseSelectSql}
  ORDER BY datetime(created_at) DESC, id DESC
`);

const deleteItemStatement = db.prepare(`
  DELETE FROM items
  WHERE id = ?
`);

const clearItemsStatement = db.prepare(`
  DELETE FROM items
`);

const statsSummaryStatement = db.prepare(`
  SELECT
    COALESCE(SUM(CASE WHEN category IN ('movie', 'tv', 'anime', 'documentary') THEN 1 ELSE 0 END), 0) AS total_movies,
    COALESCE(SUM(CASE WHEN category = 'book' THEN 1 ELSE 0 END), 0) AS total_books,
    ROUND(AVG(my_rating), 1) AS avg_rating
  FROM items
`);

const monthlyTrendStatement = db.prepare(`
  WITH RECURSIVE month_series(step, month_start, month_end) AS (
    SELECT
      0,
      date('now', 'start of month', '-5 months'),
      date('now', 'start of month', '-4 months')
    UNION ALL
    SELECT
      step + 1,
      date(month_start, '+1 month'),
      date(month_end, '+1 month')
    FROM month_series
    WHERE step < 5
  )
  SELECT
    strftime('%Y-%m', month_start) AS month,
    COALESCE(COUNT(items.id), 0) AS count
  FROM month_series
  LEFT JOIN items
    ON datetime(items.created_at) >= datetime(month_start)
   AND datetime(items.created_at) < datetime(month_end)
  GROUP BY month_start
  ORDER BY month_start
`);

const statsTagsStatement = db.prepare(`
  SELECT tags
  FROM items
  WHERE tags IS NOT NULL AND TRIM(tags) <> ''
`);

const categoryDistributionStatement = db.prepare(`
  SELECT
    category,
    COUNT(*) AS count
  FROM items
  WHERE category IS NOT NULL AND TRIM(category) <> ''
  GROUP BY category
`);

app.use(express.json({ limit: "5mb" }));
app.use(express.static(PUBLIC_DIR));

class ValidationError extends Error {
  constructor(details) {
    super(details[0]?.message || "Validation failed");
    this.name = "ValidationError";
    this.details = details;
  }
}

function normalizeNullableText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text === "" ? null : text;
}

function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeTags(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const sourceTags = Array.isArray(value)
    ? value.flatMap((entry) => String(entry).split(/[,\n，]+/))
    : String(value).split(/[,\n，]+/);

  const normalizedTags = sourceTags
    .map((tag) => String(tag).trim())
    .filter(Boolean);

  return normalizedTags.length > 0 ? normalizedTags.join(",") : null;
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsedValue = JSON.parse(String(value));
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function normalizeQuotes(value) {
  const quotes = parseJsonArray(value).length > 0
    ? parseJsonArray(value)
    : Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];

  const cleanedQuotes = quotes
    .map((entry) => normalizeNullableText(entry))
    .filter(Boolean);

  return cleanedQuotes.length > 0 ? JSON.stringify(cleanedQuotes) : null;
}

function normalizeRewatches(value) {
  const rewatches = Array.isArray(value) ? value : parseJsonArray(value);

  const cleanedRewatches = rewatches
    .map((entry) => ({
      date: normalizeNullableText(entry?.date),
      note: normalizeNullableText(entry?.note)
    }))
    .filter((entry) => entry.date || entry.note);

  return cleanedRewatches.length > 0 ? JSON.stringify(cleanedRewatches) : null;
}

function normalizeCategory(value, allowFrontendAliases = false) {
  const normalized = normalizeNullableText(value);
  if (!normalized) {
    return null;
  }

  if (VALID_CATEGORIES.has(normalized)) {
    return normalized;
  }

  if (allowFrontendAliases && VALID_CATEGORIES.has(normalized.toLowerCase())) {
    return normalized.toLowerCase();
  }

  return null;
}

function normalizeStatus(value, allowFrontendAliases = false) {
  const normalized = normalizeNullableText(value);
  if (!normalized) {
    return null;
  }

  const lowerValue = normalized.toLowerCase();
  if (VALID_STATUSES.has(lowerValue)) {
    return lowerValue;
  }

  if (allowFrontendAliases) {
    if (lowerValue === "want") {
      return "pending";
    }

    if (lowerValue === "progress") {
      return "progress";
    }

    if (lowerValue === "drop") {
      return "paused";
    }
  }

  return null;
}

function normalizeImportedDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function normalizePayload(body, options = {}) {
  const {
    allowFrontendAliases = false,
    allowImportDates = false
  } = options;

  const details = [];
  const title = normalizeNullableText(body.title);
  const category = normalizeCategory(body.category ?? body.type, allowFrontendAliases);
  const status = normalizeStatus(body.status, allowFrontendAliases);
  const myRating = normalizeNullableNumber(body.my_rating ?? body.myScore);

  if (!title) {
    details.push({
      field: "title",
      message: "title is required"
    });
  }

  if (!category) {
    details.push({
      field: "category",
      message: "category must be one of movie, book, tv, anime, or documentary"
    });
  }

  if (!status) {
    details.push({
      field: "status",
      message: "status must be one of pending, progress, done, or paused"
    });
  }

  const ratingInput = body.my_rating ?? body.myScore;
  if (ratingInput !== undefined && ratingInput !== null && ratingInput !== "") {
    if (myRating === null || myRating < 1 || myRating > 10) {
      details.push({
        field: "my_rating",
        message: "my_rating must be a number between 1 and 10"
      });
    }
  }

  if (details.length > 0) {
    throw new ValidationError(details);
  }

  return {
    title,
    cover_url: normalizeNullableText(body.cover_url ?? body.cover),
    creator: normalizeNullableText(body.creator),
    year: normalizeNullableText(body.year),
    category,
    status,
    my_rating: myRating,
    douban_rating: normalizeNullableText(body.douban_rating ?? body.dscore),
    summary: normalizeNullableText(body.summary ?? body.desc),
    note: normalizeNullableText(body.note),
    quick_note: normalizeNullableText(body.quick_note ?? body.quickNote),
    tags: normalizeTags(body.tags),
    mood: normalizeNullableText(body.mood),
    remind_date: normalizeNullableText(body.remind_date ?? body.remind),
    progress: normalizeNullableText(body.progress),
    quotes_json: normalizeQuotes(body.quotes ?? body.quotes_json),
    rewatches_json: normalizeRewatches(body.rewatches ?? body.rewatches_json),
    douban_url: normalizeNullableText(body.douban_url ?? body.douban),
    created_at: allowImportDates ? normalizeImportedDate(body.created_at ?? body.addedAt) : null
  };
}

function buildItemStatementParams(payload, options = {}) {
  const createdAt = options.createdAt || payload.created_at || new Date().toISOString();
  const updatedAt = options.updatedAt || new Date().toISOString();

  return {
    id: options.id,
    title: payload.title,
    cover_url: payload.cover_url,
    creator: payload.creator,
    year: payload.year,
    category: payload.category,
    status: payload.status,
    my_rating: payload.my_rating,
    douban_rating: payload.douban_rating,
    summary: payload.summary,
    note: payload.note,
    quick_note: payload.quick_note,
    tags: payload.tags,
    mood: payload.mood,
    remind_date: payload.remind_date,
    progress: payload.progress,
    quotes_json: payload.quotes_json,
    rewatches_json: payload.rewatches_json,
    douban_url: payload.douban_url,
    created_at: createdAt,
    updated_at: updatedAt
  };
}

function serializeItemRow(row) {
  return {
    id: row.id,
    title: row.title,
    cover_url: row.cover_url,
    creator: row.creator,
    year: row.year,
    category: row.category,
    status: row.status,
    my_rating: row.my_rating,
    douban_rating: row.douban_rating,
    summary: row.summary,
    note: row.note,
    quick_note: row.quick_note,
    tags: row.tags,
    mood: row.mood,
    remind_date: row.remind_date,
    progress: row.progress,
    quotes: parseJsonArray(row.quotes_json),
    rewatches: parseJsonArray(row.rewatches_json),
    douban_url: row.douban_url,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function parseItemId(value) {
  const itemId = Number(value);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("invalid item id");
  }

  return itemId;
}

function getMonthlyTrendRows() {
  return monthlyTrendStatement.all().map((row) => ({
    month: row.month,
    count: Number(row.count) || 0
  }));
}

function getCategoryDistributionRows() {
  const categoryCounts = new Map(
    categoryDistributionStatement.all().map((row) => [
      row.category,
      Number(row.count) || 0
    ])
  );

  return CATEGORY_DISTRIBUTION_ORDER.map(({ category, label }) => ({
    category,
    label,
    count: categoryCounts.get(category) || 0
  }));
}

function getTagDistribution(limit = 10) {
  const tagCounts = new Map();
  const rows = statsTagsStatement.all();

  rows.forEach((row) => {
    String(row.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.tag.localeCompare(right.tag, "zh-CN");
    })
    .slice(0, limit);
}

function buildStatsInsight(summary, topTagRow, monthlyTrendRows) {
  const totalMovies = Number(summary.total_movies) || 0;
  const totalBooks = Number(summary.total_books) || 0;
  const avgRating = summary.avg_rating === null || summary.avg_rating === undefined
    ? null
    : Number(summary.avg_rating);
  const totalItems = totalMovies + totalBooks;
  const topTag = topTagRow?.tag ? String(topTagRow.tag) : null;
  const totalRecentAdds = monthlyTrendRows.reduce((sum, row) => sum + row.count, 0);
  const latestMonthCount = monthlyTrendRows.length > 0
    ? monthlyTrendRows[monthlyTrendRows.length - 1].count
    : 0;
  const recentMonthDominates = totalRecentAdds >= 3 && latestMonthCount / totalRecentAdds >= 0.6;

  if (totalItems < 3) {
    return "你已经开始积累自己的观影和阅读记录，随着数据增加，会看到更清晰的兴趣轮廓。";
  }

  let mediaPart = "你的影视和阅读记录目前比较均衡";
  if (totalMovies > totalBooks) {
    mediaPart = "你最近主要在记录影视内容";
  } else if (totalBooks > totalMovies) {
    mediaPart = "你最近主要在记录图书";
  }

  let ratingPart = "目前评分样本还不够多";
  if (avgRating !== null && Number.isFinite(avgRating)) {
    if (avgRating >= 8.5) {
      ratingPart = `平均评分偏高，达到 ${avgRating.toFixed(1)} 分`;
    } else if (avgRating >= 7.0) {
      ratingPart = `平均评分中等偏高，为 ${avgRating.toFixed(1)} 分`;
    } else {
      ratingPart = `平均评分偏低，目前是 ${avgRating.toFixed(1)} 分`;
    }
  }

  const preferencePart = topTag
    ? `偏好集中在“${topTag}”类内容`
    : "当前还没有形成特别明显的标签偏好";

  const habitPart = recentMonthDominates
    ? "最近新增记录主要集中在本月，说明记录习惯刚开始建立"
    : "";

  return [mediaPart, ratingPart, preferencePart, habitPart].filter(Boolean).join("，") + "。";
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    middot: "·",
    hellip: "…",
    ldquo: "“",
    rdquo: "”",
    lsquo: "‘",
    rsquo: "’"
  };

  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => namedEntities[name.toLowerCase()] ?? match);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

function cleanText(value) {
  return decodeHtmlEntities(stripHtml(value))
    .replace(/\r/g, "")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function cleanInlineText(value) {
  return cleanText(value)
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractSingleMatch(html, regex) {
  const match = String(html || "").match(regex);
  return match ? match[1] : "";
}

function extractAllMatches(html, regex) {
  return Array.from(String(html || "").matchAll(regex))
    .map((match) => cleanInlineText(match[1]))
    .filter(Boolean);
}

function extractAnchorTexts(html) {
  return extractAllMatches(html, /<a\b[^>]*>([\s\S]*?)<\/a>/gi);
}

function extractInfoLine(infoHtml, label) {
  const lineRegex = new RegExp(
    `<span[^>]*class=["']pl["'][^>]*>\\s*${escapeRegex(label)}\\s*<\\/span>\\s*:?\\s*([\\s\\S]*?)(?:<br\\s*\\/?>)`,
    "i"
  );

  return extractSingleMatch(infoHtml, lineRegex);
}

function uniq(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function inferScreenCategory({ genres = [], titleText = "", infoHtml = "" }) {
  const normalizedGenres = genres.map((genre) => cleanInlineText(genre));
  const genreSet = new Set(normalizedGenres);
  const combinedText = `${cleanInlineText(titleText)} ${cleanInlineText(infoHtml)}`;

  if (genreSet.has("纪录片")) {
    return "documentary";
  }

  if (genreSet.has("动画")) {
    return "anime";
  }

  if (/电视剧|剧集|季播|单集片长|集数/u.test(combinedText)) {
    return "tv";
  }

  return "movie";
}

function normalizeDoubanRequestUrl(inputUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(String(inputUrl || "").trim());
  } catch (error) {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  let category = null;

  if (hostname === "movie.douban.com") {
    category = "movie";
  } else if (hostname === "book.douban.com") {
    category = "book";
  } else if (hostname === "m.douban.com") {
    const mobileMatch = parsedUrl.pathname.match(/^\/(movie|book)\/subject\/(\d+)/i);
    if (mobileMatch) {
      category = mobileMatch[1].toLowerCase();
    }
  }

  if (!category) {
    return null;
  }

  const subjectMatch = parsedUrl.pathname.match(/\/subject\/(\d+)/i);
  if (!subjectMatch) {
    return null;
  }

  const subjectId = subjectMatch[1];
  return {
    subjectId,
    category,
    desktopUrl: `https://${category}.douban.com/subject/${subjectId}/`,
    mobileUrl: `https://m.douban.com/${category}/subject/${subjectId}/`
  };
}

function normalizeImageProxyTarget(inputUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(String(inputUrl || "").trim());
  } catch (error) {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (!hostname.endsWith("doubanio.com") && !hostname.endsWith("douban.com")) {
    return null;
  }

  return parsedUrl.toString();
}

function toImageProxyUrl(inputUrl) {
  const targetUrl = normalizeImageProxyTarget(inputUrl);
  return targetUrl ? `/api/image-proxy?url=${encodeURIComponent(targetUrl)}` : inputUrl;
}

function getResponseSetCookies(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const cookieHeader = response.headers.get("set-cookie");
  return cookieHeader ? [cookieHeader] : [];
}

function sha512Hex(value) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

function solveDoubanChallenge(challenge, difficulty = 4) {
  const targetPrefix = "0".repeat(difficulty);
  let nonce = 0;

  while (true) {
    nonce += 1;
    if (sha512Hex(challenge + nonce).startsWith(targetPrefix)) {
      return nonce;
    }
  }
}

async function fetchDoubanMovieDesktopHtml(doubanInfo) {
  const initialResponse = await fetch(doubanInfo.desktopUrl, {
    redirect: "manual",
    headers: DOUBAN_DESKTOP_HEADERS
  });

  if (initialResponse.ok) {
    return initialResponse.text();
  }

  const secUrl = initialResponse.headers.get("location");
  if (!secUrl || !secUrl.includes("sec.douban.com/")) {
    throw new Error(`Failed to open Douban movie page (${initialResponse.status})`);
  }

  const secResponse = await fetch(secUrl, {
    headers: DOUBAN_DESKTOP_HEADERS
  });
  const secHtml = await secResponse.text();
  const token = extractSingleMatch(secHtml, /id="tok"[^>]*value="([^"]+)"/i);
  const challenge = extractSingleMatch(secHtml, /id="cha"[^>]*value="([^"]+)"/i);
  const redirectUrl = extractSingleMatch(secHtml, /id="red"[^>]*value="([^"]+)"/i) || doubanInfo.desktopUrl;

  if (!token || !challenge) {
    throw new Error("Failed to solve Douban movie verification");
  }

  const solution = solveDoubanChallenge(challenge);
  const verificationResponse = await fetch("https://sec.douban.com/c", {
    method: "POST",
    redirect: "manual",
    headers: {
      ...DOUBAN_DESKTOP_HEADERS,
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://sec.douban.com",
      referer: secUrl
    },
    body: new URLSearchParams({
      tok: token,
      cha: challenge,
      sol: String(solution),
      red: redirectUrl
    })
  });

  const cookieHeader = getResponseSetCookies(verificationResponse)
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

  const unlockedResponse = await fetch(redirectUrl, {
    headers: {
      ...DOUBAN_DESKTOP_HEADERS,
      ...(cookieHeader ? { cookie: cookieHeader } : {})
    }
  });

  if (!unlockedResponse.ok) {
    throw new Error(`Failed to load Douban movie page (${unlockedResponse.status})`);
  }

  return unlockedResponse.text();
}

async function fetchDoubanPage(doubanInfo) {
  if (doubanInfo.category === "movie") {
    try {
      return {
        mode: "desktop",
        html: await fetchDoubanMovieDesktopHtml(doubanInfo)
      };
    } catch (error) {
      console.error("Douban movie desktop fetch failed, falling back to mobile page:", error);
      const mobileResponse = await fetch(doubanInfo.mobileUrl, {
        headers: DOUBAN_MOBILE_HEADERS
      });

      if (!mobileResponse.ok) {
        throw new Error(`Failed to load Douban movie page (${mobileResponse.status})`);
      }

      return {
        mode: "mobile",
        html: await mobileResponse.text()
      };
    }
  }

  const desktopResponse = await fetch(doubanInfo.desktopUrl, {
    headers: DOUBAN_DESKTOP_HEADERS
  });

  if (desktopResponse.ok) {
    return {
      mode: "desktop",
      html: await desktopResponse.text()
    };
  }

  const mobileResponse = await fetch(doubanInfo.mobileUrl, {
    headers: DOUBAN_MOBILE_HEADERS
  });

  if (!mobileResponse.ok) {
    throw new Error(`Failed to load Douban book page (${mobileResponse.status})`);
  }

  return {
    mode: "mobile",
    html: await mobileResponse.text()
  };
}

function parseDoubanMovieDesktop(html, doubanInfo) {
  const infoHtml = extractSingleMatch(html, /<div id="info">([\s\S]*?)<\/div>/i);
  const directorLine = extractInfoLine(infoHtml, "导演");
  const directors = extractAnchorTexts(directorLine);
  const genres = uniq(extractAllMatches(html, /property="v:genre"[^>]*>([^<]+)</gi)).slice(0, 8);
  const title = cleanInlineText(
    extractSingleMatch(html, /<title>\s*([\s\S]*?)\s*<\/title>/i).replace(/\s*\(豆瓣\)\s*$/i, "")
  );
  const category = inferScreenCategory({
    genres,
    titleText: title,
    infoHtml
  });

  return {
    title,
    cover_url: extractSingleMatch(html, /<div id="mainpic">[\s\S]*?<img src="([^"]+)"/i),
    creator: directors.join(" / ") || cleanInlineText(directorLine),
    year: cleanInlineText(extractSingleMatch(html, /<span class="year">\((\d{4})\)<\/span>/i)),
    category,
    douban_rating: cleanInlineText(extractSingleMatch(html, /<strong[^>]*property="v:average"[^>]*>([^<]+)<\/strong>/i)),
    summary: cleanInlineText(
      extractSingleMatch(html, /<div class="indent" id="link-report-intra">[\s\S]*?<span class="all hidden">([\s\S]*?)<\/span>/i)
        || extractSingleMatch(html, /<span property="v:summary"[^>]*>([\s\S]*?)<\/span>/i)
    ),
    tags: genres
  };
}

function parseDoubanMovieMobile(html, doubanInfo) {
  const metaDescription = cleanInlineText(extractSingleMatch(html, /<meta name="description" content="([^"]+)"/i));
  const subMeta = cleanInlineText(extractSingleMatch(html, /<div class="sub-meta">([\s\S]*?)<\/div>/i));
  const title = cleanInlineText(extractSingleMatch(html, /<div class="sub-title">([\s\S]*?)<\/div>/i));
  const pageTitle = cleanInlineText(extractSingleMatch(html, /<title>\s*([\s\S]*?)\s*<\/title>/i));
  const tags = uniq(
    subMeta
      .split("/")
      .map((part) => part.trim())
      .filter((part) => part && !/\d/.test(part) && !part.includes("上映") && !part.includes("片长"))
      .filter((part) => !/^(中国|中国大陆|中国香港|中国台湾|美国|英国|法国|日本|韩国|德国|意大利|西班牙|加拿大|印度|泰国)$/.test(part))
  ).slice(0, 6);
  const category = inferScreenCategory({
    genres: tags,
    titleText: `${title} ${pageTitle}`,
    infoHtml: subMeta
  });

  return {
    title,
    cover_url: extractSingleMatch(html, /<meta property="og:image" content="([^"]+)"/i),
    creator: "",
    year: extractSingleMatch(html, /<div class="sub-original-title">[\s\S]*?（(\d{4})）<\/div>/i)
      || extractSingleMatch(subMeta, /(\d{4})-\d{2}-\d{2}/i)
      || extractSingleMatch(subMeta, /(\d{4})/i),
    category,
    douban_rating: cleanInlineText(extractSingleMatch(html, /itemprop="ratingValue" content="([^"]+)"/i)),
    summary: cleanInlineText(
      extractSingleMatch(html, /<section class="subject-intro">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
        || metaDescription.replace(/^.*?简介：/u, "")
    ),
    tags
  };
}

function parseDoubanBookDesktop(html, doubanInfo) {
  const infoHtml = extractSingleMatch(html, /<div id="info" class="">([\s\S]*?)<\/div>/i);
  const authorLine = extractInfoLine(infoHtml, "作者");
  const authorNames = extractAnchorTexts(authorLine);
  const tagsBlock = extractSingleMatch(html, /<div id="db-tags-section"[\s\S]*?<div class="indent">([\s\S]*?)<\/div>/i);
  const publishYear = cleanInlineText(
    extractSingleMatch(infoHtml, /<span class="pl">出版年:<\/span>\s*([^<]+)/i)
      || extractInfoLine(infoHtml, "出版年")
  );

  return {
    title: cleanInlineText(
      extractSingleMatch(html, /<title>\s*([\s\S]*?)\s*<\/title>/i).replace(/\s*\(豆瓣\)\s*$/i, "")
    ),
    cover_url: extractSingleMatch(html, /<div id="mainpic"[\s\S]*?<img src="([^"]+)"/i),
    creator: authorNames.join(" / ") || cleanInlineText(authorLine),
    year: publishYear,
    category: doubanInfo.category,
    douban_rating: cleanInlineText(extractSingleMatch(html, /<strong[^>]*property="v:average"[^>]*>([^<]+)<\/strong>/i)),
    summary: cleanInlineText(
      extractSingleMatch(html, /<div class="related_info">[\s\S]*?<span class="all hidden">([\s\S]*?)<\/span>/i)
        || extractSingleMatch(html, /<div class="intro">([\s\S]*?)<\/div>/i)
    ),
    tags: uniq(extractAnchorTexts(tagsBlock)).slice(0, 8)
  };
}

function parseDoubanBookMobile(html, doubanInfo) {
  const metaDescription = cleanInlineText(extractSingleMatch(html, /<meta name="description" content="([^"]+)"/i));
  const subMeta = cleanInlineText(extractSingleMatch(html, /<div class="sub-meta">([\s\S]*?)<\/div>/i));
  const subMetaParts = subMeta
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title: cleanInlineText(extractSingleMatch(html, /<div class="sub-title">([\s\S]*?)<\/div>/i)),
    cover_url: extractSingleMatch(html, /<meta property="og:image" content="([^"]+)"/i),
    creator: subMetaParts[0] || "",
    year: extractSingleMatch(subMeta, /(\d{4}(?:-\d{1,2})?)(?=出版|$)/i) || extractSingleMatch(subMeta, /(\d{4})/i),
    category: doubanInfo.category,
    douban_rating: cleanInlineText(extractSingleMatch(html, /itemprop="ratingValue" content="([^"]+)"/i)),
    summary: metaDescription.replace(/^.*?简介：/u, "").trim(),
    tags: []
  };
}

function parseDoubanPayload(html, doubanInfo, mode) {
  const payload = doubanInfo.category === "movie"
    ? mode === "desktop"
      ? parseDoubanMovieDesktop(html, doubanInfo)
      : parseDoubanMovieMobile(html, doubanInfo)
    : mode === "desktop"
      ? parseDoubanBookDesktop(html, doubanInfo)
      : parseDoubanBookMobile(html, doubanInfo);

  return {
    ...payload,
    cover_url: toImageProxyUrl(payload.cover_url)
  };
}

const importItemsTransaction = db.transaction((payloads) => {
  clearItemsStatement.run();

  payloads.forEach((payload) => {
    const createdAt = payload.created_at || new Date().toISOString();
    insertItemStatement.run(buildItemStatementParams(payload, {
      createdAt,
      updatedAt: createdAt
    }));
  });
});

app.get("/api/items", (req, res) => {
  try {
    res.json({
      success: true,
      items: listItemsStatement.all().map(serializeItemRow)
    });
  } catch (error) {
    console.error("GET /api/items error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch items"
    });
  }
});

app.get("/healthz", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({
      ok: true,
      db_path: DB_PATH
    });
  } catch (error) {
    console.error("GET /healthz error:", error);
    res.status(500).json({
      ok: false,
      error: "Healthcheck failed"
    });
  }
});

app.post("/api/items", (req, res) => {
  try {
    const payload = normalizePayload(req.body || {});
    const now = new Date().toISOString();
    const result = insertItemStatement.run(buildItemStatementParams(payload, {
      createdAt: now,
      updatedAt: now
    }));

    res.status(201).json({
      success: true,
      item: serializeItemRow(getItemByIdStatement.get(result.lastInsertRowid))
    });
  } catch (error) {
    console.error("POST /api/items error:", error);
    const statusCode = error instanceof ValidationError ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof ValidationError ? error.message : "Failed to save item",
      details: error instanceof ValidationError ? error.details : undefined
    });
  }
});

app.post("/api/items/import", (req, res) => {
  try {
    const sourceItems = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!sourceItems) {
      return res.status(400).json({
        success: false,
        error: "items must be an array"
      });
    }

    const payloads = sourceItems.map((item) => normalizePayload(item, {
      allowFrontendAliases: true,
      allowImportDates: true
    }));

    importItemsTransaction(payloads);

    res.json({
      success: true,
      count: payloads.length
    });
  } catch (error) {
    console.error("POST /api/items/import error:", error);
    const statusCode = error instanceof ValidationError ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof ValidationError ? error.message : "Failed to import items",
      details: error instanceof ValidationError ? error.details : undefined
    });
  }
});

function handleUpdateItem(req, res) {
  try {
    const id = parseItemId(req.params.id);
    const payload = normalizePayload(req.body || {}, { allowFrontendAliases: true });
    const result = updateItemStatement.run(buildItemStatementParams(payload, {
      id,
      updatedAt: new Date().toISOString()
    }));

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }

    res.json({
      success: true,
      item: serializeItemRow(getItemByIdStatement.get(id))
    });
  } catch (error) {
    console.error(`${req.method} /api/items/:id error:`, error);

    let statusCode = 500;
    let message = "Failed to update item";
    let details;

    if (error instanceof ValidationError) {
      statusCode = 400;
      message = error.message;
      details = error.details;
    } else if (error.message === "invalid item id") {
      statusCode = 400;
      message = "Invalid item id";
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      details
    });
  }
}

app.put("/api/items/:id", handleUpdateItem);
app.patch("/api/items/:id", handleUpdateItem);

app.delete("/api/items/:id", (req, res) => {
  try {
    const id = parseItemId(req.params.id);
    const result = deleteItemStatement.run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }

    res.json({
      success: true
    });
  } catch (error) {
    console.error("DELETE /api/items/:id error:", error);
    res.status(error.message === "invalid item id" ? 400 : 500).json({
      success: false,
      error: error.message === "invalid item id" ? "Invalid item id" : "Failed to delete item"
    });
  }
});

app.delete("/api/items", (req, res) => {
  try {
    clearItemsStatement.run();
    res.json({
      success: true
    });
  } catch (error) {
    console.error("DELETE /api/items error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear items"
    });
  }
});

app.get("/stats/summary", (req, res) => {
  try {
    const summary = statsSummaryStatement.get();
    const monthlyTrendRows = getMonthlyTrendRows();
    const topTagRow = getTagDistribution(1)[0] || null;

    res.json({
      ...summary,
      insight: buildStatsInsight(summary, topTagRow, monthlyTrendRows)
    });
  } catch (error) {
    console.error("GET /stats/summary error:", error);
    res.status(500).json({
      error: "Failed to fetch stats summary"
    });
  }
});

app.get("/stats/monthly-trend", (req, res) => {
  try {
    res.json(getMonthlyTrendRows());
  } catch (error) {
    console.error("GET /stats/monthly-trend error:", error);
    res.status(500).json({
      error: "Failed to fetch monthly trend"
    });
  }
});

app.get("/stats/category-distribution", (req, res) => {
  try {
    res.json(getCategoryDistributionRows());
  } catch (error) {
    console.error("GET /stats/category-distribution error:", error);
    res.status(500).json({
      error: "Failed to fetch category distribution"
    });
  }
});

app.get("/stats/tag-distribution", (req, res) => {
  try {
    res.json(getTagDistribution(10));
  } catch (error) {
    console.error("GET /stats/tag-distribution error:", error);
    res.status(500).json({
      error: "Failed to fetch tag distribution"
    });
  }
});

app.get("/api/image-proxy", async (req, res) => {
  try {
    const targetUrl = normalizeImageProxyTarget(req.query.url);
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: "Invalid image url"
      });
    }

    const imageResponse = await fetch(targetUrl, {
      headers: {
        ...DOUBAN_DESKTOP_HEADERS,
        referer: "https://www.douban.com/"
      }
    });

    if (!imageResponse.ok) {
      return res.status(502).json({
        success: false,
        error: "Failed to fetch image"
      });
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const contentLength = imageResponse.headers.get("content-length");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    res.send(buffer);
  } catch (error) {
    console.error("GET /api/image-proxy error:", error);
    res.status(500).json({
      success: false,
      error: "Image proxy failed"
    });
  }
});

app.get("/api/fetch-douban", async (req, res) => {
  try {
    const doubanInfo = normalizeDoubanRequestUrl(req.query.url);
    if (!doubanInfo) {
      return res.status(400).json({
        success: false,
        error: "请粘贴有效的豆瓣电影或图书详情链接"
      });
    }

    const page = await fetchDoubanPage(doubanInfo);
    const payload = parseDoubanPayload(page.html, doubanInfo, page.mode);

    if (!payload.title) {
      return res.status(502).json({
        success: false,
        error: "未能识别这条豆瓣内容，请换一个链接再试"
      });
    }

    res.json({
      success: true,
      source_url: doubanInfo.desktopUrl,
      douban_url: doubanInfo.desktopUrl,
      ...payload
    });
  } catch (error) {
    console.error("GET /api/fetch-douban error:", error);
    res.status(500).json({
      success: false,
      error: "豆瓣信息抓取失败，请稍后重试"
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/stats", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "stats.html"));
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    try {
      db.close();
    } catch (error) {
      console.error("Failed to close SQLite connection:", error);
    }
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
