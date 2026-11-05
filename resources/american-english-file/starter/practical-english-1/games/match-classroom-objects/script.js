/* Match Classroom Objects – 3 parts × 2 sets of 5 – AEF Starter Practical English 1
   Each part: shuffle the 10 objects → 2 sets of 5
*/
(function () {
  "use strict";

  var GAME_ID = "starter-pe1-match-classroom-objects";
  var ITEMS = [
    { id: "bag",            label: "a bag",             audio: "https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3",            image: "https://cdn.imgurl.ir/uploads/q131373_a-bag.png" },
    { id: "pen",            label: "a pen",             audio: "https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3",            image: "https://cdn.imgurl.ir/uploads/t81465_a-pen.png" },
    { id: "paper",          label: "a piece of paper",  audio: "https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3", image: "https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png" },
    { id: "dictionary",     label: "a dictionary",      audio: "https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3",     image: "https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png" },
    { id: "laptop",         label: "a laptop",          audio: "https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3",         image: "https://cdn.imgurl.ir/uploads/w410273_a-laptop.png" },
    { id: "table",          label: "a table",           audio: "https://cdn.imgurl.ir/uploads/d742794_a-table.mp3",          image: "https://cdn.imgurl.ir/uploads/a696837_a-table.png" },
    { id: "chair",          label: "a chair",           audio: "https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3",          image: "https://cdn.imgurl.ir/uploads/t901556_a-chair.png" },
    { id: "window",         label: "a window",          audio: "https://cdn.imgurl.ir/uploads/l543208_a-window.mp3",         image: "https://cdn.imgurl.ir/uploads/c480039_a-window.png" },
    { id: "door",           label: "the door",          audio: "https://cdn.imgurl.ir/uploads/g92275_the-door.mp3",         image: "https://cdn.imgurl.ir/uploads/o763819_the-door.png" },
    { id: "board",          label: "the board",         audio: "https://cdn.imgurl.ir/uploads/i034259_the-board.mp3",        image: "https://cdn.imgurl.ir/uploads/v58413_the-board.png" },
  ];

  // Built fresh each game from shuffled pool (2 sets of 5)
  var SETS = [];

  var MODES = [
    {
      id: "pic-word",
      title: "Pictures → Words",
      left: "pic",
      right: "word",
      tip: "Match each picture to the word.",
      encourage: "Awesome matching! 🌟 You finished Pictures → Words."
    },
    {
      id: "audio-word",
      title: "Audio → Words",
      left: "audio",
      right: "word",
      tip: "Listen, then match the word.",
      encourage: "Great listening! 🎧 You finished Audio → Words."
    },
    {
      id: "audio-pic",
      title: "Audio → Pictures",
      left: "audio",
      right: "pic",
      tip: "Listen, then match the picture.",
      encourage: "Amazing work! 🎉 You finished all the parts."
    }
  ];

  var TOTAL_PAIRS = 30; // 3 parts × 2 sets × 5
  var SETS_PER_PART = 2;

  function buildSets() {
    // Each part uses all 10 objects, split into 2 sets of 5.
    var ids = ITEMS.map(function (it) { return it.id; });
    var sets = [];
    for (var p = 0; p < MODES.length; p++) {
      var order = shuffle(ids.slice());
      sets.push(order.slice(0, 5));
      sets.push(order.slice(5, 10));
    }
    SETS = sets;
  }

  var app = document.getElementById("game-app");
  if (!app) return;

  var modeIndex = 0;
  var phase = "menu"; // menu | play | between | done
  var setIndex = 0;
  var leftOrder = [];
  var rightOrder = [];
  var locked = {};
  var matches = {};
  var selectedLeft = null;
  var currentAudio = null;
  var playingLeft = null;
  var setCorrect = 0;
  var modeCorrect = 0;
  var totalCorrect = 0;
  var mistakes = 0;
  var busy = false;

  function byId(id) {
    return ITEMS.find(function (c) {
      return c.id === id;
    });
  }

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

  var sfxCtx = null;

  function getSfxCtx() {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") {
      try {
        sfxCtx.resume();
      } catch (_) {}
    }
    return sfxCtx;
  }

  function sfx(name) {
    if (!window.LASfx) return;
    try {
      if (name === "correct" && LASfx.correct) LASfx.correct();
      else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
      else if (name === "win" && LASfx.win) LASfx.win();
      else if (name === "pop" && LASfx.pop) LASfx.pop();
      else if (name === "click" && LASfx.click) LASfx.click();
    } catch (_) {}
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
    playingLeft = null;
    app.querySelectorAll(".mc-play.playing").forEach(function (b) {
      b.classList.remove("playing");
    });
  }

  function playAudioFor(leftIndex) {
    var id = leftOrder[leftIndex];
    var c = byId(id);
    if (!c || !c.audio) return;

    if (playingLeft === leftIndex && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    var a = new Audio(c.audio);
    currentAudio = a;
    playingLeft = leftIndex;
    var btn = app.querySelector('.mc-play[data-i="' + leftIndex + '"]');
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
      playingLeft = null;
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (playingLeft === leftIndex) playingLeft = null;
      currentAudio = null;
    };
  }

  function startPart(mi) {
    if (window.LAFinish && mi === 0) LAFinish.startTimer();
    modeIndex = mi;
    modeCorrect = 0;
    // Mistakes reset only when starting the full game (part 1)
    if (mi === 0) mistakes = 0;
    phase = "play";
    startSet(mi * SETS_PER_PART);
  }

  function startSet(si) {
    stopAudio();
    setIndex = si;
    var ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    locked = {};
    matches = {};
    selectedLeft = null;
    setCorrect = 0;
    busy = false;
    phase = "play";
    render();
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === 5;
  }

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach(function (el) {
      if (!el) return;
      el.classList.add("mc-match-pop");
      for (var i = 0; i < 8; i++) {
        var s = document.createElement("span");
        s.className = "mc-spark";
        var angle = (i / 8) * Math.PI * 2;
        var dist = 28 + Math.random() * 18;
        s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        s.style.setProperty("--delay", i * 0.02 + "s");
        el.appendChild(s);
        setTimeout(function (node) {
          return function () {
            node.remove();
          };
        }(s), 700);
      }
      setTimeout(function (node) {
        return function () {
          node.classList.remove("mc-match-pop");
        };
      }(el), 550);
    });
    var flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(function () {
      flash.remove();
    }, 500);
  }

  function selectLeft(i) {
    if (busy || locked[i]) return;
    selectedLeft = i;
    sfx("click");
    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    var mode = MODES[modeIndex];
    if (mode.left === "audio") {
      playAudioFor(i);
    }
  }

  function selectRight(rightId) {
    if (busy) return;
    if (selectedLeft === null) {
      var hint = document.getElementById("mc-hint");
      if (hint) {
        var mode = MODES[modeIndex];
        hint.textContent =
          mode.left === "audio"
            ? "Play a sound first, then tap a match."
            : mode.left === "pic"
              ? "Tap a picture on the left first."
              : "Tap a word on the left first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(function () {
          hint.classList.remove("mc-hint-warn");
        }, 1200);
      }
      sfx("wrong");
      return;
    }
    var used = Object.keys(locked).some(function (li) {
      return matches[li] === rightId;
    });
    if (used) return;

    var leftId = leftOrder[selectedLeft];
    var ok = leftId === rightId;
    var leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    var rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (ok) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      setCorrect += 1;
      modeCorrect += 1;
      totalCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      spawnMatchFX(leftEl, rightEl);
      sfx("pop");
      sfx("correct");
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach(function (el) {
        el.classList.remove("is-selected");
      });
      updateProgress();
      if (allMatched()) {
        busy = true;
        setTimeout(function () {
          if (setIndex % SETS_PER_PART < SETS_PER_PART - 1) {
            // Next set of current part
            startSet(setIndex + 1);
          } else if (modeIndex < MODES.length - 1) {
            // Part finished → encouraging screen, then next part
            sfx("win");
            phase = "between";
            render();
          } else {
            // Last part finished → finish screen
            sfx("win");
            phase = "done";
            render();
          }
        }, 650);
      }
    } else {
      busy = true;
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      sfx("wrong");
      setTimeout(function () {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 500);
      mistakes += 1;
      setTimeout(function () {
        busy = false;
      }, 500);
    }
  }

  function updateProgress() {
    var el = document.getElementById("mc-progress");
    if (!el) return;
    var full =
      "Part " +
      (modeIndex + 1) +
      "/" +
      MODES.length +
      " · Set " +
      (setIndex % SETS_PER_PART + 1) +
      "/" +
      SETS_PER_PART +
      " · " +
      correctCount() +
      "/5";
    var short =
      (setIndex % SETS_PER_PART + 1) +
      "/" +
      SETS_PER_PART +
      " · " +
      correctCount() +
      "/5";
    var fullEl = el.querySelector(".mc-prog-full");
    var shortEl = el.querySelector(".mc-prog-short");
    if (fullEl && shortEl) {
      fullEl.textContent = full;
      shortEl.textContent = short;
    } else {
      el.textContent = full;
    }
  }

  function calcStars() {
    // Stars from accuracy: correct pairs out of all attempts
    var tries = totalCorrect + mistakes;
    var pct = tries ? Math.round((totalCorrect / tries) * 100) : 0;
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function saveStars() {
    var stars = calcStars();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    return stars;
  }

  function leftCell(id, i, kind) {
    var c = byId(id);
    var isLocked = !!locked[i];
    var sel = selectedLeft === i ? " is-selected" : "";
    var ok = isLocked ? " is-correct" : "";

    if (kind === "audio") {
      return (
        '<div class="mc-left-item mc-audio-cell' +
        ok +
        sel +
        '" data-i="' +
        i +
        '">' +
        '<button type="button" class="mc-play" data-i="' +
        i +
        '" aria-label="Play ' +
        c.label +
        '"' +
        (isLocked ? " disabled" : "") +
        ">" +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button></div>"
      );
    }

    if (kind === "pic") {
      return (
        '<div class="mc-left-item mc-pic-cell' +
        ok +
        sel +
        '" data-i="' +
        i +
        '">' +
        '<img class="mc-thumb" src="' +
        c.image +
        '" alt="" draggable="false" loading="lazy" />' +
        "</div>"
      );
    }

    // word
    return (
      '<div class="mc-left-item mc-word-left' +
      ok +
      sel +
      '" data-i="' +
      i +
      '">' +
      '<span class="mc-word-label">' +
      c.label +
      "</span></div>"
    );
  }

  function rightCell(id, kind) {
    var c = byId(id);
    var used = Object.keys(locked).some(function (li) {
      return matches[li] === id;
    });
    var usedClass = used ? " is-correct is-used" : "";
    var disabled = used ? " disabled" : "";

    if (kind === "pic") {
      return (
        '<button type="button" class="mc-right-item mc-pic-btn' +
        usedClass +
        '" data-id="' +
        id +
        '"' +
        disabled +
        ">" +
        '<img class="mc-thumb" src="' +
        c.image +
        '" alt="" draggable="false" loading="lazy" />' +
        "</button>"
      );
    }

    return (
      '<button type="button" class="mc-right-item mc-word' +
      usedClass +
      '" data-id="' +
      id +
      '"' +
      disabled +
      ">" +
      '<span class="mc-word-label">' +
      c.label +
      "</span></button>"
    );
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Classroom Objects</span>' +
        '<span class="mc-badge">Practical English 1</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">🎒</div>' +
        "<h1>Match Classroom Objects</h1>" +
        '<p class="mc-desc">3 parts · 2 sets of 5 each</p>' +
        '<ol class="mc-part-list">' +
        "<li><strong>Part 1</strong> — Pictures → Words</li>" +
        "<li><strong>Part 2</strong> — Audio → Words</li>" +
        "<li><strong>Part 3</strong> — Audio → Pictures</li>" +
        "</ol>" +
        '<button type="button" class="mc-btn mc-start-btn" id="mc-start">Start Part 1</button>' +
        "</section>";
      document.getElementById("mc-start").onclick = function () {
        sfx("click");
        totalCorrect = 0;
        buildSets();
        startPart(0);
      };
      return;
    }

    if (phase === "between") {
      var finished = MODES[modeIndex];
      var next = MODES[modeIndex + 1];
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Classroom Objects</span>' +
        '<span class="mc-badge">Practical English 1</span>' +
        "</header>" +
        '<section class="mc-start mc-between">' +
        '<div class="mc-hero" aria-hidden="true">✨</div>' +
        "<h1>Part " +
        (modeIndex + 1) +
        " complete!</h1>" +
        '<p class="mc-desc">' +
        finished.encourage +
        "</p>" +
        '<p class="mc-next-label">Up next:</p>' +
        '<p class="mc-next-title"><strong>Part ' +
        (modeIndex + 2) +
        "</strong> — " +
        next.title +
        "</p>" +
        '<button type="button" class="mc-btn mc-start-btn" id="mc-continue">Continue</button>' +
        "</section>";
      document.getElementById("mc-continue").onclick = function () {
        sfx("click");
        startPart(modeIndex + 1);
      };
      return;
    }

    if (phase === "done") {
      var stars = saveStars();
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: TOTAL_PAIRS,
          stars: stars,
          timeMs: timeMs,
          onAgain: function () {
            totalCorrect = 0;
            buildSets();
            startPart(0);
          },
          onModes: function () {
            phase = "menu";
            render();
          },
          backHref: "../",
          save: false
        });
        return;
      }
      app.innerHTML =
        '<section class="mc-done"><h1>Done!</h1>' +
        "<p>You matched " +
        totalCorrect +
        "/" +
        TOTAL_PAIRS +
        ".</p>" +
        '<button type="button" class="mc-btn" id="cm-again">Again</button></section>';
      document.getElementById("cm-again").onclick = function () {
        totalCorrect = 0;
        buildSets();
        startPart(0);
      };
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var left = leftOrder
      .map(function (id, i) {
        return leftCell(id, i, mode.left);
      })
      .join("");
    var right = rightOrder
      .map(function (id) {
        return rightCell(id, mode.right);
      })
      .join("");

    var shortTitles = ["Words → Pics", "Audio → Words", "Audio → Pics"];
    var shortTitle = shortTitles[modeIndex] || mode.title;
    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title" title="' +
      mode.title +
      '"><span class="mc-title-full">Part ' +
      (modeIndex + 1) +
      " · " +
      mode.title +
      '</span><span class="mc-title-short">P' +
      (modeIndex + 1) +
      " · " +
      shortTitle +
      "</span></span>" +
      '<span class="mc-progress" id="mc-progress">' +
      '<span class="mc-prog-full">Part ' +
      (modeIndex + 1) +
      "/" +
      MODES.length +
      " · Set " +
      (setIndex % SETS_PER_PART + 1) +
      "/" +
      SETS_PER_PART +
      " · " +
      correctCount() +
      '/5</span><span class="mc-prog-short">' +
      (setIndex % SETS_PER_PART + 1) +
      "/" +
      SETS_PER_PART +
      " · " +
      correctCount() +
      "/5</span></span>" +
      "</header>" +
      '<p class="mc-instruction" id="mc-hint">' +
      mode.tip +
      "</p>" +
      '<div class="mc-board is-entering">' +
      '<div class="mc-col mc-col-left">' +
      left +
      "</div>" +
      '<div class="mc-col mc-col-right">' +
      right +
      "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>' +
      "</div>";

    // clear enter animation class after it runs
    setTimeout(function () {
      var board = app.querySelector(".mc-board");
      if (board) board.classList.remove("is-entering");
    }, 500);

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () {
        selectLeft(+el.dataset.i);
      };
    });
    app.querySelectorAll(".mc-play").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var i = +btn.dataset.i;
        if (locked[i]) return;
        selectLeft(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (btn) {
      btn.onclick = function () {
        selectRight(btn.dataset.id);
      };
    });
    document.getElementById("mc-reset").onclick = function () {
      sfx("click");
      startSet(setIndex);
    };
  }

  // Preload images
  ITEMS.forEach(function (c) {
    var img = new Image();
    img.src = c.image;
  });

  render();
})();
