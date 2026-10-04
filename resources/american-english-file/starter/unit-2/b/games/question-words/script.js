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

/* Question Words – tap to complete · audio feedback · Unit 2B */
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


  const GAME_ID = "starter-2b-question-words";
  const BANK = ["How", "What", "Where", "Who"];

  const ITEMS = [
    {
      id: 1,
      blankAfter: " are you from?",
      correct: "Where",
      answer: "I'm from China.",
      audio: "https://cdn.imgurl.ir/uploads/g923681_where-from.mp3",
    },
    {
      id: 2,
      blankAfter: " are you?",
      correct: "How",
      answer: "Fine, thanks.",
      audio: "https://cdn.imgurl.ir/uploads/e466588_how-are-you.mp3",
    },
    {
      id: 3,
      blankAfter: "'s he?",
      correct: "Who",
      answer: "He's a friend.",
      audio: "https://cdn.imgurl.ir/uploads/e128228_whos-he.mp3",
    },
    {
      id: 4,
      blankAfter: "'s your name?",
      correct: "What",
      answer: "Molly.",
      audio: "https://cdn.imgurl.ir/uploads/t173632_whats-name.mp3",
    },
    {
      id: 5,
      blankAfter: "'s Alberta?",
      correct: "Where",
      answer: "It's in Canada.",
      audio: "https://cdn.imgurl.ir/uploads/45828_wheres-alberta.mp3",
    },
    {
      id: 6,
      blankAfter: " old are you?",
      correct: "How",
      answer: "26.",
      audio: "https://cdn.imgurl.ir/uploads/w6506_how-old.mp3",
    },
    {
      id: 7,
      blankAfter: "'s your cell phone number?",
      correct: "What",
      answer: "617-555-6879.",
      audio: "https://cdn.imgurl.ir/uploads/o0276_phone-number.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let index = 0;
  let locked = false;
  let totalCorrect = 0;
  let currentAudio = null;
  let chosen = null;

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(src, onEnd) {
    stopAudio();
    if (!src) {
      if (onEnd) onEnd();
      return;
    }
    const a = new Audio(src);
    currentAudio = a;
    a.play().catch(() => {
      if (onEnd) onEnd();
    });
    a.onended = () => {
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function calcStars() {
    const r = totalCorrect / ITEMS.length;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
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

  function start() {
    stopAudio();
    index = 0;
    locked = false;
    totalCorrect = 0;
    chosen = null;
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function goNext() {
    locked = false;
    chosen = null;
    if (index < ITEMS.length - 1) {
      index++;
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function pickWord(word) {
    if (locked || phase !== "play") return;
    const item = ITEMS[index];
    chosen = word;
    locked = true;

    const slot = app.querySelector(".qw-gap");
    const card = app.querySelector(".qw-card");
    const chips = app.querySelectorAll(".qw-chip");

    chips.forEach((c) => {
      c.classList.toggle("is-picked", c.dataset.word === word);
      c.disabled = true;
    });

    if (slot) {
      slot.textContent = word;
      slot.classList.remove("is-empty", "is-ok", "is-bad");
    }

    if (word === item.correct) {
      totalCorrect++;
      if (slot) slot.classList.add("is-ok");
      if (card) card.classList.add("is-success");
      // reveal answer with animation
      const ans = app.querySelector(".qw-answer");
      if (ans) {
        ans.classList.add("is-show");
      }
      const status = app.querySelector(".qw-status");
      if (status) {
        status.classList.add("is-ok", "is-playing");
        status.innerHTML =
          '<span class="qw-wave" aria-label="Playing">' +
          "<i></i><i></i><i></i><i></i><i></i>" +
          "</span>";
      }
      playAudio(item.audio, () => {
        if (status) {
          status.classList.remove("is-playing");
          status.textContent = "Great!";
        }
        setTimeout(goNext, 450);
      });
    } else {
      if (slot) slot.classList.add("is-bad");
      if (card) card.classList.add("is-shake");
      const status = app.querySelector(".qw-status");
      if (status) {
        status.textContent = "Try again";
        status.classList.add("is-bad");
      }
      setTimeout(() => {
        locked = false;
        chosen = null;
        if (slot) {
          slot.textContent = "····";
          slot.classList.remove("is-bad");
          slot.classList.add("is-empty");
        }
        if (card) card.classList.remove("is-shake");
        chips.forEach((c) => {
          c.disabled = false;
          c.classList.remove("is-picked");
        });
        if (status) {
          status.textContent = "Tap a question word";
          status.classList.remove("is-bad");
        }
      }, 700);
    }
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="qw-topbar">' +
        '<a class="qw-back" href="../" aria-label="Back">←</a>' +
        '<span class="qw-title">Question Words</span>' +
        '<span class="qw-badge">2B</span>' +
        "</header>" +
        '<section class="qw-start">' +
        '<div class="qw-hero" aria-hidden="true">❓</div>' +
        "<h1>Question Words</h1>" +
        '<p class="qw-desc">Tap <strong>How · What · Where · Who</strong> to complete each question. Then listen!</p>' +
        '<button type="button" class="qw-btn" id="qw-start">Start →</button>' +
        "</section>";
      document.getElementById("qw-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    const item = ITEMS[index];
    app.innerHTML =
      '<header class="qw-topbar">' +
      '<a class="qw-back" href="../" aria-label="Back">←</a>' +
      '<span class="qw-title">Question Words</span>' +
      '<span class="qw-progress">' +
      (index + 1) +
      " / " +
      ITEMS.length +
      "</span>" +
      "</header>" +
      '<div class="qw-play">' +
      '<div class="qw-stage">' +
      '<div class="qw-card" id="qw-card">' +
      '<div class="qw-card-label">A · Complete the question</div>' +
      '<p class="qw-question">' +
      '<span class="qw-gap is-empty" aria-live="polite">····</span>' +
      '<span class="qw-rest">' +
      item.blankAfter +
      "</span>" +
      "</p>" +
      '<div class="qw-answer" aria-live="polite">' +
      '<span class="qw-b-tag">B</span>' +
      '<span class="qw-b-text">' +
      item.answer +
      "</span>" +
      "</div>" +
      "</div>" +
      '<p class="qw-status">Tap a question word</p>' +
      "</div>" +
      '<div class="qw-dock" role="group" aria-label="Question words">' +
      BANK.map(
        (w) =>
          '<button type="button" class="qw-chip" data-word="' +
          w +
          '">' +
          w +
          "</button>"
      ).join("") +
      "</div>" +
      "</div>";

    app.querySelectorAll(".qw-chip").forEach((chip) => {
      chip.onclick = () => pickWord(chip.dataset.word);
    });
  }

  render();
})();
