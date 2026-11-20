/* Snakes & Ladders · Offline (same device) + Online (invite friend) */
(function () {
  "use strict";

  /* Auto day / night — no toggle. Uses local hour + prefers-color-scheme. */
  function applyAutoTheme() {
    var hour = new Date().getHours();
    var isNight = hour < 7 || hour >= 19;
    // If OS clearly prefers light during day hours, stay light; at night prefer dark
    try {
      if (window.matchMedia) {
        if (isNight && window.matchMedia("(prefers-color-scheme: light)").matches && hour >= 7 && hour < 19) {
          isNight = false;
        }
        // Between 7–19: light unless OS prefers dark strongly at evening edge
        if (!isNight && window.matchMedia("(prefers-color-scheme: dark)").matches && (hour >= 17 || hour < 8)) {
          isNight = true;
        }
      }
    } catch (e) {}
    var theme = isNight ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.getElementById("themeColorMeta");
    if (meta) meta.setAttribute("content", theme === "dark" ? "#070b16" : "#eef2ff");
  }
  applyAutoTheme();
  // Re-check periodically (theme can flip at 7:00 / 19:00 without reload)
  setInterval(applyAutoTheme, 60 * 1000);
  try {
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyAutoTheme);
    }
  } catch (e) {}

  var SERVER_URL =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:3001"
      : "https://mrsheyhaki-multiplayer.onrender.com";

  var LADDERS = { 8: 31, 21: 42, 25: 34, 66: 73, 70: 89 };
  var SNAKES = {
    19: 6, 29: 27, 54: 34, 57: 41, 62: 19, 75: 53, 88: 67, 93: 70, 96: 75, 98: 79,
  };
  var QUESTION_SQUARES = [
    2, 6, 11, 12, 15, 17, 20, 23, 27, 32, 34, 41, 44, 51, 52, 54, 60, 61, 64, 69,
    73, 74, 81, 83, 90, 91, 94, 95, 97,
  ];
  var QUESTIONS = [
    { id: 1, q: "Which of these words isn't used with the present simple?", choices: ["always", "never", "now"], answer: 2 },
    { id: 2, q: "Which sentence is correct?", choices: ["I usually play football after school on Wednesdays.", "I'm usually playing football after school on Wednesdays."], answer: 0 },
    { id: 3, q: "What's the missing word? Where ______ you going?", choices: ["do", "are", "is"], answer: 1 },
    { id: 4, q: "Which time word isn't used with the present continuous?", choices: ["Today", "Sometimes", "Now"], answer: 1 },
    { id: 5, q: "Correct ending: 'I always…'", choices: ["… get up at 7am.", "… am getting up at 7am.", "… getting up at 7am."], answer: 0 },
    { id: 6, q: "Why is the present simple used? 'I live in a small city in France.'", choices: ["It's a temporary action", "It's a permanent fact / routine", "It's happening right now"], answer: 1 },
    { id: 7, q: "Finish: I can't talk right now because I ______ (have) lunch.", choices: ["have", "am having", "having"], answer: 1 },
    { id: 8, q: "Correct this: Sarah and Michael watching a film.", choices: ["Sarah and Michael is watching a film.", "Sarah and Michael are watching a film.", "Sarah and Michael watch a film."], answer: 1 },
    { id: 9, q: "Which sentence is correct?", choices: ["I don't see my grandmother every day.", "I'm not seeing my grandmother every day.", "I not see my grandmother every day."], answer: 0 },
    { id: 10, q: "We / have / a lot of fun on holiday this week.", choices: ["We have a lot of fun on holiday this week.", "We are having a lot of fun on holiday this week.", "We having a lot of fun on holiday this week."], answer: 1 },
    { id: 11, q: "Correct this: I'm not knowing how to cook.", choices: ["I don't know how to cook.", "I'm not know how to cook.", "I not knowing how to cook."], answer: 0 },
    { id: 12, q: "Emmanuelle and Fred ______ (not like) Paris, so they ______ (not enjoy) their holiday.", choices: ["don't like / aren't enjoying", "aren't liking / don't enjoy", "don't like / don't enjoy"], answer: 0 },
    { id: 13, q: "I usually ______ (wear) jeans, but today I ______ (not wear) jeans.", choices: ["wear / am not wearing", "am wearing / don't wear", "wear / don't wear"], answer: 0 },
    { id: 14, q: "Correct this: I don't never do my homework.", choices: ["I never do my homework.", "I don't ever not do my homework.", "I'm never doing my homework."], answer: 0 },
    { id: 15, q: "a) She's an angry person. b) She's feeling angry today.", choices: ["a = permanent, b = temporary feeling", "a = temporary, b = permanent", "No difference"], answer: 0 },
    { id: 16, q: "Finish: 'My brother and sister are making dinner…'", choices: ["… usually.", "… on Saturdays.", "… at the moment."], answer: 2 },
    { id: 17, q: "Lilly ______ (not usually) ______ (eat) cake, but today she ______ (eat) chocolate cake.", choices: ["doesn't usually eat / is eating", "isn't usually eating / eats", "doesn't usually eat / eats"], answer: 0 },
    { id: 18, q: "I'm not in the office today, because…", choices: ["… I visiting my aunt.", "… I'm visiting my aunt.", "… I visit my aunt."], answer: 1 },
    { id: 19, q: "Where / Lana / go to school?", choices: ["Where does Lana go to school?", "Where is Lana go to school?", "Where Lana goes to school?"], answer: 0 },
    { id: 20, q: "Correct: Who are George live with?", choices: ["Who does George live with?", "Who is George live with?", "Who George lives with?"], answer: 0 },
  ];

  var BEGINNER_EXTRA = [
    { id: 21, q: "Which of these words is commonly used with the Present Continuous?", choices: ["Yesterday", "Now", "Every morning"], answer: 1 },
    { id: 22, q: "Which sentence is correct? Why?", choices: ["I'm watching a movie right now.", "I watching a movie right now."], answer: 0 },
    { id: 23, q: "Complete the question: Where [[0]] your friends going?", type: "type", blanks: [function (t) { return t === "are"; }], model: "Where are your friends going?" },
    { id: 24, q: "Which time expression is NOT suitable for the Present Continuous?", choices: ["At the moment", "Right now", "Every weekend"], answer: 2 },
    { id: 25, q: "Choose the correct form: 'She ______ a book.'", choices: ["is reading", "are reading", "reading"], answer: 0 },
    { id: 26, q: "Why is the Present Continuous used here? 'Look! The children are playing in the garden.'", choices: ["It's happening now", "It's a permanent fact", "It's a past action"], answer: 0 },
    { id: 27, q: "I can't talk right now because I [[0]] (do) my homework.", type: "type", blanks: [function (t) { return t === "am doing"; }], model: "I can't talk right now because I am doing my homework." },
    { id: 28, q: "Correct the mistake: Sarah and Michael watching a film at the moment.", type: "type", check: function (t) { return /^sarah and michael (are|'re) watching a film at the moment\.?$/.test(t); }, model: "Sarah and Michael are watching a film at the moment." },
    { id: 29, q: "Which sentence is correct? Why?", choices: ["They aren't playing basketball now.", "They not playing basketball now.", "They isn't playing basketball now."], answer: 0 },
    { id: 30, q: "Make a correct question: What / you / do / right now?", type: "type", check: function (t) { return /^what are you doing right now\??$/.test(t); }, model: "What are you doing right now?" },
    { id: 31, q: "Correct the mistake: I'm not understanding this exercise.", type: "type", check: function (t) { return /^i (do not|don't) understand this exercise\.?$/.test(t); }, model: "I don't understand this exercise." },
    { id: 32, q: "Emma and Jack [[0]] (not / study) for the exam. They [[1]] (play) video games.", type: "type", blanks: [function (t) { return /^(aren'?t|are not) studying$/.test(t); }, function (t) { return t === "are playing"; }], model: "Emma and Jack aren't studying for the exam. They are playing video games." },
    { id: 33, q: "I [[0]] (wear) my favorite T-shirt today, but my brother [[1]] (wear) his school uniform.", type: "type", blanks: [function (t) { return /^(am|'m) wearing$/.test(t); }, function (t) { return /^(is|'s) wearing$/.test(t); }], model: "I'm wearing my favorite T-shirt today, but my brother is wearing his school uniform." },
    { id: 34, q: "Correct the mistake: What is your friends doing?", type: "type", check: function (t) { return /^what are your friends doing\??$/.test(t); }, model: "What are your friends doing?" },
    { id: 35, q: "What is the difference in meaning between 'He's sitting on the sofa.' and 'He's standing next to the sofa.'?", choices: ["Sitting vs. standing position", "Past vs. future action", "No difference"], answer: 0 },
    { id: 36, q: "Finish the sentence: 'My parents are cooking dinner…' (write 'at the moment' or 'right now')", type: "type", check: function (t) { return /(at the moment|right now)/.test(t); }, model: "at the moment / right now" },
    { id: 37, q: "Lilly [[0]] (not / watch) TV right now. She [[1]] (write) an email to her friend.", type: "type", blanks: [function (t) { return /^(isn'?t|is not) watching$/.test(t); }, function (t) { return t === "is writing"; }], model: "Lilly isn't watching TV right now. She is writing an email to her friend." },
    { id: 38, q: "Choose the best ending: 'I'm not going to school today because…'", choices: ["… I'm feeling sick.", "… I am feel sick."], answer: 0 },
    { id: 39, q: "Put the words in the correct order: Where / Lana / go / right now?", type: "type", check: function (t) { return /^where is lana going right now\??$/.test(t); }, model: "Where is Lana going right now?" },
    { id: 40, q: "Correct the mistake: Who are George talking to?", type: "type", check: function (t) { return /^who is george talking to\??$/.test(t); }, model: "Who is George talking to?" },
    { id: 41, q: "Which sentence has the correct negative form?", choices: ["He isn't wearing a jacket.", "He doesn't wearing a jacket.", "He not is wearing a jacket."], answer: 0 },
    { id: 42, q: "Complete the question: [[0]] they having lunch at the moment?", type: "type", blanks: [function (t) { return t === "are"; }], model: "Are they having lunch at the moment?" },
    { id: 43, q: "Put the words in the correct order: is / why / crying / the baby / ?", type: "type", check: function (t) { return /^why is the baby crying\??$/.test(t); }, model: "Why is the baby crying?" },
    { id: 44, q: "Correct TWO mistakes: My friends is playing football, and I am siting on the bench.", type: "type", check: function (t) { return /friends are playing/.test(t) && /sitting on the bench/.test(t); }, model: "My friends are playing football, and I am sitting on the bench." },
    { id: 45, q: "Your best friend is in the kitchen. He has a cake, some eggs, and a bowl. What is he doing? Write a Present Continuous sentence.", type: "type", check: function (t) { return /\b(i'?m|am|is|are|'s|'re)\s+\w+ing\b/.test(t); }, model: "He is making a cake." }
  ];
  QUESTIONS = QUESTIONS.concat(BEGINNER_EXTRA);
  var LEVELS = { beginner: QUESTIONS, elementary: [] };   // add Elementary questions to LEVELS.elementary

  var $ = function (id) { return document.getElementById(id); };
  var DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  var cellCenters = {};
  var mode = null; // "offline" | "online"
  var socket = null;
  var myId = null;
  var lastRoom = null;
  var onlineSl = null;
  var accessToken = null;

  var state = {
    positions: [1, 1],
    turn: 0,
    names: ["Player 1", "Player 2"],
    busy: false,
    usedQ: {},
  };

  // —— SFX ——
  var audioCtx = null, master = null, muted = false, musicOn = false, musicNext = 0, musicStep = 0;
  try { muted = localStorage.getItem("sl-muted") === "1"; } catch (e) {}
  function ctx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        master = audioCtx.createGain();
        master.gain.value = muted ? 0 : 0.8;
        master.connect(audioCtx.destination);
      } catch (e) { return null; }
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(function () {});
    return audioCtx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = ctx(); if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.1, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol, when, freq) {
    var c = ctx(); if (!c) return;
    var t0 = c.currentTime + (when || 0), n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = freq || 1500; f.Q.value = 0.9;
    g.gain.value = vol || 0.2;
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  function sfx(name) {
    try {
      if (name === "roll") { for (var i = 0; i < 7; i++) noise(0.035, 0.22, i * 0.07, 3200); tone(180, 0.3, "triangle", 0.05, 0.45); }
      else if (name === "move") tone(620, 0.06, "triangle", 0.07);
      else if (name === "ladder") [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "sine", 0.1, i * 0.07); });
      else if (name === "snake") { noise(0.6, 0.2, 0, 1700); tone(260, 0.5, "sawtooth", 0.04, 0.05); tone(130, 0.5, "sawtooth", 0.04, 0.3); }
      else if (name === "correct") { tone(660, 0.12, "sine", 0.12); tone(990, 0.22, "sine", 0.1, 0.1); }
      else if (name === "wrong") { tone(220, 0.18, "square", 0.05); tone(165, 0.26, "square", 0.05, 0.14); }
      else if (name === "win") [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.28, "sine", 0.12, i * 0.1); });
      else if (name === "click") tone(700, 0.035, "triangle", 0.06);
      else if (name === "question") { tone(480, 0.1, "sine", 0.1); tone(640, 0.14, "sine", 0.09, 0.11); }
    } catch (e) {}
  }
  // Background loop: bass + arpeggio + hi-hat, generated live (no audio files)
  var PROG = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];
  var BASS = [130.81, 110, 87.31, 98];
  function musicTick() {
    var c = ctx(); if (!c || !musicOn) return;
    while (musicNext < c.currentTime + 0.5) {
      var s = musicStep, bar = Math.floor(s / 8) % 4, beat = s % 8, when = Math.max(0, musicNext - c.currentTime);
      if (beat === 0) tone(BASS[bar], 0.55, "sine", 0.09, when);
      if (beat % 2 === 0) tone(PROG[bar][(beat / 2) % 3] * 2, 0.24, "triangle", 0.03, when);
      if (beat === 4 && bar % 2 === 0) tone(PROG[bar][2] * 4, 0.18, "sine", 0.018, when);
      noise(0.025, 0.015, when, 7000);
      musicStep++; musicNext += 0.28;
    }
  }
  function startMusic() {
    if (musicOn) return;
    var c = ctx(); if (!c) return;
    musicOn = true; musicNext = c.currentTime + 0.1; musicStep = 0;
    setInterval(musicTick, 110);
  }
  function paintMute() {
    var b = $("btnMute"); if (!b) return;
    b.textContent = muted ? "🔇" : "🔊";
    b.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    b.setAttribute("aria-pressed", muted ? "true" : "false");
  }
  function setMuted(v) {
    muted = v;
    try { localStorage.setItem("sl-muted", v ? "1" : "0"); } catch (e) {}
    var c = ctx();
    if (c) master.gain.setTargetAtTime(v ? 0 : 0.8, c.currentTime, 0.05);
    if (!v) startMusic();
    paintMute();
  }

  // Player icons
  var ICONS = ["🦊", "🦄", "🐼", "🐸", "🐯", "🐙", "🚀", "🐧", "🦖", "👾"];
  state.icons = ["🦊", "🦄", "🐼", "🐸"];
  state.count = 2; state.level = "beginner";
  function buildIconPickers() {
    document.querySelectorAll(".sl-icons").forEach(function (box) {
      var p = +box.getAttribute("data-p");
      box.innerHTML = "";
      ICONS.forEach(function (ic) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = ic; b.setAttribute("data-ic", ic);
        b.onclick = function () { pickIcon(p, ic); };
        box.appendChild(b);
      });
    });
    paintPickers();
  }
  function pickIcon(p, ic) {
    for (var q = 0; q < state.count; q++) if (q !== p && state.icons[q] === ic) state.icons[q] = state.icons[p];
    state.icons[p] = ic;
    sfx("click");
    paintPickers();
  }
  function paintPickers() {
    document.querySelectorAll(".sl-icons").forEach(function (box) {
      var p = +box.getAttribute("data-p");
      Array.prototype.forEach.call(box.children, function (b) {
        var ic = b.getAttribute("data-ic"), taken = false;
        for (var q = 0; q < state.count; q++) if (q !== p && state.icons[q] === ic) taken = true;
        b.classList.toggle("on", ic === state.icons[p]);
        b.classList.toggle("taken", taken);
      });
    });
  }

  // 3D dice
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  var DIE_ROT = { 1: [0, 0], 2: [-90, 0], 3: [0, -90], 4: [0, 90], 5: [90, 0], 6: [0, 180] };
  var dieRot = { x: 0, y: 0 };
  function buildDie() {
    var cube = $("diceFace"); if (!cube) return;
    cube.innerHTML = "";
    for (var f = 1; f <= 6; f++) {
      var face = document.createElement("span");
      face.className = "f f" + f;
      for (var i = 0; i < 9; i++) {
        var pip = document.createElement("span");
        if (PIPS[f].indexOf(i) >= 0) pip.className = "pip";
        face.appendChild(pip);
      }
      cube.appendChild(face);
    }
    showDie(1);
  }
  function showDie(n, spin) {
    var cube = $("diceFace"); if (!cube) return;
    var t = DIE_ROT[n] || DIE_ROT[1];
    var dx = ((t[0] - dieRot.x) % 360 + 360) % 360, dy = ((t[1] - dieRot.y) % 360 + 360) % 360;
    if (spin) { dx += 1080; dy += 1440; }        // extra full turns so it visibly tumbles
    dieRot.x += dx; dieRot.y += dy;
    cube.style.transform = "rotateX(" + dieRot.x + "deg) rotateY(" + dieRot.y + "deg)";
    var scene = cube.parentElement;
    if (spin && scene) {
      scene.classList.remove("hop"); void scene.offsetWidth; scene.classList.add("hop");
    }
  }

  // SVG helpers
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function polyAttrs(poly, stroke, w, extra) {
    var o = { points: poly, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", stroke: stroke, "stroke-width": w };
    for (var k in extra) o[k] = extra[k];
    return o;
  }
  var SNAKE_COLORS = [["#16a34a", "#bbf7d0", "#14532d"], ["#0891b2", "#a5f3fc", "#164e63"], ["#ca8a04", "#fef08a", "#713f12"], ["#db2777", "#fbcfe8", "#831843"], ["#7c3aed", "#ddd6fe", "#4c1d95"]];
  function snakePoints(x1, y1, x2, y2, k) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len, bow = len * 0.3 * (k % 2 ? 1 : -1);
    var cx = (x1 + x2) / 2 + nx * bow, cy = (y1 + y2) / 2 + ny * bow, pts = [];
    for (var i = 0; i <= 48; i++) {
      var t = i / 48, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      var px = a * x1 + b * cx + c * x2, py = a * y1 + b * cy + c * y2;
      var tx = 2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx), ty = 2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy);
      var tl = Math.sqrt(tx * tx + ty * ty) || 1;
      var w = Math.sin(t * Math.PI * 4) * 22 * (1 - t * 0.5);
      pts.push([px - ty / tl * w, py + tx / tl * w]);
    }
    return pts;
  }

  function showScreen(id) {
    ["screenMode", "screenOffline", "screenOnlineHome", "screenLobby", "screenPlay"].forEach(function (s) {
      var el = $(s);
      if (el) el.hidden = s !== id;
    });
    if (id === "screenPlay") startMusic();
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // —— Board ——
  function squareToGrid(n) {
    var zero = n - 1;
    var rowFromBottom = Math.floor(zero / 10);
    var colInRow = zero % 10;
    var col = rowFromBottom % 2 === 0 ? colInRow : 9 - colInRow;
    return { row: 9 - rowFromBottom, col: col };
  }

  function buildBoard() {
    var boardEl = $("board");
    boardEl.innerHTML = "";
    var cells = new Array(100);
    for (var n = 1; n <= 100; n++) {
      var g = squareToGrid(n);
      var cell = document.createElement("div");
      cell.className = "sl-cell " + ((g.row + g.col) % 2 === 0 ? "light" : "dark");
      cell.dataset.n = n;
      if (n === 1) { cell.classList.add("start"); cell.textContent = "Start"; }
      else if (n === 100) { cell.classList.add("finish"); cell.textContent = "Finish"; }
      else cell.textContent = n;
      if (QUESTION_SQUARES.indexOf(n) >= 0) {
        var q = document.createElement("span");
        q.className = "q"; q.textContent = "?";
        cell.appendChild(q);
      }
      cells[g.row * 10 + g.col] = cell;
      cellCenters[n] = { x: (g.col + 0.5) * 10, y: (g.row + 0.5) * 10 };
    }
    cells.forEach(function (c) { boardEl.appendChild(c); });
  }

  function drawLadders() {
    var svg = $("laddersSvg"); svg.innerHTML = "";
    Object.keys(LADDERS).forEach(function (fs) {
      var from = +fs, to = LADDERS[from], a = cellCenters[from], b = cellCenters[to];
      if (!a || !b) return;
      var x1 = a.x * 10, y1 = a.y * 10, x2 = b.x * 10, y2 = b.y * 10;
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, px = -uy * 15, py = ux * 15;
      var g = svgEl("g", {}, svg);
      var rails = [[px, py], [-px, -py]];
      var steps = Math.max(3, Math.floor(len / 40)), i, t, cx, cy;
      rails.forEach(function (o) {
        svgEl("line", { x1: x1 + o[0] + 6, y1: y1 + o[1] + 8, x2: x2 + o[0] + 6, y2: y2 + o[1] + 8, style: "stroke:rgba(15,23,42,.3);stroke-width:8px;stroke-linecap:round" }, g);
      });
      for (i = 1; i < steps; i++) {
        t = i / steps; cx = x1 + dx * t; cy = y1 + dy * t;
        svgEl("line", { x1: cx + px + 6, y1: cy + py + 8, x2: cx - px + 6, y2: cy - py + 8, style: "stroke:rgba(15,23,42,.3);stroke-width:6px;stroke-linecap:round" }, g);
      }
      rails.forEach(function (o) {
        svgEl("line", { x1: x1 + o[0], y1: y1 + o[1], x2: x2 + o[0], y2: y2 + o[1], style: "stroke:#a16207;stroke-width:8px;stroke-linecap:round" }, g);
      });
      for (i = 1; i < steps; i++) {
        t = i / steps; cx = x1 + dx * t; cy = y1 + dy * t;
        svgEl("line", { x1: cx + px, y1: cy + py, x2: cx - px, y2: cy - py, style: "stroke:#fbbf24;stroke-width:5px;stroke-linecap:round" }, g);
      }
    });
  }

  function drawSnakes() {
    var svg = $("snakesSvg"); svg.innerHTML = "";
    var bodies = svgEl("g", {}, svg), heads = svgEl("g", {}, svg);  // all bodies first, heads on top
    var k = 0;
    Object.keys(SNAKES).forEach(function (fs) {
      var from = +fs, to = SNAKES[from], a = cellCenters[from], b = cellCenters[to];
      if (!a || !b) return;
      k++;
      var col = SNAKE_COLORS[k % SNAKE_COLORS.length];
      var pts = snakePoints(a.x * 10, a.y * 10, b.x * 10, b.y * 10, k);
      var poly = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
      var g = svgEl("g", {}, bodies);
      svgEl("polyline", polyAttrs(poly, "rgba(15,23,42,.35)", 26, { transform: "translate(7,9)" }), g);
      svgEl("polyline", polyAttrs(poly, col[2], 24), g);
      svgEl("polyline", polyAttrs(poly, col[0], 18), g);
      svgEl("polyline", polyAttrs(poly, col[1], 7, { "stroke-dasharray": "10 12", opacity: ".8", "class": "snake-scales" }), g);
      var p0 = pts[0], p1 = pts[2];
      var ang = Math.atan2(p0[1] - p1[1], p0[0] - p1[0]) * 180 / Math.PI;
      var hg = svgEl("g", { transform: "translate(" + p0[0].toFixed(1) + "," + p0[1].toFixed(1) + ") rotate(" + ang.toFixed(1) + ")" }, heads);
      var hb = svgEl("g", { "class": "head-bob" }, hg);
      var tg = svgEl("g", { "class": "tongue" }, hb);
      svgEl("line", { x1: 14, y1: 0, x2: 30, y2: 0, stroke: "#f43f5e", "stroke-width": 3, "stroke-linecap": "round" }, tg);
      svgEl("line", { x1: 30, y1: 0, x2: 38, y2: -6, stroke: "#f43f5e", "stroke-width": 3, "stroke-linecap": "round" }, tg);
      svgEl("line", { x1: 30, y1: 0, x2: 38, y2: 6, stroke: "#f43f5e", "stroke-width": 3, "stroke-linecap": "round" }, tg);
      svgEl("ellipse", { cx: 0, cy: 0, rx: 19, ry: 16, fill: col[0], stroke: col[2], "stroke-width": 3 }, hb);
      svgEl("ellipse", { cx: -5, cy: -6, rx: 7, ry: 4, fill: "#fff", opacity: ".25" }, hb);
      [-8, 8].forEach(function (y) {
        svgEl("circle", { cx: 6, cy: y, r: 6.5, fill: "#fef9c3", stroke: col[2], "stroke-width": 1.5 }, hb);
        svgEl("ellipse", { cx: 8, cy: y, rx: 2, ry: 3.6, fill: "#0f172a" }, hb);
      });
    });
  }

  var STACK = [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]];
  function placeTokensFromPositions(posArr) {
    var layer = $("tokensLayer"), n = state.count || 2;
    for (var p = 0; p < n; p++) {
      var pos = posArr[p], c = cellCenters[pos]; if (!c) continue;
      var k = 0, sharing = 0;
      for (var q = 0; q < n; q++) if (posArr[q] === pos) { sharing++; if (q < p) k++; }
      var off = sharing > 1 ? STACK[k] : [0, 0];   // only spread tokens when players share a square
      var tok = $("token" + p);
      if (!tok) { tok = document.createElement("div"); tok.id = "token" + p; layer.appendChild(tok); }
      tok.className = "sl-token p" + (p + 1);
      tok.textContent = state.icons[p];
      tok.style.left = (c.x + off[0]) + "%";
      tok.style.top = (c.y + off[1]) + "%";
    }
  }
  function placeTokens() { placeTokensFromPositions(state.positions); }
  function norm(s) { return String(s).replace(/\u2019/g, "'").replace(/\s+/g, " ").trim().toLowerCase(); }
  function typedOk(q, vals) {
    if (q.blanks) return q.blanks.every(function (f, i) { return !!f(norm(vals[i])); });
    return !!q.check(norm(vals[0]));
  }
  function showTypedResult(ok, model) {
    var res = $("aResult"); res.hidden = false; res.className = "sl-result " + (ok ? "ok" : "bad");
    res.textContent = ok ? "Correct! Stay put." : "Wrong! Back 3 squares.";
    if (!ok && model) { var m = document.createElement("div"); m.className = "sl-model"; m.textContent = "Model answer: " + model; res.appendChild(m); }
    sfx(ok ? "correct" : "wrong");
    $("aContinue").hidden = false;
  }
  // Builds the typing UI: inline boxes inside the sentence for blank questions, one box otherwise
  function typedBox(q, onSubmit) {
    var box = $("aChoices"); box.innerHTML = "";
    var wrap = document.createElement("div"); wrap.className = "sl-typewrap";
    var inputs = [], done = false, go = document.createElement("button");
    function submit() {
      if (done) return;
      var empty = inputs.filter(function (i) { return !i.value.trim(); })[0];
      if (empty) { empty.focus(); return; }
      done = true;
      inputs.forEach(function (i) { i.disabled = true; }); go.disabled = true;
      onSubmit(inputs.map(function (i) { return i.value; }));
    }
    function makeInput(blank) {
      var inp = document.createElement("input");
      inp.type = "text"; inp.autocomplete = "off"; inp.autocapitalize = "off"; inp.spellcheck = false;
      inp.className = blank ? "sl-blank" : "sl-typebox";
      inp.placeholder = blank ? "…" : "Type your answer here";
      inp.onkeydown = function (e) { if (e.key === "Enter") submit(); };
      return inp;
    }
    if (q.blanks) {
      $("aText").textContent = "";
      var line = document.createElement("div"); line.className = "sl-fill";
      String(q.q).split(/\[\[(\d+)\]\]/).forEach(function (part, i) {
        if (i % 2 === 0) line.appendChild(document.createTextNode(part));
        else { var inp = makeInput(true); inputs[+part] = inp; line.appendChild(inp); }
      });
      wrap.appendChild(line);
    } else {
      $("aText").textContent = formatQuestionText(q.q);
      var one = makeInput(false); inputs.push(one); wrap.appendChild(one);
    }
    go.type = "button"; go.className = "sl-btn primary wide"; go.textContent = "Check answer";
    go.onclick = submit;
    wrap.appendChild(go); box.appendChild(wrap);
    $("aResult").hidden = true; $("aContinue").hidden = true; $("aModal").hidden = false;
    setTimeout(function () { if (inputs[0]) inputs[0].focus(); }, 150);
  }
  function askTypedOffline(player, q) {
    return new Promise(function (resolve) {
      sfx("question");
      $("aWho").textContent = "Question for " + state.names[player];
      typedBox(q, function (vals) {
        var ok = typedOk(q, vals);
        showTypedResult(ok, q.model);
        $("aContinue").onclick = function () { $("aModal").hidden = true; resolve(ok); };
      });
    });
  }

  function celebrate() {
    var box = document.createElement("div");
    box.className = "sl-confetti";
    var cols = ["#f472b6", "#22d3ee", "#fde047", "#a78bfa", "#34d399", "#fb923c"];
    for (var i = 0; i < 110; i++) {
      var p = document.createElement("i");
      p.style.left = (Math.random() * 100) + "%";
      p.style.background = cols[i % cols.length];
      p.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
      p.style.animationDelay = (Math.random() * 0.8) + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 4200);
  }
  buildDie();
  buildIconPickers();
  paintMute();
  $("btnMute").onclick = function () { setMuted(!muted); };
  document.querySelectorAll("#segCount button").forEach(function (b) { b.onclick = function () { setCount(+b.getAttribute("data-n")); }; });
  document.querySelectorAll("#segLevel button").forEach(function (b) { b.onclick = function () { setLevel(b.getAttribute("data-lvl")); }; });
  function setCount(n) {
    state.count = n;
    var blocks = document.querySelectorAll(".sl-players-setup > .sl-psetup");
    for (var p = 0; p < blocks.length; p++) blocks[p].hidden = p >= n;
    var used = {};
    for (var q = 0; q < n; q++) {
      if (used[state.icons[q]]) state.icons[q] = ICONS.filter(function (ic) { return !used[ic]; })[0];
      used[state.icons[q]] = true;
    }
    paintSeg(); paintPickers();
  }
  function setLevel(lvl) { if (!LEVELS[lvl] || !LEVELS[lvl].length) return; state.level = lvl; paintSeg(); }
  function paintSeg() {
    document.querySelectorAll("#segCount button").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-n") === state.count); });
    document.querySelectorAll("#segLevel button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-lvl") === state.level); });
  }
  setCount(2);

  function updateHUD() {
    var box = $("hudPlayers"); if (!box) return;
    box.innerHTML = "";
    for (var p = 0; p < state.count; p++) {
      var c = document.createElement("div");
      c.className = "sl-hc c" + p + (p === state.turn ? " active" : "");
      c.innerHTML = "<span></span><span class=\"sl-hc-name\"></span><span class=\"sl-hc-pos\"></span>";
      c.children[0].textContent = state.icons[p];
      c.children[1].textContent = state.names[p];
      c.children[2].textContent = state.positions[p];
      box.appendChild(c);
    }
    // status line takes the colour of the player whose turn it is
    $("msgBar").style.setProperty("--pc", ["#f472b6", "#22d3ee", "#fbbf24", "#a78bfa"][state.turn] || "#a78bfa");
  }

  function setMsg(t) { $("msgBar").textContent = t || ""; }

  function highlight(n) {
    var cell = $("board").querySelector('[data-n="' + n + '"]');
    if (cell) {
      cell.classList.add("highlight");
      setTimeout(function () { cell.classList.remove("highlight"); }, 600);
    }
  }

  function initBoardUI() {
    buildBoard();
    drawLadders();
    drawSnakes();
    placeTokens();
    updateHUD();
  }

  // —— Offline game logic (from previous version) ——
  async function movePlayerOffline(player, steps) {
    var pos = state.positions[player];
    for (var s = 0; s < steps; s++) {
      if (pos >= 100) break;
      pos++;
      state.positions[player] = pos;
      placeTokens();
      highlight(pos);
      sfx("move");
      await sleep(260);
    }
    if (LADDERS[pos]) {
      setMsg("Ladder! Climb to " + LADDERS[pos]);
      sfx("ladder");
      await sleep(300);
      state.positions[player] = LADDERS[pos];
      placeTokens();
      highlight(state.positions[player]);
      await sleep(350);
      pos = state.positions[player];
    }
    if (SNAKES[pos]) {
      setMsg("Snake! Slide to " + SNAKES[pos]);
      sfx("snake");
      await sleep(300);
      state.positions[player] = SNAKES[pos];
      placeTokens();
      highlight(state.positions[player]);
      await sleep(350);
      pos = state.positions[player];
    }
    return state.positions[player];
  }

  function pickOneOffline() {
    var pool = LEVELS[state.level].filter(function (q) { return !state.usedQ[q.id]; });
    if (pool.length < 1) { state.usedQ = {}; pool = LEVELS[state.level].slice(); }
    var item = pool[Math.floor(Math.random() * pool.length)];
    state.usedQ[item.id] = true;
    return item;
  }


  function formatQuestionText(q) {
    var s = String(q || "");
    // Line-break before a) b) c) d) so options stack vertically
    s = s.replace(/\s+([a-dA-D]\))\s*/g, "\n$1 ");
    // Also support "a. " / "b. " style
    s = s.replace(/\s+([a-dA-D])\.\s+/g, "\n$1. ");
    return s.trim();
  }

  /** Shuffle choices; returns { choices, answer, originalIndexMap } */
  function shuffleQuestionChoices(question) {
    var choices = (question.choices || []).slice();
    var answer = typeof question.answer === "number" ? question.answer : 0;
    var order = choices.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    var shuffled = order.map(function (oi) { return choices[oi]; });
    var newAnswer = order.indexOf(answer);
    if (newAnswer < 0) newAnswer = 0;
    // displayIndex -> originalIndex
    return {
      choices: shuffled,
      answer: newAnswer,
      toOriginal: function (displayIndex) {
        return order[displayIndex];
      },
    };
  }

  function askQuestionOffline(player, question) {
    if (question.type === "type") return askTypedOffline(player, question);
    return new Promise(function (resolve) {
      sfx("question");
      $("aWho").textContent = "Question for " + state.names[player];
      $("aText").textContent = formatQuestionText(question.q);
      var box = $("aChoices");
      box.innerHTML = "";
      $("aResult").hidden = true;
      $("aContinue").hidden = true;
      var answered = false;
      var shuffled = shuffleQuestionChoices(question);
      shuffled.choices.forEach(function (c, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sl-choice";
        btn.textContent = c;
        btn.onclick = function () {
          if (answered) return;
          answered = true;
          var ok = i === shuffled.answer;
          Array.prototype.forEach.call(box.children, function (b, j) {
            b.disabled = true;
            if (j === shuffled.answer) b.classList.add("correct");
            if (j === i && !ok) b.classList.add("wrong");
          });
          var res = $("aResult");
          res.hidden = false;
          res.className = "sl-result " + (ok ? "ok" : "bad");
          res.textContent = ok ? "Correct! Stay put." : "Wrong! Back 3 squares.";
          sfx(ok ? "correct" : "wrong");
          $("aContinue").hidden = false;
          $("aContinue").onclick = function () {
            $("aModal").hidden = true;
            resolve(ok);
          };
        };
        box.appendChild(btn);
      });
      $("aModal").hidden = false;
    });
  }

  async function doRollOffline() {
    if (state.busy) return;
    state.busy = true;
    $("diceBtn").disabled = true;
    $("diceBtn").classList.add("rolling");
    sfx("roll");
    var final = 1 + Math.floor(Math.random() * 6);
    showDie(final, true);
    await sleep(1300);
    $("diceBtn").classList.remove("rolling");
    $("diceLabel").textContent = "Rolled " + final;

    var player = state.turn;
    var pos = state.positions[player];
    if (final > 100 - pos) {
      setMsg("Need exact number to finish. Turn skipped.");
      await sleep(800);
      state.turn = (state.turn + 1) % state.count;
      state.busy = false;
      $("diceBtn").disabled = false;
      $("diceLabel").textContent = "Tap to roll";
      updateHUD();
      return;
    }
    var landed = await movePlayerOffline(player, final);
    if (landed >= 100) {
      sfx("win");
      $("winTitle").textContent = state.names[player] + " wins!";
      $("winModal").hidden = false; celebrate();
      return;
    }
    if (QUESTION_SQUARES.indexOf(landed) >= 0) {
      setMsg("Question for " + state.names[player] + "!");
      var q = pickOneOffline();
      var ok = await askQuestionOffline(player, q);
      if (!ok) {
        state.positions[player] = Math.max(1, state.positions[player] - 3);
        placeTokens();
        highlight(state.positions[player]);
        setMsg(state.names[player] + " goes back to " + state.positions[player]);
        await sleep(450);
      } else {
        setMsg(state.names[player] + " answered correctly — stays on " + landed);
        await sleep(350);
      }
    }
    state.turn = (state.turn + 1) % state.count;
    state.busy = false;
    $("diceBtn").disabled = false;
    $("diceLabel").textContent = "Tap to roll";
    updateHUD();
    setMsg(state.names[state.turn] + " — roll the dice");
  }

  function startOffline() {
    mode = "offline";
    var n = state.count, p;
    state.names = [];
    for (p = 0; p < n; p++) state.names.push((($("name" + (p + 1)).value) || ("Player " + (p + 1))).trim().slice(0, 12));
    state.positions = [];
    for (p = 0; p < n; p++) state.positions.push(1);
    state.turn = 0; state.busy = false; state.usedQ = {};
    showScreen("screenPlay");
    $("winModal").hidden = true; $("qModal").hidden = true; $("aModal").hidden = true;
    $("tokensLayer").innerHTML = "";
    initBoardUI();
    showDie(1);
    $("diceBtn").disabled = false;
    $("diceLabel").textContent = "Tap to roll";
    setMsg(state.names[0] + " starts");
  }

  // —— Online ——
  function inviteUrl(code) {
    var u = new URL(location.href);
    u.searchParams.set("room", code);
    return u.toString();
  }

  function setOnlineStatus(msg) {
    var el = $("onlineStatus");
    if (el) el.textContent = msg || "";
    var el2 = $("lobbyStatus");
    if (el2 && msg) el2.textContent = msg;
  }

  function applyOnlineState(sl) {
    if (!sl) return;
    onlineSl = sl;
    var ids = sl.playerIds || [];
    state.count = ids.length || 2;
    state.names = []; state.positions = [];
    ids.forEach(function (id, i) {
      state.names[i] = (sl.names && sl.names[id]) || ("Player " + (i + 1));
      state.positions[i] = sl.positions[id] || 1;
    });
    state.turn = sl.turnIndex || 0;
    placeTokens();
    updateHUD();
    if (sl.lastDice) {
      showDie(sl.lastDice);
      $("diceLabel").textContent = "Rolled " + sl.lastDice;
    }
    setMsg(sl.message || "");

    var myTurn = sl.turnId === myId && sl.phase === "roll";
    $("diceBtn").disabled = !myTurn || sl.status === "finished";
    if (myTurn) $("diceLabel").textContent = "Tap to roll";

    // Question pick for opponent
    if (sl.phase === "pickQuestion" && sl.pickFor === myId && sl.pendingQuestions) {
      showOnlinePicker(sl);
    } else {
      $("qModal").hidden = true;
    }

    // Answer
    if (sl.phase === "answer" && sl.answerFor === myId && sl.currentQuestion) {
      showOnlineAnswer(sl.currentQuestion);
    } else if (sl.phase !== "answer") {
      $("aModal").hidden = true;
    }

    if (sl.status === "finished" || sl.winnerId) {
      var wname = (sl.names && sl.names[sl.winnerId]) || "Player";
      $("winTitle").textContent = wname + " wins!";
      $("winModal").hidden = false; celebrate();
      sfx("win");
    }
  }

  function showOnlineTyped(question) {
    $("aWho").textContent = "Your question";
    typedBox(question, function (vals) {
      var payload = question.blanks ? { texts: vals } : { text: vals[0] };
      socket.emit("sl:answer", payload, function (res) {
        if (res && res.correct != null) showTypedResult(!!res.correct, res.answer);
        $("aContinue").onclick = function () { $("aModal").hidden = true; };
      });
    });
  }

  function showOnlinePicker(sl) {
    sfx("question");
    $("qWho").textContent = "You choose a question";
    $("qTarget").textContent = (sl.names && sl.names[sl.answerFor]) || "opponent";
    var list = $("qList");
    list.innerHTML = "";
    sl.pendingQuestions.forEach(function (item, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sl-qpick";
      btn.textContent = idx + 1 + ". " + item.q;
      btn.onclick = function () {
        sfx("click");
        socket.emit("sl:pick", { questionId: item.id });
        $("qModal").hidden = true;
      };
      list.appendChild(btn);
    });
    $("qModal").hidden = false;
  }

  function showOnlineAnswer(question) {
    if (question.type === "type") return showOnlineTyped(question);
    $("aWho").textContent = "Your question";
    $("aText").textContent = formatQuestionText(question.q);
    var box = $("aChoices");
    box.innerHTML = "";
    $("aResult").hidden = true;
    $("aContinue").hidden = true;
    var shuffled = shuffleQuestionChoices(question);
    shuffled.choices.forEach(function (c, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sl-choice";
      btn.textContent = c;
      btn.onclick = function () {
        Array.prototype.forEach.call(box.children, function (b) { b.disabled = true; });
        var originalIndex = shuffled.toOriginal(i);
        socket.emit("sl:answer", { choiceIndex: originalIndex }, function (res) {
          if (res && res.correct != null) {
            var resEl = $("aResult");
            resEl.hidden = false;
            resEl.className = "sl-result " + (res.correct ? "ok" : "bad");
            resEl.textContent = res.correct ? "Correct!" : "Wrong — back 3";
            sfx(res.correct ? "correct" : "wrong");
            Array.prototype.forEach.call(box.children, function (b, j) {
              if (j === shuffled.answer) b.classList.add("correct");
              if (j === i && !res.correct) b.classList.add("wrong");
            });
          }
          $("aContinue").hidden = false;
          $("aContinue").onclick = function () { $("aModal").hidden = true; };
        });
      };
      box.appendChild(btn);
    });
    $("aModal").hidden = false;
  }

  function renderLobby(room) {
    lastRoom = room;
    $("lobbyCode").textContent = room.code;
    $("inviteLink").value = inviteUrl(room.code);
    var list = $("lobbyPlayers");
    list.innerHTML = (room.players || []).map(function (p) {
      var you = p.id === myId ? " (you)" : "";
      var host = p.isHost ? '<span class="tag">HOST</span>' : "";
      return '<div class="sl-lobby-row"><span>' + (p.displayName || p.username) + you + "</span>" + host + "</div>";
    }).join("");
    var isHost = !!(myId && room.hostId && String(room.hostId) === String(myId));
    var nPlayers = (room.players || []).length;
    var canStart = isHost && nPlayers >= 2;
    $("btnStartOnline").hidden = !canStart;
    $("btnStartOnline").disabled = false;
    $("btnStartOnline").textContent = "Start Game";
    if (nPlayers < 2) {
      $("lobbyStatus").textContent = "Waiting for opponent… (" + nPlayers + "/2)";
    } else if (isHost) {
      $("lobbyStatus").textContent = "Both players ready — tap Start Game";
    } else {
      $("lobbyStatus").textContent = "Waiting for host to start…";
    }
  }

  function wireSocketHandlers() {
    if (!socket || socket.__slWired) return;
    socket.__slWired = true;
    socket.on("connect", function () {
      setOnlineStatus("Connected");
    });
    socket.on("connect_error", function (err) {
      setOnlineStatus("Connection failed: " + (err && err.message ? err.message : "error"));
      var btn = $("btnCreateRoom");
      if (btn) { btn.disabled = false; btn.textContent = "Create room"; }
    });
    socket.on("server:hello", function (d) {
      if (d && d.player) myId = d.player.id;
      if (d && d.phase != null && Number(d.phase) < 4) {
        setOnlineStatus("Server is outdated (phase " + d.phase + "). Redeploy multiplayer-server with Snakes & Ladders.");
      }
    });
    socket.on("room:update", function (room) {
      lastRoom = room;
      if (room.status === "lobby") {
        showScreen("screenLobby");
        renderLobby(room);
      } else if (room.status === "playing" || room.status === "ended") {
        if (room.game && room.game.type === "snakes-ladders") {
          mode = "online";
          showScreen("screenPlay");
          if (!$("board").children.length) initBoardUI();
          applyOnlineState(room.game);
        } else if (room.game && room.game.type === "a-an-swipe") {
          $("lobbyStatus").textContent = "Server started A/An instead — redeploy multiplayer server with Snakes & Ladders support";
        }
      }
    });
    socket.on("sl:update", function (payload) {
      if (payload && payload.sl) {
        if (payload.events && payload.events.length) {
          var ev = payload.events[0];
          if (ev.dice) {
            showDie(ev.dice, true);
            sfx("roll");
          }
          if (ev.type === "ladder" || (ev.path && ev.path.some(function (p) { return p.event === "ladder"; }))) sfx("ladder");
          if (ev.type === "snake" || (ev.path && ev.path.some(function (p) { return p.event === "snake"; }))) sfx("snake");
          if (ev.type === "win") sfx("win");
        }
        applyOnlineState(payload.sl);
      }
    });
    socket.on("room:error", function (e) {
      setOnlineStatus((e && e.error) || "Room error");
      var btn = $("btnCreateRoom");
      if (btn) { btn.disabled = false; btn.textContent = "Create room"; }
    });
  }

  function wakeServer() {
    // Hit HTTP health first so Render cold-start begins before Socket.IO
    return fetch(SERVER_URL + "/health", { method: "GET", mode: "cors", cache: "no-store" })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.ok) setOnlineStatus("Server online — connecting…");
        else setOnlineStatus("Server reachable — connecting…");
      })
      .catch(function () {
        setOnlineStatus("Waking server… (this can take up to 40s)");
      });
  }

  function connectSocket() {
    return new Promise(function (resolve, reject) {
      if (typeof io === "undefined") {
        setOnlineStatus("Socket library missing");
        reject(new Error("no io"));
        return;
      }
      if (!accessToken) {
        setOnlineStatus("Not logged in");
        reject(new Error("no token"));
        return;
      }
      if (socket && socket.connected) {
        wireSocketHandlers();
        resolve(socket);
        return;
      }
      if (socket) {
        try { socket.disconnect(); } catch (e) {}
        socket = null;
      }
      setOnlineStatus("Connecting to server… (first load can take up to 40s)");
      socket = io(SERVER_URL, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 4,
        timeout: 20000,
      });
      wireSocketHandlers();
      var done = false;
      var ticks = 0;
      var waitTimer = setInterval(function () {
        ticks += 1;
        if (ticks === 8) setOnlineStatus("Server may be waking up… still trying");
        if (ticks === 20) setOnlineStatus("Almost there… free servers are slow to start");
      }, 1000);
      function ok() {
        if (done) return;
        done = true;
        clearInterval(waitTimer);
        setOnlineStatus("Connected");
        resolve(socket);
      }
      function fail(err) {
        if (done) return;
        done = true;
        clearInterval(waitTimer);
        var msg = (err && err.message) ? err.message : "error";
        if (msg === "timeout") {
          msg = "Server took too long (try again — it may be waking up)";
        }
        setOnlineStatus("Connection failed: " + msg);
        reject(err || new Error("connect_error"));
      }
      socket.once("connect", ok);
      socket.once("connect_error", fail);
      setTimeout(function () {
        if (!done) fail(new Error("timeout"));
      }, 45000);
    });
  }

  async function getAccessToken() {
    if (!window.LAAuth || !window.LAAuth.getClient) return null;
    var client = window.LAAuth.getClient();
    if (!client) return null;
    try {
      var res = await client.auth.getSession();
      if (res.data && res.data.session && res.data.session.access_token) {
        return res.data.session.access_token;
      }
    } catch (e) {}
    return null;
  }

  async function ensureLoggedIn() {
    await new Promise(function (resolve) {
      if (window.LAAuth && window.supabase) return resolve();
      document.addEventListener("supabase-ready", function () {
        setTimeout(resolve, 50);
      }, { once: true });
      setTimeout(resolve, 3000);
    });

    var loginGate = $("loginGate");
    var actions = $("onlineActions");

    if (!window.LAAuth) {
      loginGate.hidden = false;
      actions.hidden = true;
      setOnlineStatus("Auth system not loaded");
      return false;
    }

    var session = window.LAAuth.getSession();
    if (!session) {
      try { session = await window.LAAuth.verify(); } catch (e) {}
    }
    if (!session) {
      loginGate.hidden = false;
      actions.hidden = true;
      var redirect = encodeURIComponent(location.pathname + location.search);
      $("loginLink").href = "/learningarcade/auth-system/login.html?redirect=" + redirect;
      return false;
    }

    accessToken = await getAccessToken();
    if (!accessToken) {
      loginGate.hidden = false;
      actions.hidden = true;
      setOnlineStatus("Could not get session token. Try logging in again.");
      return false;
    }

    loginGate.hidden = true;
    actions.hidden = false;
    return true;
  }

  async function startOnlineFlow() {
    mode = "online";
    showScreen("screenOnlineHome");
    setOnlineStatus("Checking login…");
    var ok = await ensureLoggedIn();
    if (!ok) return;
    setOnlineStatus("");
    try {
      setOnlineStatus("Waking server…");
      await wakeServer();
      await connectSocket();
      var params = new URLSearchParams(location.search);
      var room = params.get("room");
      if (room) {
        setOnlineStatus("Joining " + room + "…");
        socket.emit("room:join", { code: room }, function (res) {
          if (!res || !res.ok) setOnlineStatus((res && res.error) || "Join failed");
          else if (res.room) {
            lastRoom = res.room;
            showScreen("screenLobby");
            renderLobby(res.room);
          }
        });
      } else {
        setOnlineStatus("Ready — create or join a room");
      }
    } catch (e) {
      setOnlineStatus("Could not connect: " + ((e && e.message) || "error"));
    }
  }

  // —— Events ——
  $("btnOffline").onclick = function () {
    sfx("click");
    showScreen("screenOffline");
  };
  $("btnOnline").onclick = function () {
    sfx("click");
    startOnlineFlow();
  };
  $("backFromOffline").onclick = function () { showScreen("screenMode"); };
  $("backFromOnline").onclick = function () {
    if (socket) { socket.emit("room:leave"); }
    showScreen("screenMode");
  };
  $("btnStartOffline").onclick = startOffline;
  $("diceBtn").onclick = function () {
    if (mode === "offline") doRollOffline();
    else if (mode === "online" && socket) {
      $("diceBtn").disabled = true;
      socket.emit("sl:roll");
    }
  };
  $("btnCreateRoom").onclick = async function () {
    var btn = $("btnCreateRoom");
    btn.disabled = true;
    btn.textContent = "Creating…";
    setOnlineStatus("Checking login…");
    try {
      var ok = await ensureLoggedIn();
      if (!ok) {
        btn.disabled = false;
        btn.textContent = "Create room";
        return;
      }
      setOnlineStatus("Waking server…");
      await wakeServer();
      setOnlineStatus("Connecting…");
      await connectSocket();
      setOnlineStatus("Creating room…");
      await new Promise(function (resolve, reject) {
        var settled = false;
        var t = setTimeout(function () {
          if (settled) return;
          settled = true;
          reject(new Error("Server did not respond to create room"));
        }, 15000);
        socket.emit("room:create", { gameType: "snakes-ladders" }, function (res) {
          if (settled) return;
          settled = true;
          clearTimeout(t);
          if (!res || !res.ok) {
            reject(new Error((res && res.error) || "Could not create room"));
            return;
          }
          lastRoom = res.room;
          setOnlineStatus("Room created");
          showScreen("screenLobby");
          renderLobby(res.room);
          resolve(res);
        });
      });
    } catch (e) {
      var msg = (e && e.message) ? e.message : "error";
      if (/timeout|waking|too long/i.test(msg)) {
        setOnlineStatus("Server is slow to wake — wait a few seconds and try again");
      } else {
        setOnlineStatus("Create failed: " + msg);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = "Create room";
    }
  };
  $("btnJoinRoom").onclick = async function () {
    var code = ($("joinCodeInput").value || "").trim().toUpperCase();
    if (!code) {
      setOnlineStatus("Enter a room code");
      return;
    }
    setOnlineStatus("Checking login…");
    try {
      var ok = await ensureLoggedIn();
      if (!ok) return;
      setOnlineStatus("Waking server…");
      await wakeServer();
      await connectSocket();
      setOnlineStatus("Joining " + code + "…");
      await new Promise(function (resolve, reject) {
        var settled = false;
        var t = setTimeout(function () {
          if (settled) return;
          settled = true;
          reject(new Error("Join timed out"));
        }, 15000);
        socket.emit("room:join", { code: code }, function (res) {
          if (settled) return;
          settled = true;
          clearTimeout(t);
          if (!res || !res.ok) {
            reject(new Error((res && res.error) || "Join failed"));
            return;
          }
          lastRoom = res.room;
          showScreen("screenLobby");
          renderLobby(res.room);
          resolve(res);
        });
      });
    } catch (e) {
      setOnlineStatus("Join failed: " + ((e && e.message) || "error"));
    }
  };
  $("btnStartOnline").onclick = function () {
    if (!socket) {
      $("lobbyStatus").textContent = "Not connected — go back and try again";
      return;
    }
    if (!lastRoom || (lastRoom.players || []).length < 2) {
      $("lobbyStatus").textContent = "Need 2 players to start";
      return;
    }
    var btn = $("btnStartOnline");
    btn.disabled = true;
    btn.textContent = "Starting…";
    $("lobbyStatus").textContent = "Starting game…";
    socket.emit("sl:start", { level: state.level }, function (res) {
      btn.disabled = false;
      btn.textContent = "Start Game";
      if (!res || !res.ok) {
        $("lobbyStatus").textContent = (res && res.error) || "Could not start — is the multiplayer server updated for Snakes & Ladders?";
        return;
      }
      // Prefer SL payload from server
      var room = res.room;
      var sl = res.sl || (room && room.game);
      if (room) lastRoom = room;
      if (sl && (sl.type === "snakes-ladders" || (room && room.game && room.game.type === "snakes-ladders"))) {
        mode = "online";
        showScreen("screenPlay");
        if (!$("board").children.length) initBoardUI();
        applyOnlineState(sl.type ? sl : room.game);
      } else if (room && room.status === "playing") {
        // Fallback if public room shape differs
        mode = "online";
        showScreen("screenPlay");
        if (!$("board").children.length) initBoardUI();
        if (room.game) applyOnlineState(room.game);
      } else {
        $("lobbyStatus").textContent = "Started — waiting for board sync…";
      }
    });
  };
  $("btnCopy").onclick = function () {
    var input = $("inviteLink");
    input.select();
    try {
      navigator.clipboard.writeText(input.value);
      setOnlineStatus("Link copied!");
    } catch (e) {
      document.execCommand("copy");
    }
  };
  $("btnLeaveRoom").onclick = function () {
    if (socket) socket.emit("room:leave");
    showScreen("screenOnlineHome");
  };
  $("btnExitPlay").onclick = function () {
    if (mode === "online" && socket) socket.emit("room:leave");
    $("winModal").hidden = true;
    showScreen("screenMode");
  };
  $("btnAgain").onclick = function () {
    $("winModal").hidden = true;
    showScreen("screenMode");
  };
// Deep link ?room=
  if (new URLSearchParams(location.search).get("room")) {
    startOnlineFlow();
  } else {
    showScreen("screenMode");
  }
})();
