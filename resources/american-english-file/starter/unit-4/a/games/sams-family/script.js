/* Sam's Family · sentences with 's · AEF Starter Unit 4A */
(function () {
  const GAME_ID = "starter-4a-sams-family";
  const TREE_IMG = "https://cdn.imgurl.ir/uploads/d76067_ChatGPT_Image_Sep_17_2026_02_21_53_AM.png";

  // pair shown as "A / B" → sentence "A is B's relationship"
  const ITEMS = [
    {
      pair: "Kayla / Sam",
      answer: "Kayla is Sam's sister.",
      distractors: ["Kayla is Sam's mother.", "Sam is Kayla's sister."],
      build: ["Kayla", "is", "Sam", "'", "s", "sister."],
    },
    {
      pair: "Peter / Kayla",
      answer: "Peter is Kayla's father.",
      distractors: ["Peter is Kayla's brother.", "Kayla is Peter's father."],
      build: ["Peter", "is", "Kayla", "'", "s", "father."],
    },
    {
      pair: "Diana / Sam",
      answer: "Diana is Sam's mother.",
      distractors: ["Diana is Sam's sister.", "Sam is Diana's mother."],
      build: ["Diana", "is", "Sam", "'", "s", "mother."],
    },
    {
      pair: "Kayla / Peter",
      answer: "Kayla is Peter's daughter.",
      distractors: ["Kayla is Peter's sister.", "Peter is Kayla's daughter."],
      build: ["Kayla", "is", "Peter", "'", "s", "daughter."],
    },
    {
      pair: "Peter / Diana",
      answer: "Peter is Diana's husband.",
      distractors: ["Peter is Diana's father.", "Diana is Peter's husband."],
      build: ["Peter", "is", "Diana", "'", "s", "husband."],
    },
    {
      pair: "Sam / Peter",
      answer: "Sam is Peter's son.",
      distractors: ["Sam is Peter's brother.", "Peter is Sam's son."],
      build: ["Sam", "is", "Peter", "'", "s", "son."],
    },
    {
      pair: "Diana / Peter",
      answer: "Diana is Peter's wife.",
      distractors: ["Diana is Peter's mother.", "Peter is Diana's wife."],
      build: ["Diana", "is", "Peter", "'", "s", "wife."],
    },
    {
      pair: "Sam / Kayla",
      answer: "Sam is Kayla's brother.",
      distractors: ["Sam is Kayla's father.", "Kayla is Sam's brother."],
      build: ["Sam", "is", "Kayla", "'", "s", "brother."],
    },
  ];

  const MODES = [
    { id: "choose", title: "Choose the sentence", tip: "Look at the pair and pick the correct sentence." },
    { id: "build", title: "Build the sentence", tip: "Put the words in the correct order." },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let modeIndex = 0;
  let order = [];
  let index = 0;
  let correct = 0;
  let answered = false;
  let bank = [];
  let built = [];
  let tileId = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startMode(mi) {
    modeIndex = mi;
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correct = 0;
    answered = false;
    phase = "play";
    if (MODES[modeIndex].id === "build") setupBuild();
    render();
  }

  function setupBuild() {
    const item = ITEMS[order[index]];
    tileId = 0;
    bank = shuffle(item.build.map((t) => ({ text: t, id: tileId++ })));
    built = [];
    answered = false;
  }

  function advanceAfter(ms) {
    setTimeout(() => {
      if (index < order.length - 1) {
        index += 1;
        answered = false;
        if (MODES[modeIndex].id === "build") setupBuild();
        render();
      } else {
        phase = "done";
        render();
      }
    }, ms);
  }

  function pickOption(opt) {
    if (answered) return;
    answered = true;
    const item = ITEMS[order[index]];
    const isCorrect = opt === item.answer;
    if (isCorrect) correct += 1;

    app.querySelectorAll(".ps-opt").forEach((el) => {
      const v = el.textContent.trim();
      el.disabled = true;
      if (v === item.answer) el.classList.add("is-correct");
      if (v === opt && !isCorrect) el.classList.add("is-wrong");
    });

    const fb = document.getElementById("ps-feedback");
    if (fb) {
      fb.textContent = isCorrect ? "Correct!" : "Not quite — " + item.answer;
      fb.className = "ps-feedback " + (isCorrect ? "ok" : "bad");
    }
    advanceAfter(isCorrect ? 900 : 1500);
  }

  function addTile(id) {
    if (answered) return;
    const i = bank.findIndex((t) => t.id === id);
    if (i < 0) return;
    built.push(bank[i]);
    bank.splice(i, 1);
    render();
    if (bank.length === 0) setTimeout(checkBuild, 280);
  }

  function removeTile(id) {
    if (answered) return;
    const i = built.findIndex((t) => t.id === id);
    if (i < 0) return;
    bank.push(built[i]);
    built.splice(i, 1);
    render();
  }

  function checkBuild() {
    if (answered || built.length === 0) return;
    const item = ITEMS[order[index]];
    const user = built.map((t) => t.text).join(" ");
    const target = item.build.join(" ");
    const isCorrect = user === target;
    answered = true;
    if (isCorrect) correct += 1;

    const slot = document.getElementById("ps-build-slot");
    if (slot) slot.classList.add(isCorrect ? "is-correct" : "is-wrong");
    app.querySelectorAll(".ps-tile").forEach((el) => { el.disabled = true; });

    const fb = document.getElementById("ps-feedback");
    if (fb) {
      fb.textContent = isCorrect ? "Correct!" : "Not quite — " + item.answer;
      fb.className = "ps-feedback " + (isCorrect ? "ok" : "bad");
    }
    const checkBtn = document.getElementById("ps-check");
    if (checkBtn) checkBtn.style.display = "none";
    advanceAfter(isCorrect ? 1000 : 1700);
  }

  function calcStars() {
    const total = ITEMS.length;
    if (correct >= total) return 3;
    if (correct >= Math.ceil(total * 0.7)) return 2;
    if (correct >= Math.ceil(total * 0.4)) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID + "-" + MODES[modeIndex].id);
      LAStars.save(GAME_ID + "-" + MODES[modeIndex].id, stars);
    }
    return stars;
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Sam\'s Family</span>' +
        '<span class="ps-badge">4A</span></header>' +
        '<section class="ps-start">' +
        '<div class="ps-hero" aria-hidden="true">👨‍👩‍👧</div>' +
        "<h1>Sam's Family</h1>" +
        '<p class="ps-desc">Write sentences about Sam\'s family. Use the names and \'s.</p>' +
        '<div class="ps-mode-list">' +
        MODES.map(function (m, i) {
          return (
            '<button type="button" class="ps-mode-card" data-mode="' + i + '">' +
            '<span class="ps-mode-num">' + (i + 1) + "</span>" +
            "<div><strong>" + m.title + "</strong><p>" + m.tip + "</p></div></button>"
          );
        }).join("") +
        "</div></section>";
      app.querySelectorAll(".ps-mode-card").forEach(function (btn) {
        btn.onclick = function () { startMode(+btn.dataset.mode); };
      });
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Sam\'s Family</span>' +
        '<span class="ps-badge">Done</span></header>' +
        '<section class="ps-done">' +
        '<div class="ps-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) + "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="ps-desc">You got ' + correct + " of " + ITEMS.length + " correct.</p>" +
        '<button type="button" class="ps-btn" id="ps-again">Play again</button>' +
        '<button type="button" class="ps-btn secondary" id="ps-menu">Back to start</button></section>';
      document.getElementById("ps-again").onclick = function () { startMode(modeIndex); };
      document.getElementById("ps-menu").onclick = function () { phase = "menu"; render(); };
      return;
    }

    const item = ITEMS[order[index]];
    const mode = MODES[modeIndex];

    if (mode.id === "choose") {
      const opts = shuffle([item.answer].concat(item.distractors));
      const optHtml = opts.map(function (o, i) {
        return '<button type="button" class="ps-opt ps-opt-sentence" data-i="' + i + '">' + o + "</button>";
      }).join("");

      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">Sam\'s Family</span>' +
        '<span class="ps-progress">' + (index + 1) + " / " + ITEMS.length + "</span></header>" +
        '<div class="ps-play">' +
        '<div class="ps-pic-wrap ps-pic-tree"><img class="ps-pic" src="' + TREE_IMG + '" alt="Sam\'s family tree" draggable="false" /></div>' +
        '<p class="ps-pair">' + item.pair + "</p>" +
        '<div class="ps-options ps-options-col">' + optHtml + "</div>" +
        '<p class="ps-feedback" id="ps-feedback"></p></div>';

      app.querySelectorAll(".ps-opt").forEach(function (el) {
        el.onclick = function () { pickOption(opts[+el.dataset.i]); };
      });
      return;
    }

    // Build mode
    const builtHtml = built.map(function (t) {
      return '<button type="button" class="ps-tile ps-tile-built" data-id="' + t.id + '">' + t.text + "</button>";
    }).join("");
    const bankHtml = bank.map(function (t) {
      return '<button type="button" class="ps-tile" data-id="' + t.id + '">' + t.text + "</button>";
    }).join("");

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Build the sentence</span>' +
      '<span class="ps-progress">' + (index + 1) + " / " + ITEMS.length + "</span></header>" +
      '<div class="ps-play ps-play-build">' +
      '<div class="ps-pic-wrap ps-pic-tree"><img class="ps-pic" src="' + TREE_IMG + '" alt="Sam\'s family tree" draggable="false" /></div>' +
      '<p class="ps-pair">' + item.pair + "</p>" +
      '<div class="ps-build-slot" id="ps-build-slot">' +
      (builtHtml || '<span class="ps-build-hint">Tap words to build the sentence</span>') +
      "</div>" +
      '<div class="ps-bank">' + bankHtml + "</div>" +
      '<div class="ps-build-actions">' +
      '<button type="button" class="ps-btn" id="ps-check" ' + (built.length === 0 || answered ? "disabled" : "") + ">Check</button>" +
      "</div>" +
      '<p class="ps-feedback" id="ps-feedback"></p></div>';

    app.querySelectorAll(".ps-bank .ps-tile").forEach(function (el) {
      el.onclick = function () { addTile(+el.dataset.id); };
    });
    app.querySelectorAll(".ps-tile-built").forEach(function (el) {
      el.onclick = function () { removeTile(+el.dataset.id); };
    });
    const checkBtn = document.getElementById("ps-check");
    if (checkBtn) checkBtn.onclick = checkBuild;
  }

  render();
})();
