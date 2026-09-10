/* Match Countries – 3 modes × 5 pairs – AEF Starter Unit 1B */
(function () {
  const GAME_ID = "starter-1b-match-countries";

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

  // 3 fixed sets of 5 (covers all 15 countries)
  const SETS = [
    ["argentina", "brazil", "canada", "chile", "china"],
    ["england", "japan", "korea", "mexico", "peru"],
    ["saudi-arabia", "spain", "turkey", "vietnam", "usa"],
  ];

  const MODES = [
    { id: "pic-word", title: "Pictures → Words", left: "picture", right: "word", tip: "Match each picture to the country name." },
    { id: "audio-word", title: "Audio → Words", left: "audio", right: "word", tip: "Listen, then match to the country name." },
    { id: "audio-pic", title: "Audio → Pictures", left: "audio", right: "picture", tip: "Listen, then match to the picture (flags help!)." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0; // 0..2 chosen by player
  let phase = "menu"; // menu | play | done
  let setIndex = 0; // 0..2 within current mode (3 sets of 5)
  let leftOrder = [];
  let rightOrder = [];
  let locked = {}; // leftIndex -> true
  let matches = {}; // leftIndex -> rightId
  let selectedLeft = null;
  let currentAudio = null;
  let playingLeft = null;
  let setCorrect = 0; // pairs correct in current set
  let modeCorrect = 0; // pairs correct across all 3 sets in mode

  function byId(id) {
    return COUNTRIES.find((c) => c.id === id);
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
    playingLeft = null;
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudioFor(leftIndex) {
    const id = leftOrder[leftIndex];
    const c = byId(id);
    if (!c) return;

    if (playingLeft === leftIndex && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    playingLeft = leftIndex;
    const btn = app.querySelector('.mc-play[data-i="' + leftIndex + '"]');
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      playingLeft = null;
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (playingLeft === leftIndex) playingLeft = null;
      currentAudio = null;
    };
  }

  function startMode(mi) {
    modeIndex = mi;
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    const ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    locked = {};
    matches = {};
    selectedLeft = null;
    setCorrect = 0;
    stopAudio();
    phase = "play";
    render();
  }

  
  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach((el) => {
      if (!el) return;
      el.classList.add("mc-match-pop");
      // sparkles
      for (let i = 0; i < 8; i++) {
        const s = document.createElement("span");
        s.className = "mc-spark";
        const angle = (i / 8) * Math.PI * 2;
        const dist = 28 + Math.random() * 18;
        s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        s.style.setProperty("--delay", (i * 0.02) + "s");
        el.appendChild(s);
        setTimeout(() => s.remove(), 700);
      }
      setTimeout(() => el.classList.remove("mc-match-pop"), 550);
    });
    // brief full-board flash ring
    const flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function playCountryAudio(countryId) {
    const c = byId(countryId);
    if (!c) return;
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === 5;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    const mode = MODES[modeIndex];
    if (mode.left === "audio") playAudioFor(i);
  }

  function selectRight(rightId) {
    if (selectedLeft === null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = MODES[modeIndex].left === "audio"
          ? "Play a sound first, then tap a match."
          : "Tap an item on the left first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(() => hint.classList.remove("mc-hint-warn"), 1200);
      }
      return;
    }
    const used = Object.keys(locked).some((li) => matches[li] === rightId);
    if (used) return;

    const leftId = leftOrder[selectedLeft];
    const ok = leftId === rightId;
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (ok) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      setCorrect += 1;
      modeCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      spawnMatchFX(leftEl, rightEl);
      // Picture → Words: play country audio on each successful match
      if (MODES[modeIndex].id === "pic-word") {
        playCountryAudio(leftId);
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (allMatched()) {
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 700);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 450);
    }
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) el.textContent = "Set " + (setIndex + 1) + "/3 · " + correctCount() + "/5";
  }

  function calcStars() {
    // modeCorrect is pairs across all 3 sets (max 15)
    const n = modeCorrect;
    if (n >= 14) return 3;
    if (n >= 10) return 2;
    if (n >= 5) return 1;
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

  function leftCell(id, i, kind) {
    const c = byId(id);
    const isLocked = !!locked[i];
    const sel = selectedLeft === i ? " is-selected" : "";
    const ok = isLocked ? " is-correct" : "";

    if (kind === "audio") {
      return `
        <div class="mc-left-item mc-audio-cell${ok}${sel}" data-i="${i}">
          <button type="button" class="mc-play" data-i="${i}" aria-label="Play ${c.label}" ${isLocked ? "disabled" : ""}>
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
        </div>`;
    }
    // picture
    return `
      <div class="mc-left-item mc-pic-cell${ok}${sel}" data-i="${i}">
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
        <span class="mc-pic-flag" aria-hidden="true">${c.flag}</span>
      </div>`;
  }

  function rightCell(id, kind) {
    const c = byId(id);
    const used = Object.keys(locked).some((li) => matches[li] === id);
    if (kind === "word") {
      return `
        <button type="button" class="mc-right-item mc-word${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
          <span class="mc-word-label">${c.label}</span>
        </button>`;
    }
    // picture on the right (with flag overlay)
    return `
      <button type="button" class="mc-right-item mc-pic-btn${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
        <span class="mc-pic-flag" aria-hidden="true">${c.flag}</span>
      </button>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Match Countries</span>
          <span class="mc-badge">1B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🌍</div>
          <h1>Match Countries</h1>
          <p class="mc-desc">Choose a mode · 15 countries (3 sets)</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="mc-mode-card mc-mode-btn" data-mode="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mode);
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const m = MODES[modeIndex];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Match Countries</span>
          <span class="mc-badge">Done</span>
        </header>
        <section class="mc-done">
          <div class="mc-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="mc-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${m.title}</strong><br>You matched <strong>${modeCorrect} / 15</strong> countries.</p>
          <button type="button" class="mc-btn" id="mc-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="mc-menu">All modes</button>
        </section>`;
      document.getElementById("mc-again").onclick = () => startMode(modeIndex);
      document.getElementById("mc-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id, mode.right)).join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title} · Set ${setIndex + 1}/3</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/3 · ${correctCount()}/5</span>
      </header>
      <p class="mc-instruction" id="mc-hint">${mode.tip}</p>
      <div class="mc-board">
        <div class="mc-col mc-col-left">${left}</div>
        <div class="mc-col mc-col-right">${right}</div>
      </div>
      <div class="mc-actions">
        <button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>
      </div>`;

    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.onclick = () => selectLeft(+el.dataset.i);
    });
    app.querySelectorAll(".mc-play").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        if (locked[i]) return;
        selectLeft(i);
        playAudioFor(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((btn) => {
      btn.onclick = () => selectRight(btn.dataset.id);
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
  }

  render();
})();
