/* Credit Card Application Form – 2-part game – AEF Starter Unit 2B */
(function () {
  const GAME_ID = "starter-2b-credit-card-form";

  // Questions ordered by form numbers 1–8
  const QUESTIONS = [
    {
      id: 1,
      q: "What's your name?",
      field: "name",
      hint: "Write a full sentence.",
      model: function (d) {
        const n = (d.firstName + " " + d.lastName).trim();
        return n ? "My name's " + n + "." : "My name's …";
      },
      check: function (val, d) {
        const n = (d.firstName + " " + d.lastName).trim().toLowerCase();
        const v = val.toLowerCase();
        return n && (v.indexOf(d.firstName.toLowerCase()) !== -1 || v.indexOf("my name") !== -1);
      }
    },
    {
      id: 2,
      q: "How old are you?",
      field: "age",
      hint: "Write a full sentence.",
      model: function (d) { return d.age ? "I'm " + d.age + "." : "I'm …"; },
      check: function (val, d) {
        const v = val.toLowerCase();
        return d.age && (v.indexOf(String(d.age)) !== -1);
      }
    },
    {
      id: 3,
      q: "Are you married?",
      field: "status",
      hint: "Write a full sentence (Yes / No).",
      model: function (d) {
        if (d.status === "married") return "Yes, I am.";
        if (d.status === "single") return "No, I'm single.";
        if (d.status === "divorced") return "No, I'm divorced / separated.";
        return "Yes, I am. / No, I'm single.";
      },
      check: function (val, d) {
        const v = val.toLowerCase();
        if (d.status === "married") return v.indexOf("yes") !== -1 || v.indexOf("married") !== -1;
        if (d.status === "single") return v.indexOf("single") !== -1 || (v.indexOf("no") !== -1 && v.indexOf("married") === -1);
        if (d.status === "divorced") return v.indexOf("divorced") !== -1 || v.indexOf("separated") !== -1 || v.indexOf("no") !== -1;
        return v.length > 2;
      }
    },
    {
      id: 4,
      q: "What's your address?",
      field: "address",
      hint: "You can start with \"It's\" or \"My address is\".",
      model: function (d) { return d.address ? "It's " + d.address + "." : "It's …"; },
      check: function (val, d) {
        const v = val.toLowerCase();
        return d.address && v.indexOf(d.address.toLowerCase().slice(0, 6)) !== -1;
      }
    },
    {
      id: 5,
      q: "What's your zip code?",
      field: "zip",
      hint: "Start with \"It's\".",
      model: function (d) { return d.zip ? "It's " + d.zip + "." : "It's …"; },
      check: function (val, d) {
        const v = val.toLowerCase().replace(/\s/g, "");
        return d.zip && v.indexOf(String(d.zip).toLowerCase()) !== -1 && v.indexOf("it") !== -1;
      }
    },
    {
      id: 6,
      q: "What's your email?",
      field: "email",
      hint: "Start with \"It's\".",
      model: function (d) { return d.email ? "It's " + d.email + "." : "It's …"; },
      check: function (val, d) {
        const v = val.toLowerCase().replace(/\s/g, "");
        return d.email && v.indexOf(d.email.toLowerCase().split("@")[0]) !== -1 && v.indexOf("it") !== -1;
      }
    },
    {
      id: 7,
      q: "What's your home phone number?",
      field: "home",
      hint: "Start with \"It's\".",
      model: function (d) { return d.home ? "It's " + d.home + "." : "It's …"; },
      check: function (val, d) {
        const digits = String(val).replace(/\D/g, "");
        const homeDigits = String(d.home || "").replace(/\D/g, "");
        const v = val.toLowerCase();
        return homeDigits && digits.indexOf(homeDigits.slice(0, 6)) !== -1 && v.indexOf("it") !== -1;
      }
    },
    {
      id: 8,
      q: "What's your cell phone number?",
      field: "cell",
      hint: "Start with \"It's\".",
      model: function (d) { return d.cell ? "It's " + d.cell + "." : "It's …"; },
      check: function (val, d) {
        const digits = String(val).replace(/\D/g, "");
        const cellDigits = String(d.cell || "").replace(/\D/g, "");
        const v = val.toLowerCase();
        return cellDigits && digits.indexOf(cellDigits.slice(0, 6)) !== -1 && v.indexOf("it") !== -1;
      }
    }
  ];

  const app = document.getElementById("game-app");
  if (!app) return;

  let phase = "menu"; // menu | form | questions | done
  let qIndex = 0;
  let score = 0;
  let data = {
    firstName: "", lastName: "", title: "",
    age: "", status: "",
    address: "", zip: "", email: "",
    home: "", cell: ""
  };
  let answers = {}; // qIndex -> user answer string

  function calcStars() {
    const r = score / QUESTIONS.length;
    if (r >= 1) return 3;
    if (r >= 0.75) return 2;
    if (r >= 0.5) return 1;
    return 0;
  }

  function saveStars(n) {
    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.save(GAME_ID, n);
    }
    return n;
  }

  function readForm() {
    data.firstName = (document.getElementById("f-first") || {}).value || "";
    data.lastName = (document.getElementById("f-last") || {}).value || "";
    const titleEl = document.querySelector('input[name="f-title"]:checked');
    data.title = titleEl ? titleEl.value : "";
    data.age = (document.getElementById("f-age") || {}).value || "";
    const statusEl = document.querySelector('input[name="f-status"]:checked');
    data.status = statusEl ? statusEl.value : "";
    data.address = (document.getElementById("f-address") || {}).value || "";
    data.zip = (document.getElementById("f-zip") || {}).value || "";
    data.email = (document.getElementById("f-email") || {}).value || "";
    data.home = (document.getElementById("f-home") || {}).value || "";
    data.cell = (document.getElementById("f-cell") || {}).value || "";
  }

  function formValid() {
    return data.firstName.trim() && data.lastName.trim() && data.age.trim() &&
      data.status && data.address.trim() && data.zip.trim() &&
      data.email.trim() && data.home.trim() && data.cell.trim();
  }

  function render() {
    if (phase === "menu") {
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Credit Card Form</span>' +
        '<span class="cc-badge">2B</span>' +
        "</header>" +
        '<section class="cc-menu">' +
        "<h1>Credit card application</h1>" +
        '<p class="cc-lead"><strong>Part 1:</strong> Complete the form.<br/><strong>Part 2:</strong> Answer the questions in full sentences.</p>' +
        '<div class="cc-start-card">' +
        "<p>2 parts · form + questions</p>" +
        '<button type="button" class="cc-btn" id="cc-start">Start</button>' +
        "</div>" +
        "</section>";
      document.getElementById("cc-start").onclick = function () {
        phase = "form";
        render();
      };
      return;
    }

    if (phase === "form") {
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Part 1 · Form</span>' +
        '<span class="cc-badge">2B</span>' +
        "</header>" +
        '<div class="cc-form-wrap">' +
        '<div class="cc-form-card">' +
        '<div class="cc-form-header">CREDIT CARD Application form</div>' +

        '<div class="cc-field">' +
        '<span class="cc-num">1</span>' +
        '<div class="cc-field-body">' +
        '<label>First name</label>' +
        '<input type="text" id="f-first" class="cc-input" autocomplete="off" value="' + esc(data.firstName) + '" />' +
        '<label>Last name</label>' +
        '<input type="text" id="f-last" class="cc-input" autocomplete="off" value="' + esc(data.lastName) + '" />' +
        '<div class="cc-title-row">Title: ' +
        '<label class="cc-check"><input type="radio" name="f-title" value="Mr"' + (data.title === "Mr" ? " checked" : "") + ' /> Mr.</label> ' +
        '<label class="cc-check"><input type="radio" name="f-title" value="Ms"' + (data.title === "Ms" ? " checked" : "") + ' /> Ms.</label> ' +
        '<label class="cc-check"><input type="radio" name="f-title" value="Mrs"' + (data.title === "Mrs" ? " checked" : "") + ' /> Mrs.</label>' +
        "</div></div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">2</span>' +
        '<div class="cc-field-body">' +
        '<label>Age</label>' +
        '<input type="text" id="f-age" class="cc-input short" inputmode="numeric" autocomplete="off" value="' + esc(data.age) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">3</span>' +
        '<div class="cc-field-body">' +
        '<div class="cc-title-row">' +
        '<label class="cc-check"><input type="radio" name="f-status" value="married"' + (data.status === "married" ? " checked" : "") + ' /> Married</label> ' +
        '<label class="cc-check"><input type="radio" name="f-status" value="single"' + (data.status === "single" ? " checked" : "") + ' /> Single</label> ' +
        '<label class="cc-check"><input type="radio" name="f-status" value="divorced"' + (data.status === "divorced" ? " checked" : "") + ' /> Divorced / Separated</label>' +
        "</div></div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">4</span>' +
        '<div class="cc-field-body">' +
        '<label>Address</label>' +
        '<input type="text" id="f-address" class="cc-input" autocomplete="off" value="' + esc(data.address) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">5</span>' +
        '<div class="cc-field-body">' +
        '<label>Zip code</label>' +
        '<input type="text" id="f-zip" class="cc-input short" autocomplete="off" value="' + esc(data.zip) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">6</span>' +
        '<div class="cc-field-body">' +
        '<label>Email</label>' +
        '<input type="text" id="f-email" class="cc-input" autocomplete="off" value="' + esc(data.email) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">7</span>' +
        '<div class="cc-field-body">' +
        '<label>Phone number — home</label>' +
        '<input type="text" id="f-home" class="cc-input" inputmode="tel" autocomplete="off" value="' + esc(data.home) + '" />' +
        "</div></div>" +

        '<div class="cc-field">' +
        '<span class="cc-num">8</span>' +
        '<div class="cc-field-body">' +
        '<label>Cell phone</label>' +
        '<input type="text" id="f-cell" class="cc-input" inputmode="tel" autocomplete="off" value="' + esc(data.cell) + '" />' +
        "</div></div>" +

        "</div>" +
        '<p class="cc-form-msg" id="cc-form-msg"></p>' +
        '<button type="button" class="cc-btn" id="cc-to-q">Continue to questions →</button>' +
        "</div>";

      document.getElementById("cc-to-q").onclick = function () {
        readForm();
        if (!formValid()) {
          document.getElementById("cc-form-msg").textContent = "Please complete all fields.";
          document.getElementById("cc-form-msg").className = "cc-form-msg is-bad";
          return;
        }
        qIndex = 0;
        score = 0;
        answers = {};
        phase = "questions";
        render();
      };
      return;
    }

    if (phase === "questions") {
      const item = QUESTIONS[qIndex];
      const prev = answers[qIndex] || "";
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Part 2 · Questions</span>' +
        '<span class="cc-badge">' + (qIndex + 1) + "/" + QUESTIONS.length + "</span>" +
        "</header>" +
        '<div class="cc-progress"><span style="width:' + Math.round((qIndex / QUESTIONS.length) * 100) + '%"></span></div>' +
        '<div class="cc-q-stage">' +
        '<p class="cc-q-label">Question ' + item.id + "</p>" +
        '<p class="cc-q-text">' + item.q + "</p>" +
        '<p class="cc-q-hint">' + item.hint + "</p>" +
        '<textarea class="cc-answer" id="cc-answer" rows="2" placeholder="Write your answer…">' + esc(prev) + "</textarea>" +
        '<p class="cc-feedback" id="cc-feedback"></p>' +
        '<div class="cc-actions">' +
        '<button type="button" class="cc-btn secondary" id="cc-show">Show model</button>' +
        '<button type="button" class="cc-btn" id="cc-check">Check</button>' +
        "</div>" +
        "</div>";

      const ta = document.getElementById("cc-answer");
      setTimeout(function () { ta.focus(); }, 80);

      document.getElementById("cc-show").onclick = function () {
        document.getElementById("cc-feedback").textContent = "Model: " + item.model(data);
        document.getElementById("cc-feedback").className = "cc-feedback is-hint";
      };

      document.getElementById("cc-check").onclick = function () {
        const val = ta.value.trim();
        answers[qIndex] = val;
        const feedback = document.getElementById("cc-feedback");
        if (!val) {
          feedback.textContent = "Write a sentence.";
          feedback.className = "cc-feedback is-bad";
          return;
        }
        const ok = item.check(val, data);
        if (ok) {
          score += 1;
          feedback.textContent = "Good!";
          feedback.className = "cc-feedback is-ok";
          ta.classList.add("is-ok");
        } else {
          feedback.textContent = "Check again. Model: " + item.model(data);
          feedback.className = "cc-feedback is-bad";
          ta.classList.add("is-bad");
        }
        setTimeout(function () {
          qIndex += 1;
          if (qIndex >= QUESTIONS.length) {
            phase = "done";
          }
          render();
        }, ok ? 700 : 1400);
      };
      return;
    }

    if (phase === "done") {
      const stars = saveStars(calcStars());
      let review = "";
      QUESTIONS.forEach(function (item, i) {
        review +=
          '<div class="cc-review-item">' +
          "<strong>" + item.id + ". " + item.q + "</strong><br/>" +
          '<span class="cc-your">You: ' + (answers[i] || "—") + "</span><br/>" +
          '<span class="cc-model">Model: ' + item.model(data) + "</span>" +
          "</div>";
      });
      app.innerHTML =
        '<header class="cc-topbar">' +
        '<a class="cc-back" href="../" aria-label="Back">←</a>' +
        '<span class="cc-title">Credit Card Form</span>' +
        '<span class="cc-badge">Done</span>' +
        "</header>" +
        '<section class="cc-done">' +
        '<div class="trophy-scene" aria-hidden="true"><div class="orbit-system">' +
        '<div class="trophy-float">🏆</div>' +
        '<div class="star-orbit"><span class="star' + (stars >= 1 ? " filled" : "") + '">★</span></div>' +
        '<div class="star-orbit"><span class="star' + (stars >= 2 ? " filled" : "") + '">★</span></div>' +
        '<div class="star-orbit"><span class="star' + (stars >= 3 ? " filled" : "") + '">★</span></div>' +
        "</div></div>" +
        "<h1>" + (stars === 3 ? "Perfect!" : stars >= 1 ? "Great job!" : "Keep practicing!") + "</h1>" +
        "<p>You got <strong>" + score + " / " + QUESTIONS.length + "</strong> answers accepted.</p>" +
        '<div class="cc-review">' + review + "</div>" +
        '<button type="button" class="cc-btn" id="cc-again">Play again</button>' +
        "</section>";
      document.getElementById("cc-again").onclick = function () {
        phase = "menu";
        qIndex = 0;
        score = 0;
        answers = {};
        render();
      };
    }
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  render();
})();
