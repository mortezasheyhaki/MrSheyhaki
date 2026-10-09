/**
 * The or No The — Article practice
 * AEF Level 1 · Unit 11C
 *
 * Ten A/B conversations. Fill each blank with "the" or "no the".
 * - Check once per conversation; wrong blanks can be fixed and re-checked.
 * - Score = blanks correct on the FIRST check (fair for learning).
 * - Hints per blank, keyboard shortcuts, sound effects, mistake review.
 * - LA stars + finish (save once), with a fallback finish screen.
 */
(function () {
  "use strict";

  var GAME_ID = "1-11c-the-or-no-the";
  var SOUND_KEY = "tn-sound";

  /**
   * blanks: { id, answer: "the" | "none", hint }
   * Lines use {{n}} placeholders matching blank ids.
   */
  var PARTS = [
    {
      id: 1,
      a: "Which country has {{1}} best food in {{2}} world?",
      b: "Italy, definitely! I love Italian food! I often have {{3}} pasta for {{4}} dinner.",
      blanks: [
        { id: 1, answer: "the", hint: "Superlatives (the best, the most…) take the." },
        { id: 2, answer: "the", hint: "Unique things like “the world” take the." },
        { id: 3, answer: "none", hint: "Food in general, like pasta, takes no article." },
        { id: 4, answer: "none", hint: "Meals (dinner, lunch, breakfast) take no article." }
      ],
      tip: "Use the with superlatives (the best) and unique places (the world). No article with meals (dinner) or general food (pasta)."
    },
    {
      id: 2,
      a: "What time do you usually go to {{5}} bed?",
      b: "Usually at around 10:00 p.m., but later on {{6}} weekend.",
      blanks: [
        { id: 5, answer: "none", hint: "Fixed phrase: go to bed, with no article." },
        { id: 6, answer: "the", hint: "American English says on the weekend." }
      ],
      tip: "Go to bed (no article). In American English: on the weekend."
    },
    {
      id: 3,
      a: "Do you think {{7}} men are more interested in soccer than {{8}} women?",
      b: "No! I'm a woman and I really like {{9}} soccer.",
      blanks: [
        { id: 7, answer: "none", hint: "Plural nouns used in general take no article." },
        { id: 8, answer: "none", hint: "Same as men: a general plural takes no article." },
        { id: 9, answer: "none", hint: "Sports, like soccer, take no article." }
      ],
      tip: "No article with plural nouns in general (men, women) or with sports (soccer)."
    },
    {
      id: 4,
      a: "How often do you travel by {{10}} train?",
      b: "Every weekday. It's {{11}} easiest way to get to {{12}} work.",
      blanks: [
        { id: 10, answer: "none", hint: "By + transport takes no article: by train, by bus." },
        { id: 11, answer: "the", hint: "Superlative again: the easiest." },
        { id: 12, answer: "none", hint: "Go to work, school, or church: no article." }
      ],
      tip: "by train (no article). the easiest (superlative). go to work (no article)."
    },
    {
      id: 5,
      a: "In your family, who has {{13}} most interesting job?",
      b: "I think {{14}} my brother's job is really interesting. He's an architect.",
      blanks: [
        { id: 13, answer: "the", hint: "the most + adjective is a superlative." },
        { id: 14, answer: "none", hint: "A possessive (my, your, brother's) comes with no article." }
      ],
      tip: "the most (superlative). No article before a possessive (my brother's)."
    },
    {
      id: 6,
      a: "Do {{15}} men in this class talk more than {{16}} women?",
      b: "No! {{17}} men are really quiet.",
      blanks: [
        { id: 15, answer: "the", hint: "A specific group, like the men in this class, takes the." },
        { id: 16, answer: "the", hint: "Same idea: the women in this class." },
        { id: 17, answer: "the", hint: "Repeating a group you already mentioned takes the." }
      ],
      tip: "Use the when you mean a specific group (the men / women in this class)."
    },
    {
      id: 7,
      a: "Do you like {{18}} animals?",
      b: "Yes, I love them! I have a cat and a dog. {{19}} dog is frightened of {{20}} cat!",
      blanks: [
        { id: 18, answer: "none", hint: "Animals in general take no article." },
        { id: 19, answer: "the", hint: "The specific pet we just mentioned: the dog." },
        { id: 20, answer: "the", hint: "The specific pet we just mentioned: the cat." }
      ],
      tip: "No article with animals in general. the dog / the cat = the specific pets just mentioned."
    },
    {
      id: 8,
      a: "How often do you go shopping at {{21}} mall?",
      b: "Hardly ever! I prefer shopping on {{22}} internet.",
      blanks: [
        { id: 21, answer: "the", hint: "Fixed phrase: the mall." },
        { id: 22, answer: "the", hint: "Fixed phrase: on the internet." }
      ],
      tip: "the mall and the internet are common fixed phrases with the."
    },
    {
      id: 9,
      a: "What are you going to do when {{23}} class finishes today?",
      b: "I'm going to have {{24}} lunch with {{25}} my mother-in-law.",
      blanks: [
        { id: 23, answer: "the", hint: "A specific class, like today's class, takes the." },
        { id: 24, answer: "none", hint: "Meals take no article: have lunch." },
        { id: 25, answer: "none", hint: "Nothing comes before a possessive (my, your…)." }
      ],
      tip: "the class (specific). No article with meals (lunch) or before possessives (my)."
    },
    {
      id: 10,
      a: "Do you think {{26}} children behave worse now than in {{27}} past?",
      b: "Yes, I do. I think {{28}} teachers have a really difficult job!",
      blanks: [
        { id: 26, answer: "none", hint: "People in general, like children, take no article." },
        { id: 27, answer: "the", hint: "Fixed phrase: in the past." },
        { id: 28, answer: "none", hint: "Same as children: a general plural takes no article." }
      ],
      tip: "No article with children / teachers in general. the past (fixed phrase)."
    }
  ];

  var TOTAL_PARTS = PARTS.length;
  var TOTAL_BLANKS = PARTS.reduce(function (n, p) { return n + p.blanks.length; }, 0);

  var state = {
    screen: "start",      // start | play | review | done
    partIndex: 0,
    phase: "fill",        // fill | review (after a check)
    answers: {},          // blankId -> "the" | "none"
    firstTry: {},         // blankId -> true/false (first check only)
    activeBlank: null,
    hintOpen: null,       // blankId whose hint is showing
    lastFilled: null,     // for the pop animation
    justChecked: false,   // for the shake animation
    burst: false,         // celebrate a perfect conversation
    totalCorrect: 0,      // first-try correct blanks
    started: false,
    finished: false,
    soundOn: readSoundPref()
  };

  var app = document.getElementById("game-app");
  if (!app) return;

  /* ── Preferences ── */
  function readSoundPref() {
    try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch (_) { return true; }
  }

  function saveSoundPref() {
    try { localStorage.setItem(SOUND_KEY, state.soundOn ? "on" : "off"); } catch (_) {}
  }

  /* ── Sound ── */
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

  function tone(ctx, freq, start, dur, type, vol, slideTo) {
    var t0 = ctx.currentTime + start;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  var BUILT_IN = {
    click: function (c) { tone(c, 880, 0, 0.05, "square", 0.04); },
    pop: function (c) { tone(c, 520, 0, 0.09, "sine", 0.16, 780); },
    tick: function (c) { tone(c, 660, 0, 0.04, "triangle", 0.08); },
    correct: function (c) {
      tone(c, 660, 0, 0.12, "sine", 0.16);
      tone(c, 880, 0.08, 0.2, "sine", 0.16);
    },
    wrong: function (c) { tone(c, 200, 0, 0.28, "triangle", 0.2, 140); },
    perfect: function (c) {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        tone(c, f, i * 0.1, 0.3, "sine", 0.18);
      });
    },
    next: function (c) { tone(c, 440, 0, 0.16, "sine", 0.12, 660); },
    hint: function (c) {
      tone(c, 740, 0, 0.12, "sine", 0.12);
      tone(c, 988, 0.1, 0.2, "sine", 0.12);
    },
    win: function (c) {
      [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach(function (f, i) {
        tone(c, f, i * 0.12, 0.35, "sine", 0.18);
      });
    }
  };

  function sfx(name) {
    if (!state.soundOn) return;
    try {
      // Prefer the site's shared sound pack when it provides the sound
      if (window.LASfx && typeof window.LASfx[name] === "function") {
        window.LASfx[name]();
        return;
      }
      var ctx = getAudio();
      if (ctx && BUILT_IN[name]) BUILT_IN[name](ctx);
    } catch (_) {}
  }

  function toggleSound(btn) {
    state.soundOn = !state.soundOn;
    saveSoundPref();
    if (btn) {
      btn.textContent = state.soundOn ? "🔊" : "🔇";
      btn.setAttribute("aria-pressed", String(state.soundOn));
      btn.setAttribute("aria-label", "Sound " + (state.soundOn ? "on" : "off"));
    }
    if (state.soundOn) sfx("click");
  }

  /* ── Timer & scoring ── */
  function startTimerOnce() {
    if (state.started) return;
    state.started = true;
    try { if (window.LAFinish) LAFinish.startTimer(); } catch (_) {}
  }

  function calcAccuracy() {
    return TOTAL_BLANKS > 0 ? Math.round((state.totalCorrect / TOTAL_BLANKS) * 100) : 0;
  }

  function calcStars(acc) {
    if (acc >= 90) return 3;
    if (acc >= 70) return 2;
    if (acc >= 40) return 1;
    return 0;
  }

  function saveStars() {
    var acc = calcAccuracy();
    var stars = calcStars(acc);
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        if (typeof LAStars.saveFromAccuracy === "function") {
          var r = LAStars.saveFromAccuracy(GAME_ID, acc);
          if (typeof r === "number") stars = r;
        } else {
          LAStars.save(GAME_ID, stars);
        }
      }
    } catch (_) {}
    return stars;
  }

  /* ── Helpers ── */
  function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function currentPart() { return PARTS[state.partIndex]; }

  function findBlank(part, id) {
    for (var i = 0; i < part.blanks.length; i++) {
      if (part.blanks[i].id === id) return part.blanks[i];
    }
    return null;
  }

  function labelFor(val) {
    return val === "the" ? "the" : val === "none" ? "no the" : "";
  }

  function firstEmptyBlank(part) {
    for (var i = 0; i < part.blanks.length; i++) {
      var id = part.blanks[i].id;
      if (!state.answers[id]) return id;
    }
    return null;
  }

  function allFilled(part) {
    return part.blanks.every(function (b) { return !!state.answers[b.id]; });
  }

  function wrongBlanks(part) {
    return part.blanks.filter(function (b) { return state.answers[b.id] !== b.answer; });
  }

  /* ── Line rendering with blanks ── */
  function renderLine(template, part, locked) {
    return template.replace(/\{\{(\d+)\}\}/g, function (_, idStr) {
      var id = parseInt(idStr, 10);
      var val = state.answers[id];
      var blank = findBlank(part, id);
      var cls = "tn-blank";
      if (!locked && state.activeBlank === id) cls += " is-active";
      if (val) cls += " is-filled";
      if (state.lastFilled === id) cls += " is-pop";
      if (locked && blank) cls += val === blank.answer ? " is-correct" : " is-wrong";
      var inner = val
        ? '<span class="tn-blank-text' + (val === "none" ? " is-none" : "") + '">' + labelFor(val) + "</span>"
        : '<span class="tn-empty">···</span>';
      return (
        '<button type="button" class="' + cls + '" data-blank="' + id + '"' +
        (locked ? " disabled" : "") + ' aria-label="Blank ' + id + (val ? ", " + labelFor(val) : ", empty") + '">' +
        inner + "</button>"
      );
    });
  }

  /* ── Shell ── */
  function shell(bodyHtml, opts) {
    opts = opts || {};
    var showScore = opts.score !== false;
    var pct = state.screen === "done" ? 100 : Math.round((state.partIndex / TOTAL_PARTS) * 100);

    return (
      '<div class="tn-top">' +
      '<a class="tn-back" href="../" aria-label="Back to games">←</a>' +
      '<div class="tn-title-wrap">' +
      '<div class="tn-kicker">Unit 11C · Grammar</div>' +
      '<h1 class="tn-title">The or No The</h1>' +
      "</div>" +
      '<button type="button" class="tn-sound" data-action="sound" aria-pressed="' + state.soundOn +
      '" aria-label="Sound ' + (state.soundOn ? "on" : "off") + '">' + (state.soundOn ? "🔊" : "🔇") + "</button>" +
      (showScore
        ? '<div class="tn-score-pill" aria-live="polite"><span class="tn-score-label">Score</span>' +
          '<span class="tn-score-value">' + state.totalCorrect + "/" + TOTAL_BLANKS + "</span></div>"
        : "") +
      "</div>" +
      (opts.progress !== false
        ? '<div class="tn-progress" role="progressbar" aria-valuenow="' + pct +
          '" aria-valuemin="0" aria-valuemax="100"><div class="tn-progress-fill" style="width:' + pct + '%"></div></div>'
        : "") +
      '<div class="tn-body">' + bodyHtml + "</div>" +
      '<div class="tn-footer">' +
      '<button type="button" class="tn-btn tn-btn-ghost" data-action="restart">Start again</button>' +
      '<span class="tn-footer-note">Keys: 1 = the · 2 = no the · ← → move</span>' +
      "</div>"
    );
  }

  /* ── Screens ── */
  function render() {
    if (state.screen === "start") renderStart();
    else if (state.screen === "play") renderPlay();
    else if (state.screen === "review") renderMistakes();
    else renderDoneFallback();
  }

  function renderStart() {
    app.innerHTML = shell(
      '<div class="tn-card tn-hero">' +
      '<div class="tn-hero-icon" aria-hidden="true">📝</div>' +
      "<h2>The or No The</h2>" +
      "<p>Complete ten short conversations. For each blank, choose <strong>the</strong> or <strong>no the</strong>.</p>" +
      '<ol class="tn-howto">' +
      "<li>Read speaker A and speaker B.</li>" +
      "<li>Tap a blank, or let the next one be selected, then press <strong>the</strong> or <strong>no the</strong>.</li>" +
      "<li>Check the conversation. Wrong blanks show a rule, and you can fix them.</li>" +
      "<li>Your score counts blanks you get right on the <em>first</em> check.</li>" +
      "</ol>" +
      '<button type="button" class="tn-btn tn-btn-primary tn-btn-wide" data-action="begin">Start</button>' +
      "</div>",
      { score: false, progress: false }
    );
  }

  function renderPlay() {
    var part = currentPart();
    var locked = state.phase === "review";
    if (!locked && (state.activeBlank == null || state.answers[state.activeBlank])) {
      state.activeBlank = firstEmptyBlank(part);
    }
    var shake = state.justChecked;
    var html = '<div class="tn-card' + (shake ? " is-shake" : "") + '">';

    html += '<div class="tn-dots" aria-hidden="true">' + PARTS.map(function (p, i) {
      return '<span class="tn-dot' + (i < state.partIndex ? " is-done" : i === state.partIndex ? " is-now" : "") + '"></span>';
    }).join("") + "</div>";
    html += '<div class="tn-part-label">Conversation ' + (state.partIndex + 1) + " of " + TOTAL_PARTS + "</div>";

    html +=
      '<div class="tn-bubble a"><span class="tn-avatar" aria-hidden="true">A</span>' +
      '<div class="tn-bubble-text">' + renderLine(part.a, part, locked) + "</div></div>" +
      '<div class="tn-bubble b"><div class="tn-bubble-text">' + renderLine(part.b, part, locked) +
      '</div><span class="tn-avatar" aria-hidden="true">B</span></div>';

    if (!locked) {
      var active = state.activeBlank;
      html += '<div class="tn-prompt" aria-live="polite">' +
        (active != null ? "Choose for <strong>blank " + active + "</strong>:" : "All blanks are filled. Check your answers.") +
        "</div>";
      html +=
        '<div class="tn-chips">' +
        '<button type="button" class="tn-chip" data-chip="the"' + (active == null ? " disabled" : "") + ">the</button>" +
        '<button type="button" class="tn-chip tn-chip-none" data-chip="none"' + (active == null ? " disabled" : "") + ">no the</button>" +
        "</div>";

      var blank = active != null ? findBlank(part, active) : null;
      html += '<div class="tn-hint-row"><button type="button" class="tn-btn tn-btn-hint" data-action="hint"' +
        (blank ? "" : " disabled") + ">💡 Hint</button></div>";
      if (blank && state.hintOpen === active) {
        html += '<div class="tn-hint-box" role="note">' + escapeHtml(blank.hint) + "</div>";
      }
      if (part.tip) html += '<div class="tn-tip"><strong>Tip</strong> ' + escapeHtml(part.tip) + "</div>";
    } else {
      var wrong = wrongBlanks(part);
      var firstCorrect = part.blanks.filter(function (b) { return state.firstTry[b.id]; }).length;
      if (wrong.length === 0) {
        html +=
          '<div class="tn-feedback is-correct" role="status"><strong>✓ Perfect!</strong> ' +
          "All articles are right. You got " + firstCorrect + " of " + part.blanks.length + " on the first try.</div>";
      } else {
        html +=
          '<div class="tn-feedback is-wrong" role="status"><strong>' +
          (part.blanks.length - wrong.length) + " / " + part.blanks.length + " correct.</strong> " +
          "Look at the rules below, then fix the blanks marked ✗.</div>" +
          '<ul class="tn-mistakes">' +
          wrong.map(function (b) {
            return "<li><strong>Blank " + b.id + ":</strong> the answer is “" + labelFor(b.answer) + "”. " +
              escapeHtml(b.hint) + "</li>";
          }).join("") +
          "</ul>";
      }
    }

    html += "</div>"; // card

    if (state.burst && locked && wrongBlanks(part).length === 0) {
      html += '<div class="tn-burst" aria-hidden="true">' +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) {
          return '<span style="--i:' + i + '"></span>';
        }).join("") + "</div>";
    }

    html += '<div class="tn-actions">';
    if (!locked) {
      html +=
        '<button type="button" class="tn-btn tn-btn-primary" data-action="check"' +
        (allFilled(part) ? "" : " disabled") + ">Check answers</button>" +
        '<button type="button" class="tn-btn tn-btn-ghost" data-action="clear">Clear</button>';
    } else if (wrongBlanks(part).length > 0) {
      html += '<button type="button" class="tn-btn tn-btn-primary" data-action="fix">Fix the wrong blanks</button>';
    } else {
      var last = state.partIndex + 1 >= TOTAL_PARTS;
      html += '<button type="button" class="tn-btn tn-btn-success" data-action="next">' +
        (last ? "See results" : "Next conversation →") + "</button>";
    }
    html += "</div>";

    // Clear one-shot animation flags after this frame is built
    state.lastFilled = null;
    state.justChecked = false;
    state.burst = false;

    app.innerHTML = shell(html);
  }

  function renderMistakes() {
    var missed = [];
    PARTS.forEach(function (p, pi) {
      p.blanks.forEach(function (b) {
        if (state.firstTry[b.id] === false) missed.push({ part: pi, blank: b });
      });
    });

    var list = missed.map(function (m) {
      return "<li><strong>Conversation " + (m.part + 1) + ", blank " + m.blank.id + ":</strong> the answer is “" +
        labelFor(m.blank.answer) + "”. " + escapeHtml(m.blank.hint) + "</li>";
    }).join("");

    app.innerHTML = shell(
      '<div class="tn-card">' +
      '<h2 class="tn-review-title">Review your mistakes</h2>' +
      '<p class="tn-review-intro">These blanks were not right on the first check. Read the rules, then try the conversations again next time.</p>' +
      '<ul class="tn-mistakes">' + list + "</ul>" +
      '<div class="tn-actions"><button type="button" class="tn-btn tn-btn-success" data-action="finish">See my results</button></div>' +
      "</div>",
      { progress: false }
    );
  }

  /* ── Actions ── */
  function beginGame() {
    sfx("click");
    state.screen = "play";
    state.partIndex = 0;
    state.phase = "fill";
    state.answers = {};
    state.firstTry = {};
    state.activeBlank = PARTS[0].blanks[0].id;
    state.hintOpen = null;
    state.totalCorrect = 0;
    state.started = false;
    state.finished = false;
    render();
  }

  function fillBlank(val) {
    var part = currentPart();
    if (state.phase !== "fill") return;
    if (state.activeBlank == null) state.activeBlank = firstEmptyBlank(part);
    if (state.activeBlank == null) return;

    state.answers[state.activeBlank] = val;
    state.lastFilled = state.activeBlank;
    state.hintOpen = null;
    sfx("pop");
    state.activeBlank = firstEmptyBlank(part);
    render();
  }

  function selectBlank(id) {
    if (state.phase !== "fill") return;
    state.activeBlank = id;
    state.hintOpen = null;
    sfx("tick");
    render();
  }

  function moveActive(step) {
    var part = currentPart();
    var ids = part.blanks.map(function (b) { return b.id; });
    var idx = ids.indexOf(state.activeBlank);
    if (idx < 0) idx = 0;
    var next = (idx + step + ids.length) % ids.length;
    selectBlank(ids[next]);
  }

  function checkPart() {
    var part = currentPart();
    if (!allFilled(part)) return;
    startTimerOnce();

    part.blanks.forEach(function (b) {
      if (state.firstTry[b.id] === undefined) {
        var ok = state.answers[b.id] === b.answer;
        state.firstTry[b.id] = ok;
        if (ok) state.totalCorrect += 1;
      }
    });

    state.phase = "review";
    state.activeBlank = null;
    state.hintOpen = null;

    var wrong = wrongBlanks(part).length;
    if (wrong === 0) {
      var firstAllRight = part.blanks.every(function (b) { return state.firstTry[b.id]; });
      state.burst = firstAllRight;
      sfx(firstAllRight ? "perfect" : "correct");
    } else {
      state.justChecked = true;
      sfx("wrong");
    }
    render();
  }

  function fixWrong() {
    var part = currentPart();
    var wrong = wrongBlanks(part);
    wrong.forEach(function (b) { delete state.answers[b.id]; });
    state.phase = "fill";
    state.activeBlank = wrong.length ? wrong[0].id : null;
    state.hintOpen = null;
    sfx("click");
    render();
  }

  function clearPart() {
    var part = currentPart();
    part.blanks.forEach(function (b) { delete state.answers[b.id]; });
    state.activeBlank = part.blanks[0].id;
    state.hintOpen = null;
    sfx("click");
    render();
  }

  function nextPart() {
    sfx("next");
    if (state.partIndex + 1 >= TOTAL_PARTS) {
      var anyMissed = PARTS.some(function (p) {
        return p.blanks.some(function (b) { return state.firstTry[b.id] === false; });
      });
      if (anyMissed) {
        state.screen = "review";
        render();
      } else {
        finishGame();
      }
      return;
    }
    state.partIndex += 1;
    state.phase = "fill";
    state.answers = {};
    state.activeBlank = PARTS[state.partIndex].blanks[0].id;
    state.hintOpen = null;
    render();
  }

  function showHint() {
    if (state.activeBlank == null) return;
    state.hintOpen = state.hintOpen === state.activeBlank ? null : state.activeBlank;
    if (state.hintOpen != null) sfx("hint");
    render();
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true;
    state.screen = "done";
    sfx("win");

    var stars = saveStars();
    var acc = calcAccuracy();

    try {
      if (window.LAFinish) {
        var timeMs = LAFinish.stopTimer();
        LAFinish.show({
          gameId: GAME_ID,
          score: state.totalCorrect,
          total: TOTAL_BLANKS,
          accuracy: acc,
          stars: stars,
          timeMs: timeMs,
          save: false,
          onAgain: function () { resetGame(true); },
          backHref: "../"
        });
        return;
      }
    } catch (_) {}

    renderDoneFallback();
  }

  function renderDoneFallback() {
    var acc = calcAccuracy();
    var note =
      acc >= 90 ? "Excellent! You really know when to use the."
        : acc >= 70 ? "Good work! Review the rules and try again for a higher score."
        : "Keep practising. Remember superlatives and specific groups often need the.";

    app.innerHTML = shell(
      '<div class="tn-card tn-hero">' +
      '<div class="tn-hero-icon" aria-hidden="true">🏆</div>' +
      "<h2>Well done!</h2>" +
      '<p class="tn-final-score">' + state.totalCorrect + " / " + TOTAL_BLANKS + "</p>" +
      "<p>" + note + "</p>" +
      '<div class="tn-actions tn-actions-center">' +
      '<button type="button" class="tn-btn tn-btn-primary" data-action="again">Play again</button>' +
      '<a class="tn-btn tn-btn-ghost" href="../">Back to games</a>' +
      "</div></div>",
      { progress: false }
    );
  }

  function resetGame(skipConfirm) {
    if (!skipConfirm && (state.totalCorrect > 0 || state.partIndex > 0)) {
      if (!window.confirm("Start again? Your progress will be cleared.")) return;
    }
    state.screen = "start";
    state.partIndex = 0;
    state.phase = "fill";
    state.answers = {};
    state.firstTry = {};
    state.activeBlank = null;
    state.hintOpen = null;
    state.totalCorrect = 0;
    state.started = false;
    state.finished = false;
    render();
  }

  /* ── Event handling ── */
  app.addEventListener("click", function (e) {
    var target = e.target;

    var blankBtn = target.closest("[data-blank]");
    if (blankBtn && app.contains(blankBtn) && !blankBtn.disabled) {
      selectBlank(parseInt(blankBtn.getAttribute("data-blank"), 10));
      return;
    }

    var chip = target.closest("[data-chip]");
    if (chip && app.contains(chip) && !chip.disabled) {
      fillBlank(chip.getAttribute("data-chip") === "the" ? "the" : "none");
      return;
    }

    var btn = target.closest("button[data-action]");
    if (!btn || !app.contains(btn) || btn.disabled) return;

    switch (btn.getAttribute("data-action")) {
      case "begin": beginGame(); break;
      case "check": checkPart(); break;
      case "fix": fixWrong(); break;
      case "next": nextPart(); break;
      case "clear": clearPart(); break;
      case "hint": showHint(); break;
      case "finish": finishGame(); break;
      case "again": resetGame(true); break;
      case "restart": resetGame(false); break;
      case "sound": toggleSound(btn); break;
    }
  });

  // Keyboard: 1 / T = the, 2 / N = no the, arrows move, Enter checks
  document.addEventListener("keydown", function (e) {
    if (state.screen !== "play" || state.phase !== "fill") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === "1" || k === "t") { e.preventDefault(); fillBlank("the"); }
    else if (k === "2" || k === "n") { e.preventDefault(); fillBlank("none"); }
    else if (k === "arrowright") { e.preventDefault(); moveActive(1); }
    else if (k === "arrowleft") { e.preventDefault(); moveActive(-1); }
    else if (k === "enter") {
      var check = app.querySelector('[data-action="check"]');
      if (check && !check.disabled) { e.preventDefault(); checkPart(); }
    }
  });

  render();
})();
