/* Sentence Builder – unscramble be + / − · AEF Starter */
(function () {
  const GAME_ID = "starter-2a-sentence-builder";

  // 5 positive + 5 negative — subject | verb | (n't/not) | complement
  const SENTENCES = [
    { id: "p1", type: "+", words: ["I", "am", "Korean."], answer: "I am Korean." },
    { id: "p2", type: "+", words: ["You", "are", "Brazilian."], answer: "You are Brazilian." },
    { id: "p3", type: "+", words: ["He", "is", "Spanish."], answer: "He is Spanish." },
    { id: "p4", type: "+", words: ["We", "are", "American."], answer: "We are American." },
    { id: "p5", type: "+", words: ["They", "are", "Peruvian."], answer: "They are Peruvian." },
    { id: "n1", type: "−", words: ["I", "am", "not", "Korean."], answer: "I am not Korean." },
    { id: "n2", type: "−", words: ["You", "are", "n't", "Chilean."], answer: "You aren't Chilean." },
    { id: "n3", type: "−", words: ["She", "is", "n't", "Turkish."], answer: "She isn't Turkish." },
    { id: "n4", type: "−", words: ["We", "are", "n't", "American."], answer: "We aren't American." },
    { id: "n5", type: "−", words: ["They", "are", "n't", "Peruvian."], answer: "They aren't Peruvian." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | feedback | done
  let order = [];
  let index = 0;
  let correctCount = 0;
  let bank = [];      // remaining tiles in bank
  let slots = [];     // filled slots (word or null)
  let dragWord = null;
  let dragFrom = null; // { place: "bank"|"slot", i: number }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startGame() {
    order = shuffle(SENTENCES);
    index = 0;
    correctCount = 0;
    startItem();
  }

  function startItem() {
    const s = order[index];
    bank = shuffle(s.words.slice());
    slots = s.words.map(() => null);
    dragWord = null;
    dragFrom = null;
    phase = "play";
    render();
  }

  function builtSentence() {
    if (slots.some((w) => !w)) return null;
    // Attach n't to previous word without a space → aren't / isn't
    let out = "";
    slots.forEach((w) => {
      if (w === "n't") out += "n't";
      else out += (out ? " " : "") + w;
    });
    return out;
  }

  function checkAnswer() {
    const built = builtSentence();
    if (!built) return;
    const s = order[index];
    const ok = built === s.answer;
    if (ok) {
      correctCount += 1;
      phase = "feedback";
      render(true);
      setTimeout(() => {
        if (index < order.length - 1) {
          index += 1;
          startItem();
        } else {
          phase = "done";
          render();
        }
      }, 1000);
    } else {
      // stay on same item – shake + try again
      phase = "tryagain";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    if (n >= 9) return 3;
    if (n >= 7) return 2;
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

  function progressHTML() {
    const total = order.length;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="sb-track"><div class="sb-track-fill" style="width:${fill}%"></div></div>
      <div class="sb-scoreline">
        <span class="sb-score">${correctCount} correct</span>
        <span class="sb-step">${index + 1} / ${total}</span>
      </div>`;
  }

  // —— Drag helpers ——
  function onTilePointerDown(e, place, i) {
    e.preventDefault();
    const word = place === "bank" ? bank[i] : slots[i];
    if (!word) return;
    dragWord = word;
    dragFrom = { place, i };
    let moved = false;
    const startX = (e.touches ? e.touches[0] : e).clientX;
    const startY = (e.touches ? e.touches[0] : e).clientY;

    const tile = e.currentTarget;
    tile.classList.add("is-dragging");

    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      if (Math.abs(pt.clientX - startX) > 8 || Math.abs(pt.clientY - startY) > 8) moved = true;
    };
    const up = (ev) => {
      tile.classList.remove("is-dragging");
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", up);

      const pt = ev.changedTouches ? ev.changedTouches[0] : ev;

      if (!moved) {
        // tap
        if (place === "bank") tapBank(i);
        else tapSlot(i);
      } else {
        const el = document.elementFromPoint(pt.clientX, pt.clientY);
        const slotEl = el && el.closest("[data-slot]");
        const bankEl = el && el.closest(".sb-bank");
        if (slotEl) dropOnSlot(+slotEl.dataset.slot);
        else if (bankEl && dragFrom.place === "slot") returnToBank();
        render();
      }
      dragWord = null;
      dragFrom = null;
    };
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", up);
  }

  function dropOnSlot(slotIndex) {
    if (dragFrom.place === "bank") {
      const existing = slots[slotIndex];
      slots[slotIndex] = bank[dragFrom.i];
      bank.splice(dragFrom.i, 1);
      if (existing) bank.push(existing);
    } else if (dragFrom.place === "slot") {
      // swap
      const tmp = slots[slotIndex];
      slots[slotIndex] = slots[dragFrom.i];
      slots[dragFrom.i] = tmp;
    }
  }

  function returnToBank() {
    if (dragFrom.place !== "slot") return;
    const w = slots[dragFrom.i];
    if (!w) return;
    slots[dragFrom.i] = null;
    bank.push(w);
  }

  function tapBank(i) {
    // place into first empty slot
    const empty = slots.findIndex((s) => !s);
    if (empty === -1) return;
    slots[empty] = bank[i];
    bank.splice(i, 1);
    render();
  }

  function tapSlot(i) {
    if (!slots[i]) return;
    bank.push(slots[i]);
    slots[i] = null;
    render();
  }

  function render(feedbackOk) {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-badge">be</span>
        </header>
        <section class="sb-start">
          <div class="sb-hero" aria-hidden="true">🧩</div>
          <h1>Sentence Builder</h1>
          <p class="sb-desc">Unscramble 10 sentences<br>5 positive (+) · 5 negative (−)</p>
          <p class="sb-tip">Drag words into the boxes — or tap to place / remove</p>
          <button type="button" class="sb-btn" id="sb-start">Start →</button>
        </section>`;
      document.getElementById("sb-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-badge">Done</span>
        </header>
        <section class="sb-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true"><div class="orbit-system"><div class="trophy-float">🏆</div><div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div><div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div><div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div></div></div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You built <strong>${correctCount} / 10</strong> sentences correctly.</p>
          <button type="button" class="sb-btn" id="sb-again">Play again</button>
          <button type="button" class="sb-btn secondary" id="sb-menu">Home</button>
        </section>`;
      document.getElementById("sb-again").onclick = startGame;
      document.getElementById("sb-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    const s = order[index];
    const typeLabel = s.type === "+" ? "Positive (+)" : "Negative (−)";
    const canCheck = slots.every((w) => w);

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-progress">${index + 1} / 10</span>
        </header>
        ${progressHTML()}
        <section class="sb-feedback is-bad sb-shake">
          <div class="sb-fb-icon">❌</div>
          <p class="sb-fb-msg">Try again</p>
          <p class="sb-fb-hint">Check the word order</p>
          <button type="button" class="sb-btn" id="sb-retry">Try again</button>
        </section>`;
      document.getElementById("sb-retry").onclick = () => {
        // reset slots/bank for same sentence
        startItem();
      };
      return;
    }

    if (phase === "feedback") {
      app.innerHTML = `
        <header class="sb-topbar">
          <a class="sb-back" href="../" aria-label="Back">←</a>
          <span class="sb-title">Sentence Builder</span>
          <span class="sb-progress">${index + 1} / 10</span>
        </header>
        ${progressHTML()}
        <section class="sb-feedback is-ok">
          <div class="sb-fb-icon">✅</div>
          <p class="sb-fb-msg">Correct!</p>
          <p class="sb-fb-answer">${s.answer}</p>
        </section>`;
      return;
    }

    // play
    app.innerHTML = `
      <header class="sb-topbar">
        <a class="sb-back" href="../" aria-label="Back">←</a>
        <span class="sb-title">Sentence Builder</span>
        <span class="sb-progress">${index + 1} / 10</span>
      </header>
      ${progressHTML()}
      <section class="sb-play">
        <p class="sb-type">${typeLabel}</p>
        <p class="sb-instruction">Build the sentence</p>
        <div class="sb-slots" id="sb-slots">
          ${slots.map((w, i) => `
            <div class="sb-slot ${w ? "is-filled" : ""}" data-slot="${i}">
              ${w ? `<span class="sb-tile in-slot" data-place="slot" data-i="${i}">${w}</span>` : `<span class="sb-slot-ph">${i + 1}</span>`}
            </div>`).join("")}
        </div>
        <div class="sb-bank" id="sb-bank">
          ${bank.map((w, i) => `
            <span class="sb-tile" data-place="bank" data-i="${i}">${w}</span>`).join("")}
        </div>
        <div class="sb-actions">
          <button type="button" class="sb-btn" id="sb-check" ${canCheck ? "" : "disabled"}>Check</button>
          <button type="button" class="sb-btn secondary" id="sb-reset">Reset</button>
        </div>
      </section>`;

    document.getElementById("sb-check").onclick = checkAnswer;
    document.getElementById("sb-reset").onclick = startItem;

    app.querySelectorAll(".sb-tile").forEach((tile) => {
      const place = tile.dataset.place;
      const i = +tile.dataset.i;
      tile.addEventListener("pointerdown", (e) => onTilePointerDown(e, place, i));
    });
  }

  render();
})();
