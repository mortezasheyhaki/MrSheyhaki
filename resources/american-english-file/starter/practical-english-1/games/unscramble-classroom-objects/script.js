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

/* Unscramble Classroom Objects – AEF Starter Practical English 1 */
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


  const GAME_ID = "starter-pe1-unscramble-classroom-objects";

  const ITEMS = [
    { id: "bag", label: "a bag", word: "bag", audio: "https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3", image: "https://cdn.imgurl.ir/uploads/q131373_a-bag.png" },
    { id: "pen", label: "a pen", word: "pen", audio: "https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3", image: "https://cdn.imgurl.ir/uploads/t81465_a-pen.png" },
    { id: "paper", label: "a piece of paper", word: "paper", audio: "https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3", image: "https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png" },
    { id: "dictionary", label: "a dictionary", word: "dictionary", audio: "https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3", image: "https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png" },
    { id: "laptop", label: "a laptop", word: "laptop", audio: "https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3", image: "https://cdn.imgurl.ir/uploads/w410273_a-laptop.png" },
    { id: "table", label: "a table", word: "table", audio: "https://cdn.imgurl.ir/uploads/d742794_a-table.mp3", image: "https://cdn.imgurl.ir/uploads/a696837_a-table.png" },
    { id: "chair", label: "a chair", word: "chair", audio: "https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3", image: "https://cdn.imgurl.ir/uploads/t901556_a-chair.png" },
    { id: "window", label: "a window", word: "window", audio: "https://cdn.imgurl.ir/uploads/l543208_a-window.mp3", image: "https://cdn.imgurl.ir/uploads/c480039_a-window.png" },
    { id: "door", label: "the door", word: "door", audio: "https://cdn.imgurl.ir/uploads/g92275_the-door.mp3", image: "https://cdn.imgurl.ir/uploads/o763819_the-door.png" },
    { id: "board", label: "the board", word: "board", audio: "https://cdn.imgurl.ir/uploads/i034259_the-board.mp3", image: "https://cdn.imgurl.ir/uploads/v58413_the-board.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "start";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let slots = [];
  let pool = [];
  let checked = false;
  let lastCorrect = false;
  let uidCounter = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return ITEMS[order[index]];
  }

  function letterList(word) {
    return word.split("").map((ch) => (ch === " " ? " " : ch));
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correctCount = 0;
    startRound();
  }

  function startRound() {
    const c = current();
    const letters = letterList(c.word);
    slots = letters.map((ch) =>
      ch === " " ? { type: "space" } : { type: "empty", ch: null, uid: null }
    );
    const scramble = letters.filter((ch) => ch !== " ");
    let scrambled = shuffle(scramble);
    let tries = 0;
    while (scrambled.join("") === scramble.join("") && scramble.length > 1 && tries < 20) {
      scrambled = shuffle(scramble);
      tries++;
    }
    pool = scrambled.map((ch) => ({ ch, uid: ++uidCounter, used: false }));
    checked = false;
    lastCorrect = false;
    phase = "play";
    render();
    setTimeout(() => playAudio(), 350);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio() {
    const c = current();
    if (!c || !c.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(c.audio);
      currentAudio.play().catch(() => {});
    } catch (_) {}
  }

  function firstEmptySlot() {
    return slots.findIndex((s) => s.type === "empty" && !s.ch);
  }

  function fillBlank(input, val) {
    /* unused – letter tiles only */
  }

  function placeLetter(uid) {
    if (checked) return;
    const tile = pool.find((t) => t.uid === uid && !t.used);
    if (!tile) return;
    const si = firstEmptySlot();
    if (si < 0) return;
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    renderPlayPartial();
    if (firstEmptySlot() < 0) setTimeout(checkAnswer, 200);
  }

  function removeFromSlot(si) {
    if (checked) return;
    const s = slots[si];
    if (!s || s.type !== "empty" || !s.ch) return;
    const tile = pool.find((t) => t.uid === s.uid);
    if (tile) tile.used = false;
    slots[si] = { type: "empty", ch: null, uid: null };
    renderPlayPartial();
  }

  function builtWord() {
    return slots.map((s) => (s.type === "space" ? " " : s.ch || "")).join("");
  }

  function checkAnswer() {
    if (checked) return;
    const c = current();
    if (slots.some((s) => s.type === "empty" && !s.ch)) return;
    checked = true;
    lastCorrect = builtWord() === c.word;
    if (lastCorrect) correctCount++;
    phase = "feedback";
    render();
  }

  function nextRound() {
    stopAudio();
    if (index < order.length - 1) {
      if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
      index++;
      startRound();
    } else {
      phase = "done";
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlots(interactive) {
    return slots
      .map((s, i) => {
        if (s.type === "space") return `<span class="uc-space" aria-hidden="true"></span>`;
        if (s.ch) {
          const cls = checked
            ? lastCorrect
              ? "uc-slot filled ok"
              : "uc-slot filled bad"
            : "uc-slot filled";
          const click = interactive && !checked ? `data-slot="${i}"` : "";
          return `<button type="button" class="${cls}" ${click} aria-label="letter ${s.ch}">${escapeHtml(s.ch)}</button>`;
        }
        return `<span class="uc-slot empty" aria-hidden="true"></span>`;
      })
      .join("");
  }

  function renderPool() {
    return pool
      .map((t) => {
        if (t.used) return `<span class="uc-tile used" aria-hidden="true">${escapeHtml(t.ch)}</span>`;
        return `<button type="button" class="uc-tile" data-uid="${t.uid}">${escapeHtml(t.ch)}</button>`;
      })
      .join("");
  }

  function renderPlayPartial() {
    const slotsEl = document.getElementById("uc-slots");
    const poolEl = document.getElementById("uc-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(true);
      slotsEl.querySelectorAll("[data-slot]").forEach((btn) => {
        btn.onclick = () => removeFromSlot(+btn.dataset.slot);
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool();
      poolEl.querySelectorAll("[data-uid]").forEach((btn) => {
        btn.onclick = () => placeLetter(+btn.dataset.uid);
      });
    }
  }

  function render() {
    if (phase === "start") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · PRACTICAL ENGLISH 1</span>
            <span class="uc-title">Unscramble Classroom Objects</span>
          </div>
          <span class="uc-badge">${ITEMS.length}</span>
        </header>
        <section class="uc-start">
          <div class="uc-hero">✏️</div>
          <h1>Unscramble Classroom Objects</h1>
          <p class="uc-desc">Look at the picture, listen, then put the letters in order to spell the word.</p>
          <button type="button" class="uc-btn" id="uc-start">Start</button>
        </section>`;
      document.getElementById("uc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const total = ITEMS.length;
      const stars =
        correctCount === total ? 3 : correctCount >= total - 2 ? 2 : correctCount >= Math.ceil(total / 2) ? 1 : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: () => { phase = "start"; render(); },
          backHref: "../",
        });
        return;
      }
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
      app.innerHTML = `<p>Done ${correctCount}/${total}</p><button type="button" id="uc-again">Again</button>`;
      document.getElementById("uc-again").onclick = startGame;
      return;
    }

    const c = current();
    const progress = `${index + 1}/${order.length}`;

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · PRACTICAL ENGLISH 1</span>
            <span class="uc-title">Unscramble Classroom Objects</span>
          </div>
          <span class="uc-badge">${progress}</span>
        </header>
        <div class="uc-scroll">
          <div class="uc-card uc-card-photo">
            <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
                 onerror="this.style.display='none'" />
            <button type="button" class="uc-audio-btn" id="uc-play" aria-label="Play audio">🔊</button>
          </div>
          <div class="uc-card uc-card-word">
            <p class="uc-feedback ${lastCorrect ? "ok" : "bad"}">
              ${lastCorrect ? "✓ Correct!" : "✗ Not quite"}
            </p>
            <div class="uc-slots locked">${renderSlots(false)}</div>
            ${!lastCorrect ? `<p class="uc-answer-reveal">Answer: <strong>${escapeHtml(c.word)}</strong></p>` : ""}
            <p class="uc-country-name">${escapeHtml(c.label)}</p>
          </div>
          <button type="button" class="uc-btn uc-btn-next" id="uc-next">
            ${index < order.length - 1 ? "Next →" : "See results"}
          </button>
        </div>`;
      document.getElementById("uc-play").onclick = playAudio;
      document.getElementById("uc-next").onclick = nextRound;
      return;
    }

    app.innerHTML = `
      <header class="uc-topbar">
        <a class="uc-back" href="../" aria-label="Back">←</a>
        <div class="uc-topbar-center">
          <span class="uc-kicker">STARTER · PRACTICAL ENGLISH 1</span>
          <span class="uc-title">Unscramble Classroom Objects</span>
        </div>
        <span class="uc-badge">${progress}</span>
      </header>
      <p class="uc-instruction">Tap the letters to spell the word.</p>
      <div class="uc-scroll">
        <div class="uc-card uc-card-photo">
          <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
               onerror="this.style.display='none'" />
          <button type="button" class="uc-audio-btn" id="uc-play" aria-label="Play audio">🔊</button>
        </div>
        <div class="uc-card uc-card-word">
          <div class="uc-slots" id="uc-slots">${renderSlots(true)}</div>
        </div>
        <div class="uc-card uc-card-pool">
          <div class="uc-pool" id="uc-pool">${renderPool()}</div>
          <button type="button" class="uc-btn-check" id="uc-check">Check</button>
        </div>
      </div>`;

    document.getElementById("uc-play").onclick = playAudio;
    document.getElementById("uc-check").onclick = checkAnswer;
    document.getElementById("uc-slots").querySelectorAll("[data-slot]").forEach((btn) => {
      btn.onclick = () => removeFromSlot(+btn.dataset.slot);
    });
    document.getElementById("uc-pool").querySelectorAll("[data-uid]").forEach((btn) => {
      btn.onclick = () => placeLetter(+btn.dataset.uid);
    });
  }

  render();
})();
