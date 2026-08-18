#!/usr/bin/env node
/*
 * GENERATE RESOURCES
 * -------------------
 * Regenerates resources/american-english-file/ entirely from
 * assets/course-data.js. Safe to run any time — it deletes and
 * rebuilds every generated page, so it's always in sync with the data.
 *
 * Usage (from the MrSheyhaki repo root):
 *   node tools/generate-resources.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AEF_DIR = path.join(ROOT, "resources", "american-english-file");
const DATA = require(path.join(ROOT, "resources", "american-english-file", "assets", "course-data.js"));

function up(n) {
  return "../".repeat(n);
}

const HEADER = (upToRoot) => `<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="${upToRoot}">
      <span class="brand-mark">MS</span>
      <span class="brand-text"><strong>Mr. Sheyhaki</strong><small>English Teacher</small></span>
    </a>
    <nav id="mainNav" class="main-nav" aria-label="Main navigation">
      <a href="${upToRoot}">Home</a>
      <a href="${upToRoot}learningarcade/">Learning Arcade</a>
      <a href="${upToRoot}resources/">Resources</a>
      <a href="${upToRoot}worksheets/">Worksheets</a>
      <a href="${upToRoot}about/">About</a>
      <a href="${upToRoot}contact/">Contact</a>
    </nav>
    <button class="theme-toggle" data-theme-toggle type="button" aria-label="Toggle website theme"></button>
    <button id="menuToggle" class="menu-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mainNav">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;

function page({ pageDepth, title, description, type, dataAttrs }) {
  const upToResources = up(pageDepth + 1);
  const upToRoot = up(pageDepth + 2);
  const upToAEF = up(pageDepth);
  const attrs = Object.keys(dataAttrs || {})
    .map((k) => ` data-${k}="${dataAttrs[k]}"`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Mr. Sheyhaki</title>
<meta name="description" content="${description}">
<link rel="stylesheet" href="${upToResources}style.css">
<link rel="stylesheet" href="${upToRoot}theme.css">
</head>
<body data-course="american-english-file" data-type="${type}"${attrs}>

${HEADER(upToRoot)}

<main id="app"></main>

<footer class="site-footer"><p>© <span id="year"></span> Mr. Sheyhaki · Resources</p></footer>
<script src="${upToResources}script.js"></script>
<script src="${upToRoot}theme.js"></script>
<script src="${upToAEF}assets/course-data.js"></script>
<script src="${upToAEF}assets/course-render.js"></script>
</body>
</html>
`;
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

// Clean previously generated content for each level (keeps assets/ and the
// hand-written top-level american-english-file/index.html untouched).
function generate() {
  const course = DATA["american-english-file"];

  // --- course index (pageDepth 0) ---
  write(
    path.join(AEF_DIR, "index.html"),
    page({
      pageDepth: 0,
      title: "American English File",
      description: "Choose an American English File level to see its units.",
      type: "level-list",
      dataAttrs: {},
    })
  );

  Object.keys(course.levels).forEach((levelKey) => {
    const level = course.levels[levelKey];
    const levelDir = path.join(AEF_DIR, levelKey);
    rimraf(levelDir);

    // --- level index (pageDepth 1) ---
    write(
      path.join(levelDir, "index.html"),
      page({
        pageDepth: 1,
        title: `American English File — ${level.label}`,
        description: `Units and Practical English lessons for American English File — ${level.label}.`,
        type: "level",
        dataAttrs: { level: levelKey },
      })
    );

    const unitCount = Object.keys(level.units).length;
    const peCount = Object.keys(level.practicalEnglish).length;

    // --- unit pages (pageDepth 2) ---
    for (let u = 1; u <= unitCount; u++) {
      const unitDir = path.join(levelDir, `unit-${u}`);
      write(
        path.join(unitDir, "index.html"),
        page({
          pageDepth: 2,
          title: `Unit ${u}`,
          description: `Unit ${u} of American English File — ${level.label} — choose lesson A or B.`,
          type: "unit",
          dataAttrs: { level: levelKey, unit: u },
        })
      );

      // --- lesson pages a/b (pageDepth 3) ---
      ["a", "b"].forEach((letter) => {
        const lessonDir = path.join(unitDir, letter);
        write(
          path.join(lessonDir, "index.html"),
          page({
            pageDepth: 3,
            title: `Unit ${u}${letter.toUpperCase()}`,
            description: `Games, worksheets, and audio for Unit ${u}${letter.toUpperCase()} of American English File — ${level.label}.`,
            type: "lesson",
            dataAttrs: { level: levelKey, unit: u, lesson: letter },
          })
        );

        // --- resource sections (pageDepth 4) ---
        ["games", "worksheets", "audio"].forEach((section) => {
          write(
            path.join(lessonDir, section, "index.html"),
            page({
              pageDepth: 4,
              title: `Unit ${u}${letter.toUpperCase()} ${cap(section)}`,
              description: `${cap(section)} for Unit ${u}${letter.toUpperCase()} of American English File — ${level.label}.`,
              type: section,
              dataAttrs: { level: levelKey, unit: u, lesson: letter },
            })
          );
        });
      });
    }

    // --- Practical English pages (pageDepth 2) ---
    for (let p = 1; p <= peCount; p++) {
      const peDir = path.join(levelDir, `practical-english-${p}`);
      write(
        path.join(peDir, "index.html"),
        page({
          pageDepth: 2,
          title: `Practical English ${p}`,
          description: `Games, worksheets, and audio for Practical English ${p} of American English File — ${level.label}.`,
          type: "lesson",
          dataAttrs: { level: levelKey, pe: p },
        })
      );

      // --- resource sections (pageDepth 3) ---
      ["games", "worksheets", "audio"].forEach((section) => {
        write(
          path.join(peDir, section, "index.html"),
          page({
            pageDepth: 3,
            title: `Practical English ${p} ${cap(section)}`,
            description: `${cap(section)} for Practical English ${p} of American English File — ${level.label}.`,
            type: section,
            dataAttrs: { level: levelKey, pe: p },
          })
        );
      });
    }
  });

  console.log("Generated resources/american-english-file/ from course-data.js");
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

generate();
