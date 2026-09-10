/* Match the Songs to Countries – AEF Starter Unit 1B World music */
(function () {
  const GAME_ID = "starter-1b-match-songs-countries";

  const TRACKS = [
    { id: "mexico", label: "Mexico", file: "audio/mexico.mp3", flag: "🇲🇽" },
    { id: "brazil", label: "Brazil", file: "audio/brazil.mp3", flag: "🇧🇷" },
    { id: "turkey", label: "Turkey", file: "audio/turkey.mp3", flag: "🇹🇷" },
    { id: "china", label: "China", file: "audio/china.mp3", flag: "🇨🇳" },
    { id: "usa", label: "the USA", file: "audio/usa.mp3", flag: "🇺🇸" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let songOrder = []; // shuffled track ids for left column
  let countryOrder = []; // shuffled track ids for right column
  let matches = {}; // songIndex -> countryId
  let lockedSongs = {}; // songIndex -> true when correctly matched
  let selectedSong = null; // index in songOrder
  let currentAudio = null;
  let playingIndex = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function byId(id) {
    return TRACKS.find((t) => t.id === id);
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    playingIndex = null;
    app.querySelectorAll(".ms-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playTrack(index) {
    const id = songOrder[index];
    const track = byId(id);
    if (!track) return;

    // Toggle off if same button
    if (playingIndex === index && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }

    stopAudio();
    const a = new Audio(track.file);
    currentAudio = a;
    playingIndex = index;
    const btn = app.querySelector('.ms-play[data-i="' + index + '"]');
    if (btn) btn.classList.add("playing");

    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      playingIndex = null;
    });
    a.addEventListener("ended", () => {
      if (btn) btn.classList.remove("playing");
      if (playingIndex === index) playingIndex = null;
      currentAudio = null;
    });
    a.addEventListener("error", () => {
      if (btn) btn.classList.remove("playing");
      playingIndex = null;
      currentAudio = null;
    });
  }

  function correctCount() {
    return Object.keys(lockedSongs).length;
  }

  function allMatched() {
    return correctCount() === TRACKS.length;
  }

  function calcStars(n) {
    if (n >= 5) return 3;
    if (n >= 4) return 2;
    if (n >= 3) return 1;
    return 0;
  }

  function startGame() {
    songOrder = shuffle(TRACKS.map((t) => t.id));
    countryOrder = shuffle(TRACKS.map((t) => t.id));
    matches = {};
    lockedSongs = {};
    selectedSong = null;
    stopAudio();
    mode = "play";
    render();
  }

  function selectSong(i) {
    if (lockedSongs[i]) return;
    selectedSong = i;
    app.querySelectorAll(".ms-song").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    playTrack(i);
  }

  function selectCountry(countryId) {
    if (selectedSong === null) {
      // flash hint
      const hint = document.getElementById("ms-hint");
      if (hint) {
        hint.textContent = "Play a song first, then tap a country.";
        hint.classList.add("ms-hint-warn");
        setTimeout(() => hint.classList.remove("ms-hint-warn"), 1200);
      }
      return;
    }
    if (Object.values(lockedSongs).some((v) => v) &&
        Object.keys(matches).some((k) => matches[k] === countryId && lockedSongs[k])) {
      return; // already used correctly
    }
    // country already locked to another song
    const used = Object.keys(lockedSongs).some((si) => matches[si] === countryId);
    if (used) return;

    const songId = songOrder[selectedSong];
    const ok = songId === countryId;
    matches[selectedSong] = countryId;

    const songEl = app.querySelector('.ms-song[data-i="' + selectedSong + '"]');
    const countryEl = app.querySelector('.ms-country[data-id="' + countryId + '"]');

    if (ok) {
      lockedSongs[selectedSong] = true;
      if (songEl) songEl.classList.add("is-correct");
      if (countryEl) countryEl.classList.add("is-correct", "is-used");
      selectedSong = null;
      app.querySelectorAll(".ms-song").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (allMatched()) {
        setTimeout(showResult, 700);
      }
    } else {
      if (songEl) songEl.classList.add("is-wrong");
      if (countryEl) countryEl.classList.add("is-wrong");
      setTimeout(() => {
        if (songEl) songEl.classList.remove("is-wrong");
        if (countryEl) countryEl.classList.remove("is-wrong");
      }, 500);
    }
  }

  function updateProgress() {
    const el = document.getElementById("ms-progress");
    if (el) el.textContent = correctCount() + " / " + TRACKS.length;
  }

  function showResult() {
    mode = "result";
    stopAudio();
    const n = correctCount();
    const stars = calcStars(n);
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    render();
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="ms-topbar">
          <a class="ms-back" href="../" aria-label="Back">←</a>
          <span class="ms-title">Match the Songs</span>
          <span class="ms-badge">1B</span>
        </header>
        <section class="ms-start">
          <div class="ms-hero" aria-hidden="true">🎵</div>
          <h1>Match the songs</h1>
          <p class="ms-desc">Listen to each song and match it<br>to the correct <strong>country</strong>.</p>
          <ul class="ms-tips">
            <li>Tap ▶ to play a song</li>
            <li>Then tap the country on the right</li>
          </ul>
          <button type="button" class="ms-btn" id="ms-go">Start</button>
        </section>`;
      document.getElementById("ms-go").onclick = startGame;
      return;
    }

    if (mode === "result") {
      const n = correctCount();
      const stars = calcStars(n);
      app.innerHTML = `
        <header class="ms-topbar">
          <a class="ms-back" href="../" aria-label="Back">←</a>
          <span class="ms-title">Match the Songs</span>
          <span class="ms-badge">Done</span>
        </header>
        <section class="ms-done">
          <div class="ms-trophy" aria-hidden="true">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="ms-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Nice work!" : "Keep practicing!"}</h1>
          <p>You matched <strong>${n} / ${TRACKS.length}</strong> songs.</p>
          <div class="ms-answer-key">
            ${TRACKS.map((t) => `<span class="ms-chip">${t.flag} ${t.label}</span>`).join("")}
          </div>
          <button type="button" class="ms-btn" id="ms-again">Play again</button>
          <a class="ms-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("ms-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    // play
    const left = songOrder
      .map((id, i) => {
        const locked = !!lockedSongs[i];
        return `
          <div class="ms-song${locked ? " is-correct" : ""}${selectedSong === i ? " is-selected" : ""}" data-i="${i}">
            <button type="button" class="ms-play" data-i="${i}" aria-label="Play song ${i + 1}" ${locked ? "disabled" : ""}>
              <span class="wave"></span>
              <span class="wave"></span>
              <span class="wave"></span>
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
          </div>`;
      })
      .join("");

    const right = countryOrder
      .map((id) => {
        const t = byId(id);
        const used = Object.keys(lockedSongs).some((si) => matches[si] === id);
        return `
          <button type="button" class="ms-country${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
            <span class="ms-flag" aria-hidden="true">${t.flag}</span>
            <span class="ms-country-name">${t.label}</span>
          </button>`;
      })
      .join("");

    app.innerHTML = `
      <header class="ms-topbar">
        <a class="ms-back" href="../" aria-label="Back">←</a>
        <span class="ms-title">Match the Songs</span>
        <span class="ms-progress" id="ms-progress">${correctCount()} / ${TRACKS.length}</span>
      </header>
      <p class="ms-instruction" id="ms-hint">Play a song, then choose the country.</p>
      <div class="ms-board">
        <div class="ms-col ms-col-songs" aria-label="Songs">
          ${left}
        </div>
        <div class="ms-col ms-col-countries" aria-label="Countries">
          ${right}
        </div>
      </div>
      <div class="ms-actions">
        <button type="button" class="ms-btn secondary" id="ms-reset">Reset</button>
        <button type="button" class="ms-btn" id="ms-check" ${allMatched() ? "" : "disabled"}>Check</button>
      </div>`;

    app.querySelectorAll(".ms-play").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        if (lockedSongs[i]) return;
        selectSong(i);
      };
    });
    app.querySelectorAll(".ms-song").forEach((row) => {
      row.onclick = () => {
        const i = +row.dataset.i;
        if (lockedSongs[i]) return;
        selectSong(i);
      };
    });
    app.querySelectorAll(".ms-country").forEach((btn) => {
      btn.onclick = () => selectCountry(btn.dataset.id);
    });
    document.getElementById("ms-reset").onclick = startGame;
    document.getElementById("ms-check").onclick = () => {
      if (allMatched()) showResult();
    };
  }

  render();
})();
