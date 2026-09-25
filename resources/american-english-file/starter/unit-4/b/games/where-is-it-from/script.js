/* Where is it from? — AEF Starter Unit 4B
   Write: It's + nationality  OR  It's from + country
*/
(function () {
  "use strict";

  

/* === Shared UI sound effects (Web Audio) === */
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
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

const GAME_ID = "starter-4b-where-is-it-from";

  const ITEMS = [
    {
      n: 1,
      brand: "Chevrolet",
      img: "https://cdn.imgurl.ir/uploads/m65037_Chevrolet_American.png",
      audio: "audio/Chevrolet American.mp3",
      flag: "🇺🇸",
      nationality: "American",
      country: "America",
      countryAlts: ["the united states", "the usa", "usa", "the us", "united states", "america"],
      model: "It's American. / It's from America.",
    },
    {
      n: 2,
      brand: "Honda",
      img: "https://cdn.imgurl.ir/uploads/z797028_Honda_Japanese.png",
      audio: "audio/Honda Japanese.mp3",
      flag: "🇯🇵",
      nationality: "Japanese",
      country: "Japan",
      countryAlts: ["japan"],
      model: "It's Japanese. / It's from Japan.",
    },
    {
      n: 3,
      brand: "SEAT",
      img: "https://cdn.imgurl.ir/uploads/r41222_SEAT_Spanish.png",
      audio: "audio/SEAT Spanish.mp3",
      flag: "🇪🇸",
      nationality: "Spanish",
      country: "Spain",
      countryAlts: ["spain"],
      model: "It's Spanish. / It's from Spain.",
    },
    {
      n: 4,
      brand: "Geely",
      img: "https://cdn.imgurl.ir/uploads/82134_Geely_Chinese.png",
      audio: "audio/Geely Chinese.mp3",
      flag: "🇨🇳",
      nationality: "Chinese",
      country: "China",
      countryAlts: ["china"],
      model: "It's Chinese. / It's from China.",
    },
    {
      n: 5,
      brand: "Hyundai",
      img: "https://cdn.imgurl.ir/uploads/y43283_Hyundai_Korean.png",
      audio: "audio/Hyundai Korean.mp3",
      flag: "🇰🇷",
      nationality: "Korean",
      country: "Korea",
      countryAlts: ["korea", "south korea", "the republic of korea"],
      model: "It's Korean. / It's from Korea.",
    },
    {
      n: 6,
      brand: "Jaguar",
      img: "https://cdn.imgurl.ir/uploads/a56301_Jaguar_British.png",
      audio: "audio/Jaguar British.mp3",
      flag: "🇬🇧",
      nationality: "British",
      country: "Britain",
      countryAlts: ["britain", "the uk", "uk", "england", "the united kingdom", "united kingdom", "great britain"],
      model: "It's British. / It's from Britain.",
    },
  ];

  let index = 0;
  let score = 0;
  let locked = false;
  let currentAudio = null;

  const $ = (id) => document.getElementById(id);
  const sceneImg = $("sceneImg");
  const flagBadge = $("flagBadge");
  const answerInput = $("answerInput");
  const checkBtn = $("checkBtn");
  const skipBtn = $("skipBtn");
  const continueBtn = $("continueBtn");
  const replayBtn = $("replayBtn");
  const feedback = $("feedback");
  const modelAnswer = $("modelAnswer");
  const actionRow = $("actionRow");
  const afterRow = $("afterRow");
  const qProgress = $("qProgress");
  const scoreText = $("scoreText");
  const qNum = $("qNum");
  const endOverlay = $("endOverlay");

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(src) {
    stopAudio();
    try {
      currentAudio = new Audio(src);
      currentAudio.play().catch(function () {});
    } catch (_) {}
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCorrect(raw, item) {
    const t = normalize(raw);
    if (!t) return false;

    // Must start with "it's" (or "it is")
    const startsOk =
      t.indexOf("it's ") === 0 ||
      t.indexOf("it is ") === 0;
    if (!startsOk) return false;

    const rest = t
      .replace(/^it'?s\s+/, "")
      .replace(/^it is\s+/, "")
      .trim();

    // Nationality form: "American" / "Japanese" …
    if (rest === normalize(item.nationality)) return true;

    // "from + country"
    if (rest.indexOf("from ") === 0) {
      const place = rest.slice(5).trim();
      if (place === normalize(item.country)) return true;
      if (item.countryAlts && item.countryAlts.indexOf(place) !== -1) return true;
    }

    return false;
  }

  function render() {
    locked = false;
    stopAudio();
    feedback.hidden = true;
    modelAnswer.hidden = true;
    actionRow.hidden = false;
    afterRow.hidden = true;
    checkBtn.disabled = true;
    answerInput.disabled = false;
    answerInput.value = "";
    answerInput.classList.remove("ok", "bad");

    const item = ITEMS[index];
    qProgress.textContent = item.n + "/" + ITEMS.length;
    qNum.textContent = item.n;
    scoreText.textContent = String(score);

    sceneImg.src = item.img;
    sceneImg.alt = item.brand + " car";
    flagBadge.textContent = item.flag;

    setTimeout(function () {
      answerInput.focus();
    }, 80);
  }

  function showResult(ok, skipped) {
    locked = true;
    const item = ITEMS[index];
    answerInput.disabled = true;
    actionRow.hidden = true;
    afterRow.hidden = false;
    continueBtn.textContent =
      index >= ITEMS.length - 1 ? "See results →" : "Continue →";

    modelAnswer.hidden = false;
    modelAnswer.innerHTML =
      '<span class="model-label">Model answer</span>' +
      '<span class="model-text">' +
      item.model +
      "</span>";

    if (skipped) {
      feedback.hidden = false;
      feedback.className = "feedback skipped";
      feedback.textContent = "Skipped — listen and remember.";
      answerInput.classList.add("bad");
    } else if (ok) { try{sfxCorrect();}catch(e){}
      score++;
      scoreText.textContent = String(score);
      feedback.hidden = false;
      feedback.className = "feedback success";
      feedback.textContent = "Correct! ✓"; try{sfxCorrect();}catch(e){}
      answerInput.classList.add("ok");
    } else {
      feedback.hidden = false;
      feedback.className = "feedback error";
      feedback.textContent = "Not quite — check the model answer.";
      answerInput.classList.add("bad");
    }

    // Play the audio after answer or skip
    playAudio(item.audio);
  }

  function check() {
    if (locked) return;
    const raw = answerInput.value;
    if (!raw.trim()) return;
    const ok = isCorrect(raw, ITEMS[index]);
    showResult(ok, false);
  }

  function skip() {
    if (locked) return;
    showResult(false, true);
  }

  function next() {
    stopAudio();
    if (index >= ITEMS.length - 1) {
      finish();
      return;
    }
    index++;
    render();
  }

  function finish() {
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: ITEMS.length,
          timeMs: timeMs,
          onAgain: () => reset(),
          onModes: () => { location.href = '../'; },
          backHref: "../"
        });
        return;
      } catch (e) { console.warn("LAFinish", e); }
    }

    stopAudio();
    const total = ITEMS.length;
    const acc = Math.round((score / total) * 100);
    $("endTitle").textContent =
      acc === 100 ? "Perfect!" : acc >= 70 ? "Well done!" : "Good practice!";
    $("endMsg").textContent =
      "Score: " + score + " / " + total + " (" + acc + "%)";
    $("endEmoji").textContent = acc === 100 ? "🏆" : acc >= 70 ? "🎉" : "💪";
    try {
      if (typeof window.laStars === "function") {
        window.laStars(GAME_ID, score, total);
      } else if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
      }
    } catch (e) {}
    endOverlay.hidden = false;
  }

  function reset() {
    if (window.LAFinish) LAFinish.startTimer();
    index = 0;
    score = 0;
    endOverlay.hidden = true;
    render();
  }

  answerInput.addEventListener("input", function () {
    checkBtn.disabled = !answerInput.value.trim() || locked;
  });

  answerInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (locked && !afterRow.hidden) next();
      else if (!checkBtn.disabled) check();
    }
  });

  checkBtn.addEventListener("click", check);
  skipBtn.addEventListener("click", skip);
  continueBtn.addEventListener("click", next);
  replayBtn.addEventListener("click", function () {
    playAudio(ITEMS[index].audio);
  });
  $("againBtn").addEventListener("click", reset);

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      if (history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  }

  render();
})();
