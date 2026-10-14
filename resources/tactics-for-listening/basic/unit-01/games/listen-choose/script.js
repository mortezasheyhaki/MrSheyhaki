/* Listen & Choose · Tactics For Listening Basic Unit 1
 * Play audio → pick a or b → next. LAStars + LAFinish + LASfx.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-listen-choose";
  const TOTAL = 6;

  const ITEMS = [
    {
      prompt: "What's her name?",
      stem: "Her name is ________.",
      audio: "https://cdn.imgurl.ir/uploads/h8529_Unit_1_-_1.mp3",
      options: ["Alina Smith", "Elena Smith"],
      correct: 0, // 1.a
    },
    {
      prompt: "What's his name?",
      stem: "His name is ________.",
      audio: "https://cdn.imgurl.ir/uploads/x251328_Unit_1_-_2.mp3",
      options: ["Matt Rosenblum", "Matt Rosenbloom"],
      correct: 0, // 2.a
    },
    {
      prompt: "What's his e-mail address?",
      stem: "His e-mail address is ________.",
      audio: "https://cdn.imgurl.ir/uploads/g73215_Unit_1_-_3.mp3",
      options: ["mattnelson@tmail.com", "natwilson@tmail.com"],
      correct: 1, // 3.b
    },
    {
      prompt: "What's her e-mail address?",
      stem: "Her e-mail address is ________.",
      audio: "https://cdn.imgurl.ir/uploads/q275806_Unit_1_-_4.mp3",
      options: ["coolgal@rol.com", "coolpal@rol.com"],
      correct: 0, // 4.a
    },
    {
      prompt: "What's his phone number?",
      stem: "His phone number is ________.",
      audio: "https://cdn.imgurl.ir/uploads/s1219_Unit_1_-_5.mp3",
      options: ["555-2358", "555-2398"],
      correct: 1, // 5.b
    },
    {
      prompt: "What's her phone number?",
      stem: "Her phone number is ________.",
      audio: "https://cdn.imgurl.ir/uploads/o60579_Unit_1_-_6.mp3",
      options: ["555-7126", "555-7216"],
      correct: 1, // 6.b
    },
  ];

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
          gameName: "Listen & Choose",
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
        onAgain: function () { startGame(); },
        onModes: function () { phase = "start"; render(); },
        backHref: "../../",
        save: false,
      });
      return;
    }
    render();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="lc-top">' +
      '  <a class="lc-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="lc-top-center">' +
      '    <span class="lc-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Listen &amp; Choose</strong>" +
      "  </div>" +
      '  <span class="lc-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="lc-hero">' +
      '  <div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "  <h1>Listen &amp; Choose</h1>" +
      "  <p>Play each audio, then pick the correct name, e-mail, or phone number.</p>" +
      '  <ul class="lc-tips">' +
      '    <li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the question</span></li>' +
      '    <li><span class="tip-num">2</span><span>Choose <strong>a</strong> or <strong>b</strong></span></li>' +
      '    <li><span class="tip-num">3</span><span><strong>6</strong> short listening items</span></li>' +
      "  </ul>" +
      '  <button type="button" class="lc-btn primary" id="lc-start">Start listening</button>' +
      "</section>";
    document.getElementById("lc-start").onclick = startGame;
  }

  function renderPlay(chosen, wasCorrect) {
    const item = ITEMS[current];
    const progress = current + 1 + " / " + TOTAL;
    const pct = (current / TOTAL) * 100;

    var optsHtml = item.options
      .map(function (text, i) {
        var letter = i === 0 ? "a" : "b";
        var cls = "lc-opt";
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
          '<span class="lc-letter">' +
          letter +
          "</span>" +
          '<span class="lc-opt-text">' +
          text +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    var playCls = "lc-play" + (playing ? " is-playing" : "") + (listened ? " has-played" : "");
    var playLabel = playing ? "Playing…" : listened ? "Play again" : "Play audio";

    app.innerHTML =
      '<header class="lc-top">' +
      '  <a class="lc-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="lc-top-center">' +
      '    <span class="lc-eyebrow">Listen &amp; Choose</span>' +
      "    <strong>" +
      progress +
      "</strong>" +
      "  </div>" +
      '  <span class="lc-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="lc-progress-bar" aria-hidden="true"><div class="lc-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<section class="lc-card">' +
      '  <p class="lc-prompt">' +
      item.prompt +
      "</p>" +
      '  <p class="lc-stem">' +
      item.stem +
      "</p>" +
      '  <button type="button" class="' +
      playCls +
      '" id="lc-play" aria-label="' +
      playLabel +
      '">' +
      '    <span class="lc-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="lc-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="lc-play-ico">▶</span>') +
      "    </span>" +
      '    <span class="lc-play-label">' +
      playLabel +
      "</span>" +
      "  </button>" +
      '  <div class="lc-opts">' +
      optsHtml +
      "</div>" +
      "</section>";

    document.getElementById("lc-play").onclick = playAudio;
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
      '<header class="lc-top">' +
      '  <a class="lc-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="lc-top-center">' +
      '    <span class="lc-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="lc-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="lc-done">' +
      '  <div class="lc-trophy' +
      (stars === 3 ? " perfect" : "") +
      '" aria-hidden="true">' +
      '    <div class="lc-trophy-emoji">🏆</div>' +
      '    <div class="lc-star-row">' +
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
      '  <div class="lc-done-actions">' +
      '    <button type="button" class="lc-btn primary" id="lc-again">Play again</button>' +
      '    <a class="lc-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("lc-again").onclick = startGame;
  }

  function render(chosen, wasCorrect) {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay(chosen, wasCorrect);
    else renderDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
