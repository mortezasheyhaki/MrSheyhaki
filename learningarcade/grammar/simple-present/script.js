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
   SHOW / HIDE SCREENS + BROWSER HISTORY
===================================================== */

let historyReady = false;


function show(
    id,
    addHistory = true
) {

    $$(".screen")
        .forEach(
            function (screen) {

                screen.classList.add(
                    "hidden"
                );

            }
        );


    const target =
        document.getElementById(
            id
        );


    if (target) {

        target.classList.remove(
            "hidden"
        );

    }


    /*
       Add this screen to browser history.

       We do NOT add another history entry when
       show() is being called by the phone/browser
       Back button.
    */
    if (addHistory) {

        if (!historyReady) {

            history.replaceState(
                {
                    arcadeScreen: "homeScreen"
                },
                "",
                window.location.href
            );

            historyReady = true;

        }


        history.pushState(
            {
                arcadeScreen: id
            },
            "",
            window.location.href
        );

    }


    /*
       Always start the new screen at the top.
    */
    window.scrollTo(
        {
            top: 0,
            behavior: "auto"
        }
    );

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(text) {

    return String(text || "")
        .toLowerCase()
        .replace(
            /[^\w\s']/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =====================================================
   SHUFFLE
===================================================== */

function shuffle(array) {

    const copy =
        [
            ...array
        ];


    for (
        let i =
            copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            copy[i],
            copy[j]
        ] =
            [
                copy[j],
                copy[i]
            ];

    }


    return copy;

}


/* =====================================================
   LOCAL STORAGE HELPERS
===================================================== */

function getDonePractices(group) {

    try {

        return JSON.parse(
            localStorage.getItem(
                "sp_done_" + group
            ) || "[]"
        );

    } catch (error) {

        return [];

    }

}


function markPracticeDone(group, practice) {

    const done =
        getDonePractices(
            group
        );


    if (
        !done.includes(
            practice
        )
    ) {

        done.push(
            practice
        );


        localStorage.setItem(
            "sp_done_" + group,
            JSON.stringify(
                done
            )
        );

    }

}


function isFinalMixedDone() {

    return localStorage.getItem(
        "sp_final_mixed_done"
    ) === "1";

}


function markFinalMixedDone() {

    localStorage.setItem(
        "sp_final_mixed_done",
        "1"
    );

}


/* =====================================================
   RENDER HOME
===================================================== */

function renderHome() {

    const group1Done =
        getDonePractices(
            "group1"
        ).length >= 5;


    const group2Done =
        getDonePractices(
            "group2"
        ).length >= 5;


    const mixedUnlocked =
        group1Done &&
        group2Done;


    // Path steps
    $$(".path-step")
        .forEach(
            function (step) {

                const number =
                    step.dataset.number;


                step.classList.remove(
                    "active",
                    "locked",
                    "completed"
                );


                if (
                    number === "1"
                ) {

                    step.classList.add(
                        group1Done
                            ? "completed"
                            : "active"
                    );

                }


                if (
                    number === "2"
                ) {

                    step.classList.add(
                        group2Done
                            ? "completed"
                            : "active"
                    );

                }


                if (
                    number === "3"
                ) {

                    step.classList.add(
                        mixedUnlocked
                            ? (
                                isFinalMixedDone()
                                    ? "completed"
                                    : "active"
                            )
                            : "locked"
                    );

                }

            }
        );


    // Soft-rect completion marks (any button for that group)
    $$('.soft-rect[data-group="group1"]').forEach(function (el) {
        el.classList.toggle("completed", group1Done);
    });
    $$('.soft-rect[data-group="group2"]').forEach(function (el) {
        el.classList.toggle("completed", group2Done);
    });

    // Mixed challenge button
    const mixedCard = document.querySelector('[data-group="mixed"]');
    if (mixedCard) {
        if (mixedUnlocked) {
            mixedCard.disabled = false;
            mixedCard.classList.remove("locked-card");
            const lockNote = $("#mixedLockNote");
            if (lockNote) {
                lockNote.textContent = isFinalMixedDone()
                    ? "✓ COMPLETED — play again"
                    : "Unlocked — all subjects mixed";
            }
            if (isFinalMixedDone()) {
                mixedCard.classList.add("completed");
            }
        } else {
            mixedCard.disabled = true;
            mixedCard.classList.add("locked-card");
        }
    }

}


/* =====================================================
   OPEN GROUP
===================================================== */

function openGroup(group) {

    if (
        group === "mixed"
    ) {

        startFinalMixed();

        return;

    }


    state.group =
        group;


    state.finalMixed =
        false;


    const data =
        GROUPS[group];


    $("#menuEyebrow").textContent =
        data.label;


    $("#menuTitle").textContent =
        data.title;


    $("#menuDescription").textContent =
        data.description;


    updateMenuProgress();


    show(
        "practiceMenu"
    );

}


/* =====================================================
   UPDATE MENU PROGRESS
===================================================== */

function updateMenuProgress() {

    const done =
        getDonePractices(
            state.group
        );


    const total =
        5;


    $("#groupProgressText").textContent =
        done.length +
        " / " +
        total +
        " practices completed";


    $$(".practice-card")
        .forEach(
            function (card) {

                const practice =
                    card.dataset.practice;


                card.classList.toggle(
                    "completed",
                    done.includes(
                        practice
                    )
                );

            }
        );

}


/* =====================================================
   START PRACTICE
===================================================== */

function startPractice(practice) {

    state.practice =
        practice;


    state.finalMixed =
        false;


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


    const groupData =
        GROUPS[state.group];


    let questions =
        [];


    if (
        practice === "mixed"
    ) {

        // Build a mixed set from the current group
        const build =
            shuffle(
                groupData.practices.build
            ).slice(
                0,
                4
            );


        const complete =
            shuffle(
                groupData.practices.complete
            ).slice(
                0,
                3
            );


        const question =
            shuffle(
                groupData.practices.question
            ).slice(
                0,
                3
            );


        const short =
            shuffle(
                groupData.practices.short
            ).slice(
                0,
                2
            );


        questions =
            shuffle(
                [
                    ...build.map(
                        function (item) {

                            return {
                                type: "build",
                                words: item
                            };

                        }
                    ),
                    ...complete.map(
                        function (item) {

                            return {
                                type: "complete",
                                ...item
                            };

                        }
                    ),
                    ...question.map(
                        function (item) {

                            return {
                                type: "question",
                                ...item
                            };

                        }
                    ),
                    ...short.map(
                        function (item) {

                            return {
                                type: "short",
                                ...item
                            };

                        }
                    )
                ]
            );

    }

    else {

        questions =
            shuffle(
                [
                    ...groupData.practices[practice]
                ]
            );

    }


    state.questions =
        questions;


    $("#practiceLabel").textContent =
        practiceNames[practice].toUpperCase();


    $("#gameTitle").textContent =
        practiceNames[practice];


    $("#score").textContent =
        "0";


    $("#streakText").textContent =
        "STREAK ×1";


    $("#progressFill").style.width =
        "0%";


    $("#feedback").textContent =
        "";


    $("#feedback").className =
        "feedback";


    show(
        "gameScreen"
    );


    renderQuestion();

}


/* =====================================================
   START FINAL MIXED
===================================================== */

function startFinalMixed() {

    state.group =
        "mixed";


    state.practice =
        "finalMixed";


    state.finalMixed =
        true;


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


    state.questions =
        shuffle(
            [
                ...FINAL_MIXED_QUESTIONS
            ]
        );


    $("#practiceLabel").textContent =
        "FINAL MIXED";


    $("#gameTitle").textContent =
        "Final Mixed Challenge";


    $("#score").textContent =
        "0";


    $("#streakText").textContent =
        "STREAK ×1";


    $("#progressFill").style.width =
        "0%";


    $("#feedback").textContent =
        "";


    $("#feedback").className =
        "feedback";


    show(
        "gameScreen"
    );


    renderQuestion();

}


/* =====================================================
   RENDER QUESTION
===================================================== */

function renderQuestion() {
    state.attempts = 0;


    state.answered =
        false;


    $("#feedback").textContent =
        "";


    $("#feedback").className =
        "feedback";


    const question =
        state.questions[
            state.index
        ];


    $("#questionCounter").textContent =
        (state.index + 1) +
        " / " +
        state.questions.length;


    // Determine type
    if (
        Array.isArray(
            question
        )
    ) {

        // Build the Sentence style
        renderBuild(
            question,
            false
        );

    }

    else if (
        question.type === "complete" ||
        (
            question.before !== undefined &&
            question.options
        )
    ) {

        renderComplete(
            question
        );

    }

    else if (
        question.type === "short" ||
        (
            question.context &&
            question.options
        )
    ) {

        renderShort(
            question
        );

    }

    else if (
        question.type === "question" ||
        (
            question.words &&
            question.words[0] &&
            (
                question.words[0] === "Do" ||
                question.words[0] === "Does"
            )
        )
    ) {

        renderBuild(
            question.words || question,
            true
        );

    }

    else if (
        question.words
    ) {

        renderBuild(
            question.words,
            false
        );

    }

    else {

        renderBuild(
            question,
            false
        );

    }

}


/* =====================================================
   BUILD THE SENTENCE / MAKE THE QUESTION
===================================================== */

function renderBuild(
    words,
    isQuestion
) {

    const promptText =
        isQuestion
            ? "Put the words in the correct order to make a question."
            : "Put the words in the correct order to make a sentence.";


    $("#questionArea").innerHTML = `

        <div class="prompt">
            ${promptText}
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


    const bank = $("#wordBank");
    const built = $("#builtSentence");

    // Create shuffled word chips
    shuffle([...words]).forEach(function (word, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "word-chip";
        button.textContent = word;
        button.dataset.uid = "chip-" + index + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
        button.dataset.word = word;

        // Click fallback (tap to place)
        button.addEventListener("click", function (e) {
            if (button._dragMoved) {
                button._dragMoved = false;
                return;
            }
            chooseWord(button, word);
        });

        bank.appendChild(button);
    });

    // Unified pointer drag-and-drop (mouse + touch)
    initBuildPointerDnD(built, bank);
}


/**
 * Pointer-based DnD for Build the Sentence.
 * - Drag word-chip from bank → drop on sentence (or anywhere over sentence)
 * - Drag built-chip → reorder inside sentence, or drop on bank to return
 * Works with mouse and touch.
 */
function initBuildPointerDnD(built, bank) {
    if (!built || !bank) return;

    let active = null; // { el, source, uid, word, ghost, startX, startY, moved, originParent }

    function clearDragOver() {
        built.classList.remove("drag-over");
        bank.classList.remove("drag-over");
        built.querySelectorAll(".built-chip.drop-target").forEach(function (c) {
            c.classList.remove("drop-target");
        });
    }

    function destroyGhost() {
        if (active && active.ghost && active.ghost.parentNode) {
            active.ghost.parentNode.removeChild(active.ghost);
        }
        if (active && active.el) {
            active.el.classList.remove("dragging", "dnd-source");
            active.el.style.opacity = "";
        }
        clearDragOver();
        active = null;
    }

    function createGhost(el, x, y) {
        const ghost = el.cloneNode(true);
        ghost.classList.add("dnd-ghost");
        ghost.classList.remove("dragging", "used", "dnd-source");
        ghost.style.position = "fixed";
        ghost.style.left = x + "px";
        ghost.style.top = y + "px";
        ghost.style.zIndex = "9999";
        ghost.style.pointerEvents = "none";
        ghost.style.margin = "0";
        ghost.style.transform = "translate(-50%, -50%) scale(1.08)";
        ghost.style.opacity = "0.95";
        document.body.appendChild(ghost);
        return ghost;
    }

    function elementFromPointSafe(x, y) {
        // Temporarily hide ghost so elementFromPoint hits real targets
        if (active && active.ghost) active.ghost.style.visibility = "hidden";
        const el = document.elementFromPoint(x, y);
        if (active && active.ghost) active.ghost.style.visibility = "visible";
        return el;
    }

    function getDragAfterElement(container, x) {
        const chips = [...container.querySelectorAll(".built-chip:not(.dnd-source):not(.dragging)")];
        return chips.reduce(function (closest, child) {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    function onPointerDown(e) {
        if (state.answered) return;

        const chip = e.target.closest(".word-chip, .built-chip");
        if (!chip) return;
        if (chip.classList.contains("used")) return;
        // Only chips in bank or built sentence
        if (!bank.contains(chip) && !built.contains(chip)) return;

        // Ignore non-primary mouse button
        if (e.pointerType === "mouse" && e.button !== 0) return;

        const isBank = bank.contains(chip);
        const rect = chip.getBoundingClientRect();
        const cx = e.clientX;
        const cy = e.clientY;

        active = {
            el: chip,
            source: isBank ? "bank" : "built",
            uid: chip.dataset.uid,
            word: chip.dataset.word || chip.textContent,
            ghost: null,
            startX: cx,
            startY: cy,
            moved: false,
            pointerId: e.pointerId
        };

        try {
            chip.setPointerCapture(e.pointerId);
        } catch (err) {}

        chip.addEventListener("pointermove", onPointerMove);
        chip.addEventListener("pointerup", onPointerUp);
        chip.addEventListener("pointercancel", onPointerUp);
    }

    function onPointerMove(e) {
        if (!active || active.pointerId !== e.pointerId) return;

        const dx = e.clientX - active.startX;
        const dy = e.clientY - active.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Threshold before treating as drag (keeps click working)
        if (!active.moved && dist < 8) return;

        if (!active.moved) {
            active.moved = true;
            active.el._dragMoved = true;
            active.el.classList.add("dragging", "dnd-source");
            active.el.style.opacity = "0.35";
            active.ghost = createGhost(active.el, e.clientX, e.clientY);
            // Prevent scroll while dragging on touch
            e.preventDefault();
        }

        if (active.ghost) {
            active.ghost.style.left = e.clientX + "px";
            active.ghost.style.top = e.clientY + "px";
        }

        e.preventDefault();

        const under = elementFromPointSafe(e.clientX, e.clientY);
        clearDragOver();

        if (!under) return;

        if (built.contains(under) || under === built || under.closest(".built-sentence")) {
            built.classList.add("drag-over");
            // Highlight insert position among built chips
            const after = getDragAfterElement(built, e.clientX);
            if (after) after.classList.add("drop-target");
        } else if (bank.contains(under) || under === bank || under.closest(".word-bank")) {
            if (active.source === "built") {
                bank.classList.add("drag-over");
            }
        }
    }

    function onPointerUp(e) {
        if (!active || active.pointerId !== e.pointerId) return;

        const chip = active.el;
        const wasMoved = active.moved;
        const source = active.source;
        const word = active.word;

        chip.removeEventListener("pointermove", onPointerMove);
        chip.removeEventListener("pointerup", onPointerUp);
        chip.removeEventListener("pointercancel", onPointerUp);

        try {
            chip.releasePointerCapture(e.pointerId);
        } catch (err) {}

        if (!wasMoved) {
            // Treat as click — let the click handler run
            destroyGhost();
            return;
        }

        const under = elementFromPointSafe(e.clientX, e.clientY);
        const overBuilt = under && (built.contains(under) || under === built || under.closest("#builtSentence") || under.closest(".built-sentence"));
        const overBank = under && (bank.contains(under) || under === bank || under.closest("#wordBank") || under.closest(".word-bank"));

        if (source === "bank" && overBuilt && !chip.classList.contains("used")) {
            // Place word into sentence (at insert position if possible)
            const after = getDragAfterElement(built, e.clientX);
            chooseWord(chip, word, after);
        } else if (source === "built" && overBank) {
            returnBuiltChipToBank(chip);
        } else if (source === "built" && overBuilt) {
            // Reorder inside sentence
            const after = getDragAfterElement(built, e.clientX);
            if (after == null) {
                built.appendChild(chip);
            } else if (after !== chip) {
                built.insertBefore(chip, after);
            }
            // Re-check answer if all slots filled
            maybeCheckBuiltAnswer();
        }
        // else: cancelled — chip stays where it was

        destroyGhost();

        // Reset click-guard shortly after
        setTimeout(function () {
            if (chip) chip._dragMoved = false;
        }, 40);
    }

    // Use pointer events on the container so newly created chips work too
    bank.addEventListener("pointerdown", onPointerDown);
    built.addEventListener("pointerdown", onPointerDown);

    // Prevent native image/text drag ghosts
    bank.addEventListener("dragstart", function (e) { e.preventDefault(); });
    built.addEventListener("dragstart", function (e) { e.preventDefault(); });
}


function returnBuiltChipToBank(builtChip) {
    const built = $("#builtSentence");
    const bank = $("#wordBank");
    if (!built || !bank || !builtChip) return;

    const uid = builtChip.dataset.uid;
    const word = builtChip.dataset.word || builtChip.textContent;

    builtChip.remove();

    // Restore matching bank chip
    const bankChip = [...bank.querySelectorAll(".word-chip")].find(function (btn) {
        if (uid) return btn.dataset.uid === uid;
        return btn.textContent === word && btn.classList.contains("used");
    });

    if (bankChip) {
        bankChip.classList.remove("used");
    }

    if (!built.querySelector(".built-chip")) {
        built.innerHTML = `
            <span class="empty-note">
                Click or drag the words below
            </span>
        `;
    }
}


function maybeCheckBuiltAnswer() {
    const built = $("#builtSentence");
    if (!built) return;

    const current = state.questions[state.index];
    let correctWords = null;
    if (Array.isArray(current)) correctWords = current;
    else if (current && Array.isArray(current.words)) correctWords = current.words;
    if (!correctWords) return;

    const selected = [...built.querySelectorAll(".built-chip")].map(function (item) {
        return item.textContent;
    });

    if (selected.length === correctWords.length) {
        checkAnswer(selected.join(" "), correctWords.join(" "));
    }
}


/* =====================================================
   CHOOSE WORD
===================================================== */

function chooseWord(button, word, insertBeforeEl) {
    if (state.answered) return;
    if (button.classList.contains("used")) return;

    const built = $("#builtSentence");
    if (!built) return;

    button.classList.add("used");

    if (built.querySelector(".empty-note")) {
        built.innerHTML = "";
    }

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "built-chip";
    chip.textContent = word;
    chip.dataset.uid = button.dataset.uid || "";
    chip.dataset.word = word;

    // Click to return to bank
    chip.addEventListener("click", function () {
        if (state.answered) return;
        if (chip._dragMoved) {
            chip._dragMoved = false;
            return;
        }
        returnBuiltChipToBank(chip);
    });

    if (insertBeforeEl && built.contains(insertBeforeEl)) {
        built.insertBefore(chip, insertBeforeEl);
    } else {
        built.appendChild(chip);
    }

    maybeCheckBuiltAnswer();
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

    if (state.answered) {
        return;
    }

    if (typeof state.attempts !== "number") {
        state.attempts = 0;
    }

    const isCorrect =
        normalize(chosen) ===
        normalize(correct);

    if (isCorrect) {
        state.answered = true;
        state.attempts = 0;
        button.classList.add("correct");
        $$(".answer-option").forEach(function (item) {
            item.disabled = true;
        });
        finishAnswer(true, correct);
        return;
    }

    // Wrong choice
    state.attempts += 1;
    button.classList.add("wrong");
    button.disabled = true;

    const feedback = document.getElementById("feedback");

    if (state.attempts >= 3) {
        state.answered = true;
        state.streak = 0;
        $$(".answer-option").forEach(function (item) {
            item.disabled = true;
            if (normalize(item.textContent) === normalize(correct)) {
                item.classList.add("correct");
            }
        });
        if (feedback) {
            feedback.textContent = "Correct answer: " + correct;
            feedback.className = "feedback bad";
        }
        setTimeout(function () {
            state.attempts = 0;
            nextQuestion();
        }, 1400);
        return;
    }

    if (feedback) {
        feedback.textContent =
            "Not quite — try again! (" + (3 - state.attempts) + " left)";
        feedback.className = "feedback bad";
    }

    // Allow other options; keep wrong ones disabled so they can't re-pick the same
    state.answered = false;
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

    if (typeof state.attempts !== "number") {
        state.attempts = 0;
    }

    const isCorrect =
        normalize(answer) ===
        normalize(correct);

    if (isCorrect) {
        state.answered = true;
        state.attempts = 0;
        finishAnswer(true, correct);
        return;
    }

    // Wrong answer: do not lock the question yet
    state.attempts += 1;

    const feedback = document.getElementById("feedback");
    const isChoice = !!(document.querySelector(".answer-option, .option-btn"));

    if (isChoice && state.attempts >= 3) {
        // Multiple choice: reveal correct after 3 tries, then advance
        state.answered = true;
        if (feedback) {
            feedback.textContent = "Correct answer: " + correct;
            feedback.className = "feedback bad";
        }
        // Highlight correct option if present
        document.querySelectorAll(".answer-option, .option-btn").forEach(function (btn) {
            btn.disabled = true;
            if (normalize(btn.textContent) === normalize(correct)) {
                btn.classList.add("correct");
            }
        });
        state.streak = 0;
        setTimeout(function () {
            state.attempts = 0;
            nextQuestion();
        }, 1400);
        return;
    }

    // Try again (build / short / early MC mistakes)
    if (feedback) {
        const left = isChoice ? Math.max(0, 3 - state.attempts) : 0;
        feedback.textContent = isChoice && left
            ? ("Not quite — try again! (" + left + " left)")
            : "Not quite — try again!";
        feedback.className = "feedback bad";
    }

    // Build-the-sentence: unlock chips so they can rearrange
    state.answered = false;
    const built = document.getElementById("builtSentence");
    if (built) {
        // soft pulse wrong state without clearing
        built.classList.add("wrong");
        setTimeout(function () {
            built.classList.remove("wrong");
        }, 450);
    }

    // MC: re-enable options except disable the wrong one briefly
    document.querySelectorAll(".answer-option.wrong, .option-btn.wrong").forEach(function (btn) {
        btn.classList.remove("wrong");
        btn.disabled = false;
    });
}


/* =====================================================
   FINISH ANSWER
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


function laSubmitScore(gameId, gameName, correct, total) {
  try {
    if (!window.LAScores || typeof LAScores.submit !== "function") return;
    var name = LAScores.getPlayerName ? LAScores.getPlayerName() : "";
    var code = LAScores.getClassCode ? LAScores.getClassCode() : "";
    if (!name || !code) return; // need identity
    var score = Math.max(0, Math.round(Number(correct) || 0));
    var maxScore = Math.max(0, Math.round(Number(total) || 0));
    LAScores.submit({
      gameId: gameId,
      gameName: gameName || gameId,
      score: score,
      maxScore: maxScore || undefined
    });
  } catch (e) {}
}

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

    // Stars for Grammar index (based on this practice accuracy)
    (function saveGameStars() {
        var total = state.questions.length || 1;
        var acc = Math.round((state.correct / total) * 100);
        try {
            if (window.LAStars) {
                LAStars.recordPlay("simple-present");
                LAStars.saveFromAccuracy("simple-present", acc);
            }
            laSubmitScore("simple-present", "Simple Present", state.correct, total);
        } catch (e) {}
    })();

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

    // Stars for Grammar index (final mix)
    (function saveGameStars() {
        var total = state.questions.length || 1;
        var acc = Math.round((state.correct / total) * 100);
        try {
            if (window.LAStars) {
                LAStars.recordPlay("simple-present");
                LAStars.saveFromAccuracy("simple-present", acc);
            }
            laSubmitScore("simple-present", "Simple Present · Final Mix", state.correct, total);
        } catch (e) {}
    })();

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
   PHONE / BROWSER BACK BUTTON
===================================================== */

window.addEventListener(
    "popstate",
    function (event) {

        const screen =
            event.state &&
            event.state.arcadeScreen
                ? event.state.arcadeScreen
                : "homeScreen";


        /*
           Update the correct information before
           showing the previous screen.
        */

        if (
            screen === "homeScreen"
        ) {

            renderHome();

        }


        if (
            screen === "practiceMenu"
        ) {

            updateMenuProgress();

        }


        show(
            screen,
            false
        );

    }
);

/* =====================================================
   EVENT LISTENERS
===================================================== */

// Home: open group picker for a practice type
const PRACTICE_LABELS = {
    build: "Build the Sentence",
    complete: "Complete It",
    question: "Make the Question",
    short: "Short Answers",
    mixed: "Group Mix"
};

const PRACTICE_DESCS = {
    build: "Put the words in the right order.",
    complete: "Choose the correct verb or helper.",
    question: "Build yes / no questions.",
    short: "Choose the correct short answer.",
    mixed: "Positive, negative, questions and answers mixed."
};

$$("[data-open-picker]")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            const practice = button.dataset.practice;
            state.practice = practice;
            state.finalMixed = false;

            const label = PRACTICE_LABELS[practice] || practice;
            const desc = PRACTICE_DESCS[practice] || "";

            const eye = $("#menuEyebrow");
            const title = $("#menuTitle");
            const description = $("#menuDescription");
            if (eye) eye.textContent = label.toUpperCase();
            if (title) title.textContent = "Choose a group";
            if (description) description.textContent = desc + " Which subjects?";

            show("practiceMenu");
        });
    });

// Group picker → start the selected practice with that group
$$(".soft-rect-group[data-group]")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            const group = button.dataset.group;
            if (!group || group === "mixed") return;
            state.group = group;
            state.finalMixed = false;
            startPractice(state.practice || "build");
        });
    });

// Challenge mixed button
const mixedLaunch = $("#mixedLaunchBtn");
if (mixedLaunch) {
    mixedLaunch.addEventListener("click", function () {
        if (mixedLaunch.disabled) return;
        startFinalMixed();
    });
}

// Legacy practice-card handlers (hidden list — keep harmless)
$$(".practice-card")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            if (button.dataset.practice) {
                startPractice(button.dataset.practice);
            }
        });
    });


$("#backHome")
    .addEventListener(
        "click",
        function () {

            if (
                history.length > 1
            ) {

                history.back();

            } else {

                renderHome();

                show(
                    "homeScreen",
                    false
                );

            }

        }
    );

$("#backMenu")
    .addEventListener(
        "click",
        function () {

            if (
                history.length > 1
            ) {

                history.back();

            } else {

                renderHome();
                show("homeScreen", false);

            }

        }
    );


$("#resultMenuButton")
    .addEventListener(
        "click",
        function () {

            if (
                history.length > 1
            ) {

                history.back();

            } else {

                renderHome();
                show("homeScreen", false);

            }

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


/*
   Create the first browser-history entry.
*/
history.replaceState(
    {
        arcadeScreen: "homeScreen"
    },
    "",
    window.location.href
);

historyReady = true;


show(
    "homeScreen",
    false
);


