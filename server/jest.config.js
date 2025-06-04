// server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testTimeout: 10000,
};