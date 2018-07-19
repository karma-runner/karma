var loadFile = require('mocks').loadFile
var path = require('path')

describe('logger', () => {
  var m
  var configuration

  beforeEach(() => {
    var mockLog4Js = {
      configure: function (config) {
        configuration = config
      }
    }
    m = loadFile(path.join(__dirname, '/../../lib/logger.js'), {'log4js': mockLog4Js})
  })

  describe('setup', () => {
    it('should allow for configuration via setup() using an array for back-compat', () => {
      m.setup('INFO', true, [{
        type: 'file',
        filename: 'test/unit/test.log'
      }])
      expect(configuration).to.have.keys(['appenders', 'categories'])
      expect(configuration.appenders).to.have.keys(['0'])
      expect(configuration.appenders['0'].type).to.equal('file')
      expect(configuration.categories).to.have.keys(['default'])
      expect(configuration.categories.default.appenders).to.have.keys(['0'])
      expect(configuration.categories.default.level).to.equal('INFO')
    })
    it('should allow setup() using log4js v2 object', () => {
      m.setup('WARN', true, {
        'fileAppender': {
          type: 'file',
          filename: 'test/unit/test.log'
        }
      })
      expect(configuration).to.have.keys(['appenders', 'categories'])
      expect(configuration.appenders).to.have.keys(['fileAppender'])
      expect(configuration.appenders['fileAppender'].type).to.equal('file')
      expect(configuration.categories).to.have.keys(['default'])
      expect(configuration.categories.default.appenders[0]).to.equal('fileAppender')
      expect(configuration.categories.default.level).to.equal('WARN')
    })
  })
})
