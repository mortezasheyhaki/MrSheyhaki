/* What are they wearing? (Correct / Incorrect) · Tactics For Listening Basic Unit 3
 * Listen to four people. For each person, mark every statement Correct or Incorrect.
 * Redesigned for zero-scroll (100dvh) responsiveness on desktop and mobile.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-clothes-correct-incorrect";
  var GAME_NAME = "What are they wearing?";
  var UNIT = "Unit 3 · Basic";
  var BACK = "../../";
  var LETTERS = ["a", "b", "c", "d"];

  // Each person: name, audio, statements [{text, correct: true/false}]
  var ITEMS = [
    {
      who: "Sonia",
      audio: "https://cdn.imgurl.ir/uploads/e6708_.mp3",
      statements: [
        { text: "no jacket", correct: false },
        { text: "a bag", correct: false },
        { text: "no earrings", correct: false },
        { text: "black shoes", correct: true }
      ]
    },
    {
      who: "Matt",
      audio: "https://cdn.imgurl.ir/uploads/r41509_.mp3",
      statements: [
        { text: "new jeans", correct: false },
        { text: "a T-shirt", correct: false },
        { text: "brown boots", correct: true },
        { text: "no rings", correct: true }
      ]
    },
    {
      who: "Kevin",
      audio: "https://cdn.imgurl.ir/uploads/o94566_.mp3",
      statements: [
        { text: "a shirt", correct: true },
        { text: "no tie", correct: false },
        { text: "jeans", correct: false },
        { text: "a shoulder bag", correct: true }
      ]
    },
    {
      who: "Amy",
      audio: "https://cdn.imgurl.ir/uploads/d637901_.mp3",
      statements: [
        { text: "a skirt", correct: true },
        { text: "a black jacket", correct: true },
        { text: "a bag", correct: false },
        { text: "sneakers", correct: false }
      ]
    }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  // answers[person][statement] = true (Correct) | false (Incorrect) | null
  var answers = [];
  var checked = [];    // per person
  var score = 0;       // number of fully-correct people (all 4 statements right)
  var detailScore = 0; // total correct statements (out of 16)
  var playing = false;
  var played = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="cci-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="cci-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="cci-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  /* ---------- audio ---------- */
  function updateTrackBar() {
    var fill = document.getElementById("cci-track-fill");
    if (!fill) return;
    if (audio && audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
      var pct = Math.min(100, Math.max(0, (audio.currentTime / audio.duration) * 100));
      fill.style.width = pct + "%";
    } else {
      fill.style.width = "0%";
    }
  }

  function stopAudio() {
    playing = false;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
  }

  function play() {
    if (!HAS_AUDIO) return;
    sfx("click");
    stopAudio();
    audioError = false;
    audio = new Audio(ITEMS[current].audio);
    audio.preload = "auto";
    playing = true;
    played = true;
    renderPlay();

    audio.ontimeupdate = updateTrackBar;
    audio.onended = function () {
      playing = false;
      renderPlay();
    };
    audio.onerror = function () {
      playing = false;
      audioError = true;
      renderPlay();
    };

    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () {
        playing = false;
        audioError = true;
        renderPlay();
      });
    }
  }

  /* ---------- state ---------- */
  function setupGame() {
    answers = ITEMS.map(function (it) {
      return it.statements.map(function () {
        return null;
      });
    });
    checked = ITEMS.map(function () {
      return false;
    });
    current = 0;
    score = 0;
    detailScore = 0;
    played = false;
    audioError = false;
    stopAudio();
  }

  function personFullyCorrect(p) {
    var it = ITEMS[p];
    for (var i = 0; i < it.statements.length; i++) {
      if (answers[p][i] !== it.statements[i].correct) return false;
    }
    return true;
  }

  function calcStars() {
    var full = 0;
    var stmts = 0;
    for (var p = 0; p < TOTAL; p++) {
      if (personFullyCorrect(p)) full++;
      for (var i = 0; i < ITEMS[p].statements.length; i++) {
        if (answers[p][i] === ITEMS[p].statements[i].correct) stmts++;
      }
    }
    if (full === TOTAL) return 3;
    if (full >= 3 || stmts >= 14) return 2;
    if (full >= 2 || stmts >= 10) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) {
      LAStars.recordPlay(GAME_ID);
      playRecorded = true;
    }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-3",
          score: detailScore,
          maxScore: 16,
          accuracy: Math.round((detailScore / 16) * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    setupGame();
    playRecorded = false;
    phase = "play";
    render();
  }

  /* ---------- interaction ---------- */
  function setAnswer(stmtIdx, value) {
    if (checked[current]) return;
    sfx("click");
    answers[current][stmtIdx] = value;
    renderPlay();
  }

  function allAnswered() {
    return answers[current].every(function (v) {
      return v !== null;
    });
  }

  function checkAnswer() {
    if (checked[current] || !allAnswered()) return;
    checked[current] = true;
    var okCount = 0;
    var it = ITEMS[current];
    for (var i = 0; i < it.statements.length; i++) {
      if (answers[current][i] === it.statements[i].correct) {
        okCount++;
        detailScore++;
      }
    }
    if (okCount === it.statements.length) {
      score++;
      sfx("correct");
    } else {
      sfx("wrong");
    }
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!checked[current]) return;
    if (current + 1 >= TOTAL) {
      finish();
      return;
    }
    current++;
    played = false;
    audioError = false;
    stopAudio();
    renderPlay();
  }

  function finish() {
    stopAudio();
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: detailScore,
        total: 16,
        stars: stars,
        accuracy: Math.round((detailScore / 16) * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () {
          phase = "start";
          render();
        },
        backHref: BACK,
        save: false
      });
      return;
    }
    render();
  }

  /* ---------- views ---------- */
  function topBar(counter) {
    return (
      '<header class="lc-top">' +
        '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
        '<div class="lc-top-center">' +
          '<span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
          "<strong>" + esc(GAME_NAME) + "</strong>" +
        "</div>" +
        '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Person ' + (current + 1) + " of " + TOTAL + '">' +
        ITEMS.map(function (_, i) {
          var cls = i < current ? "is-done" : i === current ? "is-current" : "";
          if (checked[i]) cls = personFullyCorrect(i) ? "is-right" : "is-wrong";
          return '<i class="' + cls + '"></i>';
        }).join("") +
      "</div>"
    );
  }

  function playIcon() {
    if (audioError) return ALERT_ICON;
    if (playing) return BARS_ICON;
    return PLAY_ICON;
  }

  function playLabel() {
    if (audioError) return "Audio unavailable";
    if (playing) return "Playing…";
    if (played) return "Play again";
    return "Play the recording";
  }

  function playSub() {
    var it = ITEMS[current];
    if (audioError) return "Tap to retry loading.";
    if (playing) return "Listening to " + it.who + "…";
    return it.who + " · person " + (current + 1) + " of " + TOTAL;
  }

  function stmtRow(i) {
    var it = ITEMS[current];
    var st = it.statements[i];
    var ans = answers[current][i];
    var isChecked = checked[current];
    var isRight = isChecked && ans === st.correct;
    var isWrong = isChecked && ans !== st.correct;

    var rowCls = "cci-row";
    if (isRight) rowCls += " is-ok";
    if (isWrong) rowCls += " is-bad";

    var corrCls = "cci-choice" + (ans === true ? " is-picked" : "");
    var incorrCls = "cci-choice" + (ans === false ? " is-picked" : "");
    if (isChecked) {
      if (st.correct) corrCls += " is-truth";
      else incorrCls += " is-truth";
      if (ans === true && !st.correct) corrCls += " is-mistake";
      if (ans === false && st.correct) incorrCls += " is-mistake";
    }

    var disabled = isChecked ? " disabled" : "";

    return (
      '<div class="' + rowCls + '">' +
        '<span class="cci-letter">' + LETTERS[i] + "</span>" +
        '<span class="cci-text">' + esc(st.text) + "</span>" +
        '<div class="cci-choices">' +
          '<button type="button" class="' + corrCls + '" data-i="' + i + '" data-v="1"' + disabled + ">Correct</button>" +
          '<button type="button" class="' + incorrCls + '" data-i="' + i + '" data-v="0"' + disabled + ">Incorrect</button>" +
        "</div>" +
      "</div>"
    );
  }

  function footHtml() {
    var last = current + 1 >= TOTAL;
    if (!checked[current]) {
      if (!allAnswered()) {
        var hint = played ? "Mark each item Correct or Incorrect." : "Tap play to listen first.";
        return '<div class="cci-foot"><span class="cci-foot-text">' + esc(hint) + "</span></div>";
      }
      return (
        '<div class="cci-foot">' +
          '<span class="cci-foot-text">Ready! Tap Check to see your score.</span>' +
          '<button type="button" class="cci-next" id="cci-check">Check ✓</button>' +
        "</div>"
      );
    }
    var ok = personFullyCorrect(current);
    var msg = ok
      ? "Perfect! All four statements are right."
      : "Check the green highlights for the right answers.";
    return (
      '<div class="cci-foot">' +
        '<span class="cci-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="cci-next" id="cci-next">' + (last ? "See results →" : "Next →") + "</button>" +
      "</div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
        '<div class="lc-intro-main">' +
          '<div class="lc-hero-icon" aria-hidden="true">👕</div>' +
          "<h1>" + esc(GAME_NAME) + "</h1>" +
          '<p class="lc-intro-lede">Listen to four people. For each person, decide if the statements about their clothes are Correct or Incorrect.</p>' +
          '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="cci-start">Start listening →</button></div>' +
        "</div>" +
        '<ol class="lc-steps">' +
          '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
          '<li><span class="tip-num">2</span><span>Mark each line <strong>Correct</strong> or <strong>Incorrect</strong></span></li>' +
          '<li><span class="tip-num">3</span><span><strong>4</strong> people · 16 statements</span></li>' +
        "</ol>" +
      "</section>";
    document.getElementById("cci-start").onclick = startGame;
  }

  function renderPlay() {
    var it = ITEMS[current];
    var counter = (current + 1) + " / " + TOTAL;
    var playCls = "cci-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="lc-main cci-main">' +
        '<div class="cci-listen">' +
          '<button type="button" class="' + playCls + '" id="cci-replay" aria-label="' + esc(playLabel()) + '">' +
            playIcon() +
          "</button>" +
          '<div class="cci-listen-text">' +
            '<p class="cci-listen-title">' + esc(playLabel()) + "</p>" +
            '<p class="cci-listen-sub">' + esc(playSub()) + "</p>" +
            '<div class="cci-track" aria-hidden="true"><span id="cci-track-fill"></span></div>' +
          "</div>" +
        "</div>" +
        '<div class="cci-who-card">' +
          '<span class="cci-who-eyebrow">Listening Focus</span>' +
          '<p class="cci-who">What is <strong>' + esc(it.who) + "</strong> wearing?</p>" +
        "</div>" +
        '<div class="cci-right">' +
          '<div class="cci-list">' +
            it.statements.map(function (_, i) {
              return stmtRow(i);
            }).join("") +
          "</div>" +
          footHtml() +
        "</div>" +
      "</div>";

    updateTrackBar();

    // Bind events
    var replay = document.getElementById("cci-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) {
          stopAudio();
          renderPlay();
        } else {
          play();
        }
      };
    }
    app.querySelectorAll(".cci-choice").forEach(function (btn) {
      btn.onclick = function () {
        if (btn.disabled) return;
        var i = parseInt(btn.getAttribute("data-i"), 10);
        var v = btn.getAttribute("data-v") === "1";
        setAnswer(i, v);
      };
    });
    var checkBtn = document.getElementById("cci-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    var nextBtn = document.getElementById("cci-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
        '<div class="lc-intro-main">' +
          '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
          "<h1>" + detailScore + " of 16 correct</h1>" +
          '<p class="lc-intro-lede">You got ' + score + " of " + TOTAL + " people completely right.</p>" +
          '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
            '<button type="button" class="lc-btn primary" id="cci-again">Play again</button>' +
            '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 3</a>' +
          "</div>" +
        "</div>" +
      "</section>";
    document.getElementById("cci-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  // Keyboard shortcut: Space or R replays audio
  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      e.preventDefault();
      if (playing) {
        stopAudio();
        renderPlay();
      } else {
        play();
      }
    }
  });

  render();
})();