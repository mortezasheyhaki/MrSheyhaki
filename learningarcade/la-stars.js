/**
 * Learning Arcade — shared progress (stars + play counts)
 *
 * localStorage:
 *   "laGameStars"  → { "game-id": 2, ... }   // best stars 0–3
 *   "laGamePlays"  → { "game-id": 5, ... }   // times played
 *
 * Usage:
 *   LAStars.save("match-rush", 3);
 *   LAStars.saveFromAccuracy("nouns", 85);
 *   LAStars.recordPlay("vocab-match-rush");  // +1 play
 *   LAStars.apply(); // fill stars + play counts on cards
 */
(function (global) {
  "use strict";

  var STARS_KEY = "laGameStars";
  var PLAYS_KEY = "laGamePlays";

  function loadJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveJSON(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  function loadStars() {
    return loadJSON(STARS_KEY);
  }

  function loadPlays() {
    return loadJSON(PLAYS_KEY);
  }

  function save(gameId, stars) {
    if (!gameId) return 0;
    stars = Math.max(0, Math.min(3, Number(stars) || 0));
    var data = loadStars();
    var prev = Number(data[gameId] || 0);
    if (stars > prev) {
      data[gameId] = stars;
      saveJSON(STARS_KEY, data);
      return stars;
    }
    return prev;
  }

  function saveFromAccuracy(gameId, accuracyPercent) {
    var acc = Number(accuracyPercent) || 0;
    var stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    return save(gameId, stars);
  }

  function saveFromScore(gameId, score, thresholds) {
    thresholds = thresholds || [1000, 600, 200];
    var stars = 0;
    if (score >= thresholds[0]) stars = 3;
    else if (score >= thresholds[1]) stars = 2;
    else if (score >= thresholds[2]) stars = 1;
    return save(gameId, stars);
  }

  /** Increment times played for a game. Returns new total. */
  function recordPlay(gameId) {
    if (!gameId) return 0;
    var data = loadPlays();
    var n = Number(data[gameId] || 0) + 1;
    data[gameId] = n;
    saveJSON(PLAYS_KEY, data);
    return n;
  }

  function getPlays(gameId) {
    if (!gameId) return 0;
    return Number(loadPlays()[gameId] || 0);
  }

  function playLabel(n) {
    n = Number(n) || 0;
    if (n <= 0) return "Not played yet";
    if (n === 1) return "Played 1 time";
    return "Played " + n + " times";
  }

  function apply(root) {
    var scope = root || document;
    var starsData = loadStars();
    var playsData = loadPlays();

    scope.querySelectorAll(".game-stars[data-game]").forEach(function (el) {
      var id = el.getAttribute("data-game");
      var n = Math.max(0, Math.min(3, Number(starsData[id] || 0)));
      el.querySelectorAll(".star").forEach(function (star) {
        var need = Number(star.getAttribute("data-n") || 0);
        if (need <= n) {
          star.classList.add("is-filled");
          star.textContent = "★";
        } else {
          star.classList.remove("is-filled");
          star.textContent = "☆";
        }
      });
      el.setAttribute("aria-label", n + " of 3 stars");
    });

    scope.querySelectorAll(".game-plays[data-game]").forEach(function (el) {
      var id = el.getAttribute("data-game");
      var n = Number(playsData[id] || 0);
      el.textContent = playLabel(n);
      el.setAttribute("data-count", String(n));
      el.setAttribute("aria-label", playLabel(n));
    });
  }

  global.LAStars = {
    KEY: STARS_KEY,
    PLAYS_KEY: PLAYS_KEY,
    load: loadStars,
    loadPlays: loadPlays,
    save: save,
    saveFromAccuracy: saveFromAccuracy,
    saveFromScore: saveFromScore,
    recordPlay: recordPlay,
    getPlays: getPlays,
    playLabel: playLabel,
    apply: apply,
  };

  function boot() {
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("pageshow", boot);
})(window);
