/* Listen & Choose – PE1 alphabet pairs */
(function () {
  const GAME_ID = "starter-pe1-listen-choose";

  // Pairs from the book: [optionA, optionB, correct]
  // Audio files 1–12 match the correct letter in each item
  const ITEMS = [
    { id: 1,  options: ["E", "A"], correct: "A" },
    { id: 2,  options: ["E", "I"], correct: "E" },
    { id: 3,  options: ["U", "W"], correct: "W" },
    { id: 4,  options: ["Y", "I"], correct: "I" },
    { id: 5,  options: ["B", "P"], correct: "B" },
    { id: 6,  options: ["B", "V"], correct: "V" },
    { id: 7,  options: ["G", "J"], correct: "J" },
    { id: 8,  options: ["K", "Q"], correct: "K" },
    { id: 9,  options: ["M", "N"], correct: "N" },
    { id: 10, options: ["S", "C"], correct: "C" },
    { id: 11, options: ["D", "T"], correct: "T" },
    { id: 12, options: ["W", "V"], correct: "W" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let order = [];
  let index = 0;
  let score = 0;
  let results = []; // true/false per item
  let audio = null;
  let locked = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function playCurrent() {
    if (audio) {
      try { audio.pause(); } catch (_) {}
    }
    const item = order[index];
    audio = new Audio(`audio/${item.id}.mp3`);
    const btn = document.getElementById("lc-play");
    if (btn) btn.classList.add("playing");
    audio.play().catch(() => {});
    audio.onended = () => {
      if (btn) btn.classList.remove("playing");
    };
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function showStart() {
    app.innerHTML = `
      <header class="lc-topbar">
        <a class="lc-back" href="../" aria-label="Back">←</a>
        <span class="lc-title">Listen & Choose</span>
        <span class="lc-badge">PE1</span>
      </header>
      <section class="lc-start">
        <h1>Listen & Choose</h1>
        <p>Listen to the letter. Then choose the correct one.<br>
        Some letters sound similar — listen carefully!</p>
        <button type="button" class="lc-btn" id="lc-go">Start</button>
      </section>`;
    document.getElementById("lc-go").onclick = startGame;
  }

  function startGame() {
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    results = [];
    locked = false;
    renderRound();
  }

  function renderRound() {
    locked = false;
    const item = order[index];
    // shuffle left/right presentation of the two options
    const opts = shuffle(item.options);

    app.innerHTML = `
      <header class="lc-topbar">
        <a class="lc-back" href="#" id="lc-back" aria-label="Back">←</a>
        <span class="lc-title">Listen & Choose</span>
        <span class="lc-badge">${index + 1} / ${order.length}</span>
      </header>
      <div class="lc-stage">
        <div class="lc-progress">Which letter do you hear?</div>
        <div class="lc-speaker-wrap">
          <button type="button" class="lf-play" id="lc-play" aria-label="Play sound">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <div class="lc-listen-hint">Tap to listen again</div>
        </div>
        <div class="lc-choices">
          ${opts.map((L) =>
            `<button type="button" class="lc-choice" data-letter="${L}">${L}</button>`
          ).join("")}
        </div>
        <div class="lc-feedback" id="lc-fb"></div>
        <div class="lc-dots" aria-hidden="true">
          ${order.map((_, i) => {
            let cls = "lc-dot";
            if (i === index) cls += " on";
            else if (i < results.length) cls += results[i] ? " done" : " miss";
            return `<span class="${cls}"></span>`;
          }).join("")}
        </div>
      </div>`;

    document.getElementById("lc-back").onclick = (e) => {
      e.preventDefault();
      showStart();
    };
    document.getElementById("lc-play").onclick = playCurrent;
    document.querySelectorAll(".lc-choice").forEach((btn) => {
      btn.onclick = () => onChoose(btn.dataset.letter, btn);
    });

    setTimeout(playCurrent, 350);
  }

  function onChoose(letter, btn) {
    if (locked) return;
    locked = true;
    const item = order[index];
    const ok = letter === item.correct;
    results.push(ok);
    if (ok) score++;

    const fb = document.getElementById("lc-fb");
    document.querySelectorAll(".lc-choice").forEach((b) => {
      b.disabled = true;
      if (b.dataset.letter === item.correct) {
        b.classList.add("correct");
      } else if (b === btn && !ok) {
        b.classList.add("wrong");
      } else {
        b.classList.add("dim");
      }
    });

    if (ok) {
      fb.textContent = "Yes! ✓";
      fb.className = "lc-feedback ok";
    } else {
      fb.textContent = `No — it’s ${item.correct}`;
      fb.className = "lc-feedback no";
      // play again so they hear the correct one
      setTimeout(playCurrent, 400);
    }

    setTimeout(() => {
      if (index < order.length - 1) {
        index++;
        renderRound();
      } else {
        showDone();
      }
    }, ok ? 900 : 1400);
  }

  function showDone() {
    const total = order.length;
    const stars = score >= total ? 3 : score >= total - 2 ? 2 : score >= total / 2 ? 1 : 0;
    saveStars(stars);
    const starStr = "⭐".repeat(stars) + "☆".repeat(3 - stars);
    app.innerHTML = `
      <header class="lc-topbar">
        <a class="lc-back" href="../" aria-label="Back">←</a>
        <span class="lc-title">Complete</span>
        <span class="lc-badge">✓</span>
      </header>
      <section class="lc-done">
        <div class="lc-stars">${starStr}</div>
        <h1>${score === total ? "Perfect!" : "Nice work!"}</h1>
        <p>You got <strong>${score}</strong> out of <strong>${total}</strong> correct.</p>
        <button type="button" class="lc-btn" id="lc-again">Play again</button>
        <button type="button" class="lc-btn secondary" id="lc-home">Back to games</button>
      </section>`;
    document.getElementById("lc-again").onclick = startGame;
    document.getElementById("lc-home").onclick = () => {
      window.location.href = "../";
    };
  }

  showStart();
})();
