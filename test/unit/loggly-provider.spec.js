'use strict';

describe(`$logglyProvider`, () => {
  const moduleName = require('../../src');
  const partial = require('lodash.partial');
  const get = require('lodash.get');

  let $logglyProvider;
  let $provide;
  let getConfig;
  let sandbox;

  beforeEach(() => {
    mock.module(moduleName, (_$logglyProvider_, _$provide_) => {
      $logglyProvider = _$logglyProvider_;
      $provide = _$provide_;
      getConfig = partial(get, $logglyProvider.config);
    });
    mock.inject();
    sandbox = sinon.sandbox.create('$logglyProvider');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe(`method`, () => {
    describe(`logglyKey()`, () => {
      it(`should set the "logglyKey" prop`, () => {
        $logglyProvider.logglyKey('foo');
        expect(getConfig('logglyConfig.logglyKey'))
          .to
          .equal('foo');
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.logglyKey())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`logglyUrl()`, () => {
      it(`should set the "logglyUrl" prop`, () => {
        $logglyProvider.logglyUrl('foo');
        expect(getConfig('providerConfig.logglyUrl'))
          .to
          .equal('foo');
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.logglyUrl())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`allowUncaught()`, () => {
      it(`should set the "allowUncaught" prop`, () => {
        $logglyProvider.allowUncaught(false);
        expect(getConfig('providerConfig.allowUncaught'))
          .to
          .equal(false);
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.allowUncaught())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`sendConsoleErrors()`, () => {
      it(`should set the "sendConsoleErrors" prop`, () => {
        $logglyProvider.sendConsoleErrors(true);
        expect(getConfig('logglyConfig.sendConsoleErrors'))
          .to
          .equal(true);
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.sendConsoleErrors())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`levelMapping()`, () => {
      it(`should extend the "levelMapping" prop`, () => {
        $logglyProvider.levelMapping({foo: 'debug'});
        expect(getConfig('providerConfig.levelMapping').foo)
          .to
          .equal('debug');
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.levelMapping())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`mapLevel()`, () => {
      it(`should overwrite a prop in "levelMapping" prop`, () => {
        $logglyProvider.mapLevel('debug', 'warn');
        expect(getConfig('providerConfig.levelMapping').debug)
          .to
          .equal('warn');
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.mapLevel())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`timerLevel()`, () => {
      it(`should set the level called by $log.timeEnd()`, () => {
        $logglyProvider.timerLevel('foo');
        expect(getConfig('providerConfig.timerLevel'))
          .to
          .equal('foo');
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.timerLevel())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`formatter()`, () => {
      it(`should set the formatter function`, () => {
        function func() {
        }

        $logglyProvider.formatter(func);
        expect(getConfig('providerConfig.formatter'))
          .to
          .equal(func);
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.formatter())
          .to
          .equal($logglyProvider);
      });

      describe(`if not passed a function`, () => {
        it(`should not set the formatter function`, () => {
          $logglyProvider.formatter('foo');
          expect(getConfig('providerConfig.formatter'))
            .not
            .to
            .equal('foo');
        });
      });
    });

    describe(`decorate()`, () => {
      it(`should call $provide.decorate()`, () => {
        sandbox.stub($provide, 'decorator');
        $logglyProvider.decorate();
        expect($provide.decorator)
          .to
          .have
          .been
          .calledWithExactly('$log', require('../../src/log-decorator'));
      });
    });

    describe(`tags()`, () => {
      it(`should set the tags used by Loggly`, () => {
        $logglyProvider.tags('foo', 'bar');
        expect(getConfig('logglyConfig.tag'))
          .to
          .equal('foo,bar');
      });

      it(`should return the provider`, () => {
        expect($logglyProvider.tags())
          .to
          .equal($logglyProvider);
      });
    });

    describe(`useDomainProxy()`, () => {
      it(`should set the "useDomainProxy" flag used by Loggly`, () => {
        $logglyProvider.useDomainProxy(false);
        expect(getConfig('logglyConfig.useDomainProxy')).to.be.false;
      });

      it(`should return the instance`, () => {
        expect($logglyProvider.useDomainProxy())
          .to
          .equal($logglyProvider);
      });
    });
  });

  describe(`property`, () => {
    describe(`config`, () => {
      it(`should be an object with "logglyConfig" and "providerConfig" ` +
        `props`, () => {
        expect($logglyProvider.config)
          .to
          .have
          .keys([
            'logglyConfig',
            'providerConfig'
          ]);
      });

      describe(`providerConfig`, () => {
        describe(`formatter`, () => {
          let formatter;

          beforeEach(() => {
            formatter = getConfig('providerConfig.formatter');
          });

          describe(`when passed no parameters`, () => {
            it(`should return an object with "desc" and "level" properties`,
              () => {
                expect(formatter())
                  .to
                  .have
                  .keys('desc', 'level');
              });
          });

          describe(`when passed a "level" parameter`, () => {
            it(`should return an object with prop "level" equal to the value`,
              () => {
                expect(formatter('foo').level)
                  .to
                  .equal('foo');
              });
          });

          describe(`when passed a "body" parameter`, () => {
            it(`should override the "level" parameter`, () => {
              expect(formatter('foo', {level: 'bar'}).level)
                .to
                .equal('bar');
            });
          });
        });
      });
    });
  });
});
