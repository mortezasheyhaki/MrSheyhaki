/* Singular ↔ Plural Sentences · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-sing-plur-sentences";

  // Prompt sentence → expected opposite form(s)
  const ITEMS = [
    {
      prompt: "It's a pen.",
      answers: ["they're pens", "they are pens"],
      label: "They're pens.",
      task: "plural",
    },
    {
      prompt: "They're phones.",
      answers: ["it's a phone", "it is a phone"],
      label: "It's a phone.",
      task: "singular",
    },
    {
      prompt: "It's a watch.",
      answers: ["they're watches", "they are watches"],
      label: "They're watches.",
      task: "plural",
    },
    {
      prompt: "They're umbrellas.",
      answers: ["it's an umbrella", "it is an umbrella", "it's a umbrella", "it is a umbrella"],
      label: "It's an umbrella.",
      task: "singular",
    },
    {
      prompt: "It's a dictionary.",
      answers: ["they're dictionaries", "they are dictionaries"],
      label: "They're dictionaries.",
      task: "plural",
    },
    {
      prompt: "It's a key.",
      answers: ["they're keys", "they are keys"],
      label: "They're keys.",
      task: "plural",
    },
    {
      prompt: "It's a city.",
      answers: ["they're cities", "they are cities"],
      label: "They're cities.",
      task: "plural",
    },
    {
      prompt: "They're emails.",
      answers: ["it's an email", "it is an email", "it's a email", "it is a email"],
      label: "It's an email.",
      task: "singular",
    },
    {
      prompt: "It's a passport.",
      answers: ["they're passports", "they are passports"],
      label: "They're passports.",
      task: "plural",
    },
    {
      prompt: "They're tablets.",
      answers: ["it's a tablet", "it is a tablet"],
      label: "It's a tablet.",
      task: "singular",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let idx = 0;
  let score = 0;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.?!,]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    return answers.some((a) => normalize(a) === u);
  }

  function start() {
    order = shuffle(ITEMS.slice());
    idx = 0;
    score = 0;
    locked = false;
    phase = "play";
    render();
  }

  function loadItem() {
    locked = false;
    render();
    setTimeout(() => {
      const input = document.getElementById("sp-input");
      if (input) input.focus();
    }, 120);
  }

  function check() {
    if (locked) return;
    const input = document.getElementById("sp-input");
    if (!input) return;
    const user = input.value;
    if (!normalize(user)) {
      input.focus();
      return;
    }

    locked = true;
    input.disabled = true;
    const btn = document.getElementById("sp-check");
    if (btn) btn.disabled = true;

    const item = order[idx];
    const ok = isCorrect(user, item.answers);
    const fb = document.getElementById("sp-feedback");

    if (ok) {
      score += 1;
      input.classList.add("is-correct");
      if (fb) {
        fb.textContent = "Correct!";
        fb.className = "sp-feedback ok";
      }
    } else {
      input.classList.add("is-wrong");
      if (fb) {
        fb.textContent = item.label;
        fb.className = "sp-feedback bad";
      }
    }

    setTimeout(() => {
      if (idx < order.length - 1) {
        idx += 1;
        loadItem();
      } else {
        phase = "done";
        render();
      }
    }, ok ? 900 : 1600);
  }

  function calcStars() {
    const t = ITEMS.length;
    if (score >= t - 1) return 3;
    if (score >= Math.ceil(t * 0.66)) return 2;
    if (score >= Math.ceil(t * 0.33)) return 1;
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

  function taskHint(task) {
    return task === "plural"
      ? "Write the plural sentence"
      : "Write the singular sentence";
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Singular ↔ Plural</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">✍️</div>
          <h1>Singular ↔ Plural</h1>
          <p class="mc-desc">Change each sentence to singular or plural · 10 sentences</p>
          <div class="sp-menu-chips">
            <span class="sp-chip is-plural">It's a… → They're…</span>
            <span class="sp-chip is-singular">They're… → It's a…</span>
          </div>
          <button type="button" class="mc-btn" id="sp-start">Start</button>
        </section>`;
      document.getElementById("sp-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Singular ↔ Plural</span>
          <span class="mc-badge">Done</span>
        </header>
        <section class="mc-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div>
            </div>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You got <strong>${score} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="mc-btn" id="sp-again">Play again</button>
        </section>`;
      document.getElementById("sp-again").onclick = () => start();
      return;
    }

    // play — no scroll, big center
    const item = order[idx];
    const taskClass = item.task === "plural" ? "is-plural" : "is-singular";
    const taskIcon = item.task === "plural" ? "📚" : "📖";
    const pct = Math.round((idx / order.length) * 100);
    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Singular ↔ Plural</span>
        <span class="mc-progress">${idx + 1} / ${order.length}</span>
      </header>
      <div class="sp-stage">
        <div class="sp-progress-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        <div class="sp-card ${taskClass}">
          <div class="sp-task-pill ${taskClass}">
            <span class="sp-task-icon">${taskIcon}</span>
            <span>${taskHint(item.task)}</span>
          </div>
          <p class="sp-prompt">${item.prompt}</p>
          <div class="sp-arrow" aria-hidden="true">↓</div>
          <input type="text" id="sp-input" class="sp-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer…" enterkeyhint="done">
          <p class="sp-feedback" id="sp-feedback"></p>
        </div>
        <button type="button" class="mc-btn sp-check-btn" id="sp-check">Check</button>
      </div>`;

    document.getElementById("sp-check").onclick = () => check();
    document.getElementById("sp-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    });
    setTimeout(() => {
      const input = document.getElementById("sp-input");
      if (input) input.focus();
    }, 80);
  }

  render();
})();
