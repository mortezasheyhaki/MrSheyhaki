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

/* Going to — write your answers · AEF 1 Unit 10B
   5 questions per round, one per time-expression bucket.
   Alternates which item is used when a bucket has more than one question.
*/
(function () {
  "use strict";

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
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, 0.15, "sine", 0.1, i * 0.07);
      });
    }
    window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
    window.sfxTap = sfxTap;
    window.sfxCorrect = sfxCorrect;
    window.sfxWrong = sfxWrong;
    window.sfxCelebrate = sfxCelebrate;
  })();

  var GAME_ID = "1-10b-going-to-write-answers";
  var ROTATE_KEY = "la-1-10b-write-answers-rotate";
  var SET_SIZE = 5;

  /* type: "open" requires I'm going to; "yesno" accepts yes/no short answers */
  var BANK = [
    { id: "t1", time: "tonight", type: "open", q: "What are you going to have for dinner tonight?", hint: "I'm going to have …" },
    { id: "t2", time: "tonight", type: "open", q: "What time are you going to go to bed tonight?", hint: "I'm going to go to bed at …" },
    { id: "d1", time: "today", type: "yesno", q: "Are you going to study English today?", hint: "Yes, I am. / No, I'm not." },
    { id: "m1", time: "tomorrow", type: "open", q: "What time are you going to get up tomorrow?", hint: "I'm going to get up at …" },
    { id: "m2", time: "tomorrow", type: "open", q: "Where are you going to have lunch tomorrow?", hint: "I'm going to have lunch …" },
    { id: "m3", time: "tomorrow", type: "yesno", q: "Are you going to go to work or school tomorrow?", hint: "Yes, I am. / No, I'm not." },
    { id: "e1", time: "this evening", type: "open", q: "What are you going to do this evening?", hint: "I'm going to …" },
    { id: "w1", time: "next week", type: "yesno", q: "Are you going to go away next week? Where to?", hint: "Yes, I'm going to … / No, I'm not." },
    { id: "s1", time: "Saturday night", type: "open", q: "What are you going to do on Saturday night?", hint: "I'm going to …" },
    { id: "f1", time: "Friday night", type: "open", q: "What are you going to do on Friday night?", hint: "I'm going to …" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var items = [];
  var index = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var locked = false;
  var advanceTimer = null;
  var answersLog = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function sfx(name) {
    if (window.ArcadeFX) { if (name === "good" || name === "correct") ArcadeFX.ok(); else if (name === "bad" || name === "wrong") ArcadeFX.bad(); }
    try {
      if (window.LASfx && typeof LASfx.play === "function") LASfx.play(name);
      else if (name === "correct" && window.sfxCorrect) sfxCorrect();
      else if (name === "wrong" && window.sfxWrong) sfxWrong();
      else if (name === "click" && window.sfxTap) sfxTap();
      else if (name === "win" && window.sfxCelebrate) sfxCelebrate();
    } catch (_) {}
  }

  function clearTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadRotate() {
    try {
      var raw = localStorage.getItem(ROTATE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveRotate(map) {
    try {
      localStorage.setItem(ROTATE_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  /* Build a set of SET_SIZE items with unique time buckets.
     For each time bucket, pick the least-recently-used question (rotate on replay). */
  function buildSet() {
    var byTime = {};
    BANK.forEach(function (item) {
      if (!byTime[item.time]) byTime[item.time] = [];
      byTime[item.time].push(item);
    });

    var times = shuffle(Object.keys(byTime));
    // Prefer buckets; take first SET_SIZE times
    if (times.length > SET_SIZE) times = times.slice(0, SET_SIZE);

    var rotate = loadRotate();
    var chosen = [];

    times.forEach(function (time) {
      var pool = byTime[time];
      // Sort pool so unused / lower count come first
      var ranked = pool.slice().sort(function (a, b) {
        var ca = rotate[a.id] || 0;
        var cb = rotate[b.id] || 0;
        if (ca !== cb) return ca - cb;
        return Math.random() - 0.5;
      });
      var pick = ranked[0];
      chosen.push(pick);
      rotate[pick.id] = (rotate[pick.id] || 0) + 1;
    });

    saveRotate(rotate);
    return shuffle(chosen);
  }

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ");
  }

  function hasGoingTo(s) {
    var n = normalize(s);
    return (
      n.indexOf("i'm going to") !== -1 ||
      n.indexOf("i am going to") !== -1
    );
  }

  function isYesNoOk(s) {
    var n = normalize(s).replace(/\.+$/, "");
    // short answers
    var shorts = [
      "yes", "yes i am", "yes, i am", "yes i'm", "yes, i'm",
      "no", "no i'm not", "no, i'm not", "no i am not", "no, i am not",
      "yes i am going to", "yes, i am going to", "yes i'm going to", "yes, i'm going to",
      "no i'm not going to", "no, i'm not going to", "no i am not going to"
    ];
    for (var i = 0; i < shorts.length; i++) {
      if (n === shorts[i]) return true;
    }
    // yes/no + going to detail
    if (/^(yes|no)\b/.test(n) && (hasGoingTo(n) || /i'?m not/.test(n))) return true;
    if (hasGoingTo(n)) return true;
    return false;
  }

  function validate(item, raw) {
    var n = normalize(raw);
    if (!n || n.length < 2) {
      return { ok: false, msg: "Please write an answer." };
    }
    if (item.type === "yesno") {
      if (isYesNoOk(raw)) return { ok: true };
      return {
        ok: false,
        msg: "Try a short answer: Yes, I am. / No, I'm not. (Or use I'm going to …)"
      };
    }
    // open questions — must include I'm going to
    if (!hasGoingTo(raw)) {
      return {
        ok: false,
        msg: "Use I'm going to … in your answer."
      };
    }
    // avoid answering with only the phrase
    var stripped = n
      .replace(/i'?m going to/g, "")
      .replace(/i am going to/g, "")
      .replace(/[.?!,]/g, "")
      .trim();
    if (stripped.length < 2) {
      return {
        ok: false,
        msg: "Add more detail after I'm going to …"
      };
    }
    return { ok: true };
  }

  function showStart() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      "</div>" +
      '<div class="wgt-start">' +
      '<div class="wgt-hero" aria-hidden="true">✍️</div>' +
      "<h1>Write Your Answers</h1>" +
      "<p>Answer <strong>5 questions</strong> about your plans. Use <strong>I'm going to</strong> (except for Yes / No questions).</p>" +
      '<button type="button" class="wgt-btn" id="startBtn">Start</button>' +
      "</div>";
    document.getElementById("startBtn").onclick = start;
  }

  function start() {
    items = buildSet();
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    locked = false;
    answersLog = [];
    clearTimer();
    try {
      if (window.LAFinish) LAFinish.startTimer();
    } catch (_) {}
    sfx("click");
    render();
  }

  function topBar() {
    var pct = (index / items.length) * 100;
    return (
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-progress"><span id="wgtFill" style="width:' + pct + '%"></span></div>' +
      '<span class="wgt-mode-tag">' + (index + 1) + " / " + items.length + "</span>" +
      '<span class="wgt-pill" id="scorePill">✓ ' + score + "</span>" +
      "</div>"
    );
  }

  function updatePills() {
    var sp = document.getElementById("scorePill");
    if (sp) sp.textContent = "✓ " + score;
    var st = document.getElementById("streakPill");
    if (st) {
      st.textContent = streak > 0 ? "🔥 " + streak : "—";
      st.className = "wgt-pill streak" + (streak >= 3 ? " is-hot" : "");
    }
  }

  function render() {
    clearTimer();
    locked = false;
    var item = items[index];

    app.innerHTML =
      topBar() +
      '<div class="wgt-play">' +
      '<div class="wgt-phase">Question ' + (index + 1) + " of " + items.length +
      ' · <span style="opacity:0.7">' + escapeHtml(item.time) + "</span></div>" +
      '<div class="su-prompt" id="wgtCard">' +
      '<div class="su-prompt-label">' +
      (item.type === "yesno" ? "Yes / No · or write a full answer" : "Write your answer with I'm going to") +
      "</div>" +
      '<p class="wgt-sentence">' + escapeHtml(item.q) + "</p>" +
      '<div class="wgt-hint" style="margin-top:10px;font-size:0.85rem;opacity:0.75">Hint: ' +
      escapeHtml(item.hint) +
      "</div>" +
      "</div>" +
      '<div class="wgt-input-wrap">' +
      '<input class="wgt-input" id="answerInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="true" placeholder="' +
      escapeHtml(item.hint) +
      '" maxlength="120" />' +
      '<button type="button" class="wgt-check" id="checkBtn">Check</button>' +
      "</div>" +
      '<div class="wgt-feedback" id="feedback"></div>' +
      "</div>";

    requestAnimationFrame(function () {
      var fill = document.getElementById("wgtFill");
      if (fill) fill.style.width = ((index + 1) / items.length) * 100 + "%";
    });

    var input = document.getElementById("answerInput");
    var checkBtn = document.getElementById("checkBtn");
    input.focus();
    checkBtn.onclick = submit;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });
  }

  function submit() {
    if (locked) return;
    var input = document.getElementById("answerInput");
    if (!input) return;
    var val = input.value;
    var item = items[index];
    var result = validate(item, val);

    if (!result.ok) {
      // soft fail — stay on question, show tip, don't advance
      sfx("wrong");
      var feedback = document.getElementById("feedback");
      var card = document.getElementById("wgtCard");
      if (feedback) {
        feedback.textContent = result.msg;
        feedback.className = "wgt-feedback bad show";
      }
      if (card) {
        card.classList.remove("is-correct");
        card.classList.add("is-wrong");
        setTimeout(function () {
          card.classList.remove("is-wrong");
        }, 400);
      }
      input.focus();
      return;
    }

    locked = true;
    input.disabled = true;
    var checkBtn = document.getElementById("checkBtn");
    if (checkBtn) checkBtn.disabled = true;

    score += 1;
    streak += 1;
    if (streak > bestStreak) bestStreak = streak;
    answersLog.push({ q: item.q, a: val.trim() });
    sfx("correct");

    var card = document.getElementById("wgtCard");
    var feedback = document.getElementById("feedback");
    if (card) card.classList.add("is-correct");
    if (feedback) {
      feedback.textContent = streak >= 3 ? "Great! 🔥 " + streak : "Nice!";
      feedback.className = "wgt-feedback ok show";
    }
    updatePills();
    advanceTimer = setTimeout(next, 750);
  }

  function next() {
    clearTimer();
    if (index + 1 >= items.length) {
      finish();
      return;
    }
    if (window.ArcadeFX && items.length >= 8 && index + 1 === Math.floor(items.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + items.length + " done");
    index += 1;
    render();
  }

  function finish() {
    clearTimer();
    sfx("win");
    var total = items.length;
    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          timeMs: timeMs,
          onAgain: start,
          onModes: showStart,
          backHref: "../",
          save: true
        });
        return;
      }
    } catch (_) {}
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, Math.round((score / total) * 100));
      }
    } catch (_) {}

    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      "</div>" +
      '<div class="wgt-done">' +
      '<div class="trophy" aria-hidden="true">🏆</div>' +
      "<h1>Well done!</h1>" +
      '<div class="wgt-score-big">' + score + " / " + total + "</div>" +
      (bestStreak > 1 ? "<p>Best streak: " + bestStreak + "</p>" : "") +
      '<button type="button" class="wgt-btn" id="againBtn">Play again</button>' +
      "</div>";
    document.getElementById("againBtn").onclick = start;
  }

  showStart();
})();
