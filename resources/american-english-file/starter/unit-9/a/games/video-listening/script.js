/* =========================================================
   INTERACTIVE VIDEO PLAYER - Listening Practice
   Listen prompt appears 7 s before the pause point,
   then the video pauses for the multiple-choice answer.

   listenTime = when the "Listen carefully" prompt appears
   time       = when the video pauses and answer options show
========================================================= */

const questions = [
    {
        time: 30,          // after Mrs. Mifflin (0:29)
        listenTime: 23,
        question: "Mr. Mifflin is fixing his ___ , and Mrs. Mifflin is painting the ___.",
        options: ["car / garage", "computer / garage", "computer / room", "car / room"],
        answer: 1          // computer / garage
    },
    {
        time: 69,          // after 1:08
        listenTime: 62,
        question: "Mrs. Miller is busy and she’s cleaning the ___ , and Mr. Miller is doing ___.",
        options: ["attic / housework", "her room / exercise", "attic / exercise", "her room / housework"],
        answer: 2          // attic / exercise
    },
    {
        time: 107,         // after 1:46
        listenTime: 100,
        question: "Mr. Ming is washing ___ , and Mrs. Ming is ___.",
        options: ["his car / walking the dog", "the windows / feeding the dog", "the windows / walking the dog", "his car / feeding the dog"],
        answer: 2          // the windows / walking the dog
    },
    {
        time: 127,         // after 2:06
        listenTime: 120,
        question: "Lisa is talking to ___.",
        options: ["customers", "her mother"],
        answer: 0          // customers
    },
    {
        time: 155,         // after 2:34
        listenTime: 148,
        question: "Denis’s wife is ___.",
        options: ["sleeping", "feeding the baby"],
        answer: 1          // feeding the baby
    }
];

// Scoring: full points on the first try, half after a wrong guess
const POINTS_FIRST_TRY = 100;
const POINTS_RETRY = 50;


/* =========================
   ELEMENTS
========================= */

const $ = (id) => document.getElementById(id);

const video = $("videoPlayer");
const videoWrapper = $("videoWrapper");
const videoError = $("videoError");
const questionOverlay = $("questionOverlay");
const questionNumber = $("questionNumber");
const questionText = $("questionText");
const answerOptions = $("answerOptions");
const feedback = $("feedback");
const continueButton = $("continueButton");
const listenTimer = $("listenTimer");
const timerValue = $("timerValue");
const scoreElement = $("score");
const questionProgress = $("questionProgress");
const statusElement = $("status");
const currentTimeElement = $("currentTime");
const durationElement = $("duration");
const progressBar = $("progressBar");
const fullscreenButton = $("fullscreenButton");
const completionScreen = $("completionScreen");
const finalScore = $("finalScore");
const finalDetail = $("finalDetail");
const restartButton = $("restartButton");


/* =========================
   STATE
========================= */

let nextQuestionIndex = 0;     // first question not yet started
let currentQuestion = null;    // { question, index, phase: 'listen'|'answer', wrongCount, done }
let score = 0;
let answeredQuestions = 0;
let firstTryCorrect = 0;


/* =========================
   HELPERS
========================= */

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    seconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(seconds / 60);
    return minutes + ":" + String(seconds % 60).padStart(2, "0");
}

function setStatus(text) {
    statusElement.textContent = text;
}

function setFeedback(text, type = "") {
    feedback.textContent = text;
    feedback.className = "feedback" + (type ? " " + type : "");
}

function updateScore() {
    scoreElement.textContent = score;
    questionProgress.textContent = answeredQuestions + " / " + questions.length;
}

function updateTimer(secondsLeft) {
    timerValue.textContent = Math.max(0, Math.ceil(secondsLeft));
}

function setQuestionHeading(index) {
    questionNumber.textContent = "Question " + (index + 1) + " of " + questions.length;
}

function resetAnswerArea() {
    answerOptions.innerHTML = "";
    setFeedback("");
    continueButton.classList.add("hidden");
}

function hideOverlay() {
    questionOverlay.classList.add("hidden");
    questionOverlay.classList.remove("listen-phase");
    listenTimer.classList.add("hidden");
}

// The furthest point the viewer may jump to without skipping a question
function getGateTime() {
    if (currentQuestion) return currentQuestion.question.time;
    if (nextQuestionIndex < questions.length) return questions[nextQuestionIndex].listenTime;
    return null;
}


/* =========================
   LISTEN PHASE (video keeps playing)
========================= */

function showListenPrompt(index) {
    const question = questions[index];

    currentQuestion = {
        question,
        index,
        phase: "listen",
        wrongCount: 0,
        done: false
    };

    setQuestionHeading(index);
    questionText.textContent = question.question;
    resetAnswerArea();

    listenTimer.classList.remove("hidden");
    updateTimer(question.time - video.currentTime);

    questionOverlay.classList.add("listen-phase");
    questionOverlay.classList.remove("hidden");

    setStatus("Listen carefully…");
}


/* =========================
   ANSWER PHASE (video pauses)
========================= */

function showAnswerOptions() {
    if (!currentQuestion || currentQuestion.phase !== "listen") return;

    currentQuestion.phase = "answer";
    video.pause();

    listenTimer.classList.add("hidden");
    questionOverlay.classList.remove("listen-phase");

    const { question, index } = currentQuestion;

    setQuestionHeading(index);
    questionText.textContent = question.question;
    resetAnswerArea();

    question.options.forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-button";

        const letter = document.createElement("span");
        letter.className = "answer-letter";
        letter.textContent = String.fromCharCode(65 + optionIndex);

        const text = document.createElement("span");
        text.className = "answer-text";
        text.textContent = option;

        button.append(letter, text);
        button.addEventListener("click", () => selectAnswer(optionIndex, button));
        answerOptions.appendChild(button);
    });

    setStatus("Choose an answer");
}


/* =========================
   SELECT ANSWER
========================= */

function selectAnswer(selectedIndex, selectedButton) {
    if (!currentQuestion || currentQuestion.phase !== "answer" || currentQuestion.done) return;

    const allButtons = answerOptions.querySelectorAll(".answer-button");

    // CORRECT
    if (selectedIndex === currentQuestion.question.answer) {
        currentQuestion.done = true;

        const firstTry = currentQuestion.wrongCount === 0;
        const points = firstTry ? POINTS_FIRST_TRY : POINTS_RETRY;

        if (firstTry) firstTryCorrect++;
        score += points;
        answeredQuestions++;

        selectedButton.classList.add("correct");
        allButtons.forEach(b => (b.disabled = true));

        setFeedback("✓ Correct! +" + points + " points", "success");
        continueButton.classList.remove("hidden");
        continueButton.focus({ preventScroll: true });

        setStatus("Correct!");
        updateScore();
        return;
    }

    // WRONG – allow retry
    currentQuestion.wrongCount++;
    selectedButton.classList.add("wrong");
    selectedButton.disabled = true;
    setFeedback("✗ Not quite. Try again.", "error");
    setStatus("Try again");
}


/* =========================
   CONTINUE
========================= */

function resumeAfterQuestion() {
    if (!currentQuestion || !currentQuestion.done) return;

    nextQuestionIndex = currentQuestion.index + 1;
    currentQuestion = null;
    hideOverlay();

    if (nextQuestionIndex < questions.length) {
        setStatus("Watching");
        video.play().catch(() => {});
        return;
    }

    finishVideo();
}

continueButton.addEventListener("click", resumeAfterQuestion);


/* =========================
   FINISH
========================= */

function finishVideo() {
    video.pause();
    hideOverlay();
    currentQuestion = null;

    setStatus("Complete!");
    finalScore.textContent = "Score: " + score;
    finalDetail.textContent =
        "Correct on the first try: " + firstTryCorrect + " of " + questions.length;

    completionScreen.classList.remove("hidden");
    completionScreen.scrollIntoView({ behavior: "smooth", block: "center" });
}


/* =========================
   VIDEO EVENTS
========================= */

video.addEventListener("timeupdate", () => {
    const t = video.currentTime;

    if (Number.isFinite(video.duration) && video.duration > 0) {
        progressBar.style.width = Math.min(100, (t / video.duration) * 100) + "%";
    }
    currentTimeElement.textContent = formatTime(t);

    // Question in progress
    if (currentQuestion) {
        if (currentQuestion.phase === "listen") {
            updateTimer(currentQuestion.question.time - t);
            if (t >= currentQuestion.question.time) showAnswerOptions();
        }
        return;
    }

    // Start the next question's listen prompt when its time comes
    if (nextQuestionIndex < questions.length && t >= questions[nextQuestionIndex].listenTime) {
        showListenPrompt(nextQuestionIndex);
        if (t >= questions[nextQuestionIndex].time) showAnswerOptions();
    }
});

// Stop viewers from jumping over unanswered questions
video.addEventListener("seeking", () => {
    const gate = getGateTime();
    if (gate !== null && video.currentTime > gate + 0.25) {
        video.currentTime = gate;
        setStatus("Listen first – no skipping ahead");
        setTimeout(() => {
            if (!currentQuestion && nextQuestionIndex < questions.length) {
                setStatus(video.paused ? "Ready" : "Watching");
            }
        }, 1800);
    }
});

video.addEventListener("loadedmetadata", () => {
    durationElement.textContent = formatTime(video.duration);
});

video.addEventListener("play", () => {
    if (!currentQuestion) setStatus("Watching");
});

video.addEventListener("ended", () => {
    if (currentQuestion && currentQuestion.phase === "listen") {
        showAnswerOptions();
        return;
    }
    if (!currentQuestion) finishVideo();
});

// Video file failed to load
video.querySelector("source").addEventListener("error", () => {
    videoError.classList.remove("hidden");
    setStatus("Video unavailable");
});


/* =========================
   KEYBOARD (desktop)
========================= */

document.addEventListener("keydown", (e) => {
    if (!currentQuestion || currentQuestion.done) {
        if (e.key === "Enter" && currentQuestion && currentQuestion.done &&
            document.activeElement === document.body) {
            resumeAfterQuestion();
        }
        return;
    }
    if (currentQuestion.phase !== "answer") return;

    if (/^[1-4]$/.test(e.key)) {
        const button = answerOptions.querySelectorAll(".answer-button")[Number(e.key) - 1];
        if (button && !button.disabled) button.click();
    }
});


/* =========================
   FULLSCREEN
   Uses the whole player so the questions stay visible.
   (iPhone Safari only allows native video fullscreen,
   so the button is hidden there.)
========================= */

const canFullscreen = Boolean(document.fullscreenEnabled && videoWrapper.requestFullscreen);

if (canFullscreen) {
    fullscreenButton.classList.remove("hidden");
}

fullscreenButton.addEventListener("click", async () => {
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await videoWrapper.requestFullscreen();
        }
    } catch (err) {
        console.warn("Fullscreen unavailable:", err);
    }
});

document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "Exit fullscreen" : "Fullscreen";
});


/* =========================
   RESTART
========================= */

restartButton.addEventListener("click", () => {
    score = 0;
    answeredQuestions = 0;
    firstTryCorrect = 0;
    nextQuestionIndex = 0;
    currentQuestion = null;

    completionScreen.classList.add("hidden");
    videoError.classList.add("hidden");
    hideOverlay();
    resetAnswerArea();

    progressBar.style.width = "0%";
    video.currentTime = 0;
    updateScore();
    setStatus("Ready");

    video.play().catch(() => {});
});


/* =========================
   INIT
========================= */

updateScore();
setStatus("Ready");

if (video.readyState >= 1) {
    durationElement.textContent = formatTime(video.duration);
}
