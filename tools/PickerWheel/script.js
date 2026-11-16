/**
 * Picker Wheel — TV-friendly classroom tool
 * Large labels, big result, used lockout, drag spin
 */
(function () {
  "use strict";

  var STORAGE_KEY = "picker-wheel-items-v2";
  var COLORS = [
    "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#06b6d4",
    "#a855f7", "#eab308", "#22c55e", "#e11d48", "#0ea5e9"
  ];

  var items = [];
  var rotation = 0;
  var isSpinning = false;
  var lastIndex = -1;
  var logicalSize = 500;

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
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
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
    try {
      var old = localStorage.getItem("picker-wheel-items");
      if (old) {
        var arr = JSON.parse(old);
        if (Array.isArray(arr)) {
          items = arr.map(function (s) { return { text: String(s), used: false }; });
          save();
        }
      }
    } catch (e2) {}
  }

  function activeItems() {
    return items.filter(function (it) { return !it.used; });
  }

  function updateEmptyClass() {
    var stage = document.querySelector(".stage");
    if (stage) stage.classList.toggle("is-empty", items.length < 1);
  }

  function updateUsedCount() {
    updateEmptyClass();
    var used = items.filter(function (x) { return x.used; }).length;
    var active = items.length - used;
    usedCountEl.textContent = used
      ? used + " used · " + active + " still available"
      : active + " available";
    spinBtn.disabled = isSpinning || active < 1;
    resetUsedBtn.disabled = used < 1;
  }

  function drawWheel() {
    var size = logicalSize;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    var cx = size / 2;
    var cy = size / 2;
    var radius = size / 2 - 4;
    var n = items.length;

    // Empty: plain circle only — no text (hub is CSS, hint is HTML)
    if (n < 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#e5e7eb";
      ctx.fill();
      return;
    }

    var arc = (Math.PI * 2) / n;
    var startBase = -Math.PI / 2 + (rotation * Math.PI) / 180;

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
      var ang = ((mid % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      var flip = ang > Math.PI / 2 || ang < -Math.PI / 2;
      if (flip) ctx.rotate(Math.PI);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var maxW = radius * 0.55;
      var fontPx = Math.min(44, Math.max(18, Math.floor(radius / (n > 24 ? 9 : n > 16 ? 7 : n > 10 ? 5.2 : 4))));
      ctx.font = "900 " + fontPx + "px Inter, system-ui, sans-serif";
      while (fontPx > 15 && ctx.measureText(label).width > maxW) {
        fontPx -= 1;
        ctx.font = "900 " + fontPx + "px Inter, system-ui, sans-serif";
      }
      ctx.fillStyle = used ? "rgba(255,255,255,0.45)" : "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      var textR = flip ? -(radius * 0.62) : radius * 0.62;
      ctx.fillText(label, textR, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(15,23,42,0.1)";
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function setupCanvas() {
    var wrap = document.querySelector(".wheel-wrap");
    var max = 500;
    if (wrap) {
      var r = wrap.getBoundingClientRect();
      max = Math.floor(Math.min(r.width || 500, r.height || 500));
    }
    if (!max || max < 200) max = Math.min(500, window.innerWidth - 48);
    max = Math.max(260, Math.min(max, 520));
    logicalSize = max;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = max + "px";
    canvas.style.height = max + "px";
    canvas.width = Math.round(max * dpr);
    canvas.height = Math.round(max * dpr);
    drawWheel();
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
        setupCanvas();
        updateUsedCount();
      });

      li.append(swatch, text, toggle, remove);
      itemList.appendChild(li);
    });
    itemCountEl.textContent = String(items.length);
    updateUsedCount();
  }

  function indexAtPointer() {
    var n = items.length;
    if (n < 1) return -1;
    var deg = ((rotation % 360) + 360) % 360;
    var slice = 360 / n;
    return Math.floor(((360 - deg) % 360) / slice) % n;
  }

  function pulseWheel(done) {
    var wrap = document.querySelector(".wheel-wrap");
    if (!wrap) { if (done) done(); return; }
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
    var colors = ["#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#f87171"];
    for (var i = 0; i < 48; i++) {
      var p = document.createElement("span");
      p.className = "confetti-piece";
      p.style.left = 40 + Math.random() * 20 + "%";
      p.style.top = 35 + Math.random() * 15 + "%";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", Math.random() * 360 - 180 + "px");
      p.style.setProperty("--dy", Math.random() * 280 + 80 + "px");
      p.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
      p.style.setProperty("--delay", Math.random() * 0.15 + "s");
      p.style.setProperty("--size", 6 + Math.random() * 8 + "px");
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

    var pick = active[Math.floor(Math.random() * active.length)];
    var targetIndex = items.indexOf(pick);
    var n = items.length;
    var slice = 360 / n;
    var targetDeg = (360 - (targetIndex + 0.5) * slice) % 360;
    var current = ((rotation % 360) + 360) % 360;
    var delta = (targetDeg - current + 360) % 360;
    var extraTurns = 5 + Math.floor(Math.random() * 3);
    var finalRotation = rotation + extraTurns * 360 + delta;
    var start = rotation;
    var change = finalRotation - start;
    var duration = 5600;
    var t0 = performance.now();

    function easeOutQuint(t) {
      return 1 - Math.pow(1 - t, 5);
    }

    function frame(now) {
      var p = Math.min(1, (now - t0) / duration);
      rotation = start + change * easeOutQuint(p);
      drawWheel();
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        rotation = finalRotation;
        drawWheel();
        isSpinning = false;
        lastIndex = targetIndex;
        pulseWheel(function () {
          showResult(items[targetIndex].text);
          updateUsedCount();
        });
      }
    }
    requestAnimationFrame(frame);
  }

  /* Drag spin */
  var drag = { active: false, lastAngle: 0, lastTime: 0, velocity: 0, moved: false };

  function pointerAngle(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    return (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI;
  }

  function onPointerDown(x, y) {
    if (isSpinning) return;
    drag.active = true;
    drag.moved = false;
    drag.lastAngle = pointerAngle(x, y);
    drag.lastTime = performance.now();
    drag.velocity = 0;
    canvas.style.cursor = "grabbing";
  }

  function onPointerMove(x, y) {
    if (!drag.active || isSpinning) return;
    var now = performance.now();
    var ang = pointerAngle(x, y);
    var delta = ang - drag.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (Math.abs(delta) > 0.4) drag.moved = true;
    rotation += delta;
    var dt = Math.max(1, now - drag.lastTime);
    var v = (delta / dt) * 2.8;
    drag.velocity = drag.velocity * 0.5 + v * 0.5;
    if (drag.velocity > 4.5) drag.velocity = 4.5;
    if (drag.velocity < -4.5) drag.velocity = -4.5;
    drag.lastAngle = ang;
    drag.lastTime = now;
    drawWheel();
  }

  function snapToPointerAndReveal() {
    var n = items.length;
    if (n < 1) {
      isSpinning = false;
      updateUsedCount();
      return;
    }
    var idx = indexAtPointer();
    if (items[idx] && items[idx].used) {
      var found = -1;
      for (var d = 1; d < n; d++) {
        var a = (idx + d) % n;
        var b = (idx - d + n) % n;
        if (!items[a].used) { found = a; break; }
        if (!items[b].used) { found = b; break; }
      }
      if (found >= 0) idx = found;
    }
    var slice = 360 / n;
    var targetDeg = (360 - (idx + 0.5) * slice) % 360;
    var current = ((rotation % 360) + 360) % 360;
    var delta = targetDeg - current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    var start = rotation;
    var t0 = performance.now();
    isSpinning = true;
    function snapFrame(now) {
      var p = Math.min(1, (now - t0) / 380);
      var e = 1 - Math.pow(1 - p, 3);
      rotation = start + delta * e;
      drawWheel();
      if (p < 1) {
        requestAnimationFrame(snapFrame);
      } else {
        rotation = start + delta;
        drawWheel();
        isSpinning = false;
        lastIndex = idx;
        if (items[idx] && !items[idx].used) {
          pulseWheel(function () {
            showResult(items[idx].text);
            updateUsedCount();
          });
        } else updateUsedCount();
      }
    }
    requestAnimationFrame(snapFrame);
  }

  function coastFromDrag() {
    drag.velocity *= 1.8;
    if (drag.velocity > 5) drag.velocity = 5;
    if (drag.velocity < -5) drag.velocity = -5;
    if (Math.abs(drag.velocity) < 0.03 || items.length < 1) {
      if (drag.moved) snapToPointerAndReveal();
      else { isSpinning = false; updateUsedCount(); }
      return;
    }
    isSpinning = true;
    spinBtn.disabled = true;
    hideResult();
    var last = performance.now();
    function coast(now) {
      var dt = Math.min(32, now - last);
      last = now;
      rotation += drag.velocity * dt;
      drag.velocity *= Math.pow(0.985, dt / 16);
      drawWheel();
      if (Math.abs(drag.velocity) > 0.015) requestAnimationFrame(coast);
      else snapToPointerAndReveal();
    }
    requestAnimationFrame(coast);
  }

  function onPointerUp() {
    if (!drag.active) return;
    drag.active = false;
    canvas.style.cursor = "grab";
    if (!isSpinning) coastFromDrag();
  }

  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none";
  canvas.addEventListener("mousedown", function (e) {
    e.preventDefault();
    onPointerDown(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", function (e) {
    if (drag.active) onPointerMove(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  canvas.addEventListener("touchmove", function (e) {
    if (!drag.active || e.touches.length !== 1) return;
    e.preventDefault();
    onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    onPointerUp();
  }, { passive: false });
  canvas.addEventListener("touchcancel", onPointerUp);

  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = itemInput.value.trim();
    if (!val) return;
    if (items.length >= 40) { alert("Maximum 40 items."); return; }
    items.push({ text: val, used: false });
    itemInput.value = "";
    save();
    renderList();
    setupCanvas();
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
      var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
    }
    save();
    renderList();
    setupCanvas();
  });
  clearBtn.addEventListener("click", function () {
    if (!items.length) return;
    if (!confirm("Clear all items?")) return;
    items = [];
    save();
    renderList();
    setupCanvas();
    hideResult();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hideResult();
  });

  load();
  renderList();
  requestAnimationFrame(function () {
    setupCanvas();
    updateEmptyClass();
  });
  window.addEventListener("resize", function () {
    if (!isSpinning) setupCanvas();
  });
})();
