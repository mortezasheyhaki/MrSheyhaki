/**
 * Food Verb Match — Unit 5A
 * Verbs (eat / drink / have) each pair with many foods.
 * Only the food card is consumed on a correct match; verbs stay available.
 */
const PAIRS = [
  ["eat", "fish"], ["eat", "meat"], ["eat", "pasta"], ["eat", "rice"], ["eat", "eggs"],
  ["eat", "yogurt"], ["eat", "vegetables"], ["eat", "potatoes"], ["eat", "salad"], ["eat", "fruit"],
  ["eat", "bread"], ["eat", "butter"], ["eat", "cheese"], ["eat", "sugar"], ["eat", "a sandwich"],
  ["eat", "cereal"], ["eat", "chocolate"],
  ["drink", "coffee"], ["drink", "tea"], ["drink", "milk"], ["drink", "water"], ["drink", "orange juice"],
  ["have", "breakfast"], ["have", "lunch"], ["have", "dinner"]
];

const VERBS = ["eat", "drink", "have"];
const TOTAL = PAIRS.length;

const verbColumn = document.getElementById("verbColumn");
const itemColumn = document.getElementById("itemColumn");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const timeEl = document.getElementById("time");
const progressEl = document.getElementById("progressCount");
const fillEl = document.getElementById("progressFill");
const statusEl = document.getElementById("status");
const helperEl = document.getElementById("helper");
const endModal = document.getElementById("endModal");

let state = null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function remainingForVerb(verb) {
  return PAIRS.filter(([v, item]) => v === verb && !state.matchedItems.has(item)).length;
}

function makeCard(text, type) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "match-card";
  b.textContent = text;
  b.dataset.type = type;
  b.dataset.word = text;
  b.setAttribute("aria-label", type + ": " + text);
  b.addEventListener("click", () => select(b));
  b.addEventListener("pointerdown", onPointerDown);
  (type === "verb" ? verbColumn : itemColumn).appendChild(b);
  return b;
}

function reset() {
  if (state && state.timer) clearInterval(state.timer);

  state = {
    score: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    attempts: 0,
    time: 90,
    done: false,
    selected: null,
    matchedItems: new Set(),
    timer: null
  };

  verbColumn.innerHTML = "";
  itemColumn.innerHTML = "";
  endModal.classList.add("hidden");

  VERBS.forEach((v) => makeCard(v, "verb"));
  shuffle(PAIRS.map(([, item]) => item)).forEach((item) => makeCard(item, "item"));

  if (helperEl) {
    helperEl.textContent =
      "Tap a verb, then tap a food/drink/meal that goes with it — or drag a card onto its match.";
  }

  update();
  state.timer = setInterval(tick, 1000);
}

function select(card) {
  if (state.done || card.classList.contains("matched") || card.disabled) return;

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
  statusEl.textContent = card.textContent + " selected. Tap its match.";
}

function onPointerDown(e) {
  if (state.done || (e.button !== undefined && e.button !== 0)) return;
  const card = e.currentTarget;
  if (card.classList.contains("matched") || card.disabled) return;

  e.preventDefault();
  try {
    card.setPointerCapture(e.pointerId);
  } catch (_) {}

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
    try {
      card.releasePointerCapture(ev.pointerId);
    } catch (_) {}

    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const target = el && el.closest ? el.closest(".match-card") : null;
    if (target && target !== card) attempt(card, target);
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

function attempt(a, b) {
  if (!a || !b) return;
  if (a.dataset.type === b.dataset.type) return;
  if (a.classList.contains("matched") || b.classList.contains("matched")) return;
  if (a.disabled || b.disabled) return;

  state.attempts++;

  const verb = a.dataset.type === "verb" ? a.dataset.word : b.dataset.word;
  const item = a.dataset.type === "item" ? a.dataset.word : b.dataset.word;

  const correct = PAIRS.some(([v, i]) => v === verb && i === item);

  // clear selection highlight
  document.querySelectorAll(".match-card.selected").forEach((c) => c.classList.remove("selected"));
  state.selected = null;

  if (!correct) {
    state.combo = 0;
    a.classList.add("wrong");
    b.classList.add("wrong");
    statusEl.textContent = "Try again: " + verb + " + " + item + ".";
    setTimeout(() => {
      a.classList.remove("wrong");
      b.classList.remove("wrong");
    }, 400);
    update();
    return;
  }

  // Correct — consume the ITEM only; verbs stay for other matches
  state.correct++;
  state.combo++;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.score += 15 + Math.max(0, state.combo - 1) * 3;
  state.matchedItems.add(item);

  const itemCard = a.dataset.type === "item" ? a : b;
  const verbCard = a.dataset.type === "verb" ? a : b;

  itemCard.classList.add("matched");
  itemCard.disabled = true;

  // Brief flash on the verb
  verbCard.classList.add("correct-flash");
  setTimeout(() => verbCard.classList.remove("correct-flash"), 350);

  // If this verb has no remaining items, mark it complete
  if (remainingForVerb(verb) === 0) {
    verbCard.classList.add("matched", "verb-done");
    verbCard.disabled = true;
  }

  statusEl.textContent = "Correct! " + verb + " + " + item + ".";
  update();

  if (state.correct >= TOTAL) finish(true);
}

function tick() {
  if (state.done) return;
  state.time--;
  update();
  if (state.time <= 0) finish(false);
}

function update() {
  scoreEl.textContent = state.score;
  comboEl.textContent = "×" + state.combo;
  const m = Math.floor(state.time / 60);
  const s = state.time % 60;
  timeEl.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  progressEl.textContent = state.correct;
  fillEl.style.width = (state.correct / TOTAL) * 100 + "%";
}

function finish(won) {
  state.done = true;
  clearInterval(state.timer);

  document.getElementById("finalScore").textContent = state.score;
  document.getElementById("accuracy").textContent =
    (state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0) + "%";
  document.getElementById("bestCombo").textContent = "×" + state.bestCombo;
  document.getElementById("endTitle").textContent = won ? "Excellent!" : "Time's up!";
  document.getElementById("endMessage").textContent = won
    ? "You matched all " + TOTAL + " combinations."
    : "Play again and try to beat your score.";
  document.getElementById("resultIcon").textContent = won ? "🏆" : "⏱️";
  endModal.classList.remove("hidden");
}

document.getElementById("playAgain").addEventListener("click", reset);
reset();
