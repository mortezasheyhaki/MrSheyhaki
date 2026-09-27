/* Speak the Sentences · Present Continuous · Teen2Teen 2 Unit 1
   Voice recognition: 10 pictures
   5 × What questions  +  5 × Yes/No (be-verb) questions
*/
(function () {
  "use strict";

  var GAME_ID = "t2t2-u1-voice-sentences";

  /* ── SFX ── */
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
    function sfxListen() { tone(880, 0.08, "sine", 0.06); }
    window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate, listen: sfxListen };
  })();

  function sfxTap() { try { if (window.LASfx && LASfx.click) LASfx.click(); else if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }
  function sfxListen() { try { if (window.__laUiSfx) window.__laUiSfx.listen(); } catch (_) {} }

  /* ── Bank (same pictures) ── */
  var BANK = [
    {
      id: "homework",
      image: "https://cdn.imgurl.ir/uploads/t966606_He39s_doing_homework.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's doing homework", "he is doing homework"] },
      beYes: { prompt: "Is he doing homework?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he watching TV?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "shopping",
      image: "https://cdn.imgurl.ir/uploads/x0515_he39s_going_shopping.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's going shopping", "he is going shopping"] },
      beYes: { prompt: "Is he going shopping?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he going to work?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "driving",
      image: "https://cdn.imgurl.ir/uploads/d89655_he39s_driving.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's driving", "he is driving"] },
      beYes: { prompt: "Is he driving?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he walking?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "singing",
      image: "https://cdn.imgurl.ir/uploads/a305738_he39s_singing.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's singing", "he is singing"] },
      beYes: { prompt: "Is he singing?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he dancing?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "dishes",
      image: "https://cdn.imgurl.ir/uploads/e24135_He39s_washing_the_dishes.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's washing the dishes", "he is washing the dishes"] },
      beYes: { prompt: "Is he washing the dishes?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he cooking?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "teeth",
      image: "https://cdn.imgurl.ir/uploads/o71967_she39s_brushing_her_teeth.png",
      who: "she",
      what: { prompt: "What's she doing?", answers: ["she's brushing her teeth", "she is brushing her teeth"] },
      beYes: { prompt: "Is she brushing her teeth?", answers: ["yes she is", "yes, she is"] },
      beNo:  { prompt: "Is she washing her hair?", answers: ["no she isn't", "no, she isn't", "no she is not", "no, she is not"] }
    },
    {
      id: "cooking",
      image: "https://cdn.imgurl.ir/uploads/k33142_she39s_cooking.png",
      who: "she",
      what: { prompt: "What's she doing?", answers: ["she's making food", "she is making food", "she's cooking", "she is cooking"] },
      beYes: { prompt: "Is she making food?", answers: ["yes she is", "yes, she is"] },
      beNo:  { prompt: "Is she cleaning?", answers: ["no she isn't", "no, she isn't", "no she is not", "no, she is not"] }
    },
    {
      id: "dancing",
      image: "https://cdn.imgurl.ir/uploads/w811394_she39s_dancing.png",
      who: "she",
      what: { prompt: "What's she doing?", answers: ["she's dancing", "she is dancing"] },
      beYes: { prompt: "Is she dancing?", answers: ["yes she is", "yes, she is"] },
      beNo:  { prompt: "Is she singing?", answers: ["no she isn't", "no, she isn't", "no she is not", "no, she is not"] }
    },
    {
      id: "reading",
      image: "https://cdn.imgurl.ir/uploads/e923690_she39s_reading_a_book.png",
      who: "she",
      what: { prompt: "What's she doing?", answers: ["she's reading a book", "she is reading a book", "she's reading", "she is reading"] },
      beYes: { prompt: "Is she reading a book?", answers: ["yes she is", "yes, she is"] },
      beNo:  { prompt: "Is she writing?", answers: ["no she isn't", "no, she isn't", "no she is not", "no, she is not"] }
    },
    {
      id: "football",
      image: "https://cdn.imgurl.ir/uploads/d69439_they39re_aying_football.png",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're playing football", "they are playing football"] },
      beYes: { prompt: "Are they playing football?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they playing tennis?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    },
    {
      id: "swimming",
      image: "https://cdn.imgurl.ir/uploads/u086247_they39re_swimming.png",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're swimming", "they are swimming"] },
      beYes: { prompt: "Are they swimming?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they running?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    },
    {
      id: "bikes",
      image: "https://cdn.imgurl.ir/uploads/s375622_they39re_riding_a_bike.png",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're riding bikes", "they are riding bikes", "they're riding a bike", "they are riding a bike"] },
      beYes: { prompt: "Are they riding bikes?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they walking?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    },
    {
      id: "photos",
      image: "https://cdn.imgurl.ir/uploads/u983480_they39re_taking_photos.png",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're taking photos", "they are taking photos", "they're taking pictures", "they are taking pictures"] },
      beYes: { prompt: "Are they taking photos?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they painting?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    },
    {
      id: "picnic",
      image: "https://cdn.imgurl.ir/uploads/n984898_they39re_having_a_picnic.png",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're having a picnic", "they are having a picnic"] },
      beYes: { prompt: "Are they having a picnic?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they studying?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    },
    {
      id: "running",
      image: "https://cdn.imgurl.ir/uploads/p5418_They39re_running.jpg",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're running", "they are running"] },
      beYes: { prompt: "Are they running?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they walking?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    },
    {
      id: "fruit",
      image: "https://cdn.imgurl.ir/uploads/v620492_she39s_ing_fruit.png",
      who: "she",
      what: { prompt: "What's she doing?", answers: ["she's eating fruit", "she is eating fruit"] },
      beYes: { prompt: "Is she eating fruit?", answers: ["yes she is", "yes, she is"] },
      beNo:  { prompt: "Is she drinking water?", answers: ["no she isn't", "no, she isn't", "no she is not", "no, she is not"] }
    },
    {
      id: "drawing",
      image: "https://cdn.imgurl.ir/uploads/r44869_he39s_drawing.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's drawing a picture", "he is drawing a picture", "he's drawing", "he is drawing"] },
      beYes: { prompt: "Is he drawing a picture?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he writing?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "drinking",
      image: "https://cdn.imgurl.ir/uploads/y010844_he39s_drinking_water.png",
      who: "he",
      what: { prompt: "What's he doing?", answers: ["he's drinking water", "he is drinking water"] },
      beYes: { prompt: "Is he drinking water?", answers: ["yes he is", "yes, he is"] },
      beNo:  { prompt: "Is he eating?", answers: ["no he isn't", "no, he isn't", "no he is not", "no, he is not"] }
    },
    {
      id: "fishing",
      image: "https://cdn.imgurl.ir/uploads/h63991_She39s_fishing.png",
      who: "she",
      what: { prompt: "What's she doing?", answers: ["she's fishing", "she is fishing"] },
      beYes: { prompt: "Is she fishing?", answers: ["yes she is", "yes, she is"] },
      beNo:  { prompt: "Is she swimming?", answers: ["no she isn't", "no, she isn't", "no she is not", "no, she is not"] }
    },
    {
      id: "videogames",
      image: "https://cdn.imgurl.ir/uploads/c22242_they39re_aying_video_games.png",
      who: "they",
      what: { prompt: "What are they doing?", answers: ["they're playing video games", "they are playing video games", "they're playing videogames", "they are playing videogames"] },
      beYes: { prompt: "Are they playing video games?", answers: ["yes they are", "yes, they are"] },
      beNo:  { prompt: "Are they watching TV?", answers: ["no they aren't", "no, they aren't", "no they are not", "no, they are not"] }
    }
  ];

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var speechSupported = !!SpeechRecognition;

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var rounds = [];       /* 10 items: { item, type: "what"|"beYes"|"beNo", data } */
  var index = 0;
  var score = 0;
  var total = 0;
  var locked = false;
  var listening = false;
  var recognition = null;
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

  function normalize(s) {
    s = String(s || "").toLowerCase().trim();
    s = s.replace(/[.?!,'"]+/g, " ");
    s = s.replace(/\s+/g, " ").trim();
    s = s.replace(/['’]/g, "'");
    s = s.replace(/\bhe's\b/g, "he is");
    s = s.replace(/\bshe's\b/g, "she is");
    s = s.replace(/\bthey're\b/g, "they are");
    s = s.replace(/\bisn't\b/g, "is not");
    s = s.replace(/\baren't\b/g, "are not");
    s = s.replace(/\byeah\b/g, "yes");
    s = s.replace(/\byep\b/g, "yes");
    s = s.replace(/\bnope\b/g, "no");
    return s.trim();
  }

  function isMatch(heard, answers) {
    var n = normalize(heard);
    if (!n) return false;
    for (var i = 0; i < answers.length; i++) {
      var a = normalize(answers[i]);
      if (n === a) return true;
      // allow answer contained in longer recognition
      if (n.indexOf(a) !== -1 || a.indexOf(n) !== -1) return true;
    }
    return false;
  }

  function pickRounds() {
    var pool = BANK.slice();
    if (lastSetIds.length) {
      var filtered = pool.filter(function (b) { return lastSetIds.indexOf(b.id) === -1; });
      if (filtered.length >= 10) pool = filtered;
    }
    var picked = shuffle(pool).slice(0, 10);
    lastSetIds = picked.map(function (b) { return b.id; });

    // 5 what + 5 be (mix of yes/no)
    var whatItems = picked.slice(0, 5);
    var beItems = picked.slice(5, 10);

    rounds = [];
    whatItems.forEach(function (item) {
      rounds.push({ item: item, type: "what", data: item.what });
    });
    beItems.forEach(function (item, i) {
      // alternate yes/no, with a bit of randomness
      var useNo = (i % 2 === 1) || (Math.random() < 0.3 && item.beNo);
      if (useNo && item.beNo) {
        rounds.push({ item: item, type: "beNo", data: item.beNo });
      } else {
        rounds.push({ item: item, type: "beYes", data: item.beYes });
      }
    });
    rounds = shuffle(rounds);
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try { recognition.abort(); } catch (_) {}
      recognition = null;
    }
    var btn = document.getElementById("vs-mic");
    var label = document.getElementById("vs-mic-label");
    var heard = document.getElementById("vs-heard");
    if (btn) btn.classList.remove("is-listening");
    if (label) label.textContent = "Tap the mic and speak";
    if (heard && heard.classList.contains("is-listening")) {
      heard.classList.remove("is-listening");
    }
  }

  function startListening() {
    if (!speechSupported || locked || listening) return;

    stopListening();
    sfxListen();
    listening = true;

    var btn = document.getElementById("vs-mic");
    var label = document.getElementById("vs-mic-label");
    var heardEl = document.getElementById("vs-heard");
    if (btn) btn.classList.add("is-listening");
    if (label) label.textContent = "Listening…";
    if (heardEl) {
      heardEl.textContent = "Speak now…";
      heardEl.className = "vs-heard is-listening";
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onresult = function (event) {
      var transcript = "";
      for (var i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (heardEl) {
        heardEl.textContent = transcript || "…";
        heardEl.className = "vs-heard is-listening";
      }
      // final result
      if (event.results[event.results.length - 1].isFinal) {
        // collect alternatives
        var alts = [];
        var last = event.results[event.results.length - 1];
        for (var a = 0; a < last.length; a++) alts.push(last[a].transcript);
        checkAnswer(alts.length ? alts : [transcript]);
      }
    };

    recognition.onerror = function (e) {
      stopListening();
      if (e.error === "no-speech" || e.error === "aborted") {
        if (heardEl) {
          heardEl.textContent = "No speech detected — try again";
          heardEl.className = "vs-heard";
        }
        return;
      }
      if (heardEl) {
        heardEl.textContent = "Mic error — try again";
        heardEl.className = "vs-heard is-bad";
      }
    };

    recognition.onend = function () {
      if (listening) {
        // ended without final — just reset UI
        stopListening();
      }
    };

    try {
      recognition.start();
    } catch (err) {
      stopListening();
      if (heardEl) {
        heardEl.textContent = "Could not start mic";
        heardEl.className = "vs-heard is-bad";
      }
    }
  }

  function toggleMic() {
    if (locked) return;
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function checkAnswer(transcripts) {
    if (locked) return;
    stopListening();
    locked = true;
    total++;

    var round = rounds[index];
    var answers = round.data.answers;
    var ok = false;
    var bestHeard = transcripts[0] || "";

    for (var i = 0; i < transcripts.length; i++) {
      if (isMatch(transcripts[i], answers)) {
        ok = true;
        bestHeard = transcripts[i];
        break;
      }
    }

    var heardEl = document.getElementById("vs-heard");
    var fb = document.getElementById("vs-fb");
    var btn = document.getElementById("vs-mic");

    if (ok) {
      score++;
      sfxOk();
      if (heardEl) {
        heardEl.textContent = bestHeard;
        heardEl.className = "vs-heard is-ok";
      }
      if (fb) {
        fb.textContent = "Correct! " + answers[0].replace(/\b\w/g, function (c) { return c.toUpperCase(); }).replace(/\bis\b/i, "is").replace(/^yes/, "Yes").replace(/^no/, "No");
        // nicer display of expected
        fb.textContent = "Correct!";
        fb.className = "vs-fb is-ok";
      }
      if (btn) btn.disabled = true;
      setTimeout(function () {
        index++;
        locked = false;
        nextRound();
      }, 1200);
    } else {
      sfxBad();
      if (heardEl) {
        heardEl.textContent = bestHeard || "(not understood)";
        heardEl.className = "vs-heard is-bad";
      }
      if (fb) {
        fb.textContent = "Try again → " + formatAnswer(answers[0]);
        fb.className = "vs-fb is-bad";
      }
      locked = false;
    }
  }

  function formatAnswer(s) {
    // capitalize first letter, keep rest lower for display
    s = String(s);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function skipRound() {
    if (locked) return;
    stopListening();
    total++;
    index++;
    nextRound();
  }

  function nextRound() {
    if (index >= rounds.length) {
      endGame();
      return;
    }
    locked = false;
    renderPlay();
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) try { LAFinish.startTimer(); } catch (e) {}
    pickRounds();
    index = 0;
    score = 0;
    total = 0;
    locked = false;
    phase = "play";
    renderPlay();
  }

  function endGame() {
    phase = "results";
    stopListening();
    renderResults();
  }

  /* ── Render ── */

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function micSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z"/></svg>';
  }

  function renderStart() {
    var unsup = !speechSupported
      ? '<div class="vs-unsupported">Voice recognition needs Chrome, Edge, or Safari. Please use one of those browsers.</div>'
      : "";

    app.innerHTML =
      '<header class="vs-topbar">' +
      '<a class="vs-back" href="../" aria-label="Back">←</a>' +
      '<span class="vs-title">Speak the Sentences</span>' +
      '<span class="vs-badge">Unit 1</span></header>' +
      '<section class="vs-start">' +
      '<div class="vs-hero" aria-hidden="true">🎙️</div>' +
      '<h1>Speak the Sentences</h1>' +
      '<p class="vs-sub">Look at the picture and answer out loud.</p>' +
      unsup +
      '<ul class="vs-tips">' +
      '<li>5 × What\'s he/she doing?</li>' +
      '<li>5 × Yes / No questions</li>' +
      '<li>Tap the mic and speak clearly</li>' +
      '<li>10 pictures total</li>' +
      '</ul>' +
      '<button type="button" class="vs-btn" id="vs-start"' + (!speechSupported ? " disabled" : "") + '>START</button>' +
      '</section>';

    var btn = document.getElementById("vs-start");
    if (btn && speechSupported) btn.onclick = startGame;
  }

  function renderPlay() {
    var round = rounds[index];
    var item = round.item;
    var data = round.data;
    var pct = Math.round((index / rounds.length) * 100);
    var typeLabel = round.type === "what" ? "What question" : "Yes / No";

    app.innerHTML =
      '<header class="vs-topbar">' +
      '<a class="vs-back" href="../" aria-label="Back">←</a>' +
      '<span class="vs-title">Speak the Sentences</span>' +
      '<span class="vs-badge">' + (index + 1) + "/10</span>" +
      '<span class="vs-stat">SCORE ' + score + "/" + total + "</span>" +
      "</header>" +
      '<div class="vs-progress"><div class="vs-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="vs-partlabel">' + typeLabel + "</p>" +
      '<div class="vs-picwrap"><img class="vs-pic" src="' + item.image + '" alt="" draggable="false"></div>' +
      '<p class="vs-prompt">' + escapeHtml(data.prompt) + "</p>" +
      '<p class="vs-heard" id="vs-heard">Tap the mic and speak</p>' +
      '<div class="vs-mic-wrap">' +
      '<button type="button" class="vs-mic-btn" id="vs-mic" aria-label="Microphone">' + micSvg() + "</button>" +
      '<span class="vs-mic-label" id="vs-mic-label">Tap the mic and speak</span>' +
      "</div>" +
      '<p class="vs-fb" id="vs-fb" aria-live="polite"></p>' +
      '<div class="vs-actions">' +
      '<button type="button" class="vs-skip" id="vs-skip">Skip</button>' +
      "</div>";

    document.getElementById("vs-mic").onclick = toggleMic;
    document.getElementById("vs-skip").onclick = skipRound;
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect speaking!"
      : accuracy >= 70
      ? "Great job with present continuous!"
      : "Good try — practice speaking again.";

    app.innerHTML =
      '<header class="vs-topbar">' +
      '<a class="vs-back" href="../" aria-label="Back">←</a>' +
      '<span class="vs-title">Speak the Sentences</span>' +
      '<span class="vs-badge">Done</span></header>' +
      '<section class="vs-start">' +
      '<div class="vs-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="vs-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="vs-sub">' + msg + "</p>" +
      '<button type="button" class="vs-btn" id="vs-again">PLAY AGAIN</button>' +
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

    try {
      if (window.LAStars && LAStars.saveFromAccuracy) {
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      }
    } catch (e) {}

    document.getElementById("vs-again").onclick = startGame;
  }

  render();
})();
