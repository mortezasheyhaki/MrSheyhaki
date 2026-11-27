import crypto from "crypto";
import http from "http";
import path from "path";
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

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const app = express();
app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (
          config.corsOrigins.includes(origin) ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
          /\.run\.app$/i.test(hostname)
        ) {
          return cb(null, true);
        }
      } catch {
        // Ignore malformed Origin headers
      }
      return cb(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "256kb" }));

// ── Admin Auth (in-memory session tokens + scrypt password hash) ──
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const adminSessions = new Map();
let configuredAdminHash = null;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const parts = String(storedHash || "").split(":");
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  const derived = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
  configuredAdminHash = hashPassword(process.env.ADMIN_PASSWORD.trim());
}

function getBearerToken(req) {
  const auth = String(req.headers.authorization || "");
  if (!auth.toLowerCase().startsWith("bearer ")) return "";
  return auth.slice(7).trim();
}

function isValidAdminToken(token) {
  if (!token) return false;
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

function issueAdminToken() {
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.set(token, Date.now() + ADMIN_SESSION_TTL_MS);
  return token;
}

function getSupabaseClient() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Health & Multiplayer Room Lookup ─────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    phase: 4,
    service: "mrsheyhaki-multiplayer",
    time: new Date().toISOString(),
    rooms: roomManager.stats().rooms,
    supabaseConfigured: !!(
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !config.supabaseAnonKey.includes("your_anon")
    ),
  });
});

app.get("/api/rooms/:code", (req, res) => {
  const room = roomManager.getRoomByCode(req.params.code);
  if (!room) {
    return res.status(404).json({ ok: false, error: "Room not found" });
  }
  return res.json({
    ok: true,
    code: room.code,
    gameType: room.gameType,
    status: room.status,
    playersCount: room.players.length,
    maxPlayers: room.maxPlayers,
  });
});

// ── Teacher Admin API ────────────────────────────────────────────
app.get("/api/admin/status", (req, res) => {
  const token = getBearerToken(req);
  res.json({
    ok: true,
    needsSetup: !configuredAdminHash,
    authenticated: Boolean(configuredAdminHash && isValidAdminToken(token)),
  });
});

app.post("/api/admin/setup", (req, res) => {
  if (configuredAdminHash) {
    return res.status(409).json({ ok: false, error: "Admin password is already set." });
  }
  const password = String(req.body?.password || "");
  if (password.length < 8) {
    return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
  }
  configuredAdminHash = hashPassword(password);
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/login", (req, res) => {
  if (!configuredAdminHash) {
    return res.status(400).json({ ok: false, needsSetup: true, error: "Admin password not configured." });
  }
  const password = String(req.body?.password || "");
  if (!verifyPassword(password, configuredAdminHash)) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/logout", (req, res) => {
  const token = getBearerToken(req);
  if (token) adminSessions.delete(token);
  res.json({ ok: true });
});

app.get("/api/admin/activity", async (req, res) => {
  const token = getBearerToken(req);
  if (!configuredAdminHash || !isValidAdminToken(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const warnings = [];
  const sb = getSupabaseClient();
  let profiles = [];
  let progress = [];
  let scores = [];

  if (!sb) {
    warnings.push("Supabase is not configured.");
  } else {
    const [profRes, progRes, scoreRes] = await Promise.all([
      sb.from("profiles").select("id,username,display_name,created_at").order("created_at", { ascending: false }).limit(500),
      sb.from("game_progress").select("*").order("last_at", { ascending: false }).limit(2000),
      sb.from("scores").select("id,name,score,max_score,game_id,game_name,user_id,time_ms,at,created_at").order("at", { ascending: false }).limit(1000),
    ]);

    if (profRes.error) warnings.push(`profiles: ${profRes.error.message}`);
    else profiles = profRes.data || [];

    if (progRes.error) warnings.push(`game_progress: ${progRes.error.message}`);
    else progress = progRes.data || [];

    if (scoreRes.error) warnings.push(`scores: ${scoreRes.error.message}`);
    else scores = scoreRes.data || [];
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const studentMap = new Map();

  function ensureStudent(key, defaults) {
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        key,
        displayName: defaults.displayName || "Player",
        username: defaults.username || "",
        registered: !!defaults.registered,
        joinedAt: defaults.joinedAt || 0,
        lastActiveAt: 0,
        active24h: false,
        active7d: false,
        gamesPlayed: 0,
        completedGames: 0,
        totalStars: 0,
        totalPlays: 0,
        avgAccuracy: 0,
        totalScore: 0,
        gamesMap: new Map(),
        recentScores: [],
      });
    }
    return studentMap.get(key);
  }

  for (const p of profiles) {
    const joinedAt = p.created_at ? new Date(p.created_at).getTime() : 0;
    ensureStudent(`user:${p.id}`, {
      displayName: p.display_name || p.username || "Student",
      username: p.username || "",
      registered: true,
      joinedAt: Number.isFinite(joinedAt) ? joinedAt : 0,
    });
  }

  for (const row of progress) {
    const key = `user:${row.user_id}`;
    const st = ensureStudent(key, {
      displayName: "Registered Student",
      registered: true,
      joinedAt: 0,
    });
    const lastAt = row.last_at ? new Date(row.last_at).getTime() : 0;
    const validLastAt = Number.isFinite(lastAt) ? lastAt : 0;
    if (validLastAt > st.lastActiveAt) st.lastActiveAt = validLastAt;

    const gid = row.game_id || "game";
    const stars = Math.max(0, Math.min(3, Number(row.stars) || 0));
    const plays = Number(row.plays) || 0;
    const bestScore = Number(row.best_score) || 0;
    const maxScore = Number(row.max_score) || 0;
    const accuracy = Number(row.best_accuracy) || 0;

    st.gamesMap.set(gid, {
      id: gid,
      name: row.game_name || gid,
      category: row.category || "General",
      stars,
      bestScore,
      maxScore,
      bestTimeMs: 0,
      accuracy,
      plays,
      lastAt: validLastAt,
      completed: Boolean(row.completed || stars > 0),
    });
  }

  const recentActivity = [];
  const topGamesMap = new Map();

  for (const sc of scores) {
    const at = Number(sc.at) || (sc.created_at ? new Date(sc.created_at).getTime() : 0) || 0;
    const key = sc.user_id ? `user:${sc.user_id}` : `guest:${String(sc.name || "Guest").trim().toLowerCase()}`;
    const st = ensureStudent(key, {
      displayName: sc.name || "Guest",
      username: "",
      registered: Boolean(sc.user_id),
      joinedAt: 0,
    });
    if (at > st.lastActiveAt) st.lastActiveAt = at;

    const scoreVal = Number(sc.score) || 0;
    const maxVal = sc.max_score != null ? Number(sc.max_score) : 0;
    const accVal = maxVal > 0 ? Math.min(100, Math.round((scoreVal / maxVal) * 100)) : null;

    st.recentScores.push({
      gameName: sc.game_name || sc.game_id || "Game",
      score: scoreVal,
      maxScore: maxVal || null,
      timeMs: sc.time_ms ? Number(sc.time_ms) : null,
      at,
    });

    const gid = sc.game_id || "game";
    if (sc.time_ms && st.gamesMap.has(gid)) {
      const g = st.gamesMap.get(gid);
      const tm = Number(sc.time_ms);
      if (tm > 0 && (!g.bestTimeMs || tm < g.bestTimeMs)) g.bestTimeMs = tm;
    }

    recentActivity.push({
      studentName: st.displayName || sc.name || "Player",
      gameName: sc.game_name || gid,
      score: scoreVal,
      maxScore: maxVal || null,
      accuracy: accVal,
      at,
    });

    if (!topGamesMap.has(gid)) {
      topGamesMap.set(gid, {
        id: gid,
        name: sc.game_name || gid,
        category: "General",
        totalPlays: 0,
        accSum: 0,
        accCount: 0,
      });
    }
    const tg = topGamesMap.get(gid);
    tg.totalPlays += 1;
    if (accVal != null) {
      tg.accSum += accVal;
      tg.accCount += 1;
    }
  }

  let registeredCount = 0;
  let guestCount = 0;
  let active7dCount = 0;
  let active24hCount = 0;
  let totalPlays = 0;
  let totalStars = 0;
  let inactiveCount = 0;
  let globalAccSum = 0;
  let globalAccCount = 0;

  const students = Array.from(studentMap.values()).map((st) => {
    const games = Array.from(st.gamesMap.values()).sort((a, b) => b.lastAt - a.lastAt);
    st.gamesPlayed = games.length;
    st.completedGames = games.filter((g) => g.completed).length;
    st.totalStars = games.reduce((sum, g) => sum + g.stars, 0);
    st.totalPlays = games.reduce((sum, g) => sum + g.plays, 0) || st.recentScores.length;
    st.totalScore = games.reduce((sum, g) => sum + g.bestScore, 0);

    const accGames = games.filter((g) => g.accuracy > 0);
    st.avgAccuracy = accGames.length
      ? Math.round(accGames.reduce((sum, g) => sum + g.accuracy, 0) / accGames.length)
      : 0;

    st.active24h = st.lastActiveAt > 0 && now - st.lastActiveAt <= dayMs;
    st.active7d = st.lastActiveAt > 0 && now - st.lastActiveAt <= weekMs;

    if (st.registered) {
      registeredCount += 1;
      if (!st.active7d) inactiveCount += 1;
    } else {
      guestCount += 1;
    }
    if (st.active24h) active24hCount += 1;
    if (st.active7d) active7dCount += 1;
    totalPlays += st.totalPlays;
    totalStars += st.totalStars;
    if (st.avgAccuracy > 0) {
      globalAccSum += st.avgAccuracy;
      globalAccCount += 1;
    }

    for (const g of games) {
      if (!topGamesMap.has(g.id)) {
        topGamesMap.set(g.id, {
          id: g.id,
          name: g.name,
          category: g.category,
          totalPlays: 0,
          accSum: 0,
          accCount: 0,
        });
      }
      const tg = topGamesMap.get(g.id);
      tg.category = g.category || tg.category;
      tg.totalPlays = Math.max(tg.totalPlays, g.plays);
      if (g.accuracy > 0) {
        tg.accSum += g.accuracy;
        tg.accCount += 1;
      }
    }

    return {
      key: st.key,
      displayName: st.displayName,
      username: st.username,
      registered: st.registered,
      joinedAt: st.joinedAt,
      lastActiveAt: st.lastActiveAt,
      active24h: st.active24h,
      active7d: st.active7d,
      gamesPlayed: st.gamesPlayed,
      completedGames: st.completedGames,
      totalStars: st.totalStars,
      totalPlays: st.totalPlays,
      avgAccuracy: st.avgAccuracy,
      totalScore: st.totalScore,
      games,
      recentScores: st.recentScores.slice(0, 10),
    };
  });

  const topGames = Array.from(topGamesMap.values())
    .map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      totalPlays: g.totalPlays,
      avgAccuracy: g.accCount ? Math.round(g.accSum / g.accCount) : 0,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 10);

  return res.json({
    ok: true,
    generatedAt: now,
    warnings,
    summary: {
      totalStudents: students.length,
      registeredCount,
      guestCount,
      active7dCount,
      active24hCount,
      totalPlays,
      progressRows: progress.length,
      totalStars,
      inactiveCount,
      avgAccuracy: globalAccCount ? Math.round(globalAccSum / globalAccCount) : 0,
      scoreSubmissions: scores.length,
    },
    students,
    topGames,
    recentActivity: recentActivity.slice(0, 25),
  });
});

// ── Short Join Route (/j/:code) ──────────────────────────────────
app.get("/j/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});

// ── Root-level shared asset fallbacks ────────────────────────────
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
  res.type("application/javascript").send("/* visit-counter */\n");
});
app.get("/swipe-nav.js", (_req, res) => {
  res.type("application/javascript").send("/* swipe-nav */\n");
});

// ── Static Site Serving ──────────────────────────────────────────
app.use(express.static(__dirname, { index: ["index.html"] }));

// ── HTTP + Socket.IO Server ──────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin(_origin, cb) {
      cb(null, true);
    },
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(PORT, HOST, () => {
  console.log(`[server] listening on http://${HOST}:${PORT}`);
  console.log(
    `[server] Supabase: ${config.supabaseUrl ? "URL set" : "MISSING"} / key ${
      config.supabaseAnonKey && !config.supabaseAnonKey.includes("your_anon") ? "set" : "MISSING"
    }`
  );
});
