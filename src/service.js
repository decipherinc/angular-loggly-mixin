'use strict';

function $logglyService(config) {
  // @ngInject
  return function $loggly($window, $document) {
    const tracker = $window._LTracker = $window._LTracker || [];

    /**
     * Bootstraps the service by loading the Loggly script from
     * {@link providerConfig.logglyUrl}, and initiating the tracker.
     * This is done automatically.
     * @todo Support for multiple trackers
     * @param {Object} [logglyConfig] Alternative Loggly configuration
     * @param {Object} [providerConfig] Alternative $loggly configuration
     */
    function bootstrap(logglyConfig = config.logglyConfig,
      providerConfig = config.providerConfig) {
      const script = $document.createElement('script');
      // noinspection JSCheckFunctionSignatures
      script.setAttribute('async', true);
      script.setAttribute('src', providerConfig.logglyUrl);
      $document.querySelector('head')
        .appendChild(script);
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
      bootstrap,
      config,
      send
    };
  };
}

module.exports = $logglyService;
