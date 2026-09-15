/* Listen & Complete · AEF Starter Unit 3B – 3.16 */
(function () {
  const GAME_ID = "starter-3b-listen-complete";

  // Answers from AEF Starter 3.16
  const ITEMS = [
    {
      id: 1,
      lines: [
        { before: "How much is this ", after: "?", answers: ["mug"] },
        { before: "It's $", after: ".", answers: ["9", "nine"] },
      ],
    },
    {
      id: 2,
      lines: [
        { before: "How much is that ", after: "?", answers: ["cap"] },
        { before: "It's $", after: ".", answers: ["12", "twelve"] },
      ],
    },
    {
      id: 3,
      lines: [
        { before: "How much are these ", after: "?", answers: ["toys"] },
        { before: "They're $", after: ".", answers: ["15", "fifteen"] },
      ],
    },
    {
      id: 4,
      lines: [
        { before: "How much are those ", after: "?", answers: ["t-shirts", "tshirts", "t shirts"] },
        { before: "They're $", after: ".", answers: ["20", "twenty"] },
      ],
    },
    {
      id: 5,
      lines: [
        { before: "Two ", after: ", please.", answers: ["caps"] },
        { before: "That's $", after: ".", answers: ["24", "twenty-four", "twenty four"] },
      ],
    },
  ];

  const app = document.getElementById("game-app");
  let phase = "play"; // play | done
  let listensLeft = 3;
  let attempts = 0;
  let correctCount = 0;
  let audio = null;
  let playing = false;
  let playRecorded = false;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s\-]/g, "")
      .replace(/\s+/g, " ");
  }

  function checkBlank(value, answers) {
    const n = normalize(value);
    return answers.some((a) => normalize(a) === n);
  }

  function updateStars() {
    if (!window.LAStars) return;
    const stars = correctCount >= 5 ? 3 : correctCount >= 3 ? 2 : correctCount >= 1 ? 1 : 0;
    if (stars > 0) {
      if (!playRecorded) {
        LAStars.recordPlay(GAME_ID);
        playRecorded = true;
      }
      LAStars.save(GAME_ID, stars);
    }
  }

  function playAudio() {
    if (!audio) {
      audio = new Audio("audio/3.16.mp3");
    }
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      playing = false;
      document.getElementById("lw-play")?.classList.remove("playing");
      return;
    }
    audio.play().catch(() => {});
    playing = true;
    document.getElementById("lw-play")?.classList.add("playing");
    audio.onended = () => {
      playing = false;
      document.getElementById("lw-play")?.classList.remove("playing");
      if (listensLeft > 0) {
        listensLeft--;
        const el = document.getElementById("listens-left");
        if (el) el.textContent = listensLeft;
      }
    };
  }

  function checkRow(idx) {
    const item = ITEMS[idx];
    const row = document.getElementById("row-" + idx);
    if (!row || row.classList.contains("is-correct")) return;

    attempts++;
    const attEl = document.getElementById("attempts");
    if (attEl) attEl.textContent = attempts;

    let allOk = true;
    item.lines.forEach((line, li) => {
      const input = document.getElementById("blank-" + idx + "-" + li);
      if (!input) return;
      const ok = checkBlank(input.value, line.answers);
      input.classList.toggle("is-correct", ok);
      input.classList.toggle("is-wrong", !ok);
      if (!ok) allOk = false;
    });

    if (allOk) {
      row.classList.remove("is-wrong");
      row.classList.add("is-correct");
      correctCount++;
      updateStars();
      // disable inputs
      item.lines.forEach((_, li) => {
        const input = document.getElementById("blank-" + idx + "-" + li);
        if (input) input.disabled = true;
      });
      if (correctCount === ITEMS.length) {
        setTimeout(() => {
          phase = "done";
          render();
        }, 700);
      }
    } else {
      row.classList.add("is-wrong");
      setTimeout(() => row.classList.remove("is-wrong"), 600);
    }
  }

  function render() {
    if (phase === "done") {
      const stars = correctCount >= 5 ? 3 : correctCount >= 3 ? 2 : correctCount >= 1 ? 1 : 0;
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <div class="mc-title-wrap">
            <span class="mc-unit">Unit 3B</span>
            <span class="mc-title">Listen &amp; Complete</span>
          </div>
          <div class="mc-stats"></div>
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
          <p>You completed <strong>${correctCount} / ${ITEMS.length}</strong> conversations.</p>
          <button type="button" class="mc-btn" id="again">Play again</button>
          <button type="button" class="mc-btn secondary" id="back">Back to games</button>
        </section>`;
      document.getElementById("again").onclick = () => {
        phase = "play";
        listensLeft = 3;
        attempts = 0;
        correctCount = 0;
        render();
      };
      document.getElementById("back").onclick = () => { location.href = "../"; };
      return;
    }

    // Play screen
    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <div class="mc-title-wrap">
          <span class="mc-unit">Unit 3B</span>
          <span class="mc-title">Listen &amp; Complete</span>
        </div>
        <div class="mc-stats">
          <span>LISTENS <strong id="listens-left">${listensLeft}</strong></span>
          <span>ATTEMPTS <strong id="attempts">${attempts}</strong></span>
        </div>
      </header>

      <p class="mc-instruction">Listen and complete the conversations with words and numbers.</p>

      <div class="lw-audio-card">
        <button type="button" class="lw-play" id="lw-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <span class="lw-play-hint">Tap to listen</span>
      </div>

      <div class="lw-list">
        ${ITEMS.map((item, idx) => `
          <div class="lw-row" id="row-${idx}">
            <span class="lw-num">${item.id}</span>
            <div class="lw-fields">
              ${item.lines.map((line, li) => `
                <div class="lw-line">
                  ${line.before}<input type="text" class="blank" id="blank-${idx}-${li}"
                    autocomplete="off" autocorrect="off" spellcheck="false"
                    placeholder="…" />${line.after}
                </div>
              `).join("")}
            </div>
            <button type="button" class="lw-check" data-idx="${idx}" aria-label="Check">✓</button>
          </div>
        `).join("")}
      </div>
    `;

    document.getElementById("lw-play").onclick = playAudio;

    document.querySelectorAll(".lw-check").forEach((btn) => {
      btn.onclick = () => checkRow(+btn.dataset.idx);
    });

    // Enter key support
    document.querySelectorAll(".blank").forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const id = input.id; // blank-0-0
          const idx = +id.split("-")[1];
          checkRow(idx);
        }
      });
    });
  }

  render();
})();
