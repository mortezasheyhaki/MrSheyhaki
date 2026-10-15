/* Build the Sentence · Tactics For Listening Basic Unit 1
 * Word chips + 2 distractors. LAStars + LAFinish + LASfx.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-sentence-chips";
  const TOTAL = 4;

  const ITEMS = [
    {
      words: ["My", "name", "is", "Tim."],
      distractors: ["Hi", "you"],
      audio: "https://cdn.imgurl.ir/uploads/w449_My_name_is_Tim.mp3",
    },
    {
      words: ["My", "e-mail", "address", "is", "timr@tmail.com"],
      distractors: ["phone", "number"],
      audio: "https://cdn.imgurl.ir/uploads/a23209_My_email_address_is_timrtmail_com.mp3",
    },
    {
      words: ["I", "live", "in", "New", "York."],
      distractors: ["from", "London"],
      audio: "https://cdn.imgurl.ir/uploads/g50629_I_live_in_New_York.mp3",
    },
    {
      words: ["I", "have", "a", "reservation", "for", "tonight."],
      distractors: ["table", "tomorrow"],
      audio: "https://cdn.imgurl.ir/uploads/a15153_I_have_a_reservation_for_tonight.mp3",
    },
  ];

  const app = document.getElementById("game-app");
  let phase = "start";
  let current = 0;
  let correctCount = 0;
  let playRecorded = false;
  let audio = null;
  let playing = false;
  let listened = false;
  let built = []; // selected words in order
  let pool = []; // { text, id, used }
  let locked = false;
  let feedback = null;

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setupItem() {
    const item = ITEMS[current];
    built = [];
    const chips = item.words
      .map(function (w, i) {
        return { text: w, id: "w" + i, used: false };
      })
      .concat(
        item.distractors.map(function (w, i) {
          return { text: w, id: "d" + i, used: false };
        })
      );
    pool = shuffle(chips);
    locked = false;
    feedback = null;
    listened = false;
    playing = false;
    stopAudio();
  }

  function calcStars() {
    if (correctCount >= TOTAL) return 3;
    if (correctCount >= 3) return 2;
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
          gameName: "Build the Sentence",
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
    playRecorded = false;
    phase = "play";
    setupItem();
    render();
  }

  function addChip(id) {
    if (locked || phase !== "play") return;
    const chip = pool.find(function (c) {
      return c.id === id;
    });
    if (!chip || chip.used) return;
    sfx("click");
    chip.used = true;
    built.push({ text: chip.text, id: chip.id });
    render();
    if (built.length === ITEMS[current].words.length) {
      checkSentence();
    }
  }

  function removeLast() {
    if (locked || phase !== "play" || !built.length) return;
    const last = built.pop();
    const chip = pool.find(function (c) {
      return c.id === last.id;
    });
    if (chip) chip.used = false;
    feedback = null;
    sfx("click");
    render();
  }

  function clearAll() {
    if (locked || phase !== "play") return;
    built = [];
    pool.forEach(function (c) {
      c.used = false;
    });
    feedback = null;
    sfx("click");
    render();
  }

  function checkSentence() {
    if (locked) return;
    const item = ITEMS[current];
    const guess = built.map(function (b) {
      return b.text;
    });
    const ok =
      guess.length === item.words.length &&
      guess.every(function (w, i) {
        return w === item.words[i];
      });

    locked = true;
    if (ok) {
      stopAudio();
      correctCount++;
      feedback = "ok";
      sfx("correct");
      render();
      setTimeout(function () {
        if (current + 1 >= TOTAL) {
          finish();
        } else {
          current++;
          setupItem();
          render();
        }
      }, 900);
    } else {
      feedback = "bad";
      sfx("wrong");
      render();
      setTimeout(function () {
        built = [];
        pool.forEach(function (c) {
          c.used = false;
        });
        locked = false;
        feedback = null;
        render();
      }, 900);
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
      '<header class="sc-top">' +
      '  <a class="sc-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="sc-top-center">' +
      '    <span class="sc-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Build the Sentence</strong>" +
      "  </div>" +
      '  <span class="sc-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="sc-hero">' +
      '  <div class="sc-hero-icon" aria-hidden="true">🧩</div>' +
      "  <h1>Build the Sentence</h1>" +
      "  <p>Listen, then tap the word chips in the correct order. Watch out for 2 extra words!</p>" +
      '  <ul class="sc-tips">' +
      '    <li><span class="tip-num">1</span><span>Play the <strong>audio</strong></span></li>' +
      '    <li><span class="tip-num">2</span><span>Tap chips to <strong>build</strong> the sentence</span></li>' +
      '    <li><span class="tip-num">3</span><span>Ignore the <strong>2 distractors</strong></span></li>' +
      "  </ul>" +
      '  <button type="button" class="sc-btn primary" id="sc-start">Start</button>' +
      "</section>";
    document.getElementById("sc-start").onclick = startGame;
  }

  function renderPlay() {
    const item = ITEMS[current];
    const progress = current + 1 + " / " + TOTAL;
    const pct = (current / TOTAL) * 100;
    const playCls =
      "sc-play" + (playing ? " is-playing" : "") + (listened ? " has-played" : "");
    const playLabel = playing ? "Playing…" : listened ? "Play again" : "Play audio";

    var builtHtml =
      built.length === 0
        ? '<span class="sc-placeholder">Tap words below…</span>'
        : built
            .map(function (b) {
              var cls = "sc-chip built";
              if (feedback === "ok") cls += " is-ok";
              if (feedback === "bad") cls += " is-bad";
              return '<span class="' + cls + '">' + b.text + "</span>";
            })
            .join("");

    var poolHtml = pool
      .map(function (c) {
        var cls = "sc-chip pool" + (c.used ? " is-used" : "");
        return (
          '<button type="button" class="' +
          cls +
          '" data-chip="' +
          c.id +
          '"' +
          (c.used || locked ? " disabled" : "") +
          ">" +
          c.text +
          "</button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="sc-top">' +
      '  <a class="sc-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="sc-top-center">' +
      '    <span class="sc-eyebrow">Build the Sentence</span>' +
      "    <strong>" +
      progress +
      "</strong>" +
      "  </div>" +
      '  <span class="sc-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="sc-progress-bar" aria-hidden="true"><div class="sc-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<section class="sc-card">' +
      '  <button type="button" class="' +
      playCls +
      '" id="sc-play" aria-label="' +
      playLabel +
      '">' +
      '    <span class="sc-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="sc-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="sc-play-ico">▶</span>') +
      "    </span>" +
      '    <span class="sc-play-label">' +
      playLabel +
      "</span>" +
      "  </button>" +
      '  <div class="sc-built" aria-label="Your sentence">' +
      builtHtml +
      "</div>" +
      '  <div class="sc-pool" aria-label="Word chips">' +
      poolHtml +
      "</div>" +
      '  <div class="sc-actions">' +
      '    <button type="button" class="sc-btn ghost" id="sc-back"' +
      (locked || !built.length ? " disabled" : "") +
      ">⌫ Undo</button>" +
      '    <button type="button" class="sc-btn ghost" id="sc-clear"' +
      (locked || !built.length ? " disabled" : "") +
      ">Clear</button>" +
      "  </div>" +
      "</section>";

    document.getElementById("sc-play").onclick = playAudio;
    document.getElementById("sc-back").onclick = removeLast;
    document.getElementById("sc-clear").onclick = clearAll;
    if (!locked) {
      app.querySelectorAll("[data-chip]").forEach(function (btn) {
        btn.onclick = function () {
          addChip(btn.dataset.chip);
        };
      });
    }
  }

  function renderDone() {
    const stars = calcStars();
    app.innerHTML =
      '<header class="sc-top">' +
      '  <a class="sc-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="sc-top-center">' +
      '    <span class="sc-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="sc-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="sc-done">' +
      '  <div class="sc-trophy' +
      (stars === 3 ? " perfect" : "") +
      '" aria-hidden="true">' +
      '    <div class="sc-trophy-emoji">🏆</div>' +
      '    <div class="sc-star-row">' +
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
      "  <p>You built <strong>" +
      correctCount +
      " / " +
      TOTAL +
      "</strong> sentences</p>" +
      '  <div class="sc-done-actions">' +
      '    <button type="button" class="sc-btn primary" id="sc-again">Play again</button>' +
      '    <a class="sc-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("sc-again").onclick = startGame;
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
