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

/**
 * Type the Sentence · be — Starter Unit 1A (Part 2)
 * Same content as Sentence Builder, but scrambled words + typing.
 */
(function () {
  "use strict";

  const GAME_ID = "starter-1a-type-sentences-be";
  const AUDIO = "audio/";
  const PRAISE = ["Perfect!", "Great job!", "Good work!", "Awesome!", "Excellent!", "Well done!"];

  const DATA = {
    positive: {
      label: "Positive",
      icon: "➕",
      desc: "Full form → short form (type the sentence)",
      phases: [
        {
          name: "Full form",
          items: [
            { words: ["I", "am", "Helen."], answer: "I am Helen.", audio: "i-am-helen.mp3" },
            { words: ["You", "are", "Tom."], answer: "You are Tom.", audio: "you-are-tom.mp3" },
          ],
        },
        {
          name: "Short form",
          items: [
            { words: ["I", "'m", "Helen."], answer: "I'm Helen.", audio: "im-helen.mp3" },
            { words: ["You", "'re", "Tom."], answer: "You're Tom.", audio: "youre-tom.mp3" },
          ],
        },
      ],
    },
    negative: {
      label: "Negative",
      icon: "➖",
      desc: "Full form → short form (type the sentence)",
      phases: [
        {
          name: "Full form",
          items: [
            { words: ["I", "am", "not", "Ellen."], answer: "I am not Ellen.", audio: "i-am-not-ellen.mp3" },
            { words: ["You", "are", "not", "Dom."], answer: "You are not Dom.", audio: "you-are-not-dom.mp3" },
          ],
        },
        {
          name: "Short form",
          items: [
            { words: ["I", "'m", "not", "Ellen."], answer: "I'm not Ellen.", audio: "im-not-ellen.mp3" },
            { words: ["You", "aren't", "Dom."], answer: "You aren't Dom.", audio: "you-arent-dom.mp3" },
          ],
        },
      ],
    },
    questions: {
      label: "Questions",
      icon: "❓",
      desc: "Type questions and short answers",
      phases: [
        {
          name: "Questions",
          items: [
            { words: ["Am", "I", "in", "room", "2?"], answer: "Am I in room 2?", audio: "am-i-in-room-2.mp3" },
            { words: ["Are", "you", "Mike?"], answer: "Are you Mike?", audio: "are-you-mike.mp3" },
          ],
        },
        {
          name: "Short answers",
          items: [
            {
              prompt: "Am I in room 2? → Yes",
              words: ["Yes,", "you", "are."],
              answer: "Yes, you are.",
              audio: "yes-you-are.mp3",
            },
            {
              prompt: "Am I in room 2? → No",
              words: ["No,", "you", "aren't."],
              answer: "No, you aren't.",
              audio: "no-you-arent.mp3",
            },
            {
              prompt: "Are you Mike? → Yes",
              words: ["Yes,", "I", "am."],
              answer: "Yes, I am.",
              audio: "yes-i-am.mp3",
            },
            {
              prompt: "Are you Mike? → No",
              words: ["No,", "I", "'m", "not."],
              answer: "No, I'm not.",
              audio: "no-im-not.mp3",
            },
          ],
        },
      ],
    },
  };

  const app = document.getElementById("game-app");
  let modeDone = { positive: false, negative: false, questions: false };
  let mode = null;
  let phaseIndex = 0;
  let itemIndex = 0;
  let locked = false;
  let correctCount = 0;
  let totalCount = 0;
  let audioEl = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // Avoid identical order to answer words when possible
    if (a.length > 1 && a.join(" ") === arr.join(" ")) {
      [a[0], a[a.length - 1]] = [a[a.length - 1], a[0]];
    }
    return a;
  }

  function playAudio(file) {
    if (!file) return Promise.resolve();
    return new Promise((resolve) => {
      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }
      audioEl = new Audio(AUDIO + file);
      audioEl.onended = () => resolve();
      audioEl.onerror = () => resolve();
      audioEl.play().catch(() => resolve());
    });
  }

  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, vol, when) {
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = (when || 0) + ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() {
    tone(520, 0.06, "triangle", 0.08);
  }
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
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, "sine", 0.1, i * 0.07));
  }

  function praise() {
    return PRAISE[Math.floor(Math.random() * PRAISE.length)];
  }

  function totalItemsInMode(m) {
    return DATA[m].phases.reduce((n, p) => n + p.items.length, 0);
  }

  function progressPct() {
    if (!mode) return 0;
    let done = 0;
    for (let i = 0; i < phaseIndex; i++) done += DATA[mode].phases[i].items.length;
    done += itemIndex;
    return Math.round((done / totalItemsInMode(mode)) * 100);
  }

  /** Normalize for comparison: curly quotes, extra spaces, case */
  function normalize(s) {
    return String(s)
      .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function currentItem() {
    return DATA[mode].phases[phaseIndex].items[itemIndex];
  }

  function currentPhase() {
    return DATA[mode].phases[phaseIndex];
  }

  function showStart() {
    mode = null;
    const allDone = modeDone.positive && modeDone.negative && modeDone.questions;
    app.innerHTML = `
      <div class="sb-top">
        <a class="sb-back" href="../" aria-label="Back">←</a>
      </div>
      <div class="sb-start">
        <h1>Type the Sentence</h1>
        <p>Look at the scrambled words and <strong>type</strong> the correct sentence.</p>
        <div class="sb-modes">
          ${["positive", "negative", "questions"]
            .map(
              (key) => `
            <button type="button" class="sb-mode-btn ${modeDone[key] ? "done" : ""}" data-mode="${key}">
              <span class="sb-mode-ico">${DATA[key].icon}</span>
              <div>
                <h3>${DATA[key].label}</h3>
                <span>${DATA[key].desc}</span>
              </div>
            </button>`
            )
            .join("")}
        </div>
        ${
          allDone
            ? `<p style="margin-top:24px;color:var(--sb-green);font-weight:800;">All modes complete! 🎉</p>
               <button type="button" class="sb-btn sb-btn-primary" id="sb-finish-all" style="margin-top:12px;max-width:260px;width:100%;">Finish →</button>`
            : ""
        }
      </div>`;

    app.querySelectorAll(".sb-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => startMode(btn.dataset.mode));
    });
    const fin = document.getElementById("sb-finish-all");
    if (fin) fin.addEventListener("click", showFinalFinish);
  }

  function startMode(m) {
    mode = m;
    phaseIndex = 0;
    itemIndex = 0;
    correctCount = 0;
    totalCount = totalItemsInMode(m);
    locked = false;
    if (window.LAFinish) LAFinish.startTimer();
    renderItem();
  }

  function renderItem() {
    const item = currentItem();
    const phase = currentPhase();
    const scrambled = shuffle(item.words);
    locked = false;

    let promptExtra;
    if (item.prompt) {
      const parts = String(item.prompt).split(/\s*→\s*/);
      const q = parts[0] || item.prompt;
      const hint = parts[1] ? parts[1].trim() : "";
      promptExtra = `
        <div class="sb-prompt-question">
          ${escapeHtml(q)}
          ${hint ? `<span class="sb-q-hint">Answer: ${escapeHtml(hint)}</span>` : ""}
        </div>
        <div class="sb-prompt-label">Type the short answer</div>`;
    } else {
      promptExtra = `<div class="sb-prompt-label">Unscramble and type the sentence</div>`;
    }

    app.innerHTML = `
      <div class="sb-top">
        <a class="sb-back" href="#" id="sb-back-modes" aria-label="Modes">←</a>
        <div class="sb-progress"><span style="width:${progressPct()}%"></span></div>
        <span class="sb-mode-tag">${DATA[mode].label}</span>
      </div>
      <div class="sb-play">
        <div class="sb-phase">${escapeHtml(phase.name)}</div>
        <div class="sb-prompt">
          ${promptExtra}
          <div class="sb-scramble" aria-label="Scrambled words">
            ${scrambled.map((w) => `<span class="sb-scramble-chip">${escapeHtml(w)}</span>`).join("")}
          </div>
          <div class="sb-type-wrap">
            <input type="text" class="sb-type-input" id="sb-input" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Type here…" />
            <div class="sb-type-hint">Use the words above · apostrophes count (I'm, You're, aren't)</div>
          </div>
        </div>
        <div class="sb-actions">
          <button type="button" class="sb-btn sb-btn-ghost" id="sb-clear">Clear</button>
          <button type="button" class="sb-btn sb-btn-primary" id="sb-check">Check ✓</button>
        </div>
      </div>`;

    const input = document.getElementById("sb-input");
    document.getElementById("sb-back-modes").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });
    document.getElementById("sb-clear").addEventListener("click", () => {
      if (locked) return;
      input.value = "";
      input.classList.remove("correct", "wrong");
      input.focus();
      sfxTap();
    });
    document.getElementById("sb-check").addEventListener("click", checkAnswer);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    input.focus();
  }

  function checkAnswer() {
    if (locked) return;
    const item = currentItem();
    const input = document.getElementById("sb-input");
    const checkBtn = document.getElementById("sb-check");
    const typed = input.value;
    if (!typed.trim()) {
      input.focus();
      return;
    }
    locked = true;
    if (checkBtn) checkBtn.disabled = true;

    const ok = normalize(typed) === normalize(item.answer);
    input.classList.remove("correct", "wrong");
    input.classList.add(ok ? "correct" : "wrong");

    if (ok) {
      // Soft-normalize display to canonical answer
      input.value = item.answer;
      correctCount++;
      sfxCorrect();
      playAudio(item.audio).then(() => {
        setTimeout(() => advance(), 280);
      });
    } else {
      sfxWrong();
      setTimeout(() => {
        locked = false;
        input.classList.remove("wrong");
        if (checkBtn) checkBtn.disabled = false;
        input.focus();
        input.select();
      }, 700);
    }
  }

  function advance() {
    itemIndex++;
    const phase = currentPhase();
    if (itemIndex < phase.items.length) {
      renderItem();
      return;
    }
    phaseIndex++;
    itemIndex = 0;
    if (phaseIndex < DATA[mode].phases.length) {
      showCelebrate(praise(), `Now try the ${DATA[mode].phases[phaseIndex].name.toLowerCase()}!`, () => {
        renderItem();
      });
      return;
    }
    modeDone[mode] = true;
    const remaining = ["positive", "negative", "questions"].filter((k) => !modeDone[k]);
    if (remaining.length === 0) {
      showFinalFinish();
      return;
    }
    showCelebrate(praise(), `${DATA[mode].label} complete! Try another mode.`, () => showStart(), remaining[0]);
  }

  function showCelebrate(title, subtitle, onContinue, nextMode) {
    const card = document.createElement("div");
    card.className = "sb-celebrate";
    card.innerHTML = `
      <div class="sb-celebrate-card">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(subtitle)}</p>
        <button type="button" class="sb-btn sb-btn-primary" id="sb-cont" style="width:100%;">
          ${nextMode ? "Continue →" : "Next →"}
        </button>
      </div>`;
    document.body.appendChild(card);
    sfxCelebrate();
    spawnSparkles(card.querySelector(".sb-celebrate-card"));
    document.getElementById("sb-cont").addEventListener("click", () => {
      card.remove();
      onContinue();
    });
  }

  function spawnSparkles(el) {
    const colors = ["#a78bfa", "#f472b6", "#38bdf8", "#fbbf24", "#34d399"];
    for (let i = 0; i < 18; i++) {
      const s = document.createElement("span");
      s.className = "sb-sparkle";
      const angle = (Math.PI * 2 * i) / 18;
      const dist = 60 + Math.random() * 80;
      s.style.setProperty("--sx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--sy", Math.sin(angle) * dist + "px");
      s.style.left = "50%";
      s.style.top = "40%";
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = Math.random() * 0.2 + "s";
      el.appendChild(s);
    }
  }

  function showFinalFinish() {
    const timeMs = window.LAFinish ? LAFinish.stopTimer() : 0;
    if (window.LAFinish) {
      LAFinish.show({
        gameId: GAME_ID,
        score: correctCount || totalCount,
        total: totalCount || 1,
        timeMs: timeMs,
        onAgain: () => {
          modeDone = { positive: false, negative: false, questions: false };
          showStart();
        },
        onModes: () => {
          modeDone = { positive: false, negative: false, questions: false };
          showStart();
        },
        backHref: "../",
      });
      return;
    }
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, 3);
    }
    app.innerHTML = `
      <div class="sb-bridge">
        <h2>All done! 🏆</h2>
        <p>You finished all three modes.</p>
        <button type="button" class="sb-btn sb-btn-primary" id="sb-again">Play again</button>
        <a class="sb-btn sb-btn-ghost" href="../" style="display:block;text-align:center;text-decoration:none;">← Games</a>
      </div>`;
    document.getElementById("sb-again").addEventListener("click", () => {
      modeDone = { positive: false, negative: false, questions: false };
      showStart();
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  showStart();
})();
