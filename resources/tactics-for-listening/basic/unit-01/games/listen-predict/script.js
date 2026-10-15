/* Listen & Predict · Tactics For Listening Basic Unit 1
 * What does each person say next? a / b / c
 * Same audio as Listen & Number. LAStars + LAFinish + LASfx.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-listen-predict";
  const TOTAL = 6;

  const ITEMS = [
    {
      n: 1,
      audio: "https://cdn.imgurl.ir/uploads/w37637_03_Unit_1_-_1.mp3",
      options: [
        "I'm fine, thanks.",
        "Good morning.",
        "Nice to meet you, too.",
      ],
      correct: 2, // c
    },
    {
      n: 2,
      audio: "https://cdn.imgurl.ir/uploads/g206197_03_Unit_1_-_2.mp3",
      options: [
        "It's 555-7591.",
        "It's sgomez@tmail.com",
        "G-O-M-E-Z.",
      ],
      correct: 1, // b
    },
    {
      n: 3,
      audio: "https://cdn.imgurl.ir/uploads/l85259_03_Unit_1_-_3.mp3",
      options: [
        "What's your name?",
        "Nice to meet you.",
        "What's your address?",
      ],
      correct: 0, // a
    },
    {
      n: 4,
      audio: "https://cdn.imgurl.ir/uploads/a386275_03_Unit_1_-_4.mp3",
      options: [
        "How do you spell your name?",
        "What's your phone number?",
        "How are you?",
      ],
      correct: 2, // c — How are you?
    },
    {
      n: 5,
      audio: "https://cdn.imgurl.ir/uploads/g611561_03_Unit_1_-_5.mp3",
      options: [
        "How do you spell your last name, please?",
        "It's nice to meet you.",
        "I'm fine, thanks.",
      ],
      correct: 0, // a
    },
    {
      n: 6,
      audio: "https://cdn.imgurl.ir/uploads/o83720_03_Unit_1_-_6.mp3",
      options: [
        "What's your name?",
        "How do you spell your name?",
        "What's your e-mail address?",
      ],
      correct: 2, // c
    },
  ];

  const LETTERS = ["a", "b", "c"];
  const app = document.getElementById("game-app");
  let phase = "start";
  let current = 0;
  let correctCount = 0;
  let locked = false;
  let playRecorded = false;
  let audio = null;
  let playing = false;
  let listened = false;

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function calcStars() {
    if (correctCount >= TOTAL) return 3;
    if (correctCount >= 4) return 2;
    if (correctCount >= 2) return 1;
    return 0;
  }

  function saveProgress() {
    if (!window.LAStars) return calcStars();
    const stars = calcStars();
    if (!playRecorded) {
      LAStars.recordPlay(GAME_ID);
      playRecorded = true;
    }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: "Listen & Predict",
          category: "tactics-for-listening",
          unit: "basic-1",
          score: correctCount,
          maxScore: TOTAL,
          accuracy: Math.round((correctCount / TOTAL) * 100),
          completed: true,
          stars: stars,
        });
      }
    } catch (e) {}
    return stars;
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {}
    }
    playing = false;
  }

  function playAudio() {
    const item = ITEMS[current];
    if (!item) return;
    sfx("click");
    if (playing && audio) {
      stopAudio();
      render();
      return;
    }
    stopAudio();
    audio = new Audio(item.audio);
    audio.preload = "auto";
    playing = true;
    listened = true;
    render();
    audio.onended = function () {
      playing = false;
      render();
    };
    audio.onerror = function () {
      playing = false;
      render();
    };
    audio.play().catch(function () {
      playing = false;
      render();
    });
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    current = 0;
    correctCount = 0;
    locked = false;
    playRecorded = false;
    listened = false;
    stopAudio();
    phase = "play";
    render();
  }

  function choose(optIndex) {
    if (locked || phase !== "play") return;
    locked = true;
    stopAudio();
    const item = ITEMS[current];
    const ok = optIndex === item.correct;
    if (ok) {
      correctCount++;
      sfx("correct");
    } else {
      sfx("wrong");
    }
    render(optIndex, ok);
    setTimeout(function () {
      if (current + 1 >= TOTAL) {
        finish();
      } else {
        current++;
        locked = false;
        listened = false;
        playing = false;
        render();
      }
    }, ok ? 900 : 1100);
  }

  function finish() {
    const stars = saveProgress();
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: correctCount,
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((correctCount / TOTAL) * 100),
        timeMs: timeMs,
        onAgain: function () {
          startGame();
        },
        onModes: function () {
          phase = "start";
          render();
        },
        backHref: "../../",
        save: false,
      });
      return;
    }
    render();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="lp-top">' +
      '  <a class="lp-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="lp-top-center">' +
      '    <span class="lp-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Listen &amp; Predict</strong>" +
      "  </div>" +
      '  <span class="lp-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="lp-hero">' +
      '  <div class="lp-hero-icon" aria-hidden="true">🔮</div>' +
      "  <h1>Listen &amp; Predict</h1>" +
      "  <p>Listen again. What do you think each person says next? Choose the correct answer.</p>" +
      '  <ul class="lp-tips">' +
      '    <li><span class="tip-num">1</span><span>Play the <strong>conversation</strong></span></li>' +
      '    <li><span class="tip-num">2</span><span>Predict what comes <strong>next</strong></span></li>' +
      '    <li><span class="tip-num">3</span><span>Choose <strong>a</strong>, <strong>b</strong>, or <strong>c</strong></span></li>' +
      "  </ul>" +
      '  <button type="button" class="lp-btn primary" id="lp-start">Start</button>' +
      "</section>";
    document.getElementById("lp-start").onclick = startGame;
  }

  function renderPlay(chosen) {
    const item = ITEMS[current];
    const progress = current + 1 + " / " + TOTAL;
    const pct = (current / TOTAL) * 100;
    const playCls =
      "lp-play" + (playing ? " is-playing" : "") + (listened ? " has-played" : "");
    const playLabel = playing ? "Playing…" : listened ? "Play again" : "Play conversation " + item.n;

    var optsHtml = item.options
      .map(function (text, i) {
        var letter = LETTERS[i];
        var cls = "lp-opt";
        if (chosen != null) {
          if (i === item.correct) cls += " is-correct";
          else if (i === chosen) cls += " is-wrong";
          else cls += " is-dim";
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt="' +
          i +
          '"' +
          (locked ? " disabled" : "") +
          ">" +
          '<span class="lp-letter">' +
          letter +
          "</span>" +
          '<span class="lp-opt-text">' +
          text +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="lp-top">' +
      '  <a class="lp-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="lp-top-center">' +
      '    <span class="lp-eyebrow">Listen &amp; Predict</span>' +
      "    <strong>" +
      progress +
      "</strong>" +
      "  </div>" +
      '  <span class="lp-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="lp-progress-bar" aria-hidden="true"><div class="lp-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<section class="lp-card">' +
      '  <p class="lp-prompt">What does the person say <em>next</em>?</p>' +
      '  <p class="lp-stem">Conversation ' +
      item.n +
      "</p>" +
      '  <button type="button" class="' +
      playCls +
      '" id="lp-play" aria-label="' +
      playLabel +
      '">' +
      '    <span class="lp-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="lp-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="lp-play-ico">▶</span>') +
      "    </span>" +
      '    <span class="lp-play-label">' +
      playLabel +
      "</span>" +
      "  </button>" +
      '  <div class="lp-opts">' +
      optsHtml +
      "</div>" +
      "</section>";

    document.getElementById("lp-play").onclick = playAudio;
    if (!locked) {
      app.querySelectorAll("[data-opt]").forEach(function (btn) {
        btn.onclick = function () {
          choose(+btn.dataset.opt);
        };
      });
    }
  }

  function renderDone() {
    const stars = calcStars();
    app.innerHTML =
      '<header class="lp-top">' +
      '  <a class="lp-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="lp-top-center">' +
      '    <span class="lp-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="lp-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="lp-done">' +
      '  <div class="lp-trophy' +
      (stars === 3 ? " perfect" : "") +
      '" aria-hidden="true">' +
      '    <div class="lp-trophy-emoji">🏆</div>' +
      '    <div class="lp-star-row">' +
      '      <span class="star' +
      (stars >= 1 ? " filled" : "") +
      '">★</span>' +
      '      <span class="star' +
      (stars >= 2 ? " filled" : "") +
      '">★</span>' +
      '      <span class="star' +
      (stars >= 3 ? " filled" : "") +
      '">★</span>' +
      "    </div>" +
      "  </div>" +
      "  <h1>" +
      (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!") +
      "</h1>" +
      "  <p>You got <strong>" +
      correctCount +
      " / " +
      TOTAL +
      "</strong> correct</p>" +
      '  <div class="lp-done-actions">' +
      '    <button type="button" class="lp-btn primary" id="lp-again">Play again</button>' +
      '    <a class="lp-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("lp-again").onclick = startGame;
  }

  function render(chosen) {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay(chosen);
    else renderDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
