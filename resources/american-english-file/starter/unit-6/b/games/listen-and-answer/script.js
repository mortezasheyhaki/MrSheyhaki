/* =========================================================
   LISTEN & ANSWER — Unit 6B
   Mr. Sheyhaki | American English File Starter
   Audio: Student Book 6.12 (Hannah's morning routine)

   Each script line has its own audio clip (CLIPS[i] plays LINES[i]).
   Lines play one after another; the game pauses after the lines
   listed in QUESTIONS to ask the question.
   ========================================================= */
(function () {
  "use strict";

  var GAME_ID = "starter-6b-listen-and-answer";

  // One audio clip per transcript line (same order as LINES)
  var CLIPS = [
    "https://cdn.imgurl.ir/uploads/v034903_.mp3",
    "https://cdn.imgurl.ir/uploads/r600053_.mp3",
    "https://cdn.imgurl.ir/uploads/j109276_.mp3",
    "https://cdn.imgurl.ir/uploads/n98495_.mp3",
    "https://cdn.imgurl.ir/uploads/l55789_.mp3",
    "https://cdn.imgurl.ir/uploads/x437150_.mp3",
    "https://cdn.imgurl.ir/uploads/e666485_.mp3",
    "https://cdn.imgurl.ir/uploads/o172516_.mp3",
    "https://cdn.imgurl.ir/uploads/c32636_.mp3",
    "https://cdn.imgurl.ir/uploads/b089260_.mp3",
    "https://cdn.imgurl.ir/uploads/v02399_.mp3",
    "https://cdn.imgurl.ir/uploads/q79972_.mp3",
    "https://cdn.imgurl.ir/uploads/e49130_.mp3",
    "https://cdn.imgurl.ir/uploads/u218676_.mp3",
    "https://cdn.imgurl.ir/uploads/f7715_.mp3",
    "https://cdn.imgurl.ir/uploads/v409178_.mp3",
    "https://cdn.imgurl.ir/uploads/u307333_.mp3",
    "https://cdn.imgurl.ir/uploads/p43249_.mp3",
    "https://cdn.imgurl.ir/uploads/b562497_.mp3",
    "https://cdn.imgurl.ir/uploads/b962232_.mp3",
    "https://cdn.imgurl.ir/uploads/i352940_.mp3"
  ];

  // Transcript lines (I = Interviewer, H = Hannah)
  var LINES = [
    { spk: "I", text: "Hannah is a concert planner. She has a son Kit who's three years old." },
    { spk: "I", text: "Hannah, what time do you usually get up?" },
    { spk: "H", text: "I get up at 7:00. But I also get up in the night because Kit usually calls me. I tell him to sleep, but he usually comes into my bed." },
    { spk: "I", text: "Do you usually feel tired?" },
    { spk: "H", text: "Yes, I always feel tired!" },
    { spk: "I", text: "Do you take a shower or a bath in the morning?" },
    { spk: "H", text: "I turn on the TV for Kit and then I take a bath in five minutes." },
    { spk: "I", text: "Do you always have breakfast?" },
    { spk: "H", text: "Yes, I need breakfast every day!" },
    { spk: "I", text: "Where do you have it?" },
    { spk: "H", text: "I have it in a café on the way to work." },
    { spk: "I", text: "What do you have for breakfast?" },
    { spk: "H", text: "I have a coffee, and sometimes I have some toast with avocado. It's delicious." },
    { spk: "I", text: "What time do you go to work?" },
    { spk: "H", text: "The perfect time to leave the house is at 8:00, but we usually leave at twenty after eight." },
    { spk: "I", text: "Do you usually need to hurry in the morning?" },
    { spk: "H", text: "Yes, always!" },
    { spk: "I", text: "Do you like mornings?" },
    { spk: "H", text: "Yes. I love mornings." },
    { spk: "I", text: "Why?" },
    { spk: "H", text: "Because I love my job, and I'm happy to go to work!" }
  ];

  // Questions. `after` = index of the line the question follows.
  // options[0] is always the correct answer (shuffled when shown).
  var QUESTIONS = [
    { after: 2, q: "What time does she usually get up?", options: [
      "She gets up at 7:00.", "She gets up at 8:00.", "She gets up at 8:20." ] },
    { after: 4, q: "Does she usually feel tired?", options: [
      "Yes, she always feels tired.", "No, she never feels tired.", "No, she usually has lots of energy." ] },
    { after: 6, q: "Does she take a shower or a bath in the morning?", options: [
      "Yes, she takes a bath in the morning.", "No, she takes a shower in the morning.", "No, she doesn't wash in the morning." ] },
    { after: 10, q: "Does she always have breakfast? Where?", options: [
      "Yes, she always has breakfast. In a café.", "Yes, she always has breakfast at home.", "No, she never has breakfast." ] },
    { after: 12, q: "What does she have for breakfast?", options: [
      "She has a coffee and sometimes some toast with avocado.", "She has cereal and orange juice.", "She has eggs and bacon." ] },
    { after: 14, q: "What time does she go to work?", options: [
      "She goes to work at 8:20.", "She goes to work at 8:00.", "She goes to work at 9:00." ] },
    { after: 16, q: "Does she usually need to hurry in the morning?", options: [
      "Yes, she always needs to hurry.", "No, she never needs to hurry.", "Yes, but only on Mondays." ] },
    { after: 20, q: "Does she like mornings? Why (not)?", options: [
      "Yes, because she loves her job and is happy to go to work.", "No, because she hates her job.", "No, because she sleeps all morning." ] }
  ];
  QUESTIONS.forEach(function (Q) { Q.done = false; });

  /* ---------- Sound effects (Web Audio, no files) ---------- */
  var audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, type, vol, delay) {
    var c = ctx();
    if (!c) return;
    var t = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  var sfx = {
    tap: function () { tone(520, 0.06, "triangle", 0.08); },
    pop: function () { tone(660, 0.14, "sine", 0.1); tone(880, 0.2, "sine", 0.08, 0.09); },
    correct: function () {
      tone(523, 0.1, "sine", 0.12, 0);
      tone(659, 0.12, "sine", 0.12, 0.08);
      tone(784, 0.18, "sine", 0.1, 0.16);
    },
    wrong: function () {
      tone(220, 0.14, "sawtooth", 0.06, 0);
      tone(180, 0.18, "sawtooth", 0.05, 0.1);
    },
    whoosh: function () { tone(400, 0.12, "triangle", 0.06); tone(620, 0.12, "triangle", 0.05, 0.06); }
  };

  /* ---------- DOM ---------- */
  var audio = document.getElementById("audio") || (function () {
    var a = document.createElement("audio");
    a.id = "audio"; a.preload = "auto";
    document.body.appendChild(a);
    return a;
  })();
  var playBtn = document.getElementById("playBtn");
  var replayBtn = document.getElementById("replayBtn");
  var speedBtn = document.getElementById("speedBtn");
  var progressFill = document.getElementById("progressFill");
  var timeNow = document.getElementById("timeNow");
  var timeTotal = document.getElementById("timeTotal");
  var scriptEl = document.getElementById("script");
  var qModal = document.getElementById("qModal");
  var panel = document.getElementById("questionPanel");
  var qNum = document.getElementById("qNum");
  var qText = document.getElementById("questionText");
  var optionsEl = document.getElementById("options");
  var feedback = document.getElementById("feedback");
  var continueBtn = document.getElementById("continueBtn");
  var qProgress = document.getElementById("qProgress");
  var scoreValue = document.getElementById("scoreValue");
  var hint = document.getElementById("hint");
  var sideLeft = document.getElementById("sideLeft");
  var sideRight = document.getElementById("sideRight");
  var bubbleLeft = document.getElementById("bubbleLeft");
  var bubbleRight = document.getElementById("bubbleRight");

  var state = { line: -1, answered: 0, score: 0, activeQ: null, finished: false, speedIdx: 0, pending: null };
  var speeds = [1, 0.8];
  var lineEls = [];

  /* ---------- Characters: talk while their line plays ---------- */
  function speakerSide(spk) { return spk === "I" ? sideLeft : sideRight; }
  function setTalking(spk, on) {
    sideLeft.classList.toggle("is-talking", on && spk === "I");
    sideRight.classList.toggle("is-talking", on && spk === "H");
  }
  function setBubble(el, text) {
    if (!text) { el.hidden = true; return; }
    el.textContent = text;
    el.hidden = false;
  }

  /* ---------- Script ---------- */
  LINES.forEach(function (ln, i) {
    var row = document.createElement("div");
    row.className = "line";
    var tag = document.createElement("span");
    tag.className = "speaker " + (ln.spk === "I" ? "i" : "h");
    tag.textContent = ln.spk === "I" ? "Int" : "H";
    tag.title = ln.spk === "I" ? "Interviewer" : "Hannah";
    var txt = document.createElement("span");
    txt.className = "line-text";
    txt.textContent = ln.text;
    row.appendChild(tag);
    row.appendChild(txt);
    row.addEventListener("click", function () {
      if (state.activeQ || state.finished) return;
      state.pending = null;
      hint.hidden = true;
      playLine(i);
    });
    scriptEl.appendChild(row);
    lineEls.push(row);
  });

  function highlight(i) {
    if (state.line >= 0) lineEls[state.line].classList.remove("active");
    state.line = i;
    lineEls[i].classList.add("active");
    lineEls[i].scrollIntoView({ block: "nearest", behavior: "smooth" });
    timeTotal.textContent = "Line " + (i + 1) + "/" + LINES.length;
  }

  function setPlaying(p) {
    playBtn.textContent = p ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", p ? "Pause" : "Play");
    if (state.line >= 0) setTalking(LINES[state.line].spk, p);
  }

  // Play one line from its own clip
  function playLine(i) {
    ctx(); // unlock audio context on this user gesture
    highlight(i);
    progressFill.style.width = "0%";
    timeNow.textContent = "0:00";
    setBubble(bubbleLeft, null);
    setBubble(bubbleRight, null);
    audio.src = CLIPS[i];
    audio.playbackRate = speeds[state.speedIdx];
    audio.play().catch(function () {
      // Browser blocked the automatic start: wait for one tap on ▶
      state.pending = i;
      setPlaying(false);
      hint.hidden = false;
    });
  }

  function questionAfter(i) {
    for (var k = 0; k < QUESTIONS.length; k++) {
      if (QUESTIONS[k].after === i && !QUESTIONS[k].done) return k;
    }
    return -1;
  }

  function fmt(s) {
    if (!isFinite(s)) return "0:00";
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  /* ---------- Player controls ---------- */
  playBtn.addEventListener("click", function () {
    if (state.activeQ || state.finished) return;
    if (state.pending !== null) {
      var p = state.pending;
      state.pending = null;
      hint.hidden = true;
      playLine(p);
      return;
    }
    if (!audio.getAttribute("src")) { playLine(0); return; }
    if (audio.paused) audio.play(); else audio.pause();
  });

  audio.addEventListener("play", function () { setPlaying(true); });
  audio.addEventListener("pause", function () { setPlaying(false); });

  audio.addEventListener("timeupdate", function () {
    var d = audio.duration || 1;
    progressFill.style.width = ((audio.currentTime / d) * 100).toFixed(1) + "%";
    timeNow.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener("ended", function () {
    setPlaying(false);
    if (state.finished) return;
    var i = state.line;
    var qi = questionAfter(i);
    if (qi >= 0) { openQuestion(qi); return; }
    if (i + 1 < LINES.length) playLine(i + 1);
  });

  audio.addEventListener("error", function () {
    setPlaying(false);
    feedback.textContent = "The audio for this line didn't load. Check your connection and try again.";
    feedback.className = "feedback bad";
    qModal.hidden = false;
  });

  replayBtn.addEventListener("click", function () {
    if (state.activeQ || state.finished || state.line < 0) return;
    audio.currentTime = 0;
    audio.play();
  });

  speedBtn.addEventListener("click", function () {
    state.speedIdx = (state.speedIdx + 1) % speeds.length;
    audio.playbackRate = speeds[state.speedIdx];
    speedBtn.textContent = speeds[state.speedIdx] + "×";
  });

  /* ---------- Questions ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function openQuestion(qi) {
    var Q = QUESTIONS[qi];
    audio.pause();
    state.activeQ = { index: qi, mistakes: 0, solved: false };
    qNum.textContent = (qi + 1) + " of " + QUESTIONS.length;
    qText.textContent = Q.q;
    feedback.textContent = "";
    feedback.className = "feedback";
    continueBtn.hidden = true;
    optionsEl.innerHTML = "";

    shuffle(Q.options).forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "option";
      b.textContent = opt;
      b.addEventListener("click", function () { pick(b, opt); });
      optionsEl.appendChild(b);
    });

    setBubble(bubbleLeft, "?");
    qModal.hidden = false;
    sfx.pop();
  }

  function pick(btn, text) {
    var a = state.activeQ;
    if (!a || a.solved || btn.disabled) return;
    sfx.tap();
    var Q = QUESTIONS[a.index];
    var correct = text === Q.options[0];

    if (correct) {
      btn.classList.add("correct");
      Array.prototype.forEach.call(optionsEl.querySelectorAll(".option"), function (b) { b.disabled = true; });
      a.solved = true;
      if (a.mistakes === 0) state.score++;
      feedback.textContent = "Correct! ✓";
      feedback.className = "feedback good";
      Q.done = true;
      state.answered++;
      qProgress.textContent = state.answered + "/" + QUESTIONS.length;
      scoreValue.textContent = state.score;
      continueBtn.hidden = false;
      continueBtn.textContent = (state.answered === QUESTIONS.length) ? "Finish" : "Continue";
      setBubble(bubbleLeft, null);
      setBubble(bubbleRight, "✓");
      sfx.correct();
    } else {
      a.mistakes++;
      btn.classList.add("wrong");
      btn.disabled = true;
      feedback.textContent = "Not quite. Listen again to the script and try again.";
      feedback.className = "feedback bad";
      sfx.wrong();
    }
  }

  continueBtn.addEventListener("click", function () {
    var a = state.activeQ;
    if (!a) return;
    sfx.whoosh();
    state.activeQ = null;
    qModal.hidden = true;
    setBubble(bubbleRight, null);
    if (state.answered === QUESTIONS.length) { finish(); return; }
    if (state.line + 1 < LINES.length) playLine(state.line + 1);
  });

  /* ---------- Finish: shared Learning Arcade results screen ---------- */
  var startedAt = Date.now();
  function finish() {
    state.finished = true;
    audio.pause();
    setTalking("H", false);
    var timeMs = Date.now() - startedAt;
    var total = QUESTIONS.length;

    if (window.LAFinish && typeof LAFinish.show === "function") {
      LAFinish.show({
        gameId: GAME_ID,
        score: state.score,
        total: total,
        timeMs: timeMs,
        backHref: "../",
        onAgain: function () { location.reload(); }
      });
    } else {
      // Fallback if the shared script is missing
      feedback.textContent = "Finished! You got " + state.score + " out of " + total + " on the first try.";
      feedback.className = "feedback good";
      qModal.hidden = false;
    }
  }

  qProgress.textContent = "0/" + QUESTIONS.length;
  scoreValue.textContent = "0";
})();
