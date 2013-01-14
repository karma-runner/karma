describe 'changelog', ->
  ch = require '../../../tasks/lib/changelog'

  describe 'parseRawCommit', ->

    it 'should parse raw commit', ->
      msg = ch.parseRawCommit(
          '9b1aff905b638aa274a5fc8f88662df446d374bd\n' +
          'feat(scope): broadcast $destroy event on scope destruction\n' +
          'perf testing shows that in chrome this change adds 5-15% overhead\n' +
          'when destroying 10k nested scopes where each scope has a $destroy listener\n')

      expect(msg.type).to.equal 'feat'
      expect(msg.component).to.equal 'scope'
      expect(msg.hash).to.equal '9b1aff905b638aa274a5fc8f88662df446d374bd'
      expect(msg.subject).to.equal 'broadcast $destroy event on scope destruction'
      expect(msg.body).to.equal(
          'perf testing shows that in chrome this change adds 5-15% overhead\n' +
          'when destroying 10k nested scopes where each scope has a $destroy listener\n')


    it 'should parse closed issues', ->
      msg = ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'feat(ng-list): Allow custom separator\n' +
          'bla bla bla\n\n' +
          'Closes #123\nCloses #25\n')

      expect(msg.closes).to.deep.equal [123, 25]


    it 'should parse breaking changes', ->
      msg = ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'feat(ng-list): Allow custom separator\n' +
          'bla bla bla\n\n' +
          'BREAKING CHANGE: some breaking change\n')

      expect(msg.breaks).to.deep.equal ['some breaking change\n']


    it 'should parse a msg without scope', ->
      msg = ch.parseRawCommit(
          '13f31602f396bc269076ab4d389cfd8ca94b20ba\n' +
          'chore: some chore bullshit\n' +
          'bla bla bla\n\n' +
          'BREAKING CHANGE: some breaking change\n')

      expect(msg.type).to.equal 'chore'
