/* True or False · Tactics For Listening Developing Unit 1 */
(function () {
  "use strict";
  // Same 4 audios as "How was the weekend?"
  var AUDIO = [
    "https://cdn.imgurl.ir/uploads/y807040_04_Unit_1_-_1.mp3",
    "https://cdn.imgurl.ir/uploads/n378091_04_Unit_1_-_2.mp3",
    "https://cdn.imgurl.ir/uploads/y74811_04_Unit_1_-_3.mp3",
    "https://cdn.imgurl.ir/uploads/a46349_04_Unit_1_-_4.mp3",
  ];
  ListenEngine.mount({
    gameId: "tfl-developing-u1-listen-true-false",
    gameName: "True or False",
    unitLabel: "Unit 1 · Developing",
    icon: "✅",
    intro: "Play each audio, then choose the statement that is true.",
    tips: [
      "Tap <strong>Play</strong> to hear the conversation",
      "Choose the <strong>true</strong> statement (a or b)",
      "<strong>4</strong> short listening items",
    ],
    letters: ["a", "b"],
    stars: { two: 3, one: 2 },
    items: [
      {
        prompt: "Which statement is true?",
        stem: "Listen carefully, then choose the correct statement.",
        audio: AUDIO[0],
        options: ["She won a contest in a music store.", "She won a trip to Las Vegas."],
        correct: 1,
      },
      {
        prompt: "Which statement is true?",
        stem: "Listen carefully, then choose the correct statement.",
        audio: AUDIO[1],
        options: ["They went to a restaurant for dinner.", "His friend has a very interesting job."],
        correct: 1,
      },
      {
        prompt: "Which statement is true?",
        stem: "Listen carefully, then choose the correct statement.",
        audio: AUDIO[2],
        options: ["The park is very far from town.", "They didn't see any wild birds or butterflies on the trip."],
        correct: 1,
      },
      {
        prompt: "Which statement is true?",
        stem: "Listen carefully, then choose the correct statement.",
        audio: AUDIO[3],
        options: ["There were a lot of interesting people at the party.", "The party ended early."],
        correct: 0,
      },
    ],
  });
})();
