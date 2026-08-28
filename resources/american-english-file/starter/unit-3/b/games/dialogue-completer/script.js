(function () {
  "use strict";

  const BANK = ["this", "that", "these", "those"];
  const GAME_ID = "starter-3b-dialogue-completer";

  const SCENES = [
    {
      img: "images/scene1.jpg",
      alt: "Office: colleagues with laptops and keys",
      lines: [
        { speaker: "David", parts: ["Sally, is ", { blank: 0, answer: "this" }, " your laptop?"] },
        { speaker: "Sally", parts: ["No, it isn't."] },
        { speaker: "David", parts: ["Where's your laptop?"] },
        { speaker: "Sally", parts: ["", { blank: 1, answer: "That" }, "'s my laptop – over there on the table."] },
        { speaker: "David", parts: ["And the keys? Are ", { blank: 2, answer: "these" }, " your keys?"] },
        { speaker: "Sally", parts: ["Yes, they are. Thanks."] },
      ],
    },
    {
      img: "images/scene2.jpg",
      alt: "Café: friends with mug, candies, and a picture",
      lines: [
        { speaker: "Paul", parts: ["Is ", { blank: 0, answer: "this" }, " mug from Turkey?"] },
        { speaker: "Jane", parts: ["No, it's from Spain."] },
        { speaker: "Paul", parts: ["And ", { blank: 1, answer: "these" }, " candies? Are ", { blank: 2, answer: "these" }, " from the US?"] },
        { speaker: "Jane", parts: ["Yes, they are. And ", { blank: 3, answer: "that" }, " picture is from the US, too."] },
      ],
    },
    {
      img: "images/scene3.jpg",
      alt: "Bus station: driver and passenger with bags",
      lines: [
        { speaker: "Woman", parts: ["Excuse me. Is ", { blank: 0, answer: "this" }, " the bus to San Francisco?"] },
        { speaker: "Driver", parts: ["No, ma'am. ", { blank: 1, answer: "This" }, " is the bus to Los Angeles."] },
        { speaker: "Woman", parts: ["Oh, no! Where's the bus to San Francisco?"] },
        {
          speaker: "Driver",
          parts: [
            "",
            { blank: 2, answer: "That" },
            "'s the bus to San Francisco over there – number 41. Are ",
            { blank: 3, answer: "these" },
            " your bags?",
          ],
        },
        { speaker: "Woman", parts: ["Yes, they are."] },
        { speaker: "Driver", parts: ["Here, let me help you."] },
      ],
    },
  ];

  const TOTAL_BLANKS = SCENES.reduce(function (n, s) {
    return (
      n +
      s.lines.reduce(function (m, line) {
        return m + line.parts.filter(function (p) { return typeof p === "object"; }).length;
      }, 0)
    );
  }, 0);

  const $ = function (id) { return document.getElementById(id); };

  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endScreen = $("endScreen");
  const dialogueCard = $("dialogueCard");
  const wordBank = $("wordBank");
  const sceneImg = $("sceneImg");
  const checkBtn = $("checkBtn");
  const feedback = $("feedback");

  let sceneIndex = 0;
  let answers = {}; // "scene-blankIdx" -> chosen word (lowercase for compare)
  let activeBlank = null; // { scene, idx, el }
  let score = 0;
  let correctCount = 0;
  let locked = false;

  function show(screen) {
    // Toggle both property and attribute so [hidden] CSS always applies
    // (mobile .panel { display:flex } would otherwise override the attribute alone).
    function setHidden(el, isHidden) {
      if (!el) return;
      el.hidden = isHidden;
      if (isHidden) el.setAttribute("hidden", "");
      else el.removeAttribute("hidden");
    }
    setHidden(startScreen, screen !== "start");
    setHidden(gameScreen, screen !== "game");
    setHidden(endScreen, screen !== "end");
  }

  function setFeedback(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function updateStats() {
    $("sceneText").textContent = sceneIndex + 1 + " / " + SCENES.length;
    $("scoreText").textContent = String(score);
    $("correctText").textContent = correctCount + " / " + TOTAL_BLANKS;
  }

  function blankKey(s, i) {
    return s + "-" + i;
  }

  function normalize(w) {
    return String(w || "").toLowerCase();
  }

  function renderBank() {
    wordBank.innerHTML = "";
    BANK.forEach(function (w) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "word-chip";
      btn.textContent = w;
      btn.addEventListener("click", function () {
        if (locked || !activeBlank) return;
        fillBlank(w);
      });
      wordBank.appendChild(btn);
    });
  }

  function fillBlank(word) {
    if (!activeBlank || locked) return;
    const key = blankKey(activeBlank.scene, activeBlank.idx);
    answers[key] = word;
    activeBlank.el.textContent = word;
    activeBlank.el.classList.remove("empty", "wrong");
    activeBlank.el.classList.add("filled");
    // keep selection on this blank so user can change
    checkBtn.disabled = !allFilled();
    setFeedback("", "");
  }

  function allFilled() {
    const scene = SCENES[sceneIndex];
    let need = 0;
    let have = 0;
    scene.lines.forEach(function (line) {
      line.parts.forEach(function (p) {
        if (typeof p === "object") {
          need++;
          if (answers[blankKey(sceneIndex, p.blank)]) have++;
        }
      });
    });
    return need > 0 && have === need;
  }

  function selectBlank(el, idx) {
    if (locked) return;
    if (el.classList.contains("correct")) return;
    dialogueCard.querySelectorAll(".blank.active").forEach(function (b) {
      b.classList.remove("active");
    });
    el.classList.add("active");
    activeBlank = { scene: sceneIndex, idx: idx, el: el };
  }

  function renderScene() {
    locked = false;
    activeBlank = null;
    setFeedback("", "");
    checkBtn.disabled = true;
    checkBtn.textContent = sceneIndex < SCENES.length - 1 ? "CHECK SCENE ✓" : "CHECK & FINISH ✓";

    const scene = SCENES[sceneIndex];
    sceneImg.src = scene.img;
    sceneImg.alt = scene.alt;

    dialogueCard.innerHTML = "";
    scene.lines.forEach(function (line) {
      const row = document.createElement("div");
      row.className = "line";
      const sp = document.createElement("span");
      sp.className = "speaker";
      sp.textContent = line.speaker;
      const text = document.createElement("div");
      text.className = "line-text";

      line.parts.forEach(function (p) {
        if (typeof p === "string") {
          text.appendChild(document.createTextNode(p));
        } else {
          const key = blankKey(sceneIndex, p.blank);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "blank empty";
          btn.dataset.idx = String(p.blank);
          btn.dataset.answer = p.answer;
          if (answers[key]) {
            btn.textContent = answers[key];
            btn.classList.remove("empty");
            btn.classList.add("filled");
          } else {
            btn.textContent = "______";
          }
          btn.addEventListener("click", function () {
            selectBlank(btn, p.blank);
          });
          text.appendChild(btn);
        }
      });

      row.appendChild(sp);
      row.appendChild(text);
      dialogueCard.appendChild(row);
    });

    // auto-select first empty blank
    const firstEmpty = dialogueCard.querySelector(".blank.empty");
    if (firstEmpty) {
      selectBlank(firstEmpty, Number(firstEmpty.dataset.idx));
    }

    renderBank();
    updateStats();
    checkBtn.disabled = !allFilled();
  }

  function checkScene() {
    if (locked || !allFilled()) return;
    locked = true;
    checkBtn.disabled = true;

    const scene = SCENES[sceneIndex];
    let sceneOk = 0;
    let sceneTotal = 0;
    const blanks = dialogueCard.querySelectorAll(".blank");

    blanks.forEach(function (el) {
      const idx = Number(el.dataset.idx);
      const expected = normalize(el.dataset.answer);
      const chosen = normalize(answers[blankKey(sceneIndex, idx)]);
      sceneTotal++;
      if (chosen === expected) {
        sceneOk++;
        correctCount++;
        score += 100;
        el.classList.remove("filled", "wrong", "active", "empty");
        el.classList.add("correct");
        // display with book capitalization
        el.textContent = el.dataset.answer;
      } else {
        el.classList.remove("filled", "active");
        el.classList.add("wrong");
      }
    });

    updateStats();

    if (sceneOk === sceneTotal) {
      setFeedback("Perfect scene!", "ok");
      setTimeout(function () {
        nextOrFinish();
      }, 900);
    } else {
      setFeedback(sceneOk + " of " + sceneTotal + " correct — fix the red blanks", "bad");
      locked = false;
      // clear wrong so they can retry
      setTimeout(function () {
        blanks.forEach(function (el) {
          if (el.classList.contains("wrong")) {
            const idx = Number(el.dataset.idx);
            delete answers[blankKey(sceneIndex, idx)];
            el.textContent = "______";
            el.classList.remove("wrong");
            el.classList.add("empty");
          }
        });
        const firstEmpty = dialogueCard.querySelector(".blank.empty");
        if (firstEmpty) selectBlank(firstEmpty, Number(firstEmpty.dataset.idx));
        checkBtn.disabled = !allFilled();
        setFeedback("", "");
      }, 1200);
    }
  }

  function nextOrFinish() {
    sceneIndex++;
    if (sceneIndex >= SCENES.length) {
      finish();
    } else {
      // clear answers only for upcoming scene (already per-scene keys)
      locked = false;
      renderScene();
    }
  }

  function finish() {
    const accuracy = TOTAL_BLANKS ? Math.round((correctCount / TOTAL_BLANKS) * 100) : 0;
    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = accuracy + "%";
    $("finalBlanks").textContent = String(TOTAL_BLANKS);
    $("endTitle").textContent =
      accuracy === 100 ? "Perfect!" : accuracy >= 70 ? "Great job!" : "Good practice!";
    $("endSummary").textContent =
      "You got " + correctCount + " of " + TOTAL_BLANKS + " blanks right.";

    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
        LAStars.apply(endScreen);
      }
    } catch (e) {}

    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
    endScreen.querySelectorAll(".end-stars .star").forEach(function (el) {
      const n = Number(el.getAttribute("data-n") || 0);
      if (n <= stars) {
        el.classList.add("is-filled");
        el.textContent = "★";
      } else {
        el.classList.remove("is-filled");
        el.textContent = "☆";
      }
    });

    show("end");
  }

  function startGame() {
    sceneIndex = 0;
    answers = {};
    score = 0;
    correctCount = 0;
    show("game");
    renderScene();
  }

  $("startBtn").addEventListener("click", startGame);
  $("playAgainBtn").addEventListener("click", startGame);
  checkBtn.addEventListener("click", checkScene);
})();
