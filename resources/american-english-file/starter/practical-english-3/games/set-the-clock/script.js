/* Set the Clock · AEF Starter PE3
 * Flat dial · hour fixed at 3 · snap to 5-min steps · Explore + Quiz
 * Audio only via Play / after correct Check
 */
(function () {
  "use strict";

  const GAME_ID = "starter-pe3-set-the-clock";
  const HOUR = 3;
  const TIMES = [
    { m: 0,  label: "three o'clock",           audio: "https://cdn.imgurl.ir/uploads/t813290_.mp3" },
    { m: 5,  label: "five after three",        audio: "https://cdn.imgurl.ir/uploads/k293597_.mp3" },
    { m: 10, label: "ten after three",         audio: "https://cdn.imgurl.ir/uploads/s048945_.mp3" },
    { m: 15, label: "a quarter after three",   audio: "https://cdn.imgurl.ir/uploads/y454059_.mp3" },
    { m: 20, label: "twenty after three",      audio: "https://cdn.imgurl.ir/uploads/v46301_.mp3" },
    { m: 25, label: "twenty-five after three", audio: "https://cdn.imgurl.ir/uploads/n311557_.mp3" },
    { m: 30, label: "three-thirty",            audio: "https://cdn.imgurl.ir/uploads/s992551_.mp3" },
    { m: 35, label: "twenty-five to four",     audio: "https://cdn.imgurl.ir/uploads/a01599_.mp3" },
    { m: 40, label: "twenty to four",          audio: "https://cdn.imgurl.ir/uploads/i77224_.mp3" },
    { m: 45, label: "a quarter to four",       audio: "https://cdn.imgurl.ir/uploads/k0321_.mp3" },
    { m: 50, label: "ten to four",             audio: "https://cdn.imgurl.ir/uploads/s983135_.mp3" },
    { m: 55, label: "five to four",            audio: "https://cdn.imgurl.ir/uploads/e30666_.mp3" }
  ];

  const app = document.getElementById("app");
  if (!app) return;

  let phase = "menu"; // menu | explore | quiz | done
  let minutes = 0;    // snapped 0..55 step 5
  let dragging = false;
  let quizIndex = 0;
  let quizOrder = [];
  let quizMode = "listen"; // listen | read
  let correctCount = 0;
  let locked = false;
  let audio = null;
  let playRecorded = false;

  function sfx(n) {
    try { if (window.LASfx && LASfx[n]) LASfx[n](); } catch (e) {}
  }

  function stopAudio() {
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
      audio = null;
    }
  }

  function playCurrentAudio() {
    const t = TIMES.find(function (x) { return x.m === minutes; });
    if (!t) return;
    stopAudio();
    sfx("click");
    audio = new Audio(t.audio);
    const a = audio;
    a.play().catch(function () {});
    a.onended = function () { if (audio === a) audio = null; };
  }

  function snapMinutes(raw) {
    // raw 0..60
    var m = Math.round(raw / 5) * 5;
    if (m >= 60) m = 0;
    if (m < 0) m = 55;
    return m;
  }

  function minuteAngle(m) {
    return m * 6; // degrees from 12 o'clock
  }

  function hourAngle(m) {
    // 3 o'clock base 90°, plus 0.5° per minute
    return 90 + m * 0.5;
  }

  function currentLabel() {
    var t = TIMES.find(function (x) { return x.m === minutes; });
    return t ? t.label : "";
  }

  function setMinutes(m, silent) {
    minutes = snapMinutes(m);
    updateHands();
    updateReadout();
    if (!silent) sfx("click");
  }

  function updateHands() {
    var mh = app.querySelector("#minuteHand");
    var hh = app.querySelector("#hourHand");
    // CSS transform (with transform-box) animates smoothly; SVG attribute does not in all browsers
    if (mh) {
      mh.style.transform = "rotate(" + minuteAngle(minutes) + "deg)";
      mh.removeAttribute("transform");
    }
    if (hh) {
      hh.style.transform = "rotate(" + hourAngle(minutes) + "deg)";
      hh.removeAttribute("transform");
    }
    app.querySelectorAll(".sc-tick").forEach(function (el) {
      el.classList.toggle("is-active", +el.dataset.m === minutes);
    });
  }

  function updateReadout() {
    var el = app.querySelector("#readout");
    if (el) el.textContent = currentLabel();
  }

  /* ---------- pointer on dial ---------- */
  function angleFromEvent(e, svg) {
    var rect = svg.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    var clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    var dx = clientX - cx;
    var dy = clientY - cy;
    var deg = Math.atan2(dx, -dy) * (180 / Math.PI); // 0 at 12, clockwise positive
    if (deg < 0) deg += 360;
    return deg;
  }

  function bindDial() {
    var svg = app.querySelector("#dial");
    if (!svg) return;

    function onDown(e) {
      if (locked) return;
      e.preventDefault();
      dragging = true;
      svg.classList.add("is-dragging");
      svg.setPointerCapture && e.pointerId != null && svg.setPointerCapture(e.pointerId);
      var deg = angleFromEvent(e, svg);
      setMinutes(deg / 6, true);
    }
    function onMove(e) {
      if (!dragging || locked) return;
      e.preventDefault();
      var deg = angleFromEvent(e, svg);
      setMinutes(deg / 6, true);
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      svg.classList.remove("is-dragging");
      sfx("click");
    }

    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
  }

  /* ---------- dial SVG ---------- */
  function dialSvg() {
    var ticks = "";
    for (var m = 0; m < 60; m += 5) {
      var a = m * 6;
      var major = m % 15 === 0;
      var r1 = major ? 78 : 82;
      var r2 = 88;
      var x1 = 100 + r1 * Math.sin((a * Math.PI) / 180);
      var y1 = 100 - r1 * Math.cos((a * Math.PI) / 180);
      var x2 = 100 + r2 * Math.sin((a * Math.PI) / 180);
      var y2 = 100 - r2 * Math.cos((a * Math.PI) / 180);
      ticks +=
        '<line class="sc-tick' +
        (m === minutes ? " is-active" : "") +
        '" data-m="' +
        m +
        '" x1="' +
        x1.toFixed(2) +
        '" y1="' +
        y1.toFixed(2) +
        '" x2="' +
        x2.toFixed(2) +
        '" y2="' +
        y2.toFixed(2) +
        '" />';
    }
    // hour numbers (flat teaching dial)
    var nums = [
      [12, 100, 28],
      [1, 128, 36],
      [2, 148, 56],
      [3, 156, 104],
      [4, 148, 148],
      [5, 128, 168],
      [6, 100, 176],
      [7, 72, 168],
      [8, 52, 148],
      [9, 44, 104],
      [10, 52, 56],
      [11, 72, 36]
    ];
    var labels = nums
      .map(function (n) {
        return (
          '<text class="sc-num" x="' +
          n[1] +
          '" y="' +
          n[2] +
          '" text-anchor="middle" dominant-baseline="middle">' +
          n[0] +
          "</text>"
        );
      })
      .join("");

    return (
      '<svg id="dial" class="sc-dial" viewBox="0 0 200 200" role="img" aria-label="Clock dial. Drag to set the time.">' +
      '<circle class="sc-face" cx="100" cy="100" r="92" />' +
      '<circle class="sc-face-inner" cx="100" cy="100" r="74" />' +
      ticks +
      labels +
      // hour hand (shorter, thicker)
      '<g id="hourHand">' +
      '<line class="sc-hand sc-hand-hour" x1="100" y1="100" x2="100" y2="52" />' +
      "</g>" +
      // minute hand
      '<g id="minuteHand">' +
      '<line class="sc-hand sc-hand-minute" x1="100" y1="100" x2="100" y2="28" />' +
      '<circle class="sc-hand-grip" cx="100" cy="34" r="7" />' +
      "</g>" +
      '<circle class="sc-pin" cx="100" cy="100" r="5" />' +
      "</svg>"
    );
  }

  function controlsHtml(opts) {
    opts = opts || {};
    return (
      '<div class="sc-controls">' +
      '<button type="button" class="sc-step" id="btnMinus" aria-label="Minus 5 minutes">−5</button>' +
      '<div class="sc-readout-wrap">' +
      (opts.hideLabel ? "" : '<p class="sc-readout" id="readout">' + currentLabel() + "</p>") +
      "</div>" +
      '<button type="button" class="sc-step" id="btnPlus" aria-label="Plus 5 minutes">+5</button>' +
      "</div>"
    );
  }

  /* ---------- screens ---------- */
  function renderMenu() {
    stopAudio();
    phase = "menu";
    app.innerHTML =
      '<header class="sc-top">' +
      '<a class="sc-back" href="../">←</a>' +
      '<div class="sc-top-mid"><span class="sc-eye">Practical English 3</span><strong>Set the Clock</strong></div>' +
      '<span class="sc-badge">PE3</span>' +
      "</header>" +
      '<section class="sc-menu">' +
      '<div class="sc-hero" aria-hidden="true">🕐</div>' +
      "<h1>Set the Clock</h1>" +
      "<p>Move the hands to times around <strong>3 o'clock</strong>. Snap every 5 minutes.</p>" +
      '<div class="sc-mode-cards">' +
      '<button type="button" class="sc-mode" id="goExplore">' +
      "<strong>Explore</strong>" +
      "<span>Set the clock, then tap Play to hear the time.</span>" +
      "</button>" +
      '<button type="button" class="sc-mode" id="goListen">' +
      "<strong>Listen &amp; set</strong>" +
      "<span>Hear a time, set the hands, then Check.</span>" +
      "</button>" +
      '<button type="button" class="sc-mode" id="goRead">' +
      "<strong>Read &amp; set</strong>" +
      "<span>Read the phrase, set the hands, then Check.</span>" +
      "</button>" +
      "</div>" +
      "</section>";

    document.getElementById("goExplore").onclick = function () {
      sfx("click");
      startExplore();
    };
    document.getElementById("goListen").onclick = function () {
      sfx("click");
      startQuiz("listen");
    };
    document.getElementById("goRead").onclick = function () {
      sfx("click");
      startQuiz("read");
    };
  }

  function wireStepButtons() {
    var minus = document.getElementById("btnMinus");
    var plus = document.getElementById("btnPlus");
    if (minus)
      minus.onclick = function () {
        if (locked) return;
        setMinutes(minutes - 5);
      };
    if (plus)
      plus.onclick = function () {
        if (locked) return;
        setMinutes(minutes + 5);
      };
  }

  function startExplore() {
    phase = "explore";
    locked = false;
    minutes = 0;
    app.innerHTML =
      '<header class="sc-top">' +
      '<a class="sc-back" href="#" id="toMenu">←</a>' +
      '<div class="sc-top-mid"><span class="sc-eye">Explore</span><strong>Set the Clock</strong></div>' +
      '<span class="sc-badge">PE3</span>' +
      "</header>" +
      '<section class="sc-play">' +
      dialSvg() +
      controlsHtml() +
      '<button type="button" class="sc-btn primary" id="btnPlay"><span class="sc-ico">▶</span> Play audio</button>' +
      '<p class="sc-hint">Drag the hands or use −5 / +5. Audio plays only when you press Play.</p>' +
      "</section>";

    document.getElementById("toMenu").onclick = function (e) {
      e.preventDefault();
      renderMenu();
    };
    document.getElementById("btnPlay").onclick = function () {
      playCurrentAudio();
    };
    wireStepButtons();
    bindDial();
    updateHands();
  }

  function startQuiz(mode) {
    phase = "quiz";
    quizMode = mode;
    quizOrder = shuffle(TIMES.map(function (_, i) { return i; }));
    quizIndex = 0;
    correctCount = 0;
    playRecorded = false;
    locked = false;
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    renderQuizItem();
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function renderQuizItem() {
    locked = false;
    stopAudio();
    var target = TIMES[quizOrder[quizIndex]];
    // start hands away from answer when possible
    minutes = target.m === 0 ? 30 : 0;
    var title = quizMode === "listen" ? "Listen & set" : "Read & set";
    var prompt =
      quizMode === "listen"
        ? '<button type="button" class="sc-btn primary" id="btnPromptPlay"><span class="sc-ico">▶</span> Play the time</button>' +
          '<p class="sc-hint">Listen, set the clock, then Check.</p>'
        : '<p class="sc-target-phrase" id="targetPhrase">“' +
          target.label +
          '”</p>' +
          '<p class="sc-hint">Set the clock to match the phrase, then Check.</p>';

    app.innerHTML =
      '<header class="sc-top">' +
      '<a class="sc-back" href="#" id="toMenu">←</a>' +
      '<div class="sc-top-mid"><span class="sc-eye">' +
      title +
      "</span><strong>Set the Clock</strong></div>" +
      '<span class="sc-badge">' +
      (quizIndex + 1) +
      "/" +
      quizOrder.length +
      "</span>" +
      "</header>" +
      '<div class="sc-progress"><i style="width:' +
      Math.round((quizIndex / quizOrder.length) * 100) +
      '%"></i></div>' +
      '<section class="sc-play">' +
      dialSvg() +
      controlsHtml({ hideLabel: true }) +
      prompt +
      '<div class="sc-actions">' +
      '<button type="button" class="sc-btn check" id="btnCheck"><span class="sc-ico">✓</span> Check</button>' +
      "</div>" +
      '<p class="sc-feedback" id="feedback" role="status"></p>' +
      "</section>";

    document.getElementById("toMenu").onclick = function (e) {
      e.preventDefault();
      renderMenu();
    };
    wireStepButtons();
    bindDial();
    updateHands();

    var playBtn = document.getElementById("btnPromptPlay");
    if (playBtn) {
      playBtn.onclick = function () {
        stopAudio();
        sfx("click");
        audio = new Audio(target.audio);
        audio.play().catch(function () {});
      };
    }

    document.getElementById("btnCheck").onclick = function () {
      if (locked) return;
      locked = true;
      var ok = minutes === target.m;
      var fb = document.getElementById("feedback");
      if (ok) {
        correctCount++;
        sfx("correct");
        fb.className = "sc-feedback ok";
        fb.textContent = "Correct! " + target.label;
        // optional: play audio to reinforce after correct
        stopAudio();
        audio = new Audio(target.audio);
        audio.play().catch(function () {});
      } else {
        sfx("wrong");
        fb.className = "sc-feedback bad";
        fb.textContent = "Not quite. Try again — or check the hands.";
        locked = false; // allow another try
        return;
      }
      setTimeout(function () {
        if (quizIndex + 1 >= quizOrder.length) finishQuiz();
        else {
          quizIndex++;
          renderQuizItem();
        }
      }, 1100);
    };
  }

  function finishQuiz() {
    phase = "done";
    stopAudio();
    var total = quizOrder.length;
    var stars = correctCount >= total ? 3 : correctCount >= Math.ceil(total * 0.7) ? 2 : correctCount >= Math.ceil(total * 0.4) ? 1 : 0;
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
        score: correctCount,
        total: total,
        stars: stars,
        accuracy: Math.round((correctCount / total) * 100),
        timeMs: timeMs,
        save: false,
        onAgain: function () {
          startQuiz(quizMode);
        },
        backHref: "../"
      });
    }
    app.innerHTML =
      '<header class="sc-top">' +
      '<a class="sc-back" href="../">←</a>' +
      '<div class="sc-top-mid"><span class="sc-eye">Done</span><strong>Set the Clock</strong></div>' +
      '<span class="sc-badge">PE3</span>' +
      "</header>" +
      '<section class="sc-menu">' +
      "<h1>" +
      (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!") +
      "</h1>" +
      "<p>You got <strong>" +
      correctCount +
      " / " +
      total +
      "</strong> correct.</p>" +
      '<button type="button" class="sc-btn primary" id="again">Play again</button>' +
      '<a class="sc-btn secondary" href="../">Back to games</a>' +
      "</section>";
    document.getElementById("again").onclick = function () {
      startQuiz(quizMode);
    };
  }

  renderMenu();
})();
