/* Listen & Write / Listen & Say — AEF Starter Unit 4B adjectives */
(function () {
  "use strict";

  const GAME_ID = "starter-4b-listen-write-adjectives";

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

  let mode = "write"; // "write" | "say"
  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;
  let currentAudio = null;
  let recognition = null;
  let isListening = false;

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const modeLabel = $("modeLabel");
  const scoreStat = $("scoreStat");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const sceneImg = $("sceneImg");
  const playBtn = $("playBtn");
  const listenHint = $("listenHint");
  const writePanel = $("writePanel");
  const sayPanel = $("sayPanel");
  const answerInput = $("answerInput");
  const checkBtn = $("checkBtn");
  const feedback = $("feedback");
  const actionRow = $("actionRow");
  const sayPrompt = $("sayPrompt");
  const revealedWord = $("revealedWord");
  const micBtn = $("micBtn");
  const micStatus = $("micStatus");
  const sayFeedback = $("sayFeedback");
  const sayActionRow = $("sayActionRow");
  const nextSayBtn = $("nextSayBtn");
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
  function playVictory() {
    const notes = [
      [523.25, 0], [659.25, 120], [783.99, 240], [1046.50, 360],
      [783.99, 520], [1046.50, 640], [1318.51, 800],
    ];
    notes.forEach(([freq, delay]) => {
      setTimeout(() => playTone(freq, 0.28, "sine", 0.17), delay);
    });
    setTimeout(() => {
      playTone(523.25, 0.5, "sine", 0.1);
      playTone(659.25, 0.5, "sine", 0.1);
      playTone(783.99, 0.5, "sine", 0.12);
    }, 980);
  }

  function spawnParticles(originEl) {
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#a855f7"];
    const rect = originEl.getBoundingClientRect();
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
      p.style.width = (5 + Math.random() * 6) + "px";
      p.style.height = p.style.width;
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      p.style.animationDuration = (0.5 + Math.random() * 0.35) + "s";
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

  function normalize(s) {
    return (s || "").toLowerCase().trim().replace(/\s+/g, "");
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    playBtn.classList.remove("playing");
    listenHint.textContent = "Tap to listen";
  }

  function playWordAudio() {
    const item = current();
    if (!item) return;
    stopAudio();
    currentAudio = new Audio(item.audio);
    playBtn.classList.add("playing");
    listenHint.textContent = "Playing…";
    currentAudio.play().catch(() => {
      playBtn.classList.remove("playing");
      listenHint.textContent = "Tap to listen";
    });
    currentAudio.onended = () => {
      playBtn.classList.remove("playing");
      listenHint.textContent = "Tap to listen again";
    };
  }

  // ---------- screens ----------
  function showStart() {
    stopAudio();
    if (typeof stopListening === "function") stopListening();
    startScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    endOverlay.hidden = true;
  }

  function startMode(m) {
    mode = m;
    order = shuffle(WORDS);
    index = 0;
    score = 0;
    locked = false;

    modeLabel.textContent = m === "write" ? "Listen & Write" : "Listen & Say";
    scoreStat.style.display = m === "write" ? "" : "none";
    writePanel.classList.toggle("hidden", m !== "write");
    sayPanel.classList.toggle("hidden", m !== "say");

    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    endOverlay.hidden = true;

    renderRound();
  }

  function renderRound() {
    locked = false;
    const item = current();
    if (!item) {
      showEnd();
      return;
    }

    qProgress.textContent = (index + 1) + "/" + order.length;
    scoreText.textContent = score;
    sceneImg.src = item.img;
    sceneImg.alt = item.word;

    if (mode === "write") {
      answerInput.value = "";
      answerInput.disabled = false;
      answerInput.classList.remove("correct", "wrong");
      feedback.hidden = true;
      feedback.textContent = "";
      actionRow.hidden = false;
      checkBtn.disabled = true;
      setTimeout(() => answerInput.focus(), 200);
    } else {
      stopListening();
      sayPrompt.textContent = "Tap the mic and say the word";
      revealedWord.hidden = true;
      revealedWord.textContent = "";
      sayFeedback.hidden = true;
      sayFeedback.textContent = "";
      sayActionRow.hidden = true;
      micBtn.classList.remove("listening", "success", "error");
      micBtn.disabled = false;
      micStatus.textContent = "Tap microphone";
    }

    setTimeout(playWordAudio, 300);
  }

  function checkWrite() {
    if (locked || mode !== "write") return;
    locked = true;
    const item = current();
    const ok = normalize(answerInput.value) === normalize(item.word);

    answerInput.disabled = true;
    actionRow.hidden = true;

    if (ok) {
      score++;
      scoreText.textContent = score;
      answerInput.classList.add("correct");
      feedback.hidden = false;
      feedback.className = "feedback ok";
      feedback.textContent = "✓ " + item.word;
      playSuccess();
      spawnParticles(answerInput);
    } else {
      answerInput.classList.add("wrong");
      feedback.hidden = false;
      feedback.className = "feedback bad";
      feedback.textContent = "✗ " + item.word;
      playError();
      shakeScreen();
    }

    setTimeout(() => {
      index++;
      if (index >= order.length) showEnd();
      else renderRound();
    }, 1200);
  }

  function nextSay() {
    if (mode !== "say") return;
    index++;
    if (index >= order.length) showEnd();
    else renderRound();
  }

  function showEnd() {
    stopAudio();
    playVictory();
    spawnConfetti();

    const total = order.length;

    // Stars ONLY for Listen & Write
    if (mode === "write" && typeof window.laStars === "function") {
      try { window.laStars(GAME_ID, score, total); } catch (e) {}
    }

    if (mode === "write") {
      if (score === total) {
        endEmoji.textContent = "🎉";
        endTitle.textContent = "Perfect!";
        endMsg.textContent = "You wrote all " + total + " adjectives correctly!";
      } else if (score >= total * 0.7) {
        endEmoji.textContent = "👍";
        endTitle.textContent = "Great job!";
        endMsg.textContent = "You got " + score + " out of " + total + ".";
      } else {
        endEmoji.textContent = "💪";
        endTitle.textContent = "Keep practicing!";
        endMsg.textContent = "You got " + score + " out of " + total + ". Try again!";
      }
    } else {
      endEmoji.textContent = "🗣️";
      endTitle.textContent = "Nice speaking!";
      endMsg.textContent = "You practiced all " + total + " adjectives. Stars are earned in Listen & Write mode.";
    }

    endOverlay.hidden = false;
  }

  // ---------- events ----------
  $("modeWrite").addEventListener("click", () => startMode("write"));
  $("modeSay").addEventListener("click", () => startMode("say"));
  backToModes.addEventListener("click", showStart);
  homeModesBtn.addEventListener("click", showStart);
  againBtn.addEventListener("click", () => startMode(mode));

  playBtn.addEventListener("click", playWordAudio);

  answerInput.addEventListener("input", () => {
    if (locked) return;
    checkBtn.disabled = answerInput.value.trim().length === 0;
  });
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !checkBtn.disabled && !locked) {
      e.preventDefault();
      checkWrite();
    }
  });
  checkBtn.addEventListener("click", checkWrite);


  // ---------- Speech recognition (Listen & Say) ----------
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
        micBtn.classList.add("listening");
        micBtn.classList.remove("success", "error");
        micStatus.textContent = "Listening… speak now";
        sayPrompt.textContent = "Listening…";
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove("listening");
        if (!locked && mode === "say") {
          // keep status unless already resolved
        }
      };

      recognition.onerror = (e) => {
        isListening = false;
        micBtn.classList.remove("listening");
        if (e.error === "not-allowed") {
          micStatus.textContent = "Microphone blocked — allow mic access";
        } else if (e.error === "no-speech") {
          micStatus.textContent = "No speech heard — try again";
        } else {
          micStatus.textContent = "Try again";
        }
      };

      recognition.onresult = (event) => {
        const item = current();
        if (!item || locked || mode !== "say") return;

        const alts = [];
        for (let i = 0; i < event.results[0].length; i++) {
          alts.push(normalize(event.results[0][i].transcript));
        }
        const heard = alts[0] || "";
        const target = normalize(item.word);
        // accept exact match or if any alternative contains the word
        const ok = alts.some((a) => a === target || a.includes(target) || target.includes(a));

        locked = true;
        micBtn.classList.remove("listening");

        if (ok) {
          micBtn.classList.add("success");
          micStatus.textContent = "You said: " + (alts[0] || item.word);
          sayFeedback.hidden = false;
          sayFeedback.className = "feedback ok";
          sayFeedback.textContent = "✓ " + item.word;
          revealedWord.hidden = true;
          playSuccess();
          spawnParticles(micBtn);
          setTimeout(() => {
            index++;
            if (index >= order.length) showEnd();
            else renderRound();
          }, 1100);
        } else {
          micBtn.classList.add("error");
          micStatus.textContent = heard ? ("Heard: " + heard) : "Not recognized";
          sayFeedback.hidden = false;
          sayFeedback.className = "feedback bad";
          sayFeedback.textContent = "✗ Try again — " + item.word;
          revealedWord.textContent = item.word;
          revealedWord.hidden = false;
          playError();
          shakeScreen();
          sayActionRow.hidden = false;
          // allow retry
          locked = false;
          setTimeout(() => {
            micBtn.classList.remove("error");
          }, 800);
        }
      };
    }
    return recognition;
  }

  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (e) {}
    }
    isListening = false;
    micBtn.classList.remove("listening");
  }

  function startListening() {
    if (mode !== "say" || locked) return;
    const rec = getRecognition();
    if (!rec) {
      micStatus.textContent = "Speech recognition not supported in this browser";
      sayFeedback.hidden = false;
      sayFeedback.className = "feedback bad";
      sayFeedback.textContent = "Use Chrome or Edge for voice mode";
      sayActionRow.hidden = false;
      revealedWord.textContent = current() ? current().word : "";
      revealedWord.hidden = false;
      return;
    }
    stopAudio();
    try {
      // reset result UI for a new attempt
      sayFeedback.hidden = true;
      revealedWord.hidden = true;
      sayActionRow.hidden = true;
      micBtn.classList.remove("success", "error");
      rec.start();
    } catch (e) {
      // already started
      try { rec.stop(); } catch (e2) {}
      setTimeout(() => {
        try { rec.start(); } catch (e3) {}
      }, 200);
    }
  }

  micBtn.addEventListener("click", () => {
    if (isListening) {
      stopListening();
      micStatus.textContent = "Tap microphone";
      sayPrompt.textContent = "Tap the mic and say the word";
    } else {
      startListening();
    }
  });
  nextSayBtn.addEventListener("click", nextSay);
})();
