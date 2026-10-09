/**
 * Phone Interviews — Listening Comprehension
 * AEF Level 1 · Unit 11C · Track 11.11
 * LA stars + finish integrated (save once, no double-count)
 */
(function () {
  "use strict";

  var GAME_ID = "1-11c-phone-interviews";
  var AUDIO_URL = "https://cdn.imgurl.ir/uploads/i295865_AEF3e_Level_1_SB_11.11.mp3";

  var QUESTIONS = [
    {
      q: "What kind of phone does Speaker A have?",
      options: ["An Android smartphone", "An iPhone", "A Samsung Galaxy", "A basic phone with no apps"],
      correct: 1,
      explain: "Speaker A says, “I have an iPhone.”"
    },
    {
      q: "How old is Speaker A’s phone?",
      options: ["About six months old", "Brand new", "About two years old", "About four years old"],
      correct: 2,
      explain: "Speaker A says the phone is “about two years old.”"
    },
    {
      q: "How long does Speaker A usually keep a phone?",
      options: [
        "About one year",
        "About two to three years",
        "About four years — if they don’t lose it",
        "They change phones every few months"
      ],
      correct: 2,
      explain: "Speaker A usually keeps a phone about four years, if they don’t lose it."
    },
    {
      q: "What does Speaker A use their phone for the most?",
      options: ["Making phone calls", "Online banking", "The internet and messaging", "Reading e-books"],
      correct: 2,
      explain: "Speaker A says “Probably the internet. And messaging” — apps like SnapChat and Facebook Messenger."
    },
    {
      q: "Why does Speaker A use Skype?",
      options: [
        "To order food",
        "To talk to their brother in Toronto",
        "To check the weather",
        "To edit photos"
      ],
      correct: 1,
      explain: "Speaker A uses Skype from time to time to talk to their brother, who lives in Toronto."
    },
    {
      q: "What kind of phone does Speaker B have?",
      options: ["An iPhone", "An Android smartphone — a Samsung Galaxy", "A tablet only", "No smartphone"],
      correct: 1,
      explain: "Speaker B has an Android smartphone — a Samsung Galaxy."
    },
    {
      q: "How old is Speaker B’s phone?",
      options: ["About two years old", "About six months old", "About four years old", "Brand new this week"],
      correct: 1,
      explain: "Speaker B’s phone is about six months old."
    },
    {
      q: "How often does Speaker B change phones?",
      options: ["Every year", "About every two to three years", "Every four years", "Only when the phone breaks"],
      correct: 1,
      explain: "Speaker B changes phones about every two to three years."
    },
    {
      q: "What does Speaker B use their phone for the most?",
      options: [
        "Playing games and checking the weather",
        "Receiving phone calls and looking things up on the internet",
        "Only messaging friends",
        "Only reading books"
      ],
      correct: 1,
      explain: "Speaker B mainly receives phone calls and looks things up on the internet."
    },
    {
      q: "Which app does Speaker B use a lot for reading?",
      options: ["SnapChat", "Twitter", "The Kindle app", "CNN news"],
      correct: 2,
      explain: "Speaker B uses the Kindle app (e-reader), though they prefer paper books."
    },
    {
      q: "When does Speaker B read on their phone?",
      options: [
        "Only at home in the evening",
        "Never — they only read paper books",
        "On the bus or while waiting for somebody",
        "Only at work"
      ],
      correct: 2,
      explain: "Speaker B prefers paper books but reads on the phone on the bus or when waiting for someone."
    },
    {
      q: "What unusual app does Speaker B have?",
      options: [
        "A night-sky star app",
        "A food-tracking app",
        "An app to order a taxi from a local company",
        "A photo-editing app"
      ],
      correct: 2,
      explain: "Speaker B has an app to order a taxi from their local taxi company."
    },
    {
      q: "What kind of phone does Speaker C have?",
      options: ["A Samsung Galaxy", "An Android phone", "An iPhone", "A work phone only"],
      correct: 2,
      explain: "Speaker C has an iPhone."
    },
    {
      q: "When does Speaker C change their phone?",
      options: [
        "Every year without fail",
        "When their contract lets them upgrade — about every two or three years",
        "Only when they lose the phone",
        "Never — they keep the same phone forever"
      ],
      correct: 1,
      explain: "Speaker C upgrades when the contract allows it, about every two or three years."
    },
    {
      q: "In what order does Speaker C use their phone the most?",
      options: [
        "Phone calls, then games, then email",
        "Email, text messages, internet, and talking",
        "Only social media",
        "Banking, then maps, then calls"
      ],
      correct: 1,
      explain: "Speaker C uses email, text messages, internet, and phone (talking) — in that order."
    },
    {
      q: "Which apps does Speaker C use a lot (apart from mail and Google)?",
      options: [
        "SnapChat, Facebook Messenger, and Skype",
        "Online banking and Kindle",
        "Twitter, CNN news, and transportation apps",
        "Only games and weather"
      ],
      correct: 2,
      explain: "Speaker C uses Twitter, CNN news, and apps for train tickets / times."
    },
    {
      q: "What is Speaker C’s unusual app?",
      options: [
        "A food-tracking app",
        "A taxi-ordering app",
        "A “night sky” app that names stars and planets",
        "A photo-editing app"
      ],
      correct: 2,
      explain: "Speaker C has a “night sky” app — point the phone at the sky to see star and planet names."
    },
    {
      q: "Which speakers both have an iPhone?",
      options: ["A and B", "B and C", "A and C", "Only Speaker A"],
      correct: 2,
      explain: "Speakers A and C both have an iPhone. Speaker B has an Android (Samsung Galaxy)."
    },
    {
      q: "Who is least interested in always having the latest phone?",
      options: [
        "Speaker A — they just want one that works well",
        "Speaker B — they change phones every six months",
        "Speaker C — they buy a new phone every year",
        "All three always want the newest model"
      ],
      correct: 0,
      explain: "Speaker A is “not particularly worried about having the latest phone” and just wants one that works well."
    },
    {
      q: "Who uses their phone a lot for actual phone calls?",
      options: [
        "Only Speaker A",
        "Speaker B (receiving calls) and Speaker C (talking is one of their main uses)",
        "Nobody — none of them make calls",
        "Only Speaker A’s brother in Toronto"
      ],
      correct: 1,
      explain: "Speaker B receives many calls; Speaker C lists talking as one of their main uses. Speaker A does not use the phone much to talk."
    }
  ];

  var TOTAL = QUESTIONS.length;
  var LETTERS = ["A", "B", "C", "D"];

  var state = {
    screen: "start",
    index: 0,
    score: 0,
    selected: null,
    checked: false,
    started: false,
    finished: false,
    audio: null
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

  /** Save stars once — never also pass save:true to LAFinish */
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

  /* ── Audio ── */
  function getAudio() {
    if (!state.audio) {
      state.audio = new Audio(AUDIO_URL);
      state.audio.preload = "auto";
    }
    return state.audio;
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function playIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  function pauseIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
  }

  function stopAudio() {
    var a = state.audio;
    if (!a) return;
    a.pause();
  }

  function audioCardHtml() {
    return (
      '<div class="pi-card">' +
      '<div class="pi-audio-label">Listening track · 11.11</div>' +
      '<div class="pi-audio-row">' +
      '<button type="button" class="pi-play" id="pi-play" aria-label="Play audio">' +
      playIcon() +
      "</button>" +
      '<div class="pi-audio-meta">' +
      '<div class="pi-audio-title">Phone interviews (A · B · C)</div>' +
      '<div class="pi-audio-hint">Listen as many times as you need</div>' +
      "</div></div>" +
      '<div class="pi-seek-row">' +
      '<input type="range" class="pi-seek" id="pi-seek" min="0" max="100" value="0" step="0.1" aria-label="Seek">' +
      '<span class="pi-time" id="pi-time">0:00 / 0:00</span>' +
      "</div>" +
      '<div class="pi-speakers">' +
      '<span class="pi-chip"><span class="pi-dot a"></span>Speaker A</span>' +
      '<span class="pi-chip"><span class="pi-dot b"></span>Speaker B</span>' +
      '<span class="pi-chip"><span class="pi-dot c"></span>Speaker C</span>' +
      "</div></div>"
    );
  }

  function bindAudio() {
    var a = getAudio();
    var btn = document.getElementById("pi-play");
    var seek = document.getElementById("pi-seek");
    var timeEl = document.getElementById("pi-time");
    if (!btn || !seek) return;

    function updateTime() {
      var cur = a.currentTime || 0;
      var dur = a.duration || 0;
      if (timeEl) timeEl.textContent = formatTime(cur) + " / " + formatTime(dur);
      if (dur && !seek._dragging) seek.value = String((cur / dur) * 100);
    }

    btn.onclick = function () {
      sfx("click");
      if (a.paused) {
        a.play().catch(function () {});
        btn.classList.add("is-playing");
        btn.innerHTML = pauseIcon();
        btn.setAttribute("aria-label", "Pause audio");
      } else {
        a.pause();
        btn.classList.remove("is-playing");
        btn.innerHTML = playIcon();
        btn.setAttribute("aria-label", "Play audio");
      }
    };

    a.ontimeupdate = updateTime;
    a.onloadedmetadata = updateTime;
    a.onended = function () {
      btn.classList.remove("is-playing");
      btn.innerHTML = playIcon();
      btn.setAttribute("aria-label", "Play audio");
    };

    seek.oninput = function () {
      seek._dragging = true;
      var dur = a.duration || 0;
      if (dur) a.currentTime = (parseFloat(seek.value) / 100) * dur;
      updateTime();
    };
    seek.onchange = function () {
      seek._dragging = false;
    };

    if (!a.paused) {
      btn.classList.add("is-playing");
      btn.innerHTML = pauseIcon();
      btn.setAttribute("aria-label", "Pause audio");
    }
    updateTime();
  }

  /* ── Shell ── */
  function shell(bodyHtml, opts) {
    opts = opts || {};
    var showScore = opts.score !== false;
    var pct = Math.round((state.index / TOTAL) * 100);
    if (state.screen === "done") pct = 100;

    return (
      '<div class="pi-top">' +
      '<a class="pi-back" href="../" aria-label="Back">←</a>' +
      '<div class="pi-title-wrap">' +
      '<div class="pi-kicker">Unit 11C · Listening</div>' +
      '<h1 class="pi-title">Phone Interviews</h1>' +
      "</div>" +
      (showScore
        ? '<div class="pi-score-pill" aria-live="polite">' +
          '<span class="pi-score-label">Score</span>' +
          '<span class="pi-score-value">' +
          state.score +
          " / " +
          TOTAL +
          "</span></div>"
        : "") +
      "</div>" +
      (opts.progress !== false
        ? '<div class="pi-progress" role="progressbar" aria-valuenow="' +
          pct +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="pi-progress-fill" style="width:' +
          pct +
          '%"></div></div>'
        : "") +
      '<div class="pi-body">' +
      bodyHtml +
      "</div>" +
      '<div class="pi-footer">' +
      '<button type="button" class="pi-btn pi-btn-ghost" id="pi-restart">Start Again</button>' +
      '<span class="pi-footer-note">How smart is your phone?</span>' +
      "</div>"
    );
  }

  function bindShell() {
    var r = document.getElementById("pi-restart");
    if (r) r.onclick = resetGame;
  }

  /* ── Screens ── */
  function render() {
    if (state.screen === "start") renderStart();
    else if (state.screen === "done") renderDoneFallback();
    else renderPlay();
  }

  function renderStart() {
    stopAudio();
    app.innerHTML = shell(
      '<div class="pi-card pi-hero">' +
        '<div class="pi-hero-icon" aria-hidden="true">🎧</div>' +
        "<h2>Listen & understand</h2>" +
        "<p>Three people answer questions about their phones. Listen carefully, then answer the comprehension questions.</p>" +
        '<div class="pi-howto">' +
        "<strong>How to play</strong>" +
        "<ol>" +
        "<li>Play the audio (replay anytime).</li>" +
        "<li>Answer each multiple-choice question.</li>" +
        "<li>Check your answer before moving on.</li>" +
        "<li>" +
        TOTAL +
        " questions · Speakers A, B, and C.</li>" +
        "</ol></div>" +
        '<button type="button" class="pi-btn pi-btn-primary" id="pi-start">Start listening</button>' +
        "</div>",
      { score: false, progress: false }
    );
    bindShell();
    document.getElementById("pi-start").onclick = function () {
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
    var i = state.index;
    var item = QUESTIONS[i];

    var optsHtml = "";
    item.options.forEach(function (opt, idx) {
      var cls = "pi-option";
      if (state.selected === idx) cls += " is-selected";
      if (state.checked) {
        if (idx === item.correct) cls += " is-correct";
        else if (state.selected === idx && idx !== item.correct) cls += " is-wrong";
      }
      optsHtml +=
        '<button type="button" class="' +
        cls +
        '" data-idx="' +
        idx +
        '"' +
        (state.checked ? " disabled" : "") +
        ">" +
        '<span class="pi-letter">' +
        LETTERS[idx] +
        "</span>" +
        '<span class="pi-opt-text">' +
        opt +
        "</span></button>";
    });

    var fb = "";
    if (state.checked) {
      var ok = state.selected === item.correct;
      fb =
        '<div class="pi-feedback is-' +
        (ok ? "correct" : "wrong") +
        '" role="status">' +
        "<strong>" +
        (ok ? "✓ Correct!" : "✗ Not quite") +
        "</strong>" +
        item.explain +
        "</div>";
    }

    var nextLabel = i + 1 >= TOTAL ? "Finish" : "Next question →";

    app.innerHTML = shell(
      audioCardHtml() +
        '<div class="pi-card">' +
        '<div class="pi-q-kicker">Question ' +
        (i + 1) +
        " of " +
        TOTAL +
        "</div>" +
        '<p class="pi-q-text">' +
        item.q +
        "</p>" +
        '<div class="pi-options">' +
        optsHtml +
        "</div>" +
        fb +
        '<div class="pi-actions">' +
        (state.checked
          ? '<button type="button" class="pi-btn pi-btn-success" id="pi-next">' +
            nextLabel +
            "</button>"
          : '<button type="button" class="pi-btn pi-btn-primary" id="pi-check" disabled>Check answer</button>') +
        "</div></div>"
    );

    bindShell();
    bindAudio();

    if (!state.checked) {
      var checkBtn = document.getElementById("pi-check");
      Array.prototype.forEach.call(document.querySelectorAll(".pi-option"), function (btn) {
        btn.onclick = function () {
          state.selected = parseInt(btn.getAttribute("data-idx"), 10);
          Array.prototype.forEach.call(document.querySelectorAll(".pi-option"), function (b) {
            b.classList.toggle(
              "is-selected",
              parseInt(b.getAttribute("data-idx"), 10) === state.selected
            );
          });
          if (checkBtn) checkBtn.disabled = false;
        };
      });

      if (checkBtn) {
        checkBtn.onclick = function () {
          if (state.selected === null) return;
          startTimerOnce();
          state.checked = true;
          var ok = state.selected === item.correct;
          if (ok) {
            state.score += 1;
            sfx("correct");
          } else {
            sfx("wrong");
          }
          render();
        };
      }
    } else {
      document.getElementById("pi-next").onclick = function () {
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
    stopAudio();
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
        ? "Excellent listening! You understood the interviews very well."
        : acc >= 70
          ? "Good work! You caught most of the important details."
          : acc >= 50
            ? "Nice effort. Listen again and focus on the details you missed."
            : "Keep practising. Play the audio again and try once more.";

    app.innerHTML = shell(
      '<div class="pi-card pi-hero">' +
        '<div class="pi-hero-icon" aria-hidden="true">🏆</div>' +
        "<h2>Well done!</h2>" +
        '<p style="font-size:1.6rem;font-weight:800;color:var(--pi-blue);margin:8px 0">' +
        state.score +
        " / " +
        TOTAL +
        "</p>" +
        "<p>" +
        note +
        "</p>" +
        '<div class="pi-actions" style="justify-content:center;margin-top:12px">' +
        '<button type="button" class="pi-btn pi-btn-primary" id="pi-again">Play again</button>' +
        '<a class="pi-btn pi-btn-ghost" href="../" style="text-decoration:none;display:inline-flex;align-items:center">Back to games</a>' +
        "</div></div>",
      { progress: false }
    );
    bindShell();
    var again = document.getElementById("pi-again");
    if (again) again.onclick = function () { resetGame(true); };
  }

  function resetGame(skipConfirm) {
    if (!skipConfirm && (state.score > 0 || state.index > 0)) {
      if (!window.confirm("Start again? Your progress will be cleared.")) return;
    }
    stopAudio();
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
