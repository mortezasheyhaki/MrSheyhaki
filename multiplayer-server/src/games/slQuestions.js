/**
 * Snakes & Ladders question banks (server-authoritative).
 * Choice questions have `choices` + `answer` (index), optional `ui: "chips"`.
 * Typed questions have `type: "type"`, validator (`check`, `rawCheck`, `blanks`, or `checkJoined`) and `model`.
 */

export const QUESTION_SQUARES = [
  2, 6, 11, 12, 15, 17, 20, 23, 27, 32, 34, 41, 44, 51, 52, 54,
  60, 61, 64, 69, 73, 74, 81, 83, 90, 91, 94, 95, 97,
];

const BEGINNER_BASE = [
  { id: 1, q: "Which of these words isn't used with the present simple?", choices: ["always", "never", "now"], answer: 2, ui: "chips" },
  { id: 2, q: "Which sentence is correct?", choices: ["I usually play football after school on Wednesdays.", "I'm usually playing football after school on Wednesdays."], answer: 0 },
  { id: 3, q: "What's the missing word? Where ______ you going?", choices: ["do", "are", "is"], answer: 1, ui: "chips" },
  { id: 4, q: "Which time word isn't used with the present continuous?", choices: ["Today", "Sometimes", "Now"], answer: 1, ui: "chips" },
  { id: 5, q: "Correct ending: 'I always…'", choices: ["… get up at 7am.", "… am getting up at 7am.", "… getting up at 7am."], answer: 0 },
  { id: 6, q: "Why is the present simple used? 'I live in a small city in France.'", choices: ["It's a temporary action", "It's a permanent fact / routine", "It's happening right now"], answer: 1 },
  { id: 7, q: "Finish: I can't talk right now because I ______ (have) lunch.", choices: ["have", "am having", "having"], answer: 1, ui: "chips" },
  { id: 8, q: "Correct this: Sarah and Michael watching a film.", choices: ["Sarah and Michael is watching a film.", "Sarah and Michael are watching a film.", "Sarah and Michael watch a film."], answer: 1 },
  { id: 9, q: "Which sentence is correct?", choices: ["I don't see my grandmother every day.", "I'm not seeing my grandmother every day.", "I not see my grandmother every day."], answer: 0 },
  { id: 10, q: "Make a correct sentence: We / have / a lot of fun on holiday this week.", choices: ["We have a lot of fun on holiday this week.", "We are having a lot of fun on holiday this week.", "We having a lot of fun on holiday this week."], answer: 1 },
  { id: 11, q: "Correct this: I'm not knowing how to cook.", choices: ["I don't know how to cook.", "I'm not know how to cook.", "I not knowing how to cook."], answer: 0 },
  { id: 12, q: "Emmanuelle and Fred ______ (not like) Paris, so they ______ (not enjoy) their holiday.", choices: ["don't like / aren't enjoying", "aren't liking / don't enjoy", "don't like / don't enjoy"], answer: 0 },
  { id: 13, q: "I usually ______ (wear) jeans, but today I ______ (not wear) jeans.", choices: ["wear / am not wearing", "am wearing / don't wear", "wear / don't wear"], answer: 0 },
  { id: 14, q: "Correct this: I don't never do my homework.", choices: ["I never do my homework.", "I don't ever not do my homework.", "I'm never doing my homework."], answer: 0 },
  { id: 15, q: "Difference: a) She's an angry person. b) She's feeling angry today.", choices: ["a = permanent character, b = temporary feeling", "a = temporary, b = permanent", "No difference"], answer: 0 },
  { id: 16, q: "Finish: 'My brother and sister are making dinner…'", choices: ["… usually.", "… on Saturdays.", "… at the moment."], answer: 2, ui: "chips" },
  { id: 17, q: "Lilly ______ (not usually) ______ (eat) cake, but today she ______ (eat) chocolate cake.", choices: ["doesn't usually eat / is eating", "isn't usually eating / eats", "doesn't usually eat / eats"], answer: 0 },
  { id: 18, q: "I'm not in the office today, because…", choices: ["… I visiting my aunt.", "… I'm visiting my aunt.", "… I visit my aunt."], answer: 1 },
  { id: 19, q: "Make a correct sentence: Where / Lana / go to school?", choices: ["Where does Lana go to school?", "Where is Lana go to school?", "Where Lana goes to school?"], answer: 0 },
  { id: 20, q: "Correct this: Who are George live with?", choices: ["Who does George live with?", "Who is George live with?", "Who George lives with?"], answer: 0 },
];

const BEGINNER_EXTRA = [
  { id: 21, q: "Which of these words is commonly used with the Present Continuous?", choices: ["Yesterday", "Now", "Every morning"], answer: 1, ui: "chips" },
  { id: 22, q: "Which sentence is correct? Why?", choices: ["I'm watching a movie right now.", "I watching a movie right now."], answer: 0 },
  { id: 23, q: "Complete the question: Where [[0]] your friends going?", type: "type", blanks: [(t) => t === "are"], model: "Where are your friends going?" },
  { id: 24, q: "Which time expression is NOT suitable for the Present Continuous?", choices: ["At the moment", "Right now", "Every weekend"], answer: 2, ui: "chips" },
  { id: 25, q: "Choose the correct form: 'She ______ a book.'", choices: ["is reading", "are reading", "reading"], answer: 0, ui: "chips" },
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

export const SIMPLE_PRESENT_VS_CONTINUOUS = [...BEGINNER_BASE, ...BEGINNER_EXTRA];

const PC_WORD_BOX = ["eat", "swim", "study", "wait", "build"];

export const PRESENT_CONTINUOUS_QUESTIONS = [
  // PART 1: Choose the correct "be" verb (am / is / are) — chips
  { id: 101, promptLabel: 'Choose the correct "be" verb', q: "She ( ___ ) reading a book.", choices: ["am", "is", "are"], answer: 1, ui: "chips" },
  { id: 102, promptLabel: 'Choose the correct "be" verb', q: "They ( ___ ) playing football.", choices: ["am", "is", "are"], answer: 2, ui: "chips" },
  { id: 103, promptLabel: 'Choose the correct "be" verb', q: "I ( ___ ) doing my homework.", choices: ["am", "is", "are"], answer: 0, ui: "chips" },
  { id: 104, promptLabel: 'Choose the correct "be" verb', q: "He ( ___ ) watching TV.", choices: ["am", "is", "are"], answer: 1, ui: "chips" },
  { id: 105, promptLabel: 'Choose the correct "be" verb', q: "We ( ___ ) cooking dinner.", choices: ["am", "is", "are"], answer: 2, ui: "chips" },
  { id: 106, promptLabel: 'Choose the correct "be" verb', q: "You ( ___ ) listening to music.", choices: ["am", "is", "are"], answer: 2, ui: "chips" },
  { id: 107, promptLabel: 'Choose the correct "be" verb', q: "The cat ( ___ ) sleeping on the sofa.", choices: ["am", "is", "are"], answer: 1, ui: "chips" },
  { id: 108, promptLabel: 'Choose the correct "be" verb', q: "My friends ( ___ ) coming to my house.", choices: ["am", "is", "are"], answer: 2, ui: "chips" },
  { id: 109, promptLabel: 'Choose the correct "be" verb', q: "It ( ___ ) raining outside.", choices: ["am", "is", "are"], answer: 1, ui: "chips" },
  { id: 110, promptLabel: 'Choose the correct "be" verb', q: "The children ( ___ ) drawing pictures.", choices: ["am", "is", "are"], answer: 2, ui: "chips" },

  // PART 2: Choose the correct -ing form — chips
  { id: 111, promptLabel: "Choose the correct -ing form", q: "make → ______", choices: ["makeing", "making"], answer: 1, ui: "chips" },
  { id: 112, promptLabel: "Choose the correct -ing form", q: "run → ______", choices: ["runing", "running"], answer: 1, ui: "chips" },
  { id: 113, promptLabel: "Choose the correct -ing form", q: "sit → ______", choices: ["siting", "sitting"], answer: 1, ui: "chips" },
  { id: 114, promptLabel: "Choose the correct -ing form", q: "write → ______", choices: ["writeing", "writing"], answer: 1, ui: "chips" },
  { id: 115, promptLabel: "Choose the correct -ing form", q: "swim → ______", choices: ["swiming", "swimming"], answer: 1, ui: "chips" },
  { id: 116, promptLabel: "Choose the correct -ing form", q: "come → ______", choices: ["comeing", "coming"], answer: 1, ui: "chips" },
  { id: 117, promptLabel: "Choose the correct -ing form", q: "get → ______", choices: ["geting", "getting"], answer: 1, ui: "chips" },
  { id: 118, promptLabel: "Choose the correct -ing form", q: "dance → ______", choices: ["danceing", "dancing"], answer: 1, ui: "chips" },
  { id: 119, promptLabel: "Choose the correct -ing form", q: "stop → ______", choices: ["stoping", "stopping"], answer: 1, ui: "chips" },
  { id: 120, promptLabel: "Choose the correct -ing form", q: "lie → ______", choices: ["lieing", "lying"], answer: 1, ui: "chips" },

  // PART 3: Change the verbs to their -ing form — writing box
  { id: 121, promptLabel: "Write the -ing form", q: "play → [[0]]", type: "type", blanks: [(t) => t === "playing"], model: "playing" },
  { id: 122, promptLabel: "Write the -ing form", q: "read → [[0]]", type: "type", blanks: [(t) => t === "reading"], model: "reading" },
  { id: 123, promptLabel: "Write the -ing form", q: "begin → [[0]]", type: "type", blanks: [(t) => t === "beginning"], model: "beginning" },
  { id: 124, promptLabel: "Write the -ing form", q: "take → [[0]]", type: "type", blanks: [(t) => t === "taking"], model: "taking" },
  { id: 125, promptLabel: "Write the -ing form", q: "shop → [[0]]", type: "type", blanks: [(t) => t === "shopping"], model: "shopping" },
  { id: 126, promptLabel: "Write the -ing form", q: "study → [[0]]", type: "type", blanks: [(t) => t === "studying"], model: "studying" },
  { id: 127, promptLabel: "Write the -ing form", q: "clap → [[0]]", type: "type", blanks: [(t) => t === "clapping"], model: "clapping" },
  { id: 128, promptLabel: "Write the -ing form", q: "ride → [[0]]", type: "type", blanks: [(t) => t === "riding"], model: "riding" },
  { id: 129, promptLabel: "Write the -ing form", q: "fly → [[0]]", type: "type", blanks: [(t) => t === "flying"], model: "flying" },
  { id: 130, promptLabel: "Write the -ing form", q: "put → [[0]]", type: "type", blanks: [(t) => t === "putting"], model: "putting" },
  { id: 131, promptLabel: "Write the -ing form", q: "have → [[0]]", type: "type", blanks: [(t) => t === "having"], model: "having" },
  { id: 132, promptLabel: "Write the -ing form", q: "travel → [[0]]", type: "type", blanks: [(t) => t === "traveling" || t === "travelling"], model: "traveling" },

  // PART 4: Word box + write in -ing form — writing box
  { id: 133, promptLabel: "Choose from the word box and write in -ing form", wordBox: PC_WORD_BOX, q: "Look! The dog is [[0]] its food.", type: "type", blanks: [(t) => t === "eating"], model: "eating" },
  { id: 134, promptLabel: "Choose from the word box and write in -ing form", wordBox: PC_WORD_BOX, q: "My brother is [[0]] for the bus right now.", type: "type", blanks: [(t) => t === "waiting"], model: "waiting" },
  { id: 135, promptLabel: "Choose from the word box and write in -ing form", wordBox: PC_WORD_BOX, q: "They are [[0]] a sandcastle on the beach.", type: "type", blanks: [(t) => t === "building"], model: "building" },
  { id: 136, promptLabel: "Choose from the word box and write in -ing form", wordBox: PC_WORD_BOX, q: "She is [[0]] for her exam at the moment.", type: "type", blanks: [(t) => t === "studying"], model: "studying" },
  { id: 137, promptLabel: "Choose from the word box and write in -ing form", wordBox: PC_WORD_BOX, q: "We are [[0]] in the pool today.", type: "type", blanks: [(t) => t === "swimming"], model: "swimming" },

  // PART 5: Reorder the words — writing box (capital letter & punctuation required)
  { id: 138, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "is / She / dinner / cooking / .", type: "type", rawCheck: (r) => /^She (is|'s) cooking dinner\.$/.test(r), model: "She is cooking dinner." },
  { id: 139, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "playing / are / The kids / outside / .", type: "type", rawCheck: (r) => /^The kids are playing outside\.$/.test(r), model: "The kids are playing outside." },
  { id: 140, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "am / I / to music / listening / .", type: "type", rawCheck: (r) => /^(I am|I'm) listening to music\.$/.test(r), model: "I am listening to music." },
  { id: 141, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "not / He / sleeping / is / .", type: "type", rawCheck: (r) => /^He (is not|isn't|'s not) sleeping\.$/.test(r), model: "He is not sleeping." },
  { id: 142, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "are / We / not / working / today / .", type: "type", rawCheck: (r) => /^We (are not|aren't|'re not) working today\.$/.test(r), model: "We are not working today." },
  { id: 143, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "isn't / She / TV / watching / .", type: "type", rawCheck: (r) => /^She (isn't|is not) watching TV\.$/.test(r), model: "She isn't watching TV." },
  { id: 144, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "you / Are / coming / to the party / ?", type: "type", rawCheck: (r) => /^Are you coming to the party\?$/.test(r), model: "Are you coming to the party?" },
  { id: 145, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "is / What / doing / he / ?", type: "type", rawCheck: (r) => /^What is he doing\?$/.test(r), model: "What is he doing?" },
  { id: 146, promptLabel: "Make a sentence by reordering the words", hint: "Don't forget capital letters and punctuation (. or ?).", q: "they / Are / playing / tennis / ?", type: "type", rawCheck: (r) => /^Are they playing tennis\?$/.test(r), model: "Are they playing tennis?" },

  // PART 6: Fill in the blanks using the verb in parentheses (positive, negative, or question)
  { id: 147, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "She [[0]] [[1]] (read) a magazine right now.", type: "type", blanks: [(t) => t === "is", (t) => t === "reading"], model: "She is reading a magazine right now." },
  { id: 148, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "They [[0]] [[1]] (not / play) video games at the moment.", type: "type", blanks: [(t) => /^(are not|aren't|are)$/.test(t), (t) => /^(not )?playing$/.test(t)], checkJoined: (j) => /^(are not|aren't) playing$/.test(j), model: "They aren't playing video games at the moment." },
  { id: 149, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "[[0]] you [[1]] (study) for the test?", type: "type", blanks: [(t) => t === "are", (t) => t === "studying"], model: "Are you studying for the test?" },
  { id: 150, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "We [[0]] [[1]] (wait) for the train.", type: "type", blanks: [(t) => t === "are", (t) => t === "waiting"], model: "We are waiting for the train." },
  { id: 151, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "He [[0]] [[1]] (not / listen) to the teacher.", type: "type", blanks: [(t) => /^(is not|isn't|is)$/.test(t), (t) => /^(not )?listening$/.test(t)], checkJoined: (j) => /^(is not|isn't) listening$/.test(j), model: "He isn't listening to the teacher." },
  { id: 152, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "[[0]] she [[1]] (work) in the garden?", type: "type", blanks: [(t) => t === "is", (t) => t === "working"], model: "Is she working in the garden?" },
  { id: 153, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "I [[0]] [[1]] (write) an email to my friend.", type: "type", blanks: [(t) => t === "am", (t) => t === "writing"], model: "I am writing an email to my friend." },
  { id: 154, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "The baby [[0]] [[1]] (not / sleep) right now.", type: "type", blanks: [(t) => /^(is not|isn't|is)$/.test(t), (t) => /^(not )?sleeping$/.test(t)], checkJoined: (j) => /^(is not|isn't) sleeping$/.test(j), model: "The baby isn't sleeping right now." },
  { id: 155, promptLabel: "Fill in the blanks (positive, negative, or question)", q: "[[0]] they [[1]] (come) to the meeting?", type: "type", blanks: [(t) => t === "are", (t) => t === "coming"], model: "Are they coming to the meeting?" },
];

export const DEFAULT_TOPIC = "simple-present-vs-continuous";

export const TOPICS = {
  "simple-present-vs-continuous": {
    id: "simple-present-vs-continuous",
    title: "Simple Present vs Present Continuous",
    description: "Mixed tense contrast, error correction, choices, and writing tasks.",
    questions: SIMPLE_PRESENT_VS_CONTINUOUS,
  },
  "present-continuous": {
    id: "present-continuous",
    title: "Present Continuous",
    description: "Be verbs (am/is/are), -ing spelling, word box, sentence order, and blanks.",
    questions: PRESENT_CONTINUOUS_QUESTIONS,
  },
};

/** Legacy levels map preserved for backwards compatibility. */
export const LEVELS = {
  beginner: SIMPLE_PRESENT_VS_CONTINUOUS,
  elementary: [],
};

export function normalizeTopicId(topic) {
  return topic && TOPICS[topic] ? topic : DEFAULT_TOPIC;
}

export function getTopicQuestions(topic) {
  return TOPICS[normalizeTopicId(topic)].questions;
}
