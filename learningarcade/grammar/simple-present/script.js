/* =====================================================
   SIMPLE PRESENT — LEARNING ARCADE
===================================================== */


/* =====================================================
   HELPERS
===================================================== */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    [...document.querySelectorAll(selector)];


/* =====================================================
   GROUP DATA
===================================================== */

const GROUPS = {

    group1: {

        label: "GROUP 1",

        title: "I / You / We / They",

        description:
            "Build confidence with do and don't before mixing forms.",

        practices: {

            build: [
                ["I", "play", "football", "every", "weekend."],
                ["You", "like", "coffee."],
                ["We", "study", "English", "every", "day."],
                ["They", "work", "in", "a", "bank."],
                ["I", "don't", "watch", "TV", "in", "the", "morning."],
                ["You", "don't", "eat", "fast", "food", "every", "day."],
                ["We", "don't", "live", "in", "London."],
                ["They", "don't", "speak", "Spanish."],
                ["I", "have", "breakfast", "at", "seven."],
                ["You", "need", "a", "new", "phone."],
                ["We", "drink", "coffee", "at", "work."],
                ["They", "read", "the", "newspaper", "every", "day."]
            ],

            complete: [

                {
                    before: "I",
                    after: "football.",
                    options: ["play", "plays", "playing"],
                    answer: "play"
                },

                {
                    before: "You",
                    after: "English.",
                    options: ["study", "studies", "studying"],
                    answer: "study"
                },

                {
                    before: "We",
                    after: "coffee.",
                    options: ["drink", "drinks", "drinking"],
                    answer: "drink"
                },

                {
                    before: "They",
                    after: "TV.",
                    options: ["watch", "watches", "watching"],
                    answer: "watch"
                },

                {
                    before: "I",
                    after: "like fast food.",
                    options: ["don't", "doesn't", "not"],
                    answer: "don't"
                },

                {
                    before: "You",
                    after: "work here.",
                    options: ["don't", "doesn't", "aren't"],
                    answer: "don't"
                },

                {
                    before: "We",
                    after: "Spanish.",
                    options: ["speak", "speaks", "speaking"],
                    answer: "speak"
                },

                {
                    before: "They",
                    after: "in a bank.",
                    options: ["work", "works", "working"],
                    answer: "work"
                },

                {
                    before: "",
                    after: "you like dogs?",
                    options: ["Do", "Does", "Are"],
                    answer: "Do"
                },

                {
                    before: "",
                    after: "they study English?",
                    options: ["Do", "Does", "Are"],
                    answer: "Do"
                },

                {
                    before: "",
                    after: "we have class today?",
                    options: ["Do", "Does", "Are"],
                    answer: "Do"
                },

                {
                    before: "",
                    after: "I need a pen?",
                    options: ["Do", "Does", "Am"],
                    answer: "Do"
                }

            ],

            question: [

                {
                    words:
                        ["Do", "you", "like", "coffee?"]
                },

                {
                    words:
                        ["Do", "they", "work", "here?"]
                },

                {
                    words:
                        ["Do", "we", "study", "English?"]
                },

                {
                    words:
                        ["Do", "you", "watch", "TV", "every", "day?"]
                },

                {
                    words:
                        ["Do", "they", "play", "football?"]
                },

                {
                    words:
                        ["Do", "we", "have", "breakfast", "at", "home?"]
                },

                {
                    words:
                        ["Do", "you", "speak", "English?"]
                },

                {
                    words:
                        ["Do", "they", "drink", "tea?"]
                },

                {
                    words:
                        ["Do", "you", "like", "dogs?"]
                },

                {
                    words:
                        ["Do", "we", "go", "to", "English", "classes?"]
                },

                {
                    words:
                        ["Do", "they", "read", "newspapers?"]
                },

                {
                    words:
                        ["Do", "I", "need", "a", "new", "phone?"]
                }

            ],

            short: [

                {
                    context:
                        "You like coffee.",

                    question:
                        "Do you like coffee?",

                    options:
                        ["Yes, I do.", "No, I don't."],

                    answer:
                        "Yes, I do."
                },

                {
                    context:
                        "They don't work here.",

                    question:
                        "Do they work here?",

                    options:
                        ["Yes, they do.", "No, they don't."],

                    answer:
                        "No, they don't."
                },

                {
                    context:
                        "We study English.",

                    question:
                        "Do we study English?",

                    options:
                        ["Yes, we do.", "No, we don't."],

                    answer:
                        "Yes, we do."
                },

                {
                    context:
                        "You don't watch TV every day.",

                    question:
                        "Do you watch TV every day?",

                    options:
                        ["Yes, I do.", "No, I don't."],

                    answer:
                        "No, I don't."
                },

                {
                    context:
                        "They play football.",

                    question:
                        "Do they play football?",

                    options:
                        ["Yes, they do.", "No, they don't."],

                    answer:
                        "Yes, they do."
                },

                {
                    context:
                        "You don't drink tea.",

                    question:
                        "Do you drink tea?",

                    options:
                        ["Yes, I do.", "No, I don't."],

                    answer:
                        "No, I don't."
                },

                {
                    context:
                        "We have class today.",

                    question:
                        "Do we have class today?",

                    options:
                        ["Yes, we do.", "No, we don't."],

                    answer:
                        "Yes, we do."
                },

                {
                    context:
                        "They don't speak Spanish.",

                    question:
                        "Do they speak Spanish?",

                    options:
                        ["Yes, they do.", "No, they don't."],

                    answer:
                        "No, they don't."
                },

                {
                    context:
                        "You like dogs.",

                    question:
                        "Do you like dogs?",

                    options:
                        ["Yes, I do.", "No, I don't."],

                    answer:
                        "Yes, I do."
                },

                {
                    context:
                        "They live here.",

                    question:
                        "Do they live here?",

                    options:
                        ["Yes, they do.", "No, they don't."],

                    answer:
                        "Yes, they do."
                },

                {
                    context:
                        "We don't need a book.",

                    question:
                        "Do we need a book?",

                    options:
                        ["Yes, we do.", "No, we don't."],

                    answer:
                        "No, we don't."
                },

                {
                    context:
                        "You work in a bank.",

                    question:
                        "Do you work in a bank?",

                    options:
                        ["Yes, I do.", "No, I don't."],

                    answer:
                        "Yes, I do."
                }

            ],

            mixed: []

        }

    },


    group2: {

        label: "GROUP 2",

        title: "He / She / It",

        description:
            "Master third person: verb + s, does and doesn't.",

        practices: {

            build: [
                ["He", "plays", "football", "every", "weekend."],
                ["She", "likes", "coffee."],
                ["He", "studies", "English", "every", "day."],
                ["She", "works", "in", "a", "bank."],
                ["It", "works", "well."],
                ["He", "doesn't", "watch", "TV", "in", "the", "morning."],
                ["She", "doesn't", "eat", "fast", "food."],
                ["He", "doesn't", "live", "in", "London."],
                ["She", "doesn't", "speak", "Spanish."],
                ["He", "has", "breakfast", "at", "seven."],
                ["She", "needs", "a", "new", "phone."],
                ["It", "works", "very", "well."]
            ],

            complete: [

                {
                    before: "He",
                    after: "football.",
                    options: ["plays", "play", "playing"],
                    answer: "plays"
                },

                {
                    before: "She",
                    after: "English.",
                    options: ["studies", "study", "studying"],
                    answer: "studies"
                },

                {
                    before: "It",
                    after: "well.",
                    options: ["works", "work", "working"],
                    answer: "works"
                },

                {
                    before: "She",
                    after: "coffee.",
                    options: ["likes", "like", "liking"],
                    answer: "likes"
                },

                {
                    before: "He",
                    after: "like fast food.",
                    options: ["doesn't", "don't", "isn't"],
                    answer: "doesn't"
                },

                {
                    before: "She",
                    after: "work here.",
                    options: ["doesn't", "don't", "isn't"],
                    answer: "doesn't"
                },

                {
                    before: "It",
                    after: "work well.",
                    options: ["doesn't", "don't", "isn't"],
                    answer: "doesn't"
                },

                {
                    before: "He",
                    after: "TV.",
                    options: ["watches", "watch", "watching"],
                    answer: "watches"
                },

                {
                    before: "",
                    after: "he like coffee?",
                    options: ["Does", "Do", "Is"],
                    answer: "Does"
                },

                {
                    before: "",
                    after: "she work here?",
                    options: ["Does", "Do", "Is"],
                    answer: "Does"
                },

                {
                    before: "",
                    after: "it work well?",
                    options: ["Does", "Do", "Is"],
                    answer: "Does"
                },

                {
                    before: "",
                    after: "he speak English?",
                    options: ["Does", "Do", "Is"],
                    answer: "Does"
                }

            ],

            question: [

                {
                    words:
                        ["Does", "he", "like", "coffee?"]
                },

                {
                    words:
                        ["Does", "she", "work", "here?"]
                },

                {
                    words:
                        ["Does", "it", "work", "well?"]
                },

                {
                    words:
                        ["Does", "he", "watch", "TV", "every", "day?"]
                },

                {
                    words:
                        ["Does", "she", "play", "tennis?"]
                },

                {
                    words:
                        ["Does", "he", "have", "breakfast", "at", "home?"]
                },

                {
                    words:
                        ["Does", "she", "speak", "English?"]
                },

                {
                    words:
                        ["Does", "he", "drink", "tea?"]
                },

                {
                    words:
                        ["Does", "she", "like", "dogs?"]
                },

                {
                    words:
                        ["Does", "he", "go", "to", "English", "classes?"]
                },

                {
                    words:
                        ["Does", "she", "read", "newspapers?"]
                },

                {
                    words:
                        ["Does", "it", "need", "a", "battery?"]
                }

            ],

            short: [

                {
                    context:
                        "He likes coffee.",

                    question:
                        "Does he like coffee?",

                    options:
                        ["Yes, he does.", "No, he doesn't."],

                    answer:
                        "Yes, he does."
                },

                {
                    context:
                        "She doesn't work here.",

                    question:
                        "Does she work here?",

                    options:
                        ["Yes, she does.", "No, she doesn't."],

                    answer:
                        "No, she doesn't."
                },

                {
                    context:
                        "It works well.",

                    question:
                        "Does it work well?",

                    options:
                        ["Yes, it does.", "No, it doesn't."],

                    answer:
                        "Yes, it does."
                },

                {
                    context:
                        "He doesn't watch TV every day.",

                    question:
                        "Does he watch TV every day?",

                    options:
                        ["Yes, he does.", "No, he doesn't."],

                    answer:
                        "No, he doesn't."
                },

                {
                    context:
                        "She plays football.",

                    question:
                        "Does she play football?",

                    options:
                        ["Yes, she does.", "No, she doesn't."],

                    answer:
                        "Yes, she does."
                },

                {
                    context:
                        "He doesn't drink tea.",

                    question:
                        "Does he drink tea?",

                    options:
                        ["Yes, he does.", "No, he doesn't."],

                    answer:
                        "No, he doesn't."
                },

                {
                    context:
                        "She speaks Spanish.",

                    question:
                        "Does she speak Spanish?",

                    options:
                        ["Yes, she does.", "No, she doesn't."],

                    answer:
                        "Yes, she does."
                },

                {
                    context:
                        "He lives here.",

                    question:
                        "Does he live here?",

                    options:
                        ["Yes, he does.", "No, he doesn't."],

                    answer:
                        "Yes, he does."
                },

                {
                    context:
                        "She doesn't like dogs.",

                    question:
                        "Does she like dogs?",

                    options:
                        ["Yes, she does.", "No, she doesn't."],

                    answer:
                        "No, she doesn't."
                },

                {
                    context:
                        "It doesn't work without batteries.",

                    question:
                        "Does it work without batteries?",

                    options:
                        ["Yes, it does.", "No, it doesn't."],

                    answer:
                        "No, it doesn't."
                },

                {
                    context:
                        "He needs a book.",

                    question:
                        "Does he need a book?",

                    options:
                        ["Yes, he does.", "No, he doesn't."],

                    answer:
                        "Yes, he does."
                },

                {
                    context:
                        "She works in a bank.",

                    question:
                        "Does she work in a bank?",

                    options:
                        ["Yes, she does.", "No, she doesn't."],

                    answer:
                        "Yes, she does."
                }

            ],

            mixed: []

        }

    }

};


/* =====================================================
   FINAL MIXED
===================================================== */

const FINAL_MIXED_QUESTIONS = [

    {
        type: "positive",
        words:
            ["I", "work", "in", "a", "hospital."]
    },

    {
        type: "positive",
        words:
            ["You", "drink", "coffee", "every", "morning."]
    },

    {
        type: "positive",
        words:
            ["We", "study", "English", "after", "work."]
    },

    {
        type: "positive",
        words:
            ["They", "live", "near", "the", "school."]
    },

    {
        type: "positive",
        words:
            ["He", "plays", "football", "on", "Saturday."]
    },

    {
        type: "positive",
        words:
            ["She", "works", "in", "a", "bank."]
    },

    {
        type: "positive",
        words:
            ["It", "works", "very", "well."]
    },

    {
        type: "negative",
        words:
            ["I", "don't", "watch", "TV", "in", "the", "morning."]
    },

    {
        type: "negative",
        words:
            ["You", "don't", "eat", "meat."]
    },

    {
        type: "negative",
        words:
            ["We", "don't", "work", "on", "Sunday."]
    },

    {
        type: "negative",
        words:
            ["They", "don't", "speak", "Spanish."]
    },

    {
        type: "negative",
        words:
            ["He", "doesn't", "like", "coffee."]
    },

    {
        type: "negative",
        words:
            ["She", "doesn't", "drive", "to", "work."]
    },

    {
        type: "negative",
        words:
            ["It", "doesn't", "work", "without", "batteries."]
    },

    {
        type: "question",
        words:
            ["Do", "I", "need", "a", "ticket?"]
    },

    {
        type: "question",
        words:
            ["Do", "you", "like", "music?"]
    },

    {
        type: "question",
        words:
            ["Do", "we", "have", "class", "today?"]
    },

    {
        type: "question",
        words:
            ["Do", "they", "work", "here?"]
    },

    {
        type: "question",
        words:
            ["Does", "he", "play", "tennis?"]
    },

    {
        type: "question",
        words:
            ["Does", "she", "speak", "English?"]
    },

    {
        type: "question",
        words:
            ["Does", "it", "work", "well?"]
    },

    {
        type: "short",

        context:
            "I don't like coffee.",

        question:
            "Do I like coffee?",

        options:
            ["Yes, I do.", "No, I don't."],

        answer:
            "No, I don't."
    },

    {
        type: "short",

        context:
            "You like pizza.",

        question:
            "Do you like pizza?",

        options:
            ["Yes, I do.", "No, I don't."],

        answer:
            "Yes, I do."
    },

    {
        type: "short",

        context:
            "We don't work on Sunday.",

        question:
            "Do we work on Sunday?",

        options:
            ["Yes, we do.", "No, we don't."],

        answer:
            "No, we don't."
    },

    {
        type: "short",

        context:
            "They study English.",

        question:
            "Do they study English?",

        options:
            ["Yes, they do.", "No, they don't."],

        answer:
            "Yes, they do."
    },

    {
        type: "short",

        context:
            "He doesn't play tennis.",

        question:
            "Does he play tennis?",

        options:
            ["Yes, he does.", "No, he doesn't."],

        answer:
            "No, he doesn't."
    },

    {
        type: "short",

        context:
            "She works in a bank.",

        question:
            "Does she work in a bank?",

        options:
            ["Yes, she does.", "No, she doesn't."],

        answer:
            "Yes, she does."
    },

    {
        type: "short",

        context:
            "It doesn't work without a battery.",

        question:
            "Does it work without a battery?",

        options:
            ["Yes, it does.", "No, it doesn't."],

        answer:
            "No, it doesn't."
    }

];


/* =====================================================
   PRACTICE NAMES
===================================================== */

const practiceNames = {

    build:
        "Build the Sentence",

    complete:
        "Complete It",

    question:
        "Make the Question",

    short:
        "Short Answers",

    mixed:
        "Group Mix",

    finalMixed:
        "Final Mixed Challenge"

};


/* =====================================================
   STATE
===================================================== */

let state = {

    group:
        "group1",

    practice:
        "build",

    questions:
        [],

    index:
        0,

    score:
        0,

    correct:
        0,

    streak:
        0,

    answered:
        false,

    xp:
        Number(
            localStorage.getItem(
                "arcadeXP"
            ) || 0
        ),

    finalMixed:
        false

};


/* =====================================================
   SAVE XP
===================================================== */

function saveXP() {

    localStorage.setItem(
        "arcadeXP",
        String(
            state.xp
        )
    );


    const xpEl =
        document.getElementById(
            "headerXP"
        );


    if (xpEl) {

        xpEl.textContent =
            state.xp;

    }

}


/* =====================================================
   SAVE ARCADE PLAYER DATA
   Writes into the same shared profile the homepage,
   Match Rush, Multiple Choice, Grammar Battle, and
   Video Quest use, so Simple Present progress shows
   up in the site-wide XP/streak/games-played stats.
   Called once per completed practice or final mix,
   not per question, so gamesPlayed counts rounds
   rather than individual answers.
===================================================== */

function saveArcadeProgress(xp) {

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
   NORMALIZE
===================================================== */

function normalize(text) {

    return String(text)
        .toLowerCase()
        .replace(/[’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();

}


/* =====================================================
   SCREEN CONTROL
===================================================== */

function show(id) {

    [
        "homeScreen",
        "practiceMenu",
        "gameScreen",
        "resultScreen"

    ].forEach(
        function (screenId) {

            $(`#${screenId}`)
                .classList
                .add("hidden");

        }
    );


    $(`#${id}`)
        .classList
        .remove("hidden");


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


/* =====================================================
   GROUP COMPLETION
===================================================== */

function groupDone(group) {

    const done =
        JSON.parse(
            localStorage.getItem(
                `spDone_${group}`
            ) || "[]"
        );


    return (
        new Set(done).size >= 5
    );

}


function markPracticeDone(
    group,
    practice
) {

    const done =
        new Set(
            JSON.parse(
                localStorage.getItem(
                    `spDone_${group}`
                ) || "[]"
            )
        );


    done.add(
        practice
    );


    localStorage.setItem(
        `spDone_${group}`,
        JSON.stringify(
            [...done]
        )
    );

}


function finalMixedDone() {

    return (
        localStorage.getItem(
            "spFinalMixedDone"
        ) === "true"
    );

}


function markFinalMixedDone() {

    localStorage.setItem(
        "spFinalMixedDone",
        "true"
    );

}


/* =====================================================
   FINAL UNLOCK
===================================================== */

function mixedUnlocked() {

    return (
        groupDone("group1") &&
        groupDone("group2")
    );

}


/* =====================================================
   UPDATE PRACTICE MENU
===================================================== */

function updateMenuProgress() {

    const done =
        JSON.parse(
            localStorage.getItem(
                `spDone_${state.group}`
            ) || "[]"
        );


    const completed =
        new Set(done);


    $("#groupProgressText").textContent =
        `${completed.size} / 5 practices completed`;


    document
        .querySelectorAll(
            ".practice-card"
        )
        .forEach(
            function (card) {

                const practice =
                    card.dataset.practice;


                card.classList.toggle(
                    "completed",
                    completed.has(
                        practice
                    )
                );

            }
        );

}


/* =====================================================
   TOP PATH PROGRESS
===================================================== */

function updatePathProgress(
    group1Complete,
    group2Complete,
    finalComplete
) {

    const steps =
        document.querySelectorAll(
            ".path-step"
        );


    const lines =
        document.querySelectorAll(
            ".path-line"
        );


    if (
        steps.length >= 3
    ) {

        updatePathStep(
            steps[0],
            group1Complete,
            false
        );


        updatePathStep(
            steps[1],
            group2Complete,
            false
        );


        updatePathStep(
            steps[2],
            finalComplete,
            true
        );

    }


    if (
        lines.length >= 2
    ) {

        lines[0].classList.toggle(
            "completed",
            group1Complete
        );


        lines[1].classList.toggle(
            "completed",
            group2Complete
        );

    }

}


function updatePathStep(
    step,
    completed,
    finalStep
) {

    step.classList.toggle(
        "completed",
        completed
    );


    step.classList.toggle(
        "locked",
        !completed &&
        finalStep
    );


    const number =
        step.querySelector(
            "span"
        );


    if (!number) {
        return;
    }


    if (completed) {

        number.textContent =
            "✓";

    }

    else {

        number.textContent =
            step.dataset.number ||
            "";

    }

}


/* =====================================================
   GROUP CARD STATE
===================================================== */

function updateGroupCardState(
    card,
    completed,
    badgeText,
    actionText
) {

    if (!card) {
        return;
    }


    card.classList.toggle(
        "completed",
        completed
    );


    const action =
        card.querySelector(
            ".group-action"
        );


    if (action) {

        action.textContent =
            completed
                ? actionText
                : "START GROUP →";

    }

}


/* =====================================================
   HOME
===================================================== */

function renderHome() {

    const group1 =
        document.querySelector(
            '[data-group="group1"]'
        );


    const group2 =
        document.querySelector(
            '[data-group="group2"]'
        );


    const finalGroup =
        document.querySelector(
            '[data-group="mixed"]'
        );


    const group1Complete =
        groupDone("group1");


    const group2Complete =
        groupDone("group2");


    const finalComplete =
        finalMixedDone();


    /* GROUP 1 */

    updateGroupCardState(
        group1,
        group1Complete,
        "✓",
        "PLAY AGAIN →"
    );


    /* GROUP 2 */

    updateGroupCardState(
        group2,
        group2Complete,
        "✓",
        "PLAY AGAIN →"
    );


    /* FINAL GROUP */

    const unlocked =
        group1Complete &&
        group2Complete;


    finalGroup.disabled =
        !unlocked;


    finalGroup.classList.toggle(
        "locked-card",
        !unlocked
    );


    finalGroup.classList.toggle(
        "final-completed",
        finalComplete
    );


    const finalNote =
        finalGroup.querySelector(
            ".lock-note"
        );


    const finalAction =
        finalGroup.querySelector(
            ".group-action"
        );


    if (finalNote) {

        finalNote.textContent =

            !unlocked

                ? "🔒 COMPLETE GROUP 1 + GROUP 2"

                : finalComplete

                    ? "✓ FINAL CHALLENGE COMPLETED"

                    : "✓ GROUPS COMPLETE";

    }


    if (finalAction) {

        finalAction.textContent =

            !unlocked

                ? "LOCKED"

                : "PLAY AGAIN →";

    }


    updatePathProgress(
        group1Complete,
        group2Complete,
        finalComplete
    );

}


/* =====================================================
   OPEN GROUP
===================================================== */

function openGroup(group) {

    if (
        group === "mixed"
    ) {

        if (
            !mixedUnlocked()
        ) {

            toast(
                "Complete Group 1 and Group 2 first."
            );


            return;

        }


        startFinalMixed();


        return;

    }


    state.group =
        group;


    state.finalMixed =
        false;


    const groupData =
        GROUPS[group];


    $("#menuEyebrow").textContent =
        groupData.label;


    $("#menuTitle").textContent =
        groupData.title;


    $("#menuDescription").textContent =
        groupData.description;


    updateMenuProgress();


    show(
        "practiceMenu"
    );

}


/* =====================================================
   START NORMAL PRACTICE
===================================================== */

function startPractice(
    practice
) {

    state.finalMixed =
        false;


    state.practice =
        practice;


    state.questions =
        shuffle(
            GROUPS[
                state.group
            ]
            .practices[
                practice
            ]
        ).slice(
            0,
            12
        );


    state.index =
        0;

    state.score =
        0;

    state.correct =
        0;

    state.streak =
        0;

    state.answered =
        false;


    $("#practiceLabel").textContent =
        practiceNames[
            practice
        ].toUpperCase();


    $("#gameTitle").textContent =
        practiceNames[
            practice
        ];


    $("#score").textContent =
        "0";


    renderQuestion();


    show(
        "gameScreen"
    );

}


/* =====================================================
   FINAL MIXED START
===================================================== */

function startFinalMixed() {

    state.group =
        "final";


    state.practice =
        "finalMixed";


    state.finalMixed =
        true;


    state.questions =
        shuffle(
            FINAL_MIXED_QUESTIONS
        );


    state.index =
        0;

    state.score =
        0;

    state.correct =
        0;

    state.streak =
        0;

    state.answered =
        false;


    $("#practiceLabel").textContent =
        "FINAL MIX";


    $("#gameTitle").textContent =
        "Final Mixed Simple Present";


    $("#score").textContent =
        "0";


    renderQuestion();


    show(
        "gameScreen"
    );

}


/* =====================================================
   PROGRESS
===================================================== */

function setProgress() {

    const total =
        state.questions.length;


    $("#questionCounter").textContent =
        `${state.index + 1} / ${total}`;


    $("#progressFill").style.width =
        `${(
            state.index /
            total
        ) * 100}%`;


    $("#streakText").textContent =
        `STREAK ×${Math.max(
            1,
            state.streak
        )}`;

}


/* =====================================================
   RENDER QUESTION
===================================================== */

function renderQuestion() {

    state.answered =
        false;


    $("#feedback").textContent =
        "";


    $("#feedback").className =
        "feedback";


    setProgress();


    const question =
        state.questions[
            state.index
        ];


    if (
        state.finalMixed
    ) {

        renderFinalMixedQuestion(
            question
        );


        return;

    }


    if (
        state.practice ===
        "build"
    ) {

        renderBuild(
            question,
            false
        );

    }

    else if (
        state.practice ===
        "question"
    ) {

        renderBuild(
            question,
            true
        );

    }

    else if (
        state.practice ===
        "complete"
    ) {

        renderComplete(
            question
        );

    }

    else if (
        state.practice ===
        "short"
    ) {

        renderShort(
            question
        );

    }

    else {

        renderMixed(
            question
        );

    }

}


/* =====================================================
   FINAL MIXED QUESTION
===================================================== */

function renderFinalMixedQuestion(
    question
) {

    if (
        question.type ===
        "short"
    ) {

        renderShort(
            question
        );


        setFinalPrompt(
            "FINAL MIX • Choose the correct short answer."
        );


        return;

    }


    if (
        question.type ===
        "question"
    ) {

        renderBuild(
            question.words,
            true
        );


        setFinalPrompt(
            "FINAL MIX • Build the correct yes/no question."
        );


        return;

    }


    if (
        question.type ===
        "negative"
    ) {

        renderBuild(
            question.words,
            false
        );


        setFinalPrompt(
            "FINAL MIX • Build the correct negative sentence."
        );


        return;

    }


    renderBuild(
        question.words,
        false
    );


    setFinalPrompt(
        "FINAL MIX • Build the correct positive sentence."
    );

}


function setFinalPrompt(text) {

    const prompt =
        document.querySelector(
            "#questionArea .prompt"
        );


    if (prompt) {

        prompt.textContent =
            text;

    }

}


/* =====================================================
   BUILD SENTENCE
===================================================== */

function renderBuild(
    words,
    isQuestion
) {

    const area =
        $("#questionArea");


    const correctWords =
        Array.isArray(words)
            ? words
            : words.words;


    const shuffled =
        shuffle(
            correctWords
        );


    area.innerHTML = `

        <div class="prompt">

            ${
                isQuestion

                    ? "Put the words in the correct order to make a question."

                    : "Put the words in the correct order to make a sentence."

            }

        </div>


        <div
            id="builtSentence"
            class="built-sentence"
        >

            <span class="empty-note">
                Click or drag the words below
            </span>

        </div>


        <div
            id="wordBank"
            class="word-bank"
        >
        </div>

    `;


    const bank =
        $("#wordBank");


    const built =
        $("#builtSentence");


    bank.dataset.isQuestion =
        isQuestion
            ? "true"
            : "false";


    setupBuildDropZones(
        built,
        bank
    );


    shuffled.forEach(
        function (word, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "word-chip";


            button.textContent =
                word;


            button.dataset.uid =
                "w" +
                index +
                "-" +
                word;


            button.draggable =
                true;


            button.addEventListener(
                "click",
                function () {

                    if (
                        button.classList.contains(
                            "used"
                        )
                    ) {

                        return;

                    }


                    chooseWord(
                        button,
                        word
                    );

                }
            );


            enableChipDrag(
                button
            );


            bank.appendChild(
                button
            );

        }
    );

}


function enableChipDrag(
    chip
) {

    chip.addEventListener(
        "dragstart",
        function (e) {

            if (
                state.answered ||
                chip.classList.contains(
                    "used"
                )
            ) {

                e.preventDefault();

                return;

            }


            chip.classList.add(
                "dragging"
            );


            e.dataTransfer.setData(
                "text/plain",
                chip.dataset.uid ||
                    chip.textContent
            );


            e.dataTransfer.effectAllowed =
                "move";


            window._dragChip =
                chip;

        }
    );


    chip.addEventListener(
        "dragend",
        function () {

            chip.classList.remove(
                "dragging"
            );


            window._dragChip =
                null;


            const built =
                $("#builtSentence");


            const bank =
                $("#wordBank");


            if (built) {

                built.classList.remove(
                    "drag-over"
                );

            }


            if (bank) {

                bank.classList.remove(
                    "drag-over"
                );

            }

        }
    );

}


function setupBuildDropZones(
    built,
    bank
) {

    if (
        !built ||
        !bank
    ) {

        return;

    }


    built.addEventListener(
        "dragover",
        function (e) {

            e.preventDefault();

            built.classList.add(
                "drag-over"
            );

        }
    );


    built.addEventListener(
        "dragleave",
        function () {

            built.classList.remove(
                "drag-over"
            );

        }
    );


    built.addEventListener(
        "drop",
        function (e) {

            e.preventDefault();

            built.classList.remove(
                "drag-over"
            );


            const chip =
                window._dragChip;


            if (
                !chip ||
                state.answered
            ) {

                return;

            }


            // From bank → sentence
            if (
                chip.classList.contains(
                    "word-chip"
                ) &&
                !chip.classList.contains(
                    "used"
                )
            ) {

                chooseWord(
                    chip,
                    chip.textContent
                );

            }

        }
    );


    bank.addEventListener(
        "dragover",
        function (e) {

            e.preventDefault();

            bank.classList.add(
                "drag-over"
            );

        }
    );


    bank.addEventListener(
        "dragleave",
        function () {

            bank.classList.remove(
                "drag-over"
            );

        }
    );


    bank.addEventListener(
        "drop",
        function (e) {

            e.preventDefault();

            bank.classList.remove(
                "drag-over"
            );


            const chip =
                window._dragChip;


            if (
                !chip ||
                state.answered
            ) {

                return;

            }


            // From sentence → bank
            if (
                chip.classList.contains(
                    "built-chip"
                )
            ) {

                returnBuiltChipToBank(
                    chip
                );

            }

        }
    );

}


function returnBuiltChipToBank(
    builtChip
) {

    const built =
        $("#builtSentence");


    const bank =
        $("#wordBank");


    if (
        !built ||
        !bank
    ) {

        return;

    }


    const uid =
        builtChip.dataset.uid;


    const word =
        builtChip.textContent;


    builtChip.remove();


    // Restore matching bank chip
    const bankChip =
        [
            ...bank.querySelectorAll(
                ".word-chip"
            )
        ]
        .find(
            function (btn) {

                if (uid) {

                    return (
                        btn.dataset.uid ===
                        uid
                    );

                }


                return (
                    btn.textContent ===
                        word &&
                    btn.classList.contains(
                        "used"
                    )
                );

            }
        );


    if (bankChip) {

        bankChip.classList.remove(
            "used"
        );

    }


    if (
        !built.querySelector(
            ".built-chip"
        )
    ) {

        built.innerHTML =
            `
            <span class="empty-note">
                Click or drag the words below
            </span>
            `;

    }

}


/* =====================================================
   CHOOSE WORD
===================================================== */

function chooseWord(
    button,
    word
) {

    if (
        state.answered
    ) {

        return;
    }


    if (
        button.classList.contains(
            "used"
        )
    ) {

        return;

    }


    const built =
        $("#builtSentence");


    button.classList.add(
        "used"
    );


    if (
        built.querySelector(
            ".empty-note"
        )
    ) {

        built.innerHTML =
            "";

    }


    const chip =
        document.createElement(
            "button"
        );


    chip.type =
        "button";


    chip.className =
        "built-chip";


    chip.textContent =
        word;


    chip.dataset.uid =
        button.dataset.uid ||
        "";


    chip.draggable =
        true;


    chip.addEventListener(
        "click",
        function () {

            if (
                state.answered
            ) {

                return;
            }


            returnBuiltChipToBank(
                chip
            );

        }
    );


    enableBuiltChipDrag(
        chip
    );


    built.appendChild(
        chip
    );


    const current =
        state.questions[
            state.index
        ];


    let correctWords =
        null;


    if (
        Array.isArray(
            current
        )
    ) {

        correctWords =
            current;

    }

    else if (
        current &&
        Array.isArray(
            current.words
        )
    ) {

        correctWords =
            current.words;

    }


    if (
        !correctWords
    ) {

        return;

    }


    const selected =
        [
            ...built.querySelectorAll(
                ".built-chip"
            )
        ]
        .map(
            function (item) {

                return item.textContent;

            }
        );


    if (
        selected.length ===
        correctWords.length
    ) {

        checkAnswer(
            selected.join(" "),
            correctWords.join(" ")
        );

    }

}


function enableBuiltChipDrag(
    chip
) {

    chip.addEventListener(
        "dragstart",
        function (e) {

            if (
                state.answered
            ) {

                e.preventDefault();

                return;

            }


            chip.classList.add(
                "dragging"
            );


            e.dataTransfer.setData(
                "text/plain",
                chip.dataset.uid ||
                    chip.textContent
            );


            e.dataTransfer.effectAllowed =
                "move";


            window._dragChip =
                chip;

        }
    );


    chip.addEventListener(
        "dragend",
        function () {

            chip.classList.remove(
                "dragging"
            );


            window._dragChip =
                null;


            const built =
                $("#builtSentence");


            const bank =
                $("#wordBank");


            if (built) {

                built.classList.remove(
                    "drag-over"
                );

            }


            if (bank) {

                bank.classList.remove(
                    "drag-over"
                );

            }

        }
    );

}


/* =====================================================
   COMPLETE IT
===================================================== */

function renderComplete(
    question
) {

    $("#questionArea").innerHTML = `

        <div class="prompt">
            Choose the word that makes the sentence correct.
        </div>


        <div class="target-sentence">

            ${question.before}

            <span class="blank">
                _____
            </span>

            ${question.after}

        </div>


        <div
            id="answerGrid"
            class="answer-grid"
        >
        </div>

    `;


    const grid =
        $("#answerGrid");


    shuffle(
        question.options
    ).forEach(
        function (option) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "answer-option";


            button.textContent =
                option;


            button.addEventListener(
                "click",
                function () {

                    checkChoice(
                        button,
                        option,
                        question.answer
                    );

                }
            );


            grid.appendChild(
                button
            );

        }
    );

}


/* =====================================================
   SHORT ANSWERS
===================================================== */

function renderShort(
    question
) {

    $("#questionArea").innerHTML = `

        <div class="prompt">
            Choose the correct short answer.
        </div>


        <div class="context-box">

            <strong>
                Situation
            </strong>


            <span>
                ${question.context}
            </span>

        </div>


        <div class="target-sentence">
            ${question.question}
        </div>


        <div
            class="answer-grid"
            id="answerGrid"
        >
        </div>

    `;


    const grid =
        $("#answerGrid");


    shuffle(
        question.options
    ).forEach(
        function (option) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "answer-option";


            button.textContent =
                option;


            button.addEventListener(
                "click",
                function () {

                    checkChoice(
                        button,
                        option,
                        question.answer
                    );

                }
            );


            grid.appendChild(
                button
            );

        }
    );

}


/* =====================================================
   MIXED
===================================================== */

function renderMixed(
    question
) {

    if (
        question.type ===
        "short"
    ) {

        renderShort(
            question
        );


        return;

    }


    if (
        question.type ===
        "question"
    ) {

        renderBuild(
            question.words,
            true
        );


        return;

    }


    renderBuild(
        question.words,
        false
    );

}


/* =====================================================
   CHOICE ANSWER
===================================================== */

function checkChoice(
    button,
    chosen,
    correct
) {

    if (
        state.answered
    ) {

        return;
    }


    state.answered =
        true;


    const isCorrect =
        normalize(chosen) ===
        normalize(correct);


    button.classList.add(
        isCorrect
            ? "correct"
            : "wrong"
    );


    if (
        !isCorrect
    ) {

        $$(".answer-option")
            .forEach(
                function (item) {

                    if (
                        normalize(
                            item.textContent
                        ) ===
                        normalize(
                            correct
                        )
                    ) {

                        item.classList.add(
                            "correct"
                        );

                    }

                }
            );

    }


    finishAnswer(
        isCorrect,
        correct
    );

}


/* =====================================================
   BUILD ANSWER
===================================================== */

function checkAnswer(
    answer,
    correct
) {

    if (
        state.answered
    ) {

        return;
    }


    state.answered =
        true;


    const isCorrect =
        normalize(answer) ===
        normalize(correct);


    finishAnswer(
        isCorrect,
        correct
    );

}


/* =====================================================
   FINISH ANSWER
   NO NEXT BUTTON
===================================================== */

function finishAnswer(
    isCorrect,
    correct
) {

    try {

        if (
            isCorrect
        ) {

            state.correct++;

            state.streak++;


            state.score +=
                100 +
                Math.max(
                    0,
                    state.streak - 1
                ) * 10;


            state.xp +=
                10;


            const feedback =
                document.getElementById(
                    "feedback"
                );


            if (feedback) {

                feedback.textContent =
                    "✓ Correct!";

                feedback.className =
                    "feedback good";

            }

        }

        else {

            state.streak =
                0;


            const feedback =
                document.getElementById(
                    "feedback"
                );


            if (feedback) {

                feedback.textContent =
                    "Not quite. Correct answer: " +
                    correct;

                feedback.className =
                    "feedback bad";

            }

        }


        const scoreEl =
            document.getElementById(
                "score"
            );


        if (scoreEl) {

            scoreEl.textContent =
                state.score;

        }


        const streakEl =
            document.getElementById(
                "streakText"
            );


        if (streakEl) {

            streakEl.textContent =
                "STREAK ×" +
                Math.max(
                    1,
                    state.streak
                );

        }


        saveXP();


        const progressFill =
            document.getElementById(
                "progressFill"
            );


        if (
            progressFill &&
            state.questions.length
        ) {

            progressFill.style.width =
                (
                    (
                        (state.index + 1) /
                        state.questions.length
                    ) * 100
                ) +
                "%";

        }

    } catch (err) {

        console.error(
            "finishAnswer UI error:",
            err
        );

    }


    // Always advance — even if UI update failed
    setTimeout(
        function () {

            nextQuestion();

        },
        900
    );

}


/* =====================================================
   NEXT QUESTION
===================================================== */

function nextQuestion() {

    state.index++;


    if (
        state.index >=
        state.questions.length
    ) {

        if (
            state.finalMixed
        ) {

            finishFinalMixed();

        }

        else {

            finishPractice();

        }


        return;

    }


    renderQuestion();

}


/* =====================================================
   NORMAL PRACTICE COMPLETE
===================================================== */

function finishPractice() {

    markPracticeDone(
        state.group,
        state.practice
    );


    const total =
        state.questions.length;


    $("#resultTitle").textContent =

        state.correct === total

            ? "Perfect!"

            : state.correct >=
              Math.ceil(
                  total * 0.75
              )

                ? "Great job!"

                : "Keep practising!";


    $("#resultSummary").textContent =

        `You got ${state.correct} out of ${total} correct in ${GROUPS[state.group].title}.`;


    $("#resultScore").textContent =
        state.score;


    $("#resultCorrect").textContent =
        `${state.correct}/${total}`;


    $("#resultXP").textContent =
        `+${state.correct * 10}`;


    saveArcadeProgress(
        state.correct * 10
    );


    updateMenuProgress();


    show(
        "resultScreen"
    );

}


/* =====================================================
   FINAL MIXED COMPLETE
===================================================== */

function finishFinalMixed() {

    markFinalMixedDone();


    const total =
        state.questions.length;


    $("#resultTitle").textContent =

        state.correct === total

            ? "Final Boss Defeated! 🏆"

            : state.correct >=
              Math.ceil(
                  total * 0.75
              )

                ? "Excellent Final Mix!"

                : "Final Challenge Complete!";


    $("#resultSummary").textContent =

        `You got ${state.correct} out of ${total} correct across all Simple Present forms.`;


    $("#resultScore").textContent =
        state.score;


    $("#resultCorrect").textContent =
        `${state.correct}/${total}`;


    $("#resultXP").textContent =
        `+${state.correct * 10}`;


    saveArcadeProgress(
        state.correct * 10
    );


    renderHome();


    show(
        "resultScreen"
    );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer =
    null;


function toast(message) {

    const toastElement =
        $("#toast");


    toastElement.textContent =
        message;


    toastElement.classList.add(
        "show"
    );


    if (
        toastTimer
    ) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        setTimeout(
            function () {

                toastElement.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =====================================================
   THEME
===================================================== */

function applyTheme() {

    /*
     * Shared site-wide theme key, same convention
     * as the homepage and every other game: a
     * stored value of "light" means light mode,
     * anything else (including nothing stored)
     * means dark mode.
     */

    let saved = null;

    try {

        saved =
            localStorage.getItem(
                "learningArcadeTheme"
            );

    } catch (error) {

        console.error(
            "Could not load theme:",
            error
        );

        saved = null;

    }


    const isDark =
        saved !== "light";


    document.body.classList.toggle(
        "dark-mode",
        isDark
    );


    document.body.classList.toggle(
        "light-mode",
        !isDark
    );


    const button =
        document.getElementById(
            "themeToggle"
        );


    if (!button) {
        return;
    }


    button.textContent =
        isDark
            ? "☀️"
            : "🌙";


    button.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );


    button.setAttribute(
        "title",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

}


function toggleTheme() {

    const currentlyDark =
        document.body.classList.contains(
            "dark-mode"
        );


    const newTheme =
        currentlyDark
            ? "light"
            : "dark";


    try {

        localStorage.setItem(
            "learningArcadeTheme",
            newTheme
        );

    } catch (error) {

        console.error(
            "Could not save theme:",
            error
        );

    }


    applyTheme();

}


/* =====================================================
   INITIALIZE PATH NUMBERS
===================================================== */

document
    .querySelectorAll(
        ".path-step"
    )
    .forEach(
        function (step) {

            const number =
                step.querySelector(
                    "span"
                );


            if (number) {

                step.dataset.number =
                    number.textContent.trim();

            }

        }
    );


/* =====================================================
   EVENT LISTENERS
===================================================== */

$$(".group-card")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    openGroup(
                        button.dataset.group
                    );

                }
            );

        }
    );


$$(".practice-card")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    startPractice(
                        button.dataset.practice
                    );

                }
            );

        }
    );


$("#backHome")
    .addEventListener(
        "click",
        function () {

            renderHome();

            show(
                "homeScreen"
            );

        }
    );


$("#backMenu")
    .addEventListener(
        "click",
        function () {

            if (
                state.finalMixed
            ) {

                renderHome();

                show(
                    "homeScreen"
                );

                return;

            }


            updateMenuProgress();

            show(
                "practiceMenu"
            );

        }
    );


$("#resultMenuButton")
    .addEventListener(
        "click",
        function () {

            if (
                state.finalMixed
            ) {

                renderHome();

                show(
                    "homeScreen"
                );

                return;

            }


            updateMenuProgress();

            show(
                "practiceMenu"
            );

        }
    );


$("#againButton")
    .addEventListener(
        "click",
        function () {

            if (
                state.finalMixed
            ) {

                startFinalMixed();

                return;

            }


            startPractice(
                state.practice
            );

        }
    );


const themeToggleEl = $("#themeToggle");
if (themeToggleEl) {
    themeToggleEl.addEventListener("click", toggleTheme);
}


/* =====================================================
   INITIALIZE
===================================================== */

applyTheme();

saveXP();

renderHome();

show(
    "homeScreen"
)
/* =====================================================
   OPTIONAL ACCESSIBILITY TEST HELPER
   Development / testing only
===================================================== */

function testFutureModulesAccessibility() {

    const cards =
        document.querySelectorAll(
            ".future-card.disabled"
        );


    if (!cards.length) {

        console.warn(
            "No disabled future-module cards found."
        );

        return;

    }


    cards.forEach(
        function (card) {

            console.log({

                module:
                    card.querySelector(
                        "h4"
                    )?.textContent.trim(),

                ariaDisabled:
                    card.getAttribute(
                        "aria-disabled"
                    ),

                tabIndex:
                    card.tabIndex,

                focusableByTab:
                    card.tabIndex >= 0,

                screenReaderStatus:
                    card.querySelector(
                        ".sr-only"
                    )?.textContent.trim()

            });

        }
    );

}


/*
 * Run manually from the browser console:
 *
 * testFutureModulesAccessibility();
 */
