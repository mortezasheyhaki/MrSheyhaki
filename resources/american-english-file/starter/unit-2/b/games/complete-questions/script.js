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
    snd: (function () {
      var lastT = 0;
      return {
        tap: function () { var n = Date.now(); if (n - lastT < 60) return; lastT = n; tone(880, 0.05, "sine", 0.06, 0); tone(1320, 0.04, "sine", 0.03, 0.02); },
        correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "triangle", 0.09, i * 0.07); }); tone(2093, 0.3, "sine", 0.03, 0.3); },
        wrong: function () { tone(311, 0.14, "sine", 0.09, 0); tone(233, 0.22, "triangle", 0.08, 0.1); },
        celebrate: function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.09, i * 0.08); }); tone(392, 0.7, "sine", 0.06, 0.1); }
      };
    })(),
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
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("button, [role=button], .mc-left-item, .mc-right-item") : null;
      if (t && !t.disabled) api.snd.tap();
    }, true);
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Complete the Questions · 3 parts · Unit 2B */
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
  function sfxTap() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () { tone(520, 0.06, "triangle", 0.08); })(); }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  })(); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  })(); }
  function sfxCelebrate() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  })(); }
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


  const GAME_ID = "starter-2b-complete-questions";

  const PART1 = [
    {
      id: "1a",
      after: "'s the concert?",
      answer: "On Tuesday at 7:30.",
      accept: ["when"],
      model: "When",
    },
    {
      id: "1b",
      after: " is it?",
      answer: "Chicago.",
      accept: ["where"],
      model: "Where",
    },
    {
      id: "2",
      after: "'s your name?",
      answer: "Jessica.",
      accept: ["what"],
      model: "What",
    },
    {
      id: "3a",
      after: " is she?",
      answer: "She's my friend, Julia.",
      accept: ["who"],
      model: "Who",
    },
    {
      id: "3b",
      after: "'s she from?",
      answer: "Mexico.",
      accept: ["where"],
      model: "Where",
    },
    {
      id: "4",
      after: "'s your email?",
      answer: "It's jbl098@yoohoo.com.",
      accept: ["what"],
      model: "What",
    },
    {
      id: "5a",
      after: "'s that?",
      answer: "My brother Adrian.",
      accept: ["who"],
      model: "Who",
    },
    {
      id: "5b",
      after: " is he?",
      answer: "He's 25.",
      accept: ["how old", "howold"],
      model: "How old",
    },
  ];

  // Part 2 – unscramble words into a question
  const PART2 = [
    {
      id: "p2-1",
      words: ["she", "who", "is"],
      correct: ["who", "is", "she"],
      model: "Who is she?",
    },
    {
      id: "p2-2",
      words: ["what", "number", "your", "cell", "phone", "is"],
      correct: ["what", "is", "your", "cell", "phone", "number"],
      model: "What is your cell phone number?",
    },
    {
      id: "p2-3",
      words: ["is", "where", "room", "4"],
      correct: ["where", "is", "room", "4"],
      model: "Where is room 4?",
    },
    {
      id: "p2-4",
      words: ["married", "is", "Marta"],
      correct: ["is", "marta", "married"],
      model: "Is Marta married?",
    },
    {
      id: "p2-5",
      words: ["your", "English", "class", "is", "when"],
      correct: ["when", "is", "your", "english", "class"],
      model: "When is your English class?",
    },
    {
      id: "p2-6",
      words: ["your", "number", "is", "phone", "555-0362"],
      correct: ["is", "your", "phone", "number", "555-0362"],
      model: "Is your phone number 555-0362?",
    },
    {
      id: "p2-7",
      words: ["is", "his", "email", "what"],
      correct: ["what", "is", "his", "email"],
      model: "What is his email?",
    },
    {
      id: "p2-8",
      words: ["Pedro", "how", "is", "old"],
      correct: ["how", "old", "is", "pedro"],
      model: "How old is Pedro?",
    },
  ];

  // Part 3 – write full questions from answers
  const PART3 = [
    {
      id: "p3-1",
      example: false,
      after: "?",
      prefix: "",
      answer: "Monterrey.",
      accept: [
        "where are you from",
        "where're you from",
        "where are you from?",
      ],
      model: "Where are you from?",
    },
    {
      id: "p3-2",
      after: " Monterrey?",
      prefix: "",
      answer: "It's in Mexico.",
      accept: [
        "where's monterrey",
        "where is monterrey",
        "where's monterrey?",
        "where is monterrey?",
      ],
      model: "Where's Monterrey?",
    },
    {
      id: "p3-3",
      after: "?",
      prefix: "",
      answer: "pguzman@gmail.com.",
      accept: [
        "what's your email",
        "what is your email",
        "what's your email?",
        "what is your email?",
        "what's your e-mail",
        "what is your e-mail",
      ],
      model: "What's your email?",
    },
    {
      id: "p3-4",
      after: "?",
      prefix: "Thanks. ",
      answer: "81 8150 9304.",
      accept: [
        "what's your phone number",
        "what is your phone number",
        "what's your cell phone number",
        "what is your cell phone number",
        "what's your cellphone number",
        "what is your cellphone number",
        "what's your number",
        "what is your number",
      ],
      model: "What's your phone number?",
    },
    {
      id: "p3-5",
      after: "?",
      prefix: "",
      answer: "I'm 19.",
      accept: [
        "how old are you",
        "how old are you?",
      ],
      model: "How old are you?",
    },
  ];

  const PARTS = [
    {
      id: "1",
      title: "Complete the questions",
      tip: "Write the question word for each gap.",
      mode: "write",
      items: PART1,
    },
    {
      id: "2",
      title: "Order the questions",
      tip: "Drag the words to make a question.",
      mode: "order",
      items: PART2,
    },
    {
      id: "3",
      title: "Write the questions",
      tip: "Write questions to complete the conversation.",
      mode: "fullwrite",
      items: PART3,
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let partIndex = 0;
  let index = 0;
  let totalCorrect = 0;
  let locked = false;

  // Part 2 state
  let pool = []; // remaining word tokens {id, text}
  let slots = []; // ordered placement {id, text} | null
  let dragId = null;
  let selectedId = null;
  let tokenSeq = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function match(val, accept) {
    const n = norm(val);
    if (!n) return false;
    return accept.some((a) => n === norm(a));
  }

  function calcStars(n, total) {
    if (!total) return 0;
    const r = n / total;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }

  function saveStars(n, total) {
    const stars = calcStars(n, total);
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function startPart(pi) {
    if (window.LAFinish) LAFinish.startTimer();
    const part = PARTS[pi];
    if (!part.items || !part.items.length) return;
    partIndex = pi;
    index = 0;
    totalCorrect = 0;
    locked = false;
    phase = "play";
    if (part.mode === "order") initOrderItem();
    render();
  }

  function initOrderItem() {
    const item = PARTS[partIndex].items[index];
    tokenSeq = 0;
    pool = shuffle(
      item.words.map((w) => ({
        id: "t" + tokenSeq++,
        text: w,
      }))
    );
    slots = item.words.map(() => null);
    dragId = null;
    selectedId = null;
  }

  function findToken(id) {
    let t = pool.find((x) => x.id === id);
    if (t) return { token: t, from: "pool" };
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] && slots[i].id === id) return { token: slots[i], from: "slot", slotIndex: i };
    }
    return null;
  }

  function removeToken(id) {
    pool = pool.filter((x) => x.id !== id);
    slots = slots.map((s) => (s && s.id === id ? null : s));
  }

  function placeInSlot(slotIndex, id) {
    if (locked) return;
    const found = findToken(id);
    if (!found) return;
    const token = found.token;
    // if slot occupied, swap back to pool
    const existing = slots[slotIndex];
    removeToken(id);
    if (existing) {
      pool.push(existing);
    }
    slots[slotIndex] = token;
    selectedId = null;
    renderPlayKeep();
  }

  function returnToPool(id) {
    if (locked) return;
    const found = findToken(id);
    if (!found || found.from === "pool") return;
    removeToken(id);
    pool.push(found.token);
    selectedId = null;
    renderPlayKeep();
  }

  function orderComplete() {
    return slots.every((s) => s);
  }

  function orderCorrect() {
    const item = PARTS[partIndex].items[index];
    const built = slots.map((s) => norm(s.text));
    const target = item.correct.map(norm);
    return built.length === target.length && built.every((w, i) => w === target[i]);
  }

  function checkWrite() {
    if (locked) return;
    const part = PARTS[partIndex];
    const item = part.items[index];
    const inp = document.getElementById("cq-input");
    let val = inp ? inp.value : "";
    // strip trailing ?
    val = val.replace(/\?+$/, "").trim();
    const ok = match(val, item.accept.map((a) => a.replace(/\?+$/, "")));
    const wrap = app.querySelector(".cq-gap-wrap");
    const status = document.getElementById("cq-status");
    const tip =
      part.mode === "fullwrite"
        ? "Write the full question"
        : "Write the question word";

    if (ok) { try{sfxCorrect();}catch(e){}
      locked = true;
      totalCorrect++;
      if (wrap) {
        wrap.classList.remove("is-bad");
        wrap.classList.add("is-ok");
      }
      if (inp) {
        inp.value = item.model.replace(/\?$/, "");
        inp.disabled = true;
      }
      if (status) {
        status.innerHTML = '<span class="cq-tick" aria-label="Correct"><svg class="cq-tick-svg" viewBox="0 0 52 52" width="40" height="40"><circle class="cq-tick-circle" cx="26" cy="26" r="24" fill="none"/><path class="cq-tick-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg></span>';
        status.classList.add("is-ok", "is-tick");
      }
      const ans = app.querySelector(".cq-answer");
      if (ans) ans.classList.add("is-show");
      setTimeout(advance, 850);
    } else {
      if (wrap) {
        wrap.classList.remove("is-ok");
        wrap.classList.add("is-bad");
      }
      if (status) {
        status.textContent = "Try again";
        status.classList.add("is-bad");
      }
      if (inp) {
        inp.focus();
        inp.select();
      }
      setTimeout(() => {
        if (wrap) wrap.classList.remove("is-bad");
        if (status) {
          status.textContent = tip;
          status.classList.remove("is-bad");
        }
      }, 700);
    }
  }

  function checkOrder() {
    if (locked) return;
    const status = document.getElementById("cq-status");
    if (!orderComplete()) {
      if (status) {
        status.textContent = "Place all the words first";
        status.classList.add("is-bad");
      }
      return;
    }
    const line = app.querySelector(".cq-slot-line");
    if (orderCorrect()) {
      locked = true;
      totalCorrect++;
      if (line) line.classList.add("is-ok");
      if (status) {
        status.textContent = "✓ Correct!";
        status.classList.add("is-ok");
      }
      const model = app.querySelector(".cq-model");
      if (model) model.classList.add("is-show");
      setTimeout(advance, 850);
    } else {
      if (line) {
        line.classList.add("is-bad");
        setTimeout(() => line.classList.remove("is-bad"), 500);
      }
      if (status) {
        status.textContent = "Not quite — try again";
        status.classList.add("is-bad");
      }
      setTimeout(() => {
        if (status) {
          status.textContent = "Drag words into order";
          status.classList.remove("is-bad");
        }
      }, 800);
    }
  }

  function advance() {
    locked = false;
    const part = PARTS[partIndex];
    if (index < part.items.length - 1) {
      index++;
      if (part.mode === "order") initOrderItem();
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  let scrollY = 0;
  function renderPlayKeep() {
    const stage = app.querySelector(".cq-stage");
    scrollY = stage ? stage.scrollTop : 0;
    render();
    const stage2 = app.querySelector(".cq-stage");
    if (stage2) stage2.scrollTop = scrollY;
  }

  function chipHTML(token, place) {
    return (
      '<button type="button" class="cq-chip' +
      (selectedId === token.id ? " is-selected" : "") +
      '" draggable="true" data-id="' +
      token.id +
      '" data-place="' +
      place +
      '">' +
      token.text +
      "</button>"
    );
  }

  function firstEmptySlot() {
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i]) return i;
    }
    return -1;
  }

  function bindOrderDnD() {
    app.querySelectorAll(".cq-chip").forEach((chip) => {
      chip.addEventListener("dragstart", (e) => {
        dragId = chip.dataset.id;
        chip.classList.add("is-dragging");
        e.dataTransfer.setData("text/plain", dragId);
        e.dataTransfer.effectAllowed = "move";
      });
      chip.addEventListener("dragend", () => {
        chip.classList.remove("is-dragging");
        dragId = null;
      });
      chip.addEventListener("click", () => {
        if (locked) return;
        const id = chip.dataset.id;
        const place = chip.dataset.place;
        if (place === "slot") {
          // tap filled chip in slot → return to pool
          returnToPool(id);
        } else {
          // tap pool chip → place in first empty slot
          const empty = firstEmptySlot();
          if (empty >= 0) {
            placeInSlot(empty, id);
          }
        }
      });
    });

    app.querySelectorAll(".cq-slot").forEach((slot) => {
      const i = +slot.dataset.i;
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("is-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("is-over"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("is-over");
        const id = e.dataTransfer.getData("text/plain") || dragId;
        if (id) placeInSlot(i, id);
      });
    });
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="cq-topbar">' +
        '<a class="cq-back" href="../" aria-label="Back">←</a>' +
        '<span class="cq-title">Complete the Questions</span>' +
        '<span class="cq-badge">2B</span>' +
        "</header>" +
        '<section class="cq-start">' +
        '<div class="cq-hero" aria-hidden="true">✏️</div>' +
        "<h1>Complete the Questions</h1>" +
        '<p class="cq-desc">Three parts · question words in conversations</p>' +
        '<div class="cq-mode-list">' +
        PARTS.map((p, i) => {
          const lockedPart = !p.items;
          return (
            '<button type="button" class="cq-mode-card' +
            (lockedPart ? " is-locked" : "") +
            '" data-part="' +
            i +
            '"' +
            (lockedPart ? " disabled" : "") +
            ">" +
            '<span class="cq-mode-num">' +
            (i + 1) +
            "</span>" +
            "<div><strong>" +
            p.title +
            "</strong><p>" +
            p.tip +
            "</p></div>" +
            "</button>"
          );
        }).join("") +
        "</div>" +
        "</section>";
      app.querySelectorAll(".cq-mode-card:not(:disabled)").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    const part = PARTS[partIndex];
    const items = part.items || [];

    if (phase === "done") {
      const stars = saveStars(totalCorrect, items.length);
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: items.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(partIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startPart(partIndex);
      return;
    }

    // PLAY – write (part 1) or fullwrite (part 3)
    if (part.mode === "write" || part.mode === "fullwrite") {
      const item = items[index];
      const isFull = part.mode === "fullwrite";
      const label = isFull
        ? "A · Write the question"
        : "A · Complete the question";
      const statusTip = isFull
        ? "Write the full question"
        : "Write the question word";
      const maxLen = isFull ? 48 : 16;
      const gapClass = isFull ? "cq-gap cq-gap--full" : "cq-gap";
      const prefix = item.prefix || "";
      const after = item.after || "";

      app.innerHTML =
        '<header class="cq-topbar">' +
        '<a class="cq-back" href="../" aria-label="Back">←</a>' +
        '<span class="cq-title">' +
        part.title +
        "</span>" +
        '<span class="cq-progress">' +
        (index + 1) +
        " / " +
        items.length +
        "</span>" +
        "</header>" +
        '<div class="cq-play">' +
        '<div class="cq-stage">' +
        '<div class="cq-card">' +
        '<div class="cq-label">' +
        label +
        "</div>" +
        (isFull
          ? '<p class="cq-example">Example: <em>What\'s your name?</em> → Pedro Guzman.</p>'
          : "") +
        '<p class="cq-question' +
        (isFull ? " cq-question--full" : "") +
        '">' +
        (prefix
          ? '<span class="cq-prefix">' + prefix + "</span>"
          : "") +
        '<span class="cq-gap-wrap' +
        (isFull ? " cq-gap-wrap--full" : "") +
        '">' +
        '<input type="text" id="cq-input" class="' +
        gapClass +
        '" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="…" maxlength="' +
        maxLen +
        '" />' +
        "</span>" +
        (after && after !== "?"
          ? '<span class="cq-rest">' + after + "</span>"
          : after === "?"
            ? '<span class="cq-rest">?</span>'
            : "") +
        "</p>" +
        '<div class="cq-answer' +
        (isFull ? " is-show" : "") +
        '">' +
        '<span class="cq-b">B</span>' +
        '<span class="cq-b-text">' +
        item.answer +
        "</span>" +
        "</div>" +
        "</div>" +
        '<p class="cq-status" id="cq-status">' +
        statusTip +
        "</p>" +
        "</div>" +
        '<div class="cq-actions">' +
        '<button type="button" class="cq-btn" id="cq-check">Check</button>' +
        "</div>" +
        "</div>";

      const inp = document.getElementById("cq-input");
      if (inp) {
        inp.focus();
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            checkWrite();
          }
        });
        inp.addEventListener("input", () => {
          const wrap = app.querySelector(".cq-gap-wrap");
          if (wrap) wrap.classList.remove("is-ok", "is-bad");
          const status = document.getElementById("cq-status");
          if (status) {
            status.textContent = statusTip;
            status.classList.remove("is-ok", "is-bad");
          }
        });
      }
      document.getElementById("cq-check").onclick = checkWrite;
      return;
    }

    // ORDER mode
    const item = items[index];
    const slotCells = slots
      .map((s, i) => {
        if (s) {
          return (
            '<div class="cq-slot is-filled" data-i="' +
            i +
            '">' +
            chipHTML(s, "slot") +
            "</div>"
          );
        }
        return '<div class="cq-slot" data-i="' + i + '"></div>';
      })
      .join("");

    const poolChips = pool.map((t) => chipHTML(t, "pool")).join("");

    app.innerHTML =
      '<header class="cq-topbar">' +
      '<a class="cq-back" href="../" aria-label="Back">←</a>' +
      '<span class="cq-title">' +
      part.title +
      "</span>" +
      '<span class="cq-progress">' +
      (index + 1) +
      " / " +
      items.length +
      "</span>" +
      "</header>" +
      '<div class="cq-play">' +
      '<div class="cq-stage">' +
      '<div class="cq-card cq-card--order">' +
      '<div class="cq-label">Make the question</div>' +
      '<div class="cq-slot-line" id="cq-slots">' +
      slotCells +
      "</div>" +
      '<p class="cq-model">' +
      item.model +
      "</p>" +
      "</div>" +
      '<p class="cq-status" id="cq-status">Tap a word to place it · or drag into a slot</p>' +
      '<div class="cq-pool" aria-label="Word bank">' +
      poolChips +
      "</div>" +
      "</div>" +
      '<div class="cq-actions">' +
      '<button type="button" class="cq-btn" id="cq-check">Check</button>' +
      "</div>" +
      "</div>";

    bindOrderDnD();
    document.getElementById("cq-check").onclick = checkOrder;
    const stage = app.querySelector(".cq-stage");
    if (stage && scrollY) stage.scrollTop = scrollY;
  }

  render();
})();
