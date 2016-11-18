import chai = require('chai')
import logger = require('../../lib/logger')
import * as sinon from 'sinon'

require('bluebird').longStackTraces();

// publish globals that all specs can use
(<any>global).expect = chai.expect;
(<any>global).should = chai.should();
(<any>global).sinon = sinon;

// chai plugins
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))
chai.use(require('chai-subset'))

beforeEach(() => {
  (<any>global).sinon = sinon.sandbox.create()

  // set logger to log INFO, but do not append to console
  // so that we can assert logs by logger.on('info', ...)
  logger.setup('INFO', false, [])
})

afterEach(() => {
  (<any>global).sinon.restore()
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
(<any>global).scheduleNextTick = (action) => {
  nextTickQueue.push(action)

  if (nextTickQueue.length === 1) process.nextTick(nextTickCallback)
}
var nextQueue = []
var nextCallback = () => {
  // if not nextQueue.length then throw new Error 'Nothing scheduled!'
  nextQueue.shift()()
}

(<any>global).scheduleNextTick = (action) => {
  nextTickQueue.push(action)

  if (nextTickQueue.length === 1) process.nextTick(nextTickCallback)
}
(<any>global).scheduleNext = (action) => {
  nextQueue.push(action)
}

(<any>global).next = nextCallback

beforeEach(() => {
  nextTickQueue.length = 0
  nextQueue.length = 0
})
