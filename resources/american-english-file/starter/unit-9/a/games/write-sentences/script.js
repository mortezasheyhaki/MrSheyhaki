/* Write the Sentences · Present Continuous · AEF Starter Unit 9A
   4 parts: Positive → Negative → Questions → Short answers
   Students WRITE the answers (not drag chips)
   5 pictures per play
*/
(function () {
  "use strict";

  var GAME_ID = "starter-9a-write-sentences";

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

  /* ── Full bank ──
     stem = short prompt helper e.g. "go shopping"
     pos / neg / q / sa = { sentence: "...", accept: ["alt1", "alt2"] }
     qFalse used for negative short answers
  */
  var BANK = [
    {
      id: "homework",
      image: "https://cdn.imgurl.ir/uploads/t966606_He39s_doing_homework.png",
      who: "he",
      stem: "do homework",
      pos: { sentence: "He's doing homework.", accept: ["He is doing homework.", "He's doing homework"] },
      neg: { sentence: "He isn't watching TV.", accept: ["He is not watching TV.", "He's not watching TV.", "He isn't watching TV"] },
      q:   { sentence: "Is he doing homework?", accept: ["Is he doing homework"] },
      qFalse: { sentence: "Is he watching TV?", accept: ["Is he watching TV"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "drawing",
      image: "https://cdn.imgurl.ir/uploads/r44869_he39s_drawing.png",
      who: "he",
      stem: "draw a picture",
      pos: { sentence: "He's drawing a picture.", accept: ["He is drawing a picture.", "He's drawing a picture"] },
      neg: { sentence: "He isn't writing.", accept: ["He is not writing.", "He's not writing.", "He isn't writing"] },
      q:   { sentence: "Is he drawing a picture?", accept: ["Is he drawing a picture"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "drinking",
      image: "https://cdn.imgurl.ir/uploads/y010844_he39s_drinking_water.png",
      who: "he",
      stem: "drink water",
      pos: { sentence: "He's drinking water.", accept: ["He is drinking water.", "He's drinking water"] },
      neg: { sentence: "He isn't eating.", accept: ["He is not eating.", "He's not eating.", "He isn't eating"] },
      q:   { sentence: "Is he drinking water?", accept: ["Is he drinking water"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "driving",
      image: "https://cdn.imgurl.ir/uploads/d89655_he39s_driving.png",
      who: "he",
      stem: "drive",
      pos: { sentence: "He's driving.", accept: ["He is driving.", "He's driving"] },
      neg: { sentence: "He isn't walking.", accept: ["He is not walking.", "He's not walking.", "He isn't walking"] },
      q:   { sentence: "Is he driving?", accept: ["Is he driving"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "shopping",
      image: "https://cdn.imgurl.ir/uploads/x0515_he39s_going_shopping.png",
      who: "he",
      stem: "go shopping",
      pos: { sentence: "He's going shopping.", accept: ["He is going shopping.", "He's going shopping"] },
      neg: { sentence: "He isn't going to work.", accept: ["He is not going to work.", "He's not going to work.", "He isn't going to work"] },
      q:   { sentence: "Is he going shopping?", accept: ["Is he going shopping"] },
      qFalse: { sentence: "Is he going to work?", accept: ["Is he going to work"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "singing",
      image: "https://cdn.imgurl.ir/uploads/a305738_he39s_singing.png",
      who: "he",
      stem: "sing",
      pos: { sentence: "He's singing.", accept: ["He is singing.", "He's singing"] },
      neg: { sentence: "He isn't dancing.", accept: ["He is not dancing.", "He's not dancing.", "He isn't dancing"] },
      q:   { sentence: "Is he singing?", accept: ["Is he singing"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "dishes",
      image: "https://cdn.imgurl.ir/uploads/e24135_He39s_washing_the_dishes.png",
      who: "he",
      stem: "wash the dishes",
      pos: { sentence: "He's washing the dishes.", accept: ["He is washing the dishes.", "He's washing the dishes"] },
      neg: { sentence: "He isn't cooking.", accept: ["He is not cooking.", "He's not cooking.", "He isn't cooking"] },
      q:   { sentence: "Is he washing the dishes?", accept: ["Is he washing the dishes"] },
      saYes: { sentence: "Yes, he is.", accept: ["Yes he is", "Yes, he is"] },
      saNo:  { sentence: "No, he isn't.", accept: ["No he isn't", "No, he isn't", "No, he is not.", "No he is not"] }
    },
    {
      id: "teeth",
      image: "https://cdn.imgurl.ir/uploads/o71967_she39s_brushing_her_teeth.png",
      who: "she",
      stem: "brush her teeth",
      pos: { sentence: "She's brushing her teeth.", accept: ["She is brushing her teeth.", "She's brushing her teeth"] },
      neg: { sentence: "She isn't washing her hair.", accept: ["She is not washing her hair.", "She's not washing her hair.", "She isn't washing her hair"] },
      q:   { sentence: "Is she brushing her teeth?", accept: ["Is she brushing her teeth"] },
      saYes: { sentence: "Yes, she is.", accept: ["Yes she is", "Yes, she is"] },
      saNo:  { sentence: "No, she isn't.", accept: ["No she isn't", "No, she isn't", "No, she is not.", "No she is not"] }
    },
    {
      id: "cooking",
      image: "https://cdn.imgurl.ir/uploads/k33142_she39s_cooking.png",
      who: "she",
      stem: "make food",
      pos: { sentence: "She's making food.", accept: ["She is making food.", "She's making food"] },
      neg: { sentence: "She isn't cleaning.", accept: ["She is not cleaning.", "She's not cleaning.", "She isn't cleaning"] },
      q:   { sentence: "Is she making food?", accept: ["Is she making food"] },
      qFalse: { sentence: "Is she cleaning?", accept: ["Is she cleaning"] },
      saYes: { sentence: "Yes, she is.", accept: ["Yes she is", "Yes, she is"] },
      saNo:  { sentence: "No, she isn't.", accept: ["No she isn't", "No, she isn't", "No, she is not.", "No she is not"] }
    },
    {
      id: "dancing",
      image: "https://cdn.imgurl.ir/uploads/w811394_she39s_dancing.png",
      who: "she",
      stem: "dance",
      pos: { sentence: "She's dancing.", accept: ["She is dancing.", "She's dancing"] },
      neg: { sentence: "She isn't singing.", accept: ["She is not singing.", "She's not singing.", "She isn't singing"] },
      q:   { sentence: "Is she dancing?", accept: ["Is she dancing"] },
      saYes: { sentence: "Yes, she is.", accept: ["Yes she is", "Yes, she is"] },
      saNo:  { sentence: "No, she isn't.", accept: ["No she isn't", "No, she isn't", "No, she is not.", "No she is not"] }
    },
    {
      id: "fruit",
      image: "https://cdn.imgurl.ir/uploads/v620492_she39s_ing_fruit.png",
      who: "she",
      stem: "eat fruit",
      pos: { sentence: "She's eating fruit.", accept: ["She is eating fruit.", "She's eating fruit"] },
      neg: { sentence: "She isn't drinking water.", accept: ["She is not drinking water.", "She's not drinking water.", "She isn't drinking water"] },
      q:   { sentence: "Is she eating fruit?", accept: ["Is she eating fruit"] },
      saYes: { sentence: "Yes, she is.", accept: ["Yes she is", "Yes, she is"] },
      saNo:  { sentence: "No, she isn't.", accept: ["No she isn't", "No, she isn't", "No, she is not.", "No she is not"] }
    },
    {
      id: "fishing",
      image: "https://cdn.imgurl.ir/uploads/h63991_She39s_fishing.png",
      who: "she",
      stem: "fish",
      pos: { sentence: "She's fishing.", accept: ["She is fishing.", "She's fishing"] },
      neg: { sentence: "She isn't swimming.", accept: ["She is not swimming.", "She's not swimming.", "She isn't swimming"] },
      q:   { sentence: "Is she fishing?", accept: ["Is she fishing"] },
      saYes: { sentence: "Yes, she is.", accept: ["Yes she is", "Yes, she is"] },
      saNo:  { sentence: "No, she isn't.", accept: ["No she isn't", "No, she isn't", "No, she is not.", "No she is not"] }
    },
    {
      id: "reading",
      image: "https://cdn.imgurl.ir/uploads/e923690_she39s_reading_a_book.png",
      who: "she",
      stem: "read a book",
      pos: { sentence: "She's reading a book.", accept: ["She is reading a book.", "She's reading a book"] },
      neg: { sentence: "She isn't writing.", accept: ["She is not writing.", "She's not writing.", "She isn't writing"] },
      q:   { sentence: "Is she reading a book?", accept: ["Is she reading a book"] },
      saYes: { sentence: "Yes, she is.", accept: ["Yes she is", "Yes, she is"] },
      saNo:  { sentence: "No, she isn't.", accept: ["No she isn't", "No, she isn't", "No, she is not.", "No she is not"] }
    },
    {
      id: "football",
      image: "https://cdn.imgurl.ir/uploads/d69439_they39re_aying_football.png",
      who: "they",
      stem: "play football",
      pos: { sentence: "They're playing football.", accept: ["They are playing football.", "They're playing football"] },
      neg: { sentence: "They aren't playing tennis.", accept: ["They are not playing tennis.", "They're not playing tennis.", "They aren't playing tennis"] },
      q:   { sentence: "Are they playing football?", accept: ["Are they playing football"] },
      qFalse: { sentence: "Are they playing tennis?", accept: ["Are they playing tennis"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    },
    {
      id: "videogames",
      image: "https://cdn.imgurl.ir/uploads/c22242_they39re_aying_video_games.png",
      who: "they",
      stem: "play video games",
      pos: { sentence: "They're playing video games.", accept: ["They are playing video games.", "They're playing video games"] },
      neg: { sentence: "They aren't watching TV.", accept: ["They are not watching TV.", "They're not watching TV.", "They aren't watching TV"] },
      q:   { sentence: "Are they playing video games?", accept: ["Are they playing video games"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    },
    {
      id: "bikes",
      image: "https://cdn.imgurl.ir/uploads/s375622_they39re_riding_a_bike.png",
      who: "they",
      stem: "ride bikes",
      pos: { sentence: "They're riding bikes.", accept: ["They are riding bikes.", "They're riding bikes"] },
      neg: { sentence: "They aren't walking.", accept: ["They are not walking.", "They're not walking.", "They aren't walking"] },
      q:   { sentence: "Are they riding bikes?", accept: ["Are they riding bikes"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    },
    {
      id: "running",
      image: "https://cdn.imgurl.ir/uploads/p5418_They39re_running.jpg",
      who: "they",
      stem: "run",
      pos: { sentence: "They're running.", accept: ["They are running.", "They're running"] },
      neg: { sentence: "They aren't walking.", accept: ["They are not walking.", "They're not walking.", "They aren't walking"] },
      q:   { sentence: "Are they running?", accept: ["Are they running"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    },
    {
      id: "swimming",
      image: "https://cdn.imgurl.ir/uploads/u086247_they39re_swimming.png",
      who: "they",
      stem: "swim",
      pos: { sentence: "They're swimming.", accept: ["They are swimming.", "They're swimming"] },
      neg: { sentence: "They aren't running.", accept: ["They are not running.", "They're not running.", "They aren't running"] },
      q:   { sentence: "Are they swimming?", accept: ["Are they swimming"] },
      qFalse: { sentence: "Are they running?", accept: ["Are they running"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    },
    {
      id: "photos",
      image: "https://cdn.imgurl.ir/uploads/u983480_they39re_taking_photos.png",
      who: "they",
      stem: "take photos",
      pos: { sentence: "They're taking photos.", accept: ["They are taking photos.", "They're taking photos"] },
      neg: { sentence: "They aren't painting.", accept: ["They are not painting.", "They're not painting.", "They aren't painting"] },
      q:   { sentence: "Are they taking photos?", accept: ["Are they taking photos"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    },
    {
      id: "picnic",
      image: "https://cdn.imgurl.ir/uploads/n984898_they39re_having_a_picnic.png",
      who: "they",
      stem: "have a picnic",
      pos: { sentence: "They're having a picnic.", accept: ["They are having a picnic.", "They're having a picnic"] },
      neg: { sentence: "They aren't studying.", accept: ["They are not studying.", "They're not studying.", "They aren't studying"] },
      q:   { sentence: "Are they having a picnic?", accept: ["Are they having a picnic"] },
      saYes: { sentence: "Yes, they are.", accept: ["Yes they are", "Yes, they are"] },
      saNo:  { sentence: "No, they aren't.", accept: ["No they aren't", "No, they aren't", "No, they are not.", "No they are not"] }
    }
  ];

  var PARTS = [
    { key: "pos", title: "Positive", tip: "Look at the picture and write the positive sentence." },
    { key: "neg", title: "Negative", tip: "Write a negative sentence about the picture." },
    { key: "q",   title: "Questions", tip: "Write the question about the picture." },
    { key: "sa",  title: "Short answers", tip: "Answer Yes or No with a short answer." }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var partIndex = 0;
  var set = [];
  var order = [];
  var index = 0;
  var locked = false;
  var score = 0;
  var total = 0;
  var lastSetIds = [];
  var currentSaIsNo = false; // for short-answer mix

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
    try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); } catch (_) {}
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

  function currentItem() {
    return set[order[index]];
  }

  function whoPrompt(who) {
    if (who === "he") return "What's he doing?";
    if (who === "she") return "What's she doing?";
    return "What are they doing?";
  }

  function stemLabel(item) {
    return "(" + item.who + " / " + item.stem + ")";
  }

  /* Normalize for comparison */
  function normalize(s) {
    s = String(s || "").toLowerCase().trim();
    s = s.replace(/[.?!]+$/g, "");          // trailing punctuation
    s = s.replace(/\s+/g, " ");             // collapse spaces
    s = s.replace(/['’]/g, "'");           // unify apostrophes
    // expand common contractions so both forms match
    s = s.replace(/\bhe's\b/g, "he is");
    s = s.replace(/\bshe's\b/g, "she is");
    s = s.replace(/\bthey're\b/g, "they are");
    s = s.replace(/\bisn't\b/g, "is not");
    s = s.replace(/\baren't\b/g, "are not");
    s = s.replace(/\bwhat's\b/g, "what is");
    return s.trim();
  }

  function isMatch(user, form) {
    var nUser = normalize(user);
    if (!nUser) return false;
    var candidates = [form.sentence].concat(form.accept || []);
    for (var i = 0; i < candidates.length; i++) {
      if (normalize(candidates[i]) === nUser) return true;
    }
    return false;
  }

  function getForm() {
    var part = PARTS[partIndex];
    var item = currentItem();
    if (part.key === "sa") {
      // Mix: if item has qFalse, randomly use No ~50%, else always Yes
      if (item.qFalse && (currentSaIsNo || Math.random() < 0.45)) {
        currentSaIsNo = true;
        return { type: "saNo", form: item.saNo, promptQ: item.qFalse.sentence };
      }
      currentSaIsNo = false;
      return { type: "saYes", form: item.saYes, promptQ: item.q.sentence };
    }
    return { type: part.key, form: item[part.key], promptQ: null };
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
    currentSaIsNo = false;
    render();
  }

  function checkAnswer() {
    if (locked) return;
    var input = document.getElementById("ws-input");
    if (!input) return;
    var user = input.value;
    var info = getForm();
    var form = info.form;

    total++;
    locked = true;

    if (isMatch(user, form)) {
      score++;
      sfxOk();
      input.classList.remove("is-bad");
      input.classList.add("is-ok");
      var fb = document.getElementById("ws-fb");
      if (fb) {
        fb.textContent = "Correct! " + form.sentence;
        fb.className = "ws-fb is-ok";
      }
      setTimeout(function () {
        index++;
        startRound();
      }, 1100);
    } else {
      sfxBad();
      input.classList.remove("is-ok");
      input.classList.add("is-bad");
      var fb2 = document.getElementById("ws-fb");
      if (fb2) {
        fb2.textContent = "Try again! → " + form.sentence;
        fb2.className = "ws-fb is-bad";
      }
      locked = false;
      setTimeout(function () {
        if (input) input.classList.remove("is-bad");
      }, 600);
    }
  }

  function clearInput() {
    if (locked) return;
    var input = document.getElementById("ws-input");
    if (input) {
      input.value = "";
      input.classList.remove("is-ok", "is-bad");
      input.focus();
    }
    var fb = document.getElementById("ws-fb");
    if (fb) { fb.textContent = ""; fb.className = "ws-fb"; }
  }

  function goNextPart() {
    partIndex++;
    startPart();
  }

  function endGame() {
    phase = "results";
    render();
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "bridge") return renderBridge();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="ws-topbar">' +
      '<a class="ws-back" href="../" aria-label="Back">←</a>' +
      '<span class="ws-title">Write the Sentences</span>' +
      '<span class="ws-badge">Unit 9A</span></header>' +
      '<section class="ws-start">' +
      '<div class="ws-hero" aria-hidden="true">✍️</div>' +
      '<h1>Write the Sentences</h1>' +
      '<p class="ws-sub">Look at the picture and write the present continuous sentence.</p>' +
      '<ul class="ws-tips">' +
      '<li>Positive sentences</li>' +
      '<li>Negative sentences</li>' +
      '<li>Questions</li>' +
      '<li>Short answers (Yes / No)</li>' +
      '</ul>' +
      '<button type="button" class="ws-btn" id="ws-start">START</button>' +
      '</section>';
    document.getElementById("ws-start").onclick = startGame;
  }

  function renderBridge() {
    sfxCelebrate();
    var next = PARTS[partIndex + 1];
    app.innerHTML =
      '<header class="ws-topbar">' +
      '<a class="ws-back" href="../" aria-label="Back">←</a>' +
      '<span class="ws-title">Write the Sentences</span>' +
      '<span class="ws-badge">Nice!</span></header>' +
      '<section class="ws-start">' +
      '<div class="ws-hero" aria-hidden="true">🔥</div>' +
      '<h1>Great work!</h1>' +
      '<p class="ws-sub">Next up: <strong>' + next.title + '</strong><br>' + next.tip + "</p>" +
      '<button type="button" class="ws-btn" id="ws-cont">CONTINUE</button>' +
      '</section>';
    document.getElementById("ws-cont").onclick = goNextPart;
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect! You wrote every form."
      : accuracy >= 70
      ? "Great job with present continuous!"
      : "Good try! Practice writing the sentences again.";

    app.innerHTML =
      '<header class="ws-topbar">' +
      '<a class="ws-back" href="../" aria-label="Back">←</a>' +
      '<span class="ws-title">Write the Sentences</span>' +
      '<span class="ws-badge">Done</span></header>' +
      '<section class="ws-start">' +
      '<div class="ws-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="ws-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="ws-sub">' + msg + "</p>" +
      '<button type="button" class="ws-btn" id="ws-again">PLAY AGAIN</button>' +
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

    document.getElementById("ws-again").onclick = startGame;
  }

  function renderPlay() {
    var part = PARTS[partIndex];
    var item = currentItem();
    var info = getForm();
    var form = info.form;
    var overallDone = partIndex * 5 + index;
    var overallTotal = 20;
    var pct = Math.round((overallDone / overallTotal) * 100);

    // Build prompt text
    var promptHtml = "";
    var hintLine = "";

    if (part.key === "pos") {
      promptHtml = '<p class="ws-prompt">' + escapeHtml(whoPrompt(item.who)) +
        '<span class="ws-stem">' + escapeHtml(stemLabel(item)) + '</span></p>';
      hintLine = '<p class="ws-hint-line">Example: He\'s going shopping.</p>';
    } else if (part.key === "neg") {
      promptHtml = '<p class="ws-prompt">Write a negative sentence.</p>';
      // give a helpful stem from the negative itself
      var negStem = form.sentence.replace(/^(He|She|They)\s+(isn't|aren't)\s+/i, "").replace(/\.$/, "");
      promptHtml += '<p class="ws-prompt"><span class="ws-stem">(' + item.who + " / " + negStem + ")</span></p>";
    } else if (part.key === "q") {
      promptHtml = '<p class="ws-prompt">Write the question.</p>';
      promptHtml += '<p class="ws-prompt"><span class="ws-stem">' + escapeHtml(stemLabel(item)) + '</span></p>';
    } else if (part.key === "sa") {
      promptHtml = '<p class="ws-prompt">' + escapeHtml(info.promptQ) + '</p>';
      hintLine = '<p class="ws-hint-line">Write: Yes, he is. / No, he isn\'t.</p>';
    }

    app.innerHTML =
      '<header class="ws-topbar">' +
      '<a class="ws-back" href="../" aria-label="Back">←</a>' +
      '<span class="ws-title">Write the Sentences</span>' +
      '<span class="ws-badge">' + (partIndex + 1) + "/4</span>" +
      '<div class="ws-stats"><span class="ws-stat">SCORE ' + score + "/" + total + "</span></div>" +
      "</header>" +
      '<div class="ws-progress"><div class="ws-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="ws-partlabel">' + part.title + " · " + (index + 1) + "/5</p>" +
      '<div class="ws-picwrap"><img class="ws-pic" src="' + item.image + '" alt="" draggable="false"></div>' +
      promptHtml +
      hintLine +
      '<div class="ws-input-wrap">' +
      '<input type="text" class="ws-input" id="ws-input" autocomplete="off" autocapitalize="sentences" placeholder="Type your answer…">' +
      '</div>' +
      '<div class="ws-actions">' +
      '<button type="button" class="ws-btn secondary" id="ws-clear">Clear</button>' +
      '<button type="button" class="ws-btn" id="ws-check">Check</button>' +
      '</div>' +
      '<p class="ws-fb" id="ws-fb" aria-live="polite"></p>';

    var input = document.getElementById("ws-input");
    document.getElementById("ws-clear").onclick = clearInput;
    document.getElementById("ws-check").onclick = checkAnswer;

    if (input) {
      input.focus();
      input.onkeydown = function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          checkAnswer();
        }
      };
    }
  }

  // Kick off
  render();
})();
