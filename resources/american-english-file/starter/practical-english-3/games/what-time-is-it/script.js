/* What time is it? · AEF Starter Practical English 3
 * Layout: Tactics Developing "listening station" (listen-how-was style)
 */
(function () {
  "use strict";
  ListenEngine.mount({
    gameId: "starter-pe3-what-time-is-it",
    gameName: "What time is it?",
    unitLabel: "Practical English 3 · Listening",
    category: "american-english-file",
    unit: "starter-pe3",
    backHref: "../",
    icon: "🕐",
    intro: "Listen to each conversation and choose the correct time.",
    tips: [
      "Tap <strong>Play</strong> to hear the dialogue",
      "Choose <strong>a</strong>, <strong>b</strong> or <strong>c</strong>",
      "<strong>3</strong> short listening items",
    ],
    letters: ["a", "b", "c"],
    stars: { two: 2, one: 1 },
    items: [
      {
        prompt: "What time is it?",
        stem: "It's ________.",
        audio: "https://cdn.imgurl.ir/uploads/y158911_.mp3",
        options: ["10 o'clock", "11 o'clock", "12 o'clock"],
        correct: 1, // eleven o'clock
      },
      {
        prompt: "What time is it?",
        stem: "It's ________.",
        audio: "https://cdn.imgurl.ir/uploads/j395374_.mp3",
        options: ["7:45", "8:15", "7:47"],
        correct: 0, // a quarter to eight
      },
      {
        prompt: "What time is it?",
        stem: "It's ________.",
        audio: "https://cdn.imgurl.ir/uploads/i1292_.mp3",
        options: ["10:30", "9:30", "10:10"],
        correct: 0, // half past ten
      },
    ],
  });
})();
