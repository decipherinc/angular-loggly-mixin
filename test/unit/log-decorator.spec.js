'use strict';

const $logDecorator = require('../../src/log-decorator');
const {forEach, extend} = require('angular');

describe(`$log decorator`, () => {
  let $log;
  let $loggly;
  let sandbox;

  beforeEach(mock.inject(_$log_ => {
    $log = _$log_;
    sandbox = sinon.sandbox.create('$log decorator');
    $loggly = {
      send: sandbox.stub(),
      config: {
        providerConfig: {
          levelMapping: {
            log: 'log',
            info: 'foo'
          },
          timeLevel: 'time',
          formatter: sandbox.stub()
            .returnsArg(1)
        }
      },
      $emit: sandbox.stub()
    };
  }));

  afterEach(() => {
    sandbox.restore();
  });

  describe(`$logDecorator()`, () => {
    it(`should return $log`, () => {
      expect($logDecorator($log, $loggly))
        .to
        .equal($log);
    });

    it(`should create proxies for the methods in "providerConfig.levelMapping"`,
      () => {
        const $logClone = extend({}, $log);
        $logDecorator($log, $loggly);
        forEach($loggly.config.providerConfig.levelMapping,
          (methodName, originalMethodName) => {
            expect($log[methodName])
              .to
              .be
              .a('function');
            expect($log[methodName])
              .not
              .to
              .equal($logClone[originalMethodName]);
          });
      });

    describe(`if 'timeLevel' is undefined in the provider config`, () => {
      beforeEach(() => {
        delete $loggly.config.providerConfig.timeLevel;
        $logDecorator($log, $loggly);
      });

      it(`should set the 'timeLevel' to 'time'`, () => {
        expect($loggly.config.providerConfig.timeLevel)
          .to
          .equal('time');
      });

      it(`should set the level mapping from 'time' to 'log'`, () => {
        expect($loggly.config.providerConfig.levelMapping.time)
          .to
          .equal('log');
      });
    });
  });

  describe(`method`, () => {
    beforeEach(() => {
      $logDecorator($log, $loggly);
    });

    describe(`proxy`, () => {
      beforeEach(() => {
        sandbox.stub($log.log, '$$originalMethod');
      });

      describe(`if called with an Error`, () => {
        let err;

        beforeEach(() => {
          err = new Error('foobar');
        });

        describe(`and 'allowUncaught' flag is falsy`, () => {
          beforeEach(() => {
            $loggly.config.providerConfig.allowUncaught = false;
          });

          it(`should not send the error`, () => {
            $log.log(err);
            expect($loggly.send).not.to.have.been.called;
          });

          it(`should call the original method`, () => {
            $log.log(err);
            expect($log.log.$$originalMethod)
              .to
              .have
              .been
              .calledWithExactly(err);
          });
        });

        describe(`and 'allowUncaught' flag is truthy`, () => {
          beforeEach(() => {
            $loggly.config.providerConfig.allowUncaught = true;
          });

          it(`should send the error`, () => {
            $log.log(err);
            expect($loggly.send)
              .to
              .have
              .been
              .calledWithExactly(err);
          });

          it(`should call the original method`, () => {
            $log.log(err);
            expect($log.log.$$originalMethod)
              .to
              .have
              .been
              .calledWithExactly(err);
          });
        });
      });

      describe(`when called with an object as message`, () => {
        let obj;

        beforeEach(() => {
          obj = {foo: 'bar'};
        });

        it(`should send the object`, () => {
          $log.log(obj);
          expect($loggly.send)
            .to
            .have
            .been
            .calledWithExactly(obj);
        });

        it(`should call the original method`, () => {
          $log.log(obj);
          expect($log.log.$$originalMethod)
            .to
            .have
            .been
            .calledWithExactly(obj);
        });
      });
    });

    describe(`timer()`, () => {
      describe(`when called without a label`, () => {
        it(`should set a timer for label "__default__"`, () => {
          $log.timer();
          expect($log.$$timers.__default__)
            .to
            .be
            .a('number');
        });

        it(`should emit 'timer-started'`, () => {
          $log.timer();
          expect($loggly.$emit)
            .to
            .have
            .been
            .calledWithExactly('timer-started', {
              label: '__default__',
              timestamp: $log.$$timers.__default__
            });
        });
      });

      describe(`when called with a label`, () => {
        it(`should set a timer for the label`, () => {
          $log.timer('foo');
          expect($log.$$timers.foo)
            .to
            .be
            .a('number');
        });

        it(`should emit 'timer-started'`, () => {
          $log.timer('foo');
          expect($loggly.$emit)
            .to
            .have
            .been
            .calledWithExactly('timer-started', {
              label: 'foo',
              timestamp: $log.$$timers.foo
            });
        });
      });
    });

    describe(`timerEnd()`, () => {
      describe(`if $log.time() called previously`, () => {
        beforeEach(() => {
          $log.timer('foo');
        });

        it(`should remove the timer`, () => {
          $log.timerEnd('foo');
          expect($log.$$timers.__default__).to.be.undefined;
        });

        it(`should emit 'timer-stopped' with a nonzero ms property`, () => {
          sandbox.spy($log, 'log');
          $log.timerEnd('foo', 'bar');
          const ms = $log.log.firstCall.args[1].ms;
          expect($loggly.$emit)
            .to
            .have
            .been
            .calledWithExactly('timer-stopped', {
              label: 'foo',
              data: {
                ms: ms,
                desc: 'bar'
              }
            });
        });

        it(`should call the configured method with a nonzero ms property`,
          () => {
            const providerConfig = $loggly.config.providerConfig;
            sandbox.spy($log,
              providerConfig.levelMapping[providerConfig.timeLevel]);
            $log.timerEnd();
            expect($log.log)
              .to
              .have
              .been
              .calledWithExactly('__default__', {
                ms: $log.log.firstCall.args[1].ms
              });
          });
      });

      describe(`if $log.time() not called previously`, () => {
        it(`should emit 'timer-stopped' with a zero ms property`, () => {
          sandbox.spy($log, 'log');
          $log.timerEnd();
          expect($loggly.$emit)
            .to
            .have
            .been
            .calledWithExactly('timer-stopped', {
              label: '__default__',
              data: {
                ms: 0
              }
            });
        });

        it(`should call the configured method with a zero ms property`, () => {
          const providerConfig = $loggly.config.providerConfig;
          sandbox.spy($log,
            providerConfig.levelMapping[providerConfig.timeLevel]);
          $log.timerEnd();
          expect($log.log)
            .to
            .have
            .been
            .calledWithExactly('__default__', {
              ms: 0
            });
        });
      });

      describe(`when called with an object label`, () => {
        it(`should use the description as the data`, () => {
          const providerConfig = $loggly.config.providerConfig;
          sandbox.spy($log,
            providerConfig.levelMapping[providerConfig.timeLevel]);
          $log.timer();
          $log.timerEnd({bar: 'baz'});
          expect($log.log)
            .to
            .have
            .been
            .calledWithExactly('__default__', {
              ms: $log.log.firstCall.args[1].ms,
              bar: 'baz'
            });
        });
      });
    });
  });
});
