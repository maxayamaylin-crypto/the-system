const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "system-state.json");
const PORT = Number(process.env.PORT || 8766);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDataDir();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 15_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseJsonBody(body) {
  try {
    return JSON.parse(body || "{}");
  } catch {
    const err = new Error("Invalid JSON body");
    err.statusCode = 400;
    throw err;
  }
}

function send(res, status, data, headers = {}) {
  const isBuffer = Buffer.isBuffer(data);
  res.writeHead(status, {
    "Content-Type": isBuffer ? "application/octet-stream" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(isBuffer ? data : JSON.stringify(data));
}

function safeStaticPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const relative = clean === "/" ? "the-system.html" : clean.replace(/^\/+/, "");
  const full = path.resolve(ROOT, relative);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

function serveStatic(req, res) {
  const file = safeStaticPath(req.url);
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  fs.createReadStream(file).pipe(res);
}

function emptyState() {
  return {
    id: "local-system",
    updatedAt: null,
    revision: 0,
    appState: null,
    events: []
  };
}

function getMealsToday(appState) {
  const meals = appState?.nutritionLog?.meals;
  return Array.isArray(meals) ? meals : [];
}

function buildSummary(state) {
  const appState = state.appState || {};
  const meals = getMealsToday(appState);
  const sessions = appState.sessions && typeof appState.sessions === "object"
    ? Object.values(appState.sessions).reduce((sum,items) => sum + (Array.isArray(items) ? items.length : 0), 0)
    : 0;
  const totals = meals.reduce((sum, meal) => ({
    calories: sum.calories + Number(meal.calories || 0),
    protein: sum.protein + Number(meal.protein || 0),
    carbs: sum.carbs + Number(meal.carbs || 0),
    fat: sum.fat + Number(meal.fat || 0),
    sugar: sum.sugar + Number(meal.sugar || 0),
    fiber: sum.fiber + Number(meal.fiber || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 });
  return {
    id: state.id,
    revision: state.revision || 0,
    updatedAt: state.updatedAt,
    player: {
      name: appState.profile?.displayName || "Hunter Prime",
      level: appState.player?.level || 1,
      rank: appState.player?.rank || "E",
      totalXp: appState.player?.totalXp || 0,
      streak: appState.streak?.current || 0
    },
    counts: {
      mealsToday: meals.length,
      trainingSessions: sessions,
      ownedItems: appState.inventory?.owned?.length || 0,
      dungeonsCleared: appState.dungeons?.raidHistory?.length || 0,
      activeVaults: (appState.vaultContracts || []).filter(contract => contract.status === "active").length
    },
    nutrition: totals,
    economy: {
      gold: appState.economy?.gold || 0,
      impactPoints: appState.economy?.impactPoints || 0,
      guildPoints: appState.social?.guildPoints || 0
    },
    recentEvents: (state.events || []).slice(0, 10)
  };
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const state = readJson(STATE_FILE, emptyState());

  if (req.method === "GET" && url.pathname === "/api/health") {
    send(res, 200, { ok: true, service: "THE SYSTEM local API", time: new Date().toISOString() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    send(res, 200, state);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/summary") {
    send(res, 200, buildSummary(state));
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/state") {
    const body = await readBody(req);
    const payload = parseJsonBody(body);
    const next = {
      ...state,
      updatedAt: new Date().toISOString(),
      revision: (state.revision || 0) + 1,
      appState: payload.appState || payload
    };
    writeJson(STATE_FILE, next);
    send(res, 200, { ok: true, revision: next.revision, updatedAt: next.updatedAt });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/events") {
    const body = await readBody(req);
    const payload = parseJsonBody(body);
    const event = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      type: payload.type || "event",
      message: payload.message || "",
      data: payload.data || {}
    };
    state.events = [event, ...(state.events || [])].slice(0, 500);
    state.updatedAt = new Date().toISOString();
    writeJson(STATE_FILE, state);
    send(res, 200, { ok: true, event });
    return;
  }

  send(res, 404, { ok: false, error: "Unknown API route" });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (err) {
    send(res, err.statusCode || 500, { ok: false, error: err.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`THE SYSTEM local app running at http://localhost:${PORT}/the-system.html`);
});
