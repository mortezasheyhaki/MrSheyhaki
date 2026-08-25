/* Daily Routines · Sentence Builder — fixed clicks + smooth UI */
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
  const promptText = document.getElementById("promptText");
  const promptHint = document.getElementById("promptHint");
  const feedbackEl = document.getElementById("feedback");
  const scoreEl = document.getElementById("score");
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
  let locked = false;
  /** @type {Map<string, HTMLButtonElement>} */
  let chipMap = new Map();
  /** @type {string[]} order of uids in answer */
  let builtUids = [];
  let dragUid = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function buildQueue() {
    const pool = STATEMENTS.concat(QUESTIONS);
    return shuffle(pool).slice(0, TOTAL);
  }

  function showScreen(name) {
    if (homeScreen) homeScreen.classList.toggle("hidden", name !== "home");
    if (gameScreen) gameScreen.classList.toggle("hidden", name !== "game");
    if (resultScreen) resultScreen.classList.toggle("hidden", name !== "result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function current() {
    return queue[index];
  }

  function updateProgress() {
    if (progressFill) {
      const pct = Math.min(100, Math.round((index / TOTAL) * 100));
      progressFill.style.width = pct + "%";
    }
  }

  function loadItem() {
    locked = false;
    builtUids = [];
    dragUid = null;
    chipMap.clear();
    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
    }
    if (answerSlots) {
      answerSlots.innerHTML = "";
      answerSlots.classList.remove("correct", "wrong");
    }
    if (wordBank) wordBank.innerHTML = "";

    const item = current();
    if (!item) return;

    if (promptText) promptText.textContent = item.prompt;
    if (promptHint) {
      promptHint.textContent = item.answer[0] && item.answer[0].match(/^(Do|Does)/)
        ? "Build the question"
        : "Put the words in order";
    }

    const words = shuffle(item.words.map(function (w, i) {
      return { word: w, uid: "w" + i + "-" + Math.random().toString(36).slice(2, 7) };
    }));

    words.forEach(function (entry) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "word-chip";
      btn.textContent = entry.word;
      btn.dataset.uid = entry.uid;
      btn.dataset.word = entry.word;
      btn.draggable = true;

      btn.addEventListener("click", function () {
        if (locked) return;
        if (btn.classList.contains("in-answer")) {
          // return to bank
          returnToBank(entry.uid);
        } else {
          moveToAnswer(entry.uid);
        }
      });

      btn.addEventListener("dragstart", function (e) {
        if (locked) {
          e.preventDefault();
          return;
        }
        dragUid = entry.uid;
        btn.classList.add("dragging");
        try {
          e.dataTransfer.setData("text/plain", entry.uid);
          e.dataTransfer.effectAllowed = "move";
        } catch (_) {}
      });

      btn.addEventListener("dragend", function () {
        btn.classList.remove("dragging");
        dragUid = null;
        if (answerSlots) answerSlots.classList.remove("drag-over");
        if (wordBank) wordBank.classList.remove("drag-over");
      });

      chipMap.set(entry.uid, btn);
      wordBank.appendChild(btn);
      // entrance animation
      requestAnimationFrame(function () {
        btn.classList.add("chip-in");
      });
    });

    updateProgress();
  }

  function moveToAnswer(uid) {
    if (locked) return;
    const btn = chipMap.get(uid);
    if (!btn || btn.classList.contains("in-answer")) return;

    btn.classList.add("in-answer", "chip-pop");
    answerSlots.appendChild(btn);
    builtUids.push(uid);

    setTimeout(function () {
      btn.classList.remove("chip-pop");
    }, 220);

    // all words placed?
    if (builtUids.length === chipMap.size) {
      setTimeout(checkAnswer, 200);
    }
  }

  function returnToBank(uid) {
    if (locked) return;
    const btn = chipMap.get(uid);
    if (!btn) return;

    const idx = builtUids.indexOf(uid);
    if (idx >= 0) builtUids.splice(idx, 1);

    btn.classList.remove("in-answer");
    btn.classList.add("chip-pop");
    wordBank.appendChild(btn);

    setTimeout(function () {
      btn.classList.remove("chip-pop");
    }, 220);

    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
    }
    if (answerSlots) answerSlots.classList.remove("correct", "wrong");
  }

  function clearAnswer() {
    if (locked) return;
    const uids = builtUids.slice();
    uids.forEach(returnToBank);
  }

  function normalize(arr) {
    return arr.map(function (w) {
      return String(w).replace(/[?.!,]/g, "").toLowerCase();
    });
  }

  function isCorrect(user, answer) {
    const u = normalize(user);
    const a = normalize(answer);
    if (u.length !== a.length) return false;
    return u.every(function (w, i) {
      return w === a[i];
    });
  }

  function checkAnswer() {
    if (locked || !builtUids.length) return;
    locked = true;

    const item = current();
    const user = builtUids.map(function (uid) {
      const btn = chipMap.get(uid);
      return btn ? btn.dataset.word : "";
    });
    const success = isCorrect(user, item.answer);

    if (success) {
      score += 10;
      correctCount += 1;
      if (scoreEl) scoreEl.textContent = String(score);
      if (feedbackEl) {
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "feedback ok";
      }
      if (answerSlots) answerSlots.classList.add("correct");
      builtUids.forEach(function (uid) {
        const btn = chipMap.get(uid);
        if (btn) btn.classList.add("chip-correct");
      });
    } else {
      wrongCount += 1;
      if (feedbackEl) {
        feedbackEl.textContent = "Not quite — " + item.answer.join(" ");
        feedbackEl.className = "feedback bad";
      }
      if (answerSlots) answerSlots.classList.add("wrong");
      builtUids.forEach(function (uid) {
        const btn = chipMap.get(uid);
        if (btn) btn.classList.add("chip-wrong");
      });
    }

    setTimeout(function () {
      index += 1;
      if (index >= TOTAL) endGame();
      else loadItem();
    }, success ? 900 : 1600);
  }

  function startGame() {
    queue = buildQueue();
    index = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    if (scoreEl) scoreEl.textContent = "0";
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
  
  try { if(window.LAStars){LAStars.recordPlay("daily-routines");LAStars.save("daily-routines", typeof score!=="undefined"&&score>=8?3:typeof score!=="undefined"&&score>=5?2:1);} } catch (e) {}
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
      moveToAnswer(uid);
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
      returnToBank(uid);
    });
  }

  if (startBtn) startBtn.addEventListener("click", startGame);
  if (playAgainBtn) playAgainBtn.addEventListener("click", startGame);
  if (clearBtn) clearBtn.addEventListener("click", clearAnswer);

  setupDropZones();
  showScreen("home");
})();
