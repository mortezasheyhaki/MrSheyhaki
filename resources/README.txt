RESOURCES LIBRARY — NOW DATA-DRIVEN

Upload this whole "resources" folder to the ROOT of mrsheyhaki.ir,
next to learningarcade/. It already links from every page's nav.

WHAT CHANGED

american-english-file/ used to be ~270 hand-written HTML files —
one per unit, lesson, and games/worksheets/audio page — all copies
of the same template. That's now generated automatically from a
single data file, so you never hand-edit those HTML files again.

  resources/american-english-file/
    assets/
      course-data.js       <- EDIT THIS to add units, lessons, tracks
      course-render.js     <- the shared page renderer (rarely needs editing)
    index.html              <- generated: levels page
    starter/                <- generated: all Starter units + PE lessons
    1/                       <- generated: all Level 1 units + PE lessons

  tools/generate-resources.js  <- regenerates everything above from
                                    assets/course-data.js

HOW TO ADD AN AUDIO TRACK, WORKSHEET, OR GAME

1. Open resources/american-english-file/assets/course-data.js.
2. Find the unit/lesson (or Practical English entry) and add a line
   to its audio / worksheets / games array, e.g.:
     { track: "2.02", url: "https://your-host.com/file.mp3" }
     { title: "Unit 2A Worksheet", url: "https://your-host.com/file.pdf" }
3. Run:  node tools/generate-resources.js
4. Commit and push both the data file and the regenerated pages.

You need Node.js installed locally to run the generator (it's not
needed by the live site — GitHub Pages just serves the plain HTML
files it outputs).

HOW TO ADD UNIT / LESSON NAMES

Same file — set the `name` property on a unit or lesson object,
e.g. `level.units[3].name = "Family and friends"`. Placeholder
text like "[Add unit name]" shows automatically until you do.

HOW TO ADD A NEW LEVEL (currently 2-5 are locked "Coming soon")

In course-data.js, add a new entry under `levels` (copy the
"starter" block as a starting point) and remove that number from
`lockedLevels`. Re-run the generator - the folder and all its pages
are created for you.

ADDING A SECOND COURSEBOOK LATER

Create a new folder next to american-english-file/
(e.g. resources/some-other-book/) with its own data file and a
generator script following the same pattern, then add a card for
it in resources/index.html's resource-grid.
