/* Write Questions & Answers – Present Continuous – Teen2Teen 2 Unit 2 */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-write-present-continuous";

  var ITEMS = [
    {
      id: "1",
      cueQ: "James / do homework?",
      cueA: "No, he / help his mom.",
      question: "Is James doing homework?",
      answer: "No, he's helping his mom.",
      altQ: [
        "Is James doing his homework?",
        "Is James doing the homework?"
      ],
      altA: [
        "No, he is helping his mom.",
        "No, he's helping his mum.",
        "No, he is helping his mum."
      ]
    },
    {
      id: "2",
      cueQ: "the girls / play with their cat and dog?",
      cueA: "No, they / eat lunch now.",
      question: "Are the girls playing with their cat and dog?",
      answer: "No, they're eating lunch now.",
      altQ: [
        "Are the girls playing with their dog and cat?"
      ],
      altA: [
        "No, they are eating lunch now.",
        "No, they're eating lunch.",
        "No, they are eating lunch."
      ]
    },
    {
      id: "3",
      cueQ: "you / talk on the phone?",
      cueA: "Yes, and I / listen to music, too.",
      question: "Are you talking on the phone?",
      answer: "Yes, and I'm listening to music, too.",
      altQ: [
        "Are you talking on the telephone?"
      ],
      altA: [
        "Yes, and I am listening to music, too.",
        "Yes, and I'm listening to music too.",
        "Yes and I'm listening to music, too.",
        "Yes, and I am listening to music too."
      ]
    },
    {
      id: "4",
      cueQ: "Mom and Dad / watch TV in the living room?",
      cueA: "Actually, Mom / help Adam with his homework, and Dad / shop.",
      question: "Are Mom and Dad watching TV in the living room?",
      answer: "Actually, Mom's helping Adam with his homework, and Dad's shopping.",
      altQ: [
        "Are Mum and Dad watching TV in the living room?",
        "Are Mom and Dad watching television in the living room?"
      ],
      altA: [
        "Actually, Mom is helping Adam with his homework, and Dad is shopping.",
        "Actually, Mum's helping Adam with his homework, and Dad's shopping.",
        "Actually, Mum is helping Adam with his homework, and Dad is shopping.",
        "Actually Mom's helping Adam with his homework, and Dad's shopping.",
        "Actually, Mom's helping Adam with his homework and Dad's shopping."
      ]
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var index = 0;
  var correctCount = 0;
  var locked = false;
  var qFeedback = "";
  var aFeedback = "";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/&/g, " and ")
      .replace(/\btv\b/g, "tv")
      .replace(/\btelevision\b/g, "tv")
      .replace(/\bmum\b/g, "mom")
      .replace(/\bmums\b/g, "moms")
      .replace(/[?!.,;:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function expandContractions(s) {
    return s
      .replace(/\bhe's\b/g, "he is")
      .replace(/\bshe's\b/g, "she is")
      .replace(/\bit's\b/g, "it is")
      .replace(/\bthey're\b/g, "they are")
      .replace(/\bwe're\b/g, "we are")
      .replace(/\byou're\b/g, "you are")
      .replace(/\bi'm\b/g, "i am")
      .replace(/\bmom's\b/g, "mom is")
      .replace(/\bdad's\b/g, "dad is")
      .replace(/\bisn't\b/g, "is not")
      .replace(/\baren't\b/g, "are not")
      .replace(/\bcan't\b/g, "cannot");
  }

  /** Canonical form used for comparison */
  function canonical(s) {
    var out = expandContractions(normalize(s));
    // optional filler words students often skip/add
    out = out.replace(/\b(please|just)\b/g, " ");
    out = out.replace(/\s+/g, " ").trim();
    return out;
  }

  function matches(user, target, alts) {
    var u = canonical(user);
    if (!u) return false;
    var candidates = [target].concat(alts || []);
    for (var i = 0; i < candidates.length; i++) {
      if (u === canonical(candidates[i])) return true;
    }
    return false;
  }

  var K = window.UAKit;
  function sfx(kind) { if (K) K.sfx(kind); }

  function current() {
    return ITEMS[index];
  }

  function startGame() {
    if (K) K.unlock();
    index = 0;
    correctCount = 0;
    locked = false;
    qFeedback = "";
    aFeedback = "";
    phase = "play";
    render();
  }

  function check() {
    if (locked) return;
    var item = current();
    var qEl = document.getElementById("wq-q");
    var aEl = document.getElementById("wq-a");
    var qVal = qEl ? qEl.value : "";
    var aVal = aEl ? aEl.value : "";
    if (!normalize(qVal) || !normalize(aVal)) return;

    locked = true;
    var qOk = matches(qVal, item.question, item.altQ);
    var aOk = matches(aVal, item.answer, item.altA);
    qFeedback = qOk ? "ok" : "bad";
    aFeedback = aOk ? "ok" : "bad";

    if (qOk && aOk) {
      correctCount++;
      sfx("correct");
    } else {
      sfx("wrong");
    }
    render(qVal, aVal);

    setTimeout(function () {
      if (index < ITEMS.length - 1) {
        index++;
        locked = false;
        qFeedback = "";
        aFeedback = "";
        render();
      } else {
        finishGame();
      }
    }, qOk && aOk ? 1100 : 1800);
  }

  function starsFromScore() {
    var total = ITEMS.length;
    var ratio = total ? correctCount / total : 0;
    if (ratio >= 1) return 3;
    if (ratio >= 0.5) return 2;
    if (correctCount > 0) return 1;
    return 0;
  }

  function saveStarsOnce() {
    var stars = starsFromScore();
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      } catch (_) {}
    }
    return stars;
  }

  function finishGame() {
    phase = "done";
    var stars = saveStarsOnce();
    sfx(stars >= 2 ? "win" : "lose");
    render();
    if (K) K.celebrate(app.querySelector(".ua-done"));
  }

  function showAnswer(item) {
    return (
      '<div class="wq-reveal">' +
      "<p><strong>Question:</strong> " +
      escapeHtml(item.question) +
      "</p>" +
      "<p><strong>Answer:</strong> " +
      escapeHtml(item.answer) +
      "</p>" +
      "</div>"
    );
  }

  function render(keepQ, keepA) {
    if (phase === "start") {
      app.innerHTML =
        K.topbar({ title: "Write Q &amp; A", pct: 0 }) +
        '<section class="wq-start ua-screen">' +
          '<div class="wq-hero" aria-hidden="true">✍️</div>' +
          "<h1>Write questions &amp; answers</h1>" +
          '<p class="wq-desc">Use the <strong>present continuous</strong>. Write the question and the answer for each prompt.</p>' +
          '<p class="wq-muted">4 items · type both lines</p>' +
          '<button type="button" class="ua-btn" id="wq-start">Start</button>' +
        "</section>";
      K.afterRender(app, "wq");
      document.getElementById("wq-start").onclick = function () { sfx("tap"); startGame(); };
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        K.topbar({ title: "Write Q &amp; A", count: ITEMS.length + "/" + ITEMS.length, pct: 100 }) +
        '<div class="ua-screen">' +
          K.done({ score: correctCount, total: ITEMS.length, stars: starsFromScore(), againId: "wq-again" }) +
        "</div>";
      K.afterRender(app, "wq");
      document.getElementById("wq-again").onclick = function () { sfx("tap"); startGame(); };
      return;
    }

    var item = current();
    var pct = (index / ITEMS.length) * 100;
    var qVal = keepQ != null ? keepQ : "";
    var aVal = keepA != null ? keepA : "";
    var bothBad = locked && (qFeedback === "bad" || aFeedback === "bad");

    app.innerHTML =
      K.topbar({ title: "Write Q &amp; A", count: (index + 1) + " / " + ITEMS.length, pct: pct }) +
      '<section class="wq-card ua-screen">' +
        '<p class="wq-num">Item ' + (index + 1) + "</p>" +
        '<div class="wq-cues">' +
          '<p class="wq-cue"><span class="wq-cue-label">Prompt</span>' + escapeHtml(item.cueQ) + "</p>" +
          '<p class="wq-cue"><span class="wq-cue-label">Prompt</span>' + escapeHtml(item.cueA) + "</p>" +
        "</div>" +
        '<label class="wq-label" for="wq-q">Question</label>' +
        '<input type="text" class="wq-input' + (qFeedback ? " is-" + qFeedback : "") +
          '" id="wq-q" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="true" placeholder="Write the question…" value="' +
          escapeHtml(qVal) + '"' + (locked ? " readonly" : "") + " />" +
        '<label class="wq-label" for="wq-a">Answer</label>' +
        '<input type="text" class="wq-input' + (aFeedback ? " is-" + aFeedback : "") +
          '" id="wq-a" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="true" placeholder="Write the answer…" value="' +
          escapeHtml(aVal) + '"' + (locked ? " readonly" : "") + " />" +
        (bothBad ? showAnswer(item) : "") +
        '<button type="button" class="ua-btn wq-check" id="wq-check"' + (locked ? " disabled" : "") + ">Check</button>" +
      "</section>";

    K.afterRender(app, "wq");

    var qEl = document.getElementById("wq-q");
    var aEl = document.getElementById("wq-a");
    var checkBtn = document.getElementById("wq-check");

    if (locked) {
      var card = app.querySelector(".wq-card");
      if (K && bothBad === false) K.flash(card, "ok"); else if (K) K.flash(card, "bad");
    }

    function updateCheck() {
      if (locked) return;
      checkBtn.disabled = !(normalize(qEl.value) && normalize(aEl.value));
    }
    qEl.addEventListener("input", updateCheck);
    aEl.addEventListener("input", updateCheck);
    qEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); aEl.focus(); }
    });
    aEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); check(); }
    });
    checkBtn.onclick = check;
    updateCheck();
    if (!locked) setTimeout(function () { qEl.focus(); }, 50);
  }

  render();
})();
