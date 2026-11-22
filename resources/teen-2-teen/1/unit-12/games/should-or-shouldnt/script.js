/* Should or Shouldn't? – Teen2Teen 1 Unit 12. One question at a time, two options. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-should-or-shouldnt";

  // A = the question, hint = the reason, yes / no = the two answer options, answer = the correct one
  var ITEMS = [
    { q: "Should I visit the museum today?", hint: "It is closed on Mondays.", yes: "Yes, you should.", no: "No, you shouldn't.", answer: "no" },
    { q: "Should she buy that expensive dress?", hint: "It costs too much money.", yes: "Yes, she should.", no: "No, she shouldn't.", answer: "no" },
    { q: "Should they travel to the mountains in winter?", hint: "It is very cold and snowy there.", yes: "Yes, they should.", no: "No, they shouldn't.", answer: "no" },
    { q: "Should we take an umbrella to London?", hint: "It rains a lot there in the spring.", yes: "Yes, we should.", no: "No, we shouldn't.", answer: "yes" },
    { q: "Should he eat the spicy soup?", hint: "He doesn't like hot food.", yes: "Yes, he should.", no: "No, he shouldn't.", answer: "no" },
    { q: "Should I call a taxi to the airport?", hint: "The airport is very far from here.", yes: "Yes, you should.", no: "No, you shouldn't.", answer: "yes" },
    { q: "Should my parents book a hotel room?", hint: "All the good hotels are full this weekend.", yes: "Yes, they should.", no: "No, they shouldn't.", answer: "yes" },
    { q: "Should we swim in the ocean right now?", hint: "The water is very cold and dangerous today.", yes: "Yes, we should.", no: "No, we shouldn't.", answer: "no" },
    { q: "Should I try the local street food?", hint: "The food here is famous and delicious!", yes: "Yes, you should.", no: "No, you shouldn't.", answer: "yes" },
    { q: "Should she go to the party tonight?", hint: "She has a big exam tomorrow morning.", yes: "Yes, she should.", no: "No, she shouldn't.", answer: "no" }
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
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var idx = 0, score = 0, misses = 0, locked = false, order = [];
  var stageTimer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function setProgress() {
    $("sh-fill").style.width = Math.round((idx / ITEMS.length) * 100) + "%";
  }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }

  function renderItem(animateIn) {
    var it = ITEMS[order[idx]];
    var optionKeys = shuffle(["yes", "no"]);
    locked = false;
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<div class="sh-line"><span class="sh-who sh-who--a" aria-hidden="true">A</span>' +
      '<div class="sh-bubble">' + esc(it.q) + "</div></div>" +
      '<div class="sh-hint">💡 ' + esc(it.hint) + "</div>" +
      '<div class="sh-line"><span class="sh-who sh-who--b" aria-hidden="true">B</span>' +
      '<div class="sh-bubble sh-bubble--answer" id="sh-answer" hidden></div></div>' +
      '<div class="sh-options" role="group" aria-label="Choose the answer">' +
      optionKeys.map(function (k) {
        return '<button class="sh-opt" data-k="' + k + '">' + esc(it[k]) + "</button>";
      }).join("") +
      "</div>";
    setProgress();
    setFeedback("", "");
  }

  function nextItem() {
    var old = $("sh-card");
    old.classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      idx++;
      if (idx >= ITEMS.length) finish();
      else renderItem(true);
    }, 300);
  }

  function choose(btn) {
    if (locked || btn.disabled) return;
    var it = ITEMS[order[idx]];
    var k = btn.getAttribute("data-k");
    if (k === it.answer) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      sfx("correct");
      btn.classList.add("is-right");
      document.querySelectorAll(".sh-opt").forEach(function (b) {
        b.disabled = true;
        if (b !== btn) b.classList.add("is-dim");
      });
      var ans = $("sh-answer");
      ans.textContent = "B: " + it[k];
      ans.hidden = false;
      ans.classList.add("pc-pop");
      setFeedback("Yesss! 🎉", "ok");
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextItem, 1300);
    } else {
      misses++;
      sfx("wrong");
      btn.classList.add("is-wrong");
      btn.disabled = true;
      setFeedback("Not quite — try the other one 💪", "no");
    }
  }

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var total = ITEMS.length;
    var stars = score === total ? 3 : score / total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: start,
          onModes: start,
          backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("sh-card").innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
    $("sh-card").className = "sh-card";
  }

  /* ---------- events ---------- */
  $("sh-card").addEventListener("click", function (ev) {
    var b = ev.target.closest(".sh-opt");
    if (!b) return;
    audioCtx(); sfx("tap");
    choose(b);
  });

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap");
    paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    idx = 0; score = 0; misses = 0;
    order = ITEMS.map(function (_, i) { return i; });
    renderItem(false);
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
