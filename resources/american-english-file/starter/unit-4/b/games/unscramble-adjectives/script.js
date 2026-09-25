/* Unscramble Adjectives — AEF Starter Unit 4B */
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

const GAME_ID = "starter-4b-unscramble-adjectives";

  const WORDS = [
    { word: "big",        img: "https://cdn.imgurl.ir/uploads/g670659_01-big.png",        audio: "https://cdn.imgurl.ir/uploads/s4775_01-big.mp3" },
    { word: "small",      img: "https://cdn.imgurl.ir/uploads/t1519_02-small.png",      audio: "https://cdn.imgurl.ir/uploads/m45482_02-small.mp3" },
    { word: "old",        img: "https://cdn.imgurl.ir/uploads/g107492_03-old.png",        audio: "https://cdn.imgurl.ir/uploads/r37117_03-old.mp3" },
    { word: "new",        img: "https://cdn.imgurl.ir/uploads/a435649_04-new.png",        audio: "https://cdn.imgurl.ir/uploads/v83131_04-new.mp3" },
    { word: "fast",       img: "https://cdn.imgurl.ir/uploads/c385481_05-fast.png",       audio: "https://cdn.imgurl.ir/uploads/l3102_05-fast.mp3" },
    { word: "slow",       img: "https://cdn.imgurl.ir/uploads/l571094_06-slow.png",       audio: "https://cdn.imgurl.ir/uploads/m184684_06-slow.mp3" },
    { word: "beautiful",  img: "https://cdn.imgurl.ir/uploads/z59390_07-beautiful.png",  audio: "https://cdn.imgurl.ir/uploads/c52036_07-beautiful.mp3" },
    { word: "ugly",       img: "https://cdn.imgurl.ir/uploads/116527_08-ugly.png",       audio: "https://cdn.imgurl.ir/uploads/h06593_08-ugly.mp3" },
    { word: "cheap",      img: "https://cdn.imgurl.ir/uploads/d311862_09-cheap.png",      audio: "https://cdn.imgurl.ir/uploads/l078276_09-cheap.mp3" },
    { word: "expensive",  img: "https://cdn.imgurl.ir/uploads/u546865_10-expensive.png",  audio: "https://cdn.imgurl.ir/uploads/o094312_10-expensive.mp3" },
    { word: "long",       img: "https://cdn.imgurl.ir/uploads/e872442_11-long.png",       audio: "https://cdn.imgurl.ir/uploads/c497284_11-long.mp3" },
    { word: "short",      img: "https://cdn.imgurl.ir/uploads/p742576_12-short.png",      audio: "https://cdn.imgurl.ir/uploads/y898374_12-short.mp3" },
    { word: "clean",      img: "https://cdn.imgurl.ir/uploads/p70660_13-clean.png",      audio: "https://cdn.imgurl.ir/uploads/c30302_13-clean.mp3" },
    { word: "dirty",      img: "https://cdn.imgurl.ir/uploads/g324672_14-dirty.png",      audio: "https://cdn.imgurl.ir/uploads/n496258_14-dirty.mp3" },
    { word: "easy",       img: "https://cdn.imgurl.ir/uploads/r836255_15-easy.png",       audio: "https://cdn.imgurl.ir/uploads/k669792_15-easy.mp3" },
    { word: "difficult",  img: "https://cdn.imgurl.ir/uploads/h54048_16-difficult.png",  audio: "https://cdn.imgurl.ir/uploads/b3587_16-difficult.mp3" },
  ];

  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let placed = []; // array of { letter, bankIdx }
  let currentAudio = null;

  const $ = (id) => document.getElementById(id);
  const sceneImg = $("sceneImg");
  const answerSlots = $("answerSlots");
  const letterBank = $("letterBank");
  const feedback = $("feedback");
  const checkBtn = $("checkBtn");
  const clearBtn = $("clearBtn");
  const actionRow = $("actionRow");
  const hintAudioBtn = $("hintAudioBtn");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const endOverlay = $("endOverlay");
  const endEmoji = $("endEmoji");
  const endTitle = $("endTitle");
  const endMsg = $("endMsg");
  const againBtn = $("againBtn");

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

  function spawnParticles(originEl) {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#a855f7"];
    const rect = originEl.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "particles";
    layer.style.position = "fixed";
    layer.style.left = "0";
    layer.style.top = "0";
    layer.style.width = "100%";
    layer.style.height = "100%";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = "40";
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
      p.style.width = (5 + Math.random() * 6) + "px";
      p.style.height = p.style.width;
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--tx", (Math.cos(angle) * dist) + "px");
      p.style.setProperty("--ty", (Math.sin(angle) * dist) + "px");
      p.style.animationDuration = (0.5 + Math.random() * 0.35) + "s";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 900);
  }

  function shakeScreen(hard) {
    const el = hard ? document.getElementById("app") : document.querySelector(".stage");
    if (!el) return;
    const cls = hard ? "shake" : "shake-soft";
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 500);
  }

  function spawnConfetti() {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#eab308", "#f43f5e"];
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);

    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = (Math.random() * 100) + "vw";
      p.style.background = colors[i % colors.length];
      p.style.width = (6 + Math.random() * 6) + "px";
      p.style.height = (8 + Math.random() * 8) + "px";
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
      p.style.animationDelay = (Math.random() * 0.4) + "s";
      p.style.opacity = String(0.7 + Math.random() * 0.3);
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 3200);
  }

  function playVictory() {
    // Cheerful fanfare for the finish screen
    const notes = [
      [523.25, 0],    // C5
      [659.25, 120],  // E5
      [783.99, 240],  // G5
      [1046.50, 360], // C6
      [783.99, 520],  // G5
      [1046.50, 640], // C6
      [1318.51, 800], // E6
    ];
    notes.forEach(([freq, delay]) => {
      setTimeout(() => playTone(freq, 0.28, "sine", 0.17), delay);
    });
    // soft chord at the end
    setTimeout(() => {
      playTone(523.25, 0.5, "sine", 0.1);
      playTone(659.25, 0.5, "sine", 0.1);
      playTone(783.99, 0.5, "sine", 0.12);
    }, 980);
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

  function scramble(word) {
    let letters = word.split("");
    let result;
    do {
      result = shuffle(letters).join("");
    } while (result === word && word.length > 1);
    return result;
  }

  function current() {
    return order[index];
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  }

  function playWordAudio() {
    const item = current();
    if (!item) return;
    stopAudio();
    currentAudio = new Audio(item.audio);
    currentAudio.play().catch(() => {});
  }

  function updateCheckState() {
    const item = current();
    if (!item || locked) return;
    checkBtn.disabled = placed.length !== item.word.length;
  }

  function getAnswer() {
    return placed.map((p) => p.letter).join("");
  }

  // ---------- render ----------
  function renderRound() {
    locked = false;
    placed = [];
    const item = current();
    if (!item) {
      showEnd();
      return;
    }

    qProgress.textContent = (index + 1) + "/" + order.length;
    scoreText.textContent = score;
    sceneImg.src = item.img;
    sceneImg.alt = item.word;

    const scrambled = scramble(item.word);

    // answer slots
    answerSlots.innerHTML = "";
    for (let i = 0; i < item.word.length; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.index = i;
      slot.addEventListener("click", () => removeFromSlot(i));
      answerSlots.appendChild(slot);
    }

    // letter bank
    letterBank.innerHTML = "";
    scrambled.split("").forEach((ch, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "letter";
      btn.textContent = ch;
      btn.dataset.idx = idx;
      btn.dataset.letter = ch;
      btn.addEventListener("click", () => pickLetter(btn));
      letterBank.appendChild(btn);
    });

    feedback.hidden = true;
    feedback.textContent = "";
    actionRow.hidden = false;
    checkBtn.disabled = true;

    // auto-play audio lightly after a short delay
    setTimeout(playWordAudio, 350);
  }

  function pickLetter(btn) {
    if (locked || btn.classList.contains("used")) return;
    const item = current();
    if (placed.length >= item.word.length) return;

    playClick();
    const letter = btn.dataset.letter;
    const bankIdx = parseInt(btn.dataset.idx, 10);
    placed.push({ letter, bankIdx });
    btn.classList.add("used");

    // fill next empty slot
    const slots = answerSlots.querySelectorAll(".slot");
    const empty = Array.from(slots).find((s) => !s.classList.contains("filled"));
    if (empty) {
      empty.textContent = letter;
      empty.classList.add("filled");
      empty.dataset.bankIdx = bankIdx;
    }
    updateCheckState();
  }

  function removeFromSlot(slotIndex) {
    if (locked) return;
    const slots = answerSlots.querySelectorAll(".slot");
    const slot = slots[slotIndex];
    if (!slot || !slot.classList.contains("filled")) return;

    const bankIdx = parseInt(slot.dataset.bankIdx, 10);
    // remove from placed (find by position)
    // rebuild placed from slots after removal
    slot.textContent = "";
    slot.classList.remove("filled", "correct", "wrong");
    delete slot.dataset.bankIdx;

    // free the bank letter
    const bankBtn = letterBank.querySelector(`.letter[data-idx="${bankIdx}"]`);
    if (bankBtn) bankBtn.classList.remove("used");

    // rebuild placed array from remaining filled slots
    placed = [];
    slots.forEach((s) => {
      if (s.classList.contains("filled") && s.dataset.bankIdx !== undefined) {
        placed.push({
          letter: s.textContent,
          bankIdx: parseInt(s.dataset.bankIdx, 10),
        });
      }
    });
    updateCheckState();
  }

  function clearAnswer() {
    if (locked) return;
    placed = [];
    answerSlots.querySelectorAll(".slot").forEach((s) => {
      s.textContent = "";
      s.classList.remove("filled", "correct", "wrong");
      delete s.dataset.bankIdx;
    });
    letterBank.querySelectorAll(".letter").forEach((b) => b.classList.remove("used"));
    feedback.hidden = true;
    checkBtn.disabled = true;
  }

  function checkAnswer() {
    if (locked) return;
    const item = current();
    const answer = getAnswer().toLowerCase();
    locked = true;

    const slots = answerSlots.querySelectorAll(".slot");
    letterBank.querySelectorAll(".letter").forEach((b) => b.classList.add("locked"));

    if (answer === item.word) {
      score++;
      scoreText.textContent = score;
      slots.forEach((s) => s.classList.add("correct"));
      feedback.hidden = false;
      feedback.className = "feedback ok";
      feedback.textContent = "✓ " + item.word;
      playSuccess();
      spawnParticles(answerSlots);
    } else {
      slots.forEach((s) => s.classList.add("wrong"));
      feedback.hidden = false;
      feedback.className = "feedback bad";
      feedback.textContent = "✗ " + item.word;
      playError();
      shakeScreen(true);
    }

    actionRow.hidden = true;

    // Auto-advance after a short delay
    setTimeout(() => {
      index++;
      if (index >= order.length) {
        showEnd();
      } else {
        renderRound();
      }
    }, 1200);
  }

  function showEnd() {
    // LAStars + LAFinish
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, order.length ? (score / order.length) * 100 : 0);
      }
    } catch (e) {}
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: order.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }

    const total = order.length;
    playVictory();
    spawnConfetti();
    if (typeof window.laStars === "function") {
      try { window.laStars(GAME_ID, score, total); } catch (e) {}
    }
    if (score === total) {
      endEmoji.textContent = "🎉";
      endTitle.textContent = "Perfect!";
      endMsg.textContent = "You unscrambled all " + total + " adjectives!";
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

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(WORDS);
    index = 0;
    score = 0;
    endOverlay.hidden = true;
    renderRound();
  }

  // events
  checkBtn.addEventListener("click", checkAnswer);
  clearBtn.addEventListener("click", clearAnswer);
  hintAudioBtn.addEventListener("click", playWordAudio);
  againBtn.addEventListener("click", startGame);

  startGame();
})();
