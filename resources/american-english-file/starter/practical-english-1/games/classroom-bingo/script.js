/* Classroom Bingo – AEF Starter Practical English 1 */
(function () {
  const GAME_ID = "starter-pe1-classroom-bingo";

  const ITEMS = [
    { id: "bag", word: "bag", label: "a bag",
      audio: "https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3",
      image: "https://cdn.imgurl.ir/uploads/q131373_a-bag.png" },
    { id: "pen", word: "pen", label: "a pen",
      audio: "https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3",
      image: "https://cdn.imgurl.ir/uploads/t81465_a-pen.png" },
    { id: "paper", word: "paper", label: "a piece of paper",
      audio: "https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3",
      image: "https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png" },
    { id: "dictionary", word: "dictionary", label: "a dictionary",
      audio: "https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3",
      image: "https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png" },
    { id: "laptop", word: "laptop", label: "a laptop",
      audio: "https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3",
      image: "https://cdn.imgurl.ir/uploads/w410273_a-laptop.png" },
    { id: "table", word: "table", label: "a table",
      audio: "https://cdn.imgurl.ir/uploads/d742794_a-table.mp3",
      image: "https://cdn.imgurl.ir/uploads/a696837_a-table.png" },
    { id: "chair", word: "chair", label: "a chair",
      audio: "https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3",
      image: "https://cdn.imgurl.ir/uploads/t901556_a-chair.png" },
    { id: "window", word: "window", label: "a window",
      audio: "https://cdn.imgurl.ir/uploads/l543208_a-window.mp3",
      image: "https://cdn.imgurl.ir/uploads/c480039_a-window.png" },
    { id: "door", word: "door", label: "the door",
      audio: "https://cdn.imgurl.ir/uploads/g92275_the-door.mp3",
      image: "https://cdn.imgurl.ir/uploads/o763819_the-door.png" },
    { id: "board", word: "board", label: "the board",
      audio: "https://cdn.imgurl.ir/uploads/i034259_the-board.mp3",
      image: "https://cdn.imgurl.ir/uploads/v58413_the-board.png" },
  ];

  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "start"; // start | play | bingo
  let card = [];
  let marked = [];
  let queue = [];
  let callIndex = 0;
  let current = null;
  let misses = 0;
  let hint = false;
  let shakeId = null;
  let currentAudio = null;
  let playing = false;

  /* —— Lightweight SFX via Web Audio API —— */
  let audioCtx = null;
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
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
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
      if (name === "select") {
        // Quick soft tap when choosing a cell
        tone(420, 0.04, "triangle", 0.08);
      } else if (name === "correct") {
        // Satisfying stamp / pop when correct picture is chosen
        tone(480, 0.07, "triangle", 0.14);
        tone(720, 0.11, "sine", 0.12, 0.035);
        tone(960, 0.14, "sine", 0.07, 0.07);
      } else if (name === "wrong") {
        // Clear but soft error when wrong picture is chosen
        tone(220, 0.1, "square", 0.08);
        tone(165, 0.16, "square", 0.06, 0.05);
      } else if (name === "bingo") {
        // Celebratory arpeggio + sparkle
        tone(523.25, 0.14, "triangle", 0.14);       // C5
        tone(659.25, 0.14, "triangle", 0.13, 0.09);  // E5
        tone(783.99, 0.16, "triangle", 0.14, 0.18);  // G5
        tone(1046.5, 0.28, "sine", 0.12, 0.28);      // C6
        // Extra sparkle
        tone(1318.5, 0.18, "sine", 0.07, 0.38);
        tone(1568, 0.22, "sine", 0.05, 0.48);
      } else if (name === "listen") {
        // Soft UI click on Listen / Replay
        tone(640, 0.05, "sine", 0.07);
        tone(880, 0.06, "sine", 0.04, 0.03);
      }
    } catch (_) {}
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function dealCard() {
    return shuffle(ITEMS).slice(0, 9);
  }

  function winningLines() {
    return LINES.filter((line) => line.every((i) => marked[i]));
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
        const btn = document.getElementById("cb-listen");
        if (btn) btn.classList.remove("is-playing");
      };
      currentAudio.onerror = function () {
        playing = false;
      };
      currentAudio.play().catch(function () {
        playing = false;
      });
      const btn = document.getElementById("cb-listen");
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
    const next = queue[callIndex];
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
    const cell = card[index];

    // Always play a soft select sound when choosing a picture while listening
    playSfx("select");

    if (!cell || cell.id !== current.id) {
      playSfx("wrong");
      shakeId = cell ? cell.id : null;
      misses += 1;
      if (misses >= 2) hint = true;
      render();
      setTimeout(function () {
        shakeId = null;
        const el = document.querySelector('.cb-cell[data-i="' + index + '"]');
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
      const stars = isBlackout() ? 3 : 2;
      const markedCount = marked.filter(Boolean).length;
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
      render();
      // Shared finish overlay
      if (window.LAFinish) {
        setTimeout(function () {
          const timeMs = LAFinish.stopTimer();
          LAFinish.show({
            gameId: GAME_ID,
            score: markedCount,
            total: 9,
            stars: stars,
            timeMs: timeMs,
            onAgain: startGame,
            onModes: function () { phase = "start"; render(); },
            backHref: "../",
            save: false,
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
        '<span class="cb-kicker">STARTER · PRACTICAL ENGLISH 1</span>' +
        '<span class="cb-title">Classroom Bingo</span>' +
        "</div>" +
        '<span class="cb-badge">9</span>' +
        "</header>" +
        '<section class="cb-start">' +
        '<div class="cb-hero-wrap">' +
        '<img class="cb-hero-img" src="https://cdn.imgurl.ir/uploads/w410273_a-laptop.png" alt="a laptop" />' +
        '<span class="cb-hero-chip">Vocabulary</span>' +
        "</div>" +
        "<h1>Classroom Bingo</h1>" +
        '<p class="cb-desc">Listen to the word, tap the matching picture, and get three in a row.</p>' +
        '<ol class="cb-steps">' +
        '<li><span class="cb-step-num">1</span><span>Tap <strong>Listen</strong> to hear a classroom object.</span></li>' +
        "<li><span class=\"cb-step-num\">2</span><span>Find it on your card and tap the picture.</span></li>" +
        '<li><span class="cb-step-num">3</span><span>Three in a row wins Bingo!</span></li>' +
        "</ol>" +
        '<button type="button" class="cb-btn cb-btn-full" id="cb-start">Play</button>' +
        "</section>";
      document.getElementById("cb-start").onclick = startGame;
      return;
    }

    const winSet = {};
    winningLines().forEach(function (line) {
      line.forEach(function (i) {
        winSet[i] = true;
      });
    });

    const cells = card
      .map(function (item, i) {
        const isMarked = marked[i];
        const isWin = isMarked && winSet[i];
        const classes = ["cb-cell"];
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

    const callNum = Math.min(callIndex + (current ? 1 : 0) + (current ? 0 : 1), 9);
    let statusHtml = "";
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

    let panelInner = "";
    if (phase === "bingo") {
      const blackout = isBlackout();
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
      '<span class="cb-kicker">STARTER · PRACTICAL ENGLISH 1</span>' +
      '<span class="cb-title">Classroom Bingo</span>' +
      "</div>" +
      '<button type="button" class="cb-btn-ghost" id="cb-new">New card</button>' +
      "</header>" +
      '<div class="cb-scroll">' +
      '<div class="cb-board-wrap' + (phase === "bingo" ? " is-bingo" : "") + '">' +
      '<div class="cb-grid' + (phase === "bingo" ? " is-bingo" : "") + '">' +
      cells +
      "</div></div>" +
      '<div class="cb-panel' + (phase === "bingo" ? " is-bingo" : "") + '">' +
      panelInner +
      "</div>" +
      "</div>";

    document.getElementById("cb-new").onclick = startGame;
    const again = document.getElementById("cb-again");
    if (again) again.onclick = startGame;
    const listen = document.getElementById("cb-listen");
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

  render();
})();
