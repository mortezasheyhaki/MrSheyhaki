/* =========================================================
   SIMPLE PAST — MR. SHEYHAKI'S LEARNING ARCADE
   Fixed A1 questions · no repeats · fully working
   ========================================================= */

(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     DATA
     ========================================================= */

  const REGULAR = [
    ["answer", "answered"], ["arrive", "arrived"], ["ask", "asked"],
    ["book", "booked"], ["call", "called"], ["carry", "carried"],
    ["change", "changed"], ["check in", "checked in"], ["clean", "cleaned"],
    ["close", "closed"], ["cook", "cooked"], ["cry", "cried"],
    ["decide", "decided"], ["finish", "finished"], ["hate", "hated"],
    ["help", "helped"], ["invite", "invited"], ["learn", "learned"],
    ["like", "liked"], ["listen", "listened"], ["live", "lived"],
    ["look", "looked"], ["love", "loved"], ["miss", "missed"],
    ["move", "moved"], ["need", "needed"], ["offer", "offered"],
    ["open", "opened"], ["pack", "packed"], ["paint", "painted"],
    ["park", "parked"], ["pass", "passed"], ["play", "played"],
    ["rain", "rained"], ["relax", "relaxed"], ["rent", "rented"],
    ["snow", "snowed"], ["start", "started"], ["stay", "stayed"],
    ["stop", "stopped"], ["study", "studied"], ["talk", "talked"],
    ["travel", "traveled"], ["turn", "turned"], ["use", "used"],
    ["wait", "waited"], ["walk", "walked"], ["want", "wanted"],
    ["wash", "washed"], ["watch", "watched"], ["work", "worked"]
  ];

  const IRREGULAR = [
    ["be", "was/were"], ["buy", "bought"], ["do", "did"], ["get", "got"],
    ["go", "went"], ["have", "had"], ["leave", "left"], ["say", "said"],
    ["see", "saw"], ["send", "sent"], ["sit", "sat"], ["tell", "told"],
    ["write", "wrote"], ["come", "came"], ["drink", "drank"],
    ["drive", "drove"], ["eat", "ate"], ["fall", "fell"], ["find", "found"],
    ["give", "gave"], ["know", "knew"], ["make", "made"], ["meet", "met"],
    ["read", "read"], ["run", "ran"], ["sleep", "slept"], ["speak", "spoke"],
    ["take", "took"], ["think", "thought"], ["wear", "wore"], ["win", "won"],
    ["begin", "began"], ["break", "broke"], ["bring", "brought"],
    ["build", "built"], ["catch", "caught"], ["choose", "chose"],
    ["cut", "cut"], ["draw", "drew"], ["feel", "felt"], ["fly", "flew"],
    ["forget", "forgot"], ["hear", "heard"], ["keep", "kept"],
    ["lose", "lost"], ["pay", "paid"], ["put", "put"], ["sell", "sold"],
    ["sing", "sang"], ["stand", "stood"], ["swim", "swam"],
    ["teach", "taught"], ["understand", "understood"]
  ];

  /* =========================================================
     -ED PRONUNCIATION
     ========================================================= */

  const SOUND_T = [
    "asked", "cooked", "finished", "helped", "liked", "looked",
    "missed", "packed", "parked", "passed", "stopped", "talked",
    "walked", "watched", "washed", "worked"
  ];

  const SOUND_D = [
    "answered", "arrived", "called", "carried", "changed", "cleaned",
    "closed", "cried", "learned", "listened", "lived", "loved",
    "moved", "offered", "opened", "played", "rained", "snowed",
    "stayed", "studied", "traveled", "turned", "used"
  ];

  const SOUND_ID = [
    "decided", "hated", "invited", "needed", "painted",
    "rented", "started", "waited", "wanted"
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
    let subject, answer;

    if (singular) {
      subject = pick(["I", "He", "She", "It", "Tom", "Sara"]);
      answer = "was";
    } else {
      subject = pick(["You", "We", "They", "My parents", "The students"]);
      answer = "were";
    }

    const situations = [
      "at home", "at school", "at the hotel", "at work",
      "in the kitchen", "in the living room", "in the bedroom",
      "at the park", "at the cinema", "at the restaurant"
    ];

    const timeExpressions = [
      "last night", "this morning", "last Saturday", "last weekend",
      "on Monday", "after lunch", "before dinner", "in the evening",
      "two days ago", "last summer"
    ];

    return {
      type: "mc",
      hint: "Choose was or were",
      prompt: subject + " ____ " + pick(situations) + " " + pick(timeExpressions) + ".",
      choices: shuffle(["was", "were", "is"]),
      answer: answer
    };
  }

  /* =========================================================
     THERE WAS / THERE WERE — LEVEL 2
     ========================================================= */

  function qThereWasWere() {
    const questions = [
      { prompt: "____ a bed in the hotel room.", answer: "There was" },
      { prompt: "____ two chairs in the bedroom.", answer: "There were" },
      { prompt: "____ a TV in the living room.", answer: "There was" },
      { prompt: "____ three windows in the apartment.", answer: "There were" },
      { prompt: "____ a sofa in the living room.", answer: "There was" },
      { prompt: "____ four towels in the bathroom.", answer: "There were" },
      { prompt: "____ a shower in the bathroom.", answer: "There was" },
      { prompt: "____ two beds in the hotel room.", answer: "There were" },
      { prompt: "____ a table in the kitchen.", answer: "There was" },
      { prompt: "____ some cups in the kitchen.", answer: "There were" },
      { prompt: "____ a lamp next to the bed.", answer: "There was" },
      { prompt: "____ two pictures on the wall.", answer: "There were" },
      { prompt: "____ a fridge in the kitchen.", answer: "There was" },
      { prompt: "____ some books on the shelf.", answer: "There were" },
      { prompt: "____ a balcony at the hotel.", answer: "There was" },
      { prompt: "____ five rooms in the house.", answer: "There were" },
      { prompt: "____ a mirror in the bathroom.", answer: "There was" },
      { prompt: "____ two bathrooms in the house.", answer: "There were" },
      { prompt: "____ a swimming pool at the hotel.", answer: "There was" },
      { prompt: "____ many guests in the hotel.", answer: "There were" }
    ];

    const item = pick(questions);
    return {
      type: "mc",
      hint: "Choose There was or There were",
      prompt: item.prompt,
      choices: shuffle(["There was", "There were", "There is"]),
      answer: item.answer
    };
  }

  /* =========================================================
     WAS / WERE — LEVEL 3 (WH)
     ========================================================= */

  const WAS_WERE_WH = [
    { chunks: ["Where", "were", "you", "after work?"] },
    { chunks: ["Where", "was", "Tom", "last weekend?"] },
    { chunks: ["Why", "was", "Sara", "at home", "on Saturday?"] },
    { chunks: ["When", "were", "they", "at the hotel?"] },
    { chunks: ["Where", "were", "your parents", "last weekend?"] },
    { chunks: ["Why", "was", "he", "at school", "this morning?"] },
    { chunks: ["When", "was", "Emma", "at the party?"] },
    { chunks: ["Where", "were", "the students", "after class?"] },
    { chunks: ["Why", "were", "you", "at the hospital?"] },
    { chunks: ["Where", "was", "Sara", "on Monday evening?"] },
    { chunks: ["When", "were", "your friends", "at the cinema?"] },
    { chunks: ["Why", "was", "Tom", "in the kitchen?"] },
    { chunks: ["Where", "were", "your friends", "last night?"] },
    { chunks: ["When", "was", "your sister", "at home?"] },
    { chunks: ["Why", "were", "the children", "at the park?"] },
    { chunks: ["Where", "was", "your brother", "yesterday afternoon?"] },
    { chunks: ["When", "were", "you", "at the restaurant?"] },
    { chunks: ["Why", "was", "your mother", "at work", "on Sunday?"] }
  ];

  /* =========================================================
     REGULAR VERBS — LEVEL 1 (FIXED A1)
     ========================================================= */

  const REGULAR_L1 = [
    // Positive
    { type: "mc", hint: "Positive · regular verb", prompt: "Yesterday I ____ at home. (stay)", choices: ["stayed", "stay", "stayeded"], answer: "stayed" },
    { type: "mc", hint: "Positive · regular verb", prompt: "Last night she ____ dinner. (cook)", choices: ["cooked", "cook", "cookked"], answer: "cooked" },
    { type: "mc", hint: "Positive · regular verb", prompt: "Last weekend they ____ football. (play)", choices: ["played", "play", "playyed"], answer: "played" },
    { type: "mc", hint: "Positive · regular verb", prompt: "He ____ the window yesterday. (close)", choices: ["closed", "close", "closede"], answer: "closed" },
    { type: "mc", hint: "Positive · regular verb", prompt: "We ____ the hotel last month. (book)", choices: ["booked", "book", "bookked"], answer: "booked" },

    // Negative
    { type: "mc", hint: "Negative · regular verb", prompt: "I ____ it yesterday. (need)", choices: ["didn't need", "didn't needed", "doesn't need"], answer: "didn't need" },
    { type: "mc", hint: "Negative · regular verb", prompt: "She ____ the door. (open)", choices: ["didn't open", "didn't opened", "doesn't open"], answer: "didn't open" },
    { type: "mc", hint: "Negative · regular verb", prompt: "They ____ the car. (park)", choices: ["didn't park", "didn't parked", "doesn't park"], answer: "didn't park" },
    { type: "mc", hint: "Negative · regular verb", prompt: "He ____ help. (want)", choices: ["didn't want", "didn't wanted", "doesn't want"], answer: "didn't want" },
    { type: "mc", hint: "Negative · regular verb", prompt: "We ____ the dishes. (wash)", choices: ["didn't wash", "didn't washed", "doesn't wash"], answer: "didn't wash" },

    // Questions
    { type: "mc", hint: "Question · regular verb", prompt: "____ you ____ English yesterday? (study)", choices: ["Did / study", "Did / studied", "Do / study"], answer: "Did / study" },
    { type: "mc", hint: "Question · regular verb", prompt: "____ she ____ the room? (clean)", choices: ["Did / clean", "Did / cleaned", "Does / clean"], answer: "Did / clean" },
    { type: "mc", hint: "Question · regular verb", prompt: "____ they ____ the window? (close)", choices: ["Did / close", "Did / closed", "Do / close"], answer: "Did / close" },
    { type: "mc", hint: "Question · regular verb", prompt: "____ he ____ the hotel? (book)", choices: ["Did / book", "Did / booked", "Does / book"], answer: "Did / book" },
    { type: "mc", hint: "Question · regular verb", prompt: "____ you ____ at home last night? (stay)", choices: ["Did / stay", "Did / stayed", "Do / stay"], answer: "Did / stay" }
  ];

  /* =========================================================
     REGULAR VERBS — LEVEL 2 (WH)
     ========================================================= */

  const REGULAR_WH = [
    { chunks: ["When", "did", "you", "finish", "your homework?"] },
    { chunks: ["Where", "did", "you", "stay", "last weekend?"] },
    { chunks: ["Why", "did", "she", "close", "the window?"] },
    { chunks: ["When", "did", "they", "clean", "the room?"] },
    { chunks: ["Where", "did", "he", "park", "the car?"] },
    { chunks: ["Why", "did", "you", "open", "the door?"] },
    { chunks: ["When", "did", "she", "book", "the hotel?"] },
    { chunks: ["Where", "did", "they", "travel", "last summer?"] },
    { chunks: ["Why", "did", "he", "change", "his plan?"] },
    { chunks: ["When", "did", "you", "start", "your job?"] },
    { chunks: ["Where", "did", "she", "work", "last year?"] },
    { chunks: ["Why", "did", "they", "call", "you?"] },
    { chunks: ["When", "did", "he", "arrive", "at the hotel?"] },
    { chunks: ["Where", "did", "you", "live", "before?"] },
    { chunks: ["Why", "did", "she", "wash", "the dishes?"] },
    { chunks: ["When", "did", "they", "move", "to the new house?"] },
    { chunks: ["Where", "did", "he", "play", "football?"] },
    { chunks: ["Why", "did", "you", "need", "help?"] }
  ];

  /* =========================================================
     REGULAR VERBS — LEVEL 3 (PRONUNCIATION)
     ========================================================= */

  function qRegSound() {
    const groups = [
      { list: SOUND_T },
      { list: SOUND_D },
      { list: SOUND_ID }
    ];
    const mainIdx = Math.floor(Math.random() * 3);
    const oddIdx = (mainIdx + 1 + Math.floor(Math.random() * 2)) % 3;
    const main = shuffle(groups[mainIdx].list).slice(0, 3);
    const odd = pick(groups[oddIdx].list);

    return {
      type: "mc",
      hint: "Which past form has a different -ed sound?",
      prompt: "Find the different pronunciation.",
      choices: shuffle(main.concat([odd])),
      answer: odd
    };
  }

  /* =========================================================
     IRREGULAR VERBS — LEVEL 1 (FIXED A1)
     ========================================================= */

  const IRREGULAR_L1 = [
    // Positive
    { type: "mc", hint: "Positive · irregular verb", prompt: "Yesterday I ____ home. (go)", choices: ["went", "go", "goed"], answer: "went" },
    { type: "mc", hint: "Positive · irregular verb", prompt: "Last night she ____ pizza. (eat)", choices: ["ate", "eat", "eated"], answer: "ate" },
    { type: "mc", hint: "Positive · irregular verb", prompt: "They ____ a new car last month. (buy)", choices: ["bought", "buy", "buyed"], answer: "bought" },
    { type: "mc", hint: "Positive · irregular verb", prompt: "He ____ the book on the table. (put)", choices: ["put", "putted", "puts"], answer: "put" },
    { type: "mc", hint: "Positive · irregular verb", prompt: "We ____ our friends yesterday. (meet)", choices: ["met", "meet", "meeted"], answer: "met" },

    // Negative
    { type: "mc", hint: "Negative · irregular verb", prompt: "I ____ the homework. (do)", choices: ["didn't do", "didn't did", "doesn't do"], answer: "didn't do" },
    { type: "mc", hint: "Negative · irregular verb", prompt: "She ____ early. (leave)", choices: ["didn't leave", "didn't left", "doesn't leave"], answer: "didn't leave" },
    { type: "mc", hint: "Negative · irregular verb", prompt: "They ____ the bus. (take)", choices: ["didn't take", "didn't took", "doesn't take"], answer: "didn't take" },
    { type: "mc", hint: "Negative · irregular verb", prompt: "He ____ home late. (get)", choices: ["didn't get", "didn't got", "doesn't get"], answer: "didn't get" },
    { type: "mc", hint: "Negative · irregular verb", prompt: "We ____ any water. (drink)", choices: ["didn't drink", "didn't drank", "doesn't drink"], answer: "didn't drink" },

    // Questions
    { type: "mc", hint: "Question · irregular verb", prompt: "____ you ____ to the park? (go)", choices: ["Did / go", "Did / went", "Do / go"], answer: "Did / go" },
    { type: "mc", hint: "Question · irregular verb", prompt: "____ she ____ breakfast? (eat)", choices: ["Did / eat", "Did / ate", "Does / eat"], answer: "Did / eat" },
    { type: "mc", hint: "Question · irregular verb", prompt: "____ they ____ the keys? (find)", choices: ["Did / find", "Did / found", "Do / find"], answer: "Did / find" },
    { type: "mc", hint: "Question · irregular verb", prompt: "____ he ____ a taxi? (take)", choices: ["Did / take", "Did / took", "Does / take"], answer: "Did / take" },
    { type: "mc", hint: "Question · irregular verb", prompt: "____ you ____ your friend yesterday? (see)", choices: ["Did / see", "Did / saw", "Do / see"], answer: "Did / see" }
  ];

  /* =========================================================
     IRREGULAR VERBS — LEVEL 2 (WH)
     ========================================================= */

  const IRREGULAR_WH = [
    { chunks: ["Where", "did", "you", "go", "last weekend?"] },
    { chunks: ["What", "did", "she", "eat", "for breakfast?"] },
    { chunks: ["When", "did", "they", "come", "home?"] },
    { chunks: ["Where", "did", "he", "put", "the book?"] },
    { chunks: ["What", "did", "you", "buy", "at the store?"] },
    { chunks: ["Why", "did", "she", "leave", "early?"] },
    { chunks: ["When", "did", "you", "meet", "your friend?"] },
    { chunks: ["What", "did", "he", "have", "for lunch?"] },
    { chunks: ["Where", "did", "they", "sleep", "last night?"] },
    { chunks: ["What", "did", "she", "make", "for dinner?"] },
    { chunks: ["When", "did", "he", "get", "home?"] },
    { chunks: ["Why", "did", "they", "take", "the bus?"] },
    { chunks: ["Where", "did", "she", "find", "her keys?"] },
    { chunks: ["What", "did", "you", "drink", "with dinner?"] },
    { chunks: ["When", "did", "your parents", "come", "home?"] },
    { chunks: ["Where", "did", "he", "leave", "his bag?"] },
    { chunks: ["Why", "did", "you", "take", "a taxi?"] },
    { chunks: ["What", "did", "they", "see", "at the museum?"] }
  ];

  /* =========================================================
     MODES
     ========================================================= */

  const MODES = {
    ww1:        { label: "Was / Were · Level 1",           build: qWasWere },
    ww2:        { label: "There was / were · Level 2",     build: qThereWasWere },
    ww3:        { label: "Was / Were · Wh- questions",     build: null },
    reg1:       { label: "Regular · Level 1",              build: null },
    reg2:       { label: "Regular · Wh- questions",        build: null },
    "reg-sound":{ label: "Regular · Pronunciation",        build: qRegSound },
    irr1:       { label: "Irregular · Level 1",            build: null },
    irr2:       { label: "Irregular · Wh- questions",      build: null }
  };

  /* =========================================================
     UI ELEMENTS
     ========================================================= */

  const menuScreen   = document.getElementById("menuScreen");
  const playScreen   = document.getElementById("playScreen");
  const resultScreen = document.getElementById("resultScreen");
  const choicesArea  = document.getElementById("choicesArea");
  const matchArea    = document.getElementById("matchArea");
  const matchLeft    = document.getElementById("matchLeft");
  const matchRight   = document.getElementById("matchRight");
  const feedbackEl   = document.getElementById("feedback");
  const promptHint   = document.getElementById("promptHint");
  const promptText   = document.getElementById("promptText");
  const modeLabel    = document.getElementById("modeLabel");
  const scoreEl      = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");

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
    if (name === "menu")   menuScreen.classList.remove("hidden");
    if (name === "play")   playScreen.classList.remove("hidden");
    if (name === "result") resultScreen.classList.remove("hidden");
  }

  function updateProgress() {
    if (progressFill) {
      progressFill.style.width = Math.round((index / TOTAL) * 100) + "%";
    }
  }

  /* =========================================================
     START MODE
     ========================================================= */

  function startMode(key) {
    modeKey = key;
    const mode = MODES[key];
    if (!mode) return;

    queue = [];

    // Fixed unique questions (no repeats)
    if (key === "ww3" || key === "reg1" || key === "reg2" || key === "irr1" || key === "irr2") {
      let source;
      if (key === "ww3")  source = WAS_WERE_WH;
      if (key === "reg1") source = REGULAR_L1;
      if (key === "reg2") source = REGULAR_WH;
      if (key === "irr1") source = IRREGULAR_L1;
      if (key === "irr2") source = IRREGULAR_WH;

      const unique = shuffle(source.slice()).slice(0, TOTAL);

      unique.forEach(function (item) {
        if (item.chunks) {
          // Wh- question assembly
          queue.push({
            type: "assemble",
            hint: "Build the correct Wh- question",
            prompt: "Put the chunks in the correct order.",
            chunks: item.chunks.slice(),
            displayChunks: shuffle(item.chunks.slice())
          });
        } else {
          // Multiple choice
          queue.push({
            type: "mc",
            hint: item.hint,
            prompt: item.prompt,
            choices: shuffle(item.choices.slice()),
            answer: item.answer
          });
        }
      });
    } else {
      // Random modes
      for (let i = 0; i < TOTAL; i++) {
        queue.push(mode.build());
      }
    }

    index = 0;
    score = 0;
    correct = 0;
    wrong = 0;

    if (modeLabel) modeLabel.textContent = mode.label;
    if (scoreEl) scoreEl.textContent = "0";

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
    feedbackEl.className = "feedback";

    const item = queue[index];
    if (!item) return;

    updateProgress();
    promptHint.textContent = item.hint;
    promptText.textContent = item.prompt;

    if (matchArea) {
      matchArea.classList.add("hidden");
      matchArea.style.display = "";
    }

    if (item.type === "assemble") {
      choicesArea.classList.remove("hidden");
      renderAssembly(item);
      return;
    }

    choicesArea.classList.remove("hidden");
    renderChoices(item);
  }

  /* =========================================================
     MULTIPLE CHOICE
     ========================================================= */

  function renderChoices(item) {
    choicesArea.innerHTML = "";
    choicesArea.classList.remove("mk-stagger-fast");
    void choicesArea.offsetWidth;
    choicesArea.classList.add("mk-stagger-fast");

    item.choices.forEach(function (choice) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice;
      btn.addEventListener("click", function () {
        onChoice(choice, item.answer, btn);
      });
      choicesArea.appendChild(btn);
    });
  }

  function onChoice(choice, answer, btn) {
    if (locked) return;
    locked = true;

    const ok = choice === answer;

    document.querySelectorAll(".choice-btn").forEach(function (button) {
      button.disabled = true;
      if (button.textContent === answer) button.classList.add("correct");
    });

    if (ok) {
      btn.classList.add("correct");
      score += 10;
      correct += 1;
      feedbackEl.textContent = "Correct!";
      feedbackEl.className = "feedback ok";
    } else {
      btn.classList.add("wrong");
      wrong += 1;
      feedbackEl.textContent = "Answer: " + answer;
      feedbackEl.className = "feedback bad";
    }

    if (scoreEl) scoreEl.textContent = String(score);

    setTimeout(function () {
      index += 1;
      if (index >= TOTAL) endRound();
      else loadItem();
    }, ok ? 650 : 1300);
  }

  /* =========================================================
     SENTENCE ASSEMBLY
     ========================================================= */

  function renderAssembly(item) {
    choicesArea.innerHTML = "";
    choicesArea.classList.remove("mk-stagger-fast");

    assemblySelected = [];
    const display = item.displayChunks || item.chunks;

    assemblyAvailable = display.map(function (chunk, i) {
      return { id: i, text: chunk };
    });
    assemblyAnswer = item.chunks.slice();

    const wrapper = document.createElement("div");
    wrapper.className = "question-builder";

    const answerTitle = document.createElement("div");
    answerTitle.className = "builder-label";
    answerTitle.textContent = "Build the question:";

    const answerBox = document.createElement("div");
    answerBox.className = "builder-answer";
    answerBox.id = "builderAnswer";

    const chunksBox = document.createElement("div");
    chunksBox.className = "builder-chunks";
    chunksBox.id = "builderChunks";

    wrapper.appendChild(answerTitle);
    wrapper.appendChild(answerBox);
    wrapper.appendChild(chunksBox);
    choicesArea.appendChild(wrapper);

    renderAssemblyChunks();
    renderAssemblyAnswer();
  }

  function renderAssemblyChunks() {
    const chunksBox = document.getElementById("builderChunks");
    if (!chunksBox) return;
    chunksBox.innerHTML = "";

    assemblyAvailable.forEach(function (chunk) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn assembly-chip";
      btn.textContent = chunk.text;
      btn.addEventListener("click", function () {
        selectAssemblyChunk(chunk.id);
      });
      chunksBox.appendChild(btn);
    });
  }

  function renderAssemblyAnswer() {
    const answerBox = document.getElementById("builderAnswer");
    if (!answerBox) return;
    answerBox.innerHTML = "";

    if (assemblySelected.length === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "builder-placeholder";
      placeholder.textContent = "Tap the chunks below to build the question.";
      answerBox.appendChild(placeholder);
      return;
    }

    assemblySelected.forEach(function (chunk, idx) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "assembly-answer-chip";
      btn.textContent = chunk.text;
      btn.title = "Tap to remove";
      btn.addEventListener("click", function () {
        removeAssemblyChunk(idx);
      });
      answerBox.appendChild(btn);
    });
  }

  function selectAssemblyChunk(id) {
    if (assemblyLocked) return;
    const idx = assemblyAvailable.findIndex(function (c) { return c.id === id; });
    if (idx === -1) return;

    assemblySelected.push(assemblyAvailable[idx]);
    assemblyAvailable.splice(idx, 1);

    renderAssemblyChunks();
    renderAssemblyAnswer();

    if (assemblySelected.length === assemblyAnswer.length) {
      checkAssembly();
    }
  }

  function removeAssemblyChunk(answerIndex) {
    if (assemblyLocked) return;
    const removed = assemblySelected.splice(answerIndex, 1)[0];
    if (removed) assemblyAvailable.push(removed);
    renderAssemblyChunks();
    renderAssemblyAnswer();
  }

  function normalizeAssembly(arr) {
    return arr.join(" ").replace(/\s+([?.!,])/g, "$1").trim().toLowerCase();
  }

  function checkAssembly() {
    if (assemblyLocked) return;
    assemblyLocked = true;

    const userAnswer = normalizeAssembly(assemblySelected.map(function (x) { return x.text; }));
    const correctAnswer = normalizeAssembly(assemblyAnswer);
    const ok = userAnswer === correctAnswer;
    const answerBox = document.getElementById("builderAnswer");

    if (ok) {
      score += 10;
      correct += 1;
      if (answerBox) answerBox.classList.add("correct");
      feedbackEl.textContent = "Correct!";
      feedbackEl.className = "feedback ok";
      if (scoreEl) scoreEl.textContent = String(score);
      setTimeout(nextQuestion, 700);
    } else {
      wrong += 1;
      if (answerBox) answerBox.classList.add("wrong");
      feedbackEl.textContent = "Correct answer: " + assemblyAnswer.join(" ");
      feedbackEl.className = "feedback bad";
      setTimeout(nextQuestion, 1600);
    }
  }

  function nextQuestion() {
    index += 1;
    if (index >= TOTAL) endRound();
    else loadItem();
  }

  /* =========================================================
     END ROUND
     ========================================================= */

  function endRound() {
    if (progressFill) progressFill.style.width = "100%";
    document.getElementById("finalScore").textContent = String(score);
    document.getElementById("finalCorrect").textContent = String(correct);
    document.getElementById("finalWrong").textContent = String(wrong);
    document.getElementById("finalAccuracy").textContent =
      (TOTAL ? Math.round((correct / TOTAL) * 100) : 0) + "%";
    show("result");
  }

  /* =========================================================
     MENU BUTTONS
     ========================================================= */

  document.querySelectorAll(".level-list li").forEach(function (li) {
    li.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      const mode = li.getAttribute("data-mode");
      if (mode && MODES[mode]) startMode(mode);
    });
  });

  const backMenu = document.getElementById("backMenu");
  if (backMenu) {
    backMenu.addEventListener("click", function () {
      show("menu");
    });
  }

  const toMenuBtn = document.getElementById("toMenuBtn");
  if (toMenuBtn) {
    toMenuBtn.addEventListener("click", function () {
      show("menu");
    });
  }

  const playAgainBtn = document.getElementById("playAgainBtn");
  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", function () {
      if (modeKey) startMode(modeKey);
    });
  }

  /* =========================================================
     THEME
     ========================================================= */

  function syncSiteTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.body.classList.toggle("light-mode", !dark);
  }
  syncSiteTheme();
  window.addEventListener("site-theme-change", syncSiteTheme);
  try {
    new MutationObserver(syncSiteTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  } catch (_) {}

  /* =========================================================
     START
     ========================================================= */

  show("menu");
})();
