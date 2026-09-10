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
 *   number. Give lessons "a" and "b" a name and empty resource arrays. (Level 1 also has "c".)
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

// Unit 1A – Games
COURSE_DATA["american-english-file"].levels.starter.units[1].lessons.a.games = [
  { title: "I am / I'm · You are / You're", url: "be-i-you/" },
  { title: "Listen & Write the Numbers", url: "listen-write-numbers/" },
  { title: "Select the Day You Hear", url: "listen-select-day/" },
  { title: "Listen & Write", url: "listen-write-days/" },
  { title: "Make Questions", url: "make-questions/" },
  { title: "Complete the Dialogues", url: "complete-dialogues/" },
  { title: "Listen and Choose", url: "listen-choose/" },
  { title: "Order the Days", url: "order-days/" },
  { title: "Listen & Repeat", url: "listen-repeat-days/" },
  { title: "Word Search · Numbers & Days", url: "wordsearch-days-numbers/" },
  { title: "Complete the Conversations", url: "complete-conversations/" },
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

// Unit 4A – People & Family / Possessives
COURSE_DATA["american-english-file"].levels.starter.units[4].lessons.a.games = [
  { title: "Possessives 1", url: "possessives-1/" },
  { title: "Possessives 2", url: "possessives-2/" },
  { title: "Family Tree", url: "family-tree/" },
  { title: "Family Match Rush", url: "match-rush/" },
  { title: "People Words", url: "people-words/" },
];

// Unit 5A – Games
COURSE_DATA["american-english-file"].levels.starter.units[5].lessons.a.games = [];

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

// Unit 7B – Games
COURSE_DATA["american-english-file"].levels.starter.units[7].lessons.b.games = [
  { title: "Subject vs Object Pronouns", url: "subject-object-pronouns/" },
];

// Unit 9A – Listen & Write game
COURSE_DATA["american-english-file"].levels.starter.units[9].lessons.a.games = [
  { title: "Listen & Write", url: "listen-and-write/" },
];

// Unit 4B – Adjectives (moved from Vocabulary Arcade)
COURSE_DATA["american-english-file"].levels.starter.units[4].lessons.b.games = [
  { title: "Opposite Snap", url: "opposite-snap/" },
  { title: "Match Adjectives", url: "match-adjectives/" },
  { title: "Sound Match Picture", url: "sound-match-picture/" },
  { title: "Listen and Write", url: "listen-and-write/" },
  { title: "Adjective Sentences", url: "adjective-sentences/" },
];

// Level 1 – Unit 9A – Food games (from Vocabulary Arcade)
COURSE_DATA["american-english-file"].levels["1"].units[9].lessons.a.games = [
  { title: "Listen & Write",    url: "listen-and-write/" },
  { title: "Listen & Match",    url: "listen-match/" },
  { title: "Food Match Rush",   url: "/learningarcade/vocabulary/food/match-rush/" },
  { title: "A · An · Some",     url: "/learningarcade/vocabulary/food/a-an-some/" },
  { title: "Food Flashcards",   url: "/learningarcade/vocabulary/food/flashcards/" },
  { title: "Food Memory Match", url: "/learningarcade/vocabulary/food/memory/" },
];

// Ensure Level 1 units have lesson C
(function () {
  const units = COURSE_DATA["american-english-file"].levels["1"].units;
  for (const k of Object.keys(units)) {
    if (!units[k].lessons.c) units[k].lessons.c = emptyLesson("");
  }
})();

// Level 1 – Unit & lesson titles (from Student's Book TOC)
COURSE_DATA["american-english-file"].levels["1"].units[1].name = "Welcome & introductions";
COURSE_DATA["american-english-file"].levels["1"].units[1].lessons.a.name = "Welcome to the class";
COURSE_DATA["american-english-file"].levels["1"].units[1].lessons.b.name = "One world";
COURSE_DATA["american-english-file"].levels["1"].units[1].lessons.c.name = "What's your email?";
COURSE_DATA["american-english-file"].levels["1"].units[2].name = "Personality & routines";
COURSE_DATA["american-english-file"].levels["1"].units[2].lessons.a.name = "Are you neat or messy?";
COURSE_DATA["american-english-file"].levels["1"].units[2].lessons.b.name = "Made in America";
COURSE_DATA["american-english-file"].levels["1"].units[2].lessons.c.name = "Slow down!";
COURSE_DATA["american-english-file"].levels["1"].units[3].name = "America & work routines";
COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.a.name = "America: the good and the bad";
COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.b.name = "9 to 5";
COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.c.name = "Love me, love my dog";
COURSE_DATA["american-english-file"].levels["1"].units[4].name = "Family & daily life";
COURSE_DATA["american-english-file"].levels["1"].units[4].lessons.a.name = "Family photos";
COURSE_DATA["american-english-file"].levels["1"].units[4].lessons.b.name = "From morning to night";
COURSE_DATA["american-english-file"].levels["1"].units[4].lessons.c.name = "Blue Zones";
COURSE_DATA["american-english-file"].levels["1"].units[5].name = "Opinions & lifestyle";
COURSE_DATA["american-english-file"].levels["1"].units[5].lessons.a.name = "Vote for me!";
COURSE_DATA["american-english-file"].levels["1"].units[5].lessons.b.name = "A quiet life?";
COURSE_DATA["american-english-file"].levels["1"].units[5].lessons.c.name = "A city for all seasons";
COURSE_DATA["american-english-file"].levels["1"].units[6].name = "Stories & celebrations";
COURSE_DATA["american-english-file"].levels["1"].units[6].lessons.a.name = "A North African story";
COURSE_DATA["american-english-file"].levels["1"].units[6].lessons.b.name = "The second Friday in July";
COURSE_DATA["american-english-file"].levels["1"].units[6].lessons.c.name = "Making music";
COURSE_DATA["american-english-file"].levels["1"].units[7].name = "Selfies & travel";
COURSE_DATA["american-english-file"].levels["1"].units[7].lessons.a.name = "Selfies";
COURSE_DATA["american-english-file"].levels["1"].units[7].lessons.b.name = "Wrong name, wrong place";
COURSE_DATA["american-english-file"].levels["1"].units[7].lessons.c.name = "Happy New Year?";
COURSE_DATA["american-english-file"].levels["1"].units[8].name = "Mysteries & places";
COURSE_DATA["american-english-file"].levels["1"].units[8].lessons.a.name = "A murder mystery";
COURSE_DATA["american-english-file"].levels["1"].units[8].lessons.b.name = "A house with a history";
COURSE_DATA["american-english-file"].levels["1"].units[8].lessons.c.name = "Haunted rooms";
COURSE_DATA["american-english-file"].levels["1"].units[9].name = "Food & facts";
COURSE_DATA["american-english-file"].levels["1"].units[9].lessons.a.name = "#mydinnerlastnight";
COURSE_DATA["american-english-file"].levels["1"].units[9].lessons.b.name = "White gold";
COURSE_DATA["american-english-file"].levels["1"].units[9].lessons.c.name = "Facts and figures";
COURSE_DATA["american-english-file"].levels["1"].units[10].name = "Travel & fortune";
COURSE_DATA["american-english-file"].levels["1"].units[10].lessons.a.name = "The most dangerous place...";
COURSE_DATA["american-english-file"].levels["1"].units[10].lessons.b.name = "Five continents in a day";
COURSE_DATA["american-english-file"].levels["1"].units[10].lessons.c.name = "The fortune-teller";
COURSE_DATA["american-english-file"].levels["1"].units[11].name = "Culture & experiences";
COURSE_DATA["american-english-file"].levels["1"].units[11].lessons.a.name = "Culture shock";
COURSE_DATA["american-english-file"].levels["1"].units[11].lessons.b.name = "Experiences or things?";
COURSE_DATA["american-english-file"].levels["1"].units[11].lessons.c.name = "How smart is your phone?";
COURSE_DATA["american-english-file"].levels["1"].units[12].name = "Entertainment & interview";
COURSE_DATA["american-english-file"].levels["1"].units[12].lessons.a.name = "I've seen it ten times!";
COURSE_DATA["american-english-file"].levels["1"].units[12].lessons.b.name = "He's been everywhere!";
COURSE_DATA["american-english-file"].levels["1"].units[12].lessons.c.name = "The American English File interview";


// Level 1 – Unit 3A – Match the Sounds (verb phrases)
COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.a.games = [
  { title: "Match the Sounds", url: "match-sounds/" },
  { title: "Match Rush", url: "match-rush/" },
  { title: "Listen & Write", url: "listen-and-write/" },
  { title: "Flashcards", url: "flashcards/" },
  { title: "Listen and Complete", url: "listen-and-complete/" },
  { title: "Complete the Article", url: "complete-the-article/" },
  { title: "Change the Sentences", url: "change-the-sentences/" },
  { title: "Listen & Change", url: "listen-and-change/" },
  { title: "Who Said It?", url: "who-said-it/" },
  { title: "Write Their Routine", url: "write-their-routine/" },
];

COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.a.audio = [
  { track: "3.01", url: "3.01.mp3", title: "Sounds / listening warm-up" },
  { track: "3.02", url: "3.02.mp3", title: "Verb phrases" },
  { track: "3.03", url: "3.03.mp3", title: "Verb phrases · endings" },
  { track: "3.04", url: "3.04.mp3", title: "My name's Keela" },
  { track: "3.05", url: "3.05.mp3", title: "Simple present · examples" },
  { track: "3.06", url: "3.06.mp3", title: "He / she / it forms" },
  { track: "3.07", url: "3.07.mp3", title: "Change the subject" },
];

COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.a.worksheets = [
  { title: "Grammar · Simple Present + and −", url: "3a-grammar-simple-present.pdf" },
  { title: "Vocabulary · Verb Phrases", url: "3a-vocabulary-verb-phrases.pdf" },
  { title: "Communicative · I work… He works…", url: "3a-communicative-i-work-he-works.pdf" },
];

COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.b.games = [
  { title: "Match the Questions", url: "match-the-questions/" },
  { title: "Do or Does?", url: "do-or-does/" },
  { title: "Make Questions", url: "make-questions/" },
  { title: "Jobs Match", url: "jobs-match/" },
  { title: "Jobs Flashcards", url: "jobs-flashcards/" },
  { title: "Listen & Write · Jobs", url: "jobs-listen-write/" },
  { title: "Look & Write · Jobs", url: "jobs-look-write/" },
  { title: "Jobs Crossword", url: "jobs-crossword/" },
  { title: "His Job, Her Job", url: "his-job-her-job/" },
];

COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.b.audio = [
  { track: "3.08", url: "3.08.mp3", title: "Jess & her husband · jobs and hours" },
  { track: "3.09", url: "3.09.mp3", title: "Do / Does questions" },
  { track: "3.10", url: "3.10.mp3", title: "Jobs vocabulary" },
  { track: "3.11", url: "3.11.mp3", title: "What do you do?" },
  { track: "3.12", url: "3.12.mp3", title: "Pronunciation · /ɜː/" },
  { track: "3.13", url: "3.13.mp3", title: "Jobs sentences" },
  { track: "3.14", url: "3.14.mp3", title: "His Job, Her Job · Part 1" },
  { track: "3.15", url: "3.15.mp3", title: "His Job, Her Job · Part 2" },
  { track: "3.16", url: "3.16.mp3", title: "His Job, Her Job · Answers" },
];

COURSE_DATA["american-english-file"].levels["1"].units[3].lessons.b.worksheets = [
  { title: "Grammar · Simple Present +, −, and ?", url: "3b-grammar-simple-present.pdf" },
  { title: "Vocabulary · Jobs", url: "3b-vocabulary-jobs.pdf" },
  { title: "Communicative · Simple Present Questionnaire", url: "3b-communicative-questionnaire.pdf" },
];


// Starter – Unit & lesson titles (from Student's Book TOC)
COURSE_DATA["american-english-file"].levels.starter.units[1].name = "Introductions & music";
COURSE_DATA["american-english-file"].levels.starter.units[1].lessons.a.name = "A cappuccino, please";
COURSE_DATA["american-english-file"].levels.starter.units[1].lessons.b.name = "World music";
COURSE_DATA["american-english-file"].levels.starter.units[2].name = "Vacations & transport";
COURSE_DATA["american-english-file"].levels.starter.units[2].lessons.a.name = "Are you on vacation?";
COURSE_DATA["american-english-file"].levels.starter.units[2].lessons.b.name = "That's my bus!";
COURSE_DATA["american-english-file"].levels.starter.units[3].name = "Possessions & souvenirs";
COURSE_DATA["american-english-file"].levels.starter.units[3].lessons.a.name = "Where are my keys?";
COURSE_DATA["american-english-file"].levels.starter.units[3].lessons.b.name = "Souvenirs";
COURSE_DATA["american-english-file"].levels.starter.units[4].name = "Family & cars";
COURSE_DATA["american-english-file"].levels.starter.units[4].lessons.a.name = "Meet the family";
COURSE_DATA["american-english-file"].levels.starter.units[4].lessons.b.name = "The perfect car";
COURSE_DATA["american-english-file"].levels.starter.units[5].name = "Food & travel";
COURSE_DATA["american-english-file"].levels.starter.units[5].lessons.a.name = "A big breakfast?";
COURSE_DATA["american-english-file"].levels.starter.units[5].lessons.b.name = "A very long flight";
COURSE_DATA["american-english-file"].levels.starter.units[6].name = "Reunions & daily routines";
COURSE_DATA["american-english-file"].levels.starter.units[6].lessons.a.name = "A school reunion";
COURSE_DATA["american-english-file"].levels.starter.units[6].lessons.b.name = "Good morning, goodnight";
COURSE_DATA["american-english-file"].levels.starter.units[7].name = "Weekends & film";
COURSE_DATA["american-english-file"].levels.starter.units[7].lessons.a.name = "Have a nice weekend!";
COURSE_DATA["american-english-file"].levels.starter.units[7].lessons.b.name = "Lights, camera, action!";
COURSE_DATA["american-english-file"].levels.starter.units[8].name = "Parking & cooking";
COURSE_DATA["american-english-file"].levels.starter.units[8].lessons.a.name = "Can I park here?";
COURSE_DATA["american-english-file"].levels.starter.units[8].lessons.b.name = "I ❤️ cooking";
COURSE_DATA["american-english-file"].levels.starter.units[9].name = "Problems & work";
COURSE_DATA["american-english-file"].levels.starter.units[9].lessons.a.name = "Everything's fine!";
COURSE_DATA["american-english-file"].levels.starter.units[9].lessons.b.name = "Working undercover";
COURSE_DATA["american-english-file"].levels.starter.units[10].name = "Hotels & the past";
COURSE_DATA["american-english-file"].levels.starter.units[10].lessons.a.name = "A room with a view";
COURSE_DATA["american-english-file"].levels.starter.units[10].lessons.b.name = "Where were you?";
COURSE_DATA["american-english-file"].levels.starter.units[11].name = "Life in the US & daily life";
COURSE_DATA["american-english-file"].levels.starter.units[11].lessons.a.name = "A new life in the US";
COURSE_DATA["american-english-file"].levels.starter.units[11].lessons.b.name = "How was your day?";
COURSE_DATA["american-english-file"].levels.starter.units[12].name = "Travel & the past";
COURSE_DATA["american-english-file"].levels.starter.units[12].lessons.a.name = "Strangers on a train";
COURSE_DATA["american-english-file"].levels.starter.units[12].lessons.b.name = "Review the past";

// Node (generator script) and browser (rendered pages) both need this object.
if (typeof module !== "undefined" && module.exports) {
  module.exports = COURSE_DATA;
}
