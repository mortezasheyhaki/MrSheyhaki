/**
 * Picker Wheel — TV-friendly classroom tool
 * Large labels, big result overlay, used-items lockout
 */
(function () {
  "use strict";

  var STORAGE_KEY = "picker-wheel-items-v2";
  var COLORS = [
    "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#06b6d4",
    "#a855f7", "#eab308", "#22c55e", "#e11d48", "#0ea5e9"
  ];

  /** @type {{text:string, used:boolean}[]} */
  var items = [];
  var rotation = 0; // degrees
  var isSpinning = false;
  var lastIndex = -1;

  var canvas = document.getElementById("wheel");
  var ctx = canvas.getContext("2d");
  var spinBtn = document.getElementById("spinBtn");
  var markUsedBtn = document.getElementById("markUsedBtn");
  var resetUsedBtn = document.getElementById("resetUsedBtn");
  var itemList = document.getElementById("itemList");
  var itemCountEl = document.getElementById("itemCount");
  var usedCountEl = document.getElementById("usedCount");
  var addForm = document.getElementById("addForm");
  var itemInput = document.getElementById("itemInput");
  var shuffleBtn = document.getElementById("shuffleBtn");
  var clearBtn = document.getElementById("clearBtn");
  var resultOverlay = document.getElementById("resultOverlay");
  var resultWord = document.getElementById("resultWord");
  var overlayMarkBtn = document.getElementById("overlayMarkBtn");
  var overlayCloseBtn = document.getElementById("overlayCloseBtn");

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          items = parsed.map(function (x) {
            if (typeof x === "string") return { text: x, used: false };
            return { text: String(x.text || ""), used: !!x.used };
          }).filter(function (x) { return x.text; });
          return;
        }
      }
    } catch (e) {}
    // migrate v1 plain string list
    try {
      var old = localStorage.getItem("picker-wheel-items");
      if (old) {
        var arr = JSON.parse(old);
        if (Array.isArray(arr)) {
          items = arr.map(function (s) { return { text: String(s), used: false }; });
          save();
          return;
        }
      }
    } catch (e2) {}
    items = [];
  }

  function activeItems() {
    return items.filter(function (it) { return !it.used; });
  }

  function fitFont(text, maxWidth, maxPx, minPx) {
    var size = maxPx;
    ctx.font = "900 " + size + "px Inter, system-ui, sans-serif";
    while (size > minPx && ctx.measureText(text).width > maxWidth) {
      size -= 1;
      ctx.font = "900 " + size + "px Inter, system-ui, sans-serif";
    }
    return size;
  }

  function drawWheel() {
    var size = canvas.width;
    var cx = size / 2;
    var cy = size / 2;
    var radius = size / 2 - 6;
    ctx.clearRect(0, 0, size, size);

    var n = items.length;
    if (n < 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#e5e7eb";
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.font = "700 22px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add items →", cx, cy);
      return;
    }

    var arc = (Math.PI * 2) / n;
    // Pointer is at top (−90°). rotation is CSS degrees of the wheel.
    var startBase = (-Math.PI / 2) + (rotation * Math.PI / 180);

    for (var i = 0; i < n; i++) {
      var start = startBase + i * arc;
      var end = start + arc;
      var used = items[i].used;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = used ? "#9ca3af" : COLORS[i % COLORS.length];
      ctx.globalAlpha = used ? 0.45 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label
      var mid = start + arc / 2;
      var label = items[i].text;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      var maxW = radius * 0.62;
      var fontPx = fitFont(label, maxW, Math.min(42, Math.max(18, Math.floor(radius / (n > 20 ? 9 : n > 12 ? 7 : 5)))), 14);
      ctx.font = "900 " + fontPx + "px Inter, system-ui, sans-serif";
      ctx.fillStyle = used ? "rgba(255,255,255,0.55)" : "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 4;
      ctx.fillText(label, radius - 18, 0);
      ctx.restore();
    }

    // outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(15,23,42,0.12)";
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function updateUsedCount() {
    var used = items.filter(function (x) { return x.used; }).length;
    var active = items.length - used;
    usedCountEl.textContent = used
      ? used + " used · " + active + " still available"
      : active + " available";
    spinBtn.disabled = isSpinning || active < 1;
    resetUsedBtn.disabled = used < 1;
  }

  function renderList() {
    itemList.innerHTML = "";
    items.forEach(function (it, i) {
      var li = document.createElement("li");
      li.className = "item-row" + (it.used ? " is-used" : "");

      var swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = it.used ? "#9ca3af" : COLORS[i % COLORS.length];

      var text = document.createElement("span");
      text.className = "item-text";
      text.textContent = it.text;
      text.title = "Click to rename";
      text.addEventListener("click", function () {
        var next = prompt("Rename item", it.text);
        if (next == null) return;
        next = next.trim();
        if (!next) return;
        items[i].text = next;
        save();
        renderList();
        drawWheel();
      });

      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "item-toggle";
      toggle.textContent = it.used ? "Restore" : "Use";
      toggle.title = it.used ? "Make available again" : "Mark as used (won't be picked)";
      toggle.addEventListener("click", function () {
        items[i].used = !items[i].used;
        save();
        renderList();
        drawWheel();
        updateUsedCount();
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "item-remove";
      remove.setAttribute("aria-label", "Remove");
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        items.splice(i, 1);
        save();
        renderList();
        drawWheel();
        updateUsedCount();
      });

      li.append(swatch, text, toggle, remove);
      itemList.appendChild(li);
    });
    itemCountEl.textContent = String(items.length);
    updateUsedCount();
  }

  /** Index under the top pointer after current rotation */
  function indexAtPointer() {
    var n = items.length;
    if (n < 1) return -1;
    var deg = ((rotation % 360) + 360) % 360;
    // Segment 0 starts at top when rotation=0; pointer fixed at top.
    // As wheel rotates clockwise, pointer hits previous segments.
    var slice = 360 / n;
    var idx = Math.floor(((360 - deg) % 360) / slice) % n;
    return idx;
  }


  function pulseWheel(done) {
    var wrap = document.querySelector(".wheel-wrap");
    if (!wrap) {
      if (done) done();
      return;
    }
    wrap.classList.remove("is-settle");
    void wrap.offsetWidth;
    wrap.classList.add("is-settle");
    setTimeout(function () {
      wrap.classList.remove("is-settle");
      if (done) done();
    }, 420);
  }

  function burstConfetti() {
    var layer = document.getElementById("confettiLayer");
    if (!layer) return;
    layer.innerHTML = "";
    var colors = ["#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#f87171", "#c084fc"];
    var n = 48;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "confetti-piece";
      var x = 40 + Math.random() * 20;
      var y = 35 + Math.random() * 15;
      p.style.left = x + "%";
      p.style.top = y + "%";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", (Math.random() * 360 - 180) + "px");
      p.style.setProperty("--dy", (Math.random() * 280 + 80) + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      p.style.setProperty("--delay", (Math.random() * 0.15) + "s");
      p.style.setProperty("--size", (6 + Math.random() * 8) + "px");
      layer.appendChild(p);
    }
    setTimeout(function () { layer.innerHTML = ""; }, 1800);
  }

  function showResult(text) {
    resultWord.textContent = text;
    resultOverlay.hidden = false;
    resultOverlay.classList.remove("is-closing");
    resultOverlay.classList.add("is-open");
    markUsedBtn.disabled = false;
    // restart word pop animation
    resultWord.classList.remove("pop");
    void resultWord.offsetWidth;
    resultWord.classList.add("pop");
    burstConfetti();
  }

  function hideResult() {
    if (resultOverlay.hidden) return;
    resultOverlay.classList.add("is-closing");
    resultOverlay.classList.remove("is-open");
    setTimeout(function () {
      resultOverlay.hidden = true;
      resultOverlay.classList.remove("is-closing");
    }, 280);
  }

  function markLastUsed() {
    if (lastIndex < 0 || lastIndex >= items.length) return;
    items[lastIndex].used = true;
    save();
    renderList();
    drawWheel();
    updateUsedCount();
    hideResult();
    markUsedBtn.disabled = true;
  }

  function spin() {
    var active = activeItems();
    if (isSpinning || active.length < 1) return;
    isSpinning = true;
    spinBtn.disabled = true;
    hideResult();

    // Pick a random *active* item, then aim the wheel so it lands under the pointer
    var pick = active[Math.floor(Math.random() * active.length)];
    var targetIndex = items.indexOf(pick);
    var n = items.length;
    var slice = 360 / n;
    // Center of target segment at pointer: rotation such that
    // indexAtPointer() === targetIndex
    // index = floor(((360 - deg) % 360) / slice)
    // center of segment targetIndex: deg = 360 - (targetIndex + 0.5) * slice
    var targetDeg = (360 - (targetIndex + 0.5) * slice) % 360;
    var current = ((rotation % 360) + 360) % 360;
    var delta = (targetDeg - current + 360) % 360;
    var extraTurns = 5 + Math.floor(Math.random() * 3); // 5–7 full spins
    var finalRotation = rotation + extraTurns * 360 + delta;

    var start = rotation;
    var change = finalRotation - start;
    var duration = 5600;
    var t0 = performance.now();

    // Smooth ease: slow start → long coast → soft stop (TV-friendly)
    function easeOutQuint(t) {
      return 1 - Math.pow(1 - t, 5);
    }

    function frame(now) {
      var p = Math.min(1, (now - t0) / duration);
      var e = easeOutQuint(p);
      rotation = start + change * e;
      drawWheel();
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = finalRotation;
        drawWheel();
        isSpinning = false;
        lastIndex = targetIndex;
        // Soft settle pulse on the wheel, then reveal result
        pulseWheel(function () {
          showResult(items[targetIndex].text);
          updateUsedCount();
        });
      }
    }
    requestAnimationFrame(frame);
  }

  function setupCanvas() {
    // Large for TV / desktop
    var max = Math.min(560, Math.max(280, window.innerWidth - 40));
    if (window.innerWidth > 900) max = Math.min(620, window.innerHeight * 0.55);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = max + "px";
    canvas.style.height = max + "px";
    canvas.width = Math.round(max * dpr);
    canvas.height = Math.round(max * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // draw uses canvas.width which is now * dpr — fix by using CSS size
    // Override draw to use logical size
    canvas._logical = max;
    drawWheel = (function (orig) {
      // Redefine draw using logical size stored on canvas style
      return function () {
        var size = canvas._logical || max;
        // temporarily set transform and use size
        var realW = canvas.width;
        var realH = canvas.height;
        // draw into CSS pixel space
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var cx = size / 2;
        var cy = size / 2;
        var radius = size / 2 - 6;
        ctx.clearRect(0, 0, size, size);

        var n = items.length;
        if (n < 1) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = "#e5e7eb";
          ctx.fill();
          ctx.fillStyle = "#6b7280";
          ctx.font = "700 22px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Add items →", cx, cy);
          return;
        }

        var arc = (Math.PI * 2) / n;
        var startBase = (-Math.PI / 2) + (rotation * Math.PI / 180);

        for (var i = 0; i < n; i++) {
          var start = startBase + i * arc;
          var end = start + arc;
          var used = items[i].used;

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, start, end);
          ctx.closePath();
          ctx.fillStyle = used ? "#9ca3af" : COLORS[i % COLORS.length];
          ctx.globalAlpha = used ? 0.4 : 1;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 3;
          ctx.stroke();

          var mid = start + arc / 2;
          var label = items[i].text;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(mid);
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          var maxW = radius * 0.64;
          var fontPx = Math.min(48, Math.max(16, Math.floor(radius / (n > 24 ? 10 : n > 16 ? 7.5 : n > 10 ? 5.5 : 4.2))));
          ctx.font = "900 " + fontPx + "px Inter, system-ui, sans-serif";
          while (fontPx > 14 && ctx.measureText(label).width > maxW) {
            fontPx -= 1;
            ctx.font = "900 " + fontPx + "px Inter, system-ui, sans-serif";
          }
          ctx.fillStyle = used ? "rgba(255,255,255,0.5)" : "#ffffff";
          ctx.shadowColor = "rgba(0,0,0,0.28)";
          ctx.shadowBlur = 5;
          ctx.fillText(label, radius - 16, 0);
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(15,23,42,0.1)";
        ctx.lineWidth = 10;
        ctx.stroke();
      };
    })(drawWheel);
    drawWheel();
  }

  // Events
  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = itemInput.value.trim();
    if (!val) return;
    if (items.length >= 40) {
      alert("Maximum 40 items.");
      return;
    }
    items.push({ text: val, used: false });
    itemInput.value = "";
    save();
    renderList();
    drawWheel();
    itemInput.focus();
  });

  spinBtn.addEventListener("click", spin);
  markUsedBtn.addEventListener("click", markLastUsed);
  overlayMarkBtn.addEventListener("click", markLastUsed);
  overlayCloseBtn.addEventListener("click", hideResult);
  resultOverlay.addEventListener("click", function (e) {
    if (e.target === resultOverlay) hideResult();
  });

  resetUsedBtn.addEventListener("click", function () {
    items.forEach(function (it) { it.used = false; });
    save();
    renderList();
    drawWheel();
    updateUsedCount();
  });

  shuffleBtn.addEventListener("click", function () {
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    save();
    renderList();
    drawWheel();
  });

  clearBtn.addEventListener("click", function () {
    if (!items.length) return;
    if (!confirm("Clear all items?")) return;
    items = [];
    save();
    renderList();
    drawWheel();
    hideResult();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideResult();
    if ((e.key === "Enter" || e.key === " ") && e.target === document.body) {
      // don't steal from inputs
    }
  });

  load();
  setupCanvas();
  renderList();
  window.addEventListener("resize", function () {
    if (!isSpinning) setupCanvas();
  });
})();
