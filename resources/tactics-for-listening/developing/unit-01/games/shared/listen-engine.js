/* Listening games · shared engine (listening-station layout)
 * ListenEngine.mount({ gameId, gameName, unitLabel, icon, intro, tips,
 *                      letters, stars: { two, one }, items: [...] })
 * Item: { prompt, stem, audio, options: [...], correct: index }
 * Hooks used if present: LAStars, LAFinish, LASfx, LAProgressSave.
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function sfx(name) {
    try {
      if (window.LASfx && typeof LASfx[name] === "function") LASfx[name]();
    } catch (e) {}
  }

  function mount(cfg) {
    var root = document.getElementById("game-app");
    if (!root) return;

    var items = cfg.items;
    var TOTAL = items.length;
    var LETTERS = cfg.letters || ["a", "b", "c"];
    var STARS = cfg.stars || { two: 3, one: 2 };
    var BACK = "../../";
    var UNIT = cfg.unitLabel || "";
    var TOUCH = window.matchMedia && matchMedia("(hover: none)").matches;

    var phase = "start";       // start | play | done
    var current = 0;
    var correctCount = 0;
    var results = [];          // per item: true | false | null
    var locked = false;
    var chosen = null;
    var entering = false;
    var playRecorded = false;
    var audio = null;
    var playing = false;
    var listened = false;
    var audioError = false;
    var advanceTimer = null;

    /* ---------- scoring & saving ---------- */

    function calcStars() {
      if (correctCount >= TOTAL) return 3;
      if (correctCount >= STARS.two) return 2;
      if (correctCount >= STARS.one) return 1;
      return 0;
    }
    function pct() { return Math.round((correctCount / TOTAL) * 100); }

    function saveProgress(stars) {
      if (!window.LAStars) return;
      if (!playRecorded) {
        LAStars.recordPlay(cfg.gameId);
        playRecorded = true;
      }
      LAStars.save(cfg.gameId, stars);
      try {
        if (typeof window.LAProgressSave === "function") {
          window.LAProgressSave({
            gameId: cfg.gameId,
            gameName: cfg.gameName,
            category: "tactics-for-listening",
            unit: "developing-1",
            score: correctCount,
            maxScore: TOTAL,
            accuracy: pct(),
            completed: true,
            stars: stars,
          });
        }
      } catch (e) {}
    }

    /* ---------- audio ---------- */

    function stopAudio() {
      if (audio) {
        try { audio.pause(); audio.currentTime = 0; } catch (e) {}
      }
      playing = false;
    }

    function playAudio() {
      var item = items[current];
      if (!item || audioError) return;
      sfx("click");
      if (playing) {
        stopAudio();
        renderPlayView();
        return;
      }
      stopAudio();
      audio = new Audio(item.audio);
      audio.preload = "auto";
      playing = true;
      listened = true;
      renderPlayView();
      audio.onended = function () { playing = false; renderPlayView(); };
      audio.onerror = function () { playing = false; audioError = true; renderPlayView(); };
      var p = audio.play();
      if (p && p.catch) {
        p.catch(function () { playing = false; audioError = true; renderPlayView(); });
      }
    }

    /* ---------- flow ---------- */

    function clearAdvance() {
      if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    }

    function startGame() {
      clearAdvance();
      if (window.LAFinish) LAFinish.startTimer();
      current = 0;
      correctCount = 0;
      results = items.map(function () { return null; });
      locked = false;
      chosen = null;
      playRecorded = false;
      listened = false;
      audioError = false;
      stopAudio();
      phase = "play";
      entering = true;
      render();
    }

    function choose(i) {
      if (locked || phase !== "play") return;
      chosen = i;
      sfx("click");
      renderPlayView();
    }

    function check() {
      if (locked || phase !== "play" || chosen === null) return;
      clearAdvance();
      locked = true;
      stopAudio();
      var ok = chosen === items[current].correct;
      results[current] = ok;
      if (ok) { correctCount++; sfx("correct"); }
      else sfx("wrong");
      renderPlayView();
    }

    function next() {
      clearAdvance();
      if (!locked) return;
      if (current + 1 >= TOTAL) { finish(); return; }
      current++;
      locked = false;
      chosen = null;
      listened = false;
      audioError = false;
      stopAudio();
      entering = true;
      render();
    }

    function finish() {
      clearAdvance();
      stopAudio();
      var stars = calcStars();
      saveProgress(stars);
      phase = "done";
      sfx("win");
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: cfg.gameId,
          score: correctCount,
          total: TOTAL,
          stars: stars,
          accuracy: pct(),
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: BACK,
          save: false,
        });
        return;
      }
      render();
    }

    /* ---------- views ---------- */

    function topBar(eyebrow, title, counter) {
      return (
        '<header class="lc-top">' +
        '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←<span>Unit</span></a>' +
        '<div class="lc-top-center"><span class="lc-eyebrow">' + esc(eyebrow) + "</span>" +
        "<strong>" + esc(title) + "</strong></div>" +
        '<span class="lc-counter">' + (counter || "") + "</span>" +
        "</header>"
      );
    }

    function segmentsHtml() {
      return (
        '<div class="lc-seg" role="img" aria-label="Question ' + (current + 1) + " of " + TOTAL + '">' +
        items.map(function (_, i) {
          var cls = "";
          if (results[i] === true) cls = " is-right";
          else if (results[i] === false) cls = " is-wrong";
          else if (i === current && phase === "play") cls = " is-current";
          else if (i < current) cls = " is-done";
          return "<i class=\"" + cls.trim() + "\"></i>";
        }).join("") +
        "</div>"
      );
    }

    function renderStart() {
      root.innerHTML =
        topBar(UNIT, cfg.gameName, "") +
        '<section class="lc-intro">' +
        '<div class="lc-intro-main">' +
        '<div class="lc-hero-icon" aria-hidden="true">' + (cfg.icon || "🎧") + "</div>" +
        "<h1>" + esc(cfg.gameName) + "</h1>" +
        '<p class="lc-intro-lede">' + cfg.intro + "</p>" +
        '<div class="lc-start-row"><button type="button" class="lc-btn primary" id="lc-start">Start listening →</button></div>' +
        "</div>" +
        '<ol class="lc-steps">' +
        cfg.tips.map(function (t, i) {
          return '<li><span class="tip-num">' + (i + 1) + "</span><span>" + t + "</span></li>";
        }).join("") +
        "</ol>" +
        "</section>";
      document.getElementById("lc-start").onclick = startGame;
    }

    function renderPlayView() {
      var item = items[current];
      var last = current + 1 >= TOTAL;
      var HAS_AUDIO = typeof window.Audio === "function";

      var playCls = "al-play" + (playing ? " is-playing" : "") + (audioError ? " is-error" : "");
      var listenTitle = audioError ? "Audio unavailable"
        : playing ? "Playing… tap to stop"
        : listened ? "Play again" : "Play the recording";
      var listenSub = !HAS_AUDIO ? "Audio is not supported in this browser."
        : audioError ? "This recording could not load. Check your connection."
        : playing ? "Tap the square to stop."
        : listened ? "You can play it again before you answer."
        : "Question " + (current + 1) + " of " + TOTAL;
      var playIcon = audioError
        ? '<span class="al-play-alert" aria-hidden="true">!</span>'
        : playing
          ? '<span class="al-play-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'
          : '<span class="al-play-tri" aria-hidden="true"></span>';

      var optsHtml = item.options.map(function (text, i) {
        var letter = LETTERS[i];
        var cls = "al-opt";
        var tick = "";
        if (locked) {
          if (i === item.correct) { cls += " is-correct"; tick = '<span class="al-tick" aria-hidden="true">✓</span>'; }
          else if (i === chosen) { cls += " is-wrong"; tick = '<span class="al-tick" aria-hidden="true">✕</span>'; }
        } else if (i === chosen) {
          cls += " is-picked";
        }
        return (
          '<button type="button" class="' + cls + '" data-opt="' + i + '"' +
          (locked ? " disabled" : "") + ">" +
          esc(letter) + ". " + esc(text) + tick + "</button>"
        );
      }).join("");

      var foot;
      if (locked) {
        var ok = chosen === item.correct;
        foot =
          '<div class="al-foot"><span class="al-foot-text ' + (ok ? "is-ok" : "is-bad") + '">' +
          (ok ? "Correct!" : "Not quite. The answer is " + esc(LETTERS[item.correct]) + ". " + esc(item.options[item.correct])) +
          "</span>" +
          '<button type="button" class="al-next" id="lc-next">' + (last ? "See results →" : "Next →") + "</button></div>";
      } else if (chosen !== null) {
        foot =
          '<div class="al-foot"><span class="al-foot-text">Check your answer.</span>' +
          '<button type="button" class="al-next" id="lc-check">Check ✓</button></div>';
      } else {
        foot =
          '<div class="al-foot"><span class="al-foot-text">' +
          (listened ? "Choose an answer." : "Tap play to listen first.") +
          "</span></div>";
      }

      root.innerHTML =
        topBar(UNIT, cfg.gameName, (current + 1) + " / " + TOTAL) +
        segmentsHtml() +
        '<main class="lc-main">' +
        '<div class="al-listen">' +
        '<button type="button" class="' + playCls + '" id="lc-play" aria-label="' + esc(listenTitle) + '"' +
        (HAS_AUDIO ? "" : " disabled") + ">" + playIcon + "</button>" +
        '<div class="al-listen-text"><p class="al-listen-title">' + esc(listenTitle) + "</p>" +
        '<p class="al-listen-sub">' + esc(listenSub) + "</p></div>" +
        "</div>" +
        '<section class="al-set' + (entering ? " is-enter" : "") + '" aria-label="Answers">' +
        '<p class="tf-statement">' + esc(item.prompt) + "</p>" +
        (item.stem ? '<p class="st-hint">' + esc(item.stem) + "</p>" : "") +
        '<div class="al-opts' + (item.options.length === 3 ? ' is-tri' : '') + '">' + optsHtml + "</div>" +
        "</section>" +
        foot +
        "</main>";

      entering = false;

      document.getElementById("lc-play").onclick = playAudio;
      root.querySelectorAll("[data-opt]").forEach(function (btn) {
        btn.onclick = function () { choose(+btn.getAttribute("data-opt")); };
      });
      var checkBtn = document.getElementById("lc-check");
      if (checkBtn) checkBtn.onclick = check;
      var nextBtn = document.getElementById("lc-next");
      if (nextBtn) nextBtn.onclick = next;
    }

    function renderPlay() { renderPlayView(); }

    function renderDone() {
      var stars = calcStars();
      var headline = stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!";
      var p = Math.round((correctCount / TOTAL) * 100);
      root.innerHTML =
        topBar(UNIT, "Results", "") +
        '<section class="lc-done"><div class="lc-result">' +
        '<div class="lc-ring" style="--p:' + p + '" aria-hidden="true"><div class="lc-ring-inner">' +
        '<span class="lc-ring-score">' + correctCount + "</span>" +
        '<span class="lc-ring-of">of ' + TOTAL + "</span></div></div>" +
        '<div class="lc-star-row" aria-label="' + stars + ' of 3 stars">' +
        '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
        '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
        '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
        "</div>" +
        "<h1>" + headline + "</h1>" +
        "<p>You got " + correctCount + " out of " + TOTAL + " right.</p>" +
        '<div class="lc-done-actions">' +
        '<button type="button" class="lc-btn primary" id="lc-again">Play again</button>' +
        '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
        "</div></div></section>";
      document.getElementById("lc-again").onclick = startGame;
    }

    function render() {
      if (phase === "start") renderStart();
      else if (phase === "play") renderPlay();
      else renderDone();
    }

    /* ---------- keyboard (desktop) ---------- */

    document.addEventListener("keydown", function (e) {
      if (phase !== "play") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

      var k = e.key;
      if (k === " " || k.toLowerCase() === "p") {
        e.preventDefault();
        playAudio();
        return;
      }
      if (k === "Enter") {
        e.preventDefault();
        if (locked) next();
        else if (chosen !== null) check();
        return;
      }
      if (locked) return;
      var idx = LETTERS.indexOf(k.toLowerCase());
      if (idx === -1 && /^[1-9]$/.test(k)) idx = +k - 1;
      if (idx > -1 && idx < items[current].options.length) {
        e.preventDefault();
        choose(idx);
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && playing) {
        stopAudio();
        renderPlayView();
      }
    });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render);
    } else {
      render();
    }
  }

  window.ListenEngine = { mount: mount };
})();
