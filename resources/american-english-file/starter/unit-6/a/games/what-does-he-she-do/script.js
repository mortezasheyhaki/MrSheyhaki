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

/* What does he / she do? – AEF Starter Unit 6A
   Part 1: chip sentence builder  ·  Part 2: write the full answer */
(function () {
  "use strict";

  var GAME_ID = "starter-6a-what-does-he-she-do";
  var CDN = "https://cdn.imgurl.ir/uploads/";

  // Females listed by user; the rest are male
  var ITEMS = [
    { id: "teacher", job: "teacher", label: "a teacher", gender: "f",
      image: CDN + "y431285_1_teacher.png", audio: CDN + "e500251_1_a_teacher.mp3" },
    { id: "doctor", job: "doctor", label: "a doctor", gender: "m",
      image: CDN + "u765683_2_a_doctor.png", audio: CDN + "y03769_2_a_doctor.mp3" },
    { id: "nurse", job: "nurse", label: "a nurse", gender: "f",
      image: CDN + "o88045_3_a_nurse.png", audio: CDN + "h90124_3_a_nurse.mp3" },
    { id: "journalist", job: "journalist", label: "a journalist", gender: "m",
      image: CDN + "y033377_4_a_nurse.png", audio: CDN + "y108055_4_a_journalist.mp3" },
    { id: "waiter", job: "waiter", label: "a waiter", gender: "m",
      image: CDN + "j13538_5_a_waiter.png", audio: CDN + "i300299_5_a_waiter.mp3" },
    { id: "waitress", job: "waitress", label: "a waitress", gender: "f",
      image: CDN + "s032802_6_a_waitress.png", audio: CDN + "q243679_6_a_waitress.mp3" },
    { id: "salesperson", job: "salesperson", label: "a salesperson", gender: "m",
      image: CDN + "p208694_7_a_salesperson.png", audio: CDN + "c70645_7_a_salesperson.mp3" },
    { id: "receptionist", job: "receptionist", label: "a receptionist", gender: "f",
      image: CDN + "z996638_8_a_receptionist.png", audio: CDN + "c29486_8_a_recptionist.mp3" },
    { id: "policeman", job: "policeman", label: "a policeman", gender: "m",
      image: CDN + "d755786_9_a_policeman.png", audio: CDN + "k557960_9_a_policeman.mp3" },
    { id: "policewoman", job: "policewoman", label: "a policewoman", gender: "f",
      image: CDN + "s982850_10_a_policeman.png", audio: CDN + "l328420_10_a_policeowman.mp3" },
    { id: "factory-worker", job: "factory worker", label: "a factory worker", gender: "m",
      image: CDN + "k96301_11_a_factory_worker.png", audio: CDN + "s79925_11_a_factory_worker.mp3" },
    { id: "taxi-driver", job: "taxi driver", label: "a taxi driver", gender: "m",
      image: CDN + "q003095_12_a_taxi_driver.png", audio: CDN + "c56441_12_a_taxi_driver.mp3" }
  ];

  var MODES = [
    {
      id: "chips",
      title: "Build the answer",
      tip: "Look at the picture. Tap the chips to make the sentence."
    },
    {
      id: "write",
      title: "Write the answer",
      tip: "Look at the picture. Type the full sentence."
    }
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
  var slots = []; // chip tokens placed
  var currentAudio = null;

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

  function pronoun(item) {
    return item.gender === "f" ? "She" : "He";
  }

  function targetTokens(item) {
    // He / She + 's + a + job words (job may be multi-word)
    var jobParts = item.job.split(" ");
    return [pronoun(item), "'s", "a"].concat(jobParts);
  }

  function targetSentence(item) {
    // "He's a waiter" / "She's a teacher"
    return pronoun(item) + "'s " + item.label;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[.,!?]/g, "")
      .trim();
  }

  function isWriteCorrect(user, item) {
    var n = norm(user);
    var targets = [
      norm(targetSentence(item)),
      norm(pronoun(item) + " is " + item.label),
      norm(pronoun(item) + " is " + item.job)
    ];
    return targets.indexOf(n) >= 0;
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

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (_) {}
      currentAudio = null;
    }
  }

  function playAudio(item) {
    if (!item || !item.audio) return;
    stopAudio();
    try {
      currentAudio = new Audio(item.audio);
      currentAudio.play().catch(function () {});
    } catch (_) {}
  }

  function totalRounds() {
    return ITEMS.length * MODES.length;
  }

  function progressDone() {
    return modeIndex * ITEMS.length + index;
  }

  function current() {
    return order[index];
  }

  function startGame() {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = 0;
    score = 0;
    wrongs = 0;
    beginMode();
  }

  function beginMode() {
    order = shuffle(ITEMS.slice());
    index = 0;
    locked = false;
    slots = [];
    phase = "play";
    stopAudio();
    render();
  }

  function chipPool(item) {
    // Correct tokens + a few distractors
    var correct = targetTokens(item);
    var distractors = [];
    // opposite pronoun
    distractors.push(item.gender === "f" ? "He" : "She");
    // other jobs
    var others = shuffle(
      ITEMS.filter(function (x) {
        return x.id !== item.id;
      })
    ).slice(0, 3);
    others.forEach(function (o) {
      o.job.split(" ").forEach(function (w) {
        if (distractors.indexOf(w) < 0 && correct.indexOf(w) < 0) distractors.push(w);
      });
    });
    // optional "is" distractor
    if (distractors.indexOf("is") < 0) distractors.push("is");

    var pool = correct.concat(distractors);
    // unique by value but keep multiples if needed - for multi-word job no dupes needed
    var seen = {};
    var uniq = [];
    pool.forEach(function (tok) {
      var k = tok;
      if (!seen[k]) {
        seen[k] = true;
        uniq.push(tok);
      }
    });
    return shuffle(uniq);
  }

  function builtFromSlots() {
    // Join: He + 's + a + waiter → He's a waiter
    if (!slots.length) return "";
    var out = slots[0];
    for (var i = 1; i < slots.length; i++) {
      var t = slots[i];
      if (t === "'s") out += "'s";
      else out += " " + t;
    }
    return out;
  }

  function chipsCorrect(item) {
    var target = targetTokens(item);
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
    }, ok ? 700 : 1200);
  }

  function checkChips() {
    if (locked || phase !== "play") return;
    var item = current();
    if (!item) return;
    if (slots.length < targetTokens(item).length) return;
    var ok = chipsCorrect(item);
    var fb = document.getElementById("wd-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + targetSentence(item) : "Answer: " + targetSentence(item);
      fb.className = "wd-fb " + (ok ? "ok" : "bad");
    }
    afterAnswer(ok);
  }

  function checkWrite() {
    if (locked || phase !== "play") return;
    var input = document.getElementById("wd-input");
    if (!input) return;
    var item = current();
    var user = input.value;
    if (!norm(user)) {
      input.focus();
      return;
    }
    input.disabled = true;
    var ok = isWriteCorrect(user, item);
    var fb = document.getElementById("wd-fb");
    if (fb) {
      fb.textContent = ok ? "✓ " + targetSentence(item) : "Answer: " + targetSentence(item);
      fb.className = "wd-fb " + (ok ? "ok" : "bad");
    }
    input.classList.add(ok ? "ok" : "bad");
    afterAnswer(ok);
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

  function placeChip(tok) {
    if (locked) return;
    var item = current();
    var need = targetTokens(item).length;
    if (slots.length >= need) return;
    slots.push(tok);
    sfx("click");
    renderPlayPartial();
    if (slots.length >= need) {
      setTimeout(checkChips, 180);
    }
  }

  function removeChip(i) {
    if (locked) return;
    slots.splice(i, 1);
    sfx("click");
    renderPlayPartial();
  }

  function renderPlayPartial() {
    var slotsEl = document.getElementById("wd-slots");
    var poolEl = document.getElementById("wd-pool");
    var item = current();
    if (!item) return;
    if (slotsEl) {
      slotsEl.innerHTML = renderSlots(item);
      slotsEl.querySelectorAll("[data-si]").forEach(function (btn) {
        btn.onclick = function () {
          removeChip(+btn.dataset.si);
        };
      });
    }
    if (poolEl) {
      // rebuild pool highlighting used tokens once
      var used = {};
      slots.forEach(function (s) {
        used[s] = (used[s] || 0) + 1;
      });
      var pool = chipPool(item);
      // Actually don't reshuffle pool on every place — store on item
    }
  }

  // Keep stable pool per round
  var poolCache = null;
  var poolItemId = null;

  function getPool(item) {
    if (poolItemId !== item.id || !poolCache) {
      poolCache = chipPool(item);
      poolItemId = item.id;
    }
    return poolCache;
  }

  function renderSlots(item) {
    var need = targetTokens(item);
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
    var available = {};
    pool.forEach(function (t) {
      available[t] = (available[t] || 0) + 1;
    });
    // Mark used: each token can only be used as many times as in pool (1)
    return pool
      .map(function (tok) {
        var used = (usedCount[tok] || 0) > 0;
        // if multiple same tokens in pool we'd track better; pool is unique
        if (used) {
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

  function render() {
    if (phase === "start") {
      app.innerHTML =
        '<header class="wd-topbar">' +
        '<a class="wd-back" href="../" aria-label="Back">←</a>' +
        '<div class="wd-topbar-center">' +
        '<span class="wd-kicker">UNIT 6A</span>' +
        '<span class="wd-title">What does he / she do?</span>' +
        "</div></header>" +
        '<section class="wd-start">' +
        '<div class="wd-hero">💼</div>' +
        "<h1>What does he / she do?</h1>" +
        '<p class="wd-desc">Two parts · Build with chips, then write the full answer.</p>' +
        '<ol class="wd-parts">' +
        "<li><strong>Part 1</strong> — Tap chips to build <em>He's a waiter</em></li>" +
        "<li><strong>Part 2</strong> — Type the whole sentence</li>" +
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
        '<section class="wd-start"><h1>Done!</h1><p>Score: ' +
        score +
        " / " +
        totalRounds() +
        '</p><button type="button" class="wd-btn" id="wd-again">Play again</button></section>';
      document.getElementById("wd-again").onclick = startGame;
      return;
    }

    // play
    var mode = MODES[modeIndex];
    var item = current();
    slots = slots || [];
    if (poolItemId !== item.id) {
      slots = [];
      poolCache = null;
      poolItemId = null;
    }

    var done = progressDone();
    var total = totalRounds();
    var pct = (done / total) * 100;
    var q = "What does " + (item.gender === "f" ? "she" : "he") + " do?";

    var answerArea = "";
    if (mode.id === "chips") {
      answerArea =
        '<div class="wd-slots" id="wd-slots">' +
        renderSlots(item) +
        "</div>" +
        '<div class="wd-pool" id="wd-pool">' +
        renderPool(item) +
        "</div>" +
        '<p class="wd-fb" id="wd-fb"></p>';
    } else {
      answerArea =
        '<div class="wd-write">' +
        '<input class="wd-input" id="wd-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="e.g. He\'s a waiter" enterkeyhint="done" />' +
        '<p class="wd-fb" id="wd-fb"></p>' +
        '<button type="button" class="wd-btn" id="wd-check">Check</button>' +
        "</div>";
    }

    app.innerHTML =
      '<header class="wd-topbar">' +
      '<a class="wd-back" href="../" aria-label="Back">←</a>' +
      '<div class="wd-topbar-center">' +
      '<span class="wd-kicker">PART ' +
      (modeIndex + 1) +
      " / 2</span>" +
      '<span class="wd-title">' +
      escapeHtml(mode.title) +
      "</span></div>" +
      '<span class="wd-badge">' +
      (index + 1) +
      "/" +
      order.length +
      "</span></header>" +
      '<p class="wd-instruction">' +
      escapeHtml(mode.tip) +
      "</p>" +
      '<div class="wd-progress"><div class="wd-progress-fill" style="width:' +
      pct +
      '%"></div></div>' +
      '<div class="wd-card">' +
      '<img class="wd-photo" src="' +
      item.image +
      '" alt="" draggable="false" />' +
      '<p class="wd-question">' +
      escapeHtml(q) +
      "</p>" +
      '<button type="button" class="wd-audio" id="wd-audio" aria-label="Play">🔊</button>' +
      "</div>" +
      answerArea;

    var audioBtn = document.getElementById("wd-audio");
    if (audioBtn) {
      audioBtn.onclick = function () {
        sfx("click");
        playAudio(item);
      };
    }

    if (mode.id === "chips") {
      document.querySelectorAll("#wd-pool .wd-chip:not(.used)").forEach(function (btn) {
        btn.onclick = function () {
          placeChip(btn.getAttribute("data-tok"));
          // re-render pool/slots
          var slotsEl = document.getElementById("wd-slots");
          var poolEl = document.getElementById("wd-pool");
          if (slotsEl) {
            slotsEl.innerHTML = renderSlots(item);
            slotsEl.querySelectorAll("[data-si]").forEach(function (b) {
              b.onclick = function () {
                removeChip(+b.dataset.si);
                document.getElementById("wd-slots").innerHTML = renderSlots(item);
                document.getElementById("wd-pool").innerHTML = renderPool(item);
                bindChipHandlers(item);
              };
            });
          }
          if (poolEl) {
            poolEl.innerHTML = renderPool(item);
            bindChipHandlers(item);
          }
          if (slots.length >= targetTokens(item).length) {
            setTimeout(checkChips, 180);
          }
        };
      });
      document.querySelectorAll("#wd-slots [data-si]").forEach(function (b) {
        b.onclick = function () {
          removeChip(+b.dataset.si);
          document.getElementById("wd-slots").innerHTML = renderSlots(item);
          document.getElementById("wd-pool").innerHTML = renderPool(item);
          bindChipHandlers(item);
        };
      });
    } else {
      var input = document.getElementById("wd-input");
      var check = document.getElementById("wd-check");
      if (check) {
        check.onclick = function () {
          sfx("click");
          checkWrite();
        };
      }
      if (input) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            checkWrite();
          }
        });
        setTimeout(function () {
          input.focus();
        }, 120);
      }
    }
  }

  function bindChipHandlers(item) {
    document.querySelectorAll("#wd-pool .wd-chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        placeChip(btn.getAttribute("data-tok"));
        document.getElementById("wd-slots").innerHTML = renderSlots(item);
        document.getElementById("wd-pool").innerHTML = renderPool(item);
        bindChipHandlers(item);
        if (slots.length >= targetTokens(item).length) {
          setTimeout(checkChips, 180);
        }
      };
    });
    document.querySelectorAll("#wd-slots [data-si]").forEach(function (b) {
      b.onclick = function () {
        removeChip(+b.dataset.si);
        document.getElementById("wd-slots").innerHTML = renderSlots(item);
        document.getElementById("wd-pool").innerHTML = renderPool(item);
        bindChipHandlers(item);
      };
    });
  }

  ITEMS.forEach(function (it) {
    var img = new Image();
    img.src = it.image;
  });

  render();
})();
