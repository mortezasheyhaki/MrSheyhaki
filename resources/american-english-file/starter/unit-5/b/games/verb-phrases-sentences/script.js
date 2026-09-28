/* Verb Phrases Sentences · AEF Starter Unit 5B
   Build positive & negative present simple sentences with chips.
   Some include time expressions. No audio.
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-sentences";

  (function () {
    if (window.__laUiSfx) return;
    var ctx = null;
    function getCtx() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume().catch(function () {});
      return ctx;
    }
    function tone(freq, dur, type, vol, when) {
      var c = getCtx();
      if (!c) return;
      var t0 = (when || 0) + c.currentTime;
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    window.__laUiSfx = {
      tap: function () { tone(520, 0.06, "triangle", 0.08); },
      correct: function () {
        tone(523, 0.1, "sine", 0.12, 0);
        tone(659, 0.12, "sine", 0.12, 0.08);
        tone(784, 0.18, "sine", 0.1, 0.16);
      },
      wrong: function () {
        tone(220, 0.14, "sawtooth", 0.07, 0);
        tone(180, 0.18, "sawtooth", 0.06, 0.1);
      },
      celebrate: function () {
        [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
      }
    };
  })();

  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }
  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }

  /* polarity: "pos" | "neg"
     words = chip sequence including period as last chip optional — we skip period, show in sentence display
  */
  var ITEMS = [
    {
      polarity: "pos",
      words: ["I", "have", "breakfast", "in", "the", "morning"],
      sentence: "I have breakfast in the morning.",
      hint: "I / have breakfast / morning"
    },
    {
      polarity: "pos",
      words: ["I", "watch", "TV", "in", "the", "evening"],
      sentence: "I watch TV in the evening.",
      hint: "I / watch TV / evening"
    },
    {
      polarity: "neg",
      words: ["I", "don't", "eat", "fast", "food"],
      sentence: "I don't eat fast food.",
      hint: "I / not / eat fast food"
    },
    {
      polarity: "pos",
      words: ["We", "live", "in", "an", "apartment"],
      sentence: "We live in an apartment.",
      hint: "We / live in an apartment"
    },
    {
      polarity: "pos",
      words: ["They", "drink", "coffee", "in", "the", "morning"],
      sentence: "They drink coffee in the morning.",
      hint: "They / drink coffee / morning"
    },
    {
      polarity: "neg",
      words: ["We", "don't", "watch", "TV", "at", "night"],
      sentence: "We don't watch TV at night.",
      hint: "We / not / watch TV / night"
    },
    {
      polarity: "pos",
      words: ["I", "listen", "to", "the", "radio", "in", "the", "afternoon"],
      sentence: "I listen to the radio in the afternoon.",
      hint: "I / listen to the radio / afternoon"
    },
    {
      polarity: "pos",
      words: ["You", "speak", "English"],
      sentence: "You speak English.",
      hint: "You / speak English"
    },
    {
      polarity: "neg",
      words: ["They", "don't", "have", "a", "dog"],
      sentence: "They don't have a dog.",
      hint: "They / not / have a dog"
    },
    {
      polarity: "pos",
      words: ["I", "read", "the", "newspaper", "in", "the", "morning"],
      sentence: "I read the newspaper in the morning.",
      hint: "I / read the newspaper / morning"
    },
    {
      polarity: "neg",
      words: ["I", "don't", "like", "cats"],
      sentence: "I don't like cats.",
      hint: "I / not / like cats"
    },
    {
      polarity: "pos",
      words: ["We", "work", "in", "a", "bank"],
      sentence: "We work in a bank.",
      hint: "We / work in a bank"
    },
    {
      polarity: "pos",
      words: ["I", "study", "Spanish", "in", "the", "evening"],
      sentence: "I study Spanish in the evening.",
      hint: "I / study Spanish / evening"
    },
    {
      polarity: "neg",
      words: ["You", "don't", "need", "a", "new", "car"],
      sentence: "You don't need a new car.",
      hint: "You / not / need a new car"
    },
    {
      polarity: "pos",
      words: ["They", "go", "to", "English", "classes", "every", "day"],
      sentence: "They go to English classes every day.",
      hint: "They / go to English classes / every day"
    },
    {
      polarity: "neg",
      words: ["We", "don't", "drink", "coffee", "at", "night"],
      sentence: "We don't drink coffee at night.",
      hint: "We / not / drink coffee / night"
    }
  ];


  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var index = 0;
  var score = 0;
  var locked = false;
  var tray = [];
  var bank = [];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function currentItem() {
    return ITEMS[order[index]];
  }


  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    locked = false;
    loadItem();
  }

  function loadItem() {
    if (index >= order.length) {
      endGame();
      return;
    }
    locked = false;
    tray = [];
    var item = currentItem();
    bank = shuffle(item.words.slice());
    renderPlay();
  }

  function updateHud() {
    var q = document.getElementById("qPill");
    var s = document.getElementById("scorePill");
    if (q) q.textContent = index + 1 + "/" + order.length;
    if (s) s.textContent = "SCORE " + score + "/" + order.length;
  }

  function renderTray() {
    var el = document.getElementById("tray");
    var checkBtn = document.getElementById("checkBtn");
    if (!el) return;
    el.className = "tray";
    if (!tray.length) {
      el.innerHTML = '<p class="tray-empty">Tap chips to build the sentence</p>';
      if (checkBtn) checkBtn.disabled = true;
      return;
    }
    el.innerHTML = tray
      .map(function (t, i) {
        return (
          '<button type="button" class="chip in-tray" data-tray="' +
          i +
          '">' +
          escapeHtml(t) +
          "</button>"
        );
      })
      .join("");
    el.querySelectorAll("[data-tray]").forEach(function (btn) {
      btn.onclick = function () {
        if (locked) return;
        sfxTap();
        tray.splice(+btn.dataset.tray, 1);
        renderTray();
        renderBank();
      };
    });
    if (checkBtn) checkBtn.disabled = false;
  }

  function renderBank() {
    var el = document.getElementById("bank");
    if (!el) return;
    var remaining = {};
    tray.forEach(function (w) {
      remaining[w] = (remaining[w] || 0) + 1;
    });
    el.innerHTML = bank
      .map(function (w, i) {
        var isUsed = false;
        if (remaining[w] > 0) {
          remaining[w]--;
          isUsed = true;
        }
        return (
          '<button type="button" class="chip' +
          (isUsed ? " used" : "") +
          '" data-bank="' +
          i +
          '"' +
          (isUsed ? " disabled" : "") +
          ">" +
          escapeHtml(w) +
          "</button>"
        );
      })
      .join("");
    el.querySelectorAll(".chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        if (locked) return;
        sfxTap();
        tray.push(bank[+btn.dataset.bank]);
        renderTray();
        renderBank();
      };
    });
  }

  function clearAll() {
    if (locked) return;
    sfxTap();
    tray = [];
    renderTray();
    renderBank();
    var fb = document.getElementById("feedback");
    if (fb) {
      fb.textContent = "";
      fb.className = "feedback";
    }
  }

  function check() {
    if (locked) return;
    var item = currentItem();
    if (!tray.length) return;
    locked = true;
    var ok =
      tray.length === item.words.length &&
      tray.every(function (w, i) {
        return w === item.words[i];
      });
    var trayEl = document.getElementById("tray");
    var fb = document.getElementById("feedback");
    var checkBtn = document.getElementById("checkBtn");

    if (ok) {
      score++;
      sfxOk();
      updateHud();
      if (trayEl) trayEl.className = "tray ok";
      if (fb) {
        fb.textContent = "✓ " + item.sentence;
        fb.className = "feedback ok";
      }
      if (checkBtn) checkBtn.disabled = true;
      setTimeout(function () {
        index++;
        loadItem();
      }, 1100);
    } else {
      sfxBad();
      if (trayEl) {
        trayEl.className = "tray bad shake";
        setTimeout(function () {
          if (trayEl) trayEl.classList.remove("shake");
        }, 300);
      }
      if (fb) {
        fb.textContent = "Try again.";
        fb.className = "feedback bad";
      }
      locked = false;
    }
  }

  function endGame() {
    var total = order.length;
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : accuracy >= 25 ? 1 : 0;

    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>" +
      (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") +
      "</h1>" +
      '<p class="start-lead">You scored <strong>' +
      score +
      "</strong> of <strong>" +
      total +
      "</strong>.</p>" +
      '<button type="button" class="primary-btn" id="againBtn">PLAY AGAIN</button>' +
      "</div></div>";

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          accuracy: accuracy,
          stars: stars,
          timeMs: timeMs,
          save: true,
          onAgain: startGame,
          onModes: function () {
            renderStart();
          },
          backHref: "../"
        });
      } catch (e) {}
    } else if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      } catch (e) {}
    }

    document.getElementById("againBtn").onclick = startGame;
  }

  function renderStart() {
    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>Sentence Builder</h1>" +
      '<p class="start-lead">Build positive and negative sentences with verb phrases. Some include a time expression. Tap the chips in order.</p>' +
      '<button type="button" class="primary-btn" id="startBtn">START</button>' +
      "</div></div>";
    document.getElementById("startBtn").onclick = startGame;
  }

  function renderPlay() {
    var item = currentItem();
    var isPos = item.polarity === "pos";
    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="pill" id="qPill">' +
      (index + 1) +
      "/" +
      order.length +
      "</span>" +
      '<span class="pill score" id="scorePill">SCORE ' +
      score +
      "/" +
      order.length +
      "</span>" +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="play-body">' +
      '<p class="section-label">' +
      (isPos ? "Positive" : "Negative") +
      " · " +
      (index + 1) +
      "/" +
      order.length +
      "</p>" +
      '<div class="prompt-card">' +
      '<span class="polarity ' +
      (isPos ? "pos" : "neg") +
      '">' +
      (isPos ? "Positive +" : "Negative −") +
      "</span>" +
      '<p class="prompt-text">Build the sentence</p>' +
      '<p class="example">' +
      escapeHtml(item.hint) +
      "</p>" +
      "</div>" +
      '<div class="tray" id="tray"></div>' +
      '<div class="chip-bank" id="bank"></div>' +
      '<p class="feedback" id="feedback" aria-live="polite"></p>' +
      '<div class="action-row">' +
      '<button type="button" class="ghost-btn" id="clearBtn">Clear</button>' +
      '<button type="button" class="primary-btn" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      "</div></div>";

    document.getElementById("clearBtn").onclick = clearAll;
    document.getElementById("checkBtn").onclick = check;
    renderTray();
    renderBank();
  }

  renderStart();
})();
