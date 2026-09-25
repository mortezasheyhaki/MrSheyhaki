/* Car Adjectives — AEF Starter Unit 4B
   Listen → place the adjectives under the correct car.
*/
(function () {
  "use strict";

  

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

const GAME_ID = "starter-4b-car-adjectives";

  // Correct sets (order does not matter)
  const CORRECT = {
    blue: ["blue", "ugly", "slow", "cheap"],
    red:  ["red", "beautiful", "fast", "expensive"],
  };

  const ALL_WORDS = [
    "blue", "ugly", "slow", "cheap",
    "red", "beautiful", "fast", "expensive",
  ];

  let locked = false;
  let selectedChip = null; // for tap-to-place on mobile
  let dragChip = null;

  // ---------- sound effects (Web Audio API) ----------
  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, duration, type, volume) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume || 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playSuccess() {
    // cheerful rising arpeggio
    playTone(523.25, 0.12, "sine", 0.16);      // C5
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.16), 90);  // E5
    setTimeout(() => playTone(783.99, 0.22, "sine", 0.18), 180); // G5
  }

  function playPartial() {
    // soft two-note
    playTone(440, 0.12, "sine", 0.14);
    setTimeout(() => playTone(554.37, 0.18, "sine", 0.14), 110);
  }

  function playError() {
    // gentle low buzz
    playTone(180, 0.18, "triangle", 0.12);
    setTimeout(() => playTone(140, 0.22, "triangle", 0.1), 120);
  }

  const $ = (id) => document.getElementById(id);
  const bank = $("bank");
  const blueSlots = $("blueSlots");
  const redSlots = $("redSlots");
  const checkBtn = $("checkBtn");
  const resetBtn = $("resetBtn");
  const actionRow = $("actionRow");
  const afterRow = $("afterRow");
  const playBtn = $("playBtn");
  const playIco = $("playIco");
  const playLabel = $("playLabel");
  const audio = $("audio");
  const scoreText = $("scoreText");
  const endOverlay = $("endOverlay");
  const endEmoji = $("endEmoji");
  const endTitle = $("endTitle");
  const endMsg = $("endMsg");
  const againBtn = $("againBtn");
  const restartBtn = $("restartBtn");
  const replayBtn = $("replayBtn");

  // ---------- helpers ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createChip(word) {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = word;
    el.dataset.word = word;
    el.draggable = true;

    // Desktop drag
    el.addEventListener("dragstart", (e) => {
      if (locked) { e.preventDefault(); return; }
      dragChip = el;
      el.classList.add("dragging");
      e.dataTransfer.setData("text/plain", word);
      e.dataTransfer.effectAllowed = "move";
    });
    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      dragChip = null;
      document.querySelectorAll(".slot.drag-over").forEach((s) => s.classList.remove("drag-over"));
    });

    // Tap to select (mobile-friendly)
    el.addEventListener("click", (e) => {
      if (locked) return;
      e.stopPropagation();
      if (selectedChip === el) {
        selectedChip.classList.remove("selected");
        selectedChip = null;
        return;
      }
      if (selectedChip) selectedChip.classList.remove("selected");
      selectedChip = el;
      el.classList.add("selected");
    });

    return el;
  }

  function placeChipInSlot(chip, slot) {
    // If slot already has a chip, move that one back to bank
    const existing = slot.querySelector(".chip");
    if (existing) {
      existing.classList.remove("in-slot");
      bank.appendChild(existing);
    }

    // Remove from previous parent if needed
    chip.classList.remove("selected");
    chip.classList.add("in-slot");
    slot.appendChild(chip);
    slot.classList.add("filled");

    if (selectedChip === chip) selectedChip = null;
    updateCheckState();
  }

  function returnChipToBank(chip) {
    const slot = chip.closest(".slot");
    if (slot) {
      slot.classList.remove("filled", "correct", "wrong");
    }
    chip.classList.remove("in-slot", "selected");
    bank.appendChild(chip);
    if (selectedChip === chip) selectedChip = null;
    updateCheckState();
  }

  function updateCheckState() {
    if (locked) return;
    const allFilled = document.querySelectorAll(".slot .chip").length === 8;
    checkBtn.disabled = !allFilled;
  }

  // ---------- audio ----------
  function setPlaying(playing) {
    if (playing) {
      playBtn.classList.add("playing");
      playIco.textContent = "⏸";
      playLabel.textContent = "Pause";
    } else {
      playBtn.classList.remove("playing");
      playIco.textContent = "▶";
      playLabel.textContent = "Listen";
    }
  }

  function stopAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
  }

  function playAudio() {
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  // ---------- slot events ----------
  function setupSlots() {
    document.querySelectorAll(".slot").forEach((slot) => {
      // Drag over
      slot.addEventListener("dragover", (e) => {
        if (locked) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        slot.classList.add("drag-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("drag-over");
        if (locked || !dragChip) return;
        placeChipInSlot(dragChip, slot);
      });

      // Tap slot when a chip is selected
      slot.addEventListener("click", () => {
        if (locked) return;
        if (selectedChip) {
          placeChipInSlot(selectedChip, slot);
        } else {
          // If slot has a chip, select it so user can move it
          const chip = slot.querySelector(".chip");
          if (chip) {
            if (selectedChip) selectedChip.classList.remove("selected");
            selectedChip = chip;
            chip.classList.add("selected");
          }
        }
      });
    });
  }

  // Click empty area of bank to deselect
  bank.addEventListener("click", (e) => {
    if (e.target === bank && selectedChip) {
      selectedChip.classList.remove("selected");
      selectedChip = null;
    }
  });

  // Double-click / long-press style: return chip to bank on double-tap of chip in slot
  document.addEventListener("dblclick", (e) => {
    if (locked) return;
    const chip = e.target.closest(".chip.in-slot");
    if (chip) returnChipToBank(chip);
  });

  // ---------- check / reset ----------
  function checkAnswers() {
    if (window.LAFinish) LAFinish.startTimer();
    if (locked) return;
    locked = true;

    let score = 0;
    const results = { blue: [], red: [] };

    ["blue", "red"].forEach((car) => {
      const slots = car === "blue" ? blueSlots : redSlots;
      const chips = Array.from(slots.querySelectorAll(".chip"));
      const words = chips.map((c) => c.dataset.word);
      const needed = CORRECT[car].slice().sort();
      const got = words.slice().sort();

      chips.forEach((chip) => {
        const slot = chip.closest(".slot");
        const ok = CORRECT[car].includes(chip.dataset.word);
        if (ok) { try{sfxCorrect();}catch(e){}
          score++;
          slot.classList.add("correct");
          slot.classList.remove("wrong");
          chip.classList.add("chip-correct");
          chip.classList.remove("chip-wrong");
        } else {
          slot.classList.add("wrong");
          slot.classList.remove("correct");
          chip.classList.add("chip-wrong");
          chip.classList.remove("chip-correct");
        }
        chip.classList.add("locked");
        chip.draggable = false;
      });
    });

    // Also mark empty slots if any (shouldn't happen)
    document.querySelectorAll(".slot:not(.filled)").forEach((s) => {
      s.classList.add("wrong");
    });

    scoreText.textContent = score + "/8";
    actionRow.hidden = true;
    afterRow.hidden = false;

    // Sound effects
    if (score === 8) playSuccess();
    else if (score >= 5) playPartial();
    else playError();

    if (typeof window.laStars === "function") {
      try { window.laStars(GAME_ID, score, 8); } catch (e) {}
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, (score / 8) * 100);
      }
    } catch (e) {}
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: 8,
          timeMs: timeMs,
          onAgain: () => location.reload(),
          onModes: () => { location.href = "../"; },
          backHref: "../"
        });
      } catch (e) { console.warn("LAFinish", e); }
    }
    }

    setTimeout(() => {
      if (score === 8) {
        endEmoji.textContent = "🎉";
        endTitle.textContent = "Perfect!";
        endMsg.textContent = "Blue car → blue, ugly, slow, cheap\nRed car → red, beautiful, fast, expensive";
      } else if (score >= 5) {
        endEmoji.textContent = "👍";
        endTitle.textContent = "Good try!";
        endMsg.textContent = "You got " + score + " out of 8. Listen again and check the remaining ones.";
      } else {
        endEmoji.textContent = "🎧";
        endTitle.textContent = "Keep listening";
        endMsg.textContent = "Blue car: blue, ugly, slow, cheap\nRed car: red, beautiful, fast, expensive";
      }
      endOverlay.hidden = false;
    }, 600);
  }

  function reset() {
    locked = false;
    selectedChip = null;
    stopAudio();

    // Move all chips back to bank and shuffle
    const chips = Array.from(document.querySelectorAll(".chip"));
    chips.forEach((c) => {
      c.classList.remove("in-slot", "selected", "locked", "dragging", "chip-correct", "chip-wrong");
      c.draggable = true;
      bank.appendChild(c);
    });

    // Clear slot states
    document.querySelectorAll(".slot").forEach((s) => {
      s.classList.remove("filled", "correct", "wrong", "drag-over");
    });

    // Re-shuffle order in bank
    const order = shuffle(ALL_WORDS);
    order.forEach((w) => {
      const chip = bank.querySelector(`.chip[data-word="${w}"]`);
      if (chip) bank.appendChild(chip);
    });

    scoreText.textContent = "0/8";
    actionRow.hidden = false;
    afterRow.hidden = true;
    checkBtn.disabled = true;
    endOverlay.hidden = true;
  }

  function init() {
    // Create chips in random order
    shuffle(ALL_WORDS).forEach((w) => {
      bank.appendChild(createChip(w));
    });
    setupSlots();
  }

  // Events
  checkBtn.addEventListener("click", checkAnswers);
  resetBtn.addEventListener("click", reset);
  playBtn.addEventListener("click", playAudio);
  replayBtn.addEventListener("click", () => { stopAudio(); playAudio(); });
  againBtn.addEventListener("click", reset);
  restartBtn.addEventListener("click", reset);

  audio.addEventListener("ended", () => setPlaying(false));
  audio.addEventListener("pause", () => {
    if (audio.currentTime === 0 || audio.ended) setPlaying(false);
  });

  init();
})();
