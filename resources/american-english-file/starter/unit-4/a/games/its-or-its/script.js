/* It's or Its · AEF Starter Unit 4A */
(function () {
  const GAME_ID = "starter-4a-its-or-its";

  const ITEMS = [
    { sentence: "___ a nice restaurant.", answer: "It's" },
    { sentence: "The restaurant is popular. ___ food is excellent.", answer: "Its" },
    { sentence: "___ my new phone.", answer: "It's" },
    { sentence: "The phone is expensive. ___ screen is very good.", answer: "Its" },
    { sentence: "___ a small dog.", answer: "It's" },
    { sentence: "The dog is cute. ___ ears are small.", answer: "Its" },
    { sentence: "___ an interesting book.", answer: "It's" },
    { sentence: "The book is old. ___ pages are yellow.", answer: "Its" },
    { sentence: "___ a Turkish restaurant.", answer: "It's" },
    { sentence: "The restaurant is famous. ___ name is Istanbul Kitchen.", answer: "Its" },
  ];

  const OPTIONS = ["It's", "Its"];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let order = [];
  let index = 0;
  let correct = 0;
  let answered = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    order = shuffle(ITEMS.map((_, i) => i));
    index = 0;
    correct = 0;
    answered = false;
    phase = "play";
    render();
  }

  function pickOption(opt) {
    if (answered) return;
    answered = true;
    const item = ITEMS[order[index]];
    const isCorrect = opt === item.answer;
    if (isCorrect) correct += 1;

    app.querySelectorAll(".ps-opt").forEach((el) => {
      const v = el.dataset.opt;
      el.disabled = true;
      if (v === item.answer) el.classList.add("is-correct");
      if (v === opt && !isCorrect) el.classList.add("is-wrong");
    });

    const blank = app.querySelector(".ps-blank");
    if (blank) {
      blank.textContent = item.answer;
      blank.classList.add(isCorrect ? "is-filled-ok" : "is-filled-bad");
    }

    const fb = document.getElementById("ps-feedback");
    if (fb) {
      fb.textContent = isCorrect
        ? "Correct!"
        : 'Not quite — it\'s "' + item.answer + '".';
      fb.className = "ps-feedback " + (isCorrect ? "ok" : "bad");
    }

    setTimeout(() => {
      if (index < order.length - 1) {
        index += 1;
        answered = false;
        render();
      } else {
        phase = "done";
        render();
      }
    }, isCorrect ? 900 : 1400);
  }

  function calcStars() {
    const total = ITEMS.length;
    if (correct >= total) return 3;
    if (correct >= Math.ceil(total * 0.7)) return 2;
    if (correct >= Math.ceil(total * 0.4)) return 1;
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

  function renderSentence(text) {
    return text.replace("___", '<span class="ps-blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>');
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">It\'s or Its</span>' +
        '<span class="ps-badge">4A</span></header>' +
        '<section class="ps-start">' +
        '<div class="ps-hero" aria-hidden="true">✍️</div>' +
        "<h1>It's or Its?</h1>" +
        '<p class="ps-desc"><strong>It\'s</strong> = it is<br><strong>Its</strong> = possessive</p>' +
        '<button type="button" class="ps-btn" id="ps-start">Start</button></section>';
      document.getElementById("ps-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: typeof GAME_ID !== "undefined" ? GAME_ID : "starter-4a-game",
          score: 0,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => startGame(),
          onModes: () => { phase = 'menu'; if (typeof render === 'function') render(); else location.href = '../'; },
          backHref: "../",
          save: false,
        });
        return;
      }

      const stars = saveStars();
      app.innerHTML =
        '<header class="ps-topbar">' +
        '<a class="ps-back" href="../" aria-label="Back">←</a>' +
        '<span class="ps-title">It\'s or Its</span>' +
        '<span class="ps-badge">Done</span></header>' +
        '<section class="ps-done">' +
        '<div class="ps-stars" aria-hidden="true">' +
        "★".repeat(stars) + "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Well done!" : "Keep practising!") + "</h1>" +
        '<p class="ps-desc">You got ' + correct + " of " + ITEMS.length + " correct.</p>" +
        '<button type="button" class="ps-btn" id="ps-again">Play again</button>' +
        '<button type="button" class="ps-btn secondary" id="ps-menu">Back to start</button></section>';
      document.getElementById("ps-again").onclick = startGame;
      document.getElementById("ps-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    const item = ITEMS[order[index]];
    const opts = shuffle(OPTIONS);

    const optHtml = opts
      .map(function (o) {
        return (
          '<button type="button" class="ps-opt ps-opt-big" data-opt="' +
          o +
          '">' +
          o +
          "</button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">It\'s or Its</span>' +
      '<span class="ps-progress">' +
      (index + 1) +
      " / " +
      ITEMS.length +
      "</span></header>" +
      '<div class="ps-play">' +
      '<p class="ps-sentence">' +
      renderSentence(item.sentence) +
      "</p>" +
      '<div class="ps-options ps-options-two">' +
      optHtml +
      "</div>" +
      '<p class="ps-feedback" id="ps-feedback"></p>' +
      "</div>";

    app.querySelectorAll(".ps-opt").forEach(function (el) {
      el.onclick = function () {
        pickOption(el.dataset.opt);
      };
    });
  }

  render();
})();
