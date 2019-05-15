const StateMachine = require('../../../lib/init/state_machine')

describe('init/StateMachine', () => {
  let done
  let machine

  const mockRli = {
    close: () => null,
    write: () => null,
    prompt: () => null,
    _deleteLineLeft: () => null,
    _deleteLineRight: () => null
  }

  const mockColors = {
    question: () => ''
  }

  beforeEach(() => {
    machine = new StateMachine(mockRli, mockColors)
    done = sinon.spy()
  })

  it('should go through all the questions', () => {
    const questions = [
      { id: 'framework', options: ['jasmine', 'mocha'] },
      { id: 'other' }
    ]

    done = sinon.spy((answers) => {
      expect(answers.framework).to.equal('jasmine')
      expect(answers.other).to.equal('abc')
    })

    machine.process(questions, done)
    machine.onLine('jasmine')
    machine.onLine('abc')
    expect(done).to.have.been.called
  })

  it('should allow multiple answers', () => {
    const questions = [
      { id: 'browsers', multiple: true }
    ]

    done = sinon.spy((answers) => {
      expect(answers.browsers).to.deep.equal(['Chrome', 'Safari'])
    })

    machine.process(questions, done)
    machine.onLine('Chrome')
    machine.onLine('Safari')
    machine.onLine('')
    expect(done).to.have.been.called
  })

  it('should treat spaces as confirmation of multiple answers', () => {
    const questions = [
      { id: 'browsers', multiple: true }
    ]

    done = sinon.spy((answers) => {
      expect(answers.browsers).to.deep.equal(['Chrome'])
    })

    machine.process(questions, done)
    machine.onLine('Chrome')
    machine.onLine(' ')
    expect(done).to.have.been.called
  })

  it('should always return array for multiple', () => {
    const questions = [
      { id: 'empty', multiple: true }
    ]

    done = sinon.spy((answers) => {
      expect(answers.empty).to.deep.equal([])
    })

    machine.process(questions, done)
    machine.onLine('')
    expect(done).to.have.been.called
  })

  it('should validate answers', () => {
    const validator = sinon.spy()
    const questions = [
      { id: 'validated', validate: validator }
    ]

    machine.process(questions, done)
    machine.onLine('something')

    expect(done).to.have.been.called
    expect(validator).to.have.been.calledWith('something')
  })

  it('should allow conditional answers', () => {
    const ifTrue = sinon.spy((answers) => {
      return answers.first === 'true'
    })
    const ifFalse = sinon.spy((answers) => {
      return answers.first === 'false'
    })

    done = sinon.spy((answers) => {
      expect(answers.first).to.equal('true')
      expect(answers.onlyIfTrue).to.equal('something')
      expect(answers.onlyIfFalse).to.not.exist
    })

    const questions = [
      { id: 'first' },
      { id: 'onlyIfTrue', condition: ifTrue },
      { id: 'onlyIfFalse', condition: ifFalse }
    ]

    machine.process(questions, done)
    machine.onLine('true')
    machine.onLine('something')

    expect(done).to.have.been.called
  })

  it('should parse booleans', () => {
    done = sinon.spy((answers) => {
      expect(answers.yes).to.equal(true)
      expect(answers.no).to.equal(false)
    })

    const questions = [
      { id: 'yes', options: ['yes', 'no'], boolean: true },
      { id: 'no', options: ['yes', 'no'], boolean: true }
    ]

    machine.process(questions, done)
    machine.onLine('yes')
    machine.onLine('no')

    expect(done).to.have.been.called
  })

  it('should parse booleans before validation', () => {
    const validator = sinon.spy((value) => {
      expect(typeof value).to.equal('boolean')
    })

    const questions = [
      { id: 'what', options: ['yes', 'no'], boolean: true, validate: validator },
      { id: 'really', options: ['yes', 'no'], boolean: true, validate: validator }
    ]

    machine.process(questions, done)
    machine.onLine('yes')
    machine.onLine('no')

    expect(validator).to.have.been.calledTwice
  })
})
