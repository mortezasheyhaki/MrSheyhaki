/* Order the Messages + Vocabulary – Starter Unit 9A */
(function () {
  "use strict";

  const AUDIO_URL = "https://cdn.imgurl.ir/uploads/72018_AEF3e_Starter_SB_9_mp3cut_net.mp3";
  const GAME_ID = "starter-9a-order-the-messages";

  function saveStars(correct, total) {
    try {
      if (!window.LAStars || !total) return;
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, Math.round((correct / total) * 100));
    } catch (_) {}
  }

  // Part 1 – match messages: 1-B, 2-D, 3-A, 4-C, 5-E
  const MESSAGES = [
    { id: 1, text: "Hi. I'm just leaving the house now.", correct: "B" },
    { id: 2, text: "No, I'm not. I'm riding my bike. See you in 20 minutes?", correct: "D" },
    { id: 3, text: "Where are you? I'm at the movie theater, but I can't see you. I'm waiting outside.", correct: "A" },
    { id: 4, text: "It's really cold outside. I'm going in.", correct: "C" },
    { id: 5, text: "I'm standing near the box office. I'm wearing a black jacket. Can you see me?", correct: "E" },
  ];

  const ANSWERS = [
    { id: "A", text: "I'm arriving at the movie theater now. Where are you?" },
    { id: "B", text: "Me too. I'm walking to the bus stop. Are you taking the bus, too?" },
    { id: "C", text: "Sorry, we're in a lot of traffic. There in five minutes." },
    { id: "D", text: "OK. See you then." },
    { id: "E", text: "Yes, I can! Can you see me? I'm walking towards you now!" },
  ];

  // Part 2 – vocabulary fill-in
  const VOCAB = [
    { id: 1, before: "the place where you wait for a bus:", after: "", correct: "bus stop" },
    { id: 2, before: "the opposite of inside:", after: "", correct: "outside" },
    { id: 3, before: "a lot of cars, buses, etc.: a lot of", after: "", correct: "traffic" },
    { id: 4, before: "the place where you buy movie tickets:", after: "", correct: "box office" },
    { id: 5, before: "to walk in the direction of somebody: to walk", after: "somebody", correct: "towards" },
  ];

  const VOCAB_CHIPS = ["bus stop", "outside", "traffic", "box office", "towards"];

  const app = document.getElementById("game-app");
  if (!app) return;

  // phase: match | match-done | vocab | vocab-done
  let phase = "match";

  // Part 1 state
  let slots = { 1: null, 2: null, 3: null, 4: null, 5: null };
  let selectedLetter = null;
  let matchScore = 0;
  let answerOrder = shuffle(ANSWERS.map((a) => a.id));
  let lastPlaced = null;
  let lastPlacedTimer = null;

  // Part 2 state
  let vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
  let selectedWord = null;
  let vocabScore = 0;
  let vocabOrder = shuffle(VOCAB_CHIPS.slice());
  let vocabChecked = false;

  let currentAudio = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getAnswer(id) {
    return ANSWERS.find((a) => a.id === id);
  }

  /* ---------- Audio ---------- */
  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.src = ""; } catch (_) {}
      currentAudio = null;
    }
    const btn = document.getElementById("om-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    const btn = document.getElementById("om-play");
    const status = document.getElementById("om-audio-status");
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      if (status) status.textContent = "Paused — tap to play again";
      return;
    }
    stopAudio();
    if (btn) btn.classList.add("playing");
    if (status) status.textContent = "Playing…";
    const a = new Audio(AUDIO_URL);
    a.preload = "auto";
    currentAudio = a;
    a.onended = () => {
      currentAudio = null;
      if (btn) btn.classList.remove("playing");
      if (status) status.textContent = "Done — tap to listen again";
    };
    a.onerror = () => {
      currentAudio = null;
      if (btn) btn.classList.remove("playing");
      if (status) status.textContent = "Could not load audio";
    };
    const p = a.play();
    if (p && p.catch) {
      p.catch(() => {
        if (btn) btn.classList.remove("playing");
        if (status) status.textContent = "Tap again to play";
      });
    }
  }

  /* ---------- Part 1: Match ---------- */
  function usedLetters() {
    return new Set(Object.values(slots).filter(Boolean));
  }

  function allMatchFilled() {
    return Object.values(slots).every((v) => v !== null);
  }

  function placeLetter(msgId, letter) {
    if (phase !== "match") return;
    Object.keys(slots).forEach((k) => {
      if (slots[k] === letter) slots[k] = null;
    });
    slots[msgId] = letter;
    selectedLetter = null;
    lastPlaced = { msgId: +msgId, letter };
    if (lastPlacedTimer) clearTimeout(lastPlacedTimer);
    lastPlacedTimer = setTimeout(() => {
      lastPlaced = null;
      lastPlacedTimer = null;
      const slot = app.querySelector('.om-slot[data-msg="' + msgId + '"]');
      if (slot) {
        slot.classList.remove("just-dropped");
        const chip = slot.querySelector(".om-chip");
        if (chip) chip.classList.remove("just-placed");
      }
    }, 500);
    render();
  }

  function clearSlot(msgId) {
    if (phase !== "match") return;
    slots[msgId] = null;
    render();
  }

  function onChipTap(letter) {
    if (phase !== "match") return;
    const used = usedLetters();
    if (used.has(letter)) {
      Object.keys(slots).forEach((k) => {
        if (slots[k] === letter) slots[k] = null;
      });
      selectedLetter = null;
      render();
      return;
    }
    selectedLetter = selectedLetter === letter ? null : letter;
    render();
  }

  function onSlotTap(msgId) {
    if (phase !== "match") return;
    if (selectedLetter) {
      placeLetter(msgId, selectedLetter);
      return;
    }
    if (slots[msgId]) {
      selectedLetter = slots[msgId];
      slots[msgId] = null;
      render();
    }
  }

  function checkMatch() {
    if (!allMatchFilled() || phase !== "match") return;
    matchScore = 0;
    MESSAGES.forEach((m) => {
      if (slots[m.id] === m.correct) matchScore += 1;
    });
    phase = "match-done";
    saveStars(matchScore, 5);
    render();
  }

  function goToVocab() {
    phase = "vocab";
    selectedWord = null;
    vocabChecked = false;
    vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
    vocabOrder = shuffle(VOCAB_CHIPS.slice());
    render();
  }

  /* ---------- Part 2: Vocab ---------- */
  function usedWords() {
    return new Set(Object.values(vocabSlots).filter(Boolean));
  }

  function allVocabFilled() {
    return Object.values(vocabSlots).every((v) => v !== null);
  }

  function placeWord(itemId, word) {
    if (phase !== "vocab" || vocabChecked) return;
    Object.keys(vocabSlots).forEach((k) => {
      if (vocabSlots[k] === word) vocabSlots[k] = null;
    });
    vocabSlots[itemId] = word;
    selectedWord = null;
    render();
  }

  function clearVocabSlot(itemId) {
    if (phase !== "vocab" || vocabChecked) return;
    vocabSlots[itemId] = null;
    render();
  }

  function onWordTap(word) {
    if (phase !== "vocab" || vocabChecked) return;
    if (usedWords().has(word)) {
      Object.keys(vocabSlots).forEach((k) => {
        if (vocabSlots[k] === word) vocabSlots[k] = null;
      });
      selectedWord = null;
      render();
      return;
    }
    selectedWord = selectedWord === word ? null : word;
    render();
  }

  function onVocabRowTap(itemId) {
    if (phase !== "vocab" || vocabChecked) return;
    if (selectedWord) {
      placeWord(itemId, selectedWord);
      return;
    }
    if (vocabSlots[itemId]) {
      selectedWord = vocabSlots[itemId];
      vocabSlots[itemId] = null;
      render();
    }
  }

  function checkVocab() {
    if (!allVocabFilled() || vocabChecked || phase !== "vocab") return;
    vocabChecked = true;
    vocabScore = 0;
    VOCAB.forEach((v) => {
      if (vocabSlots[v.id] === v.correct) vocabScore += 1;
    });
    phase = "vocab-done";
    saveStars(matchScore + vocabScore, 10);
    render();
    setTimeout(playAudio, 400);
  }

  function resetGame() {
    stopAudio();
    if (lastPlacedTimer) clearTimeout(lastPlacedTimer);
    lastPlaced = null;
    lastPlacedTimer = null;
    phase = "match";
    slots = { 1: null, 2: null, 3: null, 4: null, 5: null };
    selectedLetter = null;
    matchScore = 0;
    answerOrder = shuffle(ANSWERS.map((a) => a.id));
    vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
    selectedWord = null;
    vocabScore = 0;
    vocabOrder = shuffle(VOCAB_CHIPS.slice());
    vocabChecked = false;
    render();
  }

  /* ---------- Drag helpers (match) ---------- */
  function onDragStart(e, letter) {
    if (phase !== "match") { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", letter);
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget;
    el.classList.add("dragging");
    try {
      const ghost = el.cloneNode(true);
      ghost.style.position = "absolute";
      ghost.style.top = "-9999px";
      ghost.style.left = "-9999px";
      ghost.style.width = el.offsetWidth + "px";
      ghost.style.transform = "rotate(2deg) scale(1.04)";
      ghost.style.boxShadow = "0 16px 32px rgba(15,23,42,0.2)";
      ghost.style.opacity = "0.95";
      ghost.classList.remove("dragging");
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, el.offsetWidth / 2, 24);
      setTimeout(() => ghost.remove(), 0);
    } catch (_) {}
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
  }

  function onDrop(e, msgId) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (phase !== "match") return;
    const letter = e.dataTransfer.getData("text/plain");
    if (letter) placeLetter(msgId, letter);
  }

  /* ---------- Drag helpers (vocab) ---------- */
  function onWordDragStart(e, word) {
    if (phase !== "vocab" || vocabChecked) { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", word);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  }

  function onWordDrop(e, itemId) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (phase !== "vocab" || vocabChecked) return;
    const word = e.dataTransfer.getData("text/plain");
    if (word) placeWord(itemId, word);
  }

  /* ---------- Render chips ---------- */
  function renderMatchChip(letter, opts) {
    const ans = getAnswer(letter);
    const used = usedLetters().has(letter);
    const isSelected = selectedLetter === letter;
    const classes = [
      "om-chip",
      used && !opts.inSlot ? "used" : "",
      isSelected ? "selected" : "",
      opts.inSlot ? "in-slot" : "",
      opts.justPlaced ? "just-placed" : "",
    ].filter(Boolean).join(" ");
    const draggable = phase === "match" && !opts.inSlot && !used;
    return `
      <div class="${classes}" data-letter="${letter}" draggable="${draggable}"
           role="button" tabindex="0" aria-label="Answer ${letter}">
        <span class="om-chip-id">${letter}</span>
        <span class="om-chip-text">${escapeHtml(ans.text)}</span>
      </div>`;
  }

  function renderWordChip(word, opts) {
    const used = usedWords().has(word);
    const isSelected = selectedWord === word;
    const classes = [
      "om-word-chip",
      used && !opts.inSlot ? "used" : "",
      isSelected ? "selected" : "",
      opts.inSlot ? "in-slot" : "",
      opts.result === "correct" ? "is-correct" : "",
      opts.result === "wrong" ? "is-wrong" : "",
    ].filter(Boolean).join(" ");
    const draggable = phase === "vocab" && !vocabChecked && !opts.inSlot && !used;
    return `
      <button type="button" class="${classes}" data-word="${escapeHtml(word)}"
              draggable="${draggable}" ${used && !opts.inSlot ? "disabled" : ""}>
        ${escapeHtml(word)}
      </button>`;
  }

  /* ---------- Screens ---------- */
  function renderMatchDone() {
    const stars = matchScore === 5 ? 3 : matchScore >= 4 ? 2 : matchScore >= 2 ? 1 : 0;
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 1 · Complete</span>
          <span class="om-title">Message matches</span>
        </div>
        <span class="om-progress">${matchScore} / 5</span>
      </header>
      <div class="om-body">
        <div class="om-result-card">
          <div class="om-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h2>${matchScore === 5 ? "Perfect!" : matchScore >= 3 ? "Nice work!" : "Keep practicing!"}</h2>
          <p class="om-result-score">You matched <strong>${matchScore}</strong> of 5 correctly.</p>
        </div>

        <section class="om-section om-section-review">
          <p class="om-section-label">Correct answers</p>
          <div class="om-review">
            ${MESSAGES.map((m) => {
              const user = slots[m.id];
              const ok = user === m.correct;
              const ans = getAnswer(m.correct);
              return `
                <div class="om-review-row ${ok ? "ok" : "bad"}">
                  <div class="om-msg mike">
                    <span class="om-num">${m.id}</span>
                    <p>${escapeHtml(m.text)}</p>
                  </div>
                  <div class="om-msg lina ${ok ? "is-correct" : "is-wrong"}">
                    <span class="om-chip-id">${m.correct}</span>
                    <p>${escapeHtml(ans.text)}</p>
                    ${!ok ? `<span class="om-yours">You chose ${user}</span>` : ""}
                  </div>
                </div>`;
            }).join("")}
          </div>
        </section>

        <div class="om-actions">
          <button type="button" class="om-btn" id="om-next-part">Continue to Vocabulary →</button>
        </div>
      </div>`;
    document.getElementById("om-next-part").onclick = goToVocab;
  }

  function renderVocabDone() {
    const stars = vocabScore === 5 ? 3 : vocabScore >= 4 ? 2 : vocabScore >= 2 ? 1 : 0;
    const total = matchScore + vocabScore;
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 2 · Complete</span>
          <span class="om-title">Vocabulary</span>
        </div>
        <span class="om-progress">${vocabScore} / 5</span>
      </header>
      <div class="om-body">
        <div class="om-result-card">
          <div class="om-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h2>${vocabScore === 5 ? "Perfect!" : vocabScore >= 3 ? "Nice work!" : "Keep practicing!"}</h2>
          <p class="om-result-score">
            Vocabulary: <strong>${vocabScore}/5</strong>
            · Total: <strong>${total}/10</strong>
          </p>
        </div>

        <section class="om-section">
          <p class="om-section-label">Listen to the conversation</p>
          <div class="om-audio-bar">
            <button type="button" class="om-play" id="om-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <div class="om-audio-meta">
              <strong>Full conversation</strong>
              <span id="om-audio-status">Tap to listen</span>
            </div>
          </div>
        </section>

        <section class="om-section om-section-review">
          <p class="om-section-label">Correct answers</p>
          <div class="om-review">
            ${VOCAB.map((v) => {
              const user = vocabSlots[v.id];
              const ok = user === v.correct;
              return `
                <div class="om-vocab-review ${ok ? "ok" : "bad"}">
                  <span class="om-num">${v.id}</span>
                  <p>${escapeHtml(v.before)}
                    <strong class="${ok ? "ok" : "bad"}">${escapeHtml(v.correct)}</strong>
                    ${v.after ? " " + escapeHtml(v.after) : ""}
                    ${!ok ? `<span class="om-yours">You: ${escapeHtml(user)}</span>` : ""}
                  </p>
                </div>`;
            }).join("")}
          </div>
        </section>

        <div class="om-actions">
          <button type="button" class="om-btn" id="om-again">Try again</button>
        </div>
      </div>`;
    document.getElementById("om-play").onclick = playAudio;
    document.getElementById("om-again").onclick = resetGame;
  }

  function renderVocab() {
    const used = usedWords();
    const filled = allVocabFilled();
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 2 · Vocabulary</span>
          <span class="om-title">Complete the phrases</span>
        </div>
        <span class="om-progress">${Object.values(vocabSlots).filter(Boolean).length} / 5</span>
      </header>
      <div class="om-body om-body-vocab">
        <p class="om-intro">Use the chips to complete each phrase.</p>

        <div class="om-word-bank" id="om-word-bank">
          ${vocabOrder.map((w) => renderWordChip(w, { inSlot: false })).join("")}
        </div>

        <div class="om-vocab-list">
          ${VOCAB.map((v) => {
            const word = vocabSlots[v.id];
            return `
              <div class="om-vocab-row ${word ? "filled" : ""} ${selectedWord && !word ? "ready" : ""}"
                   data-vocab="${v.id}">
                <span class="om-num">${v.id}</span>
                <div class="om-vocab-text">
                  <span>${escapeHtml(v.before)}</span>
                  <span class="om-blank ${word ? "has-word" : ""}" data-blank="${v.id}">
                    ${word
                      ? renderWordChip(word, { inSlot: true })
                      : '<span class="om-blank-line">______</span>'}
                  </span>
                  ${v.after ? `<span> ${escapeHtml(v.after)}</span>` : ""}
                </div>
              </div>`;
          }).join("")}
        </div>

        <div class="om-actions">
          <button type="button" class="om-btn secondary" id="om-v-clear"
            ${Object.values(vocabSlots).some(Boolean) ? "" : "disabled"}>Clear</button>
          <button type="button" class="om-btn" id="om-v-check" ${filled ? "" : "disabled"}>Check answers</button>
        </div>
      </div>`;

    // Bind word bank
    app.querySelectorAll("#om-word-bank .om-word-chip").forEach((el) => {
      const word = el.dataset.word;
      if (used.has(word)) return;
      el.addEventListener("click", () => onWordTap(word));
      el.addEventListener("dragstart", (e) => onWordDragStart(e, word));
      el.addEventListener("dragend", onDragEnd);
    });

    // Bind rows
    app.querySelectorAll(".om-vocab-row").forEach((el) => {
      const id = +el.dataset.vocab;
      el.addEventListener("click", (e) => {
        // if clicking placed chip, clear it
        if (e.target.closest(".om-word-chip.in-slot")) {
          e.stopPropagation();
          clearVocabSlot(id);
          return;
        }
        onVocabRowTap(id);
      });
      el.addEventListener("dragover", onDragOver);
      el.addEventListener("dragleave", onDragLeave);
      el.addEventListener("drop", (e) => onWordDrop(e, id));
    });

    document.getElementById("om-v-check").onclick = checkVocab;
    document.getElementById("om-v-clear").onclick = () => {
      vocabSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
      selectedWord = null;
      render();
    };
  }

  function renderMatch() {
    const used = usedLetters();
    const filled = allMatchFilled();
    app.innerHTML = `
      <header class="om-top">
        <a class="om-back" href="../" aria-label="Back">←</a>
        <div class="om-top-center">
          <span class="om-eyebrow">Part 1 · Messages</span>
          <span class="om-title">Order the Messages</span>
        </div>
        <span class="om-progress">${Object.values(slots).filter(Boolean).length} / 5</span>
      </header>
      <div class="om-body">
        <p class="om-intro">Match Lina’s answers <strong>A–E</strong> to Mike’s messages <strong>1–5</strong>. Drag or tap to place.</p>

        <div class="om-board">
          <section class="om-col om-col-mike" aria-label="Mike's messages">
            <p class="om-col-label">Mike</p>
            ${MESSAGES.map((m) => {
              const letter = slots[m.id];
              const isJust = lastPlaced && lastPlaced.msgId === m.id && lastPlaced.letter === letter;
              return `
                <div class="om-slot ${letter ? "filled" : ""} ${selectedLetter && !letter ? "ready" : ""} ${isJust ? "just-dropped" : ""}"
                     data-msg="${m.id}" role="button" tabindex="0"
                     aria-label="Message ${m.id} drop zone">
                  <div class="om-msg mike">
                    <span class="om-num">${m.id}</span>
                    <p>${escapeHtml(m.text)}</p>
                  </div>
                  <div class="om-dropzone">
                    ${letter
                      ? renderMatchChip(letter, { inSlot: true, justPlaced: isJust })
                      : `<span class="om-placeholder">Drop answer here</span>`}
                  </div>
                </div>`;
            }).join("")}
          </section>

          <section class="om-col om-col-lina" aria-label="Lina's answers">
            <p class="om-col-label">Lina — drag or tap</p>
            <div class="om-chips" id="om-chips">
              ${answerOrder.map((id) => renderMatchChip(id, { inSlot: false })).join("")}
            </div>
          </section>
        </div>

        <div class="om-actions">
          <button type="button" class="om-btn secondary" id="om-reset"
            ${Object.values(slots).some(Boolean) ? "" : "disabled"}>Clear</button>
          <button type="button" class="om-btn" id="om-check" ${filled ? "" : "disabled"}>Check · Next</button>
        </div>
      </div>`;

    app.querySelectorAll(".om-slot").forEach((el) => {
      const msgId = +el.dataset.msg;
      el.addEventListener("click", () => onSlotTap(msgId));
      el.addEventListener("dragover", onDragOver);
      el.addEventListener("dragleave", onDragLeave);
      el.addEventListener("drop", (e) => onDrop(e, msgId));
      const chip = el.querySelector(".om-chip.in-slot");
      if (chip) {
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          clearSlot(msgId);
        });
      }
    });

    app.querySelectorAll("#om-chips .om-chip").forEach((el) => {
      const letter = el.dataset.letter;
      if (used.has(letter)) return;
      el.addEventListener("click", () => onChipTap(letter));
      el.addEventListener("dragstart", (e) => onDragStart(e, letter));
      el.addEventListener("dragend", onDragEnd);
    });

    document.getElementById("om-check").onclick = checkMatch;
    document.getElementById("om-reset").onclick = () => {
      slots = { 1: null, 2: null, 3: null, 4: null, 5: null };
      selectedLetter = null;
      render();
    };
  }

  function render() {
    if (phase === "match-done") return renderMatchDone();
    if (phase === "vocab") return renderVocab();
    if (phase === "vocab-done") return renderVocabDone();
    return renderMatch();
  }

  render();
})();
