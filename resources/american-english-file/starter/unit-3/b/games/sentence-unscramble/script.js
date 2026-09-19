/* Sentence Unscramble · this / that / these / those · AEF Starter Unit 3B */
(function () {
  const GAME_ID = "starter-3b-sentence-unscramble";

  const SINGULAR = [
    { id: "umbrella",  words: ["This", "is", "an", "umbrella"],  image: "images/this-is-an-umbrella.png" },
    { id: "id-card",   words: ["That", "is", "an", "ID", "card"], image: "images/that-is-an-id-card.png" },
    { id: "photo",     words: ["That", "is", "a", "photo"],      image: "images/that-is-a-photo.png" },
    { id: "passport",  words: ["That", "is", "a", "passport"],   image: "images/that-is-a-passport.png" },
    { id: "tv",        words: ["That", "is", "a", "TV"],         image: "images/that-is-a-tv.png" },
    { id: "notebook",  words: ["That", "is", "a", "notebook"],   image: "images/that-is-a-notebook.png" },
    { id: "laptop",    words: ["This", "is", "a", "laptop"],     image: "images/this-is-a-laptop.png" },
    { id: "charger",   words: ["This", "is", "a", "charger"],    image: "images/this-is-a-charger.png" },
    { id: "book",      words: ["This", "is", "a", "book"],       image: "images/this-is-a-book.png" },
    { id: "key",       words: ["This", "is", "a", "key"],        image: "images/this-is-a-key.png" },
  ];

  const PLURAL = [
    { id: "phones",    words: ["Those", "are", "phones"],     image: "images/those-are-phones.png" },
    { id: "windows",   words: ["Those", "are", "windows"],    image: "images/those-are-windows.png" },
    { id: "coats",     words: ["Those", "are", "coats"],      image: "images/those-are-coats.png" },
    { id: "keys",      words: ["Those", "are", "keys"],       image: "images/those-are-keys.png" },
    { id: "keychains", words: ["Those", "are", "keychains"],  image: "images/those-are-keychains.png" },
    { id: "watches",   words: ["These", "are", "watches"],    image: "images/these-are-watches.png" },
    { id: "tshirts",   words: ["These", "are", "T-shirts"],   image: "images/these-are-tshirts.png" },
    { id: "chairs",    words: ["These", "are", "chairs"],     image: "images/these-are-chairs.png" },
    { id: "mugs",      words: ["These", "are", "mugs"],       image: "images/these-are-mugs.png" },
    { id: "glasses",   words: ["These", "are", "glasses"],    image: "images/these-are-glasses.png" },
  ];

  const MODES = [
    { id: "singular", title: "Singular", tip: "this / that + is", items: SINGULAR },
    { id: "plural",   title: "Plural",   tip: "these / those + are", items: PLURAL },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let modeIndex = 0;
  let order = [];
  let current = 0;
  let correctCount = 0;
  let tiles = [];   // { word, id, used }
  let slots = [];   // word or null
  let locked = false;
  let playRecorded = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function scrambleWords(words) {
    let scrambled = shuffle(words);
    let tries = 0;
    while (scrambled.join(" ") === words.join(" ") && words.length > 1 && tries < 30) {
      scrambled = shuffle(words);
      tries++;
    }
    return scrambled.map((word, i) => ({ word, id: i, used: false }));
  }

  function updateStars() {
    if (!window.LAStars) return;
    const total = order.length;
    const stars = correctCount >= total ? 3 : correctCount >= Math.ceil(total * 0.6) ? 2 : correctCount >= 1 ? 1 : 0;
    if (stars > 0) {
      if (!playRecorded) {
        LAStars.recordPlay(GAME_ID);
        playRecorded = true;
      }
      LAStars.save(GAME_ID, stars);
    }
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    const items = MODES[mi].items;
    order = shuffle(items.map((_, i) => i));
    current = 0;
    correctCount = 0;
    locked = false;
    playRecorded = false;
    setupItem();
    phase = "play";
    render();
  }

  function setupItem() {
    const items = MODES[modeIndex].items;
    const item = items[order[current]];
    tiles = scrambleWords(item.words);
    slots = Array(item.words.length).fill(null);
    locked = false;
  }

  function placeTile(tileId) {
    if (locked) return;
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || tile.used) return;
    const empty = slots.findIndex((s) => s === null);
    if (empty === -1) return;
    slots[empty] = tile.word;
    tile.used = true;
    render();
    // Auto-check when all slots are filled
    if (slots.every((s) => s !== null)) {
      setTimeout(() => checkAnswer(), 150);
    }
  }

  function removeFromSlot(slotIdx) {
    if (locked) return;
    const word = slots[slotIdx];
    if (!word) return;
    slots[slotIdx] = null;
    const tile = tiles.find((t) => t.word === word && t.used);
    if (tile) tile.used = false;
    // compact slots
    const filled = slots.filter((s) => s !== null);
    slots = filled.concat(Array(slots.length - filled.length).fill(null));
    render();
  }

  function checkAnswer() {
    if (locked) return;
    const items = MODES[modeIndex].items;
    const item = items[order[current]];
    const answer = slots.filter((s) => s !== null);
    if (answer.length < item.words.length) return;

    locked = true;
    const correct = answer.join(" ") === item.words.join(" ");

    // visual feedback
    const slotEls = app.querySelectorAll(".su-slots .su-tile");
    slotEls.forEach((el) => {
      el.classList.add(correct ? "correct" : "wrong");
    });

    if (correct) {
      correctCount++;
      updateStars();
      setTimeout(() => {
        current++;
        if (current >= order.length) {
          phase = "done";
          render();
        } else {
          setupItem();
          render();
        }
      }, 900);
    } else {
      setTimeout(() => {
        // reset wrong answer
        tiles.forEach((t) => (t.used = false));
        slots = Array(item.words.length).fill(null);
        locked = false;
        render();
      }, 700);
    }
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Sentence Unscramble</span>
          <span class="mc-progress">3B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🔀</div>
          <h1>Sentence Unscramble</h1>
          <p class="mc-desc">Look at the picture · put the words in order</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="mc-mode-card" data-mode="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip} · ${m.items.length} sentences</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-card").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mode);
      });
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: order.length,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const total = order.length;
      const stars = correctCount >= total ? 3 : correctCount >= Math.ceil(total * 0.6) ? 2 : correctCount >= 1 ? 1 : 0;
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Sentence Unscramble</span>
          <span class="mc-progress">3B</span>
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
          <p>You got <strong>${correctCount} / ${total}</strong> correct.</p>
          <button type="button" class="mc-btn" id="again">Play again</button>
          <button type="button" class="mc-btn secondary" id="menu">All modes</button>
        </section>`;
      document.getElementById("again").onclick = () => startMode(modeIndex);
      document.getElementById("menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // Play
    const items = MODES[modeIndex].items;
    const item = items[order[current]];
    const progress = (current + 1) + " / " + order.length;
    const allFilled = slots.every((s) => s !== null);

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${MODES[modeIndex].title}</span>
        <span class="mc-progress">${progress}</span>
      </header>

      <div class="su-pic">
        <img src="${item.image}" alt="" draggable="false" />
      </div>

      <div class="su-slots" id="su-slots">
        ${slots.map((w, i) =>
          w
            ? `<button type="button" class="su-tile in-slot" data-slot="${i}">${w}</button>`
            : `<span style="width:36px;height:36px;border:1.5px dashed #c7d2fe;border-radius:10px;display:inline-block"></span>`
        ).join("")}
      </div>

      <div class="su-bank">
        ${tiles.map((t) => `
          <button type="button" class="su-tile" data-id="${t.id}" ${t.used || locked ? "disabled" : ""}>${t.word}</button>
        `).join("")}
      </div>

      <div class="su-actions">
        <button type="button" class="mc-btn" id="su-check" ${!allFilled || locked ? "disabled" : ""}>Check</button>
      </div>
    `;

    app.querySelectorAll(".su-bank .su-tile").forEach((btn) => {
      btn.onclick = () => placeTile(+btn.dataset.id);
    });
    app.querySelectorAll(".su-slots .su-tile").forEach((btn) => {
      btn.onclick = () => removeFromSlot(+btn.dataset.slot);
    });
    const checkBtn = document.getElementById("su-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
  }

  render();
})();
