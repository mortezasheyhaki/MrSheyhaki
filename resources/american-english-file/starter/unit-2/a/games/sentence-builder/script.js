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

/* Sentence Builder – unscramble be + / − · AEF Starter */
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


  const GAME_ID = "starter-2a-sentence-builder";

  // 5 positive + 5 negative — subject | verb | (n't/not) | complement
  const SENTENCES = [
    { id: "p1", type: "+", words: ["I", "am", "Korean."], answer: "I am Korean." },
    { id: "p2", type: "+", words: ["You", "are", "Brazilian."], answer: "You are Brazilian." },
    { id: "p3", type: "+", words: ["He", "is", "Spanish."], answer: "He is Spanish." },
    { id: "p4", type: "+", words: ["We", "are", "American."], answer: "We are American." },
    { id: "p5", type: "+", words: ["They", "are", "Peruvian."], answer: "They are Peruvian." },
    { id: "n1", type: "−", words: ["I", "am", "not", "Korean."], answer: "I am not Korean." },
    { id: "n2", type: "−", words: ["You", "are", "n't", "Chilean."], answer: "You aren't Chilean." },
    { id: "n3", type: "−", words: ["She", "is", "n't", "Turkish."], answer: "She isn't Turkish." },
    { id: "n4", type: "−", words: ["We", "are", "n't", "American."], answer: "We aren't American." },
    { id: "n5", type: "−", words: ["They", "are", "n't", "Peruvian."], answer: "They aren't Peruvian." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | feedback | done
  let order = [];
  let index = 0;
  let correctCount = 0;
  let bank = [];      // remaining tiles in bank
  let slots = [];     // filled slots (word or null)
  let dragWord = null;
  let dragFrom = null; // { place: "bank"|"slot", i: number }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(SENTENCES);
    index = 0;
    correctCount = 0;
    startItem();
  }

  function startItem() {
    const s = order[index];
    bank = shuffle(s.words.slice());
    slots = s.words.map(() => null);
    dragWord = null;
    dragFrom = null;
    phase = "play";
    render();
  }

  function builtSentence() {
    if (slots.some((w) => !w)) return null;
    // Attach n't to previous word without a space → aren't / isn't
    let out = "";
    slots.forEach((w) => {
      if (w === "n't") out += "n't";
      else out += (out ? " " : "") + w;
    });
    return out;
  }

  function checkAnswer() {
    const built = builtSentence();
    if (!built) return;
    const s = order[index];
    const ok = built === s.answer;
    if (ok) { try{sfxCorrect();}catch(e){}
      correctCount += 1;
      phase = "feedback";
      render(true);
      setTimeout(() => {
        if (index < order.length - 1) {
          if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
          index += 1;
          startItem();
        } else {
          phase = "done";
          render();
        }
      }, 1000);
    } else {
      // stay on same item – shake + try again
      phase = "tryagain";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    if (n >= 9) return 3;
    if (n >= 7) return 2;
    if (n >= 5) return 1;
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

  function progressHTML() {
    const total = order.length;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="sb-track"><div class="sb-track-fill" style="width:${fill}%"></div></div>
      <div class="sb-scoreline">
        <span class="sb-score">${correctCount} correct</span>
        <span class="sb-step">${index + 1} / ${total}</span>
      </div>`;
  }

  // —— Drag helpers ——
  function onTilePointerDown(e, place, i) {
    e.preventDefault();
    const word = place === "bank" ? bank[i] : slots[i];
    if (!word) return;
    dragWord = word;
    dragFrom = { place, i };
    let moved = false;
    const startX = (e.touches ? e.touches[0] : e).clientX;
    const startY = (e.touches ? e.touches[0] : e).clientY;

    const tile = e.currentTarget;
    tile.classList.add("is-dragging");

    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      if (Math.abs(pt.clientX - startX) > 8 || Math.abs(pt.clientY - startY) > 8) moved = true;
    };
    const up = (ev) => {
      tile.classList.remove("is-dragging");
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);

      const pt = ev.changedTouches ? ev.changedTouches[0] : ev;

      if (!moved) {
        // tap
        if (place === "bank") tapBank(i);
        else tapSlot(i);
      } else {
        const el = document.elementFromPoint(pt.clientX, pt.clientY);
        const slotEl = el && el.closest("[data-slot]");
        const bankEl = el && el.closest(".sb-bank");
        if (slotEl) dropOnSlot(+slotEl.dataset.slot);
        else if (bankEl && dragFrom.place === "slot") returnToBank();
        render();
      }
      dragWord = null;
      dragFrom = null;
    };
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", up);
  }

  function dropOnSlot(slotIndex) {
    if (dragFrom.place === "bank") {
      const existing = slots[slotIndex];
      slots[slotIndex] = bank[dragFrom.i];
      bank.splice(dragFrom.i, 1);
      if (existing) bank.push(existing);
    } else if (dragFrom.place === "slot") {
      // swap
      const tmp = slots[slotIndex];
      slots[slotIndex] = slots[dragFrom.i];
      slots[dragFrom.i] = tmp;
    }
  }

  function returnToBank() {
    if (dragFrom.place !== "slot") return;
    const w = slots[dragFrom.i];
    if (!w) return;
    slots[dragFrom.i] = null;
    bank.push(w);
  }

  function tapBank(i) {
    // place into first empty slot
    const empty = slots.findIndex((s) => !s);
    if (empty === -1) return;
    slots[empty] = bank[i];
    bank.splice(i, 1);
    render();
  }

  function tapSlot(i) {
    if (!slots[i]) return;
    bank.push(slots[i]);
    slots[i] = null;
    render();
  }

  function render(feedbackOk) {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-badge">be</span>
        </header>
        <section class="sb-start">
          <div class="sb-hero" aria-hidden="true">🧩</div>
          <h1>Sentence Builder</h1>
          <p class="sb-desc">Unscramble 10 sentences<br>5 positive (+) · 5 negative (−)</p>
          <p class="sb-tip">Drag words into the boxes — or tap to place / remove</p>
          <button type="button" class="sb-btn" id="sb-start">Start →</button>
        </section>`;
      document.getElementById("sb-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: 10,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = startGame;
      return;
    }

    const s = order[index];
    const typeLabel = s.type === "+" ? "Positive (+)" : "Negative (−)";
    const canCheck = slots.every((w) => w);

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-progress">${index + 1} / 10</span>
        </header>
        ${progressHTML()}
        <section class="sb-feedback is-bad sb-shake">
          <div class="sb-fb-icon">❌</div>
          <p class="sb-fb-msg">Try again</p>
          <p class="sb-fb-hint">Check the word order</p>
          <button type="button" class="sb-btn" id="sb-retry">Try again</button>
        </section>`;
      document.getElementById("sb-retry").onclick = () => {
        // reset slots/bank for same sentence
        startItem();
      };
      return;
    }

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-progress">${index + 1} / 10</span>
        </header>
        ${progressHTML()}
        <section class="sb-feedback is-ok">
          <div class="sb-fb-icon">✅</div>
          <p class="sb-fb-msg">Correct!</p>
          <p class="sb-fb-answer">${s.answer}</p>
        </section>`;
      return;
    }

    // play
    app.innerHTML = `
      <header class="sb-topbar">
        <a class="sb-back" href="../" aria-label="Back">←</a>
        <span class="sb-title">Sentence Builder</span>
        <span class="sb-progress">${index + 1} / 10</span>
      </header>
      ${progressHTML()}
      <section class="sb-play">
        <p class="sb-type">${typeLabel}</p>
        <p class="sb-instruction">Build the sentence</p>
        <div class="sb-slots" id="sb-slots">
          ${slots.map((w, i) => `
            <div class="sb-slot ${w ? "is-filled" : ""}" data-slot="${i}">
              ${w ? `<span class="sb-tile in-slot" data-place="slot" data-i="${i}">${w}</span>` : `<span class="sb-slot-ph">${i + 1}</span>`}
            </div>`).join("")}
        </div>
        <div class="sb-bank" id="sb-bank">
          ${bank.map((w, i) => `
            <span class="sb-tile" data-place="bank" data-i="${i}">${w}</span>`).join("")}
        </div>
        <div class="sb-actions">
          <button type="button" class="sb-btn" id="sb-check" ${canCheck ? "" : "disabled"}>Check</button>
          <button type="button" class="sb-btn secondary" id="sb-reset">Reset</button>
        </div>
      </section>`;

    document.getElementById("sb-check").onclick = checkAnswer;
    document.getElementById("sb-reset").onclick = startItem;

    app.querySelectorAll(".sb-tile").forEach((tile) => {
      const place = tile.dataset.place;
      const i = +tile.dataset.i;
      tile.addEventListener("pointerdown", (e) => onTilePointerDown(e, place, i));
    });
  }

  render();
})();
