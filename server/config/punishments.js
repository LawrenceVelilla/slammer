const punishments = [
  {
    id: 'punishment-core-rewrite',
    title: 'Core Concept Rewrite',
    instructions: 'Rewrite the expected answer in your own words with 2-4 precise sentences.',
    successCriteria: 'Must preserve all key facts and avoid contradictions.',
    maxWords: 90,
  },
  {
    id: 'punishment-missing-points',
    title: 'Missing Points Recovery',
    instructions: 'List at least 3 key points you missed, then provide one corrected final answer.',
    successCriteria: 'The listed points must be relevant and the final answer must be correct.',
    maxWords: 110,
  },
  {
    id: 'punishment-compare-contrast',
    title: 'Compare and Correct',
    instructions: 'Briefly explain what your answer got wrong and then give the corrected answer.',
    successCriteria: 'Must identify at least one real mistake and provide a fully corrected response.',
    maxWords: 100,
  },
];

export default punishments;
