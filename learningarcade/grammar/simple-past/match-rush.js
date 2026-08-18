/* ==========================================
   MATCH RUSH — Simple Past (Grammar Arcade)
   Style & mechanics matched to Vocabulary Match Rush.
   Content: Base form ↔ Past form pairs
   Wrapped in an IIFE so nothing leaks into the
   global scope or touches the rest of the site.
   ========================================== */

(function () {
  "use strict";

  const container = document.getElementById("matchRushGame");
  if (!container) return; // Match Rush markup isn't on this page

  let initialized = false;

  function initMatchRush() {
    if (initialized) return;
    initialized = true;

    // ---------- SIMPLE PAST DATA ----------
    const IRREGULAR = [
      ["be", "was / were"], ["buy", "bought"], ["do", "did"], ["get", "got"],
      ["go", "went"], ["have", "had"], ["leave", "left"], ["say", "said"],
      ["see", "saw"], ["send", "sent"], ["sit", "sat"], ["tell", "told"],
      ["write", "wrote"], ["come", "came"], ["drink", "drank"], ["drive", "drove"],
      ["eat", "ate"], ["fall", "fell"], ["find", "found"], ["give", "gave"],
      ["know", "knew"], ["make", "made"], ["meet", "met"], ["read", "read"],
      ["run", "ran"], ["sleep", "slept"], ["speak", "spoke"], ["take", "took"],
      ["think", "thought"], ["wear", "wore"], ["win", "won"], ["begin", "began"],
      ["break", "broke"], ["bring", "brought"], ["build", "built"], ["catch", "caught"],
      ["choose", "chose"], ["cut", "cut"], ["draw", "drew"], ["feel", "felt"],
      ["fly", "flew"], ["forget", "forgot"], ["hear", "heard"], ["keep", "kept"],
      ["lose", "lost"], ["pay", "paid"], ["put", "put"], ["sell", "sold"],
      ["sing", "sang"], ["stand", "stood"], ["swim", "swam"], ["teach", "taught"],
      ["understand", "understood"]
    ];

    const REGULAR = [
      ["answer", "answered"], ["arrive", "arrived"], ["ask", "asked"], ["book", "booked"],
      ["call", "called"], ["carry", "carried"], ["change", "changed"], ["clean", "cleaned"],
      ["close", "closed"], ["cook", "cooked"], ["cry", "cried"], ["decide", "decided"],
      ["finish", "finished"], ["help", "helped"], ["invite", "invited"], ["learn", "learned"],
      ["like", "liked"], ["listen", "listened"], ["live", "lived"], ["look", "looked"],
      ["love", "loved"], ["miss", "missed"], ["move", "moved"], ["need", "needed"],
      ["open", "opened"], ["pack", "packed"], ["paint", "painted"], ["park", "parked"],
      ["pass", "passed"], ["play", "played"], ["rain", "rained"], ["relax", "relaxed"],
      ["start", "started"], ["stay", "stayed"], ["stop", "stopped"], ["study", "studied"],
      ["talk", "talked"], ["travel", "traveled"], ["turn", "turned"], ["use", "used"],
      ["wait", "waited"], ["walk", "walked"], ["want", "wanted"], ["wash", "washed"],
      ["watch", "watched"], ["work", "worked"]
    ];

    function buildPool(setKey) {
      let source;
      if (setKey === "regular") source = REGULAR;
      else if (setKey === "mixed") source = IRREGULAR.concat(REGULAR);
      else source = IRREGULAR; // default irregular

      const pool = [];
      let id = 1;
      source.forEach(([base, past]) => {
        pool.push({ id: id++, verb: base, phrase: past });
      });
      return pool;
    }

    let gameVocabulary = buildPool("irregular");

    const praiseMessages = ["Good job!", "Great match!", "Awesome!", "Perfect!", "Nice!", "Spot on!"];

    // --- DOM ELEMENTS (scoped to the embedded game container) ---
    const startBtn = container.querySelector("#startBtn");
    const restartBtn = container.querySelector("#restartBtn");
    const homeScreen = container.querySelector("#homeScreen");
    const gameScreen = container.querySelector("#gameScreen");
    const gameOverModal = container.querySelector("#gameOverModal");

    const verbsDiv = container.querySelector("#verbs");
    const phrasesDiv = container.querySelector("#phrases");

    const scoreLabel = container.querySelector("#score");
    const timerLabel = container.querySelector("#timer");
    const comboLabel = container.querySelector("#combo");
    const homeHighScore = container.querySelector("#homeHighScore");

    const modalFinalScore = container.querySelector("#modalFinalScore");
    const modalBestScore = container.querySelector("#modalBestScore");
    const newHighTag = container.querySelector("#newHighTag");
    const accuracyStat = container.querySelector("#accuracyStat");
    const maxComboStat = container.querySelector("#maxComboStat");
    const mistakeListDiv = container.querySelector("#mistakeList");

    const darkModeBtn = container.querySelector("#darkModeBtn");
    const ttsToggleBtn = container.querySelector("#ttsToggleBtn");
    const modeSelect = container.querySelector("#modeSelect");
    const setSelect = container.querySelector("#setSelect");

    const hintBtn = container.querySelector("#hintBtn");
    const shuffleBtn = container.querySelector("#shuffleBtn");
    const freezeBanner = container.querySelector("#freezeBanner");

    // --- GAME STATE ---
    const ACTIVE_PAIRS = 4;
    let gameMode = "rush"; // "rush", "zen", "streak"
    let verbSet = "irregular";
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let totalAttempts = 0;
    let correctMatches = 0;
    let mistakes = []; // [{verb, phrase}]

    let timeLeft = 90;
    let timer = null;
    let isFrozen = false;
    let freezeTimer = null;
    let gameRunning = false;
    let ttsEnabled = true;

    let activePairs = [];
    let remainingPairs = [];

    let selectedVerb = null;
    let selectedPhrase = null;
    let selectedVerbElement = null;
    let selectedPhraseElement = null;

    // --- TEXT-TO-SPEECH SYSTEM ---
    function speakText(text) {
      if (!ttsEnabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    // --- AUDIO SYSTEM (Synthesizer) ---
    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    function playSound(soundType) {
      const patterns = {
        match: [
          [659.25, 0.07, "square", 0.10],
          [783.99, 0.07, "square", 0.10],
          [1046.50, 0.12, "triangle", 0.09]
        ],
        wrong: [
          [220, 0.09, "sawtooth", 0.08],
          [155, 0.16, "square", 0.07]
        ],
        bonus: [
          [523.25, 0.06, "square", 0.09],
          [659.25, 0.06, "square", 0.09],
          [783.99, 0.06, "square", 0.09],
          [1046.50, 0.18, "triangle", 0.10]
        ],
        freeze: [
          [440, 0.08, "square", 0.08],
          [660, 0.08, "square", 0.08],
          [880, 0.20, "triangle", 0.08]
        ],
        victory: [
          [523.25, 0.08, "square", 0.09],
          [659.25, 0.08, "square", 0.09],
          [783.99, 0.08, "square", 0.09],
          [1046.50, 0.25, "triangle", 0.10]
        ],
        gameover: [
          [330, 0.12, "square", 0.08],
          [247, 0.14, "square", 0.08],
          [196, 0.24, "sawtooth", 0.07]
        ]
      };
      (patterns[soundType] || []).forEach(([freq, duration, type, volume], i) => {
        setTimeout(() => {
          const ctx = getAudioCtx();
          if (ctx.state === "suspended") ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(volume, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, i * 75);
      });
    }

    // --- HIGH SCORE (namespaced for Simple Past) ---
    function highScoreKey() {
      return "simplepast_match_high_scores";
    }

    function updateHighScoreDisplay() {
      const highScores = JSON.parse(localStorage.getItem(highScoreKey()) || "{}");
      const best = highScores[gameMode] || 0;
      if (homeHighScore) homeHighScore.textContent = best;
    }

    // --- INITIALIZATION ---
    updateHighScoreDisplay();

    if (modeSelect) {
      modeSelect.onchange = () => {
        gameMode = modeSelect.value;
        updateHighScoreDisplay();
      };
    }

    startBtn.onclick = () => {
      if (modeSelect) gameMode = modeSelect.value;
      if (setSelect) verbSet = setSelect.value;
      gameVocabulary = buildPool(verbSet);
      homeScreen.style.display = "none";
      gameScreen.style.display = "block";
      gameScreen.classList.add("is-active");
      startGame();
    };

    restartBtn.onclick = () => {
      gameOverModal.style.display = "none";
      startGame();
    };

    if (darkModeBtn) darkModeBtn.classList.add("theme-toggle");

    if (ttsToggleBtn) {
      ttsToggleBtn.onclick = () => {
        ttsEnabled = !ttsEnabled;
        ttsToggleBtn.textContent = ttsEnabled ? "🔊 Sound On" : "🔇 Sound Off";
      };
    }

    // --- POWER-UPS ---
    if (hintBtn) {
      hintBtn.onclick = () => {
        if (!gameRunning) return;

        // Highlight one correct pair that is currently on the board
        if (activePairs.length === 0) return;
        const target = activePairs[0];

        if (gameMode === "rush") {
          timeLeft = Math.max(1, timeLeft - 5);
          timerLabel.textContent = timeLeft;
        }

        container.querySelectorAll("#verbs .word").forEach(el => {
          if (el.textContent === target.verb) el.classList.add("selected");
        });
        container.querySelectorAll("#phrases .word").forEach(el => {
          if (el.textContent === target.phrase) el.classList.add("selected");
        });

        setTimeout(() => clearSelections(), 1200);
      };
    }

    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        if (!gameRunning) return;
        remainingPairs.push(...activePairs);
        activePairs = [];
        for (let i = 0; i < ACTIVE_PAIRS; i++) addRandomPair();
        clearSelections();
        renderBoard();
      };
    }

    function triggerTimeFreeze() {
      isFrozen = true;
      playSound("freeze");
      if (freezeBanner) freezeBanner.style.display = "block";

      if (freezeTimer) clearTimeout(freezeTimer);
      freezeTimer = setTimeout(() => {
        isFrozen = false;
        if (freezeBanner) freezeBanner.style.display = "none";
      }, 5000);
    }

    // --- GAME LOGIC ---
    function startGame() {
      score = 0;
      combo = 0;
      maxCombo = 0;
      totalAttempts = 0;
      correctMatches = 0;
      mistakes = [];
      isFrozen = false;

      timeLeft = gameMode === "rush" ? 90 : 0;

      scoreLabel.textContent = score;
      comboLabel.textContent = "0x";
      timerLabel.textContent = gameMode === "zen" ? "∞" : timeLeft;

      if (freezeBanner) freezeBanner.style.display = "none";
      if (timer) clearInterval(timer);

      gameRunning = true;

      if (gameMode === "rush") {
        timer = setInterval(updateTimer, 1000);
      }

      remainingPairs = [...gameVocabulary];
      // shuffle remaining
      for (let i = remainingPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingPairs[i], remainingPairs[j]] = [remainingPairs[j], remainingPairs[i]];
      }
      activePairs = [];

      for (let i = 0; i < ACTIVE_PAIRS; i++) {
        addRandomPair();
      }

      renderBoard();
    }

    function updateTimer() {
      if (!gameRunning || isFrozen) return;
      timeLeft--;
      timerLabel.textContent = timeLeft;
      if (timeLeft <= 0) endGame(false);
    }

    function endGame(isVictory = false) {
      clearInterval(timer);
      if (freezeTimer) clearTimeout(freezeTimer);
      gameRunning = false;
      clearSelections();

      if (isVictory) {
        if (gameMode === "rush") score += timeLeft * 2;
        playSound("victory");
      } else {
        playSound("gameover");
      }

      const highScores = JSON.parse(localStorage.getItem(highScoreKey()) || "{}");
      const currentBest = highScores[gameMode] || 0;
      let isNewHigh = false;

      if (score > currentBest) {
        highScores[gameMode] = score;
        localStorage.setItem(highScoreKey(), JSON.stringify(highScores));
        isNewHigh = true;
      }

      const modalTitle = gameOverModal.querySelector("h2");
      if (modalTitle) {
        modalTitle.textContent = isVictory ? "🏆 You Cleared the Board!" : "⏰ Time's Up!";
      }

      modalFinalScore.textContent = score;
      modalBestScore.textContent = Math.max(score, currentBest);
      if (newHighTag) newHighTag.style.display = isNewHigh ? "block" : "none";

      const accuracy = totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0;
      accuracyStat.textContent = accuracy + "%";
      maxComboStat.textContent = maxCombo + "x";

      if (mistakeListDiv) {
        mistakeListDiv.innerHTML = "";
        if (mistakes.length === 0) {
          mistakeListDiv.innerHTML = "<p class='no-mistakes'>No mistakes — excellent!</p>";
        } else {
          // unique mistakes
          const seen = new Set();
          mistakes.forEach(m => {
            const key = m.verb + "→" + m.phrase;
            if (seen.has(key)) return;
            seen.add(key);
            const row = document.createElement("div");
            row.className = "mistake-item";
            row.innerHTML = `<strong>${m.verb}</strong> → <span>${m.phrase}</span>`;
            mistakeListDiv.appendChild(row);
          });
        }
      }

      gameOverModal.style.display = "flex";
    }

    function addRandomPair() {
      if (remainingPairs.length === 0) return;
      const index = Math.floor(Math.random() * remainingPairs.length);
      activePairs.push(remainingPairs[index]);
      remainingPairs.splice(index, 1);
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function renderBoard() {
      verbsDiv.innerHTML = "";
      phrasesDiv.innerHTML = "";

      const shuffled = [...activePairs];
      shuffle(shuffled);

      activePairs.forEach(pair => {
        const div = document.createElement("div");
        div.className = "word";
        div.textContent = pair.verb;
        div.onclick = () => selectVerb(div, pair);
        verbsDiv.appendChild(div);
      });

      shuffled.forEach(pair => {
        const div = document.createElement("div");
        div.className = "word";
        div.textContent = pair.phrase;
        div.onclick = () => selectPhrase(div, pair);
        phrasesDiv.appendChild(div);
      });
    }

    function showFloatingFeedback(targetElement, text) {
      const rect = targetElement.getBoundingClientRect();
      const feedback = document.createElement("div");
      feedback.className = "floating-feedback";
      feedback.textContent = text;
      feedback.style.left = `${rect.left + rect.width / 2 - 40}px`;
      feedback.style.top = `${rect.top}px`;
      container.appendChild(feedback);
      setTimeout(() => feedback.remove(), 800);
    }

    function clearSelections() {
      container.querySelectorAll(".word").forEach(w => {
        w.classList.remove("selected", "wrong", "correct");
      });
      selectedVerb = null;
      selectedPhrase = null;
      selectedVerbElement = null;
      selectedPhraseElement = null;
    }

    function selectVerb(element, pair) {
      if (!gameRunning) return;
      if (selectedVerb && selectedVerb.id === pair.id) {
        element.classList.remove("selected");
        selectedVerb = null;
        selectedVerbElement = null;
        return;
      }
      container.querySelectorAll("#verbs .word").forEach(w => w.classList.remove("selected"));
      element.classList.add("selected");
      selectedVerb = pair;
      selectedVerbElement = element;
      checkMatch();
    }

    function selectPhrase(element, pair) {
      if (!gameRunning) return;
      if (selectedPhrase && selectedPhrase.id === pair.id) {
        element.classList.remove("selected");
        selectedPhrase = null;
        selectedPhraseElement = null;
        return;
      }
      container.querySelectorAll("#phrases .word").forEach(w => w.classList.remove("selected"));
      element.classList.add("selected");
      selectedPhrase = pair;
      selectedPhraseElement = element;
      checkMatch();
    }

    // --- MATCH CHECKING (1:1 by id) ---
    function checkMatch() {
      if (!selectedVerb || !selectedPhrase) return;

      totalAttempts++;

      const vEl = selectedVerbElement;
      const pEl = selectedPhraseElement;

      const verbText = selectedVerb.verb;
      const phraseText = selectedPhrase.phrase;

      const isMatch = selectedVerb.id === selectedPhrase.id;

      if (isMatch) {
        correctMatches++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        score += 1 * combo;

        scoreLabel.textContent = score;
        comboLabel.textContent = combo + "x";

        vEl.classList.add("correct");
        pEl.classList.add("correct");

        setTimeout(() => {
          vEl.classList.add("vanish");
          pEl.classList.add("vanish");
        }, 140);

        speakText(`${verbText} ${phraseText}`);

        let feedbackMsg = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
        if (combo > 2) feedbackMsg = `🔥 ${combo}x Streak!`;
        showFloatingFeedback(pEl, feedbackMsg);

        if (combo > 0 && combo % 5 === 0) {
          if (gameMode === "rush") {
            triggerTimeFreeze();
          } else {
            playSound("bonus");
          }
        } else {
          playSound("match");
        }

        gameRunning = false;

        setTimeout(() => {
          activePairs = activePairs.filter(p => p.id !== selectedVerb.id);

          if (remainingPairs.length > 0) {
            while (activePairs.length < ACTIVE_PAIRS && remainingPairs.length > 0) {
              addRandomPair();
            }
            clearSelections();
            renderBoard();
            gameRunning = true;
          } else if (activePairs.length > 0) {
            clearSelections();
            renderBoard();
            gameRunning = true;
          } else {
            endGame(true);
          }
        }, 520);

      } else {
        mistakes.push({ verb: verbText, phrase: phraseText });

        combo = 0;
        comboLabel.textContent = "0x";
        playSound("wrong");

        vEl.classList.add("wrong");
        pEl.classList.add("wrong");

        if (gameMode === "streak") {
          setTimeout(() => endGame(false), 400);
          return;
        }

        gameRunning = false;
        setTimeout(() => {
          clearSelections();
          gameRunning = true;
        }, 400);
      }
    }
  }

  // Expose a single, namespaced hook so the page-level script can
  // lazily start the game the first time it's revealed.
  window.MatchRushEmbed = { init: initMatchRush };
})();
