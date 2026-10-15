/* How Do They Know Each Other? · Tactics For Listening Basic Unit 1
 * Listen → match conversation to reason (each letter once).
 * Same audio as Listen & Number / Predict.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-listen-how-know";
  const TOTAL = 6;

  const REASONS = [
    { letter: "a", text: "from work" },
    { letter: "b", text: "from the gym" },
    { letter: "c", text: "from school" },
    { letter: "d", text: "from a friend's party" },
    { letter: "e", text: "from the boy's mother" },
    { letter: "f", text: "from the bus stop" },
  ];

  // Answer key: 1.c 2.b 3.d 4.f 5.e 6.a — audio from Spell the Name (CD 1-4)
  const ITEMS = [
    {
      n: 1,
      name: "Elise",
      audio: "https://cdn.imgurl.ir/uploads/n609428_04_Unit_1_Ellise.mp3",
      correct: 2, // c from school (math class)
    },
    {
      n: 2,
      name: "Mick",
      audio: "https://cdn.imgurl.ir/uploads/d74532_04_Unit_1_Mick.mp3",
      correct: 1, // b from the gym
    },
    {
      n: 3,
      name: "Hannah",
      audio: "https://cdn.imgurl.ir/uploads/m025109_04_Unit_1_Hannah.mp3",
      correct: 3, // d from a friend's party
    },
    {
      n: 4,
      name: "Devon",
      audio: "https://cdn.imgurl.ir/uploads/c260569_04_Unit_1_Devon.mp3",
      correct: 5, // f from the bus stop
    },
    {
      n: 5,
      name: "Ike",
      audio: "https://cdn.imgurl.ir/uploads/v243765_04_Unit_1_Ike.mp3",
      correct: 4, // e from the boy's mother
    },
    {
      n: 6,
      name: "Tandy",
      audio: "https://cdn.imgurl.ir/uploads/w241838_04_Unit_1_Tandy.mp3",
      correct: 0, // a from work (accounting department)
    },
  ];

  const app = document.getElementById("game-app");
  let phase = "start";
  let current = 0;
  let correctCount = 0;
  let used = {}; // letter index → true when correctly matched
  let locked = false;
  let playRecorded = false;
  let audio = null;
  let playing = false;
  let listened = false;
  let flashWrong = null;

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
          gameName: "How Do They Know Each Other?",
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
    used = {};
    locked = false;
    playRecorded = false;
    listened = false;
    flashWrong = null;
    stopAudio();
    phase = "play";
    render();
  }

  function choose(reasonIndex) {
    if (locked || phase !== "play") return;
    if (used[reasonIndex]) return;

    const item = ITEMS[current];
    const ok = reasonIndex === item.correct;

    if (ok) {
      locked = true;
      stopAudio();
      used[reasonIndex] = true;
      correctCount++;
      flashWrong = null;
      sfx("correct");
      render(reasonIndex, true);
      setTimeout(function () {
        if (correctCount >= TOTAL) {
          finish();
        } else {
          current++;
          locked = false;
          listened = false;
          playing = false;
          render();
        }
      }, 750);
    } else {
      sfx("wrong");
      flashWrong = reasonIndex;
      render(reasonIndex, false);
      setTimeout(function () {
        flashWrong = null;
        render();
      }, 500);
    }
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
      '<header class="hk-top">' +
      '  <a class="hk-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="hk-top-center">' +
      '    <span class="hk-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>How Do They Know Each Other?</strong>" +
      "  </div>" +
      '  <span class="hk-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="hk-hero">' +
      '  <div class="hk-hero-icon" aria-hidden="true">🤝</div>' +
      "  <h1>How Do They Know Each Other?</h1>" +
      "  <p>Listen again. Match each conversation to how the people know each other.</p>" +
      '  <ul class="hk-tips">' +
      '    <li><span class="tip-num">1</span><span>Play the <strong>conversation</strong></span></li>' +
      '    <li><span class="tip-num">2</span><span>Choose the correct <strong>reason</strong></span></li>' +
      '    <li><span class="tip-num">3</span><span>Each answer is used <strong>once</strong></span></li>' +
      "  </ul>" +
      '  <button type="button" class="hk-btn primary" id="hk-start">Start</button>' +
      "</section>";
    document.getElementById("hk-start").onclick = startGame;
  }

  function renderPlay(chosen, wasOk) {
    const item = ITEMS[current];
    const progress = correctCount + " / " + TOTAL;
    const pct = (correctCount / TOTAL) * 100;
    const playCls =
      "hk-play" + (playing ? " is-playing" : "") + (listened ? " has-played" : "");
    const playLabel = playing
      ? "Playing…"
      : listened
        ? "Play again"
        : "Play conversation " + item.n;

    var optsHtml = REASONS.map(function (r, i) {
      var cls = "hk-opt";
      if (used[i]) cls += " is-used";
      if (flashWrong === i) cls += " is-wrong";
      if (chosen === i && wasOk) cls += " is-correct";
      return (
        '<button type="button" class="' +
        cls +
        '" data-opt="' +
        i +
        '"' +
        (used[i] || locked ? " disabled" : "") +
        ">" +
        '<span class="hk-letter">' +
        r.letter +
        "</span>" +
        '<span class="hk-opt-text">' +
        r.text +
        "</span>" +
        (used[i] ? '<span class="hk-check">✓</span>' : "") +
        "</button>"
      );
    }).join("");

    app.innerHTML =
      '<header class="hk-top">' +
      '  <a class="hk-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="hk-top-center">' +
      '    <span class="hk-eyebrow">How do they know each other?</span>' +
      "    <strong>" +
      progress +
      " matched</strong>" +
      "  </div>" +
      '  <span class="hk-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="hk-progress-bar" aria-hidden="true"><div class="hk-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="hk-now">' +
      '  <span class="hk-now-label">Conversation</span>' +
      '  <span class="hk-now-num">' +
      item.n +
      "</span>" +
      '  <span class="hk-now-of">of ' +
      TOTAL +
      "</span>" +
      "</div>" +
      '<button type="button" class="' +
      playCls +
      '" id="hk-play" aria-label="' +
      playLabel +
      '">' +
      '  <span class="hk-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="hk-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="hk-play-ico">▶</span>') +
      "  </span>" +
      '  <span class="hk-play-label">' +
      playLabel +
      "</span>" +
      "</button>" +
      '<p class="hk-hint">' +
      (listened ? "How do they know each other?" : "Listen first, then choose") +
      "</p>" +
      '<div class="hk-opts">' +
      optsHtml +
      "</div>";

    document.getElementById("hk-play").onclick = playAudio;
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
      '<header class="hk-top">' +
      '  <a class="hk-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="hk-top-center">' +
      '    <span class="hk-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="hk-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="hk-done">' +
      '  <div class="hk-trophy' +
      (stars === 3 ? " perfect" : "") +
      '" aria-hidden="true">' +
      '    <div class="hk-trophy-emoji">🏆</div>' +
      '    <div class="hk-star-row">' +
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
      "  <p>You matched <strong>" +
      correctCount +
      " / " +
      TOTAL +
      "</strong> correctly</p>" +
      '  <div class="hk-done-actions">' +
      '    <button type="button" class="hk-btn primary" id="hk-again">Play again</button>' +
      '    <a class="hk-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("hk-again").onclick = startGame;
  }

  function render(chosen, wasOk) {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay(chosen, wasOk);
    else renderDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
