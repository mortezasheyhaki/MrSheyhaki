/* What, Where, When, Who, Why – Teen2Teen 1 Unit 12. Worksheet engine (mode: fill). */
(function () {
  "use strict";
  var CFG = {"instruction": "Complete the questions with What, Where, When, Who, or Why.", "example": {"lines": [["A: ", {"b": "Where"}, " should we go?"]], "ctx": ["B: We should go to the movie theater."]}, "items": [{"lines": [["A: ", {"b": "What"}, " should he do?"]], "ctx": ["B: He should do his homework."]}, {"lines": [["A: ", {"b": "Why"}, " should they stay home?"]], "ctx": ["B: Because it's rainy."]}, {"lines": [["A: ", {"b": "Who"}, " should we call?"]], "ctx": ["B: You should call your mom."]}, {"lines": [["A: ", {"b": "When"}, " should she visit?"]], "ctx": ["B: She should visit today!"]}, {"lines": [["A: ", {"b": "Where"}, " should I go?"]], "ctx": ["B: You should go to school."]}, {"lines": [["A: ", {"b": "Why"}, " should I buy this?"]], "ctx": ["B: Because it isn't expensive."]}, {"lines": [["A: ", {"b": "What"}, " should we visit?"]], "ctx": ["B: Let's visit the tourist attractions!"]}], "id": "t2t1-u12-question-words-writing", "mode": "fill"};
  var GAME_ID = CFG.id;
  var app = document.getElementById("game-app");
  if (!app) return;

  /* ---------- sound effects ---------- */
  var ctx = null, muted = false;
  try { muted = localStorage.getItem("ua-muted") === "1"; } catch (e) {}
  function audioCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(f, dur, type, gain, delay, slideTo) {
    var c = audioCtx(); if (!c || muted) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    tap: function () { tone(640, 0.05, "triangle", 0.07); },
    type: function () { tone(900, 0.03, "square", 0.03); },
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    whoosh: function () { tone(300, 0.28, "sine", 0.05, 0, 900); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z]/g, ""); }
  function setProgress(p) { $("sh-fill").style.width = p + "%"; }
  function setFeedback(text, kind) {
    var fb = $("sh-feedback");
    fb.textContent = text;
    fb.style.color = kind === "ok" ? "#d9ffe6" : kind === "no" ? "#ffd6d6" : "#fff";
  }

  var stageTimer = null, locked = false;

  /* ---------- finish (shared end screen) ---------- */
  function finish(score, total) {
    sfx("win");
    var stars = score === total ? 3 : score / total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({ gameId: GAME_ID, score: score, total: total, stars: stars, timeMs: timeMs, onAgain: start, onModes: start, backHref: "../" });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("ws-card").className = "sh-card";
    $("ws-card").innerHTML = '<p style="text-align:center;font-size:24px;font-weight:700;margin:0">You scored ' + score + " / " + total + " 🎉</p>";
  }

  /* ================= FILL MODE: one item at a time, writing boxes ================= */
  var fIdx = 0, fScore = 0, fMisses = 0;

  // turn segments into html; boxes collect the expected words in order
  function segsHTML(segs, expected, filled) {
    return segs.map(function (seg) {
      if (typeof seg === "string") return '<span class="ws-text">' + esc(seg) + "</span>";
      var words = seg.b.split(" ");
      if (filled) return '<span class="ws-text">' + esc(seg.b) + "</span>";
      return '<span class="ws-boxes">' + words.map(function (w) {
        var bi = expected.length;
        expected.push(w);
        return '<input class="tp-box" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ' +
          'maxlength="' + (w.length + 2) + '" data-len="' + w.length + '" data-bi="' + bi + '" style="--len:' + w.length + '" aria-label="Word ' + (bi + 1) + '">';
      }).join("") + "</span>";
    }).join("");
  }

  function fillSegsText(segs) {
    return segs.map(function (s) { return typeof s === "string" ? s : s.b; }).join("");
  }

  function fillBoxes() { return Array.prototype.slice.call(document.querySelectorAll("#ws-card .tp-box")); }
  function fillAllFilled() { return fillBoxes().every(function (b) { return b.value.trim().length > 0; }); }
  function updateFillCheck() { var c = $("ws-check"); if (c) c.disabled = locked || !fillAllFilled(); }

  function renderFill(animateIn) {
    var it = CFG.items[fIdx];
    locked = false;
    var expected = [];
    var linesHTML = it.lines.map(function (ln) {
      return '<div class="ws-line">' + segsHTML(ln, expected, false) + "</div>";
    }).join("");
    var ctxHTML = (it.ctx || []).map(function (c) { return '<p class="ws-ctx">' + esc(c) + "</p>"; }).join("");
    var exampleHTML = "";
    if (CFG.example) {
      exampleHTML = '<div class="ws-example"><p class="ws-label">Example</p>' +
        CFG.example.lines.map(function (ln) { return '<div class="ws-line">' + segsHTML(ln, [], true) + "</div>"; }).join("") +
        (CFG.example.ctx || []).map(function (c) { return '<p class="ws-ctx">' + esc(c) + "</p>"; }).join("") + "</div>";
    }
    $("ws-card").className = "sh-card" + (animateIn ? " pc-enter" : "");
    $("ws-card").innerHTML = exampleHTML +
      '<div><p class="ws-label">' + esc(CFG.instruction) + "</p>" +
      (it.cue ? '<p class="ws-cue">' + esc(it.cue) + "</p>" : "") + "</div>" +
      linesHTML + ctxHTML +
      '<button class="ca-check" id="ws-check" disabled>Check ✓</button>';
    it._expected = expected;
    setProgress(Math.round((fIdx / CFG.items.length) * 100));
    setFeedback("", "");
    updateFillCheck();
    var first = fillBoxes()[0];
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, animateIn ? 450 : 50);
  }

  function checkFill() {
    if (locked || !fillAllFilled()) return;
    var it = CFG.items[fIdx];
    var bs = fillBoxes(), wrong = 0;
    bs.forEach(function (b) {
      var bi = Number(b.getAttribute("data-bi"));
      b.classList.remove("is-wrong");
      if (norm(b.value) === norm(it._expected[bi])) { b.classList.add("is-right"); b.readOnly = true; }
      else { b.classList.add("is-wrong"); wrong++; }
    });
    if (wrong === 0) {
      locked = true;
      if (fMisses === 0) fScore++;
      fMisses = 0;
      sfx("correct");
      setFeedback("Yesss! 🎉", "ok");
      updateFillCheck();
      clearTimeout(stageTimer);
      stageTimer = setTimeout(nextFill, 1100);
    } else {
      fMisses++;
      sfx("wrong");
      setFeedback("Check the red boxes 💪", "no");
      var first = bs.filter(function (b) { return b.classList.contains("is-wrong"); })[0];
      if (first) first.focus({ preventScroll: true });
    }
  }

  function nextFill() {
    $("ws-card").classList.add("pc-leave");
    sfx("whoosh");
    clearTimeout(stageTimer);
    stageTimer = setTimeout(function () {
      fIdx++;
      if (fIdx >= CFG.items.length) finish(fScore, CFG.items.length);
      else renderFill(true);
    }, 300);
  }

  /* ================= MATCH MODE: pairs, all on one screen ================= */
  var pairs = {}, active = null, matchChecked = false;
  var PAIR_COLORS = ["#0f8fd6", "#f472b6", "#f7941d", "#16a34a", "#7c3aed", "#dc2626", "#0891b2"];

  function renderMatch() {
    var exL = CFG.exampleLeft || {};
    var leftHTML = CFG.left.map(function (t, i) {
      var isEx = exL.hasOwnProperty(i);
      var p = isEx ? exL[i] : pairs[i];
      var cls = "ws-m" + (active === i ? " is-active" : "") + (p ? " is-paired" : "");
      if (matchChecked && !isEx) cls += p === CFG.answers[i] ? " is-right" : " is-wrong";
      var style = p ? ' style="--pair:' + PAIR_COLORS[i % PAIR_COLORS.length] + '"' : "";
      var tag = p ? '<span class="ws-tag">' + esc(p) + "</span>" : "";
      return '<button class="' + cls + '" data-side="L" data-i="' + i + '"' + style + (isEx || matchChecked ? " disabled" : "") + ">" +
        (i + 1) + ". " + esc(t) + tag + "</button>";
    }).join("");
    var rightHTML = CFG.right.map(function (r) {
      var owner = Object.keys(pairs).filter(function (k) { return pairs[k] === r.k; })[0];
      if (owner === undefined) Object.keys(exL).forEach(function (k) { if (exL[k] === r.k) owner = k; });
      var has = owner !== undefined;
      var style = has ? ' style="--pair:' + PAIR_COLORS[Number(owner) % PAIR_COLORS.length] + '"' : "";
      var tag = has ? '<span class="ws-tag">' + (Number(owner) + 1) + "</span>" : "";
      return '<button class="ws-m' + (has ? " is-paired" : "") + '" data-side="R" data-k="' + r.k + '"' + style + (matchChecked ? " disabled" : "") + ">" +
        r.k + ". " + esc(r.t) + tag + "</button>";
    }).join("");
    $("ws-card").className = "sh-card";
    $("ws-card").innerHTML =
      '<div><p class="ws-label">' + esc(CFG.instruction) + "</p>" +
      (CFG.hint ? '<p class="ws-ctx">' + esc(CFG.hint) + "</p>" : "") + "</div>" +
      '<div class="ws-match"><div class="ws-col">' + leftHTML + '</div><div class="ws-col">' + rightHTML + "</div></div>" +
      '<button class="ca-check" id="ws-check" ' + (matchChecked ? "hidden" : "") + ' disabled>Check ✓</button>' +
      '<button class="ws-finish" id="ws-finish" hidden>See my score ⭐</button>';
    updateMatchCheck();
  }

  function unpaired() {
    var ex = CFG.exampleLeft || {};
    return CFG.left.map(function (_, i) { return i; }).filter(function (i) { return !ex.hasOwnProperty(i) && !pairs[i]; });
  }
  function updateMatchCheck() {
    var c = $("ws-check"); if (!c) return;
    c.disabled = matchChecked || unpaired().length > 0;
  }

  function checkMatch() {
    if (matchChecked) return;
    matchChecked = true;
    var ex = CFG.exampleLeft || {};
    var right = 0, total = 0;
    CFG.left.forEach(function (_, i) {
      if (ex.hasOwnProperty(i)) return;
      total++;
      if (pairs[i] === CFG.answers[i]) right++;
    });
    renderMatch();
    $("ws-check").hidden = true;
    $("ws-finish").hidden = false;
    matchScore = { score: right, total: total };
    sfx(right === total ? "win" : "correct");
    setFeedback(right === total ? "Perfect! 🎉 " + right + " / " + total : "You got " + right + " / " + total + " — look again and learn!", right === total ? "ok" : "no");
  }
  var matchScore = { score: 0, total: 0 };

  /* ================= events ================= */
  app.addEventListener("click", function (ev) {
    if (CFG.mode === "match") {
      if (matchChecked) return;
      var m = ev.target.closest(".ws-m");
      if (m) {
        sfx("tap");
        var ex = CFG.exampleLeft || {};
        if (m.getAttribute("data-side") === "L") {
          var li = Number(m.getAttribute("data-i"));
          if (ex.hasOwnProperty(li)) return;
          if (pairs[li]) { delete pairs[li]; active = null; }
          else active = (active === li) ? null : li;
        } else if (active !== null) {
          var k = m.getAttribute("data-k");
          Object.keys(pairs).forEach(function (key) { if (pairs[key] === k) delete pairs[key]; });
          pairs[active] = k;
          active = null;
        }
        renderMatch();
        return;
      }
      if (ev.target.closest("#ws-check")) { audioCtx(); sfx("tap"); checkMatch(); return; }
      if (ev.target.closest("#ws-finish")) { sfx("tap"); finish(matchScore.score, matchScore.total); return; }
      return;
    }
    if (ev.target.closest("#ws-check")) { audioCtx(); sfx("tap"); checkFill(); }
  });

  app.addEventListener("input", function (ev) {
    var b = ev.target;
    if (!b.classList || !b.classList.contains("tp-box")) return;
    b.classList.remove("is-wrong");
    sfx("type");
    var len = Number(b.getAttribute("data-len"));
    if (b.value.length >= len) {
      var bs = fillBoxes(), i = bs.indexOf(b);
      if (i > -1 && i < bs.length - 1) bs[i + 1].focus();
    }
    updateFillCheck();
  });

  app.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    if (!ev.target.classList || !ev.target.classList.contains("tp-box")) return;
    ev.preventDefault();
    if (fillAllFilled()) checkFill();
    else { var empty = fillBoxes().filter(function (x) { return !x.value.trim(); })[0]; if (empty) empty.focus(); }
  });

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("sh-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("sh-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap"); paintSwitch();
  });
  paintSwitch();

  /* ---------- start ---------- */
  function start() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    clearTimeout(stageTimer);
    locked = false;
    if (CFG.photo && !$("ws-photo")) {
      var img = document.createElement("img");
      img.id = "ws-photo"; img.className = "ws-photo"; img.src = CFG.photo; img.alt = CFG.photoAlt || "";
      $("sh-stage").classList.add("has-photo");
      $("sh-stage").insertBefore(img, $("ws-card"));
    }
    if (CFG.mode === "match") {
      pairs = {}; active = null; matchChecked = false; matchScore = { score: 0, total: 0 };
      setProgress(0);
      renderMatch();
    } else {
      fIdx = 0; fScore = 0; fMisses = 0;
      renderFill(false);
    }
  }

  var pairs = {}, active = null;
  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  start();
})();
