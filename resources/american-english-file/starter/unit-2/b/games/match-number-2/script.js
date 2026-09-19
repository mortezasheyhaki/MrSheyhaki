/* Match Number 2 30–100 – 3 modes × 2 sets – AEF Starter Unit 2B
   Modes: Words ↔ Numbers | Audio ↔ Words | Audio ↔ Numbers
   Two sets of 5; auto-advance (no Next Round button)
*/
(function () {
  const GAME_ID = "starter-2b-match-number-2";

  const ITEMS = [
    { id: "30", num: "30", word: "thirty", audio: "audio/30.mp3" },
    { id: "40", num: "40", word: "forty", audio: "audio/40.mp3" },
    { id: "50", num: "50", word: "fifty", audio: "audio/50.mp3" },
    { id: "60", num: "60", word: "sixty", audio: "audio/60.mp3" },
    { id: "70", num: "70", word: "seventy", audio: "audio/70.mp3" },
    { id: "80", num: "80", word: "eighty", audio: "audio/80.mp3" },
    { id: "90", num: "90", word: "ninety", audio: "audio/90.mp3" },
    { id: "100", num: "100", word: "a hundred", audio: "audio/100.mp3" },
  ];

  // 2 fixed sets of 4
  const SETS = [
    ["30", "40", "50", "60"],
    ["70", "80", "90", "100"],
  ];

  const MODES = [
    {
      id: "words-nums",
      title: "Words → Numbers",
      left: "word",
      right: "num",
      tip: "Match each word to its number.",
    },
    {
      id: "audio-words",
      title: "Audio → Words",
      left: "audio",
      right: "word",
      tip: "Listen, then match the word.",
    },
    {
      id: "audio-nums",
      title: "Audio → Numbers",
      left: "audio",
      right: "num",
      tip: "Listen, then match the number.",
    },
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
        s.style.setProperty("--delay", i * 0.02 + "s");
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
    return correctCount() === 4;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    const mode = MODES[modeIndex];
    if (mode.left === "audio") {
      playAudioFor(i);
    }
  }

  function selectRight(rightId) {
    if (selectedLeft === null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        const mode = MODES[modeIndex];
        hint.textContent =
          mode.left === "audio"
            ? "Play a sound first, then tap a match."
            : "Tap a word on the left first.";
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
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));

      // Post-match audio only for Words → Numbers (other modes already use audio)
      if (MODES[modeIndex].left === "word") {
        const matched = byId(leftId);
        if (matched && matched.audio) {
          stopAudio();
          const a = new Audio(matched.audio);
          currentAudio = a;
          a.play().catch(function () {});
          a.onended = function () {
            if (currentAudio === a) currentAudio = null;
          };
        }
      }

      const prog = document.getElementById("mc-progress");
      if (prog) prog.textContent = "Set " + (setIndex + 1) + "/2 · " + correctCount() + "/4";

      if (allMatched()) {
        const delay = MODES[modeIndex].left === "word" ? 1200 : 700;
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, delay);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong", "is-selected");
        if (rightEl) rightEl.classList.remove("is-wrong");
        selectedLeft = null;
      }, 650);
    }
  }

  function leftCell(id, i, leftType) {
    const c = byId(id);
    const isLocked = !!locked[i];
    const isSel = selectedLeft === i;
    const ok = isLocked ? " is-correct" : "";
    const sel = isSel ? " is-selected" : "";

    if (leftType === "audio") {
      return (
        '<div class="mc-left-item mc-audio-cell' + ok + sel + '" data-i="' + i + '">' +
        '<button type="button" class="mc-play" data-i="' + i + '" aria-label="Play" ' +
        (isLocked ? "disabled" : "") +
        ">" +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        "</div>"
      );
    }
    // word
    return (
      '<div class="mc-left-item mc-word-left' + ok + sel + '" data-i="' + i + '">' +
      '<span class="mc-word-label">' + c.word + "</span>" +
      "</div>"
    );
  }

  function rightCell(id) {
    const c = byId(id);
    const mode = MODES[modeIndex];
    const used = Object.keys(locked).some((li) => matches[li] === id);
    const label = mode.right === "num" ? c.num : c.word;
    return (
      '<button type="button" class="mc-right-item mc-word' +
      (used ? " is-correct is-used" : "") +
      '" data-id="' + id + '"' +
      (used ? " disabled" : "") +
      ">" +
      '<span class="mc-word-label">' + label + "</span>" +
      "</button>"
    );
  }

  function calcStars() {
    // 10 pairs total across 2 sets
    if (modeCorrect >= 8) return 3;
    if (modeCorrect >= 6) return 2;
    if (modeCorrect >= 3) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function render() {
    stopAudio();

    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Number 2</span>' +
        '<span class="mc-badge">2B</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">🔢</div>' +
        "<h1>Match Number 2</h1>" +
        '<p class="mc-desc">Numbers 30–100 · two sets of four<br>Choose a mode</p>' +
        '<div class="mc-mode-list">' +
        MODES.map(
          (m, i) =>
            '<button type="button" class="mc-mode-card mc-mode-btn" data-mi="' +
            i +
            '"><span class="mc-mode-num">' +
            (i + 1) +
            "</span><div><strong>" +
            m.title +
            "</strong><p>" +
            m.tip +
            "</p></div></button>"
        ).join("") +
        "</div>" +
        "</section>";

      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mi);
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: modeCorrect,
          total: 8,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startMode(modeIndex);
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id)).join("");

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">' +
      mode.title +
      " · Set " +
      (setIndex + 1) +
      "/2</span>" +
      '<span class="mc-progress" id="mc-progress">Set ' +
      (setIndex + 1) +
      "/2 · " +
      correctCount() +
      "/4</span>" +
      "</header>" +
      '<p class="mc-instruction" id="mc-hint">' +
      mode.tip +
      "</p>" +
      '<div class="mc-board is-entering" id="mc-board">' +
      '<div class="mc-col mc-col-left">' +
      left +
      "</div>" +
      '<div class="mc-col mc-col-right">' +
      right +
      "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset set</button>' +
      "</div>";

    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.onclick = () => selectLeft(+el.dataset.i);
    });
    app.querySelectorAll(".mc-play").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        if (locked[i]) return;
        selectLeft(i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((btn) => {
      btn.onclick = () => selectRight(btn.dataset.id);
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
    const board = document.getElementById("mc-board");
    if (board) {
      setTimeout(function () { board.classList.remove("is-entering"); }, 700);
    }
  }

  render();
})();
