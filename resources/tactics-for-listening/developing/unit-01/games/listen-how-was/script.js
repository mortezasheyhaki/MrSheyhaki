/* How was the weekend? · Tactics For Listening Developing Unit 1 */
(function () {
  "use strict";
  ListenEngine.mount({
    gameId: "tfl-developing-u1-listen-how-was",
    gameName: "How was the weekend?",
    unitLabel: "Unit 1 · Developing",
    icon: "🌟",
    intro: "Listen and choose the word that best describes each person’s weekend.",
    tips: [
      "Tap <strong>Play</strong> to hear the conversation",
      "Choose <strong>a</strong>, <strong>b</strong> or <strong>c</strong>",
      "<strong>4</strong> short listening items",
    ],
    letters: ["a", "b", "c"],
    stars: { two: 3, one: 2 },
    items: [
      {
        prompt: "How was his/her weekend?",
        stem: "The weekend was ________.",
        audio: "https://cdn.imgurl.ir/uploads/y807040_04_Unit_1_-_1.mp3",
        options: ["so-so", "terrible", "great"],
        correct: 2,
      },
      {
        prompt: "How was his/her weekend?",
        stem: "The weekend was ________.",
        audio: "https://cdn.imgurl.ir/uploads/n378091_04_Unit_1_-_2.mp3",
        options: ["disappointing", "pleasant", "boring"],
        correct: 1,
      },
      {
        prompt: "How was his/her weekend?",
        stem: "The weekend was ________.",
        audio: "https://cdn.imgurl.ir/uploads/y74811_04_Unit_1_-_3.mp3",
        options: ["tiring", "terrific", "wonderful"],
        correct: 0,
      },
      {
        prompt: "How was his/her weekend?",
        stem: "The weekend was ________.",
        audio: "https://cdn.imgurl.ir/uploads/a46349_04_Unit_1_-_4.mp3",
        options: ["awful", "quiet", "enjoyable"],
        correct: 2,
      },
    ],
  });
})();
