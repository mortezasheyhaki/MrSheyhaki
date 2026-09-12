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
 *
 * Known game IDs on mrsheyhaki.ir (Adult Learning Arcade):
 *   Vocabulary
 *     vocab-clothes-match, vocab-clothes-voice-hunt
 *     vocab-colors-match, vocab-colors-dictation, vocab-colors-balloon-spell,
 *     vocab-colors-say-color, vocab-colors-what-is-it
 *     vocab-food-match-rush, vocab-food-a-an-some, vocab-food-memory
 *   Grammar
 *     be-verbs, grammar-be, grammar-wh-questions, grammar-wh-meaning, simple-present, there-is-there-are, simple-past, present-perfect,
 *     grammar-phrasal-verbs, nouns, grammar-how-much-how-many
 *   Writing
 *     writing-sara-daily
 *   Speaking
 *     speaking-supermarket, speaking-how-much-how-many
 */
(function (global) {
  "use strict";

  var STARS_KEY = "laGameStars";
  var PLAYS_KEY = "laGamePlays";

  /**
   * Optional aliases: when a mini-game saves under a child id,
   * also update the parent card id (so the skill list shows stars).
   * Format: childId → parentId (or array of parent ids)
   */
  var ALIASES = {
    // Topics · Numbers (child games → parent topic card)
    "topics-numbers-match": "topics-numbers",
    "topics-numbers-write-word": "topics-numbers",
    "topics-numbers-speak": "topics-numbers",
    "topics-numbers-listen-write": "topics-numbers",
    "topics-numbers-listen-choose": "topics-numbers",
    "topics-numbers-personal-form": "topics-numbers",
    "topics-numbers-flashcards": "topics-numbers",

    // Clothes hub games → main Vocabulary card
    "vocab-clothes-voice-hunt": "vocab-clothes-match",
    // Colors mini-games → main Colors card
    "vocab-colors-dictation": "vocab-colors-match",
    "vocab-colors-balloon-spell": "vocab-colors-match",
    "vocab-colors-say-color": "vocab-colors-match",
    "vocab-colors-what-is-it": "vocab-colors-match",
    // Food mini-games → main Food card
    "vocab-food-a-an-some": "vocab-food-match-rush",
    "vocab-food-memory": "vocab-food-match-rush",
    "vocab-food-flashcards": "vocab-food-match-rush",
    "vocab-food-say-food": "vocab-food-match-rush",
    // Clothes
    "vocab-clothes-balloon-pop": "vocab-clothes-match",
    "vocab-clothes-dictation": "vocab-clothes-match",
    // School subjects
    "vocab-school-subjects": "vocab-school-subjects",
    // Unit 4B – hub ids used by course-render (starter-4b-*)
    "adj-sentences": "starter-4b-adjective-sentences",
    "adj-sentences-a": "starter-4b-adjective-sentences",
    "adj-sentences-b": "starter-4b-adjective-sentences",
    "sound-match-picture": "starter-4b-sound-match-picture",
    "match-adjectives-4b": "starter-4b-match-adjectives",
    "listen-and-write-4b": "starter-4b-listen-and-write",
    "opposite-snap": "starter-4b-opposite-snap",
    "starter-4b-adjective-sentences": "starter-4b-adjective-sentences",
    "starter-4b-sound-match-picture": "starter-4b-sound-match-picture",
    "starter-4b-match-adjectives": "starter-4b-match-adjectives",
    "starter-4b-listen-and-write": "starter-4b-listen-and-write",
    "starter-4b-opposite-snap": "starter-4b-opposite-snap"
,
    // Unit 4B resources
    "adj-sentences-a": "adj-sentences",
    "adj-sentences-b": "adj-sentences",
    "sound-match-picture": "sound-match-picture",
    "match-adjectives-4b": "match-adjectives-4b",
    "listen-and-write-4b": "listen-and-write-4b",
    "opposite-snap": "opposite-snap",

    // Starter · Practical English 1
    "starter-alphabet-flashcards": "starter-pe1-alphabet-flashcards",
    "starter-listen-choose": "starter-pe1-listen-choose",
    "starter-match-classroom-objects": "starter-pe1-match-classroom-objects",
    "starter-classroom-flashcards": "starter-pe1-classroom-flashcards",
    "starter-classroom-write": "starter-pe1-classroom-write",
    "starter-classroom-whats-this": "starter-pe1-classroom-whats-this",
    "starter-classroom-language-flashcards": "starter-pe1-classroom-language-flashcards",
    "starter-classroom-language-write": "starter-pe1-classroom-language-write",
    "starter-pe1-alphabet-flashcards": "starter-pe1-alphabet-flashcards",
    "starter-pe1-listen-choose": "starter-pe1-listen-choose",
    "starter-pe1-match-classroom-objects": "starter-pe1-match-classroom-objects",
    "starter-pe1-classroom-flashcards": "starter-pe1-classroom-flashcards",
    "starter-pe1-classroom-write": "starter-pe1-classroom-write",
    "starter-pe1-classroom-whats-this": "starter-pe1-classroom-whats-this",
    "starter-pe1-classroom-language-flashcards": "starter-pe1-classroom-language-flashcards",
    "starter-pe1-classroom-language-write": "starter-pe1-classroom-language-write",

    // Starter · Unit 2A games (old short ids → canonical course-render ids)
    "starter-pronouns-be-practice": "starter-2a-pronouns-be-practice",
    "starter-sentence-builder": "starter-2a-sentence-builder",
    "starter-statement-to-question": "starter-2a-statement-to-question",
    "starter-you-we-they-forms": "starter-2a-you-we-they-forms",
    "starter-2a-from-nationality": "starter-2a-from-nationality",
    "starter-2a-listen-nationalities": "starter-2a-listen-nationalities",
    "starter-2a-match-nationalities": "starter-2a-match-nationalities",
    "starter-2a-pronouns-be-practice": "starter-2a-pronouns-be-practice",
    "starter-2a-sentence-builder": "starter-2a-sentence-builder",
    "starter-2a-statement-to-question": "starter-2a-statement-to-question",
    "starter-2a-you-we-they-forms": "starter-2a-you-we-they-forms",
    "starter-2a-conversation-reading": "starter-2a-conversation-reading"
  };

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

  /** Per-player storage when name + class code are set (shared tablets). */
  function identitySuffix() {
    try {
      var name = (localStorage.getItem("laPlayerName") || "").trim().toLowerCase();
      var code = (localStorage.getItem("laClassCode") || "").trim().toUpperCase();
      if (name && code) return "::" + name + "::" + code;
    } catch (e) {}
    return "";
  }

  function starsKey() {
    return STARS_KEY + identitySuffix();
  }

  function playsKey() {
    return PLAYS_KEY + identitySuffix();
  }

  function loadStars() {
    return loadJSON(starsKey());
  }

  function loadPlays() {
    return loadJSON(playsKey());
  }

  function relatedIds(gameId) {
    var ids = [gameId];
    var parent = ALIASES[gameId];
    if (parent) {
      if (Array.isArray(parent)) {
        parent.forEach(function (p) {
          if (ids.indexOf(p) === -1) ids.push(p);
        });
      } else if (ids.indexOf(parent) === -1) {
        ids.push(parent);
      }
    }
    // Reverse lookup: any key that aliases *to* this gameId
    Object.keys(ALIASES).forEach(function (key) {
      var val = ALIASES[key];
      if (val === gameId || (Array.isArray(val) && val.indexOf(gameId) !== -1)) {
        if (ids.indexOf(key) === -1) ids.push(key);
      }
    });
    return ids;
  }

  function save(gameId, stars) {
    if (!gameId) return 0;
    stars = Math.max(0, Math.min(3, Number(stars) || 0));
    var data = loadStars();
    var ids = relatedIds(gameId);
    var best = 0;
    ids.forEach(function (id) {
      var prev = Number(data[id] || 0);
      if (stars > prev) {
        data[id] = stars;
        best = stars;
      } else {
        best = Math.max(best, prev);
      }
    });
    saveJSON(starsKey(), data);
    return best;
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
    var ids = relatedIds(gameId);
    var n = 0;
    ids.forEach(function (id) {
      n = Number(data[id] || 0) + 1;
      data[id] = n;
    });
    saveJSON(playsKey(), data);
    return n;
  }

  function getPlays(gameId) {
    if (!gameId) return 0;
    return Number(loadPlays()[gameId] || 0);
  }

  function getStars(gameId) {
    if (!gameId) return 0;
    return Math.max(0, Math.min(3, Number(loadStars()[gameId] || 0)));
  }

  function playLabel(n) {
    n = Number(n) || 0;
    if (n <= 0) return "Not played yet";
    if (n === 1) return "Played 1 time";
    return "Played " + n + " times";
  }

  function bestStarsFor(gameId, starsData) {
    var best = 0;
    relatedIds(gameId).forEach(function (id) {
      best = Math.max(best, Number(starsData[id] || 0));
    });
    return Math.max(0, Math.min(3, best));
  }

  function bestPlaysFor(gameId, playsData) {
    var best = 0;
    relatedIds(gameId).forEach(function (id) {
      best = Math.max(best, Number(playsData[id] || 0));
    });
    return best;
  }

  function apply(root) {
    var scope = root || document;
    var starsData = loadStars();
    var playsData = loadPlays();

    scope.querySelectorAll(".game-stars[data-game]").forEach(function (el) {
      var id = el.getAttribute("data-game");
      var n = bestStarsFor(id, starsData);
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
      var n = bestPlaysFor(id, playsData);
      el.textContent = playLabel(n);
      el.setAttribute("data-count", String(n));
      el.setAttribute("aria-label", playLabel(n));
    });
  }

  global.LAStars = {
    KEY: STARS_KEY,
    PLAYS_KEY: PLAYS_KEY,
    ALIASES: ALIASES,
    load: loadStars,
    loadPlays: loadPlays,
    save: save,
    saveFromAccuracy: saveFromAccuracy,
    saveFromScore: saveFromScore,
    recordPlay: recordPlay,
    getPlays: getPlays,
    getStars: getStars,
    playLabel: playLabel,
    apply: apply,
    identitySuffix: identitySuffix,
    starsKey: starsKey,
    playsKey: playsKey,
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
