'use strict';

const {isString, isDefined, isObject, isFunction, extend} = require('angular');

/**
 * Format a message for sending to Loggly
 * @param {string} level Log level (debug, info, warn, etc)
 * @param {Object} [body={}] Extra message body
 * @param {string} [body.desc='(no description)'] Message description
 * @returns {Object}
 */
function defaultFormatter(level = 'unknown', body = {}) {
  body.desc = body.desc || '(no description)';
  return extend({level}, body);
}

// @ngInject
function $logglyProvider($provide, $$logglyMixinNamespace) {
  const logglyConfig = {
    logglyKey: '',
    sendConsoleErrors: true,
    tag: '',
    useDomainProxy: false
  };

  const providerConfig = {
    allowUncaught: true,
    timerLevel: 'time',
    logglyUrl: '//cloudfront.loggly.com/js/loggly.tracker-2.1.min.js',
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

  return {
    /**
     * Set the Loggly API key.  This must be set for operation.
     * @param {string} [value] API key
     * @this $logglyProvider
     * @returns {$logglyProvider} $logglyProvider
     */
    logglyKey(value) {
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
    logglyUrl(value) {
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
    allowUncaught(value) {
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
    sendConsoleErrors(value) {
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
    levelMapping(value) {
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
    mapLevel(methodName = 'log', originalMethodName = 'log') {
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
    formatter(func) {
      if (isFunction(func)) {
        providerConfig.formatter = func;
      }
      return this;
    },

    /**
     * Decorates $log with the configuration.  Must be called during
     * config() phase.
     */
    decorate() {
      $provide.decorator('$log', require('./log-decorator'));
    },

    /**
     * Sets the level used by `$log.timerEnd()` method.
     * @param {string} [value] Should correspond to a key in the level mapping
     * @this $logglyProvider
     * @returns {$logglyProvider}
     */
    timerLevel(value) {
      if (isDefined(value)) {
        providerConfig.timerLevel = value;
      }
      return this;
    },

    /**
     * Sets the tags Loggly will apply to all log messages
     * @param {...string} [values] One or more tags to apply
     * @this $logglyProvider
     * @returns {$logglyProvider}
     */
    tags(...values) {
      if (values.length) {
        logglyConfig.tag = values.join(',');
      }
      return this;
    },

    /**
     * Whether or not to use a domain proxy
     * @param {boolean} [value] True/false
     * @this $logglyProvider
     * @returns {$logglyProvider}
     */
    useDomainProxy(value) {
      if (isDefined(value)) {
        logglyConfig.useDomainProxy = Boolean(value);
      }
      return this;
    },

    $get: require('./loggly-service')({
      logglyConfig,
      providerConfig
    }),

    config: {
      logglyConfig,
      providerConfig
    }
  };
}

module.exports = $logglyProvider;
