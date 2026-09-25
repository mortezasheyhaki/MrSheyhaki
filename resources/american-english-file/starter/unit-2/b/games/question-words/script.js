/* Question Words – tap to complete · audio feedback · Unit 2B */
(function () {

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-2b-question-words";
  const BANK = ["How", "What", "Where", "Who"];

  const ITEMS = [
    {
      id: 1,
      blankAfter: " are you from?",
      correct: "Where",
      answer: "I'm from China.",
      audio: "audio/where-from.mp3",
    },
    {
      id: 2,
      blankAfter: " are you?",
      correct: "How",
      answer: "Fine, thanks.",
      audio: "audio/how-are-you.mp3",
    },
    {
      id: 3,
      blankAfter: "'s he?",
      correct: "Who",
      answer: "He's a friend.",
      audio: "audio/whos-he.mp3",
    },
    {
      id: 4,
      blankAfter: "'s your name?",
      correct: "What",
      answer: "Molly.",
      audio: "audio/whats-name.mp3",
    },
    {
      id: 5,
      blankAfter: "'s Alberta?",
      correct: "Where",
      answer: "It's in Canada.",
      audio: "audio/wheres-alberta.mp3",
    },
    {
      id: 6,
      blankAfter: " old are you?",
      correct: "How",
      answer: "26.",
      audio: "audio/how-old.mp3",
    },
    {
      id: 7,
      blankAfter: "'s your cell phone number?",
      correct: "What",
      answer: "617-555-6879.",
      audio: "audio/phone-number.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let index = 0;
  let locked = false;
  let totalCorrect = 0;
  let currentAudio = null;
  let chosen = null;

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(src, onEnd) {
    stopAudio();
    if (!src) {
      if (onEnd) onEnd();
      return;
    }
    const a = new Audio(src);
    currentAudio = a;
    a.play().catch(() => {
      if (onEnd) onEnd();
    });
    a.onended = () => {
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function calcStars() {
    const r = totalCorrect / ITEMS.length;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function start() {
    stopAudio();
    index = 0;
    locked = false;
    totalCorrect = 0;
    chosen = null;
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function goNext() {
    locked = false;
    chosen = null;
    if (index < ITEMS.length - 1) {
      index++;
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function pickWord(word) {
    if (locked || phase !== "play") return;
    const item = ITEMS[index];
    chosen = word;
    locked = true;

    const slot = app.querySelector(".qw-gap");
    const card = app.querySelector(".qw-card");
    const chips = app.querySelectorAll(".qw-chip");

    chips.forEach((c) => {
      c.classList.toggle("is-picked", c.dataset.word === word);
      c.disabled = true;
    });

    if (slot) {
      slot.textContent = word;
      slot.classList.remove("is-empty", "is-ok", "is-bad");
    }

    if (word === item.correct) {
      totalCorrect++;
      if (slot) slot.classList.add("is-ok");
      if (card) card.classList.add("is-success");
      // reveal answer with animation
      const ans = app.querySelector(".qw-answer");
      if (ans) {
        ans.classList.add("is-show");
      }
      const status = app.querySelector(".qw-status");
      if (status) {
        status.classList.add("is-ok", "is-playing");
        status.innerHTML =
          '<span class="qw-wave" aria-label="Playing">' +
          "<i></i><i></i><i></i><i></i><i></i>" +
          "</span>";
      }
      playAudio(item.audio, () => {
        if (status) {
          status.classList.remove("is-playing");
          status.textContent = "Great!";
        }
        setTimeout(goNext, 450);
      });
    } else {
      if (slot) slot.classList.add("is-bad");
      if (card) card.classList.add("is-shake");
      const status = app.querySelector(".qw-status");
      if (status) {
        status.textContent = "Try again";
        status.classList.add("is-bad");
      }
      setTimeout(() => {
        locked = false;
        chosen = null;
        if (slot) {
          slot.textContent = "····";
          slot.classList.remove("is-bad");
          slot.classList.add("is-empty");
        }
        if (card) card.classList.remove("is-shake");
        chips.forEach((c) => {
          c.disabled = false;
          c.classList.remove("is-picked");
        });
        if (status) {
          status.textContent = "Tap a question word";
          status.classList.remove("is-bad");
        }
      }, 700);
    }
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="qw-topbar">' +
        '<a class="qw-back" href="../" aria-label="Back">←</a>' +
        '<span class="qw-title">Question Words</span>' +
        '<span class="qw-badge">2B</span>' +
        "</header>" +
        '<section class="qw-start">' +
        '<div class="qw-hero" aria-hidden="true">❓</div>' +
        "<h1>Question Words</h1>" +
        '<p class="qw-desc">Tap <strong>How · What · Where · Who</strong> to complete each question. Then listen!</p>' +
        '<button type="button" class="qw-btn" id="qw-start">Start →</button>' +
        "</section>";
      document.getElementById("qw-start").onclick = start;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: ITEMS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    const item = ITEMS[index];
    app.innerHTML =
      '<header class="qw-topbar">' +
      '<a class="qw-back" href="../" aria-label="Back">←</a>' +
      '<span class="qw-title">Question Words</span>' +
      '<span class="qw-progress">' +
      (index + 1) +
      " / " +
      ITEMS.length +
      "</span>" +
      "</header>" +
      '<div class="qw-play">' +
      '<div class="qw-stage">' +
      '<div class="qw-card" id="qw-card">' +
      '<div class="qw-card-label">A · Complete the question</div>' +
      '<p class="qw-question">' +
      '<span class="qw-gap is-empty" aria-live="polite">····</span>' +
      '<span class="qw-rest">' +
      item.blankAfter +
      "</span>" +
      "</p>" +
      '<div class="qw-answer" aria-live="polite">' +
      '<span class="qw-b-tag">B</span>' +
      '<span class="qw-b-text">' +
      item.answer +
      "</span>" +
      "</div>" +
      "</div>" +
      '<p class="qw-status">Tap a question word</p>' +
      "</div>" +
      '<div class="qw-dock" role="group" aria-label="Question words">' +
      BANK.map(
        (w) =>
          '<button type="button" class="qw-chip" data-word="' +
          w +
          '">' +
          w +
          "</button>"
      ).join("") +
      "</div>" +
      "</div>";

    app.querySelectorAll(".qw-chip").forEach((chip) => {
      chip.onclick = () => pickWord(chip.dataset.word);
    });
  }

  render();
})();
