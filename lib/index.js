'use strict';

var angular = require('angular');
var moduleName = 'fv.loggly-mixin';
var logglyMixin = angular.module(moduleName, []);

logglyMixin.constant('$$logglyMixinNamespace', moduleName).provider('$loggly', require('./loggly-provider')).run(function ($loggly) {
  $loggly.$bootstrap();
});

module.exports = moduleName;