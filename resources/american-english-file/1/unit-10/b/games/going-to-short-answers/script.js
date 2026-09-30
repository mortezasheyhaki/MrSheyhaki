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

/* Going to short answers · AEF 1 Unit 10B */
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

  var GAME_ID = "1-10b-going-to-short-answers";

  /* prompt shown; yesNo already on screen; accepts = valid short-answer tails */
  var ITEMS = [
    {
      q: "Are you going to visit your cousin this weekend?",
      yesNo: "Yes,",
      display: "I am.",
      accepts: ["i am", "i am.", "i'm"]
    },
    {
      q: "Is David going to play basketball tomorrow?",
      yesNo: "No,",
      display: "he isn't.",
      accepts: ["he isn't", "he isn't.", "he's not", "he's not.", "he is not", "he is not."]
    },
    {
      q: "Are Sara and Emma going to watch a movie tonight?",
      yesNo: "Yes,",
      display: "they are.",
      accepts: ["they are", "they are."]
    },
    {
      q: "Is your mother going to go shopping tomorrow?",
      yesNo: "No,",
      display: "she isn't.",
      accepts: ["she isn't", "she isn't.", "she's not", "she's not.", "she is not", "she is not."]
    },
    {
      q: "Are your classmates going to study for the test?",
      yesNo: "Yes,",
      display: "they are.",
      accepts: ["they are", "they are."]
    },
    {
      q: "Is Jack going to make breakfast tomorrow?",
      yesNo: "No,",
      display: "he isn't.",
      accepts: ["he isn't", "he isn't.", "he's not", "he's not.", "he is not", "he is not."]
    },
    {
      q: "Are you going to clean your room this afternoon?",
      yesNo: "Yes,",
      display: "I am.",
      accepts: ["i am", "i am.", "i'm"]
    },
    {
      q: "Is Maria going to buy a new jacket?",
      yesNo: "No,",
      display: "she isn't.",
      accepts: ["she isn't", "she isn't.", "she's not", "she's not.", "she is not", "she is not."]
    },
    {
      q: "Are your friends going to come to your house tonight?",
      yesNo: "Yes,",
      display: "they are.",
      accepts: ["they are", "they are."]
    },
    {
      q: "Is your brother going to play computer games this evening?",
      yesNo: "No,",
      display: "he isn't.",
      accepts: ["he isn't", "he isn't.", "he's not", "he's not.", "he is not", "he is not."]
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var index = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var locked = false;
  var advanceTimer = null;

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

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .replace(/\.+$/, "");
  }

  function isCorrect(input, accepts) {
    var n = normalize(input);
    if (!n) return false;
    for (var i = 0; i < accepts.length; i++) {
      if (n === normalize(accepts[i])) return true;
    }
    return false;
  }

  function showStart() {
    clearTimer();
    locked = false;
    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      "</div>" +
      '<div class="wgt-start">' +
      '<div class="wgt-hero" aria-hidden="true">💬</div>' +
      "<h1>Going to Short Answers</h1>" +
      "<p>Write the short answer. Example: <strong>Yes, I am.</strong> / <strong>No, he isn't.</strong></p>" +
      '<button type="button" class="wgt-btn" id="startBtn">Start</button>' +
      "</div>";
    document.getElementById("startBtn").onclick = start;
  }

  function start() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    locked = false;
    clearTimer();
    try {
      if (window.LAFinish) LAFinish.startTimer();
    } catch (_) {}
    sfx("click");
    render();
  }

  function topBar() {
    var pct = (index / ITEMS.length) * 100;
    return (
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      '<div class="wgt-progress"><span id="wgtFill" style="width:' + pct + '%"></span></div>' +
      '<span class="wgt-mode-tag">' + (index + 1) + " / " + ITEMS.length + "</span>" +
      '<span class="wgt-pill" id="scorePill">' + score + " / " + ITEMS.length + "</span>" +
      "</div>"
    );
  }

  function updatePills() {
    var sp = document.getElementById("scorePill");
    if (sp) sp.textContent = score + " / " + ITEMS.length;
    var st = document.getElementById("streakPill");
    if (st) {
      st.textContent = streak > 0 ? "🔥 " + streak : "—";
      st.className = "wgt-pill streak" + (streak >= 3 ? " is-hot" : "");
    }
  }

  function render() {
    clearTimer();
    locked = false;
    var item = ITEMS[order[index]];

    app.innerHTML =
      topBar() +
      '<div class="wgt-play">' +
      '<div class="wgt-phase">Question ' + (index + 1) + " of " + ITEMS.length + "</div>" +
      '<div class="su-prompt" id="wgtCard">' +
      '<div class="su-prompt-label">Write the short answer</div>' +
      '<p class="wgt-sentence" style="margin-bottom:12px">' + escapeHtml(item.q) + "</p>" +
      '<p class="wgt-sentence">' +
      escapeHtml(item.yesNo) +
      ' <span class="wgt-blank" id="blank">____________</span>' +
      "</p>" +
      "</div>" +
      '<div class="wgt-input-wrap">' +
      '<input class="wgt-input" id="answerInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="e.g. I am. / he isn\'t." maxlength="30" />' +
      '<button type="button" class="wgt-check" id="checkBtn">Check</button>' +
      "</div>" +
      '<div class="wgt-feedback" id="feedback"></div>' +
      "</div>";

    requestAnimationFrame(function () {
      var fill = document.getElementById("wgtFill");
      if (fill) fill.style.width = ((index + 1) / ITEMS.length) * 100 + "%";
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
    if (!String(val).trim()) {
      input.focus();
      return;
    }
    locked = true;
    var item = ITEMS[order[index]];
    var ok = isCorrect(val, item.accepts);
    var card = document.getElementById("wgtCard");
    var blank = document.getElementById("blank");
    var feedback = document.getElementById("feedback");
    var checkBtn = document.getElementById("checkBtn");

    input.disabled = true;
    if (checkBtn) checkBtn.disabled = true;

    if (ok) {
      score += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      sfx("correct");
      if (card) card.classList.add("is-correct");
      if (blank) {
        blank.textContent = item.display;
        blank.classList.add("ok");
      }
      feedback.textContent = streak >= 3 ? "Correct! 🔥 " + streak : "Correct!";
      feedback.className = "wgt-feedback ok show";
      updatePills();
      advanceTimer = setTimeout(next, 800);
    } else {
      streak = 0;
      sfx("wrong");
      if (card) card.classList.add("is-wrong");
      if (blank) {
        blank.textContent = val.trim() || "—";
        blank.classList.add("bad");
        setTimeout(function () {
          blank.textContent = item.display;
          blank.classList.remove("bad");
          blank.classList.add("ok");
        }, 550);
      }
      feedback.innerHTML = "Answer: <strong>" + escapeHtml(item.yesNo + " " + item.display) + "</strong>";
      feedback.className = "wgt-feedback bad show";
      updatePills();
      advanceTimer = setTimeout(next, 1600);
    }
  }

  function next() {
    clearTimer();
    if (index + 1 >= order.length) {
      finish();
      return;
    }
    if (window.ArcadeFX && order.length >= 8 && index + 1 === Math.floor(order.length / 2)) ArcadeFX.cheer(0, 2, "Halfway there — " + (index + 1) + " of " + order.length + " done");
    index += 1;
    render();
  }

  function finish() {
    clearTimer();
    sfx("win");
    var total = ITEMS.length;
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
    // Fallback when LAFinish is unavailable
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
