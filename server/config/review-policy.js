const reviewPolicy = {
  gradeScale: { min: 1, max: 10 },
  lowScoreThreshold: 3,
  punishment: {
    minWords: 8,
    maxWords: 90,
  },
};

export default reviewPolicy;
