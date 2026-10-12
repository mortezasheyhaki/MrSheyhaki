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
    var _k = c[1] + "|" + c[2], _n = Date.now(); if (api._bk === _k && _n - (api._bt || 0) < 2500) return; api._bk = _k; api._bt = _n; var _old = document.querySelectorAll(".afx-burst"); for (var _i = 0; _i < _old.length; _i++) if (_old[_i].parentNode) _old[_i].parentNode.removeChild(_old[_i]); 
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

/* What is it? / What are they? – 2 parts · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-what-is-it";


  /* ---------- sound effects (Web Audio) ---------- */
  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function sfxTone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.1);
    sfxTone(659.25, t + 0.08, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.16, 0.16, "sine", 0.09);
  }).apply(this, arguments); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(220, t, 0.14, "sawtooth", 0.05, 140);
    sfxTone(180, t + 0.05, 0.14, "triangle", 0.04, 120);
  }).apply(this, arguments); }
  function sfxClick() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(720, ctx.currentTime, 0.045, "sine", 0.04);
  }).apply(this, arguments); }
  function sfxComplete() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.09);
    sfxTone(659.25, t + 0.1, 0.1, "triangle", 0.09);
    sfxTone(783.99, t + 0.2, 0.12, "triangle", 0.1);
    sfxTone(1046.5, t + 0.32, 0.22, "sine", 0.08);
  }).apply(this, arguments); }

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const SINGULAR = [
    {
      id: "book",
      image: "https://cdn.imgurl.ir/uploads/y7168_book.png",
      answers: ["it's a book", "it is a book", "a book", "book"],
      label: "It's a book.",
      answerAudio: "https://cdn.imgurl.ir/uploads/t34153_its-a-book.mp3",
    },
    {
      id: "watch",
      image: "https://cdn.imgurl.ir/uploads/n665390_watch.png",
      answers: ["it's a watch", "it is a watch", "a watch", "watch"],
      label: "It's a watch.",
      answerAudio: "https://cdn.imgurl.ir/uploads/c46227_its-a-watch.mp3",
    },
    {
      id: "dictionary",
      image: "https://cdn.imgurl.ir/uploads/y2043_dictionary.png",
      answers: ["it's a dictionary", "it is a dictionary", "a dictionary", "dictionary"],
      label: "It's a dictionary.",
      answerAudio: "https://cdn.imgurl.ir/uploads/h512063_its-a-dictionary.mp3",
    },
    {
      id: "key",
      image: "https://cdn.imgurl.ir/uploads/h49467_key.png",
      answers: ["it's a key", "it is a key", "a key", "key"],
      label: "It's a key.",
      answerAudio: "https://cdn.imgurl.ir/uploads/e60883_its-a-key.mp3",
    },
  ];

  const PLURAL = [
    {
      id: "books",
      image: "https://cdn.imgurl.ir/uploads/v63154_books.png",
      answers: ["they're books", "they are books", "books"],
      label: "They're books.",
      answerAudio: "https://cdn.imgurl.ir/uploads/q017440_theyre-books.mp3",
    },
    {
      id: "watches",
      image: "https://cdn.imgurl.ir/uploads/q88152_watches.png",
      answers: ["they're watches", "they are watches", "watches"],
      label: "They're watches.",
      answerAudio: "https://cdn.imgurl.ir/uploads/e653533_theyre-watches.mp3",
    },
    {
      id: "dictionaries",
      image: "https://cdn.imgurl.ir/uploads/q734326_dictionaries.png",
      answers: ["they're dictionaries", "they are dictionaries", "dictionaries"],
      label: "They're dictionaries.",
      answerAudio: "https://cdn.imgurl.ir/uploads/q99145_theyre-dictionaries.mp3",
    },
    {
      id: "keys",
      image: "https://cdn.imgurl.ir/uploads/z232297_keys.png",
      answers: ["they're keys", "they are keys", "keys"],
      label: "They're keys.",
      answerAudio: "https://cdn.imgurl.ir/uploads/w235122_theyre-keys.mp3",
    },
  ];

  const PARTS = [
    {
      id: "singular",
      title: "What is it?",
      tip: "Look at the picture. Answer: It's a…",
      question: "What is it?",
      questionAudio: "https://cdn.imgurl.ir/uploads/j136490_what-is-it.mp3",
      items: SINGULAR,
    },
    {
      id: "plural",
      title: "What are they?",
      tip: "Look at the picture. Answer: They're…",
      question: "What are they?",
      questionAudio: "https://cdn.imgurl.ir/uploads/198598_what-are-they.mp3",
      items: PLURAL,
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let phase = "menu";
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;
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

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s\-']/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    for (let i = 0; i < answers.length; i++) {
      const a = normalize(answers[i]);
      if (!a) continue;
      if (u === a || u.includes(a) || a.includes(u)) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio(src, onEnd) {
    if (!src) {
      if (onEnd) onEnd();
      return;
    }
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    const btn = app.querySelector(".wi-q-play, .mc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      if (onEnd) onEnd();
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    partIndex = 0;
    totalScore = 0;
    totalItems = 0;
    score = 0;
    beginPart(0);
  }

  function beginPart(pi) {
    partIndex = pi;
    order = shuffle(PARTS[partIndex].items.slice());
    idx = 0;
    score = 0;
    locked = false;
    stopAudio();
    stopListening();
    phase = "play";
    loadItem();
  }

  function startPart(pi) {
    // kept for finish-screen "Again" compatibility
    if (window.LAFinish) LAFinish.startTimer();
    totalScore = 0;
    totalItems = 0;
    beginPart(pi);
  }

  function loadItem() {
    locked = false;
    stopAudio();
    stopListening();
    phase = "play";
    render();
    const part = PARTS[partIndex];
    setTimeout(() => playAudio(part.questionAudio), 350);
    setTimeout(() => {
      const input = document.getElementById("wi-input");
      if (input) input.focus();
    }, 200);
  }

  function stopListening() {
    listening = false;
    const btn = document.getElementById("wi-mic");
    if (btn) btn.classList.remove("is-listening");
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (_) {}
    }
  }

  function startListening() {
    if (locked) return;
    if (!SpeechRecognitionAPI) {
      setFb("Voice not supported — please type.", "warn");
      return;
    }
    if (listening) {
      stopListening();
      setFb("Tap 🎤 and say the answer.", "");
      return;
    }
    stopAudio();
    if (!recognition) {
      recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.continuous = false;
    }
    listening = true;
    const btn = document.getElementById("wi-mic");
    if (btn) btn.classList.add("is-listening");
    setFb("Listening…", "");

    recognition.onresult = (ev) => {
      const alts = [];
      try {
        const res = ev.results[0];
        for (let i = 0; i < res.length; i++) {
          if (res[i] && res[i].transcript) alts.push(res[i].transcript.trim());
        }
      } catch (_) {}
      const best = alts[0] || "";
      const input = document.getElementById("wi-input");
      if (input && best) input.value = best;
      stopListening();
      if (best) checkAnswer();
      else setFb("Didn't catch that — try again.", "warn");
    };
    recognition.onerror = (ev) => {
      stopListening();
      const err = (ev && ev.error) || "";
      if (err === "not-allowed") setFb("Microphone blocked — type the answer.", "warn");
      else setFb("Couldn't hear — try typing.", "warn");
    };
    recognition.onend = () => {
      if (listening) {
        listening = false;
        if (btn) btn.classList.remove("is-listening");
      }
    };
    try {
      recognition.start();
    } catch (_) {
      stopListening();
      setFb("Mic busy — try again.", "warn");
    }
  }

  function setFb(text, cls) {
    const fb = document.getElementById("wi-feedback");
    if (!fb) return;
    fb.textContent = text || "";
    fb.className = "wi-feedback" + (cls ? " " + cls : "");
  }

  function checkAnswer() {
    if (locked) return;
    const input = document.getElementById("wi-input");
    if (!input) return;
    const user = input.value;
    if (!normalize(user)) {
      input.focus();
      setFb("Type or say the answer first.", "warn");
      return;
    }

    locked = true;
    input.disabled = true;
    const checkBtn = document.getElementById("wi-check");
    if (checkBtn) checkBtn.disabled = true;
    const micBtn = document.getElementById("wi-mic");
    if (micBtn) micBtn.disabled = true;
    stopListening();

    const item = order[idx];
    const ok = isCorrect(user, item.answers);

    if (ok) {
      sfxCorrect();
      score += 1;
      input.classList.add("is-correct");
      setFb("Correct! " + item.label, "ok");
    } else {
      sfxWrong();
      input.classList.add("is-wrong");
      setFb(item.label, "bad");
    }

    // Play answer audio after submit, then advance
    playAudio(item.answerAudio, () => {
      setTimeout(() => {
        totalItems += 1;
        if (idx < order.length - 1) {
          idx += 1;
          loadItem();
        } else {
          // Finished this part
          totalScore += score;
          if (partIndex < PARTS.length - 1) {
            // Bridge to next part
            phase = "bridge";
            render();
          } else {
            phase = "done";
            render();
          }
        }
      }, 500);
    });
  }

  function calcStars() {
    const total = SINGULAR.length + PLURAL.length; // 8
    const s = totalScore;
    if (s >= total) return 3;
    if (s >= Math.ceil(total * 0.66)) return 2;
    if (s >= Math.ceil(total * 0.33)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">What is it?</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">❓</div>
          <h1>What is it?</h1>
          <p class="mc-desc">Look · Listen · Write the full sentence</p>
          <ul class="mp-rules wi-rules">
            <li><b>Part 1</b> — What is it? → <b>It's a…</b></li>
            <li><b>Part 2</b> — What are they? → <b>They're…</b></li>
          </ul>
          <p class="mc-desc wi-hint">Capital letters and full stops (.) are optional — but write the whole sentence.</p>
          <button type="button" class="mc-btn" id="wi-start">Start</button>
        </section>`;
      document.getElementById("wi-start").onclick = () => startGame();
      return;
    }

    if (phase === "bridge") {
      const next = PARTS[partIndex + 1];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">What is it?</span>
          <span class="mc-badge">Part ${partIndex + 2}</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">➡️</div>
          <h1>Part ${partIndex + 2}</h1>
          <p class="mc-desc"><strong>${next.title}</strong></p>
          <p class="mc-desc">${next.tip}</p>
          <p class="mp-record">Score so far: <strong>${totalScore}</strong> / ${SINGULAR.length}</p>
          <button type="button" class="mc-btn" id="wi-next-part">Continue</button>
        </section>`;
      document.getElementById("wi-next-part").onclick = () => beginPart(partIndex + 1);
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      const grandTotal = SINGULAR.length + PLURAL.length;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalScore,
          total: grandTotal,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done — ${totalScore} / ${grandTotal}</p><button type="button" id="u3a-again">Again</button>`;
      document.getElementById("u3a-again").onclick = () => startGame();
      return;
    }

    // play
    const part = PARTS[partIndex];
    const item = order[idx];

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${part.title}</span>
        <span class="mc-progress">${partIndex + 1}/2 · ${idx + 1}/${order.length}</span>
      </header>
      <div class="wi-stage">
        <div class="wi-card">
          <div class="wi-question">
            <button type="button" class="mc-play wi-q-play" aria-label="Play question">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
            <div class="wi-q-copy">
              <span class="wi-q-label">Listen & answer</span>
              <span class="wi-q-text">${part.question}</span>
            </div>
          </div>
          <div class="wi-pic-wrap">
            <img class="wi-pic" src="${item.image}" alt="Look" draggable="false">
          </div>
          <div class="wi-answer">
            <label class="wi-answer-label" for="wi-input">Your sentence</label>
            <div class="wi-input-row">
              <input type="text" id="wi-input" class="wi-input" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="e.g. It's a key." enterkeyhint="done">
              <button type="button" class="wi-mic" id="wi-mic" aria-label="Say the answer" title="Say the answer">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>
              </button>
            </div>
            <p class="wi-feedback" id="wi-feedback">Write the full sentence, then Check</p>
            <button type="button" class="mc-btn wi-check-btn" id="wi-check">Check answer</button>
          </div>
        </div>
      </div>`;

    app.querySelector(".wi-q-play").onclick = () => playAudio(part.questionAudio);
    document.getElementById("wi-check").onclick = () => checkAnswer();
    var inputEl = document.getElementById("wi-input");
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    // Mobile keyboard: keep input + Check visible above the keyboard
    function ensureAnswerVisible() {
      var row = app.querySelector(".wi-answer") || inputEl;
      try {
        row.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch (err) {
        try { row.scrollIntoView(true); } catch (e2) {}
      }
      // Second pass after keyboard animation
      setTimeout(function () {
        try {
          row.scrollIntoView({ block: "center", behavior: "smooth" });
        } catch (err2) {}
      }, 350);
    }
    inputEl.addEventListener("focus", ensureAnswerVisible);
    inputEl.addEventListener("click", ensureAnswerVisible);
    if (window.visualViewport) {
      var vvHandler = function () {
        if (document.activeElement === inputEl) ensureAnswerVisible();
      };
      window.visualViewport.addEventListener("resize", vvHandler);
      window.visualViewport.addEventListener("scroll", vvHandler);
    }
    document.getElementById("wi-mic").onclick = () => startListening();
    // Autofocus on non-touch desktops only (avoid forcing keyboard on mobile)
    if (!("ontouchstart" in window)) {
      setTimeout(function () { try { inputEl.focus(); } catch (e) {} }, 80);
    }
  }


  function ensureFieldVisible(el) {
    if (!el) return;
    var target = el.closest(".ll-card, .lsp-card, .sp-card, .qa-card, .wi-card, .lw-card, .ll-stage, .lsp-stage, .sp-stage, .qa-stage, .wi-stage") || el;
    try { target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { try { target.scrollIntoView(true); } catch (e2) {} }
    setTimeout(function () {
      try { target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e3) {}
    }, 350);
  }
  function bindKeyboardFix(root) {
    root = root || document;
    var inputs = root.querySelectorAll('input[type="text"], input.ll-input, input.lsp-input, input.sp-input, input.qa-input, input.lw-input, input.wi-input');
    inputs.forEach(function (inp) {
      if (inp.dataset.kbFix) return;
      inp.dataset.kbFix = "1";
      inp.addEventListener("focus", function () { ensureFieldVisible(inp); });
      inp.addEventListener("click", function () { ensureFieldVisible(inp); });
    });
    if (window.visualViewport && !window.__proKbVV) {
      window.__proKbVV = true;
      var onVV = function () {
        var ae = document.activeElement;
        if (ae && ae.tagName === "INPUT") ensureFieldVisible(ae);
      };
      window.visualViewport.addEventListener("resize", onVV);
      window.visualViewport.addEventListener("scroll", onVV);
    }
  }

  // Re-bind after UI paints
  var _origRenderDone = true;
  document.addEventListener('focusin', function (e) {
    if (e.target && e.target.tagName === 'INPUT') ensureFieldVisible(e.target);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function () {
      var ae = document.activeElement;
      if (ae && ae.tagName === 'INPUT') ensureFieldVisible(ae);
    });
  }

  render();
})();
