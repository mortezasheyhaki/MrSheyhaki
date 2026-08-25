(function () {
  "use strict";

  const WORDS = [
    { word: "watches", sound: "iz" },
    { word: "glasses", sound: "iz" },
    { word: "chargers", sound: "iz" },
    { word: "change purses", sound: "iz" },
    { word: "wallets", sound: "s" },
    { word: "notebooks", sound: "s" },
    { word: "tablets", sound: "s" },
    { word: "passports", sound: "s" },
    { word: "cell phones", sound: "z" },
    { word: "pencils", sound: "z" },
    { word: "photos", sound: "z" },
    { word: "umbrellas", sound: "z" },
    { word: "cameras", sound: "z" },
    { word: "keys", sound: "z" },
    { word: "newspapers", sound: "z" },
    { word: "id cards", sound: "z" },
    { word: "credit cards", sound: "z" },
    { word: "debit cards", sound: "z" },
  ];

  const GAME_ID = "starter-3a-plural-s-sound-match";
  const $ = function (id) { return document.getElementById(id); };

  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const card = $("card");
  const wordEl = $("word");
  const scoreEl = $("score");
  const timerEl = $("timer");
  const comboEl = $("combo");
  const feedback = $("feedback");
  const progressEl = $("progress");
  const themeBtn = $("themeBtn");

  let deck = [];
  let currentIndex = 0;
  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let correctCount = 0;
  let totalAnswered = 0;
  let timeLeft = 90;
  let timerInterval = null;
  let gameActive = false;
  let isDragging = false;
  let startX = 0, startY = 0;
  let cardX = 0, cardY = 0;
  let audioCtx = null;

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

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playCorrectSound() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25].forEach(function (freq, i) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02 + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + i * 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + 0.4 + i * 0.1);
      });
    } catch (e) {}
  }

  function playWrongSound() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  function spawnParticles(good) {
    const area = $("gameArea");
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const originX = rect.width / 2;
    const originY = rect.height / 2 - 10;
    const colors = good
      ? ["#58cc02", "#a8e063", "#ffc800", "#84d8ff", "#ffffff"]
      : ["#ff4b4b", "#ff8e8e", "#ff4757"];
    const count = good ? 18 : 10;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = good ? 6 + Math.random() * 9 : 5 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = good ? 70 + Math.random() * 120 : 40 + Math.random() * 80;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - (good ? 30 : 15);
      const duration = 0.5 + Math.random() * 0.4;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.background = color;
      p.style.left = originX + "px";
      p.style.top = originY + "px";
      p.style.opacity = "1";
      area.appendChild(p);
      if (p.animate) {
        const anim = p.animate(
          [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            {
              transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(0.3)",
              opacity: 0,
            },
          ],
          { duration: duration * 1000, easing: "cubic-bezier(0.15, 0.7, 0.3, 1)", fill: "forwards" }
        );
        anim.onfinish = function () { p.remove(); };
      }
      setTimeout(function () { if (p.parentNode) p.remove(); }, duration * 1000 + 50);
    }
  }

  function updateProgress() {
    progressEl.innerHTML = "";
    deck.forEach(function (_, i) {
      const d = document.createElement("div");
      d.className = "dot";
      if (i < currentIndex) d.classList.add("done");
      if (i === currentIndex) d.classList.add("current");
      progressEl.appendChild(d);
    });
  }

  function showCard() {
    if (currentIndex >= deck.length) {
      endGame();
      return;
    }
    const item = deck[currentIndex];
    wordEl.textContent = item.word;
    card.style.transition = "none";
    card.style.transform = "translate(0,0) rotate(0deg)";
    card.style.opacity = "1";
    cardX = 0;
    cardY = 0;
    updateProgress();
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      timeLeft--;
      timerEl.textContent = String(timeLeft);
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function showFeedback(good, direction, pointsEarned) {
    spawnParticles(good);
    feedback.textContent = good ? "✓" : "✗";
    feedback.style.color = good ? "#58cc02" : "#ff4b4b";
    feedback.classList.add("show");
    setTimeout(function () { feedback.classList.remove("show"); }, 450);

    card.classList.remove("correct-flash", "wrong-flash");
    void card.offsetWidth;
    card.classList.add(good ? "correct-flash" : "wrong-flash");
    setTimeout(function () { card.classList.remove("correct-flash", "wrong-flash"); }, 400);

    const dirEl = document.querySelector('.dir[data-dir="' + direction + '"]');
    if (dirEl) {
      dirEl.classList.add(good ? "flash-correct" : "flash-wrong");
      setTimeout(function () {
        dirEl.classList.remove("flash-correct", "flash-wrong");
      }, 350);
    }

    const flash = $("screenFlash");
    flash.className = "screen-flash " + (good ? "good" : "bad");
    setTimeout(function () { flash.className = "screen-flash"; }, 280);

    if (good && pointsEarned) {
      const pop = document.createElement("div");
      pop.className = "points-pop";
      pop.textContent = "+" + pointsEarned;
      pop.style.left = "50%";
      pop.style.top = "40%";
      pop.style.marginLeft = "-20px";
      $("gameArea").appendChild(pop);
      setTimeout(function () { pop.remove(); }, 850);
    }

    if (good) {
      const scoreStat = scoreEl.parentElement;
      scoreStat.classList.add("bump");
      setTimeout(function () { scoreStat.classList.remove("bump"); }, 350);
    }
  }

  function checkAnswer(direction) {
    if (!gameActive) return;
    const item = deck[currentIndex];
    let correct = false;
    if (direction === "up" && item.sound === "iz") correct = true;
    if (direction === "left" && item.sound === "s") correct = true;
    if (direction === "right" && item.sound === "z") correct = true;

    totalAnswered++;
    let pointsEarned = 0;
    if (correct) {
      pointsEarned = 10 + combo * 2;
      score += pointsEarned;
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      correctCount++;
      playCorrectSound();
      showFeedback(true, direction, pointsEarned);
    } else {
      combo = 0;
      playWrongSound();
      showFeedback(false, direction, 0);
    }

    scoreEl.textContent = String(score);
    comboEl.textContent = combo + "x";

    const tx = direction === "left" ? -400 : direction === "right" ? 400 : 0;
    const ty = direction === "up" ? -400 : 0;
    const rot = direction === "left" ? -30 : direction === "right" ? 30 : 0;
    card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
    card.style.transform = "translate(" + tx + "px, " + ty + "px) rotate(" + rot + "deg)";
    card.style.opacity = "0";

    setTimeout(function () {
      card.style.transition = "none";
      currentIndex++;
      showCard();
    }, 380);
  }

  function onStart(e) {
    if (!gameActive) return;
    isDragging = true;
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    card.style.transition = "none";
  }

  function onMove(e) {
    if (!isDragging || !gameActive) return;
    e.preventDefault();
    const point = e.touches ? e.touches[0] : e;
    cardX = point.clientX - startX;
    cardY = point.clientY - startY;
    card.style.transform = "translate(" + cardX + "px, " + cardY + "px) rotate(" + (cardX * 0.08) + "deg)";
  }

  function onEnd() {
    if (!isDragging || !gameActive) return;
    isDragging = false;
    const threshold = 80;
    const absX = Math.abs(cardX);
    const absY = Math.abs(cardY);
    if (absY > absX && cardY < -threshold) {
      checkAnswer("up");
    } else if (absX > absY && cardX < -threshold) {
      checkAnswer("left");
    } else if (absX > absY && cardX > threshold) {
      checkAnswer("right");
    } else {
      card.style.transition = "transform 0.25s ease";
      card.style.transform = "translate(0,0) rotate(0deg)";
      cardX = 0;
      cardY = 0;
    }
  }

  function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    const accuracy = totalAnswered ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const usedTime = 90 - timeLeft;

    $("finalScore").textContent = String(score);
    $("finalAcc").textContent = accuracy + "%";
    $("finalCombo").textContent = bestCombo + "x";
    $("finalTime").textContent = usedTime + "s";
    $("endTitle").textContent =
      accuracy >= 90 ? "Excellent!" :
      accuracy >= 70 ? "Great job!" :
      accuracy >= 50 ? "Good effort!" : "Keep practicing!";
    $("endSummary").textContent =
      "You got " + correctCount + " of " + totalAnswered + " correct.";

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

    show("end");
  }

  function initGame() {
    deck = shuffle(WORDS);
    currentIndex = 0;
    score = 0;
    combo = 0;
    bestCombo = 0;
    correctCount = 0;
    totalAnswered = 0;
    timeLeft = 90;
    gameActive = true;
    scoreEl.textContent = "0";
    timerEl.textContent = "90";
    comboEl.textContent = "0x";
    show("game");
    updateProgress();
    showCard();
    startTimer();
  }

  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.classList.toggle("dark-mode", dark);
    if (themeBtn) themeBtn.textContent = dark ? "☀️" : "🌙";
    try {
      localStorage.setItem("pssm-theme", dark ? "dark" : "light");
    } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
    });
  }
  try {
    applyTheme(localStorage.getItem("pssm-theme") === "dark");
  } catch (e) {
    applyTheme(false);
  }

  $("startBtn").addEventListener("click", function () {
    getAudioCtx();
    initGame();
  });
  $("playAgainBtn").addEventListener("click", initGame);

  card.addEventListener("mousedown", onStart);
  card.addEventListener("touchstart", onStart, { passive: false });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchend", onEnd);

  window.addEventListener("keydown", function (e) {
    if (!gameActive) return;
    if (e.key === "ArrowUp") checkAnswer("up");
    if (e.key === "ArrowLeft") checkAnswer("left");
    if (e.key === "ArrowRight") checkAnswer("right");
  });
})();
