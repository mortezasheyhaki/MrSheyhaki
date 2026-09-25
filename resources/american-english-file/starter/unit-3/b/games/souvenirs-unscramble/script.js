/* Souvenirs Unscramble – picture + letter tiles · AEF Starter Unit 3B */
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


  const GAME_ID = "starter-3b-souvenirs-unscramble";

  // word = letters to scramble (no article)
  const ITEMS = [
    { id: "cap",        word: "cap",        label: "a cap",        audio: "../../media/audio/cap.mp3",        image: "../../media/images/cap.png" },
    { id: "tshirt",     word: "tshirt",     label: "a T-shirt",    audio: "../../media/audio/t-shirt.mp3",    image: "../../media/images/t-shirt.png" },
    { id: "toy",        word: "toy",        label: "a toy",        audio: "../../media/audio/toy.mp3",        image: "../../media/images/toy.png" },
    { id: "sunglasses", word: "sunglasses", label: "sunglasses",   audio: "../../media/audio/sunglasses.mp3", image: "../../media/images/sunglasses.png" },
    { id: "mug",        word: "mug",        label: "a mug",        audio: "../../media/audio/mug.mp3",        image: "../../media/images/mug.png" },
    { id: "keychain",   word: "keychain",   label: "a keychain",   audio: "../../media/audio/keychain.mp3",   image: "../../media/images/keychain.png" },
    { id: "postcard",   word: "postcard",   label: "a postcard",   audio: "../../media/audio/postcard.mp3",   image: "../../media/images/postcard.png" },
    { id: "map",        word: "map",        label: "a map",        audio: "../../media/audio/map.mp3",        image: "../../media/images/map.png" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let order = [];
  let current = 0;
  let correctCount = 0;
  let tiles = [];       // { letter, id, used }
  let slots = [];       // letter or null
  let locked = false;
  let currentAudio = null;

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
  }

  function playAudio(src) {
    stopAudio();
    if (!src) return;
    const a = new Audio(src);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function scrambleWord(word) {
    let letters = word.toUpperCase().split("");
    // ensure not already in order
    let scrambled = shuffle(letters);
    let tries = 0;
    while (scrambled.join("") === word.toUpperCase() && letters.length > 1 && tries < 20) {
      scrambled = shuffle(letters);
      tries++;
    }
    return scrambled.map((letter, i) => ({ letter, id: i, used: false }));
  }

  function start() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map((x) => x.id));
    current = 0;
    correctCount = 0;
    locked = false;
    phase = "play";
    setupItem();
    render();
  }

  function setupItem() {
    const item = byId(order[current]);
    tiles = scrambleWord(item.word);
    slots = new Array(item.word.length).fill(null);
    locked = false;
  }

  function placeTile(tileId) {
    if (locked) return;
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || tile.used) return;
    const empty = slots.findIndex((s) => s === null);
    if (empty === -1) return;
    slots[empty] = tile.letter;
    tile.used = true;
    renderPlay(false);
    // auto-check when full
    if (slots.every((s) => s !== null)) {
      checkAnswer();
    }
  }

  function removeSlot(index) {
    if (locked) return;
    const letter = slots[index];
    if (letter == null) return;
    slots[index] = null;
    // free one matching unused tile (first used with that letter)
    const tile = tiles.find((t) => t.used && t.letter === letter);
    if (tile) tile.used = false;
    renderPlay(false);
  }

  function clearAll() {
    if (locked) return;
    slots = slots.map(() => null);
    tiles.forEach((t) => { t.used = false; });
    renderPlay(false);
  }

  function checkAnswer() {
    if (locked) return;
    const item = byId(order[current]);
    const built = slots.join("").toLowerCase();
    const ok = built === item.word.toLowerCase();
    locked = true;

    if (ok) { try{sfxCorrect();}catch(e){}
      correctCount += 1;
      // mark slots correct
      renderPlay(true, true);
      // play audio after building the word
      setTimeout(() => playAudio(item.audio), 250);
      setTimeout(() => {
        if (current < order.length - 1) {
          current += 1;
          setupItem();
          render();
        } else {
          phase = "done";
          render();
        }
      }, 1400);
    } else {
      renderPlay(true, false);
      setTimeout(() => {
        // reset slots for retry
        slots = slots.map(() => null);
        tiles.forEach((t) => { t.used = false; });
        locked = false;
        renderPlay(false);
      }, 900);
    }
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

  function renderPlay(showResult, isCorrect) {
    const item = byId(order[current]);
    const progress = (current + 1) + " / " + order.length;

    const slotHtml = slots.map((letter, i) => {
      let cls = "us-slot";
      if (showResult && letter != null) cls += isCorrect ? " is-correct" : " is-wrong";
      if (letter != null) cls += " is-filled";
      return `<button type="button" class="${cls}" data-slot="${i}">${letter || ""}</button>`;
    }).join("");

    const tileHtml = tiles.map((t) => {
      const cls = "us-tile" + (t.used ? " is-used" : "");
      return `<button type="button" class="${cls}" data-tile="${t.id}" ${t.used || locked ? "disabled" : ""}>${t.letter}</button>`;
    }).join("");

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Unscramble</span>
        <span class="mc-progress">${progress}</span>
      </header>

      <div class="us-pic-wrap">
        <img src="${item.image}" alt="souvenir" class="us-pic" draggable="false" />
      </div>

      <p class="us-hint" id="us-hint">${showResult ? (isCorrect ? "Correct!" : "Try again") : "Unscramble the letters"}</p>

      <div class="us-slots">${slotHtml}</div>

      <div class="us-tiles">${tileHtml}</div>

      <div class="us-actions">
        <button type="button" class="mc-btn secondary" id="us-clear" ${locked ? "disabled" : ""}>Clear</button>
      </div>
    `;

    const hint = document.getElementById("us-hint");
    if (showResult) {
      hint.classList.toggle("us-ok", !!isCorrect);
      hint.classList.toggle("us-err", !isCorrect);
    }

    app.querySelectorAll(".us-tile:not([disabled])").forEach((btn) => {
      btn.onclick = () => placeTile(+btn.dataset.tile);
    });
    app.querySelectorAll(".us-slot.is-filled").forEach((btn) => {
      btn.onclick = () => removeSlot(+btn.dataset.slot);
    });
    const clearBtn = document.getElementById("us-clear");
    if (clearBtn) clearBtn.onclick = () => clearAll();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Unscramble</span>
          <span class="mc-badge">3B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">🔤</div>
          <h1>Unscramble</h1>
          <p class="mc-desc">Look at the picture · put the letters in order · 8 souvenirs</p>
          <button type="button" class="mc-btn" id="us-start">Start</button>
        </section>`;
      document.getElementById("us-start").onclick = () => start();
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
          onAgain: () => start(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Unscramble</span>
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
          <p>You unscrambled <strong>${correctCount} / ${ITEMS.length}</strong> words.</p>
          <button type="button" class="mc-btn" id="us-again">Play again</button>
          <a href="../" class="mc-btn secondary" style="display:inline-block;text-decoration:none;margin-top:8px;">Back to games</a>
        </section>`;
      document.getElementById("us-again").onclick = () => start();
      return;
    }

    renderPlay(false);
  }

  render();
})();
