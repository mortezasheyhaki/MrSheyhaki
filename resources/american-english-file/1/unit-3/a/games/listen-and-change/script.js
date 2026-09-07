(function () {
  const GAME_ID = "aef1-u3a-listen-and-change";

  // subject is shown fixed; student types the FULL sentence including the subject
  const ITEMS = [
    {
      subject: "She",
      promptAudio: "audio/prompt-1.mp3",
      answerAudio: "audio/answer-1.mp3",
      accept: [
        "she lives in an apartment",
        "she lives in an apartment."
      ],
      reveal: "She lives in an apartment."
    },
    {
      subject: "He",
      promptAudio: "audio/prompt-2.mp3",
      answerAudio: "audio/answer-2.mp3",
      accept: [
        "he needs a new phone",
        "he needs a new phone."
      ],
      reveal: "He needs a new phone."
    },
    {
      subject: "She",
      promptAudio: "audio/prompt-3.mp3",
      answerAudio: "audio/answer-3.mp3",
      accept: [
        "she works in an office",
        "she works in an office."
      ],
      reveal: "She works in an office."
    },
    {
      subject: "He",
      promptAudio: "audio/prompt-4.mp3",
      answerAudio: "audio/answer-4.mp3",
      accept: [
        "he wears glasses",
        "he wears glasses."
      ],
      reveal: "He wears glasses."
    },
    {
      subject: "It",
      promptAudio: "audio/prompt-5.mp3",
      answerAudio: "audio/answer-5.mp3",
      accept: [
        "it finishes at 8 o'clock",
        "it finishes at 8 o'clock.",
        "it finishes at eight o'clock",
        "it finishes at eight o'clock.",
        "it finishes at 8:00",
        "it finishes at 8:00."
      ],
      reveal: "It finishes at 8 o'clock."
    },
    {
      subject: "She",
      promptAudio: "audio/prompt-6.mp3",
      answerAudio: "audio/answer-6.mp3",
      accept: [
        "she wants a coffee",
        "she wants a coffee."
      ],
      reveal: "She wants a coffee."
    },
    {
      subject: "He",
      promptAudio: "audio/prompt-7.mp3",
      answerAudio: "audio/answer-7.mp3",
      accept: [
        "he has two children",
        "he has two children."
      ],
      reveal: "He has two children."
    },
    {
      subject: "She",
      promptAudio: "audio/prompt-8.mp3",
      answerAudio: "audio/answer-8.mp3",
      accept: [
        "she does homework",
        "she does homework.",
        "she does her homework",
        "she does her homework."
      ],
      reveal: "She does homework."
    },
    {
      subject: "He",
      promptAudio: "audio/prompt-9.mp3",
      answerAudio: "audio/answer-9.mp3",
      accept: [
        "he studies french",
        "he studies french."
      ],
      reveal: "He studies French."
    },
    {
      subject: "She",
      promptAudio: "audio/prompt-10.mp3",
      answerAudio: "audio/answer-10.mp3",
      accept: [
        "she goes shopping",
        "she goes shopping."
      ],
      reveal: "She goes shopping."
    }
  ];

  const subjectEl = document.getElementById("subject");
  const input = document.getElementById("input");
  const playBtn = document.getElementById("playBtn");
  const checkBtn = document.getElementById("checkBtn");
  const skipBtn = document.getElementById("skipBtn");
  const feedback = document.getElementById("feedback");
  const counter = document.getElementById("counter");
  const bar = document.getElementById("bar");
  const scoreEl = document.getElementById("scoreEl");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const doneBox = document.getElementById("done");
  const finalScore = document.getElementById("finalScore");
  const restartBtn = document.getElementById("restartBtn");
  const starsEl = document.getElementById("stars");

  let index = 0;
  let score = 0;
  let answered = new Array(ITEMS.length).fill(null);
  let locked = false;
  let audio = null;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[?.!]+$/g, "")
      .replace(/\s+/g, " ")
      .replace(/['']/g, "'");
  }

  function stopAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    playBtn.classList.remove("playing");
    playBtn.textContent = "▶";
  }

  function playSrc(src, onEnded) {
    stopAudio();
    audio = new Audio(src);
    playBtn.classList.add("playing");
    playBtn.textContent = "❚❚";
    audio.play().catch(function () {});
    audio.onended = function () {
      playBtn.classList.remove("playing");
      playBtn.textContent = "▶";
      if (onEnded) onEnded();
    };
  }

  function playPrompt() {
    playSrc(ITEMS[index].promptAudio);
  }

  function awardStars(correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, pct);
    }
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function renderStars(n) {
    if (!starsEl) return;
    starsEl.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled pop" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = i * 0.12 + "s";
      starsEl.appendChild(s);
    }
  }

  function finishIfDone() {
    if (!answered.every(function (x) { return x !== null; })) return;
    setTimeout(function () {
      doneBox.classList.remove("hidden");
      finalScore.textContent = score + " / " + ITEMS.length + " correct";
      renderStars(awardStars(score, ITEMS.length));
    }, 700);
  }

  function load() {
    const item = ITEMS[index];
    stopAudio();
    subjectEl.textContent = item.subject;
    // Placeholder shows subject + "..." only on first item as a gentle hint
    input.value = "";
    input.placeholder = index === 0 ? item.subject + "..." : "";
    input.classList.remove("correct", "wrong");
    input.disabled = false;
    feedback.textContent = "";
    feedback.className = "feedback";
    locked = false;
    checkBtn.disabled = false;
    skipBtn.disabled = false;

    counter.textContent = index + 1 + " / " + ITEMS.length;
    bar.style.width = ((index + 1) / ITEMS.length * 100) + "%";
    scoreEl.textContent = score + " correct";

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === ITEMS.length - 1 && answered[index] === null;

    if (answered[index] !== null) {
      input.value = item.reveal;
      input.placeholder = "";
      input.classList.add(answered[index] ? "correct" : "wrong");
      input.disabled = true;
      locked = true;
      checkBtn.disabled = true;
      if (answered[index]) {
        feedback.className = "feedback success";
        feedback.textContent = "Correct ✓";
      } else {
        feedback.className = "feedback error";
        feedback.innerHTML = 'Answer: <span class="correct-reveal">' + item.reveal + "</span>";
      }
    } else {
      // auto-play prompt when landing on a new unanswered item
      setTimeout(playPrompt, 250);
    }

    input.focus();
  }

  function goNext() {
    if (index < ITEMS.length - 1) {
      index++;
      load();
    } else {
      finishIfDone();
    }
  }

  function check() {
    if (locked) return;
    const item = ITEMS[index];
    const user = normalize(input.value);
    if (!user) {
      feedback.className = "feedback info";
      feedback.textContent = "Type your sentence first";
      return;
    }

    // Accept full sentence, or rest-only (without the subject) for convenience
    const restOnly = normalize(user.replace(new RegExp("^" + item.subject + "\\s+", "i"), ""));
    const ok =
      item.accept.some(function (a) { return normalize(a) === user; }) ||
      item.accept.some(function (a) {
        const full = normalize(a);
        const withoutSubj = normalize(full.replace(new RegExp("^" + item.subject.toLowerCase() + "\\s+", "i"), ""));
        return withoutSubj === restOnly || full === restOnly;
      });

    locked = true;
    checkBtn.disabled = true;
    input.disabled = true;
    nextBtn.disabled = false;

    if (ok) {
      input.classList.add("correct");
      input.value = item.reveal;
      feedback.className = "feedback success";
      feedback.textContent = "Correct ✓";
      if (answered[index] === null) {
        score++;
        scoreEl.textContent = score + " correct";
      }
      answered[index] = true;
      // Play correct sentence audio, then auto-advance
      playSrc(item.answerAudio, function () {
        setTimeout(goNext, 400);
      });
    } else {
      input.classList.add("wrong");
      feedback.className = "feedback error";
      feedback.innerHTML = 'Not quite.<span class="correct-reveal">Answer: ' + item.reveal + "</span>";
      answered[index] = false;
      // still play the model answer, then advance
      playSrc(item.answerAudio, function () {
        setTimeout(goNext, 600);
      });
    }

    finishIfDone();
  }

  function skip() {
    if (locked) {
      goNext();
      return;
    }
    const item = ITEMS[index];
    locked = true;
    input.disabled = true;
    checkBtn.disabled = true;
    answered[index] = false;
    feedback.className = "feedback error";
    feedback.innerHTML = 'Answer: <span class="correct-reveal">' + item.reveal + "</span>";
    input.value = item.reveal;
    nextBtn.disabled = false;
    playSrc(item.answerAudio, function () {
      setTimeout(goNext, 500);
    });
    finishIfDone();
  }

  playBtn.addEventListener("click", function () {
    if (locked && answered[index]) {
      playSrc(ITEMS[index].answerAudio);
    } else {
      playPrompt();
    }
  });

  checkBtn.addEventListener("click", check);
  skipBtn.addEventListener("click", skip);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      check();
    }
  });

  prevBtn.addEventListener("click", function () {
    if (index > 0) {
      index--;
      load();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (index < ITEMS.length - 1) {
      index++;
      load();
    }
  });

  restartBtn.addEventListener("click", function () {
    index = 0;
    score = 0;
    answered = new Array(ITEMS.length).fill(null);
    doneBox.classList.add("hidden");
    load();
  });

  load();
})();
