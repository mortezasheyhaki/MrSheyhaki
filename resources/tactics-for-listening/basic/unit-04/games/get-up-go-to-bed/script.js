/* Get up & go to bed · Tactics For Listening Basic Unit 4
 * Listen and set get-up / go-to-bed times for each person.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-get-up-go-to-bed";
  var GAME_NAME = "Get up & go to bed";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  var ITEMS = [
    { who: "Sandra", upH: 5, upM: 0, bedH: 8, bedM: 30, audio: "https://cdn.imgurl.ir/uploads/m6112_.mp3" },
    { who: "John", upH: 6, upM: 15, bedH: 12, bedM: 0, audio: "https://cdn.imgurl.ir/uploads/k70028_.mp3" },
    { who: "Sam", upH: 9, upM: 30, bedH: 3, bedM: 0, audio: "https://cdn.imgurl.ir/uploads/784194_.mp3" },
    { who: "Grace", upH: 7, upM: 45, bedH: 1, bedM: 0, audio: "https://cdn.imgurl.ir/uploads/q7585_.mp3" },
    { who: "Mia", upH: 6, upM: 0, bedH: 10, bedM: 0, audio: "https://cdn.imgurl.ir/uploads/y83499_.mp3" },
    { who: "James", upH: 4, upM: 0, bedH: 8, bedM: 0, audio: "https://cdn.imgurl.ir/uploads/z485436_.mp3" }
  ];

  var TOTAL = ITEMS.length;
  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var current = 0;
  // answers: { upH, upM, bedH, bedM }
  var ans = { upH: 12, upM: 0, bedH: 12, bedM: 0 };
  var checked = false;
  var results = []; // true if both times correct
  var details = {}; // idx -> { up, bed }
  var playing = false;
  var audioError = false;
  var audio = null;
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="ggb-play-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="ggb-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="ggb-play-alert" aria-hidden="true">!</span>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function pad2(n) {
    n = Math.abs(parseInt(n, 10) || 0);
    return (n < 10 ? "0" : "") + n;
  }
  function normHour(h) {
    h = parseInt(h, 10);
    if (isNaN(h)) return 12;
    // allow 1–12; also accept 0 as 12
    if (h === 0) return 12;
    if (h > 12) h = h % 12;
    if (h === 0) return 12;
    if (h < 0) h = 12 + (h % 12);
    return h;
  }
  function normMin(m) {
    m = parseInt(m, 10);
    if (isNaN(m)) return 0;
    return ((m % 60) + 60) % 60;
  }
  function hourEq(a, b) {
    a = normHour(a); b = normHour(b);
    return a === b || (a === 12 && b === 0) || (a === 0 && b === 12);
  }
  function fmt(h, m) { return pad2(normHour(h)) + ":" + pad2(normMin(m)); }

  function stopAudio() {
    playing = false;
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    }
  }

  function updateAudioUI() {
    var replay = document.getElementById("ggb-replay");
    var title = document.querySelector(".ggb-listen-title");
    if (replay) {
      replay.className = "ggb-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
      replay.setAttribute("aria-label", playLabel());
      replay.innerHTML = playIcon();
    }
    if (title) title.textContent = playLabel();
  }

  function play() {
    if (!HAS_AUDIO) return;
    sfx("click");
    stopAudio();
    audioError = false;
    audio = new Audio(ITEMS[current].audio);
    audio.preload = "auto";
    playing = true;
    updateAudioUI();
    audio.onended = function () { playing = false; updateAudioUI(); };
    audio.onerror = function () { playing = false; audioError = true; updateAudioUI(); };
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () { playing = false; audioError = true; updateAudioUI(); });
    }
  }

  function score() {
    var n = 0;
    for (var i = 0; i < results.length; i++) if (results[i]) n++;
    return n;
  }

  function calcStars() {
    var s = score();
    if (s >= TOTAL) return 3;
    if (s >= 4) return 2;
    if (s >= 3) return 1;
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
          unit: "basic-4",
          score: score(),
          maxScore: TOTAL,
          accuracy: Math.round((score() / TOTAL) * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function resetAns() {
    ans = { upH: 12, upM: 0, bedH: 12, bedM: 0 };
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    current = 0;
    resetAns();
    checked = false;
    results = [];
    details = {};
    playRecorded = false;
    stopAudio();
    phase = "play";
    render();
  }

  function readInputs() {
    ["upH", "upM", "bedH", "bedM"].forEach(function (k) {
      var el = document.getElementById("ggb-" + k);
      if (!el) return;
      if (k.indexOf("H") >= 0) ans[k] = normHour(el.value);
      else ans[k] = normMin(el.value);
    });
  }

  function syncFace(which) {
    var face = document.getElementById("ggb-face-" + which);
    if (!face) return;
    if (which === "up") face.textContent = fmt(ans.upH, ans.upM);
    else face.textContent = fmt(ans.bedH, ans.bedM);
  }

  function bump(key, dir) {
    if (checked) return;
    if (key === "upH") ans.upH = normHour(ans.upH + dir);
    if (key === "upM") ans.upM = normMin(ans.upM + dir);
    if (key === "bedH") ans.bedH = normHour(ans.bedH + dir);
    if (key === "bedM") ans.bedM = normMin(ans.bedM + dir);
    var el = document.getElementById("ggb-" + key);
    if (el) el.value = pad2(ans[key]);
    syncFace(key.indexOf("up") === 0 ? "up" : "bed");
  }

  function checkAnswer() {
    if (checked) return;
    readInputs();
    checked = true;
    var it = ITEMS[current];
    var okUp = hourEq(ans.upH, it.upH) && normMin(ans.upM) === it.upM;
    var okBed = hourEq(ans.bedH, it.bedH) && normMin(ans.bedM) === it.bedM;
    results[current] = okUp && okBed;
    details[current] = { up: okUp, bed: okBed };
    sfx(results[current] ? "correct" : "wrong");
    stopAudio();
    renderPlay();
  }

  function next() {
    if (!checked) return;
    if (current + 1 >= TOTAL) {
      finish();
      return;
    }
    current++;
    resetAns();
    checked = false;
    audioError = false;
    stopAudio();
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
        score: score(),
        total: TOTAL,
        stars: stars,
        accuracy: Math.round((score() / TOTAL) * 100),
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

  function segments() {
    return (
      '<div class="lc-seg" role="img" aria-label="Person ' + (current + 1) + " of " + TOTAL + '">' +
      ITEMS.map(function (_, i) {
        var cls = i < current ? "is-done" : i === current ? "is-current" : "";
        if (i < results.length) cls = results[i] ? "is-right" : "is-wrong";
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
    if (audioError) return "Audio unavailable";
    if (playing) return "Playing…";
    return "Play the recording";
  }

  function timeBlock(kind, label, hKey, mKey, okFlag) {
    var h = ans[hKey];
    var m = ans[mKey];
    var disabled = checked ? " disabled" : "";
    var cls = "ggb-block";
    if (checked) cls += okFlag ? " is-ok" : " is-bad";
    var faceId = kind === "up" ? "ggb-face-up" : "ggb-face-bed";
    var hint = "";
    if (checked && !okFlag) {
      var it = ITEMS[current];
      var ch = kind === "up" ? it.upH : it.bedH;
      var cm = kind === "up" ? it.upM : it.bedM;
      hint = '<span class="ggb-hint">Answer: ' + fmt(ch, cm) + "</span>";
    }
    return (
      '<div class="' + cls + '">' +
        '<span class="ggb-block-label">' + esc(label) + "</span>" +
        '<div class="ggb-mini-face"><span id="' + faceId + '">' + fmt(h, m) + "</span></div>" +
        '<div class="ggb-controls">' +
          '<div class="ggb-col">' +
            '<button type="button" class="ggb-bump" data-key="' + hKey + '" data-dir="1"' + disabled + ' aria-label="Hour up">▲</button>' +
            '<input type="number" class="ggb-input" id="ggb-' + hKey + '" min="1" max="12" inputmode="numeric" value="' + pad2(h) + '"' + disabled + ' aria-label="' + esc(label) + ' hour">' +
            '<button type="button" class="ggb-bump" data-key="' + hKey + '" data-dir="-1"' + disabled + ' aria-label="Hour down">▼</button>' +
          "</div>" +
          '<span class="ggb-colon">:</span>' +
          '<div class="ggb-col">' +
            '<button type="button" class="ggb-bump" data-key="' + mKey + '" data-dir="5"' + disabled + ' aria-label="Minute up">▲</button>' +
            '<input type="number" class="ggb-input" id="ggb-' + mKey + '" min="0" max="59" inputmode="numeric" value="' + pad2(m) + '"' + disabled + ' aria-label="' + esc(label) + ' minute">' +
            '<button type="button" class="ggb-bump" data-key="' + mKey + '" data-dir="-5"' + disabled + ' aria-label="Minute down">▼</button>' +
          "</div>" +
        "</div>" +
        hint +
      "</div>"
    );
  }

  function renderStart() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🛏️</div>' +
      "<h1>" + esc(GAME_NAME) + "</h1>" +
      '<p class="lc-intro-lede">Listen to each person. Write the time they get up and the time they go to bed.</p>' +
      '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="ggb-start">Start listening →</button></div>' +
      "</div>" +
      '<ol class="lc-steps">' +
      '<li><span class="tip-num">1</span><span>Tap <strong>Play</strong> to hear the person</span></li>' +
      '<li><span class="tip-num">2</span><span>Set <strong>gets up</strong> and <strong>goes to bed</strong></span></li>' +
      '<li><span class="tip-num">3</span><span><strong>6</strong> people in total</span></li>' +
      "</ol></section>";
    document.getElementById("ggb-start").onclick = startGame;
  }

  function renderPlay() {
    var it = ITEMS[current];
    var counter = (current + 1) + " / " + TOTAL;
    var last = current + 1 >= TOTAL;
    var playCls = "ggb-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");

    var det = details[current] || {};
    var okUp = checked ? det.up : null;
    var okBed = checked ? det.bed : null;

    var foot;
    if (!checked) {
      foot =
        '<div class="ggb-foot">' +
        '<span class="ggb-foot-text">Set both times, then Check.</span>' +
        '<button type="button" class="ggb-next" id="ggb-check">Check ✓</button></div>';
    } else {
      var ok = results[current];
      foot =
        '<div class="ggb-foot">' +
        '<span class="ggb-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' +
        (ok ? "Perfect!" : "Check the green answers.") + "</span>" +
        '<button type="button" class="ggb-next" id="ggb-next">' +
        (last ? "See results →" : "Next →") + "</button></div>";
    }

    app.innerHTML =
      topBar(counter) +
      segments() +
      '<div class="ggb-main">' +
        '<div class="ggb-listen">' +
          '<button type="button" class="' + playCls + '" id="ggb-replay" aria-label="' + esc(playLabel()) + '">' +
            playIcon() +
          "</button>" +
          '<div class="ggb-listen-text">' +
            '<p class="ggb-listen-title">' + esc(playLabel()) + "</p>" +
            '<p class="ggb-listen-sub"><strong>' + esc(it.who) + "</strong> · person " + (current + 1) + " of " + TOTAL + "</p>" +
          "</div>" +
        "</div>" +

        '<p class="ggb-who">What time does <strong>' + esc(it.who) + "</strong> get up and go to bed?</p>" +

        '<div class="ggb-pair">' +
          timeBlock("up", "gets up", "upH", "upM", okUp) +
          timeBlock("bed", "goes to bed", "bedH", "bedM", okBed) +
        "</div>" +

        foot +
      "</div>";

    var replay = document.getElementById("ggb-replay");
    if (replay) {
      replay.onclick = function () {
        if (playing) { stopAudio(); updateAudioUI(); }
        else play();
      };
    }

    app.querySelectorAll(".ggb-bump").forEach(function (btn) {
      btn.onclick = function () {
        if (checked) return;
        bump(btn.getAttribute("data-key"), parseInt(btn.getAttribute("data-dir"), 10));
      };
    });

    ["upH", "upM", "bedH", "bedM"].forEach(function (k) {
      var el = document.getElementById("ggb-" + k);
      if (!el) return;
      el.addEventListener("focus", function () {
        try { el.select(); } catch (e) {}
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (!checked) checkAnswer();
          else next();
        }
      });
      el.addEventListener("input", function () {
        if (checked) return;
        if (k.indexOf("H") >= 0) ans[k] = normHour(el.value);
        else ans[k] = normMin(el.value);
        syncFace(k.indexOf("up") === 0 ? "up" : "bed");
      });
      el.addEventListener("change", function () {
        if (k.indexOf("H") >= 0) {
          ans[k] = normHour(el.value);
          el.value = pad2(ans[k]);
        } else {
          ans[k] = normMin(el.value);
          el.value = pad2(ans[k]);
        }
        syncFace(k.indexOf("up") === 0 ? "up" : "bed");
      });
    });

    var checkBtn = document.getElementById("ggb-check");
    if (checkBtn) checkBtn.onclick = checkAnswer;
    var nextBtn = document.getElementById("ggb-next");
    if (nextBtn) nextBtn.onclick = next;
  }

  function renderDone() {
    app.innerHTML =
      topBar("") +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score() + " of " + TOTAL + " correct</h1>" +
      '<p class="lc-intro-lede">You listened for get-up and bedtime times.</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="ggb-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    document.getElementById("ggb-again").onclick = startGame;
  }

  function render() {
    if (phase === "start") renderStart();
    else if (phase === "play") renderPlay();
    else renderDone();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    var k = e.key.toLowerCase();
    if (k === " " || k === "r") {
      e.preventDefault();
      if (playing) { stopAudio(); updateAudioUI(); }
      else play();
    }
    if (k === "enter") {
      e.preventDefault();
      if (!checked) checkAnswer();
      else next();
    }
  });

  render();
})();
