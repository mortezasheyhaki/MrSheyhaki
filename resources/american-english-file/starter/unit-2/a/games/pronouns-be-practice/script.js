/* Pronouns + be – 3 parts (a, b, c) · AEF Starter */
(function () {
  const GAME_ID = "starter-pronouns-be-practice";

  // —— Part A: Change bold words to a pronoun ——
  const PART_A = [
    {
      prompt: "Diana and I are in room 4.",
      blank: "______'re in room 4.",
      answers: ["we"],
      display: "We",
    },
    {
      prompt: "The Taj Mahal is in India.",
      blank: "______'s in India.",
      answers: ["it"],
      display: "It",
    },
    {
      prompt: "Are Mark and James in Mexico?",
      blank: "Are ______ in Mexico?",
      answers: ["they"],
      display: "they",
    },
    {
      prompt: "Where is Rosa from?",
      blank: "Where's ______ from?",
      answers: ["she"],
      display: "she",
    },
    {
      prompt: "Mira and Rita are Brazilian.",
      blank: "______'re Brazilian.",
      answers: ["they"],
      display: "They",
    },
    {
      prompt: "Paul isn't in the hotel.",
      blank: "______ isn't in the hotel.",
      answers: ["he"],
      display: "He",
    },
    {
      prompt: "You and Sara are in class 2.",
      blank: "______'re in class 2.",
      answers: ["you"],
      display: "You",
    },
    {
      prompt: "Jim and I are from the US.",
      blank: "______'re from the US.",
      answers: ["we"],
      display: "We",
    },
    {
      prompt: "Honda and Toyota are Japanese.",
      blank: "______'re Japanese.",
      answers: ["they"],
      display: "They",
    },
  ];

  // —— Part B: Make + − ? with we / you / they ——
  const PART_B = [
    {
      cue: "Ana and I / Mexican",
      type: "−",
      answers: [
        "we aren't mexican",
        "we're not mexican",
        "we are not mexican",
        "we aren't mexicans",
        "we're not mexicans",
      ],
      display: "We aren't Mexican.",
    },
    {
      cue: "You, Max, and John / in class 4",
      type: "+",
      answers: [
        "you're in class 4",
        "you are in class 4",
      ],
      display: "You're in class 4.",
    },
    {
      cue: "Mike and Peter / English",
      type: "?",
      answers: [
        "are they english",
        "are they english?",
      ],
      display: "Are they English?",
    },
    {
      cue: "Linda and I / in class 4",
      type: "?",
      answers: [
        "are we in class 4",
        "are we in class 4?",
      ],
      display: "Are we in class 4?",
    },
    {
      cue: "You and Lucy / in class 4",
      type: "−",
      answers: [
        "you aren't in class 4",
        "you're not in class 4",
        "you are not in class 4",
      ],
      display: "You aren't in class 4.",
    },
    {
      cue: "Lucy and I / on vacation",
      type: "+",
      answers: [
        "we're on vacation",
        "we are on vacation",
      ],
      display: "We're on vacation.",
    },
  ];

  // —— Part C: Complete the conversation (one blank at a time) ——
  const PART_C = [
    {
      context: "A ______ you from the US?\nB No, we ______ American. We ______ English.",
      blanks: [
        { answers: ["are"], display: "Are" },
        { answers: ["aren't", "are not", "'re not"], display: "aren't" },
        { answers: ["'re", "are"], display: "'re" },
      ],
      // We'll present as 3 sequential items for simplicity
    },
  ];

  // Flatten part C into sequential items with full context shown
  const PART_C_ITEMS = [
    {
      prompt: "A ______ you from the US?",
      hint: "B No, we ______ American. We ______ English.",
      type: "?",
      answers: ["are"],
      display: "Are",
    },
    {
      prompt: "A Are you from the US?\nB No, we ______ American. We ______ English.",
      type: "−",
      answers: ["aren't","are not","'re not"],
      display: "aren't",
    },
    {
      prompt: "A Are you from the US?\nB No, we aren't American. We ______ English.",
      type: "+",
      answers: ["'re","are"],
      display: "'re",
    },
    {
      prompt: "A ______ they Mexican?",
      hint: "B Yes, they ______. They ______ from Mexico City.",
      type: "?",
      answers: ["are"],
      display: "Are",
    },
    {
      prompt: "A Are they Mexican?\nB Yes, they ______. They ______ from Mexico City.",
      type: "+",
      answers: ["are"],
      display: "are",
    },
    {
      prompt: "A Are they Mexican?\nB Yes, they are. They ______ from Mexico City.",
      type: "+",
      answers: ["'re","are"],
      display: "'re",
    },
    {
      prompt: "Kareem is from Riyadh. He ______ from Jeddah.",
      type: "−",
      answers: ["isn't","is not","'s not"],
      display: "isn't",
    },
    {
      prompt: "Sorry, you ______ in room 20. You're in room 22.",
      type: "−",
      answers: ["aren't","are not","'re not"],
      display: "aren't",
    },
    {
      prompt: "A ______ your name Maria?",
      hint: "B No, it ______ Maria. It ______ Marta.",
      type: "?",
      answers: ["is"],
      display: "Is",
    },
    {
      prompt: "A Is your name Maria?\nB No, it ______ Maria. It ______ Marta.",
      type: "−",
      answers: ["isn't","is not","'s not"],
      display: "isn't",
    },
    {
      prompt: "A Is your name Maria?\nB No, it isn't Maria. It ______ Marta.",
      type: "+",
      answers: ["'s","is"],
      display: "'s",
    },
    {
      prompt: "A ______ we late?",
      hint: "B Yes, you ______. It ______ 9:30!",
      type: "?",
      answers: ["are"],
      display: "Are",
    },
    {
      prompt: "A Are we late?\nB Yes, you ______. It ______ 9:30!",
      type: "+",
      answers: ["are"],
      display: "are",
    },
    {
      prompt: "A Are we late?\nB Yes, you are. It ______ 9:30!",
      type: "+",
      answers: ["'s","is"],
      display: "'s",
    },
    {
      prompt: "I ______ Sara Smith. I'm Sara Simpson.",
      type: "−",
      answers: ["'m not","am not"],
      display: "'m not",
    },
    {
      prompt: "They ______ from New York. They're from Texas.",
      type: "−",
      answers: ["aren't","are not","'re not"],
      display: "aren't",
    },
    {
      prompt: "A Where's Laura from?\nB She ______ from Recife.",
      type: "+",
      answers: ["'s","is"],
      display: "'s",
    },
    {
      prompt: "A Where's Laura from?\nB She's from Recife.\nA ______ Recife in Brazil?",
      type: "?",
      answers: ["is"],
      display: "Is",
    },
    {
      prompt: "A Where's Laura from?\nB She's from Recife.\nA Is Recife in Brazil?\nB Yes, it ______.",
      type: "+",
      answers: ["is"],
      display: "is",
    }
  ];

  const PARTS = [
    { id: "a", title: "A · Pronouns", tip: "Change the bold words to a pronoun.", items: PART_A },
    { id: "b", title: "B · + − ?", tip: "Make +, −, or ? sentences with we, you, or they.", items: PART_B },
    { id: "c", title: "C · Conversations", tip: "Complete the conversation. Use contractions where possible.", items: PART_C_ITEMS },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let phase = "menu";
  let index = 0;
  let correctCount = 0;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let partScores = [0, 0, 0];

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!]/g, "")
      .replace(/\s+/g, " ")
      .replace(/'/g, "'")
      .replace(/'/g, "'");
  }

  function isCorrect(user, answers) {
    const n = normalize(user);
    if (!n) return false;
    return answers.some((a) => normalize(a) === n);
  }

  function startPart(pi) {
    partIndex = pi;
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
  }

  function currentItems() {
    return PARTS[partIndex].items;
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = currentItems()[index];
    lastCorrect = isCorrect(val, item.answers);
    if (lastCorrect) {
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render();
      setTimeout(() => nextItem(), 900);
    } else {
      answered = false;
      phase = "tryagain";
      render();
    }
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    render();
    setTimeout(() => nextItem(), 900);
  }

  function nextItem() {
    const items = currentItems();
    if (index < items.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
    } else {
      partScores[partIndex] = correctCount;
      if (partIndex < PARTS.length - 1) {
        phase = "continue";
        render();
      } else {
        phase = "done";
        render();
      }
    }
  }

  function calcStars() {
    const total = partScores.reduce((a, b) => a + b, 0);
    const max = PARTS.reduce((a, p) => a + p.items.length, 0);
    if (total >= max - 2) return 3;
    if (total >= Math.ceil(max * 0.65)) return 2;
    if (total >= Math.ceil(max * 0.4)) return 1;
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

  function progressHTML() {
    const items = currentItems();
    const total = items.length;
    const fill = Math.round((index / total) * 100);
    return `
      <div class="lw-track" aria-hidden="true">
        <div class="lw-track-fill" style="width:${fill}%"></div>
      </div>
      <div class="lw-scoreline">
        <span class="lw-score">${correctCount} correct</span>
        <span class="lw-step">${index + 1} / ${total}</span>
      </div>`;
  }

  function renderPlayA(item) {
    return `
      <p class="lw-prompt">${item.prompt}</p>
      <p class="lw-blank-line">${item.blank.replace("______", "<span class='lw-gap'>____</span>")}</p>
      <div class="lw-input-wrap">
        <input type="text" id="lw-input" class="lw-input" placeholder="Type the pronoun…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>`;
  }

  function renderPlayB(item) {
    const typeLabel = item.type === "+" ? "Positive (+)" : item.type === "−" ? "Negative (−)" : "Question (?)";
    return `
      <p class="lw-type-badge">${typeLabel}</p>
      <p class="lw-prompt">${item.cue}</p>
      <div class="lw-input-wrap">
        <input type="text" id="lw-input" class="lw-input" placeholder="Write the full sentence…" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false">
      </div>`;
  }

  function renderPlayC(item) {
    const typeLabel = item.type === "+" ? "Positive (+)" : item.type === "−" ? "Negative (−)" : item.type === "?" ? "Question (?)" : "";
    const promptHtml = (item.prompt || "").replace(/\n/g, "<br>");
    const hintHtml = item.hint ? item.hint.replace(/\n/g, "<br>") : "";
    return `
      ${typeLabel ? `<p class="lw-type-badge">${typeLabel}</p>` : ""}
      <p class="lw-label-main">Your sentence</p>
      <p class="lw-prompt lw-conv">${promptHtml}</p>
      ${hintHtml ? `<p class="lw-label-ctx">Also in this dialogue</p><p class="lw-hint-line">${hintHtml}</p>` : ""}
      <div class="lw-input-wrap">
        <input type="text" id="lw-input" class="lw-input" placeholder="Fill the blank…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      </div>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Pronouns & be</span>
          <span class="lw-badge">Practice</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">✍️</div>
          <h1>Pronouns & be</h1>
          <p class="lw-desc">Three parts · pronouns, + − ?, conversations</p>
          <div class="lw-mode-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="lw-mode-card" data-part="${i}">
                <span class="lw-mode-num">${String.fromCharCode(65 + i)}</span>
                <div>
                  <strong>${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".lw-mode-card").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    if (phase === "continue") {
      const part = PARTS[partIndex];
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">👍</div>
          <h1>Part ${String.fromCharCode(65 + partIndex)} complete</h1>
          <p>You got <strong>${correctCount} / ${part.items.length}</strong> correct.</p>
          <p class="lw-desc">Continue to Part ${String.fromCharCode(66 + partIndex)}?</p>
          <button type="button" class="lw-btn" id="lw-yes">Yes, continue →</button>
          <button type="button" class="lw-btn secondary" id="lw-stop">Finish here</button>
        </section>`;
      document.getElementById("lw-yes").onclick = () => startPart(partIndex + 1);
      document.getElementById("lw-stop").onclick = () => {
        phase = "done";
        render();
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const total = partScores.reduce((a, b) => a + b, 0);
      const max = PARTS.reduce((a, p) => a + p.items.length, 0);
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Pronouns & be</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="lw-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>Total: <strong>${total} / ${max}</strong></p>
          <p class="lw-desc">A ${partScores[0]}/${PART_A.length} · B ${partScores[1]}/${PART_B.length} · C ${partScores[2]}/${PART_C_ITEMS.length}</p>
          <button type="button" class="lw-btn" id="lw-again">Play again</button>
          <button type="button" class="lw-btn secondary" id="lw-menu">All parts</button>
        </section>`;
      document.getElementById("lw-again").onclick = () => startPart(0);
      document.getElementById("lw-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const part = PARTS[partIndex];
    const items = currentItems();
    const item = items[index];
    const progress = (index + 1) + " / " + items.length;

    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback is-wrong">
          <div class="lw-fb-icon">❌</div>
          <p class="lw-fb-msg">Try again</p>
          <p class="lw-fb-hint">You wrote: <em>${lastUserInput || "—"}</em></p>
          <button type="button" class="lw-btn" id="lw-retry">Try again</button>
        </section>`;
      document.getElementById("lw-retry").onclick = () => {
        answered = false;
        lastUserInput = "";
        phase = "play";
        render();
      };
      return;
    }

    if (phase === "feedback") {
      const msg = lastSkipped
        ? `Answer: <strong>${item.display}</strong>`
        : `Correct! <strong>${item.display}</strong>`;
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback ${lastCorrect ? "is-correct" : "is-wrong"}">
          <div class="lw-fb-icon">${lastCorrect ? "✅" : "➡️"}</div>
          <p class="lw-fb-msg">${msg}</p>
        </section>`;
      return;
    }

    // play
    let body = "";
    if (part.id === "a") body = renderPlayA(item);
    else if (part.id === "b") body = renderPlayB(item);
    else body = renderPlayC(item);

    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">${part.title}</span>
        <span class="lw-progress">${progress}</span>
      </header>
      ${progressHTML()}
      <section class="lw-play-area">
        <p class="lw-instruction">${part.tip}</p>
        ${body}
        <div class="lw-actions">
          <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
          <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
        </div>
      </section>`;
    const input = document.getElementById("lw-input");
    const checkBtn = document.getElementById("lw-check");
    if (input) {
      input.focus();
      input.oninput = () => { checkBtn.disabled = !input.value.trim(); };
      input.onkeydown = (e) => {
        if (e.key === "Enter" && input.value.trim()) checkAnswer();
      };
    }
    checkBtn.onclick = checkAnswer;
    document.getElementById("lw-skip").onclick = skipAnswer;
  }

  render();
})();
