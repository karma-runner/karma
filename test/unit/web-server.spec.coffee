#==============================================================================
# lib/web-server.js module
#==============================================================================
describe 'web-server', ->
  loadFile = require('../util').loadFile
  fsMock = require '../mock/fs'
  httpMock = require '../mock/http'

  files = []; handler = response = null

  # mock fileGuardian
  fileGuardian =
    getFiles: -> files

  # async helper
  waitForFinishingResponse = ->
    waitsFor (-> response._isFinished()), 'Finish response', 1000

  mocks = {}
  mocks.fs = fsMock.create
    tpl:
      'client.html':  fsMock.file(0, 'CLIENT HTML'),
      'context.html': fsMock.file(0, 'CONTEXT\n%SCRIPTS%')
    src:
      'some.js': fsMock.file(0, 'js-source')

  # load file under test
  m = loadFile __dirname + '/../../lib/web-server.js', mocks

  beforeEach ->
    handler = m.createHandler fileGuardian, '/tpl/'
    response = new httpMock.ServerResponse

  it 'should server client.html', ->
    handler new httpMock.ServerRequest('/'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CLIENT HTML'
      expect(response._status).toBe 200


  it 'should server context.html with replaced script tags', ->
    files = [{path: '/first.js', mtime: new Date 12345},
             {path: '/second.js', mtime: new Date 67890}]

    handler new httpMock.ServerRequest('/context.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toEqual 'CONTEXT\n' +
        '<script type="text/javascript" src="/first.js?12345"></script>\n' +
        '<script type="text/javascript" src="/second.js?67890"></script>'
      expect(response._status).toBe 200


  it 'should send non-caching headers for context.html', ->
    handler new httpMock.ServerRequest('/context.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._headers['Cache-Control']).toBe 'no-cache'


  it 'should serve js source files without timestamp', ->
    handler new httpMock.ServerRequest('/src/some.js?123345'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toBe 'js-source'
      expect(response._status).toBe 200


  it 'should send strict caching headers for js source files', ->
    handler new httpMock.ServerRequest('/src/some.js'), response
    waitForFinishingResponse()

    runs ->
      expect(response._headers['Cache-Control']).toEqual ['public', 'max-age=31536000']


  it 'should serve 404 page for non-existing files', ->
    handler new httpMock.ServerRequest('/non-existing.html'), response
    waitForFinishingResponse()

    runs ->
      expect(response._body).toBe 'NOT FOUND'
      expect(response._status).toBe 404
