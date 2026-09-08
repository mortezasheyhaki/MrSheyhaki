(function () {
  const GAME_ID = "aef1-u3a-match-rush";

  function awardStars(gameId, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (window.LAStars) {
      LAStars.recordPlay(gameId);
      LAStars.saveFromAccuracy(gameId, pct);
    }
    return pct;
  }

  // All 24 items
  const ALL = [
    { id: "cook-dinner",          verb: "cook",   phrase: "dinner",          full: "cook dinner",          audio: "audio/cook-dinner.mp3",          image: "images/cook-dinner.png" },
    { id: "do-homework",          verb: "do",     phrase: "homework",        full: "do homework",          audio: "audio/do-homework.mp3",          image: "images/do-homework.png" },
    { id: "do-housework",         verb: "do",     phrase: "housework",       full: "do housework",         audio: "audio/do-housework.mp3",         image: "images/do-housework.png" },
    { id: "do-yoga",              verb: "do",     phrase: "yoga",            full: "do yoga",              audio: "audio/do-yoga.mp3",              image: "images/do-yoga.png" },
    { id: "drink-water",          verb: "drink",  phrase: "water",           full: "drink water",          audio: "audio/drink-water.mp3",          image: "images/drink-water.png" },
    { id: "drive-a-car",          verb: "drive",  phrase: "a car",           full: "drive a car",          audio: "audio/drive-a-car.mp3",          image: "images/drive-a-car.png" },
    { id: "eat-vegetables",       verb: "eat",    phrase: "vegetables",      full: "eat vegetables",       audio: "audio/eat-vegetables.mp3",       image: "images/eat-vegetables.png" },
    { id: "go-to-the-movies",     verb: "go",     phrase: "to the movies",   full: "go to the movies",     audio: "audio/go-to-the-movies.mp3",     image: "images/go-to-the-movies.png" },
    { id: "have-a-garden",        verb: "have",   phrase: "a garden",        full: "have a garden",        audio: "audio/have-a-garden.mp3",        image: "images/have-a-garden.png" },
    { id: "like-animals",         verb: "like",   phrase: "animals",         full: "like animals",         audio: "audio/like-animals.mp3",         image: "images/like-animals.png" },
    { id: "listen-to-music",      verb: "listen", phrase: "to music",        full: "listen to music",      audio: "audio/listen-to-music.mp3",      image: "images/listen-to-music.png" },
    { id: "live-in-an-apartment", verb: "live",   phrase: "in an apartment", full: "live in an apartment", audio: "audio/live-in-an-apartment.mp3", image: "images/live-in-an-apartment.png" },
    { id: "need-a-new-phone",     verb: "need",   phrase: "a new phone",     full: "need a new phone",     audio: "audio/need-a-new-phone.mp3",     image: "images/need-a-new-phone.png" },
    { id: "play-tennis",          verb: "play",   phrase: "tennis",          full: "play tennis",          audio: "audio/play-tennis.mp3",          image: "images/play-tennis.png" },
    { id: "play-the-guitar",      verb: "play",   phrase: "the guitar",      full: "play the guitar",      audio: "audio/play-the-guitar.mp3",      image: "images/play-the-guitar.png" },
    { id: "read-a-book",          verb: "read",   phrase: "a book",          full: "read a book",          audio: "audio/read-a-book.mp3",          image: "images/read-a-book.png" },
    { id: "say-sorry",            verb: "say",    phrase: "sorry",           full: "say sorry",            audio: "audio/say-sorry.mp3",            image: "images/say-sorry.png" },
    { id: "speak-german",         verb: "speak",  phrase: "German",          full: "speak German",         audio: "audio/speak-german.mp3",         image: "images/speak-german.png" },
    { id: "study-history",        verb: "study",  phrase: "history",         full: "study history",        audio: "audio/study-history.mp3",        image: "images/study-history.png" },
    { id: "take-an-umbrella",     verb: "take",   phrase: "an umbrella",     full: "take an umbrella",     audio: "audio/take-an-umbrella.mp3",     image: "images/take-an-umbrella.png" },
    { id: "want-a-coffee",        verb: "want",   phrase: "a coffee",        full: "want a coffee",        audio: "audio/want-a-coffee.mp3",        image: "images/want-a-coffee.png" },
    { id: "watch-tv",             verb: "watch",  phrase: "TV",              full: "watch TV",             audio: "audio/watch-tv.mp3",             image: "images/watch-tv.png" },
    { id: "wear-glasses",         verb: "wear",   phrase: "glasses",         full: "wear glasses",         audio: "audio/wear-glasses.mp3",         image: "images/wear-glasses.png" },
    { id: "work-in-an-office",    verb: "work",   phrase: "in an office",    full: "work in an office",    audio: "audio/work-in-an-office.mp3",    image: "images/work-in-an-office.png" },
  ];

  // Mode 1: 5 rounds of ~5 (verb → phrase) — phone-friendly 5 vs 5
  // Round 1 keeps the three "do" pairs together
  const VERB_ROUNDS = [
    [
      ALL.find(x => x.id === "cook-dinner"),
      ALL.find(x => x.id === "drink-water"),
      ALL.find(x => x.id === "drive-a-car"),
      ALL.find(x => x.id === "do-housework"),
      ALL.find(x => x.id === "do-homework"),
    ],
    [
      ALL.find(x => x.id === "do-yoga"),
      ALL.find(x => x.id === "eat-vegetables"),
      ALL.find(x => x.id === "go-to-the-movies"),
      ALL.find(x => x.id === "have-a-garden"),
      ALL.find(x => x.id === "like-animals"),
    ],
    [
      ALL.find(x => x.id === "listen-to-music"),
      ALL.find(x => x.id === "live-in-an-apartment"),
      ALL.find(x => x.id === "need-a-new-phone"),
      ALL.find(x => x.id === "read-a-book"),
      ALL.find(x => x.id === "say-sorry"),
    ],
    [
      ALL.find(x => x.id === "speak-german"),
      ALL.find(x => x.id === "study-history"),
      ALL.find(x => x.id === "take-an-umbrella"),
      ALL.find(x => x.id === "want-a-coffee"),
      ALL.find(x => x.id === "watch-tv"),
    ],
    [
      ALL.find(x => x.id === "wear-glasses"),
      ALL.find(x => x.id === "work-in-an-office"),
      ALL.find(x => x.id === "play-the-guitar"),
      ALL.find(x => x.id === "play-tennis"),
    ],
  ];

  // Mode 2 & 3 use the same groupings
  const AUDIO_ROUNDS = VERB_ROUNDS;

  const MODES = [
    { name: "Verb → Phrase", desc: "Match each verb to the correct phrase ending." },
    { name: "Audio → Picture", desc: "Listen and tap the correct picture." },
    { name: "Audio → Phrase", desc: "Listen and tap the correct verb phrase." },
  ];

  // DOM
  const matchArea    = document.getElementById("matchArea");
  const modeLabel    = document.getElementById("modeLabel");
  const scoreEl      = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");
  const modeDesc     = document.getElementById("modeDesc");
  const feedbackEl   = document.getElementById("feedback");
  const nextRoundBtn = document.getElementById("nextRoundBtn");
  const nextModeBtn  = document.getElementById("nextModeBtn");
  const restartBtn   = document.getElementById("restartBtn");
  const confettiEl   = document.getElementById("confetti");
  const modeTabs     = document.querySelectorAll(".mode-tab");

  let mode = 0;          // 0,1,2
  let round = 0;         // 0-3 inside mode
  let score = 0;
  let matched = new Set();
  let matchCount = 0;
  let selectedLeft = null;
  let selectedRight = null;
  let currentAudio = null;
  let roundDone = false;
  let currentAudioItem = null; // for modes 2 & 3

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    document.querySelectorAll(".big-play.playing").forEach(b => b.classList.remove("playing"));
  }

  function playSrc(src, btn) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {});
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function totalPairsInMode() {
    return 24; // 5 rounds (5+5+5+5+4)
  }

  function updateProgress() {
    const total = 72; // 3 modes × 24
    const inRound = (mode === 0) ? matchCount : matched.size;
    const done = mode * 24 + inRound;
    progressFill.style.width = (done / total * 100) + "%";
    scoreEl.textContent = score;
    modeLabel.textContent = (mode + 1) + "/3";
  }

  function clearFeedback() {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
  }

  function showFeedback(type, msg) {
    feedbackEl.className = "feedback " + type;
    feedbackEl.textContent = msg;
  }

  function hideAllBtns() {
    nextRoundBtn.classList.add("hidden");
    nextModeBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");
  }

  // ===================== MODE 0: Verb → Phrase =====================
  function renderVerbPhrase() {
    const pairs = VERB_ROUNDS[round];
    matched.clear();
    matchCount = 0;
    selectedLeft = null;
    selectedRight = null;
    roundDone = false;
    stopAudio();
    hideAllBtns();
    clearFeedback();
    updateProgress();

    modeDesc.textContent = MODES[0].desc + "  ·  Round " + (round + 1) + "/" + VERB_ROUNDS.length;

    const verbOrder = shuffle(pairs);
    const phraseOrder = shuffle(pairs);

    matchArea.innerHTML = `
      <div class="match-grid">
        <section>
          <h2 class="col-title">Verb</h2>
          <div class="cards" id="leftCards"></div>
        </section>
        <div class="divider"><span class="divider-line"></span><span class="divider-icon">→</span><span class="divider-line"></span></div>
        <section>
          <h2 class="col-title">Phrase</h2>
          <div class="cards" id="rightCards"></div>
        </section>
      </div>`;

    const leftEl = document.getElementById("leftCards");
    const rightEl = document.getElementById("rightCards");

    verbOrder.forEach(item => {
      const c = document.createElement("div");
      c.className = "verb-card";
      c.dataset.id = item.id;
      c.textContent = item.verb;
      c.addEventListener("click", () => onLeftClick(item, c));
      leftEl.appendChild(c);
    });

    phraseOrder.forEach(item => {
      const c = document.createElement("div");
      c.className = "phrase-card";
      c.dataset.id = item.id;
      c.textContent = item.phrase;
      c.addEventListener("click", () => onRightClick(item, c));
      rightEl.appendChild(c);
    });
  }

  function onLeftClick(item, card) {
    // Use card class — NOT item.id (shared between verb & phrase columns)
    if (card.classList.contains("matched") || roundDone) return;
    if (selectedLeft && selectedLeft.card === card) {
      selectedLeft.card.classList.remove("selected");
      selectedLeft = null;
      return;
    }
    document.querySelectorAll(".verb-card.selected").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedLeft = { item, card };
    if (selectedRight) tryVerbMatch();
  }

  function onRightClick(item, card) {
    if (card.classList.contains("matched") || roundDone) return;
    if (selectedRight && selectedRight.card === card) {
      selectedRight.card.classList.remove("selected");
      selectedRight = null;
      return;
    }
    document.querySelectorAll(".phrase-card.selected").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedRight = { item, card };
    if (selectedLeft) tryVerbMatch();
  }

  // Any "do" card can pair with any of: homework, housework, yoga
  // Any "play" card can pair with any of: the guitar, tennis
  // Other verbs must match their own phrase (cook→dinner, etc.)
  function isFlexibleMatch(verbItem, phraseItem) {
    if (!verbItem || !phraseItem) return false;
    if (verbItem.verb === phraseItem.verb) return true;
    return false;
  }

  function tryVerbMatch() {
    const L = selectedLeft, R = selectedRight;
    if (!L || !R) return;

    if (isFlexibleMatch(L.item, R.item)) {
      // Mark the specific cards only (not shared item ids)
      matchCount++;
      L.card.classList.add("matched");
      R.card.classList.add("matched");
      L.card.classList.remove("selected");
      R.card.classList.remove("selected");
      score++;
      updateProgress();
      const full = L.item.verb + " " + R.item.phrase;
      showFeedback("success", full);
      playSrc(R.item.audio);
      selectedLeft = selectedRight = null;
      checkRoundComplete();
    } else {
      L.card.classList.add("wrong");
      R.card.classList.add("wrong");
      showFeedback("error", "Not a match");
      setTimeout(() => {
        L.card.classList.remove("wrong", "selected");
        R.card.classList.remove("wrong", "selected");
        selectedLeft = selectedRight = null;
        clearFeedback();
      }, 500);
    }
  }

  // ===================== MODE 1 & 2: Audio → Picture / Phrase =====================
  function renderAudioMatch(isPicture) {
    const pairs = AUDIO_ROUNDS[round];
    matched.clear();
    matchCount = 0;
    roundDone = false;
    stopAudio();
    hideAllBtns();
    clearFeedback();
    updateProgress();

    modeDesc.textContent = MODES[mode].desc + "  ·  Round " + (round + 1) + "/" + AUDIO_ROUNDS.length;

    // Pick one random remaining item as the current audio target
    // Actually for this mode we present one audio at a time and 6 options
    // We'll cycle through the 6 items of the round one by one.
    currentAudioItem = null;

    matchArea.innerHTML = `
      <div class="audio-match">
        <div class="audio-side">
          <button class="big-play" id="bigPlay" aria-label="Play">
            <span class="wave"></span><span class="wave"></span><span class="wave"></span>
            <svg viewBox="0 0 24 24" width="36" height="36"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
          </button>
          <p class="audio-label" id="audioHint">Tap to listen</p>
        </div>
        <div>
          <h2 class="col-title">${isPicture ? "Choose the picture" : "Choose the phrase"}</h2>
          <div class="options-grid${isPicture ? " pics" : " phrases"}" id="optionsGrid"></div>
        </div>
      </div>`;

    const bigPlay = document.getElementById("bigPlay");
    const optionsGrid = document.getElementById("optionsGrid");

    // State for this sub-mode: queue of remaining items in the round
    const queue = shuffle([...pairs]);
    let qIndex = 0;

    function loadNextAudio() {
      if (qIndex >= queue.length) {
        roundDone = true;
        checkRoundComplete();
        return;
      }
      currentAudioItem = queue[qIndex];
      document.getElementById("audioHint").textContent = "Item " + (qIndex + 1) + " of " + pairs.length;
      // re-enable all non-matched options
      optionsGrid.querySelectorAll(".pic-option, .phrase-option").forEach(el => {
        if (!el.classList.contains("matched")) {
          el.classList.remove("disabled", "wrong", "selected");
        }
      });
      // auto play
      setTimeout(() => playSrc(currentAudioItem.audio, bigPlay), 300);
    }

    // Build options (all 6 of this round)
    const optionOrder = shuffle(pairs);
    optionOrder.forEach(item => {
      let el;
      if (isPicture) {
        el = document.createElement("div");
        el.className = "pic-option";
        el.dataset.id = item.id;
        el.innerHTML = `<img src="${item.image}" alt="${item.full}" draggable="false">`;
      } else {
        el = document.createElement("div");
        el.className = "phrase-option";
        el.dataset.id = item.id;
        el.textContent = item.full;
      }
      el.addEventListener("click", () => {
        if (roundDone || !currentAudioItem || el.classList.contains("matched") || el.classList.contains("disabled")) return;

        if (el.dataset.id === currentAudioItem.id) {
          // correct
          el.classList.add("matched");
          matched.add(item.id);
          score++;
          updateProgress();
          showFeedback("success", currentAudioItem.full);
          playSrc(currentAudioItem.audio, bigPlay);
          // disable others temporarily then next
          optionsGrid.querySelectorAll(".pic-option, .phrase-option").forEach(o => {
            if (!o.classList.contains("matched")) o.classList.add("disabled");
          });
          qIndex++;
          setTimeout(() => {
            clearFeedback();
            loadNextAudio();
          }, 900);
        } else {
          el.classList.add("wrong");
          showFeedback("error", "Try again");
          setTimeout(() => {
            el.classList.remove("wrong");
            clearFeedback();
          }, 500);
        }
      });
      optionsGrid.appendChild(el);
    });

    bigPlay.addEventListener("click", () => {
      if (currentAudioItem) playSrc(currentAudioItem.audio, bigPlay);
    });

    loadNextAudio();
  }

  function checkRoundComplete() {
    // Mode 0 counts pairs via matchCount; modes 1–2 add one id per item
    const pairsInRound = (mode === 0 ? VERB_ROUNDS : AUDIO_ROUNDS)[round].length;
    const done = (mode === 0) ? (matchCount >= pairsInRound) : (matched.size >= pairsInRound);
    if (!done) return;
    roundDone = true;

    const maxRound = (mode === 0 ? VERB_ROUNDS : AUDIO_ROUNDS).length - 1;
    if (round < maxRound) {
      showFeedback("success", "Round complete! ✨");
      // Auto-advance to next round
      setTimeout(() => {
        round++;
        renderCurrent();
      }, 1100);
    } else if (mode < 2) {
      showFeedback("success", "Mode complete! Great job");
      // Auto-advance to next mode
      setTimeout(() => {
        mode++;
        round = 0;
        updateTabs();
        renderCurrent();
      }, 1400);
    } else {
      showFeedback("success", "All modes finished! Score: " + score + "/72");
      restartBtn.classList.remove("hidden");
      awardStars(GAME_ID, score, 72);
      launchConfetti();
    }
  }

  function goNextRound() {
    round++;
    renderCurrent();
  }

  function goNextMode() {
    mode++;
    round = 0;
    updateTabs();
    renderCurrent();
  }

  function restart() {
    mode = 0;
    round = 0;
    score = 0;
    updateTabs();
    renderCurrent();
  }

  function updateTabs() {
    modeTabs.forEach(t => {
      t.classList.toggle("active", parseInt(t.dataset.mode) === mode);
    });
  }

  function renderCurrent() {
    if (mode === 0) renderVerbPhrase();
    else if (mode === 1) renderAudioMatch(true);  // pictures
    else renderAudioMatch(false);                 // phrases
  }

  function launchConfetti() {
    const colors = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];
    for (let i = 0; i < 60; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.background = colors[i % colors.length];
      s.style.animationDuration = (1.3 + Math.random() * 1.5) + "s";
      s.style.animationDelay = Math.random() * 0.4 + "s";
      confettiEl.appendChild(s);
      setTimeout(() => s.remove(), 3500);
    }
  }

  // Events
  nextRoundBtn.addEventListener("click", goNextRound);
  nextModeBtn.addEventListener("click", goNextMode);
  restartBtn.addEventListener("click", restart);

  modeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const m = parseInt(tab.dataset.mode);
      if (m === mode) return;
      // allow free switching
      mode = m;
      round = 0;
      updateTabs();
      renderCurrent();
    });
  });

  // Start
  renderCurrent();
})();
