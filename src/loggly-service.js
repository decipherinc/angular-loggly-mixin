'use strict';

const {element} = require('angular');

function $logglyServiceFactory(config) {
  const namespace = config.providerConfig.$namespace;

  // @ngInject
  return function $logglyService($window, $document, $injector) {
    $window._LTracker = [];

    return {
      $tracker: $window._LTracker,
      /**
       * Bootstraps the service by loading the Loggly script from
       * {@link providerConfig.logglyUrl}, and initiating the tracker.
       * This is done automatically.
       * @todo Support for multiple trackers
       * @param {Object} [logglyConfig] Alternative Loggly configuration
       * @param {Object} [providerConfig] Alternative service configuration
       * @private
       */
      $bootstrap(logglyConfig = config.logglyConfig,
        providerConfig = config.providerConfig) {
        const script = element('<script>')
          .prop('async', true)
          .attr('src', providerConfig.logglyUrl);
        $document.find('head')
          .append(script);
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
      $emit(event, ...data) {
        return $injector.get('$rootScope')
          .$emit(`${namespace}:${event}`, ...data);
      },
      /**
       * Sends data to Loggly by pushing to the tracker array.
       * @param {...*} data Data to send
       */
      send(...data) {
        this.$tracker.push(...data);
      },
      config
    };
  };
}

module.exports = $logglyServiceFactory;
