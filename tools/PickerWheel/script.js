/* ========================================
   Picker Wheel — editable spinning wheel
   + rename items + Web Audio sounds
======================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "mrsheyhaki-picker-wheel-items";
  var SOUND_KEY = "mrsheyhaki-picker-wheel-sound";

  var COLORS = [
    "#7c3aed", "#0891b2", "#db2777", "#ea580c",
    "#16a34a", "#2563eb", "#c026d3", "#dc2626",
    "#0d9488", "#ca8a04", "#4f46e5", "#e11d48"
  ];

  var canvas = document.getElementById("wheelCanvas");
  var ctx = canvas.getContext("2d");
  var spinBtn = document.getElementById("spinBtn");
  var addForm = document.getElementById("addForm");
  var itemInput = document.getElementById("itemInput");
  var itemList = document.getElementById("itemList");
  var itemCountEl = document.getElementById("itemCount");
  var resultBanner = document.getElementById("resultBanner");
  var resultValue = document.getElementById("resultValue");
  var shuffleBtn = document.getElementById("shuffleBtn");
  var clearBtn = document.getElementById("clearBtn");
  var soundToggle = document.getElementById("soundToggle");

  var items = [];
  var rotation = 0;
  var isSpinning = false;
  var soundOn = true;
  var audioCtx = null;

  // ---- Sound ----
  function getAudioCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {
        return null;
      }
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playTick(intensity) {
    if (!soundOn) return;
    var actx = getAudioCtx();
    if (!actx) return;
    var t = actx.currentTime;
    var osc = actx.createOscillator();
    var gain = actx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800 + intensity * 400, t);
    gain.gain.setValueAtTime(0.08 + intensity * 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  function playWin() {
    if (!soundOn) return;
    var actx = getAudioCtx();
    if (!actx) return;
    var t = actx.currentTime;
    [523.25, 659.25, 783.99].forEach(function (freq, i) {
      var osc = actx.createOscillator();
      var gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.18, t + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.45);
    });
  }

  function playSpinStart() {
    if (!soundOn) return;
    var actx = getAudioCtx();
    if (!actx) return;
    var t = actx.currentTime;
    var osc = actx.createOscillator();
    var gain = actx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  try {
    if (localStorage.getItem(SOUND_KEY) === "off") soundOn = false;
  } catch (_) {}
  if (soundToggle) {
    soundToggle.checked = soundOn;
    soundToggle.addEventListener("change", function () {
      soundOn = soundToggle.checked;
      try {
        localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
      } catch (_) {}
      if (soundOn) getAudioCtx();
    });
  }

  // ---- Persistence ----
  function loadItems() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          items = parsed.filter(function (s) {
            return typeof s === "string" && s.trim();
          });
          return;
        }
      }
    } catch (_) {}
    items = ["Student 1", "Student 2", "Student 3", "Student 4", "Teacher"];
  }

  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }

  // ---- Draw ----
  function drawWheel() {
    var size = canvas.width;
    var cx = size / 2;
    var cy = size / 2;
    var radius = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);

    if (items.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#e2e8f0";
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "600 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add items →", cx, cy);
      return;
    }

    var slice = (Math.PI * 2) / items.length;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    for (var i = 0; i < items.length; i++) {
      var start = i * slice - Math.PI / 2;
      var end = start + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(start) * radius, Math.sin(start) * radius);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      var mid = start + slice / 2;
      var labelR = radius * 0.62;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(labelR, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#fff";
      ctx.font =
        "700 " +
        Math.max(11, Math.min(16, 90 / items.length)) +
        "px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var label = items[i];
      if (label.length > 14) label = label.slice(0, 12) + "…";
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#a78bfa";
    ctx.fill();

    ctx.restore();
  }

  // ---- Spin ----
  function spin() {
    if (isSpinning || items.length < 1) return;

    isSpinning = true;
    spinBtn.disabled = true;
    resultBanner.hidden = true;

    getAudioCtx();
    playSpinStart();

    var turns = 4 + Math.random() * 3;
    var extra = Math.random() * Math.PI * 2;
    var targetRotation = rotation + turns * Math.PI * 2 + extra;
    var duration = 4200 + Math.random() * 800;
    var start = performance.now();
    var startRot = rotation;
    var lastTickSlice = -1;
    var sliceAngle = (Math.PI * 2) / items.length;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = easeOutCubic(t);
      rotation = startRot + (targetRotation - startRot) * eased;
      drawWheel();

      var currentSlice = Math.floor(
        (((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / sliceAngle
      );
      if (currentSlice !== lastTickSlice) {
        lastTickSlice = currentSlice;
        playTick(t > 0.7 ? 0.5 + (t - 0.7) * 1.5 : 0.3);
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = targetRotation;
        drawWheel();
        isSpinning = false;
        spinBtn.disabled = false;
        showWinner();
        playWin();
      }
    }

    requestAnimationFrame(frame);
  }

  function showWinner() {
    if (items.length === 0) return;
    var slice = (Math.PI * 2) / items.length;
    var norm = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    var index = Math.floor(((Math.PI * 2) - norm) / slice) % items.length;
    if (index < 0) index += items.length;
    resultValue.textContent = items[index];
    resultBanner.hidden = false;
  }

  // ---- Rename ----
  function startRename(index, textEl) {
    var li = textEl.parentElement;
    var input = document.createElement("input");
    input.type = "text";
    input.className = "item-edit-input";
    input.value = items[index];
    input.maxLength = 40;
    input.setAttribute("aria-label", "Rename item");

    function commit() {
      var val = input.value.trim();
      if (val && val !== items[index]) {
        items[index] = val;
        saveItems();
        drawWheel();
        resultBanner.hidden = true;
      }
      renderList();
    }

    function cancel() {
      renderList();
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    });
    input.addEventListener("blur", commit);

    textEl.replaceWith(input);
    input.focus();
    input.select();
  }

  // ---- List UI ----
  function renderList() {
    itemList.innerHTML = "";
    items.forEach(function (text, i) {
      var li = document.createElement("li");

      var swatch = document.createElement("span");
      swatch.className = "item-swatch";
      swatch.style.background = COLORS[i % COLORS.length];

      var span = document.createElement("span");
      span.className = "item-text";
      span.textContent = text;
      span.title = "Click to rename";
      span.setAttribute("role", "button");
      span.setAttribute("tabindex", "0");
      span.addEventListener("click", function () {
        startRename(i, span);
      });
      span.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startRename(i, span);
        }
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "item-remove";
      remove.setAttribute("aria-label", "Remove " + text);
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        items.splice(i, 1);
        saveItems();
        renderList();
        drawWheel();
        resultBanner.hidden = true;
      });

      li.append(swatch, span, remove);
      itemList.appendChild(li);
    });
    itemCountEl.textContent = items.length;
    spinBtn.disabled = items.length < 1 || isSpinning;
  }

  // ---- Events ----
  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = itemInput.value.trim();
    if (!val) return;
    if (items.length >= 40) {
      alert("Maximum 40 items on the wheel.");
      return;
    }
    items.push(val);
    itemInput.value = "";
    saveItems();
    renderList();
    drawWheel();
    resultBanner.hidden = true;
    itemInput.focus();
  });

  spinBtn.addEventListener("click", spin);

  shuffleBtn.addEventListener("click", function () {
    if (items.length < 2) return;
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    saveItems();
    renderList();
    drawWheel();
    resultBanner.hidden = true;
  });

  clearBtn.addEventListener("click", function () {
    if (items.length === 0) return;
    if (!confirm("Clear all items from the wheel?")) return;
    items = [];
    saveItems();
    renderList();
    drawWheel();
    resultBanner.hidden = true;
  });

  function setupCanvas() {
    var max = Math.min(400, window.innerWidth - 48);
    canvas.style.width = max + "px";
    canvas.style.height = max + "px";
    canvas.width = max;
    canvas.height = max;
    drawWheel();
  }

  loadItems();
  setupCanvas();
  renderList();

  window.addEventListener("resize", function () {
    if (!isSpinning) setupCanvas();
  });
})();
