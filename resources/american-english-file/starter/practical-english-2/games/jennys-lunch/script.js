/* Jenny's Lunch · AEF Starter Practical English 2 */
(function () {
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
        feedback.textContent = "Correct! Jenny’s lunch is $9.70 ✓";
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
    answered = false;
    gotIt = false;
    phase = "play";
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="jl-topbar">
          <a class="jl-back" href="../" aria-label="Back"><span aria-hidden="true">←</span><span class="jl-back-label">Jenny's Lunch</span></a>
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
      const stars = saveStars();
      app.innerHTML = `
        <header class="jl-topbar">
          <a class="jl-back" href="../" aria-label="Back"><span aria-hidden="true">←</span><span class="jl-back-label">Jenny's Lunch</span></a>
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
        <a class="jl-back" href="../" aria-label="Back"><span aria-hidden="true">←</span><span class="jl-back-label">Jenny's Lunch</span></a>
          <span class="jl-progress">Listen & choose</span>
        </header>

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
