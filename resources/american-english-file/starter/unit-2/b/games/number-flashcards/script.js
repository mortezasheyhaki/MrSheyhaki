/* ===== Arcade FX: progress bar, combo, milestone celebration ===== */
(function () {
  if (window.ArcadeFX) return;
  var streak = 0, best = 0, count = 0, lastPct = 0, ctx = null;
  var CHEERS = [["🌟","Awesome!","10 correct answers!"],["🚀","Superstar!","20 correct — unstoppable!"],["👑","Legend!","30 correct — the best of the best!"]];
  function tone(f, d, type, v, when) {
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(v || 0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  function label(n) { return n >= 10 ? "UNSTOPPABLE" : n >= 7 ? "ON FIRE" : n >= 5 ? "HOT STREAK" : n >= 3 ? "NICE" : ""; }
  function chip() {
    var el = document.getElementById("afx-combo");
    if (!el) { el = document.createElement("div"); el.id = "afx-combo"; el.className = "afx-combo"; document.body.appendChild(el); }
    return el;
  }
  function place(el) {
    el = el || document.getElementById("afx-combo");
    var app = (document.getElementById("game-app") || document.getElementById("app"));
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    if (a.offsetParent === null) a = app;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, a === app ? r.top + 64 : r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) { burst(CHEERS[Math.min(Math.floor(n / 10) - 1, 2)]); }
  function burst(c) {
    [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.1, i * 0.09); });
    tone(1568, 0.6, "sine", 0.08, 0.5);
    var ov = document.createElement("div"); ov.className = "afx-burst";
    var cols = ["#f59e0b", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#ef4444"], h = "";
    for (var i = 0; i < 44; i++) h += '<i style="left:' + Math.random() * 100 + "%;background:" + cols[i % 6] + ";animation-delay:" + (Math.random() * 0.35).toFixed(2) + "s;animation-duration:" + (1.3 + Math.random() * 0.9).toFixed(2) + 's"></i>';
    ov.innerHTML = h + '<div class="afx-card"><div class="afx-emoji">' + c[0] + '</div><div class="afx-title">' + c[1] + '</div><div class="afx-sub">' + c[2] + "</div></div>";
    document.body.appendChild(ov);
    setTimeout(function () { ov.classList.add("is-out"); }, 1900);
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 2300);
  }
  function hookRestart() {
    var L = window.LAFinish;
    if (L && L.startTimer && !L.__afx) { var st = L.startTimer; L.__afx = 1; L.startTimer = function () { api.reset(); return st.apply(this, arguments); }; }
  }
  var api = window.ArcadeFX = {
    track: null,
    snd: (function () {
      var lastT = 0;
      return {
        tap: function () { var n = Date.now(); if (n - lastT < 60) return; lastT = n; tone(880, 0.05, "sine", 0.06, 0); tone(1320, 0.04, "sine", 0.03, 0.02); },
        correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "triangle", 0.09, i * 0.07); }); tone(2093, 0.3, "sine", 0.03, 0.3); },
        wrong: function () { tone(311, 0.14, "sine", 0.09, 0); tone(233, 0.22, "triangle", 0.08, 0.1); },
        celebrate: function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.09, i * 0.08); }); tone(392, 0.7, "sine", 0.06, 0.1); }
      };
    })(),
    bar: function (pct) {
      var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
      var bar = app.querySelector(".afx-bar");
      if (!bar) {
        var anchor = app.querySelector('[id*="rogress"]') || app.querySelector("header"); if (!anchor) return;
        var host = anchor.closest("header") || anchor.parentElement;
        bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
        host.parentNode.insertBefore(bar, host.nextSibling);
      }
      var fill = bar.firstChild; lastPct = pct;
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
    },
    ok: function () {
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0 && !api.noMilestone) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    cheer: function (i, n, sub) {
      var T = [["🎉", "Great job!"], ["🌟", "Brilliant!"], ["🏆", "Champion!"]];
      var c = T[i >= n - 1 && n > 1 ? 2 : Math.min(i, 1)];
      burst([c[0], c[1], sub || ("Part " + (i + 1) + " of " + n + " complete")]);
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"],[id*="rogress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
      if (/^(?:[A-Za-z]{1,9}\s*)?\d+\s*(?:\/|of)\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class$="-track"],[class*="-bar-fill"],[class*="-track-fill"],[class*="-progress-fill"]')) return;
    if (!badge && api.track) { try { api.bar(api.track()); } catch (e) {} return; }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(?:[A-Za-z]{1,9}\s*)?(\d+)\s*(?:\/|of)\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
    if (!bar) {
      var host = badge.closest("header") || badge.parentElement;
      bar = document.createElement("div"); bar.className = "afx-bar"; bar.innerHTML = '<i style="width:' + lastPct + '%"></i>';
      host.parentNode.insertBefore(bar, host.nextSibling);
    }
    var fill = bar.firstChild; lastPct = pct;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = pct + "%"; }); });
  }
  var q = 0;
  function start() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("button, [role=button], .mc-left-item, .mc-right-item") : null;
      if (t && !t.disabled) api.snd.tap();
    }, true);
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Number Flashcards – 11–20 + tens to 100 – AEF Starter Unit 2B */
(function () {

/* === Shared UI sound effects (Web Audio) === */
(function () {
  if (window.__laUiSfx) return;
  var ctx = null;
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    var c = getCtx();
    if (!c) return;
    var t0 = (when || 0) + c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxTap() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () { tone(520, 0.06, "triangle", 0.08); })(); }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  })(); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  })(); }
  function sfxCelebrate() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  })(); }
  window.__laUiSfx = { tap: sfxTap, correct: sfxCorrect, wrong: sfxWrong, celebrate: sfxCelebrate };
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  var lastAt = 0, lastKind = "";
  function fire(kind, fn) {
    var now = Date.now();
    if (kind === lastKind && now - lastAt < 80) return;
    lastKind = kind; lastAt = now;
    try { fn(); } catch (e) {}
  }
  try {
    var origAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function () {
      var tokens = Array.prototype.slice.call(arguments);
      var r = origAdd.apply(this, tokens);
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) {
        fire("correct", sfxCorrect);
      } else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) {
        fire("wrong", sfxWrong);
      }
      return r;
    };
  } catch (e) {}
})();


  const GAME_ID = "starter-2b-number-flashcards";

  const CARDS = [
    { num: "11", word: "eleven", audio: "https://cdn.imgurl.ir/uploads/h791947_11.mp3" },
    { num: "12", word: "twelve", audio: "https://cdn.imgurl.ir/uploads/h46631_12.mp3" },
    { num: "13", word: "thirteen", audio: "https://cdn.imgurl.ir/uploads/o209826_13.mp3" },
    { num: "14", word: "fourteen", audio: "https://cdn.imgurl.ir/uploads/u43290_14.mp3" },
    { num: "15", word: "fifteen", audio: "https://cdn.imgurl.ir/uploads/e012004_15.mp3" },
    { num: "16", word: "sixteen", audio: "https://cdn.imgurl.ir/uploads/a742_16.mp3" },
    { num: "17", word: "seventeen", audio: "https://cdn.imgurl.ir/uploads/n235443_17.mp3" },
    { num: "18", word: "eighteen", audio: "https://cdn.imgurl.ir/uploads/v36087_18.mp3" },
    { num: "19", word: "nineteen", audio: "https://cdn.imgurl.ir/uploads/e896460_19.mp3" },
    { num: "20", word: "twenty", audio: "https://cdn.imgurl.ir/uploads/h0809_20.mp3" },
    { num: "30", word: "thirty", audio: "https://cdn.imgurl.ir/uploads/p10946_30.mp3" },
    { num: "40", word: "forty", audio: "https://cdn.imgurl.ir/uploads/n25017_40.mp3" },
    { num: "50", word: "fifty", audio: "https://cdn.imgurl.ir/uploads/t431226_50.mp3" },
    { num: "60", word: "sixty", audio: "https://cdn.imgurl.ir/uploads/l198108_60.mp3" },
    { num: "70", word: "seventy", audio: "https://cdn.imgurl.ir/uploads/x326748_70.mp3" },
    { num: "80", word: "eighty", audio: "https://cdn.imgurl.ir/uploads/x153920_80.mp3" },
    { num: "90", word: "ninety", audio: "https://cdn.imgurl.ir/uploads/s491128_90.mp3" },
    { num: "100", word: "a hundred", audio: "https://cdn.imgurl.ir/uploads/r297360_100.mp3" },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let index = 0;
  let flipped = false;
  let busy = false;
  let currentAudio = null;
  let seen = {};
  let dragStartX = null;
  let dragDelta = 0;

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    const btn = app.querySelector(".fc-play");
    if (btn) btn.classList.remove("playing");
  }

  function playAudio() {
    const card = CARDS[index];
    if (!card || !card.audio) return;
    stopAudio();
    const a = new Audio(card.audio);
    currentAudio = a;
    const btn = app.querySelector(".fc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(function () {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = function () {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
    };
  }

  function goTo(next, dir) {
    if (busy) return;
    if (next < 0 || next >= CARDS.length || next === index) return;
    busy = true;
    stopAudio();
    flipped = false;

    const wrap = app.querySelector(".fc-card-wrap");
    if (wrap) {
      wrap.classList.add(dir === "left" ? "is-exit-left" : "is-exit-right");
    }

    setTimeout(function () {
      index = next;
      seen[index] = true;
      render(dir === "left" ? "right" : "left");
      busy = false;
      // Auto-play audio for the new card
      setTimeout(playAudio, 80);
    }, 260);
  }

  function next() {
    if (index >= CARDS.length - 1) {
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer ? LAFinish.stopTimer() : null;
        if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, 3); }
        LAFinish.show({
          gameId: GAME_ID,
          score: CARDS.length,
          total: CARDS.length,
          stars: 3,
          timeMs: timeMs,
          onAgain: function () { index = 0; flipped = false; render(); if (window.LAFinish) LAFinish.startTimer(); },
          onModes: function () { index = 0; flipped = false; render(); },
          backHref: "../",
          save: false,
        });
      }
      return;
    }
    goTo(index + 1, "left");
  }
  function prev() { goTo(index - 1, "right"); }

  function flip() {
    if (busy) return;
    flipped = !flipped;
    const card = app.querySelector(".fc-card");
    if (card) card.classList.toggle("is-flipped", flipped);
    const hint = app.querySelector(".fc-hint");
    if (hint) hint.textContent = flipped ? "Tap to see the number" : "Tap to see the word";
  }

  function bindSwipe(wrap) {
    function onStart(x) {
      if (busy) return;
      dragStartX = x;
      dragDelta = 0;
      wrap.classList.add("is-dragging");
    }
    function onMove(x) {
      if (dragStartX === null) return;
      dragDelta = x - dragStartX;
      wrap.style.transform = "translateX(" + dragDelta + "px) rotate(" + dragDelta * 0.04 + "deg)";
      wrap.style.opacity = String(Math.max(0.4, 1 - Math.abs(dragDelta) / 280));
    }
    function onEnd() {
      if (dragStartX === null) return;
      wrap.classList.remove("is-dragging");
      const dx = dragDelta;
      dragStartX = null;
      dragDelta = 0;
      wrap.style.transform = "";
      wrap.style.opacity = "";
      if (dx < -60) next();
      else if (dx > 60) prev();
    }

    wrap.addEventListener("touchstart", function (e) {
      onStart(e.changedTouches[0].clientX);
    }, { passive: true });
    wrap.addEventListener("touchmove", function (e) {
      onMove(e.changedTouches[0].clientX);
    }, { passive: true });
    wrap.addEventListener("touchend", onEnd);

    wrap.addEventListener("mousedown", function (e) {
      onStart(e.clientX);
      function mm(ev) { onMove(ev.clientX); }
      function mu() {
        window.removeEventListener("mousemove", mm);
        window.removeEventListener("mouseup", mu);
        onEnd();
      }
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", mu);
    });
  }

  function render(enterDir) {
    const card = CARDS[index];
    seen[index] = true;
    const pct = ((index + 1) / CARDS.length) * 100;

    const dots = CARDS.map(function (_, i) {
      var cls = "fc-dot";
      if (i === index) cls += " is-active";
      else if (seen[i]) cls += " is-seen";
      return '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="Card ' + (i + 1) + '"></button>';
    }).join("");

    app.innerHTML =
      '<header class="fc-topbar">' +
      '<a class="fc-back-btn" href="../" aria-label="Back">←</a>' +
      '<span class="fc-title">Number Flashcards</span>' +
      '<span class="fc-badge">' + (index + 1) + " / " + CARDS.length + "</span>" +
      "</header>" +
      '<div class="fc-progress-track"><div class="fc-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="fc-stage">' +
      '<div class="fc-card-wrap' + (enterDir ? " is-enter-" + enterDir : "") + '">' +
      '<div class="fc-card' + (flipped ? " is-flipped" : "") + '" id="fc-card">' +
      '<div class="fc-face fc-front">' +
      '<span class="fc-label">Number</span>' +
      '<span class="fc-num">' + card.num + "</span>" +
      "</div>" +
      '<div class="fc-face fc-back">' +
      '<span class="fc-label">Word</span>' +
      '<span class="fc-word">' + card.word + "</span>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<p class="fc-hint">' + (flipped ? "Tap to see the number" : "Tap to see the word") + "</p>" +
      "</div>" +
      '<div class="fc-controls">' +
      '<button type="button" class="fc-nav" id="fc-prev" aria-label="Previous"' +
      (index === 0 ? " disabled" : "") +
      '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<button type="button" class="fc-play" id="fc-play" aria-label="Play audio">' +
      '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
      "</button>" +
      '<button type="button" class="fc-nav" id="fc-next" aria-label="Next"' +
      (index === CARDS.length - 1 ? " disabled" : "") +
      '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      "</div>" +
      '<div class="fc-dots">' + dots + "</div>";

    const wrap = app.querySelector(".fc-card-wrap");
    const cardEl = document.getElementById("fc-card");
    cardEl.addEventListener("click", function (e) {
      // ignore if finishing a drag
      if (Math.abs(dragDelta) > 8) return;
      flip();
    });
    document.getElementById("fc-prev").onclick = prev;
    document.getElementById("fc-next").onclick = next;
    document.getElementById("fc-play").onclick = function (e) {
      e.stopPropagation();
      playAudio();
    };
    app.querySelectorAll(".fc-dot").forEach(function (d) {
      d.onclick = function () {
        var i = +d.dataset.i;
        if (i === index) return;
        goTo(i, i > index ? "left" : "right");
      };
    });
    bindSwipe(wrap);

    // keyboard
    // (bound once below)

    if (enterDir) {
      setTimeout(function () {
        wrap.classList.remove("is-enter-left", "is-enter-right");
      }, 350);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " ") {
      if (e.key === " ") { e.preventDefault(); flip(); }
      else next();
    } else if (e.key === "ArrowLeft") {
      prev();
    } else if (e.key === "ArrowUp" || e.key === "p" || e.key === "P") {
      playAudio();
    }
  });

  render();
})();
