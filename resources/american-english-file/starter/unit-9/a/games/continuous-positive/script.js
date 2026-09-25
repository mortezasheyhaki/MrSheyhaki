/* Present Continuous + — fully split words: I · am · working */
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

const GAME_ID = "starter-9a-continuous-positive";
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
      words: ["I", "am", "working"],
      sentence: "I am working",
      alts: ["i'm working", "im working"],
      audio: "../audio/I'm working.mp3",
    },
    {
      prompt: "You / sit / in my chair",
      words: ["You", "are", "sitting", "in", "my", "chair"],
      sentence: "You are sitting in my chair",
      alts: ["you're sitting in my chair", "youre sitting in my chair"],
      audio: "../audio/You're sitting in my chair.mp3",
    },
    {
      prompt: "He / play soccer",
      words: ["He", "is", "playing", "soccer"],
      sentence: "He is playing soccer",
      alts: ["he's playing soccer", "hes playing soccer"],
      audio: "../audio/He's playing soccer.mp3",
    },
    {
      prompt: "She / take a shower",
      words: ["She", "is", "taking", "a", "shower"],
      sentence: "She is taking a shower",
      alts: ["she's taking a shower", "shes taking a shower"],
      audio: "../audio/She's taking a shower.mp3",
    },
    {
      prompt: "It / rain",
      words: ["It", "is", "raining"],
      sentence: "It is raining",
      alts: ["it's raining", "its raining"],
      audio: "../audio/It's raining.mp3",
    },
    {
      prompt: "We / have dinner",
      words: ["We", "are", "having", "dinner"],
      sentence: "We are having dinner",
      alts: ["we're having dinner", "were having dinner"],
      audio: "../audio/We're having dinner.mp3",
    },
    {
      prompt: "They / listen / to the teacher",
      words: ["They", "are", "listening", "to", "the", "teacher"],
      sentence: "They are listening to the teacher",
      alts: ["they're listening to the teacher", "theyre listening to the teacher"],
      audio: "../audio/They're listening to the teacher.mp3",
    },
  ];

  let mode = "chips";
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let tray = []; // { word, bankIdx }

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
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(built, item) {
    const n = normalize(built);
    if (n === normalize(item.sentence)) return true;
    return (item.alts || []).some((a) => normalize(a) === n);
  }

  function playAudio(src) {
    if (!src) return;
    const a = new Audio(src);
    a.play().catch(function () {});
  }

  function start(m) {
    mode = m;
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    score = 0;
    locked = false;
    startScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    modeLabel.textContent = mode === "chips" ? "Word chips" : "Write it";
    chipsPanel.classList.toggle("hidden", mode !== "chips");
    writePanel.classList.toggle("hidden", mode !== "write");
    if (window.LAFinish) LAFinish.startTimer();
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

  let bankWords = [];

  function currentBankWords() {
    const item = ITEMS[order[index]];
    const used = tray.map(function (t) {
      return t.word;
    });
    const remaining = [];
    const usedCount = {};
    used.forEach(function (w) {
      usedCount[w] = (usedCount[w] || 0) + 1;
    });
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
        tray.push({ word: w, bankIdx: i });
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
      if (window.LASfx) LASfx.correct();
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
      if (window.LASfx) LASfx.wrong();
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
      if (window.LASfx) LASfx.correct();
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
      if (window.LASfx) LASfx.wrong();
      setTimeout(function () {
        answerInput.classList.remove("shake");
      }, 300);
    }
  }

  function next() {
    if (index + 1 >= order.length) {
      if (window.LASfx) LASfx.win();
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: Math.max(order.length, 1),
          timeMs: timeMs,
          onAgain: function () { start(mode); },
          onModes: function () {
            gameScreen.classList.add("hidden");
            endOverlay.classList.add("hidden");
            startScreen.classList.remove("hidden");
          },
          backHref: "../",
          save: true
        });
        return;
      }
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
