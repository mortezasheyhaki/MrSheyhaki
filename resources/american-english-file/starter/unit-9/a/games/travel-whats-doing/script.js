/* What's he/she/they doing? – type present continuous · Travel pictures */
(function () {
  "use strict";

  const GAME_ID = "starter-9a-travel-whats-doing";

  const ITEMS = [
    {
      id: "book-tickets",
      question: "What's she doing?",
      answer: "She's booking tickets.",
      alts: ["she's booking tickets", "she is booking tickets", "shes booking tickets"],
      audio: "audio/book-tickets.mp3",
      image: "https://cdn.imgurl.ir/uploads/g8412_book_tickets.png",
    },
    {
      id: "pack-suitcase",
      question: "What's she doing?",
      answer: "She's packing a suitcase.",
      alts: ["she's packing a suitcase", "she is packing a suitcase", "shes packing a suitcase"],
      audio: "audio/pack-a-suitcase.mp3",
      image: "https://cdn.imgurl.ir/uploads/p39229_pack_a_siuitcase.png",
    },
    {
      id: "leave-house",
      question: "What's she doing?",
      answer: "She's leaving the house.",
      alts: ["she's leaving the house", "she is leaving the house", "shes leaving the house"],
      audio: "audio/leave-the-house.mp3",
      image: "https://cdn.imgurl.ir/uploads/g04403_leave_the_house.png",
    },
    {
      id: "carry-suitcase",
      question: "What's he doing?",
      answer: "He's carrying a suitcase.",
      alts: ["he's carrying a suitcase", "he is carrying a suitcase", "hes carrying a suitcase"],
      audio: "audio/carry-a-suitcase.mp3",
      image: "https://cdn.imgurl.ir/uploads/u551356_carry_a_suitcase.png",
    },
    {
      id: "wear-sunglasses",
      question: "What's he doing?",
      answer: "He's wearing sunglasses.",
      alts: ["he's wearing sunglasses", "he is wearing sunglasses", "hes wearing sunglasses"],
      audio: "audio/wear-sunglasses.mp3",
      image: "https://cdn.imgurl.ir/uploads/j600481_wear_sungles.png",
    },
    {
      id: "get-taxi",
      question: "What's she doing?",
      answer: "She's getting in a taxi.",
      alts: [
        "she's getting in a taxi",
        "she is getting in a taxi",
        "shes getting in a taxi",
        "she's getting a taxi",
        "she is getting a taxi",
      ],
      audio: "audio/get-a-taxi.mp3",
      image: "https://cdn.imgurl.ir/uploads/m22232_get_in_a_taxi.png",
    },
    {
      id: "wait-flight",
      question: "What are they doing?",
      answer: "They're waiting for a flight.",
      alts: [
        "they're waiting for a flight",
        "they are waiting for a flight",
        "theyre waiting for a flight",
      ],
      audio: "audio/wait-for-a-flight.mp3",
      image: "https://cdn.imgurl.ir/uploads/v22740_wait_for_a_flight.png",
    },
    {
      id: "rent-car",
      question: "What are they doing?",
      answer: "They're renting a car.",
      alts: ["they're renting a car", "they are renting a car", "theyre renting a car"],
      audio: "audio/rent-a-car.mp3",
      image: "https://cdn.imgurl.ir/uploads/p927759_rent_a_car.png",
    },
    {
      id: "arrive-hotel",
      question: "What are they doing?",
      answer: "They're arriving at a hotel.",
      alts: [
        "they're arriving at a hotel",
        "they are arriving at a hotel",
        "theyre arriving at a hotel",
      ],
      audio: "audio/arrive-at-a-hotel.mp3",
      image: "https://cdn.imgurl.ir/uploads/c880373_arrive_at_a_hotel.png",
    },
    {
      id: "stay-hotel",
      question: "What are they doing?",
      answer: "They're staying in a hotel.",
      alts: [
        "they're staying in a hotel",
        "they are staying in a hotel",
        "theyre staying in a hotel",
      ],
      audio: "audio/stay-in-a-hotel.mp3",
      image: "https://cdn.imgurl.ir/uploads/e87389_stay_in_a_hotel.png",
    },
    {
      id: "call-home",
      question: "What's she doing?",
      answer: "She's calling home.",
      alts: ["she's calling home", "she is calling home", "shes calling home"],
      audio: "audio/call-home.mp3",
      image: "https://cdn.imgurl.ir/uploads/t810563_call_home.png",
    },
    {
      id: "buy-presents",
      question: "What's she doing?",
      answer: "She's buying presents.",
      alts: ["she's buying presents", "she is buying presents", "shes buying presents"],
      audio: "audio/buy-presents.mp3",
      image: "https://cdn.imgurl.ir/uploads/h82868_buy_presents.png",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const hasSpeech = typeof SpeechRecognition === "function";

  let phase = "menu";
  let mode = "type"; // type | speak
  let order = [];
  let index = 0;
  let score = 0;
  let points = 0;
  let streak = 0;
  let bestStreak = 0;
  let attempts = 0;
  let lastGained = 0;
  let locked = false;
  let currentAudio = null;
  let recognition = null;
  let listening = false;

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^\w\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(typed, item) {
    const t = normalize(typed);
    if (!t) return false;
    const targets = [item.answer].concat(item.alts || []).map(normalize);
    return targets.some((x) => t === x || t === x.replace(/\.$/, ""));
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(item) {
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    a.play().catch(() => {});
    a.onended = () => { if (currentAudio === a) currentAudio = null; };
  }

  function current() {
    return ITEMS[order[index]];
  }

  function startGame(selectedMode) {
    mode = selectedMode === "speak" ? "speak" : "type";
    if (mode === "speak" && !hasSpeech) {
      alert("Speech recognition is not available in this browser. Try Chrome, or use Type mode.");
      return;
    }
    stopListening();
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    score = 0;
    points = 0;
    streak = 0;
    bestStreak = 0;
    attempts = 0;
    lastGained = 0;
    locked = false;
    phase = "play";
    render();
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (_) {}
      recognition = null;
    }
    const mic = document.getElementById("twd-mic");
    if (mic) mic.classList.remove("listening");
  }

  function shake() {
    app.classList.remove("twd-shake");
    void app.offsetWidth;
    app.classList.add("twd-shake");
    setTimeout(() => app.classList.remove("twd-shake"), 400);
  }


  const PARTICLE_COLORS = ["#34d399", "#6366f1", "#fbbf24", "#38bdf8", "#a78bfa", "#f472b6", "#fde68a"];

  function spawnParticles(el, opts) {
    if (!el) return;
    const { count = 12, kind = "dot", spread = 50, duration = 700 } = opts || {};
    const rect = el.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const layer = document.createElement("div");
    layer.className = "twd-particle-layer";
    document.body.appendChild(layer);
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "twd-particle twd-particle--" + kind;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const dist = spread * (0.4 + Math.random() * 0.75);
      const size = kind === "star" ? 11 + Math.random() * 8 : kind === "ring" ? 16 + Math.random() * 10 : 5 + Math.random() * 7;
      p.style.left = originX + "px";
      p.style.top = originY + "px";
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", (Math.sin(angle) * dist - (kind === "star" ? 14 : 0)) + "px");
      p.style.setProperty("--size", size + "px");
      p.style.setProperty("--rot", Math.random() * 360 + "deg");
      p.style.setProperty("--delay", Math.random() * 0.08 + "s");
      p.style.setProperty("--dur", 0.45 + Math.random() * 0.4 + "s");
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      if (kind === "star") p.textContent = "✦";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), duration + 250);
  }

  function spawnCorrectFX() {
    const box = app.querySelector(".twd-pic-card") || app.querySelector(".twd-input");
    if (!box) return;
    spawnParticles(box, { count: 14, kind: "star", spread: 80, duration: 900 });
    spawnParticles(box, { count: 10, kind: "dot", spread: 55, duration: 700 });
    spawnParticles(box, { count: 5, kind: "ring", spread: 30, duration: 600 });
    const flash = document.createElement("div");
    flash.className = "twd-match-flash";
    app.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function spawnWrongFX() {
    const box = document.getElementById("twd-input") || app.querySelector(".twd-pic-card");
    if (!box) return;
    spawnParticles(box, { count: 9, kind: "dot", spread: 42, duration: 550 });
  }

  function spawnFinishFX(stars) {
    const wrap = document.createElement("div");
    wrap.className = "twd-confetti";
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#38bdf8", "#a78bfa", "#fde68a"];
    const n = stars >= 3 ? 48 : stars >= 1 ? 32 : 16;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      if (i % 4 === 0) {
        p.className = "is-star";
        p.textContent = "✦";
      }
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.85 + "s";
      p.style.animationDuration = 1.4 + Math.random() * 1.3 + "s";
      p.style.setProperty("--drift", (Math.random() * 90 - 45) + "px");
      p.style.setProperty("--spin", (360 + Math.random() * 720) + "deg");
      wrap.appendChild(p);
    }
    const burst = document.createElement("div");
    burst.className = "twd-finish-burst";
    wrap.appendChild(burst);
    app.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3200);
  }


  function startMic() {
    if (locked || mode !== "speak" || !hasSpeech) return;
    stopListening();
    const item = current();
    const hint = document.getElementById("twd-hint");
    const mic = document.getElementById("twd-mic");

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    listening = true;
    if (mic) mic.classList.add("listening");
    if (hint) {
      hint.textContent = "Listening… say the full sentence.";
      hint.className = "twd-hint";
    }

    recognition.onresult = (ev) => {
      const alts = [];
      for (let i = 0; i < ev.results.length; i++) {
        for (let j = 0; j < ev.results[i].length; j++) {
          alts.push(ev.results[i][j].transcript);
        }
      }
      const said = alts[0] || "";
      const ok = alts.some((t) => isMatch(t, item));
      stopListening();
      if (ok) {
        acceptCorrect();
      } else {
        attempts += 1;
        streak = 0;
        if (hint) {
          hint.textContent = said
            ? 'Heard: "' + said + '" — try again.'
            : "Didn't catch that. Tap the mic and try again.";
          hint.className = "twd-hint bad";
        }
        spawnWrongFX();
        shake();
      }
    };

    recognition.onerror = () => {
      stopListening();
      if (hint) {
        hint.textContent = "Mic error — tap and try again.";
        hint.className = "twd-hint bad";
      }
    };

    recognition.onend = () => {
      if (listening) stopListening();
      const m = document.getElementById("twd-mic");
      if (m) m.classList.remove("listening");
    };

    try {
      recognition.start();
    } catch (_) {
      stopListening();
      if (hint) {
        hint.textContent = "Could not start the mic. Check permissions.";
        hint.className = "twd-hint bad";
      }
    }
  }

  function acceptCorrect() {
    if (locked) return;
    locked = true;
    const item = current();
    score += 1;
    streak += 1;
    if (streak > bestStreak) bestStreak = streak;
    let gained = 100 + Math.min(100, (streak - 1) * 20);
    if (attempts === 0) gained += 50;
    points += gained;
    lastGained = gained;
    phase = "feedback";
    render();
    requestAnimationFrame(() => spawnCorrectFX());
    setTimeout(() => {
      if (phase === "feedback") next();
    }, 1100);
  }

  function check() {
    if (locked) return;
    const input = document.getElementById("twd-input");
    if (!input) return;
    const item = current();
    const typed = input.value;
    if (!typed.trim()) return;

    if (isMatch(typed, item)) {
      acceptCorrect();
    } else {
      attempts += 1;
      streak = 0;
      input.classList.add("is-bad");
      const hint = document.getElementById("twd-hint");
      if (hint) {
        hint.textContent = "Try again — use present continuous (He's / She's / They're …)";
        hint.className = "twd-hint bad";
      }
      spawnWrongFX();
      shake();
      setTimeout(() => {
        input.classList.remove("is-bad");
        input.focus();
      }, 500);
    }
  }

  function next() {
    stopAudio();
    stopListening();
    locked = false;
    attempts = 0;
    lastGained = 0;
    index += 1;
    if (index >= order.length) {
      phase = "done";
      render();
      return;
    }
    phase = "play";
    render();
  }

  function saveStars() {
    const acc = order.length ? Math.round((score / order.length) * 100) : 0;
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    return stars;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="twd-top">
          <a class="twd-back" href="../" aria-label="Back">←</a>
          <div class="twd-top-center">
            <span class="twd-eyebrow">Starter · Unit 9A</span>
            <span class="twd-title">What's he/she doing?</span>
          </div>
          <span style="width:42px"></span>
        </header>
        <div class="twd-body twd-start">
          <div class="twd-hero">👀</div>
          <h1>What's he / she / they doing?</h1>
          <p>Look at the picture. Answer in the present continuous.<br>
          Example: <strong>She's packing a suitcase.</strong></p>
          <div class="twd-mode-list">
            <button type="button" class="twd-mode-btn" id="twd-mode-type">
              <span class="twd-mode-icon">⌨️</span>
              <span><strong>Type</strong><br><small>Type the sentence</small></span>
            </button>
            <button type="button" class="twd-mode-btn" id="twd-mode-speak" ${hasSpeech ? "" : "disabled"}>
              <span class="twd-mode-icon">🎙️</span>
              <span><strong>Speak</strong><br><small>${hasSpeech ? "Say the sentence" : "Not supported in this browser"}</small></span>
            </button>
          </div>
        </div>`;
      document.getElementById("twd-mode-type").onclick = () => startGame("type");
      document.getElementById("twd-mode-speak").onclick = () => startGame("speak");
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      const acc = order.length ? Math.round((score / order.length) * 100) : 0;
      app.innerHTML = `
        <header class="twd-top">
          <a class="twd-back" href="../" aria-label="Back">←</a>
          <div class="twd-top-center">
            <span class="twd-eyebrow">Finished</span>
            <span class="twd-title">What's he/she doing?</span>
          </div>
          <span style="width:42px"></span>
        </header>
        <div class="twd-body twd-done">
          <div class="trophy">${stars === 3 ? "🏆" : stars >= 1 ? "🌟" : "💪"}</div>
          <div class="twd-stars" aria-hidden="true">
            <span>${stars >= 1 ? "⭐" : "☆"}</span>
            <span>${stars >= 2 ? "⭐" : "☆"}</span>
            <span>${stars >= 3 ? "⭐" : "☆"}</span>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <div class="twd-score-card">
            <div class="twd-score-row"><span>Score</span><strong>${points}</strong></div>
            <div class="twd-score-row"><span>Correct</span><strong>${score} / ${order.length}</strong></div>
            <div class="twd-score-row"><span>Accuracy</span><strong>${acc}%</strong></div>
            <div class="twd-score-row"><span>Best streak</span><strong>${bestStreak}×</strong></div>
          </div>
          <button type="button" class="twd-btn" id="twd-again">Play again</button>
          <br>
          <button type="button" class="twd-btn secondary" id="twd-menu">Back to menu</button>
        </div>`;
      document.getElementById("twd-again").onclick = () => startGame(mode);
      document.getElementById("twd-menu").onclick = () => { phase = "menu"; render(); };
      spawnFinishFX(stars);
      return;
    }

    const item = current();
    const progress = `${index + 1} / ${order.length}`;
    const isFb = phase === "feedback";

    app.innerHTML = `
      <header class="twd-top">
        <a class="twd-back" href="../" aria-label="Back">←</a>
        <div class="twd-top-center">
          <span class="twd-eyebrow">Present continuous · ${mode === "speak" ? "Speak" : "Type"}</span>
          <span class="twd-title">What's he/she doing?</span>
        </div>
        <div class="twd-hud">
          <span class="twd-progress">${progress}</span>
          <span class="twd-score-pill">${points} pts${streak > 1 ? " · " + streak + "×" : ""}</span>
        </div>
      </header>
      <div class="twd-body">
        <div class="twd-pic-card">
          <img src="${item.image}" alt="" draggable="false">
        </div>
        <p class="twd-question">${item.question}</p>
        ${
          isFb
            ? `
          <p class="twd-hint ok">Correct! +${lastGained} pts</p>
          <p class="twd-model">${item.answer}</p>
          <p class="twd-hint ok" style="opacity:.75;font-size:.85rem">Next…</p>`
            : mode === "speak"
            ? `
          <p class="twd-hint" id="twd-hint">Tap the mic and say: <strong>${item.answer}</strong></p>
          <div class="twd-mic-wrap">
            <button type="button" class="twd-mic" id="twd-mic" aria-label="Speak">
              <span class="twd-mic-pulse"></span>
              <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
                <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>
              </svg>
            </button>
            <span class="twd-mic-label">Tap to speak</span>
          </div>`
            : `
          <div class="twd-input-wrap">
            <input class="twd-input" id="twd-input" type="text" autocomplete="off"
              autocapitalize="sentences" spellcheck="true"
              placeholder="Type your answer…" aria-label="Your answer">
          </div>
          <p class="twd-hint" id="twd-hint">Type a full sentence, then Check.</p>
          <div class="twd-actions">
            <button type="button" class="twd-btn" id="twd-check">Check</button>
          </div>`
        }
      </div>`;

    if (!isFb) {
      if (mode === "speak") {
        const mic = document.getElementById("twd-mic");
        if (mic) mic.onclick = startMic;
      } else {
        const input = document.getElementById("twd-input");
        const checkBtn = document.getElementById("twd-check");
        if (input) {
          input.focus();
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") check();
          });
        }
        if (checkBtn) checkBtn.onclick = check;
      }
    }
  }

  render();
})();
