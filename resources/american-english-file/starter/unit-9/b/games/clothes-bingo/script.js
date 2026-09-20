/* Clothes Bingo – AEF Starter Unit 9B
   Layout from Practical English 1 Classroom Bingo */
(function () {
  const GAME_ID = "starter-9b-clothes-bingo";

  const ITEMS = [
    { id: "cap", word: "cap", label: "a cap",
      audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3",
      image: "https://cdn.imgurl.ir/uploads/b4742_cap.png" },
    { id: "coat", word: "coat", label: "a coat",
      audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3",
      image: "https://cdn.imgurl.ir/uploads/w043594_coat.png" },
    { id: "dress", word: "dress", label: "a dress",
      audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3",
      image: "https://cdn.imgurl.ir/uploads/d995053_dress.png" },
    { id: "hat", word: "hat", label: "a hat",
      audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3",
      image: "https://cdn.imgurl.ir/uploads/o3351_hat.png" },
    { id: "jacket", word: "jacket", label: "a jacket",
      audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3",
      image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png" },
    { id: "jeans", word: "jeans", label: "jeans",
      audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3",
      image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png" },
    { id: "pants", word: "pants", label: "pants",
      audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3",
      image: "https://cdn.imgurl.ir/uploads/i04627_pants.png" },
    { id: "shirt", word: "shirt", label: "a shirt",
      audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3",
      image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png" },
    { id: "shoes", word: "shoes", label: "shoes",
      audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3",
      image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png" },
    { id: "shorts", word: "shorts", label: "shorts",
      audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3",
      image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png" },
    { id: "skirt", word: "skirt", label: "a skirt",
      audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3",
      image: "https://cdn.imgurl.ir/uploads/a444189_st.png" },
    { id: "sneakers", word: "sneakers", label: "sneakers",
      audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3",
      image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png" },
    { id: "socks", word: "socks", label: "socks",
      audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3",
      image: "https://cdn.imgurl.ir/uploads/k600200_socks.png" },
    { id: "suit", word: "suit", label: "a suit",
      audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3",
      image: "https://cdn.imgurl.ir/uploads/e98017_suit.png" },
    { id: "sweater", word: "sweater", label: "a sweater",
      audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3",
      image: "https://cdn.imgurl.ir/uploads/x441494_swer.png" },
    { id: "t-shirt", word: "T-shirt", label: "a T-shirt",
      audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3",
      image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png" },
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
      const stars = 3; // always 3 — call order is not skill-based
      const markedCount = marked.filter(Boolean).length;
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
      render();
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
        '<span class="cb-kicker">STARTER · UNIT 9B</span>' +
        '<span class="cb-title">Clothes Bingo</span>' +
        "</div>" +
        '<span class="cb-badge">9</span>' +
        "</header>" +
        '<section class="cb-start">' +
        '<div class="cb-hero-wrap">' +
        '<img class="cb-hero-img" src="https://cdn.imgurl.ir/uploads/h08586_jacket.png" alt="a jacket" />' +
        '<span class="cb-hero-chip">Vocabulary</span>' +
        "</div>" +
        "<h1>Clothes Bingo</h1>" +
        '<p class="cb-desc">Listen to the word, tap the matching picture, and get three in a row.</p>' +
        '<ol class="cb-steps">' +
        '<li><span class="cb-step-num">1</span><span>Tap <strong>Listen</strong> to hear a clothes word.</span></li>' +
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
      '<span class="cb-kicker">STARTER · UNIT 9B</span>' +
      '<span class="cb-title">Clothes Bingo</span>' +
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
