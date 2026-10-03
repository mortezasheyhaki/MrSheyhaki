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

/* Where do they work? – AEF Starter Unit 6A
   Part 1: chip sentence builder (+ 2 distractors)
   Part 2: write the full answer */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-where-do-they-work";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  var ITEMS = [
    {
      id: "teacher",
      job: "a teacher",
      place: "in a school",
      question: "Where does a teacher work?",
      sentence: "A teacher works in a school.",
      tokens: ["A", "teacher", "works", "in", "a", "school"],
      image: CDN + "i20924_1_a_teacher_works_in_a_school.png"
    },
    {
      id: "doctor",
      job: "a doctor",
      place: "in a hospital",
      question: "Where does a doctor work?",
      sentence: "A doctor works in a hospital.",
      tokens: ["A", "doctor", "works", "in", "a", "hospital"],
      image: CDN + "y769515_2_A_doctor_works_in_a_hospital.png"
    },
    {
      id: "nurse",
      job: "a nurse",
      place: "in a hospital",
      question: "Where does a nurse work?",
      sentence: "A nurse works in a hospital.",
      tokens: ["A", "nurse", "works", "in", "a", "hospital"],
      image: CDN + "r871_3_A_nurse_works_in_a_hospital.png"
    },
    {
      id: "journalist",
      job: "a journalist",
      place: "on the street",
      question: "Where does a journalist work?",
      sentence: "A journalist works on the street.",
      tokens: ["A", "journalist", "works", "on", "the", "street"],
      image: CDN + "l3945_4_A_journalist_works_on_the_street.png"
    },
    {
      id: "waiter",
      job: "a waiter",
      place: "in a restaurant",
      question: "Where does a waiter work?",
      sentence: "A waiter works in a restaurant.",
      tokens: ["A", "waiter", "works", "in", "a", "restaurant"],
      image: CDN + "o736230_5_A_waiter_works_in_a_restaurant.png"
    },
    {
      id: "waitress",
      job: "a waitress",
      place: "in a restaurant",
      question: "Where does a waitress work?",
      sentence: "A waitress works in a restaurant.",
      tokens: ["A", "waitress", "works", "in", "a", "restaurant"],
      image: CDN + "s569263_6_A_waitress_works_in_a_restaurant.png"
    },
    {
      id: "salesperson",
      job: "a salesperson",
      place: "in a store",
      question: "Where does a salesperson work?",
      sentence: "A salesperson works in a store.",
      tokens: ["A", "salesperson", "works", "in", "a", "store"],
      image: CDN + "g29487_7_A_salesperson_works_in_a_store.png"
    },
    {
      id: "receptionist",
      job: "a receptionist",
      place: "in an office",
      question: "Where does a receptionist work?",
      sentence: "A receptionist works in an office.",
      tokens: ["A", "receptionist", "works", "in", "an", "office"],
      image: CDN + "w112284_8_A_receptionist_works_in_an_office.png"
    },
    {
      id: "policeman",
      job: "a policeman",
      place: "on the street",
      question: "Where does a policeman work?",
      sentence: "A policeman works on the street.",
      tokens: ["A", "policeman", "works", "on", "the", "street"],
      image: CDN + "k7526_9_A_policeman_works_on_the_street.png"
    },
    {
      id: "policewoman",
      job: "a policewoman",
      place: "on the street",
      question: "Where does a policewoman work?",
      sentence: "A policewoman works on the street.",
      tokens: ["A", "policewoman", "works", "on", "the", "street"],
      image: CDN + "p930126_10_A_policewoman_works_on_the_street.png"
    },
    {
      id: "factory-worker",
      job: "a factory worker",
      place: "in a factory",
      question: "Where does a factory worker work?",
      sentence: "A factory worker works in a factory.",
      tokens: ["A", "factory", "worker", "works", "in", "a", "factory"],
      image: CDN + "u651019_11_A_factory_worker_works_in_a_factory.png"
    },
    {
      id: "taxi-driver",
      job: "a taxi driver",
      place: "on the street",
      question: "Where does a taxi driver work?",
      sentence: "A taxi driver works on the street.",
      tokens: ["A", "taxi", "driver", "works", "on", "the", "street"],
      image: CDN + "z292843_12_A_taxi_driver_works_on_the_street.png"
    }
  ];

  // Place / structure distractors
  var DISTRACTOR_BANK = [
    "home", "hospital", "store", "restaurant", "office", "school", "factory",
    "street", "works", "work", "in", "on", "at", "the", "a", "an",
    "teacher", "doctor", "nurse", "waiter", "shop"
  ];

  var MODES = [
    { id: "chips", title: "Build the answer", tip: "Tap the chips to make the sentence." },
    { id: "write", title: "Write the answer", tip: "Type the full sentence." }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;

  var phase = "start"; // start | play | between | done
  var modeIndex = 0;
  var order = [];
  var index = 0;
  var score = 0;
  var wrongs = 0;
  var locked = false;
  var slots = [];
  var poolCache = null;
  var poolItemId = null;

  function currentMode() {
    return MODES[modeIndex];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sfx(name) {
    if (window.ArcadeFX) { if (name === "good" || name === "correct") ArcadeFX.ok(); else if (name === "bad" || name === "wrong") ArcadeFX.bad(); }
    try {
      if (window.LASfx) {
        if (name === "correct" && LASfx.correct) return LASfx.correct();
        if (name === "wrong" && LASfx.wrong) return LASfx.wrong();
        if (name === "click" && LASfx.click) return LASfx.click();
        if (name === "win" && LASfx.win) return LASfx.win();
      }
    } catch (_) {}
  }

  function current() {
    return order[index];
  }

  function totalRounds() {
    return ITEMS.length * MODES.length;
  }

  function progressDone() {
    return modeIndex * ITEMS.length + index;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’`´]/g, "'")
      .replace(/[.,!?;:]+$/g, "")
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isWriteCorrect(user, item) {
    var n = norm(user);
    if (!n) return false;
    var targets = [
      norm(item.sentence),
      norm(item.tokens.join(" "))
    ];
    return targets.indexOf(n) >= 0;
  }

  /** Correct tokens + exactly 2 distractors */
  function chipPool(item) {
    var correct = item.tokens.slice();
    var used = {};
    correct.forEach(function (t) {
      used[t.toLowerCase()] = true;
    });

    var candidates = [];
    // words from other items' places / jobs
    ITEMS.forEach(function (other) {
      if (other.id === item.id) return;
      other.tokens.forEach(function (t) {
        var k = t.toLowerCase();
        if (!used[k] && candidates.indexOf(t) < 0) candidates.push(t);
      });
    });
    DISTRACTOR_BANK.forEach(function (t) {
      var k = t.toLowerCase();
      if (!used[k] && candidates.indexOf(t) < 0) candidates.push(t);
    });

    var distractors = shuffle(candidates).slice(0, 2);
    return shuffle(correct.concat(distractors));
  }

  function getPool(item) {
    if (poolItemId !== item.id || !poolCache) {
      poolCache = chipPool(item);
      poolItemId = item.id;
    }
    return poolCache;
  }

  function chipsCorrect(item) {
    var target = item.tokens;
    if (slots.length !== target.length) return false;
    for (var i = 0; i < target.length; i++) {
      if (slots[i] !== target[i]) return false;
    }
    return true;
  }

  function afterAnswer(ok) {
    locked = true;
    if (ok) {
      score += 1;
      sfx("correct");
    } else {
      wrongs += 1;
      sfx("wrong");
    }
    setTimeout(function () {
      index += 1;
      locked = false;
      slots = [];
      poolCache = null;
      poolItemId = null;
      if (index >= order.length) {
        if (modeIndex < MODES.length - 1) {
          if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Part 1 complete — halfway there!");
          phase = "between";
          render();
        } else {
          finishGame();
        }
      } else {
        render();
      }
    }, ok ? 750 : 1300);
  }

  function checkWrite() {
    if (locked || phase !== "play") return;
    var input = document.getElementById("wd-input");
    if (!input) return;
    var item = current();
    if (!item) return;
    var user = input.value;
    if (!norm(user)) {
      input.focus();
      return;
    }
    input.disabled = true;
    var ok = isWriteCorrect(user, item);
    var fb = document.getElementById("wd-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + item.sentence : "Answer: " + item.sentence;
      fb.className = "wd-fb " + (ok ? "ok" : "bad");
    }
    input.classList.add(ok ? "ok" : "bad");
    var checkBtn = document.getElementById("wd-check");
    if (checkBtn) checkBtn.disabled = true;
    afterAnswer(ok);
  }

  function checkChips() {
    if (locked || phase !== "play") return;
    var item = current();
    if (!item) return;
    if (slots.length < item.tokens.length) return;
    var ok = chipsCorrect(item);
    var fb = document.getElementById("wd-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + item.sentence : "Answer: " + item.sentence;
      fb.className = "wd-fb " + (ok ? "ok" : "bad");
    }
    var slotsEl = document.getElementById("wd-slots");
    if (slotsEl) {
      slotsEl.querySelectorAll(".wd-slot").forEach(function (el) {
        el.classList.add(ok ? "ok" : "bad");
      });
    }
    afterAnswer(ok);
  }

  function placeChip(tok) {
    if (locked) return;
    var item = current();
    if (!item) return;
    if (slots.length >= item.tokens.length) return;
    slots.push(tok);
    sfx("click");
    renderPlayPartial();
    if (slots.length >= item.tokens.length) {
      setTimeout(checkChips, 180);
    }
  }

  function removeChip(i) {
    if (locked) return;
    slots.splice(i, 1);
    sfx("click");
    renderPlayPartial();
  }

  function renderSlots(item) {
    var need = item.tokens;
    var html = "";
    for (var i = 0; i < need.length; i++) {
      if (slots[i]) {
        html +=
          '<button type="button" class="wd-slot filled" data-si="' +
          i +
          '">' +
          escapeHtml(slots[i]) +
          "</button>";
      } else {
        html += '<span class="wd-slot empty"></span>';
      }
    }
    return html;
  }

  function renderPool(item) {
    var pool = getPool(item);
    var usedCount = {};
    slots.forEach(function (s) {
      usedCount[s] = (usedCount[s] || 0) + 1;
    });
    return pool
      .map(function (tok) {
        var used = (usedCount[tok] || 0) > 0;
        if (used) {
          usedCount[tok] -= 1;
          return (
            '<button type="button" class="wd-chip used" disabled>' +
            escapeHtml(tok) +
            "</button>"
          );
        }
        return (
          '<button type="button" class="wd-chip" data-tok="' +
          escapeHtml(tok) +
          '">' +
          escapeHtml(tok) +
          "</button>"
        );
      })
      .join("");
  }

  function renderPlayPartial() {
    var item = current();
    if (!item) return;
    var slotsEl = document.getElementById("wd-slots");
    var poolEl = document.getElementById("wd-pool");
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(item);
      slotsEl.querySelectorAll("[data-si]").forEach(function (btn) {
        btn.onclick = function () {
          removeChip(+btn.dataset.si);
        };
      });
    }
    if (poolEl) {
      poolEl.innerHTML = renderPool(item);
      poolEl.querySelectorAll("[data-tok]").forEach(function (btn) {
        btn.onclick = function () {
          placeChip(btn.dataset.tok);
        };
      });
    }
  }

  function calcAccuracy() {
    var attempts = score + wrongs;
    if (attempts <= 0) return 0;
    return Math.round((score / attempts) * 100);
  }

  function calcStars() {
    var acc = calcAccuracy();
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function beginMode() {
    order = shuffle(ITEMS.slice());
    index = 0;
    locked = false;
    slots = [];
    poolCache = null;
    poolItemId = null;
    phase = "play";
    render();
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = 0;
    score = 0;
    wrongs = 0;
    beginMode();
  }

  function finishGame() {
    phase = "done";
    sfx("win");
    var stars = calcStars();
    var accuracy = calcAccuracy();
    var total = totalRounds();
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
    } catch (_) {}
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: score,
          total: total,
          accuracy: accuracy,
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: startGame,
          onModes: function () {
            phase = "start";
            render();
          },
          backHref: "../"
        });
        return;
      } catch (e) {}
    }
    render();
  }

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="wd-topbar">' +
        '<a class="wd-back" href="../" aria-label="Back">←</a>' +
        '<div class="wd-topbar-center">' +
        '<span class="wd-kicker">UNIT 6A</span>' +
        '<span class="wd-title">Where do they work?</span>' +
        "</div></header>" +
        '<section class="wd-start">' +
        '<div class="wd-hero">📍</div>' +
        "<h1>Where do they work?</h1>" +
        '<p class="wd-desc">Two parts · Build with chips, then write the full answer.</p>' +
        '<ol class="wd-parts">' +
        "<li><strong>Part 1</strong> — Tap chips to build the sentence</li>" +
        "<li><strong>Part 2</strong> — Type the full sentence</li>" +
        "</ol>" +
        '<button type="button" class="wd-btn" id="wd-start">Start Part 1</button>' +
        "</section>";
      document.getElementById("wd-start").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    if (phase === "between") {
      app.innerHTML =
        '<header class="wd-topbar">' +
        '<a class="wd-back" href="../" aria-label="Back">←</a>' +
        '<span class="wd-title">Part 1 complete!</span></header>' +
        '<section class="wd-start">' +
        '<div class="wd-hero">✨</div>' +
        "<h1>Nice work!</h1>" +
        '<p class="wd-desc">Now type the full answers — no chips this time.</p>' +
        '<button type="button" class="wd-btn" id="wd-next">Start Part 2</button>' +
        "</section>";
      document.getElementById("wd-next").onclick = function () {
        sfx("click");
        modeIndex = 1;
        beginMode();
      };
      return;
    }

    if (phase === "done") {
      app.innerHTML =
        '<section class="wd-start">' +
        '<div class="wd-hero">🏆</div>' +
        "<h1>Done!</h1>" +
        "<p>Score: " +
        score +
        " / " +
        totalRounds() +
        "</p>" +
        '<button type="button" class="wd-btn" id="wd-again">Play again</button>' +
        '<a class="wd-link" href="../" style="display:block;margin-top:14px;color:#7c3aed;font-weight:600">Back to games</a>' +
        "</section>";
      document.getElementById("wd-again").onclick = function () {
        sfx("click");
        startGame();
      };
      return;
    }

    // play
    var mode = currentMode();
    var item = current();
    if (!item) return;
    if (poolItemId !== item.id) {
      slots = [];
      poolCache = null;
    }

    var done = progressDone();
    var total = totalRounds();
    var progressPct = Math.round((done / total) * 100);
    var isChips = mode.id === "chips";

    var answerArea = isChips
      ? '<div class="wd-slots" id="wd-slots">' +
        renderSlots(item) +
        "</div>" +
        '<div class="wd-pool" id="wd-pool">' +
        renderPool(item) +
        "</div>"
      : '<div class="wd-input-wrap" style="width:100%;max-width:360px;margin:0 auto 10px">' +
        '<input type="text" id="wd-input" class="wd-input" placeholder="A teacher works in a school." ' +
        'autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" ' +
        'style="width:100%;box-sizing:border-box;padding:14px 16px;border-radius:14px;border:2px solid rgba(91,33,182,0.18);font:inherit;font-size:1.05rem;font-weight:700;text-align:center">' +
        "</div>" +
        '<button type="button" class="wd-btn" id="wd-check" disabled>Check</button>';

    app.innerHTML =
      '<header class="wd-topbar">' +
      '<a class="wd-back" href="../" aria-label="Back">←</a>' +
      '<div class="wd-topbar-center">' +
      '<span class="wd-kicker">PART ' +
      (modeIndex + 1) +
      " / " +
      MODES.length +
      "</span>" +
      '<span class="wd-title">' +
      escapeHtml(mode.title) +
      "</span>" +
      "</div>" +
      '<span class="wd-badge">' +
      (index + 1) +
      "/" +
      order.length +
      "</span>" +
      "</header>" +
      '<div class="wd-progress"><div class="wd-progress-fill" style="width:' +
      progressPct +
      '%"></div></div>' +
      '<p class="wd-instruction" style="text-align:center;margin:0 0 8px;font-size:0.9rem;opacity:0.85">' +
      escapeHtml(mode.tip) +
      "</p>" +
      '<div class="wd-pic-wrap" style="text-align:center;margin:8px 0 10px">' +
      '<img src="' +
      escapeHtml(item.image) +
      '" alt="" draggable="false" style="max-width:100%;max-height:min(28vh,200px);border-radius:14px;object-fit:contain">' +
      "</div>" +
      '<p class="wd-question" style="text-align:center;font-weight:800;font-size:1.05rem;margin:0 0 12px;color:inherit">' +
      escapeHtml(item.question) +
      "</p>" +
      answerArea +
      '<div class="wd-fb" id="wd-fb"></div>';

    if (isChips) {
      document.getElementById("wd-slots").querySelectorAll("[data-si]").forEach(function (btn) {
        btn.onclick = function () {
          removeChip(+btn.dataset.si);
        };
      });
      document.getElementById("wd-pool").querySelectorAll("[data-tok]").forEach(function (btn) {
        btn.onclick = function () {
          placeChip(btn.dataset.tok);
        };
      });
    } else {
      var input = document.getElementById("wd-input");
      var checkBtn = document.getElementById("wd-check");
      input.focus();
      var sync = function () {
        checkBtn.disabled = !norm(input.value);
      };
      input.addEventListener("input", sync);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") checkWrite();
      });
      checkBtn.onclick = checkWrite;
      // basic input ok/bad styles via class on input
      if (!document.getElementById("wd-input-style")) {
        var st = document.createElement("style");
        st.id = "wd-input-style";
        st.textContent =
          ".wd-input.ok{border-color:#10b981!important;background:#d1fae5!important}" +
          ".wd-input.bad{border-color:#ef4444!important;background:#fee2e2!important}";
        document.head.appendChild(st);
      }
    }
  }

  render();
})();
