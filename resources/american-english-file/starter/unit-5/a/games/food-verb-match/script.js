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
    SWIPE DIRECTIONS

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

      const j =
        Math.floor(Math.random() * (i + 1));

      [arr[i], arr[j]] =
        [arr[j], arr[i]];
    }

    return arr;
  }


  /* =======================================================
     START GAME
     ======================================================= */

  function startGame() {

    /*
      Clear previous timer.
    */

    if (state && state.timer) {
      clearInterval(state.timer);
    }


    /*
      Create fresh game state.
    */

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

      answering: false,

      startX: 0,

      startY: 0,

      currentX: 0,

      currentY: 0
    };


    /*
      Show game.
    */

    if (startOverlay) {
      startOverlay.classList.add("hidden");
    }

    if (endModal) {
      endModal.classList.add("hidden");
    }


    /*
      Make card playable again.
    */

    swipeCard.style.pointerEvents = "auto";

    swipeCard.classList.remove(
      "dragging",
      "exit-up",
      "exit-left",
      "exit-right",
      "swiping-up",
      "swiping-left",
      "swiping-right"
    );


    /*
      Reset card.
    */

    resetCard();

    updateHud();


    /*
      Start timer.
    */

    state.timer =
      setInterval(tick, 1000);


    if (statusEl) {
      statusEl.textContent =
        "Game started. Swipe the word to the correct verb.";
    }
  }


  /* =======================================================
     RESET CARD
     ======================================================= */

  function resetCard() {

    if (!state || state.done) {
      return;
    }

    const pair =
      state.questions[state.currentIndex];


    /*
      No more questions.
    */

    if (!pair) {

      finish(true);

      return;
    }


    const item = pair[1];


    /*
      Set word.
    */

    wordEl.textContent =
      item.toUpperCase();


    /*
      Reset card classes.
    */

    swipeCard.className =
      "swipe-card";


    /*
      Reset inline styles.
    */

    swipeCard.style.transition = "";

    swipeCard.style.transform =
      "translate3d(0, 0, 0) rotate(0deg)";

    swipeCard.style.opacity = "1";

    swipeCard.style.pointerEvents = "auto";


    /*
      Reset highlights.
    */

    clearTargetHighlights();


    /*
      Reset feedback.
    */

    feedbackEl.textContent = "";

    feedbackEl.className =
      "feedback";


    /*
      Small entrance animation.
    */

    if (typeof swipeCard.animate === "function") {

      swipeCard.animate(

        [
          {
            opacity: 0,

            transform:
              "translate3d(0, 25px, 0) scale(.95)"
          },

          {
            opacity: 1,

            transform:
              "translate3d(0, 0, 0) scale(1)"
          }
        ],

        {
          duration: 220,

          easing: "ease-out"
        }
      );
    }
  }


  /* =======================================================
     POINTER DOWN
     ======================================================= */

  function onPointerDown(e) {

    if (
      !state ||
      state.done ||
      state.dragging ||
      state.answering
    ) {
      return;
    }


    /*
      Only accept primary mouse button.
    */

    if (
      e.pointerType === "mouse" &&
      e.button !== 0
    ) {
      return;
    }


    e.preventDefault();


    state.dragging = true;

    state.startX = e.clientX;
    state.startY = e.clientY;

    state.currentX = e.clientX;
    state.currentY = e.clientY;


    swipeCard.classList.add("dragging");


    /*
      Capture pointer.
    */

    try {

      swipeCard.setPointerCapture(
        e.pointerId
      );

    } catch (_) {}


    if (statusEl) {

      statusEl.textContent =
        "Dragging " +
        wordEl.textContent;
    }
  }


  /* =======================================================
     POINTER MOVE
     ======================================================= */

  function onPointerMove(e) {

    if (
      !state ||
      !state.dragging ||
      state.done
    ) {
      return;
    }


    e.preventDefault();


    state.currentX = e.clientX;
    state.currentY = e.clientY;


    const dx =
      e.clientX - state.startX;

    const dy =
      e.clientY - state.startY;


    /*
      Rotate card according to horizontal movement.
    */

    const rotation =
      Math.max(
        -18,
        Math.min(18, dx * 0.06)
      );


    /*
      Move card.
    */

    swipeCard.style.transform =
      "translate3d(" +
      dx +
      "px, " +
      dy +
      "px, 0) rotate(" +
      rotation +
      "deg)";


    /*
      Highlight destination.
    */

    highlightDirection(dx, dy);
  }


  /* =======================================================
     POINTER UP
     ======================================================= */

  function onPointerUp(e) {

    if (
      !state ||
      !state.dragging ||
      state.done
    ) {
      return;
    }


    e.preventDefault();


    state.dragging = false;


    const dx =
      e.clientX - state.startX;

    const dy =
      e.clientY - state.startY;


    swipeCard.classList.remove(
      "dragging"
    );


    /*
      Release pointer capture.
    */

    try {

      swipeCard.releasePointerCapture(
        e.pointerId
      );

    } catch (_) {}


    /*
      Remove target highlight.
    */

    clearTargetHighlights();


    /*
      Calculate movement distance.
    */

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    /*
      Tiny movement = tap.
    */

    if (distance < 45) {

      returnCard();

      if (statusEl) {

        statusEl.textContent =
          "Swipe the word left, right, or up.";
      }

      return;
    }


    /*
      Determine direction.
    */

    const direction =
      getDirection(dx, dy);


    /*
      Submit answer.
    */

    attemptSwipe(direction);
  }


  /* =======================================================
     GET SWIPE DIRECTION
     ======================================================= */

  function getDirection(dx, dy) {

    /*
      Vertical movement is stronger.
    */

    if (
      Math.abs(dy) >
      Math.abs(dx)
    ) {

      /*
        Up = HAVE
      */

      if (dy < 0) {
        return "up";
      }


      /*
        Down has no answer.
      */

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

    if (
      !state ||
      !state.dragging
    ) {
      return;
    }


    /*
      Remove previous highlights.
    */

    clearTargetHighlights();


    /*
      Don't highlight tiny movements.
    */

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (distance < 30) {
      return;
    }


    /*
      Determine direction.
    */

    const direction =
      getDirection(dx, dy);


    /*
      Highlight corresponding target.
    */

    const target =
      getTargetForDirection(direction);


    if (target) {

      target.classList.add("active");
    }


    /*
      Add direction class to card.
    */

    if (direction === "up") {

      swipeCard.classList.add(
        "swiping-up"
      );

    }

    else if (direction === "left") {

      swipeCard.classList.add(
        "swiping-left"
      );

    }

    else if (direction === "right") {

      swipeCard.classList.add(
        "swiping-right"
      );
    }
  }


  /* =======================================================
     CLEAR TARGET HIGHLIGHTS
     ======================================================= */

  function clearTargetHighlights() {

    if (targetHave) {

      targetHave.classList.remove(
        "active",
        "correct",
        "wrong"
      );
    }


    if (targetDrink) {

      targetDrink.classList.remove(
        "active",
        "correct",
        "wrong"
      );
    }


    if (targetEat) {

      targetEat.classList.remove(
        "active",
        "correct",
        "wrong"
      );
    }


    swipeCard.classList.remove(
      "swiping-up",
      "swiping-left",
      "swiping-right"
    );
  }


  /* =======================================================
     ATTEMPT SWIPE
     ======================================================= */

  function attemptSwipe(direction) {

    if (
      !state ||
      state.done ||
      state.answering
    ) {
      return;
    }


    state.attempts++;


    const pair =
      state.questions[state.currentIndex];


    if (!pair) {
      return;
    }


    const correctVerb =
      pair[0];


    const selectedVerb =
      DIRECTION_TO_VERB[direction] ||
      null;


    const isCorrect =
      selectedVerb === correctVerb;


    /*
      Correct.
    */

    if (isCorrect) {

      handleCorrect(direction);

      return;
    }


    /*
      Wrong.
    */

    handleWrong(
      direction,
      correctVerb
    );
  }


  /* =======================================================
     CORRECT ANSWER
     ======================================================= */

  function handleCorrect(direction) {

    state.correct++;

    state.combo++;


    state.bestCombo =
      Math.max(
        state.bestCombo,
        state.combo
      );


    /*
      Base points = 15

      Combo bonus:
      +3 for each combo after first.
    */

    const points =
      15 +
      Math.max(
        0,
        state.combo - 1
      ) * 3;


    state.score += points;


    /*
      Lock answer while animation plays.
    */

    state.answering = true;


    /*
      Correct target.
    */

    const target =
      getTargetForDirection(
        direction
      );


    if (target) {

      target.classList.remove(
        "active"
      );

      target.classList.add(
        "correct"
      );
    }


    /*
      Feedback.
    */

    feedbackEl.textContent =
      "+" + points;

    feedbackEl.className =
      "feedback show correct";


    /*
      Status.
    */

    if (statusEl) {

      statusEl.textContent =
        "Correct! " +
        wordEl.textContent +
        " goes with " +
        DIRECTION_TO_VERB[direction] +
        ".";
    }


    /*
      Update HUD.
    */

    updateHud();


    /*
      Send card away.
    */

    swipeCard.classList.add(
      "exit-" + direction
    );


    /*
      Next card.
    */

    setTimeout(function () {

      if (!state || state.done) {
        return;
      }


      state.currentIndex++;


      /*
        All questions completed.
      */

      if (
        state.currentIndex >=
        TOTAL
      ) {

        finish(true);

        return;
      }


      state.answering = false;

      resetCard();

    }, 330);
  }


  /* =======================================================
     WRONG ANSWER
     ======================================================= */

  function handleWrong(
    direction,
    correctVerb
  ) {

    state.combo = 0;


    /*
      Highlight selected target.
    */

    const selectedTarget =
      getTargetForDirection(
        direction
      );


    if (selectedTarget) {

      selectedTarget.classList.remove(
        "active"
      );

      selectedTarget.classList.add(
        "wrong"
      );
    }


    /*
      Feedback.
    */

    feedbackEl.textContent =
      "Try again!";

    feedbackEl.className =
      "feedback show wrong";


    /*
      Status.
    */

    if (statusEl) {

      statusEl.textContent =
        "Wrong direction. Try again.";
    }


    /*
      Update HUD.
    */

    updateHud();


    /*
      Return card.
    */

    returnCard();
  }


  /* =======================================================
     RETURN CARD
     ======================================================= */

  function returnCard() {

    if (!swipeCard) {
      return;
    }


    swipeCard.classList.remove(
      "swiping-up",
      "swiping-left",
      "swiping-right",
      "exit-up",
      "exit-left",
      "exit-right"
    );


    swipeCard.style.transition =
      "transform 0.3s ease";


    swipeCard.style.transform =
      "translate3d(0, 0, 0) rotate(0deg)";


    setTimeout(function () {

      swipeCard.style.transition = "";

      clearTargetHighlights();

    }, 320);
  }


  /* =======================================================
     GET TARGET
     ======================================================= */

  function getTargetForDirection(
    direction
  ) {

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

    if (
      !state ||
      state.done
    ) {
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
      Math.max(
        0,
        state.time
      );


    progressFill.style.width =
      (
        state.correct /
        TOTAL *
        100
      ) + "%";
  }


  /* =======================================================
     FINISH GAME
     ======================================================= */

  function finish(won) {

    if (
      !state ||
      state.done
    ) {
      return;
    }


    state.done = true;

    state.dragging = false;

    state.answering = false;


    /*
      Stop timer.
    */

    if (state.timer) {

      clearInterval(
        state.timer
      );

      state.timer = null;
    }


    /*
      Disable card.
    */

    swipeCard.style.pointerEvents =
      "none";


    /*
      Final score.
    */

    $("finalScore").textContent =
      state.score;


    /*
      Accuracy.
    */

    const accuracy =
      state.attempts > 0

        ? Math.round(
            (
              state.correct /
              state.attempts
            ) * 100
          )

        : 0;


    $("accuracy").textContent =
      accuracy + "%";


    /*
      Best combo.
    */

    $("bestCombo").textContent =
      state.bestCombo + "x";


    /*
      End title.
    */

    $("endTitle").textContent =
      won
        ? "Excellent!"
        : "Time's up!";


    /*
      End message.
    */

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


    /*
      Result icon.
    */

    $("resultIcon").textContent =
      won
        ? "🏆"
        : "⏱️";


    /*
      Show modal.
    */

    endModal.classList.remove(
      "hidden"
    );


    /*
      Status.
    */

    if (statusEl) {

      statusEl.textContent =
        won
          ? "Game complete."
          : "Time is up.";
    }
  }


  /* =======================================================
     THEME
     ======================================================= */

  function applyTheme(dark) {

    document.documentElement.setAttribute(
      "data-theme",
      dark
        ? "dark"
        : "light"
    );


    if (themeBtn) {

      themeBtn.textContent =
        dark
          ? "☀️"
          : "🌙";
    }


    try {

      localStorage.setItem(
        "fvm-theme",
        dark
          ? "dark"
          : "light"
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


        applyTheme(
          !isDark
        );
      }
    );
  }


  /* =======================================================
     LOAD THEME
     ======================================================= */

  try {

    const savedTheme =
      localStorage.getItem(
        "fvm-theme"
      );


    applyTheme(
      savedTheme === "dark"
    );

  } catch (_) {

    applyTheme(false);
  }


  /* =======================================================
     BUTTONS
     ======================================================= */

  if (startBtn) {

    startBtn.addEventListener(
      "click",
      startGame
    );
  }


  if (playAgainBtn) {

    playAgainBtn.addEventListener(
      "click",
      startGame
    );
  }


  /* =======================================================
     POINTER EVENTS
     ======================================================= */

  if (swipeCard) {

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

        if (
          !state ||
          !state.dragging
        ) {
          return;
        }


        state.dragging = false;


        swipeCard.classList.remove(
          "dragging"
        );


        clearTargetHighlights();

        returnCard();
      }
    );


    /* =====================================================
       KEYBOARD SUPPORT
       ===================================================== */

    swipeCard.addEventListener(
      "keydown",
      function (e) {

        if (
          !state ||
          state.done ||
          state.answering
        ) {
          return;
        }


        if (
          e.key === "ArrowUp"
        ) {

          e.preventDefault();

          attemptSwipe("up");

        }


        else if (
          e.key === "ArrowLeft"
        ) {

          e.preventDefault();

          attemptSwipe("left");

        }


        else if (
          e.key === "ArrowRight"
        ) {

          e.preventDefault();

          attemptSwipe("right");
        }
      }
    );
  }


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  /*
    Game starts on start screen.
    Timer does not run until Start Game.
  */

  if (startOverlay) {

    startOverlay.classList.remove(
      "hidden"
    );
  }


})();
