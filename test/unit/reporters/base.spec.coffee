#==============================================================================
# lib/reporters/Base.js module
#==============================================================================
describe 'reporter', ->
  loadFile = require('mocks').loadFile
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../../lib/reporters/base.js'

  describe 'Progress', ->
    adapter = reporter = null

    beforeEach ->

      adapter = sinon.spy()
      reporter = new m.BaseReporter null, null, adapter


    it 'should write to all registered adapters', ->
      anotherAdapter = sinon.spy()
      reporter.adapters.push anotherAdapter

      reporter.write 'some'
      expect(adapter).to.have.been.calledWith 'some'
      expect(anotherAdapter).to.have.been.calledWith 'some'


    it 'should format', ->
      reporter.write 'Success: %d Failure: %d', 10, 20

      expect(adapter).to.have.been.calledWith 'Success: 10 Failure: 20'

    it 'should format log messages correctly for single browser', ->
      writeSpy = sinon.spy reporter, 'writeCommonMsg'

      reporter._browsers = ['Chrome']
      reporter.onBrowserLog 'Chrome', 'Message', 'LOG'

      expect(writeSpy).to.have.been.calledWith 'LOG: Message\n'

    it 'should format log messages correctly for multi browsers', ->
      writeSpy = sinon.spy reporter, 'writeCommonMsg'

      reporter._browsers = ['Chrome', 'Firefox']
      reporter.onBrowserLog 'Chrome', 'Message', 'LOG'

      expect(writeSpy).to.have.been.calledWith 'Chrome LOG: Message\n'

