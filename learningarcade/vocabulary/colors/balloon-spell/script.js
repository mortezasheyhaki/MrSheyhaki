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
    const needed = word.toUpperCase().split("");
    const pool = needed.slice();
    // Add distractors: about 40% extra, min 2 max 5
    const extraCount = Math.min(5, Math.max(2, Math.ceil(word.length * 0.5)));
    let guard = 0;
    while (pool.length < needed.length + extraCount && guard < 40) {
      guard++;
      const ch = EXTRA_LETTERS[Math.floor(Math.random() * EXTRA_LETTERS.length)];
      // avoid flooding with same letter beyond needed+1
      const countInPool = pool.filter((c) => c === ch).length;
      const countNeeded = needed.filter((c) => c === ch).length;
      if (countInPool <= countNeeded) pool.push(ch);
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
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("span");
      p.className = "pop-piece";
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 28 + Math.random() * 36;
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      p.style.background = color;
      p.style.animationDelay = (Math.random() * 0.05) + "s";
      burst.appendChild(p);
    }
    sky.appendChild(burst);
    setTimeout(() => burst.remove(), 500);
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
      // correct — realistic pop
      b.alive = false;
      spawnPopBurst(b.x, b.y, b.el.querySelector(".balloon-body")?.style.background || "#ef4444");
      b.el.classList.add("popping");
      setTimeout(() => b.el.remove(), 480);
      spelled.push(b.letter);
      renderSlots(word);
      hideFeedback();

      if (spelled.length === word.length) {
        onWordComplete(true);
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
  }

  function finish() {
    clearBalloons();
    const total = deck.length;
    $("endTitle").textContent = "Well done!";
    $("endMsg").textContent = "You spelled all " + total + " colors.";
    $("endEmoji").textContent = "🎉";
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, 100);
      }
    } catch (e) {}
    showScreen("end");
  }

  function startGame() {
    deck = shuffle(COLORS);
    index = 0;
    lives = MAX_LIVES;
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
