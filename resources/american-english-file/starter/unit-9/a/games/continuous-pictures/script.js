/* Picture Sentences — write only: fill with be + -ing (e.g. is working) */
(function () {
  "use strict";

  const GAME_ID = "starter-9a-continuous-pictures";
  function saveStars() {
    try {
      if (!window.LAStars || !order || !order.length) return;
      var acc = Math.round((score / order.length) * 100);
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, acc);
    } catch (_) {}
  }


  const ITEMS = [
    {
      img: "https://cdn.imgurl.ir/uploads/b06384_he39s_taking_a_shower.png",
      prompt: "He ______ a shower.",
      verb: "(have)",
      hint: "Look and complete",
      answer: "is taking",
      full: "He is taking a shower.",
      alts: ["'s taking", "s taking"],
    },
    {
      img: "https://cdn.imgurl.ir/uploads/v297295_I_can39t_talk_now._I39m_driving.png",
      prompt: "I can't talk now. I ______.",
      verb: "(drive)",
      hint: "Complete the blank",
      answer: "am driving",
      full: "I can't talk now. I am driving.",
      alts: ["'m driving", "m driving"],
    },
    {
      img: "https://cdn.imgurl.ir/uploads/v3813_You39re_doing_the_wrong_exercise.png",
      prompt: "You ______ the wrong exercise!",
      verb: "(do)",
      hint: "Complete the blank",
      answer: "are doing",
      full: "You are doing the wrong exercise!",
      alts: ["'re doing", "re doing"],
    },
    {
      img: "https://cdn.imgurl.ir/uploads/d373594_She39s_working_at_home_today.png",
      prompt: "She ______ at home today.",
      verb: "(work)",
      hint: "Complete the blank",
      answer: "is working",
      full: "She is working at home today.",
      alts: ["'s working", "s working"],
    },
    {
      img: "https://cdn.imgurl.ir/uploads/g6364_He39s_aying_soccer_football.png",
      prompt: "He ______ soccer.",
      verb: "(play)",
      hint: "Soccer or football — both OK",
      answer: "is playing",
      full: "He is playing soccer.",
      alts: ["'s playing", "s playing"],
    },
    {
      img: "https://cdn.imgurl.ir/uploads/s35055_We39re_studying_for_exam.png",
      prompt: "We ______ for an exam.",
      verb: "(study)",
      hint: "Complete the blank",
      answer: "are studying",
      full: "We are studying for an exam.",
      alts: ["'re studying", "re studying"],
    },
  ];

  let order = [];
  let index = 0;
  let score = 0;
  let locked = false;

  const $ = (id) => document.getElementById(id);
  const startScreen = $("startScreen");
  const gameScreen = $("gameScreen");
  const endOverlay = $("endOverlay");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const leftText = $("leftText");
  const sceneImg = $("sceneImg");
  const promptHint = $("promptHint");
  const promptText = $("promptText");
  const verbHint = $("verbHint");
  const answerInput = $("answerInput");
  const writeFeedback = $("writeFeedback");
  const checkWriteBtn = $("checkWriteBtn");
  const writeActions = $("writeActions");
  const writeNextRow = $("writeNextRow");
  const nextWriteBtn = $("nextWriteBtn");

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.?!]+/g, "")
      .replace(/,/g, "")
      .replace(/\bi am\b/g, "am")
      .replace(/\bhe is\b/g, "is")
      .replace(/\bshe is\b/g, "is")
      .replace(/\bit is\b/g, "is")
      .replace(/\byou are\b/g, "are")
      .replace(/\bwe are\b/g, "are")
      .replace(/\bthey are\b/g, "are")
      .replace(/\bi'm\b/g, "am")
      .replace(/\bhe's\b/g, "is")
      .replace(/\bshe's\b/g, "is")
      .replace(/\bit's\b/g, "is")
      .replace(/\byou're\b/g, "are")
      .replace(/\bwe're\b/g, "are")
      .replace(/\bthey're\b/g, "are")
      .replace(/^'m\b/g, "am")
      .replace(/^'s\b/g, "is")
      .replace(/^'re\b/g, "are")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(built, item) {
    const n = normalize(built);
    if (n === normalize(item.answer)) return true;
    return (item.alts || []).some(function (a) {
      return normalize(a) === n;
    });
  }

  function start() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    locked = false;
    startScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    loadItem();
  }

  function loadItem() {
    locked = false;
    const item = ITEMS[order[index]];
    qProgress.textContent = index + 1 + "/" + order.length;
    scoreText.textContent = String(score);
    leftText.textContent = String(order.length - index);
    sceneImg.src = item.img;
    sceneImg.alt = item.prompt;
    promptHint.textContent = item.hint;
    promptText.textContent = item.prompt;
    verbHint.textContent = item.verb;
    writeFeedback.textContent = "";
    writeFeedback.className = "feedback";
    answerInput.className = "answer-input";
    answerInput.value = "";
    answerInput.disabled = false;
    writeActions.classList.remove("hidden");
    writeNextRow.classList.add("hidden");
    checkWriteBtn.disabled = true;
    setTimeout(function () { answerInput.focus(); }, 50);
  }

  function checkWrite() {
    if (locked) return;
    const item = ITEMS[order[index]];
    if (isCorrect(answerInput.value, item)) {
      locked = true;
      score++;
      scoreText.textContent = String(score);
      answerInput.className = "answer-input ok";
      answerInput.disabled = true;
      writeFeedback.textContent = item.full || item.answer;
      writeFeedback.className = "feedback ok";
      writeActions.classList.add("hidden");
      writeNextRow.classList.remove("hidden");
    } else {
      answerInput.className = "answer-input bad shake";
      writeFeedback.textContent = "Write be + -ing  ·  e.g. is working";
      writeFeedback.className = "feedback bad";
      setTimeout(function () { answerInput.classList.remove("shake"); }, 300);
    }
  }

  function next() {
    if (index + 1 >= order.length) {
      endOverlay.classList.remove("hidden");
      $("endTitle").textContent = "Done!";
      $("endMsg").textContent = "You scored " + score + " of " + order.length;
      saveStars();
      return;
    }
    index++;
    loadItem();
  }

  $("startBtn").addEventListener("click", start);
  $("exitBtn").addEventListener("click", function () {
    gameScreen.classList.add("hidden");
    endOverlay.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
  checkWriteBtn.addEventListener("click", checkWrite);
  nextWriteBtn.addEventListener("click", next);
  answerInput.addEventListener("input", function () {
    checkWriteBtn.disabled = !answerInput.value.trim();
    if (!locked) {
      answerInput.className = "answer-input";
      writeFeedback.textContent = "";
    }
  });
  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (locked) next();
      else checkWrite();
    }
  });
  $("playAgainBtn").addEventListener("click", start);
  $("homeBtn").addEventListener("click", function () {
    endOverlay.classList.add("hidden");
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
})();
