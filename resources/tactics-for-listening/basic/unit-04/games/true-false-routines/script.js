/* True or false? · Tactics For Listening Basic Unit 4
 * Listen again. Are these statements true or false?
 * Worksheet grid layout: sentences on left, True / False boxes on right.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-true-false-routines";
  var GAME_NAME = "True or false?";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  var AUDIO = {
    Peter:   "https://cdn.imgurl.ir/uploads/w01766_.mp3",
    Amelia:  "https://cdn.imgurl.ir/uploads/s677860_.mp3",
    Charlie: "https://cdn.imgurl.ir/uploads/t300108_.mp3"
  };

  // Groups of statements per person. correct: true = True, false = False
  var GROUPS = [
    {
      who: "Peter",
      statements: [
        { text: "Peter has a big breakfast.", correct: false },
        { text: "Peter gets to work at 7:00 in the morning.", correct: true },
        { text: "Peter reads the newspaper on the subway.", correct: false }
      ]
    },
    {
      who: "Amelia",
      statements: [
        { text: "Amelia drinks tea with her breakfast.", correct: true },
        { text: "While Amelia is on the bus, she texts her family.", correct: false },
        { text: "Amelia plays video games for half an hour every day.", correct: false }
      ]
    },
    {
      who: "Charlie",
      statements: [
        { text: "Charlie has a job.", correct: false },
        { text: "Charlie eats a big lunch.", correct: true },
        { text: "Charlie looks for jobs online.", correct: true }
      ]
    }
  ];

  var LETTERS = ["a", "b", "c"];
  var TOTAL = 9; // 3 people × 3 statements

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  // answers[groupIdx][stmtIdx] = true | false | null
  var answers = [];
  var checked = false;
  var results = [];
  var playingWho = null;
  var lastPlayedWho = "Peter";
  var listenedMap = {};
  var audioProgress = {};
  var audioError = {};
  var audios = {};
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="tf-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="tf-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="tf-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") {
        LASfx[name]();
      }
    } catch (e) {}
  }

  function initAnswers() {
    answers = GROUPS.map(function (g) {
      return g.statements.map(function () { return null; });
    });
  }

  function stopAudio(resetTime) {
    if (playingWho && audios[playingWho]) {
      try {
        audios[playingWho].pause();
        if (resetTime !== false) {
          audios[playingWho].currentTime = 0;
          audioProgress[playingWho] = 0;
        }
      } catch (e) {}
    }
    playingWho = null;
  }

  function updateProgressDOM(who, pct) {
    var fill = app.querySelector('.tf-person-btn[data-who="' + who + '"] .tf-progress-fill');
    if (fill) {
      fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }
  }

  function playPerson(who) {
    if (!HAS_AUDIO || !AUDIO[who]) return;

    if (playingWho === who) {
      stopAudio(true);
      renderPlay();
      return;
    }

    stopAudio(true);
    lastPlayedWho = who;

    if (!audios[who]) {
      var audioEl = new Audio(AUDIO[who]);
      audioEl.preload = "auto";
      audioEl.addEventListener("timeupdate", function () {
        if (audioEl.duration && isFinite(audioEl.duration)) {
          var pct = (audioEl.currentTime / audioEl.duration) * 100;
          audioProgress[who] = pct;
          if (playingWho === who) updateProgressDOM(who, pct);
        }
      });
      audioEl.addEventListener("ended", function () {
        listenedMap[who] = true;
        audioProgress[who] = 0;
        if (playingWho === who) {
          playingWho = null;
          renderPlay();
        }
      });
      audioEl.addEventListener("error", function () {
        audioError[who] = true;
        audioProgress[who] = 0;
        if (playingWho === who) playingWho = null;
        renderPlay();
      });
      audios[who] = audioEl;
    }

    audioError[who] = false;
    audioProgress[who] = 0;
    playingWho = who;
    listenedMap[who] = true;
    renderPlay();

    var a = audios[who];
    try { a.currentTime = 0; } catch (e) {}
    var p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {
        audioError[who] = true;
        if (playingWho === who) playingWho = null;
        renderPlay();
      });
    }
  }

  function score() {
    var n = 0;
    for (var i = 0; i < results.length; i++) {
      if (results[i]) n++;
    }
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

  function answeredCount() {
    var n = 0;
    answers.forEach(function (g) {
      g.forEach(function (v) { if (v !== null) n++; });
    });
    return n;
  }

  function startGame() {
    if (window.LAFinish && typeof LAFinish.startTimer === "function") {
      LAFinish.startTimer();
    }
    initAnswers();
    checked = false;
    results = [];
    stopAudio(true);
    listenedMap = {};
    audioProgress = {};
    audioError = {};
    lastPlayedWho = "Peter";
    phase = "play";
    render();
  }

  function clearAnswers() {
    if (checked || answeredCount() === 0) return;
    initAnswers();
    sfx("tap");
    renderPlay();
  }

  function pick(gIdx, sIdx, val) {
    if (checked) return;
    // Clicking or pressing the same box toggles it off; clicking the opposite switches it
    answers[gIdx][sIdx] = answers[gIdx][sIdx] === val ? null : val;
    sfx("tap");
    renderPlay();
  }

  function checkAnswers() {
    if (checked || answeredCount() === 0) return;
    stopAudio(true);
    checked = true;
    results = [];
    GROUPS.forEach(function (g, gi) {
      g.statements.forEach(function (st, si) {
        results.push(answers[gi][si] === st.correct);
      });
    });
    var s = score();
    if (s === TOTAL) sfx("win");
    else if (s >= Math.ceil(TOTAL * 0.6)) sfx("correct");
    else sfx("wrong");
    renderPlay();
  }

  function finish() {
    stopAudio(true);
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    if (window.LAFinish && typeof LAFinish.show === "function") {
      var timeMs = typeof LAFinish.stopTimer === "function" ? LAFinish.stopTimer() : 0;
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

  function personIcon(who) {
    if (audioError[who]) return ALERT_ICON;
    if (playingWho === who) return BARS_ICON;
    return PLAY_ICON;
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">✓</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen again. Are these statements true or false? Click or press the True or False boxes.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="tf-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Peter / Amelia / Charlie</strong> (or press <strong>1–3</strong>) to listen</span></li>' +
      '<li><span class="tip-num">2</span><span>Click or press the <strong>True</strong> or <strong>False</strong> box for each sentence</span></li>' +
      '<li><span class="tip-num">3</span><span>Press <strong>Check answers</strong> when you finish</span></li>' +
      "</ol></section>";
    document.getElementById("tf-start").onclick = startGame;
  }

  function boxState(ans, boxVal, st) {
    var cls = "tf-box-cell";
    var mark = "";
    var isSelected = ans === boxVal;

    if (!checked) {
      if (isSelected) {
        cls += " is-checked";
        mark = "✓";
      }
      return { cls: cls, mark: mark, checkedAttr: isSelected ? "true" : "false" };
    }

    cls += " is-locked";
    var isRightAnswer = st.correct === boxVal;

    if (isRightAnswer && isSelected) {
      cls += " is-correct";
      mark = "✓";
    } else if (isRightAnswer && !isSelected) {
      cls += " is-missed";
      mark = "✓";
    } else if (!isRightAnswer && isSelected) {
      cls += " is-wrong";
      mark = "✕";
    }

    return { cls: cls, mark: mark, checkedAttr: isSelected ? "true" : "false" };
  }

  function renderPlay() {
    var count = answeredCount();
    var counter = checked ? score() + " / " + TOTAL : count + " / " + TOTAL;

    var personBtns = GROUPS.map(function (g, idx) {
      var who = g.who;
      var cls = "tf-person-btn";
      if (playingWho === who) cls += " is-playing";
      if (listenedMap[who]) cls += " is-listened";
      if (audioError[who]) cls += " is-error";
      var pct = audioProgress[who] || 0;
      var tag = playingWho === who ? "LIVE" : listenedMap[who] ? "✓" : String(idx + 1);

      return (
        '<button type="button" class="' + cls + '" data-who="' + esc(who) + '" aria-pressed="' +
        (playingWho === who ? "true" : "false") + '" aria-label="Play ' + esc(who) + '">' +
        '<span class="tf-person-left">' +
        '<span class="tf-person-ico">' + personIcon(who) + "</span>" +
        '<span class="tf-person-name">' + esc(who) + "</span>" +
        "</span>" +
        '<span class="tf-person-tag" aria-hidden="true">' + tag + "</span>" +
        '<span class="tf-progress-track" aria-hidden="true"><span class="tf-progress-fill" style="width:' + pct + '%"></span></span>' +
        "</button>"
      );
    }).join("");

    var tbodyRows = [];
    GROUPS.forEach(function (g, gi) {
      var groupActive = playingWho === g.who;
      g.statements.forEach(function (st, si) {
        var flatIdx = gi * 3 + si;
        var ans = answers[gi][si];
        var tState = boxState(ans, true, st);
        var fState = boxState(ans, false, st);

        var rowCls = [];
        if (si === 0) rowCls.push("is-group-start");
        if (groupActive) rowCls.push("is-group-active");
        if (checked) {
          rowCls.push(results[flatIdx] ? "tf-row-ok" : "tf-row-bad");
        }

        var groupNumHtml = si === 0
          ? '<span class="tf-group-num">' + (gi + 1) + ".</span>"
          : '<span class="tf-group-num" aria-hidden="true"></span>';

        tbodyRows.push(
          '<tr class="' + rowCls.join(" ") + '">' +
          '<td class="tf-stmt-cell">' +
          '<div class="tf-stmt-line">' +
          groupNumHtml +
          '<span class="tf-item-letter">' + LETTERS[si] + ".</span>" +
          '<span class="tf-stmt-text">' + esc(st.text) + "</span>" +
          "</div></td>" +
          '<td class="' + tState.cls + '" data-g="' + gi + '" data-s="' + si + '" data-v="true"' +
          ' role="checkbox" aria-checked="' + tState.checkedAttr + '"' +
          ' aria-label="' + esc(st.text + " — True") + '" tabindex="' + (checked ? "-1" : "0") + '">' +
          '<span class="tf-box">' + tState.mark + "</span></td>" +
          '<td class="' + fState.cls + '" data-g="' + gi + '" data-s="' + si + '" data-v="false"' +
          ' role="checkbox" aria-checked="' + fState.checkedAttr + '"' +
          ' aria-label="' + esc(st.text + " — False") + '" tabindex="' + (checked ? "-1" : "0") + '">' +
          '<span class="tf-box">' + fState.mark + "</span></td>" +
          "</tr>"
        );
      });
    });

    var sheet =
      '<div class="tf-sheet">' +
      '<table class="tf-grid" role="grid" aria-label="True or false statements">' +
      "<thead><tr>" +
      '<th class="tf-col-stmt">Statement</th>' +
      '<th class="tf-col-tf' + (playingWho ? " is-listening" : "") + '">True</th>' +
      '<th class="tf-col-tf' + (playingWho ? " is-listening" : "") + '">False</th>' +
      "</tr></thead>" +
      "<tbody>" + tbodyRows.join("") + "</tbody>" +
      "</table></div>";

    var foot;
    if (!checked) {
      foot =
        '<div class="tf-foot">' +
        '<span class="tf-foot-msg">' + count + " of " + TOTAL + " answered</span>" +
        '<div class="tf-foot-actions">' +
        '<button type="button" class="tf-clear-btn" id="tf-clear"' + (count === 0 ? " disabled" : "") + ">Clear</button>" +
        '<button type="button" class="lc-btn primary" id="tf-check"' + (count === 0 ? " disabled" : "") + ">Check answers</button>" +
        "</div></div>";
    } else {
      var s = score();
      var tone = s === TOTAL ? "is-ok" : s >= 6 ? "is-mid" : "is-bad";
      var msg = s === TOTAL ? "Perfect! All 9 correct." : s + " of " + TOTAL + " correct.";
      foot =
        '<div class="tf-foot">' +
        '<span class="tf-foot-msg ' + tone + '">' + esc(msg) + "</span>" +
        '<div class="tf-foot-actions">' +
        '<button type="button" class="lc-btn primary" id="tf-finish">See results →</button>' +
        "</div></div>";
    }

    app.innerHTML =
      topBar(counter) +
      '<div class="tf-stage">' +
      '<div class="tf-head"><div class="tf-persons">' + personBtns + "</div></div>" +
      sheet +
      foot +
      "</div>";

    app.querySelectorAll(".tf-person-btn").forEach(function (btn) {
      btn.onclick = function () {
        playPerson(btn.getAttribute("data-who"));
      };
    });

    if (!checked) {
      app.querySelectorAll(".tf-box-cell").forEach(function (cell) {
        cell.onclick = function () {
          var g = parseInt(cell.getAttribute("data-g"), 10);
          var s = parseInt(cell.getAttribute("data-s"), 10);
          var v = cell.getAttribute("data-v") === "true";
          pick(g, s, v);
        };
        cell.onkeydown = function (e) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            var g = parseInt(cell.getAttribute("data-g"), 10);
            var s = parseInt(cell.getAttribute("data-s"), 10);
            var v = cell.getAttribute("data-v") === "true";
            pick(g, s, v);
          }
        };
      });

      var clearBtn = document.getElementById("tf-clear");
      if (clearBtn) clearBtn.onclick = clearAnswers;

      var checkBtn = document.getElementById("tf-check");
      if (checkBtn) checkBtn.onclick = checkAnswers;
    } else {
      var fin = document.getElementById("tf-finish");
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
      '<p class="lc-intro-lede">Listening for details about daily routines.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="tf-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("tf-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    var k = e.key.toLowerCase();
    if (k === "1") { e.preventDefault(); playPerson("Peter"); }
    else if (k === "2") { e.preventDefault(); playPerson("Amelia"); }
    else if (k === "3") { e.preventDefault(); playPerson("Charlie"); }
    else if (k === " " && (!document.activeElement || !document.activeElement.classList.contains("tf-box-cell"))) {
      e.preventDefault();
      if (playingWho) {
        stopAudio(true);
        renderPlay();
      } else {
        playPerson(lastPlayedWho || "Peter");
      }
    }
  });

  render();
})();