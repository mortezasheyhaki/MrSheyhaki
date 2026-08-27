(function () {
  "use strict";

  const GAME_ID = "starter-7b-pronouns-words";

  const PRONOUN_PAIRS = [
    { id: "i", left: "I", right: "me", subjectAudio: "../audio/i.mp3", objectAudio: "../audio/me.mp3" },
    { id: "you", left: "you", right: "you", subjectAudio: "../audio/you.mp3", objectAudio: "../audio/you.mp3" },
    { id: "he", left: "he", right: "him", subjectAudio: "../audio/he.mp3", objectAudio: "../audio/him.mp3" },
    { id: "she", left: "she", right: "her", subjectAudio: "../audio/she.mp3", objectAudio: "../audio/her.mp3" },
    { id: "it", left: "it", right: "it", subjectAudio: "../audio/it.mp3", objectAudio: "../audio/it.mp3" },
    { id: "we", left: "we", right: "us", subjectAudio: "../audio/we.mp3", objectAudio: "../audio/us.mp3" },
    { id: "they", left: "they", right: "them", subjectAudio: "../audio/they.mp3", objectAudio: "../audio/them.mp3" },
  ];

  const NOUN_PAIRS = [
    { id: "scarlett", left: "Scarlett", right: "her" },
    { id: "dogs", left: "dogs", right: "them" },
    { id: "house", left: "your house", right: "it" },
    { id: "daniel", left: "Daniel", right: "him" },
    { id: "book", left: "the book", right: "it" },
    { id: "cats", left: "cats", right: "them" },
    { id: "mother", left: "your mother", right: "her" },
    { id: "brother", left: "your brother", right: "him" },
  ];

  const MODE_LABELS = [
    "Subject → Object",
    "Audio → Object",
    "Noun → Object",
  ];

  const AUDIO_PILL_HTML =
    '<span class="audio-pill" aria-hidden="true">' +
    '<svg class="audio-speaker" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>' +
    '<span class="audio-bars"><i></i><i></i><i></i><i></i></span>' +
    "</span>";

  const $ = (id) => document.getElementById(id);

  let mode = 0;
  let pairs = [];
  let score = 0;
  let correctPairs = 0;
  let attempts = 0;
  let selectedLeft = null;
  let selectedRight = null;
  let matched = {};
  let locked = false;
  let currentAudio = null;

  const pairsGrid = $("pairsGrid");
  const feedback = $("feedback");

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function show(screen) {
    $("startScreen").hidden = screen !== "start";
    $("gameScreen").hidden = screen !== "game";
    $("endScreen").hidden = screen !== "end";
  }

  function setFb(msg, type) {
    feedback.textContent = msg || "";
    feedback.className = "feedback" + (type ? " " + type : "");
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    document.querySelectorAll(".pair-btn.is-playing").forEach(function (b) {
      b.classList.remove("is-playing");
    });
  }

  function playSrc(src, btn) {
    stopAudio();
    var a = new Audio(src);
    currentAudio = a;
    if (btn) btn.classList.add("is-playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("is-playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function getPairs() {
    return mode === 2 ? NOUN_PAIRS.slice() : PRONOUN_PAIRS.slice();
  }

  function renderBoard() {
    pairs = getPairs();
    matched = {};
    selectedLeft = null;
    selectedRight = null;
    locked = false;
    correctPairs = 0;
    attempts = 0;
    score = 0;

    $("promptText").textContent = MODE_LABELS[mode];
    $("roundText").textContent = "1 / 1";
    $("scoreText").textContent = "0";
    $("matchedText").textContent = "0 / " + pairs.length;
    setFb("");

    pairsGrid.className = "pairs-grid pairs-n";
    pairsGrid.style.setProperty("--pair-rows", String(pairs.length));

    var leftOrder = shuffle(pairs.slice());
    var rightOrder = shuffle(pairs.slice());

    var leftBtns = leftOrder.map(function (p) {
      return makeBtn({
        id: p.id,
        side: "left",
        label: p.left,
        // Audio → Object plays the OBJECT pronoun
        audio: mode === 1 ? (p.objectAudio || null) : (p.subjectAudio || null),
        isAudio: mode === 1,
      });
    });
    var rightBtns = rightOrder.map(function (p) {
      return makeBtn({
        id: p.id,
        side: "right",
        label: p.right,
        audio: null,
        isAudio: false,
      });
    });

    pairsGrid.innerHTML = "";
    for (var i = 0; i < pairs.length; i++) {
      pairsGrid.appendChild(leftBtns[i]);
      pairsGrid.appendChild(rightBtns[i]);
    }
  }

  function makeBtn(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pair-btn soft-square";
    btn.dataset.id = item.id;
    btn.dataset.side = item.side;

    if (item.isAudio) {
      btn.classList.add("audio-side");
      btn.innerHTML = AUDIO_PILL_HTML;
      btn.setAttribute("aria-label", "Play audio");
    } else {
      btn.textContent = item.label;
    }

    btn.addEventListener("click", function () {
      onTap(item, btn);
    });
    return btn;
  }

  function onTap(item, btn) {
    if (locked || matched[item.id + "-" + item.side]) return;

    if (mode === 1 && item.side === "left") {
      var pair = pairs.find(function (p) { return p.id === item.id; });
      var src = pair && (pair.objectAudio || pair.audio);
      if (src) playSrc(src, btn);
    }

    if (item.side === "left") {
      if (selectedLeft && selectedLeft.btn !== btn) {
        selectedLeft.btn.classList.remove("selected");
      }
      selectedLeft = { item: item, btn: btn };
      btn.classList.add("selected");
    } else {
      if (selectedRight && selectedRight.btn !== btn) {
        selectedRight.btn.classList.remove("selected");
      }
      selectedRight = { item: item, btn: btn };
      btn.classList.add("selected");
    }

    if (selectedLeft && selectedRight) {
      checkMatch();
    }
  }

  function checkMatch() {
    locked = true;
    attempts++;
    var lid = selectedLeft.item.id;
    var rid = selectedRight.item.id;
    var lBtn = selectedLeft.btn;
    var rBtn = selectedRight.btn;

    if (lid === rid) {
      correctPairs++;
      score += 10;
      matched[lid + "-left"] = true;
      matched[rid + "-right"] = true;
      lBtn.classList.remove("selected");
      rBtn.classList.remove("selected");
      lBtn.classList.add("matched");
      rBtn.classList.add("matched");
      lBtn.disabled = true;
      rBtn.disabled = true;
      setFb("Correct!", "ok");
      $("scoreText").textContent = String(score);
      $("matchedText").textContent = correctPairs + " / " + pairs.length;
      selectedLeft = null;
      selectedRight = null;
      locked = false;

      if (correctPairs >= pairs.length) {
        setTimeout(finish, 550);
      }
    } else {
      lBtn.classList.add("wrong");
      rBtn.classList.add("wrong");
      setFb("Try again", "bad");
      setTimeout(function () {
        lBtn.classList.remove("selected", "wrong");
        rBtn.classList.remove("selected", "wrong");
        selectedLeft = null;
        selectedRight = null;
        locked = false;
        setFb("");
      }, 450);
    }
  }

  function finish() {
    stopAudio();
    var acc = attempts ? Math.round((correctPairs / attempts) * 100) : 100;
    $("finalScore").textContent = String(score);
    $("finalAccuracy").textContent = acc + "%";
    $("finalPairs").textContent = String(correctPairs);
    $("endSummary").textContent = MODE_LABELS[mode] + " — all pairs matched!";
    $("endTitle").textContent = acc >= 80 ? "Excellent!" : "Well done!";

    var stars = document.querySelectorAll("#endScreen .star");
    var fill = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
    stars.forEach(function (s, i) {
      s.classList.toggle("is-filled", i < fill);
      s.textContent = i < fill ? "★" : "☆";
    });

    try {
      if (window.LAStars) {
        window.LAStars.recordPlay(GAME_ID);
        window.LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}

    show("end");
  }

  document.querySelectorAll(".mode-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      mode = Number(tab.dataset.mode) || 0;
      document.querySelectorAll(".mode-tab").forEach(function (t) {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
    });
  });

  $("startBtn").addEventListener("click", function () {
    renderBoard();
    show("game");
  });
  $("playAgainBtn").addEventListener("click", function () {
    show("start");
  });
  $("backToModes").addEventListener("click", function () {
    stopAudio();
    show("start");
  });

  show("start");
})();
