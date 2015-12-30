'use strict';

describe(`$loggly`, () => {
  const moduleName = require('../../src');
  let $loggly;
  let sandbox;
  let $window;
  let $logglyProvider;

  beforeEach(() => {
    sandbox = sinon.sandbox.create('$loggly');

    mock.module(moduleName, ($provide, _$logglyProvider_) => {
      // this ensures that bootstrapping doesn't actually happen,
      // and we don't end up asking loggly.com for a script.
      $provide.decorator('$loggly', $delegate => {
        $delegate.bootstrap = sandbox.stub();
        return $delegate;
      });
      $logglyProvider = _$logglyProvider_;
    });

    mock.inject((_$loggly_, _$window_) => {
      $loggly = _$loggly_;
      $window = _$window_;
      $window._LTracker.length = 0;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it(`should be an object`, () => {
    expect($loggly)
      .to
      .be
      .an('object');
  });

  it(`should define global _LTracker`, () => {
    expect(global._LTracker)
      .to
      .eql([]);
  });

  describe(`method`, () => {
    describe(`send()`, () => {
      it(`should push data to the _LTracker array`, () => {
        $loggly.send('foo');
        expect($window._LTracker)
          .to
          .eql(['foo']);
      });
    });

    describe(`$emit`, () => {
      it(`should emit data on $rootScope`, mock.inject($rootScope => {
        sandbox.stub($rootScope, '$emit');
        const namespace = $loggly.config.providerConfig.$namespace;
        $loggly.$emit('foo', 'bar');
        expect($rootScope.$emit)
          .to
          .have
          .been
          .calledWithExactly(`${namespace}:foo`, 'bar');
      }));
    });
  });

  describe(`property`, () => {
    describe(`config`, () => {
      it(`should be the data as configured in $logglyProvider`, () => {
        expect($loggly.config)
          .to
          .eql($logglyProvider.config);
      });
    });
  });
});
