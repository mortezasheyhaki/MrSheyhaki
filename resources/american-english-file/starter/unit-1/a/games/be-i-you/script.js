/* I am / You are – Starter Unit 1A */
(function () {
  const POSITIVE = [
  {
    "id": 1,
    "sentence": "Hi. ______ Tony.",
    "blanks": [
      "I'm"
    ],
    "options": [
      "I'm",
      "You're"
    ],
    "full": "Hi. I'm Tony.",
    "image": "im-tony.png"
  },
  {
    "id": 2,
    "sentence": "Hello. ______ your teacher. ______ in my class.",
    "blanks": [
      "I'm",
      "You're"
    ],
    "options": [
      "I'm",
      "You're"
    ],
    "full": "Hello. I'm your teacher. You're in my class.",
    "image": "im-your-teacher.png"
  },
  {
    "id": 3,
    "sentence": "______ in room 4.",
    "blanks": [
      "I'm"
    ],
    "options": [
      "I'm",
      "You're"
    ],
    "full": "I'm in room 4.",
    "image": "im-in-room-4.png"
  },
  {
    "id": 4,
    "sentence": "______ in room 3.",
    "blanks": [
      "You're"
    ],
    "options": [
      "I'm",
      "You're"
    ],
    "full": "You're in room 3.",
    "image": "youre-in-room-3.png"
  },
  {
    "id": 5,
    "sentence": "Hello. ______ Maria. What's your name?",
    "blanks": [
      "I'm"
    ],
    "options": [
      "I'm",
      "You're"
    ],
    "full": "Hello. I'm Maria. What's your name?",
    "image": "im-maria.png"
  }
];
  const NEGATIVE = [
  {
    "id": 1,
    "sentence": "______ Tom. I'm Tony.",
    "blanks": [
      "I'm not"
    ],
    "options": [
      "I'm not",
      "You're not"
    ],
    "full": "I'm not Tom. I'm Tony.",
    "image": "im-not-tom.png"
  },
  {
    "id": 2,
    "sentence": "______ Marisa. I'm Maria.",
    "blanks": [
      "I'm not"
    ],
    "options": [
      "I'm not",
      "You're not"
    ],
    "full": "I'm not Marisa. I'm Maria.",
    "image": "im-not-marisa.png"
  },
  {
    "id": 3,
    "sentence": "______ in room 6. You're in room 7.",
    "blanks": [
      "You're not"
    ],
    "options": [
      "I'm not",
      "You're not"
    ],
    "full": "You're not in room 6. You're in room 7.",
    "image": "you-arent-in-room-6.png"
  },
  {
    "id": 4,
    "sentence": "______ in room 5.",
    "blanks": [
      "You're not"
    ],
    "options": [
      "I'm not",
      "You're not"
    ],
    "full": "You're not in room 5.",
    "image": "you-arent-in-room-5.png"
  }
];

  const app = document.getElementById("game-app");
  if (!app) return;

  let part = null;
  let index = 0;
  let items = [];
  let locked = false;
  let blankIndex = 0;

  function showStart() {
    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="be-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="be-start">
        <h1>I am / You are</h1>
        <p class="be-sub">Choose the correct form.<br>One sentence at a time.</p>
        <div class="be-part-pills">
          <button class="be-pill" data-part="positive">1 · Positive</button>
          <button class="be-pill" data-part="negative">2 · Negative</button>
        </div>
      </div>
    `;
    app.querySelectorAll("[data-part]").forEach((btn) => {
      btn.addEventListener("click", () => startPart(btn.dataset.part));
    });
  }

  function startPart(p) {
    part = p;
    items = p === "positive" ? POSITIVE.slice() : NEGATIVE.slice();
    index = 0;
    blankIndex = 0;
    locked = false;
    renderItem();
  }

  function buildSentenceHtml(item, filledCount) {
    let n = 0;
    return item.sentence.replace(/______/g, () => {
      if (n < filledCount) {
        const val = item.blanks[n];
        n++;
        return '<span class="blank filled">' + val + '</span>';
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
    const partLabel = part === "positive" ? "Positive · I am / You are" : "Negative · I'm not / You're not";
    blankIndex = Math.min(blankIndex, item.blanks.length - 1);

    app.innerHTML = `
      <div class="be-topbar">
        <a class="be-back-btn" href="#" id="be-back-start" title="Back to parts" aria-label="Back">←</a>
        <span class="be-topbar-title">${partLabel}</span>
        <span class="be-progress">${index + 1} / ${items.length}</span>
      </div>
      <div class="be-card">
        <div class="be-image-wrap has-image" id="be-img">
          <img alt="" src="images/${item.image}" onerror="this.parentElement.classList.remove('has-image'); this.style.display='none';">
        </div>
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

    if (choice === expected) {
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
        }, 1000);
      }
    } else {
      btn.classList.add("wrong");
      feedback.className = "be-feedback no";
      feedback.textContent = "Try again";
      setTimeout(() => {
        buttons.forEach((b) => {
          b.disabled = false;
          b.classList.remove("wrong");
        });
        locked = false;
        feedback.textContent = "";
      }, 750);
    }
  }

  function spawnConfetti(container) {
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6", "#a3e635"];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("span");
      el.className = "be-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 0.9) + "s";
      el.style.animationDuration = (2.2 + Math.random() * 1.4) + "s";
      el.style.width = (6 + Math.random() * 8) + "px";
      el.style.height = (8 + Math.random() * 10) + "px";
      container.appendChild(el);
    }
  }

  function showDone() {
    const title = part === "positive" ? "Positive complete!" : "Negative complete!";
    const total = items.length;
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
          <div class="be-trophy" aria-hidden="true">🏆</div>
          <div class="be-stars" aria-hidden="true">
            <span class="be-star">⭐</span>
            <span class="be-star">⭐</span>
            <span class="be-star">⭐</span>
          </div>
          <h1>${title}</h1>
          <p>Great work with <strong>I am</strong> and <strong>You are</strong>.</p>
          <div class="be-done-score">${total} / ${total} complete</div>
          <button class="be-btn" id="be-again">Practice again</button>
          <button class="be-btn secondary" id="be-other">${part === "positive" ? "Go to Negative →" : "Go to Positive →"}</button>
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

  showStart();
})();
