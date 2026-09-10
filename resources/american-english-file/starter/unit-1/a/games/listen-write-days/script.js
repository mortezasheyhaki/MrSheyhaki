/* Listen & Write – days of the week */
(function () {
  const DAYS = [
    { id: "monday", label: "Monday", answers: ["monday"], file: "audio/Monday.mp3" },
    { id: "tuesday", label: "Tuesday", answers: ["tuesday"], file: "audio/Tuesday.mp3" },
    { id: "wednesday", label: "Wednesday", answers: ["wednesday"], file: "audio/Wednesday.mp3" },
    { id: "thursday", label: "Thursday", answers: ["thursday"], file: "audio/Thursday.mp3" },
    { id: "friday", label: "Friday", answers: ["friday"], file: "audio/Friday.mp3" },
    { id: "saturday", label: "Saturday", answers: ["saturday"], file: "audio/Saturday.mp3" },
    { id: "sunday", label: "Sunday", answers: ["sunday"], file: "audio/Sunday.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start";
  let target = null;
  let score = 0;
  let round = 0;
  const TOTAL = 7;
  let used = [];
  let audio = null;
  let audioToken = 0;
  let playing = false;
  let locked = false;
  let nextTimer = null;

  function strip(s) {
    return String(s || "").trim().replace(/\s+/g, "");
  }

  function isCapitalizedDay(s) {
    const t = strip(s);
    if (!t) return false;
    // First letter must be A–Z uppercase; rest letters only (no forced lower)
    return /^[A-Z][a-zA-Z]*$/.test(t);
  }

  function matchesDay(s, day) {
    const t = strip(s);
    // Exact label match (e.g. "Monday") OR correct spelling with required capital
    if (t === day.label) return true;
    if (!isCapitalizedDay(t)) return false;
    return t.toLowerCase() === day.id;
  }

  function pickDay() {
    const pool = DAYS.filter((d) => !used.includes(d.id));
    if (!pool.length) {
      used = [];
      return DAYS[Math.floor(Math.random() * DAYS.length)];
    }
    const d = pool[Math.floor(Math.random() * pool.length)];
    used.push(d.id);
    return d;
  }

  function clearNextTimer() {
    if (nextTimer) {
      clearTimeout(nextTimer);
      nextTimer = null;
    }
  }

  function stopAudio() {
    audioToken += 1;
    playing = false;
    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.muted = true;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      } catch (e) {}
      audio = null;
    }
    setPlayUI(false);
  }

  function playTarget() {
    if (!target) return;
    stopAudio();
    const token = audioToken;
    const a = new Audio(target.file);
    audio = a;
    a.muted = false;
    a.volume = 1;
    a.preload = "auto";
    a.addEventListener("ended", () => {
      if (token !== audioToken) return;
      playing = false;
      setPlayUI(false);
    });
    a.addEventListener("error", () => {
      if (token !== audioToken) return;
      playing = false;
      setPlayUI(false);
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.textContent = "Audio could not load.";
        fb.className = "lw-fb bad";
      }
    });
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        if (token !== audioToken || audio !== a) {
          try {
            a.muted = true;
            a.pause();
          } catch (e) {}
          return;
        }
        playing = true;
        setPlayUI(true);
      }).catch(() => {
        if (token !== audioToken) return;
        const fb = document.getElementById("lw-fb");
        if (fb) {
          fb.textContent = "Tap Play (browser may block autoplay).";
          fb.className = "lw-fb bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function setPlayUI(on) {
    const btn = document.getElementById("lw-play");
    const player = document.getElementById("lw-player");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML =
        '<span class="lw-play-ico" aria-hidden="true">⏸</span><span class="lw-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML =
        '<span class="lw-play-ico" aria-hidden="true">▶</span><span class="lw-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
    }
  }

  function togglePlay() {
    if (locked) return;
    if (playing && audio) {
      stopAudio();
      return;
    }
    playTarget();
  }

  function startRound() {
    clearNextTimer();
    locked = false;
    target = pickDay();
    round += 1;
    mode = "play";
    render();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (mode === "play" && !locked) playTarget();
      const input = document.getElementById("lw-input");
      if (input) input.focus();
    }, 280);
  }

  function checkAnswer() {
    if (locked || mode !== "play") return;
    const input = document.getElementById("lw-input");
    if (!input) return;
    const raw = input.value;
    const val = strip(raw);

    if (!val) {
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML = "Type a day of the week.";
        fb.className = "lw-fb bad";
      }
      return;
    }

    // Must start with a capital letter
    if (!isCapitalizedDay(val)) {
      input.classList.remove("ok");
      input.classList.add("bad", "shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML =
          '<span class="lw-fb-ico">A</span> Start with a <strong>capital letter</strong> (e.g. Monday)';
        fb.className = "lw-fb bad";
      }
      input.focus();
      // Select all so they can retype easily
      try { input.select(); } catch (e) {}
      return; // try again — do not advance
    }

    const correct = matchesDay(val, target);

    if (!correct) {
      // Wrong day — let them try again (do not lock / do not advance)
      input.classList.remove("ok");
      input.classList.add("bad", "shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      const fb = document.getElementById("lw-fb");
      if (fb) {
        fb.innerHTML =
          '<span class="lw-fb-ico">✗</span> Try again — listen and write the day.';
        fb.className = "lw-fb bad";
      }
      input.focus();
      try { input.select(); } catch (e) {}
      return;
    }

    // Correct
    locked = true;
    stopAudio();
    score += 1;

    input.disabled = true;
    input.classList.remove("bad");
    input.classList.add("ok");
    input.value = target.label;

    const fb = document.getElementById("lw-fb");
    if (fb) {
      fb.innerHTML =
        '<span class="lw-fb-ico">✓</span> Correct! <strong>' + target.label + "</strong>";
      fb.className = "lw-fb ok";
    }

    const checkBtn = document.getElementById("lw-check");
    if (checkBtn) checkBtn.disabled = true;

    clearNextTimer();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "result";
        render();
      } else {
        startRound();
      }
    }, 900);
  }

  function render() {
    if (mode === "start") {
      stopAudio();
      clearNextTimer();
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Days of the week</span>
          <span class="lw-badge">✍️ Write</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero">
            <div class="lw-blob" aria-hidden="true"></div>
            <div class="lw-icon-wrap"><span class="lw-icon">✍️</span></div>
          </div>
          <p class="lw-eyebrow">LISTENING · SPELLING</p>
          <h1>Listen &amp; Write</h1>
          <p class="lw-sub">Listen to the day, then <strong>type</strong> its name with a capital letter.</p>
          <p class="lw-hint">${TOTAL} rounds · Monday–Sunday</p>
          <button type="button" class="lw-btn" id="lw-go">Start</button>
        </section>`;
      document.getElementById("lw-go").onclick = () => {
        score = 0;
        round = 0;
        used = [];
        startRound();
      };
      return;
    }

    if (mode === "result") {
      stopAudio();
      clearNextTimer();
      const stars = score >= 6 ? 3 : score >= 4 ? 2 : score >= 2 ? 1 : 0;
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Results</span>
          <span class="lw-badge">${score}/${TOTAL}</span>
        </header>
        <section class="lw-done">
          <div class="lw-done-inner">
            <div class="lw-trophy" aria-hidden="true">${stars ? "🏆" : "💪"}</div>
            <div class="lw-stars" aria-hidden="true">
              <span class="lw-star">${stars >= 1 ? "⭐" : "☆"}</span>
              <span class="lw-star">${stars >= 2 ? "⭐" : "☆"}</span>
              <span class="lw-star">${stars >= 3 ? "⭐" : "☆"}</span>
            </div>
            <h1>${score === TOTAL ? "Perfect!" : score >= 5 ? "Great job!" : "Keep practicing!"}</h1>
            <p>You wrote <strong>${score}</strong> of ${TOTAL} days correctly.</p>
            <button type="button" class="lw-btn" id="lw-again">Play again</button>
            <a class="lw-btn secondary" href="../">Back to games</a>
          </div>
        </section>`;
      document.getElementById("lw-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    // play
    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">Listen &amp; Write</span>
        <span class="lw-badge">${round} / ${TOTAL}</span>
      </header>

      <div class="lw-player" id="lw-player">
        <button type="button" class="lw-play-btn" id="lw-play" aria-label="Play audio">
          <span class="lw-play-ico" aria-hidden="true">▶</span>
          <span class="lw-play-label">Play audio</span>
        </button>
        <div class="lw-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      <p class="lw-instruction">Listen, then write the day (capital letter first).</p>

      <div class="lw-write-card">
        <label class="lw-label" for="lw-input">Day</label>
        <input
          type="text"
          id="lw-input"
          class="lw-input"
          autocomplete="off"
          autocapitalize="words"
          spellcheck="false"
          placeholder="Monday"
          maxlength="20"
        />
        <button type="button" class="lw-btn lw-check" id="lw-check">Check</button>
      </div>

      <div class="lw-fb" id="lw-fb" aria-live="polite"></div>
    `;

    document.getElementById("lw-play").onclick = togglePlay;
    document.getElementById("lw-check").onclick = checkAnswer;
    const input = document.getElementById("lw-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
  }

  render();
})();
