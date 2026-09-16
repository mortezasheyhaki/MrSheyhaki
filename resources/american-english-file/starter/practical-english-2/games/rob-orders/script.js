/* What does Rob order? · AEF Starter Practical English 2 */
(function () {
  const GAME_ID = "starter-pe2-rob-orders";

  const MENU = {
    food: [
      { id: "burger", label: "Three Kings Burger", price: "£7.99" },
      { id: "pie", label: "Pies (steak or chicken)", price: "£9.20" },
      { id: "sandwich", label: "Sandwiches (cheese or tuna)", price: "£4.15", correct: true },
      { id: "salad", label: "Salad (chicken or egg)", price: "£5.99" },
    ],
    drinks: [
      { id: "water", label: "Mineral water", price: "£1.90" },
      { id: "oj", label: "Orange juice", price: "£2.80" },
      { id: "coke", label: "Coke / Diet Coke", price: "£2.60", correct: true },
      { id: "coffee", label: "Coffee / Tea", price: "£1.95" },
    ],
  };

  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/a617834_Rob_orders.mp3";

  // Correct set of ids
  const CORRECT_IDS = new Set(["sandwich", "coke"]);

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | result
  let selected = new Set();
  let currentAudio = null;
  let submitted = false;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".ro-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(AUDIO_URL);
    currentAudio = a;
    const btn = app.querySelector(".ro-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function toggleItem(id) {
    if (submitted) return;
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    renderPlay(false); // re-render without resetting audio state
  }

  function checkAnswer() {
    if (submitted) return;
    submitted = true;
    stopAudio();

    // exact match required
    let allCorrect = selected.size === CORRECT_IDS.size;
    if (allCorrect) {
      for (const id of CORRECT_IDS) {
        if (!selected.has(id)) { allCorrect = false; break; }
      }
    }

    // stars: 3 if perfect, 1 if at least one correct and no wrong extras, else 0
    let stars = 0;
    if (allCorrect) stars = 3;
    else {
      let hits = 0;
      let extras = 0;
      selected.forEach((id) => {
        if (CORRECT_IDS.has(id)) hits++;
        else extras++;
      });
      if (hits === 2 && extras === 0) stars = 3;
      else if (hits >= 1 && extras === 0) stars = 2;
      else if (hits >= 1) stars = 1;
    }

    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }

    phase = "result";
    renderResult(allCorrect, stars);
  }

  function startGame() {
    selected = new Set();
    submitted = false;
    phase = "play";
    render();
  }

  function renderMenu() {
    app.innerHTML = `
      <header class="ro-topbar">
        <a class="ro-back" href="../" aria-label="Back"><span aria-hidden="true">←</span><span class="ro-back-label">What does Rob order?</span></a>
          <span class="ro-badge">PE2</span>
        </header>
      <section class="ro-start">
        <div class="ro-hero" aria-hidden="true">🍔</div>
        <h1>What does Rob order?</h1>
        <p class="ro-desc">Listen to Rob ordering at The Three Kings and tick the items he asks for.</p>
        <button type="button" class="ro-btn" id="ro-start">Start</button>
      </section>`;
    document.getElementById("ro-start").onclick = startGame;
  }

  function renderPlay(full = true) {
    const foodRows = MENU.food.map((item) => {
      const isSel = selected.has(item.id);
      return `
        <button type="button" class="ro-item${isSel ? " is-selected" : ""}" data-id="${item.id}">
          <span class="ro-check">${isSel ? "✓" : ""}</span>
          <span class="ro-item-label">${item.label}</span>
          <span class="ro-item-price">${item.price}</span>
        </button>`;
    }).join("");

    const drinkRows = MENU.drinks.map((item) => {
      const isSel = selected.has(item.id);
      return `
        <button type="button" class="ro-item${isSel ? " is-selected" : ""}" data-id="${item.id}">
          <span class="ro-check">${isSel ? "✓" : ""}</span>
          <span class="ro-item-label">${item.label}</span>
          <span class="ro-item-price">${item.price}</span>
        </button>`;
    }).join("");

    app.innerHTML = `
      <header class="ro-topbar">
        <a class="ro-back" href="../" aria-label="Back"><span aria-hidden="true">←</span><span class="ro-back-label">What does Rob order?</span></a>
          <span class="ro-progress">Listen & tick</span>
        </header>

      <div class="ro-content">
        <div class="ro-audio-row">
          <button type="button" class="ro-play" aria-label="Play Rob's order">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <p class="ro-hint">Listen, then tick what Rob orders</p>
        </div>

        <div class="ro-menu">
          <div class="ro-section">
            <h2 class="ro-section-title">FOOD</h2>
            <div class="ro-list">${foodRows}</div>
          </div>
          <div class="ro-section">
            <h2 class="ro-section-title">DRINKS</h2>
            <div class="ro-list">${drinkRows}</div>
          </div>
        </div>

        <div class="ro-footer">
          <button type="button" class="ro-btn" id="ro-check" ${selected.size === 0 ? "disabled" : ""}>
            Check answer
          </button>
        </div>
      </div>`;

    app.querySelector(".ro-play").onclick = playAudio;
    app.querySelectorAll(".ro-item").forEach((btn) => {
      btn.onclick = () => toggleItem(btn.dataset.id);
    });
    document.getElementById("ro-check").onclick = checkAnswer;
  }

  function renderResult(allCorrect, stars) {
    const correctLabels = [];
    MENU.food.concat(MENU.drinks).forEach((item) => {
      if (CORRECT_IDS.has(item.id)) correctLabels.push(item.label);
    });

    app.innerHTML = `
      <header class="ro-topbar">
        <a class="ro-back" href="../" aria-label="Back"><span aria-hidden="true">←</span><span class="ro-back-label">What does Rob order?</span></a>
          <span class="ro-badge">Done</span>
        </header>
      <section class="ro-done">
        <div class="ro-stars" aria-hidden="true">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <h1>${allCorrect ? "Perfect!" : stars >= 1 ? "Good try!" : "Keep listening!"}</h1>
        <p class="ro-result-text">
          Rob ordered:<br>
          <strong>${correctLabels.join(" + ")}</strong><br>
          <span class="ro-total">Total: £6.75</span>
        </p>
        <button type="button" class="ro-btn" id="ro-again">Play again</button>
        <button type="button" class="ro-btn secondary" id="ro-menu">Back to start</button>
      </section>`;

    document.getElementById("ro-again").onclick = startGame;
    document.getElementById("ro-menu").onclick = () => { phase = "menu"; render(); };
  }

  function render() {
    if (phase === "menu") renderMenu();
    else if (phase === "play") renderPlay();
    else if (phase === "result") {
      // already handled inside checkAnswer
    }
  }

  render();
})();
