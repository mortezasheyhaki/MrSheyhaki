/**
 * Learning Arcade — Unified Leaderboard & Scoreboard helper on Supabase
 * Public API: global.LAScores
 *
 * Load AFTER Supabase SDK (optional if using /api/leaderboard):
 *   <script src="/learningarcade/vendor/supabase.min.js"></script>
 *   <script src="/learningarcade/firebase-scores.js"></script>
 */
(function (global) {
  "use strict";

  // ========== CONFIG (same project as auth.js) ==========
  var SUPABASE_URL = "https://ezlcrygimvceusmnojgk.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bGNyeWdpbXZjZXVzbW5vamdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNjU4NjQsImV4cCI6MjEwOTk0MTg2NH0.R3a0dMRDCHaAbDKRGhLssvYfg8HzcEb5ODF5xfUt_Ys";
  // =====================================================

  var NAME_KEY = "laPlayerName";
  var CLASS_KEY = "laClassCode";
  var CACHE_TTL_MS = 15000;
  var REQUEST_TIMEOUT_MS = 8000;

  var RANKS = [
    { tier: 1, name: "Bronze Novice", icon: "🥉", minXp: 0 },
    { tier: 2, name: "Silver Explorer", icon: "🥈", minXp: 150 },
    { tier: 3, name: "Gold Challenger", icon: "🥇", minXp: 450 },
    { tier: 4, name: "Platinum Scholar", icon: "💠", minXp: 1000 },
    { tier: 5, name: "Diamond Legend", icon: "👑", minXp: 2000 },
  ];

  var ready = false;
  var initError = null;
  var sb = null;
  var lbCache = { at: 0, data: null };
  var lbInflight = null;

  function withTimeout(promise, ms, fallback) {
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) {
          done = true;
          resolve(typeof fallback === "function" ? fallback() : fallback);
        }
      }, ms || REQUEST_TIMEOUT_MS);
      Promise.resolve(promise)
        .then(function (val) {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(val);
          }
        })
        .catch(function () {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(typeof fallback === "function" ? fallback() : fallback);
          }
        });
    });
  }

  function init() {
    if (ready && sb) return true;
    if (!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR_PROJECT") !== -1) {
      initError = "Supabase URL not configured";
      return false;
    }
    try {
      if (global.LAAuth && typeof LAAuth.getClient === "function") {
        var authClient = LAAuth.getClient();
        if (authClient) {
          sb = authClient;
          ready = true;
          initError = null;
          return true;
        }
      }
      if (typeof supabase !== "undefined" && typeof supabase.createClient === "function") {
        sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        ready = true;
        initError = null;
        return true;
      }
      initError = "Supabase SDK not loaded";
      return false;
    } catch (e) {
      initError = e && e.message ? e.message : String(e);
      return false;
    }
  }

  // Always return a real Promise so legacy .then()/.catch() callers never throw
  function ensureAuth() {
    return Promise.resolve(init());
  }

  function getSessionUser() {
    try {
      if (global.LAAuth && typeof LAAuth.currentUser === "function") {
        return LAAuth.currentUser();
      }
      if (global.LAAuth && typeof LAAuth.getSession === "function") {
        return LAAuth.getSession();
      }
    } catch (e) {}
    return null;
  }

  function getPlayerName() {
    try {
      var stored = localStorage.getItem(NAME_KEY) || "";
      if (stored) return stored;
    } catch (e) {}
    var u = getSessionUser();
    if (u && (u.displayName || u.username)) {
      return String(u.displayName || u.username).trim().slice(0, 32);
    }
    return "";
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
      var val = String(c || "").trim().slice(0, 16);
      if (val) localStorage.setItem(CLASS_KEY, val);
      else localStorage.removeItem(CLASS_KEY);
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

  function prettyTitle(id, fallbackName) {
    if (global.LASkillCatalog && typeof global.LASkillCatalog.getTitle === "function") {
      var catTitle = global.LASkillCatalog.getTitle(id, fallbackName && fallbackName !== id ? fallbackName : "");
      if (catTitle) return catTitle;
    }
    if (GAMES[id] && GAMES[id].title) return GAMES[id].title;
    if (fallbackName && String(fallbackName).trim() && fallbackName !== id) {
      return String(fallbackName).trim();
    }
    return String(id || "Game")
      .replace(/^(starter|t2t\d+|tfl-(?:basic|developing)|1)-\d*[a-z]?\d*-/i, "")
      .replace(/^(starter-pe\d+|vocab|writing|grammar|listening|speaking|reading|topics)-/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function inferCategory(id, explicitCategory) {
    if (global.LASkillCatalog && typeof global.LASkillCatalog.inferCategory === "function") {
      return global.LASkillCatalog.inferCategory(id, explicitCategory);
    }
    var raw = String(explicitCategory || "").trim();
    if (raw && raw.toLowerCase() !== "general") return raw.charAt(0).toUpperCase() + raw.slice(1);
    var s = String(id || "").toLowerCase();
    if (s.indexOf("pronunciation") !== -1 || s.indexOf("plural-s-") !== -1 || s.indexOf("three-sounds") !== -1) return "Pronunciation";
    if (s.indexOf("tfl-") === 0 || s.indexOf("listening-") === 0 || s.indexOf("listen-") !== -1 || s.indexOf("sound-match") !== -1 || s.indexOf("dictation") !== -1) return "Listening";
    if (s.indexOf("speaking-") === 0 || s.indexOf("-roleplay") !== -1 || s.indexOf("-speaking") !== -1) return "Speaking";
    if (s.indexOf("reading-") === 0 || s.indexOf("-reading") !== -1) return "Reading";
    if (s.indexOf("writing-") === 0 || s.indexOf("-write") !== -1 || s.indexOf("-writing") !== -1) return "Writing";
    if (s.indexOf("vocab-") === 0 || s.indexOf("flashcards") !== -1 || s.indexOf("match-rush") !== -1 || s.indexOf("opposite-snap") !== -1 || s.indexOf("-match") !== -1 || s.indexOf("unscramble") !== -1) return "Vocabulary";
    if (s.indexOf("grammar-") === 0 || s === "be-verbs" || s === "nouns" || s === "there-is-there-are" || s === "simple-present" || s === "simple-past" || s === "present-perfect" || s.indexOf("-sentences") !== -1 || s.indexOf("-question") !== -1) return "Grammar";
    if (s.indexOf("topics-") === 0) return "Topics";
    return "General";
  }

  function rankForXp(xp) {
    var cur = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXp) cur = RANKS[i];
    }
    return cur;
  }

  function parseTimestampMs(val) {
    if (val == null || val === "") return 0;
    if (typeof val === "number" && isFinite(val)) return val > 1e12 ? val : val * 1000;
    var n = Number(val);
    if (isFinite(n) && n > 0) return n > 1e12 ? n : n * 1000;
    var parsed = Date.parse(String(val));
    return isFinite(parsed) ? parsed : 0;
  }

  function computeDailyStreak(timestamps) {
    if (!timestamps || !timestamps.length) return { current: 0, best: 0 };
    var daysMap = {};
    timestamps.forEach(function (ms) {
      if (ms > 0) daysMap[new Date(ms).toISOString().slice(0, 10)] = true;
    });
    var sorted = Object.keys(daysMap).sort();
    if (!sorted.length) return { current: 0, best: 0 };
    var best = 1;
    var run = 1;
    for (var i = 1; i < sorted.length; i++) {
      var prev = Date.parse(sorted[i - 1] + "T00:00:00Z");
      var curr = Date.parse(sorted[i] + "T00:00:00Z");
      if (curr - prev === 86400000) {
        run += 1;
        if (run > best) best = run;
      } else {
        run = 1;
      }
    }
    var todayStr = new Date().toISOString().slice(0, 10);
    var yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    var lastDay = sorted[sorted.length - 1];
    var current = 0;
    if (lastDay === todayStr || lastDay === yesterdayStr) {
      current = 1;
      for (var j = sorted.length - 1; j > 0; j--) {
        var c2 = Date.parse(sorted[j] + "T00:00:00Z");
        var p2 = Date.parse(sorted[j - 1] + "T00:00:00Z");
        if (c2 - p2 === 86400000) current += 1;
        else break;
      }
    }
    return { current: current, best: best };
  }

  function splitNameAndClass(rawName) {
    var clean = String(rawName || "").trim();
    var idx = clean.indexOf(" · ");
    if (idx > 0) {
      return {
        name: clean.slice(0, idx).trim(),
        classCode: clean.slice(idx + 3).trim().slice(0, 16),
      };
    }
    return { name: clean, classCode: "" };
  }

  function invalidateCache() {
    lbCache = { at: 0, data: null };
  }

  function buildFromDirectSupabase() {
    if (!init() || !sb) {
      return Promise.resolve({
        ok: true,
        generatedAt: Date.now(),
        overall: [],
        games: {},
        gameList: [],
        classes: [],
        summary: { players: 0, games: 0, totalPlays: 0, totalStars: 0 },
      });
    }

    return withTimeout(
      Promise.all([
        sb.from("profiles").select("id,username,display_name,created_at").limit(1000).then(function (r) { return r && !r.error ? (r.data || []) : []; }).catch(function () { return []; }),
        sb.from("game_progress").select("user_id,game_id,game_name,category,stars,plays,best_score,max_score,best_accuracy,completed,last_at").limit(3000).then(function (r) { return r && !r.error ? (r.data || []) : []; }).catch(function () { return []; }),
        sb.from("scores").select("id,name,score,max_score,game_id,game_name,user_id,time_ms,at,created_at").order("at", { ascending: false }).limit(1500).then(function (r) { return r && !r.error ? (r.data || []) : []; }).catch(function () { return []; }),
      ]),
      REQUEST_TIMEOUT_MS,
      [[], [], []]
    ).then(function (parts) {
      var profiles = parts[0] || [];
      var progressRows = parts[1] || [];
      var scoreRows = parts[2] || [];

      var profileById = {};
      profiles.forEach(function (p) {
        if (!p || !p.id) return;
        profileById[p.id] = {
          id: p.id,
          username: String(p.username || "").trim(),
          displayName: String(p.display_name || p.username || "Player").trim(),
        };
      });

      var players = {};
      var gameCatalog = {};

      function ensurePlayer(key, info) {
        if (!players[key]) {
          players[key] = {
            key: key,
            userId: info.userId || null,
            name: info.name || "Player",
            username: info.username || "",
            classCode: info.classCode || "",
            registered: Boolean(info.registered),
            games: {},
            dates: [],
            lastActiveAt: 0,
          };
        } else {
          var pl = players[key];
          if (info.name && (pl.name === "Player" || pl.name.indexOf("Student ") === 0)) pl.name = info.name;
          if (info.username && !pl.username) pl.username = info.username;
          if (info.classCode && !pl.classCode) pl.classCode = info.classCode;
          if (info.registered) pl.registered = true;
        }
        return players[key];
      }

      function ensureGameCatalog(gid, gname, cat) {
        if (!gid) return;
        if (!gameCatalog[gid]) {
          gameCatalog[gid] = {
            id: gid,
            title: prettyTitle(gid, gname),
            category: inferCategory(gid, cat),
          };
        } else if (cat && gameCatalog[gid].category === "General") {
          gameCatalog[gid].category = inferCategory(gid, cat);
        }
      }

      function ensurePlayerGame(pl, gid) {
        if (!pl.games[gid]) {
          pl.games[gid] = {
            gameId: gid,
            stars: 0,
            plays: 0,
            bestScore: 0,
            maxScore: 0,
            accuracy: 0,
            bestTimeMs: 0,
            completed: false,
            lastAt: 0,
          };
        }
        return pl.games[gid];
      }

      progressRows.forEach(function (r) {
        if (!r || !r.user_id || !r.game_id) return;
        var prof = profileById[r.user_id];
        var pl = ensurePlayer("u:" + r.user_id, {
          userId: r.user_id,
          name: prof ? prof.displayName : ("Student " + String(r.user_id).slice(0, 6)),
          username: prof ? prof.username : "",
          registered: true,
        });
        var gid = String(r.game_id).trim();
        ensureGameCatalog(gid, r.game_name, r.category);
        var lastAt = parseTimestampMs(r.last_at);
        if (lastAt > 0) {
          pl.dates.push(lastAt);
          if (lastAt > pl.lastActiveAt) pl.lastActiveAt = lastAt;
        }
        var g = ensurePlayerGame(pl, gid);
        g.stars = Math.max(g.stars, Math.min(3, Number(r.stars) || 0));
        g.plays = Math.max(g.plays, Number(r.plays) || 0);
        g.bestScore = Math.max(g.bestScore, Number(r.best_score) || 0);
        g.maxScore = Math.max(g.maxScore, Number(r.max_score) || 0);
        g.accuracy = Math.max(g.accuracy, Number(r.best_accuracy) || 0);
        g.completed = Boolean(g.completed || r.completed || g.stars > 0);
        if (lastAt > g.lastAt) g.lastAt = lastAt;
      });

      scoreRows.forEach(function (s) {
        if (!s || !s.game_id) return;
        var gid = String(s.game_id).trim();
        var parsed = splitNameAndClass(s.name);
        var prof = s.user_id ? profileById[s.user_id] : null;
        var pKey = s.user_id
          ? ("u:" + s.user_id)
          : ("g:" + (parsed.name || "guest").toLowerCase() + (parsed.classCode ? "|" + parsed.classCode.toLowerCase() : ""));
        var pl = ensurePlayer(pKey, {
          userId: s.user_id || null,
          name: (prof && prof.displayName) || parsed.name || "Player",
          username: (prof && prof.username) || "",
          classCode: parsed.classCode,
          registered: Boolean(s.user_id),
        });
        ensureGameCatalog(gid, s.game_name, null);
        var at = parseTimestampMs(s.at) || parseTimestampMs(s.created_at);
        if (at > 0) {
          pl.dates.push(at);
          if (at > pl.lastActiveAt) pl.lastActiveAt = at;
        }
        var scoreVal = Math.max(0, Number(s.score) || 0);
        var maxVal = s.max_score != null ? Math.max(0, Number(s.max_score) || 0) : 0;
        var pct = maxVal > 0 ? Math.min(100, Math.round((scoreVal / maxVal) * 100)) : 0;
        var inferredStars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
        var timeMs = s.time_ms != null && Number(s.time_ms) > 0 ? Math.round(Number(s.time_ms)) : 0;

        var g = ensurePlayerGame(pl, gid);
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
      });

      var overall = [];
      var gamesMap = {};
      var classSet = {};
      var sumPlays = 0;
      var sumStars = 0;

      Object.keys(players).forEach(function (pk) {
        var pl = players[pk];
        var gIds = Object.keys(pl.games);
        if (!gIds.length) return;
        if (pl.classCode) classSet[pl.classCode] = true;

        var totalStars = 0;
        var totalPlays = 0;
        var totalScore = 0;
        var threeStarGames = 0;
        var accSum = 0;
        var accCount = 0;

        gIds.forEach(function (gid) {
          var g = pl.games[gid];
          totalStars += g.stars;
          totalPlays += g.plays;
          var effectivePoints = g.bestScore > 0 ? g.bestScore : (g.stars * 10 + (g.completed ? 5 : 0));
          totalScore += effectivePoints;
          if (g.stars >= 3) threeStarGames += 1;
          if (g.accuracy > 0) {
            accSum += g.accuracy;
            accCount += 1;
          }
          if (!gamesMap[gid]) gamesMap[gid] = [];
          gamesMap[gid].push({
            key: pl.key,
            userId: pl.userId,
            name: pl.name,
            username: pl.username,
            classCode: pl.classCode,
            registered: pl.registered,
            score: g.bestScore > 0 ? g.bestScore : effectivePoints,
            rawScore: g.bestScore,
            maxScore: g.maxScore,
            accuracy: g.accuracy,
            stars: g.stars,
            plays: g.plays,
            timeMs: g.bestTimeMs || null,
            lastAt: g.lastAt,
          });
        });

        var avgAccuracy = accCount > 0 ? Math.round(accSum / accCount) : 0;
        var streak = computeDailyStreak(pl.dates);
        var uniqueGames = gIds.length;
        var xp =
          totalPlays * 12 +
          uniqueGames * 40 +
          (totalStars * 25 + threeStarGames * 35) +
          (accCount >= 2 ? (avgAccuracy >= 90 ? 140 : avgAccuracy >= 80 ? 80 : avgAccuracy >= 70 ? 40 : 0) : 0) +
          (streak.best || 0) * 15;
        var rank = rankForXp(xp);
        sumPlays += totalPlays;
        sumStars += totalStars;

        overall.push({
          key: pl.key,
          userId: pl.userId,
          name: pl.name,
          username: pl.username,
          classCode: pl.classCode,
          registered: pl.registered,
          xp: xp,
          rankTier: rank.tier,
          rankName: rank.name,
          rankIcon: rank.icon,
          totalStars: totalStars,
          gamesPlayed: uniqueGames,
          totalPlays: totalPlays,
          avgAccuracy: avgAccuracy,
          totalScore: totalScore,
          streakCurrent: streak.current,
          streakBest: streak.best,
          lastActiveAt: pl.lastActiveAt,
        });
      });

      overall.sort(function (a, b) {
        return b.xp - a.xp || b.totalStars - a.totalStars || b.gamesPlayed - a.gamesPlayed || b.avgAccuracy - a.avgAccuracy || a.name.localeCompare(b.name);
      });

      var gameList = [];
      Object.keys(gamesMap).forEach(function (gid) {
        var rows = gamesMap[gid];
        rows.sort(function (a, b) {
          return b.stars - a.stars || b.accuracy - a.accuracy || b.score - a.score || (a.timeMs || 1e9) - (b.timeMs || 1e9) || b.plays - a.plays || a.name.localeCompare(b.name);
        });
        gamesMap[gid] = rows.slice(0, 100);
        var meta = gameCatalog[gid] || { id: gid, title: prettyTitle(gid), category: inferCategory(gid) };
        gameList.push({
          id: gid,
          title: meta.title,
          category: meta.category,
          players: rows.length,
          totalPlays: rows.reduce(function (acc, r) { return acc + (r.plays || 0); }, 0),
        });
      });

      gameList.sort(function (a, b) {
        return b.players - a.players || b.totalPlays - a.totalPlays || a.title.localeCompare(b.title);
      });

      return {
        ok: true,
        generatedAt: Date.now(),
        overall: overall.slice(0, 150),
        games: gamesMap,
        gameList: gameList,
        classes: Object.keys(classSet).sort(),
        summary: {
          players: overall.length,
          games: gameList.length,
          totalPlays: sumPlays,
          totalStars: sumStars,
        },
      };
    });
  }

  function fetchFromServerApi(force) {
    if (typeof fetch !== "function") return Promise.resolve(null);
    var url = "/api/leaderboard" + (force ? "?refresh=1" : "");
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (controller) controller.abort();
    }, 5500);

    return fetch(url, {
      cache: "no-store",
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (json) {
        if (json && json.ok && Array.isArray(json.overall)) {
          // Re-enrich titles/categories if LASkillCatalog is loaded
          if (Array.isArray(json.gameList) && global.LASkillCatalog) {
            json.gameList = json.gameList.map(function (g) {
              return {
                id: g.id,
                title: prettyTitle(g.id, g.title),
                category: inferCategory(g.id, g.category),
                players: g.players,
                totalPlays: g.totalPlays,
              };
            });
          }
          return json;
        }
        return null;
      })
      .catch(function () {
        clearTimeout(timer);
        return null;
      });
  }

  function fetchLeaderboard(opts) {
    opts = opts || {};
    var force = !!opts.force;
    var now = Date.now();
    if (!force && lbCache.data && now - lbCache.at < CACHE_TTL_MS) {
      return Promise.resolve(lbCache.data);
    }
    if (!force && lbInflight) return lbInflight;

    lbInflight = fetchFromServerApi(force)
      .then(function (serverData) {
        if (serverData && (serverData.overall.length > 0 || !init())) {
          return serverData;
        }
        return buildFromDirectSupabase().then(function (directData) {
          if (directData && directData.overall.length > 0) return directData;
          return serverData || directData;
        });
      })
      .then(function (result) {
        lbInflight = null;
        if (result) {
          lbCache = { at: Date.now(), data: result };
        }
        return result;
      })
      .catch(function () {
        lbInflight = null;
        return {
          ok: false,
          generatedAt: Date.now(),
          overall: [],
          games: {},
          gameList: [],
          classes: [],
          summary: { players: 0, games: 0, totalPlays: 0, totalStars: 0 },
        };
      });

    return lbInflight;
  }

  function submit(opts) {
    opts = opts || {};
    if (!init()) {
      return Promise.resolve({ ok: false, error: initError || "Score service not ready" });
    }

    var sessionUser = getSessionUser();
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
      game_name: opts.gameName ? String(opts.gameName).slice(0, 80) : prettyTitle(gameId),
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

    return withTimeout(
      sb
        .from("scores")
        .insert([row])
        .select("id")
        .then(function (res) {
          if (res.error) {
            console.warn("[LAScores] submit failed", res.error);
            return { ok: false, error: res.error.message || "Submit failed" };
          }
          invalidateCache();
          return { ok: true, id: res.data && res.data[0] ? res.data[0].id : null };
        }),
      REQUEST_TIMEOUT_MS,
      { ok: false, error: "Request timed out" }
    ).catch(function (err) {
      console.warn("[LAScores] submit failed", err);
      return { ok: false, error: err && err.message ? err.message : "Submit failed" };
    });
  }

  function top(gameId, limit) {
    limit = limit || 20;
    gameId = sanitizeGameId(gameId);
    if (!init()) {
      return fetchLeaderboard().then(function (lb) {
        return ((lb && lb.games && lb.games[gameId]) || []).slice(0, limit);
      });
    }
    return withTimeout(
      sb
        .from("scores")
        .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at")
        .eq("game_id", gameId)
        .order("score", { ascending: false })
        .limit(limit)
        .then(function (res) {
          if (res.error || !res.data || !res.data.length) {
            return fetchLeaderboard().then(function (lb) {
              return ((lb && lb.games && lb.games[gameId]) || []).slice(0, limit);
            });
          }
          return (res.data || []).map(function (r) {
            return {
              key: r.id,
              gameId: r.game_id,
              name: r.name || "Player",
              score: Number(r.score) || 0,
              maxScore: r.max_score != null ? Number(r.max_score) : null,
              timeMs: r.time_ms != null && Number(r.time_ms) > 0 ? Number(r.time_ms) : null,
              gameName: r.game_name || r.game_id,
              at: r.at || 0,
              iso: r.created_at || "",
            };
          });
        }),
      REQUEST_TIMEOUT_MS,
      []
    ).catch(function () {
      return [];
    });
  }

  function topByTime(gameId, limit, minAccuracy) {
    if (!init()) return Promise.resolve([]);
    limit = limit || 20;
    gameId = sanitizeGameId(gameId);
    return withTimeout(
      sb
        .from("scores")
        .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at")
        .eq("game_id", gameId)
        .not("time_ms", "is", null)
        .order("time_ms", { ascending: true })
        .limit(Math.max(limit * 3, 40))
        .then(function (res) {
          if (res.error) return [];
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
              timeMs: r.time_ms != null && Number(r.time_ms) > 0 ? Number(r.time_ms) : null,
              gameName: r.game_name || r.game_id,
              at: r.at || 0,
            });
          });
          return rows.slice(0, limit);
        }),
      REQUEST_TIMEOUT_MS,
      []
    ).catch(function () {
      return [];
    });
  }

  function myScores() {
    if (!init()) return Promise.resolve([]);
    var sessionUser = getSessionUser();
    if (!getPlayerName() && !(sessionUser && sessionUser.id)) return Promise.resolve([]);
    return withTimeout(
      sb
        .from("scores")
        .select("id,name,score,max_score,game_id,game_name,time_ms,at,created_at,user_id")
        .order("at", { ascending: false })
        .limit(120)
        .then(function (res) {
          if (res.error) return [];
          var rows = [];
          (res.data || []).forEach(function (r) {
            var owned = sessionUser && sessionUser.id && r.user_id === sessionUser.id;
            if (!owned && !nameMatchesPlayer(r.name)) return;
            rows.push({
              key: r.id,
              gameId: r.game_id,
              name: r.name || "Player",
              score: Number(r.score) || 0,
              maxScore: r.max_score != null ? Number(r.max_score) : null,
              timeMs: r.time_ms != null && Number(r.time_ms) > 0 ? Number(r.time_ms) : null,
              gameName: r.game_name || r.game_id,
              at: r.at || 0,
              iso: r.created_at || "",
            });
          });
          return rows;
        }),
      REQUEST_TIMEOUT_MS,
      []
    ).catch(function () {
      return [];
    });
  }

  function listGames() {
    return fetchLeaderboard()
      .then(function (lb) {
        if (lb && Array.isArray(lb.gameList) && lb.gameList.length) {
          return lb.gameList.map(function (g) { return g.id; });
        }
        return Object.keys(GAMES);
      })
      .catch(function () {
        return Object.keys(GAMES);
      });
  }

  var GAMES = {
    "opposite-snap": { title: "Opposite Snap", maxScore: null },
    "sound-match-picture": { title: "Sound Match Picture", maxScore: 16 },
    "be-verbs": { title: "Be Verbs", maxScore: null },
    "nouns": { title: "Singular & Plural Nouns", maxScore: null },
    "there-is-there-are": { title: "There is / There are", maxScore: null },
    "simple-present": { title: "Simple Present", maxScore: null },
    "simple-past": { title: "Simple Past", maxScore: null },
    "present-perfect": { title: "Present Perfect", maxScore: null },
    "match-rush": { title: "Match Rush", maxScore: null },
    "writing-sara-daily": { title: "Sara's Daily Routine", maxScore: null },
  };

  global.LAScores = {
    init: init,
    ensureAuth: ensureAuth,
    getPlayerName: getPlayerName,
    setPlayerName: setPlayerName,
    getClassCode: getClassCode,
    setClassCode: setClassCode,
    getDisplayName: getDisplayName,
    prettyTitle: prettyTitle,
    inferCategory: inferCategory,
    rankForXp: rankForXp,
    fetchLeaderboard: fetchLeaderboard,
    invalidateCache: invalidateCache,
    submit: submit,
    top: top,
    topByTime: topByTime,
    myScores: myScores,
    listGames: listGames,
    RANKS: RANKS,
    GAMES: GAMES,
  };
})(typeof window !== "undefined" ? window : this);
