'use strict';

var expect = chai.expect;

angular.module('e2e', ['fv.loggly-mixin'])
  .config(function($logglyProvider) {
    $logglyProvider.logglyUrl('')
      .decorate();
  });

describe('e2e', function() {
  var $log;
  var $window;

  beforeEach(function() {
    angular.mock.module('e2e');
    // noinspection JSCheckFunctionSignatures
    angular.mock.inject([
      '$log',
      '$window',
      function(_$log_, _$window_) {
        $log = _$log_;
        $window = _$window_;
      }
    ]);
  });

  it('should send to Loggly', function() {
    $log.log('foo');
    expect($window._LTracker.length)
      .to
      .equal(2);
  });
});
