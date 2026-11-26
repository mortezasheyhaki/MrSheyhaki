/* Listening for Details · Tactics For Listening · Basic Unit 3
 * Book task: "Listen again. What does each person need? Circle the correct answer."
 *  - six short clips, one at a time
 *  - each clip has a sentence with a blank and three choices (a, b, c)
 *  - a correct choice fills the blank and the next clip plays
 *  - a wrong choice is marked for this clip only, the answer is NOT revealed, and the player chooses again
 *  - a clip scores only if it was right on the first try
 *  - keyboard (desktop): A/B/C or 1/2/3 choose, Space or R plays the clip again
 * Visual style matches Unit 5 "What they did" (shared listen.css + circular play button).
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-listening-for-details";
  var GAME_NAME = "Listening for Details";
  var UNIT = "Unit 3 · Basic";
  var BACK = "../../";      // back to Unit 3
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // one entry per clip, in book order.
  // before/after: the sentence around the blank; opts: the three choices (a, b, c); ans: index of the correct choice
  var ITEMS = [
    { before: "He needs a", after: "pair.", opts: ["longer", "shorter", "cheaper"], ans: 0, src: CDN + "j79363_.mp3" },
    { before: "She needs a", after: "one.", opts: ["prettier", "bigger", "smaller"], ans: 2, src: CDN + "v198162_.mp3" },
    { before: "She needs a", after: "pair.", opts: ["tighter", "bigger", "smaller"], ans: 1, src: CDN + "h259984_.mp3" },
    { before: "He needs a", after: "pair.", opts: ["bigger", "cheaper", "smaller"], ans: 2, src: CDN + "u38667_.mp3" },
    { before: "He needs a", after: "one.", opts: ["tighter", "looser", "smaller"], ans: 1, src: CDN + "j251108_.mp3" },
    { before: "She needs a", after: "size.", opts: ["smaller", "bigger", "more comfortable"], ans: 0, src: CDN + "z326097_.mp3" }
  ];
  var LETTERS = ["a", "b", "c"];
  var TOTAL = ITEMS.length;

  var ENC_OK = ["Correct! Great listening.", "Yes, that's it!", "Nice work!", "You heard it!", "Excellent!"];
  var ENC_BAD = ["Not quite — listen again and choose another.", "Close! Listen for the key word.", "No worries, keep listening and choose again."];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";   // start | play | done
  var q = 0;             // current clip
  var firstTry = [];     // true/false per clip: was it right on the first choice?
  var solved = false;    // the current clip has its correct answer
  var lastCorrect = -1;  // option index just answered correctly (plays its pop once)
  var wrongNow = {};     // wrong option indexes for the current clip only
  var fb = { type: "", text: "" };
  var busy = false;      // true while the next clip is about to start
  var nextTimer = null;
  var playedFor = -1;    // clip index whose audio has been started
  var blocked = false;   // browser blocked autoplay: prompt the player to tap play
  var playing = false;
  var audioError = false;
  var audio = new Audio();
  audio.preload = "auto";
  var playRecorded = false;
  var startedAt = 0;

  var PLAY_ICON = '<span class="lfd-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="lfd-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="lfd-play-alert" aria-hidden="true">!</span>';

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

  /* ---------- audio ---------- */
  function stopAudio() {
    playing = false;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  }

  function playClip() {
    if (phase !== "play" || busy) return;
    stopAudio();
    audioError = false;
    blocked = false;
    audio.src = ITEMS[q].src;
    audio.currentTime = 0;
    playedFor = q;
    playing = true;
    renderPlay();
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () {
        if (phase !== "play") return;
        playing = false;
        blocked = true;
        audioError = true;
        renderPlay();
      });
    }
  }

  audio.addEventListener("playing", function () {
    if (phase === "play") {
      playing = true;
      blocked = false;
      audioError = false;
      renderPlay();
    }
  });
  audio.addEventListener("ended", function () {
    if (phase !== "play" || busy) return;
    playing = false;
    renderPlay();
  });
  audio.addEventListener("error", function () {
    if (phase !== "play" || busy) return;
    playing = false;
    blocked = true;
    audioError = true;
    renderPlay();
  });

  /* ---------- views ---------- */
  function topBar(counter) {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span>" +
      "<strong>" + esc(GAME_NAME) + "</strong></div>" +
      '<span class="lc-counter">' + esc(counter || "") + "</span>" +
      "</header>"
    );
  }

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Question ' + (q + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = "";
        if (i < q) {
          cls = firstTry[i] ? "is-right" : "is-wrong";
        } else if (i === q) {
          cls = "is-current";
          if (solved) cls = firstTry[i] !== false ? "is-right" : "is-wrong";
        }
        return '<i class="' + cls + '"></i>';
      }).join("") + "</div>"
    );
  }

  function playIcon() {
    if (audioError) return ALERT_ICON;
    if (playing) return BARS_ICON;
    return PLAY_ICON;
  }

  function playLabel() {
    if (audioError || blocked) return "Tap to play";
    if (playing) return "Playing…";
    if (playedFor === q) return "Play again";
    return "Play the recording";
  }

  function playSub() {
    return "Person " + (q + 1) + " of " + TOTAL;
  }

  function sentenceHtml() {
    var item = ITEMS[q];
    var blank = solved
      ? '<span class="lfd-blank is-filled">' + esc(item.opts[item.ans]) + "</span>"
      : '<span class="lfd-blank" aria-label="blank"></span>';
    return esc(item.before) + " " + blank + " " + esc(item.after);
  }

  function optHtml(i) {
    var item = ITEMS[q];
    var cls = "lfd-opt";
    var isRight = solved && i === item.ans;
    var isWrong = !!wrongNow[i] && !solved;
    if (isRight) cls += " is-ok" + (lastCorrect === i ? " is-fresh" : "");
    if (isWrong) cls += " is-bad";
    if (solved && !isRight) cls += " is-idle";
    var disabled = solved || !!wrongNow[i] || busy;
    return (
      '<button type="button" class="' + cls + '" data-i="' + i + '"' + (disabled ? " disabled" : "") +
      ' aria-label="Choice ' + LETTERS[i] + '">' +
      '<span class="lfd-letter" aria-hidden="true">' + LETTERS[i] + "</span>" +
      '<span class="lfd-word">' + esc(item.opts[i]) + "</span></button>"
    );
  }

  function footHtml() {
    if (fb.text) {
      return (
        '<div class="lfd-foot">' +
        '<span class="lfd-foot-text ' + (fb.type === "ok" ? "is-ok" : fb.type === "bad" ? "is-bad" : "") + '">' +
        esc(fb.text) + "</span></div>"
      );
    }
    var hint = (playedFor === q && !blocked && !audioError)
      ? "Choose a, b or c."
      : "Tap play to listen first.";
    return '<div class="lfd-foot"><span class="lfd-foot-text">' + esc(hint) + "</span></div>";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🎧</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Each clip describes what a person needs. Listen, then choose the word that completes the sentence.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="lfd-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Choose <strong>a</strong>, <strong>b</strong> or <strong>c</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> questions in total</span></li>' +
      "</ol></section>";
    document.getElementById("lfd-start").onclick = startGame;
  }

  function renderPlay() {
    if (phase !== "play") return;
    var counter = (q + 1) + " / " + TOTAL;
    var playCls = "lfd-play";
    if (playing) playCls += " is-playing";
    if (audioError) playCls += " is-error";

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="lc-main lfd-main">' +
      '<div class="lfd-left">' +
      '<div class="lfd-listen">' +
      '<button type="button" class="' + playCls + '" id="lfd-replay" aria-label="' + esc(playLabel()) + '">' +
      playIcon() + "</button>" +
      '<div class="lfd-listen-text">' +
      '<p class="lfd-listen-title">' + esc(playLabel()) + "</p>" +
      '<p class="lfd-listen-sub">' + esc(playSub()) + "</p>" +
      "</div></div>" +
      '<p class="lfd-question" id="lfd-sentence" aria-live="polite">' + sentenceHtml() + "</p>" +
      "</div>" +
      '<div class="lfd-right">' +
      '<div class="lfd-opts" role="group" aria-label="Choices">' +
      LETTERS.map(function (_, i) { return optHtml(i); }).join("") +
      "</div>" +
      footHtml() +
      "</div></div>";

    // bind
    var replay = document.getElementById("lfd-replay");
    if (replay) {
      replay.onclick = function () {
        if (!busy) {
          sfx("click");
          playClip();
        }
      };
    }
    app.querySelectorAll(".lfd-opt").forEach(function (el) {
      el.onclick = function () {
        if (el.disabled) return;
        onPick(parseInt(el.getAttribute("data-i"), 10));
      };
    });
  }

  function renderDone(score, total) {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score + " of " + total + " correct</h1>" +
      '<p class="lc-intro-lede">Listen for the key word in each clip. It is the one that completes the sentence.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="lfd-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 3</a>' +
      "</div></div></section>";
    document.getElementById("lfd-again").onclick = startGame;
  }

  /* ---------- logic ---------- */
  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    if (window.LAStars && !playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    startedAt = Date.now();
    phase = "play";
    q = 0;
    firstTry = [];
    solved = false;
    lastCorrect = -1;
    wrongNow = {};
    fb = { type: "", text: "" };
    busy = false;
    playedFor = -1;
    blocked = false;
    playing = false;
    audioError = false;
    stopAudio();
    renderPlay();
    // Start tap is the user gesture that lets audio play
    setTimeout(playClip, 80);
  }

  function onPick(i) {
    if (phase !== "play" || busy || solved || wrongNow[i]) return;
    var ok = i === ITEMS[q].ans;

    if (ok) {
      // the first choice on this clip decides whether it scores
      if (firstTry[q] === undefined) firstTry[q] = Object.keys(wrongNow).length === 0;
      solved = true;
      lastCorrect = i;
      busy = true;
      sfx("correct");
      fb = { type: "ok", text: pick(ENC_OK) };
      stopAudio();
      renderPlay();
      nextTimer = setTimeout(nextQuestion, 900);
      return;
    }

    // wrong: mark it for this clip only, do not reveal the answer, let the player choose again
    if (firstTry[q] === undefined) firstTry[q] = false;
    wrongNow[i] = true;
    sfx("wrong");
    fb = { type: "bad", text: pick(ENC_BAD) };
    renderPlay();
  }

  function nextQuestion() {
    nextTimer = null;
    busy = false;
    q += 1;
    solved = false;
    lastCorrect = -1;
    wrongNow = {};
    fb = { type: "", text: "" };
    if (q >= TOTAL) return finishGame();
    renderPlay();
    playClip();
  }

  function starsFor(p) {
    if (p >= 90) return 3;
    if (p >= 70) return 2;
    if (p >= 40) return 1;
    return 0;
  }

  function finishGame() {
    phase = "done";
    stopAudio();
    var score = correctCount();
    var p = Math.round((score / TOTAL) * 100);
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
        total: TOTAL,
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
    renderDone(score, TOTAL);
  }

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || busy) return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      e.preventDefault();
      playClip();
      return;
    }
    var map = { a: 0, b: 1, c: 2, "1": 0, "2": 1, "3": 2 };
    if (map[k] !== undefined) {
      e.preventDefault();
      onPick(map[k]);
    }
  });

  // start
  renderStart();
})();
