/**
 * Phones & the Internet — Vocabulary
 * AEF Level 1 · Unit 11C
 * One sentence at a time · fixed word bank
 * Drag-and-drop + tap-to-select · used words muted
 * LA stars + finish (save once)
 */
(function () {
  "use strict";

  var GAME_ID = "1-11c-phones-internet-vocab";

  var WORDS = [
    "app",
    "attachments",
    "bluetooth",
    "log in",
    "search",
    "Skype",
    "tweet"
  ];

  var ITEMS = [
    {
      before: "I ",
      after: " my sister in Australia every weekend.",
      answer: "Skype",
      explain: "Skype = video/voice calls over the internet."
    },
    {
      before: "I have a great weather ",
      after: ". It tells me exactly when it's going to rain.",
      answer: "app",
      explain: "app = application on a phone or tablet."
    },
    {
      before: "If you get an email from somebody you don't know, don't open any ",
      after: ".",
      answer: "attachments",
      explain: "attachments = files sent with an email."
    },
    {
      before: "My new car has ",
      after: ", so I don't need to use wires to connect my phone!",
      answer: "bluetooth",
      explain: "bluetooth = wireless connection for devices."
    },
    {
      before: "My friend posted a really funny ",
      after: " yesterday.",
      answer: "tweet",
      explain: "tweet = a short message on Twitter / X."
    },
    {
      before: "I can't ",
      after: " to my email account. I can't remember the password.",
      answer: "log in",
      explain: "log in = enter username and password to open an account."
    },
    {
      before: "If I need information, I always ",
      after: " online.",
      answer: "search",
      explain: "search = look for information on the internet."
    }
  ];

  var TOTAL = ITEMS.length;

  var state = {
    screen: "start",
    index: 0,
    score: 0,
    selected: null, // word currently in the blank
    pickedChip: null, // chip selected for tap-to-fill
    checked: false,
    used: {}, // word -> true once placed (muted in bank)
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

  function placeWord(word) {
    if (state.checked) return;
    // Free previous word if replacing
    if (state.selected && state.selected !== word) {
      delete state.used[state.selected];
    }
    state.selected = word;
    state.used[word] = true;
    state.pickedChip = null;
    startTimerOnce();
    render();
  }

  function clearBlank() {
    if (state.checked || !state.selected) return;
    delete state.used[state.selected];
    state.selected = null;
    render();
  }

  /* ── Shell ── */
  function shell(bodyHtml, bankHtml, opts) {
    opts = opts || {};
    var pct = Math.round((state.index / TOTAL) * 100);
    if (state.screen === "done") pct = 100;

    return (
      '<div class="pv-top">' +
      '<a class="pv-back" href="../" aria-label="Back">←</a>' +
      '<div class="pv-title-wrap">' +
      '<div class="pv-kicker">Unit 11C · Vocabulary</div>' +
      '<h1 class="pv-title">Phones & the Internet</h1>' +
      "</div>" +
      (opts.score !== false
        ? '<div class="pv-score-pill" aria-live="polite">' +
          '<span class="pv-score-label">Score</span>' +
          '<span class="pv-score-value">' +
          state.score +
          " / " +
          TOTAL +
          "</span></div>"
        : "") +
      "</div>" +
      (opts.progress !== false
        ? '<div class="pv-progress" role="progressbar" aria-valuenow="' +
          pct +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="pv-progress-fill" style="width:' +
          pct +
          '%"></div></div>'
        : "") +
      '<div class="pv-body">' +
      bodyHtml +
      (bankHtml || "") +
      "</div>" +
      '<div class="pv-footer">' +
      '<button type="button" class="pv-btn pv-btn-ghost" id="pv-restart">Start Again</button>' +
      '<span class="pv-footer-note">Tap or drag a word into the blank</span>' +
      "</div>"
    );
  }

  function bindShell() {
    var r = document.getElementById("pv-restart");
    if (r) r.onclick = function () { resetGame(false); };
  }

  function wordBankHtml(locked) {
    var chips = WORDS.map(function (w) {
      var cls = "pv-chip";
      if (state.used[w]) cls += " is-used";
      if (state.pickedChip === w) cls += " is-selected";
      return (
        '<button type="button" class="' +
        cls +
        '" data-word="' +
        escapeAttr(w) +
        '" draggable="' +
        (!locked && !state.used[w] ? "true" : "false") +
        '"' +
        (locked || state.used[w] ? " disabled" : "") +
        ">" +
        escapeHtml(w) +
        "</button>"
      );
    }).join("");

    return (
      '<div class="pv-bank" id="pv-bank">' +
      '<div class="pv-bank-label">Word box · drag or tap</div>' +
      '<div class="pv-chips">' +
      chips +
      "</div></div>"
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  /* ── Screens ── */
  function render() {
    if (state.screen === "start") renderStart();
    else if (state.screen === "done") renderDoneFallback();
    else renderPlay();
  }

  function renderStart() {
    app.innerHTML = shell(
      '<div class="pv-card pv-hero">' +
        '<div class="pv-hero-icon" aria-hidden="true">📱</div>' +
        "<h2>Phones & the Internet</h2>" +
        "<p>Complete each sentence with a word from the box. One sentence at a time.</p>" +
        '<div class="pv-howto">' +
        "<strong>How to play</strong>" +
        "<ol>" +
        "<li><strong>Tap</strong> a word, then tap the blank — or <strong>drag</strong> a word onto the blank.</li>" +
        "<li>Used words stay in the box but become faded.</li>" +
        "<li>Check your answer, then go to the next sentence.</li>" +
        "<li>" +
        TOTAL +
        " sentences · " +
        WORDS.length +
        " words.</li>" +
        "</ol></div>" +
        '<button type="button" class="pv-btn pv-btn-primary" id="pv-start">Start</button>' +
        "</div>",
      "",
      { score: false, progress: false }
    );
    bindShell();
    document.getElementById("pv-start").onclick = function () {
      sfx("click");
      state.screen = "play";
      state.index = 0;
      state.score = 0;
      state.selected = null;
      state.pickedChip = null;
      state.checked = false;
      state.used = {};
      state.started = false;
      state.finished = false;
      render();
    };
  }

  function renderPlay() {
    var item = ITEMS[state.index];
    var locked = state.checked;

    var blankCls = "pv-blank";
    if (state.selected) blankCls += " is-filled";
    if (locked) {
      blankCls += state.selected === item.answer ? " is-correct" : " is-wrong";
    }

    var blankInner = state.selected
      ? escapeHtml(state.selected)
      : '<span class="pv-empty">drop word</span>';

    var fb = "";
    if (locked) {
      var ok = state.selected === item.answer;
      fb =
        '<div class="pv-feedback is-' +
        (ok ? "correct" : "wrong") +
        '" role="status">' +
        "<strong>" +
        (ok ? "✓ Correct!" : "✗ Not quite — answer: " + item.answer) +
        "</strong>" +
        item.explain +
        "</div>";
    }

    var nextLabel =
      state.index + 1 >= TOTAL ? "Finish" : "Next sentence →";

    var body =
      '<div class="pv-card">' +
      '<div class="pv-q-num">Sentence ' +
      (state.index + 1) +
      " of " +
      TOTAL +
      "</div>" +
      '<p class="pv-sentence">' +
      escapeHtml(item.before) +
      '<button type="button" class="' +
      blankCls +
      '" id="pv-blank" aria-label="Answer blank"' +
      (locked ? " disabled" : "") +
      ">" +
      blankInner +
      "</button>" +
      escapeHtml(item.after) +
      "</p>" +
      (locked
        ? ""
        : '<p class="pv-hint">Tap a word below, or drag it onto the blank.</p>') +
      fb +
      '<div class="pv-actions">' +
      (locked
        ? '<button type="button" class="pv-btn pv-btn-success" id="pv-next">' +
          nextLabel +
          "</button>"
        : '<button type="button" class="pv-btn pv-btn-primary" id="pv-check"' +
          (state.selected ? "" : " disabled") +
          ">Check answer</button>" +
          '<button type="button" class="pv-btn pv-btn-ghost" id="pv-clear"' +
          (state.selected ? "" : " disabled") +
          ">Clear</button>") +
      "</div></div>";

    app.innerHTML = shell(body, wordBankHtml(locked));
    bindShell();
    bindPlay(locked);
  }

  function bindPlay(locked) {
    if (locked) {
      document.getElementById("pv-next").onclick = function () {
        sfx("click");
        if (state.index + 1 >= TOTAL) {
          finishGame();
        } else {
          state.index += 1;
          state.selected = null;
          state.pickedChip = null;
          state.checked = false;
          // Keep used words muted for the whole game
          render();
        }
      };
      return;
    }

    var blank = document.getElementById("pv-blank");

    // Tap blank: if a chip is picked, place it; if filled, clear
    blank.onclick = function () {
      if (state.pickedChip) {
        sfx("click");
        placeWord(state.pickedChip);
      } else if (state.selected) {
        sfx("click");
        clearBlank();
      }
    };

    // Drag over blank
    blank.addEventListener("dragover", function (e) {
      e.preventDefault();
      blank.classList.add("is-drag-over");
    });
    blank.addEventListener("dragleave", function () {
      blank.classList.remove("is-drag-over");
    });
    blank.addEventListener("drop", function (e) {
      e.preventDefault();
      blank.classList.remove("is-drag-over");
      var w = e.dataTransfer.getData("text/plain");
      if (w && WORDS.indexOf(w) !== -1 && !state.used[w]) {
        sfx("click");
        placeWord(w);
      }
    });

    // Chips: tap select / drag
    Array.prototype.forEach.call(document.querySelectorAll(".pv-chip"), function (chip) {
      var word = chip.getAttribute("data-word");
      if (state.used[word]) return;

      chip.onclick = function () {
        sfx("click");
        // If blank empty or replacing: place immediately on second interaction style
        // First tap selects; if already selected, place into blank
        if (state.pickedChip === word) {
          placeWord(word);
        } else {
          state.pickedChip = word;
          // Auto-place into blank on tap (faster UX)
          placeWord(word);
        }
      };

      chip.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", word);
        e.dataTransfer.effectAllowed = "move";
        chip.classList.add("is-dragging");
      });
      chip.addEventListener("dragend", function () {
        chip.classList.remove("is-dragging");
      });

      // Touch-friendly: long-press not needed; tap places
    });

    var checkBtn = document.getElementById("pv-check");
    if (checkBtn) {
      checkBtn.onclick = function () {
        if (!state.selected) return;
        state.checked = true;
        var ok = state.selected === ITEMS[state.index].answer;
        if (ok) state.score += 1;
        sfx(ok ? "correct" : "wrong");
        render();
      };
    }

    var clearBtn = document.getElementById("pv-clear");
    if (clearBtn) {
      clearBtn.onclick = function () {
        sfx("click");
        clearBlank();
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
        ? "Excellent! You know phone & internet vocabulary well."
        : acc >= 70
          ? "Good work! Review the words you missed and try again."
          : "Keep practising — app, bluetooth, log in, and search are key.";

    app.innerHTML = shell(
      '<div class="pv-card pv-hero">' +
        '<div class="pv-hero-icon" aria-hidden="true">🏆</div>' +
        "<h2>Well done!</h2>" +
        '<p style="font-size:1.6rem;font-weight:800;color:var(--pv-blue);margin:8px 0">' +
        state.score +
        " / " +
        TOTAL +
        "</p>" +
        "<p>" +
        note +
        "</p>" +
        '<div class="pv-actions" style="justify-content:center">' +
        '<button type="button" class="pv-btn pv-btn-primary" id="pv-again">Play again</button>' +
        '<a class="pv-btn pv-btn-ghost" href="../" style="text-decoration:none;display:inline-flex;align-items:center">Back to games</a>' +
        "</div></div>",
      "",
      { progress: false }
    );
    bindShell();
    var again = document.getElementById("pv-again");
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
    state.pickedChip = null;
    state.checked = false;
    state.used = {};
    state.started = false;
    state.finished = false;
    render();
  }

  render();
})();
