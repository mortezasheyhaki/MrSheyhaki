/* =========================================================
   SIMPLE PAST — MR. SHEYHAKI'S LEARNING ARCADE

   Was / Were
   Regular Verbs
   Irregular Verbs

   Wh-question levels use SENTENCE ASSEMBLY:
   - Fixed questions
   - Randomized chunks
   - Player taps chunks to build the question
   - Automatic checking
   ========================================================= */

(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     DATA
     ========================================================= */

  const REGULAR = [
    ["answer", "answered"],
    ["arrive", "arrived"],
    ["ask", "asked"],
    ["book", "booked"],
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
    ["offer", "offered"],
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
    "offered",
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

  /* =========================================================
     WAS / WERE — LEVEL 1
     ========================================================= */

  function qWasWere() {
    const singular = Math.random() < 0.55;

    let subject;
    let answer;

    if (singular) {
      subject = pick([
        "I",
        "He",
        "She",
        "It",
        "Tom",
        "Sara"
      ]);

      answer = "was";
    } else {
      subject = pick([
        "You",
        "We",
        "They",
        "My parents",
        "The students"
      ]);

      answer = "were";
    }

    const situations = [
      "at home",
      "at school",
      "at the hotel",
      "at work",
      "in the kitchen",
      "in the living room",
      "in the bedroom",
      "at the park",
      "at the cinema",
      "at the restaurant"
    ];

    const timeExpressions = [
      "last night",
      "this morning",
      "last Saturday",
      "last weekend",
      "on Monday",
      "after lunch",
      "before dinner",
      "in the evening",
      "two days ago",
      "last summer"
    ];

    const place = pick(situations);
    const time = pick(timeExpressions);

    return {
      type: "mc",
      hint: "Choose was or were",
      prompt:
        subject +
        " ____ " +
        place +
        " " +
        time +
        ".",
      choices: shuffle([
        "was",
        "were",
        "is"
      ]),
      answer: answer
    };
  }

  /* =========================================================
     THERE WAS / THERE WERE — LEVEL 2
     ========================================================= */

  function qThereWasWere() {
    const questions = [
      {
        prompt: "____ a bed in the hotel room.",
        answer: "There was"
      },
      {
        prompt: "____ two chairs in the bedroom.",
        answer: "There were"
      },
      {
        prompt: "____ a TV in the living room.",
        answer: "There was"
      },
      {
        prompt: "____ three windows in the apartment.",
        answer: "There were"
      },
      {
        prompt: "____ a sofa in the living room.",
        answer: "There was"
      },
      {
        prompt: "____ four towels in the bathroom.",
        answer: "There were"
      },
      {
        prompt: "____ a shower in the bathroom.",
        answer: "There was"
      },
      {
        prompt: "____ two beds in the hotel room.",
        answer: "There were"
      },
      {
        prompt: "____ a table in the kitchen.",
        answer: "There was"
      },
      {
        prompt: "____ some cups in the kitchen.",
        answer: "There were"
      },
      {
        prompt: "____ a lamp next to the bed.",
        answer: "There was"
      },
      {
        prompt: "____ two pictures on the wall.",
        answer: "There were"
      },
      {
        prompt: "____ a fridge in the kitchen.",
        answer: "There was"
      },
      {
        prompt: "____ some books on the shelf.",
        answer: "There were"
      },
      {
        prompt: "____ a balcony at the hotel.",
        answer: "There was"
      },
      {
        prompt: "____ five rooms in the house.",
        answer: "There were"
      },
      {
        prompt: "____ a mirror in the bathroom.",
        answer: "There was"
      },
      {
        prompt: "____ two bathrooms in the house.",
        answer: "There were"
      },
      {
        prompt: "____ a swimming pool at the hotel.",
        answer: "There was"
      },
      {
        prompt: "____ many guests in the hotel.",
        answer: "There were"
      }
    ];

    const item = pick(questions);

    return {
      type: "mc",
      hint: "Choose There was or There were",
      prompt: item.prompt,
      choices: shuffle([
        "There was",
        "There were",
        "There is"
      ]),
      answer: item.answer
    };
  }

  /* =========================================================
     WAS / WERE — LEVEL 3
     SENTENCE ASSEMBLY
     ========================================================= */

  const WAS_WERE_WH = [
    {
      chunks: [
        "Where",
        "were",
        "you",
        "after work?"
      ]
    },
    {
      chunks: [
        "Where",
        "was",
        "Tom",
        "last weekend?"
      ]
    },
    {
      chunks: [
        "Why",
        "was",
        "Sara",
        "at home",
        "on Saturday?"
      ]
    },
    {
      chunks: [
        "When",
        "were",
        "they",
        "at the hotel?"
      ]
    },
    {
      chunks: [
        "Where",
        "were",
        "your parents",
        "last weekend?"
      ]
    },
    {
      chunks: [
        "Why",
        "was",
        "he",
        "at school",
        "this morning?"
      ]
    },
    {
      chunks: [
        "When",
        "was",
        "Emma",
        "at the party?"
      ]
    },
    {
      chunks: [
        "Where",
        "were",
        "the students",
        "after class?"
      ]
    },
    {
      chunks: [
        "Why",
        "were",
        "you",
        "at the hospital?"
      ]
    },
    {
      chunks: [
        "Where",
        "was",
        "Sara",
        "on Monday evening?"
      ]
    },
    {
      chunks: [
        "When",
        "were",
        "your friends",
        "at the cinema?"
      ]
    },
    {
      chunks: [
        "Why",
        "was",
        "Tom",
        "in the kitchen?"
      ]
    },
    {
      chunks: [
        "Where",
        "were",
        "your friends",
        "last night?"
      ]
    },
    {
      chunks: [
        "When",
        "was",
        "your sister",
        "at home?"
      ]
    },
    {
      chunks: [
        "Why",
        "were",
        "the children",
        "at the park?"
      ]
    },
    {
      chunks: [
        "Where",
        "was",
        "your brother",
        "yesterday afternoon?"
      ]
    },
    {
      chunks: [
        "When",
        "were",
        "you",
        "at the restaurant?"
      ]
    },
    {
      chunks: [
        "Why",
        "was",
        "your mother",
        "at work",
        "on Sunday?"
      ]
    }
  ];

  function qWasWereWh() {
    const item = pick(WAS_WERE_WH);

    return {
      type: "assemble",
      hint: "Build the correct Wh- question",
      prompt: "Put the chunks in the correct order.",
      chunks: item.chunks.slice(),
      displayChunks: shuffle(item.chunks.slice())
    };
  }

  /* =========================================================
     REGULAR VERBS — LEVEL 1
     ========================================================= */

  function qRegLevel1() {
    const [base, past] = pick(REGULAR);

    const form = pick([
      "pos",
      "neg",
      "q"
    ]);

    const subjects = [
      "I",
      "You",
      "He",
      "She",
      "We",
      "They"
    ];

    const subj = pick(subjects);

    const positiveSentences = [
      "Yesterday " +
        subj.toLowerCase() +
        " ____ at home. (" +
        base +
        ")",

      "Last night " +
        subj.toLowerCase() +
        " ____ after dinner. (" +
        base +
        ")",

      "Last weekend " +
        subj.toLowerCase() +
        " ____ with friends. (" +
        base +
        ")"
    ];

    if (form === "pos") {
      return {
        type: "mc",
        hint: "Positive · regular verb",
        prompt: pick(positiveSentences),
        choices: shuffle([
          past,
          base,
          base + "ed"
        ]),
        answer: past
      };
    }

    if (form === "neg") {
      return {
        type: "mc",
        hint: "Negative · regular verb",
        prompt:
          subj +
          " ____ it yesterday. (" +
          base +
          ")",
        choices: shuffle([
          "didn't " + base,
          "didn't " + past,
          "doesn't " + base
        ]),
        answer: "didn't " + base
      };
    }

    return {
      type: "mc",
      hint: "Question · regular verb",
      prompt:
        "____ you ____ English yesterday? (" +
        base +
        ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Do / " + base
      ]),
      answer: "Did / " + base
    };
  }

  /* =========================================================
     REGULAR VERBS — LEVEL 2
     SENTENCE ASSEMBLY
     ========================================================= */

  const REGULAR_WH = [
  {
    chunks: ["When", "did", "you", "finish", "your homework?"]
  },
  {
    chunks: ["Where", "did", "you", "stay", "last weekend?"]
  },
  {
    chunks: ["Why", "did", "she", "close", "the window?"]
  },
  {
    chunks: ["When", "did", "they", "clean", "the room?"]
  },
  {
    chunks: ["Where", "did", "he", "park", "the car?"]
  },
  {
    chunks: ["Why", "did", "you", "open", "the door?"]
  },
  {
    chunks: ["When", "did", "she", "book", "the hotel?"]
  },
  {
    chunks: ["Where", "did", "they", "travel", "last summer?"]
  },
  {
    chunks: ["Why", "did", "he", "change", "his plan?"]
  },
  {
    chunks: ["When", "did", "you", "start", "your job?"]
  },
  {
    chunks: ["Where", "did", "she", "work", "last year?"]
  },
  {
    chunks: ["Why", "did", "they", "call", "you?"]
  },
  {
    chunks: ["When", "did", "he", "arrive", "at the hotel?"]
  },
  {
    chunks: ["Where", "did", "you", "live", "before?"]
  },
  {
    chunks: ["Why", "did", "she", "wash", "the dishes?"]
  },
  {
    chunks: ["When", "did", "they", "move", "to the new house?"]
  },
  {
    chunks: ["Where", "did", "he", "play", "football?"]
  },
  {
    chunks: ["Why", "did", "you", "need", "help?"]
  }
];
  function qRegWh() {
    const item = pick(REGULAR_WH);

    return {
      type: "assemble",
      hint: "Build the correct Wh- question",
      prompt: "Put the chunks in the correct order.",
      chunks: item.chunks.slice(),
      displayChunks: shuffle(item.chunks.slice())
    };
  }

  /* =========================================================
     REGULAR VERBS — LEVEL 3
     PRONUNCIATION
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
      Math.floor(Math.random() * 3);

    const oddIdx =
      (mainIdx +
        1 +
        Math.floor(Math.random() * 2)) %
      3;

    const main =
      shuffle(groups[mainIdx].list).slice(
        0,
        3
      );

    const odd =
      pick(groups[oddIdx].list);

    const options =
      shuffle(
        main.concat([odd])
      );

    return {
      type: "mc",
      hint:
        "Which past form has a different -ed sound?",
      prompt:
        "Find the different pronunciation.",
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

    const [base, past] =
      pick(pool);

    const form =
      pick([
        "pos",
        "neg",
        "q"
      ]);

    const subj =
      pick([
        "I",
        "You",
        "He",
        "She",
        "We",
        "They"
      ]);

    if (form === "pos") {
      return {
        type: "mc",
        hint:
          "Positive · irregular verb",
        prompt:
          "Yesterday " +
          subj.toLowerCase() +
          " ____ home. (" +
          base +
          ")",
        choices: shuffle([
          past,
          base,
          base + "ed"
        ]),
        answer: past
      };
    }

    if (form === "neg") {
      return {
        type: "mc",
        hint:
          "Negative · irregular verb",
        prompt:
          subj +
          " ____ the homework. (" +
          base +
          ")",
        choices: shuffle([
          "didn't " + base,
          "didn't " + past,
          "doesn't " + base
        ]),
        answer:
          "didn't " + base
      };
    }

    return {
      type: "mc",
      hint:
        "Question · irregular verb",
      prompt:
        "____ she ____ it? (" +
        base +
        ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Does / " + base
      ]),
      answer:
        "Did / " + base
    };
  }

  /* =========================================================
     IRREGULAR VERBS — LEVEL 2
     SENTENCE ASSEMBLY
     ========================================================= */

  const IRREGULAR_WH = [
    {
      chunks: [
        "Where",
        "did",
        "you",
        "go",
        "last weekend?"
      ]
    },
    {
      chunks: [
        "What",
        "did",
        "she",
        "eat",
        "for breakfast?"
      ]
    },
    {
      chunks: [
        "When",
        "did",
        "they",
        "come",
        "home?"
      ]
    },
    {
      chunks: [
        "Where",
        "did",
        "he",
        "put",
        "the book?"
      ]
    },
    {
      chunks: [
        "What",
        "did",
        "you",
        "buy",
        "at the store?"
      ]
    },
    {
      chunks: [
        "Why",
        "did",
        "she",
        "leave",
        "the hotel early?"
      ]
    },
    {
      chunks: [
        "When",
        "did",
        "you",
        "meet",
        "your friend?"
      ]
    },
    {
      chunks: [
        "What",
        "did",
        "he",
        "have",
        "at the restaurant?"
      ]
    },
    {
      chunks: [
        "Where",
        "did",
        "they",
        "sleep",
        "last night?"
      ]
    },
    {
      chunks: [
        "What",
        "did",
        "she",
        "make",
        "for dinner?"
      ]
    },
    {
      chunks: [
        "When",
        "did",
        "he",
        "get",
        "home?"
      ]
    },
    {
      chunks: [
        "Why",
        "did",
        "they",
        "take",
        "the bus?"
      ]
    },
    {
      chunks: [
        "Where",
        "did",
        "she",
        "find",
        "her keys?"
      ]
    },
    {
      chunks: [
        "What",
        "did",
        "you",
        "drink",
        "with dinner?"
      ]
    },
    {
      chunks: [
        "When",
        "did",
        "your parents",
        "come",
        "home?"
      ]
    },
    {
      chunks: [
        "Where",
        "did",
        "he",
        "leave",
        "his bag?"
      ]
    },
    {
      chunks: [
        "Why",
        "did",
        "you",
        "take",
        "a taxi?"
      ]
    },
    {
      chunks: [
        "What",
        "did",
        "they",
        "see",
        "at the museum?"
      ]
    }
  ];

  function qIrrWh() {
    const item =
      pick(IRREGULAR_WH);

    return {
      type: "assemble",
      hint:
        "Build the correct Wh- question",
      prompt:
        "Put the chunks in the correct order.",
      chunks: item.chunks.slice(),
      displayChunks: shuffle(item.chunks.slice())
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
      window.innerWidth <= 700 ||
      window.innerHeight <= 700
        ? 3
        : 4;

    const pairs =
      shuffle(pool).slice(
        0,
        count
      );

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
      label:
        "Was / Were · Level 1",
      build: qWasWere
    },

    ww2: {
      label:
        "There was / were · Level 2",
      build:
        qThereWasWere
    },

    ww3: {
      label:
        "Was / Were · Wh- questions",
      build:
        qWasWereWh
    },

    reg1: {
      label:
        "Regular · Level 1",
      build:
        qRegLevel1
    },

    reg2: {
      label:
        "Regular · Wh- questions",
      build:
        qRegWh
    },

    "reg-sound": {
      label:
        "Regular · Pronunciation",
      build:
        qRegSound
    },

    irr1: {
      label:
        "Irregular · Level 1",
      build:
        qIrrLevel1
    },

    irr2: {
      label:
        "Irregular · Wh- questions",
      build:
        qIrrWh
    },

    "irr-match": {
      label:
        "Irregular · Matching",
      build:
        qIrrMatch
    }
  };

  /* =========================================================
     UI
     ========================================================= */

  const menuScreen =
    document.getElementById(
      "menuScreen"
    );

  const playScreen =
    document.getElementById(
      "playScreen"
    );

  const resultScreen =
    document.getElementById(
      "resultScreen"
    );

  const choicesArea =
    document.getElementById(
      "choicesArea"
    );

  const matchArea =
    document.getElementById(
      "matchArea"
    );

  const matchLeft =
    document.getElementById(
      "matchLeft"
    );

  const matchRight =
    document.getElementById(
      "matchRight"
    );

  const feedbackEl =
    document.getElementById(
      "feedback"
    );

  const promptHint =
    document.getElementById(
      "promptHint"
    );

  const promptText =
    document.getElementById(
      "promptText"
    );

  const modeLabel =
    document.getElementById(
      "modeLabel"
    );

  const scoreEl =
    document.getElementById(
      "score"
    );

  const progressFill =
    document.getElementById(
      "progressFill"
    );

  /* =========================================================
     STATE
     ========================================================= */

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
     ASSEMBLY STATE
     ========================================================= */

  let assemblySelected = [];
  let assemblyAvailable = [];
  let assemblyAnswer = [];
  let assemblyLocked = false;

  /* =========================================================
     SCREEN CONTROL
     ========================================================= */

  function show(name) {
    menuScreen.classList.add("hidden");
    playScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    if (name === "menu") {
      menuScreen.classList.remove(
        "hidden"
      );
    }

    if (name === "play") {
      playScreen.classList.remove(
        "hidden"
      );
    }

    if (name === "result") {
      resultScreen.classList.remove(
        "hidden"
      );
    }
  }

  function updateProgress() {
    if (!progressFill) {
      return;
    }

    progressFill.style.width =
      Math.round(
        (index / TOTAL) * 100
      ) + "%";
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

  if (!mode) {
    return;
  }

  queue = [];

  // WH-question modes: use unique items (no repeats in a round)
  if (key === "ww3" || key === "reg2" || key === "irr2") {
    const source =
      key === "ww3"
        ? WAS_WERE_WH
        : key === "reg2"
          ? REGULAR_WH
          : IRREGULAR_WH;

    const unique = shuffle(source.slice()).slice(0, TOTAL);

    unique.forEach(function (item) {
      queue.push({
        type: "assemble",
        hint: "Build the correct Wh- question",
        prompt: "Put the chunks in the correct order.",
        chunks: item.chunks.slice(),
        displayChunks: shuffle(item.chunks.slice())
      });
    });
  } else {
    for (let i = 0; i < TOTAL; i++) {
      queue.push(mode.build());
    }
  }

  index = 0;
  score = 0;
  correct = 0;
  wrong = 0;

  if (modeLabel) {
    modeLabel.textContent = mode.label;
  }

  if (scoreEl) {
    scoreEl.textContent = "0";
  }

  show("play");

  loadItem();
}
  /* =========================================================
     LOAD ITEM
     ========================================================= */

  function loadItem() {
    locked = false;
    assemblyLocked = false;

    feedbackEl.textContent = "";
    feedbackEl.className =
      "feedback";

    const item =
      queue[index];

    if (!item) {
      return;
    }

    updateProgress();

    promptHint.textContent =
      item.hint;

    promptText.textContent =
      item.prompt;

    if (
      item.type === "match"
    ) {
      choicesArea.classList.add(
        "hidden"
      );

      if (matchArea) {
        matchArea.classList.remove(
          "hidden"
        );

        matchArea.style.display =
          "flex";
      }

      setupMatch(item);

      if (matchArea) {
        matchArea.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }

      return;
    }

    if (
      item.type ===
      "assemble"
    ) {
      if (matchArea) {
        matchArea.classList.add(
          "hidden"
        );

        matchArea.style.display =
          "";
      }

      choicesArea.classList.remove(
        "hidden"
      );

      renderAssembly(item);

      return;
    }

    if (matchArea) {
      matchArea.classList.add(
        "hidden"
      );

      matchArea.style.display =
        "";
    }

    choicesArea.classList.remove(
      "hidden"
    );

    renderChoices(item);
  }

  /* =========================================================
     MULTIPLE CHOICE
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

    item.choices.forEach(
      function (choice) {
        const btn =
          document.createElement(
            "button"
          );

        btn.type = "button";
        btn.className =
          "choice-btn";
        btn.textContent =
          choice;

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

        choicesArea.appendChild(
          btn
        );
      }
    );
  }

  function onChoice(
    choice,
    answer,
    btn
  ) {
    if (locked) {
      return;
    }

    locked = true;

    const ok =
      choice === answer;

    document
      .querySelectorAll(
        ".choice-btn"
      )
      .forEach(
        function (button) {
          button.disabled =
            true;

          if (
            button.textContent ===
            answer
          ) {
            button.classList.add(
              "correct"
            );
          }
        }
      );

    if (ok) {
      btn.classList.add(
        "correct"
      );

      score += 10;
      correct += 1;

      feedbackEl.textContent =
        "Correct!";

      feedbackEl.className =
        "feedback ok";
    } else {
      btn.classList.add(
        "wrong"
      );

      wrong += 1;

      feedbackEl.textContent =
        "Answer: " +
        answer;

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

        if (
          index >= TOTAL
        ) {
          endRound();
        } else {
          loadItem();
        }
      },
      ok ? 650 : 1300
    );
  }

  /* =========================================================
     SENTENCE ASSEMBLY
     ========================================================= */

  function renderAssembly(item) {
    choicesArea.innerHTML = "";

    choicesArea.classList.remove(
      "mk-stagger-fast"
    );

    assemblySelected = [];

    // Use the shuffled copy for the chips the player can tap
    const display = item.displayChunks || item.chunks;

    assemblyAvailable = display.map(function (chunk, i) {
      return {
        id: i,
        text: chunk
      };
    });

    // Always keep the original correct order
    assemblyAnswer = item.chunks.slice();

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "question-builder";

    const answerTitle =
      document.createElement(
        "div"
      );

    answerTitle.className =
      "builder-label";

    answerTitle.textContent =
      "Build the question:";

    const answerBox =
      document.createElement(
        "div"
      );

    answerBox.className =
      "builder-answer";

    answerBox.id =
      "builderAnswer";

    const chunksBox =
      document.createElement(
        "div"
      );

    chunksBox.className =
      "builder-chunks";

    chunksBox.id =
      "builderChunks";

    wrapper.appendChild(
      answerTitle
    );

    wrapper.appendChild(
      answerBox
    );

    wrapper.appendChild(
      chunksBox
    );

    choicesArea.appendChild(
      wrapper
    );

    renderAssemblyChunks();
    renderAssemblyAnswer();
  }

  function renderAssemblyChunks() {
    const chunksBox =
      document.getElementById(
        "builderChunks"
      );

    if (!chunksBox) {
      return;
    }

    chunksBox.innerHTML = "";

    assemblyAvailable.forEach(
      function (chunk) {
        const btn =
          document.createElement(
            "button"
          );

        btn.type = "button";

        btn.className =
          "choice-btn assembly-chip";

        btn.textContent =
          chunk.text;

        btn.dataset.chunkId =
          String(chunk.id);

        btn.addEventListener(
          "click",
          function () {
            selectAssemblyChunk(
              chunk.id
            );
          }
        );

        chunksBox.appendChild(
          btn
        );
      }
    );
  }

  function renderAssemblyAnswer() {
    const answerBox =
      document.getElementById(
        "builderAnswer"
      );

    if (!answerBox) {
      return;
    }

    answerBox.innerHTML = "";

    if (
      assemblySelected.length ===
      0
    ) {
      const placeholder =
        document.createElement(
          "span"
        );

      placeholder.className =
        "builder-placeholder";

      placeholder.textContent =
        "Tap the chunks below to build the question.";

      answerBox.appendChild(
        placeholder
      );

      return;
    }

    assemblySelected.forEach(
      function (chunk, index) {
        const btn =
          document.createElement(
            "button"
          );

        btn.type = "button";

        btn.className =
          "assembly-answer-chip";

        btn.textContent =
          chunk.text;

        btn.title =
          "Tap to remove";

        btn.addEventListener(
          "click",
          function () {
            removeAssemblyChunk(
              index
            );
          }
        );

        answerBox.appendChild(
          btn
        );
      }
    );
  }

  function selectAssemblyChunk(
    id
  ) {
    if (assemblyLocked) {
      return;
    }

    const index =
      assemblyAvailable.findIndex(
        function (chunk) {
          return chunk.id === id;
        }
      );

    if (index === -1) {
      return;
    }

    const chunk =
      assemblyAvailable[index];

    assemblySelected.push(
      chunk
    );

    assemblyAvailable.splice(
      index,
      1
    );

    renderAssemblyChunks();
    renderAssemblyAnswer();

    if (
      assemblySelected.length ===
      assemblyAnswer.length
    ) {
      checkAssembly();
    }
  }

  function removeAssemblyChunk(
    answerIndex
  ) {
    if (assemblyLocked) {
      return;
    }

    const removed =
      assemblySelected.splice(
        answerIndex,
        1
      )[0];

    if (removed) {
      assemblyAvailable.push(
        removed
      );
    }

    renderAssemblyChunks();
    renderAssemblyAnswer();
  }

  function normalizeAssembly(
    arr
  ) {
    return arr
      .join(" ")
      .replace(
        /\s+([?.!,])/g,
        "$1"
      )
      .trim()
      .toLowerCase();
  }

  function checkAssembly() {
    if (assemblyLocked) {
      return;
    }

    assemblyLocked = true;

    const userAnswer =
      normalizeAssembly(
        assemblySelected.map(
          function (x) {
            return x.text;
          }
        )
      );

    const correctAnswer =
      normalizeAssembly(
        assemblyAnswer
      );

    const ok =
      userAnswer ===
      correctAnswer;

    const answerBox =
      document.getElementById(
        "builderAnswer"
      );

    if (ok) {
      score += 10;
      correct += 1;

      if (answerBox) {
        answerBox.classList.add(
          "correct"
        );
      }

      feedbackEl.textContent =
        "Correct!";

      feedbackEl.className =
        "feedback ok";

      if (scoreEl) {
        scoreEl.textContent =
          String(score);
      }

      setTimeout(
        nextQuestion,
        700
      );
    } else {
      wrong += 1;

      if (answerBox) {
        answerBox.classList.add(
          "wrong"
        );
      }

      feedbackEl.textContent =
        "Correct answer: " +
        assemblyAnswer.join(
          " "
        );

      feedbackEl.className =
        "feedback bad";

      setTimeout(
        nextQuestion,
        1600
      );
    }
  }

  function nextQuestion() {
    index += 1;

    if (index >= TOTAL) {
      endRound();
    } else {
      loadItem();
    }
  }

  /* =========================================================
     MATCHING
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
      function (p) {
        matchMap[p.left] =
          p.right;
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

    matchLeft.innerHTML =
      "";

    matchRight.innerHTML =
      "";

    lefts.forEach(
      function (word) {
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
          "left";

        btn.dataset.val =
          word;

        btn.addEventListener(
          "click",
          function () {
            onMatchPick(btn);
          }
        );

        matchLeft.appendChild(
          btn
        );
      }
    );

    rights.forEach(
      function (word) {
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
          "right";

        btn.dataset.val =
          word;

        btn.addEventListener(
          "click",
          function () {
            onMatchPick(btn);
          }
        );

        matchRight.appendChild(
          btn
        );
      }
    );
  }

  function onMatchPick(btn) {
    if (
      locked ||
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

    matchSel[side] =
      btn;

    if (
      matchSel.left &&
      matchSel.right
    ) {
      const left =
        matchSel.left.dataset.val;

      const right =
        matchSel.right.dataset.val;

      if (
        matchMap[left] ===
        right
      ) {
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
          matchDone >=
          matchTotal
        ) {
          correct += 1;
          locked = true;

          setTimeout(
            function () {
              index += 1;

              if (
                index >= TOTAL
              ) {
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

    pool.forEach(
      function (p) {
        rushMap[p[0]] =
          p[1];
      }
    );

    const lefts =
      shuffle(
        pool.map(
          function (p) {
            return p[0];
          }
        )
      );

    const rights =
      shuffle(
        pool.map(
          function (p) {
            return p[1];
          }
        )
      );

    matchLeft.innerHTML =
      "";

    matchRight.innerHTML =
      "";

    lefts.forEach(
      function (word) {
        matchLeft.appendChild(
          makeRushChip(
            word,
            "left"
          )
        );
      }
    );

    rights.forEach(
      function (word) {
        matchRight.appendChild(
          makeRushChip(
            word,
            "right"
          )
        );
      }
    );

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
      const left =
        rushSel.left.dataset.val;

      const right =
        rushSel.right.dataset.val;

      if (
        rushMap[left] ===
        right
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
            (rushCombo - 1) *
              5
          );

        score += pts;
        correct += 1;

        if (feedbackEl) {
          feedbackEl.textContent =
            "Nice! +" +
            pts;

          feedbackEl.className =
            "feedback ok";
        }

        rushSel = {
          left: null,
          right: null
        };

        updateRushHud();

        const remaining =
          matchLeft.querySelectorAll(
            ".match-chip:not(.matched)"
          ).length;

        if (
          remaining === 0
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
      Object.keys(
        rushMap
      ).length || 1;

    const accuracy =
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
        accuracy
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
              (correct /
                TOTAL) *
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
    .querySelectorAll(
      ".level-list li"
    )
    .forEach(
      function (li) {
        li.addEventListener(
          "click",
          function (event) {
            if (
              event.target.closest(
                "a"
              )
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
      }
    );

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
        stopRushTimer();

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
          startMode(
            modeKey
          );
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
