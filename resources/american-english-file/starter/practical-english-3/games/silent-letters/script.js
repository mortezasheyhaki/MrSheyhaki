/* Silent Letters · rising word, tap silent letter(s) in 5s */
(function () {
  "use strict";

  var GAME_ID = "starter-pe3-silent-letters";
  var LIMIT_MS = 5000;

  var WORDS = [
    { word: "eight", silent: [2, 3], audio: "https://cdn.imgurl.ir/uploads/y813522_.mp3" },
    { word: "half", silent: [2], audio: "https://cdn.imgurl.ir/uploads/t940246_.mp3" },
    { word: "hour", silent: [0], audio: "https://cdn.imgurl.ir/uploads/o219980_.mp3" },
    { word: "know", silent: [0], audio: "https://cdn.imgurl.ir/uploads/m6036_.mp3" },
    { word: "listen", silent: [3], audio: "https://cdn.imgurl.ir/uploads/g942831_.mp3" },
    { word: "two", silent: [1], audio: "https://cdn.imgurl.ir/uploads/f564534_.mp3" },
    { word: "Wednesday", silent: [2], audio: "https://cdn.imgurl.ir/uploads/m064_.mp3" },
    { word: "what", silent: [1], audio: "https://cdn.imgurl.ir/uploads/t88236_.mp3" },
    { word: "write", silent: [0], audio: "https://cdn.imgurl.ir/uploads/q358747_.mp3" }
  ];

  var app = document.getElementById("app");
  if (!app) return;

  var order = [];
  var idx = 0;
  var score = 0;
  var found = {}; // index -> true for current word
  var needed = [];
  var timer = null;
  var startedAt = 0;
  var locked = false;
  var audio = null;
  var playRecorded = false;
  var raf = null;

  function sfx(n) {
    try { if (window.LASfx && LASfx[n]) LASfx[n](); } catch (e) {}
  }

  function stopAudio() {
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
      audio = null;
    }
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderMenu() {
    clearTimer();
    stopAudio();
    app.innerHTML =
      '<header class="sl-top">' +
      '<a class="sl-back" href="../">←</a>' +
      '<div class="sl-mid"><span class="sl-eye">Practical English 3</span><strong>Silent Letters</strong></div>' +
      '<span class="sl-badge">PE3</span>' +
      "</header>" +
      '<section class="sl-menu">' +
      '<div class="sl-card">' +
      '<div class="sl-hero" aria-hidden="true">🥷</div>' +
      "<h1>Silent Letters</h1>" +
      "<p>A word rises up. You have <strong>5 seconds</strong> to tap every silent letter. Miss one and it slips away!</p>" +
      '<button type="button" class="sl-btn primary" id="start">Start →</button>' +
      "</div>" +
      "</section>";
    document.getElementById("start").onclick = function () {
      sfx("click");
      startGame();
    };
  }

  function startGame() {
    order = shuffle(WORDS);
    idx = 0;
    score = 0;
    playRecorded = false;
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    nextWord();
  }

  function clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function nextWord() {
    clearTimer();
    stopAudio();
    if (idx >= order.length) {
      finishGame();
      return;
    }
    locked = false;
    found = {};
    var item = order[idx];
    needed = item.silent.slice();

    app.innerHTML =
      '<header class="sl-top">' +
      '<a class="sl-back" href="#" id="toMenu">←</a>' +
      '<div class="sl-mid"><span class="sl-eye">Tap the silent letter(s)</span><strong>Silent Letters</strong></div>' +
      '<span class="sl-badge">' + (idx + 1) + "/" + order.length + "</span>" +
      "</header>" +
      '<div class="sl-progress"><i style="width:' + Math.round((idx / order.length) * 100) + '%"></i></div>' +
      '<section class="sl-stage">' +
      '<div class="sl-timer" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="sl-track" cx="18" cy="18" r="15.5"/><circle class="sl-arc" id="arc" cx="18" cy="18" r="15.5"/></svg><span id="sec">5</span></div>' +
      '<div class="sl-arena" id="arena">' +
      '<div class="sl-word is-enter" id="word" style="--n:' + item.word.length + ';">' +
      lettersHtml(item) +
      "</div>" +
      "</div>" +
      '<p class="sl-hint" id="hint">Tap the letter(s) you don’t hear.</p>' +
      '<p class="sl-feedback" id="feedback" role="status"></p>' +
      "</section>";

    document.getElementById("toMenu").onclick = function (e) {
      e.preventDefault();
      renderMenu();
    };

    // rise in
    requestAnimationFrame(function () {
      var w = document.getElementById("word");
      if (w) {
        w.classList.remove("is-enter");
        w.classList.add("is-float");
      }
    });

    // play audio shortly after appear
    setTimeout(function () {
      stopAudio();
      audio = new Audio(item.audio);
      audio.play().catch(function () {});
    }, 350);

    // letter clicks
    app.querySelectorAll(".sl-letter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onLetter(btn, item);
      });
    });

    startedAt = performance.now();
    tickTimer();
    timer = setInterval(tickTimer, 50);
  }

  function lettersHtml(item) {
    var html = "";
    for (var i = 0; i < item.word.length; i++) {
      html +=
        '<button type="button" class="sl-letter" data-i="' + i + '">' +
        item.word.charAt(i) +
        "</button>";
    }
    return html;
  }

  function tickTimer() {
    var elapsed = performance.now() - startedAt;
    var left = Math.max(0, LIMIT_MS - elapsed);
    var sec = Math.ceil(left / 1000);
    var secEl = document.getElementById("sec");
    var arc = document.getElementById("arc");
    if (secEl) secEl.textContent = String(sec);
    if (arc) {
      var circ = 2 * Math.PI * 15.5;
      var pct = left / LIMIT_MS;
      arc.style.strokeDasharray = circ.toFixed(2);
      arc.style.strokeDashoffset = (circ * (1 - pct)).toFixed(2);
      arc.classList.toggle("is-urgent", left < 1500);
    }
    if (left <= 0) {
      clearTimer();
      onTimeout();
    }
  }

  function onLetter(btn, item) {
    if (locked) return;
    var i = +btn.getAttribute("data-i");
    if (found[i]) return;

    var isSilent = item.silent.indexOf(i) !== -1;
    if (isSilent) {
      found[i] = true;
      btn.classList.add("is-hit");
      btn.disabled = true;
      sfx("correct");
      spawnSlash(btn);

      var all = item.silent.every(function (s) { return found[s]; });
      if (all) {
        locked = true;
        clearTimer();
        score++;
        var fb = document.getElementById("feedback");
        if (fb) {
          fb.className = "sl-feedback ok";
          fb.textContent = "Nice!";
        }
        var word = document.getElementById("word");
        if (word) {
          word.classList.remove("is-float");
          word.classList.add("is-success");
        }
        setTimeout(function () {
          idx++;
          nextWord();
        }, 700);
      }
    } else {
      btn.classList.add("is-miss");
      sfx("wrong");
      setTimeout(function () { btn.classList.remove("is-miss"); }, 320);
    }
  }

  function spawnSlash(btn) {
    var arena = document.getElementById("arena");
    if (!arena) return;
    var r = btn.getBoundingClientRect();
    var ar = arena.getBoundingClientRect();
    var el = document.createElement("span");
    el.className = "sl-slash";
    el.style.left = r.left + r.width / 2 - ar.left + "px";
    el.style.top = r.top + r.height / 2 - ar.top + "px";
    arena.appendChild(el);
    setTimeout(function () { el.remove(); }, 450);
  }

  function onTimeout() {
    if (locked) return;
    locked = true;
    var item = order[idx];
    var word = document.getElementById("word");
    if (word) {
      word.classList.remove("is-float");
      word.classList.add("is-fail");
      // reveal silent
      word.querySelectorAll(".sl-letter").forEach(function (btn) {
        var i = +btn.getAttribute("data-i");
        if (item.silent.indexOf(i) !== -1) btn.classList.add("is-reveal");
      });
    }
    var fb = document.getElementById("feedback");
    if (fb) {
      fb.className = "sl-feedback bad";
      fb.textContent = "Time! Silent: " + item.silent.map(function (i) { return item.word.charAt(i); }).join(", ");
    }
    sfx("wrong");
    setTimeout(function () {
      idx++;
      nextWord();
    }, 1400);
  }

  function finishGame() {
    clearTimer();
    stopAudio();
    var total = order.length;
    var stars = score >= total ? 3 : score >= Math.ceil(total * 0.7) ? 2 : score >= Math.ceil(total * 0.4) ? 1 : 0;
    if (window.LAStars) {
      try {
        if (!playRecorded) {
          LAStars.recordPlay(GAME_ID);
          playRecorded = true;
        }
        LAStars.save(GAME_ID, stars);
      } catch (e) {}
    }
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: total,
        stars: stars,
        accuracy: Math.round((score / total) * 100),
        timeMs: timeMs,
        save: false,
        onAgain: startGame,
        backHref: "../"
      });
    }
    app.innerHTML =
      '<header class="sl-top">' +
      '<a class="sl-back" href="../">←</a>' +
      '<div class="sl-mid"><span class="sl-eye">Done</span><strong>Silent Letters</strong></div>' +
      '<span class="sl-badge">PE3</span>' +
      "</header>" +
      '<section class="sl-menu">' +
      '<div class="sl-card">' +
      "<h1>" +
      (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!") +
      "</h1>" +
      "<p>You caught <strong>" + score + " / " + total + "</strong> words.</p>" +
      '<button type="button" class="sl-btn primary" id="again">Play again</button>' +
      '<a class="sl-btn secondary" href="../">Back to games</a>' +
      "</div>" +
      "</section>";
    document.getElementById("again").onclick = function () {
      sfx("click");
      startGame();
    };
  }

  renderMenu();
})();
