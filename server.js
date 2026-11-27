import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
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

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json({ limit: "256kb" }));

// ── Health & Room Lookup API ───────────────────────────────────────────────

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
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
  });
});

// ── Teacher Admin API (/api/admin/*) ───────────────────────────────────────

const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const adminSessions = new Map();
let adminPasswordHash = null;

function hashPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, expectedHex] = storedHash.split(":");
  const actualBuf = crypto.scryptSync(String(password), salt, 64);
  const expectedBuf = Buffer.from(expectedHex, "hex");
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
  adminPasswordHash = hashPassword(process.env.ADMIN_PASSWORD.trim());
}

function issueAdminToken() {
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.set(token, Date.now() + ADMIN_TOKEN_TTL_MS);
  return token;
}

function extractBearer(req) {
  const raw = String(req.headers.authorization || "");
  if (raw.toLowerCase().startsWith("bearer ")) {
    return raw.slice(7).trim();
  }
  return "";
}

function isAdminAuthenticated(req) {
  const token = extractBearer(req);
  if (!token) return false;
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

app.get("/api/admin/status", (req, res) => {
  res.json({
    ok: true,
    needsSetup: !adminPasswordHash,
    authenticated: isAdminAuthenticated(req),
  });
});

app.post("/api/admin/setup", (req, res) => {
  if (adminPasswordHash) {
    return res
      .status(409)
      .json({ ok: false, error: "Admin password is already configured." });
  }
  const password = String(req.body?.password || "");
  if (password.length < 8) {
    return res
      .status(400)
      .json({ ok: false, error: "Password must be at least 8 characters." });
  }
  adminPasswordHash = hashPassword(password);
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/login", (req, res) => {
  if (!adminPasswordHash) {
    return res.status(400).json({
      ok: false,
      needsSetup: true,
      error: "Admin password has not been configured yet.",
    });
  }
  const password = String(req.body?.password || "");
  if (!verifyPassword(password, adminPasswordHash)) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/logout", (req, res) => {
  const token = extractBearer(req);
  if (token) adminSessions.delete(token);
  res.json({ ok: true });
});

// ── Homework / Assigned Games (/api/assignments) ───────────────────────────

const DATA_DIR = path.join(__dirname, ".data");
const ASSIGNMENTS_FILE = path.join(DATA_DIR, "assignments.json");

function loadStoredAssignment() {
  try {
    if (fs.existsSync(ASSIGNMENTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ASSIGNMENTS_FILE, "utf8"));
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (_err) {}
  return null;
}

function persistAssignment(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!data) {
      if (fs.existsSync(ASSIGNMENTS_FILE)) fs.unlinkSync(ASSIGNMENTS_FILE);
    } else {
      fs.writeFileSync(ASSIGNMENTS_FILE, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (_err) {}
}

let currentAssignment = loadStoredAssignment();

app.get("/api/assignments", (_req, res) => {
  res.json({
    ok: true,
    assignment: currentAssignment || null,
  });
});

app.post("/api/assignments", (req, res) => {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  if (req.body && req.body.clear) {
    currentAssignment = null;
    persistAssignment(null);
    return res.json({ ok: true, assignment: null });
  }

  const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
  const cleanItems = [];
  const seen = new Set();
  for (const item of rawItems) {
    if (!item || typeof item !== "object") continue;
    const id = String(item.id || "").trim().slice(0, 120);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    cleanItems.push({
      id,
      title: String(item.title || id).trim().slice(0, 120),
      category: String(item.category || "General").trim().slice(0, 48),
      course: String(item.course || "").trim().slice(0, 80),
      url: String(item.url || "").trim().slice(0, 260),
    });
    if (cleanItems.length >= 24) break;
  }

  if (!cleanItems.length) {
    return res.status(400).json({ ok: false, error: "Select at least 1 game to assign." });
  }

  const next = {
    id: crypto.randomBytes(6).toString("hex"),
    title: String(req.body?.title || "This Week's Assigned Games").trim().slice(0, 80) || "This Week's Assigned Games",
    note: String(req.body?.note || "").trim().slice(0, 180),
    updatedAt: Date.now(),
    items: cleanItems,
  };
  currentAssignment = next;
  persistAssignment(next);
  return res.json({ ok: true, assignment: currentAssignment });
});

let adminSupabase = null;
function getAdminSupabase() {
  if (adminSupabase) return adminSupabase;
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  adminSupabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminSupabase;
}

function toMs(val) {
  if (!val) return 0;
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const ms = new Date(val).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function dayKeyFromMs(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function prevDayKey(dayKey) {
  const parts = String(dayKey || "").split("-");
  if (parts.length !== 3) return "";
  const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function computeStreakFromDays(daySet) {
  const days = Array.from(daySet || []).sort();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = prevDayKey(today);
  let current = 0;
  let cursor = daySet.has(today) ? today : (daySet.has(yesterday) ? yesterday : "");
  while (cursor && daySet.has(cursor)) {
    current += 1;
    cursor = prevDayKey(cursor);
  }
  let best = 0;
  let run = 0;
  let prev = "";
  for (const d of days) {
    if (prev && prevDayKey(d) === prev) run += 1;
    else run = 1;
    if (run > best) best = run;
    prev = d;
  }
  return { current, best: Math.max(best, current), activeDays: days.length };
}

app.get("/api/admin/activity", async (req, res) => {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const sb = getAdminSupabase();
  const warnings = [];
  let profiles = [];
  let progressRows = [];
  let scoreRows = [];

  if (!sb) {
    warnings.push("Supabase is not configured.");
  } else {
    const [profRes, progRes, scoreRes] = await Promise.all([
      sb
        .from("profiles")
        .select("id,username,display_name,created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      sb
        .from("game_progress")
        .select("*")
        .order("last_at", { ascending: false })
        .limit(3000),
      sb
        .from("scores")
        .select("*")
        .order("at", { ascending: false })
        .limit(1500),
    ]);

    if (profRes.error) warnings.push(`profiles: ${profRes.error.message}`);
    else profiles = profRes.data || [];

    if (progRes.error) warnings.push(`game_progress: ${progRes.error.message}`);
    else progressRows = progRes.data || [];

    if (scoreRes.error) warnings.push(`scores: ${scoreRes.error.message}`);
    else scoreRows = scoreRes.data || [];
  }

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const WEEK_MS = 7 * DAY_MS;

  const studentMap = new Map();
  const gameStatsMap = new Map();

  function ensureStudent(key, defaults) {
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        key,
        registered: Boolean(defaults.registered),
        username: defaults.username || "",
        displayName: defaults.displayName || defaults.username || "Player",
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
        games: [],
        recentScores: [],
        streak: { current: 0, best: 0, activeDays: 0 },
        _gamesMap: new Map(),
        _daySet: new Set(),
      });
    }
    return studentMap.get(key);
  }

  for (const p of profiles) {
    const key = `user:${p.id}`;
    ensureStudent(key, {
      registered: true,
      username: p.username || "",
      displayName: p.display_name || p.username || "Student",
      joinedAt: toMs(p.created_at),
    });
  }

  for (const r of progressRows) {
    const key = r.user_id ? `user:${r.user_id}` : `guest:${r.game_id}`;
    const student = ensureStudent(key, {
      registered: Boolean(r.user_id),
      displayName: r.user_id ? "Student" : "Guest",
      joinedAt: 0,
    });
    const lastAt = toMs(r.last_at);
    if (lastAt > student.lastActiveAt) student.lastActiveAt = lastAt;
    const dayStr = dayKeyFromMs(lastAt);
    if (dayStr) student._daySet.add(dayStr);

    const gid = r.game_id || "game";
    const gname = r.game_name || gid;
    const cat = r.category || "General";
    const stars = Math.max(0, Math.min(3, Number(r.stars) || 0));
    const plays = Number(r.plays) || 0;
    const bestScore = Number(r.best_score) || 0;
    const maxScore = Number(r.max_score) || 0;
    const acc = Number(r.best_accuracy) || 0;

    student._gamesMap.set(gid, {
      id: gid,
      name: gname,
      category: cat,
      stars,
      bestScore,
      maxScore,
      bestTimeMs: 0,
      accuracy: acc,
      plays,
      lastAt,
      completed: Boolean(r.completed) || stars > 0,
    });

    if (!gameStatsMap.has(gid)) {
      gameStatsMap.set(gid, {
        id: gid,
        name: gname,
        category: cat,
        totalPlays: 0,
        accSum: 0,
        accCount: 0,
      });
    }
    const gs = gameStatsMap.get(gid);
    gs.totalPlays += plays;
    if (acc > 0) {
      gs.accSum += acc;
      gs.accCount += 1;
    }
  }

  const recentActivity = [];

  for (const s of scoreRows) {
    const key = s.user_id
      ? `user:${s.user_id}`
      : `guest:${String(s.name || "Guest").toLowerCase()}`;
    const student = ensureStudent(key, {
      registered: Boolean(s.user_id),
      displayName: s.name || "Guest",
      joinedAt: 0,
    });
    const at = toMs(s.at) || toMs(s.created_at);
    if (at > student.lastActiveAt) student.lastActiveAt = at;
    const scoreDay = dayKeyFromMs(at);
    if (scoreDay) student._daySet.add(scoreDay);

    const score = Number(s.score) || 0;
    const maxScore = s.max_score != null ? Number(s.max_score) : 0;
    const timeMs = s.time_ms != null ? Number(s.time_ms) : 0;
    const acc = maxScore > 0 ? Math.round((score / maxScore) * 100) : null;
    const gid = s.game_id || "game";
    const gname = s.game_name || gid;

    student.totalScore += score;
    student.recentScores.push({
      gameId: gid,
      gameName: gname,
      score,
      maxScore,
      timeMs,
      at,
    });

    const existingGame = student._gamesMap.get(gid);
    if (existingGame) {
      if (timeMs > 0 && (!existingGame.bestTimeMs || timeMs < existingGame.bestTimeMs)) {
        existingGame.bestTimeMs = timeMs;
      }
      if (at > existingGame.lastAt) existingGame.lastAt = at;
    }

    recentActivity.push({
      studentName: student.displayName || s.name || "Player",
      gameId: gid,
      gameName: gname,
      score,
      maxScore,
      accuracy: acc,
      at,
    });
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

  const students = [];
  for (const st of studentMap.values()) {
    st.games = Array.from(st._gamesMap.values()).sort((a, b) => b.lastAt - a.lastAt);
    st.streak = computeStreakFromDays(st._daySet);
    delete st._gamesMap;
    delete st._daySet;

    st.gamesPlayed = st.games.length;
    st.completedGames = st.games.filter((g) => g.completed).length;
    st.totalStars = st.games.reduce((sum, g) => sum + g.stars, 0);
    st.totalPlays = st.games.reduce((sum, g) => sum + g.plays, 0) || st.recentScores.length;

    const accGames = st.games.filter((g) => g.accuracy > 0);
    st.avgAccuracy = accGames.length
      ? Math.round(accGames.reduce((sum, g) => sum + g.accuracy, 0) / accGames.length)
      : 0;

    st.active24h = st.lastActiveAt > 0 && now - st.lastActiveAt <= DAY_MS;
    st.active7d = st.lastActiveAt > 0 && now - st.lastActiveAt <= WEEK_MS;

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
      classAccSum += st.avgAccuracy;
      classAccCount += 1;
    }

    st.recentScores.sort((a, b) => b.at - a.at);
    st.recentScores = st.recentScores.slice(0, 10);
    students.push(st);
  }

  const topGames = Array.from(gameStatsMap.values())
    .map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      totalPlays: g.totalPlays,
      avgAccuracy: g.accCount ? Math.round(g.accSum / g.accCount) : 0,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 10);

  recentActivity.sort((a, b) => b.at - a.at);

  return res.json({
    ok: true,
    generatedAt: now,
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
    },
    students,
    topGames,
    recentActivity: recentActivity.slice(0, 40),
    assignment: currentAssignment || null,
    warnings,
  });
});

// ── Short invite links (/j/:code) & Static Site ────────────────────────────

app.get("/j/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});

app.use(express.static(__dirname));

// ── HTTP + Socket.IO Server ────────────────────────────────────────────────

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(PORT, HOST, () => {
  console.log(`[server] Mr. Sheyhaki web + multiplayer listening on http://${HOST}:${PORT}`);
});
