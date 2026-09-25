/* He / She / It – +  −  ? forms (full + short) – beginner friendly */
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
  // Local aliases used by many games
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  // Auto-play on common feedback class tokens (debounced)
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


  const GAME_ID = "starter-1b-he-she-it-forms";

  function saveProgress(stars) {
    function doSave() {
      if (!window.LAStars) return false;
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
        return true;
      } catch (e) {
        return false;
      }
    }
    if (doSave()) return;
    // LAStars not ready yet — try loading script then save
    var existing = document.querySelector("script[data-la-stars], script[src*='la-stars']");
    if (!existing) {
      var s = document.createElement("script");
      s.src = "/learningarcade/la-stars.js";
      s.setAttribute("data-la-stars", "");
      s.onload = function () { doSave(); };
      document.head.appendChild(s);
    } else {
      setTimeout(doSave, 300);
      setTimeout(doSave, 1000);
    }
  }
  const SUBJECTS = [
    { id: "he",  label: "He"  },
    { id: "she", label: "She" },
    { id: "it",  label: "It"  },
  ];

  // One clear form per type for display in options (short forms preferred where natural)
  const FORMS = {
    he: {
      positive: "He is",
      negative: "He isn't",
      question: "Is he?",
    },
    she: {
      positive: "She is",
      negative: "She isn't",
      question: "Is she?",
    },
    it: {
      positive: "It is",
      negative: "It isn't",
      question: "Is it?",
    },
  };

  // Also accept these as correct when identifying
  const ALSO_CORRECT = {
    he: {
      positive: ["He's", "He is"],
      negative: ["He isn't", "He's not", "He is not"],
      question: ["Is he?"],
    },
    she: {
      positive: ["She's", "She is"],
      negative: ["She isn't", "She's not", "She is not"],
      question: ["Is she?"],
    },
    it: {
      positive: ["It's", "It is"],
      negative: ["It isn't", "It's not", "It is not"],
      question: ["Is it?"],
    },
  };

  const TYPES = [
    { id: "positive", symbol: "+", css: "plus" },
    { id: "negative", symbol: "−", css: "minus" },
    { id: "question", symbol: "?", css: "qmark" },
  ];

  const MODES = [
    {
      id: "make",
      title: "Make the form",
      tip: "Look at +  −  ? and choose the correct form.",
    },
    {
      id: "identify",
      title: "What is it?",
      tip: "Is this form +  −  or ?",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let modeIndex = 0;
  let questions = [];
  let index = 0;
  let correctCount = 0;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Make mode: same pronoun only — 3 options = + form, − form, ? form
  function buildMakeQuestions(count) {
    const list = [];
    const combos = [];
    SUBJECTS.forEach((s) => {
      TYPES.forEach((t) => combos.push({ subject: s, type: t }));
    });
    shuffle(combos).slice(0, count).forEach(({ subject, type }) => {
      const correct = FORMS[subject.id][type.id];
      // Always the three forms of THIS subject only
      const options = shuffle([
        FORMS[subject.id].positive,
        FORMS[subject.id].negative,
        FORMS[subject.id].question,
      ]);
      list.push({
        kind: "make",
        subject,
        type,
        correct,
        options,
      });
    });
    return list;
  }

  // Identify mode: show a form → student picks + − or ?
  function buildIdentifyQuestions(count) {
    const list = [];
    const pool = [];
    SUBJECTS.forEach((s) => {
      TYPES.forEach((t) => {
        ALSO_CORRECT[s.id][t.id].forEach((form) => {
          pool.push({ subject: s, type: t, form });
        });
      });
    });
    shuffle(pool).slice(0, count).forEach((item) => {
      list.push({
        kind: "identify",
        subject: item.subject,
        type: item.type,
        form: item.form,
        options: shuffle(TYPES.map((t) => t.symbol)),
        correct: item.type.symbol,
      });
    });
    return list;
  }

  function startMode(mi) {
    modeIndex = mi;
    correctCount = 0;
    index = 0;
    locked = false;
    const count = 9;
    questions = modeIndex === 0
      ? buildMakeQuestions(count)
      : buildIdentifyQuestions(count);
    phase = "play";
    if (window.LAFinish) LAFinish.startTimer();
    render();
  }

  function answer(choice) {
    if (locked || phase !== "play") return;
    const q = questions[index];
    const isCorrect = choice === q.correct;
    locked = true;

    const buttons = app.querySelectorAll(".hs-option");
    buttons.forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.value === q.correct) btn.classList.add("is-correct");
      if (btn.dataset.value === choice && !isCorrect) btn.classList.add("is-wrong");
    });

    if (isCorrect) correctCount += 1;

    setTimeout(() => {
      if (index < questions.length - 1) {
        index += 1;
        locked = false;
        render();
      } else {
        phase = "done";
        render();
      }
    }, isCorrect ? 600 : 850);
  }

  function calcStars() {
    const n = correctCount;
    const total = questions.length;
    if (n >= total - 1) return 3;
    if (n >= Math.floor(total * 0.7)) return 2;
    if (n >= Math.floor(total * 0.4)) return 1;
    return 0;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="hs-topbar">
          <a class="hs-back" href="../" aria-label="Back">←</a>
          <span class="hs-title">He / She / It</span>
          <span class="hs-badge">Forms</span>
        </header>
        <section class="hs-start">
          <div class="hs-hero" aria-hidden="true">👤</div>
          <h1>He is · She is · It is</h1>
          <p class="hs-desc">Practice these forms:</p>
          <div class="hs-symbols-row" aria-hidden="true">
            <span class="hs-chip plus">+</span>
            <span class="hs-chip minus">−</span>
            <span class="hs-chip qmark">?</span>
          </div>
          <div class="hs-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="hs-mode-card" data-mode="${i}">
                <span class="hs-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".hs-mode-card").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mode);
      });
      return;
    }

    if (phase === "done") {
      const stars = calcStars();
      saveProgress(stars);
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: Math.max(questions.length, 1),
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = "menu"; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<section class="hs-done"><h1>Done!</h1><p>${correctCount} / ${questions.length}</p>
        <button type="button" class="hs-btn" id="hs-again">Play again</button></section>`;
      document.getElementById("hs-again").onclick = () => startMode(modeIndex);
      return;
    }

    // play
    const q = questions[index];
    const progress = (index + 1) + " / " + questions.length;
    const mode = MODES[modeIndex];

    let promptHTML = "";
    let optionsHTML = "";

    if (q.kind === "make") {
      promptHTML = `
        <p class="hs-label">Make the form</p>
        <div class="hs-prompt-row">
          <span class="hs-subject">${q.subject.label}</span>
          <span class="hs-symbol hs-${q.type.css}">${q.type.symbol}</span>
        </div>`;
      optionsHTML = q.options.map((opt) => `
        <button type="button" class="hs-option" data-value="${opt}">${opt}</button>
      `).join("");
    } else {
      promptHTML = `
        <p class="hs-label">What is it?</p>
        <div class="hs-form-card">${q.form}</div>`;
      optionsHTML = q.options.map((opt) => {
        const t = TYPES.find((x) => x.symbol === opt);
        return `
          <button type="button" class="hs-option hs-symbol-opt hs-${t.css}" data-value="${opt}">
            <span class="hs-big-symbol">${opt}</span>
          </button>`;
      }).join("");
    }

    app.innerHTML = `
      <header class="hs-topbar">
        <button type="button" class="hs-back" id="hs-back" aria-label="Back">←</button>
        <span class="hs-title">${mode.title}</span>
        <span class="hs-progress">${progress}</span>
      </header>
      <section class="hs-prompt">${promptHTML}</section>
      <div class="hs-options ${q.kind === "identify" ? "hs-options-symbols" : ""}">${optionsHTML}</div>`;

    document.getElementById("hs-back").onclick = () => {
      phase = "menu";
      render();
    };
    app.querySelectorAll(".hs-option").forEach((btn) => {
      btn.onclick = () => answer(btn.dataset.value);
    });
  }

  render();
})();
