/* Simple Past — Was/Were · Regular · Irregular */
(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     VERB BANKS
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
     PRONUNCIATION
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
     A1 SENTENCE BANKS
     ========================================================= */

  /*
    These sentence templates are connected to the verb.
    This prevents unnatural combinations such as:
    "I slept home."
  */

  const REGULAR_SENTENCES = {
    answer: [
      "I answered the question.",
      "She answered the teacher.",
      "He answered my question."
    ],

    arrive: [
      "I arrived at school at eight.",
      "She arrived home late.",
      "They arrived at the hotel."
    ],

    ask: [
      "I asked the teacher a question.",
      "She asked me a question.",
      "He asked for help."
    ],

    book: [
      "We booked a hotel.",
      "I booked a room.",
      "They booked a trip."
    ],

    call: [
      "I called my mother.",
      "She called me last night.",
      "He called his friend."
    ],

    carry: [
      "I carried the bags.",
      "She carried her books.",
      "He carried a big box."
    ],

    change: [
      "I changed my clothes.",
      "She changed her plans.",
      "He changed his shirt."
    ],

    "check in": [
      "We checked in at the hotel.",
      "I checked in at the airport.",
      "They checked in at two."
    ],

    clean: [
      "I cleaned my room.",
      "She cleaned the kitchen.",
      "We cleaned the house."
    ],

    close: [
      "I closed the door.",
      "She closed the window.",
      "He closed the book."
    ],

    cook: [
      "I cooked dinner.",
      "She cooked some rice.",
      "He cooked breakfast."
    ],

    cry: [
      "The baby cried.",
      "She cried after the movie.",
      "The child cried."
    ],

    decide: [
      "I decided to stay home.",
      "We decided to go.",
      "She decided to buy it."
    ],

    finish: [
      "I finished my homework.",
      "She finished her work.",
      "We finished the lesson."
    ],

    hate: [
      "I hated the food.",
      "She hated the movie.",
      "He hated the cold weather."
    ],

    help: [
      "I helped my mother.",
      "She helped her friend.",
      "We helped the teacher."
    ],

    invite: [
      "I invited my friend.",
      "She invited us to dinner.",
      "They invited Tom."
    ],

    learn: [
      "I learned English.",
      "She learned a new word.",
      "We learned a lot."
    ],

    like: [
      "I liked the movie.",
      "She liked the food.",
      "They liked the party."
    ],

    listen: [
      "I listened to music.",
      "She listened to the teacher.",
      "We listened to the radio."
    ],

    live: [
      "I lived in Tehran.",
      "She lived with her parents.",
      "They lived in a small house."
    ],

    look: [
      "I looked at the picture.",
      "She looked at me.",
      "He looked outside."
    ],

    love: [
      "I loved the movie.",
      "She loved the food.",
      "They loved the party."
    ],

    miss: [
      "I missed the bus.",
      "She missed the train.",
      "He missed his family."
    ],

    move: [
      "I moved to a new house.",
      "She moved to another city.",
      "They moved last year."
    ],

    need: [
      "I needed some help.",
      "She needed a pen.",
      "We needed more time."
    ],

    offer: [
      "He offered me some coffee.",
      "She offered to help.",
      "They offered me a job."
    ],

    open: [
      "I opened the door.",
      "She opened the window.",
      "He opened the box."
    ],

    pack: [
      "I packed my bag.",
      "She packed her clothes.",
      "We packed our bags."
    ],

    paint: [
      "I painted the room.",
      "She painted the wall.",
      "They painted the house."
    ],

    park: [
      "I parked the car.",
      "She parked near the school.",
      "He parked outside."
    ],

    pass: [
      "I passed the test.",
      "She passed her exam.",
      "He passed the ball."
    ],

    play: [
      "I played soccer.",
      "She played tennis.",
      "We played a game."
    ],

    rain: [
      "It rained yesterday.",
      "It rained all day.",
      "It rained in the morning."
    ],

    relax: [
      "I relaxed at home.",
      "She relaxed after work.",
      "We relaxed at the beach."
    ],

    rent: [
      "We rented a car.",
      "I rented a small apartment.",
      "They rented a house."
    ],

    snow: [
      "It snowed yesterday.",
      "It snowed last night.",
      "It snowed in the morning."
    ],

    start: [
      "I started work at eight.",
      "The movie started at nine.",
      "She started a new job."
    ],

    stay: [
      "I stayed home.",
      "She stayed at a hotel.",
      "We stayed with our friends."
    ],

    stop: [
      "The bus stopped here.",
      "I stopped the car.",
      "She stopped working."
    ],

    study: [
      "I studied English.",
      "She studied for the test.",
      "We studied together."
    ],

    talk: [
      "I talked to my friend.",
      "She talked to the teacher.",
      "We talked about the movie."
    ],

    travel: [
      "I traveled to Turkey.",
      "She traveled with her family.",
      "We traveled by train."
    ],

    turn: [
      "I turned left.",
      "She turned the TV off.",
      "He turned the light on."
    ],

    use: [
      "I used my phone.",
      "She used a computer.",
      "We used the new book."
    ],

    wait: [
      "I waited for the bus.",
      "She waited for me.",
      "We waited outside."
    ],

    walk: [
      "I walked to school.",
      "She walked home.",
      "We walked in the park."
    ],

    want: [
      "I wanted some water.",
      "She wanted a new phone.",
      "They wanted to go home."
    ],

    wash: [
      "I washed my hands.",
      "She washed the dishes.",
      "He washed his car."
    ],

    watch: [
      "I watched TV.",
      "She watched a movie.",
      "We watched the game."
    ],

    work: [
      "I worked yesterday.",
      "She worked at a hotel.",
      "They worked all day."
    ]
  };

  const IRREGULAR_SENTENCES = {
    buy: [
      "I bought some bread.",
      "She bought a new bag.",
      "We bought some food."
    ],

    do: [
      "I did my homework.",
      "She did the work.",
      "We did the exercise."
    ],

    get: [
      "I got home at six.",
      "She got a new phone.",
      "We got some food."
    ],

    go: [
      "I went to school.",
      "She went home.",
      "They went to the park."
    ],

    have: [
      "I had breakfast.",
      "She had a good day.",
      "We had dinner together."
    ],

    leave: [
      "I left home at eight.",
      "She left the office early.",
      "They left the hotel."
    ],

    say: [
      "I said hello.",
      "She said my name.",
      "He said thank you."
    ],

    see: [
      "I saw my friend.",
      "She saw a dog.",
      "We saw a movie."
    ],

    send: [
      "I sent an email.",
      "She sent me a message.",
      "He sent a photo."
    ],

    sit: [
      "I sat on the chair.",
      "She sat next to me.",
      "We sat outside."
    ],

    tell: [
      "I told him the story.",
      "She told me the answer.",
      "He told us the news."
    ],

    write: [
      "I wrote an email.",
      "She wrote a letter.",
      "He wrote his name."
    ],

    come: [
      "I came home early.",
      "She came to my house.",
      "They came to the party."
    ],

    drink: [
      "I drank some water.",
      "She drank coffee.",
      "We drank tea."
    ],

    drive: [
      "I drove to work.",
      "She drove to the store.",
      "He drove home."
    ],

    eat: [
      "I ate breakfast.",
      "She ate some rice.",
      "We ate dinner."
    ],

    fall: [
      "I fell on the floor.",
      "She fell off her bike.",
      "He fell in the park."
    ],

    find: [
      "I found my keys.",
      "She found her phone.",
      "We found a good restaurant."
    ],

    give: [
      "I gave him a book.",
      "She gave me some water.",
      "He gave her a gift."
    ],

    know: [
      "I knew the answer.",
      "She knew his name.",
      "We knew the way."
    ],

    make: [
      "I made breakfast.",
      "She made a cake.",
      "We made dinner."
    ],

    meet: [
      "I met my friend.",
      "She met her teacher.",
      "We met at the café."
    ],

    read: [
      "I read a book.",
      "She read the newspaper.",
      "He read an email."
    ],

    run: [
      "I ran in the park.",
      "She ran every morning.",
      "They ran to the bus."
    ],

    sleep: [
      "I slept well last night.",
      "She slept for eight hours.",
      "The baby slept all night."
    ],

    speak: [
      "I spoke to my teacher.",
      "She spoke English.",
      "We spoke about school."
    ],

    take: [
      "I took a bus.",
      "She took a photo.",
      "He took my book."
    ],

    think: [
      "I thought about my family.",
      "She thought about the question.",
      "He thought it was good."
    ],

    wear: [
      "I wore my blue shirt.",
      "She wore a new dress.",
      "He wore black shoes."
    ],

    win: [
      "We won the game.",
      "She won the race.",
      "They won the match."
    ],

    begin: [
      "The class began at nine.",
      "The movie began at eight.",
      "The lesson began early."
    ],

    break: [
      "I broke my phone.",
      "She broke the glass.",
      "He broke his arm."
    ],

    bring: [
      "I brought some food.",
      "She brought her book.",
      "He brought a gift."
    ],

    build: [
      "They built a house.",
      "He built a small table.",
      "We built a snowman."
    ],

    catch: [
      "I caught the bus.",
      "She caught the ball.",
      "He caught the train."
    ],

    choose: [
      "I chose the blue one.",
      "She chose a new dress.",
      "We chose the first one."
    ],

    cut: [
      "I cut the paper.",
      "She cut the cake.",
      "He cut the bread."
    ],

    draw: [
      "I drew a picture.",
      "She drew a cat.",
      "He drew a house."
    ],

    feel: [
      "I felt tired.",
      "She felt happy.",
      "He felt sick."
    ],

    fly: [
      "I flew to London.",
      "She flew home.",
      "They flew to Turkey."
    ],

    forget: [
      "I forgot my keys.",
      "She forgot my name.",
      "He forgot his phone."
    ],

    hear: [
      "I heard a noise.",
      "She heard the music.",
      "We heard a dog."
    ],

    keep: [
      "I kept the book.",
      "She kept the photo.",
      "He kept the money."
    ],

    lose: [
      "I lost my keys.",
      "She lost her phone.",
      "He lost the game."
    ],

    pay: [
      "I paid for dinner.",
      "She paid for the ticket.",
      "We paid the bill."
    ],

    put: [
      "I put the book on the table.",
      "She put her bag on the chair.",
      "He put the keys in his bag."
    ],

    sell: [
      "I sold my old bike.",
      "She sold her car.",
      "They sold their house."
    ],

    sing: [
      "I sang a song.",
      "She sang at the party.",
      "They sang together."
    ],

    stand: [
      "I stood near the door.",
      "She stood outside.",
      "We stood in line."
    ],

    swim: [
      "I swam in the pool.",
      "She swam at the beach.",
      "They swam yesterday."
    ],

    teach: [
      "She taught English.",
      "He taught the students.",
      "My teacher taught us."
    ],

    understand: [
      "I understood the question.",
      "She understood the lesson.",
      "We understood the teacher."
    ]
  };

  /* =========================================================
     SIMPLE DATA
     ========================================================= */

  const PLACES = [
    "home",
    "school",
    "the park",
    "the office",
    "work",
    "the cinema",
    "the hotel",
    "the store",
    "the restaurant"
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

  function getRegularSentence(base) {
    const list = REGULAR_SENTENCES[base];

    if (list && list.length) {
      return pick(list);
    }

    return "I " + base + " yesterday.";
  }

  function getIrregularSentence(base) {
    const list = IRREGULAR_SENTENCES[base];

    if (list && list.length) {
      return pick(list);
    }

    return "I " + base + " yesterday.";
  }

  /*
    Replace the base verb in a sentence with a blank.
  */
  function blankVerb(sentence, past) {
    const regex = new RegExp("\\b" + escapeRegExp(past) + "\\b", "i");

    return sentence.replace(regex, "____");
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* =========================================================
     QUESTION BUILDERS
     ========================================================= */

  /* ---------- WAS / WERE ---------- */

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
    const singularSentences = [
      ["a book", "on the table"],
      ["a bag", "under the chair"],
      ["a cat", "in the garden"],
      ["a party", "at my house"],
      ["a problem", "at school"],
      ["a meeting", "at work"],
      ["a car", "in front of the house"],
      ["an email", "in my inbox"],
      ["a phone", "on the desk"],
      ["a dog", "in the park"]
    ];

    const pluralSentences = [
      ["two books", "on the table"],
      ["three bags", "under the chair"],
      ["two cats", "in the garden"],
      ["many people", "at the party"],
      ["some students", "at school"],
      ["two cars", "in front of the house"],
      ["three emails", "in my inbox"],
      ["some children", "in the park"],
      ["two phones", "on the desk"],
      ["many people", "at the meeting"]
    ];

    const useSingular = Math.random() < 0.5;

    if (useSingular) {
      const [noun, place] = pick(singularSentences);

      return {
        type: "mc",
        hint: "Choose There was or There were",
        prompt: "____ " + noun + " " + place + " yesterday.",
        choices: shuffle(["There was", "There were"]),
        answer: "There was"
      };
    }

    const [noun, place] = pick(pluralSentences);

    return {
      type: "mc",
      hint: "Choose There was or There were",
      prompt: "____ " + noun + " " + place + " yesterday.",
      choices: shuffle(["There was", "There were"]),
      answer: "There were"
    };
  }

  /* ---------- WAS / WERE WH QUESTIONS ---------- */

  function qWasWereWh() {
    const data = [
      ["Where", "you", "were", "you"],
      ["Where", "he", "was", "he"],
      ["Where", "she", "was", "she"],
      ["Where", "they", "were", "they"],
      ["When", "you", "were", "you"],
      ["When", "he", "was", "he"],
      ["When", "she", "was", "she"],
      ["Why", "you", "were", "you"],
      ["Why", "he", "was", "he"],
      ["Why", "they", "were", "they"]
    ];

    const [wh, subject, be, correctSubject] = pick(data);

    const correct = wh + " " + be + " " + correctSubject + "?";

    const wrongBe = be === "was" ? "were" : "was";

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: "Choose the correct question.",
      choices: shuffle([
        correct,
        wh + " " + wrongBe + " " + subject + "?",
        wh + " did " + subject + "?",
        "What " + be + " " + subject + "?"
      ]),
      answer: correct
    };
  }

  /* ---------- REGULAR LEVEL 1 ---------- */

  function qRegLevel1() {
    const [base, past] = pick(REGULAR);

    const form = pick(["pos", "neg", "q"]);

    if (form === "pos") {
      const sentence = getRegularSentence(base);
      const prompt = blankVerb(sentence, past);

      return {
        type: "mc",
        hint: "Choose the past form",
        prompt: prompt,
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
      const subject = pick([
        "I",
        "You",
        "He",
        "She",
        "We",
        "They"
      ]);

      return {
        type: "mc",
        hint: "Choose the correct negative",
        prompt: subject + " ____ " + base + " yesterday.",
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
      hint: "Choose the correct question",
      prompt: "____ you ____ yesterday? (" + base + ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Do / " + base,
        "Were / " + base
      ]),
      answer: "Did / " + base
    };
  }

  /* ---------- REGULAR WH QUESTIONS ---------- */

  function qRegWh() {
    const [base] = pick(REGULAR);

    const wh = pick([
      "Where",
      "When",
      "Why",
      "What"
    ]);

    const correct =
      wh + " did you " + base + " yesterday?";

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: "Choose the correct question.",
      choices: shuffle([
        correct,
        wh + " did you " + base + " yesterday",
        wh + " do you " + base + " yesterday?",
        wh + " you " + base + " yesterday?"
      ]),
      answer: correct
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

    const possibleOdd = [0, 1, 2].filter(
      (i) => i !== mainIdx
    );

    const oddIdx = pick(possibleOdd);

    const main = shuffle(
      groups[mainIdx].list
    ).slice(0, 3);

    const odd = pick(
      groups[oddIdx].list
    );

    return {
      type: "mc",
      hint: "Which word has a different -ed sound?",
      prompt: "Find the different pronunciation.",
      choices: shuffle(
        main.concat([odd])
      ),
      answer: odd
    };
  }

  /* ---------- IRREGULAR LEVEL 1 ---------- */

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

    if (form === "pos") {
      const sentence =
        getIrregularSentence(base);

      const prompt =
        blankVerb(sentence, past);

      return {
        type: "mc",
        hint: "Choose the past form",
        prompt: prompt,
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
      const subject = pick([
        "I",
        "You",
        "He",
        "She",
        "We",
        "They"
      ]);

      return {
        type: "mc",
        hint: "Choose the correct negative",
        prompt:
          subject +
          " ____ " +
          base +
          " yesterday.",
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
      hint: "Choose the correct question",
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

  /* ---------- IRREGULAR WH QUESTIONS ---------- */

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

    const correct =
      wh + " did they " + base + "?";

    return {
      type: "mc",
      hint: "Choose the correct Wh- question",
      prompt: "Choose the correct question.",
      choices: shuffle([
        correct,
        wh + " did they " + base,
        wh + " do they " + base + "?",
        wh + " they " + base + "?"
      ]),
      answer: correct
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
          b.textContent ===
          answer
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
      function (w) {
        const b =
          document.createElement(
            "button"
          );

        b.type = "button";
        b.className =
          "match-chip word";

        b.textContent = w;

        b.dataset.side =
          "left";

        b.dataset.val =
          w;

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
      function (w) {
        const b =
          document.createElement(
            "button"
          );

        b.type = "button";
        b.className =
          "match-chip word";

        b.textContent = w;

        b.dataset.side =
          "right";

        b.dataset.val =
          w;

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
      const L =
        matchSel.left.dataset.val;

      const R =
        matchSel.right.dataset.val;

      if (
        matchMap[L] === R
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
    .getElementById(
      "toMenuBtn"
    )
    .addEventListener(
      "click",
      function () {
        show("menu");
      }
    );

  document
    .getElementById(
      "playAgainBtn"
    )
    .addEventListener(
      "click",
      function () {
        if (modeKey) {
          startMode(
            modeKey
          );
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

  /* =========================================================
     INITIAL SCREEN
     ========================================================= */

  show("menu");
})();
