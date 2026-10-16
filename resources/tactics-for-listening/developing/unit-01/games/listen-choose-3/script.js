/* Listen & Choose (3 options) · Tactics For Listening Developing Unit 1 */
(function () {
  "use strict";
  ListenEngine.mount({
    gameId: "tfl-developing-u1-listen-choose-3",
    gameName: "Listen & Choose",
    unitLabel: "Unit 1 · Developing",
    icon: "🎧",
    intro: "Play each audio, then choose the correct activity (a, b or c).",
    tips: [
      "Tap <strong>Play</strong> to hear the conversation",
      "Choose <strong>a</strong>, <strong>b</strong> or <strong>c</strong>",
      "<strong>6</strong> short listening items",
    ],
    letters: ["a", "b", "c"],
    stars: { two: 4, one: 2 },
    items: [
      {
        prompt: "What did he do last weekend?",
        stem: "He ________.",
        audio: "https://cdn.imgurl.ir/uploads/o413798_1_No_he_didn39t.mp3",
        options: ["watched a science program on TV", "played video games", "went to a movie"],
        correct: 2,
      },
      {
        prompt: "What did he do last weekend?",
        stem: "He ________.",
        audio: "https://cdn.imgurl.ir/uploads/a61427_2_No_he_didn39t.mp3",
        options: ["stayed at home", "went to the beach for the weekend", "went to the mountains"],
        correct: 1,
      },
      {
        prompt: "What did he do last weekend?",
        stem: "He ________.",
        audio: "https://cdn.imgurl.ir/uploads/u65615_3_Yes_he_did..mp3",
        options: ["read lots of interesting magazines", "used the computer", "read an interesting book"],
        correct: 2,
      },
      {
        prompt: "What did she do last weekend?",
        stem: "She ________.",
        audio: "https://cdn.imgurl.ir/uploads/b537154_4_Yes_she_did..mp3",
        options: ["played in a band", "went to a concert", "played tennis"],
        correct: 1,
      },
      {
        prompt: "What did she do last weekend?",
        stem: "She ________.",
        audio: "https://cdn.imgurl.ir/uploads/p6925_5_No_she_didn39t..mp3",
        options: ["stayed home and watched TV", "studied for an exam", "went out with friends"],
        correct: 1,
      },
      {
        prompt: "What did she do last weekend?",
        stem: "She ________.",
        audio: "https://cdn.imgurl.ir/uploads/p481_6_Yes_she_did..mp3",
        options: ["visited friends", "went to the countryside", "went out with friends"],
        correct: 2,
      },
    ],
  });
})();
