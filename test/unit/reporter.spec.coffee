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
      expect(formatError 'Something', '\t').to.equal '\tSomething\n'


    it 'should remove domain from files', ->
      expect(formatError 'file http://localhost:8080/base/usr/a.js and ' +
                         'http://127.0.0.1:8080/base/home/b.js').
          to.be.equal 'file /usr/a.js and /home/b.js\n'

    it 'should handle non default testacular service folders', ->
      formatError = m.createErrorFormatter '', '/_testacular_/'
      expect(formatError 'file http://localhost:8080/_testacular_/base/usr/a.js and ' +
                         'http://127.0.0.1:8080/_testacular_/base/home/b.js').
          to.be.equal 'file /usr/a.js and /home/b.js\n'

    it 'should remove timestamps', ->
      expect(formatError 'file http://localhost:8080/base/usr/file.js?1325400290544 and ' +
                         'http://127.0.0.1:8080/absolute/home/file.js?1332400290889').
          to.be.equal 'file /usr/file.js and /home/file.js\n'


    it 'should indent all lines', ->
      expect(formatError 'first\nsecond\nthird', '\t').to.equal '\tfirst\n\tsecond\n\tthird\n'


    it 'should restore base paths', ->
      formatError = m.createErrorFormatter '/some/base', '/'
      expect(formatError 'at http://localhost:123/base/a.js?123').to.equal 'at /some/base/a.js\n'


    it 'should restore absolute paths', ->
      expect(formatError 'at http://local:1233/absolute/usr/path.js?3333').to.equal 'at /usr/path.js\n'

