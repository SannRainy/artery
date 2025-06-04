// server/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test_setup/setup.js'],
  testTimeout: 10000,
};