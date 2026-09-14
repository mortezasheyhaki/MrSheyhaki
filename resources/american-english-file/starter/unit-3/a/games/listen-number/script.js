/* Listen & Number – number the list 1–8 from the audio – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-listen-number";

  // Display order matches the textbook list (not the ranking order)
  const ITEMS = [
    { id: "pens",     label: "pens and pencils",                    correct: 3 },
    { id: "glasses",  label: "glasses and sunglasses",              correct: 4 },
    { id: "keys",     label: "keys (house keys and car keys)",       correct: 1 },
    { id: "wallets",  label: "wallets and change purses",            correct: 8 },
    { id: "cards",    label: "bank cards",                          correct: 6 },
    { id: "phones",   label: "cell phones",                         correct: 2 },
    { id: "umbrellas",label: "umbrellas",                           correct: 7 },
    { id: "chargers", label: "phone chargers",                      correct: 5 },
  ];

  const AUDIO = "audio/listening.mp3";

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let numbers = {};   // id -> number (1–8) or null
  let selectedId = null;
  let checked = false;
  let currentAudio = null;
  let correctCount = 0;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".mc-play.playing, .ln-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    stopAudio();
    const a = new Audio(AUDIO);
    currentAudio = a;
    const btn = app.querySelector(".ln-play, .mc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function usedNumbers() {
    return new Set(Object.values(numbers).filter((n) => n != null));
  }

  function assignNumber(id, num) {
    if (checked) return;
    // clear this number from any other item
    Object.keys(numbers).forEach((k) => {
      if (numbers[k] === num) numbers[k] = null;
    });
    numbers[id] = num;
    selectedId = null;
    renderPlay(false);
  }

  function clearItem(id) {
    if (checked) return;
    numbers[id] = null;
    renderPlay(false);
  }

  function selectItem(id) {
    if (checked) return;
    selectedId = selectedId === id ? null : id;
    renderPlay(false);
  }

  function allFilled() {
    return ITEMS.every((it) => numbers[it.id] != null);
  }

  function checkAnswers() {
    if (!allFilled()) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = "Number all 8 items first.";
        hint.classList.add("mc-hint-warn");
        setTimeout(() => hint.classList.remove("mc-hint-warn"), 1200);
      }
      return;
    }
    checked = true;
    correctCount = 0;
    ITEMS.forEach((it) => {
      if (numbers[it.id] === it.correct) correctCount += 1;
    });
    renderPlay(true);
    setTimeout(() => {
      phase = "done";
      render();
    }, 1600);
  }

  function reset() {
    numbers = {};
    ITEMS.forEach((it) => { numbers[it.id] = null; });
    selectedId = null;
    checked = false;
    correctCount = 0;
    stopAudio();
  }

  function start() {
    reset();
    phase = "play";
    render();
    setTimeout(playAudio, 400);
  }

  function calcStars() {
    if (correctCount >= 8) return 3;
    if (correctCount >= 6) return 2;
    if (correctCount >= 4) return 1;
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

  function renderPlay(showResult) {
    const used = usedNumbers();
    const rows = ITEMS.map((it) => {
      const n = numbers[it.id];
      const sel = selectedId === it.id ? " is-selected" : "";
      let state = "";
      if (showResult && n != null) {
        state = n === it.correct ? " is-correct" : " is-wrong";
      }
      return `
        <button type="button" class="ln-row${sel}${state}" data-id="${it.id}" ${checked ? "disabled" : ""}>
          <span class="ln-num-box">${n != null ? n : ""}</span>
          <span class="ln-label">${it.label}</span>
        </button>`;
    }).join("");

    const numBtns = [1, 2, 3, 4, 5, 6, 7, 8]
      .map((n) => {
        const taken = used.has(n);
        return `<button type="button" class="ln-pick${taken ? " is-used" : ""}" data-n="${n}" ${checked || taken ? "disabled" : ""}>${n}</button>`;
      })
      .join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Listen & Number</span>
        <span class="mc-badge">3A</span>
      </header>
      <p class="mc-instruction" id="mc-hint">${selectedId ? "Tap a number for this item." : "Listen, then tap an item and choose its number 1–8."}</p>
      <div class="ln-stage">
        <div class="ln-head">
          <div class="ln-title-card">
            <span class="ln-ohno">Oh no!</span>
            <span class="ln-where">Where's my phone?</span>
          </div>
          <button type="button" class="mc-play ln-play" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
        </div>
        <div class="ln-list">${rows}</div>
        <div class="ln-picks" id="ln-picks">${numBtns}</div>
        <div class="ln-actions">
          <button type="button" class="mc-btn secondary" id="ln-reset" ${checked ? "disabled" : ""}>Reset</button>
          <button type="button" class="mc-btn" id="ln-check" ${checked ? "disabled" : ""}>Check</button>
        </div>
      </div>`;

    app.querySelector(".ln-play").onclick = () => playAudio();
    app.querySelectorAll(".ln-row").forEach((btn) => {
      btn.onclick = () => {
        if (checked) return;
        const id = btn.dataset.id;
        if (numbers[id] != null && selectedId !== id) {
          // second tap on filled row clears it if not selecting
          clearItem(id);
          return;
        }
        selectItem(id);
      };
    });
    app.querySelectorAll(".ln-pick").forEach((btn) => {
      btn.onclick = () => {
        if (checked || !selectedId) {
          const hint = document.getElementById("mc-hint");
          if (hint && !selectedId) {
            hint.textContent = "Tap an item in the list first.";
            hint.classList.add("mc-hint-warn");
            setTimeout(() => hint.classList.remove("mc-hint-warn"), 1200);
          }
          return;
        }
        assignNumber(selectedId, +btn.dataset.n);
      };
    });
    document.getElementById("ln-reset").onclick = () => {
      reset();
      renderPlay(false);
    };
    document.getElementById("ln-check").onclick = () => checkAnswers();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen & Number</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🔢</div>
          <h1>Listen & Number</h1>
          <p class="mc-desc">Listen and number the things 1–8 in the list</p>
          <button type="button" class="mc-btn" id="ln-start">Start</button>
        </section>`;
      document.getElementById("ln-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen & Number</span>
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
          <p>You got <strong>${correctCount} / 8</strong> in the correct order.</p>
          <button type="button" class="mc-btn" id="ln-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="ln-menu">Menu</button>
        </section>`;
      document.getElementById("ln-again").onclick = () => start();
      document.getElementById("ln-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    renderPlay(false);
  }

  render();
})();
