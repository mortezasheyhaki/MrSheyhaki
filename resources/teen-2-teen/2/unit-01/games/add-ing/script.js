/* Add -ing (Starter Unit 3A) — same mechanism style as Make Plurals.
   Types:
   - "e"   : verb ends in e   → tap the e to remove it, then tap -ing  (dance → danc + ing)
   - "cvc" : one vowel + one consonant at the end → tap the last consonant to double it, then tap -ing  (stop → stopp + ing)
   - "plain": everything else → just tap -ing  (play → play + ing) */
(function () {
  "use strict";

  const GAME_ID = "t2t2-u1-add-ing";

  const ITEMS = [
    { id: "dance",    base: "dance",    type: "e" },
    { id: "practice", base: "practice", type: "e" },
    { id: "ride",     base: "ride",     type: "e" },
    { id: "drive",    base: "drive",    type: "e" },
    { id: "write",    base: "write",    type: "e" },
    { id: "use",      base: "use",      type: "e" },
    { id: "have",     base: "have",     type: "e" },
    { id: "bike-ride", base: "bike ride", type: "e" },
    { id: "swim",     base: "swim",     type: "cvc" },
    { id: "stop",     base: "stop",     type: "cvc" },
    { id: "run",      base: "run",      type: "cvc" },
    { id: "get",      base: "get",      type: "cvc" },
    { id: "put",      base: "put",      type: "cvc" },
    { id: "sit",      base: "sit",      type: "cvc" },
    { id: "listen",   base: "listen",   type: "plain" },
    { id: "sing",     base: "sing",     type: "plain" },
    { id: "draw",     base: "draw",     type: "plain" },
    { id: "play",     base: "play",     type: "plain" },
    { id: "go",       base: "go",       type: "plain" },
    { id: "cook",     base: "cook",     type: "plain" },
    { id: "look",     base: "look",     type: "plain" },
    { id: "meet",     base: "meet",     type: "plain" },
    { id: "buy",      base: "buy",      type: "plain" },
    { id: "cry",      base: "cry",      type: "plain" },
    { id: "finish",   base: "finish",   type: "plain" }
  ];

  const app = document.getElementById("game-app");
  let phase = "menu";     // menu | play | done
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;
  let attached = false;   // "-ing" is on the word
  let eRemoved = false;   // e-type: the final e was removed
  let doubled = false;    // cvc: the last consonant was doubled
  let feedbackText = "";
  let feedbackClass = "";
  let enterNext = true;   // play the entrance animation only when a new word appears

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function current() { return ITEMS[order[idx]]; }

  function ingWord(it) {
    if (it.type === "e") return it.base.slice(0, -1) + "ing";
    if (it.type === "cvc") return it.base + it.base.slice(-1) + "ing";
    return it.base + "ing";
  }

  function hintFor(it) {
    if (it.type === "e") return "Ends in e → remove the e, then add -ing.";
    if (it.type === "cvc") return "One vowel + one consonant → double the last consonant, then add -ing.";
    return "Add -ing.";
  }

  function sfx(name) {
    try {
      if (window.LASfx && LASfx[name]) LASfx[name]();
    } catch (e) {}
  }

  /* ---------- menu ---------- */
  function renderMenu() {
    app.innerHTML =
      '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Add -ing</span>' +
        '<span class="mc-badge">3A</span>' +
      '</header>' +
      '<section class="mc-start">' +
        '<div class="mc-hero ing-hero" aria-hidden="true">🏃</div>' +
        '<h1>Add -ing</h1>' +
        '<p class="mc-desc">Make the verb into its <strong>-ing</strong> form</p>' +
        '<ul class="mp-rules">' +
          '<li>Most verbs → add <b>-ing</b></li>' +
          '<li>Ends in <b>e</b> → remove the <b>e</b>, then <b>-ing</b></li>' +
          '<li>One vowel + one consonant → double it, then <b>-ing</b></li>' +
        '</ul>' +
        '<button type="button" class="mc-btn" id="ing-start">Start →</button>' +
        '<p class="mp-record">' + ITEMS.length + ' verbs</p>' +
      '</section>';
    document.getElementById("ing-start").onclick = function () { sfx("click"); start(); };
  }

  function start() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    idx = 0;
    score = 0;
    phase = "play";
    if (window.LAFinish) LAFinish.startTimer();
    loadItem();
  }

  function loadItem() {
    enterNext = true;
    attached = false;
    eRemoved = false;
    doubled = false;
    locked = false;
    feedbackText = "";
    feedbackClass = "";
    renderPlay();
  }

  /* ---------- play ---------- */
  function renderPlay() {
    const it = current();
    const progress = '<span class="mc-progress">' + (idx + 1) + ' / ' + order.length + '</span>';

    // what the stem shows, and the tappable letter for e / cvc words
    let stemHtml = "";
    if (it.type === "e") {
      stemHtml = eRemoved
        ? '<span class="mp-stem">' + it.base.slice(0, -1) + '</span>'
        : '<span class="mp-stem">' + it.base.slice(0, -1) + '</span>' +
          '<button type="button" class="mp-y" id="ing-letter" title="Tap to remove the e">e</button>';
    } else if (it.type === "cvc") {
      const last = it.base.slice(-1);
      stemHtml = doubled
        ? '<span class="mp-stem">' + it.base + last + '</span>'
        : '<span class="mp-stem">' + it.base.slice(0, -1) + '</span>' +
          '<button type="button" class="mp-y" id="ing-letter" title="Tap to double the ' + last + '">' + last + '</button>';
    } else {
      stemHtml = '<span class="mp-stem">' + it.base + '</span>';
    }

    const endingSlot = attached
      ? '<span class="mp-ending is-filled">ing</span>'
      : '<span class="mp-ending is-empty"></span>';

    const fb = feedbackText
      ? '<p class="mp-feedback ' + feedbackClass + '"><span>' + feedbackText + '</span></p>'
      : '<p class="mp-feedback"></p>';

    const pct = Math.round((idx / order.length) * 100);
    const enterCls = enterNext ? " is-enter" : "";
    enterNext = false;

    app.innerHTML =
      '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Add -ing</span>' +
        progress +
      '</header>' +
      '<div class="ing-track" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
      '<p class="mc-instruction" id="ing-hint">' + hintFor(it) + '</p>' +
      '<div class="mp-stage' + enterCls + '">' +
        '<div class="mp-word" id="ing-word">' + stemHtml + endingSlot + '</div>' +
        fb +
        '<div class="mp-tiles">' +
          '<button type="button" class="mp-tile" id="ing-tile"' + (locked || attached ? ' disabled' : '') + '>-ing</button>' +
        '</div>' +
        '<p class="mp-tip">Tap -ing to finish the word</p>' +
      '</div>';

    const letter = document.getElementById("ing-letter");
    if (letter) letter.onclick = function (e) {
      e.stopPropagation();
      if (locked || attached) return;
      sfx("click");
      const btn = e.currentTarget;
      btn.classList.add("is-gone");
      if (it.type === "e") eRemoved = true;
      if (it.type === "cvc") doubled = true;
      setTimeout(renderPlay, 260);
    };

    const tile = document.getElementById("ing-tile");
    if (tile) tile.onclick = function () {
      if (locked || attached) return;
      tile.classList.add("is-press");
      sfx("click");
      setTimeout(attachIng, 140);
    };
  }

  function attachIng() {
    attached = true;
    sfx("pop");
    renderPlay();
    setTimeout(check, 220);
  }

  function check() {
    if (locked || !attached) return;
    locked = true;
    const it = current();
    let ok;
    if (it.type === "e") ok = eRemoved;
    else if (it.type === "cvc") ok = doubled;
    else ok = true;

    const word = ingWord(it);
    if (ok) {
      score += 1;
      sfx("correct");
      feedbackText = "Correct! " + word;
      feedbackClass = "ok";
    } else {
      sfx("wrong");
      feedbackText = "It's “" + word + "”";
      feedbackClass = "bad";
    }
    const wordEl = document.getElementById("ing-word");
    if (wordEl) wordEl.classList.add(ok ? "is-correct" : "is-wrong");
    const fbEl = app.querySelector(".mp-feedback");
    if (fbEl) { fbEl.innerHTML = "<span>" + feedbackText + "</span>"; fbEl.className = "mp-feedback " + feedbackClass; }

    setTimeout(function () {
      idx += 1;
      if (idx >= order.length) finish();
      else loadItem();
    }, ok ? 700 : 1200);
  }

  /* ---------- finish ---------- */
  function calcStars() {
    if (score >= 22) return 3;
    if (score >= 17) return 2;
    if (score >= 11) return 1;
    return 0;
  }

  function finish() {
    phase = "done";
    sfx("win");
    const stars = calcStars();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, Math.round((score / ITEMS.length) * 100));
      } catch (e) {}
    }
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: ITEMS.length,
        stars: stars,
        timeMs: timeMs,
        onAgain: function () { start(); },
        onModes: function () { renderMenu(); },
        backHref: "../",
        save: false
      });
      return;
    }
    app.innerHTML = '<p>Done — ' + score + ' / ' + ITEMS.length + '</p>' +
      '<button type="button" class="mc-btn" id="ing-again">Again</button>';
    document.getElementById("ing-again").onclick = function () { start(); };
  }

  renderMenu();
})();
