/* =========================================================
   A · AN · SOME — JOYSTICK MATCH
   Vocabulary · Elementary | Mr. Sheyhaki
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  "use strict";


  /* =======================================================
     DATA
     ======================================================= */

const PAIRS = [
    ["a", "pineapple"],
    ["a", "sandwich"],
    ["a", "cake"],

    ["an", "apple"],
    ["an", "orange"],
    ["an", "egg"],
    ["an", "onion"],
    ["an", "ice cream"],

    ["some", "bread"],
    ["some", "cheese"],
    ["some", "milk"],
    ["some", "coffee"],
    ["some", "rice"],
    ["some", "pasta"],
    ["some", "carrots"],
    ["some", "mushrooms"],
    ["some", "bananas"],
    ["some", "strawberries"],
    ["some", "cookies"],
    ["some", "nuts"]
  ];


  const TOTAL = PAIRS.length;
  const START_TIME = 90;


  /*
    UP    = SOME
    LEFT  = A
    RIGHT = AN
  */

  const DIRECTION_TO_VERB = {
    up: "some",
    left: "a",
    right: "an"
  };


  /* =======================================================
     ELEMENTS
     ======================================================= */

  const $ = function (id) {
    return document.getElementById(id);
  };


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

  const targetHave = $("targetSome"); // SOME (up) — variable kept for minimal JS churn
  const targetDrink = $("targetA"); // A (left)
  const targetEat = $("targetAn"); // AN (right)

  const joystickStick = $("joystickStick");
  const themeBtn = $("themeBtn");


  /* =======================================================
     CHECK HTML
     ======================================================= */

  if (!startBtn) {
    console.error("A An Some: #startBtn was not found.");
    return;
  }

  if (!swipeCard) {
    console.error("A An Some: #swipeCard was not found.");
    return;
  }

  if (!wordEl) {
    console.error("A An Some: #word was not found.");
    return;
  }


  /* =======================================================
     STATE
     ======================================================= */

  let state = null;


  /* =======================================================
     SPEECH — say "A cake", "An apple", "Some bread", etc.
     ======================================================= */

  function pickEnglishVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(function (x) {
        return (
          x.lang &&
          x.lang.indexOf("en") === 0 &&
          /US|United|Google|Samantha|Daniel|Zira|Female/i.test(x.name)
        );
      }) ||
      voices.find(function (x) {
        return x.lang && x.lang.indexOf("en") === 0;
      }) ||
      null
    );
  }

  function speakText(text, options) {
    if (!window.speechSynthesis) return;
    options = options || {};

    try {
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(String(text));
      utter.lang = "en-US";
      utter.rate = options.rate != null ? options.rate : 1;
      utter.pitch = options.pitch != null ? options.pitch : 1;
      utter.volume = options.volume != null ? options.volume : 1;

      const preferred = pickEnglishVoice();
      if (preferred) {
        utter.voice = preferred;
      }

      window.speechSynthesis.speak(utter);
    } catch (err) {}
  }

  /* Correct match: clear, confident phrase e.g. "Some bread" */
  function speakPhrase(verb, noun) {
    const v = String(verb).toLowerCase();
    const n = String(noun).toLowerCase();
    // Articles stay lowercase in natural speech except sentence start — we capitalize first word
    const phrase = v.charAt(0).toUpperCase() + v.slice(1) + " " + n;

    speakText(phrase, {
      rate: 0.95,
      pitch: 1.05,
      volume: 1
    });
  }

  /* Wrong match: playful tone */
  function speakOops() {
    speakText("Oops! Try again!", {
      rate: 1.12,   // a bit quicker = more playful
      pitch: 1.35,  // higher = lighter / playful
      volume: 1
    });
  }

  // Chrome loads voices async
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function () {
      window.speechSynthesis.getVoices();
    };
  }


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

    console.log("A An Some: Starting game");


    /*
      Stop previous timer.
    */

    if (state && state.timer) {
      clearInterval(state.timer);
    }


    /*
      New state.
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

      startY: 0
    };


    /*
      Hide start screen.
    */

    if (startOverlay) {
      startOverlay.classList.add("hidden");
    }


    /*
      Hide end screen.
    */

    if (endModal) {
      endModal.classList.add("hidden");
    }


    /*
      Enable card.
    */

    swipeCard.style.pointerEvents = "auto";


    /*
      Reset card.
    */

    resetCard();

    updateHUD();


    /*
      Start timer.
    */

    state.timer = setInterval(function () {

      tick();

    }, 1000);


    if (statusEl) {

      statusEl.textContent =
        "Send the word to a, an, or some.";
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


    if (!pair) {

      finish(true);

      return;
    }


    const word =
      pair[1];


    /*
      Display word.
    */

    wordEl.textContent = String(word).toLowerCase();


    /*
      Remove all animation classes.
    */

    swipeCard.className =
      "swipe-card";


    /*
      Reset position.
    */

    swipeCard.style.transition =
      "none";

    swipeCard.style.transform =
      "translate3d(0,0,0) rotate(0deg)";

    swipeCard.style.opacity =
      "1";

    swipeCard.style.pointerEvents =
      "auto";


    /*
      Reset highlights.
    */

    clearTargetHighlights();


    /*
      Reset feedback.
    */

    if (feedbackEl) {

      feedbackEl.textContent = "";

      feedbackEl.className =
        "feedback";
    }


    /*
      Entrance animation.
    */

    swipeCard.animate(
      [
        {
          opacity: 0,

          transform:
            "translate3d(0,28px,0) scale(.94)"
        },

        {
          opacity: 1,

          transform:
            "translate3d(0,0,0) scale(1)"
        }
      ],
      {
        duration: 380,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    );
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
      Ignore right mouse button.
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


    swipeCard.classList.add(
      "dragging"
    );


    /*
      Capture pointer.
    */

    try {

      swipeCard.setPointerCapture(
        e.pointerId
      );

    } catch (err) {}


    if (statusEl) {

      statusEl.textContent =
        "Send the word to a, an, or some.";
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


    const dx =
      e.clientX - state.startX;

    const dy =
      e.clientY - state.startY;


    /*
      Rotate slightly.
    */

    const rotation =
      Math.max(
        -15,
        Math.min(
          15,
          dx * 0.05
        )
      );


    /*
      Move card.
    */

    swipeCard.style.transform =
      "translate3d(" +
      dx +
      "px," +
      dy +
      "px,0) rotate(" +
      rotation +
      "deg)";


    /*
      Highlight target.
    */

    highlightDirection(
      dx,
      dy
    );
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


    try {

      swipeCard.releasePointerCapture(
        e.pointerId
      );

    } catch (err) {}


    clearTargetHighlights();


    /*
      Ignore tiny movements.
    */

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (distance < 45) {

      returnCard();

      if (statusEl) {

        statusEl.textContent =
          "Swipe left, right, or up.";
      }

      return;
    }


    const direction =
      getDirection(dx, dy);


    attemptSwipe(direction);
  }


  /* =======================================================
     POINTER CANCEL
     ======================================================= */

  function onPointerCancel() {

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


  /* =======================================================
     GET DIRECTION
     ======================================================= */

  function getDirection(dx, dy) {

    if (
      Math.abs(dy) >
      Math.abs(dx)
    ) {

      if (dy < 0) {
        return "up";
      }

      return "down";
    }


    if (dx < 0) {
      return "left";
    }


    return "right";
  }


  /* =======================================================
     HIGHLIGHT DIRECTION
     ======================================================= */

  function highlightDirection(dx, dy) {

    clearTargetHighlights();


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (distance < 30) {
      return;
    }


    const direction =
      getDirection(dx, dy);


    const target =
      getTargetForDirection(
        direction
      );


    if (target) {

      target.classList.add(
        "active"
      );
    }


    if (direction === "up") {

      swipeCard.classList.add(
        "swiping-up"
      );

    } else if (direction === "left") {

      swipeCard.classList.add(
        "swiping-left"
      );

    } else if (direction === "right") {

      swipeCard.classList.add(
        "swiping-right"
      );
    }

    /* Arcade joystick visual tilt */
    if (joystickStick) {
      joystickStick.classList.remove(
        "tilt-up", "tilt-left", "tilt-right", "tilt-down"
      );
      if (direction === "up") {
        joystickStick.classList.add("tilt-up");
      } else if (direction === "left") {
        joystickStick.classList.add("tilt-left");
      } else if (direction === "right") {
        joystickStick.classList.add("tilt-right");
      } else if (direction === "down") {
        joystickStick.classList.add("tilt-down");
      }
    }
  }


  /* =======================================================
     CLEAR HIGHLIGHTS
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

    if (joystickStick) {
      joystickStick.classList.remove(
        "tilt-up", "tilt-left", "tilt-right", "tilt-down"
      );
    }
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


    if (
      selectedVerb ===
      correctVerb
    ) {

      handleCorrect(
        direction
      );

    } else {

      handleWrong(
        direction
      );
    }
  }


  /* =======================================================
     CORRECT
     ======================================================= */

  function handleCorrect(direction) {

    state.correct++;

    state.combo++;


    if (
      state.combo >
      state.bestCombo
    ) {

      state.bestCombo =
        state.combo;
    }


    const points =
      15 +
      Math.max(
        0,
        state.combo - 1
      ) * 3;


    state.score += points;


    state.answering = true;


    /*
      Correct target.
    */

    const target =
      getTargetForDirection(
        direction
      );


    if (target) {

      target.classList.add(
        "correct"
      );
    }


    /*
      Speak: "A cake", "An apple", "Some bread"
    */

    const pair =
      state.questions[state.currentIndex];

    if (pair) {
      speakPhrase(pair[0], pair[1]);
    }


    /*
      Feedback.
    */

    if (feedbackEl) {

      feedbackEl.textContent =
        "+" + points;

      feedbackEl.className =
        "feedback show correct";
    }


    if (statusEl) {

      statusEl.textContent =
        "Correct!";
    }


    updateHUD();


    /*
      Card flies away.
    */

    swipeCard.classList.add(
      "exit-" + direction
    );


    /*
      Next card.
    */

    setTimeout(function () {

      if (
        !state ||
        state.done
      ) {
        return;
      }


      state.currentIndex++;


      if (
        state.currentIndex >=
        TOTAL
      ) {

        finish(true);

        return;
      }


      state.answering = false;


      resetCard();

    }, 480);
  }


  /* =======================================================
     WRONG
     ======================================================= */

  function handleWrong(direction) {

    state.combo = 0;


    const target =
      getTargetForDirection(
        direction
      );


    if (target) {

      target.classList.add(
        "wrong"
      );
    }


    /* Playful voice */
    speakOops();


    if (feedbackEl) {

      feedbackEl.textContent =
        "Try again!";

      feedbackEl.className =
        "feedback show wrong";
    }


    if (statusEl) {

      statusEl.textContent =
        "Wrong direction — try again.";
    }


    updateHUD();


    returnCard();
  }


  /* =======================================================
     RETURN CARD
     ======================================================= */

  function returnCard() {

    swipeCard.style.transition =
      "transform .42s cubic-bezier(0.22, 1, 0.36, 1)";


    swipeCard.style.transform =
      "translate3d(0,0,0) rotate(0deg)";


    setTimeout(function () {

      swipeCard.style.transition =
        "";


      clearTargetHighlights();

    }, 420);
  }


  /* =======================================================
     GET TARGET
     ======================================================= */

  function getTargetForDirection(
    direction
  ) {

    if (
      direction === "up"
    ) {
      return targetHave;
    }


    if (
      direction === "left"
    ) {
      return targetDrink;
    }


    if (
      direction === "right"
    ) {
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


    updateHUD();


    if (
      state.time <= 0
    ) {

      finish(false);
    }
  }


  /* =======================================================
     HUD
     ======================================================= */

  function updateHUD() {

    if (!state) {
      return;
    }


    if (scoreEl) {

      scoreEl.textContent =
        state.score;
    }


    if (comboEl) {

      comboEl.textContent =
        state.combo + "x";
    }


    if (timerEl) {

      timerEl.textContent =
        Math.max(
          0,
          state.time
        );
    }


    if (progressFill) {

      progressFill.style.width =
        (
          state.correct /
          TOTAL *
          100
        ) + "%";
    }
  }


  /* =======================================================
     FINISH
     ======================================================= */

  function finish(won) {

    if (
      !state ||
      state.done
    ) {
      return;
    }


    state.done = true;


    if (state.timer) {

      clearInterval(
        state.timer
      );

      state.timer = null;
    }


    swipeCard.style.pointerEvents =
      "none";


    const finalScore =
      $("finalScore");

    const accuracyEl =
      $("accuracy");

    const bestComboEl =
      $("bestCombo");

    const endTitle =
      $("endTitle");

    const endMessage =
      $("endMessage");

    const resultIcon =
      $("resultIcon");


    if (finalScore) {

      finalScore.textContent =
        state.score;
    }


    const accuracy =
      state.attempts > 0

        ? Math.round(
            (
              state.correct /
              state.attempts
            ) * 100
          )

        : 0;


    if (accuracyEl) {

      accuracyEl.textContent =
        accuracy + "%";
    }


    if (bestComboEl) {

      bestComboEl.textContent =
        state.bestCombo + "x";
    }


    if (endTitle) {

      endTitle.textContent =
        won
          ? "Excellent!"
          : "Time's up!";
    }


    if (endMessage) {

      endMessage.textContent =
        won

          ? "You matched all " +
            TOTAL +
            " food combinations."

          : "You matched " +
            state.correct +
            " of " +
            TOTAL +
            ".";
    }


    if (resultIcon) {

      resultIcon.textContent =
        won
          ? "🏆"
          : "⏱️";
    }

    // Save Learning Arcade stars (best of runs)
    try {
      if (window.LAStars) {
        window.LAStars.recordPlay("vocab-food-a-an-some");
        window.LAStars.saveFromAccuracy("vocab-food-a-an-some", accuracy);
      }
    } catch (e) {}



    if (endModal) {

      endModal.classList.remove(
        "hidden"
      );
    }


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

    } catch (err) {}
  }


  /* =======================================================
     THEME BUTTON
     ======================================================= */

  if (themeBtn) {

    themeBtn.addEventListener(
      "click",
      function () {

        const dark =
          document.documentElement.getAttribute(
            "data-theme"
          ) === "dark";


        applyTheme(!dark);
      }
    );
  }


  /* =======================================================
     LOAD THEME
     ======================================================= */

  try {

    const saved =
      localStorage.getItem(
        "fvm-theme"
      );


    applyTheme(
      saved === "dark"
    );

  } catch (err) {

    applyTheme(false);
  }


  /* =======================================================
     BUTTONS
     ======================================================= */

  startBtn.addEventListener(
    "click",
    startGame
  );


  if (playAgainBtn) {

    playAgainBtn.addEventListener(
      "click",
      startGame
    );
  }


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
    onPointerCancel
  );


  /* =======================================================
     KEYBOARD
     ======================================================= */

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

      } else if (
        e.key === "ArrowLeft"
      ) {

        e.preventDefault();

        attemptSwipe("left");

      } else if (
        e.key === "ArrowRight"
      ) {

        e.preventDefault();

        attemptSwipe("right");
      }
    }
  );


  /* =======================================================
     JOYSTICK — fully interactive (drag to send card)
     ======================================================= */

  const joystickBase = document.querySelector(".joystick-base");
  let joyActive = false;
  let joyStartX = 0;
  let joyStartY = 0;
  const JOY_MAX = 38;       // max pixel travel of the stick (matches larger joystick)
  const JOY_THRESHOLD = 18; // minimum travel to register a direction

  function resetJoystickVisual() {
    if (!joystickStick) return;
    joystickStick.style.transition = "transform .22s cubic-bezier(0.22, 1, 0.36, 1)";
    joystickStick.style.transform = "translate(-50%, -50%)";
    joystickStick.classList.remove(
      "tilt-up", "tilt-left", "tilt-right", "tilt-down"
    );
  }

  function onJoyDown(e) {
    if (!state || state.done || state.answering || state.dragging) {
      return;
    }
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    joyActive = true;
    joyStartX = e.clientX;
    joyStartY = e.clientY;

    try {
      (joystickBase || joystickStick).setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  function onJoyMove(e) {
    if (!joyActive || !state || state.done) return;

    e.preventDefault();

    let dx = e.clientX - joyStartX;
    let dy = e.clientY - joyStartY;

    // Clamp to circle
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > JOY_MAX) {
      dx = (dx / dist) * JOY_MAX;
      dy = (dy / dist) * JOY_MAX;
    }

    // Highlight matching target while dragging (targets only)
    if (dist > 10) {
      highlightDirection(dx, dy);
    } else {
      clearTargetHighlights();
    }

    // Always keep stick under the finger (override any class-based tilt)
    if (joystickStick) {
      joystickStick.classList.remove(
        "tilt-up", "tilt-left", "tilt-right", "tilt-down"
      );
      joystickStick.style.transition = "none";
      joystickStick.style.transform =
        "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";
    }
  }

  function onJoyUp(e) {
    if (!joyActive) return;

    e.preventDefault();
    joyActive = false;

    try {
      (joystickBase || joystickStick).releasePointerCapture(e.pointerId);
    } catch (err) {}

    const dx = e.clientX - joyStartX;
    const dy = e.clientY - joyStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    clearTargetHighlights();
    resetJoystickVisual();

    if (dist < JOY_THRESHOLD) {
      return; // not far enough — ignore
    }

    if (!state || state.done || state.answering) {
      return;
    }

    const direction = getDirection(dx, dy);

    // Only allow the three valid directions
    if (direction === "up" || direction === "left" || direction === "right") {
      attemptSwipe(direction);
    }
  }

  function onJoyCancel() {
    joyActive = false;
    clearTargetHighlights();
    resetJoystickVisual();
  }

  if (joystickBase) {
    joystickBase.addEventListener("pointerdown", onJoyDown);
    joystickBase.addEventListener("pointermove", onJoyMove);
    joystickBase.addEventListener("pointerup", onJoyUp);
    joystickBase.addEventListener("pointercancel", onJoyCancel);
  } else if (joystickStick) {
    joystickStick.addEventListener("pointerdown", onJoyDown);
    joystickStick.addEventListener("pointermove", onJoyMove);
    joystickStick.addEventListener("pointerup", onJoyUp);
    joystickStick.addEventListener("pointercancel", onJoyCancel);
  }


  /* =======================================================
     INITIAL SCREEN
     ======================================================= */

  if (startOverlay) {

    startOverlay.classList.remove(
      "hidden"
    );
  }


  console.log(
    "Food Verb Match loaded successfully."
  );

});
