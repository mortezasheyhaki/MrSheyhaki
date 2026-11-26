/* Dictation · Party clothes · Tactics For Listening Basic Unit 3
 * Listen to the conversation. Type the missing words into the blanks.
 * Accepts flexible spelling for "any ties" (anyties / any ties).
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u3-dictation-party-clothes";
  var GAME_NAME = "Dictation";
  var UNIT = "Unit 3 · Basic";
  var BACK = "../../";
  var AUDIO_SRC = "https://cdn.imgurl.ir/uploads/g7245_.mp3";

  // Each gap: accepted answers (lowercase, normalized)
  // Gaps 5+6 are consecutive: "any" + "ties" OR combined handling
  var GAPS = [
    { id: 1, answers: ["jeans"] },
    { id: 2, answers: ["going"] },
    { id: 3, answers: ["wear"] },
    { id: 4, answers: ["pants", "trousers"] },
    { id: 5, answers: ["tie"] },
    { id: 6, answers: ["any ties", "anyties", "any tie", "ties"] }
  ];

  // Conversation lines with gap markers {{0}} .. {{5}}
  var LINES = [
    { who: "A", html: "What are you going to wear to the party?" },
    { who: "B", html: "I'm not sure. I might wear {{0}}." },
    { who: "A", html: "Really? Ann and Liz are wearing dresses." },
    { who: "B", html: "Oh. Well, maybe I'll wear a black skirt. So, what are you {{1}} to {{2}}?" },
    { who: "A", html: "Oh, probably nice {{3}} and a {{4}}." },
    { who: "B", html: "But you don't have {{5}}, do you?" },
    { who: "A", html: "Oh, that's right. Maybe I can borrow one." }
  ];

  var TOTAL = GAPS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | checked | done
  var values = GAPS.map(function () { return ""; });
  var results = GAPS.map(function () { return null; }); // true/false/null
  var checked = false;
  var score = 0;
  var playing = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="dic-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="dic-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="dic-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9'\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(i, val) {
    var n = normalize(val);
    if (!n) return false;
    var list = GAPS[i].answers;
    for (var j = 0; j < list.length; j++) {
      if (n === normalize(list[j])) return true;
    }
    // special: gap 5+6 together — if user put "any ties" in gap 5 and empty/ties in 6
    return false;
  }

  function stopAudio() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  function play() {
    if (!HAS_AUDIO) return;
    sfx("click");
    stopAudio();
    audioError = false;
    audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    playing = true;
    renderPlay();
    audio.onended = function () { playing = false; renderPlay(); };
    audio.onerror = function () { playing = false; audioError = true; renderPlay(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; renderPlay(); });
    }
  }

  function calcStars() {
    if (score >= TOTAL) return 3;
    if (score >= 4) return 2;
    if (score >= 3) return 1;
    return 0;
  }

  function saveProgress(stars) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-3",
          score: score,
          maxScore: TOTAL,
          accuracy: Math.round((score / TOTAL) * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    values = GAPS.map(function () { return ""; });
    results = GAPS.map(function () { return null; });
    checked = false;
    score = 0;
    playing = false;
    audioError = false;
    playRecorded = false;
    stopAudio();
    phase = "play";
    render();
  }

  function readInputs() {
    for (var i = 0; i < TOTAL; i++) {
      var el = document.getElementById("gap-" + i);
      if (el) values[i] = el.value;
    }
  }

  function checkAnswers() {
    readInputs();
    checked = true;
    score = 0;
    // handle gap 5 and 6 carefully: "any ties" may be typed across both or in one
    var v5 = normalize(values[4]);
    var v6 = normalize(values[5]);
    var combined = normalize((values[4] || "") + " " + (values[5] || ""));

    for (var i = 0; i < TOTAL; i++) {
      if (i === 4) {
        // gap 5: "tie" OR start of "any ties"
        if (isCorrect(4, values[4]) || combined === "any ties" || combined === "any tie") {
          // if combined is any ties, both get credit later
          results[4] = isCorrect(4, values[4]) || v5 === "any" || v5 === "any ties" || v5 === "anytie" || v5 === "anyties";
        } else {
          results[4] = false;
        }
      } else if (i === 5) {
        results[5] =
          isCorrect(5, values[5]) ||
          combined === "any ties" ||
          combined === "any tie" ||
          v6 === "ties" ||
          v5 === "any ties" ||
          v5 === "anyties";
      } else {
        results[i] = isCorrect(i, values[i]);
      }
      if (results[i]) score++;
    }

    // Fix double-count if user put full "any ties" only in one field
    if ((normalize(values[4]) === "any ties" || normalize(values[4]) === "anyties") && !normalize(values[5])) {
      results[4] = true;
      results[5] = true;
      score = 0;
      for (var k = 0; k < TOTAL; k++) if (results[k]) score++;
    }

    sfx(score === TOTAL ? "correct" : score > 0 ? "click" : "wrong");
    phase = "checked";
    renderPlay();
  }

  function finish() {
    stopAudio();
    var stars = calcStars();
    saveProgress(stars);
    phase = "done";
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score / TOTAL) * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK,
        save: false
      });
      return;
    }
    render();
  }

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

  function gapHtml(i) {
    var val = values[i] || "";
    var cls = "dic-gap";
    if (checked) {
      cls += results[i] ? " is-ok" : " is-bad";
    }
    var disabled = checked ? " disabled" : "";
    var showAnswer = checked && !results[i]
      ? '<span class="dic-answer">' + esc(GAPS[i].answers[0]) + "</span>"
      : "";
    return (
      '<span class="dic-gap-wrap">' +
      '<input type="text" class="' + cls + '" id="gap-' + i + '" data-i="' + i + '"' +
      ' value="' + esc(val) + '" autocomplete="off" spellcheck="false" autocapitalize="off"' +
      disabled + ' aria-label="Blank ' + (i + 1) + '">' +
      showAnswer +
      "</span>"
    );
  }

  function lineHtml(line) {
    var html = line.html;
    html = html.replace(/\{\{(\d+)\}\}/g, function (_, n) {
      return gapHtml(parseInt(n, 10));
    });
    return (
      '<div class="dic-line">' +
      '<span class="dic-who">' + esc(line.who) + "</span>" +
      '<p class="dic-text">' + html + "</p>" +
      "</div>"
    );
  }

  function playIcon() {
    if (audioError) return ALERT_ICON;
    if (playing) return BARS_ICON;
    return PLAY_ICON;
  }

  function playLabel() {
    if (audioError) return "Audio unavailable";
    if (playing) return "Playing…";
    return "Play the recording";
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">✍️</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen to the conversation about clothes for a party. Type the missing words in the blanks.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="dic-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the conversation</span></li>' +
      '<li><span class="tip-num">2</span><span>Type the <strong>missing words</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> blanks to complete</span></li>' +
      "</ol></section>";
    document.getElementById("dic-start").onclick = startGame;
  }

  function renderPlay() {
    var playCls = "dic-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    var counter = checked ? score + " / " + TOTAL : "";

    var foot;
    if (!checked) {
      foot =
        '<div class="dic-foot">' +
        '<span class="dic-foot-text">Listen and fill in all the blanks.</span>' +
        '<button type="button" class="dic-next" id="dic-check">Check ✓</button></div>';
    } else {
      foot =
        '<div class="dic-foot">' +
        '<span class="dic-foot-text ' + (score === TOTAL ? "is-ok" : "is-bad") + '">' +
        esc(score + " of " + TOTAL + " correct") + "</span>" +
        '<button type="button" class="dic-next" id="dic-finish">See results →</button></div>';
    }

    app.innerHTML =
      topBar(counter) +
      '<div class="dic-main">' +
        '<div class="dic-listen">' +
          '<button type="button" class="' + playCls + '" id="dic-replay" aria-label="' + esc(playLabel()) + '">' +
            playIcon() +
          "</button>" +
          '<div class="dic-listen-text">' +
            '<p class="dic-listen-title">' + esc(playLabel()) + "</p>" +
            '<p class="dic-listen-sub">Conversation · 6 missing words</p>' +
          "</div>" +
        "</div>" +
        '<div class="dic-script" id="dic-script">' +
          LINES.map(lineHtml).join("") +
        "</div>" +
        foot +
      "</div>";

    var replay = document.getElementById("dic-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) { stopAudio(); renderPlay(); }
        else play();
      };
    }

    if (!checked) {
      app.querySelectorAll(".dic-gap").forEach(function (inp) {
        inp.addEventListener("input", function () {
          values[parseInt(inp.getAttribute("data-i"), 10)] = inp.value;
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            var i = parseInt(inp.getAttribute("data-i"), 10);
            var next = document.getElementById("gap-" + (i + 1));
            if (next) next.focus();
            else checkAnswers();
          }
        });
      });
      var first = document.getElementById("gap-0");
      // don't auto-focus on mobile to avoid keyboard jump on load
    }

    var checkBtn = document.getElementById("dic-check");
    if (checkBtn) checkBtn.onclick = checkAnswers;
    var finishBtn = document.getElementById("dic-finish");
    if (finishBtn) finishBtn.onclick = finish;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">Answers: jeans · going · wear · pants · tie · any ties</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="dic-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 3</a>' +
      "</div></div></section>";
    document.getElementById("dic-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play" || phase === "checked") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play" && phase !== "checked") return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      // space only when not typing
      if (k === " " && e.target !== document.body && e.target !== app) return;
      e.preventDefault();
      if (playing) { stopAudio(); renderPlay(); }
      else play();
    }
  });

  render();
})();
