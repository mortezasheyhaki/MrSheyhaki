/* =========================================================
   FOOD VERB MATCH — SWIPE VERSION
   Unit 5A | Mr. Sheyhaki
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     DATA
     ======================================================= */

  const PAIRS = [
    ["eat", "fish"],
    ["eat", "meat"],
    ["eat", "pasta"],
    ["eat", "rice"],
    ["eat", "eggs"],
    ["eat", "yogurt"],
    ["eat", "vegetables"],
    ["eat", "potatoes"],
    ["eat", "salad"],
    ["eat", "fruit"],
    ["eat", "bread"],
    ["eat", "butter"],
    ["eat", "cheese"],
    ["eat", "sugar"],
    ["eat", "a sandwich"],
    ["eat", "cereal"],
    ["eat", "chocolate"],

    ["drink", "coffee"],
    ["drink", "tea"],
    ["drink", "milk"],
    ["drink", "water"],
    ["drink", "orange juice"],

    ["have", "breakfast"],
    ["have", "lunch"],
    ["have", "dinner"]
  ];

  const TOTAL = PAIRS.length;
  const START_TIME = 90;

  /*
    Swipe directions:

      UP    = HAVE
      LEFT  = DRINK
      RIGHT = EAT
  */

  const DIRECTION_TO_VERB = {
    up: "have",
    left: "drink",
    right: "eat"
  };


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const $ = (id) => document.getElementById(id);

  const startOverlay = $("startOverlay");
  const endModal = $("endModal");

  const startBtn = $("startBtn");
  const playAgainBtn = $("playAgain");

  const swipeCard = $("swipeCard");
  const wordEl = $("word");

  const scoreEl = $("score");
  const timerEl = $("timer");
  const comboEl = $("combo");

  const progressFill = $("progressFill");

  const feedbackEl = $("feedback");
  const statusEl = $("status");

  const targetHave = $("targetHave");
  const targetDrink = $("targetDrink");
  const targetEat = $("targetEat");

  const themeBtn = $("themeBtn");


  /* =======================================================
     STATE
     ======================================================= */

  let state = null;


  /* =======================================================
     SHUFFLE
     ======================================================= */

  function shuffle(array) {
    const arr = array.slice();

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }


  /* =======================================================
     START GAME
     ======================================================= */

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

      questions: shuffle(PAIRS),

      timer: null,

      dragging: false,

      startX: 0,
      startY: 0,

      currentX: 0,
      currentY: 0
    };

    startOverlay.classList.add("hidden");
    endModal.classList.add("hidden");

    resetCard();

    updateHud();

    state.timer = setInterval(tick, 1000);

    statusEl.textContent =
      "Game started. Swipe the word to the correct verb.";
  }


  /* =======================================================
     RESET CARD
     ======================================================= */

  function resetCard() {

    if (!state || state.done) return;

    const pair = state.questions[state.currentIndex];

    if (!pair) {
      finish(true);
      return;
    }

    const item = pair[1];

    wordEl.textContent = item.toUpperCase();

    swipeCard.className = "swipe-card";

    swipeCard.style.transform = "translate3d(0, 0, 0)";
    swipeCard.style.opacity = "1";

    clearTargetHighlights();

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    /*
      Small entrance animation.
    */

    swipeCard.animate(
      [
        {
          opacity: 0,
          transform: "translate3d(0, 25px, 0) scale(.95)"
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)"
        }
      ],
      {
        duration: 220,
        easing: "ease-out"
      }
    );
  }


  /* =======================================================
     POINTER DOWN
     ======================================================= */

  function onPointerDown(e) {

    if (!state || state.done || state.dragging) {
      return;
    }

    /*
      Only accept primary mouse button.
    */

    if (e.pointerType === "mouse" && e.button !== 0) {
      return;
    }

    e.preventDefault();

    state.dragging = true;

    state.startX = e.clientX;
    state.startY = e.clientY;

    state.currentX = e.clientX;
    state.currentY = e.clientY;

    swipeCard.classList.add("dragging");

    try {
      swipeCard.setPointerCapture(e.pointerId);
    } catch (_) {}

    statusEl.textContent =
      "Dragging " + wordEl.textContent;
  }


  /* =======================================================
     POINTER MOVE
     ======================================================= */

  function onPointerMove(e) {

    if (!state || !state.dragging || state.done) {
      return;
    }

    e.preventDefault();

    state.currentX = e.clientX;
    state.currentY = e.clientY;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    /*
      Move the card with the finger.
    */

    const rotation = dx * 0.06;

    swipeCard.style.transform =
      "translate3d(" +
      dx +
      "px, " +
      dy +
      "px, 0) rotate(" +
      rotation +
      "deg)";

    /*
      Show which target the user is approaching.
    */

    highlightDirection(dx, dy);
  }


  /* =======================================================
     POINTER UP
     ======================================================= */

  function onPointerUp(e) {

    if (!state || !state.dragging || state.done) {
      return;
    }

    e.preventDefault();

    state.dragging = false;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    swipeCard.classList.remove("dragging");

    try {
      swipeCard.releasePointerCapture(e.pointerId);
    } catch (_) {}

    clearTargetHighlights();

    /*
      Ignore tiny movements.

      This means a simple tap doesn't count
      as an incorrect swipe.
    */

    const distance = Math.sqrt(
      dx * dx + dy * dy
    );

    if (distance < 45) {

      returnCard();

      statusEl.textContent =
        "Swipe the word left, right, or up.";

      return;
    }

    const direction = getDirection(dx, dy);

    attemptSwipe(direction);
  }


  /* =======================================================
     GET SWIPE DIRECTION
     ======================================================= */

  function getDirection(dx, dy) {

    /*
      If vertical movement is stronger,
      it's either UP or DOWN.

      We don't have a DOWN answer, so
      DOWN will simply be treated as wrong.
    */

    if (Math.abs(dy) > Math.abs(dx)) {

      if (dy < 0) {
        return "up";
      }

      return "down";
    }

    /*
      Horizontal movement.
    */

    if (dx < 0) {
      return "left";
    }

    return "right";
  }


  /* =======================================================
     HIGHLIGHT TARGET
     ======================================================= */

  function highlightDirection(dx, dy) {

    clearTargetHighlights();

    const distance = Math.sqrt(
      dx * dx + dy * dy
    );

    if (distance < 35) {
      return;
    }

    const direction = getDirection(dx, dy);

    if (direction === "up") {
      targetHave.classList.add("active");
      swipeCard.classList.add("swiping-up");
    }

    else if (direction === "left") {
      targetDrink.classList.add("active");
      swipeCard.classList.add("swiping-left");
    }

    else if (direction === "right") {
      targetEat.classList.add("active");
      swipeCard.classList.add("swiping-right");
    }
  }


  /* =======================================================
     CLEAR TARGET HIGHLIGHTS
     ======================================================= */

  function clearTargetHighlights() {

    targetHave.classList.remove("active");
    targetDrink.classList.remove("active");
    targetEat.classList.remove("active");

    swipeCard.classList.remove("swiping-up");
    swipeCard.classList.remove("swiping-left");
    swipeCard.classList.remove("swiping-right");
  }


  /* =======================================================
     ATTEMPT SWIPE
     ======================================================= */

  function attemptSwipe(direction) {

    if (!state || state.done) {
      return;
    }

    state.attempts++;

    const pair =
      state.questions[state.currentIndex];

    if (!pair) {
      return;
    }

    const correctVerb = pair[0];

    const selectedVerb =
      DIRECTION_TO_VERB[direction] || null;

    const isCorrect =
      selectedVerb === correctVerb;


    /* -------------------------------------------------------
       CORRECT
       ------------------------------------------------------- */

    if (isCorrect) {

      handleCorrect(direction);

      return;
    }


    /* -------------------------------------------------------
       WRONG
       ------------------------------------------------------- */

    handleWrong(direction, correctVerb);
  }


  /* =======================================================
     CORRECT ANSWER
     ======================================================= */

  function handleCorrect(direction) {

    state.correct++;

    state.combo++;

    state.bestCombo = Math.max(
      state.bestCombo,
      state.combo
    );

    /*
      Base points:
      15 points

      Combo bonus:
      +3 for each combo after the first.
    */

    const points =
      15 +
      Math.max(0, state.combo - 1) * 3;

    state.score += points;


    /*
      Highlight correct target.
    */

    const target =
      getTargetForDirection(direction);

    if (target) {
      target.classList.add("correct");
    }


    /*
      Feedback.
    */

    feedbackEl.textContent =
      "+" + points;

    feedbackEl.className =
      "feedback show correct";


    statusEl.textContent =
      "Correct! " +
      wordEl.textContent +
      " goes with " +
      DIRECTION_TO_VERB[direction] +
      ".";


    updateHud();


    /*
      Send card away in the correct direction.
    */

    swipeCard.classList.add(
      "exit-" + direction
    );


    /*
      Move to next question.
    */

    setTimeout(() => {

      if (!state || state.done) {
        return;
      }

      state.currentIndex++;

      if (state.currentIndex >= TOTAL) {

        finish(true);

        return;
      }

      resetCard();

    }, 330);
  }


  /* =======================================================
     WRONG ANSWER
     ======================================================= */

  function handleWrong(direction, correctVerb) {

    state.combo = 0;

    updateHud();


    /*
      Highlight the selected target red.
    */

    const selectedTarget =
      getTargetForDirection(direction);

    if (selectedTarget) {
      selectedTarget.classList.add("wrong");
    }


    /*
      Feedback.
    */

    feedbackEl.textContent =
      "Try again!";

    feedbackEl.className =
      "feedback show wrong";


    statusEl.textContent =
      "Wrong direction. Try again.";


    /*
      Return the card to the center.
    */

    returnCard();
  }


  /* =======================================================
     RETURN CARD
     ======================================================= */

  function returnCard() {

    swipeCard.classList.remove(
      "swiping-up",
      "swiping-left",
      "swiping-right"
    );

    swipeCard.style.transition =
      "transform 0.3s ease";

    swipeCard.style.transform =
      "translate3d(0, 0, 0) rotate(0deg)";

    setTimeout(() => {

      if (!swipeCard) {
        return;
      }

      swipeCard.style.transition = "";

      clearTargetHighlights();

    }, 320);
  }


  /* =======================================================
     GET TARGET
     ======================================================= */

  function getTargetForDirection(direction) {

    if (direction === "up") {
      return targetHave;
    }

    if (direction === "left") {
      return targetDrink;
    }

    if (direction === "right") {
      return targetEat;
    }

    return null;
  }


  /* =======================================================
     TIMER
     ======================================================= */

  function tick() {

    if (!state || state.done) {
      return;
    }

    state.time--;

    updateHud();

    if (state.time <= 0) {
      finish(false);
    }
  }


  /* =======================================================
     UPDATE HUD
     ======================================================= */

  function updateHud() {

    if (!state) {
      return;
    }

    scoreEl.textContent =
      state.score;

    comboEl.textContent =
      state.combo + "x";

    timerEl.textContent =
      Math.max(0, state.time);

    progressFill.style.width =
      (state.correct / TOTAL) * 100 + "%";
  }


  /* =======================================================
     FINISH GAME
     ======================================================= */

  function finish(won) {

    if (!state || state.done) {
      return;
    }

    state.done = true;

    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }

    swipeCard.style.pointerEvents = "none";

    /*
      Final results.
    */

    $("finalScore").textContent =
      state.score;

    const accuracy =
      state.attempts > 0
        ? Math.round(
            (state.correct / state.attempts) * 100
          )
        : 0;

    $("accuracy").textContent =
      accuracy + "%";

    $("bestCombo").textContent =
      state.bestCombo + "x";


    /*
      End message.
    */

    $("endTitle").textContent =
      won
        ? "Excellent!"
        : "Time's up!";

    $("endMessage").textContent =
      won
        ? "You matched all " +
          TOTAL +
          " food combinations."
        : "You matched " +
          state.correct +
          " of " +
          TOTAL +
          ".";

    $("resultIcon").textContent =
      won
        ? "🏆"
        : "⏱️";


    endModal.classList.remove("hidden");

    statusEl.textContent =
      won
        ? "Game complete."
        : "Time is up.";
  }


  /* =======================================================
     THEME
     ======================================================= */

  function applyTheme(dark) {

    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );

    if (themeBtn) {
      themeBtn.textContent =
        dark ? "☀️" : "🌙";
    }

    try {
      localStorage.setItem(
        "fvm-theme",
        dark ? "dark" : "light"
      );
    } catch (_) {}
  }


  /* =======================================================
     THEME BUTTON
     ======================================================= */

  if (themeBtn) {

    themeBtn.addEventListener(
      "click",
      function () {

        const isDark =
          document.documentElement.getAttribute(
            "data-theme"
          ) === "dark";

        applyTheme(!isDark);
      }
    );
  }


  /* =======================================================
     LOAD THEME
     ======================================================= */

  try {

    const savedTheme =
      localStorage.getItem("fvm-theme");

    applyTheme(savedTheme === "dark");

  } catch (_) {

    applyTheme(false);
  }


  /* =======================================================
     BUTTONS
     ======================================================= */

  startBtn.addEventListener(
    "click",
    startGame
  );

  playAgainBtn.addEventListener(
    "click",
    startGame
  );


  /* =======================================================
     POINTER EVENTS
     ======================================================= */

  swipeCard.addEventListener(
    "pointerdown",
    onPointerDown
  );

  swipeCard.addEventListener(
    "pointermove",
    onPointerMove
  );

  swipeCard.addEventListener(
    "pointerup",
    onPointerUp
  );

  swipeCard.addEventListener(
    "pointercancel",
    function () {

      if (!state || !state.dragging) {
        return;
      }

      state.dragging = false;

      swipeCard.classList.remove("dragging");

      returnCard();
    }
  );


  /* =======================================================
     KEYBOARD SUPPORT
     ======================================================= */

  swipeCard.addEventListener(
    "keydown",
    function (e) {

      if (!state || state.done) {
        return;
      }

      if (e.key === "ArrowUp") {

        e.preventDefault();
        attemptSwipe("up");

      }

      else if (e.key === "ArrowLeft") {

        e.preventDefault();
        attemptSwipe("left");

      }

      else if (e.key === "ArrowRight") {

        e.preventDefault();
        attemptSwipe("right");

      }
    }
  );


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  /*
    The game starts on the start screen.
    No timer runs until Start Game is pressed.
  */

  if (startOverlay) {
    startOverlay.classList.remove("hidden");
  }

})();
