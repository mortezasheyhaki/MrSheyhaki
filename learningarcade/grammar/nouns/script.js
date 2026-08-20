/* =========================================================
   SINGULAR & PLURAL — MATCH RUSH
   Mr. Sheyhaki's Learning Arcade
   Scoped Game & Cabinet Logic
========================================================= */

(function () {
  "use strict";

  const container = document.getElementById("matchRushGame");
  if (!container) return;

  let initialized = false;

  function initMatchRush() {
    if (initialized) return;
    initialized = true;

    /* NOUNS DATA */
    const NOUNS = [
      { singular: "a cell phone", plural: "cell phones" },
      { singular: "a watch", plural: "watches" },
      { singular: "a tablet", plural: "tablets" },
      { singular: "a wallet", plural: "wallets" },
      { singular: "a change purse", plural: "change purses" },
      { singular: "a pencil", plural: "pencils" },
      { singular: "a notebook", plural: "notebooks" },
      { singular: "a glass", plural: "glasses" },
      { singular: "a photo", plural: "photos" },
      { singular: "a charger", plural: "chargers" },
      { singular: "an ID card", plural: "ID cards" },
      { singular: "a passport", plural: "passports" },
      { singular: "an umbrella", plural: "umbrellas" },
      { singular: "a camera", plural: "cameras" },
      { singular: "a credit card", plural: "credit cards" },
      { singular: "a debit card", plural: "debit cards" },
      { singular: "a key", plural: "keys" },
      { singular: "a newspaper", plural: "newspapers" },
      { singular: "a child", plural: "children" },
      { singular: "a man", plural: "men" },
      { singular: "a woman", plural: "women" },
      { singular: "a person", plural: "people" }
    ];

    const ACTIVE_PAIRS = 5;

    /* DOM ELEMENTS */
    const backBtn = container.querySelector("#backBtn");
    const restartBtn = container.querySelector("#restartBtn");
    const homeScreen = container.querySelector("#homeScreen");
    const gameScreen = container.querySelector("#gameScreen");
    const gameOverModal = container.querySelector("#gameOverModal");

    const singularDiv = container.querySelector("#singular");
    const pluralDiv = container.querySelector("#plural");

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

    const ttsToggleBtn = container.querySelector("#ttsToggleBtn");
    const darkModeBtn = container.querySelector("#darkModeBtn");
    const modeSelect = container.querySelector("#modeSelect");
    const hintBtn = container.querySelector("#hintBtn");
    const shuffleBtn = container.querySelector("#shuffleBtn");

    /* GAME STATE */
    let gameMode = "rush";
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let totalAttempts = 0;
    let correctMatches = 0;
    let mistakes = [];

    let timeLeft = 90;
    let timer = null;
    let gameRunning = false;
    let isProcessingMatch = false;
    let ttsEnabled = true;

    let activePairs = [];
    let remainingPairs = [];

    let selectedSingular = null;
    let selectedPlural = null;
    let selectedSingularElement = null;
    let selectedPluralElement = null;

    let singularOrder = [];
    let pluralOrder = [];

    /* SHUFFLE HELPER */
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    /* SPEECH SYNTHESIS */
    function speakText(text) {
      if (!ttsEnabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }

    /* AUDIO SYNTHESIZER (WEB AUDIO API) */
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
          [659.25, 0.07, "square", 0.1],
          [783.99, 0.07, "square", 0.1],
          [1046.5, 0.12, "triangle", 0.09]
        ],
        wrong: [
          [220, 0.09, "sawtooth", 0.08],
          [155, 0.16, "square", 0.07]
        ],
        bonus: [
          [523.25, 0.06, "square", 0.09],
          [659.25, 0.06, "square", 0.09],
          [783.99, 0.06, "square", 0.09],
          [1046.5, 0.18, "triangle", 0.1]
        ],
        victory: [
          [523.25, 0.08, "square", 0.09],
          [659.25, 0.08, "square", 0.09],
          [783.99, 0.08, "square", 0.09],
          [1046.5, 0.25, "triangle", 0.1]
        ],
        gameover: [
          [330, 0.12, "square", 0.08],
          [247, 0.14, "square", 0.08],
          [196, 0.24, "sawtooth", 0.07]
        ]
      };

      (patterns[soundType] || []).forEach(([freq, duration, type, volume], i) => {
        setTimeout(() => {
          try {
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
          } catch (e) {
            // Audio Context restriction silent fallback
          }
        }, i * 75);
      });
    }

    /* HIGH SCORE STORAGE */
    function highScoreKey() {
      return "singular_plural_match_high_scores";
    }

    function updateHighScoreDisplay() {
      const highScores = JSON.parse(localStorage.getItem(highScoreKey()) || "{}");
      const best = highScores[gameMode] || 0;
      if (homeHighScore) homeHighScore.textContent = best;
    }

    /* FLOATING SCORE FEEDBACK */
    function createFloatingFeedback(points, targetEl) {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const popup = document.createElement("div");
      popup.className = "floating-feedback";
      popup.textContent = `+${points}`;
      popup.style.left = `${rect.left + rect.width / 2}px`;
      popup.style.top = `${rect.top}px`;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 800);
    }

    /* EVENT BINDINGS */
    if (modeSelect) {
      modeSelect.onchange = () => {
        gameMode = modeSelect.value;
        updateHighScoreDisplay();
      };
    }

    if (backBtn) {
  backBtn.onclick = () => {
    if (gameRunning) {
      if (timer) clearInterval(timer);
      gameRunning = false;
      clearSelections();
    }
    gameScreen.style.display = "none";
    gameScreen.classList.remove("is-active");
    homeScreen.style.display = "flex";
  };
}

    if (startBtn) {
      startBtn.onclick = () => {
        if (modeSelect) gameMode = modeSelect.value;
        homeScreen.style.display = "none";
        gameScreen.style.display = "flex";
        gameScreen.classList.add("is-active");
        startGame();
      };
    }

    if (restartBtn) {
      restartBtn.onclick = () => {
        gameOverModal.style.display = "none";
        startGame();
      };
    }

    if (ttsToggleBtn) {
      ttsToggleBtn.onclick = () => {
        ttsEnabled = !ttsEnabled;
        ttsToggleBtn.textContent = ttsEnabled ? "🔊" : "🔇";
        ttsToggleBtn.setAttribute("aria-label", ttsEnabled ? "Sound on" : "Sound off");
        if (!ttsEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
      };
    }

    if (darkModeBtn) {
      darkModeBtn.onclick = () => {
        container.classList.toggle("light");
        const isLight = container.classList.contains("light");
        darkModeBtn.textContent = isLight ? "☀️" : "🌙";
      };
    }

    if (hintBtn) {
      hintBtn.onclick = () => {
        if (!gameRunning || isProcessingMatch || !activePairs.length) return;
        const target = activePairs[Math.floor(Math.random() * activePairs.length)];

        if (gameMode === "rush") {
          timeLeft = Math.max(1, timeLeft - 5);
          timerLabel.textContent = timeLeft;
        }

        container.querySelectorAll("#singular .word").forEach((el) => {
          if (el.dataset.id === String(target.id)) el.classList.add("selected");
        });
        container.querySelectorAll("#plural .word").forEach((el) => {
          if (el.dataset.id === String(target.id)) el.classList.add("selected");
        });

        setTimeout(clearSelections, 1100);
      };
    }

    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        if (!gameRunning || isProcessingMatch) return;
        singularOrder = [];
        pluralOrder = [];
        renderBoard(true);
        clearSelections();
      };
    }

    /* GAME LOOP & MANAGEMENT */
    function startGame() {
      score = 0;
      combo = 0;
      maxCombo = 0;
      totalAttempts = 0;
      correctMatches = 0;
      mistakes = [];
      isProcessingMatch = false;

      timeLeft = gameMode === "rush" ? 90 : 0;
      scoreLabel.textContent = "0";
      comboLabel.textContent = "0x";
      timerLabel.textContent = gameMode === "zen" ? "∞" : timeLeft;

      if (timer) clearInterval(timer);
      gameRunning = true;

      if (gameMode === "rush") {
        timer = setInterval(updateTimer, 1000);
      }

      remainingPairs = NOUNS.map((noun, index) => ({
        id: index + 1,
        singular: noun.singular,
        plural: noun.plural
      }));

      shuffle(remainingPairs);
      activePairs = [];

      for (let i = 0; i < ACTIVE_PAIRS; i++) {
        addRandomPair();
      }

      singularOrder = [];
      pluralOrder = [];
      renderBoard(true);
    }

    function updateTimer() {
      if (!gameRunning) return;
      timeLeft--;
      timerLabel.textContent = timeLeft;
      if (timeLeft <= 0) endGame(false);
    }

    function endGame(isVictory = false) {
      if (timer) clearInterval(timer);
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
        modalTitle.textContent = isVictory
          ? "🏆 Board Cleared!"
          : gameMode === "streak"
          ? "💥 Streak Broken!"
          : "⏰ Time's Up!";
      }

      modalFinalScore.textContent = score;
      modalBestScore.textContent = Math.max(score, currentBest);
      if (newHighTag) newHighTag.style.display = isNewHigh ? "block" : "none";

      const accuracy = totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0;
      accuracyStat.textContent = accuracy + "%";
      maxComboStat.textContent = maxCombo + "x";

      if (mistakeListDiv) {
        mistakeListDiv.innerHTML = "";
        if (!mistakes.length) {
          mistakeListDiv.innerHTML = "<p class='no-mistakes'>No mistakes — excellent!</p>";
        } else {
          const seen = new Set();
          mistakes.forEach((mistake) => {
            const key = mistake.singular + "→" + mistake.plural;
            if (seen.has(key)) return;
            seen.add(key);
            const row = document.createElement("div");
            row.className = "mistake-item";
            row.innerHTML = `<strong>${mistake.singular}</strong> → <span>${mistake.plural}</span>`;
            mistakeListDiv.appendChild(row);
          });
        }
      }

      gameOverModal.style.display = "flex";
      updateHighScoreDisplay();
    }

    function addRandomPair() {
      if (!remainingPairs.length) return;
      const index = Math.floor(Math.random() * remainingPairs.length);
      const pair = remainingPairs.splice(index, 1)[0];
      activePairs.push(pair);
    }

    function arraysAligned(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] === b[i]) return true;
      }
      return false;
    }

    function createBoardOrders(fullShuffle) {
      const ids = activePairs.map((pair) => pair.id);

      if (fullShuffle || !singularOrder.length) {
        singularOrder = ids.slice();
        pluralOrder = ids.slice();
        shuffle(singularOrder);
        shuffle(pluralOrder);
      } else {
        const live = new Set(ids);
        singularOrder = singularOrder.filter((id) => live.has(id));
        pluralOrder = pluralOrder.filter((id) => live.has(id));

        const newIds = ids.filter((id) => !singularOrder.includes(id));
        newIds.forEach((id) => {
          const singularIndex = Math.floor(Math.random() * (singularOrder.length + 1));
          singularOrder.splice(singularIndex, 0, id);

          let pluralIndex = Math.floor(Math.random() * (pluralOrder.length + 1));
          if (pluralOrder[pluralIndex] === id && pluralOrder.length > 0) {
            pluralIndex = (pluralIndex + 1 + Math.floor(Math.random() * Math.max(1, pluralOrder.length))) % (pluralOrder.length + 1);
          }
          pluralOrder.splice(pluralIndex, 0, id);
        });
      }

      if (singularOrder.length > 1) {
        let tries = 0;
        while (arraysAligned(singularOrder, pluralOrder) && tries < 30) {
          shuffle(pluralOrder);
          tries++;
        }
        if (arraysAligned(singularOrder, pluralOrder)) {
          pluralOrder.push(pluralOrder.shift());
        }
      }
    }

    function renderBoard(fullShuffle = false) {
      createBoardOrders(fullShuffle);
      const byId = {};
      activePairs.forEach((pair) => {
        byId[pair.id] = pair;
      });

      singularDiv.innerHTML = "";
      pluralDiv.innerHTML = "";

      singularOrder.forEach((id) => {
        const pair = byId[id];
        if (!pair) return;
        const div = document.createElement("div");
        div.className = "word";
        div.dataset.id = pair.id;
        div.textContent = pair.singular;
        div.setAttribute("role", "button");
        div.setAttribute("tabindex", "0");
        div.setAttribute("aria-label", `Singular: ${pair.singular}`);

        div.onclick = () => selectSingular(div, pair);
        div.onkeydown = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectSingular(div, pair);
          }
        };
        singularDiv.appendChild(div);
      });

      pluralOrder.forEach((id) => {
        const pair = byId[id];
        if (!pair) return;
        const div = document.createElement("div");
        div.className = "word";
        div.dataset.id = pair.id;
        div.textContent = pair.plural;
        div.setAttribute("role", "button");
        div.setAttribute("tabindex", "0");
        div.setAttribute("aria-label", `Plural: ${pair.plural}`);

        div.onclick = () => selectPlural(div, pair);
        div.onkeydown = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectPlural(div, pair);
          }
        };
        pluralDiv.appendChild(div);
      });
    }

    /* MATCH SELECTION LOGIC */
    function selectSingular(element, pair) {
      if (!gameRunning || isProcessingMatch) return;
      speakText(pair.singular);

      if (selectedSingularElement) {
        selectedSingularElement.classList.remove("selected");
      }

      selectedSingular = pair;
      selectedSingularElement = element;
      element.classList.add("selected");

      checkMatch();
    }

    function selectPlural(element, pair) {
      if (!gameRunning || isProcessingMatch) return;
      speakText(pair.plural);

      if (selectedPluralElement) {
        selectedPluralElement.classList.remove("selected");
      }

      selectedPlural = pair;
      selectedPluralElement = element;
      element.classList.add("selected");

      checkMatch();
    }

    function checkMatch() {
      if (!selectedSingular || !selectedPlural) return;

      totalAttempts++;

      if (selectedSingular.id === selectedPlural.id) {
        isProcessingMatch = true;
        correctMatches++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        const earnedPoints = 10 + combo * 2;
        score += earnedPoints;
        scoreLabel.textContent = score;
        comboLabel.textContent = combo + "x";

        createFloatingFeedback(earnedPoints, selectedPluralElement);
        playSound("match");

        if (selectedSingularElement) selectedSingularElement.classList.add("correct");
        if (selectedPluralElement) selectedPluralElement.classList.add("correct");

        setTimeout(() => {
          if (selectedSingularElement) selectedSingularElement.classList.add("vanish");
          if (selectedPluralElement) selectedPluralElement.classList.add("vanish");

          setTimeout(() => {
            activePairs = activePairs.filter((p) => p.id !== selectedSingular.id);

            if (remainingPairs.length > 0) {
              addRandomPair();
            }

            if (activePairs.length === 0 && remainingPairs.length === 0) {
              endGame(true);
            } else {
              renderBoard(false);
              clearSelections();
            }
            isProcessingMatch = false;
          }, 220);
        }, 280);
      } else {
        isProcessingMatch = true;
        mistakes.push(selectedSingular);
        playSound("wrong");

        if (gameMode === "streak") {
          endGame(false);
          return;
        }

        combo = 0;
        comboLabel.textContent = "0x";

        if (selectedSingularElement) selectedSingularElement.classList.add("wrong");
        if (selectedPluralElement) selectedPluralElement.classList.add("wrong");

        setTimeout(() => {
          clearSelections();
          isProcessingMatch = false;
        }, 500);
      }
    }

    function clearSelections() {
      if (selectedSingularElement) {
        selectedSingularElement.classList.remove("selected", "wrong", "correct", "vanish");
      }
      if (selectedPluralElement) {
        selectedPluralElement.classList.remove("selected", "wrong", "correct", "vanish");
      }
      selectedSingular = null;
      selectedPlural = null;
      selectedSingularElement = null;
      selectedPluralElement = null;
    }

    updateHighScoreDisplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMatchRush);
  } else {
    initMatchRush();
  }
})();