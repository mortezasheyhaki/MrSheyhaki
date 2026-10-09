/**
 * Circle the Article — choose the correct word/phrase
 * AEF Level 1 · Unit 11C
 * One sentence at a time · two options
 * LA stars + finish (save once)
 */
(function () {
  "use strict";

  var GAME_ID = "1-11c-circle-the-article";

  /**
   * options[0] and options[1] are the two choices.
   * correct: 0 or 1
   * sentence uses ___ where the choice goes (for display after select)
   */
  var ITEMS = [
    {
      before: "My brother is ",
      after: " studying math.",
      options: ["in college", "in the college"],
      correct: 0,
      explain: "Use in college (no the) for the general idea of studying at college."
    },
    {
      before: "I love traveling ",
      after: ".",
      options: ["by train", "by the train"],
      correct: 0,
      explain: "Use by train / by bus / by car — no article with by + transport."
    },
    {
      before: "We're going to visit my aunt ",
      after: ".",
      options: ["on weekend", "on the weekend"],
      correct: 1,
      explain: "In American English: on the weekend."
    },
    {
      before: "Let's stay ",
      after: " tonight. I don't want to go out.",
      options: ["at home", "at the home"],
      correct: 0,
      explain: "at home (no article). We don't say at the home in this meaning."
    },
    {
      before: "I love reading ",
      after: ".",
      options: ["novels", "the novels"],
      correct: 0,
      explain: "No article with plural nouns when you mean things in general (novels)."
    },
    {
      before: "Yolanda is ",
      after: " student in our class.",
      options: ["best", "the best"],
      correct: 1,
      explain: "Use the with superlatives: the best student."
    },
    {
      before: "I love clear nights when you can see ",
      after: ".",
      options: ["moon", "the moon"],
      correct: 1,
      explain: "Use the with unique things: the moon, the sun, the sky."
    },
    {
      before: "That's ",
      after: " I told you about yesterday.",
      options: ["the man", "a man"],
      correct: 0,
      explain: "the man = a specific man (the one I told you about)."
    },
    {
      before: "Can you open ",
      after: " for me, please?",
      options: ["a door", "the door"],
      correct: 1,
      explain: "the door = the specific door you both know about (e.g. this room's door)."
    },
    {
      before: "He had ",
      after: " late this morning.",
      options: ["breakfast", "the breakfast"],
      correct: 0,
      explain: "No article with meals: have breakfast, have lunch, have dinner."
    }
  ];

  var TOTAL = ITEMS.length;
  var LETTERS = ["A", "B"];

  var state = {
    screen: "start",
    index: 0,
    score: 0,
    selected: null,
    checked: false,
    started: false,
    finished: false
  };

  var app = document.getElementById("game-app");
  if (!app) return;

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

  function shell(bodyHtml, opts) {
    opts = opts || {};
    var pct = Math.round((state.index / TOTAL) * 100);
    if (state.screen === "done") pct = 100;

    return (
      '<div class="ca-top">' +
      '<a class="ca-back" href="../" aria-label="Back">←</a>' +
      '<div class="ca-title-wrap">' +
      '<div class="ca-kicker">Unit 11C · Grammar</div>' +
      '<h1 class="ca-title">Circle the Article</h1>' +
      "</div>" +
      (opts.score !== false
        ? '<div class="ca-score-pill" aria-live="polite">' +
          '<span class="ca-score-label">Score</span>' +
          '<span class="ca-score-value">' +
          state.score +
          " / " +
          TOTAL +
          "</span></div>"
        : "") +
      "</div>" +
      (opts.progress !== false
        ? '<div class="ca-progress" role="progressbar" aria-valuenow="' +
          pct +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="ca-progress-fill" style="width:' +
          pct +
          '%"></div></div>'
        : "") +
      '<div class="ca-body">' +
      bodyHtml +
      "</div>" +
      '<div class="ca-footer">' +
      '<button type="button" class="ca-btn ca-btn-ghost" id="ca-restart">Start Again</button>' +
      '<span class="ca-footer-note">the / no article</span>' +
      "</div>"
    );
  }

  function bindShell() {
    var r = document.getElementById("ca-restart");
    if (r) r.onclick = function () { resetGame(false); };
  }

  function render() {
    if (state.screen === "start") renderStart();
    else if (state.screen === "done") renderDoneFallback();
    else renderPlay();
  }

  function renderStart() {
    app.innerHTML = shell(
      '<div class="ca-card ca-hero">' +
        '<div class="ca-hero-icon" aria-hidden="true">⭕</div>' +
        "<h2>Circle the correct word</h2>" +
        "<p>Choose the correct option in each sentence. Think about when we use <strong>the</strong> and when we use no article.</p>" +
        '<div class="ca-howto">' +
        "<strong>Example</strong><br>" +
        "How much time do you spend on <em>internet</em> / <strong>the internet</strong>?<br><br>" +
        "<strong>How to play</strong>" +
        "<ol>" +
        "<li>Read the sentence.</li>" +
        "<li>Tap the correct option (A or B).</li>" +
        "<li>Check, then go to the next sentence.</li>" +
        "<li>" +
        TOTAL +
        " sentences.</li>" +
        "</ol></div>" +
        '<button type="button" class="ca-btn ca-btn-primary" id="ca-start">Start</button>' +
        "</div>",
      { score: false, progress: false }
    );
    bindShell();
    document.getElementById("ca-start").onclick = function () {
      sfx("click");
      state.screen = "play";
      state.index = 0;
      state.score = 0;
      state.selected = null;
      state.checked = false;
      state.started = false;
      state.finished = false;
      render();
    };
  }

  function renderPlay() {
    var item = ITEMS[state.index];
    var locked = state.checked;

    var optsHtml = "";
    item.options.forEach(function (opt, idx) {
      var cls = "ca-option";
      if (state.selected === idx) cls += " is-selected";
      if (locked) {
        if (idx === item.correct) cls += " is-correct";
        else if (state.selected === idx && idx !== item.correct) cls += " is-wrong";
      }
      optsHtml +=
        '<button type="button" class="' +
        cls +
        '" data-idx="' +
        idx +
        '"' +
        (locked ? " disabled" : "") +
        ">" +
        '<span class="ca-letter">' +
        LETTERS[idx] +
        "</span>" +
        '<span class="ca-opt-text">' +
        opt +
        "</span></button>";
    });

    var displaySentence =
      item.before +
      (state.selected != null
        ? "<strong>" + item.options[state.selected] + "</strong>"
        : "<span style='border-bottom:2px solid var(--ca-blue);padding:0 4px'>····</span>") +
      item.after;

    var fb = "";
    if (locked) {
      var ok = state.selected === item.correct;
      fb =
        '<div class="ca-feedback is-' +
        (ok ? "correct" : "wrong") +
        '" role="status">' +
        "<strong>" +
        (ok ? "✓ Correct!" : "✗ Not quite") +
        "</strong>" +
        item.explain +
        "</div>";
    }

    var nextLabel =
      state.index + 1 >= TOTAL ? "Finish" : "Next sentence →";

    app.innerHTML = shell(
      '<div class="ca-card">' +
        '<div class="ca-q-num">Sentence ' +
        (state.index + 1) +
        " of " +
        TOTAL +
        "</div>" +
        '<p class="ca-sentence">' +
        displaySentence +
        "</p>" +
        '<div class="ca-options">' +
        optsHtml +
        "</div>" +
        fb +
        '<div class="ca-actions">' +
        (locked
          ? '<button type="button" class="ca-btn ca-btn-success" id="ca-next">' +
            nextLabel +
            "</button>"
          : '<button type="button" class="ca-btn ca-btn-primary" id="ca-check" disabled>Check answer</button>') +
        "</div></div>"
    );

    bindShell();

    if (!locked) {
      var checkBtn = document.getElementById("ca-check");
      Array.prototype.forEach.call(document.querySelectorAll(".ca-option"), function (btn) {
        btn.onclick = function () {
          state.selected = parseInt(btn.getAttribute("data-idx"), 10);
          sfx("click");
          render();
        };
      });
      if (checkBtn) {
        checkBtn.disabled = state.selected === null;
        checkBtn.onclick = function () {
          if (state.selected === null) return;
          startTimerOnce();
          state.checked = true;
          var ok = state.selected === item.correct;
          if (ok) state.score += 1;
          sfx(ok ? "correct" : "wrong");
          render();
        };
      }
    } else {
      document.getElementById("ca-next").onclick = function () {
        sfx("click");
        if (state.index + 1 >= TOTAL) {
          finishGame();
        } else {
          state.index += 1;
          state.selected = null;
          state.checked = false;
          render();
        }
      };
    }
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true;
    state.screen = "done";
    sfx("win");

    var stars = saveStars();
    var acc = calcAccuracy();

    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: state.score,
          total: TOTAL,
          accuracy: acc,
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: function () {
            resetGame(true);
          },
          backHref: "../"
        });
        return;
      }
    } catch (_) {}

    renderDoneFallback();
  }

  function renderDoneFallback() {
    var acc = calcAccuracy();
    var note =
      acc >= 90
        ? "Excellent! You know when to use the."
        : acc >= 70
          ? "Good work! Review the explanations and try again."
          : "Keep practising articles — meals, transport, and superlatives are key.";

    app.innerHTML = shell(
      '<div class="ca-card ca-hero">' +
        '<div class="ca-hero-icon" aria-hidden="true">🏆</div>' +
        "<h2>Well done!</h2>" +
        '<p style="font-size:1.5rem;font-weight:800;color:var(--ca-blue);margin:8px 0">' +
        state.score +
        " / " +
        TOTAL +
        "</p>" +
        "<p>" +
        note +
        "</p>" +
        '<div class="ca-actions" style="justify-content:center;margin-top:12px">' +
        '<button type="button" class="ca-btn ca-btn-primary" id="ca-again">Play again</button>' +
        '<a class="ca-btn ca-btn-ghost" href="../" style="text-decoration:none;display:inline-flex;align-items:center">Back to games</a>' +
        "</div></div>",
      { progress: false }
    );
    bindShell();
    var again = document.getElementById("ca-again");
    if (again) again.onclick = function () { resetGame(true); };
  }

  function resetGame(skipConfirm) {
    if (!skipConfirm && (state.score > 0 || state.index > 0)) {
      if (!window.confirm("Start again? Your progress will be cleared.")) return;
    }
    state.screen = "start";
    state.index = 0;
    state.score = 0;
    state.selected = null;
    state.checked = false;
    state.started = false;
    state.finished = false;
    render();
  }

  render();
})();
