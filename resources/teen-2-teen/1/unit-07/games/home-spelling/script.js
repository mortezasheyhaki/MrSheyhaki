/* Home Spelling – Teen2Teen 1 Unit 7.
   Look at the picture and type the word, one letter per box. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u07-home-spelling";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // label = the answer (with the article), image = the picture shown
  var ITEMS = [
    { label: "a bedroom", image: CDN + "b675450_.png" },
    { label: "a bathroom", image: CDN + "u826722_.png" },
    { label: "a living room", image: CDN + "h26585_.png" },
    { label: "a kitchen", image: CDN + "9661_.png" },
    { label: "a desk", image: CDN + "o870838_.png" },
    { label: "a bed", image: CDN + "x024426_.png" },
    { label: "a shower", image: CDN + "s184435_.png" },
    { label: "a bathtub", image: CDN + "u55311_.png" },
    { label: "a toilet", image: CDN + "f858165_.png" },
    { label: "a sofa", image: CDN + "i534106_.png" },
    { label: "a chair", image: CDN + "u926536_.png" },
    { label: "a fridge", image: CDN + "j3521_.png" },
    { label: "a sink", image: CDN + "t86808_.png" }
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

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function onlyLetters(s) { return String(s || "").toLowerCase().replace(/[^a-z]/g, ""); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- state ---------- */
  var order = [], idx = 0, score = 0, misses = 0, locked = false, stageTimer = null;
  var letters = [];            // the answer letters of the current picture, no spaces

  function setProgress(pct) { $("sh-fill").style.width = pct + "%"; }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }

  /* ---------- the letter boxes ---------- */
  function boxes() { return Array.prototype.slice.call(document.querySelectorAll("#hs-row .hs-box")); }
  function allFilled() { return boxes().every(function (b) { return b.value.length > 0; }); }
  function updateCheck() { var c = $("hs-check"); if (c) c.disabled = locked || !allFilled(); }
  function focusBox(b) { if (!b) return; b.focus({ preventScroll: true }); try { b.select(); } catch (e) {} }
  // next / previous box that can still be typed in (skips the ones already right)
  function stepFrom(i, dir) {
    var bs = boxes();
    for (var k = i + dir; k >= 0 && k < bs.length; k += dir) { if (!bs[k].readOnly) return bs[k]; }
    return null;
  }

  function renderItem(animateIn) {
    var it = order[idx];
    locked = false;
    misses = 0;
    letters = it.label.replace(/ /g, "").split("");
    var n = 0;
    var rowHTML = it.label.split(" ").map(function (w) {
      var inner = w.split("").map(function () {
        n++;
        return '<input class="hs-box" type="text" maxlength="1" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
          'data-i="' + (n - 1) + '" aria-label="Letter ' + n + '">';
      }).join("");
      return '<div class="hs-word">' + inner + "</div>";
    }).join("");
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<p class="hs-label">' + (idx + 1) + " / " + order.length + " · What is it? Type the word.</p>" +
      '<div class="hs-pic" id="hs-pic"><img class="hs-img" id="hs-img" src="' + esc(it.image) + '" alt="Picture to name" draggable="false">' +
      '<span class="hs-pic-fallback" aria-hidden="true">🖼️</span></div>' +
      '<div class="hs-row" id="hs-row">' + rowHTML + "</div>" +
      '<button class="hs-check" id="hs-check" disabled>Check ✓</button>';
    $("hs-img").addEventListener("error", function () { $("hs-pic").classList.add("is-broken"); });
    setProgress(Math.round((idx / order.length) * 100));
    setFeedback("", "");
    updateCheck();
    var first = boxes()[0];
    if (first) setTimeout(function () { focusBox(first); }, animateIn ? 450 : 50);
  }

  function check() {
    if (locked || !allFilled()) return;
    var bs = boxes(), wrong = 0;
    bs.forEach(function (b, i) {
      if (b.readOnly) return;
      b.classList.remove("is-wrong");
      if (b.value.toLowerCase() === letters[i]) { b.classList.add("is-right"); b.readOnly = true; }
      else { b.classList.add("is-wrong"); wrong++; }
    });
    if (wrong === 0) {
      locked = true;
      if (misses === 0) score++;
      sfx("correct");
      setFeedback("Yes! " + order[idx].label + " 🎉", "ok");
      updateCheck();
      clearTimeout(stageTimer);
      stageTimer = setTimeout(next, 1200);
    } else {
      misses++;
      sfx("wrong");
      setFeedback("Check the red boxes 💪", "no");
      var firstWrong = bs.filter(function (b) { return b.classList.contains("is-wrong"); })[0];
      focusBox(firstWrong);
    }
  }

  function next() {
    $("sh-card").classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      idx++;
      if (idx >= order.length) finish();
      else renderItem(true);
    }, 300);
  }

  /* ---------- events ---------- */
  var card = $("sh-card");
  function isBox(el) { return el && el.classList && el.classList.contains("hs-box"); }

  card.addEventListener("input", function (ev) {
    var b = ev.target;
    if (!isBox(b)) return;
    b.classList.remove("is-wrong");
    var v = onlyLetters(b.value);
    b.value = v ? v.slice(-1) : "";
    if (b.value) {
      sfx("type");
      focusBox(stepFrom(boxes().indexOf(b), 1));
    }
    updateCheck();
  });

  card.addEventListener("keydown", function (ev) {
    var b = ev.target;
    if (!isBox(b)) return;
    var i = boxes().indexOf(b);
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (allFilled()) check();
      else focusBox(boxes().filter(function (x) { return !x.value; })[0]);
    } else if (ev.key === "Backspace" && !b.value) {
      ev.preventDefault();
      var prev = stepFrom(i, -1);
      if (prev) { prev.value = ""; prev.classList.remove("is-wrong"); focusBox(prev); updateCheck(); }
    } else if (ev.key === "ArrowLeft") {
      ev.preventDefault(); focusBox(stepFrom(i, -1));
    } else if (ev.key === "ArrowRight") {
      ev.preventDefault(); focusBox(stepFrom(i, 1));
    }
  });

  // pasting a whole word fills the boxes from the one you are in
  card.addEventListener("paste", function (ev) {
    var b = ev.target;
    if (!isBox(b)) return;
    ev.preventDefault();
    var text = onlyLetters((ev.clipboardData || window.clipboardData).getData("text"));
    var bs = boxes(), i = bs.indexOf(b), last = b;
    for (var k = 0; k < text.length && i < bs.length; i++) {
      if (bs[i].readOnly) continue;
      bs[i].value = text[k++]; bs[i].classList.remove("is-wrong"); last = bs[i];
    }
    focusBox(last);
    updateCheck();
  });

  card.addEventListener("focusin", function (ev) { if (isBox(ev.target)) { try { ev.target.select(); } catch (e) {} } });

  card.addEventListener("click", function (ev) {
    if (ev.target.closest("#hs-check")) { audioCtx(); sfx("tap"); check(); }
  });

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var total = order.length;
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
    card.className = "sh-card";
    card.innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
  }

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var nextTheme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    try { localStorage.setItem("mrsheyhaki-theme", nextTheme); } catch (e) {}
    sfx("tap"); paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    order = shuffle(ITEMS); idx = 0; score = 0; misses = 0; locked = false;
    renderItem(false);
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
