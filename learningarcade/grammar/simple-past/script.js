/* =========================================================
   SIMPLE PAST — FIXED QUESTION BANK VERSION
   Mr. Sheyhaki's Learning Arcade

   Was / Were
   There was / There were
   Regular Verbs
   Irregular Verbs
   Wh- Questions
   -ed Pronunciation
   Match Rush
   ========================================================= */

(function () {
  "use strict";

  const TOTAL = 10;

  /* =========================================================
     HELPER FUNCTIONS
     ========================================================= */

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const copy = arr.slice();

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  /*
    Pick TOTAL questions without repeating a question
    inside the same round.
  */
  function makeRound(bank) {
    return shuffle(bank).slice(
      0,
      Math.min(TOTAL, bank.length)
    );
  }

  /* =========================================================
     WAS / WERE — LEVEL 1
     Fixed sentences
     ========================================================= */

  const WAS_WERE_LEVEL_1 = [

    {
      prompt: "I ____ at home last night.",
      choices: ["was", "were", "are"],
      answer: "was"
    },

    {
      prompt: "They ____ at the hotel last weekend.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "Sara ____ at the supermarket on Saturday.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "We ____ very tired after work.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "Tom ____ at the airport this morning.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "My parents ____ at a restaurant on Friday.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "She ____ in the kitchen before dinner.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "The children ____ in the park after school.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "He ____ at work on Monday morning.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "You ____ very busy yesterday afternoon.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "My sister ____ at the cinema last night.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "We ____ in the living room after dinner.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "The hotel ____ very quiet at night.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "The rooms ____ clean and comfortable.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "I ____ at the bus station in the morning.",
      choices: ["was", "were", "am"],
      answer: "was"
    },

    {
      prompt: "My friends ____ at my house on Friday evening.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "The restaurant ____ very busy at lunchtime.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "There ____ a lot of people at the concert.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "Anna ____ sick last week.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "We ____ late for the train.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "The weather ____ cold on Sunday.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "My brothers ____ at school in the morning.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "I ____ nervous before the exam.",
      choices: ["was", "were", "am"],
      answer: "was"
    },

    {
      prompt: "The movie ____ very interesting.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "You ____ at the office all morning.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "The students ____ in the classroom after lunch.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "My phone ____ on the table.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "The keys ____ in my bag.",
      choices: ["was", "were", "are"],
      answer: "were"
    },

    {
      prompt: "He ____ at the doctor's office yesterday morning.",
      choices: ["was", "were", "is"],
      answer: "was"
    },

    {
      prompt: "We ____ happy with the hotel.",
      choices: ["was", "were", "are"],
      answer: "were"
    }

  ];

  /* =========================================================
     THERE WAS / THERE WERE — LEVEL 2
     Hotel / house / apartment vocabulary
     ========================================================= */

  const THERE_WAS_WERE = [

    {
      prompt: "____ a large bed in the hotel room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two towels in the bathroom.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a TV in the living room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ three bedrooms in the house.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a small table next to the bed.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ four chairs around the kitchen table.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a shower in the bathroom.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two beds in the hotel room.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a sofa near the window.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ some cups in the kitchen.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a lamp next to the sofa.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two pictures on the bedroom wall.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a fridge in the kitchen.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ some books on the shelf.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a balcony at the hotel.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ five rooms in the house.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a mirror above the bathroom sink.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two bathrooms in the apartment.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a swimming pool at the hotel.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ many guests in the hotel.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a dining table in the apartment.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ six windows in the house.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a washing machine in the bathroom.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two armchairs in the living room.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a coffee machine in the hotel room.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ clean sheets on the bed.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a small garden behind the house.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ two lamps in the bedroom.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    },

    {
      prompt: "____ a wardrobe next to the bed.",
      choices: ["There was", "There were", "There is"],
      answer: "There was"
    },

    {
      prompt: "____ three bathrooms in the hotel.",
      choices: ["There was", "There were", "There is"],
      answer: "There were"
    }

  ];

  /* =========================================================
     WAS / WERE — WH QUESTIONS — LEVEL 3
     Full natural sentences
     ========================================================= */

  const WAS_WERE_WH = [

    {
      prompt: "Where ____ you after work on Friday?",
      choices: [
        "Where were you after work on Friday?",
        "Where was you after work on Friday?",
        "Where are you after work on Friday?"
      ],
      answer: "Where were you after work on Friday?"
    },

    {
      prompt: "Why ____ Anna at the hotel last night?",
      choices: [
        "Why was Anna at the hotel last night?",
        "Why were Anna at the hotel last night?",
        "Why is Anna at the hotel last night?"
      ],
      answer: "Why was Anna at the hotel last night?"
    },

    {
      prompt: "Where ____ your parents on Sunday afternoon?",
      choices: [
        "Where were your parents on Sunday afternoon?",
        "Where was your parents on Sunday afternoon?",
        "Where are your parents on Sunday afternoon?"
      ],
      answer: "Where were your parents on Sunday afternoon?"
    },

    {
      prompt: "When ____ Tom at the airport?",
      choices: [
        "When was Tom at the airport?",
        "When were Tom at the airport?",
        "When is Tom at the airport?"
      ],
      answer: "When was Tom at the airport?"
    },

    {
      prompt: "Why ____ the children at home in the morning?",
      choices: [
        "Why were the children at home in the morning?",
        "Why was the children at home in the morning?",
        "Why are the children at home in the morning?"
      ],
      answer: "Why were the children at home in the morning?"
    },

    {
      prompt: "Where ____ your sister on Saturday evening?",
      choices: [
        "Where was your sister on Saturday evening?",
        "Where were your sister on Saturday evening?",
        "Where is your sister on Saturday evening?"
      ],
      answer: "Where was your sister on Saturday evening?"
    },

    {
      prompt: "When ____ you at the restaurant?",
      choices: [
        "When were you at the restaurant?",
        "When was you at the restaurant?",
        "When are you at the restaurant?"
      ],
      answer: "When were you at the restaurant?"
    },

    {
      prompt: "Why ____ he at the doctor's office yesterday morning?",
      choices: [
        "Why was he at the doctor's office yesterday morning?",
        "Why were he at the doctor's office yesterday morning?",
        "Why is he at the doctor's office yesterday morning?"
      ],
      answer: "Why was he at the doctor's office yesterday morning?"
    },

    {
      prompt: "Where ____ the students after the class?",
      choices: [
        "Where were the students after the class?",
        "Where was the students after the class?",
        "Where are the students after the class?"
      ],
      answer: "Where were the students after the class?"
    },

    {
      prompt: "When ____ your friends at the cinema?",
      choices: [
        "When were your friends at the cinema?",
        "When was your friends at the cinema?",
        "When are your friends at the cinema?"
      ],
      answer: "When were your friends at the cinema?"
    },

    {
      prompt: "Why ____ Sara in the kitchen before dinner?",
      choices: [
        "Why was Sara in the kitchen before dinner?",
        "Why were Sara in the kitchen before dinner?",
        "Why is Sara in the kitchen before dinner?"
      ],
      answer: "Why was Sara in the kitchen before dinner?"
    },

    {
      prompt: "Where ____ you and your brother last weekend?",
      choices: [
        "Where were you and your brother last weekend?",
        "Where was you and your brother last weekend?",
        "Where are you and your brother last weekend?"
      ],
      answer: "Where were you and your brother last weekend?"
    },

    {
      prompt: "When ____ your mother at work?",
      choices: [
        "When was your mother at work?",
        "When were your mother at work?",
        "When is your mother at work?"
      ],
      answer: "When was your mother at work?"
    },

    {
      prompt: "Why ____ they at the airport so early?",
      choices: [
        "Why were they at the airport so early?",
        "Why was they at the airport so early?",
        "Why are they at the airport so early?"
      ],
      answer: "Why were they at the airport so early?"
    },

    {
      prompt: "Where ____ the manager after the meeting?",
      choices: [
        "Where was the manager after the meeting?",
        "Where were the manager after the meeting?",
        "Where is the manager after the meeting?"
      ],
      answer: "Where was the manager after the meeting?"
    },

    {
      prompt: "When ____ the children at the park?",
      choices: [
        "When were the children at the park?",
        "When was the children at the park?",
        "When are the children at the park?"
      ],
      answer: "When were the children at the park?"
    },

    {
      prompt: "Why ____ your brother at home on Monday?",
      choices: [
        "Why was your brother at home on Monday?",
        "Why were your brother at home on Monday?",
        "Why is your brother at home on Monday?"
      ],
      answer: "Why was your brother at home on Monday?"
    },

    {
      prompt: "Where ____ the guests after dinner?",
      choices: [
        "Where were the guests after dinner?",
        "Where was the guests after dinner?",
        "Where are the guests after dinner?"
      ],
      answer: "Where were the guests after dinner?"
    },

    {
      prompt: "When ____ Maria at the office?",
      choices: [
        "When was Maria at the office?",
        "When were Maria at the office?",
        "When is Maria at the office?"
      ],
      answer: "When was Maria at the office?"
    },

    {
      prompt: "Why ____ you at the bus station so early?",
      choices: [
        "Why were you at the bus station so early?",
        "Why was you at the bus station so early?",
        "Why are you at the bus station so early?"
      ],
      answer: "Why were you at the bus station so early?"
    }

  ];

  /* =========================================================
     REGULAR VERBS — LEVEL 1
     Fixed positive / negative / question sentences
     ========================================================= */

  const REGULAR_LEVEL_1 = [

    {
      prompt: "I ____ my room on Saturday morning. (clean)",
      choices: ["cleaned", "clean", "cleans"],
      answer: "cleaned"
    },

    {
      prompt: "She ____ dinner for her family last night. (cook)",
      choices: ["cooked", "cook", "cooks"],
      answer: "cooked"
    },

    {
      prompt: "They ____ at a hotel last weekend. (stay)",
      choices: ["stayed", "stay", "stays"],
      answer: "stayed"
    },

    {
      prompt: "We ____ the movie at 9 p.m. (start)",
      choices: ["started", "start", "starts"],
      answer: "started"
    },

    {
      prompt: "He ____ the window before dinner. (close)",
      choices: ["closed", "close", "closes"],
      answer: "closed"
    },

    {
      prompt: "I ____ my friend after work. (call)",
      choices: ["called", "call", "calls"],
      answer: "called"
    },

    {
      prompt: "She ____ the hotel room before the guests arrived. (clean)",
      choices: ["cleaned", "clean", "cleans"],
      answer: "cleaned"
    },

    {
      prompt: "We ____ English for two hours last night. (study)",
      choices: ["studied", "study", "studies"],
      answer: "studied"
    },

    {
      prompt: "They ____ the new apartment last month. (paint)",
      choices: ["painted", "paint", "paints"],
      answer: "painted"
    },

    {
      prompt: "Tom ____ his car near the hotel. (park)",
      choices: ["parked", "park", "parks"],
      answer: "parked"
    },

    {
      prompt: "I ____ the door because it was cold. (close)",
      choices: ["closed", "close", "closes"],
      answer: "closed"
    },

    {
      prompt: "She ____ the hotel last Friday. (book)",
      choices: ["booked", "book", "books"],
      answer: "booked"
    },

    {
      prompt: "We ____ at home after the trip. (relax)",
      choices: ["relaxed", "relax", "relaxes"],
      answer: "relaxed"
    },

    {
      prompt: "He ____ his parents on Sunday. (visit)",
      choices: ["visited", "visit", "visits"],
      answer: "visited"
    },

    {
      prompt: "They ____ the house last summer. (paint)",
      choices: ["painted", "paint", "paints"],
      answer: "painted"
    },

    {
      prompt: "I ____ my bags before the trip. (pack)",
      choices: ["packed", "pack", "packs"],
      answer: "packed"
    },

    {
      prompt: "She ____ the answer quickly. (answer)",
      choices: ["answered", "answer", "answers"],
      answer: "answered"
    },

    {
      prompt: "We ____ the bus at 8 a.m. (start)",
      choices: ["started", "start", "starts"],
      answer: "started"
    },

    {
      prompt: "He ____ the lights before leaving. (turn)",
      choices: ["turned", "turn", "turns"],
      answer: "turned"
    },

    {
      prompt: "They ____ the hotel at noon. (arrive)",
      choices: ["arrived", "arrive", "arrives"],
      answer: "arrived"
    },

    {
      prompt: "I ____ TV after dinner. (watch)",
      choices: ["watched", "watch", "watches"],
      answer: "watched"
    },

    {
      prompt: "She ____ her grandparents last weekend. (visit)",
      choices: ["visited", "visit", "visits"],
      answer: "visited"
    },

    {
      prompt: "We ____ the room before the meeting. (open)",
      choices: ["opened", "open", "opens"],
      answer: "opened"
    },

    {
      prompt: "He ____ his homework before dinner. (finish)",
      choices: ["finished", "finish", "finishes"],
      answer: "finished"
    },

    {
      prompt: "They ____ the hotel after the holiday. (leave)",
      choices: ["leaved", "left", "leave"],
      answer: "left"
    }

  ];

  /*
    Replace the accidental irregular example above with a true
    regular-verb sentence.
  */
  REGULAR_LEVEL_1[24] = {
    prompt: "They ____ the hotel after breakfast. (check)",
    choices: ["checked", "check", "checks"],
    answer: "checked"
  };

  /* =========================================================
     REGULAR VERBS — LEVEL 2
     Negative / question forms
     ========================================================= */

  const REGULAR_LEVEL_2 = [

    {
      prompt: "I ____ watch TV last night.",
      choices: ["didn't", "don't", "wasn't"],
      answer: "didn't"
    },

    {
      prompt: "She ____ clean the kitchen yesterday.",
      choices: ["didn't", "doesn't", "wasn't"],
      answer: "didn't"
    },

    {
      prompt: "They ____ play tennis on Saturday.",
      choices: ["didn't", "don't", "weren't"],
      answer: "didn't"
    },

    {
      prompt: "We ____ visit our friends last weekend.",
      choices: ["didn't", "don't", "weren't"],
      answer: "didn't"
    },

    {
      prompt: "He ____ finish his homework before dinner.",
      choices: ["didn't", "doesn't", "wasn't"],
      answer: "didn't"
    },

    {
      prompt: "____ you clean your room yesterday?",
      choices: ["Did", "Do", "Were"],
      answer: "Did"
    },

    {
      prompt: "____ she call you after work?",
      choices: ["Did", "Does", "Was"],
      answer: "Did"
    },

    {
      prompt: "____ they stay at the hotel last night?",
      choices: ["Did", "Do", "Were"],
      answer: "Did"
    },

    {
      prompt: "____ he open the window?",
      choices: ["Did", "Does", "Was"],
      answer: "Did"
    },

    {
      prompt: "____ you study English last weekend?",
      choices: ["Did", "Do", "Were"],
      answer: "Did"
    },

    {
      prompt: "She ____ watch TV after dinner.",
      choices: ["didn't", "doesn't", "wasn't"],
      answer: "didn't"
    },

    {
      prompt: "We ____ arrive early for the meeting.",
      choices: ["didn't", "don't", "weren't"],
      answer: "didn't"
    },

    {
      prompt: "____ Tom work on Monday?",
      choices: ["Did", "Does", "Was"],
      answer: "Did"
    },

    {
      prompt: "____ your parents travel last summer?",
      choices: ["Did", "Do", "Were"],
      answer: "Did"
    },

    {
      prompt: "I ____ use the computer yesterday.",
      choices: ["didn't", "don't", "wasn't"],
      answer: "didn't"
    },

    {
      prompt: "____ she book the hotel online?",
      choices: ["Did", "Does", "Was"],
      answer: "Did"
    },

    {
      prompt: "They ____ play football after school.",
      choices: ["didn't", "don't", "weren't"],
      answer: "didn't"
    },

    {
      prompt: "____ you walk to work yesterday?",
      choices: ["Did", "Do", "Were"],
      answer: "Did"
    },

    {
      prompt: "He ____ answer the phone.",
      choices: ["didn't", "doesn't", "wasn't"],
      answer: "didn't"
    },

    {
      prompt: "____ they paint the house last year?",
      choices: ["Did", "Do", "Were"],
      answer: "Did"
    }

  ];

  /*
    Level 2 should test the complete form, not just Did/didn't.
    The following questions replace the simpler items above.
  */

  const REGULAR_LEVEL_2_FULL = [

    {
      prompt: "____ you clean your room yesterday?",
      choices: [
        "Did you clean your room yesterday?",
        "Did you cleaned your room yesterday?",
        "Do you clean your room yesterday?"
      ],
      answer: "Did you clean your room yesterday?"
    },

    {
      prompt: "____ she call you after work?",
      choices: [
        "Did she call you after work?",
        "Did she called you after work?",
        "Does she call you after work?"
      ],
      answer: "Did she call you after work?"
    },

    {
      prompt: "____ they stay at the hotel last night?",
      choices: [
        "Did they stay at the hotel last night?",
        "Did they stayed at the hotel last night?",
        "Do they stay at the hotel last night?"
      ],
      answer: "Did they stay at the hotel last night?"
    },

    {
      prompt: "____ he open the window before dinner?",
      choices: [
        "Did he open the window before dinner?",
        "Did he opened the window before dinner?",
        "Does he open the window before dinner?"
      ],
      answer: "Did he open the window before dinner?"
    },

    {
      prompt: "____ you study English last weekend?",
      choices: [
        "Did you study English last weekend?",
        "Did you studied English last weekend?",
        "Do you study English last weekend?"
      ],
      answer: "Did you study English last weekend?"
    },

    {
      prompt: "She ____ watch TV after dinner.",
      choices: [
        "She didn't watch TV after dinner.",
        "She didn't watched TV after dinner.",
        "She doesn't watch TV after dinner."
      ],
      answer: "She didn't watch TV after dinner."
    },

    {
      prompt: "We ____ arrive early for the meeting.",
      choices: [
        "We didn't arrive early for the meeting.",
        "We didn't arrived early for the meeting.",
        "We don't arrive early for the meeting."
      ],
      answer: "We didn't arrive early for the meeting."
    },

    {
      prompt: "____ Tom work on Monday?",
      choices: [
        "Did Tom work on Monday?",
        "Did Tom worked on Monday?",
        "Does Tom work on Monday?"
      ],
      answer: "Did Tom work on Monday?"
    },

    {
      prompt: "____ your parents travel last summer?",
      choices: [
        "Did your parents travel last summer?",
        "Did your parents traveled last summer?",
        "Do your parents travel last summer?"
      ],
      answer: "Did your parents travel last summer?"
    },

    {
      prompt: "I ____ use the computer yesterday.",
      choices: [
        "I didn't use the computer yesterday.",
        "I didn't used the computer yesterday.",
        "I don't use the computer yesterday."
      ],
      answer: "I didn't use the computer yesterday."
    },

    {
      prompt: "____ she book the hotel online?",
      choices: [
        "Did she book the hotel online?",
        "Did she booked the hotel online?",
        "Does she book the hotel online?"
      ],
      answer: "Did she book the hotel online?"
    },

    {
      prompt: "They ____ play football after school.",
      choices: [
        "They didn't play football after school.",
        "They didn't played football after school.",
        "They don't play football after school."
      ],
      answer: "They didn't play football after school."
    },

    {
      prompt: "____ you walk to work yesterday?",
      choices: [
        "Did you walk to work yesterday?",
        "Did you walked to work yesterday?",
        "Do you walk to work yesterday?"
      ],
      answer: "Did you walk to work yesterday?"
    },

    {
      prompt: "He ____ answer the phone.",
      choices: [
        "He didn't answer the phone.",
        "He didn't answered the phone.",
        "He doesn't answer the phone."
      ],
      answer: "He didn't answer the phone."
    },

    {
      prompt: "____ they paint the house last year?",
      choices: [
        "Did they paint the house last year?",
        "Did they painted the house last year?",
        "Do they paint the house last year?"
      ],
      answer: "Did they paint the house last year?"
    },

    {
      prompt: "____ you watch the movie last night?",
      choices: [
        "Did you watch the movie last night?",
        "Did you watched the movie last night?",
        "Do you watch the movie last night?"
      ],
      answer: "Did you watch the movie last night?"
    },

    {
      prompt: "Maria ____ finish the report yesterday.",
      choices: [
        "Maria didn't finish the report yesterday.",
        "Maria didn't finished the report yesterday.",
        "Maria doesn't finish the report yesterday."
      ],
      answer: "Maria didn't finish the report yesterday."
    },

    {
      prompt: "____ your brother help you with the bags?",
      choices: [
        "Did your brother help you with the bags?",
        "Did your brother helped you with the bags?",
        "Does your brother help you with the bags?"
      ],
      answer: "Did your brother help you with the bags?"
    },

    {
      prompt: "We ____ cook at home on Friday.",
      choices: [
        "We didn't cook at home on Friday.",
        "We didn't cooked at home on Friday.",
        "We don't cook at home on Friday."
      ],
      answer: "We didn't cook at home on Friday."
    },

    {
      prompt: "____ they arrive before the meeting?",
      choices: [
        "Did they arrive before the meeting?",
        "Did they arrived before the meeting?",
        "Do they arrive before the meeting?"
      ],
      answer: "Did they arrive before the meeting?"
    }

  ];

  /* =========================================================
     REGULAR VERBS — LEVEL 3
     WH QUESTIONS
     ========================================================= */

  const REGULAR_WH = [

    {
      prompt: "Where did you ____ after work on Friday? (walk)",
      choices: [
        "Where did you walk after work on Friday?",
        "Where did you walked after work on Friday?",
        "Where do you walk after work on Friday?"
      ],
      answer: "Where did you walk after work on Friday?"
    },

    {
      prompt: "When did she ____ the hotel room? (clean)",
      choices: [
        "When did she clean the hotel room?",
        "When did she cleaned the hotel room?",
        "When does she clean the hotel room?"
      ],
      answer: "When did she clean the hotel room?"
    },

    {
      prompt: "Why did he ____ the window? (close)",
      choices: [
        "Why did he close the window?",
        "Why did he closed the window?",
        "Why does he close the window?"
      ],
      answer: "Why did he close the window?"
    },

    {
      prompt: "Where did they ____ last weekend? (travel)",
      choices: [
        "Where did they travel last weekend?",
        "Where did they traveled last weekend?",
        "Where do they travel last weekend?"
      ],
      answer: "Where did they travel last weekend?"
    },

    {
      prompt: "When did you ____ your homework? (finish)",
      choices: [
        "When did you finish your homework?",
        "When did you finished your homework?",
        "When do you finish your homework?"
      ],
      answer: "When did you finish your homework?"
    },

    {
      prompt: "Why did she ____ the door? (open)",
      choices: [
        "Why did she open the door?",
        "Why did she opened the door?",
        "Why does she open the door?"
      ],
      answer: "Why did she open the door?"
    },

    {
      prompt: "Where did you ____ at the weekend? (stay)",
      choices: [
        "Where did you stay at the weekend?",
        "Where did you stayed at the weekend?",
        "Where do you stay at the weekend?"
      ],
      answer: "Where did you stay at the weekend?"
    },

    {
      prompt: "When did they ____ the house? (paint)",
      choices: [
        "When did they paint the house?",
        "When did they painted the house?",
        "When do they paint the house?"
      ],
      answer: "When did they paint the house?"
    },

    {
      prompt: "Why did he ____ the meeting? (cancel)",
      choices: [
        "Why did he cancel the meeting?",
        "Why did he canceled the meeting?",
        "Why does he cancel the meeting?"
      ],
      answer: "Why did he cancel the meeting?"
    },

    {
      prompt: "Where did she ____ the car? (park)",
      choices: [
        "Where did she park the car?",
        "Where did she parked the car?",
        "Where does she park the car?"
      ],
      answer: "Where did she park the car?"
    },

    {
      prompt: "When did you ____ the hotel? (book)",
      choices: [
        "When did you book the hotel?",
        "When did you booked the hotel?",
        "When do you book the hotel?"
      ],
      answer: "When did you book the hotel?"
    },

    {
      prompt: "Why did they ____ the room? (change)",
      choices: [
        "Why did they change the room?",
        "Why did they changed the room?",
        "Why do they change the room?"
      ],
      answer: "Why did they change the room?"
    },

    {
      prompt: "Where did he ____ after the class? (relax)",
      choices: [
        "Where did he relax after the class?",
        "Where did he relaxed after the class?",
        "Where does he relax after the class?"
      ],
      answer: "Where did he relax after the class?"
    },

    {
      prompt: "When did she ____ her parents? (visit)",
      choices: [
        "When did she visit her parents?",
        "When did she visited her parents?",
        "When does she visit her parents?"
      ],
      answer: "When did she visit her parents?"
    },

    {
      prompt: "Why did you ____ the lights? (turn)",
      choices: [
        "Why did you turn the lights off?",
        "Why did you turned the lights off?",
        "Why do you turn the lights off?"
      ],
      answer: "Why did you turn the lights off?"
    },

    {
      prompt: "Where did they ____ their bags? (pack)",
      choices: [
        "Where did they pack their bags?",
        "Where did they packed their bags?",
        "Where do they pack their bags?"
      ],
      answer: "Where did they pack their bags?"
    },

    {
      prompt: "When did he ____ the email? (answer)",
      choices: [
        "When did he answer the email?",
        "When did he answered the email?",
        "When does he answer the email?"
      ],
      answer: "When did he answer the email?"
    },

    {
      prompt: "Why did she ____ English? (study)",
      choices: [
        "Why did she study English?",
        "Why did she studied English?",
        "Why does she study English?"
      ],
      answer: "Why did she study English?"
    },

    {
      prompt: "Where did you ____ dinner? (cook)",
      choices: [
        "Where did you cook dinner?",
        "Where did you cooked dinner?",
        "Where do you cook dinner?"
      ],
      answer: "Where did you cook dinner?"
    },

    {
      prompt: "When did they ____ at the hotel? (arrive)",
      choices: [
        "When did they arrive at the hotel?",
        "When did they arrived at the hotel?",
        "When do they arrive at the hotel?"
      ],
      answer: "When did they arrive at the hotel?"
    }

  ];

  /* =========================================================
     -ED PRONUNCIATION — LEVEL 3
     ========================================================= */

  const SOUND_T = [
    "asked",
    "cooked",
    "finished",
    "helped",
    "liked",
    "looked",
    "missed",
    "packed",
    "parked",
    "passed",
    "stopped",
    "talked",
    "walked",
    "watched",
    "washed",
    "worked"
  ];

  const SOUND_D = [
    "answered",
    "arrived",
    "called",
    "carried",
    "changed",
    "cleaned",
    "closed",
    "cried",
    "learned",
    "listened",
    "lived",
    "loved",
    "moved",
    "offered",
    "opened",
    "played",
    "rained",
    "snowed",
    "stayed",
    "studied",
    "traveled",
    "turned",
    "used"
  ];

  const SOUND_ID = [
    "decided",
    "hated",
    "invited",
    "needed",
    "painted",
    "rented",
    "started",
    "waited",
    "wanted"
  ];

  const SOUND_QUESTIONS = [];

  /*
    Create fixed pronunciation questions.
    The words are fixed; only the order of the options changes.
  */

  SOUND_QUESTIONS.push(
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["asked", "helped", "wanted", "walked"],
      answer: "wanted"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["played", "called", "watched", "cleaned"],
      answer: "watched"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["needed", "started", "liked", "wanted"],
      answer: "liked"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["stopped", "looked", "decided", "washed"],
      answer: "decided"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["arrived", "opened", "painted", "lived"],
      answer: "painted"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["cooked", "worked", "invited", "helped"],
      answer: "invited"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["hated", "waited", "asked", "started"],
      answer: "asked"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["closed", "turned", "rented", "used"],
      answer: "rented"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["studied", "played", "finished", "called"],
      answer: "finished"
    },
    {
      prompt: "Which word has a different -ed sound?",
      choices: ["wanted", "needed", "washed", "decided"],
      answer: "washed"
    }
  );

  /* =========================================================
     IRREGULAR VERBS — LEVEL 1
     Fixed sentences
     ========================================================= */

  const IRREGULAR_LEVEL_1 = [

    {
      prompt: "I ____ to the supermarket after work. (go)",
      choices: ["went", "go", "goed"],
      answer: "went"
    },

    {
      prompt: "She ____ a new phone last month. (buy)",
      choices: ["bought", "buy", "buyed"],
      answer: "bought"
    },

    {
      prompt: "They ____ breakfast at the hotel. (have)",
      choices: ["had", "have", "haved"],
      answer: "had"
    },

    {
      prompt: "We ____ home late last night. (come)",
      choices: ["came", "come", "comed"],
      answer: "came"
    },

    {
      prompt: "He ____ a sandwich for lunch. (eat)",
      choices: ["ate", "eat", "eated"],
      answer: "ate"
    },

    {
      prompt: "I ____ my keys on the table. (put)",
      choices: ["put", "putted", "puts"],
      answer: "put"
    },

    {
      prompt: "She ____ her friend at the station. (meet)",
      choices: ["met", "meet", "meeted"],
      answer: "met"
    },

    {
      prompt: "They ____ a taxi to the airport. (take)",
      choices: ["took", "take", "taked"],
      answer: "took"
    },

    {
      prompt: "We ____ a movie after dinner. (see)",
      choices: ["saw", "see", "seed"],
      answer: "saw"
    },

    {
      prompt: "He ____ his homework before dinner. (do)",
      choices: ["did", "do", "doed"],
      answer: "did"
    },

    {
      prompt: "I ____ my friend a message. (send)",
      choices: ["sent", "send", "sended"],
      answer: "sent"
    },

    {
      prompt: "She ____ home at six o'clock. (leave)",
      choices: ["left", "leave", "leaved"],
      answer: "left"
    },

    {
      prompt: "They ____ dinner at a restaurant. (have)",
      choices: ["had", "have", "haved"],
      answer: "had"
    },

    {
      prompt: "We ____ a lot of photos on vacation. (take)",
      choices: ["took", "take", "taked"],
      answer: "took"
    },

    {
      prompt: "He ____ his old teacher at the mall. (see)",
      choices: ["saw", "see", "seed"],
      answer: "saw"
    },

    {
      prompt: "I ____ a letter to my friend. (write)",
      choices: ["wrote", "write", "writed"],
      answer: "wrote"
    },

    {
      prompt: "She ____ coffee in the morning. (drink)",
      choices: ["drank", "drink", "drinked"],
      answer: "drank"
    },

    {
      prompt: "They ____ the answer to the question. (know)",
      choices: ["knew", "know", "knowed"],
      answer: "knew"
    },

    {
      prompt: "We ____ a new restaurant downtown. (find)",
      choices: ["found", "find", "finded"],
      answer: "found"
    },

    {
      prompt: "He ____ the bus at seven o'clock. (take)",
      choices: ["took", "take", "taked"],
      answer: "took"
    },

    {
      prompt: "I ____ my wallet at home. (leave)",
      choices: ["left", "leave", "leaved"],
      answer: "left"
    },

    {
      prompt: "She ____ me the truth. (tell)",
      choices: ["told", "tell", "telled"],
      answer: "told"
    },

    {
      prompt: "They ____ a new house last year. (build)",
      choices: ["built", "build", "builded"],
      answer: "built"
    },

    {
      prompt: "We ____ the hotel at noon. (leave)",
      choices: ["left", "leave", "leaved"],
      answer: "left"
    },

    {
      prompt: "He ____ very well last night. (sleep)",
      choices: ["slept", "sleep", "sleeped"],
      answer: "slept"
    }

  ];

  /* =========================================================
     IRREGULAR VERBS — LEVEL 2
     NEGATIVE / QUESTIONS
     ========================================================= */

  const IRREGULAR_LEVEL_2 = [

    {
      prompt: "____ you go to the supermarket yesterday?",
      choices: [
        "Did you go to the supermarket yesterday?",
        "Did you went to the supermarket yesterday?",
        "Do you go to the supermarket yesterday?"
      ],
      answer: "Did you go to the supermarket yesterday?"
    },

    {
      prompt: "____ she buy a new phone last month?",
      choices: [
        "Did she buy a new phone last month?",
        "Did she bought a new phone last month?",
        "Does she buy a new phone last month?"
      ],
      answer: "Did she buy a new phone last month?"
    },

    {
      prompt: "____ they have breakfast at the hotel?",
      choices: [
        "Did they have breakfast at the hotel?",
        "Did they had breakfast at the hotel?",
        "Do they have breakfast at the hotel?"
      ],
      answer: "Did they have breakfast at the hotel?"
    },

    {
      prompt: "____ he come home late last night?",
      choices: [
        "Did he come home late last night?",
        "Did he came home late last night?",
        "Does he come home late last night?"
      ],
      answer: "Did he come home late last night?"
    },

    {
      prompt: "____ you eat breakfast this morning?",
      choices: [
        "Did you eat breakfast this morning?",
        "Did you ate breakfast this morning?",
        "Do you eat breakfast this morning?"
      ],
      answer: "Did you eat breakfast this morning?"
    },

    {
      prompt: "I ____ see my friend at the station.",
      choices: [
        "I didn't see my friend at the station.",
        "I didn't saw my friend at the station.",
        "I don't see my friend at the station."
      ],
      answer: "I didn't see my friend at the station."
    },

    {
      prompt: "She ____ take the bus to work.",
      choices: [
        "She didn't take the bus to work.",
        "She didn't took the bus to work.",
        "She doesn't take the bus to work."
      ],
      answer: "She didn't take the bus to work."
    },

    {
      prompt: "They ____ have dinner at home.",
      choices: [
        "They didn't have dinner at home.",
        "They didn't had dinner at home.",
        "They don't have dinner at home."
      ],
      answer: "They didn't have dinner at home."
    },

    {
      prompt: "We ____ go to the cinema.",
      choices: [
        "We didn't go to the cinema.",
        "We didn't went to the cinema.",
        "We don't go to the cinema."
      ],
      answer: "We didn't go to the cinema."
    },

    {
      prompt: "He ____ write the email yesterday.",
      choices: [
        "He didn't write the email yesterday.",
        "He didn't wrote the email yesterday.",
        "He doesn't write the email yesterday."
      ],
      answer: "He didn't write the email yesterday."
    },

    {
      prompt: "____ she meet her friend after work?",
      choices: [
        "Did she meet her friend after work?",
        "Did she met her friend after work?",
        "Does she meet her friend after work?"
      ],
      answer: "Did she meet her friend after work?"
    },

    {
      prompt: "____ they see the new movie?",
      choices: [
        "Did they see the new movie?",
        "Did they saw the new movie?",
        "Do they see the new movie?"
      ],
      answer: "Did they see the new movie?"
    },

    {
      prompt: "____ he take a taxi to the airport?",
      choices: [
        "Did he take a taxi to the airport?",
        "Did he took a taxi to the airport?",
        "Does he take a taxi to the airport?"
      ],
      answer: "Did he take a taxi to the airport?"
    },

    {
      prompt: "I ____ know the answer.",
      choices: [
        "I didn't know the answer.",
        "I didn't knew the answer.",
        "I don't know the answer."
      ],
      answer: "I didn't know the answer."
    },

    {
      prompt: "She ____ leave the hotel early.",
      choices: [
        "She didn't leave the hotel early.",
        "She didn't left the hotel early.",
        "She doesn't leave the hotel early."
      ],
      answer: "She didn't leave the hotel early."
    },

    {
      prompt: "____ you write to your friend?",
      choices: [
        "Did you write to your friend?",
        "Did you wrote to your friend?",
        "Do you write to your friend?"
      ],
      answer: "Did you write to your friend?"
    },

    {
      prompt: "____ your parents come home late?",
      choices: [
        "Did your parents come home late?",
        "Did your parents came home late?",
        "Do your parents come home late?"
      ],
      answer: "Did your parents come home late?"
    },

    {
      prompt: "They ____ find their hotel.",
      choices: [
        "They didn't find their hotel.",
        "They didn't found their hotel.",
        "They don't find their hotel."
      ],
      answer: "They didn't find their hotel."
    },

    {
      prompt: "____ he drink coffee in the morning?",
      choices: [
        "Did he drink coffee in the morning?",
        "Did he drank coffee in the morning?",
        "Does he drink coffee in the morning?"
      ],
      answer: "Did he drink coffee in the morning?"
    },

    {
      prompt: "We ____ buy anything at the store.",
      choices: [
        "We didn't buy anything at the store.",
        "We didn't bought anything at the store.",
        "We don't buy anything at the store."
      ],
      answer: "We didn't buy anything at the store."
    }

  ];

  /* =========================================================
     IRREGULAR VERBS — WH QUESTIONS
     ========================================================= */

  const IRREGULAR_WH = [

    {
      prompt: "Where did you go after work on Friday?",
      choices: [
        "Where did you go after work on Friday?",
        "Where did you went after work on Friday?",
        "Where do you go after work on Friday?"
      ],
      answer: "Where did you go after work on Friday?"
    },

    {
      prompt: "What did she eat for breakfast at the hotel?",
      choices: [
        "What did she eat for breakfast at the hotel?",
        "What did she ate for breakfast at the hotel?",
        "What does she eat for breakfast at the hotel?"
      ],
      answer: "What did she eat for breakfast at the hotel?"
    },

    {
      prompt: "When did they come home from the party?",
      choices: [
        "When did they come home from the party?",
        "When did they came home from the party?",
        "When do they come home from the party?"
      ],
      answer: "When did they come home from the party?"
    },

    {
      prompt: "Where did he put his keys after work?",
      choices: [
        "Where did he put his keys after work?",
        "Where did he putted his keys after work?",
        "Where does he put his keys after work?"
      ],
      answer: "Where did he put his keys after work?"
    },

    {
      prompt: "What did you buy at the supermarket?",
      choices: [
        "What did you buy at the supermarket?",
        "What did you bought at the supermarket?",
        "What do you buy at the supermarket?"
      ],
      answer: "What did you buy at the supermarket?"
    },

    {
      prompt: "Why did she leave the office early?",
      choices: [
        "Why did she leave the office early?",
        "Why did she left the office early?",
        "Why does she leave the office early?"
      ],
      answer: "Why did she leave the office early?"
    },

    {
      prompt: "When did you meet your new teacher?",
      choices: [
        "When did you meet your new teacher?",
        "When did you met your new teacher?",
        "When do you meet your new teacher?"
      ],
      answer: "When did you meet your new teacher?"
    },

    {
      prompt: "What did he have for lunch?",
      choices: [
        "What did he have for lunch?",
        "What did he had for lunch?",
        "What does he have for lunch?"
      ],
      answer: "What did he have for lunch?"
    },

    {
      prompt: "Where did they sleep during their trip?",
      choices: [
        "Where did they sleep during their trip?",
        "Where did they slept during their trip?",
        "Where do they sleep during their trip?"
      ],
      answer: "Where did they sleep during their trip?"
    },

    {
      prompt: "What did she make for dinner?",
      choices: [
        "What did she make for dinner?",
        "What did she made for dinner?",
        "What does she make for dinner?"
      ],
      answer: "What did she make for dinner?"
    },

    {
      prompt: "Who did you see at the restaurant?",
      choices: [
        "Who did you see at the restaurant?",
        "Who did you saw at the restaurant?",
        "Who do you see at the restaurant?"
      ],
      answer: "Who did you see at the restaurant?"
    },

    {
      prompt: "When did he take the train to the city?",
      choices: [
        "When did he take the train to the city?",
        "When did he took the train to the city?",
        "When does he take the train to the city?"
      ],
      answer: "When did he take the train to the city?"
    },

    {
      prompt: "Why did they leave the hotel early?",
      choices: [
        "Why did they leave the hotel early?",
        "Why did they left the hotel early?",
        "Why do they leave the hotel early?"
      ],
      answer: "Why did they leave the hotel early?"
    },

    {
      prompt: "Where did she find her phone?",
      choices: [
        "Where did she find her phone?",
        "Where did she found her phone?",
        "Where does she find her phone?"
      ],
      answer: "Where did she find her phone?"
    },

    {
      prompt: "What did you do after dinner?",
      choices: [
        "What did you do after dinner?",
        "What did you did after dinner?",
        "What do you do after dinner?"
      ],
      answer: "What did you do after dinner?"
    },

    {
      prompt: "When did your parents come home?",
      choices: [
        "When did your parents come home?",
        "When did your parents came home?",
        "When do your parents come home?"
      ],
      answer: "When did your parents come home?"
    },

    {
      prompt: "What did he drink with his lunch?",
      choices: [
        "What did he drink with his lunch?",
        "What did he drank with his lunch?",
        "What does he drink with his lunch?"
      ],
      answer: "What did he drink with his lunch?"
    },

    {
      prompt: "Where did you put your suitcase?",
      choices: [
        "Where did you put your suitcase?",
        "Where did you putted your suitcase?",
        "Where do you put your suitcase?"
      ],
      answer: "Where did you put your suitcase?"
    },

    {
      prompt: "Who did she meet at the airport?",
      choices: [
        "Who did she meet at the airport?",
        "Who did she met at the airport?",
        "Who does she meet at the airport?"
      ],
      answer: "Who did she meet at the airport?"
    },

    {
      prompt: "What did they see at the museum?",
      choices: [
        "What did they see at the museum?",
        "What did they saw at the museum?",
        "What do they see at the museum?"
      ],
      answer: "What did they see at the museum?"
    }

  ];

  /* =========================================================
     IRREGULAR MATCH RUSH DATA
     ========================================================= */

  const IRREGULAR = [
    ["be", "was/were"],
    ["buy", "bought"],
    ["do", "did"],
    ["get", "got"],
    ["go", "went"],
    ["have", "had"],
    ["leave", "left"],
    ["say", "said"],
    ["see", "saw"],
    ["send", "sent"],
    ["sit", "sat"],
    ["tell", "told"],
    ["write", "wrote"],
    ["come", "came"],
    ["drink", "drank"],
    ["drive", "drove"],
    ["eat", "ate"],
    ["fall", "fell"],
    ["find", "found"],
    ["give", "gave"],
    ["know", "knew"],
    ["make", "made"],
    ["meet", "met"],
    ["read", "read"],
    ["run", "ran"],
    ["sleep", "slept"],
    ["speak", "spoke"],
    ["take", "took"],
    ["think", "thought"],
    ["wear", "wore"],
    ["win", "won"],
    ["begin", "began"],
    ["break", "broke"],
    ["bring", "brought"],
    ["build", "built"],
    ["catch", "caught"],
    ["choose", "chose"],
    ["cut", "cut"],
    ["draw", "drew"],
    ["feel", "felt"],
    ["fly", "flew"],
    ["forget", "forgot"],
    ["hear", "heard"],
    ["keep", "kept"],
    ["lose", "lost"],
    ["pay", "paid"],
    ["put", "put"],
    ["sell", "sold"],
    ["sing", "sang"],
    ["stand", "stood"],
    ["swim", "swam"],
    ["teach", "taught"],
    ["understand", "understood"]
  ];

  /* =========================================================
     BUILD MULTIPLE-CHOICE QUESTION
     ========================================================= */

  function buildMC(item, hint) {
    return {
      type: "mc",
      hint: hint,
      prompt: item.prompt,
      choices: shuffle(item.choices),
      answer: item.answer
    };
  }

  /* =========================================================
     MODES
     ========================================================= */

  const MODES = {

    ww1: {
      label: "Was / Were · Level 1",
      bank: WAS_WERE_LEVEL_1,
      hint: "Choose the correct past form of be"
    },

    ww2: {
      label: "There was / were · Level 2",
      bank: THERE_WAS_WERE,
      hint: "Choose There was or There were"
    },

    ww3: {
      label: "Was / Were · Level 3",
      bank: WAS_WERE_WH,
      hint: "Choose the correct Wh- question"
    },

    reg1: {
      label: "Regular Verbs · Level 1",
      bank: REGULAR_LEVEL_1,
      hint: "Choose the correct past form"
    },

    reg2: {
      label: "Regular Verbs · Level 2",
      bank: REGULAR_LEVEL_2_FULL,
      hint: "Choose the correct sentence"
    },

    "reg-sound": {
      label: "Regular Verbs · Level 3",
      bank: SOUND_QUESTIONS,
      hint: "Choose the word with a different -ed sound"
    },

    irr1: {
      label: "Irregular Verbs · Level 1",
      bank: IRREGULAR_LEVEL_1,
      hint: "Choose the correct past form"
    },

    irr2: {
      label: "Irregular Verbs · Level 2",
      bank: IRREGULAR_LEVEL_2,
      hint: "Choose the correct sentence"
    },

    "irr-match": {
      label: "Irregular · Match Rush",
      build: null
    }

  };

  /* =========================================================
     UI ELEMENTS
     ========================================================= */

  const menuScreen =
    document.getElementById("menuScreen");

  const playScreen =
    document.getElementById("playScreen");

  const resultScreen =
    document.getElementById("resultScreen");

  const choicesArea =
    document.getElementById("choicesArea");

  const matchArea =
    document.getElementById("matchArea");

  const matchLeft =
    document.getElementById("matchLeft");

  const matchRight =
    document.getElementById("matchRight");

  const feedbackEl =
    document.getElementById("feedback");

  const promptHint =
    document.getElementById("promptHint");

  const promptText =
    document.getElementById("promptText");

  const modeLabel =
    document.getElementById("modeLabel");

  const scoreEl =
    document.getElementById("score");

  const progressFill =
    document.getElementById("progressFill");

  let modeKey = null;
  let queue = [];
  let index = 0;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let locked = false;

  let matchSel = {
    left: null,
    right: null
  };

  let matchDone = 0;
  let matchTotal = 0;
  let matchMap = {};

  /* =========================================================
     SCREEN CONTROL
     ========================================================= */

  function show(name) {

    menuScreen.classList.add("hidden");
    playScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    if (name === "menu") {
      menuScreen.classList.remove("hidden");
    }

    if (name === "play") {
      playScreen.classList.remove("hidden");
    }

    if (name === "result") {
      resultScreen.classList.remove("hidden");
    }
  }

  function updateProgress() {

    if (!progressFill) return;

    progressFill.style.width =
      Math.round((index / TOTAL) * 100) + "%";
  }

  /* =========================================================
     START NORMAL MODE
     ========================================================= */

  function startMode(key) {

    modeKey = key;

    if (key === "irr-match") {
      startMatchRush();
      return;
    }

    const mode = MODES[key];

    if (!mode || !mode.bank) return;

    queue = makeRound(mode.bank);

    index = 0;
    score = 0;
    correct = 0;
    wrong = 0;

    if (modeLabel) {
      modeLabel.textContent = mode.label;
    }

    if (scoreEl) {
      scoreEl.textContent = "0";
    }

    const play =
      document.getElementById("playScreen");

    if (play) {
      play.classList.remove("play-screen-rush");
    }

    show("play");

    loadItem();
  }

  /* =========================================================
     LOAD QUESTION
     ========================================================= */

  function loadItem() {

    locked = false;

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";

    const item = queue[index];

    updateProgress();

    promptHint.textContent = item.hint;
    promptText.textContent = item.prompt;

    if (item.type === "match") {

      choicesArea.classList.add("hidden");

      if (matchArea) {
        matchArea.classList.remove("hidden");
        matchArea.style.display = "flex";
      }

      setupMatch(item);

    } else {

      if (matchArea) {
        matchArea.classList.add("hidden");
        matchArea.style.display = "";
      }

      choicesArea.classList.remove("hidden");

      renderChoices(item);
    }
  }

  /* =========================================================
     RENDER MULTIPLE CHOICE
     ========================================================= */

  function renderChoices(item) {

    choicesArea.innerHTML = "";

    choicesArea.classList.remove(
      "mk-stagger-fast"
    );

    void choicesArea.offsetWidth;

    choicesArea.classList.add(
      "mk-stagger-fast"
    );

    item.choices.forEach(function (choice) {

      const btn =
        document.createElement("button");

      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice;

      btn.addEventListener(
        "click",
        function () {
          onChoice(
            choice,
            item.answer,
            btn
          );
        }
      );

      choicesArea.appendChild(btn);
    });
  }

  /* =========================================================
     ANSWER MULTIPLE CHOICE
     ========================================================= */

  function onChoice(choice, answer, btn) {

    if (locked) return;

    locked = true;

    const ok = choice === answer;

    document
      .querySelectorAll(".choice-btn")
      .forEach(function (button) {

        button.disabled = true;

        if (button.textContent === answer) {
          button.classList.add("correct");
        }

      });

    if (ok) {

      btn.classList.add("correct");

      score += 10;
      correct += 1;

      feedbackEl.textContent = "Correct!";
      feedbackEl.className = "feedback ok";

    } else {

      btn.classList.add("wrong");

      wrong += 1;

      feedbackEl.textContent =
        "Answer: " + answer;

      feedbackEl.className = "feedback bad";
    }

    if (scoreEl) {
      scoreEl.textContent = String(score);
    }

    setTimeout(
      function () {

        index += 1;

        if (index >= queue.length) {
          endRound();
        } else {
          loadItem();
        }

      },
      ok ? 650 : 1300
    );
  }

  /* =========================================================
     MATCHING
     ========================================================= */

  function setupMatch(item) {

    matchSel = {
      left: null,
      right: null
    };

    matchDone = 0;
    matchTotal = item.pairs.length;
    matchMap = {};

    item.pairs.forEach(function (pair) {
      matchMap[pair.left] = pair.right;
    });

    const lefts = shuffle(
      item.pairs.map(function (pair) {
        return pair.left;
      })
    );

    const rights = shuffle(
      item.pairs.map(function (pair) {
        return pair.right;
      })
    );

    if (!matchArea || !matchLeft || !matchRight) {
      return;
    }

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (word) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "match-chip word";

      button.textContent = word;

      button.dataset.side = "left";
      button.dataset.val = word;

      button.addEventListener(
        "click",
        function () {
          onMatchPick(button);
        }
      );

      matchLeft.appendChild(button);
    });

    rights.forEach(function (word) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "match-chip word";

      button.textContent = word;

      button.dataset.side = "right";
      button.dataset.val = word;

      button.addEventListener(
        "click",
        function () {
          onMatchPick(button);
        }
      );

      matchRight.appendChild(button);
    });
  }

  function onMatchPick(btn) {

    if (
      locked ||
      btn.classList.contains("matched")
    ) {
      return;
    }

    const side = btn.dataset.side;

    document
      .querySelectorAll(
        '.match-chip[data-side="' +
        side +
        '"]'
      )
      .forEach(function (button) {

        if (
          !button.classList.contains("matched")
        ) {
          button.classList.remove("selected");
        }

      });

    btn.classList.add("selected");

    matchSel[side] = btn;

    if (
      matchSel.left &&
      matchSel.right
    ) {

      const left =
        matchSel.left.dataset.val;

      const right =
        matchSel.right.dataset.val;

      if (matchMap[left] === right) {

        matchSel.left.classList.add("matched");
        matchSel.right.classList.add("matched");

        matchSel.left.classList.remove("selected");
        matchSel.right.classList.remove("selected");

        matchDone += 1;
        score += 10;

        if (scoreEl) {
          scoreEl.textContent = String(score);
        }

        feedbackEl.textContent = "Matched!";
        feedbackEl.className = "feedback ok";

        matchSel = {
          left: null,
          right: null
        };

        if (matchDone >= matchTotal) {

          correct += 1;
          locked = true;

          setTimeout(function () {

            index += 1;

            if (index >= queue.length) {
              endRound();
            } else {
              loadItem();
            }

          }, 600);
        }

      } else {

        matchSel.left.classList.add("wrong-flash");
        matchSel.right.classList.add("wrong-flash");

        feedbackEl.textContent = "Try again";
        feedbackEl.className = "feedback bad";

        const leftButton = matchSel.left;
        const rightButton = matchSel.right;

        matchSel = {
          left: null,
          right: null
        };

        wrong += 1;

        setTimeout(function () {

          leftButton.classList.remove(
            "selected",
            "wrong-flash"
          );

          rightButton.classList.remove(
            "selected",
            "wrong-flash"
          );

        }, 400);
      }
    }
  }

  /* =========================================================
     MATCH RUSH
     ========================================================= */

  const RUSH_SECONDS = 90;

  let rushTimerId = null;
  let rushTimeLeft = RUSH_SECONDS;
  let rushMatches = 0;
  let rushCombo = 0;
  let rushBestCombo = 0;
  let rushMap = {};

  let rushSel = {
    left: null,
    right: null
  };

  let rushLocked = false;

  function stopRushTimer() {

    if (rushTimerId) {
      clearInterval(rushTimerId);
      rushTimerId = null;
    }
  }

  function startMatchRush() {

    stopRushTimer();

    score = 0;
    correct = 0;
    wrong = 0;

    rushMatches = 0;
    rushCombo = 0;
    rushBestCombo = 0;

    rushTimeLeft = RUSH_SECONDS;

    rushSel = {
      left: null,
      right: null
    };

    rushLocked = false;

    if (modeLabel) {
      modeLabel.textContent = "Match Rush · 90s";
    }

    if (scoreEl) {
      scoreEl.textContent = "0";
    }

    show("play");

    const play =
      document.getElementById("playScreen");

    if (play) {
      play.classList.add("play-screen-rush");
    }

    if (choicesArea) {
      choicesArea.classList.add("hidden");
    }

    if (matchArea) {
      matchArea.classList.remove("hidden");
      matchArea.style.display = "flex";
      matchArea.style.flexDirection = "column";
    }

    feedbackEl.textContent =
      "Match base → past as fast as you can!";

    feedbackEl.className = "feedback";

    const pool = shuffle(
      IRREGULAR.filter(function (pair) {
        return pair[0] !== "be";
      })
    );

    rushMap = {};

    pool.forEach(function (pair) {
      rushMap[pair[0]] = pair[1];
    });

    const lefts = shuffle(
      pool.map(function (pair) {
        return pair[0];
      })
    );

    const rights = shuffle(
      pool.map(function (pair) {
        return pair[1];
      })
    );

    matchLeft.innerHTML = "";
    matchRight.innerHTML = "";

    lefts.forEach(function (word) {
      matchLeft.appendChild(
        makeRushChip(word, "left")
      );
    });

    rights.forEach(function (word) {
      matchRight.appendChild(
        makeRushChip(word, "right")
      );
    });

    updateRushHud();

    rushTimerId = setInterval(function () {

      rushTimeLeft -= 1;

      updateRushHud();

      if (rushTimeLeft <= 0) {
        stopRushTimer();
        endMatchRush();
      }

    }, 1000);
  }

  function makeRushChip(word, side) {

    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "match-chip word";

    button.textContent = word;

    button.dataset.side = side;
    button.dataset.val = word;

    button.addEventListener(
      "click",
      function () {
        onRushPick(button);
      }
    );

    return button;
  }

  function updateRushHud() {

    const timerEl =
      document.getElementById("rushTimer");

    const scoreHud =
      document.getElementById("rushScore");

    const comboEl =
      document.getElementById("rushCombo");

    if (timerEl) {

      timerEl.textContent =
        String(Math.max(0, rushTimeLeft));

      timerEl.classList.toggle(
        "warn",
        rushTimeLeft <= 30 &&
        rushTimeLeft > 10
      );

      timerEl.classList.toggle(
        "danger",
        rushTimeLeft <= 10
      );
    }

    if (scoreHud) {
      scoreHud.textContent = String(score);
    }

    if (comboEl) {
      comboEl.textContent =
        Math.max(0, rushCombo) + "x";
    }

    if (scoreEl) {
      scoreEl.textContent = String(score);
    }
  }

  function shuffleRushBoard() {

    if (
      rushLocked ||
      !matchLeft ||
      !matchRight
    ) {
      return;
    }

    const leftChips =
      Array.from(
        matchLeft.querySelectorAll(
          ".match-chip:not(.matched)"
        )
      );

    const rightChips =
      Array.from(
        matchRight.querySelectorAll(
          ".match-chip:not(.matched)"
        )
      );

    const leftVals = shuffle(
      leftChips.map(function (chip) {
        return chip.dataset.val;
      })
    );

    const rightVals = shuffle(
      rightChips.map(function (chip) {
        return chip.dataset.val;
      })
    );

    matchLeft
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(function (chip) {
        chip.remove();
      });

    matchRight
      .querySelectorAll(
        ".match-chip:not(.matched)"
      )
      .forEach(function (chip) {
        chip.remove();
      });

    leftVals.forEach(function (word) {
      matchLeft.appendChild(
        makeRushChip(word, "left")
      );
    });

    rightVals.forEach(function (word) {
      matchRight.appendChild(
        makeRushChip(word, "right")
      );
    });

    rushSel = {
      left: null,
      right: null
    };
  }

  function onRushPick(btn) {

    if (
      rushLocked ||
      btn.classList.contains("matched")
    ) {
      return;
    }

    const side = btn.dataset.side;

    document
      .querySelectorAll(
        '.match-chip[data-side="' +
        side +
        '"]'
      )
      .forEach(function (button) {

        if (
          !button.classList.contains("matched")
        ) {
          button.classList.remove("selected");
        }

      });

    btn.classList.add("selected");

    rushSel[side] = btn;

    if (
      rushSel.left &&
      rushSel.right
    ) {

      const left =
        rushSel.left.dataset.val;

      const right =
        rushSel.right.dataset.val;

      if (rushMap[left] === right) {

        rushSel.left.classList.add("matched");
        rushSel.right.classList.add("matched");

        rushSel.left.classList.remove("selected");
        rushSel.right.classList.remove("selected");

        rushMatches += 1;
        rushCombo += 1;

        if (rushCombo > rushBestCombo) {
          rushBestCombo = rushCombo;
        }

        const points =
          10 +
          Math.min(
            40,
            (rushCombo - 1) * 5
          );

        score += points;
        correct += 1;

        feedbackEl.textContent =
          "Nice! +" + points;

        feedbackEl.className =
          "feedback ok";

        rushSel = {
          left: null,
          right: null
        };

        updateRushHud();

        const remaining =
          matchLeft.querySelectorAll(
            ".match-chip:not(.matched)"
          ).length;

        if (remaining === 0) {

          stopRushTimer();

          setTimeout(
            endMatchRush,
            400
          );
        }

      } else {

        rushCombo = 0;
        wrong += 1;

        rushSel.left.classList.add("wrong-flash");
        rushSel.right.classList.add("wrong-flash");

        feedbackEl.textContent = "Try again";
        feedbackEl.className = "feedback bad";

        const leftButton = rushSel.left;
        const rightButton = rushSel.right;

        rushSel = {
          left: null,
          right: null
        };

        updateRushHud();

        setTimeout(function () {

          leftButton.classList.remove(
            "selected",
            "wrong-flash"
          );

          rightButton.classList.remove(
            "selected",
            "wrong-flash"
          );

        }, 280);
      }
    }
  }

  /* =========================================================
     END MATCH RUSH
     ========================================================= */

  function endMatchRush() {

    stopRushTimer();

    rushLocked = true;

    const play =
      document.getElementById("playScreen");

    if (play) {
      play.classList.remove("play-screen-rush");
    }

    if (matchArea) {
      matchArea.classList.add("hidden");
      matchArea.style.display = "";
    }

    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
    }

    document.getElementById("finalScore").textContent =
      String(score);

    document.getElementById("finalCorrect").textContent =
      String(rushMatches);

    document.getElementById("finalWrong").textContent =
      String(wrong);

    const totalPairs =
      Object.keys(rushMap).length || 1;

    const accuracy =
      Math.round(
        (rushMatches / totalPairs) * 100
      );

    document.getElementById("finalAccuracy").textContent =
      Math.min(100, accuracy) + "%";

    show("result");
  }

  /* =========================================================
     END NORMAL ROUND
     ========================================================= */

  function endRound() {

    if (progressFill) {
      progressFill.style.width = "100%";
    }

    document.getElementById("finalScore").textContent =
      String(score);

    document.getElementById("finalCorrect").textContent =
      String(correct);

    document.getElementById("finalWrong").textContent =
      String(wrong);

    const totalQuestions = queue.length || TOTAL;

    document.getElementById("finalAccuracy").textContent =
      Math.round(
        (correct / totalQuestions) * 100
      ) + "%";

    show("result");
  }

  /* =========================================================
     MENU EVENTS
     ========================================================= */

  document
    .querySelectorAll(".level-list li")
    .forEach(function (li) {

      li.addEventListener(
        "click",
        function (event) {

          /*
            Don't intercept the Match Rush link.
          */
          if (
            li.classList.contains("level-link") ||
            event.target.closest("a")
          ) {
            return;
          }

          const mode =
            li.getAttribute("data-mode");

          if (
            mode &&
            MODES[mode]
          ) {
            startMode(mode);
          }

        }
      );

    });

  /* =========================================================
     BUTTONS
     ========================================================= */

  const backMenu =
    document.getElementById("backMenu");

  const rushShuffleBtn =
    document.getElementById("rushShuffleBtn");

  if (rushShuffleBtn) {

    rushShuffleBtn.addEventListener(
      "click",
      function () {
        shuffleRushBoard();
      }
    );

  }

  if (backMenu) {

    backMenu.addEventListener(
      "click",
      function () {

        stopRushTimer();

        const play =
          document.getElementById("playScreen");

        if (play) {
          play.classList.remove(
            "play-screen-rush"
          );
        }

        show("menu");
      }
    );

  }

  const toMenuBtn =
    document.getElementById("toMenuBtn");

  if (toMenuBtn) {

    toMenuBtn.addEventListener(
      "click",
      function () {

        stopRushTimer();

        const play =
          document.getElementById("playScreen");

        if (play) {
          play.classList.remove(
            "play-screen-rush"
          );
        }

        show("menu");
      }
    );

  }

  const playAgainBtn =
    document.getElementById("playAgainBtn");

  if (playAgainBtn) {

    playAgainBtn.addEventListener(
      "click",
      function () {

        if (modeKey) {
          startMode(modeKey);
        }

      }
    );

  }

  /* =========================================================
     SITE THEME
     ========================================================= */

  function syncSiteTheme() {

    const dark =
      document.documentElement.getAttribute(
        "data-theme"
      ) === "dark";

    document.body.classList.toggle(
      "light-mode",
      !dark
    );
  }

  syncSiteTheme();

  window.addEventListener(
    "site-theme-change",
    syncSiteTheme
  );

  try {

    new MutationObserver(
      syncSiteTheme
    ).observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["data-theme"]
      }
    );

  } catch (_) {}

  /* =========================================================
     START
     ========================================================= */

  show("menu");

})();
