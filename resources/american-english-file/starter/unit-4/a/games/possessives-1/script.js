/* Possessives 1 — AEF Starter Unit 4A
   my / your / his / her / its / our / their
*/
(function () {
  "use strict";

  const GAME_ID = "starter-4a-possessives-1";

  const OPTIONS = ["my", "your", "his", "her", "its", "our", "their"];

  const ITEMS = [
    {
      n: 1,
      img: "https://cdn.imgurl.ir/uploads/k61616_where39s_my_umbrella.png",
      before: "Where's ",
      after: " umbrella?",
      answer: "my",
      note: "She is talking about her own umbrella."
    },
    {
      n: 2,
      img: "https://cdn.imgurl.ir/uploads/o645567_is_this_your_bag.png",
      before: "Is this ",
      after: " bag?",
      answer: "your",
      note: "Security is asking the woman about her bag."
    },
    {
      n: 3,
      img: "https://cdn.imgurl.ir/uploads/g708_this_is_josh_and_his_wife.png",
      before: "That's Josh and ",
      after: " wife.",
      answer: "his",
      note: "Josh is a man → his wife."
    },
    {
      n: 4,
      img: "https://cdn.imgurl.ir/uploads/e926475_where_are_our_coats.png",
      before: "Where are ",
      after: " coats?",
      answer: "our",
      note: "The couple is talking about their coats together → our."
    },
    {
      n: 5,
      img: "https://cdn.imgurl.ir/uploads/x050923_where_are_my_sungles.png",
      before: "Where are ",
      after: " sunglasses?",
      answer: "my",
      note: "He is looking for his own sunglasses → my."
    },
    {
      n: 6,
      img: "https://cdn.imgurl.ir/uploads/z533408_these_are_they_keys.png",
      before: "Look, I think these are ",
      after: " keys.",
      answer: "their",
      note: "The keys belong to the boys → their."
    },
    {
      n: 7,
      img: "https://cdn.imgurl.ir/uploads/w06504_what39s_its_name.png",
      before: "It's a great book. Now what's ",
      after: " name?",
      answer: "its",
      note: "The book → its name."
    },
    {
      n: 8,
      img: "https://cdn.imgurl.ir/uploads/t506320_She39s_my_French_teacher.png",
      before: "That's Ms. Green. She's ",
      after: " French teacher.",
      answer: "my",
      note: "The speaker is talking about their own teacher → my."
    }
  ];

  let index = 0;
  let score = 0;
  let selected = null;
  let locked = false;

  const $ = (id) => document.getElementById(id);
  const sceneImg = $("sceneImg");
  const sentence = $("sentence");
  const optionsEl = $("options");
  const checkBtn = $("checkBtn");
  const continueBtn = $("continueBtn");
  const feedback = $("feedback");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const qNum = $("qNum");
  const endOverlay = $("endOverlay");

  function render() {
    locked = false;
    selected = null;
    feedback.hidden = true;
    checkBtn.hidden = false;
    checkBtn.disabled = true;
    continueBtn.hidden = true;

    const item = ITEMS[index];
    qProgress.textContent = item.n + "/" + ITEMS.length;
    qNum.textContent = item.n;
    scoreText.textContent = String(score);

    sceneImg.src = item.img;
    sceneImg.alt = "Scene " + item.n;

    sentence.innerHTML =
      item.before +
      '<span class="blank" id="blank">&nbsp;</span>' +
      item.after;

    optionsEl.innerHTML = "";
    OPTIONS.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-btn";
      btn.dataset.val = opt;
      btn.textContent = opt;
      btn.addEventListener("click", function () {
        if (locked) return;
        selected = opt;
        optionsEl.querySelectorAll(".opt-btn").forEach(function (b) {
          b.classList.toggle("selected", b.dataset.val === selected);
        });
        checkBtn.disabled = false;
        const blank = $("blank");
        if (blank) blank.textContent = opt;
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

    optionsEl.querySelectorAll(".opt-btn").forEach(function (b) {
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
      blank.classList.add("filled");
      blank.classList.remove("wrong");
      feedback.hidden = false;
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓";
    } else {
      blank.textContent = item.answer;
      blank.classList.remove("filled");
      blank.classList.add("wrong");
      setTimeout(function () {
        blank.classList.remove("wrong");
        blank.classList.add("filled");
      }, 400);
      feedback.hidden = false;
      feedback.className = "feedback error";
      feedback.textContent = "Answer: " + item.answer + " — " + item.note;
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
    endOverlay.hidden = true;
    render();
  }

  checkBtn.addEventListener("click", check);
  continueBtn.addEventListener("click", next);
  $("againBtn").addEventListener("click", reset);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    if (endOverlay && !endOverlay.hidden) return;
    e.preventDefault();
    if (locked && !continueBtn.hidden) next();
    else if (!checkBtn.disabled && !checkBtn.hidden) check();
  });

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }

  render();
})();
