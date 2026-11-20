/**
 * Snakes & Ladders question bank (server-authoritative).
 * Choice questions have `choices` + `answer` (index).
 * Typed questions have `type: "type"`, a `check(text)` validator and a `model` answer.
 * Text passed to check() is already normalised: lowercase, single spaces, ’ → '.
 */

export const QUESTION_SQUARES = [
  2, 6, 11, 12, 15, 17, 20, 23, 27, 32, 34, 41, 44, 51, 52, 54,
  60, 61, 64, 69, 73, 74, 81, 83, 90, 91, 94, 95, 97,
];

const BEGINNER_BASE = [
  { id: 1, q: "Which of these words isn't used with the present simple?", choices: ["always", "never", "now"], answer: 2 },
  { id: 2, q: "Which sentence is correct?", choices: ["I usually play football after school on Wednesdays.", "I'm usually playing football after school on Wednesdays."], answer: 0 },
  { id: 3, q: "What's the missing word? Where ______ you going?", choices: ["do", "are", "is"], answer: 1 },
  { id: 4, q: "Which time word isn't used with the present continuous?", choices: ["Today", "Sometimes", "Now"], answer: 1 },
  { id: 5, q: "Correct ending: 'I always…'", choices: ["… get up at 7am.", "… am getting up at 7am.", "… getting up at 7am."], answer: 0 },
  { id: 6, q: "Why is the present simple used? 'I live in a small city in France.'", choices: ["It's a temporary action", "It's a permanent fact / routine", "It's happening right now"], answer: 1 },
  { id: 7, q: "Finish: I can't talk right now because I ______ (have) lunch.", choices: ["have", "am having", "having"], answer: 1 },
  { id: 8, q: "Correct this: Sarah and Michael watching a film.", choices: ["Sarah and Michael is watching a film.", "Sarah and Michael are watching a film.", "Sarah and Michael watch a film."], answer: 1 },
  { id: 9, q: "Which sentence is correct?", choices: ["I don't see my grandmother every day.", "I'm not seeing my grandmother every day.", "I not see my grandmother every day."], answer: 0 },
  { id: 10, q: "Make a correct sentence: We / have / a lot of fun on holiday this week.", choices: ["We have a lot of fun on holiday this week.", "We are having a lot of fun on holiday this week.", "We having a lot of fun on holiday this week."], answer: 1 },
  { id: 11, q: "Correct this: I'm not knowing how to cook.", choices: ["I don't know how to cook.", "I'm not know how to cook.", "I not knowing how to cook."], answer: 0 },
  { id: 12, q: "Emmanuelle and Fred ______ (not like) Paris, so they ______ (not enjoy) their holiday.", choices: ["don't like / aren't enjoying", "aren't liking / don't enjoy", "don't like / don't enjoy"], answer: 0 },
  { id: 13, q: "I usually ______ (wear) jeans, but today I ______ (not wear) jeans.", choices: ["wear / am not wearing", "am wearing / don't wear", "wear / don't wear"], answer: 0 },
  { id: 14, q: "Correct this: I don't never do my homework.", choices: ["I never do my homework.", "I don't ever not do my homework.", "I'm never doing my homework."], answer: 0 },
  { id: 15, q: "Difference: a) She's an angry person. b) She's feeling angry today.", choices: ["a = permanent character, b = temporary feeling", "a = temporary, b = permanent", "No difference"], answer: 0 },
  { id: 16, q: "Finish: 'My brother and sister are making dinner…'", choices: ["… usually.", "… on Saturdays.", "… at the moment."], answer: 2 },
  { id: 17, q: "Lilly ______ (not usually) ______ (eat) cake, but today she ______ (eat) chocolate cake.", choices: ["doesn't usually eat / is eating", "isn't usually eating / eats", "doesn't usually eat / eats"], answer: 0 },
  { id: 18, q: "I'm not in the office today, because…", choices: ["… I visiting my aunt.", "… I'm visiting my aunt.", "… I visit my aunt."], answer: 1 },
  { id: 19, q: "Make a correct sentence: Where / Lana / go to school?", choices: ["Where does Lana go to school?", "Where is Lana go to school?", "Where Lana goes to school?"], answer: 0 },
  { id: 20, q: "Correct this: Who are George live with?", choices: ["Who does George live with?", "Who is George live with?", "Who George lives with?"], answer: 0 },
];

// Beginner — extra questions (images 1–25 → ids 21–45). Keep in step with the client.
const BEGINNER_EXTRA = [
  { id: 21, q: "Which of these words is commonly used with the Present Continuous?", choices: ["Yesterday", "Now", "Every morning"], answer: 1 },
  { id: 22, q: "Which sentence is correct? Why?", choices: ["I'm watching a movie right now.", "I watching a movie right now."], answer: 0 },
  { id: 23, q: "Complete the question: Where [[0]] your friends going?", type: "type", blanks: [(t) => t === "are"], model: "Where are your friends going?" },
  { id: 24, q: "Which time expression is NOT suitable for the Present Continuous?", choices: ["At the moment", "Right now", "Every weekend"], answer: 2 },
  { id: 25, q: "Choose the correct form: 'She ______ a book.'", choices: ["is reading", "are reading", "reading"], answer: 0 },
  { id: 26, q: "Why is the Present Continuous used here? 'Look! The children are playing in the garden.'", choices: ["It's happening now", "It's a permanent fact", "It's a past action"], answer: 0 },
  { id: 27, q: "I can't talk right now because I [[0]] (do) my homework.", type: "type", blanks: [(t) => t === "am doing"], model: "I can't talk right now because I am doing my homework." },
  { id: 28, q: "Correct the mistake: Sarah and Michael watching a film at the moment.", type: "type", check: (t) => /^sarah and michael (are|'re) watching a film at the moment\.?$/.test(t), model: "Sarah and Michael are watching a film at the moment." },
  { id: 29, q: "Which sentence is correct? Why?", choices: ["They aren't playing basketball now.", "They not playing basketball now.", "They isn't playing basketball now."], answer: 0 },
  { id: 30, q: "Make a correct question: What / you / do / right now?", type: "type", check: (t) => /^what are you doing right now\??$/.test(t), model: "What are you doing right now?" },
  { id: 31, q: "Correct the mistake: I'm not understanding this exercise.", type: "type", check: (t) => /^i (do not|don't) understand this exercise\.?$/.test(t), model: "I don't understand this exercise." },
  { id: 32, q: "Emma and Jack [[0]] (not / study) for the exam. They [[1]] (play) video games.", type: "type", blanks: [(t) => /^(aren'?t|are not) studying$/.test(t), (t) => t === "are playing"], model: "Emma and Jack aren't studying for the exam. They are playing video games." },
  { id: 33, q: "I [[0]] (wear) my favorite T-shirt today, but my brother [[1]] (wear) his school uniform.", type: "type", blanks: [(t) => /^(am|'m) wearing$/.test(t), (t) => /^(is|'s) wearing$/.test(t)], model: "I'm wearing my favorite T-shirt today, but my brother is wearing his school uniform." },
  { id: 34, q: "Correct the mistake: What is your friends doing?", type: "type", check: (t) => /^what are your friends doing\??$/.test(t), model: "What are your friends doing?" },
  { id: 35, q: "What is the difference in meaning between 'He's sitting on the sofa.' and 'He's standing next to the sofa.'?", choices: ["Sitting vs. standing position", "Past vs. future action", "No difference"], answer: 0 },
  { id: 36, q: "Finish the sentence: 'My parents are cooking dinner…' (write 'at the moment' or 'right now')", type: "type", check: (t) => /(at the moment|right now)/.test(t), model: "at the moment / right now" },
  { id: 37, q: "Lilly [[0]] (not / watch) TV right now. She [[1]] (write) an email to her friend.", type: "type", blanks: [(t) => /^(isn'?t|is not) watching$/.test(t), (t) => t === "is writing"], model: "Lilly isn't watching TV right now. She is writing an email to her friend." },
  { id: 38, q: "Choose the best ending: 'I'm not going to school today because…'", choices: ["… I'm feeling sick.", "… I am feel sick."], answer: 0 },
  { id: 39, q: "Put the words in the correct order: Where / Lana / go / right now?", type: "type", check: (t) => /^where is lana going right now\??$/.test(t), model: "Where is Lana going right now?" },
  { id: 40, q: "Correct the mistake: Who are George talking to?", type: "type", check: (t) => /^who is george talking to\??$/.test(t), model: "Who is George talking to?" },
  { id: 41, q: "Which sentence has the correct negative form?", choices: ["He isn't wearing a jacket.", "He doesn't wearing a jacket.", "He not is wearing a jacket."], answer: 0 },
  { id: 42, q: "Complete the question: [[0]] they having lunch at the moment?", type: "type", blanks: [(t) => t === "are"], model: "Are they having lunch at the moment?" },
  { id: 43, q: "Put the words in the correct order: is / why / crying / the baby / ?", type: "type", check: (t) => /^why is the baby crying\??$/.test(t), model: "Why is the baby crying?" },
  { id: 44, q: "Correct TWO mistakes: My friends is playing football, and I am siting on the bench.", type: "type", check: (t) => /friends are playing/.test(t) && /sitting on the bench/.test(t), model: "My friends are playing football, and I am sitting on the bench." },
  { id: 45, q: "Your best friend is in the kitchen. He has a cake, some eggs, and a bowl. What is he doing? Write a Present Continuous sentence.", type: "type", check: (t) => /\b(i'?m|am|is|are|'s|'re)\s+\w+ing\b/.test(t), model: "He is making a cake." },
];

/** Levels. Add Elementary questions to `elementary` when ready. */
export const LEVELS = {
  beginner: [...BEGINNER_BASE, ...BEGINNER_EXTRA],
  elementary: [],
};
