/* What Are They Wearing? · Tactics For Listening · Basic Unit 3
 * Sandra describes eight people in the lineup. For each clip the player listens
 * and taps the letter of the person being described.
 *  - one clip at a time, played automatically
 *  - a correct letter locks (each letter is the answer to exactly one clip) and the next clip plays
 *  - a wrong letter is marked for this clip only, the correct answer is NOT revealed,
 *    and the player keeps choosing until they find it; the letter is available again next clip
 *  - a clip scores only if it was right on the first try
 *  - no names are shown
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
  var used = {};         // letters already answered correctly (locked for the rest of the game)
  var wrongNow = {};     // wrong letters tried on the current clip only
  var lastFeedback = { type: "", text: "" };
  var busy = false;      // true while the next clip is about to start
  var nextTimer = null;
  var audio = new Audio();
  audio.preload = "auto";
  var playRecorded = false;
  var startedAt = 0;

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

  /* ---------- audio ---------- */
  var statusEl = null;
  function setStatus(text, playing) {
    if (!statusEl) return;
    statusEl.className = "wt-status" + (playing ? " is-playing" : "");
    statusEl.innerHTML = playing
      ? '<span class="wt-wave" aria-hidden="true"><i></i><i></i><i></i></span>' + esc(text)
      : esc(text);
  }
  function playClip() {
    if (phase !== "play") return;
    audio.pause();
    audio.src = AUDIO[q];
    audio.currentTime = 0;
    setStatus("Listening…", true);
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { setStatus("Tap ▶ to play the clip", false); });
    }
  }
  audio.addEventListener("ended", function () { setStatus("Choose the letter", false); });
  audio.addEventListener("error", function () { setStatus("Clip could not load — tap ▶ to try again", false); });

  /* ---------- screens ---------- */
  function topBar() {
    return (
      '<header class="wt-top">' +
      '<a class="wt-back" href="' + BACK + '" aria-label="Back to Unit 3">←</a>' +
      '<div class="wt-title"><span>Unit 3 · Basic</span><strong>' + GAME_NAME + '</strong></div>' +
      '<span class="wt-pill">' + (phase === "play" ? "Question " + (q + 1) + " of " + AUDIO.length : "Start") + '</span>' +
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
  }

  function chipClass(letter) {
    if (used[letter]) return "is-used is-ok";   // answered correctly earlier: locked
    if (wrongNow[letter]) return "is-bad";      // wrong for this clip only
    return "";
  }

  function renderPlay() {
    var chips = LETTERS.map(function (L) {
      var cls = chipClass(L);
      var dis = (used[L] || wrongNow[L]) ? "disabled" : "";
      return '<button type="button" class="wt-chip ' + cls + '" data-letter="' + L + '" ' + dis +
        ' aria-label="Letter ' + L + '">' + L + '</button>';
    }).join("");

    var fbCls = lastFeedback.type === "ok" ? " is-ok" : lastFeedback.type === "bad" ? " is-bad" : "";
    app.innerHTML =
      topBar() +
      '<div class="wt-progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct() + '">' +
      '<div class="wt-bar"><span style="width:' + pct() + '%"></span></div>' +
      '<span class="wt-progress-label">' + q + '/' + AUDIO.length + '</span>' +
      '</div>' +
      '<div class="wt-picture" id="wt-picture"><img src="' + esc(PICTURE) + '" alt="Eight people, labelled A to H" onerror="this.parentNode.classList.add(\'is-noimg\')"></div>' +
      '<div class="wt-audio">' +
      '<button type="button" class="wt-play" id="wt-replay" ' + (busy ? "disabled" : "") + '>🔁 Play again</button>' +
      '<span class="wt-status" id="wt-status"></span>' +
      '</div>' +
      '<div class="wt-letters" role="group" aria-label="Letters">' + chips + '</div>' +
      '<div class="wt-feedback' + fbCls + '" role="status" aria-live="polite">' + esc(lastFeedback.text) + '</div>';

    statusEl = document.getElementById("wt-status");
    document.getElementById("wt-replay").onclick = function () { if (!busy) playClip(); };
    app.querySelectorAll(".wt-chip").forEach(function (el) {
      el.addEventListener("click", function () { onPick(el.getAttribute("data-letter")); });
    });
    // restore the status line for the current state
    if (!audio.paused) setStatus("Listening…", true);
    else if (lastFeedback.type === "") setStatus("Listen to the clip", false);
    else if (lastFeedback.type === "bad") setStatus("Try another letter", false);
    else setStatus("Next clip…", false);
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
    lastFeedback = { type: "", text: "" };
    busy = false;
    render();
    playClip();   // the Start tap is the user gesture that lets audio play
  }

  function onPick(letter) {
    if (phase !== "play" || busy || used[letter] || wrongNow[letter]) return;
    var ok = letter === ANSWERS[q];

    if (ok) {
      // first pick on this clip decides whether it scores
      if (firstTry[q] === undefined) firstTry[q] = Object.keys(wrongNow).length === 0;
      used[letter] = "is-ok";
      busy = true;
      sfx("correct");
      lastFeedback = { type: "ok", text: pick(ENC_OK) };
      audio.pause();
      render();
      nextTimer = setTimeout(nextQuestion, 800);
      return;
    }

    // wrong: mark it for this clip only, do not reveal the answer, let the player choose again
    if (firstTry[q] === undefined) firstTry[q] = false;
    wrongNow[letter] = true;
    sfx("wrong");
    lastFeedback = { type: "bad", text: pick(ENC_BAD) };
    render();
  }

  function nextQuestion() {
    nextTimer = null;
    busy = false;
    q += 1;
    wrongNow = {};
    lastFeedback = { type: "", text: "" };
    if (q >= AUDIO.length) return finishGame();
    render();
    playClip();           // the next clip plays automatically
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
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false
      });
      return;
    }
    app.innerHTML =
      topBar() +
      '<section class="wt-card"><div class="wt-emoji" aria-hidden="true">🏆</div>' +
      '<h1>' + score + ' of ' + total + ' correct</h1>' +
      '<p>Keep listening for the clothes to find the right person.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
      '<button type="button" class="wt-btn" id="wt-again">Play again</button>' +
      '<a class="wt-btn" href="' + BACK + '" style="background:var(--wt-card);color:var(--wt-ink);box-shadow:0 6px 0 var(--wt-line)">Back to Unit 3</a>' +
      '</div></section>';
    document.getElementById("wt-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "play") return renderPlay();
  }

  render();
})();
