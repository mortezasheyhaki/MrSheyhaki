(function () {
  "use strict";

  const GAME_ID = "1-3b-match-the-questions";

  // Shared Learning Arcade finish screen. Stars are already saved above, so save:false.
  function showFinish(score, total, again) {
    if (!window.LAFinish) return;
    LAFinish.show({
      gameId: GAME_ID,
      score: score,
      total: total,
      save: false,
      onAgain: again || function () { location.reload(); },
      backHref: "../"
    });
  }

  const ITEMS = [
    {
      id: "q-job",
      question: "What do you do, Jess?",
      answer: "I work in an office. I'm an administrator.",
      audio: "audio/job.mp3"
    },
    {
      id: "q-hours",
      question: "Do you work long hours?",
      answer: "No, I don't. I work normal hours, from 9:00 to 5:00, Monday to Friday.",
      audio: "audio/hours.mp3"
    },
    {
      id: "q-husband",
      question: "What does your husband do?",
      answer: "He's a police officer. He works at night, from 8:00 p.m. to 6:00 in the morning.",
      audio: "audio/husband.mp3"
    },
    {
      id: "q-weekends",
      question: "Does he have free weekends?",
      answer: "No, he doesn't. Well, he has two free days, but they're Wednesday and Thursday. He works Saturday and Sunday – they're busy nights for police officers.",
      audio: "audio/weekends.mp3"
    },
    {
      id: "q-together",
      question: "Do you have time together?",
      answer: "Not really, except when we're on vacation. I'm in bed when he comes home; he's in bed when I leave home in the morning. We don't eat together. That's awful. Sometimes I don't cook, I just have cookies for dinner.",
      audio: "audio/together.mp3"
    }
  ];

  const TOTAL = ITEMS.length;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  const answerCard = document.getElementById("answerCard");
  const answerText = document.getElementById("answerText");
  const answerNum = document.getElementById("answerNum");
  const feedback = document.getElementById("feedback");
  const optionsEl = document.getElementById("options");
  const checkBtn = document.getElementById("checkBtn");
  const progressEl = document.getElementById("progress");
  const scoreEl = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");
  const stage = document.getElementById("stage");
  const doneBox = document.getElementById("done");

  let optionOrder = [];     // question ids in on-screen order (3 on top, 2 below)
  let index = 0;            // which answer is showing (0..4)
  let score = 0;            // first-try correct answers
  let mistakes = 0;
  let locked = false;
  let selectedId = null;
  let used = {};
  let currentAudio = null;
  let transitionTimer = null;

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function playAudio(src, onEnded) {
    stopAudio();
    const audio = new Audio(src);
    currentAudio = audio;
    let done = false;
    const finish = function () {
      if (done) return;
      done = true;
      currentAudio = null;
      onEnded();
    };
    audio.addEventListener("ended", finish);
    audio.addEventListener("error", function () { setTimeout(finish, 300); });
    audio.play().catch(function () {
      // Autoplay blocked or file missing: keep the game moving
      setTimeout(finish, 800);
    });
  }

  function currentItem() {
    return ITEMS[index];
  }

  function renderOptions() {
    optionsEl.innerHTML = "";
    optionOrder.forEach(function (id) {
      const q = ITEMS.find(function (it) { return it.id === id; });
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.id = id;
      btn.textContent = q.question;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () { onSelect(id); });
      optionsEl.appendChild(btn);
    });
    refreshOptionStates();
  }

  function refreshOptionStates() {
    Array.prototype.forEach.call(optionsEl.querySelectorAll(".option"), function (btn) {
      const id = btn.dataset.id;
      const isUsed = !!used[id];
      btn.classList.toggle("used", isUsed);
      if (isUsed) btn.classList.remove("is-right", "is-wrong");
      btn.classList.toggle("selected", !isUsed && id === selectedId);
      btn.setAttribute("aria-pressed", String(!isUsed && id === selectedId));
      btn.disabled = isUsed || locked;
      btn.textContent = ITEMS.find(function (it) { return it.id === id; }).question;
    });
    checkBtn.disabled = locked || !selectedId;
  }

  function onSelect(id) {
    if (locked || used[id]) return;
    selectedId = (selectedId === id) ? null : id;   // tap again to undo
    feedback.textContent = "";
    feedback.className = "feedback";
    refreshOptionStates();
  }

  function swapAnswer(text, after) {
    clearTimeout(transitionTimer);
    answerText.classList.add("swap-out");
    answerText.classList.remove("swap-in");
    transitionTimer = setTimeout(function () {
      answerText.textContent = text;
      answerText.classList.remove("swap-out");
      answerText.classList.add("swap-in");
      if (after) after();
    }, 230);
  }

  function showAnswer(withTransition) {
    const item = currentItem();
    answerNum.textContent = String(index + 1);
    progressEl.textContent = String(index);
    progressFill.style.width = (index / TOTAL) * 100 + "%";
    answerCard.classList.remove("is-correct", "is-wrong");
    if (withTransition) {
      swapAnswer(item.answer);
    } else {
      answerText.textContent = item.answer;
      answerText.classList.add("swap-in");
    }
  }

  function onCheck() {
    if (locked || !selectedId) return;
    const item = currentItem();
    const btn = optionsEl.querySelector('.option[data-id="' + selectedId + '"]');
    locked = true;
    checkBtn.disabled = true;

    if (selectedId === item.id) {
      score++;
      scoreEl.textContent = String(score);
      used[item.id] = true;
      answerCard.classList.add("is-correct");
      if (btn) {
        btn.classList.remove("selected");
        btn.classList.add("is-right");
      }
      feedback.className = "feedback success";
      feedback.textContent = "Correct! Listen to the full answer…";
      selectedId = null;
      playAudio(item.audio, function () { advance(); });
    } else {
      mistakes++;
      answerCard.classList.add("is-wrong");
      if (btn) btn.classList.add("is-wrong");
      feedback.className = "feedback error";
      feedback.textContent = "Not quite — try another question.";
      setTimeout(function () {
        answerCard.classList.remove("is-wrong");
        if (btn) btn.classList.remove("is-wrong");
        selectedId = null;
        locked = false;
        refreshOptionStates();
      }, 520);
    }
  }

  function advance() {
    index++;
    if (index >= TOTAL) {
      progressEl.textContent = String(TOTAL);
      progressFill.style.width = "100%";
      refreshOptionStates();
      finish();
      return;
    }
    feedback.textContent = "";
    feedback.className = "feedback";
    answerCard.classList.remove("is-correct");
    selectedId = null;
    refreshOptionStates();
    showAnswer(true);
    locked = false;
    refreshOptionStates();
  }

  function starsFromPct(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function renderStars(n) {
    const el = document.getElementById("stars");
    el.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = (i - 1) * 0.12 + "s";
      el.appendChild(s);
    }
  }

  function finish() {
    stopAudio();
    stage.classList.add("hidden");
    doneBox.classList.remove("hidden");
    const attempts = score + mistakes;
    const pct = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
    document.getElementById("finalScore").textContent =
      score + " / " + TOTAL + " correct · Accuracy: " + pct + "%";
    renderStars(starsFromPct(pct));
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, pct);
      } catch (e) {}
    }
    showFinish(score, TOTAL, start);
  }

  function start() {
    stopAudio();
    clearTimeout(transitionTimer);
    index = 0;
    score = 0;
    mistakes = 0;
    locked = false;
    selectedId = null;
    used = {};
    scoreEl.textContent = "0";
    progressEl.textContent = "0";
    progressFill.style.width = "0%";
    doneBox.classList.add("hidden");
    stage.classList.remove("hidden");
    answerCard.classList.remove("is-correct", "is-wrong");
    optionOrder = shuffle(ITEMS.map(function (it) { return it.id; }));
    renderOptions();
    showAnswer(false);
  }

  checkBtn.addEventListener("click", onCheck);
  document.getElementById("restartBtn").addEventListener("click", start);
  start();
})();
