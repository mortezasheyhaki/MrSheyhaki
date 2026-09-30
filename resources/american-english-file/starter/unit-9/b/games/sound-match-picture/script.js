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
      var nw = Date.now(); if (nw - (api._o || 0) < 90) return; api._o = nw;
      hookRestart(); streak++; count++; if (streak > best) best = streak;
      if (streak >= 2) { var b = 660 * Math.pow(1.0595, Math.min(streak, 12)); tone(b, 0.09, "triangle", 0.08, 0); tone(b * 1.5, 0.14, "triangle", 0.07, 0.07); showCombo(); }
      if (count % 10 === 0) setTimeout(function () { celebrate(count); }, 250);
    },
    bad: function () {
      var nw = Date.now(); if (nw - (api._b || 0) < 90) return; api._b = nw;
      hookRestart();
      if (streak >= 3) { tone(300, 0.12, "sawtooth", 0.05, 0); tone(200, 0.2, "sawtooth", 0.05, 0.09); }
      if (streak >= 2) { var el = chip(); el.className = "afx-combo is-lost"; el.textContent = "Combo lost"; setTimeout(function () { el.className = "afx-combo"; }, 1200); }
      streak = 0;
    },
    reset: function () { streak = 0; best = 0; count = 0; lastPct = 0; var el = document.getElementById("afx-combo"); if (el) el.className = "afx-combo"; }
  };
  function sync() {
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    place();
    var bar = app.querySelector(".afx-bar");
    if (bar && bar.offsetParent === null) { bar.parentNode.removeChild(bar); bar = null; }
    var badge = null, hasBar = false, els = app.querySelectorAll('[class*="-badge"],[class*="-progress"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim(); if (els[i].offsetParent === null) continue;
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
    var app = (document.getElementById("game-app") || document.getElementById("app")); if (!app) return;
    new MutationObserver(function () { if (q) return; q = requestAnimationFrame(function () { q = 0; sync(); }); }).observe(app, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", function () { place(); });
    window.addEventListener("scroll", function () { place(); }, { passive: true });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();


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
  window.sfxTap = sfxTap; window.sfxCorrect = sfxCorrect; window.sfxWrong = sfxWrong; window.sfxCelebrate = sfxCelebrate;
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
      if (tokens.indexOf("correct") >= 0 || tokens.indexOf("is-correct") >= 0 || tokens.indexOf("picked-ok") >= 0) fire("correct", sfxCorrect);
      else if (tokens.indexOf("wrong") >= 0 || tokens.indexOf("is-wrong") >= 0) fire("wrong", sfxWrong);
      return r;
    };
  } catch (e) {}
})();

/* Sound Match Picture – Clothes · AEF Starter Unit 9B
   Layout from unit 4B; audio + images from Write the Clothes 9B */
const prompts = [
  { word: "cap", image: "https://cdn.imgurl.ir/uploads/b4742_cap.png", audio: "https://cdn.imgurl.ir/uploads/e134028_cap.mp3" },
  { word: "coat", image: "https://cdn.imgurl.ir/uploads/w043594_coat.png", audio: "https://cdn.imgurl.ir/uploads/u242617_coat.mp3" },
  { word: "dress", image: "https://cdn.imgurl.ir/uploads/d995053_dress.png", audio: "https://cdn.imgurl.ir/uploads/l970660_dress.mp3" },
  { word: "hat", image: "https://cdn.imgurl.ir/uploads/o3351_hat.png", audio: "https://cdn.imgurl.ir/uploads/346906_hat.mp3" },
  { word: "jacket", image: "https://cdn.imgurl.ir/uploads/h08586_jacket.png", audio: "https://cdn.imgurl.ir/uploads/q33457_jacket.mp3" },
  { word: "jeans", image: "https://cdn.imgurl.ir/uploads/a152746_jeans.png", audio: "https://cdn.imgurl.ir/uploads/h269634_jeans.mp3" },
  { word: "pants", image: "https://cdn.imgurl.ir/uploads/i04627_pants.png", audio: "https://cdn.imgurl.ir/uploads/q69286_pants.mp3" },
  { word: "shirt", image: "https://cdn.imgurl.ir/uploads/u12886_shirt.png", audio: "https://cdn.imgurl.ir/uploads/c986568_shirt.mp3" },
  { word: "shoes", image: "https://cdn.imgurl.ir/uploads/n483301_shoes.png", audio: "https://cdn.imgurl.ir/uploads/s50478_shoes.mp3" },
  { word: "shorts", image: "https://cdn.imgurl.ir/uploads/v2067_shorts.png", audio: "https://cdn.imgurl.ir/uploads/v415357_shorts.mp3" },
  { word: "skirt", image: "https://cdn.imgurl.ir/uploads/a444189_st.png", audio: "https://cdn.imgurl.ir/uploads/b668114_st.mp3" },
  { word: "sneakers", image: "https://cdn.imgurl.ir/uploads/y8885_sneakers.png", audio: "https://cdn.imgurl.ir/uploads/s70736_sneakers.mp3" },
  { word: "socks", image: "https://cdn.imgurl.ir/uploads/k600200_socks.png", audio: "https://cdn.imgurl.ir/uploads/861379_socks.mp3" },
  { word: "suit", image: "https://cdn.imgurl.ir/uploads/e98017_suit.png", audio: "https://cdn.imgurl.ir/uploads/84414_suit.mp3" },
  { word: "sweater", image: "https://cdn.imgurl.ir/uploads/x441494_swer.png", audio: "https://cdn.imgurl.ir/uploads/w30399_swer.mp3" },
  { word: "T-shirt", image: "https://cdn.imgurl.ir/uploads/a390815_t-shirt.png", audio: "https://cdn.imgurl.ir/uploads/n817923_t-shirt.mp3" },
];

const GAME_ID = "starter-9b-sound-match-picture";

const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const finishScreen = document.querySelector("#finishScreen");
const pictureGrid = document.querySelector("#pictureGrid");
const roundLabel = document.querySelector("#roundLabel");
const progressFill = document.querySelector("#progressFill");
const scoreValue = document.querySelector("#scoreValue");
const finishScore = document.querySelector("#finishScore");
const feedback = document.querySelector("#feedback");
const listenButton = document.querySelector("#listenButton");

let promptOrder = [];
let tileOrder = [];
let roundIndex = 0;
let score = 0;
let acceptingAnswer = false;
let currentAudio = null;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const chosen = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[chosen]] = [copy[chosen], copy[index]];
  }
  return copy;
}

function currentPrompt() {
  return promptOrder[roundIndex];
}

function stopCurrentAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
}

function playCurrentSound() {
  const prompt = currentPrompt();
  if (!prompt) return;
  stopCurrentAudio();
  currentAudio = new Audio(prompt.audio);
  currentAudio.preload = "auto";
  currentAudio.play().catch(() => {
    feedback.textContent = "Tap “Listen again” to play the sound.";
  });
}

function renderTiles() {
  pictureGrid.innerHTML = "";
  tileOrder.forEach((prompt, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "picture-card";
    button.dataset.word = prompt.word;
    button.dataset.choice = String(index + 1);
    button.setAttribute("aria-label", `Picture ${index + 1}`);
    button.innerHTML = `<img src="${prompt.image}" alt="" draggable="false" />`;
    button.addEventListener("click", () => selectPicture(prompt, button));
    pictureGrid.append(button);
  });
}

function updateHud() {
  const complete = score;
  roundLabel.textContent = `Sound ${Math.min(roundIndex + 1, prompts.length)} of ${prompts.length}`;
  scoreValue.textContent = String(score);
  progressFill.style.width = `${(complete / prompts.length) * 100}%`;
}

function beginRound() {
  const prompt = currentPrompt();
  if (!prompt) {
    showFinish();
    return;
  }
  acceptingAnswer = true;
  updateHud();
  feedback.className = "feedback";
  feedback.textContent = "Tap a picture after you listen.";
  window.setTimeout(playCurrentSound, 220);
  exposeState();
}

function selectPicture(selectedPrompt, button) {
  if (!acceptingAnswer || button.disabled) return;

  if (selectedPrompt.word !== currentPrompt().word) {
    button.classList.remove("wrong");
    void button.offsetWidth;
    button.classList.add("wrong");
    feedback.className = "feedback incorrect";
    feedback.textContent = "Not this one. Listen again and try another picture."; try{sfxWrong();}catch(e){}
    window.setTimeout(() => button.classList.remove("wrong"), 650);
    return;
  }

  acceptingAnswer = false;
  stopCurrentAudio();
  button.disabled = true;
  button.classList.add("matched");
  score += 1;
  feedback.className = "feedback correct";
  feedback.textContent = `Great! That sound was “${selectedPrompt.word}.”`;
  updateHud();
  exposeState();
  window.setTimeout(() => {
    roundIndex += 1;
    beginRound();
  }, 820);
}

function showFinish() {
  // Always persist stars/plays first (LAFinish may return early)
  const acc = prompts.length ? Math.round((score / prompts.length) * 100) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
  try {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, acc);
    }
  } catch (e) {}

  if (window.LAFinish) {
    try {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: score,
        total: prompts.length,
        stars: stars,
        timeMs: timeMs,
        onAgain: () => startGame(),
        onModes: () => goHome(),
        backHref: "../",
        save: false, // already saved above
      });
      return;
    } catch (e) {
      console.warn("LAFinish", e);
    }
  }

  stopCurrentAudio();
  gameScreen.classList.add("hidden");
  finishScreen.classList.remove("hidden");
  finishScore.textContent = String(score);
  exposeState();
  const starRow = document.querySelector("#finishStars");
  if (starRow) {
    starRow.innerHTML = [1, 2, 3]
      .map(
        (n) =>
          `<span class="star ${n <= stars ? "is-filled" : ""}">${n <= stars ? "★" : "☆"}</span>`
      )
      .join("");
  }
  prepareScoreSubmit();
}

function prepareScoreSubmit() {
  const input = document.querySelector("#playerNameInput");
  const status = document.querySelector("#scoreSubmitStatus");
  const btn = document.querySelector("#submitScoreBtn");
  if (!input || !btn || typeof LAScores === "undefined") return;
  input.value = LAScores.getPlayerName();
  status.textContent = "";
  status.className = "score-submit-status";
  btn.disabled = false;
  btn.textContent = "Save score";
}

function submitScore() {
  const input = document.querySelector("#playerNameInput");
  const status = document.querySelector("#scoreSubmitStatus");
  const btn = document.querySelector("#submitScoreBtn");
  if (!input || !btn || typeof LAScores === "undefined") return;
  const name = input.value.trim();
  if (!name) {
    status.textContent = "Please enter your name.";
    status.className = "score-submit-status is-err";
    return;
  }
  btn.disabled = true;
  btn.textContent = "Saving…";
  status.textContent = "";
  status.className = "score-submit-status";
  LAScores.submit({
    gameId: "sound-match-picture-clothes",
    gameName: "Sound Match Picture – Clothes",
    score: score,
    maxScore: prompts.length,
    name: name,
  }).then((res) => {
    if (res.ok) {
      status.textContent = "Score saved!";
      status.className = "score-submit-status is-ok";
      btn.textContent = "Saved";
    } else {
      status.textContent = res.error || "Could not save. Check Firebase rules.";
      status.className = "score-submit-status is-err";
      btn.disabled = false;
      btn.textContent = "Save score";
    }
  });
}

document.querySelector("#submitScoreBtn")?.addEventListener("click", submitScore);

function startGame() {
  if (window.LAFinish) LAFinish.startTimer();
  stopCurrentAudio();
  promptOrder = shuffle(prompts);
  tileOrder = shuffle(prompts);
  roundIndex = 0;
  score = 0;
  startScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  renderTiles();
  beginRound();
}

function goHome() {
  stopCurrentAudio();
  gameScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  exposeState();
}

function exposeState() {
  window.__soundMatchState = {
    activeWord: currentPrompt()?.word || null,
    roundIndex,
    score,
    promptCount: prompts.length,
    acceptingAnswer,
    matchedCount: document.querySelectorAll(".picture-card.matched").length,
  };
}

document.querySelector("#startButton").addEventListener("click", startGame);
document.querySelector("#restartButton").addEventListener("click", startGame);
document.querySelector("#homeFromGame").addEventListener("click", goHome);
listenButton.addEventListener("click", playCurrentSound);
document.querySelector("#homeButton").addEventListener("click", goHome);
document.querySelector("#replayButton").addEventListener("click", startGame);
exposeState();
