/* Simple Past — Was/Were · Regular · Irregular */
(function () {
  "use strict";

  const TOTAL = 10;

  /* ---------- DATA ---------- */

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

  /* ---------- -ED PRONUNCIATION ---------- */

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

  /* ---------- HELPERS ---------- */

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(a) {
    const x = a.slice();

    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [x[i], x[j]] = [x[j], x[i]];
    }

    return x;
  }

  /* =========================================================
     WAS / WERE
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
      "in the evening"
    ];

    const place = pick(situations);
    const time = pick(timeExpressions);

    return {
      type: "mc",
      hint: "Choose was or were",
      prompt: subject + " ____ " + place + " " + time + ".",
      choices: shuffle([
        "was",
        "were",
        "is"
      ]),
      answer: answer
    };
  }

  /* =========================================================
     THERE WAS / THERE WERE
     
     A1 hotel / house / apartment vocabulary.
     Sentences are written as complete situations rather
     than randomly combining nouns and places.
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
     WAS / WERE — WH QUESTIONS
     ========================================================= */

  function qWasWereWh() {
    const questions = [
      {
        prompt: "Where ____ you after work?",
        choices: [
          "Where were you after work?",
          "Where was you after work?",
          "Where are you after work?"
        ],
        answer: "Where were you after work?"
      },

      {
        prompt: "Where ____ Tom last night?",
        choices: [
          "Where was Tom last night?",
          "Where were Tom last night?",
          "Where is Tom last night?"
        ],
        answer: "Where was Tom last night?"
      },

      {
        prompt: "Why ____ Sara at home on Saturday?",
        choices: [
          "Why was Sara at home on Saturday?",
          "Why were Sara at home on Saturday?",
          "Why is Sara at home on Saturday?"
        ],
        answer: "Why was Sara at home on Saturday?"
      },

      {
        prompt: "When ____ they at the hotel?",
        choices: [
          "When were they at the hotel?",
          "When was they at the hotel?",
          "When are they at the hotel?"
        ],
        answer: "When were they at the hotel?"
      },

      {
        prompt: "Where ____ your parents last weekend?",
        choices: [
          "Where were your parents last weekend?",
          "Where was your parents last weekend?",
          "Where are your parents last weekend?"
        ],
        answer: "Where were your parents last weekend?"
      },

      {
        prompt: "Why ____ he at school yesterday morning?",
        choices: [
          "Why was he at school yesterday morning?",
          "Why were he at school yesterday morning?",
          "Why is he at school yesterday morning?"
        ],
        answer: "Why was he at school yesterday morning?"
      },

      {
        prompt: "When ____ Emma at the party?",
        choices: [
          "When was Emma at the party?",
          "When were Emma at the party?",
          "When is Emma at the party?"
        ],
        answer: "When was Emma at the party?"
      },

      {
        prompt: "Where ____ the students after class?",
        choices: [
          "Where were the students after class?",
          "Where was the students after class?",
          "Where are the students after class?"
        ],
        answer: "Where were the students after class?"
      },

      {
        prompt: "Why ____ you at the hospital?",
        choices: [
          "Why were you at the hospital?",
          "Why was you at the hospital?",
          "Why are you at the hospital?"
        ],
        answer: "Why were you at the hospital?"
      },

      {
        prompt: "Where ____ Sara on Monday evening?",
        choices: [
          "Where was Sara on Monday evening?",
          "Where were Sara on Monday evening?",
          "Where is Sara on Monday evening?"
        ],
        answer: "Where was Sara on Monday evening?"
      },

      {
        prompt: "When ____ your friends at the cinema?",
        choices: [
          "When were your friends at the cinema?",
          "When was your friends at the cinema?",
          "When are your friends at the cinema?"
        ],
        answer: "When were your friends at the cinema?"
      },

      {
        prompt: "Why ____ Tom in the kitchen?",
        choices: [
          "Why was Tom in the kitchen?",
          "Why were Tom in the kitchen?",
          "Why is Tom in the kitchen?"
        ],
        answer: "Why was Tom in the kitchen?"
      }
    ];

    const item = pick(questions);

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
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
      "Yesterday " + subj.toLowerCase() + " ____ at home. (" + base + ")",
      "Last night " + subj.toLowerCase() + " ____ after dinner. (" + base + ")",
      "Last weekend " + subj.toLowerCase() + " ____ with friends. (" + base + ")"
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
        prompt: subj + " ____ it yesterday. (" + base + ")",
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
      prompt: "____ you ____ English yesterday? (" + base + ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Do / " + base
      ]),
      answer: "Did / " + base
    };
  }

  /* =========================================================
     REGULAR VERBS — WH QUESTIONS
     ========================================================= */

  function qRegWh() {
    const questions = [
      {
        prompt: "Where did you ____ after work? (go)",
        choices: [
          "Where did you go after work?",
          "Where did you went after work?",
          "Where do you go after work?"
        ],
        answer: "Where did you go after work?"
      },

      {
        prompt: "When did you ____ your homework? (finish)",
        choices: [
          "When did you finish your homework?",
          "When did you finished your homework?",
          "When do you finish your homework?"
        ],
        answer: "When did you finish your homework?"
      },

      {
        prompt: "Why did you ____ the window? (close)",
        choices: [
          "Why did you close the window?",
          "Why did you closed the window?",
          "Why do you close the window?"
        ],
        answer: "Why did you close the window?"
      },

      {
        prompt: "Where did she ____ last weekend? (travel)",
        choices: [
          "Where did she travel last weekend?",
          "Where did she traveled last weekend?",
          "Where does she travel last weekend?"
        ],
        answer: "Where did she travel last weekend?"
      },

      {
        prompt: "When did they ____ the room? (clean)",
        choices: [
          "When did they clean the room?",
          "When did they cleaned the room?",
          "When do they clean the room?"
        ],
        answer: "When did they clean the room?"
      },

      {
        prompt: "Why did he ____ the door? (open)",
        choices: [
          "Why did he open the door?",
          "Why did he opened the door?",
          "Why does he open the door?"
        ],
        answer: "Why did he open the door?"
      },

      {
        prompt: "Where did you ____ last night? (stay)",
        choices: [
          "Where did you stay last night?",
          "Where did you stayed last night?",
          "Where do you stay last night?"
        ],
        answer: "Where did you stay last night?"
      },

      {
        prompt: "When did she ____ the hotel? (book)",
        choices: [
          "When did she book the hotel?",
          "When did she booked the hotel?",
          "When does she book the hotel?"
        ],
        answer: "When did she book the hotel?"
      },

      {
        prompt: "Why did they ____ the meeting? (cancel)",
        choices: [
          "Why did they cancel the meeting?",
          "Why did they canceled the meeting?",
          "Why do they cancel the meeting?"
        ],
        answer: "Why did they cancel the meeting?"
      },

      {
        prompt: "Where did he ____ the car? (park)",
        choices: [
          "Where did he park the car?",
          "Where did he parked the car?",
          "Where does he park the car?"
        ],
        answer: "Where did he park the car?"
      }
    ];

    const item = pick(questions);

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }

  /* =========================================================
     REGULAR VERBS — PRONUNCIATION
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

    const mainIdx = Math.floor(Math.random() * 3);

    const oddIdx =
      (mainIdx + 1 + Math.floor(Math.random() * 2)) % 3;

    const main = shuffle(groups[mainIdx].list).slice(0, 3);

    const odd = pick(groups[oddIdx].list);

    const options = shuffle(
      main.concat([odd])
    );

    return {
      type: "mc",
      hint: "Which past form has a different -ed sound?",
      prompt: "Find the different pronunciation.",
      choices: options,
      answer: odd
    };
  }

  /* =========================================================
     IRREGULAR VERBS — LEVEL 1
     ========================================================= */

  function qIrrLevel1() {
    const pool = IRREGULAR.filter(function (x) {
      return x[0] !== "be";
    });

    const [base, past] = pick(pool);

    const form = pick([
      "pos",
      "neg",
      "q"
    ]);

    const subj = pick([
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
        hint: "Positive · irregular verb",
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
        hint: "Negative · irregular verb",
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
        answer: "didn't " + base
      };
    }

    return {
      type: "mc",
      hint: "Question · irregular verb",
      prompt:
        "____ she ____ it? (" +
        base +
        ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Does / " + base
      ]),
      answer: "Did / " + base
    };
  }

  /* =========================================================
     IRREGULAR VERBS — WH QUESTIONS
     ========================================================= */

  function qIrrWh() {
    const questions = [
      {
        prompt: "Where did you ____ last night? (go)",
        choices: [
          "Where did you go last night?",
          "Where did you went last night?",
          "Where do you go last night?"
        ],
        answer: "Where did you go last night?"
      },

      {
        prompt: "What did she ____ for breakfast? (eat)",
        choices: [
          "What did she eat for breakfast?",
          "What did she ate for breakfast?",
          "What does she eat for breakfast?"
        ],
        answer: "What did she eat for breakfast?"
      },

      {
        prompt: "When did they ____ home? (come)",
        choices: [
          "When did they come home?",
          "When did they came home?",
          "When do they come home?"
        ],
        answer: "When did they come home?"
      },

      {
        prompt: "Where did he ____ the book? (put)",
        choices: [
          "Where did he put the book?",
          "Where did he putted the book?",
          "Where does he put the book?"
        ],
        answer: "Where did he put the book?"
      },

      {
        prompt: "What did you ____ at the store? (buy)",
        choices: [
          "What did you buy at the store?",
          "What did you bought at the store?",
          "What do you buy at the store?"
        ],
        answer: "What did you buy at the store?"
      },

      {
        prompt: "Why did she ____ home early? (leave)",
        choices: [
          "Why did she leave home early?",
          "Why did she left home early?",
          "Why does she leave home early?"
        ],
        answer: "Why did she leave home early?"
      },

      {
        prompt: "When did you ____ your friend? (meet)",
        choices: [
          "When did you meet your friend?",
          "When did you met your friend?",
          "When do you meet your friend?"
        ],
        answer: "When did you meet your friend?"
      },

      {
        prompt: "What did he ____ at the restaurant? (have)",
        choices: [
          "What did he have at the restaurant?",
          "What did he had at the restaurant?",
          "What does he have at the restaurant?"
        ],
        answer: "What did he have at the restaurant?"
      },

      {
        prompt: "Where did they ____ last weekend? (sleep)",
        choices: [
          "Where did they sleep last weekend?",
          "Where did they slept last weekend?",
          "Where do they sleep last weekend?"
        ],
        answer: "Where did they sleep last weekend?"
      },

      {
        prompt: "What did she ____ in the kitchen? (make)",
        choices: [
          "What did she make in the kitchen?",
          "What did she made in the kitchen?",
          "What does she make in the kitchen?"
        ],
        answer: "What did she make in the kitchen?"
      }
    ];

    const item = pick(questions);

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }

  /* =========================================================
     IRREGULAR VERBS — MATCHING
     ========================================================= */

  function qIrrMatch() {
    const pool = IRREGULAR.filter(function (x) {
      return x[0] !== "be";
    });

    const count =
      window.innerWidth <= 700 ||
      window.innerHeight <= 700
        ? 3
        : 4;

    const pairs = shuffle(pool).slice(0, count);

    return {
      type: "match",
      hint: "Tap a base form, then its past form",
      prompt: "Match base → past",

      pairs: pairs.map(function (pair) {
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
      label: "Was / Were · Wh- questions",
      build: qWasWereWh
    },

    reg1: {
      label: "Regular · Level 1",
      build: qRegLevel1
    },

    reg2: {
      label: "Regular · Wh- questions",
      build: qRegWh
    },

    "reg-sound": {
      label: "Regular · Pronunciation",
      build: qRegSound
    },

    irr1: {
      label: "Irregular · Level 1",
      build: qIrrLevel1
    },

    irr2: {
      label: "Irregular · Wh- questions",
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

  function updateProgress() {
    if (!progressFill) return;

    progressFill.style.width =
      Math.round((index / TOTAL) * 100) + "%";
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
      modeLabel.textContent = mode.label;
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

    promptHint.textContent = item.hint;
    promptText.textContent = item.prompt;

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
     RENDER MULTIPLE CHOICE
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

    item.choices.forEach(function (c) {
      const btn =
        document.createElement("button");

      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = c;

      btn.addEventListener(
        "click",
        function () {
          onChoice(
            c,
            item.answer,
            btn
          );
        }
      );

      choicesArea.appendChild(btn);
    });
  }

  /* =========================================================
     MULTIPLE CHOICE ANSWER
     ========================================================= */

  function onChoice(choice, answer, btn) {
    if (locked) return;

    locked = true;

    const ok = choice === answer;

    document
      .querySelectorAll(".choice-btn")
      .forEach(function (b) {
        b.disabled = true;

        if (b.textContent === answer) {
          b.classList.add("correct");
        }
      });

    if (ok) {
      btn.classList.add("correct");

      score += 10;
      correct += 1;

      feedbackEl.textContent = "Correct!";
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
     MATCHING
     ========================================================= */

  function setupMatch(item) {
    matchSel = {
      left: null,
      right: null
    };

    matchDone = 0;
    matchTotal = item.pairs.length;
    matchMap = {};

    item.pairs.forEach(function (p) {
      matchMap[p.left] = p.right;
    });

    const lefts = shuffle(
      item.pairs.map(function (p) {
        return p.left;
      })
    );

    const rights = shuffle(
      item.pairs.map(function (p) {
        return p.right;
      })
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

    matchArea.classList.remove("hidden");
    matchArea.style.display = "flex";

    choicesArea.classList.add("hidden");

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (w) {
      const b =
        document.createElement("button");

      b.type = "button";
      b.className =
        "match-chip word";

      b.textContent = w;

      b.dataset.side = "left";
      b.dataset.val = w;

      b.addEventListener(
        "click",
        function () {
          onMatchPick(b);
        }
      );

      matchLeft.appendChild(b);
    });

    rights.forEach(function (w) {
      const b =
        document.createElement("button");

      b.type = "button";
      b.className =
        "match-chip word";

      b.textContent = w;

      b.dataset.side = "right";
      b.dataset.val = w;

      b.addEventListener(
        "click",
        function () {
          onMatchPick(b);
        }
      );

      matchRight.appendChild(b);
    });
  }

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

    btn.classList.add("selected");

    matchSel[side] = btn;

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

          setTimeout(function () {
            index += 1;

            if (index >= TOTAL) {
              endRound();
            } else {
              loadItem();
            }
          }, 600);
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

        const a = matchSel.left;
        const b = matchSel.right;

        matchSel = {
          left: null,
          right: null
        };

        setTimeout(function () {
          a.classList.remove(
            "selected",
            "wrong-flash"
          );

          b.classList.remove(
            "selected",
            "wrong-flash"
          );
        }, 400);
      }
    }
  }

  /* =========================================================
     MATCH RUSH
     ========================================================= */

  const RUSH_SECONDS = 90;

  let rushTimerId = null;
  let rushTimeLeft = RUSH_SECONDS;
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
      clearInterval(rushTimerId);
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
      scoreEl.textContent = "0";
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

    const pool = shuffle(
      IRREGULAR.filter(function (x) {
        return x[0] !== "be";
      })
    );

    rushMap = {};

    pool.forEach(function (p) {
      rushMap[p[0]] = p[1];
    });

    const lefts = shuffle(
      pool.map(function (p) {
        return p[0];
      })
    );

    const rights = shuffle(
      pool.map(function (p) {
        return p[1];
      })
    );

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (w) {
      matchLeft.appendChild(
        makeRushChip(w, "left")
      );
    });

    rights.forEach(function (w) {
      matchRight.appendChild(
        makeRushChip(w, "right")
      );
    });

    updateRushHud();

    rushTimerId = setInterval(
      function () {
        rushTimeLeft -= 1;

        updateRushHud();

        if (rushTimeLeft <= 0) {
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
    const b =
      document.createElement(
        "button"
      );

    b.type = "button";

    b.className =
      "match-chip word";

    b.textContent = word;

    b.dataset.side = side;
    b.dataset.val = word;

    b.addEventListener(
      "click",
      function () {
        onRushPick(b);
      }
    );

    return b;
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
        leftChips.map(function (c) {
          return c.dataset.val;
        })
      );

    const rightVals =
      shuffle(
        rightChips.map(function (c) {
          return c.dataset.val;
        })
      );

    matchLeft
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(function (c) {
        c.remove();
      });

    matchRight
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(function (c) {
        c.remove();
      });

    leftVals.forEach(function (w) {
      matchLeft.appendChild(
        makeRushChip(
          w,
          "left"
        )
      );
    });

    rightVals.forEach(function (w) {
      matchRight.appendChild(
        makeRushChip(
          w,
          "right"
        )
      );
    });

    rushSel = {
      left: null,
      right: null
    };
  }

  function onRushPick(btn) {
    if (
      rushLocked ||
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

    rushSel[side] = btn;

    if (
      rushSel.left &&
      rushSel.right
    ) {
      const L =
        rushSel.left.dataset.val;

      const R =
        rushSel.right.dataset.val;

      if (rushMap[L] === R) {
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

        if (leftRemain === 0) {
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

        const a = rushSel.left;
        const b = rushSel.right;

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
      feedbackEl.textContent = "";

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
      Object.keys(rushMap)
        .length || 1;

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
    .querySelectorAll(
      ".level-list li"
    )
    .forEach(function (li) {
      li.addEventListener(
        "click",
        function () {
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

  document
    .getElementById("toMenuBtn")
    .addEventListener(
      "click",
      function () {
        show("menu");
      }
    );

  document
    .getElementById("playAgainBtn")
    .addEventListener(
      "click",
      function () {
        if (modeKey) {
          startMode(modeKey);
        }
      }
    );

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

  show("menu");
})();
