/* =========================================================
   POSSESSIVES MATCH
   5 left + 5 right · Auto-advance to next 5 (no "Round 2")
========================================================= */
(function () {
  "use strict";

  const ALL_PAIRS = {
    adjectives: [
      { id: "i",     left: "I",     right: "my" },
      { id: "you",   left: "you",   right: "your" },
      { id: "he",    left: "he",    right: "his" },
      { id: "she",   left: "she",   right: "her" },
      { id: "it",    left: "it",    right: "its" },
      { id: "we",    left: "we",    right: "our" },
      { id: "they",  left: "they",  right: "their" }
    ],
    make: [
      { id: "tom",      left: "Tom + cat",            right: "Tom's cat" },
      { id: "sarah",    left: "Sarah + pencil",       right: "Sarah's pencil" },
      { id: "boy",      left: "the boy + class",      right: "the boy's class" },
      { id: "girls",    left: "the girls + room",     right: "the girls' room" },
      { id: "brother",  left: "my brother + car",     right: "my brother's car" },
      { id: "sister",   left: "my sister + bag",      right: "my sister's bag" },
      { id: "cat",      left: "that cat + name",      right: "the cat's name" },
      { id: "teacher",  left: "the teacher + laptop", right: "the teacher's laptop" },
      { id: "friends",  left: "my friends + address", right: "my friends' address" },
      { id: "friend",   left: "my friend + phone",    right: "my friend's phone" }
    ],
    replace: [
      { id: "tom",      left: "Tom's cat",                    right: "his cat" },
      { id: "parents",  left: "my parents' house",            right: "their house" },
      { id: "wife",     left: "my wife's bag",                right: "her bag" },
      { id: "hotel",    left: "the hotel's restaurant",       right: "its restaurant" },
      { id: "husband",  left: "me and my husband's children", right: "our children" },
      { id: "sarah",    left: "Sarah's pencil",               right: "her pencil" },
      { id: "boy",      left: "the boy's class",              right: "his class" },
      { id: "girls",    left: "the girls' room",              right: "their room" },
      { id: "brother",  left: "my brother's car",             right: "his car" },
      { id: "cat",      left: "the cat's name",               right: "its name" }
    ]
  };

  const MODE_META = {
    adjectives: {
      title: "Pronoun ↔ Adjective",
      prompt: "Match the pronoun with its adjective",
      chunkSize: 7          // all at once
    },
    make: {
      title: "Make possessive 's",
      prompt: "Match owner + thing with the correct 's form",
      chunkSize: 5
    },
    replace: {
      title: "Replace with his / her / its / their / our",
      prompt: "Match the 's phrase with the pronoun form",
      chunkSize: 5
    }
  };

  /* DOM */
  const startScreen   = document.getElementById("startScreen");
  const gameScreen    = document.getElementById("gameScreen");
  const endScreen     = document.getElementById("endScreen");
  const startBtn      = document.getElementById("startBtn");
  const playAgainBtn  = document.getElementById("playAgainBtn");
  const changeModeBtn = document.getElementById("changeModeBtn");
  const matchBoard    = document.getElementById("matchBoard");
  const matchedText   = document.getElementById("matchedText");
  const scoreText     = document.getElementById("scoreText");
  const movesText     = document.getElementById("movesText");
  const feedback      = document.getElementById("feedback");
  const promptText    = document.getElementById("promptText");
  const headerTitle   = document.getElementById("headerTitle");
  const endTitle      = document.getElementById("endTitle");
  const endSummary    = document.getElementById("endSummary");
  const finalScore    = document.getElementById("finalScore");
  const finalMoves    = document.getElementById("finalMoves");
  const finalAccuracy = document.getElementById("finalAccuracy");
  const modeTabs      = document.getElementById("modeTabs");
  const previewAdj    = document.getElementById("previewAdjectives");
  const previewMake   = document.getElementById("previewMake");
  const previewReplace= document.getElementById("previewReplace");

  /* State */
  let currentMode = "adjectives";
  let allPairs = [];
  let chunkPairs = [];
  let chunkIndex = 0;       // which set of 5 we are on
  let selected = null;
  let matchedInChunk = 0;
  let totalMatched = 0;
  let score = 0;
  let moves = 0;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showScreen(which) {
    startScreen.hidden = which !== "start";
    gameScreen.hidden  = which !== "game";
    endScreen.hidden   = which !== "end";
  }

  function updateStats() {
    const total = allPairs.length;
    matchedText.textContent = totalMatched + " / " + total;
    scoreText.textContent = score;
    movesText.textContent = moves;
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  function setFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = "feedback " + (type || "");
  }

  function setMode(mode) {
    currentMode = mode;
    modeTabs.querySelectorAll(".mode-tab").forEach(tab => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    previewAdj.hidden     = mode !== "adjectives";
    previewMake.hidden    = mode !== "make";
    previewReplace.hidden = mode !== "replace";
    headerTitle.textContent = "Choose a mode";
  }

  function createCard(text, id, side) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "match-card";
    btn.textContent = text;
    btn.dataset.id = id;
    btn.dataset.side = side;
    btn.setAttribute("aria-label", text);
    btn.addEventListener("click", onCardClick);
    return btn;
  }

  function loadChunk() {
    const size = MODE_META[currentMode].chunkSize;
    const start = chunkIndex * size;
    chunkPairs = allPairs.slice(start, start + size);
    matchedInChunk = 0;
    selected = null;
    locked = false;
    clearFeedback();
    buildBoard();
    updateStats();
  }

  function buildBoard() {
    matchBoard.innerHTML = "";

    // Left: neat fixed order of current chunk
    // Right: shuffled
    const rightOrder = shuffle(chunkPairs);

    for (let i = 0; i < chunkPairs.length; i++) {
      matchBoard.appendChild(createCard(chunkPairs[i].left, chunkPairs[i].id, "left"));
      matchBoard.appendChild(createCard(rightOrder[i].right, rightOrder[i].id, "right"));
    }
  }

  function onCardClick(e) {
    if (locked) return;
    const el = e.currentTarget;
    if (el.classList.contains("matched") || el.classList.contains("selected")) return;

    const side = el.dataset.side;
    const id   = el.dataset.id;

    if (!selected) {
      selected = { side, id, el };
      el.classList.add("selected");
      clearFeedback();
      return;
    }

    if (selected.side === side) {
      selected.el.classList.remove("selected");
      selected = { side, id, el };
      el.classList.add("selected");
      return;
    }

    moves++;
    updateStats();

    if (selected.id === id) {
      locked = true;
      el.classList.add("selected");
      selected.el.classList.add("matched");
      el.classList.add("matched");
      selected.el.classList.remove("selected");
      el.classList.remove("selected");

      matchedInChunk++;
      totalMatched++;
      score += 100;
      updateStats();
      setFeedback("✓ Correct!", "correct");
      if (navigator.vibrate) navigator.vibrate(22);

      selected = null;

      setTimeout(() => {
        locked = false;
        clearFeedback();

        if (matchedInChunk >= chunkPairs.length) {
          // Finished this set of 5
          const size = MODE_META[currentMode].chunkSize;
          const nextStart = (chunkIndex + 1) * size;

          if (nextStart < allPairs.length) {
            // Silently load next 5 — no "Round 2" message
            chunkIndex++;
            // Brief fade feel
            matchBoard.style.opacity = "0.35";
            setTimeout(() => {
              loadChunk();
              matchBoard.style.opacity = "1";
            }, 280);
          } else {
            finishGame();
          }
        }
      }, 360);
    } else {
      locked = true;
      el.classList.add("selected");
      selected.el.classList.add("wrong");
      el.classList.add("wrong");
      score = Math.max(0, score - 15);
      updateStats();
      setFeedback("✗ Try again", "wrong");
      if (navigator.vibrate) navigator.vibrate([28, 18, 28]);

      const prev = selected.el;
      selected = null;

      setTimeout(() => {
        prev.classList.remove("selected", "wrong");
        el.classList.remove("selected", "wrong");
        locked = false;
        clearFeedback();
      }, 460);
    }
  }

  function finishGame() {
    const accuracy = Math.round((allPairs.length / Math.max(moves, 1)) * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    finalScore.textContent = score;
    finalMoves.textContent = moves;
    finalAccuracy.textContent = accuracy + "%";

    if (accuracy === 100) {
      endTitle.textContent = "Perfect!";
      endSummary.textContent = "You matched every pair with no mistakes.";
    } else if (accuracy >= 80) {
      endTitle.textContent = "Great job!";
      endSummary.textContent = "Solid work with possessives.";
    } else {
      endTitle.textContent = "Good effort!";
      endSummary.textContent = "A bit more practice and you'll master it.";
    }

    document.querySelectorAll(".end-stars .star").forEach(star => {
      const n = parseInt(star.dataset.n, 10);
      star.classList.toggle("filled", n <= stars);
      star.textContent = n <= stars ? "★" : "☆";
    });

    try {
      if (window.LAStars && typeof window.LAStars.set === "function") {
        window.LAStars.set("grammar-possessives-match", stars);
      }
    } catch (e) {}

    showScreen("end");
  }

  function startGame() {
    allPairs = ALL_PAIRS[currentMode].slice();
    chunkIndex = 0;
    totalMatched = 0;
    score = 0;
    moves = 0;
    selected = null;
    locked = false;
    clearFeedback();
    promptText.textContent = MODE_META[currentMode].prompt;
    headerTitle.textContent = MODE_META[currentMode].title;
    loadChunk();
    showScreen("game");
  }

  /* Events */
  modeTabs.addEventListener("click", e => {
    const tab = e.target.closest(".mode-tab");
    if (tab) setMode(tab.dataset.mode);
  });

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  changeModeBtn.addEventListener("click", () => {
    showScreen("start");
    headerTitle.textContent = "Choose a mode";
  });

  // Smooth opacity transition for board swap
  if (matchBoard) {
    matchBoard.style.transition = "opacity 0.25s ease";
  }

  setMode("adjectives");
})();
