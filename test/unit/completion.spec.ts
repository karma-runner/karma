import {opositeWord, sendCompletion, complete} from '../../lib/completion'
import {expect} from 'chai'
import * as sinon from 'sinon'

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
    sinon.stub(console, 'log', (msg) => completion.push(msg))
    completion = []
  })

  describe('opositeWord', () => {
    it('should handle --no-x args', () => {
      expect(opositeWord('--no-single-run')).to.equal('--single-run')
    })

    it('should handle --x args', () => {
      expect(opositeWord('--browsers')).to.equal('--no-browsers')
    })

    it('should ignore args without --', () => {
      expect(opositeWord('start')).to.equal(null)
    })
  })

  describe('sendCompletion', () => {
    it('should filter only words matching last typed partial', () => {
      sendCompletion(['start', 'init', 'run'], mockEnv('in'))
      expect(completion).to.deep.equal(['init'])
    })

    it('should filter out already used words/args', () => {
      sendCompletion(['--single-run', '--port', '--xxx'], mockEnv('start --single-run '))
      expect(completion).to.deep.equal(['--port', '--xxx'])
    })

    it('should filter out already used oposite words', () => {
      sendCompletion(['--auto-watch', '--port'], mockEnv('start --no-auto-watch '))
      expect(completion).to.deep.equal(['--port'])
    })
  })

  describe('complete', () => {
    it('should complete the basic commands', () => {
      complete(mockEnv(''))
      expect(completion).to.deep.equal(['start', 'init', 'run'])

      completion.length = 0 // reset
      complete(mockEnv('s'))
      expect(completion).to.deep.equal(['start'])
    })
  })
})
