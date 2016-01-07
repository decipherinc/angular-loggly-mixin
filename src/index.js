'use strict';

const angular = require('angular');
const moduleName = 'fv.loggly-mixin';
const logglyMixin = angular.module(moduleName, []);

logglyMixin
  .constant('$$logglyMixinNamespace', moduleName)
  .provider('$loggly', require('./loggly-provider'))
  .config($provide => $provide.decorator('$log', require('./log-decorator')))
  .run($loggly => $loggly.$bootstrap());

module.exports = moduleName;
