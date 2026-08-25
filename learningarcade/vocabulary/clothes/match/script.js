(function () {
  "use strict";
  // 15 items (jacket removed) → 3 rounds × 5 pairs
  const ITEMS = [
    { id: "sweater", word: "sweater", img: "../images/sweater.png", audio: "../audio/sweater.mp3" },
    { id: "t-shirt", word: "T-shirt", img: "../images/t-shirt.png", audio: "../audio/t-shirt.mp3" },
    { id: "shirt", word: "shirt", img: "../images/shirt.png", audio: "../audio/shirt.mp3" },
    { id: "pants", word: "pants", img: "../images/pants.png", audio: "../audio/pants.mp3" },
    { id: "jeans", word: "jeans", img: "../images/jeans.png", audio: "../audio/jeans.mp3" },
    { id: "shorts", word: "shorts", img: "../images/shorts.png", audio: "../audio/shorts.mp3" },
    { id: "suit", word: "suit", img: "../images/suit.png", audio: "../audio/suit.mp3" },
    { id: "dress", word: "dress", img: "../images/dress.png", audio: "../audio/dress.mp3" },
    { id: "skirt", word: "skirt", img: "../images/skirt.png", audio: "../audio/skirt.mp3" },
    { id: "coat", word: "coat", img: "../images/coat.png", audio: "../audio/coat.mp3" },
    { id: "socks", word: "socks", img: "../images/socks.png", audio: "../audio/socks.mp3" },
    { id: "sneakers", word: "sneakers", img: "../images/sneakers.png", audio: "../audio/sneakers.mp3" },
    { id: "shoes", word: "shoes", img: "../images/shoes.png", audio: "../audio/shoes.mp3" },
    { id: "hat", word: "hat", img: "../images/hat.png", audio: "../audio/hat.mp3" },
    { id: "cap", word: "cap", img: "../images/cap.png", audio: "../audio/cap.mp3" },
  ];
  const PAIR_COUNT = 5;
  const GAME_ID = "vocab-clothes-match";
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
    if (s === "end" && end) {
      end.removeAttribute("hidden");
    }
    // Keep body non-scrolling
    document.body.classList.toggle("playing", s === "game");
  }

  function setFb(msg, type) {
    if (!feedback) return;
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
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
    // Preload audio for this round (smoother first play on mobile)
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
      // Pic · Word: play the word voice when a pair is matched
      if (mode === 0) {
        const matched = ITEMS.find((it) => it.id === L);
        if (matched && matched.audio) playSrc(matched.audio, null);
      }
      selectedLeft = selectedRight = null;
      updateStats();
      const need = Math.min(PAIR_COUNT, (rounds[roundIndex] || []).length);
      if (Object.keys(matches).length >= need) {
        setTimeout(() => nextRound(), 650);
      } else {
        setTimeout(() => {
          locked = false;
          setFb("", "");
        }, 350);
      }
    } else {
      pairsGrid.querySelectorAll(".pair-btn").forEach((b) => {
        if (
          (b.dataset.side === "left" && b.dataset.id === L) ||
          (b.dataset.side === "right" && b.dataset.id === R)
        ) {
          b.classList.remove("selected");
          b.classList.add("wrong");
        }
      });
      setFb("Not a match", "bad");
      selectedLeft = selectedRight = null;
      setTimeout(() => {
        pairsGrid.querySelectorAll(".wrong").forEach((b) => b.classList.remove("wrong"));
        locked = false;
        setFb("", "");
      }, 500);
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
