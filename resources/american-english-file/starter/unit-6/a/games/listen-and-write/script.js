/* =========================================================
   LISTEN & WRITE — Unit 9A
   Mr. Sheyhaki | American English File Starter
   ========================================================= */

(function () {
  "use strict";

  // -------------------------------------------------------
  // DATA – Unit 9A (question descriptions)
  // -------------------------------------------------------
  const QUESTIONS = [
    {
      id: 1,
      accepted: [
        "what time do you usually get up",
        "what time do you usually get up?",
      ]
    },
    {
      id: 2,
      accepted: [
        "do you usually feel tired",
        "do you usually feel tired?",
      ]
    },
    {
      id: 3,
      accepted: [
        "do you take a shower or a bath in the morning",
        "do you take a shower or a bath in the morning?",
        "do you take a bath or a shower in the morning",
        "do you take a bath or a shower in the morning?",
      ]
    },
    {
      id: 4,
      accepted: [
        "do you always have breakfast where",
        "do you always have breakfast? where",
        "do you always have breakfast where?",
        "do you always have breakfast? where?",
        "do you always have breakfast",
        "do you always have breakfast?",
      ]
    },
    {
      id: 5,
      accepted: [
        "what do you have for breakfast",
        "what do you have for breakfast?",
      ]
    },
    {
      id: 6,
      accepted: [
        "what time do you go to work",
        "what time do you go to work?",
      ]
    },
    {
      id: 7,
      accepted: [
        "do you usually need to hurry in the morning",
        "do you usually need to hurry in the morning?",
      ]
    },
    {
      id: 8,
      accepted: [
        "do you like mornings why",
        "do you like mornings? why",
        "do you like mornings why?",
        "do you like mornings? why?",
        "do you like mornings",
        "do you like mornings?",
        "do you like morning why",
        "do you like morning? why",
        "do you like morning",
        "do you like morning?",
      ]
    }
  ];

  const DISPLAY_ANSWERS = [
    "What time do you usually get up?",
    "Do you usually feel tired?",
    "Do you take a shower or a bath in the morning?",
    "Do you always have breakfast? Where?",
    "What do you have for breakfast?",
    "What time do you go to work?",
    "Do you usually need to hurry in the morning?",
    "Do you like mornings? Why?"
  ];

  const AUDIO_URL = "audio.mp3";


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
  const playBtn        = document.getElementById("playBtn");
  const playIcon       = document.getElementById("playIcon");
  const visualizer     = document.getElementById("visualizer");
  const audioHint      = document.getElementById("audioHint");
  const listensEl      = document.getElementById("listensLeft");
  const attemptsEl     = document.getElementById("attemptsLeft");
  const boxesEl        = document.getElementById("boxes");
  const feedbackEl     = document.getElementById("feedback");
  const continueBtn    = document.getElementById("continueBtn");
  const successOverlay = document.getElementById("successOverlay");
  const successContinue = document.getElementById("successContinue");

  const audio = new Audio(AUDIO_URL);
  audio.preload = "auto";

  // -------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------
  function normalize(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:""]/g, "")
      .replace(/\s+/g, " ")
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

      const num = document.createElement("div");
      num.className = "box-number";
      num.textContent = String(i + 1);

      const input = document.createElement("input");
      input.className = "box-input";
      input.type = "text";
      input.placeholder = "Write question " + (i + 1) + "...";
      input.dataset.index = String(i);
      input.autocomplete = "off";
      input.spellcheck = false;
      // Set via property so the typed answer always stays visible
      input.value = state.value || "";
      if (state.locked) input.disabled = true;

      const btn = document.createElement("button");
      btn.className = "submit-btn";
      if (state.correct) btn.classList.add("correct");
      if (state.submitted && !state.correct) btn.classList.add("wrong");
      btn.type = "button";
      btn.dataset.index = String(i);
      btn.setAttribute("aria-label", "Submit answer " + (i + 1));
      btn.textContent = state.correct ? "✓" : "✓";
      if (state.locked) btn.disabled = true;

      row.appendChild(num);
      row.appendChild(input);
      row.appendChild(btn);
      boxesEl.appendChild(row);

      input.addEventListener("input", onInputChange);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          submitBox(i);
        }
      });
      btn.addEventListener("click", function () {
        submitBox(i);
      });
    });
  }

  function onInputChange(e) {
    const idx = parseInt(e.target.dataset.index, 10);
    boxStates[idx].value = e.target.value;
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
        try { __saveLAStarsFromLaw(100); } catch (e) {}
        setTimeout(() => {
          successOverlay.classList.add("is-visible");
        }, 350);
      }
    } else {
      attemptsLeft--;
      updateStats();
      renderBoxes();

      if (attemptsLeft <= 0) {
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
    try {
      var ok = boxStates.filter(function(b){ return b.correct; }).length;
      var tot = boxStates.length || 1;
      __saveLAStarsFromLaw(Math.round(ok / tot * 100));
    } catch (e) {}
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
  window.location.href = "../";   // Unit 6A games
});

successContinue.addEventListener("click", () => {
  window.location.href = "../";   // Unit 6A games
});

  // -------------------------------------------------------
  // INIT
  // -------------------------------------------------------
  function __saveLAStarsFromLaw(acc) {
    try {
      if (window.LAStars) {
        LAStars.recordPlay("starter-6a-listen-and-write");
        LAStars.saveFromAccuracy("starter-6a-listen-and-write", acc);
      }
    } catch (e) {}
  }

  function init() {
    updateStats();
    renderBoxes();
  }

  init();
})();
