/* Conversation Listen – Teen2Teen 2 Unit 2
   Listen → drag the correct activity phrases (no dialogue script) */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-conversation-listen";
  var AUDIO_URL = "https://cdn.imgurl.ir/uploads/c97163_11.3.mp3";

  /* Shared activity chips (same pool language for both questions) */
  var ACTIVITIES = [
    { id: "music", text: "Listening to music" },
    { id: "math", text: "Doing math" },
    { id: "download", text: "Downloading a song" },
    { id: "story", text: "Reading a story" },
    { id: "homework", text: "Doing homework" }
  ];

  /*
   * Brad: doing homework + reading a story for English class
   * Matt: listening to music + doing math homework + downloading a song
   */
  var QUESTIONS = [
    {
      id: "brad",
      prompt: "What is Brad doing?",
      hint: "Drag all the correct phrases into the box.",
      correctIds: ["homework", "story"]
    },
    {
      id: "matt",
      prompt: "What is Matt doing?",
      hint: "Drag all the correct phrases into the box.",
      correctIds: ["music", "math", "download"]
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | done
  var qIndex = 0;
  var answers = {}; // qId -> [optionId, ...]
  var currentAudio = null;
  var poolOrder = [];
  var dragId = null;
  var correctCount = 0;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function activityById(id) {
    for (var i = 0; i < ACTIVITIES.length; i++) {
      if (ACTIVITIES[i].id === id) return ACTIVITIES[i];
    }
    return null;
  }

  var K = window.UAKit;
  function sfx(kind) { if (K) K.sfx(kind); }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    var btn = document.getElementById("cl-play");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    if (!AUDIO_URL) return;
    stopAudio();
    try {
      currentAudio = new Audio(AUDIO_URL);
      var btn = document.getElementById("cl-play");
      if (btn) btn.classList.add("is-playing");
      currentAudio.onended = function () {
        if (btn) btn.classList.remove("is-playing");
        currentAudio = null;
      };
      currentAudio.onerror = function () {
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.play().catch(function () {
        if (btn) btn.classList.remove("is-playing");
      });
    } catch (_) {}
  }

  function currentQ() {
    return QUESTIONS[qIndex];
  }

  function placedList(qId) {
    return answers[qId] || [];
  }

  function setsEqual(a, b) {
    if (a.length !== b.length) return false;
    var sa = a.slice().sort();
    var sb = b.slice().sort();
    for (var i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return false;
    }
    return true;
  }

  function startGame() {
    stopAudio();
    if (K) K.unlock();
    qIndex = 0;
    answers = {};
    correctCount = 0;
    phase = "play";
    prepQuestion();
    render();
  }

  function prepQuestion() {
    var q = currentQ();
    poolOrder = shuffle(
      ACTIVITIES.map(function (a) {
        return a.id;
      })
    );
    answers[q.id] = [];
  }

  function addToDrop(optId) {
    var q = currentQ();
    if (!q) return;
    var list = placedList(q.id);
    if (list.indexOf(optId) !== -1) return;
    list.push(optId);
    answers[q.id] = list;
    sfx("click");
    render();
  }

  function removeFromDrop(optId) {
    var q = currentQ();
    if (!q) return;
    answers[q.id] = placedList(q.id).filter(function (id) {
      return id !== optId;
    });
    sfx("click");
    render();
  }

  function checkCurrent() {
    var q = currentQ();
    var placed = placedList(q.id);
    if (!placed.length) return;

    var ok = setsEqual(placed, q.correctIds);
    var drop = document.getElementById("cl-drop");
    var feedback = document.getElementById("cl-feedback");
    if (drop) {
      drop.classList.remove("is-ok", "is-bad");
      drop.classList.add(ok ? "is-ok" : "is-bad");
    }
    if (feedback) {
      feedback.textContent = ok
        ? "✓ Perfect!"
        : "✗ Not quite — put only the correct phrases for " +
          (q.id === "brad" ? "Brad" : "Matt");
      feedback.className = "cl-feedback " + (ok ? "ok" : "bad");
    }

    if (ok) {
      sfx("correct");
      correctCount++;
      setTimeout(function () {
        if (qIndex < QUESTIONS.length - 1) {
          qIndex++;
          prepQuestion();
          render();
        } else {
          finishGame();
        }
      }, 950);
    } else {
      sfx("wrong");
      setTimeout(function () {
        if (drop) drop.classList.remove("is-bad");
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "cl-feedback";
        }
      }, 900);
    }
  }

  function starsFromScore() {
    var total = QUESTIONS.length;
    var ratio = total ? correctCount / total : 0;
    if (ratio >= 1) return 3;
    if (ratio >= 0.5) return 2;
    if (correctCount > 0) return 1;
    return 0;
  }

  function saveStarsOnce() {
    var stars = starsFromScore();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    return stars;
  }

  function finishGame() {
    phase = "done";
    stopAudio();
    var stars = saveStarsOnce();
    sfx(stars >= 2 ? "win" : "lose");
    render();
    if (K) K.celebrate(app.querySelector(".ua-done"));
  }

  function bindDrag() {
    var chips = app.querySelectorAll(".cl-chip[data-id]");
    var drop = document.getElementById("cl-drop");

    chips.forEach(function (chip) {
      chip.addEventListener("pointerdown", function (e) {
        if (chip.classList.contains("is-placed")) return;
        dragId = chip.getAttribute("data-id");
        chip.classList.add("is-dragging");
        try {
          chip.setPointerCapture(e.pointerId);
        } catch (_) {}
      });
      chip.addEventListener("pointerup", function (e) {
        chip.classList.remove("is-dragging");
        try {
          chip.releasePointerCapture(e.pointerId);
        } catch (_) {}
        if (!dragId) return;
        var el = document.elementFromPoint(e.clientX, e.clientY);
        if (el && (el.id === "cl-drop" || (el.closest && el.closest("#cl-drop")))) {
          addToDrop(dragId);
        }
        dragId = null;
      });
      chip.addEventListener("click", function () {
        if (chip.classList.contains("is-placed")) return;
        addToDrop(chip.getAttribute("data-id"));
      });
      chip.setAttribute("draggable", "true");
      chip.addEventListener("dragstart", function (e) {
        dragId = chip.getAttribute("data-id");
        e.dataTransfer.setData("text/plain", dragId);
        e.dataTransfer.effectAllowed = "move";
        chip.classList.add("is-dragging");
      });
      chip.addEventListener("dragend", function () {
        chip.classList.remove("is-dragging");
        dragId = null;
      });
    });

    if (drop) {
      drop.addEventListener("dragover", function (e) {
        e.preventDefault();
        drop.classList.add("is-over");
      });
      drop.addEventListener("dragleave", function () {
        drop.classList.remove("is-over");
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("is-over");
        var id = e.dataTransfer.getData("text/plain");
        if (id) addToDrop(id);
      });
    }

    app.querySelectorAll(".cl-drop-chip[data-id]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        removeFromDrop(chip.getAttribute("data-id"));
      });
    });

    var checkBtn = document.getElementById("cl-check");
    if (checkBtn) {
      checkBtn.onclick = function () {
        if (!placedList(currentQ().id).length) return;
        checkCurrent();
      };
    }
    var playBtn = document.getElementById("cl-play");
    if (playBtn) {
      playBtn.onclick = function () {
        sfx("click");
        playAudio();
      };
    }
  }

  function renderPool(q) {
    var placed = placedList(q.id);
    return poolOrder
      .map(function (id) {
        var act = activityById(id);
        if (!act) return "";
        var isPlaced = placed.indexOf(id) !== -1;
        return (
          '<button type="button" class="cl-chip' +
          (isPlaced ? " is-placed" : "") +
          '" data-id="' +
          escapeHtml(id) +
          '"' +
          (isPlaced ? " disabled" : "") +
          ">" +
          escapeHtml(act.text) +
          "</button>"
        );
      })
      .join("");
  }

  function renderDrop(q) {
    var placed = placedList(q.id);
    if (!placed.length) {
      return '<span class="cl-drop-hint">Drop the correct phrases here</span>';
    }
    return placed
      .map(function (id) {
        var act = activityById(id);
        return (
          '<button type="button" class="cl-drop-chip" data-id="' +
          escapeHtml(id) +
          '" title="Tap to remove">' +
          escapeHtml(act ? act.text : id) +
          " <span aria-hidden=\"true\">×</span></button>"
        );
      })
      .join("");
  }


  function restorePlaying() {
    if (!currentAudio) return;
    try {
      if (currentAudio.paused) return;
    } catch (_) {
      return;
    }
    var btn = document.getElementById("cl-play");
    if (!btn) return;
    btn.classList.add("is-playing");
    currentAudio.onended = function () {
      btn.classList.remove("is-playing");
      currentAudio = null;
    };
  }


  function render() {
    if (phase === "start") {
      app.innerHTML =
        K.topbar({ title: "Conversation Listen", pct: 0 }) +
        '<section class="cl-start ua-screen">' +
          '<div class="cl-hero" aria-hidden="true">🎧</div>' +
          "<h1>Conversation Listen</h1>" +
          '<p class="cl-desc">Listen to the conversation, then answer <strong>2 questions</strong> about Brad and Matt. Drag the <strong>correct phrases</strong> into the box.</p>' +
          '<p class="cl-muted">No script on screen — use your ears!</p>' +
          '<button type="button" class="ua-btn" id="cl-start">Start</button>' +
        "</section>";
      K.afterRender(app, "cl");
      document.getElementById("cl-start").onclick = function () { sfx("tap"); startGame(); };
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        K.topbar({ title: "Conversation Listen", count: QUESTIONS.length + "/" + QUESTIONS.length, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({ score: correctCount, total: QUESTIONS.length, stars: starsFromScore(), againId: "cl-again" }) +
        "</div>";
      K.afterRender(app, "cl");
      document.getElementById("cl-again").onclick = function () { sfx("tap"); startGame(); };
      return;
    }

    var q = currentQ();
    var hasAnswer = placedList(q.id).length > 0;

    app.innerHTML =
      K.topbar({
        title: "Conversation Listen",
        count: (qIndex + 1) + " / " + QUESTIONS.length,
        pct: (qIndex / QUESTIONS.length) * 100
      }) +
      '<section class="cl-listen ua-screen">' +
        '<button type="button" class="cl-play" id="cl-play" aria-label="Play conversation">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
          "<span>Play conversation</span>" +
        "</button>" +
      "</section>" +
      '<section class="cl-card">' +
        '<p class="cl-qnum">Question ' + (qIndex + 1) + "</p>" +
        '<h2 class="cl-prompt">' + escapeHtml(q.prompt) + "</h2>" +
        '<p class="cl-hint">' + escapeHtml(q.hint) + "</p>" +
        '<div class="cl-drop' + (hasAnswer ? " has-value" : "") + '" id="cl-drop" aria-label="Answer drop zone">' +
          renderDrop(q) +
        "</div>" +
        '<p class="cl-feedback" id="cl-feedback"></p>' +
        '<div class="cl-pool" id="cl-pool">' + renderPool(q) + "</div>" +
        '<button type="button" class="ua-btn cl-check" id="cl-check"' + (hasAnswer ? "" : " disabled") + ">Check</button>" +
      "</section>";

    K.afterRender(app, "cl");
    bindDrag();
    restorePlaying();
  }

  render();
})();
