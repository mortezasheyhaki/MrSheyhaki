/* Penalty Shootout – SUBJECTS (server copy, generated from multiplayer/penalty-shootout/subjects.js; keep both in sync).
   Penalty Shootout – SUBJECTS (question banks).
   To add a subject: copy one block below, change the text, and add it to the list.
   Each question needs:
     q      the question or sentence shown to the player
     answer the one right answer (shown on a chip)
     wrong  a list of wrong answers (the game picks some of them at random)
     hint   (optional) a small extra line under the question
     prompt (optional) a line above this question that overrides the subject prompt
     type   "write" for a writing box: the player types the answer instead of tapping a chip.
            answer   the answer shown when it is wrong (write it as the model answer)
            answers  (optional) every accepted spelling/form, e.g. ["aren't playing", "are not playing"]
            strict   (optional) true = capitals and punctuation must match exactly (sentence reordering)
            Without type, a question uses chips: the right answer plus the wrong ones.
   Subject settings:
     id     a short unique name (letters, numbers, dashes)
     title  the name on the subject card          emoji  the icon on the card
     tag    the small label (book · unit · skill)
     prompt the line above the question           chips  how many answer chips to show (2–4)
*/
export const PS_SUBJECTS = [
  {
    id: "t2t1-u07-home",
    title: "Home vocabulary",
    tag: "Teen2Teen 1 · Unit 7",
    emoji: "🏠",
    prompt: "Which one is it?",
    chips: 3,
    questions: [
      {"q": "You sleep in this room.", "answer": "a bedroom", "wrong": ["a kitchen", "a bathroom", "a living room"]},
      {"q": "You take a shower or a bath in this room.", "answer": "a bathroom", "wrong": ["a bedroom", "a kitchen", "a living room"]},
      {"q": "You watch TV and relax with your family in this room.", "answer": "a living room", "wrong": ["a kitchen", "a bathroom"]},
      {"q": "You cook food in this room.", "answer": "a kitchen", "wrong": ["a bedroom", "a bathroom", "a living room"]},
      {"q": "You do your homework at this piece of furniture.", "answer": "a desk", "wrong": ["a bed", "a sofa"]},
      {"q": "You sleep on this every night.", "answer": "a bed", "wrong": ["a desk", "a chair", "a fridge", "a bathtub"]},
      {"q": "You stand under this to wash your body.", "answer": "a shower", "wrong": ["a toilet", "a desk", "a fridge", "a chair"]},
      {"q": "You fill this with water and sit in it to get clean.", "answer": "a bathtub", "wrong": ["a desk", "a sofa", "a chair", "a fridge"]},
      {"q": "You sit on this when you use the toilet.", "answer": "a toilet", "wrong": ["a fridge", "a desk", "a shower", "a bathtub"]},
      {"q": "You sit on this soft seat in the living room.", "answer": "a sofa", "wrong": ["a desk", "a fridge", "a bathtub", "a toilet"]},
      {"q": "You sit on this at a table or a desk.", "answer": "a chair", "wrong": ["a fridge", "a bed", "a shower", "a sink"]},
      {"q": "You keep food and drinks cold in this.", "answer": "a fridge", "wrong": ["a desk", "a chair", "a sofa", "a bed"]},
      {"q": "You wash your hands in this.", "answer": "a sink", "wrong": ["a bed", "a sofa", "a fridge", "a desk", "a chair"]}
    ]
  },
  {
    id: "t2t1-u12-should",
    title: "Should or shouldn't?",
    tag: "Teen2Teen 1 · Unit 12",
    emoji: "👍",
    prompt: "Choose the correct answer.",
    chips: 2,
    questions: [
      {"q": "Should I visit the museum today?", "hint": "It is closed on Mondays.", "answer": "No, you shouldn't.", "wrong": ["Yes, you should."]},
      {"q": "Should she buy that expensive dress?", "hint": "It costs too much money.", "answer": "No, she shouldn't.", "wrong": ["Yes, she should."]},
      {"q": "Should they travel to the mountains in winter?", "hint": "It is very cold and snowy there.", "answer": "No, they shouldn't.", "wrong": ["Yes, they should."]},
      {"q": "Should we take an umbrella to London?", "hint": "It rains a lot there in the spring.", "answer": "Yes, we should.", "wrong": ["No, we shouldn't."]},
      {"q": "Should he eat the spicy soup?", "hint": "He doesn't like hot food.", "answer": "No, he shouldn't.", "wrong": ["Yes, he should."]},
      {"q": "Should I call a taxi to the airport?", "hint": "The airport is very far from here.", "answer": "Yes, you should.", "wrong": ["No, you shouldn't."]},
      {"q": "Should my parents book a hotel room?", "hint": "All the good hotels are full this weekend.", "answer": "Yes, they should.", "wrong": ["No, they shouldn't."]},
      {"q": "Should we swim in the ocean right now?", "hint": "The water is very cold and dangerous today.", "answer": "No, we shouldn't.", "wrong": ["Yes, we should."]},
      {"q": "Should I try the local street food?", "hint": "The food here is famous and delicious!", "answer": "Yes, you should.", "wrong": ["No, you shouldn't."]},
      {"q": "Should she go to the party tonight?", "hint": "She has a big exam tomorrow morning.", "answer": "No, she shouldn't.", "wrong": ["Yes, she should."]}
    ]
  },
  {
    id: "present-continuous",
    title: "Present Continuous",
    tag: "Grammar · Present continuous",
    emoji: "🏃",
    prompt: "Choose the correct answer.",
    chips: 3,
    questions: [
      {q: "She ____ reading a book.", answer: "is", wrong: ["am", "are"], prompt: "Choose the correct “be” verb."},
      {q: "They ____ playing football.", answer: "are", wrong: ["am", "is"], prompt: "Choose the correct “be” verb."},
      {q: "I ____ doing my homework.", answer: "am", wrong: ["is", "are"], prompt: "Choose the correct “be” verb."},
      {q: "He ____ watching TV.", answer: "is", wrong: ["am", "are"], prompt: "Choose the correct “be” verb."},
      {q: "We ____ cooking dinner.", answer: "are", wrong: ["am", "is"], prompt: "Choose the correct “be” verb."},
      {q: "You ____ listening to music.", answer: "are", wrong: ["am", "is"], prompt: "Choose the correct “be” verb."},
      {q: "The cat ____ sleeping on the sofa.", answer: "is", wrong: ["am", "are"], prompt: "Choose the correct “be” verb."},
      {q: "My friends ____ coming to my house.", answer: "are", wrong: ["am", "is"], prompt: "Choose the correct “be” verb."},
      {q: "It ____ raining outside.", answer: "is", wrong: ["am", "are"], prompt: "Choose the correct “be” verb."},
      {q: "The children ____ drawing pictures.", answer: "are", wrong: ["am", "is"], prompt: "Choose the correct “be” verb."},
      {q: "make → ____", answer: "making", wrong: ["makeing"], prompt: "Choose the correct -ing form."},
      {q: "run → ____", answer: "running", wrong: ["runing"], prompt: "Choose the correct -ing form."},
      {q: "sit → ____", answer: "sitting", wrong: ["siting"], prompt: "Choose the correct -ing form."},
      {q: "write → ____", answer: "writing", wrong: ["writeing"], prompt: "Choose the correct -ing form."},
      {q: "swim → ____", answer: "swimming", wrong: ["swiming"], prompt: "Choose the correct -ing form."},
      {q: "come → ____", answer: "coming", wrong: ["comeing"], prompt: "Choose the correct -ing form."},
      {q: "get → ____", answer: "getting", wrong: ["geting"], prompt: "Choose the correct -ing form."},
      {q: "dance → ____", answer: "dancing", wrong: ["danceing"], prompt: "Choose the correct -ing form."},
      {q: "stop → ____", answer: "stopping", wrong: ["stoping"], prompt: "Choose the correct -ing form."},
      {q: "lie → ____", answer: "lying", wrong: ["lieing"], prompt: "Choose the correct -ing form."},
      {type: "write", q: "play → ____", answer: "playing", prompt: "Write the -ing form.", answers: ["playing"]},
      {type: "write", q: "read → ____", answer: "reading", prompt: "Write the -ing form.", answers: ["reading"]},
      {type: "write", q: "begin → ____", answer: "beginning", prompt: "Write the -ing form.", answers: ["beginning"]},
      {type: "write", q: "take → ____", answer: "taking", prompt: "Write the -ing form.", answers: ["taking"]},
      {type: "write", q: "shop → ____", answer: "shopping", prompt: "Write the -ing form.", answers: ["shopping"]},
      {type: "write", q: "study → ____", answer: "studying", prompt: "Write the -ing form.", answers: ["studying"]},
      {type: "write", q: "clap → ____", answer: "clapping", prompt: "Write the -ing form.", answers: ["clapping"]},
      {type: "write", q: "ride → ____", answer: "riding", prompt: "Write the -ing form.", answers: ["riding"]},
      {type: "write", q: "fly → ____", answer: "flying", prompt: "Write the -ing form.", answers: ["flying"]},
      {type: "write", q: "put → ____", answer: "putting", prompt: "Write the -ing form.", answers: ["putting"]},
      {type: "write", q: "have → ____", answer: "having", prompt: "Write the -ing form.", answers: ["having"]},
      {type: "write", q: "travel → ____", answer: "travelling", prompt: "Write the -ing form.", answers: ["travelling", "traveling"]},
      {type: "write", q: "Look! The dog is ____ its food.", answer: "eating", prompt: "Write the correct verb in the -ing form.", hint: "Word box: eat · swim · study · wait · build"},
      {type: "write", q: "My brother is ____ for the bus right now.", answer: "waiting", prompt: "Write the correct verb in the -ing form.", hint: "Word box: eat · swim · study · wait · build"},
      {type: "write", q: "They are ____ a sandcastle on the beach.", answer: "building", prompt: "Write the correct verb in the -ing form.", hint: "Word box: eat · swim · study · wait · build"},
      {type: "write", q: "She is ____ for her exam at the moment.", answer: "studying", prompt: "Write the correct verb in the -ing form.", hint: "Word box: eat · swim · study · wait · build"},
      {type: "write", q: "We are ____ in the pool today.", answer: "swimming", prompt: "Write the correct verb in the -ing form.", hint: "Word box: eat · swim · study · wait · build"},
      {type: "write", q: "is / She / dinner / cooking / .", answer: "She is cooking dinner.", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "playing / are / The kids / outside / .", answer: "The kids are playing outside.", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "am / I / to music / listening / .", answer: "I am listening to music.", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "not / He / sleeping / is / .", answer: "He is not sleeping.", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "are / We / not / working / today / .", answer: "We are not working today.", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "isn't / She / TV / watching / .", answer: "She isn't watching TV.", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "you / Are / coming / to the party / ?", answer: "Are you coming to the party?", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "is / What / doing / he / ?", answer: "What is he doing?", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "they / Are / playing / tennis / ?", answer: "Are they playing tennis?", prompt: "Put the words in order. Remember capital letters and punctuation.", strict: true},
      {type: "write", q: "She ____ ____ (read) a magazine right now.", answer: "is reading", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["is reading"]},
      {type: "write", q: "They ____ ____ (not / play) video games at the moment.", answer: "aren't playing", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["aren't playing", "are not playing"]},
      {type: "write", q: "____ you ____ (study) for the test?", answer: "Are you studying", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["Are you studying"]},
      {type: "write", q: "We ____ ____ (wait) for the train.", answer: "are waiting", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["are waiting"]},
      {type: "write", q: "He ____ ____ (not / listen) to the teacher.", answer: "isn't listening", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["isn't listening", "is not listening"]},
      {type: "write", q: "____ she ____ (work) in the garden?", answer: "Is she working", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["Is she working"]},
      {type: "write", q: "I ____ ____ (write) an email to my friend.", answer: "am writing", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["am writing"]},
      {type: "write", q: "The baby ____ ____ (not / sleep) right now.", answer: "isn't sleeping", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["isn't sleeping", "is not sleeping"]},
      {type: "write", q: "____ they ____ (come) to the meeting?", answer: "Are they coming", prompt: "Fill in the blanks. Write the verb forms (positive, negative or question).", answers: ["Are they coming"]}
    ]
  }
];
