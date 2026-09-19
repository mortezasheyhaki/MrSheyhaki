/* Personal Interview roleplay – type or speak – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-personal-interview";

  const IMAGES = {
    greeting: "images/greeting.png",
    thinking: "images/thinking2.png",
    asking: "images/asking2.png",
    writing: "images/writing.png",
    thanks: "images/appreciating.png",
  };

  const MODES = [
    {
      id: "you",
      title: "About you",
      tip: "Answer questions about yourself",
      pronoun: "you",
      needMember: false,
    },
    {
      id: "man",
      title: "A man in your family",
      tip: "Choose someone, then answer about him",
      pronoun: "he",
      needMember: true,
      members: ["Father", "Brother", "Uncle", "Grandfather", "Cousin"],
    },
    {
      id: "woman",
      title: "A woman in your family",
      tip: "Choose someone, then answer about her",
      pronoun: "she",
      needMember: true,
      members: ["Mother", "Sister", "Aunt", "Grandmother", "Cousin"],
    },
  ];

  function questionsFor(pronoun) {
    // type drives soft validation (name, place, age, address, phone, email, yesno)
    if (pronoun === "you") {
      return [
        { text: "What's your name?", type: "name" },
        { text: "Where are you from?", type: "place" },
        { text: "How old are you?", type: "age" },
        { text: "What's your address?", type: "address" },
        { text: "What's your phone number?", type: "phone" },
        { text: "What's your email address?", type: "email" },
        { text: "Are you married?", type: "yesno" },
      ];
    }
    if (pronoun === "he") {
      return [
        { text: "What's his name?", type: "name" },
        { text: "Where is he from?", type: "place" },
        { text: "How old is he?", type: "age" },
        { text: "What's his address?", type: "address" },
        { text: "What's his phone number?", type: "phone" },
        { text: "What's his email address?", type: "email" },
        { text: "Is he married?", type: "yesno" },
      ];
    }
    return [
      { text: "What's her name?", type: "name" },
      { text: "Where is she from?", type: "place" },
      { text: "How old is she?", type: "age" },
      { text: "What's her address?", type: "address" },
      { text: "What's her phone number?", type: "phone" },
      { text: "What's her email address?", type: "email" },
      { text: "Is she married?", type: "yesno" },
    ];
  }

  function hasLetter(s) { return /[a-zA-Z\u00C0-\u024F]/.test(s); }
  function mostlyDigits(s) {
    var digits = (s.match(/\d/g) || []).length;
    var letters = (s.match(/[a-zA-Z]/g) || []).length;
    return digits >= 1 && digits > letters;
  }
  function digitCount(s) { return (s.match(/\d/g) || []).length; }

  /** Soft check — returns { ok, tip } */
  function validateAnswer(type, raw) {
    var v = String(raw || "").trim();
    if (!v) return { ok: false, tip: "Please type or say an answer." };

    if (type === "name") {
      if (!hasLetter(v) || mostlyDigits(v))
        return { ok: false, tip: "That looks like a number. Please give a name." };
      if (digitCount(v) >= 3)
        return { ok: false, tip: "A name shouldn't be mostly numbers." };
      if (v.length < 2)
        return { ok: false, tip: "Please give a full name." };
      return { ok: true };
    }

    if (type === "place") {
      if (!hasLetter(v) || mostlyDigits(v))
        return { ok: false, tip: "Please say a place or country (not a number)." };
      if (digitCount(v) > 4)
        return { ok: false, tip: "That looks like a number, not a place." };
      return { ok: true };
    }

    if (type === "age") {
      var m = v.match(/\d{1,3}/);
      if (!m) return { ok: false, tip: "Please give an age (a number)." };
      var age = parseInt(m[0], 10);
      if (age < 1 || age > 120)
        return { ok: false, tip: "Please give a real age (1–120)." };
      return { ok: true };
    }

    if (type === "address") {
      // need some letters (street/city) — pure number alone is weak
      if (!hasLetter(v))
        return { ok: false, tip: "Please include a street or city name." };
      if (v.length < 4)
        return { ok: false, tip: "Please give a fuller address." };
      return { ok: true };
    }

    if (type === "phone") {
      var d = digitCount(v);
      if (d < 7)
        return { ok: false, tip: "A phone number needs at least 7 digits." };
      if (d > 15)
        return { ok: false, tip: "That has too many digits for a phone number." };
      // reject pure words with almost no digits
      if (!/\d/.test(v))
        return { ok: false, tip: "Please give a phone number with digits." };
      return { ok: true };
    }

    if (type === "email") {
      // soft: must look like local@domain
      if (!/@/.test(v))
        return { ok: false, tip: "An email needs @ (for example name@email.com)." };
      if (!/\./.test(v.split("@").pop() || ""))
        return { ok: false, tip: "Please use a full email (name@email.com)." };
      if (!hasLetter(v) && !/\d/.test(v))
        return { ok: false, tip: "That doesn't look like an email." };
      return { ok: true };
    }

    if (type === "yesno") {
      var low = v.toLowerCase().replace(/[!.?]/g, "").trim();
      var yes = /^(yes|yeah|yep|yup|yes i am|yes he is|yes she is|yes,? i am|i am|he's married|she's married|married)$/.test(low)
        || /\byes\b/.test(low);
      var no = /^(no|nope|nah|no i'?m not|no he isn'?t|no she isn'?t|i'?m not|he isn'?t|she isn'?t|single|not married)$/.test(low)
        || /\bno\b/.test(low) || /\bsingle\b/.test(low);
      if (!yes && !no)
        return { ok: false, tip: "Please answer Yes or No." };
      return { ok: true };
    }

    return { ok: true };
  }

  function showTip(msg) {
    var box = app.querySelector(".pi-chat");
    if (!box) return;
    var old = box.querySelector(".pi-tip");
    if (old) old.remove();
    var tip = document.createElement("p");
    tip.className = "pi-tip";
    tip.textContent = msg;
    box.appendChild(tip);
    var input = document.getElementById("pi-answer");
    if (input) {
      input.classList.add("is-bad");
      setTimeout(function () { input.classList.remove("is-bad"); }, 450);
    }
  }

  const app = document.getElementById("game-app");
  if (!app) return;

  // phase: menu | member | intro1 | intro2 | intro3 | think | ask | write | thanks | done
  let phase = "menu";
  let modeIndex = 0;
  let member = "";
  let qIndex = 0;
  let answers = [];
    if (window.LAFinish) LAFinish.startTimer();
  let lastReply = "";
  let musicOn = true;
  let audioCtx = null;
  let musicNodes = null;
  let recognition = null;
  let listening = false;
  let timers = [];

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }
  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  /* ---------- Soft ambient music ---------- */
  function ensureAudio() {
    if (audioCtx) return audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    return audioCtx;
  }

  function startMusic() {
    const ctx = ensureAudio();
    if (!ctx || musicNodes) return;
    if (ctx.state === "suspended") ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.045;
    master.connect(ctx.destination);
    const freqs = [196, 246.94, 293.66];
    const oscs = [];
    freqs.forEach(function (f, i) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.35 - i * 0.08;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08 + i * 0.03;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 0.12;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      o.connect(g);
      g.connect(master);
      o.start();
      lfo.start();
      oscs.push(o, lfo);
    });
    const sparkle = ctx.createOscillator();
    sparkle.type = "sine";
    sparkle.frequency.value = 523.25;
    const sg = ctx.createGain();
    sg.gain.value = 0.04;
    const slfo = ctx.createOscillator();
    slfo.frequency.value = 0.15;
    const slfoG = ctx.createGain();
    slfoG.gain.value = 0.035;
    slfo.connect(slfoG);
    slfoG.connect(sg.gain);
    sparkle.connect(sg);
    sg.connect(master);
    sparkle.start();
    slfo.start();
    oscs.push(sparkle, slfo);
    musicNodes = { master: master, oscs: oscs };
  }

  function stopMusic() {
    if (!musicNodes) return;
    try {
      musicNodes.oscs.forEach(function (o) { try { o.stop(); } catch (_) {} });
      musicNodes.master.disconnect();
    } catch (_) {}
    musicNodes = null;
  }

  function toggleMusic() {
    musicOn = !musicOn;
    if (musicOn) startMusic();
    else stopMusic();
    const btn = document.getElementById("pi-music");
    if (btn) btn.textContent = musicOn ? "♪" : "🔇";
  }

  /* ---------- Speech recognition ---------- */
  function speechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function stopListening() {
    listening = false;
    try { if (recognition) recognition.stop(); } catch (_) {}
    const mic = document.getElementById("pi-mic");
    if (mic) mic.classList.remove("is-listening");
  }

  function startListening(onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopListening();
    recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    listening = true;
    const mic = document.getElementById("pi-mic");
    if (mic) mic.classList.add("is-listening");
    recognition.onresult = function (ev) {
      const text = (ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) || "";
      stopListening();
      if (text && onResult) onResult(text.trim());
    };
    recognition.onerror = function () { stopListening(); };
    recognition.onend = function () {
      listening = false;
      const m = document.getElementById("pi-mic");
      if (m) m.classList.remove("is-listening");
    };
    try { recognition.start(); } catch (_) { stopListening(); }
  }

  function answerBoxHtml(placeholder) {
    const mic = speechSupported()
      ? '<button type="button" class="pi-mic" id="pi-mic" aria-label="Speak">🎤</button>'
      : "";
    return (
      '<div class="pi-answer-box">' +
      '<input type="text" class="pi-input" id="pi-answer" autocomplete="off" placeholder="' + (placeholder || "Type or speak…") + '" />' +
      mic +
      '<button type="button" class="pi-btn" id="pi-send">Send</button>' +
      "</div>" +
      (speechSupported() ? '<p class="pi-speak-hint">Type or tap 🎤 to speak</p>' : "")
    );
  }

  function bindAnswer(onSubmit, answerType) {
    const input = document.getElementById("pi-answer");
    const send = document.getElementById("pi-send");
    const mic = document.getElementById("pi-mic");
    setTimeout(function () { if (input) input.focus(); }, 80);

    function submit(val) {
      stopListening();
      val = String(val || "").trim();
      if (!val) {
        showTip("Please type or say an answer.");
        return;
      }
      if (answerType) {
        var check = validateAnswer(answerType, val);
        if (!check.ok) {
          showTip(check.tip);
          return;
        }
      }
      onSubmit(val);
    }

    if (send) send.onclick = function () { submit(input && input.value); };
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") submit(input.value);
      });
    }
    if (mic) {
      mic.onclick = function () {
        if (listening) {
          stopListening();
          return;
        }
        startListening(function (text) {
          if (input) input.value = text;
          submit(text);
        });
      };
    }
  }

  function calcStars() {
    const n = answers.filter(function (a) { return a && a.trim(); }).length;
    if (n >= 7) return 3;
    if (n >= 5) return 2;
    if (n >= 3) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function mode() { return MODES[modeIndex]; }
  function qs() { return questionsFor(mode().pronoun); }

  function bubble(html, who) {
    return '<div class="pi-bubble pi-bubble-' + who + '">' + html + "</div>";
  }

  function renderShell(centerHtml) {
    return (
      '<header class="pi-topbar">' +
      '<a class="pi-back" href="../" aria-label="Back">←</a>' +
      '<span class="pi-title">Personal Interview</span>' +
      '<button type="button" class="pi-music" id="pi-music" aria-label="Music">' + (musicOn ? "♪" : "🔇") + "</button>" +
      "</header>" +
      centerHtml
    );
  }

  function bindMusic() {
    const btn = document.getElementById("pi-music");
    if (btn) btn.onclick = toggleMusic;
  }

  function go(next) {
    clearTimers();
    stopListening();
    phase = next;
    render();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML = renderShell(
        '<section class="pi-menu">' +
        '<div class="pi-hero"><img src="' + IMAGES.greeting + '" alt="" /></div>' +
        "<h1>Personal Interview</h1>" +
        '<p class="pi-lead">A casual chat · type or speak your answers</p>' +
        '<div class="pi-modes">' +
        MODES.map(function (m, i) {
          return (
            '<button type="button" class="pi-mode" data-i="' + i + '">' +
            "<strong>" + m.title + "</strong>" +
            "<span>" + m.tip + "</span>" +
            "</button>"
          );
        }).join("") +
        "</div>" +
        "</section>"
      );
      bindMusic();
      app.querySelectorAll(".pi-mode").forEach(function (btn) {
        btn.onclick = function () {
          modeIndex = +btn.dataset.i;
          answers = [];
          qIndex = 0;
          member = "";
          lastReply = "";
          if (musicOn) startMusic();
          if (mode().needMember) go("member");
          else go("intro1");
        };
      });
      return;
    }

    if (phase === "member") {
      const m = mode();
      app.innerHTML = renderShell(
        '<section class="pi-menu">' +
        '<div class="pi-hero small"><img src="' + IMAGES.greeting + '" alt="" /></div>' +
        "<h1>Who?</h1>" +
        '<p class="pi-lead">Choose a ' + (m.pronoun === "he" ? "man" : "woman") + " in your family</p>" +
        '<div class="pi-members">' +
        m.members.map(function (name) {
          return '<button type="button" class="pi-member" data-name="' + name + '">' + name + "</button>";
        }).join("") +
        "</div>" +
        "</section>"
      );
      bindMusic();
      app.querySelectorAll(".pi-member").forEach(function (btn) {
        btn.onclick = function () {
          member = btn.dataset.name;
          go("intro1");
        };
      });
      return;
    }

    if (phase === "intro1" || phase === "intro2" || phase === "intro3" ||
        phase === "think" || phase === "ask" || phase === "write" || phase === "thanks") {
      renderPlay();
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      if (window.LAFinish) {
      try {
        const timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: answers.filter(function (a) { return a && a.trim(); }).length,
          total: qs().length,
          stars: stars,
          timeMs: timeMs,
          onAgain: () => { phase = 'start'; render(); },
          onModes: () => { phase = 'start'; render(); },
          backHref: "../",
          save: false,
        });
        return;
      } catch (e) { console.warn("LAFinish error", e); }
    }
      app.innerHTML = `<p>Done</p><button type="button" id="u2b-again">Again</button>`;
      document.getElementById("u2b-again").onclick = () => { phase = 'start'; render(); };
      return;
    }
  }

  function renderPlay() {
    clearTimers();
    stopListening();
    const about = member ? " about your " + member.toLowerCase() : "";
    let pose = IMAGES.greeting;
    let chat = "";

    if (phase === "intro1") {
      pose = IMAGES.greeting;
      chat = bubble("Hi! How are you?", "char") + answerBoxHtml("e.g. I'm fine, thanks.");
    } else if (phase === "intro2") {
      pose = IMAGES.greeting;
      chat =
        bubble("Hi! How are you?", "char") +
        bubble(lastReply, "user") +
        bubble("Great! I want to ask you some questions" + about + ".", "char") +
        answerBoxHtml("Say OK or continue…");
    } else if (phase === "intro3") {
      pose = IMAGES.greeting;
      chat = bubble("Is that okay?", "char") + answerBoxHtml("e.g. Yes, it is.");
    } else if (phase === "think") {
      // Pose only — no “thinking” line (he already knows the questions)
      pose = IMAGES.thinking;
      chat = "";
    } else if (phase === "ask") {
      pose = IMAGES.asking;
      chat = bubble(qs()[qIndex].text, "char") + answerBoxHtml("Type or speak your answer…");
    } else if (phase === "write") {
      pose = IMAGES.writing;
      chat =
        bubble(qs()[qIndex].text, "char") +
        bubble(answers[qIndex] || "", "user") +
        bubble("Got it!", "char");
    } else if (phase === "thanks") {
      pose = IMAGES.thanks;
      chat = bubble("Thank you so much for answering my questions!", "char");
    }

    const progress = (phase === "ask" || phase === "write" || phase === "think")
      ? '<div class="pi-progress"><span style="width:' + Math.round((qIndex / qs().length) * 100) + '%"></span></div>'
      : "";

    app.innerHTML = renderShell(
      progress +
      '<div class="pi-stage">' +
      '<div class="pi-avatar"><img src="' + pose + '" alt="Character" class="pi-pose-pop" /></div>' +
      '<div class="pi-chat">' + chat + "</div>" +
      "</div>"
    );
    bindMusic();

    if (phase === "intro1") {
      bindAnswer(function (val) {
        lastReply = val;
        go("intro2");
      });
    } else if (phase === "intro2") {
      bindAnswer(function () {
        go("intro3");
      });
    } else if (phase === "intro3") {
      bindAnswer(function (val) {
        // Show confirmation then Perfect! then first question
        lastReply = val;
        app.querySelector(".pi-chat").innerHTML =
          bubble("Is that okay?", "char") +
          bubble(val, "user") +
          bubble("Perfect!", "char");
        later(function () {
          phase = "think";
          renderPlay();
        }, 1000);
      });
    } else if (phase === "think") {
      // ~1 second on thinking pose, then ask
      later(function () {
        phase = "ask";
        renderPlay();
      }, 1000);
    } else if (phase === "ask") {
      bindAnswer(function (val) {
        answers[qIndex] = val;
        phase = "write";
        renderPlay();
        later(function () {
          qIndex += 1;
          if (qIndex >= qs().length) {
            phase = "thanks";
            renderPlay();
            later(function () {
              phase = "done";
              render();
            }, 1800);
          } else {
            phase = "think";
            renderPlay();
          }
        }, 1100);
      }, qs()[qIndex].type);
    }
  }

  render();
})();
