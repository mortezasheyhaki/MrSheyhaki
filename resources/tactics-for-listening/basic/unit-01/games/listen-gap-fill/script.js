/* Missing Words · Tactics For Listening Basic Unit 1
 * Listen → fill gaps from word bank (tap blank + word).
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-listen-gap-fill";
  const AUDIO = "https://cdn.imgurl.ir/uploads/a699553_06_Unit_1_www_mp3cut_net.mp3";

  // Dialogue lines with {gap:id} markers
  // Answers: name, Nice, live, phone, Have, great
  const LINES = [
    { speaker: "A", parts: ["Fun party, isn't it?"] },
    {
      speaker: "B",
      parts: ["Sure is. My ", { gap: 0 }, " is Emma, by the way."],
    },
    {
      speaker: "A",
      parts: ["It's nice to meet you, Emma. I'm Justin."],
    },
    {
      speaker: "B",
      parts: [{ gap: 1 }, " to meet you, Justin. Do you ", { gap: 2 }, " in L.A.?"],
    },
    {
      speaker: "A",
      parts: ["No, I'm from San Francisco. I'm visiting my sister here."],
    },
    {
      speaker: "B",
      parts: ["Oh, I love San Francisco. I go there sometimes for work."],
    },
    {
      speaker: "A",
      parts: [
        "Really? Call me next time you're there. Let me give you my ",
        { gap: 3 },
        " number.",
      ],
    },
    {
      speaker: "B",
      parts: [
        "Okay, hope to see you again! ",
        { gap: 4 },
        " a ",
        { gap: 5 },
        " time here in L.A.!",
      ],
    },
  ];

  const ANSWERS = ["name", "Nice", "live", "phone", "Have", "great"];
  const DISTRACTORS = ["email", "work"];

  const app = document.getElementById("game-app");
  let phase = "start";
  let fills = {}; // gapId -> word
  let bank = []; // { text, id, used }
  let selectedGap = null;
  let selectedWord = null;
  let locked = false;
  let checked = false;
  let playRecorded = false;
  let audio = null;
  let playing = false;
  let feedback = {}; // gapId -> ok|bad

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

  function setupBank() {
    const words = ANSWERS.concat(DISTRACTORS);
    bank = shuffle(
      words.map(function (w, i) {
        return { text: w, id: "w" + i, used: false };
      })
    );
    fills = {};
    selectedGap = null;
    selectedWord = null;
    feedback = {};
    checked = false;
    locked = false;
  }

  function calcStars(correct) {
    const total = ANSWERS.length;
    if (correct >= total) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
    return 0;
  }

  function countCorrect() {
    var n = 0;
    for (var i = 0; i < ANSWERS.length; i++) {
      if (fills[i] === ANSWERS[i]) n++;
    }
    return n;
  }

  function saveProgress(stars, correct) {
    if (!window.LAStars) return stars;
    if (!playRecorded) {
      LAStars.recordPlay(GAME_ID);
      playRecorded = true;
    }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: "Missing Words",
          category: "tactics-for-listening",
          unit: "basic-1",
          score: correct,
          maxScore: ANSWERS.length,
          accuracy: Math.round((correct / ANSWERS.length) * 100),
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
    sfx("click");
    if (playing && audio) {
      stopAudio();
      render();
      return;
    }
    stopAudio();
    audio = new Audio(AUDIO);
    audio.preload = "auto";
    playing = true;
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
    playRecorded = false;
    setupBank();
    phase = "play";
    render();
  }

  function selectGap(gapId) {
    if (locked || checked) return;
    // If a word is selected, place it
    if (selectedWord != null) {
      placeWordInGap(selectedWord, gapId);
      return;
    }
    // Toggle gap selection; if gap has word, free it
    if (selectedGap === gapId) {
      selectedGap = null;
    } else {
      selectedGap = gapId;
    }
    sfx("click");
    render();
  }

  function selectWord(wordId) {
    if (locked || checked) return;
    var chip = bank.find(function (b) {
      return b.id === wordId;
    });
    if (!chip || chip.used) return;

    if (selectedGap != null) {
      placeWordInGap(wordId, selectedGap);
      return;
    }
    selectedWord = selectedWord === wordId ? null : wordId;
    sfx("click");
    render();
  }

  function placeWordInGap(wordId, gapId) {
    var chip = bank.find(function (b) {
      return b.id === wordId;
    });
    if (!chip || chip.used) return;

    // free existing word in this gap
    if (fills[gapId]) {
      var old = fills[gapId];
      bank.forEach(function (b) {
        if (b.text === old && b.used) {
          // free first matching used chip with that text
          b.used = false;
          return false;
        }
      });
      // more carefully free one chip
      for (var i = 0; i < bank.length; i++) {
        if (bank[i].used && bank[i].text === old) {
          bank[i].used = false;
          break;
        }
      }
    }

    chip.used = true;
    fills[gapId] = chip.text;
    selectedGap = null;
    selectedWord = null;
    sfx("click");
    render();
  }

  function clearGap(gapId) {
    if (locked || checked) return;
    if (!fills[gapId]) return;
    var word = fills[gapId];
    delete fills[gapId];
    for (var i = 0; i < bank.length; i++) {
      if (bank[i].used && bank[i].text === word) {
        bank[i].used = false;
        break;
      }
    }
    sfx("click");
    render();
  }

  function checkAnswers() {
    if (locked) return;
    locked = true;
    checked = true;
    stopAudio();
    var correct = 0;
    feedback = {};
    for (var i = 0; i < ANSWERS.length; i++) {
      var ok = fills[i] === ANSWERS[i];
      feedback[i] = ok ? "ok" : "bad";
      if (ok) correct++;
    }
    if (correct === ANSWERS.length) sfx("correct");
    else sfx("wrong");
    var stars = calcStars(correct);
    saveProgress(stars, correct);
    render();

    setTimeout(function () {
      phase = "done";
      sfx("win");
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: correct,
          total: ANSWERS.length,
          stars: stars,
          accuracy: Math.round((correct / ANSWERS.length) * 100),
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
    }, 1200);
  }

  function allFilled() {
    for (var i = 0; i < ANSWERS.length; i++) {
      if (!fills[i]) return false;
    }
    return true;
  }

  function renderStart() {
    app.innerHTML =
      '<header class="gf-top">' +
      '  <a class="gf-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="gf-top-center">' +
      '    <span class="gf-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Missing Words</strong>" +
      "  </div>" +
      '  <span class="gf-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="gf-hero">' +
      '  <div class="gf-hero-icon" aria-hidden="true">📝</div>' +
      "  <h1>Missing Words</h1>" +
      "  <p>Listen to the conversation. Fill in the blanks with words from the list.</p>" +
      '  <ul class="gf-tips">' +
      '    <li><span class="tip-num">1</span><span>Play the <strong>conversation</strong></span></li>' +
      '    <li><span class="tip-num">2</span><span>Tap a <strong>blank</strong>, then a <strong>word</strong></span></li>' +
      '    <li><span class="tip-num">3</span><span>Fill all <strong>6</strong> gaps</span></li>' +
      "  </ul>" +
      '  <button type="button" class="gf-btn primary" id="gf-start">Start</button>' +
      "</section>";
    document.getElementById("gf-start").onclick = startGame;
  }

  function renderPlay() {
    var playCls = "gf-play" + (playing ? " is-playing" : "");
    var playLabel = playing ? "Playing…" : "Play conversation";

    var dialogueHtml = LINES.map(function (line) {
      var body = line.parts
        .map(function (p) {
          if (typeof p === "string") {
            return '<span class="gf-text">' + p + "</span>";
          }
          var gid = p.gap;
          var word = fills[gid];
          var cls = "gf-gap";
          if (selectedGap === gid) cls += " is-selected";
          if (word) cls += " is-filled";
          if (feedback[gid] === "ok") cls += " is-ok";
          if (feedback[gid] === "bad") cls += " is-bad";
          return (
            '<button type="button" class="' +
            cls +
            '" data-gap="' +
            gid +
            '"' +
            (locked ? " disabled" : "") +
            ">" +
            (word || "______") +
            "</button>"
          );
        })
        .join("");
      return (
        '<div class="gf-line">' +
        '<span class="gf-speaker">' +
        line.speaker +
        ":</span> " +
        '<span class="gf-line-body">' +
        body +
        "</span></div>"
      );
    }).join("");

    var bankHtml = bank
      .map(function (c) {
        var cls = "gf-chip" + (c.used ? " is-used" : "");
        if (selectedWord === c.id) cls += " is-selected";
        return (
          '<button type="button" class="' +
          cls +
          '" data-word="' +
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
      '<header class="gf-top">' +
      '  <a class="gf-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="gf-top-center">' +
      '    <span class="gf-eyebrow">Missing Words</span>' +
      "    <strong>Emma &amp; Justin</strong>" +
      "  </div>" +
      '  <span class="gf-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<button type="button" class="' +
      playCls +
      '" id="gf-play">' +
      '  <span class="gf-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="gf-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="gf-play-ico">▶</span>') +
      "  </span>" +
      '  <span class="gf-play-label">' +
      playLabel +
      "</span>" +
      "</button>" +
      '<section class="gf-dialogue">' +
      dialogueHtml +
      "</section>" +
      '<div class="gf-bank-label">Word bank</div>' +
      '<div class="gf-bank">' +
      bankHtml +
      "</div>" +
      '<div class="gf-actions">' +
      (checked
        ? ""
        : '<button type="button" class="gf-btn primary" id="gf-check"' +
          (allFilled() ? "" : " disabled") +
          ">Check answers</button>") +
      "</div>";

    document.getElementById("gf-play").onclick = playAudio;
    var checkBtn = document.getElementById("gf-check");
    if (checkBtn) checkBtn.onclick = checkAnswers;

    app.querySelectorAll("[data-gap]").forEach(function (btn) {
      btn.onclick = function () {
        var gid = +btn.dataset.gap;
        if (fills[gid] && selectedWord == null && selectedGap !== gid && !checked) {
          // second tap on filled gap clears it
          if (selectedGap === null) {
            clearGap(gid);
            return;
          }
        }
        selectGap(gid);
      };
    });
    app.querySelectorAll("[data-word]").forEach(function (btn) {
      btn.onclick = function () {
        selectWord(btn.dataset.word);
      };
    });
  }

  function renderDone() {
    var correct = countCorrect();
    var stars = calcStars(correct);
    app.innerHTML =
      '<header class="gf-top">' +
      '  <a class="gf-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="gf-top-center">' +
      '    <span class="gf-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="gf-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="gf-done">' +
      '  <div class="gf-trophy' +
      (stars === 3 ? " perfect" : "") +
      '">' +
      '    <div class="gf-trophy-emoji">🏆</div>' +
      '    <div class="gf-star-row">' +
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
      correct +
      " / " +
      ANSWERS.length +
      "</strong> words correct</p>" +
      '  <div class="gf-done-actions">' +
      '    <button type="button" class="gf-btn primary" id="gf-again">Play again</button>' +
      '    <a class="gf-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("gf-again").onclick = startGame;
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
