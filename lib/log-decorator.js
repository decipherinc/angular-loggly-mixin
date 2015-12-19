'use strict';

var _require = require('angular');

var extend = _require.extend;
var isObject = _require.isObject;

var formatString = undefined;

// @ngInject
function $log($delegate, $loggly) {
  var providerConfig = $loggly.config.providerConfig;

  var levelMapping = providerConfig.levelMapping;
  var timers = {};
  var send = $loggly.send;

  /**
   * Creates a function which calls Loggly, then passes thru to $log service.
   * @param {string} methodName Method name to create; used when calling Loggly
   * @param {Function} originalMethod Method in $log service to call thru to
   * @returns {Function} New proxy function
   */
  function createProxy(methodName, originalMethod) {
    var format = providerConfig.formatter.bind(null, methodName);
    return function logglyLog(msg) {
      if (msg instanceof Error && providerConfig.allowUncaught) {
        send(format(msg));
      } else {
        var data = undefined;
        var desc = undefined;
        if (isObject(msg)) {
          data = msg;
          desc = undefined;
        } else {
          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          if (isObject(args[args.length - 1])) {
            data = args.pop();
          }
          if (args.length) {
            formatString = require('format');
            desc = formatString.apply(undefined, [msg].concat(args));
          }
        }
        send(format(extend({ desc: desc }, data)));
      }
      return originalMethod.call($delegate, msg);
    };
  }

  /**
   * Starts a timer with given label.
   * @param {string} label Some label for the timer
   */
  $delegate.timer = function (label) {
    var timestamp = Date.now();
    timers[label] = timestamp;
    $loggly.$emit('timer-started', {
      label: label,
      timestamp: timestamp
    });
  };

  /**
   * Ends a timer with given label.
   * @param {string} label Some label used via {@link $delegate.time}
   * @param {(string|Object)} [desc] Log message, or just `data` object
   * @param {Object} [data] Extra data to send
   */
  $delegate.timerEnd = function (label, desc) {
    var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var now = Date.now();
    data.ms = now - (timers[label] || now);
    delete timers[label];
    if (isObject(desc)) {
      data = desc;
    } else {
      extend(data, { desc: desc });
    }
    $loggly.$emit('timer-stopped', {
      label: label,
      data: data
    });
    $delegate[providerConfig.timeLevel](label, data);
  };

  // ensure we have something for timerEnd() to use
  if (!levelMapping.hasOwnProperty(providerConfig.timeLevel)) {
    providerConfig.timeLevel = 'time';
    levelMapping[providerConfig.timeLevel || 'time'] = 'log';
  }

  extend($delegate, Object.keys(levelMapping).map(function (methodName) {
    var originalMethodName = levelMapping[methodName];
    return createProxy(methodName, $delegate[originalMethodName] || $delegate.log);
  }));

  return $delegate;
}

module.exports = $log;