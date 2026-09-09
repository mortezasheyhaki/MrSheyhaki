(function () {
  "use strict";

  const GAME_ID = "1-3a-write-their-routine";

  const ADAM_PARAS = [
    "Hi, I'm Adam. I usually get up at 7:00. I drink coffee and check my phone. Then I do housework in the morning because my apartment gets messy very quickly. After that, I drive a car to work. I work in an office, and I usually get there at about 9:00.",
    "In the afternoon, I'm usually busy. I have lunch with my coworkers, and sometimes we eat Japanese food. After lunch, I go back to work. When I finish, I sometimes take photos with my phone on the way home. I like taking pictures of interesting places in the city.",
    "In the evening, I usually relax at home. I watch the news and sometimes read a newspaper. On some days, I go to the gym after work. When I get home, I have dinner and listen to music. I usually go to bed around 11:00."
  ];

  const SARA_PARAS = [
    "Hey! I'm Sara. My mornings are usually pretty busy. I get up at 7:30, have breakfast, and drink coffee. Then I get ready for work. I live in a big city, so there's always a lot of traffic. I usually take the bus to work. I work in an office, too.",
    "In the afternoon, I usually have lunch with a friend. I sometimes eat Japanese food because I love sushi. After lunch, I go back to work. I also speak Spanish, so sometimes I talk to Spanish-speaking customers. When work finishes, I usually go home or meet a friend.",
    "In the evening, I like to take it easy. I sometimes do yoga at home. Then I make dinner and watch a British TV series. I really like TV, so I often watch two episodes! Before bed, I take photos with my phone, answer messages, and listen to music. I usually go to bed around 11:30."
  ];

  const ADAM_MODEL =
    "He usually gets up at 7:00. He drinks coffee and checks his phone. Then he does housework in the morning because his apartment gets messy very quickly. After that, he drives a car to work. He works in an office, and he usually gets there at about 9:00.\n\n" +
    "In the afternoon, he's usually busy. He has lunch with his coworkers, and sometimes they eat Japanese food. After lunch, he goes back to work. When he finishes, he sometimes takes photos with his phone on the way home. He likes taking pictures of interesting places in the city.\n\n" +
    "In the evening, he usually relaxes at home. He watches the news and sometimes reads a newspaper. On some days, he goes to the gym after work. When he gets home, he has dinner and listens to music. He usually goes to bed around 11:00.";

  const SARA_MODEL =
    "Her mornings are usually pretty busy. She gets up at 7:30, has breakfast, and drinks coffee. Then she gets ready for work. She lives in a big city, so there's always a lot of traffic. She usually takes the bus to work. She works in an office, too.\n\n" +
    "In the afternoon, she usually has lunch with a friend. She sometimes eats Japanese food because she loves sushi. After lunch, she goes back to work. She also speaks Spanish, so sometimes she talks to Spanish-speaking customers. When work finishes, she usually goes home or meets a friend.\n\n" +
    "In the evening, she likes to take it easy. She sometimes does yoga at home. Then she makes dinner and watches a British TV series. She really likes TV, so she often watches two episodes! Before bed, she takes photos with her phone, answers messages, and listens to music. She usually goes to bed around 11:30.";

  /* Key third-person checks (flexible scoring) */
  const ADAM_KEYS = [
    /he\s+usually\s+gets?\s+up/,
    /gets?\s+up\s+at\s+7/,
    /drinks?\s+coffee/,
    /checks?\s+(his\s+)?phone/,
    /does\s+housework/,
    /drives?\s+(a\s+car|to\s+work)/,
    /works?\s+in\s+an\s+office/,
    /gets?\s+there/,
    /has\s+lunch/,
    /eats?\s+japanese/,
    /goes\s+back\s+to\s+work/,
    /takes?\s+photos/,
    /likes?\s+taking/,
    /relax(es)?/,
    /watches?\s+(the\s+)?news/,
    /reads?\s+(a\s+)?newspaper/,
    /goes\s+to\s+the\s+gym/,
    /has\s+dinner/,
    /listens?\s+to\s+music/,
    /goes\s+to\s+bed/
  ];

  const SARA_KEYS = [
    /gets?\s+up\s+at\s+7\s*[:.]?\s*30/,
    /has\s+breakfast/,
    /drinks?\s+coffee/,
    /lives?\s+in\s+a\s+big\s+city/,
    /takes?\s+the\s+bus/,
    /works?\s+in\s+an\s+office/,
    /has\s+lunch/,
    /eats?\s+japanese/,
    /goes\s+back\s+to\s+work/,
    /speaks?\s+spanish/,
    /talks?\s+to/,
    /goes\s+home|meets?\s+a\s+friend/,
    /does\s+yoga/,
    /makes?\s+dinner/,
    /watches?\s+(a\s+)?british/,
    /likes?\s+tv/,
    /watches?\s+two\s+episodes/,
    /takes?\s+photos/,
    /answers?\s+messages/,
    /listens?\s+to\s+music/,
    /goes\s+to\s+bed/
  ];

  let step = 0;
  let adamScore = null;
  let saraScore = null;

  const panels = [
    document.getElementById("step0"),
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3")
  ];
  const doneBox = document.getElementById("done");
  const stepBtns = document.querySelectorAll(".step");

  function fillReading(el, paras) {
    el.innerHTML = paras.map(function (p) {
      return "<p>" + p + "</p>";
    }).join("");
  }

  fillReading(document.getElementById("adamText"), ADAM_PARAS);
  fillReading(document.getElementById("saraText"), SARA_PARAS);
  document.getElementById("adamRef").innerHTML = ADAM_PARAS.map(function (p) {
    return "<p>" + p + "</p>";
  }).join("");
  document.getElementById("saraRef").innerHTML = SARA_PARAS.map(function (p) {
    return "<p>" + p + "</p>";
  }).join("");
  document.getElementById("adamModelText").textContent = ADAM_MODEL;
  document.getElementById("saraModelText").textContent = SARA_MODEL;

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreText(text, keys, pronoun) {
    const n = normalize(text);
    if (!n) return { hits: 0, total: keys.length, pct: 0, hasPronoun: false };
    let hits = 0;
    keys.forEach(function (re) {
      if (re.test(n)) hits++;
    });
    const hasPronoun = new RegExp("\\b" + pronoun + "\\b").test(n);
    // Bonus if they avoided "I " as subject heavily — soft check
    const iCount = (n.match(/\bi\b/g) || []).length;
    const pronounCount = (n.match(new RegExp("\\b" + pronoun + "\\b", "g")) || []).length;
    if (hasPronoun && pronounCount >= 3) hits = Math.min(keys.length, hits + 1);
    if (iCount > pronounCount && pronounCount < 2) hits = Math.max(0, hits - 2);
    const pct = Math.round((hits / keys.length) * 100);
    return { hits: hits, total: keys.length, pct: pct, hasPronoun: hasPronoun };
  }

  function starsFromPct(pct) {
    return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  }

  function renderStars(el, n) {
    if (!el) return;
    el.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("span");
      s.className = "star" + (i <= n ? " filled" : "");
      s.textContent = i <= n ? "★" : "☆";
      s.style.animationDelay = (i - 1) * 0.15 + "s";
      el.appendChild(s);
    }
  }

  function goTo(n) {
    step = n;
    panels.forEach(function (p, i) {
      p.classList.toggle("hidden", i !== n);
    });
    doneBox.classList.add("hidden");
    stepBtns.forEach(function (btn) {
      const s = Number(btn.dataset.step);
      btn.classList.toggle("active", s === n);
      btn.classList.toggle("done", s < n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function checkAdam() {
    const val = document.getElementById("adamInput").value;
    const fb = document.getElementById("adamFeedback");
    const model = document.getElementById("adamModel");
    if (!normalize(val)) {
      fb.className = "feedback info";
      fb.textContent = "Write about Adam using he…";
      return;
    }
    const res = scoreText(val, ADAM_KEYS, "he");
    adamScore = res;
    fb.className = "feedback " + (res.pct >= 40 ? "success" : "error");
    fb.innerHTML =
      "You included about <span class=\"score-pill\">" +
      res.hits +
      " / " +
      res.total +
      "</span> key ideas in the third person." +
      (res.hasPronoun ? "" : " Remember to use <strong>he</strong>.");
    model.classList.remove("hidden");
  }

  function checkSara() {
    const val = document.getElementById("saraInput").value;
    const fb = document.getElementById("saraFeedback");
    const model = document.getElementById("saraModel");
    if (!normalize(val)) {
      fb.className = "feedback info";
      fb.textContent = "Write about Sara using she…";
      return;
    }
    const res = scoreText(val, SARA_KEYS, "she");
    saraScore = res;
    fb.className = "feedback " + (res.pct >= 40 ? "success" : "error");
    fb.innerHTML =
      "You included about <span class=\"score-pill\">" +
      res.hits +
      " / " +
      res.total +
      "</span> key ideas in the third person." +
      (res.hasPronoun ? "" : " Remember to use <strong>she</strong>.");
    model.classList.remove("hidden");
  }

  function finish() {
    if (!saraScore) checkSara();
    if (!adamScore) {
      // allow finish from Sara even if Adam not checked — score what's there
      const aVal = document.getElementById("adamInput").value;
      if (normalize(aVal)) adamScore = scoreText(aVal, ADAM_KEYS, "he");
      else adamScore = { hits: 0, total: ADAM_KEYS.length, pct: 0 };
    }
    if (!saraScore) {
      const sVal = document.getElementById("saraInput").value;
      if (normalize(sVal)) saraScore = scoreText(sVal, SARA_KEYS, "she");
      else saraScore = { hits: 0, total: SARA_KEYS.length, pct: 0 };
    }

    const avg = Math.round((adamScore.pct + saraScore.pct) / 2);
    const stars = starsFromPct(avg);

    panels.forEach(function (p) {
      p.classList.add("hidden");
    });
    doneBox.classList.remove("hidden");
    document.getElementById("finalScore").textContent =
      "Adam: " +
      adamScore.hits +
      "/" +
      adamScore.total +
      " · Sara: " +
      saraScore.hits +
      "/" +
      saraScore.total +
      " · Overall " +
      avg +
      "%";
    renderStars(document.getElementById("stars"), stars);

    if (window.LAStars) {
      LAStars.recordPlay(GAME_ID);
      LAStars.saveFromAccuracy(GAME_ID, avg);
    }
    stepBtns.forEach(function (btn) {
      btn.classList.remove("active");
      btn.classList.add("done");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    adamScore = null;
    saraScore = null;
    document.getElementById("adamInput").value = "";
    document.getElementById("saraInput").value = "";
    document.getElementById("adamFeedback").textContent = "";
    document.getElementById("saraFeedback").textContent = "";
    document.getElementById("adamModel").classList.add("hidden");
    document.getElementById("saraModel").classList.add("hidden");
    document.getElementById("adamRef").classList.add("hidden");
    document.getElementById("saraRef").classList.add("hidden");
    goTo(0);
  }

  // Navigation
  document.getElementById("toWriteAdam").addEventListener("click", function () {
    goTo(1);
  });
  document.getElementById("backToAdam").addEventListener("click", function () {
    goTo(0);
  });
  document.getElementById("checkAdam").addEventListener("click", checkAdam);
  document.getElementById("toSaraRead").addEventListener("click", function () {
    goTo(2);
  });
  document.getElementById("backToWriteAdam").addEventListener("click", function () {
    goTo(1);
  });
  document.getElementById("toWriteSara").addEventListener("click", function () {
    goTo(3);
  });
  document.getElementById("backToSara").addEventListener("click", function () {
    goTo(2);
  });
  document.getElementById("checkSara").addEventListener("click", checkSara);
  document.getElementById("finishBtn").addEventListener("click", finish);
  document.getElementById("restartBtn").addEventListener("click", restart);

  document.getElementById("toggleAdamRef").addEventListener("click", function () {
    document.getElementById("adamRef").classList.toggle("hidden");
  });
  document.getElementById("toggleSaraRef").addEventListener("click", function () {
    document.getElementById("saraRef").classList.toggle("hidden");
  });

  stepBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      goTo(Number(btn.dataset.step));
    });
  });

  goTo(0);
})();
