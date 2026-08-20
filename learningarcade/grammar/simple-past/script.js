/* =========================================================
   SIMPLE PAST — A1
   Was / Were · Regular · Irregular
   Mr. Sheyhaki's Learning Arcade
========================================================= */

(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     VERB DATA
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
     BASIC DATA
  ========================================================= */

  const WAS_WERE_TIME = [
    "yesterday",
    "last night",
    "last week",
    "last weekend",
    "last Monday",
    "last Saturday",
    "last summer",
    "last year",
    "this morning",
    "this afternoon",
    "an hour ago",
    "two hours ago",
    "three days ago",
    "a week ago",
    "on Monday",
    "on Saturday",
    "in the morning",
    "in the afternoon",
    "in the evening"
  ];

  const SIMPLE_SUBJECTS = [
    "I",
    "You",
    "He",
    "She",
    "We",
    "They"
  ];

  const PEOPLE = [
    "Tom",
    "Sara",
    "Ali",
    "Emma",
    "My parents",
    "The students"
  ];

  const WH = [
    "Where",
    "When",
    "Why",
    "Who",
    "What"
  ];


  /* =========================================================
     SENTENCE DATA — REGULAR VERBS
     Each verb has safe A1 contexts.
  ========================================================= */

  const REGULAR_CONTEXTS = {

    answer: [
      ["the question", "the questions"],
      ["the phone", "the phone"],
      ["the email", "the emails"]
    ],

    arrive: [
      ["at school", "at school"],
      ["at work", "at work"],
      ["at the hotel", "at the hotel"],
      ["home", "home"]
    ],

    ask: [
      ["a question", "a question"],
      ["the teacher", "the teacher"],
      ["my friend", "my friend"]
    ],

    book: [
      ["a hotel room", "a hotel room"],
      ["a ticket", "a ticket"],
      ["a flight", "a flight"]
    ],

    call: [
      ["my mother", "my mother"],
      ["my friend", "my friend"],
      ["the doctor", "the doctor"]
    ],

    carry: [
      ["a bag", "a bag"],
      ["the boxes", "the boxes"],
      ["my books", "my books"]
    ],

    change: [
      ["my clothes", "my clothes"],
      ["the plan", "the plan"],
      ["my seat", "my seat"]
    ],

    "check in": [
      ["at the hotel", "at the hotel"],
      ["at the airport", "at the airport"]
    ],

    clean: [
      ["my room", "my room"],
      ["the kitchen", "the kitchen"],
      ["the house", "the house"]
    ],

    close: [
      ["the door", "the door"],
      ["the window", "the window"],
      ["the shop", "the shop"]
    ],

    cook: [
      ["dinner", "dinner"],
      ["lunch", "lunch"],
      ["a cake", "a cake"]
    ],

    cry: [
      ["at home", "at home"],
      ["in the morning", "in the morning"]
    ],

    decide: [
      ["to stay home", "to stay home"],
      ["to go out", "to go out"],
      ["to study", "to study"]
    ],

    finish: [
      ["my homework", "my homework"],
      ["the book", "the book"],
      ["my work", "my work"]
    ],

    hate: [
      ["the movie", "the movie"],
      ["the food", "the food"]
    ],

    help: [
      ["my mother", "my mother"],
      ["my friend", "my friend"],
      ["the teacher", "the teacher"]
    ],

    invite: [
      ["my friends", "my friends"],
      ["Tom", "Tom"],
      ["Sara", "Sara"]
    ],

    learn: [
      ["English", "English"],
      ["new words", "new words"],
      ["a lot", "a lot"]
    ],

    like: [
      ["the movie", "the movie"],
      ["the food", "the food"],
      ["the music", "the music"]
    ],

    listen: [
      ["to music", "to music"],
      ["to the teacher", "to the teacher"],
      ["to the radio", "to the radio"]
    ],

    live: [
      ["in Baku", "in Baku"],
      ["in a small house", "in a small house"],
      ["with my family", "with my family"]
    ],

    look: [
      ["at the picture", "at the picture"],
      ["at the map", "at the map"],
      ["at the photo", "at the photo"]
    ],

    love: [
      ["the movie", "the movie"],
      ["the food", "the food"],
      ["the music", "the music"]
    ],

    miss: [
      ["the bus", "the bus"],
      ["the train", "the train"],
      ["my friend", "my friend"]
    ],

    move: [
      ["to a new house", "to a new house"],
      ["to a new city", "to a new city"]
    ],

    need: [
      ["some help", "some help"],
      ["a new bag", "a new bag"],
      ["some water", "some water"]
    ],

    offer: [
      ["some help", "some help"],
      ["the guests some tea", "the guests some tea"]
    ],

    open: [
      ["the door", "the door"],
      ["the window", "the window"],
      ["the shop", "the shop"]
    ],

    pack: [
      ["my bag", "my bag"],
      ["my clothes", "my clothes"],
      ["my suitcase", "my suitcase"]
    ],

    paint: [
      ["the room", "the room"],
      ["the wall", "the wall"],
      ["the house", "the house"]
    ],

    park: [
      ["the car", "the car"],
      ["near the school", "near the school"]
    ],

    pass: [
      ["the test", "the test"],
      ["the exam", "the exam"]
    ],

    play: [
      ["football", "football"],
      ["tennis", "tennis"],
      ["a game", "a game"]
    ],

    rain: [
      ["all day", "all day"],
      ["in the morning", "in the morning"]
    ],

    relax: [
      ["at home", "at home"],
      ["on the sofa", "on the sofa"]
    ],

    rent: [
      ["a car", "a car"],
      ["a house", "a house"]
    ],

    snow: [
      ["all day", "all day"],
      ["at night", "at night"]
    ],

    start: [
      ["my homework", "my homework"],
      ["the lesson", "the lesson"],
      ["work", "work"]
    ],

    stay: [
      ["at home", "at home"],
      ["at a hotel", "at a hotel"],
      ["with my family", "with my family"]
    ],

    stop: [
      ["the car", "the car"],
      ["the bus", "the bus"]
    ],

    study: [
      ["English", "English"],
      ["math", "math"],
      ["for the test", "for the test"]
    ],

    talk: [
      ["to my friend", "to my friend"],
      ["to the teacher", "to the teacher"],
      ["about school", "about school"]
    ],

    travel: [
      ["to Turkey", "to Turkey"],
      ["to another city", "to another city"],
      ["with my family", "with my family"]
    ],

    turn: [
      ["on the TV", "on the TV"],
      ["off the light", "off the light"],
      ["left", "left"]
    ],

    use: [
      ["my phone", "my phone"],
      ["the computer", "the computer"],
      ["a dictionary", "a dictionary"]
    ],

    wait: [
      ["for the bus", "for the bus"],
      ["for my friend", "for my friend"]
    ],

    walk: [
      ["to school", "to school"],
      ["in the park", "in the park"],
      ["home", "home"]
    ],

    want: [
      ["some water", "some water"],
      ["a coffee", "a coffee"],
      ["a new phone", "a new phone"]
    ],

    wash: [
      ["my hands", "my hands"],
      ["the dishes", "the dishes"],
      ["my car", "my car"]
    ],

    watch: [
      ["TV", "TV"],
      ["a movie", "a movie"],
      ["the football game", "the football game"]
    ],

    work: [
      ["at home", "at home"],
      ["at the office", "at the office"],
      ["at a restaurant", "at a restaurant"]
    ]
  };


  /* =========================================================
     SENTENCE DATA — IRREGULAR VERBS
  ========================================================= */

  const IRREGULAR_CONTEXTS = {

    buy: [
      ["some food", "some food"],
      ["a new shirt", "a new shirt"],
      ["a book", "a book"]
    ],

    do: [
      ["my homework", "my homework"],
      ["the work", "the work"],
      ["the dishes", "the dishes"]
    ],

    get: [
      ["a new phone", "a new phone"],
      ["some water", "some water"],
      ["a message", "a message"]
    ],

    go: [
      ["to school", "to school"],
      ["to work", "to work"],
      ["to the park", "to the park"],
      ["home", "home"]
    ],

    have: [
      ["breakfast", "breakfast"],
      ["lunch", "lunch"],
      ["a good day", "a good day"]
    ],

    leave: [
      ["home", "home"],
      ["the office", "the office"],
      ["school", "school"]
    ],

    say: [
      ["hello", "hello"],
      ["thank you", "thank you"],
      ["goodbye", "goodbye"]
    ],

    see: [
      ["a movie", "a movie"],
      ["my friend", "my friend"],
      ["a doctor", "a doctor"]
    ],

    send: [
      ["an email", "an email"],
      ["a message", "a message"],
      ["a photo", "a photo"]
    ],

    sit: [
      ["on the sofa", "on the sofa"],
      ["near the window", "near the window"],
      ["at the table", "at the table"]
    ],

    tell: [
      ["me the story", "me the story"],
      ["him the news", "him the news"],
      ["her the truth", "her the truth"]
    ],

    write: [
      ["an email", "an email"],
      ["a message", "a message"],
      ["a letter", "a letter"]
    ],

    come: [
      ["home", "home"],
      ["to my house", "to my house"],
      ["to school", "to school"]
    ],

    drink: [
      ["some water", "some water"],
      ["coffee", "coffee"],
      ["tea", "tea"]
    ],

    drive: [
      ["to work", "to work"],
      ["to school", "to school"],
      ["home", "home"]
    ],

    eat: [
      ["breakfast", "breakfast"],
      ["lunch", "lunch"],
      ["pizza", "pizza"]
    ],

    fall: [
      ["off the bike", "off the bike"],
      ["on the floor", "on the floor"]
    ],

    find: [
      ["my keys", "my keys"],
      ["my phone", "my phone"],
      ["a book", "a book"]
    ],

    give: [
      ["her a present", "her a present"],
      ["him some money", "him some money"],
      ["me a book", "me a book"]
    ],

    know: [
      ["the answer", "the answer"],
      ["the teacher", "the teacher"]
    ],

    make: [
      ["breakfast", "breakfast"],
      ["a cake", "a cake"],
      ["dinner", "dinner"]
    ],

    meet: [
      ["my friends", "my friends"],
      ["my teacher", "my teacher"],
      ["Tom", "Tom"]
    ],

    read: [
      ["a book", "a book"],
      ["the newspaper", "the newspaper"],
      ["a story", "a story"]
    ],

    run: [
      ["in the park", "in the park"],
      ["to school", "to school"]
    ],

    sleep: [
      ["well", "well"],
      ["at home", "at home"]
    ],

    speak: [
      ["English", "English"],
      ["to my teacher", "to my teacher"],
      ["to my friend", "to my friend"]
    ],

    take: [
      ["a taxi", "a taxi"],
      ["a photo", "a photo"],
      ["the bus", "the bus"]
    ],

    think: [
      ["about the problem", "about the problem"],
      ["about my trip", "about my trip"]
    ],

    wear: [
      ["a blue shirt", "a blue shirt"],
      ["a black jacket", "a black jacket"],
      ["new shoes", "new shoes"]
    ],

    win: [
      ["the game", "the game"],
      ["the match", "the match"]
    ],

    begin: [
      ["the lesson", "the lesson"],
      ["the game", "the game"],
      ["work", "work"]
    ],

    break: [
      ["the glass", "the glass"],
      ["the window", "the window"]
    ],

    bring: [
      ["some food", "some food"],
      ["a book", "a book"],
      ["my bag", "my bag"]
    ],

    build: [
      ["a house", "a house"],
      ["a small table", "a small table"]
    ],

    catch: [
      ["the bus", "the bus"],
      ["the train", "the train"]
    ],

    choose: [
      ["the blue shirt", "the blue shirt"],
      ["the red bag", "the red bag"]
    ],

    cut: [
      ["the paper", "the paper"],
      ["the cake", "the cake"]
    ],

    draw: [
      ["a picture", "a picture"],
      ["a house", "a house"]
    ],

    feel: [
      ["happy", "happy"],
      ["tired", "tired"],
      ["sick", "sick"]
    ],

    fly: [
      ["to London", "to London"],
      ["to Turkey", "to Turkey"]
    ],

    forget: [
      ["my keys", "my keys"],
      ["my phone", "my phone"]
    ],

    hear: [
      ["a noise", "a noise"],
      ["the music", "the music"]
    ],

    keep: [
      ["the book", "the book"],
      ["the money", "the money"]
    ],

    lose: [
      ["my keys", "my keys"],
      ["my phone", "my phone"],
      ["the game", "the game"]
    ],

    pay: [
      ["the bill", "the bill"],
      ["for the food", "for the food"]
    ],

    put: [
      ["the book on the table", "the book on the table"],
      ["the keys on the desk", "the keys on the desk"]
    ],

    sell: [
      ["my old car", "my old car"],
      ["my old phone", "my old phone"]
    ],

    sing: [
      ["a song", "a song"],
      ["at the party", "at the party"]
    ],

    stand: [
      ["near the door", "near the door"],
      ["at the bus stop", "at the bus stop"]
    ],

    swim: [
      ["in the pool", "in the pool"],
      ["at the beach", "at the beach"]
    ],

    teach: [
      ["English", "English"],
      ["the students", "the students"]
    ],

    understand: [
      ["the question", "the question"],
      ["the lesson", "the lesson"]
    ]
  };


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

  function chooseUnique(buildFn, used) {
    let item;

    for (let i = 0; i < 100; i++) {
      item = buildFn();

      if (!used.has(item.key)) {
        used.add(item.key);
        return item;
      }
    }

    return item;
  }

  function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function getContext(verb, irregular = false) {
    const data = irregular
      ? IRREGULAR_CONTEXTS[verb]
      : REGULAR_CONTEXTS[verb];

    if (!data || !data.length) {
      return ["English", "English"];
    }

    return pick(data);
  }

  function subjectForSentence() {
    return pick([
      "I",
      "You",
      "He",
      "She",
      "We",
      "They",
      "Tom",
      "Sara",
      "Ali",
      "Emma"
    ]);
  }

  function pastTime() {
    return pick(WAS_WERE_TIME);
  }

  function correctBe(subject) {
    const plural = [
      "You",
      "We",
      "They",
      "My parents",
      "The students"
    ];

    return plural.includes(subject) ? "were" : "was";
  }


  /* =========================================================
     WAS / WERE — LEVEL 1
  ========================================================= */

  function qWasWere() {

    const subjects = [
      "I",
      "You",
      "He",
      "She",
      "We",
      "They",
      "Tom",
      "Sara",
      "My parents",
      "The students"
    ];

    const subject = pick(subjects);
    const be = correctBe(subject);
    const time = pastTime();

    const sentenceTypes = [
      function () {
        const place = pick([
          "at home",
          "at school",
          "at work",
          "at the park",
          "at the gym",
          "at the cinema",
          "in the kitchen",
          "in the classroom"
        ]);

        return {
          prompt: subject + " ____ " + place + " " + time + ".",
          answer: be
        };
      },

      function () {
        const adjective = pick([
          "happy",
          "tired",
          "busy",
          "hungry",
          "late",
          "sick",
          "at home",
          "ready"
        ]);

        return {
          prompt: subject + " ____ " + adjective + " " + time + ".",
          answer: be
        };
      }
    ];

    const sentence = pick(sentenceTypes)();

    return {
      key: "ww1|" + sentence.prompt,

      type: "mc",

      hint: "Choose was or were.",

      prompt: sentence.prompt,

      choices: shuffle([
        sentence.answer,
        sentence.answer === "was" ? "were" : "was",
        sentence.answer === "was" ? "are" : "is"
      ]),

      answer: sentence.answer
    };
  }


  /* =========================================================
     WAS / WERE — LEVEL 2
     THERE WAS / THERE WERE
  ========================================================= */

  function qThereWasWere() {

    const singular = Math.random() < 0.5;

    if (singular) {

      const noun = pick([
        "a book",
        "a party",
        "a problem",
        "a message",
        "an email",
        "a meeting",
        "a student",
        "a car",
        "a dog"
      ]);

      const time = pick([
        "yesterday",
        "last night",
        "this morning",
        "last week",
        "an hour ago",
        "on Monday"
      ]);

      return {
        key: "ww2|" + noun + "|" + time,

        type: "mc",

        hint: "Choose There was or There were.",

        prompt: "____ " + noun + " " + time + ".",

        choices: shuffle([
          "There was",
          "There were",
          "There is"
        ]),

        answer: "There was"
      };

    } else {

      const noun = pick([
        "two books",
        "many people",
        "some problems",
        "three messages",
        "a lot of cars",
        "two students",
        "many children",
        "four chairs"
      ]);

      const place = pick([
        "at the park",
        "at school",
        "outside",
        "in the classroom",
        "at the party",
        "in the room"
      ]);

      const time = pick([
        "yesterday",
        "last night",
        "last weekend",
        "this morning",
        "last week"
      ]);

      return {
        key: "ww2|" + noun + "|" + place + "|" + time,

        type: "mc",

        hint: "Choose There was or There were.",

        prompt: "____ " + noun + " " + place + " " + time + ".",

        choices: shuffle([
          "There were",
          "There was",
          "There are"
        ]),

        answer: "There were"
      };
    }
  }


  /* =========================================================
     WAS / WERE — LEVEL 3
     COMPLETE WH QUESTIONS
  ========================================================= */

  function qWasWereWh() {

    const questions = [

      {
        prompt: "Where were you last night?",
        answer: "I was at home.",
        wrong: [
          "I were at home.",
          "I was home last night?"
        ]
      },

      {
        prompt: "Where was Sara yesterday?",
        answer: "She was at school.",
        wrong: [
          "She were at school.",
          "She was school yesterday?"
        ]
      },

      {
        prompt: "Why was Tom late yesterday?",
        answer: "He was late because of the bus.",
        wrong: [
          "He were late because of the bus.",
          "He was late because the bus?"
        ]
      },

      {
        prompt: "Where were your parents last weekend?",
        answer: "They were at home.",
        wrong: [
          "They was at home.",
          "They were home last weekend?"
        ]
      },

      {
        prompt: "When was your English class?",
        answer: "It was in the morning.",
        wrong: [
          "It were in the morning.",
          "It was morning class?"
        ]
      },

      {
        prompt: "Why were the students tired?",
        answer: "They were tired after the test.",
        wrong: [
          "They was tired after the test.",
          "They were tired because the test?"
        ]
      },

      {
        prompt: "Where was Ali this morning?",
        answer: "He was at work.",
        wrong: [
          "He were at work.",
          "He was work this morning?"
        ]
      },

      {
        prompt: "How was your weekend?",
        answer: "It was great.",
        wrong: [
          "It were great.",
          "It was weekend great?"
        ]
      },

      {
        prompt: "Where were you on Saturday?",
        answer: "I was at the park.",
        wrong: [
          "I were at the park.",
          "I was the park on Saturday?"
        ]
      },

      {
        prompt: "Why was Emma at home?",
        answer: "She was sick.",
        wrong: [
          "She were sick.",
          "She was sick at home?"
        ]
      },

      {
        prompt: "When were they at the cinema?",
        answer: "They were there last night.",
        wrong: [
          "They was there last night.",
          "They were cinema last night?"
        ]
      },

      {
        prompt: "Where was your brother yesterday?",
        answer: "He was at school.",
        wrong: [
          "He were at school.",
          "He was school yesterday?"
        ]
      }

    ];

    const q = pick(questions);

    return {
      key: "ww3|" + q.prompt,

      type: "mc",

      hint: "Choose the correct answer.",

      prompt: q.prompt,

      choices: shuffle([
        q.answer,
        ...q.wrong
      ]),

      answer: q.answer
    };
  }


  /* =========================================================
     REGULAR VERBS — LEVEL 1
     COMPLETE A1 SENTENCES
  ========================================================= */

  function qRegLevel1() {

    const [base, past] = pick(REGULAR);
    const context = getContext(base);

    const subject = subjectForSentence();
    const time = pick([
      "yesterday",
      "last night",
      "last week",
      "last weekend",
      "this morning",
      "on Monday",
      "two days ago"
    ]);

    const object = context[0];

    const form = pick([
      "positive",
      "negative",
      "question"
    ]);

    if (form === "positive") {

      const prompt =
        subject +
        " ____ " +
        object +
        " " +
        time +
        ".";

      return {
        key: "reg1|" + prompt,

        type: "mc",

        hint: "Choose the correct past form.",

        prompt,

        choices: shuffle([
          past,
          base,
          base + "ed"
        ]),

        answer: past
      };
    }

    if (form === "negative") {

      const prompt =
        subject +
        " ____ " +
        object +
        " " +
        time +
        ".";

      return {
        key: "reg1|" + prompt,

        type: "mc",

        hint: "Choose the correct negative form.",

        prompt,

        choices: shuffle([
          "didn't " + base,
          "didn't " + past,
          "doesn't " + base
        ]),

        answer: "didn't " + base
      };
    }

    const questionSubject = pick([
      "you",
      "he",
      "she",
      "they"
    ]);

    const prompt =
      "____ " +
      questionSubject +
      " " +
      base +
      " " +
      object +
      " " +
      time +
      "?";

    return {
      key: "reg1|" + prompt,

      type: "mc",

      hint: "Choose the correct question form.",

      prompt,

      choices: shuffle([
        "Did",
        "Do",
        "Does"
      ]).map(function (x) {
        return x + " " + questionSubject + " " + base + " " + object + " " + time + "?";
      }),

      answer:
        "Did " +
        questionSubject +
        " " +
        base +
        " " +
        object +
        " " +
        time +
        "?"
    };
  }


  /* =========================================================
     REGULAR VERBS — LEVEL 2
     COMPLETE WH QUESTIONS
  ========================================================= */

  function qRegWh() {

    const questions = [

      {
        prompt: "Where did you work last week?",
        answer: "I worked at the office.",
        wrong: [
          "I work at the office last week.",
          "I did worked at the office."
        ]
      },

      {
        prompt: "When did Sara call her mother?",
        answer: "She called her mother last night.",
        wrong: [
          "She call her mother last night.",
          "She did called her mother last night."
        ]
      },

      {
        prompt: "What did you watch yesterday?",
        answer: "I watched a movie.",
        wrong: [
          "I watch a movie yesterday.",
          "I did watched a movie."
        ]
      },

      {
        prompt: "Where did they stay last weekend?",
        answer: "They stayed at a hotel.",
        wrong: [
          "They stay at a hotel last weekend.",
          "They did stayed at a hotel."
        ]
      },

      {
        prompt: "When did he start work?",
        answer: "He started work at nine.",
        wrong: [
          "He start work at nine.",
          "He did started work at nine."
        ]
      },

      {
        prompt: "Why did Emma study English?",
        answer: "She studied for the test.",
        wrong: [
          "She study for the test.",
          "She did studied for the test."
        ]
      },

      {
        prompt: "Where did Ali live last year?",
        answer: "He lived in Baku.",
        wrong: [
          "He live in Baku last year.",
          "He did lived in Baku."
        ]
      },

      {
        prompt: "What did you cook last night?",
        answer: "I cooked dinner.",
        wrong: [
          "I cook dinner last night.",
          "I did cooked dinner."
        ]
      },

      {
        prompt: "Who did you invite to the party?",
        answer: "I invited my friends.",
        wrong: [
          "I invite my friends.",
          "I did invited my friends."
        ]
      },

      {
        prompt: "Where did she walk yesterday?",
        answer: "She walked in the park.",
        wrong: [
          "She walk in the park yesterday.",
          "She did walked in the park."
        ]
      },

      {
        prompt: "When did they arrive?",
        answer: "They arrived in the morning.",
        wrong: [
          "They arrive in the morning.",
          "They did arrived in the morning."
        ]
      },

      {
        prompt: "What did he clean this morning?",
        answer: "He cleaned his room.",
        wrong: [
          "He clean his room.",
          "He did cleaned his room."
        ]
      }

    ];

    const q = pick(questions);

    return {
      key: "reg2|" + q.prompt,

      type: "mc",

      hint: "Choose the correct answer.",

      prompt: q.prompt,

      choices: shuffle([
        q.answer,
        ...q.wrong
      ]),

      answer: q.answer
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
      Math.floor(Math.random() * groups.length);

    let oddIdx =
      (mainIdx + 1 + Math.floor(Math.random() * 2)) %
      groups.length;

    const main =
      shuffle(groups[mainIdx].list).slice(0, 3);

    const odd =
      pick(groups[oddIdx].list);

    const options =
      shuffle(main.concat([odd]));

    return {
      key: "sound|" + options.slice().sort().join("|"),

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

    const pool =
      IRREGULAR.filter(function (x) {
        return x[0] !== "be";
      });

    const [base, past] =
      pick(pool);

    const context =
      getContext(base, true);

    const subject =
      subjectForSentence();

    const object =
      context[0];

    const time =
      pick([
        "yesterday",
        "last night",
        "last weekend",
        "this morning",
        "last week",
        "two days ago"
      ]);

    const form =
      pick([
        "positive",
        "negative",
        "question"
      ]);

    if (form === "positive") {

      const prompt =
        subject +
        " ____ " +
        object +
        " " +
        time +
        ".";

      return {
        key: "irr1|" + prompt,

        type: "mc",

        hint: "Choose the correct past form.",

        prompt,

        choices: shuffle([
          past,
          base,
          base + "ed"
        ]),

        answer: past
      };
    }

    if (form === "negative") {

      const prompt =
        subject +
        " ____ " +
        object +
        " " +
        time +
        ".";

      return {
        key: "irr1|" + prompt,

        type: "mc",

        hint: "Choose the correct negative form.",

        prompt,

        choices: shuffle([
          "didn't " + base,
          "didn't " + past,
          "doesn't " + base
        ]),

        answer: "didn't " + base
      };
    }

    const questionSubject =
      pick([
        "you",
        "he",
        "she",
        "they"
      ]);

    const prompt =
      "____ " +
      questionSubject +
      " " +
      base +
      " " +
      object +
      " " +
      time +
      "?";

    const correct =
      "Did " +
      questionSubject +
      " " +
      base +
      " " +
      object +
      " " +
      time +
      "?";

    return {
      key: "irr1|" + prompt,

      type: "mc",

      hint: "Choose the correct question form.",

      prompt,

      choices: shuffle([
        correct,

        "Do " +
          questionSubject +
          " " +
          base +
          " " +
          object +
          " " +
          time +
          "?",

        "Did " +
          questionSubject +
          " " +
          past +
          " " +
          object +
          " " +
          time +
          "?"
      ]),

      answer: correct
    };
  }


  /* =========================================================
     IRREGULAR VERBS — LEVEL 2
     COMPLETE WH QUESTIONS
  ========================================================= */

  function qIrrWh() {

    const questions = [

      {
        prompt: "Where did you go yesterday?",
        answer: "I went to the park.",
        wrong: [
          "I go to the park yesterday.",
          "I did went to the park."
        ]
      },

      {
        prompt: "What did Sara eat for lunch?",
        answer: "She ate pizza.",
        wrong: [
          "She eat pizza.",
          "She did ate pizza."
        ]
      },

      {
        prompt: "When did Ali get home?",
        answer: "He got home at six.",
        wrong: [
          "He get home at six.",
          "He did got home at six."
        ]
      },

      {
        prompt: "Where did they buy the tickets?",
        answer: "They bought them online.",
        wrong: [
          "They buy them online.",
          "They did bought them online."
        ]
      },

      {
        prompt: "What did you have for breakfast?",
        answer: "I had eggs and bread.",
        wrong: [
          "I have eggs and bread.",
          "I did had eggs and bread."
        ]
      },

      {
        prompt: "Who did you meet yesterday?",
        answer: "I met my friend.",
        wrong: [
          "I meet my friend yesterday.",
          "I did met my friend."
        ]
      },

      {
        prompt: "What did Emma write?",
        answer: "She wrote an email.",
        wrong: [
          "She write an email.",
          "She did wrote an email."
        ]
      },

      {
        prompt: "Where did he drive last night?",
        answer: "He drove home.",
        wrong: [
          "He drive home.",
          "He did drove home."
        ]
      },

      {
        prompt: "What did they see at the cinema?",
        answer: "They saw a movie.",
        wrong: [
          "They see a movie.",
          "They did saw a movie."
        ]
      },

      {
        prompt: "Why did she leave early?",
        answer: "She left because she was tired.",
        wrong: [
          "She leave because she was tired.",
          "She did left because she was tired."
        ]
      },

      {
        prompt: "What did you drink this morning?",
        answer: "I drank coffee.",
        wrong: [
          "I drink coffee this morning.",
          "I did drank coffee."
        ]
      },

      {
        prompt: "Where did Tom sleep last night?",
        answer: "He slept at home.",
        wrong: [
          "He sleep at home.",
          "He did slept at home."
        ]
      },

      {
        prompt: "What did she buy last weekend?",
        answer: "She bought a new shirt.",
        wrong: [
          "She buy a new shirt.",
          "She did bought a new shirt."
        ]
      },

      {
        prompt: "Who did they speak to?",
        answer: "They spoke to the teacher.",
        wrong: [
          "They speak to the teacher.",
          "They did spoke to the teacher."
        ]
      },

      {
        prompt: "What did he take to school?",
        answer: "He took his bag.",
        wrong: [
          "He take his bag.",
          "He did took his bag."
        ]
      }

    ];

    const q = pick(questions);

    return {
      key: "irr2|" + q.prompt,

      type: "mc",

      hint: "Choose the correct answer.",

      prompt: q.prompt,

      choices: shuffle([
        q.answer,
        ...q.wrong
      ]),

      answer: q.answer
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
      (window.innerWidth <= 700 ||
       window.innerHeight <= 700)
        ? 3
        : 4;

    const pairs =
      shuffle(pool).slice(0, count);

    return {
      type: "match",

      hint: "Tap a base form, then its past form.",

      prompt: "Match base → past.",

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
     UI ELEMENTS
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


  /* =========================================================
     GAME STATE
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
     START NORMAL MODE
  ========================================================= */

  function startMode(key) {

    modeKey = key;

    if (key === "irr-match") {
      startMatchRush();
      return;
    }

    const mode = MODES[key];

    queue = [];

    const used = new Set();

    for (let i = 0; i < TOTAL; i++) {

      const item =
        chooseUnique(mode.build, used);

      queue.push(item);
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

      choicesArea.appendChild(btn);
    });
  }


  /* =========================================================
     NORMAL ANSWER
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


    matchLeft.innerHTML = "";

    matchRight.innerHTML = "";


    lefts.forEach(
      function (word) {

        const b =
          document.createElement(
            "button"
          );

        b.type = "button";

        b.className =
          "match-chip word";

        b.textContent =
          word;

        b.dataset.side =
          "left";

        b.dataset.val =
          word;

        b.addEventListener(
          "click",
          function () {
            onMatchPick(b);
          }
        );

        matchLeft.appendChild(b);
      }
    );


    rights.forEach(
      function (word) {

        const b =
          document.createElement(
            "button"
          );

        b.type = "button";

        b.className =
          "match-chip word";

        b.textContent =
          word;

        b.dataset.side =
          "right";

        b.dataset.val =
          word;

        b.addEventListener(
          "click",
          function () {
            onMatchPick(b);
          }
        );

        matchRight.appendChild(b);
      }
    );
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

    const b =
      document.createElement(
        "button"
      );

    b.type = "button";

    b.className =
      "match-chip word";

    b.textContent =
      word;

    b.dataset.side =
      side;

    b.dataset.val =
      word;


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
        leftChips.map(
          function (c) {
            return c.dataset.val;
          }
        )
      );


    const rightVals =
      shuffle(
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
      document.documentElement
        .getAttribute(
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
