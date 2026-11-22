/* UA Kit – shared sound, progress, mute and celebration for Teen2Teen 2 games.
   Exposes window.UAKit. Load before each game's script.js. */
(function () {
  "use strict";
  if (window.UAKit) return;

  var MUTE_KEY = "ua-muted";
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  /* ---------- sound ---------- */
  var ctx = null;
  function audio() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audio();
    if (!c) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  var SOUNDS = {
    tap:     function () { tone(640, 0.05, "triangle", 0.07); },
    select:  function () { tone(520, 0.07, "triangle", 0.09, 0, 700); },
    place:   function () { tone(480, 0.05, "triangle", 0.08); },
    undo:    function () { tone(420, 0.06, "triangle", 0.06, 0, 300); },
    next:    function () { tone(400, 0.12, "sine", 0.07, 0, 620); },
    tick:    function () { tone(1200, 0.03, "square", 0.03); },
    flip:    function () { tone(780, 0.1, "sine", 0.07, 0, 1040); },
    correct: function () {
      tone(523.25, 0.09, "triangle", 0.12);
      tone(659.25, 0.1, "triangle", 0.11, 0.07);
      tone(783.99, 0.16, "sine", 0.1, 0.14);
    },
    wrong:   function () { tone(230, 0.12, "square", 0.06, 0, 170); tone(170, 0.18, "square", 0.05, 0.1, 120); },
    win:     function () {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        tone(f, 0.22, "triangle", 0.12, i * 0.1);
      });
      tone(1318.5, 0.5, "sine", 0.08, 0.45);
    },
    heartbreak: function () { tone(330, 0.16, "sawtooth", 0.07); tone(220, 0.32, "sawtooth", 0.06, 0.12, 150); },
    lose:    function () { tone(392, 0.25, "sine", 0.09); tone(330, 0.25, "sine", 0.09, 0.22); tone(262, 0.45, "sine", 0.09, 0.44); }
  };

  function sfx(name) {
    if (muted || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) {}
  }

  function isMuted() { return muted; }
  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
    document.querySelectorAll("[data-ua-mute]").forEach(paintMute);
  }

  /* ---------- markup helpers ---------- */
  var ICON_ON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.5 12a4.5 4.5 0 0 0-2.5-4v2.2l2.4 2.4c.1-.3.1-.6.1-.6zM19 12a7 7 0 0 1-.8 3.2l1.5 1.5A9 9 0 0 0 21 12c0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.6 5 6.7zM4.3 3 3 4.3 7.7 9H3v6h4l5 4v-6.3l4.3 4.3c-.7.5-1.4.9-2.3 1.2v2.1a9 9 0 0 0 3.6-1.8L19.7 21 21 19.7l-9-9L4.3 3zM12 4 9.9 6.1 12 8.2V4z"/></svg>';

  function paintMute(btn) {
    btn.innerHTML = muted ? ICON_OFF : ICON_ON;
    btn.setAttribute("aria-pressed", muted ? "true" : "false");
    btn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    btn.classList.toggle("is-muted", muted);
  }

  function muteButtonHTML() {
    return '<button type="button" class="ua-icon-btn ua-mute" data-ua-mute aria-label="Mute sound"></button>';
  }

  /* Top bar + animated progress bar. pct: 0–100 */
  function topbarHTML(o) {
    var back = o.back || "../";
    return (
      '<header class="ua-top">' +
        '<a class="ua-icon-btn" href="' + back + '" aria-label="Back to games">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M15.4 4.6 8 12l7.4 7.4 1.4-1.4L10.8 12l6-6z"/></svg>' +
        "</a>" +
        '<div class="ua-top-mid">' +
          '<span class="ua-kicker">' + (o.kicker || "Teen2Teen 2 · Unit 2") + "</span>" +
          '<span class="ua-title">' + o.title + "</span>" +
        "</div>" +
        (o.extra || "") +
        (o.count ? '<span class="ua-count">' + o.count + "</span>" : "") +
        muteButtonHTML() +
      "</header>" +
      '<div class="ua-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
        Math.round(o.pct || 0) + '" data-pct="' + (o.pct || 0) + '"><i></i></div>'
    );
  }

  var lastPct = {};
  /* Call after writing app.innerHTML. Animates the bar from its previous value. */
  function afterRender(root, key) {
    if (!root) return;
    root.querySelectorAll("[data-ua-mute]").forEach(paintMute);
    var bar = root.querySelector(".ua-bar");
    if (!bar) return;
    var fill = bar.querySelector("i");
    var to = parseFloat(bar.getAttribute("data-pct")) || 0;
    var from = lastPct[key || "default"];
    if (from === undefined) from = to;
    fill.style.width = from + "%";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fill.style.width = to + "%"; });
    });
    lastPct[key || "default"] = to;
  }

  /* Update bar width in place (no re-render) */
  function setProgress(root, pct) {
    var bar = root && root.querySelector(".ua-bar");
    if (!bar) return;
    bar.setAttribute("data-pct", pct);
    bar.setAttribute("aria-valuenow", Math.round(pct));
    bar.querySelector("i").style.width = pct + "%";
  }

  /* Bind mute buttons once per page */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-ua-mute]");
    if (!b) return;
    setMuted(!muted);
    sfx("tap");
  });

  /* ---------- celebration ---------- */
  function celebrate(host) {
    if (!host) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#f97316"];
    var layer = document.createElement("div");
    layer.className = "ua-confetti";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 46; i++) {
      var p = document.createElement("i");
      p.style.left = (Math.random() * 100) + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.animationDuration = (1.8 + Math.random() * 1.4) + "s";
      p.style.transform = "rotate(" + Math.round(Math.random() * 360) + "deg)";
      layer.appendChild(p);
    }
    host.appendChild(layer);
    setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 4000);
  }

  /* Result card. opts: { score, total, stars, title, backHref, againId } */
  function doneHTML(o) {
    var s = o.stars || 0;
    var msg = o.message || ["Keep practising!", "Good effort!", "Great work!", "Perfect!"][s];
    var stars = [1, 2, 3].map(function (n, i) {
      return '<span class="' + (n <= s ? "on" : "") + '" style="animation-delay:' + (0.15 + i * 0.14) + 's">★</span>';
    }).join("");
    return (
      '<section class="ua-card ua-done ua-screen">' +
        '<div class="ua-hero" aria-hidden="true">' + (s === 3 ? "🏆" : "🎉") + "</div>" +
        "<h1>" + msg + "</h1>" +
        '<div class="ua-stars" aria-label="' + s + ' of 3 stars">' + stars + "</div>" +
        '<p class="ua-score">' + (o.scoreText || (o.score + " / " + o.total + " correct")) + "</p>" +
        '<div class="ua-done-actions">' +
          '<button type="button" class="ua-btn" id="' + (o.againId || "ua-again") + '">Play again</button>' +
          '<a class="ua-btn ua-btn--ghost" href="' + (o.backHref || "../") + '">Back to games</a>' +
        "</div>" +
      "</section>"
    );
  }

  /* Small feedback flash on an element (class-based, restarts cleanly) */
  function flash(el, kind) {
    if (!el) return;
    var cls = kind === "bad" ? "ua-shake" : "ua-pulse";
    el.classList.remove("ua-shake", "ua-pulse");
    void el.offsetWidth;
    el.classList.add(cls);
  }

  window.UAKit = {
    sfx: sfx,
    isMuted: isMuted,
    setMuted: setMuted,
    topbar: topbarHTML,
    afterRender: afterRender,
    setProgress: setProgress,
    muteButton: muteButtonHTML,
    celebrate: celebrate,
    done: doneHTML,
    flash: flash,
    unlock: function () { audio(); }
  };
})();
