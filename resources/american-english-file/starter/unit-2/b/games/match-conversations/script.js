/* Match Conversations – 2 sets × 7 pairs – AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-match-conversations";

  const SETS = [
    [
      { id: "1", left: "Hi Lola. This is Paul.", right: "Nice to meet you." },
      { id: "2", left: "How old is Karin?", right: "She's 38." },
      { id: "3", left: "What's your phone number?", right: "It's 978-555-7360." },
      { id: "4", left: "Nice to meet you.", right: "Nice to meet you, too." },
      { id: "5", left: "Is she married?", right: "No, she's single." },
      { id: "6", left: "How are you?", right: "Fine, thanks." },
      { id: "7", left: "See you tomorrow.", right: "Bye!" },
    ],
    [
      { id: "8", left: "What's your name?", right: "My name's Karl." },
      { id: "9", left: "Have a nice day!", right: "Thanks." },
      { id: "10", left: "Where are you from?", right: "I'm from Japan." },
      { id: "11", left: "When's your English class?", right: "On Monday and Friday." },
      { id: "12", left: "Hello!", right: "Hi!" },
      { id: "13", left: "My name is Maribel, not Maria.", right: "Sorry." },
      { id: "14", left: "What day is it today?", right: "It's Thursday." },
    ],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let setIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let selectedLeft = null;
  let locked = {};
  let matches = {};
  let totalCorrect = 0;

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

  function byId(id) {
    return SETS[setIndex].find((x) => x.id === id);
  }

  function startSet(i) {
    setIndex = i;
    const items = SETS[setIndex];
    leftOrder = shuffle(items.map((x) => x.id));
    rightOrder = shuffle(items.map((x) => x.id));
    selectedLeft = null;
    locked = {};
    matches = {};
    phase = "play"
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
  }

  function selectRight(rightId) {
    if (selectedLeft === null) return;
    if (Object.values(matches).indexOf(rightId) !== -1) return;

    const leftId = leftOrder[selectedLeft];
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (leftId === rightId) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      totalCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (leftEl) leftEl.classList.remove("is-selected");
      if (rightEl) {
        rightEl.classList.add("is-correct", "is-used");
        rightEl.disabled = true;
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));

      const progress = document.getElementById("mc-progress");
      if (progress) progress.textContent = "Set " + (setIndex + 1) + "/2 · " + correctCount() + "/7";

      if (correctCount() === SETS[setIndex].length) {
        setTimeout(function () {
          if (setIndex + 1 < SETS.length) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 600);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(function () {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 450);
    }
  }

  function calcStars() {
    const n = totalCorrect;
    if (n >= 14) return 3;
    if (n >= 10) return 2;
    if (n >= 7) return 1;
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
    const item = byId(id);
    const isLocked = !!locked[i];
    const sel = selectedLeft === i ? " is-selected" : "";
    const ok = isLocked ? " is-correct" : "";
    return (
      '<div class="mc-left-item mc-word-left' + ok + sel + '" data-i="' + i + '">' +
      '<span class="mc-word-label">' + item.left + "</span>" +
      "</div>"
    );
  }

  function rightCell(id) {
    const item = byId(id);
    const used = Object.keys(locked).some(function (li) { return matches[li] === id; });
    return (
      '<button type="button" class="mc-right-item mc-word' + (used ? " is-correct is-used" : "") + '" data-id="' + id + '"' + (used ? " disabled" : "") + ">" +
      '<span class="mc-word-label">' + item.right + "</span>" +
      "</button>"
    );
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Conversations</span>' +
        '<span class="mc-badge">2B</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">💬</div>' +
        "<h1>Match Conversations</h1>" +
        '<p class="mc-desc">Match the sentences · 2 sets of 7</p>' +
        '<button type="button" class="mc-btn" id="mc-start">Start</button>' +
        "</section>";
      document.getElementById("mc-start").onclick = function () {
        totalCorrect = 0;
        startSet(0);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: 14,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    // play
    const left = leftOrder.map(function (id, i) { return leftCell(id, i); }).join("");
    const right = rightOrder.map(function (id) { return rightCell(id); }).join("");

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">Match · Set ' + (setIndex + 1) + "/2</span>" +
      '<span class="mc-progress" id="mc-progress">Set ' + (setIndex + 1) + "/2 · " + correctCount() + "/7</span>" +
      "</header>" +
      '<p class="mc-instruction">Tap a sentence on the left, then its match on the right.</p>' +
      '<div class="mc-board">' +
      '<div class="mc-col mc-col-left">' + left + "</div>" +
      '<div class="mc-col mc-col-right">' + right + "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>' +
      "</div>";

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () { selectLeft(+el.dataset.i); };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (btn) {
      btn.onclick = function () { selectRight(btn.dataset.id); };
    });
    document.getElementById("mc-reset").onclick = function () { startSet(setIndex); };
  }

  render();
})();
