/**
 * Food & Drinks Sort — Match Rush style
 * Fixed viewport, no scroll.
 * Shows up to 6 words at a time; sorted words are replaced from the pool.
 */
(function () {
  const ITEMS = [
    ["fish", "food"], ["meat", "food"], ["pasta", "food"], ["rice", "food"], ["eggs", "food"],
    ["yogurt", "food"], ["vegetables", "food"], ["potatoes", "food"], ["salad", "food"], ["fruit", "food"],
    ["bread", "food"], ["butter", "food"], ["cheese", "food"], ["sugar", "food"], ["a sandwich", "food"],
    ["cereal", "food"], ["chocolate", "food"],
    ["coffee", "drinks"], ["tea", "drinks"], ["milk", "drinks"], ["water", "drinks"], ["orange juice", "drinks"]
  ];

  const VISIBLE = 6;
  const TOTAL = ITEMS.length;
  const START_TIME = 90;

  const $ = (id) => document.getElementById(id);
  const homeScreen = $("homeScreen");
  const gameScreen = $("gameScreen");
  const tray = $("cardTray");
  const foodZone = $("foodZone");
  const drinksZone = $("drinksZone");
  const foodCountEl = $("foodCount");
  const drinksCountEl = $("drinksCount");
  const scoreEl = $("score");
  const comboEl = $("combo");
  const timerEl = $("timer");
  const progressEl = $("progressCount");
  const progressTotal = $("progressTotal");
  const fillEl = $("progressFill");
  const statusEl = $("status");
  const endModal = $("endModal");

  let state = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startGame() {
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    endModal.classList.add("hidden");
    document.body.classList.add("playing");
    resetRound();
  }

  function resetRound() {
    if (state && state.timer) clearInterval(state.timer);

    state = {
      score: 0,
      combo: 0,
      bestCombo: 0,
      correct: 0,
      attempts: 0,
      foodCount: 0,
      drinksCount: 0,
      time: START_TIME,
      done: false,
      selected: null,
      remaining: shuffle(ITEMS.map(([word, cat]) => ({ word, category: cat }))),
      timer: null
    };

    progressTotal.textContent = String(TOTAL);
    tray.innerHTML = "";
    fillTray();
    updateHud();
    state.timer = setInterval(tick, 1000);
  }

  function fillTray() {
    while (tray.children.length < VISIBLE && state.remaining.length > 0) {
      const next = state.remaining.shift();
      makeCard(next.word, next.category);
    }
  }

  function makeCard(word, category) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "word-card";
    card.textContent = word;
    card.dataset.category = category;
    card.dataset.word = word;
    card.setAttribute("aria-label", "Word: " + word);
    card.addEventListener("click", () => selectCard(card));
    card.addEventListener("pointerdown", startPointer);
    tray.appendChild(card);
    return card;
  }

  function clearSelection() {
    tray.querySelectorAll(".selected").forEach((c) => c.classList.remove("selected"));
    foodZone.classList.remove("active-target");
    drinksZone.classList.remove("active-target");
    state.selected = null;
  }

  function selectCard(card) {
    if (state.done) return;
    if (state.selected === card) {
      clearSelection();
      return;
    }
    clearSelection();
    state.selected = card;
    card.classList.add("selected");
    foodZone.classList.add("active-target");
    drinksZone.classList.add("active-target");
    statusEl.textContent = card.textContent + " selected. Tap Food or Drinks.";
  }

  function startPointer(e) {
    if (state.done || (e.button !== undefined && e.button !== 0)) return;
    const card = e.currentTarget;
    e.preventDefault();
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    card.classList.add("dragging");

    const move = (ev) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      document.querySelectorAll(".drop-zone").forEach((z) => {
        z.classList.toggle("drag-over", !!(el && z.contains(el)));
      });
    };

    const up = (ev) => {
      card.classList.remove("dragging");
      document.querySelectorAll(".drop-zone").forEach((z) => z.classList.remove("drag-over"));
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      try { card.releasePointerCapture(ev.pointerId); } catch (_) {}

      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const zone = el && el.closest ? el.closest(".drop-zone") : null;
      if (zone) place(card, zone.dataset.category);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  [foodZone, drinksZone].forEach((zone) => {
    zone.addEventListener("click", () => {
      if (state.selected) place(state.selected, zone.dataset.category);
    });
  });

  function place(card, category) {
    if (!card || state.done || !card.parentNode) return;

    state.attempts++;
    const expected = card.dataset.category;

    if (expected !== category) {
      state.combo = 0;
      card.classList.add("wrong");
      statusEl.textContent = "Not quite. " + card.textContent + " is not " + category + ".";
      setTimeout(() => card.classList.remove("wrong"), 400);
      updateHud();
      return;
    }

    // Correct
    state.correct++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += 10 + Math.max(0, state.combo - 1) * 2;
    if (category === "food") state.foodCount++;
    else state.drinksCount++;

    clearSelection();
    statusEl.textContent = "Correct! " + card.textContent + " → " + category;

    card.classList.add("leaving");
    setTimeout(() => {
      if (card.parentNode) card.parentNode.removeChild(card);
      fillTray();
    }, 220);

    updateHud();
    if (state.correct >= TOTAL) finish(true);
  }

  function tick() {
    if (state.done) return;
    state.time--;
    updateHud();
    if (state.time <= 0) finish(false);
  }

  function updateHud() {
    scoreEl.textContent = state.score;
    comboEl.textContent = "×" + state.combo;
    const m = Math.floor(Math.max(0, state.time) / 60);
    const s = Math.max(0, state.time) % 60;
    timerEl.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    progressEl.textContent = state.correct;
    fillEl.style.width = (state.correct / TOTAL) * 100 + "%";
    foodCountEl.textContent = state.foodCount;
    drinksCountEl.textContent = state.drinksCount;
  }

  function finish(won) {
    state.done = true;
    clearInterval(state.timer);
    document.body.classList.remove("playing");

    $("finalScore").textContent = state.score;
    $("accuracy").textContent =
      (state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0) + "%";
    $("bestCombo").textContent = "×" + state.bestCombo;
    $("endTitle").textContent = won ? "Excellent!" : "Time's up!";
    $("endMessage").textContent = won
      ? "You sorted all " + TOTAL + " words correctly."
      : "You sorted " + state.correct + " of " + TOTAL + ". Try again!";
    $("resultIcon").textContent = won ? "🏆" : "⏱️";
    endModal.classList.remove("hidden");
  }

  // Theme
  const themeBtn = $("themeBtn");
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.classList.toggle("dark", dark);
    themeBtn.textContent = dark ? "☀️" : "🌙";
    try { localStorage.setItem("fds-theme", dark ? "dark" : "light"); } catch (_) {}
  }
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });
  try {
    applyTheme(localStorage.getItem("fds-theme") === "dark");
  } catch (_) {
    applyTheme(false);
  }

  $("startBtn").addEventListener("click", startGame);
  $("playAgain").addEventListener("click", () => {
    endModal.classList.add("hidden");
    startGame();
  });
})();
