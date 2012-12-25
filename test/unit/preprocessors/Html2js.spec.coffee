describe 'preprocessors html2js', ->

  process = require '../../../lib/preprocessors/Html2js'
  File = require('../../../lib/file-list').File

  removeSpacesFrom = (str) ->
    str.replace /[\s\n]/g, ''

  it 'should convert html to js code', (done) ->
    file = new File '/base/path/file.html'
    HTML = '<html></html>'
    RESULT = 'angular.module(\'path/file.html\',[]).run(function($templateCache){' +
      '$templateCache.put(\'path/file.html\',\'<html></html>\');' +
    '});'

    process HTML, file, '/base', (processedContent) ->
      expect(removeSpacesFrom processedContent).to.equal RESULT
      done()


  it 'should change path to *.js', (done) ->
    file = new File '/base/path/file.html'

    process '', file, '/base', (processedContent) ->
      expect(file.path).to.equal '/base/path/file.html.js'
      done()


  it 'should preserve new lines', (done) ->
    file = new File '/base/path/file.html'

    process 'first\nsecond', file, '/base', (processedContent) ->
      expect(removeSpacesFrom processedContent).to.contain "'first\\n'+'second'"
      done()
