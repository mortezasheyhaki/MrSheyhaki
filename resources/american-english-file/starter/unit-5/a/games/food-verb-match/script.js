(function () {
  const PAIRS = [
    ["eat", "fish"], ["eat", "meat"], ["eat", "pasta"], ["eat", "rice"], ["eat", "eggs"],
    ["eat", "yogurt"], ["eat", "vegetables"], ["eat", "potatoes"], ["eat", "salad"], ["eat", "fruit"],
    ["eat", "bread"], ["eat", "butter"], ["eat", "cheese"], ["eat", "sugar"], ["eat", "a sandwich"],
    ["eat", "cereal"], ["eat", "chocolate"],
    ["drink", "coffee"], ["drink", "tea"], ["drink", "milk"], ["drink", "water"], ["drink", "orange juice"],
    ["have", "breakfast"], ["have", "lunch"], ["have", "dinner"]
  ];
  const VERBS = ["eat", "drink", "have"];
  const VISIBLE = 5;
  const TOTAL = PAIRS.length;
  const START_TIME = 90;

  const $ = (id) => document.getElementById(id);
  const homeScreen = $("homeScreen");
  const gameScreen = $("gameScreen");
  const verbColumn = $("verbColumn");
  const itemColumn = $("itemColumn");
  const scoreEl = $("score");
  const comboEl = $("combo");
  const timerEl = $("timer");
  const progressLabel = $("progressLabel");
  const fillEl = $("progressFill");
  const statusEl = $("status");
  const endModal = $("endModal");

  let state = null;

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startGame() {
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    endModal.classList.add("hidden");
    resetRound();
  }

  function resetRound() {
    if (state && state.timer) clearInterval(state.timer);
    state = {
      score: 0, combo: 0, bestCombo: 0, correct: 0, attempts: 0,
      time: START_TIME, done: false, selected: null,
      remaining: shuffle(PAIRS.map(([, item]) => item)),
      matchedItems: new Set(),
      visibleItems: [],
      timer: null
    };
    verbColumn.innerHTML = "";
    itemColumn.innerHTML = "";
    VERBS.forEach((v) => makeCard(v, "verb", verbColumn));
    fillItems();
    updateHud();
    state.timer = setInterval(tick, 1000);
  }

  function fillItems() {
    while (state.visibleItems.length < VISIBLE && state.remaining.length > 0) {
      const next = state.remaining.shift();
      state.visibleItems.push(next);
      makeCard(next, "item", itemColumn);
    }
  }

  function makeCard(text, type, parent) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "match-card";
    b.textContent = text;
    b.dataset.type = type;
    b.dataset.word = text;
    b.addEventListener("click", () => select(b));
    b.addEventListener("pointerdown", onPointerDown);
    parent.appendChild(b);
    return b;
  }

  function select(card) {
    if (state.done || card.disabled) return;
    if (state.selected === card) {
      card.classList.remove("selected");
      state.selected = null;
      return;
    }
    if (state.selected) {
      if (state.selected.dataset.type !== card.dataset.type) {
        attempt(state.selected, card);
        return;
      }
      state.selected.classList.remove("selected");
    }
    state.selected = card;
    card.classList.add("selected");
    statusEl.textContent = card.textContent + " selected";
  }

  function onPointerDown(e) {
    if (state.done || (e.button !== undefined && e.button !== 0)) return;
    const card = e.currentTarget;
    if (card.disabled) return;
    e.preventDefault();
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    card.classList.add("dragging");
    const move = (ev) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      document.querySelectorAll(".match-card").forEach((x) => {
        x.classList.toggle("target", x !== card && el && (x === el || x.contains(el)));
      });
    };
    const up = (ev) => {
      card.classList.remove("dragging");
      document.querySelectorAll(".target").forEach((x) => x.classList.remove("target"));
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      try { card.releasePointerCapture(ev.pointerId); } catch (_) {}
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const target = el && el.closest ? el.closest(".match-card") : null;
      if (target && target !== card) attempt(card, target);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  function clearSel() {
    document.querySelectorAll(".match-card.selected").forEach((c) => c.classList.remove("selected"));
    state.selected = null;
  }

  function remainingForVerb(verb) {
    return PAIRS.filter(([v, item]) => v === verb && !state.matchedItems.has(item)).length;
  }

  function attempt(a, b) {
    if (!a || !b || a.dataset.type === b.dataset.type || a.disabled || b.disabled) return;
    state.attempts++;
    const verb = a.dataset.type === "verb" ? a.dataset.word : b.dataset.word;
    const item = a.dataset.type === "item" ? a.dataset.word : b.dataset.word;
    const ok = PAIRS.some(([v, i]) => v === verb && i === item);
    clearSel();

    if (!ok) {
      state.combo = 0;
      a.classList.add("wrong");
      b.classList.add("wrong");
      setTimeout(() => { a.classList.remove("wrong"); b.classList.remove("wrong"); }, 420);
      updateHud();
      return;
    }

    state.correct++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.score += 15 + Math.max(0, state.combo - 1) * 3;
    state.matchedItems.add(item);

    const itemCard = a.dataset.type === "item" ? a : b;
    const verbCard = a.dataset.type === "verb" ? a : b;
    verbCard.classList.add("correct-flash");
    setTimeout(() => verbCard.classList.remove("correct-flash"), 380);

    itemCard.classList.add("matched");
    setTimeout(() => {
      if (itemCard.parentNode) itemCard.parentNode.removeChild(itemCard);
      state.visibleItems = state.visibleItems.filter((x) => x !== item);
      fillItems();
    }, 320);

    if (remainingForVerb(verb) === 0) {
      verbCard.classList.add("verb-done");
      verbCard.disabled = true;
    }

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
    comboEl.textContent = state.combo + "x";
    timerEl.textContent = String(Math.max(0, state.time));
    progressLabel.textContent = state.correct + " / " + TOTAL;
    fillEl.style.width = (state.correct / TOTAL) * 100 + "%";
  }

  function finish(won) {
    state.done = true;
    clearInterval(state.timer);
    $("finalScore").textContent = state.score;
    $("accuracy").textContent = (state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0) + "%";
    $("bestCombo").textContent = state.bestCombo + "x";
    $("endTitle").textContent = won ? "Excellent!" : "Time's up!";
    $("endMessage").textContent = won
      ? "You matched all " + TOTAL + " combinations."
      : "You matched " + state.correct + " of " + TOTAL + ".";
    $("resultIcon").textContent = won ? "🏆" : "⏱️";
    endModal.classList.remove("hidden");
  }

  const themeBtn = $("themeBtn");
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeBtn.textContent = dark ? "☀️" : "🌙";
    try { localStorage.setItem("fvm-theme", dark ? "dark" : "light"); } catch (_) {}
  }
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });
  try { applyTheme(localStorage.getItem("fvm-theme") === "dark"); } catch (_) { applyTheme(false); }

  $("startBtn").addEventListener("click", startGame);
  $("playAgain").addEventListener("click", () => {
    endModal.classList.add("hidden");
    startGame();
  });
})();
