/* Make Questions – Starter Unit 1A (strict + celebration) */
(function () {
  const GAME_ID = "starter-1a-make-questions";
  const ITEMS = [
  {
    "id": 1,
    "prompt": "You're Sam.",
    "answer": "Are you Sam?"
  },
  {
    "id": 2,
    "prompt": "I'm in room 4.",
    "answer": "Am I in room 4?"
  },
  {
    "id": 3,
    "prompt": "You're Silvia.",
    "answer": "Are you Silvia?"
  },
  {
    "id": 4,
    "prompt": "I'm in room 3.",
    "answer": "Am I in room 3?"
  },
  {
    "id": 5,
    "prompt": "You're Mr. Sheyhaki.",
    "answer": "Are you Mr. Sheyhaki?"
  },
  {
    "id": 6,
    "prompt": "I'm a student.",
    "answer": "Am I a student?"
  }
];

  const app = document.getElementById("game-app");
  if (!app) return;

  let index = 0;
  let locked = false;
  let correctAttempts = 0;
  let totalAttempts = 0;

  function clean(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[\u2018\u2019\u0060]/g, "'");
  }

  function isCorrect(user, answer) {
    const u = clean(user);
    if (!u) return false;
    if (!/^[A-Z]/.test(u)) return false;
    if (!u.endsWith("?")) return false;
    return u === answer;
  }

  function feedbackHint(user) {
    const u = clean(user);
    if (!u) return "Type the question.";
    const needsCap = !/^[A-Z]/.test(u);
    const needsQ = !u.endsWith("?");
    if (needsCap && needsQ) return "Start with a capital letter and end with ?";
    if (needsCap) return "Start with a capital letter (Am / Are).";
    if (needsQ) return "Add a question mark (?) at the end.";
    return "Check spelling and word order.";
  }

  function showStart() {
    app.innerHTML = `
      <div class="mq-topbar">
        <a class="mq-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="mq-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="mq-start">
        <h1>Make Questions</h1>
        <p>Change each sentence into a question.<br>Start with a <strong>capital letter</strong> and end with <strong>?</strong></p>
        <button class="mq-btn" id="mq-start-btn">Start</button>
      </div>
    `;
    document.getElementById("mq-start-btn").addEventListener("click", () => {
      index = 0;
      locked = false;
      correctAttempts = 0;
      totalAttempts = 0;
      renderItem();
    });
  }

  function renderItem() {
    if (index >= ITEMS.length) {
      showDone();
      return;
    }
    const item = ITEMS[index];
    app.innerHTML = `
      <div class="mq-topbar">
        <a class="mq-back-btn" href="#" id="mq-back" title="Back" aria-label="Back">←</a>
        <span class="mq-topbar-title">Make Questions</span>
        <span class="mq-progress">${index + 1} / ${ITEMS.length}</span>
      </div>
      <div class="mq-card">
        <div class="mq-label">Change to a question</div>
        <p class="mq-prompt">${item.prompt}</p>
        <div class="mq-input-wrap">
          <input class="mq-input" id="mq-input" type="text" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="e.g. Are you…?" />
        </div>
        <button class="mq-check" id="mq-check">Check</button>
        <div class="mq-feedback" id="mq-feedback"></div>
        <div class="mq-hint" id="mq-hint"></div>
      </div>
    `;

    document.getElementById("mq-back").addEventListener("click", (e) => {
      e.preventDefault();
      showStart();
    });

    const input = document.getElementById("mq-input");
    const checkBtn = document.getElementById("mq-check");
    input.focus();

    function submit() {
      if (locked) return;
      const val = input.value;
      if (!val.trim()) {
        input.focus();
        return;
      }
      locked = true;
      checkBtn.disabled = true;
      const feedback = document.getElementById("mq-feedback");
      const hint = document.getElementById("mq-hint");

      totalAttempts++;
      if (isCorrect(val, item.answer)) {
        correctAttempts++;
        input.classList.add("correct");
        feedback.className = "mq-feedback ok";
        feedback.textContent = "✓ " + item.answer;
        hint.textContent = "";
        setTimeout(() => {
          const card = app.querySelector(".mq-card");
          if (card) card.classList.add("mq-leaving");
          setTimeout(() => {
            index++;
            locked = false;
            renderItem();
          }, 220);
        }, 900);
      } else {
        input.classList.add("wrong");
        feedback.className = "mq-feedback no";
        feedback.textContent = "Not quite — try again";
        hint.textContent = feedbackHint(val);
        setTimeout(() => {
          input.classList.remove("wrong");
          feedback.textContent = "";
          locked = false;
          checkBtn.disabled = false;
          input.focus();
          input.select();
        }, 1400);
      }
    }

    checkBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  }

  function spawnConfetti(container) {
    const colors = ["#7c5cff", "#ec4899", "#f59e0b", "#22c55e", "#38bdf8", "#f472b6", "#a3e635"];
    for (let i = 0; i < 48; i++) {
      const el = document.createElement("span");
      el.className = "mq-confetti";
      el.style.left = Math.random() * 100 + "%";
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 0.9) + "s";
      el.style.animationDuration = (2.2 + Math.random() * 1.4) + "s";
      el.style.width = (6 + Math.random() * 8) + "px";
      el.style.height = (8 + Math.random() * 10) + "px";
      el.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
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
    const stars = calcStars(correctAttempts, Math.max(totalAttempts, 1));
    if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); }
    app.innerHTML = `
      <div class="mq-topbar">
        <a class="mq-back-btn" href="../" title="Back to Unit 1A Games" aria-label="Back">←</a>
        <span class="mq-topbar-title">Unit 1A · Games</span>
      </div>
      <div class="mq-done">
        <div class="mq-done-burst" id="mq-burst">
          <div class="mq-ring"></div>
          <div class="mq-ring"></div>
        </div>
        <div class="mq-done-inner">
          <div class="mq-trophy" aria-hidden="true">${stars === 3 ? "🏆" : "🌟"}</div>
          <div class="mq-stars" aria-hidden="true">
            <span class="mq-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="mq-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="mq-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : "Well done!"}</h1>
          <p>You made all the questions.</p>
          <div class="mq-done-score">${ITEMS.length} / ${ITEMS.length} complete · ${correctAttempts}/${totalAttempts} correct tries</div>
          <button class="mq-btn" id="mq-again">Practice again</button>
          <button class="mq-btn secondary" id="mq-home">Back to games</button>
        </div>
      </div>
    `;

    if (stars >= 2) spawnConfetti(document.getElementById("mq-burst"));

    document.getElementById("mq-again").addEventListener("click", () => {
      index = 0;
      locked = false;
      correctAttempts = 0;
      totalAttempts = 0;
      renderItem();
    });
    document.getElementById("mq-home").addEventListener("click", () => {
      window.location.href = "../";
    });
  }

  showStart();
})();
