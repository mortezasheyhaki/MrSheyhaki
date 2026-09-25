/* Where from? – 3 dialogue gap-fills (be forms) */
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


  const GAME_ID = "starter-1b-where-from-dialogues";

  const PARTS = [
    {
      id: "benedict",
      letter: "1",
      title: "Benedict Cumberbatch",
      tip: "Complete the conversation.",
      image: "img/benedict.jpg",
      imagePos: "center 12%",
      lines: [
        { sp: "A", text: "{{0}} Benedict Cumberbatch from? {{1}} he from the US?" },
        { sp: "B", text: "No, he {{2}}." },
        { sp: "A", text: "{{3}} he from the UK?" },
        { sp: "B", text: "Yes, he {{4}}." },
        { sp: "A", text: "Where in the UK? {{5}} he from Manchester?" },
        { sp: "B", text: "No, he {{6}}. He {{7}} from London." },
      ],
      answers: [
        ["Where's", "Wheres", "Where is"],
        ["Is", "is"],
        ["isn't", "isnt", "is not"],
        ["Is", "is"],
        ["is"],
        ["Is", "is"],
        ["isn't", "isnt", "is not"],
        ["'s", "s", "is"],
      ],
      placeholder: "is / 's / isn't / Where's …",
    },
    {
      id: "food",
      letter: "2",
      title: "Paella & guacamole",
      tip: "Complete the conversation.",
      image: "img/food.jpg",
      imagePos: "center center",
      lines: [
        { sp: "A", text: "{{0}}'s paella from? {{1}} it from Spain?" },
        { sp: "B", text: "Yes, {{2}} is." },
        { sp: "A", text: "{{3}} it from Barcelona?" },
        { sp: "B", text: "No, it {{4}}. {{5}}'s from Valencia." },
        { sp: "A", text: "{{6}} guacamole from Spain, too?" },
        { sp: "B", text: "No, it {{7}}. It {{8}} from Mexico!" },
      ],
      answers: [
        ["Where", "where"],
        ["Is", "is"],
        ["it", "It"],
        ["Is", "is"],
        ["isn't", "isnt", "is not"],
        ["It", "it"],
        ["Is", "is"],
        ["isn't", "isnt", "is not"],
        ["'s", "s", "is"],
      ],
      placeholder: "Where / Is / it / isn't / 's …",
    },
    {
      id: "yao",
      letter: "3",
      title: "Yao Ming",
      tip: "Complete the conversation.",
      image: "img/yao.jpg",
      imagePos: "center 20%",
      lines: [
        { sp: "A", text: "Where {{0}} Yao Ming {{1}}? Is {{2}} from Japan?" },
        { sp: "B", text: "No, he {{3}}." },
        { sp: "A", text: "{{4}} he from China?" },
        { sp: "B", text: "Yes, he {{5}}." },
        { sp: "A", text: "Where in China? {{6}} he from Beijing?" },
        { sp: "B", text: "No, he {{7}}. He {{8}} from Shanghai." },
      ],
      answers: [
        ["is"],
        ["from"],
        ["he", "He"],
        ["isn't", "isnt", "is not"],
        ["Is", "is"],
        ["is"],
        ["Is", "is"],
        ["isn't", "isnt", "is not"],
        ["'s", "s", "is"],
      ],
      placeholder: "is / from / he / isn't / Is / 's …",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let partIndex = 0;
  let blankIndex = 0;
  let filled = [];
  let correctCount = 0;
  let totalBlanks = 0;
  let locked = false;

  function countBlanks(part) {
    return part.answers.length;
  }

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

  function normalize(s) {
    return (s || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function isMatch(input, accepted) {
    const n = normalize(input);
    return accepted.some((a) => normalize(a) === n);
  }

  function startPart(pi) {
    if (window.LAFinish) LAFinish.startTimer();
    partIndex = pi;
    blankIndex = 0;
    filled = [];
    correctCount = 0;
    totalBlanks = countBlanks(PARTS[pi]);
    locked = false;
    phase = "play";
    render();
  }

  function renderLines(part) {
    return part.lines
      .map((line) => {
        let html = line.text;
        html = html.replace(/\{\{(\d+)\}\}/g, (_, n) => {
          const i = +n;
          if (i < filled.length) {
            return `<span class="wd-blank filled">${filled[i]}</span>`;
          }
          if (i === blankIndex) {
            return `<span class="wd-blank active">&nbsp;&nbsp;&nbsp;</span>`;
          }
          return `<span class="wd-blank">&nbsp;&nbsp;&nbsp;</span>`;
        });
        return `<div class="wd-line"><span class="speaker">${line.sp}</span> ${html}</div>`;
      })
      .join("");
  }

  function submitAnswer() {
    if (locked || phase !== "play") return;
    const input = document.getElementById("wd-input");
    if (!input) return;
    const value = input.value;
    if (!normalize(value)) {
      input.classList.add("wd-input-empty");
      setTimeout(() => input.classList.remove("wd-input-empty"), 400);
      return;
    }

    const part = PARTS[partIndex];
    const accepted = part.answers[blankIndex];
    const ok = isMatch(value, accepted);
    locked = true;

    const feedback = document.getElementById("wd-feedback");
    if (ok) {
      correctCount += 1;
      filled.push(accepted[0]);
      if (feedback) {
        feedback.textContent = "✓ Correct!"; try{sfxCorrect();}catch(e){}
        feedback.className = "wd-feedback ok";
      }
      input.classList.add("wd-input-ok");
    } else {
      if (feedback) {
        feedback.textContent = "Try again"; try{sfxWrong();}catch(e){}
        feedback.className = "wd-feedback bad";
      }
      input.classList.add("wd-input-bad");
    }

    setTimeout(() => {
      if (ok) {
        if (blankIndex < part.answers.length - 1) {
          blankIndex += 1;
          locked = false;
          render();
        } else {
          phase = "done";
          render();
        }
      } else {
        locked = false;
        input.classList.remove("wd-input-bad");
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "wd-feedback";
        }
        input.select();
        input.focus();
      }
    }, ok ? 550 : 700);
  }

  function calcStars() {
    if (correctCount >= totalBlanks) return 3;
    if (correctCount >= Math.ceil(totalBlanks * 0.7)) return 2;
    if (correctCount >= Math.ceil(totalBlanks * 0.4)) return 1;
    return 0;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="wd-topbar">
          <a class="wd-back" href="../" aria-label="Back">←</a>
          <span class="wd-title">Where from?</span>
          <span class="wd-badge">1B</span>
        </header>
        <section class="wd-start">
          <div class="wd-hero" aria-hidden="true">🌍</div>
          <h1>Where from?</h1>
          <p class="wd-desc">Complete three conversations with the correct form of <strong>be</strong>.</p>
          <div class="wd-mode-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="wd-mode-card" data-part="${i}">
                <img class="wd-mode-thumb" src="${p.image}" alt="" />
                <div>
                  <strong>${p.letter}. ${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".wd-mode-card").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
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
          total: Math.max(totalBlanks, 1),
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(partIndex),
          onModes: () => { phase = "menu"; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="fb-again">Again</button>`;
      document.getElementById("fb-again").onclick = () => startPart(partIndex);
      return;
    }

    const part = PARTS[partIndex];
    const progress = (blankIndex + 1) + " / " + part.answers.length;

    app.innerHTML = `
      <header class="wd-topbar">
        <button type="button" class="wd-back" id="wd-back" aria-label="Back">←</button>
        <span class="wd-title">${part.title}</span>
        <span class="wd-progress">${progress}</span>
      </header>
      <img class="wd-photo" src="${part.image}" alt="${part.title}" style="object-position:${part.imagePos || "center 18%"}" />
      <section class="wd-prompt">
        <p class="wd-label">${part.tip}</p>
        <div class="wd-lines">${renderLines(part)}</div>
        <p class="wd-hint">Blank ${blankIndex + 1} of ${part.answers.length}</p>
      </section>
      <div class="wd-type-area">
        <input type="text" id="wd-input" class="wd-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="${part.placeholder}" />
        <button type="button" class="wd-btn wd-check" id="wd-check">Check</button>
        <p class="wd-feedback" id="wd-feedback"></p>
      </div>`;

    document.getElementById("wd-back").onclick = () => {
      phase = "menu";
      render();
    };
    const input = document.getElementById("wd-input");
    document.getElementById("wd-check").onclick = submitAnswer;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  render();
})();
