/* Listen & Repeat + Role-Play · Present Continuous conversation · Starter 9A */
(function () {
  "use strict";

  const GAME_ID = "starter-9a-listen-repeat-conversation";

  const LINES = [
    {
      id: "a1",
      who: "A",
      text: "What are you doing?",
      file: "audio/a1.mp3",
      answers: [
        "what are you doing",
        "what're you doing",
        "what are you doin",
      ],
    },
    {
      id: "b1",
      who: "B",
      text: "I'm making dinner.",
      file: "audio/b1.mp3",
      answers: [
        "i'm making dinner",
        "i am making dinner",
        "im making dinner",
        "i'm making dinner.",
      ],
    },
    {
      id: "a2",
      who: "A",
      text: "Are the children doing their homework?",
      file: "audio/a2.mp3",
      answers: [
        "are the children doing their homework",
        "are the children doing their home work",
      ],
    },
    {
      id: "b2",
      who: "B",
      text: "No, they aren't. They're watching TV.",
      file: "audio/b2.mp3",
      answers: [
        "no they aren't they're watching tv",
        "no they arent they're watching tv",
        "no they aren't they are watching tv",
        "no they're not they're watching tv",
        "no they are not they're watching tv",
        "no they aren't they're watching television",
      ],
    },
    {
      id: "a3",
      who: "A",
      text: "What's your mother doing?",
      file: "audio/a3.mp3",
      answers: [
        "what's your mother doing",
        "what is your mother doing",
        "whats your mother doing",
      ],
    },
    {
      id: "b3",
      who: "B",
      text: "She's helping me.",
      file: "audio/b3.mp3",
      answers: [
        "she's helping me",
        "she is helping me",
        "shes helping me",
      ],
    },
  ];

  const A_LINES = LINES.filter((l) => l.who === "A");
  const B_LINES = LINES.filter((l) => l.who === "B");

  const app = document.getElementById("app");
  if (!app) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const hasSpeech = typeof SpeechRecognition === "function";

  // Screens
  const startScreen = document.getElementById("startScreen");
  const fullScreen = document.getElementById("fullScreen");
  const repeatScreen = document.getElementById("repeatScreen");
  const roleScreen = document.getElementById("roleScreen");
  const endOverlay = document.getElementById("endOverlay");

  // Full conversation
  const fullDialogue = document.getElementById("fullDialogue");
  const playFullBtn = document.getElementById("playFullBtn");
  const fullContinueRow = document.getElementById("fullContinueRow");
  const fullContinueBtn = document.getElementById("fullContinueBtn");

  // Repeat phase
  const repeatProgress = document.getElementById("repeatProgress");
  const repeatBadgeWho = document.getElementById("repeatBadgeWho");
  const repeatText = document.getElementById("repeatText");
  const repeatPlayBtn = document.getElementById("repeatPlayBtn");
  const repeatMicBtn = document.getElementById("repeatMicBtn");
  const repeatMicHint = document.getElementById("repeatMicHint");
  const repeatFeedback = document.getElementById("repeatFeedback");
  const repeatNextRow = document.getElementById("repeatNextRow");
  const repeatNextBtn = document.getElementById("repeatNextBtn");

  // Role phase
  const roleProgress = document.getElementById("roleProgress");
  const roleBanner = document.getElementById("roleBanner");
  const roleBadgeWho = document.getElementById("roleBadgeWho");
  const roleText = document.getElementById("roleText");
  const rolePlayBtn = document.getElementById("rolePlayBtn");
  const roleMicBtn = document.getElementById("roleMicBtn");
  const roleMicHint = document.getElementById("roleMicHint");
  const roleFeedback = document.getElementById("roleFeedback");
  const roleNextRow = document.getElementById("roleNextRow");
  const roleNextBtn = document.getElementById("roleNextBtn");
  const partnerLine = document.getElementById("partnerLine");
  const partnerLabel = document.getElementById("partnerLabel");
  const partnerText = document.getElementById("partnerText");

  let audio = null;
  let audioToken = 0;
  let recognition = null;
  let listening = false;
  let locked = false;

  // State
  let repeatIndex = 0;
  let roleMode = "A"; // "A" then "B"
  let roleIndex = 0;
  let heardOnce = false; // for current line, player must listen before mic

  function show(screen) {
    [startScreen, fullScreen, repeatScreen, roleScreen].forEach((s) =>
      s.classList.add("hidden")
    );
    endOverlay.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  function stopAudio() {
    audioToken += 1;
    if (audio) {
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();
      } catch (e) {}
      audio = null;
    }
  }

  function stopListening() {
    listening = false;
    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (e) {}
      recognition = null;
    }
    if (repeatMicBtn) repeatMicBtn.classList.remove("listening");
    if (roleMicBtn) roleMicBtn.classList.remove("listening");
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^\w\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isMatch(heard, answers) {
    const h = normalize(heard);
    if (!h) return false;
    return answers.some((a) => {
      const target = normalize(a);
      if (h === target) return true;
      // allow small variations / extra words at ends
      if (h.includes(target) || target.includes(h)) return true;
      // simple token overlap for longer lines
      const ht = h.split(" ");
      const tt = target.split(" ");
      if (tt.length >= 3) {
        const overlap = tt.filter((t) => ht.includes(t)).length;
        if (overlap / tt.length >= 0.75) return true;
      }
      return false;
    });
  }

  function playFile(file, onEnded) {
    stopAudio();
    stopListening();
    const token = audioToken;
    const a = new Audio(file);
    audio = a;
    a.volume = 1;
    a.addEventListener("ended", () => {
      if (token !== audioToken) return;
      if (typeof onEnded === "function") onEnded();
    });
    a.addEventListener("error", () => {
      if (token !== audioToken) return;
      if (typeof onEnded === "function") onEnded();
    });
    a.play().catch(() => {
      if (typeof onEnded === "function") onEnded();
    });
  }

  // ---------- Full conversation ----------
  function buildFullDialogue() {
    fullDialogue.innerHTML = LINES.map(
      (l) =>
        `<div class="dialogue-line ${l.who.toLowerCase()}">
          <span class="who">${l.who}</span>
          <span>${escapeHtml(l.text)}</span>
        </div>`
    ).join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function playFullConversation() {
    playFullBtn.disabled = true;
    playFullBtn.classList.add("playing");
    fullContinueRow.classList.add("hidden");
    const hint = document.getElementById("fullPlayHint");
    if (hint) hint.textContent = "Playing…";
    let i = 0;
    function next() {
      if (i >= LINES.length) {
        playFullBtn.disabled = false;
        playFullBtn.classList.remove("playing");
        if (hint) hint.textContent = "Play again";
        fullContinueRow.classList.remove("hidden");
        return;
      }
      const line = LINES[i];
      // highlight current
      const els = fullDialogue.querySelectorAll(".dialogue-line");
      els.forEach((el, idx) => {
        el.style.opacity = idx === i ? "1" : "0.45";
      });
      playFile(line.file, () => {
        i += 1;
        setTimeout(next, 450);
      });
    }
    next();
  }

  // ---------- Listen & Repeat ----------
  function setupRepeatLine() {
    stopAudio();
    stopListening();
    locked = false;
    heardOnce = false;
    const line = LINES[repeatIndex];
    repeatProgress.textContent = `${repeatIndex + 1}/${LINES.length}`;
    if (repeatBadgeWho) repeatBadgeWho.textContent = line.who;
    repeatText.textContent = line.text;
    repeatFeedback.textContent = "";
    repeatFeedback.className = "feedback";
    repeatNextRow.classList.add("hidden");
    repeatMicBtn.disabled = true;
    repeatMicBtn.classList.remove("listening");
    repeatPlayBtn.classList.remove("playing");
    repeatMicHint.textContent = hasSpeech
      ? "Listen first, then press the mic"
      : "Speech not supported — press Next after listening";
    repeatPlayBtn.disabled = false;
  }

  function onRepeatHeard(transcript) {
    const line = LINES[repeatIndex];
    if (isMatch(transcript, line.answers)) {
      repeatFeedback.textContent = "Great! ✓";
      repeatFeedback.className = "feedback ok";
      repeatMicBtn.disabled = true;
      repeatNextRow.classList.remove("hidden");
      locked = true;
    } else {
      repeatFeedback.textContent = "Try again — listen once more if you need";
      repeatFeedback.className = "feedback bad";
      // allow retry
      setTimeout(() => {
        if (!locked) {
          repeatFeedback.textContent = "";
          repeatMicBtn.disabled = false;
        }
      }, 1400);
    }
  }

  function startRepeatMic() {
    if (!hasSpeech || locked || !heardOnce) return;
    stopListening();
    listening = true;
    repeatMicBtn.classList.add("listening");
    repeatMicHint.textContent = "Listening… speak now";
    repeatFeedback.textContent = "";

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onresult = (ev) => {
      let best = "";
      for (let i = 0; i < ev.results.length; i++) {
        for (let j = 0; j < ev.results[i].length; j++) {
          const t = ev.results[i][j].transcript;
          if (t && t.length > best.length) best = t;
        }
      }
      stopListening();
      onRepeatHeard(best);
    };
    recognition.onerror = () => {
      stopListening();
      repeatMicHint.textContent = "Couldn't hear — try again";
      repeatMicBtn.disabled = false;
    };
    recognition.onend = () => {
      if (listening) {
        stopListening();
        repeatMicHint.textContent = "Press the mic and try again";
        repeatMicBtn.disabled = false;
      }
    };
    try {
      recognition.start();
    } catch (e) {
      stopListening();
      repeatMicBtn.disabled = false;
    }
  }

  // ---------- Role-Play ----------
  function currentRoleLines() {
    return roleMode === "A" ? A_LINES : B_LINES;
  }

  // Partner line to play on LISTEN (the line the player is NOT saying)
  let rolePartnerLine = null;

  function setupRoleLine() {
    stopAudio();
    stopListening();
    locked = false;
    heardOnce = false;
    const lines = currentRoleLines();
    const line = lines[roleIndex];
    roleProgress.textContent = `${roleIndex + 1}/${lines.length}`;
    roleBanner.textContent =
      roleMode === "A"
        ? "You are Speaker A — say A's lines"
        : "You are Speaker B — say B's lines";
    if (roleBadgeWho) roleBadgeWho.textContent = line.who;
    roleText.textContent = line.text;
    roleFeedback.textContent = "";
    roleFeedback.className = "feedback";
    roleNextRow.classList.add("hidden");
    roleMicBtn.disabled = true;
    roleMicBtn.classList.remove("listening");
    rolePlayBtn.classList.remove("playing");

    // Partner = previous line in the full conversation (what the other speaker said)
    const fullIdx = LINES.findIndex((l) => l.id === line.id);
    if (fullIdx > 0) {
      rolePartnerLine = LINES[fullIdx - 1];
      partnerLabel.textContent = rolePartnerLine.who + " said";
      partnerText.textContent = rolePartnerLine.text;
      partnerLine.classList.remove("hidden");
      rolePlayBtn.style.display = "";
      rolePlayBtn.disabled = false;
      roleMicHint.textContent = hasSpeech
        ? "Listen to the other speaker, then say your line"
        : "Speech not supported — press Next after listening";
    } else {
      // Opening line (A1) — no partner to listen to; player starts
      rolePartnerLine = null;
      partnerLine.classList.add("hidden");
      partnerText.textContent = "";
      rolePlayBtn.style.display = "none";
      heardOnce = true;
      if (hasSpeech) {
        roleMicBtn.disabled = false;
        roleMicHint.textContent = "Say your opening line";
      } else {
        roleNextRow.classList.remove("hidden");
        roleMicHint.textContent = "Speech not available — continue when ready";
      }
    }
  }

  function onRoleHeard(transcript) {
    const line = currentRoleLines()[roleIndex];
    if (isMatch(transcript, line.answers)) {
      roleFeedback.textContent = "Perfect! ✓";
      roleFeedback.className = "feedback ok";
      roleMicBtn.disabled = true;
      roleNextRow.classList.remove("hidden");
      locked = true;
    } else {
      roleFeedback.textContent = "Almost — try again";
      roleFeedback.className = "feedback bad";
      setTimeout(() => {
        if (!locked) {
          roleFeedback.textContent = "";
          roleMicBtn.disabled = false;
        }
      }, 1400);
    }
  }

  function startRoleMic() {
    if (!hasSpeech || locked || !heardOnce) return;
    stopListening();
    listening = true;
    roleMicBtn.classList.add("listening");
    roleMicHint.textContent = "Listening… speak now";
    roleFeedback.textContent = "";

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onresult = (ev) => {
      let best = "";
      for (let i = 0; i < ev.results.length; i++) {
        for (let j = 0; j < ev.results[i].length; j++) {
          const t = ev.results[i][j].transcript;
          if (t && t.length > best.length) best = t;
        }
      }
      stopListening();
      onRoleHeard(best);
    };
    recognition.onerror = () => {
      stopListening();
      roleMicHint.textContent = "Couldn't hear — try again";
      roleMicBtn.disabled = false;
    };
    recognition.onend = () => {
      if (listening) {
        stopListening();
        roleMicHint.textContent = "Press the mic and try again";
        roleMicBtn.disabled = false;
      }
    };
    try {
      recognition.start();
    } catch (e) {
      stopListening();
      roleMicBtn.disabled = false;
    }
  }

  function finishGame() {
    stopAudio();
    stopListening();
    show(endOverlay);
    endOverlay.classList.remove("hidden");
    if (window.LAStars) {
      try {
        LAStars.recordPlay(GAME_ID);
        LAStars.save(GAME_ID, 3);
      } catch (e) {}
    }
  }

  // ---------- Events ----------
  document.getElementById("startBtn").addEventListener("click", () => {
    buildFullDialogue();
    show(fullScreen);
    fullContinueRow.classList.add("hidden");
    playFullBtn.disabled = false;
    playFullBtn.classList.remove("playing");
    const hint = document.getElementById("fullPlayHint");
    if (hint) hint.textContent = "Play conversation";
  });

  playFullBtn.addEventListener("click", playFullConversation);

  fullContinueBtn.addEventListener("click", () => {
    stopAudio();
    repeatIndex = 0;
    show(repeatScreen);
    setupRepeatLine();
  });

  document.getElementById("fullBack").addEventListener("click", () => {
    stopAudio();
    show(startScreen);
  });

  repeatPlayBtn.addEventListener("click", () => {
    const line = LINES[repeatIndex];
    repeatPlayBtn.disabled = true;
    repeatPlayBtn.classList.add("playing");
    playFile(line.file, () => {
      heardOnce = true;
      repeatPlayBtn.disabled = false;
      repeatPlayBtn.classList.remove("playing");
      if (hasSpeech) {
        repeatMicBtn.disabled = false;
        repeatMicHint.textContent = "Now press the mic and say the sentence";
      } else {
        repeatNextRow.classList.remove("hidden");
        repeatMicHint.textContent = "Speech not available — continue when ready";
      }
    });
  });

  repeatMicBtn.addEventListener("click", startRepeatMic);

  repeatNextBtn.addEventListener("click", () => {
    stopAudio();
    stopListening();
    repeatIndex += 1;
    if (repeatIndex >= LINES.length) {
      // start role-play as A
      roleMode = "A";
      roleIndex = 0;
      show(roleScreen);
      setupRoleLine();
    } else {
      setupRepeatLine();
    }
  });

  document.getElementById("repeatBack").addEventListener("click", () => {
    stopAudio();
    stopListening();
    show(startScreen);
  });

  rolePlayBtn.addEventListener("click", () => {
    // Play the OTHER speaker's line (not the player's line)
    if (!rolePartnerLine) return;
    rolePlayBtn.disabled = true;
    rolePlayBtn.classList.add("playing");
    playFile(rolePartnerLine.file, () => {
      heardOnce = true;
      rolePlayBtn.disabled = false;
      rolePlayBtn.classList.remove("playing");
      if (hasSpeech) {
        roleMicBtn.disabled = false;
        roleMicHint.textContent = "Now press the mic and say your line";
      } else {
        roleNextRow.classList.remove("hidden");
        roleMicHint.textContent = "Speech not available — continue when ready";
      }
    });
  });

  roleMicBtn.addEventListener("click", startRoleMic);

  roleNextBtn.addEventListener("click", () => {
    stopAudio();
    stopListening();
    const lines = currentRoleLines();
    roleIndex += 1;
    if (roleIndex >= lines.length) {
      if (roleMode === "A") {
        // switch to B
        roleMode = "B";
        roleIndex = 0;
        setupRoleLine();
      } else {
        finishGame();
      }
    } else {
      setupRoleLine();
    }
  });

  document.getElementById("roleBack").addEventListener("click", () => {
    stopAudio();
    stopListening();
    show(startScreen);
  });

  document.getElementById("playAgainBtn").addEventListener("click", () => {
    endOverlay.classList.add("hidden");
    show(startScreen);
  });

  document.getElementById("homeBtn").addEventListener("click", () => {
    window.location.href = "../";
  });

  // If no speech support, still allow the flow via Next after listening
  if (!hasSpeech) {
    console.info("SpeechRecognition not available — mic disabled, use Next after listening");
  }
})();
