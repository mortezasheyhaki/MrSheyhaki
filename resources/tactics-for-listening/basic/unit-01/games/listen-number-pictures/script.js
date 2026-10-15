/* Listen & Number the Pictures · Tactics For Listening Basic Unit 1
 * Play dialogue → tap matching picture. No transcript text.
 * LAStars + LAFinish + LASfx.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-listen-number-pictures";
  const TOTAL = 6;

  // Pictures A–F (display order matches worksheet)
  // correctDialogue: which audio number (1–6) matches this picture
  const PICTURES = [
    {
      id: "A",
      src: "https://cdn.imgurl.ir/uploads/i108536_picture_1.png",
      alt: "Two women walking and talking",
      correctDialogue: 4,
    },
    {
      id: "B",
      src: "https://cdn.imgurl.ir/uploads/b65927_picture_2.png",
      alt: "Woman working on a laptop with books",
      correctDialogue: 6,
    },
    {
      id: "C",
      src: "https://cdn.imgurl.ir/uploads/u325598_picture_3.png",
      alt: "Restaurant worker with a clipboard",
      correctDialogue: 3,
    },
    {
      id: "D",
      src: "https://cdn.imgurl.ir/uploads/p57576_picture_4.png",
      alt: "Man and woman shaking hands",
      correctDialogue: 1,
    },
    {
      id: "E",
      src: "https://cdn.imgurl.ir/uploads/u446134_picture_5.png",
      alt: "People at a school registration desk",
      correctDialogue: 2,
    },
    {
      id: "F",
      src: "https://cdn.imgurl.ir/uploads/i42763_picture_6.png",
      alt: "Guest at a hotel reception desk",
      correctDialogue: 5,
    },
  ];

  const AUDIOS = [
    "https://cdn.imgurl.ir/uploads/w37637_03_Unit_1_-_1.mp3",
    "https://cdn.imgurl.ir/uploads/g206197_03_Unit_1_-_2.mp3",
    "https://cdn.imgurl.ir/uploads/l85259_03_Unit_1_-_3.mp3",
    "https://cdn.imgurl.ir/uploads/a386275_03_Unit_1_-_4.mp3",
    "https://cdn.imgurl.ir/uploads/g611561_03_Unit_1_-_5.mp3",
    "https://cdn.imgurl.ir/uploads/o83720_03_Unit_1_-_6.mp3",
  ];

  const app = document.getElementById("game-app");
  let phase = "start";
  let current = 0; // 0–5 dialogue index
  let assigned = {}; // pictureId → dialogue number (1–6)
  let correctCount = 0;
  let attempts = 0;
  let locked = false;
  let playRecorded = false;
  let audio = null;
  let playing = false;
  let listened = false;
  let flashWrong = null; // picture id briefly wrong

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function calcStars() {
    if (correctCount >= TOTAL && attempts <= TOTAL) return 3;
    if (correctCount >= TOTAL && attempts <= TOTAL + 2) return 2;
    if (correctCount >= 4) return 1;
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
          gameName: "Listen & Number",
          category: "tactics-for-listening",
          unit: "basic-1",
          score: correctCount,
          maxScore: TOTAL,
          accuracy: attempts ? Math.round((correctCount / attempts) * 100) : 0,
          completed: correctCount >= TOTAL,
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
    sfx("click");
    if (playing && audio) {
      stopAudio();
      render();
      return;
    }
    stopAudio();
    audio = new Audio(AUDIOS[current]);
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
    assigned = {};
    correctCount = 0;
    attempts = 0;
    locked = false;
    playRecorded = false;
    listened = false;
    flashWrong = null;
    stopAudio();
    phase = "play";
    render();
  }

  function pickPicture(picId) {
    if (locked || phase !== "play") return;
    if (assigned[picId] != null) return;

    attempts++;
    const pic = PICTURES.find(function (p) {
      return p.id === picId;
    });
    const dialogueNum = current + 1;
    const ok = pic && pic.correctDialogue === dialogueNum;

    if (ok) {
      locked = true;
      stopAudio();
      assigned[picId] = dialogueNum;
      correctCount++;
      sfx("correct");
      flashWrong = null;
      render();
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
      }, 700);
    } else {
      sfx("wrong");
      flashWrong = picId;
      render();
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
      const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 100;
      LAFinish.show({
        gameId: GAME_ID,
        score: correctCount,
        total: TOTAL,
        stars: stars,
        accuracy: accuracy,
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
      '<header class="ln-top">' +
      '  <a class="ln-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="ln-top-center">' +
      '    <span class="ln-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Listen &amp; Number</strong>" +
      "  </div>" +
      '  <span class="ln-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="ln-hero">' +
      '  <div class="ln-hero-icon" aria-hidden="true">🖼️</div>' +
      "  <h1>Listen &amp; Number</h1>" +
      "  <p>People are greeting each other and asking for information. Listen and number the pictures.</p>" +
      '  <ul class="ln-tips">' +
      '    <li><span class="tip-num">1</span><span>Play the <strong>audio</strong> for each conversation</span></li>' +
      '    <li><span class="tip-num">2</span><span>Tap the <strong>picture</strong> that matches</span></li>' +
      '    <li><span class="tip-num">3</span><span>Number all <strong>6</strong> pictures</span></li>' +
      "  </ul>" +
      '  <button type="button" class="ln-btn primary" id="ln-start">Start</button>' +
      "</section>";
    document.getElementById("ln-start").onclick = startGame;
  }

  function renderPlay() {
    const dialogueNum = current + 1;
    const progress = correctCount + " / " + TOTAL;
    const pct = (correctCount / TOTAL) * 100;
    const playCls =
      "ln-play" + (playing ? " is-playing" : "") + (listened ? " has-played" : "");
    const playLabel = playing ? "Playing…" : listened ? "Play again" : "Play conversation " + dialogueNum;

    const grid = PICTURES.map(function (p) {
      const num = assigned[p.id];
      const done = num != null;
      const wrong = flashWrong === p.id;
      let cls = "ln-pic";
      if (done) cls += " is-done";
      if (wrong) cls += " is-wrong";
      return (
        '<button type="button" class="' +
        cls +
        '" data-pic="' +
        p.id +
        '"' +
        (done || locked ? " disabled" : "") +
        ">" +
        '<img src="' +
        p.src +
        '" alt="' +
        p.alt +
        '" loading="lazy" draggable="false" />' +
        '<span class="ln-pic-label">' +
        p.id +
        "</span>" +
        (done
          ? '<span class="ln-pic-num" aria-label="Number ' + num + '">' + num + "</span>"
          : "") +
        "</button>"
      );
    }).join("");

    app.innerHTML =
      '<header class="ln-top">' +
      '  <a class="ln-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="ln-top-center">' +
      '    <span class="ln-eyebrow">Listen &amp; Number</span>' +
      "    <strong>" +
      progress +
      " matched</strong>" +
      "  </div>" +
      '  <span class="ln-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="ln-progress-bar" aria-hidden="true"><div class="ln-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="ln-now">' +
      '  <span class="ln-now-label">Conversation</span>' +
      '  <span class="ln-now-num">' +
      dialogueNum +
      "</span>" +
      '  <span class="ln-now-of">of ' +
      TOTAL +
      "</span>" +
      "</div>" +
      '<button type="button" class="' +
      playCls +
      '" id="ln-play" aria-label="' +
      playLabel +
      '">' +
      '  <span class="ln-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="ln-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="ln-play-ico">▶</span>') +
      "  </span>" +
      '  <span class="ln-play-label">' +
      playLabel +
      "</span>" +
      "</button>" +
      '<p class="ln-hint">' +
      (listened ? "Tap the matching picture" : "Listen first, then choose a picture") +
      "</p>" +
      '<div class="ln-grid" role="list">' +
      grid +
      "</div>";

    document.getElementById("ln-play").onclick = playAudio;
    if (!locked) {
      app.querySelectorAll("[data-pic]").forEach(function (btn) {
        btn.onclick = function () {
          pickPicture(btn.dataset.pic);
        };
      });
    }
  }

  function renderDone() {
    const stars = calcStars();
    const accuracy = attempts ? Math.round((correctCount / attempts) * 100) : 100;
    app.innerHTML =
      '<header class="ln-top">' +
      '  <a class="ln-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="ln-top-center">' +
      '    <span class="ln-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="ln-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="ln-done">' +
      '  <div class="ln-trophy' +
      (stars === 3 ? " perfect" : "") +
      '" aria-hidden="true">' +
      '    <div class="ln-trophy-emoji">🏆</div>' +
      '    <div class="ln-star-row">' +
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
      "  <p>You numbered <strong>" +
      correctCount +
      " / " +
      TOTAL +
      "</strong> pictures · " +
      accuracy +
      "% accuracy</p>" +
      '  <div class="ln-done-actions">' +
      '    <button type="button" class="ln-btn primary" id="ln-again">Play again</button>' +
      '    <a class="ln-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("ln-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
