/* Listen & Write the Plural — AEF Starter Unit 4B */
(function () {
  "use strict";

  const GAME_ID = "starter-4b-listen-write-plural";

  const ITEMS = [
    {
      singular: "an American car",
      plural: "American cars",
      answers: ["american cars", "american car's", "americans cars"],
      singularAudio: "audio/1 an american car.mp3",
      pluralAudio: "audio/1 american cars.mp3",
    },
    {
      singular: "an expensive watch",
      plural: "expensive watches",
      answers: ["expensive watches", "expensive watchs"],
      singularAudio: "audio/2 an expensive watch.mp3",
      pluralAudio: "audio/2 expensive watches.mp3",
    },
    {
      singular: "a big house",
      plural: "big houses",
      answers: ["big houses", "big house's"],
      singularAudio: "audio/3 a big house.mp3",
      pluralAudio: "audio/3 big houses.mp3",
    },
    {
      singular: "a tall man",
      plural: "tall men",
      answers: ["tall men", "tall mans"],
      singularAudio: "audio/4 a tall man.mp3",
      pluralAudio: "audio/4 tall men.mp3",
    },
    {
      singular: "a long book",
      plural: "long books",
      answers: ["long books", "long book's"],
      singularAudio: "audio/5 a long book.mp3",
      pluralAudio: "audio/5 long books.mp3",
    },
    {
      singular: "a new phone",
      plural: "new phones",
      answers: ["new phones", "new phone's"],
      singularAudio: "audio/6 a new phone.mp3",
      pluralAudio: "audio/6 new phones.mp3",
    },
    {
      singular: "a good friend",
      plural: "good friends",
      answers: ["good friends", "good friend's"],
      singularAudio: "audio/7 a good friend.mp3",
      pluralAudio: "audio/7 good friends.mp3",
    },
    {
      singular: "a beautiful woman",
      plural: "beautiful women",
      answers: ["beautiful women", "beautiful womans", "beautiful woman"],
      singularAudio: "audio/8 a beautiful woman.mp3",
      pluralAudio: "audio/8 beautiful women.mp3",
    },
    {
      singular: "a small child",
      plural: "small children",
      answers: ["small children", "small childs", "small childrens"],
      singularAudio: "audio/9 a small child.mp3",
      pluralAudio: "audio/9 small children.mp3",
    },
  ];

  // —— DOM ——
  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endOverlay = $("endOverlay");
  const startBtn = $("startBtn");
  const backBtn = $("backBtn");
  const playBtn = $("playBtn");
  const listenHint = $("listenHint");
  const answerInput = $("answerInput");
  const checkBtn = $("checkBtn");
  const nextBtn = $("nextBtn");
  const actionRow = $("actionRow");
  const nextRow = $("nextRow");
  const feedback = $("feedback");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const endEmoji = $("endEmoji");
  const endTitle = $("endTitle");
  const endMsg = $("endMsg");
  const endStars = $("endStars");
  const againBtn = $("againBtn");

  // —— State ——
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let currentAudio = null;

  // —— SFX (Web Audio, same style as other 4B games) ——
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function playTone(freq, duration, type, volume) {
    try {
      const ctx = ensureAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.value = volume || 0.12;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch (e) {}
  }
  function playClick() { playTone(660, 0.05, "sine", 0.08); }
  function playSuccess() {
    playTone(523.25, 0.12, "sine", 0.16);
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.16), 90);
    setTimeout(() => playTone(783.99, 0.22, "sine", 0.18), 180);
  }
  function playError() {
    playTone(180, 0.18, "triangle", 0.12);
    setTimeout(() => playTone(140, 0.22, "triangle", 0.1), 120);
  }
  function playVictory() {
    const notes = [[523.25, 0], [659.25, 120], [783.99, 240], [1046.5, 400]];
    notes.forEach(([f, d]) => setTimeout(() => playTone(f, 0.28, "sine", 0.17), d));
  }

  // —— Audio helpers ——
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    playBtn.classList.remove("is-playing");
  }

  function playFile(src, onEnd) {
    stopAudio();
    currentAudio = new Audio(src);
    playBtn.classList.add("is-playing");
    currentAudio.play().catch(() => {
      playBtn.classList.remove("is-playing");
    });
    currentAudio.onended = () => {
      playBtn.classList.remove("is-playing");
      currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function playSingular() {
    const item = order[index];
    if (!item) return;
    listenHint.textContent = "Playing singular…";
    playFile(item.singularAudio, () => {
      listenHint.textContent = "Tap to listen again";
    });
  }

  function playPlural(then) {
    const item = order[index];
    if (!item) return;
    listenHint.textContent = "Playing plural…";
    playFile(item.pluralAudio, () => {
      listenHint.textContent = "Tap to hear singular again";
      if (then) then();
    });
  }

  // —— Normalize answer ——
  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]+/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(input, item) {
    const n = normalize(input);
    if (!n) return false;
    if (n === normalize(item.plural)) return true;
    return (item.answers || []).some((a) => normalize(a) === n);
  }

  // —— Flow ——
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function showStart() {
    stopAudio();
    endOverlay.hidden = true;
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    playClick();
    order = shuffle(ITEMS);
    index = 0;
    score = 0;
    locked = false;
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    endOverlay.hidden = true;
    scoreText.textContent = "0";
    renderRound();
  }

  function renderRound() {
    const item = order[index];
    if (!item) return showEnd();

    locked = false;
    qProgress.textContent = (index + 1) + "/" + order.length;
    scoreText.textContent = String(score);

    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.classList.remove("correct", "wrong");
    feedback.hidden = true;
    feedback.className = "feedback";
    actionRow.classList.remove("hidden");
    nextRow.classList.add("hidden");
    checkBtn.disabled = true;
    listenHint.textContent = "Tap to listen (singular)";

    stopAudio();
    setTimeout(() => {
      playSingular();
      answerInput.focus();
    }, 280);
  }

  function onCheck() {
    if (locked) return;
    const item = order[index];
    const val = answerInput.value;
    if (!normalize(val)) return;

    locked = true;
    playClick();
    checkBtn.disabled = true;
    answerInput.disabled = true;

    const ok = isCorrect(val, item);
    if (ok) {
      score += 1;
      scoreText.textContent = String(score);
      answerInput.classList.add("correct");
      feedback.hidden = false;
      feedback.className = "feedback is-correct";
      feedback.textContent = "✓ " + item.plural;
      playSuccess();
    } else {
      answerInput.classList.add("wrong");
      feedback.hidden = false;
      feedback.className = "feedback is-wrong";
      feedback.textContent = "✗ " + item.plural;
      playError();
    }

    // Play the correct plural audio after feedback
    setTimeout(() => playPlural(), 350);

    actionRow.classList.add("hidden");
    nextRow.classList.remove("hidden");
  }

  function onNext() {
    playClick();
    index += 1;
    if (index >= order.length) showEnd();
    else renderRound();
  }

  function showEnd() {
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: order.length || ITEMS.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => showStart(),
          backHref: "../"
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }

    stopAudio();
    playVictory();
    spawnConfetti();

    const total = order.length;
    // Stars from accuracy
    if (typeof window.laStars === "function") {
      try { window.laStars(GAME_ID, score, total); } catch (e) {}
    } else if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, total ? (score / total) * 100 : 0);
    }

    if (score === total) {
      endEmoji.textContent = "🎉";
      endTitle.textContent = "Perfect!";
      endMsg.textContent = "You got all " + total + " plurals right!";
    } else if (score >= total * 0.7) {
      endEmoji.textContent = "👍";
      endTitle.textContent = "Great job!";
      endMsg.textContent = "You got " + score + " out of " + total + ".";
    } else {
      endEmoji.textContent = "💪";
      endTitle.textContent = "Keep practicing!";
      endMsg.textContent = "You got " + score + " out of " + total + ". Try again!";
    }

    // Visual stars on end screen
    const acc = total ? (score / total) * 100 : 0;
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    endStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);

    endOverlay.hidden = false;
  }

  function spawnConfetti() {
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    const colors = ["#6366f1", "#fbbf24", "#22c55e", "#f472b6", "#38bdf8", "#fb923c"];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.4 + Math.random() * 1.6) + "s";
      p.style.animationDelay = Math.random() * 0.4 + "s";
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3200);
  }

  // —— Events ——
  startBtn.addEventListener("click", startGame);
  backBtn.addEventListener("click", () => { playClick(); showStart(); });
  playBtn.addEventListener("click", () => {
    if (locked) {
      // After check, replay plural; otherwise singular
      const item = order[index];
      if (item) playFile(item.pluralAudio);
    } else {
      playSingular();
    }
  });
  answerInput.addEventListener("input", () => {
    checkBtn.disabled = !normalize(answerInput.value) || locked;
  });
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !checkBtn.disabled && !locked) onCheck();
  });
  checkBtn.addEventListener("click", onCheck);
  nextBtn.addEventListener("click", onNext);
  againBtn.addEventListener("click", startGame);

  // Boot
  showStart();
})();
