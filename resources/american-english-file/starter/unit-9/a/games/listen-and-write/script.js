/* =========================================================
   LISTEN & WRITE — Unit 9A
   Mr. Sheyhaki | American English File Starter
   ========================================================= */

(function () {
  "use strict";

  // -------------------------------------------------------
  // DATA – Unit 9A (picture descriptions)
  // Each item has a list of acceptable answers (normalized)
  // -------------------------------------------------------
  const QUESTIONS = [
    {
      id: 1,
      accepted: [
        "he's reading a story",
        "he's reading a book",
        "he's reading a story book",
        "he's reading a storybook",
        "he is reading a story",
        "he is reading a book",
        "he is reading a story book",
        "he is reading a storybook"
      ]
    },
    {
      id: 2,
      accepted: [
        "he's watching soccer",
        "he's watching football",
        "he's watching soccer on tv",
        "he's watching football on tv",
        "he's watching soccer on the tv",
        "he's watching football on the tv",
        "he is watching soccer",
        "he is watching football",
        "he is watching soccer on tv",
        "he is watching football on tv",
        "he is watching soccer on the tv",
        "he is watching football on the tv"
      ]
    },
    {
      id: 3,
      accepted: [
        "he's drinking soda",
        "he's drinking a soda",
        "he's drinking coke",
        "he's drinking a coke",
        "he's drinking soft drink",
        "he's drinking a soft drink",
        "he is drinking soda",
        "he is drinking a soda",
        "he is drinking coke",
        "he is drinking a coke"
      ]
    },
    {
      id: 4,
      accepted: [
        "he's playing a video game",
        "he's playing video games",
        "he's playing a computer game",
        "he's playing computer games",
        "he's playing video game",
        "he is playing a video game",
        "he is playing video games",
        "he is playing a computer game",
        "he is playing computer games"
      ]
    },
    {
      id: 5,
      accepted: [
        "he's taking a shower",
        "he's having a shower",
        "he's taking a bath",
        "he's having a bath",
        "he is taking a shower",
        "he is having a shower",
        "he is taking a bath",
        "he is having a bath"
      ]
    },
    {
      id: 6,
      accepted: [
        "he's going to bed",
        "he is going to bed",
        "he's going to sleep",
        "he is going to sleep"
      ]
    }
  ];

  // Display versions of the correct answers (for reveal)
  const DISPLAY_ANSWERS = [
    "He's reading a story / book",
    "He's watching soccer / football (on TV)",
    "He's drinking soda",
    "He's playing a video game / computer games",
    "He's taking / having a shower / bath",
    "He's going to bed"
  ];

  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/c930177_AEF3e_Starter_SB_9.03.mp3";

  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------
  let listensLeft = 3;
  let attemptsLeft = 3;
  let isPlaying = false;
  let boxStates = QUESTIONS.map(() => ({
    submitted: false,
    correct: false,
    locked: false,
    value: ""
  }));

  // -------------------------------------------------------
  // DOM
  // -------------------------------------------------------
  const playBtn      = document.getElementById("playBtn");
  const playIcon     = document.getElementById("playIcon");
  const visualizer   = document.getElementById("visualizer");
  const audioHint    = document.getElementById("audioHint");
  const listensEl    = document.getElementById("listensLeft");
  const attemptsEl   = document.getElementById("attemptsLeft");
  const boxesEl      = document.getElementById("boxes");
  const feedbackEl   = document.getElementById("feedback");
  const continueBtn  = document.getElementById("continueBtn");
  const successOverlay = document.getElementById("successOverlay");
  const successContinue = document.getElementById("successContinue");

  // Create audio element
  const audio = new Audio(AUDIO_URL);
  audio.preload = "auto";

  // -------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------
  function normalize(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")           // normalize apostrophes
      .replace(/[.,!?;:""]/g, "")    // remove small punctuation
      .replace(/\s+/g, " ")            // collapse spaces
      .trim();
  }

  function isCorrect(userInput, acceptedList) {
    const norm = normalize(userInput);
    if (!norm) return false;
    return acceptedList.some(a => normalize(a) === norm);
  }

  function updateStats() {
    listensEl.textContent = listensLeft;
    attemptsEl.textContent = attemptsLeft;
    audioHint.textContent = listensLeft > 0
      ? `Tap to play · ${listensLeft} listen${listensLeft === 1 ? "" : "s"} left`
      : "No listens left";
  }

  function showFeedback(type, message) {
    feedbackEl.hidden = false;
    feedbackEl.className = "feedback " + type;
    feedbackEl.textContent = message;
  }

  function hideFeedback() {
    feedbackEl.hidden = true;
  }

  function allBoxesCorrect() {
    return boxStates.every(b => b.correct);
  }

  function anyBoxSubmitted() {
    return boxStates.some(b => b.submitted);
  }

  // -------------------------------------------------------
  // RENDER BOXES
  // -------------------------------------------------------
  function renderBoxes() {
    boxesEl.innerHTML = "";

    QUESTIONS.forEach((q, i) => {
      const state = boxStates[i];
      const row = document.createElement("div");
      row.className = "box-row";
      if (state.correct) row.classList.add("correct", "locked");
      if (state.submitted && !state.correct) row.classList.add("wrong");

      row.innerHTML = `
        <div class="box-number">${i + 1}</div>
        <input
          class="box-input"
          type="text"
          placeholder="Write sentence ${i + 1}..."
          value="${state.value.replace(/"/g, "&quot;")}"
          ${state.locked ? "disabled" : ""}
          data-index="${i}"
          autocomplete="off"
          spellcheck="false"
        />
        <button
          class="submit-btn ${state.correct ? "correct" : ""} ${state.submitted && !state.correct ? "wrong" : ""}"
          type="button"
          data-index="${i}"
          ${state.locked ? "disabled" : ""}
          aria-label="Submit answer ${i + 1}"
        >✓</button>
      `;

      boxesEl.appendChild(row);
    });

    // Attach events
    boxesEl.querySelectorAll(".box-input").forEach(input => {
      input.addEventListener("input", onInputChange);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          const idx = parseInt(input.dataset.index, 10);
          submitBox(idx);
        }
      });
    });

    boxesEl.querySelectorAll(".submit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        submitBox(idx);
      });
    });
  }

  function onInputChange(e) {
    const idx = parseInt(e.target.dataset.index, 10);
    boxStates[idx].value = e.target.value;
    // Clear previous wrong state while typing
    if (boxStates[idx].submitted && !boxStates[idx].correct) {
      boxStates[idx].submitted = false;
      renderBoxes();
    }
  }

  // -------------------------------------------------------
  // SUBMIT ONE BOX
  // -------------------------------------------------------
  function submitBox(index) {
    const state = boxStates[index];
    if (state.locked || attemptsLeft <= 0) return;

    const input = boxesEl.querySelector(`.box-input[data-index="${index}"]`);
    const value = (input?.value || state.value || "").trim();

    if (!value) {
      showFeedback("info", "Please write something first.");
      return;
    }

    state.value = value;
    state.submitted = true;

    const correct = isCorrect(value, QUESTIONS[index].accepted);

    if (correct) {
      state.correct = true;
      state.locked = true;
      hideFeedback();
      renderBoxes();

      if (allBoxesCorrect()) {
        // Full success
        setTimeout(() => {
          successOverlay.hidden = false;
        }, 350);
      }
    } else {
      // Wrong
      attemptsLeft--;
      updateStats();
      renderBoxes();

      if (attemptsLeft <= 0) {
        // Final fail → reveal answers
        revealAnswers();
      } else {
        showFeedback("error", `Not quite. Try again! (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left)`);
      }
    }
  }

  // -------------------------------------------------------
  // REVEAL ANSWERS (after 3 fails)
  // -------------------------------------------------------
  function revealAnswers() {
    // Lock everything
    boxStates.forEach(b => { b.locked = true; });

    let html = `<div class="reveal-list">`;
    QUESTIONS.forEach((q, i) => {
      const user = boxStates[i].value.trim() || "(empty)";
      const isOk = boxStates[i].correct;
      html += `
        <div class="reveal-item">
          <span class="num">${i + 1}.</span>
          ${isOk
            ? `<span class="correct-ans">${DISPLAY_ANSWERS[i]}</span>`
            : `<span class="user-ans">${escapeHtml(user)}</span>
               <span class="correct-ans">→ ${DISPLAY_ANSWERS[i]}</span>`
          }
        </div>
      `;
    });
    html += `</div>`;

    feedbackEl.hidden = false;
    feedbackEl.className = "feedback error";
    feedbackEl.innerHTML = `
      <strong>No attempts left.</strong><br>
      Here are the correct answers:
      ${html}
    `;

    continueBtn.hidden = false;
    playBtn.disabled = true;

    // Disable all inputs/buttons
    renderBoxes();
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // -------------------------------------------------------
  // AUDIO PLAYBACK + VISUALIZER
  // -------------------------------------------------------
  function setPlayingUI(playing) {
    isPlaying = playing;
    if (playing) {
      playIcon.hidden = true;
      visualizer.hidden = false;
      playBtn.classList.add("playing");
    } else {
      playIcon.hidden = false;
      visualizer.hidden = true;
      playBtn.classList.remove("playing");
    }
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying || listensLeft <= 0 || attemptsLeft <= 0) return;

    listensLeft--;
    updateStats();

    if (listensLeft <= 0) {
      playBtn.disabled = true;
    }

    setPlayingUI(true);
    audio.currentTime = 0;
    audio.play().catch(() => {
      setPlayingUI(false);
      showFeedback("error", "Could not play audio. Check your connection.");
    });
  });

  audio.addEventListener("ended", () => {
    setPlayingUI(false);
  });

  audio.addEventListener("error", () => {
    setPlayingUI(false);
    showFeedback("error", "Audio failed to load.");
  });

  // -------------------------------------------------------
  // CONTINUE BUTTONS
  // -------------------------------------------------------
  continueBtn.addEventListener("click", () => {
    // For now go back to the unit games list
    window.location.href = "../";
  });

  successContinue.addEventListener("click", () => {
    window.location.href = "../";
  });

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function init() {
    updateStats();
    renderBoxes();
  }

  init();
})();
