/* Family Match Rush — Audio → Word (Clothes-style UI) */

(function () {
  "use strict";

  const GAME_ID = "vocab-family-match-rush";
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

    if (ok) {
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
