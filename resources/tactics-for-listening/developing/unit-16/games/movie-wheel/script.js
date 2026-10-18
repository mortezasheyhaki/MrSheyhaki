/* Movie Wheel · Tactics For Listening Developing Unit 16
 * Six recordings. Listen to each one (play button in the centre), then tap
 * the kind of movie on the wheel. The wheel turns slowly; the words keep
 * their order after a pick. A correct genre is muted and can't be used again.
 * No background music. Short sound effects only (LASfx), with a mute toggle.
 */
(function () {
  "use strict";

  var GAME_ID = "tfl-developing-u16-movie-wheel";
  var BACK = "../../";

  var GENRES = ["western", "comedy", "horror", "action", "science fiction", "romance"];

  // one answer per recording, from the answer key (1 d, 2 b, 3 f, 4 a, 5 e, 6 c)
  var CLIPS = [
    { audio: "https://cdn.imgurl.ir/uploads/d894222_39_Unit_16_-_1.mp3", answer: "action" },
    { audio: "https://cdn.imgurl.ir/uploads/k498402_39_Unit_16_-_2.mp3", answer: "comedy" },
    { audio: "https://cdn.imgurl.ir/uploads/n55375_39_Unit_16_-_3.mp3",  answer: "romance" },
    { audio: "https://cdn.imgurl.ir/uploads/x88126_39_Unit_16_-_4.mp3",  answer: "western" },
    { audio: "https://cdn.imgurl.ir/uploads/n2022_39_Unit_16_-_5.mp3",   answer: "science fiction" },
    { audio: "https://cdn.imgurl.ir/uploads/x29529_39_Unit_16_-_6.mp3",  answer: "horror" },
  ];

  var ROUNDS = CLIPS.length;
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage"), target = $("target"), playBtn = $("play"), fb = $("fb"), tip = $("tip");

  var round = 0, correct = 0, wrong = 0;
  var chips = [], chainEls = [];
  var spin = 0, lastT = performance.now();
  var mutedGenres = {};          // genre -> true once answered correctly
  var audio = null, playing = false, audioError = false;
  var clipEnded = false;         // chips become usable after the recording finishes
  var busy = false;
  var muted = false;             // mutes the sound effects only
  var playRecorded = false;
  var HAS_AUDIO = typeof window.Audio === "function";

  var PLAY_ICON = '<span class="mw-tri" aria-hidden="true"></span>';
  var BARS_ICON = '<span class="mw-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  var ALERT_ICON = '<span class="mw-alert" aria-hidden="true">!</span>';

  function sfx(name) {
    if (muted) return;
    try { if (window.LASfx && typeof LASfx[name] === "function") LASfx[name](); } catch (e) {}
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- audio ---------- */

  function stopAudio() {
    playing = false;
    if (audio) { try { audio.pause(); } catch (e) {} audio.onended = audio.onerror = null; audio = null; }
  }

  function setPlayButton() {
    var cls = "mw-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
    playBtn.className = cls;
    playBtn.innerHTML = audioError ? ALERT_ICON : playing ? BARS_ICON : PLAY_ICON;
    playBtn.setAttribute("aria-label", audioError ? "Audio unavailable" : playing ? "Stop" : "Play the recording");
    playBtn.disabled = !HAS_AUDIO;
  }

  function play() {
    if (!HAS_AUDIO) return;
    stopAudio();
    audioError = false;
    audio = new Audio(CLIPS[round].audio);
    audio.preload = "auto";
    playing = true;
    setPlayButton();
    tip.textContent = "Listening…";
    audio.onended = function () {
      playing = false;
      clipEnded = true;
      setPlayButton();
      tip.textContent = "Now tap the kind of movie";
      refreshChips();
    };
    audio.onerror = function () {
      playing = false;
      audioError = true;
      setPlayButton();
      tip.textContent = "This recording could not load. Check your connection.";
    };
    var p = audio.play();
    if (p && p.catch) p.catch(function () { playing = false; audioError = true; setPlayButton(); });
  }

  function togglePlay() {
    if (busy) return;
    if (playing) { stopAudio(); setPlayButton(); tip.textContent = clipEnded ? "Now tap the kind of movie" : "Tap play to listen"; return; }
    play();
  }

  /* ---------- wheel ---------- */

  function buildChips() {
    chips.forEach(function (c) { c.el.remove(); });
    chips = [];
    var order = shuffle(GENRES);
    var off = -Math.PI / 2;
    chips = order.map(function (g, i) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "chip";
      el.textContent = g;
      el.setAttribute("data-genre", g);
      stage.appendChild(el);
      var c = { el: el, genre: g, base: off + i * 2 * Math.PI / GENRES.length, x: 0, y: 0 };
      el.addEventListener("click", function () { choose(c); });
      return c;
    });
    refreshChips();
  }

  function refreshChips() {
    chips.forEach(function (c) {
      var isMuted = !!mutedGenres[c.genre];
      c.el.classList.toggle("muted", isMuted);
      c.el.disabled = isMuted || !clipEnded || busy;
      c.el.classList.toggle("idle", !clipEnded && !isMuted);
    });
  }

  function choose(c) {
    if (busy || !clipEnded || mutedGenres[c.genre]) return;
    if (c.genre === CLIPS[round].answer) {
      correct++;
      busy = true;
      mutedGenres[c.genre] = true;
      sfx("correct");
      target.className = "center ok";
      fb.textContent = "🎉 " + c.genre + "!";
      fb.classList.add("show");
      tip.textContent = "Well done!";
      refreshChips();
      setTimeout(nextRound, 1400);
    } else {
      wrong++;
      sfx("wrong");
      target.className = "center bad";
      c.el.classList.remove("shake");
      void c.el.offsetWidth;
      c.el.classList.add("shake");
      fb.textContent = "Not quite, listen again";
      fb.classList.add("show");
      tip.textContent = "Try another kind of movie, or tap play to hear it again";
      setTimeout(function () {
        target.className = "center";
        fb.classList.remove("show");
      }, 900);
    }
    updateHud();
  }

  function nextRound() {
    round++;
    if (round >= ROUNDS) { finish(); return; }
    stopAudio();
    clipEnded = false;
    busy = false;
    audioError = false;
    target.className = "center";
    fb.classList.remove("show");
    fb.textContent = "";
    buildChips();
    setPlayButton();
    tip.textContent = "Tap play to listen";
    updateHud();
  }

  function updateHud() {
    $("round").textContent = "Clip " + (round + 1) + "/" + ROUNDS;
    $("score").textContent = "✅ " + correct;
    $("prog").style.width = (round / ROUNDS * 100) + "%";
  }

  /* ---------- start and finish ---------- */

  function start() {
    if (window.LAFinish && LAFinish.startTimer) LAFinish.startTimer();
    $("start").classList.remove("on");
    $("end").classList.remove("on");
    $("end").hidden = true;
    document.querySelectorAll(".confetti").forEach(function (e) { e.remove(); });
    round = 0; correct = 0; wrong = 0;
    mutedGenres = {};
    clipEnded = false; busy = false; audioError = false;
    playRecorded = false;
    target.className = "center";
    stopAudio();
    buildChips();
    setPlayButton();
    tip.textContent = "Tap play to listen";
    updateHud();
  }

  function calcStars(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  }

  function saveProgress(stars, pct) {
    if (!window.LAStars) return;
    if (!playRecorded) { LAStars.recordPlay(GAME_ID); playRecorded = true; }
    LAStars.save(GAME_ID, stars);
    try {
      if (typeof window.LAProgressSave === "function") {
        window.LAProgressSave({
          gameId: GAME_ID, gameName: "Movie Wheel",
          category: "tactics-for-listening", unit: "developing-16",
          score: correct, maxScore: ROUNDS, accuracy: pct,
          completed: true, stars: stars,
        });
      }
    } catch (e) {}
  }

  function finish() {
    stopAudio();
    var attempts = correct + wrong;
    var pct = attempts ? Math.round(correct / attempts * 100) : 100;
    var stars = calcStars(pct);
    $("prog").style.width = "100%";
    $("score").textContent = "✅ " + correct;
    saveProgress(stars, pct);
    sfx("win");
    if (window.LAFinish) {
      var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
      LAFinish.show({
        gameId: GAME_ID, gameName: "Movie Wheel",
        score: correct, total: ROUNDS, stars: stars,
        accuracy: pct, timeMs: timeMs, save: false,
        onAgain: start,
        onModes: function () { $("end").classList.remove("on"); $("start").classList.add("on"); },
        backHref: BACK,
      });
      return;
    }
    $("end").innerHTML = '<div class="screen-card"><h2>Well done!</h2><p>You got ' + correct + " of " + ROUNDS +
      " right. Accuracy " + pct + '%.</p><button class="btn" id="again">Play again</button></div>';
    $("end").hidden = false;
    $("end").classList.add("on");
    $("again").onclick = start;
  }

  /* ---------- wheel animation and chains ---------- */

  function drawChains() {
    var svg = $("chains"), n = chips.length;
    if (!chainEls.length) {
      var mk = function (cls) {
        var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        e.setAttribute("class", cls);
        return e;
      };
      for (var i = 0; i < n; i++) {
        var a = mk("lk"), b = mk("lk2");
        svg.appendChild(a); svg.appendChild(b);
        chainEls.push([a, b]);
      }
    }
    for (var k = 0; k < n; k++) {
      var p = chips[k], q = chips[(k + 1) % n], pe = chainEls[k];
      var on = !mutedGenres[p.genre] && !mutedGenres[q.genre];
      var d = on ? "M" + p.x + " " + p.y + "L" + q.x + " " + q.y : "";
      pe[0].setAttribute("d", d);
      pe[1].setAttribute("d", d);
    }
  }

  function frame(t) {
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    spin += dt * 0.35;
    var W = stage.clientWidth, cx = W / 2;
    var d = chips.length ? chips[0].el.offsetWidth : 100;
    var r = W / 2 - d / 2 - 4;
    chips.forEach(function (c) {
      var a = c.base + spin;
      c.x = cx + r * Math.cos(a);
      c.y = cx + r * Math.sin(a);
      c.el.style.left = c.x + "px";
      c.el.style.top = c.y + "px";
    });
    drawChains();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- controls ---------- */

  playBtn.addEventListener("click", togglePlay);
  $("go").onclick = start;
  $("mute").onclick = function () {
    muted = !muted;
    $("mute").textContent = muted ? "🔇" : "🔊";
  };
})();
