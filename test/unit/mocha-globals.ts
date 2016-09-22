var sinon = require('sinon')
var chai = require('chai')
var logger = require('../../lib/logger')

require('bluebird').longStackTraces()

// publish globals that all specs can use
global.expect = chai.expect
global.should = chai.should()
global.sinon = sinon

// chai plugins
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))
chai.use(require('chai-subset'))

beforeEach(() => {
  global.sinon = sinon.sandbox.create()

  // set logger to log INFO, but do not append to console
  // so that we can assert logs by logger.on('info', ...)
  logger.setup('INFO', false, [])
})

afterEach(() => {
  global.sinon.restore()
})

// TODO(vojta): move to helpers or something
chai.use((chai, utils) => {
  chai.Assertion.addMethod('beServedAs', function (expectedStatus, expectedBody) {
    var response = utils.flag(this, 'object')

    this.assert(response._status === expectedStatus,
      `expected response status '${response._status}' to be '${expectedStatus}'`)
    this.assert(response._body === expectedBody,
      `expected response body '${response._body}' to be '${expectedBody}'`)
  })

  chai.Assertion.addMethod('beNotServed', function () {
    var response = utils.flag(this, 'object')

    this.assert(response._status === null,
      `expected response status to not be set, it was '${response._status}'`)
    this.assert(response._body === null,
      `expected response body to not be set, it was '${response._body}'`)
  })
})

// TODO(vojta): move it somewhere ;-)
var nextTickQueue = []
var nextTickCallback = () => {
  if (!nextTickQueue.length) throw new Error('Nothing scheduled!')
  nextTickQueue.shift()()

  if (nextTickQueue.length) process.nextTick(nextTickCallback)
}
global.scheduleNextTick = (action) => {
  nextTickQueue.push(action)

  if (nextTickQueue.length === 1) process.nextTick(nextTickCallback)
}
var nextQueue = []
var nextCallback = () => {
  // if not nextQueue.length then throw new Error 'Nothing scheduled!'
  nextQueue.shift()()
}

global.scheduleNextTick = (action) => {
  nextTickQueue.push(action)

  if (nextTickQueue.length === 1) process.nextTick(nextTickCallback)
}
global.scheduleNext = (action) => {
  nextQueue.push(action)
}

global.next = nextCallback

beforeEach(() => {
  nextTickQueue.length = 0
  nextQueue.length = 0
})
