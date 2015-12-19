'use strict';

var _require = require('angular');

var isString = _require.isString;
var isDefined = _require.isDefined;
var isObject = _require.isObject;
var isFunction = _require.isFunction;
var extend = _require.extend;

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
  return extend({ level: level }, body);
}

// @ngInject
function $logglyProvider($provide, $$logglyMixinNamespace) {
  var logglyConfig = {
    logglyKey: '',
    sendConsoleErrors: false
  };

  var providerConfig = {
    allowUncaught: true,
    timerLevel: 'time',
    logglyUrl: '//cloudfront.loggly.com/js/loggly.tracker.js',
    levelMapping: {
      debug: 'debug',
      log: 'log',
      info: 'info',
      warn: 'warn',
      error: 'error',
      time: 'log'
    },
    formatter: defaultFormatter,
    $namespace: $$logglyMixinNamespace
  };

  var provider = {
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
        extend(providerConfig.levelMapping, value);
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
     * Decorates $log with the configuration.  Must be called during
     * config() phase.
     */
    decorate: function decorate() {
      $provide.decorate('$log', require('./log-decorator'));
    },

    /**
     * Sets the level used by `$log.timerEnd()` method.
     * @param {string} [value] Should correspond to a key in the level mapping
     * @this $logglyProvider
     * @returns {$logglyProvider}
     */
    timerLevel: function timerLevel(value) {
      if (isDefined(value)) {
        providerConfig.timerLevel = value;
      }
      return this;
    },

    // @ngInject
    $get: require('./loggly-service')({ logglyConfig: logglyConfig, providerConfig: providerConfig })
  };

  Object.defineProperty(provider, 'config', {
    value: { logglyConfig: logglyConfig, providerConfig: providerConfig },
    writable: false,
    configurable: true
  });

  return provider;
}

module.exports = $logglyProvider;