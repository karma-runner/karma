#==============================================================================
# lib/helper.js module
#==============================================================================
describe 'helper', ->
  helper = require '../../lib/helper'

  #==============================================================================
  # helper.browserFullNameToShort()
  #==============================================================================
  describe 'browserFullNameToShort', ->

    # helper function
    expecting = (name) ->
      expect helper.browserFullNameToShort name

    it 'should parse iOS', ->
      expecting('Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 ' +
                '(KHTML, like Gecko) Version/6.0 Mobile/10A403 Safari/8536.25').
           to.be.equal 'Safari 6.0 (iOS)'


    it 'should parse Linux', ->
      expecting('Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.19) Gecko/20081216 ' +
                'Ubuntu/8.04 (hardy) Firefox/2.0.0.19').
           to.be.equal 'Firefox 2.0 (Linux)'


    it 'should degrade gracefully when OS not recognized', ->
      expecting('Mozilla/5.0 (X11; U; FreeBSD; i386; en-US; rv:1.7) Gecko/20081216 Firefox/2.0.0.19').
           to.be.equal 'Firefox 2.0'


    it 'should parse Chrome', ->
      expecting('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.7 ' +
                '(KHTML, like Gecko) Chrome/16.0.912.63 Safari/535.7').
           to.be.equal 'Chrome 16.0 (Mac)'

      expecting('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.15 ' +
                '(KHTML, like Gecko) Chrome/18.0.985.0 Safari/535.15').
           to.be.equal 'Chrome 18.0 (Mac)'


    it 'should parse Firefox', ->
      expecting('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 ' +
                'Firefox/7.0.1').
           to.be.equal 'Firefox 7.0 (Mac)'


    it 'should parse Opera', ->
      expecting('Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; en) Presto/2.9.168 ' +
                'Version/11.52').
           to.be.equal 'Opera 11.52 (Mac)'


    it 'should parse Safari', ->
      expecting('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.52.7 ' +
                '(KHTML, like Gecko) Version/5.1.2 Safari/534.52.7').
           to.be.equal 'Safari 5.1 (Mac)'


    it 'should parse IE7', ->
      expecting('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; WOW64; SLCC1; ' +
                '.NET CLR 2.0.50727; .NET4.0C; .NET4.0E)').
           to.be.equal 'IE 7.0 (Windows)'


    it 'should parse IE8', ->
      expecting('Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; ' +
                'SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; ' +
                '.NET4.0E; InfoPath.3)"').
           to.be.equal 'IE 8.0 (Windows)'


    it 'should parse IE9', ->
      expecting('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; ' +
                '.NET CLR 2.0.50727; SLCC2; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center ' +
                'PC 6.0)').
           to.be.equal 'IE 9.0 (Windows)'


    it 'should parse IE10', ->
      expecting('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; ' +
                '.NET4.0E; .NET4.0C)').
           to.be.equal 'IE 10.0 (Windows)'


    it 'should parse PhantomJS', ->
      expecting('Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) ' +
                'PhantomJS/1.6.0 Safari/534.34').
           to.be.equal 'PhantomJS 1.6 (Mac)'


  #==============================================================================
  # helper.isDefined()
  #==============================================================================
  describe 'isDefined', ->
    isDefined = helper.isDefined

    it 'should return true if defined', ->
      expect(isDefined()).to.equal  false
      expect(isDefined undefined).to.equal  false

      expect(isDefined false).to.equal  true
      expect(isDefined 0).to.equal  true
      expect(isDefined null).to.equal  true
      expect(isDefined '').to.equal  true


  #==============================================================================
  # helper.camelToSnake()
  #==============================================================================
  describe 'camelToSnake', ->
    camelToSnake = helper.camelToSnake

    it 'should convert camelCase string to snake_case', ->
      expect(camelToSnake 'OneMoreThing' ).to.equal 'one_more_thing'


  #==============================================================================
  # helper.dashToCamel()
  #==============================================================================
  describe 'dashToCamel', ->
    dashToCamel = helper.dashToCamel

    it 'should convert dash-case to camelCase', ->
      expect(dashToCamel 'one-more-thing' ).to.equal 'oneMoreThing'
      expect(dashToCamel 'one' ).to.equal 'one'


  #==============================================================================
  # helper.arrayRemove()
  #==============================================================================
  describe 'arrayRemove', ->
    arrayRemove = helper.arrayRemove

    it 'should remove object from array', ->
      a = 'one'; b = []; c = {}; d = -> null
      collection = [a, b, c, d]

      expect(arrayRemove collection, b).to.equal  true
      expect(collection).to.deep.equal [a, c, d]

      expect(arrayRemove collection, {}).to.equal  false
      expect(collection).to.deep.equal [a, c, d]

      expect(arrayRemove collection, d).to.equal  true
      expect(collection).to.deep.equal [a, c]

      expect(arrayRemove collection, a).to.equal  true
      expect(collection).to.deep.equal [c]


  #==============================================================================
  # helper.merge()
  #==============================================================================
  describe 'merge', ->

    it 'should copy properties to first argument', ->
      destination = {a: 1, b: 2}
      result = helper.merge destination, {a: 4, c: 5}

      expect(destination.a).to.equal 1
      expect(result).to.deep.equal {a: 4, b: 2, c: 5}


  #==============================================================================
  # helper.isUrlAbsolute()
  #==============================================================================
  describe 'isUrlAbsolute', ->

    it 'should check http/https protocol', ->
      expect(helper.isUrlAbsolute 'some/path/http.html').to.equal  false
      expect(helper.isUrlAbsolute '/some/more.py').to.equal  false
      expect(helper.isUrlAbsolute 'http://some.com/path').to.equal  true
      expect(helper.isUrlAbsolute 'https://more.org/some.js').to.equal  true


  #==============================================================================
  # helper.formatTimeInterval()
  #==============================================================================
  describe 'formatTimeInterval', ->

    it 'should format into seconds', ->
      expect(helper.formatTimeInterval 23000).to.equal '23 secs'


    it 'should format into minutes', ->
      expect(helper.formatTimeInterval 142000).to.equal '2 mins 22 secs'


    it 'should handle singular minute or second', ->
      expect(helper.formatTimeInterval 61000).to.equal '1 min 1 sec'


    it 'should round to miliseconds', ->
      expect(helper.formatTimeInterval 163017).to.equal '2 mins 43.017 secs'


  #==============================================================================
  # helper.mkdirIfNotExists()
  #==============================================================================
  describe 'mkdirIfNotExists', ->

    fsMock = require('mocks').fs
    loadFile = require('mocks').loadFile

    done = null

    # async helper
    waitForDoneAnd = (resume) ->
      waitsFor (-> done.callCount), 'done callback', 50
      runs resume if resume

    fs = fsMock.create
      home:
        'some.js': fsMock.file()

    # load file under test
    m = loadFile __dirname + '/../../lib/helper.js', {fs: fs, lodash: require 'lodash'}
    mkdirIfNotExists = m.exports.mkdirIfNotExists


    it 'should not do anything, if dir already exists', (done) ->
      mkdirIfNotExists '/home', done



    it 'should create directory if it does not exist', (done) ->
      mkdirIfNotExists '/home/new', ->
        stat = fs.statSync '/home/new'
        expect(stat).to.exist
        expect(stat.isDirectory()).to.equal  true
        done()


    it 'should create even parent directories if it does not exist', (done) ->
      mkdirIfNotExists '/home/new/parent/child', ->
        stat = fs.statSync '/home/new/parent/child'
        expect(stat).to.exist
        expect(stat.isDirectory()).to.equal  true
        done()
