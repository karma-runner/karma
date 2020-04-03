'use strict'

const path = require('path')
const loadFile = require('mocks').loadFile
const helper = require('../../lib/helper')
const logger = require('../../lib/logger.js')

describe('config', () => {
  let m
  let e
  let mocks

  const resolveWinPath = (p) => helper.normalizeWinPath(path.resolve(p))

  const normalizeConfigWithDefaults = (cfg) => {
    if (!cfg.urlRoot) cfg.urlRoot = ''
    if (!cfg.proxyPath) cfg.proxyPath = ''
    if (!cfg.files) cfg.files = []
    if (!cfg.exclude) cfg.exclude = []
    if (!cfg.junitReporter) cfg.junitReporter = {}
    if (!cfg.coverageReporter) cfg.coverageReporter = {}
    if (!cfg.plugins) cfg.plugins = []

    return m.normalizeConfig(cfg)
  }

  // extract only pattern properties from list of pattern objects
  const patternsFrom = (list) => list.map((pattern) => pattern.pattern)

  const wrapCfg = function (cfg) {
    return (config) => config.set(cfg)
  }

  beforeEach(() => {
    mocks = {}
    mocks.process = { exit: sinon.spy() }
    const mockConfigs = {
      '/home/config1.js': wrapCfg({ basePath: 'base', reporters: ['dots'] }),
      '/home/config2.js': wrapCfg({ basePath: '/abs/base' }),
      '/home/config3.js': wrapCfg({ files: ['one.js', 'sub/two.js'] }),
      '/home/config4.js': wrapCfg({ port: 123, autoWatch: true, basePath: '/abs/base' }),
      '/home/config6.js': wrapCfg({ reporters: 'junit' }),
      '/home/config7.js': wrapCfg({ browsers: ['Chrome', 'Firefox'] }),
      '/home/config8.js': (config) => config.set({ files: config.suite === 'e2e' ? ['tests/e2e.spec.js'] : ['tests/unit.spec.js'] }),
      '/home/config9.js': wrapCfg({ client: { useIframe: false } }),
      '/conf/invalid.js': () => {
        throw new SyntaxError('Unexpected token =')
      },
      '/conf/exclude.js': wrapCfg({ exclude: ['one.js', 'sub/two.js'] }),
      '/conf/absolute.js': wrapCfg({ files: ['http://some.com', 'https://more.org/file.js'] }),
      '/conf/both.js': wrapCfg({ files: ['one.js', 'two.js'], exclude: ['third.js'] }),
      '/conf/coffee.coffee': wrapCfg({ files: ['one.js', 'two.js'] }),
      '/conf/default-export.js': { default: wrapCfg({ files: ['one.js', 'two.js'] }) }
    }

    // load file under test
    m = loadFile(path.join(__dirname, '/../../lib/config.js'), mocks, {
      global: {},
      process: mocks.process,
      require (path) {
        if (mockConfigs[path]) {
          return mockConfigs[path]
        }
        if (path.indexOf('./') === 0) {
          return require('../../lib/' + path)
        } else {
          return require(path)
        }
      }
    })
    e = m.exports
  })

  describe('parseConfig', () => {
    let logSpy

    beforeEach(() => {
      logSpy = sinon.spy(logger.create('config'), 'error')
    })

    it('should resolve relative basePath to config directory', () => {
      const config = e.parseConfig('/home/config1.js', {})
      expect(config.basePath).to.equal(resolveWinPath('/home/base'))
    })

    it('should keep absolute basePath', () => {
      const config = e.parseConfig('/home/config2.js', {})
      expect(config.basePath).to.equal(resolveWinPath('/abs/base'))
    })

    it('should resolve all file patterns', () => {
      const config = e.parseConfig('/home/config3.js', {})
      const actual = [resolveWinPath('/home/one.js'), resolveWinPath('/home/sub/two.js')]
      expect(patternsFrom(config.files)).to.deep.equal(actual)
    })

    it('should keep absolute url file patterns', () => {
      const config = e.parseConfig('/conf/absolute.js', {})
      expect(patternsFrom(config.files)).to.deep.equal([
        'http://some.com',
        'https://more.org/file.js'
      ])
    })

    it('should resolve all exclude patterns', () => {
      const config = e.parseConfig('/conf/exclude.js', {})
      const actual = [
        resolveWinPath('/conf/one.js'),
        resolveWinPath('/conf/sub/two.js'),
        resolveWinPath('/conf/exclude.js')
      ]

      expect(config.exclude).to.deep.equal(actual)
    })

    it('should log error and exit if file does not exist', () => {
      e.parseConfig('/conf/not-exist.js', {})

      expect(logSpy).to.have.been.called
      const event = logSpy.lastCall.args
      expect(event.toString().split('\n').slice(0, 2)).to.be.deep.equal(
        [`Error in config file!`, `  Error: Cannot find module '/conf/not-exist.js'`])
      expect(mocks.process.exit).to.have.been.calledWith(1)
    })

    it('should throw and log error if invalid file', () => {
      e.parseConfig('/conf/invalid.js', {})

      expect(logSpy).to.have.been.called
      const event = logSpy.lastCall.args
      expect(event[0]).to.eql('Error in config file!\n')
      expect(event[1].message).to.eql('Unexpected token =')
      expect(mocks.process.exit).to.have.been.calledWith(1)
    })

    it('should override config with given cli options', () => {
      const config = e.parseConfig('/home/config4.js', { port: 456, autoWatch: false })

      expect(config.port).to.equal(456)
      expect(config.autoWatch).to.equal(false)
      expect(config.basePath).to.equal(resolveWinPath('/abs/base'))
    })

    it('should override config with cli options if the config property is an array', () => {
      // regression https://github.com/karma-runner/karma/issues/283
      const config = e.parseConfig('/home/config7.js', { browsers: ['Safari'] })

      expect(config.browsers).to.deep.equal(['Safari'])
    })

    it('should merge config with cli options if the config property is an object', () => {
      // regression https://github.com/karma-runner/grunt-karma/issues/165
      const config = e.parseConfig('/home/config9.js', { client: { captureConsole: false } })

      expect(config.client.useIframe).to.equal(false)
      expect(config.client.captureConsole).to.equal(false)
    })

    it('should have access to cli options in the config file', () => {
      let config = e.parseConfig('/home/config8.js', { suite: 'e2e' })
      expect(patternsFrom(config.files)).to.deep.equal([resolveWinPath('/home/tests/e2e.spec.js')])

      config = e.parseConfig('/home/config8.js', {})
      expect(patternsFrom(config.files)).to.deep.equal([resolveWinPath('/home/tests/unit.spec.js')])
    })

    it('should resolve files and excludes to overridden basePath from cli', () => {
      const config = e.parseConfig('/conf/both.js', { port: 456, autoWatch: false, basePath: '/xxx' })

      expect(config.basePath).to.equal(resolveWinPath('/xxx'))
      const actual = [resolveWinPath('/xxx/one.js'), resolveWinPath('/xxx/two.js')]
      expect(patternsFrom(config.files)).to.deep.equal(actual)
      expect(config.exclude).to.deep.equal([
        resolveWinPath('/xxx/third.js'),
        resolveWinPath('/conf/both.js')
      ])
    })

    it('should normalize urlRoot config', () => {
      let config = normalizeConfigWithDefaults({ urlRoot: '' })
      expect(config.urlRoot).to.equal('/')

      config = normalizeConfigWithDefaults({ urlRoot: '/a/b' })
      expect(config.urlRoot).to.equal('/a/b/')

      config = normalizeConfigWithDefaults({ urlRoot: 'a/' })
      expect(config.urlRoot).to.equal('/a/')

      config = normalizeConfigWithDefaults({ urlRoot: 'some/thing' })
      expect(config.urlRoot).to.equal('/some/thing/')
    })

    it('should normalize upstream proxy config', () => {
      let config = normalizeConfigWithDefaults({})
      expect(config.upstreamProxy).to.be.undefined

      config = normalizeConfigWithDefaults({ upstreamProxy: {} })
      expect(config.upstreamProxy.path).to.equal('/')
      expect(config.upstreamProxy.hostname).to.equal('localhost')
      expect(config.upstreamProxy.port).to.equal(9875)
      expect(config.upstreamProxy.protocol).to.equal('http:')

      config = normalizeConfigWithDefaults({ upstreamProxy: { protocol: 'http' } })
      expect(config.upstreamProxy.protocol).to.equal('http:')

      config = normalizeConfigWithDefaults({ upstreamProxy: { protocol: 'https' } })
      expect(config.upstreamProxy.protocol).to.equal('https:')

      config = normalizeConfigWithDefaults({ upstreamProxy: { protocol: 'unknown' } })
      expect(config.upstreamProxy.protocol).to.equal('http:')

      config = normalizeConfigWithDefaults({ upstreamProxy: { path: '/a/b' } })
      expect(config.upstreamProxy.path).to.equal('/a/b/')

      config = normalizeConfigWithDefaults({ upstreamProxy: { path: 'a/' } })
      expect(config.upstreamProxy.path).to.equal('/a/')

      config = normalizeConfigWithDefaults({ upstreamProxy: { path: 'some/thing' } })
      expect(config.upstreamProxy.path).to.equal('/some/thing/')
    })

    it('should change autoWatch to false if singleRun', () => {
      // config4.js has autoWatch = true
      const config = m.parseConfig('/home/config4.js', { singleRun: true })
      expect(config.autoWatch).to.equal(false)
    })

    it('should normalize reporters to an array', () => {
      const config = m.parseConfig('/home/config6.js', {})
      expect(config.reporters).to.deep.equal(['junit'])
    })

    it('should compile coffeescript config', () => {
      const config = e.parseConfig('/conf/coffee.coffee', {})
      expect(patternsFrom(config.files)).to.deep.equal([
        resolveWinPath('/conf/one.js'),
        resolveWinPath('/conf/two.js')
      ])
    })

    it('should set defaults with coffeescript', () => {
      const config = e.parseConfig('/conf/coffee.coffee', {})
      expect(config.autoWatch).to.equal(true)
    })

    it('should not read config file, when null', () => {
      const config = e.parseConfig(null, { basePath: '/some' })

      expect(logSpy).not.to.have.been.called
      expect(config.basePath).to.equal(resolveWinPath('/some')) // overridden by CLI
      expect(config.urlRoot).to.equal('/')
    }) // default value

    it('should not read config file, when null but still resolve cli basePath', () => {
      const config = e.parseConfig(null, { basePath: './some' })

      expect(logSpy).not.to.have.been.called
      expect(config.basePath).to.equal(resolveWinPath('./some'))
      expect(config.urlRoot).to.equal('/')
    }) // default value

    it('should default unset options in client config', () => {
      let config = e.parseConfig(null, { client: { args: ['--test'] } })

      expect(config.client.useIframe).to.not.be.undefined
      expect(config.client.captureConsole).to.not.be.undefined

      config = e.parseConfig(null, { client: { useIframe: true } })

      expect(config.client.args).to.not.be.undefined
      expect(config.client.captureConsole).to.not.be.undefined

      config = e.parseConfig(null, { client: { captureConsole: true } })

      expect(config.client.useIframe).to.not.be.undefined
      expect(config.client.args).to.not.be.undefined
    })

    it('should validate and format the protocol', () => {
      let config = normalizeConfigWithDefaults({})
      expect(config.protocol).to.equal('http:')

      config = normalizeConfigWithDefaults({ protocol: 'http' })
      expect(config.protocol).to.equal('http:')

      config = normalizeConfigWithDefaults({ protocol: 'http:' })
      expect(config.protocol).to.equal('http:')

      config = normalizeConfigWithDefaults({ protocol: 'https' })
      expect(config.protocol).to.equal('https:')

      config = normalizeConfigWithDefaults({ protocol: 'https:' })
      expect(config.protocol).to.equal('https:')

      config = normalizeConfigWithDefaults({ protocol: 'unsupported:' })
      expect(config.protocol).to.equal('http:')
    })

    it('should allow the config to be set of the default export', () => {
      const config = e.parseConfig('/conf/default-export.js', {})
      expect(config.autoWatch).to.equal(true)
    })
  })

  describe('normalizeConfig', () => {
    it('should convert patterns to objects and set defaults', () => {
      const config = normalizeConfigWithDefaults({
        basePath: '/base',
        files: ['a/*.js', { pattern: 'b.js', watched: false, included: false }, { pattern: 'c.js' }],
        customContextFile: 'context.html',
        customDebugFile: 'debug.html',
        customClientContextFile: 'client_with_context.html'
      })

      expect(config.files.length).to.equal(3)

      let file = config.files.shift()
      expect(file.pattern).to.equal(resolveWinPath('/base/a/*.js'))
      expect(file.included).to.equal(true)
      expect(file.served).to.equal(true)
      expect(file.watched).to.equal(true)

      file = config.files.shift()
      expect(file.pattern).to.equal(resolveWinPath('/base/b.js'))
      expect(file.included).to.equal(false)
      expect(file.served).to.equal(true)
      expect(file.watched).to.equal(false)

      file = config.files.shift()
      expect(file.pattern).to.equal(resolveWinPath('/base/c.js'))
      expect(file.included).to.equal(true)
      expect(file.served).to.equal(true)
      expect(file.watched).to.equal(true)

      expect(config.customContextFile).to.equal(resolveWinPath('/base/context.html'))
      expect(config.customDebugFile).to.equal(resolveWinPath('/base/debug.html'))
      expect(config.customClientContextFile).to.equal(resolveWinPath('/base/client_with_context.html'))
    })

    it('should normalize preprocessors to an array', () => {
      const config = normalizeConfigWithDefaults({
        basePath: '',
        preprocessors: {
          '/*.coffee': 'coffee',
          '/*.html': 'html2js'
        }
      })

      expect(config.preprocessors[resolveWinPath('/*.coffee')]).to.deep.equal(['coffee'])
      expect(config.preprocessors[resolveWinPath('/*.html')]).to.deep.equal(['html2js'])
    })

    it('should resolve relative preprocessor patterns', () => {
      const config = normalizeConfigWithDefaults({
        basePath: '/some/base',
        preprocessors: {
          '*.coffee': 'coffee',
          '/**/*.html': 'html2js'
        }
      })

      expect(config.preprocessors).to.have.property(resolveWinPath('/some/base/*.coffee'))
      expect(config.preprocessors).not.to.have.property(resolveWinPath('*.coffee'))
      expect(config.preprocessors).to.have.property(resolveWinPath('/**/*.html'))
    })

    it('should validate that the browser option is an array', () => {
      const invalid = function () {
        normalizeConfigWithDefaults({
          browsers: 'Firefox'
        })
      }

      expect(invalid).to.throw('Invalid configuration: browsers option must be an array')
    })

    it('should validate that the formatError option is a function', () => {
      const invalid = function () {
        normalizeConfigWithDefaults({
          formatError: 'lodash/identity'
        })
      }

      expect(invalid).to.throw('Invalid configuration: formatError option must be a function.')
    })

    it('should prevent non-numeric input for numeric options', () => {
      const invalid = function () {
        normalizeConfigWithDefaults({
          pingTimeout: '10000'
        })
      }
      expect(invalid).to.throw('Invalid configuration: pingTimeout option must be a number.')
    })
  })

  describe('createPatternObject', () => {
    it('should parse string and set defaults', () => {
      const pattern = m.createPatternObject('some/**/*.js')

      expect(typeof pattern).to.equal('object')
      expect(pattern.pattern).to.equal('some/**/*.js')
      expect(pattern.watched).to.equal(true)
      expect(pattern.included).to.equal(true)
      expect(pattern.served).to.equal(true)
    })

    it('should merge pattern object and set defaults', () => {
      const pattern = m.createPatternObject({ pattern: 'a.js', included: false, watched: false })

      expect(typeof pattern).to.equal('object')
      expect(pattern.pattern).to.equal('a.js')
      expect(pattern.watched).to.equal(false)
      expect(pattern.included).to.equal(false)
      expect(pattern.served).to.equal(true)
    })

    it('should make urls not served neither watched', () => {
      let pattern = m.createPatternObject('http://some.url.com')

      expect(pattern.pattern).to.equal('http://some.url.com')
      expect(pattern.included).to.equal(true)
      expect(pattern.watched).to.equal(false)
      expect(pattern.served).to.equal(false)

      pattern = m.createPatternObject({ pattern: 'https://some.other.com' })

      expect(pattern.pattern).to.equal('https://some.other.com')
      expect(pattern.included).to.equal(true)
      expect(pattern.watched).to.equal(false)
      expect(pattern.served).to.equal(false)
    })
  })

  describe('custom', () => {
    const di = require('di')

    const forwardArgsFactory = function (args) {
      return args
    }

    const baseModule = {
      'preprocessor:base': ['type', forwardArgsFactory],
      'launcher:base': ['type', forwardArgsFactory],
      'reporter:base': ['type', forwardArgsFactory]
    }

    it('should define a custom launcher', () => {
      const config = normalizeConfigWithDefaults({
        customLaunchers: {
          custom: {
            base: 'base',
            first: 123,
            whatever: 'aaa'
          }
        }
      })

      const injector = new di.Injector([baseModule].concat(config.plugins))
      const injectedArgs = injector.get('launcher:custom')

      expect(injectedArgs).to.exist
      expect(injectedArgs.first).to.equal(123)
      expect(injectedArgs.whatever).to.equal('aaa')
    })

    it('should define a custom preprocessor', () => {
      const config = normalizeConfigWithDefaults({
        customPreprocessors: {
          custom: {
            base: 'base',
            second: 123,
            whatever: 'bbb'
          }
        }
      })

      const injector = new di.Injector([baseModule].concat(config.plugins))
      const injectedArgs = injector.get('preprocessor:custom')

      expect(injectedArgs).to.exist
      expect(injectedArgs.second).to.equal(123)
      expect(injectedArgs.whatever).to.equal('bbb')
    })

    it('should define a custom reporter', () => {
      const config = normalizeConfigWithDefaults({
        customReporters: {
          custom: {
            base: 'base',
            third: 123,
            whatever: 'ccc'
          }
        }
      })

      const injector = new di.Injector([baseModule].concat(config.plugins))
      const injectedArgs = injector.get('reporter:custom')

      expect(injectedArgs).to.exist
      expect(injectedArgs.third).to.equal(123)
      expect(injectedArgs.whatever).to.equal('ccc')
    })

    it('should not create empty module', () => {
      const config = normalizeConfigWithDefaults({})
      expect(config.plugins).to.deep.equal([])
    })
  })
})
