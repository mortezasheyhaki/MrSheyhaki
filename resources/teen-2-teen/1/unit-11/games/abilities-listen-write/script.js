/* ===== Arcade FX: progress bar, combo, milestone celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [["🌟","Awesome!","10 correct answers!"],["🚀","Superstar!","20 correct — unstoppable!"],["👑","Legend!","30 correct — the best of the best!"]];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) { return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : ""; }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) { el = document.createElement("div"); el.id = "afx-combo"; el.className = "afx-combo"; document.body.appendChild(el); }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = (document.getElementById("game-app") || document.getElementById("app"));
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) { burst(CHEERS[Math.min(Math.floor(n / 10) - 1, 2)]); }
  function burst(c) {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.1, i * 0.09); });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div"); ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 44; i++) h += '<i style="left:' + Math.random() * 100 + "%;background:" + cols[i % 6] + ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" + (1.3 + Math.random() * 0.9).toFixed(2) + 's"></i>';
    ov.innerHTML = h + '<div class="afx-card"><div class="afx-emoji">' + c[0] + '</div><div class="afx-title">' + c[1] + '</div><div class="afx-sub">' + c[2] + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) { var st = L.startTimer; L.__afx = 1; L.startTimer = function () { api.reset(); return st.apply(this, arguments); }; }
  }
  var api = window.ArcadeFX = {
    track: null,
    bar: function (pct) {
      var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
      var bar = app.querySelector(".afx-bar");
      if (!bar) {
        var anchor = app.querySelector('[id*="rogress"]') || app.querySelector("header"); if (!anchor) return;
        var host = anchor.closest("header") || anchor.parentElement;
        bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
        host.parentNode.insertBefore(bar, host.nextSibling);
      }
      var fill = bar.firstChild; lastPct = pct;
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
    },
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0 && !api.noMilestone) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || ("Part " + (i + 1) + " of " + n + " complete")]);
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"],[id*="rogress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^(?:[A-Za-z]{1,9}\s*)?\d+\s*(?:\/|of)\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class*="-bar-fill"],[class*="-progress-fill"]')) return;
    if (!badge && api.track) { try { api.bar(api.track()); } catch (e) {} return; }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(?:[A-Za-z]{1,9}\s*)?(\d+)\s*(?:\/|of)\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
    if (!bar) {
      var host = badge.closest("header") || badge.parentElement;
      bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
      host.parentNode.insertBefore(bar, host.nextSibling);
    }
    var fill = bar.firstChild; lastPct = pct;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
  }
  var q = 0;
  function start() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Listen & Write · Abilities — Teen2Teen 1 Unit 11
   Part 1: Look & Write (picture, no audio)
   Part 2: Listen & Write (audio, no picture) */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u11-abilities-listen-write";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "sing", word: "sing", label: "sing",
      answers: ["sing"],
      image: CDN + "s959561_1._sing.png", audio: CDN + "m219280_sing.mp3" },
    { id: "dance", word: "dance", label: "dance",
      answers: ["dance"],
      image: CDN + "n921429_2._dance.png", audio: CDN + "a819457_dance.mp3" },
    { id: "play-guitar", word: "play the guitar", label: "play the guitar",
      answers: ["play the guitar", "play guitar"],
      image: CDN + "l759824_3._ay_the_guitar.png", audio: CDN + "o960192_ay_the_guitar_2.mp3" },
    { id: "play-piano", word: "play the piano", label: "play the piano",
      answers: ["play the piano", "play piano"],
      image: CDN + "v289933_4_ay_the_piano.png", audio: CDN + "h035164_ay_the_piano.mp3" },
    { id: "play-drums", word: "play the drums", label: "play the drums",
      answers: ["play the drums", "play drums"],
      image: CDN + "o494865_5_ay_the_drums.png", audio: CDN + "f2568_ay_the_drums.mp3" },
    { id: "draw", word: "draw", label: "draw",
      answers: ["draw"],
      image: CDN + "p8522_6_draw.png", audio: CDN + "d962270_draw.mp3" },
    { id: "swim", word: "swim", label: "swim",
      answers: ["swim"],
      image: CDN + "s136203_7_swim.png", audio: CDN + "y834171_swim.mp3" },
    { id: "cook", word: "cook", label: "cook",
      answers: ["cook"],
      image: CDN + "w173769_8_cook.png", audio: CDN + "c62431_cook.mp3" },
    { id: "play-soccer", word: "play soccer", label: "play soccer",
      answers: ["play soccer", "play football"],
      image: CDN + "x99401_9_ay_soccer.png", audio: CDN + "c58387_ay_soccer.mp3" },
    { id: "play-volleyball", word: "play volleyball", label: "play volleyball",
      answers: ["play volleyball"],
      image: CDN + "k465640_10_ay_volleybal.png", audio: CDN + "g03206_ay_volleyball.mp3" },
    { id: "ride-bike", word: "ride a bike", label: "ride a bike",
      answers: ["ride a bike", "ride bike"],
      image: CDN + "u396407_11_ride_a_bike.png", audio: CDN + "k342951_ride_a_bike.mp3" },
    { id: "ride-horse", word: "ride a horse", label: "ride a horse",
      answers: ["ride a horse", "ride horse"],
      image: CDN + "c680984_12_ride_a_horse.png", audio: CDN + "x46930_ride_a_horse.mp3" }
  ];

  var MODES = [
    {
      id: "look",
      title: "Look & Write",
      tip: "Look at the picture. Type the ability.",
      betweenTitle: "Great job!",
      betweenText: "Now listen and write the words — no picture this time."
    },
    {
      id: "listen",
      title: "Listen & Write",
      tip: "Listen, then type the ability.",
      betweenTitle: "",
      betweenText: ""
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | between | done
  var modeIndex = 0;
  var order = [];
  var index = 0;
  var score = 0;
  var combo = 0;
  var bestCombo = 0;
  var locked = false;
  var encourageTimer = null;

  var ENCOURAGE = [
    "Great job! 🌟",
    "Awesome! 🔥",
    "You're on fire! 🚀",
    "Fantastic! ✨",
    "Keep it up! 💪",
    "Superb! 🎯",
    "Brilliant! 🏆",
    "Nice streak! 🌈"
  ];
  var currentAudio = null;
  var sfxCtx = null;

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
    if (sfxCtx.state === "suspended") {
      try {
        sfxCtx.resume();
      } catch (_) {}
    }
    return sfxCtx;
  }

  function tone(freq, dur, type, gain, delay) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.12), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    if (window.ArcadeFX) { if (name === "good" || name === "correct") ArcadeFX.ok(); else if (name === "bad" || name === "wrong") ArcadeFX.bad(); }
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) LASfx.correct();
        else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
        else if (name === "click" && LASfx.click) LASfx.click();
        else if (name === "win" && LASfx.win) LASfx.win();
      }
    } catch (_) {}
    try {
      if (name === "click") {
        tone(480, 0.04, "triangle", 0.08);
      } else if (name === "correct") {
        tone(523.25, 0.08, "triangle", 0.12);
        tone(659.25, 0.1, "triangle", 0.11, 0.06);
        tone(783.99, 0.12, "sine", 0.1, 0.12);
      } else if (name === "wrong") {
        tone(220, 0.1, "square", 0.07);
        tone(165, 0.14, "square", 0.05, 0.05);
      } else if (name === "win") {
        tone(523.25, 0.12, "triangle", 0.12);
        tone(659.25, 0.12, "triangle", 0.11, 0.08);
        tone(783.99, 0.14, "triangle", 0.12, 0.16);
        tone(1046.5, 0.22, "sine", 0.1, 0.26);
      }
    } catch (_) {}
  }

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, item) {
    var u = norm(user);
    if (!u) return false;
    return item.answers.some(function (a) {
      return norm(a) === u;
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    var btn = document.getElementById("lw-play");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    var item = order[index];
    if (!item || !item.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      var btn = document.getElementById("lw-play");
      if (btn) btn.classList.add("is-playing");
      currentAudio.onended = function () {
        if (btn) btn.classList.remove("is-playing");
        currentAudio = null;
      };
      currentAudio.onerror = function () {
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.play().catch(function () {
        if (btn) btn.classList.remove("is-playing");
      });
    } catch (_) {}
  }

  function currentMode() {
    return MODES[modeIndex];
  }

  function totalRounds() {
    return ITEMS.length * MODES.length;
  }

  function progressDone() {
    return modeIndex * ITEMS.length + index;
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = 0;
    score = 0;
    combo = 0;
    bestCombo = 0;
    beginMode();
  }

  function beginMode() {
    order = shuffle(ITEMS.slice());
    index = 0;
    locked = false;
    phase = "play";
    stopAudio();
    render();
    if (currentMode().id === "listen") {
      setTimeout(playAudio, 400);
    }
  }

  function afterCorrect() {
    setTimeout(function () {
      index += 1;
      if (index >= order.length) {
        if (modeIndex < MODES.length - 1) {
          if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — halfway there!");
          phase = "between";
          stopAudio();
          render();
        } else {
          finishGame();
        }
      } else {
        locked = false;
        render();
        if (currentMode().id === "listen") {
          setTimeout(playAudio, 300);
        }
        focusInput();
      }
    }, 700);
  }

  function afterWrong() {
    setTimeout(function () {
      index += 1;
      if (index >= order.length) {
        if (modeIndex < MODES.length - 1) {
          if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — halfway there!");
          phase = "between";
          stopAudio();
          render();
        } else {
          finishGame();
        }
      } else {
        locked = false;
        render();
        if (currentMode().id === "listen") {
          setTimeout(playAudio, 300);
        }
        focusInput();
      }
    }, 1400);
  }

  function checkAnswer() {
    if (locked || phase !== "play") return;
    var input = document.getElementById("lw-input");
    if (!input) return;
    var item = order[index];
    var user = input.value;
    if (!norm(user)) {
      input.focus();
      return;
    }
    locked = true;
    input.disabled = true;
    var checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;
    var fb = document.getElementById("lw-fb");

    if (isCorrect(user, item)) {
      score += 1;
      combo += 1;
      if (combo > bestCombo) bestCombo = combo;
      sfx("correct");
      input.classList.add("ok");
      if (fb) {
        fb.textContent =
          combo >= 3
            ? "✓ " + item.label + "  ·  🔥 " + combo
            : "✓ " + item.label;
        fb.className = "lw-fb ok";
      }
      updateHudLive();
      if (combo > 0 && combo % 4 === 0) {
        showEncourage();
      }
      afterCorrect();
    } else {
      combo = 0;
      sfx("wrong");
      input.classList.add("bad");
      if (fb) {
        fb.textContent = "Answer: " + item.label;
        fb.className = "lw-fb bad";
      }
      updateHudLive();
      afterWrong();
    }
  }

  function goNextMode() {
    sfx("click");
    modeIndex += 1;
    beginMode();
  }

  function finishGame() {
    stopAudio();
    phase = "done";
    sfx("win");
    var total = totalRounds();
    var stars =
      score === total ? 3 : score >= total - 3 ? 2 : score >= Math.ceil(total / 2) ? 1 : 0;

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
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

  function focusInput() {
    setTimeout(function () {
      var input = document.getElementById("lw-input");
      if (input && !input.disabled) input.focus();
    }, 80);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function playBtnHtml() {
    return (
      '<button type="button" class="lw-play" id="lw-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>"
    );
  }


  function updateHudLive() {
    var fill = document.getElementById("lw-progress-fill");
    if (fill) {
      var done = progressDone() + (locked ? 1 : 0);
      var total = totalRounds();
      fill.style.width = Math.min(100, (done / total) * 100) + "%";
    }
    var comboEl = document.getElementById("lw-combo");
    if (comboEl) {
      if (combo > 0) {
        comboEl.hidden = false;
        comboEl.textContent = "🔥 " + combo;
        comboEl.classList.toggle("is-hot", combo >= 3);
      } else {
        comboEl.hidden = true;
        comboEl.classList.remove("is-hot");
      }
    }
    var badge = document.getElementById("lw-badge");
    if (badge) {
      badge.textContent = index + 1 + "/" + order.length;
    }
  }

  function showEncourage() {
    var msg = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
    var host = document.getElementById("lw-encourage");
    if (!host) {
      host = document.createElement("div");
      host.id = "lw-encourage";
      host.className = "lw-encourage";
      host.setAttribute("aria-live", "polite");
      app.appendChild(host);
    }
    host.textContent = msg;
    host.classList.remove("show");
    // reflow
    void host.offsetWidth;
    host.classList.add("show");
    if (encourageTimer) clearTimeout(encourageTimer);
    encourageTimer = setTimeout(function () {
      host.classList.remove("show");
    }, 1600);
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<div class="lw-topbar-center">' +
        '<span class="lw-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
        '<span class="lw-title">Listen &amp; Write</span>' +
        "</div>" +
        '<span class="lw-badge">' +
        ITEMS.length * 2 +
        "</span>" +
        "</header>" +
        '<section class="lw-start">' +
        '<div class="lw-hero">✍️</div>' +
        "<h1>Listen &amp; Write</h1>" +
        '<p class="lw-desc">Two parts — first look at the picture, then listen and type the abilitys.</p>' +
        '<ol class="lw-steps">' +
        '<li><span class="lw-step-num">1</span><span><strong>Look &amp; Write</strong> — see the picture, type the word (no audio).</span></li>' +
        '<li><span class="lw-step-num">2</span><span><strong>Listen &amp; Write</strong> — hear the word, type it (no picture).</span></li>' +
        "</ol>" +
        '<button type="button" class="lw-btn lw-btn-full" id="lw-start">Start Part 1</button>' +
        "</section>";
      document.getElementById("lw-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "between") {
      var m = currentMode();
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<div class="lw-topbar-center">' +
        '<span class="lw-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
        '<span class="lw-title">Listen &amp; Write</span>' +
        "</div>" +
        '<span class="lw-badge">Part 1 ✓</span>' +
        "</header>" +
        '<section class="lw-between">' +
        "<h2>" +
        escapeHtml(m.betweenTitle || "Nice work!") +
        "</h2>" +
        "<p>" +
        escapeHtml(m.betweenText) +
        "</p>" +
        '<button type="button" class="lw-btn lw-btn-full" id="lw-next-mode">Start Part 2</button>' +
        "</section>";
      document.getElementById("lw-next-mode").onclick = goNextMode;
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        '<header class="lw-topbar">' +
        '<a class="lw-back" href="../" aria-label="Back">←</a>' +
        '<div class="lw-topbar-center">' +
        '<span class="lw-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
        '<span class="lw-title">Listen &amp; Write</span>' +
        "</div></header>" +
        '<section class="lw-start">' +
        "<h1>Done!</h1>" +
        "<p class=\"lw-desc\">" +
        score +
        " / " +
        totalRounds() +
        " correct</p>" +
        '<button type="button" class="lw-btn" id="lw-again">Play again</button>' +
        "</section>";
      document.getElementById("lw-again").onclick = startGame;
      return;
    }

    // play
    var mode = currentMode();
    var item = order[index];
    var done = progressDone();
    var total = totalRounds();
    var pct = (done / total) * 100;
    var isLook = mode.id === "look";

    var promptHtml = isLook
      ? '<div class="lw-card lw-photo-wrap">' +
        '<img class="lw-photo" src="' +
        item.image +
        '" alt="" draggable="false" />' +
        "</div>"
      : '<div class="lw-card lw-listen-only">' +
        playBtnHtml() +
        '<span class="lw-listen-label">Tap to listen</span>' +
        "</div>";

    app.innerHTML =
      '<header class="lw-topbar">' +
      '<a class="lw-back" href="../" aria-label="Back">←</a>' +
      '<div class="lw-topbar-center">' +
      '<span class="lw-kicker">PART ' +
      (modeIndex + 1) +
      " / " +
      MODES.length +
      "</span>" +
      '<span class="lw-title">' +
      escapeHtml(mode.title) +
      "</span>" +
      "</div>" +
      '<span class="lw-badge" id="lw-badge">' +
      (index + 1) +
      "/" +
      order.length +
      "</span>" +
      "</header>" +
      '<div class="lw-hud-row">' +
      '<p class="lw-instruction">' +
      escapeHtml(mode.tip) +
      "</p>" +
      '<span class="lw-combo' +
      (combo >= 3 ? " is-hot" : "") +
      '" id="lw-combo"' +
      (combo > 0 ? "" : " hidden") +
      ">" +
      (combo > 0 ? "🔥 " + combo : "") +
      "</span>" +
      "</div>" +
      '<div class="lw-progress" aria-hidden="true"><div class="lw-progress-fill" id="lw-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      promptHtml +
      '<div class="lw-card lw-input-row">' +
      '<input class="lw-input" id="lw-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="Type the word…" enterkeyhint="done" />' +
      '<p class="lw-fb" id="lw-fb"></p>' +
      '<button type="button" class="lw-btn lw-check" id="lw-check">Check</button>' +
      "</div>";

    var input = document.getElementById("lw-input");
    var checkBtn = document.getElementById("lw-check");
    checkBtn.onclick = function () {
      sfx("click");
      checkAnswer();
    };
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    var play = document.getElementById("lw-play");
    if (play) {
      play.onclick = function () {
        sfx("click");
        playAudio();
      };
    }
    focusInput();
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
