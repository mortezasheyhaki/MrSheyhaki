/* Canada in January – Teen2Teen 1 Unit 12. Read, match, circle, tick. */
(function () {
  "use strict";

  var GAME_ID = "t2t1-u12-canada-january-reading";

  var ARTICLE = "Some people say, \"Don't go to Canada in January. It's too cold!\" Well, it's true. It's very, very cold. But in the province of Quebec, it's usually sunny, and it's fun! You should visit the city of Montreal. \"Mount Royal\" is a small mountain in a park in the city. It's very pretty in the snow. In Montreal, there are lots of nice restaurants, and the food is fantastic. And you should go to Snow Village. There are restaurants, hotels, theaters, and other buildings, all made of snow! Of course, Canada is famous for hockey, so you should go to a Canadiens game. They're everyone's favorite hockey team. Go Canadiens! But you can also play hockey, and other games too, at Montreal's Winter Festival. So visit Canada in January! Canada in January is awesome!";

  // Part 2: left = the things you can do, right = the places (letters). correct: left index -> right letter
  var MATCH_LEFT = [
    { t: "You can watch hockey", ans: "c" },
    { t: "You can go to a restaurant", ans: "b" },
    { t: "You can play hockey", ans: "a" }
  ];
  var MATCH_RIGHT = [
    { k: "a", t: "at the Winter Festival." },
    { k: "b", t: "at the Snow Village." },
    { k: "c", t: "at a Canadiens game." }
  ];
  var PAIR_COLORS = ["#0f8fd6", "#f472b6", "#f7941d"];

  // Part 3: words, colour, and whether they describe Canada in January
  var WORDS = [
    { t: "fun", c: "#f7941d", good: true },
    { t: "windy", c: "#9ca3af", good: false },
    { t: "awesome", c: "#16a34a", good: true },
    { t: "pretty", c: "#db2777", good: true },
    { t: "rainy", c: "#3b82f6", good: false },
    { t: "sunny", c: "#eab308", good: true },
    { t: "hot", c: "#dc2626", good: false },
    { t: "cold", c: "#0ea5e9", good: true },
    { t: "old", c: "#4b5563", good: false }
  ];

  // Part 4: what you should do (the first one is the example, already ticked)
  var STATEMENTS = [
    { t: "go to a hockey game.", truth: true, example: true },
    { t: "go to a beach.", truth: false },
    { t: "go to a restaurant.", truth: true },
    { t: "look at the snow.", truth: true },
    { t: "go to a mountain.", truth: true },
    { t: "go to a mall.", truth: false },
    { t: "buy clothes.", truth: false },
    { t: "play hockey.", truth: true },
    { t: "go to a park.", truth: true },
    { t: "ride a horse.", truth: false }
  ];

  var app = document.getElementById("game-app");
  if (!app) return;
  var audio = document.getElementById("bk-audio");

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
    correct: function () { tone(660, 0.12, "triangle", 0.1); tone(880, 0.18, "triangle", 0.1, 0.09); tone(1320, 0.25, "sine", 0.08, 0.18); },
    wrong: function () { tone(230, 0.14, "square", 0.06, 0, 170); tone(170, 0.2, "square", 0.05, 0.12, 120); },
    win: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.3, "triangle", 0.1, i * 0.1); }); }
  };
  function sfx(n) { if (SFX[n]) SFX[n](); }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- state ---------- */
  var pairs = {};          // left index -> right letter
  var activeLeft = null;   // left index waiting for a partner
  var circled = {};        // word index -> true
  var ticks = STATEMENTS.map(function (s) { return !!s.example; });
  var checked = false;

  /* ---------- part 1: article and audio ---------- */
  $("cj-text").textContent = ARTICLE;

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), r = Math.floor(sec % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function updateProgress() {
    var d = audio.duration;
    var pct = d && isFinite(d) ? Math.min(100, (audio.currentTime / d) * 100) : 0;
    $("bk-fill").style.width = pct + "%";
    $("bk-track").setAttribute("aria-valuenow", Math.round(pct));
    $("bk-time").textContent = fmt(audio.currentTime) + (d && isFinite(d) ? " / " + fmt(d) : "");
  }
  function setPlayingUI(playing) {
    $("bk-listen").classList.toggle("is-playing", playing);
    $("bk-listen").setAttribute("aria-label", playing ? "Pause the article" : "Play the article");
    $("bk-player").classList.toggle("is-playing", playing);
  }
  $("bk-listen").addEventListener("click", function () {
    audioCtx(); sfx("tap");
    if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    else audio.pause();
  });
  audio.addEventListener("play", function () { setPlayingUI(true); });
  audio.addEventListener("pause", function () { setPlayingUI(false); });
  audio.addEventListener("ended", function () { setPlayingUI(false); updateProgress(); });
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);

  var track = $("bk-track"), dragging = false;
  function seekFromPointer(x) {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    var r = track.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (x - r.left) / r.width)) * d;
    updateProgress();
  }
  track.addEventListener("pointerdown", function (e) {
    audioCtx(); dragging = true; track.classList.add("is-seeking");
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
    seekFromPointer(e.clientX);
  });
  track.addEventListener("pointermove", function (e) { if (dragging) seekFromPointer(e.clientX); });
  ["pointerup", "pointercancel"].forEach(function (ev) {
    track.addEventListener(ev, function () { dragging = false; track.classList.remove("is-seeking"); });
  });
  track.addEventListener("keydown", function (e) {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(d, audio.currentTime + 5);
    else if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
    else return;
    e.preventDefault(); updateProgress();
  });

  /* ---------- part 2: match ---------- */
  function renderMatch() {
    var leftHTML = MATCH_LEFT.map(function (m, i) {
      var p = pairs[i];
      var cls = "cj-m" + (activeLeft === i ? " is-active" : "") + (p ? " is-paired" : "") +
        (checked ? (p === m.ans ? " is-right" : " is-wrong") : "");
      var style = p ? ' style="--pair:' + PAIR_COLORS[i] + '"' : "";
      var tag = p ? '<span class="cj-pair-tag">' + esc(p) + "</span>" : "";
      return '<button class="' + cls + '" data-side="L" data-i="' + i + '"' + style + (checked ? " disabled" : "") + ">" +
        (i + 1) + ". " + esc(m.t) + tag + "</button>";
    }).join("");
    var rightHTML = MATCH_RIGHT.map(function (r, j) {
      // which left item (if any) is paired with this letter
      var owner = Object.keys(pairs).filter(function (k) { return pairs[k] === r.k; })[0];
      var cls = "cj-m" + (owner !== undefined ? " is-paired" : "");
      var style = owner !== undefined ? ' style="--pair:' + PAIR_COLORS[Number(owner)] + '"' : "";
      var tag = owner !== undefined ? '<span class="cj-pair-tag">' + (Number(owner) + 1) + "</span>" : "";
      return '<button class="' + cls + '" data-side="R" data-k="' + r.k + '"' + style + (checked ? " disabled" : "") + ">" +
        r.k + ". " + esc(r.t) + tag + "</button>";
    }).join("");
    $("cj-match").innerHTML =
      '<div class="cj-col">' + leftHTML + "</div>" +
      '<div class="cj-col">' + rightHTML + "</div>";
  }

  /* ---------- part 3: circle the words ---------- */
  function renderWords() {
    $("cj-words").innerHTML = WORDS.map(function (w, i) {
      var cls = "cj-word" + (circled[i] ? " is-on" : "") +
        (checked ? (w.good === !!circled[i] ? " is-right" : " is-wrong") : "");
      return '<button class="' + cls + '" data-w="' + i + '" style="--c:' + w.c + '"' + (checked ? " disabled" : "") + ">" + esc(w.t) + "</button>";
    }).join("");
  }

  /* ---------- part 4: tick ---------- */
  function renderTicks() {
    $("bk-stmts").innerHTML = STATEMENTS.map(function (s, i) {
      var on = ticks[i];
      var row = "bk-st" + (s.example ? " is-example" : "");
      var mark = "";
      if (checked && !s.example) {
        var ok = ticks[i] === s.truth;
        row += ok ? " is-right" : " is-wrong";
        mark = ok ? "✓" : "✗";
      }
      return '<div class="' + row + '">' +
        '<span class="bk-st-n">' + (i + 1) + ".</span>" +
        '<span class="bk-st-text">' + esc(s.t) + "</span>" +
        '<button class="bk-box' + (on ? " is-on" : "") + '" data-s="' + i + '"' +
        (s.example || checked ? " disabled" : "") + ">" + (on ? "✓" : "") + "</button>" +
        '<span class="bk-st-mark">' + mark + "</span></div>";
    }).join("");
  }

  function renderAll() { renderMatch(); renderWords(); renderTicks(); }

  /* ---------- events ---------- */
  app.addEventListener("click", function (ev) {
    if (checked) return;

    var m = ev.target.closest(".cj-m");
    if (m) {
      sfx("tap");
      if (m.getAttribute("data-side") === "L") {
        var li = Number(m.getAttribute("data-i"));
        if (pairs[li]) { delete pairs[li]; activeLeft = null; }    // tap a paired item to undo
        else activeLeft = (activeLeft === li) ? null : li;
      } else if (activeLeft !== null) {
        var k = m.getAttribute("data-k");
        // one partner per letter, and one letter per item
        Object.keys(pairs).forEach(function (key) { if (pairs[key] === k) delete pairs[key]; });
        pairs[activeLeft] = k;
        activeLeft = null;
      }
      renderMatch();
      return;
    }

    var w = ev.target.closest(".cj-word");
    if (w) {
      sfx("tap");
      var wi = Number(w.getAttribute("data-w"));
      circled[wi] = !circled[wi];
      renderWords();
      updateCheck();
      return;
    }

    var b = ev.target.closest(".bk-box");
    if (b) {
      sfx("tap");
      var si = Number(b.getAttribute("data-s"));
      ticks[si] = !ticks[si];
      renderTicks();
      updateCheck();
    }
  });

  /* ---------- check and score ---------- */
  function updateCheck() {
    var anyPick = Object.keys(pairs).length > 0 || Object.keys(circled).some(function (k) { return circled[k]; }) ||
      STATEMENTS.some(function (s, i) { return !s.example && ticks[i]; });
    $("bk-check").disabled = checked || !anyPick;
  }

  function checkAll() {
    if (checked) return;
    checked = true;
    var right = 0, total = 0;

    // part 2: 3 items
    MATCH_LEFT.forEach(function (m, i) { total++; if (pairs[i] === m.ans) right++; });
    // part 3: 9 words
    WORDS.forEach(function (w, i) { total++; if (w.good === !!circled[i]) right++; });
    // part 4: 9 scored statements (the example is not scored)
    STATEMENTS.forEach(function (s, i) { if (s.example) return; total++; if (ticks[i] === s.truth) right++; });

    renderAll();
    var pct = right / total;
    $("bk-result").textContent = right === total ? "Perfect! 🎉 " + right + " / " + total :
      pct >= 0.6 ? "Great work! " + right + " / " + total + " ⭐" :
      "Good try! " + right + " / " + total + " — look again and learn!";
    $("bk-check").hidden = true;
    $("bk-finish").hidden = false;
    state = { score: right, total: total };
    sfx(right === total ? "win" : "correct");
    if (pct < 0.6) sfx("wrong");
  }
  var state = { score: 0, total: 0 };

  $("bk-check").addEventListener("click", function () { sfx("tap"); checkAll(); });

  /* ---------- finish (shared end screen) ---------- */
  function finish() {
    sfx("win");
    var stars = state.score === state.total ? 3 : state.score / state.total >= 0.6 ? 2 : 1;
    if (window.LAFinish) {
      try {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID, score: state.score, total: state.total, stars: stars, timeMs: timeMs,
          onAgain: reset, onModes: reset, backHref: "../"
        });
        return;
      } catch (e) { console.warn(e); }
    }
    try { if (window.LAStars) { LAStars.recordPlay(GAME_ID); LAStars.save(GAME_ID, stars); } } catch (e) {}
    $("bk-result").textContent = "You scored " + state.score + " / " + state.total + "!";
  }
  $("bk-finish").addEventListener("click", function () { sfx("tap"); finish(); });

  /* ---------- phone tabs ---------- */
  document.querySelectorAll(".bk-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      sfx("tap");
      var which = t.getAttribute("data-tab");
      document.querySelectorAll(".bk-tab").forEach(function (x) {
        var on = x === t;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".bk-panel").forEach(function (p) {
        p.classList.toggle("is-on", p.getAttribute("data-panel") === which);
      });
    });
  });

  /* ---------- dark / light switch ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function paintSwitch() { $("bk-theme").setAttribute("aria-checked", currentTheme() === "dark" ? "true" : "false"); }
  $("bk-theme").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("mrsheyhaki-theme", next); } catch (e) {}
    sfx("tap"); paintSwitch();
  });
  paintSwitch();

  /* ---------- start / reset ---------- */
  function reset() {
    if (window.LAFinish) { try { LAFinish.startTimer(); } catch (e) {} }
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    pairs = {}; activeLeft = null; circled = {};
    ticks = STATEMENTS.map(function (s) { return !!s.example; });
    checked = false;
    state = { score: 0, total: 0 };
    $("bk-result").textContent = "";
    $("bk-check").hidden = false;
    $("bk-finish").hidden = true;
    renderAll();
    updateCheck();
    updateProgress();
  }

  document.addEventListener("pointerdown", function () { audioCtx(); }, { once: true });
  reset();
})();
