import {loadFile} from 'mocks'

describe('logger', () => {
  var m

  beforeEach(() => {
    m = loadFile(__dirname + '/../../lib/logger.js')
  })

  describe('setup', () => {
    it('should allow for configuration via setup() using an array', () => {
      m.setup('INFO', true, [{
        type: 'file',
        filename: 'test/unit/test.log'
      }])

      expect(m.log4js.appenders).to.have.keys(['console', 'file'])
    })
  })
})
