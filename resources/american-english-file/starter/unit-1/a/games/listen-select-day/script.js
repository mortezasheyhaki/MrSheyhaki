/* Listen & select the day of the week */
(function () {
  const DAYS = [
    { id: "monday", label: "Monday", emoji: "📅", file: "audio/Monday.mp3" },
    { id: "tuesday", label: "Tuesday", emoji: "📘", file: "audio/Tuesday.mp3" },
    { id: "wednesday", label: "Wednesday", emoji: "📗", file: "audio/Wednesday.mp3" },
    { id: "thursday", label: "Thursday", emoji: "📙", file: "audio/Thursday.mp3" },
    { id: "friday", label: "Friday", emoji: "🎉", file: "audio/Friday.mp3" },
    { id: "saturday", label: "Saturday", emoji: "🎮", file: "audio/Saturday.mp3" },
    { id: "sunday", label: "Sunday", emoji: "☀️", file: "audio/Sunday.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | play | result
  let target = null;
  let score = 0;
  let round = 0;
  const TOTAL = 7;
  let used = []; // days already played as audio targets
  let muted = []; // day buttons that stay muted/gray after answered
  let audio = null;
  let audioToken = 0;
  let playing = false;
  let locked = false;
  let nextTimer = null;

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
      const fb = document.getElementById("ld-fb");
      if (fb) {
        fb.textContent = "Audio could not load.";
        fb.className = "ld-fb bad";
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
        const fb = document.getElementById("ld-fb");
        if (fb) {
          fb.textContent = "Tap Play (browser may block autoplay).";
          fb.className = "ld-fb bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function setPlayUI(on) {
    const btn = document.getElementById("ld-play");
    const player = document.getElementById("ld-player");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML =
        '<span class="ld-play-ico" aria-hidden="true">⏸</span><span class="ld-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML =
        '<span class="ld-play-ico" aria-hidden="true">▶</span><span class="ld-play-label">Play audio</span>';
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
    }, 280);
  }

  function burstAt(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const root = document.createElement("div");
    root.className = "ld-burst";
    root.style.left = rect.left + rect.width / 2 + "px";
    root.style.top = rect.top + rect.height / 2 + "px";
    const colors = ["#22c55e", "#a3e635", "#fbbf24", "#34d399", "#4ade80", "#86efac"];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      const angle = (i / 12) * Math.PI * 2;
      const dist = 36 + Math.random() * 28;
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      p.style.background = colors[i % colors.length];
      root.appendChild(p);
    }
    document.body.appendChild(root);
    setTimeout(() => root.remove(), 700);
  }

  function choose(id) {
    if (locked || mode !== "play") return;
    // Already-muted days can't be picked
    if (muted.includes(id)) return;

    locked = true;
    stopAudio();

    const correct = id === target.id;
    if (correct) score += 1;

    // Mute the button they answered with (stays muted for the rest of the game)
    if (!muted.includes(id)) muted.push(id);
    // Also mute the correct day if they got it wrong (that audio won't repeat)
    if (!correct && !muted.includes(target.id)) muted.push(target.id);

    let correctEl = null;
    const newlyMuted = [id];
    if (!correct) newlyMuted.push(target.id);

    document.querySelectorAll(".ld-day").forEach((el) => {
      const dayId = el.getAttribute("data-id");
      el.classList.remove("selected", "just-muted");

      if (dayId === id) el.classList.add("selected");
      if (dayId === target.id) {
        el.classList.add("correct");
        correctEl = el;
      }
      if (dayId === id && !correct) el.classList.add("wrong");
      if (dayId === id && correct) el.classList.add("picked-ok");

      if (muted.includes(dayId)) {
        el.classList.add("muted", "disabled");
        if (newlyMuted.includes(dayId)) el.classList.add("just-muted");
      } else {
        el.classList.add("disabled"); // lock all until next round
      }
    });

    const fb = document.getElementById("ld-fb");
    if (fb) {
      if (correct) {
        fb.innerHTML =
          '<span class="ld-fb-ico">✓</span> Correct! <strong>' + target.label + "</strong>";
        fb.className = "ld-fb ok";
        burstAt(correctEl);
      } else {
        fb.innerHTML =
          '<span class="ld-fb-ico">✗</span> It was <strong>' + target.label + "</strong>";
        fb.className = "ld-fb bad";
      }
    }

    clearNextTimer();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "result";
        render();
      } else {
        startRound();
      }
    }, correct ? 900 : 1000);
  }

  function render() {
    if (mode === "start") {
      stopAudio();
      clearNextTimer();
      app.innerHTML = `
        <header class="ld-topbar">
          <a class="ld-back" href="../" aria-label="Back">←</a>
          <span class="ld-title">Days of the week</span>
          <span class="ld-badge">🎧 Listen</span>
        </header>
        <section class="ld-start">
          <div class="ld-hero">
            <div class="ld-blob" aria-hidden="true"></div>
            <div class="ld-icon-wrap"><span class="ld-icon">📅</span></div>
          </div>
          <p class="ld-eyebrow">LISTENING</p>
          <h1>Select the day you hear</h1>
          <p class="ld-sub">Tap <strong>Play</strong>, listen, then choose the correct day.</p>
          <p class="ld-hint">${TOTAL} rounds · all 7 days</p>
          <button type="button" class="ld-btn" id="ld-go">Start</button>
        </section>`;
      document.getElementById("ld-go").onclick = () => {
        score = 0;
        round = 0;
        used = [];
        muted = [];
        startRound();
      };
      return;
    }

    if (mode === "result") {
      stopAudio();
      clearNextTimer();
      const stars = score >= 6 ? 3 : score >= 4 ? 2 : score >= 2 ? 1 : 0;
      app.innerHTML = `
        <header class="ld-topbar">
          <a class="ld-back" href="../" aria-label="Back">←</a>
          <span class="ld-title">Results</span>
          <span class="ld-badge">${score}/${TOTAL}</span>
        </header>
        <section class="ld-done">
          <div class="ld-done-inner">
            <div class="ld-trophy" aria-hidden="true">${stars ? "🏆" : "💪"}</div>
            <div class="ld-stars" aria-hidden="true">
              <span class="ld-star">${stars >= 1 ? "⭐" : "☆"}</span>
              <span class="ld-star">${stars >= 2 ? "⭐" : "☆"}</span>
              <span class="ld-star">${stars >= 3 ? "⭐" : "☆"}</span>
            </div>
            <h1>${score === TOTAL ? "Perfect!" : score >= 5 ? "Great job!" : "Keep practicing!"}</h1>
            <p>You got <strong>${score}</strong> of ${TOTAL} days right.</p>
            <button type="button" class="ld-btn" id="ld-again">Play again</button>
            <a class="ld-btn secondary" href="../">Back to games</a>
          </div>
        </section>`;
      document.getElementById("ld-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    // play mode — muted days stay gray
    const cards = DAYS.map((d) => {
      const isMuted = muted.includes(d.id);
      const cls = "ld-day" + (isMuted ? " muted disabled" : "");
      return `
      <button type="button" class="${cls}" data-id="${d.id}" aria-label="${d.label}" ${
        isMuted ? "disabled" : ""
      }>
        <span class="ld-day-emoji" aria-hidden="true">${d.emoji}</span>
        <span class="ld-day-label">${d.label}</span>
      </button>`;
    }).join("");

    app.innerHTML = `
      <header class="ld-topbar">
        <a class="ld-back" href="../" aria-label="Back">←</a>
        <span class="ld-title">Select the day</span>
        <span class="ld-badge">${round} / ${TOTAL}</span>
      </header>

      <div class="ld-player" id="ld-player">
        <button type="button" class="ld-play-btn" id="ld-play" aria-label="Play audio">
          <span class="ld-play-ico" aria-hidden="true">▶</span>
          <span class="ld-play-label">Play audio</span>
        </button>
        <div class="ld-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      <p class="ld-instruction">Listen, then tap the day you hear.</p>
      <div class="ld-days" id="ld-days">${cards}</div>
      <div class="ld-fb" id="ld-fb" aria-live="polite"></div>
    `;

    document.getElementById("ld-play").onclick = togglePlay;
    document.querySelectorAll(".ld-day:not(.muted)").forEach((btn) => {
      const press = () => {
        if (locked) return;
        document.querySelectorAll(".ld-day").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      btn.addEventListener("pointerdown", press);
      btn.onclick = () => choose(btn.getAttribute("data-id"));
    });
  }

  render();
})();
