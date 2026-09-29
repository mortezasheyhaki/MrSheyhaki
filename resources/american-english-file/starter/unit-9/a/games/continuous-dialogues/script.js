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

/* Dialogue Complete — present continuous +, −, ? · one item at a time */
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

const GAME_ID = "starter-9a-continuous-dialogues";
  function saveStars() {
    try {
      if (!window.LAStars || !order || !order.length) return;
      var acc = Math.round((score / order.length) * 100);
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, acc);
    } catch (_) {}
  }


  /*
    Each item: lines (display), blanks (answers for each ______),
    verbs shown as hints, full = completed dialogue text after check.
    Prefer contractions in primary answers; alts allow full forms.
  */
  const ITEMS = [
    {
      n: 1,
      verbs: ["(sit)"],
      lines: [
        { who: "A", text: "Excuse me! You ______ in my seat." },
        { who: "B", text: "Sorry!" },
      ],
      blanks: [
        {
          label: "Blank 1",
          answer: "are sitting",
          display: "'re sitting",
          alts: ["'re sitting", "re sitting", "you're sitting", "you are sitting", "youre sitting"],
        },
      ],
      full: "A  Excuse me! You're sitting in my seat.\nB  Sorry!",
    },
    {
      n: 2,
      verbs: ["(not watch)", "(sleep)"],
      lines: [
        { who: "A", text: "Dad ______ this TV show. He ______." },
        { who: "B", text: "OK. You can watch your show then." },
      ],
      blanks: [
        {
          label: "Blank 1 — not watch",
          answer: "isn't watching",
          display: "isn't watching",
          alts: ["is not watching", "isnt watching", "'s not watching", "s not watching"],
        },
        {
          label: "Blank 2 — sleep",
          answer: "is sleeping",
          display: "'s sleeping",
          alts: ["'s sleeping", "s sleeping", "he's sleeping", "he is sleeping", "hes sleeping"],
        },
      ],
      full: "A  Dad isn't watching this TV show. He's sleeping.\nB  OK. You can watch your show then.",
    },
    {
      n: 3,
      verbs: ["(do)", "(shop)"],
      lines: [
        { who: "A", text: "Hello! What ______ you ______ here?" },
        { who: "B", text: "I ______. It's Jim's birthday tomorrow." },
      ],
      blanks: [
        {
          label: "1",
          answer: "are",
          display: "are",
          alts: ["'re", "re"],
        },
        {
          label: "2",
          answer: "doing",
          display: "doing",
          alts: [],
        },
        {
          label: "3",
          answer: "am shopping",
          display: "'m shopping",
          alts: ["'m shopping", "m shopping", "i'm shopping", "i am shopping", "im shopping"],
        },
      ],
      full: "A  Hello! What are you doing here?\nB  I'm shopping. It's Jim's birthday tomorrow.",
    },
    {
      n: 4,
      verbs: ["(go)", "(not work)"],
      lines: [
        { who: "A", text: "I ______ to the gym now. Do you want to come with me?" },
        { who: "B", text: "Great idea. I ______ today!" },
      ],
      blanks: [
        {
          label: "Blank 1 — go",
          answer: "am going",
          display: "'m going",
          alts: ["'m going", "m going", "i'm going", "i am going", "im going"],
        },
        {
          label: "Blank 2 — not work",
          answer: "am not working",
          display: "'m not working",
          alts: ["'m not working", "m not working", "i'm not working", "i am not working", "im not working"],
        },
      ],
      full: "A  I'm going to the gym now. Do you want to come with me?\nB  Great idea. I'm not working today!",
    },
    {
      n: 5,
      verbs: ["(do)", "(play)"],
      lines: [
        { who: "A", text: "______ Alice ______ her homework?" },
        { who: "B", text: "No, she isn't. She ______ computer games." },
      ],
      blanks: [
        {
          label: "1",
          answer: "is",
          display: "is",
          alts: [],
        },
        {
          label: "2",
          answer: "doing",
          display: "doing",
          alts: [],
        },
        {
          label: "3",
          answer: "is playing",
          display: "'s playing",
          alts: ["'s playing", "s playing", "she's playing", "she is playing", "shes playing"],
        },
      ],
      full: "A  Is Alice doing her homework?\nB  No, she isn't. She's playing computer games.",
    },
    {
      n: 6,
      verbs: ["(not read)", "(watch)"],
      lines: [
        { who: "A", text: "Do you want my newspaper? I ______ it." },
        { who: "B", text: "No, thanks. I ______ a movie on my laptop." },
      ],
      blanks: [
        {
          label: "Blank 1 — not read",
          answer: "am not reading",
          display: "'m not reading",
          alts: ["'m not reading", "m not reading", "i'm not reading", "i am not reading", "im not reading"],
        },
        {
          label: "Blank 2 — watch",
          answer: "am watching",
          display: "'m watching",
          alts: ["'m watching", "m watching", "i'm watching", "i am watching", "im watching"],
        },
      ],
      full: "A  Do you want my newspaper? I'm not reading it.\nB  No, thanks. I'm watching a movie on my laptop.",
    },
    {
      n: 7,
      verbs: ["(talk)"],
      lines: [
        { who: "A", text: "Is that your brother?" },
        { who: "B", text: "No, my brother's over there. He ______ to his friends." },
      ],
      blanks: [
        {
          label: "Blank 1 — talk",
          answer: "is talking",
          display: "'s talking",
          alts: ["'s talking", "s talking", "he's talking", "he is talking", "hes talking"],
        },
      ],
      full: "A  Is that your brother?\nB  No, my brother's over there. He's talking to his friends.",
    },
    {
      n: 8,
      verbs: ["(have)", "(have)"],
      lines: [
        { who: "A", text: "______ you ______ a good time in Rio?" },
        { who: "B", text: "Yes, we are. We ______ a great time!" },
      ],
      blanks: [
        {
          label: "1",
          answer: "are",
          display: "are",
          alts: ["'re", "re"],
        },
        {
          label: "2",
          answer: "having",
          display: "having",
          alts: [],
        },
        {
          label: "3",
          answer: "are having",
          display: "'re having",
          alts: ["'re having", "re having", "we're having", "we are having", "were having"],
        },
      ],
      full: "A  Are you having a good time in Rio?\nB  Yes, we are. We're having a great time!",
    },
    {
      n: 9,
      verbs: ["(talk)", "(call)"],
      lines: [
        { who: "A", text: "Hello, can I speak to Marisa?" },
        { who: "B", text: "Sorry, she ______ her mother on Skype. Who is this, please?" },
        { who: "A", text: "It's Yuko, from English class. I ______ about tonight's homework." },
      ],
      blanks: [
        {
          label: "Blank 1 — talk",
          answer: "is talking to",
          display: "'s talking to",
          alts: [
            "'s talking to",
            "s talking to",
            "is talking",
            "'s talking",
            "she's talking to",
            "she is talking to",
            "shes talking to",
            "she's talking",
            "she is talking",
          ],
        },
        {
          label: "Blank 2 — call",
          answer: "am calling",
          display: "'m calling",
          alts: ["'m calling", "m calling", "i'm calling", "i am calling", "im calling"],
        },
      ],
      full: "A  Hello, can I speak to Marisa?\nB  Sorry, she's talking to her mother on Skype. Who is this, please?\nA  It's Yuko, from English class. I'm calling about tonight's homework.",
    },
    {
      n: 10,
      verbs: ["(get)"],
      lines: [
        { who: "A", text: "______ you ______ up now? You're late for school!" },
        { who: "B", text: "Yes, I am. What time is it?" },
      ],
      blanks: [
        {
          label: "1",
          answer: "are",
          display: "are",
          alts: ["'re", "re"],
        },
        {
          label: "2",
          answer: "getting",
          display: "getting",
          alts: [],
        },
      ],
      full: "A  Are you getting up now? You're late for school!\nB  Yes, I am. What time is it?",
    },
  ];


  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endOverlay = $("endOverlay");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const leftText = $("leftText");
  const itemLabel = $("itemLabel");
  const verbTags = $("verbTags");
  const dialogueBox = $("dialogueBox");
  const feedback = $("feedback");
  const checkBtn = $("checkBtn");
  const actions = $("actions");
  const nextRow = $("nextRow");
  const nextBtn = $("nextBtn");

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.?!]+/g, "")
      .replace(/,/g, "")
      .replace(/\bi'm\b/g, "am")
      .replace(/\byou're\b/g, "are")
      .replace(/\bhe's\b/g, "is")
      .replace(/\bshe's\b/g, "is")
      .replace(/\bit's\b/g, "is")
      .replace(/\bwe're\b/g, "are")
      .replace(/\bthey're\b/g, "are")
      .replace(/\bi am\b/g, "am")
      .replace(/\byou are\b/g, "are")
      .replace(/\bhe is\b/g, "is")
      .replace(/\bshe is\b/g, "is")
      .replace(/\bit is\b/g, "is")
      .replace(/\bwe are\b/g, "are")
      .replace(/\bthey are\b/g, "are")
      .replace(/\bdad is\b/g, "is")
      .replace(/\bdad's\b/g, "is")
      .replace(/\bisn't\b/g, "is not")
      .replace(/\baren't\b/g, "are not")
      .replace(/^'m\b/g, "am")
      .replace(/^'re\b/g, "are")
      .replace(/^'s\b/g, "is")
      .replace(/\s+/g, " ")
      .trim();
  }

  function blankOk(value, blank) {
    const n = normalize(value);
    if (n === normalize(blank.answer)) return true;
    return (blank.alts || []).some(function (a) {
      return normalize(a) === n;
    });
  }

  function start() {
    /* keep book order 1→10 (not shuffled) so "one part at a time" matches the exercise */
    order = ITEMS.map(function (_, i) {
      return i;
    });
    index = 0;
    score = 0;
    locked = false;
    startScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    if (window.LAFinish) LAFinish.startTimer();
    loadItem();
  }

  function loadItem() {
    locked = false;
    const item = ITEMS[order[index]];
    qProgress.textContent = index + 1 + "/" + order.length;
    scoreText.textContent = String(score);
    leftText.textContent = String(order.length - index);
    itemLabel.textContent = "Dialogue " + item.n;
    verbTags.innerHTML = item.verbs
      .map(function (v) {
        return "<span>" + v + "</span>";
      })
      .join("");
    var blankIdx = 0;
    dialogueBox.innerHTML = item.lines
      .map(function (L) {
        var parts = L.text.split("______");
        var html = '<p class="line"><span class="who">' + L.who + '</span><span class="words">';
        for (var p = 0; p < parts.length; p++) {
          html += parts[p];
          if (p < parts.length - 1) {
            var bi = blankIdx++;
            var wide = (item.blanks[bi] && item.blanks[bi].answer.split(" ").length > 2) ? " wide" : "";
            html +=
              '<input type="text" class="inline-blank' +
              wide +
              '" id="b' +
              bi +
              '" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" aria-label="blank ' +
              (bi + 1) +
              '">';
          }
        }
        html += "</span></p>";
        return html;
      })
      .join("");
    item.blanks.forEach(function (_, i) {
      var input = document.getElementById("b" + i);
      if (!input) return;
      input.addEventListener("input", onInput);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (locked) next();
          else check();
        }
      });
    });
    feedback.textContent = "";
    feedback.className = "feedback";
    actions.classList.remove("hidden");
    nextRow.classList.add("hidden");
    checkBtn.disabled = true;
    var first = document.getElementById("b0");
    if (first) setTimeout(function () {
      first.focus();
    }, 50);
  }

  function onInput() {
    if (locked) return;
    const item = ITEMS[order[index]];
    let any = false;
    item.blanks.forEach(function (_, i) {
      const el = document.getElementById("b" + i);
      if (el && el.value.trim()) any = true;
      if (el) {
        el.classList.remove("ok", "bad");
      }
    });
    checkBtn.disabled = !any;
    feedback.textContent = "";
  }

  function check() {
    if (locked) return;
    const item = ITEMS[order[index]];
    let allOk = true;
    item.blanks.forEach(function (b, i) {
      const el = document.getElementById("b" + i);
      if (!el) return;
      if (blankOk(el.value, b)) {
        el.classList.add("ok");
        el.classList.remove("bad");
        el.disabled = true;
        el.value = b.display || b.answer;
      } else {
        allOk = false;
        el.classList.add("bad");
        el.classList.remove("ok");
      }
    });
    if (allOk) {
      locked = true;
      score++;
      scoreText.textContent = String(score);
      feedback.textContent = "Correct!"; try{sfxCorrect();}catch(e){}
      feedback.className = "feedback ok";
      actions.classList.add("hidden");
      nextRow.classList.remove("hidden");
      if (window.LASfx) LASfx.correct();
    } else {
      feedback.textContent = "Check the blanks · use be + -ing";
      feedback.className = "feedback bad";
      if (window.LASfx) LASfx.wrong();
    }
  }

  function showEnd() {
    if (window.LASfx) LASfx.win();
    var total = order.length;
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: Math.max(total, 1),
        timeMs: timeMs,
        onAgain: start,
        onModes: function () {
          gameScreen.classList.add("hidden");
          endOverlay.classList.add("hidden");
          startScreen.classList.remove("hidden");
        },
        backHref: "../",
        save: true
      });
      return;
    }
    endOverlay.classList.remove("hidden");
    saveStars();
    var pct = total ? Math.round((score / total) * 100) : 0;
    var emoji = score === total ? "🏆" : score >= total * 0.7 ? "🎉" : score >= total * 0.4 ? "👍" : "💪";
    var title = score === total ? "Perfect!" : score >= total * 0.7 ? "Well done!" : score >= total * 0.4 ? "Nice try!" : "Keep going!";
    var endEmoji = $("endEmoji");
    if (endEmoji) endEmoji.textContent = emoji;
    $("endTitle").textContent = title;
    $("endMsg").textContent = "You scored " + score + " of " + total;
    var ring = $("scoreRing");
    var ringText = $("scoreRingText");
    if (ringText) ringText.textContent = score + "/" + total;
    if (ring) {
      ring.style.setProperty("--p", "0%");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ring.style.transition = "background 1s ease";
          ring.style.setProperty("--p", pct + "%");
        });
      });
    }
    spawnConfetti();
  }

  function spawnConfetti() {
    var box = $("confetti");
    if (!box) return;
    box.innerHTML = "";
    var colors = ["#b45309", "#0f766e", "#15803d", "#f59e0b", "#2dd4bf", "#f87171"];
    for (var i = 0; i < 28; i++) {
      var el = document.createElement("i");
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 0.6) + "s";
      el.style.animationDuration = (1.4 + Math.random() * 0.9) + "s";
      el.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      box.appendChild(el);
    }
  }

  function next() {
    if (index + 1 >= order.length) {
      showEnd();
      return;
    }
    index++;
    loadItem();
  }

  $("startBtn").addEventListener("click", start);
  $("exitBtn").addEventListener("click", function () {
    gameScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
  checkBtn.addEventListener("click", check);
  nextBtn.addEventListener("click", next);
  $("playAgainBtn").addEventListener("click", start);
  $("homeBtn").addEventListener("click", function () {
    endOverlay.classList.add("hidden");
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
})();
