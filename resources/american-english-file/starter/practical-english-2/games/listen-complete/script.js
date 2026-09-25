/* Listen & Complete · AEF Starter Practical English 2 – Rob's order */
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


  const GAME_ID = "starter-pe2-listen-complete";

  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/a617834_Rob_orders.mp3";

  // Blanks from the conversation
  const BLANKS = [
    {
      id: 1,
      speaker: "Rob",
      before: "Can I have a ",
      after: " sandwich, please?",
      answers: ["cheese"],
      width: "5.5em",
    },
    {
      id: 2,
      speaker: "Rob",
      before: "And a ",
      after: ", please.",
      answers: ["coke", "a coke", "diet coke"],
      width: "5em",
    },
    {
      id: 3,
      speaker: "Rob",
      before: "",
      after: ", thanks.",
      answers: ["no"],
      width: "3.5em",
    },
    {
      id: 4,
      speaker: "Server",
      before: "",
      after: ".",
      answers: [
        "six pounds seventy-five",
        "six pounds 75",
        "£6.75",
        "6.75",
        "6 pounds 75",
        "six pounds seventy five",
      ],
      width: "11em",
    },
    {
      id: 5,
      speaker: "Rob",
      before: "Here you ",
      after: ".",
      answers: ["are"],
      width: "3.5em",
    },
  ];

  // Full dialogue lines for display (with blank placeholders)
  const DIALOGUE = [
    { speaker: "Server", text: "Who’s next?" },
    { speaker: "Rob", blankId: 1 },
    { speaker: "Server", text: "Anything else?" },
    { speaker: "Rob", blankId: 2 },
    { speaker: "Server", text: "Ice and lemon?" },
    { speaker: "Rob", blankId: 3 },
    { speaker: "Server", text: "There you go." },
    { speaker: "Rob", text: "Thanks. How much is it?" },
    { speaker: "Server", blankId: 4 },
    { speaker: "Rob", blankId: 5 },
    { speaker: "Server", text: "Thanks. Here’s your change." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let currentAudio = null;
  let answers = {}; // id -> value
  let checked = false;
  let correctCount = 0;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/£/g, "")
      .replace(/[^a-z0-9\s\.\-]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(id, value) {
    const blank = BLANKS.find((b) => b.id === id);
    if (!blank) return false;
    const n = normalize(value);
    return blank.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio() {
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(AUDIO_URL);
    currentAudio = a;
    const btn = app.querySelector(".lc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function calcStars() {
    if (correctCount >= 5) return 3;
    if (correctCount >= 3) return 2;
    if (correctCount >= 1) return 1;
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

  function checkAnswers() {
    if (checked) return;
    checked = true;
    correctCount = 0;

    BLANKS.forEach((b) => {
      const val = answers[b.id] || "";
      const ok = isCorrect(b.id, val);
      if (ok) correctCount++;
    });

    saveStars();
    phase = "done";
    render();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    answers = {};
    checked = false;
    correctCount = 0;
    phase = "play";
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lc-topbar">
          <a class="lc-back" href="../" aria-label="Back">←</a>
          <span class="lc-title">Listen & Complete</span>
          <span class="lc-badge">PE2</span>
        </header>
        <section class="lc-start">
          <div class="lc-hero" aria-hidden="true">✏️</div>
          <h1>Listen & Complete</h1>
          <p class="lc-desc">Listen to Rob ordering at the café and fill in the missing words.</p>
          <button type="button" class="lc-btn" id="lc-start">Start</button>
        </section>`;
      document.getElementById("lc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: 5,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = calcStars();
      app.innerHTML = `
        <header class="lc-topbar">
          <a class="lc-back" href="../" aria-label="Back">←</a>
          <span class="lc-title">Listen & Complete</span>
          <span class="lc-badge">Done</span>
        </header>
        <section class="lc-done">
          <div class="lc-stars" aria-hidden="true">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Nice work!" : "Keep practicing!"}</h1>
          <p>You got <strong>${correctCount} / 5</strong> correct.</p>
          <div class="lc-answers">
            <p><strong>Answers:</strong></p>
            <ol>
              <li>cheese</li>
              <li>Coke</li>
              <li>No</li>
              <li>Six pounds seventy-five</li>
              <li>are</li>
            </ol>
          </div>
          <button type="button" class="lc-btn" id="lc-again">Play again</button>
          <button type="button" class="lc-btn secondary" id="lc-menu">Back to start</button>
        </section>`;
      document.getElementById("lc-again").onclick = startGame;
      document.getElementById("lc-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play phase
    const linesHtml = DIALOGUE.map((line) => {
      if (line.text) {
        return `
          <div class="lc-line">
            <span class="lc-speaker">${line.speaker}</span>
            <span class="lc-text">${line.text}</span>
          </div>`;
      }
      const blank = BLANKS.find((b) => b.id === line.blankId);
      const val = answers[blank.id] || "";
      return `
        <div class="lc-line">
          <span class="lc-speaker">${line.speaker}</span>
          <span class="lc-text">
            ${blank.before}<input type="text" class="lc-input" data-id="${blank.id}"
              value="${val.replace(/"/g, "&quot;")}"
              style="width:${blank.width}"
              autocomplete="off" spellcheck="false"
              placeholder="${blank.id}">${blank.after}
          </span>
        </div>`;
    }).join("");

    app.innerHTML = `
      <header class="lc-topbar">
          <a class="lc-back" href="../" aria-label="Back">←</a>
          <span class="lc-title">Listen & Complete</span>
        </header>
      <div class="game-toolbar">
        <div class="stats-bar">
          <div class="stat"><span class="stat-label">TASK</span><strong>Complete</strong></div>
          <div class="stat"><span class="stat-label">BLANKS</span><strong>5</strong></div>
        </div>
      </div>

      <div class="lc-content">
        <div class="lc-audio-row">
          <button type="button" class="lc-play" aria-label="Play conversation">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <p class="lc-hint">Listen and complete the conversation</p>
        </div>

        <div class="lc-dialogue">
          ${linesHtml}
        </div>

        <button type="button" class="lc-btn" id="lc-check">Check answers</button>
      </div>`;

    app.querySelector(".lc-play").onclick = playAudio;
    app.querySelectorAll(".lc-input").forEach((input) => {
      input.oninput = () => {
        answers[+input.dataset.id] = input.value;
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkAnswers();
        }
      };
    });
    document.getElementById("lc-check").onclick = checkAnswers;
  }

  render();
})();
