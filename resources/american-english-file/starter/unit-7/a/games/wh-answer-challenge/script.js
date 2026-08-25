(function () {
  "use strict";

  const ITEMS = [
    { words: ["What", "'s", "your", "favorite", "part", "of", "the", "weekend", "?"] },
    { words: ["Are", "you", "tired", "on", "Sunday", "evening", "?"] },
    { words: ["What", "do", "you", "usually", "do", "on", "Saturday", "?"] },
    { words: ["Do", "you", "do", "the", "same", "thing", "every", "weekend", "?"] },
    { words: ["What", "do", "you", "do", "on", "the", "weekend", "?"] },
    { words: ["How", "do", "you", "relax", "on", "the", "weekend", "?"] },
    { words: ["Do", "you", "go", "out", "on", "Friday", "or", "Saturday", "night", "?"] },
    { words: ["Where", "do", "you", "go", "shopping", "?"] },
    { words: ["Do", "you", "do", "housework", "on", "the", "weekend", "?"] },
    { words: ["What", "sports", "or", "exercise", "do", "you", "do", "?"] },
    { words: ["What", "sports", "do", "you", "watch", "on", "TV", "?"] },
    { words: ["What", "time", "do", "you", "get", "up", "on", "Friday", "?"] },
    { words: ["Where", "do", "you", "have", "lunch", "?"] },
    { words: ["What", "time", "do", "you", "go", "to", "bed", "?"] },
    { words: ["What", "do", "you", "usually", "do", "in", "the", "evening", "?"] },
  ];

  const GAME_ID = "starter-7a-wh-answer-challenge";
  const $ = function (id) { return document.getElementById(id); };

  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const questionLine = $("questionLine");
  const wordBank = $("wordBank");
  const checkQuestionBtn = $("checkQuestionBtn");
  const questionFeedback = $("questionFeedback");
  const themeBtn = $("themeBtn");
  const muteBtn = $("muteBtn");
  const clearBtn = $("clearBtn");
  const continueBtn = $("continueBtn");
  const afterCorrect = $("afterCorrect");
  const replayVoiceBtn = $("replayVoiceBtn");

  var order = [];
  var index = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var correctCount = 0;
  var selected = [];
  var bankChips = [];
  var locked = false;
  var idSeq = 0;
  var muted = false;

  try {
    muted = localStorage.getItem("wac-mute") === "1";
  } catch (e) {}

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function stopSpeech() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
  }

  function speakQuestion(words) {
    if (muted) return;
    try {
      if (!window.speechSynthesis) return;
      stopSpeech();
      var parts = [];
      for (var i = 0; i < words.length; i++) {
        if (words[i] === "'s" && parts.length) {
          parts[parts.length - 1] = parts[parts.length - 1] + "'s";
        } else if (words[i] !== "?") {
          parts.push(words[i]);
        }
      }
      var text = parts.join(" ") + "?";
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.92;
      var voices = window.speechSynthesis.getVoices() || [];
      var en = voices.filter(function (v) { return /^en/i.test(v.lang); });
      if (en.length) {
        var us = en.filter(function (v) { return /US|GB|UK/i.test(v.lang); });
        u.voice = us[0] || en[0];
      }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function () {
      window.speechSynthesis.getVoices();
    };
  }

  function updateMuteUI() {
    if (!muteBtn) return;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.setAttribute("aria-label", muted ? "Unmute voice" : "Mute voice");
    muteBtn.title = muted ? "Unmute" : "Mute";
  }

  function show(screen) {
    startScreen.hidden = screen !== "start";
    gameScreen.hidden = screen !== "game";
    endScreen.hidden = screen !== "end";
  }

  function setFeedback(msg, type) {
    questionFeedback.textContent = msg || "";
    questionFeedback.className = "feedback" + (type ? " " + type : "");
  }

  function updateStats() {
    $("roundText").textContent = index + 1 + " / " + order.length;
    $("scoreText").textContent = String(score);
    $("streakText").textContent = "×" + streak;
  }

  function hideAfterCorrect() {
    afterCorrect.hidden = true;
    questionLine.classList.remove("is-correct");
  }

  function showAfterCorrect() {
    afterCorrect.hidden = false;
    questionLine.classList.add("is-correct");
  }

  function renderQuestionLine() {
    questionLine.innerHTML = "";
    questionLine.classList.toggle("has-words", selected.length > 0);
    if (!selected.length) {
      questionLine.innerHTML =
        '<span class="empty-message">Your question appears here</span>';
      return;
    }
    selected.forEach(function (chip, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "built-chip";
      btn.textContent = chip.word;
      btn.disabled = locked;
      btn.addEventListener("click", function () {
        if (locked) return;
        var removed = selected.splice(i, 1)[0];
        bankChips.push(removed);
        bankChips = shuffle(bankChips);
        renderQuestionLine();
        renderBank();
        setFeedback("", "");
        checkQuestionBtn.disabled = selected.length === 0;
      });
      questionLine.appendChild(btn);
    });
  }

  function renderBank() {
    wordBank.innerHTML = "";
    bankChips.forEach(function (chip) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "word-chip";
      btn.textContent = chip.word;
      btn.disabled = locked;
      btn.addEventListener("click", function () {
        if (locked) return;
        var idx = -1;
        for (var i = 0; i < bankChips.length; i++) {
          if (bankChips[i].id === chip.id) { idx = i; break; }
        }
        if (idx === -1) return;
        var moved = bankChips.splice(idx, 1)[0];
        selected.push(moved);
        renderQuestionLine();
        renderBank();
        setFeedback("", "");
        checkQuestionBtn.disabled = false;
      });
      wordBank.appendChild(btn);
    });
  }

  function setupRoundChips() {
    stopSpeech();
    var item = order[index];
    idSeq = 0;
    selected = [];
    bankChips = shuffle(
      item.words.map(function (w) {
        return { word: w, id: idSeq++ };
      })
    );
    locked = false;
    checkQuestionBtn.disabled = true;
    clearBtn.disabled = false;
    hideAfterCorrect();
    setFeedback("", "");
    questionLine.classList.remove("shake", "is-correct");
    renderQuestionLine();
    renderBank();
    updateStats();
    // keep viewport stable — scroll game panel into view lightly if needed
    try {
      gameScreen.scrollIntoView({ block: "nearest", behavior: "instant" });
    } catch (e) {}
  }

  function clearSentence() {
    if (locked) return;
    bankChips = bankChips.concat(selected);
    selected = [];
    bankChips = shuffle(bankChips);
    renderQuestionLine();
    renderBank();
    setFeedback("", "");
    checkQuestionBtn.disabled = true;
  }

  function checkQuestion() {
    if (locked || !selected.length) return;
    var item = order[index];
    var built = selected.map(function (c) { return c.word; }).join(" ");
    var target = item.words.join(" ");
    if (built === target) {
      locked = true;
      score += 100 + streak * 10;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      correctCount += 1;
      setFeedback("Correct! Listen, or press Continue.", "ok");
      checkQuestionBtn.disabled = true;
      clearBtn.disabled = true;
      updateStats();
      showAfterCorrect();
      speakQuestion(item.words);
      // Do NOT auto-advance — user presses Continue
    } else {
      streak = 0;
      setFeedback("Not quite — check the word order.", "bad");
      questionLine.classList.add("shake");
      setTimeout(function () {
        questionLine.classList.remove("shake");
      }, 400);
      updateStats();
    }
  }

  function goContinue() {
    stopSpeech();
    index += 1;
    if (index >= order.length) {
      finish();
    } else {
      setupRoundChips();
    }
  }

  function finish() {
    stopSpeech();
    var total = order.length;
    var accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = accuracy + "%";
    $("finalStreak").textContent = String(bestStreak);
    $("endTitle").textContent =
      accuracy === 100 ? "Perfect!" : accuracy >= 70 ? "Great job!" : "Good practice!";
    $("endSummary").textContent =
      "You built " + correctCount + " of " + total + " questions correctly.";

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
        LAStars.apply(endScreen);
      }
    } catch (err) {}

    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    endScreen.querySelectorAll(".end-stars .star").forEach(function (el) {
      var n = Number(el.getAttribute("data-n") || 0);
      if (n <= stars) {
        el.classList.add("is-filled");
        el.textContent = "★";
      } else {
        el.classList.remove("is-filled");
        el.textContent = "☆";
      }
    });

    show("end");
  }

  function startGame() {
    stopSpeech();
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    correctCount = 0;
    show("game");
    setupRoundChips();
  }

  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.classList.toggle("dark-mode", dark);
    if (themeBtn) themeBtn.textContent = dark ? "☀️" : "🌙";
    try {
      localStorage.setItem("wac-theme", dark ? "dark" : "light");
    } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
    });
  }
  try {
    applyTheme(localStorage.getItem("wac-theme") === "dark");
  } catch (e) {
    applyTheme(false);
  }

  if (muteBtn) {
    updateMuteUI();
    muteBtn.addEventListener("click", function () {
      muted = !muted;
      if (muted) stopSpeech();
      try {
        localStorage.setItem("wac-mute", muted ? "1" : "0");
      } catch (e) {}
      updateMuteUI();
    });
  }

  $("startBtn").addEventListener("click", startGame);
  $("playAgainBtn").addEventListener("click", startGame);
  checkQuestionBtn.addEventListener("click", checkQuestion);
  if (clearBtn) clearBtn.addEventListener("click", clearSentence);
  if (continueBtn) continueBtn.addEventListener("click", goContinue);
  if (replayVoiceBtn) {
    replayVoiceBtn.addEventListener("click", function () {
      if (order[index]) speakQuestion(order[index].words);
    });
  }
})();
