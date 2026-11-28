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
    var app = document.getElementById("game-app");
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, r.bottom + 8) + "px";
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
    ok: function () {
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0 && !api.noMilestone) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    cheer: function (i, n) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var k = i >= n - 1 && n > 1 ? 2 : Math.min(i, 1), c = T[k];
      burst([c[0], c[1], "Part " + (i + 1) + " of " + n + " complete"]);
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = document.getElementById("game-app"); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim();
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
    var app = document.getElementById("game-app"); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* I'm / You're – American English File Starter Unit 1A (3-Part Sequential Game) */
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
      if (window.ArcadeFX) ArcadeFX.ok();
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    }
    function sfxWrong() {
      if (window.ArcadeFX) ArcadeFX.bad();
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
  })();

  const GAME_ID = "starter-1a-be-i-you";

  const FORMS = [
    { full: "I am", short: "I'm", tip: "I + am → I'm" },
    { full: "You are", short: "You're", tip: "You + are → You're" },
    { full: "I am not", short: "I'm not", tip: "I + am not → I'm not" },
    { full: "You are not", short: "You're not", tip: "You + are not → You're not / You aren't" }
  ];

  const POSITIVE = [
    {
      id: 1,
      sentence: "Hi. ______ Tony.",
      blanks: ["I'm"],
      options: ["I'm", "You're"],
      full: "Hi. I'm Tony.",
      image: "https://cdn.imgurl.ir/uploads/68507_im-tony.png"
    },
    {
      id: 2,
      sentence: "Hello. ______ your teacher. ______ in my class.",
      blanks: ["I'm", "You're"],
      options: ["I'm", "You're"],
      full: "Hello. I'm your teacher. You're in my class.",
      image: "https://cdn.imgurl.ir/uploads/f809778_im-your-teacher.png"
    },
    {
      id: 3,
      sentence: "______ in room 4.",
      blanks: ["I'm"],
      options: ["I'm", "You're"],
      full: "I'm in room 4.",
      image: "https://cdn.imgurl.ir/uploads/c4650_im-in-room-4.png"
    },
    {
      id: 4,
      sentence: "______ in room 3.",
      blanks: ["You're"],
      options: ["I'm", "You're"],
      full: "You're in room 3.",
      image: "https://cdn.imgurl.ir/uploads/y44117_youre-in-room-3.png"
    },
    {
      id: 5,
      sentence: "Hello. ______ Maria. What's your name?",
      blanks: ["I'm"],
      options: ["I'm", "You're"],
      full: "Hello. I'm Maria. What's your name?",
      image: "https://cdn.imgurl.ir/uploads/208376_im-maria.png"
    }
  ];

  const NEGATIVE = [
    {
      id: 1,
      sentence: "______ Tom. I'm Tony.",
      blanks: ["I'm not"],
      options: ["I'm not", "You're not"],
      full: "I'm not Tom. I'm Tony.",
      image: "https://cdn.imgurl.ir/uploads/079970_im-not-tom.png"
    },
    {
      id: 2,
      sentence: "______ Marisa. I'm Maria.",
      blanks: ["I'm not"],
      options: ["I'm not", "You're not"],
      full: "I'm not Marisa. I'm Maria.",
      image: "https://cdn.imgurl.ir/uploads/k168927_im-not-marisa.png"
    },
    {
      id: 3,
      sentence: "______ in room 6. You're in room 7.",
      blanks: ["You're not"],
      options: ["I'm not", "You're not"],
      full: "You're not in room 6. You're in room 7.",
      image: "https://cdn.imgurl.ir/uploads/c18441_you-arent-in-room-6.png"
    },
    {
      id: 4,
      sentence: "______ in room 5.",
      blanks: ["You're not"],
      options: ["I'm not", "You're not"],
      full: "You're not in room 5.",
      image: "https://cdn.imgurl.ir/uploads/q45570_you-arent-in-room-5.png"
    }
  ];

  const PARTS = [
    { key: "forms", label: "Match the forms", short: "Forms", desc: "Full ↔ contraction" },
    { key: "positive", label: "Positive · I'm / You're", short: "Positive", desc: "Complete 5 picture prompts" },
    { key: "negative", label: "Negative · I'm not / You're not", short: "Negative", desc: "Complete 4 picture prompts" }
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  // ========== STATE ==========
  let part = null; // "forms" | "positive" | "negative"
  let index = 0;
  let items = [];
  let locked = false;
  let blankIndex = 0;

  // Cumulative scoring across all 3 parts
  let totalCorrect = 0;
  let totalAttempts = 0;

  let matchedPairs = new Set();
  let selectedFull = null;
  let selectedShort = null;
  let formsOrderFull = null;
  let formsOrderShort = null;

  let pendingTimers = [];
  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    pendingTimers.push(id);
    return id;
  }
  function clearPendingTimers() {
    while (pendingTimers.length) {
      clearTimeout(pendingTimers.pop());
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function calcStars(correct, total) {
    if (total <= 0) return 0;
    const pct = (correct / total) * 100;
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    if (pct >= 40) return 1;
    return 0;
  }

  function stepperHtml(activeKey) {
    const activeIdx = PARTS.findIndex((p) => p.key === activeKey);
    return `<div class="be-stepper" aria-label="Game progress">
      ${PARTS.map((p, i) => {
        const state = i < activeIdx ? "is-done" : i === activeIdx ? "is-active" : "";
        const num = i < activeIdx ? "✓" : String(i + 1);
        return `<div class="be-step ${state}">
          <span class="be-step-num" aria-hidden="true">${num}</span>
          <span>${p.short}</span>
        </div>`;
      }).join("")}
    </div>`;
  }

  // ========== START SCREEN ==========
  function showStart() {
    clearPendingTimers();
    part = null;
    locked = false;

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back to Unit 1A Games">←</a>
        <span class="be-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="be-start">
        <div class="be-start-card">
          <div class="be-start-hero">
            <div class="be-start-icon-wrap" aria-hidden="true">💬</div>
            <h1>I'm / You're</h1>
            <p class="be-sub">Complete all 3 parts in order to finish the challenge.</p>
          </div>

          <div class="be-roadmap" aria-label="Three parts in this game">
            <div class="be-roadmap-item">
              <span class="be-roadmap-num">1</span>
              <div class="be-roadmap-body">
                <span class="be-roadmap-title">Match the forms</span>
                <span class="be-roadmap-desc">Full form ↔ contraction</span>
              </div>
            </div>
            <div class="be-roadmap-item">
              <span class="be-roadmap-num">2</span>
              <div class="be-roadmap-body">
                <span class="be-roadmap-title">Positive</span>
                <span class="be-roadmap-desc">I'm · You're (5 pictures)</span>
              </div>
            </div>
            <div class="be-roadmap-item">
              <span class="be-roadmap-num">3</span>
              <div class="be-roadmap-body">
                <span class="be-roadmap-title">Negative</span>
                <span class="be-roadmap-desc">I'm not · You're not (4 pictures)</span>
              </div>
            </div>
          </div>

          <button type="button" class="be-btn be-start-cta" id="be-start-btn">Start Game →</button>
        </div>
      </div>
    `;

    document.getElementById("be-start-btn").addEventListener("click", startGame);
  }

  // ========== FULL 3-PART RUN ==========
  function startGame() {
    clearPendingTimers();
    totalCorrect = 0;
    totalAttempts = 0;
    if (window.LAFinish) LAFinish.startTimer();
    if (window.ArcadeFX && ArcadeFX.reset) ArcadeFX.reset();
    startForms();
  }

  // ========== PART 1: MATCH FORMS ==========
  function startForms() {
    clearPendingTimers();
    part = "forms";
    locked = false;
    matchedPairs = new Set();
    selectedFull = null;
    selectedShort = null;
    formsOrderFull = shuffle(FORMS.map((f, i) => ({ ...f, idx: i })));
    formsOrderShort = shuffle(FORMS.map((f, i) => ({ ...f, idx: i })));
    renderForms();
  }

  function renderForms() {
    const fulls = formsOrderFull;
    const shorts = formsOrderShort;

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="#" id="be-back-start" title="Back to start" aria-label="Back to start">←</a>
        <span class="be-topbar-title">Part 1 of 3 · Match the forms</span>
        <span class="be-progress">${matchedPairs.size} / ${FORMS.length}</span>
      </div>
      ${stepperHtml("forms")}
      <div class="be-forms-intro">
        <p>Tap a <strong>full form</strong>, then its <strong>contraction</strong>.</p>
      </div>
      <div class="be-forms-board">
        <div class="be-forms-col">
          <div class="be-forms-label">Full form</div>
          <div class="be-forms-list" id="fulls"></div>
        </div>
        <div class="be-forms-col">
          <div class="be-forms-label">Contraction</div>
          <div class="be-forms-list" id="shorts"></div>
        </div>
      </div>
      <div class="be-feedback" id="be-feedback"></div>
    `;

    document.getElementById("be-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const fullsEl = document.getElementById("fulls");
    const shortsEl = document.getElementById("shorts");

    fulls.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "be-form-card" + (matchedPairs.has(f.idx) ? " matched" : "");
      btn.type = "button";
      btn.dataset.idx = f.idx;
      btn.dataset.side = "full";
      btn.innerHTML = '<span class="be-form-text">' + f.full + "</span>";
      if (!matchedPairs.has(f.idx)) {
        btn.addEventListener("click", () => onFormSelect(btn, "full", f.idx));
      } else {
        btn.disabled = true;
      }
      fullsEl.appendChild(btn);
    });

    shorts.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "be-form-card" + (matchedPairs.has(f.idx) ? " matched" : "");
      btn.type = "button";
      btn.dataset.idx = f.idx;
      btn.dataset.side = "short";
      btn.innerHTML = '<span class="be-form-text">' + f.short + "</span>";
      if (!matchedPairs.has(f.idx)) {
        btn.addEventListener("click", () => onFormSelect(btn, "short", f.idx));
      } else {
        btn.disabled = true;
      }
      shortsEl.appendChild(btn);
    });
  }

  function onFormSelect(btn, side, idx) {
    if (locked || matchedPairs.has(idx)) return;

    try { sfxTap(); } catch (e) {}
    app.querySelectorAll('.be-form-card[data-side="' + side + '"]').forEach((b) => b.classList.remove("selected"));

    if (side === "full") {
      selectedFull = idx;
      btn.classList.add("selected");
    } else {
      selectedShort = idx;
      btn.classList.add("selected");
    }

    if (selectedFull !== null && selectedShort !== null) {
      locked = true;
      totalAttempts++;
      const feedback = document.getElementById("be-feedback");
      const fullBtn = app.querySelector('.be-form-card[data-side="full"][data-idx="' + selectedFull + '"]');
      const shortBtn = app.querySelector('.be-form-card[data-side="short"][data-idx="' + selectedShort + '"]');

      if (selectedFull === selectedShort) {
        matchedPairs.add(selectedFull);
        totalCorrect++;
        fullBtn.classList.remove("selected");
        shortBtn.classList.remove("selected");
        fullBtn.classList.add("correct", "matched");
        shortBtn.classList.add("correct", "matched");
        fullBtn.disabled = true;
        shortBtn.disabled = true;
        feedback.className = "be-feedback ok";
        feedback.textContent = "✓ " + FORMS[selectedFull].tip;
        try { sfxCorrect(); } catch (e) {}

        const prog = app.querySelector(".be-progress");
        if (prog) prog.textContent = matchedPairs.size + " / " + FORMS.length;

        schedule(() => {
          selectedFull = null;
          selectedShort = null;
          locked = false;
          if (matchedPairs.size >= FORMS.length) {
            showPartTransition(1, "positive");
          }
        }, 420);
      } else {
        fullBtn.classList.add("wrong");
        shortBtn.classList.add("wrong");
        feedback.className = "be-feedback bad";
        feedback.textContent = "Try again";
        try { sfxWrong(); } catch (e) {}

        schedule(() => {
          fullBtn.classList.remove("selected", "wrong");
          shortBtn.classList.remove("selected", "wrong");
          selectedFull = null;
          selectedShort = null;
          locked = false;
          feedback.textContent = "";
          feedback.className = "be-feedback";
        }, 420);
      }
    }
  }

  // ========== PART TRANSITION (PART 1 -> 2, PART 2 -> 3) ==========
  function showPartTransition(completedPartNum, nextPartKey) {
    clearPendingTimers();
    locked = false;
    const nextMeta = PARTS.find((p) => p.key === nextPartKey);
    try { sfxCelebrate(); } catch (e) {}

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="#" id="be-back-start" title="Back to start" aria-label="Back to start">←</a>
        <span class="be-topbar-title">Part ${completedPartNum} of 3 complete</span>
      </div>
      ${stepperHtml(nextPartKey)}
      <div class="be-transition">
        <div class="be-transition-card">
          <div class="be-transition-icon" aria-hidden="true">✓</div>
          <h2>Part ${completedPartNum} complete!</h2>
          <p>Next up: Part ${completedPartNum + 1} · ${nextMeta.label}</p>
          <button type="button" class="be-btn" id="be-next-part">Continue to Part ${completedPartNum + 1} →</button>
        </div>
      </div>
    `;

    const advance = () => {
      clearPendingTimers();
      startPart(nextPartKey);
    };

    document.getElementById("be-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });
    document.getElementById("be-next-part").addEventListener("click", advance);
    schedule(advance, 1400);
  }

  // ========== PART 2 & 3: POSITIVE & NEGATIVE ==========
  function startPart(p) {
    clearPendingTimers();
    part = p;
    items = p === "positive" ? POSITIVE.slice() : NEGATIVE.slice();
    index = 0;
    blankIndex = 0;
    locked = false;
    renderItem();
  }

  function buildSentenceHtml(item, filledCount) {
    let n = 0;
    return item.sentence.replace(/______/g, () => {
      if (n < filledCount) {
        const val = item.blanks[n];
        n++;
        return '<span class="blank filled">' + val + "</span>";
      } else if (n === filledCount) {
        n++;
        return '<span class="blank active">&nbsp;</span>';
      } else {
        n++;
        return '<span class="blank">&nbsp;</span>';
      }
    });
  }

  function renderItem() {
    if (index >= items.length) {
      if (part === "positive") {
        showPartTransition(2, "negative");
      } else {
        showFinalFinish();
      }
      return;
    }

    const item = items[index];
    const partLabel =
      part === "positive"
        ? "Part 2 of 3 · Positive (I'm / You're)"
        : "Part 3 of 3 · Negative (I'm not / You're not)";
    blankIndex = Math.min(blankIndex, item.blanks.length - 1);

    const imgSrc = item.image && (item.image.startsWith("http") ? item.image : "images/" + item.image);
    const imgHtml = item.image
      ? `<div class="be-image-wrap has-image" id="be-img">
           <img alt="Picture prompt ${index + 1}" src="${imgSrc}" referrerpolicy="no-referrer">
         </div>`
      : "";

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="#" id="be-back-start" title="Back to start" aria-label="Back to start">←</a>
        <span class="be-topbar-title">${partLabel}</span>
        <span class="be-progress">${index + 1} / ${items.length}</span>
      </div>
      ${stepperHtml(part)}
      <div class="be-card">
        ${imgHtml}
        <p class="be-sentence" id="be-sentence">${buildSentenceHtml(item, blankIndex)}</p>
        <div class="be-options" id="be-options"></div>
        <div class="be-feedback" id="be-feedback"></div>
      </div>
    `;

    document.getElementById("be-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const opts = document.getElementById("be-options");
    item.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "be-option";
      btn.type = "button";
      btn.textContent = opt;
      btn.addEventListener("click", () => onChoose(opt, item, btn));
      opts.appendChild(btn);
    });
  }

  function onChoose(choice, item, btn) {
    if (locked) return;
    locked = true;
    const feedback = document.getElementById("be-feedback");
    const buttons = app.querySelectorAll(".be-option");
    buttons.forEach((b) => (b.disabled = true));

    const expected = item.blanks[blankIndex];
    totalAttempts++;

    if (choice === expected) {
      totalCorrect++;
      btn.classList.add("correct");
      document.getElementById("be-sentence").innerHTML = buildSentenceHtml(item, blankIndex + 1);
      try { sfxCorrect(); } catch (e) {}

      if (blankIndex + 1 < item.blanks.length) {
        feedback.className = "be-feedback ok";
        feedback.textContent = "✓ Good — next blank";
        schedule(() => {
          blankIndex++;
          locked = false;
          renderItem();
        }, 620);
      } else {
        feedback.className = "be-feedback ok";
        feedback.textContent = "✓ " + item.full;
        schedule(() => {
          index++;
          blankIndex = 0;
          locked = false;
          renderItem();
        }, 860);
      }
    } else {
      btn.classList.add("wrong");
      feedback.className = "be-feedback bad";
      feedback.textContent = "Try again";
      try { sfxWrong(); } catch (e) {}
      schedule(() => {
        buttons.forEach((b) => {
          b.disabled = false;
          b.classList.remove("wrong");
        });
        locked = false;
        feedback.textContent = "";
        feedback.className = "be-feedback";
      }, 720);
    }
  }

  // ========== FINAL FINISH SCREEN (AFTER PART 3) ==========
  function showFinalFinish() {
    clearPendingTimers();
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: totalCorrect,
        total: Math.max(totalAttempts, 1),
        timeMs: timeMs,
        onAgain: startGame,
        backHref: "../"
      });
      return;
    }
    const stars = calcStars(totalCorrect, Math.max(totalAttempts, 1));
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    app.innerHTML = `<div class="be-topbar"><a class="be-back-btn" href="../">←</a></div>
      <div class="be-done">
        <h1>All 3 parts complete!</h1>
        <p>You scored ${totalCorrect} / ${Math.max(totalAttempts, 1)}.</p>
        <button type="button" class="be-btn" id="be-again">Play again</button>
        <a class="be-btn secondary" href="../">Back to games</a>
      </div>`;
    document.getElementById("be-again").addEventListener("click", startGame);
  }

  // ========== INIT ==========
  showStart();
})();
