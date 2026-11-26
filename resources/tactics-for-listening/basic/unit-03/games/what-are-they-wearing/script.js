/* What Are They Wearing? · Tactics For Listening · Basic Unit 3
 * Sandra describes eight people in the lineup. For each clip the player listens
 * and taps the letter of the person being described.
 *  - one clip at a time, played automatically (on phones, tap ▶ if the browser blocks autoplay)
 *  - a correct letter locks (each letter is the answer to exactly one clip) and the next clip plays
 *  - a wrong letter is marked for this clip only, the correct answer is NOT revealed,
 *    and the player keeps choosing until they find it; the letter is available again next clip
 *  - a clip scores only if it was right on the first try
 *  - no names are shown
 *  - keyboard (desktop): A–H choose a letter, Space or R plays the clip again
 * The screen is built once per game and only its parts are updated, so nothing redraws
 * or jumps when a letter is tapped.
 * Uses LAStars, LAFinish and LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-what-are-they-wearing";
  var GAME_NAME = "What Are They Wearing?";
  var BACK = "../../";          // back to Unit 3
  var CDN = "https://cdn.imgurl.ir/uploads/";
  var PICTURE = CDN + "v537375_Labeled_Studio_Lineup_of_Eight_Friends.png";
  var LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // one clip per question, in order; ANSWERS[i] is the letter for AUDIO[i]
  var AUDIO = [
    CDN + "v894020_12_Unit_3_-_1.mp3",
    CDN + "p85026_12_Unit_3_-_2.mp3",
    CDN + "x412002_12_Unit_3_-_3.mp3",
    CDN + "k635922_12_Unit_3_-_4.mp3",
    CDN + "y79399_12_Unit_3_-_5.mp3",
    CDN + "g204022_12_Unit_3_-_6.mp3",
    CDN + "k441555_12_Unit_3_-_7.mp3",
    CDN + "k41489_12_Unit_3_-_8.mp3"
  ];
  var ANSWERS = ["H", "D", "G", "E", "C", "B", "F", "A"];

  var ENC_OK = ["Correct! Great listening.", "Yes, that's the one!", "Nice work!", "You heard it!", "Excellent!"];
  var ENC_BAD = ["Not this one — listen again and try another letter.", "Close! Listen for the clothes and try again.", "No worries, keep listening and choose again."];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";   // start | play | done
  var q = 0;             // current question index
  var firstTry = [];     // true/false per question: was it right on the first pick?
  var used = {};         // letters answered correctly (locked for the rest of the game)
  var wrongNow = {};     // wrong letters tried on the current clip only
  var lastCorrect = null;// letter just answered correctly (plays its pop once)
  var fb = { type: "", text: "" };
  var busy = false;      // true while the next clip is about to start
  var nextTimer = null;
  var playedFor = -1;    // question index whose clip has been started at least once
  var blocked = false;   // browser blocked autoplay: prompt the player to tap play
  var audio = new Audio();
  audio.preload = "auto";
  var playRecorded = false;
  var startedAt = 0;
  var els = null;        // references to the parts of the play screen

  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  function correctCount() {
    var n = 0;
    for (var i = 0; i < firstTry.length; i++) if (firstTry[i]) n++;
    return n;
  }
  function pct() { return Math.round((q / AUDIO.length) * 100); }

  /* ---------- audio status ---------- */
  function setStatus(text, playing) {
    if (!els) return;
    els.status.className = "wt-status" + (playing ? " is-playing" : "");
    els.status.innerHTML = playing
      ? '<span class="wt-wave" aria-hidden="true"><i></i><i></i><i></i></span>' + esc(text)
      : esc(text);
  }

  function playClip() {
    if (phase !== "play") return;
    audio.pause();
    audio.src = AUDIO[q];
    audio.currentTime = 0;
    playedFor = q;
    blocked = false;
    setStatus("Listening…", true);
    refreshPlay();
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () {
        // autoplay blocked (common on phones after a clip change): ask for one tap
        if (phase !== "play") return;
        blocked = true;
        setStatus("Tap ▶ Play clip to hear it", false);
        refreshPlay();
      });
    }
  }

  audio.addEventListener("playing", function () { if (phase === "play") { blocked = false; refreshPlay(); } });
  audio.addEventListener("ended", function () {
    if (phase !== "play" || busy) return;
    setStatus("Choose the letter", false);
  });
  audio.addEventListener("error", function () {
    if (phase !== "play" || busy) return;
    setStatus("This clip could not load. Tap ▶ to try again.", false);
    blocked = true;
    refreshPlay();
  });

  /* ---------- screens ---------- */
  function topBar() {
    return (
      '<header class="wt-top">' +
      '<a class="wt-back" href="' + BACK + '" aria-label="Back to Unit 3">←</a>' +
      '<div class="wt-title"><span>Unit 3 · Basic</span><strong>' + GAME_NAME + '</strong></div>' +
      '<span class="wt-pill" id="wt-pill"></span>' +
      '</header>'
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar() +
      '<section class="wt-card">' +
      '<div class="wt-emoji" aria-hidden="true">🎧</div>' +
      '<h1>What Are They Wearing?</h1>' +
      '<p>Look at the picture of eight people. Each clip describes one person. Listen, then tap the letter of the person Sandra is describing.</p>' +
      '<p>If you choose the wrong letter, listen again and try another. Each letter is the right answer once.</p>' +
      '<button type="button" class="wt-btn" id="wt-start">Start ▶</button>' +
      '</section>';
    document.getElementById("wt-start").onclick = startGame;
    els = null;
  }

  // built once per game; afterwards only the changing parts are updated
  function buildPlay() {
    var chips = LETTERS.map(function (L) {
      return '<button type="button" class="wt-chip" data-letter="' + L + '" aria-label="Letter ' + L + '">' + L + '</button>';
    }).join("");

    app.innerHTML =
      topBar() +
      '<div class="wt-progress" id="wt-progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<div class="wt-bar"><span id="wt-bar"></span></div>' +
      '<span class="wt-progress-label" id="wt-label"></span>' +
      '</div>' +
      '<div class="wt-stage">' +
      '<div class="wt-picture" id="wt-picture"><img src="' + esc(PICTURE) + '" alt="Eight people, labelled A to H" onerror="this.parentNode.classList.add(\'is-noimg\')"></div>' +
      '<div class="wt-side">' +
      '<div class="wt-audio">' +
      '<button type="button" class="wt-play" id="wt-replay"></button>' +
      '<span class="wt-status" id="wt-status" role="status" aria-live="polite"></span>' +
      '</div>' +
      '<div class="wt-letters" id="wt-letters" role="group" aria-label="Letters">' + chips + '</div>' +
      '<p class="wt-hint" aria-hidden="true">Keyboard: A–H to choose · Space to play again</p>' +
      '<div class="wt-feedback" id="wt-feedback" role="status" aria-live="polite"></div>' +
      '</div>' +
      '</div>';

    els = {
      pill: document.getElementById("wt-pill"),
      progress: document.getElementById("wt-progress"),
      bar: document.getElementById("wt-bar"),
      label: document.getElementById("wt-label"),
      replay: document.getElementById("wt-replay"),
      status: document.getElementById("wt-status"),
      feedback: document.getElementById("wt-feedback"),
      chips: {}
    };
    app.querySelectorAll(".wt-chip").forEach(function (el) {
      els.chips[el.getAttribute("data-letter")] = el;
    });
  }

  function setClass(el, name, on) {
    if (on) el.classList.add(name); else el.classList.remove(name);
  }

  // updates only what changed: progress, pill, letters, play button and feedback line
  function refreshPlay() {
    if (!els || phase !== "play") return;

    els.pill.textContent = "Question " + (q + 1) + " of " + AUDIO.length;
    els.bar.style.width = pct() + "%";
    els.progress.setAttribute("aria-valuenow", String(pct()));
    els.label.textContent = q + "/" + AUDIO.length;

    LETTERS.forEach(function (L) {
      var el = els.chips[L];
      var isUsed = !!used[L];
      var isWrong = !!wrongNow[L];
      setClass(el, "is-ok", isUsed);
      setClass(el, "is-bad", isWrong && !isUsed);
      setClass(el, "is-fresh", lastCorrect === L);
      el.disabled = isUsed || isWrong || busy;
    });

    // "▶ Play clip" when the browser needs a tap (or nothing has played yet), otherwise "Play again"
    els.replay.textContent = (blocked || playedFor !== q) ? "▶ Play clip" : "🔁 Play again";
    els.replay.disabled = busy;
    setClass(els.replay, "is-attention", (blocked || playedFor !== q) && !busy);

    els.feedback.textContent = fb.text;
    els.feedback.className = "wt-feedback" + (fb.type === "ok" ? " is-ok" : fb.type === "bad" ? " is-bad" : "");
  }

  function renderDone(score, total, stars, p, timeMs) {
    app.innerHTML =
      topBar() +
      '<section class="wt-card"><div class="wt-emoji" aria-hidden="true">🏆</div>' +
      '<h1>' + score + ' of ' + total + ' correct</h1>' +
      '<p>Keep listening for the clothes to find the right person.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
      '<button type="button" class="wt-btn" id="wt-again">Play again</button>' +
      '<a class="wt-btn wt-btn-quiet" href="' + BACK + '">Back to Unit 3</a>' +
      '</div></section>';
    document.getElementById("wt-again").onclick = startGame;
    els = null;
  }

  /* ---------- logic ---------- */
  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    if (window.LAStars && !playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    startedAt = Date.now();
    phase = "play";
    q = 0;
    firstTry = [];
    used = {};
    wrongNow = {};
    lastCorrect = null;
    fb = { type: "", text: "" };
    busy = false;
    playedFor = -1;
    blocked = false;
    buildPlay();
    refreshPlay();
    playClip();   // the Start tap is the user gesture that lets audio play
  }

  function onPick(letter) {
    if (phase !== "play" || busy || used[letter] || wrongNow[letter]) return;
    var ok = letter === ANSWERS[q];

    if (ok) {
      // first pick on this clip decides whether it scores
      if (firstTry[q] === undefined) firstTry[q] = Object.keys(wrongNow).length === 0;
      used[letter] = true;
      lastCorrect = letter;
      busy = true;
      sfx("correct");
      fb = { type: "ok", text: pick(ENC_OK) };
      audio.pause();
      setStatus("Next clip…", false);
      refreshPlay();
      nextTimer = setTimeout(nextQuestion, 800);
      return;
    }

    // wrong: mark it for this clip only, do not reveal the answer, let the player choose again
    if (firstTry[q] === undefined) firstTry[q] = false;
    wrongNow[letter] = true;
    sfx("wrong");
    fb = { type: "bad", text: pick(ENC_BAD) };
    setStatus("Try another letter", false);
    refreshPlay();
  }

  function nextQuestion() {
    nextTimer = null;
    busy = false;
    q += 1;
    wrongNow = {};
    lastCorrect = null;
    fb = { type: "", text: "" };
    if (q >= AUDIO.length) return finishGame();
    refreshPlay();
    playClip();           // the next clip plays automatically (or the player taps play)
  }

  function starsFor(p) {
    if (p >= 90) return 3;
    if (p >= 70) return 2;
    if (p >= 40) return 1;
    return 0;
  }

  function finishGame() {
    phase = "done";
    audio.pause();
    var total = AUDIO.length;
    var score = correctCount();
    var p = Math.round((score / total) * 100);
    var stars = starsFor(p);
    var timeMs = Date.now() - startedAt;
    if (window.LAStars) LAStars.save(GAME_ID, stars);
    sfx("win");

    if (window.LAFinish) {
      timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : timeMs;
      LAFinish.show({
        gameId: GAME_ID,
        gameName: GAME_NAME,
        score: score,
        total: total,
        stars: stars,
        accuracy: p,
        timeMs: timeMs,
        title: stars === 3 ? "Perfect!" : stars === 2 ? "Well done!" : stars === 1 ? "Good effort!" : "Keep listening!",
        onAgain: function () { startGame(); },
        onModes: function () { phase = "start"; renderStart(); },
        backHref: BACK,
        save: false
      });
      return;
    }
    renderDone(score, total, stars, p, timeMs);
  }

  /* ---------- input ---------- */
  // one delegated listener on the persistent container, so rebuilding the play screen never loses it
  app.addEventListener("click", function (e) {
    if (phase !== "play") return;
    var chip = e.target.closest && e.target.closest(".wt-chip");
    if (chip && !chip.disabled) return onPick(chip.getAttribute("data-letter"));
    var rep = e.target.closest && e.target.closest("#wt-replay");
    if (rep && !busy) playClip();
  });

  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = (e.key || "").toUpperCase();
    if (k.length === 1 && k >= "A" && k <= "H") { e.preventDefault(); onPick(k); return; }
    if (e.key === " " || k === "R") { if (!busy) { e.preventDefault(); playClip(); } }
  });

  function render() {
    if (phase === "start") return renderStart();
  }

  render();
})();
