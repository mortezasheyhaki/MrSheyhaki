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
 *   AEF Starter resources (examples)
 *     starter-2a-match-nationalities, starter-3a-pictures-words-match,
 *     starter-3a-a-an-swipe, starter-3a-plural-s-sound-match, starter-3a-whats-in-your-bag, starter-3a-unscramble, starter-3a-look-listen-write, starter-3a-listen-number,
 *     starter-3a-plural-match, starter-3a-sing-plur-match, starter-3a-sing-plur-sentences, starter-3a-make-plurals,
 *     starter-3a-listen-say-plural, starter-3a-listen-and-write, starter-3a-what-is-it, starter-3a-q-and-a
 *   AEF Starter Unit 4B (Adjectives / The perfect car)
 *     starter-4b-where-is-it-from, starter-4b-perfect-car, starter-4b-car-adjectives,
 *     starter-4b-opposite-snap, starter-4b-match-adjectives, starter-4b-sound-match-picture,
 *     starter-4b-unscramble-adjectives, starter-4b-listen-write-adjectives, starter-4b-listen-write-plural,
 *     starter-4b-two-sounds-match, starter-4b-listen-and-say, starter-4b-sentence-builder,
 *     starter-4b-listen-and-write, starter-4b-adjective-sentences
 *   Teen2Teen
 *     t2t1-u10-clothes-flashcards, t2t1-u10-clothes-match
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

    // Unit 4B – Adjectives / The perfect car (hub ids used by course-render: starter-4b-*)
    // Short / legacy ids → canonical
    "adj-sentences": "starter-4b-adjective-sentences",
    "adj-sentences-a": "starter-4b-adjective-sentences",
    "adj-sentences-b": "starter-4b-adjective-sentences",
    "sound-match-picture": "starter-4b-sound-match-picture",
    "match-adjectives-4b": "starter-4b-match-adjectives",
    "listen-and-write-4b": "starter-4b-listen-and-write",
    "opposite-snap": "starter-4b-opposite-snap",
    "where-is-it-from": "starter-4b-where-is-it-from",
    "perfect-car": "starter-4b-perfect-car",
    "car-adjectives": "starter-4b-car-adjectives",
    "unscramble-adjectives": "starter-4b-unscramble-adjectives",
    "listen-write-adjectives": "starter-4b-listen-write-adjectives",
    "listen-write-plural": "starter-4b-listen-write-plural",
    "two-sounds-match": "starter-4b-two-sounds-match",
    "listen-and-say": "starter-4b-listen-and-say",
    "sentence-builder-4b": "starter-4b-sentence-builder",
    // Mode variants (some games save as id-mode) → parent card
    "starter-4b-adjective-sentences-write": "starter-4b-adjective-sentences",
    "starter-4b-adjective-sentences-order": "starter-4b-adjective-sentences",
    "starter-4b-adjective-sentences-chips": "starter-4b-adjective-sentences",
    "starter-4b-sentence-builder-write": "starter-4b-sentence-builder",
    "starter-4b-sentence-builder-chips": "starter-4b-sentence-builder",
    "starter-4b-sentence-builder-order": "starter-4b-sentence-builder",
    // Canonical self-maps (so reverse lookup & apply work consistently)
    "starter-4b-where-is-it-from": "starter-4b-where-is-it-from",
    "starter-4b-perfect-car": "starter-4b-perfect-car",
    "starter-4b-car-adjectives": "starter-4b-car-adjectives",
    "starter-4b-opposite-snap": "starter-4b-opposite-snap",
    "starter-4b-match-adjectives": "starter-4b-match-adjectives",
    "starter-4b-sound-match-picture": "starter-4b-sound-match-picture",
    "starter-4b-unscramble-adjectives": "starter-4b-unscramble-adjectives",
    "starter-4b-listen-write-adjectives": "starter-4b-listen-write-adjectives",
    "starter-4b-listen-write-plural": "starter-4b-listen-write-plural",
    "starter-4b-two-sounds-match": "starter-4b-two-sounds-match",
    "starter-4b-listen-and-say": "starter-4b-listen-and-say",
    "starter-4b-sentence-builder": "starter-4b-sentence-builder",
    "starter-4b-listen-and-write": "starter-4b-listen-and-write",
    "starter-4b-adjective-sentences": "starter-4b-adjective-sentences",

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
    "starter-2a-conversation-reading": "starter-2a-conversation-reading",
    "starter-2a-sentence-match": "starter-2a-sentence-match",
    "starter-2a-complete-be": "starter-2a-complete-be",
    "starter-2a-nationality-be": "starter-2a-nationality-be",
    "starter-2b-student-card": "starter-2b-student-card",
    "starter-2b-question-words": "starter-2b-question-words",
    "starter-2b-listen-repeat-qw": "starter-2b-listen-repeat-qw",
    "starter-2b-complete-questions": "starter-2b-complete-questions",

    // Unit 3A – Small Things & related
    "starter-3a-pictures-words-match": "starter-3a-pictures-words-match",
    "starter-3a-small-things": "starter-3a-pictures-words-match",
    "starter-3a-a-an-swipe": "starter-3a-a-an-swipe",
    "starter-3a-plural-s-sound-match": "starter-3a-plural-s-sound-match",
    "starter-3a-whats-in-your-bag": "starter-3a-whats-in-your-bag",
    "starter-3a-unscramble": "starter-3a-unscramble",
    "starter-3a-look-listen-write": "starter-3a-look-listen-write",
    "starter-3a-listen-number": "starter-3a-listen-number",
    "starter-3a-plural-match": "starter-3a-plural-match",
    "starter-3a-plurals-match": "starter-3a-plural-match",
    "starter-3a-sing-plur-match": "starter-3a-sing-plur-match",
    "starter-3a-singular-plural-match": "starter-3a-sing-plur-match",
    "starter-3a-sing-plur-sentences": "starter-3a-sing-plur-sentences",
    "starter-3a-make-plurals": "starter-3a-make-plurals",
    "starter-3a-listen-say-plural": "starter-3a-listen-say-plural",
    "starter-3a-listen-and-write": "starter-3a-listen-and-write",
    "starter-3a-what-is-it": "starter-3a-what-is-it",
    "starter-3a-q-and-a": "starter-3a-q-and-a",
    "starter-3a-ask-answer": "starter-3a-q-and-a",
    "starter-3b-souvenirs-match": "starter-3b-souvenirs-match",
    "starter-3b-souvenirs-listen-choose": "starter-3b-souvenirs-listen-choose",
    "starter-3b-souvenirs-unscramble": "starter-3b-souvenirs-unscramble",
    "starter-3b-souvenirs-listen-write": "starter-3b-souvenirs-listen-write"
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
      // Name alone is enough; class code is optional extra scope
      if (name && code) return "::" + name + "::" + code;
      if (name) return "::" + name;
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

  /** Fire level from play count: >3 → 1, >6 → 2, ≥10 → 3 */
  function fireLevelFromPlays(plays) {
    plays = Number(plays) || 0;
    if (plays >= 10) return 3;
    if (plays > 6) return 2;
    if (plays > 3) return 1;
    return 0;
  }

  function apply(root) {
    var scope = root || document;
    var starsData = loadStars();
    var playsData = loadPlays();

    // Ensure fire/star CSS is present
    ensureStarStyles();

    scope.querySelectorAll(".game-stars[data-game]").forEach(function (el) {
      var id = el.getAttribute("data-game");
      var n = bestStarsFor(id, starsData);
      var plays = bestPlaysFor(id, playsData);
      var fire = fireLevelFromPlays(plays);

      el.querySelectorAll(".star").forEach(function (star) {
        var need = Number(star.getAttribute("data-n") || 0);
        // Performance stars
        if (need <= n) {
          star.classList.add("is-filled");
          star.textContent = "★";
        } else {
          star.classList.remove("is-filled");
          star.textContent = "☆";
        }
        // Fire layer (based on play count)
        if (need <= fire) {
          star.classList.add("on-fire");
          ensureParticles(star);
        } else {
          star.classList.remove("on-fire");
          removeParticles(star);
        }
      });

      var label = n + " of 3 stars";
      if (fire > 0) label += ", " + fire + " on fire";
      el.setAttribute("aria-label", label);
      el.setAttribute("data-fire", String(fire));
    });

    scope.querySelectorAll(".game-plays[data-game]").forEach(function (el) {
      var id = el.getAttribute("data-game");
      var n = bestPlaysFor(id, playsData);
      el.setAttribute("data-count", String(n));
      el.setAttribute("aria-label", playLabel(n));

      // Short badge format (e.g. "3" or "99+") — hide when never played
      if (el.getAttribute("data-format") === "short" || el.classList.contains("game-plays-badge")) {
        if (n <= 0) {
          el.hidden = true;
          el.textContent = "";
        } else {
          el.hidden = false;
          el.textContent = n > 99 ? "99+" : String(n);
        }
      } else {
        el.hidden = false;
        el.textContent = playLabel(n);
      }
    });
  }

  function ensureParticles(star) {
    if (star.querySelector(".la-particles")) return;
    var wrap = document.createElement("span");
    wrap.className = "la-particles";
    wrap.setAttribute("aria-hidden", "true");

    // Shared wind direction for this star (particles feel like the same breeze)
    // Positive = right, negative = left. Mild random bias.
    var wind = (Math.random() * 2 - 1) * 12; // -12px … +12px base drift
    wrap.style.setProperty("--wind", wind.toFixed(1) + "px");

    // Bright fire particles (fast, small, orange/yellow) – less affected by wind
    for (var i = 0; i < 6; i++) {
      var p = document.createElement("span");
      p.className = "la-particle la-particle--fire";
      p.style.setProperty("--d", (i * 0.18) + "s");
      p.style.setProperty("--x", (Math.random() * 10 - 5).toFixed(1) + "px");
      p.style.setProperty("--w", (wind * (0.35 + Math.random() * 0.3)).toFixed(1) + "px");
      wrap.appendChild(p);
    }

    // Soft smoke particles (slower, larger) – more strongly pushed by wind
    for (var j = 0; j < 5; j++) {
      var s = document.createElement("span");
      s.className = "la-particle la-particle--smoke";
      s.style.setProperty("--d", (j * 0.35 + 0.2) + "s");
      s.style.setProperty("--x", (Math.random() * 12 - 6).toFixed(1) + "px");
      s.style.setProperty("--s", (0.7 + Math.random() * 0.8).toFixed(2));
      s.style.setProperty("--w", (wind * (0.9 + Math.random() * 0.5)).toFixed(1) + "px");
      wrap.appendChild(s);
    }

    star.appendChild(wrap);
  }

  function removeParticles(star) {
    var wrap = star.querySelector(".la-particles");
    if (wrap) wrap.remove();
  }

  function ensureStarStyles() {
    if (document.getElementById("la-stars-css")) return;
    var style = document.createElement("style");
    style.id = "la-stars-css";
    style.textContent =
      ".game-stars{display:flex;gap:4px;margin:8px 0 4px;font-size:1.15rem;line-height:1}" +
      ".game-stars .star{opacity:.35;filter:grayscale(1);position:relative;display:inline-block;transition:color .25s,filter .25s,transform .25s}" +
      ".game-stars .star.is-filled,.game-stars .star.filled,.game-stars .star[data-filled=\"1\"]{opacity:1;filter:none;color:#fbbf24}" +
      ".game-stars .star.on-fire{opacity:1;filter:none;color:#ff6b1a;text-shadow:0 0 6px #ff3d00,0 0 12px #ff8c00}" +
      ".game-stars .star.on-fire::after{content:\"🔥\";position:absolute;left:50%;bottom:70%;transform:translateX(-50%) scale(.55);font-size:1em;pointer-events:none;animation:la-flame 0.7s ease-in-out infinite alternate;z-index:2}" +
      "@keyframes la-flame{0%{transform:translateX(-50%) scale(.5) translateY(0);opacity:.85}100%{transform:translateX(-50%) scale(.65) translateY(-3px);opacity:1}}" +
      /* Shared particle container */
      ".game-stars .star .la-particles{position:absolute;left:50%;bottom:50%;width:0;height:0;pointer-events:none;z-index:1}" +
      /* Fire particles – small, bright, mild wind drift */
      ".game-stars .star .la-particle--fire{position:absolute;width:3px;height:3px;border-radius:50%;background:radial-gradient(circle,#ffeb3b 0%,#ff6b1a 60%,transparent 100%);opacity:0;animation:la-particle-fire 1.4s ease-out infinite;animation-delay:var(--d,0s)}" +
      "@keyframes la-particle-fire{" +
        "0%{opacity:0;transform:translate(var(--x,0),0) scale(.4)}" +
        "15%{opacity:.95;transform:translate(calc(var(--x,0) + var(--w,0px)*0.25),-5px) scale(.9)}" +
        "55%{opacity:.6;transform:translate(calc(var(--x,0) + var(--w,0px)*0.7),-12px) scale(.5)}" +
        "100%{opacity:0;transform:translate(calc(var(--x,0) + var(--w,0px)),-20px) scale(.15)}" +
      "}" +
      /* Smoke particles – larger, softer, stronger wind curve */
      ".game-stars .star .la-particle--smoke{position:absolute;width:7px;height:7px;border-radius:50%;background:radial-gradient(circle,rgba(220,220,220,.7) 0%,rgba(160,160,160,.35) 50%,transparent 100%);opacity:0;filter:blur(1px);animation:la-particle-smoke 2.8s ease-out infinite;animation-delay:var(--d,0s)}" +
      "@keyframes la-particle-smoke{" +
        "0%{opacity:0;transform:translate(var(--x,0),2px) scale(calc(var(--s,1)*0.45))}" +
        "18%{opacity:.55;transform:translate(calc(var(--x,0) + var(--w,0px)*0.3),-6px) scale(calc(var(--s,1)*0.75))}" +
        "50%{opacity:.35;transform:translate(calc(var(--x,0) + var(--w,0px)*0.75),-16px) scale(calc(var(--s,1)*1.05))}" +
        "100%{opacity:0;transform:translate(calc(var(--x,0) + var(--w,0px)*1.35),-32px) scale(calc(var(--s,1)*1.4))}" +
      "}" +
      ".resource-card .game-stars{justify-content:flex-start}";
    document.head.appendChild(style);
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

  /**
   * Compatibility helper used by several Unit 4B games (and possibly others).
   * Signature: laStars(gameId, score, total)
   * Converts score/total → accuracy, records a play, and saves best stars.
   * Mode-suffixed IDs (e.g. "...-write") are aliased to the parent card.
   */
  global.laStars = function (gameId, score, total) {
    if (!gameId) return;
    var s = Number(score) || 0;
    var t = Number(total) || 0;
    var acc = t > 0 ? (s / t) * 100 : 0;
    recordPlay(gameId);
    saveFromAccuracy(gameId, acc);
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
