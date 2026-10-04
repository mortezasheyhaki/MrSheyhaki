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
    snd: (function () {
      var lastT = 0;
      return {
        tap: function () { var n = Date.now(); if (n - lastT < 60) return; lastT = n; tone(880, 0.05, "sine", 0.06, 0); tone(1320, 0.04, "sine", 0.03, 0.02); },
        correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "triangle", 0.09, i * 0.07); }); tone(2093, 0.3, "sine", 0.03, 0.3); },
        wrong: function () { tone(311, 0.14, "sine", 0.09, 0); tone(233, 0.22, "triangle", 0.08, 0.1); },
        celebrate: function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.09, i * 0.08); }); tone(392, 0.7, "sine", 0.06, 0.1); }
      };
    })(),
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
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class$="-track"],[class*="-bar-fill"],[class*="-track-fill"],[class*="-progress-fill"]')) return;
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
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("button, [role=button], .mc-left-item, .mc-right-item") : null;
      if (t && !t.disabled) api.snd.tap();
    }, true);
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Personal Info – listen & write – AEF Starter Unit 2B */
(function () {

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
  function sfxTap() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () { tone(520, 0.06, "triangle", 0.08); })(); }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  })(); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  })(); }
  function sfxCelebrate() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  })(); }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-2b-personal-info";

  const ITEMS = [
    {
      id: 1,
      title: "1 · Phone number",
      hint: "Write the cell phone number.",
      audio: "https://cdn.imgurl.ir/uploads/r812406_01.mp3",
      answers: ["3035550415", "30355504152"],
      display: "303-555-0415",
      render: "phone"
    },
    {
      id: 2,
      title: "2 · Address",
      hint: "Write the house number for Oak Street.",
      audio: "https://cdn.imgurl.ir/uploads/f00361_02.mp3",
      answers: ["57"],
      display: "57 Oak Street",
      render: "address"
    },
    {
      id: 3,
      title: "3 · Age",
      hint: "How old is he?",
      audio: "https://cdn.imgurl.ir/uploads/s780138_03.mp3",
      answers: ["39"],
      display: "39",
      render: "age"
    },
    {
      id: 4,
      title: "4 · Email",
      hint: "Write the numbers in the email address.",
      audio: "https://cdn.imgurl.ir/uploads/q043695_04.mp3",
      answers: ["85"],
      display: "james85@gmail.com",
      render: "email"
    }
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let index = 0;
  let score = 0;
  let currentAudio = null;
  let audioCache = {};

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function stopClip() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
    }
    const btn = app.querySelector(".pi-play.playing");
    if (btn) btn.classList.remove("playing");
  }

  function playClip() {
    const item = ITEMS[index];
    if (!item) return;
    stopClip();
    let a = audioCache[item.audio];
    if (!a) {
      a = new Audio(item.audio);
      a.preload = "auto";
      audioCache[item.audio] = a;
    }
    currentAudio = a;
    const btn = app.querySelector(".pi-play");
    const run = function () {
      try { a.currentTime = 0; } catch (_) {}
      const p = a.play();
      if (btn) btn.classList.add("playing");
      if (p && p.catch) p.catch(function () {
        if (btn) btn.classList.remove("playing");
      });
      a.onended = function () {
        if (btn) btn.classList.remove("playing");
      };
    };
    if (a.readyState >= 2) run();
    else {
      a.addEventListener("canplay", function once() {
        a.removeEventListener("canplay", once);
        run();
      });
      try { a.load(); } catch (_) {}
    }
  }

  function calcStars() {
    const r = score / ITEMS.length;
    if (r >= 1) return 3;
    if (r >= 0.75) return 2;
    if (r >= 0.5) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function playBtnHtml() {
    return (
      '<button type="button" class="pi-play" aria-label="Play">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>"
    );
  }

  function formHtml(item) {
    if (item.render === "phone") {
      return (
        '<div class="pi-form-line">' +
        '<span class="pi-icon">📞</span>' +
        '<input type="text" class="pi-input wide" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="e.g. 303-555-…" />' +
        "</div>"
      );
    }
    if (item.render === "address") {
      return (
        '<div class="pi-form-line">' +
        '<input type="text" class="pi-input" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="??" style="width:90px" />' +
        '<span class="pi-fixed">Oak Street</span>' +
        "</div>"
      );
    }
    if (item.render === "age") {
      return (
        '<div class="pi-form-line">' +
        '<span class="pi-fixed">Age:</span>' +
        '<input type="text" class="pi-input" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="??" style="width:90px" />' +
        "</div>"
      );
    }
    if (item.render === "email") {
      return (
        '<div class="pi-form-line">' +
        '<span class="pi-fixed">james</span>' +
        '<input type="text" class="pi-input" id="pi-answer" inputmode="numeric" autocomplete="off" placeholder="??" style="width:80px" />' +
        '<span class="pi-fixed">@gmail.com</span>' +
        "</div>"
      );
    }
    return "";
  }

  function check() {
    const item = ITEMS[index];
    const inp = document.getElementById("pi-answer");
    if (!inp) return;
    const val = digitsOnly(inp.value);
    const feedback = document.getElementById("pi-feedback");
    if (!val) {
      feedback.textContent = "Write the number.";
      feedback.className = "pi-feedback is-bad";
      return;
    }
    const ok = item.answers.indexOf(val) !== -1;
    if (ok) { try{sfxCorrect();}catch(e){}
      score += 1;
      inp.classList.remove("is-bad");
      inp.classList.add("is-ok");
      inp.disabled = true;
      feedback.textContent = "Correct! " + item.display;
      feedback.className = "pi-feedback is-ok";
      setTimeout(function () {
        index += 1;
        if (index >= ITEMS.length) {
          phase = "done";
        }
        render();
        if (phase === "play") setTimeout(playClip, 200);
      }, 900);
    } else {
      inp.classList.remove("is-ok");
      inp.classList.add("is-bad");
      feedback.textContent = "Not quite — listen again.";
      feedback.className = "pi-feedback is-bad";
      playClip();
    }
  }

  function render() {
    stopClip();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="pi-topbar">' +
        '<a class="pi-back" href="../" aria-label="Back">←</a>' +
        '<span class="pi-title">Personal Info</span>' +
        '<span class="pi-badge">2B</span>' +
        "</header>" +
        '<section class="pi-menu">' +
        "<h1>Personal information</h1>" +
        '<p class="pi-lead">Listen and write the phone number, address, age, and email.</p>' +
        '<div class="pi-start-card">' +
        "<p>4 questions · listen &amp; write</p>" +
        '<button type="button" class="pi-btn" id="pi-start">Start</button>' +
        "</div>" +
        "</section>";
      document.getElementById("pi-start").onclick = function () {
        index = 0;
        score = 0;
        phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
        render();
        setTimeout(playClip, 250);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: QUESTIONS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    // play
    const item = ITEMS[index];
    const pct = Math.round((index / ITEMS.length) * 100);

    app.innerHTML =
      '<header class="pi-topbar">' +
      '<a class="pi-back" href="../" aria-label="Back">←</a>' +
      '<span class="pi-title">Personal Info</span>' +
      '<span class="pi-badge">2B</span>' +
      "</header>" +
      '<div class="pi-hud">' +
      '<span class="pi-pill">' + (index + 1) + " / " + ITEMS.length + "</span>" +
      '<span class="pi-pill">' + score + " correct</span>" +
      "</div>" +
      '<div class="pi-progress"><span style="width:' + pct + '%"></span></div>' +
      '<div class="pi-stage">' +
      '<p class="pi-qnum">' + item.title + "</p>" +
      playBtnHtml() +
      '<p class="pi-hint">' + item.hint + "</p>" +
      formHtml(item) +
      '<p class="pi-feedback" id="pi-feedback"></p>' +
      '<div class="pi-actions">' +
      '<button type="button" class="pi-btn secondary" id="pi-replay">Play again</button>' +
      '<button type="button" class="pi-btn" id="pi-check">Check</button>' +
      "</div>" +
      "</div>";

    app.querySelector(".pi-play").onclick = playClip;
    document.getElementById("pi-replay").onclick = playClip;
    document.getElementById("pi-check").onclick = check;

    const inp = document.getElementById("pi-answer");
    if (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") check();
      });
      setTimeout(function () { inp.focus(); }, 100);
    }
  }

  render();
})();
