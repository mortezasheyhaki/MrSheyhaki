(function () {
  "use strict";
  // 10 colors → 2 rounds × 5 pairs
  const ITEMS = [
    { id: "black", word: "black", img: "../images/black.png", audio: "../audio/black.mp3" },
    { id: "blue", word: "blue", img: "../images/blue.png", audio: "../audio/blue.mp3" },
    { id: "brown", word: "brown", img: "../images/brown.png", audio: "../audio/brown.mp3" },
    { id: "green", word: "green", img: "../images/green.png", audio: "../audio/green.mp3" },
    { id: "grey", word: "grey", img: "../images/grey.png", audio: "../audio/grey.mp3" },
    { id: "orange", word: "orange", img: "../images/orange.png", audio: "../audio/orange.mp3" },
    { id: "pink", word: "pink", img: "../images/pink.png", audio: "../audio/pink.mp3" },
    { id: "red", word: "red", img: "../images/red.png", audio: "../audio/red.mp3" },
    { id: "white", word: "white", img: "../images/white.png", audio: "../audio/white.mp3" },
    { id: "yellow", word: "yellow", img: "../images/yellow.png", audio: "../audio/yellow.mp3" },
  ];
  const PAIR_COUNT = 5;
  const GAME_ID = "vocab-colors-match";
  const MODE_LABELS = ["Picture → Word", "Audio → Word", "Audio → Picture"];
  const $ = (id) => document.getElementById(id);

  let mode = 0;
  let rounds = [];
  let roundIndex = 0;
  let score = 0;
  let correctPairs = 0;
  let attempts = 0;
  let selectedLeft = null;
  let selectedRight = null;
  let matches = {};
  let locked = false;
  let currentAudio = null;

  const pairsGrid = $("pairsGrid");
  const feedback = $("feedback");
  const instruction = $("instruction");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function show(s) {
    const start = $("startScreen");
    const game = $("gameScreen");
    const end = $("endScreen");
    if (start) start.hidden = s !== "start";
    if (game) game.hidden = s !== "game";
    if (end) end.hidden = s !== "end";
  }

  function setFb(msg, cls) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = "feedback" + (cls ? " " + cls : "");
  }

  function clearPlaying() {
    document.querySelectorAll(".pair-btn.is-playing").forEach((b) => b.classList.remove("is-playing"));
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    clearPlaying();
  }

  function playSrc(src, btn) {
    stopAudio();
    clearPlaying();
    const a = new Audio(src);
    currentAudio = a;
    if (btn) btn.classList.add("is-playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("is-playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  document.querySelectorAll(".mode-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-tab").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      mode = Number(btn.dataset.mode);
    });
  });

  function leftContent(item) {
    if (mode === 0) {
      return { html: `<img src="${item.img}" alt="" decoding="async" loading="eager">`, isAudio: false };
    }
    return {
      html: `<span class="audio-pill" aria-hidden="true"><svg class="audio-speaker" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg><span class="audio-bars"><i></i><i></i><i></i><i></i></span></span>`,
      isAudio: true,
      src: item.audio,
    };
  }

  function rightContent(item) {
    if (mode === 2) {
      return { html: `<img src="${item.img}" alt="" decoding="async" loading="eager">` };
    }
    return { html: `<span class="word-chip">${item.word}</span>` };
  }

  function renderRound() {
    locked = false;
    selectedLeft = null;
    selectedRight = null;
    matches = {};
    stopAudio();
    setFb("", "");
    if (instruction) instruction.textContent = "Tap one, then its match";
    if ($("promptText")) $("promptText").textContent = MODE_LABELS[mode];

    const items = rounds[roundIndex];
    const leftOrder = shuffle(items);
    const rightOrder = shuffle(items);
    pairsGrid.innerHTML = "";

    leftOrder.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pair-btn soft-square";
      btn.dataset.id = item.id;
      btn.dataset.side = "left";
      const lc = leftContent(item);
      if (lc.isAudio) btn.classList.add("audio-side");
      btn.innerHTML = lc.html;
      btn.addEventListener("click", () => {
        if (lc.isAudio) playSrc(lc.src, btn);
        onTap(btn, "left");
      });
      pairsGrid.appendChild(btn);
    });
    rightOrder.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pair-btn soft-square";
      btn.dataset.id = item.id;
      btn.dataset.side = "right";
      btn.innerHTML = rightContent(item).html;
      btn.addEventListener("click", () => onTap(btn, "right"));
      pairsGrid.appendChild(btn);
    });

    const leftBtns = [...pairsGrid.querySelectorAll('[data-side="left"]')];
    const rightBtns = [...pairsGrid.querySelectorAll('[data-side="right"]')];
    pairsGrid.innerHTML = "";
    for (let i = 0; i < PAIR_COUNT && i < leftBtns.length; i++) {
      pairsGrid.appendChild(leftBtns[i]);
      pairsGrid.appendChild(rightBtns[i]);
    }

    updateStats();
    items.forEach((it) => {
      try {
        const a = new Audio();
        a.preload = "auto";
        a.src = it.audio;
      } catch (e) {}
    });
  }

  function onTap(btn, side) {
    if (locked || btn.classList.contains("matched")) return;
    if (side === "left") {
      pairsGrid.querySelectorAll('[data-side="left"]:not(.matched)').forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedLeft = btn.dataset.id;
    } else {
      pairsGrid.querySelectorAll('[data-side="right"]:not(.matched)').forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedRight = btn.dataset.id;
    }
    if (selectedLeft && selectedRight) resolve();
  }

  function resolve() {
    locked = true;
    attempts++;
    const ok = selectedLeft === selectedRight;
    const L = selectedLeft;
    const R = selectedRight;
    if (ok) {
      correctPairs++;
      score += 100;
      pairsGrid.querySelectorAll(".pair-btn").forEach((b) => {
        if (b.dataset.id === L || b.dataset.id === R) {
          b.classList.remove("selected");
          b.classList.add("matched");
        }
      });
      matches[L] = true;
      setFb("Correct!", "ok");
      if (mode === 0) {
        const matched = ITEMS.find((it) => it.id === L);
        if (matched) playSrc(matched.audio);
      }
    } else {
      setFb("Try again", "bad");
      pairsGrid.querySelectorAll(".pair-btn.selected").forEach((b) => b.classList.add("wrong"));
      setTimeout(() => {
        pairsGrid.querySelectorAll(".pair-btn.wrong").forEach((b) => {
          b.classList.remove("wrong", "selected");
        });
      }, 450);
    }
    selectedLeft = null;
    selectedRight = null;
    updateStats();
    const need = Math.min(PAIR_COUNT, (rounds[roundIndex] || []).length);
    if (Object.keys(matches).length >= need) {
      setTimeout(() => nextRound(), 700);
    } else {
      locked = false;
    }
  }

  function updateStats() {
    if ($("roundText")) $("roundText").textContent = roundIndex + 1 + " / " + rounds.length;
    if ($("scoreText")) $("scoreText").textContent = String(score);
    if ($("matchedText")) {
      const need = Math.min(PAIR_COUNT, (rounds[roundIndex] || []).length || PAIR_COUNT);
      $("matchedText").textContent = Object.keys(matches).length + " / " + need;
    }
  }

  function nextRound() {
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
    const acc = attempts ? Math.round((correctPairs / attempts) * 100) : 0;
    if ($("finalScore")) $("finalScore").textContent = String(score);
    if ($("finalAccuracy")) $("finalAccuracy").textContent = acc + "%";
    if ($("finalRounds")) $("finalRounds").textContent = String(rounds.length);
    if ($("endTitle")) $("endTitle").textContent = acc === 100 ? "Perfect!" : acc >= 70 ? "Great job!" : "Good practice!";
    if ($("endSummary")) {
      $("endSummary").textContent =
        "Mode: " + MODE_LABELS[mode] + " · " + correctPairs + " matches in " + attempts + " tries.";
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
        LAStars.apply($("endScreen"));
      }
    } catch (e) {}
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    const endEl = $("endScreen");
    if (endEl) {
      endEl.querySelectorAll(".star").forEach((el) => {
        const n = Number(el.getAttribute("data-n") || 0);
        el.classList.toggle("is-filled", n <= stars);
        el.textContent = n <= stars ? "★" : "☆";
      });
    }
    show("end");
  }

  function startGame() {
    const shuffled = shuffle(ITEMS);
    rounds = [];
    for (let i = 0; i < shuffled.length; i += PAIR_COUNT) {
      const chunk = shuffled.slice(i, i + PAIR_COUNT);
      if (chunk.length >= 4) rounds.push(chunk);
    }
    if (!rounds.length) rounds = [shuffled.slice(0, Math.min(PAIR_COUNT, shuffled.length))];
    roundIndex = 0;
    score = 0;
    correctPairs = 0;
    attempts = 0;
    show("game");
    renderRound();
  }

  function backToModes() {
    stopAudio();
    locked = false;
    show("start");
  }

  const startBtn = $("startBtn");
  const playAgainBtn = $("playAgainBtn");
  const backBtn = $("backToModes");
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (playAgainBtn) playAgainBtn.addEventListener("click", () => show("start"));
  if (backBtn) backBtn.addEventListener("click", backToModes);
})();
