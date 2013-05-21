/**
 Tests for static/karma.js
 These tests are executed in browser.
 */

describe('karma', function() {
  var socket, tc, spyStart, windowNavigator, windowLocation;

  beforeEach(function() {
    socket = new MockSocket();
    windowNavigator = {};
    windowLocation = {};
    tc = new Karma(socket, {}, windowNavigator, windowLocation);
    spyStart = spyOn(tc, 'start');
  });


  it('should start execution when all files loaded and pass config', function() {
    var config = {};

    socket.emit('execute', config);
    expect(spyStart).not.toHaveBeenCalled();

    tc.loaded();
    expect(spyStart).toHaveBeenCalledWith(config);
  });


  it('should not start execution if any error during loading files', function() {
    tc.error('syntax error', '/some/file.js', 11);
    tc.loaded();

    expect(spyStart).not.toHaveBeenCalled();
  });


  it('should remove reference to start even after syntax error', function() {
    tc.error('syntax error', '/some/file.js', 11);
    tc.loaded();
    expect(tc.start).toBeFalsy();

    tc.start = function() {};
    tc.loaded();
    expect(tc.start).toBeFalsy();
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
      tc.store('a', 10);
      tc.store('b', [1, 2, 3]);

      expect(tc.store('a')).toBe(10);
      expect(tc.store('b')).toEqual([1, 2, 3]);
    });


    it('should clone arrays to avoid memory leaks', function() {
      var array = [1, 2, 3, 4, 5];

      tc.store('one.array', array);
      expect(tc.store('one.array')).toEqual(array);
      expect(tc.store('one.array')).not.toBe(array);
    });
  });


  describe('stringify', function() {
    it('should serialize string', function() {
      expect(tc.stringify('aaa')).toBe("'aaa'");
    });


    it('should serialize booleans', function() {
      expect(tc.stringify(true)).toBe('true');
      expect(tc.stringify(false)).toBe('false');
    });


    it('should serialize null and undefined', function() {
      expect(tc.stringify(null)).toBe('null');
      expect(tc.stringify()).toBe('undefined');
    });


    it('should serialize functions', function() {
      function abc(a, b, c) { return 'whatever'; }
      var def = function(d, e, f) { return 'whatever'; };

      expect(tc.stringify(abc)).toBe('function abc(a, b, c) { ... }');
      expect(tc.stringify(def)).toBe('function (d, e, f) { ... }');
    });


    it('should serialize arrays', function() {
      expect(tc.stringify(['a', 'b', null, true, false])).toBe("['a', 'b', null, true, false]");
    });


    it('should serialize html', function() {
      var div = document.createElement('div');

      expect(tc.stringify(div)).toBe('<div></div>');

      div.innerHTML = 'some <span>text</span>';
      expect(tc.stringify(div)).toBe('<div>some <span>text</span></div>');
    });


    it('should serialize across iframes', function() {
      var div = document.createElement('div');
      expect(__karma__.stringify(div)).toBe('<div></div>');

      expect(__karma__.stringify([1, 2])).toBe('[1, 2]');
    });
  });
});
