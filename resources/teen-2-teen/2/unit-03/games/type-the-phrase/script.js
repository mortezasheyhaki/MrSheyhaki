/* Type the Phrase – Teen2Teen 2 Unit 3: see the picture, type each word */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u3-type-the-phrase";
  var CDN = "https://cdn.imgurl.ir/uploads/";
  var CARDS = [
    { id: "singing", label: "take singing lessons", image: CDN + "f62866_.png", audio: CDN + "l25665_.mp3" },
    { id: "orchestra", label: "play in the school orchestra", image: CDN + "v87181_.png", audio: CDN + "a29751_.mp3" },
    { id: "band", label: "play in the school band", image: CDN + "e401415_.png", audio: CDN + "i6100_.mp3" },
    { id: "soccer", label: "play on the soccer team", image: CDN + "m52443_.png", audio: CDN + "p596381_.mp3" },
    { id: "language", label: "learn a new language", image: CDN + "d67725_.png", audio: CDN + "x52147_.mp3" },
    { id: "charity", label: "collect money for charity", image: CDN + "v17682_.png", audio: CDN + "l276680_.mp3" }
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
  var order = [], pos = 0, score = 0, misses = 0, locked = false, currentAudio = null, advanceTimer = null;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function words(phrase) { return phrase.split(" "); }
  function norm(s) { return (s || "").trim().toLowerCase().replace(/\s+/g, " "); }

  function stopAudio() {
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
  }

  function playPhrase(card, done) {
    stopAudio();
    var a = new Audio(card.audio);
    currentAudio = a;
    var finished = false;
    function end() { if (finished) return; finished = true; if (currentAudio === a) currentAudio = null; if (done) done(); }
    a.onended = end;
    a.onerror = end;
    var p = a.play();
    if (p && p.catch) p.catch(end);
    advanceTimer = setTimeout(end, 4000);
  }

  function header(pct, badge) {
    return '<div class="pc-top"><a class="pc-back" href="../" aria-label="Back to games">←</a>' +
      '<span class="pc-title">Type the Phrase</span><span class="pc-badge">' + badge + "</span></div>" +
      '<div class="pc-progress"><span style="width:' + pct + '%"></span></div>';
  }

  function boxesHTML(card) {
    var ws = words(card.label);
    return ws.map(function (w, i) {
      var box = '<input class="tp-box" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
        'maxlength="' + w.length + '" data-w="' + i + '" style="--len:' + w.length + '" aria-label="Word ' + (i + 1) + ' of ' + ws.length + '">';
      return '<div class="tp-word">' + box + "</div>";
    }).join("");
  }

  function renderRound(animateIn) {
    var card = CARDS[order[pos]];
    var pct = Math.round((pos / CARDS.length) * 100);
    app.innerHTML =
      header(pct, (pos + 1) + " / " + CARDS.length) +
      '<div class="pc-stage"><div class="pc-card' + (animateIn ? " pc-enter" : "") + '" id="pc-card">' +
      '<img class="pc-img" src="' + card.image + '" alt="Picture for the phrase" draggable="false" ' +
      "onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\" />" +
      '<div class="pc-fallback">🖼️</div></div></div>' +
      '<div class="tp-row" id="tp-row">' + boxesHTML(card) + "</div>" +
      '<div class="pc-feedback" id="pc-feedback" aria-live="polite"></div>' +
      '<div style="flex:none;text-align:center"><button class="pc-btn tp-check" id="tp-check" disabled>Check ✓</button></div>';
    locked = false;
    fitBoxes();
    updateCheck();
    var first = app.querySelector(".tp-box");
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, animateIn ? 500 : 50);
  }

  function boxes() { return Array.prototype.slice.call(app.querySelectorAll(".tp-box")); }

  /* Size the boxes so every word fits on ONE row at this screen width. */
  var TP_GAP = 2, TP_WORD_GAP = 6, TP_PAD = 2, TP_MAX = 34;
  function fitBoxes() {
    var row = document.getElementById("tp-row");
    if (!row) return;
    var card = CARDS[order[pos]];
    var ws = words(card.label);
    var avail = row.clientWidth;
    if (!avail) return;
    var letters = 0, boxesN = ws.length, gaps = (ws.length - 1) * TP_WORD_GAP;
    ws.forEach(function (w) { letters += w.length; gaps += (w.length - 1) * TP_GAP; });
    // unit = pixels per letter-slot
    var unit = (avail - gaps - boxesN * TP_PAD * 2) / letters;
    unit = Math.max(8, Math.min(TP_MAX, unit));
    boxes().forEach(function (b, i) {
      var len = ws[i] ? ws[i].length : 3;
      b.style.width = Math.round(len * unit + TP_PAD * 2) + "px";
      b.style.fontSize = Math.max(12, Math.min(26, Math.round(unit * 1.05))) + "px";
      b.style.height = Math.round(Math.max(44, Math.min(58, unit * 2.6))) + "px";
    });
  }
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitBoxes, 60);
  });

  function allFilled() {
    return boxes().every(function (b) { return b.value.trim().length > 0; });
  }

  function updateCheck() {
    var btn = document.getElementById("tp-check");
    if (btn) btn.disabled = locked || !allFilled();
  }

  function setFeedback(text, kind) {
    var fb = document.getElementById("pc-feedback");
    if (!fb) return;
    fb.className = "pc-feedback " + (kind || "");
    fb.textContent = text;
  }

  function burstConfetti() {
    var colours = ["#ff6fb1", "#ffb347", "#ffe066", "#5ee6a8", "#6ec8ff", "#b59cff"];
    for (var i = 0; i < 26; i++) {
      var el = document.createElement("span");
      el.className = "pc-confetti";
      el.style.left = (Math.random() * 100) + "vw";
      el.style.background = colours[i % colours.length];
      el.style.setProperty("--dx", ((Math.random() - 0.5) * 160) + "px");
      el.style.setProperty("--dur", (1.2 + Math.random() * 0.8) + "s");
      el.style.animationDelay = (Math.random() * 0.25) + "s";
      document.body.appendChild(el);
      setTimeout(function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; }(el), 2400);
    }
  }

  function nextRound() {
    stopAudio();
    var old = document.getElementById("pc-card");
    if (old) old.classList.add("pc-leave");
    sfx("whoosh");
    setTimeout(function () {
      pos++;
      if (pos >= CARDS.length) finish();
      else renderRound(true);
    }, 300);
  }

  function check() {
    if (locked || !allFilled()) return;
    var card = CARDS[order[pos]];
    var target = words(card.label);
    var bs = boxes();
    var wrongCount = 0;
    bs.forEach(function (b, i) {
      b.classList.remove("is-wrong");
      if (norm(b.value) === norm(target[i])) {
        b.classList.add("is-right");
        b.readOnly = true;
      } else {
        b.classList.add("is-wrong");
        wrongCount++;
      }
    });

    if (wrongCount === 0) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      sfx("correct");
      burstConfetti();
      setFeedback(["Yesss! 🎉", "Awesome! ⭐", "You got it! 🙌", "Super! 🚀"][score % 4], "ok");
      var pic = document.getElementById("pc-card");
      if (pic) pic.classList.add("is-correct");
      updateCheck();
      playPhrase(card, function () { setTimeout(nextRound, 350); });
    } else {
      misses++;
      sfx("wrong");
      setFeedback(["Oops! Check the red boxes 💪", "Almost! Fix the red boxes 🤔", "Close! Try the red ones again 👀"][misses % 3], "no");
      var firstWrong = bs.filter(function (b) { return b.classList.contains("is-wrong"); })[0];
      if (firstWrong) firstWrong.focus({ preventScroll: true });
    }
  }

  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    stopAudio();
    order = shuffle(CARDS.map(function (c, i) { return i; }));
    pos = 0; score = 0; misses = 0;
    renderRound(false);
  }

  function finish() {
    stopAudio();
    sfx("win");
    var stars = score === CARDS.length ? 3 : score >= CARDS.length / 2 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: CARDS.length,
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
    app.innerHTML =
      header(100, CARDS.length + " / " + CARDS.length) +
      '<div class="pc-done"><div class="pc-trophy" aria-hidden="true">🏆</div><h1>You did it! 🎉</h1>' +
      "<p>You got " + score + " of " + CARDS.length + " on the first try. Amazing work! 🌟</p>" +
      '<button class="pc-btn" id="pc-again">Play again</button>' +
      '<a class="pc-btn secondary" href="../">Back to games</a></div>';
    document.getElementById("pc-again").onclick = start;
  }

  /* ---------- events ---------- */
  app.addEventListener("input", function (ev) {
    var b = ev.target;
    if (!b.classList || !b.classList.contains("tp-box")) return;
    b.classList.remove("is-wrong");
    sfx("type");
    var max = Number(b.getAttribute("maxlength"));
    if (b.value.length >= max) {
      var bs = boxes();
      var idx = bs.indexOf(b);
      if (idx > -1 && idx < bs.length - 1) bs[idx + 1].focus();
    }
    updateCheck();
  });

  app.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    if (!ev.target.classList || !ev.target.classList.contains("tp-box")) return;
    ev.preventDefault();
    if (allFilled()) check();
    else {
      var bs = boxes(), idx = bs.indexOf(ev.target);
      var next = bs.slice(idx + 1).concat(bs.slice(0, idx + 1)).filter(function (x) { return !x.value.trim(); })[0];
      if (next) next.focus();
    }
  });

  app.addEventListener("click", function (ev) {
    if (ev.target.closest("#tp-check")) { sfx("tap"); check(); }
  });

  // unlock audio on the first tap of the page
  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });

  start();
})();
