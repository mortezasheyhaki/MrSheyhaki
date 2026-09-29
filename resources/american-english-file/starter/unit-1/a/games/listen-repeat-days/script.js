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
    var app = document.getElementById("game-app");
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, r.bottom + 8) + "px";
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
    var app = document.getElementById("game-app"); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim();
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
    var app = document.getElementById("game-app"); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* Listen & Repeat – days of the week (speech recognition) */
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
  // Local aliases used by many games
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  // Auto-play on common feedback class tokens (debounced)
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


  const GAME_ID = "starter-1a-listen-repeat-days";
  const DAYS = [
    { id: "monday", label: "Monday", answers: ["monday"], file: "audio/Monday.mp3" },
    { id: "tuesday", label: "Tuesday", answers: ["tuesday"], file: "audio/Tuesday.mp3" },
    { id: "wednesday", label: "Wednesday", answers: ["wednesday"], file: "audio/Wednesday.mp3" },
    { id: "thursday", label: "Thursday", answers: ["thursday"], file: "audio/Thursday.mp3" },
    { id: "friday", label: "Friday", answers: ["friday"], file: "audio/Friday.mp3" },
    { id: "saturday", label: "Saturday", answers: ["saturday"], file: "audio/Saturday.mp3" },
    { id: "sunday", label: "Sunday", answers: ["sunday"], file: "audio/Sunday.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasSpeech = typeof SpeechRecognition === "function";

  let mode = "start"; // start | play | result
  let target = null;
  let score = 0;
  let round = 0;
  const TOTAL = 7;
  let used = [];
  let audio = null;
  let audioToken = 0;
  let playing = false;
  let locked = false;
  let listening = false;
  let recognition = null;
  let nextTimer = null;

  function pickDay() {
    const pool = DAYS.filter((d) => !used.includes(d.id));
    if (!pool.length) {
      used = [];
      return DAYS[Math.floor(Math.random() * DAYS.length)];
    }
    const d = pool[Math.floor(Math.random() * pool.length)];
    used.push(d.id);
    return d;
  }

  function clearNextTimer() {
    if (nextTimer) {
      clearTimeout(nextTimer);
      nextTimer = null;
    }
  }

  function stopAudio() {
    audioToken += 1;
    playing = false;
    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.muted = true;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      } catch (e) {}
      audio = null;
    }
    setPlayUI(false);
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (e) {}
      recognition = null;
    }
    setMicUI(false);
  }

  function playTarget() {
    if (!target || locked) return;
    stopAudio();
    stopListening();
    const token = audioToken;
    const a = new Audio(target.file);
    audio = a;
    a.muted = false;
    a.volume = 1;
    a.preload = "auto";
    a.addEventListener("ended", () => {
      if (token !== audioToken) return;
      playing = false;
      setPlayUI(false);
    });
    a.addEventListener("error", () => {
      if (token !== audioToken) return;
      playing = false;
      setPlayUI(false);
      const fb = document.getElementById("lr-fb");
      if (fb) {
        fb.textContent = "Audio could not load.";
        fb.className = "lr-fb bad";
      }
    });
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        if (token !== audioToken || audio !== a) {
          try {
            a.muted = true;
            a.pause();
          } catch (e) {}
          return;
        }
        playing = true;
        setPlayUI(true);
      }).catch(() => {
        if (token !== audioToken) return;
        const fb = document.getElementById("lr-fb");
        if (fb) {
          fb.textContent = "Tap Play (browser may block autoplay).";
          fb.className = "lr-fb bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function setPlayUI(on) {
    const btn = document.getElementById("lr-play");
    const player = document.getElementById("lr-player");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML =
        '<span class="lr-play-ico" aria-hidden="true">⏸</span><span class="lr-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML =
        '<span class="lr-play-ico" aria-hidden="true">▶</span><span class="lr-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
    }
  }

  function setMicUI(on) {
    const btn = document.getElementById("lr-mic");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-listening");
      btn.innerHTML =
        '<span class="lr-mic-ico" aria-hidden="true">🎙️</span><span class="lr-mic-label">Listening…</span>';
      btn.setAttribute("aria-label", "Stop listening");
    } else {
      btn.classList.remove("is-listening");
      btn.innerHTML =
        '<span class="lr-mic-ico" aria-hidden="true">🎤</span><span class="lr-mic-label">Say the day</span>';
      btn.setAttribute("aria-label", "Say the day");
    }
  }

  function togglePlay() {
    if (locked) return;
    if (playing && audio) {
      stopAudio();
      return;
    }
    playTarget();
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ");
  }

  function matchesDay(transcript, day) {
    const t = normalize(transcript);
    if (!t) return false;
    // exact or contains the day name
    if (t === day.id || t === day.label.toLowerCase()) return true;
    if (day.answers.some((a) => t === a || t.includes(a))) return true;
    // common short forms / mishearings
    const map = {
      monday: ["mon", "mondy", "mondey"],
      tuesday: ["tues", "tuse", "tuesdy", "toosday"],
      wednesday: ["wed", "wensday", "wensdy", "wednesdy"],
      thursday: ["thur", "thurs", "thurday", "thursdy"],
      friday: ["fri", "fryday", "fridy"],
      saturday: ["sat", "satday", "saturdy"],
      sunday: ["sun", "sundy", "sonday"],
    };
    const alts = map[day.id] || [];
    return alts.some((a) => t === a || t.includes(a));
  }

  function startListening() {
    if (locked || !hasSpeech || !target) return;
    if (listening) {
      stopListening();
      return;
    }
    stopAudio();
    stopListening();

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      listening = true;
      setMicUI(true);
      const fb = document.getElementById("lr-fb");
      if (fb) {
        fb.textContent = "Listening… say the day";
        fb.className = "lr-fb";
      }
    };

    recognition.onresult = (event) => {
      const results = event.results;
      let best = "";
      let matched = false;
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results[i].length; j++) {
          const t = results[i][j].transcript || "";
          if (!best) best = t;
          if (matchesDay(t, target)) {
            matched = true;
            best = t;
            break;
          }
        }
        if (matched) break;
      }
      finishAnswer(matched, best);
    };

    recognition.onerror = (event) => {
      listening = false;
      setMicUI(false);
      const fb = document.getElementById("lr-fb");
      if (!fb) return;
      const err = event.error || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        fb.textContent = "Microphone permission denied. Allow mic access.";
        fb.className = "lr-fb bad";
      } else if (err === "no-speech") {
        fb.textContent = "No speech heard. Try again.";
        fb.className = "lr-fb bad";
      } else if (err === "aborted") {
        fb.textContent = "";
        fb.className = "lr-fb";
      } else {
        fb.textContent = "Could not hear you. Try again.";
        fb.className = "lr-fb bad";
      }
    };

    recognition.onend = () => {
      listening = false;
      setMicUI(false);
    };

    try {
      recognition.start();
    } catch (e) {
      listening = false;
      setMicUI(false);
      const fb = document.getElementById("lr-fb");
      if (fb) {
        fb.textContent = "Could not start microphone.";
        fb.className = "lr-fb bad";
      }
    }
  }

  function finishAnswer(correct, heard) {
    try{ if(correct) sfxCorrect(); else sfxWrong(); }catch(e){}
    stopListening();
    if (locked || mode !== "play") return;
    locked = true;

    const fb = document.getElementById("lr-fb");
    const heardEl = document.getElementById("lr-heard");

    if (correct) {
      score += 1;
      if (fb) {
        fb.textContent = "Correct!"; try{sfxCorrect();}catch(e){}
        fb.className = "lr-fb good";
      }
      if (heardEl) {
        heardEl.textContent = heard ? `You said: “${heard.trim()}”` : "";
        heardEl.className = "lr-heard good";
      }
    } else {
      if (fb) {
        fb.textContent = `Not quite. It was ${target.label}.`;
        fb.className = "lr-fb bad";
      }
      if (heardEl) {
        heardEl.textContent = heard
          ? `You said: “${heard.trim()}”`
          : "Nothing recognized.";
        heardEl.className = "lr-heard bad";
      }
    }

    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "result";
        render();
      } else {
        startRound();
      }
    }, correct ? 1100 : 1600);
  }

  function startRound() {
    clearNextTimer();
    stopAudio();
    stopListening();
    locked = false;
    target = pickDay();
    round += 1;
    mode = "play";
    render();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (mode === "play" && !locked) playTarget();
    }, 320);
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="lr-topbar">
          <a class="lr-back" href="../" aria-label="Back">←</a>
          <span class="lr-title">Listen &amp; Repeat</span>
          <span class="lr-badge">1A</span>
        </header>
        <section class="lr-start">
          <div class="lr-hero">
            <div class="lr-blob" aria-hidden="true"></div>
            <div class="lr-icon-wrap" aria-hidden="true">🎤</div>
          </div>
          <h1>Listen &amp; Repeat</h1>
          <p class="lr-desc">Listen to a day of the week,<br>then say it out loud.</p>
          ${
            hasSpeech
              ? `<p class="lr-note">Uses your microphone · works best in Chrome or Edge</p>
                 <button type="button" class="lr-btn" id="lr-start">Start</button>`
              : `<p class="lr-note bad">Speech recognition is not supported in this browser.<br>Try Chrome or Edge on a phone or computer.</p>
                 <a class="lr-btn secondary" href="../">Back to games</a>`
          }
        </section>`;
      const startBtn = document.getElementById("lr-start");
      if (startBtn) {
        startBtn.onclick = () => {
          score = 0;
          round = 0;
          used = [];
          if (window.LAFinish) LAFinish.startTimer();
          startRound();
        };
      }
      return;
    }

    if (mode === "result") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          timeMs: timeMs,
          onAgain: () => {
            score = 0;
            round = 0;
            used = [];
            mode = "play";
            if (window.LAFinish) LAFinish.startTimer();
            startRound();
          },
          onModes: () => {
            mode = "start";
            render();
          },
          backHref: "../",
        });
        return;
      }
      const stars = score === TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
      app.innerHTML = `<header class="lr-topbar"><a class="lr-back" href="../">←</a><span class="lr-title">Listen &amp; Repeat</span></header>
        <section class="lr-done"><h1>Done!</h1><p>${score} of ${TOTAL}</p>
        <button type="button" class="lr-btn" id="lr-again">Play again</button></section>`;
      document.getElementById("lr-again").onclick = () => { mode = "start"; render(); };
      return;
    }

    // play
    app.innerHTML = `
      <header class="lr-topbar">
        <a class="lr-back" href="../" aria-label="Back">←</a>
        <span class="lr-title">Listen &amp; Repeat</span>
        <span class="lr-badge">${round} / ${TOTAL}</span>
      </header>

      <div class="lr-player" id="lr-player">
        <button type="button" class="lr-play-btn" id="lr-play" aria-label="Play audio">
          <span class="lr-play-ico" aria-hidden="true">▶</span>
          <span class="lr-play-label">Play audio</span>
        </button>
        <div class="lr-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      <p class="lr-instruction">Listen, then press the mic and say the day.</p>

      <button type="button" class="lr-mic-btn" id="lr-mic" aria-label="Say the day">
        <span class="lr-mic-ico" aria-hidden="true">🎤</span>
        <span class="lr-mic-label">Say the day</span>
      </button>

      <div class="lr-fb" id="lr-fb" aria-live="polite"></div>
      <div class="lr-heard" id="lr-heard" aria-live="polite"></div>
    `;

    document.getElementById("lr-play").onclick = togglePlay;
    document.getElementById("lr-mic").onclick = startListening;
  }

  render();
})();
