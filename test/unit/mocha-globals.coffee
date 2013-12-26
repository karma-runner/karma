require 'coffee-errors'

sinon = require 'sinon'
chai = require 'chai'
logger = require '../../lib/logger'

# publish globals that all specs can use
global.expect = chai.expect
global.should = chai.should()
global.sinon = sinon

# chai plugins
chai.use(require 'chai-as-promised')
chai.use(require 'sinon-chai')

beforeEach ->
  global.sinon = sinon.sandbox.create()

  # set logger to log INFO, but do not append to console
  # so that we can assert logs by logger.on('info', ...)
  logger.setup 'INFO', false, []

afterEach ->
  global.sinon.restore()



# TODO(vojta): move to helpers or something
chai.use (chai, utils) ->
  chai.Assertion.addMethod 'beServedAs', (expectedStatus, expectedBody) ->
    response = utils.flag @, 'object'

    @assert response._status is expectedStatus,
      "expected response status '#{response._status}' to be '#{expectedStatus}'"
    @assert response._body is expectedBody,
      "expected response body '#{response._body}' to be '#{expectedBody}'"

  chai.Assertion.addMethod 'beNotServed', ->
    response = utils.flag @, 'object'

    @assert response._status is null,
      "expected response status to not be set, it was '#{response._status}'"
    @assert response._body is null,
      "expected response body to not be set, it was '#{response._body}'"


# TODO(vojta): move it somewhere ;-)
nextTickQueue = []
nextTickCallback = ->
  if not nextTickQueue.length then throw new Error 'Nothing scheduled!'
  nextTickQueue.shift()()
  if nextTickQueue.length then process.nextTick nextTickCallback

global.scheduleNextTick = (action) ->
  nextTickQueue.push action
  if nextTickQueue.length is 1 then process.nextTick nextTickCallback

nextQueue = []
nextCallback = ->
  if not nextQueue.length then throw new Error 'Nothing scheduled!'
  nextQueue.shift()()

global.scheduleNextTick = (action) ->
  nextTickQueue.push action
  if nextTickQueue.length is 1 then process.nextTick nextTickCallback

global.scheduleNext = (action) ->
  nextQueue.push action

global.next = nextCallback

beforeEach ->
  nextTickQueue.length = 0
  nextQueue.length = 0
