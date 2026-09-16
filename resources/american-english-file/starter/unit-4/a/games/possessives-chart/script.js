/* Possessives Chart · listen & read · Unit 4A */
(function () {
  const GAME_ID = "starter-4a-possessives-chart";
  const AUDIO_URL =
    "https://cdn.imgurl.ir/uploads/z5383_AEF3e_Starter_SB_4_mp3cut_net.mp3";

  // Dialogue with highlight markers: [text] = yellow highlight
  const DIALOGUE = [
    { sp: "Maria", t: "Hi, Sarah! Come in." },
    { sp: "Sarah", t: "Thanks." },
    { sp: "Maria", t: "This is [my husband], Mark." },
    { sp: "Mark", t: "Hello." },
    { sp: "Sarah", t: "Hi." },
    { sp: "Maria", t: "And these are [our children]." },
    { sp: "Children", t: "Hello!" },
    { sp: "Sarah", t: "What are [their names]?" },
    { sp: "Maria", t: "[Her name]'s Emma, and [his name]'s Oliver." },
    { sp: "Emma", t: "And this is [our cat]." },
    { sp: "Sarah", t: "Oh, cute! What's [its name]?" },
    { sp: "Emma", t: "[Her name] is Princess. She's a girl." },
    { sp: "Sarah", t: "Oh, sorry." },
    { sp: "Maria", t: "The name of the restaurant is [Marc's] Café. The phone number's on the table over there." },
    { sp: "Sarah", t: "Great, thanks." },
    { sp: "Maria", t: "And [my husband's] phone number is there, too." },
    { sp: "Sarah", t: "OK. And your number is in my phone." },
    { sp: "Maria", t: "Now, children. Sarah is [your babysitter]. Be good." },
    { sp: "Children", t: "OK, Mom." },
  ];

  // Chart rows — example rows locked with given answers
  const ROWS = [
    { id: "i", pronoun: "I", answer: "my husband", example: true },
    { id: "you", pronoun: "you", answer: null, example: false }, // leave blank (not required)
    { id: "he", pronoun: "he", answer: "his name", example: false },
    { id: "she", pronoun: "she", answer: "her name", example: false },
    { id: "it", pronoun: "it", answer: "its name", example: false },
    { id: "we", pronoun: "we", answer: "our children", example: true },
    { id: "youp", pronoun: "you (plural)", answer: "your babysitter", example: false },
    { id: "they", pronoun: "they", answer: "their names", example: false },
  ];


  // Extra gap-fill from the book (1–2)
  const GAPS = [
    {
      id: "g1",
      before: "The name of the restaurant is ",
      after: " Café.",
      answer: "Marc's",
    },
    {
      id: "g2",
      before: "My ",
      after: " phone number is there, too.",
      answer: "husband's",
    },
  ];

  const BANK = [
    "his name",
    "her name",
    "its name",
    "their names",
    "your babysitter",
    "Marc's",
    "husband's",
    "our cat", // distractor
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let answers = {}; // rowId -> phrase
  let selectedChip = null;
  let checked = false;
  let audio = null;
  let playing = false;

  function requiredRows() {
    return ROWS.filter(function (r) {
      return r.answer && !r.example;
    });
  }

  function requiredGaps() {
    return GAPS.slice();
  }

  function allRequired() {
    return requiredRows().length + requiredGaps().length;
  }

  function ensureAudio() {
    if (!audio) {
      audio = new Audio(AUDIO_URL);
      audio.preload = "auto";
      audio.addEventListener("ended", function () {
        playing = false;
        var btn = document.getElementById("pc-play");
        if (btn) btn.classList.remove("playing");
      });
    }
    return audio;
  }

  function stopAudio() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }
    playing = false;
    var btn = document.getElementById("pc-play");
    if (btn) btn.classList.remove("playing");
  }

  function togglePlay() {
    var a = ensureAudio();
    var btn = document.getElementById("pc-play");
    if (playing) {
      a.pause();
      playing = false;
      if (btn) btn.classList.remove("playing");
      return;
    }
    a.play()
      .then(function () {
        playing = true;
        if (btn) btn.classList.add("playing");
      })
      .catch(function () {
        playing = false;
      });
  }

  function formatLine(t) {
    return t.replace(/\[([^\]]+)\]/g, '<span class="pc-hl">$1</span>');
  }

  function usedPhrases() {
    var set = {};
    Object.keys(answers).forEach(function (k) {
      if (answers[k]) set[answers[k]] = true;
    });
    return set;
  }

  function score() {
    var rows = requiredRows();
    var gaps = requiredGaps();
    var ok = 0;
    rows.forEach(function (r) {
      if (answers[r.id] === r.answer) ok++;
    });
    gaps.forEach(function (g) {
      if (answers[g.id] === g.answer) ok++;
    });
    return { ok: ok, total: rows.length + gaps.length };
  }

  function calcStars(ok, total) {
    if (ok >= total) return 3;
    if (ok >= Math.ceil(total * 0.6)) return 2;
    if (ok >= 1) return 1;
    return 0;
  }

  function saveStars(stars) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, stars);
    }
  }

  function startGame() {
    answers = {};
    selectedChip = null;
    checked = false;
    stopAudio();
    phase = "play";
    render();
  }

  function check() {
    if (checked) return;
    var rows = requiredRows();
    var gaps = requiredGaps();
    var filled =
      rows.every(function (r) { return !!answers[r.id]; }) &&
      gaps.every(function (g) { return !!answers[g.id]; });
    if (!filled) {
      var fb = document.getElementById("pc-feedback");
      if (fb) {
        fb.textContent = "Fill all the empty boxes first.";
        fb.className = "pc-feedback bad";
      }
      return;
    }
    checked = true;
    var s = score();
    var stars = calcStars(s.ok, s.total);
    saveStars(stars);

    rows.forEach(function (r) {
      var slot = document.querySelector('.pc-slot[data-id="' + r.id + '"]');
      if (!slot) return;
      if (answers[r.id] === r.answer) slot.classList.add("correct");
      else slot.classList.add("wrong");
    });
    gaps.forEach(function (g) {
      var slot = document.querySelector('.pc-slot[data-id="' + g.id + '"]');
      if (!slot) return;
      if (answers[g.id] === g.answer) slot.classList.add("correct");
      else slot.classList.add("wrong");
    });

    var fb = document.getElementById("pc-feedback");
    if (fb) {
      fb.textContent =
        s.ok === s.total
          ? "Perfect! " + s.ok + "/" + s.total
          : "You got " + s.ok + "/" + s.total + " correct.";
      fb.className = "pc-feedback " + (s.ok === s.total ? "ok" : "bad");
    }

    var checkBtn = document.getElementById("pc-check");
    if (checkBtn) checkBtn.style.display = "none";
    var cont = document.getElementById("pc-continue");
    if (cont) cont.style.display = "";
  }

  function placeChip(rowId) {
    if (checked || !selectedChip) return;
    var row = ROWS.find(function (r) {
      return r.id === rowId;
    });
    var gap = GAPS.find(function (g) {
      return g.id === rowId;
    });
    if (row) {
      if (row.example || !row.answer) return;
    } else if (!gap) {
      return;
    }

    // free previous use of this phrase
    Object.keys(answers).forEach(function (k) {
      if (answers[k] === selectedChip) delete answers[k];
    });
    answers[rowId] = selectedChip;
    selectedChip = null;
    renderPlay();
  }

  function renderPlay() {
    var used = usedPhrases();

    var dialogueHtml = DIALOGUE.map(function (line) {
      return (
        '<div class="pc-line"><span class="pc-speaker">' +
        line.sp +
        '</span><span class="pc-text">' +
        formatLine(line.t) +
        "</span></div>"
      );
    }).join("");

    var bankHtml = BANK.map(function (phrase) {
      var cls = "pc-chip";
      if (used[phrase]) cls += " used";
      if (selectedChip === phrase) cls += " selected";
      return (
        '<button type="button" class="' +
        cls +
        '" data-phrase="' +
        phrase +
        '">' +
        phrase +
        "</button>"
      );
    }).join("");

    var rowsHtml = ROWS.map(function (r) {
      if (!r.answer && !r.example) {
        // optional empty row (you singular) — skip or show blank non-interactive
        return (
          "<tr><th>" +
          r.pronoun +
          '</th><td><div class="pc-slot example">—</div></td></tr>'
        );
      }
      if (r.example) {
        return (
          "<tr><th>" +
          r.pronoun +
          '</th><td><div class="pc-slot example">' +
          r.answer +
          "</div></td></tr>"
        );
      }
      var val = answers[r.id] || "";
      var cls = "pc-slot" + (val ? " filled" : "");
      return (
        "<tr><th>" +
        r.pronoun +
        '</th><td><div class="' +
        cls +
        '" data-id="' +
        r.id +
        '">' +
        val +
        "</div></td></tr>"
      );
    }).join("");


    var gapsHtml = GAPS.map(function (g, i) {
      var val = answers[g.id] || "";
      var cls = "pc-slot" + (val ? " filled" : "");
      return (
        '<div class="pc-gap-line">' +
        '<span class="pc-gap-num">' + (i + 1) + "</span>" +
        '<span class="pc-gap-text">' +
        g.before +
        '<span class="' +
        cls +
        '" data-id="' +
        g.id +
        '">' +
        val +
        "</span>" +
        g.after +
        "</span></div>"
      );
    }).join("");

    app.innerHTML =
      '<header class="pc-topbar">' +
      '<a class="pc-back" href="../" aria-label="Back">←</a>' +
      '<span class="pc-title">Possessives Chart</span>' +
      '<span class="pc-badge">4A</span></header>' +
      '<div class="pc-play">' +
      '<div class="pc-player">' +
      '<button type="button" class="pc-play-btn" id="pc-play" aria-label="Play">' +
      '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
      '<div class="eq"><span></span><span></span><span></span></div></button>' +
      '<div class="pc-player-meta"><strong>Conversation</strong>' +
      "<span>Listen and read the yellow phrases</span></div></div>" +
      '<div class="pc-dialogue">' +
      dialogueHtml +
      "</div>" +
      '<div class="pc-bank">' +
      bankHtml +
      "</div>" +
      '<div class="pc-chart-wrap"><table class="pc-chart">' +
      rowsHtml +
      "</table></div>" +
      '<div class="pc-gaps"><p class="pc-gaps-title">Complete the sentences</p>' +
      gapsHtml +
      "</div>" +
      '<p class="pc-feedback" id="pc-feedback"></p>' +
      '<div class="pc-actions">' +
      '<button type="button" class="pc-btn secondary" id="pc-clear">Clear</button>' +
      '<button type="button" class="pc-btn" id="pc-check">Check</button>' +
      '<button type="button" class="pc-btn" id="pc-continue" style="display:none">Continue</button>' +
      "</div></div>";

    document.getElementById("pc-play").onclick = togglePlay;
    document.getElementById("pc-check").onclick = check;
    document.getElementById("pc-clear").onclick = function () {
      if (checked) return;
      answers = {};
      selectedChip = null;
      renderPlay();
    };
    document.getElementById("pc-continue").onclick = function () {
      stopAudio();
      phase = "done";
      render();
    };

    app.querySelectorAll(".pc-chip:not(.used)").forEach(function (btn) {
      btn.onclick = function () {
        if (checked) return;
        selectedChip =
          selectedChip === btn.dataset.phrase ? null : btn.dataset.phrase;
        renderPlay();
      };
    });

    app.querySelectorAll(".pc-slot[data-id]").forEach(function (slot) {
      slot.onclick = function () {
        if (checked) return;
        if (selectedChip) {
          placeChip(slot.dataset.id);
          return;
        }
        // clear slot if already filled
        if (answers[slot.dataset.id]) {
          delete answers[slot.dataset.id];
          renderPlay();
        }
      };
    });
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="pc-topbar">' +
        '<a class="pc-back" href="../" aria-label="Back">←</a>' +
        '<span class="pc-title">Possessives Chart</span>' +
        '<span class="pc-badge">4A</span></header>' +
        '<section class="pc-start">' +
        '<div class="pc-hero" aria-hidden="true">📋</div>' +
        "<h1>Possessives Chart</h1>" +
        '<p class="pc-desc">Listen and read the conversation. Use the yellow phrases to complete the chart.</p>' +
        '<button type="button" class="pc-btn" id="pc-start">Start</button></section>';
      document.getElementById("pc-start").onclick = startGame;
      return;
    }

    if (phase === "done") {
      var s = score();
      var stars = calcStars(s.ok, s.total);
      app.innerHTML =
        '<header class="pc-topbar">' +
        '<a class="pc-back" href="../" aria-label="Back">←</a>' +
        '<span class="pc-title">Possessives Chart</span>' +
        '<span class="pc-badge">Done</span></header>' +
        '<section class="pc-done">' +
        '<div class="pc-stars">' +
        "★".repeat(stars) +
        "☆".repeat(3 - stars) +
        "</div>" +
        "<h1>" +
        (stars === 3 ? "Perfect!" : stars >= 1 ? "Good job!" : "Keep practicing!") +
        "</h1>" +
        '<p class="pc-desc">You got <strong>' +
        s.ok +
        " / " +
        s.total +
        "</strong> correct.</p>" +
        '<button type="button" class="pc-btn" id="pc-again">Play again</button>' +
        '<button type="button" class="pc-btn secondary" id="pc-menu">Back to start</button></section>';
      document.getElementById("pc-again").onclick = startGame;
      document.getElementById("pc-menu").onclick = function () {
        phase = "menu";
        render();
      };
      return;
    }

    renderPlay();
  }

  render();
})();
