/* Listen & Choose – He / She sentences */
(function () {
  const GAME_ID = "starter-1b-listen-choose-he-she";

  // One item at a time: audio + two choices; correct is "a" or "b"
  const ITEMS = [
    {
      audio: "audio/1.mp3",
      a: "Is he from Vietnam?",
      b: "Is she from Vietnam?",
      correct: "b",
    },
    {
      audio: "audio/2.mp3",
      a: "He's from Turkey.",
      b: "She's from Turkey.",
      correct: "a",
    },
    {
      audio: "audio/3.mp3",
      a: "Where's he from?",
      b: "Where's she from?",
      correct: "a",
    },
    {
      audio: "audio/4.mp3",
      a: "He's nice.",
      b: "She's nice.",
      correct: "b",
    },
    {
      audio: "audio/5.mp3",
      a: "Where is he?",
      b: "Where is she?",
      correct: "a",
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

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".lc-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    const item = ITEMS[order[index]];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lc-play");
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

  function pick(choice) {
    if (locked || phase !== "play") return;
    const item = ITEMS[order[index]];
    const ok = choice === item.correct;
    locked = true;
    stopAudio();

    app.querySelectorAll(".lc-option").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.choice === item.correct) btn.classList.add("is-correct");
      if (btn.dataset.choice === choice && !ok) btn.classList.add("is-wrong");
    });

    if (ok) correctCount += 1;

    setTimeout(() => {
      if (index < order.length - 1) {
        index += 1;
        locked = false;
        render();
        setTimeout(playAudio, 350);
      } else {
        phase = "done";
        render();
      }
    }, ok ? 700 : 900);
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
        <header class="lc-topbar">
          <a class="lc-back" href="../" aria-label="Back">←</a>
          <span class="lc-title">Listen & Choose</span>
          <span class="lc-badge">1B</span>
        </header>
        <section class="lc-start">
          <div class="lc-hero" aria-hidden="true">🎧</div>
          <h1>Listen & Choose</h1>
          <p class="lc-desc">Listen and check (✓) the sentence you hear.</p>
          <button type="button" class="lc-btn" id="lc-start">Start →</button>
        </section>`;
      document.getElementById("lc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = calcStars();
      saveProgress(stars);
      app.innerHTML = `
        <header class="lc-topbar">
          <a class="lc-back" href="../" aria-label="Back">←</a>
          <span class="lc-title">Listen & Choose</span>
          <span class="lc-badge">Done</span>
        </header>
        <section class="lc-done">
          <div class="lc-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="lc-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="lc-btn" id="lc-again">Play again</button>
          <button type="button" class="lc-btn secondary" id="lc-menu">Back to menu</button>
        </section>`;
      document.getElementById("lc-again").onclick = startGame;
      document.getElementById("lc-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const item = ITEMS[order[index]];
    const progress = (index + 1) + " / " + ITEMS.length;

    app.innerHTML = `
      <header class="lc-topbar">
        <button type="button" class="lc-back" id="lc-back" aria-label="Back">←</button>
        <span class="lc-title">Listen & Choose</span>
        <span class="lc-progress">${progress}</span>
      </header>
      <section class="lc-prompt">
        <p class="lc-label">Listen carefully</p>
        <h2>Which sentence do you hear?</h2>
        <button type="button" class="lc-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <p class="lc-hint">Tap a sentence after you listen.</p>
      </section>
      <div class="lc-options">
        <button type="button" class="lc-option" data-choice="a">
          <span class="lc-opt-letter">a</span>
          <span class="lc-opt-text">${item.a}</span>
        </button>
        <button type="button" class="lc-option" data-choice="b">
          <span class="lc-opt-letter">b</span>
          <span class="lc-opt-text">${item.b}</span>
        </button>
      </div>`;

    document.getElementById("lc-back").onclick = () => {
      stopAudio();
      phase = "menu";
      render();
    };
    app.querySelector(".lc-play").onclick = playAudio;
    app.querySelectorAll(".lc-option").forEach((btn) => {
      btn.onclick = () => pick(btn.dataset.choice);
    });
  }

  render();
})();
