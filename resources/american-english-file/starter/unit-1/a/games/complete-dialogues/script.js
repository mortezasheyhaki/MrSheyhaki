/* Dialogue Practice – Starter Unit 1A */
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


  const GAME_ID = "starter-1a-complete-dialogues";
  const ITEMS = [
  {
    "id": 1,
    "lines": [
      {
        "speaker": "A",
        "text": "______ I in room 8?",
        "blanks": [
          "Am"
        ]
      },
      {
        "speaker": "B",
        "text": "No, you ______. You're in room 6.",
        "blanks": [
          "aren't"
        ]
      }
    ],
    "accept": {
      "0": [
        "Am"
      ],
      "1": [
        "aren't",
        "are not"
      ]
    }
  },
  {
    "id": 2,
    "lines": [
      {
        "speaker": "A",
        "text": "______ you in room 4?",
        "blanks": [
          "Are"
        ]
      },
      {
        "speaker": "B",
        "text": "No, I ______. I'm in room 5.",
        "blanks": [
          "'m not"
        ]
      }
    ],
    "accept": {
      "0": [
        "Are"
      ],
      "1": [
        "'m not",
        "am not",
        "I\u2019m not",
        "I'm not"
      ]
    }
  },
  {
    "id": 3,
    "lines": [
      {
        "speaker": "A",
        "text": "______ you Henry?",
        "blanks": [
          "Are"
        ]
      },
      {
        "speaker": "B",
        "text": "Yes, I ______. Nice to meet you!",
        "blanks": [
          "am"
        ]
      }
    ],
    "accept": {
      "0": [
        "Are"
      ],
      "1": [
        "am"
      ]
    }
  },
  {
    "id": 4,
    "lines": [
      {
        "speaker": "A",
        "text": "______ I in your class?",
        "blanks": [
          "Am"
        ]
      },
      {
        "speaker": "B",
        "text": "Yes, you ______. I ______ your teacher.",
        "blanks": [
          "are",
          "'m"
        ]
      }
    ],
    "accept": {
      "0": [
        "Am"
      ],
      "1": [
        "are"
      ],
      "2": [
        "'m",
        "am",
        "I\u2019m",
        "I'm"
      ]
    }
  }
];

  const app = document.getElementById("game-app");
  if (!app) return;

  let index = 0;
  let locked = false;
  let firstTryCorrect = 0;
  let totalBlanksChecked = 0;
  let correctBlanks = 0;

  function clean(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[\u2018\u2019\u0060]/g, "'");
  }

  function matchBlank(user, accepted) {
    const u = clean(user).toLowerCase();
    return accepted.some((a) => clean(a).toLowerCase() === u);
  }

  function displayAnswer(accepted) {
    // Prefer short forms as shown in book style
    return accepted[0];
  }

  function showStart() {
    app.innerHTML = `
      <div class="dg-topbar">
        <a class="dg-back-btn" href="../" title="Back" aria-label="Back">←</a>
        <span class="dg-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="dg-start">
        <h1>Complete the dialogues</h1>
        <p>Fill in the blanks with <strong>am / are / 'm / aren't</strong>.<br>One dialogue at a time.</p>
        <button class="dg-btn" id="dg-start-btn">Start</button>
      </div>
    `;
    document.getElementById("dg-start-btn").addEventListener("click", () => {
      index = 0;
      locked = false;
      firstTryCorrect = 0;
      totalBlanksChecked = 0;
      correctBlanks = 0;
      if (window.LAFinish) LAFinish.startTimer();
      renderItem();
    });
  }

  function buildLineHtml(line, filledMap, globalOffset) {
    let n = 0;
    const html = line.text.replace(/______/g, () => {
      const gi = globalOffset + n;
      const val = filledMap[gi];
      n++;
      if (val) return '<span class="blank filled">' + val + '</span>';
      return '<span class="blank active">&nbsp;</span>';
    });
    return html;
  }

  function renderItem() {
    if (index >= ITEMS.length) {
      showDone();
      return;
    }
    const item = ITEMS[index];
    // Flatten blanks with global indices
    let allAccept = [];
    item.lines.forEach((line, li) => {
      line.blanks.forEach((_, bi) => {
        const key = Object.keys(item.accept).map(Number).sort((a,b)=>a-b);
        // accept keys are sequential 0..n
      });
    });
    // Build sequential accept list
    const acceptList = [];
    const maxKey = Math.max(...Object.keys(item.accept).map(Number));
    for (let i = 0; i <= maxKey; i++) acceptList.push(item.accept[i]);

    let blankOffset = 0;
    const linesHtml = item.lines.map((line, li) => {
      const offset = blankOffset;
      blankOffset += line.blanks.length;
      const textHtml = buildLineHtml(line, {}, offset);
      const inputs = line.blanks.map((_, bi) => {
        const gi = offset + bi;
        return `<input class="dg-input" data-gi="${gi}" type="text" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="…" />`;
      }).join("");
      return `
        <div class="dg-line ${line.speaker.toLowerCase()}">
          <div class="dg-speaker">${line.speaker}</div>
          <div class="dg-line-body">
            <div class="dg-line-text" data-offset="${offset}" data-count="${line.blanks.length}">${textHtml}</div>
            <div class="dg-inputs">${inputs}</div>
          </div>
        </div>
      `;
    }).join("");

    app.innerHTML = `
      <div class="dg-topbar">
        <a class="dg-back-btn" href="#" id="dg-back" title="Back" aria-label="Back">←</a>
        <span class="dg-topbar-title">Complete the dialogues</span>
        <span class="dg-progress">${index + 1} / ${ITEMS.length}</span>
      </div>
      <div class="dg-card">
        <div class="dg-example"><strong>Example:</strong> A Hello. <strong>Are</strong> you Liz? &nbsp; B No, I<strong>'m</strong> not. I'm Maria.</div>
        ${linesHtml}
        <div class="dg-actions">
          <button class="dg-check" id="dg-check">Check</button>
          <div class="dg-feedback" id="dg-feedback"></div>
        </div>
      </div>
    `;

    document.getElementById("dg-back").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const inputs = [...app.querySelectorAll(".dg-input")];
    if (inputs[0]) inputs[0].focus();

    // Live update blanks as user types
    inputs.forEach((inp) => {
      inp.addEventListener("input", () => {
        const gi = +inp.dataset.gi;
        // find line text and rebuild filled display for visual
        updateBlanksVisual(inputs, acceptList);
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const i = inputs.indexOf(inp);
          if (i < inputs.length - 1) inputs[i + 1].focus();
          else document.getElementById("dg-check").click();
        }
      });
    });

    document.getElementById("dg-check").addEventListener("click", () => {
      if (locked) return;
      locked = true;
      const btn = document.getElementById("dg-check");
      btn.disabled = true;
      const feedback = document.getElementById("dg-feedback");

      let allOk = true;
      const filled = {};
      inputs.forEach((inp) => {
        const gi = +inp.dataset.gi;
        const ok = matchBlank(inp.value, acceptList[gi]);
        totalBlanksChecked++;
        if (ok) {
          correctBlanks++;
          inp.classList.add("correct");
          inp.classList.remove("wrong");
          filled[gi] = displayAnswer(acceptList[gi]);
        } else {
          allOk = false;
          inp.classList.add("wrong");
          inp.classList.remove("correct");
        }
      });
      if (allOk) firstTryCorrect++;

      // Update visual blanks
      let offset = 0;
      item.lines.forEach((line) => {
        const el = app.querySelector(`.dg-line-text[data-offset="${offset}"]`);
        if (el) {
          let n = 0;
          el.innerHTML = line.text.replace(/______/g, () => {
            const gi = offset + n;
            n++;
            if (filled[gi]) return '<span class="blank filled">' + filled[gi] + '</span>';
            return '<span class="blank active">&nbsp;</span>';
          });
        }
        offset += line.blanks.length;
      });

      if (allOk) {
        feedback.className = "dg-feedback ok";
        feedback.textContent = "✓ Perfect!"; try{sfxCorrect();}catch(e){} try{sfxCorrect();}catch(e){}
        setTimeout(() => {
          index++;
          locked = false;
          renderItem();
        }, 1000);
      } else {
        feedback.className = "dg-feedback no";
        feedback.textContent = "Check the blanks and try again"; try{sfxWrong();}catch(e){}
        setTimeout(() => {
          inputs.forEach((inp) => {
            if (!inp.classList.contains("correct")) {
              inp.classList.remove("wrong");
            }
          });
          feedback.textContent = "";
          locked = false;
          btn.disabled = false;
          const firstWrong = inputs.find((i) => !i.classList.contains("correct"));
          if (firstWrong) { firstWrong.focus(); firstWrong.select(); }
        }, 1400);
      }
    });
  }

  function updateBlanksVisual(inputs, acceptList) {
    // optional live preview - skip for simplicity
  }

  function spawnConfetti(container) {
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6", "#a3e635"];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("span");
      el.className = "dg-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 0.9) + "s";
      el.style.animationDuration = (2.2 + Math.random() * 1.4) + "s";
      el.style.width = (6 + Math.random() * 8) + "px";
      el.style.height = (8 + Math.random() * 10) + "px";
      container.appendChild(el);
    }
  }

  function calcStars(correct, total) {
    if (total <= 0) return 0;
    if (correct >= total) return 3;
    if (correct >= total - 1 || correct / total >= 0.8) return 2;
    if (correct >= Math.ceil(total / 2)) return 1;
    return 0;
  }

  function showDone() {
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: correctBlanks,
        total: Math.max(totalBlanksChecked, 1),
        timeMs: timeMs,
        onAgain: () => {
          index = 0; locked = false; firstTryCorrect = 0; totalBlanksChecked = 0; correctBlanks = 0;
          if (window.LAFinish) LAFinish.startTimer();
          renderItem();
        },
        onModes: () => showStart(),
        backHref: "../",
      });
      return;
    }
    const stars = calcStars(correctBlanks, Math.max(totalBlanksChecked, 1));
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
    app.innerHTML = `<div class="dg-topbar"><a class="dg-back-btn" href="../">←</a></div>
      <div class="dg-done"><div class="dg-done-inner"><h1>Done!</h1>
      <p>${correctBlanks}/${totalBlanksChecked} blanks right</p>
      <button class="dg-btn" id="dg-again">Practice again</button></div></div>`;
    document.getElementById("dg-again").addEventListener("click", () => {
      index = 0; locked = false; firstTryCorrect = 0; totalBlanksChecked = 0; correctBlanks = 0; renderItem();
    });
  }

  showStart();
})();
