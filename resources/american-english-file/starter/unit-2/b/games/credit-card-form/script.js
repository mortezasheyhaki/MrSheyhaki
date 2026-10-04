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

/* Credit Card Application Form – 2-part game – AEF Starter Unit 2B */
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


  const GAME_ID = "starter-2b-credit-card-form";

  // Questions ordered by form numbers 1–8
  const QUESTIONS = [
    {
      id: 1,
      q: "What's your name?",
      field: "name",
      hint: "Write a full sentence.",
      model: function (d) {
        const n = (d.firstName + " " + d.lastName).trim();
        return n ? "My name's " + n + "." : "My name's …";
      },
      check: function (val, d) {
        const n = (d.firstName + " " + d.lastName).trim().toLowerCase();
        const v = val.toLowerCase();
        return n && (v.indexOf(d.firstName.toLowerCase()) !== -1 || v.indexOf("my name") !== -1);
      }
    },
    {
      id: 2,
      q: "How old are you?",
      field: "age",
      hint: "Write a full sentence.",
      model: function (d) { return d.age ? "I'm " + d.age + "." : "I'm …"; },
      check: function (val, d) {
        const v = val.toLowerCase();
        return d.age && (v.indexOf(String(d.age)) !== -1);
      }
    },
    {
      id: 3,
      q: "Are you married?",
      field: "status",
      hint: "Write a full sentence (Yes / No).",
      model: function (d) {
        if (d.status === "married") return "Yes, I am.";
        if (d.status === "single") return "No, I'm single.";
        if (d.status === "divorced") return "No, I'm divorced / separated.";
        return "Yes, I am. / No, I'm single.";
      },
      check: function (val, d) {
        const v = val.toLowerCase();
        if (d.status === "married") return v.indexOf("yes") !== -1 || v.indexOf("married") !== -1;
        if (d.status === "single") return v.indexOf("single") !== -1 || (v.indexOf("no") !== -1 && v.indexOf("married") === -1);
        if (d.status === "divorced") return v.indexOf("divorced") !== -1 || v.indexOf("separated") !== -1 || v.indexOf("no") !== -1;
        return v.length > 2;
      }
    },
    {
      id: 4,
      q: "What's your address?",
      field: "address",
      hint: "You can start with \"It's\" or \"My address is\".",
      model: function (d) { return d.address ? "It's " + d.address + "." : "It's …"; },
      check: function (val, d) {
        const v = val.toLowerCase();
        return d.address && v.indexOf(d.address.toLowerCase().slice(0, 6)) !== -1;
      }
    },
    {
      id: 5,
      q: "What's your zip code?",
      field: "zip",
      hint: "Start with \"It's\".",
      model: function (d) { return d.zip ? "It's " + d.zip + "." : "It's …"; },
      check: function (val, d) {
        const v = val.toLowerCase().replace(/\s/g, "");
        return d.zip && v.indexOf(String(d.zip).toLowerCase()) !== -1 && v.indexOf("it") !== -1;
      }
    },
    {
      id: 6,
      q: "What's your email?",
      field: "email",
      hint: "Start with \"It's\".",
      model: function (d) { return d.email ? "It's " + d.email + "." : "It's …"; },
      check: function (val, d) {
        const v = val.toLowerCase().replace(/\s/g, "");
        return d.email && v.indexOf(d.email.toLowerCase().split("@")[0]) !== -1 && v.indexOf("it") !== -1;
      }
    },
    {
      id: 7,
      q: "What's your home phone number?",
      field: "home",
      hint: "Start with \"It's\".",
      model: function (d) { return d.home ? "It's " + d.home + "." : "It's …"; },
      check: function (val, d) {
        const digits = String(val).replace(/\D/g, "");
        const homeDigits = String(d.home || "").replace(/\D/g, "");
        const v = val.toLowerCase();
        return homeDigits && digits.indexOf(homeDigits.slice(0, 6)) !== -1 && v.indexOf("it") !== -1;
      }
    },
    {
      id: 8,
      q: "What's your cell phone number?",
      field: "cell",
      hint: "Start with \"It's\".",
      model: function (d) { return d.cell ? "It's " + d.cell + "." : "It's …"; },
      check: function (val, d) {
        const digits = String(val).replace(/\D/g, "");
        const cellDigits = String(d.cell || "").replace(/\D/g, "");
        const v = val.toLowerCase();
        return cellDigits && digits.indexOf(cellDigits.slice(0, 6)) !== -1 && v.indexOf("it") !== -1;
      }
    }
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | form | questions | done
  let qIndex = 0;
  let score = 0;
  let data = {
    firstName: "", lastName: "", title: "",
    age: "", status: "",
    address: "", zip: "", email: "",
    home: "", cell: ""
  };
  let answers = {}; // qIndex -> user answer string

  function calcStars() {
    const r = score / QUESTIONS.length;
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

  function readForm() {
    data.firstName = (document.getElementById("f-first") || {}).value || "";
    data.lastName = (document.getElementById("f-last") || {}).value || "";
    const titleEl = document.querySelector('input[name="f-title"]:checked');
    data.title = titleEl ? titleEl.value : "";
    data.age = (document.getElementById("f-age") || {}).value || "";
    const statusEl = document.querySelector('input[name="f-status"]:checked');
    data.status = statusEl ? statusEl.value : "";
    data.address = (document.getElementById("f-address") || {}).value || "";
    data.zip = (document.getElementById("f-zip") || {}).value || "";
    data.email = (document.getElementById("f-email") || {}).value || "";
    data.home = (document.getElementById("f-home") || {}).value || "";
    data.cell = (document.getElementById("f-cell") || {}).value || "";
  }

  function formValid() {
    return data.firstName.trim() && data.lastName.trim() && data.age.trim() &&
      data.status && data.address.trim() && data.zip.trim() &&
      data.email.trim() && data.home.trim() && data.cell.trim();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Credit Card Form</span>' +
        '<span class="cc-badge">2B</span>' +
        "</header>" +
        '<section class="cc-menu">' +
        "<h1>Credit card application</h1>" +
        '<p class="cc-lead"><strong>Part 1:</strong> Complete the form.<br/><strong>Part 2:</strong> Answer the questions in full sentences.</p>' +
        '<div class="cc-start-card">' +
        "<p>2 parts · form + questions</p>" +
        '<button type="button" class="cc-btn" id="cc-start">Start</button>' +
        "</div>" +
        "</section>";
      document.getElementById("cc-start").onclick = function () {
        phase = "form";
        if (window.LAFinish) LAFinish.startTimer();
        render();
      };
      return;
    }

    if (phase === "form") {
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Part 1 · Form</span>' +
        '<span class="cc-badge">2B</span>' +
        "</header>" +
        '<div class="cc-form-wrap">' +
        '<div class="cc-form-card">' +
        '<div class="cc-form-header">CREDIT CARD Application form</div>' +

        '<div class="cc-field">' +
        '<span class="cc-num">1</span>' +
        '<div class="cc-field-body">' +
        '<label>First name</label>' +
        '<input type="text" id="f-first" class="cc-input" autocomplete="off" value="' + esc(data.firstName) + '" />' +
        '<label>Last name</label>' +
        '<input type="text" id="f-last" class="cc-input" autocomplete="off" value="' + esc(data.lastName) + '" />' +
        '<div class="cc-title-row">Title: ' +
        '<label class="cc-check"><input type="radio" name="f-title" value="Mr"' + (data.title === "Mr" ? " checked" : "") + ' /> Mr.</label> ' +
        '<label class="cc-check"><input type="radio" name="f-title" value="Ms"' + (data.title === "Ms" ? " checked" : "") + ' /> Ms.</label> ' +
        '<label class="cc-check"><input type="radio" name="f-title" value="Mrs"' + (data.title === "Mrs" ? " checked" : "") + ' /> Mrs.</label>' +
        "</div></div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">2</span>' +
        '<div class="cc-field-body">' +
        '<label>Age</label>' +
        '<input type="text" id="f-age" class="cc-input short" inputmode="numeric" autocomplete="off" value="' + esc(data.age) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">3</span>' +
        '<div class="cc-field-body">' +
        '<div class="cc-title-row">' +
        '<label class="cc-check"><input type="radio" name="f-status" value="married"' + (data.status === "married" ? " checked" : "") + ' /> Married</label> ' +
        '<label class="cc-check"><input type="radio" name="f-status" value="single"' + (data.status === "single" ? " checked" : "") + ' /> Single</label> ' +
        '<label class="cc-check"><input type="radio" name="f-status" value="divorced"' + (data.status === "divorced" ? " checked" : "") + ' /> Divorced / Separated</label>' +
        "</div></div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">4</span>' +
        '<div class="cc-field-body">' +
        '<label>Address</label>' +
        '<input type="text" id="f-address" class="cc-input" autocomplete="off" value="' + esc(data.address) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">5</span>' +
        '<div class="cc-field-body">' +
        '<label>Zip code</label>' +
        '<input type="text" id="f-zip" class="cc-input short" autocomplete="off" value="' + esc(data.zip) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">6</span>' +
        '<div class="cc-field-body">' +
        '<label>Email</label>' +
        '<input type="text" id="f-email" class="cc-input" autocomplete="off" value="' + esc(data.email) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">7</span>' +
        '<div class="cc-field-body">' +
        '<label>Phone number — home</label>' +
        '<input type="text" id="f-home" class="cc-input" inputmode="tel" autocomplete="off" value="' + esc(data.home) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">8</span>' +
        '<div class="cc-field-body">' +
        '<label>Cell phone</label>' +
        '<input type="text" id="f-cell" class="cc-input" inputmode="tel" autocomplete="off" value="' + esc(data.cell) + '" />' +
        "</div></div>" +

        "</div>" +
        '<p class="cc-form-msg" id="cc-form-msg"></p>' +
        '<button type="button" class="cc-btn" id="cc-to-q">Continue to questions →</button>' +
        "</div>";

      document.getElementById("cc-to-q").onclick = function () {
        readForm();
        if (!formValid()) {
          document.getElementById("cc-form-msg").textContent = "Please complete all fields.";
          document.getElementById("cc-form-msg").className = "cc-form-msg is-bad";
          return;
        }
        qIndex = 0;
        score = 0;
        answers = {};
        phase = "questions";
        render();
      };
      return;
    }

    if (phase === "questions") {
      const item = QUESTIONS[qIndex];
      const prev = answers[qIndex] || "";
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Part 2 · Questions</span>' +
        '<span class="cc-badge">' + (qIndex + 1) + "/" + QUESTIONS.length + "</span>" +
        "</header>" +
        '<div class="cc-progress"><span style="width:' + Math.round((qIndex / QUESTIONS.length) * 100) + '%"></span></div>' +
        '<div class="cc-q-stage">' +
        '<p class="cc-q-label">Question ' + item.id + "</p>" +
        '<p class="cc-q-text">' + item.q + "</p>" +
        '<p class="cc-q-hint">' + item.hint + "</p>" +
        '<textarea class="cc-answer" id="cc-answer" rows="2" placeholder="Write your answer…">' + esc(prev) + "</textarea>" +
        '<p class="cc-feedback" id="cc-feedback"></p>' +
        '<div class="cc-actions">' +
        '<button type="button" class="cc-btn secondary" id="cc-show">Show model</button>' +
        '<button type="button" class="cc-btn" id="cc-check">Check</button>' +
        "</div>" +
        "</div>";

      const ta = document.getElementById("cc-answer");
      setTimeout(function () { ta.focus(); }, 80);

      document.getElementById("cc-show").onclick = function () {
        document.getElementById("cc-feedback").textContent = "Model: " + item.model(data);
        document.getElementById("cc-feedback").className = "cc-feedback is-hint";
      };

      document.getElementById("cc-check").onclick = function () {
        const val = ta.value.trim();
        answers[qIndex] = val;
        const feedback = document.getElementById("cc-feedback");
        if (!val) {
          feedback.textContent = "Write a sentence.";
          feedback.className = "cc-feedback is-bad";
          return;
        }
        const ok = item.check(val, data);
        if (ok) { try{sfxCorrect();}catch(e){}
          score += 1;
          feedback.textContent = "Good!";
          feedback.className = "cc-feedback is-ok";
          ta.classList.add("is-ok");
        } else {
          feedback.textContent = "Check again. Model: " + item.model(data);
          feedback.className = "cc-feedback is-bad";
          ta.classList.add("is-bad");
        }
        setTimeout(function () {
          qIndex += 1;
          if (qIndex >= QUESTIONS.length) {
            phase = "done";
          }
          render();
        }, ok ? 700 : 1400);
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
          score: score,
          total: QUESTIONS.length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'menu'; render(); },
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'menu'; render(); };
      return;
    }
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  render();
})();
