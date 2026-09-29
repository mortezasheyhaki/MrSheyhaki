/* ===== Arcade FX: progress bar, combo, milestone celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [["🌟","Awesome!","10 correct answers!"],["🚀","Superstar!","20 correct — unstoppable!"],["👑","Legend!","30 correct — the best of the best!"]];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) { return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : ""; }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) { el = document.createElement("div"); el.id = "afx-combo"; el.className = "afx-combo"; document.body.appendChild(el); }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = (document.getElementById("game-app") || document.getElementById("app"));
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, 2)];
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.1, i * 0.09); });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div"); ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 44; i++) h += '<i style="left:' + Math.random() * 100 + "%;background:" + cols[i % 6] + ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" + (1.3 + Math.random() * 0.9).toFixed(2) + 's"></i>';
    ov.innerHTML = h + '<div class="afx-card"><div class="afx-emoji">' + c[0] + '</div><div class="afx-title">' + c[1] + '</div><div class="afx-sub">' + c[2] + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) { var st = L.startTimer; L.__afx = 1; L.startTimer = function () { api.reset(); return st.apply(this, arguments); }; }
  }
  var api = window.ArcadeFX = {
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^\d+\s*\/\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(\d+)\s*\/\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
    if (!bar) {
      var host = badge.closest("header") || badge.parentElement;
      bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
      host.parentNode.insertBefore(bar, host.nextSibling);
    }
    var fill = bar.firstChild; lastPct = pct;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
  }
  var q = 0;
  function start() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* =========================================================
   FOOD VERB MATCH — SWIPE VERSION
   Unit 5A | Mr. Sheyhaki
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

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
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

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

  const targetHave = $("targetHave");
  const targetDrink = $("targetDrink");
  const targetEat = $("targetEat");

  const joystickStick = $("joystickStick");
  const themeBtn = $("themeBtn");


  /* =======================================================
     CHECK HTML
     ======================================================= */

  if (!startBtn) {
    console.error("Food Verb Match: #startBtn was not found.");
    return;
  }

  if (!swipeCard) {
    console.error("Food Verb Match: #swipeCard was not found.");
    return;
  }

  if (!wordEl) {
    console.error("Food Verb Match: #word was not found.");
    return;
  }


  /* =======================================================
     STATE
     ======================================================= */

  let state = null;


  /* =======================================================
     SPEECH — say "Have breakfast", "Drink tea", etc.
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

  /* Correct match: clear, confident phrase e.g. "Have breakfast" */
  function speakPhrase(verb, noun) {
    const v =
      String(verb).charAt(0).toUpperCase() +
      String(verb).slice(1).toLowerCase();
    const phrase = v + " " + String(noun).toLowerCase();

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

    console.log("Food Verb Match: Starting game");


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
        "Swipe the word to the correct verb.";
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

    wordEl.textContent =
      word.toUpperCase();


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
        "Move the word to a verb.";
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
      Speak: "Have breakfast", "Drink tea", "Eat salad"
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
        window.LAStars.recordPlay("starter-5a-food-verb-match");
        window.LAStars.saveFromAccuracy("starter-5a-food-verb-match", accuracy);
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
