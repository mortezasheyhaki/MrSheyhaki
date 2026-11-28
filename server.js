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

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const ADMIN_STATE_FILE = "/tmp/mrsheyhaki-admin.json";
const ASSIGNMENT_STATE_FILE = "/tmp/mrsheyhaki-assignment.json";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Ignore ephemeral /tmp write errors
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

const envAdminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
let storedAdminRecord = readJsonSafe(ADMIN_STATE_FILE, null);
let currentAssignment = readJsonSafe(ASSIGNMENT_STATE_FILE, null);
const adminTokens = new Map();

function isAdminSetupNeeded() {
  return !envAdminPassword && !(storedAdminRecord && storedAdminRecord.hash);
}

function issueAdminToken() {
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

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (config.corsOrigins.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname.endsWith(".run.app")
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
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mrsheyhaki-web",
    time: new Date().toISOString(),
    rooms: roomManager.stats().rooms,
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
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
    gameType: room.gameType || "a-an-swipe",
  });
});

app.get("/api/assignments", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    ok: true,
    assignment: currentAssignment || null,
  });
});

app.post("/api/assignments", requireAdminAuth, (req, res) => {
  const body = req.body || {};
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
        url: String(it.url || "/learningarcade/").trim().slice(0, 240),
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
  return res.json({ ok: true, assignment: currentAssignment });
});

app.get("/api/admin/status", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const token = extractBearerToken(req);
  return res.json({
    ok: true,
    needsSetup: isAdminSetupNeeded(),
    authenticated: isTokenValid(token),
  });
});

app.post("/api/admin/setup", (req, res) => {
  if (!isAdminSetupNeeded()) {
    return res.status(409).json({ ok: false, error: "Admin password is already set." });
  }
  const password = String(req.body?.password || "");
  if (password.length < 8) {
    return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
  }
  storedAdminRecord = hashPassword(password);
  writeJsonSafe(ADMIN_STATE_FILE, storedAdminRecord);
  const token = issueAdminToken();
  return res.json({ ok: true, token });
});

app.post("/api/admin/login", (req, res) => {
  if (isAdminSetupNeeded()) {
    return res.status(400).json({
      ok: false,
      needsSetup: true,
      error: "Admin password has not been configured yet.",
    });
  }
  const password = String(req.body?.password || "");
  if (!password) {
    return res.status(400).json({ ok: false, error: "Enter the admin password." });
  }
  const valid = envAdminPassword
    ? timingSafeComparePlain(password, envAdminPassword)
    : verifyScrypt(password, storedAdminRecord);

  if (!valid) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }
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
    ensureStudent(key, {
      userId: p.id,
      displayName: p.display_name || p.username || "Student",
      username: p.username || "",
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

    let student;
    if (s.user_id) {
      student = ensureStudent("reg:" + s.user_id, {
        userId: s.user_id,
        displayName: s.name || "Student",
        username: "",
        registered: true,
        joinedAt: at,
      });
    } else {
      const cleanName = String(s.name || "Guest").trim() || "Guest";
      student = ensureStudent("guest:" + cleanName.toLowerCase(), {
        displayName: cleanName,
        username: "",
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
      gameName: gname,
      score,
      maxScore,
      timeMs,
      at,
    });

    recentActivity.push({
      studentName: student.displayName,
      gameName: gname,
      score,
      maxScore,
      accuracy,
      at,
    });
  }

  recentActivity.sort((a, b) => b.at - a.at);

  const gameAgg = new Map();
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

    let stStars = 0;
    let stPlays = 0;
    let stCompleted = 0;
    let stScore = 0;
    let accSum = 0;
    let accCnt = 0;

    for (const g of games) {
      stStars += g.stars;
      stPlays += g.plays;
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
          totalPlays: 0,
          accSum: 0,
          accCnt: 0,
        });
      }
      const agg = gameAgg.get(g.id);
      agg.totalPlays += g.plays || 1;
      if (g.accuracy > 0) {
        agg.accSum += g.accuracy;
        agg.accCnt += 1;
      }
    }

    const active24h = st.lastActiveAt > 0 && now - st.lastActiveAt <= DAY_MS;
    const active7d = st.lastActiveAt > 0 && now - st.lastActiveAt <= WEEK_MS;

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
      registered: st.registered,
      active24h,
      active7d,
      lastActiveAt: st.lastActiveAt,
      joinedAt: st.joinedAt,
      totalStars: stStars,
      gamesPlayed: games.length,
      completedGames: stCompleted,
      totalPlays: stPlays,
      avgAccuracy: accCnt ? Math.round(accSum / accCnt) : 0,
      totalScore: stScore,
      streak: computeDailyStreak(st.activityDates),
      games,
      recentScores: st.recentScores.slice(0, 10),
    };
  });

  const topGames = Array.from(gameAgg.values())
    .map((g) => ({
      name: g.name,
      category: g.category,
      totalPlays: g.totalPlays,
      avgAccuracy: g.accCnt ? Math.round(g.accSum / g.accCnt) : 0,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 10);

  return res.json({
    ok: true,
    generatedAt: now,
    warnings,
    assignment: currentAssignment || null,
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
    recentActivity: recentActivity.slice(0, 30),
  });
});

// Invite short links: /j and /j/:code
app.get("/j", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});
app.get("/j/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});

// Static files from workspace root
app.use(express.static(__dirname, { extensions: ["html"] }));

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
<title>${title} | Mr. Sheyhaki</title>
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
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(PORT, HOST, () => {
  console.log(`[mrsheyhaki] Server running at http://${HOST}:${PORT}`);
});
