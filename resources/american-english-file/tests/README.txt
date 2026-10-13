TESTS & EXAMS – upgrade notes
==============================
Shared files (new):  tests/assets/tests-ui.css   tests/assets/tests-ui.js
Every page links them AFTER its own styles, so nothing else on the site is touched.

1) Design
   - Unit cards (tests/index.html): big unit numbers, colour groups, activity chips, staggered entrance.
   - Unit hubs (unit-10, unit-11): hero banner + games grouped into Grammar / Vocabulary / Pronunciation, new game cards.
   - Game pages: raised word chips, rounder cards, 3D buttons, clearer inputs, mobile-first sizing, dark-mode rules.
2) Sound effects (Web Audio, no files): tap, pick, soft key tick, gentle chime for checks, fanfare when all are right.
   A speaker button (top right) mutes/unmutes and remembers the choice.
3) Not competitive: no scores-as-rank, no stars, no timers, no records. Progress bar shows "x of y answered".
   Results now read "You got 5 of 6" with encouraging titles; wrong answers show in warm amber, not red.
4) Sentences replaced (grammar games only, same goal, same answer logic):
   unit-10: Complete the email, Superlatives, Going to + verbs
   unit-11: Articles, Infinitive with to, Adjective or adverb?, Verb + to
   Vocabulary / pronunciation games keep their original content (restyled only).
