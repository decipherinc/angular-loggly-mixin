'use strict';

const angular = require('angular');
const moduleName = 'fv.loggly-mixin';
const logglyMixin = angular.module(moduleName, []);

logglyMixin
  .provider('$loggly', require('./provider'))
  .run(($loggly, $rootScope) => {
    $loggly.bootstrap();
    $rootScope.$emit(`${moduleName}:ready`);
  });

module.exports = moduleName;
