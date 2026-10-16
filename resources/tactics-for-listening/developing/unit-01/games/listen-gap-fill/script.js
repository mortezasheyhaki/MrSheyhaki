/* Missing Words · Tactics For Listening Developing Unit 1
 * Listen → tap a blank, then a word (or word, then blank) → check.
 * Tap a filled blank with nothing selected to take the word back out.
 * Uses LAStars + LAFinish + LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u1-listen-gap-fill";
  var AUDIO = "https://cdn.imgurl.ir/uploads/y734629_06_Unit_1_mp3cut_net.mp3";

  // Dialogue with {gap: id} markers
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
  var fills = {};          // gapId -> word text
  var bank = [];           // { text, id, used }
  var selectedGap = null;
  var selectedWord = null;
  var checked = false;
  var feedback = {};       // gapId -> "ok" | "bad"
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
    var words = ANSWERS.concat(DISTRACTORS);
    bank = shuffle(words).map(function (w, i) {
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

  function allFilled() {
    return filledCount() === ANSWERS.length;
  }

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
      if (bank[i].used && bank[i].text === text) {
        bank[i].used = false;
        return;
      }
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
    if (selectedWord != null) {
      placeWordInGap(selectedWord, gapId);
      return;
    }
    if (selectedGap === null && fills[gapId]) {
      clearGap(gapId);
      return;
    }
    selectedGap = selectedGap === gapId ? null : gapId;
    sfx("click");
    render();
  }

  function onChip(wordId) {
    if (checked) return;
    var chip = bank.find(function (b) { return b.id === wordId; });
    if (!chip || chip.used) return;
    if (selectedGap !== null) {
      placeWordInGap(wordId, selectedGap);
      return;
    }
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
    sfx("click");
    if (playing) {
      stopAudio();
      renderPlayArea();
      return;
    }
    stopAudio();
    audioError = false;
    audio = new Audio(AUDIO);
    audio.preload = "auto";
    playing = true;
    listened = true;
    renderPlayArea();
    audio.onended = function () { playing = false; renderPlayArea(); };
    audio.onerror = function () { playing = false; audioError = true; renderPlayArea(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderPlayArea(); });
    }
  }

  /* ---------- flow ---------- */

  function saveProgress(stars, correct) {
    if (!window.LAStars) return;
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
          backHref: "../../",
          save: false,
        });
      } else {
        phase = "done";
        render();
      }
    }, 1500);
  }

  /* ---------- views ---------- */

  function topBar(eyebrow, title) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="../../" aria-label="Back to unit">←</a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(eyebrow) + "</span><strong>" + esc(title) + "</strong></div>" +
      '<span class="lc-top-spacer" aria-hidden="true"></span>' +
      "</header>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("Unit 1 · Developing", "Missing Words") +
      '<section class="lc-hero">' +
      '<div class="lc-hero-icon" aria-hidden="true">📝</div>' +
      "<h1>Missing Words</h1>" +
      "<p>Listen to the conversation and fill in the missing words from the word bank.</p>" +
      '<ul class="lc-tips">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the dialogue</span></li>' +
      '<li><span class="tip-num">2</span><span>Tap a blank, then a word (or a word, then a blank)</span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> gaps to fill</span></li>' +
      "</ul>" +
      '<button type="button" class="lc-btn primary" id="gf-start">Start listening</button>' +
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
      '<button type="button" class="' + cls + '" data-gap="' + gid + '"' +
      (checked ? " disabled" : "") +
      ' aria-label="' + esc("Gap " + (gid + 1) + (filled ? ": " + filled : " (empty)")) + '">' +
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
        '<span class="gf-text">' + parts + "</span></div>"
      );
    }).join("");
  }

  function bankHtml() {
    var chips = bank
      .filter(function (c) { return !c.used; })
      .map(function (c) {
        return (
          '<button type="button" class="gf-chip' + (selectedWord === c.id ? " is-selected" : "") +
          '" data-word="' + c.id + '"' + (checked ? " disabled" : "") + ">" + esc(c.text) + "</button>"
        );
      })
      .join("");
    return chips || '<p class="gf-empty">All words placed — tap a blank to take one back.</p>';
  }

  function playAreaHtml() {
    var playCls = "lc-play" + (playing ? " is-playing" : "") + (listened && !playing ? " has-played" : "") + (audioError ? " is-error" : "");
    var label = audioError ? "Audio unavailable" : playing ? "Playing… tap to stop" : listened ? "Play again" : "Play audio";
    return (
      '<button type="button" class="' + playCls + '" id="gf-play" aria-label="' + esc(label) + '"' +
      (audioError ? " disabled" : "") + ">" +
      '<span class="lc-play-visual" aria-hidden="true">' +
      (playing ? '<span class="lc-bars"><i></i><i></i><i></i><i></i><i></i></span>' : '<span class="lc-play-ico">▶</span>') +
      "</span>" +
      '<span class="lc-play-label">' + esc(label) + "</span></button>"
    );
  }

  function renderPlayArea() {
    var holder = document.getElementById("gf-play-holder");
    if (holder) {
      holder.innerHTML = playAreaHtml();
      bindPlay();
    }
  }

  function bindPlay() {
    var b = document.getElementById("gf-play");
    if (b) b.onclick = playAudio;
  }

  function renderPlay() {
    var filled = filledCount();
    var statusText = checked
      ? countCorrect() + " / " + ANSWERS.length + " correct"
      : filled + " / " + ANSWERS.length + " filled";
    var pct = (filled / ANSWERS.length) * 100;
    var canCheck = allFilled() && !checked;

    app.innerHTML =
      topBar("Missing Words", "Fill the gaps") +
      '<div class="lc-progress-bar" aria-hidden="true"><div class="lc-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<section class="lc-card gf-card' + (checked ? " is-checked" : "") + '">' +
      '<div class="gf-status"><span>Listen, then fill the blanks</span><span>' + statusText + "</span></div>" +
      '<div id="gf-play-holder">' + playAreaHtml() + "</div>" +
      '<div class="gf-dialogue">' + dialogueHtml() + "</div>" +
      '<div class="gf-bank-wrap">' +
      '<p class="gf-bank-label">Word bank</p>' +
      '<div class="gf-bank">' + bankHtml() + "</div>" +
      "</div>" +
      '<div class="gf-actions">' +
      '<button type="button" class="lc-btn primary" id="gf-check"' + (canCheck ? "" : " disabled") + ">" +
      (checked ? "Checking…" : "Check answers") + "</button>" +
      (canCheck || checked ? "" : '<p class="gf-hint-line">Fill all six gaps to check.</p>') +
      "</div>" +
      "</section>";

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
    app.innerHTML =
      topBar("Unit 1 · Developing", "Done!") +
      '<section class="lc-done">' +
      '<div class="lc-trophy' + (stars === 3 ? " perfect" : "") + '" aria-hidden="true">' +
      '<div class="lc-trophy-emoji">🏆</div>' +
      '<div class="lc-star-row">' +
      '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
      '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
      "</div></div>" +
      "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!") + "</h1>" +
      "<p>You got <strong>" + correct + " / " + ANSWERS.length + "</strong> gaps right</p>" +
      '<div class="lc-done-actions">' +
      '<button type="button" class="lc-btn primary" id="gf-again">Play again</button>' +
      '<a class="lc-btn secondary" href="../../">Back to unit</a>' +
      "</div></section>";
    document.getElementById("gf-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) {
      stopAudio();
      renderPlayArea();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
