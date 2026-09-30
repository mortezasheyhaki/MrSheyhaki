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

/* Going to — About You · write or speak · AEF 1 Unit 10B
   Communicative: Are you going to…?  → Yes, I am. / No, I'm not. / I'm going to…
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

  var GAME_ID = "1-10b-going-to-about-you";
  var SET_SIZE = 8;
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var speechSupported = !!SpeechRecognition;

  /* Fragments from the worksheet → full "Are you going to…?" questions */
  var BANK = [
    "go abroad next summer",
    "go shopping this week",
    "have lunch with your family tomorrow",
    "go to bed early tonight",
    "watch TV this evening",
    "buy anyone a present this month",
    "go out next Saturday night",
    "study English on the weekend",
    "celebrate a friend's birthday next week",
    "do your homework this evening",
    "make dinner tonight",
    "come to the next class",
    "stay in bed late next Sunday",
    "play any sports tomorrow",
    "meet your friends next Friday",
    "get up before 8 o'clock tomorrow",
    "use your computer this evening",
    "spend time with your family this weekend",
    "work or study late this week",
    "go for a walk later today"
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
  var recognition = null;
  var listening = false;

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

  function fullQuestion(fragment) {
    return "Are you going to " + fragment + "?";
  }

  /* Aggressive normalize for speech + typing */
  function normalize(s) {
    s = String(s || "").toLowerCase().trim();
    s = s.replace(/[’‘]/g, "'");
    s = s.replace(/[.?!,"]+/g, " ");
    s = s.replace(/\s+/g, " ").trim();
    // expand contractions
    s = s.replace(/\bi'm\b/g, "i am");
    s = s.replace(/\bi'll\b/g, "i will");
    s = s.replace(/\bisn't\b/g, "is not");
    s = s.replace(/\baren't\b/g, "are not");
    s = s.replace(/\bwon't\b/g, "will not");
    s = s.replace(/\bdon't\b/g, "do not");
    s = s.replace(/\bcan't\b/g, "cannot");
    // speech variants
    s = s.replace(/\byeah\b/g, "yes");
    s = s.replace(/\byep\b/g, "yes");
    s = s.replace(/\byup\b/g, "yes");
    s = s.replace(/\bnope\b/g, "no");
    s = s.replace(/\bgonna\b/g, "going to");
    s = s.replace(/\bgoin to\b/g, "going to");
    s = s.replace(/\bgoing 2\b/g, "going to");
    s = s.replace(/\bi am gonna\b/g, "i am going to");
    // collapse repeated spaces again
    s = s.replace(/\s+/g, " ").trim();
    return s;
  }

  /**
   * Accept valid short answers or full "I am going to…" answers.
   * Precise: must clearly affirm/deny with correct be-form, or use going to.
   */
  function validateAnswer(raw) {
    var n = normalize(raw);
    if (!n || n.length < 2) {
      return { ok: false, msg: "Please type or say your answer." };
    }

    // Exact short answers (after normalize: "i am" not "i'm")
    var exactYes = [
      "yes",
      "yes i am",
      "yes i am going to",
      "i am",
      "i am going to"
    ];
    var exactNo = [
      "no",
      "no i am not",
      "no i am not going to",
      "i am not",
      "i am not going to"
    ];

    for (var i = 0; i < exactYes.length; i++) {
      if (n === exactYes[i]) return { ok: true, kind: "yes" };
    }
    for (var j = 0; j < exactNo.length; j++) {
      if (n === exactNo[j]) return { ok: true, kind: "no" };
    }

    // Starts with yes/no + valid continuation
    if (/^yes\b/.test(n)) {
      var afterYes = n.replace(/^yes\s*/, "");
      if (
        afterYes === "" ||
        /^i am\b/.test(afterYes) ||
        /^i am going to\b/.test(afterYes) ||
        /^going to\b/.test(afterYes)
      ) {
        // "yes" alone ok; "yes i am …" ok; need substance if longer
        if (afterYes === "" || afterYes === "i am" || afterYes === "i am going to") {
          return { ok: true, kind: "yes" };
        }
        if (/^i am going to\b/.test(afterYes) && afterYes.length > 14) {
          return { ok: true, kind: "yes" };
        }
        if (/^i am\b/.test(afterYes)) return { ok: true, kind: "yes" };
        return {
          ok: false,
          msg: "Try: Yes, I am. or Yes, I'm going to…"
        };
      }
      return { ok: false, msg: "Try: Yes, I am. or Yes, I'm going to…" };
    }

    if (/^no\b/.test(n)) {
      var afterNo = n.replace(/^no\s*/, "");
      if (
        afterNo === "" ||
        /^i am not\b/.test(afterNo) ||
        /^i am not going to\b/.test(afterNo)
      ) {
        return { ok: true, kind: "no" };
      }
      return { ok: false, msg: "Try: No, I'm not. or No, I'm not going to…" };
    }

    // Full answer without yes/no: must include "i am going to" or "i am not"
    if (/\bi am going to\b/.test(n)) {
      var rest = n.replace(/\bi am going to\b/, "").trim();
      if (rest.length >= 1) return { ok: true, kind: "open" };
      return { ok: false, msg: "Add more after I'm going to…" };
    }
    if (/\bi am not going to\b/.test(n) || /\bi am not\b/.test(n)) {
      return { ok: true, kind: "no" };
    }

    return {
      ok: false,
      msg: "Use: Yes, I am. / No, I'm not. or I'm going to…"
    };
  }

  function micSvg() {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>' +
      "</svg>"
    );
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try {
        recognition.stop();
      } catch (_) {}
    }
    var btn = document.getElementById("micBtn");
    var heard = document.getElementById("heardLine");
    if (btn) {
      btn.classList.remove("is-listening");
      btn.setAttribute("aria-pressed", "false");
    }
    if (heard && heard.classList.contains("is-listening")) {
      heard.classList.remove("is-listening");
      if (!heard.dataset.keep) heard.textContent = speechSupported
        ? "Tap the mic to speak, or type your answer"
        : "Type your answer";
    }
  }

  function setupRecognition() {
    if (!speechSupported) return null;
    if (recognition) return recognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    recognition.onstart = function () {
      listening = true;
      var btn = document.getElementById("micBtn");
      var heard = document.getElementById("heardLine");
      if (btn) {
        btn.classList.add("is-listening");
        btn.setAttribute("aria-pressed", "true");
      }
      if (heard) {
        heard.textContent = "Listening… speak now";
        heard.className = "wgt-heard is-listening";
        delete heard.dataset.keep;
      }
    };

    recognition.onresult = function (event) {
      var interim = "";
      var finals = [];
      for (var i = 0; i < event.results.length; i++) {
        var res = event.results[i];
        if (res.isFinal) {
          // collect all alternatives for better matching
          for (var a = 0; a < res.length; a++) {
            finals.push(res[a].transcript);
          }
        } else {
          interim += res[0].transcript;
        }
      }

      var input = document.getElementById("answerInput");
      var heard = document.getElementById("heardLine");

      if (interim && input && !finals.length) {
        input.value = interim;
        if (heard) {
          heard.textContent = "Heard: " + interim;
          heard.className = "wgt-heard is-listening";
        }
      }

      if (finals.length) {
        // Pick best alternative that validates; else first
        var best = finals[0];
        for (var f = 0; f < finals.length; f++) {
          if (validateAnswer(finals[f]).ok) {
            best = finals[f];
            break;
          }
        }
        if (input) input.value = best;
        if (heard) {
          heard.textContent = "Heard: " + best;
          heard.className = "wgt-heard";
          heard.dataset.keep = "1";
        }
        // auto-check after a short pause for natural speech end
        setTimeout(function () {
          if (!locked) submit();
        }, 280);
      }
    };

    recognition.onerror = function (event) {
      listening = false;
      var btn = document.getElementById("micBtn");
      var heard = document.getElementById("heardLine");
      if (btn) {
        btn.classList.remove("is-listening");
        btn.setAttribute("aria-pressed", "false");
      }
      var msg = "Couldn't hear you — try again.";
      if (event.error === "not-allowed") {
        msg = "Microphone blocked. Allow mic access and try again.";
      } else if (event.error === "no-speech") {
        msg = "No speech detected. Tap the mic and speak clearly.";
      }
      if (heard) {
        heard.textContent = msg;
        heard.className = "wgt-heard";
      }
    };

    recognition.onend = function () {
      listening = false;
      var btn = document.getElementById("micBtn");
      if (btn) {
        btn.classList.remove("is-listening");
        btn.setAttribute("aria-pressed", "false");
      }
    };

    return recognition;
  }

  function toggleMic() {
    if (locked) return;
    if (!speechSupported) {
      var heard = document.getElementById("heardLine");
      if (heard) {
        heard.textContent = "Voice not supported — please type (use Chrome or Edge).";
        heard.className = "wgt-heard";
      }
      return;
    }
    if (listening) {
      stopListening();
      return;
    }
    setupRecognition();
    if (!recognition) return;
    try {
      recognition.start();
    } catch (_) {
      try {
        recognition.stop();
        setTimeout(function () {
          try {
            recognition.start();
          } catch (e2) {}
        }, 200);
      } catch (e) {}
    }
  }

  function showStart() {
    clearTimer();
    stopListening();
    locked = false;
    app.innerHTML =
      '<div class="wgt-top">' +
      '<a class="wgt-back" href="../" aria-label="Back">←</a>' +
      "</div>" +
      '<div class="wgt-start">' +
      '<div class="wgt-hero" aria-hidden="true">🗣️</div>' +
      "<h1>Going to — About You</h1>" +
      "<p>Answer <strong>Are you going to…?</strong> questions about your plans. Type or use the <strong>microphone</strong>.</p>" +
      '<p style="font-size:0.9rem;opacity:0.8">Example: <strong>Yes, I am.</strong> · <strong>No, I\'m not.</strong> · <strong>I\'m going to stay home.</strong></p>' +
      '<button type="button" class="wgt-btn" id="startBtn">Start</button>' +
      "</div>";
    document.getElementById("startBtn").onclick = start;
  }

  function start() {
    stopListening();
    items = shuffle(BANK).slice(0, SET_SIZE);
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
    stopListening();
    locked = false;
    var frag = items[index];
    var q = fullQuestion(frag);

    app.innerHTML =
      topBar() +
      '<div class="wgt-play">' +
      '<div class="wgt-phase">Question ' + (index + 1) + " of " + items.length + "</div>" +
      '<div class="su-prompt" id="wgtCard">' +
      '<div class="su-prompt-label">Type or speak your answer</div>' +
      '<p class="wgt-sentence">' + escapeHtml(q) + "</p>" +
      '<div class="wgt-hint" style="margin-top:10px;font-size:0.85rem;opacity:0.75">' +
      "Yes, I am. · No, I'm not. · I'm going to…" +
      "</div>" +
      "</div>" +
      '<div class="wgt-input-wrap wgt-answer-row">' +
      '<input class="wgt-input" id="answerInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="true" placeholder="Yes, I am. / I\'m going to…" maxlength="140" />' +
      '<button type="button" class="wgt-mic-btn" id="micBtn" aria-label="Microphone" aria-pressed="false"' +
      (speechSupported ? "" : " disabled title=\"Voice not supported\"") +
      ">" +
      micSvg() +
      "</button>" +
      '<button type="button" class="wgt-check" id="checkBtn">Check</button>' +
      "</div>" +
      '<div class="wgt-heard" id="heardLine">' +
      (speechSupported
        ? "Tap the mic to speak, or type your answer"
        : "Type your answer") +
      "</div>" +
      '<div class="wgt-feedback" id="feedback"></div>' +
      "</div>";

    requestAnimationFrame(function () {
      var fill = document.getElementById("wgtFill");
      if (fill) fill.style.width = ((index + 1) / items.length) * 100 + "%";
    });

    var input = document.getElementById("answerInput");
    var checkBtn = document.getElementById("checkBtn");
    var micBtn = document.getElementById("micBtn");
    input.focus();
    checkBtn.onclick = submit;
    if (micBtn) micBtn.onclick = toggleMic;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });
  }

  function submit() {
    if (locked) return;
    stopListening();
    var input = document.getElementById("answerInput");
    if (!input) return;
    var val = input.value;
    var result = validateAnswer(val);

    if (!result.ok) {
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
    var micBtn = document.getElementById("micBtn");
    if (checkBtn) checkBtn.disabled = true;
    if (micBtn) micBtn.disabled = true;

    score += 1;
    streak += 1;
    if (streak > bestStreak) bestStreak = streak;
    sfx("correct");

    var card = document.getElementById("wgtCard");
    var feedback = document.getElementById("feedback");
    var heard = document.getElementById("heardLine");
    if (card) card.classList.add("is-correct");
    if (feedback) {
      feedback.textContent = streak >= 3 ? "Great! 🔥 " + streak : "Nice!";
      feedback.className = "wgt-feedback ok show";
    }
    if (heard) {
      heard.textContent = "✓ " + val.trim();
      heard.className = "wgt-heard is-ok";
    }
    updatePills();
    advanceTimer = setTimeout(next, 800);
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
    stopListening();
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
