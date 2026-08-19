/* ==========================================
   MATCH RUSH — embedded, isolated game logic
   Adapted from: Vocabulary Match Rush Pro.zip
   Wrapped in an IIFE so nothing leaks into the
   global scope or touches the rest of the site.
   Gameplay, timer, scoring, matching, power-ups,
   modes and review tracker are preserved as-is.
   ========================================== */

(function () {
  "use strict";

  const container = document.getElementById("matchRushGame");
  if (!container) return; // Match Rush markup isn't on this page

  let initialized = false;

  function initMatchRush() {
    if (initialized) return;
    initialized = true;

    // Define ONLY the specified verbs and phrases
    const verbGroupings = {
      "go to": ["bed", "school", "English classes", "work", "the gym"],
      "go to the": ["movies", "beach", "park", "supermarket"],
      "go": ["home", "shopping", "out"],
      "do": ["housework", "homework", "exercise", "yoga"],
      "make": ["dinner", "breakfast", "coffee"],
      "take": ["a bath", "a shower", "a photo"],
      "play": ["tennis", "computer games", "the piano", "football"],
      "read": ["a newspaper", "a book"],
      "listen": ["to music", "to the radio"],
      "watch": ["TV shows", "a movie"],
      "have": ["fast food", "breakfast", "lunch", "dinner"],
      "drink": ["tea", "coffee", "water"],
      "work": ["in a bank", "in an office"],
      "live": ["in an apartment", "in a house", "in a city"]
    };

    // Flatten into playable pool of pairs
    const gameVocabulary = [];
    let idCounter = 1;

    Object.entries(verbGroupings).forEach(([verb, phrases]) => {
      phrases.forEach(phrase => {
        gameVocabulary.push({
          id: idCounter++,
          verb: verb,
          phrase: phrase
        });
      });
    });

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

    const hintBtn = container.querySelector("#hintBtn");
    const shuffleBtn = container.querySelector("#shuffleBtn");
    const freezeBanner = container.querySelector("#freezeBanner");
    if (freezeBanner) freezeBanner.style.display = "none";

    // --- GAME STATE ---
    const ACTIVE_PAIRS = 5;
    let gameMode = "rush"; // "rush", "zen", "streak"
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let totalAttempts = 0;
    let correctMatches = 0;
    let mistakes = []; // [{verb, phrase}]

    let timeLeft = 90;
    let timer = null;
    let isFrozen = false; // freeze removed
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
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for language learners
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

    function playTone(freq, duration, type = "sine") {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }

    function playSound(soundType) {
      // Short 8-bit arcade cues. They use Web Audio so no external sound
      // files are required, while still sounding game-like.
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
      (patterns[soundType] || []).forEach(([freq,duration,type,volume], i) => {
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

    // --- INITIALIZATION ---
    updateHighScoreDisplay();

    startBtn.onclick = () => {
      if (modeSelect) gameMode = modeSelect.value;
      homeScreen.style.display = "none";
      gameScreen.style.display = "block";
      startGame();
    };

    restartBtn.onclick = () => {
      gameOverModal.style.display = "none";
      startGame();
    };

    // Theme is controlled globally by theme.js. Match Rush starts in
    // light mode because the website defaults to light mode.
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

        // Find a matching pair currently on the board
        let matchFound = null;
        for (let pair of activePairs) {
          const valid = verbGroupings[pair.verb] || [];
          const matchingPhraseCard = activePairs.find(p => valid.includes(p.phrase));
          if (matchingPhraseCard) {
            matchFound = { verb: pair.verb, phrase: matchingPhraseCard.phrase };
            break;
          }
        }

        if (matchFound) {
          if (gameMode === "rush") {
            timeLeft = Math.max(1, timeLeft - 5);
            timerLabel.textContent = timeLeft;
          }

          // Temporarily highlight the hint pair
          container.querySelectorAll("#verbs .word").forEach(el => {
            if (el.textContent === matchFound.verb) el.classList.add("selected");
          });
          container.querySelectorAll("#phrases .word").forEach(el => {
            if (el.textContent === matchFound.phrase) el.classList.add("selected");
          });

          setTimeout(() => clearSelections(), 1200);
        }
      };
    }

    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        if (!gameRunning) return;
        // Return active pairs to remaining and draw new ones
        remainingPairs.push(...activePairs);
        activePairs = [];
        for (let i = 0; i < ACTIVE_PAIRS; i++) addRandomPair();
        clearSelections();
        verbOrder = []; phraseOrder = [];
        renderBoard(true);
      };
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
      activePairs = [];

      for (let i = 0; i < ACTIVE_PAIRS; i++) {
        addRandomPair();
      }

      verbOrder = []; phraseOrder = []; renderBoard(true);
    }

    function updateTimer() {
      if (!gameRunning) return;
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

      const highScores = JSON.parse(localStorage.getItem("vocab_high_scores") || "{}");
      const currentBest = highScores[gameMode] || 0;
      let isNewHigh = false;

      if (score > currentBest) {
        highScores[gameMode] = score;
        localStorage.setItem("vocab_high_scores", JSON.stringify(highScores));
        isNewHigh = true;
      }

      const modalTitle = gameOverModal.querySelector("h2");
      if (modalTitle) {
        if (gameMode === "streak" && !isVictory) {
          modalTitle.textContent = "💥 STREAK BROKEN!";
        } else {
          modalTitle.textContent = isVictory ? "🎉 COMPLETED!" : "⏰ TIME'S UP!";
        }
      }

      modalFinalScore.textContent = score;
      modalBestScore.textContent = Math.max(score, currentBest);
      newHighTag.style.display = isNewHigh ? "block" : "none";

      // End-of-Game Review Stats
      const accuracy = totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0;
      if (accuracyStat) accuracyStat.textContent = `${accuracy}%`;
      if (maxComboStat) maxComboStat.textContent = `${maxCombo}x`;

      // Render Mistakes List
      if (mistakeListDiv) {
        mistakeListDiv.innerHTML = "";
        if (mistakes.length === 0) {
          mistakeListDiv.innerHTML = "<p style='color: #4CAF50;'>Perfect round! No mistakes made. 🌟</p>";
        } else {
          const uniqueMistakes = [...new Set(mistakes.map(m => `<b>${m.verb}</b> + <s>${m.phrase}</s>`))];
          uniqueMistakes.forEach(html => {
            const item = document.createElement("div");
            item.className = "mistake-item";
            item.innerHTML = html;
            mistakeListDiv.appendChild(item);
          });
        }
      }

      gameOverModal.style.display = "flex";
      updateHighScoreDisplay();
    }

    function updateHighScoreDisplay() {
      const highScores = JSON.parse(localStorage.getItem("vocab_high_scores") || "{}");
      const mode = modeSelect ? modeSelect.value : "rush";
      if (homeHighScore) homeHighScore.textContent = highScores[mode] || "0";
    }

    if (modeSelect) {
      modeSelect.onchange = () => updateHighScoreDisplay();
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

    // Stable column order (Duolingo-style): unmatched cards stay put; new pairs fill gaps.
    let verbOrder = [];
    let phraseOrder = [];

    function renderBoard(fullShuffle) {
      if (fullShuffle || !verbOrder.length) {
        verbOrder = activePairs.map(p => p.id);
        phraseOrder = activePairs.map(p => p.id);
        shuffle(verbOrder);
        shuffle(phraseOrder);
      } else {
        const live = new Set(activePairs.map(p => p.id));
        verbOrder = verbOrder.filter(id => live.has(id));
        phraseOrder = phraseOrder.filter(id => live.has(id));
        activePairs.forEach(p => {
          if (!verbOrder.includes(p.id)) verbOrder.push(p.id);
          if (!phraseOrder.includes(p.id)) phraseOrder.push(p.id);
        });
      }

      const byId = {};
      activePairs.forEach(p => { byId[p.id] = p; });

      verbsDiv.innerHTML = "";
      phrasesDiv.innerHTML = "";

      verbOrder.forEach(id => {
        const pair = byId[id];
        if (!pair) return;
        const div = document.createElement("div");
        div.className = "word";
        div.textContent = pair.verb;
        div.onclick = () => selectVerb(div, pair);
        verbsDiv.appendChild(div);
      });

      phraseOrder.forEach(id => {
        const pair = byId[id];
        if (!pair) return;
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
      // Appended to the game container (not document.body) so the embedded
      // game never touches the rest of the page's DOM.
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

    // --- MATCH CHECKING ---
    function checkMatch() {
      if (!selectedVerb || !selectedPhrase) return;

      totalAttempts++;

      const vEl = selectedVerbElement;
      const pEl = selectedPhraseElement;

      const verbText = selectedVerb.verb;
      const phraseText = selectedPhrase.phrase;

      const validPhrases = verbGroupings[verbText] || [];
      const isMatch = validPhrases.includes(phraseText);

      if (isMatch) {
        correctMatches++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        score += 1 * combo;

        scoreLabel.textContent = score;
        comboLabel.textContent = combo + "x";

        vEl.classList.add("correct");
        pEl.classList.add("correct");

        // Both matched cards glow, then smoothly fade/scale away.
        // The board is rendered only after the animation finishes.
        setTimeout(() => {
          vEl.classList.add("vanish");
          pEl.classList.add("vanish");
        }, 140);

        // Pronounce correct pair via Text-to-Speech
        speakText(`${verbText} ${phraseText}`);

        let feedbackMsg = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
        if (combo > 2) feedbackMsg = `🔥 ${combo}x Streak!`;
        showFloatingFeedback(pEl, feedbackMsg);

        if (combo > 0 && combo % 5 === 0) {
          playSound("bonus");
        } else {
          playSound("match");
        }

        gameRunning = false;

        setTimeout(() => {
          activePairs = activePairs.filter(p => p.id !== selectedVerb.id && p.id !== selectedPhrase.id);

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
        // Track mistake for review
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
  // lazily start the game the first time it's revealed, without
  // creating any other global variables.
  window.MatchRushEmbed = { init: initMatchRush };
})();
