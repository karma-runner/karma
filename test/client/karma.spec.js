/**
 Tests for static/karma.js
 These tests are executed in browser.
 */

describe('karma', function() {
  var socket, k, spyStart, windowNavigator, windowLocation;

  beforeEach(function() {
    socket = new MockSocket();
    windowNavigator = {};
    windowLocation = {};
    k = new Karma(socket, {}, windowNavigator, windowLocation);
    spyStart = spyOn(k, 'start');
  });


  it('should start execution when all files loaded and pass config', function() {
    var config = {};

    socket.emit('execute', config);
    expect(spyStart).not.toHaveBeenCalled();

    k.loaded();
    expect(spyStart).toHaveBeenCalledWith(config);
  });


  it('should not start execution if any error during loading files', function() {
    k.error('syntax error', '/some/file.js', 11);
    k.loaded();

    expect(spyStart).not.toHaveBeenCalled();
  });


  it('should remove reference to start even after syntax error', function() {
    k.error('syntax error', '/some/file.js', 11);
    k.loaded();
    expect(k.start).toBeFalsy();

    k.start = function() {};
    k.loaded();
    expect(k.start).toBeFalsy();
  });


  it('should not set up context if there was an error', function() {
    var mockWindow = {};

    k.error('page reload');
    k.setupContext(mockWindow);

    expect(mockWindow.__karma__).toBeUndefined();
    expect(mockWindow.onbeforeunload).toBeUndefined();
    expect(mockWindow.onerror).toBeUndefined();
  });


  it('should report navigator name', function() {
    var spyInfo = jasmine.createSpy('onInfo').andCallFake(function(info) {
      expect(info.name).toBe('Fake browser name');
    });

    windowNavigator.userAgent = 'Fake browser name';
    windowLocation.search = '';
    socket.on('register', spyInfo);
    socket.emit('connect');

    expect(spyInfo).toHaveBeenCalled();
  });


  it('should report browser id', function() {
    var spyInfo = jasmine.createSpy('onInfo').andCallFake(function(info) {
      expect(info.id).toBe(567);
    });

    windowLocation.search = '?id=567';
    socket.on('register', spyInfo);
    socket.emit('connect');

    expect(spyInfo).toHaveBeenCalled();
  });


  describe('store', function() {

    it('should be getter/setter', function() {
      k.store('a', 10);
      k.store('b', [1, 2, 3]);

      expect(k.store('a')).toBe(10);
      expect(k.store('b')).toEqual([1, 2, 3]);
    });


    it('should clone arrays to avoid memory leaks', function() {
      var array = [1, 2, 3, 4, 5];

      k.store('one.array', array);
      expect(k.store('one.array')).toEqual(array);
      expect(k.store('one.array')).not.toBe(array);
    });
  });


  describe('stringify', function() {
    it('should serialize string', function() {
      expect(k.stringify('aaa')).toBe("'aaa'");
    });


    it('should serialize booleans', function() {
      expect(k.stringify(true)).toBe('true');
      expect(k.stringify(false)).toBe('false');
    });


    it('should serialize null and undefined', function() {
      expect(k.stringify(null)).toBe('null');
      expect(k.stringify()).toBe('undefined');
    });


    it('should serialize functions', function() {
      function abc(a, b, c) { return 'whatever'; }
      var def = function(d, e, f) { return 'whatever'; };

      expect(k.stringify(abc)).toBe('function abc(a, b, c) { ... }');
      expect(k.stringify(def)).toBe('function (d, e, f) { ... }');
    });


    it('should serialize arrays', function() {
      expect(k.stringify(['a', 'b', null, true, false])).toBe("['a', 'b', null, true, false]");
    });


    it('should serialize html', function() {
      var div = document.createElement('div');

      expect(k.stringify(div)).toBe('<div></div>');

      div.innerHTML = 'some <span>text</span>';
      expect(k.stringify(div)).toBe('<div>some <span>text</span></div>');
    });


    it('should serialize across iframes', function() {
      var div = document.createElement('div');
      expect(__karma__.stringify(div)).toBe('<div></div>');

      expect(__karma__.stringify([1, 2])).toBe('[1, 2]');
    });
  });
});
