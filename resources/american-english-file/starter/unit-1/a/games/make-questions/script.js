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
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
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

/* Make Questions – Starter Unit 1A (strict + celebration) */
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
  // Local aliases used by many games
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  // Auto-play on common feedback class tokens (debounced)
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


  const GAME_ID = "starter-1a-make-questions";
  const ITEMS = [
  {
    "id": 1,
    "prompt": "You're Sam.",
    "answer": "Are you Sam?"
  },
  {
    "id": 2,
    "prompt": "I'm in room 4.",
    "answer": "Am I in room 4?"
  },
  {
    "id": 3,
    "prompt": "You're Silvia.",
    "answer": "Are you Silvia?"
  },
  {
    "id": 4,
    "prompt": "I'm in room 3.",
    "answer": "Am I in room 3?"
  },
  {
    "id": 5,
    "prompt": "You're Mr. Sheyhaki.",
    "answer": "Are you Mr. Sheyhaki?"
  },
  {
    "id": 6,
    "prompt": "I'm a student.",
    "answer": "Am I a student?"
  }
];

  const app = document.getElementById("game-app");
  if (!app) return;

  let index = 0;
  let locked = false;
  let correctAttempts = 0;
  let totalAttempts = 0;

  function clean(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[\u2018\u2019\u0060]/g, "'");
  }

  function isCorrect(user, answer) {
    const u = clean(user);
    if (!u) return false;
    if (!/^[A-Z]/.test(u)) return false;
    if (!u.endsWith("?")) return false;
    return u === answer;
  }

  function feedbackHint(user) {
    const u = clean(user);
    if (!u) return "Type the question.";
    const needsCap = !/^[A-Z]/.test(u);
    const needsQ = !u.endsWith("?");
    if (needsCap && needsQ) return "Start with a capital letter and end with ?";
    if (needsCap) return "Start with a capital letter (Am / Are).";
    if (needsQ) return "Add a question mark (?) at the end.";
    return "Check spelling and word order.";
  }

  function showStart() {
    app.innerHTML = `
      <div class="mq-topbar">
        <a class="mq-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="mq-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="mq-start">
        <h1>Make Questions</h1>
        <p>Change each sentence into a question.<br>Start with a <strong>capital letter</strong> and end with <strong>?</strong></p>
        <button class="mq-btn" id="mq-start-btn">Start</button>
      </div>
    `;
    document.getElementById("mq-start-btn").addEventListener("click", () => {
      index = 0;
      locked = false;
      correctAttempts = 0;
      totalAttempts = 0;
      if (window.LAFinish) LAFinish.startTimer();
      renderItem();
    });
  }

  function renderItem() {
    if (index >= ITEMS.length) {
      showDone();
      return;
    }
    const item = ITEMS[index];
    app.innerHTML = `
      <div class="mq-topbar">
        <a class="mq-back-btn" href="#" id="mq-back" title="Back" aria-label="Back">←</a>
        <span class="mq-topbar-title">Make Questions</span>
        <span class="mq-progress">${index + 1} / ${ITEMS.length}</span>
      </div>
      <div class="mq-card">
        <div class="mq-label">Change to a question</div>
        <p class="mq-prompt">${item.prompt}</p>
        <div class="mq-input-wrap">
          <input class="mq-input" id="mq-input" type="text" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="e.g. Are you…?" />
        </div>
        <button class="mq-check" id="mq-check">Check</button>
        <div class="mq-feedback" id="mq-feedback"></div>
        <div class="mq-hint" id="mq-hint"></div>
      </div>
    `;

    document.getElementById("mq-back").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const input = document.getElementById("mq-input");
    const checkBtn = document.getElementById("mq-check");
    input.focus();

    function submit() {
      if (locked) return;
      const val = input.value;
      if (!val.trim()) {
        input.focus();
        return;
      }
      locked = true;
      checkBtn.disabled = true;
      const feedback = document.getElementById("mq-feedback");
      const hint = document.getElementById("mq-hint");

      totalAttempts++;
      if (isCorrect(val, item.answer)) {
        correctAttempts++;
        input.classList.add("correct");
        feedback.className = "mq-feedback ok";
        feedback.textContent = "✓ " + item.answer;
        hint.textContent = "";
        setTimeout(() => {
          const card = app.querySelector(".mq-card");
          if (card) card.classList.add("mq-leaving");
          setTimeout(() => {
            index++;
            locked = false;
            renderItem();
          }, 220);
        }, 900);
      } else {
        input.classList.add("wrong");
        feedback.className = "mq-feedback no";
        feedback.textContent = "Not quite — try again";
        hint.textContent = feedbackHint(val);
        setTimeout(() => {
          input.classList.remove("wrong");
          feedback.textContent = "";
          locked = false;
          checkBtn.disabled = false;
          input.focus();
          input.select();
        }, 1400);
      }
    }

    checkBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  }

  function spawnConfetti(container) {
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6", "#a3e635"];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("span");
      el.className = "mq-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 0.9) + "s";
      el.style.animationDuration = (2.2 + Math.random() * 1.4) + "s";
      el.style.width = (6 + Math.random() * 8) + "px";
      el.style.height = (8 + Math.random() * 10) + "px";
      el.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      container.appendChild(el);
    }
  }

  function calcStars(correct, total) {
    if (total <= 0) return 0;
    if (correct >= total) return 3;
    if (correct >= total - 1 || correct / total >= 0.8) return 2;
    if (correct >= Math.ceil(total / 2)) return 1;
    return 0;
  }

  function showDone() {
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: correctAttempts,
        total: Math.max(totalAttempts, 1),
        timeMs: timeMs,
        onAgain: () => {
          index = 0;
          locked = false;
          correctAttempts = 0;
          totalAttempts = 0;
          if (window.LAFinish) LAFinish.startTimer();
          renderItem();
        },
        onModes: () => showStart(),
        backHref: "../",
      });
      return;
    }
    // Fallback (should not happen if la-finish.js is loaded)
    const stars = calcStars(correctAttempts, Math.max(totalAttempts, 1));
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
    app.innerHTML = `<div class="mq-topbar"><a class="mq-back-btn" href="../">←</a><span class="mq-topbar-title">Unit 1A · Games</span></div>
      <div class="mq-done"><div class="mq-done-inner"><h1>Done!</h1>
      <p>${correctAttempts}/${totalAttempts} correct tries</p>
      <button class="mq-btn" id="mq-again">Practice again</button></div></div>`;
    document.getElementById("mq-again").addEventListener("click", () => {
      index = 0; locked = false; correctAttempts = 0; totalAttempts = 0; renderItem();
    });
  }

  showStart();
})();
