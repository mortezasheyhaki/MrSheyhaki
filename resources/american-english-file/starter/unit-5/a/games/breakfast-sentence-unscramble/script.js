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
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
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

/* Sentence Unscramble · Unit 5A
   Layout matched to Sentence Builder · be (Unit 1A) */
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

var GAME_ID = "starter-5a-breakfast-sentence-unscramble";

  var ITEMS = [
    {
      sentence: "I have a croissant and coffee.",
      audio: "https://cdn.imgurl.ir/uploads/g702134_I_have_a_crossiant_and_coffee.mp3"
    },
    {
      sentence: "I have breakfast at home.",
      audio: "https://cdn.imgurl.ir/uploads/k31529_I_have_breakfast_at_home.mp3"
    },
    {
      sentence: "I don't eat in the morning.",
      audio: "https://cdn.imgurl.ir/uploads/v175209_I_dont__in_the_morning.mp3"
    },
    {
      sentence: "I really like breakfast.",
      audio: "https://cdn.imgurl.ir/uploads/q682732_I_really_like_breakfast.mp3"
    },
    {
      sentence: "I have breakfast at home with my family.",
      audio: "https://cdn.imgurl.ir/uploads/53825_I_have_breakfast_at_home_with_my_family.mp3"
    },
    {
      sentence: "We have rice, fish and miso soup.",
      audio: "https://cdn.imgurl.ir/uploads/x235164_We_have_rice_fish_and_miso_soup.mp3"
    },
    {
      sentence: "We don't drink coffee.",
      audio: "https://cdn.imgurl.ir/uploads/z748713_We_don39t_drink_coffee.mp3"
    }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | listen | done
  var index = 0;
  var tokens = []; // correct order
  var pool = []; // { id, text, used }
  var selected = []; // texts in order (like SB)
  var locked = false;
  var score = 0;
  var listened = false;
  var currentAudio = null;
  var sfxCtx = null;
  var uid = 0;

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

  function tokenize(sentence) {
    return sentence.trim().split(/\s+/).filter(Boolean);
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }

  function tone(freq, start, dur, type, gain) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.1, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  function sfxClick() {
    try {
      if (window.LASfx && LASfx.click) LASfx.click();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(640, ctx.currentTime, 0.05, "sine", 0.07);
  }

  function sfxOk() { window.ArcadeFX && ArcadeFX.ok();
    try {
      if (window.LASfx && LASfx.correct) LASfx.correct();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.09, "triangle", 0.12);
    tone(659.25, t + 0.07, 0.1, "triangle", 0.12);
    tone(783.99, t + 0.14, 0.14, "sine", 0.1);
  }

  function sfxBad() { window.ArcadeFX && ArcadeFX.bad();
    try {
      if (window.LASfx && LASfx.wrong) LASfx.wrong();
    } catch (_) {}
    var ctx = getSfxCtx();
    if (!ctx) return;
    tone(200, ctx.currentTime, 0.12, "sawtooth", 0.06);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".su-play-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudio(forceListen) {
    var item = ITEMS[index];
    if (!item) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = app.querySelector(".su-play-btn");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
      if (forceListen) {
        listened = true;
        enableNext();
      }
    };
  }

  function enableNext() {
    var next = document.getElementById("su-next");
    if (next) {
      next.disabled = false;
      next.classList.remove("is-disabled");
    }
    var hint = document.getElementById("su-listen-hint");
    if (hint) {
      hint.textContent = "Great — continue to the next sentence.";
      hint.className = "su-listen-hint ok";
    }
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    score = 0;
    phase = "play";
    startRound();
  }

  function startRound() {
    if (index >= TOTAL) {
      finishGame();
      return;
    }
    locked = false;
    listened = false;
    stopAudio();
    tokens = tokenize(ITEMS[index].sentence);
    var scrambled = shuffle(tokens.slice());
    var tries = 0;
    while (scrambled.join(" ") === tokens.join(" ") && tokens.length > 2 && tries < 15) {
      scrambled = shuffle(tokens.slice());
      tries++;
    }
    uid = 0;
    pool = scrambled.map(function (t) {
      return { id: ++uid, text: t, used: false };
    });
    selected = [];
    phase = "play";
    render();
  }

  function clearAll() {
    if (locked) return;
    sfxClick();
    selected = [];
    pool.forEach(function (p) {
      p.used = false;
    });
    updateSlotsAndChips();
    var checkBtn = document.getElementById("su-check");
    if (checkBtn) checkBtn.disabled = true;
    var fb = document.getElementById("su-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "su-fb";
    }
  }

  function checkAnswer() {
    if (locked || selected.length !== tokens.length) return;
    locked = true;
    var ok = selected.join(" ") === tokens.join(" ");
    var slots = app.querySelectorAll(".su-slot");
    slots.forEach(function (slot, i) {
      slot.classList.remove("filled");
      slot.classList.add(ok ? "correct" : "wrong");
    });

    var checkBtn = document.getElementById("su-check");
    if (checkBtn) checkBtn.disabled = true;

    if (ok) { try{sfxCorrect();}catch(e){}
      sfxOk();
      score++;
      var fb = document.getElementById("su-fb");
      if (fb) {
        fb.textContent = "Perfect!";
        fb.className = "su-fb ok";
      }
      setTimeout(function () {
        phase = "listen";
        renderListenStep();
      }, 700);
    } else {
      sfxBad();
      var fb2 = document.getElementById("su-fb");
      if (fb2) {
        fb2.textContent = "Try again";
        fb2.className = "su-fb bad";
      }
      setTimeout(function () {
        locked = false;
        selected = [];
        pool.forEach(function (p) {
          p.used = false;
        });
        updateSlotsAndChips();
        if (checkBtn) checkBtn.disabled = true;
        if (fb2) {
          fb2.textContent = "";
          fb2.className = "su-fb";
        }
      }, 900);
    }
  }

  function renderListenStep() {
    var actions = document.getElementById("su-actions");
    var chipsEl = document.getElementById("su-chips");
    var label = app.querySelector(".su-prompt-label");
    if (label) label.textContent = "Listen to the sentence";
    if (chipsEl) chipsEl.innerHTML = "";
    if (actions) {
      actions.innerHTML =
        '<div class="su-listen-bar">' +
        '<button type="button" class="su-play-btn" id="su-play" aria-label="Play audio">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<span class="eq"><span></span><span></span><span></span><span></span></span>' +
        "</button>" +
        '<p class="su-listen-hint" id="su-listen-hint">Listening…</p>' +
        '<button type="button" class="su-btn su-btn-primary is-disabled" id="su-next" disabled style="max-width:260px;width:100%;">Next →</button>' +
        "</div>";
      document.getElementById("su-play").onclick = function () {
        playAudio(true);
      };
      document.getElementById("su-next").onclick = function () {
        if (!listened) return;
        index++;
        startRound();
      };
      // Auto-play audio after correct answer — no need to press Play
      setTimeout(function () {
        playAudio(true);
      }, 150);
    }
  }

  function updateSlotsAndChips() {
    var slotsEl = document.getElementById("su-slots");
    var chipsEl = document.getElementById("su-chips");
    if (!slotsEl || !chipsEl) return;

    // slots
    slotsEl.innerHTML = tokens
      .map(function (_, i) {
        var text = selected[i] || "";
        var cls = "su-slot" + (text ? " filled" : "");
        return (
          '<span class="' +
          cls +
          '" data-i="' +
          i +
          '">' +
          (text ? escapeHtml(text) : "") +
          "</span>"
        );
      })
      .join("");

    // chips
    chipsEl.innerHTML = pool
      .map(function (p) {
        return (
          '<button type="button" class="su-chip' +
          (p.used ? " used" : "") +
          '" data-id="' +
          p.id +
          '" data-text="' +
          escapeAttr(p.text) +
          '"' +
          (p.used ? " disabled" : "") +
          ">" +
          escapeHtml(p.text) +
          "</button>"
        );
      })
      .join("");

    // chip clicks
    chipsEl.querySelectorAll(".su-chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        if (locked) return;
        sfxClick();
        var id = +btn.dataset.id;
        var text = btn.dataset.text;
        var item = pool.find(function (p) {
          return p.id === id;
        });
        if (!item || item.used) return;
        item.used = true;
        selected.push(text);
        updateSlotsAndChips();
        var checkBtn = document.getElementById("su-check");
        if (checkBtn) checkBtn.disabled = selected.length !== tokens.length;
      };
    });

    // slot clicks (remove last matching)
    slotsEl.querySelectorAll(".su-slot.filled").forEach(function (slot) {
      slot.onclick = function () {
        if (locked) return;
        var i = +slot.dataset.i;
        if (i !== selected.length - 1) return; // only allow removing from end for simplicity
        sfxClick();
        var text = selected.pop();
        var item = pool
          .slice()
          .reverse()
          .find(function (p) {
            return p.used && p.text === text;
          });
        if (item) item.used = false;
        updateSlotsAndChips();
        var checkBtn = document.getElementById("su-check");
        if (checkBtn) checkBtn.disabled = selected.length !== tokens.length;
      };
    });
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

  function progressPct() {
    return Math.round((index / TOTAL) * 100);
  }

  function finishGame() {
    phase = "done";
    stopAudio();
    var timeMs = 0;
    try {
      if (window.LAFinish && LAFinish.stopTimer) timeMs = LAFinish.stopTimer();
    } catch (_) {}
    if (window.LAFinish) {
      try {
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          stars: score >= TOTAL ? 3 : score >= Math.min(TOTAL - 1, Math.ceil(TOTAL * 0.7)) ? 2 : score >= Math.max(1, Math.ceil(TOTAL * 0.4)) ? 1 : 0,
          timeMs: timeMs,
          onAgain: function () {
            startGame();
          },
          backHref: "../"
        });
      } catch (_) {}
    }
    // Keep a simple fallback behind the overlay in case LAFinish is missing
    render();
  }

  function render() {
    if (phase === "start") {
      stopAudio();
      app.innerHTML =
        '<div class="su-top">' +
        '<a class="su-back" href="../" aria-label="Back">←</a>' +
        "</div>" +
        '<div class="su-start">' +
        '<div class="su-hero" aria-hidden="true">🔤</div>' +
        "<h1>Sentence Unscramble</h1>" +
        "<p>Unscramble the breakfast sentences, then listen to each one.</p>" +
        '<button type="button" class="su-btn su-btn-primary" id="su-start" style="max-width:280px;width:100%;margin:0 auto;display:block;">Start</button>' +
        "</div>";
      document.getElementById("su-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var stars = score >= TOTAL ? 3 : score >= Math.min(TOTAL - 1, Math.ceil(TOTAL * 0.7)) ? 2 : score >= Math.max(1, Math.ceil(TOTAL * 0.4)) ? 1 : 0;
      var title =
        stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep practicing!";
      app.innerHTML =
        '<div class="su-top">' +
        '<a class="su-back" href="../" aria-label="Back">←</a>' +
        "</div>" +
        '<div class="su-start">' +
        "<h1>" +
        title +
        "</h1>" +
        "<p>You built <strong>" +
        score +
        "</strong> of " +
        TOTAL +
        " sentences.</p>" +
        '<button type="button" class="su-btn su-btn-primary" id="su-again" style="max-width:280px;width:100%;margin:0 auto;display:block;">Play again</button>' +
        "</div>";
      document.getElementById("su-again").onclick = startGame;
      return;
    }

    // play phase
    app.innerHTML =
      '<div class="su-top">' +
      '<a class="su-back" href="../" aria-label="Back">←</a>' +
      '<div class="su-progress"><span style="width:' +
      progressPct() +
      '%"></span></div>' +
      '<span class="su-mode-tag">' +
      (index + 1) +
      " / " +
      TOTAL +
      "</span>" +
      "</div>" +
      '<div class="su-play">' +
      '<div class="su-phase">Sentence ' +
      (index + 1) +
      "</div>" +
      '<div class="su-prompt">' +
      '<div class="su-prompt-label">Tap the words in the correct order</div>' +
      '<div class="su-slots" id="su-slots"></div>' +
      "</div>" +
      '<div class="su-chips" id="su-chips"></div>' +
      '<div class="su-actions" id="su-actions">' +
      '<button type="button" class="su-btn su-btn-ghost" id="su-clear">Clear</button>' +
      '<button type="button" class="su-btn su-btn-primary" id="su-check" disabled>Check ✓</button>' +
      "</div>" +
      '<div class="su-fb" id="su-fb" aria-live="polite"></div>' +
      "</div>";

    document.getElementById("su-clear").onclick = clearAll;
    document.getElementById("su-check").onclick = checkAnswer;
    updateSlotsAndChips();
  }

  render();
})();
