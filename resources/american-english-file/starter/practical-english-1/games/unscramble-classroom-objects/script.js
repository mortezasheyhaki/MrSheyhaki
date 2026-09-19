/* Unscramble Classroom Objects – AEF Starter Practical English 1 */
(function () {
  const GAME_ID = "starter-pe1-unscramble-classroom-objects";

  const ITEMS = [
    { id: "bag", label: "a bag", word: "bag", audio: "https://cdn.imgurl.ir/uploads/k337766_a-bag.mp3", image: "https://cdn.imgurl.ir/uploads/q131373_a-bag.png" },
    { id: "pen", label: "a pen", word: "pen", audio: "https://cdn.imgurl.ir/uploads/d36470_a-pen.mp3", image: "https://cdn.imgurl.ir/uploads/t81465_a-pen.png" },
    { id: "paper", label: "a piece of paper", word: "paper", audio: "https://cdn.imgurl.ir/uploads/762189_a-piece-of-paper.mp3", image: "https://cdn.imgurl.ir/uploads/l77286_a-piece-of-paper.png" },
    { id: "dictionary", label: "a dictionary", word: "dictionary", audio: "https://cdn.imgurl.ir/uploads/i77815_a-dictionary.mp3", image: "https://cdn.imgurl.ir/uploads/p440509_a-dictionary.png" },
    { id: "laptop", label: "a laptop", word: "laptop", audio: "https://cdn.imgurl.ir/uploads/r021_a-laptop.mp3", image: "https://cdn.imgurl.ir/uploads/w410273_a-laptop.png" },
    { id: "table", label: "a table", word: "table", audio: "https://cdn.imgurl.ir/uploads/d742794_a-table.mp3", image: "https://cdn.imgurl.ir/uploads/a696837_a-table.png" },
    { id: "chair", label: "a chair", word: "chair", audio: "https://cdn.imgurl.ir/uploads/b877018_a-chair.mp3", image: "https://cdn.imgurl.ir/uploads/t901556_a-chair.png" },
    { id: "window", label: "a window", word: "window", audio: "https://cdn.imgurl.ir/uploads/l543208_a-window.mp3", image: "https://cdn.imgurl.ir/uploads/c480039_a-window.png" },
    { id: "door", label: "the door", word: "door", audio: "https://cdn.imgurl.ir/uploads/g92275_the-door.mp3", image: "https://cdn.imgurl.ir/uploads/o763819_the-door.png" },
    { id: "board", label: "the board", word: "board", audio: "https://cdn.imgurl.ir/uploads/i034259_the-board.mp3", image: "https://cdn.imgurl.ir/uploads/v58413_the-board.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "start";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let slots = [];
  let pool = [];
  let checked = false;
  let lastCorrect = false;
  let uidCounter = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return ITEMS[order[index]];
  }

  function letterList(word) {
    return word.split("").map((ch) => (ch === " " ? " " : ch));
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correctCount = 0;
    startRound();
  }

  function startRound() {
    const c = current();
    const letters = letterList(c.word);
    slots = letters.map((ch) =>
      ch === " " ? { type: "space" } : { type: "empty", ch: null, uid: null }
    );
    const scramble = letters.filter((ch) => ch !== " ");
    let scrambled = shuffle(scramble);
    let tries = 0;
    while (scrambled.join("") === scramble.join("") && scramble.length > 1 && tries < 20) {
      scrambled = shuffle(scramble);
      tries++;
    }
    pool = scrambled.map((ch) => ({ ch, uid: ++uidCounter, used: false }));
    checked = false;
    lastCorrect = false;
    phase = "play";
    render();
    setTimeout(() => playAudio(), 350);
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio() {
    const c = current();
    if (!c || !c.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(c.audio);
      currentAudio.play().catch(() => {});
    } catch (_) {}
  }

  function firstEmptySlot() {
    return slots.findIndex((s) => s.type === "empty" && !s.ch);
  }

  function fillBlank(input, val) {
    /* unused – letter tiles only */
  }

  function placeLetter(uid) {
    if (checked) return;
    const tile = pool.find((t) => t.uid === uid && !t.used);
    if (!tile) return;
    const si = firstEmptySlot();
    if (si < 0) return;
    slots[si] = { type: "empty", ch: tile.ch, uid: tile.uid };
    tile.used = true;
    renderPlayPartial();
    if (firstEmptySlot() < 0) setTimeout(checkAnswer, 200);
  }

  function removeFromSlot(si) {
    if (checked) return;
    const s = slots[si];
    if (!s || s.type !== "empty" || !s.ch) return;
    const tile = pool.find((t) => t.uid === s.uid);
    if (tile) tile.used = false;
    slots[si] = { type: "empty", ch: null, uid: null };
    renderPlayPartial();
  }

  function builtWord() {
    return slots.map((s) => (s.type === "space" ? " " : s.ch || "")).join("");
  }

  function checkAnswer() {
    if (checked) return;
    const c = current();
    if (slots.some((s) => s.type === "empty" && !s.ch)) return;
    checked = true;
    lastCorrect = builtWord() === c.word;
    if (lastCorrect) correctCount++;
    phase = "feedback";
    render();
  }

  function nextRound() {
    stopAudio();
    if (index < order.length - 1) {
      index++;
      startRound();
    } else {
      phase = "done";
      render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSlots(interactive) {
    return slots
      .map((s, i) => {
        if (s.type === "space") return `<span class="uc-space" aria-hidden="true"></span>`;
        if (s.ch) {
          const cls = checked
            ? lastCorrect
              ? "uc-slot filled ok"
              : "uc-slot filled bad"
            : "uc-slot filled";
          const click = interactive && !checked ? `data-slot="${i}"` : "";
          return `<button type="button" class="${cls}" ${click} aria-label="letter ${s.ch}">${escapeHtml(s.ch)}</button>`;
        }
        return `<span class="uc-slot empty" aria-hidden="true"></span>`;
      })
      .join("");
  }

  function renderPool() {
    return pool
      .map((t) => {
        if (t.used) return `<span class="uc-tile used" aria-hidden="true">${escapeHtml(t.ch)}</span>`;
        return `<button type="button" class="uc-tile" data-uid="${t.uid}">${escapeHtml(t.ch)}</button>`;
      })
      .join("");
  }

  function renderPlayPartial() {
    const slotsEl = document.getElementById("uc-slots");
    const poolEl = document.getElementById("uc-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(true);
      slotsEl.querySelectorAll("[data-slot]").forEach((btn) => {
        btn.onclick = () => removeFromSlot(+btn.dataset.slot);
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool();
      poolEl.querySelectorAll("[data-uid]").forEach((btn) => {
        btn.onclick = () => placeLetter(+btn.dataset.uid);
      });
    }
  }

  function render() {
    if (phase === "start") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · PRACTICAL ENGLISH 1</span>
            <span class="uc-title">Unscramble Classroom Objects</span>
          </div>
          <span class="uc-badge">${ITEMS.length}</span>
        </header>
        <section class="uc-start">
          <div class="uc-hero">✏️</div>
          <h1>Unscramble Classroom Objects</h1>
          <p class="uc-desc">Look at the picture, listen, then put the letters in order to spell the word.</p>
          <button type="button" class="uc-btn" id="uc-start">Start</button>
        </section>`;
      document.getElementById("uc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const total = ITEMS.length;
      const stars =
        correctCount === total ? 3 : correctCount >= total - 2 ? 2 : correctCount >= Math.ceil(total / 2) ? 1 : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: () => { phase = "start"; render(); },
          backHref: "../",
        });
        return;
      }
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
      app.innerHTML = `<p>Done ${correctCount}/${total}</p><button type="button" id="uc-again">Again</button>`;
      document.getElementById("uc-again").onclick = startGame;
      return;
    }

    const c = current();
    const progress = `${index + 1}/${order.length}`;

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="uc-topbar">
          <a class="uc-back" href="../" aria-label="Back">←</a>
          <div class="uc-topbar-center">
            <span class="uc-kicker">STARTER · PRACTICAL ENGLISH 1</span>
            <span class="uc-title">Unscramble Classroom Objects</span>
          </div>
          <span class="uc-badge">${progress}</span>
        </header>
        <div class="uc-scroll">
          <div class="uc-card uc-card-photo">
            <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
                 onerror="this.style.display='none'" />
            <button type="button" class="uc-audio-btn" id="uc-play" aria-label="Play audio">🔊</button>
          </div>
          <div class="uc-card uc-card-word">
            <p class="uc-feedback ${lastCorrect ? "ok" : "bad"}">
              ${lastCorrect ? "✓ Correct!" : "✗ Not quite"}
            </p>
            <div class="uc-slots locked">${renderSlots(false)}</div>
            ${!lastCorrect ? `<p class="uc-answer-reveal">Answer: <strong>${escapeHtml(c.word)}</strong></p>` : ""}
            <p class="uc-country-name">${escapeHtml(c.label)}</p>
          </div>
          <button type="button" class="uc-btn uc-btn-next" id="uc-next">
            ${index < order.length - 1 ? "Next →" : "See results"}
          </button>
        </div>`;
      document.getElementById("uc-play").onclick = playAudio;
      document.getElementById("uc-next").onclick = nextRound;
      return;
    }

    app.innerHTML = `
      <header class="uc-topbar">
        <a class="uc-back" href="../" aria-label="Back">←</a>
        <div class="uc-topbar-center">
          <span class="uc-kicker">STARTER · PRACTICAL ENGLISH 1</span>
          <span class="uc-title">Unscramble Classroom Objects</span>
        </div>
        <span class="uc-badge">${progress}</span>
      </header>
      <p class="uc-instruction">Tap the letters to spell the word.</p>
      <div class="uc-scroll">
        <div class="uc-card uc-card-photo">
          <img class="uc-photo" src="${c.image}" alt="${escapeHtml(c.label)}"
               onerror="this.style.display='none'" />
          <button type="button" class="uc-audio-btn" id="uc-play" aria-label="Play audio">🔊</button>
        </div>
        <div class="uc-card uc-card-word">
          <div class="uc-slots" id="uc-slots">${renderSlots(true)}</div>
        </div>
        <div class="uc-card uc-card-pool">
          <div class="uc-pool" id="uc-pool">${renderPool()}</div>
          <button type="button" class="uc-btn-check" id="uc-check">Check</button>
        </div>
      </div>`;

    document.getElementById("uc-play").onclick = playAudio;
    document.getElementById("uc-check").onclick = checkAnswer;
    document.getElementById("uc-slots").querySelectorAll("[data-slot]").forEach((btn) => {
      btn.onclick = () => removeFromSlot(+btn.dataset.slot);
    });
    document.getElementById("uc-pool").querySelectorAll("[data-uid]").forEach((btn) => {
      btn.onclick = () => placeLetter(+btn.dataset.uid);
    });
  }

  render();
})();
