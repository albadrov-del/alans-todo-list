'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  reporters: [
    'default',
    './reports/jestReporter.js',
  ],
};
