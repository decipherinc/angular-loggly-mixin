'use strict';

module.exports = function karmaUnitConfig(config) {
  require('./.karma.common')(config);

  config.set({
    frameworks: [
      'mocha',
      'browserify'
    ],
    files: [
      'src/**/*.js',
      'test/unit/**/*.js'
    ],
    preprocessors: {
      'src/**/*.js': 'browserify',
      'test/unit/**/*.js': 'browserify'
    },
    browserify: {
      debug: true,
      transform: [
        [
          'babelify',
          {
            presets: 'es2015'
          }
        ],
        'browserify-ngannotate',
        [
          'browserify-istanbul',
          {
            instrumenterConfig: {
              embedSource: true
            }
          }
        ]
      ]
    },
    reporters: [
      'mocha',
      'coverage'
    ],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {
          type: 'html',
          subdir: '.'
        },
        {
          type: 'text-summary'
        },
        {
          type: 'lcovonly',
          subdir: '.'
        }
      ]
    }
  });
};
