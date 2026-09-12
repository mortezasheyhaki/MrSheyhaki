/* Hotel Role-Play · Speak or type with the receptionist · Starter PE1 */
(function () {
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
    stopListening();
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
    } catch (_) {}
    saveStars(3);
    app.innerHTML = `
      <header class="hr-topbar">
        <a class="hr-back" href="../" aria-label="Back">←</a>
        <span class="hr-title">Checked in!</span>
        <span class="hr-badge">✓</span>
      </header>
      <section class="hr-done">
        <img class="hr-done-img" src="${IMG.key}" alt="Your key" draggable="false">
        <div class="hr-stars">⭐ ⭐ ⭐</div>
        <h1>Well done, ${escapeHtml(title)}. ${escapeHtml(lastName)}!</h1>
        <p>You're in room <strong>${ROOM}</strong>.<br>
        Great job with the hotel check-in.</p>
        <button type="button" class="hr-btn primary" id="hr-again">Play again</button>
        <button type="button" class="hr-btn secondary" id="hr-home">Back to games</button>
      </section>`;
    document.getElementById("hr-again").onclick = showStart;
    document.getElementById("hr-home").onclick = () => {
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
