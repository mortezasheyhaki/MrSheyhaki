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

/* Complete the Conversations – Enhanced UI & Logic */
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


  const GAME_ID = "starter-1a-complete-conversations";
  const PARTS = [
    {
      id: "a",
      title: "Part A",
      instruction: "Complete the conversation with I or you.",
      scene: "Classroom",
      emoji: "🏫",
      image: "images/classroom.jpg",
      options: ["I", "you"],
      lines: [
        { speaker: "Miranda", parts: [
          { text: "Hi, " },
          { blank: false, value: "I", num: 1 },
          { text: "'m Miranda. Are " },
          { blank: true, answer: "you", num: 2 },
          { text: " Monica?" },
        ]},
        { speaker: "Sally", parts: [
          { text: "No, " },
          { blank: true, answer: "I", num: 3 },
          { text: "'m not, " },
          { blank: true, answer: "I", num: 4 },
          { text: "'m Sally." },
        ]},
        { speaker: "Miranda", parts: [
          { text: "Nice to meet " },
          { blank: true, answer: "you", num: 5 },
          { text: "!" },
        ]},
      ],
    },
    {
      id: "b",
      title: "Part B",
      instruction: "Complete the conversation with am, 'm, are, or 're.",
      scene: "Information desk",
      emoji: "ℹ️",
      image: "images/information.jpg",
      options: ["am", "'m", "are", "'re"],
      lines: [
        { speaker: "Student", parts: [
          { text: "Excuse me, " },
          { blank: false, value: "am", num: 1 },
          { text: " I in room 2?" },
        ]},
        { speaker: "Receptionist", parts: [
          { text: "What's your name?" },
        ]},
        { speaker: "Student", parts: [
          { text: "I " },
          { blank: true, answer: "'m", num: 2 },
          { text: " Caroline." },
        ]},
        { speaker: "Receptionist", parts: [
          { blank: true, answer: "Are", num: 3 },
          { text: " you Caroline Herzog?" },
        ]},
        { speaker: "Student", parts: [
          { text: "No, I " },
          { blank: true, answer: "'m", num: 4 },
          { text: " not. I " },
          { blank: true, answer: "'m", num: 5 },
          { text: " Caroline Fuchs." },
        ]},
        { speaker: "Receptionist", parts: [
          { text: "You " },
          { blank: true, answer: "'re", num: 6 },
          { text: " in room 3." },
        ]},
        { speaker: "Student", parts: [
          { text: "Thank you." },
        ]},
      ],
    },
    {
      id: "c",
      title: "Part C",
      instruction: "Complete the conversation.",
      scene: "Airport",
      emoji: "✈️",
      image: "images/airport.jpg",
      options: ["I", "you", "am", "'m", "are", "'re"],
      lines: [
        { speaker: "Charlotte", parts: [
          { text: "Are " },
          { blank: false, value: "you", num: 1 },
          { text: " Paolo Galli?" },
        ]},
        { speaker: "Paolo", parts: [
          { text: "Yes, I " },
          { blank: true, answer: "am", num: 2 },
          { text: "." },
        ]},
        { speaker: "Charlotte", parts: [
          { text: "Hi, " },
          { blank: true, answer: "I", num: 3 },
          { text: "'m Charlotte from the Dover School of English." },
        ]},
        { speaker: "Paolo", parts: [
          { text: "Oh, hello!" },
        ]},
        { speaker: "Charlotte", parts: [
          { text: "Nice to meet " },
          { blank: true, answer: "you", num: 4 },
          { text: "." },
        ]},
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start";
  let partIndex = 0;
  let answers = {};
  let checked = false;
  let partScores = [];

  function currentPart() {
    return PARTS[partIndex];
  }

  function blanksIn(part) {
    const list = [];
    part.lines.forEach((line) => {
      line.parts.forEach((p) => {
        if (p.blank) list.push(p);
      });
    });
    return list;
  }

  function normalize(s) {
    return String(s || "").trim().toLowerCase().replace(/[’]/g, "'");
  }

  function isCorrect(user, answer) {
    return normalize(user) === normalize(answer);
  }

  function scorePart(part) {
    const blanks = blanksIn(part);
    let correct = 0;
    blanks.forEach((b) => {
      const key = part.id + "-" + b.num;
      if (isCorrect(answers[key], b.answer)) correct++;
    });
    return { correct, total: blanks.length };
  }

  function startPart(i) {
    partIndex = i;
    checked = false;
    const part = PARTS[i];
    blanksIn(part).forEach((b) => {
      const key = part.id + "-" + b.num;
      if (answers[key] === undefined) answers[key] = "";
    });
    mode = "play";
    render();
  }

  function checkPart() {
    if (checked) return;
    const part = currentPart();
    const blanks = blanksIn(part);
    const missing = blanks.some((b) => !String(answers[part.id + "-" + b.num] || "").trim());
    if (missing) {
      const fb = document.getElementById("cc-fb");
      if (fb) {
        fb.textContent = "Please fill in all blanks before submitting.";
        fb.className = "cc-fb bad";
      }
      return;
    }
    checked = true;
    const sc = scorePart(part);
    partScores[partIndex] = sc;
    try { if (sc.correct === sc.total) sfxCorrect(); else if (sc.correct > 0) sfxCorrect(); else sfxWrong(); } catch(e) {}
    render();
    setTimeout(() => {
      mode = "part-result";
      render();
    }, sc.correct === sc.total ? 900 : 1200);
  }

  function nextAfterPart() {
    if (partIndex < PARTS.length - 1) {
      startPart(partIndex + 1);
    } else {
      mode = "result";
      render();
    }
  }

  function renderDialogue(part, interactive) {
    return part.lines
      .map((line) => {
        const html = line.parts
          .map((p) => {
            if (p.blank === false) {
              const num = p.num ? `<sup class="cc-num">${p.num}</sup>` : "";
              return `${num}<span class="cc-given">${escapeHtml(p.value)}</span>`;
            }
            if (!p.blank) {
              return escapeHtml(p.text);
            }
            const key = part.id + "-" + p.num;
            const val = answers[key] || "";
            const num = p.num ? `<sup class="cc-num">${p.num}</sup>` : "";
            if (!interactive) {
              const ok = isCorrect(val, p.answer);
              return `${num}<span class="cc-answer ${ok ? "ok" : "bad"}">${escapeHtml(val || "—")}</span>`;
            }
            if (checked) {
              const ok = isCorrect(val, p.answer);
              return `${num}<span class="cc-blank ${ok ? "ok" : "bad"}" data-key="${key}">${escapeHtml(val)}</span>`;
            }
            return `${num}<input type="text" class="cc-input" data-key="${key}" value="${escapeAttr(val)}" maxlength="6" autocomplete="off" spellcheck="false" aria-label="blank ${p.num}" />`;
          })
          .join("");
        return `
          <div class="cc-line">
            <span class="cc-speaker">${escapeHtml(line.speaker)}</span>
            <span class="cc-text">${html}</span>
          </div>`;
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function bindInputs() {
    const inputs = () => Array.from(document.querySelectorAll(".cc-input"));

    document.querySelectorAll(".cc-input").forEach((input) => {
      input.addEventListener("input", () => {
        answers[input.dataset.key] = input.value;
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkPart();
        }
      });
      // Tap a blank to select it (mobile-friendly)
      input.addEventListener("focus", () => {
        input.select();
      });
    });

    function fillBlank(input, val) {
      if (!input || checked) return;
      input.value = val;
      answers[input.dataset.key] = val;
      input.dispatchEvent(new Event("input"));
    }

    function nextEmptyAfter(from) {
      const list = inputs();
      const start = from ? list.indexOf(from) + 1 : 0;
      for (let i = start; i < list.length; i++) {
        if (!list[i].value.trim()) return list[i];
      }
      // wrap: any empty before
      for (let i = 0; i < start && i < list.length; i++) {
        if (!list[i].value.trim()) return list[i];
      }
      return null;
    }

    function firstEmpty() {
      return inputs().find((el) => !el.value.trim()) || null;
    }

    document.querySelectorAll(".cc-chip").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        e.preventDefault();
        if (checked) return;
        const val = chip.dataset.val;
        const focused = document.activeElement;
        let target = null;

        if (focused && focused.classList && focused.classList.contains("cc-input")) {
          // Always fill the focused blank (replace if already filled)
          target = focused;
        } else {
          // No focus → fill first empty blank
          target = firstEmpty();
        }

        if (!target) {
          // All filled: replace the last input so chips still do something
          const list = inputs();
          target = list[list.length - 1] || null;
        }

        if (!target) return;

        fillBlank(target, val);

        // Move focus to next empty blank (or stay if none left)
        const next = nextEmptyAfter(target);
        if (next) {
          next.focus();
        } else {
          target.blur();
        }
      });
    });
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="cc-topbar">
          <a class="cc-back" href="../" aria-label="Back">←</a>
          <span class="cc-title">Complete the Conversations</span>
          <span class="cc-badge">Unit 1A</span>
        </header>
        <section class="cc-start">
          <div class="cc-hero">💬</div>
          <h1>Complete the Conversations</h1>
          <p class="cc-desc">Practice introductions with <strong>I</strong>, <strong>you</strong>, and the verb <strong>be</strong>.<br>Fill in the blanks using the word bank.</p>
          <button type="button" class="cc-btn" id="cc-start">Start Activity</button>
        </section>`;
      document.getElementById("cc-start").onclick = () => {
        answers = {};
        partScores = [];
        if (window.LAFinish) LAFinish.startTimer();
        startPart(0);
      };
      return;
    }

    if (mode === "part-result") {
      const part = currentPart();
      const sc = partScores[partIndex] || scorePart(part);
      const perfect = sc.correct === sc.total;
      app.innerHTML = `
        <header class="cc-topbar">
          <a class="cc-back" href="../" aria-label="Back">←</a>
          <span class="cc-title">${part.title} Review</span>
          <span class="cc-badge">${sc.correct}/${sc.total}</span>
        </header>
        <section class="cc-done">
          <div class="cc-trophy">${perfect ? "🎉" : "👍"}</div>
          <h1>${perfect ? "Great Work!" : "Part Completed!"}</h1>
          <p>You scored <strong>${sc.correct}</strong> out of <strong>${sc.total}</strong></p>
          <div class="cc-dialogue">
            ${renderDialogue(part, false)}
          </div>
          <button type="button" class="cc-btn" id="cc-next">
            ${partIndex < PARTS.length - 1 ? "Next Part →" : "View Final Results"}
          </button>
        </section>`;
      document.getElementById("cc-next").onclick = nextAfterPart;
      return;
    }

    if (mode === "result") {
      const totalC = partScores.reduce((s, p) => s + (p ? p.correct : 0), 0);
      const totalT = partScores.reduce((s, p) => s + (p ? p.total : 0), 0);
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalC,
          total: Math.max(totalT, 1),
          timeMs: timeMs,
          onAgain: () => {
            answers = {};
            partScores = [];
            if (window.LAFinish) LAFinish.startTimer();
            startPart(0);
          },
          onModes: () => {
            mode = "start";
            render();
          },
          backHref: "../",
        });
        return;
      }
      const stars = totalC === totalT ? 3 : totalC >= totalT - 2 ? 2 : totalC >= Math.ceil(totalT / 2) ? 1 : 0;
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
      app.innerHTML = `<header class="cc-topbar"><a class="cc-back" href="../">←</a><span class="cc-title">Activity Complete</span></header>
        <section class="cc-done"><h1>Done!</h1><p>${totalC} / ${totalT}</p>
        <button type="button" class="cc-btn" id="cc-again">Try Again</button></section>`;
      document.getElementById("cc-again").onclick = () => { mode = "start"; render(); };
      return;
    }

    const part = currentPart();
    const chips = part.options
      .map((o) => `<button type="button" class="cc-chip" data-val="${escapeAttr(o)}">${escapeHtml(o)}</button>`)
      .join("");

    const photoCard = part.image
      ? `<div class="cc-card cc-card-photo" id="cc-photo-card">
           <span class="cc-card-num">${escapeHtml(part.id)}</span>
           <img class="cc-photo" src="${part.image}" alt="${escapeAttr(part.scene)}"
                onerror="document.getElementById('cc-photo-card')?.remove();" />
         </div>`
      : "";

    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="../" aria-label="Back">←</a>
        <div class="cc-topbar-center">
          <span class="cc-kicker">STARTER · UNIT 1A</span>
          <span class="cc-title">${escapeHtml(part.title)}</span>
        </div>
        <span class="cc-badge">${partIndex + 1}/${PARTS.length}</span>
      </header>

      <p class="cc-instruction-bar">${escapeHtml(part.instruction)}</p>

      <div class="cc-scroll">
        ${photoCard}

        <div class="cc-card cc-card-dialogue">
          <div class="cc-dialogue" id="cc-dialogue">
            ${renderDialogue(part, true)}
          </div>
        </div>

        <div class="cc-card cc-card-chips">
          <div class="cc-chips" aria-label="Word selection bank">
            ${chips}
          </div>
          <div class="cc-fb" id="cc-fb" aria-live="polite"></div>
          <button type="button" class="cc-btn cc-btn-check" id="cc-check" ${checked ? "disabled" : ""}>Check</button>
        </div>
      </div>
    `;

    bindInputs();
    document.getElementById("cc-check").onclick = checkPart;

    const first = document.querySelector(".cc-input");
    if (first) setTimeout(() => first.focus(), 100);
  }

  render();
})();