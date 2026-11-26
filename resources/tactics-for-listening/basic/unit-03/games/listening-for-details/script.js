/* Listening for Details · Tactics For Listening · Basic Unit 3
 * Book task: "Listen again. What does each person need? Circle the correct answer."
 *  - six short clips, one at a time, played automatically (on phones, tap ▶ if the browser blocks autoplay)
 *  - each clip has a sentence with a blank and three choices (a, b, c)
 *  - a correct choice fills the blank and the next clip plays
 *  - a wrong choice is marked for this clip only, the answer is NOT revealed, and the player chooses again
 *  - a clip scores only if it was right on the first try
 *  - keyboard (desktop): A/B/C or 1/2/3 choose, Space or R plays the clip again
 * The screen is built once per game and only its parts are updated, so nothing redraws
 * or jumps when a choice is tapped.
 * Uses LAStars, LAFinish and LASfx when present.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-listening-for-details";
  var GAME_NAME = "Listening for Details";
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
  function pct() { return Math.round((q / ITEMS.length) * 100); }
  function setClass(el, name, on) {
    if (on) el.classList.add(name); else el.classList.remove(name);
  }

  /* ---------- audio status ---------- */
  function setStatus(text, playing) {
    if (!els) return;
    els.status.className = "lfd-status" + (playing ? " is-playing" : "");
    els.status.innerHTML = playing
      ? '<span class="lfd-wave" aria-hidden="true"><i></i><i></i><i></i></span>' + esc(text)
      : esc(text);
  }

  function playClip() {
    if (phase !== "play") return;
    audio.pause();
    audio.src = ITEMS[q].src;
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
    setStatus("Choose an answer", false);
  });
  audio.addEventListener("error", function () {
    if (phase !== "play" || busy) return;
    blocked = true;
    setStatus("This clip could not load. Tap ▶ to try again.", false);
    refreshPlay();
  });

  /* ---------- screens ---------- */
  function topBar() {
    return (
      '<header class="lfd-top">' +
      '<a class="lfd-back" href="' + BACK + '" aria-label="Back to Unit 3">←</a>' +
      '<div class="lfd-title"><span>Unit 3 · Basic</span><strong>' + GAME_NAME + '</strong></div>' +
      '<span class="lfd-pill" id="lfd-pill"></span>' +
      '</header>'
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar() +
      '<section class="lfd-card">' +
      '<div class="lfd-emoji" aria-hidden="true">🎧</div>' +
      '<h1>Listening for Details</h1>' +
      '<p>Each clip describes what a person needs. Listen, then choose the word that completes the sentence.</p>' +
      '<p>If you choose the wrong answer, listen again and try another. The right word fills the blank.</p>' +
      '<button type="button" class="lfd-btn" id="lfd-start">Start ▶</button>' +
      '</section>';
    document.getElementById("lfd-start").onclick = startGame;
    els = null;
  }

  // built once per game; afterwards only the changing parts are updated
  function buildPlay() {
    var opts = LETTERS.map(function (L, i) {
      return '<button type="button" class="lfd-opt" data-i="' + i + '" aria-label="Choice ' + L + '">' +
        '<span class="lfd-letter">' + L + '</span><span class="lfd-word"></span></button>';
    }).join("");

    app.innerHTML =
      topBar() +
      '<div class="lfd-progress" id="lfd-progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<div class="lfd-bar"><span id="lfd-bar"></span></div>' +
      '<span class="lfd-progress-label" id="lfd-label"></span>' +
      '</div>' +
      '<div class="lfd-stage">' +
      '<section class="lfd-sentence-card" aria-live="polite">' +
      '<div class="lfd-num" id="lfd-num"></div>' +
      '<p class="lfd-sentence" id="lfd-sentence"></p>' +
      '</section>' +
      '<div class="lfd-side">' +
      '<div class="lfd-audio">' +
      '<button type="button" class="lfd-play" id="lfd-replay"></button>' +
      '<span class="lfd-status" id="lfd-status" role="status" aria-live="polite"></span>' +
      '</div>' +
      '<div class="lfd-opts" id="lfd-opts" role="group" aria-label="Choices">' + opts + '</div>' +
      '<p class="lfd-hint" aria-hidden="true">Keyboard: A, B, C or 1, 2, 3 to choose · Space to play again</p>' +
      '<div class="lfd-feedback" id="lfd-feedback" role="status" aria-live="polite"></div>' +
      '</div>' +
      '</div>';

    els = {
      pill: document.getElementById("lfd-pill"),
      progress: document.getElementById("lfd-progress"),
      bar: document.getElementById("lfd-bar"),
      label: document.getElementById("lfd-label"),
      num: document.getElementById("lfd-num"),
      sentence: document.getElementById("lfd-sentence"),
      replay: document.getElementById("lfd-replay"),
      status: document.getElementById("lfd-status"),
      feedback: document.getElementById("lfd-feedback"),
      sentenceKey: null,
      opts: []
    };
    app.querySelectorAll(".lfd-opt").forEach(function (el) { els.opts.push(el); });
  }

  // the number and the three choices for the current clip; text only, no nodes are rebuilt
  function fillQuestion() {
    var item = ITEMS[q];
    els.num.textContent = String(q + 1);
    els.sentenceKey = null;
    els.opts.forEach(function (el, i) {
      el.querySelector(".lfd-word").textContent = item.opts[i];
      setClass(el, "is-ok", false);
      setClass(el, "is-bad", false);
      setClass(el, "is-fresh", false);
      setClass(el, "is-idle", false);
    });
  }

  function sentenceHtml() {
    var item = ITEMS[q];
    var blank = solved
      ? '<span class="lfd-blank is-filled">' + esc(item.opts[item.ans]) + '</span>'
      : '<span class="lfd-blank" aria-label="blank"></span>';
    return esc(item.before) + ' ' + blank + ' ' + esc(item.after);
  }

  // updates only what changed: progress, pill, sentence, choices, play button and feedback line
  function refreshPlay() {
    if (!els || phase !== "play") return;

    els.pill.textContent = "Question " + (q + 1) + " of " + ITEMS.length;
    els.bar.style.width = pct() + "%";
    els.progress.setAttribute("aria-valuenow", String(pct()));
    els.label.textContent = q + "/" + ITEMS.length;

    // rebuild the sentence only when the clip or its answered state changes (keeps the blank's animation to once)
    var key = q + ":" + solved;
    if (els.sentenceKey !== key) { els.sentence.innerHTML = sentenceHtml(); els.sentenceKey = key; }

    els.opts.forEach(function (el, i) {
      var isRight = solved && i === ITEMS[q].ans;
      var isWrong = !!wrongNow[i] && !solved;
      setClass(el, "is-ok", isRight);
      setClass(el, "is-fresh", isRight && lastCorrect === i);
      setClass(el, "is-bad", isWrong);
      setClass(el, "is-idle", solved && !isRight);
      el.disabled = solved || !!wrongNow[i] || busy;
    });

    // "▶ Play clip" when the browser needs a tap (or nothing has played yet), otherwise "Play again"
    els.replay.textContent = (blocked || playedFor !== q) ? "▶ Play clip" : "🔁 Play again";
    els.replay.disabled = busy;
    setClass(els.replay, "is-attention", (blocked || playedFor !== q) && !busy);

    els.feedback.textContent = fb.text;
    els.feedback.className = "lfd-feedback" + (fb.type === "ok" ? " is-ok" : fb.type === "bad" ? " is-bad" : "");
  }

  function renderDone(score, total) {
    app.innerHTML =
      topBar() +
      '<section class="lfd-card"><div class="lfd-emoji" aria-hidden="true">🏆</div>' +
      '<h1>' + score + ' of ' + total + ' correct</h1>' +
      '<p>Listen for the key word in each clip. It is the one that completes the sentence.</p>' +
      '<div class="lfd-actions">' +
      '<button type="button" class="lfd-btn" id="lfd-again">Play again</button>' +
      '<a class="lfd-btn lfd-btn-quiet" href="' + BACK + '">Back to Unit 3</a>' +
      '</div></section>';
    document.getElementById("lfd-again").onclick = startGame;
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
    solved = false;
    lastCorrect = -1;
    wrongNow = {};
    fb = { type: "", text: "" };
    busy = false;
    playedFor = -1;
    blocked = false;
    buildPlay();
    fillQuestion();
    refreshPlay();
    playClip();   // the Start tap is the user gesture that lets audio play
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
      audio.pause();
      setStatus("Next question…", false);
      refreshPlay();
      nextTimer = setTimeout(nextQuestion, 900);
      return;
    }

    // wrong: mark it for this clip only, do not reveal the answer, let the player choose again
    if (firstTry[q] === undefined) firstTry[q] = false;
    wrongNow[i] = true;
    sfx("wrong");
    fb = { type: "bad", text: pick(ENC_BAD) };
    setStatus("Try another answer", false);
    refreshPlay();
  }

  function nextQuestion() {
    nextTimer = null;
    busy = false;
    q += 1;
    solved = false;
    lastCorrect = -1;
    wrongNow = {};
    fb = { type: "", text: "" };
    if (q >= ITEMS.length) return finishGame();
    fillQuestion();
    refreshPlay();
    playClip();   // the next clip plays automatically (or the player taps play)
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
    var total = ITEMS.length;
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
    renderDone(score, total);
  }

  /* ---------- input ---------- */
  // one delegated listener on the persistent container, so rebuilding the play screen never loses it
  app.addEventListener("click", function (e) {
    if (phase !== "play") return;
    var opt = e.target.closest && e.target.closest(".lfd-opt");
    if (opt && !opt.disabled) return onPick(parseInt(opt.getAttribute("data-i"), 10));
    var rep = e.target.closest && e.target.closest("#lfd-replay");
    if (rep && !busy) playClip();
  });

  document.addEventListener("keydown", function (e) {
    if (phase !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = (e.key || "").toLowerCase();
    var map = { a: 0, b: 1, c: 2, "1": 0, "2": 1, "3": 2 };
    if (Object.prototype.hasOwnProperty.call(map, k)) { e.preventDefault(); onPick(map[k]); return; }
    if (e.key === " " || k === "r") { if (!busy) { e.preventDefault(); playClip(); } }
  });

  function render() {
    if (phase === "start") return renderStart();
  }

  render();
})();
