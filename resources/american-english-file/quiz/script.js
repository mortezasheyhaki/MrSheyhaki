/* =========================================================
   American English File · Multiple Choice Quiz Engine
   ========================================================= */

let currentUnit = null;
let questions = [];
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let gameActive = false;
let currentFilter = "all";
let autoAdvanceTimer = null;

const UNIT_META = {
  1:  { title: "Verb be & Basics", desc: "I'm / you're, countries, numbers 0–10, days of the week" },
  2:  { title: "Questions & Objects", desc: "Be questions, nationalities, everyday classroom items" },
  3:  { title: "This / These & Plurals", desc: "Singular and plural nouns, a/an, small personal items" },
  4:  { title: "Family & Possessives", desc: "My, your, his, her, possessive 's, and descriptive adjectives" },
  5:  { title: "Present Simple (I / They)", desc: "Statements and questions, food, drink, common verbs" },
  6:  { title: "Present Simple (He / She)", desc: "Jobs, daily routines, and adverbs of frequency" },
  7:  { title: "Questions & Dates", desc: "Wh- question order, months, and ordinal numbers" },
  8:  { title: "Can / Can't & Activities", desc: "Ability, permission, and verb + -ing preferences" },
  9:  { title: "Continuous vs. Simple", desc: "Actions right now vs. daily habits, clothes, telling time" },
  10: { title: "There is & Past of be", desc: "Rooms, prepositions of place, was and were" },
  11: { title: "Simple Past (Regular)", desc: "Regular -ed verbs, housework, and past time expressions" },
  12: { title: "Simple Past (Irregular)", desc: "Common irregular past verbs and full course review" }
};

function colorGroupForUnit(unitNum) {
  const n = Number(unitNum);
  const mod = ((n - 1) % 4) + 1;
  return "u" + mod;
}

const unitScreen = document.getElementById("unitScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const unitGrid = document.getElementById("unitGrid");
const emptyUnitsState = document.getElementById("emptyUnitsState");
const visibleUnitsCount = document.getElementById("visibleUnitsCount");
const attemptedCountEl = document.getElementById("attemptedCount");
const avgBestScoreEl = document.getElementById("avgBestScore");
const filterTabs = Array.from(document.querySelectorAll(".quiz-filter-tab"));
const btnShowAllUnits = document.getElementById("btnShowAllUnits");

const currentUnitLabel = document.getElementById("currentUnitLabel");
const currentUnitTopic = document.getElementById("currentUnitTopic");
const questionNumberElement = document.getElementById("questionNumber");
const totalQuestionsElement = document.getElementById("totalQuestions");
const scoreElement = document.getElementById("score");
const progressBar = document.getElementById("progressBar");

const questionTypeElement = document.getElementById("questionType");
const questionTextElement = document.getElementById("questionText");
const questionImageElement = document.getElementById("questionImage");
const answersElement = document.getElementById("answers");
const feedbackElement = document.getElementById("feedback");

const nextButton = document.getElementById("nextButton");
const quitButton = document.getElementById("quitButton");
const retryButton = document.getElementById("retryButton");
const unitsButton = document.getElementById("unitsButton");

document.addEventListener("DOMContentLoaded", function () {
  bindFilters();
  renderUnitPicker();
});

function getBestScore(unitNumber) {
  try {
    const raw = localStorage.getItem("learningArcadeQuizBest_" + unitNumber);
    if (raw === null) return null;
    const val = Number(raw);
    return Number.isFinite(val) ? val : null;
  } catch (e) {
    return null;
  }
}

function saveBestScore(unitNumber, percentage) {
  const oldScore = getBestScore(unitNumber);
  try {
    if (oldScore === null || percentage > oldScore) {
      localStorage.setItem("learningArcadeQuizBest_" + unitNumber, String(percentage));
      return { isNewBest: true, best: percentage };
    }
    return { isNewBest: false, best: oldScore };
  } catch (e) {
    return { isNewBest: false, best: percentage };
  }
}

function bindFilters() {
  filterTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      currentFilter = tab.getAttribute("data-filter") || "all";
      filterTabs.forEach(function (t) {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderUnitPicker();
    });
  });

  if (btnShowAllUnits) {
    btnShowAllUnits.addEventListener("click", function () {
      currentFilter = "all";
      filterTabs.forEach(function (t) {
        const active = t.getAttribute("data-filter") === "all";
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderUnitPicker();
    });
  }
}

function updateSummaryStrip(unitNumbers) {
  let attempted = 0;
  let sumBest = 0;
  unitNumbers.forEach(function (u) {
    const b = getBestScore(u);
    if (b !== null) {
      attempted++;
      sumBest += b;
    }
  });
  if (attemptedCountEl) {
    attemptedCountEl.textContent = attempted + " / " + unitNumbers.length;
  }
  if (avgBestScoreEl) {
    avgBestScoreEl.textContent = attempted > 0 ? Math.round(sumBest / attempted) + "%" : "—";
  }
}

function renderUnitPicker() {
  clearTimeout(autoAdvanceTimer);
  document.body.classList.remove("quiz-playing");
  unitScreen.classList.remove("hidden");
  quizScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  unitGrid.innerHTML = "";

  const unitNumbers = Object.keys(QUIZ_UNITS)
    .map(Number)
    .sort(function (a, b) { return a - b; });

  updateSummaryStrip(unitNumbers);

  let shown = 0;
  unitNumbers.forEach(function (unitNumber) {
    const best = getBestScore(unitNumber);
    if (currentFilter === "1-6" && unitNumber > 6) return;
    if (currentFilter === "7-12" && unitNumber < 7) return;
    if (currentFilter === "attempted" && best === null) return;

    shown++;
    const unitQuestions = Array.isArray(QUIZ_UNITS[unitNumber]) ? QUIZ_UNITS[unitNumber] : [];
    const meta = UNIT_META[unitNumber] || { title: "Unit " + unitNumber, desc: "Grammar & vocabulary review" };
    const padNum = String(unitNumber).padStart(2, "0");
    const colorClass = "aef-" + colorGroupForUnit(unitNumber);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-unit-card " + colorClass;
    button.setAttribute("role", "listitem");

    const statusText = best !== null ? "Best " + best + "%" : "Not started";
    const statusClass = best !== null ? "quiz-unit-status has-best" : "quiz-unit-status";
    const ctaText = best !== null ? "Retake →" : "Start quiz →";

    button.innerHTML =
      '<div class="quiz-unit-top">' +
        '<span class="quiz-unit-bubble">Unit ' + padNum + "</span>" +
        '<span class="' + statusClass + '">' + escapeHtml(statusText) + "</span>" +
      "</div>" +
      '<div class="quiz-unit-body">' +
        "<h2>" + escapeHtml(meta.title) + "</h2>" +
        "<p>" + escapeHtml(meta.desc) + "</p>" +
      "</div>" +
      '<div class="quiz-unit-foot">' +
        '<span class="quiz-unit-qcount">' + unitQuestions.length + " questions</span>" +
        '<span class="quiz-unit-cta">' + ctaText + "</span>" +
      "</div>";

    if (unitQuestions.length === 0) {
      button.disabled = true;
    } else {
      button.addEventListener("click", function () {
        startUnit(unitNumber);
      });
    }

    unitGrid.appendChild(button);
  });

  if (visibleUnitsCount) {
    visibleUnitsCount.textContent = shown + (shown === 1 ? " unit" : " units");
  }
  if (emptyUnitsState) {
    emptyUnitsState.hidden = shown > 0;
  }
}

function applyArenaColor(unitNumber) {
  const cls = "quiz-arena--" + colorGroupForUnit(unitNumber);
  [quizScreen, resultScreen].forEach(function (el) {
    if (!el) return;
    el.classList.remove("quiz-arena--u1", "quiz-arena--u2", "quiz-arena--u3", "quiz-arena--u4");
    el.classList.add(cls);
  });
}

function startUnit(unitNumber) {
  const source = Array.isArray(QUIZ_UNITS[unitNumber]) ? QUIZ_UNITS[unitNumber] : [];
  if (!source.length) return;

  clearTimeout(autoAdvanceTimer);
  currentUnit = unitNumber;
  questions = shuffle([...source]);
  currentQuestion = 0;
  score = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  gameActive = true;

  const meta = UNIT_META[unitNumber] || { title: "Unit " + unitNumber };
  applyArenaColor(unitNumber);

  if (currentUnitLabel) currentUnitLabel.textContent = "Unit " + currentUnit;
  if (currentUnitTopic) currentUnitTopic.textContent = meta.title;
  totalQuestionsElement.textContent = String(questions.length);
  scoreElement.textContent = "0";

  document.body.classList.add("quiz-playing");
  unitScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  if (currentQuestion >= questions.length) {
    finishQuiz();
    return;
  }

  const item = questions[currentQuestion];

  feedbackElement.className = "feedback hidden";
  feedbackElement.textContent = "";
  if (nextButton) nextButton.classList.add("hidden");

  questionNumberElement.textContent = String(currentQuestion + 1);
  totalQuestionsElement.textContent = String(questions.length);

  const progress = (currentQuestion / questions.length) * 100;
  progressBar.style.width = progress + "%";

  if (item.image) {
    questionTypeElement.textContent = "Vocabulary";
  } else {
    questionTypeElement.textContent = detectQuestionType(item.q);
  }

  questionTextElement.textContent = item.q || "";

  if (item.image) {
    questionImageElement.classList.remove("hidden");
    questionImageElement.innerHTML = createQuizPicture(item.image);
  } else {
    questionImageElement.classList.add("hidden");
    questionImageElement.innerHTML = "";
  }

  answersElement.innerHTML = "";
  const options = Array.isArray(item.options) ? item.options : [];
  const randomizedOptions = options.map(function (text, index) {
    return { text: text, originalIndex: index };
  });
  shuffle(randomizedOptions);

  randomizedOptions.forEach(function (option, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.index = String(option.originalIndex);

    button.innerHTML =
      '<span class="answer-letter">' + String.fromCharCode(65 + index) + "</span>" +
      '<span class="answer-label">' + escapeHtml(option.text) + "</span>";

    button.addEventListener("click", function () {
      selectAnswer(button, option.originalIndex, Number(item.answer));
    });

    answersElement.appendChild(button);
  });
}

function selectAnswer(selectedButton, selectedIndex, correctIndex) {
  if (!gameActive) return;

  const buttons = document.querySelectorAll(".answer-button");
  buttons.forEach(function (button) {
    button.disabled = true;
  });

  const isCorrect = selectedIndex === correctIndex;
  if (isCorrect) {
    correctAnswers++;
    score += 100;
    selectedButton.classList.add("correct");
    showFeedback(true, "✓ Correct · +100 points");
  } else {
    wrongAnswers++;
    selectedButton.classList.add("wrong");
    buttons.forEach(function (button) {
      if (Number(button.dataset.index) === correctIndex) {
        button.classList.add("correct-answer");
      }
    });
    showFeedback(false, "✕ Not quite — the correct answer is highlighted.");
  }

  scoreElement.textContent = String(score);

  clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = setTimeout(function () {
    if (!gameActive) return;
    currentQuestion++;
    renderQuestion();
  }, 950);
}

function showFeedback(correct, message) {
  feedbackElement.classList.remove("hidden", "correct", "wrong");
  feedbackElement.classList.add(correct ? "correct" : "wrong");
  feedbackElement.textContent = message;
}

if (nextButton) {
  nextButton.addEventListener("click", function () {
    if (!gameActive) return;
    clearTimeout(autoAdvanceTimer);
    currentQuestion++;
    renderQuestion();
  });
}

if (quitButton) {
  quitButton.addEventListener("click", function () {
    gameActive = false;
    clearTimeout(autoAdvanceTimer);
    renderUnitPicker();
  });
}

function finishQuiz() {
  gameActive = false;
  clearTimeout(autoAdvanceTimer);
  progressBar.style.width = "100%";

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;
  const xp = correctAnswers * 10;

  const bestResult = saveBestScore(currentUnit, percentage);
  saveArcadeProgress(xp);

  const meta = UNIT_META[currentUnit] || { title: "Unit " + currentUnit };
  const resultUnit = document.getElementById("resultUnit");
  const resultTopic = document.getElementById("resultTopic");
  const finalScore = document.getElementById("finalScore");
  const bestScoreNote = document.getElementById("bestScoreNote");
  const correctAnswersElement = document.getElementById("correctAnswers");
  const wrongAnswersElement = document.getElementById("wrongAnswers");
  const earnedXP = document.getElementById("earnedXP");

  if (resultUnit) resultUnit.textContent = String(currentUnit);
  if (resultTopic) resultTopic.textContent = meta.title;
  if (finalScore) finalScore.textContent = percentage + "%";
  if (bestScoreNote) {
    bestScoreNote.textContent = bestResult.isNewBest
      ? "New personal best for Unit " + currentUnit
      : "Personal best: " + bestResult.best + "%";
  }
  if (correctAnswersElement) correctAnswersElement.textContent = String(correctAnswers);
  if (wrongAnswersElement) wrongAnswersElement.textContent = String(wrongAnswers);
  if (earnedXP) earnedXP.textContent = "+" + xp;

  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

if (retryButton) {
  retryButton.addEventListener("click", function () {
    startUnit(currentUnit);
  });
}

if (unitsButton) {
  unitsButton.addEventListener("click", function () {
    renderUnitPicker();
  });
}

function saveArcadeProgress(xp) {
  let player;
  try {
    player = JSON.parse(localStorage.getItem("learningArcadePlayer"));
  } catch (error) {
    player = null;
  }

  if (!player) {
    player = {
      name: "Guest Player",
      xp: 0,
      gamesPlayed: 0,
      streak: 0,
      lastPlayed: null
    };
  }

  player.xp = Number(player.xp || 0) + xp;
  player.gamesPlayed = Number(player.gamesPlayed || 0) + 1;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (player.lastPlayed === today) {
    // unchanged
  } else if (player.lastPlayed === yesterday) {
    player.streak = Number(player.streak || 0) + 1;
    player.lastPlayed = today;
  } else {
    player.streak = 1;
    player.lastPlayed = today;
  }

  try {
    localStorage.setItem("learningArcadePlayer", JSON.stringify(player));
  } catch (error) {
    console.error("Could not save progress:", error);
  }
}

function detectQuestionType(question) {
  const text = String(question || "").toLowerCase();
  if (
    text.includes("which word") ||
    text.includes("what is it") ||
    text.includes("what are they") ||
    text.includes("goes with") ||
    text.includes("opposite of") ||
    text.includes("comes next")
  ) {
    return "Vocabulary";
  }
  return "Grammar";
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createQuizPicture(name) {
  const pictures = {
    bag: "👜",
    glasses: "👓",
    "mobile-phone": "📱",
    camera: "📷",
    photo: "🖼️",
    passport: "🛂",
    watch: "⌚",
    "credit-card": "💳",
    "key-rings": "🔑",
    wallet: "👛",
    chair: "🪑",
    coat: "🧥",
    laptop: "💻",
    door: "🚪",
    window: "🪟",
    paper: "📄",
    book: "📖"
  };

  if (name === "board") {
    return (
      '<div style="display:flex;align-items:center;justify-content:center;min-height:140px;" aria-label="a board">' +
        '<div style="width:240px;height:130px;background:#333;border:8px solid #8b5a2b;border-radius:6px;position:relative;">' +
          '<div style="position:absolute;left:28px;top:28px;color:#fff;font-size:20px;font-family:sans-serif;opacity:.9;">A B C</div>' +
          '<div style="position:absolute;left:28px;top:68px;width:72px;height:3px;background:#fff;transform:rotate(-8deg);"></div>' +
        "</div>" +
      "</div>"
    );
  }

  const emoji = pictures[name] || "🖼️";
  return (
    '<div style="display:flex;align-items:center;justify-content:center;min-height:120px;font-size:78px;" aria-label="' +
      escapeHtml(name) +
    '">' +
      emoji +
    "</div>"
  );
}
