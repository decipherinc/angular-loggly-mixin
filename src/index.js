'use strict';

const angular = require('angular');
const moduleName = 'fv.loggly-mixin';
const logglyMixin = angular.module(moduleName, []);

logglyMixin
  .constant('$$logglyMixinNamespace', moduleName)
  .provider('$loggly', require('./loggly-provider'))
  .run($loggly => {
    $loggly.$bootstrap();
  });

module.exports = moduleName;
