/* Missing times · Tactics For Listening Basic Unit 4
 * Listen to the conversation. Write the missing times.
 * Skill: Listening for details (gap-fill)
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-missing-times";
  var GAME_NAME = "Missing times";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  // Conversation audio (Jake) – CD 1-23
  var AUDIO_URL = "https://cdn.imgurl.ir/uploads/r1934_.mp3";

  // Blanks in order of appearance. accept = allowed answers (normalized)
  // Official answers: five fifteen / five fifty / five fifty, five fifteen / six fifty train / one fifteen
  var BLANKS = [
    {
      id: "b1",
      label: "get up at",
      accept: [
        "5:15", "5.15", "515", "5 15",
        "five fifteen", "five-fifteen", "5 fifteen"
      ],
      reveal: "5:15"
    },
    {
      id: "b2",
      label: "A asks",
      accept: [
        "5:50", "5.50", "550", "5 50",
        "five fifty", "five-fifty", "5 fifty"
      ],
      reveal: "5:50"
    },
    {
      id: "b3",
      label: "Not …",
      accept: [
        "5:50", "5.50", "550", "5 50",
        "five fifty", "five-fifty", "5 fifty"
      ],
      reveal: "5:50"
    },
    {
      id: "b4",
      label: "… , 5:15",
      accept: [
        "5:15", "5.15", "515", "5 15",
        "five fifteen", "five-fifteen", "5 fifteen"
      ],
      reveal: "5:15"
    },
    {
      id: "b5",
      label: "catch a … train",
      accept: [
        "6:50", "6.50", "650", "6 50",
        "six fifty", "six-fifty", "6 fifty",
        "6:50 train", "six fifty train", "650 train"
      ],
      reveal: "6:50"
    },
    {
      id: "b6",
      label: "up until",
      accept: [
        "1:15", "1.15", "115", "1 15",
        "one fifteen", "one-fifteen", "1 fifteen"
      ],
      reveal: "1:15"
    }
  ];

  var TOTAL = BLANKS.length;

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var answers = {}; // id -> typed string
  var checked = false;
  var results = []; // true/false per blank
  var playing = false;
  var audioError = false;
  var audio = null;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="mt-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="mt-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="mt-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function normalizeTime(s) {
    s = String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s:.]/g, "")
      .replace(/\s+/g, " ");
    // 5:15 / 5.15 / 515 → comparable forms already in accept lists
    return s;
  }

  function isCorrect(input, blank) {
    var n = normalizeTime(input);
    if (!n) return false;
    return blank.accept.some(function (a) {
      return normalizeTime(a) === n;
    });
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
    if (playing) {
      stopAudio();
      renderPlay();
      return;
    }
    if (!audio) {
      audio = new Audio(AUDIO_URL);
      audio.preload = "auto";
    }
    audioError = false;
    playing = true;
    renderPlay();
    audio.onended = function () {
      playing = false;
      renderPlay();
    };
    audio.onerror = function () {
      playing = false;
      audioError = true;
      renderPlay();
    };
    try {
      audio.currentTime = 0;
    } catch (e) {}
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () {
        playing = false;
        audioError = true;
        renderPlay();
      });
    }
  }

  function score() {
    var n = 0;
    for (var i = 0; i < TOTAL; i++) if (results[i]) n++;
    return n;
  }

  function calcStars() {
    var pct = TOTAL ? score() / TOTAL : 0;
    if (pct >= 0.9) return 3;
    if (pct >= 0.6) return 2;
    if (pct >= 0.3) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    answers = {};
    BLANKS.forEach(function (b) {
      answers[b.id] = "";
    });
    checked = false;
    results = [];
    stopAudio();
    phase = "play";
    render();
  }

  function checkAnswers() {
    if (checked) return;
    // read current inputs
    BLANKS.forEach(function (b) {
      var el = document.getElementById("inp-" + b.id);
      if (el) answers[b.id] = el.value;
    });
    checked = true;
    results = BLANKS.map(function (b) {
      return isCorrect(answers[b.id], b);
    });
    var s = score();
    if (s === TOTAL) sfx("win");
    else if (s >= Math.ceil(TOTAL * 0.6)) sfx("correct");
    else sfx("wrong");
    stopAudio();
    renderPlay();
  }

  function finish() {
    stopAudio();
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    if (window.LAFinish && LAFinish.show) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: score(),
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score() / TOTAL) * 100),
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

  function playIcon() {
    if (audioError) return ALERT_ICON;
    if (playing) return BARS_ICON;
    return PLAY_ICON;
  }

  function blankHtml(b, idx) {
    var val = answers[b.id] || "";
    var cls = "mt-blank";
    var feedback = "";
    if (checked) {
      if (results[idx]) {
        cls += " is-correct";
        feedback = '<span class="mt-fb ok">✓</span>';
      } else {
        cls += " is-wrong";
        feedback =
          '<span class="mt-fb bad">✕</span><span class="mt-reveal">' +
          esc(b.reveal) +
          "</span>";
      }
    }
    return (
      '<span class="' + cls + '">' +
      '<input type="text" id="inp-' + b.id + '" class="mt-input" ' +
      'placeholder="— : —" inputmode="decimal" autocomplete="off" spellcheck="false" ' +
      (checked ? "disabled " : "") +
      'value="' + esc(val) + '" data-idx="' + idx + '" aria-label="Blank ' + (idx + 1) + '">' +
      feedback +
      "</span>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">⏱️</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen to the conversation. Write the missing times.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="mt-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the conversation</span></li>' +
      '<li><span class="tip-num">2</span><span>Type the missing times in the blanks</span></li>' +
      '<li><span class="tip-num">3</span><span>Press <strong>Check answers</strong></span></li>' +
      "</ol></section>";
    document.getElementById("mt-start").onclick = startGame;
  }

  function renderPlay() {
    var counter = checked ? score() + " / " + TOTAL : "";
    var playCls =
      "mt-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");

    var head =
      '<div class="mt-head">' +
      '<button type="button" class="' + playCls + '" id="mt-replay" aria-label="Play conversation">' +
      playIcon() +
      "</button>" +
      '<div class="mt-head-text">' +
      "<strong>" + (playing ? "Playing…" : "Listen to the conversation") + "</strong>" +
      "<span>Jake talks about his daily routine</span>" +
      "</div></div>";

    // Dialogue with blanks
    var dialogue =
      '<div class="mt-dialogue">' +
      '<p class="mt-line"><span class="mt-speaker">A</span> You look tired, Jake.</p>' +
      '<p class="mt-line"><span class="mt-speaker">B</span> Yeah, I\'m always tired. I have to get up at ' +
      blankHtml(BLANKS[0], 0) +
      " every day.</p>" +
      '<p class="mt-line"><span class="mt-speaker">A</span> ' +
      blankHtml(BLANKS[1], 1) +
      "? Why so early?</p>" +
      '<p class="mt-line"><span class="mt-speaker">B</span> Not ' +
      blankHtml(BLANKS[2], 2) +
      ", " +
      blankHtml(BLANKS[3], 3) +
      ". Anyway, I go running before work, then I have to catch a " +
      blankHtml(BLANKS[4], 4) +
      " train to the city.</p>" +
      '<p class="mt-line"><span class="mt-speaker">A</span> Oh, I see. So, do you go to bed early?</p>' +
      '<p class="mt-line"><span class="mt-speaker">B</span> No, I\'m a night owl. Last night I was up until ' +
      blankHtml(BLANKS[5], 5) +
      ".</p>" +
      '<p class="mt-line"><span class="mt-speaker">A</span> That\'s not enough sleep, Jake! Maybe you should get a new job.</p>' +
      "</div>";

    var foot;
    if (!checked) {
      foot =
        '<div class="mt-foot">' +
        '<button type="button" class="lc-btn primary" id="mt-check">Check answers</button>' +
        "</div>";
    } else {
      var s = score();
      var msg =
        s === TOTAL
          ? "Perfect! All times correct."
          : s + " of " + TOTAL + " times correct.";
      foot =
        '<div class="mt-foot mt-foot-action">' +
        '<span class="mt-foot-text ' +
        (s === TOTAL ? "is-ok" : s >= 4 ? "is-mid" : "is-bad") +
        '">' +
        esc(msg) +
        "</span>" +
        '<button type="button" class="lc-btn primary" id="mt-finish">See results →</button>' +
        "</div>";
    }

    app.innerHTML =
      topBar(counter) +
      '<div class="mt-stage">' +
      head +
      dialogue +
      foot +
      "</div>";

    var replay = document.getElementById("mt-replay");
    if (replay) replay.onclick = play;

    if (!checked) {
      // live update answers as user types
      BLANKS.forEach(function (b) {
        var el = document.getElementById("inp-" + b.id);
        if (el) {
          el.oninput = function () {
            answers[b.id] = el.value;
          };
          el.onkeydown = function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              checkAnswers();
            }
          };
        }
      });
      var checkBtn = document.getElementById("mt-check");
      if (checkBtn) checkBtn.onclick = checkAnswers;
      // focus first empty
      var first = document.getElementById("inp-b1");
      if (first) setTimeout(function () { first.focus(); }, 200);
    } else {
      var fin = document.getElementById("mt-finish");
      if (fin) fin.onclick = finish;
    }
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score() + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Listening for times in a conversation.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="mt-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("mt-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    if (e.key === " " && document.activeElement && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      play();
    }
  });

  render();
})();
