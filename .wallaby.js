'use strict';

module.exports = function(wallaby) {
  return {
    files: [
      {
        pattern: 'src/**/*.js',
        load: false
      },
      {
        pattern: 'test/**/*.spec.js',
        ignore: true
      },
      {
        pattern: 'test/fixture.js',
        load: false
      }
    ],
    tests: [
      {
        pattern: 'test/**/*.spec.js',
        load: false
      }
    ],
    // this bit compiles everything with babel
    compilers: {
      '**/*.js': wallaby.compilers.babel({
        babel: require('babel-core'),
        presets: ['es2015'],
        sourceMap: true
      })
    },
    // this browserifies
    postprocessor: require('wallabify')({
      entryPatterns: [
        'test/fixture.js',
        'test/**/*.spec.js'
      ]
    }, function(b) {
      return b.transform(require('browserify-ngannotate'));
    }),
    // tell it to use mocha
    testFramework: 'mocha',
    // required if using wallabify
    bootstrap: function bootstrap() {
      window.__moduleBundler.loadTests();
    }
  };
};
