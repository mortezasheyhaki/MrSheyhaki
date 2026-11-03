/* Listen & Set · PE3 — polished orbit dial, hour + minute drag */
(function () {
  "use strict";

  var GAME_ID = "starter-pe3-listen-set-time";

  var ITEMS = [
    { id: "t840", h: 8, m: 40, label: "twenty to nine",           audio: "https://cdn.imgurl.ir/uploads/t393587_.mp3" },
    { id: "t715", h: 7, m: 15, label: "a quarter after seven",    audio: "https://cdn.imgurl.ir/uploads/e608641_.mp3" },
    { id: "t205", h: 2, m: 5,  label: "five after two",           audio: "https://cdn.imgurl.ir/uploads/m25244_.mp3" },
    { id: "t1200", h: 0, m: 0, label: "twelve o'clock",           audio: "https://cdn.imgurl.ir/uploads/a86485_.mp3" },
    { id: "t830", h: 8, m: 30, label: "eight thirty",             audio: "https://cdn.imgurl.ir/uploads/m129115_.mp3" },
    { id: "t1115", h: 11, m: 15, label: "a quarter after eleven", audio: "https://cdn.imgurl.ir/uploads/q64547_.mp3" }
  ];

  var app = document.getElementById("app");
  if (!app) return;

  var hour = 0, min = 0;
  var dragging = false;
  var dragTarget = "minute"; // "hour" | "minute"
  var activeId = null;
  var correct = 0;
  var locked = false;
  var audio = null;
  var playRecorded = false;
  var answered = {};

  function sfx(n) {
    try { if (window.LASfx && LASfx[n]) LASfx[n](); } catch (e) {}
  }

  function stopAudio() {
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
      audio = null;
    }
    app.querySelectorAll(".ls-orbit-btn.is-playing").forEach(function (b) {
      b.classList.remove("is-playing");
    });
  }

  function snapMin(raw) {
    var m = Math.round(raw / 5) * 5;
    if (m >= 60) m = 0;
    if (m < 0) m = 55;
    return m;
  }

  function minuteAngle(m) { return m * 6; }
  function hourAngle(h, m) { return h * 30 + m * 0.5; }

  function normAngle(a) {
    a = a % 360;
    if (a < 0) a += 360;
    return a;
  }

  function angleDiff(a, b) {
    var d = Math.abs(normAngle(a) - normAngle(b));
    return Math.min(d, 360 - d);
  }

  function setTime(h, m, silent) {
    hour = ((h % 12) + 12) % 12;
    min = snapMin(m);
    updateHands();
    if (!silent) sfx("click");
  }

  function updateHands() {
    var mh = app.querySelector("#minuteHand");
    var hh = app.querySelector("#hourHand");
    if (mh) {
      mh.style.transform = "rotate(" + minuteAngle(min) + "deg)";
      mh.removeAttribute("transform");
    }
    if (hh) {
      hh.style.transform = "rotate(" + hourAngle(hour, min) + "deg)";
      hh.removeAttribute("transform");
    }
    app.querySelectorAll(".ls-tick").forEach(function (el) {
      el.classList.toggle("is-active", +el.dataset.m === min);
    });
    // digital readout
    var dig = app.querySelector("#digital");
    if (dig) {
      var hh12 = hour === 0 ? 12 : hour;
      dig.textContent =
        hh12 + ":" + (min < 10 ? "0" : "") + min;
    }
  }

  function angleFromEvent(e, svg) {
    var rect = svg.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    var clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    var dx = clientX - cx;
    var dy = clientY - cy;
    var deg = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var radius = Math.min(rect.width, rect.height) / 2;
    return { deg: deg, dist: dist, radius: radius };
  }

  function pickHand(info) {
    // Prefer hour if pointer is closer to current hour angle and more inward
    var mAng = minuteAngle(min);
    var hAng = hourAngle(hour, min);
    var dM = angleDiff(info.deg, mAng);
    var dH = angleDiff(info.deg, hAng);
    var inward = info.dist < info.radius * 0.55;
    if (inward && dH < dM + 15) return "hour";
    if (dH + 8 < dM) return "hour";
    return "minute";
  }

  function bindDial() {
    var svg = app.querySelector("#dial");
    if (!svg) return;

    function onDown(e) {
      if (locked) return;
      e.preventDefault();
      dragging = true;
      svg.classList.add("is-dragging");
      var info = angleFromEvent(e, svg);
      dragTarget = pickHand(info);
      svg.classList.toggle("drag-hour", dragTarget === "hour");
      svg.classList.toggle("drag-minute", dragTarget === "minute");
      if (svg.setPointerCapture && e.pointerId != null) svg.setPointerCapture(e.pointerId);
      applyPointer(info);
    }
    function onMove(e) {
      if (!dragging || locked) return;
      e.preventDefault();
      applyPointer(angleFromEvent(e, svg));
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      svg.classList.remove("is-dragging", "drag-hour", "drag-minute");
      sfx("click");
    }
    function applyPointer(info) {
      if (dragTarget === "hour") {
        // 12 hours around the circle; snap to hour, keep minutes
        var hFloat = info.deg / 30; // 0..12
        var h = Math.round(hFloat) % 12;
        setTime(h, min, true);
      } else {
        var m = snapMin(info.deg / 6);
        setTime(hour, m, true);
      }
    }

    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
  }

  function dialSvg() {
    var ticks = "";
    for (var m = 0; m < 60; m += 5) {
      var a = m * 6;
      var major = m % 15 === 0;
      var r1 = major ? 74 : 79;
      var r2 = 86;
      var x1 = 100 + r1 * Math.sin((a * Math.PI) / 180);
      var y1 = 100 - r1 * Math.cos((a * Math.PI) / 180);
      var x2 = 100 + r2 * Math.sin((a * Math.PI) / 180);
      var y2 = 100 - r2 * Math.cos((a * Math.PI) / 180);
      ticks +=
        '<line class="ls-tick' + (major ? " is-major" : "") +
        '" data-m="' + m + '" x1="' + x1.toFixed(2) + '" y1="' + y1.toFixed(2) +
        '" x2="' + x2.toFixed(2) + '" y2="' + y2.toFixed(2) + '" />';
    }
    var nums = [
      [12, 100, 24], [1, 132, 32], [2, 154, 54], [3, 162, 104],
      [4, 154, 152], [5, 132, 174], [6, 100, 182], [7, 68, 174],
      [8, 46, 152], [9, 38, 104], [10, 46, 54], [11, 68, 32]
    ];
    var labels = nums.map(function (n) {
      return '<text class="ls-num" x="' + n[1] + '" y="' + n[2] +
        '" text-anchor="middle" dominant-baseline="middle">' + n[0] + "</text>";
    }).join("");

    return (
      '<svg id="dial" class="ls-dial" viewBox="0 0 200 200" role="img" aria-label="Clock. Drag hands to set the time.">' +
      '<defs>' +
      '<radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">' +
      '<stop offset="0%" stop-color="var(--ls-face-hi)"/>' +
      '<stop offset="100%" stop-color="var(--ls-face-lo)"/>' +
      "</radialGradient>" +
      '<filter id="handShadow" x="-50%" y="-50%" width="200%" height="200%">' +
      '<feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.25"/>' +
      "</filter>" +
      "</defs>" +
      '<circle class="ls-ring-glow" cx="100" cy="100" r="97" />' +
      '<circle class="ls-face" cx="100" cy="100" r="91" />' +
      '<circle class="ls-face-rim" cx="100" cy="100" r="91" />' +
      '<circle class="ls-face-inner" cx="100" cy="100" r="68" />' +
      ticks + labels +
      '<g id="hourHand" filter="url(#handShadow)">' +
      '<line class="ls-hand ls-hand-hour" x1="100" y1="108" x2="100" y2="48" />' +
      '<circle class="ls-hand-cap" cx="100" cy="52" r="4" />' +
      "</g>" +
      '<g id="minuteHand" filter="url(#handShadow)">' +
      '<line class="ls-hand ls-hand-minute" x1="100" y1="110" x2="100" y2="24" />' +
      '<circle class="ls-grip" cx="100" cy="30" r="7" />' +
      "</g>" +
      '<circle class="ls-pin-outer" cx="100" cy="100" r="7" />' +
      '<circle class="ls-pin" cx="100" cy="100" r="4" />' +
      "</svg>"
    );
  }

  function orbitHtml() {
    var html = '<div class="ls-orbit" aria-label="Play a time">';
    ITEMS.forEach(function (item, i) {
      var angle = -90 + i * 60;
      var done = answered[item.id] ? " is-done" : "";
      var active = activeId === item.id ? " is-active" : "";
      html +=
        '<button type="button" class="ls-orbit-btn' + done + active +
        '" data-id="' + item.id + '" style="--a:' + angle + 'deg" aria-label="Play time ' + (i + 1) + '">' +
        '<span class="ls-orbit-ico" aria-hidden="true">▶</span>' +
        '<span class="ls-orbit-eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="ls-orbit-num">' + (i + 1) + "</span>" +
        "</button>";
    });
    html += "</div>";
    return html;
  }

  function renderMenu() {
    stopAudio();
    app.innerHTML =
      '<header class="ls-top">' +
      '<a class="ls-back" href="../" aria-label="Back">←</a>' +
      '<div class="ls-top-mid"><span class="ls-eye">Practical English 3 · Listening</span><strong>Listen &amp; Set</strong></div>' +
      '<span class="ls-badge">PE3</span>' +
      "</header>" +
      '<section class="ls-menu">' +
      '<div class="ls-menu-card">' +
      '<div class="ls-hero" aria-hidden="true">🎧</div>' +
      "<h1>Listen &amp; Set</h1>" +
      "<p>Tap a speaker around the clock, listen carefully, set both hands, then press <strong>Check</strong>.</p>" +
      '<ul class="ls-tips">' +
      "<li>Drag near the <em>centre</em> to move the hour hand</li>" +
      "<li>Drag the <em>outer</em> rim to move the minute hand</li>" +
      "</ul>" +
      '<button type="button" class="ls-btn primary" id="start">Start →</button>' +
      "</div>" +
      "</section>";
    document.getElementById("start").onclick = function () {
      sfx("click");
      startGame();
    };
  }

  function startGame() {
    correct = 0;
    answered = {};
    activeId = null;
    locked = false;
    playRecorded = false;
    hour = 0;
    min = 0;
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    renderPlay();
  }

  function renderPlay() {
    locked = false;
    stopAudio();
    var doneCount = Object.keys(answered).length;
    app.innerHTML =
      '<header class="ls-top">' +
      '<a class="ls-back" href="#" id="toMenu" aria-label="Back">←</a>' +
      '<div class="ls-top-mid"><span class="ls-eye">Listen &amp; set</span><strong>Set the time</strong></div>' +
      '<span class="ls-badge">' + doneCount + "/" + ITEMS.length + "</span>" +
      "</header>" +
      '<div class="ls-progress"><i style="width:' + Math.round((doneCount / ITEMS.length) * 100) + '%"></i></div>' +
      '<section class="ls-stage">' +
      '<div class="ls-clock-wrap">' +
      orbitHtml() +
      dialSvg() +
      "</div>" +
      '<div class="ls-digital" id="digital">12:00</div>' +
      '<div class="ls-tools">' +
      '<button type="button" class="ls-step" id="hMinus" aria-label="Hour down"><span>−</span> hour</button>' +
      '<button type="button" class="ls-step" id="mMinus" aria-label="Minus 5 minutes">−5 min</button>' +
      '<button type="button" class="ls-step" id="mPlus" aria-label="Plus 5 minutes">+5 min</button>' +
      '<button type="button" class="ls-step" id="hPlus" aria-label="Hour up">hour <span>+</span></button>' +
      "</div>" +
      '<p class="ls-status" id="status">' +
      (activeId
        ? "Set both hands for this audio, then Check."
        : "Tap a numbered speaker, listen, then set the clock.") +
      "</p>" +
      '<button type="button" class="ls-btn check" id="btnCheck" ' +
      (activeId && !answered[activeId] ? "" : "disabled") +
      '><span class="ls-ico">✓</span> Check</button>' +
      '<p class="ls-feedback" id="feedback" role="status"></p>' +
      "</section>";

    document.getElementById("toMenu").onclick = function (e) {
      e.preventDefault();
      renderMenu();
    };

    bindDial();
    updateHands();

    document.getElementById("mMinus").onclick = function () {
      if (locked) return;
      setTime(hour, min - 5);
    };
    document.getElementById("mPlus").onclick = function () {
      if (locked) return;
      setTime(hour, min + 5);
    };
    document.getElementById("hMinus").onclick = function () {
      if (locked) return;
      setTime(hour - 1, min);
    };
    document.getElementById("hPlus").onclick = function () {
      if (locked) return;
      setTime(hour + 1, min);
    };

    app.querySelectorAll(".ls-orbit-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (answered[id]) return;
        playItem(id, btn);
      });
    });

    document.getElementById("btnCheck").onclick = onCheck;
  }

  function playItem(id, btn) {
    var item = ITEMS.find(function (x) { return x.id === id; });
    if (!item || answered[id]) return;
    stopAudio();
    activeId = id;
    locked = false;
    sfx("click");
    app.querySelectorAll(".ls-orbit-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-id") === id);
      b.classList.remove("is-playing");
    });
    if (btn) btn.classList.add("is-playing", "is-active");
    var status = document.getElementById("status");
    if (status) status.textContent = "Set both hands for this audio, then Check.";
    var check = document.getElementById("btnCheck");
    if (check) check.disabled = false;
    var fb = document.getElementById("feedback");
    if (fb) { fb.textContent = ""; fb.className = "ls-feedback"; }

    audio = new Audio(item.audio);
    var a = audio;
    a.play().catch(function () {});
    a.onended = function () {
      if (audio === a) audio = null;
      if (btn) btn.classList.remove("is-playing");
    };
    a.onerror = function () {
      if (btn) btn.classList.remove("is-playing");
    };
  }

  function onCheck() {
    if (locked || !activeId || answered[activeId]) return;
    var item = ITEMS.find(function (x) { return x.id === activeId; });
    if (!item) return;
    locked = true;
    var ok = hour === item.h && min === item.m;
    var fb = document.getElementById("feedback");
    if (ok) {
      correct++;
      answered[activeId] = true;
      sfx("correct");
      fb.className = "ls-feedback ok";
      fb.textContent = "Correct! " + item.label;
      stopAudio();
      var b = app.querySelector('.ls-orbit-btn[data-id="' + activeId + '"]');
      if (b) {
        b.classList.remove("is-playing", "is-active");
        b.classList.add("is-done");
      }
      document.getElementById("btnCheck").disabled = true;
      activeId = null;
      var doneCount = Object.keys(answered).length;
      var badge = app.querySelector(".ls-badge");
      if (badge) badge.textContent = doneCount + "/" + ITEMS.length;
      var prog = app.querySelector(".ls-progress i");
      if (prog) prog.style.width = Math.round((doneCount / ITEMS.length) * 100) + "%";
      var status = document.getElementById("status");
      if (status) {
        status.textContent =
          doneCount >= ITEMS.length ? "All done!" : "Nice! Tap another speaker.";
      }
      if (doneCount >= ITEMS.length) setTimeout(finishGame, 900);
      else locked = false;
    } else {
      sfx("wrong");
      fb.className = "ls-feedback bad";
      fb.textContent = "Not quite — adjust the hour and minute hands.";
      locked = false;
    }
  }

  function finishGame() {
    stopAudio();
    var total = ITEMS.length;
    var stars = correct >= total ? 3 : correct >= 4 ? 2 : correct >= 2 ? 1 : 0;
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
        score: correct,
        total: total,
        stars: stars,
        accuracy: Math.round((correct / total) * 100),
        timeMs: timeMs,
        save: false,
        onAgain: startGame,
        backHref: "../"
      });
    }
    app.innerHTML =
      '<header class="ls-top">' +
      '<a class="ls-back" href="../">←</a>' +
      '<div class="ls-top-mid"><span class="ls-eye">Done</span><strong>Listen &amp; Set</strong></div>' +
      '<span class="ls-badge">PE3</span>' +
      "</header>" +
      '<section class="ls-menu">' +
      '<div class="ls-menu-card">' +
      "<h1>" +
      (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!") +
      "</h1>" +
      "<p>You got <strong>" + correct + " / " + total + "</strong> correct.</p>" +
      '<button type="button" class="ls-btn primary" id="again">Play again</button>' +
      '<a class="ls-btn secondary" href="../">Back to games</a>' +
      "</div>" +
      "</section>";
    document.getElementById("again").onclick = function () {
      sfx("click");
      startGame();
    };
  }

  renderMenu();
})();
