/* Possessive Match – Pronouns ↔ Possessives · AEF Starter Unit 4A
   7 pairs · two-column match (style of Souvenirs Match 3B) */
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


  const GAME_ID = "starter-4a-possessive-match";

  const PAIRS = [
    { id: "i",     left: "I",     right: "my" },
    { id: "you",   left: "you",   right: "your" },
    { id: "he",    left: "he",    right: "his" },
    { id: "she",   left: "she",   right: "her" },
    { id: "it",    left: "it",    right: "its" },
    { id: "we",    left: "we",    right: "our" },
    { id: "they",  left: "they",  right: "their" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let leftOrder = [];
  let rightOrder = [];
  let locked = {};      // leftIndex -> true
  let matches = {};     // leftIndex -> rightId
  let selectedLeft = null;
  let correctCount = 0;

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

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    const ids = PAIRS.map((p) => p.id);
    leftOrder = shuffle(ids);
    rightOrder = shuffle(ids);
    locked = {};
    matches = {};
    selectedLeft = null;
    correctCount = 0;
    phase = "play";
    render();
  }

  function spawnMatchFX(leftEl, rightEl) {
    [leftEl, rightEl].forEach((el) => {
      if (!el) return;
      el.classList.add("mc-match-pop");
      for (let i = 0; i < 6; i++) {
        const s = document.createElement("span");
        s.className = "mc-spark";
        const angle = (i / 6) * Math.PI * 2;
        const dist = 24 + Math.random() * 16;
        s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        s.style.setProperty("--delay", (i * 0.02) + "s");
        el.appendChild(s);
        setTimeout(() => s.remove(), 650);
      }
      setTimeout(() => el.classList.remove("mc-match-pop"), 500);
    });
  }

  function selectLeft(i) {
    if (locked[i]) return;
    app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
    selectedLeft = i;
    const el = app.querySelector('.mc-left-item[data-i="' + i + '"]');
    if (el) el.classList.add("is-selected");
    const hint = document.getElementById("mc-hint");
    if (hint) {
      hint.textContent = "Now tap the matching possessive on the right.";
      hint.classList.remove("mc-hint-warn");
    }
  }

  function selectRight(rightId) {
    if (selectedLeft == null) {
      const hint = document.getElementById("mc-hint");
      if (hint) {
        hint.textContent = "Tap a pronoun on the left first.";
        hint.classList.add("mc-hint-warn");
      }
      return;
    }
    const used = Object.keys(locked).some((li) => matches[li] === rightId);
    if (used) return;

    const leftId = leftOrder[selectedLeft];
    const ok = leftId === rightId;
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (ok) { try{sfxCorrect();}catch(e){}
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      correctCount += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (rightEl) rightEl.classList.add("is-correct", "is-used");
      spawnMatchFX(leftEl, rightEl);
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));
      updateProgress();
      if (correctCount === PAIRS.length) {
        setTimeout(() => {
          phase = "done";
          render();
        }, 650);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(() => {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 480);
    }
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) el.textContent = correctCount + " / " + PAIRS.length;
  }

  function calcStars() {
    if (correctCount >= PAIRS.length) return 3;
    if (correctCount >= 5) return 2;
    if (correctCount >= 3) return 1;
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
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Possessive Match</span>' +
        '<span class="mc-badge">4A</span></header>' +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">🔗</div>' +
        "<h1>Possessive Match</h1>" +
        '<p class="mc-desc">Match the pronouns to the possessives.<br>7 pairs</p>' +
        '<button type="button" class="mc-btn" id="mc-start">Start</button></section>';
      document.getElementById("mc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: correctCount,
          total: 10,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Possessive Match</span>' +
        '<span class="mc-badge">Done</span></header>' +
        '<section class="mc-done">' +
        '<div class="mc-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="mc-desc">You matched ' + correctCount + " of " + PAIRS.length + " pairs.</p>" +
        '<button type="button" class="mc-btn" id="mc-again">Play again</button>' +
        '<button type="button" class="mc-btn secondary" id="mc-menu">Back to start</button></section>';
      document.getElementById("mc-again").onclick = startGame;
      document.getElementById("mc-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    // Play phase
    const leftCells = leftOrder
      .map(function (id, i) {
        const p = byId(id);
        const isLocked = !!locked[i];
        const sel = selectedLeft === i ? " is-selected" : "";
        const ok = isLocked ? " is-correct" : "";
        return (
          '<button type="button" class="mc-left-item mc-word' +
          ok +
          sel +
          '" data-i="' +
          i +
          '"' +
          (isLocked ? " disabled" : "") +
          ">" +
          '<span class="mc-word-label">' +
          p.left +
          "</span></button>"
        );
      })
      .join("");

    const rightCells = rightOrder
      .map(function (id) {
        const p = byId(id);
        const used = Object.keys(locked).some(function (li) {
          return matches[li] === id;
        });
        return (
          '<button type="button" class="mc-right-item mc-word' +
          (used ? " is-correct is-used" : "") +
          '" data-id="' +
          id +
          '"' +
          (used ? " disabled" : "") +
          ">" +
          '<span class="mc-word-label">' +
          p.right +
          "</span></button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">Possessive Match</span>' +
      '<span class="mc-progress" id="mc-progress">' +
      correctCount +
      " / " +
      PAIRS.length +
      "</span></header>" +
      '<p class="mc-hint" id="mc-hint">Tap a pronoun on the left, then its possessive on the right.</p>' +
      '<div class="mc-board">' +
      '<div class="mc-col">' +
      '<div class="mc-col-label">Pronouns</div>' +
      leftCells +
      "</div>" +
      '<div class="mc-col">' +
      '<div class="mc-col-label">Possessives</div>' +
      rightCells +
      "</div></div>";

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () {
        if (!el.disabled) selectLeft(+el.dataset.i);
      };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (el) {
      el.onclick = function () {
        if (!el.disabled) selectRight(el.dataset.id);
      };
    });
  }

  render();
})();
