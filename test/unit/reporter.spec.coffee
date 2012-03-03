#==============================================================================
# lib/reporter.js module
#==============================================================================
describe 'reporter', ->
  r = require '../../lib/reporter'

  #============================================================================
  # reporter.Progress
  #============================================================================
  describe 'Progress', ->
    adapter = reporter = null

    beforeEach ->
      adapter = jasmine.createSpy 'STDOUT'
      reporter = new r.Progress adapter


    it 'should write to all registered adapters', ->
      anotherAdapter = jasmine.createSpy 'ADAPTER2'
      reporter.adapters.push anotherAdapter

      reporter.write 'some'
      expect(adapter).toHaveBeenCalledWith 'some'
      expect(anotherAdapter).toHaveBeenCalledWith 'some'


    it 'should format', ->
      reporter.write 'Success: %d Failure: %d', 10, 20

      expect(adapter).toHaveBeenCalledWith 'Success: 10 Failure: 20'
