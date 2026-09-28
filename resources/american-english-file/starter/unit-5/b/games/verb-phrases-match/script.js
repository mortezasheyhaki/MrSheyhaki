/* Verb Phrases Match – 3 parts × 2 sets of 5 – AEF Starter Unit 5B
   Each play: shuffle all 15 phrases → pick 10 → 2 sets of 5
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-match";
  var ITEMS = [
    { id: "live-apartment", label: "live in an apartment", image: "https://cdn.imgurl.ir/uploads/a268498_1._live_in_an_apartment.png", audio: "https://cdn.imgurl.ir/uploads/v24239_1_live_in_an_apartment.mp3" },
    { id: "have-breakfast", label: "have breakfast", image: "https://cdn.imgurl.ir/uploads/i180939_2_have_breakfast.png", audio: "https://cdn.imgurl.ir/uploads/q068505_2_have_breakfast.mp3" },
    { id: "watch-tv", label: "watch TV", image: "https://cdn.imgurl.ir/uploads/z722778_3_watch_TV.png", audio: "https://cdn.imgurl.ir/uploads/j343700_3_watch_TV.mp3" },
    { id: "listen-radio", label: "listen to the radio", image: "https://cdn.imgurl.ir/uploads/r771582_4_listen_to_the_radio.png", audio: "https://cdn.imgurl.ir/uploads/v936094_4_Listen_to_the_radio.mp3" },
    { id: "read-newspaper", label: "read the newspaper", image: "https://cdn.imgurl.ir/uploads/m787410_5_read_the_newspaper.png", audio: "https://cdn.imgurl.ir/uploads/s054742_5_read_the_newspaper.mp3" },
    { id: "eat-fast-food", label: "eat fast food", image: "https://cdn.imgurl.ir/uploads/b044304_6__fastfood.png", audio: "https://cdn.imgurl.ir/uploads/l78660_6__fastfood.mp3" },
    { id: "drink-coffee", label: "drink coffee", image: "https://cdn.imgurl.ir/uploads/g296945_7_drink_coffee.png", audio: "https://cdn.imgurl.ir/uploads/g006864_7_drink_coffee.mp3" },
    { id: "speak-english", label: "speak English", image: "https://cdn.imgurl.ir/uploads/b781742_8_speak_English.png", audio: "https://cdn.imgurl.ir/uploads/z53147_8_speak_English.mp3" },
    { id: "want-coffee", label: "want a coffee", image: "https://cdn.imgurl.ir/uploads/e991538_9_want_a_coffee.png", audio: "https://cdn.imgurl.ir/uploads/f683333_9_want_a_coffee.mp3" },
    { id: "have-dog", label: "have a dog", image: "https://cdn.imgurl.ir/uploads/b92270_10_have_a_dog.png", audio: "https://cdn.imgurl.ir/uploads/q784020_10_have_a_dog.mp3" },
    { id: "like-cats", label: "like cats", image: "https://cdn.imgurl.ir/uploads/u544398_11_like_cats.png", audio: "https://cdn.imgurl.ir/uploads/v70276_11_like_cats.mp3" },
    { id: "work-bank", label: "work in a bank", image: "https://cdn.imgurl.ir/uploads/j72729_12_work_in_a_bank.png", audio: "https://cdn.imgurl.ir/uploads/a502_12_work_in_a_bank.mp3" },
    { id: "study-spanish", label: "study Spanish", image: "https://cdn.imgurl.ir/uploads/h46592_13_study_Spanish.png", audio: "https://cdn.imgurl.ir/uploads/q92916_13_study_Spanish.mp3" },
    { id: "go-classes", label: "go to English classes", image: "https://cdn.imgurl.ir/uploads/x832355_14_Go_to_English_cles.png", audio: "https://cdn.imgurl.ir/uploads/y124959_14_Go_to_English_cles.mp3" },
    { id: "need-car", label: "need a new car", image: "https://cdn.imgurl.ir/uploads/i19129_15_need_a_new_car.png", audio: "https://cdn.imgurl.ir/uploads/o807442_15_need_a_new_car.mp3" }
  ]

  // Built fresh each game from shuffled pool (2 sets of 5)
  var SETS = [];

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

  var TOTAL_PAIRS = 30; // 3 parts × 2 sets × 5

  function buildSets() {
    // Prefer items that have audio for audio-based parts
    var pool = ITEMS.slice();
    // Shuffle full pool
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    // Prefer entries with audio when possible for the 10 picked
    var withAudio = pool.filter(function (it) { return it.audio; });
    var without = pool.filter(function (it) { return !it.audio; });
    var ordered = withAudio.concat(without);
    var picked = ordered.slice(0, 10);
    SETS = [
      picked.slice(0, 5).map(function (it) { return it.id; }),
      picked.slice(5, 10).map(function (it) { return it.id; })
    ];
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
    return correctCount() === 5;
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
      }, 500);
      breakHeart(function () {
        if (lives <= 0) {
          setTimeout(function () {
            phase = "done";
            render();
          }, 400);
        } else {
          busy = false;
        }
      });
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
  }

  function calcStars() {
    // Stars = hearts remaining (same as Food Match)
    return Math.max(0, Math.min(3, lives));
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
        '<span class="mc-title">Verb Phrases Match</span>' +
        '<span class="mc-badge">Unit 10</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">🏙️</div>' +
        "<h1>Verb Phrases Match</h1>" +
        '<p class="mc-desc">3 parts · 10 items each · 3 hearts</p>' +
        '<ol class="mc-part-list">' +
        "<li><strong>Part 1</strong> — Words → Pictures</li>" +
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
        '<span class="mc-title">Verb Phrases Match</span>' +
        '<span class="mc-badge">Unit 10</span>' +
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
