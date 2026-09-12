/* I'm from… → He's/She's + nationality · AEF Starter Unit 2A */
(function () {
  const GAME_ID = "starter-2a-from-nationality";

  // Fixed order 1–16. Gender comes from the model answer audio.
  const ITEMS = [
    { id: 1,  fromAudio: "audio/from-01.mp3", natAudio: "audio/nat-01.mp3", country: "China",        answer: "He's Chinese",      answers: ["he's chinese", "he is chinese"] },
    { id: 2,  fromAudio: "audio/from-02.mp3", natAudio: "audio/nat-02.mp3", country: "Spain",        answer: "She's Spanish",     answers: ["she's spanish", "she is spanish"] },
    { id: 3,  fromAudio: "audio/from-03.mp3", natAudio: "audio/nat-03.mp3", country: "Japan",        answer: "He's Japanese",     answers: ["he's japanese", "he is japanese"] },
    { id: 4,  fromAudio: "audio/from-04.mp3", natAudio: "audio/nat-04.mp3", country: "Vietnam",      answer: "She's Vietnamese",  answers: ["she's vietnamese", "she is vietnamese"] },
    { id: 5,  fromAudio: "audio/from-05.mp3", natAudio: "audio/nat-05.mp3", country: "the US",       answer: "He's American",     answers: ["he's american", "he is american"] },
    { id: 6,  fromAudio: "audio/from-06.mp3", natAudio: "audio/nat-06.mp3", country: "Chile",        answer: "She's Chilean",     answers: ["she's chilean", "she is chilean"] },
    { id: 7,  fromAudio: "audio/from-07.mp3", natAudio: "audio/nat-07.mp3", country: "Argentina",    answer: "He's Argentinian",  answers: ["he's argentinian", "he is argentinian", "he's argentine", "he is argentine"] },
    { id: 8,  fromAudio: "audio/from-08.mp3", natAudio: "audio/nat-08.mp3", country: "Mexico",       answer: "She's Mexican",     answers: ["she's mexican", "she is mexican"] },
    { id: 9,  fromAudio: "audio/from-09.mp3", natAudio: "audio/nat-09.mp3", country: "England",      answer: "He's English",      answers: ["he's english", "he is english"] },
    { id: 10, fromAudio: "audio/from-10.mp3", natAudio: "audio/nat-10.mp3", country: "Turkey",       answer: "She's Turkish",     answers: ["she's turkish", "she is turkish"] },
    { id: 11, fromAudio: "audio/from-11.mp3", natAudio: "audio/nat-11.mp3", country: "Korea",        answer: "He's Korean",       answers: ["he's korean", "he is korean"] },
    { id: 12, fromAudio: "audio/from-12.mp3", natAudio: "audio/nat-12.mp3", country: "Canada",       answer: "She's Canadian",    answers: ["she's canadian", "she is canadian"] },
    { id: 13, fromAudio: "audio/from-13.mp3", natAudio: "audio/nat-13.mp3", country: "Brazil",       answer: "He's Brazilian",    answers: ["he's brazilian", "he is brazilian"] },
    { id: 14, fromAudio: "audio/from-14.mp3", natAudio: "audio/nat-14.mp3", country: "Peru",         answer: "She's Peruvian",    answers: ["she's peruvian", "she is peruvian"] },
    { id: 15, fromAudio: "audio/from-15.mp3", natAudio: "audio/nat-15.mp3", country: "Saudi Arabia", answer: "He's Saudi",        answers: ["he's saudi", "he is saudi"] },
    { id: 16, fromAudio: "audio/from-16.mp3", natAudio: "audio/nat-16.mp3", country: "the UK",       answer: "She's British",     answers: ["she's british", "she is british"] },
  ];

  const PART1 = ITEMS.slice(0, 8);  // 1–8
  const PART2 = ITEMS.slice(8);     // 9–16

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | tryagain | feedback | continue | done
  let part = 1;       // 1 or 2
  let order = [];
  let index = 0;
  let correctCount = 0;
  let part1Correct = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\bhe is\b/g, "he's")
      .replace(/\bshe is\b/g, "she's");
  }

  function isCorrectAnswer(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    return item.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playFromAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.fromAudio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function playNatAudio(then) {
    const item = order[index];
    if (!item) { if (then) then(); return; }
    stopAudio();
    const a = new Audio(item.natAudio);
    currentAudio = a;
    a.play().catch(() => { if (then) then(); });
    a.onended = () => {
      if (currentAudio === a) currentAudio = null;
      if (then) then();
    };
  }

  function startPart(p) {
    part = p;
    order = p === 1 ? PART1.slice() : PART2.slice();
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
    setTimeout(playFromAudio, 350);
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrectAnswer(lastUserInput, item);
    stopAudio();

    if (lastCorrect) {
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render();
      // Play model "He's/She's …" then auto-next
      playNatAudio(() => {
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
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    stopAudio();
    render();
    playNatAudio(() => {
      setTimeout(() => nextItem(), 400);
    });
  }

  function nextItem() {
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playFromAudio, 300);
    } else if (part === 1) {
      part1Correct = correctCount;
      phase = "continue";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const total = part1Correct + correctCount; // out of 16 if finished both
    const n = phase === "done" ? total : correctCount;
    const max = phase === "done" ? 16 : 8;
    if (n >= max - 1) return 3;
    if (n >= Math.ceil(max * 0.65)) return 2;
    if (n >= Math.ceil(max * 0.4)) return 1;
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
    const current = index + 1;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="lw-track" aria-hidden="true">
        <div class="lw-track-fill" style="width:${fill}%"></div>
      </div>
      <div class="lw-scoreline">
        <span class="lw-score">${correctCount} correct</span>
        <span class="lw-step">${current} / ${total}</span>
      </div>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from…</span>
          <span class="lw-badge">2A</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">🗣️</div>
          <h1>I'm from…</h1>
          <p class="lw-desc">Listen to <em>I'm from…</em><br>Write <strong>He's / She's + nationality</strong></p>
          <button type="button" class="lw-btn" id="lw-start">Start (1–8) →</button>
        </section>`;
      document.getElementById("lw-start").onclick = () => startPart(1);
      return;
    }

    if (phase === "continue") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from…</span>
          <span class="lw-badge">Part 1</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">👍</div>
          <h1>Part 1 complete</h1>
          <p>You got <strong>${correctCount} / 8</strong> correct.</p>
          <p class="lw-desc">Continue with 9–16?</p>
          <button type="button" class="lw-btn" id="lw-yes">Yes, continue →</button>
          <button type="button" class="lw-btn secondary" id="lw-stop">Finish here</button>
        </section>`;
      document.getElementById("lw-yes").onclick = () => startPart(2);
      document.getElementById("lw-stop").onclick = () => {
        phase = "done";
        render();
      };
      return;
    }

    if (phase === "done") {
      const totalCorrect = part === 2 ? part1Correct + correctCount : correctCount;
      const totalItems = part === 2 ? 16 : 8;
      const stars = saveStars();
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from…</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="lw-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${totalCorrect} / ${totalItems}</strong> correct.</p>
          <button type="button" class="lw-btn" id="lw-again">Play again</button>
          <button type="button" class="lw-btn secondary" id="lw-menu">Home</button>
        </section>`;
      document.getElementById("lw-again").onclick = () => startPart(1);
      document.getElementById("lw-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const item = order[index];
    const progress = (index + 1) + " / " + order.length;
    const partLabel = part === 1 ? "1–8" : "9–16";

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from… · ${partLabel}</span>
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
        setTimeout(playFromAudio, 250);
      };
      return;
    }

    if (phase === "feedback") {
      const msg = lastSkipped
        ? `Answer: <strong>${item.answer}</strong>`
        : `Correct! <strong>${item.answer}</strong>`;
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">I'm from… · ${partLabel}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback ${lastCorrect ? "is-correct" : "is-wrong"}">
          <div class="lw-fb-icon">${lastCorrect ? "✅" : "➡️"}</div>
          <p class="lw-fb-msg">${msg}</p>
        </section>`;
      return;
    }

    // play
    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">I'm from… · ${partLabel}</span>
        <span class="lw-progress">${progress}</span>
      </header>
      ${progressHTML()}
      <section class="lw-play-area">
        <p class="lw-instruction">Listen, then write <strong>He's / She's + nationality</strong></p>
        <button type="button" class="lw-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <div class="lw-input-wrap">
          <input type="text" id="lw-input" class="lw-input" placeholder="e.g. He's Chinese" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false">
        </div>
        <div class="lw-actions">
          <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
          <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
        </div>
      </section>`;
    const input = document.getElementById("lw-input");
    const checkBtn = document.getElementById("lw-check");
    input.focus();
    document.querySelector(".lw-play").onclick = playFromAudio;
    checkBtn.onclick = checkAnswer;
    document.getElementById("lw-skip").onclick = skipAnswer;
    input.oninput = () => { checkBtn.disabled = !input.value.trim(); };
    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim()) checkAnswer();
    };
  }

  render();
})();
