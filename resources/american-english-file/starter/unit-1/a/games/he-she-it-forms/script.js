/* He / She / It – Positive, Negative, Question forms (full + short) */
(function () {
  const SUBJECTS = [
    { id: "he",  label: "He",  pronoun: "he"  },
    { id: "she", label: "She", pronoun: "she" },
    { id: "it",  label: "It",  pronoun: "it"  },
  ];

  // All valid forms for each subject + type
  // Note: both "isn't" and "'s not" are accepted as correct negatives
  const FORMS = {
    he: {
      positive:  ["He is", "He's"],
      negative:  ["He is not", "He isn't", "He's not"],
      question:  ["Is he?"],
    },
    she: {
      positive:  ["She is", "She's"],
      negative:  ["She is not", "She isn't", "She's not"],
      question:  ["Is she?"],
    },
    it: {
      positive:  ["It is", "It's"],
      negative:  ["It is not", "It isn't", "It's not"],
      question:  ["Is it?"],
    },
  };

  const TYPES = [
    { id: "positive", label: "Positive",  tag: "positive"  },
    { id: "negative", label: "Negative",  tag: "negative"  },
    { id: "question", label: "Question",  tag: "question"  },
  ];

  const MODES = [
    {
      id: "make",
      title: "Make the form",
      tip: "Choose the correct positive, negative or question form.",
    },
    {
      id: "identify",
      title: "Identify the form",
      tip: "Is this positive, negative, or a question?",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";          // menu | play | done
  let modeIndex = 0;
  let questions = [];          // prepared round
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

  // Build a pool of unique-looking distractors
  function getDistractors(subjectId, typeId, correctText) {
    const all = [];
    SUBJECTS.forEach((s) => {
      TYPES.forEach((t) => {
        FORMS[s.id][t.id].forEach((f) => {
          if (f !== correctText) all.push(f);
        });
      });
    });
    return shuffle(all).slice(0, 3);
  }

  function buildMakeQuestions(count) {
    const list = [];
    // Balanced coverage
    const combos = [];
    SUBJECTS.forEach((s) => {
      TYPES.forEach((t) => combos.push({ subject: s, type: t }));
    });
    shuffle(combos).slice(0, count).forEach(({ subject, type }) => {
      const correct = pick(FORMS[subject.id][type.id]);
      const options = shuffle([correct, ...getDistractors(subject.id, type.id, correct)]);
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

  function buildIdentifyQuestions(count) {
    const list = [];
    const pool = [];
    SUBJECTS.forEach((s) => {
      TYPES.forEach((t) => {
        FORMS[s.id][t.id].forEach((form) => {
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
        options: shuffle(TYPES.map((t) => t.label)),
        correct: item.type.label,
      });
    });
    return list;
  }

  function startMode(mi) {
    modeIndex = mi;
    correctCount = 0;
    index = 0;
    locked = false;
    const count = 12; // nice round number
    questions = modeIndex === 0
      ? buildMakeQuestions(count)
      : buildIdentifyQuestions(count);
    phase = "play";
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
    }, isCorrect ? 650 : 900);
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
          <span class="hs-title">He / She / It</span>
          <span class="hs-badge">Forms</span>
        </header>
        <section class="hs-start">
          <div class="hs-hero" aria-hidden="true">👤</div>
          <h1>He is · She is · It is</h1>
          <p class="hs-desc">Practice positive, negative<br>and question forms.</p>
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
      const mode = MODES[modeIndex];
      app.innerHTML = `
        <header class="hs-topbar">
          <span class="hs-title">He / She / It</span>
          <span class="hs-badge">Done</span>
        </header>
        <section class="hs-done">
          <div class="hs-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="hs-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${mode.title}</strong><br>
          You got <strong>${correctCount} / ${questions.length}</strong> correct.</p>
          <button type="button" class="hs-btn" id="hs-again">Play again</button>
          <button type="button" class="hs-btn secondary" id="hs-menu">All modes</button>
        </section>`;
      document.getElementById("hs-again").onclick = () => startMode(modeIndex);
      document.getElementById("hs-menu").onclick = () => {
        phase = "menu";
        render();
      };
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
        <h2>Choose the <strong>${q.type.label.toLowerCase()}</strong> form</h2>
        <div class="hs-subject">${q.subject.label}</div>
        <div class="hs-target-tag ${q.type.tag}">${q.type.label}</div>`;
      optionsHTML = q.options.map((opt) => `
        <button type="button" class="hs-option" data-value="${opt}">${opt}</button>
      `).join("");
    } else {
      // identify
      promptHTML = `
        <p class="hs-label">Identify the form</p>
        <h2>What kind of form is this?</h2>
        <div class="hs-form-card">${q.form}</div>`;
      optionsHTML = q.options.map((opt) => `
        <button type="button" class="hs-option" data-value="${opt}">${opt}</button>
      `).join("");
    }

    app.innerHTML = `
      <header class="hs-topbar">
        <button type="button" class="hs-back" id="hs-back" aria-label="Back">←</button>
        <span class="hs-title">${mode.title}</span>
        <span class="hs-progress">${progress}</span>
      </header>
      <section class="hs-prompt">${promptHTML}</section>
      <div class="hs-options">${optionsHTML}</div>`;

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
