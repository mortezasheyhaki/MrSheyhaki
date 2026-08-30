/* =========================================================
   BALLOON SPELL — Colors
   Pop letter balloons to spell each color (picture + audio)
   Place at: learningarcade/vocabulary/colors/balloon-spell/
   ========================================================= */

(function () {
  "use strict";

  const GAME_ID = "vocab-colors-balloon-spell";
  const MAX_LIVES = 3;
  const ASSET_IMG = "../images/";
  const ASSET_AUD = "../audio/";

  const COLORS = [
    { id: "red", word: "red" },
    { id: "blue", word: "blue" },
    { id: "green", word: "green" },
    { id: "yellow", word: "yellow" },
    { id: "orange", word: "orange" },
    { id: "pink", word: "pink" },
    { id: "brown", word: "brown" },
    { id: "black", word: "black" },
    { id: "white", word: "white" },
    { id: "grey", word: "grey" }
  ];

  const BALLOON_COLORS = [
    "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#f97316",
    "#ec4899", "#8b5cf6", "#06b6d4", "#14b8a6", "#a855f7"
  ];

  const EXTRA_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // State
  let deck = [];
  let index = 0;
  let lives = MAX_LIVES;
  let spelled = []; // letters collected so far
  let balloons = []; // {el, letter, x, y, vx, vy, alive}
  let raf = null;
  let muted = false;
  let locked = false; // after reveal or word complete
  let currentAudio = null;
  let isDesktop = window.matchMedia("(pointer: fine)").matches;
  let voiceMode = false;
  let recognition = null;
  let voiceSupported = false;
  let lastVoiceLetter = "";
  let lastVoiceAt = 0;
  let wordsClean = 0;   // completed without Reveal
  let wordsTotalDone = 0;
  let usedRevealThisWord = false;

  // Spoken letter aliases → single uppercase letter
  const LETTER_ALIASES = {
    a: "A", ay: "A", hey: "A",
    b: "B", be: "B", bee: "B",
    c: "C", see: "C", sea: "C",
    d: "D", dee: "D",
    e: "E", ee: "E",
    f: "F", ef: "F", eff: "F",
    g: "G", gee: "G",
    h: "H", aitch: "H", haitch: "H",
    i: "I", eye: "I",
    j: "J", jay: "J",
    k: "K", kay: "K",
    l: "L", el: "L", ell: "L",
    m: "M", em: "M",
    n: "N", en: "N",
    o: "O", oh: "O",
    p: "P", pee: "P",
    q: "Q", cue: "Q", queue: "Q",
    r: "R", ar: "R", are: "R",
    s: "S", ess: "S", es: "S",
    t: "T", tee: "T",
    u: "U", you: "U", yu: "U",
    v: "V", vee: "V",
    w: "W", doubleu: "W", "double u": "W", doubleyou: "W",
    x: "X", ex: "X", eks: "X",
    y: "Y", why: "Y", wye: "Y",
    z: "Z", zee: "Z", zed: "Z"
  };

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const playScreen = $("playScreen");
  const endScreen = $("endScreen");
  const startBtn = $("startBtn");
  const sky = $("sky");
  const stage = $("stage");
  const slots = $("slots");
  const colorImg = $("colorImg");
  const hearBtn = $("hearBtn");
  const livesEl = $("livesEl");
  const progressText = $("progressText");
  const remainingText = $("remainingText");
  const feedback = $("feedback");
  const retryBtn = $("retryBtn");
  const revealBtn = $("revealBtn");
  const muteBtn = $("muteBtn");
  const aim = $("aim");
  const againBtn = $("againBtn");
  const backBtn = $("backBtn");
  const voiceBtn = $("voiceBtn");
  const voiceStatus = $("voiceStatus");
  const voiceStatusText = $("voiceStatusText");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function showScreen(name) {
    startScreen.hidden = name !== "start";
    playScreen.hidden = name !== "play";
    endScreen.hidden = name !== "end";
  }

  function showFeedback(type, msg) {
    feedback.hidden = false;
    feedback.className = "feedback " + type;
    feedback.textContent = msg;
  }

  function hideFeedback() {
    feedback.hidden = true;
  }

  function renderLives() {
    livesEl.textContent = "❤️".repeat(Math.max(0, lives)) + (lives <= 0 ? "💔" : "");
  }

  function playAudio(id) {
    if (muted) return;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentAudio = new Audio(ASSET_AUD + id + ".mp3");
    currentAudio.play().catch(() => {});
  }

  function stopAnim() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function clearBalloons() {
    stopAnim();
    balloons.forEach((b) => b.el.remove());
    balloons = [];
    sky.innerHTML = "";
  }

  function buildLetterPool(word) {
    // Unique letters only — at most one balloon per letter (better for voice)
    const needed = word.toUpperCase().split("");
    const uniqueNeeded = [];
    const seen = {};
    needed.forEach((ch) => {
      if (!seen[ch]) {
        seen[ch] = true;
        uniqueNeeded.push(ch);
      }
    });
    const pool = uniqueNeeded.slice();
    // Distractors: unique letters not already in the word
    const extraCount = Math.min(5, Math.max(2, Math.ceil(uniqueNeeded.length * 0.5)));
    let guard = 0;
    while (pool.length < uniqueNeeded.length + extraCount && guard < 60) {
      guard++;
      const ch = EXTRA_LETTERS[Math.floor(Math.random() * EXTRA_LETTERS.length)];
      if (pool.indexOf(ch) === -1) pool.push(ch);
    }
    return shuffle(pool);
  }

  function renderSlots(word) {
    slots.innerHTML = "";
    for (let i = 0; i < word.length; i++) {
      const s = document.createElement("div");
      s.className = "slot" + (spelled[i] ? " filled" : "");
      s.textContent = spelled[i] || "";
      slots.appendChild(s);
    }
  }

  function spawnOneBalloon(letter) {
    if (locked) return;
    const rect = stage.getBoundingClientRect();
    const w = rect.width || 300;
    const h = (rect.height || 400) * 0.72;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "balloon";
    btn.setAttribute("aria-label", "Letter " + letter);
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    btn.innerHTML =
      '<div class="balloon-body" style="background:' + color + ';border-bottom-color:' + color + '"></div>' +
      '<div class="balloon-string"></div>';
    btn.querySelector(".balloon-body").textContent = letter;
    sky.appendChild(btn);
    const x = 40 + Math.random() * Math.max(20, w - 80);
    const y = 40 + Math.random() * Math.max(40, h - 80);
    const b = {
      el: btn,
      letter: letter,
      x: x,
      y: y,
      vx: (Math.random() * 0.6 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
      vy: -(Math.random() * 0.35 + 0.15),
      alive: true,
      phase: Math.random() * Math.PI * 2
    };
    btn.style.left = b.x + "px";
    btn.style.top = b.y + "px";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onPop(b);
    });
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      onPop(b);
    }, { passive: false });
    balloons.push(b);
  }

  function spawnBalloons(word) {
    clearBalloons();
    const pool = buildLetterPool(word);
    const rect = stage.getBoundingClientRect();
    const w = rect.width || 300;
    const h = (rect.height || 400) * 0.72; // keep clear of prompt card

    pool.forEach((letter, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "balloon";
      btn.setAttribute("aria-label", "Letter " + letter);
      const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
      btn.innerHTML =
        '<div class="balloon-body" style="background:' + color + ';border-bottom-color:' + color + '"></div>' +
        '<div class="balloon-string"></div>';
      btn.querySelector(".balloon-body").textContent = letter;
      sky.appendChild(btn);

      const x = 40 + Math.random() * Math.max(20, w - 80);
      const y = 40 + Math.random() * Math.max(40, h - 80);
      const b = {
        el: btn,
        letter: letter,
        x: x,
        y: y,
        vx: (Math.random() * 0.6 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
        vy: -(Math.random() * 0.35 + 0.15),
        alive: true,
        phase: Math.random() * Math.PI * 2
      };
      btn.style.left = b.x + "px";
      btn.style.top = b.y + "px";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onPop(b);
      });
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        onPop(b);
      }, { passive: false });
      balloons.push(b);
    });

    animate();
  }

  // Approximate collision radius (balloon body ~ half of visual size)
  const BALLOON_R = 34;

  function animate() {
    const rect = stage.getBoundingClientRect();
    const w = rect.width || 300;
    const h = (rect.height || 400) * 0.78;
    const t = performance.now() / 1000;
    const margin = BALLOON_R + 4;

    // Move each balloon
    balloons.forEach((b) => {
      if (!b.alive) return;
      b.phase += 0.02;
      b.x += b.vx + Math.sin(t + b.phase) * 0.25;
      b.y += b.vy + Math.cos(t * 0.8 + b.phase) * 0.15;

      // bounce edges
      if (b.x < margin) { b.x = margin; b.vx = Math.abs(b.vx); }
      if (b.x > w - margin) { b.x = w - margin; b.vx = -Math.abs(b.vx); }
      if (b.y < margin) { b.y = margin; b.vy = Math.abs(b.vy) * 0.4; }
      if (b.y > h) { b.y = h; b.vy = -Math.abs(b.vy); }
    });

    // Balloon–balloon collisions: separate and bounce onto different paths
    const alive = balloons.filter((b) => b.alive);
    const minDist = BALLOON_R * 2;
    for (let i = 0; i < alive.length; i++) {
      for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i];
        const b = alive[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < minDist) {
          // Push apart so they no longer overlap
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Elastic-ish bounce: exchange velocity along the collision normal
          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const vn = dvx * nx + dvy * ny;
          if (vn > 0) continue; // already separating
          // Impulse along normal
          const impulse = vn;
          a.vx -= impulse * nx;
          a.vy -= impulse * ny;
          b.vx += impulse * nx;
          b.vy += impulse * ny;

          // Slight random nudge so paths diverge more naturally
          const nudge = 0.12;
          a.vx += (Math.random() - 0.5) * nudge;
          a.vy += (Math.random() - 0.5) * nudge;
          b.vx += (Math.random() - 0.5) * nudge;
          b.vy += (Math.random() - 0.5) * nudge;

          // Cap speeds so they don't fly off
          const maxSpeed = 1.4;
          const clamp = (v) => Math.max(-maxSpeed, Math.min(maxSpeed, v));
          a.vx = clamp(a.vx); a.vy = clamp(a.vy);
          b.vx = clamp(b.vx); b.vy = clamp(b.vy);
        }
      }
    }

    // Apply positions to DOM
    balloons.forEach((b) => {
      if (!b.alive) return;
      b.el.style.left = b.x + "px";
      b.el.style.top = b.y + "px";
    });

    raf = requestAnimationFrame(animate);
  }

  function spawnPopBurst(x, y, color) {
    const burst = document.createElement("div");
    burst.className = "pop-burst";
    burst.style.left = x + "px";
    burst.style.top = y + "px";

    // Center flash
    const flash = document.createElement("span");
    flash.className = "pop-flash";
    burst.appendChild(flash);

    // Color palette around balloon color
    const palette = [color, "#ffffff", "#ffe08a", "#ff6b6b", "#4ecdc4", "#a78bfa", "#f472b6"];
    const count = 18 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const isSpark = Math.random() < 0.35;
      p.className = "pop-piece" + (isSpark ? " spark" : "");
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 36 + Math.random() * 70;
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      p.style.setProperty("--rot", (Math.random() * 240 - 120) + "deg");
      const size = isSpark ? (3 + Math.random() * 3) : (6 + Math.random() * 10);
      p.style.setProperty("--size", size + "px");
      const c = palette[Math.floor(Math.random() * palette.length)];
      p.style.background = c;
      p.style.setProperty("--glow", c);
      p.style.animationDelay = (Math.random() * 0.08) + "s";
      p.style.animationDuration = (0.55 + Math.random() * 0.35) + "s";
      burst.appendChild(p);
    }
    sky.appendChild(burst);
    setTimeout(() => burst.remove(), 900);
  }


  function parseSpokenLetter(transcript) {
    const raw = (transcript || "").toLowerCase().trim();
    if (!raw) return null;
    // Prefer whole-phrase match, then tokens
    const cleaned = raw.replace(/[.,!?;:'"]/g, " ").replace(/\s+/g, " ").trim();
    if (LETTER_ALIASES[cleaned]) return LETTER_ALIASES[cleaned];
    // single character
    if (cleaned.length === 1 && /[a-z]/i.test(cleaned)) return cleaned.toUpperCase();
    // try each word / last word
    const words = cleaned.split(" ");
    for (const w of words) {
      if (LETTER_ALIASES[w]) return LETTER_ALIASES[w];
      if (w.length === 1 && /[a-z]/i.test(w)) return w.toUpperCase();
    }
    // "letter A" / "the letter b"
    const m = cleaned.match(/(?:letter|say|pop)\s+([a-z])/i);
    if (m) return m[1].toUpperCase();
    return null;
  }

  function findBalloonByLetter(letter) {
    if (!letter) return null;
    // Prefer the expected next letter match if any; else first alive with that letter
    const need = deck[index] ? expectedLetter(deck[index].word.toUpperCase()) : null;
    let candidate = null;
    for (const b of balloons) {
      if (!b.alive) continue;
      if (b.letter !== letter) continue;
      if (need && b.letter === need) return b;
      if (!candidate) candidate = b;
    }
    return candidate;
  }

  function onVoiceResult(transcript) {
    if (!voiceMode || locked || playScreen.hidden) return;
    const letter = parseSpokenLetter(transcript);
    if (!letter) return;
    // Debounce same letter within 700ms
    const now = performance.now();
    if (letter === lastVoiceLetter && now - lastVoiceAt < 700) return;
    lastVoiceLetter = letter;
    lastVoiceAt = now;

    if (voiceStatusText) {
      voiceStatusText.textContent = "Heard: “" + letter + "”";
    }

    const b = findBalloonByLetter(letter);
    if (b) {
      onPop(b);
    } else {
      // No balloon with that letter — gentle feedback, no life loss
      showFeedback("info", "No “" + letter + "” balloon");
      setTimeout(() => {
        if (voiceMode && !locked) hideFeedback();
      }, 900);
    }
    // Restore listening hint shortly
    setTimeout(() => {
      if (voiceMode && voiceStatusText && !locked) {
        voiceStatusText.textContent = "Listening… say a letter";
      }
    }, 1000);
  }

  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      voiceSupported = false;
      return;
    }
    voiceSupported = true;
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      // Prefer final results; fall back to latest interim
      let best = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = (res[0] && res[0].transcript) || "";
        if (res.isFinal) {
          best = text;
          isFinal = true;
        } else if (!isFinal) {
          best = text;
        }
      }
      if (best) onVoiceResult(best);
    };

    recognition.onerror = (event) => {
      const err = event.error || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        stopVoiceMode();
        showFeedback("error", "Microphone blocked — allow mic access");
      } else if (err === "no-speech") {
        // ignore, will restart
      } else if (err !== "aborted") {
        console.warn("SpeechRecognition error:", err);
      }
    };

    recognition.onend = () => {
      // Auto-restart while voice mode is on and game is playable
      if (voiceMode && !playScreen.hidden && !locked) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };
  }

  function startVoiceMode() {
    if (!voiceSupported) {
      showFeedback("error", "Voice not supported in this browser");
      return;
    }
    if (!recognition) initRecognition();
    voiceMode = true;
    if (voiceBtn) {
      voiceBtn.classList.add("active");
      voiceBtn.textContent = "🎤 On";
    }
    if (voiceStatus) voiceStatus.hidden = false;
    if (voiceStatusText) voiceStatusText.textContent = "Listening… say a letter";
    try {
      recognition.start();
    } catch (e) {
      // already started
    }
  }

  function stopVoiceMode() {
    voiceMode = false;
    if (voiceBtn) {
      voiceBtn.classList.remove("active");
      voiceBtn.textContent = "🎤 Voice";
    }
    if (voiceStatus) voiceStatus.hidden = true;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  }

  function toggleVoiceMode() {
    if (voiceMode) stopVoiceMode();
    else startVoiceMode();
  }

    function expectedLetter(word) {
    return word.toUpperCase()[spelled.length] || null;
  }

  function onPop(b) {
    if (!b.alive || locked) return;
    const item = deck[index];
    const word = item.word.toUpperCase();
    const need = expectedLetter(word);
    if (!need) return;

    if (b.letter === need) {
      // correct — firework pop
      b.alive = false;
      const col = b.el.querySelector(".balloon-body")?.style.background || "#ef4444";
      spawnPopBurst(b.x, b.y, col);
      b.el.classList.add("popping");
      setTimeout(() => b.el && b.el.remove(), 420);
      spelled.push(b.letter);
      renderSlots(word);
      hideFeedback();

      if (spelled.length === word.length) {
        setTimeout(() => onWordComplete(true), 500);
      } else {
        const stillNeeded = word.slice(spelled.length);
        if (stillNeeded.indexOf(b.letter) !== -1) {
          setTimeout(() => spawnOneBalloon(b.letter), 350);
        }
      }
    } else {
      // wrong
      b.el.classList.remove("shake");
      void b.el.offsetWidth;
      b.el.classList.add("shake");
      lives -= 1;
      renderLives();
      showFeedback("error", "Oops! Need “" + need + "”");

      if (lives <= 0) {
        locked = true;
        showFeedback("info", "Out of lives — press Reveal or Retry");
        revealBtn.hidden = false;
      }
    }
  }

  function onWordComplete(success) {
    locked = true;
    stopAnim();
    balloons.forEach((b) => {
      if (b.alive) {
        b.alive = false;
        b.el.style.opacity = "0.35";
        b.el.style.pointerEvents = "none";
      }
    });

    if (success) {
      showFeedback("success", "✓ " + deck[index].word.toUpperCase());
      playAudio(deck[index].id);
      wordsTotalDone += 1;
      if (!usedRevealThisWord) wordsClean += 1;
      // reset lives for next word
      lives = MAX_LIVES;
      renderLives();
      setTimeout(nextWord, 1100);
    }
  }

  function revealAnswer() {
    const item = deck[index];
    const word = item.word.toUpperCase();
    locked = true;
    usedRevealThisWord = true;
    stopAnim();
    spelled = word.split("");
    renderSlots(word);
    // mark slots as reveal
    slots.querySelectorAll(".slot").forEach((s) => {
      s.classList.add("reveal");
      s.classList.remove("filled");
    });
    showFeedback("info", "Answer: " + word);
    playAudio(item.id);
    revealBtn.hidden = true;
    // after reveal, allow continue
    setTimeout(nextWord, 1600);
  }

  function nextWord() {
    index++;
    if (index >= deck.length) {
      finish();
      return;
    }
    startWord();
  }

  function startWord() {
    locked = false;
    spelled = [];
    lives = MAX_LIVES;
    usedRevealThisWord = false;
    renderLives();
    hideFeedback();
    revealBtn.hidden = true;

    const item = deck[index];
    progressText.textContent = (index + 1) + " / " + deck.length;
    remainingText.textContent = String(deck.length - index);
    colorImg.src = ASSET_IMG + item.id + ".png";
    colorImg.alt = item.word;
    renderSlots(item.word);
    spawnBalloons(item.word);
    playAudio(item.id);

    // Resume listening after brief audio if voice mode is on
    if (voiceMode && recognition) {
      setTimeout(() => {
        if (voiceMode && !locked) {
          try { recognition.start(); } catch (e) {}
          if (voiceStatusText) voiceStatusText.textContent = "Listening… say a letter";
        }
      }, 400);
    }
  }

  function finish() {
    stopVoiceMode();
    clearBalloons();
    const total = deck.length;
    // Accuracy = clean word completions / total words (Reveal hurts stars)
    const accuracy = total > 0
      ? Math.round((wordsClean / total) * 100)
      : 100;
    $("endTitle").textContent = "Well done!";
    $("endMsg").textContent = "You spelled all " + total + " colors" +
      (wordsClean < total ? " (" + wordsClean + " without Reveal)." : ".");
    $("endEmoji").textContent = accuracy >= 80 ? "🎉" : (accuracy >= 50 ? "👍" : "💪");
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      } else {
        console.warn("LAStars not loaded — stars not saved. Check path to la-stars.js");
      }
    } catch (e) {
      console.warn("LAStars error:", e);
    }
    showScreen("end");
  }

  function startGame() {
    deck = shuffle(COLORS);
    index = 0;
    lives = MAX_LIVES;
    wordsClean = 0;
    wordsTotalDone = 0;
    usedRevealThisWord = false;
    showScreen("play");
    // wait a tick for layout
    requestAnimationFrame(() => startWord());
  }

  function retryWord() {
    startWord();
  }

  // Aim cursor (desktop)
  if (isDesktop) {
    stage.addEventListener("mouseenter", () => { aim.hidden = false; });
    stage.addEventListener("mouseleave", () => { aim.hidden = true; });
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      aim.style.left = (e.clientX - r.left) + "px";
      aim.style.top = (e.clientY - r.top) + "px";
    });
  }

  initRecognition();
  if (voiceBtn) {
    if (!voiceSupported) {
      voiceBtn.disabled = true;
      voiceBtn.title = "Voice not supported in this browser";
      voiceBtn.style.opacity = "0.45";
    }
    voiceBtn.addEventListener("click", toggleVoiceMode);
  }

  startBtn.addEventListener("click", startGame);
  hearBtn.addEventListener("click", () => {
    if (deck[index]) playAudio(deck[index].id);
  });
  retryBtn.addEventListener("click", retryWord);
  revealBtn.addEventListener("click", revealAnswer);
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇 Unmute" : "🔊 Mute";
  });
  againBtn.addEventListener("click", () => {
    stopVoiceMode();
    showScreen("start");
  });

  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }

  window.addEventListener("resize", () => {
    // keep balloons in bounds roughly
    if (!playScreen.hidden && deck[index] && !locked) {
      // no full respawn on resize — positions clamp in animate
    }
  });
})();
