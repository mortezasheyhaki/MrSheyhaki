/* Listen & Find Countries – Unit 1B · AEF Starter */
(function () {
  const GAME_ID = "starter-1b-listen-find-countries";

  const COUNTRIES = [
    { id: "argentina", label: "Argentina", flag: "🇦🇷", audio: "audio/argentina.mp3", image: "images/argentina.png" },
    { id: "brazil", label: "Brazil", flag: "🇧🇷", audio: "audio/brazil.mp3", image: "images/brazil.png" },
    { id: "canada", label: "Canada", flag: "🇨🇦", audio: "audio/canada.mp3", image: "images/canada.png" },
    { id: "chile", label: "Chile", flag: "🇨🇱", audio: "audio/chile.mp3", image: "images/chile.png" },
    { id: "china", label: "China", flag: "🇨🇳", audio: "audio/china.mp3", image: "images/china.png" },
    { id: "england", label: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", audio: "audio/england.mp3", image: "images/england.png" },
    { id: "japan", label: "Japan", flag: "🇯🇵", audio: "audio/japan.mp3", image: "images/japan.png" },
    { id: "korea", label: "Korea", flag: "🇰🇷", audio: "audio/korea.mp3", image: "images/korea.png" },
    { id: "mexico", label: "Mexico", flag: "🇲🇽", audio: "audio/mexico.mp3", image: "images/mexico.png" },
    { id: "peru", label: "Peru", flag: "🇵🇪", audio: "audio/peru.mp3", image: "images/peru.png" },
    { id: "saudi-arabia", label: "Saudi Arabia", flag: "🇸🇦", audio: "audio/saudi-arabia.mp3", image: "images/saudi-arabia.png" },
    { id: "spain", label: "Spain", flag: "🇪🇸", audio: "audio/spain.mp3", image: "images/spain.png" },
    { id: "turkey", label: "Turkey", flag: "🇹🇷", audio: "audio/turkey.mp3", image: "images/turkey.png" },
    { id: "vietnam", label: "Vietnam", flag: "🇻🇳", audio: "audio/vietnam.mp3", image: "images/vietnam.png" },
    { id: "usa", label: "the United States", flag: "🇺🇸", audio: "audio/usa.mp3", image: "images/usa.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let order = [];           // quiz order (country ids)
  let gridOrder = [];       // picture grid order (stable per round of play)
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let locked = false;       // prevent double-taps while animating
  let found = {};           // id -> true once correctly found (optional dim)

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function byId(id) {
    return COUNTRIES.find((c) => c.id === id);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lf-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    const c = byId(order[index]);
    if (!c) return;
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    const btn = app.querySelector(".lf-play");
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
    order = shuffle(COUNTRIES.map((c) => c.id));
    gridOrder = shuffle(COUNTRIES.map((c) => c.id));
    index = 0;
    correctCount = 0;
    locked = false;
    found = {};
    phase = "play";
    render();
    setTimeout(playAudio, 400);
  }

  function pick(id) {
    if (locked || phase !== "play") return;
    const target = order[index];
    const card = app.querySelector('.lf-card[data-id="' + id + '"]');
    if (!card || card.classList.contains("is-found")) return;

    if (id === target) {
      locked = true;
      correctCount += 1;
      found[id] = true;
      card.classList.add("is-correct");
      stopAudio();
      // brief celebration then next
      setTimeout(() => {
        card.classList.add("is-found");
        card.classList.remove("is-correct");
        if (index < order.length - 1) {
          index += 1;
          locked = false;
          // reshuffle grid each round for challenge
          gridOrder = shuffle(COUNTRIES.map((c) => c.id));
          render();
          setTimeout(playAudio, 350);
        } else {
          phase = "done";
          render();
        }
      }, 700);
    } else {
      card.classList.add("is-wrong");
      setTimeout(() => card.classList.remove("is-wrong"), 450);
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
        <header class="lf-topbar">
          <a class="lf-back" href="../" aria-label="Back">←</a>
          <span class="lf-title">Listen & Find</span>
          <span class="lf-badge">1B</span>
        </header>
        <section class="lf-start">
          <div class="lf-hero" aria-hidden="true">🔊</div>
          <h1>Listen & Find</h1>
          <p class="lf-desc">Listen to the country name,<br>then tap the matching picture.</p>
          <button type="button" class="lf-btn" id="lf-start">Start →</button>
        </section>`;
      document.getElementById("lf-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="lf-topbar">
          <a class="lf-back" href="../" aria-label="Back">←</a>
          <span class="lf-title">Listen & Find</span>
          <span class="lf-badge">Done</span>
        </header>
        <section class="lf-done">
          <div class="lf-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="lf-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You found <strong>${correctCount} / 15</strong> countries.</p>
          <button type="button" class="lf-btn" id="lf-again">Play again</button>
          <button type="button" class="lf-btn secondary" id="lf-menu">Back to menu</button>
        </section>`;
      document.getElementById("lf-again").onclick = startGame;
      document.getElementById("lf-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    // play
    const progress = (index + 1) + " / 15";
    const cards = gridOrder.map((id) => {
      const c = byId(id);
      const isFound = !!found[id];
      return `
        <button type="button" class="lf-card${isFound ? " is-found" : ""}" data-id="${id}" ${isFound ? "disabled" : ""}>
          <div class="lf-card-img">
            <img src="${c.image}" alt="${c.label}" draggable="false">
            <span class="lf-card-flag" aria-hidden="true">${c.flag}</span>
          </div>
        </button>`;
    }).join("");

    app.innerHTML = `
      <header class="lf-topbar">
        <a class="lf-back" href="../" aria-label="Back">←</a>
        <span class="lf-title">Listen & Find</span>
        <span class="lf-progress">${progress}</span>
      </header>
      <section class="lf-prompt">
        <p class="lf-label">LISTEN CAREFULLY</p>
        <h2>Which picture matches<br>the sound?</h2>
        <button type="button" class="lf-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <p class="lf-hint">Tap a picture after you listen.</p>
      </section>
      <div class="lf-grid">${cards}</div>`;

    document.querySelector(".lf-play").onclick = playAudio;
    app.querySelectorAll(".lf-card").forEach((btn) => {
      btn.onclick = () => pick(btn.dataset.id);
    });
  }

  render();
})();
