/* Travel Match – 3 modes × 2 sets of 6 – AEF Starter Unit 12A */
(function () {
  const GAME_ID = "starter-12a-travel-match";

  const ITEMS = [
    { id: "leave-house", label: "leave the house", audio: "audio/leave-the-house.mp3", image: "https://cdn.imgurl.ir/uploads/g04403_leave_the_house.png" },
    { id: "pack-suitcase", label: "pack a suitcase", audio: "audio/pack-a-suitcase.mp3", image: "https://cdn.imgurl.ir/uploads/p39229_pack_a_siuitcase.png" },
    { id: "rent-car", label: "rent a car", audio: "audio/rent-a-car.mp3", image: "https://cdn.imgurl.ir/uploads/p927759_rent_a_car.png" },
    { id: "stay-hotel", label: "stay in a hotel", audio: "audio/stay-in-a-hotel.mp3", image: "https://cdn.imgurl.ir/uploads/e87389_stay_in_a_hotel.png" },
    { id: "wait-flight", label: "wait for a flight", audio: "audio/wait-for-a-flight.mp3", image: "https://cdn.imgurl.ir/uploads/v22740_wait_for_a_flight.png" },
    { id: "wear-sunglasses", label: "wear sunglasses", audio: "audio/wear-sunglasses.mp3", image: "https://cdn.imgurl.ir/uploads/j600481_wear_sungles.png" },
    { id: "arrive-hotel", label: "arrive at a hotel", audio: "audio/arrive-at-a-hotel.mp3", image: "https://cdn.imgurl.ir/uploads/c880373_arrive_at_a_hotel.png" },
    { id: "book-tickets", label: "book tickets", audio: "audio/book-tickets.mp3", image: "https://cdn.imgurl.ir/uploads/g8412_book_tickets.png" },
    { id: "buy-presents", label: "buy presents", audio: "audio/buy-presents.mp3", image: "https://cdn.imgurl.ir/uploads/h82868_buy_presents.png" },
    { id: "call-home", label: "call home", audio: "audio/call-home.mp3", image: "https://cdn.imgurl.ir/uploads/t810563_call_home.png" },
    { id: "carry-suitcase", label: "carry a suitcase", audio: "audio/carry-a-suitcase.mp3", image: "https://cdn.imgurl.ir/uploads/u551356_carry_a_suitcase.png" },
    { id: "get-taxi", label: "get a taxi", audio: "audio/get-a-taxi.mp3", image: "https://cdn.imgurl.ir/uploads/m22232_get_in_a_taxi.png" },
  ];

  // 2 sets of 6
  const SETS = [
    ["leave-house", "pack-suitcase", "rent-car", "stay-hotel", "wait-flight", "wear-sunglasses"],
    ["arrive-hotel", "book-tickets", "buy-presents", "call-home", "carry-suitcase", "get-taxi"],
  ];

  const MODES = [
    { id: "pic-word", title: "Pictures → Words", left: "picture", right: "word", tip: "Match each picture to the phrase." },
    { id: "audio-word", title: "Audio → Words", left: "audio", right: "word", tip: "Listen, then match to the phrase." },
    { id: "audio-pic", title: "Audio → Pictures", left: "audio", right: "picture", tip: "Listen, then match to the picture." },
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
  let audioCtx = null;

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

  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {}
    }
    return audioCtx;
  }

  function sfxTone(freq, dur, type, vol) {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = vol || 0.12;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur + 0.02);
    } catch (_) {}
  }

  function sfxCorrect() {
    sfxTone(523.25, 0.08, "sine", 0.1);
    setTimeout(() => sfxTone(659.25, 0.1, "sine", 0.1), 70);
    setTimeout(() => sfxTone(783.99, 0.16, "sine", 0.12), 140);
  }

  function sfxWrong() {
    sfxTone(220, 0.12, "triangle", 0.1);
    setTimeout(() => sfxTone(165, 0.18, "triangle", 0.1), 90);
  }

  function sfxWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => setTimeout(() => sfxTone(f, 0.2, "sine", 0.11), i * 120));
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
    if (!c) return;
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

  const PARTICLE_COLORS = ["#34d399", "#6366f1", "#fbbf24", "#38bdf8", "#a78bfa", "#f472b6", "#fde68a"];

  function spawnParticles(el, opts) {
    if (!el) return;
    const {
      count = 12,
      kind = "spark",
      spread = 48,
      duration = 700,
    } = opts || {};
    const rect = el.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const layer = document.createElement("div");
    layer.className = "mc-particle-layer";
    document.body.appendChild(layer);

    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "mc-particle mc-particle--" + kind;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = spread * (0.45 + Math.random() * 0.7);
      const size = kind === "star" ? 10 + Math.random() * 8 : kind === "ring" ? 14 + Math.random() * 10 : 5 + Math.random() * 7;
      p.style.left = originX + "px";
      p.style.top = originY + "px";
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", Math.sin(angle) * dist - (kind === "star" ? 12 : 0) + "px");
      p.style.setProperty("--size", size + "px");
      p.style.setProperty("--rot", (Math.random() * 360) + "deg");
      p.style.setProperty("--delay", (Math.random() * 0.08) + "s");
      p.style.setProperty("--dur", (0.45 + Math.random() * 0.35) + "s");
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      if (kind === "star") p.textContent = "✦";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), duration + 200);
  }

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach((el) => {
      if (!el) return;
      el.classList.add("mc-match-pop");
      // local sparks on the tile
      for (let i = 0; i < 10; i++) {
        const s = document.createElement("span");
        s.className = "mc-spark";
        const angle = (i / 10) * Math.PI * 2;
        const dist = 32 + Math.random() * 22;
        s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        s.style.setProperty("--delay", (i * 0.015) + "s");
        el.appendChild(s);
        setTimeout(() => s.remove(), 750);
      }
      // floating stars + rings from tile center
      spawnParticles(el, { count: 8, kind: "star", spread: 70, duration: 900 });
      spawnParticles(el, { count: 6, kind: "ring", spread: 40, duration: 650 });
      setTimeout(() => el.classList.remove("mc-match-pop"), 550);
    });
    const flash = document.createElement("div");
    flash.className = "mc-match-flash";
    app.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function spawnWrongFX(el) {
    if (!el) return;
    spawnParticles(el, { count: 7, kind: "dot", spread: 36, duration: 500 });
    el.classList.add("mc-shake");
    setTimeout(() => el.classList.remove("mc-shake"), 400);
  }

  function playItemAudio(itemId) {
    const c = byId(itemId);
    if (!c) return;
    stopAudio();
    const a = new Audio(c.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() === SETS[setIndex].length;
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
    const mode = MODES[modeIndex];
    if (mode.left === "audio") playAudioFor(i);
  }

  function selectRight(rightId) {
    if (selectedLeft === null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = MODES[modeIndex].left === "audio"
          ? "Play a sound first, then tap a match."
          : "Tap an item on the left first.";
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
      sfxCorrect();
      if (MODES[modeIndex].id === "pic-word") {
        playItemAudio(leftId);
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (allMatched()) {
        setTimeout(() => {
          if (setIndex < SETS.length - 1) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            sfxWin();
            render();
          }
        }, 700);
      }
    } else {
      sfxWrong();
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      spawnWrongFX(leftEl);
      spawnWrongFX(rightEl);
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 450);
    }
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) el.textContent = "Set " + (setIndex + 1) + "/" + SETS.length + " · " + correctCount() + "/" + SETS[setIndex].length;
  }

  function calcStars() {
    const totalPairs = SETS.reduce((sum, s) => sum + s.length, 0);
    const n = modeCorrect;
    if (n >= totalPairs - 1) return 3;
    if (n >= Math.ceil(totalPairs * 0.66)) return 2;
    if (n >= Math.ceil(totalPairs * 0.33)) return 1;
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
    return `
      <div class="mc-left-item mc-pic-cell${ok}${sel}" data-i="${i}">
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
      </div>`;
  }

  function rightCell(id, kind) {
    const c = byId(id);
    const used = Object.keys(locked).some((li) => matches[li] === id);
    if (kind === "word") {
      return `
        <button type="button" class="mc-right-item mc-word${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
          <span class="mc-word-label">${c.label}</span>
        </button>`;
    }
    return `
      <button type="button" class="mc-right-item mc-pic-btn${used ? " is-correct is-used" : ""}" data-id="${id}" ${used ? "disabled" : ""}>
        <img class="mc-thumb" src="${c.image}" alt="${c.label}" draggable="false">
      </button>`;
  }

  function spawnConfetti() {
    const wrap = document.createElement("div");
    wrap.className = "mc-confetti";
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#38bdf8", "#a78bfa", "#fde68a", "#f472b6"];
    for (let i = 0; i < 56; i++) {
      const p = document.createElement("i");
      const shape = i % 5;
      p.className = shape === 0 ? "is-star" : shape === 1 ? "is-rect" : shape === 2 ? "is-circle" : "is-strip";
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.9 + "s";
      p.style.animationDuration = 1.5 + Math.random() * 1.4 + "s";
      p.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      p.style.setProperty("--spin", (360 + Math.random() * 720) + "deg");
      if (shape === 0) p.textContent = "✦";
      wrap.appendChild(p);
    }
    // center burst
    const burst = document.createElement("div");
    burst.className = "mc-finish-burst";
    wrap.appendChild(burst);
    app.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3200);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Travel Match</span>
          <span class="mc-badge">12A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">✈️</div>
          <h1>Travel Match</h1>
          <p class="mc-desc">Choose a mode · 12 phrases (2 sets of 6)</p>
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
      const totalPairs = SETS.reduce((sum, s) => sum + s.length, 0);
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Travel Match</span>
          <span class="mc-badge">Done</span>
        </header>
        <section class="mc-done mc-done-anim">
          <div class="mc-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="mc-stars" aria-hidden="true">
            <span class="${stars >= 1 ? "lit" : ""}">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="${stars >= 2 ? "lit" : ""}">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="${stars >= 3 ? "lit" : ""}">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${m.title}</strong><br>You matched <strong>${modeCorrect} / ${totalPairs}</strong>.</p>
          <button type="button" class="mc-btn" id="mc-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="mc-menu">All modes</button>
        </section>`;
      spawnConfetti();
      document.getElementById("mc-again").onclick = () => startMode(modeIndex);
      document.getElementById("mc-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const mode = MODES[modeIndex];
    const left = leftOrder.map((id, i) => leftCell(id, i, mode.left)).join("");
    const right = rightOrder.map((id) => rightCell(id, mode.right)).join("");

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
      };
    });
    app.querySelectorAll(".mc-right-item").forEach((btn) => {
      btn.onclick = () => selectRight(btn.dataset.id);
    });
    document.getElementById("mc-reset").onclick = () => startSet(setIndex);
  }

  render();
})();
