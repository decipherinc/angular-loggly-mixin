'use strict';

const {extend, isObject} = require('angular');
let formatString;

// @ngInject
function $log($delegate, $loggly) {
  const {providerConfig} = $loggly.config;
  const levelMapping = providerConfig.levelMapping;
  const timers = {};
  const send = $loggly.send;

  /**
   * Creates a function which calls Loggly, then passes thru to $log service.
   * @param {string} methodName Method name to create; used when calling Loggly
   * @param {Function} originalMethod Method in $log service to call thru to
   * @returns {Function} New proxy function
   */
  function createProxy(methodName, originalMethod) {
    const format = providerConfig.formatter.bind(null, methodName);
    return function logglyLog(msg, ...args) {
      if (msg instanceof Error && providerConfig.allowUncaught) {
        send(format(msg));
      } else {
        let data;
        let desc;
        if (isObject(msg)) {
          data = msg;
          desc = undefined;
        } else {
          if (isObject(args[args.length - 1])) {
            data = args.pop();
          }
          if (args.length) {
            formatString = require('format');
            desc = formatString(msg, ...args);
          }
        }
        send(format(extend({desc}, data)));
      }
      return originalMethod.call($delegate, msg);
    };
  }

  /**
   * Starts a timer with given label.
   * @param {string} label Some label for the timer
   */
  $delegate.timer = label => {
    const timestamp = Date.now();
    timers[label] = timestamp;
    $loggly.$emit('timer-started',
      {
        label,
        timestamp
      });
  };

  /**
   * Ends a timer with given label.
   * @param {string} label Some label used via {@link $delegate.time}
   * @param {(string|Object)} [desc] Log message, or just `data` object
   * @param {Object} [data] Extra data to send
   */
  $delegate.timerEnd = (label, desc, data = {}) => {
    const now = Date.now();
    data.ms = now - (timers[label] || now);
    delete timers[label];
    if (isObject(desc)) {
      data = desc;
    } else {
      extend(data, {desc});
    }
    $loggly.$emit('timer-stopped', {
      label,
      data
    });
    $delegate[providerConfig.timeLevel](label, data);
  };

  // ensure we have something for timerEnd() to use
  if (!levelMapping.hasOwnProperty(providerConfig.timeLevel)) {
    providerConfig.timeLevel = 'time';
    levelMapping[providerConfig.timeLevel || 'time'] = 'log';
  }

  extend($delegate, Object.keys(levelMapping)
    .map(function(methodName) {
      const originalMethodName = levelMapping[methodName];
      return createProxy(methodName,
        $delegate[originalMethodName] || $delegate.log);
    }));

  return $delegate;
}

module.exports = $log;
