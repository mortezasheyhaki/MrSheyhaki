/* Listening games · shared engine
 * Usage (in each game's script.js):
 *   ListenEngine.mount({ gameId, gameName, unitLabel, icon, intro, tips,
 *                        letters, stars: { two, one }, items: [...] });
 * Each item: { prompt, stem, audio, options: [...], correct: index }
 * Hooks used if present: LAStars, LAFinish, LASfx, LAProgressSave.
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

    var phase = "start"; // start | play | done
    var current = 0;
    var correctCount = 0;
    var locked = false;
    var chosen = null;
    var entering = false; // animate the card only when a new item appears
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

    function pct() {
      return Math.round((correctCount / TOTAL) * 100);
    }

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
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
      playing = false;
    }

    function playAudio() {
      var item = items[current];
      if (!item) return;
      sfx("click");
      if (playing) {
        stopAudio();
        renderPlayView();
        return;
      }
      stopAudio();
      audioError = false;
      audio = new Audio(item.audio);
      audio.preload = "auto";
      playing = true;
      listened = true;
      renderPlayView();
      audio.onended = function () {
        playing = false;
        renderPlayView();
      };
      audio.onerror = function () {
        playing = false;
        audioError = true;
        renderPlayView();
      };
      var p = audio.play();
      if (p && p.catch) {
        p.catch(function () {
          playing = false;
          audioError = true;
          renderPlayView();
        });
      }
    }

    /* ---------- flow ---------- */

    function clearAdvance() {
      if (advanceTimer) {
        clearTimeout(advanceTimer);
        advanceTimer = null;
      }
    }

    function startGame() {
      clearAdvance();
      if (window.LAFinish) LAFinish.startTimer();
      current = 0;
      correctCount = 0;
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
      locked = true;
      chosen = i;
      stopAudio();
      var ok = i === items[current].correct;
      if (ok) {
        correctCount++;
        sfx("correct");
      } else {
        sfx("wrong");
      }
      renderPlayView();
      advanceTimer = setTimeout(next, ok ? 1500 : 2300);
    }

    function next() {
      clearAdvance();
      if (!locked) return;
      if (current + 1 >= TOTAL) {
        finish();
        return;
      }
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
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: BACK,
          save: false,
        });
        return;
      }
      render();
    }

    /* ---------- views ---------- */

    function topBar(eyebrow, title) {
      return (
        '<header class="lc-top">' +
        '<a class="lc-back" href="' + BACK + '" aria-label="Back to unit">←</a>' +
        '<div class="lc-top-center">' +
        '<span class="lc-eyebrow">' + esc(eyebrow) + "</span>" +
        "<strong>" + esc(title) + "</strong>" +
        "</div>" +
        '<span class="lc-top-spacer" aria-hidden="true"></span>' +
        "</header>"
      );
    }

    function renderStart() {
      root.innerHTML =
        topBar(UNIT, cfg.gameName) +
        '<section class="lc-hero">' +
        '<div class="lc-hero-icon" aria-hidden="true">' + (cfg.icon || "🎧") + "</div>" +
        "<h1>" + esc(cfg.gameName) + "</h1>" +
        "<p>" + cfg.intro + "</p>" +
        '<ul class="lc-tips">' +
        cfg.tips
          .map(function (t, i) {
            return '<li><span class="tip-num">' + (i + 1) + "</span><span>" + t + "</span></li>";
          })
          .join("") +
        "</ul>" +
        '<button type="button" class="lc-btn primary" id="lc-start">Start listening</button>' +
        "</section>";
      document.getElementById("lc-start").onclick = startGame;
    }

    function renderPlayView() {
      var item = items[current];
      var pctDone = (current / TOTAL) * 100;
      var last = current + 1 >= TOTAL;

      var playCls = "lc-play";
      if (playing) playCls += " is-playing";
      else if (listened) playCls += " has-played";
      if (audioError) playCls += " is-error";

      var playLabel = audioError
        ? "Audio unavailable"
        : playing
        ? "Playing… tap to stop"
        : listened
        ? "Play again"
        : "Play audio";

      var optsHtml = item.options
        .map(function (text, i) {
          var cls = "lc-opt";
          if (chosen !== null) {
            if (i === item.correct) cls += " is-correct";
            else if (i === chosen) cls += " is-wrong";
            else cls += " is-dim";
          }
          return (
            '<button type="button" class="' + cls + '" data-opt="' + i + '"' +
            (locked ? " disabled" : "") + ">" +
            '<span class="lc-letter">' + esc(LETTERS[i]) + "</span>" +
            '<span class="lc-opt-text">' + esc(text) + "</span>" +
            "</button>"
          );
        })
        .join("");

      var feedback = "";
      if (locked) {
        var ok = chosen === item.correct;
        feedback =
          '<div class="lc-feedback ' + (ok ? "is-ok" : "is-bad") + '">' +
          '<div class="lc-feedback-text">' +
          (ok
            ? "Correct! ✓"
            : "Not quite — the answer is " +
              esc(LETTERS[item.correct]) +
              ": “" + esc(item.options[item.correct]) + "”") +
          "</div>" +
          '<button type="button" class="lc-next" id="lc-next">' +
          (last ? "See results →" : "Next →") +
          "</button>" +
          "</div>";
      }

      var cols = item.options.length === 2 ? "cols-2" : "cols-3";

      root.innerHTML =
        topBar(cfg.gameName, current + 1 + " / " + TOTAL) +
        '<div class="lc-progress-bar" aria-hidden="true"><div class="lc-progress-fill" style="width:' +
        pctDone + '%"></div></div>' +
        '<section class="lc-card' + (entering ? " is-enter" : "") + '">' +
        '<p class="lc-prompt">' + esc(item.prompt) + "</p>" +
        '<p class="lc-stem">' + esc(item.stem) + "</p>" +
        '<button type="button" class="' + playCls + '" id="lc-play" aria-label="' +
        esc(playLabel) + '"' + (audioError ? " disabled" : "") + ">" +
        '<span class="lc-play-visual" aria-hidden="true">' +
        (playing
          ? '<span class="lc-bars"><i></i><i></i><i></i><i></i><i></i></span>'
          : '<span class="lc-play-ico">▶</span>') +
        "</span>" +
        '<span class="lc-play-label">' + esc(playLabel) + "</span>" +
        "</button>" +
        '<div class="lc-opts ' + cols + '">' + optsHtml + "</div>" +
        feedback +
        "</section>" +
        '<p class="lc-hint"><kbd>A</kbd> <kbd>B</kbd>' +
        (item.options.length > 2 ? " <kbd>C</kbd>" : "") +
        " choose · <kbd>Space</kbd> play · <kbd>Enter</kbd> next</p>";

      entering = false;

      document.getElementById("lc-play").onclick = playAudio;
      root.querySelectorAll("[data-opt]").forEach(function (btn) {
        btn.onclick = function () {
          choose(+btn.getAttribute("data-opt"));
        };
      });
      var nextBtn = document.getElementById("lc-next");
      if (nextBtn) nextBtn.onclick = next;
    }

    function renderPlay() {
      renderPlayView();
    }

    function renderDone() {
      var stars = calcStars();
      var headline = stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practising!";
      root.innerHTML =
        topBar(UNIT, "Done!") +
        '<section class="lc-done">' +
        '<div class="lc-trophy' + (stars === 3 ? " perfect" : "") + '" aria-hidden="true">' +
        '<div class="lc-trophy-emoji">🏆</div>' +
        '<div class="lc-star-row">' +
        '<span class="star' + (stars >= 1 ? " filled" : "") + '">★</span>' +
        '<span class="star' + (stars >= 2 ? " filled" : "") + '">★</span>' +
        '<span class="star' + (stars >= 3 ? " filled" : "") + '">★</span>' +
        "</div></div>" +
        "<h1>" + headline + "</h1>" +
        "<p>You got <strong>" + correctCount + " / " + TOTAL + "</strong> correct</p>" +
        '<div class="lc-done-actions">' +
        '<button type="button" class="lc-btn primary" id="lc-again">Play again</button>' +
        '<a class="lc-btn secondary" href="' + BACK + '">Back to unit</a>' +
        "</div></section>";
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
      if (k === "Enter" && locked) {
        e.preventDefault();
        next();
        return;
      }
      if (locked) return;
      var idx = -1;
      var lower = k.toLowerCase();
      var li = LETTERS.indexOf(lower);
      if (li !== -1) idx = li;
      else if (/^[1-9]$/.test(k)) idx = +k - 1;
      if (idx > -1 && idx < items[current].options.length) {
        e.preventDefault();
        choose(idx);
      }
    });

    /* stop audio when the tab is hidden */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAudio();
        render();
      }
    });

    /* ---------- boot ---------- */

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render);
    } else {
      render();
    }
  }

  window.ListenEngine = { mount: mount };
})();
