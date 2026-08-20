/* =========================================================
   SIMPLE PAST — MR. SHEYHAKI LEARNING ARCADE

   Was / Were
   There was / There were
   Was / Were Wh- Questions

   Regular Verbs
   Regular Wh- Questions
   -ed Pronunciation

   Irregular Verbs
   Irregular Wh- Questions
   Match Rush
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
     -ED PRONUNCIATION DATA
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

  function uniqueRandomItems(arr, count) {
    return shuffle(arr).slice(0, count);
  }


  /* =========================================================
     WAS / WERE — LEVEL 1
     ========================================================= */

  const WAS_WERE_QUESTIONS = [

    {
      prompt: "I ____ at home last night.",
      answer: "was"
    },

    {
      prompt: "She ____ at the library on Saturday.",
      answer: "was"
    },

    {
      prompt: "We ____ at the restaurant on Friday evening.",
      answer: "were"
    },

    {
      prompt: "They ____ very tired after the trip.",
      answer: "were"
    },

    {
      prompt: "He ____ at work this morning.",
      answer: "was"
    },

    {
      prompt: "You ____ late for class on Monday.",
      answer: "were"
    },

    {
      prompt: "My parents ____ at the hotel last weekend.",
      answer: "were"
    },

    {
      prompt: "The children ____ in the garden after school.",
      answer: "were"
    },

    {
      prompt: "Sara ____ in the kitchen before dinner.",
      answer: "was"
    },

    {
      prompt: "Tom ____ sick last month.",
      answer: "was"
    },

    {
      prompt: "We ____ at the beach during our holiday.",
      answer: "were"
    },

    {
      prompt: "The students ____ in the classroom after lunch.",
      answer: "were"
    },

    {
      prompt: "It ____ very cold on Sunday morning.",
      answer: "was"
    },

    {
      prompt: "I ____ busy yesterday afternoon.",
      answer: "was"
    },

    {
      prompt: "You ____ very happy at the party.",
      answer: "were"
    },

    {
      prompt: "My brother ____ at the gym last night.",
      answer: "was"
    },

    {
      prompt: "The shops ____ closed on Friday.",
      answer: "were"
    },

    {
      prompt: "She ____ at the cinema with her friends.",
      answer: "was"
    },

    {
      prompt: "We ____ in the living room after dinner.",
      answer: "were"
    },

    {
      prompt: "The hotel ____ very quiet at night.",
      answer: "was"
    }
  ];

  function qWasWere() {
    const item = pick(WAS_WERE_QUESTIONS);

    return {
      type: "mc",
      hint: "Choose was or were",
      prompt: item.prompt,
      choices: shuffle([
        "was",
        "were",
        "is"
      ]),
      answer: item.answer
    };
  }


  /* =========================================================
     THERE WAS / THERE WERE — LEVEL 2

     Hotel / house / apartment vocabulary
     ========================================================= */

  const THERE_WAS_WERE_QUESTIONS = [

    {
      prompt: "____ a large bed in the hotel room.",
      answer: "There was"
    },

    {
      prompt: "____ two chairs next to the window.",
      answer: "There were"
    },

    {
      prompt: "____ a TV on the wall in the bedroom.",
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
      prompt: "____ some cups in the kitchen cupboard.",
      answer: "There were"
    },

    {
      prompt: "____ a lamp next to the bed.",
      answer: "There was"
    },

    {
      prompt: "____ two pictures on the living room wall.",
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
      prompt: "____ a balcony outside the bedroom.",
      answer: "There was"
    },

    {
      prompt: "____ five rooms in the house.",
      answer: "There were"
    },

    {
      prompt: "____ a mirror above the bathroom sink.",
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
      prompt: "____ many guests in the hotel lobby.",
      answer: "There were"
    },

    {
      prompt: "____ a small table beside the sofa.",
      answer: "There was"
    },

    {
      prompt: "____ two lamps in the bedroom.",
      answer: "There were"
    },

    {
      prompt: "____ a washing machine in the apartment.",
      answer: "There was"
    },

    {
      prompt: "____ some plants near the window.",
      answer: "There were"
    },

    {
      prompt: "____ a carpet on the floor.",
      answer: "There was"
    },

    {
      prompt: "____ two armchairs in the living room.",
      answer: "There were"
    },

    {
      prompt: "____ a microwave in the kitchen.",
      answer: "There was"
    },

    {
      prompt: "____ some plates on the table.",
      answer: "There were"
    },

    {
      prompt: "____ a small garden behind the house.",
      answer: "There was"
    },

    {
      prompt: "____ three bedrooms upstairs.",
      answer: "There were"
    }
  ];

  function qThereWasWere() {
    const item = pick(THERE_WAS_WERE_QUESTIONS);

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

  const WAS_WERE_WH = [

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
      prompt: "Why ____ he at school on Monday morning?",
      choices: [
        "Why was he at school on Monday morning?",
        "Why were he at school on Monday morning?",
        "Why is he at school on Monday morning?"
      ],
      answer: "Why was he at school on Monday morning?"
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
      prompt: "Why ____ you at the hotel last weekend?",
      choices: [
        "Why were you at the hotel last weekend?",
        "Why was you at the hotel last weekend?",
        "Why are you at the hotel last weekend?"
      ],
      answer: "Why were you at the hotel last weekend?"
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
    },

    {
      prompt: "Where ____ your sister on Sunday afternoon?",
      choices: [
        "Where was your sister on Sunday afternoon?",
        "Where were your sister on Sunday afternoon?",
        "Where is your sister on Sunday afternoon?"
      ],
      answer: "Where was your sister on Sunday afternoon?"
    },

    {
      prompt: "Why ____ the children in the garden?",
      choices: [
        "Why were the children in the garden?",
        "Why was the children in the garden?",
        "Why are the children in the garden?"
      ],
      answer: "Why were the children in the garden?"
    },

    {
      prompt: "When ____ you at the restaurant?",
      choices: [
        "When were you at the restaurant?",
        "When was you at the restaurant?",
        "When are you at the restaurant?"
      ],
      answer: "When were you at the restaurant?"
    }
  ];

  function qWasWereWh() {
    const item = pick(WAS_WERE_WH);

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

     Natural sentence bank.
     No random verb + random sentence combinations.
     ========================================================= */

  const REGULAR_LEVEL_1 = [

    {
      prompt: "I ____ my friend after work. (call)",
      choices: [
        "called",
        "call",
        "calls"
      ],
      answer: "called"
    },

    {
      prompt: "She ____ her room on Saturday. (clean)",
      choices: [
        "cleaned",
        "clean",
        "cleans"
      ],
      answer: "cleaned"
    },

    {
      prompt: "We ____ dinner at home last night. (cook)",
      choices: [
        "cooked",
        "cook",
        "cooks"
      ],
      answer: "cooked"
    },

    {
      prompt: "They ____ at the hotel at 6 p.m. (arrive)",
      choices: [
        "arrived",
        "arrive",
        "arrives"
      ],
      answer: "arrived"
    },

    {
      prompt: "He ____ the hotel room on Monday. (book)",
      choices: [
        "booked",
        "book",
        "books"
      ],
      answer: "booked"
    },

    {
      prompt: "I ____ English for two hours last night. (study)",
      choices: [
        "studied",
        "study",
        "studies"
      ],
      answer: "studied"
    },

    {
      prompt: "She ____ the window before dinner. (close)",
      choices: [
        "closed",
        "close",
        "closes"
      ],
      answer: "closed"
    },

    {
      prompt: "We ____ football after school. (play)",
      choices: [
        "played",
        "play",
        "plays"
      ],
      answer: "played"
    },

    {
      prompt: "They ____ in a small apartment last year. (live)",
      choices: [
        "lived",
        "live",
        "lives"
      ],
      answer: "lived"
    },

    {
      prompt: "He ____ the car in front of the house. (park)",
      choices: [
        "parked",
        "park",
        "parks"
      ],
      answer: "parked"
    },

    {
      prompt: "I ____ the new restaurant last weekend. (like)",
      choices: [
        "liked",
        "like",
        "likes"
      ],
      answer: "liked"
    },

    {
      prompt: "She ____ for the bus after work. (wait)",
      choices: [
        "waited",
        "wait",
        "waits"
      ],
      answer: "waited"
    },

    {
      prompt: "We ____ the kitchen in the morning. (paint)",
      choices: [
        "painted",
        "paint",
        "paints"
      ],
      answer: "painted"
    },

    {
      prompt: "They ____ at home after the trip. (relax)",
      choices: [
        "relaxed",
        "relax",
        "relaxes"
      ],
      answer: "relaxed"
    },

    {
      prompt: "He ____ the door at 9 p.m. (open)",
      choices: [
        "opened",
        "open",
        "opens"
      ],
      answer: "opened"
    },

    {
      prompt: "I ____ my suitcase before the holiday. (pack)",
      choices: [
        "packed",
        "pack",
        "packs"
      ],
      answer: "packed"
    },

    {
      prompt: "She ____ her mother last night. (help)",
      choices: [
        "helped",
        "help",
        "helps"
      ],
      answer: "helped"
    },

    {
      prompt: "We ____ at the hotel for three nights. (stay)",
      choices: [
        "stayed",
        "stay",
        "stays"
      ],
      answer: "stayed"
    },

    {
      prompt: "They ____ the movie at 10 p.m. (finish)",
      choices: [
        "finished",
        "finish",
        "finishes"
      ],
      answer: "finished"
    },

    {
      prompt: "He ____ his car before the trip. (wash)",
      choices: [
        "washed",
        "wash",
        "washes"
      ],
      answer: "washed"
    }
  ];

  function qRegLevel1() {
    const item = pick(REGULAR_LEVEL_1);

    return {
      type: "mc",
      hint: "Choose the correct past form",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  /* =========================================================
     REGULAR VERBS — LEVEL 2
     POSITIVE / NEGATIVE / QUESTIONS
     ========================================================= */

  const REGULAR_LEVEL_2 = [

    {
      prompt: "I ____ my room yesterday afternoon. (clean)",
      choices: [
        "cleaned",
        "didn't clean",
        "clean"
      ],
      answer: "cleaned"
    },

    {
      prompt: "She ____ TV last night. (watch)",
      choices: [
        "didn't watch",
        "didn't watched",
        "doesn't watch"
      ],
      answer: "didn't watch"
    },

    {
      prompt: "____ you ____ your homework last night? (finish)",
      choices: [
        "Did / finish",
        "Did / finished",
        "Do / finish"
      ],
      answer: "Did / finish"
    },

    {
      prompt: "They ____ at the hotel last weekend. (stay)",
      choices: [
        "stayed",
        "stay",
        "stays"
      ],
      answer: "stayed"
    },

    {
      prompt: "He ____ the window because it was cold. (open)",
      choices: [
        "didn't open",
        "didn't opened",
        "doesn't open"
      ],
      answer: "didn't open"
    },

    {
      prompt: "____ she ____ the room yesterday? (clean)",
      choices: [
        "Did / clean",
        "Did / cleaned",
        "Does / clean"
      ],
      answer: "Did / clean"
    },

    {
      prompt: "We ____ dinner at home on Friday. (cook)",
      choices: [
        "cooked",
        "cook",
        "cooks"
      ],
      answer: "cooked"
    },

    {
      prompt: "I ____ the new movie last weekend. (like)",
      choices: [
        "didn't like",
        "didn't liked",
        "don't like"
      ],
      answer: "didn't like"
    },

    {
      prompt: "____ they ____ the car on Saturday? (wash)",
      choices: [
        "Did / wash",
        "Did / washed",
        "Do / wash"
      ],
      answer: "Did / wash"
    },

    {
      prompt: "She ____ her suitcase before the trip. (pack)",
      choices: [
        "packed",
        "pack",
        "packs"
      ],
      answer: "packed"
    },

    {
      prompt: "He ____ to music after work. (listen)",
      choices: [
        "listened",
        "listen",
        "listens"
      ],
      answer: "listened"
    },

    {
      prompt: "We ____ the restaurant last night. (book)",
      choices: [
        "didn't book",
        "didn't booked",
        "don't book"
      ],
      answer: "didn't book"
    },

    {
      prompt: "____ you ____ your friend yesterday? (call)",
      choices: [
        "Did / call",
        "Did / called",
        "Do / call"
      ],
      answer: "Did / call"
    },

    {
      prompt: "They ____ the house last month. (paint)",
      choices: [
        "painted",
        "paint",
        "paints"
      ],
      answer: "painted"
    },

    {
      prompt: "She ____ the door after dinner. (close)",
      choices: [
        "didn't close",
        "didn't closed",
        "doesn't close"
      ],
      answer: "didn't close"
    }
  ];

  function qRegLevel2() {
    const item = pick(REGULAR_LEVEL_2);

    return {
      type: "mc",
      hint: "Choose the correct simple past sentence",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  /* =========================================================
     REGULAR VERBS — WH QUESTIONS
     FULL SENTENCES
     ========================================================= */

  const REGULAR_WH = [

    {
      prompt: "Where did you ____ after work? (stay)",
      choices: [
        "Where did you stay after work?",
        "Where did you stayed after work?",
        "Where do you stay after work?"
      ],
      answer: "Where did you stay after work?"
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
      prompt: "Where did you ____ last weekend? (stay)",
      choices: [
        "Where did you stay last weekend?",
        "Where did you stayed last weekend?",
        "Where do you stay last weekend?"
      ],
      answer: "Where did you stay last weekend?"
    },

    {
      prompt: "When did she ____ the hotel room? (book)",
      choices: [
        "When did she book the hotel room?",
        "When did she booked the hotel room?",
        "When does she book the hotel room?"
      ],
      answer: "When did she book the hotel room?"
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
    },

    {
      prompt: "When did you ____ your friend? (call)",
      choices: [
        "When did you call your friend?",
        "When did you called your friend?",
        "When do you call your friend?"
      ],
      answer: "When did you call your friend?"
    },

    {
      prompt: "Why did she ____ the kitchen? (clean)",
      choices: [
        "Why did she clean the kitchen?",
        "Why did she cleaned the kitchen?",
        "Why does she clean the kitchen?"
      ],
      answer: "Why did she clean the kitchen?"
    },

    {
      prompt: "Where did they ____ for their holiday? (travel)",
      choices: [
        "Where did they travel for their holiday?",
        "Where did they traveled for their holiday?",
        "Where do they travel for their holiday?"
      ],
      answer: "Where did they travel for their holiday?"
    },

    {
      prompt: "When did he ____ the car? (wash)",
      choices: [
        "When did he wash the car?",
        "When did he washed the car?",
        "When does he wash the car?"
      ],
      answer: "When did he wash the car?"
    },

    {
      prompt: "Why did you ____ your suitcase? (pack)",
      choices: [
        "Why did you pack your suitcase?",
        "Why did you packed your suitcase?",
        "Why do you pack your suitcase?"
      ],
      answer: "Why did you pack your suitcase?"
    },

    {
      prompt: "Where did she ____ after the class? (work)",
      choices: [
        "Where did she work after the class?",
        "Where did she worked after the class?",
        "Where does she work after the class?"
      ],
      answer: "Where did she work after the class?"
    }
  ];

  function qRegWh() {
    const item = pick(REGULAR_WH);

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  /* =========================================================
     REGULAR VERBS — -ED PRONUNCIATION
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
      uniqueRandomItems(
        groups[mainIdx].list,
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
      hint: "Which past form has a different -ed sound?",
      prompt: "Find the word with the different pronunciation.",
      choices: options,
      answer: odd
    };
  }


  /* =========================================================
     IRREGULAR VERBS — LEVEL 1
     ========================================================= */

  const IRREGULAR_LEVEL_1 = [

    {
      prompt: "I ____ a new phone last month. (buy)",
      choices: [
        "bought",
        "buy",
        "buyed"
      ],
      answer: "bought"
    },

    {
      prompt: "She ____ breakfast at 8 a.m. (eat)",
      choices: [
        "ate",
        "eat",
        "eated"
      ],
      answer: "ate"
    },

    {
      prompt: "We ____ to the beach last weekend. (go)",
      choices: [
        "went",
        "go",
        "goed"
      ],
      answer: "went"
    },

    {
      prompt: "He ____ a new job last year. (get)",
      choices: [
        "got",
        "get",
        "getted"
      ],
      answer: "got"
    },

    {
      prompt: "They ____ home after dinner. (come)",
      choices: [
        "came",
        "come",
        "comed"
      ],
      answer: "came"
    },

    {
      prompt: "I ____ my keys on the table. (put)",
      choices: [
        "put",
        "putted",
        "puts"
      ],
      answer: "put"
    },

    {
      prompt: "She ____ her friend at the café. (meet)",
      choices: [
        "met",
        "meet",
        "meeted"
      ],
      answer: "met"
    },

    {
      prompt: "We ____ a movie after dinner. (see)",
      choices: [
        "saw",
        "see",
        "seed"
      ],
      answer: "saw"
    },

    {
      prompt: "He ____ a sandwich for lunch. (have)",
      choices: [
        "had",
        "have",
        "haved"
      ],
      answer: "had"
    },

    {
      prompt: "They ____ home early on Sunday. (leave)",
      choices: [
        "left",
        "leave",
        "leaved"
      ],
      answer: "left"
    },

    {
      prompt: "I ____ a letter to my friend. (write)",
      choices: [
        "wrote",
        "write",
        "writed"
      ],
      answer: "wrote"
    },

    {
      prompt: "She ____ a lot of water after the run. (drink)",
      choices: [
        "drank",
        "drink",
        "drinked"
      ],
      answer: "drank"
    },

    {
      prompt: "We ____ in a hotel near the beach. (sleep)",
      choices: [
        "slept",
        "sleep",
        "sleeped"
      ],
      answer: "slept"
    },

    {
      prompt: "He ____ his homework before dinner. (do)",
      choices: [
        "did",
        "do",
        "doed"
      ],
      answer: "did"
    },

    {
      prompt: "They ____ a taxi to the airport. (take)",
      choices: [
        "took",
        "take",
        "taked"
      ],
      answer: "took"
    }
  ];

  function qIrrLevel1() {
    const item = pick(IRREGULAR_LEVEL_1);

    return {
      type: "mc",
      hint: "Choose the correct past form",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  /* =========================================================
     IRREGULAR VERBS — LEVEL 2
     POSITIVE / NEGATIVE / QUESTIONS
     ========================================================= */

  const IRREGULAR_LEVEL_2 = [

    {
      prompt: "I ____ to the supermarket yesterday. (go)",
      choices: [
        "went",
        "go",
        "goed"
      ],
      answer: "went"
    },

    {
      prompt: "She ____ breakfast at home. (eat)",
      choices: [
        "didn't eat",
        "didn't ate",
        "doesn't eat"
      ],
      answer: "didn't eat"
    },

    {
      prompt: "____ you ____ your friend last weekend? (see)",
      choices: [
        "Did / see",
        "Did / saw",
        "Do / see"
      ],
      answer: "Did / see"
    },

    {
      prompt: "They ____ a taxi to the hotel. (take)",
      choices: [
        "took",
        "take",
        "taked"
      ],
      answer: "took"
    },

    {
      prompt: "He ____ his keys at home. (leave)",
      choices: [
        "didn't leave",
        "didn't left",
        "doesn't leave"
      ],
      answer: "didn't leave"
    },

    {
      prompt: "____ she ____ a new dress last week? (buy)",
      choices: [
        "Did / buy",
        "Did / bought",
        "Does / buy"
      ],
      answer: "Did / buy"
    },

    {
      prompt: "We ____ lunch at a small restaurant. (have)",
      choices: [
        "had",
        "have",
        "haved"
      ],
      answer: "had"
    },

    {
      prompt: "I ____ the answer to the question. (know)",
      choices: [
        "didn't know",
        "didn't knew",
        "don't know"
      ],
      answer: "didn't know"
    },

    {
      prompt: "____ they ____ home late? (come)",
      choices: [
        "Did / come",
        "Did / came",
        "Do / come"
      ],
      answer: "Did / come"
    },

    {
      prompt: "She ____ a letter to her friend. (write)",
      choices: [
        "wrote",
        "write",
        "writed"
      ],
      answer: "wrote"
    },

    {
      prompt: "He ____ the movie last night. (see)",
      choices: [
        "didn't see",
        "didn't saw",
        "doesn't see"
      ],
      answer: "didn't see"
    },

    {
      prompt: "____ you ____ the bus this morning? (take)",
      choices: [
        "Did / take",
        "Did / took",
        "Do / take"
      ],
      answer: "Did / take"
    },

    {
      prompt: "They ____ a lot of photos on holiday. (take)",
      choices: [
        "took",
        "take",
        "taked"
      ],
      answer: "took"
    },

    {
      prompt: "I ____ any coffee this morning. (drink)",
      choices: [
        "didn't drink",
        "didn't drank",
        "don't drink"
      ],
      answer: "didn't drink"
    },

    {
      prompt: "____ he ____ home early? (leave)",
      choices: [
        "Did / leave",
        "Did / left",
        "Does / leave"
      ],
      answer: "Did / leave"
    }
  ];

  function qIrrLevel2() {
    const item = pick(IRREGULAR_LEVEL_2);

    return {
      type: "mc",
      hint: "Choose the correct simple past sentence",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  /* =========================================================
     IRREGULAR VERBS — WH QUESTIONS
     FULL SENTENCES
     ========================================================= */

  const IRREGULAR_WH = [

    {
      prompt: "Where did you ____ last weekend? (go)",
      choices: [
        "Where did you go last weekend?",
        "Where did you went last weekend?",
        "Where do you go last weekend?"
      ],
      answer: "Where did you go last weekend?"
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
      prompt: "Where did they ____ during their holiday? (sleep)",
      choices: [
        "Where did they sleep during their holiday?",
        "Where did they slept during their holiday?",
        "Where do they sleep during their holiday?"
      ],
      answer: "Where did they sleep during their holiday?"
    },

    {
      prompt: "What did she ____ for dinner? (make)",
      choices: [
        "What did she make for dinner?",
        "What did she made for dinner?",
        "What does she make for dinner?"
      ],
      answer: "What did she make for dinner?"
    },

    {
      prompt: "When did he ____ the bus? (take)",
      choices: [
        "When did he take the bus?",
        "When did he took the bus?",
        "When does he take the bus?"
      ],
      answer: "When did he take the bus?"
    },

    {
      prompt: "Who did you ____ at the party? (meet)",
      choices: [
        "Who did you meet at the party?",
        "Who did you met at the party?",
        "Who do you meet at the party?"
      ],
      answer: "Who did you meet at the party?"
    },

    {
      prompt: "What did they ____ from the hotel? (take)",
      choices: [
        "What did they take from the hotel?",
        "What did they took from the hotel?",
        "What do they take from the hotel?"
      ],
      answer: "What did they take from the hotel?"
    },

    {
      prompt: "Why did he ____ the restaurant early? (leave)",
      choices: [
        "Why did he leave the restaurant early?",
        "Why did he left the restaurant early?",
        "Why does he leave the restaurant early?"
      ],
      answer: "Why did he leave the restaurant early?"
    },

    {
      prompt: "Where did she ____ her phone? (put)",
      choices: [
        "Where did she put her phone?",
        "Where did she putted her phone?",
        "Where does she put her phone?"
      ],
      answer: "Where did she put her phone?"
    }
  ];

  function qIrrWh() {
    const item = pick(IRREGULAR_WH);

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  /* =========================================================
     IRREGULAR VERBS — MATCHING ROUND
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
      shuffle(pool).slice(0, count);

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
      label: "Regular · Level 2",
      build: qRegLevel2
    },

    "reg-sound": {
      label: "Regular · -ed pronunciation",
      build: qRegSound
    },

    irr1: {
      label: "Irregular · Level 1",
      build: qIrrLevel1
    },

    irr2: {
      label: "Irregular · Level 2",
      build: qIrrLevel2
    },

    "irr-match": {
      label: "Irregular · Matching",
      build: qIrrMatch
    }

  };


  /* =========================================================
     UI REFERENCES
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

    queue = [];

    /*
      Generate questions and try to avoid
      immediate duplicates.
    */

    let attempts = 0;

    while (
      queue.length < TOTAL &&
      attempts < 100
    ) {

      const question =
        mode.build();

      const duplicate =
        queue.some(function (q) {
          return (
            q.prompt ===
            question.prompt
          );
        });

      if (!duplicate) {
        queue.push(question);
      }

      attempts++;
    }

    /*
      Safety fallback.
    */

    while (queue.length < TOTAL) {
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

    feedbackEl.className =
      "feedback";

    const item =
      queue[index];

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


  /* =========================================================
     MULTIPLE CHOICE ANSWER
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
      .querySelectorAll(
        ".choice-btn"
      )
      .forEach(
        function (button) {

          button.disabled = true;

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
     NORMAL MATCHING
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
          function (pair) {
            return pair.left;
          }
        )
      );

    const rights =
      shuffle(
        item.pairs.map(
          function (pair) {
            return pair.right;
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

        const button =
          document.createElement(
            "button"
          );

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
      }
    );

    rights.forEach(
      function (word) {

        const button =
          document.createElement(
            "button"
          );

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
        function (button) {

          if (
            !button.classList.contains(
              "matched"
            )
          ) {

            button.classList.remove(
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
          function (item) {
            return item[0] !== "be";
          }
        )
      );

    rushMap = {};

    pool.forEach(
      function (pair) {

        rushMap[pair[0]] =
          pair[1];
      }
    );

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

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "match-chip word";

    button.textContent =
      word;

    button.dataset.side =
      side;

    button.dataset.val =
      word;

    button.addEventListener(
      "click",
      function () {
        onRushPick(button);
      }
    );

    return button;
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
        function (button) {

          if (
            !button.classList.contains(
              "matched"
            )
          ) {

            button.classList.remove(
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

        const points =
          10 +
          Math.min(
            40,
            (rushCombo - 1) * 5
          );

        score += points;

        correct += 1;

        if (feedbackEl) {

          feedbackEl.textContent =
            "Nice! +" +
            points;

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

        if (remaining === 0) {

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
      Object.keys(rushMap)
        .length || 1;

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
          function () {

            /*
              Don't interfere with
              actual <a> links.
            */

            if (
              li.classList.contains(
                "level-link"
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


  /* =========================================================
     MATCH RUSH SHUFFLE BUTTON
     ========================================================= */

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


  /* =========================================================
     BACK TO MENU
     ========================================================= */

  const backMenu =
    document.getElementById(
      "backMenu"
    );

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


  /* =========================================================
     RESULT → MENU
     ========================================================= */

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


  /* =========================================================
     PLAY AGAIN
     ========================================================= */

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
     INITIAL SCREEN
     ========================================================= */

  show("menu");

})();
