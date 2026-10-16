/* Listen & Choose (2 options) · Tactics For Listening Developing Unit 1 */
(function () {
  "use strict";
  ListenEngine.mount({
    gameId: "tfl-developing-u1-listen-choose",
    gameName: "Listen & Choose",
    unitLabel: "Unit 1 · Developing",
    icon: "🎧",
    intro: "Play each audio, then choose what the person did last weekend.",
    tips: [
      "Tap <strong>Play</strong> to hear the conversation",
      "Choose <strong>a</strong> or <strong>b</strong>",
      "<strong>6</strong> short listening items",
    ],
    letters: ["a", "b"],
    stars: { two: 4, one: 2 },
    items: [
      {
        prompt: "What did she do last weekend?",
        stem: "She ________.",
        audio: "https://cdn.imgurl.ir/uploads/f122394_02_Unit_1_-_1.mp3",
        options: ["went to a club", "watched TV"],
        correct: 1,
      },
      {
        prompt: "What did he do last weekend?",
        stem: "He ________.",
        audio: "https://cdn.imgurl.ir/uploads/l58170_02_Unit_1_-_2.mp3",
        options: ["met a girl", "went to his sister's house"],
        correct: 1,
      },
      {
        prompt: "What did he do last weekend?",
        stem: "He ________.",
        audio: "https://cdn.imgurl.ir/uploads/x12452_02_Unit_1_-_3.mp3",
        options: ["went to the gym", "entered a bodybuilding competition"],
        correct: 0,
      },
      {
        prompt: "What did he do last weekend?",
        stem: "He ________.",
        audio: "https://cdn.imgurl.ir/uploads/a44818_02_Unit_1_-_4.mp3",
        options: ["played with his nephews", "went out with a friend"],
        correct: 0,
      },
      {
        prompt: "What did she do last weekend?",
        stem: "She ________.",
        audio: "https://cdn.imgurl.ir/uploads/k986786_02_Unit_1_-_5.mp3",
        options: ["went to a party", "went to a movie"],
        correct: 1,
      },
      {
        prompt: "What did she do last weekend?",
        stem: "She ________.",
        audio: "https://cdn.imgurl.ir/uploads/u41813_02_Unit_1_-_6.mp3",
        options: ["watched a DVD", "watched baseball on TV"],
        correct: 0,
      },
    ],
  });
})();
