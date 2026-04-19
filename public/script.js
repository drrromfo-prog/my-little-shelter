let items = [];
let myScore = 0;
let myMood = "";
let editId = null;
let currentNav = "all";
let activePill = "type-all";
let rewatchTargetId = null;
let quoteWorkFilter = "all";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const MOODS = [
  { emoji: "😊", label: "开心" },
  { emoji: "🥹", label: "感动" },
  { emoji: "🤯", label: "烧脑" },
  { emoji: "😢", label: "难过" },
  { emoji: "😌", label: "治愈" },
  { emoji: "😰", label: "紧张" },
  { emoji: "😂", label: "搞笑" },
  { emoji: "🤔", label: "深思" },
  { emoji: "😴", label: "无聊" },
  { emoji: "🥰", label: "喜爱" }
];

const TAG_COLORS = ["tc0", "tc1", "tc2", "tc3", "tc4", "tc5"];
const CATEGORY_META = {
  movie: { label: "电影", icon: "🎬", subtitle: "现实轻微变形的两小时" },
  tv: { label: "电视剧", icon: "📺", subtitle: "怎么一集接一集的停不下来？" },
  anime: { label: "动漫", icon: "✨", subtitle: "现实的物理规则在这里不适用，感谢" },
  documentary: { label: "纪录片", icon: "🎞️", subtitle: "所有的真实都值得被目击一次" },
  book: { label: "书籍", icon: "📚", subtitle: "阅读过的字会留在我身体里，像某个血小板" }
};
const CATEGORY_FILTER_ORDER = ["movie", "tv", "anime", "documentary", "book"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function requestJson(url, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers
  }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "请求失败");
    }

    return payload;
  });
}

function proxyCoverUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const parsedUrl = new URL(String(value), window.location.origin);
    if (parsedUrl.pathname === "/api/image-proxy") {
      return parsedUrl.pathname + parsedUrl.search;
    }

    if (parsedUrl.hostname.endsWith("doubanio.com") || parsedUrl.hostname.endsWith("douban.com")) {
      return `/api/image-proxy?url=${encodeURIComponent(parsedUrl.toString())}`;
    }
  } catch (error) {
    return String(value);
  }

  return String(value);
}

function parseTags(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value)
    .split(/[,\n，]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseRewatches(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => ({
        date: String(entry?.date || "").trim(),
        note: String(entry?.note || "").trim()
      }))
      .filter((entry) => entry.date || entry.note);
  }

  try {
    return parseRewatches(JSON.parse(value));
  } catch (error) {
    return [];
  }
}

function parseQuotes(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  try {
    return parseQuotes(JSON.parse(value));
  } catch (error) {
    return [];
  }
}

function mapStatusFromApi(status) {
  if (status === "progress") {
    return "progress";
  }

  if (status === "done") {
    return "done";
  }

  if (status === "paused") {
    return "drop";
  }

  return "want";
}

function mapStatusToApi(status) {
  if (status === "progress") {
    return "progress";
  }

  if (status === "done") {
    return "done";
  }

  if (status === "drop") {
    return "paused";
  }

  return "pending";
}

function mapItemFromApi(item) {
  return {
    id: String(item.id),
    type: item.category || "movie",
    douban: item.douban_url || "",
    title: item.title || "",
    cover: proxyCoverUrl(item.cover_url || ""),
    creator: item.creator || "",
    year: item.year || "",
    dscore: item.douban_rating || "",
    status: mapStatusFromApi(item.status),
    myScore: item.my_rating === null || item.my_rating === undefined ? 0 : Number(item.my_rating),
    mood: item.mood || "",
    tags: parseTags(item.tags),
    remind: item.remind_date || "",
    progress: item.progress || "",
    quickNote: item.quick_note || "",
    desc: item.summary || "",
    note: item.note || "",
    quotes: parseQuotes(item.quotes),
    rewatches: parseRewatches(item.rewatches),
    addedAt: Date.parse(item.created_at || "") || Date.now()
  };
}

function buildApiPayloadFromItem(item) {
  return {
    title: item.title,
    cover_url: item.cover,
    creator: item.creator,
    year: item.year,
    category: item.type,
    status: mapStatusToApi(item.status),
    my_rating: item.myScore || null,
    douban_rating: item.dscore || "",
    summary: item.desc || "",
    note: item.note || "",
    tags: parseTags(item.tags).join(","),
    mood: item.mood || "",
    remind_date: item.remind || "",
    progress: item.progress || "",
    quick_note: item.quickNote || "",
    quotes: item.quotes || [],
    rewatches: item.rewatches || [],
    douban_url: item.douban || ""
  };
}

function buildApiPayloadFromForm(existingItem = null) {
  return {
    title: document.getElementById("f-title").value.trim(),
    cover_url: document.getElementById("f-cover").value.trim(),
    creator: document.getElementById("f-creator").value.trim(),
    year: document.getElementById("f-year").value.trim(),
    category: document.getElementById("f-type").value,
    status: mapStatusToApi(document.getElementById("f-status").value),
    my_rating: myScore || null,
    douban_rating: document.getElementById("f-dscore").value.trim(),
    summary: document.getElementById("f-desc").value.trim(),
    note: document.getElementById("f-note").value.trim(),
    tags: parseTags(document.getElementById("f-tags").value).join(","),
    mood: myMood || "",
    remind_date: document.getElementById("f-remind").value || "",
    progress: document.getElementById("f-progress").value.trim(),
    quick_note: document.getElementById("f-quick-note").value.trim(),
    quotes: existingItem?.quotes || [],
    rewatches: existingItem?.rewatches || [],
    douban_url: document.getElementById("f-douban").value.trim()
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(remindDate) {
  return Boolean(remindDate) && remindDate < today();
}

function tagColor(tag) {
  let hash = 0;
  for (const char of String(tag)) {
    hash = (hash * 31 + char.charCodeAt(0)) % TAG_COLORS.length;
  }
  return TAG_COLORS[Math.abs(hash)];
}

function statusLabel(status, type) {
  if (status === "want") {
    return type === "book" ? "想读" : "想看";
  }

  if (status === "progress") {
    return type === "book" ? "正在读" : "正在看";
  }

  if (status === "done") {
    return type === "book" ? "已读" : "已看";
  }

  return "搁置";
}

function itemPreviewText(item) {
  return item.quickNote || item.note || "";
}

function categoryEmoji(type) {
  return CATEGORY_META[type]?.icon || "🎬";
}

function categoryLabel(type) {
  return CATEGORY_META[type]?.label || "电影";
}

function formatScore(score) {
  if (!score) {
    return "";
  }

  return Number.isInteger(score) ? String(score) : Number(score).toFixed(1);
}

function roundedScore(score) {
  return Math.max(0, Math.min(10, Math.round(Number(score) || 0)));
}

function getFilteredItems() {
  let filtered = [...items];

  if (CATEGORY_META[currentNav]) {
    filtered = filtered.filter((item) => item.type === currentNav);
  } else if (currentNav === "want") {
    filtered = filtered.filter((item) => item.status === "want");
  } else if (currentNav === "progress") {
    filtered = filtered.filter((item) => item.status === "progress");
  } else if (currentNav === "done") {
    filtered = filtered.filter((item) => item.status === "done");
  }

  if (currentNav === "all") {
    const activeCategory = activePill.startsWith("type-") ? activePill.slice(5) : "";
    if (activeCategory && activeCategory !== "all" && CATEGORY_META[activeCategory]) {
      filtered = filtered.filter((item) => item.type === activeCategory);
    }
  }

  const searchValue = (document.getElementById("search-input")?.value || "").trim().toLowerCase();
  if (searchValue) {
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(searchValue)
      || item.creator.toLowerCase().includes(searchValue)
      || item.tags.some((tag) => tag.toLowerCase().includes(searchValue))
    );
  }

  const sortValue = document.getElementById("sort-select")?.value || "date";
  if (sortValue === "score") {
    filtered.sort((left, right) => (Number(right.myScore) || 0) - (Number(left.myScore) || 0));
  } else if (sortValue === "dscore") {
    filtered.sort((left, right) => (Number(right.dscore) || 0) - (Number(left.dscore) || 0));
  } else if (sortValue === "title") {
    filtered.sort((left, right) => left.title.localeCompare(right.title, "zh-CN"));
  } else {
    filtered.sort((left, right) => right.addedAt - left.addedAt);
  }

  return filtered;
}

function renderFilterPills() {
  const container = document.getElementById("filter-pills");
  if (currentNav !== "all") {
    container.innerHTML = "";
    return;
  }

  const pillItems = [
    { key: "type-all", label: "全部" },
    ...CATEGORY_FILTER_ORDER.map((category) => ({
      key: `type-${category}`,
      label: `${CATEGORY_META[category].icon} ${CATEGORY_META[category].label}`
    }))
  ];

  container.innerHTML = pillItems
    .map((pill) => `<span class="pill${activePill === pill.key ? " active" : ""}" onclick="setPill('${pill.key}')">${pill.label}</span>`)
    .join("");
}

function renderSidebarStats() {
  const doneItems = items.filter((item) => item.status === "done");
  const wantItems = items.filter((item) => item.status === "want");
  const progressItems = items.filter((item) => item.status === "progress");
  const scoredItems = doneItems.filter((item) => Number(item.myScore) > 0);
  const averageScore = scoredItems.length > 0
    ? (scoredItems.reduce((sum, item) => sum + Number(item.myScore || 0), 0) / scoredItems.length).toFixed(1)
    : "-";
  const reminders = wantItems.filter((item) => item.remind).length;

  document.getElementById("sidebar-mini-stats").innerHTML = `
    <div class="sms-title">MY STATS</div>
    <div class="sms-row"><span class="sms-label">全部</span><span class="sms-val">${items.length}</span></div>
    <div class="sms-row"><span class="sms-label">已完成</span><span class="sms-val">${doneItems.length}</span></div>
    <div class="sms-row"><span class="sms-label">待看/读</span><span class="sms-val">${wantItems.length}</span></div>
    <div class="sms-row"><span class="sms-label">正在看/读</span><span class="sms-val">${progressItems.length}</span></div>
    <div class="sms-row"><span class="sms-label">平均评分</span><span class="sms-val">${averageScore}</span></div>
    ${reminders ? `<div class="sms-row"><span class="sms-label">🔔 提醒</span><span class="sms-val" style="color:var(--amber-t)">${reminders}</span></div>` : ""}
  `;
}

function renderCards() {
  const container = document.getElementById("cards-grid");
  const filteredItems = getFilteredItems();

  if (filteredItems.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${CATEGORY_META[currentNav] ? categoryEmoji(currentNav) : "🎬"}</div>
        <div class="empty-text">暂无记录</div>
        <div class="empty-sub">点击右上角「新增」开始吧~</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredItems.map((item) => {
    const tags = item.tags.slice(0, 3);
    const scoreText = formatScore(item.myScore);
    const rewatchCount = item.rewatches.length;
    const previewText = itemPreviewText(item);
    const remindText = item.remind && item.status === "want"
      ? (isOverdue(item.remind) ? "⚠️ 已过期" : escapeHtml(item.remind))
      : "";

    return `
      <div class="card" onclick="openDetail('${item.id}')">
        <div class="card-cover">
          ${item.cover
            ? `<img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" onerror="this.parentElement.innerHTML='<div class=&quot;cover-ph&quot;><div class=&quot;cover-ph-icon&quot;>${categoryEmoji(item.type)}</div><div class=&quot;cover-ph-title&quot;>${escapeHtml(item.title)}</div></div>'" />`
            : `<div class="cover-ph"><div class="cover-ph-icon">${categoryEmoji(item.type)}</div><div class="cover-ph-title">${escapeHtml(item.title)}</div></div>`}
          <span class="card-badge s-${item.status}">${statusLabel(item.status, item.type)}</span>
          ${item.mood ? `<span class="card-mood">${escapeHtml(item.mood)}</span>` : ""}
          ${remindText ? `<span class="card-remind">${remindText}</span>` : ""}
        </div>
        <div class="card-body">
          <div class="card-title">${escapeHtml(item.title)}</div>
          <div class="card-meta">${escapeHtml([item.creator, item.year].filter(Boolean).join(" · ") || " ")}</div>
          ${scoreText ? `<div class="card-score"><span class="stars-sm">${"★".repeat(roundedScore(item.myScore))}</span><span class="score-txt">${escapeHtml(scoreText)}/10</span></div>` : ""}
          ${tags.length > 0 ? `<div class="card-tags">${tags.map((tag) => `<span class="tag ${tagColor(tag)}">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          ${previewText ? `<div class="card-snippet">${escapeHtml(previewText)}</div>` : ""}
          ${rewatchCount > 0 ? `<span class="rewatch-badge">🔁 看了 ${rewatchCount + 1} 遍</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function renderTimeline() {
  const container = document.getElementById("timeline-content");
  const doneItems = items
    .filter((item) => item.status === "done")
    .sort((left, right) => right.addedAt - left.addedAt);
  const remindItems = items
    .filter((item) => item.status === "want" && item.remind)
    .sort((left, right) => left.remind.localeCompare(right.remind));

  if (doneItems.length === 0 && remindItems.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📅</div>
        <div class="empty-text">暂无时间线记录</div>
        <div class="empty-sub">已看/已读的内容会出现在这里</div>
      </div>
    `;
    return;
  }

  const monthGroups = {};
  doneItems.forEach((item) => {
    const date = new Date(item.addedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthGroups[key]) {
      monthGroups[key] = [];
    }
    monthGroups[key].push(item);
  });

  let html = "";

  if (remindItems.length > 0) {
    html += `<div class="tl-year">即将观看</div><div class="tl-month-group"><div class="tl-month">提醒清单</div><div class="tl-items">`;
    html += remindItems.map((item) => `
      <div class="tl-item" onclick="openDetail('${item.id}')">
        ${item.cover
          ? `<img class="tl-item-cover" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;tl-item-cover-ph&quot;>${categoryEmoji(item.type)}</div>'" />`
          : `<div class="tl-item-cover-ph">${categoryEmoji(item.type)}</div>`}
        <div class="tl-item-body">
          <div class="tl-item-top">
            <div>
              <div class="tl-item-title">${escapeHtml(item.title)}</div>
              <div class="tl-item-meta">${escapeHtml(item.remind)}${isOverdue(item.remind) ? ' · <span style="color:#991b1b">已过期</span>' : ""}</div>
            </div>
            <span class="card-badge s-want" style="font-size:10px;padding:2px 8px">${statusLabel(item.status, item.type)}</span>
          </div>
        </div>
      </div>
    `).join("");
    html += `</div></div>`;
  }

  const years = [...new Set(Object.keys(monthGroups).map((key) => key.split("-")[0]))].sort((left, right) => Number(right) - Number(left));

  years.forEach((year) => {
    html += `<div class="tl-year">${year}</div>`;
    const monthKeys = Object.keys(monthGroups)
      .filter((key) => key.startsWith(year))
      .sort((left, right) => right.localeCompare(left));

    monthKeys.forEach((monthKey) => {
      const month = monthKey.split("-")[1];
      const monthItems = monthGroups[monthKey];

      html += `<div class="tl-month-group"><div class="tl-month">${Number(month)}月 · ${monthItems.length} 条</div><div class="tl-items">`;
      html += monthItems.map((item) => `
        <div class="tl-item" onclick="openDetail('${item.id}')">
          ${item.cover
            ? `<img class="tl-item-cover" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;tl-item-cover-ph&quot;>${categoryEmoji(item.type)}</div>'" />`
            : `<div class="tl-item-cover-ph">${categoryEmoji(item.type)}</div>`}
          <div class="tl-item-body">
            <div class="tl-item-top">
              <div>
                <div class="tl-item-title">${escapeHtml(item.title)}</div>
                <div class="tl-item-meta">${escapeHtml([item.creator, item.year].filter(Boolean).join(" · "))}</div>
              </div>
              <span class="tl-item-mood">${escapeHtml(item.mood || "")}</span>
            </div>
            ${item.myScore ? `<div class="card-score" style="margin-top:4px"><span class="stars-sm">${"★".repeat(roundedScore(item.myScore))}</span><span class="score-txt">${escapeHtml(formatScore(item.myScore))}/10</span></div>` : ""}
            ${itemPreviewText(item) ? `<div class="tl-item-note">${escapeHtml(itemPreviewText(item))}</div>` : ""}
          </div>
        </div>
      `).join("");
      html += `</div></div>`;
    });
  });

  container.innerHTML = html;
}

function renderStats() {
  const container = document.getElementById("stats-content");
  const doneItems = items.filter((item) => item.status === "done");
  const categoryRows = CATEGORY_FILTER_ORDER.map((category) => ({
    category,
    count: items.filter((item) => item.type === category).length
  }));
  const scoredItems = doneItems.filter((item) => Number(item.myScore) > 0);
  const averageScore = scoredItems.length > 0
    ? (scoredItems.reduce((sum, item) => sum + Number(item.myScore || 0), 0) / scoredItems.length).toFixed(1)
    : "-";
  const currentYear = String(new Date().getFullYear());
  const finishedThisYear = doneItems.filter((item) => String(new Date(item.addedAt).getFullYear()) === currentYear).length;

  const tagCounts = {};
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts).sort((left, right) => right[1] - left[1]).slice(0, 6);
  const maxTagCount = topTags[0]?.[1] || 1;

  const scoreDistribution = Array(10).fill(0);
  scoredItems.forEach((item) => {
    scoreDistribution[Math.max(0, Math.min(9, roundedScore(item.myScore) - 1))] += 1;
  });
  const maxScoreCount = Math.max(...scoreDistribution, 0) || 1;

  const topScored = [...doneItems]
    .filter((item) => Number(item.myScore) > 0)
    .sort((left, right) => Number(right.myScore) - Number(left.myScore))
    .slice(0, 5);

  const moodCounts = {};
  items.filter((item) => item.mood).forEach((item) => {
    moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
  });
  const topMoods = Object.entries(moodCounts).sort((left, right) => right[1] - left[1]).slice(0, 5);

  const quotes = items.flatMap((item) => item.quotes.map((quote) => ({ quote, title: item.title })));

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-num">${items.length}</div><div class="stat-label">总条目</div></div>
      <div class="stat-box"><div class="stat-num">${doneItems.length}</div><div class="stat-label">已完成</div></div>
      <div class="stat-box"><div class="stat-num">${averageScore}</div><div class="stat-label">平均评分</div></div>
      <div class="stat-box"><div class="stat-num">${finishedThisYear}</div><div class="stat-label">${currentYear}年完成</div></div>
    </div>
    <div class="stats-2col" style="margin-bottom:12px">
      <div class="stats-box">
        <h3>类型分布</h3>
        ${categoryRows.map(({ category, count }, index) => `<div class="bar-row"><span class="bar-label">${escapeHtml(categoryLabel(category))}</span><div class="bar-track"><div class="bar-fill" style="width:${items.length ? (count / items.length) * 100 : 0}%;background:${["#1f2937","#2563eb","#7c3aed","#d97706","#059669"][index] || "#1f2937"}"></div></div><span class="bar-val">${count}</span></div>`).join("")}
      </div>
      <div class="stats-box">
        <h3>观看心情 Top 5</h3>
        ${topMoods.length > 0
          ? topMoods.map(([emoji, count]) => `<div class="mood-stat-row"><span class="mood-stat-emoji">${escapeHtml(emoji)}</span><div class="bar-track"><div class="bar-fill" style="width:${(count / (topMoods[0]?.[1] || 1)) * 100}%;background:#7c3aed"></div></div><span class="bar-val">${count}</span></div>`).join("")
          : '<div style="font-size:13px;color:var(--ink4)">还没有心情记录</div>'}
      </div>
    </div>
    <div class="stats-2col" style="margin-bottom:12px">
      <div class="stats-box">
        <h3>⭐ 评分分布</h3>
        ${scoreDistribution.map((count, index) => `<div class="bar-row"><span class="bar-label">${index + 1}分</span><div class="bar-track"><div class="bar-fill" style="width:${(count / maxScoreCount) * 100}%;background:#f59e0b"></div></div><span class="bar-val">${count}</span></div>`).join("")}
      </div>
      <div class="stats-box">
        <h3>🏆 评分最高</h3>
        <div>
          ${topScored.length > 0
            ? topScored.map((item, index) => `<div class="top-item"><div class="top-rank${index < 3 ? ` r${index + 1}` : ""}">${index + 1}</div><div class="top-info"><div class="top-title">${escapeHtml(item.title)}</div><div class="top-meta">${escapeHtml(item.creator || "")}</div></div><div class="top-score">${escapeHtml(formatScore(item.myScore))}</div></div>`).join("")
            : '<div style="font-size:13px;color:var(--ink4)">还没有评分</div>'}
        </div>
      </div>
    </div>
    <div class="stats-box" style="margin-bottom:12px">
      <h3>🔖 常用标签</h3>
      ${topTags.length > 0
        ? topTags.map(([tag, count]) => `<div class="bar-row"><span class="bar-label" style="width:56px;font-size:11px">${escapeHtml(tag)}</span><div class="bar-track"><div class="bar-fill" style="width:${(count / maxTagCount) * 100}%;background:#5b21b6"></div></div><span class="bar-val">${count}</span></div>`).join("")
        : '<div style="font-size:13px;color:var(--ink4)">还没有标签</div>'}
    </div>
    ${quotes.length > 0 ? `<div class="stats-box"><h3>💬 金句摘录（${quotes.length} 条）</h3>${quotes.slice(0, 5).map(({ quote, title }) => `<div class="quote-item"><div class="quote-text">"${escapeHtml(quote)}"</div><div style="font-size:11px;color:var(--ink4);margin-top:4px">— ${escapeHtml(title)}</div></div>`).join("")}</div>` : ""}
  `;
}

function renderQuotesPage() {
  const container = document.getElementById("quotes-content");
  const quoteItems = items
    .filter((item) => item.quotes.length > 0)
    .sort((left, right) => left.title.localeCompare(right.title, "zh-CN"));

  if (quoteWorkFilter !== "all" && !quoteItems.some((item) => item.id === quoteWorkFilter)) {
    quoteWorkFilter = "all";
  }

  const quoteEntries = quoteItems.flatMap((item) => (
    quoteWorkFilter !== "all" && item.id !== quoteWorkFilter
      ? []
      : item.quotes.map((quote) => ({
        quote,
        title: item.title,
        creator: item.creator,
        type: item.type,
        year: item.year,
        id: item.id
      }))
  ));

  container.innerHTML = `
    <div class="view-shell">
      <div class="view-head">
        <div>
          <h3>摘录下来的句子</h3>
          <p>把那些想留下来的台词、段落和一句话都单独放在这里，也可以按作品慢慢筛。</p>
        </div>
        <select class="sort-select" onchange="setQuoteWorkFilter(this.value)">
          <option value="all"${quoteWorkFilter === "all" ? " selected" : ""}>全部作品</option>
          ${quoteItems.map((item) => `<option value="${item.id}"${quoteWorkFilter === item.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
        </select>
      </div>
      ${quoteEntries.length > 0
        ? `<div class="quote-page-grid">
            ${quoteEntries.map((entry) => `
              <div class="quote-card" onclick="openDetail('${entry.id}')">
                <div class="quote-card-text">“${escapeHtml(entry.quote)}”</div>
                <div class="quote-card-work">— ${escapeHtml(entry.title)}</div>
                <div class="quote-card-meta">${escapeHtml([categoryLabel(entry.type), entry.creator, entry.year].filter(Boolean).join(" · "))}</div>
              </div>
            `).join("")}
          </div>`
        : `<div class="empty"><div class="empty-icon">💬</div><div class="empty-text">还没有摘录</div><div class="empty-sub">在详情页记下一句喜欢的话，它就会出现在这里。</div></div>`}
    </div>
  `;
}

function formatCalendarMonth(date) {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function renderMoodCalendar() {
  const container = document.getElementById("calendar-content");
  const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const monthEnd = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
  const startWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const weekdayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const todayDate = new Date();
  const itemMap = new Map();

  items.forEach((item) => {
    const date = new Date(item.addedAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!itemMap.has(key)) {
      itemMap.set(key, []);
    }
    itemMap.get(key).push(item);
  });

  let cellsHtml = "";
  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startWeekday + 1;
    const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    if (!inMonth) {
      cellsHtml += `<div class="calendar-day muted"></div>`;
      continue;
    }

    const date = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), dayNumber);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const dayItems = (itemMap.get(dateKey) || []).sort((left, right) => right.addedAt - left.addedAt);
    const isToday = date.getFullYear() === todayDate.getFullYear()
      && date.getMonth() === todayDate.getMonth()
      && date.getDate() === todayDate.getDate();

    cellsHtml += `
      <div class="calendar-day${isToday ? " today" : ""}">
        <div class="calendar-day-head">
          <span class="calendar-day-num">${dayNumber}</span>
          <span>${dayItems.length ? `${dayItems.length} 条` : ""}</span>
        </div>
        ${dayItems.length > 0
          ? dayItems.slice(0, 3).map((item) => `
              <div class="calendar-entry" onclick="openDetail('${item.id}')">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
                  <div class="calendar-entry-title">${escapeHtml(item.title)}</div>
                  <span class="calendar-entry-mood">${escapeHtml(item.mood || "·")}</span>
                </div>
                ${itemPreviewText(item) ? `<div class="calendar-entry-note">${escapeHtml(itemPreviewText(item))}</div>` : ""}
              </div>
            `).join("")
          : '<div class="calendar-empty">这一天没有留下记录</div>'}
        ${dayItems.length > 3 ? `<div class="calendar-empty">+${dayItems.length - 3} 条更多记录</div>` : ""}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="view-shell">
      <div class="view-head">
        <div>
          <h3>把那些日子重新翻开</h3>
          <p>按记录创建日期整理，看看那天看了什么、当时是什么心情，像一本慢慢长出来的私人日历。</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="shiftCalendarMonth(-1)">← 上个月</button>
          <span style="font-size:13px;color:var(--ink2)">${formatCalendarMonth(calendarCursor)}</span>
          <button class="btn btn-outline btn-sm" onclick="shiftCalendarMonth(1)">下个月 →</button>
          <button class="btn btn-ghost btn-sm" onclick="jumpCalendarToday()">回到本月</button>
        </div>
      </div>
      <div class="calendar-wrap">
        <div class="calendar-grid">
          ${weekdayLabels.map((label) => `<div class="calendar-weekday">${label}</div>`).join("")}
          ${cellsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderAboutPage() {
  document.getElementById("about-content").innerHTML = `
    <div class="view-shell">
      <div class="view-head">
        <div>
          <h3>All About Me</h3>
          <p>About this place / 您找到了一个很好的藏身之处</p>
        </div>
      </div>
      <div class="about-story">
        <div class="about-card">
          <p>我不太会跟人说我喜欢什么，所以建了这个地方。</p>
        </div>
        <div class="about-card">
          <p>某天看了《刺猬的优雅》，荻里对荷妮说——您找到了一个很好的藏身之处。My Little shelter只是一个藏身之处，就像荷妮的那间门房。</p>
        </div>
      </div>
    </div>
  `;
}

function setQuoteWorkFilter(value) {
  quoteWorkFilter = value || "all";
  renderQuotesPage();
}

function shiftCalendarMonth(delta) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
  renderMoodCalendar();
}

function jumpCalendarToday() {
  calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  renderMoodCalendar();
}

function setVisibleView(viewId) {
  ["view-cards", "view-timeline", "view-stats", "view-quotes", "view-calendar", "view-about"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = id === viewId ? "block" : "none";
    }
  });
}

function renderActiveView() {
  renderSidebarStats();

  if (currentNav === "timeline") {
    setVisibleView("view-timeline");
    renderTimeline();
    return;
  }

  if (currentNav === "stats") {
    setVisibleView("view-stats");
    renderStats();
    return;
  }

  if (currentNav === "quotes") {
    setVisibleView("view-quotes");
    renderQuotesPage();
    return;
  }

  if (currentNav === "calendar") {
    setVisibleView("view-calendar");
    renderMoodCalendar();
    return;
  }

  if (currentNav === "about") {
    setVisibleView("view-about");
    renderAboutPage();
    return;
  }

  setVisibleView("view-cards");
  render();
}

function render() {
  renderFilterPills();
  renderSidebarStats();
  renderCards();
}

function setPill(key) {
  activePill = key;
  render();
}

function setNav(nav) {
  currentNav = nav;
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.remove("active"));
  document.getElementById(`nav-${nav}`)?.classList.add("active");

  const titles = {
    all: "Vous avez trouvé un très bon refuge",
    movie: "Slightly off",
    tv: "Episode After Episode",
    anime: "Elsewhere",
    documentary: "Observed",
    book: "underlined",
    want: "Just...Not yet",
    progress: "In Progress",
    done: "Collected",
    timeline: "原来那时候我在看这个",
    quotes: "Quoted",
    calendar: "WhatIt Did To Me？",
    stats: "小小的，我的",
    about: "About this place"
  };
  const subtitles = {
    all: "您找到了一个很好的藏身之处",
    movie: "现实轻微变形的两小时",
    tv: "怎么一集接一集的停不下来？",
    anime: "现实的物理规则在这里不适用，感谢",
    documentary: "所有的真实都值得被目击一次",
    book: "阅读过的字会留在我身体里，像某个血小板",
    want: "还没到那个晚上",
    progress: "还没结束，所以还不知道它会对我做什么",
    done: "这些构成了我理解世界的方式",
    timeline: "",
    quotes: "被某句话击中的瞬间，想留住它",
    calendar: "它对我做了一些我无法描述的事",
    stats: "",
    about: "您找到了一个很好的藏身之处"
  };

  document.getElementById("page-title").textContent = titles[nav] || "全部记录";
  document.getElementById("page-sub").textContent = subtitles[nav] || "";
  renderActiveView();
}

function renderStarPicker(score) {
  myScore = score;
  const container = document.getElementById("star-picker");
  container.innerHTML = "";

  for (let value = 1; value <= 10; value += 1) {
    const star = document.createElement("span");
    star.className = `sp${value <= roundedScore(score) ? " lit" : ""}`;
    star.textContent = "★";
    star.onclick = () => renderStarPicker(value);
    container.appendChild(star);
  }
}

function renderMoodPicker(selectedMood) {
  myMood = selectedMood || "";
  document.getElementById("mood-picker").innerHTML = MOODS
    .map((mood) => `<span class="mood-opt${myMood === mood.emoji ? " sel" : ""}" title="${escapeHtml(mood.label)}" onclick="selectMood('${mood.emoji}')">${mood.emoji}</span>`)
    .join("");
}

function selectMood(emoji) {
  myMood = myMood === emoji ? "" : emoji;
  renderMoodPicker(myMood);
}

function updateFormFields() {
  const status = document.getElementById("f-status").value;
  const type = document.getElementById("f-type").value;
  document.getElementById("remind-field").style.display = status === "want" ? "flex" : "none";
  document.getElementById("progress-field").style.display = type === "book" && status !== "want" ? "flex" : "none";
}

function resetForm() {
  editId = null;
  myScore = 0;
  myMood = "";
  document.getElementById("modal-add-title").textContent = "新增记录";
  ["f-douban", "f-title", "f-cover", "f-creator", "f-year", "f-dscore", "f-tags", "f-remind", "f-progress", "f-desc", "f-quick-note", "f-note"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = "";
    }
  });
  document.getElementById("f-type").value = "movie";
  document.getElementById("f-status").value = "want";
  document.getElementById("fetch-hint").textContent = "";
  document.getElementById("fetch-hint").className = "dhint";
  document.getElementById("fetch-btn").disabled = false;
  document.getElementById("fetch-btn").textContent = "自动填充";
  document.getElementById("save-btn").disabled = false;
  document.getElementById("save-btn").textContent = "保存记录";
  renderStarPicker(0);
  renderMoodPicker("");
  updateFormFields();
}

function openAdd() {
  resetForm();
  document.getElementById("modal-add").classList.add("open");
}

function openEdit(id) {
  const item = items.find((entry) => entry.id === String(id));
  if (!item) {
    return;
  }

  editId = item.id;
  myScore = item.myScore || 0;
  myMood = item.mood || "";
  document.getElementById("modal-add-title").textContent = "编辑记录";
  document.getElementById("f-douban").value = item.douban || "";
  document.getElementById("f-title").value = item.title || "";
  document.getElementById("f-cover").value = item.cover || "";
  document.getElementById("f-creator").value = item.creator || "";
  document.getElementById("f-year").value = item.year || "";
  document.getElementById("f-dscore").value = item.dscore || "";
  document.getElementById("f-type").value = item.type || "movie";
  document.getElementById("f-status").value = item.status || "want";
  document.getElementById("f-tags").value = item.tags.join(", ");
  document.getElementById("f-remind").value = item.remind || "";
  document.getElementById("f-progress").value = item.progress || "";
  document.getElementById("f-desc").value = item.desc || "";
  document.getElementById("f-quick-note").value = item.quickNote || "";
  document.getElementById("f-note").value = item.note || "";
  document.getElementById("fetch-hint").textContent = "";
  document.getElementById("fetch-hint").className = "dhint";
  document.getElementById("fetch-btn").disabled = false;
  document.getElementById("fetch-btn").textContent = "重新填充";
  document.getElementById("save-btn").disabled = false;
  document.getElementById("save-btn").textContent = "保存记录";
  renderStarPicker(myScore);
  renderMoodPicker(myMood);
  updateFormFields();
  document.getElementById("modal-add").classList.add("open");
}

async function fetchDouban() {
  const url = document.getElementById("f-douban").value.trim();
  const hint = document.getElementById("fetch-hint");
  const button = document.getElementById("fetch-btn");

  if (!url) {
    hint.textContent = "请先粘贴豆瓣链接";
    hint.className = "dhint err";
    return;
  }

  button.disabled = true;
  button.textContent = "识别中…";
  hint.textContent = "正在识别豆瓣内容…";
  hint.className = "dhint";

  try {
    const data = await requestJson(`/api/fetch-douban?url=${encodeURIComponent(url)}`);

    document.getElementById("f-douban").value = data.douban_url || data.source_url || url;
    document.getElementById("f-title").value = data.title || document.getElementById("f-title").value;
    document.getElementById("f-cover").value = data.cover_url || document.getElementById("f-cover").value;
    document.getElementById("f-creator").value = data.creator || document.getElementById("f-creator").value;
    document.getElementById("f-year").value = data.year || document.getElementById("f-year").value;
    document.getElementById("f-dscore").value = data.douban_rating || document.getElementById("f-dscore").value;
    document.getElementById("f-desc").value = data.summary || document.getElementById("f-desc").value;

    if (data.category) {
      document.getElementById("f-type").value = data.category;
    }

    if (Array.isArray(data.tags) && data.tags.length > 0) {
      document.getElementById("f-tags").value = data.tags.join(", ");
    }

    updateFormFields();
    hint.textContent = "✓ 填充完成，请检查后再保存";
    hint.className = "dhint ok";
  } catch (error) {
    hint.textContent = error.message || "自动填充失败，请稍后再试";
    hint.className = "dhint err";
  } finally {
    button.disabled = false;
    button.textContent = "自动填充";
  }
}

async function persistExistingItem(item) {
  const payload = buildApiPayloadFromItem(item);
  const result = await requestJson(`/api/items/${item.id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  return mapItemFromApi(result.item);
}

function replaceLocalItem(item) {
  items = items.map((entry) => entry.id === item.id ? item : entry);
}

async function saveItem() {
  const existingItem = editId ? items.find((item) => item.id === editId) : null;
  const payload = buildApiPayloadFromForm(existingItem);

  if (!payload.title) {
    window.alert("请填写标题");
    return;
  }

  const saveButton = document.getElementById("save-btn");
  saveButton.disabled = true;
  saveButton.textContent = "保存中…";

  try {
    if (editId) {
      await requestJson(`/api/items/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await requestJson("/api/items", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    closeOverlay("modal-add");
    await loadItems();
  } catch (error) {
    window.alert(error.message || "保存失败");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "保存记录";
  }
}

function openDetail(id) {
  const item = items.find((entry) => entry.id === String(id));
  if (!item) {
    return;
  }

  const tagsHtml = item.tags
    .map((tag) => `<span class="tag ${tagColor(tag)}" style="font-size:12px;padding:3px 10px">${escapeHtml(tag)}</span>`)
    .join("");
  const quotesHtml = item.quotes.length > 0
    ? item.quotes.map((quote, index) => `<div class="quote-item"><div class="quote-text">"${escapeHtml(quote)}"</div><button class="quote-del" onclick="delQuote('${item.id}',${index})">✕</button></div>`).join("")
    : '<div style="font-size:13px;color:var(--ink4)">还没有摘录</div>';
  const rewatchesHtml = item.rewatches.length > 0
    ? item.rewatches.map((rewatch) => `<div class="rewatch-item"><div class="rewatch-date">${escapeHtml(rewatch.date || "")}</div><div class="rewatch-note">${escapeHtml(rewatch.note || "（无笔记）")}</div></div>`).join("")
    : '<div style="font-size:13px;color:var(--ink4)">还没有重看记录</div>';

  document.getElementById("panel-content").innerHTML = `
    ${item.cover
      ? `<img class="panel-cover" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;panel-cover-ph&quot;>${categoryEmoji(item.type)}</div>'" />`
      : `<div class="panel-cover-ph">${categoryEmoji(item.type)}</div>`}
    <div class="panel-title">${escapeHtml(item.title)}${item.mood ? ` <span style="font-size:20px">${escapeHtml(item.mood)}</span>` : ""}</div>
    <div class="panel-meta">
      ${item.creator ? `<span class="meta-pill">${escapeHtml(item.creator)}</span>` : ""}
      ${item.year ? `<span class="meta-pill">${escapeHtml(item.year)}</span>` : ""}
      ${item.dscore ? `<span class="meta-pill">豆瓣 ${escapeHtml(item.dscore)}</span>` : ""}
      <span class="meta-pill s-${item.status}">${statusLabel(item.status, item.type)}</span>
    </div>
    ${tagsHtml ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1rem">${tagsHtml}</div>` : ""}
    ${item.remind && item.status === "want" ? `<div class="remind-info" style="margin-bottom:1rem">🔔 提醒日期：${escapeHtml(item.remind)}${isOverdue(item.remind) ? " · <strong>已过期</strong>" : ""}</div>` : ""}
    ${item.myScore ? `<div class="panel-section"><div class="panel-section-title">我的评分</div><div style="display:flex;align-items:baseline;gap:8px"><span class="score-big">${escapeHtml(formatScore(item.myScore))}</span><span style="font-size:12px;color:var(--ink4)">/ 10 · ${"★".repeat(roundedScore(item.myScore))}</span></div></div>` : ""}
    ${item.desc ? `<div class="panel-section"><div class="panel-section-title">简介</div><div class="panel-text">${escapeHtml(item.desc)}</div></div>` : ""}
    ${item.quickNote ? `<div class="panel-section"><div class="panel-section-title">随手记</div><div class="panel-text" style="background:#fff;padding:1rem;border-radius:var(--rsm);border:1px solid var(--border)">${escapeHtml(item.quickNote)}</div></div>` : ""}
    ${item.note ? `<div class="panel-section"><div class="panel-section-title">观后感 / 读后感</div><div class="panel-text" style="background:#fff;padding:1rem;border-radius:var(--rsm);border:1px solid var(--border)">${escapeHtml(item.note)}</div></div>` : ""}
    ${item.progress ? `<div class="panel-section"><div class="panel-section-title">阅读进度</div><div class="panel-text">${escapeHtml(item.progress)}</div></div>` : ""}
    <div class="panel-section">
      <div class="panel-section-title">💬 金句摘录</div>
      <div id="pd-quotes">${quotesHtml}</div>
      <div class="add-item-row" style="margin-top:6px">
        <input type="text" id="new-quote-input" placeholder="输入摘录的句子…" onkeydown="if(event.key==='Enter')addQuote('${item.id}')" />
        <button onclick="addQuote('${item.id}')">添加</button>
      </div>
    </div>
    ${item.status === "done" ? `<div class="panel-section"><div class="panel-section-title">🔁 重看记录 <button class="btn btn-ghost btn-sm" onclick="openRewatch('${item.id}')">＋ 添加</button></div><div id="pd-rewatches">${rewatchesHtml}</div></div>` : ""}
    <div class="panel-actions">
      <button class="btn btn-outline" style="flex:1" onclick="openEdit('${item.id}');closeOverlay('panel-overlay')">编辑</button>
      <button class="btn btn-ghost" style="color:var(--red-t)" onclick="deleteItem('${item.id}')">删除</button>
    </div>
  `;

  document.getElementById("panel-overlay").classList.add("open");
}

async function addQuote(id) {
  const input = document.getElementById("new-quote-input");
  const text = input.value.trim();
  if (!text) {
    return;
  }

  const item = items.find((entry) => entry.id === String(id));
  if (!item) {
    return;
  }

  const nextItem = {
    ...item,
    quotes: [...item.quotes, text]
  };

  try {
    const savedItem = await persistExistingItem(nextItem);
    replaceLocalItem(savedItem);
    input.value = "";
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "保存摘录失败");
  }
}

async function delQuote(id, index) {
  const item = items.find((entry) => entry.id === String(id));
  if (!item) {
    return;
  }

  const nextQuotes = item.quotes.filter((_, quoteIndex) => quoteIndex !== index);

  try {
    const savedItem = await persistExistingItem({
      ...item,
      quotes: nextQuotes
    });
    replaceLocalItem(savedItem);
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "删除摘录失败");
  }
}

function openRewatch(id) {
  rewatchTargetId = id;
  document.getElementById("rw-date").value = today();
  document.getElementById("rw-note").value = "";
  document.getElementById("modal-rewatch").classList.add("open");
}

async function saveRewatch() {
  if (!rewatchTargetId) {
    return;
  }

  const item = items.find((entry) => entry.id === String(rewatchTargetId));
  if (!item) {
    return;
  }

  const nextItem = {
    ...item,
    rewatches: [
      ...item.rewatches,
      {
        date: document.getElementById("rw-date").value || today(),
        note: document.getElementById("rw-note").value.trim()
      }
    ]
  };

  try {
    const savedItem = await persistExistingItem(nextItem);
    replaceLocalItem(savedItem);
    closeOverlay("modal-rewatch");
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "保存重看记录失败");
  }
}

async function deleteItem(id) {
  if (!window.confirm("确认删除这条记录？")) {
    return;
  }

  try {
    await requestJson(`/api/items/${id}`, {
      method: "DELETE"
    });
    closeOverlay("panel-overlay");
    await loadItems();
  } catch (error) {
    window.alert(error.message || "删除失败");
  }
}

function openExport() {
  const doneCount = items.filter((item) => item.status === "done").length;
  const quotesCount = items.reduce((sum, item) => sum + item.quotes.length, 0);
  document.getElementById("export-preview").innerHTML = `📦 共 ${items.length} 条记录 · 已完成 ${doneCount} 条 · ${quotesCount} 条金句摘录<br><span style="color:var(--ink4)">文件名：mediashelf_${today()}.json</span>`;
  document.getElementById("modal-export").classList.add("open");
}

function doExport() {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `mediashelf_${today()}.json`;
  link.click();
  closeOverlay("modal-export");
}

function openImport() {
  document.getElementById("import-file").value = "";
  document.getElementById("import-msg").textContent = "";
  document.getElementById("modal-import").classList.add("open");
}

async function doImport() {
  const file = document.getElementById("import-file").files[0];
  const message = document.getElementById("import-msg");

  if (!file) {
    message.textContent = "请先选择文件";
    return;
  }

  try {
    const rawText = await file.text();
    const parsedItems = JSON.parse(rawText);
    if (!Array.isArray(parsedItems)) {
      throw new Error("导入文件格式错误");
    }

    await requestJson("/api/items/import", {
      method: "POST",
      body: JSON.stringify({
        items: parsedItems
      })
    });

    message.textContent = "";
    closeOverlay("modal-import");
    await loadItems();
  } catch (error) {
    message.textContent = error.message || "导入失败，请检查文件格式";
  }
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove("open");
}

function bgClose(event, id) {
  if (event.target === document.getElementById(id)) {
    closeOverlay(id);
  }
}

async function loadItems() {
  try {
    const payload = await requestJson("/api/items");
    items = Array.isArray(payload.items) ? payload.items.map(mapItemFromApi) : [];
    renderActiveView();
  } catch (error) {
    console.error("Failed to load items:", error);
    document.getElementById("cards-grid").innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <div class="empty-text">加载失败</div>
        <div class="empty-sub">${escapeHtml(error.message || "请检查后端接口")}</div>
      </div>
    `;
  }
}

document.getElementById("f-status").addEventListener("change", updateFormFields);
document.getElementById("f-type").addEventListener("change", updateFormFields);

loadItems();

window.setNav = setNav;
window.setPill = setPill;
window.openAdd = openAdd;
window.openEdit = openEdit;
window.fetchDouban = fetchDouban;
window.saveItem = saveItem;
window.openDetail = openDetail;
window.deleteItem = deleteItem;
window.openExport = openExport;
window.doExport = doExport;
window.openImport = openImport;
window.doImport = doImport;
window.openRewatch = openRewatch;
window.saveRewatch = saveRewatch;
window.addQuote = addQuote;
window.delQuote = delQuote;
window.selectMood = selectMood;
window.setQuoteWorkFilter = setQuoteWorkFilter;
window.shiftCalendarMonth = shiftCalendarMonth;
window.jumpCalendarToday = jumpCalendarToday;
window.closeOverlay = closeOverlay;
window.bgClose = bgClose;
window.render = render;
