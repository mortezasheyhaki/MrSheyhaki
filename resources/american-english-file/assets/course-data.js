/*
 * COURSE DATA
 * -----------
 * This is the ONLY file you need to edit to add or change units,
 * lessons, audio tracks, worksheets, or games.
 *
 * The whole resources/american-english-file/ folder tree is generated
 * FROM this file by tools/generate-resources.js — you never hand-edit
 * the generated index.html files.
 *
 * HOW TO ADD AN AUDIO TRACK
 *   Find the lesson (or Practical English entry) below and add a line
 *   to its `audio` array, e.g.:
 *     { track: "2.02", url: "https://your-host.com/file.mp3" }
 *
 * HOW TO ADD A WORKSHEET OR GAME
 *   Same idea, in the `worksheets` or `games` array:
 *     { title: "Unit 2A Worksheet", url: "https://your-host.com/file.pdf" }
 *     { title: "Vocabulary Match", url: "https://your-host.com/game/" }
 *
 * HOW TO ADD A NEW UNIT
 *   Copy one of the existing unit blocks (e.g. unit 12) and change the
 *   number. Give lessons "a" and "b" a name and empty resource arrays.
 *
 * After editing this file, run:
 *   node tools/generate-resources.js
 * and commit the regenerated files along with this one.
 */

function emptyLesson(name) {
  return { name: name || "", audio: [], games: [], worksheets: [] };
}

function makeUnits(count) {
  const units = {};
  for (let i = 1; i <= count; i++) {
    units[i] = {
      name: "",
      lessons: {
        a: emptyLesson(""),
        b: emptyLesson(""),
      },
    };
  }
  return units;
}

function makePracticalEnglish(count) {
  const pe = {};
  for (let i = 1; i <= count; i++) {
    pe[i] = emptyLesson("");
  }
  return pe;
}

const COURSE_DATA = {
  "american-english-file": {
    label: "American English File",
    edition: "3rd Edition.",
    lockedLevels: ["2", "3", "4", "5"],
    levels: {
      starter: {
        label: "Starter",
        units: makeUnits(12),
        practicalEnglish: makePracticalEnglish(6),
      },
      "1": {
        label: "1",
        units: makeUnits(12),
        practicalEnglish: makePracticalEnglish(6),
      },
    },
  },
};

// Real data carried over from the existing site (Starter, Unit 1, Lesson A audio).
COURSE_DATA["american-english-file"].levels.starter.units[1].lessons.a.audio = [
  { track: "1.02", url: "https://cdn.imgurl.ir/uploads/w71668_AEF3e_Starter_SB_1.02.mp3" },
  { track: "1.03", url: "https://cdn.imgurl.ir/uploads/m951975_AEF3e_Starter_SB_1.03.mp3" },
  { track: "1.04", url: "https://cdn.imgurl.ir/uploads/z820121_AEF3e_Starter_SB_1.04.mp3" },
  { track: "1.05", url: "https://cdn.imgurl.ir/uploads/f290301_AEF3e_Starter_SB_1.05.mp3" },
  { track: "1.06", url: "https://cdn.imgurl.ir/uploads/f820759_AEF3e_Starter_SB_1.06.mp3" },
  { track: "1.07", url: "https://cdn.imgurl.ir/uploads/d211558_AEF3e_Starter_SB_1.07.mp3" },
  { track: "1.08", url: "https://cdn.imgurl.ir/uploads/v77740_AEF3e_Starter_SB_1.08.mp3" },
  { track: "1.09", url: "https://cdn.imgurl.ir/uploads/u785010_AEF3e_Starter_SB_1.09.mp3" },
  { track: "1.10", url: "https://cdn.imgurl.ir/uploads/j73093_AEF3e_Starter_SB_1.10.mp3" },
  { track: "1.11", url: "https://cdn.imgurl.ir/uploads/i255101_AEF3e_Starter_SB_1.11.mp3" },
  { track: "1.12", url: "https://cdn.imgurl.ir/uploads/p740968_AEF3e_Starter_SB_1.12.mp3" },
  { track: "1.13", url: "https://cdn.imgurl.ir/uploads/h225688_AEF3e_Starter_SB_1.13.mp3" },
  { track: "1.14", url: "https://cdn.imgurl.ir/uploads/n71037_AEF3e_Starter_SB_1.14.mp3" },
  { track: "1.15", url: "https://cdn.imgurl.ir/uploads/u890290_AEF3e_Starter_SB_1.15.mp3" },
];

// Unit 3A – Games
COURSE_DATA["american-english-file"].levels.starter.units[3].lessons.a.games = [
  { title: "Pictures + Words Match", url: "pictures-words-match/" },
  { title: "A or An Swipe", url: "a-an-swipe/" },
  { title: "Plural -s Sound Match", url: "plural-s-sound-match/" },
  { title: "What's in Your Bag?", url: "whats-in-your-bag/" },
];

// Unit 3B – Games
COURSE_DATA["american-english-file"].levels.starter.units[3].lessons.b.games = [
  { title: "Listen & Match", url: "listen-match/" },
  { title: "Dialogue Completer", url: "dialogue-completer/" },
  { title: "This / That Sentences", url: "this-that-sentences/" },
];


// Unit 5A – Games
COURSE_DATA["american-english-file"].levels.starter.units[5].lessons.a.games = [
  { title: "Food Verb Match", url: "food-verb-match/" },
  { title: "Food & Drinks Sort", url: "food-drinks-sort/" },
];



// Unit 6A – Games
COURSE_DATA["american-english-file"].levels.starter.units[6].lessons.a.games = [
  { title: "Listen & Write", url: "listen-and-write/" },
];

// Unit 7A – Games
COURSE_DATA["american-english-file"].levels.starter.units[7].lessons.a.games = [
  { title: "Question Builder", url: "question-builder/" },
  { title: "Build the Question", url: "build-the-question/" },
  { title: "Amelia's Days", url: "amelias-days/" },
];

// Unit 9A – Listen & Write game
COURSE_DATA["american-english-file"].levels.starter.units[9].lessons.a.games = [
  { title: "Listen & Write", url: "listen-and-write/" },
];

// Node (generator script) and browser (rendered pages) both need this object.
if (typeof module !== "undefined" && module.exports) {
  module.exports = COURSE_DATA;
}
