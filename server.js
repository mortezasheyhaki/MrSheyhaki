import "dotenv/config";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import { config } from "./multiplayer-server/src/config.js";
import { attachSocket } from "./multiplayer-server/src/socket.js";
import { roomManager } from "./multiplayer-server/src/rooms/roomManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.DEFAULT_APP_PORT || process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const ADMIN_STATE_FILE = "/tmp/mrsheyhaki-admin.json";
const ASSIGNMENT_STATE_FILE = "/tmp/mrsheyhaki-assignment.json";
const ASSIGNMENT_HISTORY_FILE = "/tmp/mrsheyhaki-assignment-history.json";
const ANNOUNCEMENT_STATE_FILE = "/tmp/mrsheyhaki-announcement.json";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_TOKENS = 200;

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonSafe(filePath, data, opts = {}) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding: "utf8", mode: 0o600, ...opts });
    return true;
  } catch {
    return false;
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash };
}

function verifyScrypt(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  const derived = crypto.scryptSync(String(password), record.salt, 64);
  const expected = Buffer.from(record.hash, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function timingSafeComparePlain(a, b) {
  const ha = crypto.createHash("sha256").update(String(a || "")).digest();
  const hb = crypto.createHash("sha256").update(String(b || "")).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function getEnvAdminPassword() {
  return String(process.env.ADMIN_PASSWORD || "").trim();
}

let storedAdminRecord = readJsonSafe(ADMIN_STATE_FILE, null);
let currentAssignment = readJsonSafe(ASSIGNMENT_STATE_FILE, null);
let assignmentHistory = readJsonSafe(ASSIGNMENT_HISTORY_FILE, []);
if (!Array.isArray(assignmentHistory)) assignmentHistory = [];
let currentAnnouncement = readJsonSafe(ANNOUNCEMENT_STATE_FILE, null);
const adminTokens = new Map();
const authAttempts = new Map();
const AUTH_WINDOW_MS = 5 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 15;

function getClientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket?.remoteAddress || "unknown";
}

function checkAuthRateLimit(req, res) {
  const now = Date.now();
  const ip = getClientIp(req);
  const entry = authAttempts.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= AUTH_MAX_ATTEMPTS) {
      res.status(429).json({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." });
      return false;
    }
    entry.count += 1;
  } else {
    if (authAttempts.size > 500) {
      for (const [k, v] of authAttempts.entries()) {
        if (now >= v.resetAt) authAttempts.delete(k);
      }
    }
    authAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
  }
  return true;
}

function clearAuthRateLimit(req) {
  authAttempts.delete(getClientIp(req));
}

function isAdminSetupNeeded() {
  return !getEnvAdminPassword() && !(storedAdminRecord && storedAdminRecord.hash);
}

function pruneExpiredTokens() {
  const now = Date.now();
  for (const [tok, exp] of adminTokens.entries()) {
    if (now > exp) adminTokens.delete(tok);
  }
}

function issueAdminToken() {
  pruneExpiredTokens();
  if (adminTokens.size >= MAX_TOKENS) {
    const oldestKey = adminTokens.keys().next().value;
    if (oldestKey) adminTokens.delete(oldestKey);
  }
  const token = crypto.randomBytes(24).toString("hex");
  adminTokens.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function extractBearerToken(req) {
  const auth = String(req.headers.authorization || "");
  if (!auth.toLowerCase().startsWith("bearer ")) return "";
  return auth.slice(7).trim();
}

function isTokenValid(token) {
  if (!token) return false;
  const expiresAt = adminTokens.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

function requireAdminAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!isTokenValid(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized. Please sign in again." });
  }
  return next();
}

function sanitizeSafeUrl(rawUrl) {
  const s = String(rawUrl || "").trim().slice(0, 240);
  if (!s) return "/learningarcade/";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const parsed = new URL(s);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString().slice(0, 240);
    }
  } catch {
    // Fall through to default safe path
  }
  return "/learningarcade/";
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inferCategory(gameId, explicitCategory) {
  const raw = String(explicitCategory || "").trim();
  const low = raw.toLowerCase();
  if (raw && low !== "general" && low !== "starter" && low !== "starter course" && low !== "tactics-for-listening") {
    if (low === "vocab") return "Vocabulary";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  const id = String(gameId || "").toLowerCase();
  if (id.includes("pronunciation") || id.includes("plural-s-") || id.includes("three-sounds")) return "Pronunciation";
  if (id.startsWith("tfl-") || id.startsWith("listening-") || id.includes("listen-") || id.includes("sound-match") || id.includes("dictation")) return "Listening";
  if (id.startsWith("speaking-") || id.includes("-roleplay") || id.includes("-speaking")) return "Speaking";
  if (id.startsWith("reading-") || id.includes("-reading")) return "Reading";
  if (id.startsWith("writing-") || id.includes("-write") || id.includes("-writing")) return "Writing";
  if (id.startsWith("vocab-") || id.includes("flashcards") || id.includes("match-rush") || id.includes("opposite-snap") || id.includes("-match") || id.includes("unscramble")) return "Vocabulary";
  if (id.startsWith("grammar-") || id === "be-verbs" || id === "nouns" || id === "there-is-there-are" || id === "simple-present" || id === "simple-past" || id === "present-perfect" || id.includes("-sentences") || id.includes("-question")) return "Grammar";
  if (id.startsWith("topics-")) return "Topics";
  return "General";
}

function prettyName(id) {
  return String(id || "Game")
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function parseTimestampMs(val) {
  if (val == null || val === "") return 0;
  if (typeof val === "number" && Number.isFinite(val)) return val > 1e12 ? val : val * 1000;
  const n = Number(val);
  if (Number.isFinite(n) && n > 0) return n > 1e12 ? n : n * 1000;
  const parsed = Date.parse(String(val));
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeDailyStreak(timestamps) {
  if (!timestamps || !timestamps.length) return { current: 0, best: 0 };
  const days = new Set();
  for (const ms of timestamps) {
    if (ms > 0) days.add(new Date(ms).toISOString().slice(0, 10));
  }
  const sorted = Array.from(days).sort();
  if (!sorted.length) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = Date.parse(sorted[i - 1] + "T00:00:00Z");
    const curr = Date.parse(sorted[i] + "T00:00:00Z");
    if (curr - prev === 86400000) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastDay = sorted[sorted.length - 1];
  let current = 0;
  if (lastDay === todayStr || lastDay === yesterdayStr) {
    current = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      const curr = Date.parse(sorted[i] + "T00:00:00Z");
      const prev = Date.parse(sorted[i - 1] + "T00:00:00Z");
      if (curr - prev === 86400000) current += 1;
      else break;
    }
  }

  return { current, best };
}

function getSupabaseServerClient() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isAllowedOrigin(origin, reqHost) {
  if (!origin) return true;
  if (config.corsOrigins.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (reqHost && u.host === reqHost) {
      return true;
    }
    if (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname.endsWith(".run.app") ||
      u.hostname.endsWith(".googleusercontent.com") ||
      u.hostname.endsWith(".scf.usercontent.goog")
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

const app = express();
app.disable("x-powered-by");

app.use(
  cors((req, cb) => {
    const origin = req.headers.origin;
    const reqHost = req.headers.host;
    if (isAllowedOrigin(origin, reqHost)) {
      return cb(null, {
        origin: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      });
    }
    return cb(new Error("Not allowed by CORS"));
  })
);

app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    phase: 4,
    service: "mrsheyhaki-web",
    time: new Date().toISOString(),
    rooms: roomManager.stats().rooms,
    supabaseConfigured: Boolean(
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !config.supabaseAnonKey.includes("your_anon")
    ),
  });
});

// Room metadata lookup so /j/:code and /multiplayer/ quick-join route to the right game
app.get("/api/rooms/:code", (req, res) => {
  const room = roomManager.getRoomByCode(req.params.code);
  if (!room) {
    return res.status(404).json({ ok: false, error: "Room not found" });
  }
  return res.json({
    ok: true,
    code: room.code,
    gameType: room.gameType || "a-an-swipe",
    status: room.status,
    playerCount: Array.isArray(room.players) ? room.players.length : 0,
    maxPlayers: room.maxPlayers,
  });
});

const LEADERBOARD_RANKS = [
  { tier: 1, name: "Bronze Novice", icon: "🥉", minXp: 0 },
  { tier: 2, name: "Silver Explorer", icon: "🥈", minXp: 150 },
  { tier: 3, name: "Gold Challenger", icon: "🥇", minXp: 450 },
  { tier: 4, name: "Platinum Scholar", icon: "💠", minXp: 1000 },
  { tier: 5, name: "Diamond Legend", icon: "👑", minXp: 2000 },
];

function rankForXp(xp) {
  let cur = LEADERBOARD_RANKS[0];
  for (const r of LEADERBOARD_RANKS) {
    if (xp >= r.minXp) cur = r;
  }
  return cur;
}

function splitNameAndClass(rawName) {
  const clean = String(rawName || "").trim();
  const idx = clean.indexOf(" · ");
  if (idx > 0) {
    return {
      name: clean.slice(0, idx).trim(),
      classCode: clean.slice(idx + 3).trim().slice(0, 16),
    };
  }
  return { name: clean, classCode: "" };
}

let leaderboardCache = { at: 0, payload: null };
const LEADERBOARD_CACHE_TTL_MS = 15000;

async function buildUnifiedLeaderboard() {
  const sb = getSupabaseServerClient();
  if (!sb) {
    return {
      ok: true,
      generatedAt: Date.now(),
      overall: [],
      games: {},
      gameList: [],
      classes: [],
      summary: { players: 0, games: 0, totalPlays: 0, totalStars: 0 },
    };
  }

  const [profRes, progRes, scoreRes] = await Promise.allSettled([
    sb.from("profiles").select("id,username,display_name,created_at").limit(1000),
    sb.from("game_progress").select("user_id,game_id,game_name,category,stars,plays,best_score,max_score,best_accuracy,completed,last_at").limit(3000),
    sb.from("scores").select("id,name,score,max_score,game_id,game_name,user_id,time_ms,at,created_at").order("at", { ascending: false }).limit(1500),
  ]);

  const profiles = profRes.status === "fulfilled" && !profRes.value.error ? (profRes.value.data || []) : [];
  const progressRows = progRes.status === "fulfilled" && !progRes.value.error ? (progRes.value.data || []) : [];
  const scoreRows = scoreRes.status === "fulfilled" && !scoreRes.value.error ? (scoreRes.value.data || []) : [];

  const profileById = new Map();
  for (const p of profiles) {
    if (!p || !p.id) continue;
    profileById.set(p.id, {
      id: p.id,
      username: String(p.username || "").trim(),
      displayName: String(p.display_name || p.username || "Player").trim(),
    });
  }

  const players = new Map();
  const gameCatalog = new Map();

  function ensurePlayer(key, info) {
    if (!players.has(key)) {
      players.set(key, {
        key,
        userId: info.userId || null,
        name: info.name || "Player",
        username: info.username || "",
        classCode: info.classCode || "",
        registered: Boolean(info.registered),
        games: new Map(),
        dates: [],
        lastActiveAt: 0,
      });
    } else {
      const pl = players.get(key);
      if (info.name && (pl.name === "Player" || pl.name.startsWith("Student "))) pl.name = info.name;
      if (info.username && !pl.username) pl.username = info.username;
      if (info.classCode && !pl.classCode) pl.classCode = info.classCode;
      if (info.registered) pl.registered = true;
    }
    return players.get(key);
  }

  function ensureGameCatalog(gameId, gameName, category) {
    const gid = String(gameId || "").trim();
    if (!gid) return null;
    if (!gameCatalog.has(gid)) {
      gameCatalog.set(gid, {
        id: gid,
        title: (gameName && gameName !== gid) ? String(gameName).trim() : prettyName(gid),
        category: inferCategory(gid, category),
      });
    } else {
      const gc = gameCatalog.get(gid);
      if (gameName && gameName !== gid && gc.title === prettyName(gid)) {
        gc.title = String(gameName).trim();
      }
      if (category && gc.category === "General") {
        gc.category = inferCategory(gid, category);
      }
    }
    return gameCatalog.get(gid);
  }

  function ensurePlayerGame(player, gid) {
    if (!player.games.has(gid)) {
      player.games.set(gid, {
        gameId: gid,
        stars: 0,
        plays: 0,
        bestScore: 0,
        maxScore: 0,
        accuracy: 0,
        bestTimeMs: 0,
        completed: false,
        lastAt: 0,
      });
    }
    return player.games.get(gid);
  }

  for (const r of progressRows) {
    if (!r || !r.user_id || !r.game_id) continue;
    const prof = profileById.get(r.user_id);
    const player = ensurePlayer("u:" + r.user_id, {
      userId: r.user_id,
      name: prof ? prof.displayName : ("Student " + String(r.user_id).slice(0, 6)),
      username: prof ? prof.username : "",
      registered: true,
    });
    const gid = String(r.game_id).trim();
    ensureGameCatalog(gid, r.game_name, r.category);

    const lastAt = parseTimestampMs(r.last_at);
    if (lastAt > 0) {
      player.dates.push(lastAt);
      if (lastAt > player.lastActiveAt) player.lastActiveAt = lastAt;
    }

    const g = ensurePlayerGame(player, gid);
    g.stars = Math.max(g.stars, Math.min(3, Number(r.stars) || 0));
    g.plays = Math.max(g.plays, Number(r.plays) || 0);
    g.bestScore = Math.max(g.bestScore, Number(r.best_score) || 0);
    g.maxScore = Math.max(g.maxScore, Number(r.max_score) || 0);
    g.accuracy = Math.max(g.accuracy, Number(r.best_accuracy) || 0);
    g.completed = Boolean(g.completed || r.completed || g.stars > 0);
    if (lastAt > g.lastAt) g.lastAt = lastAt;
  }

  for (const s of scoreRows) {
    if (!s || !s.game_id) continue;
    const gid = String(s.game_id).trim();
    const parsedName = splitNameAndClass(s.name);
    const prof = s.user_id ? profileById.get(s.user_id) : null;
    const pKey = s.user_id
      ? ("u:" + s.user_id)
      : ("g:" + (parsedName.name || "guest").toLowerCase() + (parsedName.classCode ? "|" + parsedName.classCode.toLowerCase() : ""));

    const player = ensurePlayer(pKey, {
      userId: s.user_id || null,
      name: (prof && prof.displayName) || parsedName.name || "Player",
      username: (prof && prof.username) || "",
      classCode: parsedName.classCode,
      registered: Boolean(s.user_id),
    });

    ensureGameCatalog(gid, s.game_name, null);

    const at = parseTimestampMs(s.at) || parseTimestampMs(s.created_at);
    if (at > 0) {
      player.dates.push(at);
      if (at > player.lastActiveAt) player.lastActiveAt = at;
    }

    const scoreVal = Math.max(0, Number(s.score) || 0);
    const maxVal = s.max_score != null ? Math.max(0, Number(s.max_score) || 0) : 0;
    const pct = maxVal > 0 ? Math.min(100, Math.round((scoreVal / maxVal) * 100)) : 0;
    const inferredStars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    const timeMs = s.time_ms != null && Number(s.time_ms) > 0 ? Math.round(Number(s.time_ms)) : 0;

    const g = ensurePlayerGame(player, gid);
    if (scoreVal > g.bestScore) {
      g.bestScore = scoreVal;
      if (maxVal > 0) g.maxScore = maxVal;
    } else if (maxVal > g.maxScore) {
      g.maxScore = maxVal;
    }
    if (pct > g.accuracy) g.accuracy = pct;
    if (inferredStars > g.stars) g.stars = inferredStars;
    if (timeMs > 0 && (g.bestTimeMs === 0 || timeMs < g.bestTimeMs)) g.bestTimeMs = timeMs;
    if (g.plays === 0) g.plays = 1;
    g.completed = Boolean(g.completed || scoreVal > 0);
    if (at > g.lastAt) g.lastAt = at;
  }

  const overall = [];
  const gamesMap = new Map();
  const classSet = new Set();
  let sumPlays = 0;
  let sumStars = 0;

  for (const player of players.values()) {
    if (player.games.size === 0) continue;
    if (player.classCode) classSet.add(player.classCode);

    let totalStars = 0;
    let totalPlays = 0;
    let totalScore = 0;
    let threeStarGames = 0;
    let accSum = 0;
    let accCount = 0;

    for (const [gid, g] of player.games.entries()) {
      totalStars += g.stars;
      totalPlays += g.plays;
      const effectivePoints = g.bestScore > 0 ? g.bestScore : (g.stars * 10 + (g.completed ? 5 : 0));
      totalScore += effectivePoints;
      if (g.stars >= 3) threeStarGames += 1;
      if (g.accuracy > 0) {
        accSum += g.accuracy;
        accCount += 1;
      }

      if (!gamesMap.has(gid)) gamesMap.set(gid, []);
      gamesMap.get(gid).push({
        key: player.key,
        userId: player.userId,
        name: player.name,
        username: player.username,
        classCode: player.classCode,
        registered: player.registered,
        score: g.bestScore > 0 ? g.bestScore : effectivePoints,
        rawScore: g.bestScore,
        maxScore: g.maxScore,
        accuracy: g.accuracy,
        stars: g.stars,
        plays: g.plays,
        timeMs: g.bestTimeMs || null,
        lastAt: g.lastAt,
      });
    }

    const avgAccuracy = accCount > 0 ? Math.round(accSum / accCount) : 0;
    const streak = computeDailyStreak(player.dates);
    const uniqueGames = player.games.size;
    const playsXp = totalPlays * 12;
    const varietyXp = uniqueGames * 40;
    const starsXp = totalStars * 25 + threeStarGames * 35;
    const accBonus = accCount >= 2 ? (avgAccuracy >= 90 ? 140 : avgAccuracy >= 80 ? 80 : avgAccuracy >= 70 ? 40 : 0) : 0;
    const streakXp = (streak.best || 0) * 15;
    const xp = playsXp + varietyXp + starsXp + accBonus + streakXp;
    const rank = rankForXp(xp);

    sumPlays += totalPlays;
    sumStars += totalStars;

    overall.push({
      key: player.key,
      userId: player.userId,
      name: player.name,
      username: player.username,
      classCode: player.classCode,
      registered: player.registered,
      xp,
      rankTier: rank.tier,
      rankName: rank.name,
      rankIcon: rank.icon,
      totalStars,
      gamesPlayed: uniqueGames,
      totalPlays,
      avgAccuracy,
      totalScore,
      streakCurrent: streak.current,
      streakBest: streak.best,
      lastActiveAt: player.lastActiveAt,
    });
  }

  overall.sort((a, b) =>
    b.xp - a.xp ||
    b.totalStars - a.totalStars ||
    b.gamesPlayed - a.gamesPlayed ||
    b.avgAccuracy - a.avgAccuracy ||
    a.name.localeCompare(b.name)
  );

  const games = {};
  const gameList = [];
  for (const [gid, rows] of gamesMap.entries()) {
    rows.sort((a, b) =>
      b.stars - a.stars ||
      b.accuracy - a.accuracy ||
      b.score - a.score ||
      (a.timeMs || 1e9) - (b.timeMs || 1e9) ||
      b.plays - a.plays ||
      a.name.localeCompare(b.name)
    );
    games[gid] = rows.slice(0, 100);
    const meta = gameCatalog.get(gid) || { id: gid, title: prettyName(gid), category: inferCategory(gid) };
    gameList.push({
      id: gid,
      title: meta.title,
      category: meta.category,
      players: rows.length,
      totalPlays: rows.reduce((acc, r) => acc + (r.plays || 0), 0),
    });
  }

  gameList.sort((a, b) => b.players - a.players || b.totalPlays - a.totalPlays || a.title.localeCompare(b.title));

  return {
    ok: true,
    generatedAt: Date.now(),
    overall: overall.slice(0, 150),
    games,
    gameList,
    classes: Array.from(classSet).sort(),
    summary: {
      players: overall.length,
      games: gameList.length,
      totalPlays: sumPlays,
      totalStars: sumStars,
    },
  };
}

app.get("/api/leaderboard", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const force = req.query.refresh === "1";
    const now = Date.now();
    if (!force && leaderboardCache.payload && now - leaderboardCache.at < LEADERBOARD_CACHE_TTL_MS) {
      return res.json(leaderboardCache.payload);
    }
    const payload = await buildUnifiedLeaderboard();
    leaderboardCache = { at: Date.now(), payload };
    return res.json(payload);
  } catch {
    return res.status(500).json({ ok: false, error: "Could not load leaderboard right now." });
  }
});

app.get("/api/assignments", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    ok: true,
    assignment: currentAssignment || null,
  });
});

app.post("/api/assignments", requireAdminAuth, (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (body.clear) {
    currentAssignment = null;
    writeJsonSafe(ASSIGNMENT_STATE_FILE, null);
    return res.json({ ok: true, assignment: null });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (!rawItems.length) {
    return res.status(400).json({ ok: false, error: "Select at least 1 game to assign." });
  }

  const items = rawItems
    .slice(0, 24)
    .map((it) => {
      if (!it) return null;
      const id = String(typeof it === "string" ? it : it.id || "").trim().slice(0, 128);
      if (!id) return null;
      return {
        id,
        title: String(it.title || prettyName(id)).trim().slice(0, 120),
        category: String(it.category || inferCategory(id)).trim().slice(0, 48),
        course: String(it.course || "").trim().slice(0, 80),
        url: sanitizeSafeUrl(it.url),
      };
    })
    .filter(Boolean);

  if (!items.length) {
    return res.status(400).json({ ok: false, error: "Select at least 1 valid game." });
  }

  currentAssignment = {
    id: "hw-" + Date.now(),
    title: String(body.title || "This Week's Assigned Games").trim().slice(0, 80) || "This Week's Assigned Games",
    note: String(body.note || "").trim().slice(0, 180),
    updatedAt: Date.now(),
    items,
  };
  writeJsonSafe(ASSIGNMENT_STATE_FILE, currentAssignment);

  const sig = currentAssignment.title + "|" + items.map((i) => i.id).join(",");
  assignmentHistory = [
    currentAssignment,
    ...assignmentHistory.filter((h) => h && (h.title + "|" + (h.items || []).map((i) => i.id).join(",")) !== sig),
  ].slice(0, 10);
  writeJsonSafe(ASSIGNMENT_HISTORY_FILE, assignmentHistory);

  return res.json({ ok: true, assignment: currentAssignment, assignmentHistory });
});

app.get("/api/announcement", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    ok: true,
    announcement: currentAnnouncement || null,
  });
});

app.post("/api/admin/announcement", requireAdminAuth, (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (body.clear) {
    currentAnnouncement = null;
    writeJsonSafe(ANNOUNCEMENT_STATE_FILE, null);
    return res.json({ ok: true, announcement: null });
  }
  const title = String(body.title || "").trim().slice(0, 90);
  const message = String(body.message || "").trim().slice(0, 320);
  if (!title && !message) {
    return res.status(400).json({ ok: false, error: "Enter a headline or message for the announcement." });
  }
  const rawLevel = String(body.level || "info").toLowerCase();
  const level = rawLevel === "reminder" || rawLevel === "alert" ? rawLevel : "info";
  const rawLinkUrl = String(body.linkUrl || "").trim();
  const linkUrl = rawLinkUrl ? sanitizeSafeUrl(rawLinkUrl) : "";
  const linkText = linkUrl ? String(body.linkText || "Open link").trim().slice(0, 48) : "";

  currentAnnouncement = {
    id: "ann-" + Date.now(),
    title: title || "Class Update",
    message,
    level,
    linkUrl,
    linkText,
    updatedAt: Date.now(),
  };
  writeJsonSafe(ANNOUNCEMENT_STATE_FILE, currentAnnouncement);
  return res.json({ ok: true, announcement: currentAnnouncement });
});

app.get("/api/admin/rooms", requireAdminAuth, (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const list = roomManager.listRooms();
  return res.json({ ok: true, rooms: list });
});

app.post("/api/admin/rooms/:code/close", requireAdminAuth, (req, res) => {
  const rawCode = String(req.params.code || "").trim().toUpperCase();
  if (!rawCode) {
    return res.status(400).json({ ok: false, error: "Invalid room code." });
  }
  const result = roomManager.closeRoomByCode(rawCode);
  if (!result.ok) {
    return res.status(404).json(result);
  }
  try {
    const channel = `room:${result.code}`;
    io.to(channel).emit("room:error", { error: "Room closed by teacher." });
    io.in(channel).socketsLeave(channel);
  } catch {
    // Ignore socket cleanup failures
  }
  return res.json({ ok: true, closedCode: result.code, rooms: roomManager.listRooms() });
});

app.post("/api/admin/cache/clear", requireAdminAuth, (_req, res) => {
  leaderboardCache = { at: 0, payload: null };
  return res.json({ ok: true });
});

app.get("/api/admin/updated-files.zip", requireAdminAuth, (_req, res) => {
  const zipPath = path.join(__dirname, "exports", "updated-files.zip");
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ ok: false, error: "Updated files archive not found." });
  }
  return res.download(zipPath, "mrsheyhaki-updated-files.zip");
});

const ZIP_DOWNLOAD_TOKEN_FILE = "/tmp/mrsheyhaki-zip-token.json";

app.get("/download/updated-files/:token", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const provided = typeof req.params.token === "string" ? req.params.token.trim() : "";
  const record = readJsonSafe(ZIP_DOWNLOAD_TOKEN_FILE);
  if (
    !provided ||
    !record ||
    typeof record.token !== "string" ||
    !record.expiresAt ||
    Date.now() > Number(record.expiresAt)
  ) {
    return res.status(404).send("Download link expired or invalid.");
  }
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(record.token, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(404).send("Download link expired or invalid.");
  }
  const zipPath = path.join(__dirname, "exports", "updated-files.zip");
  if (!fs.existsSync(zipPath)) {
    return res.status(404).send("Archive not found.");
  }
  return res.download(zipPath, "mrsheyhaki-updated-files.zip");
});

app.post("/api/admin/sessions/revoke-others", requireAdminAuth, (req, res) => {
  const token = extractBearerToken(req);
  const expiresAt = adminTokens.get(token);
  adminTokens.clear();
  if (token && expiresAt) {
    adminTokens.set(token, expiresAt);
  }
  return res.json({ ok: true, activeSessionCount: adminTokens.size });
});

app.post("/api/admin/change-password", requireAdminAuth, (req, res) => {
  if (getEnvAdminPassword()) {
    return res.status(400).json({
      ok: false,
      error: "Admin password is managed by the ADMIN_PASSWORD environment secret.",
    });
  }
  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (!currentPassword || !verifyScrypt(currentPassword, storedAdminRecord)) {
    return res.status(401).json({ ok: false, error: "Current password is incorrect." });
  }
  if (newPassword.length < 8 || newPassword.length > 256) {
    return res.status(400).json({ ok: false, error: "New password must be between 8 and 256 characters." });
  }
  const nextRecord = hashPassword(newPassword);
  storedAdminRecord = nextRecord;
  writeJsonSafe(ADMIN_STATE_FILE, nextRecord);
  const currentToken = extractBearerToken(req);
  const exp = adminTokens.get(currentToken);
  adminTokens.clear();
  if (currentToken && exp) adminTokens.set(currentToken, exp);
  return res.json({ ok: true });
});

app.get("/api/admin/status", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  pruneExpiredTokens();
  const token = extractBearerToken(req);
  const authenticated = isTokenValid(token);
  const authMode = getEnvAdminPassword() ? "env" : (isAdminSetupNeeded() ? "unconfigured" : "local");
  return res.json({
    ok: true,
    needsSetup: isAdminSetupNeeded(),
    authenticated,
    authMode,
    sessionExpiresAt: authenticated ? adminTokens.get(token) : null,
    activeSessionCount: authenticated ? adminTokens.size : 0,
  });
});

app.post("/api/admin/setup", (req, res) => {
  if (!checkAuthRateLimit(req, res)) return;
  if (!isAdminSetupNeeded()) {
    return res.status(409).json({ ok: false, error: "Admin password is already set." });
  }
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (password.length < 8 || password.length > 256) {
    return res.status(400).json({ ok: false, error: "Password must be between 8 and 256 characters." });
  }
  const nextRecord = hashPassword(password);
  const created = writeJsonSafe(ADMIN_STATE_FILE, nextRecord, { flag: "wx" });
  if (!created && fs.existsSync(ADMIN_STATE_FILE)) {
    storedAdminRecord = readJsonSafe(ADMIN_STATE_FILE, storedAdminRecord);
    return res.status(409).json({ ok: false, error: "Admin password is already set." });
  }
  storedAdminRecord = nextRecord;
  clearAuthRateLimit(req);
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/login", (req, res) => {
  if (!checkAuthRateLimit(req, res)) return;
  if (isAdminSetupNeeded()) {
    return res.status(400).json({
      ok: false,
      needsSetup: true,
      error: "Admin password has not been configured yet.",
    });
  }
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || password.length > 256) {
    return res.status(400).json({ ok: false, error: "Enter the admin password." });
  }
  const envPw = getEnvAdminPassword();
  const valid = envPw
    ? timingSafeComparePlain(password, envPw)
    : verifyScrypt(password, storedAdminRecord);

  if (!valid) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }
  clearAuthRateLimit(req);
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/logout", (req, res) => {
  const token = extractBearerToken(req);
  if (token) adminTokens.delete(token);
  return res.json({ ok: true });
});

app.get("/api/admin/activity", requireAdminAuth, async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const WEEK_MS = 7 * DAY_MS;
  const warnings = [];

  const sb = getSupabaseServerClient();
  let profiles = [];
  let progressRows = [];
  let scoreRows = [];

  if (!sb) {
    warnings.push("Supabase is not configured.");
  } else {
    const [profRes, progRes, scoreRes] = await Promise.allSettled([
      sb.from("profiles").select("id,username,display_name,created_at").order("created_at", { ascending: false }).limit(500),
      sb.from("game_progress").select("*").order("last_at", { ascending: false }).limit(2000),
      sb.from("scores").select("*").order("at", { ascending: false }).limit(1000),
    ]);

    if (profRes.status === "fulfilled") {
      if (profRes.value.error) warnings.push(`profiles: ${profRes.value.error.message}`);
      else profiles = profRes.value.data || [];
    } else {
      warnings.push("Could not query profiles table.");
    }

    if (progRes.status === "fulfilled") {
      if (progRes.value.error) warnings.push(`game_progress: ${progRes.value.error.message}`);
      else progressRows = progRes.value.data || [];
    } else {
      warnings.push("Could not query game_progress table.");
    }

    if (scoreRes.status === "fulfilled") {
      if (scoreRes.value.error) warnings.push(`scores: ${scoreRes.value.error.message}`);
      else scoreRows = scoreRes.value.data || [];
    } else {
      warnings.push("Could not query scores table.");
    }
  }

  const studentMap = new Map();

  function ensureStudent(key, defaults) {
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        key,
        userId: defaults.userId || null,
        displayName: defaults.displayName || defaults.username || "Student",
        username: defaults.username || "",
        classCode: defaults.classCode || "",
        registered: Boolean(defaults.registered),
        joinedAt: defaults.joinedAt || 0,
        lastActiveAt: 0,
        active24h: false,
        active7d: false,
        totalStars: 0,
        gamesPlayed: 0,
        completedGames: 0,
        totalPlays: 0,
        avgAccuracy: 0,
        totalScore: 0,
        streak: { current: 0, best: 0 },
        gamesMap: new Map(),
        recentScores: [],
        activityDates: [],
      });
    } else if (defaults.classCode && !studentMap.get(key).classCode) {
      studentMap.get(key).classCode = defaults.classCode;
    }
    return studentMap.get(key);
  }

  function ensureGameEntry(student, gameId, gameName, category) {
    const gid = String(gameId || "game");
    if (!student.gamesMap.has(gid)) {
      student.gamesMap.set(gid, {
        id: gid,
        name: gameName || prettyName(gid),
        category: inferCategory(gid, category),
        stars: 0,
        bestScore: 0,
        maxScore: 0,
        bestTimeMs: 0,
        accuracy: 0,
        plays: 0,
        completed: false,
        lastAt: 0,
      });
    } else {
      const g = student.gamesMap.get(gid);
      if (gameName && (!g.name || g.name === gid)) g.name = gameName;
      if (category && g.category === "General") g.category = inferCategory(gid, category);
    }
    return student.gamesMap.get(gid);
  }

  for (const p of profiles) {
    if (!p || !p.id) continue;
    const key = "reg:" + p.id;
    const joinedAt = parseTimestampMs(p.created_at);
    const parsedProf = splitNameAndClass(p.display_name || p.username || "Student");
    ensureStudent(key, {
      userId: p.id,
      displayName: parsedProf.name || p.username || "Student",
      username: p.username || "",
      classCode: parsedProf.classCode,
      registered: true,
      joinedAt,
    });
  }

  for (const r of progressRows) {
    if (!r || !r.user_id) continue;
    const key = "reg:" + r.user_id;
    const student = ensureStudent(key, {
      userId: r.user_id,
      displayName: "Student " + String(r.user_id).slice(0, 6),
      username: "",
      classCode: "",
      registered: true,
      joinedAt: 0,
    });
    const lastAt = parseTimestampMs(r.last_at);
    if (lastAt > 0) student.activityDates.push(lastAt);
    if (lastAt > student.lastActiveAt) student.lastActiveAt = lastAt;

    const g = ensureGameEntry(student, r.game_id, r.game_name, r.category);
    g.stars = Math.max(g.stars, Math.min(3, Number(r.stars) || 0));
    g.bestScore = Math.max(g.bestScore, Number(r.best_score) || 0);
    g.maxScore = Math.max(g.maxScore, Number(r.max_score) || 0);
    g.accuracy = Math.max(g.accuracy, Number(r.best_accuracy) || 0);
    g.plays = Math.max(g.plays, Number(r.plays) || 0);
    g.completed = Boolean(g.completed || r.completed || g.stars > 0);
    if (lastAt > g.lastAt) g.lastAt = lastAt;
  }

  const recentActivity = [];

  for (const s of scoreRows) {
    if (!s) continue;
    const at = parseTimestampMs(s.at) || parseTimestampMs(s.created_at);
    const gid = s.game_id || "game";
    const gname = s.game_name || prettyName(gid);
    const score = Number(s.score) || 0;
    const maxScore = s.max_score != null ? Number(s.max_score) : 0;
    const timeMs = s.time_ms != null ? Number(s.time_ms) : 0;
    const accuracy = maxScore > 0 ? Math.max(0, Math.min(100, Math.round((score / maxScore) * 100))) : null;
    const parsedScore = splitNameAndClass(s.name);

    let student;
    if (s.user_id) {
      student = ensureStudent("reg:" + s.user_id, {
        userId: s.user_id,
        displayName: parsedScore.name || "Student",
        username: "",
        classCode: parsedScore.classCode,
        registered: true,
        joinedAt: at,
      });
    } else {
      const cleanName = parsedScore.name || "Guest";
      const gKey = "guest:" + cleanName.toLowerCase() + (parsedScore.classCode ? "|" + parsedScore.classCode.toLowerCase() : "");
      student = ensureStudent(gKey, {
        displayName: cleanName,
        username: "",
        classCode: parsedScore.classCode,
        registered: false,
        joinedAt: at,
      });
    }

    if (at > 0) student.activityDates.push(at);
    if (at > student.lastActiveAt) student.lastActiveAt = at;

    const g = ensureGameEntry(student, gid, gname, null);
    if (score >= g.bestScore) {
      g.bestScore = score;
      if (maxScore > 0) g.maxScore = maxScore;
    } else if (maxScore > g.maxScore) {
      g.maxScore = maxScore;
    }
    if (timeMs > 0 && (g.bestTimeMs === 0 || timeMs < g.bestTimeMs)) {
      g.bestTimeMs = timeMs;
    }
    if (accuracy != null && accuracy > g.accuracy) {
      g.accuracy = accuracy;
    }
    if (!student.registered) {
      g.plays += 1;
    } else if (g.plays === 0) {
      g.plays = 1;
    }
    if (at > g.lastAt) g.lastAt = at;

    student.recentScores.push({
      gameId: gid,
      gameName: gname,
      score,
      maxScore,
      timeMs,
      accuracy,
      at,
    });

    recentActivity.push({
      studentKey: student.key,
      studentName: student.displayName,
      classCode: student.classCode || "",
      gameId: gid,
      gameName: gname,
      category: g.category,
      score,
      maxScore,
      timeMs,
      accuracy,
      at,
    });
  }

  recentActivity.sort((a, b) => b.at - a.at);

  const gameAgg = new Map();
  const skillAgg = new Map();
  const classSet = new Set();
  const pulseDays = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    pulseDays.set(key, {
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      submissions: 0,
      activeKeys: new Set(),
    });
  }
  for (const act of recentActivity) {
    if (!act.at) continue;
    const key = new Date(act.at).toISOString().slice(0, 10);
    const bucket = pulseDays.get(key);
    if (bucket) {
      bucket.submissions += 1;
      bucket.activeKeys.add(act.studentKey);
    }
  }

  let registeredCount = 0;
  let guestCount = 0;
  let active7dCount = 0;
  let active24hCount = 0;
  let inactiveCount = 0;
  let totalPlays = 0;
  let totalStars = 0;
  let classAccSum = 0;
  let classAccCount = 0;

  const students = Array.from(studentMap.values()).map((st) => {
    const games = Array.from(st.gamesMap.values()).sort((a, b) => b.lastAt - a.lastAt);
    st.recentScores.sort((a, b) => b.at - a.at);
    if (st.classCode) classSet.add(st.classCode);

    for (const ms of st.activityDates) {
      if (!ms) continue;
      const dKey = new Date(ms).toISOString().slice(0, 10);
      const bucket = pulseDays.get(dKey);
      if (bucket) bucket.activeKeys.add(st.key);
    }

    let stStars = 0;
    let stPlays = 0;
    let stCompleted = 0;
    let stScore = 0;
    let threeStarGames = 0;
    let accSum = 0;
    let accCnt = 0;

    for (const g of games) {
      stStars += g.stars;
      stPlays += g.plays;
      if (g.stars >= 3) threeStarGames += 1;
      if (g.completed || g.stars > 0) stCompleted += 1;
      stScore += g.bestScore;
      if (g.accuracy > 0) {
        accSum += g.accuracy;
        accCnt += 1;
        classAccSum += g.accuracy;
        classAccCount += 1;
      }

      if (!gameAgg.has(g.id)) {
        gameAgg.set(g.id, {
          id: g.id,
          name: g.name,
          category: g.category,
          players: 0,
          completedPlayers: 0,
          totalPlays: 0,
          totalStars: 0,
          accSum: 0,
          accCnt: 0,
          lastAt: 0,
        });
      }
      const agg = gameAgg.get(g.id);
      agg.players += 1;
      if (g.completed || g.stars > 0) agg.completedPlayers += 1;
      agg.totalPlays += g.plays || 1;
      agg.totalStars += g.stars || 0;
      if (g.lastAt > agg.lastAt) agg.lastAt = g.lastAt;
      if (g.accuracy > 0) {
        agg.accSum += g.accuracy;
        agg.accCnt += 1;
      }

      const sk = g.category || "General";
      if (!skillAgg.has(sk)) {
        skillAgg.set(sk, {
          skill: sk,
          gamesSet: new Set(),
          playersSet: new Set(),
          totalPlays: 0,
          totalStars: 0,
          accSum: 0,
          accCnt: 0,
        });
      }
      const sAgg = skillAgg.get(sk);
      sAgg.gamesSet.add(g.id);
      sAgg.playersSet.add(st.key);
      sAgg.totalPlays += g.plays || 1;
      sAgg.totalStars += g.stars || 0;
      if (g.accuracy > 0) {
        sAgg.accSum += g.accuracy;
        sAgg.accCnt += 1;
      }
    }

    const active24h = st.lastActiveAt > 0 && now - st.lastActiveAt <= DAY_MS;
    const active7d = st.lastActiveAt > 0 && now - st.lastActiveAt <= WEEK_MS;
    const streak = computeDailyStreak(st.activityDates);
    const avgAccuracy = accCnt ? Math.round(accSum / accCnt) : 0;
    const playsXp = stPlays * 12;
    const varietyXp = games.length * 40;
    const starsXp = stStars * 25 + threeStarGames * 35;
    const accBonus = accCnt >= 2 ? (avgAccuracy >= 90 ? 140 : avgAccuracy >= 80 ? 80 : avgAccuracy >= 70 ? 40 : 0) : 0;
    const streakXp = (streak.best || 0) * 15;
    const xp = playsXp + varietyXp + starsXp + accBonus + streakXp;
    const rank = rankForXp(xp);

    if (st.registered) {
      registeredCount += 1;
      if (!active7d) inactiveCount += 1;
    } else {
      guestCount += 1;
    }
    if (active24h) active24hCount += 1;
    if (active7d) active7dCount += 1;

    totalPlays += stPlays;
    totalStars += stStars;

    return {
      key: st.key,
      displayName: st.displayName,
      username: st.username,
      classCode: st.classCode,
      registered: st.registered,
      active24h,
      active7d,
      lastActiveAt: st.lastActiveAt,
      joinedAt: st.joinedAt,
      xp,
      rankTier: rank.tier,
      rankName: rank.name,
      rankIcon: rank.icon,
      totalStars: stStars,
      gamesPlayed: games.length,
      completedGames: stCompleted,
      totalPlays: stPlays,
      avgAccuracy,
      totalScore: stScore,
      streak,
      games,
      recentScores: st.recentScores.slice(0, 12),
    };
  });

  const gameStats = Array.from(gameAgg.values())
    .map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      players: g.players,
      completedPlayers: g.completedPlayers,
      totalPlays: g.totalPlays,
      totalStars: g.totalStars,
      avgAccuracy: g.accCnt ? Math.round(g.accSum / g.accCnt) : 0,
      lastAt: g.lastAt,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays);

  const topGames = gameStats.slice(0, 10);

  const skillStats = Array.from(skillAgg.values())
    .map((s) => ({
      skill: s.skill,
      gamesCount: s.gamesSet.size,
      activeStudents: s.playersSet.size,
      totalPlays: s.totalPlays,
      totalStars: s.totalStars,
      avgAccuracy: s.accCnt ? Math.round(s.accSum / s.accCnt) : 0,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays);

  const dailyPulse = Array.from(pulseDays.values()).map((d) => ({
    date: d.date,
    label: d.label,
    submissions: d.submissions,
    activeStudents: d.activeKeys.size,
  }));

  const liveRooms = roomManager.listRooms();
  const livePlayersCount = liveRooms.reduce((acc, r) => acc + (r.players ? r.players.length : 0), 0);

  return res.json({
    ok: true,
    generatedAt: now,
    warnings,
    assignment: currentAssignment || null,
    assignmentHistory,
    announcement: currentAnnouncement || null,
    classes: Array.from(classSet).sort(),
    rooms: liveRooms,
    summary: {
      totalStudents: students.length,
      registeredCount,
      guestCount,
      active7dCount,
      active24hCount,
      inactiveCount,
      totalPlays,
      progressRows: progressRows.length,
      totalStars,
      avgAccuracy: classAccCount ? Math.round(classAccSum / classAccCount) : 0,
      scoreSubmissions: scoreRows.length,
      liveRoomsCount: liveRooms.length,
      livePlayersCount,
    },
    students,
    topGames,
    gameStats,
    skillStats,
    dailyPulse,
    recentActivity: recentActivity.slice(0, 120),
  });
});

// Invite short links: /j and /j/:code
app.get("/j", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});
app.get("/j/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});

// Block direct web access to server/config internals
app.use((req, res, next) => {
  const rel = req.path.toLowerCase();
  if (
    rel.startsWith("/.env") ||
    rel.startsWith("/.git") ||
    rel.startsWith("/node_modules") ||
    rel.startsWith("/multiplayer-server/src") ||
    rel.startsWith("/exports") ||
    rel === "/server.js" ||
    rel === "/package.json" ||
    rel === "/package-lock.json" ||
    rel === "/metadata.json"
  ) {
    return res.status(404).send("Not found");
  }
  next();
});

// Static files from workspace root
app.use(
  express.static(__dirname, {
    extensions: ["html"],
    index: ["index.html"],
  })
);

// Fallback asset aliases referenced by subpages when root counterparts are absent
app.get("/style.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "home-cards.css"));
});
app.get("/theme.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "learningarcade", "theme.css"));
});
app.get("/theme.js", (_req, res) => {
  res.sendFile(path.join(__dirname, "learningarcade", "theme.js"));
});
app.get("/script.js", (_req, res) => {
  res.sendFile(path.join(__dirname, "learningarcade", "script.js"));
});
app.get("/visit-counter.js", (_req, res) => {
  res.type("application/javascript").send("// optional visit counter disabled\n");
});
app.get("/swipe-nav.js", (_req, res) => {
  res.type("application/javascript").send("// optional swipe nav\n");
});

function renderAefShellHtml(title, dataAttrs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} | Mr. Sheyhaki</title>
<link rel="stylesheet" href="/style.css">
<link rel="stylesheet" href="/theme.css">
<link rel="stylesheet" href="/resources/style.css">
</head>
<body class="has-site-topbar" data-course="american-english-file" ${dataAttrs}>
<header class="site-topbar">
  <div class="topbar-inner">
    <a href="/" class="brand-mark">Mr. Sheyhaki</a>
    <nav class="topbar-nav" aria-label="Main navigation">
      <a href="/" class="topbar-link">Home</a>
      <a href="/learningarcade/" class="topbar-link">Arcade</a>
      <a href="/multiplayer/" class="topbar-link">Multiplayer</a>
      <a href="/resources/" class="topbar-link active" aria-current="page">Resources</a>
      <a href="/about/" class="topbar-link">About</a>
    </nav>
    <div class="topbar-actions">
      <button type="button" class="mobile-nav-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNavDrawer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a href="/learningarcade/profile/" class="topbar-cta" id="headerAccountCta">My Profile</a>
    </div>
  </div>
  <nav class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile navigation">
    <a href="/">Home</a>
    <a href="/learningarcade/">Arcade</a>
    <a href="/multiplayer/">Multiplayer</a>
    <a href="/resources/" class="active" aria-current="page">Resources</a>
    <a href="/about/">About</a>
  </nav>
</header>
<main id="app"></main>
<footer class="site-footer"><p>© <span id="year"></span> Mr. Sheyhaki · Resources</p></footer>
<script src="/resources/script.js"></script>
<script src="/theme.js"></script>
<script src="/resources/american-english-file/assets/course-data.js"></script>
<script src="/resources/american-english-file/assets/course-render.js"></script>
<script src="/swipe-nav.js"></script>
<script src="/visit-counter.js" defer></script>
</body>
</html>`;
}

// Dynamic shell fallback for any ungenerated AEF unit / lesson / PE / section route
app.use("/resources/american-english-file", (req, res, next) => {
  if (req.method !== "GET") return next();
  const clean = (req.path || "/").replace(/\/index\.html$/i, "").replace(/\/+$/, "");
  let m;
  if ((m = clean.match(/^\/(starter|1)$/))) {
    const level = m[1];
    return res.type("html").send(renderAefShellHtml(`American English File — ${level === "starter" ? "Starter" : "Level 1"}`, `data-type="level" data-level="${level}"`));
  }
  if ((m = clean.match(/^\/(starter|1)\/unit-(\d{1,2})$/))) {
    const [, level, unit] = m;
    return res.type("html").send(renderAefShellHtml(`Unit ${unit}`, `data-type="unit" data-level="${level}" data-unit="${unit}"`));
  }
  if ((m = clean.match(/^\/(starter|1)\/unit-(\d{1,2})\/([abc])$/))) {
    const [, level, unit, lesson] = m;
    return res.type("html").send(renderAefShellHtml(`Unit ${unit}${lesson.toUpperCase()}`, `data-type="lesson" data-level="${level}" data-unit="${unit}" data-lesson="${lesson}"`));
  }
  if ((m = clean.match(/^\/(starter|1)\/unit-(\d{1,2})\/([abc])\/(games|worksheets|audio)$/))) {
    const [, level, unit, lesson, section] = m;
    return res.type("html").send(renderAefShellHtml(`Unit ${unit}${lesson.toUpperCase()} ${section}`, `data-type="${section}" data-level="${level}" data-unit="${unit}" data-lesson="${lesson}"`));
  }
  if ((m = clean.match(/^\/(starter|1)\/practical-english-(\d{1,2})$/))) {
    const [, level, pe] = m;
    return res.type("html").send(renderAefShellHtml(`Practical English ${pe}`, `data-type="lesson" data-level="${level}" data-pe="${pe}"`));
  }
  if ((m = clean.match(/^\/(starter|1)\/practical-english-(\d{1,2})\/(games|worksheets|audio)$/))) {
    const [, level, pe, section] = m;
    return res.type("html").send(renderAefShellHtml(`Practical English ${pe} ${section}`, `data-type="${section}" data-level="${level}" data-pe="${pe}"`));
  }
  return next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin(origin, cb) {
      if (isAllowedOrigin(origin, null)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(PORT, HOST, () => {
  console.log(`[mrsheyhaki] Server running at http://${HOST}:${PORT} (env=${config.nodeEnv})`);
});
