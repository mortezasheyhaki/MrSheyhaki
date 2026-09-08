(function () {
  const GAME_ID = "1-3a-who-said-it";

  const PEOPLE = [
    {
      name: "Sarah",
      meta: "36, from New York · lives in the UK",
      text: "In the US, we work really hard. Sometimes we don't take vacations because we work so hard. British people are different. They only want to finish work and go home."
    },
    {
      name: "Amy",
      meta: "22, from Tennessee · lives in Thailand",
      text: "I really like the weather. It's very hot and it rains a lot from June to October. Also, the people are very friendly. Everybody smiles. I love it!"
    },
    {
      name: "Jayne",
      meta: "22, from Connecticut · lives in Argentina",
      text: "Argentina is a beautiful country, and the people are very warm and friendly. They like to talk to foreigners and they are interested in other countries. Something I don't like is the weather in winter. Sometimes it's very cold."
    },
    {
      name: "Gaby",
      meta: "30, from Minnesota · lives in Mexico",
      text: "My favorite thing in Mexico is the tacos al pastor. We don't have tacos al pastor in the US. Some people think Mexican food is spicy, but I love it. Everything about Mexico is great except the traffic in Mexico City. It's very slow."
    },
    {
      name: "Eric",
      meta: "28, from New York · lives in Iceland",
      text: "Iceland can be very cold and gray. And it rains a lot! For me, food is a problem. They eat a lot of fish and seafood here, and I don't like fish or seafood."
    },
    {
      name: "Christina",
      meta: "21, from California · lives in Morocco",
      text: "I love Morocco. Why? Because I like the culture, the art, the history. It's a beautiful country, too, especially the Atlas Mountains. The only thing I don't like? It's difficult for a woman to travel alone."
    }
  ];

  // Blanks: each item is { parts: string|blank[], accept: normalized name arrays per blank }
  // For two blanks, accept is array of [nameA, nameB] pairs (order independent checked in code)
  const SENTENCES = [
    {
      // 1 ______ likes the weather.
      html: [
        { type: "num", v: "1" },
        { type: "blank", key: "a" },
        { type: "text", v: "likes the weather." }
      ],
      accept: [["amy"]]
    },
    {
      // 2 ______ and ______ don't like the weather.
      html: [
        { type: "num", v: "2" },
        { type: "blank", key: "a" },
        { type: "text", v: "and" },
        { type: "blank", key: "b" },
        { type: "text", v: "don't like the weather." }
      ],
      accept: [["jayne", "eric"], ["eric", "jayne"]]
    },
    {
      // 3 ______ likes the food.
      html: [
        { type: "num", v: "3" },
        { type: "blank", key: "a" },
        { type: "text", v: "likes the food." }
      ],
      accept: [["gaby"]]
    },
    {
      // 4 ______ doesn't like the food.
      html: [
        { type: "num", v: "4" },
        { type: "blank", key: "a" },
        { type: "text", v: "doesn't like the food." }
      ],
      accept: [["eric"]]
    },
    {
      // 5 ______ and ______ think the people are friendly.
      html: [
        { type: "num", v: "5" },
        { type: "blank", key: "a" },
        { type: "text", v: "and" },
        { type: "blank", key: "b" },
        { type: "text", v: "think the people are friendly." }
      ],
      accept: [["amy", "jayne"], ["jayne", "amy"]]
    },
    {
      // 6 ______ thinks the food costs a lot.
      html: [
        { type: "num", v: "6" },
        { type: "blank", key: "a" },
        { type: "text", v: "thinks the food costs a lot." }
      ],
      accept: [["eric"]]
    },
    {
      // 7 ______ thinks Americans work very hard.
      html: [
        { type: "num", v: "7" },
        { type: "blank", key: "a" },
        { type: "text", v: "thinks Americans work very hard." }
      ],
      accept: [["sarah"]]
    }
  ];

  const articlesEl = document.getElementById("articles");
  const sentencesEl = document.getElementById("sentences");
  const checkBtn = document.getElementById("checkBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedback = document.getElementById("feedback");
  const progressLabel = document.getElementById("progressLabel");
  const doneBox = document.getElementById("done");
  const finalScore = document.getElementById("finalScore");
  const restartBtn = document.getElementById("restartBtn");
  const starsEl = document.getElementById("stars");
  const zoom = document.getElementById("zoom");
  const zoomCard = document.getElementById("zoomCard");
  const zoomBody = document.getElementById("zoomBody");
  const zoomClose = document.getElementById("zoomClose");

  function normalize(s) {
    return String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function buildArticles() {
    articlesEl.innerHTML = "";
    PEOPLE.forEach(function (p) {
      const card = document.createElement("article");
      card.className = "person-card";
      card.dataset.name = p.name;
      card.innerHTML =
        '<span class="zoom-hint">tap to zoom</span>' +
        '<div class="person-name">' + p.name + ' <span class="meta">· ' + p.meta + "</span></div>" +
        '<div class="person-body">' + p.text + "</div>";
      card.addEventListener("click", function () {
        openZoom(p);
      });
      articlesEl.appendChild(card);
    });
  }

  function openZoom(p) {
    zoomCard.dataset.name = p.name;
    zoomBody.innerHTML =
      '<div class="person-name">' + p.name + ' <span class="meta">· ' + p.meta + "</span></div>" +
      '<div class="person-body">' + p.text + "</div>";
    zoom.classList.remove("hidden");
  }

  function closeZoom() {
    zoom.classList.add("hidden");
  }

  zoomClose.addEventListener("click", function (e) {
    e.stopPropagation();
    closeZoom();
  });
  zoom.addEventListener("click", function (e) {
    if (e.target === zoom) closeZoom();
  });
  zoomCard.addEventListener("click", function (e) {
    // second press on the zoomed card closes it
    if (e.target === zoomCard || e.target.classList.contains("person-body") || e.target.classList.contains("person-name") || e.target.classList.contains("meta")) {
      closeZoom();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeZoom();
  });

  function buildSentences() {
    sentencesEl.innerHTML = "";
    SENTENCES.forEach(function (s, i) {
      const row = document.createElement("div");
      row.className = "s-item";
      row.dataset.index = String(i);
      s.html.forEach(function (part) {
        if (part.type === "num") {
          const n = document.createElement("span");
          n.className = "s-num";
          n.textContent = part.v;
          row.appendChild(n);
        } else if (part.type === "text") {
          const t = document.createElement("span");
          t.textContent = part.v;
          row.appendChild(t);
        } else if (part.type === "blank") {
          const inp = document.createElement("input");
          inp.type = "text";
          inp.dataset.key = part.key;
          inp.dataset.index = String(i);
          inp.autocomplete = "off";
          inp.spellcheck = false;
          inp.placeholder = "name";
          row.appendChild(inp);
        }
      });
      sentencesEl.appendChild(row);
    });
    updateProgress();
  }

  function updateProgress() {
    const inputs = sentencesEl.querySelectorAll("input");
    let filled = 0;
    inputs.forEach(function (inp) {
      if (normalize(inp.value)) filled++;
    });
    progressLabel.textContent = filled + " / " + inputs.length + " filled";
  }

  sentencesEl.addEventListener("input", updateProgress);

  function checkRow(i) {
    const s = SENTENCES[i];
    const row = sentencesEl.querySelector('.s-item[data-index="' + i + '"]');
    const inputs = [...row.querySelectorAll("input")];
    const values = inputs.map(function (inp) { return normalize(inp.value); });

    inputs.forEach(function (inp) {
      inp.classList.remove("correct", "wrong");
    });

    if (s.optional) {
      // optional item: if blank, ignore; if filled, don't force wrong
      if (values.every(function (v) { return !v; })) {
        return { ok: true, skipped: true };
      }
      // no official answer in the texts
      inputs.forEach(function (inp) {
        if (normalize(inp.value)) inp.classList.add("correct");
      });
      return { ok: true, skipped: true };
    }

    if (values.some(function (v) { return !v; })) {
      return { ok: false, empty: true };
    }

    const ok = s.accept.some(function (pair) {
      if (pair.length !== values.length) return false;
      return pair.every(function (name, idx) {
        return name === values[idx];
      });
    });

    inputs.forEach(function (inp) {
      inp.classList.add(ok ? "correct" : "wrong");
    });
    return { ok: ok };
  }

  function checkAll() {
    let correct = 0;
    let required = 0;
    let empty = 0;

    SENTENCES.forEach(function (s, i) {
      const r = checkRow(i);
      if (s.optional) return;
      required++;
      if (r.empty) empty++;
      else if (r.ok) correct++;
    });

    if (empty > 0) {
      feedback.className = "feedback info";
      feedback.textContent = "Fill in all the blanks first.";
      return;
    }

    feedback.className = correct === required ? "feedback success" : "feedback error";
    feedback.textContent =
      correct === required
        ? "Perfect! All correct ✓"
        : correct + " / " + required + " correct — check the red ones";

    if (correct === required) {
      doneBox.classList.remove("hidden");
      finalScore.textContent = correct + " / " + required;
      const pct = Math.round((correct / required) * 100);
      if (window.LAStars) {
        LAStars.recordPlay(GAME_ID);
        LAStars.saveFromAccuracy(GAME_ID, pct);
      }
      const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
      starsEl.classList.remove("celebrate");
      starsEl.innerHTML = "";
      for (let i = 1; i <= 3; i++) {
        const el = document.createElement("span");
        el.className = "star" + (i <= stars ? " filled pop" : "");
        el.textContent = i <= stars ? "★" : "☆";
        el.style.animationDelay = (i <= stars ? (i - 1) * 0.18 : 0) + "s";
        starsEl.appendChild(el);
      }
      if (stars > 0) {
        void starsEl.offsetWidth;
        starsEl.classList.add("celebrate");
      }
    }
  }

  function reset() {
    sentencesEl.querySelectorAll("input").forEach(function (inp) {
      inp.value = "";
      inp.classList.remove("correct", "wrong");
    });
    feedback.textContent = "";
    feedback.className = "feedback";
    doneBox.classList.add("hidden");
    updateProgress();
  }

  checkBtn.addEventListener("click", checkAll);
  resetBtn.addEventListener("click", reset);
  restartBtn.addEventListener("click", reset);

  buildArticles();
  buildSentences();
})();
