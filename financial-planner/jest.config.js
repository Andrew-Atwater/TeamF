module.exports = {
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage'
};