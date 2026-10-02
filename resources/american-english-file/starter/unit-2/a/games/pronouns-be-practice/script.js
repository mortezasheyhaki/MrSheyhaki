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

/* Pronouns + be – 3 parts (a, b, c) · AEF Starter */
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


  const GAME_ID = "starter-2a-pronouns-be-practice";

  // —— Part A: Change bold words to a pronoun ——
  const PART_A = [
    {
      prompt: "Diana and I are in room 4.",
      blank: "______'re in room 4.",
      answers: ["we"],
      display: "We",
    },
    {
      prompt: "The Taj Mahal is in India.",
      blank: "______'s in India.",
      answers: ["it"],
      display: "It",
    },
    {
      prompt: "Are Mark and James in Mexico?",
      blank: "Are ______ in Mexico?",
      answers: ["they"],
      display: "they",
    },
    {
      prompt: "Where is Rosa from?",
      blank: "Where's ______ from?",
      answers: ["she"],
      display: "she",
    },
    {
      prompt: "Mira and Rita are Brazilian.",
      blank: "______'re Brazilian.",
      answers: ["they"],
      display: "They",
    },
    {
      prompt: "Paul isn't in the hotel.",
      blank: "______ isn't in the hotel.",
      answers: ["he"],
      display: "He",
    },
    {
      prompt: "You and Sara are in class 2.",
      blank: "______'re in class 2.",
      answers: ["you"],
      display: "You",
    },
    {
      prompt: "Jim and I are from the US.",
      blank: "______'re from the US.",
      answers: ["we"],
      display: "We",
    },
    {
      prompt: "Honda and Toyota are Japanese.",
      blank: "______'re Japanese.",
      answers: ["they"],
      display: "They",
    },
  ];

  // —— Part B: Make + − ? with we / you / they ——
  const PART_B = [
    {
      cue: "Ana and I / Mexican",
      type: "−",
      answers: [
        "we aren't mexican",
        "we're not mexican",
        "we are not mexican",
        "we aren't mexicans",
        "we're not mexicans",
      ],
      display: "We aren't Mexican.",
    },
    {
      cue: "You, Max, and John / in class 4",
      type: "+",
      answers: [
        "you're in class 4",
        "you are in class 4",
      ],
      display: "You're in class 4.",
    },
    {
      cue: "Mike and Peter / English",
      type: "?",
      answers: [
        "are they english",
        "are they english?",
      ],
      display: "Are they English?",
    },
    {
      cue: "Linda and I / in class 4",
      type: "?",
      answers: [
        "are we in class 4",
        "are we in class 4?",
      ],
      display: "Are we in class 4?",
    },
    {
      cue: "You and Lucy / in class 4",
      type: "−",
      answers: [
        "you aren't in class 4",
        "you're not in class 4",
        "you are not in class 4",
      ],
      display: "You aren't in class 4.",
    },
    {
      cue: "Lucy and I / on vacation",
      type: "+",
      answers: [
        "we're on vacation",
        "we are on vacation",
      ],
      display: "We're on vacation.",
    },
  ];

  // —— Part C: Complete the conversation (one blank at a time) ——
  const PART_C = [
    {
      context: "A ______ you from the US?\nB No, we ______ American. We ______ English.",
      blanks: [
        { answers: ["are"], display: "Are" },
        { answers: ["aren't", "are not", "'re not"], display: "aren't" },
        { answers: ["'re", "are"], display: "'re" },
      ],
      // We'll present as 3 sequential items for simplicity
    },
  ];

  // Flatten part C into sequential items with full context shown
  const PART_C_ITEMS = [
    {
      prompt: "A ______ you from the US?",
      hint: "B No, we ______ American. We ______ English.",
      type: "?",
      answers: ["are"],
      display: "Are",
    },
    {
      prompt: "A Are you from the US?\nB No, we ______ American. We ______ English.",
      type: "−",
      answers: ["aren't","are not","'re not"],
      display: "aren't",
    },
    {
      prompt: "A Are you from the US?\nB No, we aren't American. We ______ English.",
      type: "+",
      answers: ["'re","are"],
      display: "'re",
    },
    {
      prompt: "A ______ they Mexican?",
      hint: "B Yes, they ______. They ______ from Mexico City.",
      type: "?",
      answers: ["are"],
      display: "Are",
    },
    {
      prompt: "A Are they Mexican?\nB Yes, they ______. They ______ from Mexico City.",
      type: "+",
      answers: ["are"],
      display: "are",
    },
    {
      prompt: "A Are they Mexican?\nB Yes, they are. They ______ from Mexico City.",
      type: "+",
      answers: ["'re","are"],
      display: "'re",
    },
    {
      prompt: "Kareem is from Riyadh. He ______ from Jeddah.",
      type: "−",
      answers: ["isn't","is not","'s not"],
      display: "isn't",
    },
    {
      prompt: "Sorry, you ______ in room 20. You're in room 22.",
      type: "−",
      answers: ["aren't","are not","'re not"],
      display: "aren't",
    },
    {
      prompt: "A ______ your name Maria?",
      hint: "B No, it ______ Maria. It ______ Marta.",
      type: "?",
      answers: ["is"],
      display: "Is",
    },
    {
      prompt: "A Is your name Maria?\nB No, it ______ Maria. It ______ Marta.",
      type: "−",
      answers: ["isn't","is not","'s not"],
      display: "isn't",
    },
    {
      prompt: "A Is your name Maria?\nB No, it isn't Maria. It ______ Marta.",
      type: "+",
      answers: ["'s","is"],
      display: "'s",
    },
    {
      prompt: "A ______ we late?",
      hint: "B Yes, you ______. It ______ 9:30!",
      type: "?",
      answers: ["are"],
      display: "Are",
    },
    {
      prompt: "A Are we late?\nB Yes, you ______. It ______ 9:30!",
      type: "+",
      answers: ["are"],
      display: "are",
    },
    {
      prompt: "A Are we late?\nB Yes, you are. It ______ 9:30!",
      type: "+",
      answers: ["'s","is"],
      display: "'s",
    },
    {
      prompt: "I ______ Sara Smith. I'm Sara Simpson.",
      type: "−",
      answers: ["'m not","am not"],
      display: "'m not",
    },
    {
      prompt: "They ______ from New York. They're from Texas.",
      type: "−",
      answers: ["aren't","are not","'re not"],
      display: "aren't",
    },
    {
      prompt: "A Where's Laura from?\nB She ______ from Recife.",
      type: "+",
      answers: ["'s","is"],
      display: "'s",
    },
    {
      prompt: "A Where's Laura from?\nB She's from Recife.\nA ______ Recife in Brazil?",
      type: "?",
      answers: ["is"],
      display: "Is",
    },
    {
      prompt: "A Where's Laura from?\nB She's from Recife.\nA Is Recife in Brazil?\nB Yes, it ______.",
      type: "+",
      answers: ["is"],
      display: "is",
    }
  ];

  const PARTS = [
    { id: "a", title: "A · Pronouns", tip: "Change the bold words to a pronoun.", items: PART_A },
    { id: "b", title: "B · + − ?", tip: "Make +, −, or ? sentences with we, you, or they.", items: PART_B },
    { id: "c", title: "C · Conversations", tip: "Complete the conversation. Use contractions where possible.", items: PART_C_ITEMS },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let phase = "menu";
  let index = 0;
  let correctCount = 0;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let partScores = [0, 0, 0];

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!]/g, "")
      .replace(/\s+/g, " ")
      .replace(/'/g, "'")
      .replace(/'/g, "'");
  }

  function isCorrect(user, answers) {
    const n = normalize(user);
    if (!n) return false;
    return answers.some((a) => normalize(a) === n);
  }

  function startPart(pi) {
    if (window.LAFinish) LAFinish.startTimer();
    partIndex = pi;
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
  }

  function currentItems() {
    return PARTS[partIndex].items;
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = currentItems()[index];
    lastCorrect = isCorrect(val, item.answers);
    if (lastCorrect) { try{sfxCorrect();}catch(e){}
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render();
      setTimeout(() => nextItem(), 900);
    } else {
      answered = false;
      phase = "tryagain";
      render();
    }
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    render();
    setTimeout(() => nextItem(), 900);
  }

  function nextItem() {
    const items = currentItems();
    if (index < items.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
    } else {
      partScores[partIndex] = correctCount;
      if (partIndex < PARTS.length - 1) {
        if (window.ArcadeFX && partIndex === Math.floor(PARTS.length / 2) - 1) ArcadeFX.cheer(0, 2, "Part " + (partIndex + 1) + " complete — halfway there!");
        phase = "continue";
        render();
      } else {
        phase = "done";
        render();
      }
    }
  }

  function calcStars() {
    const total = partScores.reduce((a, b) => a + b, 0);
    const max = PARTS.reduce((a, p) => a + p.items.length, 0);
    if (total >= max - 2) return 3;
    if (total >= Math.ceil(max * 0.65)) return 2;
    if (total >= Math.ceil(max * 0.4)) return 1;
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
    const items = currentItems();
    const total = items.length;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="lw-track" aria-hidden="true">
        <div class="lw-track-fill" style="width:${fill}%"></div>
      </div>
      <div class="lw-scoreline">
        <span class="lw-score">${correctCount} correct</span>
        <span class="lw-step">${index + 1} / ${total}</span>
      </div>`;
  }

  function renderPlayA(item) {
    return `
      <p class="lw-prompt">${item.prompt}</p>
      <p class="lw-blank-line">${item.blank.replace("______", "<span class='lw-gap'>____</span>")}</p>
      <div class="lw-input-wrap">
        <input type="text" id="lw-input" class="lw-input" placeholder="Type the pronoun…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>`;
  }

  function renderPlayB(item) {
    const typeLabel = item.type === "+" ? "Positive (+)" : item.type === "−" ? "Negative (−)" : "Question (?)";
    return `
      <p class="lw-type-badge">${typeLabel}</p>
      <p class="lw-prompt">${item.cue}</p>
      <div class="lw-input-wrap">
        <input type="text" id="lw-input" class="lw-input" placeholder="Write the full sentence…" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false">
      </div>`;
  }

  function renderPlayC(item) {
    const typeLabel = item.type === "+" ? "Positive (+)" : item.type === "−" ? "Negative (−)" : item.type === "?" ? "Question (?)" : "";
    const promptHtml = (item.prompt || "").replace(/\n/g, "<br>");
    const hintHtml = item.hint ? item.hint.replace(/\n/g, "<br>") : "";
    return `
      ${typeLabel ? `<p class="lw-type-badge">${typeLabel}</p>` : ""}
      <p class="lw-label-main">Your sentence</p>
      <p class="lw-prompt lw-conv">${promptHtml}</p>
      ${hintHtml ? `<p class="lw-label-ctx">Also in this dialogue</p><p class="lw-hint-line">${hintHtml}</p>` : ""}
      <div class="lw-input-wrap">
        <input type="text" id="lw-input" class="lw-input" placeholder="Fill the blank…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Pronouns & be</span>
          <span class="lw-badge">Practice</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">✍️</div>
          <h1>Pronouns & be</h1>
          <p class="lw-desc">Three parts · pronouns, + − ?, conversations</p>
          <div class="lw-mode-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="lw-mode-card" data-part="${i}">
                <span class="lw-mode-num">${String.fromCharCode(65 + i)}</span>
                <div>
                  <strong>${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".lw-mode-card").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    if (phase === "continue") {
      const part = PARTS[partIndex];
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">👍</div>
          <h1>Part ${String.fromCharCode(65 + partIndex)} complete</h1>
          <p>You got <strong>${correctCount} / ${part.items.length}</strong> correct.</p>
          <p class="lw-desc">Continue to Part ${String.fromCharCode(66 + partIndex)}?</p>
          <button type="button" class="lw-btn" id="lw-yes">Yes, continue →</button>
          <button type="button" class="lw-btn secondary" id="lw-stop">Finish here</button>
        </section>`;
      document.getElementById("lw-yes").onclick = () => startPart(partIndex + 1);
      document.getElementById("lw-stop").onclick = () => {
        phase = "done";
        render();
      };
      return;
    }

    if (phase === "done") {
      const total = partScores.reduce((a, b) => a + b, 0);
      const max = PARTS.reduce((a, p) => a + p.items.length, 0);
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: total,
          total: max,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(0),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = () => startPart(0);
      return;
    }

    const part = PARTS[partIndex];
    const items = currentItems();
    const item = items[index];
    const progress = (index + 1) + " / " + items.length;

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback is-wrong">
          <div class="lw-fb-icon">❌</div>
          <p class="lw-fb-msg">Try again</p>
          <p class="lw-fb-hint">You wrote: <em>${lastUserInput || "—"}</em></p>
          <button type="button" class="lw-btn" id="lw-retry">Try again</button>
        </section>`;
      document.getElementById("lw-retry").onclick = () => {
        answered = false;
        lastUserInput = "";
        phase = "play";
        render();
      };
      return;
    }

    if (phase === "feedback") {
      const msg = lastSkipped
        ? `Answer: <strong>${item.display}</strong>`
        : `Correct! <strong>${item.display}</strong>`;
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback ${lastCorrect ? "is-correct" : "is-wrong"}">
          <div class="lw-fb-icon">${lastCorrect ? "✅" : "➡️"}</div>
          <p class="lw-fb-msg">${msg}</p>
        </section>`;
      return;
    }

    // play
    let body = "";
    if (part.id === "a") body = renderPlayA(item);
    else if (part.id === "b") body = renderPlayB(item);
    else body = renderPlayC(item);

    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">${part.title}</span>
        <span class="lw-progress">${progress}</span>
      </header>
      ${progressHTML()}
      <section class="lw-play-area">
        <p class="lw-instruction">${part.tip}</p>
        ${body}
        <div class="lw-actions">
          <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
          <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
        </div>
      </section>`;
    const input = document.getElementById("lw-input");
    const checkBtn = document.getElementById("lw-check");
    if (input) {
      input.focus();
      input.oninput = () => { checkBtn.disabled = !input.value.trim(); };
      input.onkeydown = (e) => {
        if (e.key === "Enter" && input.value.trim()) checkAnswer();
      };
    }
    checkBtn.onclick = checkAnswer;
    document.getElementById("lw-skip").onclick = skipAnswer;
  }

  render();
})();
