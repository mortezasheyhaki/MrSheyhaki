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

/* =========================================================
   LISTEN & WRITE — Unit 9A
   Mr. Sheyhaki | American English File Starter
   ========================================================= */

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

// -------------------------------------------------------
  // DATA – Unit 9A (question descriptions)
  // -------------------------------------------------------
  const QUESTIONS = [
    {
      id: 1,
      accepted: [
        "what time do you usually get up",
        "what time do you usually get up?",
      ]
    },
    {
      id: 2,
      accepted: [
        "do you usually feel tired",
        "do you usually feel tired?",
      ]
    },
    {
      id: 3,
      accepted: [
        "do you take a shower or a bath in the morning",
        "do you take a shower or a bath in the morning?",
        "do you take a bath or a shower in the morning",
        "do you take a bath or a shower in the morning?",
      ]
    },
    {
      id: 4,
      accepted: [
        "do you always have breakfast where",
        "do you always have breakfast? where",
        "do you always have breakfast where?",
        "do you always have breakfast? where?",
        "do you always have breakfast",
        "do you always have breakfast?",
      ]
    },
    {
      id: 5,
      accepted: [
        "what do you have for breakfast",
        "what do you have for breakfast?",
      ]
    },
    {
      id: 6,
      accepted: [
        "what time do you go to work",
        "what time do you go to work?",
      ]
    },
    {
      id: 7,
      accepted: [
        "do you usually need to hurry in the morning",
        "do you usually need to hurry in the morning?",
      ]
    },
    {
      id: 8,
      accepted: [
        "do you like mornings why",
        "do you like mornings? why",
        "do you like mornings why?",
        "do you like mornings? why?",
        "do you like mornings",
        "do you like mornings?",
        "do you like morning why",
        "do you like morning? why",
        "do you like morning",
        "do you like morning?",
      ]
    }
  ];

  const DISPLAY_ANSWERS = [
    "What time do you usually get up?",
    "Do you usually feel tired?",
    "Do you take a shower or a bath in the morning?",
    "Do you always have breakfast? Where?",
    "What do you have for breakfast?",
    "What time do you go to work?",
    "Do you usually need to hurry in the morning?",
    "Do you like mornings? Why?"
  ];

  const AUDIO_URL = "audio.mp3";


  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------
  let listensLeft = 3;
  let attemptsLeft = 3;
  let isPlaying = false;
  let boxStates = QUESTIONS.map(() => ({
    submitted: false,
    correct: false,
    locked: false,
    value: ""
  }));

  // -------------------------------------------------------
  // DOM
  // -------------------------------------------------------
  const playBtn        = document.getElementById("playBtn");
  const playIcon       = document.getElementById("playIcon");
  const visualizer     = document.getElementById("visualizer");
  const audioHint      = document.getElementById("audioHint");
  const listensEl      = document.getElementById("listensLeft");
  const attemptsEl     = document.getElementById("attemptsLeft");
  const boxesEl        = document.getElementById("boxes");
  const feedbackEl     = document.getElementById("feedback");
  const continueBtn    = document.getElementById("continueBtn");
  const successOverlay = document.getElementById("successOverlay");
  const successContinue = document.getElementById("successContinue");

  const audio = new Audio(AUDIO_URL);
  audio.preload = "auto";

  // -------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------
  function normalize(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:""]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(userInput, acceptedList) {
    const norm = normalize(userInput);
    if (!norm) return false;
    return acceptedList.some(a => normalize(a) === norm);
  }

  function updateStats() {
    listensEl.textContent = listensLeft;
    attemptsEl.textContent = attemptsLeft;
    audioHint.textContent = listensLeft > 0
      ? `Tap to play · ${listensLeft} listen${listensLeft === 1 ? "" : "s"} left`
      : "No listens left";
  }

  function showFeedback(type, message) {
    feedbackEl.hidden = false;
    feedbackEl.className = "feedback " + type;
    feedbackEl.textContent = message;
  }

  function hideFeedback() {
    feedbackEl.hidden = true;
  }

  function allBoxesCorrect() {
    return boxStates.every(b => b.correct);
  }

  // -------------------------------------------------------
  // RENDER BOXES
  // -------------------------------------------------------
  function renderBoxes() {
    boxesEl.innerHTML = "";

    QUESTIONS.forEach((q, i) => {
      const state = boxStates[i];
      const row = document.createElement("div");
      row.className = "box-row";
      if (state.correct) row.classList.add("correct", "locked");
      if (state.submitted && !state.correct) row.classList.add("wrong");

      const num = document.createElement("div");
      num.className = "box-number";
      num.textContent = String(i + 1);

      const input = document.createElement("input");
      input.className = "box-input";
      input.type = "text";
      input.placeholder = "Write question " + (i + 1) + "...";
      input.dataset.index = String(i);
      input.autocomplete = "off";
      input.spellcheck = false;
      // Set via property so the typed answer always stays visible
      input.value = state.value || "";
      if (state.locked) input.disabled = true;

      const btn = document.createElement("button");
      btn.className = "submit-btn";
      if (state.correct) btn.classList.add("correct");
      if (state.submitted && !state.correct) btn.classList.add("wrong");
      btn.type = "button";
      btn.dataset.index = String(i);
      btn.setAttribute("aria-label", "Submit answer " + (i + 1));
      btn.textContent = state.correct ? "✓" : "✓";
      if (state.locked) btn.disabled = true;

      row.appendChild(num);
      row.appendChild(input);
      row.appendChild(btn);
      boxesEl.appendChild(row);

      input.addEventListener("input", onInputChange);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          submitBox(i);
        }
      });
      btn.addEventListener("click", function () {
        submitBox(i);
      });
    });
  }

  function onInputChange(e) {
    const idx = parseInt(e.target.dataset.index, 10);
    boxStates[idx].value = e.target.value;
    if (boxStates[idx].submitted && !boxStates[idx].correct) {
      boxStates[idx].submitted = false;
      renderBoxes();
    }
  }

  // -------------------------------------------------------
  // SUBMIT ONE BOX
  // -------------------------------------------------------
  function submitBox(index) {
    const state = boxStates[index];
    if (state.locked || attemptsLeft <= 0) return;

    const input = boxesEl.querySelector(`.box-input[data-index="${index}"]`);
    const value = (input?.value || state.value || "").trim();

    if (!value) {
      showFeedback("info", "Please write something first.");
      return;
    }

    state.value = value;
    state.submitted = true;

    const correct = isCorrect(value, QUESTIONS[index].accepted);

    if (correct) {
      state.correct = true;
      state.locked = true;
      hideFeedback();
      renderBoxes();

      if (allBoxesCorrect()) {
        try { __saveLAStarsFromLaw(100); } catch (e) {}
        setTimeout(() => {
          successOverlay.classList.add("is-visible");
        }, 350);
      }
    } else {
      attemptsLeft--;
      updateStats();
      renderBoxes();

      if (attemptsLeft <= 0) {
        revealAnswers();
      } else {
        showFeedback("error", `Not quite. Try again! (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left)`);
      }
    }
  }

  // -------------------------------------------------------
  // REVEAL ANSWERS (after 3 fails)
  // -------------------------------------------------------
  function revealAnswers() {
    try {
      var ok = boxStates.filter(function(b){ return b.correct; }).length;
      var tot = boxStates.length || 1;
      __saveLAStarsFromLaw(Math.round(ok / tot * 100));
    } catch (e) {}
    boxStates.forEach(b => { b.locked = true; });

    let html = `<div class="reveal-list">`;
    QUESTIONS.forEach((q, i) => {
      const user = boxStates[i].value.trim() || "(empty)";
      const isOk = boxStates[i].correct;
      html += `
        <div class="reveal-item">
          <span class="num">${i + 1}.</span>
          ${isOk
            ? `<span class="correct-ans">${DISPLAY_ANSWERS[i]}</span>`
            : `<span class="user-ans">${escapeHtml(user)}</span>
               <span class="correct-ans">→ ${DISPLAY_ANSWERS[i]}</span>`
          }
        </div>
      `;
    });
    html += `</div>`;

    feedbackEl.hidden = false;
    feedbackEl.className = "feedback error";
    feedbackEl.innerHTML = `
      <strong>No attempts left.</strong><br>
      Here are the correct answers:
      ${html}
    `;

    continueBtn.hidden = false;
    playBtn.disabled = true;
    renderBoxes();
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // -------------------------------------------------------
  // AUDIO PLAYBACK + VISUALIZER
  // -------------------------------------------------------
  function setPlayingUI(playing) {
    isPlaying = playing;
    if (playing) {
      playIcon.hidden = true;
      visualizer.hidden = false;
      playBtn.classList.add("playing");
    } else {
      playIcon.hidden = false;
      visualizer.hidden = true;
      playBtn.classList.remove("playing");
    }
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying || listensLeft <= 0 || attemptsLeft <= 0) return;

    listensLeft--;
    updateStats();

    if (listensLeft <= 0) {
      playBtn.disabled = true;
    }

    setPlayingUI(true);
    audio.currentTime = 0;
    audio.play().catch(() => {
      setPlayingUI(false);
      showFeedback("error", "Could not play audio. Check your connection.");
    });
  });

  audio.addEventListener("ended", () => {
    setPlayingUI(false);
  });

  audio.addEventListener("error", () => {
    setPlayingUI(false);
    showFeedback("error", "Audio failed to load.");
  });

  // -------------------------------------------------------
// CONTINUE BUTTONS
// -------------------------------------------------------
continueBtn.addEventListener("click", () => {
  window.location.href = "../";   // Unit 6A games
});

successContinue.addEventListener("click", () => {
  window.location.href = "../";   // Unit 6A games
});

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function __saveLAStarsFromLaw(acc) {
    try {
      if (window.LAStars) {
        LAStars.recordPlay("starter-6a-listen-and-write");
        LAStars.saveFromAccuracy("starter-6a-listen-and-write", acc);
      }
    } catch (e) {}
  }

  function init() {
    updateStats();
    renderBoxes();
  }

  init();
})();
