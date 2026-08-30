/* Family Tree quiz — Joe + Angela */

(function () {
  "use strict";

  const GAME_ID = "vocab-family-tree";

  const TREES = {
    joe: {
      name: "Joe's family",
      img: "images/joe-tree.png",
      items: [
        {
          q: "Who's Will?",
          answer: "He's Joe's brother.",
          distractors: ["He's Joe's father.", "He's Joe's son.", "He's Joe's uncle."]
        },
        {
          q: "Who's Anna?",
          answer: "She's Joe's sister.",
          distractors: ["She's Joe's mother.", "She's Joe's wife.", "She's Joe's daughter."]
        },
        {
          q: "Who's Kate?",
          answer: "She's Joe's wife.",
          distractors: ["She's Joe's sister.", "She's Joe's mother.", "She's Joe's daughter."]
        },
        {
          q: "Who's Mike?",
          answer: "He's Joe's son.",
          distractors: ["He's Joe's brother.", "He's Joe's father.", "He's Joe's uncle."]
        },
        {
          q: "Who's John?",
          answer: "He's Joe's father.",
          distractors: ["He's Joe's grandfather.", "He's Joe's brother.", "He's Joe's uncle."]
        },
        {
          q: "Who's Sally?",
          answer: "She's Joe's mother.",
          distractors: ["She's Joe's grandmother.", "She's Joe's sister.", "She's Joe's wife."]
        },
        {
          q: "Who's Alfred?",
          answer: "He's Joe's grandfather.",
          distractors: ["He's Joe's father.", "He's Joe's uncle.", "He's Joe's brother."]
        },
        {
          q: "Who's Mary?",
          answer: "She's Joe's grandmother.",
          distractors: ["She's Joe's mother.", "She's Joe's aunt.", "She's Joe's sister."]
        }
      ]
    },
    angela: {
      name: "Angela's family",
      img: "images/angela-tree.png",
      items: [
        {
          q: "Who's Dan?",
          answer: "He's Angela's husband.",
          distractors: ["He's Angela's brother.", "He's Angela's father.", "He's Angela's son."]
        },
        {
          q: "Who's Amy?",
          answer: "She's Angela's daughter.",
          distractors: ["She's Angela's sister.", "She's Angela's mother.", "She's Angela's aunt."]
        },
        {
          q: "Who's Tom?",
          answer: "He's Angela's brother.",
          distractors: ["He's Angela's husband.", "He's Angela's father.", "He's Angela's son."]
        },
        {
          q: "Who's Beth?",
          answer: "She's Angela's sister.",
          distractors: ["She's Angela's mother.", "She's Angela's daughter.", "She's Angela's grandmother."]
        },
        {
          q: "Who's Ruth?",
          answer: "She's Angela's mother.",
          distractors: ["She's Angela's grandmother.", "She's Angela's sister.", "She's Angela's aunt."]
        },
        {
          q: "Who's Adam?",
          answer: "He's Angela's father.",
          distractors: ["He's Angela's grandfather.", "He's Angela's brother.", "He's Angela's husband."]
        },
        {
          q: "Who's Ben?",
          answer: "He's Angela's grandfather.",
          distractors: ["He's Angela's father.", "He's Angela's uncle.", "He's Angela's brother."]
        },
        {
          q: "Who's Lucy?",
          answer: "She's Angela's grandmother.",
          distractors: ["She's Angela's mother.", "She's Angela's aunt.", "She's Angela's sister."]
        }
      ]
    }
  };

  let queue = []; // {treeKey, item}
  let index = 0;
  let score = 0;
  let selected = null;
  let locked = false;
  let currentTreeKey = "joe";

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const playScreen = $("playScreen");
  const questionText = $("questionText");
  const optionsEl = $("options");
  const checkBtn = $("checkBtn");
  const continueBtn = $("continueBtn");
  const feedback = $("feedback");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const endOverlay = $("endOverlay");
  const zoomOverlay = $("zoomOverlay");
  const treeImg = $("treeImg");
  const zoomImg = $("zoomImg");
  const treeTag = $("treeTag");
  const topStats = $("topStats");
  const topSpacer = $("topSpacer");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function showStart() {
    startScreen.hidden = false;
    playScreen.hidden = true;
    endOverlay.hidden = true;
    topStats.hidden = true;
    topSpacer.hidden = false;
  }

  function buildQueue(keys) {
    queue = [];
    keys.forEach((key) => {
      const items = shuffle(TREES[key].items);
      items.forEach((item) => queue.push({ treeKey: key, item: item }));
    });
    // If both trees, keep each tree's questions together for less image switching confusion
    // (already sequential by key order)
  }

  function startPlay(keys) {
    buildQueue(keys);
    index = 0;
    score = 0;
    scoreText.textContent = "0";
    startScreen.hidden = true;
    playScreen.hidden = false;
    endOverlay.hidden = true;
    topStats.hidden = false;
    topSpacer.hidden = true;
    render();
  }

  function setTreeImage(key) {
    currentTreeKey = key;
    const src = TREES[key].img;
    treeImg.src = src;
    zoomImg.src = src;
    treeTag.textContent = TREES[key].name;
  }

  function render() {
    locked = false;
    selected = null;
    feedback.hidden = true;
    checkBtn.hidden = false;
    checkBtn.disabled = true;
    continueBtn.hidden = true;

    const entry = queue[index];
    setTreeImage(entry.treeKey);
    const item = entry.item;
    questionText.textContent = item.q;
    qProgress.textContent = (index + 1) + "/" + queue.length;

    const opts = shuffle([item.answer].concat(item.distractors));
    optionsEl.innerHTML = "";
    opts.forEach((text) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = text;
      btn.addEventListener("click", () => {
        if (locked) return;
        optionsEl.querySelectorAll(".opt").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selected = text;
        checkBtn.disabled = false;
      });
      optionsEl.appendChild(btn);
    });
  }

  function check() {
    if (locked || !selected) return;
    locked = true;
    const item = queue[index].item;
    const ok = selected === item.answer;

    optionsEl.querySelectorAll(".opt").forEach((b) => {
      b.disabled = true;
      if (b.textContent === item.answer) b.classList.add("correct");
      else if (b.textContent === selected && !ok) b.classList.add("wrong");
    });

    checkBtn.hidden = true;
    continueBtn.hidden = false;
    continueBtn.textContent =
      index >= queue.length - 1 ? "See results →" : "Continue →";

    if (ok) {
      score++;
      scoreText.textContent = String(score);
      feedback.hidden = false;
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓";
    } else {
      feedback.hidden = false;
      feedback.className = "feedback error";
      feedback.textContent = "Answer: " + item.answer;
    }
  }

  function next() {
    if (index >= queue.length - 1) {
      finish();
      return;
    }
    index++;
    render();
  }

  function finish() {
    const total = queue.length;
    const acc = Math.round((score / total) * 100);
    $("endTitle").textContent =
      acc === 100 ? "Perfect!" : acc >= 70 ? "Well done!" : "Good practice!";
    $("endMsg").textContent = "Score: " + score + " / " + total + " (" + acc + "%)";
    $("endEmoji").textContent = acc === 100 ? "🏆" : acc >= 70 ? "🎉" : "💪";
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}
    endOverlay.hidden = false;
  }

  document.querySelectorAll(".tree-pick").forEach((btn) => {
    btn.addEventListener("click", () => startPlay([btn.dataset.tree]));
  });
  $("bothBtn").addEventListener("click", () => startPlay(["joe", "angela"]));

  checkBtn.addEventListener("click", check);
  continueBtn.addEventListener("click", next);
  $("againBtn").addEventListener("click", showStart);

  $("zoomBtn").addEventListener("click", () => { zoomOverlay.hidden = false; });
  $("zoomClose").addEventListener("click", () => { zoomOverlay.hidden = true; });
  zoomOverlay.addEventListener("click", (e) => {
    if (e.target === zoomOverlay) zoomOverlay.hidden = true;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (!endOverlay.hidden || !zoomOverlay.hidden || playScreen.hidden) return;
    e.preventDefault();
    if (locked && !continueBtn.hidden) next();
    else if (!checkBtn.disabled && !checkBtn.hidden) check();
  });

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }
})();
