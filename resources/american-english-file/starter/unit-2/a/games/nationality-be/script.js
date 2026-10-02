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
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
window.ArcadeFX && (ArcadeFX.noMilestone = true);

/* Nationalities + be · Part A Q&A · Part B Make questions · Unit 2A */
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
  function sfxTap() { tone(520, 0.06, "triangle", 0.08); }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok();
    tone(523, 0.1, "sine", 0.12, 0);
    tone(659, 0.12, "sine", 0.12, 0.08);
    tone(784, 0.18, "sine", 0.1, 0.16);
  }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad();
    tone(220, 0.14, "sawtooth", 0.07, 0);
    tone(180, 0.18, "sawtooth", 0.06, 0.1);
  }
  function sfxCelebrate() {
    [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.15, "sine", 0.1, i * 0.07); });
  }
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


  const GAME_ID = "starter-2a-nationality-be";

  // Part A: complete the question (Is/Are) + write the answer
  const PART_A = [
    {
      img: "https://cdn.imgurl.ir/uploads/y7040_sushi.png",
      tip: "Negative · it",
      tipType: "neg",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "sushi Chinese?" },
      ],
      hint: "Japanese",
      answerAccept: [
        "no it isn't",
        "no it is not",
        "no it isn't it's japanese",
        "no it is not it's japanese",
        "no it's japanese",
        "no it isn't it is japanese",
      ],
      answerModel: "No, it isn't. It's Japanese.",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/s16299_rolling-stones.png",
      tip: "Negative · they",
      tipType: "neg",
      qParts: [
        { blank: ["are"], model: "Are" },
        { t: "the Rolling Stones American?" },
      ],
      hint: "British",
      answerAccept: [
        "no they aren't",
        "no they are not",
        "no they aren't they're british",
        "no they are not they are british",
        "no they're british",
        "no they aren't they are british",
      ],
      answerModel: "No, they aren't. They're British.",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/p656560_mount-fuji.png",
      tip: "Positive · it",
      tipType: "pos",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "Mount Fuji Japanese?" },
      ],
      hint: "Yes",
      answerAccept: [
        "yes",
        "yes it is",
        "yes it is it's japanese",
        "yes it's japanese",
        "yes it is it is japanese",
      ],
      answerModel: "Yes, it is.",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/n245512_victoria-beckham.png",
      tip: "Negative · she",
      tipType: "neg",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "Victoria Beckham Canadian?" },
      ],
      hint: "British",
      answerAccept: [
        "no she isn't",
        "no she is not",
        "no she isn't she's british",
        "no she is not she is british",
        "no she's british",
        "no she isn't she is british",
      ],
      answerModel: "No, she isn't. She's British.",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/f30845_machu-picchu.png",
      tip: "Positive · it",
      tipType: "pos",
      qParts: [
        { blank: ["is"], model: "Is" },
        { t: "Machu Picchu Peruvian?" },
      ],
      hint: "Yes",
      answerAccept: [
        "yes",
        "yes it is",
        "yes it is it's peruvian",
        "yes it's peruvian",
      ],
      answerModel: "Yes, it is.",
    },
  ];

  // Part B: statement shown → make a question
  // Also accept Where ... from? forms
  const PART_B = [
    {
      img: "https://cdn.imgurl.ir/uploads/s98443_gisele.png",
      name: "Gisele Bündchen",
      statement: "Gisele Bündchen is Brazilian.",
      accept: [
        "is she brazilian",
        "is gisele brazilian",
        "is gisele bundchen brazilian",
        "is gisele bündchen brazilian",
        "where is she from",
        "where is gisele from",
        "where is gisele bundchen from",
        "where's she from",
        "where's gisele from",
      ],
      model: "Is she Brazilian?",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/e385348_hyundai.png",
      name: "Hyundai",
      statement: "Hyundai cars are Korean.",
      accept: [
        "are they korean",
        "are hyundai cars korean",
        "are hyundais korean",
        "where are they from",
        "where are hyundai cars from",
        "where are hyundais from",
      ],
      model: "Are they Korean?",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/i282290_tacos.png",
      name: "Tacos",
      statement: "Tacos are Mexican.",
      accept: [
        "are they mexican",
        "are tacos mexican",
        "where are they from",
        "where are tacos from",
      ],
      model: "Are they Mexican?",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/h672107_antonio-banderas.png",
      name: "Antonio Banderas",
      statement: "Antonio Banderas is Spanish.",
      accept: [
        "is he spanish",
        "is antonio spanish",
        "is antonio banderas spanish",
        "where is he from",
        "where is antonio from",
        "where is antonio banderas from",
        "where's he from",
        "where's antonio from",
      ],
      model: "Is he Spanish?",
    },
    {
      img: "https://cdn.imgurl.ir/uploads/i62187_coke-pepsi.png",
      name: "Coke and Pepsi",
      statement: "Coke and Pepsi are American.",
      accept: [
        "are they american",
        "are coke and pepsi american",
        "are pepsi and coke american",
        "where are they from",
        "where are coke and pepsi from",
      ],
      model: "Are they American?",
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let part = "a";
  let index = 0;
  let totalCorrect = 0;
  let totalPossible = 0;

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/bundchen|bündchen/g, "bundchen");
  }

  function matchAny(val, list) {
    const n = norm(val);
    if (!n) return false;
    let fixed = n
      .replace(/\bis not\b/g, "isn't")
      .replace(/\bare not\b/g, "aren't")
      .replace(/\bisnt\b/g, "isn't")
      .replace(/\barent\b/g, "aren't")
      .replace(/\btheyre\b/g, "they're")
      .replace(/\bshes\b/g, "she's")
      .replace(/\bits\b/g, "it's")
      .replace(/\bwheres\b/g, "where's");
    for (let i = 0; i < list.length; i++) {
      if (fixed === norm(list[i])) return true;
    }
    return false;
  }

  function calcStars() {
    if (!totalPossible) return 0;
    const r = totalCorrect / totalPossible;
    if (r >= 0.9) return 3;
    if (r >= 0.7) return 2;
    if (r >= 0.4) return 1;
    return 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function startPart(p) {
    if (window.LAFinish) LAFinish.startTimer();
    part = p;
    index = 0;
    totalCorrect = 0;
    // Part A: each item = 2 points (question blank + answer)
    totalPossible = p === "a" ? PART_A.length * 2 : PART_B.length;
    phase = p === "a" ? "play-a" : "play-b";
    render();
  }

  function advanceOrDone(len) {
    setTimeout(() => {
      if (index < len - 1) {
        index++;
        phase = part === "a" ? "play-a" : "play-b";
        render();
      } else {
        phase = "done";
        render();
      }
    }, 750);
  }

  function setOk(el) {
    if (!el) return;
    el.classList.remove("is-bad");
    el.classList.add("is-ok");
  }
  function setBad(el) {
    if (!el) return;
    el.classList.remove("is-ok");
    el.classList.add("is-bad");
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  }

  function checkPartA() {
    const item = PART_A[index];
    const qInp = app.querySelector(".nb-q-blank");
    const aInp = app.querySelector(".nb-a-blank");
    const qOk = matchAny(qInp.value, item.qParts.find((p) => p.blank).blank);
    const aOk = matchAny(aInp.value, item.answerAccept);

    const qWrap = qInp.closest(".nb-blank-wrap");
    const aWrap = aInp.closest(".nb-blank-wrap");
    const qBubble = app.querySelector(".nb-q-row");
    const aBubble = app.querySelector(".nb-a-row");

    if (qOk) setOk(qWrap);
    else setBad(qWrap);
    if (aOk) setOk(aWrap);
    else setBad(aWrap);

    if (qBubble) qBubble.classList.toggle("is-error", !qOk);
    if (aBubble) aBubble.classList.toggle("is-error", !aOk);

    const hint = document.getElementById("nb-hint");
    if (qOk && aOk) {
      totalCorrect += 2;
      qInp.disabled = true;
      aInp.disabled = true;
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("nb-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = index < PART_A.length - 1 ? "Great!" : "Done!";
      }
      advanceOrDone(PART_A.length);
    } else {
      if (hint) {
        hint.textContent = "Not quite — try again!";
        hint.classList.add("is-visible");
      }
      if (!qOk) {
        qInp.focus();
        qInp.select();
      } else {
        aInp.focus();
        aInp.select();
      }
    }
  }

  function checkPartB() {
    const item = PART_B[index];
    const inp = app.querySelector(".nb-q-make");
    const wrap = inp.closest(".nb-blank-wrap");
    const ok = matchAny(inp.value, item.accept);

    if (ok) { try{sfxCorrect();}catch(e){}
      setOk(wrap);
      totalCorrect += 1;
      inp.disabled = true;
      const hint = document.getElementById("nb-hint");
      if (hint) {
        hint.textContent = "";
        hint.classList.remove("is-visible");
      }
      const btn = document.getElementById("nb-check");
      if (btn) {
        btn.disabled = true;
        btn.textContent = index < PART_B.length - 1 ? "Great!" : "Done!";
      }
      advanceOrDone(PART_B.length);
    } else {
      setBad(wrap);
      const hint = document.getElementById("nb-hint");
      if (hint) {
        hint.textContent = "Not quite — try again!";
        hint.classList.add("is-visible");
      }
      inp.focus();
      inp.select();
    }
  }

  function bindInputs(checkFn) {
    app.querySelectorAll("input").forEach((inp, i, list) => {
      inp.addEventListener("input", () => {
        const wrap = inp.closest(".nb-blank-wrap");
        if (wrap) wrap.classList.remove("is-ok", "is-bad");
        const row = inp.closest(".nb-q-row, .nb-a-row");
        if (row) row.classList.remove("is-error");
        const hint = document.getElementById("nb-hint");
        if (hint) {
          hint.textContent = "";
          hint.classList.remove("is-visible");
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (i < list.length - 1) list[i + 1].focus();
          else document.getElementById("nb-check")?.click();
        }
      });
    });
    document.getElementById("nb-check").onclick = checkFn;
    const first = app.querySelector("input");
    if (first) first.focus();
  }

  function renderQParts(parts) {
    return parts
      .map((p) => {
        if (p.blank) {
          return (
            '<span class="nb-blank-wrap">' +
            '<input type="text" class="nb-q-blank" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…" maxlength="8" />' +
            "</span>"
          );
        }
        return '<span class="nb-words">' + p.t + "</span>";
      })
      .join(" ");
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="nb-topbar">' +
        '<a class="nb-back" href="../" aria-label="Back">←</a>' +
        '<span class="nb-title">Nationalities · be</span>' +
        '<span class="nb-badge">2A</span>' +
        "</header>" +
        '<section class="nb-start">' +
        '<div class="nb-hero" aria-hidden="true">🌍</div>' +
        "<h1>Nationalities &amp; <em>be</em></h1>" +
        '<p class="nb-desc">Practice questions and answers about countries and nationalities.</p>' +
        '<div class="nb-part-list">' +
        '<button type="button" class="nb-part-card" id="nb-part-a">' +
        '<span class="nb-part-num">A</span>' +
        "<div><strong>Complete &amp; answer</strong><p>Fill in <em>Is / Are</em> and write the answer</p></div>" +
        "</button>" +
        '<button type="button" class="nb-part-card" id="nb-part-b">' +
        '<span class="nb-part-num">B</span>' +
        "<div><strong>Make the questions</strong><p>Use the statement · try <em>Where … from?</em> too</p></div>" +
        "</button>" +
        "</div>" +
        "</section>";
      document.getElementById("nb-part-a").onclick = () => startPart("a");
      document.getElementById("nb-part-b").onclick = () => startPart("b");
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === "function" ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: totalCorrect,
          total: totalPossible,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startPart(part),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u2a-again">Again</button>`;
      document.getElementById("u2a-again").onclick = () => startPart(part);
      return;
    }

    if (phase === "play-a") {
      const item = PART_A[index];
      app.innerHTML =
        '<header class="nb-topbar">' +
        '<a class="nb-back" href="../" aria-label="Back">←</a>' +
        '<span class="nb-title">Part A · Complete &amp; answer</span>' +
        '<span class="nb-progress">' +
        (index + 1) +
        " / " +
        PART_A.length +
        "</span>" +
        "</header>" +
        '<div class="nb-play">' +
        '<div class="nb-pic-wrap"><img class="nb-pic" src="' +
        item.img +
        '" alt="" draggable="false" /></div>' +
        '<div class="nb-tip nb-tip--' +
        item.tipType +
        '">' +
        item.tip +
        "</div>" +
        '<div class="nb-q-row">' +
        '<div class="nb-bubble-text">' +
        renderQParts(item.qParts) +
        "</div>" +
        (item.hint
          ? '<span class="nb-side-hint">' + item.hint + "</span>"
          : "") +
        "</div>" +
        '<div class="nb-a-row">' +
        '<label class="nb-label">Your answer</label>' +
        '<span class="nb-blank-wrap nb-blank-wrap--wide">' +
        '<input type="text" class="nb-a-blank" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="e.g. No, it isn\'t. It\'s Japanese." maxlength="60" />' +
        "</span>" +
        "</div>" +
        '<p class="nb-hint" id="nb-hint" aria-live="polite"></p>' +
        '<div class="nb-actions"><button type="button" class="nb-btn" id="nb-check">Check</button></div>' +
        "</div>";
      bindInputs(checkPartA);
      return;
    }

    // play-b
    const item = PART_B[index];
    app.innerHTML =
      '<header class="nb-topbar">' +
      '<a class="nb-back" href="../" aria-label="Back">←</a>' +
      '<span class="nb-title">Part B · Make the question</span>' +
      '<span class="nb-progress">' +
      (index + 1) +
      " / " +
      PART_B.length +
      "</span>" +
      "</header>" +
      '<div class="nb-play">' +
      '<div class="nb-pic-wrap"><img class="nb-pic" src="' +
      item.img +
      '" alt="' +
      escapeAttr(item.name) +
      '" draggable="false" /></div>' +
      '<div class="nb-a-row">' +
      '<label class="nb-label">Write a question</label>' +
      '<span class="nb-blank-wrap nb-blank-wrap--wide">' +
      '<input type="text" class="nb-q-make" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Is he / she…? Are they…? Where … from?" maxlength="60" />' +
      "</span>" +
      "</div>" +
      '<div class="nb-statement">' +
      '<span class="nb-statement-label">Answer</span>' +
      "<p>" +
      item.statement +
      "</p>" +
      "</div>" +
      '<p class="nb-hint" id="nb-hint" aria-live="polite"></p>' +
      '<div class="nb-actions"><button type="button" class="nb-btn" id="nb-check">Check</button></div>' +
      "</div>";
    bindInputs(checkPartB);
  }

  render();
})();
