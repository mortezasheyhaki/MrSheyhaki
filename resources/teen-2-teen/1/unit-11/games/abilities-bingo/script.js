/* Abilities Bingo – Teen2Teen 1 Unit 11
   Layout from Unit 10 Clothes Bingo */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u11-abilities-bingo";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    { id: "sing", word: "sing", label: "sing",
      image: CDN + "s959561_1._sing.png", audio: CDN + "m219280_sing.mp3" },
    { id: "dance", word: "dance", label: "dance",
      image: CDN + "n921429_2._dance.png", audio: CDN + "a819457_dance.mp3" },
    { id: "play-guitar", word: "play the guitar", label: "play the guitar",
      image: CDN + "l759824_3._ay_the_guitar.png", audio: CDN + "o960192_ay_the_guitar_2.mp3" },
    { id: "play-piano", word: "play the piano", label: "play the piano",
      image: CDN + "v289933_4_ay_the_piano.png", audio: CDN + "h035164_ay_the_piano.mp3" },
    { id: "play-drums", word: "play the drums", label: "play the drums",
      image: CDN + "o494865_5_ay_the_drums.png", audio: CDN + "f2568_ay_the_drums.mp3" },
    { id: "draw", word: "draw", label: "draw",
      image: CDN + "p8522_6_draw.png", audio: CDN + "d962270_draw.mp3" },
    { id: "swim", word: "swim", label: "swim",
      image: CDN + "s136203_7_swim.png", audio: CDN + "y834171_swim.mp3" },
    { id: "cook", word: "cook", label: "cook",
      image: CDN + "w173769_8_cook.png", audio: CDN + "c62431_cook.mp3" },
    { id: "play-soccer", word: "play soccer", label: "play soccer",
      image: CDN + "x99401_9_ay_soccer.png", audio: CDN + "c58387_ay_soccer.mp3" },
    { id: "play-volleyball", word: "play volleyball", label: "play volleyball",
      image: CDN + "k465640_10_ay_volleybal.png", audio: CDN + "g03206_ay_volleyball.mp3" },
    { id: "ride-bike", word: "ride a bike", label: "ride a bike",
      image: CDN + "u396407_11_ride_a_bike.png", audio: CDN + "k342951_ride_a_bike.mp3" },
    { id: "ride-horse", word: "ride a horse", label: "ride a horse",
      image: CDN + "c680984_12_ride_a_horse.png", audio: CDN + "x46930_ride_a_horse.mp3" }
  ];

  var LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | bingo
  var card = [];
  var marked = [];
  var queue = [];
  var callIndex = 0;
  var current = null;
  var misses = 0;
  var hint = false;
  var shakeId = null;
  var currentAudio = null;
  var playing = false;

  var audioCtx = null;
  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {
        return null;
      }
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function tone(freq, duration, type, gain, delay) {
    var ctx = getCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function playSfx(name) {
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) LASfx.correct();
        else if (name === "wrong" && LASfx.wrong) LASfx.wrong();
        else if (name === "bingo" && LASfx.win) LASfx.win();
        else if (name === "select" && LASfx.click) LASfx.click();
      }
    } catch (_) {}
    try {
      if (name === "select") {
        tone(420, 0.04, "triangle", 0.08);
      } else if (name === "correct") {
        tone(480, 0.07, "triangle", 0.14);
        tone(720, 0.11, "sine", 0.12, 0.035);
        tone(960, 0.14, "sine", 0.07, 0.07);
      } else if (name === "wrong") {
        tone(220, 0.1, "square", 0.08);
        tone(165, 0.16, "square", 0.06, 0.05);
      } else if (name === "bingo") {
        tone(523.25, 0.14, "triangle", 0.14);
        tone(659.25, 0.14, "triangle", 0.13, 0.09);
        tone(783.99, 0.16, "triangle", 0.14, 0.18);
        tone(1046.5, 0.28, "sine", 0.12, 0.28);
        tone(1318.5, 0.18, "sine", 0.07, 0.38);
        tone(1568, 0.22, "sine", 0.05, 0.48);
      } else if (name === "listen") {
        tone(640, 0.05, "sine", 0.07);
        tone(880, 0.06, "sine", 0.04, 0.03);
      }
    } catch (_) {}
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

  function dealCard() {
    return shuffle(ITEMS).slice(0, 9);
  }

  function winningLines() {
    return LINES.filter(function (line) {
      return line.every(function (i) {
        return marked[i];
      });
    });
  }

  function hasBingo() {
    return winningLines().length > 0;
  }

  function isBlackout() {
    return marked.length === 9 && marked.every(Boolean);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    playing = false;
  }

  function playClip(item) {
    if (!item || !item.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      playing = true;
      currentAudio.onended = function () {
        playing = false;
        var btn = document.getElementById("cb-listen");
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.onerror = function () {
        playing = false;
      };
      currentAudio.play().catch(function () {
        playing = false;
      });
      var btn = document.getElementById("cb-listen");
      if (btn) btn.classList.add("is-playing");
    } catch (_) {
      playing = false;
    }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    stopAudio();
    card = dealCard();
    marked = Array(9).fill(false);
    queue = shuffle(card);
    callIndex = 0;
    current = null;
    misses = 0;
    hint = false;
    shakeId = null;
    phase = "play";
    render();
  }

  function callNext() {
    if (phase !== "play" || hasBingo()) return;
    var next = queue[callIndex];
    if (!next) return;
    current = next;
    misses = 0;
    hint = false;
    playClip(next);
    render();
  }

  function onCell(index) {
    if (phase !== "play") return;
    if (!current) return;
    if (marked[index]) return;
    var cell = card[index];

    playSfx("select");

    if (!cell || cell.id !== current.id) {
      playSfx("wrong");
      shakeId = cell ? cell.id : null;
      misses += 1;
      if (misses >= 2) hint = true;
      render();
      setTimeout(function () {
        shakeId = null;
        var el = document.querySelector('.cb-cell[data-i="' + index + '"]');
        if (el) el.classList.remove("shake");
      }, 420);
      return;
    }
    marked[index] = true;
    misses = 0;
    hint = false;
    current = null;
    callIndex += 1;
    if (hasBingo()) {
      phase = "bingo";
      stopAudio();
      playSfx("bingo");
      var stars = 3;
      var markedCount = marked.filter(Boolean).length;
      if (window.LAStars) {
        try {
          LAStars.recordPlay(GAME_ID);
          LAStars.save(GAME_ID, stars);
        } catch (_) {}
      }
      render();
      if (window.LAFinish) {
        setTimeout(function () {
          var timeMs = LAFinish.stopTimer();
          LAFinish.show({
            gameId: GAME_ID,
            score: markedCount,
            total: 9,
            stars: stars,
            timeMs: timeMs,
            onAgain: startGame,
            onModes: function () {
              phase = "start";
              render();
            },
            backHref: "../",
            save: false
          });
        }, 600);
      }
      return;
    } else {
      playSfx("correct");
    }
    render();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="cb-topbar">' +
        '<a class="cb-back" href="../" aria-label="Back">←</a>' +
        '<div class="cb-topbar-center">' +
        '<span class="cb-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
        '<span class="cb-title">Abilities Bingo</span>' +
        "</div>" +
        '<span class="cb-badge">10</span>' +
        "</header>" +
        '<section class="cb-start">' +
        '<div class="cb-hero-wrap">' +
        '<img class="cb-hero-img" src="' +
        CDN +
        'n731967_jacket.png" alt="a jacket" />' +
        '<span class="cb-hero-chip">Vocabulary</span>' +
        "</div>" +
        "<h1>Abilities Bingo</h1>" +
        '<p class="cb-desc">Listen to the word, tap the matching picture, and get three in a row.</p>' +
        '<ol class="cb-steps">' +
        '<li><span class="cb-step-num">1</span><span>Tap <strong>Listen</strong> to hear an ability.</span></li>' +
        '<li><span class="cb-step-num">2</span><span>Find it on your card and tap the picture.</span></li>' +
        '<li><span class="cb-step-num">3</span><span>Three in a row wins Bingo!</span></li>' +
        "</ol>" +
        '<button type="button" class="cb-btn cb-btn-full" id="cb-start">Play</button>' +
        "</section>";
      document.getElementById("cb-start").onclick = startGame;
      return;
    }

    var winSet = {};
    winningLines().forEach(function (line) {
      line.forEach(function (i) {
        winSet[i] = true;
      });
    });

    var cells = card
      .map(function (item, i) {
        var isMarked = marked[i];
        var isWin = isMarked && winSet[i];
        var classes = ["cb-cell"];
        if (isMarked) classes.push("marked");
        if (isWin) classes.push("win-line");
        if (shakeId === item.id) classes.push("shake");
        return (
          '<button type="button" class="' +
          classes.join(" ") +
          '" data-i="' +
          i +
          '" aria-label="' +
          escapeHtml(item.label) +
          '" aria-pressed="' +
          (isMarked ? "true" : "false") +
          '">' +
          '<img src="' +
          item.image +
          '" alt="" draggable="false" />' +
          '<span class="cb-cell-word">' +
          escapeHtml(item.word) +
          "</span>" +
          (isMarked ? '<span class="cb-stamp"><span>✓</span></span>' : "") +
          "</button>"
        );
      })
      .join("");

    var callNum = Math.min(callIndex + (current ? 1 : 0) + (current ? 0 : 1), 9);
    var statusHtml = "";
    if (phase === "bingo") {
      statusHtml = "";
    } else if (hint && current) {
      statusHtml = '<p class="cb-status hint">' + escapeHtml(current.label) + "</p>";
    } else {
      statusHtml =
        '<p class="cb-status">' +
        (current ? "Find it on your card" : "Tap Listen") +
        "</p>";
    }

    var panelInner = "";
    if (phase === "bingo") {
      var blackout = isBlackout();
      panelInner =
        '<div class="cb-bingo-msg" role="status">' +
        '<div class="cb-confetti-burst" aria-hidden="true">' +
        '<span class="cb-particle" style="--i:0"></span>' +
        '<span class="cb-particle" style="--i:1"></span>' +
        '<span class="cb-particle" style="--i:2"></span>' +
        '<span class="cb-particle" style="--i:3"></span>' +
        '<span class="cb-particle" style="--i:4"></span>' +
        '<span class="cb-particle" style="--i:5"></span>' +
        '<span class="cb-particle" style="--i:6"></span>' +
        '<span class="cb-particle" style="--i:7"></span>' +
        '<span class="cb-particle" style="--i:8"></span>' +
        '<span class="cb-particle" style="--i:9"></span>' +
        '<span class="cb-particle" style="--i:10"></span>' +
        '<span class="cb-particle" style="--i:11"></span>' +
        "</div>" +
        '<div class="cb-bingo-icons" aria-hidden="true">' +
        '<span class="cb-ico-pop">🎉</span>' +
        '<span class="cb-ico-pop">✨</span>' +
        '<span class="cb-ico-pop">🏆</span>' +
        "</div>" +
        '<p class="big">Bingo!</p>' +
        '<p class="cb-bingo-sub">' +
        (blackout ? "Full card — amazing!" : "Three in a row. Well done!") +
        "</p>" +
        '<button type="button" class="cb-btn cb-btn-full cb-btn-again" id="cb-again">Play again</button>' +
        "</div>";
    } else {
      panelInner =
        '<div class="cb-panel-row">' +
        '<p class="cb-call-num">Call ' +
        callNum +
        " / 9</p>" +
        statusHtml +
        "</div>" +
        '<button type="button" class="cb-btn cb-btn-full cb-btn-listen' +
        (playing ? " is-playing" : "") +
        '" id="cb-listen">' +
        '<span class="cb-ico">🔊</span>' +
        "<span>" +
        (current ? "Replay" : "Listen") +
        "</span></button>";
    }

    app.innerHTML =
      '<header class="cb-topbar">' +
      '<a class="cb-back" href="../" aria-label="Back">←</a>' +
      '<div class="cb-topbar-center">' +
      '<span class="cb-kicker">TEEN2TEEN 1 · UNIT 11</span>' +
      '<span class="cb-title">Abilities Bingo</span>' +
      "</div>" +
      '<button type="button" class="cb-btn-ghost" id="cb-new">New card</button>' +
      "</header>" +
      '<div class="cb-scroll">' +
      '<div class="cb-board-wrap' +
      (phase === "bingo" ? " is-bingo" : "") +
      '">' +
      '<div class="cb-grid' +
      (phase === "bingo" ? " is-bingo" : "") +
      '">' +
      cells +
      "</div></div>" +
      '<div class="cb-panel' +
      (phase === "bingo" ? " is-bingo" : "") +
      '">' +
      panelInner +
      "</div>" +
      "</div>";

    document.getElementById("cb-new").onclick = startGame;
    var again = document.getElementById("cb-again");
    if (again) again.onclick = startGame;
    var listen = document.getElementById("cb-listen");
    if (listen) {
      listen.onclick = function () {
        playSfx("listen");
        if (current) playClip(current);
        else callNext();
      };
    }
    app.querySelectorAll(".cb-cell").forEach(function (btn) {
      btn.onclick = function () {
        onCell(+btn.dataset.i);
      };
    });
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
