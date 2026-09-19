/* Two Sounds Match · AEF Starter Unit 4B
   /ɑː/ car · /ɔː/ horse — swipe or stick */
(function () {
  const GAME_ID = "starter-4b-two-sounds-match";

  // Example cues (start screen buttons only — pure sounds)
  const EXAMPLES = {
    "ɑː": { word: "car", audio: "audio/R.mp3", label: "ar" },
    "ɔː": { word: "horse", audio: "audio/or.mp3", label: "or" },
  };

  const WORDS = [
    // /ɑː/ (car) — ar
    { word: "large", sound: "ɑː", audio: "audio/large.mp3" },
    { word: "park", sound: "ɑː", audio: "audio/park.mp3" },
    { word: "are", sound: "ɑː", audio: "audio/are.mp3" },
    { word: "tomorrow", sound: "ɑː", audio: "audio/tomorrow.mp3" },
    // /ɔː/ (horse) — or
    { word: "short", sound: "ɔː", audio: "audio/short.mp3" },
    { word: "sport", sound: "ɔː", audio: "audio/sport.mp3" },
    { word: "orange", sound: "ɔː", audio: "audio/orange.mp3" },
    { word: "door", sound: "ɔː", audio: "audio/door.mp3" },
  ];

  const DIR_TO_SOUND = { left: "ɑː", right: "ɔː" };
  const IPA = { "ɑː": "/ɑː/", "ɔː": "/ɔː/" };
  const SOUND_LABEL = { "ɑː": "ar · car", "ɔː": "or · horse" };

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let queue = [];
  let index = 0;
  let score = 0;
  let currentAudio = null;
  let stickActive = false;
  let stickDx = 0;
  let stickDy = 0;
  const STICK_MAX = 42;
  const SEND_THRESHOLD = 28;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playWordAudio() {
    const item = queue[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    a.play().catch(() => {});
  }

  function playExample(sound) {
    const ex = EXAMPLES[sound];
    if (!ex) return;
    stopAudio();
    const a = new Audio(ex.audio);
    currentAudio = a;
    a.play().catch(() => {});
  }

  function calcStars() {
    const total = WORDS.length;
    if (score >= total) return 3;
    if (score >= Math.ceil(total * 0.7)) return 2;
    if (score >= Math.ceil(total * 0.4)) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    } else if (typeof window.laStars === "function") {
      try { window.laStars(GAME_ID, score, WORDS.length); } catch (_) {}
    }
    return stars;
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    queue = shuffle(WORDS);
    index = 0;
    score = 0;
    phase = "play";
    render();
    setTimeout(playWordAudio, 400);
  }

  function currentWord() {
    return queue[index] || null;
  }

  function highlightTargets(dir) {
    document.querySelectorAll(".ts-pad").forEach((el) => el.classList.remove("active"));
    if (dir === "left") document.getElementById("pad-left")?.classList.add("active");
    if (dir === "right") document.getElementById("pad-right")?.classList.add("active");
  }

  function clearHighlights() {
    document.querySelectorAll(".ts-pad").forEach((el) => el.classList.remove("active"));
  }

  function attempt(dir) {
    const item = currentWord();
    if (!item || phase !== "play") return;

    const chosen = DIR_TO_SOUND[dir];
    const ok = chosen === item.sound;
    const card = document.getElementById("ts-card");
    const feedback = document.getElementById("ts-feedback");

    if (ok) {
      score++;
      if (card) card.classList.add("fly-" + dir, "is-correct");
      if (feedback) {
        feedback.textContent = "✓ " + IPA[item.sound] + "  " + SOUND_LABEL[item.sound];
        feedback.className = "ts-feedback ok";
      }
      const pad = document.getElementById(dir === "left" ? "pad-left" : "pad-right");
      if (pad) {
        pad.classList.add("hit");
        setTimeout(() => pad.classList.remove("hit"), 450);
      }
      setTimeout(() => {
        index++;
        if (index >= queue.length) {
          phase = "done";
          render();
        } else {
          renderPlay();
          setTimeout(playWordAudio, 280);
        }
      }, 520);
    } else {
      if (card) card.classList.add("shake");
      if (feedback) {
        feedback.textContent = "Try again → " + IPA[item.sound];
        feedback.className = "ts-feedback bad";
      }
      setTimeout(() => {
        if (card) {
          card.classList.remove("shake");
          card.style.transform = "";
        }
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "ts-feedback";
        }
        resetStick();
      }, 650);
    }
  }

  function resetStick() {
    stickDx = 0;
    stickDy = 0;
    const knob = document.getElementById("ts-knob");
    if (knob) knob.style.transform = "translate(-50%, -50%)";
    clearHighlights();
  }

  function directionFromStick() {
    const ax = Math.abs(stickDx);
    if (ax > SEND_THRESHOLD) {
      return stickDx < 0 ? "left" : "right";
    }
    return null;
  }

  function bindCardSwipe() {
    const card = document.getElementById("ts-card");
    if (!card) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    const THRESHOLD = 70;

    function onStart(e) {
      if (phase !== "play") return;
      if (e.target && e.target.closest && e.target.closest(".ts-replay")) return;
      dragging = true;
      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      dx = 0;
      dy = 0;
      card.classList.add("dragging");
      card.style.transition = "none";
    }

    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      dx = p.clientX - startX;
      dy = p.clientY - startY;
      const rot = dx * 0.06;
      card.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)";
      document.querySelectorAll(".ts-pad").forEach((t) => t.classList.remove("active"));
      if (dx < -30) document.getElementById("pad-left")?.classList.add("active");
      else if (dx > 30) document.getElementById("pad-right")?.classList.add("active");
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("dragging");
      card.style.transition = "";
      document.querySelectorAll(".ts-pad").forEach((t) => t.classList.remove("active"));

      let dir = null;
      if (dx < -THRESHOLD) dir = "left";
      else if (dx > THRESHOLD) dir = "right";

      if (dir) attempt(dir);
      else card.style.transform = "";
    }

    card.addEventListener("pointerdown", onStart);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    card.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  }

  function bindStick() {
    const base = document.getElementById("ts-stick");
    const knob = document.getElementById("ts-knob");
    if (!base || !knob) return;

    function pos(e) {
      const p = e.touches ? e.touches[0] : e;
      const r = base.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      let x = p.clientX - cx;
      let y = p.clientY - cy;
      const dist = Math.sqrt(x * x + y * y);
      if (dist > STICK_MAX) {
        x = (x / dist) * STICK_MAX;
        y = (y / dist) * STICK_MAX;
      }
      return { x, y };
    }

    function onStart(e) {
      e.preventDefault();
      stickActive = true;
      base.classList.add("active");
    }

    function onMove(e) {
      if (!stickActive) return;
      e.preventDefault();
      const { x, y } = pos(e);
      stickDx = x;
      stickDy = y;
      knob.style.transform = "translate(calc(-50% + " + x + "px), calc(-50% + " + y + "px))";

      const card = document.getElementById("ts-card");
      if (card) {
        const rot = x * 0.08;
        card.style.transform = "translate(" + x * 0.6 + "px," + y * 0.3 + "px) rotate(" + rot + "deg)";
      }

      const dir = x < -12 ? "left" : x > 12 ? "right" : null;
      highlightTargets(dir);
    }

    function onEnd() {
      if (!stickActive) return;
      stickActive = false;
      base.classList.remove("active");
      const dir = directionFromStick();
      const card = document.getElementById("ts-card");
      if (dir) {
        attempt(dir);
      } else {
        if (card) card.style.transform = "";
        resetStick();
      }
    }

    base.addEventListener("pointerdown", onStart);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    base.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }

  function renderMenu() {
    app.innerHTML = `
      <header class="ts-topbar">
        <a class="ts-back" href="../" aria-label="Back">←</a>
        <span class="ts-title">Two Sounds Match</span>
        <span class="ts-badge">4B</span>
      </header>
      <section class="ts-start">
        <div class="ts-hero" aria-hidden="true">🔊</div>
        <h1>Two Sounds Match</h1>
        <p class="ts-desc">Swipe or drag each word to the matching sound.</p>
        <div class="ts-howto ts-howto-two">
          <button type="button" class="ts-example" data-sound="ɑː">
            <span class="ts-arrow">←</span>
            <span class="ts-ipa">/ɑː/</span>
            <span class="ts-ex-word">car</span>
            <span class="ts-ex-hint">ar</span>
          </button>
          <button type="button" class="ts-example" data-sound="ɔː">
            <span class="ts-arrow">→</span>
            <span class="ts-ipa">/ɔː/</span>
            <span class="ts-ex-word">horse</span>
            <span class="ts-ex-hint">or</span>
          </button>
        </div>
        <button type="button" class="ts-btn" id="ts-start">Start</button>
      </section>`;
    document.getElementById("ts-start").onclick = startGame;
    document.querySelectorAll(".ts-example").forEach((btn) => {
      btn.onclick = () => playExample(btn.dataset.sound);
    });
  }

  function renderPlay() {
    const item = currentWord();
    if (!item) return;

    app.innerHTML = `
      <header class="ts-topbar">
        <a class="ts-back" href="../" aria-label="Back">←</a>
        <span class="ts-title">Two Sounds Match</span>
        <span class="ts-progress">${index + 1}/${queue.length} · ${score}✓</span>
      </header>

      <div class="ts-stage">
        <div class="ts-pads-mid ts-pads-two">
          <button type="button" class="ts-pad ts-pad-left" id="pad-left" data-dir="left">
            <span class="ts-pad-arrow">←</span>
            <span class="ts-pad-ipa">/ɑː/</span>
            <span class="ts-pad-label">ar · car</span>
          </button>
          <button type="button" class="ts-pad ts-pad-right" id="pad-right" data-dir="right">
            <span class="ts-pad-arrow">→</span>
            <span class="ts-pad-ipa">/ɔː/</span>
            <span class="ts-pad-label">or · horse</span>
          </button>
        </div>

        <div class="ts-card-zone">
          <div class="ts-card" id="ts-card">
            <button type="button" class="ts-replay" id="ts-replay" aria-label="Replay">🔊</button>
            <span class="ts-word">${item.word}</span>
          </div>
        </div>

        <p class="ts-feedback" id="ts-feedback"></p>

        <div class="ts-stick-wrap">
          <div class="ts-stick ts-stick-two" id="ts-stick">
            <span class="ts-stick-label ts-stick-left">/ɑː/</span>
            <span class="ts-stick-label ts-stick-right">/ɔː/</span>
            <div class="ts-knob" id="ts-knob"></div>
          </div>
          <p class="ts-stick-hint">DRAG THE STICK OR SWIPE THE CARD</p>
        </div>
      </div>`;

    document.getElementById("ts-replay").onclick = (e) => {
      e.stopPropagation();
      playWordAudio();
    };
    document.querySelectorAll(".ts-pad").forEach((btn) => {
      btn.onclick = () => attempt(btn.dataset.dir);
    });
    bindStick();
    bindCardSwipe();
  }

  function renderDone() {
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: WORDS.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }
    const stars = saveStars();
    const starStr = "★".repeat(stars) + "☆".repeat(3 - stars);
    app.innerHTML = `
      <header class="ts-topbar">
        <a class="ts-back" href="../" aria-label="Back">←</a>
        <span class="ts-title">Two Sounds Match</span>
        <span class="ts-badge">4B</span>
      </header>
      <section class="ts-done">
        <div class="ts-done-emoji">${stars >= 3 ? "🎉" : stars >= 2 ? "👍" : "💪"}</div>
        <h2>${stars >= 3 ? "Perfect!" : stars >= 2 ? "Great job!" : "Keep practicing!"}</h2>
        <p class="ts-done-score">${score} / ${WORDS.length} correct</p>
        <p class="ts-done-stars">${starStr}</p>
        <div class="ts-done-actions">
          <button type="button" class="ts-btn" id="ts-again">Play again</button>
          <a class="ts-btn ts-btn-ghost" href="../">Unit 4B</a>
        </div>
      </section>`;
    document.getElementById("ts-again").onclick = startGame;
  }

  function render() {
    if (phase === "menu") renderMenu();
    else if (phase === "play") renderPlay();
    else if (phase === "done") renderDone();
  }

  // Boot
  render();
})();
