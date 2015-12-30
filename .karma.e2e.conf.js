'use strict';

module.exports = function karmaE2EConfig(config) {
  require('./.karma.common')(config);

  config.set({
    frameworks: [
      'mocha'
    ],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/chai/chai.js',
      'dist/angular-loggly-mixin.js',
      'test/e2e/**/*.js'
    ],
    reporters: [
      'mocha'
    ]
  });
};
