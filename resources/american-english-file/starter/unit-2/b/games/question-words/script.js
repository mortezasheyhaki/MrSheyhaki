/* Question Words – tap to complete · audio feedback · Unit 2B */
(function () {
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
    phase = "play";
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
      app.innerHTML =
        '<header class="qw-topbar">' +
        '<a class="qw-back" href="../" aria-label="Back">←</a>' +
        '<span class="qw-title">Question Words</span>' +
        '<span class="qw-badge">Done</span>' +
        "</header>" +
        '<section class="qw-done">' +
        '<div class="trophy-scene' +
        (stars === 3 ? " perfect" : "") +
        '" aria-hidden="true"><div class="orbit-system">' +
        '<div class="trophy-float">🏆</div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 1 ? " filled" : "") +
        '">★</span></div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 2 ? " filled" : "") +
        '">★</span></div>' +
        '<div class="star-orbit"><span class="star' +
        (stars >= 3 ? " filled" : "") +
        '">★</span></div>' +
        "</div></div>" +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") +
        "</h1>" +
        "<p>You got <strong>" +
        totalCorrect +
        " / " +
        ITEMS.length +
        "</strong> correct.</p>" +
        '<button type="button" class="qw-btn" id="qw-again">Play again</button>' +
        '<button type="button" class="qw-btn secondary" id="qw-menu">Home</button>' +
        "</section>";
      document.getElementById("qw-again").onclick = start;
      document.getElementById("qw-menu").onclick = () => {
        stopAudio();
        phase = "menu";
        render();
      };
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
