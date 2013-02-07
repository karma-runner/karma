describe 'validate-commit-msg', ->
  m = require '../../../tasks/lib/validate-commit-msg'
  errors = []
  sandbox = null

  VALID = true;
  INVALID = false;


  beforeEach ->
    errors.length = 0
    sandbox = sinon.sandbox.create()
    sandbox.stub console, 'error', (msg) ->
      errors.push(msg.replace /\x1B\[\d+m/g, '') # uncolor

  afterEach ->
    sandbox.restore()


  describe 'validateMessage', ->

    it 'should be valid', ->
      expect(m.validateMessage 'fix($compile): something').to.equal VALID
      expect(m.validateMessage 'feat($location): something').to.equal VALID
      expect(m.validateMessage 'docs($filter): something').to.equal VALID
      expect(m.validateMessage 'style($http): something').to.equal VALID
      expect(m.validateMessage 'refactor($httpBackend): something').to.equal VALID
      expect(m.validateMessage 'test($resource): something').to.equal VALID
      expect(m.validateMessage 'chore($controller): something').to.equal VALID
      expect(m.validateMessage 'chore(foo-bar): something').to.equal VALID
      expect(m.validateMessage 'chore(*): something').to.equal VALID
      expect(errors).to.deep.equal []


    it 'should validate 70 characters length', ->
      msg = 'fix($compile): something super mega extra giga tera long, maybe even longer... ' +
            'way over 80 characters'

      expect(m.validateMessage msg ).to.equal INVALID
      expect(errors).to.deep.equal ['INVALID COMMIT MSG: is longer than 70 characters !']


    it 'should validate "<type>(<scope>): <subject>" format', ->
      msg = 'not correct format'

      expect(m.validateMessage msg).to.equal INVALID
      expect(errors).to.deep.equal ['INVALID COMMIT MSG: does not match "<type>(<scope>): <subject>" !']


    it 'should validate type', ->
      expect(m.validateMessage 'weird($filter): something').to.equal INVALID
      expect(errors).to.deep.equal ['INVALID COMMIT MSG: "weird" is not allowed type !']


    it 'should allow empty scope', ->
      expect(m.validateMessage 'fix: blablabla').to.equal VALID


    it 'should allow dot in scope', ->
      expect(m.validateMessage 'chore(mocks.$httpBackend): something').to.equal VALID


    it 'should ignore msg prefixed with "WIP: "', ->
      expect(m.validateMessage 'WIP: bullshit').to.equal VALID

    it 'should ignore "Merging PR" messages', ->
      expect(m.validateMessage 'Merge pull request #333 from ahaurw01/feature').to.equal VALID
