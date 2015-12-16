/*! angular-loggly-mixin - v0.0.0
 * https://github.com/decipherinc/angular-loggly-mixin#readme
 * Copyright (c) 2015 Focusvision Worldwide; Licensed MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.angularLogglyMixin = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// format - printf-like string formatting for JavaScript
// github.com/samsonjs/format
// @_sjs
//
// Copyright 2010 - 2013 Sami Samhuri <sami@samhuri.net>
//
// MIT License
// http://sjs.mit-license.org
//

;(function() {

  //// Export the API
  var namespace;

  // CommonJS / Node module
  if (typeof module !== 'undefined') {
    namespace = module.exports = format;
  }

  // Browsers and other environments
  else {
    // Get the global object. Works in ES3, ES5, and ES5 strict mode.
    namespace = (function(){ return this || (1,eval)('this') }());
  }

  namespace.format = format;
  namespace.vsprintf = vsprintf;

  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    namespace.printf = printf;
  }

  function printf(/* ... */) {
    console.log(format.apply(null, arguments));
  }

  function vsprintf(fmt, replacements) {
    return format.apply(null, [fmt].concat(replacements));
  }

  function format(fmt) {
    var argIndex = 1 // skip initial format argument
      , args = [].slice.call(arguments)
      , i = 0
      , n = fmt.length
      , result = ''
      , c
      , escaped = false
      , arg
      , precision
      , nextArg = function() { return args[argIndex++]; }
      , slurpNumber = function() {
          var digits = '';
          while (fmt[i].match(/\d/))
            digits += fmt[i++];
          return digits.length > 0 ? parseInt(digits) : null;
        }
      ;
    for (; i < n; ++i) {
      c = fmt[i];
      if (escaped) {
        escaped = false;
        precision = slurpNumber();
        switch (c) {
        case 'b': // number in binary
          result += parseInt(nextArg(), 10).toString(2);
          break;
        case 'c': // character
          arg = nextArg();
          if (typeof arg === 'string' || arg instanceof String)
            result += arg;
          else
            result += String.fromCharCode(parseInt(arg, 10));
          break;
        case 'd': // number in decimal
          result += parseInt(nextArg(), 10);
          break;
        case 'f': // floating point number
          result += parseFloat(nextArg()).toFixed(precision || 6);
          break;
        case 'o': // number in octal
          result += '0' + parseInt(nextArg(), 10).toString(8);
          break;
        case 's': // string
          result += nextArg();
          break;
        case 'x': // lowercase hexadecimal
          result += '0x' + parseInt(nextArg(), 10).toString(16);
          break;
        case 'X': // uppercase hexadecimal
          result += '0x' + parseInt(nextArg(), 10).toString(16).toUpperCase();
          break;
        default:
          result += c;
          break;
        }
      } else if (c === '%') {
        escaped = true;
      } else {
        result += c;
      }
    }
    return result;
  }

}());

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var _ref = typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null;

var isObject = _ref.isObject;

var formatString = undefined;

// @ngInject
function $log($delegate, $loggly) {
  var _$loggly$config = $loggly.config();

  var providerConfig = _$loggly$config.providerConfig;

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
        send(format(Object.assign({ desc: desc }, data)));
      }
      return originalMethod.call($delegate, msg);
    };
  }

  /**
   * Starts a timer with given label.
   * @param {string} label Some label for the timer
   */
  $delegate.time = function time(label) {
    timers[label] = Date.now();
  };

  /**
   * Ends a timer with given label.
   * @param {string} label Some label used via {@link $delegate.time}
   * @param {(string|Object)} [desc] Log message, or just `data` object
   * @param {Object} [data] Extra data to send
   */
  $delegate.timeEnd = function timeEnd(label, desc) {
    var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var now = Date.now();
    data.ms = now - (timers[label] || now);
    delete timers[label];
    if (isObject(desc)) {
      data = desc;
      desc = undefined;
    }
    $delegate.log(label, Object.assign(data, { desc: desc }));
  };

  Object.assign($delegate, Object.keys(levelMapping).map(function (methodName) {
    var originalMethodName = levelMapping[methodName];
    return createProxy(methodName, $delegate[originalMethodName] || $delegate.log);
  }));

  return $delegate;
}
$log.$inject = ["$delegate", "$loggly"];

module.exports = $log;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"format":1}],3:[function(require,module,exports){
(function (global){
'use strict';

var _ref = typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null;

var isString = _ref.isString;
var isDefined = _ref.isDefined;
var isObject = _ref.isObject;
var isFunction = _ref.isFunction;

/**
 * Format a message for sending to Loggly
 * @param {string} level Log level (debug, info, warn, etc)
 * @param {Object} [body={}] Extra message body
 * @param {string} [body.desc='(no description)'] Message description
 * @returns {Object}
 */

function defaultFormatter(level) {
  var body = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  body.desc = body.desc || '(no description)';
  return Object.assign({ level: level }, body);
}

// @ngInject
function $logglyProvider($provide) {
  var logglyConfig = {
    logglyKey: '',
    sendConsoleErrors: false
  };

  var providerConfig = {
    allowUncaught: true,
    logglyUrl: '//cloudfront.loggly.com/js/loggly.tracker.js',
    levelMapping: {
      debug: 'debug',
      log: 'log',
      info: 'info',
      warn: 'warn',
      error: 'error'
    },
    formatter: defaultFormatter
  };

  Object.assign(this, {
    /**
     * Set the Loggly API key.  This must be set for operation.
     * @param {string} [value] API key
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */

    logglyKey: function logglyKey(value) {
      if (isString(value)) {
        logglyConfig.logglyKey = value;
      }
      return this;
    },

    /**
     * Set the Loggly endpoint URL.
     * @param {string} [value] URL; defaults to
     * `//cloudfront.loggly.com/js/loggly.tracker.js`
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */
    logglyUrl: function logglyUrl(value) {
      if (isString(value)) {
        providerConfig.logglyUrl = value;
      }
      return this;
    },

    /**
     * Set whether or not to pass thrown Errors through to Loggly.
     * @param {boolean} [value] True/false
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */
    allowUncaught: function allowUncaught(value) {
      if (isDefined(value)) {
        providerConfig.allowUncaught = Boolean(value);
      }
      return this;
    },

    /**
     * Set whether or not Loggly should trap calls to console.error()
     * @param {boolean} [value] True/false
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */
    sendConsoleErrors: function sendConsoleErrors(value) {
      if (isDefined(value)) {
        logglyConfig.sendConsoleErrors = Boolean(value);
      }
      return this;
    },

    /**
     * Set the level mapping.  The level mapping is an object where the keys
     * are the new method names, and the values are the method names in the
     * original $log service.
     * @param {Object} [value] Level mapping
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     * @example
     * myModule.config($logglyProvider => {
     *   $logglyProvider.levelMapping({omg: 'error'});
     * })
     *   .run($log => {
     *     $log.omg('a terrible error!', {extra: 'data'});
     *   });
     */
    levelMapping: function levelMapping(value) {
      if (isObject(value)) {
        Object.assign(providerConfig.levelMapping, value);
      }
      return this;
    },

    /**
     * Convenience method to map a level.
     * @param {string} [methodName='log'] New method name
     * @param {string} [originalMethodName='log'] Original method name
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */
    mapLevel: function mapLevel() {
      var methodName = arguments.length <= 0 || arguments[0] === undefined ? 'log' : arguments[0];
      var originalMethodName = arguments.length <= 1 || arguments[1] === undefined ? 'log' : arguments[1];

      providerConfig.levelMapping[methodName] = originalMethodName;
      return this;
    },

    /**
     * Use a custom formatting function to munge data before sending it
     * to Loggly.
     * @param {Function} [func] Formatting function.  This function should
     * accept two (2) parameters:
     * - `level`: The "level" of the $log call.  `debug`, `warn`, `error`, etc.
     * - `body`: An object containing the rest of the message body.  By default
     * we use the following fields:
     *   - `label`: A "label" for the log message
     *   - `desc`: The `string` log message itself
     *   - `data`: An object with extra data in it
     * `func` should then return a complete `Object` to send to Loggly.
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */
    formatter: function formatter(func) {
      if (isFunction(func)) {
        providerConfig.formatter = func;
      }
      return this;
    },

    /**
     * Returns the current configuration.
     * @returns {{logglyConfig: {logglyKey: string, sendConsoleErrors:
     *   boolean}, providerConfig: {allowUncaught: boolean, logglyUrl: string,
     *   levelMapping: Object, formatter: Function}}}
     */
    config: function config() {
      return {
        logglyConfig: logglyConfig,
        providerConfig: providerConfig
      };
    },

    /**
     * Decorates $log with the configuration.  Must be called during
     * config() phase.
     */
    decorate: function decorate() {
      $provide.decorate('$log', require('./log'));
    },

    // @ngInject
    $get: require('./service')({ logglyConfig: logglyConfig, providerConfig: providerConfig })
  });
}
$logglyProvider.$inject = ["$provide"];

module.exports = $logglyProvider;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./log":2,"./service":4}],4:[function(require,module,exports){
'use strict';

function $logglyService(config) {
  // @ngInject
  return function $loggly($window, $document) {
    var tracker = $window._LTracker = $window._LTracker || [];

    /**
     * Bootstraps the service by loading the Loggly script from
     * {@link providerConfig.logglyUrl}, and initiating the tracker.
     * This is done automatically.
     * @todo Support for multiple trackers
     * @param {Object} [logglyConfig] Alternative Loggly configuration
     * @param {Object} [providerConfig] Alternative $loggly configuration
     */
    function bootstrap() {
      var logglyConfig = arguments.length <= 0 || arguments[0] === undefined ? config.logglyConfig : arguments[0];
      var providerConfig = arguments.length <= 1 || arguments[1] === undefined ? config.providerConfig : arguments[1];

      var script = $document.createElement('script');
      // noinspection JSCheckFunctionSignatures
      script.setAttribute('async', true);
      script.setAttribute('src', providerConfig.logglyUrl);
      $document.querySelector('head').appendChild(script);
      send(logglyConfig);
    }

    /**
     * Sends data to Loggly by pushing to the tracker array.
     * @param {*} data Data to send
     * @returns {*} Data you sent
     */
    function send(data) {
      tracker.push(data);
      return data;
    }

    return {
      bootstrap: bootstrap,
      config: config,
      send: send
    };
  };
}

module.exports = $logglyService;

},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var angular = typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null;
var moduleName = 'fv.loggly-mixin';
var logglyDecorator = angular.module(moduleName, []);

logglyDecorator.provider('$loggly', require('./provider')).run(["$loggly", "$rootScope", function ($loggly, $rootScope) {
  $loggly.bootstrap();
  $rootScope.$emit(moduleName + ':ready');
}]);

module.exports = moduleName;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./provider":3}]},{},[5])(5)
});