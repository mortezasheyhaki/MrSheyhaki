/**
 * Going Home · True or False
 * AEF Level 1 · Practical English 6
 * All 5 sentences visible · watch video · mark T/F · check
 * LA stars + finish (save once)
 */
(function () {
  "use strict";

  var GAME_ID = "1-pe6-going-home-tf";
  var VIDEO_URL =
    "https://cdn.imgurl.ir/uploads/k605024_AEF3e_SB1_PE_Ep6_Jenny39s_last_morning.mp4";

  var ITEMS = [
    {
      text: "Rob arrives late.",
      answer: true,
      explain: "True — Rob arrives late."
    },
    {
      text: "He has a coffee with Jenny.",
      answer: false,
      explain: "False — he does not have a coffee with Jenny."
    },
    {
      text: "Jenny has bad news for him.",
      answer: false,
      explain: "False — Jenny does not have bad news for him."
    },
    {
      text: "Rob thinks A writer in New York is a good name for a column.",
      answer: false,
      explain: "False — Rob does not think that is a good name for a column."
    },
    {
      text: "Rob needs time to think.",
      answer: true,
      explain: "True — Rob needs time to think."
    }
  ];

  var TOTAL = ITEMS.length;

  var state = {
    screen: "start",
    answers: {}, // index -> true | false
    checked: false,
    score: 0,
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

  function allAnswered() {
    for (var i = 0; i < TOTAL; i++) {
      if (state.answers[i] !== true && state.answers[i] !== false) return false;
    }
    return true;
  }

  function answeredCount() {
    var n = 0;
    for (var i = 0; i < TOTAL; i++) {
      if (state.answers[i] === true || state.answers[i] === false) n++;
    }
    return n;
  }

  function stopMedia() {
    var v = document.getElementById("gh-video");
    if (v) {
      try {
        v.pause();
      } catch (_) {}
    }
  }

  function shell(bodyHtml, opts) {
    opts = opts || {};
    var pct = Math.round((answeredCount() / TOTAL) * 100);
    if (state.checked || state.screen === "done") pct = 100;

    return (
      '<div class="gh-top">' +
      '<a class="gh-back" href="../" aria-label="Back">←</a>' +
      '<div class="gh-title-wrap">' +
      '<div class="gh-kicker">Practical English 6 · Listening</div>' +
      '<h1 class="gh-title">Going Home</h1>' +
      "</div>" +
      (opts.score !== false
        ? '<div class="gh-score-pill" aria-live="polite">' +
          '<span class="gh-score-label">' +
          (state.checked ? "Score" : "Done") +
          "</span>" +
          '<span class="gh-score-value">' +
          (state.checked
            ? state.score + " / " + TOTAL
            : answeredCount() + " / " + TOTAL) +
          "</span></div>"
        : "") +
      "</div>" +
      (opts.progress !== false
        ? '<div class="gh-progress" role="progressbar" aria-valuenow="' +
          pct +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="gh-progress-fill" style="width:' +
          pct +
          '%"></div></div>'
        : "") +
      '<div class="gh-body">' +
      bodyHtml +
      "</div>" +
      '<div class="gh-footer">' +
      '<button type="button" class="gh-btn gh-btn-ghost" id="gh-restart">Start Again</button>' +
      '<span class="gh-footer-note">Watch · mark True or False</span>' +
      "</div>"
    );
  }

  function bindShell() {
    var r = document.getElementById("gh-restart");
    if (r) r.onclick = function () { resetGame(false); };
  }

  function render() {
    if (state.screen === "start") renderStart();
    else if (state.screen === "done") renderDoneFallback();
    else renderPlay();
  }

  function renderStart() {
    stopMedia();
    app.innerHTML = shell(
      '<div class="gh-card gh-hero">' +
        '<div class="gh-hero-icon" aria-hidden="true">🎬</div>' +
        "<h2>Going home</h2>" +
        "<p>Watch Rob and Jenny. Mark each sentence <strong>True</strong> or <strong>False</strong>.</p>" +
        '<div class="gh-howto">' +
        "<strong>How to play</strong>" +
        "<ol>" +
        "<li>Watch the video (replay anytime).</li>" +
        "<li>For each sentence, tap <strong>T</strong> or <strong>F</strong>.</li>" +
        "<li>When all five are marked, check your answers.</li>" +
        "</ol></div>" +
        '<button type="button" class="gh-btn gh-btn-primary" id="gh-start">Start</button>' +
        "</div>",
      { score: false, progress: false }
    );
    bindShell();
    document.getElementById("gh-start").onclick = function () {
      sfx("click");
      state.screen = "play";
      state.answers = {};
      state.checked = false;
      state.score = 0;
      state.started = false;
      state.finished = false;
      render();
    };
  }

  function tfBtn(idx, val, label, shortLabel) {
    var chosen = state.answers[idx] === val;
    var locked = state.checked;
    var item = ITEMS[idx];
    var cls = "gh-tf-btn";
    if (chosen) cls += " is-on";
    if (locked) {
      if (val === item.answer) cls += " is-correct";
      else if (chosen && val !== item.answer) cls += " is-wrong";
    }
    return (
      '<button type="button" class="' +
      cls +
      '" data-idx="' +
      idx +
      '" data-val="' +
      (val ? "true" : "false") +
      '"' +
      (locked ? " disabled" : "") +
      ' aria-pressed="' +
      (chosen ? "true" : "false") +
      '" aria-label="' +
      label +
      '">' +
      '<span class="gh-tf-circle" aria-hidden="true">' +
      (chosen ? '<span class="gh-tf-tick">✓</span>' : "") +
      "</span>" +
      '<span class="gh-tf-label">' +
      shortLabel +
      "</span></button>"
    );
  }

  function renderPlay() {
    var rows = "";
    ITEMS.forEach(function (item, idx) {
      var rowCls = "gh-row";
      if (state.checked) {
        var ok = state.answers[idx] === item.answer;
        rowCls += ok ? " is-correct-row" : " is-wrong-row";
      }
      rows +=
        '<div class="' +
        rowCls +
        '">' +
        '<div class="gh-row-num">' +
        (idx + 1) +
        "</div>" +
        '<div class="gh-row-body">' +
        '<p class="gh-row-text">' +
        item.text +
        "</p>" +
        (state.checked
          ? '<p class="gh-row-explain">' + item.explain + "</p>"
          : "") +
        "</div>" +
        '<div class="gh-tf-pair" role="group" aria-label="Sentence ' +
        (idx + 1) +
        '">' +
        tfBtn(idx, true, "True", "T") +
        tfBtn(idx, false, "False", "F") +
        "</div></div>";
    });

    var actions = "";
    if (!state.checked) {
      actions =
        '<div class="gh-actions gh-actions-bar">' +
        '<button type="button" class="gh-btn gh-btn-primary" id="gh-check"' +
        (allAnswered() ? "" : " disabled") +
        ">Check answers</button>" +
        '<button type="button" class="gh-btn gh-btn-ghost" id="gh-clear">Clear</button>' +
        "</div>";
    } else {
      actions =
        '<div class="gh-actions gh-actions-bar">' +
        '<button type="button" class="gh-btn gh-btn-success" id="gh-finish">Finish</button>' +
        "</div>";
    }

    app.innerHTML = shell(
      '<div class="gh-card gh-video-card">' +
        '<div class="gh-audio-label">Video · Jenny\'s last morning · PE6</div>' +
        '<div class="gh-video-wrap">' +
        '<video id="gh-video" class="gh-video" playsinline preload="metadata" controls ' +
        'src="' +
        VIDEO_URL +
        '" title="Going home — Rob and Jenny">' +
        "Your browser does not support video." +
        "</video>" +
        "</div>" +
        '<p class="gh-video-hint">Watch the video, then mark each sentence True (T) or False (F).</p>' +
        "</div>" +
        '<div class="gh-card gh-list-card">' +
        '<div class="gh-list-head">' +
        "<span>Mark T or F</span>" +
        '<span class="gh-list-legend"><span class="gh-leg-t">T</span> True · <span class="gh-leg-f">F</span> False</span>' +
        "</div>" +
        '<div class="gh-list">' +
        rows +
        "</div>" +
        actions +
        "</div>"
    );

    bindShell();
    bindPlay();
  }

  function bindPlay() {
    var v = document.getElementById("gh-video");
    if (v) {
      v.addEventListener("play", function () {
        startTimerOnce();
      });
    }

    if (!state.checked) {
      Array.prototype.forEach.call(
        document.querySelectorAll(".gh-tf-btn"),
        function (btn) {
          btn.onclick = function () {
            var idx = parseInt(btn.getAttribute("data-idx"), 10);
            var val = btn.getAttribute("data-val") === "true";
            sfx("click");
            startTimerOnce();
            state.answers[idx] = val;
            render();
          };
        }
      );

      var checkBtn = document.getElementById("gh-check");
      if (checkBtn) {
        checkBtn.onclick = function () {
          if (!allAnswered()) return;
          state.checked = true;
          state.score = 0;
          for (var i = 0; i < TOTAL; i++) {
            if (state.answers[i] === ITEMS[i].answer) state.score += 1;
          }
          sfx(state.score === TOTAL ? "win" : state.score > 0 ? "correct" : "wrong");
          render();
        };
      }

      var clearBtn = document.getElementById("gh-clear");
      if (clearBtn) {
        clearBtn.onclick = function () {
          sfx("click");
          state.answers = {};
          render();
        };
      }
    } else {
      var fin = document.getElementById("gh-finish");
      if (fin) {
        fin.onclick = function () {
          sfx("click");
          finishGame();
        };
      }
    }
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true;
    state.screen = "done";
    stopMedia();
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
        ? "Excellent! You followed Rob and Jenny well."
        : acc >= 70
          ? "Good work! Watch again for any details you missed."
          : "Keep practising — watch the video again and try once more.";

    app.innerHTML = shell(
      '<div class="gh-card gh-hero">' +
        '<div class="gh-hero-icon" aria-hidden="true">🏆</div>' +
        "<h2>Well done!</h2>" +
        '<p style="font-size:1.6rem;font-weight:800;color:var(--gh-indigo);margin:8px 0">' +
        state.score +
        " / " +
        TOTAL +
        "</p>" +
        "<p>" +
        note +
        "</p>" +
        '<div class="gh-actions" style="justify-content:center">' +
        '<button type="button" class="gh-btn gh-btn-primary" id="gh-again">Play again</button>' +
        '<a class="gh-btn gh-btn-ghost" href="../" style="text-decoration:none;display:inline-flex;align-items:center">Back</a>' +
        "</div></div>",
      { progress: false }
    );
    bindShell();
    var again = document.getElementById("gh-again");
    if (again) again.onclick = function () { resetGame(true); };
  }

  function resetGame(skipConfirm) {
    if (!skipConfirm && answeredCount() > 0) {
      if (!window.confirm("Start again? Your progress will be cleared.")) return;
    }
    stopMedia();
    state.screen = "start";
    state.answers = {};
    state.checked = false;
    state.score = 0;
    state.started = false;
    state.finished = false;
    render();
  }

  render();
})();
