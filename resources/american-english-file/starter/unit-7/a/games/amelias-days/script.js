/**
 * Amelia's Days — Mobile-first listening game
 * One activity at a time · sticky audio · waveform
 * Unit 7A | American English File Starter | Mr. Sheyhaki
 */
(function () {
  "use strict";

  const ACTIVITIES = [
    { id: 1, text: "Amelia and Ben usually go out for dinner or a movie.", answer: "Friday" },
    { id: 2, text: "They usually go to a nearby sushi restaurant.", answer: "Friday" },
    { id: 3, text: "Amelia gets up at 5:00 a.m.", answer: "Saturday" },
    { id: 4, text: "She works from 6:00 a.m. to 6:00 p.m.", answer: "Saturday" },
    { id: 5, text: "She goes to the supermarket to buy food for the week.", answer: "Saturday" },
    { id: 6, text: "Amelia and Ben usually stay at home.", answer: "Saturday" },
    { id: 7, text: "Amelia gets up at about 9:00 a.m.", answer: "Sunday" },
    { id: 8, text: "She has lunch with her sister and her family.", answer: "Sunday" },
    { id: 9, text: "Her sister's husband cooks meat on a grill.", answer: "Sunday" },
    { id: 10, text: "Amelia and her family do housework in the afternoon.", answer: "Sunday" },
    { id: 11, text: "She is tired in the evening.", answer: "Sunday" },
    { id: 12, text: "Amelia says this is her favorite part of the weekend.", answer: "Friday" }
  ];

  const DAYS = ["Friday", "Saturday", "Sunday"];
  const AUDIO_URL = "audio.mp3";
  const TOTAL = ACTIVITIES.length;

  // State
  let index = 0;
  let selections = {}; // id -> day
  let checked = false;
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let animId = null;
  let waveformData = null;

  // DOM
  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const replayBtn = document.getElementById("replayBtn");
  const seekBar = document.getElementById("seekBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const progressLine = document.getElementById("progressLine");
  const canvas = document.getElementById("waveform");
  const ctx = canvas.getContext("2d");
  const progressText = document.getElementById("progressText");
  const cardNum = document.getElementById("cardNum");
  const cardText = document.getElementById("cardText");
  const dayChoices = document.getElementById("dayChoices");
  const cardResult = document.getElementById("cardResult");
  const currentCard = document.getElementById("currentCard");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const cardStage = document.getElementById("cardStage");
  const summary = document.getElementById("summary");
  const summaryList = document.getElementById("summaryList");
  const checkBtn = document.getElementById("checkBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedbackEl = document.getElementById("feedback");
  const successOverlay = document.getElementById("successOverlay");
  const finalScoreEl = document.getElementById("finalScore");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const heroCard = document.getElementById("heroCard");

  const audio = new Audio(AUDIO_URL);
  audio.preload = "auto";

  // ---------- Waveform ----------
  function setupCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(40 * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function generateIdleWaveform() {
    const bars = 48;
    waveformData = new Float32Array(bars);
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      waveformData[i] = 0.18 + 0.22 * Math.sin(t * Math.PI * 3.5) * Math.sin(t * Math.PI * 1.2) + 0.08 * Math.random();
    }
  }

  function drawWaveform(liveData) {
    const w = canvas.getBoundingClientRect().width;
    const h = 40;
    ctx.clearRect(0, 0, w, h);
    const bars = liveData ? liveData.length : (waveformData ? waveformData.length : 40);
    const gap = 2;
    const barW = (w - gap * (bars - 1)) / bars;
    const mid = h / 2;

    for (let i = 0; i < bars; i++) {
      const amp = liveData ? (liveData[i] / 255) * 0.9 : (waveformData ? waveformData[i] : 0.2);
      const barH = Math.max(2, amp * (h * 0.85));
      const x = i * (barW + gap);
      const y = mid - barH / 2;
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (audio.paused) {
        grad.addColorStop(0, "#c4b5fd");
        grad.addColorStop(1, "#a78bfa");
      } else {
        grad.addColorStop(0, "#8b5cf6");
        grad.addColorStop(1, "#6c5ce7");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = Math.min(2.5, barW / 2);
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, barH, r);
      } else {
        ctx.rect(x, y, barW, barH);
      }
      ctx.fill();
    }
  }

  function startVisualizer() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      sourceNode = audioCtx.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function tick() {
      animId = requestAnimationFrame(tick);
      analyser.getByteFrequencyData(dataArray);
      const bars = 40;
      const step = Math.floor(bufferLength / bars);
      const subset = new Uint8Array(bars);
      for (let i = 0; i < bars; i++) subset[i] = dataArray[i * step] || 0;
      drawWaveform(subset);
    }
    tick();
  }

  function stopVisualizer() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    drawWaveform(null);
  }

  // ---------- Audio ----------
  function formatTime(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function updateProgress() {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    seekBar.value = pct;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    progressLine.style.left = pct + "%";
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        playIcon.textContent = "❚❚";
        playBtn.classList.add("playing");
        startVisualizer();
      }).catch(() => {});
    } else {
      audio.pause();
      playIcon.textContent = "▶";
      playBtn.classList.remove("playing");
      stopVisualizer();
    }
  });

  replayBtn.addEventListener("click", () => {
    audio.currentTime = 0;
    if (audio.paused) playBtn.click();
  });

  seekBar.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime = (seekBar.value / 100) * audio.duration;
      updateProgress();
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", () => {
    playIcon.textContent = "▶";
    playBtn.classList.remove("playing");
    stopVisualizer();
  });

  // ---------- Card UI (one at a time) ----------
  function showCard(i) {
    index = i;
    const act = ACTIVITIES[i];
    progressText.textContent = (i + 1) + "/" + TOTAL;
    cardNum.textContent = "Activity " + (i + 1) + " of " + TOTAL;
    cardText.textContent = act.text;

    currentCard.classList.remove("correct", "wrong");
    cardResult.hidden = true;
    cardResult.textContent = "";

    // day buttons
    dayChoices.querySelectorAll(".day-btn").forEach((btn) => {
      const day = btn.dataset.day;
      btn.classList.toggle("selected", selections[act.id] === day);
      btn.disabled = checked;
    });

    prevBtn.disabled = i === 0;
    const hasAnswer = !!selections[act.id];
    nextBtn.disabled = !hasAnswer;
    nextBtn.textContent = i === TOTAL - 1 ? "Review →" : "Next →";

    // hide hero after first answer to save space on phone
    if (Object.keys(selections).length > 0) {
      heroCard.style.display = "none";
    }
  }

  dayChoices.addEventListener("click", (e) => {
    const btn = e.target.closest(".day-btn");
    if (!btn || checked) return;
    const day = btn.dataset.day;
    const act = ACTIVITIES[index];
    selections[act.id] = day;
    dayChoices.querySelectorAll(".day-btn").forEach((b) => {
      b.classList.toggle("selected", b.dataset.day === day);
    });
    nextBtn.disabled = false;
  });

  prevBtn.addEventListener("click", () => {
    if (index > 0) showCard(index - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (!selections[ACTIVITIES[index].id]) return;
    if (index < TOTAL - 1) {
      showCard(index + 1);
    } else {
      showSummary();
    }
  });

  function showSummary() {
    cardStage.hidden = true;
    summary.hidden = false;
    summaryList.innerHTML = "";
    ACTIVITIES.forEach((act) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML =
        '<span class="day-tag">' + (selections[act.id] || "—") + "</span>" +
        "<span>" + act.text + "</span>";
      summaryList.appendChild(item);
    });
    feedbackEl.hidden = true;
    checkBtn.disabled = false;
    checkBtn.textContent = "Check all answers";
    // scroll summary into view
    summary.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  checkBtn.addEventListener("click", () => {
    if (checked) return;
    checked = true;
    let correct = 0;
    const items = summaryList.querySelectorAll(".summary-item");
    ACTIVITIES.forEach((act, i) => {
      const chosen = selections[act.id];
      const item = items[i];
      if (chosen === act.answer) {
        item.classList.add("correct");
        correct++;
      } else {
        item.classList.add("wrong");
        const tag = item.querySelector(".day-tag");
        tag.textContent = (chosen || "—") + " → " + act.answer;
      }
    });

    feedbackEl.hidden = false;
    if (correct === TOTAL) {
      feedbackEl.className = "feedback good";
      feedbackEl.textContent = "Perfect! All " + TOTAL + " correct.";
      finalScoreEl.textContent = correct;
      setTimeout(() => { successOverlay.hidden = false; }, 500);
    } else {
      feedbackEl.className = "feedback partial";
      feedbackEl.textContent = "You got " + correct + " of " + TOTAL + " correct. Green = right, red = see the answer.";
    }
    checkBtn.disabled = true;
  });

  function resetAll() {
    selections = {};
    checked = false;
    index = 0;
    summary.hidden = true;
    cardStage.hidden = false;
    successOverlay.hidden = true;
    feedbackEl.hidden = true;
    heroCard.style.display = "";
    showCard(0);
  }

  resetBtn.addEventListener("click", resetAll);
  playAgainBtn.addEventListener("click", resetAll);

  // ---------- Init ----------
  function init() {
    setupCanvasSize();
    generateIdleWaveform();
    drawWaveform(null);
    showCard(0);
    window.addEventListener("resize", () => {
      setupCanvasSize();
      if (audio.paused) drawWaveform(null);
    });
  }

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
    };
  }

  init();
})();
