/* Free-Time Match – 3 parts × 2 sets of 6 – AEF Starter Unit 7A */
(function () {
  "use strict";

  var GAME_ID = "starter-7a-free-time-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "go-out", label: "go out", image: "https://cdn.imgurl.ir/uploads/i263475_.png", audio: "https://cdn.imgurl.ir/uploads/s54979_.mp3" },
    { id: "play-computer-games", label: "play computer games", image: "https://cdn.imgurl.ir/uploads/c43008_.png", audio: "https://cdn.imgurl.ir/uploads/s325680_.mp3" },
    { id: "exercise", label: "exercise", image: "https://cdn.imgurl.ir/uploads/p01944_.png", audio: "https://cdn.imgurl.ir/uploads/o46822_.mp3" },
    { id: "go-to-the-beach", label: "go to the beach", image: "https://cdn.imgurl.ir/uploads/z211217_.png", audio: "https://cdn.imgurl.ir/uploads/y34635_.mp3" },
    { id: "stay-at-home", label: "stay at home", image: "https://cdn.imgurl.ir/uploads/m038791_.png", audio: "https://cdn.imgurl.ir/uploads/d291411_.mp3" },
    { id: "play-tennis", label: "play tennis", image: "https://cdn.imgurl.ir/uploads/h309983_.png", audio: "https://cdn.imgurl.ir/uploads/f06733_.mp3" },
    { id: "hike", label: "hike", image: "https://cdn.imgurl.ir/uploads/v021773_.png", audio: "https://cdn.imgurl.ir/uploads/a129784_.mp3" },
    { id: "play-the-piano", label: "play the piano", image: "https://cdn.imgurl.ir/uploads/v589989_.png", audio: "https://cdn.imgurl.ir/uploads/v66268_.mp3" },
    { id: "swim", label: "swim", image: "https://cdn.imgurl.ir/uploads/o206840_.png", audio: "https://cdn.imgurl.ir/uploads/l74148_.mp3" },
    { id: "meet-friends", label: "meet friends", image: "https://cdn.imgurl.ir/uploads/r674726_.png", audio: "https://cdn.imgurl.ir/uploads/f0661_.mp3" },
    { id: "relax", label: "relax", image: "https://cdn.imgurl.ir/uploads/p343394_.png", audio: "https://cdn.imgurl.ir/uploads/i212347_.mp3" },
    { id: "travel", label: "travel", image: "https://cdn.imgurl.ir/uploads/o091608_.png", audio: "https://cdn.imgurl.ir/uploads/h07993_.mp3" }
  ];

  // 2 fixed sets of 6 (covers all 12)
  var SETS = [
    ["go-out", "play-computer-games", "exercise", "go-to-the-beach", "stay-at-home", "play-tennis"],
    ["hike", "play-the-piano", "swim", "meet-friends", "relax", "travel"]
  ];

  // Sequential parts (not free-choice modes)
  var MODES = [
    {
      id: "word-pic",
      title: "Words → Pictures",
      left: "word",
      right: "pic",
      tip: "Tap a word, then match the picture.",
      encourage: "Awesome matching! 🌟 You finished Words → Pictures."
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

  var TOTAL_PAIRS = 36; // 3 parts × 2 sets × 6

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
  var lives = 3;
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

  /* ── Screen transitions: fade+slide the current screen out, then
     hand control back so the caller can change state and re-render.
     The freshly rendered screen fades itself in via the .mc-screen
     entrance animation in CSS, so no "enter" bookkeeping is needed. ── */
  var SCREEN_LEAVE_MS = 190;

  function playExit(cb) {
    var scr = app.querySelector(".mc-screen");
    if (!scr) {
      cb();
      return;
    }
    scr.classList.add("mc-screen-leave");
    setTimeout(cb, SCREEN_LEAVE_MS);
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

  /** Heart-break SFX — short crack + descending tone */
  function sfxHeartBreak() {
    var ctx = getSfxCtx();
    if (!ctx) return;
    try {
      var t0 = ctx.currentTime;
      // Soft crack (noise burst)
      var bufferSize = Math.floor(ctx.sampleRate * 0.08);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
      }
      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      var noiseGain = ctx.createGain();
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1200;
      noiseFilter.Q.value = 0.8;
      noiseGain.gain.setValueAtTime(0.18, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t0);
      noise.stop(t0 + 0.1);

      // Descending glass-like tones
      function drop(freq, delay, dur, vol) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(freq, t0 + delay);
        o.frequency.exponentialRampToValueAtTime(freq * 0.45, t0 + delay + dur);
        g.gain.setValueAtTime(0.0001, t0 + delay);
        g.gain.exponentialRampToValueAtTime(vol, t0 + delay + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0 + delay);
        o.stop(t0 + delay + dur + 0.02);
      }
      drop(520, 0.02, 0.22, 0.12);
      drop(340, 0.06, 0.28, 0.09);
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
    // Lives reset only when starting the full game (part 1)
    if (mi === 0) lives = 3;
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
    return correctCount() >= (SETS[setIndex] ? SETS[setIndex].length : 6);
  }

  function heartsHtml() {
    return "";
  }

  function renderHearts() {
    var root = document.getElementById("mc-hearts");
    if (!root) return;
    var nodes = root.querySelectorAll(".mc-heart");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.classList.remove("is-full", "is-broken", "is-breaking");
      if (i < lives) {
        el.classList.add("is-full");
        el.textContent = "♥";
      } else {
        el.classList.add("is-broken");
        el.textContent = "♡";
      }
    }
  }

  function breakHeart(done) {
    if (lives <= 0) {
      if (done) done();
      return;
    }
    var loseIndex = lives - 1;
    lives -= 1;
    sfxHeartBreak();
    var root = document.getElementById("mc-hearts");
    var el = root ? root.querySelector('.mc-heart[data-i="' + loseIndex + '"]') : null;
    if (el) {
      el.classList.remove("is-full");
      el.classList.add("is-breaking");
      el.textContent = "♥";
      setTimeout(function () {
        el.classList.remove("is-breaking");
        el.classList.add("is-broken");
        el.textContent = "♡";
        if (done) done();
      }, 480);
    } else {
      renderHearts();
      if (done) done();
    }
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
          if (setIndex < SETS.length - 1) {
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
        // clear selection so they can try again
        selectedLeft = null;
        app.querySelectorAll(".mc-left-item").forEach(function (el) {
          el.classList.remove("is-selected");
        });
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
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/5";
    var short =
      (setIndex + 1) +
      "/" +
      SETS.length +
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
    var fill = document.getElementById("mc-set-progress-fill");
    if (fill) fill.style.width = Math.round((correctCount() / 5) * 100) + "%";
  }

  function calcStars() {
    // Stars from overall accuracy
    var pct = TOTAL_PAIRS ? totalCorrect / TOTAL_PAIRS : 0;
    if (pct >= 0.9) return 3;
    if (pct >= 0.7) return 2;
    if (pct >= 0.4) return 1;
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
        '<div class="mc-screen">' +
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Free-Time Match</span>' +
        '<span class="mc-badge">Unit 7A</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero mc-hero-svg" aria-hidden="true"><svg viewBox="0 0 64 64" width="56" height="56"><rect x="6" y="10" width="24" height="32" rx="6" fill="#a78bfa"/><rect x="34" y="22" width="24" height="32" rx="6" fill="#34d399"/><circle cx="18" cy="26" r="5" fill="#fff" opacity=".9"/><circle cx="46" cy="38" r="5" fill="#fff" opacity=".9"/></svg></div>' +
        "<h1>Free-Time Match</h1>" +
        '<p class="mc-desc">3 parts · 2 sets of 6 · 36 matches</p>' +
        '<ol class="mc-part-list">' +
        "<li><strong>Part 1</strong> — Words → Pictures</li>" +
        "<li><strong>Part 2</strong> — Audio → Words</li>" +
        "<li><strong>Part 3</strong> — Audio → Pictures</li>" +
        "</ol>" +
        '<button type="button" class="mc-btn mc-start-btn" id="mc-start">Start Part 1</button>' +
        "</section>" +
        "</div>";
      document.getElementById("mc-start").onclick = function () {
        sfx("click");
        playExit(function () {
          totalCorrect = 0;
          startPart(0);
        });
      };
      return;
    }

    if (phase === "between") {
      var finished = MODES[modeIndex];
      var next = MODES[modeIndex + 1];
      app.innerHTML =
        '<div class="mc-screen">' +
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Free-Time Match</span>' +
        '<span class="mc-badge">Unit 7A</span>' +
        "</header>" +
        '<section class="mc-start mc-between">' +
        '<div class="mc-hero mc-hero-svg" aria-hidden="true"><svg viewBox="0 0 64 64" width="56" height="56"><rect x="6" y="10" width="24" height="32" rx="6" fill="#a78bfa"/><rect x="34" y="22" width="24" height="32" rx="6" fill="#34d399"/><circle cx="18" cy="26" r="5" fill="#fff" opacity=".9"/><circle cx="46" cy="38" r="5" fill="#fff" opacity=".9"/></svg></div>' +
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
        "</section>" +
        "</div>";
      document.getElementById("mc-continue").onclick = function () {
        sfx("click");
        playExit(function () {
          startPart(modeIndex + 1);
        });
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
            playExit(function () {
              totalCorrect = 0;
              startPart(0);
            });
          },
          onModes: function () {
            playExit(function () {
              phase = "menu";
              render();
            });
          },
          backHref: "../",
          save: false
        });
        return;
      }
      app.innerHTML =
        '<div class="mc-screen">' +
        '<section class="mc-done"><h1>Done!</h1>' +
        "<p>You matched " +
        totalCorrect +
        "/" +
        TOTAL_PAIRS +
        ".</p>" +
        '<button type="button" class="mc-btn" id="cm-again">Again</button></section>' +
        "</div>";
      document.getElementById("cm-again").onclick = function () {
        sfx("click");
        playExit(function () {
          totalCorrect = 0;
          startPart(0);
        });
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
    var progressPct = Math.round((correctCount() / 5) * 100);
    app.innerHTML =
      '<div class="mc-screen">' +
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
      heartsHtml() +
      '<span class="mc-progress" id="mc-progress">' +
      '<span class="mc-prog-full">Part ' +
      (modeIndex + 1) +
      "/" +
      MODES.length +
      " · Set " +
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      '/5</span><span class="mc-prog-short">' +
      (setIndex + 1) +
      "/" +
      SETS.length +
      " · " +
      correctCount() +
      "/5</span></span>" +
      "</header>" +
      '<p class="mc-instruction" id="mc-hint">' +
      mode.tip +
      "</p>" +
      '<div class="mc-set-progress" aria-hidden="true">' +
      '<span class="mc-set-progress-fill" id="mc-set-progress-fill" style="width:' +
      progressPct +
      '%"></span>' +
      "</div>" +
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
      "</div>" +
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
      playExit(function () {
        startSet(setIndex);
      });
    };
  }

  // Preload images
  ITEMS.forEach(function (c) {
    var img = new Image();
    img.src = c.image;
  });

  render();
})();
