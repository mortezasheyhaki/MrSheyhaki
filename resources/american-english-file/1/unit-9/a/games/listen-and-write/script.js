/* =========================================================
   LISTEN & WRITE — Unit 9A (Shopping list)
   Mr. Sheyhaki | American English File 1
   Audio: AEF3e Level 1 SB 9.03
   ========================================================= */

(function () {
  "use strict";

  // -------------------------------------------------------
  // DATA – shopping list items from the dialogue
  // -------------------------------------------------------
  const QUESTIONS = [
    {
      id: 1,
      accepted: [
        "some coffee",
        "coffee",
        "some coffee we don't have any"
      ]
    },
    {
      id: 2,
      accepted: [
        "some milk",
        "milk"
      ]
    },
    {
      id: 3,
      accepted: [
        "some orange juice",
        "orange juice",
        "some juice",
        "juice"
      ]
    },
    {
      id: 4,
      accepted: [
        "some apple juice",
        "apple juice",
        "maybe apple juice",
        "maybe apple juice too"
      ]
    },
    {
      id: 5,
      accepted: [
        "a pineapple",
        "one pineapple",
        "pineapple",
        "a pineapple if they have them"
      ]
    },
    {
      id: 6,
      accepted: [
        "some oranges",
        "oranges",
        "some (four or five) oranges",
        "four or five oranges",
        "4 or 5 oranges",
        "some four or five oranges"
      ]
    },
    {
      id: 7,
      accepted: [
        "some bananas",
        "bananas"
      ]
    },
    {
      id: 8,
      accepted: [
        "some onions",
        "onions"
      ]
    },
    {
      id: 9,
      accepted: [
        "some potatoes",
        "potatoes",
        "some (two or three big) potatoes",
        "two or three big potatoes",
        "2 or 3 big potatoes",
        "some two or three big potatoes",
        "two or three potatoes",
        "some big potatoes"
      ]
    },
    {
      id: 10,
      accepted: [
        "a bottle of soda",
        "soda",
        "a bottle of coke",
        "a bottle of pepsi",
        "coke",
        "pepsi",
        "any kind of soda",
        "a bottle of soft drink"
      ]
    },
    {
      id: 11,
      accepted: [
        "some lettuce",
        "lettuce",
        "a lettuce"
      ]
    }
  ];

  const DISPLAY_ANSWERS = [
    "some coffee",
    "some milk",
    "some orange juice",
    "some apple juice",
    "a pineapple",
    "some (four or five) oranges",
    "some bananas",
    "some onions",
    "some (two or three big) potatoes",
    "a bottle of soda",
    "some lettuce"
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
  const playBtn         = document.getElementById("playBtn");
  const playIcon        = document.getElementById("playIcon");
  const visualizer      = document.getElementById("visualizer");
  const audioHint       = document.getElementById("audioHint");
  const listensEl       = document.getElementById("listensLeft");
  const attemptsEl      = document.getElementById("attemptsLeft");
  const boxesEl         = document.getElementById("boxes");
  const feedbackEl      = document.getElementById("feedback");
  const continueBtn     = document.getElementById("continueBtn");
  const successOverlay  = document.getElementById("successOverlay");
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

      row.innerHTML = `
        <div class="box-number">${i + 1}</div>
        <input
          class="box-input"
          type="text"
          placeholder="Write item ${i + 1}..."
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
    if (history.length > 1) history.back(); else window.location.href = "../../";
  });

  successContinue.addEventListener("click", () => {
    if (history.length > 1) history.back(); else window.location.href = "../../";
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


  // Stars for Level 1 Unit 9A Listen & Write
  function __saveLAStarsFromLaw(acc) {
    try {
      if (window.LAStars) {
        LAStars.recordPlay("1-9a-listen-and-write");
        LAStars.saveFromAccuracy("1-9a-listen-and-write", acc);
      }
    } catch (e) {}
  }
