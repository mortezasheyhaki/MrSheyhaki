/* Penalty Shootout – offline (same screen) mode.
   Rules live in engine.js, questions in subjects.js. This file is the screens and the animation. */
(function () {
  "use strict";

  var E = window.PenaltyEngine;
  var SUBJECTS = window.PENALTY_SUBJECTS || [];
  var COLORS = ["#f472b6", "#22d3ee"];
  var ZONE_LABEL = { left: "Left", center: "Middle", right: "Right" };
  // where the ball ends up for each corner (% of the pitch)
  var TARGET = { left: { x: 29.2, y: 34 }, center: { x: 50, y: 34 }, right: { x: 70.8, y: 34 } };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  var timers = [];
  var S = {
    subject: SUBJECTS[0] || null, rounds: 5, names: ["Player 1", "Player 2"],
    match: null, nextQ: null, shot: null, dive: null, shooterCorrect: false, keeperCorrect: false, picking: null, pickedZone: null
  };

  /* ---------- sound ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("pk-muted") === "1"; } catch (e) {}
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = ac(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, gain, delay, freq) {
    var c = ac(); if (!c || muted) return;
    var len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (delay || 0);
    src.buffer = buf; f.type = "lowpass"; f.frequency.value = freq || 1800;
    g.gain.setValueAtTime(gain || 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
  }
  var SFX = {
    tap: function () { tone(620, 0.05, "triangle", 0.07); },
    pick: function () { tone(820, 0.07, "triangle", 0.08); },
    right: function () { tone(660, 0.12, "triangle", 0.1); tone(990, 0.2, "triangle", 0.1, 0.09); },
    wrong: function () { tone(220, 0.16, "square", 0.06, 0, 150); tone(160, 0.22, "square", 0.05, 0.12, 110); },
    whistle: function () { tone(2300, 0.28, "sine", 0.06); tone(2500, 0.2, "sine", 0.05, 0.3); },
    kick: function () { noise(0.12, 0.2, 0, 900); tone(140, 0.1, "sine", 0.12, 0, 70); },
    goal: function () { noise(1.3, 0.13, 0, 2400); [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.28, "triangle", 0.1, 0.05 + i * 0.09); }); },
    save: function () { tone(110, 0.18, "sine", 0.2, 0, 60); noise(0.2, 0.1, 0, 700); tone(740, 0.15, "triangle", 0.07, 0.08); },
    miss: function () { tone(420, 0.45, "triangle", 0.08, 0, 160); noise(0.5, 0.05, 0.05, 1200); },
    win: function () { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); noise(1.6, 0.12, 0.1, 2600); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }
  function paintMute() { $("btnMute").textContent = muted ? "🔇" : "🔊"; $("btnMute").setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound"); }
  $("btnMute").addEventListener("click", function () {
    muted = !muted; try { localStorage.setItem("pk-muted", muted ? "1" : "0"); } catch (e) {}
    paintMute(); if (!muted) sfx("tap");
  });

  /* ---------- screens ---------- */
  function showScreen(id) {
    ["screenSetup", "screenPlay"].forEach(function (s) { $(s).hidden = s !== id; });
    document.body.classList.toggle("mp-playing", id === "screenPlay");
    window.scrollTo(0, 0);
  }


  /* ---------- setup ---------- */
  function renderSubjects() {
    var list = $("subjectList");
    if (!SUBJECTS.length) { list.innerHTML = '<p class="mp-panel-desc">No subjects yet. Add some in subjects.js.</p>'; $("btnStart").disabled = true; return; }
    list.innerHTML = SUBJECTS.map(function (s, i) {
      return '<button type="button" class="pk-subject' + (s === S.subject ? " is-on" : "") + '" role="radio" aria-checked="' + (s === S.subject) + '" data-i="' + i + '">' +
        '<span class="pk-subject-ico" aria-hidden="true">' + esc(s.emoji || "📘") + '</span>' +
        '<span><strong>' + esc(s.title) + '</strong><small>' + esc(s.tag || "") + (s.questions ? " · " + s.questions.length + " questions" : "") + '</small></span></button>';
    }).join("");
  }
  $("subjectList").addEventListener("click", function (ev) {
    var b = ev.target.closest(".pk-subject"); if (!b) return;
    S.subject = SUBJECTS[+b.getAttribute("data-i")]; sfx("pick"); renderSubjects();
  });
  $("segRounds").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    S.rounds = +b.getAttribute("data-n"); sfx("pick");
    Array.prototype.forEach.call($("segRounds").children, function (x) { x.classList.toggle("is-on", x === b); });
  });

  $("btnStart").addEventListener("click", function () {
    ac(); sfx("tap");
    var n1 = ($("name1").value || "").trim() || "Player 1";
    var n2 = ($("name2").value || "").trim() || "Player 2";
    if (n1.toLowerCase() === n2.toLowerCase()) n2 += " 2";
    S.names = [n1, n2];
    startMatch();
  });

  /* ---------- match ---------- */
  function startMatch() {
    clearTimers();
    $("winModal").hidden = true;
    S.match = E.newMatch(S.names, S.rounds);
    S.nextQ = E.makeDeck(S.subject.questions);
    showScreen("screenPlay");
    paintMute();
    renderBoard();
    phaseIntro();
  }

  function info() { return E.kickInfo(S.match); }
  function pname(i) { return esc(S.match.names[i]); }
  function setPanel(html) { var p = $("panel"); p.innerHTML = html; p.style.animation = "none"; void p.offsetWidth; p.style.animation = ""; }
  function bind(id, fn) { var el = $(id); if (el) el.addEventListener("click", function () { ac(); sfx("tap"); fn(); }); }

  function renderBoard() {
    var m = S.match, k = info(), total = 2 * m.rounds;
    function side(i) {
      var n = Math.max(m.rounds, m.log[i].length), dots = "";
      for (var d = 0; d < n; d++) dots += '<i class="' + (m.log[i][d] || "") + '"></i>';
      var role = i === k.shooter ? "⚽ Shooter" : "🧤 Keeper";
      return '<div class="pk-side is-p' + (i + 1) + (i === k.shooter ? " is-shooter" : "") + '">' +
        '<div class="pk-side-top"><span class="pk-pname">' + pname(i) + '</span><span class="pk-goals">' + m.goals[i] + '</span></div>' +
        '<div class="pk-side-top"><span class="pk-role">' + role + '</span></div>' +
        '<div class="pk-dots" aria-hidden="true">' + dots + '</div></div>';
    }
    var mid = k.sudden ? '<b class="sd">Sudden death</b><small>Next goal wins</small>' : '<b>Kick ' + (Math.min(m.kick, total - 1) + 1) + '/' + total + '</b><small>Round ' + k.round + '</small>';
    $("board").innerHTML = side(0) + '<div class="pk-mid">' + mid + '</div>' + side(1);
    $("scene").style.setProperty("--keeper", COLORS[k.keeper]);
  }

  /* ---------- the scene ---------- */
  function resetScene() {
    var ball = $("ball"), keeper = $("keeper");
    ball.style.transition = "none"; keeper.style.transition = "none";
    ball.style.left = "50%"; ball.style.top = "77%"; ball.style.transform = "scale(1)"; ball.style.opacity = "1";
    keeper.style.transform = "none";
    ball.classList.remove("spin");
    void ball.offsetWidth;
    $("banner").hidden = true;
    clearZones();
    setPick(null);
  }
  function clearZones() {
    Array.prototype.forEach.call(document.querySelectorAll(".pk-zone"), function (z) { z.classList.remove("is-picked", "is-result"); });
    S.pickedZone = null;
  }
  function setPick(kind) { $("scene").setAttribute("data-pick", kind || ""); S.picking = kind; }

  $("zones").addEventListener("click", function (ev) {
    var z = ev.target.closest(".pk-zone");
    if (!z || !S.picking) return;
    S.pickedZone = z.getAttribute("data-zone");
    Array.prototype.forEach.call(document.querySelectorAll(".pk-zone"), function (x) { x.classList.toggle("is-picked", x === z); });
    sfx("pick");
    var lock = $("btnLock");
    if (lock) { lock.disabled = false; lock.textContent = (S.picking === "shot" ? "Lock shot 🔒 · " : "Dive! 🧤 · ") + ZONE_LABEL[S.pickedZone]; }
  });

  /* ---------- phases of one kick ---------- */
  function phaseIntro() {
    resetScene(); renderBoard();
    var k = info();
    S.shot = null; S.dive = null; S.shooterCorrect = false; S.keeperCorrect = false;
    setPanel(
      '<div class="pk-center">' +
      '<p class="pk-kicker">' + (k.sudden ? "Sudden death" : "Round " + k.round + " · Kick " + (S.match.kick + 1) + "/" + 2 * S.match.rounds) + '</p>' +
      '<h2 class="pk-title">Get ready!</h2>' +
      '<div class="pk-who"><span class="pk-vs p' + (k.shooter + 1) + '">⚽ ' + pname(k.shooter) + ' shoots</span><span class="pk-vs p' + (k.keeper + 1) + '">🧤 ' + pname(k.keeper) + ' keeps</span></div>' +
      '<p class="pk-sub"><strong>' + pname(k.shooter) + '</strong>, hold the device. ' + pname(k.keeper) + ', look away for a moment.</p>' +
      '<div class="pk-actions"><button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnGo">I\'m ready ⚽</button></div></div>'
    );
    bind("btnGo", function () { sfx("whistle"); ask(k.shooter, "shoot", function (ok, q, shown) { S.shooterCorrect = ok; afterShooterAnswer(ok, shown); }); });
  }

  // one question for `who`. Chip questions show answer chips; "write" questions show a writing box.
  // done(correct, question, shownAnswer) is called once the player has answered.
  function ask(who, verb, done) {
    var subj = S.subject, q = S.nextQ(), answered = false;
    var isWrite = q.type === "write";
    var shown = isWrite ? [].concat(q.answers || q.answer)[0] : q.answer;
    var prompt = q.prompt || subj.prompt || "Choose the correct answer.";
    var head =
      '<p class="pk-kicker" style="color:' + COLORS[who] + '">' + pname(who) + ' · answer to ' + (verb === "shoot" ? "take the kick" : "dive") + '</p>' +
      '<p class="pk-sub" style="margin:0">' + esc(prompt) + '</p>' +
      '<p class="pk-q">' + esc(q.q) + '</p>' + (q.hint ? '<p class="pk-hint">' + esc(q.hint) + '</p>' : '');

    if (isWrite) {
      setPanel(head +
        '<div class="pk-write"><input id="writeInput" class="pk-write-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Type your answer here" aria-label="Your answer" />' +
        '<button type="button" class="mp-btn mp-btn-primary" id="writeSubmit" disabled>Submit ✏️</button></div>' +
        '<div id="verdict"></div><div class="pk-actions" id="actions"></div>');
      var input = $("writeInput"), submit = $("writeSubmit");
      function submitWrite() {
        if (answered || !input.value.trim()) return;
        answered = true; ac();
        var ok = E.checkWritten(input.value, q);
        input.disabled = true; submit.disabled = true;
        input.classList.add(ok ? "is-right" : "is-wrong");
        sfx(ok ? "right" : "wrong");
        done(ok, q, shown);
      }
      input.addEventListener("input", function () { submit.disabled = !input.value.trim(); });
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submitWrite(); } });
      submit.addEventListener("click", submitWrite);
      return;
    }

    var chips = E.buildChips(q, subj.chips || 3);
    setPanel(head +
      '<div class="pk-chips" id="chips">' + chips.map(function (c, i) { return '<button type="button" class="pk-chip" data-i="' + i + '">' + esc(c.text) + '</button>'; }).join("") + '</div>' +
      '<div id="verdict"></div><div class="pk-actions" id="actions"></div>');
    $("chips").addEventListener("click", function (ev) {
      var b = ev.target.closest(".pk-chip"); if (!b || answered) return;
      answered = true; ac();
      var c = chips[+b.getAttribute("data-i")];
      Array.prototype.forEach.call($("chips").children, function (x, i) {
        x.disabled = true;
        if (chips[i].correct) x.classList.add("is-right"); else if (x === b) x.classList.add("is-wrong"); else x.classList.add("is-dim");
      });
      sfx(c.correct ? "right" : "wrong");
      done(c.correct, q, shown);
    });
  }
  function verdict(ok, textOk, textNo, correctText) {
    $("verdict").innerHTML = '<div class="pk-verdict ' + (ok ? "ok" : "no") + '">' + (ok ? textOk : textNo) + (ok ? "" : '<small>Right answer: ' + esc(correctText) + '</small>') + '</div>';
  }

  function afterShooterAnswer(ok, shown) {
    var k = info();
    var q = shown;
    if (ok) {
      verdict(true, "Correct! Now choose where to shoot.", "", "");
      $("actions").innerHTML = '<button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnNext">Choose corner →</button>';
      bind("btnNext", function () { phasePick("shot"); });
    } else {
      verdict(false, "", "Not quite. Your shot will fly over the bar! 😬", q);
      $("actions").innerHTML = '<button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnNext">Take the kick ⚽</button>';
      bind("btnNext", function () { S.keeperCorrect = false; S.dive = null; S.shot = null; phaseReveal(); });
    }
  }

  function phasePick(kind) {
    var k = info(), who = kind === "shot" ? k.shooter : k.keeper;
    clearZones(); setPick(kind);
    setPanel(
      '<div class="pk-center"><p class="pk-kicker" style="color:' + COLORS[who] + '">' + pname(who) + '</p>' +
      '<h2 class="pk-title">' + (kind === "shot" ? "Where will you shoot?" : "Which way will you dive?") + '</h2>' +
      '<p class="pk-sub">' + (kind === "shot" ? "Tap a corner of the goal. " + pname(k.keeper) + ", don't peek! 🙈" : "Tap a corner of the goal. Guess where the ball is going!") + '</p>' +
      '<div class="pk-actions"><button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnLock" disabled>Pick a corner</button></div></div>'
    );
    bind("btnLock", function () {
      if (!S.pickedZone) return;
      if (kind === "shot") { S.shot = S.pickedZone; setPick(null); clearZones(); phaseHandover(); }
      else { S.dive = S.pickedZone; setPick(null); phaseReveal(); }
    });
  }

  function phaseHandover() {
    var k = info();
    setPanel(
      '<div class="pk-center"><div class="pk-big-ico" aria-hidden="true">🔒</div>' +
      '<h2 class="pk-title">Shot locked in!</h2>' +
      '<p class="pk-sub">Pass the device to <strong>' + pname(k.keeper) + '</strong>. ' + pname(k.shooter) + ', look away.</p>' +
      '<div class="pk-actions"><button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnKeeper">I\'m ' + pname(k.keeper) + ' 🧤</button></div></div>'
    );
    bind("btnKeeper", function () {
      ask(k.keeper, "dive", function (ok, q, shown) {
        S.keeperCorrect = ok;
        if (ok) {
          verdict(true, "Correct! Now choose where to dive.", "", "");
          $("actions").innerHTML = '<button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnNext">Choose corner →</button>';
          bind("btnNext", function () { phasePick("dive"); });
        } else {
          verdict(false, "", "Not quite. You slip on the grass! 😬", shown);
          $("actions").innerHTML = '<button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnNext">Watch the kick 👀</button>';
          bind("btnNext", function () { S.dive = null; phaseReveal(); });
        }
      });
    });
  }

  /* ---------- the kick ---------- */
  function phaseReveal() {
    var k = info(), m = S.match;
    var result = E.resolveKick({ shooterCorrect: S.shooterCorrect, shotZone: S.shot, keeperCorrect: S.keeperCorrect, diveZone: S.dive });
    setPick(null); clearZones();
    setPanel('<div class="pk-center"><div class="pk-big-ico" aria-hidden="true">⚽</div><h2 class="pk-title">' + pname(k.shooter) + ' steps up…</h2></div>');

    var ball = $("ball"), keeper = $("keeper");
    var shotZone = S.shot || E.shuffle(E.ZONES)[0];
    var tgt = TARGET[shotZone];
    var diveX = { left: -17.5, right: 17.5, center: 0 };
    sfx("whistle");

    later(function () {
      sfx("kick");
      ball.classList.add("spin");
      ball.style.transition = "left .55s cubic-bezier(.3,.6,.3,1), top .55s cubic-bezier(.25,.7,.3,1), transform .55s ease";
      if (result === "miss") {
        var side = shotZone === "center" ? (Math.random() < .5 ? -1 : 1) : (shotZone === "left" ? -1 : 1);
        ball.style.left = (50 + side * (shotZone === "center" ? 26 : 30)) + "%"; ball.style.top = "5%"; ball.style.transform = "scale(.5) rotate(200deg)";
      } else {
        ball.style.left = tgt.x + "%"; ball.style.top = tgt.y + "%"; ball.style.transform = "scale(.55)";
      }
      // the keeper moves a moment after the kick
      later(function () {
        keeper.style.transition = "transform .5s cubic-bezier(.2,.8,.25,1)";
        if (S.dive) {
          if (S.dive === "center") keeper.style.transform = "translateY(-1.5cqw) scale(1.12)";
          else keeper.style.transform = "translate(" + diveX[S.dive] + "cqw, 1cqw) rotate(" + (S.dive === "left" ? -78 : 78) + "deg)";
        } else if (S.shot !== null && !S.keeperCorrect) {
          // slipped: falls over to a random side
          var d = Math.random() < .5 ? -1 : 1;
          keeper.style.transform = "translate(" + (d * 4) + "cqw, 2.5cqw) rotate(" + (d * 88) + "deg)";
        } else {
          keeper.style.transform = "translateY(-.6cqw)";
        }
      }, 110);
    }, 700);

    later(function () {
      if (result === "save") {
        // the ball is pushed away
        var away = shotZone === "left" ? -1 : shotZone === "right" ? 1 : (Math.random() < .5 ? -1 : 1);
        ball.style.transition = "left .4s ease-out, top .4s ease-out, transform .4s";
        ball.style.left = (tgt.x + away * 16) + "%"; ball.style.top = "58%"; ball.style.transform = "scale(.8) rotate(160deg)";
      }
      if (S.shot) {
        var zEl = document.querySelector('.pk-zone[data-zone="' + S.shot + '"]'); if (zEl) zEl.classList.add("is-result");
      }
      var b = $("banner");
      b.className = "pk-banner " + result;
      b.textContent = result === "goal" ? "GOAL! ⚽" : result === "save" ? "SAVED! 🧤" : "MISSED! 😬";
      b.hidden = false;
      sfx(result);
      E.applyKick(m, result);
      renderBoardKeepRoles(k);
    }, 1400);

    later(function () {
      var title = result === "goal" ? pname(k.shooter) + " scores!" : result === "save" ? pname(k.keeper) + " saves it!" : pname(k.shooter) + " misses the goal.";
      var sub = result === "miss" ? "A wrong answer sends the ball over the bar." : result === "save" ? "Same corner. Great guess!" : (S.keeperCorrect ? "The keeper dived the wrong way." : "The keeper slipped.");
      var last = m.over;
      setPanel(
        '<div class="pk-center"><div class="pk-big-ico" aria-hidden="true">' + (result === "goal" ? "🎉" : result === "save" ? "🧤" : "😬") + '</div>' +
        '<h2 class="pk-title">' + title + '</h2><p class="pk-sub">' + sub + '</p><p class="pk-score"><span style="color:' + COLORS[0] + '">' + esc(m.names[0]) + '</span> <b>' + m.goals[0] + ' – ' + m.goals[1] + '</b> <span style="color:' + COLORS[1] + '">' + esc(m.names[1]) + '</span></p>' +
        '<div class="pk-actions"><button type="button" class="mp-btn mp-btn-primary mp-btn-full" id="btnNextKick">' + (last ? "See the winner 🏆" : "Next kick →") + '</button></div></div>'
      );
      bind("btnNextKick", function () { if (m.over) finish(); else phaseIntro(); });
    }, 2300);
  }
  // the scoreboard keeps showing the roles of the kick that was just taken
  function renderBoardKeepRoles(k) {
    var m = S.match;
    var saved = m.kick; m.kick = saved - 1; renderBoard(); m.kick = saved;
  }

  /* ---------- end ---------- */
  function finish() {
    var m = S.match;
    sfx("win");
    $("winTitle").textContent = m.names[m.winner] + " wins!";
    $("winSub").textContent = m.names[0] + " " + m.goals[0] + " – " + m.goals[1] + " " + m.names[1] + " · " + S.subject.title;
    $("winModal").hidden = false;
  }
  $("btnAgain").addEventListener("click", function () { ac(); sfx("tap"); startMatch(); });
  $("btnChange").addEventListener("click", function () { clearTimers(); $("winModal").hidden = true; showScreen("screenSetup"); renderSubjects(); });
  $("btnExit").addEventListener("click", function () {
    if (S.match && !S.match.over && !window.confirm("Leave the match?")) return;
    clearTimers(); $("winModal").hidden = true; showScreen("screenSetup");
  });

  /* ---------- go ---------- */
  var yr = $("year"); if (yr) yr.textContent = new Date().getFullYear();
  renderSubjects();
  showScreen("screenSetup");
  window.__pk = { S: S, E: E };   // for testing
})();
