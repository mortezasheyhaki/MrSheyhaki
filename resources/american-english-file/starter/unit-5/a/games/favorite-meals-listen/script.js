/* Favorite Meals – listen to Anna, Will & Sarah · AEF Starter Unit 5A */
(function () {
  "use strict";

  

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

var GAME_ID = "starter-5a-favorite-meals-listen";

  // 3 parts · correct = key details heard in the audio (where / food / drink)
  var PARTS = [
    {
      name: "Anna",
      audio: "https://cdn.imgurl.ir/uploads/v86540_Anna.mp3",
      options: ["home", "restaurant", "meat", "fish", "vegetables", "coffee", "tea", "lunch", "breakfast"],
      correct: ["home", "restaurant", "meat", "fish", "vegetables", "coffee"]
    },
    {
      name: "Will",
      audio: "https://cdn.imgurl.ir/uploads/b54838_Will.mp3",
      options: ["work", "cafeteria", "French fries", "burger", "fish", "water", "coffee", "espresso", "home"],
      correct: ["work", "cafeteria", "French fries", "water", "coffee", "espresso"]
    },
    {
      name: "Sarah",
      audio: "https://cdn.imgurl.ir/uploads/g101034_Sara.mp3",
      options: ["home", "café", "yoga", "fruit", "egg", "muffin", "coffee", "tea", "hot chocolate"],
      correct: ["home", "café", "fruit", "egg", "muffin", "coffee", "tea", "hot chocolate"]
    }
  ];

  var TOTAL = PARTS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var partIndex = 0;
  var selected = {}; // label -> true
  var locked = false;
  var score = 0;
  var currentAudio = null;
  var sfxCtx = null;
  var order = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }

  function tone(freq, start, dur, type, gain) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function sfxTap() {
    try {
      if (window.LASfx && LASfx.click) LASfx.click();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(640, ctx.currentTime, 0.05, "sine", 0.07);
  }

  function sfxOk() {
    try {
      if (window.LASfx && LASfx.correct) LASfx.correct();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.12);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.12);
    tone(783.99, t + 0.14, 0.14, "sine", 0.1);
  }

  function sfxBad() {
    try {
      if (window.LASfx && LASfx.wrong) LASfx.wrong();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".bl-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio() {
    var part = PARTS[partIndex];
    if (!part) return;
    stopAudio();
    var a = new Audio(part.audio);
    currentAudio = a;
    var btn = app.querySelector(".bl-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    partIndex = 0;
    score = 0;
    phase = "play";
    startPart();
  }

  function startPart() {
    if (partIndex >= TOTAL) {
      finishGame();
      return;
    }
    locked = false;
    selected = {};
    stopAudio();
    order = shuffle(PARTS[partIndex].options.slice());
    render();
    setTimeout(function () {
      if (phase === "play" && !locked) playAudio();
    }, 350);
  }

  function toggleChip(label) {
    if (locked) return;
    sfxTap();
    if (selected[label]) delete selected[label];
    else selected[label] = true;
    updateChips();
    var fb = document.getElementById("bl-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "bl-fb";
    }
  }

  function clearAll() {
    if (locked) return;
    sfxTap();
    selected = {};
    updateChips();
    var fb = document.getElementById("bl-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "bl-fb";
    }
  }

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var map = {};
    a.forEach(function (x) {
      map[x] = true;
    });
    return b.every(function (x) {
      return map[x];
    });
  }

  function checkAnswer() {
    if (locked) return;
    var part = PARTS[partIndex];
    var picked = Object.keys(selected);
    if (!picked.length) {
      var fb0 = document.getElementById("bl-fb");
      if (fb0) {
        fb0.textContent = "Select at least one item.";
        fb0.className = "bl-fb bad";
      }
      return;
    }

    var ok = sameSet(picked, part.correct);
    locked = true;

    // Visual feedback on chips
    app.querySelectorAll(".bl-chip").forEach(function (el) {
      var label = el.getAttribute("data-label");
      var isCorrect = part.correct.indexOf(label) >= 0;
      var isPicked = !!selected[label];
      el.classList.remove("is-selected", "is-ok", "is-bad");
      if (isPicked && isCorrect) el.classList.add("is-ok");
      else if (isPicked && !isCorrect) el.classList.add("is-bad");
      else if (!isPicked && isCorrect) el.classList.add("is-missed");
    });

    if (!ok) { try{sfxWrong();}catch(e){}
      sfxBad();
      var fb = document.getElementById("bl-fb");
      if (fb) {
        fb.textContent = "Not quite — listen again.";
        fb.className = "bl-fb bad";
      }
      setTimeout(function () {
        locked = false;
        selected = {};
        updateChips();
        var fb2 = document.getElementById("bl-fb");
        if (fb2) {
          fb2.textContent = "";
          fb2.className = "bl-fb";
        }
      }, 900);
      return;
    }

    sfxOk();
    score += 1;
    var fbOk = document.getElementById("bl-fb");
    if (fbOk) {
      fbOk.textContent = "✓ Correct!";
      fbOk.className = "bl-fb ok";
    }
    setTimeout(function () {
      partIndex += 1;
      startPart();
    }, 900);
  }

  function finishGame() {
    stopAudio();
    phase = "done";
    var stars = score >= TOTAL ? 3 : score >= 2 ? 2 : score >= 1 ? 1 : 0;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {
        console.warn(e);
      }
    }
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        if (stars > 0) LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    render();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateChips() {
    app.querySelectorAll(".bl-chip").forEach(function (el) {
      var label = el.getAttribute("data-label");
      el.classList.remove("is-selected", "is-ok", "is-bad", "is-missed");
      if (selected[label]) el.classList.add("is-selected");
    });
  }

  function render() {
    if (phase === "start") {
      stopAudio();
      app.innerHTML =
        '<header class="bl-topbar">' +
        '<a class="bl-back" href="../" aria-label="Back">←</a>' +
        '<span class="bl-title">Favorite Meals</span>' +
        '<span class="bl-badge">5A</span></header>' +
        '<section class="bl-start">' +
        '<div class="bl-hero" aria-hidden="true">🍽️</div>' +
        "<h1>Favorite meal of the day</h1>" +
        '<p class="bl-sub">Listen to Anna, Will and Sarah. Select the places, food and drinks you hear.</p>' +
        '<button type="button" class="bl-btn" id="bl-start">Start</button>' +
        "</section>";
      document.getElementById("bl-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = score >= TOTAL ? 3 : score >= 2 ? 2 : score >= 1 ? 1 : 0;
      app.innerHTML =
        '<header class="bl-topbar">' +
        '<a class="bl-back" href="../" aria-label="Back">←</a>' +
        '<span class="bl-title">Favorite Meals</span>' +
        '<span class="bl-badge">Done</span></header>' +
        '<section class="bl-start">' +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!") +
        "</h1>" +
        '<p class="bl-sub">You got <strong>' +
        score +
        "</strong> of " +
        TOTAL +
        " correct.</p>" +
        '<button type="button" class="bl-btn" id="bl-again">Play again</button>' +
        "</section>";
      document.getElementById("bl-again").onclick = startGame;
      return;
    }

    var part = PARTS[partIndex];
    var pct = Math.round((partIndex / TOTAL) * 100);
    app.innerHTML =
      '<header class="bl-topbar">' +
      '<a class="bl-back" href="../" aria-label="Back">←</a>' +
      '<span class="bl-title">' +
      escapeHtml(part.name) +
      "</span>" +
      '<span class="bl-badge">' +
      (partIndex + 1) +
      " / " +
      TOTAL +
      "</span></header>" +
      '<div class="bl-progress"><div class="bl-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="bl-listen">' +
      '<button type="button" class="bl-play" id="bl-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      "<div><strong>Listen</strong><span>Select what you hear</span></div>" +
      "</div>" +
      '<p class="bl-hint">Tap all the places, food and drinks you hear — then Check</p>' +
      '<div class="bl-pool bl-pool-select" id="bl-pool">' +
      order
        .map(function (label) {
          return (
            '<button type="button" class="bl-chip' +
            (selected[label] ? " is-selected" : "") +
            '" data-label="' +
            escapeHtml(label) +
            '">' +
            escapeHtml(label) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="bl-actions">' +
      '<button type="button" class="bl-btn secondary" id="bl-clear">Clear</button>' +
      '<button type="button" class="bl-btn" id="bl-check">Check ✓</button>' +
      "</div>" +
      '<div class="bl-fb" id="bl-fb" aria-live="polite"></div>';

    document.getElementById("bl-play").onclick = playAudio;
    document.getElementById("bl-clear").onclick = clearAll;
    document.getElementById("bl-check").onclick = checkAnswer;
    app.querySelectorAll(".bl-chip").forEach(function (btn) {
      btn.onclick = function () {
        toggleChip(btn.getAttribute("data-label"));
      };
    });
  }

  render();
})();
