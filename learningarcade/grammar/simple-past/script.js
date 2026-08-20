/* =========================================================
   SIMPLE PAST — MR. SHEYHAKI'S LEARNING ARCADE

   WAS / WERE
   REGULAR VERBS
   IRREGULAR VERBS

   All learning questions use FIXED, checked sentences.
   No random sentence generation.
========================================================= */

(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     HELPERS
  ========================================================= */

  function shuffle(array) {
    const copy = array.slice();

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function pick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }


  /* =========================================================
     REGULAR VERBS
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


  /* =========================================================
     IRREGULAR VERBS
  ========================================================= */

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
     WAS / WERE — LEVEL 1

     Fixed sentences.
     Different time expressions are intentionally used.
  ========================================================= */

  const WAS_WERE_LEVEL_1 = [

    {
      prompt: "I ____ at home last night.",
      choices: ["was", "were", "am"],
      answer: "was"
    },

    {
      prompt: "They ____ at the restaurant on Friday.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "She ____ tired after work.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "We ____ at the beach last weekend.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "He ____ in the kitchen this morning.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "You ____ very busy on Monday.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "My parents ____ at the hotel last month.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "Sara ____ at the cinema on Saturday evening.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "The children ____ in the garden after lunch.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "Tom ____ at work before dinner.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "I ____ very happy last weekend.",
      choices: ["was", "were", "am"],
      answer: "was"
    },

    {
      prompt: "The students ____ in the classroom before the lesson.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "She ____ at the airport early this morning.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "We ____ at a small hotel in July.",
      choices: ["were", "was", "are"],
      answer: "were"
    },

    {
      prompt: "It ____ very cold on Sunday.",
      choices: ["was", "were", "is"],
      answer: "was"
    }
  ];


  /* =========================================================
     THERE WAS / THERE WERE — LEVEL 2

     A1 vocabulary:
     hotels, houses, apartments, rooms,
     furniture and common things.
  ========================================================= */

  const THERE_WAS_WERE = [

    {
      prompt: "____ a large bed in the hotel room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two chairs in the bedroom.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a TV on the wall in the hotel room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ three windows in the living room.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a comfortable sofa in the living room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ four towels in the hotel bathroom.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a shower next to the bathtub.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two beds in our hotel room.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a small table in the kitchen.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ some clean cups in the kitchen.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a lamp next to the bed.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two pictures on the bedroom wall.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a fridge in the apartment kitchen.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ some books on the shelf.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a balcony outside the hotel room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ five rooms in the old house.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a mirror above the bathroom sink.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two bathrooms in the apartment.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    },

    {
      prompt: "____ a swimming pool at the hotel.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ many guests in the hotel lobby.",
      choices: ["There were", "There was", "There are"],
      answer: "There were"
    }
  ];


  /* =========================================================
     WAS / WERE — WH QUESTIONS — LEVEL 3

     Full sentences.
     Exactly 3 choices.
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
      prompt: "Why ____ he at school this morning?",
      choices: [
        "Why was he at school this morning?",
        "Why were he at school this morning?",
        "Why is he at school this morning?"
      ],
      answer: "Why was he at school this morning?"
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
      prompt: "Why ____ you at the hospital last night?",
      choices: [
        "Why were you at the hospital last night?",
        "Why was you at the hospital last night?",
        "Why are you at the hospital last night?"
      ],
      answer: "Why were you at the hospital last night?"
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


  /* =========================================================
     REGULAR VERBS — LEVEL 1

     Fixed positive / negative / question items.
  ========================================================= */

  const REGULAR_LEVEL_1 = [

    {
      prompt: "I ____ my homework after dinner.",
      choices: ["finished", "finish", "finishing"],
      answer: "finished"
    },

    {
      prompt: "She ____ her room on Saturday.",
      choices: ["cleaned", "clean", "cleaning"],
      answer: "cleaned"
    },

    {
      prompt: "We ____ at a hotel last weekend.",
      choices: ["stayed", "stay", "staying"],
      answer: "stayed"
    },

    {
      prompt: "They ____ the hotel room before dinner.",
      choices: ["cleaned", "clean", "cleaning"],
      answer: "cleaned"
    },

    {
      prompt: "He ____ the door because it was cold.",
      choices: ["closed", "close", "closing"],
      answer: "closed"
    },

    {
      prompt: "I ____ my friend last night.",
      choices: ["called", "call", "calling"],
      answer: "called"
    },

    {
      prompt: "She ____ a table for four at the restaurant.",
      choices: ["booked", "book", "booking"],
      answer: "booked"
    },

    {
      prompt: "We ____ the new apartment last month.",
      choices: ["painted", "paint", "painting"],
      answer: "painted"
    },

    {
      prompt: "They ____ the car near the hotel.",
      choices: ["parked", "park", "parking"],
      answer: "parked"
    },

    {
      prompt: "He ____ English for two hours yesterday.",
      choices: ["studied", "study", "studying"],
      answer: "studied"
    },

    {
      prompt: "I ____ the movie last night.",
      choices: ["liked", "like", "liking"],
      answer: "liked"
    },

    {
      prompt: "She ____ the windows in the morning.",
      choices: ["washed", "wash", "washing"],
      answer: "washed"
    },

    {
      prompt: "We ____ our bags before the trip.",
      choices: ["packed", "pack", "packing"],
      answer: "packed"
    },

    {
      prompt: "They ____ the museum on Monday.",
      choices: ["visited", "visit", "visiting"],
      answer: "visited"
    },

    {
      prompt: "I ____ at home last night.",
      choices: ["relaxed", "relax", "relaxing"],
      answer: "relaxed"
    }
  ];


  /* =========================================================
     REGULAR VERBS — WH QUESTIONS — LEVEL 2

     These were accidentally missing.
     Full sentences + exactly 3 choices.
  ========================================================= */

  const REGULAR_WH = [

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
    },

    {
      prompt: "What time did you ____ home? (arrive)",
      choices: [
        "What time did you arrive home?",
        "What time did you arrived home?",
        "What time do you arrive home?"
      ],
      answer: "What time did you arrive home?"
    },

    {
      prompt: "Why did she ____ the invitation? (accept)",
      choices: [
        "Why did she accept the invitation?",
        "Why did she accepted the invitation?",
        "Why does she accept the invitation?"
      ],
      answer: "Why did she accept the invitation?"
    }
  ];


  /* =========================================================
     REGULAR VERBS — LEVEL 3
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

  const REGULAR_SOUND_QUESTIONS = [

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["walked", "played", "wanted"],
      answer: "wanted"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["cleaned", "opened", "watched"],
      answer: "watched"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["helped", "worked", "needed"],
      answer: "needed"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["called", "lived", "started"],
      answer: "started"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["liked", "looked", "painted"],
      answer: "painted"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["arrived", "played", "stopped"],
      answer: "stopped"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["washed", "talked", "invited"],
      answer: "invited"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["studied", "turned", "hated"],
      answer: "hated"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["rented", "needed", "answered"],
      answer: "answered"
    },

    {
      prompt: "Which word has a different -ed sound?",
      choices: ["packed", "missed", "decided"],
      answer: "decided"
    }
  ];


  /* =========================================================
     IRREGULAR VERBS — LEVEL 1
  ========================================================= */

  const IRREGULAR_LEVEL_1 = [

    {
      prompt: "I ____ to the supermarket after work.",
      choices: ["went", "go", "goed"],
      answer: "went"
    },

    {
      prompt: "She ____ breakfast at seven o'clock.",
      choices: ["had", "have", "haved"],
      answer: "had"
    },

    {
      prompt: "They ____ a new TV last month.",
      choices: ["bought", "buy", "buyed"],
      answer: "bought"
    },

    {
      prompt: "He ____ home late on Friday.",
      choices: ["came", "come", "comed"],
      answer: "came"
    },

    {
      prompt: "We ____ our friends at the restaurant.",
      choices: ["met", "meet", "meeted"],
      answer: "met"
    },

    {
      prompt: "I ____ a great movie last night.",
      choices: ["saw", "see", "seed"],
      answer: "saw"
    },

    {
      prompt: "She ____ her keys on the table.",
      choices: ["put", "putted", "puts"],
      answer: "put"
    },

    {
      prompt: "They ____ dinner at a small restaurant.",
      choices: ["ate", "eat", "eated"],
      answer: "ate"
    },

    {
      prompt: "He ____ the bus to work yesterday.",
      choices: ["took", "take", "taked"],
      answer: "took"
    },

    {
      prompt: "We ____ very well at the hotel.",
      choices: ["slept", "sleep", "sleeped"],
      answer: "slept"
    },

    {
      prompt: "I ____ my friend a message.",
      choices: ["sent", "send", "sended"],
      answer: "sent"
    },

    {
      prompt: "She ____ a beautiful picture.",
      choices: ["drew", "draw", "drawed"],
      answer: "drew"
    },

    {
      prompt: "They ____ a new apartment last year.",
      choices: ["found", "find", "finded"],
      answer: "found"
    },

    {
      prompt: "He ____ me the truth.",
      choices: ["told", "tell", "telled"],
      answer: "told"
    },

    {
      prompt: "We ____ English at school.",
      choices: ["learned", "learn", "learnt"],
      answer: "learned"
    }
  ];


  /* =========================================================
     IRREGULAR VERBS — WH QUESTIONS — LEVEL 2

     These were accidentally missing.
     Full sentences + exactly 3 choices.
  ========================================================= */

  const IRREGULAR_WH = [

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
    },

    {
      prompt: "Who did you ____ at the airport? (see)",
      choices: [
        "Who did you see at the airport?",
        "Who did you saw at the airport?",
        "Who do you see at the airport?"
      ],
      answer: "Who did you see at the airport?"
    },

    {
      prompt: "What time did he ____ home? (get)",
      choices: [
        "What time did he get home?",
        "What time did he got home?",
        "What time does he get home?"
      ],
      answer: "What time did he get home?"
    }
  ];


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
     QUESTION BUILDERS
  ========================================================= */

  function buildFixedQuestion(list, hint) {

    const item = pick(list);

    return {
      type: "mc",
      hint: hint,
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }


  function qWasWere() {
    return buildFixedQuestion(
      WAS_WERE_LEVEL_1,
      "Choose was or were"
    );
  }


  function qThereWasWere() {
    return buildFixedQuestion(
      THERE_WAS_WERE,
      "Choose There was or There were"
    );
  }


  function qWasWereWh() {
    return buildFixedQuestion(
      WAS_WERE_WH,
      "Choose the correct Wh- question"
    );
  }


  function qRegLevel1() {
    return buildFixedQuestion(
      REGULAR_LEVEL_1,
      "Choose the correct past form"
    );
  }


  function qRegWh() {
    return buildFixedQuestion(
      REGULAR_WH,
      "Choose the correct Wh- question"
    );
  }


  function qRegSound() {
    return buildFixedQuestion(
      REGULAR_SOUND_QUESTIONS,
      "Choose the word with a different -ed sound"
    );
  }


  function qIrrLevel1() {
    return buildFixedQuestion(
      IRREGULAR_LEVEL_1,
      "Choose the correct past form"
    );
  }


  function qIrrWh() {
    return buildFixedQuestion(
      IRREGULAR_WH,
      "Choose the correct Wh- question"
    );
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
      label: "Regular · Level 3 · -ed pronunciation",
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
      label: "Irregular · Match Rush",
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
      Build a shuffled set from the fixed question bank.
      The sentences themselves are NEVER generated.
    */

    const available = shuffle(
      getQuestionBank(key)
    );

    for (
      let i = 0;
      i < TOTAL;
      i++
    ) {
      queue.push(
        available[
          i % available.length
        ]
      );
    }

    queue = queue.map(function (item) {
      return {
        type: item.type || "mc",
        hint: item.hint || mode.label,
        prompt: item.prompt,
        choices: shuffle(item.choices),
        answer: item.answer
      };
    });

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


  function getQuestionBank(key) {

    switch (key) {

      case "ww1":
        return WAS_WERE_LEVEL_1;

      case "ww2":
        return THERE_WAS_WERE;

      case "ww3":
        return WAS_WERE_WH;

      case "reg1":
        return REGULAR_LEVEL_1;

      case "reg2":
        return REGULAR_WH;

      case "reg-sound":
        return REGULAR_SOUND_QUESTIONS;

      case "irr1":
        return IRREGULAR_LEVEL_1;

      case "irr2":
        return IRREGULAR_WH;

      default:
        return [];
    }
  }


  /* =========================================================
     LOAD QUESTION
  ========================================================= */

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
     ANSWER
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

        matchMap[
          pair.left
        ] = pair.right;

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

        const leftButton =
          matchSel.left;

        const rightButton =
          matchSel.right;

        matchSel = {
          left: null,
          right: null
        };

        setTimeout(
          function () {

            leftButton.classList.remove(
              "selected",
              "wrong-flash"
            );

            rightButton.classList.remove(
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
        rushMap[
          pair[0]
        ] = pair[1];
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
            "Nice! +" + points;

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

        const leftButton =
          rushSel.left;

        const rightButton =
          rushSel.right;

        rushSel = {
          left: null,
          right: null
        };

        updateRushHud();

        setTimeout(
          function () {

            leftButton.classList.remove(
              "selected",
              "wrong-flash"
            );

            rightButton.classList.remove(
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
    .forEach(
      function (li) {

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
