/* Sound Match Picture – hotel room items – AEF Starter Unit 10A */
(function () {
  "use strict";

  var GAME_ID = "starter-10a-sound-match-picture";

  var prompts = [
    { word: "a bed", image: "https://cdn.imgurl.ir/uploads/w156592_a_bed.png", audio: "https://cdn.imgurl.ir/uploads/k079888_a_bed.mp3" },
    { word: "a pillow", image: "https://cdn.imgurl.ir/uploads/p010495_a_pillow.png", audio: "https://cdn.imgurl.ir/uploads/k982929_a_pillow.mp3" },
    { word: "a lamp", image: "https://cdn.imgurl.ir/uploads/v696561_a_lamp.png", audio: "https://cdn.imgurl.ir/uploads/e308997_a_lamp.mp3" },
    { word: "a light", image: "https://cdn.imgurl.ir/uploads/j614692_a_light.png", audio: "https://cdn.imgurl.ir/uploads/c0025_a_light.mp3" },
    { word: "a remote control", image: "https://cdn.imgurl.ir/uploads/e652023_a_remove_control.png", audio: "https://cdn.imgurl.ir/uploads/l2390_a_remote_control.mp3" },
    { word: "the floor", image: "https://cdn.imgurl.ir/uploads/o904724_the_floor.png", audio: "https://cdn.imgurl.ir/uploads/m188759_the_floor.mp3" },
    { word: "the bathroom", image: "https://cdn.imgurl.ir/uploads/n04774_the_bathroom.png", audio: "https://cdn.imgurl.ir/uploads/b0956_the_bathroom.mp3" },
    { word: "a bathtub", image: "https://cdn.imgurl.ir/uploads/t193497_a_bathtub.png", audio: "https://cdn.imgurl.ir/uploads/w654862_a_bathtub.mp3" },
    { word: "a shower", image: "https://cdn.imgurl.ir/uploads/o196841_a_shower.png", audio: "https://cdn.imgurl.ir/uploads/k048616_a_shower.mp3" },
    { word: "a towel", image: "https://cdn.imgurl.ir/uploads/m945704_a_towel.png", audio: "https://cdn.imgurl.ir/uploads/b252792_a_towel.mp3" },
    { word: "a toilet", image: "https://cdn.imgurl.ir/uploads/v467822_a_toilet.png", audio: "https://cdn.imgurl.ir/uploads/f60235_a_toilet.mp3" },
    { word: "a closet", image: "https://cdn.imgurl.ir/uploads/n887137_a_closet.png", audio: "https://cdn.imgurl.ir/uploads/t492243_a_closet.mp3" }
  ];

  var startScreen = document.querySelector("#startScreen");
  var gameScreen = document.querySelector("#gameScreen");
  var finishScreen = document.querySelector("#finishScreen");
  var pictureGrid = document.querySelector("#pictureGrid");
  var listenButton = document.querySelector("#listenButton");
  var feedback = document.querySelector("#feedback");
  var roundLabel = document.querySelector("#roundLabel");
  var scoreValue = document.querySelector("#scoreValue");
  var progressFill = document.querySelector("#progressFill");
  var finishScore = document.querySelector("#finishScore");

  var promptOrder = [];
  var tileOrder = [];
  var roundIndex = 0;
  var score = 0;
  var acceptingAnswer = false;
  var currentAudio = null;
  var sfxCtx = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function currentPrompt() {
    return promptOrder[roundIndex] || null;
  }

  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function tone(freq, start, dur, type, gain) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function sfxOk() {
    try { if (window.LASfx && LASfx.correct) LASfx.correct(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    var t = ctx.currentTime;
    tone(523.25, t, 0.1, "triangle", 0.12);
    tone(659.25, t + 0.08, 0.11, "triangle", 0.12);
    tone(783.99, t + 0.16, 0.16, "sine", 0.11);
  }
  function sfxBad() {
    try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); } catch (_) {}
    var ctx = getSfxCtx(); if (!ctx) return;
    tone(200, ctx.currentTime, 0.14, "sawtooth", 0.06);
  }

  function stopCurrentAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    if (listenButton) listenButton.classList.remove("playing");
  }

  function playCurrentSound() {
    var prompt = currentPrompt();
    if (!prompt) return;
    stopCurrentAudio();
    getSfxCtx();
    var a = new Audio(prompt.audio);
    currentAudio = a;
    if (listenButton) listenButton.classList.add("playing");
    a.play().catch(function () {
      if (listenButton) listenButton.classList.remove("playing");
    });
    a.onended = function () {
      if (listenButton) listenButton.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function renderTiles() {
    pictureGrid.innerHTML = "";
    tileOrder.forEach(function (prompt, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "picture-card";
      button.dataset.word = prompt.word;
      button.setAttribute("aria-label", "Picture " + (index + 1));
      button.innerHTML = '<img src="' + prompt.image + '" alt="" draggable="false" />';
      button.addEventListener("click", function () {
        selectPicture(prompt, button);
      });
      pictureGrid.appendChild(button);
    });
  }

  function updateHud() {
    roundLabel.textContent = "Sound " + Math.min(roundIndex + 1, prompts.length) + " of " + prompts.length;
    scoreValue.textContent = String(score);
    progressFill.style.width = (score / prompts.length) * 100 + "%";
  }

  function beginRound() {
    var prompt = currentPrompt();
    if (!prompt) {
      showFinish();
      return;
    }
    acceptingAnswer = true;
    updateHud();
    feedback.className = "feedback";
    feedback.textContent = "Tap a picture after you listen.";
    setTimeout(playCurrentSound, 220);
  }

  function selectPicture(selectedPrompt, button) {
    if (!acceptingAnswer || button.disabled) return;
    var target = currentPrompt();
    if (!target) return;

    if (selectedPrompt.word !== target.word) {
      sfxBad();
      button.classList.remove("wrong");
      void button.offsetWidth;
      button.classList.add("wrong");
      feedback.className = "feedback incorrect";
      feedback.textContent = "Not this one. Listen again and try another picture.";
      setTimeout(function () { button.classList.remove("wrong"); }, 650);
      return;
    }

    acceptingAnswer = false;
    stopCurrentAudio();
    sfxOk();
    button.disabled = true;
    button.classList.add("matched");
    score += 1;
    feedback.className = "feedback correct";
    feedback.textContent = 'Great! That was “' + selectedPrompt.word + '.”';
    updateHud();
    setTimeout(function () {
      roundIndex += 1;
      beginRound();
    }, 820);
  }

  function showFinish() {
    stopCurrentAudio();
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: prompts.length,
          timeMs: timeMs,
          onAgain: function () { startGame(); },
          onModes: function () { goHome(); },
          backHref: "../"
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }

    gameScreen.classList.add("hidden");
    finishScreen.classList.remove("hidden");
    finishScore.textContent = String(score);
    var acc = prompts.length ? Math.round((score / prompts.length) * 100) : 0;
    var stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    var starRow = document.querySelector("#finishStars");
    if (starRow) {
      starRow.innerHTML = [1, 2, 3].map(function (n) {
        return '<span class="star ' + (n <= stars ? "is-filled" : "") + '">' + (n <= stars ? "★" : "☆") + "</span>";
      }).join("");
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}
  }

  function startGame() {
    getSfxCtx();
    if (window.LAFinish) LAFinish.startTimer();
    stopCurrentAudio();
    promptOrder = shuffle(prompts);
    tileOrder = shuffle(prompts);
    roundIndex = 0;
    score = 0;
    startScreen.classList.add("hidden");
    finishScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    renderTiles();
    beginRound();
  }

  function goHome() {
    stopCurrentAudio();
    gameScreen.classList.add("hidden");
    finishScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
  }

  document.querySelector("#startButton").addEventListener("click", startGame);
  document.querySelector("#restartButton").addEventListener("click", startGame);
  document.querySelector("#homeFromGame").addEventListener("click", goHome);
  document.querySelector("#homeButton").addEventListener("click", goHome);
  document.querySelector("#replayButton").addEventListener("click", startGame);
  listenButton.addEventListener("click", playCurrentSound);

  // Preload images
  prompts.forEach(function (p) {
    var img = new Image();
    img.src = p.image;
  });
})();
