/* =====================================================
   Daily Routines · Sentence Builder
   Statements (with always / usually / sometimes / never)
   + Questions. No don't / doesn't forms.
   Click or drag words. Auto-advance on correct.
===================================================== */

(function () {
  "use strict";

  const TOTAL = 10;

  /** Statements use never as an adverb (not don't/doesn't). */
  const STATEMENTS = [
    {
      prompt: "Talk about mornings.",
      words: ["I", "always", "get", "up", "early"],
      answer: ["I", "always", "get", "up", "early"],
    },
    {
      prompt: "Talk about breakfast.",
      words: ["She", "usually", "has", "breakfast", "at", "7"],
      answer: ["She", "usually", "has", "breakfast", "at", "7"],
    },
    {
      prompt: "Talk about coffee.",
      words: ["They", "sometimes", "have", "a", "coffee"],
      answer: ["They", "sometimes", "have", "a", "coffee"],
    },
    {
      prompt: "Talk about the gym.",
      words: ["He", "never", "goes", "to", "the", "gym"],
      answer: ["He", "never", "goes", "to", "the", "gym"],
    },
    {
      prompt: "Talk about TV in the evening.",
      words: ["We", "usually", "watch", "TV", "after", "dinner"],
      answer: ["We", "usually", "watch", "TV", "after", "dinner"],
    },
    {
      prompt: "Talk about work.",
      words: ["I", "always", "go", "to", "work", "by", "bus"],
      answer: ["I", "always", "go", "to", "work", "by", "bus"],
    },
    {
      prompt: "Talk about shopping.",
      words: ["She", "sometimes", "goes", "shopping", "on", "Friday"],
      answer: ["She", "sometimes", "goes", "shopping", "on", "Friday"],
    },
    {
      prompt: "Talk about housework.",
      words: ["He", "never", "does", "housework"],
      answer: ["He", "never", "does", "housework"],
    },
  ];

  const QUESTIONS = [
    {
      prompt: "Ask about mornings.",
      words: ["Do", "you", "always", "get", "up", "early?"],
      answer: ["Do", "you", "always", "get", "up", "early?"],
    },
    {
      prompt: "Ask about breakfast.",
      words: ["Does", "she", "usually", "have", "breakfast?"],
      answer: ["Does", "she", "usually", "have", "breakfast?"],
    },
    {
      prompt: "Ask about the gym.",
      words: ["Do", "they", "sometimes", "go", "to", "the", "gym?"],
      answer: ["Do", "they", "sometimes", "go", "to", "the", "gym?"],
    },
    {
      prompt: "Ask about TV.",
      words: ["Does", "he", "sometimes", "watch", "TV?"],
      answer: ["Does", "he", "sometimes", "watch", "TV?"],
    },
    {
      prompt: "Ask about housework.",
      words: ["Do", "you", "usually", "do", "housework?"],
      answer: ["Do", "you", "usually", "do", "housework?"],
    },
    {
      prompt: "Ask about dinner.",
      words: ["Does", "she", "always", "make", "dinner?"],
      answer: ["Does", "she", "always", "make", "dinner?"],
    },
    {
      prompt: "Ask about shopping.",
      words: ["Do", "they", "sometimes", "go", "shopping?"],
      answer: ["Do", "they", "sometimes", "go", "shopping?"],
    },
    {
      prompt: "Ask about bed time.",
      words: ["Do", "you", "usually", "go", "to", "bed", "early?"],
      answer: ["Do", "you", "usually", "go", "to", "bed", "early?"],
    },
  ];

  // DOM
  const homeScreen = document.getElementById("homeScreen");
  const gameScreen = document.getElementById("gameScreen");
  const resultScreen = document.getElementById("resultScreen");
  const startBtn = document.getElementById("startBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const checkBtn = document.getElementById("checkBtn");
  const clearBtn = document.getElementById("clearBtn");
  const skipBtn = document.getElementById("skipBtn");
  const themeToggle = document.getElementById("themeToggle");
  const wordBank = document.getElementById("wordBank");
  const answerSlots = document.getElementById("answerSlots");
  const feedbackEl = document.getElementById("feedback");
  const scoreEl = document.getElementById("score");
  const progressEl = document.getElementById("progress");
  const promptHint = document.getElementById("promptHint");
  const promptText = document.getElementById("promptText");
  const progressFill = document.getElementById("progressFill");
  const finalScore = document.getElementById("finalScore");
  const finalCorrect = document.getElementById("finalCorrect");
  const finalWrong = document.getElementById("finalWrong");
  const finalAccuracy = document.getElementById("finalAccuracy");
  const reviewBox = document.getElementById("reviewBox");
  const reviewList = document.getElementById("reviewList");

  // State
  let queue = [];
  let index = 0;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let built = []; // { word, uid }
  let bankState = []; // { word, used, uid }
  let locked = false;
  let review = [];
  let dragUid = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildQueue() {
    const statements = shuffle(STATEMENTS).slice(0, 5);
    const questions = shuffle(QUESTIONS).slice(0, 5);
    queue = shuffle(statements.concat(questions));
  }

  function showScreen(name) {
    homeScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
        if (name === "home") homeScreen.classList.remove("hidden");
    if (name === "game") {
      gameScreen.classList.remove("hidden");
          }
    if (name === "result") {
      resultScreen.classList.remove("hidden");
      if (progressFill) progressFill.style.width = "100%";
    }
  }

  function current() {
    return queue[index];
  }

  function loadItem() {
    locked = false;
    built = [];
    dragUid = null;
    const item = current();
    const words = shuffle(item.words.slice());
    bankState = words.map((w, i) => ({
      word: w,
      used: false,
      uid: i + "-" + w,
    }));

    promptHint.textContent = "Put the words in the correct order.";
    promptText.textContent = item.prompt;
    progressEl.textContent = index + 1 + " / " + TOTAL;
    scoreEl.textContent = String(score);
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    checkBtn.disabled = true;

    renderBank();
    renderAnswer();
  }

  function renderBank() {
    wordBank.innerHTML = "";
    wordBank.classList.remove("mk-stagger-fast");
    void wordBank.offsetWidth;
    wordBank.classList.add("mk-stagger-fast");
    bankState.forEach((entry) => {
      if (entry.used) return;
      wordBank.appendChild(makeChip(entry, "bank"));
    });
  }

  function renderAnswer() {
    answerSlots.innerHTML = "";
    built.forEach((entry, i) => {
      answerSlots.appendChild(makeChip(entry, "answer", i));
    });
    checkBtn.disabled = locked || built.length === 0;
  }

  function makeChip(entry, place, answerIndex) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "word-chip";
    btn.textContent = entry.word;
    btn.dataset.uid = entry.uid;
    btn.draggable = !locked;
    btn.disabled = locked;

    // Click: bank → answer, or answer → bank
    btn.addEventListener("click", () => {
      if (locked) return;
      if (place === "bank") addWord(entry.uid);
      else removeWord(answerIndex);
    });

    // Drag
    btn.addEventListener("dragstart", (e) => {
      if (locked) {
        e.preventDefault();
        return;
      }
      dragUid = entry.uid;
      btn.classList.add("dragging");
      e.dataTransfer.setData("text/plain", entry.uid);
      e.dataTransfer.effectAllowed = "move";
    });
    btn.addEventListener("dragend", () => {
      btn.classList.remove("dragging");
      dragUid = null;
      answerSlots.classList.remove("drag-over");
      wordBank.classList.remove("drag-over");
    });

    return btn;
  }

  function addWord(uid) {
    if (locked) return;
    const entry = bankState.find((e) => e.uid === uid);
    if (!entry || entry.used) return;
    entry.used = true;
    built.push({ word: entry.word, uid: entry.uid });
    renderBank();
    renderAnswer();
    // When every word is placed, check automatically
    if (bankState.every((e) => e.used)) {
      setTimeout(checkAnswer, 200);
    }
  }

  function removeWord(i) {
    if (locked) return;
    if (i < 0 || i >= built.length) return;
    const entry = built.splice(i, 1)[0];
    const bankEntry = bankState.find((e) => e.uid === entry.uid);
    if (bankEntry) bankEntry.used = false;
    renderBank();
    renderAnswer();
  }

  function clearAnswer() {
    if (locked) return;
    built = [];
    bankState.forEach((e) => (e.used = false));
    renderBank();
    renderAnswer();
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
  }

  function normalize(arr) {
    return arr.map((w) => w.replace(/[?.!,]/g, "").toLowerCase());
  }

  function isCorrect(user, answer) {
    if (user.length !== answer.length) {
      // allow missing trailing ?
      const a = answer.map((w) => w.replace("?", ""));
      const u = user.map((w) => w.replace("?", ""));
      if (u.length !== a.length) return false;
      return normalize(u).every((w, i) => w === normalize(a)[i]);
    }
    return normalize(user).every((w, i) => w === normalize(answer)[i]);
  }

  function checkAnswer() {
    if (locked || !built.length) return;
    locked = true;
    checkBtn.disabled = true;

    const item = current();
    const user = built.map((b) => b.word);
    const success = isCorrect(user, item.answer);

    if (success) {
      score += 10;
      correctCount += 1;
      feedbackEl.textContent = "Correct!";
      feedbackEl.className = "feedback ok";
      scoreEl.textContent = String(score);
      // Auto-advance quickly
      setTimeout(() => {
        index += 1;
        if (index >= TOTAL) endGame();
        else loadItem();
      }, 650);
    } else {
      wrongCount += 1;
      feedbackEl.textContent = "Not quite. → " + item.answer.join(" ");
      feedbackEl.className = "feedback bad";
      review.push({
        prompt: item.prompt,
        yours: user.join(" "),
        correct: item.answer.join(" "),
      });
      // Stay briefly so they can read the answer, then next
      setTimeout(() => {
        index += 1;
        if (index >= TOTAL) endGame();
        else loadItem();
      }, 1600);
    }
  }

  function skipItem() {
    if (locked) return;
    locked = true;
    const item = current();
    wrongCount += 1;
    review.push({
      prompt: item.prompt,
      yours: "(skipped)",
      correct: item.answer.join(" "),
    });
    feedbackEl.textContent = "→ " + item.answer.join(" ");
    feedbackEl.className = "feedback bad";
    setTimeout(() => {
      index += 1;
      if (index >= TOTAL) endGame();
      else loadItem();
    }, 900);
  }

  function startGame() {
    buildQueue();
    index = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    review = [];
    showScreen("game");
    loadItem();
  }

  function endGame() {
    const accuracy = TOTAL ? Math.round((correctCount / TOTAL) * 100) : 0;
    finalScore.textContent = String(score);
    finalCorrect.textContent = String(correctCount);
    finalWrong.textContent = String(wrongCount);
    finalAccuracy.textContent = accuracy + "%";

    if (review.length) {
      reviewBox.classList.remove("hidden");
      reviewList.innerHTML = review
        .map(
          (r) =>
            "<li><em>" +
            r.prompt +
            "</em><br>You: " +
            r.yours +
            "<br><strong>" +
            r.correct +
            "</strong></li>"
        )
        .join("");
    } else {
      reviewBox.classList.add("hidden");
      reviewList.innerHTML = "";
    }

    showScreen("result");
  }

  // --- Drop zones ---
  function setupDropZones() {
    answerSlots.addEventListener("dragover", (e) => {
      e.preventDefault();
      answerSlots.classList.add("drag-over");
    });
    answerSlots.addEventListener("dragleave", () => {
      answerSlots.classList.remove("drag-over");
    });
    answerSlots.addEventListener("drop", (e) => {
      e.preventDefault();
      answerSlots.classList.remove("drag-over");
      const uid = e.dataTransfer.getData("text/plain") || dragUid;
      if (!uid || locked) return;
      // If already in answer, ignore (or could reorder later)
      if (built.some((b) => b.uid === uid)) return;
      addWord(uid);
    });

    wordBank.addEventListener("dragover", (e) => {
      e.preventDefault();
      wordBank.classList.add("drag-over");
    });
    wordBank.addEventListener("dragleave", () => {
      wordBank.classList.remove("drag-over");
    });
    wordBank.addEventListener("drop", (e) => {
      e.preventDefault();
      wordBank.classList.remove("drag-over");
      const uid = e.dataTransfer.getData("text/plain") || dragUid;
      if (!uid || locked) return;
      const idx = built.findIndex((b) => b.uid === uid);
      if (idx >= 0) removeWord(idx);
    });
  }

  // Theme
  function syncSiteTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.body.classList.toggle("light-mode", !dark);
  }
  syncSiteTheme();
  window.addEventListener("site-theme-change", syncSiteTheme);
  try {
    new MutationObserver(syncSiteTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  } catch (_) {}

  showScreen("home");
})();
