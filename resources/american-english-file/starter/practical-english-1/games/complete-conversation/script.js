/* Complete the Conversation – Starter PE1 classroom language */
(function () {
  const GAME_ID = "starter-pe1-complete-conversation";

  const PARTS = [
    {
      id: 1,
      title: "In the classroom",
      audio: "audio/1.mp3",
      lines: [
        {
          speaker: "Teacher",
          segments: [
            { type: "blank", answer: ["open"], width: "5em" },
            { type: "text", text: " your books, please. " },
            { type: "blank", answer: ["go"], width: "3.5em" },
            { type: "text", text: " to page 7." },
          ],
        },
        {
          speaker: "Student",
          segments: [
            { type: "blank", answer: ["sorry"], width: "5em" },
            { type: "text", text: ", can you " },
            { type: "blank", answer: ["repeat"], width: "5.5em" },
            { type: "text", text: " that, please?" },
          ],
        },
        {
          speaker: "Teacher",
          segments: [{ type: "text", text: "Go to page 7." }],
        },
      ],
    },
    {
      id: 2,
      title: "How do you spell it?",
      audio: "audio/2.mp3",
      lines: [
        {
          speaker: "Student",
          segments: [
            { type: "blank", answer: ["excuse"], width: "5.5em" },
            { type: "text", text: " me. " },
            { type: "blank", answer: ["how"], width: "4em" },
            { type: "text", text: ' do you spell "birthday"?' },
          ],
        },
        {
          speaker: "Teacher",
          segments: [{ type: "text", text: "B-I-R-T-H-D-A-Y." }],
        },
      ],
    },
    {
      id: 3,
      title: "Sorry I'm late",
      audio: "audio/3.mp3",
      lines: [
        {
          speaker: "Student",
          segments: [
            { type: "blank", answer: ["sorry"], width: "5em" },
            { type: "text", text: " I'm late." },
          ],
        },
        {
          speaker: "Teacher",
          segments: [
            { type: "text", text: "That's OK. Sit " },
            { type: "blank", answer: ["down"], width: "4.5em" },
            { type: "text", text: ", please." },
          ],
        },
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let audio = null;
  let locked = false; // true while audio plays / transitioning

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[’']/g, "'");
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
      audio = null;
    }
  }

  function playPartAudio(src, onEnded) {
    stopAudio();
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      try {
        if (audio) {
          audio.onended = null;
          audio.onerror = null;
        }
      } catch (_) {}
      audio = null;
      if (onEnded) onEnded();
    };
    audio = new Audio(src);
    audio.onended = done;
    audio.onerror = done;
    // Safety net if play is blocked or file missing
    const safety = setTimeout(done, 16000);
    audio
      .play()
      .then(() => {
        if (audio && isFinite(audio.duration) && audio.duration > 0) {
          clearTimeout(safety);
          setTimeout(done, Math.ceil(audio.duration * 1000) + 600);
        }
      })
      .catch(() => {
        clearTimeout(safety);
        setTimeout(done, 900);
      });
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function showStart() {
    stopAudio();
    locked = false;
    partIndex = 0;
    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="../" aria-label="Back">←</a>
        <span class="cc-title">Complete the Conversation</span>
        <span class="cc-badge">PE1</span>
      </header>
      <section class="cc-start">
        <div class="cc-hero">
          <div class="cc-icon">💬</div>
          <h1>Complete the Conversation</h1>
          <p>Type the missing classroom language.<br>
          Check your answers, then listen to the full dialogue.</p>
        </div>
        <div class="cc-parts-preview">
          ${PARTS.map(
            (p, i) => `
            <div class="cc-preview-card">
              <span class="cc-preview-num">${i + 1}</span>
              <span class="cc-preview-title">${p.title}</span>
            </div>`
          ).join("")}
        </div>
        <button type="button" class="cc-btn primary" id="cc-start">Start</button>
      </section>`;
    document.getElementById("cc-start").onclick = () => {
      partIndex = 0;
      renderPart();
    };
  }

  function renderPart() {
    stopAudio();
    locked = false;
    const part = PARTS[partIndex];
    const total = PARTS.length;

    const dialogueHtml = part.lines
      .map((line, li) => {
        const segs = line.segments
          .map((seg, si) => {
            if (seg.type === "text") {
              return `<span class="cc-text">${escapeHtml(seg.text)}</span>`;
            }
            const id = `blank-${li}-${si}`;
            return `<input type="text" class="cc-blank" id="${id}"
              autocomplete="off" autocorrect="off" autocapitalize="off"
              spellcheck="false" data-answers="${seg.answer.join("|")}"
              style="width:${seg.width || "5em"}" aria-label="Missing word">`;
          })
          .join("");
        return `
          <div class="cc-line">
            <span class="cc-speaker">${escapeHtml(line.speaker)}</span>
            <div class="cc-utterance">${segs}</div>
          </div>`;
      })
      .join("");

    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="#" id="cc-back" aria-label="Back">←</a>
        <span class="cc-title">${escapeHtml(part.title)}</span>
        <span class="cc-badge">${partIndex + 1} / ${total}</span>
      </header>
      <div class="cc-stage">
        <p class="cc-hint">Fill in the blanks, then check.</p>
        <div class="cc-dialogue" id="cc-dialogue">
          ${dialogueHtml}
        </div>
        <div class="cc-feedback" id="cc-feedback" hidden></div>
      </div>
      <div class="cc-controls">
        <button type="button" class="cc-btn secondary" id="cc-skip">Skip</button>
        <button type="button" class="cc-btn primary" id="cc-check">Check</button>
      </div>`;

    document.getElementById("cc-back").onclick = (e) => {
      e.preventDefault();
      if (locked) return;
      showStart();
    };
    document.getElementById("cc-check").onclick = onCheck;
    document.getElementById("cc-skip").onclick = onSkip;

    // Focus first blank
    const first = app.querySelector(".cc-blank");
    if (first) setTimeout(() => first.focus(), 120);

    // Enter key submits
    app.querySelectorAll(".cc-blank").forEach((inp) => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCheck();
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getBlanks() {
    return Array.from(app.querySelectorAll(".cc-blank"));
  }

  function markBlank(inp, state) {
    inp.classList.remove("ok", "bad");
    if (state) inp.classList.add(state);
  }

  function checkAnswers() {
    const blanks = getBlanks();
    let allOk = true;
    blanks.forEach((inp) => {
      const accepted = (inp.dataset.answers || "").split("|").map(normalize);
      const user = normalize(inp.value);
      const ok = accepted.includes(user);
      markBlank(inp, ok ? "ok" : "bad");
      if (!ok) allOk = false;
    });
    return allOk;
  }

  function setFeedback(msg, kind) {
    const el = document.getElementById("cc-feedback");
    if (!el) return;
    el.hidden = false;
    el.className = "cc-feedback " + (kind || "");
    el.textContent = msg;
  }

  function lockControls(lock) {
    locked = lock;
    const check = document.getElementById("cc-check");
    const skip = document.getElementById("cc-skip");
    if (check) check.disabled = lock;
    if (skip) skip.disabled = lock;
    getBlanks().forEach((inp) => {
      inp.disabled = lock;
    });
  }

  function onCheck() {
    if (locked) return;
    const blanks = getBlanks();
    const empty = blanks.some((b) => !normalize(b.value));
    if (empty) {
      setFeedback("Please fill in all the blanks.", "warn");
      blanks.forEach((b) => {
        if (!normalize(b.value)) markBlank(b, "bad");
      });
      return;
    }

    const ok = checkAnswers();
    if (!ok) {
      setFeedback("Not quite — try again!", "bad");
      // Focus first wrong blank
      const firstBad = blanks.find((b) => b.classList.contains("bad"));
      if (firstBad) firstBad.focus();
      return;
    }

    // Correct
    setFeedback("Correct! Listen…", "ok");
    lockControls(true);
    const part = PARTS[partIndex];
    playPartAudio(part.audio, () => {
      // small pause then advance
      setTimeout(() => {
        if (partIndex >= PARTS.length - 1) {
          showDone();
        } else {
          partIndex++;
          renderPart();
        }
      }, 400);
    });
  }

  function onSkip() {
    if (locked) return;
    lockControls(true);
    setFeedback("Skipped — listen anyway…", "warn");
    const part = PARTS[partIndex];
    playPartAudio(part.audio, () => {
      setTimeout(() => {
        if (partIndex >= PARTS.length - 1) {
          showDone(true);
        } else {
          partIndex++;
          renderPart();
        }
      }, 400);
    });
  }

  function showDone(hadSkip) {
    stopAudio();
    locked = false;
    // 3 stars if finished without needing to track skips strictly; still reward play
    saveStars(3);
    app.innerHTML = `
      <header class="cc-topbar">
        <a class="cc-back" href="../" aria-label="Back">←</a>
        <span class="cc-title">Complete</span>
        <span class="cc-badge">✓</span>
      </header>
      <section class="cc-done">
        <div class="cc-stars">⭐ ⭐ ⭐</div>
        <h1>Great job!</h1>
        <p>You finished all three classroom conversations.</p>
        <button type="button" class="cc-btn primary" id="cc-again">Play again</button>
        <button type="button" class="cc-btn secondary" id="cc-home">Back to games</button>
      </section>`;
    document.getElementById("cc-again").onclick = () => {
      partIndex = 0;
      renderPart();
    };
    document.getElementById("cc-home").onclick = () => {
      window.location.href = "../";
    };
  }

  showStart();
})();
