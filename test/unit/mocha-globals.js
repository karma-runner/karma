const sinon = require('sinon')
const chai = require('chai')
const logger = require('../../lib/logger')
const recording = require('log4js/lib/appenders/recording')

// publish globals that all specs can use
global.expect = chai.expect
global.should = chai.should()
global.sinon = sinon

// chai plugins
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))
chai.use(require('chai-subset'))

beforeEach(() => {
  global.sinon = sinon.createSandbox()

  // Use https://log4js-node.github.io/log4js-node/recording.html to verify logs
  const vcr = { vcr: { type: 'recording' } }
  logger.setup('INFO', false, vcr)
})

afterEach(() => {
  global.sinon.restore()
  recording.erase()
})

// TODO(vojta): move to helpers or something
chai.use((chai, utils) => {
  chai.Assertion.addMethod('beServedAs', function (expectedStatus, expectedBody) {
    const response = utils.flag(this, 'object')

    this.assert(response._status === expectedStatus,
      `expected response status '${response._status}' to be '${expectedStatus}'`)
    this.assert(response._body === expectedBody,
      `expected response body '${response._body}' to be '${expectedBody}'`)
  })

  chai.Assertion.addMethod('beNotServed', function () {
    const response = utils.flag(this, 'object')

    this.assert(response._status === null,
      `expected response status to not be set, it was '${response._status}'`)
    this.assert(response._body === null,
      `expected response body to not be set, it was '${response._body}'`)
  })
})
