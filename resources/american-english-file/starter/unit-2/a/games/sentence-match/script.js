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
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Sentence Match – questions ↔ answers · AEF Starter Unit 2A */
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
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok();
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad();
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
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


  const GAME_ID = "starter-2a-sentence-match";

  const PAIRS = [
    { id: "p1", q: "Excuse me. Are you James?", a: "No, I'm not. I'm Jason." },
    { id: "p2", q: "Where are Alice and Umberto from?", a: "They're Argentinian." },
    { id: "p3", q: "Are you here on vacation?", a: "Yes, we are." },
    { id: "p4", q: "Is Nike English?", a: "No, it isn't. It's American." },
    { id: "p5", q: "Are Pablo and Antonio Mexican?", a: "No, they aren't. They're Spanish." },
    { id: "p6", q: "Are we late?", a: "No, you aren't." },
    { id: "p7", q: "Where are you from?", a: "I'm from Korea." },
    { id: "p8", q: "Is Caroline Canadian?", a: "Yes, she's from Toronto." },
    { id: "p9", q: "Where are you from in Saudi Arabia?", a: "We're from Medina." },
    { id: "p10", q: "Is Kyoto in China?", a: "No, it's in Japan." },
  ];

  const ROUNDS = [
    ["p1", "p2", "p3", "p4", "p5"],
    ["p6", "p7", "p8", "p9", "p10"],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let roundIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let locked = {};
  let matches = {};
  let selectedLeft = null;
  let totalCorrect = 0;
  let roundCorrect = 0;
  let busy = false;

  function byId(id) {
    return PAIRS.find((p) => p.id === id);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() >= leftOrder.length;
  }

  function updateProgress() {
    const el = document.getElementById("sm-progress");
    if (el) el.textContent = "Round " + (roundIndex + 1) + "/2 · " + correctCount() + "/5";
  }

  function clearSelectionUI() {
    app.querySelectorAll(".sm-left-item.is-selected").forEach((el) => {
      el.classList.remove("is-selected");
    });
  }

  function selectLeft(i) {
    if (busy || locked[i] != null) return;
    selectedLeft = i;
    clearSelectionUI();
    const el = app.querySelector('.sm-left-item[data-i="' + i + '"]');
    if (el) el.classList.add("is-selected");
  }

  function selectRight(pairId) {
    if (busy || selectedLeft === null) return;
    if (Object.values(matches).includes(pairId)) return;

    const leftId = leftOrder[selectedLeft];
    const leftEl = app.querySelector('.sm-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.sm-right-item[data-id="' + pairId + '"]');

    if (leftId === pairId) {
      locked[selectedLeft] = pairId;
      matches[selectedLeft] = pairId;
      roundCorrect++;
      totalCorrect++;
      const matchedIndex = selectedLeft;
      selectedLeft = null;

      if (leftEl) {
        leftEl.classList.remove("is-selected");
        leftEl.classList.add("is-correct");
        leftEl.disabled = true;
      }
      if (rightEl) {
        rightEl.classList.add("is-correct", "is-used");
        rightEl.disabled = true;
      }
      updateProgress();

      if (allMatched()) {
        busy = true;
        setTimeout(() => {
          busy = false;
          if (roundIndex < ROUNDS.length - 1) {
            if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Halfway there — round " + (roundIndex + 1) + " of " + ROUNDS.length + " done");
            startRound(roundIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 550);
      }
    } else {
      busy = true;
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong", "is-selected");
        if (rightEl) rightEl.classList.remove("is-wrong");
        selectedLeft = null;
        busy = false;
      }, 650);;
    }
  }

  function startRound(ri) {
    roundIndex = ri;
    const ids = ROUNDS[ri].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids.slice());
    locked = {};
    matches = {};
    selectedLeft = null;
    roundCorrect = 0;
    busy = false;
    phase = "play";
    render();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    totalCorrect = 0;
    startRound(0);
  }

  function calcStars() {
    const n = totalCorrect;
    if (n >= 9) return 3;
    if (n >= 7) return 2;
    if (n >= 4) return 1;
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

  function leftCell(id, i) {
    const p = byId(id);
    return (
      '<button type="button" class="sm-left-item" data-i="' +
      i +
      '"><span class="sm-text">' +
      p.q +
      "</span></button>"
    );
  }

  function rightCell(id) {
    const p = byId(id);
    return (
      '<button type="button" class="sm-right-item" data-id="' +
      id +
      '"><span class="sm-text">' +
      p.a +
      "</span></button>"
    );
  }

  function bindPlay() {
    app.querySelectorAll(".sm-left-item").forEach((el) => {
      el.onclick = () => selectLeft(+el.dataset.i);
    });
    app.querySelectorAll(".sm-right-item").forEach((el) => {
      el.onclick = () => selectRight(el.dataset.id);
    });
    const reset = document.getElementById("sm-reset");
    if (reset) reset.onclick = () => startRound(roundIndex);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="sm-topbar">' +
        '<a class="sm-back" href="../" aria-label="Back">←</a>' +
        '<span class="sm-title">Sentence Match</span>' +
        '<span class="sm-badge">2A</span>' +
        "</header>" +
        '<section class="sm-start">' +
        '<div class="sm-hero" aria-hidden="true">🔗</div>' +
        "<h1>Sentence Match</h1>" +
        '<p class="sm-desc">Match each question with the correct answer.<br>2 rounds · 5 pairs each</p>' +
        '<button type="button" class="sm-btn" id="sm-start">Start →</button>' +
        "</section>";
      document.getElementById("sm-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: 10,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = startGame;
      return;
    }

    const left = leftOrder.map((id, i) => leftCell(id, i)).join("");
    const right = rightOrder.map((id) => rightCell(id)).join("");

    app.innerHTML =
      '<header class="sm-topbar">' +
      '<a class="sm-back" href="../" aria-label="Back">←</a>' +
      '<span class="sm-title">Sentence Match</span>' +
      '<span class="sm-progress" id="sm-progress">Round ' +
      (roundIndex + 1) +
      "/2 · " +
      correctCount() +
      "/5</span>" +
      "</header>" +
      '<p class="sm-instruction">Tap a question, then the matching answer</p>' +
      '<div class="sm-board">' +
      '<div class="sm-col sm-col-left">' +
      left +
      "</div>" +
      '<div class="sm-col sm-col-right">' +
      right +
      "</div>" +
      "</div>" +
      '<div class="sm-actions">' +
      '<button type="button" class="sm-btn secondary" id="sm-reset">Reset round</button>' +
      "</div>";

    bindPlay();
  }

  render();
})();
