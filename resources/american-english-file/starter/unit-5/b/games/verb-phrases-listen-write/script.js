/* Verb Phrases Listen & Write · AEF Starter Unit 5B
   Same layout as Complete the Phrase — typing box instead of chips.
*/
(function () {
  "use strict";

  var GAME_ID = "starter-5b-verb-phrases-listen-write";

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
    {
      sentence: "live in an apartment",
      answers: ["live in an apartment", "live in a apartment"],
      image: "https://cdn.imgurl.ir/uploads/a268498_1._live_in_an_apartment.png",
      audio: "https://cdn.imgurl.ir/uploads/v24239_1_live_in_an_apartment.mp3"
    },
    {
      sentence: "have breakfast",
      answers: ["have breakfast"],
      image: "https://cdn.imgurl.ir/uploads/i180939_2_have_breakfast.png",
      audio: "https://cdn.imgurl.ir/uploads/q068505_2_have_breakfast.mp3"
    },
    {
      sentence: "watch TV",
      answers: ["watch tv", "watch television"],
      image: "https://cdn.imgurl.ir/uploads/z722778_3_watch_TV.png",
      audio: "https://cdn.imgurl.ir/uploads/j343700_3_watch_TV.mp3"
    },
    {
      sentence: "listen to the radio",
      answers: ["listen to the radio"],
      image: "https://cdn.imgurl.ir/uploads/r771582_4_listen_to_the_radio.png",
      audio: "https://cdn.imgurl.ir/uploads/v936094_4_Listen_to_the_radio.mp3"
    },
    {
      sentence: "read the newspaper",
      answers: ["read the newspaper", "read a newspaper"],
      image: "https://cdn.imgurl.ir/uploads/m787410_5_read_the_newspaper.png",
      audio: "https://cdn.imgurl.ir/uploads/s054742_5_read_the_newspaper.mp3"
    },
    {
      sentence: "eat fast food",
      answers: ["eat fast food"],
      image: "https://cdn.imgurl.ir/uploads/b044304_6__fastfood.png",
      audio: "https://cdn.imgurl.ir/uploads/l78660_6__fastfood.mp3"
    },
    {
      sentence: "drink coffee",
      answers: ["drink coffee"],
      image: "https://cdn.imgurl.ir/uploads/g296945_7_drink_coffee.png",
      audio: "https://cdn.imgurl.ir/uploads/g006864_7_drink_coffee.mp3"
    },
    {
      sentence: "speak English",
      answers: ["speak english"],
      image: "https://cdn.imgurl.ir/uploads/b781742_8_speak_English.png",
      audio: "https://cdn.imgurl.ir/uploads/z53147_8_speak_English.mp3"
    },
    {
      sentence: "want a coffee",
      answers: ["want a coffee", "want coffee"],
      image: "https://cdn.imgurl.ir/uploads/e991538_9_want_a_coffee.png",
      audio: "https://cdn.imgurl.ir/uploads/f683333_9_want_a_coffee.mp3"
    },
    {
      sentence: "have a dog",
      answers: ["have a dog"],
      image: "https://cdn.imgurl.ir/uploads/b92270_10_have_a_dog.png",
      audio: "https://cdn.imgurl.ir/uploads/q784020_10_have_a_dog.mp3"
    },
    {
      sentence: "like cats",
      answers: ["like cats"],
      image: "https://cdn.imgurl.ir/uploads/u544398_11_like_cats.png",
      audio: "https://cdn.imgurl.ir/uploads/v70276_11_like_cats.mp3"
    },
    {
      sentence: "work in a bank",
      answers: ["work in a bank"],
      image: "https://cdn.imgurl.ir/uploads/j72729_12_work_in_a_bank.png",
      audio: "https://cdn.imgurl.ir/uploads/a502_12_work_in_a_bank.mp3"
    },
    {
      sentence: "study Spanish",
      answers: ["study spanish"],
      image: "https://cdn.imgurl.ir/uploads/h46592_13_study_Spanish.png",
      audio: "https://cdn.imgurl.ir/uploads/q92916_13_study_Spanish.mp3"
    },
    {
      sentence: "go to English classes",
      answers: ["go to english classes", "go to english class"],
      image: "https://cdn.imgurl.ir/uploads/x832355_14_Go_to_English_cles.png",
      audio: "https://cdn.imgurl.ir/uploads/y124959_14_Go_to_English_cles.mp3"
    },
    {
      sentence: "need a new car",
      answers: ["need a new car"],
      image: "https://cdn.imgurl.ir/uploads/i19129_15_need_a_new_car.png",
      audio: "https://cdn.imgurl.ir/uploads/o807442_15_need_a_new_car.mp3"
    }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var order = [];
  var index = 0;
  var score = 0;
  var locked = false;
  var currentAudio = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[?.!,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(user, answers) {
    var n = normalize(user);
    if (!n) return false;
    for (var i = 0; i < answers.length; i++) {
      if (n === normalize(answers[i])) return true;
    }
    return false;
  }

  function currentItem() {
    return ITEMS[order[index]];
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
    loadItem();
  }

  function loadItem() {
    if (index >= order.length) {
      endGame();
      return;
    }
    locked = false;
    stopAudio();
    renderPlay();
    setTimeout(playAudio, 280);
    setTimeout(function () {
      var input = document.getElementById("answerInput");
      if (input) input.focus();
    }, 100);
  }

  function updateHud() {
    var q = document.getElementById("qPill");
    var s = document.getElementById("scorePill");
    if (q) q.textContent = index + 1 + "/" + order.length;
    if (s) s.textContent = "SCORE " + score + "/" + order.length;
  }

  function clearAll() {
    if (locked) return;
    var input = document.getElementById("answerInput");
    if (input) {
      input.value = "";
      input.className = "answer-input";
      input.focus();
    }
    var fb = document.getElementById("feedback");
    if (fb) {
      fb.textContent = "";
      fb.className = "feedback";
    }
  }

  function check() {
    if (locked) return;
    var input = document.getElementById("answerInput");
    if (!input) return;
    var user = input.value;
    if (!normalize(user)) return;

    locked = true;
    var item = currentItem();
    var ok = isMatch(user, item.answers);
    var fb = document.getElementById("feedback");
    var checkBtn = document.getElementById("checkBtn");

    if (ok) {
      score++;
      sfxOk();
      updateHud();
      input.className = "answer-input ok";
      input.disabled = true;
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
      input.className = "answer-input bad shake";
      if (fb) {
        fb.textContent = "Try again — listen carefully.";
        fb.className = "feedback bad";
      }
      setTimeout(function () {
        input.classList.remove("shake");
        input.className = "answer-input";
        input.value = "";
        if (fb) {
          fb.textContent = "";
          fb.className = "feedback";
        }
        locked = false;
        input.focus();
      }, 900);
    }
  }

  function endGame() {
    stopAudio();
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
      "<h1>Listen & Write</h1>" +
      '<p class="start-lead">Look at the picture, listen to the verb phrase, and type what you hear.</p>' +
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
      '<p class="prompt-text">Write the phrase</p>' +
      '<p class="example">Listen and type what you hear</p>' +
      "</div>" +
      '<input type="text" class="answer-input" id="answerInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type your answer…">' +
      '<p class="feedback" id="feedback" aria-live="polite"></p>' +
      '<div class="action-row">' +
      '<button type="button" class="ghost-btn" id="clearBtn">Clear</button>' +
      '<button type="button" class="primary-btn" id="checkBtn">Check</button>' +
      "</div>" +
      "</div></div>";

    document.getElementById("playBtn").onclick = playAudio;
    document.getElementById("clearBtn").onclick = clearAll;
    document.getElementById("checkBtn").onclick = check;
    var input = document.getElementById("answerInput");
    input.onkeydown = function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        check();
      }
    };
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
