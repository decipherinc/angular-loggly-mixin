'use strict';

describe(`$logglyProvider`, () => {
  const moduleName = require('../../src');
  const partial = require('lodash.partial');
  const get = require('lodash.get');

  let provider;
  let getConfig;

  beforeEach(() => {
    mock.module(moduleName, $logglyProvider => {
      provider = $logglyProvider;
      getConfig = partial(get, provider.config);
    });
    mock.inject();
  });

  it(`should be an object`, () => {
    expect(provider)
      .to
      .be
      .an('object');
  });

  describe(`method`, () => {
    describe(`logglyKey()`, () => {
      it(`should set the "logglyKey" prop`, () => {
        provider.logglyKey('foo');
        expect(getConfig('logglyConfig.logglyKey'))
          .to
          .equal('foo');
      });

      it(`should return the provider`, () => {
        expect(provider.logglyKey())
          .to
          .equal(provider);
      });
    });

    describe(`logglyUrl()`, () => {
      it(`should set the "logglyUrl" prop`, () => {
        provider.logglyUrl('foo');
        expect(getConfig('providerConfig.logglyUrl'))
          .to
          .equal('foo');
      });

      it(`should return the provider`, () => {
        expect(provider.logglyUrl())
          .to
          .equal(provider);
      });
    });

    describe(`allowUncaught()`, () => {
      it(`should set the "allowUncaught" prop`, () => {
        provider.allowUncaught(false);
        expect(getConfig('providerConfig.allowUncaught'))
          .to
          .equal(false);
      });

      it(`should return the provider`, () => {
        expect(provider.allowUncaught())
          .to
          .equal(provider);
      });
    });

    describe(`sendConsoleErrors()`, () => {
      it(`should set the "sendConsoleErrors" prop`, () => {
        provider.sendConsoleErrors(true);
        expect(getConfig('logglyConfig.sendConsoleErrors'))
          .to
          .equal(true);
      });

      it(`should return the provider`, () => {
        expect(provider.sendConsoleErrors())
          .to
          .equal(provider);
      });
    });

    describe(`levelMapping()`, () => {
      it(`should extend the "levelMapping" prop`, () => {
        provider.levelMapping({foo: 'debug'});
        expect(getConfig('providerConfig.levelMapping').foo)
          .to
          .equal('debug');
      });

      it(`should return the provider`, () => {
        expect(provider.levelMapping())
          .to
          .equal(provider);
      });
    });

    describe(`mapLevel()`, () => {
      it(`should overwrite a prop in "levelMapping" prop`, () => {
        provider.mapLevel('debug', 'warn');
        expect(getConfig('providerConfig.levelMapping').debug)
          .to
          .equal('warn');
      });

      it(`should return the provider`, () => {
        expect(provider.mapLevel())
          .to
          .equal(provider);
      });
    });

    describe(`timerLevel()`, () => {
      it(`should set the level called by $log.timeEnd()`, () => {
        provider.timerLevel('foo');
        expect(getConfig('providerConfig.timerLevel'))
          .to
          .equal('foo');
      });

      it(`should return the provider`, () => {
        expect(provider.timerLevel())
          .to
          .equal(provider);
      });
    });
  });

  describe(`property`, () => {
    describe(`config`, () => {
      it(`should be an object with "logglyConfig" and "providerConfig" ` +
        `props`, () => {
        expect(provider.config)
          .to
          .have
          .keys([
            'logglyConfig',
            'providerConfig'
          ]);
      });
    });
  });
});
