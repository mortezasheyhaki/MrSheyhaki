/* People Words — boy girl man woman men women children friends */

(function () {
  "use strict";

  const GAME_ID = "vocab-people-words";
  const WORD_LIST = ["boy", "children", "friends", "girl", "man", "men", "woman", "women"];

  const ITEMS = [
    {
      n: 1,
      img: "images/p1.jpg",
      before: "Fabio and Anna are ",
      after: ".",
      answer: "friends",
      given: true // example already filled in book — still practice
    },
    {
      n: 2,
      img: "images/p2.jpg",
      before: "Mrs. DeSouza is a ",
      after: ".",
      answer: "woman"
    },
    {
      n: 3,
      img: "images/p3.jpg",
      before: "Kim is a ",
      after: ".",
      answer: "girl"
    },
    {
      n: 4,
      img: "images/p4.jpg",
      before: "George and Michael are ",
      after: ".",
      answer: "men"
    },
    {
      n: 5,
      img: "images/p5.jpg",
      before: "Alex is a ",
      after: ".",
      answer: "boy"
    },
    {
      n: 6,
      img: "images/p6.jpg",
      before: "Mr. Husson is a ",
      after: ".",
      answer: "man"
    },
    {
      n: 7,
      img: "images/p7.jpg",
      before: "Megan and Dan are ",
      after: ".",
      answer: "children"
    },
    {
      n: 8,
      img: "images/p8.jpg",
      before: "Jessica and Helena are ",
      after: ".",
      answer: "women"
    }
  ];

  let index = 0;
  let score = 0;
  let selected = null;
  let locked = false;
  let usedWords = new Set();

  const $ = (id) => document.getElementById(id);
  const sceneImg = $("sceneImg");
  const sentence = $("sentence");
  const optionsEl = $("options");
  const wordBank = $("wordBank");
  const checkBtn = $("checkBtn");
  const continueBtn = $("continueBtn");
  const feedback = $("feedback");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const qNum = $("qNum");
  const endOverlay = $("endOverlay");

  function renderBank() {
    wordBank.innerHTML = "";
    WORD_LIST.forEach((w) => {
      const chip = document.createElement("span");
      chip.className = "bank-chip" + (usedWords.has(w) ? " used" : "");
      chip.textContent = w;
      wordBank.appendChild(chip);
    });
  }

  function render() {
    locked = false;
    selected = null;
    feedback.hidden = true;
    checkBtn.hidden = false;
    checkBtn.disabled = true;
    continueBtn.hidden = true;

    const item = ITEMS[index];
    sceneImg.src = item.img;
    sceneImg.alt = "Photo " + item.n;
    qNum.textContent = String(item.n);
    qProgress.textContent = (index + 1) + "/" + ITEMS.length;
    scoreText.textContent = String(score);
    renderBank();

    sentence.innerHTML =
      item.before + '<span class="blank" id="blank">______</span>' + item.after;

    // options: remaining words + always include correct if not used
    const available = WORD_LIST.filter((w) => !usedWords.has(w) || w === item.answer);
    // show all list words as options for clarity (like book word bank)
    optionsEl.innerHTML = "";
    WORD_LIST.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = opt;
      btn.dataset.val = opt;
      if (usedWords.has(opt) && opt !== item.answer) {
        btn.disabled = true;
      }
      btn.addEventListener("click", () => {
        if (locked || btn.disabled) return;
        optionsEl.querySelectorAll(".opt").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selected = opt;
        const blank = $("blank");
        blank.textContent = opt;
        blank.classList.add("filled");
        blank.classList.remove("wrong");
        checkBtn.disabled = false;
      });
      optionsEl.appendChild(btn);
    });
  }

  function check() {
    if (locked || !selected) return;
    locked = true;
    const item = ITEMS[index];
    const ok = selected === item.answer;
    const blank = $("blank");

    optionsEl.querySelectorAll(".opt").forEach((b) => {
      b.disabled = true;
      if (b.dataset.val === item.answer) b.classList.add("correct");
      else if (b.dataset.val === selected && !ok) b.classList.add("wrong");
    });

    checkBtn.hidden = true;
    continueBtn.hidden = false;
    continueBtn.textContent =
      index >= ITEMS.length - 1 ? "See results →" : "Continue →";

    if (ok) {
      score++;
      scoreText.textContent = String(score);
      usedWords.add(item.answer);
      blank.classList.add("filled");
      blank.classList.remove("wrong");
      feedback.hidden = false;
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓";
      renderBank();
    } else {
      blank.textContent = item.answer;
      blank.classList.remove("filled");
      blank.classList.add("wrong");
      setTimeout(() => {
        blank.classList.remove("wrong");
        blank.classList.add("filled");
      }, 400);
      usedWords.add(item.answer); // remove from bank after reveal so each word once
      feedback.hidden = false;
      feedback.className = "feedback error";
      feedback.textContent = "Answer: " + item.answer;
      renderBank();
    }
  }

  function next() {
    if (index >= ITEMS.length - 1) {
      finish();
      return;
    }
    index++;
    render();
  }

  function finish() {
    const total = ITEMS.length;
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

  function reset() {
    index = 0;
    score = 0;
    usedWords = new Set();
    endOverlay.hidden = true;
    render();
  }

  checkBtn.addEventListener("click", check);
  continueBtn.addEventListener("click", next);
  $("againBtn").addEventListener("click", reset);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (endOverlay && !endOverlay.hidden) return;
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

  render();
})();
