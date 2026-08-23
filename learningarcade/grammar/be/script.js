/* =====================================================
   BE — Countries & Nationalities
   Positive · Negative · Questions
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const TOTAL_QUESTIONS = 15;

const XP_PER_CORRECT = 10;


/* =====================================================
   QUESTION BANK

   5 Positive
   5 Negative
   5 Question + Answer

   Every question has exactly ONE correct answer.
===================================================== */

const questionBank = [

    /* =================================================
       POSITIVE
    ================================================= */

    {
        type: "positive",

        text:
            "She _____ from Brazil.",

        options:
            [
                "am",
                "is",
                "are"
            ],

        answer:
            "is"
    },


    {
        type: "positive",

        text:
            "They _____ from Canada.",

        options:
            [
                "am",
                "is",
                "are"
            ],

        answer:
            "are"
    },


    {
        type: "positive",

        text:
            "I _____ from Japan.",

        options:
            [
                "am",
                "is",
                "are"
            ],

        answer:
            "am"
    },


    {
        type: "positive",

        text:
            "He _____ Turkish.",

        options:
            [
                "am",
                "is",
                "are"
            ],

        answer:
            "is"
    },


    {
        type: "positive",

        text:
            "We _____ from Mexico.",

        options:
            [
                "am",
                "is",
                "are"
            ],

        answer:
            "are"
    },


    /* =================================================
       NEGATIVE
    ================================================= */

    {
        type: "negative",

        text:
            "I _____ from Spain.",

        options:
            [
                "isn't",
                "aren't",
                "am not"
            ],

        answer:
            "am not"
    },


    {
        type: "negative",

        text:
            "He _____ Japanese.",

        options:
            [
                "isn't",
                "aren't",
                "am not"
            ],

        answer:
            "isn't"
    },


    {
        type: "negative",

        text:
            "They _____ from China.",

        options:
            [
                "isn't",
                "aren't",
                "am not"
            ],

        answer:
            "aren't"
    },


    {
        type: "negative",

        text:
            "She _____ Canadian.",

        options:
            [
                "isn't",
                "aren't",
                "am not"
            ],

        answer:
            "isn't"
    },


    {
        type: "negative",

        text:
            "We _____ from Peru.",

        options:
            [
                "isn't",
                "aren't",
                "am not"
            ],

        answer:
            "aren't"
    },


    /* =================================================
       QUESTION + SHORT ANSWER

       The statement before the question makes
       the correct answer unambiguous.
    ================================================= */

    {
        type: "question",

        text:
            "Maria is from Japan.<br><br>Is Maria Japanese?",

        options:
            [
                "Yes, she is.",
                "No, she isn't.",
                "Yes, they are."
            ],

        answer:
            "Yes, she is."
    },


    {
        type: "question",

        text:
            "David is from Brazil.<br><br>Is David Chinese?",

        options:
            [
                "Yes, he is.",
                "No, he isn't.",
                "No, they aren't."
            ],

        answer:
            "No, he isn't."
    },


    {
        type: "question",

        text:
            "Anna and Leo are from Canada.<br><br>Are they Canadian?",

        options:
            [
                "Yes, they are.",
                "No, they aren't.",
                "Yes, she is."
            ],

        answer:
            "Yes, they are."
    },


    {
        type: "question",

        text:
            "Sara is from Mexico.<br><br>Is Sara Spanish?",

        options:
            [
                "Yes, she is.",
                "No, she isn't.",
                "Yes, they are."
            ],

        answer:
            "No, she isn't."
    },


    {
        type: "question",

        text:
            "Tom and Jack are from Vietnam.<br><br>Are they Vietnamese?",

        options:
            [
                "Yes, they are.",
                "No, they aren't.",
                "Yes, he is."
            ],

        answer:
            "Yes, they are."
    }

];


/* =====================================================
   ELEMENTS
===================================================== */

const targetScreen =
    document.getElementById(
        "targetScreen"
    );

const gameScreen =
    document.getElementById(
        "gameScreen"
    );

const resultScreen =
    document.getElementById(
        "resultScreen"
    );

const startBattleButton =
    document.getElementById(
        "startBattleButton"
    );

const retryButton =
    document.getElementById(
        "retryButton"
    );

const grammarButton =
    document.getElementById(
        "grammarButton"
    );

const grammarBackButton =
    document.getElementById(
        "grammarBackButton"
    );

const themeToggle =
    document.getElementById(
        "themeToggle"
    );

const questionType =
    document.getElementById(
        "questionType"
    );

const questionText =
    document.getElementById(
        "questionText"
    );

const questionHint =
    document.getElementById(
        "questionHint"
    );

const answersContainer =
    document.getElementById(
        "answersContainer"
    );

const feedback =
    document.getElementById(
        "feedback"
    );

const scoreElement =
    document.getElementById(
        "score"
    );

const questionNumberElement =
    document.getElementById(
        "questionNumber"
    );

const comboElement =
    document.getElementById(
        "combo"
    );

const progressText =
    document.getElementById(
        "progressText"
    );

const progressFill =
    document.getElementById(
        "progressFill"
    );


/* RESULTS */

const finalScore =
    document.getElementById(
        "finalScore"
    );

const finalCorrect =
    document.getElementById(
        "finalCorrect"
    );

const finalWrong =
    document.getElementById(
        "finalWrong"
    );

const finalAccuracy =
    document.getElementById(
        "finalAccuracy"
    );

const positiveResult =
    document.getElementById(
        "positiveResult"
    );

const negativeResult =
    document.getElementById(
        "negativeResult"
    );

const questionResult =
    document.getElementById(
        "questionResult"
    );

const earnedXP =
    document.getElementById(
        "earnedXP"
    );


/* =====================================================
   GAME STATE
===================================================== */

let questions = [];

let currentQuestion = 0;

let score = 0;

let correctAnswers = 0;

let wrongAnswers = 0;

let combo = 0;

let bestCombo = 0;

let positiveCorrect = 0;

let negativeCorrect = 0;

let questionCorrect = 0;

let gameActive = false;


/* =====================================================
   SHUFFLE
===================================================== */

function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }


    return result;
}


/* =====================================================
   THEME (legacy — only if local #themeToggle exists)
   Global theme.js handles the site-wide FAB toggle.
===================================================== */

if (themeToggle) {

    function loadTheme() {
        let saved = null;
        try {
            saved = localStorage.getItem("learningArcadeTheme");
        } catch (error) {
            console.error("Could not load theme:", error);
            saved = null;
        }
        if (saved === "light") {
            document.body.classList.add("light-mode");
            themeToggle.textContent = "🌙";
        } else {
            themeToggle.textContent = "☀️";
        }
    }

    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");
        const isLight = document.body.classList.contains("light-mode");
        try {
            localStorage.setItem(
                "learningArcadeTheme",
                isLight ? "light" : "dark"
            );
        } catch (error) {
            console.error("Could not save theme:", error);
        }
        themeToggle.textContent = isLight ? "🌙" : "☀️";
    });

    loadTheme();
}




/* =====================================================
   GRAMMAR SELECTION
===================================================== */

const grammarCards =
    [
        ...document.querySelectorAll(
            ".grammar-card:not(.locked)"
        )
    ];

let selectedGrammar = "be";


function showGrammarBackButton() {
    if (!grammarBackButton) return;
    grammarBackButton.classList.remove("hidden-nav-button");
}


function hideGrammarBackButton() {
    if (!grammarBackButton) return;
    grammarBackButton.classList.add("hidden-nav-button");
}


grammarCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                grammarCards.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                card.classList.add(
                    "selected"
                );


                selectedGrammar =
                    card.dataset.grammar ||
                    "be";


                if (
                    selectedGrammar ===
                    "be"
                ) {

                    showGrammarBackButton();

                }

                else {

                    hideGrammarBackButton();

                }


                const headerSubtitle =
                    document.querySelector(
                        ".game-title-text p"
                    );


                if (headerSubtitle) {

                    if (
                        selectedGrammar ===
                        "simple-present"
                    ) {

                        headerSubtitle.textContent =
                            "Simple Present • A1 Grammar";

                    }

                    else if (
                        selectedGrammar ===
                        "there-is"
                    ) {

                        headerSubtitle.textContent =
                            "There Is / There Are • A1 Grammar";

                    }

                    else {

                        headerSubtitle.textContent =
                            "BE • Countries & Nationalities";

                    }

                }

            }
        );

    }
);


/* =====================================================
   BUTTONS
===================================================== */

startBattleButton.addEventListener(
    "click",
    startBattle
);


retryButton.addEventListener(
    "click",
    startBattle
);


grammarButton.addEventListener(
    "click",
    function () {

        gameActive =
            false;

        gameScreen.classList.add(
            "hidden"
        );

        resultScreen.classList.add(
            "hidden"
        );

        targetScreen.classList.remove(
            "hidden"
        );

        hideGrammarBackButton();

    }
);


if (grammarBackButton) {

    grammarBackButton.addEventListener(
        "click",
        function () {

            gameActive =
                false;

            gameScreen.classList.add(
                "hidden"
            );

            resultScreen.classList.add(
                "hidden"
            );

            targetScreen.classList.remove(
                "hidden"
            );

            hideGrammarBackButton();

        }
    );

}

hideGrammarBackButton();


/* =====================================================
   START BATTLE
===================================================== */

function startBattle() {
    document.body.classList.add("playing");

    showGrammarBackButton();

    questions =
        shuffle(
            questionBank
        );


    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    wrongAnswers = 0;

    combo = 0;

    bestCombo = 0;

    positiveCorrect = 0;

    negativeCorrect = 0;

    questionCorrect = 0;

    gameActive = true;


    scoreElement.textContent =
        "0";


    comboElement.textContent =
        "×1";


    questionNumberElement.textContent =
        `1 / ${TOTAL_QUESTIONS}`;


    progressText.textContent =
        `0 / ${TOTAL_QUESTIONS}`;


    progressFill.style.width =
        "0%";


    feedback.textContent =
        "";


    feedback.className =
        "feedback";


    targetScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );


    showQuestion();

}


/* =====================================================
   QUESTION TYPE
===================================================== */

function setQuestionType(
    type
) {

    if (
        type === "positive"
    ) {

        questionType.textContent =
            "COMPLETE THE SENTENCE";

        questionHint.textContent =
            "Choose the correct BE verb.";

        return;
    }


    if (
        type === "negative"
    ) {

        questionType.textContent =
            "MAKE IT NEGATIVE";

        questionHint.textContent =
            "Choose the correct negative form.";

        return;
    }


    questionType.textContent =
        "ANSWER THE QUESTION";

    questionHint.textContent =
        "Choose the best short answer.";

}


/* =====================================================
   SHOW QUESTION
===================================================== */

function showQuestion() {

    if (
        currentQuestion >=
        questions.length
    ) {

        finishBattle();

        return;

    }


    const question =
        questions[currentQuestion];


    setQuestionType(
        question.type
    );


    questionText.innerHTML = question.text.replace(
        /_____+/g,
        '<span class="blank-slot">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'
    );


    questionNumberElement.textContent =
        `${currentQuestion + 1} / ${TOTAL_QUESTIONS}`;


    progressText.textContent =
        `${currentQuestion} / ${TOTAL_QUESTIONS}`;


    progressFill.style.width =
        `${(
            currentQuestion /
            TOTAL_QUESTIONS
        ) * 100}%`;


    feedback.textContent =
        "";


    feedback.className =
        "feedback";


    answersContainer.innerHTML =
        "";

    answersContainer.classList.remove("mk-stagger-fast");
    void answersContainer.offsetWidth;
    answersContainer.classList.add("mk-stagger-fast");

    const options =
        shuffle(
            question.options
        );


    options.forEach(
        function (option) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "answer-button";


            button.textContent =
                option;


            button.addEventListener(
                "click",
                function () {

                    checkAnswer(
                        option,
                        question,
                        button
                    );

                }
            );


            answersContainer.appendChild(
                button
            );

        }
    );

}


/* =====================================================
   CHECK ANSWER
===================================================== */

function checkAnswer(
    selected,
    question,
    selectedButton
) {

    if (
        !gameActive
    ) {
        return;
    }


    document
        .querySelectorAll(
            ".answer-button"
        )
        .forEach(
            function (button) {

                button.disabled =
                    true;

            }
        );


    if (
        selected ===
        question.answer
    ) {

        handleCorrect(
            question,
            selectedButton
        );

    } else {

        handleWrong(
            question,
            selectedButton
        );

    }

}


/* =====================================================
   CORRECT
===================================================== */

function handleCorrect(
    question,
    selectedButton
) {

    correctAnswers++;

    combo++;


    bestCombo =
        Math.max(
            bestCombo,
            combo
        );


    const points =
        10 +
        ((combo - 1) * 5);


    score +=
        points;


    selectedButton.classList.add(
        "correct"
    );


    scoreElement.textContent =
        score;


    comboElement.textContent =
        "×" + combo;


    feedback.textContent =
        `✅ Correct! +${points} points`;


    feedback.className =
        "feedback correct";


    if (
        question.type ===
        "positive"
    ) {

        positiveCorrect++;

    }


    if (
        question.type ===
        "negative"
    ) {

        negativeCorrect++;

    }


    if (
        question.type ===
        "question"
    ) {

        questionCorrect++;

    }


    setTimeout(
        function () {

            if (!gameActive) {
                return;
            }

            currentQuestion++;

            showQuestion();

        },
        650
    );

}


/* =====================================================
   WRONG
===================================================== */

function handleWrong(
    question,
    selectedButton
) {

    wrongAnswers++;

    combo = 0;


    selectedButton.classList.add(
        "wrong"
    );


    comboElement.textContent =
        "×1";


    document
        .querySelectorAll(
            ".answer-button"
        )
        .forEach(
            function (button) {

                if (
                    button.textContent.trim() ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct-answer"
                    );

                }

            }
        );


    feedback.textContent =
        `❌ Correct answer: ${question.answer}`;


    feedback.className =
        "feedback wrong";


    setTimeout(
        function () {

            if (!gameActive) {
                return;
            }

            currentQuestion++;

            showQuestion();

        },
        900
    );

}


/* =====================================================
   FINISH
===================================================== */

function finishBattle() {

    gameActive = false;


    const accuracy =
        Math.round(
            (
                correctAnswers /
                TOTAL_QUESTIONS
            ) * 100
        );


    const xp =
        correctAnswers *
        XP_PER_CORRECT;


    finalScore.textContent =
        `${correctAnswers} / ${TOTAL_QUESTIONS}`;


    finalCorrect.textContent =
        correctAnswers;


    finalWrong.textContent =
        wrongAnswers;


    finalAccuracy.textContent =
        accuracy + "%";


    positiveResult.textContent =
        `${positiveCorrect} / 5`;


    negativeResult.textContent =
        `${negativeCorrect} / 5`;


    questionResult.textContent =
        `${questionCorrect} / 5`;


    earnedXP.textContent =
        "+" +
        xp +
        " XP";


    progressText.textContent =
        `${TOTAL_QUESTIONS} / ${TOTAL_QUESTIONS}`;


    progressFill.style.width =
        "100%";


    saveProgress(
        xp
    );

    // Stars for Grammar index cards (0–3, best score kept)
    (function saveGameStars() {
        var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
        var data = {};
        try {
            data = JSON.parse(localStorage.getItem("laGameStars") || "{}") || {};
        } catch (e) {
            data = {};
        }
        // be-verbs hub aggregates BE + WH games; store under be-verbs and be
        var prevBe = Number(data["be"] || 0);
        var prevHub = Number(data["be-verbs"] || 0);
        if (stars > prevBe) data["be"] = stars;
        if (stars > prevHub) data["be-verbs"] = Math.max(prevHub, stars);
        try {
            localStorage.setItem("laGameStars", JSON.stringify(data));
        } catch (e) {}
    })();

    showGrammarBackButton();


    gameScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.remove(
        "hidden"
    );

}


/* =====================================================
   SAVE PROGRESS
===================================================== */

function saveProgress(
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

    } catch (
        error
    ) {

        player =
            null;

    }


    if (
        !player
    ) {

        player = {

            name:
                "Guest Player",

            xp:
                0,

            gamesPlayed:
                0,

            streak:
                0,

            lastPlayed:
                null

        };

    }


    player.xp =
        Number(
            player.xp || 0
        ) + xp;


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
            JSON.stringify(
                player
            )
        );

    } catch (error) {

        console.error(
            "Could not save progress:",
            error
        );

    }

}


/* Keep game light/dark in sync with site theme (fixes washed-out question text) */
(function syncGameThemeWithSite() {
  function apply() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.body.classList.toggle("light-mode", !dark);
  }
  apply();
  try {
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  } catch (e) {}
})();
