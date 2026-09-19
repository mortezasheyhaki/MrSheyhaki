/* Souvenirs Listen & Write – listen, then write or say · AEF Starter Unit 3B */
(function () {
  const GAME_ID = "starter-3b-souvenirs-listen-write";

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const MEDIA = "../../media/";

  const ITEMS = [
    {
      id: "cap",
      label: "a cap",
      answers: ["cap", "a cap", "the cap"],
      audio: MEDIA + "audio/cap.mp3",
      image: MEDIA + "images/cap.png",
    },
    {
      id: "t-shirt",
      label: "a T-shirt",
      answers: ["t-shirt", "tshirt", "t shirt", "a t-shirt", "a tshirt", "a t shirt", "tee shirt", "a tee shirt"],
      audio: MEDIA + "audio/t-shirt.mp3",
      image: MEDIA + "images/t-shirt.png",
    },
    {
      id: "toy",
      label: "a toy",
      answers: ["toy", "a toy", "the toy"],
      audio: MEDIA + "audio/toy.mp3",
      image: MEDIA + "images/toy.png",
    },
    {
      id: "sunglasses",
      label: "sunglasses",
      answers: ["sunglasses", "sunglass", "sun glasses", "a sunglasses"],
      audio: MEDIA + "audio/sunglasses.mp3",
      image: MEDIA + "images/sunglasses.png",
    },
    {
      id: "mug",
      label: "a mug",
      answers: ["mug", "a mug", "the mug"],
      audio: MEDIA + "audio/mug.mp3",
      image: MEDIA + "images/mug.png",
    },
    {
      id: "keychain",
      label: "a keychain",
      answers: ["keychain", "key chain", "a keychain", "a key chain", "key-chain", "keyring", "key ring"],
      audio: MEDIA + "audio/keychain.mp3",
      image: MEDIA + "images/keychain.png",
    },
    {
      id: "postcard",
      label: "a postcard",
      answers: ["postcard", "post card", "a postcard", "a post card", "post-card"],
      audio: MEDIA + "audio/postcard.mp3",
      image: MEDIA + "images/postcard.png",
    },
    {
      id: "map",
      label: "a map",
      answers: ["map", "a map", "the map"],
      audio: MEDIA + "audio/map.mp3",
      image: MEDIA + "images/map.png",
    },
  ];

  const MODES = [
    { id: "write", title: "Write", tip: "Listen, then write the word." },
    { id: "say",   title: "Say",   tip: "Listen, then say the word." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu";
  let order = [];
  let current = 0;
  let correctCount = 0;
  let locked = false;
  let currentAudio = null;
  let recognition = null;
  let listening = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function byId(id) {
    return ITEMS.find((x) => x.id === id);
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s\-]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, answers) {
    const u = normalize(user);
    if (!u) return false;
    for (let i = 0; i < answers.length; i++) {
      const a = normalize(answers[i]);
      if (!a) continue;
      if (u === a || u.includes(a) || a.includes(u)) return true;
    }
    const uFlat = u.replace(/[\s\-]/g, "");
    for (let i = 0; i < answers.length; i++) {
      const aFlat = normalize(answers[i]).replace(/[\s\-]/g, "");
      if (aFlat && (uFlat === aFlat || uFlat.includes(aFlat) || aFlat.includes(uFlat))) return true;
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.remove("playing");
  }

  function playCurrent() {
    const item = byId(order[current]);
    if (!item) return;
    stopAudio();
    const a = new Audio(item.audio);
    currentAudio = a;
    const btn = app.querySelector(".lw-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => { if (btn) btn.classList.remove("playing"); });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function stopMic() {
    listening = false;
    try { if (recognition) recognition.stop(); } catch (_) {}
    const mic = document.getElementById("lw-mic");
    if (mic) mic.classList.remove("is-listening");
  }

  function ensureRecognition() {
    if (!SpeechRecognitionAPI) return null;
    if (recognition) return recognition;
    const r = new SpeechRecognitionAPI();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    recognition = r;
    return r;
  }

  function startMic() {
    if (locked) return;
    const r = ensureRecognition();
    if (!r) {
      const fb = document.getElementById("lw-feedback");
      if (fb) {
        fb.textContent = "Speech not supported in this browser.";
        fb.className = "lw-feedback warn";
      }
      return;
    }
    stopMic();
    listening = true;
    const mic = document.getElementById("lw-mic");
    if (mic) mic.classList.add("is-listening");

    r.onresult = (ev) => {
      let best = "";
      try {
        for (let i = 0; i < ev.results.length; i++) {
          for (let j = 0; j < ev.results[i].length; j++) {
            const t = ev.results[i][j].transcript || "";
            if (t.length > best.length) best = t;
          }
        }
      } catch (_) {}
      stopMic();
      if (best) checkAnswer(best);
    };
    r.onerror = () => {
      stopMic();
      const fb = document.getElementById("lw-feedback");
      if (fb) {
        fb.textContent = "Couldn't hear you. Try again.";
        fb.className = "lw-feedback warn";
      }
    };
    r.onend = () => { stopMic(); };

    try {
      r.start();
    } catch (_) {
      stopMic();
    }
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    order = shuffle(ITEMS.map((x) => x.id));
    current = 0;
    correctCount = 0;
    locked = false;
    phase = "play";
    render();
    setTimeout(playCurrent, 400);
  }

  function checkAnswer(raw) {
    if (locked) return;
    const item = byId(order[current]);
    const ok = isCorrect(raw, item.answers);
    locked = true;

    const fb = document.getElementById("lw-feedback");
    const input = document.getElementById("lw-input");

    if (ok) {
      correctCount += 1;
      if (fb) {
        fb.textContent = "Correct!";
        fb.className = "lw-feedback ok";
      }
      if (input) {
        input.value = item.label;
        input.classList.add("is-correct");
        input.disabled = true;
      }
      // show picture briefly
      const pic = document.getElementById("lw-reveal");
      if (pic) pic.hidden = false;

      setTimeout(() => {
        if (current < order.length - 1) {
          current += 1;
          locked = false;
          render();
          setTimeout(playCurrent, 350);
        } else {
          phase = "done";
          render();
        }
      }, 1100);
    } else {
      if (fb) {
        fb.textContent = "Try again";
        fb.className = "lw-feedback err";
      }
      if (input) input.classList.add("is-wrong");
      setTimeout(() => {
        if (input) {
          input.classList.remove("is-wrong");
          input.value = "";
          input.focus();
        }
        if (fb) {
          fb.textContent = "";
          fb.className = "lw-feedback";
        }
        locked = false;
      }, 900);
    }
  }

  function calcStars() {
    const total = ITEMS.length;
    if (correctCount >= total) return 3;
    if (correctCount >= Math.ceil(total * 0.75)) return 2;
    if (correctCount >= Math.ceil(total * 0.5)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen &amp; Write</span>
          <span class="mc-badge">3B</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">✍️</div>
          <h1>Listen &amp; Write</h1>
          <p class="mc-desc">Listen to the word · write it or say it · 8 souvenirs</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="mc-mode-card mc-mode-btn" data-mode="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mode);
      });
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctCount,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      const m = MODES[modeIndex];
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Listen &amp; Write</span>
          <span class="mc-badge">3B</span>
        </header>
        <section class="mc-done">
          <div class="trophy-scene${stars === 3 ? " perfect" : ""}" aria-hidden="true">
            <div class="orbit-system">
              <div class="trophy-float">🏆</div>
              <div class="star-orbit"><span class="star${stars >= 1 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 2 ? " filled" : ""}">★</span></div>
              <div class="star-orbit"><span class="star${stars >= 3 ? " filled" : ""}">★</span></div>
            </div>
          </div>
          <h1>${stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!"}</h1>
          <p><strong>${m.title}</strong><br>You got <strong>${correctCount} / ${ITEMS.length}</strong> correct.</p>
          <button type="button" class="mc-btn" id="lw-again">Play again</button>
          <button type="button" class="mc-btn secondary" id="lw-menu">All modes</button>
        </section>`;
      document.getElementById("lw-again").onclick = () => startMode(modeIndex);
      document.getElementById("lw-menu").onclick = () => { phase = "menu"; render(); };
      return;
    }

    // play
    const mode = MODES[modeIndex];
    const item = byId(order[current]);
    const progress = (current + 1) + " / " + order.length;
    const isSay = mode.id === "say";

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title}</span>
        <span class="mc-progress">${progress}</span>
      </header>

      <p class="lw-instruction">${mode.tip}</p>

      <div class="lw-play-wrap">
        <button type="button" class="lw-play" id="lw-play" aria-label="Play audio">
          <span class="wave"></span><span class="wave"></span><span class="wave"></span>
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <div class="eq"><span></span><span></span><span></span><span></span></div>
        </button>
        <span class="lw-play-hint">Tap to listen</span>
      </div>

      <div class="lw-reveal" id="lw-reveal" hidden>
        <img src="${item.image}" alt="" draggable="false" />
      </div>

      <div class="lw-answer">
        ${isSay ? `
          <button type="button" class="lw-mic" id="lw-mic" aria-label="Speak">
            <span class="lw-mic-icon">🎤</span>
            <span class="lw-mic-label">Tap &amp; speak</span>
          </button>
        ` : `
          <input type="text" class="lw-input" id="lw-input" placeholder="Type the word…"
            autocomplete="off" autocorrect="off" spellcheck="false" />
          <button type="button" class="mc-btn" id="lw-check">Check</button>
        `}
      </div>

      <p class="lw-feedback" id="lw-feedback"></p>
    `;

    document.getElementById("lw-play").onclick = () => playCurrent();

    if (isSay) {
      const mic = document.getElementById("lw-mic");
      if (mic) mic.onclick = () => {
        if (listening) stopMic();
        else startMic();
      };
    } else {
      const input = document.getElementById("lw-input");
      const check = document.getElementById("lw-check");
      if (check) check.onclick = () => checkAnswer(input ? input.value : "");
      if (input) {
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            checkAnswer(input.value);
          }
        });
        setTimeout(() => input.focus(), 200);
      }
    }
  }

  render();
})();
