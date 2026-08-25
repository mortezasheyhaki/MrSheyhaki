const PAIRS = [
  ["eat", "fish"], ["eat", "meat"], ["eat", "pasta"], ["eat", "rice"], ["eat", "eggs"],
  ["eat", "yogurt"], ["eat", "vegetables"], ["eat", "potatoes"], ["eat", "salad"], ["eat", "fruit"],
  ["eat", "bread"], ["eat", "butter"], ["eat", "cheese"], ["eat", "sugar"], ["eat", "a sandwich"],
  ["eat", "cereal"], ["eat", "chocolate"],
  ["drink", "coffee"], ["drink", "tea"], ["drink", "milk"], ["drink", "water"], ["drink", "orange juice"],
  ["have", "breakfast"], ["have", "lunch"], ["have", "dinner"]
];
const VERBS = ["eat", "drink", "have"];

const verbColumn = document.getElementById("verbColumn");
const itemColumn = document.getElementById("itemColumn");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const timeEl = document.getElementById("time");
const progressEl = document.getElementById("progressCount");
const fillEl = document.getElementById("progressFill");
const statusEl = document.getElementById("status");

let state;

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reset() {
  state = {
    score: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    attempts: 0,
    time: 75,
    done: false,
    selected: null,
    remaining: PAIRS.map(([v, i]) => ({ verb: v, item: i }))
  };
  verbColumn.innerHTML = "";
  itemColumn.innerHTML = "";
  document.getElementById("endModal").classList.add("hidden");

  VERBS.forEach((v) => makeCard(v, "verb"));
  shuffle(state.remaining.map((p) => p.item)).forEach((item) => makeCard(item, "item"));

  update();
  clearInterval(state.timer);
  state.timer = setInterval(tick, 1000);
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
}

function clearSelection() {
  if (state.selected) {
    state.selected.classList.remove("selected");
    state.selected = null;
  }
}

function select(card) {
  if (state.done || card.classList.contains("matched") || card.disabled) return;

  if (state.selected === card) {
    clearSelection();
    statusEl.textContent = "";
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
  if (card.disabled || card.classList.contains("matched")) return;

  e.preventDefault();
  try {
    card.setPointerCapture(e.pointerId);
  } catch (err) {}

  card.classList.add("dragging");
  const startX = e.clientX;
  const startY = e.clientY;
  let dragged = false;

  const move = (ev) => {
    if (Math.abs(ev.clientX - startX) > 8 || Math.abs(ev.clientY - startY) > 8) {
      dragged = true;
    }
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    document.querySelectorAll(".match-card").forEach((x) => {
      x.classList.toggle(
        "target",
        x !== card && !!el && x.contains(el) && !x.classList.contains("matched")
      );
    });
  };

  const up = (ev) => {
    card.classList.remove("dragging");
    document.querySelectorAll(".target").forEach((x) => x.classList.remove("target"));
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    try {
      card.releasePointerCapture(ev.pointerId);
    } catch (err) {}

    if (!dragged) return;

    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    const target = el && el.closest ? el.closest(".match-card") : null;
    if (target && target !== card && !target.classList.contains("matched")) {
      attempt(card, target);
    }
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

function attempt(a, b) {
  if (!a || !b || a.dataset.type === b.dataset.type) return;
  if (a.classList.contains("matched") || b.classList.contains("matched")) return;

  state.attempts++;

  const verb = a.dataset.type === "verb" ? a.dataset.word : b.dataset.word;
  const item = a.dataset.type === "item" ? a.dataset.word : b.dataset.word;
  const verbCard = a.dataset.type === "verb" ? a : b;
  const itemCard = a.dataset.type === "item" ? a : b;

  const pairIndex = state.remaining.findIndex((p) => p.verb === verb && p.item === item);
  const correct = pairIndex !== -1;

  if (!correct) {
    state.combo = 0;
    a.classList.add("wrong");
    b.classList.add("wrong");
    statusEl.textContent = "Try again: " + verb + " + " + item + ".";
    setTimeout(() => {
      a.classList.remove("wrong");
      b.classList.remove("wrong");
    }, 400);
    clearSelection();
    update();
    return;
  }

  state.remaining.splice(pairIndex, 1);
  state.correct++;
  state.combo++;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.score += 15 + Math.max(0, state.combo - 1) * 3;

  // Only lock the ITEM — verbs stay reusable
  itemCard.classList.add("matched");
  itemCard.disabled = true;
  itemCard.setAttribute("aria-disabled", "true");

  verbCard.classList.remove("selected");
  verbCard.classList.add("verb-flash");
  setTimeout(() => verbCard.classList.remove("verb-flash"), 350);

  clearSelection();
  statusEl.textContent = "Correct! " + verb + " + " + item + ".";
  update();

  if (state.remaining.length === 0) finish(true);
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
  timeEl.textContent =
    String(Math.floor(state.time / 60)).padStart(2, "0") +
    ":" +
    String(state.time % 60).padStart(2, "0");
  progressEl.textContent = state.correct;
  fillEl.style.width = (state.correct / PAIRS.length) * 100 + "%";
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
    ? "You matched all 25 combinations."
    : "Play again and try to beat your score.";
  document.getElementById("resultIcon").textContent = won ? "🏆" : "⏱️";
  document.getElementById("endModal").classList.remove("hidden");

  try { if(window.LAStars){var acc=state&&state.attempts?Math.round(state.correct/state.attempts*100):(typeof accuracy!=="undefined"?accuracy:0);LAStars.recordPlay("starter-1a-food-verb-match");LAStars.saveFromAccuracy("starter-1a-food-verb-match",acc);} } catch (e) {}
}

document.getElementById("playAgain").addEventListener("click", reset);
reset();
