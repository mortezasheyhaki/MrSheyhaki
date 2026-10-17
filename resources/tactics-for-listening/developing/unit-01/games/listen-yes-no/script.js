/* Yes or No · Tactics For Listening Developing Unit 1 */
(function () {
  "use strict";
  ListenEngine.mount({
    gameId: "tfl-developing-u1-listen-yes-no",
    gameName: "Yes or No",
    unitLabel: "Unit 1 · Developing",
    icon: "👍",
    intro: "Play each audio and decide if the person enjoyed their weekend.",
    tips: [
      "Tap <strong>Play</strong> to hear the conversation",
      "Choose <strong>Yes</strong> or <strong>No</strong>",
      "<strong>6</strong> short listening items",
    ],
    letters: ["a", "b"],
    stars: { two: 4, one: 2 },
    items: [
      {
        prompt: "Did he enjoy his weekend?",
        stem: "",
        audio: "https://cdn.imgurl.ir/uploads/o413798_1_No_he_didn39t.mp3",
        options: ["Yes, he did.", "No, he didn't."],
        correct: 1,
      },
      {
        prompt: "Did he enjoy his weekend?",
        stem: "",
        audio: "https://cdn.imgurl.ir/uploads/a61427_2_No_he_didn39t.mp3",
        options: ["Yes, he did.", "No, he didn't."],
        correct: 1,
      },
      {
        prompt: "Did he enjoy his weekend?",
        stem: "",
        audio: "https://cdn.imgurl.ir/uploads/u65615_3_Yes_he_did..mp3",
        options: ["Yes, he did.", "No, he didn't."],
        correct: 0,
      },
      {
        prompt: "Did she enjoy her weekend?",
        stem: "",
        audio: "https://cdn.imgurl.ir/uploads/b537154_4_Yes_she_did..mp3",
        options: ["Yes, she did.", "No, she didn't."],
        correct: 0,
      },
      {
        prompt: "Did she enjoy her weekend?",
        stem: "",
        audio: "https://cdn.imgurl.ir/uploads/p6925_5_No_she_didn39t..mp3",
        options: ["Yes, she did.", "No, she didn't."],
        correct: 1,
      },
      {
        prompt: "Did she enjoy her weekend?",
        stem: "",
        audio: "https://cdn.imgurl.ir/uploads/p481_6_Yes_she_did..mp3",
        options: ["Yes, she did.", "No, she didn't."],
        correct: 0,
      },
    ],
  });
})();
