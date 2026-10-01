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
    var app = document.getElementById("game-app");
    if (!el || !app) return;
    var a = app.querySelector(".afx-bar") || app.querySelector("header") || app.firstElementChild;
    if (!a) return;
    var r = a.getBoundingClientRect();
    el.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + "px";
    el.style.top = Math.max(8, r.bottom + 8) + "px";
  }
  function showCombo() {
    var el = chip(); place(el);
    el.className = "afx-combo is-on" + (streak >= 5 ? " is-hot" : "");
    el.innerHTML = '<span class="afx-fire">🔥</span> x' + streak + " <em>" + label(streak) + "</em>";
    void el.offsetWidth; el.classList.add("is-bump");
  }
  function celebrate(n) {
    var c = CHEERS[Math.min(Math.floor(n / 10) - 1, 2)];
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
    ok: function () {
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = document.getElementById("game-app"); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim();
      if (/^\d+\s*\/\s*\d+$/.test(t)) { if (!badge) badge = els[i]; }
      else if (!t && /progress/.test(els[i].className) && !els[i].classList.contains("afx-bar")) hasBar = true;
    }
    if (!badge || hasBar) return;
    var m = badge.textContent.trim().match(/^(\d+)\s*\/\s*(\d+)$/), pct = Math.min(100, Math.round(m[1] / m[2] * 100));
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
    var app = document.getElementById("game-app"); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* Are you…? – AEF Starter Unit 1A Communicative */
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
  // Local aliases used by many games
  window.sfxTap = sfxTap;
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxCelebrate = sfxCelebrate;

  // Auto-play on common feedback class tokens (debounced)
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


  const GAME_ID = "starter-1a-are-you";

  const NAMES = [
    "Katy Perry",
    "Ed Sheeran",
    "Beyoncé",
    "Cameron Diaz",
    "Denzel Washington",
    "Tom Hanks",
    "Shakira",
    "Jennifer Lopez",
    "Selena Gomez",
    "Emilia Clarke",
  ];

  const POSE = {
    waiting: "https://cdn.imgurl.ir/uploads/a41577_waiting.png",
    thinking: "https://cdn.imgurl.ir/uploads/l567467_thinking.png",
    asking: "https://cdn.imgurl.ir/uploads/y384181_asking.png",
    picking: "https://cdn.imgurl.ir/uploads/m599486_picking.png",
    success: "https://cdn.imgurl.ir/uploads/q30412_success.png",
  };

  const app = document.getElementById("game-app");
  if (!app) return;

  let mode = "start"; // start | part1 | part1-win | part2-pick | part2 | part2-win | again
  let secret = "";
  let playerRole = "";
  let usedSecrets = [];
  let guesses = 0;
  let part1Done = false;
  let part2Done = false;
  let aiPool = [];
  let aiAsked = [];
  let waitingForAnswer = false;
  let thinkTimer = null;

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/[?.!]+$/g, "");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pickSecret() {
    let pool = NAMES.filter((n) => !usedSecrets.includes(n));
    if (pool.length < 3) {
      usedSecrets = [];
      pool = NAMES.slice();
    }
    secret = pool[Math.floor(Math.random() * pool.length)];
    usedSecrets.push(secret);
    guesses = 0;
  }

  function parseAreYou(input) {
    const n = norm(input);
    // Accept: "are you ed sheeran" / "are you ed sheeran?"
    const m = n.match(/^are you\s+(.+)$/);
    if (!m) return null;
    const namePart = m[1].trim();
    // Find matching celebrity (allow partial last-name only if unique)
    const hit = NAMES.find((name) => norm(name) === namePart);
    if (hit) return hit;
    // fuzzy: last name only
    const byLast = NAMES.filter((name) => {
      const parts = norm(name).split(" ");
      return parts[parts.length - 1] === namePart || norm(name).includes(namePart);
    });
    if (byLast.length === 1) return byLast[0];
    return namePart; // unknown name string
  }

  function isYes(input) {
    const n = norm(input);
    return (
      n === "yes i am" ||
      n === "yes, i am" ||
      n === "yes i'm" ||
      n === "yes i'm" ||
      n === "yes"
    );
  }

  function isNo(input) {
    const n = norm(input);
    return (
      n === "no i'm not" ||
      n === "no i'm not" ||
      n === "no, i'm not" ||
      n === "no, i am not" ||
      n === "no i am not" ||
      n === "no"
    );
  }

  function calcStars() {
    // 3 if both parts done, 2 if one, 1 if started and got at least one right
    if (part1Done && part2Done) return 3;
    if (part1Done || part2Done) return 2;
    return guesses > 0 ? 1 : 0;
  }

  function saveStars() {
    const stars = calcStars();
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
    return stars;
  }

  function setPose(src, alt) {
    const img = document.getElementById("ay-char");
    if (img) {
      img.src = src;
      img.alt = alt || "";
    }
  }

  function bubble(text, who) {
    const el = document.getElementById("ay-bubble");
    if (!el) return;
    el.className = "ay-bubble " + (who || "char");
    el.innerHTML = text;
  }

  function chipSuggestions(filterFn) {
    const names = typeof filterFn === "function" ? NAMES.filter(filterFn) : NAMES;
    return names
      .map(
        (n) =>
          `<button type="button" class="ay-chip" data-name="${escapeHtml(n)}">${escapeHtml(n)}</button>`
      )
      .join("");
  }

  /* ---------- SCREENS ---------- */

  function showStart() {
    mode = "start";
    clearTimeout(thinkTimer);
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="../" aria-label="Back">←</a>
        <span class="ay-title">Are you…?</span>
        <span class="ay-badge">1A</span>
      </header>
      <section class="ay-start">
        <div class="ay-hero-char">
          <img src="${POSE.waiting}" alt="Character" class="ay-char-img">
        </div>
        <h1>Are you…?</h1>
        <p class="ay-desc">Practice questions with <strong>Are you…?</strong><br>
          and answers <strong>Yes, I am.</strong> / <strong>No, I'm not.</strong></p>
        <div class="ay-parts">
          <div class="ay-part-card">
            <span class="ay-part-num">1</span>
            <div>
              <strong>Guess who</strong>
              <p>I pick a celebrity. You ask!</p>
            </div>
          </div>
          <div class="ay-part-card">
            <span class="ay-part-num">2</span>
            <div>
              <strong>My turn</strong>
              <p>You pick. I ask questions!</p>
            </div>
          </div>
        </div>
        <button type="button" class="ay-btn" id="ay-go">Start Part 1</button>
      </section>`;
    document.getElementById("ay-go").onclick = startPart1;
  }

  function startPart1() {
    mode = "part1";
    if (window.LAFinish) LAFinish.startTimer();
    pickSecret();
    waitingForAnswer = false;
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="#" id="ay-back" aria-label="Back">←</a>
        <span class="ay-title">Part 1 · Guess who</span>
        <span class="ay-badge">Ask me</span>
      </header>
      <div class="ay-stage">
        <div class="ay-orbit" id="ay-orbit" aria-label="Celebrity names">
          <div class="ay-char-wrap">
            <img id="ay-char" class="ay-char-img" src="${POSE.waiting}" alt="Waiting">
          </div>
          ${NAMES.map((n, i) => `<span class="ay-name ay-orbit-name" style="--i:${i};--n:${NAMES.length}">${escapeHtml(n)}</span>`).join("")}
        </div>
        <div id="ay-bubble" class="ay-bubble char">Hmm… Who am I?<br>Ask me: <em>Are you …?</em></div>
      </div>
      <form class="ay-form" id="ay-form" autocomplete="off">
        <input type="text" class="ay-input" id="ay-input" placeholder="Are you Ed Sheeran?" maxlength="60" spellcheck="false">
        <button type="submit" class="ay-btn ay-send">Ask</button>
      </form>`;

    document.getElementById("ay-back").onclick = (e) => {
      e.preventDefault();
      showStart();
    };
    document.getElementById("ay-form").onsubmit = (e) => {
      e.preventDefault();
      handlePart1Guess();
    };
    setTimeout(() => document.getElementById("ay-input").focus(), 150);
  }

  function handlePart1Guess() {
    const input = document.getElementById("ay-input");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    const asked = parseAreYou(raw);
    guesses++;

    if (!asked || !raw.toLowerCase().includes("are you")) {
      bubble("Ask like this:<br><strong>Are you Ed Sheeran?</strong>", "char");
      setPose(POSE.waiting, "Waiting");
      input.select();
      return;
    }

    if (norm(asked) === norm(secret) || asked === secret) {
      // Correct!
      part1Done = true;
      setPose(POSE.success, "Yes!");
      bubble(`Yes, I am!<br>I'm <strong>${escapeHtml(secret)}</strong> 🎉`, "char");
      input.value = "";
      input.disabled = true;
      document.querySelector(".ay-send").disabled = true;
      mode = "part1-win";
      setTimeout(showPart1Win, 1200);
      return;
    }

    // Wrong
    setPose(POSE.waiting, "No");
    bubble(`No, I'm not.<br><span class="ay-soft">Try another name!</span>`, "char");
    input.value = "";
    input.focus();
  }

  function showPart1Win() {
    mode = "part1-win";
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="../" aria-label="Back">←</a>
        <span class="ay-title">Part 1 complete</span>
        <span class="ay-badge">✓</span>
      </header>
      <section class="ay-win">
        <img class="ay-char-img ay-char-lg" src="${POSE.success}" alt="Success">
        <h1>You found me!</h1>
        <p>I was <strong>${escapeHtml(secret)}</strong>.</p>
        <p class="ay-soft">You asked ${guesses} time${guesses === 1 ? "" : "s"}.</p>
        <button type="button" class="ay-btn" id="ay-to-2">Play Part 2 →</button>
        <button type="button" class="ay-btn secondary" id="ay-again-1">Again? (new person)</button>
      </section>`;
    document.getElementById("ay-to-2").onclick = startPart2Pick;
    document.getElementById("ay-again-1").onclick = startPart1;
  }

  function startPart2Pick() {
    mode = "part2-pick";
    clearTimeout(thinkTimer);
    playerRole = "";
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="#" id="ay-back" aria-label="Back">←</a>
        <span class="ay-title">Part 2 · You choose</span>
        <span class="ay-badge">Secret</span>
      </header>
      <div class="ay-stage">
        <div class="ay-char-wrap">
          <img id="ay-char" class="ay-char-img" src="${POSE.picking}" alt="Pick a role">
        </div>
        <div id="ay-bubble" class="ay-bubble char">Choose who <strong>you</strong> are.<br>Don't tell me… I'll ask!</div>
      </div>
      <div class="ay-pick-grid" id="ay-pick">
        ${NAMES.map(
          (n) =>
            `<button type="button" class="ay-pick" data-name="${escapeHtml(n)}">${escapeHtml(n)}</button>`
        ).join("")}
      </div>`;

    document.getElementById("ay-back").onclick = (e) => {
      e.preventDefault();
      showStart();
    };
    document.querySelectorAll(".ay-pick").forEach((btn) => {
      btn.onclick = () => {
        playerRole = btn.dataset.name;
        beginPart2Ask();
      };
    });
  }

  function beginPart2Ask() {
    mode = "part2";
    // AI asks names until it hits playerRole — shuffle remaining names
    aiPool = shuffle(NAMES.filter((n) => n !== playerRole).concat([playerRole]));
    // Put correct answer not first
    if (aiPool[0] === playerRole && aiPool.length > 1) {
      const j = 1 + Math.floor(Math.random() * (aiPool.length - 1));
      [aiPool[0], aiPool[j]] = [aiPool[j], aiPool[0]];
    }
    aiAsked = [];
    waitingForAnswer = false;

    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="#" id="ay-back" aria-label="Back">←</a>
        <span class="ay-title">Part 2 · Answer me</span>
        <span class="ay-badge">You: secret</span>
      </header>
      <div class="ay-stage">
        <div class="ay-char-wrap">
          <img id="ay-char" class="ay-char-img" src="${POSE.thinking}" alt="Thinking">
        </div>
        <div id="ay-bubble" class="ay-bubble char">Thinking…</div>
      </div>
      <div class="ay-answer-bank">
        <button type="button" class="ay-chip ay-ans" data-ans="No, I'm not.">No, I'm not.</button>
        <button type="button" class="ay-chip ay-ans" data-ans="Yes, I am.">Yes, I am.</button>
      </div>
      <form class="ay-form" id="ay-form" autocomplete="off">
        <input type="text" class="ay-input" id="ay-input" placeholder="Yes, I am. / No, I'm not." maxlength="40" spellcheck="false" disabled>
        <button type="submit" class="ay-btn ay-send" disabled>Say</button>
      </form>
      <p class="ay-hint">You are <strong>${escapeHtml(playerRole)}</strong> (secret!)</p>`;

    document.getElementById("ay-back").onclick = (e) => {
      e.preventDefault();
      clearTimeout(thinkTimer);
      startPart2Pick();
    };
    document.getElementById("ay-form").onsubmit = (e) => {
      e.preventDefault();
      handlePart2Answer();
    };
    document.querySelectorAll(".ay-ans").forEach((btn) => {
      btn.onclick = () => {
        const input = document.getElementById("ay-input");
        if (!input || input.disabled) return;
        input.value = btn.dataset.ans;
        handlePart2Answer();
      };
    });

    // Think 1s then ask
    scheduleNextQuestion();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function scheduleNextQuestion() {
    waitingForAnswer = false;
    const input = document.getElementById("ay-input");
    const send = document.querySelector(".ay-send");
    if (input) {
      input.value = "";
      input.disabled = true;
    }
    if (send) send.disabled = true;

    setPose(POSE.thinking, "Thinking");
    bubble("Thinking…", "char");

    clearTimeout(thinkTimer);
    thinkTimer = setTimeout(() => {
      const next = aiPool.find((n) => !aiAsked.includes(n));
      if (!next) {
        // fallback
        finishPart2(false);
        return;
      }
      aiAsked.push(next);
      setPose(POSE.asking, "Asking");
      bubble(`Are you <strong>${escapeHtml(next)}</strong>?`, "char");
      waitingForAnswer = true;
      if (input) {
        input.disabled = false;
        input.focus();
      }
      if (send) send.disabled = false;
    }, 1000);
  }

  function handlePart2Answer() {
    if (!waitingForAnswer) return;
    const input = document.getElementById("ay-input");
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    const lastAsked = aiAsked[aiAsked.length - 1];
    const shouldBeYes = norm(lastAsked) === norm(playerRole);

    if (shouldBeYes) {
      if (isYes(raw)) {
        waitingForAnswer = false;
        part2Done = true;
        try{sfxCorrect();}catch(e){}
        setPose(POSE.success, "Found you!");
        bubble(`Yes! You are <strong>${escapeHtml(playerRole)}</strong>! 🎉`, "char");
        input.disabled = true;
        document.querySelector(".ay-send").disabled = true;
        setTimeout(showPart2Win, 1100);
      } else if (isNo(raw)) {
        try{sfxWrong();}catch(e){}
        bubble("Hmm… Are you sure?<br>Try again: <strong>Yes, I am.</strong>", "char");
        input.value = "";
        input.focus();
      } else {
        bubble('Say <strong>Yes, I am.</strong> or <strong>No, I\'m not.</strong>', "char");
        input.select();
      }
      return;
    }

    // Character asked wrong person
    if (isNo(raw)) {
      waitingForAnswer = false;
      bubble("Okay…", "char");
      input.disabled = true;
      document.querySelector(".ay-send").disabled = true;
      setTimeout(scheduleNextQuestion, 700);
    } else if (isYes(raw)) {
      bubble("Really? I don't think so…<br>Try: <strong>No, I'm not.</strong>", "char");
      input.value = "";
      input.focus();
    } else {
      bubble('Say <strong>Yes, I am.</strong> or <strong>No, I\'m not.</strong>', "char");
      input.select();
    }
  }

  function showPart2Win() {
    mode = "part2-win";
    const stars = saveStars(); // still save via existing helper (also used by LAFinish if save:true)
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      // Map stars 0-3 to a rough accuracy for the shared screen
      const accuracy = stars === 3 ? 100 : stars === 2 ? 80 : stars === 1 ? 50 : 20;
      LAFinish.show({
        gameId: GAME_ID,
        score: accuracy,
        total: 100,
        stars: stars,
        timeMs: timeMs,
        onAgain: () => {
          part1Done = false;
          part2Done = false;
          startPart1();
        },
        onModes: () => showStart(),
        backHref: "../",
        save: false, // already saved by saveStars()
      });
      return;
    }
    app.innerHTML = `
      <header class="ay-topbar">
        <a class="ay-back" href="../" aria-label="Back">←</a>
        <span class="ay-title">Part 2 complete</span>
        <span class="ay-badge">✓</span>
      </header>
      <section class="ay-win">
        <img class="ay-char-img ay-char-lg" src="${POSE.success}" alt="Success">
        <div class="ay-stars" aria-hidden="true">
          <span>${stars >= 1 ? "⭐" : "☆"}</span>
          <span>${stars >= 2 ? "⭐" : "☆"}</span>
          <span>${stars >= 3 ? "⭐" : "☆"}</span>
        </div>
        <h1>I found you!</h1>
        <p>You were <strong>${escapeHtml(playerRole)}</strong>.</p>
        <button type="button" class="ay-btn" id="ay-again">Again?</button>
        <button type="button" class="ay-btn secondary" id="ay-home">Back to games</button>
      </section>`;
    document.getElementById("ay-again").onclick = () => {
      part1Done = false;
      part2Done = false;
      startPart1();
    };
    document.getElementById("ay-home").onclick = () => {
      window.location.href = "../";
    };
  }

  function finishPart2() {
    showPart2Win();
  }

  showStart();
})();
