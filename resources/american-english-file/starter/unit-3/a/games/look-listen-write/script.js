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

/* Look & Listen Write – 2 modes + voice recognition – AEF Starter Unit 3A */
(function () {
  const GAME_ID = "starter-3a-look-listen-write";


  /* ---------- sound effects (Web Audio) ---------- */
  var sfxCtx = null;
  function getSfxCtx() {
    if (!sfxCtx) {
      try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(function () {});
    return sfxCtx;
  }
  function sfxTone(freq, start, dur, type, gain, slideTo) {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, start + dur * 0.85);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain || 0.1), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
  function sfxCorrect() { window.ArcadeFX && ArcadeFX.ok(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.correct(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.1);
    sfxTone(659.25, t + 0.08, 0.12, "triangle", 0.1);
    sfxTone(783.99, t + 0.16, 0.16, "sine", 0.09);
  }).apply(this, arguments); }
  function sfxWrong() { window.ArcadeFX && ArcadeFX.bad(); if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.wrong(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(220, t, 0.14, "sawtooth", 0.05, 140);
    sfxTone(180, t + 0.05, 0.14, "triangle", 0.04, 120);
  }).apply(this, arguments); }
  function sfxClick() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.tap(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    sfxTone(720, ctx.currentTime, 0.045, "sine", 0.04);
  }).apply(this, arguments); }
  function sfxComplete() { if (window.ArcadeFX && ArcadeFX.snd) { ArcadeFX.snd.celebrate(); return; } (function () {
    var ctx = getSfxCtx();
    if (!ctx) return;
    var t = ctx.currentTime;
    sfxTone(523.25, t, 0.1, "triangle", 0.09);
    sfxTone(659.25, t + 0.1, 0.1, "triangle", 0.09);
    sfxTone(783.99, t + 0.2, 0.12, "triangle", 0.1);
    sfxTone(1046.5, t + 0.32, 0.22, "sine", 0.08);
  }).apply(this, arguments); }

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const ITEMS = [
    { id: "cellphone",   label: "a cell phone",  answers: ["cellphone", "cell phone", "a cell phone", "cell-phone", "mobile", "a mobile", "phone", "a phone", "mobile phone", "a mobile phone"], audio: "https://cdn.imgurl.ir/uploads/l582776_cellphone.mp3", image: "https://cdn.imgurl.ir/uploads/y766894_a_cell_phone_1.png" },
    { id: "newspaper",   label: "a newspaper",   answers: ["newspaper", "a newspaper", "paper", "a paper", "news paper"], audio: "https://cdn.imgurl.ir/uploads/t562234_newspaper.mp3", image: "https://cdn.imgurl.ir/uploads/m25347_a_newspaper_1.png" },
    { id: "key",         label: "a key",         answers: ["key", "a key", "keys"], audio: "https://cdn.imgurl.ir/uploads/b438206_key.mp3", image: "https://cdn.imgurl.ir/uploads/r0663_a_key_1.png" },
    { id: "credit-card", label: "a credit card", answers: ["credit card", "a credit card", "creditcard", "credit-card", "card", "a card"], audio: "https://cdn.imgurl.ir/uploads/e878515_credit-card.mp3", image: "https://cdn.imgurl.ir/uploads/c836363_a_credit_card_1.png" },
    { id: "camera",      label: "a camera",      answers: ["camera", "a camera"], audio: "https://cdn.imgurl.ir/uploads/q357436_camera.mp3", image: "https://cdn.imgurl.ir/uploads/22726_a_camera_1.png" },
    { id: "umbrella",    label: "an umbrella",   answers: ["umbrella", "an umbrella", "a umbrella"], audio: "https://cdn.imgurl.ir/uploads/p997348_umbrella.mp3", image: "https://cdn.imgurl.ir/uploads/a45664_an_umbrella_1.png" },
    { id: "passport",    label: "a passport",    answers: ["passport", "a passport"], audio: "https://cdn.imgurl.ir/uploads/t119646_pport.mp3", image: "https://cdn.imgurl.ir/uploads/q11632_pport_1.png" },
    { id: "charger",     label: "a charger",     answers: ["charger", "a charger", "phone charger", "a phone charger"], audio: "https://cdn.imgurl.ir/uploads/w128819_charger.mp3", image: "https://cdn.imgurl.ir/uploads/e590817_charger_1.png" },
    { id: "photo",       label: "a photo",       answers: ["photo", "a photo", "photograph", "a photograph", "picture", "a picture"], audio: "https://cdn.imgurl.ir/uploads/s457565_photo.mp3", image: "https://cdn.imgurl.ir/uploads/c513843_a_photo_1.png" },
    { id: "glasses",     label: "glasses",       answers: ["glasses", "a glasses", "eyeglasses", "spectacles", "eye glasses"], audio: "https://cdn.imgurl.ir/uploads/r73308_gles.mp3", image: "https://cdn.imgurl.ir/uploads/t135626_sungles_1.png" },
    { id: "notebook",    label: "a notebook",    answers: ["notebook", "a notebook", "note book", "a note book", "notepad", "a notepad"], audio: "https://cdn.imgurl.ir/uploads/u905875_notebook.mp3", image: "https://cdn.imgurl.ir/uploads/c529991_a_notebook_1.png" },
    { id: "pencil",      label: "a pencil",      answers: ["pencil", "a pencil"], audio: "https://cdn.imgurl.ir/uploads/l326640_pencil.mp3", image: "https://cdn.imgurl.ir/uploads/h677030_a_pencil_1.png" },
    { id: "wallet",      label: "a wallet",      answers: ["wallet", "a wallet"], audio: "https://cdn.imgurl.ir/uploads/v793231_wallet.mp3", image: "https://cdn.imgurl.ir/uploads/z327768_a_wallet_1.png" },
    { id: "tablet",      label: "a tablet",      answers: ["tablet", "a tablet", "ipad", "an ipad", "i pad"], audio: "https://cdn.imgurl.ir/uploads/g87260_tablet.mp3", image: "https://cdn.imgurl.ir/uploads/c08067_a_tablet_1.png" },
    { id: "watch",       label: "a watch",       answers: ["watch", "a watch"], audio: "https://cdn.imgurl.ir/uploads/y85649_watch.mp3", image: "https://cdn.imgurl.ir/uploads/y08797_a_watch_1.png" },
  ];

  const SETS = [
    ["cellphone", "newspaper", "key", "credit-card", "camera"],
    ["umbrella", "passport", "charger", "photo", "glasses"],
    ["notebook", "pencil", "wallet", "tablet", "watch"],
  ];

  const MODES = [
    {
      id: "look-write",
      title: "Look & Write",
      tip: "Look at the picture. Write or say the word.",
      showPic: true,
      playOnCorrect: true,
      autoPlayOnShow: false,
    },
    {
      id: "listen-write",
      title: "Listen & Write",
      tip: "Listen carefully. Write or say the word.",
      showPic: false,
      playOnCorrect: false,
      autoPlayOnShow: true,
    },
  ];

  if (window.ArcadeFX) ArcadeFX.track = function () {
    var t = 0, done = 0;
    SETS.forEach(function (st, i) { t += st.length; if (i < setIndex) done += st.length; });
    return Math.round(((done + itemIndex) / Math.max(1, t)) * 100);
  };
  const app = document.getElementById("game-app");
  if (!app) return;

  let modeIndex = 0;
  let phase = "menu";
  let setIndex = 0;
  let itemIndex = 0;
  let order = [];
  let currentAudio = null;
  let locked = false;
  let modeCorrect = 0;
  let recognition = null;
  let listening = false;

  function byId(id) {
    return ITEMS.find((c) => c.id === id);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s\-']/g, "")
      .replace(/\s+/g, " ");
  }

  /** Stricter match for typed + spoken answers (avoids accepting random speech). */
  function stripArticle(s) {
    return String(s || "").replace(/^(a|an|the)\s+/i, "").trim();
  }

  function isCorrect(user, answers) {
    const u0 = normalize(user);
    if (!u0 || u0.length < 2) return false;

    const FILLER = {
      a: 1, an: 1, the: 1, it: 1, its: 1, is: 1, this: 1, that: 1,
      um: 1, uh: 1, oh: 1, hmm: 1, yes: 1, no: 1, ok: 1, okay: 1
    };
    if (FILLER[u0]) return false;

    const u = stripArticle(u0);
    const uFlat = u.replace(/[\s\-]/g, "");
    if (!u || uFlat.length < 3) return false;

    for (let i = 0; i < answers.length; i++) {
      const a0 = normalize(answers[i]);
      if (!a0 || a0.length <= 2) continue;

      const a = stripArticle(a0);
      const aFlat = a.replace(/[\s\-]/g, "");
      if (!a || aFlat.length < 3) continue;

      // Exact match (with/without article, with/without spaces)
      if (u0 === a0 || u === a || uFlat === aFlat) return true;

      // User speech contains the full answer as a contiguous phrase
      // Pad with spaces so "phone" does not match inside "headphones" incorrectly via flat alone
      const padded = " " + u0 + " ";
      const phrase = " " + a + " ";
      if (padded.indexOf(phrase) !== -1) return true;
      // multi-word answer without requiring trailing space exactness
      if (a.indexOf(" ") !== -1 && u0.indexOf(a) !== -1) return true;

      // Flat: full answer (min 4 letters) appears inside user speech
      // e.g. "cellphone" in "um cellphone"
      if (aFlat.length >= 4 && uFlat.indexOf(aFlat) !== -1) return true;

      // Close shortening: user is ≥70% of the answer length
      if (
        uFlat.length >= 4 &&
        aFlat.length >= 4 &&
        aFlat.indexOf(uFlat) !== -1 &&
        uFlat.length / aFlat.length >= 0.7
      ) {
        return true;
      }
    }
    return false;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".mc-play.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playAudio(src, onEnd) {
    if (!src) {
      if (onEnd) onEnd();
      return;
    }
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    const btn = app.querySelector(".mc-play");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
      if (onEnd) onEnd();
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function ensureRecognition() {
    if (!SpeechRecognitionAPI) return null;
    if (recognition) return recognition;
    const r = new SpeechRecognitionAPI();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    recognition = r;
    return r;
  }

  function setMicUI(on) {
    const btn = document.getElementById("ll-mic");
    if (btn) btn.classList.toggle("is-listening", !!on);
  }

  function setFeedback(text, cls) {
    const fb = document.getElementById("ll-feedback");
    if (!fb) return;
    fb.textContent = text || "";
    fb.className = "ll-feedback" + (cls ? " " + cls : "");
  }

  function stopListening() {
    listening = false;
    setMicUI(false);
    if (recognition) {
      try { recognition.onresult = null; recognition.onerror = null; recognition.onend = null; recognition.abort(); } catch (_) {}
    }
  }

  function startListening() {
    if (locked) return;

    if (!SpeechRecognitionAPI) {
      setFeedback("Voice not supported in this browser — please type.", "warn");
      const input = document.getElementById("ll-input");
      if (input) input.focus();
      return;
    }

    if (listening) {
      stopListening();
      setFeedback("Tap 🎤 and say the word.", "");
      return;
    }

    // Stop any playing audio so the mic hears the student, not the prompt
    stopAudio();

    const r = ensureRecognition();
    if (!r) return;

    listening = true;
    setMicUI(true);
    setFeedback("Listening… say the word!", "");

    r.onresult = (ev) => {
      const alts = [];
      try {
        const res = ev.results[0];
        for (let i = 0; i < res.length; i++) {
          if (res[i] && res[i].transcript) alts.push(res[i].transcript.trim());
        }
      } catch (_) {}

      const best = alts[0] || "";
      const input = document.getElementById("ll-input");
      if (input && best) input.value = best;

      stopListening();

      if (!best) {
        setFeedback("Didn't catch that — try again or type.", "warn");
        return;
      }

      // Try every alternative against accepted answers
      const item = byId(order[itemIndex]);
      let matched = false;
      for (let i = 0; i < alts.length; i++) {
        if (isCorrect(alts[i], item.answers)) {
          if (input) input.value = alts[i];
          matched = true;
          break;
        }
      }
      // Always run check so correct/wrong feedback is consistent
      checkAnswer();
    };

    r.onerror = (ev) => {
      stopListening();
      const err = (ev && ev.error) || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        setFeedback("Microphone blocked — allow mic or type the word.", "warn");
      } else if (err === "no-speech") {
        setFeedback("No speech heard — tap 🎤 and try again.", "warn");
      } else {
        setFeedback("Couldn't hear — try typing.", "warn");
      }
    };

    r.onend = () => {
      if (listening) {
        listening = false;
        setMicUI(false);
      }
    };

    try {
      r.start();
    } catch (_) {
      stopListening();
      setFeedback("Mic busy — tap again in a moment.", "warn");
    }
  }

  function startMode(mi) {
    if (window.LAFinish) LAFinish.startTimer();
    modeIndex = mi;
    modeCorrect = 0;
    startSet(0);
  }

  function startSet(si) {
    setIndex = si;
    order = shuffle(SETS[setIndex].slice());
    itemIndex = 0;
    loadItem();
  }

  function loadItem() {
    locked = false;
    stopAudio();
    stopListening();
    phase = "play";
    render();
    const mode = MODES[modeIndex];
    const item = byId(order[itemIndex]);
    if (mode.autoPlayOnShow && item) {
      setTimeout(() => playAudio(item.audio), 300);
    }
    setTimeout(() => {
      const input = document.getElementById("ll-input");
      if (input) input.focus();
    }, 200);
  }

  function checkAnswer() {
    if (locked) return;
    const input = document.getElementById("ll-input");
    if (!input) return;
    const user = input.value;
    if (!normalize(user)) {
      input.focus();
      setFeedback("Type or say the word first.", "warn");
      return;
    }

    locked = true;
    input.disabled = true;
    const checkBtn = document.getElementById("ll-check");
    if (checkBtn) checkBtn.disabled = true;
    const micBtn = document.getElementById("ll-mic");
    if (micBtn) micBtn.disabled = true;
    stopListening();

    const item = byId(order[itemIndex]);
    const mode = MODES[modeIndex];
    const ok = isCorrect(user, item.answers);

    if (ok) {
      sfxCorrect();
      modeCorrect += 1;
      input.classList.add("is-correct");
      setFeedback("Correct!", "ok");
      const advance = () => {
        setTimeout(() => {
          if (itemIndex < order.length - 1) {
            itemIndex += 1;
            loadItem();
          } else if (setIndex < SETS.length - 1) {
            if (window.ArcadeFX) { var _d = 0, _t = 0; SETS.forEach(function (s, i) { _t += s.length; if (i <= setIndex) _d += s.length; }); if (_t >= 8 && _d >= _t / 2 && _d - SETS[setIndex].length < _t / 2) ArcadeFX.cheer(0, 2, "Halfway there — " + _d + " of " + _t + " done"); }
            startSet(setIndex + 1);
          } else {
            phase = "done";
            render();
          }
        }, 500);
      };
      if (mode.playOnCorrect) {
        playAudio(item.audio, advance);
      } else {
        advance();
      }
    } else {
      sfxWrong();
      input.classList.add("is-wrong");
      setFeedback('It\'s "' + item.label + '"', "bad");
      if (mode.playOnCorrect) {
        playAudio(item.audio);
      }
      setTimeout(() => {
        if (itemIndex < order.length - 1) {
          itemIndex += 1;
          loadItem();
        } else if (setIndex < SETS.length - 1) {
          if (window.ArcadeFX) { var _d = 0, _t = 0; SETS.forEach(function (s, i) { _t += s.length; if (i <= setIndex) _d += s.length; }); if (_t >= 8 && _d >= _t / 2 && _d - SETS[setIndex].length < _t / 2) ArcadeFX.cheer(0, 2, "Halfway there — " + _d + " of " + _t + " done"); }
          startSet(setIndex + 1);
        } else {
          phase = "done";
          render();
        }
      }, 1600);
    }
    updateProgress();
  }

  function updateProgress() {
    const el = document.getElementById("mc-progress");
    if (el) {
      el.textContent =
        "Set " + (setIndex + 1) + "/" + SETS.length + " · " + (itemIndex + 1) + "/" + order.length;
    }
  }

  function calcStars() {
    const total = ITEMS.length;
    const n = modeCorrect;
    if (n >= total - 1) return 3;
    if (n >= Math.ceil(total * 0.66)) return 2;
    if (n >= Math.ceil(total * 0.33)) return 1;
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

  function render() {
    if (phase === "menu") {
      app.innerHTML = `
        <header class="mc-topbar">
          <a class="mc-back" href="../" aria-label="Back">←</a>
          <span class="mc-title">Look & Listen Write</span>
          <span class="mc-badge">3A</span>
        </header>
        <section class="mc-start">
          <div class="mc-hero" aria-hidden="true">✍️</div>
          <h1>Look & Listen Write</h1>
          <p class="mc-desc">Write or say the word · 15 items (3 sets)</p>
          <div class="mc-mode-list">
            ${MODES.map((m, i) => `
              <button type="button" class="mc-mode-card mc-mode-btn" data-mode="${i}">
                <span class="mc-mode-num">${i + 1}</span>
                <div>
                  <strong>${m.title}</strong>
                  <p>${m.tip}</p>
                </div>
              </button>`).join("")}
          </div>
        </section>`;
      app.querySelectorAll(".mc-mode-btn").forEach((btn) => {
        btn.onclick = () => startMode(+btn.dataset.mode);
      });
      return;
    }

    if (phase === "done") {
      const stars = typeof saveStars === 'function' ? saveStars() : 0;
      if (window.LAFinish) {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: modeCorrect,
          total: 15,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => startMode(modeIndex),
          onModes: () => { phase = 'menu'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      }
      app.innerHTML = `<p>Done</p><button type="button" id="u3a-again">Again</button>`;
      document.getElementById("u3a-again").onclick = () => startMode(modeIndex);
      return;
    }

    // play — mic always visible for both modes
    const mode = MODES[modeIndex];
    const item = byId(order[itemIndex]);

    app.innerHTML = `
      <header class="mc-topbar">
        <a class="mc-back" href="../" aria-label="Back">←</a>
        <span class="mc-title">${mode.title} · Set ${setIndex + 1}/${SETS.length}</span>
        <span class="mc-progress" id="mc-progress">Set ${setIndex + 1}/${SETS.length} · ${itemIndex + 1}/${order.length}</span>
      </header>
      <p class="mc-instruction" id="mc-hint">${mode.tip}</p>
      <div class="ll-stage">
        ${mode.showPic ? `
          <div class="ll-pic-wrap">
            <img class="ll-pic" src="${item.image}" alt="What is this?" draggable="false">
          </div>` : `
          <div class="ll-audio-only">
            <button type="button" class="mc-play ll-big-play" aria-label="Play audio">
              <span class="wave"></span><span class="wave"></span><span class="wave"></span>
              <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <div class="eq"><span></span><span></span><span></span><span></span></div>
            </button>
            <p class="ll-tap-hint">Tap to listen again</p>
          </div>`}
        <div class="ll-input-row">
          <input type="text" id="ll-input" class="ll-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type or say the word…" enterkeyhint="done">
          <button type="button" class="ll-mic" id="ll-mic" aria-label="Say the word" title="Say the word">🎤</button>
        </div>
        <p class="ll-feedback" id="ll-feedback">Tap 🎤 to speak, or type and Check</p>
        <button type="button" class="mc-btn" id="ll-check">Check</button>
      </div>`;

    const input = document.getElementById("ll-input");
    document.getElementById("ll-check").onclick = () => checkAnswer();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
    document.getElementById("ll-mic").onclick = () => startListening();

    if (!mode.showPic) {
      const playBtn = app.querySelector(".ll-big-play");
      if (playBtn) playBtn.onclick = () => {
        stopListening();
        playAudio(item.audio);
      };
    }
  }

  render();
})();
