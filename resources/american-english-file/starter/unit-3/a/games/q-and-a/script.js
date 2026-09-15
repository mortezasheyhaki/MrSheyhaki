/* Ask & Answer – write question + answer · AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-ask-answer";

  const ITEMS = [
    {
      id: "laptop",
      image: "images/laptop.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a laptop", "it is a laptop", "a laptop"],
      qLabel: "What is it?",
      aLabel: "It's a laptop.",
    },
    {
      id: "watches",
      image: "images/watches.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're watches", "they are watches", "watches"],
      qLabel: "What are they?",
      aLabel: "They're watches.",
    },
    {
      id: "coat",
      image: "images/coat.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a coat", "it is a coat", "a coat"],
      qLabel: "What is it?",
      aLabel: "It's a coat.",
    },
    {
      id: "keys",
      image: "images/keys.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're keys", "they are keys", "keys"],
      qLabel: "What are they?",
      aLabel: "They're keys.",
    },
    {
      id: "umbrella",
      image: "images/umbrella.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's an umbrella", "it is an umbrella", "an umbrella", "it's a umbrella", "a umbrella"],
      qLabel: "What is it?",
      aLabel: "It's an umbrella.",
    },
    {
      id: "id-card",
      image: "images/id-card.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's an id card", "it is an id card", "an id card", "it's a id card", "id card", "it's an identity card"],
      qLabel: "What is it?",
      aLabel: "It's an ID card.",
    },
    {
      id: "charger",
      image: "images/charger.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a charger", "it is a charger", "a charger"],
      qLabel: "What is it?",
      aLabel: "It's a charger.",
    },
    {
      id: "glasses",
      image: "images/glasses.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're glasses", "they are glasses", "glasses"],
      qLabel: "What are they?",
      aLabel: "They're glasses.",
    },
    {
      id: "purse",
      image: "images/purse.png",
      type: "singular",
      qAnswers: ["what is it", "what's it"],
      aAnswers: ["it's a purse", "it is a purse", "a purse", "it's a bag", "a bag"],
      qLabel: "What is it?",
      aLabel: "It's a purse.",
    },
    {
      id: "books",
      image: "images/books.png",
      type: "plural",
      qAnswers: ["what are they"],
      aAnswers: ["they're books", "they are books", "books"],
      qLabel: "What are they?",
      aLabel: "They're books.",
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

  function matchAny(user, list) {
    const u = normalize(user);
    if (!u) return false;
    return list.some((a) => normalize(a) === u);
  }

  function start() {
    order = shuffle(ITEMS.slice());
    idx = 0;
    score = 0;
    locked = false;
    phase = "play";
    render();
  }

  function check() {
    if (locked) return;
    const qEl = document.getElementById("qa-q");
    const aEl = document.getElementById("qa-a");
    if (!qEl || !aEl) return;

    const qVal = qEl.value;
    const aVal = aEl.value;
    if (!normalize(qVal) && !normalize(aVal)) {
      qEl.focus();
      return;
    }

    locked = true;
    qEl.disabled = true;
    aEl.disabled = true;
    const btn = document.getElementById("qa-check");
    if (btn) btn.disabled = true;

    const item = order[idx];
    const qOk = matchAny(qVal, item.qAnswers);
    const aOk = matchAny(aVal, item.aAnswers);
    const both = qOk && aOk;

    if (qOk) qEl.classList.add("is-correct");
    else qEl.classList.add("is-wrong");
    if (aOk) aEl.classList.add("is-correct");
    else aEl.classList.add("is-wrong");

    if (both) score += 1;

    const fb = document.getElementById("qa-feedback");
    if (fb) {
      if (both) {
        fb.textContent = "Correct!";
        fb.className = "qa-feedback ok";
      } else {
        fb.innerHTML = item.qLabel + "<br>" + item.aLabel;
        fb.className = "qa-feedback bad";
      }
    }

    setTimeout(() => {
      if (idx < order.length - 1) {
        idx += 1;
        locked = false;
        render();
      } else {
        phase = "done";
        render();
      }
    }, both ? 900 : 1800);
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Ask & Answer</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">❓</div>
          <h1>Ask & Answer</h1>
          <p class="mc-desc">Look at the picture. Write the question and the answer.</p>
          <div class="qa-menu-chips">
            <span class="qa-chip is-sing">What is it? → It's a…</span>
            <span class="qa-chip is-plur">What are they? → They're…</span>
          </div>
          <button type="button" class="mc-btn" id="qa-start">Start</button>
        </section>`;
      document.getElementById("qa-start").onclick = () => start();
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Ask & Answer</span>
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
          <button type="button" class="mc-btn" id="qa-again">Play again</button>
        </section>`;
      document.getElementById("qa-again").onclick = () => start();
      return;
    }

    const item = order[idx];
    const typeClass = item.type === "plural" ? "is-plural" : "is-singular";

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">Ask & Answer</span>
        <span class="mc-progress">${idx + 1} / ${order.length}</span>
      </header>
      <div class="qa-stage">
        <div class="qa-card ${typeClass}">
          <div class="qa-pic-wrap">
            <img class="qa-pic" src="${item.image}" alt="Look" draggable="false">
          </div>
          <div class="qa-fields">
            <label class="qa-label">Question</label>
            <input type="text" id="qa-q" class="qa-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="What is it? / What are they?" enterkeyhint="next">
            <label class="qa-label">Answer</label>
            <input type="text" id="qa-a" class="qa-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="It's a… / They're…" enterkeyhint="done">
          </div>
          <p class="qa-feedback" id="qa-feedback"></p>
        </div>
        <button type="button" class="mc-btn qa-check-btn" id="qa-check">Check</button>
      </div>`;

    document.getElementById("qa-check").onclick = () => check();
    const qEl = document.getElementById("qa-q");
    const aEl = document.getElementById("qa-a");
    qEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        aEl.focus();
      }
    });
    aEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    });
    setTimeout(() => qEl.focus(), 80);
  }

  render();
})();
