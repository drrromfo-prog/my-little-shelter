let items = [];
let myScore = 0;
let myMood = "";
let editId = null;
let currentNav = "all";
let activePill = "type-all";
let viewMode = "card";
let adminState = {
  authenticated: false,
  configured: false
};
let mobileNavOpen = false;
let rewatchTargetId = null;
let quoteWorkFilter = "all";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let advancedFiltersExpanded = false;

const advancedFilters = {
  ratingMin: "",
  tags: "",
  year: "",
  type: "all",
  status: "all"
};

const MIN_SHOWCASE_ITEMS = 14;
const DEFAULT_ACCENT = "#b8ab9b";
const AMBIENT_FALLBACK = ["#cfc2b1", "#ece2d4"];

const MOODS = [
  { emoji: "😊", label: "开心" },
  { emoji: "🥹", label: "感动" },
  { emoji: "🤯", label: "烧脑" },
  { emoji: "😢", label: "难过" },
  { emoji: "😌", label: "治愈" },
  { emoji: "😰", label: "紧张" },
  { emoji: "😂", label: "好笑" },
  { emoji: "🤔", label: "回想很久" },
  { emoji: "😴", label: "昏昏欲睡" },
  { emoji: "🥰", label: "喜欢" }
];

const TAG_COLORS = ["tc0", "tc1", "tc2", "tc3", "tc4", "tc5"];

const CATEGORY_META = {
  movie: { label: "电影", icon: "◎", defaultAccent: "#9d7a65" },
  tv: { label: "电视剧", icon: "▤", defaultAccent: "#6f7d97" },
  anime: { label: "动漫", icon: "◈", defaultAccent: "#9b82aa" },
  documentary: { label: "纪录片", icon: "△", defaultAccent: "#7d8d76" },
  book: { label: "书籍", icon: "◻", defaultAccent: "#b48f63" }
};

const CATEGORY_FILTER_ORDER = ["movie", "tv", "anime", "documentary", "book"];

const PAGE_COPY = {
  all: {
    title: "Vous avez trouvé un très bon refuge",
    subtitle: "您找到了一个很好的藏身之处"
  },
  movie: {
    title: "Slightly off",
    subtitle: "现实轻微变形的两小时"
  },
  tv: {
    title: "Episode After Episode",
    subtitle: "怎么一集接一集地停不下来？"
  },
  anime: {
    title: "Elsewhere",
    subtitle: "现实的物理规则在这里不适用，感谢"
  },
  documentary: {
    title: "Observed",
    subtitle: "所有的真实都值得被目击一次"
  },
  book: {
    title: "Underlined",
    subtitle: "读过的字会留在我身体里，像某个血小板"
  },
  want: {
    title: "Just...Not yet",
    subtitle: "还没到那个晚上"
  },
  progress: {
    title: "In Progress",
    subtitle: "还没结束，所以还不知道它会对我做什么"
  },
  done: {
    title: "Collected",
    subtitle: "这些构成了我理解世界的方式"
  },
  quotes: {
    title: "Quoted",
    subtitle: "被某句话击中的瞬间，想留住它"
  },
  calendar: {
    title: "What It Did To Me?",
    subtitle: "它对我做了一些我无法描述的事。"
  },
  wall: {
    title: "The Wall",
    subtitle: "所有的它们，在这里"
  },
  stats: {
    title: "小小的，我的",
    subtitle: "不是宏大统计，更像一间会呼吸的私人档案室。"
  },
};

const VIEW_MODE_STORAGE_KEY = "mls:view-mode";

const SHOWCASE_ITEMS = [
  {
    id: "mock-movie-dune-2",
    title: "沙丘：第二部",
    type: "movie",
    creator: "Denis Villeneuve",
    year: "2024",
    rating: 9.2,
    dscore: "8.8",
    tags: ["史诗", "沙漠预言", "二刷推荐", "宿命"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-dune/420/620",
    accentColor: "#b38c64",
    quickNote: "像被一股缓慢而坚定的风推着往前走。",
    note: "声音设计和沙漠质感几乎把整个人包裹住，像在看一场注定要发生的神话。",
    mood: "🤯",
    favorite: true,
    revisit: true,
    rewatches: [{ date: "2026-02-04", note: "二刷时反而更在意角色的犹豫。" }],
    quotes: ["权力最先改变的，永远是被相信的人。"],
    addedAt: Date.parse("2026-04-17T09:20:00Z"),
    isMock: true
  },
  {
    id: "mock-tv-fleabag",
    title: "伦敦生活 第二季",
    type: "tv",
    creator: "Phoebe Waller-Bridge",
    year: "2019",
    rating: 9.4,
    dscore: "9.5",
    tags: ["亲密关系", "黑色幽默", "台词锋利"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-fleabag/420/620",
    accentColor: "#7d6c79",
    quickNote: "笑着笑着突然被掐住喉咙。",
    note: "它厉害的地方在于，嘴上看起来都像玩笑，但每一句都在逼人承认自己的孤独。",
    mood: "🥹",
    favorite: true,
    quotes: ["People are all we've got."],
    addedAt: Date.parse("2026-04-16T18:05:00Z"),
    isMock: true
  },
  {
    id: "mock-anime-frieren",
    title: "葬送的芙莉莲",
    type: "anime",
    creator: "斋藤圭一郎",
    year: "2023",
    rating: 9.1,
    dscore: "9.4",
    tags: ["旅途", "温柔的时间", "魔法", "余味很长"],
    status: "progress",
    cover: "https://picsum.photos/seed/shelter-frieren/420/620",
    accentColor: "#809c93",
    progress: "正在看到 18 / 28",
    quickNote: "它不是要你哭，只是慢慢让你意识到时间真的会带走很多东西。",
    mood: "😌",
    notesCount: 3,
    addedAt: Date.parse("2026-04-15T07:30:00Z"),
    isMock: true
  },
  {
    id: "mock-book-elegance",
    title: "刺猬的优雅",
    type: "book",
    creator: "Muriel Barbery",
    year: "2006",
    rating: 8.9,
    dscore: "8.3",
    tags: ["藏身之处", "法式敏感", "轻轻刺痛"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-elegance/420/620",
    accentColor: "#9c7e68",
    quickNote: "有些句子像偷偷把一盏灯放到你手心里。",
    note: "它提醒我，安静并不代表贫瘠，躲藏也可能是一种精细的生存。",
    mood: "🥰",
    quotes: ["您找到了一个很好的藏身之处。"],
    addedAt: Date.parse("2026-04-14T14:48:00Z"),
    isMock: true
  },
  {
    id: "mock-doc-free-solo",
    title: "徒手攀岩",
    type: "documentary",
    creator: "伊丽莎白·柴·瓦沙瑞莉 / 金国威",
    year: "2018",
    rating: 8.7,
    dscore: "8.9",
    tags: ["极限", "身体边界", "真实惊险"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-freesolo/420/620",
    accentColor: "#7a8f8e",
    quickNote: "真相因为无配乐的岩壁，反而显得更惊人。",
    mood: "😰",
    addedAt: Date.parse("2026-04-13T12:12:00Z"),
    isMock: true
  },
  {
    id: "mock-tv-westworld",
    title: "西部世界 第二季",
    type: "tv",
    creator: "Lisa Joy / Jonathan Nolan",
    year: "2018",
    rating: 8.4,
    dscore: "8.9",
    tags: ["意识", "迷宫", "赛博荒野", "重构记忆"],
    status: "progress",
    cover: "https://picsum.photos/seed/shelter-westworld/420/620",
    accentColor: "#8b6c61",
    progress: "正在追到 S2 E5",
    quickNote: "每次以为看懂了，它就再往下挖一层。",
    mood: "🤔",
    notesCount: 2,
    addedAt: Date.parse("2026-04-12T20:10:00Z"),
    isMock: true
  },
  {
    id: "mock-book-three-body",
    title: "三体",
    type: "book",
    creator: "刘慈欣",
    year: "2006",
    rating: 9.0,
    dscore: "8.9",
    tags: ["科幻", "宇宙尺度", "文明焦虑", "页页好看"],
    status: "progress",
    cover: "https://picsum.photos/seed/shelter-threebody/420/620",
    accentColor: "#7a8eb0",
    progress: "已读到 45%",
    quickNote: "每翻几页就会被世界观的体积撞一下。",
    mood: "🤯",
    favorite: true,
    addedAt: Date.parse("2026-04-11T11:30:00Z"),
    isMock: true
  },
  {
    id: "mock-anime-ghost",
    title: "攻壳机动队",
    type: "anime",
    creator: "押井守",
    year: "1995",
    rating: 8.8,
    dscore: "9.1",
    tags: ["赛博朋克", "身份", "冷光", "意识流"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-ghost/420/620",
    accentColor: "#6d8097",
    quickNote: "冷得发亮，但里面其实是非常柔软的人类问题。",
    mood: "🤔",
    revisit: true,
    rewatches: [{ date: "2026-03-09", note: "每次重看都更能理解它的沉默。" }],
    addedAt: Date.parse("2026-04-09T16:10:00Z"),
    isMock: true
  },
  {
    id: "mock-movie-in-the-mood",
    title: "花样年华",
    type: "movie",
    creator: "王家卫",
    year: "2000",
    rating: 9.3,
    dscore: "8.8",
    tags: ["克制", "留白", "走廊", "再看会更痛"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-moodlove/420/620",
    accentColor: "#a86f60",
    quickNote: "什么都没有说透，但什么都已经发生过了。",
    mood: "🥹",
    favorite: true,
    quotes: ["如果多一张船票，你会不会跟我一起走？"],
    addedAt: Date.parse("2026-04-08T10:06:00Z"),
    isMock: true
  },
  {
    id: "mock-doc-jiro",
    title: "寿司之神",
    type: "documentary",
    creator: "David Gelb",
    year: "2011",
    rating: 8.2,
    dscore: "8.7",
    tags: ["手艺", "专注", "秩序"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-jiro/420/620",
    accentColor: "#b08c65",
    quickNote: "真正的重复并不机械，它会慢慢长出审美。",
    mood: "😌",
    addedAt: Date.parse("2026-04-06T08:20:00Z"),
    isMock: true
  },
  {
    id: "mock-book-sea",
    title: "海边的卡夫卡",
    type: "book",
    creator: "村上春树",
    year: "2002",
    rating: 8.1,
    dscore: "8.4",
    tags: ["梦境", "少年逃亡", "平行入口"],
    status: "want",
    cover: "https://picsum.photos/seed/shelter-kafka/420/620",
    accentColor: "#7d7666",
    remind: "2026-04-26",
    quickNote: "想留到某个适合下雨的夜里再开始。",
    addedAt: Date.parse("2026-04-05T19:40:00Z"),
    isMock: true
  },
  {
    id: "mock-tv-bebop",
    title: "星际牛仔",
    type: "anime",
    creator: "渡边信一郎",
    year: "1998",
    rating: 9.0,
    dscore: "9.6",
    tags: ["太空孤独", "爵士", "酷到伤心"],
    status: "want",
    cover: "https://picsum.photos/seed/shelter-bebop/420/620",
    accentColor: "#8f6f56",
    remind: "2026-05-02",
    quickNote: "知道自己一定会喜欢，所以反而舍不得开始。",
    addedAt: Date.parse("2026-04-04T15:00:00Z"),
    isMock: true
  },
  {
    id: "mock-movie-her",
    title: "Her",
    type: "movie",
    creator: "Spike Jonze",
    year: "2013",
    rating: 8.6,
    dscore: "8.4",
    tags: ["城市孤独", "亲密关系", "未来温度"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-her/420/620",
    accentColor: "#c28476",
    quickNote: "暖色系的寂寞最容易钻进骨头里。",
    mood: "😢",
    addedAt: Date.parse("2026-04-03T18:40:00Z"),
    isMock: true
  },
  {
    id: "mock-book-kokoro",
    title: "心",
    type: "book",
    creator: "夏目漱石",
    year: "1914",
    rating: 8.5,
    dscore: "8.8",
    tags: ["近代孤独", "告白", "日式阴影"],
    status: "done",
    cover: "https://picsum.photos/seed/shelter-kokoro/420/620",
    accentColor: "#8d776a",
    quickNote: "旧小说的锋利往往藏在最平静的句子里。",
    mood: "🤔",
    addedAt: Date.parse("2026-04-02T09:20:00Z"),
    isMock: true
  },
  {
    id: "mock-doc-cosmos",
    title: "宇宙时空之旅",
    type: "documentary",
    creator: "Neil deGrasse Tyson",
    year: "2014",
    rating: 8.9,
    dscore: "9.3",
    tags: ["宇宙", "敬畏", "知识的温柔"],
    status: "want",
    cover: "https://picsum.photos/seed/shelter-cosmos/420/620",
    accentColor: "#6d82a8",
    remind: "2026-05-09",
    quickNote: "想在脑袋比较干净的时候打开它。",
    addedAt: Date.parse("2026-04-01T14:22:00Z"),
    isMock: true
  }
].map((item) => ({
  ...item,
  isMock: true
}));

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function requestJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    credentials: "same-origin",
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
    const parsed = new URL(String(value), window.location.origin);
    if (parsed.pathname === "/api/image-proxy") {
      return parsed.pathname + parsed.search;
    }
    if (parsed.hostname.endsWith("doubanio.com") || parsed.hostname.endsWith("douban.com")) {
      return `/api/image-proxy?url=${encodeURIComponent(parsed.toString())}`;
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

function createItemModel(raw) {
  const quotes = parseQuotes(raw.quotes);
  const rewatches = parseRewatches(raw.rewatches);
  const tags = parseTags(raw.tags);
  const rating = Number(raw.rating ?? raw.myScore ?? raw.my_rating ?? 0) || 0;
  const quickNote = raw.quickNote ?? raw.quick_note ?? "";
  const note = raw.note ?? "";

  return {
    id: String(raw.id),
    type: raw.type || raw.category || "movie",
    douban: raw.douban || raw.douban_url || "",
    title: raw.title || "",
    cover: proxyCoverUrl(raw.cover || raw.cover_url || ""),
    creator: raw.creator || "",
    year: raw.year ? String(raw.year) : "",
    dscore: String(raw.dscore ?? raw.douban_rating ?? "").trim(),
    status: raw.status || "want",
    myScore: rating,
    rating,
    mood: raw.mood || "",
    tags,
    accentColor: raw.accentColor || "",
    remind: raw.remind || raw.remind_date || "",
    progress: raw.progress || "",
    quickNote,
    desc: raw.desc || raw.summary || "",
    note,
    quotes,
    rewatches,
    favorite: Boolean(raw.favorite),
    revisit: Boolean(raw.revisit) || rewatches.length > 0,
    notesCount: Number(raw.notesCount ?? 0) || (quickNote ? 1 : 0) + (note ? 1 : 0) + quotes.length,
    addedAt: typeof raw.addedAt === "number"
      ? raw.addedAt
      : Date.parse(raw.addedAt || raw.created_at || "") || Date.now(),
    isMock: Boolean(raw.isMock)
  };
}

function mapItemFromApi(item) {
  return createItemModel({
    id: item.id,
    type: item.category || "movie",
    douban: item.douban_url || "",
    title: item.title || "",
    cover: item.cover_url || "",
    creator: item.creator || "",
    year: item.year || "",
    dscore: item.douban_rating || "",
    status: mapStatusFromApi(item.status),
    rating: item.my_rating,
    mood: item.mood || "",
    tags: item.tags,
    remind: item.remind_date || "",
    progress: item.progress || "",
    quickNote: item.quick_note || "",
    desc: item.summary || "",
    note: item.note || "",
    quotes: item.quotes || item.quotes_json,
    rewatches: item.rewatches || item.rewatches_json,
    addedAt: Date.parse(item.created_at || "") || Date.now()
  });
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
    return type === "book" ? "待读" : "待看";
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
  return CATEGORY_META[type]?.icon || "✦";
}

function categoryLabel(type) {
  return CATEGORY_META[type]?.label || "电影";
}

function typeSymbol(type) {
  return CATEGORY_META[type]?.icon || "✦";
}

function formatScore(score) {
  if (!score) {
    return "";
  }
  return Number(score).toFixed(1).replace(/\.0$/, "");
}

function roundedScore(score) {
  return Math.max(0, Math.min(10, Math.round(Number(score) || 0)));
}

function formatRatingLabel(score) {
  if (!score) {
    return "";
  }
  return `⭐ ${formatScore(score)} / 10`;
}

function hexToRgb(hex) {
  const clean = String(hex || "").replace("#", "").trim();
  if (!clean) {
    return null;
  }

  const full = clean.length === 3
    ? clean.split("").map((chunk) => chunk + chunk).join("")
    : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return null;
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  };
}

function rgbPair(rgb) {
  if (!rgb) {
    return {
      base: DEFAULT_ACCENT,
      rgb: "187, 176, 161",
      deep: "113, 103, 92"
    };
  }

  return {
    rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    deep: `${Math.max(0, rgb.r - 58)}, ${Math.max(0, rgb.g - 58)}, ${Math.max(0, rgb.b - 58)}`
  };
}

function getAccentFromItem(item) {
  const accent = item.accentColor || CATEGORY_META[item.type]?.defaultAccent || DEFAULT_ACCENT;
  return hexToRgb(accent);
}

function getRealItemById(id) {
  return items.find((item) => item.id === String(id)) || null;
}

function getShelfItems() {
  if (items.length >= MIN_SHOWCASE_ITEMS) {
    return items;
  }

  const seen = new Set(items.map((item) => `${item.type}::${item.title}`.toLowerCase()));
  const merged = [...items];

  for (const showcase of SHOWCASE_ITEMS.map(createItemModel)) {
    const key = `${showcase.type}::${showcase.title}`.toLowerCase();
    if (!seen.has(key)) {
      merged.push(showcase);
      seen.add(key);
    }
    if (merged.length >= MIN_SHOWCASE_ITEMS) {
      break;
    }
  }

  return merged.sort((left, right) => right.addedAt - left.addedAt);
}

function syncAdvancedFiltersFromControls() {
  advancedFilters.ratingMin = document.getElementById("filter-rating")?.value || "";
  advancedFilters.tags = document.getElementById("filter-tags")?.value.trim() || "";
  advancedFilters.year = document.getElementById("filter-year")?.value.trim() || "";
  advancedFilters.type = document.getElementById("filter-type")?.value || "all";
  advancedFilters.status = document.getElementById("filter-status")?.value || "all";
}

function hasAdvancedFilters() {
  return Boolean(
    advancedFilters.ratingMin
    || advancedFilters.tags
    || advancedFilters.year
    || advancedFilters.type !== "all"
    || advancedFilters.status !== "all"
  );
}

function toggleAdvancedFilters(forceValue) {
  advancedFiltersExpanded = typeof forceValue === "boolean" ? forceValue : !advancedFiltersExpanded;
  const panel = document.getElementById("advanced-filters");
  const button = document.getElementById("more-filters-btn");
  if (panel) {
    panel.hidden = !advancedFiltersExpanded;
  }
  if (button) {
    button.textContent = advancedFiltersExpanded ? "Hide Filters" : "More Filters";
  }
}

function clearAdvancedFilters() {
  document.getElementById("filter-rating").value = "";
  document.getElementById("filter-tags").value = "";
  document.getElementById("filter-year").value = "";
  document.getElementById("filter-type").value = "all";
  document.getElementById("filter-status").value = "all";
  syncAdvancedFiltersFromControls();
  render();
}

function renderFilterPills() {
  const container = document.getElementById("filter-pills");
  if (!container) {
    return;
  }

  const activeCategory = CATEGORY_META[currentNav]
    ? currentNav
    : (activePill.startsWith("type-") ? activePill.slice(5) : "all");

  const pills = [
    { key: "all", label: "全部" },
    ...CATEGORY_FILTER_ORDER.map((category) => ({
      key: category,
      label: `${CATEGORY_META[category].icon} ${CATEGORY_META[category].label}`
    }))
  ];

  container.innerHTML = pills
    .map((pill) => `<button class="pill${activeCategory === pill.key ? " active" : ""}" onclick="setCategoryTab('${pill.key}')">${pill.label}</button>`)
    .join("");
}

function renderFilterSummary(filteredItems, sourceItems) {
  const parts = [];
  if (CATEGORY_META[currentNav]) {
    parts.push(`分类：${categoryLabel(currentNav)}`);
  } else if (currentNav === "want") {
    parts.push("状态：待看 / 待读");
  } else if (currentNav === "progress") {
    parts.push("状态：正在进行");
  } else if (currentNav === "done") {
    parts.push("状态：已完成");
  }

  if (hasAdvancedFilters()) {
    if (advancedFilters.ratingMin) {
      parts.push(`评分 ${advancedFilters.ratingMin}+`);
    }
    if (advancedFilters.tags) {
      parts.push(`标签 ${advancedFilters.tags}`);
    }
    if (advancedFilters.year) {
      parts.push(`年份 ${advancedFilters.year}`);
    }
    if (advancedFilters.type !== "all") {
      parts.push(`类型 ${categoryLabel(advancedFilters.type)}`);
    }
    if (advancedFilters.status !== "all") {
      parts.push(`状态 ${statusLabel(advancedFilters.status, advancedFilters.type === "book" ? "book" : "movie")}`);
    }
  }

  const summary = document.getElementById("filter-summary");
  if (summary) {
    summary.textContent = parts.length > 0
      ? `显示 ${filteredItems.length} / ${sourceItems.length} · ${parts.join(" · ")}`
      : `显示 ${filteredItems.length} / ${sourceItems.length} 条藏品`;
  }
}

function getFilteredItems() {
  syncAdvancedFiltersFromControls();

  const sourceItems = getShelfItems();
  let filtered = [...sourceItems];

  if (CATEGORY_META[currentNav]) {
    filtered = filtered.filter((item) => item.type === currentNav);
  } else if (currentNav === "want") {
    filtered = filtered.filter((item) => item.status === "want");
  } else if (currentNav === "progress") {
    filtered = filtered.filter((item) => item.status === "progress");
  } else if (currentNav === "done") {
    filtered = filtered.filter((item) => item.status === "done");
  } else if (currentNav === "all") {
    const activeCategory = activePill.startsWith("type-") ? activePill.slice(5) : "all";
    if (activeCategory !== "all" && CATEGORY_META[activeCategory]) {
      filtered = filtered.filter((item) => item.type === activeCategory);
    }
  }

  const searchValue = (document.getElementById("search-input")?.value || "").trim().toLowerCase();
  if (searchValue) {
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(searchValue)
      || item.creator.toLowerCase().includes(searchValue)
      || item.tags.some((tag) => tag.toLowerCase().includes(searchValue))
      || item.quickNote.toLowerCase().includes(searchValue)
      || item.note.toLowerCase().includes(searchValue)
    );
  }

  if (advancedFilters.ratingMin) {
    const ratingThreshold = Number(advancedFilters.ratingMin) || 0;
    filtered = filtered.filter((item) => Number(item.rating) >= ratingThreshold);
  }

  if (advancedFilters.tags) {
    const tagQuery = advancedFilters.tags.toLowerCase();
    filtered = filtered.filter((item) =>
      item.tags.some((tag) => tag.toLowerCase().includes(tagQuery))
    );
  }

  if (advancedFilters.year) {
    filtered = filtered.filter((item) => String(item.year || "").includes(advancedFilters.year));
  }

  if (advancedFilters.type !== "all") {
    filtered = filtered.filter((item) => item.type === advancedFilters.type);
  }

  if (advancedFilters.status !== "all") {
    filtered = filtered.filter((item) => item.status === advancedFilters.status);
  }

  const sortValue = document.getElementById("sort-select")?.value || "date";
  if (sortValue === "score") {
    filtered.sort((left, right) => (Number(right.rating) || 0) - (Number(left.rating) || 0));
  } else if (sortValue === "dscore") {
    filtered.sort((left, right) => (Number(right.dscore) || 0) - (Number(left.dscore) || 0));
  } else if (sortValue === "title") {
    filtered.sort((left, right) => left.title.localeCompare(right.title, "zh-CN"));
  } else {
    filtered.sort((left, right) => right.addedAt - left.addedAt);
  }

  return {
    filtered,
    source: sourceItems
  };
}

function setCardAccent(card, rgb) {
  const pair = rgbPair(rgb);
  card.style.setProperty("--accent-rgb", pair.rgb);
  card.style.setProperty("--accent-deep", pair.deep);
}

function updateAmbientBackground(filteredItems) {
  const root = document.documentElement;
  const primary = getAccentFromItem(filteredItems[0]) || hexToRgb(AMBIENT_FALLBACK[0]);
  const secondary = getAccentFromItem(filteredItems[1]) || hexToRgb(AMBIENT_FALLBACK[1]);
  const primaryPair = rgbPair(primary);
  const secondaryPair = rgbPair(secondary);
  root.style.setProperty("--ambient-rgb", primaryPair.rgb);
  root.style.setProperty("--ambient-rgb-2", secondaryPair.rgb);
}

function applyFallbackAccents(filteredItems) {
  document.querySelectorAll(".card").forEach((card, index) => {
    setCardAccent(card, getAccentFromItem(filteredItems[index]));
  });
}

function applyDynamicColors() {
  if (typeof ColorThief === "undefined") {
    return;
  }

  const thief = new ColorThief();
  let ambientApplied = false;

  document.querySelectorAll(".card img").forEach((img, index) => {
    const apply = () => {
      try {
        const [r, g, b] = thief.getColor(img);
        const card = img.closest(".card");
        if (!card) {
          return;
        }

        setCardAccent(card, { r, g, b });

        if (!ambientApplied && index < 2) {
          document.documentElement.style.setProperty("--ambient-rgb", `${r}, ${g}, ${b}`);
          ambientApplied = true;
        }
      } catch (error) {
        // Keep fallback accent colors when image extraction is not available.
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      apply();
    } else {
      img.addEventListener("load", apply, { once: true });
    }
  });
}

function normalizeViewMode(mode) {
  if (mode === "grid") {
    return "card";
  }
  if (mode === "card" || mode === "wall" || mode === "list") {
    return mode;
  }
  return "card";
}

function getStoredViewMode() {
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored ? normalizeViewMode(stored) : "";
  } catch (error) {
    return "";
  }
}

function getDefaultViewMode() {
  return isAdminMode() ? (getStoredViewMode() || "card") : "wall";
}

function updateViewModeButtons() {
  document.getElementById("view-card-btn")?.classList.toggle("is-active", viewMode === "card");
  document.getElementById("view-wall-btn")?.classList.toggle("is-active", viewMode === "wall");
  document.getElementById("view-list-btn")?.classList.toggle("is-active", viewMode === "list");
}

function syncViewModeForRole() {
  viewMode = getDefaultViewMode();
  updateViewModeButtons();
}

function setViewMode(mode, options = {}) {
  const normalized = normalizeViewMode(mode);
  const nextNav = currentNav === "wall" && normalized !== "wall" ? "all" : currentNav;
  viewMode = normalized;

  if (isAdminMode()) {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, normalized);
    } catch (error) {
      // ignore storage failures
    }
  }

  updateViewModeButtons();

  if (options.silent) {
    return;
  }

  if (nextNav !== currentNav) {
    setNav(nextNav);
    return;
  }

  renderActiveView();
}

function setView(mode) {
  setViewMode(mode);
}

function renderSidebarStats() {
  const shelfItems = getShelfItems();
  const doneItems = shelfItems.filter((item) => item.status === "done");
  const wantItems = shelfItems.filter((item) => item.status === "want");
  const progressItems = shelfItems.filter((item) => item.status === "progress");
  const scoredItems = shelfItems.filter((item) => Number(item.rating) > 0);
  const averageScore = scoredItems.length > 0
    ? (scoredItems.reduce((sum, item) => sum + Number(item.rating || 0), 0) / scoredItems.length).toFixed(1)
    : "—";
  const reminders = wantItems.filter((item) => item.remind).length;
  const recentItems = [...shelfItems].sort((left, right) => right.addedAt - left.addedAt).slice(0, 3);

  const currentlyHtml = progressItems.length > 0 ? `
    <div class="mini-module">
      <div class="sms-title">Currently Doing</div>
      <div class="mini-list">
        ${progressItems.slice(0, 3).map((item) => `
          <div class="mini-item" onclick="openDetail('${item.id}')">
            <span class="mini-item-icon">${categoryEmoji(item.type)}</span>
            <div class="mini-item-copy">
              <div class="mini-item-title">${escapeHtml(item.title)}</div>
              <div class="mini-item-meta">${escapeHtml(item.progress || statusLabel(item.status, item.type))}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  ` : "";

  const recentHtml = recentItems.length > 0 ? `
    <div class="mini-module">
      <div class="sms-title">Recent Activity</div>
      <div class="mini-list">
        ${recentItems.map((item) => `
          <div class="mini-item" onclick="openDetail('${item.id}')">
            <span class="mini-item-icon">${categoryEmoji(item.type)}</span>
            <div class="mini-item-copy">
              <div class="mini-item-title">${escapeHtml(item.title)}</div>
              <div class="mini-item-meta">${escapeHtml(item.quickNote || item.note || statusLabel(item.status, item.type))}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  ` : "";

  document.getElementById("sidebar-mini-stats").innerHTML = `
    <div class="mini-module">
      <div class="sms-title">My Stats</div>
      <div class="sms-row"><span class="sms-label">藏品总数</span><span class="sms-val">${shelfItems.length}</span></div>
      <div class="sms-row"><span class="sms-label">已完成</span><span class="sms-val">${doneItems.length}</span></div>
      <div class="sms-row"><span class="sms-label">待看 / 待读</span><span class="sms-val">${wantItems.length}</span></div>
      <div class="sms-row"><span class="sms-label">正在进行</span><span class="sms-val">${progressItems.length}</span></div>
      <div class="sms-row"><span class="sms-label">平均评分</span><span class="sms-val">${averageScore}</span></div>
      ${reminders ? `<div class="sms-row"><span class="sms-label">提醒事项</span><span class="sms-val">${reminders}</span></div>` : ""}
    </div>
    ${currentlyHtml}
    ${recentHtml}
  `;
}

function renderCards() {
  const container = document.getElementById("cards-grid");
  const { filtered, source } = getFilteredItems();

  renderFilterSummary(filtered, source);
  updateAmbientBackground(filtered.length > 0 ? filtered : source);
  setViewMode(viewMode);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${CATEGORY_META[currentNav] ? categoryEmoji(currentNav) : "✦"}</div>
        <div class="empty-text">这里还空着</div>
        <div class="empty-sub">先放进第一样你想留下的东西。</div>
        <div class="empty-actions">
          <button class="btn btn-primary" onclick="openAdd()">新增记录</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const tags = item.tags.slice(0, 4);
    const preview = itemPreviewText(item);
    const notesCount = item.notesCount > 0 ? `<span class="note-counter">${item.notesCount} notes</span>` : "";
    const progress = item.progress ? `<span class="progress-chip">${escapeHtml(item.progress)}</span>` : "";
    const revisit = item.revisit ? `<span class="rewatch-badge">↺ revisit</span>` : "";
    const favorite = item.favorite ? `<span class="note-counter">♡ favourite</span>` : "";
    const creatorRow = [item.creator, item.year].filter(Boolean).join(" · ");

    return `
      <article class="card${item.isMock ? " is-mock" : ""}" data-card-id="${item.id}" data-accent="${escapeHtml(item.accentColor || "")}" onclick="openDetail('${item.id}')">
        <div class="card-cover">
          ${item.cover
            ? `<img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" crossorigin="anonymous" onerror="this.parentElement.innerHTML='<div class=&quot;cover-ph&quot;><div class=&quot;cover-ph-icon&quot;>${categoryEmoji(item.type)}</div><div class=&quot;cover-ph-title&quot;>${escapeHtml(item.title)}</div></div>'" />`
            : `<div class="cover-ph"><div class="cover-ph-icon">${categoryEmoji(item.type)}</div><div class="cover-ph-title">${escapeHtml(item.title)}</div></div>`}
          <span class="card-type-pill">${categoryEmoji(item.type)} ${categoryLabel(item.type)}</span>
          <span class="card-badge s-${item.status}">${statusLabel(item.status, item.type)}</span>
          ${item.mood ? `<span class="card-mood">${escapeHtml(item.mood)}</span>` : ""}
        </div>
        <div class="card-body">
          <div class="card-topline">
            <span class="card-submeta">${escapeHtml(creatorRow || "创作者未知")}</span>
            ${item.rating ? `<span class="card-score"><span class="score-txt">${formatRatingLabel(item.rating)}</span></span>` : ""}
          </div>
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          ${item.dscore ? `<div class="card-meta">Douban ${escapeHtml(item.dscore)}</div>` : `<div class="card-meta"> </div>`}
          ${tags.length > 0 ? `<div class="card-tags">${tags.map((tag) => `<span class="tag ${tagColor(tag)}">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          ${preview ? `<div class="card-snippet">${escapeHtml(preview)}</div>` : ""}
          <div class="card-foot">
            ${progress}
            ${favorite}
            ${revisit}
            ${notesCount}
          </div>
        </div>
      </article>
    `;
  }).join("");

  applyFallbackAccents(filtered);
  applyDynamicColors();
}

function renderStats() {
  const container = document.getElementById("stats-content");
  const shelfItems = getShelfItems();
  const doneItems = shelfItems.filter((item) => item.status === "done");
  const scoredItems = shelfItems.filter((item) => Number(item.rating) > 0);
  const averageScore = scoredItems.length > 0
    ? (scoredItems.reduce((sum, item) => sum + Number(item.rating || 0), 0) / scoredItems.length).toFixed(1)
    : "—";
  const currentYear = String(new Date().getFullYear());
  const finishedThisYear = doneItems.filter((item) => String(new Date(item.addedAt).getFullYear()) === currentYear).length;
  const categoryRows = CATEGORY_FILTER_ORDER.map((category, index) => ({
    category,
    count: shelfItems.filter((item) => item.type === category).length,
    color: ["#8b705c", "#6f7d97", "#8f7ba8", "#7a9076", "#b18d68"][index]
  }));

  const tagCounts = {};
  shelfItems.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts).sort((left, right) => right[1] - left[1]).slice(0, 6);
  const maxTagCount = topTags[0]?.[1] || 1;

  const scoreDistribution = Array(10).fill(0);
  scoredItems.forEach((item) => {
    scoreDistribution[Math.max(0, Math.min(9, roundedScore(item.rating) - 1))] += 1;
  });
  const maxScoreCount = Math.max(...scoreDistribution, 0) || 1;

  const topScored = [...doneItems]
    .filter((item) => Number(item.rating) > 0)
    .sort((left, right) => Number(right.rating) - Number(left.rating))
    .slice(0, 5);

  const moodCounts = {};
  shelfItems.filter((item) => item.mood).forEach((item) => {
    moodCounts[item.mood] = (moodCounts[item.mood] || 0) + 1;
  });
  const topMoods = Object.entries(moodCounts).sort((left, right) => right[1] - left[1]).slice(0, 5);

  const quotes = shelfItems.flatMap((item) => item.quotes.map((quote) => ({ quote, title: item.title })));

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-num">${shelfItems.length}</div><div class="stat-label">总条目</div></div>
      <div class="stat-box"><div class="stat-num">${doneItems.length}</div><div class="stat-label">已完成</div></div>
      <div class="stat-box"><div class="stat-num">${averageScore}</div><div class="stat-label">平均评分</div></div>
      <div class="stat-box"><div class="stat-num">${finishedThisYear}</div><div class="stat-label">${currentYear} 年完成</div></div>
    </div>
    <div class="stats-2col">
      <div class="stats-box">
        <h3>分类分布</h3>
        ${categoryRows.map(({ category, count, color }) => `
          <div class="bar-row">
            <span class="bar-label">${escapeHtml(categoryLabel(category))}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${shelfItems.length ? (count / shelfItems.length) * 100 : 0}%;background:${color}"></div></div>
            <span class="bar-val">${count}</span>
          </div>
        `).join("")}
      </div>
      <div class="stats-box">
        <h3>心情 Top 5</h3>
        ${topMoods.length > 0
          ? topMoods.map(([emoji, count]) => `
              <div class="mood-stat-row">
                <span class="bar-label">${escapeHtml(emoji)}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${(count / (topMoods[0]?.[1] || 1)) * 100}%;background:#8d7fb5"></div></div>
                <span class="bar-val">${count}</span>
              </div>
            `).join("")
          : '<div class="empty-sub">还没有心情记录。</div>'}
      </div>
    </div>
    <div class="stats-2col">
      <div class="stats-box">
        <h3>评分分布</h3>
        ${scoreDistribution.map((count, index) => `
          <div class="bar-row">
            <span class="bar-label">${index + 1} 分</span>
            <div class="bar-track"><div class="bar-fill" style="width:${(count / maxScoreCount) * 100}%;background:#d99b28"></div></div>
            <span class="bar-val">${count}</span>
          </div>
        `).join("")}
      </div>
      <div class="stats-box">
        <h3>评分最高</h3>
        ${topScored.length > 0
          ? topScored.map((item, index) => `
              <div class="top-item">
                <div class="top-rank${index < 3 ? ` r${index + 1}` : ""}">${index + 1}</div>
                <div class="top-info">
                  <div class="top-title">${escapeHtml(item.title)}</div>
                  <div class="top-meta">${escapeHtml([item.creator, item.year].filter(Boolean).join(" · "))}</div>
                </div>
                <div class="top-score">${escapeHtml(formatScore(item.rating))}</div>
              </div>
            `).join("")
          : '<div class="empty-sub">还没有评分记录。</div>'}
      </div>
    </div>
    <div class="stats-box">
      <h3>常用标签</h3>
      ${topTags.length > 0
        ? topTags.map(([tag, count]) => `
            <div class="bar-row">
              <span class="bar-label">${escapeHtml(tag)}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${(count / maxTagCount) * 100}%;background:#7a70a0"></div></div>
              <span class="bar-val">${count}</span>
            </div>
          `).join("")
        : '<div class="empty-sub">还没有标签。</div>'}
    </div>
    ${quotes.length > 0 ? `
      <div class="stats-box">
        <h3>最近留住的句子</h3>
        ${quotes.slice(0, 5).map(({ quote, title }) => `
          <div class="quote-item">
            <div class="quote-text">“${escapeHtml(quote)}”</div>
            <div class="top-meta">— ${escapeHtml(title)}</div>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function renderQuotesPage() {
  const container = document.getElementById("quotes-content");
  const shelfItems = getShelfItems();
  const quoteItems = shelfItems
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
      <div class="view-head view-head-compact view-head-end">
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
        : `<div class="empty"><div class="empty-icon">❞</div><div class="empty-text">还没有摘录</div><div class="empty-sub">等你在详情里留下第一句。</div><div class="empty-actions"><button class="btn btn-primary" onclick="openAdd()">新增记录</button></div></div>`}
    </div>
  `;
}

function formatCalendarMonth(date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

function renderMoodCalendar() {
  const container = document.getElementById("calendar-content");
  const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
  const monthEnd = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0);
  const startWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayDate = new Date();
  const itemMap = new Map();

  getShelfItems().forEach((item) => {
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
      cellsHtml += '<div class="calendar-day muted"></div>';
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
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.55rem">
                  <div class="calendar-entry-title">${escapeHtml(item.title)}</div>
                  <span class="calendar-entry-mood">${escapeHtml(item.mood || "·")}</span>
                </div>
                ${itemPreviewText(item) ? `<div class="calendar-entry-note">${escapeHtml(itemPreviewText(item))}</div>` : ""}
              </div>
            `).join("")
          : ""}
        ${dayItems.length > 3 ? `<div class="calendar-empty">+${dayItems.length - 3} more</div>` : ""}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="view-shell">
      <div class="view-head view-head-compact view-head-end">
        <div style="display:flex;gap:0.55rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="shiftCalendarMonth(-1)">← 上个月</button>
          <span class="filter-summary">${formatCalendarMonth(calendarCursor)}</span>
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

function setVisibleView(viewId) {
  ["view-card", "view-wall", "view-list", "view-stats", "view-quotes", "view-calendar"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = id === viewId ? "block" : "none";
    }
  });
}

function renderBrowseEmptyState() {
  const canManage = isAdminMode();
  return `
    <div class="empty">
      <div class="empty-icon">${CATEGORY_META[currentNav] ? categoryEmoji(currentNav) : "✦"}</div>
      <div class="empty-text">${canManage ? "This shelf is still waiting." : "This shelf is quiet for now."}</div>
      <div class="empty-sub">${canManage ? "Start with the first piece you want to keep." : "There is nothing to browse here yet."}</div>
      ${canManage ? '<div class="empty-actions"><button class="btn btn-primary" onclick="openAdd()">新增记录</button></div>' : ""}
    </div>
  `;
}

function formatAddedAtLabel(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderWall() {
  const container = document.getElementById("poster-wall");
  if (!container) {
    return;
  }

  const { filtered, source } = getFilteredItems();
  const list = filtered;

  renderFilterSummary(filtered, source);
  updateAmbientBackground(list.length > 0 ? list : source);

  if (list.length === 0) {
    container.innerHTML = renderBrowseEmptyState();
    return;
  }

  container.innerHTML = list.map((item) => `
    <div class="wall-item" onclick="openDetail('${item.id}')">
      ${item.cover
        ? `<img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy" />`
        : `<div class="wall-ph">${typeSymbol(item.type)}</div>`}
      <div class="wall-overlay">
        <div class="wall-title">${escapeHtml(item.title)}</div>
        <div class="wall-meta">${item.rating ? `★ ${escapeHtml(formatScore(item.rating))}/10` : ""}${item.dscore ? `${item.rating ? " · " : ""}豆瓣 ${escapeHtml(item.dscore)}` : ""}</div>
        <div class="wall-status s-${item.status}">${statusLabel(item.status, item.type)}</div>
      </div>
    </div>
  `).join("");
}

function renderCompactList() {
  const container = document.getElementById("compact-list");
  if (!container) {
    return;
  }

  const { filtered, source } = getFilteredItems();
  const list = filtered;

  renderFilterSummary(filtered, source);
  updateAmbientBackground(list.length > 0 ? list : source);

  if (list.length === 0) {
    container.innerHTML = renderBrowseEmptyState();
    return;
  }

  container.innerHTML = list.map((item) => `
    <button class="compact-row" onclick="openDetail('${item.id}')">
      <span class="compact-type">${typeSymbol(item.type)} ${categoryLabel(item.type)}</span>
      <span class="compact-title">${escapeHtml(item.title)}</span>
      <span class="compact-year">${escapeHtml(item.year || formatAddedAtLabel(item.addedAt))}</span>
      <span class="compact-score">${item.rating ? `★ ${escapeHtml(formatScore(item.rating))}` : ""}</span>
      <span class="compact-status s-${item.status}">${statusLabel(item.status, item.type)}</span>
    </button>
  `).join("");
}

function renderBrowseView() {
  renderFilterPills();

  if (viewMode === "wall" || currentNav === "wall") {
    setVisibleView("view-wall");
    renderWall();
    return;
  }

  if (viewMode === "list") {
    setVisibleView("view-list");
    renderCompactList();
    return;
  }

  setVisibleView("view-card");
  renderCards();
}

function renderActiveView() {
  renderSidebarStats();

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

  renderBrowseView();
}

function render() {
  renderSidebarStats();
  renderBrowseView();
}

function setPill(key) {
  activePill = key;
  currentNav = "all";
  renderActiveView();
}

function setCategoryTab(category) {
  activePill = `type-${category}`;
  if (category === "all") {
    setNav("all");
    return;
  }
  setNav(category);
}

function setNav(nav) {
  currentNav = nav;

  if (nav === "all") {
    activePill = "type-all";
  } else if (CATEGORY_META[nav]) {
    activePill = `type-${nav}`;
  } else {
    activePill = "type-all";
  }

  document.querySelectorAll(".nav-item").forEach((button) => button.classList.remove("active"));
  document.getElementById(`nav-${nav}`)?.classList.add("active");

  const copy = PAGE_COPY[nav] || PAGE_COPY.all;
  document.getElementById("page-title").textContent = copy.title;
  document.getElementById("page-sub").textContent = copy.subtitle;
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
  document.getElementById("remind-field").style.display = status === "want" ? "flex" : "none";
  document.getElementById("progress-field").style.display = status === "progress" ? "flex" : "none";
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

function startNewFromItem(id) {
  const item = getShelfItems().find((entry) => entry.id === String(id));
  if (!item) {
    openAdd();
    return;
  }

  resetForm();
  document.getElementById("f-douban").value = item.douban || "";
  document.getElementById("f-title").value = item.title || "";
  document.getElementById("f-cover").value = item.cover || "";
  document.getElementById("f-creator").value = item.creator || "";
  document.getElementById("f-year").value = item.year || "";
  document.getElementById("f-dscore").value = item.dscore || "";
  document.getElementById("f-type").value = item.type || "movie";
  document.getElementById("f-status").value = item.status === "done" ? "done" : "want";
  document.getElementById("f-tags").value = item.tags.join(", ");
  document.getElementById("f-remind").value = item.remind || "";
  document.getElementById("f-progress").value = item.progress || "";
  document.getElementById("f-desc").value = item.desc || "";
  document.getElementById("f-quick-note").value = item.quickNote || "";
  document.getElementById("f-note").value = item.note || "";
  myScore = item.rating || 0;
  myMood = item.mood || "";
  renderStarPicker(myScore);
  renderMoodPicker(myMood);
  updateFormFields();
  document.getElementById("modal-add").classList.add("open");
}

function openEdit(id) {
  const item = getRealItemById(id);
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
    hint.textContent = "已填充，请检查后保存。";
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
  if (item.isMock || !getRealItemById(item.id)) {
    throw new Error("展示样本不能直接保存，请先新增到自己的收藏。");
  }

  const payload = buildApiPayloadFromItem(item);
  const result = await requestJson(`/api/items/${item.id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  return mapItemFromApi(result.item);
}

function replaceLocalItem(item) {
  items = items.map((entry) => (entry.id === item.id ? item : entry));
}

async function saveItem() {
  const existingItem = editId ? getRealItemById(editId) : null;
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
  const item = getShelfItems().find((entry) => entry.id === String(id));
  if (!item) {
    return;
  }

  const editable = !item.isMock && Boolean(getRealItemById(id));
  const tagsHtml = item.tags.map((tag) => `<span class="tag ${tagColor(tag)}" style="font-size:12px;padding:4px 10px">${escapeHtml(tag)}</span>`).join("");
  const quotesHtml = item.quotes.length > 0
    ? item.quotes.map((quote, index) => `
        <div class="quote-item">
          <div class="quote-text">“${escapeHtml(quote)}”</div>
          ${editable ? `<button class="quote-del" onclick="delQuote('${item.id}', ${index})">✕</button>` : ""}
        </div>
      `).join("")
    : '<div class="empty-sub">还没有摘录。</div>';
  const rewatchesHtml = item.rewatches.length > 0
    ? item.rewatches.map((rewatch) => `
        <div class="rewatch-item">
          <div class="rewatch-date">${escapeHtml(rewatch.date || "")}</div>
          <div class="rewatch-note">${escapeHtml(rewatch.note || "（无笔记）")}</div>
        </div>
      `).join("")
    : '<div class="empty-sub">还没有重看记录。</div>';

  document.getElementById("panel-content").innerHTML = `
    ${item.cover
      ? `<img class="panel-cover" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;panel-cover-ph&quot;>${categoryEmoji(item.type)}</div>'" />`
      : `<div class="panel-cover-ph">${categoryEmoji(item.type)}</div>`}
    <div class="panel-title">${escapeHtml(item.title)}${item.mood ? ` <span style="font-size:1.2rem">${escapeHtml(item.mood)}</span>` : ""}</div>
    <div class="panel-meta">
      <span class="meta-pill">${escapeHtml(categoryLabel(item.type))}</span>
      ${item.creator ? `<span class="meta-pill">${escapeHtml(item.creator)}</span>` : ""}
      ${item.year ? `<span class="meta-pill">${escapeHtml(item.year)}</span>` : ""}
      ${item.dscore ? `<span class="meta-pill">Douban ${escapeHtml(item.dscore)}</span>` : ""}
      <span class="meta-pill s-${item.status}">${statusLabel(item.status, item.type)}</span>
    </div>
    ${item.isMock ? '<div class="remind-info" style="margin-bottom:1rem">这是为了铺满界面而加入的展示样本，不会写入你的数据库，也不能直接编辑。</div>' : ""}
    ${tagsHtml ? `<div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:1rem">${tagsHtml}</div>` : ""}
    ${item.remind && item.status === "want" ? `<div class="remind-info" style="margin-bottom:1rem">提醒日期：${escapeHtml(item.remind)}${isOverdue(item.remind) ? " · 已过期" : ""}</div>` : ""}
    ${item.rating ? `<div class="panel-section"><div class="panel-section-title">我的评分</div><div style="display:flex;align-items:baseline;gap:0.6rem"><span class="score-big">${escapeHtml(formatScore(item.rating))}</span><span class="panel-text">/ 10</span></div></div>` : ""}
    ${item.desc ? `<div class="panel-section"><div class="panel-section-title">简介</div><div class="panel-text">${escapeHtml(item.desc)}</div></div>` : ""}
    ${item.quickNote ? `<div class="panel-section"><div class="panel-section-title">随手记</div><div class="panel-text">${escapeHtml(item.quickNote)}</div></div>` : ""}
    ${item.note ? `<div class="panel-section"><div class="panel-section-title">观后感 / 读后感</div><div class="panel-text">${escapeHtml(item.note)}</div></div>` : ""}
    ${item.progress ? `<div class="panel-section"><div class="panel-section-title">当前进度</div><div class="panel-text">${escapeHtml(item.progress)}</div></div>` : ""}
    <div class="panel-section">
      <div class="panel-section-title">金句摘录 ${editable ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation()">＋</button>` : ""}</div>
      <div id="pd-quotes">${quotesHtml}</div>
      ${editable ? `
        <div class="add-item-row" style="margin-top:0.5rem">
          <input type="text" id="new-quote-input" placeholder="输入想留住的一句话…" onkeydown="if(event.key==='Enter')addQuote('${item.id}')" />
          <button onclick="addQuote('${item.id}')">添加</button>
        </div>
      ` : ""}
    </div>
    ${item.status === "done" ? `
      <div class="panel-section">
        <div class="panel-section-title">重看记录 ${editable ? `<button class="btn btn-ghost btn-sm" onclick="openRewatch('${item.id}')">＋ 添加</button>` : ""}</div>
        <div id="pd-rewatches">${rewatchesHtml}</div>
      </div>
    ` : ""}
    <div class="panel-actions">
      ${editable ? `<button class="btn btn-outline" style="flex:1" onclick="openEdit('${item.id}');closeOverlay('panel-overlay')">编辑</button>` : `<button class="btn btn-outline" style="flex:1" onclick="startNewFromItem('${item.id}');closeOverlay('panel-overlay')">把它加入我的收藏</button>`}
      ${editable ? `<button class="btn btn-ghost" style="color:#9a3d32" onclick="deleteItem('${item.id}')">删除</button>` : ""}
    </div>
  `;

  document.getElementById("panel-overlay").classList.add("open");
}

async function addQuote(id) {
  const item = getRealItemById(id);
  if (!item) {
    return;
  }

  const input = document.getElementById("new-quote-input");
  const text = input.value.trim();
  if (!text) {
    return;
  }

  try {
    const savedItem = await persistExistingItem({
      ...item,
      quotes: [...item.quotes, text]
    });
    replaceLocalItem(savedItem);
    input.value = "";
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "保存摘录失败");
  }
}

async function delQuote(id, index) {
  const item = getRealItemById(id);
  if (!item) {
    return;
  }

  try {
    const savedItem = await persistExistingItem({
      ...item,
      quotes: item.quotes.filter((_, quoteIndex) => quoteIndex !== index)
    });
    replaceLocalItem(savedItem);
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "删除摘录失败");
  }
}

function openRewatch(id) {
  if (!getRealItemById(id)) {
    return;
  }

  rewatchTargetId = id;
  document.getElementById("rw-date").value = today();
  document.getElementById("rw-note").value = "";
  document.getElementById("modal-rewatch").classList.add("open");
}

async function saveRewatch() {
  if (!rewatchTargetId) {
    return;
  }

  const item = getRealItemById(rewatchTargetId);
  if (!item) {
    return;
  }

  try {
    const savedItem = await persistExistingItem({
      ...item,
      rewatches: [
        ...item.rewatches,
        {
          date: document.getElementById("rw-date").value || today(),
          note: document.getElementById("rw-note").value.trim()
        }
      ]
    });
    replaceLocalItem(savedItem);
    closeOverlay("modal-rewatch");
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "保存重看记录失败");
  }
}

async function deleteItem(id) {
  if (!getRealItemById(id)) {
    return;
  }

  if (!window.confirm("确认删除这条记录？")) {
    return;
  }

  try {
    await requestJson(`/api/items/${id}`, { method: "DELETE" });
    closeOverlay("panel-overlay");
    await loadItems();
  } catch (error) {
    window.alert(error.message || "删除失败");
  }
}

function openExport() {
  const doneCount = items.filter((item) => item.status === "done").length;
  const quoteCount = items.reduce((sum, item) => sum + item.quotes.length, 0);
  document.getElementById("export-preview").innerHTML = `
    共 ${items.length} 条真实记录 · 已完成 ${doneCount} 条 · ${quoteCount} 条摘录
    <br />
    <span style="color:var(--ink-4)">文件名：mediashelf_${today()}.json</span>
  `;
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
      body: JSON.stringify({ items: parsedItems })
    });

    message.textContent = "";
    closeOverlay("modal-import");
    await loadItems();
  } catch (error) {
    message.textContent = error.message || "导入失败，请检查文件格式";
  }
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

function closeOverlay(id) {
  document.getElementById(id)?.classList.remove("open");
}

function bgClose(event, id) {
  if (event.target === document.getElementById(id)) {
    closeOverlay(id);
  }
}

function requestJson(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    credentials: "same-origin",
    ...options,
    headers
  }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        adminState.authenticated = false;
        updateAdminUI();
      }
      throw new Error(payload.error || "Request failed");
    }
    return payload;
  });
}

function isAdminMode() {
  return Boolean(adminState.authenticated);
}

function ensureAdminLoginModal() {
  if (document.getElementById("modal-admin-login")) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="overlay" id="modal-admin-login" onclick="bgClose(event,'modal-admin-login')">
      <div class="modal modal-sm">
        <div class="modal-hd">
          <div class="modal-title">Admin login</div>
          <button class="modal-close" onclick="closeOverlay('modal-admin-login')">✕</button>
        </div>
        <p class="modal-copy">Public mode is browse-only. Enter the admin password to unlock add, edit, delete, import, and export.</p>
        <div class="field modal-field">
          <label for="admin-password-input">Password</label>
          <input type="password" id="admin-password-input" placeholder="Enter admin password" />
        </div>
        <div id="admin-login-msg" class="modal-message"></div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeOverlay('modal-admin-login')">Cancel</button>
          <button class="btn btn-primary" id="admin-login-submit-btn" onclick="loginAdmin()">Enter admin mode</button>
        </div>
      </div>
    </div>
  `.trim();

  document.body.appendChild(wrapper.firstElementChild);
  document.getElementById("admin-password-input")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loginAdmin();
    }
  });
}

function setAdminMessage(message = "", tone = "") {
  const messageElement = document.getElementById("admin-login-msg");
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.className = `modal-message${tone ? ` ${tone}` : ""}`;
}

function openAdminLogin(message = "") {
  if (!adminState.configured) {
    window.alert("Admin login is not configured on this server. Please set ADMIN_PASSWORD first.");
    return;
  }

  ensureAdminLoginModal();
  setAdminMessage(message);
  const input = document.getElementById("admin-password-input");
  if (input) {
    input.value = "";
  }
  document.getElementById("modal-admin-login")?.classList.add("open");
  input?.focus();
}

function requireAdminAction(message = "Admin mode required for this action.") {
  if (isAdminMode()) {
    return true;
  }

  openAdminLogin(message);
  return false;
}

function toggleAdminLogin() {
  if (isAdminMode()) {
    logoutAdmin();
    return;
  }

  openAdminLogin();
}

function renderSessionMarkup({ mobile = false } = {}) {
  const modeClass = isAdminMode() ? "is-admin" : "is-guest";
  const modeLabel = isAdminMode() ? "Admin mode" : "Visitor mode";
  const actionMarkup = isAdminMode()
    ? `<button class="btn btn-ghost btn-sm session-action" onclick="logoutAdmin()">Logout</button>`
    : adminState.configured
      ? `<button class="btn btn-ghost btn-sm session-action" onclick="openAdminLogin()">Admin</button>`
      : `<span class="session-hint">Browse only</span>`;

  return `
    <div class="session-chip ${modeClass}${mobile ? " is-mobile" : ""}">${modeLabel}</div>
    ${actionMarkup}
  `;
}

function updateAdminUI() {
  document.body.classList.toggle("is-admin", isAdminMode());
  document.body.classList.toggle("is-guest", !isAdminMode());

  const addButton = document.querySelector("#primary-add-btn, .toolbar-actions .btn-primary");
  const utilityActions = document.querySelector(".utility-actions");

  if (addButton) {
    addButton.hidden = !isAdminMode();
  }
  if (utilityActions) {
    utilityActions.hidden = !isAdminMode();
  }

  const adminEntry = document.getElementById("admin-entry");
  const adminEntryButton = document.getElementById("admin-entry-btn");
  if (adminEntry) {
    adminEntry.style.display = adminState.configured ? "" : "none";
  }
  if (adminEntryButton) {
    adminEntryButton.textContent = isAdminMode() ? "✓ 已登录 · 退出" : "⚙ 管理";
  }

  document.querySelector(".toolbar-shell")?.classList.toggle("is-public", !isAdminMode());
}

async function loadAdminSession() {
  try {
    const payload = await requestJson("/api/admin/session");
    adminState = {
      authenticated: Boolean(payload.authenticated),
      configured: Boolean(payload.admin_enabled ?? payload.configured)
    };
  } catch (error) {
    console.error("Failed to load admin session:", error);
    adminState = {
      authenticated: false,
      configured: false
    };
  }

  updateAdminUI();
  syncViewModeForRole();
}

async function loginAdmin() {
  const passwordInput = document.getElementById("admin-password-input");
  const submitButton = document.getElementById("admin-login-submit-btn");
  const password = passwordInput?.value || "";

  if (!password) {
    setAdminMessage("Please enter the admin password.", "error");
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Entering…";
  }

  try {
    await requestJson("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    adminState.authenticated = true;
    updateAdminUI();
    syncViewModeForRole();
    closeOverlay("modal-admin-login");
    renderActiveView();
  } catch (error) {
    setAdminMessage(error.message || "Admin login failed.", "error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Enter admin mode";
    }
  }
}

async function logoutAdmin() {
  try {
    await requestJson("/api/admin/logout", {
      method: "POST"
    });
  } catch (error) {
    console.error("Failed to logout admin:", error);
  } finally {
    adminState.authenticated = false;
    updateAdminUI();
    syncViewModeForRole();
    closeOverlay("modal-add");
    closeOverlay("panel-overlay");
    renderActiveView();
  }
}

function openMobileNav() {
  mobileNavOpen = true;
  document.querySelector(".page-shell")?.classList.add("mobile-nav-open");
}

function closeMobileNav() {
  mobileNavOpen = false;
  document.querySelector(".page-shell")?.classList.remove("mobile-nav-open");
}

function syncMobileNavOnResize() {
  if (window.innerWidth > 960 && mobileNavOpen) {
    closeMobileNav();
  }
}

function setNav(nav) {
  currentNav = nav;

  if (nav === "all" || nav === "wall") {
    activePill = "type-all";
  } else if (CATEGORY_META[nav]) {
    activePill = `type-${nav}`;
  } else {
    activePill = "type-all";
  }

  if (nav === "wall") {
    viewMode = "wall";
    if (isAdminMode()) {
      try {
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, "wall");
      } catch (error) {
        // ignore storage failures
      }
    }
  }

  updateViewModeButtons();

  document.querySelectorAll(".nav-item").forEach((button) => button.classList.remove("active"));
  document.getElementById(`nav-${nav}`)?.classList.add("active");

  const copy = PAGE_COPY[nav] || PAGE_COPY.all;
  document.getElementById("page-title").textContent = copy.title;
  document.getElementById("page-sub").textContent = copy.subtitle;
  closeMobileNav();
  renderActiveView();
}

function renderActiveView() {
  renderSidebarStats();

  const headerCopy = document.querySelector(".header-copy");
  const toolbarShell = document.getElementById("toolbar-wrap");
  const mainShell = document.querySelector(".main");
  const showFullHeader = !["quotes", "calendar", "stats"].includes(currentNav);

  if (headerCopy) {
    headerCopy.style.display = "";
  }
  if (toolbarShell) {
    toolbarShell.style.display = currentNav === "all" ? "" : "none";
  }
  if (mainShell) {
    mainShell.classList.toggle("is-compact", !showFullHeader);
  }

  updateAdminUI();

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

  renderBrowseView();
}

function renderCards() {
  const container = document.getElementById("cards-grid");
  const { filtered, source } = getFilteredItems();
  container.className = "cards-grid";

  renderFilterSummary(filtered, source);
  updateAmbientBackground(filtered.length > 0 ? filtered : source);

  if (filtered.length === 0) {
    container.innerHTML = renderBrowseEmptyState();
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const creatorRow = [item.creator, item.year].filter(Boolean).join(" · ");

    return `
      <article class="card${item.isMock ? " is-mock" : ""}" data-card-id="${item.id}" data-accent="${escapeHtml(item.accentColor || "")}" onclick="openDetail('${item.id}')">
        <div class="card-cover">
          ${item.cover
            ? `<img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" crossorigin="anonymous" onerror="this.parentElement.innerHTML='<div class=&quot;cover-ph&quot;><div class=&quot;cover-ph-icon&quot;>${categoryEmoji(item.type)}</div><div class=&quot;cover-ph-title&quot;>${escapeHtml(item.title)}</div></div>'" />`
            : `<div class="cover-ph"><div class="cover-ph-icon">${categoryEmoji(item.type)}</div><div class="cover-ph-title">${escapeHtml(item.title)}</div></div>`}
          <span class="card-type-pill">${categoryEmoji(item.type)} ${categoryLabel(item.type)}</span>
          <span class="card-badge s-${item.status}">${statusLabel(item.status, item.type)}</span>
          ${item.mood ? `<span class="card-mood">${escapeHtml(item.mood)}</span>` : ""}
        </div>
        <div class="card-body">
          <div class="card-topline">
            <span class="card-submeta">${escapeHtml(creatorRow || "Unknown")}</span>
            ${item.rating ? `<span class="card-score"><span class="score-txt">${formatRatingLabel(item.rating)}</span></span>` : ""}
          </div>
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
        </div>
      </article>
    `;
  }).join("");

  applyFallbackAccents(filtered);
  applyDynamicColors();
}

function renderQuotesPage() {
  const container = document.getElementById("quotes-content");
  const shelfItems = getShelfItems();
  const quoteItems = shelfItems
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
      <div class="view-head view-head-compact view-head-end">
        <select class="sort-select" onchange="setQuoteWorkFilter(this.value)">
          <option value="all"${quoteWorkFilter === "all" ? " selected" : ""}>All works</option>
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
        : `<div class="empty"><div class="empty-icon">✦</div><div class="empty-text">No quotes yet</div><div class="empty-sub">${isAdminMode() ? "Leave the first line you want to keep." : "No public quotes to browse yet."}</div>${isAdminMode() ? '<div class="empty-actions"><button class="btn btn-primary" onclick="openAdd()">新增记录</button></div>' : ""}</div>`}
    </div>
  `;
}

function openAdd() {
  if (!requireAdminAction("Admin mode required to add a new record.")) {
    return;
  }

  resetForm();
  document.getElementById("modal-add").classList.add("open");
}

function startNewFromItem(id) {
  if (!requireAdminAction("Only admins can turn showcase items into saved records.")) {
    return;
  }

  const item = getShelfItems().find((entry) => entry.id === String(id));
  if (!item) {
    openAdd();
    return;
  }

  resetForm();
  document.getElementById("f-douban").value = item.douban || "";
  document.getElementById("f-title").value = item.title || "";
  document.getElementById("f-cover").value = item.cover || "";
  document.getElementById("f-creator").value = item.creator || "";
  document.getElementById("f-year").value = item.year || "";
  document.getElementById("f-dscore").value = item.dscore || "";
  document.getElementById("f-type").value = item.type || "movie";
  document.getElementById("f-status").value = item.status === "done" ? "done" : "want";
  document.getElementById("f-tags").value = item.tags.join(", ");
  document.getElementById("f-remind").value = item.remind || "";
  document.getElementById("f-progress").value = item.progress || "";
  document.getElementById("f-desc").value = item.desc || "";
  document.getElementById("f-quick-note").value = item.quickNote || "";
  document.getElementById("f-note").value = item.note || "";
  myScore = item.rating || 0;
  myMood = item.mood || "";
  renderStarPicker(myScore);
  renderMoodPicker(myMood);
  updateFormFields();
  document.getElementById("modal-add").classList.add("open");
}

function openEdit(id) {
  if (!requireAdminAction("Admin mode required to edit this record.")) {
    return;
  }

  const item = getRealItemById(id);
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
  document.getElementById("fetch-btn").textContent = "自动填充";
  document.getElementById("save-btn").disabled = false;
  document.getElementById("save-btn").textContent = "保存记录";
  renderStarPicker(myScore);
  renderMoodPicker(myMood);
  updateFormFields();
  document.getElementById("modal-add").classList.add("open");
}

async function fetchDouban() {
  if (!requireAdminAction("Admin mode required to use Douban autofill.")) {
    return;
  }

  const url = document.getElementById("f-douban").value.trim();
  const hint = document.getElementById("fetch-hint");
  const button = document.getElementById("fetch-btn");

  if (!url) {
    hint.textContent = "Please paste a Douban link first.";
    hint.className = "dhint err";
    return;
  }

  button.disabled = true;
  button.textContent = "Loading…";
  hint.textContent = "Fetching metadata…";
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
    hint.textContent = "Metadata imported. Please review before saving.";
    hint.className = "dhint ok";
  } catch (error) {
    hint.textContent = error.message || "Douban autofill failed.";
    hint.className = "dhint err";
  } finally {
    button.disabled = false;
    button.textContent = "自动填充";
  }
}

async function saveItem() {
  if (!requireAdminAction("Admin mode required to save records.")) {
    return;
  }

  const existingItem = editId ? getRealItemById(editId) : null;
  const payload = buildApiPayloadFromForm(existingItem);

  if (!payload.title) {
    window.alert("Please enter a title.");
    return;
  }

  const saveButton = document.getElementById("save-btn");
  saveButton.disabled = true;
  saveButton.textContent = "Saving…";

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
    window.alert(error.message || "Failed to save record.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "保存记录";
  }
}

function openDetail(id) {
  const item = getShelfItems().find((entry) => entry.id === String(id));
  if (!item) {
    return;
  }

  const canManage = isAdminMode();
  const editable = canManage && !item.isMock && Boolean(getRealItemById(id));
  const canCloneShowcase = canManage && item.isMock;
  const tagsHtml = item.tags.map((tag) => `<span class="tag ${tagColor(tag)}" style="font-size:12px;padding:4px 10px">${escapeHtml(tag)}</span>`).join("");
  const quotesHtml = item.quotes.length > 0
    ? item.quotes.map((quote, index) => `
        <div class="quote-item">
          <div class="quote-text">“${escapeHtml(quote)}”</div>
          ${editable ? `<button class="quote-del" onclick="delQuote('${item.id}', ${index})">✕</button>` : ""}
        </div>
      `).join("")
    : '<div class="empty-sub">No saved quotes yet.</div>';
  const rewatchesHtml = item.rewatches.length > 0
    ? item.rewatches.map((rewatch) => `
        <div class="rewatch-item">
          <div class="rewatch-date">${escapeHtml(rewatch.date || "")}</div>
          <div class="rewatch-note">${escapeHtml(rewatch.note || "(no note)")}</div>
        </div>
      `).join("")
    : '<div class="empty-sub">No revisit notes yet.</div>';

  document.getElementById("panel-content").innerHTML = `
    ${item.cover
      ? `<img class="panel-cover" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;panel-cover-ph&quot;>${categoryEmoji(item.type)}</div>'" />`
      : `<div class="panel-cover-ph">${categoryEmoji(item.type)}</div>`}
    <div class="panel-title">${escapeHtml(item.title)}${item.mood ? ` <span style="font-size:1.2rem">${escapeHtml(item.mood)}</span>` : ""}</div>
    <div class="panel-meta">
      <span class="meta-pill">${escapeHtml(categoryLabel(item.type))}</span>
      ${item.creator ? `<span class="meta-pill">${escapeHtml(item.creator)}</span>` : ""}
      ${item.year ? `<span class="meta-pill">${escapeHtml(item.year)}</span>` : ""}
      ${item.dscore ? `<span class="meta-pill">Douban ${escapeHtml(item.dscore)}</span>` : ""}
      <span class="meta-pill s-${item.status}">${statusLabel(item.status, item.type)}</span>
    </div>
    ${tagsHtml ? `<div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:1rem">${tagsHtml}</div>` : ""}
    ${item.remind && item.status === "want" ? `<div class="remind-info" style="margin-bottom:1rem">Reminder: ${escapeHtml(item.remind)}${isOverdue(item.remind) ? " · overdue" : ""}</div>` : ""}
    ${item.rating ? `<div class="panel-section"><div class="panel-section-title">My rating</div><div style="display:flex;align-items:baseline;gap:0.6rem"><span class="score-big">${escapeHtml(formatScore(item.rating))}</span><span class="panel-text">/ 10</span></div></div>` : ""}
    ${item.desc ? `<div class="panel-section"><div class="panel-section-title">Summary</div><div class="panel-text">${escapeHtml(item.desc)}</div></div>` : ""}
    ${item.quickNote ? `<div class="panel-section"><div class="panel-section-title">Quick note</div><div class="panel-text">${escapeHtml(item.quickNote)}</div></div>` : ""}
    ${item.note ? `<div class="panel-section"><div class="panel-section-title">Longer note</div><div class="panel-text">${escapeHtml(item.note)}</div></div>` : ""}
    ${item.progress ? `<div class="panel-section"><div class="panel-section-title">Current progress</div><div class="panel-text">${escapeHtml(item.progress)}</div></div>` : ""}
    <div class="panel-section">
      <div class="panel-section-title">Quotes ${editable ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation()">＋</button>` : ""}</div>
      <div id="pd-quotes">${quotesHtml}</div>
      ${editable ? `
        <div class="add-item-row" style="margin-top:0.5rem">
          <input type="text" id="new-quote-input" placeholder="Add a quote…" onkeydown="if(event.key==='Enter')addQuote('${item.id}')" />
          <button onclick="addQuote('${item.id}')">Add</button>
        </div>
      ` : ""}
    </div>
    ${item.status === "done" ? `
      <div class="panel-section">
        <div class="panel-section-title">Revisit notes ${editable ? `<button class="btn btn-ghost btn-sm" onclick="openRewatch('${item.id}')">＋ Add</button>` : ""}</div>
        <div id="pd-rewatches">${rewatchesHtml}</div>
      </div>
    ` : ""}
    <div class="panel-actions">
      ${editable ? `<button class="btn btn-outline" style="flex:1" onclick="openEdit('${item.id}');closeOverlay('panel-overlay')">Edit</button>` : ""}
      ${canCloneShowcase ? `<button class="btn btn-outline" style="flex:1" onclick="startNewFromItem('${item.id}');closeOverlay('panel-overlay')">Save to my shelf</button>` : ""}
      ${editable ? `<button class="btn btn-ghost" style="color:#9a3d32" onclick="deleteItem('${item.id}')">Delete</button>` : ""}
      ${!editable && !canCloneShowcase ? `<button class="btn btn-outline" style="flex:1" onclick="closeOverlay('panel-overlay')">Close</button>` : ""}
    </div>
  `;

  document.getElementById("panel-overlay").classList.add("open");
}

async function addQuote(id) {
  if (!requireAdminAction("Admin mode required to edit quotes.")) {
    return;
  }

  const item = getRealItemById(id);
  if (!item) {
    return;
  }

  const input = document.getElementById("new-quote-input");
  const text = input.value.trim();
  if (!text) {
    return;
  }

  try {
    const savedItem = await persistExistingItem({
      ...item,
      quotes: [...item.quotes, text]
    });
    replaceLocalItem(savedItem);
    input.value = "";
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "Failed to save quote.");
  }
}

async function delQuote(id, index) {
  if (!requireAdminAction("Admin mode required to edit quotes.")) {
    return;
  }

  const item = getRealItemById(id);
  if (!item) {
    return;
  }

  try {
    const savedItem = await persistExistingItem({
      ...item,
      quotes: item.quotes.filter((_, quoteIndex) => quoteIndex !== index)
    });
    replaceLocalItem(savedItem);
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "Failed to remove quote.");
  }
}

function openRewatch(id) {
  if (!requireAdminAction("Admin mode required to add revisit notes.")) {
    return;
  }

  if (!getRealItemById(id)) {
    return;
  }

  rewatchTargetId = id;
  document.getElementById("rw-date").value = today();
  document.getElementById("rw-note").value = "";
  document.getElementById("modal-rewatch").classList.add("open");
}

async function saveRewatch() {
  if (!requireAdminAction("Admin mode required to save revisit notes.")) {
    return;
  }

  if (!rewatchTargetId) {
    return;
  }

  const item = getRealItemById(rewatchTargetId);
  if (!item) {
    return;
  }

  try {
    const savedItem = await persistExistingItem({
      ...item,
      rewatches: [
        ...item.rewatches,
        {
          date: document.getElementById("rw-date").value || today(),
          note: document.getElementById("rw-note").value.trim()
        }
      ]
    });
    replaceLocalItem(savedItem);
    closeOverlay("modal-rewatch");
    openDetail(savedItem.id);
    render();
  } catch (error) {
    window.alert(error.message || "Failed to save revisit note.");
  }
}

async function deleteItem(id) {
  if (!requireAdminAction("Admin mode required to delete records.")) {
    return;
  }

  if (!getRealItemById(id)) {
    return;
  }

  if (!window.confirm("Delete this record?")) {
    return;
  }

  try {
    await requestJson(`/api/items/${id}`, { method: "DELETE" });
    closeOverlay("panel-overlay");
    await loadItems();
  } catch (error) {
    window.alert(error.message || "Failed to delete record.");
  }
}

function openExport() {
  if (!requireAdminAction("Admin mode required to export data.")) {
    return;
  }

  const doneCount = items.filter((item) => item.status === "done").length;
  const quoteCount = items.reduce((sum, item) => sum + item.quotes.length, 0);
  document.getElementById("export-preview").innerHTML = `
    ${items.length} real records · ${doneCount} completed · ${quoteCount} saved quotes
    <br />
    <span style="color:var(--ink-4)">Filename: mediashelf_${today()}.json</span>
  `;
  document.getElementById("modal-export").classList.add("open");
}

function doExport() {
  if (!requireAdminAction("Admin mode required to export data.")) {
    return;
  }

  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `mediashelf_${today()}.json`;
  link.click();
  closeOverlay("modal-export");
}

function openImport() {
  if (!requireAdminAction("Admin mode required to import data.")) {
    return;
  }

  document.getElementById("import-file").value = "";
  document.getElementById("import-msg").textContent = "";
  document.getElementById("modal-import").classList.add("open");
}

async function doImport() {
  if (!requireAdminAction("Admin mode required to import data.")) {
    return;
  }

  const file = document.getElementById("import-file").files[0];
  const message = document.getElementById("import-msg");

  if (!file) {
    message.textContent = "Please choose a file first.";
    return;
  }

  try {
    const rawText = await file.text();
    const parsedItems = JSON.parse(rawText);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Import file format is invalid");
    }

    await requestJson("/api/items/import", {
      method: "POST",
      body: JSON.stringify({ items: parsedItems })
    });

    message.textContent = "";
    closeOverlay("modal-import");
    await loadItems();
  } catch (error) {
    message.textContent = error.message || "Import failed.";
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
        <div class="empty-icon">⚠</div>
        <div class="empty-text">Unable to load the shelf</div>
        <div class="empty-sub">${escapeHtml(error.message || "Please check the server connection.")}</div>
      </div>
    `;
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
        <div class="empty-icon">⚠</div>
        <div class="empty-text">加载失败</div>
        <div class="empty-sub">${escapeHtml(error.message || "请检查后端接口")}</div>
      </div>
    `;
  }
}

document.getElementById("f-status").addEventListener("change", updateFormFields);
document.getElementById("f-type").addEventListener("change", updateFormFields);
["filter-rating", "filter-tags", "filter-year", "filter-type", "filter-status"].forEach((id) => {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const eventName = element.tagName === "SELECT" ? "change" : "input";
  element.addEventListener(eventName, () => {
    syncAdvancedFiltersFromControls();
    render();
  });
});

syncAdvancedFiltersFromControls();
toggleAdvancedFilters(false);
syncViewModeForRole();
ensureAdminLoginModal();
loadAdminSession().then(loadItems);
window.addEventListener("resize", syncMobileNavOnResize);

window.setNav = setNav;
window.setPill = setPill;
window.setCategoryTab = setCategoryTab;
window.setView = setView;
window.setViewMode = setViewMode;
window.renderWall = renderWall;
window.renderCompactList = renderCompactList;
window.toggleAdvancedFilters = toggleAdvancedFilters;
window.clearAdvancedFilters = clearAdvancedFilters;
window.openAdd = openAdd;
window.startNewFromItem = startNewFromItem;
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
window.openAdminLogin = openAdminLogin;
window.toggleAdminLogin = toggleAdminLogin;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.openMobileNav = openMobileNav;
window.closeMobileNav = closeMobileNav;
window.render = render;
