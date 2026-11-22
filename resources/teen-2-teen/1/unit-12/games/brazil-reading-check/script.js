/* Brazil Reading Check – Teen2Teen 1 Unit 12: You should visit Brazil! */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-brazil-reading-check";
  var AUDIO_URL = "https://cdn.imgurl.ir/uploads/u5443_.mp3";

  var DIALOGUE = [
    ["Ana", "Hello, Daniel? Are you there?"],
    ["Daniel", "I'm here, Ana. How are you?"],
    ["Ana", "Actually, I'm great! Daniel, guess what!"],
    ["Daniel", "What?"],
    ["Ana", "Julie Duclos is here with her family. From Canada! She's here in my apartment now."],
    ["Julie", "Hi, Daniel! It's true. We're here in Brazil for a week."],
    ["Daniel", "Hi, Julie! Lucky you!"],
    ["Julie", "Yeah, Brazil is fantastic!"],
    ["Ana", "Daniel, you should visit Brazil, too!"],
    ["Daniel", "I should! That's an awesome idea. But what's Brazil like?"],
    ["Ana", "Well, it's a really big country. The people are very nice. The weather is great. The restaurants are fantastic. And the beaches are awesome!"],
    ["Daniel", "Hey, Julie! You should upload some photos of Brazil to Teen2Teen Friends, OK?"],
    ["Julie", "Great idea!"],
    ["Ana", "See you later, Daniel!"],
    ["Daniel", "Bye, guys!"]
  ];

  // Part 2: circle the correct name or names
  var QUESTIONS = [
    { q: "Who is in Brazil?", answer: ["Ana", "Julie"] },
    { q: "Who isn't in Brazil?", answer: ["Daniel"] },
    { q: "Who is from Canada?", answer: ["Julie"] },
    { q: "Who is from Brazil?", answer: ["Ana"] },
    { q: "Who should come to Brazil?", answer: ["Daniel"] },
    { q: "Who should upload photos?", answer: ["Julie"] }
  ];
  var NAMES = ["Ana", "Daniel", "Julie"];

  // Part 3: tick the sentences that are true according to Ana. Item 1 is the example.
  var STATEMENTS = [
    { t: "There are nice people.", truth: true, example: true },
    { t: "There are fantastic malls.", truth: false },
    { t: "There are awesome buildings.", truth: false },
    { t: "There are good restaurants.", truth: true },
    { t: "There is great weather.", truth: true },
    { t: "There are nice beaches.", truth: true }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;
  var K = null;

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
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var qSel = QUESTIONS.map(function () { return {}; });   // chosen names per question
  var sSel = STATEMENTS.map(function (s) { return !!s.example; }); // ticked statements
  var checked = false;
  var audio = document.getElementById("bk-audio");

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- Part 1: dialogue ---------- */
  function renderChat() {
    $("bk-chat").innerHTML = DIALOGUE.map(function (line) {
      return '<div class="bk-line"><span class="bk-who bk-who--' + line[0].toLowerCase() + '">' + line[0] + ':</span>' +
        '<span class="bk-text">' + esc(line[1]) + "</span></div>";
    }).join("");
  }

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), r = Math.floor(sec % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function updateProgress() {
    var d = audio.duration;
    var pct = d && isFinite(d) ? Math.min(100, (audio.currentTime / d) * 100) : 0;
    $("bk-fill").style.width = pct + "%";
    $("bk-track").setAttribute("aria-valuenow", Math.round(pct));
    $("bk-time").textContent = fmt(audio.currentTime) + (d && isFinite(d) ? " / " + fmt(d) : "");
  }

  /* ---------- seek: click or drag the bar, or use the arrow keys ---------- */
  var track = $("bk-track");
  var dragging = false;
  function seekFromPointer(clientX) {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    var r = track.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    audio.currentTime = ratio * d;
    updateProgress();
  }
  track.addEventListener("pointerdown", function (e) {
    audioCtx();
    dragging = true;
    track.classList.add("is-seeking");
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
    seekFromPointer(e.clientX);
  });
  track.addEventListener("pointermove", function (e) { if (dragging) seekFromPointer(e.clientX); });
  ["pointerup", "pointercancel"].forEach(function (ev) {
    track.addEventListener(ev, function () { dragging = false; track.classList.remove("is-seeking"); });
  });
  track.addEventListener("keydown", function (e) {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    if (e.key === "ArrowRight") { audio.currentTime = Math.min(d, audio.currentTime + 5); }
    else if (e.key === "ArrowLeft") { audio.currentTime = Math.max(0, audio.currentTime - 5); }
    else if (e.key === "Home") { audio.currentTime = 0; }
    else if (e.key === "End") { audio.currentTime = d; }
    else return;
    e.preventDefault();
    updateProgress();
  });

  function setPlayingUI(playing) {
    $("bk-listen").classList.toggle("is-playing", playing);
    $("bk-listen").setAttribute("aria-label", playing ? "Pause the webchat" : "Play the webchat");
    $("bk-player").classList.toggle("is-playing", playing);
  }

  $("bk-listen").addEventListener("click", function () {
    audioCtx(); sfx("tap");
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      audio.pause();
    }
  });
  audio.addEventListener("play", function () { setPlayingUI(true); });
  audio.addEventListener("pause", function () { setPlayingUI(false); });
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("ended", function () {
    setPlayingUI(false);
    updateProgress();
  });

  /* ---------- dark / light mode ---------- */
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function paintThemeButton() {
    $("bk-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false");
  }
  $("bk-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap");
    paintThemeButton();
  });
  paintThemeButton();

  /* ---------- Part 2: circle the names ---------- */
  function renderQuestions() {
    $("bk-qs").innerHTML = QUESTIONS.map(function (item, i) {
      var btns = NAMES.map(function (n) {
        return '<button class="bk-name" data-q="' + i + '" data-n="' + n + '">' + n + "</button>";
      }).join("");
      return '<div class="bk-q"><p class="bk-q-text"><b>' + (i + 1) + ".</b>" + esc(item.q) + "</p>" +
        '<div class="bk-names">' + btns + "</div></div>";
    }).join("");
  }

  $("bk-qs").addEventListener("click", function (ev) {
    var b = ev.target.closest(".bk-name");
    if (!b || checked) return;
    var q = Number(b.getAttribute("data-q")), n = b.getAttribute("data-n");
    qSel[q][n] = !qSel[q][n];
    sfx("tap");
    b.classList.toggle("is-on", !!qSel[q][n]);
    updateCheck();
  });

  /* ---------- Part 3: tick the true sentences ---------- */
  function renderStatements() {
    $("bk-stmts").innerHTML = STATEMENTS.map(function (s, i) {
      var on = sSel[i];
      return '<div class="bk-st' + (s.example ? " is-example" : "") + '" data-s="' + i + '">' +
        '<span class="bk-st-n">' + (i + 1) + ".</span>" +
        '<span class="bk-st-text">' + esc(s.t) + "</span>" +
        '<button class="bk-box' + (on ? " is-on" : "") + '" data-s="' + i + '" aria-label="Tick: ' + esc(s.t) + '"' +
        (s.example ? " disabled" : "") + ">" + (on ? "✓" : "") + "</button>" +
        '<span class="bk-st-mark"></span></div>';
    }).join("");
  }

  $("bk-stmts").addEventListener("click", function (ev) {
    var b = ev.target.closest(".bk-box");
    if (!b || checked || b.disabled) return;
    var i = Number(b.getAttribute("data-s"));
    sSel[i] = !sSel[i];
    sfx("tap");
    b.classList.toggle("is-on", sSel[i]);
    b.textContent = sSel[i] ? "✓" : "";
    updateCheck();
  });

  /* ---------- check and score ---------- */
  function sameSet(a, b) {
    var ka = Object.keys(a).filter(function (k) { return a[k]; }).sort();
    var kb = b.slice().sort();
    return ka.length === kb.length && ka.every(function (v, i) { return v === kb[i]; });
  }

  function updateCheck() {
    // enable the check button once something has been picked
    var any = qSel.some(function (s) { return Object.keys(s).some(function (k) { return s[k]; }); }) ||
      sSel.some(function (v, i) { return v && !STATEMENTS[i].example; });
    $("bk-check").disabled = checked || !any;
  }

  function checkAll() {
    if (checked) return;
    checked = true;
    var right = 0, total = 0;

    // Part 2
    QUESTIONS.forEach(function (item, i) {
      total++;
      var ok = sameSet(qSel[i], item.answer);
      if (ok) right++;
      document.querySelectorAll('.bk-name[data-q="' + i + '"]').forEach(function (b) {
        var n = b.getAttribute("data-n");
        var chosen = !!qSel[i][n], shouldBe = item.answer.indexOf(n) > -1;
        b.disabled = true;
        b.classList.remove("is-on");
        if (chosen && shouldBe) b.classList.add("is-right");
        else if (chosen && !shouldBe) b.classList.add("is-wrong");
        else if (!chosen && shouldBe) b.classList.add("is-missed");
        else if (chosen) b.classList.add("is-on");
      });
    });

    // Part 3 (the example is not scored)
    STATEMENTS.forEach(function (s, i) {
      var row = document.querySelector('.bk-st[data-s="' + i + '"]');
      var box = row.querySelector(".bk-box");
      box.disabled = true;
      if (s.example) return;
      total++;
      var ok = sSel[i] === s.truth;
      if (ok) right++;
      row.classList.add(ok ? "is-right" : "is-wrong");
      row.querySelector(".bk-st-mark").textContent = ok ? "✓" : "✗";
    });

    var pct = right / total;
    var msg = right === total ? "Perfect! 🎉 " + right + " / " + total :
      pct >= 0.6 ? "Great work! " + right + " / " + total + " ⭐" :
      "Good try! " + right + " / " + total + " — look again and learn!";
    $("bk-result").textContent = msg;
    $("bk-check").hidden = true;
    $("bk-finish").hidden = false;
    var ok = right === total;
    sfx(ok ? "win" : "correct");
    if (!ok && pct < 0.6) sfx("wrong");
    state.score = right; state.total = total;
  }

  var state = { score: 0, total: 0 };

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var stars = state.score === state.total ? 3 : state.score / state.total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: state.score,
          total: state.total,
          stars: stars,
          timeMs: timeMs,
          onAgain: reset,
          onModes: reset,
          backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("bk-result").textContent = "You scored " + state.score + " / " + state.total + "!";
  }
  $("bk-finish").addEventListener("click", function () { sfx("tap"); finish(); });
  $("bk-check").addEventListener("click", function () { sfx("tap"); checkAll(); });

  /* ---------- phone tabs ---------- */
  document.querySelectorAll(".bk-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      sfx("tap");
      var which = t.getAttribute("data-tab");
      document.querySelectorAll(".bk-tab").forEach(function (x) {
        var on = x === t;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".bk-panel").forEach(function (p) {
        p.classList.toggle("is-on", p.getAttribute("data-panel") === which);
      });
    });
  });

  /* ---------- start / reset ---------- */
  function reset() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    qSel = QUESTIONS.map(function () { return {}; });
    sSel = STATEMENTS.map(function (s) { return !!s.example; });
    checked = false;
    state = { score: 0, total: 0 };
    renderChat(); renderQuestions(); renderStatements();
    $("bk-result").textContent = "";
    $("bk-check").hidden = false;
    $("bk-finish").hidden = true;
    updateCheck();
    setPlayingUI(false);
    updateProgress();
  }

  // unlock audio on the first tap of the page
  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });

  reset();
})();
