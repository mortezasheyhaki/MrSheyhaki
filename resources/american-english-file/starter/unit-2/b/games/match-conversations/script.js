/* Match Conversations – 2 sets × 7 pairs – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-match-conversations";

  const SETS = [
    [
      { id: "1", left: "Hi Lola. This is Paul.", right: "Nice to meet you." },
      { id: "2", left: "How old is Karin?", right: "She's 38." },
      { id: "3", left: "What's your phone number?", right: "It's 978-555-7360." },
      { id: "4", left: "Nice to meet you.", right: "Nice to meet you, too." },
      { id: "5", left: "Is she married?", right: "No, she's single." },
      { id: "6", left: "How are you?", right: "Fine, thanks." },
      { id: "7", left: "See you tomorrow.", right: "Bye!" },
    ],
    [
      { id: "8", left: "What's your name?", right: "My name's Karl." },
      { id: "9", left: "Have a nice day!", right: "Thanks." },
      { id: "10", left: "Where are you from?", right: "I'm from Japan." },
      { id: "11", left: "When's your English class?", right: "On Monday and Friday." },
      { id: "12", left: "Hello!", right: "Hi!" },
      { id: "13", left: "My name is Maribel, not Maria.", right: "Sorry." },
      { id: "14", left: "What day is it today?", right: "It's Thursday." },
    ],
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | play | done
  let setIndex = 0;
  let leftOrder = [];
  let rightOrder = [];
  let selectedLeft = null;
  let locked = {};
  let matches = {};
  let totalCorrect = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function correctCount() {
    return Object.keys(locked).length;
  }

  function byId(id) {
    return SETS[setIndex].find((x) => x.id === id);
  }

  function startSet(i) {
    setIndex = i;
    const items = SETS[setIndex];
    leftOrder = shuffle(items.map((x) => x.id));
    rightOrder = shuffle(items.map((x) => x.id));
    selectedLeft = null;
    locked = {};
    matches = {};
    phase = "play";
    render();
  }

  function selectLeft(i) {
    if (locked[i]) return;
    selectedLeft = i;
    app.querySelectorAll(".mc-left-item").forEach((el) => {
      el.classList.toggle("is-selected", +el.dataset.i === i);
    });
  }

  function selectRight(rightId) {
    if (selectedLeft === null) return;
    if (Object.values(matches).indexOf(rightId) !== -1) return;

    const leftId = leftOrder[selectedLeft];
    const leftEl = app.querySelector('.mc-left-item[data-i="' + selectedLeft + '"]');
    const rightEl = app.querySelector('.mc-right-item[data-id="' + rightId + '"]');

    if (leftId === rightId) {
      locked[selectedLeft] = true;
      matches[selectedLeft] = rightId;
      totalCorrect += 1;
      if (leftEl) leftEl.classList.add("is-correct");
      if (leftEl) leftEl.classList.remove("is-selected");
      if (rightEl) {
        rightEl.classList.add("is-correct", "is-used");
        rightEl.disabled = true;
      }
      selectedLeft = null;
      app.querySelectorAll(".mc-left-item").forEach((el) => el.classList.remove("is-selected"));

      const progress = document.getElementById("mc-progress");
      if (progress) progress.textContent = "Set " + (setIndex + 1) + "/2 · " + correctCount() + "/7";

      if (correctCount() === SETS[setIndex].length) {
        setTimeout(function () {
          if (setIndex + 1 < SETS.length) {
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 600);
      }
    } else {
      if (leftEl) leftEl.classList.add("is-wrong");
      if (rightEl) rightEl.classList.add("is-wrong");
      setTimeout(function () {
        if (leftEl) leftEl.classList.remove("is-wrong");
        if (rightEl) rightEl.classList.remove("is-wrong");
      }, 450);
    }
  }

  function calcStars() {
    const n = totalCorrect;
    if (n >= 14) return 3;
    if (n >= 10) return 2;
    if (n >= 7) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function leftCell(id, i) {
    const item = byId(id);
    const isLocked = !!locked[i];
    const sel = selectedLeft === i ? " is-selected" : "";
    const ok = isLocked ? " is-correct" : "";
    return (
      '<div class="mc-left-item mc-word-left' + ok + sel + '" data-i="' + i + '">' +
      '<span class="mc-word-label">' + item.left + "</span>" +
      "</div>"
    );
  }

  function rightCell(id) {
    const item = byId(id);
    const used = Object.keys(locked).some(function (li) { return matches[li] === id; });
    return (
      '<button type="button" class="mc-right-item mc-word' + (used ? " is-correct is-used" : "") + '" data-id="' + id + '"' + (used ? " disabled" : "") + ">" +
      '<span class="mc-word-label">' + item.right + "</span>" +
      "</button>"
    );
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Conversations</span>' +
        '<span class="mc-badge">2B</span>' +
        "</header>" +
        '<section class="mc-start">' +
        '<div class="mc-hero" aria-hidden="true">💬</div>' +
        "<h1>Match Conversations</h1>" +
        '<p class="mc-desc">Match the sentences · 2 sets of 7</p>' +
        '<button type="button" class="mc-btn" id="mc-start">Start</button>' +
        "</section>";
      document.getElementById("mc-start").onclick = function () {
        totalCorrect = 0;
        startSet(0);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars();
      app.innerHTML =
        '<header class="mc-topbar">' +
        '<a class="mc-back" href="../" aria-label="Back">←</a>' +
        '<span class="mc-title">Match Conversations</span>' +
        '<span class="mc-badge">Done</span>' +
        "</header>" +
        '<section class="mc-done">' +
        '<div class="trophy-scene' + (stars === 3 ? " perfect" : "") + '" aria-hidden="true"><div class="orbit-system"><div class="trophy-float">🏆</div><div class="star-orbit"><span class="star' + (stars >= 1 ? " filled" : "") + '">★</span></div><div class="star-orbit"><span class="star' + (stars >= 2 ? " filled" : "") + '">★</span></div><div class="star-orbit"><span class="star' + (stars >= 3 ? " filled" : "") + '">★</span></div></div></div>' +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") + "</h1>" +
        "<p>You matched <strong>" + totalCorrect + " / 14</strong> pairs.</p>" +
        '<button type="button" class="mc-btn" id="mc-again">Play again</button>' +
        "</section>";
      document.getElementById("mc-again").onclick = function () {
        totalCorrect = 0;
        startSet(0);
      };
      return;
    }

    // play
    const left = leftOrder.map(function (id, i) { return leftCell(id, i); }).join("");
    const right = rightOrder.map(function (id) { return rightCell(id); }).join("");

    app.innerHTML =
      '<header class="mc-topbar">' +
      '<a class="mc-back" href="../" aria-label="Back">←</a>' +
      '<span class="mc-title">Match · Set ' + (setIndex + 1) + "/2</span>" +
      '<span class="mc-progress" id="mc-progress">Set ' + (setIndex + 1) + "/2 · " + correctCount() + "/7</span>" +
      "</header>" +
      '<p class="mc-instruction">Tap a sentence on the left, then its match on the right.</p>' +
      '<div class="mc-board">' +
      '<div class="mc-col mc-col-left">' + left + "</div>" +
      '<div class="mc-col mc-col-right">' + right + "</div>" +
      "</div>" +
      '<div class="mc-actions">' +
      '<button type="button" class="mc-btn secondary" id="mc-reset">Reset round</button>' +
      "</div>";

    app.querySelectorAll(".mc-left-item").forEach(function (el) {
      el.onclick = function () { selectLeft(+el.dataset.i); };
    });
    app.querySelectorAll(".mc-right-item").forEach(function (btn) {
      btn.onclick = function () { selectRight(btn.dataset.id); };
    });
    document.getElementById("mc-reset").onclick = function () { startSet(setIndex); };
  }

  render();
})();
