/* Present Continuous − — fully split: I · am · not · working */
(function () {
  "use strict";

  const GAME_ID = "starter-9a-continuous-negative";
  function saveStars() {
    try {
      if (!window.LAStars || !order || !order.length) return;
      var acc = Math.round((score / order.length) * 100);
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, acc);
    } catch (_) {}
  }


  const ITEMS = [
    {
      prompt: "I / work",
      words: ["I", "am", "not", "working"],
      sentence: "I am not working",
      alts: ["i'm not working", "im not working"],
      audio: "../audio/I'm not working.mp3",
    },
    {
      prompt: "You / sit / in my chair",
      words: ["You", "are", "not", "sitting", "in", "my", "chair"],
      sentence: "You are not sitting in my chair",
      alts: ["you aren't sitting in my chair", "youre not sitting in my chair", "you aren't sitting in my chair"],
      audio: "../audio/You aren't sitting in my chair.mp3",
    },
    {
      prompt: "He / play soccer",
      words: ["He", "is", "not", "playing", "soccer"],
      sentence: "He is not playing soccer",
      alts: ["he isn't playing soccer", "hes not playing soccer"],
      audio: "../audio/He isn't playing soccer.mp3",
    },
    {
      prompt: "She / take a shower",
      words: ["She", "is", "not", "taking", "a", "shower"],
      sentence: "She is not taking a shower",
      alts: ["she isn't taking a shower", "shes not taking a shower"],
      audio: "../audio/She isn't taking a shower.mp3",
    },
    {
      prompt: "It / rain",
      words: ["It", "is", "not", "raining"],
      sentence: "It is not raining",
      alts: ["it isn't raining", "its not raining"],
      audio: "../audio/It isn't raining.mp3",
    },
    {
      prompt: "We / have dinner",
      words: ["We", "are", "not", "having", "dinner"],
      sentence: "We are not having dinner",
      alts: ["we aren't having dinner", "were not having dinner"],
      audio: "../audio/We aren't having dinner.mp3",
    },
    {
      prompt: "They / listen / to the teacher",
      words: ["They", "are", "not", "listening", "to", "the", "teacher"],
      sentence: "They are not listening to the teacher",
      alts: ["they aren't listening to the teacher", "theyre not listening to the teacher"],
      audio: "../audio/They aren't listening to the teacher.mp3",
    },
  ];

  let mode = "chips";
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let tray = [];
  let bankWords = [];

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endOverlay = $("endOverlay");
  const modeLabel = $("modeLabel");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const leftText = $("leftText");
  const promptText = $("promptText");
  const chipsPanel = $("chipsPanel");
  const writePanel = $("writePanel");
  const answerSlots = $("answerSlots");
  const chipBank = $("chipBank");
  const chipsFeedback = $("chipsFeedback");
  const clearChipsBtn = $("clearChipsBtn");
  const checkChipsBtn = $("checkChipsBtn");
  const chipsActions = $("chipsActions");
  const chipsNextRow = $("chipsNextRow");
  const listenBtn = $("listenBtn");
  const nextChipsBtn = $("nextChipsBtn");
  const answerInput = $("answerInput");
  const writeFeedback = $("writeFeedback");
  const checkWriteBtn = $("checkWriteBtn");
  const writeActions = $("writeActions");
  const writeNextRow = $("writeNextRow");
  const listenWriteBtn = $("listenWriteBtn");
  const nextWriteBtn = $("nextWriteBtn");

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.?!]+/g, "")
      .replace(/,/g, "")
      .replace(/\bi'm\b/g, "i am")
      .replace(/\byou're\b/g, "you are")
      .replace(/\bhe's\b/g, "he is")
      .replace(/\bshe's\b/g, "she is")
      .replace(/\bit's\b/g, "it is")
      .replace(/\bwe're\b/g, "we are")
      .replace(/\bthey're\b/g, "they are")
      .replace(/\bisn't\b/g, "is not")
      .replace(/\baren't\b/g, "are not")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(built, item) {
    const n = normalize(built);
    if (n === normalize(item.sentence)) return true;
    return (item.alts || []).some(function (a) {
      return normalize(a) === n;
    });
  }

  function playAudio(src) {
    if (!src) return;
    new Audio(src).play().catch(function () {});
  }

  function start(m) {
    mode = m;
    order = shuffle(ITEMS.map(function (_, i) {
      return i;
    }));
    index = 0;
    score = 0;
    locked = false;
    startScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    modeLabel.textContent = mode === "chips" ? "Word chips" : "Write it";
    chipsPanel.classList.toggle("hidden", mode !== "chips");
    writePanel.classList.toggle("hidden", mode !== "write");
    loadItem();
  }

  function loadItem() {
    locked = false;
    const item = ITEMS[order[index]];
    qProgress.textContent = index + 1 + "/" + order.length;
    scoreText.textContent = String(score);
    leftText.textContent = String(order.length - index);
    promptText.textContent = item.prompt;
    chipsFeedback.textContent = "";
    chipsFeedback.className = "feedback";
    writeFeedback.textContent = "";
    writeFeedback.className = "feedback";
    answerSlots.className = "tray";
    answerInput.className = "answer-input";
    answerInput.value = "";
    answerInput.disabled = false;
    chipsActions.classList.remove("hidden");
    chipsNextRow.classList.add("hidden");
    writeActions.classList.remove("hidden");
    writeNextRow.classList.add("hidden");
    checkChipsBtn.disabled = true;
    checkWriteBtn.disabled = true;
    if (mode === "chips") {
      tray = [];
      renderTray();
      renderBank(shuffle(item.words));
    } else {
      setTimeout(function () {
        answerInput.focus();
      }, 50);
    }
  }

  function renderTray() {
    answerSlots.innerHTML = "";
    if (!tray.length) {
      answerSlots.innerHTML = '<p class="tray-empty">Tap chips to build the sentence</p>';
      checkChipsBtn.disabled = true;
      return;
    }
    tray.forEach(function (t, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip used";
      b.textContent = t.word;
      b.addEventListener("click", function () {
        if (locked) return;
        tray.splice(i, 1);
        renderTray();
        renderBank(currentBankWords());
      });
      answerSlots.appendChild(b);
    });
    checkChipsBtn.disabled = tray.length === 0;
  }

  function currentBankWords() {
    const item = ITEMS[order[index]];
    const usedCount = {};
    tray.forEach(function (t) {
      usedCount[t.word] = (usedCount[t.word] || 0) + 1;
    });
    const remaining = [];
    const avail = {};
    item.words.forEach(function (w) {
      avail[w] = (avail[w] || 0) + 1;
    });
    Object.keys(avail).forEach(function (w) {
      const left = avail[w] - (usedCount[w] || 0);
      for (let i = 0; i < left; i++) remaining.push(w);
    });
    return shuffle(remaining);
  }

  function renderBank(words) {
    bankWords = words;
    chipBank.innerHTML = "";
    words.forEach(function (w, i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = w;
      b.addEventListener("click", function () {
        if (locked) return;
        tray.push({ word: w });
        bankWords.splice(i, 1);
        renderTray();
        renderBank(bankWords);
      });
      chipBank.appendChild(b);
    });
  }

  function checkChips() {
    if (locked) return;
    const item = ITEMS[order[index]];
    const built = tray
      .map(function (t) {
        return t.word;
      })
      .join(" ");
    if (isCorrect(built, item)) {
      locked = true;
      score++;
      scoreText.textContent = String(score);
      answerSlots.className = "tray ok";
      chipsFeedback.textContent = item.sentence + ".";
      chipsFeedback.className = "feedback ok";
      chipsActions.classList.add("hidden");
      chipsNextRow.classList.remove("hidden");
      playAudio(item.audio);
    } else {
      answerSlots.className = "tray bad shake";
      chipsFeedback.textContent = "Try again";
      chipsFeedback.className = "feedback bad";
      setTimeout(function () {
        answerSlots.classList.remove("shake");
      }, 300);
    }
  }

  function checkWrite() {
    if (locked) return;
    const item = ITEMS[order[index]];
    if (isCorrect(answerInput.value, item)) {
      locked = true;
      score++;
      scoreText.textContent = String(score);
      answerInput.className = "answer-input ok";
      answerInput.disabled = true;
      writeFeedback.textContent = item.sentence + ".";
      writeFeedback.className = "feedback ok";
      writeActions.classList.add("hidden");
      writeNextRow.classList.remove("hidden");
      playAudio(item.audio);
    } else {
      answerInput.className = "answer-input bad shake";
      writeFeedback.textContent = "Try again";
      writeFeedback.className = "feedback bad";
      setTimeout(function () {
        answerInput.classList.remove("shake");
      }, 300);
    }
  }

  function next() {
    if (index + 1 >= order.length) {
      endOverlay.classList.remove("hidden");
      $("endTitle").textContent = "Done!";
      $("endMsg").textContent = "You scored " + score + " of " + order.length;
      saveStars();
      return;
    }
    index++;
    loadItem();
  }

  document.querySelectorAll(".mode-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      start(btn.getAttribute("data-mode"));
    });
  });
  $("exitBtn").addEventListener("click", function () {
    gameScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
  clearChipsBtn.addEventListener("click", function () {
    if (locked) return;
    tray = [];
    renderTray();
    renderBank(shuffle(ITEMS[order[index]].words));
    chipsFeedback.textContent = "";
    answerSlots.className = "tray";
  });
  checkChipsBtn.addEventListener("click", checkChips);
  nextChipsBtn.addEventListener("click", next);
  listenBtn.addEventListener("click", function () {
    playAudio(ITEMS[order[index]].audio);
  });
  checkWriteBtn.addEventListener("click", checkWrite);
  nextWriteBtn.addEventListener("click", next);
  listenWriteBtn.addEventListener("click", function () {
    playAudio(ITEMS[order[index]].audio);
  });
  answerInput.addEventListener("input", function () {
    checkWriteBtn.disabled = !answerInput.value.trim();
    if (!locked) {
      answerInput.className = "answer-input";
      writeFeedback.textContent = "";
    }
  });
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      checkWrite();
    }
  });
  $("playAgainBtn").addEventListener("click", function () {
    start(mode);
  });
  $("homeBtn").addEventListener("click", function () {
    endOverlay.classList.add("hidden");
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
})();
