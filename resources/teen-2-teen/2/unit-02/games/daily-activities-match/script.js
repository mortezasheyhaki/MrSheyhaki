/* Daily Activities Match – 3 sequential parts × 2 sets of 6 – Teen2Teen 2 Unit 2 */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-daily-activities-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "babysit", label: "babysit my little brother", emoji: "👶", image: CDN + "m7207_babysit_my_little_brother.png", audio: CDN + "j07180_babysit_my_little_brother.mp3" },
    { id: "homework", label: "do homework", emoji: "📚", image: CDN + "q952971_do_homework_2.png", audio: CDN + "t69422_do_homework.mp3" },
    { id: "breakfast", label: "eat breakfast", emoji: "🍳", image: CDN + "w781607__breakfast.png", audio: CDN + "h90907__breakfast.mp3" },
    { id: "dinner", label: "eat dinner", emoji: "🍽️", image: CDN + "w4137__dinner.png", audio: CDN + "h990237__dinner.mp3" },
    { id: "lunch", label: "eat lunch", emoji: "🥗", image: CDN + "i005905__lunch.png", audio: CDN + "h01685__lunch.mp3" },
    { id: "help-mom", label: "help my mom", emoji: "🧺", image: CDN + "k787298_help_my_mom.png", audio: CDN + "h55057_help_my_mom.mp3" },
    { id: "music", label: "listen to music", emoji: "🎧", image: CDN + "p170331_listen_to_music_2.png", audio: CDN + "k631484_listen_to_music.mp3" },
    { id: "computer-games", label: "play computer games", emoji: "🎮", image: CDN + "x9833_ay_computer_games.png", audio: CDN + "m776279_ay_computer_games.mp3" },
    { id: "cat", label: "play with my cat", emoji: "🐱", image: CDN + "d307932_ay_with_my_cat.png", audio: CDN + "m702010_ay_with_my_cat.mp3" },
    { id: "book", label: "read a book", emoji: "📖", image: CDN + "e170364_read_a_book_2.png", audio: CDN + "q536626_read_a_book.mp3" },
    { id: "phone", label: "talk on the phone", emoji: "📱", image: CDN + "o283420_talk_on_the_phone.png", audio: CDN + "h4106_talk_on_the_phone.mp3" },
    { id: "tv", label: "watch TV", emoji: "📺", image: CDN + "q36681_Watch_TV_2.png", audio: CDN + "h993857_watch_TV.mp3" },
  ];

  // 2 fixed sets of 6 (covers all 12)
  var SETS = [
    ["babysit", "homework", "breakfast", "lunch", "dinner", "help-mom"],
    ["music", "computer-games", "cat", "book", "phone", "tv"]
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

  var TOTAL_PAIRS = MODES.length * SETS.reduce(function (n, set) { return n + set.length; }, 0);

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
  var wrongCount = 0; // wrong matches, used for accuracy stars
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

  var K = window.UAKit;
  function sfx(name) {
    if (!K) return;
    var map = { good: "correct", correct: "correct", bad: "wrong", wrong: "wrong",
                win: "win", pop: "place", click: "tap" };
    K.sfx(map[name] || name);
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
    if (mi === 0 && K) K.unlock();
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

  function setSize() {
    return (SETS[setIndex] && SETS[setIndex].length) || leftOrder.length || 6;
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === setSize();
  }

  function heartsHtml() {
    var h = '<div class="mc-hearts" id="mc-hearts" aria-label="Lives">';
    for (var i = 0; i < 3; i++) {
      if (i < lives) {
        h += '<span class="mc-heart is-full" data-i="' + i + '">♥</span>';
      } else {
        h += '<span class="mc-heart is-broken" data-i="' + i + '">♡</span>';
      }
    }
    return h + "</div>";
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
    wrongCount++;
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
            // Part finished → pop-up, then straight into the next part
            sfx("win");
            setTimeout(function () { startPart(modeIndex + 1); }, 1700);
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
      breakHeart(function () {
        busy = false; // mistakes no longer end the game; stars come from accuracy
      });
    }
  }

  function updateProgress() {
    var pct = Math.round((correctCount() / setSize()) * 100);
    var count = app.querySelector(".ua-count");
    if (count) count.textContent = "Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + setSize();
    K.setProgress(app, pct);
  }

  function calcStars() {
    // Stars come from accuracy: correct matches / all match attempts
    var attempts = totalCorrect + wrongCount;
    if (totalCorrect < TOTAL_PAIRS || attempts === 0) return 0;
    var acc = totalCorrect / attempts;
    return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
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
        (c.image
          ? '<img class="mc-thumb" src="' + c.image + '" alt="" draggable="false" loading="lazy" />'
          : '<span class="mc-emoji-fallback" aria-hidden="true">' + (c.emoji || "•") + "</span>") +
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
        (c.image
          ? '<img class="mc-thumb" src="' + c.image + '" alt="" draggable="false" loading="lazy" />'
          : '<span class="mc-emoji-fallback" aria-hidden="true">' + (c.emoji || "•") + "</span>") +
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

  function header(title) {
    return K.topbar({ title: title, pct: 0 });
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        header("Daily Activities Match") +
        '<section class="mc-start ua-screen">' +
          '<div class="mc-hero" aria-hidden="true">👕</div>' +
          "<h1>Daily Activities Match</h1>" +
          '<p class="mc-desc">3 parts · 10 items each · 3 hearts</p>' +
          '<ol class="mc-part-list">' +
            "<li><strong>Part 1</strong> — Words → Pictures</li>" +
            "<li><strong>Part 2</strong> — Audio → Words</li>" +
            "<li><strong>Part 3</strong> — Audio → Pictures</li>" +
          "</ol>" +
          '<button type="button" class="ua-btn" id="mc-start">Start Part 1</button>' +
        "</section>";
      K.afterRender(app, "mc");
      document.getElementById("mc-start").onclick = function () {
        sfx("click");
        playExit(function () { totalCorrect = 0; wrongCount = 0; startPart(0); });
      };
      return;
    }

    if (phase === "between") {
      var finished = MODES[modeIndex];
      var next = MODES[modeIndex + 1];
      sfx("win");
      app.innerHTML =
        K.topbar({ title: "Daily Activities Match", count: "Part " + (modeIndex + 1) + "/" + MODES.length, pct: ((modeIndex + 1) / MODES.length) * 100 }) +
        '<section class="mc-start mc-between ua-screen">' +
          '<div class="mc-hero" aria-hidden="true">✨</div>' +
          "<h1>Part " + (modeIndex + 1) + " complete!</h1>" +
          '<p class="mc-desc">' + finished.encourage + "</p>" +
          '<p class="mc-next-label">Up next:</p>' +
          '<p class="mc-next-title"><strong>Part ' + (modeIndex + 2) + "</strong> — " + next.title + "</p>" +
          '<button type="button" class="ua-btn" id="mc-continue">Continue</button>' +
        "</section>";
      K.afterRender(app, "mc");
      document.getElementById("mc-continue").onclick = function () {
        sfx("click");
        playExit(function () { startPart(modeIndex + 1); });
      };
      return;
    }

    if (phase === "done") {
      var stars = saveStars();
      sfx(stars >= 2 ? "win" : "lose");
      app.innerHTML =
        K.topbar({ title: "Daily Activities Match", count: TOTAL_PAIRS + "/" + TOTAL_PAIRS, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({
            score: totalCorrect, total: TOTAL_PAIRS, stars: stars,
            scoreText: "You matched " + totalCorrect + " / " + TOTAL_PAIRS +
              " · accuracy " + Math.round((totalCorrect / Math.max(1, totalCorrect + wrongCount)) * 100) + "%",
            againId: "cm-again"
          }) +
        "</div>";
      K.afterRender(app, "mc");
      document.getElementById("cm-again").onclick = function () {
        sfx("click");
        playExit(function () { totalCorrect = 0; wrongCount = 0; startPart(0); });
      };
      K.celebrate(app.querySelector(".ua-done"));
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var left = leftOrder.map(function (id, i) { return leftCell(id, i, mode.left); }).join("");
    var right = rightOrder.map(function (id) { return rightCell(id, mode.right); }).join("");

    var shortTitles = ["Words → Pics", "Audio → Words", "Audio → Pics"];
    var shortTitle = shortTitles[modeIndex] || mode.title;

    app.innerHTML =
      K.topbar({
        title: "P" + (modeIndex + 1) + " · " + shortTitle,
        extra: heartsHtml(),
        count: "Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + setSize(),
        pct: Math.round((correctCount() / setSize()) * 100)
      }) +
      '<div class="ua-screen mc-screen">' +
        '<p class="mc-instruction" id="mc-hint">' + mode.tip + "</p>" +
        '<div class="mc-board is-entering">' +
          '<div class="mc-col mc-col-left">' + left + "</div>" +
          '<div class="mc-col mc-col-right">' + right + "</div>" +
        "</div>" +
        '<div class="mc-actions">' +
          '<button type="button" class="ua-btn ua-btn--ghost mc-reset-btn" id="mc-reset">Reset round</button>' +
        "</div>" +
      "</div>";

    K.afterRender(app, "mc");
    setTimeout(function () {
      var board = app.querySelector(".mc-board");
      if (board) board.classList.remove("is-entering");
    }, 500);

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () { selectLeft(+el.dataset.i); };
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
      btn.onclick = function () { selectRight(btn.dataset.id); };
    });
    document.getElementById("mc-reset").onclick = function () {
      sfx("click");
      playExit(function () { startSet(setIndex); });
    };
  }

  // Preload images
  ITEMS.forEach(function (c) {
    if (!c.image) return;
    var img = new Image();
    img.src = c.image;
  });

  render();
})();
