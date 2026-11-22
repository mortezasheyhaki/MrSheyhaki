/* Question Words – Teen2Teen 2 Unit 3: information questions with the present continuous */
(function () {
  "use strict";
  var GAME_ID = "t2t2-u3-question-words";
  var ITEMS = [
    { s: "___ are you doing this year?", o: ["What", "Where", "Who"], a: "What" },
    { s: "___ is Tom playing basketball?", o: ["Where", "Who", "When"], a: "Where" },
    { s: "___ are you going to the gym?", o: ["Who", "Why", "When"], a: "Why" },
    { s: "___ is Maria taking dance lessons?", o: ["Who", "When", "Where"], a: "Where" },
    { s: "___ is doing yoga on Monday?", o: ["Who", "What", "Where"], a: "Who" },
    { s: "___ are you playing tennis?", o: ["What", "When", "Where"], a: "When" }
  ];
  var app = document.getElementById("game-app");
  if (!app) return;
  var K = window.UAKit;
  function sfx(n) { if (K) K.sfx(n); }
  var idx = 0, score = 0, answered = false;

  function start() { if (K) K.unlock(); idx = 0; score = 0; answered = false; render(); }

  function render() {
    var it = ITEMS[idx];
    var pct = Math.round((idx / ITEMS.length) * 100);
    app.innerHTML =
      '<div class="u3-top"><a class="u3-back" href="../">← Games</a><div class="u3-title">Question Words</div></div>' +
      '<div class="u3-progress"><span style="width:' + pct + '%"></span></div>' +
      '<p class="u3-prompt">Choose the correct question word. (' + (idx + 1) + " / " + ITEMS.length + ")</p>" +
      '<div class="u3-sentence">' + it.s + "</div>" +
      '<div class="u3-grid">' +
      it.o.map(function (w) { return '<button class="u3-btn" data-w="' + w + '">' + w + "</button>"; }).join("") +
      "</div>" +
      '<div class="u3-feedback" aria-live="polite"></div>' +
      '<button class="u3-primary" id="next" disabled>' + (idx === ITEMS.length - 1 ? "Finish" : "Next") + "</button>";
    answered = false;
  }

  function finish() {
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, score === ITEMS.length ? 3 : score >= ITEMS.length / 2 ? 2 : 1); } } catch (e) {}
    sfx("win");
    app.innerHTML =
      '<div class="u3-top"><a class="u3-back" href="../">← Games</a><div class="u3-title">Question Words</div></div>' +
      '<div class="u3-done"><h2>Score: ' + score + " / " + ITEMS.length + "</h2><p>Keep practicing the question words!</p>" +
      '<button class="u3-primary u3-restart" id="restart">Play again</button></div>';
    if (K) K.celebrate(app.querySelector(".u3-done"));
    document.getElementById("restart").onclick = start;
  }

  app.addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    if (b.id === "next") { if (idx === ITEMS.length - 1) finish(); else { sfx("next"); idx++; render(); } return; }
    var w = b.getAttribute("data-w");
    if (!w || answered) return;
    answered = true;
    var it = ITEMS[idx];
    var fb = app.querySelector(".u3-feedback");
    app.querySelectorAll(".u3-btn").forEach(function (x) { x.disabled = true; });
    if (w === it.a) {
      score++; b.classList.add("is-right"); sfx("correct");
      fb.textContent = "Correct!"; fb.className = "u3-feedback ok";
    } else {
      b.classList.add("is-wrong"); sfx("wrong");
      app.querySelectorAll(".u3-btn").forEach(function (x) { if (x.getAttribute("data-w") === it.a) x.classList.add("is-right"); });
      fb.textContent = "The answer is " + it.a + "."; fb.className = "u3-feedback no";
    }
    app.querySelector("#next").disabled = false;
  });

  start();
})();
