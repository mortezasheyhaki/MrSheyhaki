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

/* Unscramble Clothes – AEF Starter Unit 9B */
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


  const GAME_ID = "starter-9b-unscramble-clothes";

  const COUNTRIES = [
    { id: "cap", label: "cap", word: "cap", audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3", image: "https://cdn.imgurl.ir/uploads/b4742_cap.png" },
    { id: "coat", label: "coat", word: "coat", audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3", image: "https://cdn.imgurl.ir/uploads/w043594_coat.png" },
    { id: "dress", label: "dress", word: "dress", audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3", image: "https://cdn.imgurl.ir/uploads/d995053_dress.png" },
    { id: "hat", label: "hat", word: "hat", audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3", image: "https://cdn.imgurl.ir/uploads/o3351_hat.png" },
    { id: "jacket", label: "jacket", word: "jacket", audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3", image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png" },
    { id: "jeans", label: "jeans", word: "jeans", audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3", image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png" },
    { id: "pants", label: "pants", word: "pants", audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3", image: "https://cdn.imgurl.ir/uploads/i04627_pants.png" },
    { id: "shirt", label: "shirt", word: "shirt", audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3", image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png" },
    { id: "shoes", label: "shoes", word: "shoes", audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3", image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png" },
    { id: "shorts", label: "shorts", word: "shorts", audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3", image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png" },
    { id: "skirt", label: "skirt", word: "skirt", audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3", image: "https://cdn.imgurl.ir/uploads/a444189_st.png" },
    { id: "sneakers", label: "sneakers", word: "sneakers", audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3", image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png" },
    { id: "socks", label: "socks", word: "socks", audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3", image: "https://cdn.imgurl.ir/uploads/k600200_socks.png" },
    { id: "suit", label: "suit", word: "suit", audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3", image: "https://cdn.imgurl.ir/uploads/e98017_suit.png" },
    { id: "sweater", label: "sweater", word: "sweater", audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3", image: "https://cdn.imgurl.ir/uploads/x441494_swer.png" },
    { id: "t-shirt", label: "T-shirt", word: "T-shirt", audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3", image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "start"; // start | play | feedback | done
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let slots = []; // array of letters or null for filled answer
  let pool = []; // remaining letter tiles { ch, uid }
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
    return COUNTRIES[order[index]];
  }

  function letterList(word) {
    // Keep spaces as fixed slots; preserve original case (first letter capital)
    return word.split("").map((ch) => (ch === " " ? " " : ch));
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(COUNTRIES.map((_, i) => i));
    index = 0;
    correctCount = 0;
    startRound();
  }

  function startRound() {
    const c = current();
    const letters = letterList(c.word);
    slots = letters.map((ch) => (ch === " " ? { type: "space" } : { type: "empty", ch: null, uid: null }));
    const scramble = letters.filter((ch) => ch !== " ");
    // Ensure scramble is not already solved
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
    // auto-play audio shortly after render
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

  function placeLetter(uid) {
    if (checked) return;
    const tile = pool.find((t) => t.uid === uid && !t.used);
    if (!tile) return;
    const si = firstEmptySlot();
    if (si < 0) return;
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    renderPlayPartial();
    // auto-check when all filled
    if (firstEmptySlot() < 0) {
      // small delay so user sees last letter land
      setTimeout(checkAnswer, 200);
    }
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
    return slots
      .map((s) => {
        if (s.type === "space") return " ";
        return s.ch || "";
      })
      .join("");
  }

  function checkAnswer() {
    if (checked) return;
    const c = current();
    const built = builtWord().trim();
    // require all non-space slots filled
    if (slots.some((s) => s.type === "empty" && !s.ch)) return;
    checked = true;
    lastCorrect = built.toUpperCase() === c.word.toUpperCase();
    if (lastCorrect) correctCount++;
    phase = "feedback";
    render();
  }

  function nextRound() {
    stopAudio();
    if (index < order.length - 1) {
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
        if (s.type === "space") {
          return `<span class="uc-space" aria-hidden="true"></span>`;
        }
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
        if (t.used) {
          return `<span class="uc-tile used" aria-hidden="true">${escapeHtml(t.ch)}</span>`;
        }
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
            <span class="uc-kicker">STARTER · UNIT 9B</span>
            <span class="uc-title">Unscramble Clothes</span>
          </div>
          <span class="uc-badge">15</span>
        </header>
        <section class="uc-start">
          <div class="uc-hero">🔤</div>
          <h1>Unscramble Clothes</h1>
          <p class="uc-desc">Look at the picture, listen, then put the letters in the right order to spell the word.</p>
          <button type="button" class="uc-btn" id="uc-start">Start</button>
        </section>`;
      document.getElementById("uc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const total = COUNTRIES.length;
      const stars = correctCount === total ? 3 : correctCount >= total - 2 ? 2 : correctCount >= Math.ceil(total / 2) ? 1 : 0;
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
      app.innerHTML = `<p>Done ${correctCount}/${total}</p><button type="button" id="fb-again">Again</button>`;
      document.getElementById("fb-again").onclick = startGame;
      return;
    }

    const c = current();
    const progress = `${index + 1}/${order.length}`;

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · UNIT 9B</span>
            <span class="uc-title">Unscramble Clothes</span>
          </div>
          <span class="uc-badge">${progress}</span>
        </header>
        <div class="uc-scroll">
          <div class="uc-card uc-card-photo">
            <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
                 onerror="this.style.display='none'" />
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
      document.getElementById("uc-next").onclick = nextRound;
      return;
    }

    // play
    app.innerHTML = `
      <header class="uc-topbar">
        <a class="uc-back" href="../" aria-label="Back">←</a>
        <div class="uc-topbar-center">
          <span class="uc-kicker">STARTER · UNIT 9B</span>
          <span class="uc-title">Unscramble Clothes</span>
        </div>
        <span class="uc-badge">${progress}</span>
      </header>
      <p class="uc-instruction">Tap the letters to spell the country.</p>
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
