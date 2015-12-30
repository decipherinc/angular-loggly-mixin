'use strict';

/**
 * Unit test fixture
 * - configures chai
 * - puts a bunch of stuff in the global context for convenience
 */

const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));

global.expect = chai.expect;
global.sinon = sinon;
global.angular = require('angular');

require('angular-mocks');
global.mock = global.angular.mock;
