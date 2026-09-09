(function () {
  "use strict";

  const GAME_ID = "1-3b-jobs-match";

  const JOBS = [
    { id: "accountant", label: "an accountant" },
    { id: "actor", label: "an actor" },
    { id: "administrator", label: "an administrator" },
    { id: "architect", label: "an architect" },
    { id: "chef", label: "a chef" },
    { id: "cleaner", label: "a cleaner" },
    { id: "construction-worker", label: "a construction worker" },
    { id: "dentist", label: "a dentist" },
    { id: "doctor", label: "a doctor" },
    { id: "engineer", label: "an engineer" },
    { id: "factory-worker", label: "a factory worker" },
    { id: "flight-attendant", label: "a flight attendant" },
    { id: "guide", label: "a guide" },
    { id: "hairstylist", label: "a hair stylist" },
    { id: "journalist", label: "a journalist" },
    { id: "lawyer", label: "a lawyer" },
    { id: "manager", label: "a manager" },
    { id: "model", label: "a model" },
    { id: "musician", label: "a musician" },
    { id: "nurse", label: "a nurse" },
    { id: "pilot", label: "a pilot" },
    { id: "police-officer", label: "a police officer" },
    { id: "receptionist", label: "a receptionist" },
    { id: "salesperson", label: "a salesperson" },
    { id: "soccer-player", label: "a soccer player" },
    { id: "soldier", label: "a soldier" },
    { id: "taxi-driver", label: "a taxi driver" },
    { id: "teacher", label: "a teacher" },
    { id: "vet", label: "a vet" },
    { id: "waiter", label: "a waiter / waitress" }
  ];

  const MODE_META = {
    "word-pic": { title: "Words ↔ Pictures", left: "word", right: "pic", playAudioOnMatch: true },
    "word-audio": { title: "Words ↔ Audio", left: "audio", right: "word", playAudioOnMatch: false },
    "audio-pic": { title: "Audio ↔ Pictures", left: "audio", right: "pic", playAudioOnMatch: false }
  };

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

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  let mode = null;
  let rounds = []; // 5 arrays of 6 jobs
  let roundIndex = 0;
  let matched = 0;
  let score = 0;
  let totalMatched = 0;
  let mistakes = 0; // across all rounds this mode
  let locked = false;
  let selected = null; // { side, id, el }
  let currentAudio = null;

  const modeScreen = document.getElementById("modeScreen");
  const playScreen = document.getElementById("playScreen");
  const doneScreen = document.getElementById("doneScreen");
  const colLeft = document.getElementById("colLeft");
  const colRight = document.getElementById("colRight");
  const feedback = document.getElementById("feedback");
  const hint = document.getElementById("hint");
  const matchedCount = document.getElementById("matchedCount");
  const scoreEl = document.getElementById("score");
  const progressFill = document.getElementById("progressFill");
  const roundNum = document.getElementById("roundNum");
  const modeLabel = document.getElementById("modeLabel");

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    document.querySelectorAll(".tile.audio.playing").forEach(function (el) {
      el.classList.remove("playing");
    });
  }

  function playJobAudio(id, onEnded) {
    stopAudio();
    const a = new Audio("audio/" + id + ".mp3");
    currentAudio = a;
    a.addEventListener("ended", function () {
      currentAudio = null;
      document.querySelectorAll(".tile.audio.playing").forEach(function (el) {
        el.classList.remove("playing");
      });
      if (onEnded) onEnded();
    });
    a.addEventListener("error", function () {
      currentAudio = null;
      if (onEnded) onEnded();
    });
    a.play().catch(function () {
      if (onEnded) onEnded();
    });
    return a;
  }

  function showScreen(name) {
    modeScreen.classList.toggle("hidden", name !== "mode");
    playScreen.classList.toggle("hidden", name !== "play");
    doneScreen.classList.toggle("hidden", name !== "done");
  }

  function makeTile(job, type, side) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile " + type;
    btn.dataset.id = job.id;
    btn.dataset.side = side;
    btn.dataset.type = type;

    if (type === "word") {
      const span = document.createElement("span");
      span.className = "tile-label";
      span.textContent = job.label;
      btn.appendChild(span);
    } else if (type === "pic") {
      const img = document.createElement("img");
      img.src = "images/" + job.id + ".png";
      img.alt = job.label;
      img.loading = "lazy";
      btn.appendChild(img);
    } else if (type === "audio") {
      const wrap = document.createElement("span");
      wrap.className = "audio-btn";
      wrap.innerHTML =
        '<span class="audio-rings" aria-hidden="true"></span>' +
        '<span class="audio-core" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none">' +
        '<rect x="4" y="9" width="3" height="6" rx="1.5" fill="currentColor"/>' +
        '<rect x="10.5" y="5" width="3" height="14" rx="1.5" fill="currentColor"/>' +
        '<rect x="17" y="8" width="3" height="8" rx="1.5" fill="currentColor"/>' +
        '</svg></span>';
      btn.appendChild(wrap);
    }

    btn.addEventListener("click", function () {
      onTileClick(btn, job, type, side);
    });
    return btn;
  }

  function renderRound() {
    stopAudio();
    const jobs = rounds[roundIndex];
    const meta = MODE_META[mode];
    matched = 0;
    locked = false;
    selected = null;
    feedback.textContent = "";
    feedback.className = "feedback";
    hint.textContent = "Tap a card on each side to match.";

    roundNum.textContent = String(roundIndex + 1);
    matchedCount.textContent = "0";
    progressFill.style.width = (roundIndex / rounds.length) * 100 + "%";

    const leftJobs = shuffle(jobs);
    const rightJobs = shuffle(jobs);

    colLeft.innerHTML = "";
    colRight.innerHTML = "";

    leftJobs.forEach(function (j) {
      colLeft.appendChild(makeTile(j, meta.left, "left"));
    });
    rightJobs.forEach(function (j) {
      colRight.appendChild(makeTile(j, meta.right, "right"));
    });
  }

  function clearSelection() {
    if (selected && selected.el) selected.el.classList.remove("selected");
    selected = null;
  }

  function onTileClick(btn, job, type, side) {
    if (locked || btn.classList.contains("matched") || btn.classList.contains("correct")) return;

    // Audio tiles: always play sound on tap
    if (type === "audio") {
      btn.classList.add("playing");
      playJobAudio(job.id);
    }

    if (!selected) {
      clearSelection();
      selected = { side: side, id: job.id, el: btn };
      btn.classList.add("selected");
      return;
    }

    // Same side → reselect
    if (selected.side === side) {
      clearSelection();
      selected = { side: side, id: job.id, el: btn };
      btn.classList.add("selected");
      return;
    }

    // Different side → try match
    locked = true;
    const leftEl = selected.side === "left" ? selected.el : btn;
    const rightEl = selected.side === "right" ? selected.el : btn;
    const leftId = selected.side === "left" ? selected.id : job.id;
    const rightId = selected.side === "right" ? selected.id : job.id;

    if (leftId === rightId) {
      // Correct
      leftEl.classList.remove("selected");
      rightEl.classList.remove("selected");
      leftEl.classList.add("correct");
      rightEl.classList.add("correct");
      matched++;
      score++;
      totalMatched++;
      matchedCount.textContent = String(matched);
      scoreEl.textContent = String(score);
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓";

      const meta = MODE_META[mode];
      const finishMatch = function () {
        leftEl.classList.add("matched");
        rightEl.classList.add("matched");
        leftEl.classList.remove("correct");
        rightEl.classList.remove("correct");
        selected = null;
        locked = false;
        feedback.textContent = "";
        if (matched >= 6) {
          setTimeout(roundDone, 350);
        }
      };

      if (meta.playAudioOnMatch) {
        playJobAudio(leftId, function () {
          setTimeout(finishMatch, 200);
        });
      } else {
        setTimeout(finishMatch, 550);
      }
    } else {
      // Wrong
      leftEl.classList.remove("selected");
      rightEl.classList.remove("selected");
      mistakes++;
      leftEl.classList.add("wrong");
      rightEl.classList.add("wrong");
      feedback.className = "feedback error";
      feedback.textContent = "Try again";
      setTimeout(function () {
        leftEl.classList.remove("wrong");
        rightEl.classList.remove("wrong");
        selected = null;
        locked = false;
        feedback.textContent = "";
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

  function roundDone() {
    progressFill.style.width = ((roundIndex + 1) / rounds.length) * 100 + "%";
    const isLast = roundIndex >= rounds.length - 1;

    if (!isLast) {
      // Skip intermediate screen — go straight to next round
      roundIndex++;
      setTimeout(function () {
        renderRound();
      }, 400);
      return;
    }

    // Final round only — show completion screen
    document.getElementById("doneTitle").textContent = "All rounds complete!";
    const attempts = totalMatched + mistakes;
    const pct = attempts > 0 ? Math.round((totalMatched / attempts) * 100) : 100;
    document.getElementById("finalScore").textContent =
      "Matched: " + totalMatched + " / 30 · Accuracy: " + pct + "%";
    renderStars(starsFromPct(pct));
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID + "-" + mode);
        LAStars.saveFromAccuracy(GAME_ID + "-" + mode, pct);
      } catch (e) {}
    }
    document.getElementById("nextRoundBtn").style.display = "none";
    showScreen("done");
  }

  function startMode(m) {
    mode = m;
    modeLabel.textContent = MODE_META[m].title;
    rounds = chunk(shuffle(JOBS), 6);
    // ensure exactly 5 rounds of 6
    while (rounds.length > 5) rounds.pop();
    while (rounds.length < 5) {
      // pad if needed (shouldn't happen with 30)
      rounds.push(shuffle(JOBS).slice(0, 6));
    }
    roundIndex = 0;
    score = 0;
    totalMatched = 0;
    mistakes = 0;
    scoreEl.textContent = "0";
    showScreen("play");
    renderRound();
  }

  // Mode buttons
  document.querySelectorAll(".mode-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      startMode(btn.dataset.mode);
    });
  });

  document.getElementById("backToModes").addEventListener("click", function () {
    stopAudio();
    showScreen("mode");
  });

  document.getElementById("nextRoundBtn").addEventListener("click", function () {
    roundIndex++;
    if (roundIndex >= rounds.length) {
      showScreen("mode");
      return;
    }
    showScreen("play");
    renderRound();
  });

  document.getElementById("replayModeBtn").addEventListener("click", function () {
    if (mode) startMode(mode);
  });

  document.getElementById("changeModeBtn").addEventListener("click", function () {
    stopAudio();
    showScreen("mode");
  });

  showScreen("mode");
})();
