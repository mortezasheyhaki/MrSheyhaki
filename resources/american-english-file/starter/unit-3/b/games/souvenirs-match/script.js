/* Souvenirs Match – picture/audio ↔ word · AEF Starter Unit 3B */
(function () {
  const GAME_ID = "starter-3b-souvenirs-match";

  const ITEMS = [
    { id: "cap",        label: "a cap",        short: "cap",        audio: "../../media/audio/cap.mp3",        image: "../../media/images/cap.png" },
    { id: "t-shirt",    label: "a T-shirt",    short: "T-shirt",    audio: "../../media/audio/t-shirt.mp3",    image: "../../media/images/t-shirt.png" },
    { id: "toy",        label: "a toy",        short: "toy",        audio: "../../media/audio/toy.mp3",        image: "../../media/images/toy.png" },
    { id: "sunglasses", label: "sunglasses",   short: "sunglasses", audio: "../../media/audio/sunglasses.mp3", image: "../../media/images/sunglasses.png" },
    { id: "mug",        label: "a mug",        short: "mug",        audio: "../../media/audio/mug.mp3",        image: "../../media/images/mug.png" },
    { id: "keychain",   label: "a keychain",   short: "keychain",   audio: "../../media/audio/keychain.mp3",   image: "../../media/images/keychain.png" },
    { id: "postcard",   label: "a postcard",   short: "postcard",   audio: "../../media/audio/postcard.mp3",   image: "../../media/images/postcard.png" },
    { id: "map",        label: "a map",        short: "map",        audio: "../../media/audio/map.mp3",        image: "../../media/images/map.png" },
  ];

  // Two sets of 4 (user requested two sets of 4×4-style grids)
  const SETS = [
    ["cap", "t-shirt", "toy", "sunglasses"],
    ["mug", "keychain", "postcard", "map"],
  ];

  const MODES = [
    { id: "pic-word",   title: "Pictures → Words",  left: "picture", tip: "Match each picture to the correct word." },
    { id: "audio-word", title: "Audio → Words",     left: "audio",   tip: "Listen, then match the correct word." },
    { id: "audio-pic",  title: "Audio → Pictures",  left: "audio", tip: "Listen, then match the correct picture.", rightIsPicture: true },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu";
  let setIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let locked = {};
  let matches = {};
  let selectedLeft = null;
  let currentAudio = null;
  let playingLeft = null;
  let setCorrect = 0;
  let modeCorrect = 0;

  function byId(id) {
    return ITEMS.find((c) => c.id === id);
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

  function playSrc(src, btn) {
    if (!src) return;
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function playAudioFor(leftIndex) {
    const id = leftOrder[leftIndex];
    const c = byId(id);
    if (!c) return;
    if (playingLeft === leftIndex && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    playingLeft = leftIndex;
    const btn = app.querySelector('.mc-play[data-i="' + leftIndex + '"]');
    playSrc(c.audio, btn);
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
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
    const flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    const mode = MODES[modeIndex];
    app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
    selectedLeft = i;
    const el = app.querySelector('.mc-left-item[data-i="' + i + '"]');
    if (el) el.classList.add("is-selected");
    if (mode.left === "audio") playAudioFor(i);
  }

  function selectRight(rightId) {
    const mode = MODES[modeIndex];
    if (selectedLeft == null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = mode.left === "audio"
          ? "Tap a speaker on the left first."
          : "Tap a picture on the left first.";
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
      // Play audio after a correct match in Pictures → Words mode only
      if (MODES[modeIndex].id === "pic-word") {
        const c = byId(leftId);
        if (c && c.audio) playSrc(c.audio, null);
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (correctCount() === SETS[setIndex].length) {
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
    if (el) el.textContent = `Set ${setIndex + 1}/${SETS.length} · ${correctCount()}/${SETS[setIndex].length}`;
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
        <img src="${c.image}" alt="${c.label}" draggable="false" />
      </div>`;
  }

  function rightCell(id, opts) {
    const c = byId(id);
    const used = Object.keys(locked).some((li) => matches[li] === id);
    if (opts && opts.rightIsPicture) {
      return `
        <button type="button" class="mc-right-item mc-pic-right${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
          <img src="${c.image}" alt="${c.label}" draggable="false" />
        </button>`;
    }
    if (opts && opts.rightIsAudio) {
      return `
        <button type="button" class="mc-right-item mc-audio-cell${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""} aria-label="Play audio">
          <span class="mc-play-inline">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </span>
        </button>`;
    }
    return `
      <button type="button" class="mc-right-item mc-word${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
        <span class="mc-word-label">${c.label}</span>
      </button>`;
  }

  function calcStars() {
    const total = ITEMS.length;
    if (modeCorrect >= total) return 3;
    if (modeCorrect >= Math.ceil(total * 0.7)) return 2;
    if (modeCorrect >= Math.ceil(total * 0.4)) return 1;
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
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Souvenirs Match</span>
          <span class="mc-badge">3B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🎁</div>
          <h1>Souvenirs Match</h1>
          <p class="mc-desc">Match the souvenirs · 8 items (2 sets of 4)</p>
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
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: modeCorrect,
          total: SETS.reduce((n,s)=>n+s.length,0),
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      const m = MODES[modeIndex];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Souvenirs Match</span>
          <span class="mc-badge">3B</span>
        </header>
        <section class="mc-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div>
            </div>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${m.title}</strong><br>You matched <strong>${modeCorrect} / ${ITEMS.length}</strong> souvenirs.</p>
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
    const right = rightOrder.map((id) => rightCell(id, mode)).join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title} · Set ${setIndex + 1}/${SETS.length}</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/${SETS.length} · ${correctCount()}/${SETS[setIndex].length}</span>
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
        if (MODES[modeIndex].left === "audio") playAudioFor(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((btn) => {
      btn.onclick = () => {
        if (mode.rightIsAudio) {
          const c = byId(btn.dataset.id);
          if (c) {
            const playEl = btn.querySelector(".mc-play-inline");
            playSrc(c.audio, playEl);
          }
        }
        selectRight(btn.dataset.id);
      };
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
  }

  render();
})();
