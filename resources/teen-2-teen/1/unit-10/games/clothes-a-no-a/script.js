/* =========================================================
   A / NO A — CLOTHES ARTICLE SWIPE
   Teen2Teen 1 · Unit 10 | Mr. Sheyhaki
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "sweater", word: "sweater", answer: "a", label: "a sweater", image: CDN + "q049292_swer.png", audio: CDN + "d159367_a_swer.mp3" },
    { id: "skirt", word: "skirt", answer: "a", label: "a skirt", image: CDN + "a444189_st.png", audio: CDN + "b668114_st.mp3" },
    { id: "shorts", word: "shorts", answer: "noa", label: "shorts", image: CDN + "p155179_shorts.png", audio: CDN + "b61351_shorts_2.mp3" },
    { id: "shoes", word: "shoes", answer: "noa", label: "shoes", image: CDN + "i80933_shoes.png", audio: CDN + "y529847_shoes_3.mp3" },
    { id: "shirt", word: "shirt", answer: "a", label: "a shirt", image: CDN + "y409033_shirt.png", audio: CDN + "f1066_a_shirt.mp3" },
    { id: "pants", word: "pants", answer: "noa", label: "pants", image: CDN + "b63746_pants.png", audio: CDN + "e126543_pants_2.mp3" },
    { id: "jeans", word: "jeans", answer: "noa", label: "jeans", image: CDN + "s86734_jeans.png", audio: CDN + "p371082_jeans_3.mp3" },
    { id: "jacket", word: "jacket", answer: "a", label: "a jacket", image: CDN + "n731967_jacket.png", audio: CDN + "c58647_a_jacket.mp3" },
    { id: "dress", word: "dress", answer: "a", label: "a dress", image: CDN + "e35407_dress.png", audio: CDN + "m241908_a_dress.mp3" },
    { id: "blouse", word: "blouse", answer: "a", label: "a blouse", image: CDN + "d598847_blouse.png", audio: CDN + "m041818_a_blouse.mp3" }
  ];

  var TOTAL = ITEMS.length;
  var START_TIME = 60;
  var GAME_ID = "t2t1-u10-clothes-a-no-a";

  var DIRECTION_TO_ANSWER = {
    left: "noa",
    right: "a"
  };

  function $(id) {
    return document.getElementById(id);
  }

  var startOverlay = $("startOverlay");
  var endModal = $("endModal");
  var startBtn = $("startBtn");
  var playAgainBtn = $("playAgain");
  var swipeCard = $("swipeCard");
  var wordEl = $("word");
  var cardImg = $("cardImg");
  var scoreEl = $("score");
  var timerEl = $("timer");
  var comboEl = $("combo");
  var progressFill = $("progressFill");
  var feedbackEl = $("feedback");
  var statusEl = $("status");
  var targetNoA = $("targetNoA");
  var targetA = $("targetA");

  if (!startBtn || !swipeCard || !wordEl) {
    console.error("A/No A: required elements missing.");
    return;
  }

  var state = null;
  var currentAudio = null;

  function playItemAudio(src) {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (!src) return;
      currentAudio = new Audio(src);
      currentAudio.volume = 1;
      currentAudio.play().catch(function () {});
    } catch (e) {}
  }

  function sfx(name) {
    if (!window.LASfx) return;
    try {
      if (name === "correct" && LASfx.correct) LASfx.correct();
      else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
      else if (name === "win" && LASfx.win) LASfx.win();
    } catch (_) {}
  }

  function shuffle(array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function startGame() {
    if (state && state.timer) {
      clearInterval(state.timer);
    }

    state = {
      score: 0,
      combo: 0,
      bestCombo: 0,
      correct: 0,
      attempts: 0,
      time: START_TIME,
      done: false,
      currentIndex: 0,
      questions: shuffle(ITEMS),
      timer: null,
      dragging: false,
      answering: false,
      startX: 0,
      startY: 0
    };

    if (startOverlay) startOverlay.classList.add("aa-hidden");
    if (endModal) endModal.classList.add("aa-hidden");
    if (window.LAFinish && LAFinish.hide) {
      try { LAFinish.hide(); } catch (e) {}
    }

    swipeCard.style.pointerEvents = "auto";
    resetCard();
    updateHUD();

    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (e) {}
    }

    state.timer = setInterval(function () {
      tick();
    }, 1000);

    if (statusEl) {
      statusEl.textContent = "Swipe left for no a, right for a.";
    }
  }

  function resetCard() {
    if (!state || state.done) return;

    var item = state.questions[state.currentIndex];
    if (!item) {
      finish(true);
      return;
    }

    /* lowercase vocabulary */
    wordEl.textContent = item.word.toLowerCase();
    if (cardImg) {
      cardImg.src = item.image || "";
      cardImg.alt = item.word;
    }

    swipeCard.className = "aa-card";
    swipeCard.style.transition = "none";
    swipeCard.style.transform = "translate3d(0,0,0) rotate(0deg)";
    swipeCard.style.opacity = "1";
    swipeCard.style.pointerEvents = "auto";

    clearTargetHighlights();

    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "aa-feedback";
    }

    swipeCard.animate(
      [
        { opacity: 0, transform: "translate3d(0,28px,0) scale(.94)" },
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
      ],
      { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
  }

  function onPointerDown(e) {
    if (!state || state.done || state.dragging || state.answering) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    state.dragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    swipeCard.classList.add("dragging");

    try {
      swipeCard.setPointerCapture(e.pointerId);
    } catch (err) {}

    if (statusEl) statusEl.textContent = "Move left or right.";
  }

  function onPointerMove(e) {
    if (!state || !state.dragging || state.done) return;
    e.preventDefault();

    var dx = e.clientX - state.startX;
    var dy = e.clientY - state.startY;
    var rotation = Math.max(-15, Math.min(15, dx * 0.05));

    swipeCard.style.transform =
      "translate3d(" + dx + "px," + dy + "px,0) rotate(" + rotation + "deg)";

    highlightDirection(dx, dy);
  }

  function onPointerUp(e) {
    if (!state || !state.dragging || state.done) return;
    e.preventDefault();

    state.dragging = false;
    var dx = e.clientX - state.startX;
    var dy = e.clientY - state.startY;

    swipeCard.classList.remove("dragging");
    try {
      swipeCard.releasePointerCapture(e.pointerId);
    } catch (err) {}

    clearTargetHighlights();

    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 45) {
      returnCard();
      if (statusEl) statusEl.textContent = "Swipe left or right.";
      return;
    }

    var direction = getDirection(dx, dy);
    if (direction === "up" || direction === "down") {
      returnCard();
      if (statusEl) statusEl.textContent = "Swipe left or right only.";
      return;
    }

    attemptSwipe(direction);
  }

  function onPointerCancel() {
    if (!state || !state.dragging) return;
    state.dragging = false;
    swipeCard.classList.remove("dragging");
    clearTargetHighlights();
    returnCard();
  }

  function getDirection(dx, dy) {
    if (Math.abs(dy) > Math.abs(dx)) {
      return dy < 0 ? "up" : "down";
    }
    return dx < 0 ? "left" : "right";
  }

  function highlightDirection(dx, dy) {
    clearTargetHighlights();
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 30) return;

    var direction = getDirection(dx, dy);
    if (direction !== "left" && direction !== "right") return;

    var target = getTargetForDirection(direction);
    if (target) target.classList.add("active");

    if (direction === "left") {
      swipeCard.classList.add("swiping-left");
    } else if (direction === "right") {
      swipeCard.classList.add("swiping-right");
    }
  }

  function clearTargetHighlights() {
    if (targetNoA) {
      targetNoA.classList.remove("active", "correct", "wrong");
    }
    if (targetA) {
      targetA.classList.remove("active", "correct", "wrong");
    }
    swipeCard.classList.remove("swiping-left", "swiping-right");
  }

  function getTargetForDirection(direction) {
    if (direction === "left") return targetNoA;
    if (direction === "right") return targetA;
    return null;
  }

  function attemptSwipe(direction) {
    if (!state || state.done || state.answering) return;

    state.attempts++;
    var item = state.questions[state.currentIndex];
    if (!item) return;

    var selected = DIRECTION_TO_ANSWER[direction] || null;

    if (selected === item.answer) {
      handleCorrect(direction, item);
    } else {
      handleWrong(direction);
    }
  }

  function handleCorrect(direction, item) {
    state.correct++;
    state.combo++;
    if (state.combo > state.bestCombo) state.bestCombo = state.combo;

    var points = 15 + Math.max(0, state.combo - 1) * 3;
    state.score += points;
    state.answering = true;

    var target = getTargetForDirection(direction);
    if (target) target.classList.add("correct");

    sfx("correct");
    playItemAudio(item.audio);

    if (feedbackEl) {
      feedbackEl.textContent = "+" + points + "  " + item.label;
      feedbackEl.className = "aa-feedback show correct";
    }
    if (statusEl) statusEl.textContent = "Correct! " + item.label;

    updateHUD();
    swipeCard.classList.add("exit-" + direction);

    setTimeout(function () {
      if (!state || state.done) return;
      state.currentIndex++;
      if (state.currentIndex >= TOTAL) {
        finish(true);
        return;
      }
      state.answering = false;
      resetCard();
    }, 520);
  }

  function handleWrong(direction) {
    state.combo = 0;

    var target = getTargetForDirection(direction);
    if (target) target.classList.add("wrong");

    sfx("wrong");

    if (feedbackEl) {
      feedbackEl.textContent = "Try again!";
      feedbackEl.className = "aa-feedback show wrong";
    }
    if (statusEl) statusEl.textContent = "Wrong — try the other side.";

    updateHUD();
    returnCard();
  }

  function returnCard() {
    swipeCard.style.transition = "transform .42s cubic-bezier(0.22, 1, 0.36, 1)";
    swipeCard.style.transform = "translate3d(0,0,0) rotate(0deg)";
    setTimeout(function () {
      swipeCard.style.transition = "";
      clearTargetHighlights();
    }, 420);
  }

  function tick() {
    if (!state || state.done) return;
    state.time--;
    updateHUD();
    if (state.time <= 0) finish(false);
  }

  function updateHUD() {
    if (!state) return;
    if (scoreEl) scoreEl.textContent = state.score;
    if (comboEl) comboEl.textContent = state.combo + "x";
    if (timerEl) timerEl.textContent = Math.max(0, state.time);
    if (progressFill) {
      progressFill.style.width = (state.correct / TOTAL * 100) + "%";
    }
  }

  function finish(won) {
    if (!state || state.done) return;
    state.done = true;
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    swipeCard.style.pointerEvents = "none";

    var accuracy =
      state.attempts > 0
        ? Math.round((state.correct / state.attempts) * 100)
        : 0;

    var finalScore = $("finalScore");
    var accuracyEl = $("accuracy");
    var bestComboEl = $("bestCombo");
    var endTitle = $("endTitle");
    var endMessage = $("endMessage");
    var resultIcon = $("resultIcon");

    if (finalScore) finalScore.textContent = state.score;
    if (accuracyEl) accuracyEl.textContent = accuracy + "%";
    if (bestComboEl) bestComboEl.textContent = state.bestCombo + "x";

    if (endTitle) endTitle.textContent = won ? "Excellent!" : "Time's up!";
    if (endMessage) {
      endMessage.textContent = won
        ? "You sorted all " + TOTAL + " clothes words."
        : "You got " + state.correct + " of " + TOTAL + ".";
    }
    if (resultIcon) resultIcon.textContent = won ? "🏆" : "⏱️";

    if (won) sfx("win");

    if (statusEl) {
      statusEl.textContent = won ? "Game complete." : "Time is up.";
    }

    if (window.LAFinish && LAFinish.show) {
      var timeMs = 0;
      try {
        timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      } catch (e) {}

      try {
        LAFinish.show({
          gameId: GAME_ID,
          score: state.correct,
          total: TOTAL,
          accuracy: accuracy,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            if (endModal) endModal.classList.add("aa-hidden");
            if (startOverlay) startOverlay.classList.remove("aa-hidden");
          },
          backHref: "../",
          save: true
        });
        return;
      } catch (e) {}
    }

    try {
      if (window.LAStars) {
        window.LAStars.recordPlay(GAME_ID);
        window.LAStars.saveFromAccuracy(GAME_ID, accuracy);
      }
    } catch (e) {}

    if (endModal) endModal.classList.remove("aa-hidden");
  }

  swipeCard.addEventListener("keydown", function (e) {
    if (!state || state.done || state.answering) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      attemptSwipe("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      attemptSwipe("right");
    }
  });

  startBtn.addEventListener("click", startGame);
  if (playAgainBtn) playAgainBtn.addEventListener("click", startGame);

  swipeCard.addEventListener("pointerdown", onPointerDown);
  swipeCard.addEventListener("pointermove", onPointerMove);
  swipeCard.addEventListener("pointerup", onPointerUp);
  swipeCard.addEventListener("pointercancel", onPointerCancel);
});
