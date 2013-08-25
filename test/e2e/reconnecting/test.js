describe('plus', function() {

  var breath = function() {
    var finished = false;
    setTimeout(function() {
      finished = true;
    }, 0)

    waitsFor(function() {
      return finished;
    });
  };

  // super hacky way to get the actual socket to manipulate it...
  var socket = function() {
    var location = window.parent.location;
    return window.parent.io.sockets[location.protocol + '//' + location.host];
  };


  it('should pass', function() {
    console.log(1);
    expect(1).toBe(1);
  });


  it('should disconnect', function() {
    console.log(2);
    expect(2).toBe(2);
    socket().disconnect();

    breath();
  });


  it('should work', function() {
    console.log(3);
    expect(plus(1, 2)).toBe(3);
  });


  it('should re-connect', function() {
    console.log(4);
    expect(4).toBe(4);
    socket().reconnect();
    // window.parent.socket.socket.connect();

    breath();
  });


  it('should work', function() {
    console.log(5);
    expect(plus(3, 2)).toBe(5);
  });
});
