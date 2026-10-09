/**
 * Match the Transport · Circular Wheel
 * AEF Level 1 · Practical English 6
 * Picture in center · words around the wheel · one at a time
 * LA stars + finish + sfx
 */
(function () {
  "use strict";

  var GAME_ID = "1-pe6-transport-match";

  var ITEMS = [
    {
      id: "bus",
      word: "bus",
      image: "https://cdn.imgurl.ir/uploads/j353468_bus.png",
      audio: "https://cdn.imgurl.ir/uploads/j054784_bus.mp3"
    },
    {
      id: "plane",
      word: "plane",
      image: "https://cdn.imgurl.ir/uploads/n208525_ane.png",
      audio: "https://cdn.imgurl.ir/uploads/a588513_ane.mp3"
    },
    {
      id: "taxi",
      word: "taxi",
      image: "https://cdn.imgurl.ir/uploads/j96625_taxi.png",
      audio: "https://cdn.imgurl.ir/uploads/g19783_taxi.mp3"
    },
    {
      id: "train",
      word: "train",
      image: "https://cdn.imgurl.ir/uploads/939422_train.png",
      audio: "https://cdn.imgurl.ir/uploads/v032925_train.mp3"
    },
    {
      id: "ferry",
      word: "ferry",
      image: "https://cdn.imgurl.ir/uploads/n26129_ferry.png",
      audio: "https://cdn.imgurl.ir/uploads/u394777_ferry.mp3"
    },
    {
      id: "subway",
      word: "subway",
      image: "https://cdn.imgurl.ir/uploads/r04407_subway.png",
      audio: "https://cdn.imgurl.ir/uploads/v06652_subway.mp3"
    }
  ];

  var TOTAL = ITEMS.length;
  var WORDS = ITEMS.map(function (it) { return it.word; });

  var state = {
    screen: "start",
    order: [],
    current: 0,
    score: 0,
    locked: false,
    started: false,
    finished: false,
    wordPositions: []
  };

  var app = document.getElementById("game-app");
  if (!app) return;

  var audioEl = null;

  function sfx(name) {
    try {
      if (!window.LASfx) return;
      if (name === "correct" && LASfx.correct) LASfx.correct();
      else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
      else if (name === "win" && LASfx.win) LASfx.win();
      else if (name === "click" && LASfx.click) LASfx.click();
    } catch (_) {}
  }

  function startTimerOnce() {
    if (state.started) return;
    state.started = true;
    try {
      if (window.LAFinish) LAFinish.startTimer();
    } catch (_) {}
  }

  function calcAccuracy() {
    return Math.round((state.score / TOTAL) * 100);
  }

  function calcStars(acc) {
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function saveStars() {
    var acc = calcAccuracy();
    var stars = calcStars(acc);
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        if (typeof LAStars.saveFromAccuracy === "function") {
          var r = LAStars.saveFromAccuracy(GAME_ID, acc);
          if (typeof r === "number") stars = r;
        } else {
          LAStars.save(GAME_ID, stars);
        }
      }
    } catch (_) {}
    return stars;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function playAudio(url) {
    try {
      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }
      audioEl = new Audio(url);
      audioEl.play().catch(function () {});
    } catch (_) {}
  }

  function stopAudio() {
    if (audioEl) {
      try { audioEl.pause(); } catch (_) {}
      audioEl = null;
    }
  }

  /* ── Shell ── */
  function shell(bodyHtml, opts) {
    opts = opts || {};
    var pct = Math.round((state.current / TOTAL) * 100);
    if (state.screen === "done") pct = 100;

    return (
      '<div class="tm-top">' +
      '<a class="tm-back" href="../" aria-label="Back">←</a>' +
      '<div class="tm-title-wrap">' +
      '<div class="tm-kicker">Practical English 6 · Vocabulary</div>' +
      '<h1 class="tm-title">Match the Transport</h1>' +
      "</div>" +
      (opts.score !== false
        ? '<div class="tm-score-pill" aria-live="polite">' +
          '<span class="tm-score-label">Score</span>' +
          '<span class="tm-score-value">' +
          state.score +
          " / " +
          TOTAL +
          "</span></div>"
        : "") +
      "</div>" +
      (opts.progress !== false
        ? '<div class="tm-progress" role="progressbar" aria-valuenow="' +
          pct +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="tm-progress-fill" style="width:' +
          pct +
          '%"></div></div>'
        : "") +
      '<div class="tm-body">' +
      bodyHtml +
      "</div>" +
      '<div class="tm-footer">' +
      '<button type="button" class="tm-btn tm-btn-ghost" id="tm-restart">Start Again</button>' +
      '<span class="tm-footer-note">Tap the matching word</span>' +
      "</div>"
    );
  }

  function bindShell() {
    var r = document.getElementById("tm-restart");
    if (r) {
      r.onclick = function () {
        sfx("click");
        resetGame();
      };
    }
  }

  function resetGame() {
    stopAudio();
    state.screen = "start";
    state.order = [];
    state.current = 0;
    state.score = 0;
    state.locked = false;
    state.started = false;
    state.finished = false;
    state.wordPositions = [];
    render();
  }

  function render() {
    if (state.screen === "start") renderStart();
    else if (state.screen === "done") renderDone();
    else renderPlay();
  }

  function renderStart() {
    stopAudio();
    app.innerHTML = shell(
      '<div class="tm-card tm-hero">' +
        '<div class="tm-hero-icon" aria-hidden="true">🚌</div>' +
        "<h2>Match the Transport</h2>" +
        "<p>Look at the picture in the middle. Choose the correct word from the circle around it.</p>" +
        '<div class="tm-howto">' +
        "<strong>How to play</strong>" +
        "<ol>" +
        "<li>A picture appears in the center.</li>" +
        "<li>Words are arranged around it like a wheel.</li>" +
        "<li>Tap the word that matches the picture.</li>" +
        "<li>Listen, score points, and go to the next one!</li>" +
        "</ol></div>" +
        '<button type="button" class="tm-btn tm-btn-primary" id="tm-start">Start</button>' +
        "</div>",
      { score: false, progress: false }
    );
    bindShell();
    document.getElementById("tm-start").onclick = function () {
      sfx("click");
      state.order = shuffle(ITEMS.map(function (_, i) { return i; }));
      state.current = 0;
      state.score = 0;
      state.locked = false;
      state.started = false;
      state.finished = false;
      state.wordPositions = shuffle([0, 1, 2, 3, 4, 5]);
      state.screen = "play";
      render();
    };
  }

  function currentItem() {
    return ITEMS[state.order[state.current]];
  }

  function renderPlay() {
    var item = currentItem();
    var positions = state.wordPositions;
    // Map words to positions: positions[i] is the slot for WORDS[i]
    // Actually we shuffle the display order of WORDS
    var displayWords = shuffle(WORDS.slice());

    // Keep the correct one available, just random positions
    var wordHtml = "";
    for (var i = 0; i < displayWords.length; i++) {
      var w = displayWords[i];
      wordHtml +=
        '<button type="button" class="tm-word" data-word="' +
        w +
        '" data-pos="' +
        i +
        '" aria-label="' +
        w +
        '">' +
        w +
        "</button>";
    }

    var dots = "";
    for (var d = 0; d < TOTAL; d++) {
      var cls = "tm-dot";
      if (d < state.current) cls += " is-done";
      else if (d === state.current) cls += " is-current";
      dots += '<span class="' + cls + '"></span>';
    }

    app.innerHTML = shell(
      '<div class="tm-play-wrap">' +
        '<p class="tm-prompt">What is this? <span>Choose the word</span></p>' +
        '<div class="tm-wheel" id="tm-wheel">' +
        '<div class="tm-center" id="tm-center">' +
        '<img src="' +
        item.image +
        '" alt="' +
        item.word +
        '" id="tm-img" draggable="false">' +
        '<button type="button" class="tm-audio-btn" id="tm-audio" aria-label="Play sound">🔊</button>' +
        "</div>" +
        wordHtml +
        '<div class="tm-feedback" id="tm-feedback"></div>' +
        "</div>" +
        '<div class="tm-dots" aria-hidden="true">' +
        dots +
        "</div>" +
        "</div>"
    );
    bindShell();
    bindPlay();
  }

  function bindPlay() {
    startTimerOnce();

    var audioBtn = document.getElementById("tm-audio");
    if (audioBtn) {
      audioBtn.onclick = function (e) {
        e.stopPropagation();
        var item = currentItem();
        playAudio(item.audio);
      };
    }

    var words = app.querySelectorAll(".tm-word");
    words.forEach(function (btn) {
      btn.onclick = function () {
        if (state.locked) return;
        handleChoice(btn);
      };
    });
  }

  function handleChoice(btn) {
    var chosen = btn.getAttribute("data-word");
    var item = currentItem();
    var correct = chosen === item.word;

    state.locked = true;

    var allWords = app.querySelectorAll(".tm-word");
    allWords.forEach(function (w) {
      w.disabled = true;
      if (w !== btn) w.classList.add("is-dim");
    });

    var feedback = document.getElementById("tm-feedback");

    if (correct) {
      state.score += 1;
      btn.classList.add("is-correct");
      sfx("correct");
      playAudio(item.audio);
      if (feedback) {
        feedback.textContent = "Correct! 🎉";
        feedback.className = "tm-feedback is-correct is-show";
      }
      // Pop the center
      var center = document.getElementById("tm-center");
      if (center) center.classList.add("is-pop");
    } else {
      btn.classList.add("is-wrong");
      sfx("wrong");
      // Highlight the correct one
      allWords.forEach(function (w) {
        if (w.getAttribute("data-word") === item.word) {
          w.classList.remove("is-dim");
          w.classList.add("is-correct");
        }
      });
      if (feedback) {
        feedback.textContent = "It's \"" + item.word + "\"";
        feedback.className = "tm-feedback is-wrong is-show";
      }
      playAudio(item.audio);
    }

    // Update score display
    var scoreVal = app.querySelector(".tm-score-value");
    if (scoreVal) scoreVal.textContent = state.score + " / " + TOTAL;

    // Next after delay
    setTimeout(function () {
      goNext();
    }, correct ? 1100 : 1500);
  }

  function goNext() {
    state.current += 1;
    state.locked = false;

    if (state.current >= TOTAL) {
      finishGame();
      return;
    }

    // Reshuffle word positions for variety
    state.wordPositions = shuffle([0, 1, 2, 3, 4, 5]);
    renderPlay();
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true;
    state.screen = "done";
    stopAudio();

    var stars = saveStars();
    var acc = calcAccuracy();

    try {
      if (window.LAFinish) {
        LAFinish.show({
          gameId: GAME_ID,
          score: state.score,
          total: TOTAL,
          accuracy: acc,
          stars: stars,
          onReplay: function () {
            resetGame();
          }
        });
      }
    } catch (_) {}

    sfx("win");
    renderDone(stars, acc);
  }

  function renderDone(stars, acc) {
    stars = stars != null ? stars : calcStars(calcAccuracy());
    acc = acc != null ? acc : calcAccuracy();

    var starStr = "";
    for (var i = 0; i < 3; i++) {
      starStr += i < stars ? "⭐" : "☆";
    }

    var msg =
      acc >= 90
        ? "Amazing! You know your transport!"
        : acc >= 70
        ? "Great job!"
        : acc >= 40
        ? "Good effort — keep practicing!"
        : "Try again to learn the words!";

    app.innerHTML = shell(
      '<div class="tm-card tm-done">' +
        '<div class="tm-done-stars" aria-label="' +
        stars +
        ' stars">' +
        starStr +
        "</div>" +
        "<h2>Well done!</h2>" +
        '<div class="tm-done-score">' +
        state.score +
        " / " +
        TOTAL +
        "</div>" +
        "<p>" +
        msg +
        "</p>" +
        '<button type="button" class="tm-btn tm-btn-primary" id="tm-play-again" style="margin-top:12px">Play Again</button>' +
        "</div>",
      { progress: true }
    );
    bindShell();
    var again = document.getElementById("tm-play-again");
    if (again) {
      again.onclick = function () {
        sfx("click");
        resetGame();
      };
    }
  }

  // Boot
  render();
})();
