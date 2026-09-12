/* Statement → Question · listen & write · AEF Starter */
(function () {
  const GAME_ID = "starter-2a-statement-to-question";

  const ITEMS = [
    {
      stmtAudio: "audio/stmt-01.mp3",
      qAudio: "audio/q-01.mp3",
      answers: ["are you chinese", "are you chinese?"],
      display: "Are you Chinese?",
    },
    {
      stmtAudio: "audio/stmt-02.mp3",
      qAudio: "audio/q-02.mp3",
      answers: ["are we late", "are we late?"],
      display: "Are we late?",
    },
    {
      stmtAudio: "audio/stmt-03.mp3",
      qAudio: "audio/q-03.mp3",
      answers: [
        "are they in class 2",
        "are they in class 2?",
        "are they in class two",
        "are they in class two?",
      ],
      display: "Are they in class 2?",
    },
    {
      stmtAudio: "audio/stmt-04.mp3",
      qAudio: "audio/q-04.mp3",
      answers: ["are you mexican", "are you mexican?"],
      display: "Are you Mexican?",
    },
    {
      stmtAudio: "audio/stmt-05.mp3",
      qAudio: "audio/q-05.mp3",
      answers: ["are they american", "are they american?"],
      display: "Are they American?",
    },
    {
      stmtAudio: "audio/stmt-06.mp3",
      qAudio: "audio/q-06.mp3",
      answers: [
        "are we in room 5",
        "are we in room 5?",
        "are we in room five",
        "are we in room five?",
      ],
      display: "Are we in room 5?",
    },
    {
      stmtAudio: "audio/stmt-07.mp3",
      qAudio: "audio/q-07.mp3",
      answers: ["are they japanese", "are they japanese?"],
      display: "Are they Japanese?",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastUserInput = "";

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, answers) {
    const n = normalize(user);
    if (!n) return false;
    return answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playStmt() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.stmtAudio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function playQuestion(then) {
    const item = order[index];
    if (!item) { if (then) then(); return; }
    stopAudio();
    const a = new Audio(item.qAudio);
    currentAudio = a;
    a.play().catch(() => { if (then) then(); });
    a.onended = () => {
      if (currentAudio === a) currentAudio = null;
      if (then) then();
    };
  }

  function startGame() {
    order = shuffle(ITEMS);
    index = 0;
    correctCount = 0;
    answered = false;
    lastUserInput = "";
    phase = "play";
    render();
    setTimeout(playStmt, 350);
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    const item = order[index];
    stopAudio();

    if (isCorrect(val, item.answers)) {
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render(true);
      playQuestion(() => {
        setTimeout(() => nextItem(), 400);
      });
    } else {
      answered = false;
      phase = "tryagain";
      render();
    }
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    answered = true;
    phase = "feedback";
    stopAudio();
    render(false);
    playQuestion(() => {
      setTimeout(() => nextItem(), 400);
    });
  }

  function nextItem() {
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playStmt, 300);
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    if (n >= 7) return 3;
    if (n >= 5) return 2;
    if (n >= 3) return 1;
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

  function progressHTML() {
    const total = order.length;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="lw-track" aria-hidden="true">
        <div class="lw-track-fill" style="width:${fill}%"></div>
      </div>
      <div class="lw-scoreline">
        <span class="lw-score">${correctCount} correct</span>
        <span class="lw-step">${index + 1} / ${total}</span>
      </div>`;
  }

  function render(feedbackOk) {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Statement → Question</span>
          <span class="lw-badge">be</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">🎧</div>
          <h1>Statement → Question</h1>
          <p class="lw-desc">Listen to the sentence,<br>then write the <strong>question</strong>.</p>
          <p class="lw-speech-note">7 sentences</p>
          <button type="button" class="lw-btn" id="lw-start">Start →</button>
        </section>`;
      document.getElementById("lw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Statement → Question</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true"><div class="orbit-system"><div class="trophy-float">🏆</div><div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div><div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div><div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div></div></div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / 7</strong> correct.</p>
          <button type="button" class="lw-btn" id="lw-again">Play again</button>
          <button type="button" class="lw-btn secondary" id="lw-menu">Home</button>
        </section>`;
      document.getElementById("lw-again").onclick = startGame;
      document.getElementById("lw-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    const item = order[index];
    const progress = (index + 1) + " / " + order.length;

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Statement → Question</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback is-wrong">
          <div class="lw-fb-icon">❌</div>
          <p class="lw-fb-msg">Try again</p>
          <p class="lw-fb-hint">You wrote: <em>${lastUserInput || "—"}</em></p>
          <button type="button" class="lw-btn" id="lw-retry">Try again</button>
        </section>`;
      document.getElementById("lw-retry").onclick = () => {
        answered = false;
        lastUserInput = "";
        phase = "play";
        render();
        setTimeout(playStmt, 250);
      };
      return;
    }

    if (phase === "feedback") {
      const msg = feedbackOk
        ? `Correct! <strong>${item.display}</strong>`
        : `Answer: <strong>${item.display}</strong>`;
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Statement → Question</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback ${feedbackOk ? "is-correct" : "is-wrong"}">
          <div class="lw-fb-icon">${feedbackOk ? "✅" : "➡️"}</div>
          <p class="lw-fb-msg">${msg}</p>
        </section>`;
      return;
    }

    // play
    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">Statement → Question</span>
        <span class="lw-progress">${progress}</span>
      </header>
      ${progressHTML()}
      <section class="lw-play-area">
        <p class="lw-instruction">Listen, then write the <strong>question</strong></p>
        <button type="button" class="lw-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <div class="lw-input-wrap">
          <input type="text" id="lw-input" class="lw-input" placeholder="e.g. Are you Chinese?" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false">
        </div>
        <div class="lw-actions">
          <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
          <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
        </div>
      </section>`;
    const input = document.getElementById("lw-input");
    const checkBtn = document.getElementById("lw-check");
    input.focus();
    document.querySelector(".lw-play").onclick = playStmt;
    checkBtn.onclick = checkAnswer;
    document.getElementById("lw-skip").onclick = skipAnswer;
    input.oninput = () => { checkBtn.disabled = !input.value.trim(); };
    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim()) checkAnswer();
    };
  }

  render();
})();
