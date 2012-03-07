/**
 Tests for static/slimjim.js
 These tests are executed in browser.
 */

describe('slimjim', function() {
  var socket, sj, spyStart;

  beforeEach(function() {
    socket = new MockSocket();
    sj = new SlimJim(socket, {});
    spyStart = spyOn(sj, 'start');
  });


  it('should start execution when all files loaded and pass config', function() {
    var config = {};

    socket.emit('execute', config);
    expect(spyStart).not.toHaveBeenCalled();

    sj.loaded();
    expect(spyStart).toHaveBeenCalledWith(config);
  });


  it('should not start execution if any error during loading files', function() {
    sj.error('syntax error', '/some/file.js', 11);
    sj.loaded();

    expect(spyStart).not.toHaveBeenCalled();
  });


  it('should remove reference to start even after syntax error', function() {
    sj.error('syntax error', '/some/file.js', 11);
    sj.loaded();
    expect(sj.start).toBeFalsy();

    sj.start = function() {};
    sj.loaded();
    expect(sj.start).toBeFalsy();
  });


  describe('store', function() {

    it('should be getter/setter', function() {
      sj.store('a', 10);
      sj.store('b', [1, 2, 3]);

      expect(sj.store('a')).toBe(10);
      expect(sj.store('b')).toEqual([1, 2, 3]);
    });


    it('should clone arrays to avoid memory leaks', function() {
      var array = [1, 2, 3, 4, 5];

      sj.store('one.array', array);
      expect(sj.store('one.array')).not.toBe(array);
      expect(sj.store('one.array')).toEqual(array);
    });
  });
});
