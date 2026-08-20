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

  /* ---------- PRONUNCIATION ---------- */

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

  const PLACES = [
    "home",
    "school",
    "the park",
    "the office",
    "the gym",
    "work",
    "the cinema"
  ];

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

  /* ---------- WAS / WERE ---------- */

  function qWasWere() {
    const usePlural = Math.random() < 0.45;

    let subject;
    let answer;

    if (usePlural) {
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
      choices: shuffle(["was", "were"]),
      answer: answer
    };
  }

  /* ---------- THERE WAS / THERE WERE ---------- */

  function qThereWasWere() {
    const singular = Math.random() < 0.5;

    if (singular) {
      const noun = pick([
        "a book",
        "a party",
        "a problem",
        "a message",
        "an email",
        "a meeting"
      ]);

      return {
        type: "mc",
        hint: "There was / There were",
        prompt: "____ " + noun + " on the table.",
        choices: shuffle([
          "There was",
          "There were"
        ]),
        answer: "There was"
      };
    }

    const noun = pick([
      "two books",
      "many people",
      "some problems",
      "three messages",
      "a lot of cars"
    ]);

    return {
      type: "mc",
      hint: "There was / There were",
      prompt: "____ " + noun + " outside.",
      choices: shuffle([
        "There was",
        "There were"
      ]),
      answer: "There were"
    };
  }

  /* ---------- WAS / WERE WH- QUESTIONS ---------- */

  function qWasWereWh() {
    const questions = [
      {
        prompt: "____ was Tom yesterday?",
        choices: shuffle([
          "Where",
          "When",
          "Why"
        ]),
        answer: "Where"
      },

      {
        prompt: "____ was Sara last night?",
        choices: shuffle([
          "Where",
          "When",
          "Why"
        ]),
        answer: "Where"
      },

      {
        prompt: "____ were you yesterday?",
        choices: shuffle([
          "Where",
          "When",
          "Why"
        ]),
        answer: "Where"
      },

      {
        prompt: "____ were they on Saturday?",
        choices: shuffle([
          "Where",
          "When",
          "Why"
        ]),
        answer: "Where"
      },

      {
        prompt: "____ was the party?",
        choices: shuffle([
          "When",
          "Where",
          "Why"
        ]),
        answer: "When"
      },

      {
        prompt: "____ was the meeting?",
        choices: shuffle([
          "When",
          "Where",
          "Why"
        ]),
        answer: "When"
      },

      {
        prompt: "____ was he at home?",
        choices: shuffle([
          "Why",
          "Where",
          "When"
        ]),
        answer: "Why"
      },

      {
        prompt: "____ was she at school?",
        choices: shuffle([
          "Why",
          "Where",
          "When"
        ]),
        answer: "Why"
      },

      {
        prompt: "____ were they at the park?",
        choices: shuffle([
          "Why",
          "Where",
          "When"
        ]),
        answer: "Why"
      },

      {
        prompt: "____ were you late?",
        choices: shuffle([
          "Why",
          "Where",
          "When"
        ]),
        answer: "Why"
      }
    ];

    const q = pick(questions);

    return {
      type: "mc",
      hint: "Choose the correct Wh- word",
      prompt: q.prompt,
      choices: q.choices,
      answer: q.answer
    };
  }

  /* ---------- REGULAR VERBS ---------- */

  function qRegLevel1() {
    const [base, past] = pick(REGULAR);

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
        hint: "Positive · regular verb",
        prompt:
          "Yesterday " +
          subj.toLowerCase() +
          " ____ the room. (" +
          base +
          ")",

        choices: shuffle([
          past,
          base,
          base + "ed",
          "did " + base
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
          " ____ the movie. (" +
          base +
          ")",

        choices: shuffle([
          "didn't " + base,
          "didn't " + past,
          "not " + past,
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
        "Do / " + base,
        "Was / " + past
      ]),

      answer: "Did / " + base
    };
  }

  /* ---------- REGULAR WH ---------- */

  function qRegWh() {
    const [base, past] = pick(REGULAR);

    const wh = pick([
      "Where",
      "When",
      "Why",
      "What"
    ]);

    return {
      type: "mc",
      hint: "Wh- question · regular verb",

      prompt:
        "Make a question: " +
        wh +
        " / you / " +
        base +
        " / yesterday",

      choices: shuffle([
        wh + " did you " + base + " yesterday?",
        wh + " did you " + past + " yesterday?",
        wh + " do you " + base + " yesterday?",
        wh + " you " + past + " yesterday?"
      ]),

      answer:
        wh +
        " did you " +
        base +
        " yesterday?"
    };
  }

  /* ---------- REGULAR PRONUNCIATION ---------- */

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
      (mainIdx +
        1 +
        Math.floor(Math.random() * 2)) %
      3;

    const main = shuffle(
      groups[mainIdx].list
    ).slice(0, 3);

    const odd = pick(
      groups[oddIdx].list
    );

    const options = shuffle(
      main.concat([odd])
    );

    return {
      type: "mc",
      hint:
        "Which past form has a different -ed sound?",

      prompt:
        "Find the different pronunciation",

      choices: options,

      answer: odd
    };
  }

  /* ---------- IRREGULAR VERBS ---------- */

  function qIrrLevel1() {
    const pool = IRREGULAR.filter(
      (x) => x[0] !== "be"
    );

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
          base + "ed",
          "did " + base
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
          "not " + past,
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
        "Does / " + base,
        "Was / " + past
      ]),

      answer: "Did / " + base
    };
  }

  /* ---------- IRREGULAR WH ---------- */

  function qIrrWh() {
    const pool = IRREGULAR.filter(
      (x) => x[0] !== "be"
    );

    const [base] = pick(pool);

    const wh = pick([
      "Where",
      "When",
      "Why",
      "What"
    ]);

    return {
      type: "mc",
      hint: "Wh- question · irregular verb",

      prompt:
        "Make a question: " +
        wh +
        " / they / " +
        base,

      choices: shuffle([
        wh + " did they " + base + "?",
        wh + " did they " + pick(pool)[1] + "?",
        wh + " do they " + base + "?",
        wh + " they " + base + "?"
      ]),

      answer:
        wh +
        " did they " +
        base +
        "?"
    };
  }

  /* ---------- IRREGULAR MATCHING ---------- */

  function qIrrMatch() {
    const pool = IRREGULAR.filter(
      function (x) {
        return x[0] !== "be";
      }
    );

    const count =
      window.innerWidth <= 700 ||
      window.innerHeight <= 700
        ? 3
        : 4;

    const pairs = shuffle(pool).slice(
      0,
      count
    );

    return {
      type: "match",

      hint:
        "Tap a base form, then its past form",

      prompt:
        "Match base → past",

      pairs: pairs.map(function (pair) {
        return {
          left: pair[0],
          right: pair[1]
        };
      })
    };
  }

  /* ---------- MODES ---------- */

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

  /* ---------- UI / STATE ---------- */

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

  /* ---------- SCREEN CONTROL ---------- */

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
      Math.round(
        (index / TOTAL) * 100
      ) + "%";
  }

  /* ---------- START MODE ---------- */

  function startMode(key) {
    modeKey = key;

    if (key === "irr-match") {
      startMatchRush();
      return;
    }

    const mode = MODES[key];

    queue = [];

    for (
      let i = 0;
      i < TOTAL;
      i++
    ) {
      queue.push(
        mode.build()
      );
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

  /* ---------- LOAD QUESTION ---------- */

  function loadItem() {
    locked = false;

    feedbackEl.textContent = "";
    feedbackEl.className =
      "feedback";

    const item = queue[index];

    updateProgress();

    promptHint.textContent =
      item.hint;

    promptText.textContent =
      item.prompt;

    if (item.type === "match") {
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
    } else {
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
  }

  /* ---------- MULTIPLE CHOICE ---------- */

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
      (c) => {
        const btn =
          document.createElement(
            "button"
          );

        btn.type = "button";

        btn.className =
          "choice-btn";

        btn.textContent = c;

        btn.addEventListener(
          "click",
          () =>
            onChoice(
              c,
              item.answer,
              btn
            )
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
    if (locked) return;

    locked = true;

    const ok =
      choice === answer;

    document
      .querySelectorAll(
        ".choice-btn"
      )
      .forEach((b) => {
        b.disabled = true;

        if (
          b.textContent ===
          answer
        ) {
          b.classList.add(
            "correct"
          );
        }
      });

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
        "Answer: " + answer;

      feedbackEl.className =
        "feedback bad";
    }

    if (scoreEl) {
      scoreEl.textContent =
        String(score);
    }

    setTimeout(
      () => {
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

  /* ---------- MATCHING ---------- */

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

    const lefts = shuffle(
      item.pairs.map(
        function (p) {
          return p.left;
        }
      )
    );

    const rights = shuffle(
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

    lefts.forEach((w) => {
      const b =
        document.createElement(
          "button"
        );

      b.type = "button";

      b.className =
        "match-chip word";

      b.textContent = w;

      b.dataset.side = "left";
      b.dataset.val = w;

      b.addEventListener(
        "click",
        () => onMatchPick(b)
      );

      matchLeft.appendChild(b);
    });

    rights.forEach((w) => {
      const b =
        document.createElement(
          "button"
        );

      b.type = "button";

      b.className =
        "match-chip word";

      b.textContent = w;

      b.dataset.side = "right";
      b.dataset.val = w;

      b.addEventListener(
        "click",
        () => onMatchPick(b)
      );

      matchRight.appendChild(b);
    });
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
      .forEach((b) => {
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
          matchDone >=
          matchTotal
        ) {
          correct += 1;

          locked = true;

          setTimeout(
            () => {
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
          () => {
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

  /* ---------- MATCH RUSH ---------- */

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

    const lefts = shuffle(
      pool.map(
        function (p) {
          return p[0];
        }
      )
    );

    const rights = shuffle(
      pool.map(
        function (p) {
          return p[1];
        }
      )
    );

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(
      function (w) {
        matchLeft.appendChild(
          makeRushChip(
            w,
            "left"
          )
        );
      }
    );

    rights.forEach(
      function (w) {
        matchRight.appendChild(
          makeRushChip(
            w,
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

    const leftVals = shuffle(
      leftChips.map(
        function (c) {
          return c.dataset.val;
        }
      )
    );

    const rightVals = shuffle(
      rightChips.map(
        function (c) {
          return c.dataset.val;
        }
      )
    );

    matchLeft
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(
        function (c) {
          c.remove();
        }
      );

    matchRight
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(
        function (c) {
          c.remove();
        }
      );

    leftVals.forEach(
      function (w) {
        matchLeft.appendChild(
          makeRushChip(
            w,
            "left"
          )
        );
      }
    );

    rightVals.forEach(
      function (w) {
        matchRight.appendChild(
          makeRushChip(
            w,
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

  /* ---------- END MATCH RUSH ---------- */

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

  /* ---------- END NORMAL ROUND ---------- */

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
      (TOTAL
        ? Math.round(
            (correct / TOTAL) *
              100
          )
        : 0) + "%";

    show("result");
  }

  /* ---------- MENU ---------- */

  document
    .querySelectorAll(
      ".level-list li"
    )
    .forEach((li) => {
      li.addEventListener(
        "click",
        () => {
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

  /* ---------- MATCH RUSH BUTTON ---------- */

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

  /* ---------- BACK TO MENU ---------- */

  if (backMenu) {
    backMenu.addEventListener(
      "click",
      () => {
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

  /* ---------- RESULT BUTTONS ---------- */

  document
    .getElementById(
      "toMenuBtn"
    )
    .addEventListener(
      "click",
      () => show("menu")
    );

  document
    .getElementById(
      "playAgainBtn"
    )
    .addEventListener(
      "click",
      () => {
        if (modeKey) {
          startMode(
            modeKey
          );
        }
      }
    );

  /* ---------- SITE THEME ---------- */

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

  /* ---------- START ---------- */

  show("menu");

})();
