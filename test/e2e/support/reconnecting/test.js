describe('plus', function() {

  // super hacky way to get the actual socket to manipulate it...
  var socket = function() {
    var location = window.parent.location;
    return window.parent.io.sockets[location.protocol + '//' + location.host];
  };

  it('should pass', function() {
    expect(1).toBe(1);
  });

  it('should disconnect', function(done) {
    console.log(2);
    expect(2).toBe(2);
    socket().disconnect();

    done();
  });

  it('should work', function() {
    expect(plus(1, 2)).toBe(3);
  });

  it('should re-connect', function(done) {
    console.log(4);
    expect(4).toBe(4);
    socket().reconnect();
    // window.parent.socket.socket.connect();

    done();
  });

  it('should work', function() {
    expect(plus(3, 2)).toBe(5);
  });
});
