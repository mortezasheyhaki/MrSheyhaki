/**
 * Hotel Email Challenge — AEF 1 Unit 10B
 * Parts 1–4: multiple choice · Part 5: shadowing practice · Part 6: write your own email
 * Hints, sound effects, responsive layout, LA stars + finish when arcade scripts are present.
 */
(function () {
  "use strict";

  var GAME_ID = "1-10b-hotel-email-challenge";
  var TOTAL_PARTS = 6;
  var MAX_SCORE = 7;
  var SOUND_KEY = "hec-sound";
  var EMAIL_HINT_COUNT = 3;

  var app = document.getElementById("game-app");
  if (!app) return;

  var PART_LABELS = ["Greeting", "Purpose", "Questions", "Closing", "Practice", "Write"];

  var TIPS = {
    1: "Formal emails use polite language and a clear structure.",
    2: "Use to + base verb: to book, to ask, to reserve.",
    3: "Could you please tell me if…? is a useful polite question pattern.",
    4: "Use Best regards, or Kind regards, before writing your name.",
    5: "Read each sentence, then type it exactly. Capital letters and punctuation count.",
    6: "A good email has a greeting, a clear purpose, polite questions, and a closing with your name."
  };

  var SINGLE = {
    1: {
      points: 1,
      next: 2,
      title: "Part 1 — Start Your Email",
      legend: "Greeting options",
      instr: "Choose a suitable greeting for a formal email to a hotel.",
      sentence: "",
      opts: [
        { v: "A", t: "Hi, buddy!", c: false },
        { v: "B", t: "Dear Sir or Madam,", c: true },
        { v: "C", t: "What's up?", c: false }
      ],
      okMsg: "<strong>✓ Correct!</strong> “Dear Sir or Madam,” is a polite, formal greeting when you do not know the person’s name.",
      badMsg: "<strong>Not quite.</strong> Formal emails need a suitable greeting. “Hi, buddy!” and “What's up?” are too informal. Try again."
    },
    2: {
      points: 1,
      next: 3,
      title: "Part 2 — Explain Why You're Writing",
      legend: "Verb options",
      instr: "Complete the sentence with the correct form of the verb.",
      sentence: "I am writing to <span class=\"hec-blank\">______</span> a room at your hotel.",
      opts: [
        { v: "A", t: "book", c: true },
        { v: "B", t: "playing", c: false },
        { v: "C", t: "booking", c: false }
      ],
      okMsg: "<strong>✓ Correct!</strong> After “to” in this sentence, use the <em>base form</em>: <strong>to book</strong>.",
      badMsg: "<strong>Not quite.</strong> After “to” (purpose), use the base form: <em>to book</em>, <em>to ask</em>, <em>to reserve</em>. Try again."
    },
    4: {
      points: 1,
      next: 5,
      title: "Part 4 — Finish Your Email",
      legend: "Closing options",
      instr: "Choose a suitable closing for a formal email.",
      sentence: "",
      opts: [
        { v: "A", t: "See ya!", c: false },
        { v: "B", t: "Best regards,", c: true },
        { v: "C", t: "Bye bye!", c: false }
      ],
      okMsg: "<strong>✓ Correct!</strong> “Best regards,” is a suitable formal closing. Write your name on the next line.",
      badMsg: "<strong>Not quite.</strong> “See ya!” and “Bye bye!” are too informal. Use <em>Best regards,</em> or <em>Kind regards,</em> before your name."
    }
  };

  var PART3 = [
    {
      key: "part3a",
      title: "A. Room price",
      label: "Room price",
      opts: [
        { v: "1", t: "“How much is a room per night?”", c: true },
        { v: "2", t: "“Tell me the price.”", c: false }
      ]
    },
    {
      key: "part3b",
      title: "B. Free parking",
      label: "Free parking",
      opts: [
        { v: "1", t: "“Could you please tell me if the hotel has free parking?”", c: true },
        { v: "2", t: "“You have free parking, yes?”", c: false }
      ]
    },
    {
      key: "part3c",
      title: "C. Breakfast",
      label: "Breakfast",
      opts: [
        { v: "1", t: "“Is breakfast included in the price?”", c: true },
        { v: "2", t: "“Give me breakfast information.”", c: false }
      ]
    }
  ];

  // Sample email, split into sentences for the shadowing practice.
  // chunks = natural phrases to read and type one at a time.
  var PRACTICE = [
    { text: "Dear Sir or Madam,", chunks: ["Dear Sir", "or Madam,"] },
    { text: "I am writing to ask about booking a room at your hotel for two nights.",
      chunks: ["I am writing", "to ask about booking", "a room", "at your hotel", "for two nights."] },
    { text: "Could you please tell me if you have any rooms available?",
      chunks: ["Could you please", "tell me if", "you have any rooms", "available?"] },
    { text: "How much is a room per night?", chunks: ["How much is", "a room", "per night?"] },
    { text: "Could you please tell me if the hotel has free parking?",
      chunks: ["Could you please", "tell me if", "the hotel has", "free parking?"] },
    { text: "Is breakfast included in the price?", chunks: ["Is breakfast included", "in the price?"] },
    { text: "Thank you for your help.", chunks: ["Thank you", "for your help."] },
    { text: "Best regards,", chunks: ["Best regards,"] },
    { text: "Alex", chunks: ["Alex"] }
  ];

  // Progressive hints for parts 1–4 (last hint reveals the answer)
  var HINTS = {
    1: [
      "Think about the reader. Is this email to a friend, or to a hotel you have never contacted?",
      "Choose the greeting that sounds respectful. Avoid slang and very casual words.",
      "The answer is B: “Dear Sir or Madam,” — use it when you do not know the person’s name."
    ],
    2: [
      "Look at the word after “to”. What form of the verb comes after “to”?",
      "After “to”, use the base form: no -ing and no -s.",
      "The answer is A: to book."
    ],
    3: [
      "Each question should be complete and polite. Short commands like “Give me…” are too direct.",
      "Polite patterns: “How much…?”, “Could you please tell me if…?”, “Is … included…?”",
      "Answers: A = “How much is a room per night?” · B = “Could you please tell me if the hotel has free parking?” · C = “Is breakfast included in the price?”"
    ],
    4: [
      "Formal closings usually end with the word “regards”.",
      "Informal words like “Bye bye!” and “See ya!” do not belong in a formal email.",
      "The answer is B: Best regards, — then write your name on the next line."
    ]
  };

  // Email requirements used by the live checklist and the final check
  var REQ = [
    { k: "greeting", label: "Greeting", miss: "a formal greeting (e.g. Dear Sir or Madam,)" },
    { k: "purpose", label: "Why you are writing", miss: "why you are writing (e.g. I am writing to ask about…)" },
    { k: "availability", label: "Rooms for two nights", miss: "whether rooms are available for two nights" },
    { k: "price", label: "Price per night", miss: "the price per night" },
    { k: "parking", label: "Free parking", miss: "free parking" },
    { k: "breakfast", label: "Breakfast", miss: "breakfast" },
    { k: "closing", label: "Polite closing", miss: "a polite closing (e.g. Best regards,)" },
    { k: "name", label: "Your name", miss: "your name on the line after the closing" },
    { k: "length", label: "About 60–80 words", miss: "a length of about 60–80 words (50–110 is accepted)" }
  ];

  // Sentence frames offered in hint 2 of the writing part (blanks are for the player)
  var FRAMES = {
    greeting: "Dear Sir or Madam,",
    purpose: "I am writing to ask about booking a room for ___ nights.",
    availability: "Could you please tell me if you have ___ available?",
    price: "How much is ___ per night?",
    parking: "Could you please tell me if the hotel has ___?",
    breakfast: "Is ___ included in the price?",
    closing: "Best regards,",
    name: "[Your name]"
  };

  var PATTERNS = {
    greeting: /\bdear\s+[a-z]/i,
    purpose: /\b(i am|i'm)\s+writing\b|\bwould like to (book|reserve|ask|enquire|inquire|request)\b/i,
    availability: /\bavailab|\bvacanc|\bhave (any )?rooms?\b|\b(two|2) nights\b/i,
    price: /\bhow much\b|\bprice\b|\bcost\b|\bper night\b|\bnightly\b|\brate\b/i,
    parking: /\bparking\b/i,
    breakfast: /\bbreakfast\b/i,
    closing: /\b(best|kind|warm|many)\s+regards\b|\byours\s+(sincerely|faithfully)\b/i,
    nameInline: /\b(regards|sincerely|faithfully),?\s+[A-Za-z][A-Za-z'-]+/i,
    nameLine: /^[A-Za-z][A-Za-z .'-]{0,29}$/,
    informal: /\b(hi buddy|buddy|what'?s up|see ya|bye bye|hey|gonna|wanna|give me|cheers)\b/gi
  };

  function emptyMap(v) {
    var m = {};
    for (var i = 1; i <= TOTAL_PARTS; i++) m[i] = v;
    return m;
  }

  var state = {
    part: 1,
    score: 0,
    awarded: { 1: false, 2: false, 3: false, 4: false, 5: false },
    completed: emptyMap(false),
    unlocked: { 1: true, 2: false, 3: false, 4: false, 5: false, 6: false },
    hintLevel: emptyMap(0),
    practiceIdx: 0,
    practiceText: "",
    orderDone: false,
    orderPool: null,
    orderPicked: [],
    emailText: "",
    started: false,
    finished: false,
    soundOn: readSoundPref()
  };

  var answers = {
    part1: null,
    part2: null,
    part3a: null,
    part3b: null,
    part3c: null,
    part4: null
  };

  /* ── Sound ── */
  function readSoundPref() {
    try {
      return localStorage.getItem(SOUND_KEY) !== "off";
    } catch (_) {
      return true;
    }
  }

  function saveSoundPref() {
    try {
      localStorage.setItem(SOUND_KEY, state.soundOn ? "on" : "off");
    } catch (_) {}
  }

  var audioCtx = null;

  function getAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function note(ctx, freq, start, dur, type, vol) {
    var t0 = ctx.currentTime + start;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // Used when the site's la-sfx.js is not loaded
  var BUILT_IN_SFX = {
    correct: function (c) {
      note(c, 523.25, 0, 0.14, "sine", 0.18);
      note(c, 783.99, 0.09, 0.22, "sine", 0.18);
    },
    wrong: function (c) {
      note(c, 220, 0, 0.18, "triangle", 0.2);
      note(c, 165, 0.14, 0.25, "triangle", 0.2);
    },
    click: function (c) {
      note(c, 880, 0, 0.06, "square", 0.05);
    },
    hint: function (c) {
      note(c, 660, 0, 0.18, "sine", 0.14);
      note(c, 990, 0.12, 0.25, "sine", 0.12);
    },
    win: function (c) {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        note(c, f, i * 0.12, 0.35, "sine", 0.2);
      });
    }
  };

  function sfx(name) {
    if (!state.soundOn) return;
    try {
      if (window.LASfx && typeof window.LASfx[name] === "function") {
        window.LASfx[name]();
        return;
      }
      var ctx = getAudio();
      if (ctx && BUILT_IN_SFX[name]) BUILT_IN_SFX[name](ctx);
    } catch (_) {}
  }

  /* ── Helpers ── */
  function countWords(text) {
    var t = (text || "").trim();
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  function progressPct() {
    var done = 0;
    for (var i = 1; i <= TOTAL_PARTS; i++) if (state.completed[i]) done++;
    return Math.round((done / TOTAL_PARTS) * 100);
  }

  function award(part, pts) {
    if (state.awarded[part]) return;
    state.awarded[part] = true;
    state.score += pts;
  }

  function markDone(part) {
    state.completed[part] = true;
    if (part < TOTAL_PARTS) state.unlocked[part + 1] = true;
  }

  function startTimerOnce() {
    if (state.started) return;
    state.started = true;
    try {
      if (window.LAFinish) LAFinish.startTimer();
    } catch (_) {}
  }

  function clearMarks(root) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll(".hec-option"), function (c) {
      c.classList.remove("is-correct", "is-wrong");
    });
  }

  function showFb(type, html) {
    var el = document.getElementById("hec-fb");
    if (!el) return;
    var cls = type === "correct" ? "is-good" : type === "wrong" ? "is-bad" : "is-info";
    el.hidden = false;
    el.className = "hec-feedback " + cls;
    el.innerHTML = html;
  }

  /* ── Email analysis ── */
  function analyzeEmail(text) {
    var t = text || "";
    var lines = t
      .split(/\n/)
      .map(function (l) { return l.trim(); })
      .filter(Boolean);

    var closingIdx = -1;
    lines.forEach(function (l, i) {
      if (PATTERNS.closing.test(l)) closingIdx = i;
    });

    var last = lines.length ? lines[lines.length - 1] : "";
    var nameAfterClosing =
      closingIdx !== -1 &&
      closingIdx < lines.length - 1 &&
      PATTERNS.nameLine.test(last) &&
      !PATTERNS.closing.test(last) &&
      !PATTERNS.greeting.test(last);
    var nameInline = PATTERNS.nameInline.test(t);

    var wc = countWords(t);
    var informalHits = (t.match(PATTERNS.informal) || []).map(function (w) {
      return w.toLowerCase();
    });
    var informal = informalHits.filter(function (w, i) {
      return informalHits.indexOf(w) === i;
    });

    return {
      greeting: PATTERNS.greeting.test(t),
      purpose: PATTERNS.purpose.test(t),
      availability: PATTERNS.availability.test(t),
      price: PATTERNS.price.test(t),
      parking: PATTERNS.parking.test(t),
      breakfast: PATTERNS.breakfast.test(t),
      closing: PATTERNS.closing.test(t),
      name: nameAfterClosing || nameInline,
      length: wc >= 50 && wc <= 110,
      wordCount: wc,
      informal: informal
    };
  }

  /* ── Shell ── */
  function shell(bodyHtml) {
    var pct = progressPct();
    var nav = "";
    for (var i = 1; i <= TOTAL_PARTS; i++) {
      var cls = "hec-nav-btn";
      if (i === state.part) cls += " is-current";
      if (state.completed[i]) cls += " is-done";
      nav +=
        '<button type="button" class="' + cls + '" data-action="nav" data-part="' + i + '"' +
        (state.unlocked[i] ? "" : " disabled") +
        (i === state.part ? ' aria-current="step"' : "") +
        '><span class="hec-nav-num">' + i + '</span><span class="hec-nav-label">' +
        PART_LABELS[i - 1] + "</span></button>";
    }

    return (
      '<div class="hec-top">' +
      '<a class="hec-back" href="../" aria-label="Back to games">←</a>' +
      '<div class="hec-title-wrap">' +
      '<div class="hec-kicker">Unit 10B · Writing</div>' +
      '<h1 class="hec-title">Hotel Email Challenge</h1>' +
      "</div>" +
      '<button type="button" class="hec-sound" data-action="sound" aria-pressed="' + state.soundOn +
      '" aria-label="Sound ' + (state.soundOn ? "on" : "off") + '">' +
      (state.soundOn ? "🔊" : "🔇") + "</button>" +
      '<div class="hec-score-pill" aria-live="polite">' +
      '<span class="hec-score-label">Score</span>' +
      '<span class="hec-score-value">' + state.score + " / " + MAX_SCORE + "</span></div>" +
      "</div>" +
      '<div class="hec-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      pct + '" aria-label="Progress"><div class="hec-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<nav class="hec-nav" aria-label="Parts">' + nav + "</nav>" +
      '<div class="hec-body">' + bodyHtml + "</div>" +
      '<div class="hec-footer">' +
      '<button type="button" class="hec-btn hec-btn-ghost" data-action="restart">Start again</button>' +
      '<span class="hec-footer-note">A1–A2 · Formal email writing</span>' +
      "</div>"
    );
  }

  function scenarioHtml() {
    return (
      '<aside class="hec-scenario"><p><strong>Your task:</strong> You want to book a hotel room for ' +
      "<em>two nights</em>. Ask about availability, the price per night, free parking, and breakfast.</p></aside>"
    );
  }

  function tipHtml(part) {
    return (
      '<aside class="hec-tip" aria-live="polite"><span class="hec-tip-icon" aria-hidden="true">💡</span>' +
      '<div><strong class="hec-tip-title">Writing tip</strong><p class="hec-tip-text">' +
      TIPS[part] + "</p></div></aside>"
    );
  }

  /* ── Hints ── */
  function hintMax(part) {
    if (part === 5) return 2;
    if (part === 6) return state.orderDone ? EMAIL_HINT_COUNT : 2;
    return HINTS[part].length;
  }

  function practiceHintHtml(i) {
    var item = PRACTICE[state.practiceIdx];
    if (i === 0) {
      return (
        '<div class="hec-hint-item"><p><strong>Hint 1 — Chunks.</strong> Read one chunk at a time, then type it: ' +
        "<em>" + escapeHtml(item.chunks.join(" / ")) + "</em></p></div>"
      );
    }
    var first = item.text.split(" ")[0];
    return (
      '<div class="hec-hint-item"><p><strong>Hint 2 — First word.</strong> The sentence starts with “' +
      escapeHtml(first) + "”.</p></div>"
    );
  }

  function emailHintHtml(i) {
    if (i === 0) {
      return (
        '<div class="hec-hint-item"><p><strong>Hint 1 — Use the checklist.</strong> ' +
        "Each empty circle is a part that still needs to be added. Write one part at a time, then check again.</p></div>"
      );
    }
    if (i === 1) {
      var r = analyzeEmail(state.emailText);
      var btns = REQ.filter(function (q) {
        return FRAMES[q.k] && !r[q.k];
      }).map(function (q) {
        return (
          '<button type="button" class="hec-frame" data-action="frame" data-text="' +
          escapeAttr(FRAMES[q.k]) + '">' + escapeHtml(FRAMES[q.k]) + "</button>"
        );
      }).join("");
      return (
        '<div class="hec-hint-item"><p><strong>Hint 2 — Sentence frames.</strong> ' +
        "Tap a frame to add it to your email, then replace each blank (___) with your own words.</p>" +
        (btns
          ? '<div class="hec-frames">' + btns + "</div>"
          : "<p>All the parts are there. Read your email once more, then check it.</p>") +
        "</div>"
      );
    }
    return (
      '<div class="hec-hint-item"><p><strong>Hint 3 — Word bank.</strong> ' +
      "available · per night · two nights · free parking · breakfast included · " +
      "Could you please tell me if… · Best regards, · Thank you for your help.</p></div>"
    );
  }

  function hintInner(part) {
    var level = state.hintLevel[part];
    var max = hintMax(part);
    var content = "";

    if (level > 0) {
      if (part === 5) {
        for (var p = 0; p < level; p++) content += practiceHintHtml(p);
      } else if (part === 6) {
        for (var e = 0; e < level; e++) {
          content += state.orderDone ? emailHintHtml(e) : orderHintHtml(e);
        }
      } else {
        var items = HINTS[part].slice(0, level).map(function (h) {
          return "<li>" + h + "</li>";
        }).join("");
        content = '<ol class="hec-hint-list">' + items + "</ol>";
      }
      content = '<div class="hec-hint-box">' + content + "</div>";
    }

    var btn =
      level < max
        ? '<button type="button" class="hec-btn hec-btn-hint" data-action="hint" data-part="' + part + '">' +
          "💡 " + (level === 0 ? "Need a hint?" : "Next hint") +
          ' <span class="hec-hint-count">' + level + "/" + max + "</span></button>"
        : '<p class="hec-hint-done">That’s all the hints for this part.</p>';

    return content + btn;
  }

  function useHint(part) {
    var max = hintMax(part);
    if (state.hintLevel[part] >= max) return;
    state.hintLevel[part]++;
    sfx("hint");
    var box = document.getElementById("hec-hints");
    if (box) box.innerHTML = hintInner(part);
  }

  function insertFrame(text) {
    var ta = document.getElementById("hec-email");
    if (!ta) return;
    var base = ta.value.replace(/\s+$/, "");
    ta.value = (base ? base + "\n" : "") + text;
    state.emailText = ta.value;
    updateLive();
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    sfx("click");
  }

  /* ── Part renders ── */
  function renderSingle(p) {
    var cfg = SINGLE[p];
    var key = "part" + p;
    var locked = !!state.completed[p];

    var opts = cfg.opts.map(function (o) {
      var mark = "";
      if (locked) {
        if (answers[key] === o.v) mark = o.c ? " is-correct" : " is-wrong";
        else if (o.c) mark = " is-correct";
      }
      return (
        '<label class="hec-option' + mark + '">' +
        '<input type="radio" name="' + key + '" value="' + o.v + '" data-correct="' + o.c + '"' +
        (answers[key] === o.v ? " checked" : "") +
        (locked ? " disabled" : "") + ">" +
        '<span class="hec-letter">' + o.v + "</span>" +
        '<span class="hec-option-text">' + o.t + "</span></label>"
      );
    }).join("");

    var footer = locked
      ? '<div class="hec-feedback is-good" id="hec-fb" role="status">' + cfg.okMsg + "</div>" +
        '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-success" data-action="goto" data-goto="' +
        cfg.next + '">Continue to Part ' + cfg.next + " →</button></div>"
      : '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-primary" id="hec-check" data-action="check"' +
        (answers[key] ? "" : " disabled") + ">Check answer</button></div>" +
        '<div class="hec-feedback" id="hec-fb" hidden role="status"></div>' +
        '<div class="hec-hints" id="hec-hints">' + hintInner(p) + "</div>";

    app.innerHTML = shell(
      scenarioHtml() +
      tipHtml(p) +
      '<section class="hec-panel" aria-labelledby="hec-h' + p + '">' +
      '<h2 class="hec-heading" id="hec-h' + p + '">' + cfg.title + "</h2>" +
      '<p class="hec-instruction">' + cfg.instr + "</p>" +
      (cfg.sentence ? '<p class="hec-sentence">' + cfg.sentence + "</p>" : "") +
      '<fieldset class="hec-options"><legend class="sr-only">' + cfg.legend + "</legend>" + opts + "</fieldset>" +
      footer +
      "</section>"
    );
  }

  function renderPart3() {
    var locked = !!state.completed[3];
    var allAnswered = PART3.every(function (q) { return !!answers[q.key]; });

    var subs = PART3.map(function (q) {
      var opts = q.opts.map(function (o) {
        var mark = "";
        if (locked) {
          if (answers[q.key] === o.v) mark = o.c ? " is-correct" : " is-wrong";
          else if (o.c) mark = " is-correct";
        }
        return (
          '<label class="hec-option hec-option-sm' + mark + '">' +
          '<input type="radio" name="' + q.key + '" value="' + o.v + '" data-correct="' + o.c + '"' +
          (answers[q.key] === o.v ? " checked" : "") +
          (locked ? " disabled" : "") + ">" +
          '<span class="hec-option-text">' + o.t + "</span></label>"
        );
      }).join("");
      return (
        '<fieldset class="hec-subq"><legend class="hec-subq-title">' + q.title + "</legend>" + opts + "</fieldset>"
      );
    }).join("");

    var footer = locked
      ? '<div class="hec-feedback is-good" id="hec-fb" role="status">' +
        "<strong>✓ Excellent!</strong> All three questions are clear and polite. Patterns like “How much…?”, " +
        "“Could you please tell me if…?”, and “Is … included?” sound natural in formal emails.</div>" +
        '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-success" data-action="goto" data-goto="4">Continue to Part 4 →</button></div>'
      : '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-primary" id="hec-check" data-action="check"' +
        (allAnswered ? "" : " disabled") + ">Check answers</button></div>" +
        '<div class="hec-feedback" id="hec-fb" hidden role="status"></div>' +
        '<div class="hec-hints" id="hec-hints">' + hintInner(3) + "</div>";

    app.innerHTML = shell(
      scenarioHtml() +
      tipHtml(3) +
      '<section class="hec-panel" aria-labelledby="hec-h3">' +
      '<h2 class="hec-heading" id="hec-h3">Part 3 — Ask Your Questions Politely</h2>' +
      '<p class="hec-instruction">Choose the clearest and most polite question for each topic. You must get all three correct.</p>' +
      '<div class="hec-subqs">' + subs + "</div>" +
      footer +
      "</section>"
    );
  }

  function renderPractice() {
    var locked = !!state.completed[5];
    var i = state.practiceIdx;
    var copiedList = PRACTICE.slice(0, locked ? PRACTICE.length : i).map(function (s) {
      return "<li>" + escapeHtml(s.text) + "</li>";
    }).join("");

    var body;
    if (locked) {
      body =
        '<div class="hec-feedback is-good" id="hec-fb" role="status"><strong>✓ Great practice!</strong> ' +
        "You copied the whole sample email. Now write your own.</div>" +
        '<p class="hec-field-label">Your copy</p><ol class="hec-copied">' + copiedList + "</ol>" +
        '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-success" data-action="goto" data-goto="6">Continue to Part 6 →</button></div>';
    } else {
      body =
        '<p class="hec-field-label">Sentence ' + (i + 1) + " of " + PRACTICE.length + "</p>" +
        '<div class="hec-target">' + escapeHtml(PRACTICE[i].text) + "</div>" +
        '<label for="hec-practice" class="hec-field-label">Type it here</label>' +
        '<input type="text" id="hec-practice" class="hec-input" autocomplete="off" spellcheck="false" ' +
        'placeholder="Type the sentence exactly" value="' + escapeAttr(state.practiceText) + '">' +
        '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-primary" id="hec-check" data-action="check"' +
        (state.practiceText.trim() ? "" : " disabled") + ">Check sentence</button></div>" +
        '<div class="hec-feedback" id="hec-fb" hidden role="status"></div>' +
        '<div class="hec-hints" id="hec-hints">' + hintInner(5) + "</div>" +
        (i > 0
          ? '<p class="hec-field-label hec-copy-label">Your copy so far</p><ol class="hec-copied">' + copiedList + "</ol>"
          : "");
    }

    app.innerHTML = shell(
      scenarioHtml() +
      tipHtml(5) +
      '<section class="hec-panel" aria-labelledby="hec-h5">' +
      '<h2 class="hec-heading" id="hec-h5">Part 5 — Shadow the Sample</h2>' +
      '<p class="hec-instruction">Read each sentence out loud, then type it exactly as it is written. ' +
      "This helps you learn the rhythm and patterns of a formal email.</p>" +
      body +
      "</section>"
    );
  }

  function checkPractice() {
    var typed = (state.practiceText || "").trim().replace(/\s+/g, " ");
    if (!typed) return;
    startTimerOnce();

    var target = PRACTICE[state.practiceIdx].text;
    if (typed === target) {
      state.practiceIdx++;
      state.practiceText = "";
      state.hintLevel[5] = 0;
      sfx("correct");
      if (state.practiceIdx >= PRACTICE.length) {
        award(5, 1);
        markDone(5);
      }
      render();
      if (!state.completed[5]) showFb("correct", "<strong>✓ Correct!</strong> Next sentence.");
      return;
    }

    var tw = typed.split(" ");
    var ew = target.split(" ");
    var idx = 0;
    while (idx < tw.length && idx < ew.length && tw[idx] === ew[idx]) idx++;
    sfx("wrong");
    showFb(
      "wrong",
      "<strong>Not quite.</strong> Check word " + (idx + 1) +
      ". Compare it with the sample, including capital letters and punctuation."
    );
  }

  function orderHintHtml(i) {
    if (i === 0) {
      return (
        '<div class="hec-hint-item"><p><strong>Hint 1 — Start and end.</strong> ' +
        "The greeting comes first. The closing and your name come last.</p></div>"
      );
    }
    return (
      '<div class="hec-hint-item"><p><strong>Hint 2 — The usual order.</strong> ' +
      "Greeting → why you are writing → rooms for two nights → price → parking → breakfast → " +
      "thank you → closing → name.</p></div>"
    );
  }

  function shuffledOrder() {
    var idx = PRACTICE.map(function (_, i) { return i; });
    do {
      for (var i = idx.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = idx[i];
        idx[i] = idx[j];
        idx[j] = t;
      }
    } while (idx.every(function (v, k) { return v === k; }));
    return idx;
  }

  function renderOrder() {
    if (!state.orderPool) state.orderPool = shuffledOrder();
    var total = PRACTICE.length;
    var picked = state.orderPicked;

    var slots = "";
    for (var k = 0; k < total; k++) {
      if (k < picked.length) {
        slots +=
          '<li><button type="button" class="hec-order-chip is-placed" data-action="unpick" data-pos="' + k +
          '" aria-label="Remove sentence ' + (k + 1) + '">' + escapeHtml(PRACTICE[picked[k]].text) + "</button></li>";
      } else {
        slots += '<li class="hec-slot-empty">Sentence ' + (k + 1) + "</li>";
      }
    }

    var pool = state.orderPool.map(function (idx) {
      return (
        '<button type="button" class="hec-order-chip" data-action="pick" data-idx="' + idx + '">' +
        escapeHtml(PRACTICE[idx].text) + "</button>"
      );
    }).join("");

    app.innerHTML = shell(
      scenarioHtml() +
      tipHtml(6) +
      '<section class="hec-panel" aria-labelledby="hec-h6">' +
      '<h2 class="hec-heading" id="hec-h6">Part 6 — Put the Email in Order</h2>' +
      '<p class="hec-instruction">Tap the sentences in the order they should appear in the email. ' +
      "Tap a sentence in your order to take it back.</p>" +
      '<p class="hec-field-label">Your order</p>' +
      '<ol class="hec-order-slots">' + slots + "</ol>" +
      '<p class="hec-field-label">Sentences</p>' +
      '<div class="hec-pool">' + (pool || '<p class="hec-hint-done">All sentences are placed.</p>') + "</div>" +
      '<div class="hec-actions">' +
      '<button type="button" class="hec-btn hec-btn-primary" id="hec-check" data-action="check"' +
      (picked.length === total ? "" : " disabled") + ">Check order</button>" +
      '<button type="button" class="hec-btn hec-btn-secondary" data-action="order-reset">Start order again</button>' +
      "</div>" +
      '<div class="hec-feedback" id="hec-fb" hidden role="status"></div>' +
      '<div class="hec-hints" id="hec-hints">' + hintInner(6) + "</div>" +
      "</section>"
    );
  }

  function checkOrder() {
    var total = PRACTICE.length;
    if (state.orderPicked.length < total) return;
    startTimerOnce();
    var right = state.orderPicked.filter(function (v, i) { return v === i; }).length;
    if (right === total) {
      state.orderDone = true;
      state.hintLevel[6] = 0;
      sfx("correct");
      render();
      return;
    }
    sfx("wrong");
    showFb(
      "wrong",
      "<strong>Not quite.</strong> " + right + " of " + total +
      " sentences are in the right place. Tap a sentence in your order to take it back, then try again."
    );
  }

  function pickSentence(idx) {
    state.orderPool = state.orderPool.filter(function (v) { return v !== idx; });
    state.orderPicked.push(idx);
    sfx("click");
    render();
  }

  function unpickSentence(pos) {
    var idx = state.orderPicked.splice(pos, 1)[0];
    state.orderPool.push(idx);
    sfx("click");
    render();
  }

  function resetOrder() {
    state.orderPicked = [];
    state.orderPool = shuffledOrder();
    render();
  }

  function renderWrite() {
    if (!state.orderDone) return renderOrder();

    var locked = !!state.completed[6];
    var n = countWords(state.emailText);

    var orderRef =
      '<details class="hec-ref"' + (locked ? "" : " open") + "><summary>Ordered sentences (reference)</summary>" +
      '<ol class="hec-copied">' +
      PRACTICE.map(function (s) { return "<li>" + escapeHtml(s.text) + "</li>"; }).join("") +
      "</ol></details>";

    var successBlock = locked
      ? '<div class="hec-feedback is-good" id="hec-fb" role="status">' +
        "<strong>✓ Excellent!</strong> Your email has every part of a formal hotel enquiry. " +
        "This check cannot find every grammar mistake, so read it once more before you finish.</div>" +
        '<div class="hec-actions">' +
        '<button type="button" class="hec-btn hec-btn-success" data-action="finish" id="hec-finish">Finish game</button>' +
        "</div>"
      : '<div class="hec-feedback is-good" role="status"><strong>✓ Order correct!</strong> ' +
        "Now type the email in the box below. Use the checklist, frames and hints as you need.</div>" +
        '<div class="hec-actions"><button type="button" class="hec-btn hec-btn-primary" id="hec-check" data-action="check">Check my email</button></div>' +
        '<div class="hec-feedback" id="hec-fb" hidden role="status"></div>';

    app.innerHTML = shell(
      scenarioHtml() +
      tipHtml(6) +
      '<section class="hec-panel" aria-labelledby="hec-h6">' +
      '<h2 class="hec-heading" id="hec-h6">Part 6 — Write Your Email</h2>' +
      '<p class="hec-instruction">Type your email of about <strong>60–80 words</strong>. Use the sentences above in order, ' +
      "and write them in your own typing. Explain why you are writing, ask about two nights, the price per night, " +
      "free parking and breakfast, then finish with a polite closing and your name.</p>" +
      orderRef +
      '<p class="hec-field-label">Email checklist</p>' +
      '<ul class="hec-live" id="hec-live">' + liveItemsHtml() + "</ul>" +
      '<label for="hec-email" class="hec-field-label">Your email</label>' +
      '<textarea id="hec-email" class="hec-textarea" rows="10" spellcheck="true" ' +
      'placeholder="Dear Sir or Madam,&#10;&#10;I am writing to...">' + escapeHtml(state.emailText) + "</textarea>" +
      '<div class="hec-word-row"><span class="hec-word-count" id="hec-wc" aria-live="polite">' +
      n + (n === 1 ? " word" : " words") + '</span><span class="hec-word-hint">Aim for 60–80 words</span></div>' +
      successBlock +
      (locked ? "" : '<div class="hec-hints" id="hec-hints">' + hintInner(6) + "</div>") +
      "</section>"
    );
    updateLive();
  }

  function liveItemsHtml() {
    return REQ.map(function (q) {
      return (
        '<li data-req="' + q.k + '"><span class="hec-tick" aria-hidden="true">○</span>' +
        "<span>" + q.label + "</span></li>"
      );
    }).join("");
  }

  function updateLive() {
    var r = analyzeEmail(state.emailText);
    var ul = document.getElementById("hec-live");
    if (ul) {
      Array.prototype.forEach.call(ul.querySelectorAll("li"), function (li) {
        var k = li.getAttribute("data-req");
        var ok = !!r[k];
        li.classList.toggle("is-ok", ok);
        var tick = li.querySelector(".hec-tick");
        if (tick) tick.textContent = ok ? "✓" : "○";
      });
    }
    var wc = document.getElementById("hec-wc");
    if (wc) {
      wc.textContent = r.wordCount + (r.wordCount === 1 ? " word" : " words");
      wc.className = "hec-word-count" + (r.length ? " is-ok" : r.wordCount ? " is-warn" : "");
    }
  }

  /* ── Checking answers ── */
  function checkSingle(p) {
    var key = "part" + p;
    var sel = app.querySelector('input[name="' + key + '"]:checked');
    if (!sel) return;
    startTimerOnce();
    clearMarks(sel.closest("fieldset"));
    var ok = sel.getAttribute("data-correct") === "true";
    if (ok) {
      award(p, SINGLE[p].points);
      markDone(p);
      sfx("correct");
      render();
    } else {
      var card = sel.closest(".hec-option");
      if (card) card.classList.add("is-wrong");
      sfx("wrong");
      showFb("wrong", SINGLE[p].badMsg);
    }
  }

  function checkPart3() {
    var keys = PART3.map(function (q) { return q.key; });
    var allSel = keys.every(function (k) {
      return app.querySelector('input[name="' + k + '"]:checked');
    });
    if (!allSel) return;
    startTimerOnce();

    var bad = [];
    PART3.forEach(function (q) {
      var sel = app.querySelector('input[name="' + q.key + '"]:checked');
      clearMarks(sel.closest("fieldset"));
      var ok = sel.getAttribute("data-correct") === "true";
      var card = sel.closest(".hec-option");
      if (card) card.classList.add(ok ? "is-correct" : "is-wrong");
      if (!ok) bad.push(q.label);
    });

    if (bad.length === 0) {
      award(3, 3);
      markDone(3);
      sfx("correct");
      render();
    } else {
      sfx("wrong");
      showFb(
        "wrong",
        "<strong>Almost there.</strong> Choose clear, polite English for: <em>" +
        bad.join(", ") + "</em>. Avoid short commands. Try again."
      );
    }
  }

  function checkEmail() {
    var text = state.emailText || "";
    startTimerOnce();
    if (!text.trim()) {
      sfx("wrong");
      showFb("wrong", "<strong>Your email is empty.</strong> Write a short formal email, then check again.");
      return;
    }

    var r = analyzeEmail(text);
    var missing = REQ.filter(function (q) { return !r[q.k]; }).map(function (q) { return q.miss; });
    var issues = r.informal.length
      ? ["Change informal words: <em>" + r.informal.join(", ") + "</em>."]
      : [];

    if (missing.length === 0 && issues.length === 0) {
      markDone(6);
      sfx("correct");
      render();
      return;
    }

    sfx("wrong");
    var list = missing.concat(issues).map(function (s) { return "<li>" + s + "</li>"; }).join("");
    showFb(
      "wrong",
      "<strong>Not finished yet.</strong> Please add or fix:<ul>" + list + "</ul>" +
      "Use a hint if you are stuck."
    );
  }

  /* ── Finish ── */
  function finishGame() {
    if (state.finished) return;
    state.finished = true;

    sfx("win");
    var accuracy = Math.round((state.score / MAX_SCORE) * 100);
    // Same thresholds as LAStars.saveFromAccuracy
    var stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;

    // Save stars ONCE here. LAFinish uses save:false to avoid double-counting.
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, stars);
      }
    } catch (_) {}

    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: state.score,
          total: MAX_SCORE,
          accuracy: accuracy,
          stars: stars,
          timeMs: timeMs,
          onAgain: resetGame,
          backHref: "../",
          save: false
        });
        return;
      }
    } catch (_) {}

    // Fallback completion screen
    app.innerHTML = shell(
      '<section class="hec-panel hec-finish">' +
      '<div class="hec-finish-icon" aria-hidden="true">🎉</div>' +
      '<h2 class="hec-heading">Well done!</h2>' +
      '<p class="hec-instruction">You completed the Hotel Email Challenge.</p>' +
      '<p class="hec-finish-score">Score: ' + state.score + " / " + MAX_SCORE + "</p>" +
      '<div class="hec-actions hec-actions-center">' +
      '<button type="button" class="hec-btn hec-btn-primary" data-action="again">Start again</button>' +
      '<a class="hec-btn hec-btn-secondary" href="../">Back to games</a>' +
      "</div></section>"
    );
  }

  /* ── Navigation & state ── */
  function goTo(part) {
    if (!state.unlocked[part]) return;
    sfx("click");
    state.part = part;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetGame() {
    if (state.score > 0 || state.emailText || state.practiceIdx > 0) {
      if (!window.confirm("Start again? Your score, answers, and email will be cleared.")) return;
    }
    state.part = 1;
    state.score = 0;
    state.awarded = { 1: false, 2: false, 3: false, 4: false, 5: false };
    state.completed = emptyMap(false);
    state.unlocked = { 1: true, 2: false, 3: false, 4: false, 5: false, 6: false };
    state.hintLevel = emptyMap(0);
    state.practiceIdx = 0;
    state.practiceText = "";
    state.emailText = "";
    state.orderDone = false;
    state.orderPool = null;
    state.orderPicked = [];
    state.started = false;
    state.finished = false;
    answers = {
      part1: null,
      part2: null,
      part3a: null,
      part3b: null,
      part3c: null,
      part4: null
    };
    render();
  }

  function toggleSound(btn) {
    state.soundOn = !state.soundOn;
    saveSoundPref();
    btn.textContent = state.soundOn ? "🔊" : "🔇";
    btn.setAttribute("aria-pressed", String(state.soundOn));
    btn.setAttribute("aria-label", "Sound " + (state.soundOn ? "on" : "off"));
    if (state.soundOn) sfx("click");
  }

  function updateCheckBtn() {
    var btn = document.getElementById("hec-check");
    if (!btn) return;
    var p = state.part;
    var ok;
    if (p === 3) ok = PART3.every(function (q) { return !!answers[q.key]; });
    else if (p === 5) ok = !!(state.practiceText || "").trim();
    else ok = !!answers["part" + p];
    btn.disabled = !ok;
  }

  /* ── Event delegation (listeners survive re-renders) ── */
  app.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action], a[data-action]");
    if (!btn || !app.contains(btn) || btn.disabled) return;
    var action = btn.getAttribute("data-action");
    switch (action) {
      case "nav":
        goTo(parseInt(btn.getAttribute("data-part"), 10));
        break;
      case "goto":
        goTo(parseInt(btn.getAttribute("data-goto"), 10));
        break;
      case "check":
        if (state.part === 3) checkPart3();
        else if (state.part === 5) checkPractice();
        else if (state.part === 6) { if (state.orderDone) checkEmail(); else checkOrder(); }
        else checkSingle(state.part);
        break;
      case "hint":
        useHint(parseInt(btn.getAttribute("data-part"), 10));
        break;
      case "frame":
        insertFrame(btn.getAttribute("data-text"));
        break;
      case "pick":
        pickSentence(parseInt(btn.getAttribute("data-idx"), 10));
        break;
      case "unpick":
        unpickSentence(parseInt(btn.getAttribute("data-pos"), 10));
        break;
      case "order-reset":
        resetOrder();
        break;
      case "finish":
        finishGame();
        break;
      case "again":
      case "restart":
        resetGame();
        break;
      case "sound":
        toggleSound(btn);
        break;
    }
  });

  app.addEventListener("change", function (e) {
    var t = e.target;
    if (t.type !== "radio") return;
    answers[t.name] = t.value;
    clearMarks(t.closest("fieldset"));
    updateCheckBtn();
  });

  app.addEventListener("input", function (e) {
    if (e.target.id === "hec-practice") {
      state.practiceText = e.target.value;
      updateCheckBtn();
      return;
    }
    if (e.target.id === "hec-email") {
      state.emailText = e.target.value;
      updateLive();
    }
  });

  app.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.id === "hec-practice") {
      e.preventDefault();
      var btn = document.getElementById("hec-check");
      if (btn && !btn.disabled) checkPractice();
    }
  });

  /* ── Render ── */
  function render() {
    switch (state.part) {
      case 1:
      case 2:
      case 4:
        renderSingle(state.part);
        break;
      case 3:
        renderPart3();
        break;
      case 5:
        renderPractice();
        break;
      case 6:
        renderWrite();
        break;
      default:
        state.part = 1;
        renderSingle(1);
    }
  }

  render();
})();
