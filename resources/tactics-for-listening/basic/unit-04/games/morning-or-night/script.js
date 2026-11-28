/* Morning or night? · Tactics For Listening Basic Unit 4
 * Listen and choose a or b about each person.
 * Same audio as get-up-go-to-bed.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-morning-or-night";
  var GAME_NAME = "Morning or night?";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  // correct: 0 = a, 1 = b
  var ITEMS = [
    {
      who: "Sandra",
      audio: "https://cdn.imgurl.ir/uploads/m6112_.mp3",
      options: [
        "Sandra studies before school.",
        "Sandra studies at night."
      ],
      correct: 0
    },
    {
      who: "John",
      audio: "https://cdn.imgurl.ir/uploads/k70028_.mp3",
      options: [
        "John looks happy.",
        "John looks tired."
      ],
      correct: 1
    },
    {
      who: "Sam",
      audio: "https://cdn.imgurl.ir/uploads/784194_.mp3",
      options: [
        "Sam usually goes running in the morning.",
        "Sam usually sleeps late in the morning."
      ],
      correct: 1
    },
    {
      who: "Grace",
      audio: "https://cdn.imgurl.ir/uploads/q7585_.mp3",
      options: [
        "Grace is a night person.",
        "Grace is a morning person."
      ],
      correct: 0
    },
    {
      who: "Mia",
      audio: "https://cdn.imgurl.ir/uploads/y83499_.mp3",
      options: [
        "Mia gets up early to go to work.",
        "Mia gets up early to take a walk."
      ],
      correct: 1
    },
    {
      who: "James",
      audio: "https://cdn.imgurl.ir/uploads/z485436_.mp3",
      options: [
        "James likes his new job.",
        "James likes working at night."
      ],
      correct: 0
    }
  ];

  var LETTERS = ["a", "b"];
  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  var choice = null;
  var checked = false;
  var results = [];
  var playing = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="mon-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="mon-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="mon-play-alert" aria-hidden="true">!</span>';

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

  function updateAudioUI() {
    var replay = document.getElementById("mon-replay");
    var title = document.querySelector(".mon-listen-title");
    if (replay) {
      replay.className = "mon-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
      replay.setAttribute("aria-label", playLabel());
      replay.innerHTML = playIcon();
    }
    if (title) title.textContent = playLabel();
  }

  function play() {
    if (!HAS_AUDIO) return;
    sfx("click");
    stopAudio();
    audioError = false;
    audio = new Audio(ITEMS[current].audio);
    audio.preload = "auto";
    playing = true;
    updateAudioUI();
    audio.onended = function () { playing = false; updateAudioUI(); };
    audio.onerror = function () { playing = false; audioError = true; updateAudioUI(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; updateAudioUI(); });
    }
  }

  function score() {
    var n = 0;
    for (var i = 0; i < results.length; i++) if (results[i]) n++;
    return n;
  }

  function calcStars() {
    var s = score();
    if (s >= TOTAL) return 3;
    if (s >= 4) return 2;
    if (s >= 3) return 1;
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
          unit: "basic-4",
          score: score(),
          maxScore: TOTAL,
          accuracy: Math.round((score() / TOTAL) * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    current = 0;
    choice = null;
    checked = false;
    results = [];
    playRecorded = false;
    stopAudio();
    phase = "play";
    render();
  }

  function pick(i) {
    if (checked) return;
    choice = i;
    // auto-check for fast mobile play
    checked = true;
    var ok = choice === ITEMS[current].correct;
    results[current] = ok;
    sfx(ok ? "correct" : "wrong");
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!checked) return;
    if (current + 1 >= TOTAL) {
      finish();
      return;
    }
    current++;
    choice = null;
    checked = false;
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
        score: score(),
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score() / TOTAL) * 100),
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
        if (i < results.length) cls = results[i] ? "is-right" : "is-wrong";
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
    return "Play the recording";
  }

  function optHtml(i) {
    var it = ITEMS[current];
    var cls = "mon-opt";
    var tick = "";
    if (checked) {
      if (i === it.correct) {
        cls += " is-correct";
        tick = '<span class="mon-tick" aria-hidden="true">✓</span>';
      } else if (i === choice) {
        cls += " is-wrong";
        tick = '<span class="mon-tick" aria-hidden="true">✕</span>';
      } else {
        cls += " is-idle";
      }
    }
    return (
      '<button type="button" class="' + cls + '" data-i="' + i + '"' +
      (checked ? " disabled" : "") + ">" +
      '<span class="mon-letter" aria-hidden="true">' + LETTERS[i] + "</span>" +
      '<span class="mon-text">' + esc(it.options[i]) + "</span>" + tick +
      "</button>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen again. Choose the sentence that is true about each person.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="mon-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>a</strong> or <strong>b</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("mon-start").onclick = startGame;
  }

  function renderPlay() {
    var it = ITEMS[current];
    var counter = (current + 1) + " / " + TOTAL;
    var last = current + 1 >= TOTAL;
    var playCls = "mon-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");

    var foot;
    if (!checked) {
      foot = '<div class="mon-foot"><span class="mon-foot-text">Listen, then choose a or b.</span></div>';
    } else {
      var ok = results[current];
      var msg = ok
        ? "Correct!"
        : "Not quite. The answer is " + LETTERS[it.correct] + ".";
      foot =
        '<div class="mon-foot mon-foot-action">' +
        '<span class="mon-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' + esc(msg) + "</span>" +
        '<button type="button" class="mon-next" id="mon-next">' +
        (last ? "See results →" : "Next →") + "</button></div>";
    }

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="mon-main">' +
        '<div class="mon-listen">' +
          '<button type="button" class="' + playCls + '" id="mon-replay" aria-label="' + esc(playLabel()) + '">' +
            playIcon() +
          "</button>" +
          '<div class="mon-listen-text">' +
            '<p class="mon-listen-title">' + esc(playLabel()) + "</p>" +
            '<p class="mon-listen-sub"><strong>' + esc(it.who) + "</strong> · person " + (current + 1) + " of " + TOTAL + "</p>" +
          "</div>" +
        "</div>" +

        '<p class="mon-prompt">Which sentence is true about <strong>' + esc(it.who) + "</strong>?</p>" +

        '<div class="mon-opts" role="group" aria-label="Choices">' +
          optHtml(0) + optHtml(1) +
        "</div>" +

        foot +
      "</div>";

    var replay = document.getElementById("mon-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) { stopAudio(); updateAudioUI(); }
        else play();
      };
    }

    app.querySelectorAll(".mon-opt").forEach(function (btn) {
      btn.onclick = function () {
        if (btn.disabled) return;
        pick(parseInt(btn.getAttribute("data-i"), 10));
      };
    });

    var nextBtn = document.getElementById("mon-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score() + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Listen carefully for details about each person\'s routine.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="mon-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("mon-again").onclick = startGame;
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
      if (playing) { stopAudio(); updateAudioUI(); }
      else play();
      return;
    }
    if (!checked && (k === "a" || k === "1")) { e.preventDefault(); pick(0); }
    if (!checked && (k === "b" || k === "2")) { e.preventDefault(); pick(1); }
    if (checked && (k === "enter" || k === " ")) {
      e.preventDefault();
      next();
    }
  });

  render();
})();
