/* Write am / are – American English File Starter Unit 1A
   Show the blanked sentence (I / from Italy.) above the box.
   Players type the FULL sentence (I'm from Italy. / I am from Italy.).
   Clear Positive / Negative / Question badges. */
(function () {
  "use strict";

  var GAME_ID = "starter-1a-write-am-are";
  var NEXT_DELAY = 1200;

  /**
   * prompt  = what the student sees (with / blank)
   * type    = "positive" | "negative" | "question"
   * answers = accepted full sentences (exact case + punctuation)
   */
  var ITEMS = [
    {
      type: "positive",
      prompt: "I / from Italy.",
      answers: ["I'm from Italy.", "I am from Italy."]
    },
    {
      type: "negative",
      prompt: "You / from Japan.",
      answers: [
        "You aren't from Japan.",
        "You are not from Japan.",
        "You're not from Japan."
      ]
    },
    {
      type: "question",
      prompt: "/ I a student?",
      answers: ["Am I a student?"]
    },
    {
      type: "positive",
      prompt: "You / in Room 10.",
      answers: ["You're in Room 10.", "You are in Room 10."]
    },
    {
      type: "negative",
      prompt: "I / 25 years old.",
      answers: ["I'm not 25 years old.", "I am not 25 years old."]
    },
    {
      type: "positive",
      prompt: "You / my friend.",
      answers: ["You're my friend.", "You are my friend."]
    },
    {
      type: "question",
      prompt: "/ I in English class?",
      answers: ["Am I in English class?"]
    },
    {
      type: "negative",
      prompt: "I / from New York.",
      answers: ["I'm not from New York.", "I am not from New York."]
    },
    {
      type: "question",
      prompt: "/ you a teacher?",
      answers: ["Are you a teacher?"]
    },
    {
      type: "positive",
      prompt: "I / 19 years old.",
      answers: ["I'm 19 years old.", "I am 19 years old."]
    }
  ];

  var TYPE_META = {
    positive: {
      label: "Positive",
      symbol: "+",
      hint: "Write the full positive sentence (I'm / I am …)"
    },
    negative: {
      label: "Negative",
      symbol: "−",
      hint: "Write the full negative sentence (I'm not / aren't …)"
    },
    question: {
      label: "Question",
      symbol: "?",
      hint: "Write the full question (Am I…? / Are you…?)"
    }
  };

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var pos = 0;
  var score = 0;
  var wrongOnCurrent = false;
  var locked = false;

  /* ---------- sound ---------- */
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
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
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
    return (s || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[’‘]/g, "'"); // normalize curly apostrophes
  }

  /* ---------- flow ---------- */
  function start() {
    order = shuffle(
      ITEMS.map(function (_, i) {
        return i;
      })
    );
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
    var meta = TYPE_META[item.type] || TYPE_META.positive;
    app.innerHTML = "";

    var wrap = el("div", "typebe-game-inner");
    wrap.style.cssText =
      "display:flex;flex-direction:column;flex:1;width:100%";

    // Top bar
    var top = el("div", "typebe-top");
    var back = el("a", "typebe-back", "←");
    back.href = "../";
    back.setAttribute("aria-label", "Back to games");

    var titleBox = el("div", "typebe-title");
    titleBox.appendChild(el("h1", null, "Write am / are"));
    titleBox.appendChild(
      el("p", null, "Write the full sentence")
    );

    var count = el(
      "div",
      "typebe-count",
      pos + 1 + " / " + ITEMS.length
    );
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
      fill.style.width =
        Math.round((pos / ITEMS.length) * 100) + "%";
    });

    // Stage
    var stage = el("div", "typebe-stage");
    var card = el("div", "typebe-card");

    // Type badge
    var badge = el("div", "typebe-badge typebe-badge--" + item.type);
    badge.appendChild(el("span", "typebe-badge-symbol", meta.symbol));
    badge.appendChild(el("span", "typebe-badge-label", meta.label));
    badge.setAttribute("aria-label", "Sentence type: " + meta.label);
    card.appendChild(badge);

    // Prompt sentence with / blank (shown ABOVE the input)
    var promptEl = el("div", "typebe-prompt");
    promptEl.id = "typebe-prompt";
    // Highlight the slash
    var parts = item.prompt.split("/");
    if (parts.length === 2) {
      if (parts[0]) {
        promptEl.appendChild(document.createTextNode(parts[0]));
      }
      var slash = el("span", "typebe-slash", "/");
      promptEl.appendChild(slash);
      if (parts[1]) {
        promptEl.appendChild(document.createTextNode(parts[1]));
      }
    } else {
      promptEl.textContent = item.prompt;
    }
    card.appendChild(promptEl);

    // Full-sentence input box
    var inputWrap = el("div", "typebe-input-wrap");
    var input = document.createElement("input");
    input.type = "text";
    input.className = "typebe-input typebe-input-full";
    input.id = "typebe-input";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "sentences");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("aria-label", "Type the full sentence");
    input.setAttribute("maxlength", "60");
    input.placeholder = "Type the full sentence here…";
    inputWrap.appendChild(input);
    card.appendChild(inputWrap);

    // Hint
    var hint = el("p", "typebe-hint", meta.hint);
    hint.id = "typebe-hint";
    card.appendChild(hint);

    // Feedback
    var feedback = el(
      "p",
      "typebe-feedback",
      "Type the full sentence and press Enter"
    );
    feedback.id = "typebe-feedback";
    card.appendChild(feedback);

    stage.appendChild(card);

    // Check button
    var actions = el("div", "typebe-actions");
    var checkBtn = el("button", "typebe-check", "Check ✓");
    checkBtn.type = "button";
    checkBtn.id = "typebe-check";
    checkBtn.addEventListener("click", checkAnswer);
    actions.appendChild(checkBtn);
    stage.appendChild(actions);

    wrap.appendChild(stage);
    app.appendChild(wrap);

    // Focus + keyboard
    input.focus();
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    input.addEventListener("input", function () {
      if (locked) return;
      feedback.textContent = "Type the full sentence and press Enter";
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

    // Accept answers (also tolerate missing final . or ?)
    var accepted = item.answers.slice();
    var extra = [];
    accepted.forEach(function (a) {
      extra.push(a.replace(/[.?!]$/, ""));
    });
    accepted = accepted.concat(extra);

    var ok = false;
    var matched = item.answers[0];
    for (var i = 0; i < accepted.length; i++) {
      if (typed === normalize(accepted[i])) {
        ok = true;
        // Prefer the version with proper punctuation from original list
        matched =
          item.answers.find(function (a) {
            return normalize(a.replace(/[.?!]$/, "")) === typed || normalize(a) === typed;
          }) || accepted[i];
        break;
      }
    }

    if (ok) {
      locked = true;
      if (!wrongOnCurrent) score++;
      sfxCorrect();
      input.classList.add("is-right");
      input.value = matched;
      input.disabled = true;
      if (checkBtn) checkBtn.disabled = true;
      feedback.textContent = "✓ Correct! " + matched;
      feedback.className = "typebe-feedback is-ok";
      if (hint) hint.textContent = "";
      setTimeout(nextItem, NEXT_DELAY);
    } else {
      wrongOnCurrent = true;
      sfxWrong();
      input.classList.add("is-wrong");

      // Helpful feedback
      var lower = typed.toLowerCase();
      var almost = false;
      var capitalIssue = false;
      for (var j = 0; j < item.answers.length; j++) {
        var ans = item.answers[j];
        if (lower === ans.toLowerCase() || lower === ans.toLowerCase().replace(/[.?!]$/, "")) {
          almost = true;
          if (typed[0] !== ans[0] && typed[0].toLowerCase() === ans[0].toLowerCase()) {
            capitalIssue = true;
          }
          matched = ans;
          break;
        }
      }

      if (capitalIssue) {
        feedback.textContent =
          "Almost! Check the capital letter → " + matched;
      } else if (almost) {
        feedback.textContent = "Almost! Check spelling / punctuation.";
      } else if (item.type === "negative") {
        feedback.textContent =
          "Try a full negative: I'm not… / You aren't…";
      } else if (item.type === "question") {
        feedback.textContent =
          "Questions start with Am / Are (capital letter)";
      } else {
        feedback.textContent =
          "Write the full sentence (e.g. I'm from Italy.)";
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
      try {
        LAStars.saveBestTime(GAME_ID, timeMs);
      } catch (e) {}
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
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(
          GAME_ID,
          Math.round((score / ITEMS.length) * 100)
        );
      } catch (e) {}
    }
    app.innerHTML = "";
    var done = el("div", "typebe-done");
    done.appendChild(el("h2", null, "Well done!"));
    done.appendChild(
      el("p", null, "You scored " + score + " / " + ITEMS.length + ".")
    );
    var again = el("button", null, "Play again");
    again.type = "button";
    again.addEventListener("click", start);
    done.appendChild(again);
    var back = el("a", null, "Back to games");
    back.href = "../";
    done.appendChild(back);
    app.appendChild(done);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
