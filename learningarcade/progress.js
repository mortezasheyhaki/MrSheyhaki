/**
 * Learning Arcade — per-student progress (Appwrite Auth + TablesDB)
 * Public API: window.LAProgress
 *
 *   LAProgress.save({ gameId, gameName, category, unit, score, maxScore,
 *                     accuracy, completed, timeSeconds, stars })   -> Promise<result>
 *   LAProgress.getMine()      -> Promise<rows[]>     (this student's progress rows)
 *   LAProgress.getSummary()   -> Promise<summary>    (totals, recent, by category/unit)
 *
 * Rules
 *  - NEVER throws and never rejects: a game must keep working if saving fails.
 *  - Guests (not logged in) are skipped silently: { ok:false, skipped:'not-logged-in' }.
 *  - Identity comes from Appwrite (account.get()), never from localStorage.
 *  - Privacy is enforced by Appwrite row permissions (only the owner can read/update
 *    their rows) — see APPWRITE-SETUP.md.
 *
 * Tables (created in the Appwrite console, see APPWRITE-SETUP.md):
 *   progress  one row per student + game   (rowId = hash(uid|gameId) -> no duplicates)
 *   attempts  one row per finished game    (history; never overwritten)
 *
 * Load AFTER https://cdn.jsdelivr.net/npm/appwrite@26.2.0
 */
(function (global) {
  "use strict";

  var ENDPOINT = "https://fra.cloud.appwrite.io/v1";
  var PROJECT_ID = "6aafc5370019ebd5da7c";
  var DATABASE_ID = "6aafc5ce007461d09d3";
  var PROGRESS_TABLE = "progress";
  var ATTEMPTS_TABLE = "attempts";

  var MAX_TIME_PER_ATTEMPT = 7200; // seconds; ignore runaway timers
  var FAST_RUN_MIN_ACCURACY = 70;  // same rule as the speed leaderboard
  var DUP_WINDOW_MS = 4000;

  var ready = false, initError = null;
  var account = null, tablesDB = null, ID = null, Query = null, Permission = null, Role = null;
  var userCache = null;       // { user, at }
  var recent = {};            // dedupe: key -> timestamp

  // ---------- init ----------

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (typeof Appwrite === "undefined") { initError = "Appwrite SDK not loaded"; return false; }
    try {
      var client = new Appwrite.Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
      account = new Appwrite.Account(client);
      tablesDB = new (Appwrite.TablesDB || Appwrite.Databases)(client);
      ID = Appwrite.ID; Query = Appwrite.Query;
      Permission = Appwrite.Permission; Role = Appwrite.Role;
      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      return false;
    }
  }

  // ---------- helpers ----------

  function num(v) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function errCode(e) { return e && typeof e.code === "number" ? e.code : 0; }
  function pretty(s) {
    return String(s || "").replace(/[-_]+/g, " ").trim()
      .replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }
  function str(v, max) { return String(v == null ? "" : v).trim().slice(0, max); }

  /** Work out category/unit from the page URL when a game doesn't say. */
  function inferContext() {
    var path = "";
    try { path = decodeURIComponent(global.location.pathname || "").toLowerCase(); } catch (e) {}
    var m = path.match(/\/resources\/american-english-file\/([^\/]+)\/([^\/]+)(?:\/([ab])(?=\/))?/);
    if (m) {
      var level = m[1] === "starter" ? "Starter" : "Level " + m[1];
      var unit = /^unit-(\d+)$/.test(m[2]) ? "Unit " + m[2].replace("unit-", "") : pretty(m[2]);
      return { category: "Course games", unit: "AEF " + level + " · " + unit + (m[3] ? m[3].toUpperCase() : "") };
    }
    m = path.match(/\/learningarcade\/([^\/]+)(?:\/([^\/]+))?/);
    if (m && m[1] !== "profile" && m[1] !== "leaderboard") {
      var topic = m[2] && !/\.(html?|js)$/.test(m[2]) ? pretty(m[2]) : "";
      return { category: pretty(m[1]), unit: topic };
    }
    m = path.match(/\/topics\/([^\/]+)/);
    if (m) return { category: "Topics", unit: pretty(m[1]) };
    return { category: "Games", unit: "" };
  }

  function pageTitle() {
    try {
      return String(global.document.title || "").split(/[|–—·]/)[0].trim();
    } catch (e) { return ""; }
  }

  /** Clean up what a game gave us. Returns null if there is no usable gameId. */
  function normalize(o) {
    o = o || {};
    var gameId = str(o.gameId, 128).replace(/[^A-Za-z0-9_.\-]/g, "_");
    if (!gameId) return null;
    var ctx = inferContext();

    var score = num(o.score), maxScore = num(o.maxScore != null ? o.maxScore : o.total);
    var accuracy = num(o.accuracy);
    if (accuracy == null && score != null && maxScore > 0) accuracy = (score / maxScore) * 100;
    // Only an accuracy was reported (e.g. star-only games): keep it as a percentage.
    if (score == null && accuracy != null) { score = accuracy; maxScore = 100; }
    var scored = score != null || accuracy != null;

    var time = num(o.timeSeconds);
    if (time == null && num(o.timeMs) != null) time = num(o.timeMs) / 1000;
    time = time != null && time > 0 ? Math.min(Math.round(time), MAX_TIME_PER_ATTEMPT) : 0;

    var stars = num(o.stars);
    return {
      gameId: gameId,
      gameName: str(o.gameName || pageTitle() || pretty(gameId), 128),
      category: str(o.category || ctx.category, 64),
      unit: str(o.unit || ctx.unit, 128),
      scored: scored,
      score: scored ? Math.max(0, Math.round(score || 0)) : 0,
      maxScore: scored ? Math.max(0, Math.round(maxScore || 0)) : 0,
      accuracy: scored ? Math.round(clamp(accuracy || 0, 0, 100)) : 0,
      completed: o.completed !== false,
      timeSeconds: time,
      stars: stars != null ? clamp(Math.round(stars), 0, 3) : 0
    };
  }

  function isDuplicate(p) {
    var now = Date.now(), key = p.gameId + "|" + p.score + "|" + p.maxScore;
    Object.keys(recent).forEach(function (k) { if (now - recent[k] > DUP_WINDOW_MS) delete recent[k]; });
    if (recent[key]) return true;
    recent[key] = now;
    return false;
  }

  /** Identifies the stored Appwrite session; changes on login / logout / account switch. */
  function sessionKey() {
    try { return global.localStorage.getItem("cookieFallback") || ""; } catch (e) { return ""; }
  }

  function resetUserCache() { userCache = null; }

  /** The real signed-in Appwrite account, or null. Short cache, dropped whenever the session changes. */
  async function getUser() {
    if (userCache && userCache.key === sessionKey() && Date.now() - userCache.at < 15000) return userCache.user;
    userCache = null;
    try {
      var u = await account.get();
      userCache = { user: u, at: Date.now(), key: sessionKey() };
      return u;
    } catch (e) {
      userCache = null;
      if (errCode(e) === 401) return null; // guest
      throw e;                              // network etc. -> caller reports, never crashes
    }
  }

  /** Deterministic 32-char row id: one progress row per student + game. */
  async function rowIdFor(uid, gameId) {
    var text = uid + "|" + gameId;
    try {
      if (global.crypto && global.crypto.subtle) {
        var buf = await global.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("").slice(0, 32);
      }
    } catch (e) {}
    var h1 = 5381, h2 = 52711; // fallback for non-secure contexts
    for (var i = 0; i < text.length; i++) {
      h1 = ((h1 * 33) ^ text.charCodeAt(i)) >>> 0;
      h2 = ((h2 * 31) + text.charCodeAt(i) * 7) >>> 0;
    }
    return ("p" + h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0") + h1.toString(16).padStart(8, "0")).slice(0, 32);
  }

  /** Build the progress row: keep history (best/attempts), update latest. */
  function mergeRow(old, p, uid, now) {
    old = old || {};
    var attempts = (Number(old.attempts) || 0) + 1;
    var row = {
      userId: uid,
      gameId: p.gameId,
      gameName: p.gameName,
      category: p.category,
      unit: p.unit,
      attempts: attempts,
      completions: (Number(old.completions) || 0) + (p.completed ? 1 : 0),
      totalTimeSeconds: (Number(old.totalTimeSeconds) || 0) + p.timeSeconds,
      bestTimeSeconds: Number(old.bestTimeSeconds) || 0,
      bestStars: Math.max(Number(old.bestStars) || 0, p.stars),
      bestScore: Number(old.bestScore) || 0,
      bestMaxScore: Number(old.bestMaxScore) || 0,
      bestAccuracy: Number(old.bestAccuracy) || 0,
      latestScore: Number(old.latestScore) || 0,
      latestMaxScore: Number(old.latestMaxScore) || 0,
      latestAccuracy: Number(old.latestAccuracy) || 0,
      firstPlayedAt: Number(old.firstPlayedAt) || now,
      lastPlayedAt: now
    };
    if (p.scored) {
      row.latestScore = p.score; row.latestMaxScore = p.maxScore; row.latestAccuracy = p.accuracy;
      var better = !old.attempts || p.accuracy > row.bestAccuracy ||
        (p.accuracy === row.bestAccuracy && p.score > row.bestScore);
      if (better) { row.bestScore = p.score; row.bestMaxScore = p.maxScore; row.bestAccuracy = p.accuracy; }
    }
    if (p.completed && p.timeSeconds > 0 && p.scored && p.accuracy >= FAST_RUN_MIN_ACCURACY) {
      if (!row.bestTimeSeconds || p.timeSeconds < row.bestTimeSeconds) row.bestTimeSeconds = p.timeSeconds;
    }
    return row;
  }

  // ---------- save ----------

  async function save(opts) {
    try {
      if (!init()) return { ok: false, skipped: "sdk-unavailable" };
      var p = normalize(opts);
      if (!p) return { ok: false, skipped: "missing-gameId" };
      if (isDuplicate(p)) return { ok: true, skipped: "duplicate" };

      var user = await getUser();
      if (!user) return { ok: false, skipped: "not-logged-in" };
      var uid = user.$id, now = Date.now();
      var ownerPerms = [Permission.read(Role.user(uid)), Permission.update(Role.user(uid))];

      var rowId = await rowIdFor(uid, p.gameId);
      var old = null;
      try {
        old = await tablesDB.getRow({ databaseId: DATABASE_ID, tableId: PROGRESS_TABLE, rowId: rowId });
      } catch (e) { if (errCode(e) !== 404) throw e; }

      var row = mergeRow(old, p, uid, now);
      if (old) {
        await tablesDB.updateRow({ databaseId: DATABASE_ID, tableId: PROGRESS_TABLE, rowId: rowId, data: row });
      } else {
        try {
          await tablesDB.createRow({ databaseId: DATABASE_ID, tableId: PROGRESS_TABLE, rowId: rowId, data: row, permissions: ownerPerms });
        } catch (e2) {
          if (errCode(e2) !== 409) throw e2; // two tabs raced: the row now exists -> update it
          var again = await tablesDB.getRow({ databaseId: DATABASE_ID, tableId: PROGRESS_TABLE, rowId: rowId });
          await tablesDB.updateRow({ databaseId: DATABASE_ID, tableId: PROGRESS_TABLE, rowId: rowId, data: mergeRow(again, p, uid, now) });
        }
      }

      // History row (read-only for the student). Failure here must not hide the saved progress.
      try {
        await tablesDB.createRow({
          databaseId: DATABASE_ID, tableId: ATTEMPTS_TABLE, rowId: ID.unique(),
          data: {
            userId: uid, gameId: p.gameId, gameName: p.gameName, category: p.category, unit: p.unit,
            score: p.score, maxScore: p.maxScore, accuracy: p.accuracy, completed: p.completed,
            timeSeconds: p.timeSeconds, stars: p.stars, at: now
          },
          permissions: [Permission.read(Role.user(uid))]
        });
      } catch (e3) { console.warn("[LAProgress] attempt history not saved", e3 && e3.message); }

      return { ok: true, progress: row };
    } catch (e) {
      console.warn("[LAProgress] save failed (game unaffected):", e && e.message ? e.message : e);
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  }

  // ---------- read ----------

  /** This student's progress rows (Appwrite only returns rows they own). */
  async function getMine() {
    try {
      if (!init()) return [];
      var user = await getUser();
      if (!user) return [];
      var rows = [], last = null;
      for (var page = 0; page < 30; page++) {
        var q = [Query.equal("userId", user.$id), Query.limit(100)];
        if (last) q.push(Query.cursorAfter(last));
        var res = await tablesDB.listRows({ databaseId: DATABASE_ID, tableId: PROGRESS_TABLE, queries: q });
        var batch = res.rows || res.documents || [];
        rows = rows.concat(batch);
        if (batch.length < 100) break;
        last = batch[batch.length - 1].$id;
      }
      return rows;
    } catch (e) {
      console.warn("[LAProgress] getMine failed", e && e.message ? e.message : e);
      return [];
    }
  }

  function summarize(rows) {
    var s = { gamesPlayed: rows.length, gamesCompleted: 0, totalAttempts: 0, totalTimeSeconds: 0,
              totalStars: 0, averageBestAccuracy: 0, recent: [], byCategory: {}, byUnit: {} };
    var accSum = 0, accN = 0;
    rows.forEach(function (r) {
      var done = Number(r.completions) > 0;
      if (done) s.gamesCompleted++;
      s.totalAttempts += Number(r.attempts) || 0;
      s.totalTimeSeconds += Number(r.totalTimeSeconds) || 0;
      s.totalStars += Number(r.bestStars) || 0;
      if (Number(r.bestMaxScore) > 0) { accSum += Number(r.bestAccuracy) || 0; accN++; }
      [["byCategory", r.category || "Games"], ["byUnit", r.unit || "—"]].forEach(function (pair) {
        var bucket = s[pair[0]], k = pair[1];
        bucket[k] = bucket[k] || { games: 0, completed: 0, attempts: 0, accSum: 0, accN: 0 };
        bucket[k].games++; if (done) bucket[k].completed++;
        bucket[k].attempts += Number(r.attempts) || 0;
        if (Number(r.bestMaxScore) > 0) { bucket[k].accSum += Number(r.bestAccuracy) || 0; bucket[k].accN++; }
      });
    });
    s.averageBestAccuracy = accN ? Math.round(accSum / accN) : 0;
    [s.byCategory, s.byUnit].forEach(function (b) {
      Object.keys(b).forEach(function (k) {
        b[k].averageBestAccuracy = b[k].accN ? Math.round(b[k].accSum / b[k].accN) : 0;
        delete b[k].accSum; delete b[k].accN;
      });
    });
    s.recent = rows.slice().sort(function (a, b) { return (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0); }).slice(0, 8);
    return s;
  }

  async function getSummary() {
    return summarize(await getMine());
  }

  global.LAProgress = {
    save: save,
    getMine: getMine,
    getSummary: getSummary,
    reset: resetUserCache,
    isLoggedIn: async function () { try { return !!(init() && (await getUser())); } catch (e) { return false; } },
    _internal: { normalize: normalize, mergeRow: mergeRow, summarize: summarize, inferContext: inferContext, rowIdFor: rowIdFor }
  };
})(typeof window !== "undefined" ? window : this);
