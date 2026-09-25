/* Money Flashcards · Practical English 2 – prices & currencies */
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


  const GAME_ID = "starter-pe2-money-flashcards";

  const CARDS = [
    {
      id: "ten-pounds",
      label: "ten pounds",
      image: "https://cdn.imgurl.ir/uploads/w1541_ten-pounds.png",
      audio: "https://cdn.imgurl.ir/uploads/j659692_ten-pounds.mp3",
    },
    {
      id: "fifty-pence",
      label: "fifty pence",
      image: "https://cdn.imgurl.ir/uploads/v883559_fifty-pence.png",
      audio: "https://cdn.imgurl.ir/uploads/l30636_fifty-pence.mp3",
    },
    {
      id: "ten-euros",
      label: "ten euros",
      image: "https://cdn.imgurl.ir/uploads/i744342_ChatGPT_Image_Sep_16_2026_12_08_02_AM.png",
      audio: "https://cdn.imgurl.ir/uploads/o836863_ten-euros.mp3",
    },
    {
      id: "fifty-cents",
      label: "fifty cents",
      image: "https://cdn.imgurl.ir/uploads/u70569_fifty-cents.png",
      audio: "https://cdn.imgurl.ir/uploads/b918280_fifty-cents.mp3",
    },
    {
      id: "ten-dollars",
      label: "ten dollars",
      image: "https://cdn.imgurl.ir/uploads/k75582_ten-dollars.png",
      audio: "https://cdn.imgurl.ir/uploads/z790941_ten-dollars.mp3",
    },
    {
      id: "twenty-five-cents",
      label: "twenty-five cents",
      image: "https://cdn.imgurl.ir/uploads/v185893_twenty-five-cents.png",
      audio: "https://cdn.imgurl.ir/uploads/m058116_twenty-five-cents.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let deck = CARDS.slice();
  let index = 0;
  let flipped = false;
  let currentAudio = null;
  let phase = "play";

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
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playCurrent() {
    const card = deck[index];
    if (!card) return;
    stopAudio();
    const a = new Audio(card.audio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function saveStars() {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, 3);
    }
  }

  function go(delta) {
    const next = index + delta;
    if (next < 0 || next >= deck.length) return;
    stopAudio();
    flipped = false;
    index = next;
    render();
    // Auto-play audio when moving to a new card
    setTimeout(playCurrent, 300);
  }

  function flip() {
    flipped = !flipped;
    const card = app.querySelector(".fc-card");
    if (card) card.classList.toggle("is-flipped", flipped);
    if (flipped) {
      setTimeout(playCurrent, 250);
    } else {
      stopAudio();
    }
  }

  function doShuffle() {
    stopAudio();
    deck = shuffle(CARDS);
    index = 0;
    flipped = false;
    phase = "play";
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function finish() {
    stopAudio();
    saveStars();
    phase = "done";
    render();
  }

  function render() {
    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: CARDS.length,
          total: CARDS.length,
          timeMs: timeMs,
          onAgain: () => {
            deck = CARDS.slice();
            index = 0;
            flipped = false;
            phase = "play";
            if (window.LAFinish) LAFinish.startTimer();
            render();
          },
          onModes: () => { location.href = "../"; },
          backHref: "../",
          save: false,
        });
        return;
      }

      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Money Flashcards</span>
          <span class="mc-progress">PE2</span>
        </header>
        <section class="mc-done">
          <div class="trophy-scene perfect" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star filled">★</span></div>
              <div class="star-orbit"><span class="star filled">★</span></div>
              <div class="star-orbit"><span class="star filled">★</span></div>
            </div>
          </div>
          <h1>Perfect!</h1>
          <p>You reviewed all <strong>${CARDS.length}</strong> money phrases.</p>
          <button type="button" class="mc-btn" id="again">Study again</button>
          <button type="button" class="mc-btn secondary" id="shuffle">Shuffle &amp; restart</button>
        </section>`;
      document.getElementById("again").onclick = () => {
        deck = CARDS.slice();
        index = 0;
        flipped = false;
        phase = "play";
        render();
      };
      document.getElementById("shuffle").onclick = doShuffle;
      return;
    }

    const card = deck[index];

    app.innerHTML = `
      <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Money Flashcards</span>
        </header>
      <div class="game-toolbar">
        <div class="stats-bar">
          <div class="stat"><span class="stat-label">CARD</span><strong>${index + 1} / ${deck.length}</strong></div>
          <div class="stat"><span class="stat-label">LEFT</span><strong>${Math.max(0, deck.length - index - 1)}</strong></div>
        </div>
      </div>

      <div class="fc-stage">
        <p class="fc-hint">Tap the card to flip</p>
        <div class="fc-card${flipped ? " is-flipped" : ""}" id="fc-card">
          <div class="fc-inner">
            <div class="fc-face fc-front">
              <img src="${card.image}" alt="" draggable="false" />
            </div>
            <div class="fc-face fc-back">
              <div class="fc-label">${card.label}</div>
              <button type="button" class="lw-play" id="fc-audio" aria-label="Play audio">
                <span class="wave"></span><span class="wave"></span><span class="wave"></span>
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                <div class="eq"><span></span><span></span><span></span><span></span></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="fc-controls">
        <button type="button" class="fc-nav" id="prev" ${index === 0 ? "disabled" : ""}>←</button>
        <button type="button" class="mc-btn secondary" id="shuffle-btn">Shuffle</button>
        ${index === deck.length - 1
          ? `<button type="button" class="mc-btn" id="finish">Finish</button>`
          : `<button type="button" class="fc-nav" id="next">→</button>`}
      </div>
    `;

    document.getElementById("fc-card").onclick = (e) => {
      if (e.target.closest(".lw-play")) return;
      flip();
    };
    const audioBtn = document.getElementById("fc-audio");
    if (audioBtn) audioBtn.onclick = (e) => { e.stopPropagation(); playCurrent(); };

    document.getElementById("prev").onclick = () => go(-1);
    const nextBtn = document.getElementById("next");
    if (nextBtn) nextBtn.onclick = () => go(1);
    const finishBtn = document.getElementById("finish");
    if (finishBtn) finishBtn.onclick = finish;
    document.getElementById("shuffle-btn").onclick = doShuffle;
  }

  render();
})();
