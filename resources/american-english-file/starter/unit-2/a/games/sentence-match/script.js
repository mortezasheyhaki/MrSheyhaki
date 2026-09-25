/* Sentence Match – questions ↔ answers · AEF Starter Unit 2A */
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


  const GAME_ID = "starter-2a-sentence-match";

  const PAIRS = [
    { id: "p1", q: "Excuse me. Are you James?", a: "No, I'm not. I'm Jason." },
    { id: "p2", q: "Where are Alice and Umberto from?", a: "They're Argentinian." },
    { id: "p3", q: "Are you here on vacation?", a: "Yes, we are." },
    { id: "p4", q: "Is Nike English?", a: "No, it isn't. It's American." },
    { id: "p5", q: "Are Pablo and Antonio Mexican?", a: "No, they aren't. They're Spanish." },
    { id: "p6", q: "Are we late?", a: "No, you aren't." },
    { id: "p7", q: "Where are you from?", a: "I'm from Korea." },
    { id: "p8", q: "Is Caroline Canadian?", a: "Yes, she's from Toronto." },
    { id: "p9", q: "Where are you from in Saudi Arabia?", a: "We're from Medina." },
    { id: "p10", q: "Is Kyoto in China?", a: "No, it's in Japan." },
  ];

  const ROUNDS = [
    ["p1", "p2", "p3", "p4", "p5"],
    ["p6", "p7", "p8", "p9", "p10"],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let roundIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let locked = {};
  let matches = {};
  let selectedLeft = null;
  let totalCorrect = 0;
  let roundCorrect = 0;
  let busy = false;

  function byId(id) {
    return PAIRS.find((p) => p.id === id);
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
    return Object.keys(locked).length;
  }

  function allMatched() {
    return correctCount() >= leftOrder.length;
  }

  function updateProgress() {
    const el = document.getElementById("sm-progress");
    if (el) el.textContent = "Round " + (roundIndex + 1) + "/2 · " + correctCount() + "/5";
  }

  function clearSelectionUI() {
    app.querySelectorAll(".sm-left-item.is-selected").forEach((el) => {
      el.classList.remove("is-selected");
    });
  }

  function selectLeft(i) {
    if (busy || locked[i] != null) return;
    selectedLeft = i;
    clearSelectionUI();
    const el = app.querySelector('.sm-left-item[data-i="' + i + '"]');
    if (el) el.classList.add("is-selected");
  }

  function selectRight(pairId) {
    if (busy || selectedLeft === null) return;
    if (Object.values(matches).includes(pairId)) return;

    const leftId = leftOrder[selectedLeft];
    const leftEl = app.querySelector('.sm-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.sm-right-item[data-id="' + pairId + '"]');

    if (leftId === pairId) {
      locked[selectedLeft] = pairId;
      matches[selectedLeft] = pairId;
      roundCorrect++;
      totalCorrect++;
      const matchedIndex = selectedLeft;
      selectedLeft = null;

      if (leftEl) {
        leftEl.classList.remove("is-selected");
        leftEl.classList.add("is-correct");
        leftEl.disabled = true;
      }
      if (rightEl) {
        rightEl.classList.add("is-correct", "is-used");
        rightEl.disabled = true;
      }
      updateProgress();

      if (allMatched()) {
        busy = true;
        setTimeout(() => {
          busy = false;
          if (roundIndex < ROUNDS.length - 1) {
            startRound(roundIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 550);
      }
    } else {
      busy = true;
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong", "is-selected");
        if (rightEl) rightEl.classList.remove("is-wrong");
        selectedLeft = null;
        busy = false;
      }, 650);;
    }
  }

  function startRound(ri) {
    roundIndex = ri;
    const ids = ROUNDS[ri].slice();
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids.slice());
    locked = {};
    matches = {};
    selectedLeft = null;
    roundCorrect = 0;
    busy = false;
    phase = "play";
    render();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    totalCorrect = 0;
    startRound(0);
  }

  function calcStars() {
    const n = totalCorrect;
    if (n >= 9) return 3;
    if (n >= 7) return 2;
    if (n >= 4) return 1;
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

  function leftCell(id, i) {
    const p = byId(id);
    return (
      '<button type="button" class="sm-left-item" data-i="' +
      i +
      '"><span class="sm-text">' +
      p.q +
      "</span></button>"
    );
  }

  function rightCell(id) {
    const p = byId(id);
    return (
      '<button type="button" class="sm-right-item" data-id="' +
      id +
      '"><span class="sm-text">' +
      p.a +
      "</span></button>"
    );
  }

  function bindPlay() {
    app.querySelectorAll(".sm-left-item").forEach((el) => {
      el.onclick = () => selectLeft(+el.dataset.i);
    });
    app.querySelectorAll(".sm-right-item").forEach((el) => {
      el.onclick = () => selectRight(el.dataset.id);
    });
    const reset = document.getElementById("sm-reset");
    if (reset) reset.onclick = () => startRound(roundIndex);
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="sm-topbar">' +
        '<a class="sm-back" href="../" aria-label="Back">←</a>' +
        '<span class="sm-title">Sentence Match</span>' +
        '<span class="sm-badge">2A</span>' +
        "</header>" +
        '<section class="sm-start">' +
        '<div class="sm-hero" aria-hidden="true">🔗</div>' +
        "<h1>Sentence Match</h1>" +
        '<p class="sm-desc">Match each question with the correct answer.<br>2 rounds · 5 pairs each</p>' +
        '<button type="button" class="sm-btn" id="sm-start">Start →</button>' +
        "</section>";
      document.getElementById("sm-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: 10,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = startGame;
      return;
    }

    const left = leftOrder.map((id, i) => leftCell(id, i)).join("");
    const right = rightOrder.map((id) => rightCell(id)).join("");

    app.innerHTML =
      '<header class="sm-topbar">' +
      '<a class="sm-back" href="../" aria-label="Back">←</a>' +
      '<span class="sm-title">Sentence Match</span>' +
      '<span class="sm-progress" id="sm-progress">Round ' +
      (roundIndex + 1) +
      "/2 · " +
      correctCount() +
      "/5</span>" +
      "</header>" +
      '<p class="sm-instruction">Tap a question, then the matching answer</p>' +
      '<div class="sm-board">' +
      '<div class="sm-col sm-col-left">' +
      left +
      "</div>" +
      '<div class="sm-col sm-col-right">' +
      right +
      "</div>" +
      "</div>" +
      '<div class="sm-actions">' +
      '<button type="button" class="sm-btn secondary" id="sm-reset">Reset round</button>' +
      "</div>";

    bindPlay();
  }

  render();
})();
