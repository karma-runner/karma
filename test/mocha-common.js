/**
 * test/unit/common.js
 *
 * Loads all needed libraries for testing.
 */


global.sinon = require('sinon');
global.chai = require('chai');
global.expect = chai.expect;
global.should = chai.should();
// Chai plugins
global.chaiAsPromised = require('chai-as-promised');
global.sinonChai = require('sinon-chai');

global.timer = require('timer-shim');

chai.use(sinonChai);
chai.use(chaiAsPromised);

// stub console
sinon.stub(console, 'log');
// stub setTimeout
sinon.stub(timer, 'setTimeout').callsArg(0);
