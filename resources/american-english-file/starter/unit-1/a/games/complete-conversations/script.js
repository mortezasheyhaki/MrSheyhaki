/* Complete the Conversations – Enhanced UI & Logic */
(function () {
  const GAME_ID = "starter-1a-complete-conversations";
  const PARTS = [
    {
      id: "a",
      title: "Part A",
      instruction: "Complete the conversation with I or you.",
      scene: "Classroom",
      emoji: "🏫",
      image: "images/classroom.jpg",
      options: ["I", "you"],
      lines: [
        { speaker: "Miranda", parts: [
          { text: "Hi, " },
          { blank: false, value: "I", num: 1 },
          { text: "'m Miranda. Are " },
          { blank: true, answer: "you", num: 2 },
          { text: " Monica?" },
        ]},
        { speaker: "Sally", parts: [
          { text: "No, " },
          { blank: true, answer: "I", num: 3 },
          { text: "'m not, " },
          { blank: true, answer: "I", num: 4 },
          { text: "'m Sally." },
        ]},
        { speaker: "Miranda", parts: [
          { text: "Nice to meet " },
          { blank: true, answer: "you", num: 5 },
          { text: "!" },
        ]},
      ],
    },
    {
      id: "b",
      title: "Part B",
      instruction: "Complete the conversation with am, 'm, are, or 're.",
      scene: "Information desk",
      emoji: "ℹ️",
      image: "images/information.jpg",
      options: ["am", "'m", "are", "'re"],
      lines: [
        { speaker: "Student", parts: [
          { text: "Excuse me, " },
          { blank: false, value: "am", num: 1 },
          { text: " I in room 2?" },
        ]},
        { speaker: "Receptionist", parts: [
          { text: "What's your name?" },
        ]},
        { speaker: "Student", parts: [
          { text: "I " },
          { blank: true, answer: "'m", num: 2 },
          { text: " Caroline." },
        ]},
        { speaker: "Receptionist", parts: [
          { blank: true, answer: "Are", num: 3 },
          { text: " you Caroline Herzog?" },
        ]},
        { speaker: "Student", parts: [
          { text: "No, I " },
          { blank: true, answer: "'m", num: 4 },
          { text: " not. I " },
          { blank: true, answer: "'m", num: 5 },
          { text: " Caroline Fuchs." },
        ]},
        { speaker: "Receptionist", parts: [
          { text: "You " },
          { blank: true, answer: "'re", num: 6 },
          { text: " in room 3." },
        ]},
        { speaker: "Student", parts: [
          { text: "Thank you." },
        ]},
      ],
    },
    {
      id: "c",
      title: "Part C",
      instruction: "Complete the conversation.",
      scene: "Airport",
      emoji: "✈️",
      image: "images/airport.jpg",
      options: ["I", "you", "am", "'m", "are", "'re"],
      lines: [
        { speaker: "Charlotte", parts: [
          { text: "Are " },
          { blank: false, value: "you", num: 1 },
          { text: " Paolo Galli?" },
        ]},
        { speaker: "Paolo", parts: [
          { text: "Yes, I " },
          { blank: true, answer: "am", num: 2 },
          { text: "." },
        ]},
        { speaker: "Charlotte", parts: [
          { text: "Hi, " },
          { blank: true, answer: "I", num: 3 },
          { text: "'m Charlotte from the Dover School of English." },
        ]},
        { speaker: "Paolo", parts: [
          { text: "Oh, hello!" },
        ]},
        { speaker: "Charlotte", parts: [
          { text: "Nice to meet " },
          { blank: true, answer: "you", num: 4 },
          { text: "." },
        ]},
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start";
  let partIndex = 0;
  let answers = {};
  let checked = false;
  let partScores = [];

  function currentPart() {
    return PARTS[partIndex];
  }

  function blanksIn(part) {
    const list = [];
    part.lines.forEach((line) => {
      line.parts.forEach((p) => {
        if (p.blank) list.push(p);
      });
    });
    return list;
  }

  function normalize(s) {
    return String(s || "").trim().toLowerCase().replace(/[’]/g, "'");
  }

  function isCorrect(user, answer) {
    return normalize(user) === normalize(answer);
  }

  function scorePart(part) {
    const blanks = blanksIn(part);
    let correct = 0;
    blanks.forEach((b) => {
      const key = part.id + "-" + b.num;
      if (isCorrect(answers[key], b.answer)) correct++;
    });
    return { correct, total: blanks.length };
  }

  function startPart(i) {
    partIndex = i;
    checked = false;
    const part = PARTS[i];
    blanksIn(part).forEach((b) => {
      const key = part.id + "-" + b.num;
      if (answers[key] === undefined) answers[key] = "";
    });
    mode = "play";
    render();
  }

  function checkPart() {
    if (checked) return;
    const part = currentPart();
    const blanks = blanksIn(part);
    const missing = blanks.some((b) => !String(answers[part.id + "-" + b.num] || "").trim());
    if (missing) {
      const fb = document.getElementById("cc-fb");
      if (fb) {
        fb.textContent = "Please fill in all blanks before submitting.";
        fb.className = "cc-fb bad";
      }
      return;
    }
    checked = true;
    const sc = scorePart(part);
    partScores[partIndex] = sc;
    render();
    setTimeout(() => {
      mode = "part-result";
      render();
    }, sc.correct === sc.total ? 900 : 1200);
  }

  function nextAfterPart() {
    if (partIndex < PARTS.length - 1) {
      startPart(partIndex + 1);
    } else {
      mode = "result";
      render();
    }
  }

  function renderDialogue(part, interactive) {
    return part.lines
      .map((line) => {
        const html = line.parts
          .map((p) => {
            if (p.blank === false) {
              const num = p.num ? `<sup class="cc-num">${p.num}</sup>` : "";
              return `${num}<span class="cc-given">${escapeHtml(p.value)}</span>`;
            }
            if (!p.blank) {
              return escapeHtml(p.text);
            }
            const key = part.id + "-" + p.num;
            const val = answers[key] || "";
            const num = p.num ? `<sup class="cc-num">${p.num}</sup>` : "";
            if (!interactive) {
              const ok = isCorrect(val, p.answer);
              return `${num}<span class="cc-answer ${ok ? "ok" : "bad"}">${escapeHtml(val || "—")}</span>`;
            }
            if (checked) {
              const ok = isCorrect(val, p.answer);
              return `${num}<span class="cc-blank ${ok ? "ok" : "bad"}" data-key="${key}">${escapeHtml(val)}</span>`;
            }
            return `${num}<input type="text" class="cc-input" data-key="${key}" value="${escapeAttr(val)}" maxlength="6" autocomplete="off" spellcheck="false" aria-label="blank ${p.num}" />`;
          })
          .join("");
        return `
          <div class="cc-line">
            <span class="cc-speaker">${escapeHtml(line.speaker)}</span>
            <span class="cc-text">${html}</span>
          </div>`;
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function bindInputs() {
    document.querySelectorAll(".cc-input").forEach((input) => {
      input.addEventListener("input", () => {
        answers[input.dataset.key] = input.value;
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkPart();
        }
      });
    });

    document.querySelectorAll(".cc-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (checked) return;
        const focused = document.activeElement;
        if (focused && focused.classList.contains("cc-input")) {
          focused.value = chip.dataset.val;
          answers[focused.dataset.key] = chip.dataset.val;
          focused.dispatchEvent(new Event("input"));
          const inputs = Array.from(document.querySelectorAll(".cc-input"));
          const idx = inputs.indexOf(focused);
          for (let i = idx + 1; i < inputs.length; i++) {
            if (!inputs[i].value.trim()) {
              inputs[i].focus();
              return;
            }
          }
        } else {
          const empty = document.querySelector(".cc-input");
          if (empty && !empty.value.trim()) {
            empty.value = chip.dataset.val;
            answers[empty.dataset.key] = chip.dataset.val;
            empty.focus();
          }
        }
      });
    });
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="cc-topbar">
          <a class="cc-back" href="../" aria-label="Back">←</a>
          <span class="cc-title">Complete the Conversations</span>
          <span class="cc-badge">Unit 1A</span>
        </header>
        <section class="cc-start">
          <div class="cc-hero">💬</div>
          <h1>Complete the Conversations</h1>
          <p class="cc-desc">Practice basic introductions and verb standard forms.<br>Fill in missing responses using the options provided.</p>
          <button type="button" class="cc-btn" id="cc-start">Start Activity</button>
        </section>`;
      document.getElementById("cc-start").onclick = () => {
        answers = {};
        partScores = [];
        startPart(0);
      };
      return;
    }

    if (mode === "part-result") {
      const part = currentPart();
      const sc = partScores[partIndex] || scorePart(part);
      const perfect = sc.correct === sc.total;
      app.innerHTML = `
        <header class="cc-topbar">
          <a class="cc-back" href="../" aria-label="Back">←</a>
          <span class="cc-title">${part.title} Review</span>
          <span class="cc-badge">${sc.correct}/${sc.total}</span>
        </header>
        <section class="cc-done">
          <div class="cc-trophy">${perfect ? "🎉" : "👍"}</div>
          <h1>${perfect ? "Great Work!" : "Part Completed!"}</h1>
          <p>You scored <strong>${sc.correct}</strong> out of <strong>${sc.total}</strong></p>
          <div class="cc-dialogue">
            ${renderDialogue(part, false)}
          </div>
          <button type="button" class="cc-btn" id="cc-next">
            ${partIndex < PARTS.length - 1 ? "Next Part →" : "View Final Results"}
          </button>
        </section>`;
      document.getElementById("cc-next").onclick = nextAfterPart;
      return;
    }

    if (mode === "result") {
      const totalC = partScores.reduce((s, p) => s + (p ? p.correct : 0), 0);
      const totalT = partScores.reduce((s, p) => s + (p ? p.total : 0), 0);
      const stars = totalC === totalT ? 3 : totalC >= totalT - 2 ? 2 : totalC >= Math.ceil(totalT / 2) ? 1 : 0;
      if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
      app.innerHTML = `
        <header class="cc-topbar">
          <a class="cc-back" href="../" aria-label="Back">←</a>
          <span class="cc-title">Activity Complete</span>
          <span class="cc-badge">Summary</span>
        </header>
        <section class="cc-done">
          <div class="cc-trophy">${stars === 3 ? "🏆" : "🌟"}</div>
          <div class="cc-stars">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${totalC === totalT ? "Perfect Score!" : "Well Done!"}</h1>
          <p>Total Correct: <strong>${totalC}</strong> / <strong>${totalT}</strong></p>
          <ul class="cc-score-list">
            ${PARTS.map((p, i) => {
              const sc = partScores[i] || { correct: 0, total: 0 };
              return `<li><span>${p.title} (${p.scene})</span><strong>${sc.correct}/${sc.total}</strong></li>`;
            }).join("")}
          </ul>
          <button type="button" class="cc-btn" id="cc-again">Try Again</button>
        </section>`;
      document.getElementById("cc-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    const part = currentPart();
    const chips = part.options
      .map((o) => `<button type="button" class="cc-chip" data-val="${escapeAttr(o)}">${escapeHtml(o)}</button>`)
      .join("");

    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="../" aria-label="Back">←</a>
        <span class="cc-title">${part.title}</span>
        <span class="cc-badge">Part ${partIndex + 1} of ${PARTS.length}</span>
      </header>

      <div class="cc-workbook">
        <div class="cc-instruction">
          <span class="cc-letter">${escapeHtml(part.id)}</span>
          <p>${escapeHtml(part.instruction)}</p>
        </div>

        <div class="cc-card">
          <div class="cc-scene-row">
            ${part.image ? `<div class="cc-photo-wrap"><img class="cc-photo" src="${part.image}" alt="${escapeAttr(part.scene)}" onerror="this.parentElement.style.display='none'" /></div>` : ""}
            <div class="cc-dialogue" id="cc-dialogue">
              ${renderDialogue(part, true)}
            </div>
          </div>
        </div>
      </div>

      <div class="cc-chips" aria-label="Word selection bank">
        ${chips}
      </div>

      <div class="cc-fb" id="cc-fb" aria-live="polite"></div>

      <div class="cc-actions">
        <button type="button" class="cc-btn" id="cc-check" ${checked ? "disabled" : ""}>Check Answers</button>
      </div>
    `;

    bindInputs();
    document.getElementById("cc-check").onclick = checkPart;

    const first = document.querySelector(".cc-input");
    if (first) setTimeout(() => first.focus(), 100);
  }

  render();
})();