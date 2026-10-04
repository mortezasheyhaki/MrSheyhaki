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

/* Numbers Practice – Listen & write / Listen & say – AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-numbers-practice";

  const ITEMS = [
    { id: "11", num: "11", word: "eleven", audio: "https://cdn.imgurl.ir/uploads/h791947_11.mp3" },
    { id: "12", num: "12", word: "twelve", audio: "https://cdn.imgurl.ir/uploads/h46631_12.mp3" },
    { id: "13", num: "13", word: "thirteen", audio: "https://cdn.imgurl.ir/uploads/o209826_13.mp3" },
    { id: "14", num: "14", word: "fourteen", audio: "https://cdn.imgurl.ir/uploads/u43290_14.mp3" },
    { id: "15", num: "15", word: "fifteen", audio: "https://cdn.imgurl.ir/uploads/e012004_15.mp3" },
    { id: "16", num: "16", word: "sixteen", audio: "https://cdn.imgurl.ir/uploads/a742_16.mp3" },
    { id: "17", num: "17", word: "seventeen", audio: "https://cdn.imgurl.ir/uploads/n235443_17.mp3" },
    { id: "18", num: "18", word: "eighteen", audio: "https://cdn.imgurl.ir/uploads/v36087_18.mp3" },
    { id: "19", num: "19", word: "nineteen", audio: "https://cdn.imgurl.ir/uploads/e896460_19.mp3" },
    { id: "20", num: "20", word: "twenty", audio: "https://cdn.imgurl.ir/uploads/h0809_20.mp3" },
    { id: "30", num: "30", word: "thirty", audio: "https://cdn.imgurl.ir/uploads/p10946_30.mp3" },
    { id: "40", num: "40", word: "forty", audio: "https://cdn.imgurl.ir/uploads/n25017_40.mp3" },
    { id: "50", num: "50", word: "fifty", audio: "https://cdn.imgurl.ir/uploads/t431226_50.mp3" },
    { id: "60", num: "60", word: "sixty", audio: "https://cdn.imgurl.ir/uploads/l198108_60.mp3" },
    { id: "70", num: "70", word: "seventy", audio: "https://cdn.imgurl.ir/uploads/x326748_70.mp3" },
    { id: "80", num: "80", word: "eighty", audio: "https://cdn.imgurl.ir/uploads/x153920_80.mp3" },
    { id: "90", num: "90", word: "ninety", audio: "https://cdn.imgurl.ir/uploads/s491128_90.mp3" },
    { id: "100", num: "100", word: "a hundred", audio: "https://cdn.imgurl.ir/uploads/r297360_100.mp3", alts: ["hundred", "one hundred"] },
  ];

  const MODES = [
    { id: "write", title: "Listen & write", tip: "Listen, then type the word." },
    { id: "say", title: "Listen & say", tip: "Listen, then say the number." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let modeIndex = 0;
  let queue = [];
  let qi = 0;
  let correct = 0;
  let currentAudio = null;
  let recognition = null;
  let listening = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".np-play");
    if (btn) btn.classList.remove("playing");
  }

  function playItem(item) {
    if (!item || !item.audio) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".np-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function normalizeSpeech(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchWrite(val, item) {
    const raw = String(val || "").toLowerCase().trim();
    if (!raw) return false;
    // Prefer word answers (eleven, twelve, …)
    const cleaned = raw.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    const targets = [item.word].concat(item.alts || []).map(function (w) {
      return String(w).toLowerCase().trim();
    });
    if (targets.some(function (w) { return cleaned === w; })) return true;
    // Also accept "one hundred" / "hundred" for 100
    if (item.num === "100" && (cleaned === "hundred" || cleaned === "one hundred" || cleaned === "a hundred")) return true;
    return false;
  }

  function matchSay(transcript, item) {
    const t = normalizeSpeech(transcript);
    if (!t) return false;
    // digits spoken as digits
    const digits = t.replace(/\D/g, "");
    if (digits === item.num) return true;
    // word forms
    const targets = [item.word].concat(item.alts || []).map(normalizeSpeech);
    if (targets.some(function (w) { return t === w || t.indexOf(w) !== -1; })) return true;
    // number words sometimes come as "one hundred"
    if (item.num === "100" && (t.indexOf("hundred") !== -1)) return true;
    return false;
  }

  function tickHtml(label) {
    return '<span class="np-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> ' + label;
  }

  function stopListen() {
    listening = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    const mic = app.querySelector(".np-mic");
    if (mic) mic.classList.remove("listening");
  }

  function startListen(onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      onResult(null, "Speech recognition not supported in this browser.");
      return;
    }
    stopListen();
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    listening = true;
    const mic = app.querySelector(".np-mic");
    if (mic) mic.classList.add("listening");
    const status = document.getElementById("np-status");
    if (status) {
      status.className = "np-status";
      status.textContent = "Listening…";
    }
    recognition.onresult = function (e) {
      let best = "";
      for (let i = 0; i < e.results.length; i++) {
        for (let j = 0; j < e.results[i].length; j++) {
          const alt = e.results[i][j].transcript;
          if (alt && alt.length > best.length) best = alt;
        }
      }
      stopListen();
      onResult(best, null);
    };
    recognition.onerror = function () {
      stopListen();
      onResult(null, "Couldn’t hear that. Try again.");
    };
    recognition.onend = function () {
      if (listening) stopListen();
    };
    try {
      recognition.start();
    } catch (_) {
      stopListen();
      onResult(null, "Mic error. Try again.");
    }
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    queue = shuffle(ITEMS);
    qi = 0;
    correct = 0;
    phase = "play";
    stopAudio();
    stopListen();
    render();
    setTimeout(function () {
      playItem(queue[qi]);
    }, 300);
  }

  function nextOrDone() {
    if (qi >= queue.length - 1) {
      phase = "done";
      render();
      return;
    }
    qi += 1;
    render();
    setTimeout(function () {
      playItem(queue[qi]);
    }, 250);
  }

  function calcStars() {
    const n = queue.length || 1;
    const r = correct / n;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function render() {
    stopAudio();
    stopListen();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="np-topbar">' +
        '<a class="np-back" href="../" aria-label="Back">←</a>' +
        '<span class="np-title">Numbers Practice</span>' +
        '<span class="np-badge">2B</span>' +
        "</header>" +
        '<div class="np-body">' +
        '<section class="np-menu">' +
        '<div class="np-hero"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg></div>' +
        "<h1>Numbers Practice</h1>" +
        '<p class="np-menu-desc">11–20 and tens to 100<br>Choose a mode</p>' +
        '<div class="np-mode-list">' +
        '<button type="button" class="np-mode-btn" data-mi="0">' +
        '<span class="np-mode-num">1</span>' +
        "<div><strong>Listen &amp; write</strong><small>Hear the number → type the word</small></div>" +
        "</button>" +
        '<button type="button" class="np-mode-btn" data-mi="1">' +
        '<span class="np-mode-num">2</span>' +
        "<div><strong>Listen &amp; say</strong><small>Hear the number → say it</small></div>" +
        "</button>" +
        "</div>" +
        "</section>" +
        "</div>";
      app.querySelectorAll(".np-mode-btn").forEach(function (b) {
        b.onclick = function () { startMode(+b.dataset.mi); };
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correct,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startMode(modeIndex);
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const item = queue[qi];
    const pct = ((qi + 1) / queue.length) * 100;

    let main = "";
    if (mode.id === "write") {
      main =
        '<button type="button" class="np-play" id="np-play" aria-label="Play">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<div class="np-card is-hidden" id="np-card">' +'<span class="np-card-label">Number</span>' +'<span class="np-card-q">?</span>' +'<span class="np-card-num">' + item.num + '</span>' +'<span class="np-card-word">' + item.word + '</span>' +'</div>' +
        '<p class="np-tip">' + mode.tip + "</p>" +
        '<input type="text" class="np-input" id="np-input" placeholder="Type the word…" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
        '<button type="button" class="np-btn" id="np-check">Check</button>' +
        '<p class="np-status" id="np-status"></p>';
    } else {
      main =
        '<button type="button" class="np-play" id="np-play" aria-label="Play">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<div class="np-card is-hidden" id="np-card">' +'<span class="np-card-label">Number</span>' +'<span class="np-card-q">?</span>' +'<span class="np-card-num">' + item.num + '</span>' +'<span class="np-card-word">' + item.word + '</span>' +'</div>' +
        '<p class="np-tip">' + mode.tip + "</p>" +
        '<button type="button" class="np-mic" id="np-mic" aria-label="Speak">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        '<span class="np-mic-rings"><i></i><i></i><i></i></span>' +
        "</button>" +
        '<p class="np-status" id="np-status">Tap the microphone</p>';
    }

    app.innerHTML =
      '<header class="np-topbar">' +
      '<a class="np-back" href="../" aria-label="Back">←</a>' +
      '<span class="np-title">' + mode.title + "</span>" +
      '<span class="np-badge">' + (qi + 1) + " / " + queue.length + "</span>" +
      "</header>" +
      '<div class="np-track"><div class="np-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="np-body">' + main + "</div>";

    document.getElementById("np-play").onclick = function () {
      playItem(item);
    };

    if (mode.id === "write") {
      const input = document.getElementById("np-input");
      const status = document.getElementById("np-status");
      const check = function () {
        const val = input.value;
        if (!String(val || "").trim()) {
          status.className = "np-status is-bad";
          status.textContent = "Type the word first.";
          return;
        }
        if (matchWrite(val, item)) {
          correct += 1;
          status.className = "np-status is-ok";
          status.innerHTML = tickHtml("Correct!");
          input.disabled = true;
          var cardEl = document.getElementById("np-card");
          if (cardEl) { cardEl.classList.remove("is-hidden"); cardEl.classList.add("is-revealed"); }
          setTimeout(nextOrDone, 1100);
        } else {
          status.className = "np-status is-bad";
          status.textContent = "Try again!";
        }
      };
      document.getElementById("np-check").onclick = check;
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") check();
      });
      setTimeout(function () { input.focus(); }, 100);
    } else {
      const status = document.getElementById("np-status");
      const mic = document.getElementById("np-mic");
      mic.onclick = function () {
        if (listening) {
          stopListen();
          status.className = "np-status";
          status.textContent = "Tap the microphone";
          return;
        }
        startListen(function (transcript, err) {
          if (err) {
            status.className = "np-status is-bad";
            status.textContent = err;
            return;
          }
          if (matchSay(transcript, item)) {
            correct += 1;
            status.className = "np-status is-ok";
            status.innerHTML = tickHtml("Correct!");
            mic.classList.add("is-ok");
            var cardEl = document.getElementById("np-card");
            if (cardEl) { cardEl.classList.remove("is-hidden"); cardEl.classList.add("is-revealed"); }
            setTimeout(nextOrDone, 1100);
          } else {
            status.className = "np-status is-bad";
            status.textContent = "Try again! (heard: “" + (transcript || "…") + "”)";
          }
        });
      };
    }
  }

  render();
})();
