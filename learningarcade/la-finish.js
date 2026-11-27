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
 *     // ringLabel: "Accuracy",
 *     // mistakes: [{ prompt: "I ___ Tom.", yours: "are", answer: "am" }],
 *     // onReview: fn,        // optional custom review handler
 *     // nextHref: "../next-game/",
 *     // onNext: fn,
 *     timeMs: timeMs,         // optional (also uses startTimer/stopTimer)
 *     onAgain: startGame,     // ↻ Restart current mode
 *     onModes: showStart,     // ▦ Back to mode / start screen
 *     backHref: "../",        // ← Games menu (or onBack: fn)
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
  var MUTE_KEY = "laFinishMuted";
  var timerStart = 0;
  var audioCtx = null;

  var activeTimers = [];
  var confettiRafId = 0;
  var pctRafId = 0;
  var hideTimerId = 0;
  var showSeq = 0;
  var keydownBound = false;
  var activeEscHandler = null;
  var lastFocusedEl = null;
  var courseDataPromise = null;

  /* ---------- helpers ---------- */

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function prefersReducedMotion() {
    try {
      return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {
      return false;
    }
  }

  function isMuted() {
    try {
      return global.localStorage && global.localStorage.getItem(MUTE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setMuted(muted) {
    try {
      if (global.localStorage) {
        if (muted) global.localStorage.setItem(MUTE_KEY, "1");
        else global.localStorage.removeItem(MUTE_KEY);
      }
    } catch (e) {}
  }

  function addTimer(fn, ms) {
    var id = setTimeout(function () {
      var idx = activeTimers.indexOf(id);
      if (idx !== -1) activeTimers.splice(idx, 1);
      fn();
    }, ms);
    activeTimers.push(id);
    return id;
  }

  function clearAnimations() {
    while (activeTimers.length) {
      clearTimeout(activeTimers.pop());
    }
    if (confettiRafId) {
      cancelAnimationFrame(confettiRafId);
      confettiRafId = 0;
    }
    if (pctRafId) {
      cancelAnimationFrame(pctRafId);
      pctRafId = 0;
    }
    if (hideTimerId) {
      clearTimeout(hideTimerId);
      hideTimerId = 0;
    }
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

  function buildNudge(stars, accuracy, prevStars, isNewTimeRecord) {
    if (stars === 3) {
      if (prevStars != null && prevStars < 3) return "★ New 3-star record!";
      if (isNewTimeRecord) return "⚡ Personal best speed!";
      if (accuracy >= 100) return "Flawless 100% — amazing!";
      return "3 stars earned!";
    }
    if (stars === 2) {
      var toThree = Math.max(1, 90 - Math.round(accuracy));
      return toThree + "% more for 3 ★!";
    }
    if (stars === 1) {
      var toTwo = Math.max(1, 70 - Math.round(accuracy));
      return toTwo + "% more for 2 ★!";
    }
    var toOne = Math.max(1, 40 - Math.round(accuracy));
    return toOne + "% more for your first ★!";
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
    ms = Number(ms) || 0;
    if (ms <= 0) return "0s";
    var totalSec = Math.max(1, Math.round(ms / 1000));
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
      /* Overlay (Light mode default) */
      "#" + OVERLAY_ID + "{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,18,40,.46);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;transition:opacity .3s ease;font-family:\"Plus Jakarta Sans\",Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Arial,sans-serif}",
      "#" + OVERLAY_ID + ".is-visible{opacity:1}",
      "#" + OVERLAY_ID + "[hidden]{display:none!important}",

      /* Card */
      ".la-finish-card{position:relative;width:100%;max-width:348px;max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;background:linear-gradient(180deg,#ffffff 0%,#f8f7ff 100%);color:#1e1b4b;border:1px solid rgba(109,95,240,.16);border-radius:26px;padding:24px 20px 20px;box-shadow:0 24px 60px rgba(30,27,75,.2),0 2px 10px rgba(109,95,240,.08);text-align:center;transform:translateY(20px) scale(.95);opacity:0;transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .3s ease}",
      "#" + OVERLAY_ID + ".is-visible .la-finish-card{transform:translateY(0) scale(1);opacity:1}",

      /* Top utility bar (mute button) */
      ".la-finish-mute{position:absolute;top:14px;right:14px;z-index:2;width:36px;height:36px;border-radius:11px;border:1px solid rgba(109,95,240,.18);background:rgba(255,255,255,.86);color:#475569;font-size:.95rem;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .14s ease,border-color .14s ease,background .14s ease}",
      ".la-finish-mute:hover{border-color:#6d5ff0;transform:translateY(-1px)}",
      ".la-finish-mute[aria-pressed='true']{color:#94a3b8;background:rgba(241,245,249,.85)}",
      ".la-finish-mute:focus-visible,.la-finish-btn:focus-visible,.la-finish-review-btn:focus-visible{outline:3px solid rgba(109,95,240,.45);outline-offset:2px}",

      /* Confetti */
      ".la-finish-confetti{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}",
      ".la-finish-inner{position:relative;z-index:1}",

      /* Sticker / emoji */
      ".la-finish-emoji{font-size:3rem;line-height:1;margin-bottom:6px;display:inline-block;animation:la-finish-pop .55s cubic-bezier(.22,1,.36,1) both}",
      ".la-finish-sticker{width:104px;height:104px;object-fit:contain;margin:0 auto 6px;display:block;animation:la-finish-pop .55s cubic-bezier(.22,1,.36,1) both;filter:drop-shadow(0 10px 18px rgba(99,80,200,.18))}",
      "@keyframes la-finish-pop{0%{transform:scale(0) rotate(-12deg);opacity:0}60%{transform:scale(1.12) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}",

      /* Title & nudge */
      ".la-finish-title{font-family:\"Fredoka\",\"Plus Jakarta Sans\",sans-serif;font-size:1.55rem;font-weight:700;margin:0 0 2px;letter-spacing:-0.02em;color:#1e1b4b}",
      ".la-finish-nudge{margin:0 0 8px;font-size:.78rem;font-weight:700;color:#6d5ff0;min-height:1.1em}",

      /* Stars */
      ".la-finish-stars{display:flex;justify-content:center;gap:6px;margin:6px 0 12px;min-height:32px}",
      ".la-finish-star{font-size:1.65rem;line-height:1;color:#cbd5e1;transform:scale(0);opacity:0;transition:color .25s}",
      ".la-finish-star.is-on{color:#f59e0b;text-shadow:0 2px 8px rgba(245,158,11,.4)}",
      ".la-finish-star.is-pop{animation:la-star-pop .5s cubic-bezier(.22,1,.36,1) forwards}",
      "@keyframes la-star-pop{0%{transform:scale(0) rotate(-30deg);opacity:0}60%{transform:scale(1.22) rotate(8deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}",

      /* Accuracy ring */
      ".la-finish-ring-wrap{position:relative;width:104px;height:104px;margin:0 auto 14px}",
      ".la-finish-ring{transform:rotate(-90deg)}",
      ".la-finish-ring-bg{fill:none;stroke:#ede9fe;stroke-width:9}",
      ".la-finish-ring-fg{fill:none;stroke:url(#laFinishGrad);stroke-width:9;stroke-linecap:round;stroke-dasharray:283;stroke-dashoffset:283;transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1);filter:drop-shadow(0 0 6px rgba(109,95,240,.3))}",
      ".la-finish-ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}",
      ".la-finish-pct{font-size:1.35rem;font-weight:800;line-height:1;color:#1e1b4b;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}",
      ".la-finish-pct-sub{font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7c76a3;margin-top:3px}",

      /* Stat chips — auto-fit handles 1, 2, or 3 chips cleanly */
      ".la-finish-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(84px,1fr));gap:8px;margin:0 0 14px}",
      ".la-finish-stat{background:#f4f2ff;border:1px solid #e4defc;border-radius:16px;padding:10px 6px;min-width:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}",
      ".la-finish-stat-label{display:block;font-size:.58rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#7c76a3;margin-bottom:4px}",
      ".la-finish-stat-value{display:block;font-size:1rem;font-weight:800;color:#1e1b4b;letter-spacing:-0.02em;line-height:1.15;font-variant-numeric:tabular-nums}",
      ".la-finish-stat-sub{display:block;font-size:.6rem;font-weight:700;margin-top:4px;color:#7c76a3;line-height:1.15;font-variant-numeric:tabular-nums}",
      ".la-finish-stat-sub.is-record{color:#d97706}",
      ".la-finish-stat--score{background:linear-gradient(180deg,#f5f3ff,#ede9fe);border-color:#ddd6fe}",
      ".la-finish-stat--score .la-finish-stat-label{color:#6d28d9}",
      ".la-finish-stat--time{background:linear-gradient(180deg,#f0f9ff,#e0f2fe);border-color:#bae6fd}",
      ".la-finish-stat--time .la-finish-stat-label{color:#0284c7}",
      ".la-finish-stat--stars{background:linear-gradient(180deg,#fffbeb,#fef3c7);border-color:#fde68a}",
      ".la-finish-stat--stars .la-finish-stat-label{color:#d97706}",

      /* Review mistakes toggle + drawer */
      ".la-finish-review-wrap{margin:0 0 14px;text-align:center}",
      ".la-finish-review-btn{appearance:none;width:100%;padding:9px 12px;border-radius:12px;border:1px solid #fecaca;background:#fff5f5;color:#b91c1c;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:background .15s,border-color .15s}",
      ".la-finish-review-btn:hover{background:#fee2e2}",
      ".la-finish-review-list{margin:8px 0 0;padding:8px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;text-align:left;max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:6px}",
      ".la-finish-review-list[hidden]{display:none}",
      ".la-finish-review-item{padding:7px 9px;border-radius:10px;background:#ffffff;border:1px solid #e2e8f0;font-size:.76rem;line-height:1.35}",
      ".la-finish-review-q{font-weight:700;color:#1e1b4b;margin-bottom:2px}",
      ".la-finish-review-a{color:#15803d;font-weight:700}",
      ".la-finish-review-y{color:#b91c1c;text-decoration:line-through;margin-right:6px;font-weight:600}",

      /* Speed board */
      ".la-finish-speed{margin:0 0 14px;padding:10px 12px;border-radius:14px;background:linear-gradient(180deg,#f0f9ff,#e8f4fc);border:1px solid #bae6fd;text-align:center}",
      ".la-finish-speed[hidden]{display:none}",
      ".la-finish-speed-title{font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#0284c7;margin:0 0 6px}",
      ".la-finish-speed-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 6px;border-radius:8px;font-size:.8rem}",
      ".la-finish-speed-row.is-me{background:rgba(2,132,199,.12)}",
      ".la-finish-speed-left{display:flex;align-items:center;gap:6px;min-width:0;font-weight:700;color:#0f172a}",
      ".la-finish-speed-medal{flex-shrink:0;font-size:.95rem}",
      ".la-finish-speed-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".la-finish-speed-time{flex-shrink:0;font-weight:800;color:#0284c7;font-variant-numeric:tabular-nums}",

      /* Actions */
      ".la-finish-actions{display:flex;justify-content:center;align-items:flex-start;gap:12px;flex-wrap:wrap}",
      ".la-finish-action{display:flex;flex-direction:column;align-items:center;gap:5px}",
      ".la-finish-action[hidden]{display:none}",
      ".la-finish-action-label{font-size:.58rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#64748b;line-height:1}",
      ".la-finish-btn{width:48px;height:48px;border-radius:14px;border:1px solid #e2e8f0;background:#ffffff;color:#1e1b4b;font-size:1.15rem;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;text-decoration:none;box-shadow:0 2px 8px rgba(30,27,75,.07);transition:transform .15s,border-color .15s,background .15s,box-shadow .15s}",
      ".la-finish-btn:hover{border-color:#6d5ff0;transform:translateY(-2px);box-shadow:0 6px 16px rgba(109,95,240,.16)}",
      ".la-finish-btn:active{transform:scale(.96)}",
      ".la-finish-btn-primary{background:linear-gradient(135deg,#6d5ff0,#5b21b6);border-color:transparent;color:#ffffff;box-shadow:0 6px 18px rgba(109,95,240,.34)}",
      ".la-finish-btn-primary:hover{background:linear-gradient(135deg,#7c6cf0,#6d28d9);border-color:transparent;box-shadow:0 8px 22px rgba(109,95,240,.42)}",
      ".la-finish-btn-next{background:linear-gradient(135deg,#10b981,#059669);border-color:transparent;color:#ffffff;box-shadow:0 6px 16px rgba(16,185,129,.3)}",
      ".la-finish-btn-next:hover{background:linear-gradient(135deg,#34d399,#10b981);border-color:transparent;box-shadow:0 8px 20px rgba(16,185,129,.38)}",

      /* ===== Dark mode: Neon glass theme ===== */
      "html[data-theme='dark'] #" + OVERLAY_ID + "{background:radial-gradient(circle at 50% 30%,rgba(76,60,160,.45),rgba(8,6,20,.84) 70%)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-card{color:#f5f3ff;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.025)),#14122b;border:1px solid rgba(167,139,250,.28);box-shadow:0 30px 80px rgba(124,58,237,.32),0 0 0 1px rgba(255,255,255,.04) inset}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-mute{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);color:#e9e7ff}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-mute[aria-pressed='true']{color:#64748b;background:rgba(255,255,255,.04)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-sticker{filter:drop-shadow(0 0 22px rgba(167,139,250,.55)) drop-shadow(0 10px 18px rgba(0,0,0,.35))}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-emoji{filter:drop-shadow(0 0 18px rgba(167,139,250,.6))}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-title{background:linear-gradient(90deg,#f5f3ff,#c4b5fd);-webkit-background-clip:text;background-clip:text;color:transparent}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-nudge{color:#c4b5fd}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-star{color:rgba(255,255,255,.18)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-star.is-on{color:#fde047;text-shadow:0 0 14px rgba(253,224,71,.75)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-ring-bg{stroke:rgba(196,181,253,.16)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-ring-fg{filter:drop-shadow(0 0 8px rgba(167,139,250,.7))}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-pct{color:#f5f3ff}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-pct-sub{color:#c4b5fd}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);box-shadow:none}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat-label{color:#a5a3c9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat-value{color:#f5f3ff}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat-sub{color:#a5a3c9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat-sub.is-record{color:#fde047}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--score{background:rgba(139,92,246,.12);border-color:rgba(167,139,250,.3)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--score .la-finish-stat-label{color:#c4b5fd}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--time{background:rgba(34,211,238,.1);border-color:rgba(103,232,249,.3)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--time .la-finish-stat-label{color:#67e8f9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--time .la-finish-stat-value{color:#67e8f9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--stars{background:rgba(250,204,21,.1);border-color:rgba(253,224,71,.3)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--stars .la-finish-stat-label{color:#fde047}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-stat--stars .la-finish-stat-value{color:#fde047}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-btn{background:rgba(239,68,68,.12);border-color:rgba(248,113,113,.3);color:#fca5a5}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-btn:hover{background:rgba(239,68,68,.2)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-list{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-item{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-q{color:#f5f3ff}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-a{color:#6ee7b7}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-review-y{color:#fca5a5}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-speed{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-speed-title{color:#67e8f9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-speed-left{color:#f5f3ff}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-speed-time{color:#67e8f9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-speed-row.is-me{background:rgba(103,232,249,.12)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-action-label{color:#a5a3c9}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#e9e7ff;box-shadow:none}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-btn:hover{border-color:#a78bfa;box-shadow:0 6px 18px rgba(124,58,237,.35)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-btn-primary{background:linear-gradient(135deg,#8b5cf6,#6d28d9);border-color:transparent;color:#fff;box-shadow:0 10px 26px rgba(124,58,237,.5)}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-btn-primary:hover{background:linear-gradient(135deg,#9d74fb,#7c3aed);border-color:transparent}",
      "html[data-theme='dark'] #" + OVERLAY_ID + " .la-finish-btn-next{background:linear-gradient(135deg,#10b981,#047857);border-color:transparent;color:#fff;box-shadow:0 8px 22px rgba(16,185,129,.38)}",

      "@media (prefers-reduced-motion:reduce){" +
        "#" + OVERLAY_ID + ",#" + OVERLAY_ID + " *{" +
          "animation:none!important;transition:none!important" +
        "}" +
        "#" + OVERLAY_ID + " .la-finish-star{transform:none;opacity:1}" +
      "}"
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

  function playWhoosh() {
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    noiseBurst(t, 0.22, 0.05);
    tone(220, t, 0.2, "sine", 0.04, 440);
  }

  function playStarDing(i) {
    var ctx = getCtx();
    if (!ctx) return;
    var freqs = [659.25, 783.99, 1046.5];
    var t = ctx.currentTime;
    var f = freqs[i] || 659.25;
    tone(f, t, 0.16, "sine", 0.13);
    tone(f * 2, t, 0.12, "triangle", 0.05);
  }

  function playFanfare(stars) {
    var ctx = getCtx();
    if (!ctx) return;
    var t = ctx.currentTime + 0.03;

    if (stars >= 3) {
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
      tone(493.88, t, 0.16, "triangle", 0.09);
      tone(587.33, t + 0.15, 0.28, "sine", 0.09);
    } else {
      tone(392.0, t, 0.2, "sine", 0.07);
      tone(493.88, t + 0.18, 0.3, "sine", 0.07);
    }
  }

  /* ---------- confetti ---------- */

  function runConfetti(canvas, intensity) {
    if (!canvas || intensity <= 0 || prefersReducedMotion()) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (!w || !h) return;
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
        confettiRafId = 0;
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
      confettiRafId = requestAnimationFrame(frame);
    }
    confettiRafId = requestAnimationFrame(frame);
  }

  /* ---------- next-game discovery ---------- */

  function loadCourseData() {
    try {
      if (typeof COURSE_DATA !== "undefined" && COURSE_DATA) {
        return Promise.resolve(COURSE_DATA);
      }
    } catch (e) {}
    if (courseDataPromise) return courseDataPromise;
    courseDataPromise = new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = "/resources/american-english-file/assets/course-data.js";
      s.async = true;
      s.onload = function () {
        try {
          resolve(typeof COURSE_DATA !== "undefined" ? COURSE_DATA : null);
        } catch (e) {
          resolve(null);
        }
      };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return courseDataPromise;
  }

  function findNextGameFromCourse() {
    var ds = document.body && document.body.dataset ? document.body.dataset : {};
    if (ds.course !== "american-english-file") return Promise.resolve(null);
    return loadCourseData().then(function (data) {
      if (!data || !data["american-english-file"] || !data["american-english-file"].levels) return null;
      var lv = data["american-english-file"].levels[ds.level];
      if (!lv) return null;
      var bucket = null;
      if (ds.pe && lv.practicalEnglish) bucket = lv.practicalEnglish[ds.pe];
      else if (ds.unit && ds.lesson && lv.units && lv.units[ds.unit] && lv.units[ds.unit].lessons) {
        bucket = lv.units[ds.unit].lessons[ds.lesson];
      }
      if (!bucket || !Array.isArray(bucket.games) || bucket.games.length < 2) return null;

      var segs = location.pathname.split("/").filter(Boolean);
      var currentSlug = segs[segs.length - 1] || "";
      if (currentSlug === "index.html" && segs.length > 1) currentSlug = segs[segs.length - 2];

      var idx = -1;
      for (var i = 0; i < bucket.games.length; i++) {
        var u = String(bucket.games[i].url || "").replace(/^\/+|\/+$/g, "");
        var slug = u.split("/").pop();
        if (slug && slug === currentSlug) {
          idx = i;
          break;
        }
      }
      if (idx === -1) return null;
      var nextItem = bucket.games[(idx + 1) % bucket.games.length];
      if (!nextItem || !nextItem.url) return null;
      var href = nextItem.url;
      if (!/^https?:|^\//i.test(href) && href.indexOf("../") !== 0) {
        href = "../" + href;
      }
      return { href: href, title: nextItem.title || "Next game" };
    });
  }

  /* ---------- keyboard / focus management ---------- */

  function bindGlobalKeys() {
    if (keydownBound) return;
    keydownBound = true;
    document.addEventListener("keydown", function (e) {
      var overlay = document.getElementById(OVERLAY_ID);
      if (!overlay || overlay.hidden || !overlay.classList.contains("is-visible")) return;

      if (e.key === "Escape") {
        if (typeof activeEscHandler === "function") {
          e.preventDefault();
          activeEscHandler();
        }
        return;
      }

      if (e.key === "Tab") {
        var focusables = Array.prototype.slice.call(
          overlay.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
        ).filter(function (el) {
          return !el.hidden && el.offsetParent !== null;
        });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- timer helpers ---------- */

  function startTimer() {
    timerStart = performance.now();
    try {
      if (global.LAStars && typeof LAStars.startTimer === "function") {
        LAStars.startTimer(true);
      }
    } catch (e) {}
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

  function hide(restoreFocus) {
    clearAnimations();
    activeEscHandler = null;
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    overlay.classList.remove("is-visible");
    hideTimerId = setTimeout(function () {
      hideTimerId = 0;
      if (overlay && !overlay.classList.contains("is-visible")) {
        overlay.hidden = true;
      }
      if (restoreFocus && lastFocusedEl && typeof lastFocusedEl.focus === "function") {
        try { lastFocusedEl.focus(); } catch (e) {}
      }
    }, prefersReducedMotion() ? 20 : 320);
  }

  function show(opts) {
    opts = opts || {};
    showSeq += 1;
    var seq = showSeq;
    clearAnimations();
    ensureStyles();
    bindGlobalKeys();

    try {
      lastFocusedEl = document.activeElement || null;
    } catch (e) {
      lastFocusedEl = null;
    }

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
    var ringLabel = opts.ringLabel || "Accuracy";
    var save = opts.save !== false;
    var soundOpt = opts.sound !== false;
    var gameId = opts.gameId || null;
    if (gameId && /^(teen2teen|ua):/.test(gameId) && global.LAStars && typeof LAStars.getLastGameId === "function") {
      gameId = LAStars.getLastGameId() || gameId;
    }

    var prevStars = null;
    if (gameId && global.LAStars && typeof LAStars.getStars === "function") {
      try { prevStars = LAStars.getStars(gameId); } catch (ePrev) {}
    }

    // Persist progress (local stars — automatic, no name required)
    if (save && gameId && global.LAStars) {
      try {
        LAStars.recordPlay(gameId);
        if (opts.stars != null) LAStars.save(gameId, stars);
        else LAStars.saveFromAccuracy(gameId, accuracy);
      } catch (e) {}
    }

    // Persist personal best time locally for solid runs (≥70% accuracy or ≥2 stars)
    var isSolidRun = accuracy >= 70 || (opts.stars != null && stars >= 2) || (score == null && total == null && opts.completed !== false);
    var timeRecord = null;
    if (gameId && global.LAStars) {
      try {
        if (typeof LAStars.markFinishTimeHandled === "function") {
          LAStars.markFinishTimeHandled(gameId);
        }
        if (timeMs != null && timeMs > 0 && isSolidRun && typeof LAStars.saveBestTime === "function") {
          timeRecord = LAStars.saveBestTime(gameId, timeMs);
        } else if (typeof LAStars.getBestTime === "function") {
          var prevBest = LAStars.getBestTime(gameId);
          if (prevBest) {
            timeRecord = { bestMs: prevBest, prevBestMs: prevBest, currentMs: timeMs, isNewRecord: false };
          }
        }
      } catch (eTime) {}
    }

    // Auto cloud score when player has a name (includes timeMs for speed board)
    var submitPromise = null;
    if (gameId && global.LAScores && typeof LAScores.submit === "function") {
      try {
        var hasName = LAScores.getPlayerName && LAScores.getPlayerName();
        if (hasName && score != null) {
          var payload = {
            gameId: gameId,
            score: score,
            maxScore: total,
            gameName: opts.gameName || gameId
          };
          if (timeMs != null && timeMs > 0 && accuracy >= 70) {
            payload.timeMs = timeMs;
          }
          submitPromise = LAScores.submit(payload).catch(function () {
            return null;
          });
        }
      } catch (e2) {}
    }

    // Per-student cloud progress (logged-in students only; guests are skipped silently)
    if (save && gameId && typeof global.LAProgressSave === "function") {
      try {
        global.LAProgressSave({
          gameId: gameId,
          gameName: opts.gameName || undefined,
          category: opts.category || undefined,
          unit: opts.unit || undefined,
          score: score,
          maxScore: total,
          accuracy: opts.accuracy != null || (score != null && total > 0) ? accuracy : undefined,
          completed: opts.completed !== false,
          timeSeconds: timeMs != null && timeMs > 0 ? timeMs / 1000 : 0,
          stars: stars
        });
      } catch (e3) {}
    }

    // Build / reuse overlay
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-labelledby", "la-finish-title");
      document.body.appendChild(overlay);
    }
    overlay.hidden = false;
    overlay.classList.remove("is-visible");
    overlay.innerHTML = "";

    var card = document.createElement("div");
    card.className = "la-finish-card";

    // Sound mute toggle button
    var muteBtn = document.createElement("button");
    muteBtn.type = "button";
    muteBtn.className = "la-finish-mute";
    function syncMuteBtn() {
      var muted = isMuted();
      muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
      muteBtn.setAttribute("aria-label", muted ? "Unmute finish sounds" : "Mute finish sounds");
      muteBtn.title = muted ? "Sound off (click to unmute)" : "Sound on (click to mute)";
      muteBtn.textContent = muted ? "🔇" : "🔊";
    }
    syncMuteBtn();
    muteBtn.addEventListener("click", function () {
      setMuted(!isMuted());
      syncMuteBtn();
    });
    card.appendChild(muteBtn);

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
      stickerEl.alt = "";
      stickerEl.setAttribute("aria-hidden", "true");
      stickerEl.loading = "eager";
      stickerEl.onerror = function () {
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
    titleEl.id = "la-finish-title";
    titleEl.className = "la-finish-title";
    titleEl.textContent = title;
    inner.appendChild(titleEl);

    var nudgeText = opts.subtitle || buildNudge(stars, accuracy, prevStars, !!(timeRecord && timeRecord.isNewRecord));
    var nudgeEl = document.createElement("p");
    nudgeEl.className = "la-finish-nudge";
    nudgeEl.textContent = nudgeText;
    inner.appendChild(nudgeEl);

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

    // Accuracy ring (wired up to #laFinishGrad)
    var ringWrap = document.createElement("div");
    ringWrap.className = "la-finish-ring-wrap";
    ringWrap.innerHTML =
      '<svg class="la-finish-ring" width="104" height="104" viewBox="0 0 110 110" aria-hidden="true">' +
      '<defs><linearGradient id="laFinishGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#a78bfa"/>' +
      '<stop offset="100%" stop-color="#6d5ff0"/>' +
      "</linearGradient></defs>" +
      '<circle class="la-finish-ring-bg" cx="55" cy="55" r="45"/>' +
      '<circle class="la-finish-ring-fg" cx="55" cy="55" r="45"/>' +
      "</svg>" +
      '<div class="la-finish-ring-label">' +
      '<span class="la-finish-pct">0%</span>' +
      '<span class="la-finish-pct-sub">' + escapeHtml(ringLabel) + "</span>" +
      "</div>";
    inner.appendChild(ringWrap);

    // Stats (1, 2, or 3 chips centered via auto-fit)
    var stats = document.createElement("div");
    stats.className = "la-finish-stats";

    if (score != null && total != null) {
      var scoreStat = document.createElement("div");
      scoreStat.className = "la-finish-stat la-finish-stat--score";
      scoreStat.innerHTML =
        '<span class="la-finish-stat-label">Score</span>' +
        '<span class="la-finish-stat-value">' +
        escapeHtml(score) +
        " / " +
        escapeHtml(total) +
        "</span>";
      stats.appendChild(scoreStat);
    }

    if (timeMs != null && timeMs > 0) {
      var timeStat = document.createElement("div");
      timeStat.className = "la-finish-stat la-finish-stat--time";
      var timeSubHtml = "";
      if (timeRecord && timeRecord.isNewRecord && timeRecord.prevBestMs) {
        timeSubHtml = '<span class="la-finish-stat-sub is-record">Beat ' + escapeHtml(formatTime(timeRecord.prevBestMs)) + "!</span>";
      } else if (timeRecord && timeRecord.isNewRecord) {
        timeSubHtml = '<span class="la-finish-stat-sub is-record">New record!</span>';
      } else if (timeRecord && timeRecord.bestMs) {
        timeSubHtml = '<span class="la-finish-stat-sub">Best ' + escapeHtml(formatTime(timeRecord.bestMs)) + "</span>";
      } else if (!isSolidRun) {
        timeSubHtml = '<span class="la-finish-stat-sub">70%+ for record</span>';
      }
      timeStat.innerHTML =
        '<span class="la-finish-stat-label">Time</span>' +
        '<span class="la-finish-stat-value">' +
        escapeHtml(formatTime(timeMs)) +
        "</span>" +
        timeSubHtml;
      stats.appendChild(timeStat);
    }

    var starsStat = document.createElement("div");
    starsStat.className = "la-finish-stat la-finish-stat--stars";
    starsStat.innerHTML =
      '<span class="la-finish-stat-label">Stars</span>' +
      '<span class="la-finish-stat-value">' +
      stars +
      " / 3</span>";
    stats.appendChild(starsStat);

    inner.appendChild(stats);

    // Optional mistake review (via opts.mistakes array or opts.onReview callback)
    var mistakes = Array.isArray(opts.mistakes) ? opts.mistakes : [];
    var reviewListEl = null;
    var reviewBtnEl = null;
    if (mistakes.length > 0 || typeof opts.onReview === "function") {
      var reviewWrap = document.createElement("div");
      reviewWrap.className = "la-finish-review-wrap";

      reviewBtnEl = document.createElement("button");
      reviewBtnEl.type = "button";
      reviewBtnEl.className = "la-finish-review-btn";
      reviewBtnEl.textContent = mistakes.length > 0
        ? "Review mistakes (" + mistakes.length + ")"
        : "Review mistakes";

      if (typeof opts.onReview === "function" && mistakes.length === 0) {
        reviewBtnEl.addEventListener("click", function () {
          hide();
          opts.onReview();
        });
        reviewWrap.appendChild(reviewBtnEl);
      } else {
        reviewBtnEl.setAttribute("aria-expanded", "false");
        reviewListEl = document.createElement("div");
        reviewListEl.className = "la-finish-review-list";
        reviewListEl.hidden = true;
        reviewListEl.innerHTML = mistakes.map(function (m) {
          if (typeof m === "string") {
            return '<div class="la-finish-review-item"><div class="la-finish-review-q">' + escapeHtml(m) + "</div></div>";
          }
          var q = m.prompt || m.question || m.item || "";
          var y = m.yours || m.actual || m.wrong || "";
          var a = m.answer || m.expected || m.correct || "";
          return (
            '<div class="la-finish-review-item">' +
            (q ? '<div class="la-finish-review-q">' + escapeHtml(q) + "</div>" : "") +
            "<div>" +
            (y ? '<span class="la-finish-review-y">' + escapeHtml(y) + "</span>" : "") +
            (a ? '<span class="la-finish-review-a">→ ' + escapeHtml(a) + "</span>" : "") +
            "</div></div>"
          );
        }).join("");

        reviewBtnEl.addEventListener("click", function () {
          var nextOpen = reviewListEl.hidden;
          reviewListEl.hidden = !nextOpen;
          reviewBtnEl.setAttribute("aria-expanded", nextOpen ? "true" : "false");
        });
        reviewWrap.appendChild(reviewBtnEl);
        reviewWrap.appendChild(reviewListEl);
      }
      inner.appendChild(reviewWrap);
    }

    // Speed board (top 3 fastest) — stays hidden until non-empty rows load
    var speedBox = document.createElement("div");
    speedBox.className = "la-finish-speed";
    speedBox.hidden = true;
    inner.appendChild(speedBox);

    function renderSpeedBoard(rows) {
      if (seq !== showSeq || !rows || !rows.length) {
        speedBox.hidden = true;
        return;
      }
      speedBox.hidden = false;
      var me = "";
      try {
        if (global.LAScores && LAScores.getDisplayName) me = (LAScores.getDisplayName() || "").toLowerCase();
        if (!me && LAScores.getPlayerName) me = (LAScores.getPlayerName() || "").toLowerCase();
      } catch (e) {}

      var html = '<div class="la-finish-speed-title">⚡ Fastest</div>';
      rows.slice(0, 3).forEach(function (r, idx) {
        var medals = ["🥇", "🥈", "🥉"];
        var isMe = me && r.key === me;
        html +=
          '<div class="la-finish-speed-row' +
          (isMe ? " is-me" : "") +
          '">' +
          '<span class="la-finish-speed-left">' +
          '<span class="la-finish-speed-medal">' +
          medals[idx] +
          "</span>" +
          '<span class="la-finish-speed-name">' +
          escapeHtml(r.name || "Player") +
          (isMe ? " (you)" : "") +
          "</span></span>" +
          '<span class="la-finish-speed-time">' +
          escapeHtml(formatTime(r.timeMs)) +
          "</span></div>";
      });
      speedBox.innerHTML = html;
    }

    function loadSpeedBoard() {
      if (!gameId || !global.LAScores || typeof LAScores.topByTime !== "function" || !(timeMs > 0)) {
        speedBox.hidden = true;
        return;
      }
      var run = function () {
        LAScores.topByTime(gameId, 3, 70)
          .then(function (rows) {
            renderSpeedBoard(rows || []);
          })
          .catch(function () {
            speedBox.hidden = true;
          });
      };
      if (submitPromise && typeof submitPromise.then === "function") {
        submitPromise.then(function () {
          addTimer(run, 200);
        });
      } else {
        run();
      }
    }
    loadSpeedBoard();

    // Actions — Restart | Modes | Menu | Next
    var actions = document.createElement("div");
    actions.className = "la-finish-actions";

    function makeAction(btnEl, label) {
      var wrap = document.createElement("div");
      wrap.className = "la-finish-action";
      wrap.appendChild(btnEl);
      if (label) {
        var lab = document.createElement("span");
        lab.className = "la-finish-action-label";
        lab.textContent = label;
        wrap.appendChild(lab);
      }
      return wrap;
    }

    // 1) Restart current mode
    var againBtn = document.createElement("button");
    againBtn.type = "button";
    againBtn.className = "la-finish-btn la-finish-btn-primary";
    againBtn.setAttribute("aria-label", "Restart");
    againBtn.title = "Restart";
    againBtn.textContent = "↻";
    againBtn.addEventListener("click", function () {
      hide();
      startTimer();
      if (typeof opts.onAgain === "function") opts.onAgain();
    });
    actions.appendChild(makeAction(againBtn, "Restart"));

    // 2) Back to mode / start screen (optional)
    if (typeof opts.onModes === "function") {
      var modesBtn = document.createElement("button");
      modesBtn.type = "button";
      modesBtn.className = "la-finish-btn";
      modesBtn.setAttribute("aria-label", "Modes");
      modesBtn.title = "Modes";
      modesBtn.textContent = "▦";
      modesBtn.addEventListener("click", function () {
        hide();
        opts.onModes();
      });
      actions.appendChild(makeAction(modesBtn, "Modes"));
    }

    // 3) Back to games menu
    if (typeof opts.onBack === "function" || opts.backHref) {
      var backBtn;
      if (opts.backHref) {
        backBtn = document.createElement("a");
        backBtn.href = opts.backHref;
        backBtn.className = "la-finish-btn";
        backBtn.setAttribute("aria-label", "Games menu");
        backBtn.title = "Games menu";
        backBtn.textContent = "←";
      } else {
        backBtn = document.createElement("button");
        backBtn.type = "button";
        backBtn.className = "la-finish-btn";
        backBtn.setAttribute("aria-label", "Games menu");
        backBtn.title = "Games menu";
        backBtn.textContent = "←";
        backBtn.addEventListener("click", function () {
          hide();
          opts.onBack();
        });
      }
      actions.appendChild(makeAction(backBtn, "Menu"));
    }

    // 4) Next game (explicit nextHref / onNext, or auto-discovered from unit hub)
    var nextWrap = null;
    if (typeof opts.onNext === "function") {
      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "la-finish-btn la-finish-btn-next";
      nextBtn.setAttribute("aria-label", opts.nextLabel || "Next game");
      nextBtn.title = opts.nextLabel || "Next game";
      nextBtn.textContent = "→";
      nextBtn.addEventListener("click", function () {
        hide();
        opts.onNext();
      });
      nextWrap = makeAction(nextBtn, "Next");
      actions.appendChild(nextWrap);
    } else if (opts.nextHref) {
      var nextLink = document.createElement("a");
      nextLink.href = opts.nextHref;
      nextLink.className = "la-finish-btn la-finish-btn-next";
      nextLink.setAttribute("aria-label", opts.nextLabel || "Next game");
      nextLink.title = opts.nextLabel || "Next game";
      nextLink.textContent = "→";
      nextWrap = makeAction(nextLink, "Next");
      actions.appendChild(nextWrap);
    } else if (opts.showNext !== false) {
      var autoLink = document.createElement("a");
      autoLink.href = "#";
      autoLink.className = "la-finish-btn la-finish-btn-next";
      autoLink.textContent = "→";
      nextWrap = makeAction(autoLink, "Next");
      nextWrap.hidden = true;
      actions.appendChild(nextWrap);

      findNextGameFromCourse().then(function (info) {
        if (seq !== showSeq || !info || !info.href) return;
        autoLink.href = info.href;
        autoLink.setAttribute("aria-label", "Next: " + info.title);
        autoLink.title = "Next: " + info.title;
        nextWrap.hidden = false;
      });
    }

    // Escape key behavior (collapse review list first, then modes/back/hide)
    activeEscHandler = function () {
      if (reviewListEl && !reviewListEl.hidden) {
        reviewListEl.hidden = true;
        if (reviewBtnEl) {
          reviewBtnEl.setAttribute("aria-expanded", "false");
          reviewBtnEl.focus();
        }
        return;
      }
      if (typeof opts.onModes === "function") {
        hide();
        opts.onModes();
      } else if (typeof opts.onBack === "function") {
        hide();
        opts.onBack();
      } else {
        hide(true);
      }
    };

    inner.appendChild(actions);
    card.appendChild(inner);
    overlay.appendChild(card);

    var shouldSound = soundOpt && !isMuted();
    var reduced = prefersReducedMotion();

    // Animate in + open sound
    requestAnimationFrame(function () {
      if (seq !== showSeq) return;
      overlay.classList.add("is-visible");
      if (shouldSound) playWhoosh();
    });

    // Accuracy ring + percentage counter
    var fg = ringWrap.querySelector(".la-finish-ring-fg");
    var pctLabel = ringWrap.querySelector(".la-finish-pct");
    var circumference = 2 * Math.PI * 45;
    fg.style.strokeDasharray = String(circumference);

    if (reduced) {
      fg.style.strokeDashoffset = String(circumference * (1 - accuracy / 100));
      pctLabel.textContent = accuracy + "%";
      starEls.forEach(function (el, idx) {
        el.classList.add("is-pop");
        if (idx < stars) el.classList.add("is-on");
      });
      if (shouldSound) playFanfare(stars);
    } else {
      fg.style.strokeDashoffset = String(circumference);
      addTimer(function () {
        if (seq !== showSeq) return;
        fg.style.strokeDashoffset = String(circumference * (1 - accuracy / 100));
      }, 120);

      var pctStart = performance.now();
      var pctDur = 900;
      function tickPct(now) {
        if (seq !== showSeq) return;
        var t = clamp((now - pctStart) / pctDur, 0, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        pctLabel.textContent = Math.round(accuracy * eased) + "%";
        if (t < 1) {
          pctRafId = requestAnimationFrame(tickPct);
        } else {
          pctRafId = 0;
        }
      }
      pctRafId = requestAnimationFrame(tickPct);

      starEls.forEach(function (el, idx) {
        addTimer(function () {
          if (seq !== showSeq) return;
          el.classList.add("is-pop");
          if (idx < stars) {
            el.classList.add("is-on");
            if (soundOpt && !isMuted()) playStarDing(idx);
          }
        }, 280 + idx * 220);
      });

      addTimer(function () {
        if (seq !== showSeq) return;
        if (soundOpt && !isMuted()) playFanfare(stars);
        if (stars >= 2) runConfetti(confetti, stars);
      }, 280 + stars * 220 + 80);
    }

    // Focus primary button for a11y
    addTimer(function () {
      if (seq !== showSeq) return;
      try { againBtn.focus(); } catch (e) {}
    }, reduced ? 40 : 380);

    return {
      stars: stars,
      accuracy: accuracy,
      timeMs: timeMs,
    };
  }

  /* ---------- public API ---------- */

  startTimer();

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
