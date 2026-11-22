/* Write the Question – Teen2Teen 1 Unit 12. Write the question from the cue words, using the answer. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-write-the-question";

  // cue = the words in brackets, a = the answer (B), words = what to write in the boxes, tail = fixed words after the boxes
  var ITEMS = [
    { cue: "What / I / do", a: "You should go take a boat tour.", words: "What should I do", tail: "in Istanbul" },
    { cue: "Where / my brother / go", a: "He should visit the Bavarian Alps.", words: "Where should my brother go", tail: "in Germany" },
    { cue: "When / Donna / come", a: "She should come in October. The weather is fantastic then.", words: "When should Donna come", tail: "to Japan" },
    { cue: "Where / we / meet", a: "Let's meet at the market next to Pelourinho. OK?", words: "Where should we meet", tail: "in Salvador" },
    { cue: "Who / my parents / call", a: "They should call my parents. They're lots of fun!", words: "Who should my parents call", tail: "in Lisbon" },
    { cue: "Why / I / visit", a: "Because it's a beautiful tourist attraction.", words: "Why should I visit", tail: "Machu Picchu" },
    { cue: "What / we / eat", a: "You should eat pizza and pasta. They are delicious!", words: "What should we eat", tail: "in Italy" },
    { cue: "Where / I / buy", a: "You should go to the small shops near the Eiffel Tower.", words: "Where should I buy", tail: "souvenirs in Paris" },
    { cue: "When / they / travel", a: "They should go in December. It is summer there!", words: "When should they travel", tail: "to Australia" },
    { cue: "Who / he / ask", a: "He should ask a police officer.", words: "Who should he ask", tail: "for directions in New York" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  /* ---------- sound effects ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("ua-muted") === "1"; } catch (e) {}
  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audioCtx(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    tap: function () { tone(640, 0.05, "triangle", 0.07); },
    type: function () { tone(900, 0.03, "square", 0.03); },
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var idx = 0, score = 0, misses = 0, locked = false, stageTimer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  // ignore case and punctuation, so "Machu" / "machu" both count
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z']/g, "").trim(); }

  function setProgress() { $("sh-fill").style.width = Math.round((idx / ITEMS.length) * 100) + "%"; }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }
  function boxes() { return Array.prototype.slice.call(document.querySelectorAll("#wq-row .tp-box")); }

  /* Make the whole question fit on ONE line: shrink the boxes and text until it fits the width. */
  function fitQuestion() {
    var row = $("wq-row");
    if (!row) return;
    var bs = boxes(), tail = $("wq-tail");
    var k = 30;
    function apply() {
      bs.forEach(function (b) {
        var len = Number(b.getAttribute("data-len"));
        b.style.width = Math.round(len * k * 0.62 + 18) + "px";
        b.style.height = Math.round(Math.max(40, Math.min(58, k * 2.1))) + "px";
        b.style.fontSize = Math.round(Math.max(12, Math.min(26, k * 0.9))) + "px";
      });
      if (tail) tail.style.fontSize = Math.round(Math.max(12, Math.min(24, k * 0.9))) + "px";
    }
    apply();
    while (row.scrollWidth > row.clientWidth && k > 8) { k -= 1; apply(); }
  }
  window.addEventListener("resize", function () { if (document.getElementById("wq-row")) fitQuestion(); });
  function allFilled() { return boxes().every(function (b) { return b.value.trim().length > 0; }); }
  function updateCheck() { var c = $("wq-check"); if (c) c.disabled = locked || !allFilled(); }

  function renderItem(animateIn) {
    var it = ITEMS[idx];
    var ws = it.words.split(" ");
    locked = false;
    var boxesHTML = ws.map(function (w, i) {
      // one extra character for a possible apostrophe, otherwise the word length
      return '<input class="tp-box" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
        'maxlength="' + (w.length + 2) + '" data-len="' + w.length + '" data-w="' + i + '" style="--len:' + w.length + '" aria-label="Word ' + (i + 1) + '">';
    }).join(" ");
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<div><p class="qw-label">Cue words</p><p class="wq-cue">(' + esc(it.cue) + ")</p></div>" +
      '<div><p class="qw-label">Answer</p><div class="sh-bubble sh-bubble--answer"><p class="qw-answer">B: ' + esc(it.a) + "</p></div></div>" +
      '<div><p class="qw-label">Write the question</p><div class="wq-question" id="wq-row"><div class="wq-boxes" id="wq-boxes">' + boxesHTML + "</div>" +
      (it.tail ? '<span class="wq-tail" id="wq-tail">' + esc(it.tail) + "?</span>" : '<span class="wq-tail" id="wq-tail">?</span>') + "</div></div>" +
      '<button class="ca-check" id="wq-check" disabled>Check ✓</button>';
    setProgress();
    setFeedback("", "");
    updateCheck();
    fitQuestion();
    var first = boxes()[0];
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, animateIn ? 450 : 50);
  }

  function check() {
    if (locked || !allFilled()) return;
    var target = ITEMS[idx].words.split(" ");
    var bs = boxes();
    var wrong = 0;
    bs.forEach(function (b, i) {
      b.classList.remove("is-wrong");
      if (norm(b.value) === norm(target[i])) { b.classList.add("is-right"); b.readOnly = true; }
      else { b.classList.add("is-wrong"); wrong++; }
    });
    if (wrong === 0) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      sfx("correct");
      setFeedback("Yesss! 🎉", "ok");
      updateCheck();
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextItem, 1300);
    } else {
      misses++;
      sfx("wrong");
      setFeedback("Check the red boxes 💪", "no");
      var first = bs.filter(function (b) { return b.classList.contains("is-wrong"); })[0];
      if (first) first.focus({ preventScroll: true });
    }
  }

  function nextItem() {
    $("sh-card").classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      idx++;
      if (idx >= ITEMS.length) finish();
      else renderItem(true);
    }, 300);
  }

  /* ---------- events ---------- */
  $("sh-card").addEventListener("input", function (ev) {
    var b = ev.target;
    if (!b.classList || !b.classList.contains("tp-box")) return;
    b.classList.remove("is-wrong");
    sfx("type");
    var max = Number(b.getAttribute("maxlength")), w = b.value.length;
    if (w >= Number(b.getAttribute("data-len"))) {
      var bs = boxes(), i = bs.indexOf(b);
      if (i > -1 && i < bs.length - 1) bs[i + 1].focus();
    }
    updateCheck();
  });
  $("sh-card").addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    if (!ev.target.classList || !ev.target.classList.contains("tp-box")) return;
    ev.preventDefault();
    if (allFilled()) check();
    else { var empty = boxes().filter(function (x) { return !x.value.trim(); })[0]; if (empty) empty.focus(); }
  });
  $("sh-card").addEventListener("click", function (ev) {
    if (ev.target.closest("#wq-check")) { audioCtx(); sfx("tap"); check(); }
  });

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var total = ITEMS.length;
    var stars = score === total ? 3 : score / total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID, score: score, total: total, stars: stars, timeMs: timeMs,
          onAgain: start, onModes: start, backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("sh-card").className = "sh-card";
    $("sh-card").innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
  }

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap"); paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    idx = 0; score = 0; misses = 0;
    renderItem(false);
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
