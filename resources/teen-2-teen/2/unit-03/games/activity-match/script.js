/* Activity Match – Teen2Teen 2 Unit 3: extra-curricular activities */
(function () {
  "use strict";
  var GAME_ID = "t2t2-u3-activity-match";
  var PAIRS = [
    { w: "play basketball", e: "🏀" },
    { w: "play the guitar", e: "🎸" },
    { w: "go swimming", e: "🏊" },
    { w: "do yoga", e: "🧘" },
    { w: "take dance lessons", e: "💃" },
    { w: "play soccer", e: "⚽" },
    { w: "take piano lessons", e: "🎹" },
    { w: "do karate", e: "🥋" }
  ];
  var app = document.getElementById("game-app");
  if (!app) return;
  var K = window.UAKit;
  function sfx(n) { if (K) K.sfx(n); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var words, emojis, selWord = null, matched = 0, misses = 0;

  function start() {
    if (K) K.unlock();
    words = shuffle(PAIRS.map(function (p, i) { return { i: i, t: p.w }; }));
    emojis = shuffle(PAIRS.map(function (p, i) { return { i: i, t: p.e }; }));
    selWord = null; matched = 0; misses = 0;
    render();
  }

  function render() {
    var pct = Math.round((matched / PAIRS.length) * 100);
    app.innerHTML =
      '<div class="u3-top"><a class="u3-back" href="../">← Games</a><div class="u3-title">Activity Match</div></div>' +
      '<div class="u3-progress"><span style="width:' + pct + '%"></span></div>' +
      '<p class="u3-prompt">Tap an activity, then tap the matching picture.</p>' +
      '<div class="u3-grid">' +
      words.map(function (w) {
        var cls = "u3-btn" + (w.matched ? " is-matched" : "") + (selWord === w.i ? " is-selected" : "");
        return '<button class="' + cls + '" data-kind="w" data-i="' + w.i + '">' + w.t + "</button>";
      }).join("") +
      emojis.map(function (e) {
        var cls = "u3-btn emoji" + (e.matched ? " is-matched" : "");
        return '<button class="' + cls + '" data-kind="e" data-i="' + e.i + '">' + e.t + "</button>";
      }).join("") +
      "</div>" +
      '<div class="u3-feedback" aria-live="polite"></div>';
  }

  function markMatched(i) {
    words.forEach(function (w) { if (w.i === i) w.matched = true; });
    emojis.forEach(function (e) { if (e.i === i) e.matched = true; });
  }

  function finish() {
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, misses === 0 ? 3 : misses <= 2 ? 2 : 1); } } catch (e) {}
    sfx("win");
    app.innerHTML =
      '<div class="u3-top"><a class="u3-back" href="../">← Games</a><div class="u3-title">Activity Match</div></div>' +
      '<div class="u3-done"><h2>Great job! 🎉</h2><p>You matched all ' + PAIRS.length + " activities. Misses: " + misses + ".</p>" +
      '<button class="u3-primary u3-restart" id="restart">Play again</button></div>';
    if (K) K.celebrate(app.querySelector(".u3-done"));
    document.getElementById("restart").onclick = start;
  }

  app.addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-kind]");
    if (!b) return;
    var kind = b.getAttribute("data-kind"), i = Number(b.getAttribute("data-i"));
    if (kind === "w") { sfx("select"); selWord = i; render(); return; }
    if (selWord === null) { sfx("tap"); return; }
    if (selWord === i) {
      sfx("correct");
      markMatched(i); matched++; selWord = null; render();
      var fb = app.querySelector(".u3-feedback"); if (fb) { fb.textContent = "Correct!"; fb.className = "u3-feedback ok"; }
      if (matched === PAIRS.length) setTimeout(finish, 500);
    } else {
      sfx("wrong"); misses++;
      var fb2 = app.querySelector(".u3-feedback"); if (fb2) { fb2.textContent = "Try again"; fb2.className = "u3-feedback no"; }
      selWord = null; render();
    }
  });

  start();
})();
