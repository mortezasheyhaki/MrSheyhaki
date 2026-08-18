/* Daily Routines · Sentence Builder */
(function () {
  "use strict";

  const TOTAL = 10;

  const STATEMENTS = [
    { prompt: "Talk about mornings.", words: ["I", "always", "get", "up", "early"], answer: ["I", "always", "get", "up", "early"] },
    { prompt: "Talk about breakfast.", words: ["She", "usually", "has", "breakfast", "at", "7"], answer: ["She", "usually", "has", "breakfast", "at", "7"] },
    { prompt: "Talk about coffee.", words: ["They", "sometimes", "have", "a", "coffee"], answer: ["They", "sometimes", "have", "a", "coffee"] },
    { prompt: "Talk about the gym.", words: ["He", "never", "goes", "to", "the", "gym"], answer: ["He", "never", "goes", "to", "the", "gym"] },
    { prompt: "Talk about TV in the evening.", words: ["We", "usually", "watch", "TV", "after", "dinner"], answer: ["We", "usually", "watch", "TV", "after", "dinner"] },
    { prompt: "Talk about work.", words: ["I", "always", "go", "to", "work", "by", "bus"], answer: ["I", "always", "go", "to", "work", "by", "bus"] },
    { prompt: "Talk about shopping.", words: ["She", "sometimes", "goes", "shopping", "on", "Friday"], answer: ["She", "sometimes", "goes", "shopping", "on", "Friday"] },
    { prompt: "Talk about housework.", words: ["He", "never", "does", "housework"], answer: ["He", "never", "does", "housework"] },
  ];

  const QUESTIONS = [
    { prompt: "Ask about mornings.", words: ["Do", "you", "always", "get", "up", "early?"], answer: ["Do", "you", "always", "get", "up", "early?"] },
    { prompt: "Ask about breakfast.", words: ["Does", "she", "usually", "have", "breakfast?"], answer: ["Does", "she", "usually", "have", "breakfast?"] },
    { prompt: "Ask about the gym.", words: ["Do", "they", "sometimes", "go", "to", "the", "gym?"], answer: ["Do", "they", "sometimes", "go", "to", "the", "gym?"] },
    { prompt: "Ask about TV.", words: ["Does", "he", "sometimes", "watch", "TV?"], answer: ["Does", "he", "sometimes", "watch", "TV?"] },
    { prompt: "Ask about housework.", words: ["Do", "you", "usually", "do", "housework?"], answer: ["Do", "you", "usually", "do", "housework?"] },
    { prompt: "Ask about dinner.", words: ["Does", "she", "always", "make", "dinner?"], answer: ["Does", "she", "always", "make", "dinner?"] },
    { prompt: "Ask about shopping.", words: ["Do", "they", "sometimes", "go", "shopping?"], answer: ["Do", "they", "sometimes", "go", "shopping?"] },
    { prompt: "Ask about bed time.", words: ["Do", "you", "usually", "go", "to", "bed", "early?"], answer: ["Do", "you", "usually", "go", "to", "bed", "early?"] },
  ];

  const homeScreen = document.getElementById("homeScreen");
  const gameScreen = document.getElementById("gameScreen");
  const resultScreen = document.getElementById("resultScreen");
  const startBtn = document.getElementById("startBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const clearBtn = document.getElementById("clearBtn");
  const wordBank = document.getElementById("wordBank");
  const answerSlots = document.getElementById("answerSlots");
  const feedbackEl = document.getElementById("feedback");
  const scoreEl = document.getElementById("score");
  const promptHint = document.getElementById("promptHint");
  const promptText = document.getElementById("promptText");
  const progressFill = document.getElementById("progressFill");
  const finalScore = document.getElementById("finalScore");
  const finalCorrect = document.getElementById("finalCorrect");
  const finalWrong = document.getElementById("finalWrong");
  const finalAccuracy = document.getElementById("finalAccuracy");

  let queue = [];
  let index = 0;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let built = [];
  let bankState = [];
  let locked = false;
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
    if (name === "game") gameScreen.classList.remove("hidden");
    if (name === "result") resultScreen.classList.remove("hidden");
    // Keep play area in view on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    bankState = words.map(function (w, i) {
      return { word: w, used: false, uid: i + "-" + w };
    });

    if (promptHint) promptHint.textContent = "Click or drag the words into order";
    if (promptText) promptText.textContent = item.prompt;
    if (scoreEl) scoreEl.textContent = String(score);
    if (progressFill) progressFill.style.width = Math.round((index / TOTAL) * 100) + "%";
    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
    }

    renderBank();
    renderAnswer();
  }

  function renderBank() {
    if (!wordBank) return;
    wordBank.innerHTML = "";
    wordBank.classList.remove("mk-stagger-fast");
    void wordBank.offsetWidth;
    wordBank.classList.add("mk-stagger-fast");

    bankState.forEach(function (entry) {
      if (entry.used) return;
      wordBank.appendChild(makeChip(entry, "bank"));
    });
  }

  function renderAnswer() {
    if (!answerSlots) return;
    answerSlots.innerHTML = "";
    built.forEach(function (entry, i) {
      answerSlots.appendChild(makeChip(entry, "answer", i));
    });
  }

  function makeChip(entry, place, answerIndex) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "word-chip";
    btn.textContent = entry.word;
    btn.dataset.uid = entry.uid;
    btn.draggable = !locked;
    btn.disabled = locked;

    btn.addEventListener("click", function () {
      if (locked) return;
      if (place === "bank") addWord(entry.uid);
      else removeWord(answerIndex);
    });

    btn.addEventListener("dragstart", function (e) {
      if (locked) {
        e.preventDefault();
        return;
      }
      dragUid = entry.uid;
      btn.classList.add("dragging");
      e.dataTransfer.setData("text/plain", entry.uid);
      e.dataTransfer.effectAllowed = "move";
    });
    btn.addEventListener("dragend", function () {
      btn.classList.remove("dragging");
      dragUid = null;
      if (answerSlots) answerSlots.classList.remove("drag-over");
      if (wordBank) wordBank.classList.remove("drag-over");
    });

    return btn;
  }

  function addWord(uid) {
    if (locked) return;
    const entry = bankState.find(function (e) {
      return e.uid === uid;
    });
    if (!entry || entry.used) return;
    entry.used = true;
    built.push({ word: entry.word, uid: entry.uid });
    renderBank();
    renderAnswer();
    if (bankState.every(function (e) {
      return e.used;
    })) {
      setTimeout(checkAnswer, 180);
    }
  }

  function removeWord(i) {
    if (locked) return;
    if (i < 0 || i >= built.length) return;
    const entry = built.splice(i, 1)[0];
    const bankEntry = bankState.find(function (e) {
      return e.uid === entry.uid;
    });
    if (bankEntry) bankEntry.used = false;
    renderBank();
    renderAnswer();
  }

  function clearAnswer() {
    if (locked) return;
    built = [];
    bankState.forEach(function (e) {
      e.used = false;
    });
    renderBank();
    renderAnswer();
    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
    }
  }

  function normalize(arr) {
    return arr.map(function (w) {
      return w.replace(/[?.!,]/g, "").toLowerCase();
    });
  }

  function isCorrect(user, answer) {
    if (user.length !== answer.length) {
      const a = answer.map(function (w) {
        return w.replace("?", "");
      });
      const u = user.map(function (w) {
        return w.replace("?", "");
      });
      if (u.length !== a.length) return false;
      return normalize(u).every(function (w, i) {
        return w === normalize(a)[i];
      });
    }
    return normalize(user).every(function (w, i) {
      return w === normalize(answer)[i];
    });
  }

  function checkAnswer() {
    if (locked || !built.length) return;
    locked = true;
    const item = current();
    const user = built.map(function (b) {
      return b.word;
    });
    const success = isCorrect(user, item.answer);

    if (success) {
      score += 10;
      correctCount += 1;
      if (feedbackEl) {
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "feedback ok";
      }
      if (scoreEl) scoreEl.textContent = String(score);
      setTimeout(function () {
        index += 1;
        if (index >= TOTAL) endGame();
        else loadItem();
      }, 650);
    } else {
      wrongCount += 1;
      if (feedbackEl) {
        feedbackEl.textContent = "Not quite. → " + item.answer.join(" ");
        feedbackEl.className = "feedback bad";
      }
      setTimeout(function () {
        index += 1;
        if (index >= TOTAL) endGame();
        else loadItem();
      }, 1400);
    }
  }

  function startGame() {
    buildQueue();
    index = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    showScreen("game");
    loadItem();
  }

  function endGame() {
    if (progressFill) progressFill.style.width = "100%";
    if (finalScore) finalScore.textContent = String(score);
    if (finalCorrect) finalCorrect.textContent = String(correctCount);
    if (finalWrong) finalWrong.textContent = String(wrongCount);
    if (finalAccuracy) {
      finalAccuracy.textContent =
        (TOTAL ? Math.round((correctCount / TOTAL) * 100) : 0) + "%";
    }
    showScreen("result");
  }

  function setupDropZones() {
    if (!answerSlots || !wordBank) return;

    answerSlots.addEventListener("dragover", function (e) {
      e.preventDefault();
      answerSlots.classList.add("drag-over");
    });
    answerSlots.addEventListener("dragleave", function () {
      answerSlots.classList.remove("drag-over");
    });
    answerSlots.addEventListener("drop", function (e) {
      e.preventDefault();
      answerSlots.classList.remove("drag-over");
      const uid = e.dataTransfer.getData("text/plain") || dragUid;
      if (!uid || locked) return;
      if (built.some(function (b) {
        return b.uid === uid;
      })) return;
      addWord(uid);
    });

    wordBank.addEventListener("dragover", function (e) {
      e.preventDefault();
      wordBank.classList.add("drag-over");
    });
    wordBank.addEventListener("dragleave", function () {
      wordBank.classList.remove("drag-over");
    });
    wordBank.addEventListener("drop", function (e) {
      e.preventDefault();
      wordBank.classList.remove("drag-over");
      const uid = e.dataTransfer.getData("text/plain") || dragUid;
      if (!uid || locked) return;
      const idx = built.findIndex(function (b) {
        return b.uid === uid;
      });
      if (idx >= 0) removeWord(idx);
    });
  }

  function syncSiteTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.body.classList.toggle("light-mode", !dark);
  }

  if (startBtn) startBtn.addEventListener("click", startGame);
  if (playAgainBtn) playAgainBtn.addEventListener("click", startGame);
  if (clearBtn) clearBtn.addEventListener("click", clearAnswer);

  setupDropZones();
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
