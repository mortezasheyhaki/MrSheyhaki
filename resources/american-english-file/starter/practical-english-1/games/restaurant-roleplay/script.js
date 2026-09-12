/* Restaurant Role-Play · Book a table · flexible day / people / time · PE1 */
(function () {
  const GAME_ID = "starter-pe1-restaurant-roleplay";

  const IMG = {
    greet: "images/waiter-greet.png",
    confirm: "images/waiter-confirm.png",
    ask: "images/waiter-ask.png",
    write: "images/waiter-write.png",
    thanks: "images/waiter-thanks.png",
    bye: "images/waiter-bye.png",
  };

  const DAYS = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "tomorrow", "today",
  ];
  const DAY_LABEL = {
    monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
    thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
    tomorrow: "tomorrow", today: "today",
  };

  const NUM_WORDS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
    nine: 9, ten: 10, eleven: 11, twelve: 12,
  };
  const NUM_TO_WORD = {
    1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
    7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve",
  };

  const TIME_WORDS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
    nine: 9, ten: 10, eleven: 11, twelve: 12,
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
  let title = "Ms";
  let step = 0;
  let audioBusy = false;
  let recog = null;
  let listening = false;

  // Booking choices filled during the dialogue
  let booking = { day: "tomorrow", people: 2, time: 7 };

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
    if (!n) return "Ms";
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

  function parseDay(text) {
    const t = String(text || "").toLowerCase();
    for (const d of DAYS) {
      if (t.includes(d)) return d;
    }
    return null;
  }

  function parsePeople(text) {
    const t = String(text || "").toLowerCase().trim();
    const digit = t.match(/\b([1-9]|1[0-2])\b/);
    if (digit) return parseInt(digit[1], 10);
    for (const [word, n] of Object.entries(NUM_WORDS)) {
      if (new RegExp("\\b" + word + "\\b").test(t)) return n;
    }
    return null;
  }

  function parseTime(text) {
    const t = String(text || "").toLowerCase().trim();
    // 7:00, 7.00, 7 o'clock, at 7
    const colon = t.match(/\b([1-9]|1[0-2])\s*[:.]\s*\d{0,2}\b/);
    if (colon) return parseInt(colon[1], 10);
    const digit = t.match(/\b([1-9]|1[0-2])\b/);
    if (digit) return parseInt(digit[1], 10);
    for (const [word, n] of Object.entries(TIME_WORDS)) {
      if (new RegExp("\\b" + word + "\\b").test(t)) return n;
    }
    return null;
  }

  // Pull a person's name from free speech/typing
  function parseName(text) {
    let t = String(text || "").trim();
    if (!t) return null;
    t = t
      .replace(/^(?:my name(?:'s|\s+is)|i(?:'m|\s+am)|this is|it'?s)\s+/i, "")
      .replace(/[.,!?]+$/g, "")
      .trim();
    const parts = t.split(/\s+/).filter(Boolean);
    if (!parts.length) return null;
    const cap = (w) =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    if (parts.length === 1) {
      return { first: cap(parts[0]), last: cap(parts[0]) };
    }
    return {
      first: cap(parts[0]),
      last: cap(parts[parts.length - 1]),
    };
  }

  function dayLabel(d) {
    return DAY_LABEL[d] || d;
  }

  function peopleLabel(n) {
    return NUM_TO_WORD[n] || String(n);
  }

  function timeLabel(n) {
    const w = NUM_TO_WORD[n] || String(n);
    return w.charAt(0).toUpperCase() + w.slice(1) + " o'clock";
  }

  function buildSteps() {
    const surname = lastName || "Zielinski";
    const spell = surname.toUpperCase().split("").join(" ");
    const dLab = dayLabel(booking.day);
    const pLab = peopleLabel(booking.people);
    const tLab = timeLabel(booking.time);

    return [
      {
        id: "waiter_open",
        who: "waiter",
        say: "Locanda Verde, good morning. How can I help you?",
        img: IMG.greet,
      },
      {
        id: "table",
        who: "you",
        prompt: "Ask for a table. Choose any day (e.g. tomorrow, Friday…).",
        hint: 'Example: "Hello, a table for Friday, please."',
        // Accept any table request that includes a day, or generic "table for … please"
        check: function (text) {
          const day = parseDay(text);
          if (day) {
            booking.day = day;
            return true;
          }
          // still allow generic "a table … please" and keep default day
          if (/table/i.test(text) && /please/i.test(text)) return true;
          if (/table for/i.test(text)) return true;
          return false;
        },
        sample: "Hello, a table for tomorrow, please.",
        img: IMG.greet,
      },
      {
        id: "waiter_day",
        who: "waiter",
        // Dynamic line uses whatever day the player chose
        sayFn: function () {
          const d = dayLabel(booking.day);
          if (booking.day === "tomorrow" || booking.day === "today") {
            return d.charAt(0).toUpperCase() + d.slice(1) + ".";
          }
          return d + ".";
        },
        img: IMG.confirm,
      },
      {
        id: "yes",
        who: "you",
        prompt: "Confirm the day.",
        hint: 'Say or type: "Yes, that\'s right."',
        accept: [/yes/i, /that'?s right/i, /correct/i, /ok\b/i],
        sample: "Yes, that's right.",
        img: IMG.confirm,
      },
      {
        id: "waiter_people",
        who: "waiter",
        say: "How many people?",
        img: IMG.ask,
      },
      {
        id: "people",
        who: "you",
        prompt: "Say how many people (1–12).",
        hint: 'Example: "Four." or "4 people."',
        check: function (text) {
          const n = parsePeople(text);
          if (n != null) {
            booking.people = n;
            return true;
          }
          return false;
        },
        sample: "Three.",
        img: IMG.ask,
      },
      {
        id: "waiter_time",
        who: "waiter",
        say: "What time?",
        img: IMG.ask,
      },
      {
        id: "time",
        who: "you",
        prompt: "Say the time (1–12 o'clock).",
        hint: 'Example: "Eight o\'clock." or "8."',
        check: function (text) {
          const n = parseTime(text);
          if (n != null) {
            booking.time = n;
            return true;
          }
          return false;
        },
        sample: "Seven o'clock.",
        img: IMG.ask,
      },
      {
        id: "waiter_name",
        who: "waiter",
        say: "What's your name, please?",
        img: IMG.write,
      },
      {
        id: "name",
        who: "you",
        prompt: "Say your full name (any name).",
        hint: "Example: My name's Rob Walker. or Sarah Kim.",
        check: function (text) {
          const parsed = parseName(text);
          if (!parsed) return false;
          firstName = parsed.first;
          lastName = parsed.last;
          title = detectTitle(firstName);
          return true;
        },
        sample: "Jenny Zielinski.",
        img: IMG.write,
      },
      {
        id: "spell",
        who: "you",
        prompt: "Spell your surname.",
        hintFn: function () {
          const s = (lastName || "Zielinski").toUpperCase().split("").join(" ");
          return 'Say or type the letters: "' + s + '"';
        },
        check: function (text) {
          const re = makeSpellPattern(lastName || "Zielinski");
          return re.test(text);
        },
        sampleFn: function () {
          return (lastName || "Zielinski").toUpperCase().split("").join(" ");
        },
        isSpell: true,
        img: IMG.write,
      },
      {
        id: "waiter_confirm",
        who: "waiter",
        sayFn: function () {
          const tn = title || "Ms";
          const ln = lastName || "Guest";
          return (
            "Thank you, " +
            tn +
            ". " +
            ln +
            ". OK, so a table for " +
            peopleLabel(booking.people) +
            " on " +
            dayLabel(booking.day) +
            " at " +
            (NUM_TO_WORD[booking.time] || booking.time) +
            "."
          );
        },
        img: IMG.thanks,
      },
      {
        id: "bye",
        who: "you",
        prompt: "Thank them and say goodbye.",
        hint: 'Say or type: "Great, thanks. Bye."',
        accept: [/thanks/i, /thank you/i, /great/i, /bye/i],
        sample: "Great, thanks. Bye.",
        img: IMG.thanks,
      },
      {
        id: "waiter_bye",
        who: "waiter",
        sayFn: function () {
          if (booking.day === "today") return "Bye. See you later!";
          if (booking.day === "tomorrow") return "Bye. See you tomorrow!";
          return "Bye. See you on " + dayLabel(booking.day) + "!";
        },
        img: IMG.bye,
      },
    ];
  }

  function stopListening() {
    listening = false;
    try {
      if (recog) recog.abort();
    } catch (_) {}
    const mic = document.getElementById("rr-mic");
    if (mic) mic.classList.remove("on");
  }

  function speak(text, onDone) {
    audioBusy = true;
    const bubble = document.getElementById("rr-bubble");
    if (bubble) {
      bubble.classList.add("talking");
      bubble.textContent = text;
    }
    if (!canSpeak) {
      setTimeout(() => {
        audioBusy = false;
        if (bubble) bubble.classList.remove("talking");
        if (onDone) onDone();
      }, Math.max(900, text.length * 42));
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.92;
    u.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices() || [];
    const pick =
      voices.find(
        (v) =>
          /en(-|_)US/i.test(v.lang) &&
          /male|david|mark|google us english/i.test(v.name)
      ) ||
      voices.find((v) => /en(-|_)US/i.test(v.lang)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (pick) u.voice = pick;
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
    const mic = document.getElementById("rr-mic");
    if (mic) mic.classList.add("on");

    recog.onresult = (ev) => {
      const alts = [];
      for (let i = 0; i < ev.results[0].length; i++) {
        alts.push(ev.results[0][i].transcript);
      }
      stopListening();
      if (onResult) onResult(alts[0] || "", alts);
    };
    recog.onerror = () => stopListening();
    recog.onend = () => {
      listening = false;
      const m = document.getElementById("rr-mic");
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
    if (typeof stepObj.check === "function") return stepObj.check(t);
    if (stepObj.accept) return stepObj.accept.some((re) => re.test(t));
    return false;
  }

  function waiterLine(s) {
    if (typeof s.sayFn === "function") return s.sayFn();
    return s.say || "";
  }

  function avatarHtml(src, talking) {
    return `<div class="rr-avatar-wrap ${talking ? "talking" : ""}">
      <img class="rr-avatar-img" src="${src}" alt="Waiter"
        onerror="this.style.display='none'; this.parentNode.classList.add('rr-avatar-fallback'); this.parentNode.setAttribute('data-emoji','🧑‍🍳');">
    </div>`;
  }

  function showStart() {
    stopListening();
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch (_) {}
    step = 0;
    booking = { day: "tomorrow", people: 2, time: 7 };
    app.innerHTML = `
      <header class="rr-topbar">
        <a class="rr-back" href="../" aria-label="Back">←</a>
        <span class="rr-title">Restaurant Role-Play</span>
        <span class="rr-badge">PE1</span>
      </header>
      <section class="rr-start">
        <div class="rr-hero rr-enter" style="--i:0">
          <div class="rr-hero-emoji">🍽️</div>
          <h1>Book a Table</h1>
          <p>Role-play at <strong>Locanda Verde</strong>.<br>
          Choose any day, number of people, and time.</p>
        </div>
        <div class="rr-name-form rr-enter" style="--i:1">
          <label class="rr-field">
            <span>First name</span>
            <input type="text" id="rr-first" autocomplete="given-name" placeholder="e.g. Jenny" maxlength="24">
          </label>
          <label class="rr-field">
            <span>Surname</span>
            <input type="text" id="rr-last" autocomplete="family-name" placeholder="e.g. Zielinski" maxlength="24">
          </label>
          <p class="rr-name-note">Optional — you can also say any name during the dialogue.</p>
        </div>
        <div class="rr-caps rr-enter" style="--i:2">
          ${canListen ? '<span class="rr-cap ok">🎤 Voice</span>' : '<span class="rr-cap no">🎤 Voice unavailable</span>'}
          ${canSpeak ? '<span class="rr-cap ok">🔊 Waiter voice</span>' : '<span class="rr-cap no">🔊 TTS unavailable</span>'}
          <span class="rr-cap ok">⌨️ Typing OK</span>
        </div>
        <button type="button" class="rr-btn primary rr-enter" style="--i:3" id="rr-go">Start role-play</button>
      </section>`;

    document.getElementById("rr-go").onclick = () => {
      const f = (document.getElementById("rr-first").value || "").trim();
      const l = (document.getElementById("rr-last").value || "").trim();
      firstName = f
        ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()
        : "";
      lastName = l
        ? l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()
        : "";
      title = firstName ? detectTitle(firstName) : "Ms";
      step = 0;
      booking = { day: "tomorrow", people: 2, time: 7 };
      renderPlay();
    };
  }

  function renderPlay() {
    stopListening();
    const steps = buildSteps();

    if (step >= steps.length) {
      showDone();
      return;
    }

    const s = steps[step];
    const img = s.img || IMG.greet;

    if (s.who === "waiter") {
      const line = waiterLine(s);
      app.innerHTML = `
        <header class="rr-topbar">
          <a class="rr-back" href="#" id="rr-back" aria-label="Back">←</a>
          <span class="rr-title">Locanda Verde</span>
          <span class="rr-badge">${step + 1}/${steps.length}</span>
        </header>
        <div class="rr-stage">
          <div class="rr-waiter">
            ${avatarHtml(img, true)}
            <div class="rr-waiter-label">Waiter</div>
            <div class="rr-bubble talking" id="rr-bubble">${escapeHtml(line)}</div>
          </div>
          <div class="rr-progress">
            ${steps
              .map(
                (_, i) =>
                  `<span class="rr-dot ${i < step ? "done" : i === step ? "on" : ""}"></span>`
              )
              .join("")}
          </div>
        </div>`;
      document.getElementById("rr-back").onclick = (e) => {
        e.preventDefault();
        stopListening();
        try {
          window.speechSynthesis && window.speechSynthesis.cancel();
        } catch (_) {}
        showStart();
      };
      speak(line, () => {
        step++;
        setTimeout(renderPlay, 400);
      });
      return;
    }

    app.innerHTML = `
      <header class="rr-topbar">
        <a class="rr-back" href="#" id="rr-back" aria-label="Back">←</a>
        <span class="rr-title">Your turn</span>
        <span class="rr-badge">${step + 1}/${steps.length}</span>
      </header>
      <div class="rr-stage">
        <div class="rr-waiter quiet">
          ${avatarHtml(img, false)}
          <div class="rr-waiter-label">Your turn</div>
        </div>
        <div class="rr-prompt rr-enter" style="--i:0">
          <p class="rr-prompt-text">${escapeHtml(s.prompt)}</p>
          <p class="rr-hint">${escapeHtml(typeof s.hintFn === "function" ? s.hintFn() : s.hint)}</p>
        </div>
        <div class="rr-input-row rr-enter" style="--i:1">
          ${canListen ? `<button type="button" class="rr-mic" id="rr-mic" aria-label="Speak">🎤</button>` : ""}
          <input type="text" class="rr-text" id="rr-text" placeholder="Type your line…" autocomplete="off" autocorrect="off" spellcheck="false">
          <button type="button" class="rr-send" id="rr-send" aria-label="Send">→</button>
        </div>
        <div class="rr-feedback" id="rr-fb" hidden></div>
        <button type="button" class="rr-btn secondary rr-skip rr-enter" style="--i:2" id="rr-skip">Skip / show answer</button>
        <div class="rr-progress">
          ${steps
            .map(
              (_, i) =>
                `<span class="rr-dot ${i < step ? "done" : i === step ? "on" : ""}"></span>`
            )
            .join("")}
        </div>
      </div>`;

    document.getElementById("rr-back").onclick = (e) => {
      e.preventDefault();
      stopListening();
      try {
        window.speechSynthesis && window.speechSynthesis.cancel();
      } catch (_) {}
      showStart();
    };

    const input = document.getElementById("rr-text");
    const send = document.getElementById("rr-send");
    const mic = document.getElementById("rr-mic");
    const skip = document.getElementById("rr-skip");

    function tryAnswer(text) {
      const fb = document.getElementById("rr-fb");
      if (matches(text, s)) {
        if (fb) {
          fb.hidden = false;
          fb.className = "rr-feedback ok";
          fb.textContent = "Good!";
        }
        setTimeout(() => {
          step++;
          renderPlay();
        }, 700);
      } else {
        if (fb) {
          fb.hidden = false;
          fb.className = "rr-feedback bad";
          fb.textContent = "Try again — or use Skip.";
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
        if (s.id === "table") booking.day = booking.day || "tomorrow";
        if (s.id === "people") booking.people = booking.people || 3;
        if (s.id === "time") booking.time = booking.time || 7;
        if (s.id === "name") {
          firstName = firstName || "Jenny";
          lastName = lastName || "Zielinski";
          title = detectTitle(firstName);
        }
        const sample =
          typeof s.sampleFn === "function" ? s.sampleFn() : s.sample;
        if (input) input.value = sample || "";
        const fb = document.getElementById("rr-fb");
        if (fb) {
          fb.hidden = false;
          fb.className = "rr-feedback warn";
          fb.textContent = "Sample: " + (sample || "");
        }
        setTimeout(() => {
          step++;
          renderPlay();
        }, 1100);
      };
    }
  }

  function showDone() {
    stopListening();
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch (_) {}
    saveStars(3);
    app.innerHTML = `
      <header class="rr-topbar">
        <a class="rr-back" href="../" aria-label="Back">←</a>
        <span class="rr-title">Booked!</span>
        <span class="rr-badge">✓</span>
      </header>
      <section class="rr-done">
        <div class="rr-hero-emoji">🍽️</div>
        <div class="rr-stars">⭐ ⭐ ⭐</div>
        <h1>Table booked!</h1>
        <p>A table for <strong>${escapeHtml(peopleLabel(booking.people))}</strong>
        on <strong>${escapeHtml(dayLabel(booking.day))}</strong>
        at <strong>${escapeHtml(String(booking.time))}</strong><br>
        for ${escapeHtml(title)}. ${escapeHtml(lastName)}.</p>
        <button type="button" class="rr-btn primary" id="rr-again">Play again</button>
        <button type="button" class="rr-btn secondary" id="rr-home">Back to games</button>
      </section>`;
    document.getElementById("rr-again").onclick = showStart;
    document.getElementById("rr-home").onclick = () => {
      window.location.href = "../";
    };
  }

  if (canSpeak) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function () {
      window.speechSynthesis.getVoices();
    };
  }

  showStart();
})();
