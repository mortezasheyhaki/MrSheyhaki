/* Jenny's Lunch · AEF Starter Practical English 2 */
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


  const GAME_ID = "starter-pe2-jennys-lunch";

  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/x08382_Jenny39s_lunch.mp3";

  // Jenny: tuna salad $7.20 + mineral water $2.50 = $9.70
  const OPTIONS = [
    { id: "a", label: "$9.17", correct: false },
    { id: "b", label: "$9.70", correct: true },
    { id: "c", label: "$7.20", correct: false },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let currentAudio = null;
  let answered = false;
  let gotIt = false;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".jl-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(AUDIO_URL);
    currentAudio = a;
    const btn = app.querySelector(".jl-play");
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
    return gotIt ? 3 : 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function selectOption(id) {
    if (answered || phase !== "play") return;
    answered = true;
    const opt = OPTIONS.find((o) => o.id === id);
    gotIt = !!(opt && opt.correct);

    const btns = app.querySelectorAll(".jl-option");
    btns.forEach((b) => {
      b.disabled = true;
      const o = OPTIONS.find((x) => x.id === b.dataset.id);
      if (o && o.correct) b.classList.add("is-correct");
      if (b.dataset.id === id && !gotIt) b.classList.add("is-wrong");
    });

    const feedback = document.getElementById("jl-feedback");
    if (feedback) {
      if (gotIt) {
        feedback.textContent = "Correct! Jenny’s lunch is $9.70 ✓"; try{sfxCorrect();}catch(e){}
        feedback.className = "jl-feedback ok";
      } else {
        feedback.textContent = "Not quite – it’s $9.70 (salad $7.20 + water $2.50)";
        feedback.className = "jl-feedback bad";
      }
    }

    const nextBtn = document.getElementById("jl-next");
    if (nextBtn) {
      nextBtn.style.display = "block";
      nextBtn.textContent = "See results";
    }
  }

  function goResults() {
    stopAudio();
    phase = "done";
    render();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    answered = false;
    gotIt = false;
    phase = "play";
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="jl-topbar">
          <a class="jl-back" href="../" aria-label="Back">←</a>
          <span class="jl-title">Jenny's Lunch</span>
          <span class="jl-badge">PE2</span>
        </header>
        <section class="jl-start">
          <div class="jl-hero" aria-hidden="true">🥗</div>
          <h1>Jenny's Lunch</h1>
          <p class="jl-desc">Listen to the conversation and choose how much Jenny’s lunch costs.</p>
          <button type="button" class="jl-btn" id="jl-start">Start</button>
        </section>`;
      document.getElementById("jl-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: gotIt ? 1 : 0,
          total: 1,
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
        <header class="jl-topbar">
          <a class="jl-back" href="../" aria-label="Back">←</a>
          <span class="jl-title">Jenny's Lunch</span>
          <span class="jl-badge">Done</span>
        </header>
        <section class="jl-done">
          <div class="jl-stars" aria-hidden="true">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h1>${gotIt ? "Perfect!" : "Keep listening!"}</h1>
          <p>${gotIt
            ? "Jenny paid <strong>$9.70</strong> for a tuna salad and mineral water."
            : "Jenny’s lunch was <strong>$9.70</strong> (salad $7.20 + water $2.50)."}</p>
          <button type="button" class="jl-btn" id="jl-again">Play again</button>
          <button type="button" class="jl-btn secondary" id="jl-menu">Back to start</button>
        </section>`;
      document.getElementById("jl-again").onclick = startGame;
      document.getElementById("jl-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play
    const shuffled = OPTIONS.slice().sort(() => Math.random() - 0.5);

    app.innerHTML = `
      <header class="jl-topbar">
          <a class="jl-back" href="../" aria-label="Back">←</a>
          <span class="jl-title">Jenny's Lunch</span>
        </header>
      <div class="game-toolbar">
        <div class="stats-bar">
          <div class="stat"><span class="stat-label">TASK</span><strong>Choose</strong></div>
          <div class="stat"><span class="stat-label">OPTIONS</span><strong>${OPTIONS.length}</strong></div>
        </div>
      </div>

      <div class="jl-content">
        <div class="jl-card">
          <div class="jl-item">
            <span class="jl-emoji" aria-hidden="true">🥗💧</span>
            <span class="jl-label">How much is Jenny’s lunch?</span>
          </div>

          <button type="button" class="jl-play" aria-label="Play conversation">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <p class="jl-hint">Listen, then choose the total</p>

          <div class="jl-options">
            ${shuffled.map((o) => `
              <button type="button" class="jl-option" data-id="${o.id}">
                ${o.label}
              </button>`).join("")}
          </div>

          <p class="jl-feedback" id="jl-feedback"></p>
          <button type="button" class="jl-btn" id="jl-next" style="display:none">See results</button>
        </div>
      </div>`;

    app.querySelector(".jl-play").onclick = playAudio;
    app.querySelectorAll(".jl-option").forEach((btn) => {
      btn.onclick = () => selectOption(btn.dataset.id);
    });
    const next = document.getElementById("jl-next");
    if (next) next.onclick = goResults;
  }

  render();
})();
