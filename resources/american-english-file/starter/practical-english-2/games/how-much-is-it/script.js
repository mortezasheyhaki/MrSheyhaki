/* How much is it? · AEF Starter Practical English 2 */
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
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
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


  const GAME_ID = "starter-pe2-how-much-is-it";

  const ITEMS = [
    {
      id: "newspaper",
      label: "newspaper",
      emoji: "📰",
      options: ["$2.50", "$2.15"],
      correct: 0, // $2.50
      audio: "https://cdn.imgurl.ir/uploads/y87886_first-conv.mp3",
    },
    {
      id: "umbrella",
      label: "umbrella",
      emoji: "☂️",
      options: ["€15", "€50"],
      correct: 0, // €15
      audio: "https://cdn.imgurl.ir/uploads/g75092_sec-conv.mp3",
    },
    {
      id: "memory-card",
      label: "memory card",
      emoji: "💾",
      options: ["$4.99", "$9.49"],
      correct: 1, // $9.49
      audio: "https://cdn.imgurl.ir/uploads/r954626_third-conv.mp3",
    },
    {
      id: "train-ticket",
      label: "train ticket",
      emoji: "🎟️",
      options: ["£13.20", "£30.20"],
      correct: 1, // £30.20
      audio: "https://cdn.imgurl.ir/uploads/s24820_fourth-conv.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | feedback | done
  let qIndex = 0;
  let score = 0;
  let answered = false;
  let currentAudio = null;
  let selectedOpt = null;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".hm-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    const item = ITEMS[qIndex];
    if (!item || !item.audio) return;

    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".hm-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function calcStars() {
    if (score >= 4) return 3;
    if (score >= 3) return 2;
    if (score >= 2) return 1;
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

  function selectOption(optIndex) {
    if (answered || phase !== "play") return;
    answered = true;
    selectedOpt = optIndex;
    const item = ITEMS[qIndex];
    const isCorrect = optIndex === item.correct;
    if (isCorrect) score++;

    // visual feedback
    const btns = app.querySelectorAll(".hm-option");
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === item.correct) b.classList.add("is-correct");
      if (i === optIndex && !isCorrect) b.classList.add("is-wrong");
    });

    const feedback = document.getElementById("hm-feedback");
    if (feedback) {
      feedback.textContent = isCorrect ? "Correct! ✓" : "Not quite – the answer is " + item.options[item.correct];
      feedback.className = "hm-feedback " + (isCorrect ? "ok" : "bad");
    }

    // show next button
    const nextBtn = document.getElementById("hm-next");
    if (nextBtn) {
      nextBtn.style.display = "block";
      nextBtn.textContent = qIndex < ITEMS.length - 1 ? "Next" : "See results";
    }
  }

  function goNext() {
    stopAudio();
    if (qIndex < ITEMS.length - 1) {
      qIndex++;
      answered = false;
      selectedOpt = null;
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    qIndex = 0;
    score = 0;
    answered = false;
    selectedOpt = null;
    phase = "play";
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="hm-topbar">
          <a class="hm-back" href="../" aria-label="Back">←</a>
          <span class="hm-title">How much is it?</span>
          <span class="hm-badge">PE2</span>
        </header>
        <section class="hm-start">
          <div class="hm-hero" aria-hidden="true">💰</div>
          <h1>How much is it?</h1>
          <p class="hm-desc">Listen to 4 short conversations and choose the correct price.</p>
          <button type="button" class="hm-btn" id="hm-start">Start</button>
        </section>`;
      document.getElementById("hm-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: 4,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML = `
        <header class="hm-topbar">
          <a class="hm-back" href="../" aria-label="Back">←</a>
          <span class="hm-title">How much is it?</span>
          <span class="hm-badge">Done</span>
        </header>
        <section class="hm-done">
          <div class="hm-stars" aria-hidden="true">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practicing!"}</h1>
          <p>You got <strong>${score} / 4</strong> correct.</p>
          <button type="button" class="hm-btn" id="hm-again">Play again</button>
          <button type="button" class="hm-btn secondary" id="hm-menu">Back to start</button>
        </section>`;
      document.getElementById("hm-again").onclick = startGame;
      document.getElementById("hm-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play phase
    const item = ITEMS[qIndex];

    app.innerHTML = `
      <header class="hm-topbar">
          <a class="hm-back" href="../" aria-label="Back">←</a>
          <span class="hm-title">How much is it?</span>
        </header>
      <div class="game-toolbar">
        <div class="stats-bar">
          <div class="stat"><span class="stat-label">QUESTION</span><strong>${qIndex + 1} / 4</strong></div>
          <div class="stat"><span class="stat-label">SCORE</span><strong>${score}</strong></div>
        </div>
      </div>

      <div class="hm-card">
        <div class="hm-item">
          <span class="hm-emoji" aria-hidden="true">${item.emoji}</span>
          <span class="hm-label">${item.label}</span>
        </div>

        <button type="button" class="hm-play" aria-label="Play conversation">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <p class="hm-hint">Listen, then choose the correct price</p>

        <div class="hm-options">
          ${item.options.map((opt, i) => `
            <button type="button" class="hm-option" data-i="${i}">
              ${opt}
            </button>`).join("")}
        </div>

        <p class="hm-feedback" id="hm-feedback"></p>
        <button type="button" class="hm-btn" id="hm-next" style="display:none">Next</button>
      </div>`;

    app.querySelector(".hm-play").onclick = playAudio;
    app.querySelectorAll(".hm-option").forEach((btn) => {
      btn.onclick = () => selectOption(+btn.dataset.i);
    });
    const next = document.getElementById("hm-next");
    if (next) next.onclick = goNext;
  }

  render();
})();
