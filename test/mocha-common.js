/**
 * test/unit/common.js
 *
 * Loads all needed libraries for testing.
 */

var sinon = global.sinon = require('sinon');
var chai = require('chai');
var logger = require('../lib/logger');

global.expect = chai.expect;
global.should = chai.should();

// chai plugins
global.chaiAsPromised = require('chai-as-promised');
global.sinonChai = require('sinon-chai');

global.timer = require('timer-shim');


chai.use(sinonChai);
chai.use(chaiAsPromised);

sinon.stub(timer, 'setTimeout').callsArg(0);

beforeEach(function() {
  global.sinon = sinon.sandbox.create();

  // set logger to log INFO, but do not append to console
  // so that we can assert logs by logger.on('info', ...)
  logger.setup('INFO', false, []);
});

afterEach(function() {
  global.sinon.restore();
});
