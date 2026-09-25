(function () {
  "use strict";

  

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

const ITEMS = [
    {
      wh: "When",
      rest: "do you go to bed?",
      answer: "At about eleven o'clock.",
    },
    {
      wh: "What",
      rest: "music does she like?",
      answer: "Jazz and pop.",
    },
    {
      wh: "How",
      rest: "old is your sister?",
      answer: "She's 19 years old.",
    },
    {
      wh: "What",
      rest: "do you want for lunch?",
      answer: "A sandwich and a coffee, please.",
    },
    {
      wh: "Who",
      rest: "'s that woman with Rob?",
      answer: "His sister.",
    },
    {
      wh: "How",
      rest: "do you spell your last name?",
      answer: "S-A-N-C-H-E-Z",
    },
    {
      wh: "Where",
      rest: "does your wife work?",
      answer: "In an office.",
    },
    {
      wh: "Where",
      rest: "do you usually go on vacation?",
      answer: "We usually go to another city.",
    },
  ];

  const WH_BANK = ["What", "When", "Where", "Who", "How"];
  const GAME_ID = "starter-7a-question-builder";

  const $ = (id) => document.getElementById(id);

  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const startBtn = $("startBtn");
  const checkBtn = $("checkBtn");
  const clearBtn = $("clearBtn");
  const playAgainBtn = $("playAgainBtn");
  const themeBtn = $("themeBtn");
  const wordBank = $("wordBank");
  const slot = $("slot");
  const restText = $("restText");
  const answerText = $("answerText");
  const feedback = $("feedback");
  const roundText = $("roundText");
  const scoreText = $("scoreText");
  const streakText = $("streakText");

  let order = [];
  let index = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let correctCount = 0;
  let selected = null;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function show(screen) {
    startScreen.hidden = screen !== "start";
    gameScreen.hidden = screen !== "game";
    endScreen.hidden = screen !== "end";
  }

  function updateStats() {
    roundText.textContent = index + 1 + " / " + order.length;
    scoreText.textContent = String(score);
    streakText.textContent = "×" + streak;
  }

  function setFeedback(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function renderBank() {
    wordBank.innerHTML = "";
    WH_BANK.forEach((word) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "word-chip";
      btn.textContent = word;
      btn.dataset.word = word;
      btn.addEventListener("click", () => onPick(word, btn));
      wordBank.appendChild(btn);
    });
  }

  function onPick(word, btn) {
    if (locked) return;

    // return previous selection to bank visual
    wordBank.querySelectorAll(".word-chip").forEach((c) => c.classList.remove("used"));
    btn.classList.add("used");

    selected = word;
    slot.textContent = word;
    slot.classList.remove("empty", "correct", "wrong");
    slot.classList.add("filled");
    checkBtn.disabled = false;
    setFeedback("", "");
  }

  function clearSelection() {
    if (locked) return;
    selected = null;
    slot.textContent = "?";
    slot.className = "slot empty";
    wordBank.querySelectorAll(".word-chip").forEach((c) => c.classList.remove("used"));
    checkBtn.disabled = true;
    setFeedback("", "");
  }

  function renderRound() {
    locked = false;
    selected = null;
    const item = order[index];
    answerText.textContent = item.answer;
    restText.textContent = " " + item.rest;
    slot.textContent = "?";
    slot.className = "slot empty";
    checkBtn.disabled = true;
    setFeedback("", "");
    renderBank();
    updateStats();
  }

  function checkAnswer() {
    if (locked || !selected) return;
    locked = true;

    const item = order[index];
    const ok = selected === item.wh;
    const chips = wordBank.querySelectorAll(".word-chip");

    chips.forEach((c) => {
      if (c.dataset.word === selected) {
        c.classList.add(ok ? "correct-flash" : "wrong-flash");
      }
      if (!ok && c.dataset.word === item.wh) {
        c.classList.add("correct-flash");
      }
    });

    if (ok) { try{sfxCorrect();}catch(e){}
      slot.classList.remove("filled", "wrong");
      slot.classList.add("correct");
      score += 100 + streak * 10;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      correctCount += 1;
      setFeedback("Correct! " + item.wh + " " + item.rest, "ok");
    } else {
      slot.classList.remove("filled", "correct");
      slot.classList.add("wrong");
      streak = 0;
      setFeedback("Not quite. Answer: " + item.wh + " " + item.rest, "bad");
    }

    updateStats();

    setTimeout(() => {
      index += 1;
      if (index >= order.length) {
        finish();
      } else {
        renderRound();
      }
    }, ok ? 900 : 1400);
  }

  function finish() {
    const total = order.length;
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;

    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = accuracy + "%";
    $("finalStreak").textContent = String(bestStreak);
    $("endTitle").textContent =
      accuracy === 100 ? "Perfect!" : accuracy >= 70 ? "Great job!" : "Good practice!";
    $("endSummary").textContent =
      "You got " + correctCount + " of " + total + " questions right.";

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
        LAStars.apply(endScreen);
      }
    } catch (e) {}

    // paint end stars immediately
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    endScreen.querySelectorAll(".end-stars .star").forEach((el) => {
      const n = Number(el.getAttribute("data-n") || 0);
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
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    correctCount = 0;
    show("game");
    renderRound();
  }

  // Theme
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.classList.toggle("dark-mode", dark);
    if (themeBtn) themeBtn.textContent = dark ? "☀️" : "🌙";
    try {
      localStorage.setItem("qb-theme", dark ? "dark" : "light");
    } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const dark = document.documentElement.getAttribute("data-theme") !== "dark";
      applyTheme(dark);
    });
  }
  try {
    applyTheme(localStorage.getItem("qb-theme") === "dark");
  } catch (e) {
    applyTheme(false);
  }

  startBtn.addEventListener("click", startGame);
  playAgainBtn.addEventListener("click", startGame);
  checkBtn.addEventListener("click", checkAnswer);
  clearBtn.addEventListener("click", clearSelection);

  // keyboard: 1-5 pick chips, Enter checks
  document.addEventListener("keydown", function (e) {
    if (gameScreen.hidden) return;
    if (e.key === "Enter" && !checkBtn.disabled) {
      e.preventDefault();
      checkAnswer();
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= WH_BANK.length && !locked) {
      const chip = wordBank.querySelectorAll(".word-chip")[n - 1];
      if (chip) chip.click();
    }
  });
})();
