/* Simple Past — Was/Were · Regular · Irregular */
(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     VOCABULARY
     ========================================================= */

  const REGULAR = [
    ["answer", "answered"],
    ["arrive", "arrived"],
    ["ask", "asked"],
    ["call", "called"],
    ["carry", "carried"],
    ["change", "changed"],
    ["check in", "checked in"],
    ["clean", "cleaned"],
    ["close", "closed"],
    ["cook", "cooked"],
    ["cry", "cried"],
    ["decide", "decided"],
    ["finish", "finished"],
    ["hate", "hated"],
    ["help", "helped"],
    ["invite", "invited"],
    ["learn", "learned"],
    ["like", "liked"],
    ["listen", "listened"],
    ["live", "lived"],
    ["look", "looked"],
    ["love", "loved"],
    ["miss", "missed"],
    ["move", "moved"],
    ["need", "needed"],
    ["open", "opened"],
    ["pack", "packed"],
    ["paint", "painted"],
    ["park", "parked"],
    ["pass", "passed"],
    ["play", "played"],
    ["rain", "rained"],
    ["relax", "relaxed"],
    ["rent", "rented"],
    ["snow", "snowed"],
    ["start", "started"],
    ["stay", "stayed"],
    ["stop", "stopped"],
    ["study", "studied"],
    ["talk", "talked"],
    ["travel", "traveled"],
    ["turn", "turned"],
    ["use", "used"],
    ["wait", "waited"],
    ["walk", "walked"],
    ["want", "wanted"],
    ["wash", "washed"],
    ["watch", "watched"],
    ["work", "worked"]
  ];

  const IRREGULAR = [
    ["be", "was/were"],
    ["buy", "bought"],
    ["do", "did"],
    ["get", "got"],
    ["go", "went"],
    ["have", "had"],
    ["leave", "left"],
    ["say", "said"],
    ["see", "saw"],
    ["send", "sent"],
    ["sit", "sat"],
    ["tell", "told"],
    ["write", "wrote"],
    ["come", "came"],
    ["drink", "drank"],
    ["drive", "drove"],
    ["eat", "ate"],
    ["fall", "fell"],
    ["find", "found"],
    ["give", "gave"],
    ["know", "knew"],
    ["make", "made"],
    ["meet", "met"],
    ["read", "read"],
    ["run", "ran"],
    ["sleep", "slept"],
    ["speak", "spoke"],
    ["take", "took"],
    ["think", "thought"],
    ["wear", "wore"],
    ["win", "won"],
    ["begin", "began"],
    ["break", "broke"],
    ["bring", "brought"],
    ["build", "built"],
    ["catch", "caught"],
    ["choose", "chose"],
    ["cut", "cut"],
    ["draw", "drew"],
    ["feel", "felt"],
    ["fly", "flew"],
    ["forget", "forgot"],
    ["hear", "heard"],
    ["keep", "kept"],
    ["lose", "lost"],
    ["pay", "paid"],
    ["put", "put"],
    ["sell", "sold"],
    ["sing", "sang"],
    ["stand", "stood"],
    ["swim", "swam"],
    ["teach", "taught"],
    ["understand", "understood"]
  ];

  /* =========================================================
     -ED PRONUNCIATION
     ========================================================= */

  const SOUND_T = [
    "asked",
    "cooked",
    "finished",
    "helped",
    "liked",
    "looked",
    "missed",
    "packed",
    "parked",
    "passed",
    "stopped",
    "talked",
    "walked",
    "watched",
    "washed",
    "worked"
  ];

  const SOUND_D = [
    "answered",
    "arrived",
    "called",
    "carried",
    "changed",
    "cleaned",
    "closed",
    "cried",
    "learned",
    "listened",
    "lived",
    "loved",
    "moved",
    "opened",
    "played",
    "rained",
    "snowed",
    "stayed",
    "studied",
    "traveled",
    "turned",
    "used"
  ];

  const SOUND_ID = [
    "decided",
    "hated",
    "invited",
    "needed",
    "painted",
    "rented",
    "started",
    "waited",
    "wanted"
  ];

  /* =========================================================
     SIMPLE A1 VOCABULARY
     ========================================================= */

  const PLACES = [
    "home",
    "school",
    "work",
    "the park",
    "the store",
    "the cinema",
    "the gym",
    "the beach"
  ];

  const SIMPLE_OBJECTS = [
    "TV",
    "the door",
    "dinner",
    "the room",
    "English",
    "the movie",
    "the house",
    "the car"
  ];

  const WH_WORDS = [
    "Where",
    "When",
    "Why",
    "What"
  ];

  /* =========================================================
     HELPERS
     ========================================================= */

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const x = arr.slice();

    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [x[i], x[j]] = [x[j], x[i]];
    }

    return x;
  }

  /*
    Create exactly 3 choices.

    The correct answer is always included.
    Duplicate answers are removed.
  */
  function makeChoices(correct, wrongs) {
    const unique = [];

    wrongs.forEach(function (item) {
      if (item !== correct && !unique.includes(item)) {
        unique.push(item);
      }
    });

    return shuffle(
      [correct].concat(unique.slice(0, 2))
    );
  }

  /* =========================================================
     WAS / WERE
     ========================================================= */

  function qWasWere() {
    const plural = Math.random() < 0.45;

    let subject;
    let answer;

    if (plural) {
      subject = pick([
        "You",
        "We",
        "They",
        "My parents",
        "The students"
      ]);

      answer = "were";
    } else {
      subject = pick([
        "I",
        "He",
        "She",
        "It",
        "Tom",
        "Sara"
      ]);

      answer = "was";
    }

    const place = pick(PLACES);

    return {
      type: "mc",
      hint: "Choose was or were",
      prompt: subject + " ____ at " + place + " yesterday.",
      choices: makeChoices(answer, ["was", "were"]),
      answer: answer
    };
  }

  /* =========================================================
     THERE WAS / THERE WERE
     ========================================================= */

  function qThereWasWere() {
    const singular = Math.random() < 0.5;

    if (singular) {
      const noun = pick([
        "a book",
        "a bag",
        "a party",
        "a problem",
        "a message",
        "an email",
        "a car"
      ]);

      return {
        type: "mc",
        hint: "Choose There was or There were",
        prompt: "____ " + noun + " on the table yesterday.",
        choices: makeChoices(
          "There was",
          ["There were", "There is"]
        ),
        answer: "There was"
      };
    }

    const noun = pick([
      "two books",
      "three bags",
      "many people",
      "some students",
      "two cars",
      "three messages"
    ]);

    return {
      type: "mc",
      hint: "Choose There was or There were",
      prompt: "____ " + noun + " outside yesterday.",
      choices: makeChoices(
        "There were",
        ["There was", "There are"]
      ),
      answer: "There were"
    };
  }

  /* =========================================================
     WAS / WERE WH QUESTIONS
     ========================================================= */

  function qWasWereWh() {
    const data = pick([
      {
        wh: "Where",
        subject: "you",
        be: "were"
      },
      {
        wh: "Where",
        subject: "he",
        be: "was"
      },
      {
        wh: "Where",
        subject: "she",
        be: "was"
      },
      {
        wh: "Where",
        subject: "they",
        be: "were"
      },
      {
        wh: "When",
        subject: "you",
        be: "were"
      },
      {
        wh: "When",
        subject: "he",
        be: "was"
      },
      {
        wh: "Why",
        subject: "she",
        be: "was"
      },
      {
        wh: "Why",
        subject: "they",
        be: "were"
      }
    ]);

    const correct =
      data.wh +
      " " +
      data.be +
      " " +
      data.subject +
      "?";

    const wrong1 =
      data.wh +
      " " +
      (data.be === "was" ? "were" : "was") +
      " " +
      data.subject +
      "?";

    const wrong2 =
      data.wh +
      " " +
      data.subject +
      " " +
      data.be +
      "?";

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt:
        "Choose the correct question about " +
        data.subject +
        ".",
      choices: shuffle([
        correct,
        wrong1,
        wrong2
      ]),
      answer: correct
    };
  }

  /* =========================================================
     REGULAR VERBS — LEVEL 1
     Basic positive / negative / question
     ========================================================= */

  function qRegLevel1() {
    const [base, past] = pick(REGULAR);

    const form = pick([
      "pos",
      "neg",
      "q"
    ]);

    const subject = pick([
      "I",
      "You",
      "He",
      "She",
      "We",
      "They"
    ]);

    /* ---------- POSITIVE ---------- */

    if (form === "pos") {
      const simpleSentences = [
        "Yesterday " +
          subject.toLowerCase() +
          " ____ TV.",

        "Yesterday " +
          subject.toLowerCase() +
          " ____ at home.",

        "Yesterday " +
          subject.toLowerCase() +
          " ____ English.",

        "Yesterday " +
          subject.toLowerCase() +
          " ____ the room.",

        "Yesterday " +
          subject.toLowerCase() +
          " ____ dinner.",

        "Yesterday " +
          subject.toLowerCase() +
          " ____ to the park."
      ];

      /*
        Some verbs need a more natural sentence.
        We therefore use a small group of safe
        A1 sentence patterns.
      */

      let prompt;

      if (
        [
          "watch",
          "clean",
          "cook",
          "play",
          "study",
          "work",
          "walk",
          "talk",
          "help",
          "wash"
        ].includes(base)
      ) {
        const objects = {
          watch: "TV",
          clean: "the room",
          cook: "dinner",
          play: "football",
          study: "English",
          work: "at home",
          walk: "to school",
          talk: "to Tom",
          help: "my mother",
          wash: "the car"
        };

        prompt =
          "Yesterday " +
          subject.toLowerCase() +
          " ____ " +
          objects[base] +
          ".";
      } else {
        prompt = pick(simpleSentences);
      }

      return {
        type: "mc",
        hint: "Choose the past form",
        prompt: prompt + " (" + base + ")",
        choices: makeChoices(
          past,
          [
            base,
            base + "ed",
            "did " + base
          ]
        ),
        answer: past
      };
    }

    /* ---------- NEGATIVE ---------- */

    if (form === "neg") {
      const object = pick([
        "TV",
        "the movie",
        "English",
        "the room",
        "dinner",
        "the car"
      ]);

      const correct =
        "didn't " + base;

      return {
        type: "mc",
        hint: "Choose the correct negative",
        prompt:
          subject +
          " ____ " +
          object +
          " yesterday. (" +
          base +
          ")",
        choices: makeChoices(
          correct,
          [
            "didn't " + past,
            "not " + past,
            "doesn't " + base
          ]
        ),
        answer: correct
      };
    }

    /* ---------- QUESTION ---------- */

    const correct =
      "Did / " + base;

    return {
      type: "mc",
      hint: "Choose the correct question",
      prompt:
        "____ you ____ English yesterday? (" +
        base +
        ")",
      choices: makeChoices(
        correct,
        [
          "Did / " + past,
          "Do / " + base,
          "Was / " + past
        ]
      ),
      answer: correct
    };
  }

  /* =========================================================
     REGULAR VERBS — LEVEL 2
     WH QUESTIONS
     ========================================================= */

  function qRegWh() {
    const [base, past] = pick(REGULAR);

    const wh = pick(WH_WORDS);

    const correct =
      wh +
      " did you " +
      base +
      " yesterday?";

    const wrong1 =
      wh +
      " did you " +
      past +
      " yesterday?";

    const wrong2 =
      wh +
      " you " +
      past +
      " yesterday?";

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt:
        "Choose the correct question.",
      choices: shuffle([
        correct,
        wrong1,
        wrong2
      ]),
      answer: correct
    };
  }

  /* =========================================================
     REGULAR VERBS — LEVEL 3
     -ED PRONUNCIATION
     ========================================================= */

  function qRegSound() {
    const groups = [
      {
        name: "/t/",
        list: SOUND_T
      },
      {
        name: "/d/",
        list: SOUND_D
      },
      {
        name: "/ɪd/",
        list: SOUND_ID
      }
    ];

    const mainIdx =
      Math.floor(Math.random() * groups.length);

    let oddIdx =
      Math.floor(Math.random() * groups.length);

    while (oddIdx === mainIdx) {
      oddIdx =
        Math.floor(Math.random() * groups.length);
    }

    const main =
      shuffle(groups[mainIdx].list).slice(0, 2);

    const odd =
      pick(groups[oddIdx].list);

    const options =
      shuffle(main.concat([odd]));

    return {
      type: "mc",
      hint:
        "Listen to the -ed sound in your head.",
      prompt:
        "Which word has a different -ed sound?",
      choices: options,
      answer: odd
    };
  }

  /* =========================================================
     IRREGULAR VERBS — LEVEL 1
     ========================================================= */

  function qIrrLevel1() {
    const pool =
      IRREGULAR.filter(function (x) {
        return x[0] !== "be";
      });

    const [base, past] = pick(pool);

    const form = pick([
      "pos",
      "neg",
      "q"
    ]);

    const subject = pick([
      "I",
      "You",
      "He",
      "She",
      "We",
      "They"
    ]);

    /* ---------- POSITIVE ---------- */

    if (form === "pos") {
      const easySentences = {
        go: "to school",
        eat: "breakfast",
        drink: "water",
        see: "Tom",
        buy: "a book",
        have: "breakfast",
        get: "home",
        come: "home",
        take: "a bus",
        make: "dinner",
        meet: "my friend",
        read: "a book",
        write: "an email",
        sleep: "at home",
        run: "in the park",
        speak: "English",
        wear: "a new shirt",
        find: "my keys",
        give: "Tom a book",
        say: "hello",
        leave: "home",
        sit: "on the chair",
        tell: "a story",
        drink: "water",
        drive: "to work",
        feel: "happy",
        hear: "a noise",
        lose: "my keys",
        put: "the book on the table",
        win: "the game"
      };

      const object =
        easySentences[base] ||
        "something";

      return {
        type: "mc",
        hint: "Choose the past form",
        prompt:
          "Yesterday " +
          subject.toLowerCase() +
          " ____ " +
          object +
          ". (" +
          base +
          ")",
        choices: makeChoices(
          past,
          [
            base,
            base + "ed",
            "did " + base
          ]
        ),
        answer: past
      };
    }

    /* ---------- NEGATIVE ---------- */

    if (form === "neg") {
      const correct =
        "didn't " + base;

      return {
        type: "mc",
        hint: "Choose the correct negative",
        prompt:
          subject +
          " ____ home yesterday. (" +
          base +
          ")",
        choices: makeChoices(
          correct,
          [
            "didn't " + past,
            "not " + past,
            "doesn't " + base
          ]
        ),
        answer: correct
      };
    }

    /* ---------- QUESTION ---------- */

    const correct =
      "Did / " + base;

    return {
      type: "mc",
      hint: "Choose the correct question",
      prompt:
        "____ she ____ it yesterday? (" +
        base +
        ")",
      choices: makeChoices(
        correct,
        [
          "Did / " + past,
          "Does / " + base,
          "Was / " + past
        ]
      ),
      answer: correct
    };
  }

  /* =========================================================
     IRREGULAR VERBS — LEVEL 2
     WH QUESTIONS
     ========================================================= */

  function qIrrWh() {
    const pool =
      IRREGULAR.filter(function (x) {
        return x[0] !== "be";
      });

    const [base] = pick(pool);

    const wh =
      pick(WH_WORDS);

    const correct =
      wh +
      " did they " +
      base +
      "?";

    const otherPast =
      pick(pool)[1];

    const wrong1 =
      wh +
      " did they " +
      otherPast +
      "?";

    const wrong2 =
      wh +
      " they " +
      base +
      "?";

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt:
        "Choose the correct question.",
      choices: shuffle([
        correct,
        wrong1,
        wrong2
      ]),
      answer: correct
    };
  }

  /* =========================================================
     IRREGULAR VERBS — MATCHING
     ========================================================= */

  function qIrrMatch() {
    const pool =
      IRREGULAR.filter(function (x) {
        return x[0] !== "be";
      });

    const count =
      (
        window.innerWidth <= 700 ||
        window.innerHeight <= 700
      )
        ? 3
        : 4;

    const pairs =
      shuffle(pool).slice(0, count);

    return {
      type: "match",
      hint:
        "Tap a base form, then its past form",
      prompt:
        "Match base → past",
      pairs:
        pairs.map(function (pair) {
          return {
            left: pair[0],
            right: pair[1]
          };
        })
    };
  }

  /* =========================================================
     MODES
     ========================================================= */

  const MODES = {

    ww1: {
      label: "Was / Were · Level 1",
      build: qWasWere
    },

    ww2: {
      label: "There was / were · Level 2",
      build: qThereWasWere
    },

    ww3: {
      label: "Was / Were · Level 3",
      build: qWasWereWh
    },

    reg1: {
      label: "Regular · Level 1",
      build: qRegLevel1
    },

    reg2: {
      label: "Regular · Level 2",
      build: qRegWh
    },

    "reg-sound": {
      label: "Regular · Level 3",
      build: qRegSound
    },

    irr1: {
      label: "Irregular · Level 1",
      build: qIrrLevel1
    },

    irr2: {
      label: "Irregular · Level 2",
      build: qIrrWh
    },

    "irr-match": {
      label: "Irregular · Matching",
      build: qIrrMatch
    }
  };

  /* =========================================================
     UI / STATE
     ========================================================= */

  const menuScreen =
    document.getElementById("menuScreen");

  const playScreen =
    document.getElementById("playScreen");

  const resultScreen =
    document.getElementById("resultScreen");

  const choicesArea =
    document.getElementById("choicesArea");

  const matchArea =
    document.getElementById("matchArea");

  const matchLeft =
    document.getElementById("matchLeft");

  const matchRight =
    document.getElementById("matchRight");

  const feedbackEl =
    document.getElementById("feedback");

  const promptHint =
    document.getElementById("promptHint");

  const promptText =
    document.getElementById("promptText");

  const modeLabel =
    document.getElementById("modeLabel");

  const scoreEl =
    document.getElementById("score");

  const progressFill =
    document.getElementById("progressFill");

  let modeKey = null;
  let queue = [];
  let index = 0;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let locked = false;

  let matchSel = {
    left: null,
    right: null
  };

  let matchDone = 0;
  let matchTotal = 0;
  let matchMap = {};

  /* =========================================================
     SCREEN CONTROL
     ========================================================= */

  function show(name) {
    menuScreen.classList.add("hidden");
    playScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    if (name === "menu") {
      menuScreen.classList.remove("hidden");
    }

    if (name === "play") {
      playScreen.classList.remove("hidden");
    }

    if (name === "result") {
      resultScreen.classList.remove("hidden");
    }
  }

  /* =========================================================
     PROGRESS
     ========================================================= */

  function updateProgress() {
    if (!progressFill) return;

    progressFill.style.width =
      Math.round((index / TOTAL) * 100) +
      "%";
  }

  /* =========================================================
     START MODE
     ========================================================= */

  function startMode(key) {
    modeKey = key;

    if (key === "irr-match") {
      startMatchRush();
      return;
    }

    const mode = MODES[key];

    queue = [];

    for (let i = 0; i < TOTAL; i++) {
      queue.push(mode.build());
    }

    index = 0;
    score = 0;
    correct = 0;
    wrong = 0;

    if (modeLabel) {
      modeLabel.textContent =
        mode.label;
    }

    if (scoreEl) {
      scoreEl.textContent = "0";
    }

    show("play");

    loadItem();
  }

  /* =========================================================
     LOAD QUESTION
     ========================================================= */

  function loadItem() {
    locked = false;

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    const item = queue[index];

    updateProgress();

    promptHint.textContent =
      item.hint;

    promptText.textContent =
      item.prompt;

    if (item.type === "match") {

      choicesArea.classList.add("hidden");

      if (matchArea) {
        matchArea.classList.remove("hidden");
        matchArea.style.display = "flex";
      }

      setupMatch(item);

      if (matchArea) {
        matchArea.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }

    } else {

      if (matchArea) {
        matchArea.classList.add("hidden");
        matchArea.style.display = "";
      }

      choicesArea.classList.remove("hidden");

      renderChoices(item);
    }
  }

  /* =========================================================
     RENDER CHOICES
     ========================================================= */

  function renderChoices(item) {
    choicesArea.innerHTML = "";

    choicesArea.classList.remove(
      "mk-stagger-fast"
    );

    void choicesArea.offsetWidth;

    choicesArea.classList.add(
      "mk-stagger-fast"
    );

    item.choices.forEach(function (choice) {

      const btn =
        document.createElement("button");

      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice;

      btn.addEventListener(
        "click",
        function () {
          onChoice(
            choice,
            item.answer,
            btn
          );
        }
      );

      choicesArea.appendChild(btn);
    });
  }

  /* =========================================================
     ANSWER MULTIPLE CHOICE
     ========================================================= */

  function onChoice(
    choice,
    answer,
    btn
  ) {

    if (locked) return;

    locked = true;

    const ok =
      choice === answer;

    document
      .querySelectorAll(".choice-btn")
      .forEach(function (b) {

        b.disabled = true;

        if (
          b.textContent === answer
        ) {
          b.classList.add("correct");
        }
      });

    if (ok) {

      btn.classList.add("correct");

      score += 10;
      correct += 1;

      feedbackEl.textContent =
        "Correct!";

      feedbackEl.className =
        "feedback ok";

    } else {

      btn.classList.add("wrong");

      wrong += 1;

      feedbackEl.textContent =
        "Answer: " + answer;

      feedbackEl.className =
        "feedback bad";
    }

    if (scoreEl) {
      scoreEl.textContent =
        String(score);
    }

    setTimeout(
      function () {

        index += 1;

        if (index >= TOTAL) {
          endRound();
        } else {
          loadItem();
        }

      },
      ok ? 650 : 1300
    );
  }

  /* =========================================================
     MATCHING GAME
     ========================================================= */

  function setupMatch(item) {

    matchSel = {
      left: null,
      right: null
    };

    matchDone = 0;
    matchTotal =
      item.pairs.length;

    matchMap = {};

    item.pairs.forEach(
      function (pair) {
        matchMap[pair.left] =
          pair.right;
      }
    );

    const lefts =
      shuffle(
        item.pairs.map(
          function (p) {
            return p.left;
          }
        )
      );

    const rights =
      shuffle(
        item.pairs.map(
          function (p) {
            return p.right;
          }
        )
      );

    if (
      !matchArea ||
      !matchLeft ||
      !matchRight
    ) {
      console.error(
        "Match UI elements missing"
      );

      return;
    }

    matchArea.classList.remove(
      "hidden"
    );

    matchArea.style.display =
      "flex";

    choicesArea.classList.add(
      "hidden"
    );

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (word) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className =
        "match-chip word";

      button.textContent =
        word;

      button.dataset.side =
        "left";

      button.dataset.val =
        word;

      button.addEventListener(
        "click",
        function () {
          onMatchPick(button);
        }
      );

      matchLeft.appendChild(
        button
      );
    });

    rights.forEach(function (word) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className =
        "match-chip word";

      button.textContent =
        word;

      button.dataset.side =
        "right";

      button.dataset.val =
        word;

      button.addEventListener(
        "click",
        function () {
          onMatchPick(button);
        }
      );

      matchRight.appendChild(
        button
      );
    });
  }

  /* =========================================================
     MATCH PICK
     ========================================================= */

  function onMatchPick(btn) {

    if (
      locked ||
      btn.classList.contains("matched")
    ) {
      return;
    }

    const side =
      btn.dataset.side;

    document
      .querySelectorAll(
        '.match-chip[data-side="' +
          side +
          '"]'
      )
      .forEach(function (b) {

        if (
          !b.classList.contains(
            "matched"
          )
        ) {
          b.classList.remove(
            "selected"
          );
        }
      });

    btn.classList.add(
      "selected"
    );

    matchSel[side] =
      btn;

    if (
      matchSel.left &&
      matchSel.right
    ) {

      const L =
        matchSel.left.dataset.val;

      const R =
        matchSel.right.dataset.val;

      if (matchMap[L] === R) {

        matchSel.left.classList.add(
          "matched"
        );

        matchSel.right.classList.add(
          "matched"
        );

        matchSel.left.classList.remove(
          "selected"
        );

        matchSel.right.classList.remove(
          "selected"
        );

        matchDone += 1;
        score += 10;

        if (scoreEl) {
          scoreEl.textContent =
            String(score);
        }

        feedbackEl.textContent =
          "Matched!";

        feedbackEl.className =
          "feedback ok";

        matchSel = {
          left: null,
          right: null
        };

        if (
          matchDone >= matchTotal
        ) {

          correct += 1;
          locked = true;

          setTimeout(
            function () {

              index += 1;

              if (index >= TOTAL) {
                endRound();
              } else {
                loadItem();
              }

            },
            600
          );
        }

      } else {

        matchSel.left.classList.add(
          "wrong-flash"
        );

        matchSel.right.classList.add(
          "wrong-flash"
        );

        feedbackEl.textContent =
          "Try again";

        feedbackEl.className =
          "feedback bad";

        const a =
          matchSel.left;

        const b =
          matchSel.right;

        matchSel = {
          left: null,
          right: null
        };

        setTimeout(
          function () {

            a.classList.remove(
              "selected",
              "wrong-flash"
            );

            b.classList.remove(
              "selected",
              "wrong-flash"
            );

          },
          400
        );
      }
    }
  }

  /* =========================================================
     MATCH RUSH
     ========================================================= */

  const RUSH_SECONDS = 90;

  let rushTimerId = null;
  let rushTimeLeft =
    RUSH_SECONDS;

  let rushMatches = 0;
  let rushCombo = 0;
  let rushBestCombo = 0;

  let rushMap = {};

  let rushSel = {
    left: null,
    right: null
  };

  let rushLocked = false;

  function stopRushTimer() {

    if (rushTimerId) {

      clearInterval(
        rushTimerId
      );

      rushTimerId = null;
    }
  }

  function startMatchRush() {

    stopRushTimer();

    score = 0;
    correct = 0;
    wrong = 0;

    rushMatches = 0;
    rushCombo = 0;
    rushBestCombo = 0;

    rushTimeLeft =
      RUSH_SECONDS;

    rushSel = {
      left: null,
      right: null
    };

    rushLocked = false;

    if (modeLabel) {
      modeLabel.textContent =
        "Match Rush · 90s";
    }

    if (scoreEl) {
      scoreEl.textContent =
        "0";
    }

    show("play");

    const play =
      document.getElementById(
        "playScreen"
      );

    if (play) {
      play.classList.add(
        "play-screen-rush"
      );
    }

    if (choicesArea) {
      choicesArea.classList.add(
        "hidden"
      );
    }

    if (matchArea) {

      matchArea.classList.remove(
        "hidden"
      );

      matchArea.style.display =
        "flex";

      matchArea.style.flexDirection =
        "column";
    }

    if (feedbackEl) {

      feedbackEl.textContent =
        "Match base → past as fast as you can!";

      feedbackEl.className =
        "feedback";
    }

    const pool =
      shuffle(
        IRREGULAR.filter(
          function (x) {
            return x[0] !== "be";
          }
        )
      );

    rushMap = {};

    pool.forEach(function (pair) {

      rushMap[pair[0]] =
        pair[1];
    });

    const lefts =
      shuffle(
        pool.map(
          function (pair) {
            return pair[0];
          }
        )
      );

    const rights =
      shuffle(
        pool.map(
          function (pair) {
            return pair[1];
          }
        )
      );

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (word) {

      matchLeft.appendChild(
        makeRushChip(
          word,
          "left"
        )
      );
    });

    rights.forEach(function (word) {

      matchRight.appendChild(
        makeRushChip(
          word,
          "right"
        )
      );
    });

    updateRushHud();

    rushTimerId =
      setInterval(
        function () {

          rushTimeLeft -= 1;

          updateRushHud();

          if (
            rushTimeLeft <= 0
          ) {

            stopRushTimer();

            endMatchRush();
          }

        },
        1000
      );
  }

  function makeRushChip(
    word,
    side
  ) {

    const btn =
      document.createElement(
        "button"
      );

    btn.type = "button";

    btn.className =
      "match-chip word";

    btn.textContent =
      word;

    btn.dataset.side =
      side;

    btn.dataset.val =
      word;

    btn.addEventListener(
      "click",
      function () {
        onRushPick(btn);
      }
    );

    return btn;
  }

  function updateRushHud() {

    const timerEl =
      document.getElementById(
        "rushTimer"
      );

    const scoreHud =
      document.getElementById(
        "rushScore"
      );

    const comboEl =
      document.getElementById(
        "rushCombo"
      );

    if (timerEl) {

      timerEl.textContent =
        String(
          Math.max(
            0,
            rushTimeLeft
          )
        );

      timerEl.classList.toggle(
        "warn",
        rushTimeLeft <= 30 &&
          rushTimeLeft > 10
      );

      timerEl.classList.toggle(
        "danger",
        rushTimeLeft <= 10
      );
    }

    if (scoreHud) {
      scoreHud.textContent =
        String(score);
    }

    if (comboEl) {
      comboEl.textContent =
        Math.max(
          0,
          rushCombo
        ) + "x";
    }

    if (scoreEl) {
      scoreEl.textContent =
        String(score);
    }
  }

  function shuffleRushBoard() {

    if (
      rushLocked ||
      !matchLeft ||
      !matchRight
    ) {
      return;
    }

    const leftChips =
      Array.from(
        matchLeft.querySelectorAll(
          ".match-chip:not(.matched)"
        )
      );

    const rightChips =
      Array.from(
        matchRight.querySelectorAll(
          ".match-chip:not(.matched)"
        )
      );

    const leftVals =
      shuffle(
        leftChips.map(
          function (chip) {
            return chip.dataset.val;
          }
        )
      );

    const rightVals =
      shuffle(
        rightChips.map(
          function (chip) {
            return chip.dataset.val;
          }
        )
      );

    matchLeft
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(
        function (chip) {
          chip.remove();
        }
      );

    matchRight
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(
        function (chip) {
          chip.remove();
        }
      );

    leftVals.forEach(
      function (word) {

        matchLeft.appendChild(
          makeRushChip(
            word,
            "left"
          )
        );
      }
    );

    rightVals.forEach(
      function (word) {

        matchRight.appendChild(
          makeRushChip(
            word,
            "right"
          )
        );
      }
    );

    rushSel = {
      left: null,
      right: null
    };
  }

  function onRushPick(btn) {

    if (
      rushLocked ||
      btn.classList.contains(
        "matched"
      )
    ) {
      return;
    }

    const side =
      btn.dataset.side;

    document
      .querySelectorAll(
        '.match-chip[data-side="' +
          side +
          '"]'
      )
      .forEach(
        function (b) {

          if (
            !b.classList.contains(
              "matched"
            )
          ) {
            b.classList.remove(
              "selected"
            );
          }
        }
      );

    btn.classList.add(
      "selected"
    );

    rushSel[side] =
      btn;

    if (
      rushSel.left &&
      rushSel.right
    ) {

      const L =
        rushSel.left.dataset.val;

      const R =
        rushSel.right.dataset.val;

      if (
        rushMap[L] === R
      ) {

        rushSel.left.classList.add(
          "matched"
        );

        rushSel.right.classList.add(
          "matched"
        );

        rushSel.left.classList.remove(
          "selected"
        );

        rushSel.right.classList.remove(
          "selected"
        );

        rushMatches += 1;
        rushCombo += 1;

        if (
          rushCombo >
          rushBestCombo
        ) {
          rushBestCombo =
            rushCombo;
        }

        const pts =
          10 +
          Math.min(
            40,
            (rushCombo - 1) * 5
          );

        score += pts;
        correct += 1;

        if (feedbackEl) {

          feedbackEl.textContent =
            "Nice! +" + pts;

          feedbackEl.className =
            "feedback ok";
        }

        rushSel = {
          left: null,
          right: null
        };

        updateRushHud();

        const leftRemain =
          matchLeft.querySelectorAll(
            ".match-chip:not(.matched)"
          ).length;

        if (
          leftRemain === 0
        ) {

          stopRushTimer();

          setTimeout(
            endMatchRush,
            400
          );
        }

      } else {

        rushCombo = 0;
        wrong += 1;

        rushSel.left.classList.add(
          "wrong-flash"
        );

        rushSel.right.classList.add(
          "wrong-flash"
        );

        if (feedbackEl) {

          feedbackEl.textContent =
            "Try again";

          feedbackEl.className =
            "feedback bad";
        }

        const a =
          rushSel.left;

        const b =
          rushSel.right;

        rushSel = {
          left: null,
          right: null
        };

        updateRushHud();

        setTimeout(
          function () {

            a.classList.remove(
              "selected",
              "wrong-flash"
            );

            b.classList.remove(
              "selected",
              "wrong-flash"
            );

          },
          280
        );
      }
    }
  }

  /* =========================================================
     END MATCH RUSH
     ========================================================= */

  function endMatchRush() {

    stopRushTimer();

    rushLocked = true;

    const play =
      document.getElementById(
        "playScreen"
      );

    if (play) {

      play.classList.remove(
        "play-screen-rush"
      );
    }

    if (matchArea) {

      matchArea.classList.add(
        "hidden"
      );

      matchArea.style.display =
        "";
    }

    if (feedbackEl) {

      feedbackEl.textContent =
        "";

      feedbackEl.className =
        "feedback";
    }

    document.getElementById(
      "finalScore"
    ).textContent =
      String(score);

    document.getElementById(
      "finalCorrect"
    ).textContent =
      String(rushMatches);

    document.getElementById(
      "finalWrong"
    ).textContent =
      String(wrong);

    const totalPairs =
      Object.keys(rushMap).length ||
      1;

    const acc =
      Math.round(
        (rushMatches /
          totalPairs) *
          100
      );

    document.getElementById(
      "finalAccuracy"
    ).textContent =
      Math.min(
        100,
        acc
      ) + "%";

    show("result");
  }

  /* =========================================================
     END NORMAL ROUND
     ========================================================= */

  function endRound() {

    if (progressFill) {

      progressFill.style.width =
        "100%";
    }

    document.getElementById(
      "finalScore"
    ).textContent =
      String(score);

    document.getElementById(
      "finalCorrect"
    ).textContent =
      String(correct);

    document.getElementById(
      "finalWrong"
    ).textContent =
      String(wrong);

    document.getElementById(
      "finalAccuracy"
    ).textContent =
      (
        TOTAL
          ? Math.round(
              (correct / TOTAL) *
                100
            )
          : 0
      ) + "%";

    show("result");
  }

  /* =========================================================
     MENU BUTTONS
     ========================================================= */

  document
    .querySelectorAll(".level-list li")
    .forEach(function (li) {

      li.addEventListener(
        "click",
        function (event) {

          /*
            If the item contains a real link,
            let the browser handle it.
          */
          if (
            event.target.closest("a")
          ) {
            return;
          }

          const mode =
            li.getAttribute(
              "data-mode"
            );

          if (
            mode &&
            MODES[mode]
          ) {
            startMode(mode);
          }
        }
      );
    });

  /* =========================================================
     BACK / RESTART
     ========================================================= */

  const backMenu =
    document.getElementById(
      "backMenu"
    );

  const rushShuffleBtn =
    document.getElementById(
      "rushShuffleBtn"
    );

  if (rushShuffleBtn) {

    rushShuffleBtn.addEventListener(
      "click",
      function () {
        shuffleRushBoard();
      }
    );
  }

  if (backMenu) {

    backMenu.addEventListener(
      "click",
      function () {

        stopRushTimer();

        const play =
          document.getElementById(
            "playScreen"
          );

        if (play) {

          play.classList.remove(
            "play-screen-rush"
          );
        }

        show("menu");
      }
    );
  }

  const toMenuBtn =
    document.getElementById(
      "toMenuBtn"
    );

  if (toMenuBtn) {

    toMenuBtn.addEventListener(
      "click",
      function () {
        show("menu");
      }
    );
  }

  const playAgainBtn =
    document.getElementById(
      "playAgainBtn"
    );

  if (playAgainBtn) {

    playAgainBtn.addEventListener(
      "click",
      function () {

        if (modeKey) {
          startMode(modeKey);
        }
      }
    );
  }

  /* =========================================================
     SITE THEME
     ========================================================= */

  function syncSiteTheme() {

    const dark =
      document.documentElement.getAttribute(
        "data-theme"
      ) === "dark";

    document.body.classList.toggle(
      "light-mode",
      !dark
    );
  }

  syncSiteTheme();

  window.addEventListener(
    "site-theme-change",
    syncSiteTheme
  );

  try {

    new MutationObserver(
      syncSiteTheme
    ).observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "data-theme"
        ]
      }
    );

  } catch (_) {}

  /* =========================================================
     START
     ========================================================= */

  show("menu");

})();
