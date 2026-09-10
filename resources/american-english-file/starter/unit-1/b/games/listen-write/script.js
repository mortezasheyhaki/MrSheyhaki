/* Listen & Write – Unit 1B · AEF Starter */
(function () {
  const GAME_ID = "starter-1b-listen-write";

  const COUNTRIES = [
    { id: "argentina", label: "Argentina", flag: "🇦🇷", audio: "audio/argentina.mp3", image: "images/argentina.png",
      answers: ["argentina"] },
    { id: "brazil", label: "Brazil", flag: "🇧🇷", audio: "audio/brazil.mp3", image: "images/brazil.png",
      answers: ["brazil"] },
    { id: "canada", label: "Canada", flag: "🇨🇦", audio: "audio/canada.mp3", image: "images/canada.png",
      answers: ["canada"] },
    { id: "chile", label: "Chile", flag: "🇨🇱", audio: "audio/chile.mp3", image: "images/chile.png",
      answers: ["chile"] },
    { id: "china", label: "China", flag: "🇨🇳", audio: "audio/china.mp3", image: "images/china.png",
      answers: ["china"] },
    { id: "england", label: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", audio: "audio/england.mp3", image: "images/england.png",
      answers: ["england"] },
    { id: "japan", label: "Japan", flag: "🇯🇵", audio: "audio/japan.mp3", image: "images/japan.png",
      answers: ["japan"] },
    { id: "korea", label: "Korea", flag: "🇰🇷", audio: "audio/korea.mp3", image: "images/korea.png",
      answers: ["korea", "south korea"] },
    { id: "mexico", label: "Mexico", flag: "🇲🇽", audio: "audio/mexico.mp3", image: "images/mexico.png",
      answers: ["mexico"] },
    { id: "peru", label: "Peru", flag: "🇵🇪", audio: "audio/peru.mp3", image: "images/peru.png",
      answers: ["peru"] },
    { id: "saudi-arabia", label: "Saudi Arabia", flag: "🇸🇦", audio: "audio/saudi-arabia.mp3", image: "images/saudi-arabia.png",
      answers: ["saudi arabia", "saudi"] },
    { id: "spain", label: "Spain", flag: "🇪🇸", audio: "audio/spain.mp3", image: "images/spain.png",
      answers: ["spain"] },
    { id: "turkey", label: "Turkey", flag: "🇹🇷", audio: "audio/turkey.mp3", image: "images/turkey.png",
      answers: ["turkey"] },
    { id: "vietnam", label: "Vietnam", flag: "🇻🇳", audio: "audio/vietnam.mp3", image: "images/vietnam.png",
      answers: ["vietnam"] },
    { id: "usa", label: "the United States", flag: "🇺🇸", audio: "audio/usa.mp3", image: "images/usa.png",
      answers: ["the united states", "united states", "usa", "us", "america", "the us", "the usa"] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | feedback | done
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^the\s+/, "");
  }

  function isCorrect(userInput, country) {
    const n = normalize(userInput);
    if (!n) return false;
    // also accept version with "the " restored for matching
    return country.answers.some((a) => {
      const na = normalize(a);
      return na === n || na === "the " + n || ("the " + na) === n;
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    const c = order[index];
    if (!c) return;
    stopAudio();
    const a = new Audio(c.audio);
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
    order = shuffle(COUNTRIES);
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
    setTimeout(playAudio, 350);
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return; // require something typed
    lastUserInput = val;
    lastSkipped = false;
    const c = order[index];
    lastCorrect = isCorrect(lastUserInput, c);
    if (lastCorrect) correctCount += 1;
    answered = true;
    phase = "feedback";
    stopAudio();
    render();
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    stopAudio();
    render();
  }

  function nextItem() {
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playAudio, 300);
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    if (n >= 14) return 3;
    if (n >= 10) return 2;
    if (n >= 6) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Listen & Write</span>
          <span class="lw-badge">1B</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">🎧</div>
          <h1>Listen & Write</h1>
          <p class="lw-desc">Listen to the country name and type it.<br>15 countries</p>
          <button type="button" class="lw-btn" id="lw-start">Start →</button>
        </section>`;
      document.getElementById("lw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
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
          <p>You wrote <strong>${correctCount} / 15</strong> countries correctly.</p>
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

    const c = order[index];
    const progress = (index + 1) + " / 15";

    if (phase === "play") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Listen & Write</span>
          <span class="lw-progress">${progress}</span>
        </header>
        <section class="lw-play-area">
          <p class="lw-instruction">Listen, then type the country name</p>
          <button type="button" class="lw-play" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <div class="lw-input-wrap">
            <input type="text" id="lw-input" class="lw-input" placeholder="Type the country…" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false">
          </div>
          <div class="lw-actions">
            <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
            <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
          </div>
        </section>`;
      const input = document.getElementById("lw-input");
      const checkBtn = document.getElementById("lw-check");
      input.focus();
      document.querySelector(".lw-play").onclick = playAudio;
      checkBtn.onclick = checkAnswer;
      document.getElementById("lw-skip").onclick = skipAnswer;
      const syncCheck = () => {
        checkBtn.disabled = !input.value.trim();
      };
      input.addEventListener("input", syncCheck);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkAnswer();
      });
      return;
    }

    // feedback
    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">Listen & Write</span>
        <span class="lw-progress">${progress}</span>
      </header>
      <section class="lw-feedback ${lastCorrect ? "is-correct" : lastSkipped ? "is-skip" : "is-wrong"}">
        <div class="lw-result-icon">${lastCorrect ? "✅" : lastSkipped ? "⏭️" : "❌"}</div>
        <h2>${lastCorrect ? "Correct!" : lastSkipped ? "Skipped" : "Not quite"}</h2>
        <div class="lw-answer-card">
          <img class="lw-flag-img" src="${c.image}" alt="${c.label}">
          <div class="lw-answer-text">
            <span class="lw-flag">${c.flag}</span>
            <strong>${c.label}</strong>
          </div>
        </div>
        ${!lastCorrect && !lastSkipped ? `<p class="lw-your">You wrote: <em>${(lastUserInput || "—").trim() || "—"}</em></p>` : ""}
        <button type="button" class="lw-btn" id="lw-next">${index < order.length - 1 ? "Next →" : "See results →"}</button>
      </section>`;
    document.getElementById("lw-next").onclick = nextItem;
  }

  render();
})();
