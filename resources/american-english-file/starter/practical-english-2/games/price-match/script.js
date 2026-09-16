/* Price Match – 3 modes × 2 sets · AEF Starter Practical English 2 */
(function () {
  const GAME_ID = "starter-pe2-price-match";

  const ITEMS = [
    {
      id: "12-75",
      number: "£12.75",
      words: "twelve pounds seventy-five",
      audio: "https://cdn.imgurl.ir/uploads/t69337_twelve_pounds_seventy_five.mp3",
    },
    {
      id: "15-99",
      number: "€15.99",
      words: "fifteen euros ninety-nine",
      audio: "https://cdn.imgurl.ir/uploads/p764596_fif_euros_ninety_nine.mp3",
    },
    {
      id: "50-19",
      number: "$50.19",
      words: "fifty dollars and nineteen cents",
      audio: "https://cdn.imgurl.ir/uploads/n610859_fifty_dollars_and_nine_cents.mp3",
    },
    {
      id: "5-35",
      number: "£5.35",
      words: "five pounds thirty-five",
      audio: "https://cdn.imgurl.ir/uploads/m605651_five_pounds_thirty_five.mp3",
    },
    {
      id: "13-25",
      number: "$13.25",
      words: "thirteen dollars and twenty-five cents",
      audio: "https://cdn.imgurl.ir/uploads/y938132_thir_dollars_and_twenty_five_cents.mp3",
    },
    {
      id: "3-20",
      number: "€3.20",
      words: "three euros twenty",
      audio: "https://cdn.imgurl.ir/uploads/f57189_three_euros_twenty.mp3",
    },
    {
      id: "0-25",
      number: "€0.25",
      words: "twenty-five cents",
      audio: "https://cdn.imgurl.ir/uploads/p621825_twenty_five_cents.mp3",
    },
    {
      id: "1-50",
      number: "£1.50",
      words: "one pound fifty",
      audio: "https://cdn.imgurl.ir/uploads/o127802_one_pound_fifty.mp3",
    },
    {
      id: "60p",
      number: "60p",
      words: "sixty pence",
      audio: "https://cdn.imgurl.ir/uploads/j80217_sixty_pence.mp3",
    },
    {
      id: "0-80",
      number: "$0.80",
      words: "eighty cents",
      audio: "https://cdn.imgurl.ir/uploads/w8717_eighty_cents.mp3",
    },
  ];

  const SETS = [
    ["12-75", "15-99", "50-19", "5-35", "13-25"],
    ["3-20", "0-25", "1-50", "60p", "0-80"],
  ];

  const MODES = [
    { id: "numbers-words", title: "Numbers → Words", left: "number", tip: "Match each price to how we say it." },
    { id: "audio-numbers", title: "Audio → Numbers", left: "audio", tip: "Listen, then match the correct price." },
    { id: "audio-words", title: "Audio → Words", left: "audio-words", tip: "Listen, then match how we write it in words." },
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

  function playAudioFor(leftIndex) {
    const id = leftOrder[leftIndex];
    const c = byId(id);
    if (!c || !c.audio) return;

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

  function allMatched() {
    return correctCount() >= leftOrder.length;
  }

  function selectLeft(i) {
    if (locked[leftOrder[i]]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
  }

  function selectRight(id) {
    if (locked[id] || selectedLeft === null) return;
    const leftId = leftOrder[selectedLeft];
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + id + '"]');

    if (leftId === id) {
      locked[id] = true;
      matches[leftId] = id;
      setCorrect++;
      modeCorrect++;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct");
      spawnMatchFX(leftEl, rightEl);
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();

      // Play audio after match only in Numbers → Words mode
      const mode = MODES[modeIndex];
      if (mode.left === "number") {
        const item = byId(id);
        if (item && item.audio) {
          stopAudio();
          const a = new Audio(item.audio);
          currentAudio = a;
          a.play().catch(() => {});
          a.onended = () => { if (currentAudio === a) currentAudio = null; };
        }
      }

      if (allMatched()) {
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 900);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 650);
    }
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) el.textContent = "Set " + (setIndex + 1) + "/2 · " + correctCount() + "/5";
  }

  function calcStars() {
    const n = modeCorrect;
    if (n >= 9) return 3;
    if (n >= 6) return 2;
    if (n >= 3) return 1;
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

  function leftCell(id, i, leftType) {
    const c = byId(id);
    const isLocked = !!locked[id];
    const sel = selectedLeft === i ? " is-selected" : "";
    const ok = isLocked ? " is-correct" : "";

    if (leftType === "audio" || leftType === "audio-words") {
      return `
        <div class="mc-left-item mc-audio-cell${ok}${sel}" data-i="${i}" data-id="${id}">
          <button type="button" class="mc-play" data-i="${i}" aria-label="Play" ${isLocked ? "disabled" : ""}>
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
        </div>`;
    }

    // number text
    return `
      <div class="mc-left-item mc-word-left${ok}${sel}" data-i="${i}" data-id="${id}">
        <span class="mc-word-label">${c.number}</span>
      </div>`;
  }

  function rightCell(id) {
    const c = byId(id);
    const mode = MODES[modeIndex];
    const isLocked = !!locked[id];
    const text = mode.left === "audio" ? c.number : c.words;

    return `
      <button type="button" class="mc-right-item mc-word${isLocked ? " is-correct is-used" : ""}" data-id="${id}" ${isLocked ? "disabled" : ""}>
        <span class="mc-word-label">${text}</span>
      </button>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Price Match</span>
          <span class="mc-badge">PE2</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">💰</div>
          <h1>Price Match</h1>
          <p class="mc-desc">Match prices with numbers, words, and audio</p>
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
          <span class="mc-title">Price Match</span>
          <span class="mc-badge">Done</span>
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
          <p><strong>${m.title}</strong><br>You matched <strong>${modeCorrect} / 10</strong> prices.</p>
          <button type="button" class="mc-btn" id="mc-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="mc-menu">All modes</button>
        </section>`;
      document.getElementById("mc-again").onclick = () => startMode(modeIndex);
      document.getElementById("mc-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id)).join("");

    const isAudio = mode.left === "audio" || mode.left === "audio-words";
    app.innerHTML = `
      <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Price Match</span>
          <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/2 · ${correctCount()}/5</span>
        </header>
      <p class="mc-instruction" id="mc-hint">${mode.tip}</p>
      <div class="mc-board${isAudio ? " is-audio" : ""}">
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
        selectLeft(i);
        playAudioFor(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((el) => {
      el.onclick = () => selectRight(el.dataset.id);
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
  }

  render();
})();
