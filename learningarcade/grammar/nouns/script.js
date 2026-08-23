/* =========================================================
   SINGULAR & PLURAL — MATCH (5 vs 5, stay when matched)
   3 rounds × 5 pairs = 15 matches
   Mr. Sheyhaki's Learning Arcade
========================================================= */

(function () {
  "use strict";

  const container = document.getElementById("matchRushGame");
  if (!container) return;

  let initialized = false;

  function initMatchRush() {
    if (initialized) return;
    initialized = true;

    /* NOUNS DATA — at least 15 pairs for 3 rounds */
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

    const PAIRS_PER_ROUND = 5;
    const TOTAL_ROUNDS = 3;
    const TOTAL_MATCHES = PAIRS_PER_ROUND * TOTAL_ROUNDS; // 15

    /* DOM ELEMENTS */
    const backBtn = container.querySelector("#backBtn");
    const restartBtn = container.querySelector("#restartBtn");
    const startBtn = container.querySelector("#startBtn");
    const homeScreen = container.querySelector("#homeScreen");
    const gameScreen = container.querySelector("#gameScreen");
    const gameOverModal = container.querySelector("#gameOverModal");

    const singularDiv = container.querySelector("#singular");
    const pluralDiv = container.querySelector("#plural");

    const scoreLabel = container.querySelector("#score");
    const timerLabel = container.querySelector("#timer");
    const comboLabel = container.querySelector("#combo");
    const roundLabel = container.querySelector("#roundLabel");
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

    let currentRound = 1;
    let deck = [];           // all pairs for this game (15 shuffled)
    let boardPairs = [];     // current 5 pairs on board
    let matchedIds = new Set(); // ids already matched this round (stay on board, muted)

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

    /* SPEECH */
    function speakText(text) {
      if (!ttsEnabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }

    /* AUDIO */
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
          [1046.5, 0.22, "triangle", 0.12]
        ],
        gameover: [
          [196, 0.12, "sawtooth", 0.08],
          [147, 0.2, "square", 0.07]
        ],
        round: [
          [440, 0.06, "square", 0.08],
          [554.37, 0.08, "triangle", 0.09],
          [659.25, 0.12, "triangle", 0.1]
        ]
      };

      const notes = patterns[soundType];
      if (!notes) return;

      try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        let t = ctx.currentTime;
        notes.forEach(([freq, dur, type, vol]) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.02);
          t += dur * 0.85;
        });
      } catch (e) {}
    }

    function highScoreKey() {
      return "singular_plural_match_high_scores";
    }

    function updateHighScoreDisplay() {
      if (!homeHighScore) return;
      try {
        const highScores = JSON.parse(localStorage.getItem(highScoreKey()) || "{}");
        const best = Math.max(
          highScores.rush || 0,
          highScores.zen || 0,
          highScores.streak || 0
        );
        homeHighScore.textContent = best;
      } catch (e) {
        homeHighScore.textContent = "0";
      }
    }

    /* NAV */
    if (backBtn) {
      backBtn.onclick = () => {
        if (gameRunning) {
          if (timer) clearInterval(timer);
          gameRunning = false;
        }
        gameOverModal.style.display = "none";
        gameScreen.style.display = "none";
        homeScreen.style.display = "flex";
        window.location.href = "../";
      };
    }

    if (startBtn) {
      startBtn.onclick = () => {
        gameMode = modeSelect ? modeSelect.value : "rush";
        homeScreen.style.display = "none";
        gameOverModal.style.display = "none";
        gameScreen.style.display = "flex";
        startGame();
      };
    }

    if (restartBtn) {
      restartBtn.onclick = () => {
        gameOverModal.style.display = "none";
        gameScreen.style.display = "flex";
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
        if (!gameRunning || isProcessingMatch) return;
        const unmatched = boardPairs.filter((p) => !matchedIds.has(p.id));
        if (!unmatched.length) return;
        const target = unmatched[Math.floor(Math.random() * unmatched.length)];

        if (gameMode === "rush") {
          timeLeft = Math.max(1, timeLeft - 5);
          timerLabel.textContent = timeLeft;
        }

        container.querySelectorAll("#singular .word:not(.matched)").forEach((el) => {
          if (el.dataset.id === String(target.id)) el.classList.add("selected");
        });
        container.querySelectorAll("#plural .word:not(.matched)").forEach((el) => {
          if (el.dataset.id === String(target.id)) el.classList.add("selected");
        });

        setTimeout(clearSelections, 1100);
      };
    }

    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        if (!gameRunning || isProcessingMatch) return;
        // Only reshuffle unmatched cards' visual order; matched stay in place conceptually
        singularOrder = [];
        pluralOrder = [];
        renderBoard(true);
        clearSelections();
      };
    }

    /* START / ROUNDS */
    function startGame() {
      score = 0;
      combo = 0;
      maxCombo = 0;
      totalAttempts = 0;
      correctMatches = 0;
      mistakes = [];
      isProcessingMatch = false;
      currentRound = 1;
      matchedIds = new Set();

      timeLeft = gameMode === "rush" ? 90 : 0;
      scoreLabel.textContent = "0";
      comboLabel.textContent = "0x";
      if (roundLabel) roundLabel.textContent = "1";
      timerLabel.textContent = gameMode === "zen" ? "∞" : timeLeft;

      if (timer) clearInterval(timer);
      gameRunning = true;

      if (gameMode === "rush") {
        timer = setInterval(updateTimer, 1000);
      }

      // Build deck of exactly TOTAL_MATCHES pairs (or all if fewer)
      const pool = NOUNS.map((noun, index) => ({
        id: index + 1,
        singular: noun.singular,
        plural: noun.plural
      }));
      shuffle(pool);
      deck = pool.slice(0, Math.min(TOTAL_MATCHES, pool.length));

      loadRound();
    }

    function loadRound() {
      matchedIds = new Set();
      const start = (currentRound - 1) * PAIRS_PER_ROUND;
      boardPairs = deck.slice(start, start + PAIRS_PER_ROUND);

      // Always aim for 5 pairs; if short, pull extras from earlier deck (no dups on board)
      if (boardPairs.length < PAIRS_PER_ROUND && deck.length) {
        const have = new Set(boardPairs.map((p) => p.id));
        for (const p of deck) {
          if (boardPairs.length >= PAIRS_PER_ROUND) break;
          if (!have.has(p.id)) {
            boardPairs.push(p);
            have.add(p.id);
          }
        }
      }

      if (!boardPairs.length) {
        endGame(true);
        return;
      }

      if (roundLabel) roundLabel.textContent = String(currentRound);
      singularOrder = [];
      pluralOrder = [];
      renderBoard(true);
      clearSelections();
    }

    function updateTimer() {
      if (!gameRunning) return;
      timeLeft--;
      timerLabel.textContent = timeLeft;
      if (timeLeft <= 0) endGame(false);
    }

    function endGame(isVictory) {
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
          ? "🏆 All Rounds Cleared!"
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

      // Stars for Grammar index cards (0–3, best kept)
      (function saveGameStars() {
        var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
        // Bonus: full clear of 15 matches gets at least 2 stars
        if (isVictory && correctMatches >= TOTAL_MATCHES && stars < 2) stars = 2;
        if (isVictory && correctMatches >= TOTAL_MATCHES && accuracy >= 80) stars = 3;
        var data = {};
        try {
          data = JSON.parse(localStorage.getItem("laGameStars") || "{}") || {};
        } catch (e) {
          data = {};
        }
        var prev = Number(data["nouns"] || 0);
        if (stars > prev) {
          data["nouns"] = stars;
          try {
            localStorage.setItem("laGameStars", JSON.stringify(data));
          } catch (e) {}
        }
      })();

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
            row.innerHTML =
              "<strong>" + mistake.singular + "</strong> → <span>" + mistake.plural + "</span>";
            mistakeListDiv.appendChild(row);
          });
        }
      }

      gameOverModal.style.display = "flex";
      updateHighScoreDisplay();
    }

    function arraysAligned(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] === b[i]) return true;
      }
      return false;
    }

    function createBoardOrders(fullShuffle) {
      const ids = boardPairs.map((pair) => pair.id);

      if (fullShuffle || !singularOrder.length) {
        singularOrder = ids.slice();
        pluralOrder = ids.slice();
        shuffle(singularOrder);
        shuffle(pluralOrder);
      } else {
        const live = new Set(ids);
        singularOrder = singularOrder.filter((id) => live.has(id));
        pluralOrder = pluralOrder.filter((id) => live.has(id));
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

    function renderBoard(fullShuffle) {
      createBoardOrders(fullShuffle);
      const byId = {};
      boardPairs.forEach((pair) => {
        byId[pair.id] = pair;
      });

      singularDiv.innerHTML = "";
      pluralDiv.innerHTML = "";

      singularOrder.forEach((id) => {
        const pair = byId[id];
        if (!pair) return;
        const isMatched = matchedIds.has(pair.id);
        const div = document.createElement("div");
        div.className = "word" + (isMatched ? " matched" : "");
        div.dataset.id = pair.id;
        div.textContent = pair.singular;
        div.setAttribute("role", "button");
        div.setAttribute("tabindex", isMatched ? "-1" : "0");
        div.setAttribute(
          "aria-label",
          (isMatched ? "Matched singular: " : "Singular: ") + pair.singular
        );

        if (!isMatched) {
          div.onclick = () => selectSingular(div, pair);
          div.onkeydown = (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectSingular(div, pair);
            }
          };
        }
        singularDiv.appendChild(div);
      });

      pluralOrder.forEach((id) => {
        const pair = byId[id];
        if (!pair) return;
        const isMatched = matchedIds.has(pair.id);
        const div = document.createElement("div");
        div.className = "word" + (isMatched ? " matched" : "");
        div.dataset.id = pair.id;
        div.textContent = pair.plural;
        div.setAttribute("role", "button");
        div.setAttribute("tabindex", isMatched ? "-1" : "0");
        div.setAttribute(
          "aria-label",
          (isMatched ? "Matched plural: " : "Plural: ") + pair.plural
        );

        if (!isMatched) {
          div.onclick = () => selectPlural(div, pair);
          div.onkeydown = (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectPlural(div, pair);
            }
          };
        }
        pluralDiv.appendChild(div);
      });
    }

    /* MATCH SELECTION */
    function selectSingular(element, pair) {
      if (!gameRunning || isProcessingMatch || matchedIds.has(pair.id)) return;
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
      if (!gameRunning || isProcessingMatch || matchedIds.has(pair.id)) return;
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

        const matchedId = selectedSingular.id;

        setTimeout(() => {
          // Keep cards on board — mark as matched with fade (no remove)
          matchedIds.add(matchedId);

          // Apply matched class on the live elements so fade animation plays
          if (selectedSingularElement) {
            selectedSingularElement.classList.remove("selected");
            selectedSingularElement.classList.add("matched");
            selectedSingularElement.setAttribute("tabindex", "-1");
            selectedSingularElement.onclick = null;
            selectedSingularElement.onkeydown = null;
          }
          if (selectedPluralElement) {
            selectedPluralElement.classList.remove("selected");
            selectedPluralElement.classList.add("matched");
            selectedPluralElement.setAttribute("tabindex", "-1");
            selectedPluralElement.onclick = null;
            selectedPluralElement.onkeydown = null;
          }

          // Clear selection refs without stripping matched/correct classes
          selectedSingular = null;
          selectedPlural = null;
          selectedSingularElement = null;
          selectedPluralElement = null;
          isProcessingMatch = false;

          // All 5 matched this round?
          if (matchedIds.size >= boardPairs.length) {
            if (currentRound >= TOTAL_ROUNDS || correctMatches >= TOTAL_MATCHES) {
              setTimeout(() => endGame(true), 650);
            } else {
              // Next round after fade settles
              currentRound++;
              playSound("round");
              setTimeout(() => loadRound(), 700);
            }
          }
        }, 320);
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

    function createFloatingFeedback(points, el) {
      if (!el) return;
      const float = document.createElement("div");
      float.className = "float-score";
      float.textContent = "+" + points;
      const rect = el.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      float.style.left = rect.left - parentRect.left + rect.width / 2 + "px";
      float.style.top = rect.top - parentRect.top + "px";
      container.appendChild(float);
      setTimeout(() => float.remove(), 900);
    }

    updateHighScoreDisplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMatchRush);
  } else {
    initMatchRush();
  }
})();
