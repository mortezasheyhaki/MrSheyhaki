/* Complete the Phrase · AEF Starter Unit 5B
   Layout like continuous-positive / typing games — chips only (+ 2 extras).
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-complete";

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

  var ITEMS = [
    { words: ["live", "in", "an", "apartment"], sentence: "live in an apartment", image: "https://cdn.imgurl.ir/uploads/a268498_1._live_in_an_apartment.png", audio: "https://cdn.imgurl.ir/uploads/v24239_1_live_in_an_apartment.mp3" },
    { words: ["have", "breakfast"], sentence: "have breakfast", image: "https://cdn.imgurl.ir/uploads/i180939_2_have_breakfast.png", audio: "https://cdn.imgurl.ir/uploads/q068505_2_have_breakfast.mp3" },
    { words: ["watch", "TV"], sentence: "watch TV", image: "https://cdn.imgurl.ir/uploads/z722778_3_watch_TV.png", audio: "https://cdn.imgurl.ir/uploads/j343700_3_watch_TV.mp3" },
    { words: ["listen", "to", "the", "radio"], sentence: "listen to the radio", image: "https://cdn.imgurl.ir/uploads/r771582_4_listen_to_the_radio.png", audio: "https://cdn.imgurl.ir/uploads/v936094_4_Listen_to_the_radio.mp3" },
    { words: ["read", "the", "newspaper"], sentence: "read the newspaper", image: "https://cdn.imgurl.ir/uploads/m787410_5_read_the_newspaper.png", audio: "https://cdn.imgurl.ir/uploads/s054742_5_read_the_newspaper.mp3" },
    { words: ["eat", "fast", "food"], sentence: "eat fast food", image: "https://cdn.imgurl.ir/uploads/b044304_6__fastfood.png", audio: "https://cdn.imgurl.ir/uploads/l78660_6__fastfood.mp3" },
    { words: ["drink", "coffee"], sentence: "drink coffee", image: "https://cdn.imgurl.ir/uploads/g296945_7_drink_coffee.png", audio: "https://cdn.imgurl.ir/uploads/g006864_7_drink_coffee.mp3" },
    { words: ["speak", "English"], sentence: "speak English", image: "https://cdn.imgurl.ir/uploads/b781742_8_speak_English.png", audio: "https://cdn.imgurl.ir/uploads/z53147_8_speak_English.mp3" },
    { words: ["want", "a", "coffee"], sentence: "want a coffee", image: "https://cdn.imgurl.ir/uploads/e991538_9_want_a_coffee.png", audio: "https://cdn.imgurl.ir/uploads/f683333_9_want_a_coffee.mp3" },
    { words: ["have", "a", "dog"], sentence: "have a dog", image: "https://cdn.imgurl.ir/uploads/b92270_10_have_a_dog.png", audio: "https://cdn.imgurl.ir/uploads/q784020_10_have_a_dog.mp3" },
    { words: ["like", "cats"], sentence: "like cats", image: "https://cdn.imgurl.ir/uploads/u544398_11_like_cats.png", audio: "https://cdn.imgurl.ir/uploads/v70276_11_like_cats.mp3" },
    { words: ["work", "in", "a", "bank"], sentence: "work in a bank", image: "https://cdn.imgurl.ir/uploads/j72729_12_work_in_a_bank.png", audio: "https://cdn.imgurl.ir/uploads/a502_12_work_in_a_bank.mp3" },
    { words: ["study", "Spanish"], sentence: "study Spanish", image: "https://cdn.imgurl.ir/uploads/h46592_13_study_Spanish.png", audio: "https://cdn.imgurl.ir/uploads/q92916_13_study_Spanish.mp3" },
    { words: ["go", "to", "English", "classes"], sentence: "go to English classes", image: "https://cdn.imgurl.ir/uploads/x832355_14_Go_to_English_cles.png", audio: "https://cdn.imgurl.ir/uploads/y124959_14_Go_to_English_cles.mp3" },
    { words: ["need", "a", "new", "car"], sentence: "need a new car", image: "https://cdn.imgurl.ir/uploads/i19129_15_need_a_new_car.png", audio: "https://cdn.imgurl.ir/uploads/o807442_15_need_a_new_car.mp3" }
  ];

  var EXTRA_POOL = ["house", "tea", "book", "school", "music", "office", "park", "phone", "bus", "hotel", "my", "your", "on"];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start";
  var order = [];
  var index = 0;
  var score = 0;
  var locked = false;
  var tray = [];
  var bank = [];
  var currentAudio = null;

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

  function pickExtras(item) {
    var used = {};
    item.words.forEach(function (w) { used[w.toLowerCase()] = true; });
    var candidates = [];
    ITEMS.forEach(function (it) {
      it.words.forEach(function (w) {
        if (!used[w.toLowerCase()]) candidates.push(w);
      });
    });
    EXTRA_POOL.forEach(function (w) {
      if (!used[w.toLowerCase()]) candidates.push(w);
    });
    candidates = shuffle(candidates);
    var extras = [];
    var seen = {};
    for (var i = 0; i < candidates.length && extras.length < 2; i++) {
      var k = candidates[i].toLowerCase();
      if (seen[k]) continue;
      seen[k] = true;
      extras.push(candidates[i]);
    }
    while (extras.length < 2) extras.push("the");
    return extras;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    var btn = document.getElementById("playBtn");
    if (btn) btn.classList.remove("is-playing");
  }

  function playAudio() {
    var item = currentItem();
    if (!item || !item.audio) return;
    stopAudio();
    sfxTap();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = document.getElementById("playBtn");
    if (btn) btn.classList.add("is-playing");
    a.play().catch(function () { if (btn) btn.classList.remove("is-playing"); });
    a.onended = function () {
      if (btn) btn.classList.remove("is-playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    order = shuffle(ITEMS.map(function (_, i) { return i; }));
    index = 0;
    score = 0;
    locked = false;
    phase = "play";
    loadItem();
  }

  function loadItem() {
    if (index >= order.length) {
      endGame();
      return;
    }
    locked = false;
    stopAudio();
    tray = [];
    var item = currentItem();
    bank = shuffle(item.words.concat(pickExtras(item)));
    renderPlay();
    setTimeout(playAudio, 280);
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
      el.innerHTML = '<p class="tray-empty">Tap chips to build the phrase</p>';
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
    var usedCount = {};
    tray.forEach(function (w) {
      usedCount[w] = (usedCount[w] || 0) + 1;
    });
    var available = {};
    bank.forEach(function (w) {
      available[w] = (available[w] || 0) + 1;
    });

    el.innerHTML = bank
      .map(function (w, i) {
        var used = (usedCount[w] || 0) > 0;
        if (used) {
          usedCount[w]--;
          available[w]--;
        }
        var isUsed = used || available[w] <= 0;
        // recount properly: chip is used if this instance is taken
        return null; // rebuilt below
      })
      .join("");

    // Build bank: each chip can be used once
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
    stopAudio();
    phase = "results";
    renderResults();
  }

  function renderStart() {
    app.innerHTML =
      '<div class="game">' +
      '<header class="top-bar">' +
      '<a class="back-btn" href="../" aria-label="Back">←</a>' +
      '<div class="top-spacer"></div>' +
      "</header>" +
      '<div class="start-body">' +
      "<h1>Complete the Phrase</h1>" +
      '<p class="start-lead">Look at the picture, listen, and build each verb phrase with the word chips. Two extra words each time.</p>' +
      '<button type="button" class="primary-btn" id="startBtn">START</button>' +
      "</div></div>";
    document.getElementById("startBtn").onclick = startGame;
  }

  function renderPlay() {
    var item = currentItem();
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
      '<p class="section-label">Verb phrase · ' +
      (index + 1) +
      "/" +
      order.length +
      "</p>" +
      '<div class="pic-card">' +
      '<img src="' +
      item.image +
      '" alt="" draggable="false">' +
      '<button type="button" class="play-btn" id="playBtn" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      "</div>" +
      '<div class="prompt-row">' +
      '<p class="prompt-text">Complete the phrase</p>' +
      '<p class="example">Tap the chips in the correct order</p>' +
      "</div>" +
      '<div class="tray" id="tray"></div>' +
      '<div class="chip-bank" id="bank"></div>' +
      '<p class="feedback" id="feedback" aria-live="polite"></p>' +
      '<div class="action-row">' +
      '<button type="button" class="ghost-btn" id="clearBtn">Clear</button>' +
      '<button type="button" class="primary-btn" id="checkBtn" disabled>Check</button>' +
      "</div>" +
      "</div></div>";

    document.getElementById("playBtn").onclick = playAudio;
    document.getElementById("clearBtn").onclick = clearAll;
    document.getElementById("checkBtn").onclick = check;
    renderTray();
    renderBank();
  }

  function renderResults() {
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
            phase = "start";
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

  renderStart();
})();
