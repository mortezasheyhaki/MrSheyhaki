/* What's this? → How do you spell it? · PE1 classroom objects */
(function () {
  const GAME_ID = "starter-pe1-classroom-whats-this";

  const ITEMS = [
    { id: "bag",        label: "a bag",            image: "images/a-bag.png",            audio: "audio/a-bag.mp3",
      nameAnswers: ["it's a bag", "it is a bag"],
      spellAnswers: ["bag"] },
    { id: "pen",        label: "a pen",            image: "images/a-pen.png",            audio: "audio/a-pen.mp3",
      nameAnswers: ["it's a pen", "it is a pen"],
      spellAnswers: ["pen"] },
    { id: "paper",      label: "a piece of paper", image: "images/a-piece-of-paper.png", audio: "audio/a-piece-of-paper.mp3",
      nameAnswers: ["it's a piece of paper", "it is a piece of paper"],
      spellAnswers: ["paper", "piece of paper"] },
    { id: "dictionary", label: "a dictionary",     image: "images/a-dictionary.png",     audio: "audio/a-dictionary.mp3",
      nameAnswers: ["it's a dictionary", "it is a dictionary"],
      spellAnswers: ["dictionary"] },
    { id: "laptop",     label: "a laptop",         image: "images/a-laptop.png",         audio: "audio/a-laptop.mp3",
      nameAnswers: ["it's a laptop", "it is a laptop"],
      spellAnswers: ["laptop"] },
    { id: "table",      label: "a table",          image: "images/a-table.png",          audio: "audio/a-table.mp3",
      nameAnswers: ["it's a table", "it is a table"],
      spellAnswers: ["table"] },
    { id: "chair",      label: "a chair",          image: "images/a-chair.png",          audio: "audio/a-chair.mp3",
      nameAnswers: ["it's a chair", "it is a chair"],
      spellAnswers: ["chair"] },
    { id: "window",     label: "a window",         image: "images/a-window.png",         audio: "audio/a-window.mp3",
      nameAnswers: ["it's a window", "it is a window"],
      spellAnswers: ["window"] },
    { id: "door",       label: "the door",         image: "images/the-door.png",         audio: "audio/the-door.mp3",
      nameAnswers: ["it's the door", "it is the door", "it's a door", "it is a door"],
      spellAnswers: ["door"] },
    { id: "board",      label: "the board",        image: "images/the-board.png",        audio: "audio/the-board.mp3",
      nameAnswers: ["it's the board", "it is the board", "it's a board", "it is a board"],
      spellAnswers: ["board"] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  // step: "name" = What's this?  |  "spell" = How do you spell it?
  let phase = "menu"; // menu | play | feedback | done
  let order = [];
  let index = 0;
  let step = "name";
  let correctCount = 0;
  let totalAnswered = 0; // each item has 2 questions
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let currentAudio = null;
  let autoTimer = null;

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
      .replace(/\s+/g, " ")
      .replace(/[’']/g, "'");
  }

  function core(str) {
    return normalize(str).replace(/^(a|an|the)\s+/, "");
  }

  function isCorrect(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    const list = step === "name" ? item.nameAnswers : item.spellAnswers;
    return list.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playItemAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function clearAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function startGame() {
    clearAuto();
    order = shuffle(ITEMS);
    index = 0;
    step = "name";
    correctCount = 0;
    totalAnswered = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("wt-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrect(lastUserInput, item);
    totalAnswered += 1;
    if (lastCorrect) correctCount += 1;
    answered = true;
    stopAudio();
    if (input) {
      input.classList.add(lastCorrect ? "wt-ok" : "wt-bad");
      input.blur();
    }
    const checkBtn = document.getElementById("wt-check");
    if (checkBtn) checkBtn.disabled = true;
    setTimeout(() => {
      phase = "feedback";
      render();
    }, lastCorrect ? 280 : 380);
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    totalAnswered += 1;
    answered = true;
    stopAudio();
    phase = "feedback";
    render();
  }

  function advance() {
    clearAuto();
    // After "name" step → go to "spell" for same item
    // After "spell" step → next item (or done)
    if (step === "name") {
      step = "spell";
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      return;
    }
    // finished spell for this item
    if (index < order.length - 1) {
      index += 1;
      step = "name";
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const total = ITEMS.length * 2;
    const n = correctCount;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
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

  function spawnSparks(el) {
    if (!el) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "wt-spark";
      const angle = (i / 10) * Math.PI * 2;
      const dist = 32 + Math.random() * 22;
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      s.style.setProperty("--delay", (i * 0.02) + "s");
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }

  // progress: each item = 2 steps
  function progressPct() {
    const doneSteps = index * 2 + (step === "spell" ? 1 : 0) + (phase === "feedback" ? 1 : 0);
    const total = order.length * 2;
    return Math.min(100, (doneSteps / total) * 100);
  }

  function progressLabel() {
    const itemNum = index + 1;
    const stepLabel = step === "name" ? "1/2" : "2/2";
    return `${itemNum}/${order.length} · ${stepLabel}`;
  }

  function render() {
    clearAuto();

    if (phase === "menu") {
      app.innerHTML = `
        <header class="wt-topbar">
          <a class="wt-back" href="../" aria-label="Back">←</a>
          <span class="wt-title">What's this?</span>
          <span class="wt-badge">PE1</span>
        </header>
        <section class="wt-start">
          <div class="wt-hero" aria-hidden="true">❓</div>
          <h1>What's this?</h1>
          <p class="wt-desc">See the picture → name it → spell it.<br>10 classroom objects · 2 steps each</p>
          <button type="button" class="wt-btn" id="wt-start">Start →</button>
        </section>`;
      document.getElementById("wt-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const total = ITEMS.length * 2;
      app.innerHTML = `
        <header class="wt-topbar">
          <a class="wt-back" href="../" aria-label="Back">←</a>
          <span class="wt-title">What's this?</span>
          <span class="wt-badge">Done</span>
        </header>
        <section class="wt-done">
          <div class="wt-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="wt-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / ${total}</strong> correct.</p>
          <button type="button" class="wt-btn" id="wt-again">Play again</button>
          <a class="wt-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("wt-again").onclick = startGame;
      return;
    }

    const item = order[index];
    const isName = step === "name";
    const question = isName ? "What's this?" : "How do you spell it?";
    const tip = isName ? 'Answer with: It\'s a … / It\'s the …' : "Spell the word (letters only).";
    const placeholder = isName ? "It's a …" : "Type the word…";

    if (phase === "play") {
      app.innerHTML = `
        <header class="wt-topbar">
          <a class="wt-back" href="#" id="wt-back" aria-label="Back">←</a>
          <span class="wt-title">${question}</span>
          <span class="wt-progress">${progressLabel()}</span>
        </header>
        <div class="wt-bar"><div class="wt-bar-fill" style="width:${progressPct()}%"></div></div>
        <p class="wt-instruction">${tip}</p>
        <section class="wt-play-area">
          <div class="wt-pic-wrap">
            <img class="wt-pic" src="${item.image}" alt="Classroom object" draggable="false">
          </div>
          <p class="wt-question">${question}</p>
          <div class="wt-input-wrap">
            <input type="text" id="wt-input" class="wt-input"
              placeholder="${placeholder}"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
          </div>
          <div class="wt-actions">
            <button type="button" class="wt-btn" id="wt-check" disabled>Check</button>
            <button type="button" class="wt-skip" id="wt-skip">Skip →</button>
          </div>
        </section>`;

      document.getElementById("wt-back").onclick = (e) => {
        e.preventDefault();
        stopAudio();
        phase = "menu";
        render();
      };
      const input = document.getElementById("wt-input");
      const checkBtn = document.getElementById("wt-check");
      input.focus();
      checkBtn.onclick = checkAnswer;
      document.getElementById("wt-skip").onclick = skipAnswer;
      const sync = () => { checkBtn.disabled = !input.value.trim(); };
      input.addEventListener("input", sync);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkAnswer();
      });
      return;
    }

    // feedback
    const nextLabel = step === "name"
      ? "Spell it →"
      : (index < order.length - 1 ? "Next →" : "See results →");

    app.innerHTML = `
      <header class="wt-topbar">
        <a class="wt-back" href="#" id="wt-back" aria-label="Back">←</a>
        <span class="wt-title">${question}</span>
        <span class="wt-progress">${progressLabel()}</span>
      </header>
      <div class="wt-bar"><div class="wt-bar-fill" style="width:${progressPct()}%"></div></div>
      <section class="wt-feedback ${lastCorrect ? "is-correct" : lastSkipped ? "is-skip" : "is-wrong"}">
        <div class="wt-result-icon">${lastCorrect ? "✅" : lastSkipped ? "⏭️" : "❌"}</div>
        <h2>${lastCorrect ? "Correct!" : lastSkipped ? "Skipped" : "Not quite"}</h2>
        <div class="wt-answer-card">
          <img class="wt-answer-img" src="${item.image}" alt="${item.label}">
          <strong>${step === "name" ? (item.nameAnswers[0].charAt(0).toUpperCase() + item.nameAnswers[0].slice(1)) : item.spellAnswers[0]}</strong>
        </div>
        ${!lastSkipped ? `<p class="wt-your">You wrote: <em>${(lastUserInput || "—").trim() || "—"}</em></p>` : ""}
        <button type="button" class="wt-btn" id="wt-next">${nextLabel}</button>
      </section>`;

    document.getElementById("wt-back").onclick = (e) => {
      e.preventDefault();
      stopAudio();
      phase = "menu";
      render();
    };
    const nextBtn = document.getElementById("wt-next");
    nextBtn.onclick = advance;
    if (lastCorrect) {
      const card = app.querySelector(".wt-answer-card");
      setTimeout(() => spawnSparks(card), 80);
      playItemAudio();
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.6";
      autoTimer = setTimeout(() => advance(), 1100);
    }
  }

  render();
})();
