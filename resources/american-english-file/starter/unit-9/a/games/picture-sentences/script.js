/* Picture Sentences · Present Continuous · AEF Starter Unit 9A
   4 parts: Positive → Negative → Questions → Short answers
   5 pictures per play; other 5 on replay */
(function () {
  "use strict";

  var GAME_ID = "starter-9a-picture-sentences";

  (function () {
    if (window.__laUiSfx) return;
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
      var t0 = (when || 0) + c.currentTime;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
    function sfxCorrect() {
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    }
    function sfxWrong() {
      tone(220, 0.14, "sawtooth", 0.07, 0);
      tone(180, 0.18, "sawtooth", 0.06, 0.1);
    }
    function sfxCelebrate() {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
    }
    window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
    window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
  })();

  /* ── Full bank (edit freely) ──
     pos / neg / q / sa = { words: [], sentence: "" }
     image = picture URL
  */
  var BANK = [
    {
      id: "homework",
      image: "https://cdn.imgurl.ir/uploads/t966606_He39s_doing_homework.png",
      pos: { words: ["He", "is", "doing", "homework"], sentence: "He is doing homework." },
      neg: { words: ["He", "isn't", "watching", "TV"], sentence: "He isn't watching TV." },
      q:   { words: ["Is", "he", "doing", "homework"], sentence: "Is he doing homework?" },
      qFalse: { words: ["Is", "he", "watching", "TV"], sentence: "Is he watching TV?" },
      sa:  { words: ["No,", "he", "isn't"], sentence: "No, he isn't." }
    },
    {
      id: "drawing",
      image: "https://cdn.imgurl.ir/uploads/r44869_he39s_drawing.png",
      pos: { words: ["He", "is", "drawing", "a", "picture"], sentence: "He is drawing a picture." },
      neg: { words: ["He", "isn't", "writing"], sentence: "He isn't writing." },
      q:   { words: ["Is", "he", "drawing", "a", "picture"], sentence: "Is he drawing a picture?" },
      sa:  { words: ["Yes,", "he", "is"], sentence: "Yes, he is." }
    },
    {
      id: "drinking",
      image: "https://cdn.imgurl.ir/uploads/y010844_he39s_drinking_water.png",
      pos: { words: ["He", "is", "drinking", "water"], sentence: "He is drinking water." },
      neg: { words: ["He", "isn't", "eating"], sentence: "He isn't eating." },
      q:   { words: ["Is", "he", "drinking", "water"], sentence: "Is he drinking water?" },
      sa:  { words: ["Yes,", "he", "is"], sentence: "Yes, he is." }
    },
    {
      id: "driving",
      image: "https://cdn.imgurl.ir/uploads/d89655_he39s_driving.png",
      pos: { words: ["He", "is", "driving"], sentence: "He is driving." },
      neg: { words: ["He", "isn't", "walking"], sentence: "He isn't walking." },
      q:   { words: ["Is", "he", "driving"], sentence: "Is he driving?" },
      sa:  { words: ["Yes,", "he", "is"], sentence: "Yes, he is." }
    },
    {
      id: "shopping",
      image: "https://cdn.imgurl.ir/uploads/x0515_he39s_going_shopping.png",
      pos: { words: ["He", "is", "going", "shopping"], sentence: "He is going shopping." },
      neg: { words: ["He", "isn't", "going", "to", "work"], sentence: "He isn't going to work." },
      q:   { words: ["Is", "he", "going", "shopping"], sentence: "Is he going shopping?" },
      qFalse: { words: ["Is", "he", "going", "to", "work"], sentence: "Is he going to work?" },
      sa:  { words: ["No,", "he", "isn't"], sentence: "No, he isn't." }
    },
    {
      id: "singing",
      image: "https://cdn.imgurl.ir/uploads/a305738_he39s_singing.png",
      pos: { words: ["He", "is", "singing"], sentence: "He is singing." },
      neg: { words: ["He", "isn't", "dancing"], sentence: "He isn't dancing." },
      q:   { words: ["Is", "he", "singing"], sentence: "Is he singing?" },
      sa:  { words: ["Yes,", "he", "is"], sentence: "Yes, he is." }
    },
    {
      id: "dishes",
      image: "https://cdn.imgurl.ir/uploads/e24135_He39s_washing_the_dishes.png",
      pos: { words: ["He", "is", "washing", "the", "dishes"], sentence: "He is washing the dishes." },
      neg: { words: ["He", "isn't", "cooking"], sentence: "He isn't cooking." },
      q:   { words: ["Is", "he", "washing", "the", "dishes"], sentence: "Is he washing the dishes?" },
      sa:  { words: ["Yes,", "he", "is"], sentence: "Yes, he is." }
    },
    {
      id: "teeth",
      image: "https://cdn.imgurl.ir/uploads/o71967_she39s_brushing_her_teeth.png",
      pos: { words: ["She", "is", "brushing", "her", "teeth"], sentence: "She is brushing her teeth." },
      neg: { words: ["She", "isn't", "washing", "her", "hair"], sentence: "She isn't washing her hair." },
      q:   { words: ["Is", "she", "brushing", "her", "teeth"], sentence: "Is she brushing her teeth?" },
      sa:  { words: ["Yes,", "she", "is"], sentence: "Yes, she is." }
    },
    {
      id: "cooking",
      image: "https://cdn.imgurl.ir/uploads/k33142_she39s_cooking.png",
      pos: { words: ["She", "is", "making", "food"], sentence: "She is making food." },
      neg: { words: ["She", "isn't", "cleaning"], sentence: "She isn't cleaning." },
      q:   { words: ["Is", "she", "making", "food"], sentence: "Is she making food?" },
      qFalse: { words: ["Is", "she", "cleaning"], sentence: "Is she cleaning?" },
      sa:  { words: ["No,", "she", "isn't"], sentence: "No, she isn't." }
    },
    {
      id: "dancing",
      image: "https://cdn.imgurl.ir/uploads/w811394_she39s_dancing.png",
      pos: { words: ["She", "is", "dancing"], sentence: "She is dancing." },
      neg: { words: ["She", "isn't", "singing"], sentence: "She isn't singing." },
      q:   { words: ["Is", "she", "dancing"], sentence: "Is she dancing?" },
      sa:  { words: ["Yes,", "she", "is"], sentence: "Yes, she is." }
    },
    {
      id: "fruit",
      image: "https://cdn.imgurl.ir/uploads/v620492_she39s_ing_fruit.png",
      pos: { words: ["She", "is", "eating", "fruit"], sentence: "She is eating fruit." },
      neg: { words: ["She", "isn't", "drinking", "water"], sentence: "She isn't drinking water." },
      q:   { words: ["Is", "she", "eating", "fruit"], sentence: "Is she eating fruit?" },
      sa:  { words: ["Yes,", "she", "is"], sentence: "Yes, she is." }
    },
    {
      id: "fishing",
      image: "https://cdn.imgurl.ir/uploads/h63991_She39s_fishing.png",
      pos: { words: ["She", "is", "fishing"], sentence: "She is fishing." },
      neg: { words: ["She", "isn't", "swimming"], sentence: "She isn't swimming." },
      q:   { words: ["Is", "she", "fishing"], sentence: "Is she fishing?" },
      sa:  { words: ["Yes,", "she", "is"], sentence: "Yes, she is." }
    },
    {
      id: "reading",
      image: "https://cdn.imgurl.ir/uploads/e923690_she39s_reading_a_book.png",
      pos: { words: ["She", "is", "reading", "a", "book"], sentence: "She is reading a book." },
      neg: { words: ["She", "isn't", "writing"], sentence: "She isn't writing." },
      q:   { words: ["Is", "she", "reading", "a", "book"], sentence: "Is she reading a book?" },
      sa:  { words: ["Yes,", "she", "is"], sentence: "Yes, she is." }
    },
    {
      id: "football",
      image: "https://cdn.imgurl.ir/uploads/d69439_they39re_aying_football.png",
      pos: { words: ["They", "are", "playing", "football"], sentence: "They are playing football." },
      neg: { words: ["They", "aren't", "playing", "tennis"], sentence: "They aren't playing tennis." },
      q:   { words: ["Are", "they", "playing", "football"], sentence: "Are they playing football?" },
      qFalse: { words: ["Are", "they", "playing", "tennis"], sentence: "Are they playing tennis?" },
      sa:  { words: ["No,", "they", "aren't"], sentence: "No, they aren't." }
    },
    {
      id: "videogames",
      image: "https://cdn.imgurl.ir/uploads/c22242_they39re_aying_video_games.png",
      pos: { words: ["They", "are", "playing", "video", "games"], sentence: "They are playing video games." },
      neg: { words: ["They", "aren't", "watching", "TV"], sentence: "They aren't watching TV." },
      q:   { words: ["Are", "they", "playing", "video", "games"], sentence: "Are they playing video games?" },
      sa:  { words: ["Yes,", "they", "are"], sentence: "Yes, they are." }
    },
    {
      id: "bikes",
      image: "https://cdn.imgurl.ir/uploads/s375622_they39re_riding_a_bike.png",
      pos: { words: ["They", "are", "riding", "bikes"], sentence: "They are riding bikes." },
      neg: { words: ["They", "aren't", "walking"], sentence: "They aren't walking." },
      q:   { words: ["Are", "they", "riding", "bikes"], sentence: "Are they riding bikes?" },
      sa:  { words: ["Yes,", "they", "are"], sentence: "Yes, they are." }
    },
    {
      id: "running",
      image: "https://cdn.imgurl.ir/uploads/p5418_They39re_running.jpg",
      pos: { words: ["They", "are", "running"], sentence: "They are running." },
      neg: { words: ["They", "aren't", "walking"], sentence: "They aren't walking." },
      q:   { words: ["Are", "they", "running"], sentence: "Are they running?" },
      sa:  { words: ["Yes,", "they", "are"], sentence: "Yes, they are." }
    },
    {
      id: "swimming",
      image: "https://cdn.imgurl.ir/uploads/u086247_they39re_swimming.png",
      pos: { words: ["They", "are", "swimming"], sentence: "They are swimming." },
      neg: { words: ["They", "aren't", "running"], sentence: "They aren't running." },
      q:   { words: ["Are", "they", "swimming"], sentence: "Are they swimming?" },
      qFalse: { words: ["Are", "they", "running"], sentence: "Are they running?" },
      sa:  { words: ["No,", "they", "aren't"], sentence: "No, they aren't." }
    },
    {
      id: "photos",
      image: "https://cdn.imgurl.ir/uploads/u983480_they39re_taking_photos.png",
      pos: { words: ["They", "are", "taking", "photos"], sentence: "They are taking photos." },
      neg: { words: ["They", "aren't", "painting"], sentence: "They aren't painting." },
      q:   { words: ["Are", "they", "taking", "photos"], sentence: "Are they taking photos?" },
      sa:  { words: ["Yes,", "they", "are"], sentence: "Yes, they are." }
    },
    {
      id: "picnic",
      image: "https://cdn.imgurl.ir/uploads/n984898_they39re_having_a_picnic.png",
      pos: { words: ["They", "are", "having", "a", "picnic"], sentence: "They are having a picnic." },
      neg: { words: ["They", "aren't", "studying"], sentence: "They aren't studying." },
      q:   { words: ["Are", "they", "having", "a", "picnic"], sentence: "Are they having a picnic?" },
      sa:  { words: ["Yes,", "they", "are"], sentence: "Yes, they are." }
    }
  ];


  var EXTRA_POOL = [
    "He", "She", "They", "is", "are", "isn't", "aren't", "Is", "Are",
    "doing", "drawing", "drinking", "driving", "going", "singing", "washing",
    "brushing", "making", "dancing", "eating", "fishing", "reading", "playing",
    "riding", "running", "swimming", "taking", "having",
    "homework", "picture", "water", "shopping", "dishes", "teeth", "food",
    "fruit", "book", "football", "video", "games", "bikes", "photos", "picnic",
    "a", "the", "her", "Yes,", "No,", "he", "she", "they"
  ];

  var PARTS = [
    { key: "pos", title: "Positive", tip: "Build the positive sentence." },
    { key: "neg", title: "Negative", tip: "Build the negative sentence." },
    { key: "q",   title: "Questions", tip: "Build the question." },
    { key: "sa",  title: "Short answers", tip: "Answer with a short answer." }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; /* start | bridge | play | results */
  var partIndex = 0;
  var set = [];       /* 5 items for this play */
  var order = [];
  var index = 0;
  var slots = [];
  var pool = [];
  var used = {};
  var locked = false;
  var score = 0;
  var total = 0;
  var lastSetIds = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sfxTap() {
    try { if (window.LASfx && LASfx.click) LASfx.click(); } catch (_) {}
    try { if (window.sfxTap) window.sfxTap(); } catch (_) {}
  }
  function sfxOk() {
    try { if (window.LASfx && LASfx.correct) LASfx.correct(); } catch (_) {}
    try { if (window.sfxCorrect) window.sfxCorrect(); } catch (_) {}
  }
  function sfxBad() {
    try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); } catch (_) {}
    try { if (window.sfxWrong) window.sfxWrong(); } catch (_) {}
  }
  function sfxCelebrate() {
    try { if (window.sfxCelebrate) window.sfxCelebrate(); } catch (_) {}
  }

  function pickSet() {
    var pool = BANK.slice();
    if (lastSetIds.length) {
      var filtered = pool.filter(function (b) { return lastSetIds.indexOf(b.id) === -1; });
      if (filtered.length >= 5) pool = filtered;
    }
    set = shuffle(pool).slice(0, 5);
    lastSetIds = set.map(function (b) { return b.id; });
  }

  function currentForm() {
    var part = PARTS[partIndex];
    var item = set[order[index]];
    return item[part.key];
  }

  function currentItem() {
    return set[order[index]];
  }

  function buildPool(correctWords) {
    /* only the words needed for the sentence — no distractors */
    return shuffle(correctWords.slice());
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) try { LAFinish.startTimer(); } catch (e) {}
    pickSet();
    partIndex = 0;
    score = 0;
    total = 0;
    startPart();
  }

  function startPart() {
    phase = "play";
    order = shuffle(set.map(function (_, i) { return i; }));
    index = 0;
    locked = false;
    startRound();
  }

  function startRound() {
    if (index >= set.length) {
      if (partIndex < PARTS.length - 1) {
        phase = "bridge";
        render();
      } else {
        endGame();
      }
      return;
    }
    locked = false;
    var form = currentForm();
    slots = new Array(form.words.length).fill(null);
    pool = buildPool(form.words);
    used = {};
    render();
  }

  function firstEmpty() {
    for (var i = 0; i < slots.length; i++) if (slots[i] == null) return i;
    return -1;
  }

  function pickChip(label) {
    if (locked) return;
    var i = firstEmpty();
    if (i < 0) return;
    sfxTap();
    slots[i] = label;
    used[label] = (used[label] || 0) + 1;
    updateUI();
  }

  function clearSlot(i) {
    if (locked) return;
    if (slots[i] == null) return;
    sfxTap();
    var w = slots[i];
    slots[i] = null;
    used[w] = Math.max(0, (used[w] || 1) - 1);
    updateUI();
  }

  function clearAll() {
    if (locked) return;
    sfxTap();
    slots = slots.map(function () { return null; });
    used = {};
    updateUI();
    var fb = document.getElementById("ps-fb");
    if (fb) { fb.textContent = ""; fb.className = "ps-fb"; }
  }

  function checkAnswer() {
    if (locked) return;
    var form = currentForm();
    var filled = slots.every(function (s) { return s != null; });
    if (!filled) {
      var fb = document.getElementById("ps-fb");
      if (fb) {
        fb.textContent = "Fill all the blanks first.";
        fb.className = "ps-fb is-hint";
      }
      return;
    }

    locked = true;
    var ok = slots.every(function (w, i) { return w === form.words[i]; });
    total++;

    if (ok) {
      score++;
      sfxOk();
      var sent = document.getElementById("ps-slots");
      if (sent) sent.classList.add("is-correct");
      var fb = document.getElementById("ps-fb");
      if (fb) {
        fb.textContent = "Correct! " + form.sentence;
        fb.className = "ps-fb is-ok";
      }
      setTimeout(function () {
        index++;
        startRound();
      }, 1000);
    } else {
      sfxBad();
      var sent2 = document.getElementById("ps-slots");
      if (sent2) {
        sent2.classList.add("is-wrong");
        setTimeout(function () { sent2.classList.remove("is-wrong"); }, 500);
      }
      var fb2 = document.getElementById("ps-fb");
      if (fb2) {
        fb2.textContent = "Try again! → " + form.sentence;
        fb2.className = "ps-fb is-bad";
      }
      locked = false;
    }
  }

  function goNextPart() {
    partIndex++;
    startPart();
  }

  function endGame() {
    phase = "results";
    render();
  }

  function chipCount(label) {
    var n = 0;
    pool.forEach(function (w) { if (w === label) n++; });
    return n;
  }

  function updateUI() {
    var slotsEl = document.getElementById("ps-slots");
    var poolEl = document.getElementById("ps-pool");
    if (!slotsEl || !poolEl) return;

    slotsEl.innerHTML = slots.map(function (w, i) {
      if (w == null) return '<button type="button" class="ps-slot is-empty" data-i="' + i + '"></button>';
      return '<button type="button" class="ps-slot" data-i="' + i + '">' + escapeHtml(w) + "</button>";
    }).join("");

    slotsEl.querySelectorAll(".ps-slot").forEach(function (btn) {
      btn.onclick = function () {
        clearSlot(parseInt(btn.getAttribute("data-i"), 10));
      };
    });

    var remaining = pool.slice();
    slots.filter(Boolean).forEach(function (w) {
      var ix = remaining.indexOf(w);
      if (ix >= 0) remaining.splice(ix, 1);
    });
    var remCopy = remaining.slice();
    poolEl.innerHTML = pool.map(function (w) {
      var ix = remCopy.indexOf(w);
      var disabled = ix < 0;
      if (!disabled) remCopy.splice(ix, 1);
      return (
        '<button type="button" class="ps-chip' + (disabled ? " is-used" : "") + '" data-w="' + escapeHtml(w) + '"' +
        (disabled ? " disabled" : "") + ">" + escapeHtml(w) + "</button>"
      );
    }).join("");

    poolEl.querySelectorAll(".ps-chip:not([disabled])").forEach(function (btn) {
      btn.onclick = function () { pickChip(btn.getAttribute("data-w")); };
    });

    var checkBtn = document.getElementById("ps-check");
    if (checkBtn) checkBtn.disabled = locked;
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "bridge") return renderBridge();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="ps-top">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Picture Sentences</span>' +
      '<span class="ps-badge">Unit 9A</span></header>' +
      '<section class="ps-start">' +
      '<div class="ps-hero" aria-hidden="true">🖼️</div>' +
      '<h1>Picture Sentences</h1>' +
      '<p class="ps-sub">Look at the picture. Build the sentence with the word chips.</p>' +
      '<ul class="ps-steps">' +
      '<li><strong>1</strong> Positive sentences</li>' +
      '<li><strong>2</strong> Negative sentences</li>' +
      '<li><strong>3</strong> Questions</li>' +
      '<li><strong>4</strong> Short answers</li>' +
      '</ul>' +
      '<button type="button" class="ps-btn" id="ps-start">START</button>' +
      '</section>';
    document.getElementById("ps-start").onclick = startGame;
  }

  function renderBridge() {
    sfxCelebrate();
    var next = PARTS[partIndex + 1];
    app.innerHTML =
      '<header class="ps-top">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Picture Sentences</span>' +
      '<span class="ps-badge">Nice!</span></header>' +
      '<section class="ps-start">' +
      '<div class="ps-hero" aria-hidden="true">🔥</div>' +
      '<h1>Great work!</h1>' +
      '<p class="ps-sub">Next up: <strong>' + next.title + '</strong><br>' + next.tip + "</p>" +
      '<button type="button" class="ps-btn" id="ps-cont">CONTINUE</button>' +
      '</section>';
    document.getElementById("ps-cont").onclick = goNextPart;
  }

  function renderPlay() {
    var part = PARTS[partIndex];
    var item = currentItem();
    var form = currentForm();
    var doneInPart = index;
    var overallDone = partIndex * 5 + index;
    var overallTotal = 20;
    var pct = Math.round((overallDone / overallTotal) * 100);

    var qHint = "";
    if (part.key === "sa") {
      var promptQ = (item.qFalse && item.qFalse.sentence) ? item.qFalse.sentence : item.q.sentence;
      qHint = '<p class="ps-qhint">' + escapeHtml(promptQ) + "</p>";
    }

    app.innerHTML =
      '<header class="ps-top">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Picture Sentences</span>' +
      '<span class="ps-badge">' + (partIndex + 1) + "/4</span>" +
      '<div class="ps-stats"><span class="ps-stat">SCORE ' + score + "/" + total + "</span></div>" +
      "</header>" +
      '<div class="ps-progress"><div class="ps-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="ps-partlabel">' + part.title + " · " + (index + 1) + "/5</p>" +
      '<div class="ps-picwrap"><img class="ps-pic" src="' + item.image + '" alt="" draggable="false"></div>' +
      qHint +
      '<div class="ps-slots" id="ps-slots"></div>' +
      '<div class="ps-pool" id="ps-pool"></div>' +
      '<div class="ps-actions">' +
      '<button type="button" class="ps-btn secondary" id="ps-clear">Clear</button>' +
      '<button type="button" class="ps-btn" id="ps-check">Check</button>' +
      "</div>" +
      '<p class="ps-fb" id="ps-fb" aria-live="polite"></p>';

    document.getElementById("ps-clear").onclick = clearAll;
    document.getElementById("ps-check").onclick = checkAnswer;
    updateUI();
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect! You built every form."
      : accuracy >= 70
      ? "Great job with present continuous!"
      : "Good try! Practice am / is / are + -ing again.";

    app.innerHTML =
      '<header class="ps-top">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Picture Sentences</span>' +
      '<span class="ps-badge">Done</span></header>' +
      '<section class="ps-start">' +
      '<div class="ps-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="ps-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="ps-sub">' + msg + "</p>" +
      '<button type="button" class="ps-btn" id="ps-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    }

    document.getElementById("ps-again").onclick = startGame;
  }

  render();
})();
