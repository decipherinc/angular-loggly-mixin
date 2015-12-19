'use strict';

var _require = require('angular');

var element = _require.element;

function $logglyService(config) {
  var namespace = config.providerConfig.$namespace;

  // @ngInject
  return function $loggly($window, $document, $rootScope) {
    return {
      tracker: $window._LTracker = $window._LTracker || [],
      /**
       * Bootstraps the service by loading the Loggly script from
       * {@link providerConfig.logglyUrl}, and initiating the tracker.
       * This is done automatically.
       * @todo Support for multiple trackers
       * @param {Object} [logglyConfig] Alternative Loggly configuration
       * @param {Object} [providerConfig] Alternative service configuration
       * @private
       */
      $bootstrap: function $bootstrap() {
        var logglyConfig = arguments.length <= 0 || arguments[0] === undefined ? config.logglyConfig : arguments[0];
        var providerConfig = arguments.length <= 1 || arguments[1] === undefined ? config.providerConfig : arguments[1];

        var script = element('<script>').prop('async', true).attr('src', providerConfig.logglyUrl);
        $document.find('head').append(script);
        this.send(logglyConfig);
        this.$emit('ready');
      },

      /**
       * Emits some event w data on `$rootScope`.
       * @param {string} event Event name
       * @param {...*} [data] Extra data
       * @private
       * @returns {Object} Event object
       */
      $emit: function $emit(event) {
        for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          data[_key - 1] = arguments[_key];
        }

        return $rootScope.$emit.apply($rootScope, [namespace + ':' + event].concat(data));
      },

      /**
       * Sends data to Loggly by pushing to the tracker array.
       * @param {*} data Data to send
       * @returns {*} Data you sent
       */
      send: function send(data) {
        this.tracker.push(data);
        return this;
      },

      config: config
    };
  };
}

module.exports = $logglyService;