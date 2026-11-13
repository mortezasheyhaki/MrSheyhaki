/**
 * Learning Arcade — Scoreboard helper on Supabase
 * Public API: global.LAScores  (same shape as the old Appwrite version)
 *
 * Load AFTER Supabase SDK (optional if only submitting as guest):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="/learningarcade/firebase-scores.js"></script>
 *
 * CONFIG — use the SAME values as auth.js
 */
(function (global) {
  "use strict";

  // ========== CONFIG (required) ==========
  var SUPABASE_URL = "https://ezlcrygimvceusmnojgk.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bGNyeWdpbXZjZXVzbW5vamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNjU4NjQsImV4cCI6MjEwOTk0MTg2NH0.R3a0dMRDCHaAbDKRGhLssvYfg8HzcEb5ODF5xfUt_Ys";
  // =======================================

  var NAME_KEY = "laPlayerName";
  var CLASS_KEY = "laClassCode";
  var ready = false;
  var initError = null;
  var sb = null;

  function init() {
    if (ready) return true;
    if (initError) return false;
    if (!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR_PROJECT") !== -1) {
      initError = "Supabase URL not configured — edit firebase-scores.js";
      console.warn("[LAScores]", initError);
      return false;
    }
    if (typeof supabase === "undefined" || typeof supabase.createClient !== "function") {
      // Reuse LAAuth client if available
      if (global.LAAuth && typeof LAAuth.getClient === "function") {
        sb = LAAuth.getClient();
        if (sb) {
          ready = true;
          return true;
        }
      }
      initError = "Supabase SDK not loaded";
      console.warn("[LAScores]", initError);
      return false;
    }
    try {
      if (global.LAAuth && typeof LAAuth.getClient === "function" && LAAuth.getClient()) {
        sb = LAAuth.getClient();
      } else {
        sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
      ready = true;
      return true;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      console.warn("[LAScores]", initError);
      return false;
    }
  }

  function ensureAuth() {
    return init();
  }

  function getPlayerName() {
    try {
      return localStorage.getItem(NAME_KEY) || "";
    } catch (e) {
      return "";
    }
  }
  function setPlayerName(n) {
    try {
      localStorage.setItem(NAME_KEY, String(n || "").trim().slice(0, 32));
    } catch (e) {}
  }
  function getClassCode() {
    try {
      return localStorage.getItem(CLASS_KEY) || "";
    } catch (e) {
      return "";
    }
  }
  function setClassCode(c) {
    try {
      localStorage.setItem(CLASS_KEY, String(c || "").trim().slice(0, 16));
    } catch (e) {}
  }
  function getDisplayName(name, code) {
    name = (name != null ? name : getPlayerName()) || "";
    code = code != null ? code : getClassCode();
    name = String(name).trim();
    code = String(code || "").trim();
    return code ? name + " · " + code : name;
  }

  function nameMatchesPlayer(rowName) {
    var row = String(rowName || "").trim().toLowerCase();
    if (!row) return false;
    var display = getDisplayName().toLowerCase();
    if (display && row === display) return true;
    var plain = getPlayerName().toLowerCase();
    var code = getClassCode().toLowerCase();
    if (!plain) return false;
    if (row === plain) return true;
    if (code && row === plain + " · " + code) return true;
    if (code && row.indexOf(plain + " · ") === 0) {
      return row.slice(plain.length + 3) === code;
    }
    return false;
  }

  function sanitizeGameId(id) {
    return String(id || "game")
      .replace(/[.#$\[\]]/g, "_")
      .slice(0, 64);
  }

  function submit(opts) {
    opts = opts || {};
    if (!init()) {
      return Promise.resolve({ ok: false, error: initError || "Supabase not ready" });
    }

    var sessionUser = null;
    if (global.LAAuth && typeof LAAuth.currentUser === "function") {
      sessionUser = LAAuth.currentUser();
    }

    var rawName = (opts.name != null ? String(opts.name) : getPlayerName()).trim().slice(0, 32);
    if (!rawName && sessionUser && sessionUser.displayName) {
      rawName = String(sessionUser.displayName).trim().slice(0, 32);
    }
    if (!rawName && sessionUser && sessionUser.username) {
      rawName = String(sessionUser.username).trim().slice(0, 32);
    }
    if (!rawName) {
      return Promise.resolve({ ok: false, error: "Please enter a name" });
    }
    setPlayerName(rawName);
    if (opts.classCode != null) setClassCode(opts.classCode);
    var classCode = getClassCode();
    var name = getDisplayName(rawName, classCode);

    var gameId = sanitizeGameId(opts.gameId);
    var score = Number(opts.score);
    if (!isFinite(score)) score = 0;
    score = Math.max(0, Math.round(score));

    var row = {
      name: name,
      score: score,
      game_id: gameId,
      game_name: opts.gameName ? String(opts.gameName).slice(0, 80) : gameId,
      at: Date.now(),
    };
    if (opts.maxScore != null && isFinite(Number(opts.maxScore))) {
      row.max_score = Number(opts.maxScore);
    }
    if (opts.timeMs != null && isFinite(Number(opts.timeMs))) {
      row.time_ms = Math.round(Number(opts.timeMs));
    }
    if (sessionUser && sessionUser.id) {
      row.user_id = sessionUser.id;
    }

    return sb
      .from("scores")
      .insert([row])
      .select("id")
      .then(function (res) {
        if (res.error) {
          console.warn("[LAScores] submit failed", res.error);
          return { ok: false, error: res.error.message || "Submit failed" };
        }
        return { ok: true, id: res.data && res.data[0] ? res.data[0].id : null };
      })
      .catch(function (err) {
        console.warn("[LAScores] submit failed", err);
        return { ok: false, error: err && err.message ? err.message : "Submit failed" };
      });
  }

  function top(gameId, limit) {
    if (!init()) return Promise.resolve([]);
    limit = limit || 20;
    gameId = sanitizeGameId(gameId);
    return sb
      .from("scores")
      .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at")
      .eq("game_id", gameId)
      .order("score", { ascending: false })
      .limit(limit)
      .then(function (res) {
        if (res.error) {
          console.warn("[LAScores] top failed", res.error);
          return [];
        }
        return (res.data || []).map(function (r) {
          return {
            key: r.id,
            gameId: r.game_id,
            name: r.name || "Player",
            score: Number(r.score) || 0,
            maxScore: r.max_score != null ? Number(r.max_score) : null,
            gameName: r.game_name || r.game_id,
            at: r.at || 0,
            iso: r.created_at || "",
          };
        });
      })
      .catch(function (err) {
        console.warn("[LAScores] top failed", err);
        return [];
      });
  }

  function topByTime(gameId, limit, minAccuracy) {
    if (!init()) return Promise.resolve([]);
    limit = limit || 20;
    gameId = sanitizeGameId(gameId);
    return sb
      .from("scores")
      .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at")
      .eq("game_id", gameId)
      .not("time_ms", "is", null)
      .order("time_ms", { ascending: true })
      .limit(Math.max(limit * 3, 40))
      .then(function (res) {
        if (res.error) {
          console.warn("[LAScores] topByTime failed", res.error);
          return [];
        }
        var rows = [];
        var seen = {};
        (res.data || []).forEach(function (r) {
          if (minAccuracy != null && r.max_score) {
            var pct = (Number(r.score) / Number(r.max_score)) * 100;
            if (pct < minAccuracy) return;
          }
          var key = String(r.name || "").toLowerCase();
          if (seen[key]) return;
          seen[key] = true;
          rows.push({
            key: r.id,
            gameId: r.game_id,
            name: r.name || "Player",
            score: Number(r.score) || 0,
            maxScore: r.max_score != null ? Number(r.max_score) : null,
            timeMs: r.time_ms != null ? Number(r.time_ms) : null,
            gameName: r.game_name || r.game_id,
            at: r.at || 0,
          });
        });
        return rows.slice(0, limit);
      })
      .catch(function (err) {
        console.warn("[LAScores] topByTime failed", err);
        return [];
      });
  }

  function myScores() {
    if (!init()) return Promise.resolve([]);
    if (!getPlayerName()) return Promise.resolve([]);
    return sb
      .from("scores")
      .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at")
      .order("at", { ascending: false })
      .limit(100)
      .then(function (res) {
        if (res.error) return [];
        var rows = [];
        (res.data || []).forEach(function (r) {
          if (!nameMatchesPlayer(r.name)) return;
          rows.push({
            key: r.id,
            gameId: r.game_id,
            name: r.name || "Player",
            score: Number(r.score) || 0,
            maxScore: r.max_score != null ? Number(r.max_score) : null,
            gameName: r.game_name || r.game_id,
            at: r.at || 0,
            iso: r.created_at || "",
          });
        });
        return rows;
      })
      .catch(function () {
        return [];
      });
  }

  function listGames() {
    if (!init()) return Promise.resolve([]);
    return sb
      .from("scores")
      .select("game_id")
      .limit(200)
      .then(function (res) {
        if (res.error) return [];
        var seen = {};
        var ids = [];
        (res.data || []).forEach(function (r) {
          var gid = r.game_id;
          if (gid && !seen[gid]) {
            seen[gid] = true;
            ids.push(gid);
          }
        });
        return ids;
      })
      .catch(function () {
        return [];
      });
  }

  global.LAScores = {
    init: init,
    ensureAuth: ensureAuth,
    getPlayerName: getPlayerName,
    setPlayerName: setPlayerName,
    getClassCode: getClassCode,
    setClassCode: setClassCode,
    getDisplayName: getDisplayName,
    submit: submit,
    top: top,
    topByTime: topByTime,
    myScores: myScores,
    listGames: listGames,
    GAMES: {
      "opposite-snap": { title: "Opposite Snap", maxScore: null },
      "sound-match-picture": { title: "Sound Match Picture", maxScore: 16 },
    },
  };
})(typeof window !== "undefined" ? window : this);
