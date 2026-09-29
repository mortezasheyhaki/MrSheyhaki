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

/* 1.9 Listen and write the numbers – AEF Starter Unit 1A */
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


  const GAME_ID = "starter-1a-listen-write-numbers";
  // Book answer key for 1.9 (11 boxes; example 7 is first)
  const ANSWERS = [7, 3, 0, 8, 9, 1, 4, 5, 6, 2, 10];
  const AUDIO_SRC = "https://cdn.imgurl.ir/uploads/n167749_1.9.mp3";

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let audio = null;
  let playing = false;

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_SRC);
      audio.preload = "auto";
      audio.addEventListener("ended", () => {
        playing = false;
        playing = false;
        const btn = document.getElementById("ln-play");
        const player = document.getElementById("ln-player");
        if (btn) {
          btn.classList.remove("is-playing");
          if (player) player.classList.remove("is-playing");
          btn.innerHTML = '<span class="ln-play-ico" aria-hidden="true">▶</span><span class="ln-play-label">Play again</span>';
          btn.setAttribute("aria-label", "Play again");
        }
      });
      audio.addEventListener("error", () => {
        playing = false;
        const fb = document.getElementById("ln-audio-fb");
        if (fb) {
          fb.textContent = "Audio could not load. Check the file path.";
          fb.className = "ln-feedback bad";
        }
      });
    }
    return audio;
  }

  function showStart() {
    mode = "start";
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      playing = false;
    }
    app.innerHTML = `
      <div class="ln-topbar">
        <a class="ln-back" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="ln-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="ln-start">
        <div class="ln-hero">
          <div class="ln-blob" aria-hidden="true"></div>
          <div class="ln-icon-wrap" aria-hidden="true">
            <span class="ln-icon">🎧</span>
          </div>
          <p class="ln-track">1.9</p>
          <h1>Listen and write<br>the numbers</h1>
          <p class="ln-sub">Numbers <strong>0–10</strong>. Listen carefully<br>and fill in each box.</p>
        </div>
        <button class="ln-btn" id="ln-go">Start</button>
        <p class="ln-hint">11 numbers · example starts with <strong>7</strong></p>
      </div>
    `;
    document.getElementById("ln-go").addEventListener("click", showPlay);
  }

  function showPlay() {
    if (window.LAFinish) LAFinish.startTimer();
    mode = "play";
    playing = false;

    const boxes = ANSWERS.map((n, i) => {
      // First box pre-filled as example (like the book)
      if (i === 0) {
        return `<div class="ln-box ln-box-example" data-i="${i}">
          <span class="ln-box-num">${n}</span>
          <span class="ln-box-tag">example</span>
        </div>`;
      }
      return `<div class="ln-box" data-i="${i}">
        <input class="ln-input" type="text" inputmode="numeric" maxlength="2"
               autocomplete="off" aria-label="Number ${i + 1}" data-i="${i}">
      </div>`;
    }).join("");

    app.innerHTML = `
      <div class="ln-topbar">
        <a class="ln-back" href="#" id="ln-back-start" title="Back" aria-label="Back">←</a>
        <span class="ln-topbar-title">1.9 · Listen & write</span>
        <span class="ln-progress">0–10</span>
      </div>

      <div class="ln-player" id="ln-player">
        <button type="button" class="ln-play-btn" id="ln-play" aria-label="Play audio">
          <span class="ln-play-ico" aria-hidden="true">▶</span>
          <span class="ln-play-label">Play audio</span>
        </button>
        <div class="ln-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <p class="ln-instruction">Listen and write the numbers in the boxes.</p>

      <div class="ln-boxes" id="ln-boxes">
        ${boxes}
      </div>

      <div class="ln-feedback" id="ln-audio-fb"></div>
      <div class="ln-actions">
        <button type="button" class="ln-btn secondary" id="ln-clear">Clear</button>
        <button type="button" class="ln-btn" id="ln-check">Check answers</button>
      </div>
    `;

    document.getElementById("ln-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    document.getElementById("ln-play").addEventListener("click", togglePlay);
    document.getElementById("ln-check").addEventListener("click", checkAnswers);
    document.getElementById("ln-clear").addEventListener("click", clearInputs);

    // Focus first empty input
    const first = app.querySelector(".ln-input");
    if (first) setTimeout(() => first.focus(), 200);

    // Enter key moves to next / checks on last
    app.querySelectorAll(".ln-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/[^0-9]/g, "");
        inp.classList.remove("ok", "bad");
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const inputs = [...app.querySelectorAll(".ln-input")];
          const idx = inputs.indexOf(inp);
          if (idx < inputs.length - 1) inputs[idx + 1].focus();
          else checkAnswers();
        }
      });
    });
  }

  function setPlayUI(isOn) {
    const btn = document.getElementById("ln-play");
    const player = document.getElementById("ln-player");
    if (!btn) return;
    if (isOn) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML = '<span class="ln-play-ico" aria-hidden="true">⏸</span><span class="ln-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause audio");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML = '<span class="ln-play-ico" aria-hidden="true">▶</span><span class="ln-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
    }
  }

  function togglePlay() {
    const a = ensureAudio();
    const btn = document.getElementById("ln-play");
    if (!btn) return;

    if (playing) {
      a.pause();
      playing = false;
      setPlayUI(false);
      return;
    }

    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        playing = true;
        setPlayUI(true);
      }).catch(() => {
        const fb = document.getElementById("ln-audio-fb");
        if (fb) {
          fb.textContent = "Tap Play again (browser may block autoplay).";
          fb.className = "ln-feedback bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function clearInputs() {
    app.querySelectorAll(".ln-input").forEach((inp) => {
      inp.value = "";
      inp.classList.remove("ok", "bad");
    });
    const fb = document.getElementById("ln-audio-fb");
    if (fb) {
      fb.textContent = "";
      fb.className = "ln-feedback";
    }
    const first = app.querySelector(".ln-input");
    if (first) first.focus();
  }

  function checkAnswers() {
    const inputs = [...app.querySelectorAll(".ln-input")];
    let correct = 0;
    let total = inputs.length; // scorable inputs (example box is fixed)

    inputs.forEach((inp) => {
      const i = Number(inp.dataset.i);
      const val = inp.value.trim() === "" ? null : Number(inp.value.trim());
      const expected = ANSWERS[i];
      inp.classList.remove("ok", "bad");
      if (val === expected) {
        inp.classList.add("ok");
        correct++;
      } else {
        inp.classList.add("bad");
      }
    });

    // Include the example as already correct for score display
    const scoreCorrect = correct + 1;
    const scoreTotal = ANSWERS.length;

    if (correct === total) {
      showResult(scoreCorrect, scoreTotal, true);
    } else {
      const fb = document.getElementById("ln-audio-fb");
      if (fb) {
        fb.className = "ln-feedback bad";
        fb.textContent = `${correct} / ${total} correct — listen again and try the red boxes.`;
      }
    }
  }

  function showResult(correct, total, perfect) {
    mode = "result";
    if (audio) {
      audio.pause();
      playing = false;
    }

    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: correct,
        total: total,
        timeMs: timeMs,
        onAgain: showPlay,
        onModes: showStart,
        backHref: "../",
      });
      return;
    }

    const stars = perfect
      ? 3
      : correct >= total - 1 || correct / total >= 0.8
        ? 2
        : correct >= Math.ceil(total / 2)
          ? 1
          : 0;
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    app.innerHTML = `<div class="ln-topbar"><a class="ln-back" href="../">←</a></div>
      <div class="ln-done"><div class="ln-done-inner"><h1>${perfect ? "Perfect!" : "Done!"}</h1>
      <p>${correct} / ${total} correct</p>
      <button class="ln-btn" id="ln-again">Practice again</button></div></div>`;
    document.getElementById("ln-again").addEventListener("click", showPlay);
  }

  function spawnConfetti(container) {
    if (!container) return;
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6"];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("span");
      el.className = "ln-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = Math.random() * 0.8 + "s";
      el.style.animationDuration = 2 + Math.random() * 1.2 + "s";
      el.style.width = 5 + Math.random() * 7 + "px";
      el.style.height = 7 + Math.random() * 9 + "px";
      container.appendChild(el);
    }
  }

  showStart();
})();
