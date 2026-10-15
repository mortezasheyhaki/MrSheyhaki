/* Spell the Name · Tactics For Listening Basic Unit 1
 * Picture + audio → spell the name in letter boxes.
 * LAStars + LAFinish + LASfx.
 */
(function () {
  "use strict";

  const GAME_ID = "tfl-basic-u1-listen-spell-names";
  const TOTAL = 6;

  const ITEMS = [
    {
      name: "ELLISE",
      gender: "her",
      img: "https://cdn.imgurl.ir/uploads/n170167_1_Ellise.png",
      audio: "https://cdn.imgurl.ir/uploads/n609428_04_Unit_1_Ellise.mp3",
    },
    {
      name: "MICK",
      gender: "his",
      img: "https://cdn.imgurl.ir/uploads/a90500_2_Mick.png",
      audio: "https://cdn.imgurl.ir/uploads/d74532_04_Unit_1_Mick.mp3",
    },
    {
      name: "HANNAH",
      gender: "her",
      img: "https://cdn.imgurl.ir/uploads/b700562_3_Hannah.png",
      audio: "https://cdn.imgurl.ir/uploads/m025109_04_Unit_1_Hannah.mp3",
    },
    {
      name: "DEVON",
      gender: "his",
      img: "https://cdn.imgurl.ir/uploads/s980993_4_Devon.png",
      audio: "https://cdn.imgurl.ir/uploads/c260569_04_Unit_1_Devon.mp3",
    },
    {
      name: "IKE",
      gender: "his",
      img: "https://cdn.imgurl.ir/uploads/d063039_5_Ike.png",
      audio: "https://cdn.imgurl.ir/uploads/v243765_04_Unit_1_Ike.mp3",
    },
    {
      name: "TANDY",
      gender: "her",
      img: "https://cdn.imgurl.ir/uploads/e8454_6_Tandy.png",
      audio: "https://cdn.imgurl.ir/uploads/w241838_04_Unit_1_Tandy.mp3",
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
  let slots = []; // filled letters
  let tiles = []; // { letter, used }
  let locked = false;
  let feedback = null; // 'ok' | 'bad' | null

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

  function buildTiles(name) {
    // Letters of the name + 2–3 distractors from nearby alphabet
    const letters = name.split("");
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const used = {};
    letters.forEach(function (ch) {
      used[ch] = true;
    });
    const distractors = shuffle(pool.filter(function (ch) {
      return !used[ch];
    })).slice(0, Math.min(3, 8 - letters.length > 0 ? 3 : 2));
    return shuffle(
      letters.concat(distractors).map(function (letter, i) {
        return { id: i + "-" + letter, letter: letter, used: false };
      })
    );
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
          gameName: "Spell the Name",
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

  function setupItem() {
    const item = ITEMS[current];
    slots = new Array(item.name.length).fill("");
    tiles = buildTiles(item.name);
    locked = false;
    feedback = null;
    listened = false;
    playing = false;
    stopAudio();
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

  function placeLetter(tileIndex) {
    if (locked || phase !== "play") return;
    const tile = tiles[tileIndex];
    if (!tile || tile.used) return;
    const empty = slots.indexOf("");
    if (empty === -1) return;
    sfx("click");
    slots[empty] = tile.letter;
    tile.used = true;
    render();
    // auto-check when full
    if (slots.indexOf("") === -1) {
      checkSpelling();
    }
  }

  function clearLast() {
    if (locked || phase !== "play") return;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i]) {
        const letter = slots[i];
        slots[i] = "";
        // free one matching used tile
        for (let t = 0; t < tiles.length; t++) {
          if (tiles[t].used && tiles[t].letter === letter) {
            tiles[t].used = false;
            break;
          }
        }
        sfx("click");
        feedback = null;
        render();
        return;
      }
    }
  }

  function clearAll() {
    if (locked || phase !== "play") return;
    slots = slots.map(function () {
      return "";
    });
    tiles.forEach(function (t) {
      t.used = false;
    });
    feedback = null;
    sfx("click");
    render();
  }

  function checkSpelling() {
    if (locked) return;
    const item = ITEMS[current];
    const guess = slots.join("");
    locked = true;
    if (guess === item.name) {
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
      // Keep audio playing — only clear letters for another try
      feedback = "bad";
      sfx("wrong");
      render();
      setTimeout(function () {
        slots = slots.map(function () {
          return "";
        });
        tiles.forEach(function (t) {
          t.used = false;
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
      '<header class="sp-top">' +
      '  <a class="sp-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="sp-top-center">' +
      '    <span class="sp-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Spell the Name</strong>" +
      "  </div>" +
      '  <span class="sp-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="sp-hero">' +
      '  <div class="sp-hero-icon" aria-hidden="true">🔤</div>' +
      "  <h1>Spell the Name</h1>" +
      "  <p>Look at the picture, listen, and spell each person’s name letter by letter.</p>" +
      '  <ul class="sp-tips">' +
      '    <li><span class="tip-num">1</span><span>Play the <strong>audio</strong></span></li>' +
      '    <li><span class="tip-num">2</span><span>Tap letters to fill the <strong>boxes</strong></span></li>' +
      '    <li><span class="tip-num">3</span><span>Spell all <strong>6</strong> names</span></li>' +
      "  </ul>" +
      '  <button type="button" class="sp-btn primary" id="sp-start">Start</button>' +
      "</section>";
    document.getElementById("sp-start").onclick = startGame;
  }

  function renderPlay() {
    const item = ITEMS[current];
    const progress = current + 1 + " / " + TOTAL;
    const pct = (current / TOTAL) * 100;
    const playCls =
      "sp-play" + (playing ? " is-playing" : "") + (listened ? " has-played" : "");
    const playLabel = playing ? "Playing…" : listened ? "Play again" : "Play audio";
    const question = "What's " + item.gender + " name?";

    var slotsHtml = slots
      .map(function (ch, i) {
        var cls = "sp-slot";
        if (feedback === "ok") cls += " is-ok";
        if (feedback === "bad" && ch) cls += " is-bad";
        if (ch) cls += " is-filled";
        return '<span class="' + cls + '">' + (ch || "") + "</span>";
      })
      .join("");

    var tilesHtml = tiles
      .map(function (t, i) {
        var cls = "sp-tile" + (t.used ? " is-used" : "");
        return (
          '<button type="button" class="' +
          cls +
          '" data-tile="' +
          i +
          '"' +
          (t.used || locked ? " disabled" : "") +
          ">" +
          t.letter +
          "</button>"
        );
      })
      .join("");

    app.innerHTML =
      '<header class="sp-top">' +
      '  <a class="sp-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="sp-top-center">' +
      '    <span class="sp-eyebrow">Spell the Name</span>' +
      "    <strong>" +
      progress +
      "</strong>" +
      "  </div>" +
      '  <span class="sp-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="sp-progress-bar" aria-hidden="true"><div class="sp-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<section class="sp-card">' +
      '  <div class="sp-photo-wrap">' +
      '    <img class="sp-photo" src="' +
      item.img +
      '" alt="Person ' +
      (current + 1) +
      '" draggable="false" />' +
      "  </div>" +
      '  <p class="sp-question">' +
      question +
      "</p>" +
      '  <button type="button" class="' +
      playCls +
      '" id="sp-play" aria-label="' +
      playLabel +
      '">' +
      '    <span class="sp-play-visual" aria-hidden="true">' +
      (playing
        ? '<span class="sp-bars"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="sp-play-ico">▶</span>') +
      "    </span>" +
      '    <span class="sp-play-label">' +
      playLabel +
      "</span>" +
      "  </button>" +
      '  <div class="sp-slots" aria-label="Spell the name">' +
      slotsHtml +
      "</div>" +
      '  <div class="sp-tiles">' +
      tilesHtml +
      "</div>" +
      '  <div class="sp-actions">' +
      '    <button type="button" class="sp-btn ghost" id="sp-backspace"' +
      (locked ? " disabled" : "") +
      ">⌫ Clear last</button>" +
      '    <button type="button" class="sp-btn ghost" id="sp-clear"' +
      (locked ? " disabled" : "") +
      ">Clear all</button>" +
      "  </div>" +
      "</section>";

    document.getElementById("sp-play").onclick = playAudio;
    document.getElementById("sp-backspace").onclick = clearLast;
    document.getElementById("sp-clear").onclick = clearAll;
    if (!locked) {
      app.querySelectorAll("[data-tile]").forEach(function (btn) {
        btn.onclick = function () {
          placeLetter(+btn.dataset.tile);
        };
      });
    }
  }

  function renderDone() {
    const stars = calcStars();
    app.innerHTML =
      '<header class="sp-top">' +
      '  <a class="sp-back" href="../../" aria-label="Back to Unit 1">←</a>' +
      '  <div class="sp-top-center">' +
      '    <span class="sp-eyebrow">Unit 1 · Basic</span>' +
      "    <strong>Done!</strong>" +
      "  </div>" +
      '  <span class="sp-top-spacer" aria-hidden="true"></span>' +
      "</header>" +
      '<section class="sp-done">' +
      '  <div class="sp-trophy' +
      (stars === 3 ? " perfect" : "") +
      '" aria-hidden="true">' +
      '    <div class="sp-trophy-emoji">🏆</div>' +
      '    <div class="sp-star-row">' +
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
      "  <p>You spelled <strong>" +
      correctCount +
      " / " +
      TOTAL +
      "</strong> names correctly</p>" +
      '  <div class="sp-done-actions">' +
      '    <button type="button" class="sp-btn primary" id="sp-again">Play again</button>' +
      '    <a class="sp-btn secondary" href="../../">Back to Unit 1</a>' +
      "  </div>" +
      "</section>";
    document.getElementById("sp-again").onclick = startGame;
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
