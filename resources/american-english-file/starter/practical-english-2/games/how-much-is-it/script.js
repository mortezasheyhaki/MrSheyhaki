/* How much is it? · AEF Starter Practical English 2 */
(function () {
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
    const progress = `Question ${qIndex + 1} / 4`;

    app.innerHTML = `
      <header class="hm-topbar">
        <a class="hm-back" href="../" aria-label="Back">←</a>
        <span class="hm-title">How much is it?</span>
        <span class="hm-progress">${progress}</span>
      </header>

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
