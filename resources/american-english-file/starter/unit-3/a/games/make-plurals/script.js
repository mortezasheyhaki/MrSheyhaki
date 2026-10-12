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
    var _k = c[1] + "|" + c[2], _n = Date.now(); if (api._bk === _k && _n - (api._bt || 0) < 2500) return; api._bk = _k; api._bt = _n; var _old = document.querySelectorAll(".afx-burst"); for (var _i = 0; _i < _old.length; _i++) if (_old[_i].parentNode) _old[_i].parentNode.removeChild(_old[_i]); 
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

/* Make Plurals – add -s / -es / y→i+es · AEF Starter Unit 3A
   Modes: Basic | Timed (player chooses duration) */
(function () {
  const GAME_ID = "starter-3a-make-plurals";
  const RECORD_KEY = "mp-timed-record-3a";
  const TIMER_OPTIONS = [30, 60, 90, 120];

  /* ---------- sound effects (Web Audio) ---------- */
  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function sfxTone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function sfxNoise(start, dur, gain) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var bufSize = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
    var src = ctx.createBufferSource();
    var g = ctx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(gain || 0.08, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(g);
    g.connect(ctx.destination);
    src.start(start);
    src.stop(start + dur + 0.02);
  }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.09, "triangle", 0.11);
    sfxTone(659.25, t + 0.07, 0.1, "triangle", 0.1);
    sfxTone(783.99, t + 0.14, 0.14, "sine", 0.09);
    sfxTone(1046.5, t + 0.24, 0.18, "sine", 0.06);
  }).apply(this, arguments); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(200, t, 0.16, "sawtooth", 0.06, 110);
    sfxTone(160, t + 0.06, 0.18, "triangle", 0.05, 90);
    sfxNoise(t, 0.12, 0.04);
  }).apply(this, arguments); }
  function sfxClick() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(880, ctx.currentTime, 0.04, "sine", 0.05);
    sfxTone(1320, ctx.currentTime + 0.02, 0.03, "triangle", 0.03);
  }).apply(this, arguments); }
  function sfxTick() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(960, ctx.currentTime, 0.035, "square", 0.035);
  }
  function sfxComplete() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.1);
    sfxTone(659.25, t + 0.1, 0.1, "triangle", 0.1);
    sfxTone(783.99, t + 0.2, 0.12, "triangle", 0.11);
    sfxTone(1046.5, t + 0.32, 0.22, "sine", 0.09);
    sfxTone(1318.5, t + 0.48, 0.28, "sine", 0.07);
  }).apply(this, arguments); }
  function sfxNewRecord() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.12, "triangle", 0.1);
    sfxTone(659.25, t + 0.1, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.2, 0.12, "triangle", 0.11);
    sfxTone(1046.5, t + 0.32, 0.15, "sine", 0.1);
    sfxTone(1318.5, t + 0.48, 0.2, "sine", 0.09);
    sfxTone(1568, t + 0.68, 0.35, "sine", 0.08);
  }
  function sfxStart() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(392, t, 0.08, "triangle", 0.08);
    sfxTone(523.25, t + 0.08, 0.1, "triangle", 0.09);
    sfxTone(659.25, t + 0.18, 0.14, "sine", 0.08);
  }

  // 8 × -s | 8 × -es | 4 × -ies  (A1 / AEF Starter Unit 3)
  const ITEMS = [
    { id: "pen",        base: "pen",        type: "s",   ending: "s" },
    { id: "bag",        base: "bag",        type: "s",   ending: "s" },
    { id: "book",       base: "book",       type: "s",   ending: "s" },
    { id: "phone",      base: "phone",      type: "s",   ending: "s" },
    { id: "key",        base: "key",        type: "s",   ending: "s" },
    { id: "chair",      base: "chair",      type: "s",   ending: "s" },
    { id: "desk",       base: "desk",       type: "s",   ending: "s" },
    { id: "photo",      base: "photo",      type: "s",   ending: "s" },
    { id: "watch",      base: "watch",      type: "es",  ending: "es" },
    { id: "box",        base: "box",        type: "es",  ending: "es" },
    { id: "class",      base: "class",      type: "es",  ending: "es" },
    { id: "brush",      base: "brush",      type: "es",  ending: "es" },
    { id: "bus",        base: "bus",        type: "es",  ending: "es" },
    { id: "dish",       base: "dish",       type: "es",  ending: "es" },
    { id: "glass",      base: "glass",      type: "es",  ending: "es" },
    { id: "match",      base: "match",      type: "es",  ending: "es" },
    { id: "city",       base: "city",       type: "ies", ending: "es" },
    { id: "country",    base: "country",    type: "ies", ending: "es" },
    { id: "baby",       base: "baby",       type: "ies", ending: "es" },
    { id: "dictionary", base: "dictionary", type: "ies", ending: "es" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";       // menu | timer-select | play | done
  let mode = "basic";       // basic | timed
  let timedSeconds = 90;
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;

  // Timed state
  let timeLeft = 90;
  let timerId = null;
  let isNewRecord = false;

  // Per-item state
  let stem = "";
  let yChanged = false;
  let attached = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return order[idx];
  }

  function recordKeyFor(sec) {
    return RECORD_KEY + "-" + sec;
  }

  function getRecord(sec) {
    try {
      const v = localStorage.getItem(recordKeyFor(sec || timedSeconds));
      return v ? parseInt(v, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveRecord(val, sec) {
    try {
      localStorage.setItem(recordKeyFor(sec || timedSeconds), String(val));
    } catch (e) {}
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    timeLeft = timedSeconds;
    updateTimerDisplay();
    timerId = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 10 && timeLeft > 0) sfxTick();
      updateTimerDisplay();
      if (timeLeft <= 0) {
        stopTimer();
        endTimed();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const el = document.getElementById("mp-timer");
    if (!el) return;
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    el.textContent = m > 0 ? m + ":" + String(s).padStart(2, "0") : s + "s";
    el.classList.toggle("is-low", timeLeft <= 10);
  }

  function endTimed() {
    locked = true;
    isNewRecord = false;
    const best = getRecord(timedSeconds);
    if (score > best) {
      saveRecord(score, timedSeconds);
      isNewRecord = true;
      sfxNewRecord();
    } else {
      sfxComplete();
    }
    phase = "done";
    render();
  }

  function start(selectedMode, seconds) {
    mode = selectedMode || "basic";
    if (mode === "timed" && seconds) timedSeconds = seconds;
    stopTimer();
    order = shuffle(ITEMS.slice());
    idx = 0;
    score = 0;
    isNewRecord = false;
    locked = false;
    sfxStart();

    if (window.LAFinish) LAFinish.startTimer();

    if (mode === "timed") {
      startTimer();
    }
    loadItem();
  }

  function loadItem() {
    locked = false;
    const it = current();
    stem = it.base;
    yChanged = false;
    attached = null;
    phase = "play";
    render();
  }

  function nextItem() {
    if (mode === "timed") {
      if (idx < order.length - 1) {
        idx += 1;
      } else {
        order = shuffle(ITEMS.slice());
        idx = 0;
      }
      loadItem();
    } else {
      if (idx < order.length - 1) {
        if (window.ArcadeFX && order.length >= 8 && idx + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (idx + 1) + " of " + order.length + " done");
        idx += 1;
        loadItem();
      } else {
        phase = "done";
        render();
      }
    }
  }

  function onYClick() {
    if (locked) return;
    const it = current();
    if (it.type !== "ies") return;
    if (yChanged) {
      stem = it.base;
      yChanged = false;
      attached = null;
    } else {
      sfxClick();
      stem = it.base.slice(0, -1) + "i";
      yChanged = true;
      attached = null;
    }
    renderPlay();
  }

  function attachEnding(end) {
    if (locked) return;
    const it = current();
    if (it.type === "ies" && !yChanged) {
      flashHint("Tap the y first — change it to i.");
      return;
    }
    attached = end;
    // Update ending slot in place (no full re-render = no flicker)
    var slot = document.getElementById("mp-ending");
    var word = document.getElementById("mp-word");
    if (slot && word) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mp-ending is-filled";
      btn.id = "mp-ending";
      btn.textContent = end;
      btn.onclick = function (e) { e.stopPropagation(); clearEnding(); };
      slot.replaceWith(btn);
    } else {
      renderPlay();
    }
    setTimeout(check, 260);
  }

  function clearEnding() {
    if (locked) return;
    attached = null;
    var slot = document.getElementById("mp-ending");
    if (slot) {
      var span = document.createElement("span");
      span.className = "mp-ending is-empty";
      span.id = "mp-ending";
      slot.replaceWith(span);
    } else {
      renderPlay();
    }
  }

  function flashHint(msg) {
    const el = document.getElementById("mp-hint");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-warn");
    setTimeout(() => {
      el.classList.remove("is-warn");
      el.textContent = hintFor(current());
    }, 1400);
  }

  function hintFor(it) {
    if (it.type === "s") return "Add -s to make the plural.";
    if (it.type === "es") return "Add -es (words ending in ch, sh, ss, x…).";
    return "Tap y → i, then add -es.";
  }

  function check() {
    if (locked || !attached) return;
    locked = true;
    const it = current();
    let ok = false;

    if (it.type === "s") {
      ok = attached === "s" && stem === it.base;
    } else if (it.type === "es") {
      ok = attached === "es" && stem === it.base;
    } else {
      const expectedStem = it.base.slice(0, -1) + "i";
      ok = yChanged && stem === expectedStem && attached === "es";
    }

    const wordEl = document.getElementById("mp-word");
    const fb = document.getElementById("mp-feedback");

    if (ok) {
      sfxCorrect();
      score += 1;
      if (wordEl) wordEl.classList.add("is-correct");
      if (fb) {
        fb.textContent = "Correct! " + pluralOf(it);
        fb.className = "mp-feedback ok";
      }
    } else {
      sfxWrong();
      if (wordEl) wordEl.classList.add("is-wrong");
      if (fb) {
        fb.textContent = "It's \"" + pluralOf(it) + "\"";
        fb.className = "mp-feedback bad";
      }
    }

    const scoreEl = document.getElementById("mp-score");
    if (scoreEl) scoreEl.textContent = score;

    setTimeout(() => {
      if (mode === "timed" && timeLeft <= 0) return;
      nextItem();
    }, ok ? 650 : 1100);
  }

  function pluralOf(it) {
    if (it.type === "s") return it.base + "s";
    if (it.type === "es") return it.base + "es";
    return it.base.slice(0, -1) + "ies";
  }

  function calcStars() {
    if (score >= 18) return 3;
    if (score >= 14) return 2;
    if (score >= 10) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  /* ---- drag helpers ---- */
  let dragEnd = null;

  function onTilePointerDown(end, e) {
    if (locked) return;
    dragEnd = end;
    // no is-dragging class — avoids press flicker
  }

  function onTilePointerUp(end, e) {
    if (locked) return;
    attachEnding(end);
    dragEnd = null;
  }

  function onDropZoneUp() {
    if (locked) return;
    if (dragEnd) {
      attachEnding(dragEnd);
      dragEnd = null;
    }
  }

  function renderPlay() {
    const it = current();
    const showY = it.type === "ies" && !yChanged;
    const stemBody = showY ? it.base.slice(0, -1) : stem;
    const yPart = showY
      ? '<button type="button" class="mp-y" id="mp-y" title="Tap to change y → i">y</button>'
      : "";

    const endingSlot = attached
      ? '<button type="button" class="mp-ending is-filled" id="mp-ending">' + attached + '</button>'
      : '<span class="mp-ending is-empty" id="mp-ending"></span>';

    const progressHtml = mode === "timed"
      ? '<span class="mc-progress mp-score-badge" id="mp-score" title="Score">' + score + '</span>' +
        '<span class="mc-progress mp-timer" id="mp-timer">' + timeLeft + 's</span>'
      : '<span class="mc-progress">' + (idx + 1) + ' / ' + order.length + '</span>';

    app.innerHTML =
      '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Make Plurals</span>' +
        progressHtml +
      '</header>' +
      '<p class="mc-instruction" id="mp-hint">' + hintFor(it) + '</p>' +
      '<div class="mp-stage">' +
        '<div class="mp-word" id="mp-word">' +
          '<span class="mp-stem">' + stemBody + '</span>' + yPart + endingSlot +
        '</div>' +
        '<p class="mp-feedback" id="mp-feedback"></p>' +
        '<div class="mp-tiles">' +
          '<button type="button" class="mp-tile" data-end="s"' + (locked ? ' disabled' : '') + '>s</button>' +
          '<button type="button" class="mp-tile" data-end="es"' + (locked ? ' disabled' : '') + '>es</button>' +
        '</div>' +
        '<p class="mp-tip">Tap an ending — or drag it onto the word</p>' +
      '</div>';

    if (mode === "timed") updateTimerDisplay();

    const word = document.getElementById("mp-word");
    word.addEventListener("pointerup", onDropZoneUp);

    const yBtn = document.getElementById("mp-y");
    if (yBtn) yBtn.onclick = function (e) { e.stopPropagation(); onYClick(); };

    const filled = document.getElementById("mp-ending");
    if (filled && attached) {
      filled.onclick = function (e) { e.stopPropagation(); clearEnding(); };
    }

    app.querySelectorAll(".mp-tile").forEach(function (tile) {
      const end = tile.dataset.end;
      tile.addEventListener("pointerdown", function (e) { onTilePointerDown(end, e); });
      tile.addEventListener("pointerup", function (e) { onTilePointerUp(end, e); });
      tile.draggable = true;
      tile.addEventListener("dragstart", function (e) {
        dragEnd = end;
        e.dataTransfer.setData("text/plain", end);
        tile.classList.add("is-dragging");
      });
      tile.addEventListener("dragend", function () { tile.classList.remove("is-dragging"); });
    });

    word.addEventListener("dragover", function (e) { e.preventDefault(); });
    word.addEventListener("drop", function (e) {
      e.preventDefault();
      const end = e.dataTransfer.getData("text/plain") || dragEnd;
      if (end) attachEnding(end);
      dragEnd = null;
    });
  }

  function render() {
    if (phase === "menu") {
      const best90 = getRecord(90);
      app.innerHTML =
        '<header class="mc-topbar">' +
          '<a class="mc-back" href="../" aria-label="Back">←</a>' +
          '<span class="mc-title">Make Plurals</span>' +
          '<span class="mc-badge">3A</span>' +
        '</header>' +
        '<section class="mc-start">' +
          '<div class="mc-hero" aria-hidden="true">🔤</div>' +
          '<h1>Make Plurals</h1>' +
          '<p class="mc-desc">Add <strong>-s</strong>, <strong>-es</strong>, or change <strong>y → i + es</strong></p>' +
          '<ul class="mp-rules">' +
            '<li>Most nouns → add <b>s</b></li>' +
            '<li>ch / sh / ss / x → add <b>es</b></li>' +
            '<li>consonant + y → <b>y → i</b>, then <b>es</b></li>' +
          '</ul>' +
          '<div class="mp-mode-cards">' +
            '<button type="button" class="mp-mode-card" id="mp-basic">' +
              '<span class="mp-mode-icon">📚</span>' +
              '<span class="mp-mode-name">Basic</span>' +
              '<span class="mp-mode-desc">Practice all 20 words</span>' +
            '</button>' +
            '<button type="button" class="mp-mode-card mp-mode-card--timed" id="mp-timed">' +
              '<span class="mp-mode-icon">⏱️</span>' +
              '<span class="mp-mode-name">Timed</span>' +
              '<span class="mp-mode-desc">Beat the clock · set records</span>' +
            '</button>' +
          '</div>' +
          '<p class="mp-record">Best 90s score: <strong>' + best90 + '</strong></p>' +
        '</section>';
      document.getElementById("mp-basic").onclick = function () {
        sfxClick();
        start("basic");
      };
      document.getElementById("mp-timed").onclick = function () {
        sfxClick();
        phase = "timer-select";
        render();
      };
      return;
    }

    if (phase === "timer-select") {
      var optionsHtml = TIMER_OPTIONS.map(function (sec) {
        var best = getRecord(sec);
        var label = sec < 60 ? sec + "s" : (sec / 60) + " min";
        return (
          '<button type="button" class="mp-timer-opt" data-sec="' + sec + '">' +
            '<span class="mp-timer-opt-time">' + label + '</span>' +
            '<span class="mp-timer-opt-best">Best: ' + best + '</span>' +
          '</button>'
        );
      }).join("");

      app.innerHTML =
        '<header class="mc-topbar">' +
          '<button type="button" class="mc-back" id="mp-back-menu" aria-label="Back">←</button>' +
          '<span class="mc-title">Choose Time</span>' +
          '<span class="mc-badge">Timed</span>' +
        '</header>' +
        '<section class="mc-start">' +
          '<div class="mc-hero" aria-hidden="true">⏱️</div>' +
          '<h1>How long?</h1>' +
          '<p class="mc-desc">Pick a timer and try to set a new record</p>' +
          '<div class="mp-timer-grid">' + optionsHtml + '</div>' +
        '</section>';
      document.getElementById("mp-back-menu").onclick = function () {
        sfxClick();
        phase = "menu";
        render();
      };
      app.querySelectorAll(".mp-timer-opt").forEach(function (btn) {
        btn.onclick = function () {
          sfxClick();
          var sec = parseInt(btn.dataset.sec, 10);
          start("timed", sec);
        };
      });
      return;
    }

    if (phase === "done") {
      stopTimer();

      if (mode === "timed") {
        var best = getRecord(timedSeconds);
        var timeLabel = timedSeconds < 60 ? timedSeconds + "s" : (timedSeconds / 60) + " min";
        app.innerHTML =
          '<header class="mc-topbar">' +
            '<a class="mc-back" href="../" aria-label="Back">←</a>' +
            '<span class="mc-title">Make Plurals</span>' +
            '<span class="mc-badge">Timed</span>' +
          '</header>' +
          '<section class="mc-start mp-done">' +
            '<div class="mc-hero mp-done-hero" aria-hidden="true">' + (isNewRecord ? "🏆" : "⏱️") + '</div>' +
            '<h1>' + (isNewRecord ? "New Record!" : "Time's Up!") + '</h1>' +
            '<p class="mp-final-score">You made <strong>' + score + '</strong> plural' + (score === 1 ? "" : "s") + '</p>' +
            '<p class="mp-done-meta">' + timeLabel + ' · Best: <strong>' + best + '</strong></p>' +
            '<div class="mp-modes">' +
              '<button type="button" class="mc-btn" id="mp-again">Play Again</button>' +
              '<button type="button" class="mc-btn mc-btn--ghost" id="mp-menu">Modes</button>' +
            '</div>' +
          '</section>';
        document.getElementById("mp-again").onclick = function () { start("timed", timedSeconds); };
        document.getElementById("mp-menu").onclick = function () { phase = "menu"; render(); };
        return;
      }

      // Basic mode finish
      var stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: function () { start("basic"); },
          onModes: function () { phase = "menu"; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = '<p>Done — ' + score + ' / ' + ITEMS.length + '</p>' +
        '<button type="button" id="u3a-again">Again</button>';
      document.getElementById("u3a-again").onclick = function () { start("basic"); };
      return;
    }

    renderPlay();
  }


  function ensureFieldVisible(el) {
    if (!el) return;
    var target = el.closest(".ll-card, .lsp-card, .sp-card, .qa-card, .wi-card, .lw-card, .ll-stage, .lsp-stage, .sp-stage, .qa-stage, .wi-stage") || el;
    try { target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { try { target.scrollIntoView(true); } catch (e2) {} }
    setTimeout(function () {
      try { target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e3) {}
    }, 350);
  }
  function bindKeyboardFix(root) {
    root = root || document;
    var inputs = root.querySelectorAll('input[type="text"], input.ll-input, input.lsp-input, input.sp-input, input.qa-input, input.lw-input, input.wi-input');
    inputs.forEach(function (inp) {
      if (inp.dataset.kbFix) return;
      inp.dataset.kbFix = "1";
      inp.addEventListener("focus", function () { ensureFieldVisible(inp); });
      inp.addEventListener("click", function () { ensureFieldVisible(inp); });
    });
    if (window.visualViewport && !window.__proKbVV) {
      window.__proKbVV = true;
      var onVV = function () {
        var ae = document.activeElement;
        if (ae && ae.tagName === "INPUT") ensureFieldVisible(ae);
      };
      window.visualViewport.addEventListener("resize", onVV);
      window.visualViewport.addEventListener("scroll", onVV);
    }
  }

  // Re-bind after UI paints
  var _origRenderDone = true;
  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.tagName === 'INPUT') ensureFieldVisible(e.target);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      var ae = document.activeElement;
      if (ae && ae.tagName === 'INPUT') ensureFieldVisible(ae);
    });
  }

  render();
})();
