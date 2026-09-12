/* Listen Nationalities – Write + Repeat · AEF Starter Unit 2A */
(function () {
  const GAME_ID = "starter-2a-listen-nationalities";

  const ITEMS = [
    { id: "argentina", nationality: "Argentinian", audio: "audio/nat-argentina.mp3",
      answers: ["argentinian", "argentine"] },
    { id: "brazil", nationality: "Brazilian", audio: "audio/nat-brazil.mp3",
      answers: ["brazilian"] },
    { id: "canada", nationality: "Canadian", audio: "audio/nat-canada.mp3",
      answers: ["canadian"] },
    { id: "chile", nationality: "Chilean", audio: "audio/nat-chile.mp3",
      answers: ["chilean"] },
    { id: "china", nationality: "Chinese", audio: "audio/nat-china.mp3",
      answers: ["chinese"] },
    { id: "england", nationality: "English", audio: "audio/nat-england.mp3",
      answers: ["english"] },
    { id: "japan", nationality: "Japanese", audio: "audio/nat-japan.mp3",
      answers: ["japanese"] },
    { id: "korea", nationality: "Korean", audio: "audio/nat-korea.mp3",
      answers: ["korean"] },
    { id: "mexico", nationality: "Mexican", audio: "audio/nat-mexico.mp3",
      answers: ["mexican"] },
    { id: "peru", nationality: "Peruvian", audio: "audio/nat-peru.mp3",
      answers: ["peruvian"] },
    { id: "saudi-arabia", nationality: "Saudi", audio: "audio/nat-saudi-arabia.mp3",
      answers: ["saudi"] },
    { id: "spain", nationality: "Spanish", audio: "audio/nat-spain.mp3",
      answers: ["spanish"] },
    { id: "turkey", nationality: "Turkish", audio: "audio/nat-turkey.mp3",
      answers: ["turkish"] },
    { id: "vietnam", nationality: "Vietnamese", audio: "audio/nat-vietnam.mp3",
      answers: ["vietnamese"] },
    { id: "usa", nationality: "American", audio: "audio/nat-usa.mp3",
      answers: ["american"] },
  ];

  const PARTS = [
    { id: "write", title: "Listen & Write", tip: "Listen to the nationality, then type it." },
    { id: "repeat", title: "Listen & Repeat", tip: "Listen to the nationality, then say it out loud." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let partIndex = 0;
  let phase = "menu";
  let order = [];
  let index = 0;
  let correctCount = 0;
  let currentAudio = null;
  let answered = false;
  let lastCorrect = false;
  let lastSkipped = false;
  let lastUserInput = "";
  let recognition = null;
  let isListening = false;
  let speechSupported = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) speechSupported = true;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrectAnswer(userInput, item) {
    const n = normalize(userInput);
    if (!n) return false;
    return item.answers.some((a) => normalize(a) === n);
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".lw-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function stopRecognition() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (_) {}
    }
    isListening = false;
    const mic = app.querySelector(".lw-mic");
    if (mic) mic.classList.remove("listening");
  }

  function playItemAudio() {
    const item = order[index];
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startPart(pi) {
    partIndex = pi;
    order = shuffle(ITEMS);
    index = 0;
    correctCount = 0;
    answered = false;
    lastSkipped = false;
    lastUserInput = "";
    stopRecognition();
    phase = "play";
    render();
    setTimeout(playItemAudio, 350);
  }

  function checkWriteAnswer() {
    if (answered) return;
    const input = document.getElementById("lw-input");
    const val = (input ? input.value : "").trim();
    if (!val) return;
    lastUserInput = val;
    lastSkipped = false;
    const item = order[index];
    lastCorrect = isCorrectAnswer(lastUserInput, item);
    stopAudio();
    if (lastCorrect) {
      correctCount += 1;
      answered = true;
      phase = "feedback";
      render();
      setTimeout(() => nextItem(), 900);
    } else {
      // stay on same item – show try again
      answered = false;
      phase = "tryagain";
      render();
    }
  }

  function skipAnswer() {
    if (answered) return;
    lastUserInput = "";
    lastSkipped = true;
    lastCorrect = false;
    answered = true;
    phase = "feedback";
    stopAudio();
    stopRecognition();
    render();
    setTimeout(() => nextItem(), 900);
  }

  function startListening() {
    if (!speechSupported || answered || isListening) return;
    stopAudio();
    stopRecognition();

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    const mic = app.querySelector(".lw-mic");
    const status = document.getElementById("lw-speech-status");

    recognition.onstart = () => {
      isListening = true;
      if (mic) mic.classList.add("listening");
      if (status) status.textContent = "Listening… say the nationality";
    };

    recognition.onresult = (event) => {
      const results = event.results[0];
      let best = "";
      let matched = false;
      const item = order[index];

      for (let i = 0; i < results.length; i++) {
        const transcript = results[i].transcript;
        if (isCorrectAnswer(transcript, item)) {
          matched = true;
          best = transcript;
          break;
        }
        if (!best) best = transcript;
      }

      lastUserInput = best;
      lastSkipped = false;
      lastCorrect = matched;
      stopRecognition();
      if (lastCorrect) {
        correctCount += 1;
        answered = true;
        phase = "feedback";
        render();
        setTimeout(() => nextItem(), 900);
      } else {
        answered = false;
        phase = "tryagain";
        render();
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      if (mic) mic.classList.remove("listening");
      if (status) {
        if (event.error === "not-allowed") {
          status.textContent = "Microphone blocked. Allow mic access and try again.";
        } else if (event.error === "no-speech") {
          status.textContent = "No speech heard. Tap the mic and try again.";
        } else {
          status.textContent = "Couldn't hear that. Tap the mic and try again.";
        }
      }
    };

    recognition.onend = () => {
      isListening = false;
      if (mic) mic.classList.remove("listening");
    };

    try {
      recognition.start();
    } catch (e) {
      if (status) status.textContent = "Speech not available. Try Chrome or Edge.";
    }
  }

  function nextItem() {
    stopRecognition();
    if (index < order.length - 1) {
      index += 1;
      answered = false;
      lastSkipped = false;
      lastUserInput = "";
      phase = "play";
      render();
      setTimeout(playItemAudio, 300);
    } else {
      phase = "done";
      render();
    }
  }

  function calcStars() {
    const n = correctCount;
    if (n >= 14) return 3;
    if (n >= 10) return 2;
    if (n >= 6) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    // Save under main GAME_ID so the course card shows stars after Part 1 (Write)
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }


  function progressHTML() {
    const total = order.length;
    const current = index + 1;
    const pct = Math.round((index / total) * 100);
    const donePct = Math.round(((index + (answered || phase === "feedback" ? 1 : 0)) / total) * 100);
    // fill based on items completed (index advances after correct/skip)
    const fill = Math.round((index / total) * 100);
    return `
      <div class="lw-track" aria-hidden="true">
        <div class="lw-track-fill" style="width:${fill}%"></div>
      </div>
      <div class="lw-scoreline">
        <span class="lw-score">${correctCount} correct</span>
        <span class="lw-step">${current} / ${total}</span>
      </div>`;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">Listen Nationalities</span>
          <span class="lw-badge">2A</span>
        </header>
        <section class="lw-start">
          <div class="lw-hero" aria-hidden="true">🎧</div>
          <h1>Listen Nationalities</h1>
          <p class="lw-desc">Two parts · 15 nationalities each</p>
          <div class="lw-mode-list">
            ${PARTS.map((p, i) => `
              <button type="button" class="lw-mode-card" data-part="${i}">
                <span class="lw-mode-num">${i + 1}</span>
                <div>
                  <strong>${p.title}</strong>
                  <p>${p.tip}</p>
                </div>
              </button>`).join("")}
          </div>
          ${!speechSupported ? `<p class="lw-speech-note">Voice recognition works best in Chrome or Edge.</p>` : ""}
        </section>`;
      app.querySelectorAll(".lw-mode-card").forEach((btn) => {
        btn.onclick = () => startPart(+btn.dataset.part);
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const part = PARTS[partIndex];
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-badge">Done</span>
        </header>
        <section class="lw-done">
          <div class="lw-trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="lw-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${part.title}</strong><br>You got <strong>${correctCount} / 15</strong> correct.</p>
          <button type="button" class="lw-btn" id="lw-again">Play again</button>
          <button type="button" class="lw-btn secondary" id="lw-menu">All parts</button>
        </section>`;
      document.getElementById("lw-again").onclick = () => startPart(partIndex);
      document.getElementById("lw-menu").onclick = () => {
        phase = "menu";
        render();
      };
      return;
    }

    const item = order[index];
    const progress = (index + 1) + " / 15";
    const part = PARTS[partIndex];

    if (phase === "play") {
      if (part.id === "write") {
        app.innerHTML = `
          <header class="lw-topbar">
            <a class="lw-back" href="../" aria-label="Back">←</a>
            <span class="lw-title">${part.title}</span>
            <span class="lw-progress">${progress}</span>
          </header>
          ${progressHTML()}
          <section class="lw-play-area">
            <p class="lw-instruction">Listen, then type the nationality</p>
            <button type="button" class="lw-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
            <div class="lw-input-wrap">
              <input type="text" id="lw-input" class="lw-input" placeholder="Type the nationality…" autocomplete="off" autocorrect="off" autocapitalize="words" spellcheck="false">
            </div>
            <div class="lw-actions">
              <button type="button" class="lw-btn" id="lw-check" disabled>Check</button>
              <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
            </div>
          </section>`;
        const input = document.getElementById("lw-input");
        const checkBtn = document.getElementById("lw-check");
        input.focus();
        document.querySelector(".lw-play").onclick = playItemAudio;
        checkBtn.onclick = checkWriteAnswer;
        document.getElementById("lw-skip").onclick = skipAnswer;
        input.oninput = () => {
          checkBtn.disabled = !input.value.trim();
        };
        input.onkeydown = (e) => {
          if (e.key === "Enter" && input.value.trim()) checkWriteAnswer();
        };
      } else {
        app.innerHTML = `
          <header class="lw-topbar">
            <a class="lw-back" href="../" aria-label="Back">←</a>
            <span class="lw-title">${part.title}</span>
            <span class="lw-progress">${progress}</span>
          </header>
          ${progressHTML()}
          <section class="lw-play-area">
            <p class="lw-instruction">Listen, then say the nationality</p>
            <button type="button" class="lw-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
            <button type="button" class="lw-mic" id="lw-mic" aria-label="Speak" ${!speechSupported ? "disabled" : ""}>
              <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              <span class="lw-mic-rings" aria-hidden="true"></span>
            </button>
            <p class="lw-speech-status" id="lw-speech-status">${speechSupported ? "Tap the mic and say the nationality" : "Speech recognition not supported in this browser"}</p>
            <div class="lw-actions">
              <button type="button" class="lw-skip-btn" id="lw-skip">Skip →</button>
            </div>
          </section>`;
        document.querySelector(".lw-play").onclick = playItemAudio;
        const micBtn = document.getElementById("lw-mic");
        if (micBtn && speechSupported) micBtn.onclick = startListening;
        document.getElementById("lw-skip").onclick = skipAnswer;
      }
      return;
    }

    // try again (wrong answer – stay on same item)
    if (phase === "tryagain") {
      app.innerHTML = `
        <header class="lw-topbar">
          <a class="lw-back" href="../" aria-label="Back">←</a>
          <span class="lw-title">${part.title}</span>
          <span class="lw-progress">${progress}</span>
        </header>
        ${progressHTML()}
        <section class="lw-feedback is-wrong">
          <div class="lw-fb-icon">❌</div>
          <p class="lw-fb-msg">Try again</p>
          <p class="lw-fb-hint">You said: <em>${lastUserInput || "—"}</em></p>
          <button type="button" class="lw-btn" id="lw-retry">Try again</button>
        </section>`;
      document.getElementById("lw-retry").onclick = () => {
        answered = false;
        lastUserInput = "";
        phase = "play";
        render();
        setTimeout(playItemAudio, 250);
      };
      return;
    }

    // feedback (correct or skipped – auto-advances)
    const msg = lastSkipped
      ? `Answer: <strong>${item.nationality}</strong>`
      : `Correct! <strong>${item.nationality}</strong>`;

    app.innerHTML = `
      <header class="lw-topbar">
        <a class="lw-back" href="../" aria-label="Back">←</a>
        <span class="lw-title">${part.title}</span>
        <span class="lw-progress">${progress}</span>
      </header>
      ${progressHTML()}
      <section class="lw-feedback ${lastCorrect ? "is-correct" : "is-wrong"}">
        <div class="lw-fb-icon">${lastCorrect ? "✅" : "➡️"}</div>
        <p class="lw-fb-msg">${msg}</p>
      </section>`;
  }

  render();
})();
