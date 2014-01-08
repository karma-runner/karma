#==============================================================================
# lib/init/state_machine.js module
#==============================================================================
describe 'init/StateMachine', ->
  StateMachine = require '../../../lib/init/state_machine'
  machine = done = null

  mockRli =
    close: -> null
    write: -> null
    prompt: -> null
    _deleteLineLeft: -> null
    _deleteLineRight: -> null

  mockColors =
    question: -> ''


  beforeEach ->
    machine = new StateMachine mockRli, mockColors
    done = sinon.spy()

  it 'should go through all the questions', ->
    questions = [
      {id: 'framework', options: ['jasmine', 'mocha']}
      {id: 'other'}
    ]

    done = sinon.spy (answers) ->
      expect(answers.framework).to.equal 'jasmine'
      expect(answers.other).to.equal 'abc'

    machine.process questions, done
    machine.onLine 'jasmine'
    machine.onLine 'abc'
    expect(done).to.have.been.called


  it 'should allow multiple answers', ->
    questions = [
      {id: 'browsers', multiple: true}
    ]

    done = sinon.spy (answers) ->
      expect(answers.browsers).to.deep.equal ['Chrome', 'Safari']

    machine.process questions, done
    machine.onLine 'Chrome'
    machine.onLine 'Safari'
    machine.onLine ''
    expect(done).to.have.been.called


  it 'should treat spaces as confirmation of multiple answers', ->
    questions = [
      {id: 'browsers', multiple: true}
    ]

    done = sinon.spy (answers) ->
      expect(answers.browsers).to.deep.equal ['Chrome']

    machine.process questions, done
    machine.onLine 'Chrome'
    machine.onLine ' '
    expect(done).to.have.been.called


  it 'should always return array for multiple', ->
    questions = [
      {id: 'empty', multiple: true}
    ]

    done = sinon.spy (answers) ->
      expect(answers.empty).to.deep.equal []

    machine.process questions, done
    machine.onLine ''
    expect(done).to.have.been.called


  it 'should validate answers', ->
    validator = sinon.spy()
    questions = [
      {id: 'validated', validate: validator}
    ]

    machine.process questions, done
    machine.onLine 'something'

    expect(done).to.have.been.called
    expect(validator).to.have.been.calledWith 'something'


  it 'should allow conditional answers', ->
    ifTrue = sinon.spy (answers) ->
      answers.first is 'true'
    ifFalse = sinon.spy (answers) ->
      answers.first is 'false'

    done = sinon.spy (answers) ->
      expect(answers.first).to.equal 'true'
      expect(answers.onlyIfTrue).to.equal 'something'
      expect(answers.onlyIfFalse).to.not.exist

    questions = [
      {id: 'first'}
      {id: 'onlyIfTrue', condition: ifTrue}
      {id: 'onlyIfFalse', condition: ifFalse}
    ]

    machine.process questions, done
    machine.onLine 'true'
    machine.onLine 'something'

    expect(done).to.have.been.called


  it 'should parse booleans', ->
    done = sinon.spy (answers) ->
      expect(answers.yes).to.equal true
      expect(answers.no).to.equal false

    questions = [
      {id: 'yes', options: ['yes', 'no'], boolean: true}
      {id: 'no', options: ['yes', 'no'], boolean: true}
    ]

    machine.process questions, done
    machine.onLine 'yes'
    machine.onLine 'no'

    expect(done).to.have.been.called


  it 'should parse booleans before validation', ->
    validator = sinon.spy (value) ->
      expect(typeof value).to.equal 'boolean'

    questions = [
      {id: 'what', options: ['yes', 'no'], boolean: true, validate: validator}
      {id: 'really', options: ['yes', 'no'], boolean: true, validate: validator}
    ]

    machine.process questions, done
    machine.onLine 'yes'
    machine.onLine 'no'

    expect(validator).to.have.been.calledTwice
