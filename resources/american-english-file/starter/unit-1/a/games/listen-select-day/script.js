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

/* Listen & select the day of the week */
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


  const GAME_ID = "starter-1a-listen-select-day";
  const DAYS = [
    { id: "monday", label: "Monday", emoji: "📅", file: "audio/Monday.mp3" },
    { id: "tuesday", label: "Tuesday", emoji: "📘", file: "audio/Tuesday.mp3" },
    { id: "wednesday", label: "Wednesday", emoji: "📗", file: "audio/Wednesday.mp3" },
    { id: "thursday", label: "Thursday", emoji: "📙", file: "audio/Thursday.mp3" },
    { id: "friday", label: "Friday", emoji: "🎉", file: "audio/Friday.mp3" },
    { id: "saturday", label: "Saturday", emoji: "🎮", file: "audio/Saturday.mp3" },
    { id: "sunday", label: "Sunday", emoji: "☀️", file: "audio/Sunday.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let target = null;
  let score = 0;
  let round = 0;
  const TOTAL = 7;
  let used = []; // days already played as audio targets
  let muted = []; // day buttons that stay muted/gray after answered
  let audio = null;
  let audioToken = 0;
  let playing = false;
  let locked = false;
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

  function playTarget() {
    if (!target) return;
    stopAudio();
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
      const fb = document.getElementById("ld-fb");
      if (fb) {
        fb.textContent = "Audio could not load.";
        fb.className = "ld-fb bad";
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
        const fb = document.getElementById("ld-fb");
        if (fb) {
          fb.textContent = "Tap Play (browser may block autoplay).";
          fb.className = "ld-fb bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function setPlayUI(on) {
    const btn = document.getElementById("ld-play");
    const player = document.getElementById("ld-player");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML =
        '<span class="ld-play-ico" aria-hidden="true">⏸</span><span class="ld-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML =
        '<span class="ld-play-ico" aria-hidden="true">▶</span><span class="ld-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
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

  function startRound() {
    clearNextTimer();
    locked = false;
    target = pickDay();
    round += 1;
    mode = "play";
    render();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (mode === "play" && !locked) playTarget();
    }, 280);
  }

  function burstAt(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const root = document.createElement("div");
    root.className = "ld-burst";
    root.style.left = rect.left + rect.width / 2 + "px";
    root.style.top = rect.top + rect.height / 2 + "px";
    const colors = ["#22c55e", "#a3e635", "#fbbf24", "#34d399", "#4ade80", "#86efac"];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      const angle = (i / 12) * Math.PI * 2;
      const dist = 36 + Math.random() * 28;
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      p.style.background = colors[i % colors.length];
      root.appendChild(p);
    }
    document.body.appendChild(root);
    setTimeout(() => root.remove(), 700);
  }

  function choose(id) {
    if (locked || mode !== "play") return;
    // Already-muted (correctly answered) days can't be picked
    if (muted.includes(id)) return;

    locked = true;
    stopAudio();

    const correct = id === target.id;
    const tapped = app.querySelector('.ld-day[data-id="' + id + '"]');
    const correctEl = app.querySelector('.ld-day[data-id="' + target.id + '"]');
    const fb = document.getElementById("ld-fb");

    if (!correct) {
      // Match-making style: flash wrong, then unlock and try again
      if (tapped) {
        tapped.classList.add("selected", "wrong");
      }
      if (fb) {
        fb.innerHTML = '<span class="ld-fb-ico">✗</span> Try again';
        fb.className = "ld-fb bad";
      }
      clearNextTimer();
      nextTimer = setTimeout(() => {
        nextTimer = null;
        if (tapped) tapped.classList.remove("selected", "wrong");
        if (fb) {
          fb.innerHTML = "";
          fb.className = "ld-fb";
        }
        locked = false;
      }, 700);
      return;
    }

    // Correct answer
    score += 1;
    if (!muted.includes(id)) muted.push(id);

    document.querySelectorAll(".ld-day").forEach((el) => {
      const dayId = el.getAttribute("data-id");
      el.classList.remove("selected", "just-muted", "wrong");
      if (dayId === id) {
        el.classList.add("selected", "correct", "picked-ok", "muted", "disabled", "just-muted");
      } else if (muted.includes(dayId)) {
        el.classList.add("muted", "disabled");
      } else {
        el.classList.add("disabled"); // lock others until next round
      }
    });

    if (fb) {
      fb.innerHTML =
        '<span class="ld-fb-ico">✓</span> Correct! <strong>' + target.label + "</strong>";
      fb.className = "ld-fb ok";
    }
    if (correctEl) burstAt(correctEl);

    clearNextTimer();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "result";
        render();
      } else {
        startRound();
      }
    }, 900);
  }

  function render() {
    if (mode === "start") {
      stopAudio();
      clearNextTimer();
      app.innerHTML = `
        <header class="ld-topbar">
          <a class="ld-back" href="../" aria-label="Back">←</a>
          <span class="ld-title">Days of the week</span>
          <span class="ld-badge">🎧 Listen</span>
        </header>
        <section class="ld-start">
          <div class="ld-hero">
            <div class="ld-blob" aria-hidden="true"></div>
            <div class="ld-icon-wrap"><span class="ld-icon">📅</span></div>
          </div>
          <p class="ld-eyebrow">LISTENING</p>
          <h1>Select the day you hear</h1>
          <p class="ld-sub">Tap <strong>Play</strong>, listen, then choose the correct day.</p>
          <p class="ld-hint">${TOTAL} rounds · all 7 days</p>
          <button type="button" class="ld-btn" id="ld-go">Start</button>
        </section>`;
      document.getElementById("ld-go").onclick = () => {
        score = 0;
        round = 0;
        used = [];
        muted = [];
        if (window.LAFinish) LAFinish.startTimer();
        startRound();
      };
      return;
    }

    if (mode === "result") {
      stopAudio();
      clearNextTimer();
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: TOTAL,
          timeMs: timeMs,
          onAgain: () => {
            mode = "play";
            score = 0;
            round = 0;
            used = [];
            muted = [];
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
      const stars = score >= 6 ? 3 : score >= 4 ? 2 : score >= 2 ? 1 : 0;
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
      app.innerHTML = `<header class="ld-topbar"><a class="ld-back" href="../">←</a><span class="ld-title">Results</span></header>
        <section class="ld-done"><div class="ld-done-inner"><h1>Done!</h1>
        <p>${score} of ${TOTAL} right</p>
        <button type="button" class="ld-btn" id="ld-again">Play again</button></div></section>`;
      document.getElementById("ld-again").onclick = () => { mode = "start"; render(); };
      return;
    }

    // play mode — muted days stay gray
    const cards = DAYS.map((d) => {
      const isMuted = muted.includes(d.id);
      const cls = "ld-day" + (isMuted ? " muted disabled" : "");
      return `
      <button type="button" class="${cls}" data-id="${d.id}" aria-label="${d.label}" ${
        isMuted ? "disabled" : ""
      }>
        <span class="ld-day-emoji" aria-hidden="true">${d.emoji}</span>
        <span class="ld-day-label">${d.label}</span>
      </button>`;
    }).join("");

    app.innerHTML = `
      <header class="ld-topbar">
        <a class="ld-back" href="../" aria-label="Back">←</a>
        <span class="ld-title">Select the day</span>
        <span class="ld-badge">${round} / ${TOTAL}</span>
      </header>

      <div class="ld-player" id="ld-player">
        <button type="button" class="ld-play-btn" id="ld-play" aria-label="Play audio">
          <span class="ld-play-ico" aria-hidden="true">▶</span>
          <span class="ld-play-label">Play audio</span>
        </button>
        <div class="ld-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      <p class="ld-instruction">Listen, then tap the day you hear.</p>
      <div class="ld-days" id="ld-days">${cards}</div>
      <div class="ld-fb" id="ld-fb" aria-live="polite"></div>
    `;

    document.getElementById("ld-play").onclick = togglePlay;
    document.querySelectorAll(".ld-day:not(.muted)").forEach((btn) => {
      const press = () => {
        if (locked) return;
        document.querySelectorAll(".ld-day").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      btn.addEventListener("pointerdown", press);
      btn.onclick = () => choose(btn.getAttribute("data-id"));
    });
  }

  render();
})();
