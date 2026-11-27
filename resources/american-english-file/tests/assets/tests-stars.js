/* Tests & Exams – activity scoring & backwards-compatible progress tracker (stored on this device) */
(function (global) {
  "use strict";

  var SCORE_KEY = "aef-test-scores";
  var LEGACY_STAR_KEY = "aef-starter-test-stars";
  var recentSaves = {};

  function normalizeId(id) {
    id = String(id || "").trim();
    if (!id) return "";
    if (id.indexOf("aef-starter-") === 0) {
      return id.slice(4);
    }
    return id;
  }

  function readScores() {
    try {
      var raw = JSON.parse(localStorage.getItem(SCORE_KEY));
      return raw && typeof raw === "object" ? raw : {};
    } catch (e) {
      return {};
    }
  }

  function writeScores(data) {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function readLegacyStars() {
    try {
      var raw = JSON.parse(localStorage.getItem(LEGACY_STAR_KEY));
      return raw && typeof raw === "object" ? raw : {};
    } catch (e) {
      return {};
    }
  }

  function clampPct(n) {
    n = Number(n);
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function getTier(pct) {
    pct = clampPct(pct);
    if (pct >= 90) return { key: "mastered", label: "Mastered" };
    if (pct >= 70) return { key: "good", label: "Good" };
    return { key: "progress", label: "Keep going" };
  }

  function record(id, scoreOrOpts, totalArg, pctArg) {
    var normId = normalizeId(id);
    if (!normId) return null;

    var opts =
      scoreOrOpts && typeof scoreOrOpts === "object"
        ? scoreOrOpts
        : { score: scoreOrOpts, total: totalArg, pct: pctArg };

    var hasScore = opts.score != null && isFinite(Number(opts.score));
    var hasTotal = opts.total != null && isFinite(Number(opts.total)) && Number(opts.total) > 0;
    var score = hasScore ? Math.max(0, Number(opts.score)) : null;
    var total = hasTotal ? Number(opts.total) : null;

    var rawPct =
      opts.pct != null
        ? opts.pct
        : opts.accuracy != null
          ? opts.accuracy
          : hasScore && hasTotal
            ? (score / total) * 100
            : null;

    if (rawPct == null || !isFinite(Number(rawPct))) return null;
    var pct = clampPct(rawPct);

    var now = Date.now();
    var recent = recentSaves[normId];
    var isDuplicateBurst = recent && now - recent < 300;
    recentSaves[normId] = now;

    var all = readScores();
    var prev = all[normId] && typeof all[normId] === "object" ? all[normId] : null;

    if (!prev) {
      all[normId] = {
        bestPct: pct,
        lastPct: pct,
        bestScore: score,
        bestTotal: total,
        lastScore: score,
        lastTotal: total,
        attempts: 1,
        updatedAt: now
      };
    } else {
      var prevBestPct = prev.bestPct != null ? Number(prev.bestPct) : 0;
      var betterPct = pct > prevBestPct;
      var samePctMoreDetail =
        pct === prevBestPct && hasScore && hasTotal && (prev.bestScore == null || score > prev.bestScore);

      all[normId] = {
        bestPct: Math.max(prevBestPct, pct),
        lastPct: pct,
        bestScore:
          betterPct || samePctMoreDetail
            ? score
            : prev.bestScore != null
              ? prev.bestScore
              : score,
        bestTotal:
          betterPct || samePctMoreDetail
            ? total
            : prev.bestTotal != null
              ? prev.bestTotal
              : total,
        lastScore: hasScore ? score : prev.lastScore != null ? prev.lastScore : null,
        lastTotal: hasTotal ? total : prev.lastTotal != null ? prev.lastTotal : null,
        attempts: isDuplicateBurst ? Math.max(1, prev.attempts || 1) : (prev.attempts || 0) + 1,
        updatedAt: now
      };
    }

    writeScores(all);

    // Keep legacy key in sync if any older hub checks it
    try {
      var stars = readLegacyStars();
      if (!stars[normId]) {
        stars[normId] = 1;
        localStorage.setItem(LEGACY_STAR_KEY, JSON.stringify(stars));
      }
    } catch (e) {}

    return all[normId];
  }

  function get(id) {
    var normId = normalizeId(id);
    if (!normId) return null;
    var all = readScores();
    if (all[normId]) return all[normId];
    // If legacy star exists without a score entry, return a completed fallback
    var legacy = readLegacyStars();
    if (legacy[normId] || (id !== normId && legacy[id])) {
      return {
        bestPct: null,
        lastPct: null,
        bestScore: null,
        bestTotal: null,
        attempts: 1,
        legacyCompleted: true
      };
    }
    return null;
  }

  function getSummary(ids) {
    ids = Array.isArray(ids) ? ids : [];
    var total = ids.length;
    var played = 0;
    var scoredCount = 0;
    var sumPct = 0;
    var earnedPts = 0;
    var maxPts = 0;

    ids.forEach(function (id) {
      var rec = get(id);
      if (!rec) return;
      played++;
      if (rec.bestPct != null) {
        scoredCount++;
        sumPct += Number(rec.bestPct) || 0;
      }
      if (rec.bestScore != null && rec.bestTotal != null && rec.bestTotal > 0) {
        earnedPts += Number(rec.bestScore) || 0;
        maxPts += Number(rec.bestTotal) || 0;
      }
    });

    var avgPct = scoredCount > 0 ? Math.round(sumPct / scoredCount) : null;
    var unitPct = total > 0 ? Math.round(sumPct / total) : 0;

    return {
      total: total,
      played: played,
      scoredCount: scoredCount,
      avgPct: avgPct,
      unitPct: unitPct,
      earnedPts: earnedPts,
      maxPts: maxPts
    };
  }

  function formatActivityScore(rec) {
    if (!rec) return "Not played";
    if (rec.bestScore != null && rec.bestTotal > 0 && rec.bestPct != null) {
      return rec.bestScore + "/" + rec.bestTotal + " · " + rec.bestPct + "%";
    }
    if (rec.bestPct != null) {
      return rec.bestPct + "%";
    }
    return "Completed";
  }

  function paint(root) {
    var scope = root || document;

    // 1. Paint individual activity cards [data-score]
    Array.prototype.forEach.call(scope.querySelectorAll("[data-score]"), function (el) {
      var id = el.getAttribute("data-score");
      var rec = get(id);
      var card = el.closest ? el.closest(".act-card, .game-card") : null;

      el.classList.remove("is-mastered", "is-good", "is-progress", "is-unplayed");
      if (card) {
        card.classList.remove("is-played", "is-mastered", "is-good", "is-progress");
      }

      if (!rec) {
        el.classList.add("is-unplayed");
        el.textContent = "Not played";
        el.setAttribute("aria-label", "Not played yet");
      } else if (rec.bestPct != null) {
        var tier = getTier(rec.bestPct);
        el.classList.add("is-" + tier.key);
        el.textContent = formatActivityScore(rec);
        el.setAttribute("aria-label", "Best score " + formatActivityScore(rec) + ", " + tier.label);
        if (card) {
          card.classList.add("is-played", "is-" + tier.key);
        }
      } else {
        el.classList.add("is-good");
        el.textContent = "Completed";
        el.setAttribute("aria-label", "Completed");
        if (card) card.classList.add("is-played", "is-good");
      }
    });

    // 2. Paint activity card progress bars [data-score-bar]
    Array.prototype.forEach.call(scope.querySelectorAll("[data-score-bar]"), function (bar) {
      var id = bar.getAttribute("data-score-bar");
      var rec = get(id);
      var pct = rec && rec.bestPct != null ? clampPct(rec.bestPct) : rec ? 100 : 0;
      bar.style.width = pct + "%";
    });

    // 3. Paint activity footer status text [data-score-meta]
    Array.prototype.forEach.call(scope.querySelectorAll("[data-score-meta]"), function (meta) {
      var id = meta.getAttribute("data-score-meta");
      var rec = get(id);
      if (!rec) {
        meta.textContent = "Ready to start";
      } else if (rec.bestPct != null) {
        var tier = getTier(rec.bestPct);
        var plays = rec.attempts === 1 ? "1 play" : (rec.attempts || 1) + " plays";
        meta.textContent = tier.label + " · " + plays;
      } else {
        meta.textContent = "Completed";
      }
    });

    // 4. Paint Starter unit summary cards [data-score-all]
    Array.prototype.forEach.call(scope.querySelectorAll("[data-score-all]"), function (el) {
      var raw = el.getAttribute("data-score-all") || "";
      var ids = raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      var sum = getSummary(ids);
      var card = el.closest ? el.closest(".tests-unit-card") : null;

      el.classList.remove("is-mastered", "is-good", "is-progress", "is-unplayed");
      if (card) {
        card.classList.remove("is-played", "is-mastered", "is-good", "is-progress");
      }

      if (sum.played === 0) {
        el.classList.add("is-unplayed");
        el.textContent = "Not started";
        el.setAttribute("aria-label", "No activities scored yet");
      } else if (sum.avgPct != null) {
        var tier = getTier(sum.avgPct);
        el.classList.add("is-" + tier.key);
        el.textContent = "Avg " + sum.avgPct + "%";
        el.setAttribute("aria-label", "Average score " + sum.avgPct + "%, " + sum.played + " of " + sum.total + " played");
        if (card) card.classList.add("is-played", "is-" + tier.key);
      } else {
        el.classList.add("is-good");
        el.textContent = sum.played + "/" + sum.total + " done";
        if (card) card.classList.add("is-played", "is-good");
      }
    });

    // 5. Paint Starter unit mastery bars [data-score-bar-all]
    Array.prototype.forEach.call(scope.querySelectorAll("[data-score-bar-all]"), function (bar) {
      var raw = bar.getAttribute("data-score-bar-all") || "";
      var ids = raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      var sum = getSummary(ids);
      bar.style.width = sum.unitPct + "%";
    });

    // 6. Paint Starter unit counts [data-score-count-all]
    Array.prototype.forEach.call(scope.querySelectorAll("[data-score-count-all]"), function (el) {
      var raw = el.getAttribute("data-score-count-all") || "";
      var ids = raw.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      var sum = getSummary(ids);
      if (sum.played === 0) {
        el.textContent = sum.total + " activities";
      } else if (sum.maxPts > 0) {
        el.textContent = sum.played + "/" + sum.total + " played · " + sum.earnedPts + "/" + sum.maxPts + " pts";
      } else {
        el.textContent = sum.played + "/" + sum.total + " played";
      }
    });

    // 7. Backwards-compatible painting for any legacy [data-star], [data-star-all] pages (like /tests/1/)
    Array.prototype.forEach.call(scope.querySelectorAll("[data-star], [data-star-all]"), function (el) {
      var all = el.getAttribute("data-star-all");
      var on = all
        ? all.split(",").every(function (id) { return LegacyStars.has(id.trim()); })
        : LegacyStars.has(el.getAttribute("data-star"));
      el.classList.toggle("on", on);
      el.textContent = on ? "★" : "☆";
      el.setAttribute("aria-label", on ? "1 star earned" : "Star not earned yet");
      el.title = on
        ? (all ? "All tests finished" : "1 star earned")
        : (all ? "Finish all tests in this unit" : "Finish this test to earn a star");
    });
  }

  /* ---------- Automatic capture from LAFinish / LAStars / LAProgressSave ---------- */

  function installHooks() {
    // Hook LAFinish.show
    if (global.LAFinish && typeof global.LAFinish.show === "function" && !global.LAFinish.__tsHooked) {
      var origShow = global.LAFinish.show;
      global.LAFinish.show = function (opts) {
        try {
          if (opts && opts.gameId) {
            record(opts.gameId, {
              score: opts.score,
              total: opts.total,
              pct: opts.accuracy
            });
          }
        } catch (e) {}
        return origShow.apply(this, arguments);
      };
      global.LAFinish.__tsHooked = true;
    }

    // Hook LAStars.saveFromAccuracy
    if (global.LAStars && typeof global.LAStars.saveFromAccuracy === "function" && !global.LAStars.__tsAccHooked) {
      var origSaveAcc = global.LAStars.saveFromAccuracy;
      global.LAStars.saveFromAccuracy = function (gameId, accuracy) {
        try {
          if (gameId != null && accuracy != null) {
            record(gameId, { pct: accuracy });
          }
        } catch (e) {}
        return origSaveAcc.apply(this, arguments);
      };
      global.LAStars.__tsAccHooked = true;
    }

    // Hook LAProgressSave
    if (typeof global.LAProgressSave === "function" && !global.LAProgressSave.__tsHooked) {
      var origProgSave = global.LAProgressSave;
      var wrappedProg = function (payload) {
        try {
          if (payload && payload.gameId && (payload.score != null || payload.accuracy != null)) {
            record(payload.gameId, {
              score: payload.score,
              total: payload.maxScore,
              pct: payload.accuracy
            });
          }
        } catch (e) {}
        return origProgSave.apply(this, arguments);
      };
      wrappedProg.__tsHooked = true;
      global.LAProgressSave = wrappedProg;
    }
  }

  /* ---------- Legacy TestStars wrapper (kept compatible for untouched pages) ---------- */

  var LegacyStars = {
    has: function (id) {
      var normId = normalizeId(id);
      if (readScores()[normId]) return true;
      var legacy = readLegacyStars();
      return !!(legacy[normId] || legacy[id]);
    },
    award: function (id) {
      var d = readLegacyStars();
      var isNew = !d[id];
      d[id] = 1;
      try {
        localStorage.setItem(LEGACY_STAR_KEY, JSON.stringify(d));
      } catch (e) {}
      return isNew;
    },
    paint: paint
  };

  var ScoresAPI = {
    record: record,
    get: get,
    getAll: readScores,
    getSummary: getSummary,
    getTier: getTier,
    normalizeId: normalizeId,
    formatActivityScore: formatActivityScore,
    paint: paint
  };

  global.TestScores = ScoresAPI;
  global.TestStars = LegacyStars;

  installHooks();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      installHooks();
      paint();
    });
  } else {
    paint();
  }
  setTimeout(installHooks, 0);
})(window);
