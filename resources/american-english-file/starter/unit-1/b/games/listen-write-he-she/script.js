/* Listen & Write – six he/she sentences (one at a time) */
(function () {
  const GAME_ID = "starter-1b-listen-write-he-she";

  // accepted answers: primary first (shown on success), then variants
  const ITEMS = [
    {
      audio: "audio/1.mp3",
      answers: [
        "He's from Vietnam.",
        "He's from Vietnam",
        "He is from Vietnam.",
        "He is from Vietnam",
        "Hes from Vietnam.",
        "Hes from Vietnam",
      ],
    },
    {
      audio: "audio/2.mp3",
      answers: [
        "She's from Peru.",
        "She's from Peru",
        "She is from Peru.",
        "She is from Peru",
        "Shes from Peru.",
        "Shes from Peru",
      ],
    },
    {
      audio: "audio/3.mp3",
      answers: [
        "She isn't from Japan.",
        "She isn't from Japan",
        "She is not from Japan.",
        "She is not from Japan",
        "She's not from Japan.",
        "She's not from Japan",
        "She isnt from Japan.",
        "She isnt from Japan",
      ],
    },
    {
      audio: "audio/4.mp3",
      answers: [
        "Is he from Turkey?",
        "Is he from Turkey",
        "Is he from Turkey.",
      ],
    },
    {
      audio: "audio/5.mp3",
      answers: [
        "He isn't from England.",
        "He isn't from England",
        "He is not from England.",
        "He is not from England",
        "He's not from England.",
        "He's not from England",
        "He isnt from England.",
        "He isnt from England",
      ],
    },
    {
      audio: "audio/6.mp3",
      answers: [
        "Is she from Brazil?",
        "Is she from Brazil",
        "Is she from Brazil.",
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let locked = false;
  let currentAudio = null;

  function saveProgress(stars) {
    function doSave() {
      if (!window.LAStars) return false;
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
        return true;
      } catch (e) {
        return false;
      }
    }
    if (doSave()) return;
    var existing = document.querySelector("script[data-la-stars], script[src*='la-stars']");
    if (!existing) {
      var s = document.createElement("script");
      s.src = "/learningarcade/la-stars.js";
      s.setAttribute("data-la-stars", "");
      s.onload = function () { doSave(); };
      document.head.appendChild(s);
    } else {
      setTimeout(doSave, 300);
      setTimeout(doSave, 1000);
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return (s || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.?!,]+$/g, "")
      .toLowerCase();
  }

  function isMatch(input, answers) {
    const n = normalize(input);
    return answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    const item = ITEMS[order[index]];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startGame() {
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correctCount = 0;
    locked = false;
    phase = "play";
    render();
    setTimeout(playAudio, 400);
  }

  function submitAnswer() {
    if (locked || phase !== "play") return;
    const input = document.getElementById("lw-input");
    if (!input) return;
    const value = input.value;
    if (!normalize(value)) {
      input.classList.add("lw-input-empty");
      setTimeout(() => input.classList.remove("lw-input-empty"), 400);
      return;
    }

    const item = ITEMS[order[index]];
    const ok = isMatch(value, item.answers);
    locked = true;
    stopAudio();

    const feedback = document.getElementById("lw-feedback");
    if (ok) {
      correctCount += 1;
      if (feedback) {
        feedback.textContent = "✓ " + item.answers[0];
        feedback.className = "lw-feedback ok";
      }
      input.classList.add("lw-input-ok");
      input.value = item.answers[0];
    } else {
      if (feedback) {
        feedback.textContent = "Try again";
        feedback.className = "lw-feedback bad";
      }
      input.classList.add("lw-input-bad");
    }

    setTimeout(() => {
      if (ok) {
        if (index < order.length - 1) {
          index += 1;
          locked = false;
          render();
          setTimeout(playAudio, 350);
        } else {
          phase = "done";
          render();
        }
      } else {
        locked = false;
        input.classList.remove("lw-input-bad");
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "lw-feedback";
        }
        input.select();
        input.focus();
      }
    }, ok ? 900 : 700);
  }

  function calcStars() {
    const n = correctCount;
    const total = ITEMS.length;
    if (n >= total) return 3;
    if (n >= Math.ceil(total * 0.7)) return 2;
    if (n >= Math.ceil(total * 0.4)) return 1;
    return 0;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Listen & Write</span>
          <span class="lw-badge">1B</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">✍️</div>
          <h1>Listen & Write</h1>
          <p class="lw-desc">Listen and write six sentences or questions.</p>
          <button type="button" class="lw-btn" id="lw-start">Start →</button>
        </section>`;
      document.getElementById("lw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = calcStars();
      saveProgress(stars);
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Listen & Write</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="lw-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="lw-btn" id="lw-again">Play again</button>
          <button type="button" class="lw-btn secondary" id="lw-menu">Back to menu</button>
        </section>`;
      document.getElementById("lw-again").onclick = startGame;
      document.getElementById("lw-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const progress = (index + 1) + " / " + ITEMS.length;

    app.innerHTML = `
      <header class="lw-topbar">
        <button type="button" class="lw-back" id="lw-back" aria-label="Back">←</button>
        <span class="lw-title">Listen & Write</span>
        <span class="lw-progress">${progress}</span>
      </header>
      <section class="lw-prompt">
        <p class="lw-label">Listen carefully</p>
        <h2>Write the sentence or question</h2>
        <button type="button" class="lw-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <p class="lw-hint">Tap play to hear again.</p>
      </section>
      <div class="lw-type-area">
        <input type="text" id="lw-input" class="lw-input" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="Type what you hear…" />
        <button type="button" class="lw-btn lw-check" id="lw-check">Check</button>
        <p class="lw-feedback" id="lw-feedback"></p>
      </div>`;

    document.getElementById("lw-back").onclick = () => {
      stopAudio();
      phase = "menu";
      render();
    };
    app.querySelector(".lw-play").onclick = playAudio;
    const input = document.getElementById("lw-input");
    document.getElementById("lw-check").onclick = submitAnswer;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  render();
})();
