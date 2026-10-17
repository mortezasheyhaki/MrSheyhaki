/* Missing Words · Tactics For Listening Developing Unit 1
 * Listen → tap a blank, then a word (or a word, then a blank) → check.
 * Tap a filled blank with nothing selected to take the word back out.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u1-listen-gap-fill";
  var UNIT = "Unit 1 · Developing";
  var AUDIO = "https://cdn.imgurl.ir/uploads/y734629_06_Unit_1_mp3cut_net.mp3";
  var BACK = "../../";

  var LINES = [
    { speaker: "A", parts: ["Hi, Amy. What did you do this weekend?"] },
    { speaker: "B", parts: ["Oh, not much. I ", { gap: 0 }, " home and ", { gap: 1 }, " on a project."] },
    { speaker: "A", parts: ["Is that all?"] },
    { speaker: "B", parts: ["No. I also finished a good book. Later, I ", { gap: 2 }, ". What about you?"] },
    { speaker: "A", parts: ["I played tennis. The courts were crowded. I ", { gap: 3 }, " a long time to play!"] },
    { speaker: "B", parts: ["What else did you do?"] },
    { speaker: "A", parts: ["Some friends ", { gap: 4 }, " to dinner. Later, we went to a club and met a lot of ", { gap: 5 }, "."] },
  ];

  var ANSWERS = ["stayed", "worked", "visited a friend", "waited", "invited me", "interesting people"];
  var DISTRACTORS = ["played", "watched TV", "went out"];

  var app = document.getElementById("game-app");
  var phase = "start";
  var fills = {};
  var bank = [];
  var selectedGap = null;
  var selectedWord = null;
  var checked = false;
  var feedback = {};
  var playRecorded = false;
  var audio = null;
  var playing = false;
  var listened = false;
  var audioError = false;
  var finishTimer = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- state ---------- */

  function setupBank() {
    bank = shuffle(ANSWERS.concat(DISTRACTORS)).map(function (w, i) {
      return { text: w, id: "w" + i, used: false };
    });
    fills = {};
    selectedGap = null;
    selectedWord = null;
    feedback = {};
    checked = false;
  }

  function filledCount() {
    var n = 0;
    for (var i = 0; i < ANSWERS.length; i++) if (fills[i]) n++;
    return n;
  }

  function allFilled() { return filledCount() === ANSWERS.length; }

  function countCorrect() {
    var n = 0;
    for (var i = 0; i < ANSWERS.length; i++) if (fills[i] === ANSWERS[i]) n++;
    return n;
  }

  function calcStars(correct) {
    if (correct >= ANSWERS.length) return 3;
    if (correct >= 4) return 2;
    if (correct >= 3) return 1;
    return 0;
  }

  function releaseWord(text) {
    for (var i = 0; i < bank.length; i++) {
      if (bank[i].used && bank[i].text === text) { bank[i].used = false; return; }
    }
  }

  function placeWordInGap(wordId, gapId) {
    var chip = bank.find(function (b) { return b.id === wordId; });
    if (!chip || chip.used) return;
    if (fills[gapId]) releaseWord(fills[gapId]);
    chip.used = true;
    fills[gapId] = chip.text;
    selectedGap = null;
    selectedWord = null;
    sfx("click");
    render();
  }

  function clearGap(gapId) {
    if (checked || !fills[gapId]) return;
    releaseWord(fills[gapId]);
    delete fills[gapId];
    sfx("click");
    render();
  }

  function onBlank(gapId) {
    if (checked) return;
    if (selectedWord != null) { placeWordInGap(selectedWord, gapId); return; }
    if (selectedGap === null && fills[gapId]) { clearGap(gapId); return; }
    selectedGap = selectedGap === gapId ? null : gapId;
    sfx("click");
    render();
  }

  function onChip(wordId) {
    if (checked) return;
    var chip = bank.find(function (b) { return b.id === wordId; });
    if (!chip || chip.used) return;
    if (selectedGap !== null) { placeWordInGap(wordId, selectedGap); return; }
    selectedWord = selectedWord === wordId ? null : wordId;
    sfx("click");
    render();
  }

  /* ---------- audio ---------- */

  function stopAudio() {
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
    playing = false;
  }

  function playAudio() {
    if (audioError) return;
    sfx("click");
    if (playing) { stopAudio(); renderListenStrip(); return; }
    stopAudio();
    audio = new Audio(AUDIO);
    audio.preload = "auto";
    playing = true;
    listened = true;
    renderListenStrip();
    audio.onended = function () { playing = false; renderListenStrip(); };
    audio.onerror = function () { playing = false; audioError = true; renderListenStrip(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderListenStrip(); });
    }
  }

  /* ---------- flow ---------- */

  function saveProgress(stars, correct) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: "Missing Words",
          category: "tactics-for-listening",
          unit: "developing-1",
          score: correct,
          maxScore: ANSWERS.length,
          accuracy: Math.round((correct / ANSWERS.length) * 100),
          completed: true,
          stars: stars,
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (finishTimer) { clearTimeout(finishTimer); finishTimer = null; }
    if (window.LAFinish) LAFinish.startTimer();
    playRecorded = false;
    listened = false;
    audioError = false;
    stopAudio();
    setupBank();
    phase = "play";
    render();
  }

  function checkAnswers() {
    if (checked || !allFilled()) return;
    checked = true;
    selectedGap = null;
    selectedWord = null;
    stopAudio();
    var correct = 0;
    feedback = {};
    for (var i = 0; i < ANSWERS.length; i++) {
      if (fills[i] === ANSWERS[i]) { feedback[i] = "ok"; correct++; }
      else feedback[i] = "bad";
    }
    var stars = calcStars(correct);
    saveProgress(stars, correct);
    if (correct === ANSWERS.length) sfx("win");
    else if (correct >= 3) sfx("correct");
    else sfx("wrong");
    render();

    finishTimer = setTimeout(function () {
      finishTimer = null;
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: correct,
          total: ANSWERS.length,
          stars: stars,
          accuracy: Math.round((correct / ANSWERS.length) * 100),
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: BACK,
          save: false,
        });
      } else {
        phase = "done";
        render();
      }
    }, 1600);
  }

  /* ---------- views ---------- */

  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>Missing Words</strong></div>" +
      '<span class="lc-counter">' + (counter || "") + "</span>" +
      "</header>"
    );
  }

  function segmentsHtml() {
    return (
      '<div class="lc-seg" role="img" aria-label="' + filledCount() + " of " + ANSWERS.length + ' gaps filled">' +
      ANSWERS.map(function (_, i) {
        var cls = "";
        if (feedback[i] === "ok") cls = " is-right";
        else if (feedback[i] === "bad") cls = " is-wrong";
        else if (fills[i]) cls = " is-done";
        return '<i class="' + cls.trim() + '"></i>';
      }).join("") +
      "</div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">📝</div>' +
      "<h1>Missing Words</h1>" +
      '<p class="lc-intro-lede">Listen to the conversation and fill in the missing words from the word bank.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="gf-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the dialogue</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap a blank, then a word. You can also go word first.</span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> gaps to fill, then check</span></li>' +
      "</ol>" +
      "</section>";
    document.getElementById("gf-start").onclick = startGame;
  }

  function blankHtml(gid) {
    var filled = fills[gid];
    var cls = "gf-blank";
    if (selectedGap === gid) cls += " is-selected";
    if (filled) cls += " is-filled";
    if (feedback[gid] === "ok") cls += " is-correct";
    if (feedback[gid] === "bad") cls += " is-wrong";
    var inner;
    if (feedback[gid] === "bad") {
      inner = esc(filled || "______") + "<small>→ " + esc(ANSWERS[gid]) + "</small>";
    } else {
      inner = filled ? esc(filled) : "______";
    }
    return (
      '<button type="button" class="' + cls + '" data-gap="' + gid + '"' + (checked ? " disabled" : "") +
      ' aria-label="' + esc("Gap " + (gid + 1) + (filled ? ": " + filled : ", empty")) + '">' +
      inner + "</button>"
    );
  }

  function dialogueHtml() {
    return LINES.map(function (line) {
      var parts = line.parts.map(function (p) {
        return typeof p === "string" ? esc(p) : blankHtml(p.gap);
      }).join("");
      return (
        '<div class="gf-line"><span class="gf-speaker" aria-hidden="true">' + line.speaker + "</span>" +
        '<p class="gf-text">' + parts + "</p></div>"
      );
    }).join("");
  }

  function bankHtml() {
    var chips = bank.filter(function (c) { return !c.used; }).map(function (c) {
      return (
        '<button type="button" class="gf-chip' + (selectedWord === c.id ? " is-selected" : "") +
        '" data-word="' + c.id + '"' + (checked ? " disabled" : "") + ">" + esc(c.text) + "</button>"
      );
    }).join("");
    return chips || '<p class="gf-empty">All words placed. Tap a blank to take one back.</p>';
  }

  function listenStripHtml() {
    var cls = "lc-play";
    if (playing) cls += " is-playing";
    if (audioError) cls += " is-error";
    var label = audioError ? "Audio unavailable" : playing ? "Stop" : listened ? "Play again" : "Play audio";
    var status = audioError
      ? "This clip could not load. Check your connection."
      : playing ? "Playing… tap to stop"
      : listened ? "Tap to hear it again"
      : "Listen first, then fill the blanks";
    return (
      '<div class="gf-listen">' +
      '<button type="button" class="' + cls + '" id="gf-play" aria-label="' + esc(label) + '"' + (audioError ? " disabled" : "") + ">" +
      (playing
        ? '<span class="lc-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'
        : '<span class="lc-play-ico" aria-hidden="true">▶</span>') +
      '<span class="lc-play-label">' + esc(label) + "</span></button>" +
      '<div class="gf-listen-text"><strong>' + esc(label) + "</strong><span>" + esc(status) + "</span></div>" +
      '<span class="gf-count">' + filledCount() + " / " + ANSWERS.length + " filled</span>" +
      "</div>"
    );
  }

  /* partial re-render that keeps the page still while audio plays */
  function renderListenStrip() {
    var strip = document.querySelector(".gf-listen");
    if (!strip) return;
    strip.outerHTML = listenStripHtml();
    bindPlay();
  }

  function bindPlay() {
    var b = document.getElementById("gf-play");
    if (b) b.onclick = playAudio;
  }

  function renderPlay() {
    var filled = filledCount();
    var canCheck = allFilled() && !checked;
    var counter = checked ? countCorrect() + " / " + ANSWERS.length + " right" : filled + " / " + ANSWERS.length;

    app.innerHTML =
      topBar(counter) +
      segmentsHtml() +
      '<main class="lc-main gf-main">' +
      "<div>" +
      listenStripHtml() +
      '<section class="gf-sheet">' +
      '<div class="gf-sheet-head"><span>Dialogue</span><span>Tap a blank to fill it</span></div>' +
      '<div class="gf-dialogue">' + dialogueHtml() + "</div>" +
      "</section>" +
      "</div>" +
      '<aside class="gf-tray" aria-label="Word bank">' +
      '<div class="gf-tray-head"><h2>Word bank</h2><span>' + bank.filter(function (c) { return !c.used; }).length + " left</span></div>" +
      '<div class="gf-bank">' + bankHtml() + "</div>" +
      '<button type="button" class="gf-check" id="gf-check"' + (canCheck ? "" : " disabled") + ">" +
      (checked ? "Checking…" : "Check answers") + "</button>" +
      (canCheck || checked ? "" : '<p class="gf-hint">Fill all six gaps to check.</p>') +
      "</aside>" +
      "</main>";

    bindPlay();
    app.querySelectorAll("[data-gap]").forEach(function (btn) {
      btn.onclick = function () { onBlank(+btn.getAttribute("data-gap")); };
    });
    app.querySelectorAll("[data-word]").forEach(function (btn) {
      btn.onclick = function () { onChip(btn.getAttribute("data-word")); };
    });
    var check = document.getElementById("gf-check");
    if (check) check.onclick = checkAnswers;
  }

  function renderDone() {
    var correct = countCorrect();
    var stars = calcStars(correct);
    var p = Math.round((correct / ANSWERS.length) * 100);
    app.innerHTML =
      topBar("") +
      '<section class="lc-done"><div class="lc-result">' +
      '<div class="lc-ring" style="--p:' + p + '" aria-hidden="true"><div class="lc-ring-inner">' +
      '<span class="lc-ring-score">' + correct + "</span>" +
      '<span class="lc-ring-of">of ' + ANSWERS.length + "</span></div></div>" +
      '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div>" +
      "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!") + "</h1>" +
      "<p>You got " + correct + " out of " + ANSWERS.length + " gaps right.</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="gf-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
      "</div></div></section>";
    document.getElementById("gf-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) { stopAudio(); renderListenStrip(); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
