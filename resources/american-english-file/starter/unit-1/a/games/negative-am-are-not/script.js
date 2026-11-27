/* Negative forms (am not / are not) – American English File Starter Unit 1A */
(function () {
  "use strict";

  var GAME_ID = "starter-1a-negative-am-are-not";
  var NEXT_DELAY = 900;

  // Each item: subject pronoun, the sentence before and after the two blanks, and the answer phrase.
  var ITEMS = [
    { pron: "I",   before: "I",   after: "a teacher.",       answer: "am not" },
    { pron: "I",   before: "I",   after: "from Canada.",     answer: "am not" },
    { pron: "I",   before: "I",   after: "in Room 3.",       answer: "am not" },
    { pron: "I",   before: "I",   after: "25 years old.",    answer: "am not" },
    { pron: "I",   before: "I",   after: "from New York.",   answer: "am not" },
    { pron: "You", before: "You", after: "a doctor.",        answer: "are not" },
    { pron: "You", before: "You", after: "from Spain.",      answer: "are not" },
    { pron: "You", before: "You", after: "in Class 2.",      answer: "are not" },
    { pron: "You", before: "You", after: "my teacher.",      answer: "are not" },
    { pron: "You", before: "You", after: "30 years old.",    answer: "are not" }
  ];
  var CHOICES = ["am not", "are not"];

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
    var words = item.answer.split(" ");
    app.innerHTML = "";

    var wrap = el("div", "amor-game-inner");
    wrap.style.cssText = "display:flex;flex-direction:column;flex:1;width:100%";

    // Top bar
    var top = el("div", "amor-top");
    var back = el("a", "amor-back", "←");
    back.href = "../";
    back.setAttribute("aria-label", "Back to games");
    var titleBox = el("div", "amor-title");
    titleBox.appendChild(el("h1", null, "Negative Forms"));
    titleBox.appendChild(el("p", null, "Complete with am not or are not"));
    var count = el("div", "amor-count", (pos + 1) + " / " + ITEMS.length);
    count.setAttribute("aria-live", "polite");
    top.appendChild(back);
    top.appendChild(titleBox);
    top.appendChild(count);
    wrap.appendChild(top);

    // Progress
    var bar = el("div", "amor-progress");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(ITEMS.length));
    bar.setAttribute("aria-valuenow", String(pos));
    var fill = el("div", "amor-progress-fill");
    bar.appendChild(fill);
    wrap.appendChild(bar);
    requestAnimationFrame(function () {
      fill.style.width = Math.round((pos / ITEMS.length) * 100) + "%";
    });

    // Stage
    var stage = el("div", "amor-stage");
    var card = el("div", "amor-card");
    card.appendChild(el("span", "amor-pron", item.pron));

    var sentence = el("div", "amor-sentence");
    sentence.setAttribute("aria-label", item.before + " blank blank " + item.after);
    sentence.appendChild(document.createTextNode(item.before + " "));
    words.forEach(function (_, i) {
      var b = el("span", "amor-blank", "___");
      b.setAttribute("data-slot", String(i));
      sentence.appendChild(b);
    });
    sentence.appendChild(document.createTextNode(" " + item.after));
    card.appendChild(sentence);

    var feedback = el("p", "amor-feedback", "Tap the correct phrase");
    feedback.id = "amor-feedback";
    feedback.setAttribute("aria-live", "polite");
    card.appendChild(feedback);
    stage.appendChild(card);

    // Chips
    var chips = el("div", "amor-chips");
    CHOICES.forEach(function (phrase) {
      var b = el("button", "amor-chip", phrase);
      b.type = "button";
      b.dataset.word = phrase;
      b.setAttribute("aria-label", "Choose " + phrase);
      b.addEventListener("click", function () { choose(phrase, b); });
      chips.appendChild(b);
    });
    stage.appendChild(chips);

    wrap.appendChild(stage);
    app.appendChild(wrap);
  }

  function choose(phrase, btn) {
    if (locked) return;
    var item = current();
    var feedback = document.getElementById("amor-feedback");
    var blanks = app.querySelectorAll(".amor-blank");
    var chips = app.querySelectorAll(".amor-chip");

    if (phrase === item.answer) {
      locked = true;
      if (!wrongOnCurrent) score++;
      sfxCorrect();
      btn.classList.add("is-right");
      chips.forEach(function (c) { if (c !== btn) c.classList.add("is-dim"); c.disabled = true; });
      item.answer.split(" ").forEach(function (w, i) {
        blanks[i].textContent = w;
        blanks[i].classList.add("is-filled");
      });
      feedback.textContent = "✓ Correct! " + item.before + " " + item.answer + " " + item.after;
      feedback.className = "amor-feedback is-ok";
      setTimeout(nextItem, NEXT_DELAY);
    } else {
      wrongOnCurrent = true;
      sfxWrong();
      btn.classList.add("is-wrong");
      blanks.forEach(function (b) {
        b.classList.remove("is-empty-flash");
        void b.offsetWidth;
        b.classList.add("is-empty-flash");
      });
      feedback.textContent = "Not quite. Try the other one.";
      feedback.className = "amor-feedback is-bad";
      setTimeout(function () { btn.classList.remove("is-wrong"); }, 450);
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

    // Record best time only for a perfect run
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

    // Fallback summary
    if (window.LAStars && LAStars.recordPlay) {
      try { LAStars.recordPlay(GAME_ID); LAStars.saveFromAccuracy(GAME_ID, Math.round(score / ITEMS.length * 100)); } catch (e) {}
    }
    app.innerHTML = "";
    var done = el("div", "amor-done");
    done.appendChild(el("h2", null, "Well done!"));
    done.appendChild(el("p", null, "You scored " + score + " / " + ITEMS.length + "."));
    var again = el("button", null, "Play again");
    again.type = "button";
    again.addEventListener("click", start);
    done.appendChild(again);
    app.appendChild(done);
  }

  start();
})();
