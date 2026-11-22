/* Complete the Advice – Teen2Teen 1 Unit 12. Write should / shouldn't and the verb. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-complete-the-advice";

  // before = text before the blanks, answer = the words to write, after = text after, verb = the hint
  var ITEMS = [
    { before: "You", answer: "should go", after: "to Canada in October. It's so pretty then!", verb: "go" },
    { before: "Your little brother", answer: "shouldn't play", after: "video games now. It's 8:45, and his class is at 9:00!", verb: "play" },
    { before: "We", answer: "should listen", after: "to this Beyoncé song. It's really good!", verb: "listen" },
    { before: "Your grandparents", answer: "shouldn't swim", after: "at that beach. It isn't very nice.", verb: "swim" },
    { before: "You", answer: "should go", after: "to a restaurant in Mexico City. The restaurants are awesome.", verb: "go" },
    { before: "I", answer: "should take", after: "an umbrella to the park. Look at those dark clouds!", verb: "take" },
    { before: "She", answer: "shouldn't buy", after: "that beautiful dress. It is way too expensive.", verb: "buy" },
    { before: "They", answer: "should visit", after: "the new science museum. It is fantastic!", verb: "visit" },
    { before: "We", answer: "shouldn't eat", after: "a big dinner right now. We just had a huge lunch.", verb: "eat" },
    { before: "You", answer: "should see", after: "the new action movie. It is really exciting!", verb: "see" },
    { before: "He", answer: "should study", after: "for his English test tonight. The test is tomorrow morning.", verb: "study" },
    { before: "My friends", answer: "shouldn't go", after: "hiking today. The weather is terrible and it's raining.", verb: "go" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  /* ---------- sound effects ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("ua-muted") === "1"; } catch (e) {}
  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audioCtx(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    tap: function () { tone(640, 0.05, "triangle", 0.07); },
    type: function () { tone(900, 0.03, "square", 0.03); },
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var idx = 0, score = 0, misses = 0, locked = false, stageTimer = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  // compare ignoring case, extra spaces and apostrophes, so "shouldnt" and "shouldn't" both count
  function norm(s) { return String(s || "").toLowerCase().replace(/['’]/g, "").replace(/\s+/g, " ").trim(); }

  function setProgress() {
    $("sh-fill").style.width = Math.round((idx / ITEMS.length) * 100) + "%";
  }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }

  function boxes() { return Array.prototype.slice.call(document.querySelectorAll("#ca-sentence .tp-box")); }
  function allFilled() { return boxes().every(function (b) { return b.value.trim().length > 0; }); }
  function updateCheck() { var btn = $("ca-check"); if (btn) btn.disabled = locked || !allFilled(); }

  function renderItem(animateIn) {
    var it = ITEMS[idx];
    var words = it.answer.split(" ");
    locked = false;
    var boxesHTML = words.map(function (w, i) {
      // allow one extra character for an apostrophe (shouldn't)
      var max = w.length + (w.indexOf("'") > -1 ? 1 : 0);
      return '<input class="tp-box" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
        'maxlength="' + max + '" data-w="' + i + '" style="--len:' + w.length + '" aria-label="Word ' + (i + 1) + '">';
    }).join(" ");
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<p class="ca-sentence" id="ca-sentence">' + esc(it.before) + " " +
      '<span class="ca-row">' + boxesHTML + "</span> " + esc(it.after) + "</p>" +
      '<div class="ca-hint">✏️ Verb: (' + esc(it.verb) + ")</div>" +
      '<button class="ca-check" id="ca-check" disabled>Check ✓</button>';
    setProgress();
    setFeedback("", "");
    updateCheck();
    var first = boxes()[0];
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, animateIn ? 450 : 50);
  }

  function nextItem() {
    var old = $("sh-card");
    old.classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      idx++;
      if (idx >= ITEMS.length) finish();
      else renderItem(true);
    }, 300);
  }

  function check() {
    if (locked || !allFilled()) return;
    var target = ITEMS[idx].answer.split(" ");
    var bs = boxes();
    var wrong = 0;
    bs.forEach(function (b, i) {
      b.classList.remove("is-wrong");
      if (norm(b.value) === norm(target[i])) {
        b.classList.add("is-right");
        b.readOnly = true;
      } else {
        b.classList.add("is-wrong");
        wrong++;
      }
    });
    if (wrong === 0) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      sfx("correct");
      setFeedback("Yesss! 🎉", "ok");
      updateCheck();
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextItem, 1100);
    } else {
      misses++;
      sfx("wrong");
      setFeedback("Check the red boxes 💪", "no");
      var first = bs.filter(function (b) { return b.classList.contains("is-wrong"); })[0];
      if (first) first.focus({ preventScroll: true });
    }
  }

  /* ---------- events ---------- */
  $("sh-card").addEventListener("input", function (ev) {
    var b = ev.target;
    if (!b.classList || !b.classList.contains("tp-box")) return;
    b.classList.remove("is-wrong");
    sfx("type");
    var max = Number(b.getAttribute("maxlength"));
    if (b.value.length >= max) {
      var bs = boxes(), i = bs.indexOf(b);
      if (i > -1 && i < bs.length - 1) bs[i + 1].focus();
    }
    updateCheck();
  });

  $("sh-card").addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    if (!ev.target.classList || !ev.target.classList.contains("tp-box")) return;
    ev.preventDefault();
    if (allFilled()) check();
    else {
      var bs = boxes(), i = bs.indexOf(ev.target);
      var next = bs.slice(i + 1).concat(bs.slice(0, i + 1)).filter(function (x) { return !x.value.trim(); })[0];
      if (next) next.focus();
    }
  });

  $("sh-card").addEventListener("click", function (ev) {
    if (ev.target.closest("#ca-check")) { audioCtx(); sfx("tap"); check(); }
  });

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var total = ITEMS.length;
    var stars = score === total ? 3 : score / total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: start,
          onModes: start,
          backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("sh-card").className = "sh-card";
    $("sh-card").innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
  }

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap");
    paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    idx = 0; score = 0; misses = 0;
    $("sh-card").innerHTML = "";
    renderItem(false);
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
