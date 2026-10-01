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
    if (app.querySelector('[class$="-bar"]:not(.afx-bar),[class*="-bar-fill"],[class*="-progress-fill"]')) return;
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

/* Hotel Role-Play · Speak or type with the receptionist · Starter PE1 */
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


  const GAME_ID = "starter-pe1-hotel-roleplay";
  const ROOM = "321";
  const IMG = {
    greet: "images/good-afternoon.png",
    surname: "images/whats-surname.png",
    spell: "images/how-spell.png",
    sorry: "images/sorry.png",
    looking: "images/looking-key.png",
    key: "images/here-key.png",
  };

  const FEMALE_NAMES = new Set([
    "jenny","sarah","emma","olivia","ava","isabella","sophia","mia","charlotte",
    "amelia","harper","evelyn","abigail","emily","elizabeth","sofia","ella","madison",
    "scarlett","victoria","aria","grace","chloe","camila","penelope","riley","layla",
    "lillian","nora","zoey","mila","aubrey","hannah","lily","addison","eleanor",
    "natalie","luna","savannah","brooklyn","leah","zoe","stella","hazel","ellie",
    "paisley","audrey","skylar","violet","claire","bella","lucy","anna","caroline",
    "nova","genesis","aaliyah","kennedy","kinsley","allison","maya","willow","naomi",
    "elena","maria","fatima","aisha","sara","mary","susan","linda","karen","nancy",
    "betty","helen","sandra","donna","carol","ruth","sharon","michelle","laura",
    "kimberly","deborah","jessica","shirley","cynthia","angela","melissa","brenda",
    "amy","rebecca","virginia","kathleen","pamela","martha","debra","amanda",
    "stephanie","carolyn","christine","marie","janet","catherine","frances","ann",
    "joyce","diane","alice","julie","heather","teresa","doris","gloria","jean",
    "cheryl","mildred","katherine","joan","ashley","judith","rose","janice","kelly",
    "nicole","judy","christina","kathy","theresa","beverly","denise","tammy","irene",
    "jane","lori","rachel","marilyn","andrea","kathryn","louise","anne","jacqueline",
    "wanda","bonnie","julia","ruby","lois","tina","phyllis","norma","paula","diana",
    "annie","robin","peggy","crystal","gladys","rita","dawn","connie","florence",
    "tracy","edna","tiffany","carmen","rosa","cindy","wendy","edith","kim","sherry",
    "sylvia","josephine","thelma","shannon","sheila","ethel","ellen","elaine",
    "marjorie","carrie","monica","esther","pauline","juanita","anita","rhonda",
    "amber","eva","debbie","april","leslie","clara","lucille","jamie","joanne",
    "valerie","danielle","megan","alicia","suzanne","michele","gail","bertha",
    "darlene","veronica","jill","erin","geraldine","lauren","cathy","joann",
    "lorraine","lynn","sally","regina","erica","beatrice","dolores","bernice",
    "yvonne","annette","june","samantha","marion","dana","stacy","ana","renee",
    "ida","vivian","roberta","holly","brittany","melanie","loretta","yolanda",
    "jeanette","laurie","katie","kristen","vanessa","alma","sue","elsie","beth",
    "jeanne","vicki","carla","tara","rosemary","eileen","terri","gertrude",
    "tonya","stacey","wilma","gina","kristin","jessie","agnes","vera",
    "charlene","bessie","delores","melinda","pearl","arlene","maureen","colleen",
    "tamara","joy","georgia","constance","lillie","claudia","jackie","marcia",
    "tanya","nellie","minnie","marlene","heidi","glenda","lydia","viola",
    "courtney","marian","dora","jo","vickie","mattie","maxine","irma",
    "mabel","marsha","myrtle","lena","christy","deanna","patsy","hilda",
    "gwendolyn","jennie","margie","nina","cassandra","penny","kay","priscilla",
    "carole","brandy","olga","billie","dianne","tracey","leona","krystal","sherri",
    "meghan","miranda","shelby","sierra","jade","brooke","paige","kayla","morgan",
    "bailey","hailey","alexis","lisa","sophie","kate","jess","jessy",
  ]);

  const app = document.getElementById("game-app");
  if (!app) return;

  let firstName = "";
  let lastName = "";
  let title = "Mr";
  let step = 0;
  let audioBusy = false;
  let recog = null;
  let listening = false;

  const SpeechRec =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const canSpeak = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  const canListen = !!SpeechRec;

  function escapeReg(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function makeSpellPattern(name) {
    const letters = String(name)
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .split("");
    if (!letters.length) return /./;
    const body = letters.map((ch) => escapeReg(ch)).join("[\\s\\-.,]*");
    return new RegExp(body, "i");
  }

  function detectTitle(fn) {
    const n = String(fn || "").trim().toLowerCase();
    if (!n) return "Mr";
    return FEMALE_NAMES.has(n) ? "Ms" : "Mr";
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildSteps() {
    const surname = lastName || "Guest";
    const spell = surname.toUpperCase().split("").join("-");
    return [
      {
        id: "hello",
        who: "you",
        prompt: "Greet the receptionist.",
        hint: 'Say or type: "Hello."',
        accept: [/hello/i, /hi\b/i, /good\s*(morning|afternoon|evening)/i],
        sample: "Hello.",
        img: IMG.greet,
      },
      {
        id: "rec_afternoon",
        who: "rec",
        say: "Good afternoon.",
        img: IMG.greet,
      },
      {
        id: "name_res",
        who: "you",
        prompt: "Say your name and that you have a reservation.",
        hint: `Say or type: "My name's ${firstName} ${lastName}. I have a reservation."`,
        accept: [
          /my name'?s?.{0,40}reservation/i,
          /i have a reservation/i,
          /reservation/i,
        ],
        sample: `My name's ${firstName} ${lastName}. I have a reservation.`,
        img: IMG.greet,
      },
      {
        id: "rec_surname",
        who: "rec",
        say: "Sorry, what's your surname?",
        img: IMG.surname,
      },
      {
        id: "surname",
        who: "you",
        prompt: "Say your surname.",
        hint: `Say or type: "${lastName}."`,
        accept: [new RegExp(escapeReg(lastName), "i")],
        sample: lastName + ".",
        strictName: true,
        img: IMG.surname,
      },
      {
        id: "rec_spell",
        who: "rec",
        say: "How do you spell it?",
        img: IMG.spell,
      },
      {
        id: "spell",
        who: "you",
        prompt: "Spell your surname.",
        hint: `Say or type the letters: "${spell}"`,
        accept: [makeSpellPattern(lastName)],
        sample: spell,
        isSpell: true,
        img: IMG.spell,
      },
      {
        id: "rec_sorry",
        who: "rec",
        say: "Sorry?",
        img: IMG.sorry,
      },
      {
        id: "spell2",
        who: "you",
        prompt: "Spell your surname again.",
        hint: `Say or type: "${spell}"`,
        accept: [makeSpellPattern(lastName)],
        sample: spell,
        isSpell: true,
        img: IMG.sorry,
      },
      {
        id: "rec_looking",
        who: "rec",
        say: "One moment, please…",
        img: IMG.looking,
        silentDelay: 1800,
      },
      {
        id: "rec_key",
        who: "rec",
        say: `Thank you. OK, ${title}. ${lastName}. You're in room ${ROOM}.`,
        img: IMG.key,
      },
      {
        id: "thanks",
        who: "you",
        prompt: "Thank the receptionist.",
        hint: 'Say or type: "Thanks."',
        accept: [/thanks/i, /thank you/i, /bye/i],
        sample: "Thanks.",
        img: IMG.key,
      },
    ];
  }

  function stopListening() {
    listening = false;
    try {
      if (recog) recog.abort();
    } catch (_) {}
    const mic = document.getElementById("hr-mic");
    if (mic) mic.classList.remove("on");
  }

  function speak(text, onDone) {
    audioBusy = true;
    const bubble = document.getElementById("hr-rec-bubble");
    if (bubble) {
      bubble.classList.add("talking");
      bubble.textContent = text;
    }
    if (!canSpeak) {
      setTimeout(() => {
        audioBusy = false;
        if (bubble) bubble.classList.remove("talking");
        if (onDone) onDone();
      }, Math.max(900, text.length * 45));
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.92;
    u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices() || [];
    const female =
      voices.find(
        (v) =>
          /en(-|_)US/i.test(v.lang) &&
          /female|samantha|victoria|karen|moira|zira|susan/i.test(v.name)
      ) ||
      voices.find(
        (v) =>
          /en/i.test(v.lang) &&
          /female|samantha|victoria|karen|zira/i.test(v.name)
      ) ||
      voices.find((v) => /en(-|_)US/i.test(v.lang)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (female) u.voice = female;
    u.onend = () => {
      audioBusy = false;
      if (bubble) bubble.classList.remove("talking");
      if (onDone) onDone();
    };
    u.onerror = () => {
      audioBusy = false;
      if (bubble) bubble.classList.remove("talking");
      if (onDone) onDone();
    };
    window.speechSynthesis.speak(u);
  }

  function startListening(onResult) {
    if (!canListen || audioBusy) return;
    stopListening();
    recog = new SpeechRec();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 3;
    recog.continuous = false;
    listening = true;
    const mic = document.getElementById("hr-mic");
    if (mic) mic.classList.add("on");

    recog.onresult = (ev) => {
      const alts = [];
      for (let i = 0; i < ev.results[0].length; i++) {
        alts.push(ev.results[0][i].transcript);
      }
      const text = alts[0] || "";
      stopListening();
      if (onResult) onResult(text, alts);
    };
    recog.onerror = () => stopListening();
    recog.onend = () => {
      listening = false;
      const m = document.getElementById("hr-mic");
      if (m) m.classList.remove("on");
    };
    try {
      recog.start();
    } catch (_) {
      stopListening();
    }
  }

  function matches(text, stepObj) {
    const t = String(text || "").trim();
    if (!t) return false;
    return stepObj.accept.some((re) => re.test(t));
  }

  function avatarHtml(src, talking) {
    return `<div class="hr-avatar-wrap ${talking ? "talking" : ""}">
      <img class="hr-avatar-img" src="${src}" alt="Receptionist" draggable="false">
    </div>`;
  }

  function showStart() {
    if (window.LAFinish) LAFinish.startTimer();
    stopListening();
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch (_) {}
    step = 0;
    app.innerHTML = `
      <header class="hr-topbar">
        <a class="hr-back" href="../" aria-label="Back">←</a>
        <span class="hr-title">Hotel Role-Play</span>
        <span class="hr-badge">PE1</span>
      </header>
      <section class="hr-start">
        <div class="hr-hero hr-enter" style="--i:0">
          <img class="hr-hero-img" src="${IMG.greet}" alt="Receptionist" draggable="false">
          <h1>Book a Room</h1>
          <p>Role-play with the hotel receptionist.<br>
          Speak or type your answers.</p>
        </div>
        <div class="hr-name-form hr-enter" style="--i:1">
          <label class="hr-field">
            <span>First name</span>
            <input type="text" id="hr-first" autocomplete="given-name" placeholder="e.g. Rob" maxlength="24">
          </label>
          <label class="hr-field">
            <span>Surname</span>
            <input type="text" id="hr-last" autocomplete="family-name" placeholder="e.g. Walker" maxlength="24">
          </label>
          <p class="hr-name-note">We'll use <strong>Mr</strong> or <strong>Ms</strong> from your first name.</p>
        </div>
        <div class="hr-caps hr-enter" style="--i:2">
          ${canListen ? '<span class="hr-cap ok">🎤 Voice</span>' : '<span class="hr-cap no">🎤 Voice unavailable</span>'}
          ${canSpeak ? '<span class="hr-cap ok">🔊 Receptionist voice</span>' : '<span class="hr-cap no">🔊 TTS unavailable</span>'}
          <span class="hr-cap ok">⌨️ Typing OK</span>
        </div>
        <button type="button" class="hr-btn primary hr-enter" style="--i:3" id="hr-go">Start role-play</button>
      </section>`;

    document.getElementById("hr-go").onclick = () => {
      firstName =
        (document.getElementById("hr-first").value || "").trim() || "Rob";
      lastName =
        (document.getElementById("hr-last").value || "").trim() || "Walker";
      firstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      lastName =
        lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
      title = detectTitle(firstName);
      step = 0;
      halfShown = false;
      renderPlay();
    };
  }

  var halfShown = false;
  function renderPlay() {
    stopListening();
    const steps = buildSteps();

    if (step >= steps.length) {
      showDone();
      return;
    }
    if (!halfShown && steps.length >= 8 && step >= Math.floor(steps.length / 2)) {
      halfShown = true;
      if (window.ArcadeFX) ArcadeFX.cheer(0, 2, "Halfway there!");
    }

    const s = steps[step];
    const img = s.img || IMG.greet;

    // --- Receptionist turn ---
    if (s.who === "rec") {
      app.innerHTML = `
        <header class="hr-topbar">
          <a class="hr-back" href="#" id="hr-back" aria-label="Back">←</a>
          <span class="hr-title">Hotel check-in</span>
          <span class="hr-badge">${step + 1}/${steps.length}</span>
        </header>
        <div class="hr-stage">
          <div class="hr-rec">
            ${avatarHtml(img, true)}
            <div class="hr-rec-label">Receptionist</div>
            <div class="hr-bubble talking" id="hr-rec-bubble">${escapeHtml(s.say)}</div>
          </div>
          <div class="hr-progress">
            ${steps
              .map(
                (_, i) =>
                  `<span class="hr-dot ${i < step ? "done" : i === step ? "on" : ""}"></span>`
              )
              .join("")}
          </div>
        </div>`;
      document.getElementById("hr-back").onclick = (e) => {
        e.preventDefault();
        stopListening();
        try {
          window.speechSynthesis && window.speechSynthesis.cancel();
        } catch (_) {}
        showStart();
      };

      // Looking-for-key: short pause with optional soft line, no long TTS needed
      if (s.silentDelay) {
        setTimeout(() => {
          step++;
          renderPlay();
        }, s.silentDelay);
        // still speak the short line if available
        if (s.say) speak(s.say, () => {});
      } else {
        speak(s.say, () => {
          step++;
          setTimeout(renderPlay, 400);
        });
      }
      return;
    }

    // --- Player turn ---
    app.innerHTML = `
      <header class="hr-topbar">
        <a class="hr-back" href="#" id="hr-back" aria-label="Back">←</a>
        <span class="hr-title">Your turn</span>
        <span class="hr-badge">${step + 1}/${steps.length}</span>
      </header>
      <div class="hr-stage">
        <div class="hr-rec quiet">
          ${avatarHtml(img, false)}
          <div class="hr-rec-label">Your turn</div>
        </div>
        <div class="hr-prompt hr-enter" style="--i:0">
          <p class="hr-prompt-text">${escapeHtml(s.prompt)}</p>
          <p class="hr-hint">${escapeHtml(s.hint)}</p>
        </div>
        <div class="hr-input-row hr-enter" style="--i:1">
          ${canListen ? `<button type="button" class="hr-mic" id="hr-mic" aria-label="Speak">🎤</button>` : ""}
          <input type="text" class="hr-text" id="hr-text" placeholder="Type your line…" autocomplete="off" autocorrect="off" spellcheck="false">
          <button type="button" class="hr-send" id="hr-send" aria-label="Send">→</button>
        </div>
        <div class="hr-feedback" id="hr-fb" hidden></div>
        <button type="button" class="hr-btn secondary hr-skip hr-enter" style="--i:2" id="hr-skip">Skip / show answer</button>
        <div class="hr-progress">
          ${steps
            .map(
              (_, i) =>
                `<span class="hr-dot ${i < step ? "done" : i === step ? "on" : ""}"></span>`
            )
            .join("")}
        </div>
      </div>`;

    document.getElementById("hr-back").onclick = (e) => {
      e.preventDefault();
      stopListening();
      try {
        window.speechSynthesis && window.speechSynthesis.cancel();
      } catch (_) {}
      showStart();
    };

    const input = document.getElementById("hr-text");
    const send = document.getElementById("hr-send");
    const mic = document.getElementById("hr-mic");
    const skip = document.getElementById("hr-skip");

    function tryAnswer(text) {
      const fb = document.getElementById("hr-fb");
      if (matches(text, s)) {
        if (fb) {
          fb.hidden = false;
          fb.className = "hr-feedback ok";
          fb.textContent = "Good!";
        }
        setTimeout(() => {
          step++;
          renderPlay();
        }, 700);
      } else {
        if (fb) {
          fb.hidden = false;
          fb.className = "hr-feedback bad";
          fb.textContent = "Try again — or use Skip."; try{sfxWrong();}catch(e){}
        }
        if (input) {
          input.value = "";
          input.focus();
        }
      }
    }

    if (send) send.onclick = () => tryAnswer((input && input.value) || "");
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          tryAnswer(input.value);
        }
      });
      setTimeout(() => input.focus(), 200);
    }
    if (mic) {
      mic.onclick = () => {
        if (listening) {
          stopListening();
          return;
        }
        startListening((text) => {
          if (input) input.value = text;
          tryAnswer(text);
        });
      };
    }
    if (skip) {
      skip.onclick = () => {
        if (input) input.value = s.sample;
        const fb = document.getElementById("hr-fb");
        if (fb) {
          fb.hidden = false;
          fb.className = "hr-feedback warn";
          fb.textContent = "Sample: " + s.sample;
        }
        setTimeout(() => {
          step++;
          renderPlay();
        }, 1100);
      };
    }
  }

  function showDone() {
    const stars = 3;
    saveStars(3);
    if (window.LAFinish) {
      const timeMs = LAFinish.stopTimer();
      LAFinish.show({
        gameId: GAME_ID,
        score: 10,
        total: 10,
        stars: stars,
        timeMs: timeMs,
        onAgain: showStart,
        onModes: () => showStart(),
        backHref: "../",
        save: false,
      });
      return;
    }
    app.innerHTML = `<p>Done</p><button type="button" id="pe-again">Again</button>`;
    document.getElementById("pe-again").onclick = showStart;
  }

  if (canSpeak) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function () {
      window.speechSynthesis.getVoices();
    };
  }

  showStart();
})();
