/**
 * Editable Countdown Timer
 * Mr. Sheyhaki — Classroom Tool
 */

(function () {
  "use strict";

  // ---------- State ----------
  let totalSeconds = 0;
  let remainingSeconds = 0;
  let timerInterval = null;
  let isRunning = false;

  // ---------- Elements ----------
  const display = document.getElementById("display");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");
  const secondsInput = document.getElementById("seconds");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const statusEl = document.getElementById("status");
  const progressBar = document.getElementById("progressBar");
  const presetBtns = document.querySelectorAll(".preset-btn");
  const yearEl = document.getElementById("year");

  // ---------- Year ----------
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Audio (Web Audio API — no external file) ----------
  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      // Three short beeps
      [0, 0.35, 0.7].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(i === 2 ? 1046 : 880, now + offset); // higher last beep

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.28, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.28);

        osc.start(now + offset);
        osc.stop(now + offset + 0.3);
      });
    } catch (e) {
      // Audio not available — silent fail
      console.warn("Audio playback not available:", e);
    }
  }

  // ---------- Helpers ----------
  function formatTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return (
      String(h).padStart(2, "0") +
      ":" +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function getInputSeconds() {
    const h = clamp(parseInt(hoursInput.value, 10) || 0, 0, 99);
    const m = clamp(parseInt(minutesInput.value, 10) || 0, 0, 59);
    const s = clamp(parseInt(secondsInput.value, 10) || 0, 0, 59);
    // Keep inputs clean
    hoursInput.value = h;
    minutesInput.value = m;
    secondsInput.value = s;
    return h * 3600 + m * 60 + s;
  }

  function updateDisplay() {
    display.textContent = formatTime(remainingSeconds);
  }

  function updateProgress() {
    if (totalSeconds <= 0) {
      progressBar.style.transform = "scaleX(0)";
      return;
    }
    const ratio = remainingSeconds / totalSeconds;
    progressBar.style.transform = "scaleX(" + Math.max(0, ratio) + ")";
  }

  function setInputsEnabled(enabled) {
    hoursInput.disabled = !enabled;
    minutesInput.disabled = !enabled;
    secondsInput.disabled = !enabled;
    presetBtns.forEach(function (btn) {
      btn.disabled = !enabled;
    });
  }

  function setStatus(text, isFinished) {
    statusEl.textContent = text;
    statusEl.classList.toggle("finished", !!isFinished);
  }

  // ---------- Core timer ----------
  function startTimer() {
    if (isRunning) return;

    // Fresh start if finished or zero
    if (remainingSeconds <= 0) {
      totalSeconds = getInputSeconds();
      remainingSeconds = totalSeconds;
    }

    if (remainingSeconds <= 0) {
      setStatus("Please set a time greater than 0");
      return;
    }

    isRunning = true;
    setInputsEnabled(false);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    display.classList.remove("finished");
    progressBar.classList.remove("finished");
    setStatus("Running…");

    timerInterval = setInterval(function () {
      remainingSeconds -= 1;
      updateDisplay();
      updateProgress();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        timerFinished();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    setStatus("Paused");
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    remainingSeconds = 0;
    totalSeconds = 0;
    updateDisplay();
    updateProgress();
    setInputsEnabled(true);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    display.classList.remove("finished");
    progressBar.classList.remove("finished");
    setStatus("Set a time and press Start");
  }

  function timerFinished() {
    display.classList.add("finished");
    progressBar.classList.add("finished");
    progressBar.style.transform = "scaleX(0)";
    setStatus("⏰ Time is up!", true);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    setInputsEnabled(true);

    playAlarm();

    // Optional browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Timer finished!", {
          body: "Your countdown has reached zero.",
          silent: true,
        });
      } catch (e) {
        /* ignore */
      }
    }
  }

  // ---------- Presets ----------
  function applyPreset(seconds) {
    if (isRunning) return;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    hoursInput.value = h;
    minutesInput.value = m;
    secondsInput.value = s;
    remainingSeconds = seconds;
    totalSeconds = seconds;
    updateDisplay();
    updateProgress();
    setStatus("Ready — press Start");
  }

  // ---------- Events ----------
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  presetBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const secs = parseInt(btn.getAttribute("data-seconds"), 10);
      if (!isNaN(secs)) applyPreset(secs);
    });
  });

  // Live preview while typing (only when not running)
  [hoursInput, minutesInput, secondsInput].forEach(function (input) {
    input.addEventListener("input", function () {
      if (!isRunning) {
        remainingSeconds = getInputSeconds();
        totalSeconds = remainingSeconds;
        updateDisplay();
        updateProgress();
      }
    });
  });

  // Keyboard: Enter starts, Space pauses/resumes when focused on body
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input")) return;
    if (e.code === "Space") {
      e.preventDefault();
      if (isRunning) pauseTimer();
      else startTimer();
    }
  });

  // Request notification permission on first click
  document.body.addEventListener(
    "click",
    function () {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    },
    { once: true }
  );

  // ---------- Init ----------
  remainingSeconds = getInputSeconds();
  totalSeconds = remainingSeconds;
  updateDisplay();
  updateProgress();
})();
