/* Clock Match · AEF Starter PE3 — Jobs Match layout */
(function () {
  "use strict";

  const GAME_ID = "starter-pe3-clock-match";

  const ITEMS = [
    { id: "t300", label: "three o'clock",           image: "https://cdn.imgurl.ir/uploads/s84497_.png",  audio: "https://cdn.imgurl.ir/uploads/t813290_.mp3" },
    { id: "t305", label: "five after three",        image: "https://cdn.imgurl.ir/uploads/p204467_.png", audio: "https://cdn.imgurl.ir/uploads/k293597_.mp3" },
    { id: "t310", label: "ten after three",         image: "https://cdn.imgurl.ir/uploads/t743875_.png", audio: "https://cdn.imgurl.ir/uploads/s048945_.mp3" },
    { id: "t315", label: "a quarter after three",   image: "https://cdn.imgurl.ir/uploads/n020904_.png", audio: "https://cdn.imgurl.ir/uploads/y454059_.mp3" },
    { id: "t320", label: "twenty after three",      image: "https://cdn.imgurl.ir/uploads/g6937_.png",   audio: "https://cdn.imgurl.ir/uploads/v46301_.mp3" },
    { id: "t325", label: "twenty-five after three", image: "https://cdn.imgurl.ir/uploads/b756224_.png",  audio: "https://cdn.imgurl.ir/uploads/n311557_.mp3" },
    { id: "t330", label: "three-thirty",            image: "https://cdn.imgurl.ir/uploads/z791949_.png",   audio: "https://cdn.imgurl.ir/uploads/s992551_.mp3" },
    { id: "t335", label: "twenty-five to four",     image: "https://cdn.imgurl.ir/uploads/g733459_.png", audio: "https://cdn.imgurl.ir/uploads/a01599_.mp3" },
    { id: "t340", label: "twenty to four",          image: "https://cdn.imgurl.ir/uploads/r78679_.png",  audio: "https://cdn.imgurl.ir/uploads/i77224_.mp3" },
    { id: "t345", label: "a quarter to four",       image: "https://cdn.imgurl.ir/uploads/p85303_.png",  audio: "https://cdn.imgurl.ir/uploads/k0321_.mp3" },
    { id: "t350", label: "ten to four",             image: "https://cdn.imgurl.ir/uploads/e60046_.png",  audio: "https://cdn.imgurl.ir/uploads/s983135_.mp3" },
    { id: "t355", label: "five to four",            image: "https://cdn.imgurl.ir/uploads/i16423_.png",  audio: "https://cdn.imgurl.ir/uploads/e30666_.mp3" }
  ];

  const MODE_META = {
    "pic-time":   { title: "Clocks ↔ Times", left: "pic",   right: "word", playAudioOnMatch: false },
    "audio-time": { title: "Audio ↔ Times",  left: "audio", right: "word", playAudioOnMatch: false },
    "audio-pic":  { title: "Audio ↔ Clocks", left: "audio", right: "pic",  playAudioOnMatch: false }
  };
  const PART_ORDER = ["pic-time", "audio-time", "audio-pic"];
  const PAIRS_PER_ROUND = 6;
  const ROUNDS_PER_PART = 2;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sfx(name) {
    try { if (window.LASfx && LASfx[name]) LASfx[name](); } catch (e) {}
  }

  let mode = null, partIndex = 0, rounds = [], roundIndex = 0;
  let matched = 0, score = 0, totalMatched = 0, mistakes = 0;
  let locked = false, selected = null, currentAudio = null, playRecorded = false;

  const modeScreen = document.getElementById("modeScreen");
  const playScreen = document.getElementById("playScreen");
  const doneScreen = document.getElementById("doneScreen");
  const colLeft = document.getElementById("colLeft");
  const colRight = document.getElementById("colRight");
  const feedback = document.getElementById("feedback");
  const hint = document.getElementById("hint");
  const matchedCount = document.getElementById("matchedCount");
  const scoreEl = document.getElementById("score");
  const roundNum = document.getElementById("roundNum");
  const partNum = document.getElementById("partNum");
  const modeLabel = document.getElementById("modeLabel");

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    document.querySelectorAll(".mc-play.playing").forEach(function (el) {
      el.classList.remove("playing");
    });
  }

  function playItemAudio(id, onEnded, playBtn) {
    stopAudio();
    const item = ITEMS.find(function (x) { return x.id === id; });
    if (!item) { if (onEnded) onEnded(); return; }
    const a = new Audio(item.audio);
    currentAudio = a;
    if (playBtn) playBtn.classList.add("playing");
    let called = false;
    function done() {
      if (called) return;
      called = true;
      if (currentAudio === a) currentAudio = null;
      document.querySelectorAll(".mc-play.playing").forEach(function (el) {
        el.classList.remove("playing");
      });
      if (onEnded) onEnded();
    }
    a.onended = done;
    a.onerror = done;
    a.play().catch(done);
  }

  function showScreen(name) {
    modeScreen.classList.toggle("hidden", name !== "mode");
    playScreen.classList.toggle("hidden", name !== "play");
    doneScreen.classList.toggle("hidden", name !== "done");
  }

  function makeLeft(item, kind) {
    const el = document.createElement("div");
    el.dataset.id = item.id;
    if (kind === "audio") {
      el.className = "mc-left-item mc-audio-cell";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", "Play audio and select");
      el.innerHTML =
        '<button type="button" class="mc-play" aria-label="Play audio">' +
        '<span class="wave" aria-hidden="true"></span><span class="wave" aria-hidden="true"></span><span class="wave" aria-hidden="true"></span>' +
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<span class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
        "</button>";
      const pb = el.querySelector(".mc-play");

      function triggerAudioAndSelect(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (locked || el.classList.contains("is-used")) return;
        // Tap again on the same playing card → stop
        if (pb.classList.contains("playing") && currentAudio && selected && selected.el === el) {
          stopAudio();
          return;
        }
        playItemAudio(item.id, null, pb);
        onPick(el, "left");
      }

      // Whole card is clickable / tappable
      el.addEventListener("click", triggerAudioAndSelect);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") triggerAudioAndSelect(e);
      });
      // Play button also works (same handler; stopPropagation inside)
      pb.addEventListener("click", triggerAudioAndSelect);
    } else if (kind === "pic") {
      el.className = "mc-left-item mc-pic-cell";
      el.innerHTML = '<img class="mc-thumb" src="' + item.image + '" alt="Clock ' + item.label + '" draggable="false" loading="lazy" />';
      el.addEventListener("click", function () {
        if (!locked) onPick(el, "left");
      });
    } else {
      el.className = "mc-left-item mc-word-left";
      el.innerHTML = '<span class="mc-word-label">' + item.label + "</span>";
      el.addEventListener("click", function () {
        if (!locked) onPick(el, "left");
      });
    }
    return el;
  }

  function makeRight(item, kind) {
    const el = document.createElement("button");
    el.type = "button";
    el.dataset.id = item.id;
    if (kind === "pic") {
      el.className = "mc-right-item mc-pic-btn";
      el.innerHTML = '<img class="mc-thumb" src="' + item.image + '" alt="Clock ' + item.label + '" draggable="false" loading="lazy" />';
    } else {
      el.className = "mc-right-item mc-word";
      el.innerHTML = '<span class="mc-word-label">' + item.label + "</span>";
    }
    el.addEventListener("click", function () {
      if (!locked) onPick(el, "right");
    });
    return el;
  }

  function startAll() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    partIndex = 0; score = 0; totalMatched = 0; mistakes = 0; playRecorded = false;
    startPart(0);
  }

  function startPart(pi) {
    partIndex = pi;
    mode = PART_ORDER[pi];
    const shuffled = shuffle(ITEMS);
    rounds = [];
    for (let i = 0; i < ROUNDS_PER_PART; i++) {
      rounds.push(shuffled.slice(i * PAIRS_PER_ROUND, (i + 1) * PAIRS_PER_ROUND));
    }
    roundIndex = 0;
    matched = 0;
    modeLabel.textContent = MODE_META[mode].title;
    partNum.textContent = String(partIndex + 1);
    showScreen("play");
    renderRound();
  }

  function renderRound() {
    stopAudio();
    selected = null;
    locked = false;
    matched = 0;
    matchedCount.textContent = "0";
    scoreEl.textContent = String(score);
    roundNum.textContent = String(roundIndex + 1);
    feedback.textContent = "";
    feedback.className = "mc-feedback";
    const meta = MODE_META[mode];
    hint.textContent = meta.left === "audio"
      ? "Tap a speaker to listen, then match it on the right."
      : "Tap a card on each side to match.";

    const batch = rounds[roundIndex];
    colLeft.innerHTML = "";
    colRight.innerHTML = "";
    shuffle(batch).forEach(function (it) { colLeft.appendChild(makeLeft(it, meta.left)); });
    shuffle(batch).forEach(function (it) { colRight.appendChild(makeRight(it, meta.right)); });
  }

  function onPick(el, side) {
    if (locked || el.classList.contains("is-used") || el.classList.contains("is-correct")) return;
    const id = el.dataset.id;

    if (selected && selected.el === el) {
      el.classList.remove("is-selected");
      selected = null;
      return;
    }
    if (!selected || selected.side === side) {
      if (selected) selected.el.classList.remove("is-selected");
      el.classList.add("is-selected");
      selected = { side: side, id: id, el: el };
      sfx("click");
      return;
    }

    locked = true;
    const leftEl = selected.side === "left" ? selected.el : el;
    const rightEl = selected.side === "right" ? selected.el : el;
    const ok = leftEl.dataset.id === rightEl.dataset.id;

    if (ok) {
      leftEl.classList.remove("is-selected");
      rightEl.classList.remove("is-selected");
      leftEl.classList.add("is-correct");
      rightEl.classList.add("is-correct");
      matched++;
      totalMatched++;
      score += 10;
      matchedCount.textContent = String(matched);
      scoreEl.textContent = String(score);
      feedback.className = "mc-feedback success";
      feedback.textContent = "Correct! ✓";
      sfx("correct");

      const meta = MODE_META[mode];
      let finished = false;
      const finishMatch = function () {
        if (finished) return;
        finished = true;
        leftEl.classList.add("is-used");
        rightEl.classList.add("is-used");
        leftEl.classList.remove("is-correct");
        rightEl.classList.remove("is-correct");
        selected = null;
        locked = false;
        feedback.textContent = "";
        if (matched >= PAIRS_PER_ROUND) setTimeout(roundDone, 350);
      };

      if (meta.playAudioOnMatch) {
        playItemAudio(leftEl.dataset.id, function () { setTimeout(finishMatch, 150); });
      } else {
        setTimeout(finishMatch, 280);
      }
    } else {
      leftEl.classList.remove("is-selected");
      rightEl.classList.remove("is-selected");
      mistakes++;
      leftEl.classList.add("is-wrong");
      rightEl.classList.add("is-wrong");
      feedback.className = "mc-feedback error";
      feedback.textContent = "Try again";
      sfx("wrong");
      setTimeout(function () {
        leftEl.classList.remove("is-wrong");
        rightEl.classList.remove("is-wrong");
        selected = null;
        locked = false;
        feedback.textContent = "";
      }, 450);
    }
  }

  function roundDone() {
    if (roundIndex + 1 < ROUNDS_PER_PART) {
      roundIndex++;
      setTimeout(renderRound, 180);
      return;
    }
    if (partIndex + 1 < PART_ORDER.length) {
      feedback.className = "mc-feedback success";
      feedback.textContent = "Part complete! Next…";
      setTimeout(function () { startPart(partIndex + 1); }, 700);
      return;
    }
    finishGame();
  }

  function calcStars() {
    const total = PART_ORDER.length * ROUNDS_PER_PART * PAIRS_PER_ROUND;
    const attempts = totalMatched + mistakes;
    const pct = attempts > 0 ? Math.round((totalMatched / attempts) * 100) : 100;
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function finishGame() {
    stopAudio();
    const stars = calcStars();
    const total = PART_ORDER.length * ROUNDS_PER_PART * PAIRS_PER_ROUND;
    if (window.LAStars) {
      try {
        if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
        LAStars.save(GAME_ID, stars);
      } catch (e) {}
    }
    sfx("win");
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: totalMatched,
        total: total,
        stars: stars,
        accuracy: Math.round((totalMatched / Math.max(totalMatched + mistakes, 1)) * 100),
        timeMs: timeMs,
        save: false,
        onAgain: startAll,
        backHref: "../"
      });
    }
    const starsEl = document.getElementById("stars");
    starsEl.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= stars ? " filled" : "");
      s.textContent = i <= stars ? "★" : "☆";
      starsEl.appendChild(s);
    }
    document.getElementById("doneTitle").textContent =
      stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!";
    document.getElementById("finalScore").textContent =
      "Matched " + totalMatched + " / " + total + " · Score " + score +
      (mistakes ? " · Mistakes " + mistakes : "");
    showScreen("done");
  }

  document.getElementById("startModeBtn").addEventListener("click", function () {
    sfx("click");
    startAll();
  });
  document.getElementById("againBtn").addEventListener("click", function () {
    sfx("click");
    startAll();
  });
})();
