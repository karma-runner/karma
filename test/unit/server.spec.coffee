#==============================================================================
# lib/server.js module
#==============================================================================
describe 'server', ->
  # TODO(vojta):
  'should try next port if already in use'
  'should launch browsers after web server started'

  # single run
  'should run tests when all browsers captured'
  'should run tests when first browser captured if no browser configured'

  describe '', ->
    # This suite wants to fake some modules that Karma loads with require(),
    # hence the need for 'mockery' and these before blocks
    mockery = di = q = constants = null
    beforeEach ->
      mockery = require 'mockery'
      di = require 'di'
      q = require 'q'
      constants = require '../../lib/constants'
      mockery.enable
        useCleanCache: true
        warnOnReplace: false
        warnOnUnregistered: false

    afterEach ->
      mockery.disable()

    it 'should not start server until frameworks are loaded', (done) ->
      serverStarted = false
      frameworksLoaded = false
      mockery.registerMock 'async1',
        'framework:async1': ['factory', ->
          deferred = q.defer()
          setTimeout ->
            deferred.resolve()
          , 25
          return deferred.promise
        ]

      loaded = ->
        expect(serverStarted).to.equal false
        frameworksLoaded = true
        done()
      started = ->
        serverStarted = true
        expect(frameworksLoaded).to.equal true

      (require '../../lib/server').start {
        plugins: ['async1']
        frameworks: ['async1']
        logLevel: constants.LOG_DISABLE
      }, null, {
        frameworksLoaded: loaded
        serverStarted: started
      }