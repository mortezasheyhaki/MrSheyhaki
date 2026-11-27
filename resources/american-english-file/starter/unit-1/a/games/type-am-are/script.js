/* Type am / are – American English File Starter Unit 1A */
(function () {
  "use strict";

  var GAME_ID = "starter-1a-type-am-are";
  var NEXT_DELAY = 1100;

  // before + [answer] + after. Answer includes correct capitalisation.
  // For negatives players must type the full form (am not / are not / aren't).
  // When the verb starts the sentence, answer begins with a capital letter.
  var ITEMS = [
    { before: "I",   after: "from Mexico.",      answer: "am",      answers: ["am"] },
    { before: "I",   after: "a doctor.",         answer: "am not",  answers: ["am not", "I'm not"] },
    { before: "",    after: "you a student?",    answer: "Are",     answers: ["Are"] },
    { before: "You", after: "from Spain.",       answer: "are",     answers: ["are"] },
    { before: "I",   after: "in Class 1.",       answer: "am",      answers: ["am"] },
    { before: "You", after: "my teacher.",       answer: "are not", answers: ["are not", "aren't"] },
    { before: "I",   after: "20 years old.",     answer: "am",      answers: ["am"] },
    { before: "",    after: "you in Room 3?",    answer: "Are",     answers: ["Are"] },
    { before: "I",   after: "from Brazil.",      answer: "am not",  answers: ["am not", "I'm not"] },
    { before: "",    after: "you 18 years old?", answer: "Are",     answers: ["Are"] }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var pos = 0;
  var score = 0;
  var wrongOnCurrent = false;
  var locked = false;

  /* ---------- sound (Web Audio, no files) ---------- */
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.1, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
    if (window.ArcadeFX && ArcadeFX.ok) ArcadeFX.ok();
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.06, 0);
    tone(180, 0.18, "sawtooth", 0.05, 0.1);
    if (window.ArcadeFX && ArcadeFX.bad) ArcadeFX.bad();
  }

  /* ---------- helpers ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function hasFinish() {
    return !!(window.LAFinish && LAFinish.show);
  }

  function normalize(s) {
    return (s || "").trim().replace(/\s+/g, " ");
  }

  /* ---------- flow ---------- */
  function start() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    pos = 0;
    score = 0;
    wrongOnCurrent = false;
    locked = false;
    if (hasFinish()) LAFinish.startTimer();
    if (window.ArcadeFX && ArcadeFX.reset) ArcadeFX.reset();
    render();
  }

  function current() {
    return ITEMS[order[pos]];
  }

  function render() {
    var item = current();
    app.innerHTML = "";

    var wrap = el("div", "typebe-game-inner");
    wrap.style.cssText = "display:flex;flex-direction:column;flex:1;width:100%";

    // Top bar
    var top = el("div", "typebe-top");
    var back = el("a", "typebe-back", "←");
    back.href = "../";
    back.setAttribute("aria-label", "Back to games");
    var titleBox = el("div", "typebe-title");
    titleBox.appendChild(el("h1", null, "Type am / are"));
    titleBox.appendChild(el("p", null, "Type the missing verb · am not / aren't too"));
    var count = el("div", "typebe-count", (pos + 1) + " / " + ITEMS.length);
    count.setAttribute("aria-live", "polite");
    top.appendChild(back);
    top.appendChild(titleBox);
    top.appendChild(count);
    wrap.appendChild(top);

    // Progress
    var bar = el("div", "typebe-progress");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(ITEMS.length));
    bar.setAttribute("aria-valuenow", String(pos));
    var fill = el("div", "typebe-progress-fill");
    bar.appendChild(fill);
    wrap.appendChild(bar);
    requestAnimationFrame(function () {
      fill.style.width = Math.round((pos / ITEMS.length) * 100) + "%";
    });

    // Stage
    var stage = el("div", "typebe-stage");
    var card = el("div", "typebe-card");

    var sentence = el("div", "typebe-sentence");
    var labelParts = [];
    if (item.before) {
      sentence.appendChild(document.createTextNode(item.before + " "));
      labelParts.push(item.before);
    }
    var input = document.createElement("input");
    input.type = "text";
    input.className = "typebe-input";
    input.id = "typebe-input";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "off"); // we force exact case ourselves
    input.setAttribute("spellcheck", "false");
    // Wider box for multi-word negatives (am not / are not / aren't)
    var isLong = item.answer.indexOf(" ") !== -1 || item.answer.length > 4;
    input.setAttribute("maxlength", isLong ? "12" : "8");
    if (isLong) input.classList.add("is-long");
    input.setAttribute("aria-label", "Type the missing verb");
    var needsCap = item.answer[0] === item.answer[0].toUpperCase();
    input.placeholder = needsCap ? "A…" : (isLong ? "am not…" : "a…");
    sentence.appendChild(input);
    if (item.after) {
      sentence.appendChild(document.createTextNode(" " + item.after));
      labelParts.push(item.after);
    }
    sentence.setAttribute("aria-label", (item.before ? item.before + " " : "") + "blank " + item.after);
    card.appendChild(sentence);

    var hint = el("p", "typebe-hint");
    if (needsCap) {
      hint.textContent = "Start with a capital letter";
    } else if (isLong) {
      hint.textContent = "Type the full negative (am not / are not / aren't)";
    } else {
      hint.textContent = "Type the verb (lowercase)";
    }
    hint.id = "typebe-hint";
    card.appendChild(hint);

    var feedback = el("p", "typebe-feedback", "Type the missing word and press Enter");
    feedback.id = "typebe-feedback";
    feedback.setAttribute("aria-live", "polite");
    card.appendChild(feedback);
    stage.appendChild(card);

    // Check button
    var actions = el("div", "typebe-actions");
    var checkBtn = el("button", "typebe-check", "Check ✓");
    checkBtn.type = "button";
    checkBtn.id = "typebe-check";
    checkBtn.addEventListener("click", function () { checkAnswer(); });
    actions.appendChild(checkBtn);
    stage.appendChild(actions);

    wrap.appendChild(stage);
    app.appendChild(wrap);

    // Focus and key handlers
    input.focus();
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    // Soft force: if answer needs capital and user types first letter lowercase, keep it but show feedback later
    input.addEventListener("input", function () {
      if (locked) return;
      feedback.textContent = "Type the missing word and press Enter";
      feedback.className = "typebe-feedback";
      input.classList.remove("is-wrong", "is-right");
    });
  }

  function checkAnswer() {
    if (locked) return;
    var item = current();
    var input = document.getElementById("typebe-input");
    var feedback = document.getElementById("typebe-feedback");
    var hint = document.getElementById("typebe-hint");
    var checkBtn = document.getElementById("typebe-check");
    if (!input) return;

    var typed = normalize(input.value);
    if (!typed) {
      input.focus();
      feedback.textContent = "Type something first";
      feedback.className = "typebe-feedback is-bad";
      return;
    }

    var accepted = item.answers || [item.answer];
    var ok = false;
    var matched = item.answer;
    for (var i = 0; i < accepted.length; i++) {
      if (typed === accepted[i]) {
        ok = true;
        matched = accepted[i];
        break;
      }
    }

    var needsCapital = item.answer[0] === item.answer[0].toUpperCase();

    if (ok) {
      locked = true;
      if (!wrongOnCurrent) score++;
      sfxCorrect();
      input.classList.add("is-right");
      input.value = matched; // show the accepted form
      input.disabled = true;
      if (checkBtn) checkBtn.disabled = true;
      feedback.textContent = "✓ Correct! " + (item.before ? item.before + " " : "") + matched + " " + item.after;
      feedback.className = "typebe-feedback is-ok";
      if (hint) hint.textContent = "";
      setTimeout(nextItem, NEXT_DELAY);
    } else {
      wrongOnCurrent = true;
      sfxWrong();
      input.classList.add("is-wrong");

      // Helpful feedback
      var lowerTyped = typed.toLowerCase();
      var almostCapital = false;
      var almostForm = false;
      for (var j = 0; j < accepted.length; j++) {
        if (lowerTyped === accepted[j].toLowerCase()) {
          almostCapital = needsCapital;
          almostForm = true;
          matched = accepted[j];
          break;
        }
      }

      if (almostCapital) {
        feedback.textContent = "Almost! Start with a capital letter → " + matched;
      } else if (almostForm) {
        feedback.textContent = "Check the capital letter / spelling.";
      } else if (item.answer.indexOf(" ") !== -1 || item.answer === "aren't") {
        feedback.textContent = "Try: am not · are not · aren't";
      } else {
        feedback.textContent = "Not quite. Try again.";
      }
      feedback.className = "typebe-feedback is-bad";
      setTimeout(function () {
        input.classList.remove("is-wrong");
        input.select();
        input.focus();
      }, 450);
    }
  }

  function nextItem() {
    pos++;
    wrongOnCurrent = false;
    locked = false;
    if (pos >= ITEMS.length) return finish();
    render();
  }

  function finish() {
    var timeMs = hasFinish() ? LAFinish.stopTimer() : 0;
    var perfect = score === ITEMS.length;

    if (perfect && timeMs && window.LAStars && LAStars.saveBestTime) {
      try { LAStars.saveBestTime(GAME_ID, timeMs); } catch (e) {}
    }

    if (hasFinish()) {
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: ITEMS.length,
        timeMs: timeMs,
        onAgain: start,
        backHref: "../"
      });
      return;
    }

    if (window.LAStars && LAStars.recordPlay) {
      try { LAStars.recordPlay(GAME_ID); LAStars.saveFromAccuracy(GAME_ID, Math.round(score / ITEMS.length * 100)); } catch (e) {}
    }
    app.innerHTML = "";
    var done = el("div", "typebe-done");
    done.appendChild(el("h2", null, "Well done!"));
    done.appendChild(el("p", null, "You scored " + score + " / " + ITEMS.length + "."));
    var again = el("button", null, "Play again");
    again.type = "button";
    again.addEventListener("click", start);
    done.appendChild(again);
    var back = el("a", null, "Back to games");
    back.href = "../";
    done.appendChild(back);
    app.appendChild(done);
  }

  // Kick off
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
