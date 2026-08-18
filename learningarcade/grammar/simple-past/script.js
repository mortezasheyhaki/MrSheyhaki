/* Simple Past — Was/Were · Regular · Irregular */
(function () {
  "use strict";

  const TOTAL = 10;

  /* ---------- DATA ---------- */
  const REGULAR = [
    ["answer","answered"],["arrive","arrived"],["ask","asked"],["book","booked"],
    ["call","called"],["carry","carried"],["change","changed"],["check in","checked in"],
    ["clean","cleaned"],["close","closed"],["cook","cooked"],["cry","cried"],
    ["decide","decided"],["finish","finished"],["hate","hated"],["help","helped"],
    ["invite","invited"],["learn","learned"],["like","liked"],["listen","listened"],
    ["live","lived"],["look","looked"],["love","loved"],["miss","missed"],
    ["move","moved"],["need","needed"],["offer","offered"],["open","opened"],
    ["pack","packed"],["paint","painted"],["park","parked"],["pass","passed"],
    ["play","played"],["rain","rained"],["relax","relaxed"],["rent","rented"],
    ["snow","snowed"],["start","started"],["stay","stayed"],["stop","stopped"],
    ["study","studied"],["talk","talked"],["travel","traveled"],["turn","turned"],
    ["use","used"],["wait","waited"],["walk","walked"],["want","wanted"],
    ["wash","washed"],["watch","watched"],["work","worked"]
  ];

  const IRREGULAR = [
    ["be","was/were"],["buy","bought"],["do","did"],["get","got"],["go","went"],
    ["have","had"],["leave","left"],["say","said"],["see","saw"],["send","sent"],
    ["sit","sat"],["tell","told"],["write","wrote"]
  ];

  // Pronunciation groups (ed endings)
  // /t/ after unvoiced, /d/ after voiced, /ɪd/ after t/d
  const SOUND_T = ["asked","cooked","finished","helped","liked","looked","missed","packed","parked","passed","stopped","talked","walked","watched","washed","worked"];
  const SOUND_D = ["answered","arrived","called","carried","changed","cleaned","closed","cried","learned","listened","lived","loved","moved","offered","opened","played","rained","snowed","stayed","studied","traveled","turned","used"];
  const SOUND_ID = ["decided","hated","invited","needed","painted","rented","started","waited","wanted"];

  const PEOPLE = ["I","You","He","She","We","They"];
  const NAMES = ["Tom","Sara","Ali","Emma","My parents","The students"];
  const PLACES = ["home","school","the park","the office","the gym","work","the cinema"];
  const WH = ["Where","When","Why","Who","What","How"];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) {
    const x = a.slice();
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }
    return x;
  }

  /* ---------- QUESTION BUILDERS ---------- */
  function qWasWere() {
    const subj = pick(["I","He","She","It","Tom","Sara"]);
    const place = pick(PLACES);
    const correct = (subj === "I" || subj === "He" || subj === "She" || subj === "It" || subj === "Tom" || subj === "Sara") ? "was" : "were";
    // always singular subjects above → was; add plural variants
    const usePlural = Math.random() < 0.45;
    let s, ans;
    if (usePlural) {
      s = pick(["You","We","They","My parents","The students"]);
      ans = "were";
    } else {
      s = subj;
      ans = "was";
    }
    return {
      type: "mc",
      hint: "Choose was or were",
      prompt: s + " ____ at " + place + " yesterday.",
      choices: shuffle(["was","were"]),
      answer: ans
    };
  }

  function qThereWasWere() {
    const singular = Math.random() < 0.5;
    if (singular) {
      const noun = pick(["a book","a party","a problem","a message","an email","a meeting"]);
      return {
        type: "mc",
        hint: "There was / There were",
        prompt: "____ " + noun + " on the table.",
        choices: shuffle(["There was","There were"]),
        answer: "There was"
      };
    }
    const noun = pick(["two books","many people","some problems","three messages","a lot of cars"]);
    return {
      type: "mc",
      hint: "There was / There were",
      prompt: "____ " + noun + " outside.",
      choices: shuffle(["There was","There were"]),
      answer: "There were"
    };
  }

  function qWasWereWh() {
    const who = pick(["you","he","she","they","Tom"]);
    const be = (who === "you" || who === "they") ? "were" : "was";
    const wh = pick(["Where","When","Why"]);
    return {
      type: "mc",
      hint: "Wh- question with was / were",
      prompt: "____ " + who + " last night?",
      choices: shuffle([
        wh + " " + be + " " + who,
        wh + " " + (be === "was" ? "were" : "was") + " " + who,
        wh + " is " + who,
        "Was " + who + " where"
      ].map((c, i) => i === 0 ? c + "?" : c.includes("?") ? c : c + "?")),
      answer: wh + " " + be + " " + who + "?"
    };
  }

  function qRegLevel1() {
    const [base, past] = pick(REGULAR);
    const form = pick(["pos","neg","q"]);
    const subj = pick(["I","You","He","She","We","They"]);
    if (form === "pos") {
      return {
        type: "mc",
        hint: "Positive · regular verb",
        prompt: "Yesterday " + subj.toLowerCase() + " ____ the room. (" + base + ")",
        choices: shuffle([past, base, base + "ed", "did " + base]),
        answer: past
      };
    }
    if (form === "neg") {
      return {
        type: "mc",
        hint: "Negative · regular verb",
        prompt: subj + " ____ the movie. (" + base + ")",
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
      prompt: "____ you ____ English yesterday? (" + base + ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Do / " + base,
        "Was / " + past
      ]),
      answer: "Did / " + base
    };
  }

  function qRegWh() {
    const [base, past] = pick(REGULAR);
    const wh = pick(["Where","When","Why","What"]);
    return {
      type: "mc",
      hint: "Wh- question · regular verb",
      prompt: "Make a question: " + wh + " / you / " + base + " / yesterday",
      choices: shuffle([
        wh + " did you " + base + " yesterday?",
        wh + " did you " + past + " yesterday?",
        wh + " do you " + base + " yesterday?",
        wh + " you " + past + " yesterday?"
      ]),
      answer: wh + " did you " + base + " yesterday?"
    };
  }

  function qRegSound() {
    // Pick three from one group and one odd from another
    const groups = [
      { name: "/t/", list: SOUND_T },
      { name: "/d/", list: SOUND_D },
      { name: "/ɪd/", list: SOUND_ID }
    ];
    const mainIdx = Math.floor(Math.random() * 3);
    const oddIdx = (mainIdx + 1 + Math.floor(Math.random() * 2)) % 3;
    const main = shuffle(groups[mainIdx].list).slice(0, 3);
    const odd = pick(groups[oddIdx].list);
    const options = shuffle(main.concat([odd]));
    return {
      type: "mc",
      hint: "Which past form has a different -ed sound?",
      prompt: "Find the different pronunciation",
      choices: options,
      answer: odd
    };
  }

  function qIrrLevel1() {
    // skip be for sentence fill simplicity except was/were already covered
    const pool = IRREGULAR.filter((x) => x[0] !== "be");
    const [base, past] = pick(pool);
    const form = pick(["pos","neg","q"]);
    const subj = pick(["I","You","He","She","We","They"]);
    if (form === "pos") {
      return {
        type: "mc",
        hint: "Positive · irregular verb",
        prompt: "Yesterday " + subj.toLowerCase() + " ____ home. (" + base + ")",
        choices: shuffle([past, base, base + "ed", "did " + base]),
        answer: past
      };
    }
    if (form === "neg") {
      return {
        type: "mc",
        hint: "Negative · irregular verb",
        prompt: subj + " ____ the homework. (" + base + ")",
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
      prompt: "____ she ____ it? (" + base + ")",
      choices: shuffle([
        "Did / " + base,
        "Did / " + past,
        "Does / " + base,
        "Was / " + past
      ]),
      answer: "Did / " + base
    };
  }

  function qIrrWh() {
    const pool = IRREGULAR.filter((x) => x[0] !== "be");
    const [base] = pick(pool);
    const wh = pick(["Where","When","Why","What"]);
    return {
      type: "mc",
      hint: "Wh- question · irregular verb",
      prompt: "Make a question: " + wh + " / they / " + base,
      choices: shuffle([
        wh + " did they " + base + "?",
        wh + " did they " + pick(pool)[1] + "?",
        wh + " do they " + base + "?",
        wh + " they " + base + "?"
      ]),
      answer: wh + " did they " + base + "?"
    };
  }

  function qIrrMatch() {
    const pairs = shuffle(IRREGULAR.filter((x) => x[0] !== "be")).slice(0, 4);
    return {
      type: "match",
      hint: "Match base form → past form",
      prompt: "Match the verbs",
      pairs: pairs.map(([b, p]) => ({ left: b, right: p }))
    };
  }

  const MODES = {
    ww1: { label: "Was / Were · Level 1", build: qWasWere },
    ww2: { label: "There was / were · Level 2", build: qThereWasWere },
    ww3: { label: "Was / Were · Wh- questions", build: qWasWereWh },
    reg1: { label: "Regular · Level 1", build: qRegLevel1 },
    reg2: { label: "Regular · Wh- questions", build: qRegWh },
    "reg-sound": { label: "Regular · Pronunciation", build: qRegSound },
    irr1: { label: "Irregular · Level 1", build: qIrrLevel1 },
    irr2: { label: "Irregular · Wh- questions", build: qIrrWh },
    "irr-match": { label: "Irregular · Matching", build: qIrrMatch },
  };



  /* ---------- UI / STATE ---------- */
  const menuScreen = document.getElementById("menuScreen");
  const playScreen = document.getElementById("playScreen");
  const resultScreen = document.getElementById("resultScreen");
  const choicesArea = document.getElementById("choicesArea");
  const matchArea = document.getElementById("matchArea");
  const matchLeft = document.getElementById("matchLeft");
  const matchRight = document.getElementById("matchRight");
  const feedbackEl = document.getElementById("feedback");
  const promptHint = document.getElementById("promptHint");
  const promptText = document.getElementById("promptText");
  const modeLabel = document.getElementById("modeLabel");
  const scoreEl = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");

  let modeKey = null;
  let queue = [];
  let index = 0;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let locked = false;
  let matchSel = { left: null, right: null };
  let matchDone = 0;
  let matchTotal = 0;
  let matchMap = {};

  function show(name) {
    menuScreen.classList.add("hidden");
    playScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    if (name === "menu") menuScreen.classList.remove("hidden");
    if (name === "play") playScreen.classList.remove("hidden");
    if (name === "result") resultScreen.classList.remove("hidden");
  }

  function updateProgress() {
    if (!progressFill) return;
    progressFill.style.width = Math.round((index / TOTAL) * 100) + "%";
  }

  function startMode(key) {
    modeKey = key;
    const mode = MODES[key];
    queue = [];
    for (let i = 0; i < TOTAL; i++) queue.push(mode.build());
    index = 0;
    score = 0;
    correct = 0;
    wrong = 0;
    if (modeLabel) modeLabel.textContent = mode.label;
    if (scoreEl) scoreEl.textContent = "0";
    show("play");
    loadItem();
  }

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
      matchArea.classList.remove("hidden");
      setupMatch(item);
    } else {
      matchArea.classList.add("hidden");
      choicesArea.classList.remove("hidden");
      renderChoices(item);
    }
  }

  function renderChoices(item) {
    choicesArea.innerHTML = "";
    // restart stagger animation
    choicesArea.classList.remove("mk-stagger-fast");
    void choicesArea.offsetWidth;
    choicesArea.classList.add("mk-stagger-fast");
    item.choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = c;
      btn.addEventListener("click", () => onChoice(c, item.answer, btn));
      choicesArea.appendChild(btn);
    });
  }

  function onChoice(choice, answer, btn) {
    if (locked) return;
    locked = true;
    const ok = choice === answer;
    document.querySelectorAll(".choice-btn").forEach((b) => {
      b.disabled = true;
      if (b.textContent === answer) b.classList.add("correct");
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
    setTimeout(() => {
      index += 1;
      if (index >= TOTAL) endRound();
      else loadItem();
    }, ok ? 650 : 1300);
  }

  function setupMatch(item) {
    matchSel = { left: null, right: null };
    matchDone = 0;
    matchTotal = item.pairs.length;
    matchMap = {};
    item.pairs.forEach((p) => { matchMap[p.left] = p.right; });
    const lefts = shuffle(item.pairs.map((p) => p.left));
    const rights = shuffle(item.pairs.map((p) => p.right));
    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";
    lefts.forEach((w) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "match-chip";
      b.textContent = w;
      b.dataset.side = "left";
      b.dataset.val = w;
      b.addEventListener("click", () => onMatchPick(b));
      matchLeft.appendChild(b);
    });
    rights.forEach((w) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "match-chip";
      b.textContent = w;
      b.dataset.side = "right";
      b.dataset.val = w;
      b.addEventListener("click", () => onMatchPick(b));
      matchRight.appendChild(b);
    });
  }

  function onMatchPick(btn) {
    if (locked || btn.classList.contains("matched")) return;
    const side = btn.dataset.side;
    document.querySelectorAll('.match-chip[data-side="' + side + '"]').forEach((b) => {
      if (!b.classList.contains("matched")) b.classList.remove("selected");
    });
    btn.classList.add("selected");
    matchSel[side] = btn;
    if (matchSel.left && matchSel.right) {
      const L = matchSel.left.dataset.val;
      const R = matchSel.right.dataset.val;
      if (matchMap[L] === R) {
        matchSel.left.classList.add("matched");
        matchSel.right.classList.add("matched");
        matchSel.left.classList.remove("selected");
        matchSel.right.classList.remove("selected");
        matchDone += 1;
        score += 10;
        if (scoreEl) scoreEl.textContent = String(score);
        feedbackEl.textContent = "Matched!";
        feedbackEl.className = "feedback ok";
        matchSel = { left: null, right: null };
        if (matchDone >= matchTotal) {
          correct += 1;
          locked = true;
          setTimeout(() => {
            index += 1;
            if (index >= TOTAL) endRound();
            else loadItem();
          }, 600);
        }
      } else {
        matchSel.left.classList.add("wrong-flash");
        matchSel.right.classList.add("wrong-flash");
        feedbackEl.textContent = "Try again";
        feedbackEl.className = "feedback bad";
        const a = matchSel.left, b = matchSel.right;
        matchSel = { left: null, right: null };
        setTimeout(() => {
          a.classList.remove("selected", "wrong-flash");
          b.classList.remove("selected", "wrong-flash");
        }, 400);
      }
    }
  }

  function endRound() {
    if (progressFill) progressFill.style.width = "100%";
    document.getElementById("finalScore").textContent = String(score);
    document.getElementById("finalCorrect").textContent = String(correct);
    document.getElementById("finalWrong").textContent = String(wrong);
    document.getElementById("finalAccuracy").textContent =
      (TOTAL ? Math.round((correct / TOTAL) * 100) : 0) + "%";
    show("result");
  }

  document.querySelectorAll(".level-list li").forEach((li) => {
    li.addEventListener("click", () => {
      const mode = li.getAttribute("data-mode");
      if (mode && MODES[mode]) startMode(mode);
    });
  });

  const backMenu = document.getElementById("backMenu");
  if (backMenu) backMenu.addEventListener("click", () => show("menu"));
  document.getElementById("toMenuBtn").addEventListener("click", () => show("menu"));
  document.getElementById("playAgainBtn").addEventListener("click", () => {
    if (modeKey) startMode(modeKey);
  });

  // Follow site theme (theme.js sets data-theme on <html>)
  function syncSiteTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.body.classList.toggle("light-mode", !dark);
  }
  syncSiteTheme();
  window.addEventListener("site-theme-change", syncSiteTheme);
  // Also observe attribute changes
  try {
    new MutationObserver(syncSiteTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  } catch (_) {}

  show("menu");
})();
