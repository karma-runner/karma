#==============================================================================
# lib/reporter.js module
#==============================================================================
describe 'reporter', ->
  loadFile = require('mocks').loadFile
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/reporter.js', {xmlbuilder: require 'xmlbuilder'}


  #==============================================================================
  # formatError() [PRIVATE]
  #==============================================================================
  describe 'formatError', ->
    formatError = null

    beforeEach ->
      formatError = m.createErrorFormatter '', '/'


    it 'should indent', ->
      expect(formatError 'Something', '\t').toBe '\tSomething\n'


    it 'should remove domain from files', ->
      expect(formatError 'file http://localhost:8080/base/usr/a.js and ' +
                         'http://127.0.0.1:8080/base/home/b.js').
          toBe 'file /usr/a.js and /home/b.js\n'

    it 'should handle non default testacular service folders', ->
      formatError = m.createErrorFormatter '', '/_testacular_/'
      expect(formatError 'file http://localhost:8080/_testacular_/base/usr/a.js and ' +
                         'http://127.0.0.1:8080/_testacular_/base/home/b.js').
          toBe 'file /usr/a.js and /home/b.js\n'

    it 'should remove timestamps', ->
      expect(formatError 'file http://localhost:8080/base/usr/file.js?1325400290544 and ' +
                         'http://127.0.0.1:8080/absolute/home/file.js?1332400290889').
          toBe 'file /usr/file.js and /home/file.js\n'


    it 'should indent all lines', ->
      expect(formatError 'first\nsecond\nthird', '\t').toBe '\tfirst\n\tsecond\n\tthird\n'


    it 'should restore base paths', ->
      formatError = m.createErrorFormatter '/some/base', '/'
      expect(formatError 'at http://localhost:123/base/a.js?123').toBe 'at /some/base/a.js\n'


    it 'should restore absolute paths', ->
      expect(formatError 'at http://local:1233/absolute/usr/path.js?3333').toBe 'at /usr/path.js\n'

