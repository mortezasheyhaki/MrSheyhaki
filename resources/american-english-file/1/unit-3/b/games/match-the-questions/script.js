(function () {
  "use strict";

  const GAME_ID = "1-3b-match-the-questions";

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

  const QUESTIONS = ITEMS.map(function (item) {
    return { id: item.id, question: item.question };
  });

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

  let order = [0, 1, 2, 3, 4];
  let index = 0;
  let score = 0;
  let mistakes = 0;
  let locked = false;
  let used = {};
  let dragId = null;
  let ghost = null;
  let pointerDrag = null; // { id, el, startX, startY, moved }
  let currentAudio = null;

  const questionsEl = document.getElementById("questions");
  const answerText = document.getElementById("answerText");
  const answerCard = document.getElementById("answerCard");
  const dropZone = document.getElementById("dropZone");
  const answerNum = document.getElementById("answerNum");
  const feedback = document.getElementById("feedback");
  const progressEl = document.getElementById("progress");
  const scoreEl = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");
  const doneBox = document.getElementById("done");
  const hint = document.getElementById("hint");

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
    audio.addEventListener("ended", function () {
      currentAudio = null;
      if (onEnded) onEnded();
    });
    audio.addEventListener("error", function () {
      currentAudio = null;
      if (onEnded) onEnded();
    });
    audio.play().catch(function () {
      // Autoplay blocked or missing file — still advance after a short delay
      setTimeout(function () {
        currentAudio = null;
        if (onEnded) onEnded();
      }, 800);
    });
  }

  function renderQuestions() {
    questionsEl.innerHTML = "";
    const bank = shuffle(QUESTIONS);
    bank.forEach(function (q) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "q-btn" + (used[q.id] ? " used" : "");
      btn.textContent = q.question;
      btn.dataset.id = q.id;
      btn.disabled = !!used[q.id];
      btn.draggable = !used[q.id];
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-grabbed", "false");

      // HTML5 drag (desktop)
      btn.addEventListener("dragstart", function (e) {
        if (used[q.id] || locked) {
          e.preventDefault();
          return;
        }
        dragId = q.id;
        btn.classList.add("dragging");
        btn.setAttribute("aria-grabbed", "true");
        e.dataTransfer.setData("text/plain", q.id);
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setDragImage(btn, btn.offsetWidth / 2, 20);
        } catch (err) {}
      });
      btn.addEventListener("dragend", function () {
        btn.classList.remove("dragging");
        btn.setAttribute("aria-grabbed", "false");
        dragId = null;
        dropZone.classList.remove("drag-over");
      });

      // Pointer drag (mobile + desktop fallback)
      btn.addEventListener("pointerdown", function (e) {
        if (used[q.id] || locked || e.button === 2) return;
        if (e.pointerType === "mouse" && e.buttons !== 1) return;
        pointerDrag = {
          id: q.id,
          el: btn,
          startX: e.clientX,
          startY: e.clientY,
          moved: false,
          pointerId: e.pointerId
        };
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      });

      // Tap / click still works as fallback
      btn.addEventListener("click", function (e) {
        if (pointerDrag && pointerDrag.moved) {
          e.preventDefault();
          return;
        }
        onPick(q.id, btn);
      });

      questionsEl.appendChild(btn);
    });
  }

  function onPointerMove(e) {
    if (!pointerDrag || locked) return;
    const dx = e.clientX - pointerDrag.startX;
    const dy = e.clientY - pointerDrag.startY;
    if (!pointerDrag.moved && Math.hypot(dx, dy) < 8) return;

    if (!pointerDrag.moved) {
      pointerDrag.moved = true;
      pointerDrag.el.classList.add("dragging");
      ghost = pointerDrag.el.cloneNode(true);
      ghost.className = "q-btn drag-ghost";
      ghost.style.width = pointerDrag.el.offsetWidth + "px";
      document.body.appendChild(ghost);
      pointerDrag.el.classList.add("drag-source");
      dragId = pointerDrag.id;
    }

    if (ghost) {
      ghost.style.transform =
        "translate(" + (e.clientX - pointerDrag.el.offsetWidth / 2) + "px," +
        (e.clientY - 24) + "px)";
    }

    const over = document.elementFromPoint(e.clientX, e.clientY);
    const overDrop = over && (over === dropZone || dropZone.contains(over) || over === answerCard || answerCard.contains(over));
    dropZone.classList.toggle("drag-over", !!overDrop);
  }

  function onPointerUp(e) {
    if (!pointerDrag) return;
    const pd = pointerDrag;
    pointerDrag = null;

    try { pd.el.releasePointerCapture(pd.pointerId); } catch (err) {}

    if (ghost) {
      ghost.remove();
      ghost = null;
    }
    pd.el.classList.remove("dragging", "drag-source");
    dropZone.classList.remove("drag-over");

    if (!pd.moved) {
      // treat as click — handled by click listener
      dragId = null;
      return;
    }

    const over = document.elementFromPoint(e.clientX, e.clientY);
    const overDrop = over && (over === dropZone || dropZone.contains(over) || over === answerCard || answerCard.contains(over));
    if (overDrop && dragId) {
      onPick(dragId, pd.el);
    }
    dragId = null;
  }

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);

  // Drop zone HTML5 events
  function setupDropZone(el) {
    el.addEventListener("dragover", function (e) {
      if (!dragId || locked) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      dropZone.classList.add("drag-over");
    });
    el.addEventListener("dragleave", function (e) {
      if (!el.contains(e.relatedTarget)) {
        dropZone.classList.remove("drag-over");
      }
    });
    el.addEventListener("drop", function (e) {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain") || dragId;
      if (!id || locked) return;
      const btn = questionsEl.querySelector('.q-btn[data-id="' + id + '"]');
      onPick(id, btn);
      dragId = null;
    });
  }
  setupDropZone(dropZone);
  setupDropZone(answerCard);

  function showAnswer() {
    if (index >= order.length) {
      finish();
      return;
    }
    const item = ITEMS[order[index]];
    answerNum.textContent = String(index + 1);
    answerText.textContent = item.answer;
    answerCard.classList.remove("enter");
    void answerCard.offsetWidth;
    answerCard.classList.add("enter");
    feedback.textContent = "";
    feedback.className = "feedback";
    hint.textContent = "Drag a question onto the answer — or tap it.";
    locked = false;
    progressEl.textContent = String(index);
    progressFill.style.width = (index / ITEMS.length) * 100 + "%";
  }

  function advanceAfterCorrect() {
    dropZone.classList.remove("drop-success");
    index++;
    if (index >= ITEMS.length) {
      progressEl.textContent = String(ITEMS.length);
      progressFill.style.width = "100%";
      finish();
    } else {
      Array.prototype.forEach.call(questionsEl.querySelectorAll(".q-btn"), function (b) {
        if (used[b.dataset.id]) {
          b.classList.add("used");
          b.disabled = true;
          b.draggable = false;
        }
        b.classList.remove("correct-flash", "wrong-flash");
      });
      showAnswer();
    }
  }

  function onPick(qid, btn) {
    if (locked || used[qid]) return;
    const item = ITEMS[order[index]];
    locked = true;

    if (qid === item.id) {
      score++;
      scoreEl.textContent = String(score);
      used[qid] = true;
      if (btn) {
        btn.classList.add("correct-flash", "used");
        btn.disabled = true;
        btn.draggable = false;
      }
      dropZone.classList.add("drop-success");
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓ Listening…";
      hint.textContent = "Listen to the full dialogue before the next answer.";

      // Play the full Q+A audio and only then advance
      playAudio(item.audio, function () {
        advanceAfterCorrect();
      });
    } else {
      if (btn) btn.classList.add("wrong-flash");
      mistakes++;
      dropZone.classList.add("drop-wrong");
      feedback.className = "feedback error";
      feedback.textContent = "Not this one — try another question.";
      setTimeout(function () {
        if (btn) btn.classList.remove("wrong-flash");
        dropZone.classList.remove("drop-wrong");
        locked = false;
      }, 450);
    }
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
    document.querySelector(".questions-panel").classList.add("hidden");
    document.querySelector(".answer-panel").classList.add("hidden");
    doneBox.classList.remove("hidden");
    const attempts = score + mistakes;
    const pct = attempts > 0 ? Math.round((score / attempts) * 100) : Math.round((score / ITEMS.length) * 100);
    document.getElementById("finalScore").textContent =
      score + " / " + ITEMS.length + " correct · Accuracy: " + pct + "%";
    renderStars(starsFromPct(pct));
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, pct);
      } catch (e) {}
    }
  }

  function start() {
    stopAudio();
    order = [0, 1, 2, 3, 4];
    index = 0;
    score = 0;
    mistakes = 0;
    used = {};
    locked = false;
    dragId = null;
    scoreEl.textContent = "0";
    progressEl.textContent = "0";
    progressFill.style.width = "0%";
    doneBox.classList.add("hidden");
    document.querySelector(".questions-panel").classList.remove("hidden");
    document.querySelector(".answer-panel").classList.remove("hidden");
    renderQuestions();
    showAnswer();
  }

  document.getElementById("restartBtn").addEventListener("click", start);
  start();
})();
