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
    "be-verbs": { label: "Grammar", title: "Be Verbs", url: "/learningarcade/grammar/be-verbs/" },
    "grammar-be": { label: "Grammar", title: "Be Verbs", url: "/learningarcade/grammar/be-verbs/" },
    "nouns": { label: "Grammar", title: "Nouns", url: "/learningarcade/grammar/nouns/" },
    "there-is-there-are": { label: "Grammar", title: "There is / are", url: "/learningarcade/grammar/there-is-there-are/" },
    "simple-present": { label: "Grammar", title: "Simple Present", url: "/learningarcade/grammar/simple-present/" },
    "simple-past": { label: "Grammar", title: "Simple Past", url: "/learningarcade/grammar/simple-past/" },
    "present-perfect": { label: "Grammar", title: "Present Perfect", url: "/learningarcade/grammar/present-perfect/" },
    "grammar-phrasal-verbs": { label: "Grammar", title: "Phrasal Verbs", url: "/learningarcade/grammar/phrasal-verbs/" },
    "grammar-how-much-how-many": { label: "Grammar", title: "How Much / How Many", url: "/learningarcade/grammar/how-much-how-many/" },
    "grammar-battle": { label: "Grammar", title: "Grammar Battle", url: "/learningarcade/grammar/grammar-battle/" },
    "grammar-wh-questions": { label: "Grammar", title: "Wh- Questions", url: "/learningarcade/grammar/wh-questions/" },
    "wh-questions": { label: "Grammar", title: "Wh- Questions", url: "/learningarcade/grammar/wh-questions/" },
    "grammar-wh-meaning": { label: "Grammar", title: "Wh- Question Meaning", url: "/learningarcade/grammar/wh-question-meaning/" },
    "wh-question-meaning": { label: "Grammar", title: "Wh- Question Meaning", url: "/learningarcade/grammar/wh-question-meaning/" },
    "daily-routines": { label: "Grammar", title: "Daily Routines", url: "/learningarcade/grammar/daily-routines/" },
    "third-person-switch": { label: "Grammar", title: "Third Person Switch", url: "/learningarcade/grammar/third-person-switch/" },
    "grammar-possessives-match": { label: "Grammar", title: "Possessives Match", url: "/resources/american-english-file/starter/unit-4/a/games/possessives-2/" },

    "opposite-snap": { label: "Vocabulary", title: "Opposite Snap", url: "/learningarcade/vocabulary/Adjectives/Opposite_Snap/" },
    "sound-match-picture": { label: "Listening", title: "Sound Match", url: "/learningarcade/vocabulary/Adjectives/Sound_Match_Picture/" },
    "match-rush": { label: "Vocabulary", title: "Match Rush", url: "/learningarcade/vocabulary/match-rush/" },
    "vocab-match-rush": { label: "Vocabulary", title: "Match Rush", url: "/learningarcade/vocabulary/match-rush/" },
    "vocab-clothes-voice-hunt": { label: "Vocabulary", title: "Voice Hunt", url: "/learningarcade/vocabulary/clothes/voice-treasure-hunt/" },
    "vocab-clothes-match": { label: "Vocabulary", title: "Clothes Match", url: "/learningarcade/vocabulary/clothes/match/" },
    "vocab-clothes-dictation": { label: "Listening", title: "Clothes Dictation", url: "/learningarcade/vocabulary/clothes/dictation/" },

    "writing-sara-daily": { label: "Writing", title: "Sara's Routine", url: "/learningarcade/writing/Daily%20Routine/Sara/" },
    "writing-personal-info": { label: "Writing", title: "Personal Info", url: "/learningarcade/writing/" },
    "writing-conversation-questions": { label: "Writing", title: "Conversation Questions", url: "/learningarcade/writing/" },

    "speaking-supermarket": { label: "Speaking", title: "Supermarket Roleplay", url: "/learningarcade/speaking/" },
    "speaking-how-much-how-many": { label: "Speaking", title: "How Much / How Many Speaking", url: "/learningarcade/grammar/how-much-how-many/" },

    // AEF Starter entries without explicit label in course-data.js
    "starter-4a-family-tree": { label: "Vocabulary", title: "Family Tree" },
    "starter-4a-match-rush": { label: "Vocabulary", title: "Family Match Rush" },
    "starter-4a-people-words": { label: "Vocabulary", title: "People Words" },
    "starter-4b-opposite-snap": { label: "Vocabulary", title: "Opposite Snap" },
    "starter-4b-match-adjectives": { label: "Vocabulary", title: "Match Adjectives" },
    "starter-4b-sound-match-picture": { label: "Listening", title: "Sound Match Picture" },
    "starter-4b-listen-and-write": { label: "Listening", title: "Listen and Write" },
    "starter-4b-adjective-sentences": { label: "Grammar", title: "Adjective Sentences" },
    "starter-7a-free-time-flashcards": { label: "Vocabulary", title: "Free-Time Flashcards" },
    "starter-7a-free-time-match": { label: "Vocabulary", title: "Free-Time Match" },
    "starter-7a-free-time-listen-write": { label: "Listening", title: "Free-Time Listen & Write" },
    "starter-7a-question-builder": { label: "Grammar", title: "Question Builder" },
    "starter-7a-build-the-question": { label: "Grammar", title: "Build the Question" },
    "starter-7a-amelias-days": { label: "Reading", title: "Amelia's Days" },
    "starter-7b-subject-object-pronouns": { label: "Grammar", title: "Subject vs Object Pronouns" },
    "starter-7b-pronouns-sentences": { label: "Grammar", title: "Subject vs Object · Sentences" },
    "starter-7b-pronouns-words": { label: "Grammar", title: "Subject vs Object · Words" },
    "starter-9a-listen-and-write": { label: "Listening", title: "Listen & Write" },

    // Teen 2 Teen 1
    "t2t1-u07-home-flashcards": { label: "Vocabulary", title: "Home Flashcards", url: "/resources/teen-2-teen/1/unit-07/games/home-flashcards/" },
    "t2t1-u07-home-spelling": { label: "Vocabulary", title: "Home Spelling", url: "/resources/teen-2-teen/1/unit-07/games/home-spelling/" },

    "t2t1-u10-clothes-flashcards": { label: "Vocabulary", title: "Clothes Flashcards", url: "/resources/teen-2-teen/1/unit-10/games/clothes-flashcards/" },
    "t2t1-u10-color-flashcards": { label: "Vocabulary", title: "Color Flashcards", url: "/resources/teen-2-teen/1/unit-10/games/color-flashcards/" },
    "t2t1-u10-color-match": { label: "Vocabulary", title: "Color Match", url: "/resources/teen-2-teen/1/unit-10/games/color-match/" },
    "t2t1-u10-clothes-match": { label: "Vocabulary", title: "Clothes Match", url: "/resources/teen-2-teen/1/unit-10/games/clothes-match/" },
    "t2t1-u10-clothes-a-no-a": { label: "Vocabulary", title: "A / No A", url: "/resources/teen-2-teen/1/unit-10/games/clothes-a-no-a/" },
    "t2t1-u10-clothes-sound-match-picture": { label: "Listening", title: "Sound Match Picture · Clothes", url: "/resources/teen-2-teen/1/unit-10/games/clothes-sound-match-picture/" },
    "t2t1-u10-color-sound-match-picture": { label: "Listening", title: "Sound Match Picture · Colors", url: "/resources/teen-2-teen/1/unit-10/games/color-sound-match-picture/" },
    "t2t1-u10-plural-s-sound-match": { label: "Pronunciation", title: "Plural -s Sound Match", url: "/resources/teen-2-teen/1/unit-10/games/plural-s-sound-match/" },
    "t2t1-u10-clothes-bingo": { label: "Listening", title: "Clothes Bingo", url: "/resources/teen-2-teen/1/unit-10/games/clothes-bingo/" },
    "t2t1-u10-unscramble-clothes": { label: "Vocabulary", title: "Unscramble Clothes", url: "/resources/teen-2-teen/1/unit-10/games/unscramble-clothes/" },
    "t2t1-u10-listen-write-clothes": { label: "Listening", title: "Listen & Write", url: "/resources/teen-2-teen/1/unit-10/games/listen-write-clothes/" },

    "t2t1-u11-abilities-flashcards": { label: "Vocabulary", title: "Abilities Flashcards", url: "/resources/teen-2-teen/1/unit-11/games/abilities-flashcards/" },
    "t2t1-u11-abilities-match": { label: "Vocabulary", title: "Abilities Match", url: "/resources/teen-2-teen/1/unit-11/games/abilities-match/" },
    "t2t1-u11-abilities-sound-match-picture": { label: "Listening", title: "Sound Match Picture · Abilities", url: "/resources/teen-2-teen/1/unit-11/games/abilities-sound-match-picture/" },
    "t2t1-u11-abilities-bingo": { label: "Listening", title: "Abilities Bingo", url: "/resources/teen-2-teen/1/unit-11/games/abilities-bingo/" },
    "t2t1-u11-abilities-unscramble": { label: "Vocabulary", title: "Unscramble Abilities", url: "/resources/teen-2-teen/1/unit-11/games/abilities-unscramble/" },
    "t2t1-u11-abilities-listen-write": { label: "Listening", title: "Listen & Write", url: "/resources/teen-2-teen/1/unit-11/games/abilities-listen-write/" },
    "t2t1-u11-abilities-listen-choose": { label: "Listening", title: "Listen & Choose", url: "/resources/teen-2-teen/1/unit-11/games/abilities-listen-choose/" },
    "t2t1-u11-abilities-listen-complete": { label: "Listening", title: "Listen & Complete", url: "/resources/teen-2-teen/1/unit-11/games/abilities-listen-complete/" },

    "t2t1-u12-brazil-reading-check": { label: "Reading", title: "Brazil Reading Check", url: "/resources/teen-2-teen/1/unit-12/games/brazil-reading-check/" },
    "t2t1-u12-should-or-shouldnt": { label: "Grammar", title: "Should or Shouldn't?", url: "/resources/teen-2-teen/1/unit-12/games/should-or-shouldnt/" },
    "t2t1-u12-complete-the-advice": { label: "Writing", title: "Complete the Advice", url: "/resources/teen-2-teen/1/unit-12/games/complete-the-advice/" },
    "t2t1-u12-listening-advice": { label: "Listening", title: "Listening: Should or Shouldn't", url: "/resources/teen-2-teen/1/unit-12/games/listening-advice/" },
    "t2t1-u12-places-flashcards": { label: "Vocabulary", title: "Places Flashcards", url: "/resources/teen-2-teen/1/unit-12/games/places-flashcards/" },
    "t2t1-u12-vocab-unscramble-search": { label: "Vocabulary", title: "Unscramble & Search", url: "/resources/teen-2-teen/1/unit-12/games/vocab-unscramble-search/" },
    "t2t1-u12-question-words": { label: "Grammar", title: "Question Words", url: "/resources/teen-2-teen/1/unit-12/games/question-words/" },
    "t2t1-u12-write-the-question": { label: "Writing", title: "Write the Question", url: "/resources/teen-2-teen/1/unit-12/games/write-the-question/" },
    "t2t1-u12-canada-january-reading": { label: "Reading", title: "Canada in January", url: "/resources/teen-2-teen/1/unit-12/games/canada-january-reading/" },
    "t2t1-u12-match-advice": { label: "Grammar", title: "Match the Advice", url: "/resources/teen-2-teen/1/unit-12/games/match-advice/" },
    "t2t1-u12-complete-should": { label: "Writing", title: "Should or Shouldn't Writing", url: "/resources/teen-2-teen/1/unit-12/games/complete-should/" },
    "t2t1-u12-write-questions-answers": { label: "Writing", title: "Write Questions & Answers", url: "/resources/teen-2-teen/1/unit-12/games/write-questions-answers/" },
    "t2t1-u12-match-questions-answers": { label: "Grammar", title: "Match the Questions", url: "/resources/teen-2-teen/1/unit-12/games/match-questions-answers/" },
    "t2t1-u12-question-words-writing": { label: "Grammar", title: "What, Where, When, Who, Why", url: "/resources/teen-2-teen/1/unit-12/games/question-words-writing/" },
    "t2t1-u12-conversation-questions": { label: "Writing", title: "Write Questions in a Conversation", url: "/resources/teen-2-teen/1/unit-12/games/conversation-questions/" },

    // Teen 2 Teen 2
    "t2t2-u1-am-is-are": { label: "Grammar", title: "Am / Is / Are", url: "/resources/teen-2-teen/2/unit-01/games/am-is-are/" },
    "t2t2-u1-verb-ing": { label: "Grammar", title: "Verb + -ing", url: "/resources/teen-2-teen/2/unit-01/games/verb-ing/" },
    "t2t2-u1-add-ing": { label: "Grammar", title: "Add -ing", url: "/resources/teen-2-teen/2/unit-01/games/add-ing/" },
    "t2t2-u1-listening-verb-forms": { label: "Listening", title: "Listening: Verb Forms", url: "/resources/teen-2-teen/2/unit-01/games/listening-verb-forms/" },
    "t2t2-u1-listening-activities": { label: "Listening", title: "Listening: Activity & Relationship", url: "/resources/teen-2-teen/2/unit-01/games/listening-activities/" },
    "t2t2-u1-choose-sentence": { label: "Grammar", title: "Correct Sentence", url: "/resources/teen-2-teen/2/unit-01/games/choose-sentence/" },
    "t2t2-u1-picture-sentences": { label: "Grammar", title: "Picture Sentences", url: "/resources/teen-2-teen/2/unit-01/games/picture-sentences/" },
    "t2t2-u1-write-sentences": { label: "Grammar", title: "Write the Sentences", url: "/resources/teen-2-teen/2/unit-01/games/write-sentences/" },
    "t2t2-u1-voice-sentences": { label: "Grammar", title: "Speak the Sentences", url: "/resources/teen-2-teen/2/unit-01/games/voice-sentences/" },

    "t2t2-u2-daily-activities-flashcards": { label: "Vocabulary", title: "Daily Activities Flashcards", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-flashcards/" },
    "t2t2-u2-daily-activities-match": { label: "Vocabulary", title: "Daily Activities Match", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-match/" },
    "t2t2-u2-daily-activities-sound-match": { label: "Listening", title: "Sound Match Picture", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-sound-match/" },
    "t2t2-u2-daily-activities-unscramble": { label: "Vocabulary", title: "Unscramble Activities", url: "/resources/teen-2-teen/2/unit-02/games/daily-activities-unscramble/" },
    "t2t2-u2-conversation-listen": { label: "Listening", title: "Conversation Listen", url: "/resources/teen-2-teen/2/unit-02/games/conversation-listen/" },
    "t2t2-u2-listening-comprehension": { label: "Listening", title: "Listening Comprehension", url: "/resources/teen-2-teen/2/unit-02/games/listening-comprehension/" },
    "t2t2-u2-listening-yes-no": { label: "Listening", title: "Listening Yes / No", url: "/resources/teen-2-teen/2/unit-02/games/listening-yes-no/" },
    "t2t2-u2-write-present-continuous": { label: "Writing", title: "Write Q & A", url: "/resources/teen-2-teen/2/unit-02/games/write-present-continuous/" },
    "t2t2-u2-be-ing-chips": { label: "Grammar", title: "Be + -ing Chips", url: "/resources/teen-2-teen/2/unit-02/games/be-ing-chips/" },

    "t2t2-u3-activities-flashcards": { label: "Vocabulary", title: "Activities Flashcards", url: "/resources/teen-2-teen/2/unit-03/games/extracurricular-flashcards/" },
    "t2t2-u3-picture-choice": { label: "Vocabulary", title: "Picture Choice", url: "/resources/teen-2-teen/2/unit-03/games/picture-choice/" },
    "t2t2-u3-type-the-phrase": { label: "Vocabulary", title: "Type the Phrase", url: "/resources/teen-2-teen/2/unit-03/games/type-the-phrase/" },

    // Tactics for Listening (Basic + Developing)
    "tfl-basic-u1-conversation-match": { label: "Listening", title: "Conversation Match", url: "/resources/tactics-for-listening/basic/unit-01/games/conversation-match/" },
    "tfl-basic-u1-listen-choose": { label: "Listening", title: "Listen & Choose", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-choose/" },
    "tfl-basic-u1-listen-number-pictures": { label: "Listening", title: "Listen & Number", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-number-pictures/" },
    "tfl-basic-u1-listen-predict": { label: "Listening", title: "Listen & Predict", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-predict/" },
    "tfl-basic-u1-listen-spell-names": { label: "Listening", title: "Spell the Name", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-spell-names/" },
    "tfl-basic-u1-listen-how-know": { label: "Listening", title: "How Do They Know Each Other?", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-how-know/" },
    "tfl-basic-u1-listen-gap-fill": { label: "Listening", title: "Missing Words", url: "/resources/tactics-for-listening/basic/unit-01/games/listen-gap-fill/" },

    "tfl-basic-u2-describe-sort": { label: "Vocabulary", title: "Describe People", url: "/resources/tactics-for-listening/basic/unit-02/games/describe-sort/" },
    "tfl-basic-u2-listen-describe": { label: "Listening", title: "Listen and Sort", url: "/resources/tactics-for-listening/basic/unit-02/games/listen-describe/" },
    "tfl-basic-u2-listen-picture": { label: "Listening", title: "Listen and Pick", url: "/resources/tactics-for-listening/basic/unit-02/games/listen-picture/" },
    "tfl-basic-u2-true-false-describe": { label: "Listening", title: "True or False", url: "/resources/tactics-for-listening/basic/unit-02/games/true-false-describe/" },
    "tfl-basic-u2-listen-number": { label: "Listening", title: "Listen and Choose a Number", url: "/resources/tactics-for-listening/basic/unit-02/games/listen-number/" },
    "tfl-basic-u2-who-is-it": { label: "Listening", title: "Who Is It?", url: "/resources/tactics-for-listening/basic/unit-02/games/who-is-it/" },
    "tfl-basic-u2-dictation-describe": { label: "Listening", title: "Dictation", url: "/resources/tactics-for-listening/basic/unit-02/games/dictation-describe/" },

    "tfl-basic-u3-match-making": { label: "Vocabulary", title: "Match Making", url: "/resources/tactics-for-listening/basic/unit-03/games/match-making/" },
    "tfl-basic-u3-what-are-they-wearing": { label: "Listening", title: "What Are They Wearing?", url: "/resources/tactics-for-listening/basic/unit-03/games/what-are-they-wearing/" },
    "tfl-basic-u3-listening-for-details": { label: "Listening", title: "Listening for Details", url: "/resources/tactics-for-listening/basic/unit-03/games/listening-for-details/" },
    "tfl-basic-u3-clothes-correct-incorrect": { label: "Listening", title: "What are they wearing?", url: "/resources/tactics-for-listening/basic/unit-03/games/clothes-correct-incorrect/" },
    "tfl-basic-u3-what-were-they-wearing": { label: "Listening", title: "What was each person wearing?", url: "/resources/tactics-for-listening/basic/unit-03/games/what-were-they-wearing/" },
    "tfl-basic-u3-plural-s-sounds": { label: "Pronunciation", title: "Plural -s sounds", url: "/resources/tactics-for-listening/basic/unit-03/games/plural-s-sounds/" },
    "tfl-basic-u3-dictation-party-clothes": { label: "Listening", title: "Dictation", url: "/resources/tactics-for-listening/basic/unit-03/games/dictation-party-clothes/" },
    "tfl-basic-u3-clothes-definitions": { label: "Vocabulary", title: "Clothes definitions", url: "/resources/tactics-for-listening/basic/unit-03/games/clothes-definitions/" },

    "tfl-basic-u4-match-the-time": { label: "Vocabulary", title: "Match the time", url: "/resources/tactics-for-listening/basic/unit-04/games/match-the-time/" },
    "tfl-basic-u4-listening-for-times": { label: "Listening", title: "Listening for times", url: "/resources/tactics-for-listening/basic/unit-04/games/listening-for-times/" },
    "tfl-basic-u4-get-up-go-to-bed": { label: "Listening", title: "Get up & go to bed", url: "/resources/tactics-for-listening/basic/unit-04/games/get-up-go-to-bed/" },
    "tfl-basic-u4-morning-or-night": { label: "Listening", title: "Morning or night?", url: "/resources/tactics-for-listening/basic/unit-04/games/morning-or-night/" },

    "tfl-developing-u1-listen-choose": { label: "Listening", title: "Listen & Choose", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-choose/" },
    "tfl-developing-u1-listen-yes-no": { label: "Listening", title: "Yes or No", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-yes-no/" },
    "tfl-developing-u1-listen-choose-3": { label: "Listening", title: "Listen & Choose (Details)", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-choose-3/" },
    "tfl-developing-u1-listen-how-was": { label: "Listening", title: "How was the weekend?", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-how-was/" },
    "tfl-developing-u1-listen-true-false": { label: "Listening", title: "True or False", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-true-false/" },
    "tfl-developing-u1-listen-gap-fill": { label: "Listening", title: "Missing Words", url: "/resources/tactics-for-listening/developing/unit-01/games/listen-gap-fill/" },

    "tfl-developing-u5-dates-match": { label: "Listening", title: "Match the dates", url: "/resources/tactics-for-listening/developing/unit-05/games/dates-match/" },
    "tfl-developing-u5-listen-arrive-leave": { label: "Listening", title: "Arrive & Leave", url: "/resources/tactics-for-listening/developing/unit-05/games/listen-arrive-leave/" },
    "tfl-developing-u5-listen-voicemail": { label: "Listening", title: "Voicemail", url: "/resources/tactics-for-listening/developing/unit-05/games/listen-voicemail/" },
    "tfl-developing-u5-voicemail-true-false": { label: "Listening", title: "True or False (voicemail)", url: "/resources/tactics-for-listening/developing/unit-05/games/voicemail-true-false/" },
    "tfl-developing-u5-birthdays-yes-no": { label: "Listening", title: "Birthdays (Yes or No)", url: "/resources/tactics-for-listening/developing/unit-05/games/birthdays-yes-no/" },
    "tfl-developing-u5-what-they-did": { label: "Listening", title: "What they did", url: "/resources/tactics-for-listening/developing/unit-05/games/what-they-did/" },
    "tfl-developing-u5-ordinal-numbers": { label: "Listening", title: "Ordinal numbers", url: "/resources/tactics-for-listening/developing/unit-05/games/ordinal-numbers/" },
    "tfl-developing-u5-dictation-dates": { label: "Listening", title: "Dictation (dates)", url: "/resources/tactics-for-listening/developing/unit-05/games/dictation-dates/" },

    "tfl-developing-u16-genre-match": { label: "Vocabulary", title: "Match the movie genres", url: "/resources/tactics-for-listening/developing/unit-16/games/genre-match/" },
    "tfl-developing-u16-listen-genre": { label: "Listening", title: "What kind of movie?", url: "/resources/tactics-for-listening/developing/unit-16/games/listen-genre/" },
    "tfl-developing-u16-movie-wheel": { label: "Listening", title: "Movie Wheel", url: "/resources/tactics-for-listening/developing/unit-16/games/movie-wheel/" },
    "tfl-developing-u16-showtimes": { label: "Listening", title: "Showtimes", url: "/resources/tactics-for-listening/developing/unit-16/games/showtimes/" },
    "tfl-developing-u16-opinions": { label: "Listening", title: "Opinions", url: "/resources/tactics-for-listening/developing/unit-16/games/opinions/" },
    "tfl-developing-u16-recommend": { label: "Listening", title: "Recommend", url: "/resources/tactics-for-listening/developing/unit-16/games/recommend/" },
    "tfl-developing-u16-dictation-movies": { label: "Listening", title: "Dictation", url: "/resources/tactics-for-listening/developing/unit-16/games/dictation-movies/" }
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

  function buildCatalog() {
    var map = {};
    Object.keys(STATIC_META).forEach(function (k) {
      var item = STATIC_META[k];
      map[k] = {
        label: normalizeLabel(item.label),
        title: item.title || "",
        url: item.url || null
      };
    });

    var cd = null;
    try {
      if (typeof COURSE_DATA !== "undefined" && COURSE_DATA) cd = COURSE_DATA;
      else if (global.COURSE_DATA) cd = global.COURSE_DATA;
    } catch (e) {}

    if (cd && cd["american-english-file"] && cd["american-english-file"].levels) {
      var levels = cd["american-english-file"].levels;
      Object.keys(levels).forEach(function (lk) {
        var lvl = levels[lk];
        if (!lvl) return;
        var units = lvl.units || {};
        Object.keys(units).forEach(function (uk) {
          var u = units[uk];
          if (!u || !u.lessons) return;
          Object.keys(u.lessons).forEach(function (lesk) {
            var lesson = u.lessons[lesk];
            if (!lesson || !Array.isArray(lesson.games)) return;
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
                label: lbl || prev.label || "",
                title: cleanTitle(g.title) || prev.title || "",
                url: url || prev.url || null
              };
            });
          });
        });
        var peMap = lvl.practicalEnglish || {};
        Object.keys(peMap).forEach(function (pek) {
          var pe = peMap[pek];
          if (!pe || !Array.isArray(pe.games)) return;
          pe.games.forEach(function (g) {
            var slug = String(g.url || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "game";
            var gid = [lk, "pe" + pek, slug].filter(Boolean).join("-");
            var lbl = normalizeLabel(g.label);
            var basePath = "practical-english-" + pek + "/games/";
            var url = resolveAefUrl(lk, basePath, g.url);
            var prev = map[gid] || {};
            map[gid] = {
              label: lbl || prev.label || "",
              title: cleanTitle(g.title) || prev.title || "",
              url: url || prev.url || null
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
          u.games.forEach(function (g) {
            var slug = String(g.url || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "game";
            var gid = "t2t" + lk + "-u" + uk + "-" + slug;
            var lbl = normalizeLabel(g.label);
            var prev = map[gid] || {};
            var paddedUnit = uk.length === 1 ? "0" + uk : uk;
            var url = g.url ? "/resources/teen-2-teen/" + lk + "/unit-" + paddedUnit + "/" + g.url : null;
            map[gid] = {
              label: lbl || prev.label || "",
              title: cleanTitle(g.title) || prev.title || "",
              url: prev.url || url
            };
          });
        });
      });
    }

    return map;
  }

  var CATALOG = buildCatalog();

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
    var key = String(gameId || "");
    if (CATALOG[key]) return CATALOG[key];
    var low = key.toLowerCase();
    return CATALOG[low] || null;
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

  global.LASkillCatalog = {
    normalizeLabel: normalizeLabel,
    inferCategory: inferCategory,
    getMeta: getMeta,
    getTitle: getTitle,
    getUrl: getUrl
  };
})(typeof window !== "undefined" ? window : this);
