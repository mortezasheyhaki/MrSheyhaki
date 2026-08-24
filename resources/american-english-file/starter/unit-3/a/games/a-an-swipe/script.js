document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const WORDS = [
    { word: "apple", article: "an" },
    { word: "apartment", article: "an" },
    { word: "egg", article: "an" },
    { word: "email", article: "an" },
    { word: "English", article: "an" },
    { word: "ice cream", article: "an" },
    { word: "insect", article: "an" },
    { word: "orange", article: "an" },
    { word: "octopus", article: "an" },
    { word: "umbrella", article: "an" },
    { word: "uncle", article: "an" },

    { word: "phone", article: "a" },
    { word: "newspaper", article: "a" },
    { word: "charger", article: "a" },
    { word: "memory card", article: "a" },
    { word: "wallet", article: "a" },
    { word: "watch", article: "a" },
    { word: "pen", article: "a" },
    { word: "pencil", article: "a" },
    { word: "notebook", article: "a" },
    { word: "change purse", article: "a" },
    { word: "pencil case", article: "a" },
    { word: "bank card", article: "a" }
  ];

  const TOTAL = WORDS.length;
  const START_TIME = 60;

  const $ = id => document.getElementById(id);

  const startOverlay = $("startOverlay");
  const endModal = $("endModal");
  const pauseOverlay = $("pauseOverlay");
  const startBtn = $("startBtn");
  const playAgain = $("playAgain");
  const resumeBtn = $("resumeBtn");
  const card = $("swipeCard");
  const wordEl = $("word");
  const scoreEl = $("score");
  const timerEl = $("timer");
  const progress = $("progressFill");
  const counter = $("counter");
  const feedback = $("feedback");
  const status = $("status");
  const targetA = $("targetA");
  const targetAn = $("targetAn");
  const accuracyLive = $("accuracyLive");
  const bestComboLive = $("bestComboLive");
  const soundBtn = $("soundBtn");
  const soundIcon = $("soundIcon");
  const soundState = $("soundState");
  const pauseBtn = $("pauseBtn");
  const stickKnob = $("stickKnob");

  let state = null;
  let soundOn = true;
  let paused = false;

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function speak(text) {
    if (!soundOn || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1.03;
      speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function startGame() {
    if (window.LAStars) window.LAStars.recordPlay("aef-a-an-swipe");
    if (state?.timer) clearInterval(state.timer);

    state = {
      questions: shuffle(WORDS),
      index: 0,
      score: 0,
      correct: 0,
      attempts: 0,
      combo: 0,
      bestCombo: 0,
      time: START_TIME,
      dragging: false,
      answering: false,
      startX: 0,
      startY: 0,
      timer: null,
      done: false
    };

    paused = false;
    startOverlay.classList.add("hidden");
    endModal.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    card.style.pointerEvents = "auto";

    showCard();
    updateHUD();

    state.timer = setInterval(() => {
      if (!state || state.done || paused) return;
      state.time--;
      updateHUD();
      if (state.time <= 0) finish(false);
    }, 1000);
  }

  function showCard() {
    const item = state.questions[state.index];

    if (!item) {
      finish(true);
      return;
    }

    wordEl.textContent = item.word;
    card.className = "swipe-card";
    card.style.transition = "none";
    card.style.transform = "translate3d(0,0,0) rotate(0deg)";
    card.style.opacity = "1";
    card.style.pointerEvents = "auto";

    clearHighlights();
    feedback.className = "feedback";
    feedback.textContent = "";

    card.animate(
      [
        { opacity: 0, transform: "translate3d(0,25px,0) scale(.94)" },
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
      ],
      { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" }
    );
  }

  function getDirection(dx, dy) {
    // Only left / right — ignore pure vertical
    if (Math.abs(dx) < 20 && Math.abs(dy) > Math.abs(dx) * 1.5) return null;
    return dx < 0 ? "left" : "right";
  }

  function targetFor(direction) {
    if (direction === "left") return targetA;
    if (direction === "right") return targetAn;
    return null;
  }

  function highlight(dx) {
    clearHighlights();
    if (Math.abs(dx) < 25) return;

    const direction = dx < 0 ? "left" : "right";
    const target = targetFor(direction);
    if (target) target.classList.add("active");

    card.classList.toggle("swiping-left", direction === "left");
    card.classList.toggle("swiping-right", direction === "right");
  }

  function clearHighlights() {
    targetA.classList.remove("active", "correct", "wrong");
    targetAn.classList.remove("active", "correct", "wrong");
    card.classList.remove("swiping-left", "swiping-right");
  }

  function returnCard() {
    card.style.transition = "transform .4s cubic-bezier(.22,1,.36,1)";
    card.style.transform = "translate3d(0,0,0) rotate(0deg)";
    setTimeout(() => {
      if (!state || state.done) return;
      card.style.transition = "";
      clearHighlights();
    }, 400);
  }

  function attempt(direction) {
    if (!state || state.done || state.answering || paused) return;

    if (direction !== "left" && direction !== "right") {
      returnCard();
      return;
    }

    state.attempts++;

    const item = state.questions[state.index];
    const selected = direction === "left" ? "a" : "an";

    if (selected === item.article) {
      handleCorrect(direction, item);
    } else {
      handleWrong(direction);
    }
  }

  function handleCorrect(direction, item) {
    state.answering = true;
    state.correct++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);

    const points = 10 + Math.max(0, state.combo - 1) * 2;
    state.score += points;

    const target = targetFor(direction);
    if (target) target.classList.add("correct");

    feedback.textContent = `+${points}`;
    feedback.className = "feedback show correct";
    status.textContent = `Correct: ${item.article} ${item.word}.`;

    speak(`${item.article} ${item.word}`);
    updateHUD();

    card.classList.add(`exit-${direction}`);

    setTimeout(() => {
      if (!state || state.done) return;

      state.index++;

      if (state.index >= TOTAL) {
        finish(true);
        return;
      }

      state.answering = false;
      showCard();
    }, 450);
  }

  function handleWrong(direction) {
    state.combo = 0;

    const target = targetFor(direction);
    if (target) target.classList.add("wrong");

    feedback.textContent = "Try again!";
    feedback.className = "feedback show wrong";
    status.textContent = "Wrong article. Try again.";

    speak("Try again");
    updateHUD();

    returnCard();
  }

  function updateHUD() {
    if (!state) return;

    scoreEl.textContent = state.score;
    timerEl.textContent = formatTime(Math.max(0, state.time));
    progress.style.width = `${(state.index / TOTAL) * 100}%`;
    counter.textContent = `${state.index} / ${TOTAL}`;

    const acc = state.attempts
      ? Math.round((state.correct / state.attempts) * 100)
      : 100;
    accuracyLive.textContent = `${acc}%`;
    bestComboLive.textContent = state.bestCombo;
  }

  function finish(won) {
    if (!state || state.done) return;

    state.done = true;
    if (state.timer) clearInterval(state.timer);

    card.style.pointerEvents = "none";

    const accuracy = state.attempts
      ? Math.round((state.correct / state.attempts) * 100)
      : 0;

    $("finalScore").textContent = state.score;
    $("accuracy").textContent = `${accuracy}%`;
    if (window.LAStars) {
      var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
      if (won && state.correct >= Math.floor(TOTAL * 0.5) && stars < 1) stars = 1;
      if (won && accuracy >= 60) stars = Math.max(stars, 2);
      if (won && accuracy >= 85) stars = 3;
      window.LAStars.save("aef-a-an-swipe", stars);
    }
    $("bestCombo").textContent = state.bestCombo;
    $("endTitle").textContent = won ? "Excellent!" : "Time's up!";
    $("endMessage").textContent = won
      ? `You matched all ${TOTAL} words.`
      : `You matched ${state.correct} of ${TOTAL}.`;
    $("resultIcon").textContent = won ? "🏆" : "⏱";

    endModal.classList.remove("hidden");
  }

  /* ---- Card drag ---- */
  function onPointerDown(e) {
    if (!state || state.done || state.dragging || state.answering || paused) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    state.dragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    card.classList.add("dragging");

    try { card.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onPointerMove(e) {
    if (!state?.dragging || state.done || paused) return;

    e.preventDefault();

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    // Limit vertical drift a bit for visual feel
    const clampedDy = Math.max(-40, Math.min(40, dy * 0.35));
    const rotation = Math.max(-14, Math.min(14, dx * 0.045));

    card.style.transform = `translate3d(${dx}px,${clampedDy}px,0) rotate(${rotation}deg)`;
    highlight(dx);
  }

  function onPointerUp(e) {
    if (!state?.dragging || state.done) return;

    e.preventDefault();
    state.dragging = false;
    card.classList.remove("dragging");

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    try { card.releasePointerCapture(e.pointerId); } catch (_) {}

    clearHighlights();

    if (Math.abs(dx) < 55) {
      returnCard();
      return;
    }

    attempt(getDirection(dx, dy));
  }

  function onPointerCancel() {
    if (!state?.dragging) return;
    state.dragging = false;
    card.classList.remove("dragging");
    clearHighlights();
    returnCard();
  }

  card.addEventListener("pointerdown", onPointerDown);
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerCancel);

  /* ---- Target buttons ---- */
  targetA.addEventListener("click", () => {
    if (!state || state.done || state.answering || paused) return;
    attempt("left");
  });
  targetAn.addEventListener("click", () => {
    if (!state || state.done || state.answering || paused) return;
    attempt("right");
  });

  /* ---- Virtual stick (left / right only) ---- */
  let stickDragging = false;
  let stickOrigin = { x: 0, y: 0 };

  function resetStick() {
    stickKnob.style.transform = "translate(0,0)";
    stickKnob.classList.remove("dragging");
  }

  function onStickDown(e) {
    if (!state || state.done || state.answering || paused) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    stickDragging = true;
    stickOrigin = { x: e.clientX, y: e.clientY };
    stickKnob.classList.add("dragging");
    try { stickKnob.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onStickMove(e) {
    if (!stickDragging) return;
    e.preventDefault();
    const dx = e.clientX - stickOrigin.x;
    // Only horizontal movement
    const max = 42;
    const clampedX = Math.max(-max, Math.min(max, dx));
    stickKnob.style.transform = `translate(${clampedX}px, 0)`;

    // Preview highlight on card
    if (Math.abs(clampedX) > 12) {
      highlight(clampedX);
    } else {
      clearHighlights();
    }
  }

  function onStickUp(e) {
    if (!stickDragging) return;
    e.preventDefault();
    stickDragging = false;

    const dx = e.clientX - stickOrigin.x;
    try { stickKnob.releasePointerCapture(e.pointerId); } catch (_) {}

    clearHighlights();
    resetStick();

    if (Math.abs(dx) < 28) return;
    attempt(dx < 0 ? "left" : "right");
  }

  function onStickCancel() {
    stickDragging = false;
    clearHighlights();
    resetStick();
  }

  stickKnob.addEventListener("pointerdown", onStickDown);
  stickKnob.addEventListener("pointermove", onStickMove);
  stickKnob.addEventListener("pointerup", onStickUp);
  stickKnob.addEventListener("pointercancel", onStickCancel);

  /* ---- Keyboard ---- */
  document.addEventListener("keydown", e => {
    if (!state || state.done || state.answering || paused) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      attempt("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      attempt("right");
    }
  });

  /* ---- Sound toggle ---- */
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? "🔊" : "🔇";
    soundState.textContent = soundOn ? "ON" : "OFF";
    if (!soundOn && "speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  });

  /* ---- Pause ---- */
  pauseBtn.addEventListener("click", () => {
    if (!state || state.done) return;
    paused = true;
    pauseOverlay.classList.remove("hidden");
  });

  resumeBtn.addEventListener("click", () => {
    paused = false;
    pauseOverlay.classList.add("hidden");
  });

  startBtn.addEventListener("click", startGame);
  playAgain.addEventListener("click", startGame);
});
