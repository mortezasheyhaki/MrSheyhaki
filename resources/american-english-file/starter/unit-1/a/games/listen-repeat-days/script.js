/* Listen & Repeat – days of the week (speech recognition) */
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

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasSpeech = typeof SpeechRecognition === "function";

  let mode = "start"; // start | play | result
  let target = null;
  let score = 0;
  let round = 0;
  const TOTAL = 7;
  let used = [];
  let audio = null;
  let audioToken = 0;
  let playing = false;
  let locked = false;
  let listening = false;
  let recognition = null;
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

  function stopListening() {
    listening = false;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (e) {}
      recognition = null;
    }
    setMicUI(false);
  }

  function playTarget() {
    if (!target || locked) return;
    stopAudio();
    stopListening();
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
      const fb = document.getElementById("lr-fb");
      if (fb) {
        fb.textContent = "Audio could not load.";
        fb.className = "lr-fb bad";
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
        const fb = document.getElementById("lr-fb");
        if (fb) {
          fb.textContent = "Tap Play (browser may block autoplay).";
          fb.className = "lr-fb bad";
        }
      });
    } else {
      playing = true;
      setPlayUI(true);
    }
  }

  function setPlayUI(on) {
    const btn = document.getElementById("lr-play");
    const player = document.getElementById("lr-player");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-playing");
      if (player) player.classList.add("is-playing");
      btn.innerHTML =
        '<span class="lr-play-ico" aria-hidden="true">⏸</span><span class="lr-play-label">Pause</span>';
      btn.setAttribute("aria-label", "Pause");
    } else {
      btn.classList.remove("is-playing");
      if (player) player.classList.remove("is-playing");
      btn.innerHTML =
        '<span class="lr-play-ico" aria-hidden="true">▶</span><span class="lr-play-label">Play audio</span>';
      btn.setAttribute("aria-label", "Play audio");
    }
  }

  function setMicUI(on) {
    const btn = document.getElementById("lr-mic");
    if (!btn) return;
    if (on) {
      btn.classList.add("is-listening");
      btn.innerHTML =
        '<span class="lr-mic-ico" aria-hidden="true">🎙️</span><span class="lr-mic-label">Listening…</span>';
      btn.setAttribute("aria-label", "Stop listening");
    } else {
      btn.classList.remove("is-listening");
      btn.innerHTML =
        '<span class="lr-mic-ico" aria-hidden="true">🎤</span><span class="lr-mic-label">Say the day</span>';
      btn.setAttribute("aria-label", "Say the day");
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

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ");
  }

  function matchesDay(transcript, day) {
    const t = normalize(transcript);
    if (!t) return false;
    // exact or contains the day name
    if (t === day.id || t === day.label.toLowerCase()) return true;
    if (day.answers.some((a) => t === a || t.includes(a))) return true;
    // common short forms / mishearings
    const map = {
      monday: ["mon", "mondy", "mondey"],
      tuesday: ["tues", "tuse", "tuesdy", "toosday"],
      wednesday: ["wed", "wensday", "wensdy", "wednesdy"],
      thursday: ["thur", "thurs", "thurday", "thursdy"],
      friday: ["fri", "fryday", "fridy"],
      saturday: ["sat", "satday", "saturdy"],
      sunday: ["sun", "sundy", "sonday"],
    };
    const alts = map[day.id] || [];
    return alts.some((a) => t === a || t.includes(a));
  }

  function startListening() {
    if (locked || !hasSpeech || !target) return;
    if (listening) {
      stopListening();
      return;
    }
    stopAudio();
    stopListening();

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      listening = true;
      setMicUI(true);
      const fb = document.getElementById("lr-fb");
      if (fb) {
        fb.textContent = "Listening… say the day";
        fb.className = "lr-fb";
      }
    };

    recognition.onresult = (event) => {
      const results = event.results;
      let best = "";
      let matched = false;
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results[i].length; j++) {
          const t = results[i][j].transcript || "";
          if (!best) best = t;
          if (matchesDay(t, target)) {
            matched = true;
            best = t;
            break;
          }
        }
        if (matched) break;
      }
      finishAnswer(matched, best);
    };

    recognition.onerror = (event) => {
      listening = false;
      setMicUI(false);
      const fb = document.getElementById("lr-fb");
      if (!fb) return;
      const err = event.error || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        fb.textContent = "Microphone permission denied. Allow mic access.";
        fb.className = "lr-fb bad";
      } else if (err === "no-speech") {
        fb.textContent = "No speech heard. Try again.";
        fb.className = "lr-fb bad";
      } else if (err === "aborted") {
        fb.textContent = "";
        fb.className = "lr-fb";
      } else {
        fb.textContent = "Could not hear you. Try again.";
        fb.className = "lr-fb bad";
      }
    };

    recognition.onend = () => {
      listening = false;
      setMicUI(false);
    };

    try {
      recognition.start();
    } catch (e) {
      listening = false;
      setMicUI(false);
      const fb = document.getElementById("lr-fb");
      if (fb) {
        fb.textContent = "Could not start microphone.";
        fb.className = "lr-fb bad";
      }
    }
  }

  function finishAnswer(correct, heard) {
    stopListening();
    if (locked || mode !== "play") return;
    locked = true;

    const fb = document.getElementById("lr-fb");
    const heardEl = document.getElementById("lr-heard");

    if (correct) {
      score += 1;
      if (fb) {
        fb.textContent = "Correct!";
        fb.className = "lr-fb good";
      }
      if (heardEl) {
        heardEl.textContent = heard ? `You said: “${heard.trim()}”` : "";
        heardEl.className = "lr-heard good";
      }
    } else {
      if (fb) {
        fb.textContent = `Not quite. It was ${target.label}.`;
        fb.className = "lr-fb bad";
      }
      if (heardEl) {
        heardEl.textContent = heard
          ? `You said: “${heard.trim()}”`
          : "Nothing recognized.";
        heardEl.className = "lr-heard bad";
      }
    }

    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (round >= TOTAL) {
        mode = "result";
        render();
      } else {
        startRound();
      }
    }, correct ? 1100 : 1600);
  }

  function startRound() {
    clearNextTimer();
    stopAudio();
    stopListening();
    locked = false;
    target = pickDay();
    round += 1;
    mode = "play";
    render();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      if (mode === "play" && !locked) playTarget();
    }, 320);
  }

  function render() {
    if (mode === "start") {
      app.innerHTML = `
        <header class="lr-topbar">
          <a class="lr-back" href="../" aria-label="Back">←</a>
          <span class="lr-title">Listen &amp; Repeat</span>
          <span class="lr-badge">1A</span>
        </header>
        <section class="lr-start">
          <div class="lr-hero">
            <div class="lr-blob" aria-hidden="true"></div>
            <div class="lr-icon-wrap" aria-hidden="true">🎤</div>
          </div>
          <h1>Listen &amp; Repeat</h1>
          <p class="lr-desc">Listen to a day of the week,<br>then say it out loud.</p>
          ${
            hasSpeech
              ? `<p class="lr-note">Uses your microphone · works best in Chrome or Edge</p>
                 <button type="button" class="lr-btn" id="lr-start">Start</button>`
              : `<p class="lr-note bad">Speech recognition is not supported in this browser.<br>Try Chrome or Edge on a phone or computer.</p>
                 <a class="lr-btn secondary" href="../">Back to games</a>`
          }
        </section>`;
      const startBtn = document.getElementById("lr-start");
      if (startBtn) {
        startBtn.onclick = () => {
          score = 0;
          round = 0;
          used = [];
          startRound();
        };
      }
      return;
    }

    if (mode === "result") {
      const stars = score === TOTAL ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;
      app.innerHTML = `
        <header class="lr-topbar">
          <a class="lr-back" href="../" aria-label="Back">←</a>
          <span class="lr-title">Listen &amp; Repeat</span>
          <span class="lr-badge">Done</span>
        </header>
        <section class="lr-done">
          <div class="lr-trophy" aria-hidden="true">${stars ? "🏆" : "💪"}</div>
          <div class="lr-stars" aria-hidden="true">
            <span class="lr-star">${stars >= 1 ? "⭐" : "☆"}</span>
            <span class="lr-star">${stars >= 2 ? "⭐" : "☆"}</span>
            <span class="lr-star">${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${score === TOTAL ? "Perfect!" : score >= 5 ? "Great job!" : "Keep practicing!"}</h1>
          <p>You said <strong>${score}</strong> of ${TOTAL} days correctly.</p>
          <button type="button" class="lr-btn" id="lr-again">Play again</button>
          <a class="lr-btn secondary" href="../">Back to games</a>
        </section>`;
      document.getElementById("lr-again").onclick = () => {
        mode = "start";
        render();
      };
      return;
    }

    // play
    app.innerHTML = `
      <header class="lr-topbar">
        <a class="lr-back" href="../" aria-label="Back">←</a>
        <span class="lr-title">Listen &amp; Repeat</span>
        <span class="lr-badge">${round} / ${TOTAL}</span>
      </header>

      <div class="lr-player" id="lr-player">
        <button type="button" class="lr-play-btn" id="lr-play" aria-label="Play audio">
          <span class="lr-play-ico" aria-hidden="true">▶</span>
          <span class="lr-play-label">Play audio</span>
        </button>
        <div class="lr-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>

      <p class="lr-instruction">Listen, then press the mic and say the day.</p>

      <button type="button" class="lr-mic-btn" id="lr-mic" aria-label="Say the day">
        <span class="lr-mic-ico" aria-hidden="true">🎤</span>
        <span class="lr-mic-label">Say the day</span>
      </button>

      <div class="lr-fb" id="lr-fb" aria-live="polite"></div>
      <div class="lr-heard" id="lr-heard" aria-live="polite"></div>
    `;

    document.getElementById("lr-play").onclick = togglePlay;
    document.getElementById("lr-mic").onclick = startListening;
  }

  render();
})();
