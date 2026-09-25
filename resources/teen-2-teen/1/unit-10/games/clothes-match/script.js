/* Clothes Match – 3 modes × 2 sets of 5 – Teen2Teen 1 Unit 10 */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u10-clothes-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "sweater", label: "a sweater", image: CDN + "q049292_swer.png", audio: CDN + "d159367_a_swer.mp3" },
    { id: "t-shirt", label: "a T-shirt", image: CDN + "m335_st.png", audio: CDN + "796411_a_st.mp3" },
    { id: "shorts", label: "shorts", image: CDN + "p155179_shorts.png", audio: CDN + "b61351_shorts_2.mp3" },
    { id: "shoes", label: "shoes", image: CDN + "i80933_shoes.png", audio: CDN + "y529847_shoes_3.mp3" },
    { id: "shirt", label: "a shirt", image: CDN + "y409033_shirt.png", audio: CDN + "f1066_a_shirt.mp3" },
    { id: "pants", label: "pants", image: CDN + "b63746_pants.png", audio: CDN + "e126543_pants_2.mp3" },
    { id: "jeans", label: "jeans", image: CDN + "s86734_jeans.png", audio: CDN + "p371082_jeans_3.mp3" },
    { id: "jacket", label: "a jacket", image: CDN + "n731967_jacket.png", audio: CDN + "c58647_a_jacket.mp3" },
    { id: "dress", label: "a dress", image: CDN + "e35407_dress.png", audio: CDN + "m241908_a_dress.mp3" },
    { id: "blouse", label: "a blouse", image: CDN + "d598847_blouse.png", audio: CDN + "m041818_a_blouse.mp3" }
  ];

  // 2 fixed sets of 5 (covers all 10)
  var SETS = [
    ["sweater", "t-shirt", "shorts", "shoes", "shirt"],
    ["pants", "jeans", "jacket", "dress", "blouse"]
  ];

  var MODES = [
    {
      id: "pic-word",
      title: "Pictures → Words",
      left: "pic",
      right: "word",
      tip: "Tap a picture, then match the word."
    },
    {
      id: "word-pic",
      title: "Words → Pictures",
      left: "word",
      right: "pic",
      tip: "Tap a word, then match the picture."
    },
    {
      id: "audio-word",
      title: "Audio → Words",
      left: "audio",
      right: "word",
      tip: "Listen, then match the word."
    }
  ];

  var TOTAL_PAIRS = 10; // 2 sets × 5

  var app = document.getElementById("game-app");
  if (!app) return;

  var modeIndex = 0;
  var phase = "menu"; // menu | play | done
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

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    modeCorrect = 0;
    phase = "play";
    startSet(0);
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
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
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
        busy = false;
      }, 550);
    }
  }

  function updateProgress() {
    var el = document.getElementById("mc-progress");
    if (el) {
      el.textContent =
        "Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/5";
    }
  }

  function calcStars() {
    var n = modeCorrect;
    // 10 pairs total
    if (n >= 10) return 3;
    if (n >= 7) return 2;
    if (n >= 4) return 1;
    return 0;
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
        '<span class="mc-title">Clothes Match</span>' +
        '<span class="mc-badge">Unit 10</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">👕</div>' +
        "<h1>Clothes Match</h1>" +
        '<p class="mc-desc">Choose a mode · 10 items (2 sets of 5)</p>' +
        '<div class="mc-mode-list">' +
        MODES.map(function (m, i) {
          return (
            '<button type="button" class="mc-mode-card mc-mode-btn" data-mode="' +
            i +
            '">' +
            '<span class="mc-mode-num">' +
            (i + 1) +
            "</span>" +
            "<div><strong>" +
            m.title +
            "</strong><p>" +
            m.tip +
            "</p></div></button>"
          );
        }).join("") +
        "</div></section>";
      app.querySelectorAll(".mc-mode-btn").forEach(function (btn) {
        btn.onclick = function () {
          sfx("click");
          startMode(+btn.dataset.mode);
        };
      });
      return;
    }

    if (phase === "done") {
      var stars = saveStars();
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: modeCorrect,
          total: TOTAL_PAIRS,
          stars: stars,
          timeMs: timeMs,
          onAgain: function () {
            startMode(modeIndex);
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
        modeCorrect +
        "/" +
        TOTAL_PAIRS +
        ".</p>" +
        '<button type="button" class="mc-btn" id="cm-again">Again</button></section>';
      document.getElementById("cm-again").onclick = function () {
        startMode(modeIndex);
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

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">' +
      mode.title +
      " · Set " +
      (setIndex + 1) +
      "/" +
      SETS.length +
      "</span>" +
      '<span class="mc-progress" id="mc-progress">Set ' +
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/5</span>" +
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
