/* Listen & Select · Places of Work · AEF Starter Unit 6A
 * Two parts (Antonio, Charlotte). All five questions of a part are on one screen.
 * Choose an answer for each question, then press Check answers.
 */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-places-of-work-listen-select";
  var BACK = "../";

  var PARTS = [
    {
      name: "Antonio",
      role: "Works in a restaurant in Lima",
      image: "https://cdn.imgurl.ir/uploads/g405619_.png",
      audio: "https://cdn.imgurl.ir/uploads/t987213_.mp3",
      questions: [
        { q: "Where does Antonio work?", options: ["In a restaurant", "In a hotel"], answer: 0 },
        { q: "Where is the restaurant?", options: ["In London", "In Lima"], answer: 1 },
        { q: "Why does Antonio speak English every day?", options: ["Because many tourists come there.", "Because his family speaks English."], answer: 0 },
        { q: "What does Antonio help customers with?", options: ["Their homework", "The menu"], answer: 1 },
        { q: "What language do many tourists speak?", options: ["Spanish", "English"], answer: 1 }
      ]
    },
    {
      name: "Charlotte",
      role: "Works in an office in Buenos Aires",
      image: "https://cdn.imgurl.ir/uploads/b4214_.png",
      audio: "https://cdn.imgurl.ir/uploads/w00120_.mp3",
      questions: [
        { q: "Where does Charlotte work?", options: ["In an office", "In a restaurant"], answer: 0 },
        { q: "Where does she work?", options: ["In Lima", "In Buenos Aires"], answer: 1 },
        { q: "What kind of company does she work for?", options: ["A multinational company", "A small family company"], answer: 0 },
        { q: "What does Charlotte need to do in English?", options: ["Welcome visitors and answer the phone.", "Write emails and teach English."], answer: 0 },
        { q: "What language do they speak in meetings?", options: ["Spanish", "English"], answer: 1 }
      ]
    }
  ];

  var PER_PART = PARTS[0].questions.length;
  var $app = document.getElementById("app");
  var phase = "start";          // start | play | between | done
  var part = 0;
  var answers = [];             // chosen option index per question, null = not yet
  var checked = false;
  var score = 0, partStart = 0;
  var audio = null, playing = false, audioError = false;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  /* ---------- audio ---------- */
  function stopAudio() {
    playing = false;
    if (audio) { try { audio.pause(); } catch (e) {} audio.onended = audio.onerror = null; audio = null; }
  }
  function togglePlay() {
    if (playing) { stopAudio(); render(); return; }
    stopAudio();
    audioError = false;
    audio = new Audio(PARTS[part].audio);
    playing = true;
    audio.onended = function () { playing = false; render(); };
    audio.onerror = function () { playing = false; audioError = true; render(); };
    var p = audio.play();
    if (p && p.catch) p.catch(function () { playing = false; audioError = true; render(); });
    render();
  }

  /* ---------- flow ---------- */
  function startPart(p) {
    stopAudio();
    part = p;
    answers = PARTS[p].questions.map(function () { return null; });
    checked = false;
    partStart = score;
    phase = "play";
    render();
  }
  function start() {
    score = 0;
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    startPart(0);
  }
  function allAnswered() {
    return answers.every(function (a) { return a !== null; });
  }
  function checkAnswers() {
    if (checked || !allAnswered()) return;
    checked = true;
    var got = 0;
    PARTS[part].questions.forEach(function (item, i) { if (answers[i] === item.answer) got++; });
    score += got;
    if (got === PER_PART) sfx("win"); else sfx(got >= PER_PART / 2 ? "correct" : "wrong");
    render();
  }
  function nextStep() {
    stopAudio();
    if (part < PARTS.length - 1) { phase = "between"; render(); return; }
    finish();
  }
  function calcStars() {
    var pct = score / (PER_PART * PARTS.length) * 100;
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  }
  function saveStars(stars) {
    if (!window.LAStars) return;
    LAStars.recordPlay(GAME_ID);
    LAStars.save(GAME_ID, stars);
  }
  function finish() {
    stopAudio();
    phase = "done";
    var stars = calcStars();
    saveStars(stars);
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      $app.innerHTML = "";
      LAFinish.show({
        gameId: GAME_ID, gameName: "Listen & Select",
        score: score, total: PER_PART * PARTS.length, stars: stars,
        timeMs: timeMs, save: false,
        onAgain: start,
        onModes: function () { phase = "start"; render(); },
        backHref: BACK
      });
      return;
    }
    $app.innerHTML =
      '<section class="le-card le-center">' +
      '<div class="le-big" aria-hidden="true">🎉</div>' +
      '<h1>Well done!</h1>' +
      '<p>You got <strong>' + score + '</strong> of ' + (PER_PART * PARTS.length) + ' right.</p>' +
      '<button type="button" class="le-btn" data-act="start">Play again</button>' +
      '<a class="le-link" href="' + BACK + '">← Back to games</a>' +
      '</section>';
  }

  /* ---------- rendering ---------- */
  function renderStart() {
    var cards = PARTS.map(function (p, i) {
      return '<div class="le-person-mini">' +
        '<img src="' + p.image + '" alt="' + esc(p.name) + '" draggable="false">' +
        '<div><strong>Part ' + (i + 1) + ' · ' + esc(p.name) + '</strong><span>' + esc(p.role) + '</span></div>' +
        '</div>';
    }).join("");
    return '<header class="le-top"><a class="le-back" href="' + BACK + '" aria-label="Back to games">←</a>' +
      '<span class="le-title">Listen &amp; Select</span><span class="le-badge">Unit 6A</span></header>' +
      '<section class="le-card le-center">' +
      '<h1>Places of Work</h1>' +
      '<p class="le-desc">Listen to each person. Choose an answer for every question, then press <strong>Check answers</strong>.</p>' +
      '<div class="le-minis">' + cards + '</div>' +
      '<button type="button" class="le-btn" data-act="start">Start</button>' +
      '<a class="le-link" href="' + BACK + '">← Back to games</a>' +
      '</section>';
  }

  function renderBetween() {
    var got = score - partStart;
    return '<section class="le-card le-center">' +
      '<div class="le-big" aria-hidden="true">✨</div>' +
      '<h1>Part ' + (part + 1) + ' complete!</h1>' +
      '<p>You got <strong>' + got + '</strong> of ' + PER_PART + ' right.</p>' +
      '<p class="le-next">Up next: <strong>Part ' + (part + 2) + ' · ' + esc(PARTS[part + 1].name) + '</strong></p>' +
      '<button type="button" class="le-btn" data-act="part">Start Part ' + (part + 2) + ' →</button>' +
      '</section>';
  }

  function renderQuestion(item, i) {
    var chosen = answers[i];
    var letters = ["A", "B"];
    var opts = item.options.map(function (o, k) {
      var cls = "le-opt";
      if (!checked && chosen === k) cls += " is-selected";
      if (checked) {
        if (k === item.answer) cls += " is-correct";
        else if (chosen === k) cls += " is-wrong";
      }
      return '<button type="button" class="' + cls + '" data-act="opt" data-q="' + i + '" data-i="' + k + '"' +
        (checked ? " disabled" : "") + '>' +
        '<span class="le-letter">' + letters[k] + '</span>' +
        '<span class="le-otext">' + esc(o) + '</span></button>';
    }).join("");

    var mark = "";
    var ok = chosen === item.answer;
    if (checked) {
      mark = ok
        ? '<span class="le-mark ok">✓ Correct</span>'
        : '<span class="le-mark bad">✗ Answer: ' + esc(item.options[item.answer]) + '</span>';
    }
    return '<section class="le-card le-q' + (checked ? (ok ? " is-right" : " is-miss") : "") + '">' +
      '<div class="le-qhead"><span class="le-qnum">' + (i + 1) + '</span>' +
      '<h3 class="le-qtext">' + esc(item.q) + '</h3>' + mark + '</div>' +
      '<div class="le-opts">' + opts + '</div>' +
      '</section>';
  }

  function renderPlay() {
    var p = PARTS[part];
    var playLabel = playing ? "Stop" : "Play the recording";
    var playIcon = playing ? '<span class="le-bars" aria-hidden="true"><i></i><i></i><i></i></span>' : '<span class="le-tri" aria-hidden="true"></span>';
    var answered = answers.filter(function (a) { return a !== null; }).length;

    var list = p.questions.map(function (item, i) { return renderQuestion(item, i); }).join("");

    var action;
    if (!checked) {
      action = '<button type="button" class="le-btn" data-act="check"' + (allAnswered() ? "" : " disabled") + '>Check answers</button>' +
        '<span class="le-hint">' + answered + ' / ' + PER_PART + ' answered</span>';
    } else {
      var got = score - partStart;
      var last = part === PARTS.length - 1;
      action = '<span class="le-result">You got ' + got + ' of ' + PER_PART + '</span>' +
        '<button type="button" class="le-btn" data-act="next">' +
        (last ? "See results" : "Finish Part " + (part + 1) + " →") + '</button>';
    }

    return '<header class="le-top"><a class="le-back" href="' + BACK + '" aria-label="Back to games">←</a>' +
      '<span class="le-title">Part ' + (part + 1) + ' of ' + PARTS.length + '</span>' +
      '<span class="le-badge">' + answered + ' / ' + PER_PART + '</span></header>' +
      '<section class="le-card le-person">' +
      '<img class="le-photo" src="' + p.image + '" alt="' + esc(p.name) + '" draggable="false">' +
      '<div class="le-pinfo"><h2>' + esc(p.name) + '</h2><p>' + esc(p.role) + '</p>' +
      '<button type="button" class="le-play' + (playing ? " is-playing" : "") + (audioError ? " is-error" : "") + '" data-act="play" aria-label="' + playLabel + '">' +
      playIcon + '<span>' + (audioError ? "Audio unavailable" : playLabel) + '</span></button></div>' +
      '</section>' +
      '<div class="le-qlist">' + list + '</div>' +
      '<div class="le-actions">' + action + '</div>';
  }

  function render() {
    if (phase === "start") $app.innerHTML = renderStart();
    else if (phase === "between") $app.innerHTML = renderBetween();
    else if (phase === "play") $app.innerHTML = renderPlay();
    // "done" is rendered by finish()
  }

  /* ---------- events (one delegated listener) ---------- */
  $app.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!t || t.disabled) return;
    var act = t.getAttribute("data-act");

    if (act === "start") { sfx("click"); start(); return; }
    if (act === "part") { sfx("click"); startPart(part + 1); return; }
    if (act === "play") { sfx("click"); togglePlay(); return; }
    if (act === "opt") {
      if (checked) return;
      answers[parseInt(t.getAttribute("data-q"), 10)] = parseInt(t.getAttribute("data-i"), 10);
      sfx("click");
      render();
      return;
    }
    if (act === "check") { checkAnswers(); return; }
    if (act === "next") { sfx("click"); nextStep(); return; }
  });

  render();
})();
