/* Simple Past — Was/Were · Regular · Irregular
   A1–A2 version
   Keeps vocabulary from both books while using
   natural, beginner-friendly sentences.
*/

(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     VERB DATA
     ========================================================= */

  /*
    Difficulty:
    1 = very common / core A1
    2 = A1–A2
    3 = less common / harder

    The verbs are NOT deleted.
    Difficulty is only used to control which vocabulary
    appears more often in the different levels.
  */

  const REGULAR = [
    { base: "answer", past: "answered", level: 1, sentences: [
      "I answered the question.",
      "She answered the phone.",
      "He answered my question."
    ]},
    { base: "arrive", past: "arrived", level: 2, sentences: [
      "I arrived at school early.",
      "She arrived home at six.",
      "They arrived late."
    ]},
    { base: "ask", past: "asked", level: 1, sentences: [
      "I asked a question.",
      "She asked me a question.",
      "He asked for help."
    ]},
    { base: "book", past: "booked", level: 2, sentences: [
      "I booked a hotel.",
      "She booked a room.",
      "We booked our tickets."
    ]},
    { base: "call", past: "called", level: 1, sentences: [
      "I called my mother.",
      "She called me yesterday.",
      "He called his friend."
    ]},
    { base: "carry", past: "carried", level: 2, sentences: [
      "I carried the bag.",
      "She carried the box.",
      "He carried his books."
    ]},
    { base: "change", past: "changed", level: 2, sentences: [
      "I changed my clothes.",
      "She changed her plan.",
      "We changed the date."
    ]},
    { base: "check in", past: "checked in", level: 3, sentences: [
      "We checked in at the hotel.",
      "She checked in at two.",
      "They checked in at the airport."
    ]},
    { base: "clean", past: "cleaned", level: 1, sentences: [
      "I cleaned my room.",
      "She cleaned the kitchen.",
      "We cleaned the house."
    ]},
    { base: "close", past: "closed", level: 1, sentences: [
      "I closed the door.",
      "She closed the window.",
      "He closed the book."
    ]},
    { base: "cook", past: "cooked", level: 1, sentences: [
      "I cooked dinner.",
      "She cooked rice.",
      "We cooked dinner together."
    ]},
    { base: "cry", past: "cried", level: 1, sentences: [
      "The baby cried.",
      "She cried yesterday.",
      "He cried after the movie."
    ]},
    { base: "decide", past: "decided", level: 2, sentences: [
      "I decided to stay home.",
      "She decided to go.",
      "We decided to eat at home."
    ]},
    { base: "finish", past: "finished", level: 1, sentences: [
      "I finished my homework.",
      "She finished her work.",
      "We finished the book."
    ]},
    { base: "hate", past: "hated", level: 2, sentences: [
      "I hated the food.",
      "She hated the movie.",
      "He hated the weather."
    ]},
    { base: "help", past: "helped", level: 1, sentences: [
      "I helped my mother.",
      "She helped me.",
      "He helped his friend."
    ]},
    { base: "invite", past: "invited", level: 2, sentences: [
      "I invited my friends.",
      "She invited me to dinner.",
      "We invited Tom."
    ]},
    { base: "learn", past: "learned", level: 1, sentences: [
      "I learned English.",
      "She learned a new word.",
      "We learned a lot."
    ]},
    { base: "like", past: "liked", level: 1, sentences: [
      "I liked the movie.",
      "She liked the food.",
      "We liked the hotel."
    ]},
    { base: "listen", past: "listened", level: 1, sentences: [
      "I listened to music.",
      "She listened to the teacher.",
      "We listened to the radio."
    ]},
    { base: "live", past: "lived", level: 1, sentences: [
      "I lived in Tehran.",
      "She lived with her parents.",
      "We lived in a small house."
    ]},
    { base: "look", past: "looked", level: 1, sentences: [
      "I looked at the picture.",
      "She looked at me.",
      "He looked outside."
    ]},
    { base: "love", past: "loved", level: 1, sentences: [
      "I loved the movie.",
      "She loved the food.",
      "We loved the trip."
    ]},
    { base: "miss", past: "missed", level: 2, sentences: [
      "I missed the bus.",
      "She missed the train.",
      "He missed the class."
    ]},
    { base: "move", past: "moved", level: 2, sentences: [
      "I moved to a new house.",
      "She moved to London.",
      "We moved last year."
    ]},
    { base: "need", past: "needed", level: 1, sentences: [
      "I needed some help.",
      "She needed a pen.",
      "We needed more time."
    ]},
    { base: "offer", past: "offered", level: 3, sentences: [
      "He offered me some water.",
      "She offered to help.",
      "They offered me a job."
    ]},
    { base: "open", past: "opened", level: 1, sentences: [
      "I opened the door.",
      "She opened the window.",
      "He opened the box."
    ]},
    { base: "pack", past: "packed", level: 1, sentences: [
      "I packed my bag.",
      "She packed her clothes.",
      "We packed our bags."
    ]},
    { base: "paint", past: "painted", level: 2, sentences: [
      "I painted the wall.",
      "She painted a picture.",
      "We painted the room."
    ]},
    { base: "park", past: "parked", level: 1, sentences: [
      "I parked the car.",
      "She parked near the school.",
      "He parked outside."
    ]},
    { base: "pass", past: "passed", level: 2, sentences: [
      "I passed the test.",
      "She passed the exam.",
      "He passed the ball."
    ]},
    { base: "play", past: "played", level: 1, sentences: [
      "I played football.",
      "She played tennis.",
      "We played a game."
    ]},
    { base: "rain", past: "rained", level: 1, sentences: [
      "It rained yesterday.",
      "It rained all day.",
      "It rained last night."
    ]},
    { base: "relax", past: "relaxed", level: 1, sentences: [
      "I relaxed at home.",
      "She relaxed after work.",
      "We relaxed at the hotel."
    ]},
    { base: "rent", past: "rented", level: 2, sentences: [
      "I rented a car.",
      "She rented a house.",
      "We rented a small apartment."
    ]},
    { base: "snow", past: "snowed", level: 1, sentences: [
      "It snowed yesterday.",
      "It snowed last night.",
      "It snowed in the morning."
    ]},
    { base: "start", past: "started", level: 1, sentences: [
      "I started work at eight.",
      "She started school last year.",
      "We started the game."
    ]},
    { base: "stay", past: "stayed", level: 1, sentences: [
      "I stayed home.",
      "She stayed at a hotel.",
      "We stayed with our friends."
    ]},
    { base: "stop", past: "stopped", level: 1, sentences: [
      "I stopped the car.",
      "She stopped the music.",
      "The bus stopped here."
    ]},
    { base: "study", past: "studied", level: 1, sentences: [
      "I studied English.",
      "She studied last night.",
      "We studied for the test."
    ]},
    { base: "talk", past: "talked", level: 1, sentences: [
      "I talked to my friend.",
      "She talked to her teacher.",
      "We talked about school."
    ]},
    { base: "travel", past: "traveled", level: 2, sentences: [
      "I traveled to Turkey.",
      "She traveled last summer.",
      "We traveled by bus."
    ]},
    { base: "turn", past: "turned", level: 2, sentences: [
      "I turned left.",
      "She turned the light off.",
      "He turned around."
    ]},
    { base: "use", past: "used", level: 1, sentences: [
      "I used my phone.",
      "She used a computer.",
      "We used the car."
    ]},
    { base: "wait", past: "waited", level: 1, sentences: [
      "I waited for the bus.",
      "She waited for me.",
      "We waited outside."
    ]},
    { base: "walk", past: "walked", level: 1, sentences: [
      "I walked to school.",
      "She walked home.",
      "We walked in the park."
    ]},
    { base: "want", past: "wanted", level: 1, sentences: [
      "I wanted some water.",
      "She wanted a new phone.",
      "He wanted to go home."
    ]},
    { base: "wash", past: "washed", level: 1, sentences: [
      "I washed my hands.",
      "She washed the dishes.",
      "We washed the car."
    ]},
    { base: "watch", past: "watched", level: 1, sentences: [
      "I watched TV.",
      "She watched a movie.",
      "We watched football."
    ]},
    { base: "work", past: "worked", level: 1, sentences: [
      "I worked yesterday.",
      "She worked at home.",
      "We worked all day."
    ]}
  ];

  const IRREGULAR = [
    { base: "be", past: "was/were", level: 1 },
    { base: "buy", past: "bought", level: 1, sentences: [
      "I bought some food.",
      "She bought a new bag.",
      "We bought a new phone."
    ]},
    { base: "do", past: "did", level: 1, sentences: [
      "I did my homework.",
      "She did the work.",
      "We did our homework."
    ]},
    { base: "get", past: "got", level: 1, sentences: [
      "I got a new phone.",
      "She got home late.",
      "We got some food."
    ]},
    { base: "go", past: "went", level: 1, sentences: [
      "I went to school.",
      "She went home.",
      "We went to the park."
    ]},
    { base: "have", past: "had", level: 1, sentences: [
      "I had breakfast.",
      "She had a coffee.",
      "We had dinner."
    ]},
    { base: "leave", past: "left", level: 1, sentences: [
      "I left home at eight.",
      "She left school early.",
      "We left the hotel."
    ]},
    { base: "say", past: "said", level: 1, sentences: [
      "I said hello.",
      "She said thank you.",
      "He said my name."
    ]},
    { base: "see", past: "saw", level: 1, sentences: [
      "I saw Tom yesterday.",
      "She saw a movie.",
      "We saw our friends."
    ]},
    { base: "send", past: "sent", level: 2, sentences: [
      "I sent a message.",
      "She sent an email.",
      "He sent me a photo."
    ]},
    { base: "sit", past: "sat", level: 1, sentences: [
      "I sat on the chair.",
      "She sat next to me.",
      "We sat in the park."
    ]},
    { base: "tell", past: "told", level: 1, sentences: [
      "I told him the story.",
      "She told me the answer.",
      "He told me his name."
    ]},
    { base: "write", past: "wrote", level: 1, sentences: [
      "I wrote an email.",
      "She wrote a letter.",
      "He wrote his name."
    ]},
    { base: "come", past: "came", level: 1, sentences: [
      "I came home early.",
      "She came to school.",
      "They came to the party."
    ]},
    { base: "drink", past: "drank", level: 1, sentences: [
      "I drank some water.",
      "She drank coffee.",
      "We drank tea."
    ]},
    { base: "drive", past: "drove", level: 1, sentences: [
      "I drove to work.",
      "She drove home.",
      "He drove the car."
    ]},
    { base: "eat", past: "ate", level: 1, sentences: [
      "I ate breakfast.",
      "She ate pizza.",
      "We ate dinner."
    ]},
    { base: "fall", past: "fell", level: 2, sentences: [
      "I fell in the park.",
      "She fell off her bike.",
      "He fell down."
    ]},
    { base: "find", past: "found", level: 1, sentences: [
      "I found my keys.",
      "She found her phone.",
      "We found the book."
    ]},
    { base: "give", past: "gave", level: 1, sentences: [
      "I gave her a gift.",
      "She gave me some water.",
      "He gave me a book."
    ]},
    { base: "know", past: "knew", level: 2, sentences: [
      "I knew the answer.",
      "She knew my name.",
      "He knew the way."
    ]},
    { base: "make", past: "made", level: 1, sentences: [
      "I made breakfast.",
      "She made a cake.",
      "We made dinner."
    ]},
    { base: "meet", past: "met", level: 1, sentences: [
      "I met my friend.",
      "She met Tom.",
      "We met at school."
    ]},
    { base: "read", past: "read", level: 1, sentences: [
      "I read a book.",
      "She read the newspaper.",
      "We read the story."
    ]},
    { base: "run", past: "ran", level: 1, sentences: [
      "I ran in the park.",
      "She ran home.",
      "We ran every morning."
    ]},
    { base: "sleep", past: "slept", level: 1, sentences: [
      "I slept well.",
      "She slept for eight hours.",
      "We slept at the hotel."
    ]},
    { base: "speak", past: "spoke", level: 2, sentences: [
      "I spoke to my teacher.",
      "She spoke English.",
      "We spoke about school."
    ]},
    { base: "take", past: "took", level: 1, sentences: [
      "I took a bus.",
      "She took a photo.",
      "We took a taxi."
    ]},
    { base: "think", past: "thought", level: 2, sentences: [
      "I thought about my family.",
      "She thought it was good.",
      "He thought about the question."
    ]},
    { base: "wear", past: "wore", level: 2, sentences: [
      "I wore a blue shirt.",
      "She wore a dress.",
      "He wore black shoes."
    ]},
    { base: "win", past: "won", level: 2, sentences: [
      "We won the game.",
      "She won the race.",
      "He won the match."
    ]},
    { base: "begin", past: "began", level: 3, sentences: [
      "The class began at nine.",
      "The movie began at eight.",
      "The game began early."
    ]},
    { base: "break", past: "broke", level: 2, sentences: [
      "I broke my phone.",
      "She broke the glass.",
      "He broke his leg."
    ]},
    { base: "bring", past: "brought", level: 1, sentences: [
      "I brought some food.",
      "She brought her book.",
      "He brought a gift."
    ]},
    { base: "build", past: "built", level: 2, sentences: [
      "They built a house.",
      "He built a table.",
      "We built a small wall."
    ]},
    { base: "catch", past: "caught", level: 3, sentences: [
      "I caught the bus.",
      "She caught the ball.",
      "He caught the train."
    ]},
    { base: "choose", past: "chose", level: 3, sentences: [
      "I chose the blue one.",
      "She chose a dress.",
      "We chose the red car."
    ]},
    { base: "cut", past: "cut", level: 2, sentences: [
      "I cut the paper.",
      "She cut the cake.",
      "He cut the bread."
    ]},
    { base: "draw", past: "drew", level: 2, sentences: [
      "I drew a picture.",
      "She drew a house.",
      "He drew a cat."
    ]},
    { base: "feel", past: "felt", level: 1, sentences: [
      "I felt happy.",
      "She felt tired.",
      "He felt sick."
    ]},
    { base: "fly", past: "flew", level: 3, sentences: [
      "I flew to London.",
      "She flew home.",
      "We flew to Turkey."
    ]},
    { base: "forget", past: "forgot", level: 3, sentences: [
      "I forgot my keys.",
      "She forgot her phone.",
      "He forgot my name."
    ]},
    { base: "hear", past: "heard", level: 2, sentences: [
      "I heard a noise.",
      "She heard the music.",
      "He heard my voice."
    ]},
    { base: "keep", past: "kept", level: 3, sentences: [
      "I kept the book.",
      "She kept the money.",
      "He kept my phone."
    ]},
    { base: "lose", past: "lost", level: 2, sentences: [
      "I lost my keys.",
      "She lost her phone.",
      "He lost his bag."
    ]},
    { base: "pay", past: "paid", level: 2, sentences: [
      "I paid for lunch.",
      "She paid the bill.",
      "We paid for the tickets."
    ]},
    { base: "put", past: "put", level: 2, sentences: [
      "I put the book on the table.",
      "She put her bag here.",
      "He put the keys on the desk."
    ]},
    { base: "sell", past: "sold", level: 3, sentences: [
      "I sold my car.",
      "She sold her old phone.",
      "They sold the house."
    ]},
    { base: "sing", past: "sang", level: 2, sentences: [
      "I sang a song.",
      "She sang at the party.",
      "We sang together."
    ]},
    { base: "stand", past: "stood", level: 2, sentences: [
      "I stood near the door.",
      "She stood outside.",
      "We stood in line."
    ]},
    { base: "swim", past: "swam", level: 2, sentences: [
      "I swam in the pool.",
      "She swam yesterday.",
      "We swam in the sea."
    ]},
    { base: "teach", past: "taught", level: 2, sentences: [
      "I taught English.",
      "She taught the students.",
      "He taught me English."
    ]},
    { base: "understand", past: "understood", level: 2, sentences: [
      "I understood the question.",
      "She understood the teacher.",
      "We understood the lesson."
    ]}
  ];

  /* =========================================================
     PRONUNCIATION GROUPS
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

  const PLACES = [
    "home",
    "school",
    "work",
    "the park",
    "the store",
    "the cinema",
    "the gym"
  ];

  const SIMPLE_SUBJECTS = [
    "I",
    "You",
    "He",
    "She",
    "We",
    "They"
  ];

  const NAMES = [
    "Tom",
    "Sara",
    "Ali",
    "Emma"
  ];

  /* =========================================================
     HELPERS
     ========================================================= */

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

  function pickByLevel(pool, maxLevel) {
    const filtered = pool.filter(function (v) {
      return v.level <= maxLevel;
    });

    return pick(filtered.length ? filtered : pool);
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function removeQuestionMark(str) {
    return str.replace(/\?$/, "");
  }

  /* =========================================================
     WAS / WERE
     ========================================================= */

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
      choices: shuffle([
        "was",
        "were"
      ]),
      answer: answer
    };
  }

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

  function qWasWereWh() {
    const data = pick([
      {
        wh: "Where",
        subject: "you",
        be: "were",
        sentence: "Where were you yesterday?"
      },
      {
        wh: "Where",
        subject: "he",
        be: "was",
        sentence: "Where was he yesterday?"
      },
      {
        wh: "Where",
        subject: "she",
        be: "was",
        sentence: "Where was she last night?"
      },
      {
        wh: "When",
        subject: "they",
        be: "were",
        sentence: "When were they at school?"
      },
      {
        wh: "Why",
        subject: "he",
        be: "was",
        sentence: "Why was he at home?"
      },
      {
        wh: "Why",
        subject: "she",
        be: "was",
        sentence: "Why was she late?"
      },
      {
        wh: "Where",
        subject: "Tom",
        be: "was",
        sentence: "Where was Tom yesterday?"
      }
    ]);

    const wrongBe = data.be === "was" ? "were" : "was";

    return {
      type: "mc",
      hint: "Wh- question with was / were",
      prompt: "Choose the correct question.",
      choices: shuffle([
        data.sentence,
        data.wh + " " + wrongBe + " " + data.subject + "?",
        data.wh + " is " + data.subject + "?",
        "Was " + data.subject + " where?"
      ]),
      answer: data.sentence
    };
  }

  /* =========================================================
     REGULAR VERBS
     ========================================================= */

  function qRegLevel1() {
    const verb = pickByLevel(REGULAR, 1);
    const form = pick([
      "pos",
      "neg",
      "q"
    ]);

    const subject = pick(SIMPLE_SUBJECTS);

    if (form === "pos") {
      const sentence = pick(verb.sentences);
      const lowerSentence = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      const prompt = lowerSentence.replace(
        verb.past,
        "____"
      );

      return {
        type: "mc",
        hint: "Positive · regular verb",
        prompt: prompt,
        choices: shuffle([
          verb.past,
          verb.base,
          verb.base + "ed",
          "did " + verb.base
        ]),
        answer: verb.past
      };
    }

    if (form === "neg") {
      const baseSentence = pick(verb.sentences);

      const negativeSentence =
        subject +
        " didn't " +
        verb.base +
        ".";

      const correct = "didn't " + verb.base;

      return {
        type: "mc",
        hint: "Negative · regular verb",
        prompt:
          subject +
          " ____ " +
          getObjectFromSentence(baseSentence, verb) +
          ".",
        choices: shuffle([
          correct,
          "didn't " + verb.past,
          "not " + verb.past,
          "doesn't " + verb.base
        ]),
        answer: correct
      };
    }

    return {
      type: "mc",
      hint: "Question · regular verb",
      prompt: "____ you ____ yesterday? (" + verb.base + ")",
      choices: shuffle([
        "Did / " + verb.base,
        "Did / " + verb.past,
        "Do / " + verb.base,
        "Was / " + verb.past
      ]),
      answer: "Did / " + verb.base
    };
  }

  /*
    Gets a simple object/place from one of our stored sentences.
    This prevents negative questions from becoming unnatural.
  */
  function getObjectFromSentence(sentence, verb) {
    let text = sentence;

    text = text.replace(/^I /, "");
    text = text.replace(/^You /, "");
    text = text.replace(/^He /, "");
    text = text.replace(/^She /, "");
    text = text.replace(/^We /, "");
    text = text.replace(/^They /, "");

    text = text.replace(
      new RegExp("\\b" + escapeRegExp(verb.past) + "\\b", "i"),
      ""
    );

    text = text.replace(/\.$/, "").trim();

    if (!text) {
      return "it";
    }

    return text;
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function qRegWh() {
    const verb = pickByLevel(REGULAR, 2);

    const questions = [
      {
        wh: "Where",
        sentence: "Where did you " + verb.base + " yesterday?"
      },
      {
        wh: "When",
        sentence: "When did you " + verb.base + " yesterday?"
      },
      {
        wh: "Why",
        sentence: "Why did you " + verb.base + " yesterday?"
      },
      {
        wh: "What",
        sentence: "What did you " + verb.base + " yesterday?"
      }
    ];

    const q = pick(questions);

    return {
      type: "mc",
      hint: "Wh- question · regular verb",
      prompt: "Choose the correct question.",
      choices: shuffle([
        q.sentence,
        q.wh + " did you " + verb.past + " yesterday?",
        q.wh + " do you " + verb.base + " yesterday?",
        q.wh + " you " + verb.past + " yesterday?"
      ]),
      answer: q.sentence
    };
  }

  /* =========================================================
     REGULAR PRONUNCIATION
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

    return {
      type: "mc",
      hint: "Which past form has a different -ed sound?",
      prompt: "Find the different pronunciation.",
      choices: shuffle(
        main.concat([odd])
      ),
      answer: odd
    };
  }

  /* =========================================================
     IRREGULAR VERBS
     ========================================================= */

  function qIrrLevel1() {
    const pool = IRREGULAR.filter(function (x) {
      return x.base !== "be";
    });

    const verb = pickByLevel(pool, 1);

    const form = pick([
      "pos",
      "neg",
      "q"
    ]);

    const subject = pick(SIMPLE_SUBJECTS);

    if (form === "pos") {
      const sentence = pick(verb.sentences);

      const prompt = sentence.replace(
        verb.past,
        "____"
      );

      return {
        type: "mc",
        hint: "Positive · irregular verb",
        prompt: prompt,
        choices: shuffle([
          verb.past,
          verb.base,
          verb.base + "ed",
          "did " + verb.base
        ]),
        answer: verb.past
      };
    }

    if (form === "neg") {
      const correct = "didn't " + verb.base;

      return {
        type: "mc",
        hint: "Negative · irregular verb",
        prompt:
          subject +
          " ____ yesterday. (" +
          verb.base +
          ")",
        choices: shuffle([
          correct,
          "didn't " + verb.past,
          "not " + verb.past,
          "doesn't " + verb.base
        ]),
        answer: correct
      };
    }

    return {
      type: "mc",
      hint: "Question · irregular verb",
      prompt:
        "____ she ____ it? (" +
        verb.base +
        ")",
      choices: shuffle([
        "Did / " + verb.base,
        "Did / " + verb.past,
        "Does / " + verb.base,
        "Was / " + verb.past
      ]),
      answer: "Did / " + verb.base
    };
  }

  function qIrrWh() {
    const pool = IRREGULAR.filter(function (x) {
      return x.base !== "be";
    });

    const verb = pickByLevel(pool, 2);

    const wh = pick([
      "Where",
      "When",
      "Why",
      "What"
    ]);

    const correct =
      wh +
      " did they " +
      verb.base +
      "?";

    const wrong1 =
      wh +
      " did they " +
      verb.past +
      "?";

    const wrong2 =
      wh +
      " do they " +
      verb.base +
      "?";

    const wrong3 =
      wh +
      " they " +
      verb.base +
      "?";

    return {
      type: "mc",
      hint: "Wh- question · irregular verb",
      prompt: "Choose the correct question.",
      choices: shuffle([
        correct,
        wrong1,
        wrong2,
        wrong3
      ]),
      answer: correct
    };
  }

  /* =========================================================
     IRREGULAR MATCHING
     ========================================================= */

  function qIrrMatch() {
    const pool = IRREGULAR.filter(function (x) {
      return x.base !== "be";
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
          left: pair.base,
          right: pair.past
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

    if (!mode) return;

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

      return;
    }

    if (matchArea) {
      matchArea.classList.add("hidden");
      matchArea.style.display = "";
    }

    choicesArea.classList.remove("hidden");

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

  function onChoice(choice, answer, btn) {
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
     NORMAL MATCHING
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

    matchArea.classList.remove(
      "hidden"
    );

    matchArea.style.display = "flex";

    choicesArea.classList.add(
      "hidden"
    );

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (word) {
      const b =
        document.createElement("button");

      b.type = "button";
      b.className =
        "match-chip word";

      b.textContent = word;

      b.dataset.side = "left";
      b.dataset.val = word;

      b.addEventListener(
        "click",
        function () {
          onMatchPick(b);
        }
      );

      matchLeft.appendChild(b);
    });

    rights.forEach(function (word) {
      const b =
        document.createElement("button");

      b.type = "button";
      b.className =
        "match-chip word";

      b.textContent = word;

      b.dataset.side = "right";
      b.dataset.val = word;

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

        const a = matchSel.left;
        const b = matchSel.right;

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
    rushTimeLeft = RUSH_SECONDS;

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

    const pool = shuffle(
      IRREGULAR.filter(
        function (x) {
          return x.base !== "be";
        }
      )
    );

    rushMap = {};

    pool.forEach(function (p) {
      rushMap[p.base] =
        p.past;
    });

    const lefts = shuffle(
      pool.map(function (p) {
        return p.base;
      })
    );

    const rights = shuffle(
      pool.map(function (p) {
        return p.past;
      })
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
     RESULTS
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

    if (finalScore) {
      finalScore.textContent =
        String(score);
    }

    if (finalCorrect) {
      finalCorrect.textContent =
        String(rushMatches);
    }

    if (finalWrong) {
      finalWrong.textContent =
        String(wrong);
    }

    const totalPairs =
      Object.keys(rushMap).length ||
      1;

    const acc =
      Math.round(
        (rushMatches /
          totalPairs) *
          100
      );

    if (finalAccuracy) {
      finalAccuracy.textContent =
        Math.min(
          100,
          acc
        ) + "%";
    }

    show("result");
  }

  function endRound() {
    if (progressFill) {
      progressFill.style.width =
        "100%";
    }

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

    if (finalScore) {
      finalScore.textContent =
        String(score);
    }

    if (finalCorrect) {
      finalCorrect.textContent =
        String(correct);
    }

    if (finalWrong) {
      finalWrong.textContent =
        String(wrong);
    }

    if (finalAccuracy) {
      finalAccuracy.textContent =
        (
          TOTAL
            ? Math.round(
                (correct / TOTAL) *
                  100
              )
            : 0
        ) + "%";
    }

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
     INITIAL SCREEN
     ========================================================= */

  show("menu");

})();
