/*
  Starter data file

  Students usually extend Soma here first. Add or edit topic packs below, then
  reload /starter/index.html and choose the new topic from the Setup panel.

  Keep the field names stable (`topic`, `summary`, `examples`, `resources`,
  and `sampleQuestion`) because starter/app.js uses those names to build the
  safe /api/coach context.
*/

const setupOptions = {
  // Add a mode when the app needs a new kind of help, such as "make quiz".
  modes: [
    { id: "learn-topic", label: "Learn a topic" },
    { id: "ask-tutor", label: "Ask topic tutor" },
    { id: "make-plan", label: "Make study plan" },
    { id: "practice", label: "Practice questions" }
  ],
  grades: [
    {
      id: "grade-7",
      label: "Grade 7",
      grade: "Grade 7",
      gradeBand: "Junior School",
      ageRange: "about 12-13"
    }
  ],
  learningAreas: [
    { id: "integrated-science", label: "Integrated Science" }
  ]
};

/*
  Each topic pack is one small bundle of dummy curriculum data.

  To add a new topic:
  1. Copy one whole object inside topicPacks.
  2. Give it a new id.
  3. Change the topic, summary, vocabulary, examples, resources, and sample question.
  4. Use dummy learning content only. Do not add real student records.
*/
const topicPacks = [
  {
    id: "living-things",
    grade: "Grade 7",
    gradeBand: "Junior School",
    learningArea: "Integrated Science",
    strand: "Living Things and Their Environment",
    topic: "Characteristics of living things",
    studyNeed: "Explain life processes using everyday observations",
    summary: "Living things show life processes such as movement, respiration, nutrition, growth, excretion, reproduction and sensitivity.",
    vocabulary: [
      { term: "Growth", meaning: "Increase in size or development over time." },
      { term: "Sensitivity", meaning: "Ability to detect and respond to changes." }
    ],
    examples: [
      "A bean seed growing roots and a shoot shows growth.",
      "A plant bending toward light shows sensitivity."
    ],
    misconceptions: [
      {
        mistake: "Growth and reproduction mean the same thing.",
        help: "Growth changes one living thing. Reproduction makes new living things."
      }
    ],
    resources: [
      {
        title: "Observe A Growing Seed",
        type: "Observation activity",
        description: "Draw changes in a seed over several days and label the life process shown."
      }
    ],
    practiceQuestions: [
      {
        id: "living-q1",
        question: "A plant bends toward a window. Which life process is shown?",
        options: ["Growth", "Sensitivity", "Excretion", "Reproduction"],
        answerIndex: 1,
        feedback: "The plant is responding to light, so the life process is sensitivity."
      }
    ],
    sampleQuestion: "Why is growth a life process?"
  },
  {
    id: "mixtures",
    grade: "Grade 7",
    gradeBand: "Junior School",
    learningArea: "Integrated Science",
    strand: "Matter",
    topic: "Mixtures and separation",
    studyNeed: "Choose separation methods for simple mixtures",
    summary: "Mixtures can sometimes be separated by filtering, decanting, evaporation or magnetism.",
    vocabulary: [
      { term: "Filtration", meaning: "Separating an insoluble solid from a liquid using a filter." },
      { term: "Magnetism", meaning: "Using a magnet to separate magnetic materials." }
    ],
    examples: [
      "A magnet can separate iron filings from sand.",
      "A filter can separate tea leaves from tea."
    ],
    misconceptions: [
      {
        mistake: "Filtration works for every mixture.",
        help: "Filtration is best for an insoluble solid mixed with a liquid."
      }
    ],
    resources: [
      {
        title: "Kitchen Separation Methods",
        type: "Home example",
        description: "Match filtering, decanting, evaporation and magnetism to safe everyday examples."
      }
    ],
    practiceQuestions: [
      {
        id: "mixtures-q1",
        question: "Which method is best for separating iron filings from sand?",
        options: ["Evaporation", "Magnetism", "Filtration", "Decanting"],
        answerIndex: 1,
        feedback: "Iron is magnetic, so magnetism is the best method."
      }
    ],
    sampleQuestion: "How do I know whether to use filtration or magnetism?"
  }
];
