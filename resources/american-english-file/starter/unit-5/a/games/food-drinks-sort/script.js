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
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, 2)];
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
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^\d+\s*\/\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(\d+)\s*\/\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
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


  const ITEMS = [
    ["fish","food"],["meat","food"],["pasta","food"],["rice","food"],["eggs","food"],
    ["yogurt","food"],["vegetables","food"],["potatoes","food"],["salad","food"],["fruit","food"],
    ["bread","food"],["butter","food"],["cheese","food"],["sugar","food"],["a sandwich","food"],
    ["cereal","food"],["chocolate","food"],
    ["coffee","drinks"],["tea","drinks"],["milk","drinks"],["water","drinks"],["orange juice","drinks"]
  ];
  const VISIBLE = 6;
  const TOTAL = ITEMS.length;
  const START_TIME = 90;
  const $ = (id) => document.getElementById(id);

  let state = null;

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startGame() {
    $("homeScreen").classList.add("hidden");
    $("gameScreen").classList.remove("hidden");
    $("endModal").classList.add("hidden");
    resetRound();
  }

  function resetRound() {
    if (state && state.timer) clearInterval(state.timer);
    state = {
      score: 0, combo: 0, bestCombo: 0, correct: 0, attempts: 0,
      foodCount: 0, drinksCount: 0, time: START_TIME, done: false, selected: null,
      remaining: shuffle(ITEMS.map(([word, category]) => ({ word, category }))),
      timer: null
    };
    $("cardTray").innerHTML = "";
    fillTray();
    updateHud();
    state.timer = setInterval(tick, 1000);
  }

  function fillTray() {
    const tray = $("cardTray");
    while (tray.children.length < VISIBLE && state.remaining.length > 0) {
      const next = state.remaining.shift();
      makeCard(next.word, next.category);
    }
  }

  function makeCard(word, category) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "word-card";
    card.textContent = word;
    card.dataset.category = category;
    card.dataset.word = word;
    card.addEventListener("click", () => selectCard(card));
    card.addEventListener("pointerdown", startPointer);
    $("cardTray").appendChild(card);
  }

  function clearSelection() {
    document.querySelectorAll(".word-card.selected").forEach((c) => c.classList.remove("selected"));
    $("foodZone").classList.remove("active-target");
    $("drinksZone").classList.remove("active-target");
    state.selected = null;
  }

  function selectCard(card) {
    if (state.done) return;
    if (state.selected === card) { clearSelection(); return; }
    clearSelection();
    state.selected = card;
    card.classList.add("selected");
    $("foodZone").classList.add("active-target");
    $("drinksZone").classList.add("active-target");
  }

  function startPointer(e) {
    if (state.done || (e.button !== undefined && e.button !== 0)) return;
    const card = e.currentTarget;
    e.preventDefault();
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    card.classList.add("dragging");
    const move = (ev) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      document.querySelectorAll(".drop-zone").forEach((z) => {
        z.classList.toggle("drag-over", !!(el && z.contains(el)));
      });
    };
    const up = (ev) => {
      card.classList.remove("dragging");
      document.querySelectorAll(".drop-zone").forEach((z) => z.classList.remove("drag-over"));
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      try { card.releasePointerCapture(ev.pointerId); } catch (_) {}
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const zone = el && el.closest ? el.closest(".drop-zone") : null;
      if (zone) place(card, zone.dataset.category);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  ["foodZone", "drinksZone"].forEach((id) => {
    $(id).addEventListener("click", () => {
      if (state.selected) place(state.selected, $(id).dataset.category);
    });
  });

  function place(card, category) {
    if (!card || state.done || !card.parentNode) return;
    state.attempts++;
    if (card.dataset.category !== category) {
      state.combo = 0;
      card.classList.add("wrong");
      setTimeout(() => card.classList.remove("wrong"), 400);
      updateHud();
      return;
    }
    state.correct++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += 10 + Math.max(0, state.combo - 1) * 2;
    if (category === "food") state.foodCount++; else state.drinksCount++;
    clearSelection();
    card.classList.add("leaving");
    setTimeout(() => {
      if (card.parentNode) card.parentNode.removeChild(card);
      fillTray();
    }, 220);
    updateHud();
    if (state.correct >= TOTAL) finish(true);
  }

  function tick() {
    if (state.done) return;
    state.time--;
    updateHud();
    if (state.time <= 0) finish(false);
  }

  function updateHud() {
    $("score").textContent = state.score;
    $("combo").textContent = state.combo + "x";
    $("timer").textContent = String(Math.max(0, state.time));
    $("progressLabel").textContent = state.correct + " / " + TOTAL;
    $("progressFill").style.width = (state.correct / TOTAL) * 100 + "%";
    $("foodCount").textContent = state.foodCount;
    $("drinksCount").textContent = state.drinksCount;
  }

  function finish(won) {
    state.done = true;
    clearInterval(state.timer);
    $("finalScore").textContent = state.score;
    $("accuracy").textContent = (state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0) + "%";
    $("bestCombo").textContent = state.bestCombo + "x";
    $("endTitle").textContent = won ? "Excellent!" : "Time's up!";
    $("endMessage").textContent = won
      ? "You sorted all " + TOTAL + " words correctly."
      : "You sorted " + state.correct + " of " + TOTAL + ".";
    $("resultIcon").textContent = won ? "🏆" : "⏱️";
    
    try { if(window.LAStars){var acc=state.attempts?Math.round(state.correct/state.attempts*100):0;LAStars.recordPlay("starter-5a-food-drinks-sort");LAStars.saveFromAccuracy("starter-5a-food-drinks-sort",acc);} } catch (e) {}
    $("endModal").classList.remove("hidden");
  }

  const themeBtn = $("themeBtn");
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeBtn.textContent = dark ? "☀️" : "🌙";
    try { localStorage.setItem("fds-theme", dark ? "dark" : "light"); } catch (_) {}
  }
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });
  try { applyTheme(localStorage.getItem("fds-theme") === "dark"); } catch (_) { applyTheme(false); }

  $("startBtn").addEventListener("click", startGame);
  $("playAgain").addEventListener("click", () => {
    $("endModal").classList.add("hidden");
    startGame();
  });
})();
