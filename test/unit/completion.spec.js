var c = require('../../lib/completion')

describe('completion', () => {
  var completion

  function mockEnv (line) {
    var words = line.split(' ')

    return {
      words: words,
      count: words.length,
      last: words[words.length - 1],
      prev: words[words.length - 2]
    }
  }

  beforeEach(() => {
    sinon.stub(console, 'log').callsFake((msg) => completion.push(msg))
    completion = []
  })

  describe('opositeWord', () => {
    it('should handle --no-x args', () => {
      expect(c.opositeWord('--no-single-run')).to.equal('--single-run')
    })

    it('should handle --x args', () => {
      expect(c.opositeWord('--browsers')).to.equal('--no-browsers')
    })

    it('should ignore args without --', () => {
      expect(c.opositeWord('start')).to.equal(null)
    })
  })

  describe('sendCompletion', () => {
    it('should filter only words matching last typed partial', () => {
      c.sendCompletion(['start', 'init', 'run'], mockEnv('in'))
      expect(completion).to.deep.equal(['init'])
    })

    it('should filter out already used words/args', () => {
      c.sendCompletion(['--single-run', '--port', '--xxx'], mockEnv('start --single-run '))
      expect(completion).to.deep.equal(['--port', '--xxx'])
    })

    it('should filter out already used oposite words', () => {
      c.sendCompletion(['--auto-watch', '--port'], mockEnv('start --no-auto-watch '))
      expect(completion).to.deep.equal(['--port'])
    })
  })

  describe('complete', () => {
    it('should complete the basic commands', () => {
      c.complete(mockEnv(''))
      expect(completion).to.deep.equal(['start', 'init', 'run'])

      completion.length = 0 // reset
      c.complete(mockEnv('s'))
      expect(completion).to.deep.equal(['start'])
    })
  })
})
