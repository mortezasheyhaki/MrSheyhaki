/* Sentence Builder — AEF Starter Unit 4B
   Modes: chips → full write
*/
(function () {
  "use strict";

  const GAME_ID = "starter-4b-sentence-builder";

  // words = chips in order; sentence = full correct form; alts = accepted variants
  const ITEMS = [
    {
      adj: "big",
      img: "https://cdn.imgurl.ir/uploads/g670659_01-big.png",
      words: ["It's", "a", "big", "animal"],
      sentence: "It's a big animal.",
      alts: ["it's a big animal", "it is a big animal"],
    },
    {
      adj: "small",
      img: "https://cdn.imgurl.ir/uploads/t1519_02-small.png",
      words: ["It's", "a", "small", "cat"],
      sentence: "It's a small cat.",
      alts: ["it's a small cat", "it is a small cat"],
    },
    {
      adj: "old",
      img: "https://cdn.imgurl.ir/uploads/g107492_03-old.png",
      words: ["He's", "an", "old", "man"],
      sentence: "He's an old man.",
      alts: ["he's an old man", "he is an old man"],
    },
    {
      adj: "new",
      img: "https://cdn.imgurl.ir/uploads/a435649_04-new.png",
      words: ["It's", "a", "new", "car"],
      sentence: "It's a new car.",
      alts: ["it's a new car", "it is a new car"],
    },
    {
      adj: "fast",
      img: "https://cdn.imgurl.ir/uploads/c385481_05-fast.png",
      words: ["It's", "a", "fast", "car"],
      sentence: "It's a fast car.",
      alts: ["it's a fast car", "it is a fast car"],
    },
    {
      adj: "slow",
      img: "https://cdn.imgurl.ir/uploads/l571094_06-slow.png",
      words: ["It's", "a", "slow", "animal"],
      sentence: "It's a slow animal.",
      alts: ["it's a slow animal", "it is a slow animal"],
    },
    {
      adj: "beautiful",
      img: "https://cdn.imgurl.ir/uploads/z59390_07-beautiful.png",
      words: ["She's", "a", "beautiful", "woman"],
      sentence: "She's a beautiful woman.",
      alts: ["she's a beautiful woman", "she is a beautiful woman"],
    },
    {
      adj: "ugly",
      img: "https://cdn.imgurl.ir/uploads/116527_08-ugly.png",
      words: ["It's", "an", "ugly", "fish"],
      sentence: "It's an ugly fish.",
      alts: ["it's an ugly fish", "it is an ugly fish"],
    },
    {
      adj: "cheap",
      img: "https://cdn.imgurl.ir/uploads/d311862_09-cheap.png",
      words: ["It's", "a", "cheap", "pen"],
      sentence: "It's a cheap pen.",
      alts: ["it's a cheap pen", "it is a cheap pen"],
    },
    {
      adj: "expensive",
      img: "https://cdn.imgurl.ir/uploads/u546865_10-expensive.png",
      words: ["It's", "an", "expensive", "watch"],
      sentence: "It's an expensive watch.",
      alts: ["it's an expensive watch", "it is an expensive watch"],
    },
    {
      adj: "long",
      img: "https://cdn.imgurl.ir/uploads/e872442_11-long.png",
      words: ["It's", "a", "long", "road"],
      sentence: "It's a long road.",
      alts: ["it's a long road", "it is a long road"],
    },
    {
      adj: "short",
      img: "https://cdn.imgurl.ir/uploads/p742576_12-short.png",
      words: ["It's", "a", "short", "pencil"],
      sentence: "It's a short pencil.",
      alts: ["it's a short pencil", "it is a short pencil"],
    },
    {
      adj: "clean",
      img: "https://cdn.imgurl.ir/uploads/p70660_13-clean.png",
      words: ["It's", "a", "clean", "room"],
      sentence: "It's a clean room.",
      alts: ["it's a clean room", "it is a clean room"],
    },
    {
      adj: "dirty",
      img: "https://cdn.imgurl.ir/uploads/g324672_14-dirty.png",
      words: ["It's", "a", "dirty", "street"],
      sentence: "It's a dirty street.",
      alts: ["it's a dirty street", "it is a dirty street"],
    },
    {
      adj: "easy",
      img: "https://cdn.imgurl.ir/uploads/r836255_15-easy.png",
      words: ["This", "is", "an", "easy", "exercise"],
      sentence: "This is an easy exercise.",
      alts: ["this is an easy exercise"],
    },
    {
      adj: "difficult",
      img: "https://cdn.imgurl.ir/uploads/h54048_16-difficult.png",
      words: ["This", "is", "a", "difficult", "exercise"],
      sentence: "This is a difficult exercise.",
      alts: ["this is a difficult exercise"],
    },
  ];

  let mode = "chips"; // chips | write
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let placed = []; // chip mode: array of { word, bankIdx }

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const modeLabel = $("modeLabel");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const sceneImg = $("sceneImg");
  const sentenceHint = $("sentenceHint");
  const chipsPanel = $("chipsPanel");
  const writePanel = $("writePanel");
  const answerSlots = $("answerSlots");
  const chipBank = $("chipBank");
  const chipsFeedback = $("chipsFeedback");
  const clearChipsBtn = $("clearChipsBtn");
  const checkChipsBtn = $("checkChipsBtn");
  const chipsActions = $("chipsActions");
  const answerInput = $("answerInput");
  const writeFeedback = $("writeFeedback");
  const checkWriteBtn = $("checkWriteBtn");
  const writeActions = $("writeActions");
  const endOverlay = $("endOverlay");
  const endEmoji = $("endEmoji");
  const endTitle = $("endTitle");
  const endMsg = $("endMsg");
  const againBtn = $("againBtn");
  const homeModesBtn = $("homeModesBtn");
  const backToModes = $("backToModes");

  // ---------- SFX ----------
  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
      gain.gain.setValueAtTime(volume || 0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }
  function playSuccess() {
    playTone(523.25, 0.12, "sine", 0.16);
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.16), 90);
    setTimeout(() => playTone(783.99, 0.22, "sine", 0.18), 180);
  }
  function playError() {
    playTone(180, 0.18, "triangle", 0.12);
    setTimeout(() => playTone(140, 0.22, "triangle", 0.1), 120);
  }
  function playClick() {
    playTone(660, 0.05, "sine", 0.08);
  }
  function playVictory() {
    const notes = [
      [523.25, 0], [659.25, 120], [783.99, 240], [1046.5, 360],
      [783.99, 520], [1046.5, 640], [1318.51, 800],
    ];
    notes.forEach(([f, d]) => setTimeout(() => playTone(f, 0.28, "sine", 0.17), d));
    setTimeout(() => {
      playTone(523.25, 0.5, "sine", 0.1);
      playTone(659.25, 0.5, "sine", 0.1);
      playTone(783.99, 0.5, "sine", 0.12);
    }, 980);
  }

  function spawnParticles(el) {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#a855f7"];
    const rect = el.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "particles";
    document.body.appendChild(layer);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 70;
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.width = 5 + Math.random() * 6 + "px";
      p.style.height = p.style.width;
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 900);
  }

  function spawnConfetti() {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#eab308", "#f43f5e"];
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.width = 6 + Math.random() * 6 + "px";
      p.style.height = 8 + Math.random() * 8 + "px";
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      p.style.animationDelay = Math.random() * 0.4 + "s";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 3200);
  }

  function shakeScreen() {
    const el = $("app");
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
  }

  // ---------- helpers ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function current() {
    return order[index];
  }

  function normalizeSentence(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]+$/g, "")
      .replace(/\s+/g, " ");
  }


  function isCorrectText(user, item) {
    const n = normalizeSentence(user);
    if (n === normalizeSentence(item.sentence)) return true;
    return item.alts.some((a) => n === normalizeSentence(a));
  }

  // ---------- screens ----------
  function showStart() {
    startScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    endOverlay.hidden = true;
  }

  function startMode(m) {
    mode = m;
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    locked = false;

    const labels = {
      chips: "1 · Word chips",
      write: "2 · Full sentence",
    };
    modeLabel.textContent = labels[m] || m;

    chipsPanel.classList.toggle("hidden", m !== "chips");
    writePanel.classList.toggle("hidden", m === "chips");

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    endOverlay.hidden = true;

    renderRound();
  }

  function renderRound() {
    locked = false;
    placed = [];
    const item = current();
    if (!item) {
      showEnd();
      return;
    }

    qProgress.textContent = index + 1 + "/" + order.length;
    scoreText.textContent = score;
    sceneImg.src = item.img;
    sceneImg.alt = item.adj;

    if (mode === "chips") {
      sentenceHint.textContent = "Build the sentence";
      answerSlots.innerHTML = "";
      answerSlots.classList.remove("correct", "wrong");
      chipsFeedback.hidden = true;
      chipsActions.hidden = false;
      checkChipsBtn.disabled = true;

      chipBank.innerHTML = "";
      const scrambled = shuffle(item.words.map((w, i) => ({ w, i })));
      // re-shuffle until not already correct order when possible
      scrambled.forEach((entry, bankIdx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.textContent = entry.w;
        btn.dataset.word = entry.w;
        btn.dataset.bankIdx = String(bankIdx);
        btn.addEventListener("click", () => pickChip(btn));
        chipBank.appendChild(btn);
      });
    } else {
      sentenceHint.textContent = "Write the full sentence";
      answerInput.value = "";
      answerInput.disabled = false;
      answerInput.classList.remove("correct", "wrong");
      writeFeedback.hidden = true;
      writeActions.hidden = false;
      checkWriteBtn.disabled = true;
      setTimeout(() => answerInput.focus(), 200);
    }
  }

  // ---------- chips ----------
  function pickChip(btn) {
    if (locked || btn.classList.contains("used")) return;
    const item = current();
    if (placed.length >= item.words.length) return;

    playClick();
    const word = btn.dataset.word;
    const bankIdx = parseInt(btn.dataset.bankIdx, 10);
    placed.push({ word, bankIdx });
    btn.classList.add("used");

    const chip = document.createElement("div");
    chip.className = "slot-chip";
    chip.textContent = word;
    chip.dataset.bankIdx = String(bankIdx);
    chip.addEventListener("click", () => removeChip(chip));
    answerSlots.appendChild(chip);

    checkChipsBtn.disabled = placed.length !== item.words.length;
  }

  function removeChip(chipEl) {
    if (locked) return;
    const bankIdx = chipEl.dataset.bankIdx;
    chipEl.remove();
    const bankBtn = chipBank.querySelector(`.chip[data-bank-idx="${bankIdx}"]`);
    if (bankBtn) bankBtn.classList.remove("used");
    placed = Array.from(answerSlots.querySelectorAll(".slot-chip")).map((c) => ({
      word: c.textContent,
      bankIdx: parseInt(c.dataset.bankIdx, 10),
    }));
    const item = current();
    checkChipsBtn.disabled = !item || placed.length !== item.words.length;
  }

  function clearChips() {
    if (locked) return;
    placed = [];
    answerSlots.innerHTML = "";
    answerSlots.classList.remove("correct", "wrong");
    chipBank.querySelectorAll(".chip").forEach((b) => b.classList.remove("used"));
    chipsFeedback.hidden = true;
    checkChipsBtn.disabled = true;
  }

  function checkChips() {
    if (locked || mode !== "chips") return;
    locked = true;
    const item = current();
    const user = placed.map((p) => p.word);
    const ok =
      user.length === item.words.length &&
      user.every((w, i) => w === item.words[i]);

    chipBank.querySelectorAll(".chip").forEach((b) => b.classList.add("locked"));
    answerSlots.querySelectorAll(".slot-chip").forEach((c) => c.classList.add("locked"));
    chipsActions.hidden = true;

    if (ok) {
      score++;
      scoreText.textContent = score;
      answerSlots.classList.add("correct");
      chipsFeedback.hidden = false;
      chipsFeedback.className = "feedback ok";
      chipsFeedback.textContent = "✓ " + item.sentence;
      playSuccess();
      spawnParticles(answerSlots);
    } else {
      answerSlots.classList.add("wrong");
      chipsFeedback.hidden = false;
      chipsFeedback.className = "feedback bad";
      chipsFeedback.textContent = "✗ " + item.sentence;
      playError();
      shakeScreen();
    }

    setTimeout(advance, 1300);
  }

  // ---------- write mode ----------
  function checkWrite() {
    if (locked || mode === "chips") return;
    locked = true;
    const item = current();
    const ok = isCorrectText(answerInput.value, item);

    answerInput.disabled = true;
    writeActions.hidden = true;

    if (ok) {
      score++;
      scoreText.textContent = score;
      answerInput.classList.add("correct");
      writeFeedback.hidden = false;
      writeFeedback.className = "feedback ok";
      writeFeedback.textContent = "✓ " + item.sentence;
      playSuccess();
      spawnParticles(answerInput);
    } else {
      answerInput.classList.add("wrong");
      writeFeedback.hidden = false;
      writeFeedback.className = "feedback bad";
      writeFeedback.textContent = "✗ " + item.sentence;
      playError();
      shakeScreen();
    }

    setTimeout(advance, 1300);
  }

  function advance() {
    index++;
    if (index >= order.length) showEnd();
    else renderRound();
  }

  function showEnd() {
    playVictory();
    spawnConfetti();
    const total = order.length;

    // Stars per mode
    if (typeof window.laStars === "function") {
      try {
        window.laStars(GAME_ID + "-" + mode, score, total);
      } catch (e) {}
    }

    if (score === total) {
      endEmoji.textContent = "🎉";
      endTitle.textContent = "Perfect!";
      endMsg.textContent = "You got all " + total + " sentences right!";
    } else if (score >= total * 0.7) {
      endEmoji.textContent = "👍";
      endTitle.textContent = "Great job!";
      endMsg.textContent = "You got " + score + " out of " + total + ".";
    } else {
      endEmoji.textContent = "💪";
      endTitle.textContent = "Keep practicing!";
      endMsg.textContent = "You got " + score + " out of " + total + ". Try again!";
    }
    endOverlay.hidden = false;
  }

  // ---------- events ----------
  document.querySelectorAll(".mode-card").forEach((btn) => {
    btn.addEventListener("click", () => startMode(btn.dataset.mode));
  });
  backToModes.addEventListener("click", showStart);
  homeModesBtn.addEventListener("click", showStart);
  againBtn.addEventListener("click", () => startMode(mode));

  clearChipsBtn.addEventListener("click", clearChips);
  checkChipsBtn.addEventListener("click", checkChips);

  answerInput.addEventListener("input", () => {
    if (locked) return;
    checkWriteBtn.disabled = answerInput.value.trim().length === 0;
  });
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !checkWriteBtn.disabled && !locked) {
      e.preventDefault();
      checkWrite();
    }
  });
  checkWriteBtn.addEventListener("click", checkWrite);
})();
