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
    var _k = c[1] + "|" + c[2], _n = Date.now(); if (api._bk === _k && _n - (api._bt || 0) < 2500) return; api._bk = _k; api._bt = _n; var _old = document.querySelectorAll(".afx-burst"); for (var _i = 0; _i < _old.length; _i++) if (_old[_i].parentNode) _old[_i].parentNode.removeChild(_old[_i]); 
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

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const GAME_ID = "starter-3a-a-an-swipe";
  const MP_SERVER = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:3001"
    : "https://mrsheyhaki-multiplayer.onrender.com";

  const WORDS = [
    { word: "apple", article: "an" },
    { word: "apartment", article: "an" },
    { word: "egg", article: "an" },
    { word: "email", article: "an" },
    { word: "ice cream", article: "an" },
    { word: "insect", article: "an" },
    { word: "orange", article: "an" },
    { word: "octopus", article: "an" },
    { word: "umbrella", article: "an" },
    { word: "uncle", article: "an" },
    { word: "phone", article: "a" },
    { word: "newspaper", article: "a" },
    { word: "charger", article: "a" },
    { word: "memory card", article: "a" },
    { word: "wallet", article: "a" },
    { word: "watch", article: "a" },
    { word: "pen", article: "a" },
    { word: "pencil", article: "a" },
    { word: "notebook", article: "a" },
    { word: "change purse", article: "a" },
    { word: "pencil case", article: "a" },
    { word: "bank card", article: "a" }
  ];

  const TOTAL_SOLO = WORDS.length;
  const START_TIME = 60;

  const $ = id => document.getElementById(id);

  const startOverlay = $("startOverlay");
  const endModal = $("endModal");
  const pauseOverlay = $("pauseOverlay");
  const mpLobbyOverlay = $("mpLobbyOverlay");
  const startBtn = $("startBtn");
  const playAgain = $("playAgain");
  const resumeBtn = $("resumeBtn");
  const card = $("swipeCard");
  const wordEl = $("word");
  const scoreEl = $("score");
  const timerEl = $("timer");
  const progress = $("progressFill");
  const counter = $("counter");
  const feedback = $("feedback");
  const status = $("status");
  const targetA = $("targetA");
  const targetAn = $("targetAn");
  const accuracyLive = $("accuracyLive");
  const bestComboLive = $("bestComboLive");
  const soundBtn = $("soundBtn");
  const soundIcon = $("soundIcon");
  const soundState = $("soundState");
  const pauseBtn = $("pauseBtn");
  const stickKnob = $("stickKnob");

  let state = null;
  let soundOn = true;
  let paused = false;
  let mode = "solo"; // solo | multi
  let socket = null;
  let myId = null;
  let lastRoom = null;
  let accessToken = null;
  let mpAnswered = false;

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function speak(text) {
    if (!soundOn || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  function sfxCorrect() { if (window.ArcadeFX && ArcadeFX.snd) ArcadeFX.snd.correct(); }
  function sfxWrong() { if (window.ArcadeFX && ArcadeFX.snd) ArcadeFX.snd.wrong(); }

  function setMpStatus(msg, kind) {
    const el = $("mpStatus");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "mp-status" + (kind ? " " + kind : "");
  }

  /* ---------- Solo game ---------- */
  function startGame() {
    mode = "solo";
    if (state && state.timer) clearInterval(state.timer);

    state = {
      questions: shuffle(WORDS),
      index: 0,
      score: 0,
      correct: 0,
      attempts: 0,
      combo: 0,
      bestCombo: 0,
      time: START_TIME,
      done: false,
      answering: false,
      dragging: false,
      timer: null,
      total: TOTAL_SOLO,
    };

    startOverlay.classList.add("hidden");
    mpLobbyOverlay.classList.add("hidden");
    endModal.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    card.style.pointerEvents = "auto";
    $("mpFinalBoard").classList.add("hidden");

    showCard();
    updateHUD();

    state.timer = setInterval(() => {
      if (!state || state.done || paused || mode !== "solo") return;
      state.time--;
      updateHUD();
      if (state.time <= 0) finish(false);
    }, 1000);
  }

  function showCard() {
    const total = state.total || state.questions.length;
    const item = state.questions[state.index];

    if (!item && mode === "solo") {
      finish(true);
      return;
    }
    if (!item) return;

    wordEl.textContent = item.word;
    card.className = "swipe-card";
    card.style.transition = "none";
    card.style.transform = "translate3d(0,0,0) rotate(0deg)";
    card.style.opacity = "1";
    card.style.pointerEvents = "auto";

    clearHighlights();
    feedback.className = "feedback";
    feedback.textContent = "";
    mpAnswered = false;

    card.animate(
      [
        { opacity: 0, transform: "translate3d(0,25px,0) scale(.94)" },
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
      ],
      { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" }
    );
  }

  function getDirection(dx, dy) {
    if (Math.abs(dx) < 20 && Math.abs(dy) > Math.abs(dx) * 1.5) return null;
    return dx < 0 ? "left" : "right";
  }

  function targetFor(direction) {
    if (direction === "left") return targetA;
    if (direction === "right") return targetAn;
    return null;
  }

  function highlight(dx) {
    clearHighlights();
    if (Math.abs(dx) < 25) return;
    const direction = dx < 0 ? "left" : "right";
    const target = targetFor(direction);
    if (target) target.classList.add("active");
    card.classList.toggle("swiping-left", direction === "left");
    card.classList.toggle("swiping-right", direction === "right");
  }

  function clearHighlights() {
    targetA.classList.remove("active", "correct", "wrong");
    targetAn.classList.remove("active", "correct", "wrong");
    card.classList.remove("swiping-left", "swiping-right");
  }

  function returnCard() {
    card.style.transition = "transform .4s cubic-bezier(.22,1,.36,1)";
    card.style.transform = "translate3d(0,0,0) rotate(0deg)";
    setTimeout(() => {
      if (!state || state.done) return;
      card.style.transition = "";
      clearHighlights();
    }, 400);
  }

  function attempt(direction) {
    if (!state || state.done || state.answering || paused) return;
    if (direction !== "left" && direction !== "right") {
      returnCard();
      return;
    }

    if (mode === "multi") {
      if (mpAnswered) return;
      mpAnswered = true;
      state.answering = true;
      const selected = direction === "left" ? "a" : "an";
      card.classList.add(`exit-${direction}`);
      if (socket) socket.emit("game:answer", { answer: selected });
      return;
    }

    // Solo
    state.attempts++;
    const item = state.questions[state.index];
    const selected = direction === "left" ? "a" : "an";
    if (selected === item.article) handleCorrect(direction, item);
    else handleWrong(direction);
  }

  function handleCorrect(direction, item) {
    state.answering = true;
    sfxCorrect();
    state.correct++;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const points = 10 + Math.max(0, state.combo - 1) * 2;
    state.score += points;
    const target = targetFor(direction);
    if (target) target.classList.add("correct");
    feedback.textContent = `+${points}`;
    feedback.className = "feedback show correct";
    status.textContent = `Correct: ${item.article} ${item.word}.`;
    speak(`${item.article} ${item.word}`);
    updateHUD();
    card.classList.add(`exit-${direction}`);
    setTimeout(() => {
      if (!state || state.done) return;
      state.index++;
      if (state.index >= state.total) {
        finish(true);
        return;
      }
      state.answering = false;
      showCard();
    }, 450);
  }

  function handleWrong(direction) {
    state.combo = 0;
    const target = targetFor(direction);
    sfxWrong();
    if (target) target.classList.add("wrong");
    feedback.textContent = "Try again!";
    feedback.className = "feedback show wrong";
    status.textContent = "Wrong article. Try again.";
    speak("Try again");
    updateHUD();
    returnCard();
  }

  function updateHUD() {
    if (!state) return;
    const total = state.total || 1;
    scoreEl.textContent = state.score;
    timerEl.textContent = formatTime(Math.max(0, state.time));
    progress.style.width = `${(state.index / total) * 100}%`;
    counter.textContent = `${state.index} / ${total}`;
    const acc = state.attempts
      ? Math.round((state.correct / state.attempts) * 100)
      : 100;
    accuracyLive.textContent = `${acc}%`;
    bestComboLive.textContent = state.bestCombo;
  }

  function finish(won) {
    if (!state || state.done) return;
    state.done = true;
    if (state.timer) clearInterval(state.timer);
    card.style.pointerEvents = "none";
    const total = state.total || 1;
    const accuracy = state.attempts
      ? Math.round((state.correct / state.attempts) * 100)
      : 0;
    $("finalScore").textContent = state.score;
    $("accuracy").textContent = `${accuracy}%`;
    $("bestCombo").textContent = state.bestCombo;
    try {
      if (window.LAStars && mode === "solo") {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, accuracy);
      }
    } catch (e) {}
    $("endTitle").textContent = won ? "Excellent!" : "Time's up!";
    $("endMessage").textContent = won
      ? `You matched all ${total} words.`
      : `You matched ${state.correct} of ${total}.`;
    $("resultIcon").textContent = won ? "🏆" : "⏱";
    endModal.classList.remove("hidden");
  }

  /* ---------- Multiplayer ---------- */
  async function getAccessToken() {
    if (!window.LAAuth || !window.LAAuth.getClient) return null;
    const client = window.LAAuth.getClient();
    if (!client) return null;
    try {
      const res = await client.auth.getSession();
      if (res.data && res.data.session) return res.data.session.access_token;
    } catch (e) {}
    return null;
  }

  function inviteUrl(code) {
    const u = new URL(location.href);
    u.searchParams.set("room", code);
    return u.toString();
  }

  function renderMpPlayers(room) {
    const list = $("mpPlayerList");
    if (!room || !room.players) {
      list.innerHTML = "";
      return;
    }
    list.innerHTML = room.players.map((p) => {
      const you = p.id === myId ? " (you)" : "";
      const host = p.isHost ? " 👑" : "";
      const ready = p.ready ? "✅ ready" : "⏳ waiting";
      return `<div class="mp-player"><span>${p.displayName || p.username}${you}${host}</span><span>${ready}</span></div>`;
    }).join("");
  }

  function showMpRoom(room) {
    lastRoom = room;
    $("mpHomePanel").classList.add("hidden");
    $("mpRoomPanel").classList.remove("hidden");
    $("mpRoomCode").textContent = room.code;
    $("mpInviteLink").value = inviteUrl(room.code);
    renderMpPlayers(room);
    const isHost = room.hostId === myId;
    $("mpStartBtn").classList.toggle("hidden", !isHost);
    const me = room.players.find((p) => p.id === myId);
    $("mpReadyBtn").textContent = me && me.ready ? "NOT READY" : "I'M READY";
  }

  function connectSocket() {
    return new Promise(async (resolve, reject) => {
      accessToken = await getAccessToken();
      if (!accessToken) {
        reject(new Error("Please log in first"));
        return;
      }
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      socket = io(MP_SERVER, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
      });
      socket.on("connect", () => resolve());
      socket.on("connect_error", (err) => reject(err));
      socket.on("server:hello", (d) => {
        if (d && d.player) myId = d.player.id;
      });
      socket.on("room:update", (room) => {
        lastRoom = room;
        if (room.status === "lobby") showMpRoom(room);
      });
      socket.on("room:error", (e) => setMpStatus((e && e.error) || "Error", "err"));
      socket.on("game:question", (q) => {
        startOverlay.classList.add("hidden");
        mpLobbyOverlay.classList.add("hidden");
        endModal.classList.add("hidden");
        mode = "multi";
        if (!state || state.done) {
          state = {
            questions: [],
            index: q.index,
            score: 0,
            correct: 0,
            attempts: 0,
            combo: 0,
            bestCombo: 0,
            time: q.timeLimit || 8,
            done: false,
            answering: false,
            dragging: false,
            timer: null,
            total: q.total,
          };
        }
        state.index = q.index;
        state.total = q.total;
        state.answering = false;
        state.done = false;
        state.questions[q.index] = { word: q.word, article: null };
        state.time = q.timeLimit || 8;
        mpAnswered = false;
        card.style.pointerEvents = "auto";
        showCard();
        updateHUD();
        if (state.timer) clearInterval(state.timer);
        state.timer = setInterval(() => {
          if (!state || state.done || paused || mode !== "multi") return;
          state.time--;
          updateHUD();
        }, 1000);
      });
      socket.on("game:answerResult", (r) => {
        state.attempts++;
        if (r.correct) {
          sfxCorrect();
          state.correct++;
          state.combo++;
          state.bestCombo = Math.max(state.bestCombo, state.combo);
          state.score += r.points || 0;
          feedback.textContent = `+${r.points}`;
          feedback.className = "feedback show correct";
          speak(`${r.article} ${r.word}`);
        } else {
          sfxWrong();
          state.combo = 0;
          feedback.textContent = `Wrong — "${r.article}"`;
          feedback.className = "feedback show wrong";
        }
        updateHUD();
        state.answering = true;
      });
      socket.on("game:scoreboard", (list) => {
        // live scores in counter area via status
        if (!list || !list.length) return;
        const me = list.find((s) => s.id === myId);
        if (me) {
          state.score = me.score;
          state.correct = me.correct;
          updateHUD();
        }
      });
      socket.on("game:end", (data) => {
        mode = "multi";
        if (state && state.timer) clearInterval(state.timer);
        if (state) state.done = true;
        card.style.pointerEvents = "none";
        const board = $("mpFinalBoard");
        board.classList.remove("hidden");
        if (data && data.scoreboard) {
          board.innerHTML = "<strong>Ranking</strong>" + data.scoreboard.map((s, i) =>
            `<div class="mp-score-row"><span>${i + 1}. ${s.displayName || s.username}${s.id === myId ? " (you)" : ""}</span><span>${s.score} pts</span></div>`
          ).join("");
          const me = data.scoreboard.find((s) => s.id === myId);
          if (me) {
            $("finalScore").textContent = me.score;
            $("accuracy").textContent = me.correct + " correct";
          }
        }
        $("endTitle").textContent = "Match over!";
        $("endMessage").textContent = "Great game — check the ranking.";
        $("resultIcon").textContent = "🏆";
        $("bestCombo").textContent = state ? state.bestCombo : 0;
        endModal.classList.remove("hidden");
      });
    });
  }

  async function openMultiplayer() {
    setMpStatus("Connecting…");
    $("mpHomePanel").classList.remove("hidden");
    $("mpRoomPanel").classList.add("hidden");
    startOverlay.classList.add("hidden");
    mpLobbyOverlay.classList.remove("hidden");
    try {
      await connectSocket();
      setMpStatus("Connected", "ok");
      // Auto-join from ?room=
      const roomParam = (new URLSearchParams(location.search).get("room") || "").trim().toUpperCase();
      if (roomParam.length >= 4) {
        $("mpJoinInput").value = roomParam;
        $("mpJoinBtn").click();
      }
    } catch (e) {
      setMpStatus((e && e.message) || "Could not connect. Log in first.", "err");
    }
  }

  $("btnMultiplayer").addEventListener("click", openMultiplayer);
  $("mpLobbyBack").addEventListener("click", () => {
    if (socket) socket.emit("room:leave", {});
    mpLobbyOverlay.classList.add("hidden");
    startOverlay.classList.remove("hidden");
  });

  $("mpCreateBtn").addEventListener("click", () => {
    if (!socket) return;
    setMpStatus("Creating room…");
    socket.emit("room:create", {}, (res) => {
      if (!res || !res.ok) {
        setMpStatus((res && res.error) || "Failed", "err");
        return;
      }
      showMpRoom(res.room);
      socket.emit("room:setReady", { ready: true });
      setMpStatus("Room created — share the link", "ok");
    });
  });

  $("mpJoinBtn").addEventListener("click", () => {
    if (!socket) return;
    const code = ($("mpJoinInput").value || "").trim().toUpperCase();
    if (code.length < 4) {
      setMpStatus("Enter a valid code", "err");
      return;
    }
    setMpStatus("Joining…");
    socket.emit("room:join", { code }, (res) => {
      if (!res || !res.ok) {
        setMpStatus((res && res.error) || "Could not join", "err");
        return;
      }
      showMpRoom(res.room);
      socket.emit("room:setReady", { ready: true });
      setMpStatus("Joined — wait for host to start", "ok");
    });
  });

  $("mpReadyBtn").addEventListener("click", () => {
    if (!socket || !lastRoom || !myId) return;
    const me = lastRoom.players.find((p) => p.id === myId);
    socket.emit("room:setReady", { ready: !(me && me.ready) });
  });

  $("mpStartBtn").addEventListener("click", () => {
    if (!socket) return;
    socket.emit("game:start", { questionCount: 8, timePerQuestion: 8 });
  });

  $("mpLeaveBtn").addEventListener("click", () => {
    if (socket) socket.emit("room:leave", {});
    $("mpRoomPanel").classList.add("hidden");
    $("mpHomePanel").classList.remove("hidden");
    const u = new URL(location.href);
    u.searchParams.delete("room");
    history.replaceState(null, "", u.pathname + u.search);
    setMpStatus("");
  });

  $("mpCopyBtn").addEventListener("click", () => {
    const input = $("mpInviteLink");
    input.select();
    try {
      navigator.clipboard.writeText(input.value);
      $("mpCopyBtn").textContent = "OK";
      setTimeout(() => { $("mpCopyBtn").textContent = "Copy"; }, 1200);
    } catch (e) {
      document.execCommand("copy");
    }
  });

  /* ---------- Pointer / stick / keys (same as solo) ---------- */
  function onPointerDown(e) {
    if (!state || state.done || state.dragging || state.answering || paused) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    state.dragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    card.classList.add("dragging");
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onPointerMove(e) {
    if (!state?.dragging || state.done || paused) return;
    e.preventDefault();
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    const clampedDy = Math.max(-40, Math.min(40, dy * 0.35));
    const rotation = Math.max(-14, Math.min(14, dx * 0.045));
    card.style.transform = `translate3d(${dx}px,${clampedDy}px,0) rotate(${rotation}deg)`;
    highlight(dx);
  }

  function onPointerUp(e) {
    if (!state?.dragging || state.done) return;
    e.preventDefault();
    state.dragging = false;
    card.classList.remove("dragging");
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    try { card.releasePointerCapture(e.pointerId); } catch (_) {}
    clearHighlights();
    if (Math.abs(dx) < 55) {
      returnCard();
      return;
    }
    attempt(getDirection(dx, dy));
  }

  function onPointerCancel() {
    if (!state?.dragging) return;
    state.dragging = false;
    card.classList.remove("dragging");
    clearHighlights();
    returnCard();
  }

  card.addEventListener("pointerdown", onPointerDown);
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerCancel);

  targetA.addEventListener("click", () => {
    if (!state || state.done || state.answering || paused) return;
    attempt("left");
  });
  targetAn.addEventListener("click", () => {
    if (!state || state.done || state.answering || paused) return;
    attempt("right");
  });

  let stickDragging = false;
  let stickOrigin = { x: 0, y: 0 };

  function resetStick() {
    stickKnob.style.transform = "translate(0,0)";
    stickKnob.classList.remove("dragging");
  }

  stickKnob.addEventListener("pointerdown", (e) => {
    if (!state || state.done || state.answering || paused) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    stickDragging = true;
    stickOrigin = { x: e.clientX, y: e.clientY };
    stickKnob.classList.add("dragging");
    try { stickKnob.setPointerCapture(e.pointerId); } catch (_) {}
  });
  stickKnob.addEventListener("pointermove", (e) => {
    if (!stickDragging) return;
    e.preventDefault();
    const dx = e.clientX - stickOrigin.x;
    const max = 42;
    const clampedX = Math.max(-max, Math.min(max, dx));
    stickKnob.style.transform = `translate(${clampedX}px, 0)`;
    if (Math.abs(clampedX) > 12) highlight(clampedX);
    else clearHighlights();
  });
  stickKnob.addEventListener("pointerup", (e) => {
    if (!stickDragging) return;
    e.preventDefault();
    stickDragging = false;
    const dx = e.clientX - stickOrigin.x;
    resetStick();
    clearHighlights();
    if (Math.abs(dx) > 28) attempt(dx < 0 ? "left" : "right");
  });
  stickKnob.addEventListener("pointercancel", () => {
    stickDragging = false;
    resetStick();
    clearHighlights();
  });

  document.addEventListener("keydown", (e) => {
    if (!state || state.done || state.answering || paused) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      attempt("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      attempt("right");
    }
  });

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? "🔊" : "🔇";
    soundState.textContent = soundOn ? "ON" : "OFF";
    if (!soundOn && "speechSynthesis" in window) speechSynthesis.cancel();
  });

  pauseBtn.addEventListener("click", () => {
    if (!state || state.done) return;
    paused = true;
    pauseOverlay.classList.remove("hidden");
  });
  resumeBtn.addEventListener("click", () => {
    paused = false;
    pauseOverlay.classList.add("hidden");
  });

  startBtn.addEventListener("click", startGame);
  playAgain.addEventListener("click", () => {
    if (mode === "multi" && socket && lastRoom && lastRoom.hostId === myId) {
      socket.emit("game:backToLobby", {});
      endModal.classList.add("hidden");
      mpLobbyOverlay.classList.remove("hidden");
      return;
    }
    startGame();
  });

  // Deep link: ?room=CODE opens multiplayer
  const roomQ = (new URLSearchParams(location.search).get("room") || "").trim();
  if (roomQ.length >= 4) {
    // slight delay for auth scripts
    setTimeout(() => openMultiplayer(), 400);
  }
});
