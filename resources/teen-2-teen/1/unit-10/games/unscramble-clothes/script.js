/* Unscramble Clothes – Teen2Teen 1 Unit 10 */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u10-unscramble-clothes";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // word = letters to spell (no article). All 10 unit items.
  var ITEMS = [
    { id: "sweater", label: "a sweater", word: "sweater",
      image: CDN + "q049292_swer.png", audio: CDN + "d159367_a_swer.mp3" },
    { id: "skirt", label: "a skirt", word: "skirt",
      image: CDN + "a444189_st.png", audio: CDN + "b668114_st.mp3" },
    { id: "shorts", label: "shorts", word: "shorts",
      image: CDN + "p155179_shorts.png", audio: CDN + "b61351_shorts_2.mp3" },
    { id: "shoes", label: "shoes", word: "shoes",
      image: CDN + "i80933_shoes.png", audio: CDN + "y529847_shoes_3.mp3" },
    { id: "shirt", label: "a shirt", word: "shirt",
      image: CDN + "y409033_shirt.png", audio: CDN + "f1066_a_shirt.mp3" },
    { id: "pants", label: "pants", word: "pants",
      image: CDN + "b63746_pants.png", audio: CDN + "e126543_pants_2.mp3" },
    { id: "jeans", label: "jeans", word: "jeans",
      image: CDN + "s86734_jeans.png", audio: CDN + "p371082_jeans_3.mp3" },
    { id: "jacket", label: "a jacket", word: "jacket",
      image: CDN + "n731967_jacket.png", audio: CDN + "c58647_a_jacket.mp3" },
    { id: "dress", label: "a dress", word: "dress",
      image: CDN + "e35407_dress.png", audio: CDN + "m241908_a_dress.mp3" },
    { id: "blouse", label: "a blouse", word: "blouse",
      image: CDN + "d598847_blouse.png", audio: CDN + "m041818_a_blouse.mp3" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | feedback | done
  var order = [];
  var index = 0;
  var correctCount = 0;
  var currentAudio = null;
  var slots = [];
  var pool = [];
  var checked = false;
  var lastCorrect = false;
  var uidCounter = 0;
  var sfxCtx = null;
  var playingAudio = false;

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

  function tone(freq, dur, type, gain, delay) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.12), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) LASfx.correct();
        else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
        else if (name === "click" && LASfx.click) LASfx.click();
        else if (name === "pop" && LASfx.pop) LASfx.pop();
        else if (name === "win" && LASfx.win) LASfx.win();
      }
    } catch (_) {}
    try {
      if (name === "click" || name === "place") {
        tone(480, 0.04, "triangle", 0.08);
      } else if (name === "correct") {
        tone(523.25, 0.08, "triangle", 0.12);
        tone(659.25, 0.1, "triangle", 0.11, 0.06);
        tone(783.99, 0.12, "sine", 0.1, 0.12);
      } else if (name === "wrong") {
        tone(220, 0.1, "square", 0.07);
        tone(165, 0.14, "square", 0.05, 0.05);
      } else if (name === "win") {
        tone(523.25, 0.12, "triangle", 0.12);
        tone(659.25, 0.12, "triangle", 0.11, 0.08);
        tone(783.99, 0.14, "triangle", 0.12, 0.16);
        tone(1046.5, 0.22, "sine", 0.1, 0.26);
      }
    } catch (_) {}
  }

  function current() {
    return ITEMS[order[index]];
  }

  function letterList(word) {
    return word.split("").map(function (ch) {
      return ch === " " || ch === "-" ? ch : ch;
    });
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(
      ITEMS.map(function (_, i) {
        return i;
      })
    );
    index = 0;
    correctCount = 0;
    startRound();
  }

  function startRound() {
    var c = current();
    var letters = letterList(c.word);
    slots = letters.map(function (ch) {
      if (ch === " " || ch === "-") return { type: "space", ch: ch };
      return { type: "empty", ch: null, uid: null };
    });
    var scramble = letters.filter(function (ch) {
      return ch !== " " && ch !== "-";
    });
    var scrambled = shuffle(scramble);
    var tries = 0;
    while (
      scrambled.join("") === scramble.join("") &&
      scramble.length > 1 &&
      tries < 20
    ) {
      scrambled = shuffle(scramble);
      tries++;
    }
    pool = scrambled.map(function (ch) {
      return { ch: ch, uid: ++uidCounter, used: false };
    });
    checked = false;
    lastCorrect = false;
    phase = "play";
    render();
    setTimeout(function () {
      playAudio();
    }, 350);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    playingAudio = false;
    var btn = document.getElementById("uc-play");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    var c = current();
    if (!c || !c.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(c.audio);
      playingAudio = true;
      var btn = document.getElementById("uc-play");
      if (btn) btn.classList.add("is-playing");
      currentAudio.onended = function () {
        playingAudio = false;
        if (btn) btn.classList.remove("is-playing");
        currentAudio = null;
      };
      currentAudio.onerror = function () {
        playingAudio = false;
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.play().catch(function () {
        playingAudio = false;
        if (btn) btn.classList.remove("is-playing");
      });
    } catch (_) {
      playingAudio = false;
    }
  }

  function firstEmptySlot() {
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].type === "empty" && !slots[i].ch) return i;
    }
    return -1;
  }

  function placeLetter(uid) {
    if (checked) return;
    var tile = null;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].uid === uid && !pool[i].used) {
        tile = pool[i];
        break;
      }
    }
    if (!tile) return;
    var si = firstEmptySlot();
    if (si < 0) return;
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    sfx("place");
    renderPlayPartial();
    if (firstEmptySlot() < 0) {
      setTimeout(checkAnswer, 200);
    }
  }

  function removeFromSlot(si) {
    if (checked) return;
    var s = slots[si];
    if (!s || s.type !== "empty" || !s.ch) return;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].uid === s.uid) {
        pool[i].used = false;
        break;
      }
    }
    slots[si] = { type: "empty", ch: null, uid: null };
    sfx("click");
    renderPlayPartial();
  }

  function builtWord() {
    return slots
      .map(function (s) {
        if (s.type === "space") return s.ch || " ";
        return s.ch || "";
      })
      .join("");
  }

  function checkAnswer() {
    if (checked) return;
    var c = current();
    if (
      slots.some(function (s) {
        return s.type === "empty" && !s.ch;
      })
    ) {
      return;
    }
    checked = true;
    lastCorrect = builtWord().toLowerCase() === c.word.toLowerCase();
    if (lastCorrect) {
      correctCount++;
      sfx("correct");
    } else {
      sfx("wrong");
    }
    phase = "feedback";
    render();
  }

  function nextRound() {
    stopAudio();
    sfx("click");
    if (index < order.length - 1) {
      index++;
      startRound();
    } else {
      phase = "done";
      sfx("win");
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlots(interactive) {
    return slots
      .map(function (s, i) {
        if (s.type === "space") {
          return (
            '<span class="uc-space" aria-hidden="true">' +
            (s.ch === "-" ? "-" : "") +
            "</span>"
          );
        }
        if (s.ch) {
          var cls = checked
            ? lastCorrect
              ? "uc-slot filled ok"
              : "uc-slot filled bad"
            : "uc-slot filled";
          var click = interactive && !checked ? ' data-slot="' + i + '"' : "";
          return (
            '<button type="button" class="' +
            cls +
            '"' +
            click +
            ' aria-label="letter ' +
            escapeHtml(s.ch) +
            '">' +
            escapeHtml(s.ch) +
            "</button>"
          );
        }
        return '<span class="uc-slot empty" aria-hidden="true"></span>';
      })
      .join("");
  }

  function renderPool() {
    return pool
      .map(function (t) {
        if (t.used) {
          return (
            '<span class="uc-tile used" aria-hidden="true">' +
            escapeHtml(t.ch) +
            "</span>"
          );
        }
        return (
          '<button type="button" class="uc-tile" data-uid="' +
          t.uid +
          '">' +
          escapeHtml(t.ch) +
          "</button>"
        );
      })
      .join("");
  }

  function renderPlayPartial() {
    var slotsEl = document.getElementById("uc-slots");
    var poolEl = document.getElementById("uc-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(true);
      slotsEl.querySelectorAll("[data-slot]").forEach(function (btn) {
        btn.onclick = function () {
          removeFromSlot(+btn.dataset.slot);
        };
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool();
      poolEl.querySelectorAll("[data-uid]").forEach(function (btn) {
        btn.onclick = function () {
          placeLetter(+btn.dataset.uid);
        };
      });
    }
  }

  function bindPlay() {
    var play = document.getElementById("uc-play");
    if (play) {
      play.onclick = function () {
        sfx("click");
        playAudio();
      };
    }
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="uc-topbar">' +
        '<a class="uc-back" href="../" aria-label="Back">←</a>' +
        '<div class="uc-topbar-center">' +
        '<span class="uc-kicker">TEEN2TEEN 1 · UNIT 10</span>' +
        '<span class="uc-title">Unscramble Clothes</span>' +
        "</div>" +
        '<span class="uc-badge">' +
        ITEMS.length +
        "</span>" +
        "</header>" +
        '<section class="uc-start">' +
        '<div class="uc-hero">🔤</div>' +
        "<h1>Unscramble Clothes</h1>" +
        '<p class="uc-desc">Look at the picture, listen to the word, then put the letters in the right order.</p>' +
        '<button type="button" class="uc-btn" id="uc-start">Start</button>' +
        "</section>";
      document.getElementById("uc-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "done") {
      var total = ITEMS.length;
      var stars =
        correctCount === total
          ? 3
          : correctCount >= total - 2
            ? 2
            : correctCount >= Math.ceil(total / 2)
              ? 1
              : 0;
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      }
      if (window.LAStars) {
        try {
          LAStars.recordPlay(GAME_ID);
          LAStars.save(GAME_ID, stars);
        } catch (_) {}
      }
      app.innerHTML =
        '<section class="uc-start"><h1>Done!</h1><p>' +
        correctCount +
        "/" +
        total +
        '</p><button type="button" class="uc-btn" id="fb-again">Again</button></section>';
      document.getElementById("fb-again").onclick = startGame;
      return;
    }

    var c = current();
    var progress = index + 1 + "/" + order.length;

    if (phase === "feedback") {
      app.innerHTML =
        '<header class="uc-topbar">' +
        '<a class="uc-back" href="../" aria-label="Back">←</a>' +
        '<div class="uc-topbar-center">' +
        '<span class="uc-kicker">TEEN2TEEN 1 · UNIT 10</span>' +
        '<span class="uc-title">Unscramble Clothes</span>' +
        "</div>" +
        '<span class="uc-badge">' +
        progress +
        "</span>" +
        "</header>" +
        '<div class="uc-scroll">' +
        '<div class="uc-card uc-card-photo">' +
        '<img class="uc-photo" src="' +
        c.image +
        '" alt="' +
        escapeHtml(c.label) +
        '" draggable="false" onerror="this.style.display=\'none\'" />' +
        '<button type="button" class="uc-audio-btn mc-play" id="uc-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        "</div>" +
        '<div class="uc-card uc-card-word">' +
        '<p class="uc-feedback ' +
        (lastCorrect ? "ok" : "bad") +
        '">' +
        (lastCorrect ? "✓ Correct!" : "✗ Not quite") +
        "</p>" +
        '<div class="uc-slots locked">' +
        renderSlots(false) +
        "</div>" +
        (!lastCorrect
          ? '<p class="uc-answer-reveal">Answer: <strong>' +
            escapeHtml(c.word) +
            "</strong></p>"
          : "") +
        '<p class="uc-country-name">' +
        escapeHtml(c.label) +
        "</p>" +
        "</div>" +
        '<button type="button" class="uc-btn uc-btn-next" id="uc-next">' +
        (index < order.length - 1 ? "Next →" : "See results") +
        "</button>" +
        "</div>";
      document.getElementById("uc-next").onclick = nextRound;
      bindPlay();
      return;
    }

    // play
    app.innerHTML =
      '<header class="uc-topbar">' +
      '<a class="uc-back" href="../" aria-label="Back">←</a>' +
      '<div class="uc-topbar-center">' +
      '<span class="uc-kicker">TEEN2TEEN 1 · UNIT 10</span>' +
      '<span class="uc-title">Unscramble Clothes</span>' +
      "</div>" +
      '<span class="uc-badge">' +
      progress +
      "</span>" +
      "</header>" +
      '<p class="uc-instruction">Tap letters to spell the word · use <strong>Play</strong> to listen</p>' +
      '<div class="uc-scroll">' +
      '<div class="uc-card uc-card-photo">' +
      '<img class="uc-photo" src="' +
      c.image +
      '" alt="' +
      escapeHtml(c.label) +
      '" draggable="false" onerror="this.style.display=\'none\'" />' +
      '<button type="button" class="uc-audio-btn mc-play" id="uc-play" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
      "</div>" +
      '<div class="uc-card uc-card-word">' +
      '<div class="uc-slots" id="uc-slots">' +
      renderSlots(true) +
      "</div>" +
      "</div>" +
      '<div class="uc-card uc-card-pool">' +
      '<div class="uc-pool" id="uc-pool">' +
      renderPool() +
      "</div>" +
      '<button type="button" class="uc-btn-check" id="uc-check">Check</button>' +
      "</div>" +
      "</div>";

    bindPlay();
    document.getElementById("uc-check").onclick = function () {
      sfx("click");
      checkAnswer();
    };
    document.getElementById("uc-slots").querySelectorAll("[data-slot]").forEach(function (btn) {
      btn.onclick = function () {
        removeFromSlot(+btn.dataset.slot);
      };
    });
    document.getElementById("uc-pool").querySelectorAll("[data-uid]").forEach(function (btn) {
      btn.onclick = function () {
        placeLetter(+btn.dataset.uid);
      };
    });
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
