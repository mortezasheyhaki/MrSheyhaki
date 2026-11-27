/**
 * Learning Arcade — per-student progress on Supabase
 * Public API: window.LAProgress
 *
 *   LAProgress.save({ gameId, gameName, category, unit, score, maxScore,
 *                     accuracy, completed, timeSeconds, stars, playsDelta })
 *   LAProgress.getMine()
 *   LAProgress.getSummary()
 *   LAProgress.reset()
 *
 * Never throws. Guests are skipped. Identity from LAAuth / supabase session.
 */
(function (global) {
  "use strict";

  var DUP_WINDOW_MS = 4000;
  var recent = {};

  function num(v) {
    var n = Number(v);
    return isFinite(n) ? n : null;
  }
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function str(v, max) {
    return String(v == null ? "" : v).trim().slice(0, max || 128);
  }
  function pretty(s) {
    return String(s || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }
  function inferCategory(gameId, explicitCategory) {
    if (global.LASkillCatalog && typeof global.LASkillCatalog.inferCategory === "function") {
      return global.LASkillCatalog.inferCategory(gameId, explicitCategory);
    }
    var raw = String(explicitCategory || "").trim();
    var low = raw.toLowerCase();
    if (raw && low !== "general" && low !== "starter" && low !== "starter course" && low !== "tactics-for-listening") {
      if (low === "vocab") return "Vocabulary";
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    var id = String(gameId || "").toLowerCase();
    if (id.indexOf("pronunciation") !== -1 || id.indexOf("plural-s-") !== -1 || id.indexOf("three-sounds") !== -1) return "Pronunciation";
    if (id.indexOf("tfl-") === 0 || id.indexOf("listening-") === 0 || id.indexOf("listen-") !== -1 || id.indexOf("sound-match") !== -1 || id.indexOf("dictation") !== -1) return "Listening";
    if (id.indexOf("speaking-") === 0 || id.indexOf("-roleplay") !== -1 || id.indexOf("-speaking") !== -1) return "Speaking";
    if (id.indexOf("reading-") === 0 || id.indexOf("-reading") !== -1) return "Reading";
    if (id.indexOf("writing-") === 0 || id.indexOf("-write") !== -1 || id.indexOf("-writing") !== -1) return "Writing";
    if (id.indexOf("vocab-") === 0 || id.indexOf("flashcards") !== -1 || id.indexOf("match-rush") !== -1 || id.indexOf("opposite-snap") !== -1 || id.indexOf("-match") !== -1 || id.indexOf("unscramble") !== -1) return "Vocabulary";
    if (id.indexOf("grammar-") === 0 || id === "be-verbs" || id === "nouns" || id === "there-is-there-are" || id === "simple-present" || id === "simple-past" || id === "present-perfect" || id.indexOf("-sentences") !== -1 || id.indexOf("-question") !== -1) return "Grammar";
    if (id.indexOf("topics-") === 0) return "Topics";
    return "General";
  }

  function getClient() {
    try {
      if (global.LAAuth && typeof LAAuth.getClient === "function") {
        var c = LAAuth.getClient();
        if (c) return c;
      }
    } catch (e) {}
    return null;
  }

  function getUserId() {
    try {
      if (global.LAAuth && typeof LAAuth.currentUser === "function") {
        var p = LAAuth.currentUser();
        if (p && (p.id || p.$id || p.userId)) return p.id || p.$id || p.userId;
      }
    } catch (e) {}
    return null;
  }

  function maybeLoggedIn() {
    try {
      if (global.LAAuth && typeof LAAuth.isLoggedIn === "function") return !!LAAuth.isLoggedIn();
      if (global.LAAuth && typeof LAAuth.currentUser === "function") return !!LAAuth.currentUser();
    } catch (e) {}
    return false;
  }

  function normalize(o) {
    if (!o) return null;
    var gameId = str(o.gameId, 128).replace(/[^A-Za-z0-9_.\-]/g, "_");
    if (!gameId) return null;
    var score = num(o.score);
    var maxScore = num(o.maxScore);
    var accuracy = num(o.accuracy);
    if (accuracy == null && score != null && maxScore && maxScore > 0) {
      accuracy = Math.round((score / maxScore) * 100);
    }
    var stars = num(o.stars);
    if (stars == null && accuracy != null) {
      stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    }
    return {
      gameId: gameId,
      gameName: str(o.gameName || pretty(gameId), 128),
      category: inferCategory(gameId, o.category),
      unit: str(o.unit, 64),
      score: score != null ? Math.max(0, Math.round(score)) : 0,
      maxScore: maxScore != null ? Math.max(0, Math.round(maxScore)) : 0,
      accuracy: accuracy != null ? clamp(Math.round(accuracy), 0, 100) : 0,
      completed: o.completed !== false,
      stars: stars != null ? clamp(Math.round(stars), 0, 3) : 0,
      playsDelta: Math.max(0, Math.round(num(o.playsDelta) || 0))
    };
  }

  function isDuplicate(p) {
    var now = Date.now();
    var key = p.gameId + "|" + p.score + "|" + p.maxScore + "|" + p.stars;
    Object.keys(recent).forEach(function (k) {
      if (now - recent[k] > DUP_WINDOW_MS) delete recent[k];
    });
    if (recent[key] && now - recent[key] < DUP_WINDOW_MS) return true;
    recent[key] = now;
    return false;
  }

  function normalizeRow(r) {
    var gid = r.game_id || r.gameId || "game";
    var lastMs = r.last_at ? new Date(r.last_at).getTime() : (Number(r.lastPlayedAt) || 0);
    if (!isFinite(lastMs)) lastMs = 0;
    return {
      user_id: r.user_id,
      game_id: gid,
      game_name: r.game_name || pretty(gid),
      gameId: gid,
      gameName: r.game_name || pretty(gid),
      category: inferCategory(gid, r.category),
      unit: r.unit || "",
      stars: Math.max(0, Math.min(3, Number(r.stars) || 0)),
      plays: Number(r.plays) || 0,
      attempts: Number(r.plays) || 0,
      best_score: Number(r.best_score) || 0,
      bestScore: Number(r.best_score) || 0,
      max_score: Number(r.max_score) || 0,
      bestMaxScore: Number(r.max_score) || 0,
      latestScore: Number(r.best_score) || 0,
      latestMaxScore: Number(r.max_score) || 0,
      best_accuracy: Number(r.best_accuracy) || 0,
      bestAccuracy: Number(r.best_accuracy) || 0,
      completed: !!r.completed,
      last_at: r.last_at || null,
      lastPlayedAt: lastMs
    };
  }

  async function save(opts) {
    try {
      if (!maybeLoggedIn()) return { ok: false, skipped: "not-logged-in" };
      var p = normalize(opts);
      if (!p) return { ok: false, skipped: "missing-gameId" };
      if (isDuplicate(p)) return { ok: true, skipped: "duplicate" };

      var client = getClient();
      var uid = getUserId();
      if (!client || !uid) return { ok: false, skipped: "no-session" };

      var existing = null;
      try {
        var q = await client
          .from("game_progress")
          .select("*")
          .eq("user_id", uid)
          .eq("game_id", p.gameId)
          .maybeSingle();
        if (q && !q.error) existing = q.data;
      } catch (e0) {}

      var stars = Math.max(p.stars, existing ? Number(existing.stars) || 0 : 0);
      var bestScore = Math.max(p.score, existing ? Number(existing.best_score) || 0 : 0);
      var maxScore = Math.max(p.maxScore, existing ? Number(existing.max_score) || 0 : 0);
      var bestAcc = Math.max(p.accuracy, existing ? Number(existing.best_accuracy) || 0 : 0);
      var plays = (existing ? Number(existing.plays) || 0 : 0) + (p.playsDelta || (existing ? 0 : 1));
      if (!existing && p.playsDelta === 0) plays = 1;

      var row = {
        user_id: uid,
        game_id: p.gameId,
        game_name: p.gameName || (existing && existing.game_name) || p.gameId,
        category: p.category || (existing && existing.category) || null,
        unit: p.unit || (existing && existing.unit) || null,
        stars: stars,
        plays: plays,
        best_score: bestScore,
        max_score: maxScore,
        best_accuracy: bestAcc,
        completed: !!(p.completed || (existing && existing.completed)),
        last_at: new Date().toISOString()
      };

      var res = await client
        .from("game_progress")
        .upsert(row, { onConflict: "user_id,game_id" })
        .select()
        .maybeSingle();

      if (res && res.error) {
        console.warn("[LAProgress] save failed:", res.error.message);
        return { ok: false, error: res.error.message };
      }
      return { ok: true, progress: res && res.data ? res.data : row };
    } catch (e) {
      console.warn("[LAProgress] save failed:", e && e.message ? e.message : e);
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  }

  async function getMine() {
    try {
      if (!maybeLoggedIn()) return [];
      var client = getClient();
      var uid = getUserId();
      if (!client || !uid) return [];
      var res = await client
        .from("game_progress")
        .select("*")
        .eq("user_id", uid)
        .order("last_at", { ascending: false })
        .limit(500);
      if (res.error) {
        console.warn("[LAProgress] getMine:", res.error.message);
        return [];
      }
      return (res.data || []).map(normalizeRow);
    } catch (e) {
      return [];
    }
  }

  async function getSummary() {
    var rows = await getMine();
    var gamesPlayed = rows.length;
    var gamesCompleted = 0;
    var totalAttempts = 0;
    var totalStars = 0;
    var accSum = 0;
    var accCount = 0;
    var lastPlayedAt = 0;
    var byCategory = {};

    rows.forEach(function (r) {
      if (r.completed || r.stars > 0) gamesCompleted += 1;
      totalAttempts += r.attempts;
      totalStars += r.stars;
      if (r.bestAccuracy > 0) {
        accSum += r.bestAccuracy;
        accCount += 1;
      }
      if (r.lastPlayedAt > lastPlayedAt) lastPlayedAt = r.lastPlayedAt;

      var cat = r.category || "General";
      if (!byCategory[cat]) {
        byCategory[cat] = {
          games: 0,
          completed: 0,
          attempts: 0,
          stars: 0,
          accSum: 0,
          accCount: 0,
          averageBestAccuracy: 0
        };
      }
      var bucket = byCategory[cat];
      bucket.games += 1;
      if (r.completed || r.stars > 0) bucket.completed += 1;
      bucket.attempts += r.attempts;
      bucket.stars += r.stars;
      if (r.bestAccuracy > 0) {
        bucket.accSum += r.bestAccuracy;
        bucket.accCount += 1;
      }
    });

    Object.keys(byCategory).forEach(function (k) {
      var b = byCategory[k];
      b.averageBestAccuracy = b.accCount ? Math.round(b.accSum / b.accCount) : 0;
    });

    return {
      gamesPlayed: gamesPlayed,
      gamesCompleted: gamesCompleted,
      totalAttempts: totalAttempts,
      totalStars: totalStars,
      averageBestAccuracy: accCount ? Math.round(accSum / accCount) : 0,
      totalTimeSeconds: 0,
      lastPlayedAt: lastPlayedAt,
      byCategory: byCategory,
      rows: rows
    };
  }

  function reset() {
    recent = {};
  }

  global.LAProgress = {
    save: function (payload) {
      return Promise.resolve(save(payload)).catch(function () {
        return { ok: false };
      });
    },
    getMine: function () {
      return Promise.resolve(getMine()).catch(function () {
        return [];
      });
    },
    getSummary: function () {
      return Promise.resolve(getSummary()).catch(function () {
        return {
          gamesPlayed: 0,
          gamesCompleted: 0,
          totalAttempts: 0,
          totalStars: 0,
          averageBestAccuracy: 0,
          totalTimeSeconds: 0,
          lastPlayedAt: 0,
          byCategory: {},
          rows: []
        };
      });
    },
    reset: reset
  };

  global.LAProgressSave = function (payload) {
    return global.LAProgress.save(payload);
  };
})(typeof window !== "undefined" ? window : this);
