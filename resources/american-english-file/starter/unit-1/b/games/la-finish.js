/**
 * Learning Arcade — shared finish / results screen
 *
 * Usage:
 *   <script src="/learningarcade/la-stars.js" data-la-stars></script>
 *   <script src="/learningarcade/la-finish.js"></script>
 *
 *   // Optional: track time
 *   LAFinish.startTimer();
 *   // ... game runs ...
 *   const timeMs = LAFinish.stopTimer();
 *
 *   LAFinish.show({
 *     gameId: "starter-4a-match-rush",
 *     score: 80,
 *     total: 100,
 *     // accuracy: 80,        // optional if score+total given
 *     // stars: 3,            // optional — auto from accuracy
 *     timeMs: timeMs,         // optional
 *     onAgain: startGame,
 *     backHref: "../",
 *     // onBack: fn,          // optional instead of backHref
 *     // save: true,          // default true → LAStars.recordPlay + save
 *     // sound: true,         // default true
 *   });
 *
 *   LAFinish.hide();
 */
(function (global) {
  "use strict";

  var OVERLAY_ID = "la-finish-overlay";
  var STYLE_ID = "la-finish-styles";
  var timerStart = 0;
  var audioCtx = null;

  /* ---------- helpers ---------- */

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function starsFromAccuracy(acc) {
    acc = Number(acc) || 0;
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function titleFromStars(stars) {
    if (stars >= 3) return "Perfect!";
    if (stars >= 2) return "Well done!";
    if (stars >= 1) return "Good effort!";
    return "Keep practising!";
  }

  function emojiFromStars(stars) {
    if (stars >= 3) return "🏆";
    if (stars >= 2) return "🎉";
    if (stars >= 1) return "👍";
    return "💪";
  }

  /** Performance stickers (Mr. Sheyhaki expressions) */
  var STICKERS = {
    3: "https://cdn.imgurl.ir/uploads/c48901_cheering.png",  // cheering — perfect
    2: "https://cdn.imgurl.ir/uploads/q3592_clapping.png",   // clapping — well done
    1: "https://cdn.imgurl.ir/uploads/s424180_proud.png",    // proud — good effort
    0: "https://cdn.imgurl.ir/uploads/q765018_thinking1.png" // thinking — keep practising
  };

  function stickerFromStars(stars) {
    stars = Math.max(0, Math.min(3, Number(stars) || 0));
    return STICKERS[stars] || STICKERS[0];
  }

  function formatTime(ms) {
    ms = Math.max(0, Number(ms) || 0);
    var totalSec = Math.floor(ms / 1000);
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    if (m > 0) return m + ":" + (s < 10 ? "0" : "") + s;
    return s + "s";
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = document.createElement("style");
    css.id = STYLE_ID;
    css.textContent = [
      /* Overlay */
      "#" + OVERLAY_ID + "{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,17,23,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity .35s ease;font-family:Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Arial,sans-serif}",
      "#" + OVERLAY_ID + ".is-visible{opacity:1}",
      "#" + OVERLAY_ID + "[hidden]{display:none!important}",

      /* Card */
      ".la-finish-card{position:relative;width:100%;max-width:340px;background:#fff;color:#1e1b4b;border-radius:24px;padding:28px 24px 22px;box-shadow:0 20px 50px rgba(0,0,0,.25);text-align:center;transform:translateY(24px) scale(.94);opacity:0;transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .35s ease;overflow:hidden}",
      "#" + OVERLAY_ID + ".is-visible .la-finish-card{transform:translateY(0) scale(1);opacity:1}",
      "html[data-theme=dark] .la-finish-card{background:#181b24;color:#f4f6fb;box-shadow:0 20px 50px rgba(0,0,0,.5)}",

      /* Confetti canvas */
      ".la-finish-confetti{position:absolute;inset:0;pointer-events:none;z-index:0}",

      /* Content above confetti */
      ".la-finish-inner{position:relative;z-index:1}",

      /* Hero emoji */
      ".la-finish-emoji{font-size:3rem;line-height:1;margin-bottom:8px;display:inline-block;animation:la-finish-pop .55s cubic-bezier(.22,1,.36,1) both}",
      ".la-finish-sticker{width:112px;height:112px;object-fit:contain;margin:0 auto 10px;display:block;animation:la-finish-pop .55s cubic-bezier(.22,1,.36,1) both;filter:drop-shadow(0 8px 16px rgba(0,0,0,.12))}",
      "html[data-theme=dark] .la-finish-sticker{filter:drop-shadow(0 8px 16px rgba(0,0,0,.35))}",
      "@keyframes la-finish-pop{0%{transform:scale(0) rotate(-12deg);opacity:0}60%{transform:scale(1.15) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}",

      /* Title */
      ".la-finish-title{font-size:1.55rem;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em}",

      /* Stars */
      ".la-finish-stars{display:flex;justify-content:center;gap:8px;margin:12px 0 16px;min-height:36px}",
      ".la-finish-star{font-size:1.85rem;line-height:1;color:#d1d5db;transform:scale(0);opacity:0;transition:color .25s}",
      ".la-finish-star.is-on{color:#fbbf24;text-shadow:0 0 12px rgba(251,191,36,.55)}",
      ".la-finish-star.is-pop{animation:la-star-pop .5s cubic-bezier(.22,1,.36,1) forwards}",
      "@keyframes la-star-pop{0%{transform:scale(0) rotate(-30deg);opacity:0}60%{transform:scale(1.25) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}",
      "html[data-theme=dark] .la-finish-star{color:#374151}",
      "html[data-theme=dark] .la-finish-star.is-on{color:#fbbf24}",

      /* Progress ring */
      ".la-finish-ring-wrap{position:relative;width:110px;height:110px;margin:0 auto 14px}",
      ".la-finish-ring{transform:rotate(-90deg)}",
      ".la-finish-ring-bg{fill:none;stroke:#e8e4f5;stroke-width:8}",
      ".la-finish-ring-fg{fill:none;stroke:#7c6cf0;stroke-width:8;stroke-linecap:round;stroke-dasharray:283;stroke-dashoffset:283;transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)}",
      "html[data-theme=dark] .la-finish-ring-bg{stroke:#2b3040}",
      "html[data-theme=dark] .la-finish-ring-fg{stroke:#a78bfa}",
      ".la-finish-ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}",
      ".la-finish-pct{font-size:1.45rem;font-weight:800;line-height:1;color:#1e1b4b}",
      ".la-finish-pct-sub{font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7c7a9a;margin-top:2px}",
      "html[data-theme=dark] .la-finish-pct{color:#f4f6fb}",
      "html[data-theme=dark] .la-finish-pct-sub{color:#aeb6c8}",

      /* Stats row */
      ".la-finish-stats{display:flex;justify-content:center;gap:10px;margin:0 0 18px;flex-wrap:wrap}",
      ".la-finish-stat{background:#f5f3ff;border:1px solid #e8e4f5;border-radius:14px;padding:10px 14px;min-width:88px}",
      "html[data-theme=dark] .la-finish-stat{background:#1a1d27;border-color:#2b3040}",
      ".la-finish-stat-label{display:block;font-size:.62rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#7c7a9a;margin-bottom:2px}",
      "html[data-theme=dark] .la-finish-stat-label{color:#aeb6c8}",
      ".la-finish-stat-value{font-size:1.05rem;font-weight:800;color:#1e1b4b}",
      "html[data-theme=dark] .la-finish-stat-value{color:#f4f6fb}",

      /* Actions */
      ".la-finish-actions{display:flex;justify-content:center;gap:12px}",
      ".la-finish-btn{width:52px;height:52px;border-radius:14px;border:2px solid #e8e4f5;background:#fff;color:#1e1b4b;font-size:1.25rem;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;text-decoration:none;box-shadow:0 2px 8px rgba(99,80,200,.08);transition:transform .15s,border-color .15s,background .15s}",
      ".la-finish-btn:hover{border-color:#7c6cf0;transform:translateY(-1px)}",
      ".la-finish-btn:active{transform:scale(.96)}",
      "html[data-theme=dark] .la-finish-btn{background:#181b24;border-color:#2b3040;color:#f4f6fb;box-shadow:0 2px 8px rgba(0,0,0,.3)}",
      "html[data-theme=dark] .la-finish-btn:hover{border-color:#a78bfa}",
      ".la-finish-btn-primary{background:#7c6cf0;border-color:#7c6cf0;color:#fff;box-shadow:0 4px 14px rgba(124,108,240,.35)}",
      ".la-finish-btn-primary:hover{background:#6b5ce0;border-color:#6b5ce0}",
      "html[data-theme=dark] .la-finish-btn-primary{background:#7c6cf0;border-color:#7c6cf0;color:#fff}",
    ].join("\n");
    document.head.appendChild(css);
  }

  /* ---------- sound (Web Audio — no external files) ---------- */

  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (audioCtx.state === "suspended") {
      try { audioCtx.resume(); } catch (e) {}
    }
    return audioCtx;
  }

  /** Soft tone with optional filter for a less harsh “game UI” sound */
  function tone(freq, start, dur, type, gain, slideTo) {
    var ctx = getCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2800;
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) {
      osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.9);
    }
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.12), start + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }

  /** Short noise burst (for whoosh / sparkle) */
  function noiseBurst(start, dur, gain) {
    var ctx = getCtx();
    if (!ctx) return;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var g = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.06), start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  /** Overlay appears */
  function playWhoosh() {
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    noiseBurst(t, 0.22, 0.05);
    tone(220, t, 0.2, "sine", 0.04, 440);
  }

  /** Each star lights up */
  function playStarDing(i) {
    var ctx = getCtx();
    if (!ctx) return;
    var freqs = [659.25, 783.99, 1046.5]; // E5 G5 C6
    var t = ctx.currentTime;
    var f = freqs[i] || 659.25;
    tone(f, t, 0.16, "sine", 0.13);
    tone(f * 2, t, 0.12, "triangle", 0.05); // soft overtone
  }

  /** End fanfare — different energy by star count */
  function playFanfare(stars) {
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime + 0.03;

    if (stars >= 3) {
      // Bright victory: C–E–G–C + sparkle
      tone(523.25, t, 0.16, "triangle", 0.13);
      tone(659.25, t + 0.11, 0.16, "triangle", 0.13);
      tone(783.99, t + 0.22, 0.18, "triangle", 0.14);
      tone(1046.5, t + 0.36, 0.4, "sine", 0.12);
      tone(1318.5, t + 0.4, 0.28, "sine", 0.05);
      noiseBurst(t + 0.36, 0.25, 0.04);
    } else if (stars === 2) {
      tone(523.25, t, 0.15, "triangle", 0.11);
      tone(659.25, t + 0.13, 0.18, "triangle", 0.11);
      tone(783.99, t + 0.28, 0.32, "sine", 0.1);
    } else if (stars === 1) {
      tone(493.88, t, 0.16, "triangle", 0.09);      // B4
      tone(587.33, t + 0.15, 0.28, "sine", 0.09);   // D5
    } else {
      // Gentle, encouraging (not sad)
      tone(392.0, t, 0.2, "sine", 0.07);             // G4
      tone(493.88, t + 0.18, 0.3, "sine", 0.07);     // B4
    }
  }

  /* ---------- confetti ---------- */

  function runConfetti(canvas, intensity) {
    if (!canvas || intensity <= 0) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    var colors = ["#7c6cf0", "#fbbf24", "#34d399", "#f472b6", "#60a5fa", "#fb923c"];
    var count = intensity >= 3 ? 48 : intensity === 2 ? 28 : 14;
    var parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: w * 0.5 + (Math.random() - 0.5) * 40,
        y: h * 0.35,
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 6 - 2,
        g: 0.14 + Math.random() * 0.08,
        r: 3 + Math.random() * 4,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        life: 1,
      });
    }

    var start = performance.now();
    function frame(now) {
      var elapsed = now - start;
      if (elapsed > 2200) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      parts.forEach(function (p) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.012;
        if (p.life <= 0) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.4);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- timer helpers ---------- */

  function startTimer() {
    timerStart = performance.now();
    return timerStart;
  }

  function stopTimer() {
    if (!timerStart) return 0;
    var ms = performance.now() - timerStart;
    timerStart = 0;
    return ms;
  }

  function getElapsed() {
    if (!timerStart) return 0;
    return performance.now() - timerStart;
  }

  /* ---------- show / hide ---------- */

  function hide() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.classList.remove("is-visible");
    setTimeout(function () {
      if (overlay && !overlay.classList.contains("is-visible")) {
        overlay.hidden = true;
      }
    }, 380);
  }

  function show(opts) {
    opts = opts || {};
    ensureStyles();

    var score = opts.score != null ? Number(opts.score) : null;
    var total = opts.total != null ? Number(opts.total) : null;
    var accuracy =
      opts.accuracy != null
        ? Number(opts.accuracy)
        : score != null && total > 0
          ? Math.round((score / total) * 100)
          : 0;
    accuracy = clamp(accuracy, 0, 100);

    var stars =
      opts.stars != null ? clamp(Number(opts.stars), 0, 3) : starsFromAccuracy(accuracy);

    var timeMs = opts.timeMs != null ? Number(opts.timeMs) : getElapsed() || null;
    var title = opts.title || titleFromStars(stars);
    var emoji = opts.emoji || emojiFromStars(stars);
    var save = opts.save !== false;
    var sound = opts.sound !== false;
    var gameId = opts.gameId || null;

    // Persist progress
    if (save && gameId && global.LAStars) {
      try {
        LAStars.recordPlay(gameId);
        if (opts.stars != null) LAStars.save(gameId, stars);
        else LAStars.saveFromAccuracy(gameId, accuracy);
      } catch (e) {}
    }

    // Build / reuse overlay
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Game results");
      document.body.appendChild(overlay);
    }
    overlay.hidden = false;
    overlay.classList.remove("is-visible");
    overlay.innerHTML = "";

    var card = document.createElement("div");
    card.className = "la-finish-card";

    var confetti = document.createElement("canvas");
    confetti.className = "la-finish-confetti";
    card.appendChild(confetti);

    var inner = document.createElement("div");
    inner.className = "la-finish-inner";

    // Sticker (performance expression) + title
    var stickerUrl = opts.sticker || stickerFromStars(stars);
    if (stickerUrl) {
      var stickerEl = document.createElement("img");
      stickerEl.className = "la-finish-sticker";
      stickerEl.src = stickerUrl;
      stickerEl.alt = title;
      stickerEl.setAttribute("aria-hidden", "true");
      stickerEl.loading = "eager";
      stickerEl.onerror = function () {
        // Fallback to emoji if image fails
        var fallback = document.createElement("div");
        fallback.className = "la-finish-emoji";
        fallback.setAttribute("aria-hidden", "true");
        fallback.textContent = emoji;
        stickerEl.replaceWith(fallback);
      };
      inner.appendChild(stickerEl);
    } else {
      var emojiEl = document.createElement("div");
      emojiEl.className = "la-finish-emoji";
      emojiEl.setAttribute("aria-hidden", "true");
      emojiEl.textContent = emoji;
      inner.appendChild(emojiEl);
    }

    var titleEl = document.createElement("h2");
    titleEl.className = "la-finish-title";
    titleEl.textContent = title;
    inner.appendChild(titleEl);

    // Stars
    var starsRow = document.createElement("div");
    starsRow.className = "la-finish-stars";
    starsRow.setAttribute("aria-label", stars + " of 3 stars");
    var starEls = [];
    for (var i = 0; i < 3; i++) {
      var s = document.createElement("span");
      s.className = "la-finish-star";
      s.textContent = "★";
      s.setAttribute("aria-hidden", "true");
      starsRow.appendChild(s);
      starEls.push(s);
    }
    inner.appendChild(starsRow);

    // Progress ring
    var ringWrap = document.createElement("div");
    ringWrap.className = "la-finish-ring-wrap";
    ringWrap.innerHTML =
      '<svg class="la-finish-ring" width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">' +
      '<circle class="la-finish-ring-bg" cx="55" cy="55" r="45"/>' +
      '<circle class="la-finish-ring-fg" cx="55" cy="55" r="45"/>' +
      "</svg>" +
      '<div class="la-finish-ring-label">' +
      '<span class="la-finish-pct">0%</span>' +
      '<span class="la-finish-pct-sub">Progress</span>' +
      "</div>";
    inner.appendChild(ringWrap);

    // Stats
    var stats = document.createElement("div");
    stats.className = "la-finish-stats";

    if (score != null && total != null) {
      var scoreStat = document.createElement("div");
      scoreStat.className = "la-finish-stat";
      scoreStat.innerHTML =
        '<span class="la-finish-stat-label">Score</span>' +
        '<span class="la-finish-stat-value">' +
        score +
        " / " +
        total +
        "</span>";
      stats.appendChild(scoreStat);
    }

    if (timeMs != null && timeMs > 0) {
      var timeStat = document.createElement("div");
      timeStat.className = "la-finish-stat";
      timeStat.innerHTML =
        '<span class="la-finish-stat-label">Time</span>' +
        '<span class="la-finish-stat-value">' +
        formatTime(timeMs) +
        "</span>";
      stats.appendChild(timeStat);
    }

    var starsStat = document.createElement("div");
    starsStat.className = "la-finish-stat";
    starsStat.innerHTML =
      '<span class="la-finish-stat-label">Stars</span>' +
      '<span class="la-finish-stat-value">' +
      stars +
      " / 3</span>";
    stats.appendChild(starsStat);

    inner.appendChild(stats);

    // Actions
    var actions = document.createElement("div");
    actions.className = "la-finish-actions";

    var againBtn = document.createElement("button");
    againBtn.type = "button";
    againBtn.className = "la-finish-btn la-finish-btn-primary";
    againBtn.setAttribute("aria-label", "Play again");
    againBtn.textContent = "↻";
    againBtn.addEventListener("click", function () {
      hide();
      if (typeof opts.onAgain === "function") opts.onAgain();
    });
    actions.appendChild(againBtn);

    if (typeof opts.onBack === "function" || opts.backHref) {
      var backBtn;
      if (opts.backHref) {
        backBtn = document.createElement("a");
        backBtn.href = opts.backHref;
        backBtn.className = "la-finish-btn";
        backBtn.setAttribute("aria-label", "Back");
        backBtn.textContent = "←";
      } else {
        backBtn = document.createElement("button");
        backBtn.type = "button";
        backBtn.className = "la-finish-btn";
        backBtn.setAttribute("aria-label", "Back");
        backBtn.textContent = "←";
        backBtn.addEventListener("click", function () {
          hide();
          opts.onBack();
        });
      }
      actions.appendChild(backBtn);
    }

    inner.appendChild(actions);
    card.appendChild(inner);
    overlay.appendChild(card);

    // Animate in + open sound
    requestAnimationFrame(function () {
      overlay.classList.add("is-visible");
      if (sound) playWhoosh();
    });

    // Animate ring
    var fg = ringWrap.querySelector(".la-finish-ring-fg");
    var pctLabel = ringWrap.querySelector(".la-finish-pct");
    var circumference = 2 * Math.PI * 45; // ≈ 282.7
    fg.style.strokeDasharray = String(circumference);
    fg.style.strokeDashoffset = String(circumference);

    setTimeout(function () {
      var offset = circumference * (1 - accuracy / 100);
      fg.style.strokeDashoffset = String(offset);
    }, 120);

    // Count up percentage
    var pctStart = performance.now();
    var pctDur = 900;
    function tickPct(now) {
      var t = clamp((now - pctStart) / pctDur, 0, 1);
      // ease out
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(accuracy * eased);
      pctLabel.textContent = val + "%";
      if (t < 1) requestAnimationFrame(tickPct);
    }
    requestAnimationFrame(tickPct);

    // Animate stars one by one
    starEls.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("is-pop");
        if (i < stars) {
          el.classList.add("is-on");
          if (sound) playStarDing(i);
        }
      }, 280 + i * 220);
    });

    // Fanfare + confetti after stars
    setTimeout(function () {
      if (sound) playFanfare(stars);
      if (stars >= 2) runConfetti(confetti, stars);
    }, 280 + stars * 220 + 80);

    // Focus primary button for a11y
    setTimeout(function () {
      try { againBtn.focus(); } catch (e) {}
    }, 400);

    return {
      stars: stars,
      accuracy: accuracy,
      timeMs: timeMs,
    };
  }

  /* ---------- public API ---------- */

  global.LAFinish = {
    show: show,
    hide: hide,
    startTimer: startTimer,
    stopTimer: stopTimer,
    getElapsed: getElapsed,
    formatTime: formatTime,
    starsFromAccuracy: starsFromAccuracy,
  };
})(window);
