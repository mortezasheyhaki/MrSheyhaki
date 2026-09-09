(function () {
  "use strict";

  const GAME_ID = "1-3b-his-job-her-job";

  const PARTS = {
    1: {
      title: "Part 1 · Alex",
      person: "Alex",
      audio: "audio/part1.mp3",
      items: [
        { id: "office", q: "Does Alex work in an office?", answer: "no" },
        { id: "evening", q: "Does Alex work in the evening?", answer: "depends" },
        { id: "make", q: "Does Alex make things?", answer: "no" },
        { id: "clothes", q: "Does Alex wear special clothes?", answer: "yes" },
        { id: "drive", q: "Does Alex drive for his job?", answer: "no" },
        { id: "team", q: "Does Alex work on a team?", answer: "yes" },
        { id: "qualifications", q: "Does Alex have special qualifications?", answer: "no" },
        { id: "languages", q: "Does Alex speak foreign languages?", answer: "no" },
        { id: "travel", q: "Does Alex travel for his job?", answer: "yes" },
        { id: "every-weekend", q: "Does Alex travel every weekend?", answer: "no" }
      ]
    },
    2: {
      title: "Part 2 · Sue",
      person: "Sue",
      audio: "audio/part2.mp3",
      items: [
        { id: "outside", q: "Does Sue work outside?", answer: "depends" },
        { id: "weekend", q: "Does Sue work on the weekend?", answer: "yes" },
        { id: "public", q: "Does Sue work with the public?", answer: "no" },
        { id: "vacation", q: "Does Sue get vacation time?", answer: "no" },
        { id: "night", q: "Does Sue work at night?", answer: "depends" },
        { id: "money", q: "Does Sue earn a lot of money?", answer: "no" },
        { id: "like", q: "Does Sue like her job?", answer: "yes" }
      ]
    }
  };

  const JOB_ANSWERS = {
    alex: [
      "soccer player", "a soccer player", "soccerplayer",
      "footballer", "a footballer",
      "football player", "a football player", "footballplayer",
      "soccer", "football"
    ],
    sue: [
      "mom", "a mom", "mum", "a mum",
      "mother", "a mother",
      "full time mother", "a full time mother",
      "full-time mother", "a full-time mother",
      "fulltime mother", "full time mom", "a full time mom",
      "full-time mom", "a full-time mom",
      "housewife", "a housewife",
      "stay at home mom", "stay-at-home mom", "stay at home mother",
      "homemaker", "a homemaker",
      "full time mum", "full-time mum"
    ]
  };

  const ENCOURAGE = [
    "Not quite — try again! Think about the clues from the chart.",
    "Close, but not yet. What kind of job fits those answers?",
    "Keep going! Look at your YES / NO / DEPENDS answers again.",
    "Don’t give up! One more careful guess…",
    "Hmm, not those jobs. What does the team know about them?"
  ];

  const CHOICES = [
    { v: "yes", label: "YES" },
    { v: "no", label: "NO" },
    { v: "depends", label: "DEPENDS" }
  ];

  let part = 1;
  let answers = {};
  let audio = null;
  let checked = false;
  let part1Done = false;
  let part2Done = false;
  let guessAttempts = 0;
  const MAX_ATTEMPTS = 3;

  const chart = document.getElementById("chart");
  const audioBtn = document.getElementById("audioBtn");
  const partTitle = document.getElementById("partTitle");
  const personLabel = document.getElementById("personLabel");
  const feedback = document.getElementById("feedback");
  const done = document.getElementById("done");
  const nextPartBtn = document.getElementById("nextPartBtn");
  const toGuessBtn = document.getElementById("toGuessBtn");
  const phaseChart = document.getElementById("phaseChart");
  const phaseGuess = document.getElementById("phaseGuess");
  const headerSub = document.getElementById("headerSub");
  const guessFeedback = document.getElementById("guessFeedback");
  const attemptInfo = document.getElementById("attemptInfo");
  const listenCheck = document.getElementById("listenCheck");
  const listenCheckMsg = document.getElementById("listenCheckMsg");
  const alexInput = document.getElementById("alexInput");
  const sueInput = document.getElementById("sueInput");
  const guessBtn = document.getElementById("guessBtn");
  const answerAudioBtn = document.getElementById("answerAudioBtn");

  function norm(s) {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .replace(/^an?\s+/, "");
  }

  function matchJob(user, list) {
    const u = norm(user);
    if (!u) return false;
    // strip common fillers
    const cleaned = u
      .replace(/^(he is|she is|he's|she's|i am|i'm)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
    return list.some(function (a) {
      const target = norm(a);
      if (!target) return false;
      if (cleaned === target) return true;
      // allow "soccer player" when answer list has "a soccer player"
      if (cleaned === target.replace(/^(a|an)\s+/, "")) return true;
      // allow short forms only if list entry is short (soccer / football / mom)
      if (target.length <= 10 && (cleaned === target || cleaned.indexOf(target) === 0)) return true;
      // multi-word: all target words appear in user input
      const tw = target.replace(/^(a|an)\s+/, "").split(" ");
      const uw = cleaned.split(" ");
      if (tw.length > 1 && tw.every(function (w) { return uw.indexOf(w) !== -1; })) return true;
      return false;
    });
  }

  function stopAudio() {
    if (audio) {
      audio.pause();
      audio = null;
    }
    audioBtn.classList.remove("playing");
    answerAudioBtn.classList.remove("playing");
  }

  function playFile(src, btn) {
    stopAudio();
    audio = new Audio(src);
    btn.classList.add("playing");
    audio.addEventListener("ended", function () {
      btn.classList.remove("playing");
      audio = null;
    });
    audio.addEventListener("error", function () {
      btn.classList.remove("playing");
    });
    audio.play().catch(function () {
      btn.classList.remove("playing");
    });
  }

  function renderChart() {
    const data = PARTS[part];
    partTitle.textContent = data.title;
    personLabel.textContent = data.person;
    chart.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "feedback";
    checked = false;

    const head = document.createElement("div");
    head.className = "table-head";
    head.innerHTML =
      '<span class="col-num">#</span>' +
      '<span class="col-q">Question</span>' +
      '<span class="col-c">YES</span>' +
      '<span class="col-c">NO</span>' +
      '<span class="col-c">DEPENDS</span>';
    chart.appendChild(head);

    data.items.forEach(function (item, i) {
      const row = document.createElement("div");
      row.className = "table-row";
      row.dataset.id = item.id;

      const num = document.createElement("span");
      num.className = "col-num";
      num.textContent = String(i + 1);

      const q = document.createElement("span");
      q.className = "col-q";
      q.textContent = item.q;

      row.appendChild(num);
      row.appendChild(q);

      CHOICES.forEach(function (c) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "box " + c.v;
        cell.dataset.value = c.v;
        cell.setAttribute("aria-label", c.label);
        cell.innerHTML = '<span class="box-mark"></span>';
        if (answers[item.id] === c.v) cell.classList.add("selected");
        cell.addEventListener("click", function () {
          if (checked) return;
          answers[item.id] = c.v;
          row.querySelectorAll(".box").forEach(function (el) {
            el.classList.remove("selected");
          });
          cell.classList.add("selected");
        });
        row.appendChild(cell);
      });

      chart.appendChild(row);
    });
  }

  function checkChart() {
    const items = PARTS[part].items;
    let correct = 0;
    let total = items.length;
    let unanswered = 0;

    items.forEach(function (item) {
      const row = chart.querySelector('.table-row[data-id="' + item.id + '"]');
      row.classList.remove("correct", "wrong");
      const user = answers[item.id];
      if (!user) {
        unanswered++;
        return;
      }
      if (user === item.answer) {
        correct++;
        row.classList.add("correct");
      } else {
        row.classList.add("wrong");
      }
    });

    if (unanswered === total) {
      feedback.className = "feedback error";
      feedback.textContent = "Select answers, then check.";
      return;
    }

    checked = true;
    const pct = Math.round((correct / total) * 100);
    feedback.className = "feedback " + (correct === total ? "success" : "error");
    feedback.textContent = correct + " / " + total + " correct";

    if (part === 1) part1Done = true;
    if (part === 2) part2Done = true;

    done.classList.remove("hidden");
    document.getElementById("finalScore").textContent =
      correct + " out of " + total + " (" + pct + "%)";
    const starsEl = document.getElementById("stars");
    starsEl.innerHTML = "";
    const n = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = (i - 1) * 0.14 + "s";
      starsEl.appendChild(s);
    }
    // Save stars when a part is completed (best of parts stored under same id + part)
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID + "-part" + part);
        LAStars.saveFromAccuracy(GAME_ID + "-part" + part, pct);
      } catch (e) {}
    }

    if (part === 1) {
      nextPartBtn.classList.remove("hidden");
      nextPartBtn.style.display = "";
      toGuessBtn.classList.add("hidden");
    } else {
      nextPartBtn.classList.add("hidden");
      nextPartBtn.style.display = "none";
      toGuessBtn.classList.remove("hidden");
    }
  }

  function setPart(n) {
    stopAudio();
    part = n;
    answers = {};
    done.classList.add("hidden");
    document.querySelectorAll(".part-tab").forEach(function (tab) {
      const on = Number(tab.dataset.part) === n;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderChart();
  }

  function showGuessPhase() {
    stopAudio();
    done.classList.add("hidden");
    phaseChart.classList.add("hidden");
    phaseGuess.classList.remove("hidden");
    headerSub.textContent = "Guess their jobs";
    guessAttempts = 0;
    alexInput.value = "";
    sueInput.value = "";
    alexInput.classList.remove("ok", "bad");
    sueInput.classList.remove("ok", "bad");
    alexInput.disabled = false;
    sueInput.disabled = false;
    guessBtn.disabled = false;
    guessBtn.classList.remove("hidden");
    guessFeedback.textContent = "";
    guessFeedback.className = "feedback";
    attemptInfo.textContent = "";
    listenCheck.classList.add("hidden");
    alexInput.focus();
  }

  function revealListen(msg) {
    listenCheckMsg.textContent = msg;
    listenCheck.classList.remove("hidden");
    alexInput.disabled = true;
    sueInput.disabled = true;
    guessBtn.classList.add("hidden");
  }

  function checkGuesses() {
    if (guessBtn.disabled) return;

    const alexVal = alexInput.value.trim();
    const sueVal = sueInput.value.trim();
    const alexOk = matchJob(alexVal, JOB_ANSWERS.alex);
    const sueOk = matchJob(sueVal, JOB_ANSWERS.sue);

    if (!alexVal || !sueVal) {
      guessFeedback.className = "feedback error";
      guessFeedback.textContent = !alexVal && !sueVal
        ? "Type a job for Alex and for Sue."
        : (!alexVal ? "Type Alex’s job too." : "Type Sue’s job too.");
      return;
    }

    guessAttempts++;
    const left = MAX_ATTEMPTS - guessAttempts;
    attemptInfo.textContent = "Attempt " + guessAttempts + " of " + MAX_ATTEMPTS;

    // BOTH correct
    if (alexOk && sueOk) {
      guessFeedback.className = "feedback success";
      guessFeedback.textContent = "Yes! You got them both!";
      attemptInfo.textContent = "";
      alexInput.classList.add("ok");
      sueInput.classList.add("ok");
      revealListen("OK, listen and check.");
      setTimeout(function () {
        playFile("audio/answers.mp3", answerAudioBtn);
      }, 450);
      return;
    }

    // Mark fields
    alexInput.classList.toggle("ok", alexOk);
    alexInput.classList.toggle("bad", !alexOk);
    sueInput.classList.toggle("ok", sueOk);
    sueInput.classList.toggle("bad", !sueOk);

    // Encouraging feedback (never harsh — keep them playing)
    var msg;
    if (alexOk && !sueOk) {
      msg = "Alex is right! Now think about Sue… ";
    } else if (!alexOk && sueOk) {
      msg = "Sue is right! Now think about Alex… ";
    } else {
      msg = "";
    }
    msg += ENCOURAGE[guessAttempts % ENCOURAGE.length];
    if (left > 0) {
      msg += " (" + left + " attempt" + (left === 1 ? "" : "s") + " left)";
    }
    guessFeedback.className = "feedback error";
    guessFeedback.textContent = msg;

    // After 3 failed attempts → unlock answer audio
    if (guessAttempts >= MAX_ATTEMPTS) {
      revealListen("Time to listen to the answers.");
      setTimeout(function () {
        playFile("audio/answers.mp3", answerAudioBtn);
      }, 550);
    }
  }

  // Events
  document.querySelectorAll(".part-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (phaseGuess.classList.contains("hidden")) setPart(Number(tab.dataset.part));
    });
  });

  audioBtn.addEventListener("click", function () {
    playFile(PARTS[part].audio, audioBtn);
  });
  answerAudioBtn.addEventListener("click", function () {
    playFile("audio/answers.mp3", answerAudioBtn);
  });

  document.getElementById("checkBtn").addEventListener("click", checkChart);
  document.getElementById("retryBtn").addEventListener("click", function () {
    answers = {};
    checked = false;
    done.classList.add("hidden");
    renderChart();
  });
  nextPartBtn.addEventListener("click", function () {
    setPart(2);
  });
  toGuessBtn.addEventListener("click", showGuessPhase);

  guessBtn.addEventListener("click", checkGuesses);
  [alexInput, sueInput].forEach(function (inp) {
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkGuesses();
      }
    });
  });

  renderChart();
})();
