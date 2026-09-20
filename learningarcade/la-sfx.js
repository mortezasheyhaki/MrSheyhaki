/**
 * Learning Arcade — shared UI sound effects (Web Audio, no files)
 *
 * Usage:
 *   <script src="/learningarcade/la-sfx.js"></script>
 *   LASfx.correct();  // right answer
 *   LASfx.wrong();    // wrong / negative feedback
 *   LASfx.win();      // game complete
 *   LASfx.click();    // soft UI tap
 *   LASfx.pop();      // chip / match pop
 */
(function (global) {
  "use strict";

  var audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (global.AudioContext || global.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (audioCtx.state === "suspended") {
      try { audioCtx.resume(); } catch (e) {}
    }
    return audioCtx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    var ctx = getCtx();
    if (!ctx) return;
    try {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 3200;
      o.type = type || "sine";
      var t0 = ctx.currentTime;
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) {
        o.frequency.linearRampToValueAtTime(slideTo, t0 + dur * 0.9);
      }
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol || 0.12), t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.03);
    } catch (e) {}
  }

  /** Soft buzz for negative feedback (two descending hits) */
  function buzz(freq, dur, vol) {
    var ctx = getCtx();
    if (!ctx) return;
    try {
      var t0 = ctx.currentTime;
      var o = ctx.createOscillator();
      var o2 = ctx.createOscillator();
      var g = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1800;
      o.type = "sawtooth";
      o2.type = "square";
      o.frequency.setValueAtTime(freq, t0);
      o.frequency.linearRampToValueAtTime(freq * 0.7, t0 + dur);
      o2.frequency.setValueAtTime(freq * 0.5, t0);
      o2.frequency.linearRampToValueAtTime(freq * 0.35, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol || 0.08), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(filter);
      o2.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      o.start(t0);
      o2.start(t0);
      o.stop(t0 + dur + 0.02);
      o2.stop(t0 + dur + 0.02);
    } catch (e) {}
  }

  function correct() {
    tone(523.25, 0.08, "sine", 0.11);
    setTimeout(function () { tone(659.25, 0.1, "sine", 0.11); }, 70);
    setTimeout(function () { tone(783.99, 0.16, "sine", 0.13); }, 140);
  }

  /** Clear negative feedback: low descending buzz + soft thud */
  function wrong() {
    buzz(180, 0.14, 0.09);
    setTimeout(function () { buzz(140, 0.18, 0.08); }, 100);
    setTimeout(function () { tone(110, 0.12, "triangle", 0.07); }, 160);
  }

  function win() {
    var notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.2, "sine", 0.11); }, i * 120);
    });
  }

  function click() {
    tone(880, 0.04, "sine", 0.06);
  }

  function pop() {
    tone(660, 0.05, "sine", 0.08, 990);
  }

  var api = {
    correct: correct,
    wrong: wrong,
    win: win,
    click: click,
    pop: pop,
    sfxCorrect: correct,
    sfxWrong: wrong,
    sfxWin: win,
    sfxClick: click,
    sfxPop: pop
  };

  global.LASfx = api;

  // Unlock audio on first user gesture (mobile browsers)
  function unlock() {
    var ctx = getCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    global.removeEventListener("pointerdown", unlock);
    global.removeEventListener("keydown", unlock);
  }
  global.addEventListener("pointerdown", unlock, { once: true });
  global.addEventListener("keydown", unlock, { once: true });
})(typeof window !== "undefined" ? window : this);
