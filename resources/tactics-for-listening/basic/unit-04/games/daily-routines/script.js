/* Daily routines · Tactics For Listening Basic Unit 4
 * Listen and check (✓) the things each person does.
 * Skill: Listening for details (Upgraded & Polished)
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-daily-routines";
  var GAME_NAME = "Daily routines";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  var PEOPLE = ["Peter", "Amelia", "Charlie"];

  var AUDIO = {
    Peter:   "https://cdn.imgurl.ir/uploads/w01766_.mp3",
    Amelia:  "https://cdn.imgurl.ir/uploads/s677860_.mp3",
    Charlie: "https://cdn.imgurl.ir/uploads/t300108_.mp3"
  };

  var ACTIVITIES = [
    "gets up early",
    "goes running",
    "has breakfast",
    "takes the bus",
    "takes the subway",
    "texts friends",
    "goes to work",
    "plays video games",
    "watches TV",
    "hangs out with friends",
    "reads"
  ];

  // CORRECT[activityIndex] = array of people who do it
  var CORRECT = {
    0:  ["Peter", "Amelia"],           // gets up early
    1:  ["Peter", "Charlie"],          // goes running
    2:  ["Peter", "Amelia"],           // has breakfast
    3:  ["Amelia"],                    // takes the bus
    4:  ["Peter"],                     // takes the subway
    5:  ["Amelia"],                    // texts friends
    6:  ["Peter"],                     // goes to work
    7:  ["Amelia", "Charlie"],         // plays video games
    8:  ["Charlie"],                   // watches TV
    9:  ["Charlie"],                   // hangs out with friends
    10: ["Peter"]                      // reads
  };

  var TOTAL = ACTIVITIES.length; // 11 rows

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var selections = {};
  var checked = false;
  var rowResults = [];
  var playingWho = null;
  var lastPlayedWho = "Peter";
  var listenedMap = {};
  var audioProgress = {}; // person -> 0..100
  var audioError = {};
  var audios = {};
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="dr-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="dr-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="dr-play-alert" aria-hidden="true">!</span>';

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

  function initSelections() {
    selections = {};
    ACTIVITIES.forEach(function (_, i) {
      selections[i] = {};
      PEOPLE.forEach(function (p) {
        selections[i][p] = false;
      });
    });
  }

  function totalCheckedCount() {
    var count = 0;
    for (var i = 0; i < TOTAL; i++) {
      for (var p = 0; p < PEOPLE.length; p++) {
        if (selections[i] && selections[i][PEOPLE[p]]) count++;
      }
    }
    return count;
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
    var fill = app.querySelector('.dr-person-btn[data-who="' + who + '"] .dr-progress-fill');
    if (fill) {
      fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }
  }

  function playPerson(who) {
    if (!HAS_AUDIO || !AUDIO[who]) return;

    // Toggle stop if currently playing this person
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
    for (var i = 0; i < TOTAL; i++) {
      if (rowResults[i]) n++;
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

  function startGame() {
    if (window.LAFinish && typeof LAFinish.startTimer === "function") {
      LAFinish.startTimer();
    }
    initSelections();
    checked = false;
    rowResults = [];
    stopAudio(true);
    listenedMap = {};
    audioProgress = {};
    audioError = {};
    lastPlayedWho = "Peter";
    phase = "play";
    render();
  }

  function clearAllSelections() {
    if (checked || totalCheckedCount() === 0) return;
    initSelections();
    sfx("tap");
    renderPlay();
  }

  function toggle(actIdx, person) {
    if (checked) return;
    selections[actIdx][person] = !selections[actIdx][person];
    sfx("tap");
    renderPlay();
  }

  function isRowCorrect(i) {
    var correctPeople = CORRECT[i] || [];
    for (var p = 0; p < PEOPLE.length; p++) {
      var person = PEOPLE[p];
      var shouldBe = correctPeople.indexOf(person) !== -1;
      var isChecked = !!selections[i][person];
      if (shouldBe !== isChecked) return false;
    }
    return true;
  }

  function pulseSpeakersHint() {
    var btns = app.querySelectorAll(".dr-person-btn");
    btns.forEach(function (b) {
      b.classList.remove("is-pulse");
      void b.offsetWidth;
      b.classList.add("is-pulse");
    });
  }

  function checkAnswers() {
    if (checked) return;
    if (totalCheckedCount() === 0) {
      pulseSpeakersHint();
      return;
    }
    stopAudio(true);
    checked = true;
    rowResults = [];
    for (var i = 0; i < TOTAL; i++) {
      rowResults[i] = isRowCorrect(i);
    }
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

  function personPlayIcon(who) {
    if (audioError[who]) return ALERT_ICON;
    if (playingWho === who) return BARS_ICON;
    return PLAY_ICON;
  }

  function personSubLabel(who) {
    if (audioError[who]) return "Audio error";
    if (playingWho === who) return "Listening…";
    if (listenedMap[who]) return "Replay";
    return "Listen";
  }

  function cellClass(actIdx, person) {
    var sel = !!selections[actIdx][person];
    var cls = "dr-cell";
    if (playingWho === person) cls += " is-col-listening";

    if (!checked) {
      if (sel) cls += " is-on";
      return cls;
    }

    cls += " is-locked";
    var correctPeople = CORRECT[actIdx] || [];
    var shouldBe = correctPeople.indexOf(person) !== -1;
    if (shouldBe && sel) cls += " is-correct";
    else if (!shouldBe && !sel) cls += " is-correct-empty";
    else if (shouldBe && !sel) cls += " is-missed";
    else cls += " is-wrong";
    return cls;
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">📋</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">People are talking about their daily routines. Listen and check (✓) the things each person does.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="dr-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Peter / Amelia / Charlie</strong> (or press <strong>1–3</strong>) to listen</span></li>' +
      '<li><span class="tip-num">2</span><span>Check the boxes for what each person does</span></li>' +
      '<li><span class="tip-num">3</span><span>Press <strong>Check answers</strong> to see your score</span></li>' +
      "</ol></section>";
    document.getElementById("dr-start").onclick = startGame;
  }

  function renderPlay() {
    var checkedCount = totalCheckedCount();
    var counter = checked ? score() + " / " + TOTAL : checkedCount + " checked";

    // Preserve table scroll position across re-renders
    var prevWrap = app.querySelector(".dr-table-wrap");
    var scrollTop = prevWrap ? prevWrap.scrollTop : 0;

    var personBtns = PEOPLE.map(function (p, idx) {
      var cls = "dr-person-btn";
      if (playingWho === p) cls += " is-playing";
      if (listenedMap[p]) cls += " is-listened";
      if (audioError[p]) cls += " is-error";
      var pct = audioProgress[p] || 0;
      var badge = listenedMap[p] && playingWho !== p ? "✓" : String(idx + 1);

      return (
        '<button type="button" class="' + cls + '" data-who="' + esc(p) + '" aria-pressed="' +
        (playingWho === p ? "true" : "false") + '" aria-label="Play ' + esc(p) + '">' +
        '<span class="dr-person-main">' +
        '<span class="dr-person-ico">' + personPlayIcon(p) + "</span>" +
        '<span class="dr-person-meta">' +
        '<span class="dr-person-name">' + esc(p) + "</span>" +
        '<span class="dr-person-sub">' + esc(personSubLabel(p)) + "</span>" +
        "</span>" +
        "</span>" +
        '<span class="dr-person-badge" aria-hidden="true">' + badge + "</span>" +
        '<span class="dr-progress-track" aria-hidden="true"><span class="dr-progress-fill" style="width:' + pct + '%"></span></span>' +
        "</button>"
      );
    }).join("");

    var legend = checked
      ? '<div class="dr-legend" aria-label="Answer key legend">' +
        '<span class="dr-legend-item"><span class="dr-legend-dot is-ok">✓</span>Correct</span>' +
        '<span class="dr-legend-item"><span class="dr-legend-dot is-missed">✓</span>Missed</span>' +
        '<span class="dr-legend-item"><span class="dr-legend-dot is-wrong">✕</span>Wrong</span>' +
        "</div>"
      : "";

    var head =
      '<div class="dr-head">' +
      '<div class="dr-persons">' + personBtns + "</div>" +
      legend +
      "</div>";

    var thead =
      "<thead><tr>" +
      '<th class="dr-act-th">Activity</th>' +
      PEOPLE.map(function (p) {
        var listening = playingWho === p ? ' is-listening' : "";
        return '<th class="dr-person-th' + listening + '">' + esc(p) + "</th>";
      }).join("") +
      "</tr></thead>";

    var rows = ACTIVITIES.map(function (act, i) {
      var cells = PEOPLE.map(function (p) {
        var cls = cellClass(i, p);
        var mark = "";
        if (checked) {
          var correctPeople = CORRECT[i] || [];
          var shouldBe = correctPeople.indexOf(p) !== -1;
          var sel = !!selections[i][p];
          if (shouldBe) mark = "✓";
          else if (sel) mark = "✕";
        } else if (selections[i][p]) {
          mark = "✓";
        }

        return (
          '<td class="' + cls + '" data-a="' + i + '" data-p="' + esc(p) + '" role="checkbox" aria-label="' +
          esc(p + " — " + act) + '" aria-checked="' + (selections[i][p] ? "true" : "false") +
          '" tabindex="' + (checked ? "-1" : "0") + '">' +
          '<span class="dr-mark">' + mark + "</span></td>"
        );
      }).join("");

      var rowCls = "dr-row";
      if (checked) rowCls += rowResults[i] ? " is-row-ok" : " is-row-bad";

      return (
        '<tr class="' + rowCls + '">' +
        '<td class="dr-act"><span class="dr-act-num">' + (i + 1) + ".</span>" + esc(act) + "</td>" +
        cells +
        "</tr>"
      );
    }).join("");

    var table =
      '<div class="dr-table-wrap">' +
      '<table class="dr-table" role="grid" aria-label="Daily routines checklist">' +
      thead +
      "<tbody>" + rows + "</tbody>" +
      "</table></div>";

    var foot;
    if (!checked) {
      var hintText = checkedCount === 0
        ? "Tap a speaker above to listen"
        : checkedCount + (checkedCount === 1 ? " box" : " boxes") + " selected";

      foot =
        '<div class="dr-foot">' +
        '<div class="dr-foot-bar">' +
        '<div class="dr-foot-status">' +
        '<span class="dr-foot-text">' + esc(hintText) + "</span>" +
        '<span class="dr-foot-sub">All 11 rows are scored</span>' +
        "</div>" +
        '<div class="dr-foot-actions">' +
        '<button type="button" class="dr-clear-btn" id="dr-clear"' + (checkedCount === 0 ? " disabled" : "") + ">Clear</button>" +
        '<button type="button" class="lc-btn primary" id="dr-check">Check answers</button>' +
        "</div>" +
        "</div>" +
        "</div>";
    } else {
      var s = score();
      var tone = s === TOTAL ? "is-ok" : s >= 6 ? "is-mid" : "is-bad";
      var msg =
        s === TOTAL
          ? "Perfect! All 11 routines correct."
          : s + " of " + TOTAL + " routines completely correct.";

      foot =
        '<div class="dr-foot">' +
        '<div class="dr-foot-bar">' +
        '<div class="dr-foot-status">' +
        '<span class="dr-foot-text ' + tone + '">' + esc(msg) + "</span>" +
        '<span class="dr-foot-sub">Review the grid above, then continue</span>' +
        "</div>" +
        '<div class="dr-foot-actions">' +
        '<button type="button" class="lc-btn primary" id="dr-finish">See results →</button>' +
        "</div>" +
        "</div>" +
        "</div>";
    }

    app.innerHTML =
      topBar(counter) +
      '<div class="dr-stage">' +
      head +
      table +
      foot +
      "</div>";

    var newWrap = app.querySelector(".dr-table-wrap");
    if (newWrap && scrollTop) newWrap.scrollTop = scrollTop;

    app.querySelectorAll(".dr-person-btn").forEach(function (btn) {
      btn.onclick = function () {
        playPerson(btn.getAttribute("data-who"));
      };
    });

    if (!checked) {
      app.querySelectorAll(".dr-cell").forEach(function (td) {
        td.onclick = function () {
          var a = parseInt(td.getAttribute("data-a"), 10);
          var p = td.getAttribute("data-p");
          toggle(a, p);
        };
        td.onkeydown = function (e) {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            var a = parseInt(td.getAttribute("data-a"), 10);
            var p = td.getAttribute("data-p");
            toggle(a, p);
          }
        };
      });

      var clearBtn = document.getElementById("dr-clear");
      if (clearBtn) clearBtn.onclick = clearAllSelections;

      var checkBtn = document.getElementById("dr-check");
      if (checkBtn) checkBtn.onclick = checkAnswers;
    } else {
      var fin = document.getElementById("dr-finish");
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
      '<button type="button" class="lc-btn primary" id="dr-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("dr-again").onclick = startGame;
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
    else if (k === " " && (!document.activeElement || !document.activeElement.classList.contains("dr-cell"))) {
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