'use strict';

module.exports = function karmaConfig(config) {
  config.set({
    basePath: '',
    frameworks: [
      'mocha',
      'browserify'
    ],
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    preprocessors: {
      'src/**/*.js': 'browserify',
      'test/**/*.js': 'browserify'
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
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: require('os')
      .cpus().length,
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {
          type: 'html'
        },
        {
          type: 'text-summary'
        },
        {
          type: 'lcov-only',
          subdir: '.'
        }
      ]
    }
  });
};
