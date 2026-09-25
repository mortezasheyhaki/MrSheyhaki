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
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();

const ALL_ITEMS = [
    { id: "this", word: "this", src: "audio/this.mp3" },
    { id: "that", word: "that", src: "audio/that.mp3" },
    { id: "these", word: "these", src: "audio/these.mp3" },
    { id: "those", word: "those", src: "audio/those.mp3" },
    { id: "they", word: "they", src: "audio/they.mp3" },
    { id: "mother", word: "mother", src: "audio/mother.mp3" },
  ];

  const GAME_ID = "starter-3b-listen-match";
  const PAIR_COUNT = 3;
  const $ = function (id) { return document.getElementById(id); };

  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const pairsGrid = $("pairsGrid");
  const feedback = $("feedback");
  const instruction = $("instruction");
  const themeBtn = $("themeBtn");

  let rounds = [];
  let roundIndex = 0;
  let score = 0;
  let correctPairs = 0;
  let totalAttempts = 0;
  let selectedAudio = null;
  let selectedWord = null;
  let matches = {};
  let locked = false;
  let currentAudio = null;

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

  function show(screen) {
    startScreen.hidden = screen !== "start";
    gameScreen.hidden = screen !== "game";
    endScreen.hidden = screen !== "end";
  }

  function setFeedback(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    pairsGrid.querySelectorAll(".audio-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playSrc(src, btn) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {});
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function waveHTML() {
    return (
      '<span class="speaker" aria-hidden="true">🔊</span>' +
      '<span class="wave" aria-hidden="true">' +
      "<span></span><span></span><span></span><span></span>" +
      "<span></span><span></span><span></span>" +
      "</span>"
    );
  }

  function updateStats() {
    $("roundText").textContent = roundIndex + 1 + " / " + rounds.length;
    $("scoreText").textContent = String(score);
    const matched = Object.keys(matches).length;
    $("matchedText").textContent = matched + " / " + PAIR_COUNT;
  }

  function renderRound() {
    locked = false;
    selectedAudio = null;
    selectedWord = null;
    matches = {};
    stopAudio();
    setFeedback("", "");
    instruction.textContent = "Tap a sound, then its word";

    const items = rounds[roundIndex];
    const audioOrder = shuffle(items);
    const wordOrder = shuffle(items);

    pairsGrid.innerHTML = "";

    for (let i = 0; i < PAIR_COUNT; i++) {
      const aItem = audioOrder[i];
      const wItem = wordOrder[i];

      const aBtn = document.createElement("button");
      aBtn.type = "button";
      aBtn.className = "audio-btn";
      aBtn.dataset.id = aItem.id;
      aBtn.dataset.src = aItem.src;
      aBtn.setAttribute("aria-label", "Play sound " + (i + 1));
      aBtn.innerHTML = waveHTML();
      aBtn.addEventListener("click", function () {
        onAudioTap(aBtn);
      });

      const wBtn = document.createElement("button");
      wBtn.type = "button";
      wBtn.className = "word-btn";
      wBtn.dataset.id = wItem.id;
      wBtn.textContent = wItem.word;
      wBtn.setAttribute("aria-label", "Word " + wItem.word);
      wBtn.addEventListener("click", function () {
        onWordTap(wBtn);
      });

      pairsGrid.appendChild(aBtn);
      pairsGrid.appendChild(wBtn);
    }

    updateStats();
  }

  function clearSelectionVisual() {
    pairsGrid.querySelectorAll(".audio-btn.selected, .word-btn.selected").forEach(function (el) {
      if (!el.classList.contains("matched")) el.classList.remove("selected");
    });
  }

  function onAudioTap(btn) {
    if (locked || btn.classList.contains("matched")) return;
    playSrc(btn.dataset.src, btn);

    selectedAudio = btn.dataset.id;
    pairsGrid.querySelectorAll(".audio-btn").forEach(function (b) {
      if (!b.classList.contains("matched")) b.classList.remove("selected", "wrong");
    });
    btn.classList.add("selected");

    if (selectedWord) {
      resolvePair();
    } else {
      instruction.textContent = "Now tap the matching word";
      setFeedback("", "");
    }
  }

  function onWordTap(btn) {
    if (locked || btn.classList.contains("matched")) return;

    selectedWord = btn.dataset.id;
    pairsGrid.querySelectorAll(".word-btn").forEach(function (b) {
      if (!b.classList.contains("matched")) b.classList.remove("selected", "wrong");
    });
    btn.classList.add("selected");

    if (selectedAudio) {
      resolvePair();
    } else {
      instruction.textContent = "Now tap a sound on the left";
      setFeedback("", "");
    }
  }

  function markMatched(audioId, wordId) {
    pairsGrid.querySelectorAll(".audio-btn").forEach(function (b) {
      if (b.dataset.id === audioId) {
        b.classList.remove("selected", "wrong");
        b.classList.add("matched");
      }
    });
    pairsGrid.querySelectorAll(".word-btn").forEach(function (b) {
      if (b.dataset.id === wordId) {
        b.classList.remove("selected", "wrong");
        b.classList.add("matched");
      }
    });
    matches[audioId] = wordId;
  }

  function markWrong(audioId, wordId) {
    pairsGrid.querySelectorAll(".audio-btn").forEach(function (b) {
      if (b.dataset.id === audioId) {
        b.classList.remove("selected");
        b.classList.add("wrong");
      }
    });
    pairsGrid.querySelectorAll(".word-btn").forEach(function (b) {
      if (b.dataset.id === wordId) {
        b.classList.remove("selected");
        b.classList.add("wrong");
      }
    });
  }

  function resolvePair() {
    if (locked || !selectedAudio || !selectedWord) return;
    locked = true;
    totalAttempts++;

    const ok = selectedAudio === selectedWord;
    const audioId = selectedAudio;
    const wordId = selectedWord;

    if (ok) { try{sfxCorrect();}catch(e){}
      correctPairs++;
      score += 100;
      markMatched(audioId, wordId);
      setFeedback("Correct!", "ok");
      selectedAudio = null;
      selectedWord = null;
      updateStats();

      if (Object.keys(matches).length >= PAIR_COUNT) {
        setTimeout(function () {
          nextRoundOrFinish();
        }, 650);
      } else {
        setTimeout(function () {
          locked = false;
          instruction.textContent = "Tap a sound, then its word";
          setFeedback("", "");
        }, 400);
      }
    } else {
      markWrong(audioId, wordId);
      setFeedback("Not a match — try again", "bad");
      selectedAudio = null;
      selectedWord = null;
      setTimeout(function () {
        pairsGrid.querySelectorAll(".wrong").forEach(function (b) {
          b.classList.remove("wrong");
        });
        locked = false;
        instruction.textContent = "Tap a sound, then its word";
        setFeedback("", "");
      }, 550);
    }
  }

  function nextRoundOrFinish() {
    roundIndex++;
    if (roundIndex >= rounds.length) {
      finish();
    } else {
      locked = false;
      renderRound();
    }
  }

  function finish() {
    stopAudio();
    const accuracy = totalAttempts ? Math.round((correctPairs / totalAttempts) * 100) : 0;
    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = accuracy + "%";
    $("finalRounds").textContent = String(rounds.length);
    $("endTitle").textContent =
      accuracy === 100 ? "Perfect!" : accuracy >= 70 ? "Great job!" : "Good practice!";
    $("endSummary").textContent =
      "You matched " + correctPairs + " pairs · " + totalAttempts + " attempts.";

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
        LAStars.apply(endScreen);
      }
    } catch (e) {}

    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    endScreen.querySelectorAll(".end-stars .star").forEach(function (el) {
      const n = Number(el.getAttribute("data-n") || 0);
      if (n <= stars) {
        el.classList.add("is-filled");
        el.textContent = "★";
      } else {
        el.classList.remove("is-filled");
        el.textContent = "☆";
      }
    });

    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      const acc = (typeof accuracy !== "undefined") ? accuracy : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: correctPairs,
        total: rounds.length,
        timeMs: timeMs,
        onAgain: () => startGame(),
        onModes: () => startGame(),
        backHref: "../",
        save: false,
      });
      return;
    }
    show("end");
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    const shuffled = shuffle(ALL_ITEMS);
    rounds = [];
    for (let i = 0; i < shuffled.length; i += PAIR_COUNT) {
      rounds.push(shuffled.slice(i, i + PAIR_COUNT));
    }
    roundIndex = 0;
    score = 0;
    correctPairs = 0;
    totalAttempts = 0;
    show("game");
    renderRound();
  }

  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.classList.toggle("dark-mode", dark);
    if (themeBtn) themeBtn.textContent = dark ? "☀️" : "🌙";
    try {
      localStorage.setItem("lm-theme", dark ? "dark" : "light");
    } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
    });
  }
  try {
    applyTheme(localStorage.getItem("lm-theme") === "dark");
  } catch (e) {
    applyTheme(false);
  }

  $("startBtn").addEventListener("click", startGame);
  $("playAgainBtn").addEventListener("click", startGame);
})();
