(function () {
  "use strict";

  // Level 1 — single color words (solid color pictures)
  const WORD_ITEMS = [
    { id: "black", answers: ["black"], img: "../images/black.png", say: "black" },
    { id: "blue", answers: ["blue"], img: "../images/blue.png", say: "blue" },
    { id: "brown", answers: ["brown"], img: "../images/brown.png", say: "brown" },
    { id: "green", answers: ["green"], img: "../images/green.png", say: "green" },
    { id: "grey", answers: ["grey", "gray"], img: "../images/grey.png", say: "grey" },
    { id: "orange", answers: ["orange"], img: "../images/orange.png", say: "orange" },
    { id: "pink", answers: ["pink"], img: "../images/pink.png", say: "pink" },
    { id: "red", answers: ["red"], img: "../images/red.png", say: "red" },
    { id: "white", answers: ["white"], img: "../images/white.png", say: "white" },
    { id: "yellow", answers: ["yellow"], img: "../images/yellow.png", say: "yellow" },
  ];

  // Level 2 — full sentences (object pictures from What is it?)
  // Paths: ../what-is-it/images/…  audio still the color word
  const SENTENCE_ITEMS = [
    {
      id: "black",
      say: "It's a black bag.",
      img: "../what-is-it/images/black.png",
      prompt: "What is it?",
      cue: "It's a …",
      answers: [
        "it's a black bag",
        "it is a black bag",
        "a black bag",
        "black bag",
      ],
    },
    {
      id: "blue",
      say: "They're blue keys.",
      img: "../what-is-it/images/blue.png",
      prompt: "What are they?",
      cue: "They're …",
      answers: [
        "they're blue keys",
        "they are blue keys",
        "blue keys",
      ],
    },
    {
      id: "brown",
      say: "They're brown eggs.",
      img: "../what-is-it/images/brown.png",
      prompt: "What are they?",
      cue: "They're …",
      answers: [
        "they're brown eggs",
        "they are brown eggs",
        "brown eggs",
      ],
    },
    {
      id: "green",
      say: "They're green pencils.",
      img: "../what-is-it/images/green.png",
      prompt: "What are they?",
      cue: "They're …",
      answers: [
        "they're green pencils",
        "they are green pencils",
        "green pencils",
      ],
    },
    {
      id: "grey",
      say: "It's a grey chair.",
      img: "../what-is-it/images/grey.png",
      prompt: "What is it?",
      cue: "It's a …",
      answers: [
        "it's a grey chair",
        "it is a grey chair",
        "it's a gray chair",
        "it is a gray chair",
        "a grey chair",
        "a gray chair",
        "grey chair",
        "gray chair",
      ],
    },
    {
      id: "orange",
      say: "It's an orange watch.",
      img: "../what-is-it/images/orange.png",
      prompt: "What is it?",
      cue: "It's an …",
      answers: [
        "it's an orange watch",
        "it is an orange watch",
        "it's a orange watch",
        "it is a orange watch",
        "an orange watch",
        "a orange watch",
        "orange watch",
      ],
    },
    {
      id: "pink",
      say: "It's a pink phone.",
      img: "../what-is-it/images/pink.png",
      prompt: "What is it?",
      cue: "It's a …",
      answers: [
        "it's a pink phone",
        "it is a pink phone",
        "a pink phone",
        "pink phone",
      ],
    },
    {
      id: "red",
      say: "It's a red car.",
      img: "../what-is-it/images/red.png",
      prompt: "What is it?",
      cue: "It's a …",
      answers: [
        "it's a red car",
        "it is a red car",
        "a red car",
        "red car",
      ],
    },
    {
      id: "white",
      say: "It's a white bicycle.",
      img: "../what-is-it/images/white.png",
      prompt: "What is it?",
      cue: "It's a …",
      answers: [
        "it's a white bicycle",
        "it is a white bicycle",
        "it's a white bike",
        "it is a white bike",
        "a white bicycle",
        "a white bike",
        "white bicycle",
        "white bike",
      ],
    },
    {
      id: "yellow",
      say: "It's a yellow umbrella.",
      img: "../what-is-it/images/yellow.png",
      prompt: "What is it?",
      cue: "It's a …",
      answers: [
        "it's a yellow umbrella",
        "it is a yellow umbrella",
        "a yellow umbrella",
        "yellow umbrella",
      ],
    },
  ];

  const GAME_ID = "vocab-colors-say-color";
  const $ = (id) => document.getElementById(id);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  let level = "words"; // "words" | "sentences"
  let items = WORD_ITEMS;
  let order = [];
  let idx = 0;
  let score = 0;
  let correct = 0;
  let attempts = 0;
  let locked = false;
  let recognition = null;
  let listening = false;

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Words: accept if the color word appears in the transcript.
   * Sentences: accept if any full accepted phrase is contained / equals transcript,
   * or (fallback) color + object keywords both present.
   */
  function matchesAnswer(transcript, item) {
    const t = norm(transcript);
    if (!t) return false;
    const answers = item.answers || [];

    // Exact or contains accepted phrase
    for (let i = 0; i < answers.length; i++) {
      const a = norm(answers[i]);
      if (!a) continue;
      if (t === a || t.includes(a) || a.includes(t)) return true;
    }

    // Word-level: single color in the list of answers
    if (level === "words") {
      const words = t.split(" ");
      return answers.some((a) => {
        const n = norm(a);
        return words.includes(n);
      });
    }

    // Sentence fallback: need color word + object keyword
    const color = item.id === "grey" ? ["grey", "gray"] : [item.id];
    const objectMap = {
      black: ["bag"],
      blue: ["key", "keys"],
      brown: ["egg", "eggs"],
      green: ["pencil", "pencils"],
      grey: ["chair"],
      orange: ["watch"],
      pink: ["phone"],
      red: ["car"],
      white: ["bike", "bicycle"],
      yellow: ["umbrella"],
    };
    const objs = objectMap[item.id] || [];
    const hasColor = color.some((c) => t.includes(c));
    const hasObj = objs.some((o) => t.includes(o));
    return hasColor && hasObj;
  }

  function show(s) {
    const start = $("startScreen");
    const game = $("gameScreen");
    const end = $("endScreen");
    if (start) start.hidden = s !== "start";
    if (game) game.hidden = s !== "game";
    if (end) end.hidden = s !== "end";
    if (s === "end" && end) {
      end.removeAttribute("hidden");
      end.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setFb(msg, type) {
    const fb = $("feedback");
    if (!fb) return;
    fb.textContent = msg || "";
    fb.className = "feedback" + (type ? " " + type : "");
  }

  function setHeard(text) {
    const el = $("heardText");
    if (el) el.textContent = text || "—";
  }

  function setMicHint(text, listeningState) {
    const el = $("micHint");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("listening", !!listeningState);
  }

  function stopSpeech() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
    const btn = $("playAudioBtn");
    if (btn) btn.classList.remove("is-playing");
  }

  /** Speak the model answer (word or full sentence) via browser TTS */
  function speakItem(item) {
    const btn = $("playAudioBtn");
    stopSpeech();
    if (!item) return;
    const text = item.say || (item.answers && item.answers[0]) || item.id || "";
    if (!text || !window.speechSynthesis) return;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.92;
    if (btn) btn.classList.add("is-playing");
    u.onend = function () {
      if (btn) btn.classList.remove("is-playing");
    };
    u.onerror = function () {
      if (btn) btn.classList.remove("is-playing");
    };
    window.speechSynthesis.speak(u);
  }

  function stopListening() {
    listening = false;
    const btn = $("micBtn");
    if (btn) btn.classList.remove("is-listening");
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  }

  function startListening() {
    if (!SpeechRecognition || locked || listening) return;
    if (!recognition) return;

    setHeard("—");
    setFb("", "");
    setMicHint(
      level === "sentences" ? "Listening… say the sentence!" : "Listening… say the color!",
      true
    );
    listening = true;
    const btn = $("micBtn");
    if (btn) btn.classList.add("is-listening");

    try {
      recognition.start();
    } catch (e) {
      listening = false;
      if (btn) btn.classList.remove("is-listening");
      setMicHint("Tap the mic and speak", false);
    }
  }

  function setupRecognition() {
    if (!SpeechRecognition) {
      const note = $("supportNote");
      if (note) note.hidden = false;
      const mic = $("micBtn");
      if (mic) mic.disabled = true;
      setMicHint("Speech not supported — use Skip", false);
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    recognition.onresult = function (event) {
      let finalTranscript = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        // Prefer highest-confidence alternative when final
        let best = res[0] ? res[0].transcript : "";
        if (res.isFinal && res.length > 1) {
          let bestScore = res[0].confidence || 0;
          for (let a = 1; a < res.length; a++) {
            if ((res[a].confidence || 0) > bestScore) {
              bestScore = res[a].confidence || 0;
              best = res[a].transcript;
            }
          }
        }
        if (res.isFinal) finalTranscript += best;
        else interim += best;
      }
      const shown = norm(finalTranscript || interim);
      if (shown) setHeard(shown);

      if (finalTranscript && !locked) {
        evaluate(finalTranscript);
      }
    };

    recognition.onerror = function (event) {
      listening = false;
      const btn = $("micBtn");
      if (btn) btn.classList.remove("is-listening");
      const err = event.error || "";
      if (err === "no-speech") {
        setMicHint("No speech heard — try again", false);
        setFb("I didn't hear anything. Tap the mic again.", "bad");
      } else if (err === "not-allowed" || err === "service-not-allowed") {
        setMicHint("Microphone blocked", false);
        setFb("Please allow the microphone, then try again.", "bad");
      } else if (err === "aborted") {
        setMicHint("Tap the mic and speak", false);
      } else {
        setMicHint("Tap the mic and speak", false);
        setFb("Couldn't hear clearly — try again.", "bad");
      }
    };

    recognition.onend = function () {
      listening = false;
      const btn = $("micBtn");
      if (btn) btn.classList.remove("is-listening");
      if (!locked) {
        if ($("micHint") && $("micHint").textContent.indexOf("Listening") === 0) {
          setMicHint("Tap the mic and speak", false);
        }
      }
    };
  }

  function evaluate(transcript) {
    if (locked) return;
    const item = items[order[idx]];
    locked = true;
    stopListening();
    attempts++;

    const ok = matchesAnswer(transcript, item);
    setHeard(norm(transcript) || "—");

    if (ok) {
      correct++;
      score += level === "sentences" ? 150 : 100;
      setFb("Correct!", "ok");
      setMicHint("Great!", false);
      if ($("scoreText")) $("scoreText").textContent = String(score);
      if ($("correctText")) $("correctText").textContent = String(correct);
      speakItem(item);
      setTimeout(() => {
        idx++;
        if (idx >= order.length) finish();
        else render();
      }, 1200);
    } else {
      setFb("Not quite — try again or tap 🔊 to hear it", "bad");
      setMicHint("Tap the mic and try again", false);
      setTimeout(() => {
        locked = false;
        setFb("", "");
      }, 900);
    }
  }

  function render() {
    locked = false;
    stopListening();
    const item = items[order[idx]];
    if ($("sceneImg")) {
      $("sceneImg").src = item.img;
      $("sceneImg").decoding = "async";
      $("sceneImg").alt = item.id;
    }
    if ($("promptText")) {
      $("promptText").textContent =
        level === "sentences"
          ? item.prompt || "What is it?"
          : "Say the color!";
    }
    if ($("promptCue")) {
      $("promptCue").textContent =
        level === "sentences" ? item.cue || "" : "";
    }
    setHeard("—");
    setFb("", "");
    setMicHint(
      SpeechRecognition ? "Tap the mic and speak" : "Speech not supported — use Skip",
      false
    );
    if ($("itemText")) $("itemText").textContent = idx + 1 + " / " + order.length;
    if ($("scoreText")) $("scoreText").textContent = String(score);
    if ($("correctText")) $("correctText").textContent = String(correct);
  }

  function skip() {
    if (locked) return;
    locked = true;
    stopListening();
    attempts++;
    setFb("Skipped", "");
    setTimeout(() => {
      idx++;
      if (idx >= order.length) finish();
      else render();
    }, 500);
  }

  function finish() {
    stopListening();
    const acc = attempts ? Math.round((correct / attempts) * 100) : 0;
    if ($("finalScore")) $("finalScore").textContent = String(score);
    if ($("finalAccuracy")) $("finalAccuracy").textContent = acc + "%";
    if ($("finalWords")) $("finalWords").textContent = String(order.length);
    if ($("endTitle"))
      $("endTitle").textContent =
        acc === 100 ? "Perfect!" : acc >= 70 ? "Great job!" : "Good practice!";
    if ($("endSummary")) {
      const levelLabel = level === "sentences" ? "sentences" : "colors";
      $("endSummary").textContent =
        correct + " of " + order.length + " " + levelLabel + " correct.";
    }
    try {
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, acc);
        LAStars.apply($("endScreen"));
      }
    } catch (e) {}
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
    const endEl = $("endScreen");
    if (endEl) {
      endEl.querySelectorAll(".star").forEach((el) => {
        const n = Number(el.getAttribute("data-n") || 0);
        el.classList.toggle("is-filled", n <= stars);
        el.textContent = n <= stars ? "★" : "☆";
      });
    }
    show("end");
  }

  function start() {
    items = level === "sentences" ? SENTENCE_ITEMS : WORD_ITEMS;
    order = shuffle(items.map((_, i) => i));
    idx = 0;
    score = 0;
    correct = 0;
    attempts = 0;
    show("game");
    render();
  }

  function selectLevel(next) {
    level = next === "sentences" ? "sentences" : "words";
    document.querySelectorAll(".level-tab").forEach((tab) => {
      const on = tab.getAttribute("data-level") === level;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  // Init
  setupRecognition();

  const startBtn = $("startBtn");
  const playAgainBtn = $("playAgainBtn");
  const micBtn = $("micBtn");
  const playAudioBtn = $("playAudioBtn");
  const skipBtn = $("skipBtn");
  const levelTabs = $("levelTabs");

  if (startBtn) startBtn.addEventListener("click", start);
  if (playAgainBtn) playAgainBtn.addEventListener("click", () => show("start"));
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (locked) return;
      if (listening) {
        stopListening();
        setMicHint("Tap the mic and speak", false);
      } else {
        startListening();
      }
    });
  }
  if (playAudioBtn) {
    playAudioBtn.addEventListener("click", () => {
      if (order.length && order[idx] != null) speakItem(items[order[idx]]);
    });
  }
  if (skipBtn) skipBtn.addEventListener("click", skip);

  if (levelTabs) {
    levelTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".level-tab");
      if (!tab) return;
      selectLevel(tab.getAttribute("data-level"));
    });
  }
})();
