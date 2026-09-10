/* I am / I'm · You are / You're – American English File Starter Unit 1A */
(function () {
  const GAME_ID = "starter-1a-be-i-you";
  // ========== DATA ==========
  const FORMS = [
    { full: "I am", short: "I'm", emoji: "🙋", tip: "I + am → I'm" },
    { full: "You are", short: "You're", emoji: "👤", tip: "You + are → You're" },
    { full: "I am not", short: "I'm not", emoji: "🙅", tip: "I + am not → I'm not" },
    { full: "You are not", short: "You're not", emoji: "🚫", tip: "You + are not → You're not / You aren't" }
  ];

  const POSITIVE = [
    {
      id: 1,
      sentence: "Hi. ______ Tony.",
      blanks: ["I'm"],
      options: ["I'm", "You're"],
      full: "Hi. I'm Tony.",
      image: "im-tony.png"
    },
    {
      id: 2,
      sentence: "Hello. ______ your teacher. ______ in my class.",
      blanks: ["I'm", "You're"],
      options: ["I'm", "You're"],
      full: "Hello. I'm your teacher. You're in my class.",
      image: "im-your-teacher.png"
    },
    {
      id: 3,
      sentence: "______ in room 4.",
      blanks: ["I'm"],
      options: ["I'm", "You're"],
      full: "I'm in room 4.",
      image: "im-in-room-4.png"
    },
    {
      id: 4,
      sentence: "______ in room 3.",
      blanks: ["You're"],
      options: ["I'm", "You're"],
      full: "You're in room 3.",
      image: "youre-in-room-3.png"
    },
    {
      id: 5,
      sentence: "Hello. ______ Maria. What's your name?",
      blanks: ["I'm"],
      options: ["I'm", "You're"],
      full: "Hello. I'm Maria. What's your name?",
      image: "im-maria.png"
    }
  ];

  const NEGATIVE = [
    {
      id: 1,
      sentence: "______ Tom. I'm Tony.",
      blanks: ["I'm not"],
      options: ["I'm not", "You're not"],
      full: "I'm not Tom. I'm Tony.",
      image: "im-not-tom.png"
    },
    {
      id: 2,
      sentence: "______ Marisa. I'm Maria.",
      blanks: ["I'm not"],
      options: ["I'm not", "You're not"],
      full: "I'm not Marisa. I'm Maria.",
      image: "im-not-marisa.png"
    },
    {
      id: 3,
      sentence: "______ in room 6. You're in room 7.",
      blanks: ["You're not"],
      options: ["I'm not", "You're not"],
      full: "You're not in room 6. You're in room 7.",
      image: "you-arent-in-room-6.png"
    },
    {
      id: 4,
      sentence: "______ in room 5.",
      blanks: ["You're not"],
      options: ["I'm not", "You're not"],
      full: "You're not in room 5.",
      image: "you-arent-in-room-5.png"
    }
  ];

  // ========== STATE ==========
  const app = document.getElementById("game-app");
  if (!app) return;

  let part = null;          // "forms" | "positive" | "negative"
  let index = 0;
  let items = [];
  let locked = false;
  let blankIndex = 0;
  let formsScore = 0;
  let formsTotal = 0;
  let formsMistakes = 0;
  let partScore = 0;
  let partAttempts = 0;
  let matchedPairs = new Set();
  let selectedFull = null;
  let selectedShort = null;

  // ========== HELPERS ==========
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function spawnConfetti(container) {
    if (!container) return;
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6", "#a3e635"];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("span");
      el.className = "be-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = Math.random() * 0.9 + "s";
      el.style.animationDuration = 2.2 + Math.random() * 1.4 + "s";
      el.style.width = 6 + Math.random() * 8 + "px";
      el.style.height = 8 + Math.random() * 10 + "px";
      container.appendChild(el);
    }
  }

  // ========== START SCREEN ==========
  function showStart() {
    part = null;
    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="be-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="be-start">
        <div class="be-start-hero">
          <div class="be-start-blob" aria-hidden="true"></div>
          <div class="be-start-icon-wrap" aria-hidden="true">
            <span class="be-start-icon">💬</span>
          </div>
          <h1>
            <span class="be-title-line">I am / I'm</span>
            <span class="be-title-line">You are / You're</span>
          </h1>
          <p class="be-sub">Practice the full forms and contractions<br>of <strong>be</strong> with I and you.</p>
        </div>

        <div class="be-part-pills">
          <button class="be-pill be-pill-1" data-part="forms">
            <span class="be-pill-num">1</span>
            <span class="be-pill-body">
              <span class="be-pill-title">Match the forms</span>
              <span class="be-pill-desc">Full ↔ contraction</span>
            </span>
          </button>
          <button class="be-pill be-pill-2" data-part="positive">
            <span class="be-pill-num">2</span>
            <span class="be-pill-body">
              <span class="be-pill-title">Positive</span>
              <span class="be-pill-desc">I'm · You're</span>
            </span>
          </button>
          <button class="be-pill be-pill-3" data-part="negative">
            <span class="be-pill-num">3</span>
            <span class="be-pill-body">
              <span class="be-pill-title">Negative</span>
              <span class="be-pill-desc">I'm not · You're not</span>
            </span>
          </button>
        </div>

        <div class="be-chips">
          <span class="be-chip">I am → I'm</span>
          <span class="be-chip">You are → You're</span>
        </div>
      </div>
    `;
    app.querySelectorAll("[data-part]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.part === "forms") startForms();
        else startPart(btn.dataset.part);
      });
    });
  }

  // ========== PART 1: MATCH FORMS ==========
  let formsOrderFull = null;
  let formsOrderShort = null;
  let formsFirstRender = true;

  function startForms() {
    part = "forms";
    formsScore = 0;
    formsMistakes = 0;
    formsTotal = FORMS.length;
    matchedPairs = new Set();
    selectedFull = null;
    selectedShort = null;
    formsOrderFull = shuffle(FORMS.map((f, i) => ({ ...f, idx: i })));
    formsOrderShort = shuffle(FORMS.map((f, i) => ({ ...f, idx: i })));
    formsFirstRender = true;
    renderForms();
  }

  function renderForms() {
    const fulls = formsOrderFull;
    const shorts = formsOrderShort;

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="#" id="be-back-start" title="Back" aria-label="Back">←</a>
        <span class="be-topbar-title">Match full ↔ short</span>
        <span class="be-progress">${matchedPairs.size} / ${FORMS.length}</span>
      </div>
      <div class="be-forms-intro">
        <p>Tap a <strong>full form</strong>, then its <strong>contraction</strong>.</p>
      </div>
      <div class="be-forms-board">
        <div class="be-forms-col">
          <div class="be-forms-label">Full form</div>
          <div class="be-forms-list" id="fulls"></div>
        </div>
        <div class="be-forms-col">
          <div class="be-forms-label">Contraction</div>
          <div class="be-forms-list" id="shorts"></div>
        </div>
      </div>
      <div class="be-feedback" id="be-feedback"></div>
    `;

    document.getElementById("be-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const fullsEl = document.getElementById("fulls");
    const shortsEl = document.getElementById("shorts");

    fulls.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "be-form-card" + (matchedPairs.has(f.idx) ? " matched" : "") + (formsFirstRender ? "" : " no-enter");
      btn.type = "button";
      btn.dataset.idx = f.idx;
      btn.dataset.side = "full";
      btn.innerHTML = '<span class="be-form-emoji">' + f.emoji + '</span><span class="be-form-text">' + f.full + '</span>';
      if (!matchedPairs.has(f.idx)) {
        btn.addEventListener("click", () => onFormSelect(btn, "full", f.idx));
      }
      fullsEl.appendChild(btn);
    });

    shorts.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "be-form-card" + (matchedPairs.has(f.idx) ? " matched" : "") + (formsFirstRender ? "" : " no-enter");
      btn.type = "button";
      btn.dataset.idx = f.idx;
      btn.dataset.side = "short";
      btn.innerHTML = '<span class="be-form-emoji">' + f.emoji + '</span><span class="be-form-text">' + f.short + '</span>';
      if (!matchedPairs.has(f.idx)) {
        btn.addEventListener("click", () => onFormSelect(btn, "short", f.idx));
      }
      shortsEl.appendChild(btn);
    });
    formsFirstRender = false;
  }

  function onFormSelect(btn, side, idx) {
    if (locked || matchedPairs.has(idx)) return;

    app.querySelectorAll('.be-form-card[data-side="' + side + '"]').forEach((b) => b.classList.remove("selected"));

    if (side === "full") {
      selectedFull = idx;
      btn.classList.add("selected");
    } else {
      selectedShort = idx;
      btn.classList.add("selected");
    }

    if (selectedFull !== null && selectedShort !== null) {
      locked = true;
      const feedback = document.getElementById("be-feedback");
      const fullBtn = app.querySelector('.be-form-card[data-side="full"][data-idx="' + selectedFull + '"]');
      const shortBtn = app.querySelector('.be-form-card[data-side="short"][data-idx="' + selectedShort + '"]');

      if (selectedFull === selectedShort) {
        matchedPairs.add(selectedFull);
        formsScore++;
        fullBtn.classList.add("correct");
        shortBtn.classList.add("correct");
        feedback.className = "be-feedback ok";
        feedback.textContent = "✓ " + FORMS[selectedFull].tip;

        setTimeout(() => {
          selectedFull = null;
          selectedShort = null;
          locked = false;
          if (matchedPairs.size >= FORMS.length) {
            showFormsDone();
          } else {
            renderForms();
          }
        }, 900);
      } else {
        formsMistakes++;
        fullBtn.classList.add("wrong");
        shortBtn.classList.add("wrong");
        feedback.className = "be-feedback bad";
        feedback.textContent = "Try again";

        setTimeout(() => {
          fullBtn.classList.remove("selected", "wrong");
          shortBtn.classList.remove("selected", "wrong");
          selectedFull = null;
          selectedShort = null;
          locked = false;
          feedback.textContent = "";
          feedback.className = "be-feedback";
        }, 700);
      }
    }
  }

  function calcStars(correct, total) {
    if (total <= 0) return 0;
    if (correct >= total) return 3;
    if (correct >= total - 1 || correct / total >= 0.8) return 2;
    if (correct >= Math.ceil(total / 2)) return 1;
    return 0;
  }

  function showFormsDone() {
    // Stars reflect accuracy: fewer mistakes → more stars
    const accuracy = Math.max(0, formsTotal - formsMistakes);
    const stars = calcStars(accuracy, formsTotal);
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="be-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="be-done">
        <div class="be-done-burst" id="be-burst">
          <div class="be-ring"></div>
          <div class="be-ring"></div>
        </div>
        <div class="be-done-inner">
          <div class="be-trophy" aria-hidden="true">${stars === 3 ? "🏆" : "🌟"}</div>
          <div class="be-stars" aria-hidden="true">
            <span class="be-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="be-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="be-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Forms matched!" : "Forms complete!"}</h1>
          <p>You know <strong>I am → I'm</strong> and <strong>You are → You're</strong>.</p>
          <div class="be-done-score">${formsScore} / ${formsTotal} pairs${formsMistakes ? ` · ${formsMistakes} mistake${formsMistakes === 1 ? "" : "s"}` : ""}</div>
          <button class="be-btn" id="be-again">Practice again</button>
          <button class="be-btn secondary" id="be-next">Go to Positive →</button>
          <button class="be-btn secondary" id="be-home">Back to games</button>
        </div>
      </div>
    `;
    if (stars >= 2) spawnConfetti(document.getElementById("be-burst"));
    document.getElementById("be-again").addEventListener("click", () => startForms());
    document.getElementById("be-next").addEventListener("click", () => startPart("positive"));
    document.getElementById("be-home").addEventListener("click", () => { window.location.href = "../"; });
  }

  // ========== PART 2 & 3: SENTENCES ==========
  function startPart(p) {
    part = p;
    items = p === "positive" ? POSITIVE.slice() : NEGATIVE.slice();
    index = 0;
    blankIndex = 0;
    locked = false;
    partScore = 0;
    partAttempts = 0;
    renderItem();
  }

  function buildSentenceHtml(item, filledCount) {
    let n = 0;
    return item.sentence.replace(/______/g, () => {
      if (n < filledCount) {
        const val = item.blanks[n];
        n++;
        return '<span class="blank filled">' + val + "</span>";
      } else if (n === filledCount) {
        n++;
        return '<span class="blank active">&nbsp;</span>';
      } else {
        n++;
        return '<span class="blank">&nbsp;</span>';
      }
    });
  }

  function renderItem() {
    if (index >= items.length) {
      showDone();
      return;
    }
    const item = items[index];
    const partLabel =
      part === "positive"
        ? "Positive · I am / You are"
        : "Negative · I'm not / You're not";
    blankIndex = Math.min(blankIndex, item.blanks.length - 1);

    const imgHtml = item.image
      ? `<div class="be-image-wrap has-image" id="be-img">
           <img alt="" src="images/${item.image}" onerror="this.parentElement.classList.remove('has-image'); this.style.display='none';">
         </div>`
      : "";

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="#" id="be-back-start" title="Back to parts" aria-label="Back">←</a>
        <span class="be-topbar-title">${partLabel}</span>
        <span class="be-progress">${index + 1} / ${items.length}</span>
      </div>
      <div class="be-card">
        ${imgHtml}
        <p class="be-sentence" id="be-sentence">${buildSentenceHtml(item, blankIndex)}</p>
        <div class="be-options" id="be-options"></div>
        <div class="be-feedback" id="be-feedback"></div>
      </div>
    `;

    document.getElementById("be-back-start").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const opts = document.getElementById("be-options");
    item.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "be-option";
      btn.type = "button";
      btn.textContent = opt;
      btn.addEventListener("click", () => onChoose(opt, item, btn));
      opts.appendChild(btn);
    });
  }

  function onChoose(choice, item, btn) {
    if (locked) return;
    locked = true;
    const feedback = document.getElementById("be-feedback");
    const buttons = app.querySelectorAll(".be-option");
    buttons.forEach((b) => (b.disabled = true));

    const expected = item.blanks[blankIndex];

    partAttempts++;
    if (choice === expected) {
      partScore++;
      btn.classList.add("correct");
      document.getElementById("be-sentence").innerHTML = buildSentenceHtml(item, blankIndex + 1);

      if (blankIndex + 1 < item.blanks.length) {
        feedback.className = "be-feedback ok";
        feedback.textContent = "✓ Good — next blank";
        setTimeout(() => {
          blankIndex++;
          locked = false;
          renderItem();
        }, 650);
      } else {
        feedback.className = "be-feedback ok";
        feedback.textContent = "✓ " + item.full;
        setTimeout(() => {
          index++;
          blankIndex = 0;
          locked = false;
          renderItem();
        }, 900);
      }
    } else {
      btn.classList.add("wrong");
      feedback.className = "be-feedback bad";
      feedback.textContent = "Try again";
      setTimeout(() => {
        buttons.forEach((b) => {
          b.disabled = false;
          b.classList.remove("wrong");
        });
        locked = false;
        feedback.textContent = "";
        feedback.className = "be-feedback";
      }, 750);
    }
  }

  function showDone() {
    const title = part === "positive" ? "Positive complete!" : "Negative complete!";
    const total = items.length;
    const stars = calcStars(partScore, Math.max(partAttempts, 1));
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="be-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="be-done">
        <div class="be-done-burst" id="be-burst">
          <div class="be-ring"></div>
          <div class="be-ring"></div>
        </div>
        <div class="be-done-inner">
          <div class="be-trophy" aria-hidden="true">${stars === 3 ? "🏆" : "🌟"}</div>
          <div class="be-stars" aria-hidden="true">
            <span class="be-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="be-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="be-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${title}</h1>
          <p>Great work with <strong>I am</strong> and <strong>You are</strong>.</p>
          <div class="be-done-score">${total} / ${total} complete · ${partScore}/${partAttempts} correct picks</div>
          <button class="be-btn" id="be-again">Practice again</button>
          <button class="be-btn secondary" id="be-other">${
            part === "positive" ? "Go to Negative →" : "Go to Positive →"
          }</button>
          <button class="be-btn secondary" id="be-home">Back to games</button>
        </div>
      </div>
    `;

    spawnConfetti(document.getElementById("be-burst"));

    document.getElementById("be-again").addEventListener("click", () => startPart(part));
    document.getElementById("be-other").addEventListener("click", () => {
      startPart(part === "positive" ? "negative" : "positive");
    });
    document.getElementById("be-home").addEventListener("click", () => {
      window.location.href = "../";
    });
  }

  // ========== INIT ==========
  showStart();
})();
