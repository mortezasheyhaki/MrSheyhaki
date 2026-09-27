/* Plural -s Sound Match · Teen2Teen 1 Unit 10
   Match clothes plurals to /s/, /z/, or /ɪz/
   Sound buttons play when tapped.
*/
(function () {
  "use strict";

  var GAME_ID = "t2t1-u10-plural-s-sound-match";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var SOUND_AUDIO = {
    s:  CDN + "m83194_s.mp3",
    z:  CDN + "t94813_z.mp3",
    iz: CDN + "q75795_iz.mp3"
  };

  var ITEMS = [
    { id: "blouses",  word: "blouses",  sound: "iz", image: CDN + "g22371_blouses.png",  audio: CDN + "u615131_blouses.mp3" },
    { id: "dresses",  word: "dresses",  sound: "iz", image: CDN + "y207002_dresses.png", audio: CDN + "h057752_dresses.mp3" },
    { id: "jeans",    word: "jeans",    sound: "z",  image: CDN + "r88223_jeans.png",    audio: CDN + "d431475_jeans_3.mp3" },
    { id: "pants",    word: "pants",    sound: "s",  image: CDN + "r944807_pants.png",   audio: CDN + "q23627_pants_2.mp3" },
    { id: "shirts",   word: "shirts",   sound: "s",  image: CDN + "u940372_shirts.png",  audio: CDN + "d970759_shirts.mp3" },
    { id: "shoes",    word: "shoes",    sound: "z",  image: CDN + "d773019_shoes.png",   audio: CDN + "v20246_shoes_3.mp3" },
    { id: "skirts",   word: "skirts",   sound: "s",  image: CDN + "s78041_sts.png",      audio: CDN + "k68854_sts.mp3" },
    { id: "sweaters", word: "sweaters", sound: "z",  image: CDN + "x746272_swers.png",   audio: CDN + "y61796_swers.mp3" }
  ];

  var IPA = { s: "/s/", z: "/z/", iz: "/ɪz/" };
  var IPA_LABEL = { s: "/s/", z: "/z/", iz: "/ɪz/" };

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | results
  var deck = [];
  var index = 0;
  var score = 0;
  var total = 0;
  var locked = false;
  var currentAudio = null;
  var soundAudio = null;

  /* ── SFX ── */
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

  function sfxOk() { try { if (window.LASfx && LASfx.correct) LASfx.correct(); else if (window.__laUiSfx) window.__laUiSfx.correct(); } catch (_) {} }
  function sfxBad() { try { if (window.LASfx && LASfx.wrong) LASfx.wrong(); else if (window.__laUiSfx) window.__laUiSfx.wrong(); } catch (_) {} }
  function sfxCelebrate() { try { if (window.LASfx && LASfx.celebrate) LASfx.celebrate(); else if (window.__laUiSfx) window.__laUiSfx.celebrate(); } catch (_) {} }
  function sfxTap() { try { if (window.__laUiSfx) window.__laUiSfx.tap(); } catch (_) {} }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    if (soundAudio) {
      try { soundAudio.pause(); } catch (_) {}
      soundAudio = null;
    }
    var btn = document.getElementById("ps-listen");
    if (btn) btn.classList.remove("is-playing");
  }

  function playWord() {
    var item = deck[index];
    if (!item || !item.audio) return;
    stopAudio();
    var a = new Audio(item.audio);
    currentAudio = a;
    var btn = document.getElementById("ps-listen");
    if (btn) btn.classList.add("is-playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("is-playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("is-playing");
      currentAudio = null;
    };
  }

  function playSoundSample(key) {
    var url = SOUND_AUDIO[key];
    if (!url) return;
    // Don't stop the word audio entirely if we want both — but cleaner to stop
    if (soundAudio) {
      try { soundAudio.pause(); } catch (_) {}
    }
    var a = new Audio(url);
    soundAudio = a;
    a.play().catch(function () {});
    a.onended = function () { if (soundAudio === a) soundAudio = null; };
  }

  function startGame() {
    if (window.LAFinish && LAFinish.startTimer) {
      try { LAFinish.startTimer(); } catch (_) {}
    }
    deck = shuffle(ITEMS);
    index = 0;
    score = 0;
    total = 0;
    locked = false;
    phase = "play";
    render();
    // auto-play first word shortly after render
    setTimeout(playWord, 280);
  }

  function nextRound() {
    index++;
    locked = false;
    if (index >= deck.length) {
      endGame();
      return;
    }
    render();
    setTimeout(playWord, 220);
  }

  function endGame() {
    stopAudio();
    phase = "results";
    render();
  }

  function choose(sound) {
    if (locked || phase !== "play") return;
    // Always play the phoneme sample when a choice is pressed
    playSoundSample(sound);

    var item = deck[index];
    if (!item) return;

    locked = true;
    total++;

    var ok = sound === item.sound;
    var btnS = document.querySelector('.ps-choice[data-sound="' + sound + '"]');
    var fb = document.getElementById("ps-fb");
    var all = document.querySelectorAll(".ps-choice");

    if (ok) {
      score++;
      sfxOk();
      if (btnS) btnS.classList.add("is-ok");
      if (fb) {
        fb.textContent = "Yes! " + item.word + " ends with " + IPA[item.sound];
        fb.className = "ps-fb is-ok";
      }
      all.forEach(function (b) { b.disabled = true; });
      setTimeout(nextRound, 900);
    } else {
      sfxBad();
      if (btnS) btnS.classList.add("is-bad");
      if (fb) {
        fb.textContent = "Not quite — try again. Listen to the word.";
        fb.className = "ps-fb is-bad";
      }
      // allow retry after short delay
      setTimeout(function () {
        if (btnS) btnS.classList.remove("is-bad");
        if (fb) {
          fb.textContent = "Tap the ending sound: /s/  /z/  /ɪz/";
          fb.className = "ps-fb";
        }
        locked = false;
      }, 700);
    }
  }

  function speakerSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a3.5 3.5 0 0 0-1.8-3.05v6.1A3.5 3.5 0 0 0 16.5 12zM14 5.05v1.6a6 6 0 0 1 0 10.7v1.6A7.5 7.5 0 0 0 14 5.05z"/></svg>';
  }

  function render() {
    if (phase === "start") return renderStart();
    if (phase === "results") return renderResults();
    return renderPlay();
  }

  function renderStart() {
    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Plural -s Sound Match</span>' +
      '<span class="ps-badge">Unit 10</span></header>' +
      '<section class="ps-start">' +
      '<div class="ps-hero" aria-hidden="true">🔊</div>' +
      '<h1>Plural -s Sound Match</h1>' +
      '<p class="ps-sub">Hear the clothes word. Choose the ending sound: /s/, /z/, or /ɪz/.</p>' +
      '<p class="ps-prompt" style="margin-bottom:8px">Tap a sound to hear it</p>' +
      '<div class="ps-sound-preview">' +
      '<button type="button" class="ps-preview-btn" data-sound="s">/s/<small>shirts · pants</small></button>' +
      '<button type="button" class="ps-preview-btn" data-sound="z">/z/<small>jeans · shoes</small></button>' +
      '<button type="button" class="ps-preview-btn" data-sound="iz">/ɪz/<small>dresses · blouses</small></button>' +
      '</div>' +
      '<ul class="ps-tips">' +
      '<li>8 clothes plurals</li>' +
      '<li>Tap a sound button to hear it</li>' +
      '<li>Listen to the word, then choose</li>' +
      '</ul>' +
      '<button type="button" class="ps-btn" id="ps-start">START</button>' +
      '</section>';

    document.getElementById("ps-start").onclick = startGame;
    app.querySelectorAll(".ps-preview-btn").forEach(function (btn) {
      btn.onclick = function () {
        sfxTap();
        playSoundSample(btn.getAttribute("data-sound"));
      };
    });
  }

  function renderPlay() {
    var item = deck[index];
    var pct = Math.round((index / deck.length) * 100);

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Plural -s Sound Match</span>' +
      '<span class="ps-badge">' + (index + 1) + "/" + deck.length + "</span>" +
      '<span class="ps-stat">SCORE ' + score + "/" + total + "</span>" +
      "</header>" +
      '<div class="ps-progress"><div class="ps-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="ps-card">' +
      '<div class="ps-picwrap"><img class="ps-pic" src="' + item.image + '" alt="" draggable="false"></div>' +
      '<p class="ps-word">' + escapeHtml(item.word) + "</p>" +
      '<button type="button" class="ps-listen" id="ps-listen" aria-label="Play word">' +
      speakerSvg() + " Hear the word</button>" +
      "</div>" +
      '<p class="ps-prompt">Which ending sound?</p>' +
      '<div class="ps-choices">' +
      choiceBtn("s") + choiceBtn("z") + choiceBtn("iz") +
      "</div>" +
      '<p class="ps-fb" id="ps-fb" aria-live="polite">Tap a sound to hear it — then choose</p>';

    document.getElementById("ps-listen").onclick = function () {
      playWord();
    };
    app.querySelectorAll(".ps-choice").forEach(function (btn) {
      btn.onclick = function () {
        choose(btn.getAttribute("data-sound"));
      };
    });
  }

  function choiceBtn(sound) {
    var examples = { s: "like shirts", z: "like jeans", iz: "like dresses" };
    return (
      '<button type="button" class="ps-choice" data-sound="' + sound + '" aria-label="Sound ' + IPA[sound] + '">' +
      '<span class="speaker" aria-hidden="true">' + speakerSvg() + "</span>" +
      '<span class="ipa">' + IPA_LABEL[sound] + "</span>" +
      '<span class="hint">' + examples[sound] + "</span>" +
      "</button>"
    );
  }

  function renderResults() {
    var accuracy = total ? Math.round((score / total) * 100) : 0;
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    var msg = accuracy >= 90
      ? "Perfect ear for plural -s!"
      : accuracy >= 70
      ? "Great job with /s/, /z/, and /ɪz/!"
      : "Keep practising the three ending sounds.";

    app.innerHTML =
      '<header class="ps-topbar">' +
      '<a class="ps-back" href="../" aria-label="Back">←</a>' +
      '<span class="ps-title">Plural -s Sound Match</span>' +
      '<span class="ps-badge">Done</span></header>' +
      '<section class="ps-start">' +
      '<div class="ps-hero" aria-hidden="true">🎯</div>' +
      "<h1>" + (stars === 3 ? "Perfect!" : stars > 0 ? "Well done!" : "Keep going!") + "</h1>" +
      '<p class="ps-sub">You got <strong>' + score + "</strong> of <strong>" + total + "</strong> correct.</p>" +
      '<p class="ps-sub">' + msg + "</p>" +
      '<button type="button" class="ps-btn" id="ps-again">PLAY AGAIN</button>' +
      '</section>';

    sfxCelebrate();

    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : 0;
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          stars: stars,
          timeMs: timeMs,
          onAgain: startGame,
          onModes: function () { phase = "start"; render(); },
          backHref: "../"
        });
      } catch (e) {}
    }

    try {
      if (window.LAStars && LAStars.saveFromAccuracy) {
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      }
    } catch (e) {}

    document.getElementById("ps-again").onclick = startGame;
  }

  // Preload images
  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
