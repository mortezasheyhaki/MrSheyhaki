/* Listening: should or shouldn't, and go or call – Teen2Teen 1 Unit 12. Students choose the answer. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-listening-advice";

  // subject / rest = the sentence around the choices; modal and verb = the correct answers
  var ITEMS = [
    { subject: "He", modal: "should", verb: "go", rest: "to the beach." },
    { subject: "They", modal: "shouldn't", verb: "call", rest: "their parents now." },
    { subject: "They", modal: "should", verb: "go", rest: "to the mall." },
    { subject: "She", modal: "shouldn't", verb: "go", rest: "to Japan in January." },
    { subject: "He", modal: "shouldn't", verb: "go", rest: "to Shanghai in August." },
    { subject: "She", modal: "should", verb: "call", rest: "again at three o'clock." }
  ];
  var MODALS = ["should", "shouldn't"];
  var VERBS = ["go", "call"];

  var app = document.getElementById("game-app");
  if (!app) return;
  var audio = document.getElementById("ls-audio");

  /* ---------- sound effects ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("ua-muted") === "1"; } catch (e) {}
  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audioCtx(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    tap: function () { tone(640, 0.05, "triangle", 0.07); },
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- state ---------- */
  var idx = 0, score = 0, misses = 0, locked = false, stageTimer = null;
  var pick = { modal: null, verb: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- audio player ---------- */
  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), r = Math.floor(sec % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function updateProgress() {
    var d = audio.duration;
    var pct = d && isFinite(d) ? Math.min(100, (audio.currentTime / d) * 100) : 0;
    $("ls-fill").style.width = pct + "%";
    $("ls-track").setAttribute("aria-valuenow", Math.round(pct));
    $("ls-time").textContent = fmt(audio.currentTime) + (d && isFinite(d) ? " / " + fmt(d) : "");
  }
  function setPlayingUI(playing) {
    $("ls-play").classList.toggle("is-playing", playing);
    $("ls-play").setAttribute("aria-label", playing ? "Pause the conversations" : "Play the conversations");
    $("ls-player").classList.toggle("is-playing", playing);
  }
  $("ls-play").addEventListener("click", function () {
    audioCtx(); sfx("tap");
    if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    else audio.pause();
  });
  audio.addEventListener("play", function () { setPlayingUI(true); });
  audio.addEventListener("pause", function () { setPlayingUI(false); });
  audio.addEventListener("ended", function () { setPlayingUI(false); updateProgress(); });
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);

  var track = $("ls-track"), dragging = false;
  function seekFromPointer(x) {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    var r = track.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (x - r.left) / r.width)) * d;
    updateProgress();
  }
  track.addEventListener("pointerdown", function (e) {
    audioCtx(); dragging = true; track.classList.add("is-seeking");
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
    seekFromPointer(e.clientX);
  });
  track.addEventListener("pointermove", function (e) { if (dragging) seekFromPointer(e.clientX); });
  ["pointerup", "pointercancel"].forEach(function (ev) {
    track.addEventListener(ev, function () { dragging = false; track.classList.remove("is-seeking"); });
  });
  track.addEventListener("keydown", function (e) {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(d, audio.currentTime + 5);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
    else return;
    e.preventDefault(); updateProgress();
  });

  /* ---------- one statement at a time ---------- */
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }
  function setProgress() { $("sh-fill").style.width = Math.round((idx / ITEMS.length) * 100) + "%"; }

  function sentenceHTML(it) {
    var m = pick.modal ? pick.modal : "____";
    var v = pick.verb ? pick.verb : "____";
    var mCls = "ls-slot" + (pick.modal ? " is-filled" : "");
    var vCls = "ls-slot" + (pick.verb ? " is-filled" : "");
    return '<p class="ls-statement">' + esc(it.subject) + " " +
      '<span class="' + mCls + '" id="slot-modal">' + esc(m) + "</span> " +
      '<span class="' + vCls + '" id="slot-verb">' + esc(v) + "</span> " + esc(it.rest) + "</p>";
  }

  function groupHTML(label, group, options, selected) {
    return '<div class="ls-group"><span class="ls-label">' + label + '</span><div class="ls-choices">' +
      options.map(function (o) {
        return '<button class="ls-choice' + (selected === o ? " is-on" : "") + '" data-group="' + group + '" data-value="' + o + '">' + esc(o) + "</button>";
      }).join("") + "</div></div>";
  }

  function renderItem(animateIn) {
    var it = ITEMS[idx];
    locked = false;
    pick = { modal: null, verb: null };
    $("sh-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("sh-card").innerHTML =
      '<div id="ls-sentence">' + sentenceHTML(it) + "</div>" +
      groupHTML("Choose: should or shouldn't", "modal", MODALS, pick.modal) +
      groupHTML("Choose: go or call", "verb", VERBS, pick.verb) +
      '<button class="ls-check" id="ls-check" disabled>Check ✓</button>';
    setProgress();
    setFeedback("", "");
  }

  function refreshSelection() {
    $("ls-sentence").innerHTML = sentenceHTML(ITEMS[idx]);
    document.querySelectorAll(".ls-choice").forEach(function (b) {
      var g = b.getAttribute("data-group"), v = b.getAttribute("data-value");
      b.classList.toggle("is-on", pick[g] === v);
    });
    $("ls-check").disabled = locked || !(pick.modal && pick.verb);
  }

  function check() {
    if (locked || !(pick.modal && pick.verb)) return;
    var it = ITEMS[idx];
    var modalOK = pick.modal === it.modal, verbOK = pick.verb === it.verb;
    var mSlot = $("slot-modal"), vSlot = $("slot-verb");
    if (modalOK && verbOK) {
      locked = true;
      if (misses === 0) score++;
      misses = 0;
      mSlot.classList.add("is-right"); vSlot.classList.add("is-right");
      document.querySelectorAll(".ls-choice").forEach(function (b) { b.disabled = true; });
      document.querySelectorAll(".ls-choice.is-on").forEach(function (b) { b.classList.add("is-right"); });
      sfx("correct");
      setFeedback("Yesss! 🎉", "ok");
      $("ls-check").disabled = true;
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextItem, 1200);
    } else {
      misses++;
      sfx("wrong");
      mSlot.classList.toggle("is-wrong", !modalOK);
      vSlot.classList.toggle("is-wrong", !verbOK);
      mSlot.classList.toggle("is-right", modalOK);
      vSlot.classList.toggle("is-right", verbOK);
      setFeedback(!modalOK && !verbOK ? "Check should/shouldn't and go/call 💪" : !modalOK ? "Check should or shouldn't 💪" : "Check go or call 💪", "no");
    }
  }

  function nextItem() {
    $("sh-card").classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      idx++;
      if (idx >= ITEMS.length) finish();
      else renderItem(true);
    }, 300);
  }

  /* ---------- choices ---------- */
  $("sh-card").addEventListener("click", function (ev) {
    var b = ev.target.closest(".ls-choice");
    if (b && !locked) {
      audioCtx(); sfx("tap");
      var g = b.getAttribute("data-group"), v = b.getAttribute("data-value");
      pick[g] = v;
      if (g === "modal" && $("slot-modal")) $("slot-modal").classList.remove("is-wrong", "is-right");
      if (g === "verb" && $("slot-verb")) $("slot-verb").classList.remove("is-wrong", "is-right");
      refreshSelection();
      return;
    }
    if (ev.target.closest("#ls-check")) { audioCtx(); sfx("tap"); check(); }
  });

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var total = ITEMS.length;
    var stars = score === total ? 3 : score / total >= 0.6 ? 2 : 1;
    try { audio.pause(); } catch (e) {}
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID, score: score, total: total, stars: stars, timeMs: timeMs,
          onAgain: start, onModes: start, backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("sh-card").className = "sh-card";
    $("sh-card").innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
  }

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap"); paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    idx = 0; score = 0; misses = 0;
    renderItem(false);
    updateProgress();
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
