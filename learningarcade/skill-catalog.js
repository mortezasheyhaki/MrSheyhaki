/**
 * Learning Arcade — Unified Skill, Title & URL Catalog
 * Public API: window.LASkillCatalog
 *
 * Resolves real skill labels (Vocabulary, Grammar, Pronunciation, Listening,
 * Speaking, Reading, Writing, Communication, Topics, Tests) from COURSE_DATA
 * and course hub definitions so Skill Progress & Admin never fall back to
 * "General", "Starter Course", or raw course slugs like "tactics-for-listening".
 */
(function (global) {
  "use strict";

  var IGNORED_CATEGORIES = {
    "": true,
    "general": true,
    "starter": true,
    "starter course": true,
    "american-english-file": true,
    "american english file": true,
    "teen-2-teen": true,
    "teen2teen": true,
    "aef": true,
    "t2t": true,
    "tactics-for-listening": true,
    "tactics for listening": true
  };

  var SKILL_CANONICAL = {
    "vocabulary": "Vocabulary",
    "vocab": "Vocabulary",
    "grammar": "Grammar",
    "pronunciation": "Pronunciation",
    "listening": "Listening",
    "speaking": "Speaking",
    "reading": "Reading",
    "writing": "Writing",
    "communication": "Communication",
    "communicative": "Communication",
    "topics": "Topics",
    "tests": "Tests",
    "test": "Tests"
  };

  function normalizeLabel(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    var low = s.toLowerCase();
    if (IGNORED_CATEGORIES[low]) return "";
    if (SKILL_CANONICAL[low]) return SKILL_CANONICAL[low];
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function cleanTitle(raw) {
    return String(raw || "")
      .replace(/^(Grammar|Vocabulary|Pronunciation|Listening|Speaking|Reading|Writing|Communication)\s*[·•\-]\s*/i, "")
      .trim();
  }

  // Static catalog for Teen 2 Teen, Tactics for Listening, Learning Arcade,
  // Topics, and AEF entries that do not have an explicit label in course-data.js.
  var STATIC_META = {
    // Learning Arcade standalone games
    "be-verbs": { label: "Grammar", title: "Be Verbs", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/be-verbs/" },
    "grammar-be": { label: "Grammar", title: "Be Verbs (Form)", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/be/", alias: true },
    "nouns": { label: "Grammar", title: "Singular & Plural Nouns", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/nouns/" },
    "there-is-there-are": { label: "Grammar", title: "There is / There are", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/there-is-there-are/" },
    "simple-present": { label: "Grammar", title: "Simple Present", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/simple-present/" },
    "simple-past": { label: "Grammar", title: "Simple Past", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/simple-past/" },
    "present-perfect": { label: "Grammar", title: "Present Perfect", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/present-perfect/" },
    "grammar-phrasal-verbs": { label: "Grammar", title: "Phrasal Verbs", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/phrasal-verbs/" },
    "grammar-how-much-how-many": { label: "Grammar", title: "How Much / How Many", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/how-much-how-many/" },
    "grammar-battle": { label: "Grammar", title: "Grammar Battle", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/grammar-battle/" },
    "grammar-wh-questions": { label: "Grammar", title: "Wh- Questions", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/wh-questions/" },
    "wh-questions": { label: "Grammar", title: "Wh- Questions", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/wh-questions/", alias: true },
    "grammar-wh-meaning": { label: "Grammar", title: "Wh- Question Meaning", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/wh-question-meaning/" },
    "wh-question-meaning": { label: "Grammar", title: "Wh- Question Meaning", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/wh-question-meaning/", alias: true },
    "daily-routines": { label: "Grammar", title: "Daily Routines", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/daily-routines/" },
    "third-person-switch": { label: "Grammar", title: "Third Person Switch", course: "Learning Arcade · Grammar", url: "/learningarcade/grammar/third-person-switch/" },
    "grammar-possessives-match": { label: "Grammar", title: "Possessives Match", course: "AEF Starter · Unit 4A", url: "/resources/american-english-file/starter/unit-4/a/games/possessives-2/", alias: true },

    "opposite-snap": { label: "Vocabulary", title: "Opposite Snap", course: "AEF Starter · Unit 4B", url: "/learningarcade/vocabulary/Adjectives/Opposite_Snap/", alias: true },
    "sound-match-picture": { label: "Listening", title: "Sound Match", course: "AEF Starter · Unit 4B", url: "/learningarcade/vocabulary/Adjectives/Sound_Match_Picture/", alias: true },
    "match-rush": { label: "Vocabulary", title: "Match Rush", course: "Learning Arcade · Vocabulary", url: "/learningarcade/vocabulary/match-rush/" },
    "vocab-match-rush": { label: "Vocabulary", title: "Match Rush", course: "Learning Arcade · Vocabulary", url: "/learningarcade/vocabulary/match-rush/", alias: true },
    "vocab-clothes-voice-hunt": { label: "Vocabulary", title: "Clothes Voice Hunt", course: "Learning Arcade · Vocabulary", url: "/learningarcade/vocabulary/clothes/voice-treasure-hunt/" },
    "vocab-clothes-match": { label: "Vocabulary", title: "Clothes Match", course: "Learning Arcade · Vocabulary", url: "/learningarcade/vocabulary/clothes/match/" },
    "vocab-clothes-dictation": { label: "Listening", title: "Clothes Dictation", course: "Learning Arcade · Vocabulary", url: "/learningarcade/vocabulary/clothes/dictation/" },

    "writing-sara-daily": { label: "Writing", title: "Sara's Daily Routine", course: "Learning Arcade · Writing", url: "/learningarcade/writing/Daily%20Routine/Sara/" },
    "writing-personal-info": { label: "Writing", title: "Personal Information Questions", course: "Learning Arcade · Writing", url: "/learningarcade/writing/personal-info-questions/" },
    "writing-conversation-questions": { label: "Writing", title: "Conversation Questions", course: "Learning Arcade · Writing", url: "/learningarcade/writing/conversation-questions/" },
    "writing-ai-coach": { label: "Writing", title: "AI Writing Coach", course: "Learning Arcade · Writing", url: "/learningarcade/writing/coach/" },

    "speaking-supermarket": { label: "Speaking", title: "Supermarket Order Roleplay", course: "Learning Arcade · Speaking", url: "/learningarcade/speaking/supermarket/" },
    "speaking-how-much-how-many": { label: "Speaking", title: "How Much / How Many Speaking", course: "Learning Arcade · Speaking", url: "/learningarcade/grammar/how-much-how-many/?mode=speaking" },

    // AEF Starter entries without explicit label in course-data.js
    "starter-4a-family-tree": { label: "Vocabulary", title: "Family Tree", course: "AEF Starter · Unit 4A" },
    "starter-4a-match-rush": { label: "Vocabulary", title: "Family Match Rush", course: "AEF Starter · Unit 4A" },
    "starter-4a-people-words": { label: "Vocabulary", title: "People Words", course: "AEF Starter · Unit 4A" },
    "starter-4b-opposite-snap": { label: "Vocabulary", title: "Opposite Snap", course: "AEF Starter · Unit 4B" },
    "starter-4b-match-adjectives": { label: "Vocabulary", title: "Match Adjectives", course: "AEF Starter · Unit 4B" },
    "starter-4b-sound-match-picture": { label: "Listening", title: "Sound Match Picture", course: "AEF Starter · Unit 4B" },
    "starter-4b-listen-and-write": { label: "Listening", title: "Listen and Write", course: "AEF Starter · Unit 4B" },
    "starter-4b-adjective-sentences": { label: "Grammar", title: "Adjective Sentences", course: "AEF Starter · Unit 4B" },
    "starter-7a-free-time-flashcards": { label: "Vocabulary", title: "Free-Time Flashcards", course: "AEF Starter · Unit 7A" },
    "starter-7a-free-time-match": { label: "Vocabulary", title: "Free-Time Match", course: "AEF Starter · Unit 7A" },
    "starter-7a-free-time-listen-write": { label: "Listening", title: "Free-Time Listen & Write", course: "AEF Starter · Unit 7A" },
    "starter-7a-question-builder": { label: "Grammar", title: "Question Builder", course: "AEF Starter · Unit 7A" },
    "starter-7a-build-the-question": { label: "Grammar", title: "Build the Question", course: "AEF Starter · Unit 7A" },
    "starter-7a-amelias-days": { label: "Reading", title: "Amelia's Days", course: "AEF Starter · Unit 7A" },
    "starter-7b-subject-object-pronouns": { label: "Grammar", title: "Subject vs Object Pronouns", course: "AEF Starter · Unit 7B" },
    "starter-7b-pronouns-sentences": { label: "Grammar", title: "Subject vs Object · Sentences", course: "AEF Starter · Unit 7B" },
    "starter-7b-pronouns-words": { label: "Grammar", title: "Subject vs Object · Words", course: "AEF Starter · Unit 7B" },
    "starter-9a-listen-and-write": { label: "Listening", title: "Listen & Write", course: "AEF Starter · Unit 9A" },

    // Teen 2 Teen 1
    "t2t1-u07-home-flashcards": { label: "Vocabulary", title: "Home Flashcards", course: "Teen2Teen 1 · Unit 7", url: "/resources/teen-2-teen/1/unit-07/games/home-flashcards/" },
    "t2t1-u07-home-spelling": { label: "Vocabulary", title: "Home Spelling", course: "Teen2Teen 1 · Unit 7", url: "/resources/teen-2-teen/1/unit-07/games/home-spelling/" },

    "t2t1-u10-clothes-flashcards": { label: "Vocabulary", title: "Clothes Flashcards", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/clothes-flashcards/" },
    "t2t1-u10-color-flashcards": { label: "Vocabulary", title: "Color Flashcards", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/color-flashcards/" },
    "t2t1-u10-color-match": { label: "Vocabulary", title: "Color Match", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/color-match/" },
    "t2t1-u10-clothes-match": { label: "Vocabulary", title: "Clothes Match", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/clothes-match/" },
    "t2t1-u10-clothes-a-no-a": { label: "Vocabulary", title: "A / No A", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/clothes-a-no-a/" },
    "t2t1-u10-clothes-sound-match-picture": { label: "Listening", title: "Sound Match Picture · Clothes", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/clothes-sound-match-picture/" },
    "t2t1-u10-color-sound-match-picture": { label: "Listening", title: "Sound Match Picture · Colors", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/color-sound-match-picture/" },
    "t2t1-u10-plural-s-sound-match": { label: "Pronunciation", title: "Plural -s Sound Match", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/plural-s-sound-match/" },
    "t2t1-u10-clothes-bingo": { label: "Listening", title: "Clothes Bingo", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/clothes-bingo/" },
    "t2t1-u10-unscramble-clothes": { label: "Vocabulary", title: "Unscramble Clothes", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/unscramble-clothes/" },
    "t2t1-u10-listen-write-clothes": { label: "Listening", title: "Listen & Write · Clothes", course: "Teen2Teen 1 · Unit 10", url: "/resources/teen-2-teen/1/unit-10/games/listen-write-clothes/" },

    "t2t1-u11-abilities-flashcards": { label: "Vocabulary", title: "Abilities Flashcards", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-flashcards/" },
    "t2t1-u11-abilities-match": { label: "Vocabulary", title: "Abilities Match", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-match/" },
    "t2t1-u11-abilities-sound-match-picture": { label: "Listening", title: "Sound Match Picture · Abilities", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-sound-match-picture/" },
    "t2t1-u11-abilities-bingo": { label: "Listening", title: "Abilities Bingo", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-bingo/" },
    "t2t1-u11-abilities-unscramble": { label: "Vocabulary", title: "Unscramble Abilities", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-unscramble/" },
    "t2t1-u11-abilities-listen-write": { label: "Listening", title: "Listen & Write · Abilities", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-listen-write/" },
    "t2t1-u11-abilities-listen-choose": { label: "Listening", title: "Listen & Choose · Abilities", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-listen-choose/" },
    "t2t1-u11-abilities-listen-complete": { label: "Listening", title: "Listen & Complete · Abilities", course: "Teen2Teen 1 · Unit 11", url: "/resources/teen-2-teen/1/unit-11/games/abilities-listen-complete/" },

    "t2t1-u12-brazil-reading-check": { label: "Reading", title: "Brazil Reading Check", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/brazil-reading-check/" },
    "t2t1-u12-should-or-shouldnt": { label: "Grammar", title: "Should or Shouldn't?", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/should-or-shouldnt/" },
    "t2t1-u12-complete-the-advice": { label: "Writing", title: "Complete the Advice", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/complete-the-advice/" },
    "t2t1-u12-listening-advice": { label: "Listening", title: "Listening: Should or Shouldn't", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/listening-advice/" },
    "t2t1-u12-places-flashcards": { label: "Vocabulary", title: "Places Flashcards", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/places-flashcards/" },
    "t2t1-u12-vocab-unscramble-search": { label: "Vocabulary", title: "Unscramble & Search", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/vocab-unscramble-search/" },
    "t2t1-u12-question-words": { label: "Grammar", title: "Question Words", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/question-words/" },
    "t2t1-u12-write-the-question": { label: "Writing", title: "Write the Question", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/write-the-question/" },
    "t2t1-u12-canada-january-reading": { label: "Reading", title: "Canada in January", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/canada-january-reading/" },
    "t2t1-u12-match-advice": { label: "Grammar", title: "Match the Advice", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/match-advice/" },
    "t2t1-u12-complete-should": { label: "Writing", title: "Should or Shouldn't Writing", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/complete-should/" },
    "t2t1-u12-write-questions-answers": { label: "Writing", title: "Write Questions & Answers", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/write-questions-answers/" },
    "t2t1-u12-match-questions-answers": { label: "Grammar", title: "Match the Questions", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/match-questions-answers/" },
    "t2t1-u12-question-words-writing": { label: "Grammar", title: "What, Where, When, Who, Why", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/question-words-writing/" },
    "t2t1-u12-conversation-questions": { label: "Writing", title: "Write Questions in a Conversation", course: "Teen2Teen 1 · Unit 12", url: "/resources/teen-2-teen/1/unit-12/games/conversation-questions/" },

    // Teen 2 Teen 2
    "t2t2-u1-am-is-are": { label: "Grammar", title: "Am / Is / Are", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/am-is-are/" },
    "t2t2-u1-verb-ing": { label: "Grammar", title: "Verb + -ing", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/verb-ing/" },
    "t2t2-u1-add-ing": { label: "Grammar", title: "Add -ing", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/add-ing/" },
    "t2t2-u1-listening-verb-forms": { label: "Listening", title: "Listening: Verb Forms", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/listening-verb-forms/" },
    "t2t2-u1-listening-activities": { label: "Listening", title: "Listening: Activity & Relationship", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/listening-activities/" },
    "t2t2-u1-choose-sentence": { label: "Grammar", title: "Correct Sentence", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/choose-sentence/" },
    "t2t2-u1-picture-sentences": { label: "Grammar", title: "Picture Sentences", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/picture-sentences/" },
    "t2t2-u1-write-sentences": { label: "Grammar", title: "Write the Sentences", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/write-sentences/" },
    "t2t2-u1-voice-sentences": { label: "Grammar", title: "Speak the Sentences", course: "Teen2Teen 2 · Unit 1", url: "/resources/teen-2-teen/2/unit-01/games/voice-sentences/" },

    "t2t2-u2-daily-activities-flashcards": { label: "Vocabulary", title: "Daily Activities Flashcards", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-flashcards/" },
    "t2t2-u2-daily-activities-match": { label: "Vocabulary", title: "Daily Activities Match", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-match/" },
    "t2t2-u2-daily-activities-sound-match": { label: "Listening", title: "Sound Match Picture · Daily Activities", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-sound-match/" },
    "t2t2-u2-daily-activities-unscramble": { label: "Vocabulary", title: "Unscramble Activities", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-unscramble/" },
    "t2t2-u2-conversation-listen": { label: "Listening", title: "Conversation Listen", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/conversation-listen/" },
    "t2t2-u2-listening-comprehension": { label: "Listening", title: "Listening Comprehension", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/listening-comprehension/" },
    "t2t2-u2-listening-yes-no": { label: "Listening", title: "Listening Yes / No", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/listening-yes-no/" },
    "t2t2-u2-write-present-continuous": { label: "Writing", title: "Write Q & A", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/write-present-continuous/" },
    "t2t2-u2-be-ing-chips": { label: "Grammar", title: "Be + -ing Chips", course: "Teen2Teen 2 · Unit 2", url: "/resources/teen-2-teen/2/unit-02/games/be-ing-chips/" },

    "t2t2-u3-activities-flashcards": { label: "Vocabulary", title: "Activities Flashcards", course: "Teen2Teen 2 · Unit 3", url: "/resources/teen-2-teen/2/unit-03/games/extracurricular-flashcards/" },
    "t2t2-u3-activity-match": { label: "Vocabulary", title: "Activity Match", course: "Teen2Teen 2 · Unit 3", url: "/resources/teen-2-teen/2/unit-03/games/activity-match/" },
    "t2t2-u3-picture-choice": { label: "Vocabulary", title: "Picture Choice", course: "Teen2Teen 2 · Unit 3", url: "/resources/teen-2-teen/2/unit-03/games/picture-choice/" },
    "t2t2-u3-question-words": { label: "Grammar", title: "Question Words", course: "Teen2Teen 2 · Unit 3", url: "/resources/teen-2-teen/2/unit-03/games/question-words/" },
    "t2t2-u3-type-the-phrase": { label: "Vocabulary", title: "Type the Phrase", course: "Teen2Teen 2 · Unit 3", url: "/resources/teen-2-teen/2/unit-03/games/type-the-phrase/" },
    "t2t2-u3-unscramble-sentences": { label: "Grammar", title: "Unscramble Sentences", course: "Teen2Teen 2 · Unit 3", url: "/resources/teen-2-teen/2/unit-03/games/unscramble-sentences/" },

    // Tactics for Listening (Basic + Developing)
    "tfl-basic-u1-conversation-match": { label: "Listening", title: "Conversation Match", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/conversation-match/" },
    "tfl-basic-u1-listen-choose": { label: "Listening", title: "Listen & Choose", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-choose/" },
    "tfl-basic-u1-listen-number-pictures": { label: "Listening", title: "Listen & Number", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-number-pictures/" },
    "tfl-basic-u1-listen-predict": { label: "Listening", title: "Listen & Predict", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-predict/" },
    "tfl-basic-u1-listen-spell-names": { label: "Listening", title: "Spell the Name", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-spell-names/" },
    "tfl-basic-u1-listen-how-know": { label: "Listening", title: "How Do They Know Each Other?", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-how-know/" },
    "tfl-basic-u1-listen-gap-fill": { label: "Listening", title: "Missing Words", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-gap-fill/" },
    "tfl-basic-u1-sentence-chips": { label: "Grammar", title: "Sentence Chips", course: "Tactics for Listening · Basic U1", url: "/resources/tactics-for-listening/basic/unit-01/games/sentence-chips/" },

    "tfl-basic-u2-describe-sort": { label: "Vocabulary", title: "Describe People", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/describe-sort/" },
    "tfl-basic-u2-listen-describe": { label: "Listening", title: "Listen and Sort", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/listen-describe/" },
    "tfl-basic-u2-listen-picture": { label: "Listening", title: "Listen and Pick", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/listen-picture/" },
    "tfl-basic-u2-true-false-describe": { label: "Listening", title: "True or False", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/true-false-describe/" },
    "tfl-basic-u2-listen-number": { label: "Listening", title: "Listen and Choose a Number", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/listen-number/" },
    "tfl-basic-u2-who-is-it": { label: "Listening", title: "Who Is It?", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/who-is-it/" },
    "tfl-basic-u2-dictation-describe": { label: "Listening", title: "Dictation · Describing People", course: "Tactics for Listening · Basic U2", url: "/resources/tactics-for-listening/basic/unit-02/games/dictation-describe/" },

    "tfl-basic-u3-match-making": { label: "Vocabulary", title: "Match Making", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/match-making/" },
    "tfl-basic-u3-what-are-they-wearing": { label: "Listening", title: "What Are They Wearing?", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/what-are-they-wearing/" },
    "tfl-basic-u3-listening-for-details": { label: "Listening", title: "Listening for Details", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/listening-for-details/" },
    "tfl-basic-u3-clothes-correct-incorrect": { label: "Listening", title: "What Are They Wearing? (Check)", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/clothes-correct-incorrect/" },
    "tfl-basic-u3-what-were-they-wearing": { label: "Listening", title: "What Was Each Person Wearing?", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/what-were-they-wearing/" },
    "tfl-basic-u3-plural-s-sounds": { label: "Pronunciation", title: "Plural -s Sounds", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/plural-s-sounds/" },
    "tfl-basic-u3-dictation-party-clothes": { label: "Listening", title: "Dictation · Party Clothes", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/dictation-party-clothes/" },
    "tfl-basic-u3-clothes-definitions": { label: "Vocabulary", title: "Clothes Definitions", course: "Tactics for Listening · Basic U3", url: "/resources/tactics-for-listening/basic/unit-03/games/clothes-definitions/" },

    "tfl-basic-u4-match-the-time": { label: "Vocabulary", title: "Match the Time", course: "Tactics for Listening · Basic U4", url: "/resources/tactics-for-listening/basic/unit-04/games/match-the-time/" },
    "tfl-basic-u4-listening-for-times": { label: "Listening", title: "Listening for Times", course: "Tactics for Listening · Basic U4", url: "/resources/tactics-for-listening/basic/unit-04/games/listening-for-times/" },
    "tfl-basic-u4-get-up-go-to-bed": { label: "Listening", title: "Get Up & Go to Bed", course: "Tactics for Listening · Basic U4", url: "/resources/tactics-for-listening/basic/unit-04/games/get-up-go-to-bed/" },
    "tfl-basic-u4-morning-or-night": { label: "Listening", title: "Morning or Night?", course: "Tactics for Listening · Basic U4", url: "/resources/tactics-for-listening/basic/unit-04/games/morning-or-night/" },

    "tfl-basic-u5-dates-match": { label: "Listening", title: "Match the Dates", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/dates-match/" },
    "tfl-basic-u5-listen-arrive-leave": { label: "Listening", title: "Arrive & Leave", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/listen-arrive-leave/" },
    "tfl-basic-u5-listen-voicemail": { label: "Listening", title: "Voicemail", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/listen-voicemail/" },
    "tfl-basic-u5-voicemail-true-false": { label: "Listening", title: "True or False (Voicemail)", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/voicemail-true-false/" },
    "tfl-basic-u5-birthdays-yes-no": { label: "Listening", title: "Birthdays (Yes or No)", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/birthdays-yes-no/" },
    "tfl-basic-u5-what-they-did": { label: "Listening", title: "What They Did", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/what-they-did/" },
    "tfl-basic-u5-ordinal-numbers": { label: "Listening", title: "Ordinal Numbers", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/ordinal-numbers/" },
    "tfl-basic-u5-dictation-dates": { label: "Listening", title: "Dictation · Dates", course: "Tactics for Listening · Basic U5", url: "/resources/tactics-for-listening/basic/unit-05/games/dictation-dates/" },

    "tfl-developing-u1-listen-choose": { label: "Listening", title: "Listen & Choose", course: "Tactics for Listening · Developing U1", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-choose/" },
    "tfl-developing-u1-listen-yes-no": { label: "Listening", title: "Yes or No", course: "Tactics for Listening · Developing U1", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-yes-no/" },
    "tfl-developing-u1-listen-choose-3": { label: "Listening", title: "Listen & Choose (Details)", course: "Tactics for Listening · Developing U1", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-choose-3/" },
    "tfl-developing-u1-listen-how-was": { label: "Listening", title: "How Was the Weekend?", course: "Tactics for Listening · Developing U1", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-how-was/" },
    "tfl-developing-u1-listen-true-false": { label: "Listening", title: "True or False", course: "Tactics for Listening · Developing U1", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-true-false/" },
    "tfl-developing-u1-listen-gap-fill": { label: "Listening", title: "Missing Words", course: "Tactics for Listening · Developing U1", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-gap-fill/" },

    "tfl-developing-u5-dates-match": { label: "Listening", title: "Match the Dates", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/dates-match/" },
    "tfl-developing-u5-listen-arrive-leave": { label: "Listening", title: "Arrive & Leave", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/listen-arrive-leave/" },
    "tfl-developing-u5-listen-voicemail": { label: "Listening", title: "Voicemail", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/listen-voicemail/" },
    "tfl-developing-u5-voicemail-true-false": { label: "Listening", title: "True or False (Voicemail)", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/voicemail-true-false/" },
    "tfl-developing-u5-birthdays-yes-no": { label: "Listening", title: "Birthdays (Yes or No)", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/birthdays-yes-no/" },
    "tfl-developing-u5-what-they-did": { label: "Listening", title: "What They Did", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/what-they-did/" },
    "tfl-developing-u5-ordinal-numbers": { label: "Listening", title: "Ordinal Numbers", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/ordinal-numbers/" },
    "tfl-developing-u5-dictation-dates": { label: "Listening", title: "Dictation · Dates", course: "Tactics for Listening · Developing U5", url: "/resources/tactics-for-listening/developing/unit-05/games/dictation-dates/" },

    "tfl-developing-u16-genre-match": { label: "Vocabulary", title: "Match the Movie Genres", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/genre-match/" },
    "tfl-developing-u16-listen-genre": { label: "Listening", title: "What Kind of Movie?", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/listen-genre/" },
    "tfl-developing-u16-movie-wheel": { label: "Listening", title: "Movie Wheel", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/movie-wheel/" },
    "tfl-developing-u16-showtimes": { label: "Listening", title: "Showtimes", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/showtimes/" },
    "tfl-developing-u16-opinions": { label: "Listening", title: "Opinions", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/opinions/" },
    "tfl-developing-u16-recommend": { label: "Listening", title: "Recommend", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/recommend/" },
    "tfl-developing-u16-dictation-movies": { label: "Listening", title: "Dictation · Movies", course: "Tactics for Listening · Developing U16", url: "/resources/tactics-for-listening/developing/unit-16/games/dictation-movies/" }
  };

  function resolveAefUrl(levelKey, basePath, rawUrl) {
    var u = String(rawUrl || "");
    if (!u) return null;
    if (u.charAt(0) === "/" || u.indexOf("http") === 0) return u;
    if (u.indexOf("../") === 0) {
      return "/resources/american-english-file/" + levelKey + "/" + basePath.replace(/\/games\/?$/, "") + "/" + u.slice(3);
    }
    return "/resources/american-english-file/" + levelKey + "/" + basePath + u;
  }

  var builtWithCourseData = false;

  function buildCatalog() {
    var map = {};
    Object.keys(STATIC_META).forEach(function (k) {
      var item = STATIC_META[k];
      map[k] = {
        id: k,
        label: normalizeLabel(item.label),
        title: item.title || "",
        course: item.course || "",
        url: item.url || null,
        alias: !!item.alias
      };
    });

    var cd = null;
    try {
      if (typeof COURSE_DATA !== "undefined" && COURSE_DATA) cd = COURSE_DATA;
      else if (global.COURSE_DATA) cd = global.COURSE_DATA;
    } catch (e) {}
    builtWithCourseData = !!cd;

    if (cd && cd["american-english-file"] && cd["american-english-file"].levels) {
      var levels = cd["american-english-file"].levels;
      Object.keys(levels).forEach(function (lk) {
        var lvl = levels[lk];
        if (!lvl) return;
        var lvlName = lk === "starter" ? "AEF Starter" : ("AEF Level " + lk);
        var units = lvl.units || {};
        Object.keys(units).forEach(function (uk) {
          var u = units[uk];
          if (!u || !u.lessons) return;
          Object.keys(u.lessons).forEach(function (lesk) {
            var lesson = u.lessons[lesk];
            if (!lesson || !Array.isArray(lesson.games)) return;
            var courseTag = lvlName + " · Unit " + uk + lesk.toUpperCase();
            lesson.games.forEach(function (g) {
              var slug = String(g.url || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "game";
              var gid = [lk, uk + lesk, slug].filter(Boolean).join("-");
              var lbl = normalizeLabel(g.label);
              if (!lbl) {
                var m = String(g.title || "").match(/^(Grammar|Vocabulary|Pronunciation|Listening|Speaking|Reading|Writing|Communication)\s*[·•\-]\s*/i);
                if (m) lbl = normalizeLabel(m[1]);
              }
              var basePath = "unit-" + uk + "/" + lesk + "/games/";
              var url = resolveAefUrl(lk, basePath, g.url);
              var prev = map[gid] || {};
              map[gid] = {
                id: gid,
                label: lbl || prev.label || "",
                title: cleanTitle(g.title) || prev.title || "",
                course: prev.course || courseTag,
                url: url || prev.url || null,
                alias: false
              };
            });
          });
        });
        var peMap = lvl.practicalEnglish || {};
        Object.keys(peMap).forEach(function (pek) {
          var pe = peMap[pek];
          if (!pe || !Array.isArray(pe.games)) return;
          var peTag = lvlName + " · Practical English " + pek;
          pe.games.forEach(function (g) {
            var slug = String(g.url || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "game";
            var gid = [lk, "pe" + pek, slug].filter(Boolean).join("-");
            var lbl = normalizeLabel(g.label);
            var basePath = "practical-english-" + pek + "/games/";
            var url = resolveAefUrl(lk, basePath, g.url);
            var prev = map[gid] || {};
            map[gid] = {
              id: gid,
              label: lbl || prev.label || "",
              title: cleanTitle(g.title) || prev.title || "",
              course: prev.course || peTag,
              url: url || prev.url || null,
              alias: false
            };
          });
        });
      });
    }

    if (cd && cd["teen2teen"] && cd["teen2teen"].levels) {
      var tLevels = cd["teen2teen"].levels;
      Object.keys(tLevels).forEach(function (lk) {
        var lvl = tLevels[lk];
        if (!lvl || !lvl.units) return;
        Object.keys(lvl.units).forEach(function (uk) {
          var u = lvl.units[uk];
          if (!u || !Array.isArray(u.games)) return;
          var tTag = "Teen2Teen " + lk + " · Unit " + uk;
          u.games.forEach(function (g) {
            var slug = String(g.url || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "game";
            var gid = "t2t" + lk + "-u" + uk + "-" + slug;
            var lbl = normalizeLabel(g.label);
            var prev = map[gid] || {};
            var paddedUnit = uk.length === 1 ? "0" + uk : uk;
            var url = g.url ? "/resources/teen-2-teen/" + lk + "/unit-" + paddedUnit + "/" + g.url : null;
            map[gid] = {
              id: gid,
              label: lbl || prev.label || "",
              title: cleanTitle(g.title) || prev.title || "",
              course: prev.course || tTag,
              url: prev.url || url,
              alias: false
            };
          });
        });
      });
    }

    return map;
  }

  var CATALOG = buildCatalog();

  function ensureFreshCatalog() {
    if (!builtWithCourseData) {
      try {
        if ((typeof COURSE_DATA !== "undefined" && COURSE_DATA) || global.COURSE_DATA) {
          CATALOG = buildCatalog();
        }
      } catch (e) {}
    }
    return CATALOG;
  }

  function inferFromIdPattern(gameId) {
    var id = String(gameId || "").toLowerCase();
    if (!id) return "General";

    // Pronunciation clues
    if (
      id.indexOf("pronunciation") !== -1 ||
      id.indexOf("plural-s-") !== -1 ||
      id.indexOf("three-sounds") !== -1 ||
      id.indexOf("two-sounds") !== -1 ||
      id.indexOf("vowel-sound") !== -1 ||
      id.indexOf("different-sound") !== -1 ||
      id.indexOf("silent-letters") !== -1 ||
      id.indexOf("sound-quiz") !== -1 ||
      id.indexOf("word-stress") !== -1
    ) {
      return "Pronunciation";
    }

    // Listening clues
    if (
      id.indexOf("tfl-") === 0 ||
      id.indexOf("listening-") === 0 ||
      id.indexOf("-listening") !== -1 ||
      id.indexOf("-listen") !== -1 ||
      id.indexOf("sound-match") !== -1 ||
      id.indexOf("sound-wheel") !== -1 ||
      id.indexOf("wheel-sound") !== -1 ||
      id.indexOf("dictation") !== -1 ||
      id.indexOf("video-listening") !== -1 ||
      id.indexOf("meet-jenny") !== -1 ||
      id.indexOf("meet-rob") !== -1
    ) {
      return "Listening";
    }

    // Speaking clues
    if (
      id.indexOf("speaking-") === 0 ||
      id.indexOf("-speaking") !== -1 ||
      id.indexOf("-roleplay") !== -1 ||
      id.indexOf("-voice-") !== -1 ||
      id.indexOf("about-you") !== -1 ||
      id.indexOf("bob-city") !== -1 ||
      id.indexOf("where-is-it") !== -1
    ) {
      return "Speaking";
    }

    // Reading clues
    if (
      id.indexOf("reading-") === 0 ||
      id.indexOf("-reading") !== -1 ||
      id.indexOf("complete-the-article") !== -1 ||
      id.indexOf("who-said-it") !== -1 ||
      id.indexOf("his-job-her-job") !== -1 ||
      id.indexOf("amelias-days") !== -1
    ) {
      return "Reading";
    }

    // Writing clues
    if (
      id.indexOf("writing-") === 0 ||
      id.indexOf("-writing") !== -1 ||
      id.indexOf("-write-") !== -1 ||
      id.slice(-6) === "-write" ||
      id.indexOf("write-the-") !== -1 ||
      id.indexOf("write-questions") !== -1 ||
      id.indexOf("write-their-") !== -1 ||
      id.indexOf("email-challenge") !== -1
    ) {
      return "Writing";
    }

    // Topics / Tests
    if (id.indexOf("topics-") === 0) return "Topics";
    if (id.indexOf("aef-test") === 0 || id.indexOf("-test-") !== -1) return "Tests";

    // Vocabulary clues
    if (
      id.indexOf("vocab-") === 0 ||
      id.indexOf("flashcards") !== -1 ||
      id.indexOf("match-rush") !== -1 ||
      id.indexOf("opposite-snap") !== -1 ||
      id.indexOf("-match") !== -1 ||
      id.indexOf("match-") !== -1 ||
      id.indexOf("unscramble") !== -1 ||
      id.indexOf("-bingo") !== -1 ||
      id.indexOf("memory") !== -1 ||
      id.indexOf("spelling") !== -1 ||
      id.indexOf("crossword") !== -1 ||
      id.indexOf("adjectives") !== -1 ||
      id.indexOf("clothes-") !== -1 ||
      id.indexOf("color-") !== -1 ||
      id.indexOf("food-") !== -1 ||
      id.indexOf("places-") !== -1 ||
      id.indexOf("jobs-") !== -1 ||
      id.indexOf("family-tree") !== -1 ||
      id.indexOf("people-words") !== -1 ||
      id.indexOf("clock-") !== -1 ||
      id.indexOf("numbers") !== -1
    ) {
      return "Vocabulary";
    }

    // Grammar clues
    if (
      id.indexOf("grammar-") === 0 ||
      id.indexOf("sentences") !== -1 ||
      id.indexOf("question") !== -1 ||
      id.indexOf("pronouns") !== -1 ||
      id.indexOf("possessive") !== -1 ||
      id.indexOf("am-is-are") !== -1 ||
      id.indexOf("verb-ing") !== -1 ||
      id.indexOf("add-ing") !== -1 ||
      id.indexOf("do-or-does") !== -1 ||
      id.indexOf("going-to") !== -1 ||
      id.indexOf("superlatives") !== -1 ||
      id.indexOf("be-i-you") !== -1 ||
      id.indexOf("a-an-") !== -1 ||
      id.indexOf("this-that") !== -1 ||
      id.indexOf("should-") !== -1 ||
      id.indexOf("dialogue-completer") !== -1 ||
      id.indexOf("complete-conversation") !== -1 ||
      id.indexOf("circle-the-article") !== -1 ||
      id.indexOf("the-or-no-the") !== -1 ||
      id.indexOf("adj-adv") !== -1
    ) {
      return "Grammar";
    }

    return "General";
  }

  function getMeta(gameId) {
    var cat = ensureFreshCatalog();
    var key = String(gameId || "");
    if (cat[key]) return cat[key];
    var low = key.toLowerCase();
    return cat[low] || null;
  }

  function inferCategory(gameId, explicitCategory) {
    var meta = getMeta(gameId);
    if (meta && meta.label) return meta.label;
    var normExplicit = normalizeLabel(explicitCategory);
    if (normExplicit) return normExplicit;
    return inferFromIdPattern(gameId);
  }

  function getTitle(gameId, fallbackName) {
    var meta = getMeta(gameId);
    if (meta && meta.title) return meta.title;
    if (fallbackName && String(fallbackName).trim()) return cleanTitle(fallbackName);
    return String(gameId || "Game")
      .replace(/^(starter|t2t\d+|tfl-(?:basic|developing)|1)-\d*[a-z]?\d*-/i, "")
      .replace(/^(starter-pe\d+|vocab|writing|grammar|listening|speaking|reading|topics)-/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function getUrl(gameId) {
    var meta = getMeta(gameId);
    return (meta && meta.url) || null;
  }

  function getCourse(gameId) {
    var meta = getMeta(gameId);
    if (meta && meta.course) return meta.course;
    var id = String(gameId || "").toLowerCase();
    if (id.indexOf("starter-") === 0) return "AEF Starter";
    if (id.indexOf("1-") === 0) return "AEF Level 1";
    if (id.indexOf("t2t1-") === 0) return "Teen2Teen 1";
    if (id.indexOf("t2t2-") === 0) return "Teen2Teen 2";
    if (id.indexOf("tfl-basic-") === 0) return "Tactics for Listening · Basic";
    if (id.indexOf("tfl-developing-") === 0) return "Tactics for Listening · Developing";
    return "Learning Arcade";
  }

  function getAll() {
    var cat = ensureFreshCatalog();
    var list = [];
    var seenUrls = {};
    Object.keys(cat).forEach(function (id) {
      var item = cat[id];
      if (!item || item.alias || !item.url) return;
      var normUrl = String(item.url).replace(/\/index\.html$/i, "/");
      if (seenUrls[normUrl]) return;
      seenUrls[normUrl] = true;
      list.push({
        id: id,
        title: getTitle(id, item.title),
        label: item.label || inferFromIdPattern(id),
        course: item.course || getCourse(id),
        url: item.url
      });
    });
    return list;
  }

  global.LASkillCatalog = {
    normalizeLabel: normalizeLabel,
    inferCategory: inferCategory,
    getMeta: getMeta,
    getTitle: getTitle,
    getUrl: getUrl,
    getCourse: getCourse,
    getAll: getAll,
    rebuild: function () { builtWithCourseData = false; return ensureFreshCatalog(); }
  };
})(typeof window !== "undefined" ? window : this);
