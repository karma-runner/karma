/**
 Tests for static/slimjim.js
 These tests are executed in browser.
 */

describe('slimjim', function() {
  var socket, sj;

  beforeEach(function() {
    socket = new MockSocket();
    sj = new SlimJim(socket, {});
    spyOn(sj, 'start');
  });


  it('should start execution when all files loaded and pass config', function() {
    var config = {};

    socket.emit('execute', config);
    expect(sj.start).not.toHaveBeenCalled();

    sj.loaded();
    expect(sj.start).toHaveBeenCalledWith(config);
  });


  it('should not start execution if any error during loading files', function() {
    sj.error('syntax error', '/some/file.js', 11);
    sj.loaded();

    expect(sj.start).not.toHaveBeenCalled();
  });
});
