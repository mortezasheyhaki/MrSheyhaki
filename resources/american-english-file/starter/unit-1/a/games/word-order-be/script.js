/* Word Order · be – American English File Starter Unit 1A */
(function () {
  "use strict";

  var GAME_ID = "starter-1a-word-order-be";
  var NEXT_DELAY = 1000;

  // Each item lists the words in their correct order (punctuation is its own word).
  var ITEMS = [
    { words: ["I", "am", "from", "Japan", "."] },
    { words: ["I", "am", "not", "a teacher", "."] },
    { words: ["are", "you", "a student", "?"] },
    { words: ["you", "are", "from", "Brazil", "."] },
    { words: ["I", "am", "in", "Room", "5", "."] },
    { words: ["you", "are", "not", "in", "Class", "2", "."] },
    { words: ["I", "am", "18", "years", "old", "."] },
    { words: ["are", "you", "my", "friend", "?"] },
    { words: ["I", "am", "not", "from", "Canada", "."] },
    { words: ["are", "you", "20", "years", "old", "?"] }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var pos = 0;
  var score = 0;
  var tiles = [];        // remaining tiles: [{ word, id }]
  var built = [];        // words placed so far
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
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
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
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function isPunct(w) { return w === "." || w === "?" || w === "!"; }
  function displayWord(w, i) { return i === 0 ? cap(w) : w; }
  // Join words into a sentence: no space before punctuation
  function sentenceText(words) {
    return words.map(function (w, i) { return displayWord(w, i); }).reduce(function (acc, w, i, arr) {
      if (i === 0) return w;
      return isPunct(arr[i]) ? acc + w : acc + " " + w;
    }, "");
  }
  function hasFinish() { return !!(window.LAFinish && LAFinish.show); }

  /* ---------- flow ---------- */
  function start() {
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    pos = 0;
    score = 0;
    if (hasFinish()) LAFinish.startTimer();
    if (window.ArcadeFX && ArcadeFX.reset) ArcadeFX.reset();
    loadSentence();
  }

  function current() { return ITEMS[order[pos]]; }

  function loadSentence() {
    var item = current();
    built = [];
    wrongOnCurrent = false;
    locked = false;
    tiles = shuffle(item.words.map(function (w, i) {
      return { word: w, label: i === 0 ? cap(w) : w, id: i, used: false };
    }));
    render();
  }

  function render() {
    var item = current();
    app.innerHTML = "";

    var wrap = el("div", "amor-game-inner");
    wrap.style.cssText = "display:flex;flex-direction:column;flex:1;width:100%";

    // Top bar
    var top = el("div", "amor-top");
    var back = el("a", "amor-back", "←");
    back.href = "../";
    back.setAttribute("aria-label", "Back to games");
    var titleBox = el("div", "amor-title");
    titleBox.appendChild(el("h1", null, "Word Order"));
    titleBox.appendChild(el("p", null, "Tap the words in the right order"));
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

    // Built sentence slots
    var slots = el("div", "wo-slots");
    slots.setAttribute("aria-live", "polite");
    item.words.forEach(function (w, i) {
      var s = el("span", "wo-slot" + (i < built.length ? " is-filled" : ""));
      if (i < built.length) {
        s.textContent = displayWord(built[i].word, i);
        if (isPunct(built[i].word)) s.classList.add("is-punct");
      }
      slots.appendChild(s);
    });
    card.appendChild(slots);

    var feedback = el("p", "amor-feedback", "Start with the first word");
    feedback.id = "amor-feedback";
    card.appendChild(feedback);
    stage.appendChild(card);

    // Tiles
    var tileBox = el("div", "wo-tiles");
    tiles.forEach(function (t) {
      var b = el("button", "wo-tile" + (t.used ? " is-used" : ""), t.label);
      b.type = "button";
      b.disabled = !!t.used;
      b.dataset.id = String(t.id);
      b.setAttribute("aria-label", t.label);
      b.addEventListener("click", function () { place(t.id, b); });
      tileBox.appendChild(b);
    });
    stage.appendChild(tileBox);

    wrap.appendChild(stage);
    app.appendChild(wrap);
  }

  function place(id, btn) {
    if (locked) return;
    var item = current();
    var expected = item.words[built.length];
    var tile = tiles.filter(function (t) { return t.id === id; })[0];
    if (!tile || tile.used) return;
    var feedback = document.getElementById("amor-feedback");

    if (tile.word === expected) {
      sfxTap();
      tile.used = true;
      built.push(tile);

      if (built.length === item.words.length) {
        // Sentence complete
        locked = true;
        if (!wrongOnCurrent) score++;
        sfxCorrect();
        render();
        var done = document.getElementById("amor-feedback");
        if (done) {
          done.textContent = "✓ Correct! " + sentenceText(item.words);
          done.className = "amor-feedback is-ok";
        }
        setTimeout(nextItem, NEXT_DELAY);
        return;
      }
      render();
      var fb = document.getElementById("amor-feedback");
      if (fb) fb.textContent = "Good! Next word";
      return;
    }

    // Wrong word
    wrongOnCurrent = true;
    sfxWrong();
    btn.classList.add("is-wrong");
    setTimeout(function () { btn.classList.remove("is-wrong"); }, 450);
    feedback.textContent = "Not that one. Look for the next word.";
    feedback.className = "amor-feedback is-bad";
  }

  function nextItem() {
    pos++;
    if (pos >= ITEMS.length) return finish();
    loadSentence();
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
