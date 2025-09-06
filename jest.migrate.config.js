module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/migrate.test.js'],
  testTimeout: 60000, // 60 seconds for migration operations
  verbose: true,
  collectCoverage: false, // Disable coverage for migration tests
  setupFilesAfterEnv: ['<rootDir>/tests/migrate-setup.js'],
  globalSetup: '<rootDir>/tests/migrate-global-setup.js',
  globalTeardown: '<rootDir>/tests/migrate-global-teardown.js',
  testPathIgnorePatterns: ['/node_modules/']
};