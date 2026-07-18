const CATEGORIES = new Set(["movie", "book", "tv", "anime", "documentary"]);
const STATUSES = new Set(["pending", "progress", "done", "paused"]);
const ADMIN_COOKIE = "mls_admin";
const COOKIE_TTL = 60 * 60 * 24 * 14;

const ITEM_COLUMNS = [
  "title", "cover_url", "creator", "year", "category", "status", "my_rating",
  "douban_rating", "summary", "note", "quick_note", "tags", "mood",
  "remind_date", "progress", "quotes_json", "rewatches_json", "douban_url"
];

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers }
});

function clean(value) {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text || null;
}

function parseArray(value) {
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((entry) => String(entry).trim()).filter(Boolean);
  } catch (_) {}
  return String(value).split(/[,，]/).map((entry) => entry.trim()).filter(Boolean);
}

function normalize(payload = {}) {
  const title = clean(payload.title);
  if (!title) throw new Error("title is required");

  const category = clean(payload.category || payload.type) || "movie";
  if (!CATEGORIES.has(category)) throw new Error("category must be movie, tv, anime, documentary or book");

  const statusAliases = { want: "pending", drop: "paused" };
  const status = statusAliases[payload.status] || clean(payload.status) || "pending";
  if (!STATUSES.has(status)) throw new Error("status must be pending, progress, done or paused");

  const ratingSource = payload.my_rating ?? payload.myScore ?? payload.rating;
  const rating = ratingSource === "" || ratingSource === null || ratingSource === undefined
    ? null
    : Number(ratingSource);
  if (rating !== null && (!Number.isFinite(rating) || rating < 1 || rating > 10)) {
    throw new Error("my_rating must be between 1 and 10");
  }

  const tags = [...new Set(parseArray(payload.tags))].join(",");
  return {
    title,
    cover_url: clean(payload.cover_url ?? payload.cover),
    creator: clean(payload.creator),
    year: clean(payload.year),
    category,
    status,
    my_rating: rating,
    douban_rating: clean(payload.douban_rating ?? payload.dscore),
    summary: clean(payload.summary ?? payload.desc),
    note: clean(payload.note),
    quick_note: clean(payload.quick_note ?? payload.quickNote),
    tags: tags || null,
    mood: clean(payload.mood),
    remind_date: clean(payload.remind_date ?? payload.remind),
    progress: clean(payload.progress),
    quotes_json: JSON.stringify(parseArray(payload.quotes ?? payload.quotes_json)),
    rewatches_json: JSON.stringify(Array.isArray(payload.rewatches) ? payload.rewatches : safeJsonArray(payload.rewatches_json)),
    douban_url: clean(payload.douban_url ?? payload.douban)
  };
}

function safeJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function serialize(row) {
  return {
    ...row,
    tags: parseArray(row.tags),
    quotes: safeJsonArray(row.quotes_json),
    rewatches: safeJsonArray(row.rewatches_json)
  };
}

function cookies(request) {
  return Object.fromEntries((request.headers.get("cookie") || "").split(";").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? ["", ""] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value, env) {
  const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD || "admin-not-configured";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function safeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const raw = cookies(request)[ADMIN_COOKIE];
  if (!raw) return false;
  const [scope, expiresText, signature] = raw.split(".");
  const expires = Number(expiresText);
  if (scope !== "admin" || !Number.isFinite(expires) || expires <= Date.now()) return false;
  return safeEqual(signature, await sign(`admin.${expiresText}`, env));
}

async function requireAdmin(request, env) {
  return (await isAdmin(request, env)) ? null : json({ success: false, error: "Admin authentication required" }, 401);
}

async function body(request) {
  try { return await request.json(); } catch (_) { return {}; }
}

function statementValues(item) {
  return ITEM_COLUMNS.map((column) => item[column]);
}

async function getItem(env, id) {
  return env.DB.prepare("SELECT * FROM items WHERE id = ?").bind(id).first();
}

function monthKeys() {
  const result = [];
  const date = new Date();
  date.setUTCDate(1);
  for (let offset = 5; offset >= 0; offset -= 1) {
    const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - offset, 1));
    result.push(`${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return result;
}

function tagDistribution(rows, limit = 10) {
  const counts = new Map();
  rows.forEach(({ tags }) => parseArray(tags).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN")).slice(0, limit);
}

function insight(summary, topTag, monthly) {
  const total = Number(summary.total_movies) + Number(summary.total_books);
  if (total < 3) return "你已经开始积累自己的观影和阅读记录，随着数据增加，会看到更清晰的兴趣轮廓。";
  const medium = Number(summary.total_movies) > Number(summary.total_books) ? "更偏向影像内容" : Number(summary.total_books) > Number(summary.total_movies) ? "更偏向阅读" : "在影像与阅读之间保持着平衡";
  const avg = Number(summary.avg_rating);
  const rating = !avg ? "还在慢慢建立评分习惯" : avg >= 8.5 ? "平均评分偏高" : avg >= 7 ? "平均评分中等偏高" : "评分标准比较克制";
  const preference = topTag ? `，最常标记的是“${topTag.tag}”` : "";
  const totalRecent = monthly.reduce((sum, row) => sum + row.count, 0);
  const newHabit = totalRecent >= 3 && monthly.at(-1).count / totalRecent >= 0.6 ? "，最近的记录主要集中在本月，记录习惯刚开始建立" : "";
  return `你${medium}，${rating}${preference}${newHabit}。`;
}

function normalizeDoubanUrl(value) {
  const text = String(value || "").trim();
  const match = text.match(/(?:subject\/|dispatch\/(?:movie|book)\/)(\d+)/i);
  if (!match) return null;
  const category = /book\.douban|dispatch\/book/i.test(text) ? "book" : "movie";
  return { id: match[1], category, url: `https://${category === "book" ? "book" : "movie"}.douban.com/subject/${match[1]}/` };
}

function stripHtml(value) {
  return String(value || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function match(html, regex) {
  return (html.match(regex) || [])[1] || "";
}

function parseDouban(html, info, origin) {
  const title = stripHtml(match(html, /<span[^>]+property=["']v:itemreviewed["'][^>]*>([\s\S]*?)<\/span>/i)
    || match(html, /<title>([\s\S]*?)<\/title>/i).replace(/\(豆瓣\).*$/i, ""));
  const cover = match(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)
    || match(html, /<img[^>]+rel=["']v:image["'][^>]+src=["']([^"']+)/i);
  const rating = stripHtml(match(html, /property=["']v:average["'][^>]*>([^<]+)/i)
    || match(html, /itemprop=["']ratingValue["'][^>]+content=["']([^"']+)/i));
  const year = match(html, /<span class=["']year["']>\((\d{4})\)<\/span>/i)
    || match(html, /(?:出版年|首播|上映日期)[^\d]{0,80}(\d{4})/i);
  const creatorLabel = info.category === "book" ? "作者" : "导演";
  const creatorLine = match(html, new RegExp(`<span class=["']pl["']>${creatorLabel}[:：]?</span>([\\s\\S]*?)(?:<br|</div>)`, "i"));
  const creator = stripHtml(creatorLine);
  const summary = stripHtml(match(html, /<span[^>]+property=["']v:summary["'][^>]*>([\s\S]*?)<\/span>/i)
    || match(html, /<div class=["']intro["']>([\s\S]*?)<\/div>/i));
  const tags = [...html.matchAll(/<span property=["']v:genre["']>([^<]+)<\/span>/gi)].map((entry) => stripHtml(entry[1]));
  return {
    title,
    cover_url: cover ? `${origin}/api/image-proxy?url=${encodeURIComponent(cover)}` : "",
    creator,
    year,
    category: info.category,
    douban_rating: rating,
    summary,
    tags
  };
}

function parseDoubanJson(data, info, origin) {
  const names = (value) => Array.isArray(value)
    ? value.map((entry) => clean(entry && typeof entry === "object" ? entry.name : entry)).filter(Boolean).join(" / ")
    : "";
  const cover = data.cover_url || data.cover?.large || data.cover?.normal || data.pic?.large || data.pic?.normal || "";
  const rating = data.rating && typeof data.rating === "object" ? data.rating.value : data.rating;
  const creator = info.category === "book" ? names(data.authors || data.author) : names(data.directors);

  return {
    title: clean(data.title),
    cover_url: cover ? `${origin}/api/image-proxy?url=${encodeURIComponent(cover)}` : "",
    creator,
    year: clean(data.year),
    category: info.category,
    douban_rating: clean(rating),
    summary: clean(data.intro || data.abstract),
    tags: (Array.isArray(data.genres) ? data.genres : data.tags || [])
      .map((entry) => clean(entry && typeof entry === "object" ? entry.name : entry))
      .filter(Boolean)
  };
}

async function fetchDoubanPayload(info, origin) {
  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "accept-language": "zh-CN,zh;q=0.9",
    referer: `https://m.douban.com/${info.category}/subject/${info.id}/`
  };

  try {
    const response = await fetch(`https://m.douban.com/rexxar/api/v2/${info.category}/${info.id}`, { headers });
    if (response.ok) {
      const payload = parseDoubanJson(await response.json(), info, origin);
      if (payload.title) return payload;
    }
  } catch (error) {
    console.error("Douban JSON API fallback:", error);
  }

  const response = await fetch(info.url, { headers });
  if (!response.ok) throw new Error("DOUBAN_UNAVAILABLE");
  const payload = parseDouban(await response.text(), info, origin);
  if (!payload.title) throw new Error("DOUBAN_UNRECOGNIZED");
  return payload;
}

async function api(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path === "/healthz") {
    await env.DB.prepare("SELECT 1").first();
    return json({ ok: true, database: "d1" });
  }

  if (path === "/api/admin/session" && method === "GET") {
    const configured = Boolean(env.ADMIN_PASSWORD);
    return json({ success: true, authenticated: await isAdmin(request, env), configured, admin_enabled: configured });
  }

  if (path === "/api/admin/login" && method === "POST") {
    if (!env.ADMIN_PASSWORD) return json({ success: false, error: "Admin login is not configured" }, 503);
    const payload = await body(request);
    if (!safeEqual(payload.password, env.ADMIN_PASSWORD)) return json({ success: false, error: "Invalid admin password" }, 401);
    const expires = Date.now() + COOKIE_TTL * 1000;
    const value = `admin.${expires}.${await sign(`admin.${expires}`, env)}`;
    return json({ success: true, authenticated: true }, 200, { "set-cookie": `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Max-Age=${COOKIE_TTL}; Path=/; HttpOnly; Secure; SameSite=Lax` });
  }

  if (path === "/api/admin/logout" && method === "POST") {
    return json({ success: true, authenticated: false }, 200, { "set-cookie": `${ADMIN_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax` });
  }

  if (path === "/api/items" && method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM items ORDER BY datetime(created_at) DESC, id DESC").all();
    return json({ success: true, items: result.results.map(serialize) });
  }

  if (path === "/api/items" && method === "POST") {
    const denied = await requireAdmin(request, env); if (denied) return denied;
    try {
      const item = normalize(await body(request));
      const now = new Date().toISOString();
      const placeholders = ITEM_COLUMNS.map(() => "?").join(",");
      const result = await env.DB.prepare(`INSERT INTO items (${ITEM_COLUMNS.join(",")}, created_at, updated_at) VALUES (${placeholders}, ?, ?)`).bind(...statementValues(item), now, now).run();
      return json({ success: true, item: serialize(await getItem(env, result.meta.last_row_id)) }, 201);
    } catch (error) {
      return json({ success: false, error: error.message || "Failed to save item" }, 400);
    }
  }

  if (path === "/api/items/import" && method === "POST") {
    const denied = await requireAdmin(request, env); if (denied) return denied;
    try {
      const payload = await body(request);
      if (!Array.isArray(payload.items)) throw new Error("items must be an array");
      const statements = [env.DB.prepare("DELETE FROM items")];
      const placeholders = ITEM_COLUMNS.map(() => "?").join(",");
      payload.items.forEach((source) => {
        const item = normalize(source);
        const created = clean(source.created_at) || new Date().toISOString();
        statements.push(env.DB.prepare(`INSERT INTO items (${ITEM_COLUMNS.join(",")}, created_at, updated_at) VALUES (${placeholders}, ?, ?)`).bind(...statementValues(item), created, clean(source.updated_at) || created));
      });
      await env.DB.batch(statements);
      return json({ success: true, count: payload.items.length });
    } catch (error) {
      return json({ success: false, error: error.message || "Failed to import items" }, 400);
    }
  }

  const itemMatch = path.match(/^\/api\/items\/(\d+)$/);
  if (itemMatch && ["PUT", "PATCH"].includes(method)) {
    const denied = await requireAdmin(request, env); if (denied) return denied;
    try {
      const id = Number(itemMatch[1]);
      const item = normalize(await body(request));
      const assignments = ITEM_COLUMNS.map((column) => `${column} = ?`).join(",");
      const result = await env.DB.prepare(`UPDATE items SET ${assignments}, updated_at = ? WHERE id = ?`).bind(...statementValues(item), new Date().toISOString(), id).run();
      if (!result.meta.changes) return json({ success: false, error: "Item not found" }, 404);
      return json({ success: true, item: serialize(await getItem(env, id)) });
    } catch (error) {
      return json({ success: false, error: error.message || "Failed to update item" }, 400);
    }
  }

  if (itemMatch && method === "DELETE") {
    const denied = await requireAdmin(request, env); if (denied) return denied;
    const result = await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(Number(itemMatch[1])).run();
    return result.meta.changes ? json({ success: true }) : json({ success: false, error: "Item not found" }, 404);
  }

  if (path === "/api/items" && method === "DELETE") {
    const denied = await requireAdmin(request, env); if (denied) return denied;
    await env.DB.prepare("DELETE FROM items").run();
    return json({ success: true });
  }

  if (path.startsWith("/stats/")) {
    const rows = (await env.DB.prepare("SELECT * FROM items").all()).results;
    const monthly = monthKeys().map((month) => ({ month, count: rows.filter((row) => String(row.created_at || "").slice(0, 7) === month).length }));
    const tags = tagDistribution(rows);
    if (path === "/stats/monthly-trend") return json(monthly);
    if (path === "/stats/tag-distribution") return json(tags);
    if (path === "/stats/category-distribution") {
      const labels = { movie: "电影", tv: "电视剧", anime: "动漫", documentary: "纪录片", book: "书籍" };
      return json(Object.keys(labels).map((category) => ({ category, label: labels[category], count: rows.filter((row) => row.category === category).length })));
    }
    if (path === "/stats/summary") {
      const ratings = rows.map((row) => Number(row.my_rating)).filter(Number.isFinite);
      const summary = {
        total_movies: rows.filter((row) => row.category !== "book").length,
        total_books: rows.filter((row) => row.category === "book").length,
        avg_rating: ratings.length ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)) : null
      };
      return json({ ...summary, insight: insight(summary, tags[0], monthly) });
    }
  }

  if (path === "/api/image-proxy" && method === "GET") {
    const target = url.searchParams.get("url");
    if (!target || !/^https:\/\/[^/]*doubanio\.com\//i.test(target)) return json({ success: false, error: "Invalid image url" }, 400);
    const response = await fetch(target, { headers: { referer: "https://www.douban.com/", "user-agent": "Mozilla/5.0" } });
    if (!response.ok) return json({ success: false, error: "Failed to fetch image" }, 502);
    return new Response(response.body, { headers: { "content-type": response.headers.get("content-type") || "image/jpeg", "cache-control": "public, max-age=86400" } });
  }

  if (path === "/api/fetch-douban" && method === "GET") {
    const denied = await requireAdmin(request, env); if (denied) return denied;
    const info = normalizeDoubanUrl(url.searchParams.get("url"));
    if (!info) return json({ success: false, error: "无法识别豆瓣链接，请检查是否为电影、电视剧或图书页面" }, 400);
    try {
      const payload = await fetchDoubanPayload(info, url.origin);
      return json({ success: true, source_url: info.url, douban_url: info.url, ...payload });
    } catch (error) {
      console.error("GET /api/fetch-douban error:", error);
      return json({ success: false, error: "豆瓣内容暂时无法获取，请稍后重试" }, 502);
    }
  }

  return null;
}

export default {
  async fetch(request, env) {
    try {
      const response = await api(request, env);
      if (response) return response;

      const url = new URL(request.url);
      if (url.pathname === "/stats") {
        url.pathname = "/stats.html";
        return env.ASSETS.fetch(new Request(url, request));
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Worker request failed", error);
      return json({ success: false, error: "Internal server error" }, 500);
    }
  }
};
