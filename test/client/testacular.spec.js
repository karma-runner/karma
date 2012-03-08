/**
 Tests for static/testacular.js
 These tests are executed in browser.
 */

describe('testacular', function() {
  var socket, tc, spyStart;

  beforeEach(function() {
    socket = new MockSocket();
    tc = new Testacular(socket, {});
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
