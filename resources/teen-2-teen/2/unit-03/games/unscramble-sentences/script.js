/* Unscramble Sentences – Teen2Teen 2 Unit 3: present continuous statements and questions */
(function () {
  "use strict";
  var GAME_ID = "t2t2-u3-unscramble-sentences";
  var ITEMS = [
    { w: ["I", "am", "playing", "basketball", "now."], a: "I am playing basketball now." },
    { w: ["She", "is", "taking", "piano", "lessons."], a: "She is taking piano lessons." },
    { w: ["They", "are", "going", "swimming", "today."], a: "They are going swimming today." },
    { w: ["He", "is", "doing", "yoga", "after", "school."], a: "He is doing yoga after school." },
    { w: ["Are", "you", "doing", "karate", "this", "year?"], a: "Are you doing karate this year?" }
  ];
  var app = document.getElementById("game-app");
  if (!app) return;
  var K = window.UAKit;
  function sfx(n) { if (K) K.sfx(n); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function norm(s) { return s.toLowerCase().replace(/[.?!,]/g, "").replace(/\s+/g, " ").trim(); }

  var idx = 0, score = 0, pool = [], built = [], checked = false;

  function start() { if (K) K.unlock(); idx = 0; score = 0; load(); }

  function load() {
    var it = ITEMS[idx];
    pool = it.w.map(function (t, i) { return { id: i, t: t, used: false }; });
    pool = shuffle(pool);
    built = []; checked = false;
    render();
  }

  function render() {
    var pct = Math.round((idx / ITEMS.length) * 100);
    var answerHTML = built.map(function (c) { return '<button class="u3-chip" data-back="' + c.id + '">' + c.t + "</button>"; }).join("");
    var poolHTML = pool.filter(function (p) { return !p.used; }).map(function (p) { return '<button class="u3-chip" data-id="' + p.id + '">' + p.t + "</button>"; }).join("");
    app.innerHTML =
      '<div class="u3-top"><a class="u3-back" href="../">← Games</a><div class="u3-title">Unscramble Sentences</div></div>' +
      '<div class="u3-progress"><span style="width:' + pct + '%"></span></div>' +
      '<p class="u3-prompt">Tap the words in the right order. (' + (idx + 1) + " / " + ITEMS.length + ")</p>" +
      '<div class="u3-answer">' + (answerHTML || '<span class="u3-prompt">Your sentence appears here</span>') + "</div>" +
      '<div class="u3-chips">' + poolHTML + "</div>" +
      '<div class="u3-feedback" aria-live="polite"></div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      '<button class="u3-btn" id="clear" style="min-height:0;padding:10px 18px">Clear</button>' +
      '<button class="u3-primary" id="check" ' + (pool.every(function (p) { return p.used; }) ? "" : "disabled") + ">Check</button></div>";
  }

  function finish() {
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, score === ITEMS.length ? 3 : score >= ITEMS.length / 2 ? 2 : 1); } } catch (e) {}
    sfx("win");
    app.innerHTML =
      '<div class="u3-top"><a class="u3-back" href="../">← Games</a><div class="u3-title">Unscramble Sentences</div></div>' +
      '<div class="u3-done"><h2>Score: ' + score + " / " + ITEMS.length + "</h2><p>Well done!</p>" +
      '<button class="u3-primary u3-restart" id="restart">Play again</button></div>';
    if (K) K.celebrate(app.querySelector(".u3-done"));
    document.getElementById("restart").onclick = start;
  }

  app.addEventListener("click", function (ev) {
    var t = ev.target.closest("button");
    if (!t) return;
    if (t.id === "restart") return;
    if (t.hasAttribute("data-id")) {
      var id = Number(t.getAttribute("data-id"));
      pool.forEach(function (p) { if (p.id === id) { p.used = true; built.push(p); } });
      sfx("place"); render(); return;
    }
    if (t.hasAttribute("data-back")) {
      var bid = Number(t.getAttribute("data-back"));
      built = built.filter(function (c) { if (c.id === bid) { pool.forEach(function (p) { if (p.id === bid) p.used = false; }); return false; } return true; });
      sfx("undo"); render(); return;
    }
    if (t.id === "clear") { pool.forEach(function (p) { p.used = false; }); built = []; sfx("undo"); render(); return; }
    if (t.id === "check" && !checked) {
      checked = true;
      var attempt = built.map(function (c) { return c.t; }).join(" ");
      var ok = norm(attempt) === norm(ITEMS[idx].a);
      var fb = app.querySelector(".u3-feedback");
      if (ok) { score++; sfx("correct"); fb.textContent = "Correct!"; fb.className = "u3-feedback ok"; }
      else { sfx("wrong"); fb.textContent = "Not quite. Correct: " + ITEMS[idx].a; fb.className = "u3-feedback no"; }
      setTimeout(function () {
        if (idx === ITEMS.length - 1) finish();
        else { sfx("next"); idx++; load(); }
      }, ok ? 900 : 2200);
    }
  });

  start();
})();
