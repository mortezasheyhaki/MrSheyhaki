/* Souvenirs Listen & Choose – fixed grid, check off matches · AEF Starter Unit 3B */
(function () {

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-3b-souvenirs-listen-choose";

  const ITEMS = [
    { id: "cap",        label: "a cap",        short: "cap",        audio: "../../media/audio/cap.mp3",        image: "../../media/images/cap.png" },
    { id: "t-shirt",    label: "a T-shirt",    short: "T-shirt",    audio: "../../media/audio/t-shirt.mp3",    image: "../../media/images/t-shirt.png" },
    { id: "toy",        label: "a toy",        short: "toy",        audio: "../../media/audio/toy.mp3",        image: "../../media/images/toy.png" },
    { id: "sunglasses", label: "sunglasses",   short: "sunglasses", audio: "../../media/audio/sunglasses.mp3", image: "../../media/images/sunglasses.png" },
    { id: "mug",        label: "a mug",        short: "mug",        audio: "../../media/audio/mug.mp3",        image: "../../media/images/mug.png" },
    { id: "keychain",   label: "a keychain",   short: "keychain",   audio: "../../media/audio/keychain.mp3",   image: "../../media/images/keychain.png" },
    { id: "postcard",   label: "a postcard",   short: "postcard",   audio: "../../media/audio/postcard.mp3",   image: "../../media/images/postcard.png" },
    { id: "map",        label: "a map",        short: "map",        audio: "../../media/audio/map.mp3",        image: "../../media/images/map.png" },
  ];

  const MODES = [
    { id: "pictures", title: "Pictures", tip: "Which picture matches the sound?", question: "Which picture matches the sound?" },
    { id: "words",    title: "Words",    tip: "Which word matches the sound?",    question: "Which word matches the sound?" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu";
  let order = [];          // order of sounds to play
  let gridOrder = [];      // fixed order of cards on the board
  let current = 0;
  let correctCount = 0;
  let locked = false;
  let currentAudio = null;
  let matched = {};        // id -> true once correctly matched
  let mutedWrong = {};     // id -> true for wrong picks this sound (cleared on next sound)

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function byId(id) {
    return ITEMS.find((x) => x.id === id);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".lc-play");
    if (btn) btn.classList.remove("playing");
  }

  function playCurrent() {
    const id = order[current];
    const item = byId(id);
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    order = shuffle(ITEMS.map((x) => x.id));
    gridOrder = shuffle(ITEMS.map((x) => x.id)); // fixed board for the whole run
    current = 0;
    correctCount = 0;
    matched = {};
    mutedWrong = {};
    locked = false;
    phase = "play";
    render();
    setTimeout(playCurrent, 400);
  }

  function pick(id) {
    if (locked || phase !== "play") return;
    if (matched[id]) return; // already checked off
    if (mutedWrong[id]) return;

    locked = true;
    const correctId = order[current];
    const ok = id === correctId;

    if (ok) { try{sfxCorrect();}catch(e){}
      correctCount += 1;
      matched[id] = true;
      mutedWrong = {}; // clear wrongs for next sound
      updateCards();
      const hint = app.querySelector(".lc-hint");
      if (hint) { hint.textContent = "Correct!"; hint.classList.add("lc-ok"); hint.classList.remove("lc-err"); }

      setTimeout(() => {
        if (current < order.length - 1) {
          current += 1;
          locked = false;
          mutedWrong = {};
          updatePromptOnly();
          setTimeout(playCurrent, 300);
        } else {
          phase = "done";
          render();
        }
      }, 700);
    } else {
      mutedWrong[id] = true;
      updateCards();
      const hint = app.querySelector(".lc-hint");
      if (hint) { hint.textContent = "Try Again"; hint.classList.add("lc-err"); hint.classList.remove("lc-ok"); }
      setTimeout(() => {
        const el = app.querySelector('.lc-card[data-id="' + id + '"]');
        if (el) el.classList.remove("is-wrong");
        if (hint) {
          hint.textContent = "Tap a " + (MODES[modeIndex].id === "pictures" ? "picture" : "word") + " after you listen.";
          hint.classList.remove("lc-err");
        }
        locked = false;
      }, 800);
    }
  }

  function updateCards() {
    app.querySelectorAll(".lc-card").forEach((el) => {
      const id = el.dataset.id;
      el.classList.remove("is-correct", "is-wrong", "is-disabled", "is-matched");
      if (matched[id]) {
        el.classList.add("is-matched", "is-disabled");
      } else if (mutedWrong[id]) {
        el.classList.add("is-wrong", "is-disabled");
      }
    });
  }

  function updatePromptOnly() {
    const progress = app.querySelector(".mc-title");
    if (progress) progress.textContent = "Sound " + (current + 1) + " of " + order.length;
    const stars = app.querySelector(".mc-progress");
    if (stars) stars.textContent = correctCount + " ★";
    const hint = app.querySelector(".lc-hint");
    if (hint) {
      hint.textContent = "Tap a " + (MODES[modeIndex].id === "pictures" ? "picture" : "word") + " after you listen.";
      hint.classList.remove("lc-ok", "lc-err");
    }
    updateCards();
  }

  function calcStars() {
    const total = ITEMS.length;
    if (correctCount >= total) return 3;
    if (correctCount >= Math.ceil(total * 0.75)) return 2;
    if (correctCount >= Math.ceil(total * 0.5)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen &amp; Choose</span>
          <span class="mc-badge">3B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🎧</div>
          <h1>Listen &amp; Choose</h1>
          <p class="mc-desc">Hear the word · pick the matching picture or word · 8 souvenirs</p>
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
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      const m = MODES[modeIndex];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen &amp; Choose</span>
          <span class="mc-badge">3B</span>
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
          <p><strong>${m.title}</strong><br>You got <strong>${correctCount} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="mc-btn" id="mc-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="mc-menu">All modes</button>
        </section>`;
      document.getElementById("mc-again").onclick = () => startMode(modeIndex);
      document.getElementById("mc-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play – fixed grid for whole run
    const mode = MODES[modeIndex];
    const progress = (current + 1) + " of " + order.length;

    const cards = gridOrder.map((id) => {
      const item = byId(id);
      const isMatched = !!matched[id];
      const isWrong = !!mutedWrong[id];
      let cls = "lc-card";
      if (mode.id === "pictures") cls += " lc-pic";
      else cls += " lc-word";
      if (isMatched) cls += " is-matched is-disabled";
      if (isWrong) cls += " is-wrong is-disabled";

      if (mode.id === "pictures") {
        return `
          <button type="button" class="${cls}" data-id="${id}">
            <img src="${item.image}" alt="${item.label}" draggable="false" />
            <span class="lc-check" aria-hidden="true">✓</span>
          </button>`;
      }
      return `
        <button type="button" class="${cls}" data-id="${id}">
          <span class="lc-word-text">${item.label}</span>
          <span class="lc-check" aria-hidden="true">✓</span>
        </button>`;
    }).join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <button type="button" class="mc-icon-btn" id="lc-replay" aria-label="Replay">↻</button>
        <span class="mc-title">Sound ${progress}</span>
        <span class="mc-progress">${correctCount} ★</span>
      </header>

      <section class="lc-prompt">
        <p class="lc-label">LISTEN CAREFULLY</p>
        <h2 class="lc-question">${mode.question}</h2>
        <button type="button" class="lc-play" id="lc-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <p class="lc-hint">Tap a ${mode.id === "pictures" ? "picture" : "word"} after you listen.</p>
      </section>

      <div class="lc-grid">${cards}</div>
    `;

    document.getElementById("lc-play").onclick = () => playCurrent();
    document.getElementById("lc-replay").onclick = () => playCurrent();
    app.querySelectorAll(".lc-card").forEach((btn) => {
      btn.onclick = () => pick(btn.dataset.id);
    });
  }

  render();
})();
