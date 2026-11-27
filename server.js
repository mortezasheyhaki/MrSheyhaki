import crypto from "crypto";
import fs from "fs";
import http from "http";
import path from "path";
import vm from "vm";
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

const PORT = Number(process.env.PORT || process.env.DEFAULT_APP_PORT) || 3000;
const ADMIN_HASH_FILE = "/tmp/.mrsheyhaki-admin-hash.json";
const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

const adminTokens = new Map();
const loginFailures = new Map();

function loadClaimedAdminHash() {
  try {
    if (!fs.existsSync(ADMIN_HASH_FILE)) return null;
    const raw = fs.readFileSync(ADMIN_HASH_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.salt === "string" && typeof parsed.hash === "string") {
      return parsed;
    }
  } catch {
    // ignore invalid or unreadable temp file
  }
  return null;
}

function saveClaimedAdminHash(record) {
  try {
    fs.writeFileSync(ADMIN_HASH_FILE, JSON.stringify(record), { mode: 0o600 });
  } catch {
    // keep in memory even if /tmp write fails
  }
}

let claimedAdminRecord = loadClaimedAdminHash();

function getEnvAdminPassword() {
  return String(process.env.ADMIN_PASSWORD || "").trim();
}

function hashPasswordWithSalt(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash: derived };
}

function safeEqualHex(aHex, bHex) {
  const a = Buffer.from(String(aHex || ""), "hex");
  const b = Buffer.from(String(bHex || ""), "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function safeEqualPlain(aStr, bStr) {
  const aHash = crypto.createHash("sha256").update(String(aStr || "")).digest();
  const bHash = crypto.createHash("sha256").update(String(bStr || "")).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

function isAdminConfigured() {
  return Boolean(getEnvAdminPassword() || claimedAdminRecord);
}

function verifyAdminPassword(candidate) {
  const input = String(candidate || "");
  if (!input) return false;
  const envPass = getEnvAdminPassword();
  if (envPass) {
    return safeEqualPlain(input, envPass);
  }
  if (claimedAdminRecord && claimedAdminRecord.salt && claimedAdminRecord.hash) {
    const check = hashPasswordWithSalt(input, claimedAdminRecord.salt);
    return safeEqualHex(check.hash, claimedAdminRecord.hash);
  }
  return false;
}

function extractBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.toLowerCase().startsWith("bearer ")) return "";
  return authHeader.slice(7).trim();
}

function isValidAdminToken(token) {
  if (!token) return false;
  const entry = adminTokens.get(token);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

function createAdminToken() {
  const now = Date.now();
  for (const [k, v] of adminTokens.entries()) {
    if (now > v.expiresAt) adminTokens.delete(k);
  }
  const token = crypto.randomBytes(32).toString("hex");
  adminTokens.set(token, { createdAt: now, expiresAt: now + ADMIN_TOKEN_TTL_MS });
  return token;
}

function clientIpKey(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown").slice(0, 64);
}

function checkRateLimit(req) {
  const key = clientIpKey(req);
  const now = Date.now();
  const rec = loginFailures.get(key);
  if (!rec) return { allowed: true };
  if (now - rec.firstAt > LOGIN_WINDOW_MS) {
    loginFailures.delete(key);
    return { allowed: true };
  }
  if (rec.count >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((LOGIN_WINDOW_MS - (now - rec.firstAt)) / 1000) };
  }
  return { allowed: true };
}

function recordLoginFailure(req) {
  const key = clientIpKey(req);
  const now = Date.now();
  const rec = loginFailures.get(key);
  if (!rec || now - rec.firstAt > LOGIN_WINDOW_MS) {
    loginFailures.set(key, { count: 1, firstAt: now });
  } else {
    rec.count += 1;
  }
}

function clearLoginFailures(req) {
  loginFailures.delete(clientIpKey(req));
}

function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

function getSupabaseAdminClient() {
  const url = config.supabaseUrl;
  const key =
    String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim() || config.supabaseAnonKey;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function loadSkillCatalog() {
  try {
    const sandbox = {};
    sandbox.window = sandbox;
    const courseDataPath = path.join(__dirname, "resources", "american-english-file", "assets", "course-data.js");
    if (fs.existsSync(courseDataPath)) {
      const cdCode = fs.readFileSync(courseDataPath, "utf8");
      vm.runInNewContext(cdCode + "; this.COURSE_DATA = COURSE_DATA;", sandbox);
    }
    const catalogPath = path.join(__dirname, "learningarcade", "skill-catalog.js");
    if (fs.existsSync(catalogPath)) {
      const catCode = fs.readFileSync(catalogPath, "utf8");
      vm.runInNewContext(catCode, sandbox);
    }
    return sandbox.LASkillCatalog || null;
  } catch (err) {
    console.warn("[server] skill-catalog load fallback:", err && err.message ? err.message : err);
    return null;
  }
}

const skillCatalog = loadSkillCatalog();

function inferCategory(gameId, explicitCategory) {
  if (skillCatalog && typeof skillCatalog.inferCategory === "function") {
    return skillCatalog.inferCategory(gameId, explicitCategory);
  }
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
  if (id.startsWith("vocab-") || id.includes("flashcards") || id.includes("match-rush") || id.includes("opposite-snap") || id.includes("-match") || id.includes("unscramble")) {
    return "Vocabulary";
  }
  if (
    id.startsWith("grammar-") ||
    id === "be-verbs" ||
    id === "nouns" ||
    id === "there-is-there-are" ||
    id === "simple-present" ||
    id === "simple-past" ||
    id === "present-perfect" ||
    id.includes("-sentences") ||
    id.includes("-question")
  ) {
    return "Grammar";
  }
  if (id.startsWith("topics-")) return "Topics";
  return "General";
}

function inferGameTitle(gameId, rawName) {
  const cleanRaw = rawName && String(rawName).trim() && rawName !== gameId ? String(rawName).trim() : "";
  if (skillCatalog && typeof skillCatalog.getTitle === "function") {
    return skillCatalog.getTitle(gameId, cleanRaw);
  }
  return cleanRaw || String(gameId || "Game");
}

function toTimestamp(val) {
  if (!val) return 0;
  if (typeof val === "number" && Number.isFinite(val)) return val;
  const parsed = new Date(val).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

const app = express();
app.set("trust proxy", 1);

app.use(express.json({ limit: "64kb" }));

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (
        config.corsOrigins.includes(origin) ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".run.app")
      ) {
        return cb(null, true);
      }
      return cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", (err, _req, res, next) => {
  if (!err) return next();
  return res.status(err.status || 400).json({
    ok: false,
    error: err.message || "Invalid API request.",
  });
});

app.use("/api/admin", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    phase: 4,
    service: "mrsheyhaki-web",
    time: new Date().toISOString(),
    rooms: roomManager.stats().rooms,
    supabaseConfigured: !!(
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !config.supabaseAnonKey.includes("your_anon")
    ),
  });
});

// Admin authentication & student activity tracking endpoints
app.get("/api/admin/status", (req, res) => {
  const token = extractBearerToken(req);
  const configured = isAdminConfigured();
  res.json({
    ok: true,
    configured,
    needsSetup: !configured,
    authenticated: isValidAdminToken(token),
  });
});

app.post("/api/admin/setup", (req, res) => {
  if (isAdminConfigured()) {
    return res.status(409).json({ ok: false, error: "Admin password is already configured." });
  }
  const password = String(req.body?.password || "");
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({
      ok: false,
      error: "Admin password must be between 8 and 128 characters.",
    });
  }
  const record = hashPasswordWithSalt(password);
  claimedAdminRecord = record;
  saveClaimedAdminHash(record);
  const token = createAdminToken();
  res.json({ ok: true, token });
});

app.post("/api/admin/login", (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(409).json({
      ok: false,
      needsSetup: true,
      error: "Admin password is not configured yet.",
    });
  }
  const rate = checkRateLimit(req);
  if (!rate.allowed) {
    return res.status(429).json({
      ok: false,
      error: `Too many login attempts. Try again in ${rate.retryAfterSec}s.`,
    });
  }
  const password = String(req.body?.password || "");
  if (!verifyAdminPassword(password)) {
    recordLoginFailure(req);
    return res.status(401).json({ ok: false, error: "Incorrect admin password." });
  }
  clearLoginFailures(req);
  const token = createAdminToken();
  res.json({ ok: true, token });
});

app.post("/api/admin/logout", (req, res) => {
  const token = extractBearerToken(req);
  if (token) adminTokens.delete(token);
  res.json({ ok: true });
});

app.get("/api/admin/activity", requireAdmin, async (_req, res) => {
  try {
    const sb = getSupabaseAdminClient();
    if (!sb) {
      return res.status(503).json({ ok: false, error: "Database client unavailable." });
    }

    const [profRes, scoreRes, progRes] = await Promise.all([
      sb
        .from("profiles")
        .select("id,username,display_name,created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      sb
        .from("scores")
        .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at,user_id")
        .order("at", { ascending: false })
        .limit(1000),
      sb
        .from("game_progress")
        .select("user_id,game_id,game_name,category,unit,stars,plays,best_score,max_score,best_accuracy,last_at,completed")
        .order("last_at", { ascending: false })
        .limit(2000),
    ]);

    const profiles = profRes.data || [];
    const scores = scoreRes.data || [];
    const progressRows = (progRes && progRes.data) || [];

    const warnings = [];
    if (profRes.error) warnings.push(`profiles: ${profRes.error.message}`);
    if (scoreRes.error) warnings.push(`scores: ${scoreRes.error.message}`);
    if (progRes && progRes.error) warnings.push(`game_progress: ${progRes.error.message}`);

    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const WEEK_MS = 7 * DAY_MS;

    const studentMap = new Map();
    const usernameIndex = new Map();
    const userIdIndex = new Map();

    profiles.forEach((p) => {
      const username = String(p.username || "").trim();
      const displayName = String(p.display_name || username || "Student").trim();
      const key = `uid:${p.id || username.toLowerCase() || displayName.toLowerCase()}`;
      const record = {
        key,
        userId: p.id || null,
        username,
        displayName,
        registered: true,
        joinedAt: toTimestamp(p.created_at),
        lastActiveAt: 0,
        totalScore: 0,
        totalStars: 0,
        totalPlays: 0,
        completedGames: 0,
        gamesById: {},
        recentScores: [],
      };
      studentMap.set(key, record);
      if (p.id) userIdIndex.set(p.id, key);
      if (username) usernameIndex.set(username.toLowerCase(), key);
      if (displayName && !usernameIndex.has(displayName.toLowerCase())) {
        usernameIndex.set(displayName.toLowerCase(), key);
      }
    });

    function resolveStudentForScore(row) {
      if (row.user_id && userIdIndex.has(row.user_id)) {
        return studentMap.get(userIdIndex.get(row.user_id));
      }
      const rawName = String(row.name || "Player").trim();
      const bareName = rawName.split(" · ")[0].trim().toLowerCase();
      if (bareName && usernameIndex.has(bareName)) {
        return studentMap.get(usernameIndex.get(bareName));
      }
      const fullLower = rawName.toLowerCase();
      if (fullLower && usernameIndex.has(fullLower)) {
        return studentMap.get(usernameIndex.get(fullLower));
      }
      const guestKey = `guest:${fullLower || "player"}`;
      if (!studentMap.has(guestKey)) {
        studentMap.set(guestKey, {
          key: guestKey,
          userId: null,
          username: "",
          displayName: rawName || "Guest Player",
          registered: false,
          joinedAt: 0,
          lastActiveAt: 0,
          totalScore: 0,
          totalStars: 0,
          totalPlays: 0,
          completedGames: 0,
          gamesById: {},
          recentScores: [],
        });
      }
      return studentMap.get(guestKey);
    }

    progressRows.forEach((r) => {
      if (!r.user_id || !userIdIndex.has(r.user_id)) return;
      const st = studentMap.get(userIdIndex.get(r.user_id));
      const gid = String(r.game_id || "game");
      const lastAt = toTimestamp(r.last_at);
      if (lastAt > st.lastActiveAt) st.lastActiveAt = lastAt;

      const prev = st.gamesById[gid];
      const stars = Math.max(0, Math.min(3, Number(r.stars) || 0));
      const plays = Math.max(0, Number(r.plays) || 0);
      const bestScore = Math.max(0, Number(r.best_score) || 0);
      const maxScore = Math.max(0, Number(r.max_score) || 0);
      const accuracy = Math.max(0, Math.min(100, Number(r.best_accuracy) || 0));

      st.gamesById[gid] = {
        id: gid,
        name: inferGameTitle(gid, r.game_name),
        category: inferCategory(gid, r.category),
        unit: String(r.unit || ""),
        stars: prev ? Math.max(prev.stars, stars) : stars,
        plays: prev ? Math.max(prev.plays, plays) : plays,
        bestScore: prev ? Math.max(prev.bestScore, bestScore) : bestScore,
        maxScore: prev ? Math.max(prev.maxScore, maxScore) : maxScore,
        accuracy: prev ? Math.max(prev.accuracy, accuracy) : accuracy,
        bestTimeMs: prev && prev.bestTimeMs ? prev.bestTimeMs : 0,
        completed: Boolean(r.completed || (prev && prev.completed)),
        lastAt: prev ? Math.max(prev.lastAt, lastAt) : lastAt,
        fromProgress: true,
      };
    });

    const gameStatsMap = new Map();

    function trackGameAggregate(gid, gname, category, playsDelta, accValue, lastAt) {
      if (!gid) return;
      if (!gameStatsMap.has(gid)) {
        gameStatsMap.set(gid, {
          id: gid,
          name: inferGameTitle(gid, gname),
          category: inferCategory(gid, category),
          totalPlays: 0,
          accuracySum: 0,
          accuracyCount: 0,
          lastAt: 0,
        });
      }
      const g = gameStatsMap.get(gid);
      g.totalPlays += playsDelta;
      if (accValue != null && Number.isFinite(accValue)) {
        g.accuracySum += accValue;
        g.accuracyCount += 1;
      }
      if (lastAt > g.lastAt) g.lastAt = lastAt;
    }

    const recentActivity = [];

    scores.forEach((r) => {
      const st = resolveStudentForScore(r);
      const score = Math.max(0, Number(r.score) || 0);
      const maxScore = r.max_score != null ? Math.max(0, Number(r.max_score) || 0) : 0;
      const ts = Number(r.at) || toTimestamp(r.created_at);
      const gid = String(r.game_id || r.game_name || "game");
      const gname = inferGameTitle(gid, r.game_name);
      const pct = maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : null;
      const timeMs = r.time_ms != null && Number(r.time_ms) > 0 ? Math.round(Number(r.time_ms)) : 0;

      st.totalScore += score;
      if (ts > st.lastActiveAt) st.lastActiveAt = ts;

      if (st.recentScores.length < 25) {
        st.recentScores.push({
          id: r.id,
          gameId: gid,
          gameName: gname,
          score,
          maxScore: maxScore || null,
          accuracy: pct,
          timeMs: timeMs || null,
          at: ts,
        });
      }

      if (!st.gamesById[gid]) {
        st.gamesById[gid] = {
          id: gid,
          name: gname,
          category: inferCategory(gid),
          unit: "",
          stars: pct != null ? (pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0) : 0,
          plays: 0,
          bestScore: 0,
          maxScore: 0,
          accuracy: 0,
          bestTimeMs: 0,
          completed: true,
          lastAt: 0,
          fromProgress: false,
        };
      }
      const g = st.gamesById[gid];
      if (timeMs > 0) {
        g.bestTimeMs = g.bestTimeMs > 0 ? Math.min(g.bestTimeMs, timeMs) : timeMs;
      }
      if (!g.fromProgress) {
        g.plays += 1;
        if (score > g.bestScore) {
          g.bestScore = score;
          g.maxScore = maxScore;
        }
        if (pct != null && pct > g.accuracy) {
          g.accuracy = pct;
          const inferredStars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
          if (inferredStars > g.stars) g.stars = inferredStars;
        }
        if (ts > g.lastAt) g.lastAt = ts;
      }

      if (recentActivity.length < 60) {
        recentActivity.push({
          id: r.id,
          studentKey: st.key,
          studentName: st.displayName,
          username: st.username,
          registered: st.registered,
          gameId: gid,
          gameName: gname,
          category: inferCategory(gid),
          score,
          maxScore: maxScore || null,
          accuracy: pct,
          timeMs: timeMs || null,
          at: ts,
        });
      }
    });

    const students = [];
    let registeredCount = 0;
    let guestCount = 0;
    let active24hCount = 0;
    let active7dCount = 0;
    let inactiveCount = 0;
    let totalPlaysAll = 0;
    let totalStarsAll = 0;
    let accSumAll = 0;
    let accCountAll = 0;

    for (const st of studentMap.values()) {
      const games = Object.values(st.gamesById).sort((a, b) => b.lastAt - a.lastAt);
      const totalStars = games.reduce((sum, g) => sum + (Number(g.stars) || 0), 0);
      const totalPlays = games.reduce((sum, g) => sum + (Number(g.plays) || 0), 0);
      const completedGames = games.filter((g) => g.completed || g.stars > 0).length;
      const accGames = games.filter((g) => g.accuracy > 0);
      const avgAccuracy = accGames.length
        ? Math.round(accGames.reduce((sum, g) => sum + g.accuracy, 0) / accGames.length)
        : 0;

      games.forEach((g) => {
        trackGameAggregate(
          g.id,
          g.name,
          g.category,
          g.plays || 1,
          g.accuracy > 0 ? g.accuracy : null,
          g.lastAt
        );
      });

      const active24h = st.lastActiveAt > 0 && now - st.lastActiveAt <= DAY_MS;
      const active7d = st.lastActiveAt > 0 && now - st.lastActiveAt <= WEEK_MS;
      const inactive = !active7d;

      if (st.registered) registeredCount += 1;
      else guestCount += 1;
      if (active24h) active24hCount += 1;
      if (active7d) active7dCount += 1;
      if (st.registered && inactive) inactiveCount += 1;

      totalPlaysAll += totalPlays;
      totalStarsAll += totalStars;
      if (avgAccuracy > 0) {
        accSumAll += avgAccuracy;
        accCountAll += 1;
      }

      students.push({
        key: st.key,
        userId: st.userId,
        username: st.username,
        displayName: st.displayName,
        registered: st.registered,
        joinedAt: st.joinedAt,
        lastActiveAt: st.lastActiveAt,
        active24h,
        active7d,
        totalScore: st.totalScore,
        totalStars,
        gamesPlayed: games.length,
        completedGames,
        totalPlays,
        avgAccuracy,
        games,
        recentScores: st.recentScores,
      });
    }

    students.sort((a, b) => {
      if (b.lastActiveAt !== a.lastActiveAt) return b.lastActiveAt - a.lastActiveAt;
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      if (b.joinedAt !== a.joinedAt) return b.joinedAt - a.joinedAt;
      return a.displayName.localeCompare(b.displayName);
    });

    const topGames = Array.from(gameStatsMap.values())
      .map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        totalPlays: g.totalPlays,
        avgAccuracy: g.accuracyCount ? Math.round(g.accuracySum / g.accuracyCount) : 0,
        lastAt: g.lastAt,
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, 12);

    res.json({
      ok: true,
      generatedAt: now,
      warnings,
      summary: {
        registeredCount,
        guestCount,
        totalStudents: students.length,
        active24hCount,
        active7dCount,
        inactiveCount,
        totalPlays: totalPlaysAll,
        totalStars: totalStarsAll,
        avgAccuracy: accCountAll ? Math.round(accSumAll / accCountAll) : 0,
        scoreSubmissions: scores.length,
        progressRows: progressRows.length,
      },
      students,
      recentActivity,
      topGames,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err && err.message ? err.message : "Failed to load activity.",
    });
  }
});

// Room metadata lookup so /j/:code and /multiplayer/ quick-join route to the right game
app.get("/api/rooms/:code", (req, res) => {
  const room = roomManager.getRoomByCode(req.params.code);
  if (!room) {
    return res.status(404).json({ ok: false, error: "Room not found" });
  }
  res.json({
    ok: true,
    code: room.code,
    gameType: room.gameType || "a-an-swipe",
    status: room.status,
    playerCount: Array.isArray(room.players) ? room.players.length : 0,
    maxPlayers: room.maxPlayers,
  });
});

// Apache rewrite equivalent for /j/<roomCode>
app.get("/j/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "j", "index.html"));
});

// Convenience alias so /learningarcade/students/ opens the Student Dashboard
app.get(["/learningarcade/students", "/learningarcade/students/"], (_req, res) => {
  res.redirect(302, "/learningarcade/profile/");
});

// Block direct web access to server/config internals
app.use((req, res, next) => {
  const rel = req.path.toLowerCase();
  if (
    rel.startsWith("/.env") ||
    rel.startsWith("/.git") ||
    rel.startsWith("/node_modules") ||
    rel.startsWith("/multiplayer-server/src") ||
    rel === "/server.js" ||
    rel === "/package.json" ||
    rel === "/package-lock.json"
  ) {
    return res.status(404).send("Not found");
  }
  next();
});

app.use(
  express.static(__dirname, {
    extensions: ["html"],
    index: ["index.html"],
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

attachSocket(io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT} (env=${config.nodeEnv})`);
});
