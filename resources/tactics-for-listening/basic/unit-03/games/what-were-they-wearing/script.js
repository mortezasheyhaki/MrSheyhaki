/* What was each person wearing? · Task 2 · Tactics For Listening Basic Unit 3
 * Listen again. Choose a / b / c to complete each sentence.
 * Same recordings as clothes-correct-incorrect.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-what-were-they-wearing";
  var GAME_NAME = "What was each person wearing?";
  var UNIT = "Unit 3 · Basic";
  var BACK = "../../";
  var LETTERS = ["a", "b", "c"];

  var ITEMS = [
    {
      who: "Sonia",
      before: "Sonia was wearing a",
      after: "skirt.",
      options: ["yellow", "black", "dark blue"],
      correct: 2,
      audio: "https://cdn.imgurl.ir/uploads/e6708_.mp3"
    },
    {
      who: "Matt",
      before: "Matt was wearing a",
      after: "belt.",
      options: ["red", "wide", "silver"],
      correct: 1,
      audio: "https://cdn.imgurl.ir/uploads/r41509_.mp3"
    },
    {
      who: "Kevin",
      before: "Kevin was wearing",
      after: "pants.",
      options: ["brown", "white", "green"],
      correct: 0,
      audio: "https://cdn.imgurl.ir/uploads/o94566_.mp3"
    },
    {
      who: "Amy",
      before: "Amy was wearing",
      after: "glasses.",
      options: ["expensive", "black", "beautiful"],
      correct: 0,
      audio: "https://cdn.imgurl.ir/uploads/d637901_.mp3"
    }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  var choice = [];
  var checked = [];
  var score = 0;
  var playing = false;
  var played = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="www-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="www-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="www-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function stopAudio() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
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
    audio.onended = function () { playing = false; renderPlay(); };
    audio.onerror = function () { playing = false; audioError = true; renderPlay(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderPlay(); });
    }
  }

  function setupGame() {
    choice = ITEMS.map(function () { return null; });
    checked = ITEMS.map(function () { return false; });
    current = 0;
    score = 0;
    played = false;
    audioError = false;
    stopAudio();
  }

  function calcStars() {
    if (score >= TOTAL) return 3;
    if (score >= 3) return 2;
    if (score >= 2) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-3",
          score: score,
          maxScore: TOTAL,
          accuracy: Math.round((score / TOTAL) * 100),
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

  function pick(i) {
    if (checked[current]) return;
    choice[current] = i;
    renderPlay();
  }

  function checkAnswer() {
    if (checked[current] || choice[current] === null) return;
    checked[current] = true;
    if (choice[current] === ITEMS[current].correct) {
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
        score: score,
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score / TOTAL) * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false
      });
      return;
    }
    render();
  }

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>" + esc(GAME_NAME) + "</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Question ' + (current + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (checked[i]) cls = choice[i] === ITEMS[i].correct ? "is-right" : "is-wrong";
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
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
    if (audioError) return "This recording could not load.";
    if (playing) return "Listening to " + it.who + "…";
    return it.who + " · person " + (current + 1) + " of " + TOTAL;
  }

  function sentenceHtml() {
    var it = ITEMS[current];
    var filled = checked[current] && choice[current] === it.correct;
    var blank;
    if (checked[current]) {
      var word = it.options[it.correct];
      blank = '<span class="www-blank is-filled">' + esc(word) + "</span>";
    } else if (choice[current] !== null) {
      blank = '<span class="www-blank is-picked">' + esc(it.options[choice[current]]) + "</span>";
    } else {
      blank = '<span class="www-blank" aria-label="blank"></span>';
    }
    return esc(it.before) + " " + blank + " " + esc(it.after);
  }

  function optHtml(i) {
    var it = ITEMS[current];
    var mine = choice[current];
    var cls = "www-opt";
    var tick = "";
    if (checked[current]) {
      if (i === it.correct) {
        cls += " is-correct";
        tick = '<span class="www-tick" aria-hidden="true">✓</span>';
      } else if (i === mine) {
        cls += " is-wrong";
        tick = '<span class="www-tick" aria-hidden="true">✕</span>';
      } else {
        cls += " is-idle";
      }
    } else if (i === mine) {
      cls += " is-picked";
    }
    return (
      '<button type="button" class="' + cls + '" data-i="' + i + '"' +
      (checked[current] ? " disabled" : "") + ">" +
      '<span class="www-letter" aria-hidden="true">' + LETTERS[i] + "</span>" +
      '<span class="www-text">' + esc(it.options[i]) + "</span>" + tick +
      "</button>"
    );
  }

  function footHtml() {
    var last = current + 1 >= TOTAL;
    if (choice[current] !== null && !checked[current]) {
      return (
        '<div class="www-foot">' +
        '<span class="www-foot-text">You can change your answer, then Check.</span>' +
        '<button type="button" class="www-next" id="www-check">Check ✓</button></div>'
      );
    }
    if (checked[current]) {
      var it = ITEMS[current];
      var ok = choice[current] === it.correct;
      var msg = ok
        ? "Correct!"
        : "Not quite. The answer is " + LETTERS[it.correct] + ": " + it.options[it.correct] + ".";
      return (
        '<div class="www-foot">' +
        '<span class="www-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="www-next" id="www-next">' +
        (last ? "See results →" : "Next →") + "</button></div>"
      );
    }
    var hint = played ? "Choose a, b or c." : "Tap play to listen first.";
    return '<div class="www-foot"><span class="www-foot-text">' + esc(hint) + "</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen again. Choose the word that completes each sentence about what the person was wearing.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="www-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>a</strong>, <strong>b</strong> or <strong>c</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>4</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("www-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = (current + 1) + " / " + TOTAL;
    var playCls = "www-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="lc-main www-main">' +
      '<div class="www-left">' +
      '<div class="www-listen">' +
      '<button type="button" class="' + playCls + '" id="www-replay" aria-label="' + esc(playLabel()) + '">' +
      playIcon() + "</button>" +
      '<div class="www-listen-text">' +
      '<p class="www-listen-title">' + esc(playLabel()) + "</p>" +
      '<p class="www-listen-sub">' + esc(playSub()) + "</p>" +
      "</div></div>" +
      '<p class="www-sentence" aria-live="polite">' + sentenceHtml() + "</p>" +
      "</div>" +
      '<div class="www-right">' +
      '<div class="www-opts" role="group" aria-label="Choices">' +
      LETTERS.map(function (_, i) { return optHtml(i); }).join("") +
      "</div>" +
      footHtml() +
      "</div>" +
      "</div>";

    var replay = document.getElementById("www-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) { stopAudio(); renderPlay(); }
        else play();
      };
    }
    app.querySelectorAll(".www-opt").forEach(function (el) {
      el.onclick = function () {
        if (el.disabled) return;
        pick(parseInt(el.getAttribute("data-i"), 10));
      };
    });
    var checkBtn = document.getElementById("www-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    var nextBtn = document.getElementById("www-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Listen for the key detail that completes each sentence.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="www-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 3</a>' +
      "</div></div></section>";
    document.getElementById("www-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      e.preventDefault();
      if (playing) { stopAudio(); renderPlay(); }
      else play();
      return;
    }
    var map = { a: 0, b: 1, c: 2, "1": 0, "2": 1, "3": 2 };
    if (map[k] !== undefined && !checked[current]) {
      e.preventDefault();
      pick(map[k]);
    }
  });

  render();
})();
