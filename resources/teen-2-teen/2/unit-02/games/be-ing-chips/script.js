/* Be + -ing Chips – Present Continuous – Teen2Teen 2 Unit 2
   Fun, streaky, emoji-powered sentence completer */
(function () {
  "use strict";

  var GAME_ID = "t2t2-u2-be-ing-chips";
  var TIMER_SECONDS = 60;
  var ENCOURAGE_EVERY = 10;

  /* ---------- 50 sentences with emoji flavour ---------- */
  var SENTENCES = [
    { subject: "I", be: "am", verb: "eating", rest: "breakfast.", emoji: "🍳" },
    { subject: "She", be: "is", verb: "reading", rest: "a book.", emoji: "📖" },
    { subject: "He", be: "is", verb: "watching", rest: "TV.", emoji: "📺" },
    { subject: "They", be: "are", verb: "playing", rest: "soccer.", emoji: "⚽" },
    { subject: "We", be: "are", verb: "listening", rest: "to music.", emoji: "🎧" },
    { subject: "You", be: "are", verb: "writing", rest: "a letter.", emoji: "✉️" },
    { subject: "The dog", be: "is", verb: "sleeping", rest: ".", emoji: "🐶" },
    { subject: "My mom", be: "is", verb: "cooking", rest: "dinner.", emoji: "👩‍🍳" },
    { subject: "Dad", be: "is", verb: "driving", rest: "the car.", emoji: "🚗" },
    { subject: "The children", be: "are", verb: "drawing", rest: "pictures.", emoji: "🎨" },
    { subject: "I", be: "am", verb: "drinking", rest: "water.", emoji: "💧" },
    { subject: "She", be: "is", verb: "talking", rest: "on the phone.", emoji: "📱" },
    { subject: "He", be: "is", verb: "running", rest: "in the park.", emoji: "🏃" },
    { subject: "They", be: "are", verb: "studying", rest: "English.", emoji: "📚" },
    { subject: "We", be: "are", verb: "walking", rest: "to school.", emoji: "🏫" },
    { subject: "You", be: "are", verb: "smiling", rest: ".", emoji: "😊" },
    { subject: "The baby", be: "is", verb: "crying", rest: ".", emoji: "👶" },
    { subject: "My sister", be: "is", verb: "dancing", rest: ".", emoji: "💃" },
    { subject: "My brother", be: "is", verb: "playing", rest: "video games.", emoji: "🎮" },
    { subject: "The cat", be: "is", verb: "sitting", rest: "on the chair.", emoji: "🐱" },
    { subject: "I", be: "am", verb: "wearing", rest: "a blue shirt.", emoji: "👕" },
    { subject: "She", be: "is", verb: "brushing", rest: "her teeth.", emoji: "🪥" },
    { subject: "He", be: "is", verb: "washing", rest: "the dishes.", emoji: "🍽️" },
    { subject: "They", be: "are", verb: "cleaning", rest: "the house.", emoji: "🧹" },
    { subject: "We", be: "are", verb: "having", rest: "lunch.", emoji: "🥗" },
    { subject: "You", be: "are", verb: "looking", rest: "at the sky.", emoji: "🌤️" },
    { subject: "The teacher", be: "is", verb: "explaining", rest: "the lesson.", emoji: "👩‍🏫" },
    { subject: "My friend", be: "is", verb: "calling", rest: "me.", emoji: "📞" },
    { subject: "The birds", be: "are", verb: "singing", rest: ".", emoji: "🐦" },
    { subject: "People", be: "are", verb: "waiting", rest: "for the bus.", emoji: "🚌" },
    { subject: "I", be: "am", verb: "opening", rest: "the door.", emoji: "🚪" },
    { subject: "She", be: "is", verb: "closing", rest: "the window.", emoji: "🪟" },
    { subject: "He", be: "is", verb: "buying", rest: "some fruit.", emoji: "🍎" },
    { subject: "They", be: "are", verb: "selling", rest: "tickets.", emoji: "🎫" },
    { subject: "We", be: "are", verb: "taking", rest: "photos.", emoji: "📷" },
    { subject: "You", be: "are", verb: "holding", rest: "a bag.", emoji: "👜" },
    { subject: "The boy", be: "is", verb: "kicking", rest: "the ball.", emoji: "⚽" },
    { subject: "The girl", be: "is", verb: "jumping", rest: ".", emoji: "🤸" },
    { subject: "Mom", be: "is", verb: "helping", rest: "me.", emoji: "🤝" },
    { subject: "Dad", be: "is", verb: "fixing", rest: "the bike.", emoji: "🔧" },
    { subject: "I", be: "am", verb: "thinking", rest: "about you.", emoji: "💭" },
    { subject: "She", be: "is", verb: "laughing", rest: ".", emoji: "😂" },
    { subject: "He", be: "is", verb: "standing", rest: "near the door.", emoji: "🧍" },
    { subject: "They", be: "are", verb: "sitting", rest: "on the floor.", emoji: "🪑" },
    { subject: "We", be: "are", verb: "swimming", rest: "in the pool.", emoji: "🏊" },
    { subject: "You", be: "are", verb: "riding", rest: "a bicycle.", emoji: "🚲" },
    { subject: "The sun", be: "is", verb: "shining", rest: ".", emoji: "☀️" },
    { subject: "It", be: "is", verb: "raining", rest: ".", emoji: "🌧️" },
    { subject: "The students", be: "are", verb: "answering", rest: "questions.", emoji: "🙋" },
    { subject: "Everybody", be: "is", verb: "having", rest: "fun.", emoji: "🎉" }
  ];

  var BE_POOL = ["am", "is", "are"];
  var VERB_POOL = SENTENCES.map(function (s) { return s.verb; }).filter(function (v, i, a) {
    return a.indexOf(v) === i;
  });

  var PRAISE = [
    "Nice!", "Yes!", "Awesome!", "Perfect!", "Great!", "Spot on!",
    "You got it!", "Brilliant!", "Super!", "Boom!", "Yes!", "Cool!"
  ];
  var OOPS = [
    "Oops! Try again", "Not quite…", "Almost!", "Hmm, try again",
    "Nope — swap them!", "Close, but no"
  ];
  var ENCOURAGE_MSGS = [
    { emoji: "🔥", title: "You're on fire!", text: "10 correct answers. Keep the streak going!" },
    { emoji: "⚡", title: "Unstoppable!", text: "20 correct! Your brain is glowing." },
    { emoji: "🚀", title: "Rocket mode!", text: "30 correct. Nobody can catch you!" },
    { emoji: "🏆", title: "Champion vibes!", text: "40 correct. Absolute legend." },
    { emoji: "🌟", title: "Superstar!", text: "50 correct? You're rewriting the rules!" }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var K = window.UAKit;

  var S = {
    phase: "start",
    order: [],
    index: 0,
    correct: 0,
    attempted: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    slots: [null, null],
    chips: [],
    locked: false,
    feedback: "",
    feedbackKind: "",
    timeLeft: TIMER_SECONDS,
    timerId: null,
    paused: false,
    encourageShown: 0,
    lastEncourageAt: 0,
    comboText: "",
    showCombo: false
  };

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function sfx(name) {
    if (K && typeof K.sfx === "function") K.sfx(name);
  }

  function current() {
    return SENTENCES[S.order[S.index]];
  }

  function progressPct() {
    if (S.phase === "done") return 100;
    if (S.phase === "start") return 0;
    var n = S.order.length || SENTENCES.length;
    return Math.round((S.index / n) * 100);
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ---------- floating emoji burst ---------- */
  function burst(emojis, count) {
    var layer = document.createElement("div");
    layer.className = "bic-fx";
    var list = emojis || ["✨", "⭐", "🎉", "💜", "🔥"];
    for (var i = 0; i < (count || 8); i++) {
      var p = document.createElement("i");
      p.textContent = list[i % list.length];
      p.style.left = (15 + Math.random() * 70) + "%";
      p.style.top = (40 + Math.random() * 30) + "%";
      p.style.animationDelay = (Math.random() * 0.25) + "s";
      p.style.fontSize = (1.1 + Math.random() * 0.8) + "rem";
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 1200);
  }

  /* ---------- chips ---------- */

  function buildChips(item) {
    var wrongBe = BE_POOL.filter(function (b) { return b !== item.be; });
    var wrongBePick = wrongBe[Math.floor(Math.random() * wrongBe.length)];
    var wrongVerbs = VERB_POOL.filter(function (v) { return v !== item.verb; });
    var wrongVerb = wrongVerbs[Math.floor(Math.random() * wrongVerbs.length)];

    return shuffle([
      { text: item.be, type: "be", used: false },
      { text: item.verb, type: "ing", used: false },
      { text: wrongBePick, type: "be", used: false },
      { text: wrongVerb, type: "ing", used: false }
    ]);
  }

  function loadItem() {
    var item = current();
    S.slots = [null, null];
    S.chips = buildChips(item);
    S.locked = false;
    S.feedback = "";
    S.feedbackKind = "";
    S.showCombo = false;
    S.comboText = "";
  }

  /* ---------- timer ---------- */

  function clearTimer() {
    if (S.timerId) {
      clearInterval(S.timerId);
      S.timerId = null;
    }
  }

  function startTimer() {
    clearTimer();
    S.timerId = setInterval(function () {
      if (S.paused || S.phase !== "play") return;
      S.timeLeft--;
      updateTimerUI();
      if (S.timeLeft <= 0) {
        clearTimer();
        finishGame();
      }
    }, 1000);
  }

  function updateTimerUI() {
    var el = app.querySelector("[data-timer]");
    if (!el) return;
    el.textContent = formatTime(S.timeLeft);
    var wrap = el.closest(".bic-timer-wrap");
    if (wrap) {
      if (S.timeLeft <= 10) wrap.classList.add("is-low");
      else wrap.classList.remove("is-low");
    }
  }

  /* ---------- game flow ---------- */

  function startGame() {
    if (K && K.unlock) K.unlock();
    S.order = shuffle(SENTENCES.map(function (_, i) { return i; }));
    S.index = 0;
    S.correct = 0;
    S.attempted = 0;
    S.score = 0;
    S.streak = 0;
    S.bestStreak = 0;
    S.timeLeft = TIMER_SECONDS;
    S.paused = false;
    S.encourageShown = 0;
    S.lastEncourageAt = 0;
    S.phase = "play";
    loadItem();
    render();
    startTimer();
  }

  function placeChip(chipIndex) {
    if (S.locked || S.phase !== "play") return;
    var chip = S.chips[chipIndex];
    if (!chip || chip.used) return;

    var slotIdx = S.slots[0] === null ? 0 : S.slots[1] === null ? 1 : -1;
    if (slotIdx < 0) return;

    chip.used = true;
    S.slots[slotIdx] = chip.text;
    sfx("place");
    render();

    if (S.slots[0] !== null && S.slots[1] !== null) {
      checkAnswer();
    }
  }

  function clearSlot(slotIdx) {
    if (S.locked || S.phase !== "play") return;
    var text = S.slots[slotIdx];
    if (!text) return;
    S.slots[slotIdx] = null;
    for (var i = 0; i < S.chips.length; i++) {
      if (S.chips[i].text === text && S.chips[i].used) {
        S.chips[i].used = false;
        break;
      }
    }
    sfx("undo");
    S.feedback = "";
    S.feedbackKind = "";
    render();
  }

  function checkAnswer() {
    if (S.locked) return;
    S.locked = true;
    S.attempted++;
    var item = current();
    var ok = S.slots[0] === item.be && S.slots[1] === item.verb;

    if (ok) {
      S.correct++;
      S.streak++;
      if (S.streak > S.bestStreak) S.bestStreak = S.streak;

      // Score: base 10 + streak bonus
      var bonus = Math.min(S.streak - 1, 5) * 2;
      var gained = 10 + bonus;
      S.score += gained;

      S.feedback = pick(PRAISE) + (bonus > 0 ? " +" + gained : "");
      S.feedbackKind = "ok";

      if (S.streak >= 3) {
        S.comboText = S.streak + " streak! 🔥";
        S.showCombo = true;
      }

      sfx("correct");
      burst([item.emoji, "✨", "⭐", "💜"], S.streak >= 5 ? 12 : 7);
      render();

      // Encouragement milestone
      if (S.correct > 0 && S.correct % ENCOURAGE_EVERY === 0 && S.correct !== S.lastEncourageAt) {
        S.lastEncourageAt = S.correct;
        setTimeout(function () { showEncourage(); }, 800);
        return;
      }

      setTimeout(nextItem, 900);
    } else {
      S.streak = 0;
      S.feedback = pick(OOPS);
      S.feedbackKind = "bad";
      sfx("wrong");
      render();
      setTimeout(function () {
        S.slots = [null, null];
        S.chips.forEach(function (c) { c.used = false; });
        S.locked = false;
        S.feedback = "";
        S.feedbackKind = "";
        render();
      }, 950);
    }
  }

  function nextItem() {
    if (S.index >= S.order.length - 1) {
      finishGame();
      return;
    }
    S.index++;
    loadItem();
    render();
  }

  function showEncourage() {
    S.paused = true;
    S.phase = "encourage";
    sfx("win");
    burst(["🎉", "🔥", "⭐", "🏆", "💜", "✨"], 16);
    render();
  }

  function continueAfterEncourage() {
    S.paused = false;
    S.phase = "play";
    S.encourageShown++;
    nextItem();
  }

  function starsFromScore() {
    if (S.correct >= 18 && S.bestStreak >= 5) return 3;
    if (S.correct >= 10 && S.bestStreak >= 3) return 2;
    if (S.correct >= 4) return 1;
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
    clearTimer();
    S.phase = "done";
    S.paused = true;
    var stars = saveStarsOnce();
    sfx(stars >= 2 ? "win" : "lose");
    if (stars >= 2) burst(["🏆", "⭐", "🎉", "💜"], 14);
    render();
    if (K && K.celebrate) {
      var host = app.querySelector(".bic-screen") || app;
      K.celebrate(host);
    }
  }

  /* ---------- render ---------- */

  function render() {
    if (S.phase === "start") {
      app.innerHTML =
        (K ? K.topbar({ title: "Be + -ing", kicker: "Teen2Teen 2 · Unit 2", pct: 0, back: "../" }) : "") +
        '<section class="bic-screen">' +
          '<div class="bic-hero" aria-hidden="true">🧩</div>' +
          "<h1>Chip Champion!</h1>" +
          '<p class="bic-desc">Build present continuous sentences by tapping the right <strong>be</strong> verb and <strong>-ing</strong> verb. Race the clock, build streaks, score big!</p>' +
          '<div class="bic-meta">' +
            "<span>50 sentences</span>" +
            "<span>⏱️ 60 sec</span>" +
            "<span>🔥 streaks</span>" +
          "</div>" +
          '<button type="button" class="ua-btn" data-act="start">Let\'s go!</button>' +
        "</section>";
      if (K) K.afterRender(app, GAME_ID);
      bind();
      return;
    }

    if (S.phase === "encourage") {
      var m = ENCOURAGE_MSGS[Math.min(S.encourageShown, ENCOURAGE_MSGS.length - 1)];
      app.innerHTML =
        (K ? K.topbar({ title: "Be + -ing", kicker: "Teen2Teen 2 · Unit 2", pct: progressPct(), back: "../", count: S.correct + " ✓" }) : "") +
        '<div class="bic-encourage" role="dialog" aria-modal="true">' +
          '<div class="bic-encourage-card">' +
            '<div class="bic-encourage-emoji">' + m.emoji + "</div>" +
            "<h2>" + esc(m.title) + "</h2>" +
            "<p>" + esc(m.text) + "</p>" +
            '<button type="button" class="ua-btn" data-act="continue">Keep going! →</button>' +
          "</div>" +
        "</div>";
      if (K) K.afterRender(app, GAME_ID);
      bind();
      return;
    }

    if (S.phase === "done") {
      var stars = starsFromScore();
      var msg =
        stars === 3 ? "Legendary!" :
        stars === 2 ? "Awesome run!" :
        stars === 1 ? "Nice effort!" : "Practice makes perfect!";
      app.innerHTML =
        (K ? K.topbar({ title: "Be + -ing", kicker: "Teen2Teen 2 · Unit 2", pct: 100, back: "../" }) : "") +
        '<section class="bic-screen">' +
          '<div class="bic-hero" aria-hidden="true">' + (stars >= 2 ? "🏆" : "🎉") + "</div>" +
          "<h1>" + esc(msg) + "</h1>" +
          '<div class="ua-stars" aria-label="' + stars + ' of 3 stars">' +
            [1, 2, 3].map(function (n) {
              return '<span class="' + (n <= stars ? "on" : "") + '">★</span>';
            }).join("") +
          "</div>" +
          '<div class="bic-done-stats">' +
            '<div class="bic-done-stat"><small>Correct</small><strong>' + S.correct + "</strong></div>" +
            '<div class="bic-done-stat"><small>Score</small><strong>' + S.score + "</strong></div>" +
            '<div class="bic-done-stat"><small>Best streak</small><strong>' + S.bestStreak + "🔥</strong></div>" +
          "</div>" +
          '<div class="ua-done-actions" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
            '<button type="button" class="ua-btn" data-act="again">Play again</button>' +
            '<a class="ua-btn ua-btn--ghost" href="../">Back to games</a>' +
          "</div>" +
        "</section>";
      if (K) K.afterRender(app, GAME_ID);
      bind();
      return;
    }

    /* play */
    var item = current();
    var timerLow = S.timeLeft <= 10;
    var streakHot = S.streak >= 5;

    var sentenceHtml =
      '<span class="bic-word">' + esc(item.subject) + "</span>" +
      slotHtml(0) +
      slotHtml(1) +
      (item.rest ? '<span class="bic-word">' + esc(item.rest) + "</span>" : "");

    var chipsHtml = S.chips.map(function (c, i) {
      var cls = "bic-chip" +
        (c.type === "be" ? " is-be" : " is-ing") +
        (c.used ? " is-used" : "");
      return (
        '<button type="button" class="' + cls + '" data-act="chip" data-i="' + i + '"' +
        (c.used || S.locked ? " disabled" : "") +
        ' aria-label="' + esc(c.text) + '">' +
        esc(c.text) +
        "</button>"
      );
    }).join("");

    var fbCls = S.feedbackKind ? " is-" + S.feedbackKind : "";
    var cardCls = S.feedbackKind === "ok" ? " is-ok" : S.feedbackKind === "bad" ? " is-bad" : "";

    var streakCls = "bic-streak-pill";
    if (S.streak >= 2) streakCls += " is-on";
    if (streakHot) streakCls += " is-hot";

    app.innerHTML =
      (K ? K.topbar({
        title: "Be + -ing",
        kicker: "Teen2Teen 2 · Unit 2",
        pct: progressPct(),
        back: "../",
        count: (S.index + 1) + " / " + S.order.length
      }) : "") +
      '<div class="bic-play">' +
        '<div class="bic-stats">' +
          '<div class="bic-timer-wrap' + (timerLow ? " is-low" : "") + '">' +
            '<span class="bic-timer-icon" aria-hidden="true">⏱️</span>' +
            '<span data-timer>' + formatTime(S.timeLeft) + "</span>" +
          "</div>" +
          '<div class="bic-score-row">' +
            '<div class="' + streakCls + '">' +
              (S.streak >= 2 ? "🔥 " + S.streak : "") +
            "</div>" +
            '<div class="bic-score-pill">⭐ ' + S.score + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="bic-card' + cardCls + '">' +
          '<div class="bic-emoji-badge" aria-hidden="true">' + item.emoji + "</div>" +
          '<div class="bic-prompt">Complete the sentence</div>' +
          '<div class="bic-sentence" aria-label="Sentence with blanks">' + sentenceHtml + "</div>" +
          (S.showCombo ? '<div class="bic-combo is-show">' + esc(S.comboText) + "</div>" : "") +
        "</div>" +
        '<div class="bic-chips-label">Tap the chips · be first, then -ing</div>' +
        '<div class="bic-chips">' + chipsHtml + "</div>" +
        '<div class="bic-feedback' + fbCls + '">' + esc(S.feedback) + "</div>" +
      "</div>";

    if (K) K.afterRender(app, GAME_ID);
    bind();
  }

  function slotHtml(idx) {
    var val = S.slots[idx];
    var cls = "bic-blank";
    if (val) cls += " is-filled";
    if (S.feedbackKind === "ok" && val) cls += " is-ok";
    if (S.feedbackKind === "bad" && val) cls += " is-bad";
    return (
      '<button type="button" class="' + cls + '" data-act="slot" data-i="' + idx + '"' +
      ' aria-label="' + (val ? "Remove " + esc(val) : "Blank " + (idx + 1)) + '">' +
      (val ? esc(val) : "") +
      "</button>"
    );
  }

  /* ---------- events ---------- */

  function bind() {
    app.onclick = function (e) {
      var t = e.target.closest("[data-act]");
      if (!t) return;
      var act = t.getAttribute("data-act");

      if (act === "start" || act === "again") {
        sfx("tap");
        startGame();
        return;
      }
      if (act === "continue") {
        sfx("tap");
        continueAfterEncourage();
        return;
      }
      if (act === "chip") {
        placeChip(parseInt(t.getAttribute("data-i"), 10));
        return;
      }
      if (act === "slot") {
        clearSlot(parseInt(t.getAttribute("data-i"), 10));
        return;
      }
    };
  }

  render();
})();
