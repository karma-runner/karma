describe 'http', ->
  httpMock = require './http'

  describe 'ServerResponse', ->
    response = null

    beforeEach ->
      response = new httpMock.ServerResponse

    it 'should set body', ->
      response.end 'Some Body'
      expect(response._body).toBe 'Some Body'


    it 'should ignore end() when already sent', ->
      response.end 'First Body'
      response.end 'Another Body'
      expect(response._body).toBe 'First Body'


    it 'should set and remove headers', ->
      response.setHeader 'Content-Type', 'text/javascript'
      response.setHeader 'Cache-Control', 'no-cache'
      response.setHeader 'Content-Type', 'text/plain'
      response.removeHeader 'Cache-Control'

      expect(response._headers).toEqual {'Content-Type': 'text/plain'}


    it 'should throw when trying to send headers twice', ->
      response.writeHead 200

      expect(-> response.writeHead 200)
        .toThrow "Can't render headers after they are sent to the client."

    it 'should throw when trying to set headers after sending', ->
      response.writeHead 200

      expect(-> response.setHeader 'Some', 'Value')
        .toThrow "Can't set headers after they are sent."

    it 'isFinished() should assert whether headers and body has been sent', ->
      expect(response._isFinished()).toBe false

      response.setHeader 'Some', 'Value'
      expect(response._isFinished()).toBe false

      response.writeHead 404
      expect(response._isFinished()).toBe false

      response.end 'Some body'
      expect(response._isFinished()).toBe true
