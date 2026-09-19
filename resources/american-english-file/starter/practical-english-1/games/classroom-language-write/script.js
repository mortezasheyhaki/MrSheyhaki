/* Classroom Language Write – look at the scene, write the phrase · PE1 */
(function () {
  const GAME_ID = "starter-pe1-classroom-language-write";

  const ITEMS = [
    { id: "look-board", label: "Look at the board, please.",
      image: "https://cdn.imgurl.ir/uploads/p826615_look-at-the-board.png", audio: "https://cdn.imgurl.ir/uploads/t63176_look-at-the-board.mp3",
      answers: ["look at the board please", "look at the board, please", "look at the board"] },
    { id: "sorry-late", label: "Sorry, I'm late.",
      image: "https://cdn.imgurl.ir/uploads/e195266_sorry-im-late.png", audio: "https://cdn.imgurl.ir/uploads/u759904_sorry-im-late.mp3",
      answers: ["sorry im late", "sorry i'm late", "sorry i am late"] },
    { id: "dont-know", label: "I don't know.",
      image: "https://cdn.imgurl.ir/uploads/g105297_i-dont-know.png", audio: "https://cdn.imgurl.ir/uploads/v35496_i-dont-know.mp3",
      answers: ["i dont know", "i don't know", "i do not know"] },
    { id: "dont-under", label: "I don't understand.",
      image: "https://cdn.imgurl.ir/uploads/i965470_i-dont-understand.png", audio: "https://cdn.imgurl.ir/uploads/e84120_i-dont-understand.mp3",
      answers: ["i dont understand", "i don't understand", "i do not understand"] },
    { id: "gracias", label: "Excuse me, what's \"gracias\" in English?",
      image: "https://cdn.imgurl.ir/uploads/g788943_whats-gracias.png", audio: "https://cdn.imgurl.ir/uploads/o602381_whats-gracias.mp3",
      answers: [
        "excuse me whats gracias in english",
        "excuse me what's gracias in english",
        "excuse me what is gracias in english",
        "whats gracias in english",
        "what's gracias in english",
        "what is gracias in english"
      ] },
    { id: "repeat", label: "Sorry, can you repeat that, please?",
      image: "https://cdn.imgurl.ir/uploads/i846999_can-you-rep.png", audio: "https://cdn.imgurl.ir/uploads/t250762_can-you-rep.mp3",
      answers: [
        "sorry can you repeat that please",
        "sorry can you repeat that, please",
        "can you repeat that please",
        "can you repeat that",
        "sorry can you repeat that"
      ] },
    { id: "spell", label: "How do you spell it?",
      image: "https://cdn.imgurl.ir/uploads/z267726_how-do-you-spell-it.png", audio: "https://cdn.imgurl.ir/uploads/p668959_how-do-you-spell-it.mp3",
      answers: ["how do you spell it"] },
    { id: "sit", label: "Sit down.",
      image: "https://cdn.imgurl.ir/uploads/e602807_sit-down.png", audio: "https://cdn.imgurl.ir/uploads/r83490_sit-down.mp3",
      answers: ["sit down", "sit down please", "sit down, please"] },
    { id: "stand", label: "Stand up, please.",
      image: "https://cdn.imgurl.ir/uploads/m612408_stand-up.png", audio: "https://cdn.imgurl.ir/uploads/562935_stand-up.mp3",
      answers: ["stand up please", "stand up, please", "stand up"] },
    { id: "close", label: "Close your books.",
      image: "https://cdn.imgurl.ir/uploads/v60268_close-your-books.png", audio: "https://cdn.imgurl.ir/uploads/q78409_close-your-books.mp3",
      answers: ["close your books", "close your book"] },
    { id: "page", label: "Go to page ten.",
      image: "https://cdn.imgurl.ir/uploads/y887190_go-to-page.png", audio: "https://cdn.imgurl.ir/uploads/e185615_go-to-page.mp3",
      answers: ["go to page ten", "go to page 10"] },
    { id: "open", label: "Open your books.",
      image: "https://cdn.imgurl.ir/uploads/e652197_open-your-books.png", audio: "https://cdn.imgurl.ir/uploads/b36642_open-your-books.mp3",
      answers: ["open your books", "open your book"] },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let autoTimer = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    return item.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playItemAudio(item) {
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function clearAuto() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    clearAuto();
    order = shuffle(ITEMS);
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    phase = "play";
    render();
  }

  function checkAnswer() {
    if (answered) return;
    const input = document.getElementById("cw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrect(lastUserInput, item);
    if (lastCorrect) correctCount += 1;
    answered = true;
    stopAudio();
    if (input) {
      input.classList.add(lastCorrect ? "cw-ok" : "cw-bad");
      input.blur();
    }
    const checkBtn = document.getElementById("cw-check");
    if (checkBtn) checkBtn.disabled = true;
    setTimeout(() => {
      phase = "feedback";
      render();
    }, lastCorrect ? 280 : 380);
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    stopAudio();
    phase = "feedback";
    render();
  }

  function nextItem() {
    clearAuto();
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    const total = ITEMS.length;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
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

  function spawnSparks(el) {
    if (!el) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement("span");
      s.className = "cw-spark";
      const angle = (i / 10) * Math.PI * 2;
      const dist = 32 + Math.random() * 22;
      s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      s.style.setProperty("--delay", (i * 0.02) + "s");
      el.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }

  function render() {
    clearAuto();

    if (phase === "menu") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="../" aria-label="Back">←</a>
          <span class="cw-title">Classroom Language Write</span>
          <span class="cw-badge">PE1</span>
        </header>
        <section class="cw-start">
          <div class="cw-hero" aria-hidden="true">💬</div>
          <h1>Classroom Language</h1>
          <p class="cw-desc">Look at the scene and write the phrase.<br>12 classroom language sentences</p>
          <button type="button" class="cw-btn" id="cw-start">Start →</button>
        </section>`;
      document.getElementById("cw-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="pe-again">Again</button>`;
      document.getElementById("pe-again").onclick = () => { phase = 'start'; render(); };
      return;
    }

    const item = order[index];
    const progress = `${index + 1} / ${order.length}`;
    const pct = phase === "feedback"
      ? ((index + 1) / order.length) * 100
      : (index / order.length) * 100;

    if (phase === "play") {
      app.innerHTML = `
        <header class="cw-topbar">
          <a class="cw-back" href="#" id="cw-back" aria-label="Back">←</a>
          <span class="cw-title">Write the phrase</span>
          <span class="cw-progress">${progress}</span>
        </header>
        <div class="cw-bar"><div class="cw-bar-fill" style="width:${pct}%"></div></div>
        <p class="cw-instruction">Look at the scene. What do they say?</p>
        <section class="cw-play-area">
          <div class="cw-pic-wrap cw-pic-wide">
            <img class="cw-pic" src="${item.image}" alt="Classroom scene" draggable="false">
          </div>
          <div class="cw-input-wrap">
            <input type="text" id="cw-input" class="cw-input"
              placeholder="Type the sentence…"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
          </div>
          <div class="cw-actions">
            <button type="button" class="cw-btn" id="cw-check" disabled>Check</button>
            <button type="button" class="cw-skip" id="cw-skip">Skip →</button>
          </div>
        </section>`;

      document.getElementById("cw-back").onclick = (e) => {
        e.preventDefault();
        stopAudio();
        phase = "menu";
        render();
      };
      const input = document.getElementById("cw-input");
      const checkBtn = document.getElementById("cw-check");
      input.focus();
      checkBtn.onclick = checkAnswer;
      document.getElementById("cw-skip").onclick = skipAnswer;
      const sync = () => { checkBtn.disabled = !input.value.trim(); };
      input.addEventListener("input", sync);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkAnswer();
      });
      return;
    }

    // feedback
    app.innerHTML = `
      <header class="cw-topbar">
        <a class="cw-back" href="#" id="cw-back" aria-label="Back">←</a>
        <span class="cw-title">Write the phrase</span>
        <span class="cw-progress">${progress}</span>
      </header>
      <div class="cw-bar"><div class="cw-bar-fill" style="width:${pct}%"></div></div>
      <section class="cw-feedback ${lastCorrect ? "is-correct" : lastSkipped ? "is-skip" : "is-wrong"}">
        <div class="cw-result-icon">${lastCorrect ? "✅" : lastSkipped ? "⏭️" : "❌"}</div>
        <h2>${lastCorrect ? "Correct!" : lastSkipped ? "Skipped" : "Not quite"}</h2>
        <div class="cw-answer-card">
          <img class="cw-answer-img" src="${item.image}" alt="">
          <strong>${item.label}</strong>
        </div>
        ${!lastSkipped ? `<p class="cw-your">You wrote: <em>${(lastUserInput || "—").trim() || "—"}</em></p>` : ""}
        <button type="button" class="cw-btn" id="cw-next">${index < order.length - 1 ? "Next →" : "See results →"}</button>
      </section>`;

    document.getElementById("cw-back").onclick = (e) => {
      e.preventDefault();
      stopAudio();
      phase = "menu";
      render();
    };
    const nextBtn = document.getElementById("cw-next");
    nextBtn.onclick = nextItem;
    if (lastCorrect) {
      const card = app.querySelector(".cw-answer-card");
      setTimeout(() => spawnSparks(card), 80);
      playItemAudio(item);
      nextBtn.disabled = true;
      nextBtn.style.opacity = "0.6";
      autoTimer = setTimeout(() => nextItem(), 1400);
    }
  }

  render();
})();
