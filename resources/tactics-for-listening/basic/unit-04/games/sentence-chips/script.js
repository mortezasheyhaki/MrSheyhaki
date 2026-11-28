/* Complete the sentences · Tactics For Listening Basic Unit 4
 * One sentence at a time. Tap the chip that completes the sentence.
 * Feedback and Next sit under the chips, inside the same card.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-basic-u4-sentence-chips";
  var GAME_NAME = "Complete the sentences";
  var UNIT = "Unit 4 · Basic";
  var BACK = "../../";

  // Each item: sentence with ___ for the blank, the answer, and two distractors
  var ITEMS = [
    { s: "Sarah is a ___. She never goes to bed before midnight.", a: "night person", d: ["morning person", "night shift"] },
    { s: "Susan wanted to ___ and watch a movie, but she got too tired.", a: "stay up late", d: ["get up", "hang out"] },
    { s: "Sometimes I sleep late and sometimes I don't. It ___ on how tired I am.", a: "depends", d: ["chat", "fall asleep"] },
    { s: "If Tom drinks coffee at night, he can't ___.", a: "fall asleep", d: ["get up", "stay up late"] },
    { s: "I'm not a ___. I hate to wake up before 10:00 a.m.", a: "morning person", d: ["night person", "new year"] },
    { s: "Richard was late to class because he didn't ___ on time.", a: "get up", d: ["stay up late", "hang out"] },
    { s: "Molly stayed up all night to ___ with her friends online.", a: "chat", d: ["hang out", "depends"] },
    { s: "Hillary and her friends like to ___ at the shopping mall.", a: "hang out", d: ["chat", "night shift"] },
    { s: "At midnight on December 31st, many people celebrate the ___.", a: "new year", d: ["night shift", "stay up late"] },
    { s: "Hank used to work the ___, but now he works during the day.", a: "night shift", d: ["night person", "new year"] }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var pos = 0;
  var score = 0;
  var answered = false;   // checked?
  var selected = null;    // chosen option text, before checking
  var current = null;
  var phase = "play";
  var playRecorded = false;

  function sfx(name) {
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function topBar() {
    return (
      '<header class="lc-top">' +
      '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
      '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(UNIT) + "</span><strong>" + esc(GAME_NAME) + "</strong></div>" +
      '<span class="sc-score" id="sc-score"></span>' +
      "</header>"
    );
  }

  function renderShell() {
    app.innerHTML =
      topBar() +
      '<div class="sc-progress"><div class="sc-progress-fill" id="sc-fill"></div></div>' +
      '<section class="sc-stage" id="sc-stage"></section>';
  }

  function updateHeader() {
    var fill = document.getElementById("sc-fill");
    var score_el = document.getElementById("sc-score");
    if (score_el) score_el.textContent = score + " / " + ITEMS.length;
    if (fill) fill.style.width = ((answered ? pos + 1 : pos) / ITEMS.length) * 100 + "%";
  }

  function renderQuestion() {
    answered = false;
    selected = null;
    var item = ITEMS[order[pos]];
    current = { item: item, options: shuffle([item.a].concat(item.d)) };

    var parts = item.s.split("___");
    var stage = document.getElementById("sc-stage");
    stage.innerHTML =
      '<div class="sc-q-label">Question ' + (pos + 1) + " of " + ITEMS.length + "</div>" +
      '<p class="sc-sentence">' + esc(parts[0]) +
      '<span class="sc-gap" id="sc-gap">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>' +
      esc(parts[1] || "") + "</p>" +
      '<div class="sc-chips" id="sc-chips" role="group" aria-label="Answer choices">' +
      current.options.map(function (opt, i) {
        return '<button type="button" class="sc-chip" data-opt="' + esc(opt) + '" aria-pressed="false" aria-label="Option ' + (i + 1) + ': ' + esc(opt) + '">' + esc(opt) + "</button>";
      }).join("") +
      "</div>" +
      '<div class="sc-after">' +
      '<p class="sc-feedback" id="sc-feedback" aria-live="polite">Pick an answer, then check it.</p>' +
      '<button type="button" class="sc-btn sc-btn-check" id="sc-action" disabled>Check answer</button>' +
      "</div>";

    stage.querySelectorAll(".sc-chip").forEach(function (btn) {
      btn.onclick = function () { pick(btn.getAttribute("data-opt")); };
    });
    document.getElementById("sc-action").onclick = onAction;
    updateHeader();
  }

  // Step 1: select a chip (tap another chip to change the choice)
  function pick(opt) {
    if (phase !== "play" || answered || !current) return;
    selected = opt;
    sfx("tap");
    var gap = document.getElementById("sc-gap");
    gap.innerHTML = "&nbsp;" + esc(opt) + "&nbsp;";
    gap.classList.remove("is-ok", "is-reveal", "is-bad");
    gap.classList.add("is-picked");
    document.querySelectorAll("#sc-chips .sc-chip").forEach(function (btn) {
      var on = btn.getAttribute("data-opt") === opt;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var action = document.getElementById("sc-action");
    action.disabled = false;
    document.getElementById("sc-feedback").textContent = "Good. Press Check answer.";
    document.getElementById("sc-feedback").className = "sc-feedback";
  }

  // Step 2 / 3: the one button does Check, then becomes Next
  function onAction() {
    if (!answered) check();
    else next();
  }

  function check() {
    if (answered || !current || selected === null) return;
    answered = true;
    var correct = current.item.a;
    var gap = document.getElementById("sc-gap");
    var fb = document.getElementById("sc-feedback");
    var action = document.getElementById("sc-action");

    document.querySelectorAll("#sc-chips .sc-chip").forEach(function (btn) {
      btn.disabled = true;
      btn.classList.remove("is-selected");
      var v = btn.getAttribute("data-opt");
      if (v === correct) btn.classList.add(v === selected ? "is-correct" : "is-missed");
      else if (v === selected) btn.classList.add("is-wrong");
    });

    gap.classList.remove("is-picked");
    gap.innerHTML = "&nbsp;" + esc(correct) + "&nbsp;";
    if (selected === correct) {
      score++;
      gap.classList.add("is-ok");
      fb.textContent = "Correct!";
      fb.className = "sc-feedback is-ok";
      sfx("correct");
    } else {
      gap.classList.add("is-reveal");
      fb.textContent = "Not quite. The answer is “" + correct + "”.";
      fb.className = "sc-feedback is-bad";
      sfx("wrong");
    }

    action.disabled = false;
    action.textContent = pos === ITEMS.length - 1 ? "See results →" : "Next question →";
    action.className = "sc-btn sc-btn-next";
    action.focus();
    updateHeader();
  }

  function next() {
    if (!answered) return;
    if (pos < ITEMS.length - 1) {
      pos++;
      renderQuestion();
    } else {
      finish();
    }
  }

  function saveProgress(stars, pct) {
    if (window.LAStars) {
      if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
      LAStars.save(GAME_ID, stars);
    }
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID,
          gameName: GAME_NAME,
          category: "tactics-for-listening",
          unit: "basic-4",
          score: score,
          maxScore: ITEMS.length,
          accuracy: Math.round(pct * 100),
          completed: true,
          stars: stars
        });
      }
    } catch (e) {}
  }

  function finish() {
    phase = "done";
    var pct = score / ITEMS.length;
    var stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    saveProgress(stars, pct);
    sfx("win");
    if (window.LAFinish && typeof LAFinish.show === "function") {
      var timeMs = typeof LAFinish.stopTimer === "function" ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: ITEMS.length,
        stars: stars,
        accuracy: Math.round(pct * 100),
        timeMs: timeMs,
        onAgain: startGame,
        onModes: startGame,
        backHref: BACK,
        save: false
      });
      return;
    }
    renderDone();
  }

  function renderDone() {
    app.innerHTML =
      topBar() +
      '<section class="lc-intro">' +
      '<div class="lc-intro-main">' +
      '<div class="lc-hero-icon" aria-hidden="true">🏆</div>' +
      "<h1>" + score + " of " + ITEMS.length + " correct</h1>" +
      '<p class="lc-intro-lede">Great job completing the Unit 4 vocabulary sentences!</p>' +
      '<div class="lc-start-row" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">' +
      '<button type="button" class="lc-btn primary" id="sc-again">Play again</button>' +
      '<a class="lc-btn secondary" href="' + BACK + '">Back to Unit 4</a>' +
      "</div></div></section>";
    updateHeader();
    document.getElementById("sc-again").onclick = startGame;
  }

  function startGame() {
    if (window.LAFinish && typeof LAFinish.startTimer === "function") LAFinish.startTimer();
    phase = "play";
    playRecorded = false;
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    pos = 0;
    score = 0;
    answered = false;
    renderShell();
    renderQuestion();
  }

  document.addEventListener("keydown", function (e) {
    if (phase !== "play") return;
    if (e.key === "Enter") {
      var action = document.getElementById("sc-action");
      if (action && !action.disabled) { e.preventDefault(); onAction(); }
      return;
    }
    if (answered || !current) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= current.options.length) pick(current.options[n - 1]);
  });

  startGame();
})();
