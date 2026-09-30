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

/* Sentence Speaking – Clothes · AEF Starter Unit 9B */
const prompts = [
  { sentence: "I'm wearing a shirt and a skirt.", image: "https://cdn.imgurl.ir/uploads/n182445_a_shirt_and_a_st.png" },
  { sentence: "I'm wearing a red sweater.", image: "https://cdn.imgurl.ir/uploads/e340185_a_red_swer.png" },
  { sentence: "I'm wearing a new suit.", image: "https://cdn.imgurl.ir/uploads/j111_a_new_suit.png" },
  { sentence: "I'm wearing an old coat.", image: "https://cdn.imgurl.ir/uploads/r091876_an_old_coat.png" },
  { sentence: "I'm wearing a black jacket.", image: "https://cdn.imgurl.ir/uploads/y75934_a_black_jacket.png" },
  { sentence: "I'm wearing blue shoes.", image: "https://cdn.imgurl.ir/uploads/l4986_blue_shoes.png" },
  { sentence: "I'm wearing green sneakers.", image: "https://cdn.imgurl.ir/uploads/p38982_green_sneakers.png" }
];

const GAME_ID = "starter-9b-sentence-speaking";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const startScreen = document.querySelector("#startScreen");
const gameScreen = document.querySelector("#gameScreen");
const finishScreen = document.querySelector("#finishScreen");
const startButton = document.querySelector("#startButton");
const againButton = document.querySelector("#againButton");
const picture = document.querySelector("#picture");
const sentence = document.querySelector("#sentence");
const progressText = document.querySelector("#progressText");
const heard = document.querySelector("#heard");
const feedback = document.querySelector("#feedback");
const micButton = document.querySelector("#micButton");
const micText = document.querySelector("#micText");
const supportMessage = document.querySelector("#supportMessage");
const finishScore = document.querySelector("#finishScore");

let order = [];
let index = 0;
let score = 0;
let recognition = null;
let listening = false;
let answerLocked = false;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function currentPrompt() { return order[index]; }

function stopRecognition() {
  if (!recognition) return;
  try { recognition.stop(); } catch (_) {}
  listening = false;
  micButton.classList.remove("is-listening");
  micButton.setAttribute("aria-pressed", "false");
  micText.textContent = "Speak";
}

function setFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = "ss-feedback" + (type ? ` ${type}` : "");
}

function renderRound() {
  const prompt = currentPrompt();
  if (!prompt) return finishGame();
  answerLocked = false;
  picture.src = prompt.image;
  picture.alt = "Picture for: " + prompt.sentence;
  sentence.textContent = prompt.sentence;
  progressText.textContent = `${index + 1} / ${order.length}`;
  heard.textContent = "Press the microphone and speak.";
  setFeedback("", "");
  stopRecognition();
  exposeState();
}

function setupRecognition() {
  if (!SpeechRecognition) {
    micButton.disabled = true;
    supportMessage.textContent = "Voice recognition is not supported in this browser. Please use Chrome or Edge.";
    return false;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    micButton.classList.add("is-listening");
    micButton.setAttribute("aria-pressed", "true");
    micText.textContent = "Listening";
    heard.textContent = "Listening… say the sentence now.";
    setFeedback("", "");
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    heard.textContent = `Heard: “${transcript.trim()}”`;

    const finalResult = event.results[event.results.length - 1];
    if (finalResult && finalResult.isFinal) checkAnswer(transcript);
  };

  recognition.onerror = (event) => {
    listening = false;
    micButton.classList.remove("is-listening");
    micButton.setAttribute("aria-pressed", "false");
    micText.textContent = "Speak";
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setFeedback("Microphone access was blocked. Allow microphone access and try again.", "bad");
    } else if (event.error === "no-speech") {
      setFeedback("I didn't hear you. Press the microphone and try again.", "bad");
    } else {
      setFeedback("Voice recognition stopped. Press the microphone and try again.", "bad");
    }
  };

  recognition.onend = () => {
    listening = false;
    micButton.classList.remove("is-listening");
    micButton.setAttribute("aria-pressed", "false");
    micText.textContent = "Speak";
  };
  return true;
}

function startListening() {
  if (answerLocked) return;
  if (!SpeechRecognition) return;
  if (!recognition) setupRecognition();
  if (!recognition) return;
  if (listening) { stopRecognition(); return; }
  heard.textContent = "Listening… say the sentence now.";
  try { recognition.start(); }
  catch (_) { stopRecognition(); }
}

function checkAnswer(transcript) {
  if (answerLocked) return;
  const expected = normalize(currentPrompt().sentence);
  const spoken = normalize(transcript);
  if (spoken === expected) {
    answerLocked = true;
    stopRecognition();
    score += 1;
    setFeedback("✓ Correct!", "good");
    heard.textContent = `Heard: “${transcript.trim()}”`;
    try { if (window.LASfx) LASfx.play("correct"); } catch (_) {}
    window.setTimeout(() => {
      index += 1;
      if (index >= order.length) finishGame();
      else renderRound();
    }, 900);
  } else {
    setFeedback("Not accepted. Say exactly the sentence shown above.", "bad");
  }
}

function startGame() {
  if (window.LAFinish) { try { LAFinish.startTimer(); } catch (_) {} }
  stopRecognition();
  order = shuffle(prompts);
  index = 0;
  score = 0;
  startScreen.classList.add("hidden");
  finishScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  setupRecognition();
  renderRound();
}

function finishGame() {
  stopRecognition();
  const total = prompts.length;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;
  try {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, accuracy);
    }
  } catch (_) {}
  finishScore.textContent = `${score} / ${total}`;
  document.querySelector("#finishMessage").textContent = `You completed all ${total} sentences with ${accuracy}% exact matches.`;
  gameScreen.classList.add("hidden");
  finishScreen.classList.remove("hidden");
  try {
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({gameId: GAME_ID,score,total,stars,timeMs,onAgain:startGame,onModes:()=>location.href="../",backHref:"../",save:false});
      return;
    }
  } catch (_) {}
  exposeState();
}

function exposeState() {
  window.__sentenceSpeakingState = { index, score, total: prompts.length, expected: currentPrompt()?.sentence || null, listening };
}

startButton.addEventListener("click", startGame);
againButton.addEventListener("click", startGame);
micButton.addEventListener("click", startListening);
setupRecognition();
exposeState();
