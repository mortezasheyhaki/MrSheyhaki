/* Where Is It? — Practical English 6
   One question per place on the map.
*/
(function () {
  "use strict";

  const MAX_LIVES = 3;
  const IMG_ASK = "assets/bob-ask.png";
  const IMG_HAPPY = "assets/bob-happy.png";

  // One question per place — highlight % of map image
  const QUESTIONS = [
    {
      ask: "Excuse me, where’s the bank?",
      highlight: { left: 2, top: 2, width: 14, height: 20 },
      accept: [
        { prep: "next to", landmarks: ["restaurant"] },
        { prep: "on the corner", landmarks: [] },
        { prep: "on the left", landmarks: [] }
      ],
      tip: "Top left on First Street."
    },
    {
      ask: "Excuse me, where’s the restaurant?",
      highlight: { left: 14, top: 2, width: 12, height: 20 },
      accept: [
        { prep: "next to", landmarks: ["bank"] },
        { prep: "across from", landmarks: ["school"] }
      ],
      tip: "Next to the bank."
    },
    {
      ask: "Excuse me, where’s the school?",
      highlight: { left: 32, top: 2, width: 16, height: 22 },
      accept: [
        { prep: "next to", landmarks: ["pharmacy"] },
        { prep: "across from", landmarks: ["restaurant"] },
        { prep: "between", landmarks: ["restaurant", "pharmacy"] }
      ],
      tip: "Big brick building with a playground."
    },
    {
      ask: "Excuse me, where’s the pharmacy?",
      highlight: { left: 46, top: 2, width: 12, height: 20 },
      accept: [
        { prep: "next to", landmarks: ["school"] },
        { prep: "across from", landmarks: ["hospital"] },
        { prep: "between", landmarks: ["school", "post office"] }
      ],
      tip: "Look for the green Rx sign."
    },
    {
      ask: "Excuse me, where’s the post office?",
      highlight: { left: 66, top: 2, width: 14, height: 20 },
      accept: [
        { prep: "next to", landmarks: ["train station"] },
        { prep: "across from", landmarks: ["pharmacy"] }
      ],
      tip: "Top right area, blue sign."
    },
    {
      ask: "Excuse me, where’s the train station?",
      highlight: { left: 78, top: 2, width: 18, height: 22 },
      accept: [
        { prep: "next to", landmarks: ["post office"] },
        { prep: "on the corner", landmarks: [] },
        { prep: "on the right", landmarks: [] }
      ],
      tip: "Yellow railroad crossing sign."
    },
    {
      ask: "Excuse me, where’s the bookstore?",
      highlight: { left: 2, top: 28, width: 14, height: 18 },
      accept: [
        { prep: "next to", landmarks: ["gas station"] },
        { prep: "on the left", landmarks: [] },
        { prep: "across from", landmarks: ["museum"] }
      ],
      tip: "Left side, above the gas station."
    },
    {
      ask: "Excuse me, where’s the gas station?",
      highlight: { left: 10, top: 36, width: 16, height: 16 },
      accept: [
        { prep: "next to", landmarks: ["bookstore"] },
        { prep: "across from", landmarks: ["museum"] },
        { prep: "on the corner", landmarks: [] }
      ],
      tip: "Red-and-white canopy on West Avenue."
    },
    {
      ask: "Excuse me, where’s the museum?",
      highlight: { left: 32, top: 32, width: 14, height: 20 },
      accept: [
        { prep: "next to", landmarks: ["hospital"] },
        { prep: "across from", landmarks: ["gas station"] },
        { prep: "between", landmarks: ["gas station", "hospital"] }
      ],
      tip: "Building with a big M."
    },
    {
      ask: "Excuse me, where’s the hospital?",
      highlight: { left: 44, top: 30, width: 16, height: 22 },
      accept: [
        { prep: "next to", landmarks: ["museum"] },
        { prep: "across from", landmarks: ["pharmacy"] },
        { prep: "between", landmarks: ["museum", "parking"] },
        { prep: "between", landmarks: ["museum", "parking lot"] }
      ],
      tip: "White building with a red cross."
    },
    {
      ask: "Excuse me, where’s the parking lot?",
      highlight: { left: 66, top: 32, width: 14, height: 20 },
      accept: [
        { prep: "next to", landmarks: ["supermarket"] },
        { prep: "across from", landmarks: ["hospital"] }
      ],
      tip: "Open lot on East Avenue."
    },
    {
      ask: "Excuse me, where’s the supermarket?",
      highlight: { left: 78, top: 30, width: 18, height: 22 },
      accept: [
        { prep: "next to", landmarks: ["parking", "parking lot"] },
        { prep: "across from", landmarks: ["movie theater", "theater", "cinema"] },
        { prep: "on the right", landmarks: [] },
        { prep: "on the corner", landmarks: [] }
      ],
      tip: "Green building on the right."
    },
    {
      ask: "Excuse me, where’s the hotel?",
      highlight: { left: 6, top: 58, width: 18, height: 28 },
      accept: [
        { prep: "on the corner", landmarks: [] },
        { prep: "across from", landmarks: ["park"] },
        { prep: "on the left", landmarks: [] }
      ],
      tip: "Bottom left on Main Street."
    },
    {
      ask: "Excuse me, where’s the park?",
      highlight: { left: 32, top: 56, width: 30, height: 30 },
      accept: [
        { prep: "across from", landmarks: ["hotel"] },
        { prep: "across from", landmarks: ["movie theater", "theater", "cinema"] },
        { prep: "between", landmarks: ["hotel", "movie theater"] },
        { prep: "between", landmarks: ["hotel", "theater"] }
      ],
      tip: "Big green square with a gazebo."
    },
    {
      ask: "Excuse me, where’s the movie theater?",
      highlight: { left: 72, top: 58, width: 24, height: 28 },
      accept: [
        { prep: "across from", landmarks: ["supermarket"] },
        { prep: "across from", landmarks: ["park"] },
        { prep: "on the corner", landmarks: [] },
        { prep: "on the right", landmarks: [] }
      ],
      tip: "Bottom right — MOVIE THEATER."
    }
  ];

  const WRONG_LINES = [
    "Are you sure?",
    "Are you lost, too?",
    "Hmm… are you sure?",
    "I don’t think that’s right."
  ];
  const RIGHT_LINES = [
    "Thanks!",
    "Great, I see it!",
    "Perfect, thank you!",
    "Awesome — found it!"
  ];

  let deck = [];
  let qi = 0;
  let lives = MAX_LIVES;
  let locked = false;
  let recognition = null;
  let listening = false;
  let voiceSupported = false;

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const playScreen = $("playScreen");
  const endScreen = $("endScreen");
  const highlightEl = $("highlight");
  const bobImg = $("bobImg");
  const bobQuestion = $("bobQuestion");
  const answerInput = $("answerInput");
  const feedback = $("feedback");
  const micBtn = $("micBtn");
  const voiceHint = $("voiceHint");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showScreen(name) {
    startScreen.hidden = name !== "start";
    playScreen.hidden = name !== "play";
    endScreen.hidden = name !== "end";
  }

  function setBob(mode) {
    if (!bobImg) return;
    bobImg.src = mode === "happy" ? IMG_HAPPY : IMG_ASK;
  }

  function setHighlight(hl) {
    if (!hl) {
      highlightEl.hidden = true;
      return;
    }
    highlightEl.hidden = false;
    highlightEl.style.left = hl.left + "%";
    highlightEl.style.top = hl.top + "%";
    highlightEl.style.width = hl.width + "%";
    highlightEl.style.height = hl.height + "%";
  }

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasPrep(text, prep) {
    const t = normalize(text);
    if (prep === "across from") return /\bacross\s+from\b/.test(t) || /\bacross\b/.test(t);
    if (prep === "next to") return /\bnext\s+to\b/.test(t) || /\bbeside\b/.test(t);
    if (prep === "on the corner") return /\bon\s+the\s+corner\b/.test(t) || /\bcorner\b/.test(t);
    if (prep === "on the left") return /\bon\s+the\s+left\b/.test(t) || /\bto\s+the\s+left\b/.test(t);
    if (prep === "on the right") return /\bon\s+the\s+right\b/.test(t) || /\bto\s+the\s+right\b/.test(t);
    if (prep === "between") return /\bbetween\b/.test(t);
    return t.indexOf(prep) !== -1;
  }

  function hasLandmark(text, name) {
    const t = normalize(text);
    const n = normalize(name);
    if (n === "parking" || n === "parking lot") return /\bparking\b/.test(t);
    if (n === "movie theater" || n === "theater" || n === "cinema") {
      return /\bmovie\s+theater\b/.test(t) || /\btheater\b/.test(t) || /\bcinema\b/.test(t);
    }
    if (n === "post office") return /\bpost\s+office\b/.test(t);
    if (n === "gas station") return /\bgas\s+station\b/.test(t) || /\bgas\b/.test(t);
    if (n === "train station") return /\btrain\s+station\b/.test(t) || /\bstation\b/.test(t);
    return t.indexOf(n) !== -1;
  }

  function checkAnswer(raw) {
    const q = deck[qi];
    const t = normalize(raw);
    if (!t) return false;

    for (const rule of q.accept) {
      if (!hasPrep(t, rule.prep)) continue;
      if (!rule.landmarks || rule.landmarks.length === 0) return true;
      if (rule.prep === "between") {
        if (rule.landmarks.every((lm) => hasLandmark(t, lm))) return true;
      } else {
        if (rule.landmarks.some((lm) => hasLandmark(t, lm))) return true;
      }
    }
    return false;
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
    $("livesEl").textContent =
      "❤️".repeat(Math.max(0, lives)) + (lives <= 0 ? "💔" : "");
  }

  function askQuestion() {
    locked = false;
    hideFeedback();
    answerInput.value = "";
    setBob("ask");
    const q = deck[qi];
    $("progressEl").textContent = qi + 1 + " / " + deck.length;
    bobQuestion.textContent = q.ask;
    setHighlight(q.highlight);
    $("hintLine").innerHTML =
      "Use a full sentence: <em>It’s …</em> · " + (q.tip || "");
    answerInput.focus();
  }

  function onCorrect() {
    locked = true;
    stopListening();
    setBob("happy");
    const line = RIGHT_LINES[Math.floor(Math.random() * RIGHT_LINES.length)];
    showFeedback("ok", "✓ " + line);
    setTimeout(() => {
      qi++;
      if (qi >= deck.length) finish(true);
      else askQuestion();
    }, 1200);
  }

  function onWrong() {
    setBob("ask");
    const line = WRONG_LINES[Math.floor(Math.random() * WRONG_LINES.length)];
    showFeedback("bad", line);
    lives -= 1;
    renderLives();
    if (lives <= 0) {
      locked = true;
      stopListening();
      setTimeout(() => finish(false), 1200);
    }
  }

  function submitAnswer() {
    if (locked) return;
    const raw = answerInput.value.trim();
    if (!raw) {
      showFeedback("info", "Type or say a full sentence.");
      return;
    }
    if (checkAnswer(raw)) onCorrect();
    else onWrong();
  }

  function finish(won) {
    stopListening();
    setHighlight(null);
    if (won) {
      $("endBob").src = IMG_HAPPY;
      $("endTitle").textContent = "Well done!";
      $("endMsg").textContent =
        "You helped Bob find all " + deck.length + " places.";
    } else {
      $("endBob").src = IMG_ASK;
      $("endTitle").textContent = "Out of lives";
      $("endMsg").textContent =
        "You answered " + qi + " of " + deck.length + ". Try again!";
    }
    showScreen("end");
  }

  function startGame() {
    // One question per place, shuffled order
    deck = shuffle(QUESTIONS);
    qi = 0;
    lives = MAX_LIVES;
    renderLives();
    showScreen("play");
    askQuestion();
  }

  function initVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      voiceSupported = false;
      micBtn.disabled = true;
      micBtn.title = "Voice not supported in this browser";
      micBtn.style.opacity = "0.5";
      return;
    }
    voiceSupported = true;
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (ev) => {
      let best = "";
      for (let i = 0; i < ev.results.length; i++) {
        const alt = ev.results[i][0];
        if (alt && alt.transcript) best = alt.transcript;
      }
      if (best) {
        answerInput.value = best;
        voiceHint.textContent = "Heard: “" + best + "”";
        submitAnswer();
      }
    };
    recognition.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        showFeedback("bad", "Microphone blocked — allow mic access");
      }
      stopListening();
    };
    recognition.onend = () => {
      listening = false;
      micBtn.classList.remove("active");
      micBtn.textContent = "🎤 Voice";
      if (voiceHint.textContent.indexOf("Heard") !== 0) voiceHint.hidden = true;
    };
  }

  function startListening() {
    if (!voiceSupported || locked || listening) return;
    try {
      listening = true;
      micBtn.classList.add("active");
      micBtn.textContent = "🎤 On";
      voiceHint.hidden = false;
      voiceHint.textContent = "Listening…";
      recognition.start();
    } catch (e) {
      stopListening();
    }
  }

  function stopListening() {
    listening = false;
    micBtn.classList.remove("active");
    micBtn.textContent = "🎤 Voice";
    voiceHint.hidden = true;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  }

  $("startBtn").addEventListener("click", startGame);
  $("submitBtn").addEventListener("click", submitAnswer);
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitAnswer();
  });
  micBtn.addEventListener("click", () => {
    if (listening) stopListening();
    else startListening();
  });
  $("againBtn").addEventListener("click", () => showScreen("start"));

  initVoice();
})();
