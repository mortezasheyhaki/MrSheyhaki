/* Unscramble · AEF Starter Unit 4A – People / Family */
(function () {
  const GAME_ID = "starter-4a-unscramble";

  const PEOPLE = [
    { word: "a boy", img: "https://cdn.imgurl.ir/uploads/j32676_a_boy.png", audio: "https://cdn.imgurl.ir/uploads/x49928_a_boy.mp3" },
    { word: "boys", img: "https://cdn.imgurl.ir/uploads/p89886_boys.png", audio: null },
    { word: "a girl", img: "https://cdn.imgurl.ir/uploads/x380536_a_girl.png", audio: "https://cdn.imgurl.ir/uploads/u112773_a_girl.mp3" },
    { word: "girls", img: "https://cdn.imgurl.ir/uploads/s214064_girls.png", audio: null },
    { word: "a man", img: "https://cdn.imgurl.ir/uploads/v783842_a_man.png", audio: "https://cdn.imgurl.ir/uploads/s917684_a_man.mp3" },
    { word: "men", img: "https://cdn.imgurl.ir/uploads/y680208_men.png", audio: "https://cdn.imgurl.ir/uploads/h502483_men.mp3" },
    { word: "a woman", img: "https://cdn.imgurl.ir/uploads/h323022_a_woman.png", audio: "https://cdn.imgurl.ir/uploads/v986812_a_woman.mp3" },
    { word: "women", img: "https://cdn.imgurl.ir/uploads/z383_women.png", audio: "https://cdn.imgurl.ir/uploads/m6698_women.mp3" },
    { word: "a child", img: "https://cdn.imgurl.ir/uploads/k129607_a_child.png", audio: "https://cdn.imgurl.ir/uploads/t473361_a_child.mp3" },
    { word: "children", img: "https://cdn.imgurl.ir/uploads/a886217_children.png", audio: "https://cdn.imgurl.ir/uploads/t396967_children.mp3" },
    { word: "friends", img: "https://cdn.imgurl.ir/uploads/f770775_friends.png", audio: "https://cdn.imgurl.ir/uploads/b838575_friends.mp3" },
    { word: "a person", img: "https://cdn.imgurl.ir/uploads/c7535_a_person.png", audio: "https://cdn.imgurl.ir/uploads/v15174_a_person.mp3" },
    { word: "people", img: "https://cdn.imgurl.ir/uploads/p77734_peoe.png", audio: "https://cdn.imgurl.ir/uploads/j853298_peoe.mp3" },
  ];

  const FAMILY = [
    { word: "husband", img: "https://cdn.imgurl.ir/uploads/v05888_husband_and_wife.png", audio: "audio/husband.mp3" },
    { word: "wife", img: "https://cdn.imgurl.ir/uploads/v05888_husband_and_wife.png", audio: "audio/wife.mp3" },
    { word: "mother", img: "https://cdn.imgurl.ir/uploads/w912873_family.png", audio: "audio/mother.mp3" },
    { word: "father", img: "https://cdn.imgurl.ir/uploads/w912873_family.png", audio: "audio/father.mp3" },
    { word: "son", img: "https://cdn.imgurl.ir/uploads/w912873_family.png", audio: "audio/son.mp3" },
    { word: "daughter", img: "https://cdn.imgurl.ir/uploads/w912873_family.png", audio: "audio/daughter.mp3" },
    { word: "brother", img: "https://cdn.imgurl.ir/uploads/o02428_siblings.png", audio: "audio/brother.mp3" },
    { word: "sister", img: "https://cdn.imgurl.ir/uploads/o02428_siblings.png", audio: "audio/sister.mp3" },
    { word: "grandmother", img: "https://cdn.imgurl.ir/uploads/m92485_grandparents.png", audio: "audio/grandmother.mp3" },
    { word: "grandfather", img: "https://cdn.imgurl.ir/uploads/m92485_grandparents.png", audio: "audio/grandfather.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  // Prefer dark if system prefers, or keep light
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  let deck = [];
  let index = 0;
  let currentAudio = null;
  let correctCount = 0;
  let finished = false;

  // Current puzzle state
  let target = "";          // the correct word
  let slots = [];           // array of placed letters (or null)
  let bank = [];            // array of { char, id, used }
  let solved = false;
  let attempts = 0;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = document.getElementById("us-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio(url) {
    if (!url) return;
    stopAudio();
    const a = new Audio(url);
    currentAudio = a;
    const btn = document.getElementById("us-play");
    if (btn) btn.classList.add("playing");
    a.onended = () => { if (btn) btn.classList.remove("playing"); };
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // For letter arrays (strings only), avoid identical order
    if (a.length > 1 && typeof a[0] === "string" && a.join("") === arr.join("")) {
      return shuffle(arr);
    }
    return a;
  }

  function preparePuzzle(item) {
    target = item.word;
    const chars = target.split("");
    slots = chars.map(c => (c === " " ? " " : null)); // spaces are pre-filled and fixed
    const letterChars = chars.filter(c => c !== " ");
    const shuffled = shuffle(letterChars);
    bank = shuffled.map((ch, i) => ({ char: ch, id: i, used: false }));
    solved = false;
    attempts = 0;
  }

  function currentAnswer() {
    return slots.map((s, i) => {
      if (target[i] === " ") return " ";
      return s === null ? "" : s;
    }).join("");
  }

  function isComplete() {
    return slots.every((s, i) => target[i] === " " || s !== null);
  }

  function prev() {
    if (index <= 0) return;
    stopAudio();
    index--;
    preparePuzzle(deck[index]);
    renderCard();
  }

  function next() {
    if (index >= deck.length - 1) {
      if (solved) showFinish();
      return;
    }
    stopAudio();
    index++;
    preparePuzzle(deck[index]);
    renderCard();
  }

  function restart() {
    stopAudio();
    finished = false;
    correctCount = 0;
    deck = shuffle(PEOPLE.concat(FAMILY));
    index = 0;
    preparePuzzle(deck[0]);
    renderCard();
  }

  function showFinish() {
    stopAudio();
    finished = true;
    const total = deck.length;
    const acc = total ? Math.round((correctCount / total) * 100) : 0;
    const title = acc >= 90 ? "Perfect!" : "Well done!";

    try {
      if (window.LAStars) {
        if (typeof window.LAStars.recordPlay === "function") {
          window.LAStars.recordPlay(GAME_ID);
        }
        if (typeof window.LAStars.saveFromAccuracy === "function") {
          window.LAStars.saveFromAccuracy(GAME_ID, acc);
        }
      }
    } catch (_) {}

    app.innerHTML = `
      <header class="us-topbar">
        <a class="us-back-btn" href="../" aria-label="Back">←</a>
        <span class="us-title">Unscramble</span>
        <span class="us-badge">4A</span>
      </header>

      <section class="us-finish">
        <div class="us-finish-card">
          <div class="us-finish-icon" aria-hidden="true">🏆</div>
          <h1 class="us-finish-title">${title}</h1>
          <p class="us-finish-msg">You unscrambled ${correctCount} of ${total} words.</p>
          <div class="us-finish-stats">
            <div class="us-stat">
              <span class="us-stat-label">Cards</span>
              <strong class="us-stat-value">${total}</strong>
            </div>
            <div class="us-stat">
              <span class="us-stat-label">Correct</span>
              <strong class="us-stat-value">${correctCount}</strong>
            </div>
            <div class="us-stat">
              <span class="us-stat-label">Accuracy</span>
              <strong class="us-stat-value">${acc}%</strong>
            </div>
          </div>
          <div class="us-finish-actions">
            <a class="us-finish-btn us-finish-back" href="../" aria-label="Back to games">←</a>
            <button type="button" class="us-finish-btn us-finish-again" id="us-again" aria-label="Play again">↻</button>
          </div>
        </div>
      </section>`;

    document.getElementById("us-again").onclick = restart;
  }

  function placeLetter(tileId) {
    if (solved) return;
    const tile = bank.find(t => t.id === tileId && !t.used);
    if (!tile) return;
    const emptyIdx = slots.findIndex((s, i) => s === null && target[i] !== " ");
    if (emptyIdx === -1) return;
    slots[emptyIdx] = tile.char;
    tile.used = true;
    renderPuzzle();
    if (isComplete()) checkAnswer(true);
  }

  function removeFromSlot(slotIdx) {
    if (solved) return;
    if (target[slotIdx] === " ") return;
    const ch = slots[slotIdx];
    if (ch === null) return;
    slots[slotIdx] = null;
    const tile = bank.find(t => t.char === ch && t.used);
    if (tile) tile.used = false;
    // clear feedback
    const fb = document.getElementById("us-feedback");
    if (fb) { fb.textContent = ""; fb.className = "us-feedback"; }
    document.querySelectorAll(".us-slot").forEach(el => {
      el.classList.remove("correct", "wrong");
    });
    renderPuzzle();
  }

  function clearAll() {
    if (solved) return;
    slots = target.split("").map(c => (c === " " ? " " : null));
    bank.forEach(t => t.used = false);
    const fb = document.getElementById("us-feedback");
    if (fb) { fb.textContent = ""; fb.className = "us-feedback"; }
    document.querySelectorAll(".us-slot").forEach(el => {
      el.classList.remove("correct", "wrong");
    });
    renderPuzzle();
  }

  function checkAnswer(auto = false) {
    if (!isComplete()) {
      if (!auto) {
        const fb = document.getElementById("us-feedback");
        if (fb) {
          fb.textContent = "Fill all the letters first";
          fb.className = "us-feedback bad";
        }
      }
      return;
    }
    attempts++;
    const answer = currentAnswer();
    const correct = answer === target;

    const slotEls = document.querySelectorAll(".us-slot:not(.is-space)");
    if (correct) {
      solved = true;
      correctCount++;
      slotEls.forEach(el => el.classList.add("correct"));
      const fb = document.getElementById("us-feedback");
      if (fb) {
        fb.textContent = "Correct! ✓";
        fb.className = "us-feedback ok";
      }
      // record star if available
      try {
        if (window.LAStars && typeof window.LAStars.recordPlay === "function") {
          window.LAStars.recordPlay(GAME_ID, { accuracy: 1, attempts });
        }
      } catch (_) {}
      // auto-advance or finish
      if (index < deck.length - 1) {
        setTimeout(() => {
          if (solved && index < deck.length - 1) next();
        }, 1100);
      } else {
        setTimeout(() => {
          if (solved) showFinish();
        }, 1200);
      }
    } else {
      slotEls.forEach(el => el.classList.add("wrong"));
      const fb = document.getElementById("us-feedback");
      if (fb) {
        fb.textContent = "Try again";
        fb.className = "us-feedback bad";
      }
      // after shake, allow fixing
      setTimeout(() => {
        slotEls.forEach(el => el.classList.remove("wrong"));
      }, 500);
    }
    // update buttons
    const checkBtn = document.getElementById("us-check");
    const clearBtn = document.getElementById("us-clear");
    if (checkBtn) checkBtn.disabled = solved;
    if (clearBtn) clearBtn.disabled = solved;
  }

  function renderPuzzle() {
    // only re-render the interactive parts
    const slotsEl = document.getElementById("us-slots");
    const bankEl = document.getElementById("us-bank");
    if (!slotsEl || !bankEl) return;

    slotsEl.innerHTML = slots.map((s, i) => {
      if (target[i] === " ") {
        return `<div class="us-slot is-space" aria-hidden="true"></div>`;
      }
      const filled = s !== null;
      return `<div class="us-slot ${filled ? "filled" : ""}" data-slot="${i}" role="button" tabindex="0">${filled ? s : ""}</div>`;
    }).join("");

    bankEl.innerHTML = bank.map(t => {
      const isSpace = t.char === " ";
      return `<button type="button" class="us-tile ${t.used ? "used" : ""} ${isSpace ? "is-space-tile" : ""}" data-id="${t.id}" ${t.used ? "disabled" : ""}>${isSpace ? "␣" : t.char}</button>`;
    }).join("");

    // bind
    slotsEl.querySelectorAll(".us-slot.filled").forEach(el => {
      el.onclick = () => removeFromSlot(+el.dataset.slot);
    });
    bankEl.querySelectorAll(".us-tile:not(.used)").forEach(el => {
      el.onclick = () => placeLetter(+el.dataset.id);
    });
  }

  function renderCard() {
    const item = deck[index];
    const hasAudio = !!item.audio;
    const imgHtml = item.img
      ? `<img class="us-img" src="${item.img}" alt="${item.word}" draggable="false" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`
      : "";
    const placeholder = `<div class="us-img-placeholder" style="${item.img ? "display:none" : ""}"><span>${item.word.charAt(0).toUpperCase()}</span></div>`;

    app.innerHTML = `
      <header class="us-topbar">
        <a class="us-back-btn" href="../" aria-label="Back">←</a>
        <span class="us-title">Unscramble</span>
        <span class="us-progress">${index + 1} / ${deck.length}</span>
      </header>

      <div class="us-stage">
        <div class="us-card">
          <div class="us-img-wrap">
            ${imgHtml}
            ${placeholder}
          </div>
          <button type="button" class="us-play ${hasAudio ? "" : "is-disabled"}" id="us-play" aria-label="Play audio" ${hasAudio ? "" : "disabled"}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>

          <div class="us-slots" id="us-slots"></div>
          <div class="us-bank" id="us-bank"></div>
          <div class="us-feedback" id="us-feedback"></div>
        </div>

        <div class="us-actions">
          <button type="button" class="us-btn" id="us-clear">Clear</button>
          <button type="button" class="us-btn primary" id="us-check">Check</button>
        </div>

        <div class="us-nav">
          <button type="button" class="us-nav-btn" id="us-prev" ${index === 0 ? "disabled" : ""} aria-label="Previous">←</button>
          <button type="button" class="us-nav-btn" id="us-next" ${index >= deck.length - 1 ? "disabled" : ""} aria-label="Next">→</button>
        </div>
      </div>`;

    document.getElementById("us-prev").onclick = prev;
    document.getElementById("us-next").onclick = next;
    document.getElementById("us-clear").onclick = clearAll;
    document.getElementById("us-check").onclick = () => checkAnswer(false);

    const playBtn = document.getElementById("us-play");
    if (playBtn && hasAudio) {
      playBtn.onclick = () => playAudio(item.audio);
    }

    renderPuzzle();
  }

  // Start immediately with all cards (no menu)
  deck = shuffle(PEOPLE.concat(FAMILY));
  index = 0;
  preparePuzzle(deck[0]);
  renderCard();
})();

