describe 'middleware.concatenated', ->
  q = require 'q'

  mocks = require 'mocks'
  HttpResponseMock = mocks.http.ServerResponse
  HttpRequestMock = mocks.http.ServerRequest

  File = require('../../../lib/file_list').File

  createConcatenatedJsMiddleware = require('../../../lib/middleware/concatenated').create
  handler = filesDeferred = nextSpy = response = null

  beforeEach ->
    nextSpy = sinon.spy()
    response = new HttpResponseMock
    filesDeferred = q.defer()
    handler = createConcatenatedJsMiddleware filesDeferred.promise, '/base/path'


  file = (path, content) ->
    f = new File(path)
    f.content = content
    return f

  callHandlerWith = (url, next) ->
    promise = handler new HttpRequestMock(url), response, next or nextSpy
    if promise and promise.done then promise.done()


  it 'should ignore requests not to /concatenated.js', ->
    callHandlerWith '/some/other.html', ->
      expect(response).to.beNotServed()

  it 'should concatenate files for /concatenated.js', (done) ->
    files = [
      file '/src/some.js', 'some().js();'
      file '/other.js', 'multi();\nline();'
    ]
    filesDeferred.resolve {included: [], served: files}

    expected = """
      // /src/some.js
      try{eval("some().js();\\n//# sourceURL=http://concatenate/src/some.js");} \
      catch(e) { if (!e.fileName) e.message +=" @/src/some.js"; throw e;}

      // /other.js
      try{eval("multi();\\nline();\\n//# sourceURL=http://concatenate/other.js");} \
      catch(e) { if (!e.fileName) e.message +=" @/other.js"; throw e;}


      """

    response.once 'end', ->
      expect(nextSpy).not.to.have.been.called
      expect(response).to.beServedAs 200, expected
      done()

    callHandlerWith '/concatenated.js'
