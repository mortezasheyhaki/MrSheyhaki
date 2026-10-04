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

/* Word Order Questions – 3 dialogues + drag & drop – AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-word-order-questions";

  const PARTS = [
    {
      title: "1 · Meeting with the baby",
      image: "https://cdn.imgurl.ir/uploads/z672370_1.png",
      lines: [
        { speaker: "Gill", text: "Hi Anna!" },
        { speaker: "Anna", text: "Hello Gill.", blank: 0 },
        { speaker: "Gill", text: "I'm fine, thanks.", blank: 1 },
        { speaker: "Anna", text: "He's Sammy, my little boy." },
        { speaker: "Gill", text: "", blank: 2 },
        { speaker: "Anna", text: "He's one." },
        { speaker: "Gill", text: "He's very nice." },
      ],
      questions: [
        { words: ["you", "How", "are"], answer: "How are you?", example: true },
        { words: ["he", "Who", "is"], answer: "Who is he?" },
        { words: ["old", "is", "How", "he"], answer: "How old is he?" },
      ],
    },
    {
      title: "2 · At reception",
      image: "https://cdn.imgurl.ir/uploads/w472027_2.png",
      lines: [
        { speaker: "Woman", text: "", blank: 0 },
        { speaker: "Boy", text: "Henry." },
        { speaker: "Woman", text: "OK.", blank: 1 },
        { speaker: "Boy", text: "Schultz." },
        { speaker: "Woman", text: "", blank: 2 },
        { speaker: "Boy", text: "S-C-H-U-L-T-Z." },
        { speaker: "Woman", text: "Oh, yes.", blank: 3 },
        { speaker: "Boy", text: "I'm 18." },
        { speaker: "Woman", text: "OK. That's fine." },
      ],
      questions: [
        { words: ["your", "first", "What's", "name"], answer: "What's your first name?" },
        { words: ["What's", "last name", "your"], answer: "What's your last name?" },
        { words: ["spell", "do", "How", "it", "you"], answer: "How do you spell it?" },
        { words: ["you", "old", "are", "How"], answer: "How old are you?" },
      ],
    },
    {
      title: "3 · On the phone",
      image: "https://cdn.imgurl.ir/uploads/866990_3.png",
      lines: [
        { speaker: "Woman 1", text: "", blank: 0 },
        { speaker: "Woman 2", text: "It's 72 Maple Street, Boston." },
        { speaker: "Woman 1", text: "", blank: 1 },
        { speaker: "Woman 2", text: "It's 02354." },
        { speaker: "Woman 1", text: "Thank you.", blank: 2 },
        { speaker: "Woman 2", text: "It's 617-555-7028." },
        { speaker: "Woman 1", text: "OK.", blank: 3 },
        { speaker: "Woman 2", text: "It's 781-555-3019." },
      ],
      questions: [
        { words: ["your", "address", "What's"], answer: "What's your address?" },
        { words: ["zip code", "What's", "your"], answer: "What's your zip code?" },
        { words: ["home", "What's", "phone", "your", "number"], answer: "What's your home phone number?" },
        { words: ["cell", "your", "number", "What's"], answer: "What's your cell number?" },
      ],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let partIndex = 0;
  let qIndex = 0;
  let built = [];
  let pool = [];
  let correctTotal = 0;
  let missed = false; // wrong attempt on the current question
  const TOTAL_Q = PARTS.reduce(function (n, p) { return n + p.questions.filter(function (q) { return !q.example; }).length; }, 0);
  let filled = {};

  // Drag state
  let drag = null; // { from: 'pool'|'built', index, wordIndex, ghost }

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function currentPart() { return PARTS[partIndex]; }
  function currentQ() { return currentPart().questions[qIndex]; }

  function startPart(i) {
    if (window.LAFinish && i === 0) LAFinish.startTimer();
    partIndex = i;
    qIndex = 0;
    filled = {};
    if (currentPart().questions[0] && currentPart().questions[0].example) {
      filled[0] = currentPart().questions[0].answer;
      qIndex = 1;
    }
    resetBuild();
    phase = "play";
    render();
  }

  function resetBuild() {
    built = [];
    const q = currentQ();
    if (!q) return;
    pool = shuffle(q.words.map(function (_, i) { return i; }));
  }

  function pickWord(poolIdx) {
    const wi = pool[poolIdx];
    if (wi === undefined) return;
    built.push(wi);
    pool.splice(poolIdx, 1);
    renderPlay(false);
  }

  function removeBuilt(bi) {
    if (bi < 0 || bi >= built.length) return;
    const wi = built.splice(bi, 1)[0];
    pool.push(wi);
    renderPlay(false);
  }

  function undoWord() {
    if (!built.length) return;
    removeBuilt(built.length - 1);
  }

  function check() {
    const q = currentQ();
    if (!q) return;
    const words = built.map(function (i) { return q.words[i]; });
    const attempt = words.join(" ");
    const normalized = attempt.charAt(0).toUpperCase() + attempt.slice(1);
    const ok =
      normalized === q.answer ||
      attempt.toLowerCase() === q.answer.toLowerCase().replace(/\?$/, "") ||
      normalized + "?" === q.answer;

    const feedback = document.getElementById("wo-feedback");
    if (ok) { try{sfxCorrect();}catch(e){}
      if (!missed) correctTotal += 1; // first-try answers only
      missed = false;
      filled[qIndex] = q.answer;
      if (feedback) {
        feedback.textContent = "Correct! " + q.answer;
        feedback.className = "wo-feedback is-ok";
      }
      setTimeout(function () {
        qIndex += 1;
        if (qIndex >= currentPart().questions.length) {
          if (partIndex + 1 < PARTS.length) {
            startPart(partIndex + 1);
          } else {
            phase = "done";
            render();
          }
        } else {
          resetBuild();
          render();
        }
      }, 900);
    } else {
      if (feedback) {
        missed = true;
        feedback.textContent = "Try again."; try{sfxWrong();}catch(e){}
        feedback.className = "wo-feedback is-bad";
      }
      const slot = document.getElementById("wo-slot");
      if (slot) {
        slot.classList.add("is-shake");
        setTimeout(function () { slot.classList.remove("is-shake"); }, 400);
      }
    }
  }

  function calcStars() {
    let total = 0;
    PARTS.forEach(function (p) {
      p.questions.forEach(function (q) { if (!q.example) total += 1; });
    });
    const r = correctTotal / total;
    if (r >= 1) return 3;
    if (r >= 0.75) return 2;
    if (r >= 0.5) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function dialogueHtml(part) {
    return part.lines.map(function (line) {
      let body = "";
      if (line.blank !== undefined) {
        if (filled[line.blank]) {
          body = '<span class="wo-filled">' + filled[line.blank] + "</span>";
        } else if (line.blank === qIndex) {
          body = '<span class="wo-blank is-active">________</span>';
        } else {
          body = '<span class="wo-blank">________</span>';
        }
        if (line.text) body = line.text + " " + body;
      } else {
        body = line.text;
      }
      return (
        '<div class="wo-line">' +
        '<span class="wo-speaker">' + line.speaker + "</span>" +
        '<span class="wo-text">' + body + "</span>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- Drag & drop (pointer events) ---------- */
  function clearDrag() {
    if (drag && drag.ghost && drag.ghost.parentNode) {
      drag.ghost.parentNode.removeChild(drag.ghost);
    }
    app.querySelectorAll(".wo-chip.is-ghost, .wo-chip.is-dragging").forEach(function (el) {
      el.classList.remove("is-ghost", "is-dragging");
    });
    const slot = document.getElementById("wo-slot");
    if (slot) slot.classList.remove("is-drag-over");
    drag = null;
  }

  function onPointerDown(e, from, index) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const chip = e.currentTarget;
    const wordIndex = from === "pool" ? pool[index] : built[index];
    const q = currentQ();
    if (wordIndex === undefined || !q) return;

    const rect = chip.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.className = "wo-drag-ghost";
    ghost.textContent = q.words[wordIndex];
    ghost.style.width = rect.width + "px";
    ghost.style.transform = "translate3d(" + rect.left + "px," + rect.top + "px,0) scale(1.06)";
    document.body.appendChild(ghost);

    chip.classList.add("is-ghost");
    drag = {
      from: from,
      index: index,
      wordIndex: wordIndex,
      ghost: ghost,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };

    chip.setPointerCapture && chip.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag) return;
    e.preventDefault();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.moved = true;
      drag.ghost.classList.add("is-dragging");
    }
    drag.ghost.style.transform = "translate3d(" + (e.clientX - drag.offsetX) + "px," + (e.clientY - drag.offsetY) + "px,0) scale(1.06)";

    const slot = document.getElementById("wo-slot");
    if (slot) {
      const r = slot.getBoundingClientRect();
      const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      slot.classList.toggle("is-drag-over", over && drag.from === "pool");
    }
  }

  function onPointerUp(e) {
    if (!drag) return;
    e.preventDefault();
    const slot = document.getElementById("wo-slot");
    const poolEl = app.querySelector(".wo-pool");

    if (!drag.moved) {
      // Tap
      if (drag.from === "pool") pickWord(drag.index);
      else removeBuilt(drag.index);
      clearDrag();
      return;
    }

    // Drop
    if (drag.from === "pool" && slot) {
      const r = slot.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        pickWord(drag.index);
        clearDrag();
        return;
      }
    }
    if (drag.from === "built" && poolEl) {
      const r = poolEl.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        removeBuilt(drag.index);
        clearDrag();
        return;
      }
    }
    clearDrag();
  }

  function bindDrag() {
    app.querySelectorAll(".wo-chip[data-pool]").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (e) {
        onPointerDown(e, "pool", +btn.dataset.pool);
      });
    });
    app.querySelectorAll(".wo-chip[data-built]").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (e) {
        onPointerDown(e, "built", +btn.dataset.built);
      });
    });
  }

  // Global move/up
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp, { passive: false });
  window.addEventListener("pointercancel", function () { clearDrag(); });

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="wo-topbar">' +
        '<a class="wo-back" href="../" aria-label="Back">←</a>' +
        '<span class="wo-title">Word Order</span>' +
        '<span class="wo-badge">2B</span>' +
        "</header>" +
        '<section class="wo-menu">' +
        "<h1>Put the words in order</h1>" +
        '<p class="wo-lead">Make questions · 3 conversations<br/><small style="opacity:.8">Tap or drag words</small></p>' +
        '<button type="button" class="wo-btn" id="wo-start">Start</button>' +
        "</section>";
      document.getElementById("wo-start").onclick = function () {
        correctTotal = 0;
        missed = false;
        startPart(0);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: correctTotal,
          total: TOTAL_Q,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { correctTotal = 0; missed = false; startPart(0); },
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => startPart(0);
      return;
    }

    renderPlay(true);
  }

  function renderPlay(full) {
    const part = currentPart();
    const q = currentQ();
    if (!q) return;

    const enter = full ? " wo-enter" : "";
    const slotWords = built.map(function (wi, bi) {
      return '<button type="button" class="wo-chip is-built' + enter + '" data-built="' + bi + '">' + q.words[wi] + "</button>";
    }).join("");

    const poolWords = pool.map(function (wi, pi) {
      return '<button type="button" class="wo-chip' + enter + '" data-pool="' + pi + '">' + q.words[wi] + "</button>";
    }).join("");

    const pct = Math.round(((partIndex + qIndex / part.questions.length) / PARTS.length) * 100);

    if (full) {
      app.innerHTML =
        '<header class="wo-topbar">' +
        '<a class="wo-back" href="../" aria-label="Back">←</a>' +
        '<span class="wo-title">' + part.title + "</span>" +
        '<span class="wo-badge">' + (partIndex + 1) + "/" + PARTS.length + "</span>" +
        "</header>" +
        '<div class="wo-progress"><span style="width:' + pct + '%"></span></div>' +
        '<div class="wo-scene">' +
        '<div class="wo-dialogue wo-animate-in">' + dialogueHtml(part) + "</div>" +
        '<div class="wo-photo"><img src="' + part.image + '" alt="" /></div>' +
        "</div>" +
        '<div class="wo-builder">' +
        '<p class="wo-hint">Tap or drag the words in the correct order.</p>' +
        '<div class="wo-slot" id="wo-slot">' + (slotWords || '<span class="wo-slot-ph">Build the question here</span>') + "</div>" +
        '<div class="wo-pool">' + poolWords + "</div>" +
        '<p class="wo-feedback" id="wo-feedback"></p>' +
        '<div class="wo-actions">' +
        '<button type="button" class="wo-btn secondary" id="wo-undo">Undo</button>' +
        '<button type="button" class="wo-btn secondary" id="wo-clear">Clear</button>' +
        '<button type="button" class="wo-btn" id="wo-check">Check</button>' +
        "</div>" +
        "</div>";
    } else {
      const builder = app.querySelector(".wo-builder");
      const dialogue = app.querySelector(".wo-dialogue");
      if (builder) {
        builder.innerHTML =
          '<p class="wo-hint">Tap or drag the words in the correct order.</p>' +
          '<div class="wo-slot" id="wo-slot">' + (slotWords || '<span class="wo-slot-ph">Build the question here</span>') + "</div>" +
          '<div class="wo-pool">' + poolWords + "</div>" +
          '<p class="wo-feedback" id="wo-feedback"></p>' +
          '<div class="wo-actions">' +
          '<button type="button" class="wo-btn secondary" id="wo-undo">Undo</button>' +
          '<button type="button" class="wo-btn secondary" id="wo-clear">Clear</button>' +
          '<button type="button" class="wo-btn" id="wo-check">Check</button>' +
          "</div>";
      }
      // dialogue unchanged while building words — skip re-render to avoid flicker
    }

    bindDrag();
    const undo = document.getElementById("wo-undo");
    const clear = document.getElementById("wo-clear");
    const checkBtn = document.getElementById("wo-check");
    if (undo) undo.onclick = undoWord;
    if (clear) clear.onclick = function () { resetBuild(); renderPlay(false); };
    if (checkBtn) checkBtn.onclick = check;
  }

  render();
})();
