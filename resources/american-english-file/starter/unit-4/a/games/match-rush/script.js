/* Family Match Rush — Audio → Word (Clothes-style UI) */

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

const GAME_ID = "starter-4a-match-rush";
  const PAIR_COUNT = 5;

  const WORDS = [
    { id: "husband", word: "husband" },
    { id: "wife", word: "wife" },
    { id: "mother", word: "mother" },
    { id: "father", word: "father" },
    { id: "son", word: "son" },
    { id: "daughter", word: "daughter" },
    { id: "brother", word: "brother" },
    { id: "sister", word: "sister" },
    { id: "grandmother", word: "grandmother" },
    { id: "grandfather", word: "grandfather" }
  ];

  const SPEAKER_SVG =
    '<span class="spk-ico" aria-hidden="true">' +
    '<svg class="spk-speaker" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M3 9v6h4l5 5V4L7 9H3z"/>' +
    '</svg>' +
    '<span class="spk-bars">' +
    '<i></i><i></i><i></i>' +
    '</span>' +
    '</span>';

  let deck = [];
  let roundIndex = 0;
  let totalRounds = 0;
  let matched = 0;
  let score = 0;
  let selectedLeft = null;
  let selectedRight = null;
  let locked = false;
  let currentAudio = null;
  let roundItems = [];
  let matchedIds = new Set();

  const $ = (id) => document.getElementById(id);
  const pairsGrid = $("pairsGrid");
  const feedback = $("feedback");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function show(s) {
    $("startScreen").hidden = s !== "start";
    $("gameScreen").hidden = s !== "game";
    $("endScreen").hidden = s !== "end";
  }

  function setFb(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    document.querySelectorAll(".pair-btn.is-playing").forEach((b) => b.classList.remove("is-playing"));
  }

  function playId(id, btn) {
    stopAudio();
    const a = new Audio("audio/" + id + ".mp3");
    currentAudio = a;
    if (btn) btn.classList.add("is-playing");
    a.play().catch(() => { if (btn) btn.classList.remove("is-playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    deck = shuffle(WORDS);
    totalRounds = Math.ceil(deck.length / PAIR_COUNT);
    roundIndex = 0;
    score = 0;
    $("scoreText").textContent = "0";
    show("game");
    startRound();
  }

  function startRound() {
    matched = 0;
    matchedIds = new Set();
    selectedLeft = null;
    selectedRight = null;
    locked = false;
    setFb("");
    const start = roundIndex * PAIR_COUNT;
    roundItems = deck.slice(start, start + PAIR_COUNT);
    $("matchedText").textContent = "0 / " + roundItems.length;
    $("roundText").textContent = (roundIndex + 1) + " / " + totalRounds;
    renderGrid();
  }

  function renderGrid() {
    pairsGrid.innerHTML = "";
    const leftOrder = shuffle(roundItems);
    const rightOrder = shuffle(roundItems);

    for (let i = 0; i < roundItems.length; i++) {
      const row = document.createElement("div");
      row.className = "pair-row";

      const leftItem = leftOrder[i];
      const audioBtn = document.createElement("button");
      audioBtn.type = "button";
      audioBtn.className = "pair-btn audio-side";
      audioBtn.dataset.id = leftItem.id;
      audioBtn.dataset.side = "left";
      audioBtn.innerHTML = '<span class="audio-pill">' + SPEAKER_SVG + "</span>";
      if (matchedIds.has(leftItem.id)) audioBtn.classList.add("is-matched");
      audioBtn.addEventListener("click", () => {
        if (locked || audioBtn.classList.contains("is-matched")) return;
        playId(leftItem.id, audioBtn);
        select(audioBtn, "left");
      });

      const rightItem = rightOrder[i];
      const wordBtn = document.createElement("button");
      wordBtn.type = "button";
      wordBtn.className = "pair-btn word-side";
      wordBtn.dataset.id = rightItem.id;
      wordBtn.dataset.side = "right";
      wordBtn.textContent = rightItem.word;
      if (matchedIds.has(rightItem.id)) wordBtn.classList.add("is-matched");
      wordBtn.addEventListener("click", () => {
        if (locked || wordBtn.classList.contains("is-matched")) return;
        select(wordBtn, "right");
      });

      row.appendChild(audioBtn);
      row.appendChild(wordBtn);
      pairsGrid.appendChild(row);
    }
  }

  function select(el, side) {
    if (side === "left") {
      pairsGrid.querySelectorAll(".audio-side.is-selected").forEach((b) => b.classList.remove("is-selected"));
      el.classList.add("is-selected");
      selectedLeft = el;
    } else {
      pairsGrid.querySelectorAll(".word-side.is-selected").forEach((b) => b.classList.remove("is-selected"));
      el.classList.add("is-selected");
      selectedRight = el;
    }
    if (selectedLeft && selectedRight) checkMatch();
  }

  function checkMatch() {
    locked = true;
    const ok = selectedLeft.dataset.id === selectedRight.dataset.id;

    if (ok) { try{sfxCorrect();}catch(e){}
      selectedLeft.classList.remove("is-selected");
      selectedRight.classList.remove("is-selected");
      selectedLeft.classList.add("is-matched");
      selectedRight.classList.add("is-matched");
      matchedIds.add(selectedLeft.dataset.id);
      matched++;
      score += 10;
      $("matchedText").textContent = matched + " / " + roundItems.length;
      $("scoreText").textContent = String(score);
      setFb("Correct!", "success");
      selectedLeft = null;
      selectedRight = null;
      locked = false;

      if (matched >= roundItems.length) {
        setTimeout(() => {
          roundIndex++;
          if (roundIndex >= totalRounds) finish();
          else startRound();
        }, 650);
      } else {
        setTimeout(() => setFb(""), 500);
      }
    } else {
      selectedLeft.classList.add("is-wrong");
      selectedRight.classList.add("is-wrong");
      setFb("Try again", "error");
      setTimeout(() => {
        selectedLeft.classList.remove("is-wrong", "is-selected");
        selectedRight.classList.remove("is-wrong", "is-selected");
        selectedLeft = null;
        selectedRight = null;
        locked = false;
        setFb("");
      }, 480);
    }
  }

  function finish() {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: score,
          total: WORDS.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

    const max = WORDS.length * 10;
    const acc = Math.round((score / max) * 100);
    $("endTitle").textContent = acc >= 90 ? "Perfect!" : "Well done!";
    $("endSummary").textContent = "Score: " + score + " / " + max + " (" + acc + "%)";
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}
    show("end");
  }

  $("startBtn").addEventListener("click", startGame);
  $("backToStart").addEventListener("click", () => { stopAudio(); show("start"); });
  $("playAgainBtn").addEventListener("click", () => show("start"));

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }
})();
