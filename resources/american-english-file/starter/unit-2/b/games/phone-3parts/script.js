/* Phone Numbers · 3 modes · AEF Starter Unit 2B
   Mode 1: Say the number → then hear the audio
   Mode 2: Listen (no number) → write the number
   Mode 3: Answer “What’s your phone number?” (say or write)
*/
(function () {
  const GAME_ID = "starter-2b-phone-3parts";

  const NUMBERS = [
    {
      id: 1,
      display: "608-5713",
      digits: "6085713",
      audio: "audio/6085713.mp3",
      spoken: ["six zero eight five seven one three", "six oh eight five seven one three"],
    },
    {
      id: 2,
      display: "845-7902",
      digits: "8457902",
      audio: "audio/8457902.mp3",
      spoken: ["eight four five seven nine zero two", "eight four five seven nine oh two"],
    },
    {
      id: 3,
      display: "231-504-0206",
      digits: "2315040206",
      audio: "audio/2315040206.mp3",
      spoken: ["two three one five zero four zero two zero six", "two three one five oh four oh two oh six"],
    },
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu";
  let idx = 0;
  let modeOk = [false, false, false];
  let currentAudio = null;
  let recognition = null;
  let isListening = false;

  function hasSpeech() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function createRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 3;
    return r;
  }

  function stopAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    app.querySelectorAll(".p3-audio-btn.playing").forEach((b) => b.classList.remove("playing"));
  }

  function playSrc(src, onEnd) {
    stopAudio();
    const a = new Audio(src);
    currentAudio = a;
    const btn = app.querySelector(".p3-audio-btn");
    if (btn) btn.classList.add("playing");
    a.play().catch(() => {
      if (btn) btn.classList.remove("playing");
    });
    a.onended = () => {
      if (btn) btn.classList.remove("playing");
      if (currentAudio === a) currentAudio = null;
      if (onEnd) onEnd();
    };
  }

  function stopListen() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (_) {}
    }
    isListening = false;
    app.querySelectorAll(".p3-mic.listening").forEach((b) => b.classList.remove("listening"));
  }

  function startListen(onResult, onError) {
    if (!hasSpeech()) {
      if (onError) onError("Speech recognition needs Chrome.");
      return;
    }
    stopListen();
    recognition = createRec();
    if (!recognition) {
      if (onError) onError("Could not start microphone.");
      return;
    }
    isListening = true;
    const mic = app.querySelector(".p3-mic");
    if (mic) mic.classList.add("listening");

    recognition.onresult = (ev) => {
      let best = "";
      for (let i = 0; i < ev.results.length; i++) {
        for (let j = 0; j < ev.results[i].length; j++) {
          const t = ev.results[i][j].transcript;
          if (t && t.length > best.length) best = t;
        }
      }
      stopListen();
      if (onResult) onResult(best.trim());
    };
    recognition.onerror = (e) => {
      stopListen();
      let msg = "Try again.";
      if (e.error === "not-allowed") msg = "Please allow microphone access.";
      else if (e.error === "no-speech") msg = "No speech detected.";
      if (onError) onError(msg);
    };
    recognition.onend = () => {
      isListening = false;
      app.querySelectorAll(".p3-mic.listening").forEach((b) => b.classList.remove("listening"));
    };
    try {
      recognition.start();
    } catch (_) {
      stopListen();
      if (onError) onError("Could not start microphone.");
    }
  }

  function digitsOnly(s) {
    return String(s || "").replace(/\D/g, "");
  }

  function normalizeSpoken(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\b(oh|o)\b/g, "zero")
      .replace(/\btwo\b/g, "2")
      .replace(/\bone\b/g, "1")
      .replace(/\bthree\b/g, "3")
      .replace(/\bfour\b/g, "4")
      .replace(/\bfive\b/g, "5")
      .replace(/\bsix\b/g, "6")
      .replace(/\bseven\b/g, "7")
      .replace(/\beight\b/g, "8")
      .replace(/\bnine\b/g, "9")
      .replace(/\bzero\b/g, "0")
      .replace(/\s+/g, "")
      .trim();
  }

  function matchSay(transcript, item) {
    const d = digitsOnly(transcript);
    if (d && d === item.digits) return true;
    const t = normalizeSpoken(transcript);
    for (const alt of item.spoken) {
      if (t.includes(normalizeSpoken(alt)) || normalizeSpoken(alt).includes(t)) return true;
    }
    if (d.length >= 6 && item.digits.includes(d)) return true;
    return false;
  }

  function matchWrite(val, item) {
    return digitsOnly(val) === item.digits;
  }

  function matchPart3(text) {
    const t = (text || "").toLowerCase();
    const hasStarter =
      t.includes("my phone number is") ||
      t.includes("my number is") ||
      t.includes("it's") ||
      t.includes("it is");
    const hasDigits = digitsOnly(text).length >= 7;
    return hasStarter && hasDigits;
  }

  function calcStars(correct, total) {
    if (correct >= total) return 3;
    if (correct >= Math.ceil(total * 0.66)) return 2;
    if (correct >= 1) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function topbar(title, badge) {
    return (
      '<header class="p3-topbar">' +
      '<a class="p3-back" href="#" id="p3-home" aria-label="Back">←</a>' +
      '<span class="p3-title">' + title + "</span>" +
      '<span class="p3-badge">' + badge + "</span>" +
      "</header>"
    );
  }

  function bindHome() {
    const h = document.getElementById("p3-home");
    if (h) {
      h.onclick = (e) => {
        e.preventDefault();
        stopAudio();
        stopListen();
        phase = "menu";
        render();
      };
    }
  }

  function doneScreen(title, subtitle, stars, againPhase) {
    app.innerHTML =
      topbar(title, "Done") +
      '<section class="p3-done">' +
      '<div class="trophy-scene' + (stars === 3 ? " perfect" : "") + '">' +
      '<div class="orbit-system">' +
      '<div class="trophy-float">🏆</div>' +
      '<div class="star-orbit"><span class="star' + (stars >= 1 ? " filled" : "") + '">★</span></div>' +
      '<div class="star-orbit"><span class="star' + (stars >= 2 ? " filled" : "") + '">★</span></div>' +
      '<div class="star-orbit"><span class="star' + (stars >= 3 ? " filled" : "") + '">★</span></div>' +
      "</div></div>" +
      "<h1>" + title + "</h1>" +
      "<p>" + subtitle + "</p>" +
      '<button type="button" class="p3-btn" id="p3-again">Play again</button>' +
      '<button type="button" class="p3-btn secondary" id="p3-menu">Modes</button>' +
      "</section>";
    bindHome();
    document.getElementById("p3-again").onclick = () => {
      idx = 0;
      modeOk = [false, false, false];
      phase = againPhase;
      render();
    };
    document.getElementById("p3-menu").onclick = () => {
      phase = "menu";
      render();
    };
  }

  function render() {
    stopAudio();
    stopListen();

    // ===== MENU =====
    if (phase === "menu") {
      app.innerHTML =
        '<header class="p3-topbar">' +
        '<a class="p3-back" href="../" aria-label="Back">←</a>' +
        '<span class="p3-title">Phone Numbers</span>' +
        '<span class="p3-badge">2B</span>' +
        "</header>" +
        '<section class="p3-start">' +
        '<div class="p3-hero"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>' +
        "<h1>Phone Numbers</h1>" +
        '<p class="p3-desc">Choose a mode</p>' +
        '<div class="p3-mode-list">' +
        '<button type="button" class="p3-mode-btn" data-mode="mode1">' +
        '<span class="p3-mode-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span>' +
        '<span class="p3-mode-text"><strong>1. Say the number</strong><small>Speak → then hear the model</small></span>' +
        "</button>" +
        '<button type="button" class="p3-mode-btn" data-mode="mode2">' +
        '<span class="p3-mode-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg></span>' +
        '<span class="p3-mode-text"><strong>2. Listen & write</strong><small>Hear the number → write it</small></span>' +
        "</button>" +
        '<button type="button" class="p3-mode-btn" data-mode="mode3">' +
        '<span class="p3-mode-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>' +
        '<span class="p3-mode-text"><strong>3. Answer the question</strong><small>What’s your phone number?</small></span>' +
        "</button>" +
        "</div>" +
        "</section>";

      app.querySelectorAll(".p3-mode-btn").forEach((btn) => {
        btn.onclick = () => {
          idx = 0;
          modeOk = [false, false, false];
          phase = btn.dataset.mode;
          render();
        };
      });
      return;
    }

    // ===== MODE 1 =====
    if (phase === "mode1") {
      const item = NUMBERS[idx];
      app.innerHTML =
        topbar("1 · Say the number", (idx + 1) + "/3") +
        '<div class="p3-play">' +
        '<p class="p3-inst">Look at the number. Tap the mic and say it.</p>' +
        '<div class="p3-num-card"><span class="p3-num">' + item.display + "</span></div>" +
        '<button type="button" class="p3-mic" id="p3-mic" aria-label="Tap to speak">' +
        '<svg class="p3-mic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        '<span class="p3-mic-rings"><i></i><i></i><i></i></span>' +
        "</button>" +
        '<p class="p3-status" id="p3-status">Tap the microphone</p>' +
        '<p class="p3-trans" id="p3-trans"></p>' +
        '<div class="p3-actions" id="p3-actions"></div>' +
        "</div>";
      bindHome();

      const mic = document.getElementById("p3-mic");
      const status = document.getElementById("p3-status");
      const trans = document.getElementById("p3-trans");
      const actions = document.getElementById("p3-actions");

      function goNext() {
        if (idx < NUMBERS.length - 1) {
          idx++;
          phase = "mode1";
          render();
        } else {
          phase = "mode1done";
          render();
        }
      }

      mic.onclick = () => {
        if (isListening) {
          stopListen();
          status.textContent = "Tap the microphone";
          return;
        }
        status.textContent = "Listening…";
        status.className = "p3-status";
        trans.textContent = "";
        actions.innerHTML = "";
        startListen(
          (text) => {
            trans.textContent = "You said: “" + text + "”";
            if (matchSay(text, item)) {
              modeOk[idx] = true;
              status.innerHTML = '<span class="p3-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> Great! Listen…';
              status.classList.add("is-ok");
              mic.classList.add("is-ok");
              playSrc(item.audio, () => setTimeout(goNext, 350));
            } else {
              status.textContent = "Not quite — try again";
              status.classList.add("is-bad");
              actions.innerHTML =
                '<button type="button" class="p3-btn secondary" id="p3-skip">Skip →</button>';
              document.getElementById("p3-skip").onclick = () => {
                playSrc(item.audio, goNext);
              };
            }
          },
          (err) => {
            status.textContent = err;
            status.classList.add("is-bad");
          }
        );
      };
      return;
    }

    if (phase === "mode1done") {
      const n = modeOk.filter(Boolean).length;
      const stars = saveStars(calcStars(n, 3));
      doneScreen("Nice speaking!", "You said " + n + " number" + (n === 1 ? "" : "s") + " correctly.", stars, "mode1");
      return;
    }

    // ===== MODE 2 =====
    if (phase === "mode2") {
      const item = NUMBERS[idx];
      app.innerHTML =
        topbar("2 · Listen & write", (idx + 1) + "/3") +
        '<div class="p3-play">' +
        '<p class="p3-inst">Listen carefully, then write the phone number.</p>' +
        '<button type="button" class="p3-audio-btn" id="p3-audio" aria-label="Play audio">' +
        '<span class="wave"></span><span class="wave"></span><span class="wave"></span>' +
        '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>' +
        '<div class="eq"><span></span><span></span><span></span><span></span></div>' +
        "</button>" +
        '<p class="p3-listen-label">Tap to listen</p>' +
        '<div class="p3-write-wrap">' +
        '<input type="text" id="p3-input" class="p3-input" placeholder="Write the number…" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
        "</div>" +
        '<p class="p3-status" id="p3-status"></p>' +
        '<div class="p3-actions">' +
        '<button type="button" class="p3-btn" id="p3-check">Check</button>' +
        "</div>" +
        "</div>";
      bindHome();

      document.getElementById("p3-audio").onclick = () => {
        if (currentAudio && !currentAudio.paused) {
          stopAudio();
          return;
        }
        playSrc(item.audio);
      };

      const input = document.getElementById("p3-input");
      const status = document.getElementById("p3-status");
      const checkBtn = document.getElementById("p3-check");

      function advance() {
        if (idx < NUMBERS.length - 1) {
          idx++;
          phase = "mode2";
          render();
        } else {
          phase = "mode2done";
          render();
        }
      }

      checkBtn.onclick = () => {
        const val = input.value.trim();
        if (!val) {
          status.textContent = "Write the number first.";
          status.className = "p3-status is-bad";
          return;
        }
        if (matchWrite(val, item)) {
          modeOk[idx] = true;
          status.innerHTML = '<span class="p3-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> Correct!';
          status.className = "p3-status is-ok";
          input.disabled = true;
          checkBtn.disabled = true;
          setTimeout(advance, 650);
        } else {
          status.textContent = "Not quite — listen again and try.";
          status.className = "p3-status is-bad";
        }
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkBtn.click();
        }
      });
      input.focus();
      return;
    }

    if (phase === "mode2done") {
      const n = modeOk.filter(Boolean).length;
      const stars = saveStars(calcStars(n, 3));
      doneScreen("Good listening!", "You wrote " + n + " number" + (n === 1 ? "" : "s") + " correctly.", stars, "mode2");
      return;
    }

    // ===== MODE 3 =====
    if (phase === "mode3") {
      app.innerHTML =
        topbar("3 · Answer the question", "Speaking / Writing") +
        '<div class="p3-play">' +
        '<div class="p3-q-card">' +
        '<p class="p3-q-label">Question</p>' +
        '<p class="p3-q-text">What’s your phone number?</p>' +
        "</div>" +
        '<div class="p3-s-card">' +
        '<p class="p3-s-label">Start with</p>' +
        '<p class="p3-s-text">“My phone number is…”</p>' +
        "</div>" +
        '<div class="p3-mode-tabs">' +
        '<button type="button" class="p3-tab active" data-mode="speak">' +
        '<svg class="p3-tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        'Speak</button>' +
        '<button type="button" class="p3-tab" data-mode="write">' +
        '<svg class="p3-tab-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
        'Write</button>' +
        "</div>" +
        '<div id="p3-mode-area"></div>' +
        '<p class="p3-status" id="p3-status"></p>' +
        '<p class="p3-trans" id="p3-trans"></p>' +
        "</div>";
      bindHome();

      const modeArea = document.getElementById("p3-mode-area");
      const status = document.getElementById("p3-status");
      const trans = document.getElementById("p3-trans");
      let subMode = "speak";

      function showSub() {
        stopListen();
        status.textContent = "";
        status.className = "p3-status";
        trans.textContent = "";

        if (subMode === "speak") {
          modeArea.innerHTML =
            '<button type="button" class="p3-mic" id="p3-mic" aria-label="Tap to speak">' +
            '<svg class="p3-mic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
        '<span class="p3-mic-rings"><i></i><i></i><i></i></span>' +
            "</button>" +
            '<p class="p3-mic-label">Tap and answer</p>';
          document.getElementById("p3-mic").onclick = () => {
            if (isListening) {
              stopListen();
              status.textContent = "Tap and answer";
              return;
            }
            status.textContent = "Listening…";
            status.className = "p3-status";
            trans.textContent = "";
            startListen(
              (text) => {
                trans.textContent = "You said: “" + text + "”";
                if (matchPart3(text)) {
                  status.innerHTML = '<span class="p3-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> Perfect!';
                  status.classList.add("is-ok");
                  document.getElementById("p3-mic").classList.add("is-ok");
                  setTimeout(() => {
                    phase = "mode3done";
                    render();
                  }, 850);
                } else {
                  status.textContent = "Use “My phone number is…” + a number";
                  status.classList.add("is-bad");
                }
              },
              (err) => {
                status.textContent = err;
                status.classList.add("is-bad");
              }
            );
          };
        } else {
          modeArea.innerHTML =
            '<div class="p3-write-wrap">' +
            '<input type="text" id="p3-input" class="p3-input" placeholder="My phone number is…" autocomplete="off" />' +
            "</div>" +
            '<button type="button" class="p3-btn" id="p3-check">Check</button>';
          const input = document.getElementById("p3-input");
          document.getElementById("p3-check").onclick = () => {
            const val = input.value.trim();
            if (matchPart3(val)) {
              status.innerHTML = '<span class="p3-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> Perfect!';
              status.className = "p3-status is-ok";
              input.disabled = true;
              setTimeout(() => {
                phase = "mode3done";
                render();
              }, 750);
            } else {
              status.textContent = "Start with “My phone number is…” + a number";
              status.className = "p3-status is-bad";
            }
          };
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") document.getElementById("p3-check").click();
          });
          input.focus();
        }
      }

      app.querySelectorAll(".p3-tab").forEach((tab) => {
        tab.onclick = () => {
          app.querySelectorAll(".p3-tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          subMode = tab.dataset.mode;
          showSub();
        };
      });
      showSub();
      return;
    }

    if (phase === "mode3done") {
      const stars = saveStars(3);
      doneScreen("Well done!", "You answered the question.", stars, "mode3");
      return;
    }
  }

  render();
})();
