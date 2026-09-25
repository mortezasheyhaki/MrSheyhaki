/* Listen & Say — AEF Starter Unit 4B */
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

const GAME_ID = "starter-4b-listen-and-say";

  const ITEMS = [
    {
      phrase: "a big umbrella",
      audio: "audio/a big umbrella.mp3",
      answers: ["a big umbrella", "big umbrella"],
    },
    {
      phrase: "an expensive watch",
      audio: "audio/an expensive watch.mp3",
      answers: ["an expensive watch", "a expensive watch", "expensive watch"],
    },
    {
      phrase: "an orange coat",
      audio: "audio/an orange coat.mp3",
      answers: ["an orange coat", "a orange coat", "orange coat"],
    },
    {
      phrase: "an old man",
      audio: "audio/an old man.mp3",
      answers: ["an old man", "a old man", "old man"],
    },
    {
      phrase: "brown eggs",
      audio: "audio/brown eggs.mp3",
      answers: ["brown eggs", "brown egg"],
    },
    {
      phrase: "a short email",
      audio: "audio/a short email.mp3",
      answers: ["a short email", "short email"],
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
  const phraseText = $("phraseText");
  const sayPrompt = $("sayPrompt");
  const micBtn = $("micBtn");
  const micStatus = $("micStatus");
  const feedback = $("feedback");
  const nextRow = $("nextRow");
  const nextBtn = $("nextBtn");
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
  let recognition = null;
  let isListening = false;

  // —— SFX ——
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

  // —— Audio ——
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    playBtn.classList.remove("is-playing");
  }

  function playPhrase() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    stopListening();
    currentAudio = new Audio(item.audio);
    playBtn.classList.add("is-playing");
    listenHint.textContent = "Playing…";
    currentAudio.play().catch(() => {
      playBtn.classList.remove("is-playing");
      listenHint.textContent = "Tap to listen";
    });
    currentAudio.onended = () => {
      playBtn.classList.remove("is-playing");
      listenHint.textContent = "Tap to listen again";
      currentAudio = null;
    };
  }

  // —— Normalize / match ——
  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]+/g, "")
      .replace(/\s+/g, " ");
  }

  function isMatch(heard, item) {
    const n = normalize(heard);
    if (!n) return false;
    if (n === normalize(item.phrase)) return true;
    return (item.answers || []).some((a) => normalize(a) === n);
  }

  // —— Speech recognition ——
  function getRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    if (!recognition) {
      recognition = new SR();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.continuous = false;

      recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add("is-listening");
        micStatus.textContent = "Listening…";
        micStatus.className = "mic-status is-listening";
        sayPrompt.textContent = "Speak now";
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove("is-listening");
        if (!locked) {
          micStatus.textContent = "Tap microphone";
          micStatus.className = "mic-status";
          sayPrompt.textContent = "Tap the mic and say the phrase";
        }
      };

      recognition.onerror = (e) => {
        isListening = false;
        micBtn.classList.remove("is-listening");
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          micStatus.textContent = "Microphone permission denied";
        } else if (e.error === "no-speech") {
          micStatus.textContent = "No speech heard — try again";
        } else {
          micStatus.textContent = "Try again";
        }
        micStatus.className = "mic-status";
      };

      recognition.onresult = (event) => {
        if (locked) return;
        const results = event.results[0];
        let matched = false;
        let bestHeard = "";
        for (let i = 0; i < results.length; i++) {
          const transcript = results[i].transcript;
          if (!bestHeard) bestHeard = transcript;
          if (isMatch(transcript, order[index])) {
            matched = true;
            bestHeard = transcript;
            break;
          }
        }
        handleResult(matched, bestHeard);
      };
    }
    return recognition;
  }

  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (e) {}
    }
    isListening = false;
    micBtn.classList.remove("is-listening");
  }

  function startListening() {
    if (locked) return;
    const rec = getRecognition();
    if (!rec) {
      micStatus.textContent = "Speech recognition not supported in this browser";
      micStatus.className = "mic-status";
      return;
    }
    stopAudio();
    try {
      rec.start();
    } catch (e) {
      // Already started
      try { rec.stop(); } catch (_) {}
      setTimeout(() => {
        try { rec.start(); } catch (_) {}
      }, 200);
    }
  }

  function handleResult(ok, heard) {
    locked = true;
    micBtn.disabled = true;
    stopListening();

    if (ok) { try{sfxCorrect();}catch(e){}
      score += 1;
      scoreText.textContent = String(score);
      feedback.hidden = false;
      feedback.className = "feedback is-correct";
      feedback.textContent = "✓ " + order[index].phrase;
      micStatus.textContent = "Great!";
      micStatus.className = "mic-status is-ok";
      sayPrompt.textContent = "Well said!";
      playSuccess();
    } else {
      feedback.hidden = false;
      feedback.className = "feedback is-wrong";
      feedback.textContent = "✗ " + order[index].phrase + (heard ? "  (heard: “" + heard + "”)" : "");
      micStatus.textContent = "Not quite";
      micStatus.className = "mic-status";
      sayPrompt.textContent = "Listen again and try next time";
      playError();
    }
    nextRow.classList.remove("hidden");
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
    stopListening();
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
    micBtn.disabled = false;
    qProgress.textContent = (index + 1) + "/" + order.length;
    scoreText.textContent = String(score);

    phraseText.textContent = item.phrase;
    feedback.hidden = true;
    feedback.className = "feedback";
    nextRow.classList.add("hidden");
    micStatus.textContent = "Tap microphone";
    micStatus.className = "mic-status";
    sayPrompt.textContent = "Tap the mic and say the phrase";
    listenHint.textContent = "Tap to listen";

    stopAudio();
    stopListening();
    setTimeout(playPhrase, 300);
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
    stopListening();
    playVictory();
    spawnConfetti();

    const total = order.length;
    if (typeof window.laStars === "function") {
      try { window.laStars(GAME_ID, score, total); } catch (e) {}
    } else if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, total ? (score / total) * 100 : 0);
    }

    if (score === total) {
      endEmoji.textContent = "🎉";
      endTitle.textContent = "Perfect!";
      endMsg.textContent = "You said all " + total + " phrases correctly!";
    } else if (score >= total * 0.7) {
      endEmoji.textContent = "👍";
      endTitle.textContent = "Great job!";
      endMsg.textContent = "You got " + score + " out of " + total + ".";
    } else {
      endEmoji.textContent = "💪";
      endTitle.textContent = "Keep practicing!";
      endMsg.textContent = "You got " + score + " out of " + total + ". Try again!";
    }

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
  playBtn.addEventListener("click", playPhrase);
  micBtn.addEventListener("click", () => {
    if (locked) return;
    if (isListening) stopListening();
    else startListening();
  });
  nextBtn.addEventListener("click", onNext);
  againBtn.addEventListener("click", startGame);

  showStart();
})();
