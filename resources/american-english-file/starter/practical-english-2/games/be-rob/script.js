/* Be Rob · AEF Starter Practical English 2 – role-play ordering */
(function () {
  const GAME_ID = "starter-pe2-be-rob";

  const FULL_AUDIO = "https://cdn.imgurl.ir/uploads/a617834_Rob_orders.mp3";

  // Conversation steps. Only Rob lines are interactive.
  // Server lines have individual audio clips.
  const STEPS = [
    {
      type: "server",
      text: "Who’s next?",
      audio: "https://cdn.imgurl.ir/uploads/x39305_whos_next.mp3",
    },
    {
      type: "rob",
      prompt: "Order a cheese sandwich",
      expected: [
        "can i have a cheese sandwich please",
        "can i have a cheese sandwich, please",
        "a cheese sandwich please",
        "cheese sandwich please",
      ],
      hint: "Can I have a cheese sandwich, please?",
    },
    {
      type: "server",
      text: "Anything else?",
      audio: "https://cdn.imgurl.ir/uploads/j0576_anything_else.mp3",
    },
    {
      type: "rob",
      prompt: "Order a Coke",
      expected: [
        "and a coke please",
        "and a coke, please",
        "a coke please",
        "coke please",
        "and a diet coke please",
      ],
      hint: "And a Coke, please.",
    },
    {
      type: "server",
      text: "Ice and lemon?",
      audio: "https://cdn.imgurl.ir/uploads/n935848_ice_and_lemon.mp3",
    },
    {
      type: "rob",
      prompt: "Say no thank you",
      expected: ["no thanks", "no, thanks", "no thank you", "no, thank you"],
      hint: "No, thanks.",
    },
    {
      type: "server",
      text: "There you go.",
      audio: "https://cdn.imgurl.ir/uploads/l74104_there_you_go.mp3",
    },
    {
      type: "rob",
      prompt: "Ask the price",
      expected: [
        "thanks how much is it",
        "thanks. how much is it",
        "how much is it",
        "how much is it please",
      ],
      hint: "Thanks. How much is it?",
    },
    {
      type: "server",
      text: "Six pounds seventy-five.",
      audio: "https://cdn.imgurl.ir/uploads/m879829_6.75.mp3",
    },
    {
      type: "rob",
      prompt: "Give the money",
      expected: ["here you are", "here you go"],
      hint: "Here you are.",
    },
    {
      type: "server",
      text: "Thanks. Here’s your change.",
      audio: "https://cdn.imgurl.ir/uploads/h059341_thanks_heres_your_change.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let stepIndex = 0;
  let score = 0;
  let totalRob = STEPS.filter((s) => s.type === "rob").length;
  let currentAudio = null;
  let recognition = null;
  let isListening = false;
  let lastTranscript = "";

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(spoken, expectedList) {
    const n = normalize(spoken);
    if (!n) return false;
    return expectedList.some((exp) => {
      const e = normalize(exp);
      return n === e || n.includes(e) || e.includes(n);
    });
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".br-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playFullAudio() {
    if (currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    const a = new Audio(FULL_AUDIO);
    currentAudio = a;
    const btn = app.querySelector(".br-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
    };
  }

  function playServerAudio(url, onEnded) {
    stopAudio();
    if (!url) {
      if (onEnded) onEnded();
      return;
    }
    const a = new Audio(url);
    currentAudio = a;
    const btn = app.querySelector(".br-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      if (onEnded) onEnded();
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      currentAudio = null;
      if (onEnded) onEnded();
    };
  }

  function stopRecognition() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (_) {}
    }
    isListening = false;
    const mic = app.querySelector(".br-mic");
    if (mic) mic.classList.remove("listening");
  }

  function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    stopRecognition();
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening = true;
      const mic = app.querySelector(".br-mic");
      if (mic) mic.classList.add("listening");
      const status = document.getElementById("br-status");
      if (status) status.textContent = "Listening… speak now";
    };

    recognition.onresult = (event) => {
      let best = "";
      for (let i = 0; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          const t = event.results[i][j].transcript;
          if (t.length > best.length) best = t;
        }
      }
      lastTranscript = best;
      const input = document.getElementById("br-input");
      if (input) input.value = best;
      const status = document.getElementById("br-status");
      if (status) status.textContent = "Heard: “" + best + "”";
    };

    recognition.onerror = () => {
      isListening = false;
      const mic = app.querySelector(".br-mic");
      if (mic) mic.classList.remove("listening");
      const status = document.getElementById("br-status");
      if (status) status.textContent = "Couldn’t hear – try again or type";
    };

    recognition.onend = () => {
      isListening = false;
      const mic = app.querySelector(".br-mic");
      if (mic) mic.classList.remove("listening");
    };

    try {
      recognition.start();
    } catch (e) {
      const status = document.getElementById("br-status");
      if (status) status.textContent = "Mic error – please type instead";
    }
  }

  function calcStars() {
    if (score >= totalRob) return 3;
    if (score >= Math.ceil(totalRob * 0.6)) return 2;
    if (score >= 1) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function checkRobAnswer() {
    const step = STEPS[stepIndex];
    if (step.type !== "rob") return;

    const input = document.getElementById("br-input");
    const val = (input && input.value) || lastTranscript || "";
    const ok = isMatch(val, step.expected);

    const feedback = document.getElementById("br-feedback");
    const content = app.querySelector(".br-content");
    if (ok) {
      score++;
      if (feedback) {
        feedback.textContent = "Great! ✓";
        feedback.className = "br-feedback ok";
      }
      if (content) {
        content.classList.add("is-correct");
        setTimeout(() => content.classList.remove("is-correct"), 500);
      }
      // only advance on correct answer
      setTimeout(() => {
        advance();
      }, 900);
    } else {
      if (feedback) {
        feedback.textContent = "Try again!";
        feedback.className = "br-feedback bad";
      }
      // clear input so they can try again
      if (input) {
        input.value = "";
        input.focus();
      }
      lastTranscript = "";
      const status = document.getElementById("br-status");
      if (status) status.textContent = "Tap the mic or type again";
    }
  }

  function advance() {
    stopRecognition();
    stopAudio();
    stepIndex++;
    if (stepIndex >= STEPS.length) {
      phase = "done";
      render();
    } else {
      renderPlay();
    }
  }

  function skipServer() {
    // auto-advance past server lines after a moment, or with a button
    advance();
  }

  function startGame() {
    stepIndex = 0;
    score = 0;
    lastTranscript = "";
    phase = "play";
    render();
  }

  function renderMenu() {
    app.innerHTML = `
      <header class="br-topbar">
        <a class="br-back" href="../" aria-label="Back">←</a>
        <span class="br-title">Be Rob</span>
        <span class="br-badge">PE2</span>
      </header>
      <section class="br-start">
        <div class="br-hero" aria-hidden="true">🗣️</div>
        <h1>Be Rob</h1>
        <p class="br-desc">You are Rob. Listen to the server, then speak or type your lines to order at the café.</p>
        <button type="button" class="br-btn" id="br-start">Start</button>
        <button type="button" class="br-btn secondary" id="br-listen">Listen to full dialogue first</button>
      </section>`;
    document.getElementById("br-start").onclick = startGame;
    document.getElementById("br-listen").onclick = () => {
      playFullAudio();
    };
  }

  function renderPlay() {
    const step = STEPS[stepIndex];
    const robDone = STEPS.slice(0, stepIndex + 1).filter((s) => s.type === "rob").length;
    const progress = `Line ${Math.min(robDone, totalRob)} / ${totalRob}`;

    if (step.type === "server") {
      app.innerHTML = `
        <header class="br-topbar">
          <a class="br-back" href="../" aria-label="Back">←</a>
          <span class="br-title">Be Rob</span>
          <span class="br-progress">${progress}</span>
        </header>
        <div class="br-content">
          <div class="br-bubble server">
            <span class="br-role">Server</span>
            <p>${step.text}</p>
          </div>
          <button type="button" class="br-play" aria-label="Play server line">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <div class="eq"><span></span><span></span><span></span><span></span></div>
          </button>
          <p class="br-hint">Listen to the server</p>
          <button type="button" class="br-btn" id="br-continue">Continue →</button>
        </div>`;

      const playBtn = app.querySelector(".br-play");
      playBtn.onclick = () => playServerAudio(step.audio);

      // Auto-play the server line, then enable continue
      playServerAudio(step.audio, () => {
        // audio finished – user can continue
      });

      document.getElementById("br-continue").onclick = skipServer;
      return;
    }

    // Rob turn
    app.innerHTML = `
      <header class="br-topbar">
        <a class="br-back" href="../" aria-label="Back">←</a>
        <span class="br-title">Be Rob</span>
        <span class="br-progress">${progress}</span>
      </header>
      <div class="br-content">
        <div class="br-bubble rob">
          <span class="br-role">You (Rob)</span>
          <p class="br-prompt">${step.prompt}</p>
        </div>

        <div class="br-input-row">
          <input type="text" id="br-input" class="br-input" placeholder="Type or speak your line…" autocomplete="off" spellcheck="false">
          <button type="button" class="br-mic" id="br-mic" aria-label="Speak" title="Speak">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V21h-2v-5.07z"/></svg>
          </button>
        </div>
        <p class="br-status" id="br-status">Tap the mic or type your answer</p>
        <p class="br-feedback" id="br-feedback"></p>

        <div class="br-actions">
          <button type="button" class="br-btn" id="br-check">Check</button>
          <button type="button" class="br-btn secondary" id="br-hint">Show example</button>
        </div>
      </div>`;

    const input = document.getElementById("br-input");
    input.focus();
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkRobAnswer();
      }
    };
    document.getElementById("br-mic").onclick = startRecognition;
    document.getElementById("br-check").onclick = checkRobAnswer;
    document.getElementById("br-hint").onclick = () => {
      const fb = document.getElementById("br-feedback");
      if (fb) {
        fb.textContent = "Example: “" + step.hint + "”";
        fb.className = "br-feedback hint";
      }
    };
  }

  function renderDone() {
    const stars = saveStars();
    app.innerHTML = `
      <header class="br-topbar">
        <a class="br-back" href="../" aria-label="Back">←</a>
        <span class="br-title">Be Rob</span>
        <span class="br-badge">Done</span>
      </header>
      <section class="br-done">
        <div class="br-stars" aria-hidden="true">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <h1>${stars === 3 ? "Perfect order!" : stars >= 1 ? "Nice job!" : "Keep practicing!"}</h1>
        <p>You got <strong>${score} / ${totalRob}</strong> of Rob’s lines right.</p>
        <button type="button" class="br-btn" id="br-again">Play again</button>
        <button type="button" class="br-btn secondary" id="br-menu">Back to start</button>
      </section>`;
    document.getElementById("br-again").onclick = startGame;
    document.getElementById("br-menu").onclick = () => { phase = "menu"; render(); };
  }

  function render() {
    if (phase === "menu") renderMenu();
    else if (phase === "play") renderPlay();
    else if (phase === "done") renderDone();
  }

  render();
})();
