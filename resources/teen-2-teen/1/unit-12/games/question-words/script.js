/* Question Words – Teen2Teen 1 Unit 12. Read the answer, choose the question word that completes the question. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-question-words";

  // q = the full question, a = the answer shown to the player
  var ITEMS = [
    { qw: "What", q: "What should I do in London?", a: "You should visit the Big Ben." },
    { qw: "What", q: "What should she buy in Paris?", a: "She should buy some perfume." },
    { qw: "What", q: "What should we eat in Japan?", a: "You should eat sushi." },
    { qw: "Where", q: "Where should they go in Australia?", a: "They should go to Sydney." },
    { qw: "Where", q: "Where should he stay in New York?", a: "He should stay in a hotel in Manhattan." },
    { qw: "Where", q: "Where should we meet?", a: "We should meet at the train station." },
    { qw: "When", q: "When should I visit Canada?", a: "You should visit in the summer." },
    { qw: "When", q: "When should she call her mom?", a: "She should call her tonight." },
    { qw: "When", q: "When should they go to Brazil?", a: "They should go in December." },
    { qw: "Who", q: "Who should I call for help?", a: "You should call the police." },
    { qw: "Who", q: "Who should he go with to the party?", a: "He should go with his sister." },
    { qw: "Who", q: "Who should we ask about the hotel?", a: "We should ask the tour guide." },
    { qw: "Why", q: "Why should I go to Egypt?", a: "Because the pyramids are amazing." },
    { qw: "Why", q: "Why should she buy that jacket?", a: "Because it is very cheap." },
    { qw: "Why", q: "Why should they learn English?", a: "Because it is good for their jobs." }
  ];
  var WORDS = ["What", "Where", "When", "Who", "Why"];

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
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var order = [], idx = 0, score = 0, misses = 0, locked = false, stageTimer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function setProgress() { $("sh-fill").style.width = Math.round((idx / ITEMS.length) * 100) + "%"; }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }

  // the question with the question word removed, so the blank takes its place
  function restOf(it) { return it.q.slice(it.qw.length); }

  function renderItem(animateIn) {
    var it = ITEMS[order[idx]];
    locked = false;
    var words = shuffle(WORDS);
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<div><p class="qw-label">Answer</p><div class="sh-bubble sh-bubble--answer"><p class="qw-answer">A: ' + esc(it.a) + "</p></div></div>" +
      '<div><p class="qw-label">Complete the question</p><p class="qw-question"><span class="qw-slot" id="qw-slot">______</span>' + esc(restOf(it)) + "</p></div>" +
      '<div class="qw-words" id="qw-words">' +
      words.map(function (w) { return '<button class="qw-word" data-w="' + w + '">' + w + "</button>"; }).join("") +
      "</div>";
    setProgress();
    setFeedback("", "");
  }

  function choose(btn) {
    if (locked || btn.disabled) return;
    var it = ITEMS[order[idx]];
    var w = btn.getAttribute("data-w");
    var slot = $("qw-slot");
    if (w === it.qw) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      sfx("correct");
      btn.classList.add("is-right");
      slot.textContent = it.qw;
      slot.classList.add("is-right");
      document.querySelectorAll(".qw-word").forEach(function (b) {
        b.disabled = true;
        if (b !== btn) b.classList.add("is-dim");
      });
      setFeedback("Yesss! 🎉", "ok");
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextItem, 1200);
    } else {
      misses++;
      sfx("wrong");
      btn.classList.add("is-wrong");
      btn.disabled = true;
      slot.classList.add("is-wrong");
      setFeedback("Not quite — try another word 💪", "no");
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
  $("sh-card").addEventListener("click", function (ev) {
    var b = ev.target.closest(".qw-word");
    if (!b) return;
    audioCtx(); sfx("tap");
    choose(b);
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
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    idx = 0; score = 0; misses = 0;
    renderItem(false);
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
