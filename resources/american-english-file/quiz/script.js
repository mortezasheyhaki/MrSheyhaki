/* =========================================
   LEARNING ARCADE
   MULTIPLE CHOICE
   GAME ENGINE
========================================= */


/* =========================================
   GAME STATE
========================================= */

let currentUnit = null;

let questions = [];

let currentQuestion = 0;

let score = 0;

let correctAnswers = 0;

let wrongAnswers = 0;

let gameActive = false;


/* =========================================
   ELEMENTS
========================================= */

const unitScreen =
    document.getElementById("unitScreen");

const quizScreen =
    document.getElementById("quizScreen");

const resultScreen =
    document.getElementById("resultScreen");

const unitGrid =
    document.getElementById("unitGrid");

const currentUnitElement =
    document.getElementById("currentUnit");

const questionNumberElement =
    document.getElementById("questionNumber");

const totalQuestionsElement =
    document.getElementById("totalQuestions");

const scoreElement =
    document.getElementById("score");

const progressBar =
    document.getElementById("progressBar");

const questionTypeElement =
    document.getElementById("questionType");

const questionTextElement =
    document.getElementById("questionText");

const questionImageElement =
    document.getElementById("questionImage");

const answersElement =
    document.getElementById("answers");

const feedbackElement =
    document.getElementById("feedback");

const nextButton =
    document.getElementById("nextButton");

const quitButton =
    document.getElementById("quitButton");

const retryButton =
    document.getElementById("retryButton");

const unitsButton =
    document.getElementById("unitsButton");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderUnitPicker();

        loadTheme();

    }
);


/* =========================================
   UNIT PICKER
========================================= */

function renderUnitPicker() {

    unitScreen.classList.remove(
        "hidden"
    );

    quizScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );

    unitGrid.innerHTML = "";


    const unitNumbers =
        Object.keys(QUIZ_UNITS)
            .map(Number)
            .sort(
                (a, b) => a - b
            );


    unitNumbers.forEach(
        function (unitNumber) {

            const unitQuestions =
                Array.isArray(
                    QUIZ_UNITS[unitNumber]
                )
                    ? QUIZ_UNITS[unitNumber]
                    : [];


            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "unit-card";


            button.innerHTML = `
                <span class="unit-number">
                    UNIT ${unitNumber}
                </span>

                <h3>
                    Unit ${unitNumber}
                </h3>

                <p>
                    ${unitQuestions.length}
                    questions
                </p>

                <span class="unit-arrow">
                    →
                </span>
            `;


            if (
                unitQuestions.length === 0
            ) {

                button.disabled = true;

                button.style.opacity =
                    "0.5";

                button.style.cursor =
                    "not-allowed";

            } else {

                button.addEventListener(
                    "click",
                    function () {

                        startUnit(
                            unitNumber
                        );

                    }
                );

            }


            unitGrid.appendChild(
                button
            );

        }
    );

}


/* =========================================
   START UNIT
========================================= */

function startUnit(unitNumber) {

    const source =
        Array.isArray(
            QUIZ_UNITS[unitNumber]
        )
            ? QUIZ_UNITS[unitNumber]
            : [];


    if (!source.length) {
        return;
    }


    currentUnit =
        unitNumber;


    /*
       Make a copy before shuffling.
       This keeps QUIZ_UNITS unchanged.
    */

    questions =
        shuffle(
            [...source]
        );


    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    wrongAnswers = 0;

    gameActive = true;


    currentUnitElement.textContent =
        currentUnit;


    totalQuestionsElement.textContent =
        questions.length;


    scoreElement.textContent =
        "0";


    unitScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );

    quizScreen.classList.remove(
        "hidden"
    );


    renderQuestion();

}


/* =========================================
   RENDER QUESTION
========================================= */

function renderQuestion() {

    if (
        currentQuestion >=
        questions.length
    ) {

        finishQuiz();

        return;

    }


    const item =
        questions[currentQuestion];


    /*
       Clear previous feedback.
    */

    feedbackElement.className =
        "feedback hidden";

    feedbackElement.textContent =
        "";


    /*
       Keep the Next button hidden.
       Questions now advance automatically.
    */

    nextButton.classList.add(
        "hidden"
    );


    /*
       Question number.
    */

    questionNumberElement.textContent =
        currentQuestion + 1;


    totalQuestionsElement.textContent =
        questions.length;


    currentUnitElement.textContent =
        currentUnit;


    /*
       Progress bar.
    */

    const progress =
        (
            currentQuestion /
            questions.length
        ) * 100;


    progressBar.style.width =
        `${progress}%`;


    /*
       Question type.
    */

    if (item.image) {

        questionTypeElement.textContent =
            "VOCABULARY";

    } else {

        questionTypeElement.textContent =
            detectQuestionType(
                item.q
            );

    }


    /*
       Question text.
    */

    questionTextElement.textContent =
        item.q || "";


    /*
       Image.
    */

    if (item.image) {

        questionImageElement.classList.remove(
            "hidden"
        );


        questionImageElement.innerHTML =
            createQuizPicture(
                item.image
            );

    } else {

        questionImageElement.classList.add(
            "hidden"
        );


        questionImageElement.innerHTML =
            "";

    }


    /*
       Answers.
    */

    answersElement.innerHTML =
        "";


    const options =
        Array.isArray(item.options)
            ? item.options
            : [];


    /*
       Randomize answer choices while
       preserving the correct answer.
    */

    const randomizedOptions =
        options.map(
            function (text, index) {

                return {
                    text: text,
                    originalIndex: index
                };

            }
        );


    shuffle(
        randomizedOptions
    );


    randomizedOptions.forEach(
        function (option, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "answer-button";


            button.dataset.index =
                option.originalIndex;


            button.innerHTML = `
                <strong>
                    ${String.fromCharCode(
                        65 + index
                    )}.
                </strong>

                <span>
                    ${escapeHtml(
                        option.text
                    )}
                </span>
            `;


            button.addEventListener(
                "click",
                function () {

                    selectAnswer(
                        button,
                        option.originalIndex,
                        Number(item.answer)
                    );

                }
            );


            answersElement.appendChild(
                button
            );

        }
    );

}


/* =========================================
   ANSWER SELECTION
========================================= */

function selectAnswer(
    selectedButton,
    selectedIndex,
    correctIndex
) {

    if (!gameActive) {
        return;
    }


    /*
       Prevent multiple clicks.
    */

    const buttons =
        document.querySelectorAll(
            ".answer-button"
        );


    buttons.forEach(
        function (button) {

            button.disabled = true;

        }
    );


    const isCorrect =
        selectedIndex === correctIndex;


    /* =====================================
       CORRECT ANSWER
    ===================================== */

    if (isCorrect) {

        correctAnswers++;

        score += 100;


        selectedButton.classList.add(
            "correct"
        );


        showFeedback(
            true,
            "Correct! 🎉 +100 points"
        );

    }


    /* =====================================
       WRONG ANSWER
    ===================================== */

    else {

        wrongAnswers++;


        selectedButton.classList.add(
            "wrong"
        );


        /*
           Highlight the correct answer.
        */

        buttons.forEach(
            function (button) {

                if (
                    Number(
                        button.dataset.index
                    ) === correctIndex
                ) {

                    button.classList.add(
                        "correct-answer"
                    );

                }

            }
        );


        showFeedback(
            false,
            "Not quite! The correct answer is highlighted."
        );

    }


    /*
       Update score.
    */

    scoreElement.textContent =
        score;


    /*
       BOTH CORRECT AND WRONG ANSWERS
       AUTOMATICALLY MOVE TO THE NEXT
       QUESTION AFTER 1 SECOND.
    */

    setTimeout(
        function () {

            if (!gameActive) {
                return;
            }


            currentQuestion++;

            renderQuestion();

        },
        1000
    );

}


/* =========================================
   FEEDBACK
========================================= */

function showFeedback(
    correct,
    message
) {

    feedbackElement.classList.remove(
        "hidden"
    );


    feedbackElement.classList.remove(
        "correct",
        "wrong"
    );


    feedbackElement.classList.add(
        correct
            ? "correct"
            : "wrong"
    );


    feedbackElement.textContent =
        message;

}


/* =========================================
   NEXT BUTTON
   Kept for compatibility with HTML.
   It remains hidden because the game
   automatically advances.
========================================= */

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function () {

            if (!gameActive) {
                return;
            }


            currentQuestion++;

            renderQuestion();

        }
    );

}


/* =========================================
   QUIT / BACK TO UNITS
========================================= */

if (quitButton) {

    quitButton.addEventListener(
        "click",
        function () {

            gameActive = false;

            renderUnitPicker();

        }
    );

}


/* =========================================
   FINISH QUIZ
========================================= */

function finishQuiz() {

    gameActive = false;


    progressBar.style.width =
        "100%";


    const total =
        questions.length;


    const percentage =
        total > 0
            ? Math.round(
                (
                    correctAnswers /
                    total
                ) * 100
            )
            : 0;


    /*
       10 XP for every correct answer.
    */

    const xp =
        correctAnswers * 10;


    const resultUnit =
        document.getElementById(
            "resultUnit"
        );

    const finalScore =
        document.getElementById(
            "finalScore"
        );

    const correctAnswersElement =
        document.getElementById(
            "correctAnswers"
        );

    const wrongAnswersElement =
        document.getElementById(
            "wrongAnswers"
        );

    const earnedXP =
        document.getElementById(
            "earnedXP"
        );


    if (resultUnit) {

        resultUnit.textContent =
            currentUnit;

    }


    if (finalScore) {

        finalScore.textContent =
            percentage + "%";

    }


    if (correctAnswersElement) {

        correctAnswersElement.textContent =
            correctAnswers;

    }


    if (wrongAnswersElement) {

        wrongAnswersElement.textContent =
            wrongAnswers;

    }


    if (earnedXP) {

        earnedXP.textContent =
            "+" + xp;

    }


    /*
       Save best score.
    */

    saveBestScore(
        currentUnit,
        percentage
    );


    /*
       Save arcade progress.
    */

    saveArcadeProgress(
        xp
    );


    quizScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   RETRY
========================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function () {

            startUnit(
                currentUnit
            );

        }
    );

}


/* =========================================
   CHOOSE ANOTHER UNIT
========================================= */

if (unitsButton) {

    unitsButton.addEventListener(
        "click",
        function () {

            renderUnitPicker();

        }
    );

}


/* =========================================
   SAVE BEST SCORE
========================================= */

function saveBestScore(
    unitNumber,
    percentage
) {

    const key =
        "learningArcadeQuizBest_" +
        unitNumber;


    const oldScore =
        Number(
            localStorage.getItem(
                key
            )
        ) || 0;


    if (
        percentage > oldScore
    ) {

        localStorage.setItem(
            key,
            percentage
        );

    }

}


/* =========================================
   SAVE ARCADE PLAYER DATA
========================================= */

function saveArcadeProgress(
    xp
) {

    let player;


    try {

        player =
            JSON.parse(
                localStorage.getItem(
                    "learningArcadePlayer"
                )
            );

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


    player.xp =
        Number(player.xp || 0) +
        xp;


    player.gamesPlayed =
        Number(
            player.gamesPlayed || 0
        ) + 1;


    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const yesterday =
        new Date(
            Date.now() - 86400000
        )
            .toISOString()
            .split("T")[0];


    if (
        player.lastPlayed === today
    ) {

        // already played today, streak unchanged

    } else if (
        player.lastPlayed === yesterday
    ) {

        player.streak =
            Number(
                player.streak || 0
            ) + 1;

        player.lastPlayed =
            today;

    } else {

        player.streak = 1;

        player.lastPlayed =
            today;

    }


    try {

        localStorage.setItem(
            "learningArcadePlayer",
            JSON.stringify(player)
        );

    } catch (error) {

        console.error(
            "Could not save progress:",
            error
        );

    }

}


/* =========================================
   DETECT QUESTION TYPE
========================================= */

function detectQuestionType(
    question
) {

    const text =
        String(
            question || ""
        ).toLowerCase();


    if (
        text.includes(
            "which word"
        )
    ) {

        return "VOCABULARY";

    }


    if (
        text.includes(
            "what is it"
        ) ||
        text.includes(
            "what are they"
        )
    ) {

        return "VOCABULARY";

    }


    if (
        text.includes(
            "goes with"
        )
    ) {

        return "VOCABULARY";

    }


    return "GRAMMAR";

}


/* =========================================
   THEME
========================================= */

function loadTheme() {

    if (!themeToggle) {
        return;
    }


    let savedTheme = null;

    try {

        savedTheme =
            localStorage.getItem(
                "learningArcadeTheme"
            );

    } catch (error) {

        console.error(
            "Could not load theme:",
            error
        );

        savedTheme = null;

    }


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );


        themeToggle.textContent =
            "🌙";

    } else {

        themeToggle.textContent =
            "☀️";

    }

}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-mode"
            );


            const lightMode =
                document.body.classList.contains(
                    "light-mode"
                );


            try {

                localStorage.setItem(
                    "learningArcadeTheme",
                    lightMode
                        ? "light"
                        : "dark"
                );

            } catch (error) {

                console.error(
                    "Could not save theme:",
                    error
                );

            }


            themeToggle.textContent =
                lightMode
                    ? "🌙"
                    : "☀️";

        }
    );

}


/* =========================================
   SHUFFLE
========================================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }


    return array;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   PICTURE SUPPORT
========================================= */

function createQuizPicture(
    name
) {

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


    /*
       Special classroom board illustration.
    */

    if (name === "board") {

        return `
            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    min-height:160px;
                "
                aria-label="a board"
            >

                <div
                    style="
                        width:280px;
                        height:150px;
                        background:#333;
                        border:10px solid #8b5a2b;
                        border-radius:6px;
                        box-shadow:
                            0 8px 15px rgba(0,0,0,.25);
                        position:relative;
                    "
                >

                    <div
                        style="
                            position:absolute;
                            left:35px;
                            top:35px;
                            color:white;
                            font-size:22px;
                            font-family:Arial,sans-serif;
                            opacity:.9;
                        "
                    >
                        A B C
                    </div>

                    <div
                        style="
                            position:absolute;
                            left:35px;
                            top:80px;
                            width:80px;
                            height:3px;
                            background:white;
                            transform:rotate(-8deg);
                        "
                    ></div>

                    <div
                        style="
                            position:absolute;
                            right:35px;
                            bottom:-22px;
                            width:90px;
                            height:8px;
                            background:#8b5a2b;
                            border-radius:4px;
                        "
                    ></div>

                </div>

            </div>
        `;

    }


    const emoji =
        pictures[name] ||
        "🖼️";


    return `
        <div
            style="
                display:flex;
                align-items:center;
                justify-content:center;
                min-height:160px;
                font-size:90px;
            "
            aria-label="${escapeHtml(name)}"
        >
            ${emoji}
        </div>
    `;

}
