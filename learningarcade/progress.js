/**
 * Learning Arcade — per-student progress on Supabase
 * Public API: window.LAProgress
 *
 *   LAProgress.save({ gameId, gameName, category, unit, score, maxScore,
 *                     accuracy, completed, timeSeconds, stars, playsDelta })
 *   LAProgress.getMine()
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

  function getClient() {
    try {
      if (global.LAAuth && typeof LAAuth.getClient === "function") {
        var c = LAAuth.getClient();
        if (c) return c;
      }
    } catch (e) {}
    try {
      if (global.supabase && typeof global.supabase.createClient === "function") {
        // fall through — prefer LAAuth which already has the project keys
      }
    } catch (e2) {}
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
      category: str(o.category, 64),
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

  async function save(opts) {
    try {
      if (!maybeLoggedIn()) return { ok: false, skipped: "not-logged-in" };
      var p = normalize(opts);
      if (!p) return { ok: false, skipped: "missing-gameId" };
      if (isDuplicate(p)) return { ok: true, skipped: "duplicate" };

      var client = getClient();
      var uid = getUserId();
      if (!client || !uid) return { ok: false, skipped: "no-session" };

      // read existing row
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
      return res.data || [];
    } catch (e) {
      return [];
    }
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
    }
  };
})(typeof window !== "undefined" ? window : this);
