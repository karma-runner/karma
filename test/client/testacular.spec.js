/**
 Tests for static/testacular.js
 These tests are executed in browser.
 */

describe('testacular', function() {
  var socket, tc, spyStart, windowNavigator, windowLocation;

  beforeEach(function() {
    socket = new MockSocket();
    windowNavigator = {};
    windowLocation = {};
    tc = new Testacular(socket, {}, windowNavigator, windowLocation);
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
});
