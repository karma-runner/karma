#==============================================================================
# lib/init.js module
#==============================================================================
describe 'init', ->
  loadFile = require('mocks').loadFile
  path = require 'path'
  m = null

  beforeEach ->
    m = loadFile __dirname + '/../../lib/init.js', {glob: require 'glob'}
    sinon.stub m, 'installPackage'


  describe 'getBasePath', ->

    # just for windows.
    replace = (p) -> p.replace(/\//g, path.sep)

    it 'should be empty if config file in cwd', ->
      expect(m.getBasePath 'some.conf', replace('/usr/local/whatever')).to.equal ''


    it 'should handle leading "./', ->
      expect(m.getBasePath replace('./some.conf'), replace('/usr/local/whatever')).to.equal ''


    it 'should handle config file in subfolder', ->
      # config /usr/local/sub/folder/file.conf
      file = replace('sub/folder/file.conf')
      expect(m.getBasePath file, replace('/usr/local')).to.equal replace('../..')


    it 'should handle config in a parent path', ->
      # config /home/file.js
      basePath = m.getBasePath replace('../../../file.js'), replace('/home/vojta/tc/project')
      expect(basePath).to.equal replace('vojta/tc/project')


    it 'should handle config in parent subfolder', ->
      # config /home/vojta/other/f.js
      f = replace('../../other/f.js')
      expect(m.getBasePath f, replace('/home/vojta/tc/prj')).to.equal replace('../tc/prj')


    it 'should handle absolute paths', ->
      basePath = m.getBasePath replace('/Users/vojta/karma/conf.js'), replace('/Users/vojta')
      expect(basePath).to.equal replace('..')


  describe 'processAnswers', ->

    answers = (obj = {}) ->
      obj.files = obj.files or []
      obj.exclude = obj.exclude or []
      obj.browsers = obj.browsers or []
      obj


    it 'should add requirejs and set files non-included if requirejs used', ->
      processedAnswers = m.processAnswers answers {
        requirejs: true,
        includedFiles: ['test-main.js'],
        files: ['*.js']
      }

      expect(processedAnswers.frameworks).to.contain 'requirejs'
      expect(processedAnswers.files).to.deep.equal ['test-main.js']
      expect(processedAnswers.onlyServedFiles).to.deep.equal ['*.js']


    it 'should add coffee preprocessor', ->
      processedAnswers = m.processAnswers answers {
        files: ['src/*.coffee']
      }

      expect(processedAnswers.preprocessors).to.have.property '**/*.coffee'
      expect(processedAnswers.preprocessors['**/*.coffee']).to.deep.equal ['coffee']


  describe 'scenario:', ->
    vm = require 'vm'

    StateMachine = require '../../lib/init/state_machine'
    JavaScriptFormatter = require('../../lib/init/formatters').JavaScript
    DefaultKarmaConfig = require('../../lib/config').Config

    mockRli =
      close: -> null
      write: -> null
      prompt: -> null
      _deleteLineLeft: -> null
      _deleteLineRight: -> null

    mockColors =
      question: -> ''

    machine = formatter = null

    evaluateConfigCode = (code) ->
      sandbox = {module: {}}
      configModule = vm.runInNewContext code, sandbox
      config = new DefaultKarmaConfig
      sandbox.module.exports config
      config


    beforeEach ->
      machine = new StateMachine mockRli, mockColors
      formatter = new JavaScriptFormatter


    it 'should generate working config', (done) ->
      machine.process m.questions, (answers) ->
        basePath = m.getBasePath '../karma.conf.js', '/some/path'
        processedAnswers = m.processAnswers answers, basePath
        generatedConfigCode = formatter.generateConfigFile processedAnswers
        config = evaluateConfigCode generatedConfigCode

        # expect correct configuration
        expect(config.basePath).to.equal 'path'
        expect(config.frameworks).to.deep.equal ['jasmine']
        expect(config.browsers).to.contain 'Chrome'
        expect(config.browsers).to.contain 'Firefox'
        expect(config.files).to.deep.equal ['src/app.js', 'src/**/*.js', 'test/**/*.js']
        expect(config.exclude).to.deep.equal ['src/config.js']
        expect(config.autoWatch).to.equal false
        done()

      # frameworks
      machine.onLine 'jasmine'
      machine.onLine ''

      # requirejs
      machine.onLine 'no'

      # browsers
      machine.onLine 'Chrome'
      machine.onLine 'Firefox'
      machine.onLine ''

      # files
      machine.onLine 'src/app.js'
      machine.onLine 'src/**/*.js'
      machine.onLine 'test/**/*.js'
      machine.onLine ''

      # excludes
      machine.onLine 'src/config.js'
      machine.onLine ''

      # autoWatch
      machine.onLine 'no'


    it 'should generate config for requirejs', (done) ->
      machine.process m.questions, (answers) ->
        basePath = m.getBasePath '../karma.conf.js', '/some/path'
        processedAnswers = m.processAnswers answers, basePath
        generatedConfigCode = formatter.generateConfigFile processedAnswers
        config = evaluateConfigCode generatedConfigCode

        # expect correct configuration
        expect(config.frameworks).to.contain 'requirejs'
        expect(config.files).to.contain 'test/main.js'
        for pattern in config.files.slice(1)
          expect(pattern.included).to.equal false
        done()

      # frameworks
      machine.onLine 'jasmine'
      machine.onLine ''

      # requirejs
      machine.onLine 'yes'

      # browsers
      machine.onLine 'Chrome'
      machine.onLine ''

      # files
      machine.onLine 'src/**/*.js'
      machine.onLine 'test/**/*.js'
      machine.onLine ''

      # excludes
      machine.onLine ''
      machine.onLine ''

      # generate test-main
      machine.onLine 'no'

      # included files
      machine.onLine 'test/main.js'
      machine.onLine ''

      # autoWatch
      machine.onLine 'yes'


    it 'should generate the test-main for requirejs', (done) ->
      machine.process m.questions, (answers) ->
        basePath = m.getBasePath '../karma.conf.js', '/some/path'
        processedAnswers = m.processAnswers answers, basePath, 'test-main.js'
        generatedConfigCode = formatter.generateConfigFile processedAnswers
        config = evaluateConfigCode generatedConfigCode

        # expect correct processedAnswers
        expect(processedAnswers.generateTestMain).to.be.ok
        expect(processedAnswers.files).to.contain 'test-main.js'

        # expect correct configuration
        expect(config.frameworks).to.contain 'requirejs'
        for pattern in config.files.slice(1)
          expect(pattern.included).to.equal false
        done()

      # frameworks
      machine.onLine 'jasmine'
      machine.onLine ''

      # requirejs
      machine.onLine 'yes'

      # browsers
      machine.onLine 'Chrome'
      machine.onLine ''

      # files
      machine.onLine 'src/**/*.js'
      machine.onLine 'test/**/*.js'
      machine.onLine ''

      # excludes
      machine.onLine ''
      machine.onLine ''

      # generate test-main
      machine.onLine 'yes'

      # autoWatch
      machine.onLine 'yes'


    it 'should add coffee preprocessor', (done) ->
      machine.process m.questions, (answers) ->
        basePath = m.getBasePath 'karma.conf.js', '/cwd'
        processedAnswers = m.processAnswers answers, basePath
        generatedConfigCode = formatter.generateConfigFile processedAnswers
        config = evaluateConfigCode generatedConfigCode

        # expect correct configuration
        expect(config.preprocessors).to.have.property '**/*.coffee'
        expect(config.preprocessors['**/*.coffee']).to.deep.equal ['coffee']
        done()

      # frameworks
      machine.onLine 'jasmine'
      machine.onLine ''

      # requirejs
      machine.onLine 'no'

      # browsers
      machine.onLine 'Chrome'
      machine.onLine ''

      # files
      machine.onLine 'src/*.coffee'
      machine.onLine 'src/**/*.js'
      machine.onLine ''

      # excludes
      machine.onLine ''

      # autoWatch
      machine.onLine 'no'
