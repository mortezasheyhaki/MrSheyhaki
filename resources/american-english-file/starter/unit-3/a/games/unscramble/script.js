/* Unscramble – picture + audio + letter scramble – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-unscramble";

  // spell = letters only (no spaces/hyphens); label = full phrase with article
  const ITEMS = [
    { id: "cellphone",   label: "a cell phone",   spell: "cellphone",   audio: "audio/cellphone.mp3",   image: "images/cellphone.png" },
    { id: "newspaper",   label: "a newspaper",    spell: "newspaper",   audio: "audio/newspaper.mp3",   image: "images/newspaper.png" },
    { id: "key",         label: "a key",          spell: "key",         audio: "audio/key.mp3",         image: "images/key.png" },
    { id: "credit-card", label: "a credit card",  spell: "creditcard",  audio: "audio/credit-card.mp3", image: "images/credit-card.png" },
    { id: "camera",      label: "a camera",       spell: "camera",      audio: "audio/camera.mp3",      image: "images/camera.png" },
    { id: "umbrella",    label: "an umbrella",    spell: "umbrella",    audio: "audio/umbrella.mp3",    image: "images/umbrella.png" },
    { id: "passport",    label: "a passport",     spell: "passport",    audio: "audio/passport.mp3",    image: "images/passport.png" },
    { id: "charger",     label: "a charger",      spell: "charger",     audio: "audio/charger.mp3",     image: "images/charger.png" },
    { id: "photo",       label: "a photo",        spell: "photo",       audio: "audio/photo.mp3",       image: "images/photo.png" },
    { id: "glasses",     label: "glasses",        spell: "glasses",     audio: "audio/glasses.mp3",     image: "images/glasses.png" },
    { id: "notebook",    label: "a notebook",     spell: "notebook",    audio: "audio/notebook.mp3",    image: "images/notebook.png" },
    { id: "pencil",      label: "a pencil",       spell: "pencil",      audio: "audio/pencil.mp3",      image: "images/pencil.png" },
    { id: "wallet",      label: "a wallet",       spell: "wallet",      audio: "audio/wallet.mp3",      image: "images/wallet.png" },
    { id: "tablet",      label: "a tablet",       spell: "tablet",      audio: "audio/tablet.mp3",      image: "images/tablet.png" },
    { id: "watch",       label: "a watch",        spell: "watch",       audio: "audio/watch.mp3",       image: "images/watch.png" },
  ];

  const SETS = [
    ["cellphone", "newspaper", "key", "credit-card", "camera"],
    ["umbrella", "passport", "charger", "photo", "glasses"],
    ["notebook", "pencil", "wallet", "tablet", "watch"],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let setIndex = 0;
  let itemIndex = 0; // within current set
  let order = []; // shuffled item ids for current set
  let slots = []; // array of letters placed (or null)
  let bank = []; // remaining letters {ch, key}
  let currentAudio = null;
  let checked = false;
  let firstTryCorrect = 0;
  let totalCorrect = 0;
  let attemptsThisWord = 0;

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

  function scrambleWord(word) {
    let letters = word.split("");
    let scrambled = shuffle(letters).join("");
    // avoid identical to original when possible
    let tries = 0;
    while (scrambled === word && word.length > 1 && tries < 20) {
      scrambled = shuffle(letters).join("");
      tries++;
    }
    return scrambled.split("");
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio(src) {
    if (!src) return;
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    const btn = app.querySelector(".mc-play");
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
    setIndex = 0;
    firstTryCorrect = 0;
    totalCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    order = shuffle(SETS[setIndex].slice());
    itemIndex = 0;
    loadItem();
  }

  function loadItem() {
    const id = order[itemIndex];
    const item = byId(id);
    if (!item) return;

    const letters = scrambleWord(item.spell);
    bank = letters.map((ch, i) => ({ ch, key: id + "-" + i + "-" + ch }));
    slots = Array(item.spell.length).fill(null);
    checked = false;
    attemptsThisWord = 0;
    stopAudio();
    phase = "play";
    render();
    // auto-play audio shortly after load
    setTimeout(() => playAudio(item.audio), 350);
  }

  function placeLetter(bankIdx) {
    if (checked) return;
    const empty = slots.findIndex((s) => s === null);
    if (empty === -1) return;
    const letter = bank[bankIdx];
    if (!letter) return;
    slots[empty] = letter;
    bank[bankIdx] = null;
    renderSlotsAndBank();
    // auto-check when full
    if (slots.every((s) => s !== null)) {
      setTimeout(checkAnswer, 180);
    }
  }

  function removeFromSlot(slotIdx) {
    if (checked) return;
    const letter = slots[slotIdx];
    if (!letter) return;
    slots[slotIdx] = null;
    // put back into first empty bank slot
    const emptyBank = bank.findIndex((b) => b === null);
    if (emptyBank !== -1) bank[emptyBank] = letter;
    else bank.push(letter);
    renderSlotsAndBank();
  }

  function currentGuess() {
    return slots.map((s) => (s ? s.ch : "")).join("");
  }

  function checkAnswer() {
    if (checked) return;
    const item = byId(order[itemIndex]);
    if (!item) return;
    const guess = currentGuess();
    if (guess.length < item.spell.length) return;

    attemptsThisWord += 1;
    checked = true;
    const ok = guess === item.spell;

    const slotEls = app.querySelectorAll(".us-slot");
    slotEls.forEach((el) => {
      el.classList.remove("is-correct", "is-wrong");
      el.classList.add(ok ? "is-correct" : "is-wrong");
    });

    if (ok) {
      totalCorrect += 1;
      if (attemptsThisWord === 1) firstTryCorrect += 1;
      playAudio(item.audio);
      setTimeout(() => {
        if (itemIndex < order.length - 1) {
          itemIndex += 1;
          loadItem();
        } else if (setIndex < SETS.length - 1) {
          startSet(setIndex + 1);
        } else {
          phase = "done";
          render();
        }
      }, 1100);
    } else {
      // shake then unlock so they can fix
      setTimeout(() => {
        checked = false;
        slotEls.forEach((el) => el.classList.remove("is-wrong"));
      }, 700);
    }
    updateProgress();
  }

  function resetWord() {
    if (checked) return;
    const item = byId(order[itemIndex]);
    if (!item) return;
    const letters = scrambleWord(item.spell);
    bank = letters.map((ch, i) => ({ ch, key: item.id + "-r-" + i + "-" + ch + "-" + Date.now() }));
    slots = Array(item.spell.length).fill(null);
    renderSlotsAndBank();
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) {
      const doneInSet = itemIndex + (checked && currentGuess() === byId(order[itemIndex]).spell ? 1 : 0);
      el.textContent = "Set " + (setIndex + 1) + "/" + SETS.length + " · " + Math.min(itemIndex + 1, order.length) + "/" + order.length;
    }
  }

  function calcStars() {
    const total = ITEMS.length;
    // Prefer first-try accuracy, fall back to total correct
    const n = firstTryCorrect;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
    // also reward overall completion
    if (totalCorrect >= total - 1) return Math.max(1, Math.min(2, n > 0 ? 2 : 1));
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

  function renderSlotsAndBank() {
    const slotsEl = document.getElementById("us-slots");
    const bankEl = document.getElementById("us-bank");
    if (!slotsEl || !bankEl) return;

    slotsEl.innerHTML = slots
      .map((s, i) => {
        if (s) {
          return `<button type="button" class="us-slot filled" data-slot="${i}">${s.ch.toUpperCase()}</button>`;
        }
        return `<button type="button" class="us-slot empty" data-slot="${i}" disabled></button>`;
      })
      .join("");

    bankEl.innerHTML = bank
      .map((b, i) => {
        if (!b) return `<span class="us-bank-empty"></span>`;
        return `<button type="button" class="us-letter" data-bank="${i}">${b.ch.toUpperCase()}</button>`;
      })
      .join("");

    slotsEl.querySelectorAll(".us-slot.filled").forEach((btn) => {
      btn.onclick = () => removeFromSlot(+btn.dataset.slot);
    });
    bankEl.querySelectorAll(".us-letter").forEach((btn) => {
      btn.onclick = () => placeLetter(+btn.dataset.bank);
    });
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Unscramble</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🔤</div>
          <h1>Unscramble</h1>
          <p class="mc-desc">Look · Listen · Unscramble the letters<br>15 words · 3 sets</p>
          <button type="button" class="mc-btn" id="us-start">Start</button>
        </section>`;
      document.getElementById("us-start").onclick = () => startGame();
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Unscramble</span>
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
          <p>You unscrambled <strong>${totalCorrect} / ${ITEMS.length}</strong><br>
          First try: <strong>${firstTryCorrect}</strong></p>
          <button type="button" class="mc-btn" id="us-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="us-menu">Menu</button>
        </section>`;
      document.getElementById("us-again").onclick = () => startGame();
      document.getElementById("us-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    // play
    const item = byId(order[itemIndex]);
    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Unscramble · Set ${setIndex + 1}/${SETS.length}</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/${SETS.length} · ${itemIndex + 1}/${order.length}</span>
      </header>
      <p class="mc-instruction">Look at the picture, listen, then unscramble the letters.</p>
      <div class="us-stage">
        <div class="us-pic-wrap">
          <img class="us-pic" src="${item.image}" alt="${item.label}" draggable="false">
          <button type="button" class="mc-play us-hear" aria-label="Play audio">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
        </div>
        <div class="us-slots" id="us-slots"></div>
        <div class="us-bank" id="us-bank"></div>
        <div class="us-actions">
          <button type="button" class="mc-btn secondary" id="us-reset">Reset letters</button>
          <button type="button" class="mc-btn secondary" id="us-check">Check</button>
        </div>
      </div>`;

    renderSlotsAndBank();
    app.querySelector(".us-hear").onclick = () => playAudio(item.audio);
    document.getElementById("us-reset").onclick = () => resetWord();
    document.getElementById("us-check").onclick = () => checkAnswer();
  }

  render();
})();
