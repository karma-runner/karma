sinon = require 'sinon'
chai = require 'chai'
logger = require '../../lib/logger'

# publish globals that all specs can use
global.timer = require 'timer-shim'
global.expect = chai.expect
global.should = chai.should()
global.sinon = sinon

# chai plugins
chai.use(require 'chai-as-promised')
chai.use(require 'sinon-chai')

# TODO(vojta): remove this global stub
sinon.stub(timer, 'setTimeout').callsArg 0

beforeEach ->
  global.sinon = sinon.sandbox.create()

  # set logger to log INFO, but do not append to console
  # so that we can assert logs by logger.on('info', ...)
  logger.setup 'INFO', false, []

afterEach ->
  global.sinon.restore()
