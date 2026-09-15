/* Singular ↔ Plural – same layout as Small Things · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-sing-plur-match";

  const ITEMS = [
    { id: "bag",          singular: "a bag",          plural: "bags", },
    { id: "change-purse", singular: "a change purse", plural: "change purses", },
    { id: "watch",        singular: "a watch",        plural: "watches", },
    { id: "tablet",       singular: "a tablet",       plural: "tablets", },
    { id: "passport",     singular: "a passport",     plural: "passports", },
    { id: "coat",         singular: "a coat",         plural: "coats", },
    { id: "book",         singular: "a book",         plural: "books", },
    { id: "pen",          singular: "a pen",          plural: "pens", },
    { id: "key",          singular: "a key",          plural: "keys", },
    { id: "phone",        singular: "a phone",        plural: "phones", },
  ];

  const SETS = [
    ["bag", "change-purse", "watch", "tablet", "passport"],
    ["coat", "book", "pen", "key", "phone"],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let setIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let selectedLeft = null;  // index in leftOrder
  let selectedRight = null; // id
  let matched = {};         // id -> true
  let locked = false;
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



  function correctCount() {
    return Object.keys(matched).filter((k) => matched[k]).length;
  }

  function start() {
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    const ids = SETS[setIndex].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    selectedLeft = null;
    selectedRight = null;
    matched = {};
    locked = false;
    phase = "play";
    render();
  }

  function onLeft(i) {
    if (locked) return;
    const id = leftOrder[i];
    if (matched[id]) return;
    selectedLeft = i;
    tryMatch();
    updateSelection();
  }

  function onRight(id) {
    if (locked || matched[id]) return;
    selectedRight = id;
    tryMatch();
    updateSelection();
  }

  function updateSelection() {
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === selectedLeft && !matched[leftOrder[+el.dataset.i]]);
    });
    app.querySelectorAll(".mc-right-item").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.id === selectedRight && !matched[el.dataset.id]);
    });
    const prog = document.getElementById("mc-progress");
    if (prog) {
      prog.textContent =
        "Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + SETS[setIndex].length;
    }
  }

  function tryMatch() {
    if (selectedLeft == null || !selectedRight) return;
    const leftId = leftOrder[selectedLeft];
    locked = true;
    const ok = leftId === selectedRight;

    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + selectedRight + '"]');

    if (ok) {
      matched[leftId] = true;
      modeCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) {
        rightEl.classList.add("is-correct", "is-used");
        rightEl.disabled = true;
      }
      selectedLeft = null;
      selectedRight = null;
      locked = false;
      updateSelection();

      if (correctCount() === SETS[setIndex].length) {
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 650);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong", "is-selected");
        if (rightEl) rightEl.classList.remove("is-wrong", "is-selected");
        selectedLeft = null;
        selectedRight = null;
        locked = false;
        updateSelection();
      }, 500);
    }
  }

  function calcStars() {
    const total = ITEMS.length;
    if (modeCorrect >= total) return 3;
    if (modeCorrect >= Math.ceil(total * 0.66)) return 2;
    if (modeCorrect >= Math.ceil(total * 0.33)) return 1;
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

  function renderPlay() {
    const left = leftOrder
      .map((id, i) => {
        const c = byId(id);
        const ok = matched[id] ? " is-correct" : "";
        const sel = selectedLeft === i && !matched[id] ? " is-selected" : "";
        return `
        <div class="mc-left-item mc-word-left${ok}${sel}" data-i="${i}">
          <span class="mc-word-label">${c.singular}</span>
        </div>`;
      })
      .join("");

    const right = rightOrder
      .map((id) => {
        const c = byId(id);
        const used = !!matched[id];
        return `
        <button type="button" class="mc-right-item mc-word${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
          <span class="mc-word-label">${c.plural}</span>
        </button>`;
      })
      .join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Singular ↔ Plural · Set ${setIndex + 1}/${SETS.length}</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/${SETS.length} · ${correctCount()}/${SETS[setIndex].length}</span>
      </header>
      <p class="mc-instruction" id="mc-hint">Match singular (left) with plural (right).</p>
      <div class="mc-board is-entering" id="mc-board">
        <div class="mc-col mc-col-left">${left}</div>
        <div class="mc-col mc-col-right">${right}</div>
      </div>
      <div class="mc-actions">
        <button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>
      </div>`;

    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        onLeft(+el.dataset.i);
      });
    });
    app.querySelectorAll(".mc-right-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        onRight(el.dataset.id);
      });
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Singular ↔ Plural</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🔢</div>
          <h1>Singular ↔ Plural</h1>
          <p class="mc-desc">Match singular and plural · 10 pairs (2 sets)</p>
          <button type="button" class="mc-btn" id="sp-start">Start</button>
        </section>`;
      document.getElementById("sp-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Singular ↔ Plural</span>
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
          <p>You matched <strong>${modeCorrect} / ${ITEMS.length}</strong> pairs.</p>
          <button type="button" class="mc-btn" id="sp-again">Play again</button>
        </section>`;
      document.getElementById("sp-again").onclick = () => start();
      return;
    }

    renderPlay();
  }

  render();
})();
