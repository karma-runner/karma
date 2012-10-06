#==============================================================================
# lib/reporters/Base.js module
#==============================================================================
describe 'reporter', ->
  loadFile = require('mocks').loadFile
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../../lib/reporters/Base.js'

  describe 'Progress', ->
    adapter = reporter = null

    beforeEach ->
      
      adapter = jasmine.createSpy 'STDOUT'
      reporter = new m.BaseReporter null, null, adapter


    it 'should write to all registered adapters', ->
      anotherAdapter = jasmine.createSpy 'ADAPTER2'
      reporter.adapters.push anotherAdapter

      reporter.write 'some'
      expect(adapter).toHaveBeenCalledWith 'some'
      expect(anotherAdapter).toHaveBeenCalledWith 'some'


    it 'should format', ->
      reporter.write 'Success: %d Failure: %d', 10, 20

      expect(adapter).toHaveBeenCalledWith 'Success: 10 Failure: 20'

    
