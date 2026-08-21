/*
 * COURSE RENDERER
 * ---------------
 * Every generated page under resources/american-english-file/ is a thin
 * shell: it loads course-data.js + this file, and this script fills in
 * <main id="app"> based on data-* attributes set on <body> by the
 * generator. You should not need to edit this file to add content —
 * edit assets/course-data.js instead.
 */
(function () {
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach((c) => c && node.appendChild(c));
    return node;
  }

  function backLink(href, label) {
    return el("a", { class: "back-link back-button", href }, [
      document.createTextNode("← " + label),
    ]);
  }

  function courseFor(body) {
    return COURSE_DATA[body.dataset.course];
  }

  function renderLevelList(body, main) {
    const course = courseFor(body);
    main.appendChild(
      el("section", { class: "arcade-intro" }, [
        backLink("../", "Back to Resources"),
        el("span", { class: "eyebrow", text: "COURSEBOOK" }),
        el("h1", { text: course.label }),
        el("p", { text: "Choose a level to see its units." }),
      ])
    );
    main.appendChild(
      el("section", { class: "section-heading" }, [
        el("div", {}, [
          el("h2", { text: "Levels" }),
          el("p", { text: course.edition || "" }),
        ]),
      ])
    );
    const grid = el("section", { class: "level-grid", "aria-label": "Levels" });
    // Explicit order: Starter first, then 1, then any other unlocked levels
    const levelOrder = ["starter", "1"].concat(
      Object.keys(course.levels).filter((k) => k !== "starter" && k !== "1")
    );
    levelOrder.forEach((key) => {
      if (!course.levels[key]) return;
      grid.appendChild(
        el("a", { class: "level-card", href: key + "/" }, [
          el("h3", { text: course.levels[key].label }),
          el("p", { text: "Units and Practical English lessons." }),
        ])
      );
    });
    // Levels not yet in course-data.js show as locked/coming soon.
    (course.lockedLevels || []).forEach((label) => {
      grid.appendChild(
        el("div", { class: "level-card level-locked" }, [
          el("h3", { text: "🔒 " + label }),
          el("span", { class: "lock-tag", text: "Coming soon" }),
        ])
      );
    });
    main.appendChild(grid);

    // Quiz section
    main.appendChild(
      el("section", { class: "section-heading" }, [
        el("div", {}, [
          el("h2", { text: "Quiz" }),
          el("p", { text: "Test your grammar and vocabulary from Units 1–12." }),
        ]),
      ])
    );
    const quizGrid = el("section", { class: "level-grid", "aria-label": "Quizzes" });
    quizGrid.appendChild(
      el("a", { class: "level-card", href: "quiz/" }, [
        el("h3", { text: "🧠 Multiple Choice" }),
        el("p", { text: "40 questions per unit · Grammar & Vocabulary." }),
      ])
    );
    main.appendChild(quizGrid);
  }

  function itemCard(href, index, title, name, isPE) {
    return el(
      "a",
      { class: "item-card unit-style-card" + (isPE ? " item-card--pe" : ""), href },
      [
        el("span", { class: "unit-number", text: isPE ? "PE" : "UNIT " + index }),
        el("h3", { text: title }),
        el("p", {
          class: "item-name-placeholder",
          text: name || (isPE ? "[Add name]" : "[Add unit name]"),
        }),
        el("span", { class: "unit-arrow", "aria-hidden": "true", text: "→" }),
      ]
    );
  }

  function renderLevel(body, main) {
    const course = courseFor(body);
    const level = course.levels[body.dataset.level];
    main.appendChild(
      el("section", { class: "arcade-intro" }, [
        backLink("../", "Back to " + course.label),
        el("span", {
          class: "eyebrow",
          text: (course.label + " · " + level.label).toUpperCase(),
        }),
        el("h1", { text: level.label }),
        el("p", { text: "Pick a unit or Practical English lesson." }),
      ])
    );
    main.appendChild(
      el("section", { class: "section-heading" }, [
        el("div", {}, [
          el("h2", { text: "Units" }),
          el("p", {
            text:
              Object.keys(level.units).length +
              " units with " +
              Object.keys(level.practicalEnglish).length +
              " Practical English lessons.",
          }),
        ]),
      ])
    );
    const grid = el("section", {
      class: "item-grid",
      "aria-label": "Units and Practical English",
    });
    const unitCount = Object.keys(level.units).length;
    const peInterval = Math.ceil(unitCount / Object.keys(level.practicalEnglish).length);
    let peIndex = 1;
    for (let u = 1; u <= unitCount; u++) {
      const unit = level.units[u];
      grid.appendChild(
        itemCard(
          "unit-" + u + "/",
          String(u).padStart(2, "0"),
          "Unit " + u,
          unit.name,
          false
        )
      );
      if (u % peInterval === 1 && level.practicalEnglish[peIndex]) {
        grid.appendChild(
          itemCard(
            "practical-english-" + peIndex + "/",
            "PE",
            "Practical English " + peIndex,
            level.practicalEnglish[peIndex].name,
            true
          )
        );
        peIndex++;
      }
    }
    main.appendChild(grid);
  }

  function renderUnit(body, main) {
    const course = courseFor(body);
    const level = course.levels[body.dataset.level];
    const unitNum = body.dataset.unit;
    const unit = level.units[unitNum];
    main.appendChild(
      el("section", { class: "arcade-intro" }, [
        backLink("../", "Back to " + level.label),
        el("span", {
          class: "eyebrow",
          text: (course.label + " · " + level.label).toUpperCase(),
        }),
      ])
    );
    main.appendChild(
      el("section", { class: "unit-hero" }, [
        el("span", { class: "unit-index", text: unitNum }),
        el("div", { class: "unit-details" }, [
          el("h1", { html: "Unit " + unitNum + ' <span class="unit-name-placeholder">— ' + (unit.name || "[Add unit name]") + "</span>" }),
          el("p", { text: "Choose a lesson." }),
        ]),
      ])
    );
    const grid = el("section", {
      class: "ab-grid",
      "aria-label": "Unit " + unitNum + " lessons",
    });
    ["a", "b"].forEach((letter) => {
      const lesson = unit.lessons[letter];
      grid.appendChild(
        el("a", { class: "ab-card", href: letter + "/" }, [
          el("span", { class: "ab-letter", text: letter.toUpperCase() }),
          el("span", { text: "Unit " + unitNum + letter.toUpperCase() }),
          el("p", { text: lesson.name || "[Add lesson name]" }),
        ])
      );
    });
    main.appendChild(grid);
  }

  function resourceCard(href, icon, title, description) {
    return el("a", { class: "content-card resource-card", href }, [
      el("div", { class: "resource-icon", "aria-hidden": "true", text: icon }),
      el("h3", { text: title }),
      el("p", { text: description }),
      el("span", { class: "resource-button", text: "Open " + title + " →" }),
    ]);
  }

  function lessonFromBody(body) {
    const course = courseFor(body);
    const level = course.levels[body.dataset.level];
    if (body.dataset.pe) {
      return { label: "Practical English " + body.dataset.pe, lesson: level.practicalEnglish[body.dataset.pe], back: "../", backLabel: "Back to " + level.label };
    }
    const unit = level.units[body.dataset.unit];
    const letter = body.dataset.lesson;
    return {
      label: "Unit " + body.dataset.unit + letter.toUpperCase(),
      lesson: unit.lessons[letter],
      back: "../",
      backLabel: "Back to Unit " + body.dataset.unit,
    };
  }

  function renderLesson(body, main) {
    const course = courseFor(body);
    const { label, lesson, back, backLabel } = lessonFromBody(body);
    main.appendChild(
      el("section", { class: "arcade-intro" }, [
        backLink(back, backLabel),
        el("span", {
          class: "eyebrow",
          text: (course.label + " · " + course.levels[body.dataset.level].label).toUpperCase(),
        }),
      ])
    );
    main.appendChild(
      el("section", { class: "unit-hero" }, [
        el("div", { class: "unit-details" }, [
          el("h1", { html: label + ' <span class="unit-name-placeholder">— ' + (lesson.name || "[Add lesson name]") + "</span>" }),
          el("p", { text: "Games, worksheets, and audio for " + label + "." }),
        ]),
      ])
    );
    main.appendChild(
      el("section", { class: "section-heading" }, [
        el("div", {}, [
          el("h2", { text: label + " Resources" }),
          el("p", { text: "Choose what you want to use." }),
        ]),
      ])
    );
    main.appendChild(
      el("section", { class: "content-grid unit-resource-grid" }, [
        resourceCard("games/", "🎮", "Games", "Interactive games and activities for " + label + "."),
        resourceCard("worksheets/", "📝", "Worksheets", "Printable worksheets and classroom practice."),
        resourceCard("audio/", "🎧", "Audio", "Student Book listening tracks for " + label + "."),
      ])
    );
  }

  const SECTION_META = {
    games: { icon: "🎮", noun: "game", verb: "Play", empty: "No games have been added for this lesson yet." },
    worksheets: { icon: "📝", noun: "worksheet", verb: "Download", empty: "No worksheets have been added for this lesson yet." },
  };

  function renderSimpleResourceSection(body, main, section) {
    const { label, lesson, back, backLabel } = lessonFromBody(body);
    const meta = SECTION_META[section];
    const items = lesson[section] || [];
    main.appendChild(
      el("section", { class: "arcade-intro" }, [
        backLink(back === "../" ? "../" : back, "Back to " + label),
      ])
    );
    main.appendChild(
      el("section", { class: "unit-hero" }, [
        el("div", { class: "unit-details" }, [
          el("h1", { text: label + " " + section.charAt(0).toUpperCase() + section.slice(1) }),
          el("p", { text: meta.noun.charAt(0).toUpperCase() + meta.noun.slice(1) + "s for " + label + "." }),
        ]),
      ])
    );
    if (items.length === 0) {
      main.appendChild(
        el("section", { class: "section-heading" }, [
          el("div", {}, [el("p", { text: meta.empty })]),
        ])
      );
      return;
    }
    const grid = el("section", { class: "content-grid unit-resource-grid" });
    items.forEach((item) => {
      grid.appendChild(
        el("a", { class: "content-card resource-card", href: item.url }, [
          el("div", { class: "resource-icon", "aria-hidden": "true", text: meta.icon }),
          el("h3", { text: item.title }),
          el("span", { class: "resource-button", text: meta.verb + " →" }),
        ])
      );
    });
    main.appendChild(grid);
  }

  function renderAudio(body, main) {
    const { label, lesson, back } = lessonFromBody(body);
    main.appendChild(
      el("section", { class: "arcade-intro" }, [backLink("../", "Back to " + label)])
    );
    main.appendChild(
      el("section", { class: "unit-hero" }, [
        el("div", { class: "unit-details" }, [
          el("h1", { text: label + " Audio" }),
          el("p", { text: "Student Book listening tracks for " + label + "." }),
        ]),
      ])
    );
    main.appendChild(
      el("section", { class: "section-heading" }, [
        el("div", {}, [
          el("h2", { text: "Listening Tracks" }),
          el("p", { text: "Play a track online or download it to your device." }),
        ]),
      ])
    );
    const tracks = lesson.audio || [];
    if (tracks.length === 0) {
      main.appendChild(
        el("section", { class: "section-heading" }, [
          el("div", {}, [el("p", { text: "No audio tracks have been added for this lesson yet." })]),
        ])
      );
      return;
    }
    const grid = el("section", { class: "content-grid audio-grid" });
    tracks.forEach((t, i) => {
      const audioId = "audio-" + i + "-" + t.track.replace(/\D/g, "");
      const article = el("article", { class: "content-card audio-card" }, [
        el("div", { class: "audio-card-header" }, [
          el("div", {}, [
            el("span", { class: "audio-label", text: "TRACK" }),
            el("h3", { text: t.track }),
          ]),
          el("span", { class: "audio-icon", text: "🎧" }),
        ]),
        el("p", { text: label + " · Track " + t.track }),
        el("div", { class: "audio-player" }, [
          el("audio", {
            id: audioId,
            preload: "none",
            controls: false,
            src: t.url,
            "data-url": t.url,
          }),
        ]),
        el("div", { class: "audio-actions" }, [
          el("button", { class: "audio-play-btn", type: "button", text: "▶ Play" }),
          el("a", {
            class: "audio-download-btn",
            href: t.url,
            download: "AEF-" + t.track.replace(/\s+/g, "") + ".mp3",
            target: "_self",
            rel: "noopener noreferrer",
            text: "↓ Download",
          }),
        ]),
      ]);
      const playBtn = article.querySelector(".audio-play-btn");
      const dlBtn = article.querySelector(".audio-download-btn");
      playBtn.addEventListener("click", () => window.toggleAudio(audioId, playBtn));
      dlBtn.addEventListener("click", (ev) => {
        // Cross-origin download attribute is often ignored — force save via blob when possible
        ev.preventDefault();
        window.downloadAudioFile(t.url, "AEF-" + t.track.replace(/\s+/g, "") + ".mp3", dlBtn);
      });
      grid.appendChild(article);
    });
    main.appendChild(grid);
  }

  window.downloadAudioFile = function (url, filename, button) {
    const original = button.textContent;
    button.textContent = "…";
    button.setAttribute("aria-busy", "true");

    function fallbackOpen() {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      button.textContent = original;
      button.removeAttribute("aria-busy");
    }

    // Try fetch → blob download (works when CDN sends CORS headers)
    fetch(url, { mode: "cors" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.blob();
      })
      .then(function (blob) {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 2000);
        button.textContent = original;
        button.removeAttribute("aria-busy");
      })
      .catch(function () {
        // No CORS or network error — open the file in a new tab so the user can save it
        fallbackOpen();
      });
  };

  window.toggleAudio = function (id, button) {
    const audio = document.getElementById(id);
    if (!audio) return;

    document.querySelectorAll("audio").forEach(function (other) {
      if (other !== audio) {
        other.pause();
        other.currentTime = 0;
      }
    });
    document.querySelectorAll(".audio-play-btn").forEach(function (btn) {
      if (btn !== button) btn.textContent = "▶ Play";
    });

    if (audio.paused) {
      const playPromise = audio.play();
      button.textContent = "❚❚ Pause";
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.textContent = "▶ Play";
          // Retry after setting crossOrigin if needed
          try {
            audio.load();
            audio.play().catch(function () {});
          } catch (e) {}
        });
      }
    } else {
      audio.pause();
      button.textContent = "▶ Play";
    }
    audio.onended = function () {
      button.textContent = "▶ Play";
    };
  };

  document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const main = document.getElementById("app");
    if (!main || !body.dataset.type) return;
    switch (body.dataset.type) {
      case "level-list":
        renderLevelList(body, main);
        break;
      case "level":
        renderLevel(body, main);
        break;
      case "unit":
        renderUnit(body, main);
        break;
      case "lesson":
        renderLesson(body, main);
        break;
      case "games":
        renderSimpleResourceSection(body, main, "games");
        break;
      case "worksheets":
        renderSimpleResourceSection(body, main, "worksheets");
        break;
      case "audio":
        renderAudio(body, main);
        break;
    }
  });
})();
