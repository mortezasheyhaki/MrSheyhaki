/* The Perfect Car — AEF Starter Unit 4B
   Listen → write which car is perfect in the woman’s opinion
   and in her son’s opinion.
*/
(function () {
  "use strict";

  const GAME_ID = "starter-4b-perfect-car";

  // Accepted answers (normalized)
  const ANSWERS = {
    woman: {
      exact: ["the red car", "red car", "the red one", "red", "the sports car", "sports car", "the red sports car"],
      model: "the red car",
    },
    son: {
      exact: ["the blue car", "blue car", "the blue one", "blue", "the electric car", "electric car", "the small car", "small car"],
      model: "the blue car",
    },
  };

  let locked = false;
  let audioEl = null;

  // ---------- sound effects (Web Audio API) ----------
  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, duration, type, volume) {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume || 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playSuccess() {
    playTone(523.25, 0.12, "sine", 0.16);
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.16), 90);
    setTimeout(() => playTone(783.99, 0.22, "sine", 0.18), 180);
  }

  function playPartial() {
    playTone(440, 0.12, "sine", 0.14);
    setTimeout(() => playTone(554.37, 0.18, "sine", 0.14), 110);
  }

  function playError() {
    playTone(180, 0.18, "triangle", 0.12);
    setTimeout(() => playTone(140, 0.22, "triangle", 0.1), 120);
  }

  const $ = (id) => document.getElementById(id);
  const womanInput = $("womanInput");
  const sonInput = $("sonInput");
  const womanFeedback = $("womanFeedback");
  const sonFeedback = $("sonFeedback");
  const checkBtn = $("checkBtn");
  const actionRow = $("actionRow");
  const afterRow = $("afterRow");
  const playBtn = $("playBtn");
  const playIco = $("playIco");
  const playLabel = $("playLabel");
  const audio = $("audio");
  const scoreText = $("scoreText");
  const endOverlay = $("endOverlay");
  const endEmoji = $("endEmoji");
  const endTitle = $("endTitle");
  const endMsg = $("endMsg");
  const againBtn = $("againBtn");
  const restartBtn = $("restartBtn");
  const replayBtn = $("replayBtn");

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ");
  }

  function isCorrect(user, key) {
    const n = normalize(user);
    if (!n) return false;
    return ANSWERS[key].exact.some((a) => n === a || n === "it's " + a || n === "it is " + a);
  }

  function updateCheckState() {
    if (locked) return;
    const bothFilled = womanInput.value.trim().length > 0 && sonInput.value.trim().length > 0;
    checkBtn.disabled = !bothFilled;
  }

  function setPlaying(playing) {
    if (playing) {
      playBtn.classList.add("playing");
      playIco.textContent = "⏸";
      playLabel.textContent = "Pause";
    } else {
      playBtn.classList.remove("playing");
      playIco.textContent = "▶";
      playLabel.textContent = "Listen";
    }
  }

  function stopAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
  }

  function playAudio() {
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.play().then(() => setPlaying(true)).catch(() => {
      // Autoplay blocked or load error – still show play state briefly
      setPlaying(false);
    });
  }

  function showFieldFeedback(el, ok, model) {
    el.hidden = false;
    el.className = "field-feedback " + (ok ? "ok" : "bad");
    el.textContent = ok ? "✓ Correct" : "✗ " + model;
  }

  function checkAnswers() {
    if (locked) return;
    locked = true;

    const wOk = isCorrect(womanInput.value, "woman");
    const sOk = isCorrect(sonInput.value, "son");
    const score = (wOk ? 1 : 0) + (sOk ? 1 : 0);

    womanInput.disabled = true;
    sonInput.disabled = true;
    womanInput.classList.add(wOk ? "correct" : "wrong");
    sonInput.classList.add(sOk ? "correct" : "wrong");

    showFieldFeedback(womanFeedback, wOk, ANSWERS.woman.model);
    showFieldFeedback(sonFeedback, sOk, ANSWERS.son.model);

    scoreText.textContent = score + "/2";
    actionRow.hidden = true;
    afterRow.hidden = false;

    // Sound effects
    if (score === 2) playSuccess();
    else if (score === 1) playPartial();
    else playError();

    // stars / end screen
    try {
      if (typeof window.laStars === "function") {
        window.laStars(GAME_ID, score, 2);
      } else if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, (score / 2) * 100);
      }
    } catch (e) {}
    if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: 2,
          timeMs: timeMs,
          onAgain: () => reset(),
          onModes: () => { location.href = "../"; },
          backHref: "../"
        });
      } catch (e) { console.warn("LAFinish", e); }
    }

    if (score === 2) {
      setTimeout(() => {
        endEmoji.textContent = "🎉";
        endTitle.textContent = "Perfect!";
        endMsg.textContent = "You got both answers right. The woman loves the red sports car. Her son thinks the blue car is perfect for her.";
        endOverlay.hidden = false;
      }, 700);
    } else if (score === 1) {
      setTimeout(() => {
        endEmoji.textContent = "👍";
        endTitle.textContent = "Almost!";
        endMsg.textContent = "One answer is correct. Listen again and try the other one.";
        endOverlay.hidden = false;
      }, 700);
    } else {
      setTimeout(() => {
        endEmoji.textContent = "🎧";
        endTitle.textContent = "Try again";
        endMsg.textContent = "Listen carefully. The woman prefers the red car. Her son prefers the blue car for her.";
        endOverlay.hidden = false;
      }, 700);
    }
  }

  function reset() {
    if (window.LAFinish) LAFinish.startTimer();
    locked = false;
    stopAudio();
    womanInput.value = "";
    sonInput.value = "";
    womanInput.disabled = false;
    sonInput.disabled = false;
    womanInput.classList.remove("correct", "wrong");
    sonInput.classList.remove("correct", "wrong");
    womanFeedback.hidden = true;
    sonFeedback.hidden = true;
    womanFeedback.textContent = "";
    sonFeedback.textContent = "";
    scoreText.textContent = "0/2";
    actionRow.hidden = false;
    afterRow.hidden = true;
    checkBtn.disabled = true;
    endOverlay.hidden = true;
    womanInput.focus();
  }

  // Events
  womanInput.addEventListener("input", updateCheckState);
  sonInput.addEventListener("input", updateCheckState);

  womanInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!locked) sonInput.focus();
    }
  });
  sonInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!locked && !checkBtn.disabled) checkAnswers();
    }
  });

  checkBtn.addEventListener("click", checkAnswers);
  playBtn.addEventListener("click", playAudio);
  replayBtn.addEventListener("click", () => {
    stopAudio();
    playAudio();
  });
  againBtn.addEventListener("click", reset);
  restartBtn.addEventListener("click", reset);

  audio.addEventListener("ended", () => setPlaying(false));
  audio.addEventListener("pause", () => {
    if (audio.currentTime === 0 || audio.ended) setPlaying(false);
  });

  // Initial focus
  setTimeout(() => womanInput.focus(), 300);
})();
