// Placeholder – extend with tests data
// Example structure for data-type="tests"
window.courseData = window.courseData || {};
window.courseData["american-english-file"] = window.courseData["american-english-file"] || {};
window.courseData["american-english-file"].tests = {
  title: "Tests & Exams",
  subtitle: "Practice tests, unit exams, and interactive games",
  sections: [
    {
      title: "Unit Quizzes",
      description: "Multiple choice – Grammar & Vocabulary",
      items: [
        { id: "quiz-unit-1", title: "Unit 1 Quiz", type: "multiple-choice", questions: 40, href: "quiz/unit-1/" },
        { id: "quiz-unit-2", title: "Unit 2 Quiz", type: "multiple-choice", questions: 40, href: "quiz/unit-2/" }
        // ... add more units
      ]
    },
    {
      title: "Progress Tests",
      description: "Mixed grammar + vocabulary challenges",
      items: [
        { id: "progress-1-4", title: "Units 1–4 Progress Test", type: "mixed", href: "progress/1-4/" },
        { id: "progress-5-8", title: "Units 5–8 Progress Test", type: "mixed", href: "progress/5-8/" },
        { id: "progress-9-12", title: "Units 9–12 Progress Test", type: "mixed", href: "progress/9-12/" }
      ]
    },
    {
      title: "Listening Tests",
      description: "Games like Listen & Write / Listen & Choose",
      items: [
        { id: "listen-write", title: "Listen & Write", type: "listening", href: "listening/listen-and-write/" },
        { id: "listen-choose", title: "Listen & Choose", type: "listening", href: "listening/listen-and-choose/" }
      ]
    }
  ]
};
