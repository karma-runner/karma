sinon = require 'sinon'
chai = require 'chai'

global.expect = chai.expect
global.sinon = null


beforeEach ->
  global.sinon = sinon.sandbox.create()

afterEach ->
  global.sinon.restore()
