/* Listen & Write – 5 conversations, write the things you hear – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-listen-and-write";

  // The five short conversations in the audio. Players write the main "thing" heard.
  const ITEMS = [
    {
      id: 1,
      accepted: [
        "laptops", "laptop", "your laptops", "take out your laptops",
        "all laptops", "laptops out"
      ],
      display: "laptops"
    },
    {
      id: 2,
      accepted: [
        "cell phones", "cellphones", "cell phone", "cellphone",
        "phones", "mobile phones", "electronic devices",
        "cell phones and electronic devices", "turn off cell phones"
      ],
      display: "cell phones"
    },
    {
      id: 3,
      accepted: [
        "bag", "your bag", "is this your bag", "this bag"
      ],
      display: "bag"
    },
    {
      id: 4,
      accepted: [
        "passport", "your passport", "see your passport",
        "reservation", "a reservation"
      ],
      display: "passport"
    },
    {
      id: 5,
      accepted: [
        "key", "your key", "room key", "here's your key",
        "keys", "elevator", "the elevator"
      ],
      display: "key"
    }
  ];

  const AUDIO = "audio/listening.mp3";
  const MAX_LISTENS = 3;
  const MAX_ATTEMPTS = 3;

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "play"; // play | done
  let listensLeft = MAX_LISTENS;
  let attemptsLeft = MAX_ATTEMPTS;
  let currentAudio = null;
  let values = ITEMS.map(() => "");
  let states = ITEMS.map(() => ({ correct: false, locked: false, checked: false }));
  let checkedOnce = false;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:"""()/]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(user, accepted) {
    const u = normalize(user);
    if (!u) return false;
    for (let i = 0; i < accepted.length; i++) {
      const a = normalize(accepted[i]);
      if (!a) continue;
      if (u === a || u.includes(a) || a.includes(u)) return true;
    }
    // flat version without spaces
    const uFlat = u.replace(/[\s\-]/g, "");
    for (let i = 0; i < accepted.length; i++) {
      const aFlat = normalize(accepted[i]).replace(/[\s\-]/g, "");
      if (aFlat && (uFlat === aFlat || uFlat.includes(aFlat) || aFlat.includes(uFlat))) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".mc-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    if (listensLeft <= 0 && !currentAudio) return;
    stopAudio();
    if (listensLeft > 0) listensLeft -= 1;
    const a = new Audio(AUDIO);
    currentAudio = a;
    const btn = app.querySelector(".mc-play");
    if (btn) {
      btn.classList.add("playing");
      if (listensLeft <= 0) btn.disabled = true;
    }
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      renderStats();
    };
    renderStats();
  }

  function renderStats() {
    const listensEl = app.querySelector("#lw-listens");
    const attemptsEl = app.querySelector("#lw-attempts");
    const hintEl = app.querySelector(".lw-audio-hint");
    if (listensEl) listensEl.textContent = listensLeft;
    if (attemptsEl) attemptsEl.textContent = attemptsLeft;
    if (hintEl) {
      hintEl.textContent = listensLeft > 0
        ? `Tap to play · ${listensLeft} listen${listensLeft === 1 ? "" : "s"} left`
        : "No listens left";
    }
  }

  function allFilled() {
    return values.every((v) => normalize(v).length > 0);
  }

  function checkAnswers() {
    if (attemptsLeft <= 0) return;
    if (!allFilled()) {
      const fb = app.querySelector(".lw-feedback");
      if (fb) {
        fb.className = "lw-feedback warn";
        fb.textContent = "Write something in every box first.";
      }
      return;
    }
    attemptsLeft -= 1;
    checkedOnce = true;
    let correctCount = 0;
    ITEMS.forEach((it, i) => {
      const ok = isCorrect(values[i], it.accepted);
      states[i].checked = true;
      states[i].correct = ok;
      if (ok) {
        states[i].locked = true;
        correctCount += 1;
      }
    });
    renderPlay();
    const fb = app.querySelector(".lw-feedback");
    if (correctCount === ITEMS.length) {
      if (fb) {
        fb.className = "lw-feedback ok";
        fb.textContent = "Perfect! All correct.";
      }
      setTimeout(() => {
        phase = "done";
        render();
      }, 900);
    } else if (attemptsLeft <= 0) {
      if (fb) {
        fb.className = "lw-feedback err";
        fb.textContent = `No attempts left. ${correctCount}/${ITEMS.length} correct.`;
      }
      // reveal remaining
      ITEMS.forEach((it, i) => {
        if (!states[i].correct) {
          values[i] = it.display;
          states[i].locked = true;
        }
      });
      setTimeout(() => {
        phase = "done";
        render();
      }, 1400);
    } else {
      if (fb) {
        fb.className = "lw-feedback warn";
        fb.textContent = `${correctCount}/${ITEMS.length} correct · ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left`;
      }
    }
  }

  function calcStars() {
    const correct = states.filter((s) => s.correct).length;
    if (correct >= 5) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
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

  function renderPlay() {
    const rows = ITEMS.map((it, i) => {
      const st = states[i];
      let cls = "lw-row";
      if (st.checked && st.correct) cls += " is-correct is-locked";
      else if (st.checked && !st.correct) cls += " is-wrong";
      if (st.locked) cls += " is-locked";
      const icon = st.checked ? (st.correct ? "✓" : "✗") : "";
      return `
        <div class="${cls}" data-idx="${i}">
          <span class="lw-num">${i + 1}</span>
          <input type="text" class="lw-input" data-idx="${i}"
            placeholder="Write sentence ${i + 1}..."
            value="${escapeAttr(values[i])}"
            ${st.locked ? "disabled" : ""}
            autocomplete="off" autocorrect="off" spellcheck="false" />
          <span class="lw-check-icon">${icon}</span>
        </div>`;
    }).join("");

    app.innerHTML = `
      <div class="mc-topbar">
        <a href="../" class="mc-back" aria-label="Back">←</a>
        <div class="mc-title-wrap">
          <span class="mc-unit">Unit 3A</span>
          <span class="mc-title">Listen &amp; Write</span>
        </div>
        <div class="mc-stats">
          <div class="mc-stat">
            <span class="mc-stat-label">Listens</span>
            <span class="mc-stat-value" id="lw-listens">${listensLeft}</span>
          </div>
          <div class="mc-stat">
            <span class="mc-stat-label">Attempts</span>
            <span class="mc-stat-value" id="lw-attempts">${attemptsLeft}</span>
          </div>
        </div>
      </div>

      <p class="mc-instruction">Listen to the 5 conversations and write the thing you hear in each one.</p>

      <div class="lw-audio">
        <button type="button" class="mc-play" id="lw-play" aria-label="Play audio" ${listensLeft <= 0 ? "disabled" : ""}>
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <span class="lw-audio-hint">Tap to play · ${listensLeft} listen${listensLeft === 1 ? "" : "s"} left</span>
      </div>

      <div class="lw-boxes">${rows}</div>

      <p class="lw-feedback"></p>

      <div class="lw-actions">
        <button type="button" class="mc-btn" id="lw-check" ${attemptsLeft <= 0 ? "disabled" : ""}>Check</button>
      </div>
    `;

    // events
    const playBtn = app.querySelector("#lw-play");
    if (playBtn) playBtn.onclick = () => playAudio();

    app.querySelectorAll(".lw-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const idx = +e.target.dataset.idx;
        values[idx] = e.target.value;
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkAnswers();
        }
      });
    });

    const checkBtn = app.querySelector("#lw-check");
    if (checkBtn) checkBtn.onclick = () => checkAnswers();
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderDone() {
    const stars = saveStars();
    const correct = states.filter((s) => s.correct).length;
    const starHtml = [0, 1, 2].map((i) =>
      `<span class="star${i < stars ? " filled" : ""}">★</span>`
    ).join("");

    app.innerHTML = `
      <div class="mc-topbar">
        <a href="../" class="mc-back" aria-label="Back">←</a>
        <div class="mc-title-wrap">
          <span class="mc-unit">Unit 3A</span>
          <span class="mc-title">Listen &amp; Write</span>
        </div>
      </div>
      <div class="mc-overlay" style="position:relative;background:transparent;padding-top:40px;">
        <div class="mc-overlay-card">
          <div class="mc-stars">${starHtml}</div>
          <h2>${correct === 5 ? "Well done!" : "Good try!"}</h2>
          <p>You got ${correct} out of 5 correct.</p>
          <button type="button" class="mc-btn" id="lw-again">Play again</button>
          <a href="../" class="mc-btn secondary" style="display:block;margin-top:10px;text-decoration:none;">Back to games</a>
        </div>
      </div>
    `;
    const again = app.querySelector("#lw-again");
    if (again) again.onclick = () => {
      listensLeft = MAX_LISTENS;
      attemptsLeft = MAX_ATTEMPTS;
      values = ITEMS.map(() => "");
      states = ITEMS.map(() => ({ correct: false, locked: false, checked: false }));
      checkedOnce = false;
      phase = "play";
      render();
    };
  }

  function render() {
    stopAudio();
    if (phase === "done") renderDone();
    else renderPlay();
  }

  // start
  render();
  // optional auto-play after short delay
  setTimeout(() => {
    if (phase === "play" && listensLeft === MAX_LISTENS) playAudio();
  }, 500);
})();
