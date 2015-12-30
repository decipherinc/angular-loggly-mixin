'use strict';

const {
  isDefined,
  isFunction,
  isUndefined,
  bind,
  extend,
  isObject,
  forEach
  } = require('angular');

const formatString = require('format');
const isError = require('lodash.iserror');

// @ngInject
function $logDecorator($delegate, $loggly) {
  const {providerConfig} = $loggly.config;
  const levelMapping = providerConfig.levelMapping;
  const timers = $delegate.$$timers = {};

  /**
   * Creates a function which calls Loggly, then passes thru to $log service.
   * @param {string} methodName Method name to create; used when calling Loggly
   * @param {Function} originalMethod Method in $log service to call thru to
   * @returns {Function} New proxy function
   */
  function createProxy(methodName, originalMethod) {
    const format = bind(null, providerConfig.formatter, methodName);

    function logglyLog(msg, ...args) {
      if (!isError(msg) || (isError(msg) && providerConfig.allowUncaught)) {
        let data;
        let desc;
        if (isObject(msg)) {
          data = msg;
          desc = undefined;
        } else {
          if (isObject(args[args.length - 1])) {
            data = args.pop();
          }
          desc = formatString(msg, ...args);
        }
        const payload = isUndefined(desc) ? data : extend({desc}, data);

        $loggly.send(format(payload));
      }
      return logglyLog.$$originalMethod.call(this, msg);
    }

    logglyLog.$$originalMethod = originalMethod;

    return logglyLog;
  }

  /**
   * Starts a timer with given label.
   * @param {string} label Some label for the timer
   */
  $delegate.timer = function timer(label = '__default__') {
    const timestamp = Date.now();
    timers[label] = timestamp;
    $loggly.$emit('timer-started', {
      label,
      timestamp
    });
  };

  /**
   * Ends a timer with given label.
   * @param {string} label Some label used via {@link $delegate.time}
   * @param {(string|Object)} [msg] Log message, or just `data` object
   * @param {...*} [args] Extra data to send
   */
  $delegate.timerEnd = function timerEnd(label = '__default__', msg, ...args) {
    const now = Date.now();
    if (isObject(label)) {
      msg = label;
      label = '__default__';
    }
    const ms = now - (timers[label] || now);
    let data;
    if (isObject(msg)) {
      data = msg;
    } else {
      if (args.length && isObject(args[args.length - 1])) {
        data = args[args.length - 1];
      } else {
        data = {};
        if (isDefined(msg)) {
          args.push(data);
        } else {
          msg = data;
        }
      }
    }

    delete timers[label];
    $loggly.$emit('timer-stopped', {
      label,
      ms
    });

    data.ms = ms;
    data.label = label;

    return this[levelMapping[providerConfig.timeLevel]](msg, ...args);
  };

  // ensure we have something for timerEnd() to use
  if (!levelMapping.hasOwnProperty(providerConfig.timeLevel)) {
    providerConfig.timeLevel = 'time';
    levelMapping.time = 'log';
  }

  // we need to save the reference to the original 'log' function,
  // because it has properties which we'll need to move over to our proxy.
  const log = $delegate.log;

  forEach(levelMapping, (methodName, originalMethodName) => {
    if (isFunction($delegate[originalMethodName])) {
      $delegate[methodName] =
        createProxy(methodName, $delegate[originalMethodName]);
    }
  });

  // this takes the properties out of the original $log.log and stuffs them
  // into the new one.
  extend($delegate.log, log);

  return $delegate;
}

module.exports = $logDecorator;
