/* Match the Same Vowel Sound · Unit 1 · American English File 1
 * A word is shown in the middle and the words move around it. Tap the word
 * with the same sound. A correct word is muted and can't be used again.
 * Short sound effects only (LASfx), with a mute toggle.
 */
(function () {
  "use strict";

  var GAME_ID = "aef1-u1-match-vowel-sound";
  var BACK = "../";

  /* prompt: the word in the centre. answer: the word on the wheel with the same sound. */
  var PAIRS = [
    { prompt: "train", answer: "name" },
    { prompt: "Bye",   answer: "bike" },
    { prompt: "boot",  answer: "you" },
    { prompt: "very",  answer: "egg" },
    { prompt: "fish",  answer: "this" }
  ];
  var PHRASES = ["name", "bike", "you", "egg", "this"];

  var ROUNDS = PAIRS.length;
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage"), target = $("target"), promptEl = $("verb"), fb = $("fb"), tip = $("tip");

  var round = 0, correct = 0, wrong = 0;
  var order = [], chips = [], chainEls = [];
  var spin = 0, lastT = performance.now();
  var mutedPhrases = {};       /* phrase -> true once it has been matched */
  var busy = false, playRecorded = false;

  /* the shared Tests & Exams sound setting (the round sound button in the header) */
  function soundOff() {
    try { return localStorage.getItem("tests-sound") === "off"; } catch (e) { return false; }
  }
  function sfx(name) {
    if (soundOff()) return;
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- wheel ---------- */

  function buildChips() {
    chips.forEach(function (c) { c.el.remove(); });
    chips = [];
    var list = shuffle(PHRASES);
    var off = -Math.PI / 2;
    chips = list.map(function (p, i) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "chip";
      el.textContent = p;
      el.setAttribute("data-phrase", p);
      stage.appendChild(el);
      var c = { el: el, phrase: p, base: off + i * 2 * Math.PI / PHRASES.length, x: 0, y: 0 };
      el.addEventListener("click", function () { choose(c); });
      return c;
    });
    refreshChips();
  }

  function refreshChips() {
    chips.forEach(function (c) {
      var isMuted = !!mutedPhrases[c.phrase];
      c.el.classList.toggle("muted", isMuted);
      c.el.disabled = isMuted || busy;
      c.el.classList.remove("idle");
    });
  }

  function choose(c) {
    if (busy || mutedPhrases[c.phrase]) return;
    sfx("click");
    var cur = PAIRS[round];
    if (c.phrase === cur.answer) {
      correct++;
      busy = true;
      mutedPhrases[c.phrase] = true;
      target.className = "center ok";
      fb.textContent = "🎉 " + cur.prompt + " and " + cur.answer + " have the same sound!";
      fb.classList.add("show");
      tip.textContent = "Well done!";
      refreshChips();
      setTimeout(nextRound, 1400);
    } else {
      wrong++;
      sfx("wrong");
      target.className = "center bad";
      c.el.classList.remove("shake");
      void c.el.offsetWidth;
      c.el.classList.add("shake");
      fb.textContent = "Not quite, try another word";
      fb.classList.add("show");
      tip.textContent = "Find the word with the same sound";
      setTimeout(function () {
        target.className = "center";
        fb.classList.remove("show");
      }, 900);
    }
    updateHud();
  }

  function nextRound() {
    round++;
    if (round >= ROUNDS) { finish(); return; }
    busy = false;
    target.className = "center";
    fb.classList.remove("show");
    fb.textContent = "";
    promptEl.textContent = PAIRS[round].prompt;
    sfx("pop");
    buildChips();
    tip.textContent = "Tap the word with the same sound";
    updateHud();
  }

  function updateHud() {
    $("round").textContent = "Round " + (round + 1) + "/" + ROUNDS;
    $("score").textContent = "✅ " + correct;
    $("prog").style.width = (round / ROUNDS * 100) + "%";
  }

  /* ---------- start and finish ---------- */

  function start() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    $("start").classList.remove("on");
    $("end").classList.remove("on");
    $("end").hidden = true;
    document.querySelectorAll(".confetti").forEach(function (e) { e.remove(); });
    round = 0; correct = 0; wrong = 0;
    mutedPhrases = {};
    busy = false;
    playRecorded = false;
    target.className = "center";
    promptEl.textContent = PAIRS[0].prompt;
    buildChips();
    tip.textContent = "Tap the word with the same sound";
    updateHud();
  }

  function calcStars(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  }

  function saveProgress(stars, pct) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Match the Same Vowel Sound",
          category: "tests", unit: "aef1-1",
          score: correct, maxScore: ROUNDS, accuracy: pct,
          completed: true, stars: stars
        });
      }
    } catch (e) {}
  }

  function finish() {
    var attempts = correct + wrong;
    var pct = attempts ? Math.round(correct / attempts * 100) : 100;
    var stars = calcStars(pct);
    $("prog").style.width = "100%";
    $("score").textContent = "✅ " + correct;
    saveProgress(stars, pct);
    try { if (window.TestStars && typeof TestStars.award === "function") TestStars.award(GAME_ID); } catch (e) {}
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, gameName: "Match the Same Vowel Sound",
        score: correct, total: ROUNDS, stars: stars,
        accuracy: pct, timeMs: timeMs, save: false,
        onAgain: start,
        onModes: function () { $("end").classList.remove("on"); $("start").classList.add("on"); },
        backHref: BACK
      });
      return;
    }
    $("end").innerHTML = '<div class="screen-card"><h2>Well done!</h2><p>You got ' + correct + " of " + ROUNDS +
      " right. Accuracy " + pct + '%.</p><button class="btn" id="again">Play again</button></div>';
    $("end").hidden = false;
    $("end").classList.add("on");
    $("again").onclick = start;
  }

  /* ---------- wheel animation and chains ---------- */

  function drawChains() {
    var svg = $("chains"), n = chips.length;
    if (!chainEls.length) {
      var mk = function (cls) {
        var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        e.setAttribute("class", cls);
        return e;
      };
      for (var i = 0; i < n; i++) {
        var a = mk("lk"), b = mk("lk2");
        svg.appendChild(a); svg.appendChild(b);
        chainEls.push([a, b]);
      }
    }
    for (var k = 0; k < n; k++) {
      var p = chips[k], q = chips[(k + 1) % n], pe = chainEls[k];
      var on = !mutedPhrases[p.phrase] && !mutedPhrases[q.phrase];
      var d = on ? "M" + p.x + " " + p.y + "L" + q.x + " " + q.y : "";
      pe[0].setAttribute("d", d);
      pe[1].setAttribute("d", d);
    }
  }

  function frame(t) {
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    spin += dt * 0.35;
    var W = stage.clientWidth, cx = W / 2;
    var d = chips.length ? chips[0].el.offsetWidth : 100;
    var r = W / 2 - d / 2 - 4;
    chips.forEach(function (c) {
      var a = c.base + spin;
      c.x = cx + r * Math.cos(a);
      c.y = cx + r * Math.sin(a);
      c.el.style.left = c.x + "px";
      c.el.style.top = c.y + "px";
    });
    drawChains();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- controls ---------- */

  $("go").onclick = start;
})();
