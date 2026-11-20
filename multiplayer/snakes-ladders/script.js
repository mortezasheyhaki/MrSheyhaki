/* Snakes & Ladders · Offline (same device) + Online (invite friend) */
(function () {
  "use strict";

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
  var audioCtx = null;
  function ctx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(function () {});
    return audioCtx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = ctx(); if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.1, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function sfx(name) {
    try {
      if (name === "roll") { tone(200, 0.05, "square", 0.06); tone(320, 0.08, "square", 0.05, 0.1); }
      else if (name === "move") tone(440, 0.06, "triangle", 0.07);
      else if (name === "ladder") { tone(523, 0.1, "sine", 0.1); tone(784, 0.15, "sine", 0.1, 0.12); }
      else if (name === "snake") { tone(300, 0.2, "sawtooth", 0.07); tone(160, 0.25, "sawtooth", 0.06, 0.12); }
      else if (name === "correct") { tone(523, 0.1, "sine", 0.11); tone(784, 0.15, "sine", 0.1, 0.12); }
      else if (name === "wrong") { tone(220, 0.15, "sawtooth", 0.08); tone(160, 0.2, "sawtooth", 0.07, 0.1); }
      else if (name === "win") [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.09); });
      else if (name === "click") tone(600, 0.04, "triangle", 0.05);
      else if (name === "question") { tone(480, 0.08, "sine", 0.08); tone(620, 0.1, "sine", 0.07, 0.1); }
    } catch (e) {}
  }

  function showScreen(id) {
    ["screenMode", "screenOffline", "screenOnlineHome", "screenLobby", "screenPlay"].forEach(function (s) {
      var el = $(s);
      if (el) el.hidden = s !== id;
    });
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
    var svg = $("laddersSvg");
    svg.innerHTML = "";
    Object.keys(LADDERS).forEach(function (fromStr) {
      var from = +fromStr, to = LADDERS[from];
      var a = cellCenters[from], b = cellCenters[to];
      if (!a || !b) return;
      var x1 = a.x * 10, y1 = a.y * 10, x2 = b.x * 10, y2 = b.y * 10;
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var px = (-dy / len) * 10, py = (dx / len) * 10;
      [[x1 + px, y1 + py, x2 + px, y2 + py], [x1 - px, y1 - py, x2 - px, y2 - py]].forEach(function (r) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", r[0]); line.setAttribute("y1", r[1]);
        line.setAttribute("x2", r[2]); line.setAttribute("y2", r[3]);
        line.setAttribute("stroke", "#b45309"); line.setAttribute("stroke-width", "5");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
      });
      var steps = Math.max(3, Math.floor(len / 45));
      for (var i = 1; i < steps; i++) {
        var t = i / steps, cx = x1 + dx * t, cy = y1 + dy * t;
        var rung = document.createElementNS("http://www.w3.org/2000/svg", "line");
        rung.setAttribute("x1", cx + px); rung.setAttribute("y1", cy + py);
        rung.setAttribute("x2", cx - px); rung.setAttribute("y2", cy - py);
        rung.setAttribute("stroke", "#d97706"); rung.setAttribute("stroke-width", "4");
        svg.appendChild(rung);
      }
    });
  }

  function drawSnakes() {
    var svg = $("snakesSvg");
    svg.innerHTML = "";
    var colors = ["#10b981", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6"];
    var i = 0;
    Object.keys(SNAKES).forEach(function (fromStr) {
      var from = +fromStr, to = SNAKES[from];
      var a = cellCenters[from], b = cellCenters[to];
      if (!a || !b) return;
      var x1 = a.x * 10, y1 = a.y * 10, x2 = b.x * 10, y2 = b.y * 10;
      var mx = (x1 + x2) / 2 + (y1 - y2) * 0.2;
      var my = (y1 + y2) / 2 + (x2 - x1) * 0.15;
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M " + x1 + " " + y1 + " Q " + mx + " " + my + " " + x2 + " " + y2);
      path.setAttribute("stroke", colors[i % colors.length]);
      path.setAttribute("class", "snake-body");
      path.style.strokeWidth = "12";
      path.setAttribute("fill", "none");
      svg.appendChild(path);
      var head = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      head.setAttribute("cx", x1); head.setAttribute("cy", y1); head.setAttribute("r", "11");
      head.setAttribute("fill", colors[i % colors.length]);
      svg.appendChild(head);
      i++;
    });
  }

  function placeTokensFromPositions(posArr) {
    var layer = $("tokensLayer");
    layer.innerHTML = "";
    for (var p = 0; p < 2; p++) {
      var n = posArr[p];
      var c = cellCenters[n];
      if (!c) continue;
      var tok = document.createElement("div");
      tok.className = "sl-token p" + (p + 1);
      tok.id = "token" + p;
      var offset = posArr[0] === posArr[1] ? (p === 0 ? -1.2 : 1.2) : 0;
      tok.style.left = (c.x + offset) + "%";
      tok.style.top = (c.y + offset) + "%";
      layer.appendChild(tok);
    }
  }

  function placeTokens() {
    placeTokensFromPositions(state.positions);
  }

  function updateHUD() {
    $("hudName1").textContent = state.names[0];
    $("hudName2").textContent = state.names[1];
    $("hudPos1").textContent = state.positions[0];
    $("hudPos2").textContent = state.positions[1];
    $("chip1").classList.toggle("active", state.turn === 0);
    $("chip2").classList.toggle("active", state.turn === 1);
    $("turnBanner").textContent = state.names[state.turn] + "'s turn";
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
    var pool = QUESTIONS.filter(function (q) { return !state.usedQ[q.id]; });
    if (pool.length < 1) { state.usedQ = {}; pool = QUESTIONS.slice(); }
    var item = pool[Math.floor(Math.random() * pool.length)];
    state.usedQ[item.id] = true;
    return item;
  }

  function askQuestionOffline(player, question) {
    return new Promise(function (resolve) {
      sfx("question");
      $("aWho").textContent = "Question for " + state.names[player];
      $("aText").textContent = question.q;
      var box = $("aChoices");
      box.innerHTML = "";
      $("aResult").hidden = true;
      $("aContinue").hidden = true;
      var answered = false;
      question.choices.forEach(function (c, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sl-choice";
        btn.textContent = c;
        btn.onclick = function () {
          if (answered) return;
          answered = true;
          var ok = i === question.answer;
          Array.prototype.forEach.call(box.children, function (b, j) {
            b.disabled = true;
            if (j === question.answer) b.classList.add("correct");
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
    for (var i = 0; i < 8; i++) {
      $("diceFace").textContent = DICE_FACES[Math.floor(Math.random() * 6)];
      await sleep(55);
    }
    $("diceFace").textContent = DICE_FACES[final - 1];
    $("diceBtn").classList.remove("rolling");
    $("diceLabel").textContent = "Rolled " + final;

    var player = state.turn;
    var pos = state.positions[player];
    if (final > 100 - pos) {
      setMsg("Need exact number to finish. Turn skipped.");
      await sleep(800);
      state.turn = 1 - state.turn;
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
      $("winModal").hidden = false;
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
    state.turn = 1 - state.turn;
    state.busy = false;
    $("diceBtn").disabled = false;
    $("diceLabel").textContent = "Tap to roll";
    updateHUD();
    setMsg(state.names[state.turn] + " — roll the dice");
  }

  function startOffline() {
    mode = "offline";
    state.names[0] = ($("name1").value || "Player 1").trim().slice(0, 12);
    state.names[1] = ($("name2").value || "Player 2").trim().slice(0, 12);
    state.positions = [1, 1];
    state.turn = 0;
    state.busy = false;
    state.usedQ = {};
    showScreen("screenPlay");
    $("winModal").hidden = true;
    $("qModal").hidden = true;
    $("aModal").hidden = true;
    initBoardUI();
    $("diceFace").textContent = "🎲";
    $("diceLabel").textContent = "Tap to roll";
    $("diceBtn").disabled = false;
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
    state.names[0] = (sl.names && sl.names[ids[0]]) || "Player 1";
    state.names[1] = (sl.names && sl.names[ids[1]]) || "Player 2";
    state.positions[0] = sl.positions[ids[0]] || 1;
    state.positions[1] = sl.positions[ids[1]] || 1;
    state.turn = sl.turnIndex || 0;
    placeTokens();
    updateHUD();
    if (sl.lastDice) {
      $("diceFace").textContent = DICE_FACES[sl.lastDice - 1];
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
      $("winModal").hidden = false;
      sfx("win");
    }
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
    $("aWho").textContent = "Your question";
    $("aText").textContent = question.q;
    var box = $("aChoices");
    box.innerHTML = "";
    $("aResult").hidden = true;
    $("aContinue").hidden = true;
    question.choices.forEach(function (c, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sl-choice";
      btn.textContent = c;
      btn.onclick = function () {
        Array.prototype.forEach.call(box.children, function (b) { b.disabled = true; });
        socket.emit("sl:answer", { choiceIndex: i }, function (res) {
          if (res && res.correct != null) {
            var resEl = $("aResult");
            resEl.hidden = false;
            resEl.className = "sl-result " + (res.correct ? "ok" : "bad");
            resEl.textContent = res.correct ? "Correct!" : "Wrong — back 3";
            sfx(res.correct ? "correct" : "wrong");
            if (typeof res.answer === "number") {
              Array.prototype.forEach.call(box.children, function (b, j) {
                if (j === res.answer) b.classList.add("correct");
                if (j === i && !res.correct) b.classList.add("wrong");
              });
            }
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
            $("diceFace").textContent = DICE_FACES[ev.dice - 1];
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
    socket.emit("sl:start", {}, function (res) {
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
